export const BASE_URL = "http://localhost:3000"

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
  CV : {
    UPLOAD: "/api/cv/upload",
    GETID: "api/cv/:id"
  },
  JOB : {
    GETLISTJOB: "/api/jobs/",
    GETID: "/api/jobs/:id"
  },
  USER: {
    GETUSER: "/api/users/me",
    PUTUSER: "/api/users/me"
  }
}