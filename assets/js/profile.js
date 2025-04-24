window.onload = async () => {
    try {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
            alert("You are not logged in. Redirecting to login page.");
            window.location.href = "index.html"; // Redirect to login page if not logged in
            return;
        }

        const response = await fetch('http://localhost:8000/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`  // Send the token with the request
            }
        });

        // Check if the response status is ok (status 200)
        if (!response.ok) {
            // If not 200, handle different status codes
            if (response.status === 401) {
                alert("Unauthorized access. Please log in again.");
                localStorage.removeItem("access_token");
                window.location.href = "index.html"; // Redirect to login page on unauthorized access
                return;
            }
            alert("Failed to load profile. Please try again later.");
            return;
        }

        const data = await response.json(); // 👈 Extract the JSON body here

        if (data.success === true) {
            const user = data.user;
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
