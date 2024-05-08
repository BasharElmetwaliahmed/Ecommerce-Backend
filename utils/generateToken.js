const jwt = require('jsonwebtoken');

module.exports = (user) => {
  console.log(process.env.EXPIRES_IN);
  return jwt.sign({_id:user._id,email:user.email,name:user.name }, process.env.SECRET_KEY, {
  
    expiresIn: process.env.EXPIRES_IN,
  });
};
