export const BASE_URL = "http://localhost:3000"

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    UPDATE_EMAIL: "/api/auth/email",
  },
  CV : {
    UPLOAD: "/api/cv/upload",
    GETID: "/api/cv/:id",
  },
  JOB : {
    GETLISTJOB: "/api/jobs/",
    GETID: "/api/jobs/:id",
  },
  USER: {
    GETUSER: "/api/users/me",
    PUTUSER: "/api/users/me",
    PROFILEIMAGE: "/api/users/profile-image/upload",
    DELETE_PROFILE_IMAGE: "/api/users/profile-image/delete",
    // Job Seeker specific routes
    UPDATE_JOB_SEEKER: "/api/users/job-seeker",
    UPDATE_JOB_SEEKER_WITH_IMAGE: "/api/users/job-seeker/profile-and-image",
    // Employer specific routes  
    UPDATE_EMPLOYER: "/api/users/employer",
    UPDATE_EMPLOYER_WITH_IMAGE: "/api/users/employer/profile-and-image",
    // Profile image routes
    UPLOAD_IMAGE: "/api/users/profile-image/upload",
    DELETE_IMAGE: "/api/users/profile-image/delete",
  },
  JOB_SEEKER: {
    LANGUAGES: "/api/jobseekers/languages",
    SOCIAL_NETWORKS: "/api/jobseekers/social-networks",
  }
}