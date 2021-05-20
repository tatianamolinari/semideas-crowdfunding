import React from "react";
import { Badge } from "react-bootstrap";
import { fromStatusToBadgeClass } from "../../utils/utils.js"

import ProposalDetail from "./ProposalDetail.js";

class DisplayProposals extends React.Component {

  state = {
    active: this.props.active,
    loaded: false
  };

  render() {
    const title = "Este titulo de proposal está mockeado";
    const description = "Lorem ipsum dolor sit amet consectetur adipiscing elit quis, condimentum odio class etiam justo euismod orci, lobortis cras aptent mauris nullam semper senectus. Etiam ligula malesuada sapien magna tincidunt scelerisque ridiculus vel, aenean aliquam arcu eget facilisis placerat cubilia nibh purus, eleifend mi sociis ad vitae nam tempor. Imperdiet arcu parturient libero suscipit accumsan erat convallis velit metus bibendum taciti, auctor neque felis per augue in maecenas vulputate enim. Montes senectus urna eros accumsan lobortis cras ante convallis lacus, volutpat ullamcorper platea fermentum morbi class hac laoreet pretium sagittis, luctus cursus pellentesque interdum sed nullam porta est. Morbi mattis tincidunt ligula ad blandit per varius vulputate lobortis, nam curae urna netus bibendum a non aenean, consequat ut nascetur mi viverra lectus ultrices dis. A magnis molestie ultrices suscipit euismod litora fames volutpat erat vehicula venenatis mattis neque nam interdum, tincidunt orci condimentum augue natoque magna libero arcu dui taciti mus sed hendrerit class."
    const recipient = "0xDF0fd73D8e1539290a73073d466c3a933Ca895D5";
    const value = 25;
    const approvalsCount = 0; 
    const status = "Creada";
    
    //const a = false;

    return (  <div className="proposal-info" id="proposals_container" style={{display: "none"}}>            
               <ProposalDetail
               title={title}
               description={description}
               recipient={recipient}
               value={value}
               approvalsCount={approvalsCount}
               status={status}/>   
              </div>);
  }
}

export default DisplayProposals;