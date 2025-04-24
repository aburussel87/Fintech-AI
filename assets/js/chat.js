// Handle sending a message
async function sendMessage() {
  const inputField = document.getElementById("userInput");
  const userText = inputField.value.trim();
  if (userText === "") return; // Don't send empty messages

  const message = {
    text: userText,
  };

  // Add user message first
  addMessage(userText, "user");
  inputField.value = ""; // Clear input field

  // Get token from localStorage
  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("You are not authenticated. Please log in.");
    // Optionally redirect to login page
    window.location.href = "login.html"; // Redirect to login
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();

    // Handle bot's reply
    if (data.success) {
      addMessage(data.message, "bot");
    } else {
      addMessage("Error: " + data.message, "bot");
    }

  } catch (error) {
    console.error("Error sending message:", error);
    alert("Failed to send the message. Please try again.");
  }
}

// Add message to chat box
function addMessage(message, sender) {
  const chatBox = document.getElementById("chatbox");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);
  messageDiv.textContent = message;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}

// Event listener for send button (prevents form submission)
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("send");
  btn.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form submission (default)
    sendMessage(); // Call sendMessage function
  });
});
