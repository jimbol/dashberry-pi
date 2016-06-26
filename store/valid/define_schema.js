'use strict';

module.exports = (schema) => {
  return {

    /**
      * Shallow checks that all keys are valid and that all
        required keys are present
      * @method
      * @param {object} obj - The object being validated
    */

    all: (obj) => {
      let validatedObj = {};

      for (let key in obj) {
        let check = schema[key];
        let value = obj[key];

        if(check) {
          let result = check(value);

          if(!result[0]) { return false; }

          validatedObj[key] = result[1];

        } else {
          return false;
        }
      }

      return validatedObj;
    },

    /**
      * Shallow checks that all keys present are valid
      * @method
      * @param {object} obj - The object being validated
    */

    allPresent: (obj) => {
      let validatedObj = {};

      for (let key in obj) {
        if (key === '_id') { continue; }

        let check = schema[key];
        let value = obj[key];

        if(check) {
          let result = check(value, {ignoreRequired: true});
          if(!result[0]) { return false; }

          validatedObj[key] = result[1];

        } else {
          return false;
        }
      }

      return validatedObj;
    }
  };
};
