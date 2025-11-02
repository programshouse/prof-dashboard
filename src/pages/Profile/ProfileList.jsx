import React, { useState, useEffect } from "react";
import PageLayout from "../../components/ui/PageLayout";
import PageHeader from "../../components/ui/PageHeader";
import PageCard from "../../components/ui/PageCard";
import { useWhoAmIStore } from "../../stores/useWhoAmIStore";

export default function ProfileList({ onEdit }) {
  const [profileData, setProfileData] = useState({
    title: "",
    description: "",
    features: [],
    video: null,
    image: null
  });
  const [loading, setLoading] = useState(true);

  const fetchAll = useWhoAmIStore((s) => s.fetchAll);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await fetchAll();
        const first = Array.isArray(list) && list.length ? list[0] : {};
        setProfileData({
          title: first?.title || "",
          description: first?.description || "",
          features: Array.isArray(first?.features) ? first.features : [],
          video: first?.video || null,
          image: first?.image || null,
        });
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchAll]);

  if (loading) {
    return (
      <PageLayout title="Profile View | ProfMSE">
        <PageHeader title="Profile View" description="View your professional profile" />
        <div className="col-span-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading profile...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Profile View | ProfMSE">
      <PageHeader title="Profile View" description="View your professional profile" />
      <div className="col-span-12">
        <PageCard title="Professional Profile">
          <div className="flex justify-end mb-4">
            <button
              onClick={onEdit}
              className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          </div>
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {profileData.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
                {profileData.description}
              </p>
            </div>

            {/* Profile Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profileData.video && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Profile Video
                  </h3>
                  <video
                    controls
                    className="w-full rounded-lg shadow-sm"
                    src={typeof profileData.video === 'string' ? profileData.video : URL.createObjectURL(profileData.video)}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {profileData.image && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Profile Image
                  </h3>
                  <img
                    src={typeof profileData.image === 'string' ? profileData.image : URL.createObjectURL(profileData.image)}
                    alt="Profile"
                    className="w-full h-64 object-cover rounded-lg shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Professional Features */}
            {profileData.features && profileData.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Professional Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PageCard>
      </div>
    </PageLayout>
  );
}
