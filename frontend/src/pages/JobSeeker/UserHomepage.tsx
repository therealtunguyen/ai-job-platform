import { useState, useEffect } from "react";
import {
  Mail,
  MapPin,
  DollarSign,
  Download,
  Play,
  Calendar,
  Clock,
  Coins,
  GraduationCap,
  Languages,
  Users,
} from "lucide-react";

interface UserHomepageProps {
  username: string;
}

interface HomepageData {
  name: string;
  email: string;
  jobTitle: string;
  phone: string;
  address: string;
  expectedSalary: string;
  description: string;
  profileImage: string;
  experience: string;
  age: string;
  currentSalary: string;
  gender: string;
  languages: string[];
  education: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

const UserHomepage = ({ username }: UserHomepageProps) => {
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoading(true);
        // TODO: Implement homepage data fetching when backend endpoint is available
        // For now, use mock data
        const mockData: HomepageData = {
          name: "Nostidus",
          email: "xaongoctan@gmail.com",
          jobTitle: "Full stack & AI Engineer",
          phone: "+1 234 567 8900",
          address: "London, UK",
          expectedSalary: "99",
          description:
            "Hello my name is Nostidus and I'm a Full stack & AI Engineer from London. I have a passion for creating innovative solutions and delivering high-quality work.",
          profileImage: "/me.jpg",
          experience: "0-2 Years",
          age: "28-33 Years",
          currentSalary: "11K - 15K",
          gender: "Male",
          languages: ["English", "German", "Spanish"],
          education: "Master Degree",
          socialMedia: {
            facebook: "https://facebook.com/nostidus",
            twitter: "https://twitter.com/nostidus",
            instagram: "https://instagram.com/nostidus",
            linkedin: "https://linkedin.com/in/nostidus",
          },
        };
        setHomepageData(mockData);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, [username]);

  const handleDownloadCV = async () => {
    try {
      // TODO: Implement CV download when backend endpoint is available
      console.log("CV download feature not yet implemented in backend");
      alert(
        "CV download feature is not yet available. Please contact support.",
      );
    } catch (error) {
      console.error("Error downloading CV:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading homepage...</p>
        </div>
      </div>
    );
  }

  if (!homepageData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Homepage Not Found
          </h1>
          <p className="text-gray-600">
            This user's homepage doesn't exist yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl p-6">
        {/* Header Section */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <img
                src={homepageData.profileImage}
                className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
                alt="Profile"
              />
              <div>
                <h1 className="text-3xl font-bold">{homepageData.name}</h1>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-blue-100">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>{homepageData.email}</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>
                      {homepageData.address || "Location not specified"}
                    </span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>${homepageData.expectedSalary} / hour</span>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
                    App
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
                    Design
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
                    Digital
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDownloadCV}
                className="flex items-center space-x-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                <Download className="h-4 w-4" />
                <span>Download CV</span>
              </button>
              <button className="rounded-lg bg-white px-4 py-2 text-blue-600 transition-colors hover:bg-gray-50">
                <span>Bookmark</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-8 shadow-xl">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Candidate's About
              </h2>

              {/* Video Section */}
              <div className="mb-8">
                <div className="relative flex h-64 items-center justify-center rounded-xl bg-gray-200">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                      <Play className="ml-1 h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-gray-600">Introduction Video</p>
                  </div>
                </div>
              </div>

              {/* About Text */}
              <div className="prose max-w-none">
                <p className="mb-4 leading-relaxed text-gray-700">
                  Hello my name is {homepageData.name} and I'm a{" "}
                  {homepageData.jobTitle} from{" "}
                  {homepageData.address || "Portland"}. I have a passion for
                  creating innovative solutions and delivering high-quality
                  work.
                </p>
                <p className="leading-relaxed text-gray-700">
                  {homepageData.description ||
                    "I'm dedicated to continuous learning and staying up-to-date with the latest technologies and industry trends. I enjoy collaborating with teams and contributing to meaningful projects that make a positive impact."}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-xl">
              <div className="space-y-6">
                {/* Experience */}
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-semibold text-gray-900">
                      {homepageData.experience || "0-2 Years"}
                    </p>
                  </div>
                </div>

                {/* Age */}
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-green-100 p-2">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-semibold text-gray-900">
                      {homepageData.age || "28-33 Years"}
                    </p>
                  </div>
                </div>

                {/* Current Salary */}
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-yellow-100 p-2">
                    <Coins className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Salary</p>
                    <p className="font-semibold text-gray-900">
                      ${homepageData.currentSalary || "11K - 15K"}
                    </p>
                  </div>
                </div>

                {/* Expected Salary */}
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expected Salary</p>
                    <p className="font-semibold text-gray-900">
                      ${homepageData.expectedSalary || "26K - 30K"}
                    </p>
                  </div>
                </div>

                {/* Gender */}
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-pink-100 p-2">
                    <Users className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-semibold text-gray-900">
                      {homepageData.gender || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Languages */}
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-indigo-100 p-2">
                    <Languages className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Language</p>
                    <p className="font-semibold text-gray-900">
                      {homepageData.languages?.join(", ") ||
                        "English, German, Spanish"}
                    </p>
                  </div>
                </div>

                {/* Education */}
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-red-100 p-2">
                    <GraduationCap className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Education Level</p>
                    <p className="font-semibold text-gray-900">
                      {homepageData.education || "Master Degree"}
                    </p>
                  </div>
                </div>

                {/* Social Media */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Social Media
                  </h3>
                  <div className="flex space-x-3">
                    {homepageData.socialMedia?.facebook && (
                      <a
                        href={homepageData.socialMedia.facebook}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                    )}
                    {homepageData.socialMedia?.twitter && (
                      <a
                        href={homepageData.socialMedia.twitter}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </a>
                    )}
                    {homepageData.socialMedia?.instagram && (
                      <a
                        href={homepageData.socialMedia.instagram}
                        className="text-pink-600 hover:text-pink-800"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281h-1.297v1.297h1.297V7.707zm-3.323 1.297c.718 0 1.297.579 1.297 1.297s-.579 1.297-1.297 1.297-1.297-.579-1.297-1.297.579-1.297 1.297-1.297z" />
                        </svg>
                      </a>
                    )}
                    {homepageData.socialMedia?.linkedin && (
                      <a
                        href={homepageData.socialMedia.linkedin}
                        className="text-blue-700 hover:text-blue-900"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHomepage;
