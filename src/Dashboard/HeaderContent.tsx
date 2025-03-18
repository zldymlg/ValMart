import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Import Framer Motion
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
  FaHome,
  FaUser,
  FaBox,
  FaStore,
  FaSignOutAlt,
  FaArrowLeft,
  FaUserCircle,
} from "react-icons/fa";

const HeaderContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Home");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const navigate = useNavigate();

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
      {/* HEADER */}
      <header className="header-container w-100 d-flex justify-content-between align-items-center px-3 py-2">
        <div className="d-flex align-items-center">
          {/* Sidebar Toggle Button with animation */}
          <motion.button
            className="sidebar-toggle btn btn-link me-3"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaBars size={20} />
          </motion.button>

          {/* LOGO & TITLE */}
          <div className="d-flex align-items-center">
            <img src={logo} alt="ValMarket" style={{ height: "40px" }} />
            <h4 className="header-title ms-2 mb-0">ValMarket</h4>
          </div>
        </div>
        <div className="me-3">
          <FaUserCircle
            size={30}
            color="white"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setActiveTab("Profile");
            }}
          />
        </div>
      </header>

      {/* SIDEBAR ANIMATION */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-110%", opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="sidebar-header">
              <motion.button
                className="sidebar-close-btn align-items-center"
                onClick={() => setSidebarOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaArrowLeft /> Close
              </motion.button>
            </div>
            <ul className="sidebar-menu">
              {menuItems.map((item) => (
                <motion.li
                  key={item.name}
                  className={`sidebar-item ${
                    activeTab === item.name ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab(item.name);
                    setSidebarOpen(false);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon} {item.name}
                </motion.li>
              ))}
            </ul>
            <motion.div
              className="logout-btn"
              onClick={() =>
                setTimeout(() => {
                  navigate("/login");
                  window.location.reload();
                }, 100)
              }
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaSignOutAlt /> Logout
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT WITH FADE TRANSITION */}
      <motion.div
        key={activeTab}
        className={`main-content ${sidebarOpen ? "shifted" : ""}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {menuItems.find((item) => item.name === activeTab)?.component}
      </motion.div>
    </React.Fragment>
  );
};

export default HeaderContent;
