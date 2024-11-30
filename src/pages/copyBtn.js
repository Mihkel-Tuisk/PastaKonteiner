function copyContent(roomID) {
    const input = document.getElementById(roomID)
    navigator.clipboard.writeText(input.value)
}

function copyCode(code) {
    navigator.clipboard.writeText(code)
}




