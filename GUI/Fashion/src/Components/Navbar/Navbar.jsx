import React, { useState,useContext,useRef } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';

import cart from '../assets/cart.png';
import { ShopContext } from '../../Context/ShopContext';
import downArrow from '../assets/downArrow.png';

const Navbar  = () => {
    const [menu , setMenu] = useState("shop");
    const {getTotalCartItems}=useContext(ShopContext);
    const menuRef = useRef();

    const dropdown_toggle = (e) =>{
      menuRef.current.classList.toggle('nav-menu-visible');
      e.target.classList.toggle('open');
    }
  return (
    <div className="navbar">
   <div className="nav-logo">
    <p>Tenden<span>C</span>ia</p>
</div>
    <img className ='aaa' onClick={dropdown_toggle} src={downArrow} alt="" />  
    <ul ref={menuRef} className="nav-menu">
        <li onClick={()=>{setMenu("shop")}} ><Link style={{textDecoration: 'none'}}to='/'>Home</Link>{menu==="shop"?<hr className="underline"/>:<></>}</li>
        <li onClick={()=>{setMenu("mens")}}><Link style={{textDecoration: 'none'}}to='/mens'>Men</Link>{menu==="mens"?<hr className="underline"/>:<></>}</li>
        <li onClick={()=>{setMenu("womens")}}><Link style={{textDecoration: 'none'}}to='/womens'>Women</Link>{menu==="womens"?<hr className="underline"/>:<></>}</li>
        <li onClick={()=>{setMenu("kids")}}><Link style={{textDecoration: 'none'}}to='/kids'>Kids</Link>{menu==="kids"?<hr className="underline"/>:<></>}</li>
    </ul>
    <div className="nav-login-cart">
      {localStorage.getItem('auth-token')
      ?<button onClick={()=>{localStorage.removeItem('auth-token');window.location.replace('/')}}>Logout</button>
      :<Link to='/login'><button>Login</button></Link>}
<Link to='/cart'><img src = {cart} alt="" /></Link>
<div className="nav-cart-count">{getTotalCartItems()}</div>

    </div>
    </div>
  );
};
export default Navbar;