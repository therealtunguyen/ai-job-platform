import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "@/pages/Auth/Login";
import SignUp from "@/pages/Auth/SignUp";
import LandingPage from "@/pages/Landing/LandingPage";
import JobSeekerDashBoard from "@/pages/JobSeeker/JobSeekerDashBoard";
import EmployerDashBoard from "@/pages/Employer/EmployerDashBoard";
import Layout from "@/pages/Layout/Layout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import UserProfile from "@/pages/JobSeeker/UserProfile";
import ApplicationSavedJob from "@/pages/JobSeeker/ApplicationSavedJob";
import JobSeekerInterview from "@/pages/JobSeeker/JobSeekerInterview";
import { User } from "lucide-react";
import UserHomepage from "@/pages/JobSeeker/UserHomepage";

const router = createBrowserRouter([
  {
    element: <Layout />, // Layout có Header cho tất cả pages
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        element: <ProtectedRoute />, // Protected routes cần authentication
        children: [
          {
            path: "/jobseeker-dashboard",
            element: <JobSeekerDashBoard />,
          },
          {
            path: "/employer-dashboard",
            element: <EmployerDashBoard />,
          },
          {
            path: "/jobseeker-profile",
            element: <UserProfile />,
          },
          {
            path: "/jobseeker-apply-save-job",
            element: <ApplicationSavedJob />,
          },
          {
            path: "/jobseeker-interview",
            element: <JobSeekerInterview />,
          },
          // {
          //   path: '/jobseeker-homepage',
          //   element: <UserHomepage />
          // }
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
