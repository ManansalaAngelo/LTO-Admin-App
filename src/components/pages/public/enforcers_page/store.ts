// src/store/counterStore.ts
import { create } from "zustand";
import type { EnforcerModel } from "../../../../models/enforcer_model";

// Define the shape of your state
interface EnforcersStore {
  pageSize: number;

  searchQuery: string;
  setSearchQuery: (val: string) => void;

  openMenuId: string | null;
  setOpenMenuId: (val: string | null) => void;

  isProfileModalOpen: boolean;
  setProfileModalOpen: (val: boolean) => void;

  isReportsModalOpen: boolean;
  setReportsModalOpen: (val: boolean) => void;

  selectedEnforcer: EnforcerModel | undefined;
  setSelectedEnforcer: (val: EnforcerModel | undefined) => void;

  isDeleteConfirmationDialogOpen: boolean;
  setDeleteConfirmationDialog: (val: boolean) => void;

  isAddModalOpen: boolean,
  setAddModalOpen: (val: boolean) => void;

  // Dialog editing states
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;

  error: string | null;
  setError: (val: string | null) => void;

  success: string | null;
  setSuccess: (val: string | null) => void;

  // Form data state
  formData: {
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    mobileNumber: string;
    enforcerIdNumber: string;
  };
  setFormData: (val: {
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    mobileNumber: string;
    enforcerIdNumber: string;
  }) => void;
  updateFormField: (field: string, value: string) => void;

  // File states
  profilePicture: File | null;
  setProfilePicture: (val: File | null) => void;

  idBadgePhoto: File | null;
  setIdBadgePhoto: (val: File | null) => void;

  // Helper methods
  initializeFormData: (enforcer: EnforcerModel) => void;
  resetDialogState: () => void;

  reset: () => void;
}

// Pass the interface to the `create` function
const useEnforcersStore = create<EnforcersStore>((set) => ({
  pageSize: 10,
  searchQuery: "",
  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  openMenuId: null,
  setOpenMenuId: (openMenuId: string | null) => set({ openMenuId }),

  isProfileModalOpen: false,
  setProfileModalOpen: (isProfileModalOpen) => set({ isProfileModalOpen }),

  isReportsModalOpen: false,
  setReportsModalOpen: (isReportsModalOpen) => set({ isReportsModalOpen }),

  selectedEnforcer: undefined,
  setSelectedEnforcer: (selectedEnforcer: EnforcerModel | undefined) =>
    set({ selectedEnforcer }),

  isDeleteConfirmationDialogOpen: false,
  setDeleteConfirmationDialog: (isDeleteConfirmationDialogOpen) =>
    set({ isDeleteConfirmationDialogOpen }),

  isAddModalOpen: false,
  setAddModalOpen: (isAddModalOpen) => set({ isAddModalOpen }),

  // Dialog editing states
  isEditing: false,
  setIsEditing: (isEditing: boolean) => set({ isEditing }),

  error: null,
  setError: (error: string | null) => set({ error }),

  success: null,
  setSuccess: (success: string | null) => set({ success }),

  // Form data state
  formData: {
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    mobileNumber: "",
    enforcerIdNumber: "",
  },
  setFormData: (formData) => set({ formData }),
  updateFormField: (field: string, value: string) => set(state => ({
    formData: {
      ...state.formData,
      [field]: value
    }
  })),

  // File states
  profilePicture: null,
  setProfilePicture: (profilePicture: File | null) => set({ profilePicture }),

  idBadgePhoto: null,
  setIdBadgePhoto: (idBadgePhoto: File | null) => set({ idBadgePhoto }),

  // Helper methods
  initializeFormData: (enforcer: EnforcerModel) => set({
    formData: {
      firstName: enforcer.firstName || "",
      lastName: enforcer.lastName || "",
      middleName: enforcer.middleName || "",
      email: enforcer.email || "",
      mobileNumber: enforcer.mobileNumber || "",
      enforcerIdNumber: enforcer.enforcerIdNumber || "",
    }
  }),

  resetDialogState: () => set({
    isEditing: false,
    error: null,
    success: null,
    profilePicture: null,
    idBadgePhoto: null,
    formData: {
      firstName: "",
      lastName: "",
      middleName: "",
      email: "",
      mobileNumber: "",
      enforcerIdNumber: "",
    }
  }),

  reset: () =>
    set({
      pageSize: 10,
      searchQuery: "",
      openMenuId: null,
      isEditing: false,
      error: null,
      success: null,
      profilePicture: null,
      idBadgePhoto: null,
      formData: {
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        mobileNumber: "",
        enforcerIdNumber: "",
      }
    }),
}));

export default useEnforcersStore;
