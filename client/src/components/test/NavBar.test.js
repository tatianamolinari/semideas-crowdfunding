import React from "react";
import {render} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';


import NavBar from "../NavBar";


it("Check if logo is render", () => {

    const { getByTestId } =  render( <NavBar/>);
    expect(getByTestId('logoimage')).toBeInTheDocument();

});

