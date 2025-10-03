import { body } from "express-validator";

export const createJobValidator = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required")
        .isLength({ min: 3, max: 120 }).withMessage("Title must be 3-120 characters"),
    body("description")
        .trim()
        .notEmpty().withMessage("Description is required")
        .isLength({ min: 10, max: 5000 }).withMessage("Description must be 10-5000 characters"),
    body("company_name")
        .trim()
        .notEmpty().withMessage("Company name is required")
        .isLength({ min: 2, max: 160 }).withMessage("Company name must be 2-160 characters"),
    body("location")
        .optional()
        .trim()
        .isLength({ max: 160 }).withMessage("Location must be at most 160 characters"),
    body("salary_min")
        .optional()
        .isNumeric().withMessage("Minimum salary must be a number")
        .toFloat(),
    body("salary_max")
        .optional()
        .isNumeric().withMessage("Maximum salary must be a number")
        .toFloat()
        .custom((value, { req }) => {
            if (req.body.salary_min && value < req.body.salary_min) {
                throw new Error("Maximum salary must be greater than or equal to minimum salary");
            }
            return true;
        }),
];

export const updateJobValidator = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 3, max: 120 }).withMessage("Title must be 3-120 characters"),
    body("description")
        .optional()
        .trim()
        .isLength({ min: 10, max: 5000 }).withMessage("Description must be 10-5000 characters"),
    body("company_name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 160 }).withMessage("Company name must be 2-160 characters"),
    body("location")
        .optional()
        .trim()
        .isLength({ max: 160 }).withMessage("Location must be at most 160 characters"),
    body("salary_min")
        .optional()
        .isNumeric().withMessage("Minimum salary must be a number")
        .toFloat(),
    body("salary_max")
        .optional()
        .isNumeric().withMessage("Maximum salary must be a number")
        .toFloat()
        .custom((value, { req }) => {
            if (req.body.salary_min && value < req.body.salary_min) {
                throw new Error("Maximum salary must be greater than or equal to minimum salary");
            }
            return true;
        }),
];
