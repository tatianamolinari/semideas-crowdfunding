import React from "react";
import { Row, Col } from "react-bootstrap";

class DisplayContent extends React.Component {
  render() {
    return (<Col className="display-content" lg={9}>
              <div className="campaign-info">            
                <h3 className="name"> Titulo de la campaña</h3>
                <Row className="image-detail-container">
                  <Col lg={4}> <img src="/images/prueba/prueba1.jpg" class="photos" /> </Col>
                  <Col lg={4}> <img src="/images/prueba/prueba2.jpg" class="photos" /> </Col>
                  <Col lg={4}> <img src="/images/prueba/prueba3.jpg" class="photos" /> </Col>
                </Row>
                <div> La contribución mínima es de { this.props.data.minimunContribution } wei</div> 
                <div> Autor: { this.props.data.owner } </div> 
                <div> Estado: { this.props.data.status } </div> 
                <div> Para que esta campaña comience se deben recaudar { this.props.data.goal } wei o más. </div> 
                <div> The membersCount is: { this.props.data.membersCount } </div>
              </div>  
            </Col>);
  }
}

export default DisplayContent;