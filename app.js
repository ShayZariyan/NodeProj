const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const indexRoutes = require('./api/v1/routes/home');
const userRoutes = require('./api/v1/routes/user');
const productRoutes = require('./api/v1/routes/product');
const categoryRoutes = require('./api/v1/routes/categories');
const authRoutes = require('./api/v1/routes/auth');
const cartRoutes = require('./api/v1/routes/cart');
const checkoutRoute = require('./api/v1/routes/checkout');
const authMiddleware = require('./api/v1/middlewares/auth');
const verifyToken = require('./api/v1/middlewares/auth');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const gptRoute = require("./api/v1/routes/gptapi");
require('./api/v1/middlewares/fbggl');



app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
    extensions: ['jpg', 'jpeg', 'png', 'gif'],
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(session({
    secret: process.env.GOOGLE_CLIENT_SECRET,
    resave: false,
    saveUninitialized: false
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(verifyToken);
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
  });

  app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
      json: function (context) {
        return JSON.stringify(context, null, 2);
      },
      encode: function (str) {
        return encodeURIComponent(str);
      },
      ifEquals: function (a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
      },
      multiply: function (price, qty) {
        return (price * qty).toFixed(2);
      },
      calculateTotal: function (items) {
        if (!Array.isArray(items)) return '0.00';
  
        return items.reduce((total, item) => {
          const price = item?.productId?.Price;
          const qty = item?.quantity;
  
          if (typeof price !== 'number' || typeof qty !== 'number') return total;
  
          return total + (price * qty);
        }, 0).toFixed(2);
      }
    },
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    }
  }));
  
  app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});


app.set('view engine', 'hbs');
app.set('views', './api/v1/views');
app.set('view cache', false);

const mongoConnStr = `mongodb+srv://Shay:shayshay@shay.uijvx.mongodb.net/Eshop`;
//const mongoConnStr = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@shay.uijvx.mongodb.net/Eshop`;
mongoose.connect(mongoConnStr, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
    .then(() => console.log('Connected To Mongo'))
    .catch((err) => console.error('Connection Failed:', err));
    

app.use("/", gptRoute);
app.use('/', indexRoutes);
app.use('/user', userRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/auth', authRoutes); 
app.use('/cart', authMiddleware, cartRoutes);
app.use('/checkout',authMiddleware, checkoutRoute);


module.exports = app;
//sendgrid - emails
//tranzila
