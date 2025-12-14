const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const signupValidator = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const templateValidator = [
  body('name').trim().isLength({ min: 1 }).withMessage('Template name is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Template content is required'),
  handleValidationErrors
];

const eventValidator = [
  body('template_id').isInt().withMessage('Template ID must be a valid integer'),
  body('trigger_type').isIn(['webhook', 'scheduled', 'manual']).withMessage('Invalid trigger type'),
  handleValidationErrors
];

module.exports = {
  signupValidator,
  loginValidator,
  templateValidator,
  eventValidator
};

