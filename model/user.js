const Rollcall = require("./rollcall");
const Absence = require("./absence");
const Status = require("./status");

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    doB: {
        type: Date,
        required: true
    },
    salaryScale: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    annualLeave: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

userSchema.methods.getStatus = function(type, workplace) {
    const user = this;
    let currAttendId;
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '/' + mm + '/' + yyyy;
    return Status.findOne({ userId: user._id })
      .then(status => {
        currAttendId = status.attendId;
        if (type === "start") {
          return this.addAttendance(
            currAttendId,
            formattedToday,
            new Date(),
            workplace
          ).then(result => {
              currAttendId = result._id;
              return Status.findOne({ userId: user._id });
            })
            .then(status => {
              status.attendId = currAttendId;
              status.workplace = workplace;
              status.isWorking = true;
              return status.save();
            })
            .catch(err => console.log(err));
        } else {
          return this.finishAttendance(currAttendId, new Date())
            .then((result) => {
              return Status.findOne({ userId: user._id });
            })
            .then(status => {
              status.isWorking = false;
              status.workplace = "Chưa xác định";
              return status.save();
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
};
  
// Stop Working
userSchema.methods.finishAttendance = function (attendId, endTime) {
return Rollcall.findById(attendId).then(attendance => {
    attendance.endTime = endTime;
    // attendance.details[0].endTime = endTime;
    return attendance.save();
});
};
  
// Start

userSchema.methods.addAttendance = function(
    attendId,
    date,
    startTime,
    workplace
){
    const newAttend = new Rollcall({
        userId: this._id,
        date: date,
        startTime: startTime,
        endTime: null,
        workplace: workplace
        });
        return newAttend.save();
};

userSchema.methods.getRollCallDetails = function() {
return Status.findOne({ userId: this._id }).then(status => {
    return Rollcall.find()
    .then((attendance) => {
        return attendance;
    })
    .catch((err) => console.log(err));
});
};

userSchema.methods.getStatistic = function () {
    const statistics = [];
    return Rollcall.find({ userId: this._id }).then((attendances) => {
        attendances.forEach((attendance) => {
            statistics.push({
            userId: attendance.userId,
            date: attendance.date,
            startTime: attendance.startTime,
            endTime: attendance.endTime,
            workplace: attendance.workplace,
            attend: true
            });
        });

    return Absence.find({ userId: this._id })
    .then((absences) => {
        absences.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        })
        absences.forEach((absence) => {
        statistics.push({
            userId: absence.userId,
            date: absence.date.toLocaleDateString(),
            reason: absence.reason,
            days: absence.days,
            attend: false
        });
        });
        statistics.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        })
        return statistics;
    });
    })
    .catch((err) => console.log(err));
};

module.exports = mongoose.model('User',userSchema);