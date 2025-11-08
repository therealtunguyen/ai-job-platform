import { useState } from "react";
import { API_PATHS } from "@/utils/apiPath";
import axiosInstance from "@/utils/axiosInstance";
import {
  Globe,
  Plus,
  Trash2,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Facebook,
} from "lucide-react";

interface SocialNetwork {
  social_network_id: number;
  username: string;
  profile_url: string;
  social_network: {
    social_network_id: number;
    name: string;
    icon: string;
  };
}

interface AvailableSocialNetwork {
  social_network_id: number;
  name: string;
  icon: string;
}

interface SocialNetworkSectionProps {
  loading: boolean;
  fetchSocialNetworks: () => void;
  socialNetworks: SocialNetwork[];
  availableSocialNetworks: AvailableSocialNetwork[];
}

const SocialNetworkSection: React.FC<SocialNetworkSectionProps> = ({
  loading,
  fetchSocialNetworks,
  socialNetworks,
  availableSocialNetworks,
}) => {
  const [showAddSocialNetwork, setShowAddSocialNetwork] = useState(false);
  const [newSocialNetwork, setNewSocialNetwork] = useState({
    social_network_id: "",
    username: "",
    profile_url: "",
  });

  const handleAddSocialNetwork = async () => {
    try {
      if (
        !newSocialNetwork.social_network_id ||
        !newSocialNetwork.profile_url
      ) {
        alert("Please fill in both platform and URL");
        return;
      }

      await axiosInstance.post(
        API_PATHS.JOB_SEEKERS.SOCIAL_NETWORKS.ADD,
        newSocialNetwork,
      );
      await fetchSocialNetworks();
      setNewSocialNetwork({
        social_network_id: "",
        username: "",
        profile_url: "",
      });
      setShowAddSocialNetwork(false);
      alert("Social network added successfully!");
    } catch (error) {
      console.error("Error adding social network:", error);
      alert("Error adding social network. Please try again.");
    }
  };

  const handleDeleteSocialNetwork = async (socialNetworkId: number) => {
    try {
      if (!confirm("Are you sure you want to delete this social network?")) {
        return;
      }

      await axiosInstance.delete(
        API_PATHS.JOB_SEEKERS.SOCIAL_NETWORKS.DELETE.replace(
          ":socialNetworkId",
          socialNetworkId.toString(),
        ),
      );
      await fetchSocialNetworks();
      alert("Social network deleted successfully!");
    } catch (error) {
      console.error("Error deleting social network:", error);
      alert("Error deleting social network. Please try again.");
    }
  };

  const getSocialNetworkIcon = (platformName: string) => {
    switch (platformName.toLowerCase()) {
      case "linkedin":
        return <Linkedin className="h-5 w-5" />;
      case "twitter":
        return <Twitter className="h-5 w-5" />;
      case "github":
        return <Github className="h-5 w-5" />;
      case "instagram":
        return <Instagram className="h-5 w-5" />;
      case "facebook":
        return <Facebook className="h-5 w-5" />;
      case "youtube":
        return <Globe className="h-5 w-5" />;
      case "dribbble":
        return <Globe className="h-5 w-5" />;
      case "behance":
        return <Globe className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-xl">
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Social Networks
              </h3>
              <p className="text-gray-600">Manage your social media profiles</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddSocialNetwork(!showAddSocialNetwork)}
            className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Social Network</span>
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Add Social Network Form */}
        {showAddSocialNetwork && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-900">
              Add New Social Network
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Platform
                </label>
                <select
                  value={newSocialNetwork.social_network_id}
                  onChange={(e) =>
                    setNewSocialNetwork((prev) => ({
                      ...prev,
                      social_network_id: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                >
                  <option value="">Select Platform</option>
                  {availableSocialNetworks.map((network) => (
                    <option
                      key={network.social_network_id}
                      value={network.social_network_id}
                    >
                      {network.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={newSocialNetwork.username}
                  onChange={(e) =>
                    setNewSocialNetwork((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  placeholder="Your username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Profile URL
              </label>
              <input
                type="url"
                value={newSocialNetwork.profile_url}
                onChange={(e) =>
                  setNewSocialNetwork((prev) => ({
                    ...prev,
                    profile_url: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                placeholder="https://..."
              />
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleAddSocialNetwork}
                disabled={loading}
                className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>{loading ? "Adding..." : "Add"}</span>
              </button>
              <button
                onClick={() => {
                  setShowAddSocialNetwork(false);
                  setNewSocialNetwork({
                    social_network_id: "",
                    username: "",
                    profile_url: "",
                  });
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Social Networks List */}
        <div className="space-y-4">
          {socialNetworks.length === 0 ? (
            <div className="py-8 text-center">
              <Globe className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h4 className="mb-2 text-lg font-medium text-gray-900">
                No Social Networks Added
              </h4>
              <p className="text-gray-600">
                Add your social media profiles to showcase your online presence
              </p>
            </div>
          ) : (
            socialNetworks.map((social) => (
              <div
                key={social.social_network_id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    {getSocialNetworkIcon(social.social_network.name)}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">
                      {social.social_network.name}
                    </h5>
                    {social.username && (
                      <p className="text-sm text-gray-600">
                        @{social.username}
                      </p>
                    )}
                    {social.profile_url && (
                      <a
                        href={social.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {social.profile_url}
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleDeleteSocialNetwork(social.social_network_id)
                  }
                  disabled={loading}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200 disabled:opacity-50"
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

export default SocialNetworkSection;
