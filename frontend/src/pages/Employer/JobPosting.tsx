import { useState } from "react";
import EmployerLayout from "@/components/Employer/EmployerLayout";
import JobStepper from "@/components/Employer/JobStepper";
import type { Job as JobType } from "@/services/jobService";

const JobPosting = () => {
  const [isCreating, setIsCreating] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);

  const handleJobCreated = (job: JobType) => {
    // Handle job creation/publishing
    console.log("Job created:", job);
    alert(
      job.status === "ACTIVE"
        ? "Job published successfully!"
        : "Job saved as draft successfully!",
    );

    // Optionally navigate to dashboard
    setTimeout(() => {
      window.location.href = "/job-management";
    }, 1500);
  };

  const handleEditJob = (job: JobType) => {
    setSelectedJob(job);
    setIsCreating(false);
  };

  const handleBackToDashboard = () => {
    window.location.href = "/job-management";
  };

  return (
    <EmployerLayout activeMenu="/job-management">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {isCreating ? "Create New Job" : "Edit Job Posting"}
          </h1>
          <button
            onClick={handleBackToDashboard}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>

        <JobStepper
          onJobCreated={handleJobCreated}
          jobToEdit={isCreating ? undefined : selectedJob}
          isEditing={!isCreating}
        />
      </div>
    </EmployerLayout>
  );
};

export default JobPosting;
