import { useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { supabase } from "./supabaseClient";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SellItemForm.css";

export default function SellItemForm() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [gradeSection, setGradeSection] = useState("");
  const [contact, setContact] = useState("");
  const [stocks, setStocks] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleImageUpload = async () => {
    if (!image) return "";

    const user = auth.currentUser;
    if (!user) return "";

    const filePath = `items/${user.uid}_${Date.now()}_${image.name}`;
    const { error } = await supabase.storage
      .from("Valmart")
      .upload(filePath, image);

    if (error) {
      console.error("Error uploading image to Supabase:", error.message);
      return "";
    }

    return supabase.storage.from("Valmart").getPublicUrl(filePath).data
      .publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in.");

      const imageUrl = await handleImageUpload();
      if (!imageUrl) throw new Error("Image upload failed.");

      await addDoc(collection(db, "items"), {
        userId: user.uid,
        productName,
        price: parseFloat(price),
        category,
        gradeSection,
        contact,
        stocks: parseInt(stocks), // Store number of stocks
        imageUrl,
        createdAt: serverTimestamp(),
      });

      alert("Item listed successfully!");

      setProductName("");
      setPrice("");
      setCategory("");
      setGradeSection("");
      setContact("");
      setStocks("");
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error listing item:", error);
      alert("Failed to list item. Check console for details.");
    }

    setLoading(false);
  };

  return (
    <div className="sell-item-container">
      <h3 className="header">Sell your items</h3>
      <form onSubmit={handleSubmit} className="sell-form">
        <div className="form-group">
          <label>Product Name:</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Grade & Section:</label>
          <input
            type="text"
            value={gradeSection}
            onChange={(e) => setGradeSection(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Social Media Link:</label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label fw-bold">Category:</label>
          <select
            className="form-select border-primary shadow-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Category
            </option>
            <option value="Stationaries">📚 Stationaries</option>
            <option value="Papers">📄 Papers</option>
            <option value="Chemical">🧪 Chemical</option>
            <option value="Equipment">⚙️ Equipment</option>
            <option value="Others">🔍 Others</option>
          </select>
        </div>

        <div className="form-group">
          <label>Number of Stocks:</label>
          <input
            type="number"
            value={stocks}
            onChange={(e) => setStocks(e.target.value)}
            required
          />
        </div>
        <div className="form-group image-upload">
          <label>Insert Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="image-fluid rounded"
              style={{ maxWidth: "30vw", minWidth: "20vw", paddingTop: "30px" }}
            />
          )}
        </div>
        <div className="button-group">
          <button type="submit" className="sell-btn" disabled={loading}>
            {loading ? "Uploading..." : "Sell"}
          </button>
        </div>
      </form>
    </div>
  );
}
