export const apiRequest = async ({
  endpoint,
  method = "GET",
  data = null,
  requiresAuth = false,
  isFormData = false,
}) => {
  try {
    const headers = {};

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (requiresAuth) {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers["x-authorization-token"] = `${token}`;
      }
    }

    const response = await fetch(endpoint, {
      method,
      headers,
      body: data ? (isFormData ? data : JSON.stringify(data)) : null,
    });

    const result = await response.json();
    if (!response.ok) {
      // Throw the specific message from the backend if available
      throw new Error(result.message || result.error || "API request failed");
    }
    return result;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]`, error);
    throw error;
  }
};
