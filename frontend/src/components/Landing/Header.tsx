import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 right-0 left-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* logo */}
          <div
            className="flex items-center px-1"
            onClick={() => {
              navigate("/");
            }}
          >
            <div className="">
              <img
                src="/Logo_SkillSync_BR.png"
                className="flex h-24 w-24 items-center justify-center rounded-lg"
              />
            </div>
            <span className="text-xl font-bold text-[#29436c]">Skill</span>
            <span className="text-xl font-bold text-[#90ad71]">Sync</span>
          </div>

          {/* Find Jobs and Employees */}
          <nav className="hidden items-center space-x-8 md:flex">
            <a
              onClick={() => navigate("/find-jobs")}
              className="cursor-pointer font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Find Jobs
            </a>
            <a
              onClick={() => navigate("/find-employers")}
              className="cursor-pointe cursor-pointer font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Find Employers
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-700">Welcome, {user?.name}</span>
                <a
                  href={
                    user?.role === "EMPLOYER"
                      ? "/employer-dashboard"
                      : "/jobseeker-dashboard"
                  }
                  className="rounded-lg bg-gradient-to-r from-[#29436c] to-[#90ad71] px-6 py-2 font-medium text-white shadow-sm transition-all duration-300 hover:from-[#29436c]/90 hover:to-[#90ad71]/90 hover:shadow-md"
                >
                  DashBoard
                </a>
              </div>
            ) : (
              <>
                <a
                  href="/login"
                  className="forn-medium rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-500 hover:text-gray-900"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="rounded-lg bg-gradient-to-r from-[#29436c] to-[#90ad71] px-6 py-2 font-medium text-white shadow-sm transition-all duration-300 hover:from-[#29436c]/90 hover:to-[#90ad71]/90 hover:shadow-md"
                >
                  SignUp
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
