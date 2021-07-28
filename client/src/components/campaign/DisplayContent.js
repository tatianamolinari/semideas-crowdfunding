import React from "react";
import { Badge } from "react-bootstrap";
import { Label, Icon, Button } from 'semantic-ui-react'
import ProgressBar from 'react-bootstrap/ProgressBar'

import { fromIntToStatusCampaign, fromStatusToBadgeClass } from "../../helpers/utils.js";
import { campaignService } from "../../services/campaignService.js"
import { ipfsService } from "../../services/ipfsService.js"

import ImagesDetail from "./ImagesDetail.js";
import ContributeModal from "../modals/ContributeModal"
import MessageModal from "../modals/MessageModal"


class DisplayContent extends React.Component {

  state = {
    active: this.props.active,
    
    isOwner: this.props.data.isOwner,
    isMember: this.props.data.isMember,
    balance: this.props.data.balance,
    membersCount: this.props.data.membersCount,
    status: this.props.data.status,
    goal: this.props.data.goal, 
    finalContributions: this.props.data.finalContributions, 
    remainingContributions: this.props.data.remainingContributions, 
    balance: this.props.data.balance,
    canWithdraw: false,

    rol: null,
    progress: 0,
    badge_status:'',

    loaded: false,
    changeTxLoading: false,

    showMessage: false,
    message: '',
    title: ''
  };

  actualizeBalanceInfo = async () => {
    const balance = await campaignService.getBalance();
    const progress = this.getProgress(this.props.data.goal,balance);
      
      this.setState({ balance: balance, 
                      progress: progress });
  }

