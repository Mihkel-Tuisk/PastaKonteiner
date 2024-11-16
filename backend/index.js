const port          = 3001;
const express       = require('express');
const bodyParser    = require('body-parser');
const cron          = require('node-cron');
const sqlite3       = require('sqlite3').verbose();
const fs            = require('fs');
const path          = require('path');
const cors          = require('cors');
const { promisify } = require('util');

const app = express();

app.use(bodyParser.json());
app.use(cors({
    origin: 'https://pastakonteiner.live',  // or '*' for any origin (not recommended for production)
    methods: ['GET', 'POST', 'PATCH'],  // specify allowed methods
    allowedHeaders: ['Content-Type']  // specify allowed headers
}));

const dbFolder = path.join(__dirname, 'db');
const dbPath   = path.join(dbFolder, 'rooms.db');

if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening SQLite database:", err);
    } else {
        console.log("Connected to SQLite database");
    }
});

const dbGet = promisify(db.get).bind(db);
const dbRun = promisify(db.run).bind(db);
const dbAll = promisify(db.all).bind(db);

db.serialize(async () => {
    await dbRun(`
        CREATE TABLE IF NOT EXISTS rooms (
            roomId TEXT PRIMARY KEY,
            creatorUserId TEXT NOT NULL,
            text TEXT,
            lastActivity INTEGER
        );
    `);
});

async function deleteInactiveRooms() {
    // const cutoffTime = Date.now() - 10 * 1000;  // 10 seconds ago (for testing)
    const cutoffTime = Date.now() - 1 * 60 * 60 * 1000; // One hour ago (production)

    try {
        await dbRun(`DELETE FROM rooms WHERE lastActivity < ?`, [cutoffTime]);
    } catch (err) {
        console.error('Error deleting rooms:', err);
    }
}

// Schedule to run every minute
cron.schedule('* * * * *', deleteInactiveRooms);

app.post('/api/room', async (req, res) => {
    const { roomId, userId } = req.body;

    if (!roomId || !userId) {
        return res.status(200).json({
            error: "Room ID and User ID are required!"
        });
    }

    try {

        await dbRun('INSERT INTO rooms (roomId, creatorUserId, text, lastActivity) VALUES (?, ?, ?, ?)', [roomId, userId, "", Date.now()]);
        res.status(200).json({
            error: null,
        });

    } catch (err) {
        console.error('Error creating room:', err);
        res.status(200).json({
            error: err.message
        });
    }
});

app.patch('/api/room/:roomId', async (req, res) => {
    const { roomId } = req.params;
    const { userId, text } = req.body;

    if (!userId || !text) {
        return res.status(200).json({
            error: "User ID and Text are required!"
        });
    }

    try {
        const room = await dbGet('SELECT * FROM rooms WHERE roomId = ?', [roomId]);

        if (!room) {
            return res.status(200).json({
                error: "Room not found!"
            });
        }

        // Only the creator can edit the room text
        if (room.creatorUserId !== userId) {
            return res.status(200).json({
                error: "Only the creator can edit the room text!"
            });
        }

        // Update activity
        const lastActivity = Date.now();
        await dbRun('UPDATE rooms SET text = ?, lastActivity = ? WHERE roomId = ?', [text, lastActivity, roomId]);

        res.status(200).json({
            error: null,
        });

    } catch (err) {
        console.error('Error changing room text:', err);
        res.status(200).json({
            error: err.message
        });
    }
});

app.get('/api/room/:roomId', async (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.query;

    if (!userId) {
        return res.status(200).json({
            error: "User ID is required!",
            text: null
        });
    }

    try {
        const room = await dbGet('SELECT * FROM rooms WHERE roomId = ?', [roomId]);

        if (!room) {
            return res.status(200).json({
                error: "Room not found!",
                text: null
            });
        }

        // Update activity
        const lastActivity = Date.now();
        await dbRun('UPDATE rooms SET lastActivity = ? WHERE roomId = ?', [lastActivity, roomId]);

        res.status(200).json({
            error: null,
            text: room.text
        });

    } catch (err) {
        console.error('Error fetching room text:', err);
        res.status(200).json({
            error: err.message,
            text: null
        });
    }
});

app.get('/api/rooms', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(200).json({
            error: "User ID is required!",
            roomIds: null
        });
    }

    try {
        const rooms = await dbAll('SELECT roomId FROM rooms WHERE creatorUserId = ?', [userId]);

        if (rooms.length === 0) {
            return res.status(200).json({
                error: "No rooms found for this user!",
                roomIds: null
            });
        }

        const roomIds = rooms.map(room => room.roomId);

        res.status(200).json({
            error: null,
            roomIds: roomIds
        });

    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(200).json({
            error: err.message,
            roomIds: null
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
