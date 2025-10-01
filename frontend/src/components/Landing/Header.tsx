import {motion} from 'framer-motion'
import { Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { User } from '@/types/LandingTypes';
const Header = () => {
  const isAuthenticated : boolean = false;
  const user : User = {
    name : "Tan",
    role: "Employer"
  };
  const navigate = useNavigate();
  return (
    <motion.header
      initial = {{opacity: 0, y: -20}}
      animate = {{opacity: 1, y: 0}}
      transition={{duration: 0.6}}
      className=''
    >
      <div className=''>
        <div className=''>
          {/* logo */}
          <div className=''>
            <div className=''>
              <Briefcase className=''/>
            </div>
            <span>SkillSync</span>
          </div>
          <nav>
            <a>
              Find Jobs
            </a>
            <a>
              Employees
            </a>
          </nav>
        </div>
      </div>
    </motion.header>
  )
}

export default Header