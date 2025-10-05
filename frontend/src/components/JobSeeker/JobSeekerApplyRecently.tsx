import JobCard from "@/pages/Employer/JobCard";

const JobSeekerApplyRecently = () => {
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
  return (
    <div className="p-8">
      <div className="rounded-xl border border-gray-100 bg-white shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            Jobs Applied Recently
          </h2>
          <p className="text-gray-600">
            Track your recent job applications and their status
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featuredJobs.map((job, index) => (
              <div key={index} className="group">
                <JobCard
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  timeAgo={job.timeAgo}
                  salary={job.salary}
                  jobType={job.jobType}
                  companyType={job.companyType}
                  urgency={job.urgency}
                />
              </div>
            ))}
          </div>
          {featuredJobs.length === 0 && (
            <div className="py-12 text-center">
              <div className="mb-4 text-gray-400">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No recent applications
              </h3>
              <p className="text-gray-500">
                Start applying to jobs to see them here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSeekerApplyRecently;
