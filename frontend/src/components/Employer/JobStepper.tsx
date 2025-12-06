import { useState } from "react";
import type { JobStepperData } from "@/types/job";
import type { Job as JobType } from "@/services/jobService";
import { jobService } from "@/services/jobService";

interface JobStepperProps {
  onJobCreated?: (job: JobType) => void;
  jobToEdit: JobType | null;
  isEditing?: boolean;
}

const JobStepper = ({
  onJobCreated,
  jobToEdit,
  isEditing = false,
}: JobStepperProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for form submission
  const [formData, setFormData] = useState<JobStepperData>({
    step1: {
      title: jobToEdit?.title || "",
      location: jobToEdit?.location || "",
    },
    step2: {
      job_type: (jobToEdit?.job_type &&
      [
        "FULL_TIME",
        "PART_TIME",
        "CONTRACT",
        "INTERNSHIP",
        "TEMPORARY",
      ].includes(jobToEdit.job_type)
        ? jobToEdit.job_type
        : "FULL_TIME") as
        | "FULL_TIME"
        | "PART_TIME"
        | "CONTRACT"
        | "INTERNSHIP"
        | "TEMPORARY",
      min_experience: jobToEdit?.min_experience || null,
      max_experience: jobToEdit?.max_experience || null,
      min_salary: jobToEdit?.min_salary || null,
      max_salary: jobToEdit?.max_salary || null,
    },
    step3: {
      description: jobToEdit?.description || "",
      responsibilities: jobToEdit?.responsibilities || "",
      requirements: jobToEdit?.requirements || "",
      benefits: jobToEdit?.benefits || "",
    },
    step4: {
      confirm: false,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input changes
  const handleChange = (
    step: keyof JobStepperData,
    field: string,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: value,
      },
    }));

    // Clear error when user starts typing
    if (errors[`${step}.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${step}.${field}`];
        return newErrors;
      });
    }
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.step1.title.trim()) {
        newErrors["step1.title"] = "Job title is required";
      } else if (formData.step1.title.trim().length < 3) {
        newErrors["step1.title"] = "Job title must be at least 3 characters";
      }

      if (!formData.step1.location.trim()) {
        newErrors["step1.location"] = "Location is required";
      }
    } else if (step === 2) {
      if (
        formData.step2.min_salary !== null &&
        formData.step2.max_salary !== null
      ) {
        if (formData.step2.min_salary > formData.step2.max_salary) {
          newErrors["step2.min_salary"] =
            "Min salary cannot be greater than max salary";
          newErrors["step2.max_salary"] =
            "Max salary cannot be less than min salary";
        }
      }

      if (
        formData.step2.min_experience !== null &&
        formData.step2.max_experience !== null
      ) {
        if (formData.step2.min_experience > formData.step2.max_experience) {
          newErrors["step2.min_experience"] =
            "Min experience cannot be greater than max experience";
          newErrors["step2.max_experience"] =
            "Max experience cannot be less than min experience";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit job
  const submitJob = async (status: "DRAFT" | "ACTIVE") => {
    if (!validateStep(1) || !validateStep(2)) {
      return;
    }

    // Additional validation based on backend requirements
    const newErrors: Record<string, string> = {};

    // Validate title according to backend requirements
    if (!formData.step1.title.trim()) {
      newErrors["step1.title"] = "Title is required";
    } else if (formData.step1.title.trim().length < 3) {
      newErrors["step1.title"] = "Title must be at least 3 characters";
    } else if (formData.step1.title.trim().length > 120) {
      newErrors["step1.title"] = "Title must be at most 120 characters";
    }

    // Validate description only when publishing (not for drafts)
    if (status === "ACTIVE") {
      if (!formData.step3.description.trim()) {
        newErrors["step3.description"] = "Description is required";
      } else if (formData.step3.description.trim().length < 10) {
        newErrors["step3.description"] =
          "Description must be at least 10 characters";
      } else if (formData.step3.description.trim().length > 5000) {
        newErrors["step3.description"] =
          "Description must be at most 5000 characters";
      }
    }

    console.log("Submitting job with data:", formData, "and status:", status);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const currentUser = localStorage.getItem("user");
    const employerId = currentUser ? JSON.parse(currentUser).id : null;
    if (!employerId || employerId === "temp_user_id") {
      setErrors({
        submit: "User authentication required. Please log in again.",
      });
      return;
    }

    setIsSubmitting(true); // Set loading state

    // Prepare job data, only including non-null values to avoid validation issues
    const baseJobData: Partial<
      Omit<JobType, "job_id" | "posted_at" | "applicant_count">
    > = {
      title: formData.step1.title,
      location: formData.step1.location,
      status,
      employer_id: employerId, // Use the actual user ID from auth context
      last_updated_at: new Date().toISOString(), // Set the last updated field
    };

    // Only add fields if they have actual values to avoid validation issues
    if (formData.step2.job_type) baseJobData.job_type = formData.step2.job_type;
    if (formData.step2.min_experience !== null)
      baseJobData.min_experience = formData.step2.min_experience;
    if (formData.step2.max_experience !== null)
      baseJobData.max_experience = formData.step2.max_experience;
    if (formData.step2.min_salary !== null)
      baseJobData.min_salary = formData.step2.min_salary;
    if (formData.step2.max_salary !== null)
      baseJobData.max_salary = formData.step2.max_salary;
    if (formData.step3.description)
      baseJobData.description = formData.step3.description;
    if (formData.step3.responsibilities)
      baseJobData.responsibilities = formData.step3.responsibilities;
    if (formData.step3.requirements)
      baseJobData.requirements = formData.step3.requirements;
    if (formData.step3.benefits) baseJobData.benefits = formData.step3.benefits;
    // expires_at is optional and can be null

    const jobData = baseJobData as Omit<
      JobType,
      "job_id" | "posted_at" | "applicant_count"
    >;

    try {
      let createdJob: JobType;

      if (isEditing && jobToEdit?.job_id) {
        // Update existing job
        createdJob = await jobService.updateJob(jobToEdit.job_id, jobData);
      } else {
        // Create new job
        createdJob = await jobService.createJob(jobData);
      }

      onJobCreated?.(createdJob);
    } catch (error) {
      console.error("Error saving job:", error);
      setErrors({ submit: "Failed to save job. Please try again." });
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Basic Details</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Job Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.step1.title}
                  onChange={(e) =>
                    handleChange("step1", "title", e.target.value)
                  }
                  className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    errors["step1.title"] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g. Frontend Developer"
                />
                {errors["step1.title"] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors["step1.title"]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.step1.location}
                  onChange={(e) =>
                    handleChange("step1", "location", e.target.value)
                  }
                  className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    errors["step1.location"]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="City, State or Remote/Hybrid"
                />
                {errors["step1.location"] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors["step1.location"]}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Job Specifics</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="job_type"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Job Type
                </label>
                <select
                  id="job_type"
                  value={formData.step2.job_type}
                  onChange={(e) =>
                    handleChange("step2", "job_type", e.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="TEMPORARY">Temporary</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="min_experience"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Min Experience (years)
                  </label>
                  <input
                    type="number"
                    id="min_experience"
                    min="0"
                    max="50"
                    value={formData.step2.min_experience || ""}
                    onChange={(e) =>
                      handleChange(
                        "step2",
                        "min_experience",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      errors["step2.min_experience"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="0"
                  />
                  {errors["step2.min_experience"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["step2.min_experience"]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="max_experience"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Max Experience (years)
                  </label>
                  <input
                    type="number"
                    id="max_experience"
                    min="0"
                    max="50"
                    value={formData.step2.max_experience || ""}
                    onChange={(e) =>
                      handleChange(
                        "step2",
                        "max_experience",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      errors["step2.max_experience"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="10"
                  />
                  {errors["step2.max_experience"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["step2.max_experience"]}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="min_salary"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Min Salary ($)
                  </label>
                  <input
                    type="number"
                    id="min_salary"
                    min="0"
                    value={formData.step2.min_salary || ""}
                    onChange={(e) =>
                      handleChange(
                        "step2",
                        "min_salary",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      errors["step2.min_salary"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="30000"
                  />
                  {errors["step2.min_salary"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["step2.min_salary"]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="max_salary"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Max Salary ($)
                  </label>
                  <input
                    type="number"
                    id="max_salary"
                    min="0"
                    value={formData.step2.max_salary || ""}
                    onChange={(e) =>
                      handleChange(
                        "step2",
                        "max_salary",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      errors["step2.max_salary"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="80000"
                  />
                  {errors["step2.max_salary"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["step2.max_salary"]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Job Description
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="description"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Job Summary *
                </label>
                <textarea
                  id="description"
                  value={formData.step3.description}
                  onChange={(e) =>
                    handleChange("step3", "description", e.target.value)
                  }
                  rows={4}
                  className={`w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    errors["step3.description"]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Brief overview of the role (at least 10 characters)..."
                />
                {errors["step3.description"] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors["step3.description"]}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.step3.description.length}/10 minimum characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="responsibilities"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Responsibilities
                </label>
                <textarea
                  id="responsibilities"
                  value={formData.step3.responsibilities}
                  onChange={(e) =>
                    handleChange("step3", "responsibilities", e.target.value)
                  }
                  rows={6}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="List the key responsibilities for this role..."
                />
              </div>

              <div>
                <label
                  htmlFor="requirements"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Requirements
                </label>
                <textarea
                  id="requirements"
                  value={formData.step3.requirements}
                  onChange={(e) =>
                    handleChange("step3", "requirements", e.target.value)
                  }
                  rows={6}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="List the required qualifications and skills..."
                />
              </div>

              <div>
                <label
                  htmlFor="benefits"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Benefits
                </label>
                <textarea
                  id="benefits"
                  value={formData.step3.benefits}
                  onChange={(e) =>
                    handleChange("step3", "benefits", e.target.value)
                  }
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="List the benefits of this position..."
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Review & Publish
            </h2>
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 font-medium text-gray-900">
                Job Details Preview
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Title:</span>{" "}
                  {formData.step1.title}
                </p>
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {formData.step1.location}
                </p>
                <p>
                  <span className="font-medium">Type:</span>{" "}
                  {formData.step2.job_type}
                </p>
                <p>
                  <span className="font-medium">Experience:</span>{" "}
                  {formData.step2.min_experience || 0} -{" "}
                  {formData.step2.max_experience || "No max"} years
                </p>
                <p>
                  <span className="font-medium">Salary:</span> $
                  {formData.step2.min_salary?.toLocaleString() || 0} - $
                  {formData.step2.max_salary?.toLocaleString() || "No max"}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="confirm"
                checked={formData.step4.confirm}
                onChange={(e) =>
                  handleChange("step4", "confirm", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="confirm"
                className="ml-2 block text-sm text-gray-900"
              >
                I confirm that all information is accurate
              </label>
            </div>
            {errors.submit && (
              <p className="mt-2 text-sm text-red-600">{errors.submit}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Job Posting" : "Create New Job"}
          </h1>
          <span className="text-sm text-gray-500">Step {currentStep} of 4</span>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  step <= currentStep
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`h-1 w-16 ${
                    step < currentStep ? "bg-blue-500" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">{renderStep()}</div>

      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          )}
        </div>

        <div className="space-x-3">
          {currentStep < 4 ? (
            <>
              <button
                onClick={() => submitJob("DRAFT")}
                disabled={isSubmitting}
                className={`rounded-md border px-4 py-2 text-gray-700 ${
                  isSubmitting
                    ? "cursor-not-allowed bg-gray-100"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="mr-2 -ml-1 h-4 w-4 animate-spin text-gray-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Draft"
                )}
              </button>
              <button
                onClick={nextStep}
                disabled={isSubmitting}
                className={`rounded-md px-4 py-2 text-white ${
                  isSubmitting
                    ? "cursor-not-allowed bg-blue-400"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => submitJob("DRAFT")}
                disabled={isSubmitting}
                className={`rounded-md border px-4 py-2 text-gray-700 ${
                  isSubmitting
                    ? "cursor-not-allowed bg-gray-100"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="mr-2 -ml-1 h-4 w-4 animate-spin text-gray-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Draft"
                )}
              </button>
              <button
                onClick={() => submitJob("ACTIVE")}
                disabled={!formData.step4.confirm || isSubmitting}
                className={`rounded-md px-4 py-2 text-white ${
                  !formData.step4.confirm || isSubmitting
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isEditing ? "Updating..." : "Publishing..."}
                  </span>
                ) : isEditing ? (
                  "Update Job"
                ) : (
                  "Publish Job"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobStepper;
