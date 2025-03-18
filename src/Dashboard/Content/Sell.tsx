import { useState } from "react";
import { motion } from "framer-motion";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { supabase } from "./supabaseClient";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SellItemForm.css";

export default function SellItemForm() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [gradeSection, setGradeSection] = useState("");
  const [contact, setContact] = useState("");
  const [stocks, setStocks] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const preventNegative = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-" || e.key === "e") {
      e.preventDefault();
    }
  };
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

      if (parseInt(stocks) <= 0) {
        throw new Error("Stocks must be greater than 0.");
      }

      const imageUrl = await handleImageUpload();
      if (!imageUrl) throw new Error("Image upload failed.");

      await addDoc(collection(db, "items"), {
        userId: user.uid,
        productName,
        description,
        price: parseFloat(price),
        category,
        gradeSection,
        contact,
        stocks: parseInt(stocks),
        imageUrl,
        createdAt: serverTimestamp(),
      });

      alert("Item listed successfully!");

      setProductName("");
      setPrice("");
      setDescription("");
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
    <motion.div
      className="sell-item-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3
        className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Sell your items
      </motion.h3>
      <motion.form
        onSubmit={handleSubmit}
        className="sell-form justify-content-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="d-flex flex-column flex-md-row w-100 justify-content-center">
          <div
            className="m-0 ms-lg-5 d-flex flex-column justify-content-center align-items-start w-100"
            style={{
              width: "50%",
            }}
          >
            <div className="form-group">
              <label>Product Name:</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                style={{
                  width: "clamp(250px, 30vw, 450px)",
                  height: "auto",
                }}
              />
            </div>
            <div className="form-group">
              <label>Product Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{
                  width: "clamp(250px, 30vw, 450px)",
                  height: "auto",
                  minHeight: "90px",
                  resize: "vertical",
                  padding: "8px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                style={{
                  width: "clamp(250px, 30vw, 450px)",
                  height: "auto",
                }}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyDown={(e) => preventNegative(e)}
                min="1"
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
                style={{
                  width: "clamp(250px, 30vw, 450px)",
                  height: "auto",
                }}
              />
            </div>
          </div>
          <div
            className="ms-0 ms-lg-4 d-flex flex-column justify-content-center align-items-start  w-100"
            style={{
              width: "50%",
            }}
          >
            <div className="form-group">
              <label>Social Media Link:</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                style={{
                  width: "clamp(250px, 30vw, 450px)",
                  height: "auto",
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label fw-bold">Category:</label>
              <select
                className="form-select border-primary shadow-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                style={{
                  width: "clamp(250px, 30vw, 450px)",
                  height: "auto",
                }}
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
                style={{
                  width: "clamp(250px, 30vw, 450px)",
                  height: "auto",
                }}
              />
            </div>
            <motion.div
              className="form-group image-upload justify-content-start align-items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{
                width: "clamp(250px, 30vw, 450px)",
                height: "auto",
              }}
            >
              <label>Insert Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              {imagePreview && (
                <motion.img
                  src={imagePreview}
                  alt="Preview"
                  className="image-fluid rounded"
                  style={{
                    maxWidth: "30vw",
                    minWidth: "20vw",
                    paddingTop: "30px",
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </motion.div>
            <div className="button-group align-self-end me-lg-5">
              <motion.button
                type="submit"
                className="sell-btn"
                disabled={loading}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? "Uploading..." : "Sell"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.form>
    </motion.div>
  );
}
