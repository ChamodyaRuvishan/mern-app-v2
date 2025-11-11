require('dotenv').config();  // Load variables from .env

const port = process.env.PORT || 8000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

app.use(express.json());
app.use(cors());

 //Database Connection with MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

 //API creation

app.get('/', (req,res) => {
    res.send('Express App is Running')
})

// Image Storage Engine

const storage = multer.diskStorage({
    destination: './upload/images',
   filename:(req,file,cb) => {
      return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
   }
})

const upload = multer({storage: storage}) 

//Creating Upload Endpoint for images

app.use('/images',express.static('upload/images'))

app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

// Schema for Creating Products

const Product = mongoose.model("Product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type: String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    },  
})

app.post('/addproduct', async (req,res)=>{
    let products = await Product.find({});
    // Static product IDs: 1,2,3,11,12,13,21,22,23,31,32,33
    let staticIds = [1,2,3,11,12,13,21,22,23,31,32,33];
    let allIds = [...staticIds, ...products.map(p => p.id)];
    let id = Math.max(...allIds, 999) + 1;
    
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    
    await product.save();
    console.log("Product saved to MongoDB:", product.name);
    res.json({
        success: true,
        name: req.body.name
    })
})

// Creating API for deleting products

app.post('/removeproduct', async (req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Product removed from MongoDB");
    res.json({
        success: true,
        name: req.body.name
    })
})

// Creating API for getting all products
app.get('/allproducts', async (req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched from MongoDB:", products.length);
    res.send(products);
})

// shema creating for user model
const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

// Creating endpoint for registering the user
app.post('/signup', async (req,res)=>{
    let check = await Users.findOne({email:req.body.email});
    if (check) {
        return res.status(400).json({success:false,errors:"existing user found with same email address"});
    }
    
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    });
    
    await user.save();
    const data = {user: {id: user.id}};
    const token = jwt.sign(data, 'secret_ecom');
    res.json({success: true, token})
})

// creating endpoint for user login
app.post('/login', async (req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user) {
        const passCompare = req.body.password === user.password;
        if(passCompare) {
            const data = {user: {id: user.id}};
            const token = jwt.sign(data, 'secret_ecom');
            res.json({success: true, token});
        } else {
            res.json({success: false, errors: "Wrong Password"});
        }
    } else {
        res.json({success: false, errors: "Wrong Email Id"});
    }
})


 app.listen(port, (error) => {
if(!error){
    console.log('Server Running on Port ' + port)
     }
     else
     {
            console.log('Error : ' + error)
     }
 })