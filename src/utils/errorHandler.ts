import axios, { AxiosError } from "axios";

/**
 * Handles API errors in a consistent way
 * @param error The error from axios
 * @param defaultMessage Default message to show if error doesn't have a response
 */
export const handleApiError = (
  error: unknown,
  defaultMessage = "An error occurred",
): { success: boolean; message: string } => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
    }>;

    // Handle different error scenarios
    if (axiosError.response) {
      // The request was made and the server responded with a status code outside of 2xx range
      const errorMessage =
        axiosError.response.data?.message ||
        axiosError.response.data?.error ||
        `Error ${axiosError.response.status}: ${axiosError.response.statusText}`;

      return {
        success: false,
        message: errorMessage,
      };
    } else if (axiosError.request) {
      // The request was made but no response was received
      return {
        success: false,
        message:
          "No response received from server. Please check your connection.",
      };
    } else {
      // Something happened in setting up the request
      return {
        success: false,
        message: axiosError.message || defaultMessage,
      };
    }
  }

  // For non-axios errors
  return {
    success: false,
    message: error instanceof Error ? error.message : defaultMessage,
  };
};
