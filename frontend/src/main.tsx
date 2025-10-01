import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import Login from '@/pages/Auth/Login'
import SignUp from '@/pages/Auth/SignUp'
import LandingPage from '@/pages/Landing/LandingPage'

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
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
