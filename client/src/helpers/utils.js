
const bs58 = require('bs58')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function fromIntToStatus(string_number) {
    //enum Status { CREATED, APPROVED, DISAPPROVED, ACTIVE, DESTROYED }
    let status = "";
    switch (string_number) {
        case '0':
            status = "Creada";
            break;
        case '1':
            status = "Aprobada";
            break;
        case '2':
            status = "Desaprobada";
            break;
        case '3':
            status = "Activa";
            break;
        case '4':
            status = "Cerrada";
            break;
        default:
            console.log("Invalid Status");
            console.log(string_number);
            break;
    }

    return status;
}

function fromStatusToBadgeClass(status) {
    let badge_class = "";
    switch (status) {
        case 'Creada':
            badge_class = "created";
            break;
        case 'Aprobada':
            badge_class = "success";
            break;
        case 'Desaprobada':
            badge_class = "secondary";
            break;
        case 'Activa':
            badge_class = "active";
            break;
        case 'Cerrada':
            badge_class = "danger";
            break;
        default:
            //console.log("Invalid Status");
            //console.log(status);
            break;
    }

    return badge_class;
}

function getValuesFromHash(hashmap) {
    const array_values = [];

    for (const key in hashmap) {
        array_values.push(hashmap[key]);
    }
    return array_values;
}

/*function fromSolidity2String(bytes32) {
    return bytes32toString(web3.toAscii(bytes32));
}

function bytes32toString(toParse) {
    return toParse.slice(0, toParse.indexOf("\u0000"));
}*/

function addressToHexBytes(address){
    const out = bs58.decode(address);
    const hexBytes = new Buffer(out).toString('hex');
    return hexBytes.substring(4);
}

function hexBytesToAddress(bytes){
    const out = bs58.encode(new Buffer("1220" + bytes, 'hex'));
    return out;
}

export { fromIntToStatus, fromStatusToBadgeClass, getValuesFromHash, sleep, addressToHexBytes, hexBytesToAddress };