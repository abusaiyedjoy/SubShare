"use client";

import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { User, Mail, Calendar, Shield, Loader2, Camera } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

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
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-colors">
                  <Camera className="h-4 w-4 text-white" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
              <p className="text-sm text-gray-400 mb-4">{user?.email}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3 border border-white/10">
                  <span className="text-sm text-gray-400">Role</span>
                  <span className="text-sm font-medium text-[#00D9B4]">
                    {user?.role === "admin" ? "Administrator" : "User"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3 border border-white/10">
                  <span className="text-sm text-gray-400">Balance</span>
                  <span className="text-sm font-medium text-[#00D9B4]">
                    ${user?.balance.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3 border border-white/10">
                  <span className="text-sm text-gray-400">Member Since</span>
                  <span className="text-sm font-medium text-white">
                    {user?.created_at ? formatDate(user.created_at) : "N/A"}
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
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user?.name || "",
                          email: user?.email || "",
                        });
                      }}
                      className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10 border border-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
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
                    className="h-12 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10 disabled:opacity-50 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                    <Mail className="h-4 w-4 text-gray-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10 disabled:opacity-50 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
                  />
                </div>

                {/* Account Created */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Account Created
                  </label>
                  <input
                    type="text"
                    value={user?.created_at ? formatDate(user.created_at) : "N/A"}
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
                    value={user?.role === "admin" ? "Administrator" : "User"}
                    disabled
                    className="h-12 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10 opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Security</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-4 border border-white/10">
                  <div>
                    <p className="font-medium text-white mb-1">Password</p>
                    <p className="text-sm text-gray-400">Last changed 30 days ago</p>
                  </div>
                  <button className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10 border border-white/10">
                    Change Password
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-white/5 p-4 border border-white/10">
                  <div>
                    <p className="font-medium text-white mb-1">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-400">Add an extra layer of security</p>
                  </div>
                  <button className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10 border border-white/10">
                    Enable
                  </button>
                </div>
              </div>
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