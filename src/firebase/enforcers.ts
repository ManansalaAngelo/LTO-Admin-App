// src/firebase/enforcers.ts
import {
  collection,
  addDoc,
  query,
  getDocs,
  where,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { FirebaseCollections } from "../enums/collections";
import type { EnforcerSchemaType } from "../components/pages/public/enforcers_page/schema";
import { UserRoles } from "../enums/roles";
import generatePassword from "../utils/password_generator";
import generateId from "../utils/id_generator";
import generateQueryKeyPrefixes from "../utils/query_key_generator";
import type { EnforcerCreateResponseModel } from "./response_models/enforcers_response_model";
import { sendEmail } from "../utils/emailjs";
import { createFile, deleteFileIfExists } from "../cloudinary/file_upload";

export interface UpdateEnforcerData {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  mobileNumber?: string;
  enforcerIdNumber?: string;
  profilePicture?: File | null;
  idBadgePhoto?: File | null;
}

export interface UpdateEnforcerParams {
  documentId: string;
  enforcerData: UpdateEnforcerData;
}

interface EnforcerUpdateFields {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  mobileNumber?: string;
  enforcerIdNumber?: string;
  profilePictureUrl?: string;
  badgePhoto?: string;
  lastUpdatedAt: Date;
}

/**
 * Adds a new enforcer to thex Firestore 'users' collection.
 * @param data - The enforcer data from the form.
 * @returns The document reference of the newly created user.
 */
export const addEnforcer = async (
  data: EnforcerSchemaType
): Promise<EnforcerCreateResponseModel> => {
  try {
    const usersRef = collection(db, FirebaseCollections.users);
    const q = query(usersRef, where("email", "==", data.email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Account exists, check if already an enforcer
      const existingDoc = snapshot.docs[0];
      const existingData = existingDoc.data();
      const roles = existingData.roles || [];

      if (roles.includes(UserRoles.Enforcer)) {
        throw new Error("An account with this email already exists.");
      }else if(roles.includes(UserRoles.Admin) || roles.includes(UserRoles.SuperAdmin)) {
        // Admin or SuperAdmin exists, cannot add Enforcer
        throw new Error("Cannot add Enforcer role to an Admin account.");
      } else {
        // Add Enforcer roles to existing account
        const updatedRoles = [...roles, UserRoles.Enforcer];
        await updateDoc(existingDoc.ref, { roles: updatedRoles });
        return { isSuccess: true, message: existingDoc.id };
      }
    }

    // Account doesn't exist, create new enforcer
    const temporaryPassword = generatePassword();
    const enforcerId = generateId();
    const queryKeys = generateQueryKeyPrefixes(data.firstName);
    queryKeys.push(...generateQueryKeyPrefixes(data.lastName));
    if (data.middleName) {
      queryKeys.push(...generateQueryKeyPrefixes(data.middleName));
    }

    const docRef = await addDoc(collection(db, FirebaseCollections.users), {
      ...data,
      createdAt: new Date(),
      roles: [UserRoles.Enforcer],
      temporaryPassword: temporaryPassword,
      enforcerIdNumber: enforcerId,
      queryKeys: queryKeys,
      uuid: null,
    });
    try {
      await sendEmail({
        to_email: data.email,
        full_name: `${data.firstName} ${data.lastName}`,
        temporary_password: temporaryPassword,
      });
    } catch {
      await deleteDoc(docRef);
      throw new Error("Failed to send email. Enforcer not added.");
    }

    return { isSuccess: true, message: docRef.id };
  } catch (error) {
    console.error("Error adding enforcer:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

export const deleteEnforcers = async (documentId: string): Promise<void> => {
  if (!documentId) {
    throw new Error("Document ID is required to delete a report.");
  }

  try {
    const userRef = doc(db, FirebaseCollections.users, documentId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User not found.");
    }

    const userData = userDoc.data();
    const roles = userData.roles || [];

    if (roles.length === 1 && roles[0] === UserRoles.Enforcer) {
      // Only Enforcer role, delete the document permanently
      await deleteDoc(userRef);
      console.log(`User with ID ${documentId} permanently deleted.`);
    } else {
      // Has other roles, remove Enforcer role
      const updatedRoles = roles.filter((role: number) => role !== UserRoles.Enforcer);
      await updateDoc(userRef, { roles: updatedRoles });
      console.log(`Enforcer role removed from user with ID ${documentId}.`);
    }
  } catch (e) {
    console.error(`Error processing user with ID ${documentId}: `, e);
    throw e; // Re-throw the error to be handled by the caller
  }
};

/**
 * Update enforcer details with proper file handling
 * @param params - Document ID and enforcer data
 * @returns Promise with success status
 */
export const updateEnforcer = async (params: UpdateEnforcerParams): Promise<{ isSuccess: boolean; message: string }> => {
  const { documentId, enforcerData } = params;
  
  if (!documentId) {
    throw new Error("Document ID is required to update enforcer");
  }

  try {
    // Get current enforcer document
    const userRef = doc(db, FirebaseCollections.users, documentId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("Enforcer not found");
    }

    const currentData = userDoc.data();
    const oldProfilePictureUrl = currentData.profilePictureUrl || null;
    const oldIdBadgePhotoUrl = currentData.badgePhoto || null;

    // Rollback tracking
    let uploadedProfilePicture: string | null = null;
    let uploadedIdBadgePhoto: string | null = null;

    try {
      // Handle file uploads (profile picture)
      if (enforcerData.profilePicture) {
        const result = await createFile(enforcerData.profilePicture, "profile-pictures");
        uploadedProfilePicture = result.secure_url;
      }

      // Handle file uploads (ID badge photo)
      if (enforcerData.idBadgePhoto) {
        const result = await createFile(enforcerData.idBadgePhoto, "id-badges");
        uploadedIdBadgePhoto = result.secure_url;
      }

      // Prepare update data
      const updateData: Partial<EnforcerUpdateFields> = {
        firstName: enforcerData.firstName,
        lastName: enforcerData.lastName,
        middleName: enforcerData.middleName || "",
        mobileNumber: enforcerData.mobileNumber || "",
        enforcerIdNumber: enforcerData.enforcerIdNumber || "",
        lastUpdatedAt: new Date(),
      };

      // Only update email if the enforcer is not registered (uuid is null)
      if (!currentData.uuid) {
        updateData.email = enforcerData.email;
      }

      // Update file URLs if new files were uploaded
      if (uploadedProfilePicture !== null) {
        updateData.profilePictureUrl = uploadedProfilePicture;
      }
      if (uploadedIdBadgePhoto !== null) {
        updateData.badgePhoto = uploadedIdBadgePhoto;
      }

      // Update Firestore document
      await updateDoc(userRef, updateData);

      // Delete old files after successful update
      if (uploadedProfilePicture && oldProfilePictureUrl) {
        await deleteFileIfExists(oldProfilePictureUrl);
      }
      if (uploadedIdBadgePhoto && oldIdBadgePhotoUrl) {
        await deleteFileIfExists(oldIdBadgePhotoUrl);
      }

      return { isSuccess: true, message: "Enforcer updated successfully" };

    } catch (error) {
      console.error("Enforcer update failed, initiating rollback:", error);

      // Rollback operations - delete newly uploaded files
      try {
        if (uploadedProfilePicture) {
          await deleteFileIfExists(uploadedProfilePicture);
        }
        if (uploadedIdBadgePhoto) {
          await deleteFileIfExists(uploadedIdBadgePhoto);
        }
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }

      throw error;
    }
  } catch (error) {
    console.error("Error updating enforcer:", error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Get enforcer information by document ID
 * @param enforcerId - The document ID of the enforcer
 * @returns Promise<{ id: string, fullName: string } | null>
 */
export const getEnforcerById = async (enforcerId: string): Promise<{ id: string, fullName: string } | null> => {
  if (!enforcerId) {
    return null;
  }

  try {
    const userRef = doc(db, FirebaseCollections.users, enforcerId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    const roles = userData.roles || [];

    // Check if user is an enforcer
    if (!roles.includes(UserRoles.Enforcer)) {
      return null;
    }

    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    
    return {
      id: enforcerId,
      fullName: fullName || 'Unknown Enforcer'
    };
  } catch (error) {
    console.error(`Error getting enforcer by ID ${enforcerId}:`, error);
    return null;
  }
};
