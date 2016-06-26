'use strict';

let types = require('./types');
let defineSchema = require('./define_schema');

types.defineSchema = defineSchema;

module.exports = types;
