require('dotenv').config()
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const cookieParser = require('cookie-parser')
const { Pool } = require('pg')

const app = express()
app.use(express.json())
app.use(cookieParser())

// PostgreSQL pool (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// ===== Request logger =====
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} --> ${req.method} ${req.url}`)
  if (Object.keys(req.body || {}).length) console.log('Body:', req.body)
  next()
})

// ===== JWT middleware =====
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

// ===== POST /users (register) =====
app.post('/users', async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password)
      return res.status(400).json({ error: 'username, email, and password are required' })

    const duplicate = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    )
    if (duplicate.rows.length > 0)
      return res.status(409).json({ error: 'User with that username or email already exists' })

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, passwordHash]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal error' })
  }
})

// ===== POST /login =====
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })

    const accessToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    )

    const refreshToken = crypto.randomBytes(64).toString('hex')
    const expiresAt = new Date(Date.now() + 7*24*60*60*1000) // 7 days

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7*24*60*60*1000
    })

    res.json({ accessToken })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal error' })
  }
})

// ===== POST /refresh =====
app.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) return res.sendStatus(401)

    const result = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [refreshToken])
    const tokenEntry = result.rows[0]
    if (!tokenEntry || new Date(tokenEntry.expires_at) < new Date()) return res.sendStatus(403)

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [tokenEntry.user_id])
    const user = userResult.rows[0]

    const accessToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    )

    res.json({ accessToken })
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

// ===== POST /logout =====
app.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (refreshToken) {
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])
    }
    res.clearCookie('refreshToken')
    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

// ===== GET /users (protected) =====
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT username, email FROM users ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal error' })
  }
})

// ===== Optional test route =====
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({ success: true, time: result.rows[0].now })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: 'DB connection failed' })
  }
})

// ===== Start server =====
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})