import { useState } from "react";
import { API_PATHS } from "@/utils/apiPath";
import axiosInstance from "@/utils/axiosInstance";
import { User, Plus, Trash2 } from "lucide-react";

interface Education {
  education_id: string;
  institution: string;
  degree: string | null;
  major: string | null;
  start_date: string | null;
  end_date: string | null;
  grade: string | null;
  description: string | null;
}

interface EducationSectionOwnProps {
  loading: boolean;
  educationLoading: boolean;
  setEducationLoading: (loading: boolean) => void;
  fetchEducations: () => void;
  educations: Education[];
}

const EducationSection: React.FC<EducationSectionOwnProps> = ({
  loading,
  educationLoading,
  setEducationLoading,
  fetchEducations,
  educations,
}) => {
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    major: "",
    start_date: "",
    end_date: "",
    grade: "",
    description: "",
  });

  const handleAddEducation = async () => {
    try {
      if (!newEducation.institution) {
        alert("Institution is required");
        return;
      }

      setEducationLoading(true);
      await axiosInstance.post(
        API_PATHS.JOB_SEEKERS.EDUCATION.ADD,
        newEducation,
      );
      await fetchEducations();
      setNewEducation({
        institution: "",
        degree: "",
        major: "",
        start_date: "",
        end_date: "",
        grade: "",
        description: "",
      });
      setShowAddEducation(false);
      alert("Education added successfully!");
    } catch (error) {
      console.error("Error adding education:", error);
      alert("Error adding education. Please try again.");
    } finally {
      setEducationLoading(false);
    }
  };

  const handleDeleteEducation = async (educationId: string) => {
    try {
      if (!confirm("Are you sure you want to delete this education?")) {
        return;
      }

      setEducationLoading(true);
      await axiosInstance.delete(
        API_PATHS.JOB_SEEKERS.EDUCATION.DELETE.replace(
          ":educationId",
          educationId,
        ),
      );
      await fetchEducations();
      alert("Education deleted successfully!");
    } catch (error) {
      console.error("Error deleting education:", error);
      alert("Error deleting education. Please try again.");
    } finally {
      setEducationLoading(false);
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-xl">
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Education</h3>
              <p className="text-gray-600">Add your educational background</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddEducation(!showAddEducation)}
            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Education</span>
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Add Education Form */}
        {showAddEducation && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-900">
              Add New Education
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Institution
                </label>
                <input
                  type="text"
                  value={newEducation.institution}
                  onChange={(e) =>
                    setNewEducation((prev) => ({
                      ...prev,
                      institution: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  placeholder="University/College name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Degree
                </label>
                <input
                  type="text"
                  value={newEducation.degree}
                  onChange={(e) =>
                    setNewEducation((prev) => ({
                      ...prev,
                      degree: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  placeholder="Degree (e.g., Bachelor's, Master's)"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Major
                </label>
                <input
                  type="text"
                  value={newEducation.major}
                  onChange={(e) =>
                    setNewEducation((prev) => ({
                      ...prev,
                      major: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  placeholder="Major/Field of study"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Grade/CGPA
                </label>
                <input
                  type="text"
                  value={newEducation.grade}
                  onChange={(e) =>
                    setNewEducation((prev) => ({
                      ...prev,
                      grade: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  placeholder="Grade/CGPA"
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
                  value={newEducation.start_date}
                  onChange={(e) =>
                    setNewEducation((prev) => ({
                      ...prev,
                      start_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={newEducation.end_date}
                  onChange={(e) =>
                    setNewEducation((prev) => ({
                      ...prev,
                      end_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={newEducation.description}
                onChange={(e) =>
                  setNewEducation((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                placeholder="Additional details about your education..."
              />
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleAddEducation}
                disabled={loading || educationLoading}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>{educationLoading ? "Adding..." : "Add Education"}</span>
              </button>
              <button
                onClick={() => {
                  setShowAddEducation(false);
                  setNewEducation({
                    institution: "",
                    degree: "",
                    major: "",
                    start_date: "",
                    end_date: "",
                    grade: "",
                    description: "",
                  });
                }}
                disabled={educationLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Education List */}
        <div className="space-y-4">
          {educations.length === 0 ? (
            <div className="py-8 text-center">
              <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h4 className="mb-2 text-lg font-medium text-gray-900">
                No Education Added
              </h4>
              <p className="text-gray-600">
                Add your educational background to showcase your qualifications
              </p>
            </div>
          ) : (
            educations.map((education) => (
              <div
                key={education.education_id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">
                    {education.institution}
                  </h5>
                  <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-600">
                    {education.degree && (
                      <span className="rounded bg-gray-100 px-2 py-1">
                        {education.degree}
                      </span>
                    )}
                    {education.major && (
                      <span className="rounded bg-gray-100 px-2 py-1">
                        {education.major}
                      </span>
                    )}
                    {education.grade && (
                      <span className="rounded bg-gray-100 px-2 py-1">
                        {education.grade}
                      </span>
                    )}
                    {education.start_date && education.end_date && (
                      <span className="rounded bg-gray-100 px-2 py-1">
                        {education.start_date} - {education.end_date}
                      </span>
                    )}
                    {education.start_date && !education.end_date && (
                      <span className="rounded bg-gray-100 px-2 py-1">
                        {education.start_date} - Present
                      </span>
                    )}
                  </div>
                  {education.description && (
                    <p className="mt-2 text-sm text-gray-700">
                      {education.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteEducation(education.education_id)}
                  disabled={loading || educationLoading}
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
export default EducationSection;
