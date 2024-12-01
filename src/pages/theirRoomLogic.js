// Baasi lõi Mihkel, Urmas täiendas hiljem

// theirRoomi jaoks on vaja andmebaasist veebilehele välja kuvada toad, siin see ongi

// Üldine funktioon, teeb kõik ära mis ülal mainitud
async function mineTuppaBtn() {
    // Vaatab kas toakood on sisesatud, kui pole, siis teavitab kasutajat
    const roomID = document.getElementById("toakood").value;
    if (!roomID) {
      teavita("Palun sisesta toakood!");
      return;
    }
  
    // Vaatab kas tuba eksisteerib, kui pole olemas, siis teavitab kasutajat
    const pastadekonteiner = document.getElementById("teisteToad");
    if (!pastadekonteiner) {
      teavita("teisteToad elementi ei leitud!");
      return;
    }
  
    // Tühistab eelmise kuvatud toa
    pastadekonteiner.innerHTML = "";
  
    // Funktsioon sisuliselt lisab HTML-i selle toa
    async function addRoomToDOM(roomID) {

      // Kas on olemas toal ka sisu? kui mitte siis teavita sellest
      const roomTextQuery = await getRoomText(roomID);
      if (roomTextQuery.error != null) {
        teavita(roomTextQuery.error)
        return;
      }
  
      // Loob elemendid
      const roomText = document.createElement("textarea");
      const roomCode = document.createElement("label");
      const container = document.createElement("div")
      const containerNav = document.createElement("div")
      const copyBtn = document.createElement("button")
      const copyBtnIcon = document.createElement("span")
  
  
      // Annab neile väärtused/klassid
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

      // Sobitab need kokku suureks container elemendiks
      copyBtn.appendChild(copyBtnIcon)
      containerNav.appendChild(roomCode)
      containerNav.appendChild(copyBtn)
      container.appendChild(containerNav)
      container.appendChild(roomText)
      // Lisab selle HTML-i
      pastadekonteiner.appendChild(container)
  
      // Lisafunktsioonid nuppude jaoks
      // Kopeerib toa sisu lõikelauale
      copyBtn.onclick = function () {
        copyContent(roomID);
      }

      // Kopeerib toakoodi lõikelauale
      roomCode.onclick = function () {
        copyCode(roomID)
      }
    }

    // Kutsub eelmainitud funktsiooni
    await addRoomToDOM(roomID);
}