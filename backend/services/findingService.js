const ClinicalFinding = require('../models/ClinicalFinding');
const auditService = require('./auditService');

/**
 * Persists a clinical finding produced by the rule engine and records
 * an audit entry for it. Findings are decision-support cues, never a
 * diagnosis — callers should always phrase `finding` as "requires
 * clinical review" language.
 */
async function createFinding({ patient, finding, severity, reason, sourceType, sourceModel, sourceId, sourceData, ruleId }, actingUser) {
  const created = await ClinicalFinding.create({
    patient,
    finding,
    severity,
    reason,
    sourceType,
    sourceModel,
    sourceId,
    sourceData,
    ruleId: ruleId || null,
    status: 'Open',
  });

  await auditService.logAction({
    user: actingUser,
    action: 'Finding generated',
    entity: 'ClinicalFinding',
    entityId: created._id,
    details: { patient, severity, reason },
  });

  return created;
}

module.exports = { createFinding };
