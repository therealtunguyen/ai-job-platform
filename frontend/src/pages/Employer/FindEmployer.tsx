import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";
import type { Database } from "@/types/supabase";
import EmployerModal from "./EmloyerModal";

type Employer = Database["public"]["Tables"]["employers"]["Row"];

const FindEmployer = () => {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingEmployers, setLoadingEmployers] = useState<boolean>(false);

  // Modal states
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters giống kiểu JobViews nhưng map sang employers
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [industryFilter, setIndustryFilter] = useState<string>("");
  const [addressFilter, setAddressFilter] = useState<string>("");

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(API_PATHS.EMPLOYERS.LIST);

      if (response.data && response.data.data) {
        setEmployers(response.data.data);
      } else if (Array.isArray(response.data)) {
        setEmployers(response.data);
      } else {
        setEmployers([]);
      }
    } catch (error) {
      console.error("Error fetching employers:", error);
      setEmployers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setLoadingEmployers(true);

      const params: Record<string, string> = {};

      if (companyFilter) params.company_name = companyFilter;
      if (industryFilter) params.industry = industryFilter;
      if (addressFilter) params.address = addressFilter;

      const response = await axiosInstance.get(API_PATHS.EMPLOYERS.LIST, {
        params,
      });

      if (response.data && response.data.data) {
        setEmployers(response.data.data);
      } else if (Array.isArray(response.data)) {
        setEmployers(response.data);
      } else {
        setEmployers([]);
      }
    } catch (error) {
      console.error("Error filtering employers:", error);
      setEmployers([]);
    } finally {
      setLoadingEmployers(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#29436c] border-t-transparent"></div>
              <p className="mt-4 text-lg text-gray-600">Loading page...</p>
            </div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
                Find <span className="text-[#29436c]">Employers</span>
              </h1>
              <p className="mx-auto max-w-3xl text-lg text-gray-600">
                Explore companies and businesses using the platform and find the one that suits you.
              </p>
            </motion.div>

            {/* Filter Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-10 rounded-xl bg-white p-6 shadow-lg"
            >
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Lọc Employers
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Company Name Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#29436c] focus:ring-1 focus:ring-[#29436c] focus:outline-none"
                    placeholder="VD: ACME Corp"
                  />
                </div>

                {/* Industry Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#29436c] focus:ring-1 focus:ring-[#29436c] focus:outline-none"
                    placeholder="VD: Software, Finance..."
                  />
                </div>

                {/* Address Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    value={addressFilter}
                    onChange={(e) => setAddressFilter(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#29436c] focus:ring-1 focus:ring-[#29436c] focus:outline-none"
                    placeholder="VD: Ho Chi Minh City"
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={async () => {
                    setCompanyFilter("");
                    setIndustryFilter("");
                    setAddressFilter("");

                    try {
                      setLoadingEmployers(true);
                      const response = await axiosInstance.get(
                        API_PATHS.EMPLOYERS.LIST,
                      );

                      if (response.data && response.data.data) {
                        setEmployers(response.data.data);
                      } else if (Array.isArray(response.data)) {
                        setEmployers(response.data);
                      } else {
                        setEmployers([]);
                      }
                    } catch (error) {
                      console.error("Error resetting employer filters:", error);
                      setEmployers([]);
                    } finally {
                      setLoadingEmployers(false);
                    }
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-[#29436c] focus:ring-offset-2 focus:outline-none"
                >
                  Clear Filters
                </button>
                <button
                  onClick={applyFilters}
                  className="rounded-md bg-[#29436c] px-4 py-2 text-sm font-medium text-white hover:bg-[#29436c]/90 focus:ring-2 focus:ring-[#29436c] focus:ring-offset-2 focus:outline-none"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>

            {/* Employer Cards */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {loadingEmployers ? (
                <div className="col-span-full flex justify-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#29436c] border-t-transparent"></div>
                    <p className="mt-4 text-lg text-gray-600">
                      Loading employers...
                    </p>
                  </div>
                </div>
              ) : employers.length > 0 ? (
                employers.map((employer) => (
                  <motion.div
                    key={employer.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
                  >
                    <div className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-2 text-xl font-bold text-gray-900">
                            {employer.company_name || "Unnamed Company"}
                          </h3>
                          {employer.industry && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                              {employer.industry}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="mb-2 flex items-center text-gray-600">
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
                        {employer.address || "Address not specified"}
                      </p>

                      <div className="mb-4 text-sm text-gray-600">
                        {employer.contact_person && (
                          <div className="flex items-center mb-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
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
                            {employer.contact_person}
                          </div>
                        )}
                        {employer.phone && (
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
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
                            {employer.phone}
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <p className="line-clamp-3 text-gray-700">
                          {employer.description?.substring(0, 150) ||
                            "No description provided"}
                          ...
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedEmployer(employer);
                            setIsModalOpen(true);
                          }}
                          className="rounded-lg bg-gradient-to-r from-[#29436c] to-[#90ad71] px-4 py-2 font-medium text-white shadow-sm hover:from-[#29436c]/90 hover:to-[#90ad71]/90 hover:shadow-md transition-all"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <div className="text-lg text-gray-500">
                    Không tìm thấy employer nào với bộ lọc hiện tại.
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Employer Modal */}
      <EmployerModal
        employer={selectedEmployer}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployer(null);
        }}
      />
    </div>
  );
};

export default FindEmployer;