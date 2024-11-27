#!/bin/bash

# Kontrollime, kas 'systemctl' käsk on saadaval
if command -v systemctl &> /dev/null; then
    # Kui systemctl on saadaval, kasutame seda Nginxi taaskäivitamiseks
    echo "Leiti systemd, taaskäivitame Nginxi kasutades systemctl..."
    sudo systemctl restart nginx
# Kui 'systemctl' ei ole saadaval, kontrollime, kas 'service' käsk on saadaval
elif command -v service &> /dev/null; then
    # Kui service on saadaval, kasutame seda Nginxi taaskäivitamiseks
    echo "Leiti init.d teenus, taaskäivitame Nginxi kasutades service..."
    sudo service nginx restart
else
    # Kui ei leita kumbagi käsku, kuvame vea ja väljutame skripti
    echo "Viga: Ühtegi käsku 'systemctl' ega 'service' ei leitud. Nginxi taaskäivitamine ebaõnnestus."
    exit 1
fi

# Kuvame sõnumi, et Nginx on edukalt taaskäivitatud
echo "Nginx on edukalt taaskäivitatud."