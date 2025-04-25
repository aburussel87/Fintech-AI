let verificationCode = "";
let verified = false;
let formatted_time = "";

function validatePersonalInfo() {
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const age = document.getElementById("age").value;
  const dateOfBirth = document.getElementById("date").value;
  const mobile = document.getElementById("mobile").value;
  const maritalStatus = document.getElementById("marry").value;
  const bloodGroup = document.getElementById("blood-group").value;

  if (firstName && lastName && age && dateOfBirth && mobile && maritalStatus && bloodGroup) {
    showNextSection('address-info-section');
  } else {
    alert("Please fill in all the fields.");
  }
}

function validateAddressInfo() {
  const division = document.getElementById("division").value;
  const district = document.getElementById("district").value;

  if (division && district && district !== "District") {
    showNextSection('verification-info-section');
  } else {
    alert("Please fill in all the fields.");
  }
}

function validateVerificationInfo() {
  const email = document.getElementById("email").value;
  const verificationCode = document.getElementById("verification-code").value;

  if (email && verificationCode && verified) {
    showNextSection('password-info-section');
  } else {
    alert("Please fill in all the fields.");
  }
}

function showNextSection(nextSectionId) {
  const currentSection = document.querySelector('.section.active');
  const nextSection = document.getElementById(nextSectionId);

  currentSection.classList.remove('active');
  nextSection.classList.add('active');
  nextSection.scrollIntoView({ behavior: "smooth" });
}


function sendVerificationCode() {
  const email = document.getElementById("email").value.trim();
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
      document.getElementById("verificationCodeButton").disabled = true;
      document.getElementById("verificationCodeButton").textContent = "Verification Code Sent";
      document.getElementById("email").disabled = true;
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
    document.getElementById("verify").disabled = true;

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
  document.getElementById("verify").disabled = false;

  const verifyBtn = document.getElementById("verify");
  verifyBtn.textContent = "Verify";
  verifyBtn.disabled = false;
});

function generateUniqueId(joiningYear) {
  const yearPart = joiningYear.toString().slice(-2);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  
  for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      randomPart += chars[randomIndex];
  }

  return yearPart + randomPart;
}


async function signup(event) {
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
  const phone = document.getElementById("mobile").value.trim();

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

  const today = new Date();
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  const joiningDate = today.toLocaleDateString('en-GB', options);

  const id = generateUniqueId(today.getFullYear());
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
    phone,
    joiningDate,
    id
  };

  
  fetch("http://localhost:5000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newUser)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Sign up successful!");
      localStorage.removeItem("verified");
      window.location.href = "index.html"; // ✅ correct here
    } else {
      alert(data.message || "Sign up failed.");
    }
  })
  .catch(error => {
    console.error("Registration error:", error);
    alert("Something went wrong. Please try again.");
  });
  
}