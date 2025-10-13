import JobSeekerLayout from "@/components/JobSeeker/JobSeekerLayout";
import JobSeekerDashBoardContent from "@/components/JobSeeker/JobSeekerDashBoardContent";
import JobSeekerApplyRecently from "@/components/JobSeeker/JobSeekerApplyRecently";

const JobSeekerDashBoard = () => {
  return (
    <JobSeekerLayout activeMenu="/jobseeker-dashboard">
      <JobSeekerDashBoardContent />
      <JobSeekerApplyRecently />
    </JobSeekerLayout>
  );
};

export default JobSeekerDashBoard;
