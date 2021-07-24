import React from "react";
import { Modal, Col, Form } from "react-bootstrap";
import { Button } from "semantic-ui-react";
import MessageModal from "../modals/MessageModal"

import { campaignService } from "../../services/campaignService.js"
import { ipfsService } from "../../services/ipfsService.js"

import { addressToHexBytes } from "../../helpers/utils.js"


class ClosePorposalModal extends React.Component {

  state = {
    show: false,
    cpTitle: '',
    cpDescription: '',
    showMessage: false,
    message: "",
    createCPLoading: this.props.createCPLoading
  };

  create = async() =>  {
    if (true){
      try {
        const accounts = await campaignService.getAccounts();

        if(accounts.length===0)
        {
          const mssj = "Para crear un pedido debes haber iniciado sesión en la wallet de metamask.";
          this.setState({ showMessage: true, message: mssj});
          console.log(mssj);
        }
        else if (this.state.cpTitle.length < "5" || this.state.cpTitle.length > "30") {

          this.setState({ createCPLoading: false, 
            message: "El título debe tener entre 5 y 30 caracteres.", 
            showMessage: true, 
            title: "Error"});
        }
        else if (this.state.cpDescription.length < "25" || this.state.cpDescription.length > "1000") {

          this.setState({ createCPLoading: false, 
            message: "La descripción debe tener entre 25 y 1000 caracteres.", 
            showMessage: true, 
            title: "Error"});
        }
        else {

          this.setState({ createCPLoading: true});
          this.handleClose();

          const dateToday = new Date().toLocaleDateString('en-GB'); 

          const json_value =  {
            "title": this.state.cpTitle, 
            "description": this.state.cpDescription ,
            "created_date": dateToday
          }

          const ipfsHash = await ipfsService.addJson(json_value)
          console.log(ipfsService.getIPFSUrlFromPath(ipfsHash));
          const bytes32Hash = "0x" + addressToHexBytes(ipfsHash);

          campaignService.createCloseProposal(bytes32Hash).then((statusResponse) => {
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
              title = "Creación exitosa";
              message = "¡Tu pedido de cierre fue creado correctamente!\n ¡Gracias por involucrarte con la campaña!"; 
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
        className="normal-button no-margin-top"
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
                      <Form.Control as="textarea" rows={5} placeholder="Razón para cerrar la campaña" onChange={event => this.setState({ cpDescription: event.target.value})}/>
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
                      onClick={this.create}
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