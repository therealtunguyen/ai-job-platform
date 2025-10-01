import type { FormData, FormState } from "@/types/formTypes";
import { validateEmail, validatePassword } from "@/utils/helper";
import React, { useState } from "react";
import {motion} from 'framer-motion'
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader, Lock, Mail } from "lucide-react";


const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    role: "",
    rememberMe: false,
  });

  const [formState, setFormState] = useState<FormState>({
    loading: false,
    errors: {},
    showPassword: false,
    success: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formState.errors[name]) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: "" },
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      role: !formData.role ? "Please select a role" : "",
    };

    // Xoá các lỗi rỗng
    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormState((prev) => ({ ...prev, loading: true }));

    try {
      // TODO: gọi API đăng nhập ở đây
      console.log("Login data:", formData);

      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: {},
      }));
    } catch (error) {
      console.log("error", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).response?.data?.message ||
            "Login failed. Please try again.";

      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: {
          submit: errorMessage,
        },
      }));
    }
  };

  if(formState.success) {
    return (
      <div className="min-h-screen flex">
        {/* Left Column - Image Section */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/bku_library.png')",
              backgroundSize: "cover",
              backgroundPosition: "center top"
            }}
          ></div>
        </div>

        {/* Right Column - Success Section */}
        <div className="w-full lg:w-1/2 bg-gray-900 flex flex-col justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center mx-auto"
          >
          <CheckCircle className='w-16 h-16 text-green-500 mx-auto mb-4'/>
          <h2 className='text-2xl font-bold text-white mb-2'>Welcome Back!</h2>
          <p className='text-gray-300 mb-4'>
            You have been successfully logged in.
          </p>
          <div className='animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto'/>
          <p className='text-sm text-gray-400 mt-2'>Redirecting to your landing page...</p>
          </motion.div>
        </div>
      </div>
    )
  }
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='bg-white p-8 rounded-xl shadow-lg max-w-md w-full'
      >
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Welcome Back</h2>
          <p className='text-gray-600 '>Sign in to your JobPortal account</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Email Address
            </label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5'/>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 py-3 rounded-lg border ${
                  formState.errors.email ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                placeholder='Enter your email'
              />
            </div>
            {
              formState.errors.email && (
                <p className='text-red-500 text-sm mt-1 flex items-center'>
                  <AlertCircle className='w-4 h-4 mr-1'/>
                  {formState.errors.email}
                </p>
              )
            }
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Password
            </label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5'/>
              <input 
                type= {formState.showPassword ? 'text' : 'password'}
                name='password'
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                  formState.errors.password ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                placeholder='Enter your password'
              />
              <button
                type='button'
                onClick={() => setFormState(prev => ({...prev, showPassword: !prev.showPassword}))}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 '
              >
                {
                  formState.showPassword ? <EyeOff className='w-5 h-5 '/> : <Eye className='w-5 h-5'/>
                }
              </button>
            </div>
            {
              formState.errors.password && (
                <p className='text-red-500 text-sm mt-1 flex items-center'>
                  <AlertCircle className='w-4 h-4 mr-1'/> 
                  {
                    formState.errors.password 
                  }
                </p>
              )
            }
          </div>

          {
            formState.errors.submit && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                <p className='text-red-700 text-sm flex items-center '>
                  <AlertCircle className='w-4 h-4 mr-2'/>
                  {
                    formState.errors.submit
                  }
                </p>
              </div>
            )
          }

          <button
            type='submit'
            disabled={formState.loading}
            className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2'
          >
            {
              formState.loading ? (
                <>
                  <Loader className='w-5 h-5 animate-spin'/>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )
            }
          </button>

          <div className='text-center'>
            <p className='text-gray-600 '>
              Don't have an account?
              <a href='/signup' className='text-blue-600 hover:text-blue-700 font-medium'>
                Create on here
              </a>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
