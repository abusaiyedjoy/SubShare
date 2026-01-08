"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useToast } from "@/hooks/useToast";
import { DollarSign, Eye, EyeOff, Loader2, Calendar } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscription";
import { usePlatforms } from "@/hooks/usePlatform";
import { SubscriptionPlatform } from "@/types";

interface ShareSubscriptionFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ShareSubscriptionForm({ onSuccess, onCancel }: ShareSubscriptionFormProps) {
    const { createSubscriptionMutation } = useSubscriptions();
    const { platforms, isLoadingPlatforms } = usePlatforms();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        defaultValues: {
            platform_id: "",
            credentials_username: "",
            credentials_password: "",
            price_per_hour: "",
            expires_at: "",
        },
        onSubmit: async ({ value }) => {
            try {
                await createSubscriptionMutation.mutateAsync({
                    platform_id: parseInt(value.platform_id),
                    credentials_username: value.credentials_username,
                    credentials_password: value.credentials_password,
                    price_per_hour: parseFloat(value.price_per_hour),
                    expires_at: value.expires_at || undefined,
                });

                toast.success("Subscription shared successfully! Waiting for admin verification.");
                onSuccess?.();
            } catch (error: any) {
                toast.error(error.message || "Failed to share subscription");
            }
        },
    });

    const calculateDailyPrice = (hourlyPrice: string) => {
        const price = parseFloat(hourlyPrice);
        return isNaN(price) ? "0.00" : (price * 24).toFixed(2);
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="space-y-6"
        >
            {/* Platform Selection */}
            <form.Field name="platform_id">
                {(field) => (
                    <div>
                        <label
                            htmlFor="platform_id"
                            className="mb-2 block text-sm font-medium text-gray-200"
                        >
                            Subscription Platform
                        </label>
                        <select
                            id="platform_id"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                            disabled={isLoadingPlatforms}
                            className="h-12 w-full rounded-lg bg-white/5 px-4 text-white transition-all border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] disabled:opacity-50"
                        >
                            <option value="" className="bg-[#0A1628]">Select a platform</option>
                            {platforms.map((platform : SubscriptionPlatform) => (
                                <option key={platform.id} value={platform.id} className="bg-[#0A1628]">
                                    {platform.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </form.Field>

            {/* Username */}
            <form.Field name="credentials_username">
                {(field) => (
                    <div>
                        <label
                            htmlFor="credentials_username"
                            className="mb-2 block text-sm font-medium text-gray-200"
                        >
                            Account Username/Email
                        </label>
                        <input
                            id="credentials_username"
                            type="text"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Enter account username or email"
                            required
                            className="h-12 w-full rounded-lg bg-white/5 px-4 text-white placeholder-gray-400 transition-all border border-white/10 focus:bg-white/10 focus:border-[#00D9B4]"
                        />
                    </div>
                )}
            </form.Field>

            {/* Password */}
            <form.Field name="credentials_password">
                {(field) => (
                    <div>
                        <label
                            htmlFor="credentials_password"
                            className="mb-2 block text-sm font-medium text-gray-200"
                        >
                            Account Password
                        </label>
                        <div className="relative">
                            <input
                                id="credentials_password"
                                type={showPassword ? "text" : "password"}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="Enter account password"
                                required
                                className="h-12 w-full rounded-lg bg-white/5 px-4 pr-12 text-white placeholder-gray-400 transition-all border border-white/10 focus:bg-white/10 focus:border-[#00D9B4]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            Your credentials will be encrypted and securely stored
                        </p>
                    </div>
                )}
            </form.Field>

            {/* Price per Hour */}
            <form.Field name="price_per_hour">
                {(field) => (
                    <div>
                        <label
                            htmlFor="price_per_hour"
                            className="mb-2 block text-sm font-medium text-gray-200"
                        >
                            Price per Hour (USD)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                id="price_per_hour"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="0.00"
                                required
                                className="h-12 w-full rounded-lg bg-white/5 pl-12 pr-4 text-white placeholder-gray-400 transition-all border border-white/10 focus:bg-white/10 focus:border-[#00D9B4]"
                            />
                        </div>
                        {field.state.value && (
                            <p className="mt-1 text-xs text-[#00D9B4]">
                                Daily price: ${calculateDailyPrice(field.state.value)}
                            </p>
                        )}
                    </div>
                )}
            </form.Field>

            {/* Expiration Date (Optional) */}
            <form.Field name="expires_at">
                {(field) => (
                    <div>
                        <label
                            htmlFor="expires_at"
                            className="mb-2 block text-sm font-medium text-gray-200"
                        >
                            Subscription Expires On (Optional)
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                id="expires_at"
                                type="date"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="h-12 w-full rounded-lg bg-white/5 pl-12 pr-4 text-white transition-all border border-white/10 focus:bg-white/10 focus:border-[#00D9B4]"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            Leave empty if your subscription doesn't expire
                        </p>
                    </div>
                )}
            </form.Field>

            {/* Important Notice */}
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-4">
                <h4 className="text-sm font-semibold text-yellow-400 mb-2">Important Notice</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                    <li>• Your subscription will be verified by admin before going live</li>
                    <li>• Provide accurate credentials to ensure quick verification</li>
                    <li>• You'll earn money when others access your subscription</li>
                    <li>• Platform commission will be deducted from each transaction</li>
                    <li>• You can update or remove your subscription anytime</li>
                </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 h-12 rounded-lg bg-white/5 font-medium text-white transition-all hover:bg-white/10 border border-white/10"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={createSubscriptionMutation.isPending}
                    className="flex-1 h-12 rounded-lg gradient-primary font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                >
                    {createSubscriptionMutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sharing...
                        </>
                    ) : (
                        "Share Subscription"
                    )}
                </button>
            </div>
        </form>
    );
}