// Khai báo biến
const Absence = require("../model/absence");
const Rollcall = require("../model/rollcall");
const User = require("../model/user");

// Tạo phương thức để render ra trang đăng ký nghỉ phép
exports.getAbsence = (req, res, next) => {
  const disabledDates = [];
  Absence.find({ userId: req.user._id })
    .then((absences) => {
      const absencesDates = absences.map(i =>
        i.date.toLocaleDateString()
      );
      disabledDates.push(...absencesDates);
      return Rollcall.find({ userId: req.user._id });
    })
    .then((attendance) => {
      const attendanceDates = attendance.map(i =>
        new Date(i.date).toLocaleDateString()
      );
      disabledDates.push(...attendanceDates);
      res.render('absence', {
        pageTitle: "Đăng ký nghỉ phép",
        user: req.user,
        disabledDates: disabledDates,
        path: '/absence'
      });
    })
    .catch(err => console.log(err));
};

//Tạo phương thức khi người dùng ấn nút nghỉ phép
exports.postAbsence = (req, res, next) => {
  const { type, date, hours, dates, reason } = req.body;
  Absence.addAbsence(req.user._id, type, date, hours, dates, reason)
    .then((result) => {
      let delNum = type == 0 ? result.days : result.length;
      return User.updateOne(
        { _id: req.user._id },
        { $inc: { annualLeave: -delNum } }
      );
    })
    .then((result) => {
      res.redirect("/absence");
    })
    .catch(err => console.log(err));
};
