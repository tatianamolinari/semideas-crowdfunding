import React from "react";

class ProgressUpdateDetail extends React.Component {

  render() {

    return (  <div className="proposal-detail">            
                <h3 className="title" data-testid="titulo"> {this.props.title} </h3>
                <p className="aling-right"> Fecha de creación <span data-testid="fecha_creacion">{this.props.progress_update_date}</span></p>
                <p className="description" data-testid="descripcion"> {this.props.description} </p>
              </div>);
  }
}

export default ProgressUpdateDetail;