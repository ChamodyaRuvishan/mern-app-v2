import React, { useContext } from 'react';
import './ProductDisplay.css'
import star from '../assets/star.webp'
import star_dull from '../assets/star_dull.webp'
import { ShopContext } from '../../Context/ShopContext';


const ProductDisplay = (props) => {
    const{product}=props;
    const{addToCart}=useContext(ShopContext);
  return (
    <div className='productdisplay'>
        <div className="productdisplay-left">
            <div className="productdisplay-img-list">
                <img src={product.image} alt="" />
                <img src={product.image} alt="" />
                <img src={product.image} alt="" />
                <img src={product.image} alt="" />
            </div>
            <div className="productdisplay-img">
                <img className='productdisplay-main-img' src={product.image} alt="" />
            </div>
        </div>
        <div className="productdisplay-right">
            <h1>{product.name}</h1>
            <div className="productdisplay-right-star">
                <img src={star} alt=""/>
                <img src={star} alt=""/>
                <img src={star} alt=""/>
                <img src={star} alt=""/>
                <img src={star_dull} alt=""/>
                <p>(122)</p>
            </div>
            <div className="productdisplay-right-prices">
                <div className="productdisplay-right-price-old">
                    ${product.old_price} 
                </div>
                <div className="productdisplay-right-price-new">
                    ${product.new_price} 
                </div>
            </div>
            <div className="productdisplay-right-description">
Embrace effortless style with TrendenCia’s curated collection, designed for those who value quality, comfort, and timeless aesthetics. From sleek wrap silhouettes to tailored classics, each piece is crafted with premium fabrics and thoughtful details to elevate your everyday wardrobe. Whether you're dressing for work, weekends, or special moments, discover versatile fashion that celebrates individuality.</div>
            <div className="productdisplay-right-size">
                <h1>Description</h1>
                <div className="productdisplay-right-size">
                    <div>Style: Modern / Classic / Streetwear</div>
<div>Collection: Spring Essentials / Limited Edition</div>
<div>Fit: True-to-Size (Size Guide)</div>
<div>Fabric: Premium Cotton / Eco-Polyester Blend</div>
<div>Care: Machine Wash Cold</div>
<div>Quality: Designer-Grade Construction</div>
                </div>
            </div>
            <button onClick={()=>{addToCart(product.id)}}>ADD TO CART</button>
        </div>
    </div>
  )
}
export default ProductDisplay ; 