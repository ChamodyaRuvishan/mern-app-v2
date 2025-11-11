import React, { createContext, useState, useEffect } from 'react';
export const ShopContext =createContext(null);
import all_product from '../Components/assets/data/all_product.js';

const getDefaultCart = () => {
    let cart = {};
    for (let i = 0; i < 2000; i++) {
        cart[i] = 0;
    }
    return cart;
}
const ShopContextProvider = (props) => {
    const [apiProducts, setApiProducts] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());

    const fetchInfo = async () => {
        try {
            await fetch('http://localhost:8000/allproducts')
            .then((res) => res.json())
            .then((data) => { setApiProducts(data) });
        } catch (error) {
            console.log('API fetch failed:', error);
        }
    }

    useEffect(() => {
        fetchInfo();
    }, [])

    // Combine static products with API products
    const combinedProducts = [...all_product, ...apiProducts];
    




    const addToCart=(itemId)=>{
        setCartItems((prev)=>({...prev,[itemId]:(prev[itemId] || 0) + 1}))
    }
    const removeFromCart=(itemId)=>{
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId] > 0 ? prev[itemId]-1 : 0}))
    }
    
    const removeItemFromCart=(itemId)=>{
        setCartItems((prev)=>({...prev,[itemId]:0}))
    }

const getTotalCartAmount = () => {
    let totalAmount = 0;
    for(const item in cartItems) {
        if(cartItems[item] > 0) {
            let itemInfo = combinedProducts.find((product) => product.id === Number(item))
            if(itemInfo) {
                totalAmount += itemInfo.new_price * cartItems[item];
            }
        }
    }
    return totalAmount;
}
const getTotalCartItems =()=>{
    let totalItem=0;
    for (const item in cartItems){
        if(cartItems[item]>0)
        {
            totalItem+= cartItems[item];
        }
    }
    return totalItem;
}
const contextValue = {getTotalCartItems,getTotalCartAmount,all_product: combinedProducts,cartItems,addToCart,removeFromCart,removeItemFromCart,combinedProducts};

    return (
        <ShopContext.Provider value={contextValue}>
           {props.children} 
        </ShopContext.Provider>
    )
}
export default ShopContextProvider;