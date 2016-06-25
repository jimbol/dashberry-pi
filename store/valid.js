'use strict';

let validator = require('validator')

module.exports = {
  mongoId: (args) => {
    let required = args.required;
    let many = args.many;

    let validate = (value) => {

    // handle list of ids
      if(many && Array.isArray(value)) {
        return value.map((id) => {
          return validate(id);
        });
      }

    // Validate
      if (required && value == null) {
        return [false, value];
      }

      if (!validator.isMongoId(value)) {
        return [false, value];
      }

      return [true, value];
    }

    return validate;
  },

  str: (args) => {
    let length = args.length;
    let required = args.required;
    let alpha = args.alpha;
    let encode = args.encode;

    return (value) => {

    // Validate
      if (required && value == null) {
        return [false, value];
      }

      if (alpha && !validator.isAlphanumeric(value, 'en-US')) {
        return [false, value];
      }

      if (!validator.isLength(value, length)) {
        return [false, value];
      }

    // Transform
      if (encode) {
        value = validator.escape(value);
      }

      return [true, value];
    }
  },

  // TODO: throw better errors

  handler: (schema) => {
    return (obj) => {
      let validatedObj = {};

      for (let key in obj) {
        let check = schema[key];
        let value = obj[key];

        // if there is no check for the key, dont include it
        // otherwise, validate
        if(check) {
          let result = check(value);

          if(!result[0]) { return false; }

          validatedObj[key] = result[1];

        } else {
          return false;
        }
      }

      return Object.freeze(validatedObj);
    }
  }
};
