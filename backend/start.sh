#!/bin/bash

# Check if the screen session is already running
if screen -list | grep -q "nodejs-server"; then
    echo "Server is already running in a screen session."
else
    # Start a new screen session and run Node.js in it
    screen -dmS nodejs-server node /var/www/PastaKonteiner/backend/index.js
    echo "Node.js server started in screen session 'nodejs-server'."
fi
