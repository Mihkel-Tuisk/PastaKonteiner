### Kui on viga sqlite-iga (invalid ELF header), siis kasuta neid käske backendi kaustas:

```bash
rm -rf node_modules
npm install
```

Viga näeb selline välja:

```text
root@PastaKonteiner:/var/www/PastaKonteiner/backend# node index.js
/var/www/PastaKonteiner/backend/node_modules/bindings/bindings.js:121
        throw e;
        ^

Error: /var/www/PastaKonteiner/backend/node_modules/sqlite3/build/Release/node_sqlite3.node: invalid ELF header
    at Module._extensions..node (node:internal/modules/cjs/loader:1454:18)
    at Module.load (node:internal/modules/cjs/loader:1208:32)
    at Module._load (node:internal/modules/cjs/loader:1024:12)
    at Module.require (node:internal/modules/cjs/loader:1233:19)
    at require (node:internal/modules/helpers:179:18)
    at bindings (/var/www/PastaKonteiner/backend/node_modules/bindings/bindings.js:112:48)
    at Object.<anonymous> (/var/www/PastaKonteiner/backend/node_modules/sqlite3/lib/sqlite3-binding.js:1:37)
    at Module._compile (node:internal/modules/cjs/loader:1358:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1416:10)
    at Module.load (node:internal/modules/cjs/loader:1208:32) {
  code: 'ERR_DLOPEN_FAILED'
}

Node.js v20.16.0
```