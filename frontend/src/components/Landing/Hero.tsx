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
    <section className="relative flex min-h-screen items-center bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 pt-10 text-4xl leading-tight font-bold text-gray-900 md:text-5xl lg:text-6xl"
          >
            Find your Dream Job or
            <span className="mt-2 block bg-gradient-to-r from-[#29436c] to-[#90ad71] bg-clip-text text-transparent">
              Perfect Hire
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-gray-600 md:text-xl"
          >
            Connect talented professionals with innovative companies. Your next
            career move or perfect candidate is just one click away.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex cursor-pointer items-center space-x-2 rounded-xl bg-gradient-to-r from-[#29436c] to-[#90ad71] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-[#213552] hover:to-[#7ea260] hover:shadow-xl"
              onClick={() => navigate("/find-jobs")}
            >
              <Search className="h-5 w-5" />
              <span> Find Jobs</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer rounded-xl border-2 border-[#29436c] bg-white px-8 py-4 text-lg font-semibold text-[#29436c] shadow-sm transition-all duration-300 hover:bg-[#f5f8fb] hover:shadow-md"
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
            className="mx-auto grid max-w-2xl grid-cols-1 gap-8 md:grid-cols-3"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                  className="flex flex-col items-center space-y-2 rounded-xl p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#e7edf5] to-[#eef5e7]">
                    <Icon className="h-6 w-6 text-[#29436c]" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-[#29436c] opacity-20 blur-3xl" />
        <div className="absolute right-10 bottom-20 h-40 w-40 rounded-full bg-[#90ad71] opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-[#e7edf5] to-[#eef5e7] opacity-30 blur-3xl" />
      </div>
    </section>
  );
};

export default Hero;
