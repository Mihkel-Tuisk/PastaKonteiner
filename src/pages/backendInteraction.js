/* 
    Funktsioonid backendi süsteemiga suhtlemiseks on välja töötatud ja kirjutatud Mihkel Tuisk.
    Need funktsioonid võimaldavad suhelda serveri ja andmebaasiga, andes võimaluse andmete pärimiseks, 
    lisamiseks, uuendamiseks ja kustutamiseks.

    Backendi kood asub kaustas: backend\index.js
*/

// Lingid API jaoks.
const BASE_URL = 'https://pastakonteiner.live/api';

const CREATE_ROOM_URL = `${BASE_URL}/room`;
const SAVE_ROOM_URL = `${BASE_URL}/room`;
const GET_ROOM_URL = `${BASE_URL}/room`;
const GET_ROOMS_FOR_USER_URL = `${BASE_URL}/rooms`;

// Funktsioon, mis genereerib juhusliku ID, mille pikkus on määratud `length` parameetriga.
function generateRandomId(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
    const charactersLength = characters.length; 
    let counter = 0;

    // Korratakse, kuni jõutakse soovitud pikkuseni
    while (counter < length) {
        // Valime juhuslikult tähemärgi 'characters' stringist ja lisame selle tulemusse
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }

    return result;
}

// Funktsioon, mis tagastab kasutaja ID. Kui see pole salvestatud, siis genereeritakse uus ID ja salvestatakse kohalikus salvestuses (localStorage).
function getUserId() {
    //localStorage.removeItem('userId');  // Testimiseks, et iga kord uus ID

    // Proovime saada olemasoleva kasutaja ID, mis on salvestatud localStorage'is
    let userId = localStorage.getItem('userId');

    // Kui ID ei ole salvestatud, siis genereerime uue
    if (!userId) {
        userId = generateRandomId(26);  // Genereerib juhusliku ID, mille pikkus on 26 tähemärki
        localStorage.setItem('userId', userId);  // Salvestame kasutaja ID kohalikku salvestusse
    }

    // Tagastame kasutaja ID
    return userId;
}


