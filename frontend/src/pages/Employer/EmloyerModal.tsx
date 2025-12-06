import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Database } from "@/types/supabase";

type EmployerBase = Database["public"]["Tables"]["employers"]["Row"];

type Employer = EmployerBase & {
  email?: string | null;
  company_size?: string | null;
  website?: string | null;
  founded_year?: number | string | null;
  linkedin_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
};

interface EmployerModalProps {
  employer: Employer | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmployerModal: React.FC<EmployerModalProps> = ({
  employer,
  isOpen,
  onClose,
}) => {
  if (!employer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#29436c] to-[#90ad71] px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h2 className="mb-2 text-3xl font-bold text-white">
                    {employer.company_name || "Unnamed Company"}
                  </h2>
                  <div className="flex flex-wrap gap-3 text-sm text-white/90">
                    {employer.industry && (
                      <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-1.5 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        {employer.industry}
                      </span>
                    )}
                    {employer.address && (
                      <span className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-1 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {employer.address}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[calc(90vh-160px)] overflow-y-auto px-6 py-6">
              {/* Quick Info Cards */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {employer.contact_person && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="mb-1 flex items-center text-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Contact Person
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {employer.contact_person}
                    </div>
                  </div>
                )}

                {employer.phone && (
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="mb-1 flex items-center text-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      Phone Number
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {employer.phone}
                    </div>
                  </div>
                )}

                {employer.email && (
                  <div className="rounded-lg bg-purple-50 p-4">
                    <div className="mb-1 flex items-center text-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Email
                    </div>
                    <div className="text-base font-semibold break-all text-gray-900">
                      {employer.email}
                    </div>
                  </div>
                )}
              </div>

              {/* Company Description */}
              {employer.description && (
                <div className="mb-6">
                  <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-[#29436c]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    About Company
                  </h3>
                  <div className="prose prose-sm max-w-none rounded-lg bg-gray-50 p-4 whitespace-pre-line text-gray-700">
                    {employer.description}
                  </div>
                </div>
              )}

              {/* Company Details Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Company Size */}
                {employer.company_size && (
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="mb-2 flex items-center text-sm font-medium text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1.5 h-4 w-4 text-[#29436c]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Company Size
                    </h4>
                    <p className="font-medium text-gray-900">
                      {employer.company_size}
                    </p>
                  </div>
                )}

                {/* Website */}
                {employer.website && (
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="mb-2 flex items-center text-sm font-medium text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1.5 h-4 w-4 text-[#29436c]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      Website
                    </h4>
                    <a
                      href={employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium break-all text-[#29436c] hover:text-[#90ad71] hover:underline"
                    >
                      {employer.website}
                    </a>
                  </div>
                )}

                {/* Founded Year */}
                {employer.founded_year && (
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="mb-2 flex items-center text-sm font-medium text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1.5 h-4 w-4 text-[#29436c]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Founded Year
                    </h4>
                    <p className="font-medium text-gray-900">
                      {employer.founded_year}
                    </p>
                  </div>
                )}

                {/* Full Address */}
                {employer.address && (
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="mb-2 flex items-center text-sm font-medium text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1.5 h-4 w-4 text-[#29436c]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Full Address
                    </h4>
                    <p className="font-medium text-gray-900">
                      {employer.address}
                    </p>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {(employer.linkedin_url ||
                employer.facebook_url ||
                employer.twitter_url) && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-[#29436c]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    Social Media
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {employer.linkedin_url && (
                      <a
                        href={employer.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                      >
                        <svg
                          className="mr-2 h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {employer.facebook_url && (
                      <a
                        href={employer.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                      >
                        <svg
                          className="mr-2 h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </a>
                    )}
                    {employer.twitter_url && (
                      <a
                        href={employer.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100"
                      >
                        <svg
                          className="mr-2 h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        Twitter
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="rounded-lg bg-gradient-to-r from-[#29436c] to-[#90ad71] px-6 py-2 font-medium text-white shadow-sm transition-all hover:from-[#29436c]/90 hover:to-[#90ad71]/90 hover:shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EmployerModal;
