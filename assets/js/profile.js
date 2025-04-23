window.onload = () => {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    
    // You might already have the current email stored elsewhere; assuming it's stored in localStorage:
    const loggedInEmail = localStorage.getItem("loggedInEmail");
    const user = users.find(user => user.email === loggedInEmail);
    
    if (!user) {
        alert("User not found. Please register first.");
        return;
    }

    // Populate fields
    document.getElementById("profile_name").textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById("user-id").textContent = user.id || "N/A";
    document.getElementById("user-name").textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById("user-age").textContent = user.age || "N/A";
    document.getElementById("user-marital").textContent = user.maritalStatus || "N/A";
    document.getElementById("user-blood").textContent = user.bloodGroup || "N/A";
    document.getElementById("user-dob").textContent = user.dob || "N/A";
    document.getElementById("user-joining").textContent = user.joiningDate || "N/A";
    document.getElementById("user-address").textContent = `${user.district}, ${user.division}, ${user.country}`;
    document.getElementById("user-phone").textContent = user.phone || "N/A";
    document.getElementById("user-email").textContent = user.email;
};
