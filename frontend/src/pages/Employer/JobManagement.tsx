import EmployerLayout from "@/components/Employer/EmployerLayout";
import JobDashboard from "@/components/Employer/JobDashboard";

const JobManagement = () => {
  return (
    <EmployerLayout activeMenu="/job-management">
      <JobDashboard />
    </EmployerLayout>
  );
};

export default JobManagement;
