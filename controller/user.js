// Khai báo biến được import từ model
const User = require('../model/user');
const Status = require('../model/status');
const Rollcall = require('../model/rollcall');
const fileHelper = require('../util/file');
//const rows_per_page = 30;

// Tạo phương thức để render ra trang chủ
exports.getHomePage = (req,res,next) => {
    if(!req.session.isLoggedIn){
        return res.redirect('/login')
    }
    const user = req.user
    res.render('homepage',{
        pageTitle: 'Homepage',
        user: user,
        path:'/',
    })
};

// Tạo phương thức để render ra xem/sửa thông tin cá nhân
exports.getUser = (req,res,next)=>{
    const user = req.user
    res.render('user',{
        pageTitle: 'User',
        user: user,
        path:'/user',
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
    const image = req.file;
    User.findById(userId).then(user =>{
        if(image){
            fileHelper.deleteFile(user.image);
            user.image = image.path;
        }
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
    .findById('62da86111cc5615f5a93cba5')
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
    const rows_per_page = +req.query.rows || 20;
    const page = +req.query.page || 1;    
    let rowCount;
    function* jumpAndSliceGenerator(arr, n) {
        let start = 0;
        while(start + n < arr.length) {
            const end = start + n;
            const part = arr.slice(start, end);
            start =  end;
            yield part;
        }
        yield arr.slice(start);
    }
    req.user.getStatistic()
    .then(statistics => {
        rowCount = statistics.length
        totalTime = 0;
        statistics.forEach(i =>{
            if(i.attend){
                totalTime += ((i.endTime - i.startTime)/(3600 * 1000)) 
            }
        })
        let a = [];
        for(const arrPart of jumpAndSliceGenerator(statistics,rows_per_page)){
            a.push(arrPart)
        }
        res.render("search", {
            pageTitle: "Tra cứu thông tin",
            user: req.user,
            statistics: a[page-1],
            currentPage: page,
            hasNextPage: rows_per_page * page < rowCount,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(rowCount/rows_per_page),
            totalTime: totalTime,
            mon: null,
            pagination: true,
            type: 'details',
            path:'/search'
          });
    });
};


exports.getSalary = function(req,res,next){
    const month = req.query.month
    salaryFilter = []
    req.user.getStatistic()
    .then(statistics =>{
        statistics.filter(i =>{
            if(i.date.split('/')[1] == month){
               salaryFilter.push(i)
            }
        })
        let totalTime = 0;
        let salary = 0;
        let overTime =0;
        let underTime =0;
        salaryFilter.forEach(i =>{
        if(i.attend){
            totalTime += ((i.endTime - i.startTime)/(3600 * 1000))
        }
        })
        overTime = totalTime > 8 ? totalTime - 8 : 0;
        underTime = totalTime < 8 ? 8 - totalTime : 0;
        salary = (req.user.salaryScale * 3000000 +
            (overTime - underTime) * 200000)
            .toLocaleString("vi-VN", { style: "currency", currency: "VND" }
        );

        res.render("search", {
            pageTitle: "Tra cứu thông tin",
            user: req.user,
            statistics: salaryFilter,
            totalTime: totalTime,
            sal: salary,
            pagination:false,
            mon: month,
            type: 'details',
            path:'/search'
          });
    })
    .catch(err => console.log(err))
}

// Tạo phương thức để render ra nội dung trang sau khi 
// người dùng ấn nút tra cứu thông tin ở trang tra cứu
exports.getStatisticSearch = function (req, res, next) {
    const {type, search} = req.query;
    req.user
    .getStatistic()
    .then(statistics => {
    var currStatistic = [],
    attendStatistic = [],
    absentStatistic = [];
    totalTime = 0;
    overTime =0;
    underTime = 0;
    if(type == 'date'){
        attendStatistic = statistics.filter(item => 
            Rollcall.checkSearch(search, item.date.toString()) && item.attend);
        absentStatistic = statistics.filter(item => 
            Rollcall.checkSearch(search, item.date.toString()) && !item.attend);
           
        if (attendStatistic.length > 0) {
        attendStatistic.forEach((i) => {
            if (!i.endTime) {
                i.totalTime = "Chưa kết thúc";
            } else {
                totalTime += ((i.endTime - i.startTime)/(3600 * 1000));
        }});
        
        overTime = totalTime > 8 ? totalTime - 8 : 0;
        underTime = totalTime < 8 ? 8 - totalTime : 0;
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
        totalTime: totalTime,
        mon: null,
        pagination: false,
        type: "salary",
        path:'/search'
    });
    })
    .catch(err => console.log(err));
};

exports.getConfirm = (req,res,next) =>{
    const userName = req.query.userName || 'Nguyễn Tiến Hùng'
   
    User.find().then(user => {
        let findUser = []
        user.filter(i =>{
            if(i.name === userName){
                findUser.push(i)
            }
        })
        
        req.user.getStatistic().then(statistics => {
            if(!statistics){
              res.redirect('/')
            }
            
            let a = [];
            statistics.filter(i =>{
                if(findUser.length>0 && i.userId.toLocaleString() === findUser[0]._id.toLocaleString()){
                    a.push(i)
                }
            })
            let overTime =0;
            let underTime =0;
            let totalTime = 0;
            let dayCount = 0
            a.forEach(i =>{
            if(i.attend){
                totalTime += ((i.endTime - i.startTime)/(3600 * 1000));
                dayCount++ ;
            }
            })
            overTime = totalTime*dayCount > 8*dayCount ? totalTime*dayCount - 8*dayCount : 0;
            underTime = totalTime*dayCount < 8*dayCount ? 8*dayCount - totalTime*dayCount : 0;
            res.render('confirm-data', {
              pageTitle: 'Xác nhận dữ liệu giờ làm',
              user: req.user,
              statistics: a,
              totalTime: totalTime,
              overTime: overTime,
              underTime: underTime,
              mon: false,
              userName: userName,
              path:'/confirm'
            })
        })
    }
)}
       
exports.getConfirmMonth = (req,res,next) =>{
    const userName = req.query.userName || 'Nguyễn Tiến Hùng'
    const month = req.query.month;
    User.find().then(user => {
        let findUser = []
        user.filter(i =>{
            if(i.name === userName){
                findUser.push(i)
            }
        })
        
        req.user.getStatistic().then(statistics => {
            if(!statistics){
              res.redirect('/')
            }
            
            let a = [];
            statistics.filter(i =>{
                if(findUser.length>0 && i.userId.toLocaleString() === findUser[0]._id.toLocaleString()){
                    a.push(i)
                }
            })
            let overTime =0;
            let underTime =0;
            let totalTime = 0;
            let dayCount = 0;
            let b = [];
            a.filter(i =>{
                if(i.date.split('/')[1] == month){
                   b.push(i)
                }
            })
            b.forEach(i =>{
            if(i.attend){
                totalTime += ((i.endTime - i.startTime)/(3600 * 1000));
                dayCount++ ;
            }
            })
            overTime = totalTime*dayCount > 8*dayCount ? totalTime*dayCount - 8*dayCount : 0;
            underTime = totalTime*dayCount < 8*dayCount ? 8*dayCount - totalTime*dayCount : 0;
            res.render('confirm-data', {
              pageTitle: 'Xác nhận dữ liệu giờ làm',
              user: req.user,
              statistics: b,
              totalTime: totalTime,
              overTime: overTime,
              underTime: underTime,
              mon : month,
              userName: userName,
              path:'/confirm'
            })
        })
    })
}