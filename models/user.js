const getDb = require('../util/database').getDb
const mongodb = require('mongodb')

const ObjectId = mongodb.ObjectId

class User {
  constructor(username, email){
    this.username = username;
    this.email = email;
  }
  save(){
    const db = getDb();
    return db.collection('users').insertOne(this)
  }
  static findById(userId){
    const db = getDb();
    return db.collection('users').findOne({_id: new ObjectId(userId)}).next()
  }
}


module.exports = User;
