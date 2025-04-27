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
    alert("Unauthorized Access. Please log in.");
    window.location.href = "index.html"; // Redirect to login page if not logged in
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/verifyReceiver", {
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
      document.getElementById("verify").disabled = true;
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


async function submitPayment() {
  const receiverId = document.getElementById('receiver-id').value.trim();
  const receiverMobile = document.getElementById('receiver-mobile').value.trim();
  const note = document.getElementById('note').value.trim();

  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("Please log in first.");
    return;
  }

  const data = {
    id: receiverId,
    mobile: receiverMobile,
    note: note,
    amount: document.getElementById('amount').value.trim(),
    paymentMethod: document.getElementById('payment-method').value,
    payerInfo: document.getElementById('payer-info').value.trim()
  };

  const res = await fetch("http://localhost:5000/payment/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  if (result.success) {
    alert("Payment recorded!");
    generateInvoicePDF(result.invoice); // result.invoice will contain details
  } else {
    alert(result.message);
  }
}

async function generateInvoicePDF(invoice) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Load image as base64 with opacity using canvas
  const imgURL = 'assets/logo.png';
  const img = new Image();
  img.src = imgURL;

  doc.addImage(img, 'PNG', 10, 5, 30, 30);

  // Title
  doc.setTextColor(41, 128, 185);
  doc.setFontSize(24);
  doc.text("INVOICE", 105, 20, { align: "center" });

  // Invoice Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Invoice ID: ${invoice.invoice_id}`, 14, 35);
  doc.text(`Date & Time: ${invoice.time}`, 14, 43);
  doc.text(`Amount: ${invoice.amount} BDT`, 14, 51);
  doc.text(`Payment Method: ${invoice.payment_method}`, 14, 59);

  doc.setLineWidth(0.5);
  doc.setDrawColor(189, 195, 199);
  doc.line(10, 58, 200, 58);

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.text("Sender & Receiver Details", 14, 68);

  const startY = 75;
  const leftX = 14;
  const rightX = 105;

  doc.setFontSize(12);
  doc.setFont("times", "normal");
  doc.setTextColor(0, 0, 0);

  // Sender
  doc.setFont("times", "bold");
  doc.text("Sender Information", leftX, startY);
  doc.setFont("times", "normal");
  doc.text(`ID: ${invoice.sender_id}`, leftX, startY + 8);
  doc.text(`Name: ${invoice.sender_info.name}`, leftX, startY + 16);
  doc.text(`Phone: ${invoice.sender_info.phone}`, leftX, startY + 24);
  doc.text(`Email: ${invoice.sender_info.email}`, leftX, startY + 32);

  // Receiver
  doc.setFont("times", "bold");
  doc.text("Receiver Information", rightX, startY);
  doc.setFont("times", "normal");
  doc.text(`ID: ${invoice.receiver_id}`, rightX, startY + 8);
  doc.text(`Name: ${invoice.receiver_info.name}`, rightX, startY + 16);
  doc.text(`Phone: ${invoice.receiver_info.phone}`, rightX, startY + 24);
  doc.text(`Email: ${invoice.receiver_info.email}`, rightX, startY + 32);

  if (invoice.note) {
    doc.setFont("times", "italic");
    doc.setTextColor(127, 140, 141);
    doc.text(`Note: ${invoice.note}`, 14, startY + 45);
  }

  doc.save('invoice.pdf');
}
