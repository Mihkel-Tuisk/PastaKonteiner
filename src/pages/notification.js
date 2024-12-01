// Urmase poolt
// Teavituste jaoks kaks funktsiooni

// Loob teavituse elemendi
function notification(message) {
    const notifications = document.getElementById("teavitused");
    const notification = document.createElement("div");
    notification.classList.add("teavitus");
    notification.innerText = message;
    notifications.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = "fadeOut 0.5s forwards";
        setTimeout(() => notification.remove(), 0);
    }, 3000);
}

// Kutsub välja eelmainitud funktsiooni, ka paneb konsooli selle sama sõnumi
function teavita(message) {
    console.log(message);
    notification(message);
}