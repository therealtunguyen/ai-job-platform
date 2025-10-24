import { useEffect, useState } from "react";
import {
  Bookmark,
  BriefcaseBusiness,
  MessageSquareWarning,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_PATHS } from "@/utils/apiPath";
import axiosInstance from "@/utils/axiosInstance";

interface DashboardStats {
  appliedJobs: number;
  interviews: number;
  savedJobs: number;
  profileCompleteness: number;
}

interface Experience {
  id?: string;
  title?: string;
  company?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface Education {
  id?: string;
  institution?: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
}

interface UserProfileData {
  user?: {
    email?: string;
  };
  profile?: {
    full_name?: string;
    phone?: string;
    summary?: string;
    bio?: string;
    skills?: string[];
    experience?: Experience[];
    education?: Education[];
    profile_picture?: string;
    profile_image_url?: string;
  };
}

const JobSeekerDashBoardContent = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    appliedJobs: 0,
    interviews: 0,
    savedJobs: 0,
    profileCompleteness: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Fetch user applications using the correct API path
        const applicationsResponse = await axiosInstance.get(
          API_PATHS.APPLICATIONS.GET_USER_APPLICATIONS.replace(
            ":userId",
            user.id.toString(),
          ),
        );

        // Fetch user interviews
        const interviewsResponse = await axiosInstance.get(
          API_PATHS.INTERVIEWS.GET_USER_INTERVIEWS,
        );

        // Get user profile for completeness calculation
        const profileResponse = await axiosInstance.get(
          API_PATHS.USERS.GET_PROFILE,
        );
        const profileCompleteness = calculateProfileCompleteness(
          profileResponse.data,
        );

        setStats({
          appliedJobs:
            applicationsResponse.data?.applications?.length ||
            applicationsResponse.data?.length ||
            0,
          interviews:
            interviewsResponse.data?.interviews?.length ||
            interviewsResponse.data?.length ||
            0,
          savedJobs: 0, // This would need a saved jobs API
          profileCompleteness,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Set default values on error
        setStats({
          appliedJobs: 0,
          interviews: 0,
          savedJobs: 0,
          profileCompleteness: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user?.id]);

  const calculateProfileCompleteness = (
    profileData: UserProfileData,
  ): number => {
    let completeness = 0;
    const totalFields = 8;

    // Extract profile data from the response structure
    const user = profileData?.user || {};
    const profile = profileData?.profile || {};

    if (profile?.full_name) completeness++;
    if (user?.email) completeness++;
    if (profile?.phone) completeness++;
    if (profile?.summary || profile?.bio) completeness++;
    if (profile?.skills && profile.skills.length > 0) completeness++;
    if (profile?.experience && profile.experience.length > 0) completeness++;
    if (profile?.education && profile.education.length > 0) completeness++;
    if (profile?.profile_picture || profile?.profile_image_url) completeness++;

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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Applied Jobs */}
        <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-100">
            <BriefcaseBusiness className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {stats.appliedJobs}
            </p>
            <p className="text-gray-600">Applied Jobs</p>
          </div>
        </div>

        {/* Interviews */}
        <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-purple-100">
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">
              {stats.interviews}
            </p>
            <p className="text-gray-600">Interviews</p>
          </div>
        </div>

        {/* Saved Jobs */}
        <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-100">
            <Bookmark className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">
              {stats.savedJobs}
            </p>
            <p className="text-gray-600">Saved Jobs</p>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-orange-100">
            <MessageSquareWarning className="h-8 w-8 text-orange-600" />
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

export default JobSeekerDashBoardContent;
