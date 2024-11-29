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
    const roomText = document.createElement("input");
    const roomCode = document.createElement("p");
    const saveBtn = document.createElement("button");

    const roomTextQuery = await getRoomText(roomID);
    if (roomTextQuery.error != null) {
      teavita(roomTextQuery.error)
      return;
    }

    roomText.value = roomTextQuery.text;
    roomText.id = roomID;
    roomCode.textContent = roomID;
    saveBtn.textContent = "Salvesta";

    pastadekonteiner.appendChild(roomCode);
    pastadekonteiner.appendChild(roomText);

    saveBtn.onclick = function () {
      saveRoomBtn(roomID);
    };
    pastadekonteiner.appendChild(saveBtn);
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