import React, { useState, useEffect } from "react";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    location_address: "",
    city: "",
    state: "",
    zip_code: "",
    profile_image_url: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = "mock-user-id";
      const response = await fetch("/api/profile", {
        headers: { "x-user-id": userId }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) setProfile(data.user);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };



  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const userId = "mock-user-id";
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "x-user-id": userId, "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      if (response.ok) {
        setIsEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const userId = "mock-user-id";
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "x-user-id": userId, "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        })
      });
      if (response.ok) {
        setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
        alert("Password changed successfully!");
      } else {
        alert("Failed to change password. Please check your current password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password");
    } finally {
      setLoading(false);
    }
  };



  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-sm text-gray-500">Loading profile...</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
              Profile & Settings
            </h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-10 gap-6">
            <div className="lg:col-span-4 mb-8 lg:mb-0">
              <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 sm:h-32 sm:w-32"
                    style={{ backgroundImage: `url("${profile.profile_image_url}")` }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!isEditing) {
                        alert("Please click 'Edit Profile' first.");
                        return;
                      }
                      const url = prompt("Enter new profile image URL:", profile.profile_image_url);
                      if (url) {
                        setProfile({ ...profile, profile_image_url: url });
                      }
                    }}
                    className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-full text-white hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg sm:text-xl">photo_camera</span>
                  </button>
                </div>
                <h2 className="text-lg sm:text-xl font-bold leading-tight text-gray-900 dark:text-white">
                  {profile.full_name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Client since Jan 2023</p>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6">
                  <nav className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setActiveTab("profile")}
                      className={`shrink-0 border-b-2 px-1 py-4 text-xs sm:text-sm font-medium transition-colors ${activeTab === "profile"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:border-primary/50 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                    >
                      Profile Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("security")}
                      className={`shrink-0 border-b-2 px-1 py-4 text-xs sm:text-sm font-medium transition-colors ${activeTab === "security"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:border-primary/50 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                    >
                      Security
                    </button>

                  </nav>
                </div>
                <div className="p-4 sm:p-6">
                  {activeTab === "profile" && (
                    <ProfileDetailsSection
                      profile={profile}
                      setProfile={setProfile}
                      isEditing={isEditing}
                      setIsEditing={setIsEditing}
                      onSave={handleUpdateProfile}
                      loading={loading}
                    />
                  )}
                  {activeTab === "security" && (
                    <SecuritySection
                      passwordForm={passwordForm}
                      setPasswordForm={setPasswordForm}
                      onChangePassword={handleChangePassword}
                      loading={loading}
                    />
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const ProfileDetailsSection = ({ profile, setProfile, isEditing, setIsEditing, onSave, loading }) => {
  return (
    <div>
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-3 mb-4">
        <span className="material-symbols-outlined text-primary">person</span>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Details</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <Field
          label="Full Name"
          value={profile.full_name}
          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          editable={isEditing}
        />
        <Field
          label="Email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          editable={isEditing}
        />
        <Field
          label="Phone"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          editable={isEditing}
        />
        <Field
          label="Company"
          value={profile.company}
          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
          editable={isEditing}
        />
        <Field
          label="Address"
          value={profile.location_address}
          onChange={(e) => setProfile({ ...profile, location_address: e.target.value })}
          editable={isEditing}
        />
        <Field
          label="City"
          value={profile.city}
          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
          editable={isEditing}
        />
        <Field
          label="State"
          value={profile.state}
          onChange={(e) => setProfile({ ...profile, state: e.target.value })}
          editable={isEditing}
        />
        <Field
          label="Zip Code"
          value={profile.zip_code}
          onChange={(e) => setProfile({ ...profile, zip_code: e.target.value })}
          editable={isEditing}
        />
      </div>
      <div className="flex justify-end mt-6">
        {isEditing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

const SecuritySection = ({ passwordForm, setPasswordForm, onChangePassword, loading }) => {
  return (
    <div>
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-3 mb-4">
        <span className="material-symbols-outlined text-primary">lock</span>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security</h3>
      </div>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Current Password
          </label>
          <input
            type="password"
            value={passwordForm.current_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
            className="w-full px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-primary focus:border-primary"
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            New Password
          </label>
          <input
            type="password"
            value={passwordForm.new_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
            className="w-full px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-primary focus:border-primary"
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            value={passwordForm.confirm_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
            className="w-full px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-primary focus:border-primary"
            placeholder="Confirm new password"
          />
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onChangePassword}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationsSection = ({ notifications, setNotifications, onSave }) => {
  const handleToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-3 mb-4">
        <span className="material-symbols-outlined text-primary">notifications</span>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h3>
      </div>
      <div className="space-y-4">
        <NotificationToggle
          label="Email Notifications"
          description="Receive notifications via email"
          checked={notifications.email_notifications}
          onChange={() => handleToggle("email_notifications")}
        />
        <NotificationToggle
          label="SMS Notifications"
          description="Receive notifications via SMS"
          checked={notifications.sms_notifications}
          onChange={() => handleToggle("sms_notifications")}
        />
        <NotificationToggle
          label="Push Notifications"
          description="Receive push notifications"
          checked={notifications.push_notifications}
          onChange={() => handleToggle("push_notifications")}
        />
        <NotificationToggle
          label="Booking Updates"
          description="Get notified about booking status changes"
          checked={notifications.booking_updates}
          onChange={() => handleToggle("booking_updates")}
        />
        <NotificationToggle
          label="Payment Reminders"
          description="Get reminders for upcoming payments"
          checked={notifications.payment_reminders}
          onChange={() => handleToggle("payment_reminders")}
        />
        <NotificationToggle
          label="Review Reminders"
          description="Get reminders to leave reviews"
          checked={notifications.review_reminders}
          onChange={() => handleToggle("review_reminders")}
        />
      </div>
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

const NotificationToggle = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex-1">
        <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
      </label>
    </div>
  );
};

const Field = ({ label, value, onChange, editable }) => (
  <div className="space-y-1">
    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
    {editable ? (
      <input
        type="text"
        value={value || ""}
        onChange={onChange}
        className="w-full px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-primary focus:border-primary"
      />
    ) : (
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/60 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
        {value || "N/A"}
      </p>
    )}
  </div>
);

export default Profile;
