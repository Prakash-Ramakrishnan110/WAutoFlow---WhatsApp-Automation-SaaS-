const express = require('express');
const router = express.Router();
const {
  getAllTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate
} = require('../controllers/templateController');
const { templateValidator } = require('../utils/validators');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/', getAllTemplates);
router.get('/:id', getTemplate);
router.post('/', templateValidator, createTemplate);
router.put('/:id', templateValidator, updateTemplate);
router.delete('/:id', deleteTemplate);

module.exports = router;

