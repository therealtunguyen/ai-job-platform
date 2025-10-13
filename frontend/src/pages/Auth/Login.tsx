import type { FormData, FormState } from "@/types/formTypes";
import { validateEmail, validatePassword } from "@/utils/helper";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader,
  Lock,
  Mail,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { login } = useAuth();

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
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email: formData.email,
        password: formData.password,
      });

      console.log("Login response:", response.data); // Debug log

      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        errors: {},
      }));

      // Kiểm tra response structure - token nằm trong session
      const token =
        response.data?.session?.access_token ||
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.access_token;
      const refreshToken = response.data?.session?.refresh_token;

      console.log("Extracted token:", token); // Debug log
      console.log("Extracted refresh token:", refreshToken); // Debug log

      if (token) {
        // Lấy user data từ response và map user_type thành role
        const backendUser = response.data;
        console.log("Backend user data:", backendUser); // Debug log
        const userData = {
          id: backendUser.user.user_id,
          email: formData.email,
          role: backendUser.user.user_type, // Map user_type từ backend thành role cho frontend
          name: backendUser.name,
        };
        console.log("Calling login with:", userData, token); // Debug log
        login(userData, token, refreshToken);

        console.log("Redirecting to /jobseeker-dashboard..."); // Debug log
        // Redirect ngay lập tức thay vì chờ 2 giây
        window.location.href = "/jobseeker-dashboard";
      } else {
        console.error("No token found in response:", response.data);
        setFormState((prev) => ({
          ...prev,
          loading: false,
          errors: { submit: "No token received from server" },
        }));
      }
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

  if (formState.success) {
    return (
      <div className="flex min-h-screen">
        {/* Left Column - Image Section */}
        <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/bku_library.png')",
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
          ></div>
        </div>

        {/* Right Column - Success Section */}
        <div className="flex w-full flex-col justify-center bg-gray-900 p-8 lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto w-full max-w-md text-center"
          >
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="mb-2 text-2xl font-bold text-white">
              Welcome Back!
            </h2>
            <p className="mb-4 text-gray-300">
              You have been successfully logged in.
            </p>
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-2 text-sm text-gray-400">
              Redirecting to your landing page...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg"
      >
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="text-gray-600">Sign in to your JobPortal account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full rounded-lg border py-3 pl-10 ${
                  formState.errors.email ? "border-red-500" : "border-gray-300"
                } transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your email"
              />
            </div>
            {formState.errors.email && (
              <p className="mt-1 flex items-center text-sm text-red-500">
                <AlertCircle className="mr-1 h-4 w-4" />
                {formState.errors.email}
              </p>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type={formState.showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full rounded-lg border py-3 pr-12 pl-10 ${
                  formState.errors.password
                    ? "border-red-500"
                    : "border-gray-300"
                } transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({
                    ...prev,
                    showPassword: !prev.showPassword,
                  }))
                }
                className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
              >
                {formState.showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {formState.errors.password && (
              <p className="mt-1 flex items-center text-sm text-red-500">
                <AlertCircle className="mr-1 h-4 w-4" />
                {formState.errors.password}
              </p>
            )}
          </div>

          {formState.errors.submit && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="flex items-center text-sm text-red-700">
                <AlertCircle className="mr-2 h-4 w-4" />
                {formState.errors.submit}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={formState.loading}
            className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-[#29436c] to-[#90ad71] py-3 font-semibold text-white transition-all duration-300 hover:from-[#213552] hover:to-[#7ea260] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {formState.loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?
              <a
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Create one here
              </a>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
