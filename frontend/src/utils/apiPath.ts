export const BASE_URL = "http://localhost:3000";

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
    GET_BY_ID: "/api/jobs/:id",
    CREATE: "/api/jobs/",
    UPDATE: "/api/jobs/:id",
    DELETE: "/api/jobs/:id",
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
    SOCIAL_NETWORKS: {
      GET_AVAILABLE: "/api/jobseekers/social-networks/available",
      GET: "/api/jobseekers/social-networks",
      ADD: "/api/jobseekers/social-networks",
      UPDATE: "/api/jobseekers/social-networks/:socialNetworkId",
      DELETE: "/api/jobseekers/social-networks/:socialNetworkId",
    },
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
};
