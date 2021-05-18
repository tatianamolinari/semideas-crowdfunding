import React from "react";
import { Row, Col, Badge } from "react-bootstrap";
import { fromStatusToBadgeClass } from "../utils/utils.js"

class DisplayContent extends React.Component {
  render() {
    const badge_status = fromStatusToBadgeClass(this.props.data.status);
    const descripcion = "Esta descripcion es mockeada porque todavía no agregamos el resto de los datos a IPFS. \n La idea es que se vea de una manera linda, ordenada, y que si es largo se pueda hacer scroll. Por ahora esta esto para mostrar y pongo fotos de gatitos porque me encantan."
    return (<Col className="display-content" lg={9}>
              <div className="campaign-info">            
                <h3 className="name"> Titulo de la campaña </h3>
                <Row className="image-detail-container">
                  <Col lg={4}> <img src="/images/prueba/prueba1.jpg" className="photos" /> </Col>
                  <Col lg={4}> <img src="/images/prueba/prueba2.jpg" className="photos" /> </Col>
                  <Col lg={4}> <img src="/images/prueba/prueba3.jpg" className="photos" /> </Col>
                </Row>
                <h5> Estado: <Badge variant={badge_status}> { this.props.data.status } </Badge> </h5>
                <p className="description"> {descripcion} </p>
                <div> La contribución mínima es de { this.props.data.minimunContribution } wei</div> 
                <div> Autor: { this.props.data.owner } </div>  
                <div> Para que esta campaña comience se deben recaudar { this.props.data.goal } wei o más. </div> 
                <div> Cantidad de miembros contribuyentes: { this.props.data.membersCount } </div>
              </div>  
            </Col>);
  }
}

export default DisplayContent;