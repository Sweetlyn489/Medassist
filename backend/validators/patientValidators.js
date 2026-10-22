const { body } = require('express-validator');

const createPatientRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.'),
  body('dateOfBirth').isISO8601().withMessage('A valid date of birth is required.'),
  body('gender').isIn(['Female', 'Male', 'Other', 'Undisclosed']).withMessage('A valid gender is required.'),
  body('allergies').optional().isArray().withMessage('Allergies must be an array.'),
  body('medicalHistory').optional().isArray().withMessage('Medical history must be an array.'),
];

module.exports = { createPatientRules };
