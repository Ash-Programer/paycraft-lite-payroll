const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");
const empController = require("../controllers/employeeController.js");
const slipController = require("../controllers/payslipController.js");
const { protect, authorize } = require("../middlewares/authMiddleware.js");
const { validateEmployee } = require("../middlewares/validationMiddleware.js");

// Public
router.post("/login", authController.login);

// HR Only
router.post(
  "/employees",
  protect,
  authorize("HR"),
  validateEmployee,
  empController.addEmployee,
);
router.get(
  "/employees",
  protect,
  authorize("HR"),
  empController.getAllEmployees,
);
router.post(
  "/payslips/generate",
  protect,
  authorize("HR"),
  slipController.generate,
);

// Both (History logic filters by role internally)
router.get("/payslips", protect, slipController.getHistory);

router.get("/payslips/:id/download", protect, slipController.download);

module.exports = router;
