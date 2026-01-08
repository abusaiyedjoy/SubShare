"use client";

import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useState, useEffect } from "react";
import { User, Mail, Calendar, Shield, Loader2, Camera, Lock, Save, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, updateProfile, updatePassword, updateProfileMutation, updatePasswordMutation, refetchProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (formData.name.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    try {
      await updateProfile({ name: formData.name });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      refetchProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success("Password updated successfully!");
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || "",
    });
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  if (!user) {
    return (
      <Layout showSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#00D9B4]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10 text-center">
              <div className="relative inline-block mb-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-primary text-4xl font-bold text-[#0A1628]">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-colors">
                  <Camera className="h-4 w-4 text-white" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
              <p className="text-sm text-gray-400 mb-4">{user.email}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3 border border-white/10">
                  <span className="text-sm text-gray-400">Role</span>
                  <span className="text-sm font-medium text-[#00D9B4]">
                    {user.role === "admin" ? "Administrator" : "User"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3 border border-white/10">
                  <span className="text-sm text-gray-400">Balance</span>
                  <span className="text-sm font-medium text-[#00D9B4]">
                    ${user.balance?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3 border border-white/10">
                  <span className="text-sm text-gray-400">Member Since</span>
                  <span className="text-sm font-medium text-white">
                    {(user as any).created_at ? formatDate((user as any).created_at) : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10 border border-white/10"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10 border border-white/10 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-gray-50 transition-all hover:shadow-glow-primary hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                    <User className="h-4 w-4 text-gray-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10 disabled:opacity-50 focus:bg-white/10 focus:border-[#00D9B4] transition-all outline-none"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                    <Mail className="h-4 w-4 text-gray-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="h-12 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10 opacity-50 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                {/* Account Created */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Account Created
                  </label>
                  <input
                    type="text"
                   value={(user as any).created_at ? formatDate((user as any).created_at) : "N/A"}
                    disabled
                    className="h-12 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10 opacity-50"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                    <Shield className="h-4 w-4 text-gray-400" />
                    Account Role
                  </label>
                  <input
                    type="text"
                    value={user.role === "admin" ? "Administrator" : "User"}
                    disabled
                    className="h-12 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10 opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Security</h2>
              </div>

              {!isChangingPassword ? (
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-4 border border-white/10">
                  <div>
                    <p className="font-medium text-white mb-1">Password</p>
                    <p className="text-sm text-gray-400">Keep your account secure</p>
                  </div>
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10 border border-white/10"
                  >
                    <Lock className="h-4 w-4" />
                    Change Password
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="h-12 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all outline-none"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="h-12 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all outline-none"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="h-12 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all outline-none"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleCancelPasswordChange}
                      disabled={updatePasswordMutation.isPending}
                      className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10 border border-white/10 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordChange}
                      disabled={updatePasswordMutation.isPending}
                      className="flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-gray-50 transition-all hover:shadow-glow-primary hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {updatePasswordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      Update Password
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl bg-red-500/10 p-6 border border-red-500/30">
              <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white mb-1">Delete Account</p>
                    <p className="text-sm text-gray-400">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <button className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}