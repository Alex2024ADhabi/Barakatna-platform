import { User } from "../lib/api/user/types";

// Mock user data for development
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@barakatna.com",
    password: "password123", // In a real app, this would be hashed
    role: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Healthcare Provider",
    email: "provider@barakatna.com",
    password: "password123",
    role: "healthcare_provider",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// In a real application, these would be API calls to a backend service
export const authService = {
  /**
   * Authenticate a user with email and password
   */
  login: async (
    email: string,
    password: string,
  ): Promise<{
    user: User;
    token?: string;
    refreshToken?: string;
    expiresIn?: number;
  } | null> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Find user with matching email and password
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      return null;
    }

    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = user;

    // Generate mock tokens for authentication
    const token = `mock_token_${Date.now()}`;
    const refreshToken = `mock_refresh_token_${Date.now()}`;
    const expiresIn = 3600; // 1 hour in seconds

    return {
      user: userWithoutPassword as User,
      token,
      refreshToken,
      expiresIn,
    };
  },

  /**
   * Register a new user
   */
  register: async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    address?: string,
  ): Promise<User | null> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if user already exists
    if (MOCK_USERS.some((u) => u.email === email)) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const newUser: User = {
      id: String(MOCK_USERS.length + 1),
      name,
      email,
      password,
      role: "user", // Default role
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phone,
      address,
    };

    // In a real app, we would save this to a database
    MOCK_USERS.push(newUser);

    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword as User;
  },

  /**
   * Request a password reset for a user
   */
  requestPasswordReset: async (email: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check if user exists
    const user = MOCK_USERS.find((u) => u.email === email);
    if (!user) {
      // In a real app, we might not want to reveal if a user exists or not
      // for security reasons, so we would still return true
      return true;
    }

    // In a real app, we would send an email with a reset link
    console.log(`Password reset requested for ${email}`);
    return true;
  },

  /**
   * Validate a password reset token
   */
  validateResetToken: async (token: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real app, we would validate the token against a database
    // For this mock, we'll just check if it's a non-empty string
    return token.length > 0;
  },

  /**
   * Reset a user's password using a token
   */
  resetPassword: async (
    token: string,
    newPassword: string,
  ): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, we would validate the token and update the user's password
    console.log(`Password reset with token: ${token}`);
    return true;
  },

  /**
   * Verify a multi-factor authentication code
   */
  verifyMFA: async (email: string, code: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // In a real app, we would validate the MFA code against what was sent
    // For this mock, we'll accept any 6-digit code
    return code.length === 6 && /^\d+$/.test(code);
  },

  /**
   * Resend a multi-factor authentication code
   */
  resendMFACode: async (email: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real app, we would generate and send a new MFA code
    console.log(`Resending MFA code to ${email}`);
    return true;
  },

  /**
   * Get the current authenticated user
   */
  getCurrentUser: async (): Promise<User | null> => {
    // In a real app, we would get the user from a token in localStorage or cookies
    const userJson = localStorage.getItem("currentUser");
    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error("Error parsing user from localStorage", error);
      return null;
    }
  },

  /**
   * Refresh the authentication token
   */
  refreshToken: async (refreshToken: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // In a real app, we would send the refresh token to the server and get a new access token
    // For this mock, we'll just simulate a successful refresh
    if (refreshToken) {
      // Generate a new token with expiration
      const expiresIn = 3600; // 1 hour
      const newToken = `mock_refreshed_token_${Date.now()}`;
      const newRefreshToken = `mock_refreshed_refresh_token_${Date.now()}`;

      // Store the new tokens
      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // Set token expiry (1 hour from now)
      const expiryTime = new Date(Date.now() + expiresIn * 1000);
      localStorage.setItem("tokenExpiry", expiryTime.toISOString());

      return true;
    }

    return false;
  },

  /**
   * Log out the current user
   */
  logout: async (): Promise<boolean> => {
    // In a real app, we would invalidate the token on the server
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
    return true;
  },
};
