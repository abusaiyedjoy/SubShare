"use client";

import { Layout } from "@/components/layout/Layout";
import { ShareSubscriptionForm } from "@/components/forms/ShareSubscriptionForm";
import { useRouter } from "next/navigation";
import { Share2, TrendingUp, Shield, DollarSign } from "lucide-react";

export default function ShareSubscriptionPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/my-shares");
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "Earn Money",
      description: "Get paid when others use your subscription",
    },
    {
      icon: TrendingUp,
      title: "Flexible Pricing",
      description: "Set your own hourly rates",
    },
    {
      icon: Shield,
      title: "Secure & Safe",
      description: "Your credentials are encrypted and protected",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Select Platform",
      description: "Choose the subscription service you want to share",
    },
    {
      number: "2",
      title: "Enter Credentials",
      description: "Provide your account username and password",
    },
    {
      number: "3",
      title: "Set Price",
      description: "Define your hourly rate for sharing",
    },
    {
      number: "4",
      title: "Wait for Approval",
      description: "Admin will verify your subscription",
    },
  ];

  return (
    <Layout showSidebar={true}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Share Subscription</h1>
          <p className="text-gray-400">
            Start earning by sharing your subscription with others
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white/5 p-6 lg:p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                  <Share2 className="h-6 w-6 text-[#0A1628]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Share Your Subscription</h2>
                  <p className="text-sm text-gray-400">Fill in the details below</p>
                </div>
              </div>

              <ShareSubscriptionForm onSuccess={handleSuccess} />
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Benefits */}
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Why Share?</h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#00D9B4]/10 border border-[#00D9B4]/30">
                      <benefit.icon className="h-5 w-5 text-[#00D9B4]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">{benefit.title}</h4>
                      <p className="text-sm text-gray-400">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How it Works */}
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">How It Works</h3>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-primary font-bold text-[#0A1628]">
                      {step.number}
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-400">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl bg-yellow-500/10 p-6 border border-yellow-500/30">
              <h3 className="text-lg font-bold text-yellow-400 mb-3">💡 Tips</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Set competitive prices to attract more users</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Keep your credentials up-to-date</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Respond quickly to any issues reported</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Check subscription validity before sharing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}