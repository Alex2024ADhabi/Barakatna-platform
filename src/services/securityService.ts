// Security Service for Barakatna Platform
// Implements OAuth 2.0 and JWT for authentication and authorization
// Provides role-based access control

// Define user role interface
export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

// Define user interface
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  isActive: boolean;
  lastLogin?: Date;
}

// Define permission interface
export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: "create" | "read" | "update" | "delete" | "execute" | "admin";
}

// Define authentication result interface
export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
  expiresAt?: Date;
}

// Define token payload interface
export interface TokenPayload {
  sub: string; // user ID
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
}

// Security Service class
export class SecurityService {
  private static instance: SecurityService;
  private roles: Map<string, UserRole> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private currentUser: User | null = null;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiration: Date | null = null;

  private constructor() {}

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Register a role
  public registerRole(role: UserRole): void {
    this.roles.set(role.id, role);
  }

  // Register a permission
  public registerPermission(permission: Permission): void {
    this.permissions.set(permission.id, permission);
  }

  // Get a role by ID
  public getRole(roleId: string): UserRole | undefined {
    return this.roles.get(roleId);
  }

  // Get a permission by ID
  public getPermission(permissionId: string): Permission | undefined {
    return this.permissions.get(permissionId);
  }

  // Get all roles
  public getAllRoles(): UserRole[] {
    return Array.from(this.roles.values());
  }

  // Get all permissions
  public getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  // Login with username and password
  public async login(username: string, password: string): Promise<AuthResult> {
    try {
      // In a real implementation, this would make an API call to authenticate
      // For now, we'll simulate a successful login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || "Authentication failed",
        };
      }

      const data = await response.json();
      const { user, token, refreshToken, expiresIn } = data;

      // Store authentication data
      this.currentUser = user;
      this.token = token;
      this.refreshToken = refreshToken;
      this.tokenExpiration = new Date(Date.now() + expiresIn * 1000);

      // Store in localStorage for persistence
      localStorage.setItem("auth_token", token);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem(
        "token_expiration",
        this.tokenExpiration.toISOString(),
      );
      localStorage.setItem("current_user", JSON.stringify(user));

      return {
        success: true,
        user,
        token,
        refreshToken,
        expiresAt: this.tokenExpiration,
      };
    } catch (error) {
      return {
        success: false,
        error: `Login error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  // Logout
  public logout(): void {
    this.currentUser = null;
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiration = null;

    // Remove from localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expiration");
    localStorage.removeItem("current_user");
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    if (!this.token || !this.tokenExpiration) {
      return false;
    }

    return this.tokenExpiration > new Date();
  }

  // Get current user
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get authentication token
  public getToken(): string | null {
    return this.token;
  }

  // Refresh token
  public async refreshAuthToken(): Promise<AuthResult> {
    try {
      if (!this.refreshToken) {
        return {
          success: false,
          error: "No refresh token available",
        };
      }

      // In a real implementation, this would make an API call to refresh the token
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || "Token refresh failed",
        };
      }

      const data = await response.json();
      const { token, refreshToken, expiresIn } = data;

      // Update authentication data
      this.token = token;
      this.refreshToken = refreshToken;
      this.tokenExpiration = new Date(Date.now() + expiresIn * 1000);

      // Update localStorage
      localStorage.setItem("auth_token", token);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem(
        "token_expiration",
        this.tokenExpiration.toISOString(),
      );

      return {
        success: true,
        user: this.currentUser || undefined,
        token,
        refreshToken,
        expiresAt: this.tokenExpiration,
      };
    } catch (error) {
      return {
        success: false,
        error: `Token refresh error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  // Check if user has a specific role
  public hasRole(roleId: string): boolean {
    if (!this.currentUser) {
      return false;
    }

    return this.currentUser.roles.some((role) => role.id === roleId);
  }

  // Check if user has a specific permission
  public hasPermission(permissionId: string): boolean {
    if (!this.currentUser) {
      return false;
    }

    const permission = this.permissions.get(permissionId);
    if (!permission) {
      return false;
    }

    return this.currentUser.roles.some((role) =>
      role.permissions.includes(permissionId),
    );
  }

  // Check if user has permission for a specific resource and action
  public hasResourcePermission(resource: string, action: string): boolean {
    if (!this.currentUser) {
      return false;
    }

    const userPermissions = this.currentUser.roles
      .flatMap((role) =>
        role.permissions.map((permId) => this.permissions.get(permId)),
      )
      .filter((perm): perm is Permission => perm !== undefined);

    return userPermissions.some(
      (perm) => perm.resource === resource && perm.action === action,
    );
  }

  // Initialize from localStorage (for persistence)
  public initFromStorage(): boolean {
    try {
      const token = localStorage.getItem("auth_token");
      const refreshToken = localStorage.getItem("refresh_token");
      const tokenExpiration = localStorage.getItem("token_expiration");
      const currentUser = localStorage.getItem("current_user");

      if (!token || !refreshToken || !tokenExpiration || !currentUser) {
        return false;
      }

      this.token = token;
      this.refreshToken = refreshToken;
      this.tokenExpiration = new Date(tokenExpiration);
      this.currentUser = JSON.parse(currentUser);

      // Check if token is expired
      if (this.tokenExpiration <= new Date()) {
        // Token is expired, try to refresh
        this.refreshAuthToken().catch(() => {
          // If refresh fails, logout
          this.logout();
        });
      }

      return true;
    } catch (error) {
      console.error("Error initializing from storage:", error);
      this.logout();
      return false;
    }
  }

  // Decode JWT token
  public decodeToken(token: string): TokenPayload | null {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
}

// Export default instance
export default SecurityService.getInstance();
