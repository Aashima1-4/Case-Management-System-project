const express = require('express');
const {
  getCases,
  getCase,
  createCase,
  searchCase,
  updateCase,
  deleteCase,
} = require('../controllers/caseController');
const { protect } = require('../../../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCases)
  .post(createCase);

router.get('/search/:term', searchCase);

router.route('/:id')
  .get(getCase)
  .put(updateCase)
  .delete(deleteCase);

module.exports = router;
