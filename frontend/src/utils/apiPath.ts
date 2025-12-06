export const BASE_URL = import.meta.env.PROD
  ? "https://ai-job-platform-backend.vercel.app/"
  : "http://localhost:3000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    UPDATE_EMAIL: "/api/auth/email",
    ME: "/api/auth/me",
  },
  CV: {
    UPLOAD: "/api/cv/upload",
    GET_BY_ID: "/api/cv/:id",
  },
  JOBS: {
    LIST: "/api/jobs/",
    FILTER: "/api/jobs/filter",
    GET_BY_ID: "/api/jobs/job/:id",
    CREATE: "/api/jobs/",
    UPDATE: "/api/jobs/job/:id",
    DELETE: "/api/jobs/job/:id",
    GET_BY_EMPLOYER: "/api/jobs/my-jobs",
  },
  APPLICATIONS: {
    SUBMIT: "/api/applications/",
    GET_BY_ID: "/api/applications/:id",
    UPDATE_STATUS: "/api/applications/:id/status",
    GET_USER_APPLICATIONS: "/api/applications/user/:userId",
    GET_EMPLOYER_APPLICATIONS: "/api/applications/employer/:employerId",
    GET_JOB_APPLICATIONS: "/api/applications/job/:jobId",
  },
  USERS: {
    GET_PROFILE: "/api/users/me",
    UPDATE_PROFILE: "/api/users/me",
    // Profile image routes
    UPLOAD_IMAGE: "/api/users/profile-image/upload",
    DELETE_IMAGE: "/api/users/profile-image/delete",
    // Job Seeker specific routes
    UPDATE_JOB_SEEKER: "/api/users/job-seeker",
    UPDATE_JOB_SEEKER_WITH_IMAGE: "/api/users/job-seeker/profile-and-image",
    // Employer specific routes
    UPDATE_EMPLOYER: "/api/users/employer",
    UPDATE_EMPLOYER_WITH_IMAGE: "/api/users/employer/profile-and-image",
  },
  JOB_SEEKERS: {
    LANGUAGES: {
      GET: "/api/jobseekers/languages",
      ADD: "/api/jobseekers/languages",
      DELETE: "/api/jobseekers/languages/:languageId",
    },
    EDUCATION: {
      GET: "/api/jobseekers/education",
      ADD: "/api/jobseekers/education",
      UPDATE: "/api/jobseekers/education/:educationId",
      DELETE: "/api/jobseekers/education/:educationId",
    },
    CERTIFICATIONS: {
      GET: "/api/jobseekers/certifications",
      ADD: "/api/jobseekers/certifications",
      UPDATE: "/api/jobseekers/certifications/:certId",
      DELETE: "/api/jobseekers/certifications/:certId",
    },
    WORK_EXPERIENCES: {
      GET: "/api/jobseekers/work-experiences",
      ADD: "/api/jobseekers/work-experiences",
      UPDATE: "/api/jobseekers/work-experiences/:experienceId",
      DELETE: "/api/jobseekers/work-experiences/:experienceId",
    },
    SOCIAL_NETWORKS: {
      GET_AVAILABLE: "/api/jobseekers/social-networks/available",
      GET: "/api/jobseekers/social-networks",
      ADD: "/api/jobseekers/social-networks",
      UPDATE: "/api/jobseekers/social-networks/:socialNetworkId",
      DELETE: "/api/jobseekers/social-networks/:socialNetworkId",
    },
  },
  EMPLOYERS: {
    LIST: "/api/employers",
  },
  INTERVIEWS: {
    CREATE: "/api/interviews/create",
    SUBMIT_ANSWER: "/api/interviews/:interviewId/submit",
    GET_BY_ID: "/api/interviews/:interviewId",
    GET_USER_INTERVIEWS: "/api/interviews/",
    ABANDON: "/api/interviews/:interviewId/abandon",
  },
  MATCHING: {
    GET_MATCHES: "/api/matching/:userId",
  },
  SAVED_JOBS: {
    LIST: "/api/saved-jobs",
    SAVE: "/api/saved-jobs",
    UNSAVE: "/api/saved-jobs/:jobId",
    CHECK: "/api/saved-jobs/check/:jobId",
    UPDATE_NOTES: "/api/saved-jobs/:jobId/notes",
  },
};
