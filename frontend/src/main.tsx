import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import Login from '@/pages/Auth/Login'
import SignUp from '@/pages/Auth/SignUp'
import LandingPage from '@/pages/Landing/LandingPage'
import JobSeekerDashBoard from '@/pages/JobSeeker/JobSeekerDashBoard'
import EmployerDashBoard from '@/pages/Employer/EmployerDashBoard'
import { AuthProvider } from '@/contexts/AuthContext'

const router = createBrowserRouter([
  {
    element: <Login />,
    path: '/login'
  },
  {
    element: <SignUp />,
    path: '/signup'
  },
  {
    element: <LandingPage />,
    path: '/'
  },
  {
    element: <JobSeekerDashBoard />,
    path: '/find-jobs'
  },
  {
    element: <EmployerDashBoard />,
    path: '/employer-dashboard'
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  </StrictMode>,
)
