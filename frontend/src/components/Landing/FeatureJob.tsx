import React from "react";
import JobCard from "../../pages/Employer/JobCard";
import { useNavigate } from "react-router-dom";

const FeatureJob = () => {
  const featuredJobs = [
    {
      title: "Software Engineer (Android), Libraries",
      company: "Segment",
      location: "London, UK",
      timeAgo: "11 hours ago",
      salary: "$35k - $45k",
      jobType: "Full Time",
      companyType: "Private",
      urgency: "Urgent",
    },
    {
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "San Francisco, CA",
      timeAgo: "1 day ago",
      salary: "$80k - $120k",
      jobType: "Full Time",
      companyType: "Public",
    },
    {
      title: "UI/UX Designer",
      company: "DesignStudio",
      location: "New York, NY",
      timeAgo: "2 days ago",
      salary: "$60k - $90k",
      jobType: "Contract",
      companyType: "Private",
      urgency: "Urgent",
    },
    {
      title: "Backend Developer",
      company: "DataFlow",
      location: "Remote",
      timeAgo: "3 days ago",
      salary: "$70k - $100k",
      jobType: "Full Time",
      companyType: "Startup",
    },
  ];

  const navigate = useNavigate();
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Featured Jobs
          </h2>
          <p className="text-lg text-gray-600">
            Know your worth and find the job that qualifies your life
          </p>
        </div>

        {/* Job Cards Grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
          {featuredJobs.map((job, index) => (
            <JobCard
              key={index}
              title={job.title}
              company={job.company}
              location={job.location}
              timeAgo={job.timeAgo}
              salary={job.salary}
              jobType={job.jobType}
              companyType={job.companyType}
              urgency={job.urgency}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-12 text-center">
          <button
            className="cursor-pointer rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            onClick={() => {
              navigate("/find-jobs");
            }}
          >
            Load More Listings
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeatureJob;
