const Sequelize = require ('sequelize');
const Posts = require('./posts.js')

//sequelize connection with database
 const connection = new Sequelize('blog', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
host:  'localhost',
dialect: 'postgres',
operatorsAliases: false
 });
 //Define the model
 const Comments = connection.define('comments', {
     username: Sequelize.STRING,
     message: Sequelize.TEXT,
 });
 Posts.hasMany(Comments);
 Comments.belongsTo(Posts);

 //create table
 connection.sync()
 .then(() => console.log(`Comments table been created!`))
 .catch((error) => console.log(`couldn't create a table, here is the error: ${error.stack}`));

 module.exports = Comments;