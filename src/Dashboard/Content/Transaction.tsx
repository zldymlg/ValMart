import { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Ensure this imports your Firestore instance
import "bootstrap/dist/css/bootstrap.min.css";
import "./Transaction.css";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type Transaction = {
  id: string;
  buyerId: string;
  createdAt: string;
  finalPrice: number;
  item: string;
  price: number;
  quantity: number;
  roomNumber: string;
  sellerId: string;
  status: string;
  time: string;
};

type Item = {
  id: string;
  category: string;
  contact: string;
  createdAt: string;
  gradeSection: string;
  imageUrl: string;
  price: number;
  productName: string;
  stocks: number;
  userId: string;
};

type User = {
  id: string;
  grade: string;
  section: string;
  name: string;
};

type MergedData = Transaction & Partial<Item> & Partial<User>;

export default function Transaction() {
  const [selectedCategory, setSelectedCategory] = useState("Orders");
  const [orders, setOrders] = useState<MergedData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOrdersAndItems = async () => {
      setLoading(true);

      try {
        const [ordersSnapshot, itemsSnapshot, usersSnapshot] =
          await Promise.all([
            getDocs(collection(db, "orders")),
            getDocs(collection(db, "items")),
            getDocs(collection(db, "users")),
          ]);

        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[];

        const itemsData = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[];

        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        // Merge data by matching item names
        const mergedData = ordersData.map((order) => {
          const matchedItem = itemsData.find(
            (item) => item.productName === order.item
          );
          const matchedUser = usersData.find(
            (user) => user.id === order.buyerId
          );
          return {
            ...order,
            ...matchedItem,
            ...matchedUser,
          };
        });

        setOrders(mergedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndItems();
  }, []);

  if (loading) {
    return <div className="text-center mt-5">Loading transactions...</div>;
  }

  const getTransactions = orders.filter((order) => {
    if (selectedCategory === "Orders") return true;
    if (selectedCategory === "Purchases")
      return order.buyerId === currentUserId && order.status === "Completed";
    if (selectedCategory === "Items Sold")
      return order.sellerId === currentUserId && order.status === "Completed";
    return false;
  });

  return (
    <div className="transaction-container p-0 m-0">
      {/* Header */}
      <div className="transaction-header d-flex justify-content-between align-items-center mb-4 px-3">
        <h3 className="mb-0">Transactions</h3>
        <select
          className="transaction-dropdown form-select w-auto"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option>Orders</option>
          <option>Purchases</option>
          <option>Items Sold</option>
        </select>
      </div>

      {/* Transaction List */}
      <div className="transaction-list container-fluid d-flex flex-column gap-3">
        {getTransactions.map((item) => (
          <div
            key={item.id}
            className="transaction-card d-flex align-items-center justify-content-between p-3"
            style={{
              width: "clamp(300px, 100%, 800px)",
              margin: "0 auto",
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              minHeight: "110px",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {/* Image */}
            <img
              src={item.imageUrl}
              alt={item.productName}
              className="item-image"
              style={{
                width: "clamp(20px, 10vw, 150px)",
                height: "clamp(20px, 10vw, 150px)",
                objectFit: "cover",
                borderRadius: "8px",
                flexShrink: 0,
              }}
            />

            {/* Item Details */}
            <div
              className="item-details flex-grow-1 ms-3"
              style={{ minWidth: "50px" }}
            >
              <h5
                style={{
                  fontSize: "clamp(0.7rem, 2vw, 1.25rem)",
                  marginBottom: "0.7rem",
                }}
              >
                {item.productName}
              </h5>
              <p
                className="text-danger"
                style={{
                  fontWeight: "bold",
                  fontSize: "clamp(0.6rem, 1.5vw, 1rem)",
                }}
              >
                Price: ₱{item.price.toFixed(2)}
              </p>
            </div>

            {/* Status + Actions */}
            <div
              className="transaction-status d-flex flex-column align-items-start"
              style={{
                minWidth: "100px",
                marginLeft: "1rem",
              }}
            >
              <span
                className="status-badge mb-0 mb-md-2 mt-sm-2"
                style={{
                  backgroundColor:
                    item.status === "Waiting for the item"
                      ? "#ffc107"
                      : item.status === "Delivered"
                      ? "#28a745"
                      : "#007bff",
                  color: "#fff",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "4px",
                  fontSize: "clamp(0.4rem, 1.5vw, 1rem)",
                }}
              >
                {item.status}
              </span>

              {selectedCategory === "Orders" && (
                <button
                  className="cancel-btn btn btn-danger btn-sm mb-2"
                  onClick={() => alert("Cancel action")}
                  style={{
                    fontSize: "clamp(0.5rem, 1.5vw, 1rem)",
                  }}
                >
                  Cancel
                </button>
              )}

              <p
                className="mb-0"
                style={{
                  fontSize: "clamp(0.6rem, 1.5vw, 1rem)",
                  marginTop: "auto",
                }}
              >
                <strong>Total:</strong> {item.quantity}x = ₱
                {item.finalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
