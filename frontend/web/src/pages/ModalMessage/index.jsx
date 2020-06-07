import React from 'react';
import ReactDOM from 'react-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { useHistory } from 'react-router-dom';

import './styles.css';

const ModalMessage = ({ isShowing , hide , message }) => {

    const history = useHistory();

function handleClick(){
  history.push('/');
}

   if ( isShowing )
   {
     
   return (ReactDOM.createPortal(
    <React.Fragment>
      <div className="modal-overlay" onClick={ handleClick }/>
      <div className="modal-wrapper" aria-modal aria-hidden tabIndex={-1} role="dialog" onClick={ handleClick }>
          <div className="modal" onClick={ handleClick }>
              <div className="modal-header">
            {/* <button type="button" className="modal-close-button" data-dismiss="modal" aria-label="Close" onClick={ handleClick }>
              <span aria-hidden="true">&times;</span>
            </button> */}
              </div>
              <span> 
                <FiCheckCircle />
              </span>
              <p>{message}</p>
          </div>
      </div>
    </React.Fragment>, document.body
  ) )
} 
else
{
    return (null);
}



}

export default ModalMessage;


