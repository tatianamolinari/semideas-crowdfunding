import React from "react";
import {render, within, fireEvent} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

import CardProposal from "../proposals/CardProposal"

let getByTestId;

beforeEach(() => {
    ({ getByTestId } =  render(<CardProposal 
                                    title="Titulo proposal"
                                    description="Una descripcion de la proposal que tenga mas que 250 caracteres para poder verificar que lo corte en esa canitdad solo para mostrar. No puede estar todo este texto como descripción si no solamente los primeros 250 caracteres por eso la estoy haciendo larga. Al finnnnnnnn."
                                    proposal_date="05/05/2021"
                                />));
});

it("Check CardProposal title render", () => {

    const { getByText } = within(getByTestId('title'));
    expect(getByText('Titulo proposal')).toBeInTheDocument();


});

it("Check CardProposal description render", () => {

    const { getByText } = within(getByTestId('description'));
    const desc = "Una descripcion de la proposal que tenga mas que 250 caracteres para poder verificar que lo corte en esa canitdad solo para mostrar. No puede estar todo este texto como descripción si no solamente los primeros 250 caracteres por eso la estoy haciendo larga. Al finnnnnnnn.".substring(0,250)+"..."
    expect(getByText(desc)).toBeInTheDocument();

});

it("Check CardProposal date render", () => {

    const { getByText } = within(getByTestId('proposal_date'));
    expect(getByText(/05\/05\/2021/i)).toBeInTheDocument();

});

