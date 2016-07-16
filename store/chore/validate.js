"use strict";

let valid = require('../valid');

module.exports = valid.defineSchema({
  label: valid.str({
    required: true,
    alpha: true,
    length: {
      min: 2,
      max: 64
    }
  }),
  owner_id: valid.mongoId({
    many: false,
    required: true,
  }),
  person_id: valid.mongoId({
    many: false,
    required: false,
  })
});
