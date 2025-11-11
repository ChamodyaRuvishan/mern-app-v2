import React, { useContext } from 'react';
import './CSS/ShopCategory.css'
import {ShopContext} from '../Context/ShopContext'
import dropdown_icon from '../Components/assets/dropdown_icon.png'
import Item from '../Components/Item/Item.jsx';

const ShopCategory = (props) => {
  const {all_product} = useContext(ShopContext);
  
  // Filter products by category
  const categoryProducts = all_product.filter(item => item.category === props.category);
  const totalProducts = all_product.length;
  const showingCount = categoryProducts.length;
  
  return (
    <div className='shop-category'>
      <div className="shopcategory-indexSort">
        <p>
          <span>Showing {showingCount}</span> out of {totalProducts} products
        </p>
        <div className="shopcategory-sort">
        <div className="sort-by-container">
            Sort by <img className='dd' src={dropdown_icon} alt='' />
          </div>      </div>
      </div>
      <div className="shopcategory-products">
        {all_product.map((item,i)=> {
          if(props.category===item.category){
            return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
          }
          else{
            return null;
}
        })}
      </div>
      <div className="shopcategory-loadmore">
        Explore More
        </div> 
    </div>
  )
}
export default ShopCategory;