import { storage } from "./storage";

const API_URL = "http://localhost:5000/api/v1/auth";

export const auth = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        storage.setSession({
          email: data.user.email,
          role: data.user.role,
          fullName: data.user.fullName,
          token: data.token,
        });
        return { success: true, user: data.user };
      }
      return { error: data.message || "Invalid credentials" };
    } catch (error) {
      console.error("Login error:", error);
      return { error: "Connection error. Is the server running?" };
    }
  },

  register: async (fullName, email, password, role) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role }),
      });
      return await response.json();
    } catch (error) {
      console.error("Registration error:", error);
      return { error: "Connection error. Is the server running?" };
    }
  },

  getMe: async () => {
    try {
      const response = await fetch(`${API_URL}/me`, { headers: storage.getAuthHeaders() });
      const data = await response.json();
      if (data.success) {
        const session = storage.getSession();
        storage.setSession({ ...session, ...data.user, token: session?.token });
        return data.user;
      }
      return null;
    } catch {
      return null;
    }
  },

  logout: () => {
    storage.clearSession();
  },

  getCurrentUser: () => {
    const session = storage.getSession();
    return session
      ? { email: session.email, role: session.role, fullName: session.fullName }
      : null;
  },

  isAuthenticated: () => !!storage.getSession()?.token,

  hasRole: (allowedRoles) => {
    const user = auth.getCurrentUser();
    return user && allowedRoles.includes(user.role);
  },
};
