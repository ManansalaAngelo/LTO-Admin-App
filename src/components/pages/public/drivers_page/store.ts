// src/store/counterStore.ts
import { create } from "zustand";
import type { DriverModel } from "../../../../models/driver_model";

// Define the shape of your state
interface DriversStore {
  pageSize: number;

  searchQuery: string;
  setSearchQuery: (val: string) => void;

  openMenuId: string | null;
  setOpenMenuId: (val: string | null) => void;

  isProfileModalOpen: boolean;
  setProfileModalOpen: (val: boolean) => void;

  selectedDriver: DriverModel | undefined;
  setSelectedDriver: (val: DriverModel | undefined) => void;

  isViolationsModalOpen: boolean;
  setViolationsModalOpen: (val: boolean) => void;

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
    mobileNumber: string;
    driverLicenseNumber: string;
    plateNumber: string;
  };
  setFormData: (val: {
    firstName: string;
    lastName: string;
    middleName: string;
    mobileNumber: string;
    driverLicenseNumber: string;
    plateNumber: string;
  }) => void;
  updateFormField: (field: string, value: string) => void;

  // File states
  profilePicture: File | null;
  setProfilePicture: (val: File | null) => void;

  // Helper methods
  initializeFormData: (driver: DriverModel) => void;
  resetDialogState: () => void;

  reset: () => void;
}

// Pass the interface to the `create` function
const useDriversStore = create<DriversStore>((set) => ({
  pageSize: 10,
  searchQuery: "",
  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  openMenuId: null,
  setOpenMenuId: (openMenuId: string | null) => set({ openMenuId }),

  isProfileModalOpen: false,
  setProfileModalOpen: (isProfileModalOpen) => set({ isProfileModalOpen }),

  selectedDriver: undefined,
  setSelectedDriver: (selectedDriver: DriverModel | undefined) =>
    set({ selectedDriver }),

  isViolationsModalOpen: false,
  setViolationsModalOpen: (isViolationsModalOpen) => set({ isViolationsModalOpen }),

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
    mobileNumber: "",
    driverLicenseNumber: "",
    plateNumber: "",
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

  // Helper methods
  initializeFormData: (driver: DriverModel) => set({
    formData: {
      firstName: driver.firstName || "",
      lastName: driver.lastName || "",
      middleName: driver.middleName || "",
      mobileNumber: driver.mobileNumber || "",
      driverLicenseNumber: driver.driverLicenseNumber || "",
      plateNumber: driver.plateNumber || "",
    }
  }),

  resetDialogState: () => set({
    isEditing: false,
    error: null,
    success: null,
    profilePicture: null,
    formData: {
      firstName: "",
      lastName: "",
      middleName: "",
      mobileNumber: "",
      driverLicenseNumber: "",
      plateNumber: "",
    }
  }),

  reset: () =>
    set({
      pageSize: 10,
      searchQuery: "",
      openMenuId: null,
      isProfileModalOpen: false,
      selectedDriver: undefined,
      isViolationsModalOpen: false,
      isAddModalOpen: false,
      isEditing: false,
      error: null,
      success: null,
      profilePicture: null,
      formData: {
        firstName: "",
        lastName: "",
        middleName: "",
        mobileNumber: "",
        driverLicenseNumber: "",
        plateNumber: "",
      }
    }),
}));

export default useDriversStore;
