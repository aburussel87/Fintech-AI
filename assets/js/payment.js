async function verifyReceiver() {
  const receiverId = document.getElementById('receiver-id');
  const receiverMobile = document.getElementById('receiver-mobile');
  
  if (receiverId.value.trim() === "" || receiverMobile.value.trim() === "") {
    alert("Please enter both Receiver ID and Mobile Number.");
    return;
  }

  const receiverData = {
    id: receiverId.value,
    mobile: receiverMobile.value
  };
  
  const token = localStorage.getItem("access_token");  // Assume token is stored in localStorage after login
  console.log(token);
  if (!token) {
      alert("You are not authenticated. Please log in.");
      return;
  }

  try {
      const response = await fetch("http://localhost:8000/verifyReceiver", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`  // Send the token in the Authorization header
          },
          body: JSON.stringify(receiverData)
      });

      const data = await response.json();

      if (data.success) {
          alert("Receiver verified successfully!");
          receiverId.readOnly = true;
          receiverMobile.readOnly = true;
          document.getElementById("payment-method").disabled = false;
          document.getElementById("amount").disabled = false;
          document.getElementById("payer-info").disabled = false;
          document.getElementById("note").disabled = false;
          document.getElementById("submit").disabled = false;
      } else {
          alert(data.message);
      }
  } catch (error) {
      console.error("Verification failed:", error);
      alert("Failed to verify receiver. Please try again.");
  }
}
