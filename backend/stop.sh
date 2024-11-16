#!/bin/bash

# Check if the screen session is running
if screen -list | grep -q "nodejs-server"; then
    # Kill the screen session
    screen -S nodejs-server -X quit
    echo "Node.js server stopped and screen session 'nodejs-server' killed."
else
    echo "No running screen session named 'nodejs-server' found."
fi
