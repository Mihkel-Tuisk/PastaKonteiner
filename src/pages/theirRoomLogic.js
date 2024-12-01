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
  
    // async function addDOMcategory(roomID) {
    //   const roomText = document.createElement("textarea");
    //   const roomCode = document.createElement("label");
  
    //   const roomTextQuery = await getRoomText(roomID);
    //   if (roomTextQuery.error != null) {
    //     teavita(roomTextQuery.error);
    //     return;
    //   }
  
    //   roomText.value = roomTextQuery.text;
    //   roomText.id = roomID;
    //   roomText.readOnly = true;
    //   roomCode.textContent = roomID;
  
    //   pastadekonteiner.appendChild(roomCode);
    //   pastadekonteiner.appendChild(roomText);
    // }
    async function addDOMcategory(roomID) {

      const roomTextQuery = await getRoomText(roomID);
      if (roomTextQuery.error != null) {
        teavita(roomTextQuery.error)
        return;
      }
  
      const roomText = document.createElement("textarea");
      const roomCode = document.createElement("label");
      const container = document.createElement("div")
      const containerNav = document.createElement("div")
      const copyBtn = document.createElement("button")
      const copyBtnIcon = document.createElement("span")
  
  
      roomText.value = roomTextQuery.text;
      roomText.id = roomID;
      roomText.readOnly = true;
      roomCode.textContent = roomID;
  
      container.classList.add("lisakonteiner")
      containerNav.classList.add("lisakonteiner-nav")
      copyBtn.classList.add("copyBtn")
  
      copyBtnIcon.classList.add("material-icons") 
      copyBtnIcon.classList.add("md-18") 
      copyBtnIcon.textContent = "content_copy"
  
      copyBtn.appendChild(copyBtnIcon)
      containerNav.appendChild(roomCode)
      containerNav.appendChild(copyBtn)
      container.appendChild(containerNav)
      container.appendChild(roomText)
      pastadekonteiner.appendChild(container)
  
      copyBtn.onclick = function () {
        copyContent(roomID);
      }
  
      roomCode.onclick = function () {
        copyCode(roomID)
      }
  
    }

  
    await addDOMcategory(roomID);
}