function Profile() {
    // Remove any existing login or profile containers
  const existingLogin = document.querySelector(".loginout-container");
  if (existingLogin) existingLogin.remove();
  const existingProfile = document.querySelector(".profile-container");
  if (existingProfile) existingProfile.remove();
  const existingReview = document.querySelector(".review-page");
  if (existingReview) existingReview.remove();

  // Create profile container
  const container = document.createElement("div");
  container.className = "profile-container";
  container.style.padding = "1rem";
  container.style.maxWidth = "600px";
  container.style.margin = "1rem auto";
  container.style.border = "1px solid #ccc";
  container.style.borderRadius = "8px";
  container.style.backgroundColor = "#f9f9f9";

  // Heading
  const heading = document.createElement("h4");
  heading.textContent = "User Profile";
  container.appendChild(heading);

  // Check if user is logged in
  const loggedInUser = localStorage.getItem("loggedInUser");

  if (!loggedInUser) {
    // User not logged in
    const msg = document.createElement("p");
    msg.textContent = "You are not logged in.";
    container.appendChild(msg);

    const loginButton = document.createElement("button");
    loginButton.textContent = "Log In";
    loginButton.className = "loginout-button";
    loginButton.addEventListener("click", () => LogInOut());
    container.appendChild(loginButton);
  } else {
    // User is logged in
    const user = JSON.parse(loggedInUser);

    const emailP = document.createElement("p");
    emailP.innerHTML = `<strong>Email:</strong> ${user.email}`;
    container.appendChild(emailP);

    const nameP = document.createElement("p");
    nameP.innerHTML = `<strong>Name:</strong> ${user.name || "N/A"}`;
    container.appendChild(nameP);

    const createdAtP = document.createElement("p");
    createdAtP.innerHTML = `<strong>Account Created:</strong> ${
      user.createdAt || "N/A"
    }`;
    container.appendChild(createdAtP);

    const logoutButton = document.createElement("button");
    logoutButton.textContent = "Log Out";
    logoutButton.className = "loginout-button";
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      container.remove();
      Profile(); // re-render profile after logout
    });
    container.appendChild(logoutButton);
  }

  // Append container to body or main content
  document.body.appendChild(container);
}
