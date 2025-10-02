import React from "react";
import { Search, ArrowRight, Users, Building2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  const isAuthenticated = true;
  const user = {
    fullName: "Tan",
    role: "employer",
  };
  const navigate = useNavigate();

  const stats = [
    { icon: Users, label: "Active Users", value: "2.4M+" },
    { icon: Building2, label: "Companies", value: "50K+" },
    { icon: TrendingUp, label: "Jobs Posted", value: "150K+" },
  ];
  return (
    <section className="pt-24 pb-16 bg-white min-h-screen flex items-center relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight pt-10"
          >
            Find your Dream Job or
            <span className="block bg-gradient-to-r from-[#29436c] to-[#90ad71] bg-clip-text text-transparent mt-2">Perfect Hire</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Connect talented professionals with innovative companies. Your next
            career move or perfect candidate is just one click away.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-gradient-to-r from-[#29436c] to-[#90ad71] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-[#213552] hover:to-[#7ea260] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              onClick={() => navigate("/find-jobs")}
            >
              <Search className="w-5 h-5"/>
              <span> Find Jobs</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white border-2 border-[#29436c] text-[#29436c] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#f5f8fb] transition-all duration-300 shadow-sm hover:shadow-md"
              onClick={() => {
                navigate(
                  isAuthenticated && user?.role === "employer"
                    ? "/employer-dashboard"
                    : "/login",
                );
              }}
            >
              Post a job
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                  className="flex flex-col items-center space-y-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-[#e7edf5] to-[#eef5e7] rounded-xl flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6 text-[#29436c]" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#29436c] rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#90ad71] rounded-full blur-3xl opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#e7edf5] to-[#eef5e7] rounded-full blur-3xl opacity-30 " />
      </div>
    </section>
  );
};

export default Hero;
