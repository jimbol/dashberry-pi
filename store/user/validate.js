"use strict";

let valid = require('../valid');

module.exports = valid.defineSchema({
  _id: valid.mongoId({
    many: false,
    required: true,
  }),

  sub: valid.str({
    required: true,
    length: {
      min: 0,
      max: 64
    }
  }),

  email: valid.str({
    required: true,
    length: {
      min: 0,
      max: 128
    }
  }),

  picture: valid.str({
    required: true,
    length: {
      min: 0,
      max: 256
    }
  }),

  given_name: valid.str({
    required: true,
    alpha: true,
    length: {
      min: 0,
      max: 64
    }
  }),

  family_name: valid.str({
    required: true,
    alpha: true,
    length: {
      min: 0,
      max: 64
    }
  }),

  name: valid.str({
    required: true,
    length: {
      min: 0,
      max: 128
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
