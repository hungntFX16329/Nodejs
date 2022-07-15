// Khai báo biến
const Covid = require('../model/covid');

// Tạo phương thức để render ra trang thông tin covid
exports.getCovidInfor = (req,res,next) =>{
  Covid
  .findOne({userId : req.user._id})
  .then(covid =>{
      if(!covid){
          const covid = new Covid({
              userId: req.user._id,
              bodyTemperatures:[],
              vaccine:[],
              positive:[]
          })
          return covid.save();
      }
      return covid;
  })
  .then(covid => {
      res.render('covid', {
        pageTitle: "Thông tin Covid",
        user: req.user,
        vaccine: covid.vaccine,
        path: '/covid'
      });
  })
  .catch(err => console.log(err));
}

// Tạo phương thức để update thông tin sau khi người dùng ấn nút đăng ký
exports.postCovid = (req, res, next) => {
  const type = req.query.type;
  Covid
  .findOne({ userId: req.user._id })
  .then(covid => {
    // Kiểm tra xem người dùng ấn nút đăng ký nào trong 3 nút  
    if (type === "temperature") {
      covid.bodyTemperatures.push({
        date: new Date(),
        value: req.body.temperature,
      });
    } else if (type === "positive") {
      covid.positive.push({ date: req.body.positive });
    } else {
      covid.vaccine.push({
          name: req.body.vaccineName, 
          date: req.body.vaccineDate
      })
    }
    return covid.save();
  })
  .then(() => {
    res.redirect("/covid-details");
  })
  .catch(err => console.log(err));
};
  
// Tạo phương thức để render ra trang thông tin chi tiết Covid
exports.getCovidDetails = (req, res, next) => {
  Covid
  .findOne({ userId: req.user._id })
  .then(covid => {
    if (covid) {
      return covid;
    } else {
      const covid = new Covid({
        userId: req.user._id,
        bodyTemperatures: [],
        vaccine: [],
        positive: [],
      });
      return covid.save();
    }
  })
  .then(covid => {
    res.render('covid-details', {
      pageTitle: "Thông tin Covid",
      user: req.user,
      covid: covid,
      path: '/covid-details'
    });
  })
  .catch(err => console.log(err));
};
