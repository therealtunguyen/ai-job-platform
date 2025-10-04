import { body, ValidationChain } from "express-validator";

// Allowed status enum values from supabase types (job_status_enum)
const JOB_STATUS = ["DRAFT", "ACTIVE", "PAUSED", "EXPIRED", "FILLED", "ARCHIVED"] as const;

// Validation constants
const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LENGTH = 5000;
const LOCATION_MAX_LENGTH = 160;
const JOB_TYPE_MAX_LENGTH = 80;

/**
 * A schema defining the validation rules for all job-related fields.
 * This is used as a single source of truth to build the create and update validators.
 */
const jobValidationSchema: Record<string, ValidationChain> = {
    title: body("title")
        .trim()
        .isLength({ min: TITLE_MIN_LENGTH, max: TITLE_MAX_LENGTH })
        .withMessage(`Title must be ${TITLE_MIN_LENGTH}-${TITLE_MAX_LENGTH} characters`),
    employer_id: body("employer_id")
        .isUUID()
        .withMessage("employer_id must be a valid UUID"),
    description: body("description")
        .trim()
        .isLength({ min: DESCRIPTION_MIN_LENGTH, max: DESCRIPTION_MAX_LENGTH })
        .withMessage(`Description must be ${DESCRIPTION_MIN_LENGTH}-${DESCRIPTION_MAX_LENGTH} characters`),
    location: body("location")
        .trim()
        .isLength({ max: LOCATION_MAX_LENGTH })
        .withMessage(`Location must be at most ${LOCATION_MAX_LENGTH} characters`),
    job_type: body("job_type")
        .trim()
        .isLength({ max: JOB_TYPE_MAX_LENGTH })
        .withMessage(`job_type must be at most ${JOB_TYPE_MAX_LENGTH} characters`),
    min_salary: body("min_salary")
        .isNumeric().withMessage("min_salary must be a number")
        .toFloat(),
    max_salary: body("max_salary")
        .isNumeric().withMessage("max_salary must be a number")
        .toFloat()
        .custom((value, { req }) => {
            if (req.body.min_salary && value < req.body.min_salary) {
                throw new Error("max_salary must be >= min_salary");
            }
            return true;
        }),
    min_experience: body("min_experience")
        .isInt({ min: 0 }).withMessage("min_experience must be a non-negative integer")
        .toInt(),
    max_experience: body("max_experience")
        .isInt({ min: 0 }).withMessage("max_experience must be a non-negative integer")
        .toInt()
        .custom((value, { req }) => {
            if (req.body.min_experience && value < req.body.min_experience) {
                throw new Error("max_experience must be >= min_experience");
            }
            return true;
        }),
    status: body("status")
        .isIn(JOB_STATUS)
        .withMessage(`status must be one of: ${JOB_STATUS.join(", ")}`),
    expires_at: body("expires_at")
        .isISO8601()
        .withMessage("expires_at must be a valid ISO8601 datetime"),
};

// Fields that are required when creating a new job.
const requiredCreateFields = ["title", "employer_id"];

// Validator for creating a job.
export const createJobValidator = Object.entries(jobValidationSchema).map(
    ([field, validator]) => {
        if (requiredCreateFields.includes(field)) {
            return validator.notEmpty().withMessage(`${field} is required`);
        }
        return validator.optional();
    }
);

// Validator for updating a job, all fields are optional.
export const updateJobValidator = Object.values(jobValidationSchema).map(
    (validator) => validator.optional()
);
