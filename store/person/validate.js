"use strict";

let valid = require('../valid');

module.exports = valid.defineSchema({
  first_name: valid.str({
    required: true,
    alpha: true,
    length: {
      min: 0,
      max: 64
    }
  }),
  
  last_name: valid.str({
    required: true,
    alpha: true,
    length: {
      min: 0,
      max: 64
    }
  }),

  assigned_chore_ids: valid.mongoId({
    many: true,
    required: false,
  }),

  owned_chore_ids: valid.mongoId({
    many: true,
    required: false,
  })
});
