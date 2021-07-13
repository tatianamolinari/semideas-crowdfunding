import React from "react";
import { Modal, Col, Form } from "react-bootstrap";
import { Button } from "semantic-ui-react";
import MessageModal from "../modals/MessageModal"

import { campaignService } from "../../services/campaignService.js"


class ClosePorposalModal extends React.Component {

  state = {
    show: false,
    cpTitle: '',
    cpDescription: '',
    showMessage: false,
    message: "",
    createCPLoading: this.props.createCPLoading
  };

  contribuir = async() =>  {
    if (true){
      try {
        const accounts = await campaignService.getAccounts();

        if(accounts.length===0)
        {
          const mssj = "Para crear un pedido debes haber iniciado sesión en la wallet de metamask.";
          this.setState({ showMessage: true, message: mssj});
          console.log(mssj);
        }
        else {

          this.setState({ createCPLoading: true});
          this.handleClose();

          campaignService.contribute(this.state.value).then((statusResponse) => {
            let title, message = "";

            if (statusResponse.error) {
              title = "Hubo un error al crear elpedido";
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

            this.setState({ createCPLoading: false, 
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
        loading={this.state.createCPLoading}
        className="normal-button no-margin"
        onClick={this.handleShow}
        data-testid="closeProposalButton">
              Crear pedido
        </Button>
        
        <Modal show={this.state.show} onHide={this.handleClose}
        data-testid="closeProposalModal"
        aria-labelledby="contained-modal-title-vcenter"
        centered>
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">Nuevo Pedido de cierre</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Form>
                  <Form.Group controlId="contributeBasicForm">
                      <Form.Label>Título</Form.Label>
                      <Form.Control placeholder="Titulo pedido de cierre" onChange={event => this.setState({ cpTitle: event.target.value})}/>
                      <Form.Text className="text-muted">
                      *.
                      </Form.Text>
                  </Form.Group>
                  <Form.Group controlId="contributeBasicForm">
                      <Form.Label>Descripción</Form.Label>
                      <Form.Control placeholder="Razón para cerrar la campaña" onChange={event => this.setState({ cpDescription: event.target.value})}/>
                      <Form.Text className="text-muted">
                      *.
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
                      data-testid="createCloseProposalButton">
                      Crear
                  </button>
              </Col>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default ClosePorposalModal;