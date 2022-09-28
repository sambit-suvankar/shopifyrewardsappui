import React from "react";

function Loader(){
    return(
        
      <div className="loader_container">
        <div className="loader_overlay">
            <div className="loader_circle"/>
            <div className="overlay-message">Don't Refresh the page !!</div>
        </div>
      </div>
    )
}

export default Loader