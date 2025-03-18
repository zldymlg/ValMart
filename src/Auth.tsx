import { useState, FormEvent } from "react";

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
import BackgroundImage from "./assets/Background.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [section, setSection] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
          section,
          gradeLevel,
          createdAt: serverTimestamp(),
        });

        navigate("/dashboard");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/dashboard");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            className="card p-4 shadow-lg"
            style={{ width: "24rem", backgroundColor: "#fff" }}
          >
            <div className="card-body text-center">
              <h2
                className="mb-5"
                style={{ fontWeight: "bold", color: "#36454F" }}
              >
                {isSignUp ? "Sign Up" : "Log In"}
              </h2>

              {errorMessage && (
                <p className="text-danger small">{errorMessage}</p>
              )}

              <form className="d-flex flex-column gap-2" onSubmit={handleAuth}>
                {isSignUp && (
                  <>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Section"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Grade Level"
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      required
                    />
                  </>
                )}
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="input-group-text"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
                {isSignUp && (
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <span
                      className="input-group-text"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
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
          <footer className="text-center mt-3">© 2025 ValMarket</footer>
        </motion.div>
      </div>
    </>
  );
}
