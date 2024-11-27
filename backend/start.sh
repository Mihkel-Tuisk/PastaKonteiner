#!/bin/bash

# Kontrolli, kas screen seanss on juba käimas
if screen -list | grep -q "pasta-nodejs-server"; then
    # Kui server on juba käimas, kuvame teadet
    echo "Server töötab juba screen seansis."
else
    # Kui server ei ole käimas, alustame uut screen seanssi ja käivitame Node.js serveri
    screen -dmS pasta-nodejs-server node /var/www/PastaKonteiner/backend/index.js
    # Kuvame teadet, et server on käivitatud
    echo "Node.js server käivitati screen seansis 'pasta-nodejs-server'."
fi