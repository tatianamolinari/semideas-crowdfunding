import React from "react";
import { Badge } from "react-bootstrap";
import { Label, Icon } from 'semantic-ui-react'
import ProgressBar from 'react-bootstrap/ProgressBar'

import { fromIntToStatus, fromStatusToBadgeClass } from "../../helpers/utils.js";
import { campaignService } from "../../services/campaignService.js"
import { ipfsService } from "../../services/ipfsService.js"

import ImagesDetail from "./ImagesDetail.js";
import ContributeModal from "../modals/ContributeModal"


class DisplayContent extends React.Component {

  state = {
    active: this.props.active,
    loaded: false,
    isOwner: this.props.data.isOwner,
    isMember: this.props.data.isMember,
    balance: this.props.data.balance,
    membersCount: this.props.data.membersCount,
    status: this.props.data.status,
    rol: null,
    progress: 0,
    badge_status:''
  };

  actualizeContributionInfo = async() =>  {

    try {
      const isMember = await campaignService.getMembership();
      const balance = await campaignService.getBalance();
      const membersCount = await campaignService.getMembersCount();

      this.actualizeRol(this.state.isOwner, isMember);

      const progress = this.getProgress();
      
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

  actualizeStatusInfo = async() =>  {

    try {
      const enum_status = await campaignService.getStatus();
      const status = fromIntToStatus(enum_status);
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
  
  actualizeRol = (isOwner,isMember) =>
  {
    if (isOwner){
      this.setState({ rol: "Eres el owner" });
    }
    else if (isMember) {
      this.setState({ rol: "Eres miembro" });
    }

  }


  componentDidMount = async() => {

    const progress = this.getProgress();
    const badge_status = fromStatusToBadgeClass(this.state.status);
    
    this.setState({ badge_status: badge_status });
    this.setState({ progress: progress });

    this.actualizeRol(this.state.isOwner, this.state.isMember);
    
    const actualizeInfo = async() => {this.actualizeContributionInfo()};
    await campaignService.suscribeToNewContribution(actualizeInfo);
    const actualizeStatusInfo = async() => {this.actualizeStatusInfo()};
    await campaignService.suscribeToChangeStatus(actualizeStatusInfo);
  }

  getProgress() {

    const progress = (((parseInt(this.state.balance)/parseInt(this.props.data.goal)))* 100).toFixed(2);
    return Math.min(progress,100);
  }



  render() {

    let images = ["/images/prueba/prueba1.jpg","/images/prueba/prueba2.jpg","/images/prueba/prueba3.jpg","/images/prueba/prueba4.jpg"]
    let descripcion = "Lorem ipsum dolor sit amet consectetur adipiscing elit quis, condimentum odio class etiam justo euismod orci, lobortis cras aptent mauris nullam semper senectus. Etiam ligula malesuada sapien magna tincidunt scelerisque ridiculus vel, aenean aliquam arcu eget facilisis placerat cubilia nibh purus, eleifend mi sociis ad vitae nam tempor. Imperdiet arcu parturient libero suscipit accumsan erat convallis velit metus bibendum taciti, auctor neque felis per augue in maecenas vulputate enim. Montes senectus urna eros accumsan lobortis cras ante convallis lacus, volutpat ullamcorper platea fermentum morbi class hac laoreet pretium sagittis, luctus cursus pellentesque interdum sed nullam porta est. Morbi mattis tincidunt ligula ad blandit per varius vulputate lobortis, nam curae urna netus bibendum a non aenean, consequat ut nascetur mi viverra lectus ultrices dis. A magnis molestie ultrices suscipit euismod litora fames volutpat erat vehicula venenatis mattis neque nam interdum, tincidunt orci condimentum augue natoque magna libero arcu dui taciti mus sed hendrerit class."
    let created_at = "10/03/2021"
    let title = "Este titulo está mockeado"

    console.log(this.props);
    if (this.props.ipfsData) {

      images = this.props.ipfsData.images.map(path =>  ipfsService.getIPFSUrlFromPath(path));

      descripcion = this.props.ipfsData.description
      created_at = this.props.ipfsData.created_date
      title = this.props.ipfsData.title
    }
    
    return (  <div className="campaign-info" id="general_data_container"> 
                <h3 className="name"> {title} 
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
                  <div>  <Icon fitted name='user circle' /> Owner: <span data-testid="owner">{ this.props.data.owner }</span>. </div>   
                  <div>  <Icon fitted name='group' /> Cantidad de miembros: <span data-testid="membersCount">{ this.state.membersCount }</span>. </div>
                </div>
                
                <p className="description"> {descripcion} </p>
                <hr/>
                
                <h5> Contribuciones </h5>
                <div> Para que esta campaña comience se deben recaudar <Label color="green"> <span data-testid="goal">{ this.props.data.goal }</span> wei </Label> o más. </div>
                <div> La contribución mínima es de <Label color="teal"><span data-testid="minimunContribution">{ this.props.data.minimunContribution }</span> wei</Label></div> 
                <div className="progress-container">
                  <ProgressBar variant="info" now={this.state.progress} label={`${this.state.balance} wei contribuidos`} />
                </div>
              
                { (!this.state.isMember) && (!this.state.isOwner) && this.state.status=="Creada"
                  &&  
                  <div className="contribute-row" data-testid="contribution-row">
                     <ContributeModal 
                      minimunContribution={this.props.data.minimunContribution}
                      contributeLoading={false}/>
                  </div> }

              </div>);
  }
}

export default DisplayContent;