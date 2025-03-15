import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, updateDoc, doc, getDocs } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";

export default function OrderManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(db, "orders"));
      setOrders(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };
    fetchOrders();
  }, []);

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
      <table className="table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Grade</th>
            <th>Section</th>
            <th>Room</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.itemName}</td>
              <td>${order.price}</td>
              <td>{order.quantity}</td>
              <td>{order.status}</td>
              <td>{order.grade || "N/A"}</td>
              <td>{order.section || "N/A"}</td>
              <td>{order.room || "N/A"}</td>
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
