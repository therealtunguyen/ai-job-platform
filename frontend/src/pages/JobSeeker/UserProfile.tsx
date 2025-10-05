import JobSeekerLayout from "@/components/JobSeeker/JobSeekerLayout";
import { useAuth } from "@/contexts/AuthContext";

const UserProfile = () => {
  const {user} = useAuth();
  return (
    <JobSeekerLayout activeMenu="/jobseeker-profile">
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and preferences</p>
            <div className="h-px bg-gray-300 mt-2"/>
            <div className="flex items-center space-x-4">
              
            </div>
          </div>
        </div>
      </div>
    </JobSeekerLayout>
  );
};

export default UserProfile;