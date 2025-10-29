import { Timestamp } from 'firebase/firestore'; // Import Timestamp
import { format } from 'date-fns';

// ✅ Updated to handle Firestore Timestamp objects and undefined/null values
export const FormatDate = (date?: Timestamp | Date | undefined | null): string => {
  if (date) {
    try {
      // Convert Firestore Timestamp to JS Date if necessary
      const jsDate = date instanceof Timestamp ? date.toDate() : date;
      // Check if the resulting date is valid before formatting
      if (!isNaN(jsDate.getTime())) {
        return format(jsDate, 'MMMM dd, yyyy hh:mm a');
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      // Fallback in case of unexpected errors during conversion/formatting
      return "-- Invalid Date --";
    }
  }
  // Return a placeholder if the date is null, undefined, or invalid
  return '--';
};