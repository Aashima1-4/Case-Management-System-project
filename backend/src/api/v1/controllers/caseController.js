const Case = require('../../../models/Case');
const {
  ROLES,
  CASE_CREATE_ROLES,
  CASE_UPDATE_ROLES,
  CASE_DELETE_ROLES,
  getAllowedUpdateFields,
} = require('../../../config/permissions');

const SORTABLE_FIELDS = ['createdAt', 'caseNo', 'firNo', 'status', 'evidenceStatus', 'allottedTo', 'laName'];

function buildRoleFilter(user, query) {
  const filter = {};
  if (user.role === ROLES.SSO) {
    filter.allottedTo = user.email;
  } else if (user.role === ROLES.LA) {
    filter.laName = user.email;
  }
  if (query.allottedTo && [ROLES.ADMIN, ROLES.ADMINISTRATION].includes(user.role)) {
    filter.allottedTo = query.allottedTo;
  }
  if (query.laName && user.role === ROLES.ADMIN) {
    filter.laName = query.laName;
  }
  if (query.status) filter.status = query.status;
  if (query.evidenceStatus) filter.evidenceStatus = query.evidenceStatus;
  if (query.isLACompleted !== undefined) {
    filter.isLACompleted = query.isLACompleted === 'true';
  }
  if (query.search) {
    const term = query.search.trim();
    filter.$or = [
      { caseNo: { $regex: term, $options: 'i' } },
      { firNo: { $regex: term, $options: 'i' } },
      { personName: { $regex: term, $options: 'i' } },
    ];
  }
  return filter;
}

function pickAllowedFields(body, allowedFields) {
  const updates = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  return updates;
}

exports.getCases = async (req, res) => {
  try {
    const filter = buildRoleFilter(req.user, req.query);
    const sortBy = SORTABLE_FIELDS.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [cases, total] = await Promise.all([
      Case.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit),
      Case.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: cases,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCase = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }
    if (req.user.role === ROLES.SSO && caseItem.allottedTo !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (req.user.role === ROLES.LA && caseItem.laName && caseItem.laName !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.status(200).json({ success: true, data: caseItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.searchCase = async (req, res) => {
  try {
    const term = req.params.term;
    const filter = {
      $or: [
        { caseNo: { $regex: term, $options: 'i' } },
        { firNo: { $regex: term, $options: 'i' } },
      ],
    };
    if (req.user.role === ROLES.SSO) {
      filter.allottedTo = req.user.email;
    }
    const results = await Case.find(filter).sort({ createdAt: -1 }).limit(20);
    if (!results.length) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }
    res.status(200).json({ success: true, data: results.length === 1 ? results[0] : results });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.createCase = async (req, res) => {
  try {
    if (!CASE_CREATE_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not allowed to register cases' });
    }
    const payload = { ...req.body, status: req.body.status || 'Registered' };
    if (req.user.role === ROLES.LA) {
      payload.laName = req.user.email;
    }
    const caseItem = await Case.create(payload);
    res.status(201).json({ success: true, data: caseItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCase = async (req, res) => {
  try {
    if (!CASE_UPDATE_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not allowed to update cases' });
    }
    let caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }
    if (req.user.role === ROLES.SSO && caseItem.allottedTo !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (req.user.role === ROLES.LA && caseItem.laName && caseItem.laName !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const allowedFields = getAllowedUpdateFields(req.user.role);
    const updates = pickAllowedFields(req.body, allowedFields);

    if (req.user.role === ROLES.ADMIN && req.body.allottedTo) {
      Object.assign(updates, pickAllowedFields(req.body, [
        'allottedTo', 'allottedBy', 'allottedDate', 'allottedTime',
        'previousAllottedTo', 'previousAllottedBy', 'previousAllottedDate',
        'previousAllottedTime', 'status',
      ]));
    }
    if ([ROLES.SSO, ROLES.ADMIN].includes(req.user.role) && req.body.teamMemberName) {
      Object.assign(updates, pickAllowedFields(req.body, [
        'teamMemberName', 'teamMemberPosition', 'teamAssignmentDate',
        'teamAssignmentTime', 'status',
      ]));
    }

    caseItem = await Case.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: caseItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCase = async (req, res) => {
  try {
    if (!CASE_DELETE_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only Admin can delete cases' });
    }
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }
    await caseItem.deleteOne();
    res.status(200).json({ success: true, message: 'Case deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
