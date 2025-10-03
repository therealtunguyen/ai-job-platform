import JobSeekerLayout from "@/components/JobSeeker/JobSeekerLayout";

const UserProfile = () => {
  return (
    <JobSeekerLayout activeMenu="/jobseeker-profile">
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and preferences</p>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
            </div>
          </div>
        </div>
      </div>
    </JobSeekerLayout>
  );
};

export default UserProfile;