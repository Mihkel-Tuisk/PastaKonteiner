function teavita(message) {
    console.log(message);
    alert(message);
}

async function mineTuppaBtn() {
    const roomID = document.getElementById("toakood").value;
    if (!roomID) {
      teavita("Palun sisesta toakood!");
      return;
    }
  
    const pastadekonteiner = document.getElementById("teisteToad");
    if (!pastadekonteiner) {
      teavita("teisteToad elementi ei leitud!");
      return;
    }
  
    pastadekonteiner.innerHTML = "";
  
    async function addDOMcategory(roomID) {
      const roomText = document.createElement("input");
      const roomCode = document.createElement("p");
  
      const roomTextQuery = await getRoomText(roomID);
      if (roomTextQuery.error != null) {
        teavita(roomTextQuery.error);
        return;
      }
  
      roomText.value = roomTextQuery.text;
      roomText.id = roomID;
      roomText.readOnly = true;
      roomCode.textContent = roomID;
  
      pastadekonteiner.appendChild(roomCode);
      pastadekonteiner.appendChild(roomText);
    }
  
    await addDOMcategory(roomID);
}