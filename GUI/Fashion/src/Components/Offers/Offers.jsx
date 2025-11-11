import React from 'react'
import './Offers.css'
import offers  from '../assets/offers/brand.png'
const Offers = () => {
  return (
    <div className ='offers'>
        <div className="offers-left">
        <h1>Exclusive</h1>
        <h1>Offers For You</h1>
        <p>Style Haven</p>
        <button>Check Now</button>
        </div>
        <div className="offers-right">
            <img src={offers} alt="" />
        </div>

    </div>
  )
}
export default Offers;