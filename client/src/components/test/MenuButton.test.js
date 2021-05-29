import React from "react";
import {render, within, fireEvent} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';


import MenuButton from "../buttons/MenuButton";


it("Check correct render of values passed as params", () => {

    const { getByTestId } = render(<MenuButton 
                                        disabledValue={true}
                                        changeActive={() => {
                                        this.change_active("general_data");
                                        }}
                                        idName="id_name"
                                        classLi="class_li"
                                        textButton="Button test text"
                                    />)

    const { getByText } = within(getByTestId('textButton'));
    expect(getByText('Button test text')).toBeInTheDocument();
});

it("Check if button is disablend when pass 'true' as disabledValue", () => {

    const { getByTestId } = render(<MenuButton 
                                        disabledValue={true}
                                        changeActive={() => {
                                        this.change_active("general_data");
                                        }}
                                        idName="id_name"
                                        classLi="class_li"
                                        textButton="Button test text"
                                    />);

    expect(getByTestId('button')).toBeDisabled();

});

it("Check if button is disablend when pass 'false' as disabledValue", () => {

    const { getByTestId } = render(<MenuButton 
                                        disabledValue={false}
                                        changeActive={() => {
                                        this.change_active("general_data");
                                        }}
                                        idName="id_name"
                                        classLi="class_li"
                                        textButton="Button test text"
                                    />);

    expect(getByTestId('button')).not.toBeDisabled();

});

