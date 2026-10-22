const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const Patient = require('../models/Patient');
const FollowUp = require('../models/FollowUp');
const ClinicalFinding = require('../models/ClinicalFinding');
const AuditLog = require('../models/AuditLog');
const Assessment = require('../models/Assessment');
const LaboratoryResult = require('../models/LaboratoryResult');
const User = require('../models/User');
const ClinicalRule = require('../models/ClinicalRule');

/**
 * GET /api/dashboard
 * Aggregates role-specific dashboards:
 * - Admin: platform governance, active clinicians, rule engine status, audit trail
 * - Clinician: clinical triage, review queue, abnormal labs/vitals, follow-ups
 */
const getDashboard = asyncHandler(async (req, res) => {
  // If Administrator, serve platform governance and operational metrics
  if (req.user && req.user.role === 'admin') {
    const [
      totalPatients,
      totalUsers,
      activeClinicians,
      totalRules,
      activeRules,
      auditLogsCount,
      recentAudit,
      cliniciansList,
    ] = await Promise.all([
      Patient.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ role: 'clinician', active: true }),
      ClinicalRule.countDocuments(),
      ClinicalRule.countDocuments({ active: true }),
      AuditLog.countDocuments(),
      AuditLog.find().populate('user', 'name role title').sort({ timestamp: -1 }).limit(10),
      User.find({ role: 'clinician' }).select('name email role title active').sort({ name: 1 }),
    ]);

    return sendSuccess(res, 200, {
      role: 'admin',
      stats: {
        totalPatients,
        totalUsers,
        activeClinicians,
        totalRules,
        activeRules,
        auditLogsCount,
      },
      systemHealth: {
        status: 'Operational',
        complianceStatus: 'HIPAA Monitored & Encrypted',
        ruleEngine: `${activeRules} of ${totalRules} Rules Active`,
      },
      cliniciansList,
      recentAudit,
    });
  }

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    openFindingsCount,
    highSeverityOpenCount,
    openFindingsList,
    dueFollowUps,
    upcomingFollowUps,
    recentPatients,
    recentAudit,
    totalPatients,
    abnormalRecentLabs,
    recentAssessmentsWithAnomalies,
  ] = await Promise.all([
    ClinicalFinding.countDocuments({ status: 'Open' }),
    ClinicalFinding.countDocuments({ status: 'Open', severity: 'High' }),
    ClinicalFinding.find({ status: 'Open' })
      .populate('patient', 'patientId firstName lastName bloodGroup')
      .sort({ severity: 1, createdDate: -1 }) // High/Moderate first
      .limit(10),
    FollowUp.find({ status: { $in: ['Scheduled', 'Due'] }, dueDate: { $lte: now } })
      .populate('patient', 'patientId firstName lastName bloodGroup')
      .populate('assignedClinician', 'name title')
      .sort({ dueDate: 1 })
      .limit(10),
    FollowUp.find({ status: 'Scheduled', dueDate: { $gt: now, $lte: in7Days } })
      .populate('patient', 'patientId firstName lastName bloodGroup')
      .populate('assignedClinician', 'name title')
      .sort({ dueDate: 1 })
      .limit(10),
    Patient.find().sort({ updatedAt: -1 }).limit(10),
    AuditLog.find().populate('user', 'name title').sort({ timestamp: -1 }).limit(12),
    Patient.countDocuments(),
    LaboratoryResult.find({
      $expr: {
        $or: [
          { $lt: ['$result', '$referenceLow'] },
          { $gt: ['$result', '$referenceHigh'] },
        ],
      },
    })
      .populate('patient', 'patientId firstName lastName')
      .sort({ date: -1 })
      .limit(8),
    Assessment.find({
      $or: [
        { 'vitals.heartRate': { $gt: 100 } },
        { 'vitals.heartRate': { $lt: 55 } },
        { 'vitals.systolicBP': { $gt: 140 } },
        { 'vitals.systolicBP': { $lt: 95 } },
        { 'vitals.oxygenSaturation': { $lt: 93 } },
        { 'vitals.temperatureC': { $gt: 38.0 } },
      ],
    })
      .populate('patient', 'patientId firstName lastName')
      .populate('clinician', 'name')
      .sort({ createdAt: -1 })
      .limit(6),
  ]);

  // Aggregate patients needing review
  const patientsNeedingReviewMap = new Map();

  for (const f of openFindingsList) {
    if (f.patient && f.patient._id) {
      const pid = String(f.patient._id);
      if (!patientsNeedingReviewMap.has(pid)) {
        patientsNeedingReviewMap.set(pid, {
          patient: f.patient,
          findingCount: 1,
          highestSeverity: f.severity,
          primaryReason: f.finding,
          lastFindingDate: f.createdDate,
        });
      } else {
        const item = patientsNeedingReviewMap.get(pid);
        item.findingCount += 1;
        if (f.severity === 'High') item.highestSeverity = 'High';
      }
    }
  }

  for (const fu of dueFollowUps) {
    if (fu.patient && fu.patient._id) {
      const pid = String(fu.patient._id);
      if (!patientsNeedingReviewMap.has(pid)) {
        patientsNeedingReviewMap.set(pid, {
          patient: fu.patient,
          findingCount: 0,
          highestSeverity: 'Overdue Follow-up',
          primaryReason: `Follow-up overdue: ${fu.reason}`,
          lastFindingDate: fu.dueDate,
        });
      }
    }
  }

  sendSuccess(res, 200, {
    stats: {
      totalPatients,
      openFindingsCount,
      highSeverityOpenCount,
      dueFollowUpsCount: dueFollowUps.length,
      abnormalLabsCount: abnormalRecentLabs.length,
    },
    patientsRequiringReview: Array.from(patientsNeedingReviewMap.values()),
    openFindingsList,
    abnormalRecentLabs,
    abnormalVitalsAssessments: recentAssessmentsWithAnomalies,
    dueFollowUps,
    upcomingFollowUps,
    recentPatients,
    recentAudit,
  });
});

module.exports = { getDashboard };
