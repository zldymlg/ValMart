import React, { useState, ChangeEvent, FormEvent } from "react";
import "./OrderModal.css";

interface OrderFormProps {
  show: boolean;
  handleClose: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ show, handleClose }) => {
  const [item, setItem] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [status, setStatus] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [price, setPrice] = useState<number>(10); // Base price per item

  // Update price based on quantity
  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value, 10);
    setQuantity(qty);
    setPrice(qty * 10); // Example: base price is 10 units per item
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic
    console.log("Order submitted:", {
      item,
      quantity,
      status,
      grade,
      section,
      room,
      price,
    });
    handleClose(); // Close the modal after submission
  };

  if (!show) {
    return null; // Do not render the form if 'show' is false
  }

  return (
    <div className="modal container-fluid">
      <div className="modal-content">
        <span className="close" onClick={handleClose}>
          &times;
        </span>
        <form onSubmit={handleSubmit}>
          <label>
            Item:
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
            />
          </label>
          <label>
            Quantity:
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              required
            />
          </label>
          <label>
            Status:
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            />
          </label>
          <label>
            Grade:
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
            />
          </label>
          <label>
            Section:
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              required
            />
          </label>
          <label>
            Room:
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              required
            />
          </label>
          <p>Total Price: {price} units</p>
          <button type="submit">Submit Order</button>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
