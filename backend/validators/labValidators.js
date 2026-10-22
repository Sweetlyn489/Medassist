const { body } = require('express-validator');

const createLabRules = [
  body('test').trim().notEmpty().withMessage('Test name is required.'),
  body('result').isFloat().withMessage('Result must be a number.'),
  body('unit').trim().notEmpty().withMessage('Unit is required.'),
  body('referenceLow').isFloat().withMessage('Reference low must be a number.'),
  body('referenceHigh').isFloat().withMessage('Reference high must be a number.'),
];

module.exports = { createLabRules };
