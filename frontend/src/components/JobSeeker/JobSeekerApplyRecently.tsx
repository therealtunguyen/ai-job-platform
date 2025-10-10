import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_PATHS } from "@/utils/apiPath";
import axiosInstance from "@/utils/axiosInstance";

interface Application {
  application_id: string;
  job_id: string;
  status?: string;
  applied_at?: string;
  jobs?: {
    title: string;
    employer_company_name?: string;
    company_name?: string;
    location?: string;
    min_salary?: number;
    max_salary?: number;
    job_type?: string;
    posted_at?: string;
    description?: string;
    employer?: {
      company_name: string;
      logo?: string;
    };
  };
}

const JobSeekerApplyRecently = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserApplications = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const apiUrl = API_PATHS.APPLICATIONS.GET_USER_APPLICATIONS.replace(':userId', user.id.toString());
        
        const response = await axiosInstance.get(apiUrl);
        
        // Get only the 4 most recent applications
        const applications = response.data?.applications || response.data || [];
        const recentApplications = applications.slice(0, 4);
        
        // Fetch detailed job information for each application
        const applicationsWithJobDetails = await Promise.all(
          recentApplications.map(async (application: any) => {
            try {
              console.log('🔍 Fetching job details for job_id:', application.job_id);
              const jobResponse = await axiosInstance.get(
                API_PATHS.JOBS.GET_BY_ID.replace(':id', application.job_id)
              );
              
              console.log('📋 Job details response:', jobResponse.data);
              
              return {
                ...application,
                jobs: jobResponse.data?.job || jobResponse.data
              };
            } catch (error) {
              console.error('❌ Error fetching job details for job_id:', application.job_id, error);
              return application; // Return original application if job fetch fails
            }
          })
        );
        
        console.log('🎯 Recent applications with job details:', applicationsWithJobDetails);
        
        setApplications(applicationsWithJobDetails);
      } catch (error) {
        console.error('Error fetching user applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserApplications();
  }, [user?.id]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  };

  const formatSalary = (min: number, max: number) => {
    return `$${Math.floor(min / 1000)}k - $${Math.floor(max / 1000)}k`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'interview':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
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
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="h-6 w-8 bg-gray-200 rounded"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="mb-2 h-6 w-3/4 bg-gray-200 rounded"></div>
                    <div className="mb-4 h-4 w-1/2 bg-gray-200 rounded"></div>
                    <div className="mb-4 flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {applications.map((application) => {
              console.log('🎨 Rendering application with job data:', application);
              return (
              <div key={application.application_id} className="group">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium bg-green-300 text-green-800 ${getStatusColor(application.status || 'pending')}`}>
                      {application.status || 'Pending'}
                    </span>
                  </div>
                  
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {application.jobs?.title || 'Job Title Not Available'}
                  </h3>
                  
                  <p className="mb-4 text-sm text-gray-600">
                    {application.jobs?.employer_company_name || 
                     application.jobs?.company_name || 
                     application.jobs?.employer?.company_name || 
                     'Company Not Available'}
                  </p>
                  
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {application.jobs?.job_type?.replace('_', ' ') || 'Full Time'}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      {application.jobs?.location || 'Location Not Available'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formatTimeAgo(application.applied_at || new Date().toISOString())}</span>
                    <span className="font-medium">
                      {application.jobs?.min_salary && application.jobs?.max_salary 
                        ? formatSalary(application.jobs.min_salary, application.jobs.max_salary)
                        : 'Salary Not Available'
                      }
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
          
          {applications.length === 0 && (
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
