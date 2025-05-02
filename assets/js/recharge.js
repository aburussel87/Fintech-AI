async function submitRecharge() {
  const amount = document.getElementById("amount").value;
  const method = document.getElementById("method").value;
  const token = localStorage.getItem("access_token"); // Ensure token is stored at login

  if (!amount || !method || !token) {
      alert("Please fill all fields and make sure you're logged in.");
      return;
  }

  const res = await fetch("http://localhost:5000/recharge", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ amount, method })
  });

  const data = await res.json();
  if (data.success) {
      alert("Recharge successful!");
  } else {
      alert("Error: " + data.message);
  }
}

document.getElementById("button").addEventListener("click",()=>{
  submitRecharge();
})