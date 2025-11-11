import './App.css';
import Navbar from './Components/Navbar/Navbar';
import {BrowserRouter,Routes,Route } from 'react-router-dom';
import Shop from './Pages/Shop';
import ShopCategory from './Pages/ShopCategory';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import Like from './Pages/Like';
import LoginSignup from './Pages/LoginSignup';
import Footer from './Components/Footer/Footer';
import { useContext } from 'react';
import { AuthContext } from './Context/AuthContext';

function App (){
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <BrowserRouter>
          <Routes>
            <Route path='*' element={<LoginSignup />} />
          </Routes>
        </BrowserRouter>
      </div>
    );
  }

  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<Shop />} />
          <Route path='/mens' element={<ShopCategory category="men"/>} />
          <Route path='/womens' element={<ShopCategory category="women"/>}/>
          <Route path='/kids' element={<ShopCategory category="kid"/>} />
          <Route path='/product' element={<Product />} >
            <Route path=':productId' element={<Product />} />
          </Route>
          <Route path='/cart' element={<Cart />} />
          <Route path='/like' element={<Like />} />
          <Route path='/login' element={<LoginSignup />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;