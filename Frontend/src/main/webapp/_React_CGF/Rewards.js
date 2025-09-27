function Rewards() {
      // Remove any existing login or profile containers
  const existingLogin = document.querySelector(".loginout-container");
  if (existingLogin) existingLogin.remove();
  const existingProfile = document.querySelector(".profile-container");
  if (existingProfile) existingProfile.remove();
  const existingReview = document.querySelector(".review-page");
  if (existingReview) existingReview.remove();
    return (
        <div className="rewards">
            <h4>Rewards</h4>
            <p>
                Rewards Page
            </p>
        </div>
    );
}