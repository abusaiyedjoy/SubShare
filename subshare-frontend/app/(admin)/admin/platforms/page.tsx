"use client";

import { Layout } from "@/components/layout/Layout";
import { Modal } from "@/components/shared/Modal";
import { Badge } from "@/components/shared/Badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpenner";
import { EmptyState } from "@/components/shared/EmptyStats";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import {
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Search,
    Image as ImageIcon,
    Loader2,
} from "lucide-react";
import { usePlatforms } from "@/hooks/usePlatform";

export default function AdminPlatformsPage() {
    const {
        platforms,
        activePlatforms,
        isLoadingPlatforms,
        createPlatform,
        updatePlatform,
        verifyPlatform,
        deletePlatform,
        createPlatformMutation,
        updatePlatformMutation,
        verifyPlatformMutation,
        deletePlatformMutation,
    } = usePlatforms();

    const { toast } = useToast();

    // Modal states
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<any>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        logo_url: "",
    });

    // Search state
    const [searchTerm, setSearchTerm] = useState("");

    // Filter platforms by search
    const filteredPlatforms = platforms.filter((platform: any) =>
        platform.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Reset form
    const resetForm = () => {
        setFormData({ name: "", logo_url: "" });
    };

    // Handle create platform
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Platform name is required");
            return;
        }

        try {
            await createPlatform({
                name: formData.name,
                logo_url: formData.logo_url || undefined,
            });
            toast.success("Platform created successfully! Awaiting verification.");
            setCreateModalOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.message || "Failed to create platform");
        }
    };

    // Handle update platform
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPlatform || !formData.name.trim()) {
            toast.error("Platform name is required");
            return;
        }

        try {
            await updatePlatform({
                id: selectedPlatform.id,
                data: {
                    name: formData.name,
                    logo_url: formData.logo_url || undefined,
                },
            });
            toast.success("Platform updated successfully!");
            setEditModalOpen(false);
            setSelectedPlatform(null);
            resetForm();
        } catch (error: any) {
            toast.error(error.message || "Failed to update platform");
        }
    };

    // Handle verify platform
    const handleVerify = async (platform: any, isActive: boolean) => {
        try {
            await verifyPlatform({ id: platform.id, isActive });
            toast.success(
                `Platform ${isActive ? "activated" : "deactivated"} successfully!`
            );
        } catch (error: any) {
            toast.error(error.message || "Failed to verify platform");
        }
    };

    // Handle delete platform
    const handleDelete = async () => {
        if (!selectedPlatform) return;

        try {
            await deletePlatform(selectedPlatform.id);
            toast.success("Platform deleted successfully!");
            setDeleteModalOpen(false);
            setSelectedPlatform(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete platform");
        }
    };

    // Open edit modal
    const openEditModal = (platform: any) => {
        setSelectedPlatform(platform);
        setFormData({
            name: platform.name,
            logo_url: platform.logo_url || "",
        });
        setEditModalOpen(true);
    };

    // Open delete modal
    const openDeleteModal = (platform: any) => {
        setSelectedPlatform(platform);
        setDeleteModalOpen(true);
    };

    if (isLoadingPlatforms) {
        return (
            <Layout showSidebar={true}>
                <LoadingSpinner size="lg" text="Loading platforms..." />
            </Layout>
        );
    }

    return (
        <Layout showSidebar={true}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Platform Management
                        </h1>
                        <p className="text-gray-400">
                            Manage subscription platforms and their verification status
                        </p>
                    </div>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg gradient-primary px-6 py-3 font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105"
                    >
                        <Plus className="h-5 w-5" />
                        Add Platform
                    </button>
                </div>

                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/30">
                                <ImageIcon className="h-5 w-5 text-blue-400" />
                            </div>
                            <span className="text-sm text-gray-400">Total Platforms</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{platforms.length}</p>
                    </div>

                    <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/30">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                            </div>
                            <span className="text-sm text-gray-400">Active Platforms</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {activePlatforms.length}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/30">
                                <XCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <span className="text-sm text-gray-400">Inactive Platforms</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {platforms.length - activePlatforms.length}
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search platforms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-12 w-full rounded-lg bg-white/5 pl-12 pr-4 text-white border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Platforms List */}
                {filteredPlatforms.length === 0 ? (
                    <EmptyState
                        icon={ImageIcon}
                        title="No Platforms Found"
                        description={
                            searchTerm
                                ? "No platforms match your search criteria"
                                : "No platforms have been added yet. Click 'Add Platform' to create one."
                        }
                        action={
                            !searchTerm
                                ? {
                                    label: "Add Platform",
                                    onClick: () => setCreateModalOpen(true),
                                }
                                : undefined
                        }
                    />
                ) : (
                    <div className="space-y-4">
                        {filteredPlatforms.map((platform: any) => (
                            <div
                                key={platform.id}
                                className="rounded-2xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Platform Logo */}
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl gradient-primary text-2xl font-bold text-[#0A1628] overflow-hidden">
                                            {platform.logo_url ? (
                                                <img
                                                    src={platform.logo_url}
                                                    alt={platform.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                platform.name.charAt(0).toUpperCase()
                                            )}
                                        </div>

                                        {/* Platform Info */}
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">
                                                {platform.name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        platform.is_active && platform.status
                                                            ? "success"
                                                            : "error"
                                                    }
                                                >
                                                    {platform.is_active && platform.status ? (
                                                        <>
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Inactive
                                                        </>
                                                    )}
                                                </Badge>
                                                <span className="text-xs text-gray-400">
                                                    ID: {platform.id}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {/* Toggle Active Status */}
                                        <button
                                            onClick={() =>
                                                handleVerify(
                                                    platform,
                                                    !(platform.is_active && platform.status)
                                                )
                                            }
                                            disabled={verifyPlatformMutation.isPending}
                                            className={`flex h-10 items-center gap-2 rounded-lg px-4 font-medium transition-colors border ${platform.is_active && platform.status
                                                    ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                                                    : "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {verifyPlatformMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : platform.is_active && platform.status ? (
                                                <>
                                                    <XCircle className="h-4 w-4" />
                                                    Deactivate
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-4 w-4" />
                                                    Activate
                                                </>
                                            )}
                                        </button>

                                        {/* Edit */}
                                        <button
                                            onClick={() => openEditModal(platform)}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-[#00D9B4] border border-white/10"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={() => openDeleteModal(platform)}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400 border border-white/10"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Platform Details */}
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                                        <div>
                                            <p className="text-gray-400 mb-1">Created At</p>
                                            <p className="text-white">
                                                {new Date(platform.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 mb-1">Logo URL</p>
                                            <p className="text-white truncate">
                                                {platform.logo_url || "No logo"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 mb-1">Status</p>
                                            <p className="text-white">
                                                {platform.is_active && platform.status
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Platform Modal */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => {
                    setCreateModalOpen(false);
                    resetForm();
                }}
                title="Create New Platform"
                size="md"
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-200">
                            Platform Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="e.g., Netflix, Spotify, Disney+"
                            className="h-12 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-200">
                            Logo URL (Optional)
                        </label>
                        <input
                            type="url"
                            value={formData.logo_url}
                            onChange={(e) =>
                                setFormData({ ...formData, logo_url: e.target.value })
                            }
                            placeholder="https://example.com/logo.png"
                            className="h-12 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all outline-none"
                        />
                    </div>

                    <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-4">
                        <p className="text-sm text-yellow-400">
                            <strong>Note:</strong> New platforms will be created as inactive
                            by default. You can activate them after creation.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setCreateModalOpen(false);
                                resetForm();
                            }}
                            className="flex-1 h-12 rounded-lg bg-white/5 font-medium text-white transition-all hover:bg-white/10 border border-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createPlatformMutation.isPending}
                            className="flex-1 h-12 rounded-lg gradient-primary font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {createPlatformMutation.isPending && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Create Platform
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Platform Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedPlatform(null);
                    resetForm();
                }}
                title="Edit Platform"
                size="md"
            >
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-200">
                            Platform Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="e.g., Netflix, Spotify, Disney+"
                            className="h-12 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-200">
                            Logo URL (Optional)
                        </label>
                        <input
                            type="url"
                            value={formData.logo_url}
                            onChange={(e) =>
                                setFormData({ ...formData, logo_url: e.target.value })
                            }
                            placeholder="https://example.com/logo.png"
                            className="h-12 w-full rounded-lg bg-white/5 px-4 text-white border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all outline-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setEditModalOpen(false);
                                setSelectedPlatform(null);
                                resetForm();
                            }}
                            className="flex-1 h-12 rounded-lg bg-white/5 font-medium text-white transition-all hover:bg-white/10 border border-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updatePlatformMutation.isPending}
                            className="flex-1 h-12 rounded-lg gradient-primary font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {updatePlatformMutation.isPending && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Update Platform
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedPlatform(null);
                }}
                title="Delete Platform"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        Are you sure you want to delete{" "}
                        <strong className="text-white">{selectedPlatform?.name}</strong>?
                        This action cannot be undone.
                    </p>

                    <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
                        <p className="text-sm text-red-400">
                            <strong>Warning:</strong> Deleting this platform will affect all
                            subscriptions using it. Make sure no active subscriptions are
                            associated with this platform.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setSelectedPlatform(null);
                            }}
                            className="flex-1 h-12 rounded-lg bg-white/5 font-medium text-white transition-all hover:bg-white/10 border border-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deletePlatformMutation.isPending}
                            className="flex-1 h-12 rounded-lg bg-red-500 font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {deletePlatformMutation.isPending && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Delete Platform
                        </button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
}