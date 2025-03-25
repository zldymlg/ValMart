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
  query,
  where,
} from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Order.css";
import moment from "moment";
import { Modal, Button } from "react-bootstrap";

interface Order {
  id: string;
  meetingPlace: string;
  time: string | Timestamp;
  quantity: number;
  stocks: number;
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
    setTime(
      order.time instanceof Timestamp
        ? moment(order.time.toDate()).format("YYYY-MM-DDTHH:mm")
        : order.time || ""
    );
    handleShow();
  };

  const handleUpdate = async () => {
    if (!selectedOrder || !currentUser) return;

    try {
      // Reference the seller's order in "Seller"
      const sellerOrderRef = doc(
        db,
        "users",
        currentUser.uid,
        "Seller",
        selectedOrder.id
      );

      // Find the corresponding order in the buyer's "orders" collection
      const buyerOrdersRef = collection(
        db,
        "users",
        selectedOrder.buyerId,
        "orders"
      );
      const buyerOrdersSnapshot = await getDocs(buyerOrdersRef);

      let buyerOrderId = "";
      buyerOrdersSnapshot.forEach((docSnap) => {
        const orderData = docSnap.data();
        if (
          orderData.item === selectedOrder.item &&
          orderData.finalPrice === selectedOrder.finalPrice &&
          orderData.createdAt?.isEqual(selectedOrder.createdAt)
        ) {
          buyerOrderId = docSnap.id;
        }
      });

      if (!buyerOrderId) {
        console.error("Buyer order ID not found.");
        alert("Error: Matching order in Buyer's list not found.");
        return;
      }

      // Reference the buyer's order
      const buyerOrderRef = doc(
        db,
        "users",
        selectedOrder.buyerId,
        "orders",
        buyerOrderId
      );

      // Ensure correct timestamp format
      const updatedTime = time
        ? Timestamp.fromDate(new Date(time))
        : selectedOrder.time instanceof Timestamp
        ? selectedOrder.time
        : Timestamp.now();

      const updatedOrderData = {
        status,
        isCancelled: status === "Canceled",
        gradeLevel,
        section,
        meetingPlace,
        time: updatedTime,
      };

      // Update both seller and buyer orders
      await updateDoc(sellerOrderRef, updatedOrderData);
      await updateDoc(buyerOrderRef, updatedOrderData);

      console.log("Orders updated successfully.");

      const itemsRef = collection(db, "items");
      const q = query(
        itemsRef,
        where("productName", "==", selectedOrder.item),
        where("userId", "==", selectedOrder.sellerId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("Item not found in Firestore.");
        alert("Error: Item not found in the inventory.");
        return;
      }

      const productDoc = querySnapshot.docs[0];
      const productRef = doc(db, "items", productDoc.id);
      const productData = productDoc.data();

      const currentStock = Number(productData.stocks);

      if (status === "Completed") {
        // Deduct stock when order is completed
        await updateDoc(productRef, {
          stocks: Number(currentStock) - Number(selectedOrder.quantity),
        });
        console.log("Product stock updated (deducted) successfully.");
      } else if (status === "Canceled" || status === "Pending") {
        // Restore stock when order is canceled
        await updateDoc(productRef, {
          //stocks: Number(currentStock) + Number(selectedOrder.quantity),
        });
        console.log("Product stock restored due to order cancellation.");
      }

      fetchSellerOrders();

      handleClose();
      alert("Order updated successfully!");
    } catch (error) {
      console.error("Error updating orders:", error);
      alert("Error updating orders. Please check the console for details.");
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
            {orders
              .sort((a, b) => {
                const statusOrder: Record<string, number> = {
                  Pending: 1,
                  Completed: 2,
                  Canceled: 3,
                };
                return (
                  (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4)
                );
              })
              .map((order) => (
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
                      ? moment(
                          order.time instanceof Timestamp
                            ? order.time.toDate()
                            : order.time
                        ).format("MMMM Do YYYY, hh:mm A")
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

      <Modal show={show} onHide={handleClose} className="custom-modal">
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
