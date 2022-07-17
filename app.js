// Khai báo biến khởi tạo
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const User = require('./model/user')

//Import controller từ thư mục Controller
const userController = require('./controller/user');
const covidController = require('./controller/covid');
const rollcallController = require('./controller/rollcall');
const absenceController = require('./controller/absence');
const errorController = require('./controller/404');

// Lấy dữ liệu nhập vào thông qua req.body
app.use(bodyParser.urlencoded({extended: false}));

// Khai báo static folder để có thể sử dụng css cho trang web
app.use(express.static(path.join(__dirname,'public')));

// Khởi tạo 1 middleware nhằm để sử dụng 
// các thuộc tính và phương thức với user thông qua req.user
app.use((req, res, next) => {
    User.findById('62d38bf8887bde6b390cef33')
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => console.log(err));
});


// Khai báo để sử dụng template engine ejs
app.set('view engine','ejs');
app.set('views','views');

// Kết nối với controller
app.use(userController.getStatus);
app.get('/',userController.getHomePage);
app.get('/user',userController.getUser);
app.get('/edit-user/:userId', userController.getEditUser)
app.post('/edit-user',userController.postEditUser)
app.get('/covid',covidController.getCovidInfor);
app.get('/covid-details',covidController.getCovidDetails);
app.post('/covid',covidController.postCovid);
app.get('/rollcall',rollcallController.getRollcall);
app.get('/rollcall-details',rollcallController.getRollCallDetails);
app.post('/rollcall',rollcallController.postRollcall);
app.get('/absence',absenceController.getAbsence);
app.post('/absence',absenceController.postAbsence);
app.get('/search',userController.getStatistic);
app.get('/statistic-search',userController.getStatisticSearch);
app.use(errorController.get404error);

// Khởi tạo kết nối với mongoDB qua mongoose
mongoose
    .connect('mongodb+srv://prac1:prac1@prac1.uqcpf.mongodb.net/quanlynhanvien?retryWrites=true&w=majority')
    .then(()=>{
        User.findOne().then(user=>{
            if(!user){
                const user = new User({
                    name: 'Nguyễn Tiến Hùng',
                    doB: new Date("1989-10-26"),
                    salaryScale: 1,
                    startDate: new Date("2022-07-10"),
                    department: "Phòng tạp vụ",
                    annualLeave: 10,
                    image: "https://i.pinimg.com/1200x/1f/cc/bd/1fccbd12e2b6ec8b3a64f1ac901fcd7e.jpg",
                  });
                user.save();
            }
        })
        app.listen(3000)
    })
    .catch(err=>console.log(err))
