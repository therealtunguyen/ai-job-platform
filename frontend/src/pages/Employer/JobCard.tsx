import React from "react";
import {
  Bookmark,
  CircleDollarSign,
  Clock,
  MapPinned,
  GraduationCap,
} from "lucide-react";

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  timeAgo: string;
  salary: string;
  jobType: string;
  companyType: string;
  urgency?: string;
  companyLogo?: string;
  experience?: string;
}

const JobCard: React.FC<JobCardProps> = ({
  title,
  company,
  location,
  timeAgo,
  salary,
  jobType,
  companyType,
  urgency,
  companyLogo = "/Logo_SkillSync_BR.png",
  experience,
}) => {
  return (
    <div className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md">
      <div className="flex items-center space-x-4">
        <img
          src={companyLogo}
          alt={`${company} logo`}
          className="h-16 w-16 rounded-lg object-cover"
        />
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <MapPinned className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{timeAgo}</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <CircleDollarSign className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{salary}</span>
            </div>
            {experience && (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <GraduationCap className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{experience}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {jobType}
            </span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              {companyType}
            </span>
            {urgency && (
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
                {urgency}
              </span>
            )}
          </div>
        </div>
      </div>
      <button className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600">
        <Bookmark className="h-5 w-5" />
      </button>
    </div>
  );
};

export default JobCard;
