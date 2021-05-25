import React from "react";
import { Carousel } from "react-bootstrap";

class CarrouselImages extends React.Component {

    

    render() {

    var itemsCarrousel = []
      for (const [index, image] of this.props.images.entries()) {
        itemsCarrousel.push(
            <Carousel.Item key={index}>
                <img
                data-testid="carousel-image"
                className="d-block w-100"
                src={image}
                alt="progressImage"
                />
                <Carousel.Caption>
                    <h3>Imagen {index+1}</h3>
                </Carousel.Caption>
            </Carousel.Item>
        )
    }
  
      return ( 
                <Carousel>
                    {itemsCarrousel}
                </Carousel>);
  }
}

export default CarrouselImages;