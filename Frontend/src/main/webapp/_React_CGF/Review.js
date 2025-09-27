function Review() {
  // Remove any existing login or profile containers
  const existingLogin = document.querySelector(".loginout-container");
  if (existingLogin) existingLogin.remove();
  const existingProfile = document.querySelector(".profile-container");
  if (existingProfile) existingProfile.remove();
  const existingReview = document.querySelector(".review-page");
  if (existingReview) existingReview.remove();
  const existingMap = document.querySelector(".map-placeholder");
    if (existingMap) existingMap.remove();

  // Sample review data
  let reviews = [
    {
      id: 1,
      title: "Sunny Cafe",
      rating: 4.5,
      comment: "Great ambiance, friendly staff, and amazing coffee!",
    },
    {
      id: 2,
      title: "City Bookstore",
      rating: 4.8,
      comment: "Huge selection of books and cozy reading corners.",
    },
    {
      id: 3,
      title: "Green Park",
      rating: 4.2,
      comment: "Beautiful trails, perfect for a weekend walk.",
    },
  ];

  // Sample recommended data
  const recommended = [
    {
      id: 1,
      title: "Hidden Gem Bakery",
      reason: "Top rated pastries nearby",
    },
    {
      id: 2,
      title: "Artisan Coffee House",
      reason: "Matches your previous coffee interests",
    },
  ];

  // Main container
  const main = document.getElementById("main-content") || document.body;
  const container = document.createElement("div");
  container.className = "review-page";
  container.style.padding = "1rem";
  container.style.maxWidth = "800px";
  container.style.margin = "1rem auto";
  container.style.fontFamily = "Segoe UI, sans-serif";
  main.appendChild(container);

  // Heading
  const heading = document.createElement("h2");
  heading.textContent = "Review Page";
  container.appendChild(heading);

  const intro = document.createElement("p");
  intro.textContent = "Top-reviewed spots or AI-recommended places will appear here.";
  container.appendChild(intro);

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

  // ==============================
  // Recommended Section
  // ==============================
  const recommendedSection = document.createElement("section");
  recommendedSection.className = "recommended";
  container.appendChild(recommendedSection);

  const recHeading = document.createElement("h3");
  recHeading.textContent = "Recommended For You Powered By Gemini";
  recommendedSection.appendChild(recHeading);

  const recList = document.createElement("ul");
  recommended.forEach((rec) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${rec.title}</strong> — ${rec.reason}`;
    recList.appendChild(li);
  });
  recommendedSection.appendChild(recList);
  // ==============================
  // All Reviews Section
  // ==============================
  const allReviewsSection = document.createElement("section");
  allReviewsSection.className = "all-reviews";
  container.appendChild(allReviewsSection);

  const reviewsHeading = document.createElement("h3");
  reviewsHeading.textContent = "Your Recent Reviews";
  allReviewsSection.appendChild(reviewsHeading);

  // ==============================
  // Add Review Form
  // ==============================
  const addReviewSection = document.createElement("section");
  addReviewSection.className = "add-review";
  container.appendChild(addReviewSection);

  const addHeading = document.createElement("h3");
  addHeading.textContent = "Add a Review";
  addReviewSection.appendChild(addHeading);

  const form = document.createElement("form");
  addReviewSection.appendChild(form);

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.placeholder = "Title";
  titleInput.required = true;
  titleInput.style.display = "block";
  titleInput.style.marginBottom = "0.5rem";
  form.appendChild(titleInput);

  const ratingInput = document.createElement("input");
  ratingInput.type = "number";
  ratingInput.placeholder = "Rating (0-5)";
  ratingInput.min = 0;
  ratingInput.max = 5;
  ratingInput.step = 0.1;
  ratingInput.required = true;
  ratingInput.style.display = "block";
  ratingInput.style.marginBottom = "0.5rem";
  form.appendChild(ratingInput);

  const commentInput = document.createElement("textarea");
  commentInput.placeholder = "Comment";
  commentInput.required = true;
  commentInput.style.display = "block";
  commentInput.style.marginBottom = "0.5rem";
  form.appendChild(commentInput);

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Add Review";
  form.appendChild(submitBtn);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const newReview = {
      id: reviews.length + 1,
      title: titleInput.value,
      rating: parseFloat(ratingInput.value),
      comment: commentInput.value,
    };

    reviews.unshift(newReview); // add new review at the top

    // Clear inputs
    titleInput.value = "";
    ratingInput.value = "";
    commentInput.value = "";

    // Re-render reviews
    renderReviews();
  });
  

// Function to render all reviews

  function renderReviews() {
    // Remove previous review cards
    const oldCards = allReviewsSection.querySelectorAll(".review-card");
    oldCards.forEach((card) => card.remove());

    // Render all reviews
    reviews.forEach((rev) => {
      const card = document.createElement("div");
      card.className = "review-card";
      card.style.backgroundColor = "#fff";
      card.style.padding = "1rem";
      card.style.marginBottom = "1rem";
      card.style.borderRadius = "0.5rem";
      card.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";

      const title = document.createElement("h4");
      title.textContent = rev.title;
      card.appendChild(title);

      const rating = document.createElement("p");
      rating.textContent = `Rating: ${rev.rating} ⭐`;
      card.appendChild(rating);

      const comment = document.createElement("p");
      comment.textContent = rev.comment;
      card.appendChild(comment);

      allReviewsSection.appendChild(card);
    });
  }

  // Initial render
  renderReviews();
}}
