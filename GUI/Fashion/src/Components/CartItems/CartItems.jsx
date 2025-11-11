import React, { useContext } from 'react';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import cross from '../assets/cross.webp';
const CartItems = () => {
    const{getTotalCartAmount,all_product,cartItems,removeFromCart,addToCart,removeItemFromCart}=useContext(ShopContext);
  return (
    <div className='cartitems'>
        <div className="cartitems-format-main">
            <p>Product</p>
            <p>Title</p>
            <p>Price</p>
            <p>Quantity</p>
            <p>Total</p>
            <p>Remove</p>
        </div>
        <hr/>
       {all_product.map((e)=>{
        if(cartItems[e.id]>0)
            {
                return  (<div key={e.id}>
                <div className='cartitems-format'>
                    <img src={e.image} alt="" className='carticon-product-icon'/>
                    <p>{e.name}</p>
                    <p>${e.new_price}</p>
                    <div className='cartitems-quantity'>
                        <button onClick={()=>{removeFromCart(e.id)}}>-</button>
                        <span>{cartItems[e.id]}</span>
                        <button onClick={()=>{addToCart(e.id)}}>+</button>
                    </div>
                    <p>${e.new_price * cartItems[e.id]}</p>
                    <img src={cross} onClick={()=>{removeItemFromCart(e.id)}} alt="" className='remove-icon'/>
                </div>
                <hr/>
            </div>
       )
    }
       })}
       <div className="cartitems-down">
        <div className="cartitems-total">
            <h1>Cart Totals</h1>
            <div>
                <hr/>
                <div className="cartitems-total-item">
                    <h3>Total</h3>
                    <h3>${getTotalCartAmount()}</h3>
                </div>
            </div>
            <button>PROCEED TO CHECKOUT</button>
        </div>
       </div>
    </div>
  )
}
export default CartItems;