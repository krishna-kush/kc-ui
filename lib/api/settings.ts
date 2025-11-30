import { api } from "./client";

export interface StorageStats {
    storage_used: number;
    storage_quota: number;
    usage_percentage: number;
    binaries_count: number;
    licenses_count: number;
    files: {
        original_binaries: number;
        merged_binaries: number;
    };
}

export interface CleanupRecommendations {
    licenses: StorageItem[];
    binaries: StorageItem[];
}

export interface StorageItem {
    id: string;
    name: string;
    size: number;
    last_active: string | null;
}

export const settingsApi = {
    getStorageStats: async (): Promise<StorageStats> => {
        const response = await api.get("/settings/storage");
        return response.data;
    },

    getCleanupRecommendations: async (): Promise<CleanupRecommendations> => {
        const response = await api.get("/settings/cleanup");
        return response.data;
    },

    deleteAllLicenses: async (): Promise<{ freed_bytes: number }> => {
        const response = await api.delete("/settings/delete-all-licenses");
        return response.data;
    },

    deleteAllBinaries: async (): Promise<{ freed_bytes: number }> => {
        const response = await api.delete("/settings/delete-all-binaries");
        return response.data;
    },
};
