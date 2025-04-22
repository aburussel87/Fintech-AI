// Handle sending a message
function sendMessage() {
    const inputField = document.getElementById('user-input');
    const userText = inputField.value.trim();
    if (userText === '') return;

    addMessage(userText, 'user');
    inputField.value = '';

    const botReply = getBotReply(userText.toLowerCase());
    setTimeout(() => {
        addMessage(botReply, 'bot');
    }, 500);
}

// Add message to chat box
function addMessage(message, sender) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Get bot's reply based on user input
function getBotReply(input) {
    switch (input) {
        case 'hello':
            return 'Hi there!';
        case 'how are you':
            return "I'm fine, thanks!";
        case 'what is your name':
            return "I'm your friendly chatbot 😊";
        case 'bye':
            return 'Goodbye! Have a nice day!';
        default:
            return "Sorry, I don't understand that.";
    }
}

// Handle Enter key press
document.getElementById('user-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
