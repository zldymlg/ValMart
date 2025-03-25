import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Transaction.css";
import {
  collection,
  query,
  doc,
  onSnapshot,
  getDocs,
  updateDoc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type Transaction = {
  id: string;
  buyerId: string;
  createdAt: string;
  finalPrice: number;
  itemId: string;
  price: number;
  quantity: number;
  meetingPl: string;
  sellerId: string;
  status: string;
  time: string;
};

type Item = {
  id: string;
  item: string;
  category: string;
  contact: string;
  createdAt: string;
  gradeSection: string;
  imageUrl: string;
  price: number;
  productName: string;
  stocks: number;
  userId: string;
  img: string;
  status: string;
};

type User = {
  id: string;
  grade: string;
  section: string;
  name: string;
};

type MergedData = Transaction &
  Partial<Item> &
  Partial<User> & { uniqueId: string };

export default function Transaction() {
  const [selectedCategory, setSelectedCategory] = useState("Orders");
  const [orders, setOrders] = useState<MergedData[]>([]);

  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [itemsData, setItemsData] = useState<Record<string, Item>>({});
  const [usersData, setUsersData] = useState<Record<string, User>>({});
  const [showModal, setShowModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<MergedData | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsSnapshot = await getDocs(collection(db, "items"));
        const usersSnapshot = await getDocs(collection(db, "users"));

        const items = itemsSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data() as Item;
          acc[doc.id] = data;
          return acc;
        }, {} as Record<string, Item>);

        const users = usersSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data() as User;
          acc[doc.id] = data;
          return acc;
        }, {} as Record<string, User>);

        setItemsData(items);
        setUsersData(users);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data. Please try again later.");
        setLoading(false);
      }
    };

    const subscribeToOrders = async () => {
      if (!currentUserId) return;

      const buyerQuery = query(collection(db, `users/${currentUserId}/orders`));
      const sellerQuery = query(
        collection(db, `users/${currentUserId}/Seller`)
      );

      const unsubscribeBuyer = onSnapshot(
        buyerQuery,
        (snapshot) => {
          const buyerOrders = snapshot.docs.map((doc) => ({
            id: doc.id,
            buyerId: doc.data().buyerId,
            createdAt: doc.data().createdAt,
            finalPrice: doc.data().finalPrice,
            itemId: doc.data().itemId,
            item: doc.data().item,
            price: doc.data().price,
            quantity: doc.data().quantity,
            meetingPl: doc.data().meetingPl,
            sellerId: doc.data().sellerId,
            status: doc.data().status,
            time: doc.data().time,
            img: doc.data().img,
          }));
          setOrders((prevOrders) => mergeData([...prevOrders, ...buyerOrders]));
          setLoading(false);
        },
        (error) => {
          console.error("Error subscribing to buyer orders:", error);
          setError("Error loading purchases. Please try again later.");
          setLoading(false);
        }
      );

      const unsubscribeSeller = onSnapshot(
        sellerQuery,
        (snapshot) => {
          const sellerOrders = snapshot.docs.map((doc) => ({
            id: doc.id,
            buyerId: doc.data().buyerId,
            createdAt: doc.data().createdAt,
            finalPrice: doc.data().finalPrice,
            itemId: doc.data().itemId,
            item: doc.data().item,
            price: doc.data().price,
            quantity: doc.data().quantity,
            meetingPl: doc.data().meetingPl,
            sellerId: doc.data().sellerId,
            status: doc.data().status,
            time: doc.data().time,
            img: doc.data().img,
          }));
          setOrders((prevOrders) =>
            mergeData([...prevOrders, ...sellerOrders])
          );
          setLoading(false);
        },
        (error) => {
          console.error("Error subscribing to seller orders:", error);
          setError("Error loading sold items. Please try again later.");
          setLoading(false);
        }
      );

      return () => {
        unsubscribeBuyer();
        unsubscribeSeller();
      };
    };

    if (currentUserId) {
      setLoading(true);
      fetchData().then(() => subscribeToOrders());
    } else {
      setLoading(false);
    }
  }, [currentUserId]);

  const mergeData = (orders: Transaction[]): MergedData[] => {
    console.log("Orders received:", orders);

    return orders.map((order, index) => {
      console.log("Processing order:", order);

      const item = itemsData[order.itemId];
      const user = usersData[order.buyerId] || usersData[order.sellerId];

      const uniqueId = `${order.id || "noId"}-${
        order.buyerId || order.sellerId || "unknown"
      }-${index}`;
      console.log("Generated uniqueId:", uniqueId);

      return {
        ...order,
        ...(item || {}),
        productName: item?.productName || "Unknown Product",
        imageUrl: item?.imageUrl || "/placeholder.jpg",
        status: order.status,
        ...(user || {}),
        name: user?.name || "Unknown User",
        uniqueId,
      };
    });
  };

  const handleCancelOrder = (order: MergedData) => {
    setOrderToCancel(order);
    setShowModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel?.buyerId || !orderToCancel?.sellerId) {
      setError("Invalid order data.");
      setShowModal(false);
      return;
    }

    console.log("Attempting to cancel order:", orderToCancel);

    try {
      const buyerQuerySnapshot = await getDocs(
        query(
          collection(db, `users/${orderToCancel.buyerId}/orders`),
          where("item", "==", orderToCancel.item),
          where("finalPrice", "==", orderToCancel.finalPrice),
          where("sellerId", "==", orderToCancel.sellerId),
          where("time", "==", orderToCancel.time)
        )
      );

      if (buyerQuerySnapshot.empty) {
        console.error("❌ Buyer order document not found!");
        setError("Buyer order not found.");
        return;
      }

      const buyerOrderDoc = buyerQuerySnapshot.docs[0];
      const buyerOrderRef = doc(
        db,
        `users/${orderToCancel.buyerId}/orders/${buyerOrderDoc.id}`
      );

      const sellerQuerySnapshot = await getDocs(
        query(
          collection(db, `users/${orderToCancel.sellerId}/Seller`),
          where("item", "==", orderToCancel.item),
          where("finalPrice", "==", orderToCancel.finalPrice),
          where("buyerId", "==", orderToCancel.buyerId),
          where("time", "==", orderToCancel.time)
        )
      );

      if (sellerQuerySnapshot.empty) {
        console.error("❌ Seller order document not found!");
        setError("Seller order not found.");
        return;
      }

      const sellerOrderDoc = sellerQuerySnapshot.docs[0]; // First match
      const sellerOrderRef = doc(
        db,
        `users/${orderToCancel.sellerId}/Seller/${sellerOrderDoc.id}`
      );

      // **Step 3: Update Both Documents**
      await Promise.all([
        updateDoc(buyerOrderRef, { status: "Cancelled" }),
        updateDoc(sellerOrderRef, { status: "Cancelled" }),
      ]);

      console.log("✅ Order successfully cancelled:", {
        buyerOrderId: buyerOrderDoc.id,
        sellerOrderId: sellerOrderDoc.id,
      });
      setNotification("Order cancelled successfully.");
    } catch (error) {
      console.error("🔥 Error cancelling order:", error);
      setError("Failed to cancel order. Please try again.");
    } finally {
      setShowModal(false);
    }
  };

  const handleCancelModalClose = () => {
    setShowModal(false);
    setOrderToCancel(null);
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const getTransactions = orders.filter((order) => {
    if (!order.status) return false;
    const isBuyer = order.buyerId === currentUserId;
    const isSeller = order.sellerId === currentUserId;

    if (selectedCategory === "Orders")
      return (isBuyer || isSeller) && order.status === "Pending";
    if (selectedCategory === "Purchases")
      return isBuyer && order.status === "Completed";
    if (selectedCategory === "Items Sold")
      return isSeller && order.status === "Completed";
    return false;
  });

  if (loading) {
    return <div className="text-center mt-5">Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>;
  }

  return (
    <div className="transaction-container p-0 m-0">
      <div className="transaction-header d-flex justify-content-between align-items-center mb-4 px-3">
        <h3>Transactions</h3>
        <select
          className="transaction-dropdown form-select w-auto"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="Orders">Orders</option>
          <option value="Purchases">Purchases</option>
          <option value="Items Sold">Items Sold</option>
        </select>
      </div>

      <div className="transaction-list container-fluid d-flex flex-column gap-3">
        {getTransactions.map((item) => (
          <div
            key={item.uniqueId}
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
            <img
              src={item.img}
              alt={item.itemId}
              className="item-image"
              style={{
                width: "clamp(20px, 10vw, 150px)",
                height: "clamp(20px, 10vw, 150px)",
                objectFit: "cover",
                borderRadius: "8px",
                flexShrink: 0,
              }}
            />
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
                {item.item}
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
            <div
              className="transaction-status d-flex flex-column align-items-start"
              style={{ minWidth: "100px", marginLeft: "1rem" }}
            >
              <span
                className="status-badge mb-0 mb-md-2 mt-sm-2"
                style={{
                  backgroundColor:
                    item.status === "Waiting for the item"
                      ? "#ffc107"
                      : item.status === "Delivered"
                      ? "#28a745"
                      : item.status === "Cancelled"
                      ? "#dc3545"
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
                  onClick={() => handleCancelOrder(item)}
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

      {notification && (
        <div
          className="alert alert-info alert-dismissible fade show mt-3"
          role="alert"
        >
          {notification}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={dismissNotification}
          />
        </div>
      )}

      {showModal && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Cancellation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelModalClose}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to cancel this order?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelModalClose}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmCancel}
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
