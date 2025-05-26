
/**
 * Formats an ISO date string to a readable format.
 * @param isoString The ISO date string to format.
 * @returns A formatted date string in DD/MM/YYYY HH:MM format.
 * @throws {Error} If the input is not a valid date string.
 */
export const formatDate = (isoString: string): string => {
  try {
    if (!isoString || typeof isoString !== "string") {
      throw new Error("Invalid input: isoString must be a non-empty string");
    }

    const date = new Date(isoString);
    
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    throw new Error(`Failed to format date: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};
