import React, {useState} from "react";
import { Modal, Col, Form } from "react-bootstrap";
import getWeb3 from "../../getWeb3";
import CrowdFundingCampaing from "../../contracts/CrowdFundingCampaing.json";


function ContributeModal(params) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('')

  const instance = params.instance;
  const minimunContribution = params.minimunContribution;
  const web3 = params.web3;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const contribuir = async () =>  {

    if (value >= minimunContribution){
 
      try {
        let accounts = await web3.eth.getAccounts();
        if(accounts.length===0)
        {
          console.log("Para contribuir debes haber iniciado sesión en la wallet de metamask.");
        }
        else {
          let gasprice = await web3.eth.getGasPrice();
          await instance.methods.contribute().send({ from: accounts[0], gas: gasprice, value: value })     
          .on('error', function(error){ 
          
            if (error["code"] === 4001)
            {
              console.log("Has denegado la acción a tráves de metamask. Para que este completa debes aceptarla.");
            }
          });
          console.log("aaaaaaaaaaa");
        }
      }
      catch(error)  {
        console.log("errorrrrr");
        console.log(error);
      }
    }
    else {

      console.log("no se puede")

    }
  }

  return (
    <div>
      <button 
      className="normal-button"
      onClick={handleShow}
      data-testid="cuntributionButton">
            Quiero contribuir
      </button>
      <Modal show={show} onHide={handleClose}
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
                    <Form.Control placeholder="Valor en wei" onChange={event => setValue(event.target.value)}/>
                    <Form.Text className="text-muted">
                    *el valor debe ser mayor al mínimo que es <span data-testid="minimunContribution">{minimunContribution}</span>.
                    </Form.Text>
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer className="footer-buttons">
            <Col lg={6} className="aling-left">
                <button 
                    className="normal-button" 
                    onClick={handleClose}>
                    Cerrar
                </button>
            </Col>
            <Col lg={6} className="aling-right">
                <button 
                    className="normal-button" 
                    onClick={contribuir}>
                    Contribuir
                </button>
            </Col>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ContributeModal;