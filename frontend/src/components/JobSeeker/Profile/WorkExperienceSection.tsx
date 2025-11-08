import { useState } from "react";
import { API_PATHS } from "@/utils/apiPath";
import axiosInstance from "@/utils/axiosInstance";
import { User, Plus, Trash2 } from "lucide-react";

interface WorkExperience {
  experience_id: string;
  company_name: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  is_current: boolean;
}

interface WorkExperienceSectionProps {
  loading: boolean;
  workExperienceLoading: boolean;
  setWorkExperienceLoading: (loading: boolean) => void;
  fetchWorkExperiences: () => void;
  workExperiences: WorkExperience[];
}

const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  loading,
  workExperienceLoading,
  setWorkExperienceLoading,
  fetchWorkExperiences,
  workExperiences,
}) => {
  const [showAddWorkExperience, setShowAddWorkExperience] = useState(false);
  const [newWorkExperience, setNewWorkExperience] = useState({
    company_name: "",
    position: "",
    start_date: "",
    end_date: "",
    description: "",
    is_current: false,
  });

  const handleAddWorkExperience = async () => {
    try {
      if (!newWorkExperience.company_name || !newWorkExperience.position) {
        alert("Company name and position are required");
        return;
      }

      setWorkExperienceLoading(true);
      await axiosInstance.post(
        API_PATHS.JOB_SEEKERS.WORK_EXPERIENCES.ADD,
        newWorkExperience,
      );
      await fetchWorkExperiences();
      setNewWorkExperience({
        company_name: "",
        position: "",
        start_date: "",
        end_date: "",
        description: "",
        is_current: false,
      });
      setShowAddWorkExperience(false);
      alert("Work experience added successfully!");
    } catch (error) {
      console.error("Error adding work experience:", error);
      alert("Error adding work experience. Please try again.");
    } finally {
      setWorkExperienceLoading(false);
    }
  };

  const handleDeleteWorkExperience = async (experienceId: string) => {
    try {
      if (!confirm("Are you sure you want to delete this work experience?")) {
        return;
      }

      setWorkExperienceLoading(true);
      await axiosInstance.delete(
        API_PATHS.JOB_SEEKERS.WORK_EXPERIENCES.DELETE.replace(
          ":experienceId",
          experienceId,
        ),
      );
      await fetchWorkExperiences();
      alert("Work experience deleted successfully!");
    } catch (error) {
      console.error("Error deleting work experience:", error);
      alert("Error deleting work experience. Please try again.");
    } finally {
      setWorkExperienceLoading(false);
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-xl">
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-green-100 p-2">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Work Experiences
              </h3>
              <p className="text-gray-600">
                Add your professional work history
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddWorkExperience(!showAddWorkExperience)}
            className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Experience</span>
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Add Work Experience Form */}
        {showAddWorkExperience && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-900">
              Add New Work Experience
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newWorkExperience.company_name}
                  onChange={(e) =>
                    setNewWorkExperience((prev) => ({
                      ...prev,
                      company_name: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Position
                </label>
                <input
                  type="text"
                  value={newWorkExperience.position}
                  onChange={(e) =>
                    setNewWorkExperience((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                  placeholder="Your position"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newWorkExperience.start_date}
                  onChange={(e) =>
                    setNewWorkExperience((prev) => ({
                      ...prev,
                      start_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={newWorkExperience.end_date}
                  onChange={(e) =>
                    setNewWorkExperience((prev) => ({
                      ...prev,
                      end_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                  disabled={newWorkExperience.is_current}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newWorkExperience.is_current}
                  onChange={(e) =>
                    setNewWorkExperience((prev) => ({
                      ...prev,
                      is_current: e.target.checked,
                      end_date: e.target.checked ? "" : prev.end_date,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Currently working here
                </span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={newWorkExperience.description}
                onChange={(e) =>
                  setNewWorkExperience((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                placeholder="Describe your responsibilities and achievements..."
              />
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleAddWorkExperience}
                disabled={loading || workExperienceLoading}
                className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>
                  {workExperienceLoading ? "Adding..." : "Add Experience"}
                </span>
              </button>
              <button
                onClick={() => {
                  setShowAddWorkExperience(false);
                  setNewWorkExperience({
                    company_name: "",
                    position: "",
                    start_date: "",
                    end_date: "",
                    description: "",
                    is_current: false,
                  });
                }}
                disabled={workExperienceLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Work Experiences List */}
        <div className="space-y-4">
          {workExperiences.length === 0 ? (
            <div className="py-8 text-center">
              <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h4 className="mb-2 text-lg font-medium text-gray-900">
                No Work Experiences Added
              </h4>
              <p className="text-gray-600">
                Add your professional work history to showcase your experience
              </p>
            </div>
          ) : (
            workExperiences.map((workExperience) => (
              <div
                key={workExperience.experience_id}
                className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-gray-900">
                      {workExperience.position} at {workExperience.company_name}
                    </h5>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-600">
                    {workExperience.start_date && (
                      <span className="rounded bg-gray-100 px-2 py-1">
                        {workExperience.start_date} -{" "}
                        {workExperience.is_current
                          ? "Present"
                          : workExperience.end_date || "Unknown"}
                      </span>
                    )}
                    {workExperience.is_current && (
                      <span className="rounded bg-green-100 px-2 py-1 text-green-800">
                        Currently Working
                      </span>
                    )}
                  </div>
                  {workExperience.description && (
                    <p className="mt-2 text-sm text-gray-700">
                      {workExperience.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() =>
                    handleDeleteWorkExperience(workExperience.experience_id)
                  }
                  disabled={loading || workExperienceLoading}
                  className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkExperienceSection;
