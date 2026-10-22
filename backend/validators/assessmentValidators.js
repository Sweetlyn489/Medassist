const { body } = require('express-validator');

const createAssessmentRules = [
  body('chiefComplaint').trim().notEmpty().withMessage('Chief complaint is required.'),
  body('symptoms').optional().isArray().withMessage('Symptoms must be an array.'),
  body('vitals').optional().isObject().withMessage('Vitals must be an object.'),
];

module.exports = { createAssessmentRules };
