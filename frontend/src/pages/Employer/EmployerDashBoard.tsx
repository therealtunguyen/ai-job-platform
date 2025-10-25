import EmployerLayout from "@/components/Employer/EmployerLayout";
import EmployerDashboardContent from "@/components/Employer/EmployerDashboardContent";
import EmployerRecentActivity from "@/components/Employer/EmployerRecentActivity";

const EmployerDashBoard = () => {
  return (
    <EmployerLayout activeMenu="/employer-dashboard">
      <EmployerDashboardContent />
      <EmployerRecentActivity />
    </EmployerLayout>
  );
};

export default EmployerDashBoard;
