import React from "react";
import { Col, Badge } from "react-bootstrap";
import { fromStatusToBadgeClass } from "../utils/utils.js"

import ImagesDetail from "./ImagesDetail.js";

class DisplayContent extends React.Component {

  render() {
    const badge_status = fromStatusToBadgeClass(this.props.data.status);
    //const a = false;
    const images = ["/images/prueba/prueba1.jpg","/images/prueba/prueba2.jpg","/images/prueba/prueba3.jpg","/images/prueba/prueba4.jpg"]
    const descripcion = "Esta descripcion es mockeada porque todavía no agregamos el resto de los datos a IPFS. \n La idea es que se vea de una manera linda, ordenada, y que si es largo se pueda hacer scroll. Por ahora esta esto para mostrar y pongo fotos de gatitos porque me encantan."

    return (  <div className="campaign-info" id="general_data_container">            
                <h3 className="name"> Este titulo está mockeado </h3>
                <ImagesDetail images={images}/>
                <h5> Estado: <Badge variant={badge_status}> { this.props.data.status } </Badge> </h5>
                <p className="description"> {descripcion} </p>
                <hr/>
                <div> Para que esta campaña comience se deben recaudar { this.props.data.goal } wei o más. </div>
                <div> Contribuciones totales: { this.props.data.balance } wei. </div>
                <div> La contribución mínima es de { this.props.data.minimunContribution } wei.</div> 
                <div> Autor: { this.props.data.owner }. </div>   
                <div> Cantidad de miembros contribuyentes: { this.props.data.membersCount }. </div>
               
                { (!this.props.data.isMember) && (!this.props.data.isOwner)
                  &&  
                  <div className="contribute-row">
                     <button className="normal-button">Quiero contribuir</button>
                  </div> }

              </div>);
  }
}

export default DisplayContent;