import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Order.css";

interface Order {
  id: string;
  name: string;
  roomNumber: string;
  time: string;
  quantity: number;
  finalPrice: number;
  buyerId: string;
  sellerId: string;
  createdAt: any;
}

export default function OrderManagement() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [room, setRoom] = useState("");
  const [, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchOrders = async () => {
      setLoading(true);

      try {
        const ordersRef = collection(db, "orders");

        const q = query(
          ordersRef,
          where("buyerId", "==", currentUser.uid) // Orders where user is a buyer
        );

        const q2 = query(
          ordersRef,
          where("sellerId", "==", currentUser.uid) // Orders where user is a seller
        );

        const [buyerOrdersSnapshot, sellerOrdersSnapshot] = await Promise.all([
          getDocs(q),
          getDocs(q2),
        ]);

        const buyerOrders = buyerOrdersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        const sellerOrders = sellerOrdersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        // Combine and sort by createdAt (newest first)
        const allOrders = [...buyerOrders, ...sellerOrders].sort(
          (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
        );

        setOrders(allOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const handleUpdate = async () => {
    if (!selectedOrder) return;

    await updateDoc(doc(db, "orders", selectedOrder.id), {
      status,
      grade,
      section,
      room,
    });

    setOrders(
      orders.map((order) =>
        order.id === selectedOrder.id
          ? { ...order, status, grade, section, room }
          : order
      )
    );

    setSelectedOrder(null);
    setStatus("");
    setGrade("");
    setSection("");
    setRoom("");
  };

  return (
    <div className="container mt-4">
      <h2>Order Management</h2>

      {/* Orders Table */}
      <div className="overflow-x-scroll">
        <table className="table">
          <thead>
            <tr>
              <th
                style={{
                  fontSize: "clamp(10px, 2.5vw, 18px)",
                }}
              >
                Item
              </th>
              <th
                style={{
                  fontSize: "clamp(10px, 2.5vw, 18px)",
                }}
              >
                Price
              </th>
              <th
                style={{
                  fontSize: "clamp(10px, 2.5vw, 18px)",
                }}
              >
                Quantity
              </th>
              <th
                style={{
                  fontSize: "clamp(10px, 2.5vw, 18px)",
                }}
              >
                Status
              </th>
              <th
                style={{
                  fontSize: "clamp(10px, 2.5vw, 18px)",
                }}
              >
                Grade
              </th>
              <th
                style={{
                  fontSize: "clamp(10px, 2.5vw, 18px)",
                }}
              >
                Section
              </th>
              <th
                style={{
                  fontSize: "clamp(10px, 2.5vw, 18px)",
                }}
              >
                Room
              </th>
              <th
                style={{
                  fontSize: "clamp(10px, 2.5vw, 18px)",
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td
                  style={{
                    fontSize: "clamp(10px, 2.5vw, 18px)",
                  }}
                >
                  {order.item}
                </td>
                <td
                  style={{
                    fontSize: "clamp(10px, 2.5vw, 18px)",
                  }}
                >
                  ₱{order.finalPrice.toFixed(2)}
                </td>
                <td
                  style={{
                    fontSize: "clamp(10px, 2.5vw, 18px)",
                  }}
                >
                  {order.quantity}
                </td>
                <td
                  style={{
                    fontSize: "clamp(10px, 2.5vw, 18px)",
                  }}
                >
                  {order.status}
                </td>
                <td
                  style={{
                    fontSize: "clamp(10px, 2.5vw, 18px)",
                  }}
                >
                  {order.grade || "N/A"}
                </td>
                <td
                  style={{
                    fontSize: "clamp(10px, 2.5vw, 18px)",
                  }}
                >
                  {order.section || "N/A"}
                </td>
                <td
                  style={{
                    fontSize: "clamp(10px, 2.5vw, 18px)",
                  }}
                >
                  {order.roomNumber || "N/A"}
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => {
                      setSelectedOrder(order);
                      setStatus(order.status);
                      setGrade(order.grade || "");
                      setSection(order.section || "");
                      setRoom(order.room || "");
                    }}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Update Order Section */}
      {selectedOrder && (
        <div className="mt-4">
          <h3>Update Order</h3>
          <div className="mb-2">
            <label>Status:</label>
            <select
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
          <div className="mb-2">
            <label>Grade:</label>
            <input
              type="text"
              className="form-control"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label>Section:</label>
            <input
              type="text"
              className="form-control"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label>Room:</label>
            <input
              type="text"
              className="form-control"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleUpdate}>
            Update Status
          </button>
        </div>
      )}
    </div>
  );
}
