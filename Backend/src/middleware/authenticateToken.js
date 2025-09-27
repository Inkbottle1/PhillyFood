import jwt from 'jsonwebtoken';

/**
 * Middleware to protect routes by verifying the JSON Web Token (JWT)
 * sent in the Authorization header.
 */
export default function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // expects "Bearer <token>"
  if (!token) return res.sendStatus(401);               // no token provided

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);               // invalid or expired token
    req.user = user;                                   // attach decoded payload to the request
    next();                                            // continue to the actual route handler
  });
}
