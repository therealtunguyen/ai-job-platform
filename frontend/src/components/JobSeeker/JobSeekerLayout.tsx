import { useState, useEffect } from "react";
import JobSeekerNavbar from "./JobSeekerNavbar";

interface JobSeekerLayoutProps {
  children: React.ReactNode;
  activeMenu?: string;
}

const JobSeekerLayout = ({ children, activeMenu = "/jobseeker-dashboard" }: JobSeekerLayoutProps) => {
  const [currentActiveMenu, setCurrentActiveMenu] = useState(activeMenu);

  // Update currentActiveMenu when activeMenu prop changes
  useEffect(() => {
    setCurrentActiveMenu(activeMenu);
  }, [activeMenu]);

  const handleMenuClick = (path: string) => {
    setCurrentActiveMenu(path);
  };

  return (
    <div className="flex min-h-screen pt-16">
      <JobSeekerNavbar 
        activeMenu={currentActiveMenu} 
        onMenuClick={handleMenuClick} 
      />

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default JobSeekerLayout;

