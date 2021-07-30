import React from "react";
import { Row, Col } from "react-bootstrap";

class ImagesDetail extends React.Component {

  renderImages() {
    let i = 0;
    const images =  this.props.images.slice(0, 3).map(src_image => {
      i++;
      return (
        <Col key={i} lg={4}> <img data-testid="campaign-photo" src={src_image} alt="" className="photos" /> </Col>
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