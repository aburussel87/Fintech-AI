let balanceVisible = false;
let balanceTimeout;
let balance;

function toggleBalance() {
    const balanceText = document.getElementById("balance-text");

    balanceText.classList.add("hide");

    setTimeout(() => {
        balanceVisible = !balanceVisible;

        if (balanceVisible) {
            balanceText.innerHTML = `<span class="balance-amount">৳${balance.toLocaleString()}</span><span class="balance-currency"> BDT</span>`;
        } else {
            balanceText.textContent = "Tap to see Balance";
        }

        balanceText.classList.remove("hide");

        // Auto-hide after 2 seconds
        if (balanceVisible) {
            clearTimeout(balanceTimeout);
            balanceTimeout = setTimeout(() => {
                balanceText.classList.add("hide");
                setTimeout(() => {
                    balanceText.textContent = "Tap to see Balance";
                    balanceText.classList.remove("hide");
                    balanceVisible = false;
                }, 500); // Match transition duration
            }, 2000);
        }
    }, 300); // Wait for fade-out before switching content
}


window.onload = async () => {
    try {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
            alert("You are not logged in. Redirecting to login page.");
            window.location.href = "index.html"; // Redirect to login page if not logged in
            return;
        }

        const response = await fetch('http://localhost:5000/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`  // Send the token with the request
            }
        });

        // Check if the response status is ok (status 200)
        if (!response.ok) {
                alert("Unauthorized access. Please log in again.");
                localStorage.removeItem("access_token");
                window.location.href = "index.html"; // Redirect to login page on unauthorized access
                return;
        }

        const data = await response.json(); // 👈 Extract the JSON body here

        if (data.success === true) {
            const user = data.user;
            document.getElementById("name").textContent = `${user.firstName} ${user.lastName}`;
            document.getElementById("id").textContent = user.id || "N/A";
            balance = user.balance;
            // document.getElementById("user-name").textContent = `${user.firstName} ${user.lastName}`;
            // document.getElementById("user-age").textContent = user.age || "N/A";
            // document.getElementById("user-marital").textContent = user.maritalStatus || "N/A";
            // document.getElementById("user-blood").textContent = user.bloodGroup || "N/A";
            // document.getElementById("user-dob").textContent = user.dob || "N/A";
            // document.getElementById("user-joining").textContent = user.joiningDate || "N/A";
            // document.getElementById("user-address").textContent = `${user.district}, ${user.division}, ${user.country}`;
            document.getElementById("number").textContent = user.phone || "N/A";
            const img = document.getElementById("profile");
            console.log(data.image);
            img.src = data.image ? `http://localhost:5000${data.image}` : "assets/logo.png";
            // document.getElementById("user-email").textContent = user.email;
        } else {
            alert("Failed to fetch profile. Redirecting to login page.");
            localStorage.removeItem("access_token");
            window.location.href = "index.html";
        }

    } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to load user data. Please check your connection or try again later.');
    }
};

document.getElementById("send-money-card").addEventListener("click",()=>{
    window.location.href = "payment.html";
})

document.getElementById("recharge-card").addEventListener("click", () => {
    window.location.href = "recharge.html";
  });
  
  document.getElementById("pay-bill-card").addEventListener("click", () => {
    window.location.href = "pay-bill.html";
  });
  
  document.getElementById("bank-transfer-card").addEventListener("click", () => {
    window.location.href = "bank-transfer.html";
  });
  
  document.getElementById("my-wallet-card").addEventListener("click", () => {
    window.location.href = "wallet.html";
  });
  
  document.getElementById("statement-card").addEventListener("click", () => {
    window.location.href = "statement.html";
  });
  
  document.getElementById("add-card").addEventListener("click", () => {
    window.location.href = "add-card.html";
  });
  
  document.getElementById("request-money-card").addEventListener("click", () => {
    window.location.href = "request-money.html";
  });
  
  document.querySelector(".transaction-card i.fa-mobile-alt").parentElement.addEventListener("click", () => {
    window.location.href = "recharge.html";
  });
  