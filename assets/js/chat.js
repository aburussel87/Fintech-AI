async function sendMessageAi() {
    const inputField = document.getElementById("userInput");
    const message = inputField.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    inputField.value = "";

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      if (!res.ok || !data.response) {
        throw new Error("No response from chatbot");
      }

      addMessage(data.response, 'bot');
    } catch (error) {
      addMessage("Error: Could not connect to server.", 'bot');
      console.error("Chat error:", error);
    }

    const chatbox = document.getElementById("chatbox");
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  // Add message to chat UI
  function addMessage(message, sender) {
    const chatbox = document.getElementById("chatbox");
    const div = document.createElement("div");
    div.classList.add("message", sender);
    div.textContent = message;
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  // Enter key triggers chatbot send
  document.getElementById("userInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter") sendMessageAi();
  });