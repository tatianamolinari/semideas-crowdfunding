import React from "react";
import {render, within, fireEvent} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';


import ErrorMessage from "../errors/ErrorMessage";


it("Render error message with the text passed as param", () => {

    const { getByTestId } = render(<ErrorMessage error_msj="El error es este"/>)

    const { getByText } = within(getByTestId('error-msj'));
    expect(getByText('El error es este')).toBeInTheDocument();

});


