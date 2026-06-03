const API_URL = "http://localhost:5000/api/v1";

const getHeaders = () => {
  const session = JSON.parse(localStorage.getItem("cfl_session"));
  const headers = { "Content-Type": "application/json" };
  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }
  return headers;
};

const buildQuery = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
};

export const storage = {
  getAuthHeaders: () => getHeaders(),

  getCases: async (params = {}) => {
    try {
      const url = `${API_URL}/cases${buildQuery(params)}`;
      const response = await fetch(url, { headers: getHeaders() });
      const data = await response.json();
      if (!data.success) return { cases: [], pagination: null };
      return { cases: data.data, pagination: data.pagination };
    } catch (error) {
      console.error("Error fetching cases:", error);
      return { cases: [], pagination: null };
    }
  },

  getCase: async (id) => {
    try {
      const response = await fetch(`${API_URL}/cases/${id}`, { headers: getHeaders() });
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error("Error fetching case:", error);
      return null;
    }
  },

  addCase: async (newCase) => {
    try {
      const response = await fetch(`${API_URL}/cases`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(newCase),
      });
      return await response.json();
    } catch (error) {
      console.error("Error adding case:", error);
      return { success: false, message: "Network error" };
    }
  },

  updateCase: async (id, updatedCase) => {
    try {
      const targetId = id || updatedCase._id || updatedCase.id;
      const response = await fetch(`${API_URL}/cases/${targetId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(updatedCase),
      });
      return await response.json();
    } catch (error) {
      console.error("Error updating case:", error);
      return { success: false, message: "Network error" };
    }
  },

  deleteCase: async (id) => {
    try {
      const response = await fetch(`${API_URL}/cases/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error("Error deleting case:", error);
      return { success: false };
    }
  },

  searchCase: async (term) => {
    try {
      const response = await fetch(`${API_URL}/cases/search/${encodeURIComponent(term)}`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!data.success) return null;
      return Array.isArray(data.data) ? data.data : [data.data];
    } catch (error) {
      console.error("Error searching case:", error);
      return null;
    }
  },

  getUsersByRole: async (role) => {
    try {
      const response = await fetch(`${API_URL}/auth/users?role=${encodeURIComponent(role)}`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  getSession: () => JSON.parse(localStorage.getItem("cfl_session")) || null,
  setSession: (data) => localStorage.setItem("cfl_session", JSON.stringify(data)),
  clearSession: () => localStorage.removeItem("cfl_session"),
};
