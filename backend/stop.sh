#!/bin/bash

# Kontrolli, kas screen seanss on käimas
if screen -list | grep -q "pasta-nodejs-server"; then
    # Kui seanss on käimas, siis lõpetame selle
    screen -S pasta-nodejs-server -X quit
    # Kuvame teadet, et server on peatatud ja screen seanss on lõpetatud
    echo "Node.js server peatati ja screen seanss 'pasta-nodejs-server' lõpetati."
else
    # Kui sellist seanssi ei leita, kuvame teadet, et seanss puudub
    echo "Screen seanssi nimega 'pasta-nodejs-server' ei leitud."
fi