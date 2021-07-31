
/**
 * Get a string campaign status from the enum contract number.
 * @param {String} string_number string enum from contract. 
 * @return {String} status.
 */
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
            break;
    }

    return status;
}

/**
 * Get a string proposal status from the enum contract number.
 * @param {String} string_number string enum from contract. 
 * @return {String} status.
 */
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
            break;
    }

    return status;
}

/**
 * Get the badge class to show the status from the a string status.
 * @param {String} status campaign or proposal status.. 
 * @return {String} badge css class.
 */
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
            break;
    }

    return badge_class;
}


export { fromIntToStatusCampaign, fromIntToStatusProposal, fromStatusToBadgeClass };