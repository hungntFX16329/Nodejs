// Khai báo biến khởi tạo
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const User = require('./model/user');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const fileHelper = require('./util/file');

const MONGODB_URI = 'mongodb+srv://prac1:prac1@prac1.uqcpf.mongodb.net/manage4?retryWrites=true&w=majority';

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf();

const fileStore = multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null,'images')
  } ,
  filename: (req,file,cb) =>{
    cb(null, new Date().toISOString()+ '-' + file.originalname)
  }
});

const fileFilter = (req,file,cb) =>{
  if(
    file.mimetype === 'image/png' || 
    file.mimetype === 'image/jpg' || 
    file.mimetype === 'image/jpeg'
  ){
    cb(null, true)
  } else {
    cb(null, false)
  }
}

//Import controller từ thư mục Controller
const errorController = require('./controller/404');

// Khai báo để sử dụng template engine ejs
app.set('view engine','ejs');
app.set('views','views');

// Lấy dữ liệu nhập vào thông qua req.body
app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage:fileStore, fileFilter: fileFilter}).single('image'))

// Khai báo static folder để có thể sử dụng css cho trang web
app.use(express.static(path.join(__dirname,'public')));
app.use('/images',express.static(path.join(__dirname,'images')));

app.use(
  session({
    secret:'my secret', 
    resave: false, 
    saveUninitialized: false,
    store: store
  })
)
app.use(csrfProtection);
app.use(flash())

app.use((req,res,next)=>{
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

// Khởi tạo route
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const covidRoutes = require('./routes/covid');
const rollcallRoutes = require('./routes/rollcall');
const absenceRoutes = require('./routes/absence');

// Kết nối Routes
app.use(authRoutes);
app.use(userRoutes);
app.use(covidRoutes);
app.use(rollcallRoutes);
app.use(absenceRoutes);

app.use(errorController.get404error);

// Khởi tạo kết nối với mongoDB qua mongoose
mongoose
    .connect(MONGODB_URI)
    .then(()=>{
        User.findOne().then(user=>{
            if(!user){
                const user = new User({
                    name: 'Nguyễn Tiến Hùng',
                    email:'hungntFX16329@funix.edu.vn',
                    password:'123',
                    doB: new Date("1989-10-26"),
                    salaryScale: 1,
                    startDate: new Date("2022-07-10"),
                    department: "Phòng tạp vụ",
                    annualLeave: 10,
                    image: "images/2022-07-22T11:13:39.335Z-1fccbd12e2b6ec8b3a64f1ac901fcd7e.jpg",
                  });
                user.save();
            }
        })

      app.listen(process.env.PORT || 8080, "0.0.0.0", () => {
        console.log("Server is running")});
    })
    .catch(err=>console.log(err))
