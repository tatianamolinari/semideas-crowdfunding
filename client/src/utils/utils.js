function fromIntToStatus(string_number) {
    //enum Status { CREATED, APPROVED, DISAPPROVED, ACTIVE, DESTROYED }
    var status = "";
    switch (string_number) {
        case '0':
            status = "Created";
            break;
        case '1':
            status = "Approved";
            break;
        case '2':
            status = "Disapproved";
            break;
        case '3':
            status = "Active";
            break;
        case '4':
            status = "Destroyed";
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
        case 'Created':
            badge_class = "primary";
            break;
        case 'Approved':
            badge_class = "success";
            break;
        case 'Disapproved':
            badge_class = "secondary";
            break;
        case 'Active':
            badge_class = "info";
            break;
        case 'Destroyed':
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