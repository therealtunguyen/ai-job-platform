import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import Login from '@/pages/Auth/Login'
import SignUp from '@/pages/Auth/SignUp'
import LandingPage from '@/pages/Landing/LandingPage'
import JobSeekerDashBoard from '@/pages/JobSeeker/JobSeekerDashBoard'
import EmployerDashBoard from '@/pages/Employer/EmployerDashBoard'
import Layout from '@/pages/Layout/Layout'
import ProtectedRoute from '@/routes/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import UserProfile from '@/pages/JobSeeker/UserProfile'

const router = createBrowserRouter([
  {
    element: <Layout />, // Layout có Header cho tất cả pages
    children: [
      {
        path: '/',
        element: <LandingPage />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/signup',
        element: <SignUp />
      },
      {
        element: <ProtectedRoute />, // Protected routes cần authentication
        children: [
          {
            path: '/jobseeker-dashboard',
            element: <JobSeekerDashBoard />
          },
          {
            path: '/employer-dashboard',
            element: <EmployerDashBoard />
          },
          {
            path: '/jobseeker-profile',
            element: <UserProfile />
          }
        ]
      }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  </StrictMode>,
)
