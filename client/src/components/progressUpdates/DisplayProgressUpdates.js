import React from "react";
import { Row, Col } from "react-bootstrap";
import { Icon, Item, Pagination }  from 'semantic-ui-react'

import ItemProgressUpdates from "./ItemProgressUpdates.js";
import ProgressUpdateDetail from "./ProgressUpdateDetail.js";

import { campaignService } from "../../services/campaignService.js"
import { ipfsService } from "../../services/ipfsService.js"
import { hexBytesToAddress } from "../../helpers/utils.js"


class DisplayProgressUpdates extends React.Component {

  state = {
    active: this.props.active,
    progress_update_data: {},
    progress_updates: [],
    pastProgressUpdates: [],
    totalPages: 0,
    totalProgressUpdates: 0,
    loaded: false,
    per_page: 4,
    activePage:1
  };

  async getProgressUpdates(activePage) {
    const allProgressUpdates = this.state.pastProgressUpdates;
    const progress_updates = []
    const i_progress_update = this.state.totalProgressUpdates - 1 - ((activePage-1)*(this.state.per_page));
    const last_i = Math.max(-1, i_progress_update - (this.state.per_page));
    
    //console.log(`${i_progress_update} ${last_i} ${activePage}`)

    for(let i=i_progress_update; (i >= 0 && i > last_i) ; i--){
      const puHash = allProgressUpdates[i];
      const ipfsPath = hexBytesToAddress(puHash.substring(2));

      const ipfsData = await ipfsService.getJsonFromIPFSHash(ipfsPath);
      
      progress_updates.push(
        {
          "index_progress_update": i,
          "title": ipfsData.title, 
          "description": ipfsData.description ,
          "progress_update_date": ipfsData.created_date,
          "images": ipfsData.images.map(path =>  ipfsService.getIPFSUrlFromPath(path))
        });
    }

    this.setState({
      loaded: true,
      progress_updates: progress_updates
    });

  }

  handlePaginationChange = (e, { activePage }) => {
    this.setState({ activePage: activePage, loaded: false });
    this.getProgressUpdates(activePage);
  }

  showProgressUpdate(index) {

    this.setState({ progress_update_data : this.state.progress_updates[index]});
    this.setState({ active: "progress_update_detail"});
  }

  componentDidMount = async() => {
    try {

      //const actualizeProgressUpdates = async() => {this.getProgressUpdates(0)};
      //await campaignService.suscribeToProgressUpdate(actualizeProgressUpdates);

      const pastProgressUpdates = await campaignService.getProgressUpdates();
      this.setState({ 
                      pastProgressUpdates : pastProgressUpdates.map(pu =>  pu.returnValues[0]), 
                      totalProgressUpdates: pastProgressUpdates.length,
                      totalPages: Math.ceil(pastProgressUpdates.length/this.state.per_page)
                    });
      await this.getProgressUpdates(1);


    } catch (error) {
        alert(
            `Failed to load web3, accounts, or data contract. Check console for details.`,
        );
        console.error(error);
    }
};

  render() {

    var progress_updates_nodes = []
      for (const [index, progress_update] of this.state.progress_updates.entries()) {
        progress_updates_nodes.push(
            <ItemProgressUpdates
              key={index}
              title={progress_update.title}
              description={progress_update.description}
              image={progress_update.images[0]}
              progress_update_date={progress_update.progress_update_date}
              onClick={() => { this.showProgressUpdate(index) }}
            />
        )
    }


    return (  <div className="proposal-info" id="progress_container" style={{display: "none"}}>            
                
                { this.state.active==="progress_updates_list" && progress_updates_nodes.length>0 &&
                <div>
                  <Row  id="progress_updates_list">
                    <Item.Group>
                      {progress_updates_nodes}
                    </Item.Group>           
                  </Row>
                  <Row className="justify-content-md-center">
                    <Pagination
                      activePage={this.state.activePage}
                      onPageChange={this.handlePaginationChange}
                      totalPages={this.state.totalPages}
                    />
                  </Row>
                </div>
                }

                { this.state.active==="progress_updates_list" && progress_updates_nodes.length===0 &&
                <div>  
                    <h1> Aún no hay avances del proyecto para mostrar. </h1>
                    <p> No dejes de estar pendiente a las nuevas actualizaciones que el owner pueda subir.</p>
                </div>
               
                }
                
                
                { this.state.active==="progress_update_detail" &&
                <div  id="progress_update_detail">
                  <ProgressUpdateDetail
                  title={this.state.progress_update_data.title}
                  description={this.state.progress_update_data.description}
                  progress_update_date={this.state.progress_update_data.progress_update_date}
                  images={this.state.progress_update_data.images}/>   
                  <Row className="proposal-footer">
                    <Col lg={6} className="aling-left">
                      <button className="normal-button"
                      onClick={() => { this.setState({ active: "progress_updates_list"})  }}>
                         <Icon name='angle left' /> Volver
                      </button>
                    </Col>
                  </Row>
                </div>}
              </div>
              );
  }
}

export default DisplayProgressUpdates;