import React from 'react';
import './BodyContent.css';

function BodyContent(props) {
  return (
    <div id="bodycontent">
      <p>Hello</p>
      {props.children}
    </div>
  )
}

export default BodyContent