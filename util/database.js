const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete','root','19H31733a@!',{
    dialect:'mysql',
    host:'localhost'
});

module.exports = sequelize;