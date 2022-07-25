// Tạo phương thức để render ra trang điểm danh
exports.getRollcall = (req,res,next) => {
    res.render('rollcall',{
        pageTitle: 'Điểm danh',
        user: req.user,
        path:'/rollcall'
    })
}

// Tạo phương thức để render ra trang chi tiết điểm danh
exports.getRollCallDetails = (req, res, next) => {
  req.user.getRollCallDetails().then(attendance => {
    if(!attendance){
      res.redirect('/')
    }
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    // if (dd < 10) dd = '0' + dd;
    // if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '/' + mm + '/' + yyyy;
    // let today = new Date().toLocaleDateString();
    let rollCallToday = [];
    attendance.filter(i=>{
      if(i.date  === formattedToday){
        rollCallToday.push(i);
      }
    })
    console.log(rollCallToday);
    res.render('rollcall-details', {
      pageTitle: 'Chi tiết công việc',
      user: req.user,
      attendance: rollCallToday,
      path:'/rollcall-details'
    });
  });
};

// Tạo phương thức để update thông tin trong trang chi tiết điểm danh
exports.postRollcall = (req, res, next) => {
  const type = req.query.type;
  const workplace = req.body.workplace;
  req.user
    .getStatus(type, workplace)
    .then(status => {
      if (type === "start") {
        res.redirect("/");
      }else{
        res.redirect("/rollcall-details");
      }
    })
    .catch(err => console.log(err));
};