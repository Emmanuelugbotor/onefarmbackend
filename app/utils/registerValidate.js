const Joi = require('joi');
const bcrypt = require("bcryptjs");
exports.Register = (userObj) => {

  const schema = Joi.object({
    id: Joi.allow(),

    ref: Joi.allow(),

    address: Joi.allow(),

    email: Joi.string().email().required(),

    fullname: Joi.string().min(3).max(30).required(),

    number: Joi.number().required(),

    password: Joi.string().min(3).max(50).required(),
    // password: Joi.string()
    //   .pattern(new RegExp("^[a-zA-Z0-9]{3,50}$"))
    //   .required(),

    repeat_password: Joi.ref("password"),
  });
    let result = schema.validate(userObj);
    return result;
}