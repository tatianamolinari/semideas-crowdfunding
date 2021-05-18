function fromIntToStatus(string_number) {
    //enum Status { CREATED, APPROVED, DISAPPROVED, ACTIVE, DESTROYED }
    var status = "";
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
    //enum Status { CREATED, APPROVED, DISAPPROVED, ACTIVE, DESTROYED }
    var badge_class = "";
    switch (status) {
        case 'Creada':
            badge_class = "primary";
            break;
        case 'Aprobada':
            badge_class = "success";
            break;
        case 'Desaprobada':
            badge_class = "secondary";
            break;
        case 'Activa':
            badge_class = "info";
            break;
        case 'Cerrada':
            badge_class = "danger";
            break;
        default:
            console.log("Invalid Status");
            console.log(status);
            break;
    }

    return badge_class;
}

/*function fromSolidity2String(bytes32) {
    return bytes32toString(web3.toAscii(bytes32));
}

function bytes32toString(toParse) {
    return toParse.slice(0, toParse.indexOf("\u0000"));
}*/


export { fromIntToStatus, fromStatusToBadgeClass };