const { body } = require('express-validator');

const createFollowUpRules = [
  body('patient').isMongoId().withMessage('A valid patient id is required.'),
  body('reason').trim().notEmpty().withMessage('Reason is required.'),
  body('dueDate').isISO8601().withMessage('A valid due date is required.'),
  body('assignedClinician').isMongoId().withMessage('A valid clinician id is required.'),
];

module.exports = { createFollowUpRules };
