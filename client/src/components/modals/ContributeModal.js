import React from "react";
import { Modal, Col, Form } from "react-bootstrap";
import { Button } from "semantic-ui-react";
import MessageModal from "../modals/MessageModal"

import { campaignService } from "../../services/campaignService.js"


class ContributeModal extends React.Component {

  state = {
    show: false,
    value: '',
    minimunContribution: this.props.minimunContribution,
    showMessage: false,
    message: "",
    contributeLoading: this.props.contributeLoading
  };

  contribuir = async() =>  {
    if (parseInt(this.state.value) >= parseInt(this.state.minimunContribution)){
      try {
        const accounts = await campaignService.getAccounts();

        if(accounts.length===0)
        {
          const mssj = "Para contribuir debes haber iniciado sesión en la wallet de metamask.";
          this.setState({ showMessage: true, message: mssj});
          console.log(mssj);
        }
        else {

          this.setState({ contributeLoading: true});
          this.handleClose();

          campaignService.contribute(this.state.value).then((statusResponse) => {
            let title, message = "";

            if (statusResponse.error) {
              title = "Hubo un error al contribuir";
              switch (statusResponse.errorMsg) {
                case "Acción denegada":
                  message = "Has denegado la acción a tráves de metamask. Para que este completa debes aceptarla.";
                  break;
                case "Nonce error":
                  message = "Error de nonce: El nonce de la cuenta elegida y de la transacción son diferentes.";
                  break;
                case "Gas insuficiente":
                  message = "La operación llevó más gas que el que pusiste como límite.";
                  break;
                default: 
                  message = "Error desconocido";
                  break;
              }
            }
            else {
              title = "Bienvenido al proyecto";
              message = "¡La contribución que hiciste se ejecutó de manera exitosa!\n ¡Gracias por contribuir!"; 
            }

            this.setState({ contributeLoading: false, 
                            message: message, 
                            showMessage: true, 
                            title: title});
          });
        }
      }
      catch(error)  {
        console.log("Este error traspasó");
        console.log(error);
      }
    }
    else {
      console.log(this.state.value);
      console.log(this.state.minimunContribution);
      const msg = "La contribución debe ser mayor a la mínima";
      this.setState({ message: msg, showMessage:true});
    }
  }

  handleClose = () => this.setState({ show: false});
  handleShow = () => this.setState({ show: true});

  handleMessageClose = () => this.setState({ showMessage: false});


  render() {

    
    return (

      <div>

        { this.state.showMessage &&
        <MessageModal
        showMessage={this.state.showMessage}
        handleMessageClose={this.handleMessageClose}
        message={this.state.message}
        title={this.state.title} />
        }
      
        <Button
        loading={this.state.contributeLoading}
        className="normal-button"
        onClick={this.handleShow}
        data-testid="cuntributionButton">
              Quiero contribuir
        </Button>
        
        <Modal show={this.state.show} onHide={this.handleClose}
        data-testid="contributionModal"
        aria-labelledby="contained-modal-title-vcenter"
        centered>
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">Contribuir con la campaña</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Form>
                  <Form.Group controlId="contributeBasicForm">
                      <Form.Label>Contribuir con:</Form.Label>
                      <Form.Control placeholder="Valor en wei" onChange={event => this.setState({ value: event.target.value})}/>
                      <Form.Text className="text-muted">
                      *el valor debe ser mayor al mínimo que es <span data-testid="minimunContribution">{this.state.minimunContribution}</span>.
                      </Form.Text>
                  </Form.Group>
              </Form>
          </Modal.Body>
          <Modal.Footer className="footer-buttons">
              <Col lg={6} className="aling-left">
                  <button 
                      id="cerrar"
                      className="normal-button" 
                      onClick={this.handleClose}
                      data-testid="cancelButton">
                      Cerrar
                  </button>
              </Col>
              <Col lg={6} className="aling-right">
                  <button
                      className="normal-button" 
                      onClick={this.contribuir}
                      data-testid="aceptContributionButton">
                      Contribuir
                  </button>
              </Col>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default ContributeModal;