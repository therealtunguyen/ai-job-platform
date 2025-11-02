import { useEffect, useState } from "react";
import { Users, Briefcase, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_PATHS } from "@/utils/apiPath";
import axiosInstance from "@/utils/axiosInstance";

interface DashboardStats {
  activeJobs: number;
  receivedApplications: number;
  profileCompleteness: number;
}

interface EmployerProfileData {
  user?: {
    email?: string;
  };
  profile?: {
    company_name?: string;
    company_description?: string;
    location?: string;
    industry?: string;
    company_size?: string;
    website?: string;
    phone?: string;
    logo?: string;
    cover_image?: string;
  };
}

const EmployerDashboardContent = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    receivedApplications: 0,
    profileCompleteness: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Fetch employer's jobs
        const jobsResponse = await axiosInstance.get(
          API_PATHS.JOBS.GET_BY_EMPLOYER,
        );

        // Fetch applications for employer's jobs
        const applicationsResponse = await axiosInstance.get(
          API_PATHS.APPLICATIONS.GET_EMPLOYER_APPLICATIONS.replace(
            ":employerId",
            user.id.toString(),
          ),
        );

        // Get user profile for completeness calculation
        const profileResponse = await axiosInstance.get(
          API_PATHS.USERS.GET_PROFILE,
        );
        const profileCompleteness = calculateProfileCompleteness(
          profileResponse.data,
        );

        console.log("Jobs Response:", jobsResponse.data.data);

        setStats({
          activeJobs:
            jobsResponse.data?.data?.filter(
              (job: { status: string }) =>
                job.status.toUpperCase() === "ACTIVE",
            )?.length ||
            jobsResponse.data?.length ||
            0,
          receivedApplications:
            applicationsResponse.data?.applications?.length ||
            applicationsResponse.data?.length ||
            0,
          profileCompleteness,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Set default values on error
        setStats({
          activeJobs: 0,
          receivedApplications: 0,
          profileCompleteness: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user?.id]);

  const calculateProfileCompleteness = (
    profileData: EmployerProfileData,
  ): number => {
    let completeness = 0;
    const totalFields = 6;

    // Extract profile data from the response structure
    const user = profileData?.user || {};
    const profile = profileData?.profile || {};

    if (profile?.company_name) completeness++;
    if (user?.email) completeness++;
    if (profile?.company_description) completeness++;
    if (profile?.location) completeness++;
    if (profile?.phone) completeness++;
    if (profile?.logo) completeness++;

    return Math.round((completeness / totalFields) * 100);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex animate-pulse items-center justify-between rounded-lg bg-white p-6 shadow-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-200"></div>
              <div className="text-right">
                <div className="mb-2 h-8 w-12 rounded bg-gray-200"></div>
                <div className="h-4 w-20 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Active Jobs */}
        <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-100">
            <Briefcase className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {stats.activeJobs}
            </p>
            <p className="text-gray-600">Active Jobs</p>
          </div>
        </div>

        {/* Received Applications */}
        <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-purple-100">
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">
              {stats.receivedApplications}
            </p>
            <p className="text-gray-600">Applications</p>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-orange-100">
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-600">
              {stats.profileCompleteness}%
            </p>
            <p className="text-gray-600">Profile Complete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboardContent;
