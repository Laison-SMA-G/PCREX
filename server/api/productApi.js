// api/productApi.js
const BASE_URL = "https://Mobile-application-2.onrender.com/api/products";

export const fetchProducts = async () => {
  const res = await fetch(BASE_URL);
  const data = await res.json();
  return data;
};
