import { useState } from "react";
import logo from "../assets/Valma.png";
import Home from "./Content/Home";
import Order from "./Content/Order";
import Profile from "./Content/Profile";
import Sell from "./Content/Sell";
import Transaction from "./Content/Transaction";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HeaderContent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import {
  FaBars,
  FaShoppingCart,
  FaHome,
  FaUser,
  FaBox,
  FaStore,
  FaSignOutAlt,
  FaArrowLeft,
  FaSearch,
} from "react-icons/fa";
import React from "react";

export default function SettingsTab() {
  const [activeTab, setActiveTab] = useState("Home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Home", component: <Home />, icon: <FaHome className="mx-2" /> },
    {
      name: "Profile",
      component: <Profile />,
      icon: <FaUser className="mx-2" />,
    },
    { name: "Order", component: <Order />, icon: <FaBox className="mx-2" /> },
    {
      name: "Sell Items",
      component: <Sell />,
      icon: <FaStore className="mx-2" />,
    },
    {
      name: "Transaction",
      component: <Transaction />,
      icon: <FontAwesomeIcon icon={faMoneyBillWave} className="mx-2" />,
    },
  ];

  return (
    <React.Fragment>
      <header className="header-container w-100">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FaBars />
        </button>
        <div className="header-logo">
          <img src={logo} alt="ValMarket" />
          <h4 className="header-title">ValMarket</h4>
        </div>
      </header>

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <FaArrowLeft /> Close
          </button>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={`sidebar-item ${
                activeTab === item.name ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab(item.name);
                setSidebarOpen(false);
              }}
            >
              {item.icon} {item.name}
            </li>
          ))}
        </ul>
        <div
          className="logout-btn"
          onClick={() => console.log("Logout clicked")}
        >
          <FaSignOutAlt /> Logout
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
        {menuItems.find((item) => item.name === activeTab)?.component}
      </div>
    </React.Fragment>
  );
}
