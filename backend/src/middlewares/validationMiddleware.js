const { body, validationResult } = require("express-validator");

exports.validateEmployee = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("pan")
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage("Invalid PAN format (e.g. ABCDE1234F)"),
  body("monthly_ctc").isNumeric().withMessage("CTC must be a number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];
