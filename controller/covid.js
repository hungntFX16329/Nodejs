// Khai báo biến
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
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
      userId: req.user._id,
      covid: covid,
      path: '/covid-details'
    });
  })
  .catch(err => console.log(err));
};

exports.getDownloadInfo = (req,res,next) =>{
  const userId = req.params.userId;
  
  Covid.findOne({ userId: req.user._id })
  .then(covid => {
    if(!covid){
      return new Error('No information about covid found!')
    }
    const covidName = 'covidInfo-' + userId + '.pdf';
    const covidPath = path.join('data','covid-info',covidName);

    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition','inline; filename="'+ covidName + '"');
    pdfDoc.pipe(fs.createWriteStream(covidPath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Thông tin Covid cá nhân',{
      align: 'center',
      width: 410
    });
    pdfDoc.text('-----------------------',{
      align: 'center',
      width: 410
    })
    pdfDoc.font('fonts/Vollkorn-Italic-VariableFont_wght.ttf').fontSize(20).text('Nhiệt độ cơ thể đo được qua các ngày như sau:',{
      width: 410
    })
    covid.bodyTemperatures.forEach(temp => {
      pdfDoc.fontSize(16).text(temp.date.toLocaleDateString() + ' vào lúc ' + temp.date.toLocaleTimeString() + ' là '+temp.value +'độ C')
    });
    
    pdfDoc.font('fonts/Vollkorn-Italic-VariableFont_wght.ttf').fontSize(20).text('Xét nghiệm dương tính với Covid:',{
      width: 410
    })
    covid.positive.forEach(p =>{
      pdfDoc.font('fonts/Vollkorn-Italic-VariableFont_wght.ttf').fontSize(16).text('Ngày dương tính với Codvid là ngày '+' : '+p.date.toLocaleDateString())
    })

    pdfDoc.font('fonts/Vollkorn-Italic-VariableFont_wght.ttf').fontSize(20).text('Thông tin tiêm vắc xin',{
      width: 410
    })
    let i = 0;
    covid.vaccine.forEach(vac =>{
      i++
      pdfDoc.font('fonts/Vollkorn-Italic-VariableFont_wght.ttf').fontSize(16).text('Lần tiêm số '+ i + ' là vào ngày '+' : '+vac.date.toLocaleDateString()+', '+ 'Tên vắc xin '+' : '+ vac.name)
    })

    pdfDoc.end();
  })
  .catch(err => console.log(err))
}
