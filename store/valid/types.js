'use strict';

let validator = require('validator');

module.exports = {

  mongoId: (args) => {
    let required = args.required;
    let many = args.many;

    let validate = (value, options) => {
      options = options || {};
      let ignoreRequired = options.ignoreRequired;

    // handle list of ids
      if(many && Array.isArray(value)) {
        return value.map((id) => {
          return validate(id);
        });
      }

    // Validate
      if (required && !ignoreRequired && value == null) {
        return [false, value];
      }

      if (!required && value == null) {
        return [true, value];
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

    return (value, options) => {
      options = options || {};
      let ignoreRequired = options.ignoreRequired;

    // Validate
      if (required && !ignoreRequired && value == null) {
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
  }
};
