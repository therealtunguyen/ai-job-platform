import { useState, useEffect } from "react";
import EmployerNavbar from "./EmployerNavbar";

interface EmployerLayoutProps {
  children: React.ReactNode;
  activeMenu?: string;
}

const EmployerLayout = ({
  children,
  activeMenu = "/employer-dashboard",
}: EmployerLayoutProps) => {
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
      <EmployerNavbar
        activeMenu={currentActiveMenu}
        onMenuClick={handleMenuClick}
      />

      <div className="flex-1">{children}</div>
    </div>
  );
};

export default EmployerLayout;
