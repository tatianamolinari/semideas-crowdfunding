import React, {useState} from "react";
import { Modal, Col, Form } from "react-bootstrap";
import { Message, Button } from "semantic-ui-react";
import MessageModal from "../modals/MessageModal"
import CrowdFundingCampaing from "../../contracts/CrowdFundingCampaing.json";


class ContributeModal extends React.Component {

  state = {
    show: false,
    value: '',
    instance: this.props.instance,
    web3: this.props.web3,
    minimunContribution: this.props.minimunContribution,
    showMessage: false,
    message: "",
    contributeLoading: this.props.contributeLoading
  };

  contribuir = async() =>  {

    console.log(this.state)
    if (this.state.value >= this.state.minimunContribution){
      try {
        let accounts = await this.state.web3.eth.getAccounts();
        if(accounts.length===0)
        {
          const mssj = "Para contribuir debes haber iniciado sesión en la wallet de metamask.";
          this.setState({ showMessage: true, message: mssj});
          console.log(mssj);
        }
        else {

          let gasprice = await this.state.web3.eth.getGasPrice();
          let gas = await this.state.instance.methods.contribute().estimateGas({ from: accounts[0], value: this.state.value });

          let transaction = this.state.instance.methods.contribute().send({ from: accounts[0], gasPrice: gasprice, gas: gas, value: this.state.value }) ;    
          
          var component = this;

          transaction.on('error', function(error, receipt){ 
            
            if (error["code"] === 4001)
            {
              const msg = "Has denegado la acción a tráves de metamask. Para que este completa debes aceptarla.";
              component.setState({ message: msg, showMessage: true, title: "Hubo un error al contribuir"});
              console.log(msg);
            }
            else if (receipt.cumulativeGasUsed === receipt.gasUsed) {
              
              const msg = "Te quedaste sin gas"
              //component.setState({ message: msg, showMessage: true, title: "Hubo un error al contribuir"});
              console.log(msg);

              console.log(receipt.cumulativeGasUsed);
              console.log(receipt.gasUsed);
              
            }
            else {
              const msg = "error desconocido"
              //component.setState({ message: msg, showMessage: true, title: "Hubo un error al contribuir"});
              console.log(msg);
              console.log(error);

            }
          });

          transaction.on('receipt', receipt => {
            console.log('reciept', receipt);

            if(receipt.status === '0x1' || receipt.status === 1){
              console.log('Transaction Success')
          }
          else {
              console.log('Transaction Failed')
              }
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

        <MessageModal
        showMessage={this.state.showMessage}
        handleMessageClose={this.handleMessageClose}
        message={this.state.message}
        title={this.state.title} />
      
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
                      className="normal-button" 
                      onClick={this.handleClose}>
                      Cerrar
                  </button>
              </Col>
              <Col lg={6} className="aling-right">
                  <button
                      className="normal-button" 
                      onClick={this.contribuir}>
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