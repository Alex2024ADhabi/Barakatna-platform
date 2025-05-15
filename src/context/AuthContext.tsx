import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../lib/api/user/userApi";
import { UserWithPermissions } from "../lib/api/user/types";
import { useToast } from "../components/ui/use-toast";
import { authService } from "../services/authService";

interface AuthContextType {
  user: UserWithPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    address?: string,
  ) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  validateResetToken: (token: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  verifyMFA: (email: string, code: string) => Promise<boolean>;
  resendMFACode: (email: string) => Promise<boolean>;
  checkPermission: (
    module: string,
    action: "view" | "create" | "edit" | "delete" | "approve",
  ) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  register: async () => false,
  requestPasswordReset: async () => false,
  validateResetToken: async () => false,
  resetPassword: async () => false,
  verifyMFA: async () => false,
  resendMFACode: async () => false,
  checkPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserWithPermissions | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in on mount and set up token refresh
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Check token expiration
      const tokenExpiry = localStorage.getItem("tokenExpiry");
      if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
        // Token has expired, try to refresh it
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            // Attempt to refresh the token
            const refreshed = await authService.refreshToken(refreshToken);
            if (!refreshed) {
              // Refresh failed, clear auth state
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("tokenExpiry");
              localStorage.removeItem("currentUser");
              setIsLoading(false);
              setIsAuthenticated(false);
              setUser(null);
              return;
            }
            // Token refreshed successfully, continue with auth check
            console.log("Token refreshed successfully");
          } else {
            // No refresh token available
            localStorage.removeItem("token");
            localStorage.removeItem("tokenExpiry");
            localStorage.removeItem("currentUser");
            setIsLoading(false);
            setIsAuthenticated(false);
            setUser(null);
            return;
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("tokenExpiry");
          localStorage.removeItem("currentUser");
          setIsLoading(false);
          setIsAuthenticated(false);
          setUser(null);
          return;
        }
      }

      try {
        // First try to get user from API
        const response = await userApi.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          // If API fails, try to get user from localStorage
          const userJson = localStorage.getItem("currentUser");
          if (userJson) {
            try {
              const userData = JSON.parse(userJson);
              setUser(userData as UserWithPermissions);
              setIsAuthenticated(true);
            } catch (parseError) {
              console.error("Error parsing user from localStorage", parseError);
              // Token is invalid or expired
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("tokenExpiry");
              localStorage.removeItem("currentUser");
              setIsAuthenticated(false);
              setUser(null);
            }
          } else {
            // No user data available
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("tokenExpiry");
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        // Try to get user from localStorage as fallback
        const userJson = localStorage.getItem("currentUser");
        if (userJson) {
          try {
            const userData = JSON.parse(userJson);
            setUser(userData as UserWithPermissions);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error("Error parsing user from localStorage", parseError);
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("tokenExpiry");
            localStorage.removeItem("currentUser");
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("tokenExpiry");
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Set up periodic token refresh
    const refreshInterval = setInterval(() => {
      const token = localStorage.getItem("token");
      const tokenExpiry = localStorage.getItem("tokenExpiry");
      const refreshToken = localStorage.getItem("refreshToken");

      if (token && tokenExpiry && refreshToken) {
        // Check if token will expire in the next 5 minutes
        const expiryDate = new Date(tokenExpiry);
        const fiveMinutesFromNow = new Date(new Date().getTime() + 5 * 60000);

        if (expiryDate <= fiveMinutesFromNow) {
          // Token will expire soon, refresh it
          authService
            .refreshToken(refreshToken)
            .then((success) => {
              if (success) {
                console.log("Background token refresh successful");
              } else {
                console.error("Background token refresh failed");
              }
            })
            .catch((error) => {
              console.error("Background token refresh failed:", error);
            });
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);

      if (response) {
        // Store user info and authentication tokens
        localStorage.setItem("currentUser", JSON.stringify(response.user));

        // Store token with expiration information
        if (response.token) {
          localStorage.setItem("token", response.token);

          // Set token expiry (default to 24 hours if not provided)
          const expiryTime = response.expiresIn
            ? new Date(Date.now() + response.expiresIn * 1000)
            : new Date(Date.now() + 24 * 60 * 60 * 1000);
          localStorage.setItem("tokenExpiry", expiryTime.toISOString());

          // Store refresh token if available
          if (response.refreshToken) {
            localStorage.setItem("refreshToken", response.refreshToken);
          }
        }

        // Get user data with permissions
        try {
          const userResponse = await userApi.getCurrentUser();
          if (userResponse.success && userResponse.data) {
            setUser(userResponse.data);
            setIsAuthenticated(true);
            setIsLoading(false);
            return true;
          } else {
            // If API call fails, use the user data from login response
            setUser(response.user as UserWithPermissions);
            setIsAuthenticated(true);
            setIsLoading(false);
            return true;
          }
        } catch (apiError) {
          console.error("Error fetching user data:", apiError);
          // Use the user data from login response as fallback
          setUser(response.user as UserWithPermissions);
          setIsAuthenticated(true);
          setIsLoading(false);
          return true;
        }
      }

      setIsLoading(false);
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    address?: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const user = await authService.register(
        name,
        email,
        password,
        phone,
        address,
      );
      if (user) {
        setIsLoading(false);
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully",
        });
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
      toast({
        title: "Registration Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during registration",
        variant: "destructive",
      });
      return false;
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const success = await authService.requestPasswordReset(email);
      return success;
    } catch (error) {
      console.error("Password reset request error:", error);
      toast({
        title: "Error",
        description: "Failed to send reset instructions",
        variant: "destructive",
      });
      return false;
    }
  };

  const validateResetToken = async (token: string): Promise<boolean> => {
    try {
      return await authService.validateResetToken(token);
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string,
  ): Promise<boolean> => {
    try {
      return await authService.resetPassword(token, newPassword);
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      });
      return false;
    }
  };

  const verifyMFA = async (email: string, code: string): Promise<boolean> => {
    try {
      return await authService.verifyMFA(email, code);
    } catch (error) {
      console.error("MFA verification error:", error);
      return false;
    }
  };

  const resendMFACode = async (email: string): Promise<boolean> => {
    try {
      return await authService.resendMFACode(email);
    } catch (error) {
      console.error("MFA code resend error:", error);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    // Clear all authentication data from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("currentUser");

    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  const checkPermission = (
    module: string,
    action: "view" | "create" | "edit" | "delete" | "approve",
  ): boolean => {
    if (!user || !user.permissions) return false;

    // Check if user has permission for the module and action
    const modulePermissions = user.permissions[module];
    if (!modulePermissions) return false;

    return modulePermissions[action] === true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        requestPasswordReset,
        validateResetToken,
        resetPassword,
        verifyMFA,
        resendMFACode,
        checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
