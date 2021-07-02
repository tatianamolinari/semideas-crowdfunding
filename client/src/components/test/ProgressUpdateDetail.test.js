import React from "react";
import {render, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';


import ProgressUpdateDetail from "../progressUpdates/ProgressUpdateDetail";

let getByTestId;

beforeEach(() => {
  ({ getByTestId } =  render(<ProgressUpdateDetail
                                title="Progress update title"
                                description="Descripcion mockeada para test"
                                progress_update_date="19/12/2021"
                                images={["imagen1", "imagen2", "imagen3"]} />));
});

it("Check ProgressUpdateDetail title render", () => {

    const { getByText } = within(getByTestId('titulo'));
    expect(getByText('Progress update title')).toBeInTheDocument();


});

it("Check ProgressUpdateDetail description render", () => {

    const { getByText } = within(getByTestId('descripcion'));
    expect(getByText('Descripcion mockeada para test')).toBeInTheDocument();

});

it("Check ProgressUpdateDetail valor render", () => {

    const { getByText } = within(getByTestId('fecha_creacion'));
    expect(getByText('19/12/2021')).toBeInTheDocument();

});
