import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { db } from "./firebase"; // Ensure Firebase is configured
import { collection, doc, addDoc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";

interface OrderDetails {
  name: string;
  roomNumber: string;
  time: string;
  quantity: number;
  price: number;
  finalPrice: number;
}

export default function OrderPreview({
  product,
  userId,
}: {
  product: any;
  userId: string;
}) {
  const [order, setOrder] = useState<OrderDetails>({
    name: "",
    roomNumber: "",
    time: new Date().toLocaleTimeString(),
    quantity: product.quantity || 1,
    price: product.price || 0,
    finalPrice: product.price * (product.quantity || 1),
  });

  const [show, setShow] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrder((prev) => {
      const updatedOrder = { ...prev, [name]: value };
      if (name === "quantity") {
        updatedOrder.finalPrice = product.price * parseInt(value, 10);
      }
      return updatedOrder;
    });
  };

  const finalizeOrder = async () => {
    if (!userId) {
      alert("You need to log in to place an order.");
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      const orderRef = collection(userRef, "finalizedOrders");

      await addDoc(orderRef, {
        ...order,
        timestamp: new Date(),
      });

      alert("Order successfully placed!");
      setShow(false); // Close the modal upon successful order
    } catch (error) {
      console.error("Error finalizing order: ", error);
      alert("Failed to finalize order.");
    }
  };

  return (
    <>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Finalize Your Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={order.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Room Number:</label>
            <input
              type="text"
              className="form-control"
              name="roomNumber"
              value={order.roomNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Time:</label>
            <input
              type="text"
              className="form-control"
              value={order.time}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              className="form-control"
              name="quantity"
              value={order.quantity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Price (per item):</label>
            <input
              type="text"
              className="form-control"
              value={`$${order.price.toFixed(2)}`}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Final Price:</label>
            <input
              type="text"
              className="form-control"
              value={`$${order.finalPrice.toFixed(2)}`}
              disabled
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={finalizeOrder}>
            Confirm Order
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
