import React from "react";
import { Row, Col } from "react-bootstrap";
import { Icon, Item }  from 'semantic-ui-react'


import ItemProgressUpdates from "./ItemProgressUpdates.js";
import ProgressUpdateDetail from "./ProgressUpdateDetail.js";

class DisplayProgressUpdates extends React.Component {

  state = {
    active: this.props.active,
    progress_update_data: {},
    progress_updates: [],
    loaded: false,
    page:1
  };

  getProgressUpdates(totalProgressUpdates) {

    const i_progress_update = totalProgressUpdates - 1 - ((this.state.page-1)*4);
    const last_i = i_progress_update - 4;
    console.log(`First i progress update ${i_progress_update} & Last i progress update ${last_i} with totalProgressUpdates ${totalProgressUpdates} - page ${this.state.page} `) 
    var progress_updates = []
    
    for(var i=i_progress_update; (i >= 0 && i >= last_i) ; i--){
      progress_updates.push(
        {"index_progress_update": i,
         "title":`Titulo progress update ${i}`, 
         "description":"Lorem ipsum dolor sit amet consectetur adipiscing elit quis, condimentum odio class etiam justo euismod orci, lobortis cras aptent mauris nullam semper senectus. Etiam ligula malesuada sapien magna tincidunt scelerisque ridiculus vel, aenean aliquam arcu eget facilisis placerat cubilia nibh purus, eleifend mi sociis ad vitae nam tempor. Imperdiet arcu parturient libero suscipit accumsan erat convallis velit metus bibendum taciti, auctor neque felis per augue in maecenas vulputate enim. Montes senectus urna eros accumsan lobortis cras ante convallis lacus, volutpat ullamcorper platea fermentum morbi class hac laoreet pretium sagittis, luctus cursus pellentesque interdum sed nullam porta est. Morbi mattis tincidunt ligula ad blandit per varius vulputate lobortis, nam curae urna netus bibendum a non aenean, consequat ut nascetur mi viverra lectus ultrices dis. A magnis molestie ultrices suscipit euismod litora fames volutpat erat vehicula venenatis mattis neque nam interdum, tincidunt orci condimentum augue natoque magna libero arcu dui taciti mus sed hendrerit class. Lorem ipsum dolor sit amet consectetur adipiscing elit quis, condimentum odio class etiam justo euismod orci, lobortis cras aptent mauris nullam semper senectus. Etiam ligula malesuada sapien magna tincidunt scelerisque ridiculus vel, aenean aliquam arcu eget facilisis placerat cubilia nibh purus, eleifend mi sociis ad vitae nam tempor. Imperdiet arcu parturient libero suscipit accumsan erat convallis velit metus bibendum taciti, auctor neque felis per augue in maecenas vulputate enim. Montes senectus urna eros accumsan lobortis cras ante convallis lacus, volutpat ullamcorper platea fermentum morbi class hac laoreet pretium sagittis, luctus cursus pellentesque interdum sed nullam porta est. Morbi mattis tincidunt ligula ad blandit per varius vulputate lobortis, nam curae urna netus bibendum a non aenean, consequat ut nascetur mi viverra lectus ultrices dis. A magnis molestie ultrices suscipit euismod litora fames volutpat erat vehicula venenatis mattis neque nam interdum, tincidunt orci condimentum augue natoque magna libero arcu dui taciti mus sed hendrerit class.",
         "progress_update_date": `05/03/0${i+1}`});
      }

    return progress_updates;
  }

  showProgressUpdate(index) {

    this.setState({ progress_update_data : this.state.progress_updates[index]});
    this.setState({ active: "progress_update_detail"});
  }

  componentDidMount = async() => {
    try {

      const totalProgressUpdates = 5; 
      const progress_updates = this.getProgressUpdates(totalProgressUpdates);

      console.log(progress_updates);
 
      this.setState({
          loaded: true,
          progress_updates: progress_updates
      });

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
              progress_update_date={progress_update.progress_update_date}
              onClick={() => { this.showProgressUpdate(index) }}
            />
        )
    }


    return (  <div className="proposal-info" id="progress_container" style={{display: "none"}}>            
                
                { this.state.active==="progress_updates_list" && progress_updates_nodes.length>0 &&
                <Row  id="progress_updates_list">
                  <Item.Group>
                    {progress_updates_nodes}
                  </Item.Group>           
                </Row> }

                { this.state.active==="progress_updates_list" && progress_updates_nodes.length===0 &&
                <div>  
                    <h1> Aún no hay avances del proyecto para mostrar. </h1>
                    <p> No dejes de estar pendiente a las nuevas actualizaciones que el autor pueda subir.</p>
                </div>
               
                }
                
                
                { this.state.active==="progress_update_detail" &&
                <div  id="progress_update_detail">
                  <ProgressUpdateDetail
                  title={this.state.progress_update_data.title}
                  description={this.state.progress_update_data.description}
                  progress_update_date={this.state.progress_update_data.progress_update_date}/>   
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