import React from 'react';
import './HeaderContent.css';
import MenuLink from '../MenuLink/MenuLink';
import { FaAirFreshener } from "react-icons/fa";
import logoimage from '../../assets/react.svg';  {/*(there is a path){assest}--these two are in a relationship*/}


function HeaderContent() {
  return (
    <div>
    <div id= "navcontent">
    <FaAirFreshener style={{ fontSize: '2em',color:'#61dafb'  }} />
    <img src="vite.svg" alt="Vite Logo"/> {/* get image from public folder */}
    <img src={logoimage} alt="React Logo"/> {/*(there is a path){assest}--these two are in a relationship*/}
    <MenuLink linkname="Home" url="#home"/>
    <MenuLink linkname="About" url="#about"/>
    <MenuLink linkname="Contact" url="#contact"/>
    <MenuLink linkname="Login" url="#login"/>
    </div>
    
    </div>
  );
}

export default HeaderContent;