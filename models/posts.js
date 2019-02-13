const Sequelize = require ('sequelize');
const Users = require('./users.js')

//sequelize connection with database
 const connection = new Sequelize('blog', 'Elena', 'BardYlvisaker', {
host:  'localhost',
dialect: 'postgres',
operatorsAliases: false
 });
 //Define the model
 const Posts = connection.define('posts', {
     title: Sequelize.STRING,
     body: Sequelize.TEXT,
    

 });

 Users.hasMany(Posts);
 Posts.belongsTo(Users);
 

 //create table
 connection.sync()
 .then(() => console.log(`Posts table been created!`))
 .catch((error) => console.log(`couldn't create a table, here is the error: ${error.stack}`));

 module.exports = Posts;