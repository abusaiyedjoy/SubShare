"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/useToast";
import { DollarSign, Upload, Loader2, X } from "lucide-react";

interface TopupFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function TopupForm({ onSuccess, onCancel }: TopupFormProps) {
    const { requestTopupMutation } = useWallet();
    const { toast } = useToast();
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string>("");

    const form = useForm({
        defaultValues: {
            amount: "",
            transaction_id: "",
        },
        onSubmit: async ({ value }) => {
            try {
                // In a real app, you'd upload the screenshot to a storage service first
                // For now, we'll just use a placeholder URL
                const screenshot_url = screenshotFile ? "uploaded_screenshot_url" : undefined;

                await requestTopupMutation.mutateAsync({
                    amount: parseFloat(value.amount),
                    transaction_id: value.transaction_id,
                    screenshot_url,
                });

                toast.success("Topup request submitted successfully!");
                onSuccess?.();
            } catch (error: any) {
                toast.error(error.message || "Failed to submit topup request");
            }
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setScreenshotFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeScreenshot = () => {
        setScreenshotFile(null);
        setScreenshotPreview("");
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
            {/* Amount Field */}
            <form.Field name="amount">
                {(field) => (
                    <div>
                        <label
                            htmlFor="amount"
                            className="mb-2 block text-sm font-medium text-gray-200"
                        >
                            Amount (USD)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="1"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="Enter amount"
                                required
                                className="h-12 w-full rounded-lg bg-white/5 pl-12 pr-4 text-white placeholder-gray-400 transition-all border border-white/10 focus:bg-white/10 focus:border-[#00D9B4]"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            Minimum amount: $10.00
                        </p>
                    </div>
                )}
            </form.Field>

            {/* Transaction ID Field */}
            <form.Field name="transaction_id">
                {(field) => (
                    <div>
                        <label
                            htmlFor="transaction_id"
                            className="mb-2 block text-sm font-medium text-gray-200"
                        >
                            Transaction/Reference ID
                        </label>
                        <input
                            id="transaction_id"
                            type="text"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Enter your payment reference ID"
                            required
                            className="h-12 w-full rounded-lg bg-white/5 px-4 text-white placeholder-gray-400 transition-all border border-white/10 focus:bg-white/10 focus:border-[#00D9B4]"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Enter the transaction ID from your payment provider
                        </p>
                    </div>
                )}
            </form.Field>

            {/* Screenshot Upload */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                    Payment Screenshot (Optional)
                </label>

                {!screenshotPreview ? (
                    <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/5 transition-all hover:border-[#00D9B4] hover:bg-white/10">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-400">Click to upload screenshot</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                ) : (
                    <div className="relative">
                        <img
                            src={screenshotPreview}
                            alt="Payment screenshot"
                            className="w-full h-48 object-cover rounded-lg border border-white/10"
                        />
                        <button
                            type="button"
                            onClick={removeScreenshot}
                            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-all hover:bg-red-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
                <p className="mt-1 text-xs text-gray-400">
                    Upload a screenshot of your payment for faster verification
                </p>
            </div>

            {/* Payment Instructions */}
            <div className="rounded-lg bg-[#00D9B4]/10 border border-[#00D9B4]/30 p-4">
                <h4 className="text-sm font-semibold text-[#00D9B4] mb-2">Payment Instructions</h4>
                <ol className="space-y-1 text-xs text-gray-300">
                    <li>1. Send payment to our account details</li>
                    <li>2. Save your transaction reference ID</li>
                    <li>3. Upload payment screenshot (optional)</li>
                    <li>4. Submit this form for verification</li>
                    <li>5. Wait for admin approval (usually within 24 hours)</li>
                </ol>
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
                    disabled={requestTopupMutation.isPending}
                    className="flex-1 h-12 rounded-lg gradient-primary font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                >
                    {requestTopupMutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Request"
                    )}
                </button>
            </div>
        </form>
    );
}