function verifyReceiver() {
    const receiverId = document.getElementById('receiver-id');
    const receiverMobile = document.getElementById('receiver-mobile');
  
    if (receiverId.value.trim() === "" || receiverMobile.value.trim() === "") {
      alert("Please enter both Receiver ID and Mobile Number.");
      return;
    }
  
    alert("Receiver verified successfully!");
  
    receiverId.readOnly = true;
    receiverMobile.readOnly = true;
  
    document.getElementById('payment-method').disabled = false;
    document.getElementById('amount').disabled = false;
    document.getElementById('payer-info').disabled = false;
    document.getElementById('note').disabled = false;
    document.querySelector('.submit-btn').disabled = false;
  }