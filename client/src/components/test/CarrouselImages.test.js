import React from "react";
import {render, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';


import CarrouselImages from "../progressUpdates/CarrouselImages";


it("Check CarrouselImages render all the images example with 4", () => {

    const { queryAllByTestId } =  render( <CarrouselImages images= {["image1","image2","image3","image4"]}/>);
    expect(queryAllByTestId('carousel-image').length).toEqual(4);

});

it("Check CarrouselImages render all the images example with 2", () => {

    const { queryAllByTestId } =  render( <CarrouselImages images= {["image1","image2"]}/>);
    expect(queryAllByTestId('carousel-image').length).toEqual(2);

});


