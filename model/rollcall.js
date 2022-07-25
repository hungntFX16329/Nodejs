const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const rollcallSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    workplace: {
        type: String, 
        required: true
    }
})

// Check wildcard search
rollcallSchema.statics.checkSearch = function (first, second){
    if (first.length == 0 && second.length == 0)
        return true;

    if (first.length > 1 && first[0] == '%' &&
        second.length == 0)
        return false;

    if ((first.length > 1 && first[0] == '_') ||
        (first.length > 0 && second.length > 0 &&
        first[0] == second[0]))
        return this.checkSearch(first.substring(1),
                    second.substring(1));

    if (first.length > 0 && first[0] == '%')
        return this.checkSearch(first.substring(1), second) ||
            this.checkSearch(first, second.substring(1));

    return false;
}

module.exports = mongoose.model('Rollcall',rollcallSchema)