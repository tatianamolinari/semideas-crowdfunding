import React from "react";
import {render, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';


var enzyme = require('enzyme');
var Adapter = require('enzyme-adapter-react-16');
enzyme.configure({ adapter: new Adapter() });

import {shallow} from 'enzyme';
import ItemProgressUpdates from "../progressUpdates/ItemProgressUpdates";

let getByTestId;
const desc = "Una descripcion de la progress update proposal que tenga mas que 200 caracteres para poder verificar que lo corte en esa canitdad solo para mostrar. No puede estar todo este texto como descripción si no solamente los primeros 200 caracteres por eso la estoy haciendo larga. Al finnnnnnnn.";
const title = "Item progress update";
const progress_date = "11/02/2022";

beforeEach(() => {
  ({ getByTestId } =  render(<ItemProgressUpdates
                                    key={1}
                                    title={title}
                                    description={desc}
                                    progress_update_date={progress_date}
                                    onClick={() => {  }}
                                />));
});

it("Check item progress update title render", () => {

    const { getByText } = within(getByTestId('title'));
    expect(getByText(title)).toBeInTheDocument();


});


it("Check item progress update description render", () => {

    const { getByText } = within(getByTestId('description'));
    expect(getByText(desc.substring(0,200)+"...")).toBeInTheDocument();


});

it("Check item progress update date render", () => {

    const { getByText } = within(getByTestId('progress_date'));
    expect(getByText(progress_date)).toBeInTheDocument();


});


test('props.onClick is called when div is clicked', () =>{
    const fn = jest.fn();
    let item = shallow(<ItemProgressUpdates
                        key={1}
                        title={title}
                        description={desc}
                        progress_update_date={progress_date}
                        onClick={fn}
                    />);

    item.find('.div-clickleable').simulate('click');;
    expect(fn.mock.calls.length).toBe(1);
  });