/*
    Funktsioon, mis loob uue toa, kasutades antud roomId.

    Edukas vastus:
    {
        "error": null  // Kui toa loomine õnnestus
    }

    Vigane vastus:
    {
        "error": "Vigase päringu sõnum"  // Vigane päring või muu viga
    }
*/
async function createRoom(roomId) {
    const userId = getUserId();

    // Loome päringu keha, mis sisaldab kasutaja ID-d ja toa ID-d
    const payload = { userId, roomId };

    try {
        const response = await fetch(CREATE_ROOM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        // Tagastame vastuse JSON formaadis
        return await response.json();

    } catch (error) {
        // Kui päringu tegemisel tekib viga, logime vea sõnumi konsooli
        console.error('Viga POST päringu tegemisel:', error);
        throw error;
    }
}

/*
    Funktsioon, mis uuendab toa teksti vastavalt antud ID-le.

    Edukas vastus:
    {
        "error": null // Ei esine vigu, kõik läks hästi
    }

    Vigane vastus:
    {
        "error": "Vigase päringu sõnum"  // Vigane päring või muu viga
    }
*/
async function saveRoom(roomId, text) {
    const userId = getUserId();

    // Loome päringu keha, milleks on kasutaja ID ja uus tekst
    const payload = {
        userId: userId,
        text: text
    };

    try {
        const response = await fetch(`${SAVE_ROOM_URL}/${roomId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        // Tagastame vastuse JSON formaadis
        return await response.json();

    } catch (error) {
        // Kui päringu tegemisel tekib viga, logime vea sõnumi konsooli
        console.error('Viga PATCH päringu tegemisel:', error);
        throw error;
    }
}

/*
    Funktsioon, mis toob ülesande (toa) teksti, kasutades konkreetset toa ID-d.

    Edukas vastus:
    {
        "error": null,  // Ei esine vigu
        "text": "See on toa tekst"  // Toa tekst, mida otsitakse
    }

    Vigane vastus:
    {
        "error": "Vigase päringu sõnum",  // Vigane päring või muu viga
        "text": null  // Toa teksti ei leitud
    }
*/
async function getRoomText(roomId) {
    const userId = getUserId();

    try {
        const response = await fetch(`${GET_ROOM_URL}/${roomId}?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Tagastame vastuse JSON formaadis
        return await response.json();

    } catch (error) {
        // Kui päringu tegemisel tekib viga, logime vea sõnumi konsooli
        console.error('Viga GET päringu tegemisel:', error);
        throw error;
    }
}

/*
    Funktsioon, mis toob kõikide ruumide ID-d, mis on seotud praeguse kasutaja ID-ga.
 
    Edukas vastus:
    {
        "error": null // Ei esine vigu
        "roomIds": ["tuba1", "tuba2", "tuba3"] // Minu loodud tubade ID
        "maxRoomsPerUser": 20 // Maksimum lubatud tubade arv iga kasutaja kohta
    }

    Vigane vastus:
    {
        "error": "Vigase päringu sõnum" // Vigane päring või muu viga
        "roomIds": null // Ei leitud tubasi
        "maxRoomsPerUser": null // Ei tea kui palju on lubatud tubasi luua
    }
*/
async function getAllMyRooms() {
    const userId = getUserId();

    try {
        const response = await fetch(`${GET_ROOMS_FOR_USER_URL}?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Tagastame vastuse JSON formaadis
        return await response.json();

    } catch (error) {
        // Kui päringu tegemisel tekib viga, logime vea sõnumi konsooli
        console.error('Viga GET päringu tegemisel:', error);
        throw error;
    }
}

// TESTIMISEKS!!! EEMALDA KUI TÖÖ ON VALMIS!!!
async function doStuff() {
    console.log("------------------------------------------------");
    
    const randomRoomId = generateRandomId(5);
    let ret1 = await createRoom(randomRoomId)
    if (ret1.error != null) {
        console.log("Error in room creation!", ret1.error)
        return
    }

    console.log("Created room with id:", randomRoomId)

    let randomText = generateRandomId(16)
    let ret2 = await saveRoom(randomRoomId, randomText)
    if (ret2.error != null) {
        console.log("Error in room text saving!", ret2.error)
        return
    }

    console.log("Set room id:", randomRoomId, "text to:", randomText)
    
    let ret3 = await getAllMyRooms();
    if (ret3.error != null) {
        console.log("Error in getting room IDs for current user!", ret3.error)
        return
    }

    console.log("Maksimum arv tubasi mis saab iga kasutaja luua:", ret3.maxRoomsPerUser)
    console.log("Kui palju tubasi ma saan veel luua:", ret3.maxRoomsPerUser - ret3.roomIds.length)
    console.log("Kui palju tubasi on mul loodud:", ret3.roomIds.length)

    // Selline meetod ei tohiks kunagi olla productionis, liiga palju requeste.
    for (const roomId of ret3.roomIds) {
        let roomData = await getRoomText(roomId)
        console.log(roomId, "Room text:", roomData.text)
    }
}

// doStuff();


// Siitmaalt algab Urmase lisatud nuppude ja funktsioonide sidumine

async function generateRoomBtn() {
    console.log('GenerateRoom nupp vajutatud')
    let textBox = document.getElementById("tekst")
    let boxContent = textBox.value
    if (boxContent == "") {
        alert("Konteiner ei saa olla tühi!")
        return
    }
    
    const randomRoomId = generateRandomId(5);
    let ret1 = await createRoom(randomRoomId)
    if (ret1.error != null) {
        console.log("Error in room creation!", ret1.error)
        return
    }

    console.log("Created room with id:", randomRoomId)

    console.log("Toa sisu on:", boxContent)
    let ret2 = await saveRoom(randomRoomId, boxContent)
    if (ret2.error != null) {
        console.log("Error in room text saving!", ret2.error)
        return
    }

    console.log("Set room id:", randomRoomId, "text to:", boxContent)
    
    let codeBox = document.getElementById("kood")
    codeBox.textContent = randomRoomId

    updateDOM()
}

function saveRoomBtn(roomid) {
    saveRoom(roomid, document.getElementById(roomid).value)
}

async function updateDOM() {
    pastadekonteiner = document.getElementById("konteinerid")
    pastadekonteiner.innerHTML = ""

    async function addDOMcategory(roomID) {
        let roomText = document.createElement("input")
        let roomCode = document.createElement("p")
        let saveBtn = document.createElement("button")

        roomTextQuery = await getRoomText(roomID)
        roomText.value = roomTextQuery.text
        roomText.id = roomID
        roomCode.textContent = roomID
        saveBtn.textContent = "Salvesta"

        pastadekonteiner.appendChild(roomCode)
        pastadekonteiner.appendChild(roomText)
        saveBtn.onclick = saveRoomBtn(roomID)
        pastadekonteiner.appendChild(saveBtn)
    }

    let myRooms = await getAllMyRooms();
    if (myRooms.error != null) {
        console.log("Error in getting room IDs for current user!", myRooms.error)
        return
    }

    for (let i = 0; i < myRooms.roomIds.length; i++) {
        console.log(myRooms.roomIds[i])
        addDOMcategory(myRooms.roomIds[i])
    }
}

updateDOM();