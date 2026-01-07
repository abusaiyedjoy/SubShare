"use client";

import { Layout } from "@/components/layout/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/useToast";
import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw,
  Percent,
  DollarSign,
  Clock,
  Shield
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpenner";

export default function AdminSettingsPage() {
  const { 
    settings, 
    isLoadingSettings, 
    updateSettings,
    updateSettingsMutation,
    refetchSettings
  } = useAdmin();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialData: Record<string, string> = {};
    settings.forEach(setting => {
      initialData[setting.key] = setting.value;
    });
    setFormData(initialData);
  }, [settings]);

  const handleSave = async () => {
    try {
      const settingsArray = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
      }));

      await updateSettings({ settings: settingsArray });
      toast.success("Settings updated successfully!");
      refetchSettings();
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    }
  };

  const handleReset = () => {
    const initialData: Record<string, string> = {};
    settings.forEach(setting => {
      initialData[setting.key] = setting.value;
    });
    setFormData(initialData);
    toast.info("Settings reset to last saved values");
  };

  const settingsGroups = [
    {
      title: "Commission Settings",
      icon: Percent,
      settings: [
        {
          key: "commission_percentage",
          label: "Commission Percentage",
          type: "number",
          placeholder: "10",
          description: "Percentage of commission charged on each transaction",
        },
      ],
    },
    {
      title: "Payment Settings",
      icon: DollarSign,
      settings: [
        {
          key: "min_topup_amount",
          label: "Minimum Topup Amount",
          type: "number",
          placeholder: "10",
          description: "Minimum amount required for wallet topup",
        },
        {
          key: "max_topup_amount",
          label: "Maximum Topup Amount",
          type: "number",
          placeholder: "10000",
          description: "Maximum amount allowed for single topup",
        },
      ],
    },
    {
      title: "Subscription Settings",
      icon: Clock,
      settings: [
        {
          key: "min_subscription_hours",
          label: "Minimum Subscription Hours",
          type: "number",
          placeholder: "24",
          description: "Minimum hours for subscription access",
        },
        {
          key: "max_sharing_limit",
          label: "Maximum Sharing Limit",
          type: "number",
          placeholder: "5",
          description: "Maximum number of users per shared subscription",
        },
      ],
    },
    {
      title: "Platform Settings",
      icon: Shield,
      settings: [
        {
          key: "platform_name",
          label: "Platform Name",
          type: "text",
          placeholder: "ShareIt",
          description: "Name of the platform",
        },
        {
          key: "support_email",
          label: "Support Email",
          type: "email",
          placeholder: "support@shareit.com",
          description: "Email for customer support",
        },
      ],
    },
  ];

  if (isLoadingSettings) {
    return (
      <Layout showSidebar={true}>
        <LoadingSpinner size="lg" text="Loading settings..." />
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
            <p className="text-gray-400">Configure platform-wide settings and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-6 py-3 font-medium text-white transition-all hover:bg-white/10 border border-white/10"
            >
              <RefreshCw className="h-5 w-5" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="h-5 w-5" />
              {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          {settingsGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.title}
                className="rounded-2xl bg-white/5 p-6 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00D9B4]/10 border border-[#00D9B4]/30">
                    <Icon className="h-5 w-5 text-[#00D9B4]" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{group.title}</h2>
                </div>

                <div className="space-y-6">
                  {group.settings.map((setting) => {
                    const currentSetting = settings.find(s => s.key === setting.key);
                    
                    return (
                      <div key={setting.key}>
                        <label className="mb-2 block text-sm font-medium text-gray-200">
                          {setting.label}
                        </label>
                        <input
                          type={setting.type}
                          value={formData[setting.key] || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, [setting.key]: e.target.value })
                          }
                          placeholder={setting.placeholder}
                          className="h-12 w-full rounded-lg bg-white/5 px-4 text-white placeholder-gray-400 border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
                        />
                        <p className="mt-2 text-xs text-gray-400">
                          {setting.description}
                        </p>
                        {currentSetting?.description && (
                          <p className="mt-1 text-xs text-gray-500 italic">
                            System: {currentSetting.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Settings */}
        <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/30">
              <SettingsIcon className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Other Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4 border border-white/10">
              <div>
                <p className="font-medium text-white mb-1">Maintenance Mode</p>
                <p className="text-sm text-gray-400">
                  Temporarily disable platform for maintenance
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00D9B4] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00D9B4]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4 border border-white/10">
              <div>
                <p className="font-medium text-white mb-1">Allow New Registrations</p>
                <p className="text-sm text-gray-400">
                  Enable or disable new user registrations
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00D9B4] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00D9B4]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4 border border-white/10">
              <div>
                <p className="font-medium text-white mb-1">Email Notifications</p>
                <p className="text-sm text-gray-400">
                  Send email notifications to users
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00D9B4] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00D9B4]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl bg-red-500/10 p-6 border border-red-500/30">
          <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white mb-1">Clear All Cache</p>
                <p className="text-sm text-gray-400">
                  Clear all cached data across the platform
                </p>
              </div>
              <button className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/30 border border-red-500/40">
                Clear Cache
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white mb-1">Reset to Defaults</p>
                <p className="text-sm text-gray-400">
                  Reset all settings to default values
                </p>
              </div>
              <button className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/30 border border-red-500/40">
                Reset All
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}