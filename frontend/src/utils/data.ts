import {
  Search,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Shield,
  Clock,
  Award,
  LucideLayoutDashboard,
  LucideLogOut,
  MessagesSquare,
  BriefcaseBusiness,
} from "lucide-react";

export const jobSeekerFeatures = [
  {
    icon: Search,
    title: "Smart Job Matching",
    description:
      "AI-powered algorithm matches you with relevant opportunities based on your skills and experience",
  },
  {
    icon: FileText,
    title: "Resume Builder",
    description:
      "Create professional resumes with our intuitive builder and templates designed to impress employers",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description:
      "Connect directly with hiring managers and recruiters through our secure messaging system",
  },
  {
    icon: Award,
    title: "Skill Assessment",
    description:
      "Showcase your abilities with verified skill tests and earn badges that employers trust",
  },
];

export const employerFeatures = [
  {
    icon: Users,
    title: "Talent Pool Access",
    description:
      "Access our vast database of pre-screened candidates and find the perfect fit for your team",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track your hiring performance with detailed analytics and insights on candidates",
  },
  {
    icon: Shield,
    title: "Verified Candidates",
    description:
      "All candidates undergo background verification to ensure you're hiring trustworthy professionals",
  },
  {
    icon: Clock,
    title: "Quick Hiring",
    description:
      "Streamlined hiring process reduces time-to-hire by 60% with automated screening",
  },
];

export const SIDE_MENU_JOBSEEKER_DASHBOARD = [
  {
    id: "01",
    icon: LucideLayoutDashboard,
    label: "Dashboard",
    path: "/jobseeker-dashboard",
  },
  {
    id: "02",
    icon: Users,
    label: "My Profile",
    path: "/jobseeker-profile",
  },
  {
    id: "03",
    icon: MessagesSquare,
    label: "Interview",
    path: "/jobseeker-interview",
  },
  {
    id: "04",
    icon: BriefcaseBusiness,
    label: "Apply & Save Job",
    path: "/jobseeker-apply-save-job",
  },
  {
    id: "05",
    icon: LucideLogOut,
    label: "Logout",
    path: "/logout",
  },
];

export const SIDE_MENU_EMPLOYER_DASHBOARD = [
  {
    id: "01",
    icon: LucideLayoutDashboard,
    label: "Dashboard",
    path: "/employer-dashboard",
  },
  {
    id: "02",
    icon: Users,
    label: "My Profile",
    path: "/employer-profile",
  },
  {
    id: "03",
    icon: BriefcaseBusiness,
    label: "Job Management",
    path: "/job-management",
  },
  {
    id: "04",
    icon: FileText,
    label: "Post Job",
    path: "/job-posting",
  },
  {
    id: "05",
    icon: LucideLogOut,
    label: "Logout",
    path: "/logout",
  },
];
