// Siitmaalt algab Urmase lisatud nuppude ja funktsioonide sidumine

function teavita(message) {
  console.log(message);
  alert(message);
}

async function generateRoomBtn() {
  let textBox = document.getElementById("tekst");

  if (!textBox) {
    teavita("tekst elementi ei leitud!")
    return;
  }

  let boxContent = textBox.value;

  if (boxContent === "") {
    teavita("Konteineri nimi ei saa olla tühi!");
    return;
  }

  const randomRoomId = generateRandomId(5);
  let ret1 = await createRoom(randomRoomId);
  
  if (ret1.error != null) {
    teavita(ret1.error)
    return;
  }

  let ret2 = await saveRoom(randomRoomId, boxContent);
  if (ret2.error != null) {
    teavita(ret2.error)
    return;
  }

  textBox.value = ""

  await updateDOM();
}

function saveRoomBtn(roomid) {
  saveRoom(roomid, document.getElementById(roomid)?.value);
}

async function updateDOM() {
  const pastadekonteiner = document.getElementById("konteinerid");
  const roomsLeftElement = document.getElementById("tubasiAlles");

  if (!pastadekonteiner) {
    teavita("konteinerid elementi ei leitud!")
    return;
  }

  if (!roomsLeftElement) {
    teavita("tubasiAlles elementi ei leitud!")
    return;
  }

  pastadekonteiner.innerHTML = "";

  async function addDOMcategory(roomID) {

    const roomTextQuery = await getRoomText(roomID);
    if (roomTextQuery.error != null) {
      teavita(roomTextQuery.error)
      return;
    }

    const roomText = document.createElement("textarea");
    const roomCode = document.createElement("label");
    const saveBtn = document.createElement("button");
    const container = document.createElement("div")
    const containerNav = document.createElement("div")
    const copyBtn = document.createElement("button")
    const copyBtnIcon = document.createElement("span")


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

    copyBtn.appendChild(copyBtnIcon)
    containerNav.appendChild(roomCode)
    containerNav.appendChild(copyBtn)
    container.appendChild(containerNav)
    container.appendChild(roomText)

    container.appendChild(saveBtn)
    pastadekonteiner.appendChild(container)

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

  const myRooms = await getAllMyRooms();

  // See "Kasutaja jaoks ei leitud ruume!" error pole hull, selle saab üle lasta :wink:
  if (myRooms.error != null && myRooms.error != "Kasutaja jaoks ei leitud ruume!") {
    teavita(myRooms.error)
    return;
  }

  const totalRoomsCreated = myRooms.roomIds.length;
  const maxRooms = myRooms.maxRoomsPerUser;
  const roomsLeft = maxRooms - totalRoomsCreated;

  roomsLeftElement.textContent = roomsLeft;

  for (let i = 0; i < myRooms.roomIds.length; i++) {
    console.log(myRooms.roomIds[i]);
    await addDOMcategory(myRooms.roomIds[i]);
  }
}

window.addEventListener('load', async function() {
  await updateDOM();
});

