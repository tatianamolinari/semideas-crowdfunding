import React from "react";
import { Row, Col } from "react-bootstrap";

class ImagesDetail extends React.Component {

  renderImages() {
    const images =  this.props.images.slice(0, 3).map(src_image => {
      return (
        <Col lg={4}> <img src={src_image} className="photos" /> </Col>
      );
    });

    return images;
  }

  render() {
    

    return (  <Row className="image-detail-container">
                {this.renderImages()}
              </Row>);
  }
}

export default ImagesDetail;