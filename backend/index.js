/* 
    Backend süsteem, sealhulgas:
        - API lõpp-punktide loomine ja haldamine
        - Andmebaasi arhitektuuri projekteerimine ja ülesehitus
        - Andmebaasiga suhtlemine (SQL päringud, andmete salvestamine ja kustutamine)
        - Bash skriptide (start.sh, stop.sh, restartNginx.sh) loomine
        - jne

    Kõik on välja töötanud ja loonud Mihkel Tuisk.

    Kõik teenused on hostitud DigitalOcean platvormil (https://www.digitalocean.com/) ja 
    domeen on registreeritud ning SSL-sertifikaadiga kaitstud Name.com-i kaudu (https://www.name.com/).

    Teenuste tasuta saamiseks kasutasin GitHub Student Packi, mis on saadud registreerides oma GitHub konto aadressil
    https://education.github.com/pack
*/

// Määrame ruumide limiidi kasutaja kohta
const roomLimitPerUser = 20;
const port             = 3001;
const express          = require('express');
const bodyParser       = require('body-parser');
const cron             = require('node-cron');
const sqlite3          = require('sqlite3').verbose();
const fs               = require('fs');
const path             = require('path');
const cors             = require('cors');
const { promisify }    = require('util');

const app = express();

// Kasutame body-parserit, et töödelda sisenevaid JSON andmeid
app.use(bodyParser.json());

// Konfigureerime CORS, et lubada päringud erinevatelt domeenidelt
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PATCH'], 
    allowedHeaders: ['Content-Type']
}));

// Määrame andmebaasi kausta asukoha ja faili asukoha
const dbFolder = path.join(__dirname, 'db');
const dbPath   = path.join(dbFolder, 'rooms.db');

// Kontrollime, kas andmebaasi kaust juba eksisteerib
if (!fs.existsSync(dbFolder)) {
    // Kui ei eksisteeri, loome selle kausta (koos alamkaustadega)
    fs.mkdirSync(dbFolder, { recursive: true });
}

// Loome ühenduse SQLite andmebaasiga, kasutades määratud dbPath'i
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Viga SQLite andmebaasi avamisel:", err);
    } else {
        console.log("Ühendus SQLite andmebaasiga on loodud");
    }
});

// Loome promisify meetodi kaudu lubatud (promise'ga töötavad) versioonid sqlite3 meetoditest
const dbGet = promisify(db.get).bind(db);
const dbRun = promisify(db.run).bind(db);
const dbAll = promisify(db.all).bind(db);

// Kasutame db.serialize() funktsiooni, et käivitada andmebaasi päringud järjest
db.serialize(async () => {
    // Loome tabeli "rooms", kui seda veel ei ole
    await dbRun(`
        CREATE TABLE IF NOT EXISTS rooms (
            roomId TEXT PRIMARY KEY,
            creatorUserId TEXT NOT NULL,
            text TEXT,
            lastActivity INTEGER
        );
    `);
});

// Kustutab inaktiivsed ruumid andmebaasist
async function deleteInactiveRooms() {
    // Määrame lõpptähtaja, mille järgi inaktiivsed ruumid kustutada.

    // Testimiseks: eemalda toad, mis ei ole olnud aktiivsed viimase 10 sekundi jooksul
    // const cutoffTime = Date.now() - 10 * 1000;  // 10 sekundit tagasi

    // Tootmiskeskkonnas: eemalda toad, mis ei ole olnud aktiivsed viimase tunni jooksul
    const cutoffTime = Date.now() - 1 * 60 * 60 * 1000; // Üks tund tagasi

    try {
        // Kustutame kõik ruumid, mille aktiivsuse kuupäev (lastActivity) on vanem kui määratud lõpptähtaeg (cutoffTime)
        await dbRun(`DELETE FROM rooms WHERE lastActivity < ?`, [cutoffTime]);
    } catch (err) {
        // Kui tekib viga, logime vea sõnumi konsooli
        console.error('Viga inaktiivsete ruumide kustutamisel:', err);
    }
}

// Iga minut kutsutakse
// https://medium.com/@vaishnavihole1/cron-jobs-in-node-js-8666babf787b
cron.schedule('* * * * *', deleteInactiveRooms);

// Loob uue toa
app.post('/api/room', async (req, res) => {
    // Saame päringu kehas kasutaja ID ja ruumi ID
    const { roomId, userId } = req.body;

    // Kontrollime, kas mõlemad vajalikud väärtused on määratud
    if (!roomId || !userId) {
        return res.status(200).json({
            error: "Ruumi ID ja kasutaja ID on kohustuslikud!"
        });
    }

    try {
        // Kontrollime, kui palju ruume on juba kasutajal olemas
        const existingRooms = await dbAll('SELECT roomId FROM rooms WHERE creatorUserId = ?', [userId]);

        if (existingRooms.length >= roomLimitPerUser) {
            return res.status(200).json({
                error: `Kasutaja saab luua ainult kuni ${roomLimitPerUser} ruumi!`
            });
        }

        // Sisestame andmebaasi uue ruumi, millel on määratud ID, looja ID, tühi tekst ja aktiivsuse kuupäev
        await dbRun('INSERT INTO rooms (roomId, creatorUserId, text, lastActivity) VALUES (?, ?, ?, ?)', [roomId, userId, "", Date.now()]);

        // Kui ruum on edukalt loodud, tagastame vastuse ilma veata
        res.status(200).json({
            error: null,
        });

    } catch (err) {
        // Kui ilmneb viga, logime vea ja tagastame veateate
        console.error('Viga toa loomisel:', err);
        res.status(200).json({
            error: err.message
        });
    }
});


