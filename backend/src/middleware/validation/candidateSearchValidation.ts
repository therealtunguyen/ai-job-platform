import { body, query, validationResult } from "express-validator";

export const candidateSearchValidator = [
  // Validate q parameter
  query("q")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Search query must be a string with maximum 200 characters"),

  // Validate skills parameter
  query("skills")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        // If it's a comma-separated string, validate each skill
        const skills = value.split(",").map((s) => s.trim());
        if (skills.length > 20) {
          throw new Error("Maximum 20 skills allowed");
        }
        for (const skill of skills) {
          if (skill.length > 50) {
            throw new Error("Each skill name must be at most 50 characters");
          }
          if (!/^[a-zA-Z0-9\s\-_&+]+$/.test(skill)) {
            throw new Error("Invalid characters in skill name");
          }
        }
        return true;
      } else if (Array.isArray(value)) {
        // If it's an array, validate each skill
        if (value.length > 20) {
          throw new Error("Maximum 20 skills allowed");
        }
        for (const skill of value) {
          if (typeof skill !== "string" || skill.length > 50) {
            throw new Error(
              "Each skill must be a string with maximum 50 characters",
            );
          }
          if (!/^[a-zA-Z0-9\s\-_&+]+$/.test(skill)) {
            throw new Error("Invalid characters in skill name");
          }
        }
        return true;
      } else {
        throw new Error("Skills must be a string or array of strings");
      }
    }),

  // Validate min_exp parameter
  query("min_exp")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Minimum experience must be an integer between 0 and 50")
    .toInt(),

  // Validate max_exp parameter
  query("max_exp")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Maximum experience must be an integer between 0 and 50")
    .toInt(),

  // Validate that min_exp <= max_exp if both are provided
  query().custom((value, { req }) => {
    const min_exp = req.query?.min_exp;
    const max_exp = req.query?.max_exp;
    if (min_exp !== undefined && max_exp !== undefined && min_exp > max_exp) {
      throw new Error(
        "Minimum experience cannot be greater than maximum experience",
      );
    }
    return true;
  }),

  // Validate preferred_location parameter
  query("preferred_location")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage(
      "Preferred location must be a string with maximum 100 characters",
    ),

  // Validate page parameter
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  // Validate per_page parameter
  query("per_page")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Per page must be an integer between 1 and 100")
    .toInt(),

  // Validate sort parameter
  query("sort")
    .optional()
    .isIn(["relevance", "exp_high", "exp_low", "name"])
    .withMessage("Sort must be one of: relevance, exp_high, exp_low, name"),

  // Custom sanitizer to handle skills as an array
  query("skills").customSanitizer((value) => {
    if (typeof value === "string") {
      return value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
    return value;
  }),

  // Handle validation results
  (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }
    next();
  },
];
