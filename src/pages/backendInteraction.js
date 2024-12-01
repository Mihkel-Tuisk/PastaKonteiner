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
const GET_ROOMS_MAX_CHAR_LIMIT = `${BASE_URL}/max-text-length`;

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
    Funktsioon, mis tagastab maksimum tähemärkide arvu ühes konteineris

    Edukas vastus:
    {
        "maxLength": 5000 // Maksimum arv tähemärke
    }

    Vigane vastus:
    FETCH VISKAB ERRORI!
*/
async function getMaxCharactersForRooms() {
    try {
        const response = await fetch(GET_ROOMS_MAX_CHAR_LIMIT, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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
    try {
        const response = await fetch(`${GET_ROOM_URL}/${roomId}`, {
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