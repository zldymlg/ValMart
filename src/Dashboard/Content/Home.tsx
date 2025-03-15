import React, { useEffect, useState } from "react";
import { FaStore, FaBook, FaFlask, FaTools, FaEllipsisH } from "react-icons/fa";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Imageswiper from "./Asset/Swiper1.png";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";

interface Product {
  id: string;
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

// Define ProductCard component
const ProductCard = ({ children }: { children: React.ReactNode }) => (
  <div className="product-card">{children}</div>
);

// Define ProductImg component
const ProductImg = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="product-img" />
);

function Content() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "items"));
      const productList: Product[] = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const productData = docSnapshot.data() as Product;

          const userDoc = await getDoc(doc(db, "users", productData.userId));
          const sellerName = userDoc.exists()
            ? userDoc.data().username || "Unknown Seller" // Fetch username instead of fullName
            : "Unknown Seller";

          return { uid: docSnapshot.id, ...productData, sellerName };
        })
      );

      setProducts(productList);
    };

    fetchProducts();
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <React.Fragment>
      <style>{`
        .swiper-parent {
          width: clamp(200px, 100%, 100%);
          height: 15rem;
          background-color: #C11818;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .swiper-container {
          width: 100%;
          height: 100%;
          background-color: white;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .swiper-wrapper {
       display: flex;
  align-items: flex-end;=
  justify-content: center;
  width: 100%;
  text-align: center;
  height: 100%;
        }
        .swiper-slide {
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.5s ease-in-out, visibility 0.5s;
        }
        .swiper-slide-active {
          visibility: visible;
          opacity: 1;
        }
        .swiper-slide img {
          max-width: 100%;
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
          height: clamp(20px, 8.3vh, 93px);
          width: clamp(150px, 20vw, 600px);
          max-height: 93px;
          min-height: 30px;
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

      `}</style>
      <div className="align-items-center justify-content-center swiper-parent py-4">
        <div className="w-50 swiper-container">
          <div className="swiper-wrapper">
            <div className="swiper-slide">
              <img src={Imageswiper} className="w-100" />
            </div>
            <div className="swiper-slide">jamir tekla</div>
          </div>
        </div>

        <div className="d-flex flex-column align-items-center container-announcement p-3">
          <div className="containerA top d-flex align-items-center justify-content-center pt-3 pb-2 px-5 mb-2">
            <p className="fs-5 mb-0 text-start">
              Sell your <br /> products here!
            </p>
            <FaStore className="icon-announce text-white ms-3" />
          </div>
          <div className="containerA bottom d-flex align-items-center justify-content-center pt-3 pb-2 px-5">
            <FaStore className="icon-announce text-white me-3" />
            <p className="fs-5 mb-0 text-start">
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

      <div className="d-flex flex-wrap justify-content-center mt-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.uid || product.id}
              style={{}}
              onClick={() => handleProductClick(product)}
            >
              <ProductCard>
                <ProductImg
                  src={product.imageUrl || "/placeholder.jpg"}
                  alt={product.productName || "Product Image"}
                />
                <div className="product-details">
                  <h5>{product.productName || "Untitled Product"}</h5>
                  <p className="text-danger fw-bold">₱{product.price || 0}</p>
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
          <p className="text-center">No products available in this category.</p>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content p-4 shadow-lg"
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
                      height: "auto",
                    }}
                  />
                </div>

                {/* Product Details */}
                <div
                  className="flex-items w-100"
                  style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    flexBasis: "auto",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <h1 className="product-title m-0" style={{}}>
                      {selectedProduct.productName}
                    </h1>
                  </div>

                  <hr className="my-2" />

                  <p className="product-price fs-5 fw-bold">
                    ₱{selectedProduct.price.toLocaleString()}
                  </p>
                  <p>
                    <strong>Seller:</strong> {selectedProduct.sellerName}
                  </p>
                  <p>
                    <strong>Grade Section:</strong>{" "}
                    {selectedProduct.gradeSection}
                  </p>
                  <p>
                    <strong>Contact:</strong>{" "}
                    <a
                      href={selectedProduct.contact}
                      style={{
                        textDecoration: "none",
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

                  {/* Button Group */}
                  <div className="d-flex gap-3 mt-3">
                    <button className="btn btn-success">Buy Now</button>
                    <button
                      className="btn btn-danger"
                      onClick={handleCloseModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

export default Content;
