import fetch from "node-fetch"; // npm i node-fetch@3

const BASE_URL = "https://mobile-application-2.onrender.com/api"; // centralized server URL

async function testAPI() {
  try {
    console.log("🟢 Testing centralized server...");

    // 1️⃣ GET all products
    const productsRes = await fetch(`${BASE_URL}/products`);
    const products = await productsRes.json();
    console.log(`✅ GET /products → ${products.length} products`);

    // 2️⃣ Add a test product
    const formData = new FormData();
    formData.append("name", "Test Product");
    formData.append("description", "This is a test product");
    formData.append("price", "100");
    formData.append("quantity", "5");
    formData.append("category", "Others");

    const addRes = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      body: formData,
    });

    if (addRes.ok) {
      const newProduct = await addRes.json();
      console.log(`✅ POST /products → added product ID: ${newProduct._id}`);

      // 3️⃣ Edit product
      const editRes = await fetch(`${BASE_URL}/products/edit/${newProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: 150 }),
      });
      console.log(`✅ PUT /products/edit → status: ${editRes.status}`);

      // 4️⃣ Delete product
      const deleteRes = await fetch(`${BASE_URL}/products/${newProduct._id}`, {
        method: "DELETE",
      });
      console.log(`✅ DELETE /products → status: ${deleteRes.status}`);
    } else {
      console.log("⚠️ Could not add test product. Check server logs.");
    }

    console.log("🟢 All tests completed");
  } catch (err) {
    console.error("❌ Test failed:", err.message);
  }
}

testAPI();
