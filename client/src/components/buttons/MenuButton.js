import React from "react";

class MenuButton extends React.Component {

  render() {

    return (

        <button 
            data-testid="button"
            className="invisible_button"
            disabled={this.props.disabledValue}
            onClick={this.props.changeActive}
        >
          <li id={this.props.idName} className={this.props.classLi} data-testid="textButton">
            {this.props.textButton}
          </li>
        </button>
    );
  }
}

export default MenuButton;