// _React_CGF/LogInOut.js

function LogInOut() {
  const main = document.getElementById("main-content");
  if (!main) {
    console.error("No element with id 'main-content' found.");
    return null;
  }

  // Clean up any other screens
  const kill = (sel) => { const el = document.querySelector(sel); if (el) el.remove(); };
  kill(".loginout-container");
  kill(".profile-container");
  kill(".review-page");
  kill(".home");

  // Container
  const container = document.createElement("div");
  container.className = "loginout-container";
  Object.assign(container.style, {
    position: "relative", padding: "1rem", maxWidth: "420px",
    margin: "2rem auto", border: "1px solid #ccc",
    borderRadius: "8px", backgroundColor: "#f9f9f9"
  });
  main.appendChild(container);

  // Title + error area
  const title = document.createElement("h2");
  const errorMsg = document.createElement("p");
  errorMsg.className = "loginout-error";
  errorMsg.style.minHeight = "1.25rem";
  errorMsg.style.margin = "0.25rem 0 0.5rem";
  errorMsg.style.color = "crimson";
  container.appendChild(title);
  container.appendChild(errorMsg);

  // Close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "×";
  closeButton.className = "loginout-close";
  Object.assign(closeButton.style, {
    position: "absolute", top: "10px", right: "10px",
    fontSize: "1.5rem", background: "transparent",
    border: "none", cursor: "pointer"
  });
  container.appendChild(closeButton);
  closeButton.addEventListener("click", () => container.remove());

  // Helpers
  const setError = (msg, color = "crimson") => { errorMsg.style.color = color; errorMsg.textContent = msg || ""; };
  const busy = (btns, on) => btns.forEach(b => { b.disabled = !!on; b.style.opacity = on ? "0.6" : "1"; });

  // Show welcome after we have real user data
  async function showWelcomeFromAPI() {
    const me = await window.api.getMe();
    if (!me.ok) {
      // token invalid or /me not implemented
      renderLoginForm();
      return;
    }
    const { email, username, points } = me.data || {};
    return showWelcome(username || email, points);
  }

  function showWelcome(identity, points) {
    container.innerHTML = ""; // clear
    const heading = document.createElement("h2");
    heading.textContent = "Welcome!";
    const p = document.createElement("p");
    p.textContent = `Signed in as ${identity || "user"}.`;
    const pts = document.createElement("p");
    pts.textContent = typeof points === "number" ? `Loyalty points: ${points}` : "";
    const logoutButton = document.createElement("button");
    logoutButton.textContent = "Log Out";
    logoutButton.className = "loginout-button";
    logoutButton.style.marginTop = "1rem";

    container.appendChild(heading);
    container.appendChild(p);
    if (pts.textContent) container.appendChild(pts);
    container.appendChild(logoutButton);

    logoutButton.addEventListener("click", async () => {
      busy([logoutButton], true);
      await window.api.logout();      // clears refresh cookie server-side
      busy([logoutButton], false);
      container.remove();             // close the panel
    });
  }

  // Build the login/sign-up form
  function renderLoginForm() {
    container.innerHTML = "";
    container.appendChild(title);
    container.appendChild(errorMsg);
    title.textContent = "Log In";

    const form = document.createElement("form");
    form.className = "loginout-form";

    // Username (for Sign Up)
    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.placeholder = "Username (for Sign Up)";
    usernameInput.className = "loginout-input";
    Object.assign(usernameInput.style, { display: "block", marginBottom: "0.5rem" });

    // Email
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "Email";
    emailInput.required = true;
    emailInput.className = "loginout-input";
    Object.assign(emailInput.style, { display: "block", marginBottom: "0.5rem" });

    // Password
    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "Password";
    passwordInput.required = true;
    passwordInput.className = "loginout-input";
    Object.assign(passwordInput.style, { display: "block", marginBottom: "0.5rem" });

    // Buttons
    const loginButton = document.createElement("button");
    loginButton.type = "submit";
    loginButton.textContent = "Log In";
    loginButton.className = "loginout-button";
    loginButton.style.marginRight = "0.5rem";

    const signUpButton = document.createElement("button");
    signUpButton.type = "button";
    signUpButton.textContent = "Sign Up";
    signUpButton.className = "loginout-button";

    form.appendChild(usernameInput);
    form.appendChild(emailInput);
    form.appendChild(passwordInput);
    form.appendChild(loginButton);
    form.appendChild(signUpButton);
    container.appendChild(form);

    // Login handler (calls backend)
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setError("");
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      if (!email || !password) { setError("Email and password are required."); return; }

      busy([loginButton, signUpButton], true);
      const result = await window.api.login({ email, password });
      busy([loginButton, signUpButton], false);

      if (result.ok) {
        // Success → fetch profile then show welcome
        await showWelcomeFromAPI();
      } else if (result.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError(result.error || "Login failed.");
      }
    });

    // Sign Up handler (calls backend)
    signUpButton.addEventListener("click", async () => {
      setError("");
      const username = usernameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !email || !password) {
        setError("Username, email, and password are required.");
        return;
      }

      busy([loginButton, signUpButton], true);
      const result = await window.api.registerUser({ username, email, password });
      busy([loginButton, signUpButton], false);

      if (result.ok) {
        setError("Account created — you can now log in.", "green");
      } else if (result.status === 409) {
        setError("That username or email is already taken.");
      } else {
        setError(result.error || "Sign up failed.");
      }
    });
  }

  // Try silent session restore (refresh using HttpOnly cookie)
  // Do NOT make the component async (React Router expects a sync function),
  // just chain the promise.
  window.api.refreshAccessToken()
    .then(ok => ok ? showWelcomeFromAPI() : renderLoginForm())
    .catch(() => renderLoginForm());

  return null;
}
