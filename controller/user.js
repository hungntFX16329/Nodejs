// Khai báo biến được import từ model
const User = require('../model/user');
const Status = require('../model/status');
const Rollcall = require('../model/rollcall');

// Tạo phương thức để render ra trang chủ
exports.getHomePage = (req,res,next) => {
    const user = req.user
    res.render('homepage',{
        pageTitle: 'Homepage',
        user: user,
        path:'/'
    })
};

// Tạo phương thức để render ra xem/sửa thông tin cá nhân
exports.getUser = (req,res,next)=>{
    const user = req.user
    res.render('user',{
        pageTitle: 'User',
        user: user,
        path:'/user'
    })
}

// Tạo phương thức để render ra trang sửa thông tin cá nhân
exports.getEditUser = (req,res,next) =>{
    const editMode = req.query.edit;
    if(!editMode){
        return res.redirect('/')
    }
    const userId = req.params.userId;
    User.findById(userId)
    .then(user=>{
        res.render('edit-user',{
            user : user,
            pageTitle: 'Edit User',
            editing: editMode,
            path: '/edit-user'
        })
    })
    .catch(err => console.log(err))
}

// Tạo phương thức để update sau khi sửa thông tin cá nhân
exports.postEditUser = (req,res,next)=>{
    const userId = req.body.userId;
    const updatedImageUrl = req.body.image;
    User.findById(userId).then(user =>{
        user.image = updatedImageUrl;
        return user.save()
    }).then(result => {
        console.log('Updated User');
        res.redirect('user')
    })
    .catch(err => console.log(err))
}

// Tạo phương thức để hiển thị ra trạng thái làm việc
// của nhân viên ở trang chủ
exports.getStatus = (req, res, next) => {
    User
    .findById('62d38bf8887bde6b390cef33')
    .then(user => {
        req.user = user;
        return Status.findOne({ userId: user._id });
    })
    .then(result => {
        if (!result) {
            const status = new Status({
            userId: req.user._id,
            workplace: "Chưa xác định",
            isWorking: false,
            attendId: null,
            });
            return status.save();
        } else {
            return result;
        }
    })
    .then(result => {
        req.user.workplace = result.workplace;
        req.user.isWorking = result.isWorking;
        next();
    })
    .catch(err => console.log(err));
};

// Tạo phương thức để render ra trang tra cứu thông tin
exports.getStatistic = (req, res, next) => {
    req.user.getStatistic().then((statistics) => {
      res.render("search", {
        pageTitle: "Tra cứu thông tin",
        user: req.user,
        statistics: statistics,
        type: 'details',
        path:'/search'
      });
    });
};
  
// Tạo phương thức để render ra nội dung trang sau khi 
// người dùng ấn nút tra cứu thông tin ở trang tra cứu
exports.getStatisticSearch = function (req, res, next) {
    const {type, search} = req.query;
    req.user
    .getStatistic()
    .then((statistics) => {
    var currStatistic = [],
    attendStatistic = [],
    absentStatistic = [];
    if(type == 'date'){
        attendStatistic = statistics.filter(item => 
            Rollcall.checkSearch(search, item.date.toString()) && item.attend);
        absentStatistic = statistics.filter(item => 
            Rollcall.checkSearch(search, item.date.toString()) && !item.attend);
        if (attendStatistic.length > 0) {
        attendStatistic.forEach((item) => {
            if (!item.details[0].endTime) {
                item.totalTime = "Chưa kết thúc";
            } else {
            item.totalTime = item.details.reduce((sum, detail) =>
                sum + (detail.endTime - detail.startTime) / 3600000,0);
            item.overTime = item.totalTime > 8 ? item.totalTime - 8 : 0;
            item.underTime = item.totalTime < 8 ? 8 - item.totalTime : 0;
            }
        });
        const totalTime = attendStatistic.reduce(
            (sum, item) => sum + item.totalTime,0);
        const overTime = attendStatistic.reduce(
            (sum, item) => sum + item.overTime,0);
        const underTime = attendStatistic.reduce(
            (sum, item) => sum + item.underTime,0);
        currStatistic = [...attendStatistic, ...absentStatistic];
        currStatistic.overTime = overTime;
        currStatistic.underTime = underTime;
        if (typeof totalTime === "string") {
            currStatistic.salary = "Chưa kết thúc";
        } else {
            currStatistic.salary = (req.user.salaryScale * 3000000 +
            (overTime - underTime) * 200000)
            .toLocaleString("vi-VN", { style: "currency", currency: "VND" });
        }
        }
    }
    res.render("search", {
        pageTitle: "Tra cứu thông tin",
        user: req.user,
        statistics: currStatistic,
        type: "salary",
        path:'/search'
    });
    })
    .catch(err => console.log(err));
};