  actualizeContributionInfo = async() =>  {

    try {
      const isMember = await campaignService.getMembership();
      const balance = await campaignService.getBalance();
      const membersCount = await campaignService.getMembersCount();

      this.actualizeRol(this.state.isOwner, isMember);

      const progress = this.getProgress(this.props.data.goal,balance);
      
      this.setState({ isMember: isMember, 
                      balance: balance, 
                      membersCount: membersCount,
                      progress: progress });
    }
    catch (error) {
      alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }

  actualizeWithdrawInfo = async() => {
    const balance = await campaignService.getBalance();
    const progress = this.getProgress(this.state.finalContributions,balance);
    this.setState({ balance: balance, 
                    progress: progress });
  }

  actualizeStatusInfo = async () =>  {

    try {
      const enum_status = await campaignService.getStatus();
      const status = fromIntToStatusCampaign(enum_status);
      const badge_status = fromStatusToBadgeClass(status);
      
      this.setState({ status: status, badge_status: badge_status });
    }
    catch (error) {
      alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }

  actualizeProgressInfo = () => {
    let progress;
    if (this.state.status !== 'Creada') { 
      progress = this.getProgress(this.state.finalContributions,this.state.balance); 

    } else {
      progress = this.getProgress(this.state.goal, this.state.balance);
    }

    this.setState({ progress: progress });
  }
  
  actualizeRol = (isOwner,isMember) =>
  {
    if (isOwner){
      this.setState({ rol: "Eres el owner" });
    }
    else if (isMember) {
      this.setState({ rol: "Eres miembro" });
    }
  }

  activeCampaign = async() =>  {
   
      try {
        const accounts = await campaignService.getAccounts();

        if(accounts.length===0)
        {
          const mssj = "Para activar la campaña debes haber iniciado sesión en la wallet de metamask.";
          this.setState({ showMessage: true, message: mssj});
          console.log(mssj);
        }
        else {

          this.setState({ changeTxLoading: true});

          campaignService.setActive().then((statusResponse) => {
            let title, message = "";

            if (statusResponse.error) {
              title = "Hubo un error al activar la campaña";
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
              title = "Activación exitosa";
              message = "¡La campaña ahora está activa!\n Ya puedes subir novedades del proyecto y pedidos de presupuesto."; 
              
            }

            this.setState({ changeTxLoading: false, 
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

  withdraw = async() =>  {
    try {
      const accounts = await campaignService.getAccounts();

      if(accounts.length===0)
      {
        const mssj = "Para retirar fondos debes haber iniciado sesión en la wallet de metamask.";
        this.setState({ showMessage: true, message: mssj});
        console.log(mssj);
      }
      else {

        this.setState({ changeTxLoading: true});

        campaignService.withdraw().then((statusResponse, receipt) => {

          let title, message = "";

          if (statusResponse.error) {
            title = "Hubo un error al retirar fondos";
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

            const returnValues = statusResponse.res.events.WithdrawFounds.returnValues;
            
            const contribution = returnValues.contribution;
            const finalContributions = returnValues.finalContributions;
            const remainingContributions = returnValues.remainingContributions;
            const payment = returnValues.payment;

            title = "Retiro de fondos exitoso";
            message = `¡Ya has recibido tus fondos en tu cuenta!\n 
                      Como contribuiste con ${contribution} wei, el total de contribuciones fue ${finalContributions} wei y el sobrante fue ${remainingContributions} wei se te han transferido ${payment} wei.
                      Gracias por haber participado de esta campaña.`; 
            this.setState({ canWithdraw: false});
          }

          this.setState({ changeTxLoading: false, 
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

  handleMessageClose = () => this.setState({ showMessage: false});


  componentDidMount = async() => {

    this.actualizeProgressInfo();

    const badge_status = fromStatusToBadgeClass(this.state.status);
    this.setState({ badge_status: badge_status });

    this.actualizeRol(this.state.isOwner, this.state.isMember);

    let canWithdraw = false;

    if (this.state.status === "Cerrada" || this.state.status === "Exitosa")
    {
      console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
      const hasWithdraw = await campaignService.hasWithdraw(); 
      canWithdraw = !hasWithdraw;
      console.log(hasWithdraw)
      console.log(canWithdraw)
    }

    this.setState( { canWithdraw: canWithdraw } );
    
    const actualizeInfo = async() => {this.actualizeContributionInfo()};
    await campaignService.suscribeToNewContribution(actualizeInfo);
    const actualizeBalanceInfo = async() => {this.actualizeBalanceInfo()};
    await campaignService.suscribeToProposalRelease(actualizeBalanceInfo);
    const actualizeWithdrawInfo = async() => {this.actualizeWithdrawInfo()};
    await campaignService.suscribeToWithdraw(actualizeWithdrawInfo);
  }

  async componentDidUpdate(prevProps) {
    if(this.props.data.status !== prevProps.data.status)
    {
      this.actualizeStatusInfo();
      const balancesInfo = await campaignService.getBalancesInfo();
      this.setState({ goal: balancesInfo.goal, 
                      finalContributions: balancesInfo.finalContributions, 
                      remainingContributions: balancesInfo.remainingContributions, 
                      balance: balancesInfo.actualBalance });
      this.actualizeProgressInfo();
    }
  }

  getProgress(total,portion) {

    const progress = (((parseInt(portion)/parseInt(total)))* 100).toFixed(2);
    return Math.min(progress,100);
  }


  render() {

    let images = ["/images/prueba/prueba1.jpg","/images/prueba/prueba2.jpg","/images/prueba/prueba3.jpg","/images/prueba/prueba4.jpg"]
    let descripcion = "Lorem ipsum dolor sit amet consectetur adipiscing elit quis, condimentum odio class etiam justo euismod orci, lobortis cras aptent mauris nullam semper senectus. Etiam ligula malesuada sapien magna tincidunt scelerisque ridiculus vel, aenean aliquam arcu eget facilisis placerat cubilia nibh purus, eleifend mi sociis ad vitae nam tempor. Imperdiet arcu parturient libero suscipit accumsan erat convallis velit metus bibendum taciti, auctor neque felis per augue in maecenas vulputate enim. Montes senectus urna eros accumsan lobortis cras ante convallis lacus, volutpat ullamcorper platea fermentum morbi class hac laoreet pretium sagittis, luctus cursus pellentesque interdum sed nullam porta est. Morbi mattis tincidunt ligula ad blandit per varius vulputate lobortis, nam curae urna netus bibendum a non aenean, consequat ut nascetur mi viverra lectus ultrices dis. A magnis molestie ultrices suscipit euismod litora fames volutpat erat vehicula venenatis mattis neque nam interdum, tincidunt orci condimentum augue natoque magna libero arcu dui taciti mus sed hendrerit class."
    let created_at = "10/03/2021"
    let title = "Este titulo está mockeado"

    if (this.props.ipfsData) {
      images = this.props.ipfsData.images.map(path =>  ipfsService.getIPFSUrlFromPath(path));

      descripcion = this.props.ipfsData.description
      created_at = this.props.ipfsData.created_date
      title = this.props.ipfsData.title
    }
    
    
    return (  <div className="campaign-info" id="general_data_container"> 
                <h3 className="name"> {title} 
                  <span className="c_index_info"> ({this.props.data.c_index }) </span>
                  { (this.state.rol) && 
                  <Label color="teal">
                    <span data-testid="rol">
                      { this.state.rol }
                    </span>
                  </Label>
                  }
                </h3> 
                <p className="aling-right"> Fecha de creación {created_at}</p>
                <ImagesDetail images={images}/>
                <h5> Estado: <Badge variant={this.state.badge_status}> { this.state.status } </Badge> </h5>
                <div className="main-info-campaign">
                  <div>
                    <Icon fitted name='user circle'/> &nbsp;Owner:&nbsp; 
                    <a href={`https://etherscan.io/address/${this.props.data.owner}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       data-testid="owner">
                        { this.props.data.owner }
                    </a>. 
                  </div>   
                  <div>  <Icon fitted name='group' /> Cantidad de miembros: <span data-testid="membersCount">{ this.state.membersCount }</span>. </div>
                </div>
                
                <p className="description"> {descripcion} </p>
                <hr/>
                
                <h5> Contribuciones </h5>
                { this.state.status==="Creada" ?
                  <div> Para que esta campaña comience se deben recaudar <Label color="green"> <span data-testid="goal">{ this.state.goal }</span> wei </Label> o más. </div> :
                  <div> Para poder comenzar esta campaña debía recaudar al menos <Label color="green"> <span data-testid="goal">{ this.state.goal }</span> wei </Label> y recaudó <Label color="green"> <span data-testid="finalContributions">{ this.state.finalContributions }</span> wei </Label> . </div>
                }
                <div> La contribución mínima { this.state.status==="Creada" ? "es" : "fue" } de <Label color="teal"><span data-testid="minimunContribution">{ this.props.data.minimunContribution }</span> wei</Label></div> 
                { (this.state.status==="Cerrada" || this.state.status==="Exitosa")  &&
                    <div> Los fondos sobrantes al cerrar la campaña fueron de <Label color="green"> <span data-testid="remainingContributions">{ this.state.remainingContributions }</span> wei </Label> . </div>
                }
                <div className="progress-container">
                  { this.state.status==="Creada" ?
                      <ProgressBar variant="info" now={this.state.progress} label={`${this.state.balance} wei contribuidos`} /> :
                    <div>
                      <h5> Fondos </h5>
                       <ProgressBar variant="info" now={this.state.progress} label={`${this.state.balance} wei restantes`} />
                    </div>
                  }
                </div>
              
                { (!this.state.isMember) && (!this.state.isOwner) && this.state.status==="Creada"
                  &&  
                  <div className="contribute-row" data-testid="contribution-row">
                     <ContributeModal 
                      minimunContribution={this.props.data.minimunContribution}
                      contributeLoading={false}/>
                  </div> }

                { this.state.showMessage &&
                  <MessageModal
                    showMessage={this.state.showMessage}
                    handleMessageClose={this.handleMessageClose}
                    message={this.state.message}
                    title={this.state.title} />
                }

                { this.state.isMember && (!this.state.isOwner) && this.state.canWithdraw && 
                  ((this.state.status === "Cerrada") || (this.state.status === "Exitosa")) &&
                  <div>
                    <Button
                      loading={this.state.changeTxLoading}
                      className="normal-button"
                      onClick={this.withdraw}
                      data-testid="withdraw">
                        Retirar fondos
                    </Button>
                  </div>
                }

                { this.state.progress >= 100 && this.state.isOwner && this.state.status==="Creada"
                  &&
                    <div>
                      <Button
                        loading={this.state.changeTxLoading}
                        className="normal-button"
                        onClick={this.activeCampaign}
                        data-testid="changeActiveButton">
                          Activar campaña
                      </Button>
                    </div>
                }

              </div>);
  }
}

export default DisplayContent;