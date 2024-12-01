// Kopeerib lõikelauale toa sisu
function copyContent(roomID) {
    const input = document.getElementById(roomID)
    navigator.clipboard.writeText(input.value)
    const message = "Sisu kopeeritud lõikelauale"
    notification(message)
}

// Kopeerib lõikelauale toakoodi
function copyCode(code) {
    navigator.clipboard.writeText(code)
    const message = "Toakood kopeeritud lõikelauale"
    notification(message)
}