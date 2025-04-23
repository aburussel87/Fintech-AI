// Login function
async function login(e) {
  e.preventDefault();  // Prevent form from submitting normally

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Basic validation
  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log(data);

    // Handle failed login attempt
    if (!data.success) {
      alert("Invalid email or password.");
      return;
    }

    // If login is successful, store JWT token in localStorage
    if (data.success) {
      localStorage.setItem("access_token", data.access_token);
    }

    // Redirect to dashboard
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Error:", error);
    alert(data.message || "An error occurred. Please try again later.");
  }
}

// Toggle password visibility
function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.querySelector(".toggle-password");

  // Toggle between password visibility
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.textContent = "🙈";  // Change icon to "hide"
  } else {
    passwordInput.type = "password";
    toggleIcon.textContent = "👁️";  // Change icon to "show"
  }
}

// Attach login function to form submission
document.getElementById("login-form").addEventListener("submit", login);
