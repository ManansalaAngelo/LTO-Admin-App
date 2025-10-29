// src/store/appealsStore.ts
import { create } from "zustand";
import type { AppealsModel } from "../../../../models/appeals_model";

// Define the shape of your state
interface AppealsStore {
  pageSize: number;
  searchQuery: string;
  selectedAppeal: AppealsModel | undefined;
  isAppealDetailsDialogOpen: boolean;
  isConfirmationDialogOpen: boolean;
  confirmationAction: "Approve" | "Reject" | null;

  setSearchQuery: (val: string) => void;
  setSelectedAppeal: (appeal: AppealsModel | undefined) => void;
  setAppealDetailsDialogOpen: (open: boolean) => void;
  setConfirmationDialogOpen: (open: boolean) => void;
  setConfirmationAction: (action: "Approve" | "Reject" | null) => void;
  reset: () => void;
}

// Pass the interface to the `create` function
const useAppealsStore = create<AppealsStore>((set) => ({
  pageSize: 10,
  searchQuery: "",
  selectedAppeal: undefined,
  isAppealDetailsDialogOpen: false,
  isConfirmationDialogOpen: false,
  confirmationAction: null,

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  setSelectedAppeal: (selectedAppeal: AppealsModel | undefined) =>
    set({ selectedAppeal }),
  setAppealDetailsDialogOpen: (isAppealDetailsDialogOpen: boolean) =>
    set({ isAppealDetailsDialogOpen }),
  setConfirmationDialogOpen: (open: boolean) =>
    set({ isConfirmationDialogOpen: open }),
  setConfirmationAction: (action) => set({ confirmationAction: action }),

  reset: () =>
    set({
      pageSize: 10,
      searchQuery: "",
      selectedAppeal: undefined,
      isAppealDetailsDialogOpen: false,
      isConfirmationDialogOpen: false,
      confirmationAction: null,
    }),
}));

export default useAppealsStore;