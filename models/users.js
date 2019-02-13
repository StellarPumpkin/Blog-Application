const Sequelize = require ('sequelize');

//sequelize connection with database
 const connection = new Sequelize('blog', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
host:  'localhost',
dialect: 'postgres',
operatorsAliases: false
 });
 //Define the model
 const Users = connection.define('users', {
     username: Sequelize.STRING,
     email: Sequelize.STRING,
     password: Sequelize.STRING
     

 });
 
 

 

 //create table
 connection.sync()
 .then(() => console.log(`Users table been created!`))
 .catch((error) => console.log(`couldn't create a table, here is the error: ${error.stack}`));

 module.exports = Users;
 