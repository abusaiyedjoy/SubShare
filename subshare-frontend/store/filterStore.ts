import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SubscriptionFilters {
  search: string;
  platform_id: number | null;
  status: boolean | null;
  is_verified: boolean | null;
  min_price: number | null;
  max_price: number | null;
  sort_by: "price_asc" | "price_desc" | "newest" | "popular" | null;
}

interface TransactionFilters {
  type: string | null;
  status: string | null;
  date_from: string | null;
  date_to: string | null;
}

interface FilterState {
  // Subscription Filters
  subscriptionFilters: SubscriptionFilters;
  setSubscriptionFilter: <K extends keyof SubscriptionFilters>(
    key: K,
    value: SubscriptionFilters[K]
  ) => void;
  resetSubscriptionFilters: () => void;
  
  // Transaction Filters
  transactionFilters: TransactionFilters;
  setTransactionFilter: <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => void;
  resetTransactionFilters: () => void;

  // Recent Searches
  recentSearches: string[];
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;

  // Favorite Platforms
  favoritePlatforms: number[];
  toggleFavoritePlatform: (platformId: number) => void;
  isFavoritePlatform: (platformId: number) => boolean;
}

const initialSubscriptionFilters: SubscriptionFilters = {
  search: "",
  platform_id: null,
  status: true,
  is_verified: true,
  min_price: null,
  max_price: null,
  sort_by: null,
};

const initialTransactionFilters: TransactionFilters = {
  type: null,
  status: null,
  date_from: null,
  date_to: null,
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Subscription Filters
      subscriptionFilters: initialSubscriptionFilters,
      setSubscriptionFilter: (key, value) => {
        set((state) => ({
          subscriptionFilters: {
            ...state.subscriptionFilters,
            [key]: value,
          },
        }));
      },
      resetSubscriptionFilters: () => {
        set({ subscriptionFilters: initialSubscriptionFilters });
      },

      // Transaction Filters
      transactionFilters: initialTransactionFilters,
      setTransactionFilter: (key, value) => {
        set((state) => ({
          transactionFilters: {
            ...state.transactionFilters,
            [key]: value,
          },
        }));
      },
      resetTransactionFilters: () => {
        set({ transactionFilters: initialTransactionFilters });
      },

      // Recent Searches
      recentSearches: [],
      addRecentSearch: (search) => {
        const trimmedSearch = search.trim();
        if (!trimmedSearch) return;

        set((state) => {
          const filtered = state.recentSearches.filter((s) => s !== trimmedSearch);
          return {
            recentSearches: [trimmedSearch, ...filtered].slice(0, 10), // Keep only 10 recent searches
          };
        });
      },
      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },

      // Favorite Platforms
      favoritePlatforms: [],
      toggleFavoritePlatform: (platformId) => {
        set((state) => {
          const isFavorite = state.favoritePlatforms.includes(platformId);
          return {
            favoritePlatforms: isFavorite
              ? state.favoritePlatforms.filter((id) => id !== platformId)
              : [...state.favoritePlatforms, platformId],
          };
        });
      },
      isFavoritePlatform: (platformId) => {
        return get().favoritePlatforms.includes(platformId);
      },
    }),
    {
      name: "filter-storage",
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        favoritePlatforms: state.favoritePlatforms,
      }),
    }
  )
);