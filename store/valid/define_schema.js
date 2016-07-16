'use strict';

module.exports = (schema) => {
  return {

    all: (obj) => {
      let validatedObj = {};

      for (let key in obj) {
        if (key === '_id') { continue; }

        let check = schema[key];
        let value = obj[key];

        if(check) {
          let result = check(value);

          if(!result[0]) {

            console.dir({
              message: '[INVALID-PROPERTY]',
              key: key,
              value: value
            });

            return false;
          }

          validatedObj[key] = result[1];

        } else {
          console.dir({
            message: '[UNEXPECTED-PROPERTY]',
            key: key
          });

          return false;
        }
      }

      return validatedObj;
    },

    allPresent: (obj) => {
      let validatedObj = {};

      for (let key in obj) {
        if (key === '_id') { continue; }

        let check = schema[key];
        let value = obj[key];

        if(check) {
          let result = check(value, {ignoreRequired: true});

          if(!result[0]) {
            console.dir({
              message: '[INVALID-PROPERTY]',
              key: key,
              value: value
            });

            return false;
          }

          validatedObj[key] = result[1];

        } else {
          console.dir({
            message: '[UNEXPECTED-PROPERTY]',
            key: key
          });

          return false;
        }
      }

      return validatedObj;
    }
  };
};
