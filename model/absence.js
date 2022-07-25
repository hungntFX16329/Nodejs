const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const absenceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  reason: {
    type: String,
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
});

absenceSchema.statics.addAbsence = function (
  userId,
  type,
  date,
  hours,
  dates,
  reason
) {
  const today2 = new Date(date);
  const yyyy2 = today2.getFullYear();
  let mm2 = today2.getMonth() + 1; // Months start at 0!
  let dd2 = today2.getDate();
  let formattedToday2 = dd2 + '/' + mm2 + '/' + yyyy2;

  if (type == 1) {
    const dateArr = dates.split(",");
    const newAbsence = [];
    dateArr.forEach((date) => {
      const today = new Date(date);
      const yyyy = today.getFullYear();
      let mm = today.getMonth() + 1; // Months start at 0!
      let dd = today.getDate();
      let formattedToday = dd + '/' + mm + '/' + yyyy;

      newAbsence.push({
        userId: userId,
        date: formattedToday,
        days: 1,
        reason: reason,
      });
    });
    return this.insertMany(newAbsence);
  } else if (type == 0) {
    const newAbsence = {
      userId: userId,
      date: formattedToday2,
      days: hours / 8,
      reason: reason,
    };
    return this.create(newAbsence);
  }
};

module.exports = mongoose.model("Absence", absenceSchema);
