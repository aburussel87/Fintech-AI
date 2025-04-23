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

let verificationCode = "";
let verified = false;
let formatted_time = "";

function sendVerificationCode() {
  const email = document.getElementById("email").value;
  let users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.some(user => user.email === email)) {
    alert("This email is already registered.");
    return;
  }
  if (!email || !validateEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const now = new Date();
  formatted_time = now.toLocaleString();

  localStorage.setItem("verificationCode", verificationCode);

  const templateParams = {
    to_email: email,
    message: `Your verification code is: ${verificationCode}`,
    time: formatted_time
  };

  emailjs.send("service_w48xx69", "template_k9y37ol", templateParams)
    .then(function (response) {
      alert("Verification code sent!");
      console.log("SUCCESS!", response.status, response.text);
    }, function (error) {
      console.log("FAILED...", error);
      alert("Failed to send verification code.");
    });
}

function validateEmail(email) {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(email);
}

function checkPasswordStrength(password) {
  const isLongEnough = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return isLongEnough && hasLetter && hasNumber;
}

document.getElementById("verify").addEventListener("click", function () {
  const enteredCode = document.getElementById("verification-code").value;
  const storedCode = localStorage.getItem("verificationCode");

  if (enteredCode === storedCode) {
    alert("Email verified successfully!");
    verified = true;
    localStorage.setItem("verified", "true");

    document.getElementById("email").disabled = true;
    document.getElementById("verification-code").disabled = true;
    document.getElementById("verificationCodeButton").disabled = true;

    const verifyBtn = document.getElementById("verify");
    verifyBtn.textContent = "Verified";
    verifyBtn.disabled = true;

    localStorage.removeItem("verificationCode");
  } else {
    alert("Incorrect verification code. Please try again.");
  }
});

document.getElementById("email").addEventListener("input", () => {
  verified = false;
  localStorage.removeItem("verified");

  document.getElementById("email").disabled = false;
  document.getElementById("verification-code").disabled = false;
  document.getElementById("verificationCodeButton").disabled = false;

  const verifyBtn = document.getElementById("verify");
  verifyBtn.textContent = "Verify";
  verifyBtn.disabled = false;
});

function signup(event) {
  event.preventDefault();

  const firstName = document.getElementById("first-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();
  const age = document.getElementById("age").value.trim();
  const dob = document.getElementById("date").value;
  const maritalStatus = document.getElementById("marry").value;
  const bloodGroup = document.getElementById("blood-group").value;
  const country = document.getElementById("country").value.trim();
  const division = document.getElementById("division").options[document.getElementById("division").selectedIndex].text;
  const district = document.getElementById("district").options[document.getElementById("district").selectedIndex].text;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  if (!checkPasswordStrength(password)) {
    if (password.length < 6) {
      alert("Password must have at least 6 characters");
      return;
    }
    alert("Password must contain letters and numbers");
    return;
  }

  if (localStorage.getItem("verified") !== "true") {
    alert("Please verify your email before signing up.");
    return;
  }

  const newUser = {
    firstName,
    lastName,
    age,
    dob,
    maritalStatus,
    bloodGroup,
    country,
    division,
    district,
    email,
    password,
  };

  let users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.some(user => user.email === email)) {
    alert("This email is already registered.");
    return;
  }

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  alert("Sign up successful!");
  localStorage.removeItem("verified");
  window.location.href = "index.html";
}
