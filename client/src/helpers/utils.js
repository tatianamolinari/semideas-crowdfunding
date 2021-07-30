
const bs58 = require('bs58');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// CampaignStatus { CREATED, ACTIVE, FAIL, SUCCESSFUL }
function fromIntToStatusCampaign(string_number) {
    let status = "";
    switch (string_number) {
        case '0':
            status = "Creada";
            break;
        case '1':
            status = "Activa";
            break;
        case '2':
            status = "Cerrada";
            break;
        case '3':
            status = "Exitosa";
            break;
        default:
            console.log("Invalid Status");
            console.log(string_number);
            break;
    }

    return status;
}

// ProposalStatus { ACTIVE, APPROVED, DISAPPROVED, SUCCESSFUL }
function fromIntToStatusProposal(string_number) {
    let status = "";
    switch (string_number) {
        case '0':
            status = "Activo";
            break;
        case '1':
            status = "Aprobado";
            break;
        case '2':
            status = "Desaprobado";
            break;
        case '3':
            status = "Exitoso";
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
        case 'Aprobado':
            badge_class = "success";
            break;
        case 'Exitosa':
        case 'Exitoso':
            badge_class = "success";
            break;
        case 'Desaprobada':
        case 'Desaprobado':
            badge_class = "danger";
            break;
        case 'Activa':
        case 'Activo':
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


function addressToHexBytes(address){
    const out = bs58.decode(address);
    const hexBytes = new Buffer(out).toString('hex');
    return hexBytes.substring(4);
}

function hexBytesToAddress(bytes){
    const out = bs58.encode(new Buffer("1220" + bytes, 'hex'));
    return out;
}

export { fromIntToStatusCampaign, fromIntToStatusProposal, fromStatusToBadgeClass, sleep, addressToHexBytes, hexBytesToAddress };