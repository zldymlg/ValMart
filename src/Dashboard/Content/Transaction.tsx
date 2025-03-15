import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Transaction.css";

export default function Transaction() {
  const [selectedCategory, setSelectedCategory] = useState("Orders");

  const Order = [
    {
      id: 1,
      name: "Flexstick Ballpen",
      color: "red",
      price: 17.0,
      quantity: 3,
      status: "Waiting for the item",
      imageUrl: "https://via.placeholder.com/80",
    },
  ];

  const Purchases = [
    {
      id: 2,
      name: "Notebook",
      color: "blue",
      price: 10.0,
      quantity: 2,
      status: "Delivered",
      imageUrl: "https://via.placeholder.com/80",
    },
  ];

  const Sell = [
    {
      id: 3,
      name: "Marker Pen",
      color: "black",
      price: 12.5,
      quantity: 5,
      status: "Sold",
      imageUrl: "https://via.placeholder.com/80",
    },
  ];

  // Determine which array to display based on selected category
  const getTransactions = () => {
    if (selectedCategory === "Orders") return Order;
    if (selectedCategory === "Purchases") return Purchases;
    if (selectedCategory === "Items Sold") return Sell;
    return [];
  };

  return (
    <div className="transaction-container">
      <div className="transaction-header">
        <h3>Transactions</h3>
        <select
          className="transaction-dropdown"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option>Orders</option>
          <option>Purchases</option>
          <option>Items Sold</option>
        </select>
      </div>

      <div className="transaction-list">
        {getTransactions().map((item) => (
          <div key={item.id} className="transaction-card">
            <img src={item.imageUrl} alt={item.name} className="item-image" />
            <div className="item-details">
              <h5>{item.name}</h5>
              <p>{item.color}</p>
              <p>
                <strong>Price: </strong> ${item.price.toFixed(2)}
              </p>
              <p>
                <strong>Total: </strong> {item.quantity}x = $
                {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
            <div className="transaction-status">
              <span className="status-badge">{item.status}</span>
              <button className="cancel-btn">Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
