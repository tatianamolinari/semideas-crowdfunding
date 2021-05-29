import React from "react";
import { Message }  from 'semantic-ui-react';
import { Row } from "react-bootstrap";

class ErrorMessage extends React.Component {

  render() {

    
    return (

      <Row>
        <div className="title-error-msj">
          <Message negative>
            <Message.Header>Ha ocurrido un error al buscar los datos</Message.Header>
              <span data-testid="error-msj">{this.props.error_msj}</span>
            </Message>
        </div>
      </Row>
    );
  }
}

export default ErrorMessage;