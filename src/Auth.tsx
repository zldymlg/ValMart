import { useState, FormEvent } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import { auth, db } from "./Dashboard/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import "./Auth.css";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import NavHeader from "./Component/Header";
import BackgroundImage from "/src/assets/Background.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [gradeLevel, setGradeLevel] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
          throw new Error("Email already in use. Please log in instead.");
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          username,
          email,
          password,
          section,
          gradeLevel,
          createdAt: serverTimestamp(),
        });

        setTimeout(() => {
          navigate("/dashboard");
          window.location.reload();
        }, 100);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setTimeout(() => {
          navigate("/dashboard");
          window.location.reload();
        }, 100);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <React.Fragment>
      <NavHeader />
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        id="Content"
        style={{ backgroundImage: `url(${BackgroundImage})` }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="card p-4 shadow-lg "
            style={{
              width: "24rem",

              backgroundColor: "#fffff",
            }}
          >
            <div className="card-body text-center">
              <h2
                className="mb-5"
                style={{
                  fontWeight: "bold",
                  color: "#36454F",
                }}
              >
                {isSignUp ? "Sign Up" : "Log In"}
              </h2>

              {errorMessage && (
                <p className="text-danger small">{errorMessage}</p>
              )}

              <form className="d-flex flex-column gap-2" onSubmit={handleAuth}>
                {isSignUp && (
                  <>
                    <div className="text-start mb-3">
                      <label htmlFor="username" style={{ fontWeight: "500" }}>
                        Username
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ backgroundColor: "rgba(54, 69, 79, 0.1)" }}
                      />
                    </div>
                    <div className="text-start mb-3">
                      <label htmlFor="section" style={{ fontWeight: "500" }}>
                        Section
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="section"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        required
                        style={{ backgroundColor: "rgba(54, 69, 79, 0.1)" }}
                      />
                    </div>
                    <div className="text-start mb-3">
                      <label htmlFor="gradeLevel" style={{ fontWeight: "500" }}>
                        Grade Level
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="gradeLevel"
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        required
                        style={{ backgroundColor: "rgba(54, 69, 79, 0.1)" }}
                      />
                    </div>
                  </>
                )}
                <div className="text-start mb-3">
                  <label htmlFor="email" style={{ fontWeight: "500" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ backgroundColor: "rgba(54, 69, 79, 0.1)" }}
                  />
                </div>
                <div className="text-start mb-3">
                  <label htmlFor="password" style={{ fontWeight: "500" }}>
                    Password
                  </label>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        backgroundColor: "rgba(54, 69, 79, 0.1)",
                        flexGrow: 1,
                      }}
                    />
                    <span
                      style={{
                        cursor: "pointer",
                        marginLeft: "10px",
                      }}
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                </div>
                {isSignUp && (
                  <div className="text-start mb-3">
                    <label
                      htmlFor="confirmPassword"
                      style={{ fontWeight: "500" }}
                    >
                      Confirm Password
                    </label>
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{
                          backgroundColor: "rgba(54, 69, 79, 0.1)",
                          flexGrow: 1,
                        }}
                      />
                      <span
                        style={{
                          cursor: "pointer",
                          marginLeft: "10px",
                        }}
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                      </span>
                    </div>
                  </div>
                )}
                <button
                  className="btn btn-danger w-100 mt-2"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
                </button>
              </form>

              <p className="mt-3">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <span
                  className="text-danger"
                  style={{ cursor: "pointer", fontWeight: "bold" }}
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? " Log In" : " Sign Up"}
                </span>
              </p>
            </div>
          </div>
          <div className="footer text-center mt-3">
            <footer>© 2025 ValMarket</footer>
          </div>
        </motion.div>
      </div>
    </React.Fragment>
  );
}
