const BASE_URL = 'http://127.0.0.1:5175/api';

async function request(method, endpoint, data = null) {
  const isFormData = data instanceof FormData;
  const requestOptions = {
    method,
    headers: isFormData ? {} : { "Content-Type": "application/json" },
    body: isFormData ? data : data ? JSON.stringify(data) : null,
  };

  const fullUrl = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  console.log(`Making ${method} request to: ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, requestOptions);
    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = res.statusText;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(`API Error ${res.status}: ${errorMessage}`);
    }
    return await res.json();
  } catch (err) {
    console.error("Fetch error in api.js:", err);
    throw err;
  }
}

export const api = {
  get: (endpoint) => request("get", endpoint),
  post: (endpoint, data) => request("post", endpoint, data),
  put: (endpoint, data) => request("put", endpoint, data),
  delete: (endpoint) => request("delete", endpoint),
};

export default api;