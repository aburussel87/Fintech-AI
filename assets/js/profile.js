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

            const img = document.getElementById("profileImage");
            console.log(data.image);
            img.src = data.image ? `http://localhost:5000${data.image}` : "assets/logo.png";
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


document.getElementById("uploadInput").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("profileImage").src = e.target.result;
    };
    reader.readAsDataURL(file);
  
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", file); // Append the file to FormData object

    // Send the image to the server
    fetch('http://localhost:5000/profile/uploadImage', {
        method: 'POST',
        body: formData,  // FormData automatically sets content-type
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("access_token")}` // Include JWT token for authentication
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Image uploaded successfully!");
        } else {
            alert("Error uploading image.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to upload image.");
    });
});

  