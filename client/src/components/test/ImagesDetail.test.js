import React from "react";
import {render, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';


import ImagesDetail from "../campaign/ImagesDetail";


it("Check ImagesDetail only render 3 images", () => {

    const { queryAllByTestId } =  render( <ImagesDetail images= {["image1","image2","image3","image4"]}/>);
    expect(queryAllByTestId('campaign-photo').length).toEqual(3);

});

it("Check ImagesDetail only render all images if are less than 3", () => {

    const { queryAllByTestId } =  render( <ImagesDetail images= {[,"image3","image4"]}/>);
    expect(queryAllByTestId('campaign-photo').length).toEqual(2);

});
