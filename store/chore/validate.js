'use strict';

let valid = require('../valid');

module.exports = valid.handler({
  label: valid.str({
    required: true,
    alpha: true,
    length: {
      min: 2,
      max: 64
    }
  }),
  person_id: valid.mongoId({
    many: false,
    required: false,
  })
});
