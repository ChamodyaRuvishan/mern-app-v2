import React from 'react';
import './FooterContent.css';
import { FaAward } from "react-icons/fa";

function FooterContent() {
  return (
    <div id="footercontent">
      <p>
        <FaAward className="icon" />
        "© 2025 Your Website Name. All rights reserved. This website is built with React and is dedicated to providing users with seamless and interactive experiences. For inquiries or support, contact us at [your email address]. Stay connected with us on social media for the latest updates and news!"
      </p>
    </div>
  );
}

export default FooterContent;