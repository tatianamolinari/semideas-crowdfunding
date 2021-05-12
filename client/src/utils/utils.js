function fromIntToStatus(number) {
    //enum Status { CREATED, APPROVED, DISAPPROVED, ACTIVE, DESTROYED }
    var status = "";
    switch (number) {
        case 0:
            status = "Created";
            break;
        case 1:
            status = "Approved";
            break;
        case 2:
            status = "Disapproved";
            break;
        case 3:
            status = "Active";
            break;
        case 4:
            status = "Destroyed";
        default:
            console.log("Invalid Status");
            break;
    }

    return status;
}

function fromSolidity2String(bytes32) {
    return bytes32toString(web3.toAscii(bytes32));
}

function bytes32toString(toParse) {
    return toParse.slice(0, toParse.indexOf("\u0000"));
}


export { fromIntToStatus };