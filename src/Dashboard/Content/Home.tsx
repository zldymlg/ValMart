import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import { FaStore, FaBook, FaFlask, FaTools, FaEllipsisH } from "react-icons/fa";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import Imageswiper from "./Asset/Swiper1.png";
import Imageswiper1 from "./Asset/Swiper2.png";
import Imageswiper2 from "./Asset/Swiper3.png";
import { db } from "../firebase";

import { Modal, Button } from "react-bootstrap";

interface Product {
  id: string;
  description: string;
  category: string;
  contact: string;
  createdAt: string;
  gradeSection: string;
  imageUrl: string;
  price: number;
  productName: string;
  studentId: string;
  userId: string;
  sellerName?: string;
  uid?: string;
}

const ProductCard = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    className="product-card"
    style={{
      boxShadow: "0 4px 8px rgba(43, 38, 38, 0.5)",
      borderRadius: "10px",
    }}
    whileHover={{ scale: 1.02 }} // Hover animation
    transition={{ type: "spring", stiffness: 100 }} // Spring transition
  >
    {children}
  </motion.div>
);

const ProductImg = ({ src, alt }: { src: string; alt: string }) => (
  <img
    src={src}
    alt={alt}
    className="product-img"
    style={{ objectFit: "cover" }}
  />
);

