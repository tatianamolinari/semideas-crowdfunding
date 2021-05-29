import React from "react";
import { Badge } from "react-bootstrap";

import { fromStatusToBadgeClass } from "../../helpers/utils.js";

import ImagesDetail from "./ImagesDetail.js";
import ContributeModal from "../modals/ContributeModal"

class DisplayContent extends React.Component {

  state = {
    active: this.props.active,
    loaded: false,
    isMember: this.props.data.isMember,
    balance: this.props.data.balance,
    membersCount: this.props.data.membersCount,
    instance: this.props.instance,
    web3: this.props.web3
  };

  actualizeContributionInfo = async() =>  {

    let accounts = await this.state.web3.eth.getAccounts();
    const isMember = await this.state.instance.methods.isMember(accounts[0]).call();
    const balance = await this.state.web3.eth.getBalance(this.state.instance.options.address);
    const membersCount = await this.state.instance.methods.membersCount().call();

    console.log(isMember);
    console.log(balance);
    console.log(membersCount);
    
    this.setState({ isMember: isMember, balance: balance, membersCount: membersCount});
  }

  componentDidMount = async() => {

    const component = this;
    const currentBlock = await this.state.web3.eth.getBlockNumber();

    this.state.instance.events.newContribution({
      fromBlock: currentBlock
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
          console.log("conectado");
          console.log(subscriptionId);
      })
      .on('data', function(event){
          console.log("data");
          component.actualizeContributionInfo();
          console.log(event); // same results as the optional callback above
      })
      .on('error', function(error, receipt) {
        console.log("hubo un error");
        console.log(error);
      });

  }

  render() {
    const badge_status = fromStatusToBadgeClass(this.props.data.status);

    const images = ["/images/prueba/prueba1.jpg","/images/prueba/prueba2.jpg","/images/prueba/prueba3.jpg","/images/prueba/prueba4.jpg"]
    const descripcion = "Lorem ipsum dolor sit amet consectetur adipiscing elit quis, condimentum odio class etiam justo euismod orci, lobortis cras aptent mauris nullam semper senectus. Etiam ligula malesuada sapien magna tincidunt scelerisque ridiculus vel, aenean aliquam arcu eget facilisis placerat cubilia nibh purus, eleifend mi sociis ad vitae nam tempor. Imperdiet arcu parturient libero suscipit accumsan erat convallis velit metus bibendum taciti, auctor neque felis per augue in maecenas vulputate enim. Montes senectus urna eros accumsan lobortis cras ante convallis lacus, volutpat ullamcorper platea fermentum morbi class hac laoreet pretium sagittis, luctus cursus pellentesque interdum sed nullam porta est. Morbi mattis tincidunt ligula ad blandit per varius vulputate lobortis, nam curae urna netus bibendum a non aenean, consequat ut nascetur mi viverra lectus ultrices dis. A magnis molestie ultrices suscipit euismod litora fames volutpat erat vehicula venenatis mattis neque nam interdum, tincidunt orci condimentum augue natoque magna libero arcu dui taciti mus sed hendrerit class."
    const created_at = "10/03/2021"
    
    return (  <div className="campaign-info" id="general_data_container"> 
                <h3 className="name"> Este titulo está mockeado </h3>
                <p className="aling-right"> Fecha de creación {created_at}</p>
                <ImagesDetail images={images}/>
                <h5> Estado: <Badge variant={badge_status}> { this.props.data.status } </Badge> </h5>
                <p className="description"> {descripcion} </p>
                <hr/>
                <div> Para que esta campaña comience se deben recaudar <span data-testid="goal">{ this.props.data.goal }</span> wei o más. </div>
                <div> Contribuciones totales: <span data-testid="balance">{ this.state.balance }</span> wei. </div>
                <div> La contribución mínima es de <span data-testid="minimunContribution">{ this.props.data.minimunContribution }</span> wei.</div> 
                <div> Autor: <span data-testid="owner">{ this.props.data.owner }</span>. </div>   
                <div> Cantidad de miembros contribuyentes: <span data-testid="membersCount">{ this.state.membersCount }</span>. </div>
               
                { (!this.state.isMember) && (!this.props.data.isOwner)
                  &&  
                  <div className="contribute-row" data-testid="contribution-row">
                     <ContributeModal 
                      instance={this.props.instance}
                      minimunContribution={this.props.data.minimunContribution}
                      web3={this.state.web3}
                      contributeLoading={false}/>
                  </div> }

              </div>);
  }
}

export default DisplayContent;