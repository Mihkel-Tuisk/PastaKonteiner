// Urmase poolt (Mihkel aitas SaveRoomBtn-i bugiga implementeeris teavitused siin ja ka tubadearvu kuvamise)


// Siin on kõik tubadekuvamine veebilehele jällegi, seega sarnaneb theirRoomLogic.js-ga, kuid mõne lisafunktsiooniga

// Funktsioon lisab andmebaasi sellise sisuga toa, millisena kasutaja ta lõi
async function generateRoomBtn() {
  // Võtab kasutaja poolt loodud tekstielemendi
  let textBox = document.getElementById("tekst");

  if (!textBox) {
    teavita("tekst elementi ei leitud!")
    return;
  }
  
  
  let boxContent = textBox.value;

  // Kui pole sisu, siis ei saa, peab teavitama ka
  if (boxContent === "") {
    teavita("Konteiner ei saa olla tühi!");
    return;
  }

  // Loob toakoodi
  const randomRoomId = generateRandomId(5);

  // Lisab toa andmebaasi
  let ret1 = await createRoom(randomRoomId);
  
  // Vaatab kas midagi on vahepeal valesti ka
  if (ret1.error != null) {
    teavita(ret1.error)
    return;
  }

  // Lisab toale ka sisu
  let ret2 = await saveRoom(randomRoomId, boxContent);

  // Kontrollib
  if (ret2.error != null) {
    teavita(ret2.error)
    return;
  }

  textBox.value = ""

  // Teavitab kasutajat
  const message = `Tuba ${randomRoomId} loodud`
  teavita(message)
  
  // Uuendab kuvandit (sest andmebaas muutus)
  await updateDOM();
}

// Salvestamise nupu funktsionaalsus, paneb andmebaasi ja teavitab sind sellest
function saveRoomBtn(roomid) {
  saveRoom(roomid, document.getElementById(roomid)?.value);
  const message = `Toa ${roomid} muudatused on salvestatud`
  notification(message)
}

// Kuvab kõik sinu toad leheküljele
async function updateDOM() {
  // Võtab HTML-ist need elemendid
  const pastadekonteiner = document.getElementById("konteinerid");
  const roomsLeftElement = document.getElementById("tubasidAlles");

  // Vaatab kas leidis need ka
  if (!pastadekonteiner) {
    teavita("konteinerid elementi ei leitud!")
    return;
  }

  if (!roomsLeftElement) {
    teavita("tubasiAlles elementi ei leitud!")
    return;
  }

  // Eemaldab eelmise laadimise sisu
  pastadekonteiner.innerHTML = "";

  // Lisab kontaineri/toa andmebaasist HTML-i
  async function addRoomToDOM(roomID) {

    // Vaatab kas sai toasisu ka
    const roomTextQuery = await getRoomText(roomID);
    if (roomTextQuery.error != null) {
      teavita(roomTextQuery.error)
      return;
    }

    // Loob elemendid
    const roomText = document.createElement("textarea");
    const roomCode = document.createElement("label");
    const saveBtn = document.createElement("button");
    const container = document.createElement("div")
    const containerNav = document.createElement("div")
    const copyBtn = document.createElement("button")
    const copyBtnIcon = document.createElement("span")

    // Lisab neile omadused/klassid
    roomText.value = roomTextQuery.text;
    roomText.id = roomID;
    roomCode.textContent = roomID;
    saveBtn.textContent = "Salvesta muudatused";

    container.classList.add("lisakonteiner")
    containerNav.classList.add("lisakonteiner-nav")
    copyBtn.classList.add("copyBtn")
    copyBtnIcon.classList.add("material-icons") 
    copyBtnIcon.classList.add("md-18") 

    copyBtnIcon.textContent = "content_copy"

    // Liidab need üheks elemendiks
    copyBtn.appendChild(copyBtnIcon)
    containerNav.appendChild(roomCode)
    containerNav.appendChild(copyBtn)
    container.appendChild(containerNav)
    container.appendChild(roomText)
    container.appendChild(saveBtn)

    // Paneb selle sinnna HTML-i
    pastadekonteiner.appendChild(container)

    // Nupude funktsioonid peavad ka olema defineeritud 
    copyBtn.onclick = function () {
      copyContent(roomID);
    }

    saveBtn.onclick = function () {
      saveRoomBtn(roomID);
    };

    roomCode.onclick = function () {
      copyCode(roomID)
    }

  }

  // Teeb päringu andmebaasi kasutaja kõikide tubade loendist
  const myRooms = await getAllMyRooms();

  // See "Kasutaja jaoks ei leitud ruume!" error pole hull, selle saab üle lasta :wink:
  if (myRooms.error != null && myRooms.error != "Kasutaja jaoks ei leitud ruume!") {
    teavita(myRooms.error)
    return;
  }

  // Rehkendendused, et kuvada mitu tuba kasutaja saab veel teha
  const totalRoomsCreated = myRooms.roomIds.length;
  const maxRooms = myRooms.maxRoomsPerUser;
  const roomsLeft = maxRooms - totalRoomsCreated;

  roomsLeftElement.textContent = roomsLeft;

  // Kõiki tubade kuvamine tsükli abil
  for (let i = 0; i < myRooms.roomIds.length; i++) {
    console.log(myRooms.roomIds[i]);
    await addRoomToDOM(myRooms.roomIds[i]);
  }
}

// Iga kord kui lehte uuesti laetakse on vaja kuvada kõik toad 
window.addEventListener('load', async function() {
  await updateDOM();
});

