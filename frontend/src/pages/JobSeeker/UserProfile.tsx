import JobSeekerLayout from "@/components/JobSeeker/JobSeekerLayout";
import { Mail, Upload, Download, User, MapPin, Phone, DollarSign, FileText, Camera, Save, Edit3 } from "lucide-react";
import { useState, useEffect } from "react";
import { API_PATHS } from "@/utils/apiPath";
import axiosInstance from "@/utils/axiosInstance";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    preferred_location: "",
    expected_salary: "",
    summary: "",
    profile_picture: "/me.jpg"
  });

  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(API_PATHS.USER.GETUSER);
        if (response.data) {
          const { user, profile } = response.data;
          setProfileData(prev => ({
            ...prev,
            full_name: profile?.full_name || "",
            email: user?.email || "",
            phone: profile?.phone || "",
            address: profile?.address || "",
            preferred_location: profile?.preferred_location || "",
            expected_salary: profile?.expected_salary?.toString() || "",
            summary: profile?.summary || "",
            profile_picture: profile?.profile_picture || "/me.jpg"
          }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Update profile data (excluding email)
      const updateData = {
        full_name: profileData.full_name,
        phone: profileData.phone,
        address: profileData.address,
        preferred_location: profileData.preferred_location,
        expected_salary: profileData.expected_salary ? parseInt(profileData.expected_salary) : null,
        summary: profileData.summary,
      };
      
      await axiosInstance.put(API_PATHS.USER.PUTUSER, updateData);
      
      // Update email separately if it has changed
      const currentEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : '';
      if (profileData.email !== currentEmail) {
        await axiosInstance.put(API_PATHS.AUTH.UPDATE_EMAIL, {
          email: profileData.email
        });
      }
      
      console.log("Profile saved successfully");
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = async () => {
    try {
      // TODO: Implement CV download when backend endpoint is available
      console.log("CV download feature not yet implemented in backend");
      alert("CV download feature is not yet available. Please contact support.");
    } catch (error) {
      console.error("Error downloading CV:", error);
    }
  };

  const handleCVUpload = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('cv', file);
      
      await axiosInstance.post(API_PATHS.CV.UPLOAD, formData);
      
      console.log("CV uploaded successfully");
      alert("CV uploaded successfully!");
    } catch (error) {
      console.error("Error uploading CV:", error);
      alert("Error uploading CV. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (backend only accepts PDF)
      if (file.type !== 'application/pdf') {
        alert("Please select a PDF file.");
        return;
      }
      
      // Validate file size (10MB limit to match backend)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB.");
        return;
      }
      
      handleCVUpload(file);
    }
  };

  const handleProfileImageUpload = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axiosInstance.post(API_PATHS.USER.PROFILEIMAGE, formData);
      
      if (response.data && response.data.publicUrl) {
        setProfileData(prev => ({
          ...prev,
          profile_picture: response.data.publicUrl
        }));
        alert("Profile image uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      alert("Error uploading profile image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file.");
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
        return;
      }
      
      handleProfileImageUpload(file);
    }
  };

  const handleCreateHomepage = async () => {
    try {
      setLoading(true);
      // TODO: Implement homepage creation when backend endpoint is available
      console.log("Homepage creation feature not yet implemented in backend");
      alert("Homepage creation feature is not yet available. Please contact support.");
      // For now, just navigate to a placeholder homepage
      // window.location.href = `/homepage/${profileData.name.toLowerCase().replace(/\s+/g, '-')}`;
    } catch (error) {
      console.error("Error creating homepage:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <JobSeekerLayout activeMenu="/jobseeker-profile">
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-2 text-gray-600">Manage your personal information and professional details</p>
          </div>

          {/* Profile Overview Card */}
          <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img 
                      src={profileData.profile_picture} 
                      className="h-24 w-24 rounded-full border-4 border-white shadow-lg" 
                      alt="Profile"
                    />
                    <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-white p-2 shadow-md hover:bg-gray-50">
                      <Camera className="h-4 w-4 text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="text-white">
                    <h2 className="text-2xl font-bold">{profileData.full_name || "User"}</h2>
                    <div className="mt-1 flex items-center text-blue-100">
                      <Mail className="mr-2 h-4 w-4" />
                      <span>{profileData.email}</span>
                    </div>
                    <div className="mt-2 flex items-center text-blue-100">
                      <User className="mr-2 h-4 w-4" />
                      <span>{profileData.preferred_location || "Location not set"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleDownloadCV}
                    className="flex items-center space-x-2 rounded-lg bg-white/20 px-4 py-2 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download CV</span>
                  </button>
                  <button 
                    onClick={handleCreateHomepage}
                    disabled={loading}
                    className="flex items-center space-x-2 rounded-lg bg-white px-4 py-2 text-blue-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <User className="h-4 w-4" />
                    <span>{loading ? 'Creating...' : `${profileData.full_name || 'User'}'s Homepage`}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information Form */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                    <p className="text-gray-600">Update your profile details</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                  </button>
                  {isEditing && (
                    <button 
                      onClick={handleSaveProfile}
                      className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
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
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <User className="h-4 w-4" />
                      <span>Full Name</span>
                    </label>
                    <input
                      name="full_name"
                      type="text"
                      value={profileData.full_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Preferred Location */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <MapPin className="h-4 w-4" />
                      <span>Preferred Location</span>
                    </label>
                    <input
                      name="preferred_location"
                      type="text"
                      value={profileData.preferred_location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Enter your preferred location"
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Enter your address"
                    />
                  </div>

                  {/* Expected Salary */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <DollarSign className="h-4 w-4" />
                      <span>Expected Salary (VND)</span>
                    </label>
                    <input
                      name="expected_salary"
                      type="number"
                      value={profileData.expected_salary}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Enter expected salary in VND"
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <FileText className="h-4 w-4" />
                    <span>Professional Summary</span>
                  </label>
                  <textarea
                    name="summary"
                    value={profileData.summary}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Tell us about yourself, your skills, and career goals..."
                  />
                </div>
              </form>
            </div>
          </div>

          {/* CV Upload Section */}
          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">CV Management</h3>
                  <p className="text-gray-600">Upload and manage your resume</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center hover:border-blue-400 transition-colors">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="mb-2 text-lg font-semibold text-gray-900">Upload Your CV</h4>
                <p className="mb-4 text-gray-600">
                  Drag and drop your CV here, or click to browse
                </p>
                <div className="mb-4 text-sm text-gray-500">
                  <p>Supported formats: PDF only</p>
                  <p>Maximum file size: 10MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cv-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="cv-upload"
                  className={`cursor-pointer rounded-lg px-6 py-2 text-white transition-colors ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Uploading...' : 'Choose File'}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </JobSeekerLayout>
  );
};

export default UserProfile;