// Muudab toa teksti toa ID järgi
app.patch('/api/room/:roomId', async (req, res) => {
    // Saame päringu parameetrist ruumi ID ja päringu kehas kasutaja ID ning uue teksti
    const { roomId } = req.params;
    const { userId, text } = req.body;

    // Kui kasutaja ID või tekst puuduvad, tagastame veateate
    if (!userId || !text) {
        return res.status(200).json({
            error: "Kasutaja ID ja tekst on kohustuslikud!"
        });
    }

    try {
        // Otsime andmebaasist toad, mille ID vastab päringus antud roomId-le
        const room = await dbGet('SELECT * FROM rooms WHERE roomId = ?', [roomId]);

        // Kui ruumi ei leita, tagastame veateate
        if (!room) {
            return res.status(200).json({
                error: "Ruumi ei leitud!"
            });
        }

        // Kontrollime, kas kasutaja, kes tahab muuta ruumi, on ruumi looja
        if (room.creatorUserId !== userId) {
            return res.status(200).json({
                error: "Ainult ruumi looja saab muuta toa teksti!"
            });
        }

        // Värskendame toa teksti ja tegevuse kuupäeva
        const lastActivity = Date.now();
        await dbRun('UPDATE rooms SET text = ?, lastActivity = ? WHERE roomId = ?', [text, lastActivity, roomId]);

        // Tagastame edukalt täidetud päringu
        res.status(200).json({
            error: null,
        });

    } catch (err) {
        // Kui ilmneb viga, logime vea ja tagastame veateate
        console.error('Viga toa teksti muutmisel:', err);
        res.status(200).json({
            error: err.message
        });
    }
});

// Pärib konkreetse toa teksti selle toa ID järgi
app.get('/api/room/:roomId', async (req, res) => {
    // Saame päringu parameetrist ruumi ID ja kasutaja ID
    const { roomId } = req.params;
    const { userId } = req.query;

    // Kontrollime, kas kasutaja ID on määratud
    if (!userId) {
        return res.status(200).json({
            error: "Kasutaja ID on kohustuslik!",
            text: null
        });
    }

    // Kontrollime, kas ruumi ID on määratud
    if (!roomId) {
        return res.status(200).json({
            error: "Ruumi ID on kohustuslik!",
            text: null
        });
    }

    try {
        // Otsime andmebaasist ruumi, mille ID on määratud ja looja on antud kasutaja
        const room = await dbGet('SELECT * FROM rooms WHERE roomId = ? AND creatorUserId = ?', [roomId, userId]);

        // Kui ruumi ei leita, tagastame veateate
        if (!room) {
            return res.status(200).json({
                error: "Ruumi ei leitud või kasutaja ei ole selle ruumi looja!",
                text: null
            });
        }

        // Värskendame toa viimase tegevuse kuupäeva
        const lastActivity = Date.now();
        await dbRun('UPDATE rooms SET lastActivity = ? WHERE roomId = ?', [lastActivity, roomId]);

        // Tagastame ruumi teksti
        res.status(200).json({
            error: null,
            text: room.text
        });

    } catch (err) {
        // Kui ilmneb viga, logime vea ja tagastame veateate koos tühja tekstiga
        console.error('Viga ruumi teksti leidmisel:', err);
        res.status(200).json({
            error: err.message,
            text: null
        });
    }
});

// Teenindab päringud enda kasutaja ID poolt loodud tubade ID-de leidmiseks ja kui palju on maksimum tubade arv mis on võimalik luua ühel isikul
app.get('/api/rooms', async (req, res) => {
    // Saame päringu parameetrist userId (kasutaja ID)
    const { userId } = req.query;

    // Kui kasutaja ID ei ole määratud, tagastame veateate
    if (!userId) {
        return res.status(200).json({
            error: "Kasutaja ID on kohustuslik!",
            roomIds: null,
            maxRoomsPerUser: null
        });
    }

    try {
        // Otsime andmebaasist kõik ruumid, mille looja on antud kasutaja
        const rooms = await dbAll('SELECT roomId FROM rooms WHERE creatorUserId = ?', [userId]);

        // Kui kasutaja jaoks ei leita ühtegi tuba, tagastame veateate
        if (rooms.length === 0) {
            return res.status(200).json({
                error: "Kasutaja jaoks ei leitud ruume!",
                roomIds: null,
                maxRoomsPerUser: null
            });
        }

        // Kogume kõigi leitud tubade ID-d
        const roomIds = rooms.map(room => room.roomId);

        // Tagastame leitud toad
        res.status(200).json({
            error: null,
            roomIds: roomIds,
            maxRoomsPerUser: roomLimitPerUser
        });

    } catch (err) {
        // Kui tekkis viga, logime vea ja tagastame veateate koos ruumi ID-dega
        console.error('Viga tubade leidmisel:', err);
        res.status(200).json({
            error: err.message,
            roomIds: null,
            maxRoomsPerUser: null
        });
    }
});

app.listen(port, () => {
    console.log(`Server töötab pordil ${port}`);
});