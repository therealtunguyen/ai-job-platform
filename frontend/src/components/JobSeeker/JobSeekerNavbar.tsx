import { SIDE_MENU_JOBSEEKER_DASHBOARD } from "@/utils/data";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface JobSeekerNavbarProps {
  activeMenu?: string;
  onMenuClick?: (path: string) => void;
}

const JobSeekerNavbar = ({
  activeMenu = "/jobseeker-dashboard",
  onMenuClick,
}: JobSeekerNavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = (path: string) => {
    if (path === "/logout") {
      logout();
    } else {
      onMenuClick?.(path);
      navigate(path);
    }
  };

  return (
    <div className="w-64 bg-white p-4 text-gray-600 shadow-lg">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Job Seeker</h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
        <div className="mt-4 h-px w-full bg-black" />
      </div>

      <nav className="space-y-2">
        {SIDE_MENU_JOBSEEKER_DASHBOARD.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeMenu === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.path)}
              className={`flex w-full cursor-pointer items-center space-x-3 rounded-lg px-4 py-3 text-left transition-colors ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-blue-200"
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default JobSeekerNavbar;
