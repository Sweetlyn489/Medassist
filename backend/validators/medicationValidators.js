const { body } = require('express-validator');

const createMedicationRules = [
  body('medication').trim().notEmpty().withMessage('Medication name is required.'),
  body('dosage').trim().notEmpty().withMessage('Dosage is required.'),
  body('frequency').trim().notEmpty().withMessage('Frequency is required.'),
  body('route').optional().isIn(['Oral', 'IV', 'IM', 'Topical', 'Subcutaneous', 'Inhaled', 'Other']),
];

module.exports = { createMedicationRules };
