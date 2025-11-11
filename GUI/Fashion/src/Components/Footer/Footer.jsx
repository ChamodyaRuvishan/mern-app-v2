import React from 'react'
import './Footer.css'
import insta from '../assets/footer/1download.png'
import whts from '../assets/footer/2images.jpeg'
import pinterst from '../assets/footer/2images.jpeg'

const Footer = () => {
  return (
    <div className='footer'>
        <div className="nav-logo">
    <p>Tenden<span>C</span>ia</p>
</div>
        
        <div className='footer-social-icon'>
        <div className='footer-icons-container'>
            <img src={insta} alt='' /> 
        </div>
        <div className='footer-icons-container'>
            <img src={whts} alt='' />
        </div>
        <div className='footer-icons-container'>
            <img src={pinterst} alt='' /> 
        </div>

        </div>
<div className="footer-copyright">
    <hr/>
    <p>Copyright @ 2025-All rights reserved</p>
    <p>Created by Chamodya Ruvishan</p>

</div>
    </div>
  )
}
export default Footer;