function login(e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(user => user.email === email);

  // if (!user || user.password !== password) {
  //   alert("Invalid User or Password");
  //   return;
  // }

  console.log("Login successful!");
  localStorage.setItem("user", email);
  localStorage.setItem("loggedInEmail", email);
  window.location.href = "dashboard.html";
}

function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.querySelector(".toggle-password");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.textContent = "🙈";
  } else {
    passwordInput.type = "password";
    toggleIcon.textContent = "👁️";
  }
}


