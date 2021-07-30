import React from "react";
import CarrouselImages from "./CarrouselImages"
import { Col, Row } from "react-bootstrap";


class ProgressUpdateDetail extends React.Component {

  render() {
    return (  <div className="proposal-detail">            
                <h3 className="title" data-testid="titulo"> {this.props.title} </h3>
                <p className="aling-right"> Fecha de creación <span data-testid="fecha_creacion">{this.props.progress_update_date}</span></p>
                <Row>
                <div>
                { this.props.images.length > 0 &&
                  <Col lg={5} className="image-container-left" data-testid="images">
                    <CarrouselImages images={this.props.images}/>
                  </Col>
                }
                  <p className="description pull-left" data-testid="descripcion"> {this.props.description} </p>
                </div>
                </Row>
              </div>);
  }
}

export default ProgressUpdateDetail;