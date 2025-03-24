import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Order.css";
import moment from "moment";
import { Modal, Button } from "react-bootstrap";

interface Order {
  id: string;
  meetingPlace: string;
  time: string;
  quantity: number;
  finalPrice: number;
  buyerId: string;
  sellerId: string;
  createdAt: Timestamp;
  status: string;
  item: string;
  buyerName: string;
  sellerName: string;
  gradeLevel?: string;
  section?: string;
}

export default function OrderManagement() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [section, setSection] = useState("");
  const [meetingPlace, setMeetingPlace] = useState("");
  const [time, setTime] = useState("");
  const [show, setShow] = useState(false);
  const [, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchSellerOrders();
    }
  }, [currentUser]);

  const fetchSellerOrders = async () => {
    setLoading(true);
    try {
      const ordersRef = collection(db, "users", currentUser!.uid, "Seller");
      const ordersSnapshot = await getDocs(ordersRef);

      const orderList: Order[] = [];

      for (const docSnap of ordersSnapshot.docs) {
        const orderData = docSnap.data() as Order;
        const buyerId = orderData.buyerId;

        let buyerDetails = {
          buyerName: "Unknown",
          gradeLevel: "N/A",
          section: "N/A",
        };

        if (buyerId) {
          try {
            const buyerRef = doc(db, "users", buyerId);
            const buyerSnap = await getDoc(buyerRef);

            if (buyerSnap.exists()) {
              const buyerData = buyerSnap.data();
              buyerDetails = {
                buyerName: buyerData.username || "Unknown",
                gradeLevel: buyerData.gradeLevel || "N/A",
                section: buyerData.section || "N/A",
              };
            }
          } catch (err) {
            console.error(`Error fetching buyer details for ${buyerId}:`, err);
          }
        }

        orderList.push({
          ...orderData,
          id: docSnap.id,
          ...buyerDetails,
        });
      }

      setOrders(orderList);
    } catch (error) {
      console.error("Error fetching seller orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setSelectedOrder(null);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setGradeLevel(order.gradeLevel || "");
    setSection(order.section || "");
    setMeetingPlace(order.meetingPlace || "");
    setTime(order.time ? moment(order.time).format("YYYY-MM-DDTHH:mm") : "");
    handleShow();
  };

  const handleUpdate = async () => {
    if (!selectedOrder || !currentUser) return;

    try {
      const orderRef = doc(
        db,
        "users",
        currentUser.uid,
        "Seller",
        selectedOrder.id
      );

      if (status === "Canceled") {
        await deleteDoc(orderRef);
        setOrders((prevOrders) =>
          prevOrders.filter((o) => o.id !== selectedOrder.id)
        );
        handleClose();
        alert("Order canceled successfully."); //User feedback
      } else {
        await updateDoc(orderRef, {
          status,
          gradeLevel,
          section,
          meetingPlace,
          time,
        });

        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === selectedOrder.id
              ? { ...o, status, gradeLevel, section, meetingPlace, time }
              : o
          )
        );
        handleClose();
        alert("Order updated successfully."); //User feedback
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order. Please try again later."); //User feedback
    }
  };

  return (
    <div className="container mt-4">
      <h2>Order Management</h2>
      <div className="overflow-x-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Buyer</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Grade</th>
              <th>Section</th>
              <th>Meeting Place</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.item}</td>
                <td>{order.buyerName}</td>
                <td>₱{order.finalPrice.toFixed(2)}</td>
                <td>{order.quantity}</td>
                <td>{order.status}</td>
                <td>{order.gradeLevel || "N/A"}</td>
                <td>{order.section || "N/A"}</td>
                <td>{order.meetingPlace || "N/A"}</td>
                <td>
                  {order.time
                    ? moment(order.time).format("MMMM Do YYYY, hh:mm A")
                    : "N/A"}
                </td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleViewDetails(order)}
                  >
                    Update
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
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
            <label>Meeting Place:</label>
            <input
              type="text"
              className="form-control"
              value={meetingPlace}
              onChange={(e) => setMeetingPlace(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label>Time:</label>
            <input
              type="datetime-local"
              className="form-control"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