function Content() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [show, setShow] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // Add searchQuery state

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const [order, setOrder] = useState({
    roomNumber: "",
    time: "",
    quantity: 1,
    price: 0,
    finalPrice: 0,
    status: "Pending",
    item: "",
  });
  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setOrder((prevOrder) => ({
      ...prevOrder,
      [name]: value,
    }));
  };

  const finalizeOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert("No product selected.");
      return;
    }

    const finalPrice = selectedProduct.price * order.quantity;

    const orderData = {
      ...order,
      finalPrice, // Updated Final Price Calculation
      buyerId: currentUser?.uid,
      sellerId: selectedProduct?.userId,
      item: selectedProduct?.productName,
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, "orders"), orderData);
      alert("Order successfully submitted!");
      setOrder({
        roomNumber: "",
        time: "",
        quantity: 1,
        price: 0,
        finalPrice: 0,
        status: "",
        item: "",
      });
      setShow(false); // Close the modal after successful submission
    } catch (error) {
      console.error("Error adding order:", error);
      alert("Failed to submit order. Please try again.");
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === "All" || product.category === selectedCategory)
  );

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "items"));
      const productList: Product[] = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const productData = docSnapshot.data() as Product;
          const userDoc = await getDoc(doc(db, "users", productData.userId));
          const sellerName = userDoc.exists()
            ? userDoc.data().username || "Unknown Seller"
            : "Unknown Seller";
          return { uid: docSnapshot.id, ...productData, sellerName };
        })
      );
      setProducts(productList);
    };

    fetchProducts();
  }, []);

  return (
    <React.Fragment>
      <style>{`
        .swiper-parent {
          width: clamp(200px, 100%, 100%);
          height: clamp(200px, 15rem, 300px);
          background-color: #C11818;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .top,
        .bottom {
          width: 100%;
          height: 90px;
          color: #fffefe;
          font-weight: bold;
          font-style: Inter;
          text-align: center;
        }
        .top {
          background-color: #e15555;
        }
        .bottom {
          background-color: #ff9797;
        }
        .container-announcement {
          /* Removed unnecessary styles */
        }
        .containerA {
          height:8.3vh
          width: clamp(150px, 20vw, 600px);
          max-height: 93px;
          min-height: 50px;
        }
        .icon-announce {
          font-size: clamp(32px, 6vw, 54px);
          min-width: 22px;
        }
        .category-button {
          padding: 8px 12px;
          font-size: clamp(9px, 1.5vw, 13px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: clamp(100px, 10vw, 140px);
          min-width: 100px;
          max-width: 160px;
          border: 1px solid #ccc;
          border-radius: 6px;
          background-color: #f8f9fa;
          transition: background-color 0.2s ease-in-out;
          margin: 4px;
        }
        .category-button.selected {
          background-color: #c11818;
          color: white;
        }
        .category-button.selected svg {
          color: white;
        }
        .product-card {
          width: 18rem;
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
          margin: 1rem;
          cursor: pointer;
        }
        .product-img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }
        .product-details {
          padding: 10px;
        }
        .seller-info {
          margin-top: 8px;
          font-size: 0.9rem;
          color: gray;
        }
        .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  text-align: center;
  position: relative;
  animation: fadeIn 0.3s ease-in-out;
}

.product-img {
  width: 100%;
  max-height: 250px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.product-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.product-price {
  font-size: 22px;
  font-weight: bold;
  color: #ff5722;
  margin-bottom: 10px;
}

.btn-group {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-buy {
  background-color: #ff5722;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  flex: 1;
}

.btn-close {
  background-color: #ccc;
  color: black;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  flex: 1;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 18px;
  cursor: pointer;
  background: none;
  border: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }

}

@media (max-width: 766px) {
  .swiper-parent {
          height: 25vh
        }
  .containerA{
        height:10vh
  }        
  .product-card{
        width:10rem;
        height:17rem
  }      
  .product-img {
        width: 100%;
        height: 130px;
  }
  .product-title {
      font-size: 15px;
      }      
  .product-price{
        font-size:13px;
  }.seller-info{
        font-size:11px;
  }   
}

.order-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
  @media (max-width: 320px) {
  .swiper-parent {
          height: 5vh
        }
  .containerA{
        height:10vh
  }        
  .product-card{
        width:10rem;
        height:17rem
  }      
  .product-img {
        width: 100%;
        height: 130px;
  }
  .product-title {
      font-size: 15px;
      }      
  .product-price{
        font-size:13px;
  }.seller-info{
        font-size:11px;
  }   
}

.order-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}



.order-btn {
  background: linear-gradient(135deg, #c11818, #ff4b4b);
  color: white;
  font-size: 18px;
  padding: 12px 25px;
  border: none;
  border-radius: 12px;
  box-shadow: 0px 6px 20px rgba(193, 24, 24, 0.5);
  transition: all 0.3s ease;
}

.order-btn:hover {
  background: linear-gradient(135deg, #a31414, #ff2e2e);
  transform: translateY(-3px);
  box-shadow: 0px 10px 25px rgba(193, 24, 24, 0.6);
}


.custom-modal .modal-header {
  background: rgba(193, 24, 24, 0.9);
  color: white;
  text-align: center;
  padding: 20px;
  border-radius: 12px 12px 0 0;
}

.modal-title {
  font-size: 26px;
  font-weight: bold;
}

.modal-body {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
}


.form-group {
  position: relative;
  margin-bottom: 25px;
   width: 100%;
}

.floating-input {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  box-shadow: inset 0px 3px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.floating-input:focus {
  outline: none;
  box-shadow: 0px 0px 10px rgba(193, 24, 24, 0.5);
}

.floating-label {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  font-size: 16px;
  color: #555;
  transition: all 0.3s ease;
  pointer-events: none;
}

.floating-input:focus + .floating-label,
.floating-input:not(:placeholder-shown) + .floating-label {
  top: 8px;
  font-size: 12px;
  color: #c11818;
}

.price-group {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: bold;
  color: #c11818;
}

.price-group span {
  font-size: 20px;
  color: #333;
}

/* 📦 Modal Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border-top: 1px solid #eee;
}

/* 🌟 Animation */
@keyframes popUp {
  0% {
    transform: scale(1);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.custom-modal {
  animation: popUp 0.3s ease-in-out;
}

  
@media (max-width: 425px) {
  .swiper-parent {
          height: 20vh
        }
  .product-card{
        width:10rem;
        height:13rem
  }      
}        

      `}</style>
      <div className="align-items-center justify-content-center swiper-parent py-4 w-100 h-50 ">
        <AnimatePresence mode="wait">
          <div className="align-items-center justify-content-center swiper-parent px-4 w-100">
            <Swiper
              autoplay={{ delay: 3, disableOnInteraction: false }}
              loop={true}
              className="w-100"
            >
              <SwiperSlide>
                <motion.img
                  src={Imageswiper1}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  style={{
                    height: "clamp(415px, 25vh, 600px)",
                    width: "clamp(100px ,50vw, 200px)",
                  }}
                />
              </SwiperSlide>
              <SwiperSlide>
                <motion.img
                  src={Imageswiper}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </SwiperSlide>
              <SwiperSlide>
                <motion.img
                  src={Imageswiper2}
                  className="w-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </SwiperSlide>
            </Swiper>
          </div>
        </AnimatePresence>
        <div className="d-none d-lg-flex flex-column align-items-center container-announcement p-3">
          <div className="containerA top d-flex align-items-center justify-content-center pt-3 pb-2 px-5 mb-2">
            <p className="fs-5 mb-2 text-start">
              Sell your <br /> products here!
            </p>
            <FaStore className="icon-announce text-white ms-3" />
          </div>
          <div className="containerA bottom d-flex align-items-center justify-content-center pt-3 pb-2 px-5">
            <FaStore className="icon-announce text-white me-3" />
            <p className="fs-5 mb-2 text-start">
              Sell your <br /> products here!
            </p>
          </div>
        </div>
      </div>

      <div className="container mt-3">
        <div className="row row-cols-lg-6 row-cols-sm-3 row-cols-3 g-2 text-start">
          {[
            { name: "All", icon: <FaStore size={20} /> },
            { name: "Stationaries", icon: <FaBook size={20} /> },
            { name: "Papers", icon: <FaBook size={20} /> },
            { name: "Chemicals", icon: <FaFlask size={20} /> },
            { name: "Equipment", icon: <FaTools size={20} /> },
            { name: "Others", icon: <FaEllipsisH size={20} /> },
          ].map(({ name, icon }) => (
            <div key={name} className="col d-flex">
              <button
                className={`category-button ${
                  selectedCategory === name ? "selected" : ""
                }`}
                onClick={() => setSelectedCategory(name)}
              >
                {icon} <span className="ms-2">{name}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <hr></hr>
      <div className="container mt-3">
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="d-flex flex-wrap align-content-start justify-content-center mt-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.uid || product.id}
                onClick={() => handleProductClick(product)}
              >
                <ProductCard>
                  <ProductImg
                    src={product.imageUrl || "/placeholder.jpg"}
                    alt={product.productName || "Product Image"}
                  />
                  <div className="product-details">
                    <p className="product-title">
                      {product.productName || "Untitled Product"}
                    </p>
                    <p className="product-price text-danger fw-bold">
                      ₱{product.price || 0}
                    </p>
                    <p className="seller-info">
                      <strong>Seller:</strong>{" "}
                      {product.sellerName || "Unknown Seller"}
                      <br />
                      <strong>Grade Section:</strong>{" "}
                      {product.gradeSection || "N/A"}
                      <br />
                      <strong>Contact:</strong> {product.contact || "N/A"}
                    </p>
                  </div>
                </ProductCard>
              </div>
            ))
          ) : (
            <p className="text-center">
              No products available in this category.
            </p>
          )}
        </div>
      </div>

      {showModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseModal}
        >
          <motion.div
            className="modal-content p-4 shadow-lg"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "70vw",
              maxWidth: "90vw",
              maxHeight: "80vh",
              backgroundColor: "white",
              borderRadius: "12px",
              overflowY: "auto",
            }}
          >
            {selectedProduct && (
              <div className="d-flex flex-column flex-md-row align-items-start gap-4">
                <div
                  className="flex-items"
                  style={{
                    flexGrow: 2,
                    alignSelf: "flex-start",
                  }}
                >
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.productName}
                    className="img-fluid rounded"
                    style={{
                      maxWidth: "100vh",
                      width: window.innerWidth > 368 ? "60vw" : "100px",
                      maxHeight: "80%",
                    }}
                  />
                </div>

                <div
                  className="flex-items w-100"
                  style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    flexBasis: "auto",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <h1
                      className="product-title m-0"
                      style={{ fontSize: "40px" }}
                    >
                      {selectedProduct.productName}
                    </h1>
                  </div>
                  <p
                    className="product-price fw-bold text-start "
                    style={{
                      fontSize: "25px",
                    }}
                  >
                    ₱{selectedProduct.price.toLocaleString()}
                  </p>

                  <hr className="my-2" />
                  <div className="productDescription text-start fw-bold">
                    Product Description:
                  </div>
                  <div
                    className="text-start"
                    style={{
                      maxHeight: "19vh",
                      minHeight: "40px",
                      width: "19vw",
                      fontSize: "15px",

                      color: "gray",
                      overflowY: "auto",
                      padding: "10px",
                      whiteSpace: "pre-line",
                      wordWrap: "break-word",
                      overflowWrap: "break-word", // Additional safeguard for word wrapping
                    }}
                  >
                    {selectedProduct.description ||
                      "The seller doesn't have a description"}
                  </div>
                  <div className="text-start">
                    <h5>Seller Information</h5>
                    <p>
                      <strong>Seller:</strong>
                      <span style={{ color: "gray" }}>
                        {" "}
                        {selectedProduct.sellerName}
                      </span>
                    </p>
                    <p>
                      <strong>Grade Section:</strong>{" "}
                      <span style={{ color: "gray" }}>
                        {selectedProduct.gradeSection}
                      </span>
                    </p>
                    <p>
                      <strong>Contact:</strong>{" "}
                      <a
                        href={selectedProduct.contact}
                        style={{
                          textDecoration: "none",
                          fontSize: "12px",
                          color: "#007bff",
                          fontWeight: "bold",
                          transition: "all 0.3s ease-in-out",
                          display: "inline-block",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#ff4081";
                          e.currentTarget.style.transform = "scale(0.9)";
                          e.currentTarget.style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#007bff";
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.textDecoration = "none";
                        }}
                      >
                        {selectedProduct.contact}
                      </a>
                    </p>
                  </div>

                  {/* Button Group */}
                  <div className="d-flex gap-3 mt-3 ">
                    <button className="btn btn-success" onClick={handleShow}>
                      Order now
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleCloseModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
                <Modal
                  show={show}
                  className="custom-modal d-flex justify-content-center"
                >
                  <Modal.Header className="modal-header">
                    <h2 className="modal-title">🛒 Place Your Order</h2>
                  </Modal.Header>
                  <form onSubmit={finalizeOrder}>
                    <Modal.Body className="modal-body">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control floating-input"
                          name="roomNumber"
                          value={order.roomNumber}
                          onChange={handleChange}
                          required
                        />
                        <label className="floating-label">Room Number</label>
                      </div>
                      <div className="form-group">
                        <input
                          type="datetime-local"
                          className="form-control floating-input"
                          value={
                            order.time
                              ? new Date(order.time).toISOString().slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            setOrder({ ...order, time: e.target.value })
                          }
                          required
                        />
                        <label className="floating-label">Time</label>
                      </div>
                      <div className="form-group">
                        <input
                          type="number"
                          className="form-control floating-input"
                          name="quantity"
                          value={order.quantity}
                          onChange={handleChange}
                          min="1"
                          required
                        />
                        <label className="floating-label">Quantity</label>
                      </div>
                      <div className="price-group">
                        <p>
                          Price per Item:{" "}
                          <span>₱{selectedProduct?.price || 0}</span>
                        </p>
                        <p>
                          Final Price:{" "}
                          <span>
                            ₱{(selectedProduct?.price || 0) * order.quantity}
                          </span>
                        </p>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button
                        type="submit"
                        className="order-btn"
                        onClick={() => setShow(true)}
                      >
                        ✅ Confirm Order
                      </Button>
                      <Button className="order-btn" onClick={handleClose}>
                        Cancel
                      </Button>
                    </Modal.Footer>
                  </form>
                </Modal>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </React.Fragment>
  );
}

export default Content;
