/**
 * Role codes: Ad=Admin, Sso=SSO, SSA, Sa=SA, La=LA
 */
const ROLES = {
  ADMIN: 'Admin',
  SSO: 'SSO',
  SSA: 'SSA',
  SA: 'SA',
  LA: 'LA',
  RECEIVING: 'Receiving Department',
  ADMINISTRATION: 'Administration',
};

const PUBLIC_REGISTER_ROLES = [ROLES.SA, ROLES.SSA, ROLES.SSO, ROLES.LA];

const CASE_CREATE_ROLES = [ROLES.ADMIN, ROLES.RECEIVING, ROLES.LA];
const CASE_UPDATE_ROLES = [ROLES.ADMIN, ROLES.LA, ROLES.SA, ROLES.SSA, ROLES.SSO];
const CASE_DELETE_ROLES = [ROLES.ADMIN];
const CASE_ALLOT_ROLES = [ROLES.ADMIN];
const CASE_TEAM_ASSIGN_ROLES = [ROLES.SSO, ROLES.ADMIN];

const LA_FIELDS = ['laFunctionalDetails', 'isLACompleted', 'collectedDate'];
const SA_OPENING_FIELDS = [
  'caseOpenDate', 'caseOpenTime', 'noOfParcels', 'noOfExhibits',
  'conditionOfExhibit', 'whoHelped',
];
const EVIDENCE_FIELDS = [
  'evidenceStatus', 'evidencePhase', 'startedDate', 'finishDate',
  'reportedDate', 'collectedDate', 'pendingReason',
];
const ALLOTMENT_FIELDS = [
  'allottedTo', 'allottedBy', 'allottedDate', 'allottedTime',
  'previousAllottedTo', 'previousAllottedBy', 'previousAllottedDate',
  'previousAllottedTime', 'status',
];
const TEAM_FIELDS = [
  'teamMemberName', 'teamMemberPosition', 'teamAssignmentDate',
  'teamAssignmentTime', 'status',
];
const BASE_FIELDS = [
  'caseNo', 'firNo', 'us', 'rcNo', 'date', 'time', 'personName', 'laName',
];

function getAllowedUpdateFields(role) {
  switch (role) {
    case ROLES.ADMIN:
      return [...BASE_FIELDS, ...LA_FIELDS, ...SA_OPENING_FIELDS, ...EVIDENCE_FIELDS, ...ALLOTMENT_FIELDS, ...TEAM_FIELDS];
    case ROLES.LA:
      return [...LA_FIELDS];
    case ROLES.SA:
      return [...SA_OPENING_FIELDS, 'startedDate', 'finishDate', 'evidenceStatus', 'evidencePhase'];
    case ROLES.SSA:
      return [...SA_OPENING_FIELDS, ...EVIDENCE_FIELDS.filter(f => f !== 'collectedDate'), 'pendingReason'];
    case ROLES.SSO:
      return [...TEAM_FIELDS, 'pendingReason', 'startedDate', 'finishDate', 'reportedDate', 'evidenceStatus', 'evidencePhase'];
    default:
      return [];
  }
}

module.exports = {
  ROLES,
  PUBLIC_REGISTER_ROLES,
  CASE_CREATE_ROLES,
  CASE_UPDATE_ROLES,
  CASE_DELETE_ROLES,
  CASE_ALLOT_ROLES,
  CASE_TEAM_ASSIGN_ROLES,
  getAllowedUpdateFields,
};
