const BASE_URL = 'http://209.38.179.239:3001';
const CREATE_ROOM_URL = `${BASE_URL}/room`;
const SAVE_ROOM_URL = `${BASE_URL}/room`;
const GET_ROOM_URL = `${BASE_URL}/room`;
const GET_ROOMS_FOR_USER_URL = `${BASE_URL}/rooms`;

function generateRandomId(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function getUserId() {
    // FOR TESTING, WILL RENEW USER ID
    //localStorage.removeItem('userId');

    let userId = localStorage.getItem('userId');

    if (!userId) {
        userId = generateRandomId(26);
        localStorage.setItem('userId', userId);
    }

    return userId;
}

/*
    Creates a room by.

    Success Response:
    {
        "error": null
    }

    Error Response:
    {
        "error": "Error message"
    }
*/
async function createRoom(roomId) {
    const userId = getUserId();
    const payload = { userId, roomId };

    try {
        const response = await fetch(CREATE_ROOM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        return await response.json();

    } catch (error) {
        console.error('Error sending POST request:', error);
        throw error;
    }
}

/*
    Updates the text of a room.

    Success Response:
    {
        "error": null
    }

    Error Response:
    {
        "error": "Error message"
    }
*/
async function saveRoom(roomId, text) {
    const userId = getUserId();

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

        return await response.json();

    } catch (error) {
        console.error('Error sending PATCH request:', error);
        throw error;
    }
}

/*
    Fetches the text of a specific room by its ID.

    Success Response:
    {
        "error": null
        "text": "This is the text of the room"
    }

    Error Response:
    {
        "error": "Error message"
        "text": null
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

        return await response.json();

    } catch (error) {
        console.error('Error sending GET request:', error);
        throw error;
    }
}

/*
    Fetches a list of room IDs for the current user ID.
 
    Success Response:
    {
        "error": null
    }

    Error Response:
    {
        "error": "Error message"
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

        return await response.json();

    } catch (error) {
        console.error('Error sending GET request:', error);
        throw error;
    }
}

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

    // This should not enter production, too many requests per second.
    for (const roomId of ret3.roomIds) {
        let roomData = await getRoomText(roomId)
        console.log(roomId, "Room text:", roomData.text)
    }
}

// doStuff();