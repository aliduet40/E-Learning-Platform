const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/error");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createAssignment,
  getAssignment,
  submitAssignment,
  gradeSubmission,
  getAssignmentSubmissions,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

// Validation rules
const assignmentValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
];

const gradeValidation = [
  body("grade")
    .isInt({ min: 0 })
    .withMessage("Grade must be a positive integer"),
  body("feedback").optional().isString(),
];

// Assignment routes
router.post(
  "/lessons/:id/assignment",
  protect,
  authorize("instructor", "admin"),
  assignmentValidation,
  validate,
  createAssignment,
);
router.get("/:id", protect, getAssignment);
router.post(
  "/:id/submit",
  protect,
  authorize("student"),
  upload.single("assignment"),
  submitAssignment,
);
router.get(
  "/:id/submissions",
  protect,
  authorize("instructor", "admin"),
  getAssignmentSubmissions,
);
router.put("/:id", protect, authorize("instructor", "admin"), updateAssignment);
router.delete(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  deleteAssignment,
);

// Submission routes
router.put(
  "/submissions/:id/grade",
  protect,
  authorize("instructor", "admin"),
  gradeValidation,
  validate,
  gradeSubmission,
);

module.exports = router;
