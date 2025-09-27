const { body, validationResult } = require('express-validator');

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .isLength({ min: 10, max: 15 })
    .withMessage('Please provide a valid phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  
  body('location.address')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Please provide a valid address')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const recommendationValidation = [
  body('soilType')
    .isIn(['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky'])
    .withMessage('Invalid soil type'),
  
  body('area')
    .isFloat({ min: 0.1 })
    .withMessage('Area must be at least 0.1 acres'),
  
  body('irrigationFrequency')
    .isIn(['daily', 'weekly', 'bi-weekly', 'monthly', 'seasonal'])
    .withMessage('Invalid irrigation frequency'),
  
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude')
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  recommendationValidation,
  handleValidationErrors
};
