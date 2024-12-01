// Urmase poolt (Mihkel aitas SaveRoomBtn-i bugiga implementeeris teavitused siin ja ka tubadearvu kuvamise)

let MAX_TEXT_LENGTH = 0

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

  // Kogub maksimaalse tähemärkide arvu
  if (MAX_TEXT_LENGTH === 0) {
    const maxChars = await getMaxCharactersForRooms();
    MAX_TEXT_LENGTH = maxChars.maxLenght
  }

  // Kontrollib, kas tekst ületab maksimaalset tähemärkide arvu
  if (boxContent.length > MAX_TEXT_LENGTH) {
    teavita(`Tekst ei tohi ületada ${MAX_TEXT_LENGTH} tähemärki!`);
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
async function saveRoomBtn(roomid) {
  const roomText = document.getElementById(roomid)?.value;

  // Kogub maksimaalse tähemärkide arvu
  if (MAX_TEXT_LENGTH === 0) {
    const maxChars = await getMaxCharactersForRooms();
    MAX_TEXT_LENGTH = maxChars.maxLenght
  }

  // Kontrollib, kas tekst ületab maksimaalset tähemärkide arvu
  if (roomText.length > MAX_TEXT_LENGTH) {
    teavita(roomText.length)
    teavita(MAX_TEXT_LENGTH)
    teavita(`Tekst ei tohi ületada ${MAX_TEXT_LENGTH} tähemärki!`);
    return;
  }

  saveRoom(roomid, roomText);
  const message = `Toa ${roomid} muudatused on salvestatud`;
  teavita(message);
}

// Kuvab kõik sinu toad leheküljele
async function updateDOM() {
  const pastadekonteiner = document.getElementById("konteinerid");
  const roomsLeftElement = document.getElementById("tubasidAlles");

  if (!pastadekonteiner) {
    teavita("konteinerid elementi ei leitud!");
    return;
  }

  if (!roomsLeftElement) {
    teavita("tubasiAlles elementi ei leitud!");
    return;
  }

  pastadekonteiner.innerHTML = "";

  async function addRoomToDOM(roomID, isLastRoom) {
    const roomTextQuery = await getRoomText(roomID);
    if (roomTextQuery.error != null) {
      teavita(roomTextQuery.error);
      return;
    }

    const roomText = document.createElement("textarea");
    const roomCode = document.createElement("label");
    const saveBtn = document.createElement("button");
    const container = document.createElement("div");
    const containerNav = document.createElement("div");
    const copyBtn = document.createElement("button");
    const copyBtnIcon = document.createElement("span");

    roomText.value = roomTextQuery.text;
    roomText.id = roomID;
    roomCode.textContent = roomID;
    saveBtn.textContent = "Salvesta muudatused";

    container.classList.add("lisakonteiner");
    containerNav.classList.add("lisakonteiner-nav");
    copyBtn.classList.add("copyBtn");
    copyBtnIcon.classList.add("material-icons", "md-18");

    copyBtnIcon.textContent = "content_copy";

    copyBtn.appendChild(copyBtnIcon);
    containerNav.appendChild(roomCode);
    containerNav.appendChild(copyBtn);
    container.appendChild(containerNav);
    container.appendChild(roomText);
    container.appendChild(saveBtn);

    pastadekonteiner.appendChild(container);

    if (!isLastRoom) {
      const separator = document.createElement("div");
      separator.classList.add("separator");
      pastadekonteiner.appendChild(separator);
    }

    copyBtn.onclick = function () {
      copyContent(roomID);
    };

    saveBtn.onclick = function () {
      saveRoomBtn(roomID);
    };

    roomCode.onclick = function () {
      copyCode(roomID);
    };
  }

  const myRooms = await getAllMyRooms();

  if (myRooms.error != null && myRooms.error != "Kasutaja jaoks ei leitud ruume!") {
    teavita(myRooms.error);
    return;
  }

  if (myRooms.roomIds === null) {
    return;
  }

  if (myRooms.maxRoomsPerUser === null) {
    return;
  }

  const totalRoomsCreated = myRooms.roomIds.length;
  const maxRooms = myRooms.maxRoomsPerUser;
  const roomsLeft = maxRooms - totalRoomsCreated;

  roomsLeftElement.textContent = roomsLeft;

  for (let i = 0; i < myRooms.roomIds.length; i++) {
    const isLastRoom = i === myRooms.roomIds.length - 1;
    await addRoomToDOM(myRooms.roomIds[i], isLastRoom);
  }
}

// Iga kord kui lehte uuesti laetakse on vaja kuvada kõik toad 
window.addEventListener('load', async function() {
  await updateDOM();
});