import { body } from "express-validator";

// Allowed status enum values from supabase types (job_status_enum)
const JOB_STATUS = ["DRAFT", "ACTIVE", "PAUSED", "EXPIRED", "FILLED", "ARCHIVED"] as const;

export const createJobValidator = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required")
        .isLength({ min: 3, max: 120 }).withMessage("Title must be 3-120 characters"),
    body("employer_id")
        .notEmpty().withMessage("employer_id is required")
        .isUUID().withMessage("employer_id must be a valid UUID"),
    body("description")
        .optional()
        .trim()
        .isLength({ min: 10, max: 5000 }).withMessage("Description must be 10-5000 characters"),
    body("location")
        .optional()
        .trim()
        .isLength({ max: 160 }).withMessage("Location must be at most 160 characters"),
    body("job_type")
        .optional()
        .trim()
        .isLength({ max: 80 }).withMessage("job_type must be at most 80 characters"),
    body("min_salary")
        .optional()
        .isNumeric().withMessage("min_salary must be a number")
        .toFloat(),
    body("max_salary")
        .optional()
        .isNumeric().withMessage("max_salary must be a number")
        .toFloat()
        .custom((value, { req }) => {
            if (req.body.min_salary && value < req.body.min_salary) {
                throw new Error("max_salary must be >= min_salary");
            }
            return true;
        }),
    body("min_experience")
        .optional()
        .isInt({ min: 0 }).withMessage("min_experience must be a non-negative integer")
        .toInt(),
    body("max_experience")
        .optional()
        .isInt({ min: 0 }).withMessage("max_experience must be a non-negative integer")
        .toInt()
        .custom((value, { req }) => {
            if (req.body.min_experience && value < req.body.min_experience) {
                throw new Error("max_experience must be >= min_experience");
            }
            return true;
        }),
    body("status")
        .optional()
        .isIn(JOB_STATUS).withMessage(`status must be one of: ${JOB_STATUS.join(", ")}`),
    body("expires_at")
        .optional()
        .isISO8601().withMessage("expires_at must be a valid ISO8601 datetime"),
];

export const updateJobValidator = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 3, max: 120 }).withMessage("Title must be 3-120 characters"),
    body("employer_id")
        .optional()
        .isUUID().withMessage("employer_id must be a valid UUID"),
    body("description")
        .optional()
        .trim()
        .isLength({ min: 10, max: 5000 }).withMessage("Description must be 10-5000 characters"),
    body("location")
        .optional()
        .trim()
        .isLength({ max: 160 }).withMessage("Location must be at most 160 characters"),
    body("job_type")
        .optional()
        .trim()
        .isLength({ max: 80 }).withMessage("job_type must be at most 80 characters"),
    body("min_salary")
        .optional()
        .isNumeric().withMessage("min_salary must be a number")
        .toFloat(),
    body("max_salary")
        .optional()
        .isNumeric().withMessage("max_salary must be a number")
        .toFloat()
        .custom((value, { req }) => {
            if (req.body.min_salary && value < req.body.min_salary) {
                throw new Error("max_salary must be >= min_salary");
            }
            return true;
        }),
    body("min_experience")
        .optional()
        .isInt({ min: 0 }).withMessage("min_experience must be a non-negative integer")
        .toInt(),
    body("max_experience")
        .optional()
        .isInt({ min: 0 }).withMessage("max_experience must be a non-negative integer")
        .toInt()
        .custom((value, { req }) => {
            if (req.body.min_experience && value < req.body.min_experience) {
                throw new Error("max_experience must be >= min_experience");
            }
            return true;
        }),
    body("status")
        .optional()
        .isIn(JOB_STATUS).withMessage(`status must be one of: ${JOB_STATUS.join(", ")}`),
    body("expires_at")
        .optional()
        .isISO8601().withMessage("expires_at must be a valid ISO8601 datetime"),
];
