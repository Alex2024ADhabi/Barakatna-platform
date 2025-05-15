/**
 * Returns the authorization header with JWT token
 * @returns Authorization header object
 */
export const authHeader = (): Record<string, string> => {
  const token = localStorage.getItem("auth_token");

  if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    return {};
  }
};
