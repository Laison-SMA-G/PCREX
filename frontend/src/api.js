const BASE_URL = "https://Mobile-application-2.onrender.com/api";

async function request(method, endpoint, data = null) {
  const token = localStorage.getItem("pcrex_token");
  const isFormData = data instanceof FormData;

  const requestOptions = {
    method,
    headers: isFormData
      ? token ? { Authorization: `Bearer ${token}` } : {}
      : { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: data ? (isFormData ? data : JSON.stringify(data)) : null,
  };

  const fullUrl = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  console.log(`Making ${method} request to: ${fullUrl}`);

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
}

export const api = {
  get: (endpoint) => request("get", endpoint),
  post: (endpoint, data) => request("post", endpoint, data),
  put: (endpoint, data) => request("put", endpoint, data),
  delete: (endpoint) => request("delete", endpoint),
};

export default api;
