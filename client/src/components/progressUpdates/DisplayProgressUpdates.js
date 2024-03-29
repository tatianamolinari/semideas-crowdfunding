import React from "react";
import { Row, Col } from "react-bootstrap";
import { Dimmer, Loader, Icon, Item, Pagination }  from 'semantic-ui-react'

import ItemProgressUpdates from "./ItemProgressUpdates.js";
import ProgressUpdateDetail from "./ProgressUpdateDetail.js";

import { campaignService } from "../../services/campaignService.js"
import { ipfsService } from "../../services/ipfsService.js"


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
    this.setState({ loaded: false });
    const allProgressUpdates = this.state.pastProgressUpdates;
    const progress_updates = []
    const i_progress_update = this.state.totalProgressUpdates - 1 - ((activePage-1)*(this.state.per_page));
    const last_i = Math.max(-1, i_progress_update - (this.state.per_page));
    for(let i=i_progress_update; (i >= 0 && i > last_i) ; i--){
      const puHash = allProgressUpdates[i];
      const ipfsPath = ipfsService.getIPFSHash(puHash);
      const ipfsData = await ipfsService.getJsonFromIPFSHash(ipfsPath);
      progress_updates.push({
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
      this.setState({ loaded: false });
      const pastProgressUpdates = await campaignService.getProgressUpdates();
      this.setState({ pastProgressUpdates : pastProgressUpdates.map(pu =>  pu.returnValues[0]), 
                      totalProgressUpdates: pastProgressUpdates.length,
                      totalPages: Math.ceil(pastProgressUpdates.length/this.state.per_page) });
      await this.getProgressUpdates(1);
    } catch (error) {
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
            />)
      }

    return (  <div className="proposal-info" id="progress_container" style={{display: "none"}}>            
                {!this.state.loaded && 
                  <Dimmer active>
                    <h1 data-testid="info-loading"> Obteniendo los avances publicados... </h1>
                    <Loader size='large' inline>Cargando...</Loader>
                  </Dimmer>
                }
                
                { this.state.active==="progress_updates_list" && progress_updates_nodes.length>0 && this.state.loaded && 
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

                { this.state.active==="progress_updates_list" && progress_updates_nodes.length===0 && this.state.loaded && 
                  <div>  
                      <h1> Aún no hay avances del proyecto para mostrar. </h1>
                      <p> No dejes de estar pendiente a las nuevas actualizaciones que el owner pueda subir.</p>
                  </div>
                }
                
                
                { this.state.active==="progress_update_detail" && this.state.loaded && 
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
                  </div>
                }
              </div>
              );
  }
}

export default DisplayProgressUpdates;