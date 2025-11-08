import { useState } from "react";
import { API_PATHS } from "@/utils/apiPath";
import axiosInstance from "@/utils/axiosInstance";
import { FileText, Plus, Trash2 } from "lucide-react";

interface Certification {
  cert_id: string;
  name: string;
  issuer: string | null;
  issued_date: string | null;
  expiry_date: string | null;
}

interface CertificationsSectionProps {
  loading: boolean;
  certificationLoading: boolean;
  setCertificationLoading: (loading: boolean) => void;
  fetchCertifications: () => void;
  certifications: Certification[];
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  loading,
  certificationLoading,
  setCertificationLoading,
  fetchCertifications,
  certifications,
}) => {
  const [showAddCertification, setShowAddCertification] = useState(false);
  const [newCertification, setNewCertification] = useState({
    name: "",
    issuer: "",
    issued_date: "",
    expiry_date: "",
  });

  const handleAddCertification = async () => {
    try {
      if (!newCertification.name) {
        alert("Certification name is required");
        return;
      }

      setCertificationLoading(true);
      await axiosInstance.post(
        API_PATHS.JOB_SEEKERS.CERTIFICATIONS.ADD,
        newCertification,
      );
      await fetchCertifications();
      setNewCertification({
        name: "",
        issuer: "",
        issued_date: "",
        expiry_date: "",
      });
      setShowAddCertification(false);
      alert("Certification added successfully!");
    } catch (error) {
      console.error("Error adding certification:", error);
      alert("Error adding certification. Please try again.");
    } finally {
      setCertificationLoading(false);
    }
  };

  const handleDeleteCertification = async (certId: string) => {
    try {
      if (!confirm("Are you sure you want to delete this certification?")) {
        return;
      }

      setCertificationLoading(true);
      await axiosInstance.delete(
        API_PATHS.JOB_SEEKERS.CERTIFICATIONS.DELETE.replace(":certId", certId),
      );
      await fetchCertifications();
      alert("Certification deleted successfully!");
    } catch (error) {
      console.error("Error deleting certification:", error);
      alert("Error deleting certification. Please try again.");
    } finally {
      setCertificationLoading(false);
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-xl">
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Certifications
              </h3>
              <p className="text-gray-600">
                Add your professional certifications
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddCertification(!showAddCertification)}
            className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Certification</span>
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Add Certification Form */}
        {showAddCertification && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-900">
              Add New Certification
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Certification Name
                </label>
                <input
                  type="text"
                  value={newCertification.name}
                  onChange={(e) =>
                    setNewCertification((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  placeholder="Name of certification"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Issuer
                </label>
                <input
                  type="text"
                  value={newCertification.issuer}
                  onChange={(e) =>
                    setNewCertification((prev) => ({
                      ...prev,
                      issuer: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  placeholder="Issuing organization"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={newCertification.issued_date}
                  onChange={(e) =>
                    setNewCertification((prev) => ({
                      ...prev,
                      issued_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={newCertification.expiry_date}
                  onChange={(e) =>
                    setNewCertification((prev) => ({
                      ...prev,
                      expiry_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleAddCertification}
                disabled={loading || certificationLoading}
                className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>
                  {certificationLoading ? "Adding..." : "Add Certification"}
                </span>
              </button>
              <button
                onClick={() => {
                  setShowAddCertification(false);
                  setNewCertification({
                    name: "",
                    issuer: "",
                    issued_date: "",
                    expiry_date: "",
                  });
                }}
                disabled={certificationLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Certifications List */}
        <div className="space-y-4">
          {certifications.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h4 className="mb-2 text-lg font-medium text-gray-900">
                No Certifications Added
              </h4>
              <p className="text-gray-600">
                Add your professional certifications to showcase your skills
              </p>
            </div>
          ) : (
            certifications.map((certification) => (
              <div
                key={certification.cert_id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div>
                  <h5 className="font-semibold text-gray-900">
                    {certification.name}
                  </h5>
                  <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-600">
                    {certification.issuer && (
                      <span className="rounded bg-gray-100 px-2 py-1">
                        Issuer: {certification.issuer}
                      </span>
                    )}
                    {certification.issued_date && (
                      <span className="rounded bg-gray-100 px-2 py-1">
                        Issued: {certification.issued_date}
                      </span>
                    )}
                    {certification.expiry_date && (
                      <span className="rounded bg-gray-100 px-2 py-1">
                        Expires: {certification.expiry_date}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleDeleteCertification(certification.cert_id)
                  }
                  disabled={loading || certificationLoading}
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

export default CertificationsSection;
