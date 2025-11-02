import EmployerLayout from "@/components/Employer/EmployerLayout";
import {
  Mail,
  User,
  MapPin,
  Phone,
  FileText,
  Camera,
  Save,
  Edit3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { API_PATHS, BASE_URL } from "@/utils/apiPath";
import axiosInstance from "@/utils/axiosInstance";

interface CompanyProfileFields {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  industry: string;
  company_logo: string;
}

const EmployerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<CompanyProfileFields>({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    industry: "",
    company_logo: "/me.jpg",
  });

  // Load company profile data
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.USERS.GET_PROFILE);
        console.log("[GETUSER] raw response:", response.data);
        if (response.data) {
          const { user, profile } = response.data;
          const rawLogoPath = profile?.logo || "";
          const resolvedLogoUrl = /^https?:\/\//i.test(rawLogoPath)
            ? rawLogoPath
            : rawLogoPath
              ? `${BASE_URL}${rawLogoPath.startsWith("/") ? rawLogoPath : `/${rawLogoPath}`}`
              : "";
          console.log("[GETUSER] logo_file_path:", rawLogoPath);
          console.log("[GETUSER] resolved Logo URL:", resolvedLogoUrl);
          setProfileData((prev) => ({
            ...prev,
            company_name: profile?.company_name || "",
            email: user?.email || "",
            phone: profile?.phone || "",
            contact_person: profile?.contact_person || "",
            address: profile?.address || "",
            industry: profile?.industry || "",
            description: profile?.description || "",
            company_logo: profile?.logo || "/me.jpg",
          }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchCompanyProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Update company profile data
      const updateData = {
        company_name: profileData.company_name,
        contact_person: profileData.contact_person,
        phone: profileData.phone,
        address: profileData.address,
        description: profileData.description,
        industry: profileData.industry,
      };

      // Placeholder for actual API call to update employer profile
      await axiosInstance.put(API_PATHS.USERS.UPDATE_PROFILE, updateData);

      // Update email separately if it has changed
      const userItem = localStorage.getItem("user");
      const currentEmail = userItem ? JSON.parse(userItem).email : "";
      if (profileData.email !== currentEmail) {
        await axiosInstance.put(API_PATHS.AUTH.UPDATE_EMAIL, {
          email: profileData.email,
        });
      }

      console.log("Company profile saved successfully");
      alert("Company profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving company profile:", error);
      alert("Error updating company profile. Please try again.");
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axiosInstance.post(
        API_PATHS.USERS.UPLOAD_IMAGE,
        formData,
      );

      if (response.data && response.data.publicUrl) {
        setProfileData((prev) => ({
          ...prev,
          profile_picture: response.data.publicUrl,
        }));
        alert("Logo uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading company logo:", error);
      alert("Error uploading company logo. Please try again.");
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
        return;
      }

      handleLogoUpload(file);
    }
  };

  return (
    <EmployerLayout activeMenu="/employer-profile">
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Company Profile
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your company information and profile details
            </p>
          </div>

          {/* Company Overview Card */}
          <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      src={profileData.company_logo}
                      className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
                      alt="Company Logo"
                    />
                    <label className="absolute -right-1 -bottom-1 cursor-pointer rounded-full bg-white p-2 shadow-md hover:bg-gray-50">
                      <Camera className="h-4 w-4 text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="text-white">
                    <h2 className="text-2xl font-bold">
                      {profileData.company_name || "Company Name"}
                    </h2>
                    <div className="mt-1 flex items-center text-blue-100">
                      <Mail className="mr-2 h-4 w-4" />
                      <span>{profileData.email}</span>
                    </div>
                    <div className="mt-2 flex items-center text-blue-100">
                      <User className="mr-2 h-4 w-4" />
                      <span>
                        {profileData.contact_person || "Contact Person Not Set"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information Form */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Company Information
                    </h3>
                    <p className="text-gray-600">Update your company details</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                  </button>
                  {isEditing && (
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <User className="h-4 w-4" />
                      <span>Company Name</span>
                    </label>
                    <input
                      name="company_name"
                      type="text"
                      value={profileData.company_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Enter company name"
                    />
                  </div>

                  {/* Contact Person */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <User className="h-4 w-4" />
                      <span>Contact Person</span>
                    </label>
                    <input
                      name="contact_person"
                      type="text"
                      value={profileData.contact_person}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Enter contact person name"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Phone className="h-4 w-4" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Mail className="h-4 w-4" />
                      <span>Email Address</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Enter email address"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <MapPin className="h-4 w-4" />
                      <span>Address</span>
                    </label>
                    <input
                      name="address"
                      type="text"
                      value={profileData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Enter company address"
                    />
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <FileText className="h-4 w-4" />
                      <span>Industry</span>
                    </label>
                    <input
                      name="industry"
                      type="text"
                      value={profileData.industry}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Enter industry"
                    />
                  </div>
                </div>

                {/* Company Description */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <FileText className="h-4 w-4" />
                    <span>Company Description</span>
                  </label>
                  <textarea
                    name="description"
                    value={profileData.description}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Tell us about your company, its mission, and values..."
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </EmployerLayout>
  );
};

export default EmployerProfile;
