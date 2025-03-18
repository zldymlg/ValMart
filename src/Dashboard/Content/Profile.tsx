import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import BackgroundImage from "/src/assets/Background.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  FaIdBadge,
  FaPhone,
  FaHashtag,
  FaCircleUser,
  FaSchool,
  FaPen,
} from "react-icons/fa6";
interface User {
  fullName?: string;
  contact?: string;
  social?: string;
  section?: string;
}

export default function Profile() {
  const [_userData, setUserData] = useState<User>({});
  const [imageUrl, setImageUrl] = useState(
    "https://bxemmrkbsnygfipesymp.supabase.co/storage/v1/object/public/Valmart/profiles/DefaultPhoto.jpg"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [social, setSocial] = useState("");
  const [username, setUsername] = useState("");
  const [section, setSection] = useState("");
  const [itemsSoldCount, setItemsSoldCount] = useState(0);
  const [purchasesCount, setPurchasesCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          setUserData(userDocSnapshot.data() as User);
          setFullName(userDocSnapshot.data().fullName || "");
          setContact(userDocSnapshot.data().contact || "");
          setSocial(userDocSnapshot.data().social || "");
          setUsername(userDocSnapshot.data().username || "");
          setSection(userDocSnapshot.data().section || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }

      const filePath = `profiles/profile_${user.uid}.png`;
      const { data } = supabase.storage.from("Valmart").getPublicUrl(filePath);
      if (data?.publicUrl) {
        setImageUrl(`${data.publicUrl}?t=${new Date().getTime()}`);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const fetchedOrders = querySnapshot.docs.map((doc) => doc.data());

        // Filter for items sold (Completed status)
        const soldItems = fetchedOrders.filter(
          (order) =>
            order.sellerId === currentUserId && order.status === "Completed"
        );

        // Filter for purchases
        const purchases = fetchedOrders.filter(
          (order) =>
            order.buyerId === currentUserId && order.status === "Completed"
        );

        setItemsSoldCount(soldItems.length);
        setPurchasesCount(purchases.length);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      alert("Only PNG or JPG images are allowed.");
      return;
    }

    const filePath = `profiles/profile_${user.uid}.png`;

    try {
      await supabase.storage.from("Valmart").remove([filePath]);
      const { error: uploadError } = await supabase.storage
        .from("Valmart")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        console.error("Upload failed:", uploadError.message);
        alert("Image upload failed. Please try again.");
        return;
      }

      const { data } = supabase.storage.from("Valmart").getPublicUrl(filePath);
      if (data?.publicUrl) {
        setImageUrl(`${data.publicUrl}?t=${new Date().getTime()}`);
      }

      alert("Profile picture updated!");
    } catch (error) {
      console.error("Unexpected error during image upload:", error);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        contact,
        social,
        username,
        section,
      });
      alert("Profile updated!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="container-fluid mt-4 pt-3 text-center text-md-end">
      <div
        className="d-flex flex-column flex-md-row mt-0 mt-md-5 pb-sm-2"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
        }}
      >
        <label htmlFor="profilePic" className="d-block">
          <img
            src={imageUrl || "placeholder.jpg"}
            alt="Profile"
            className="rounded-circle p-3"
            style={{
              cursor: "pointer",
              width: "clamp(120px, 18vw, 180px)",
              height: "clamp(120px, 18vw, 180px)",
            }}
          />
        </label>
        <input
          type="file"
          id="profilePic"
          accept="image/*"
          onChange={handleImageUpload}
          className="d-none"
        />
        <div className="d-flex flex-row justify-content-center justify-content-md-center m-0 p-0">
          <div className="d-flex flex-column text-start ps-lg-0 ms-lg-0 ms-1 text-white mt-md-5 ps-sm-4 pt-md-3 justify-content-start align-items-center">
            <h3 className="fs-1 fw-bold fs-sm-6 text-sm-center">
              @{username ? username.replace(/\s+/g, "_") : "Placeholder"}
            </h3>
            <h6 className="ms-2 text-sm-center">Section: {section}</h6>
          </div>
          <div className="pt-md-5 mt-md-4 mt-2  justify-content-center align-items-center">
            <button
              className="btn ms-2 md-sm-2 p-0"
              onClick={() => setIsEditing(true)}
              style={{
                backgroundColor: "transparent",
                height: "clamp(20px, 36px, 50px)",
              }}
            >
              <FaPen
                style={{
                  color: "white",
                  fontSize: "clamp (18px, 25px, 27px)",
                }}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="d-flex flex-md-row flex-column mt-2">
        <div className="d-flex flex-md-row flex-column ">
          <div className="d-flex flex-column text-lg-start text-center me-lg-5">
            <p className="mt-3 mt-md-5 mb-3">
              {" "}
              <FaIdBadge
                className="me-2 fs-1 fs-md-3"
                style={{
                  color: "#C11818",
                }}
              />
              Full Name:{" "}
              <span style={{ color: "gray" }}>
                {fullName || "Please input your Full name"}
              </span>
            </p>
            <p className="mt-3 mt-md-5 mb-3">
              {""}
              <FaPhone
                className="me-2 fs-1 fs-md-3"
                style={{
                  color: "#C11818",
                }}
              />
              Contact:{""}
              <span style={{ color: "gray" }}>
                {contact || "Placeholder for Contact"}
              </span>
            </p>
            <p className="mt-3 mt-md-5 mb-3">
              {""}
              <FaHashtag
                className="me-2 fs-1 fs-md-3"
                style={{
                  color: "#C11818",
                }}
              />
              Social Link:{" "}
              <span style={{ color: "gray" }}>
                {social || "Placeholder for Social Link"}
              </span>
            </p>
          </div>
          <div className="d-flex flex-column text-lg-start text-center">
            <p className="mt-3 mt-md-5 mb-3">
              {""}
              <FaCircleUser
                className="me-2 fs-1 fs-md-3"
                style={{
                  color: "#C11818",
                }}
              />
              <span style={{ color: "gray" }}>
                Username:{""} {username || "Placeholder for Username"}
              </span>
            </p>
            <p className="mt-3 mt-md-5 mb-3">
              {""}
              <FaSchool
                className="me-2 fs-1 fs-md-3"
                style={{
                  color: "#C11818",
                }}
              />
              Section:{""} {section || "Placeholder for Section"}
            </p>
          </div>
        </div>

        <div className="d-flex gap-3 ms-lg-5 p-1 ps-lg-5 align-items-center justify-content-center">
          <div className="bg-danger text-white px-4 py-2 h-25 rounded d-flex align-items-center">
            {/* <span className=""> */}
            <span className="fs-4 fw-bold">{itemsSoldCount}</span>
            <span className="ms-2">items sold</span>
            <span className="ms-2">🌟</span>
          </div>
          <div className="bg-danger text-white px-4 py-2 h-25 rounded d-flex align-items-center">
            <span className="fs-4 fw-bold">{purchasesCount}</span>
            <span className="ms-2">Purchases</span>
            <span className="ms-2">🌟</span>
          </div>
        </div>
      </div>
      {isEditing && (
        <div className="modal show d-block bg-dark bg-opacity-50 position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <div className="modal-dialog">
            <div className="modal-content p-4">
              <h4 className="mb-3">Edit Profile</h4>
              <input
                type="text"
                className="form-control my-2"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <input
                type="text"
                className="form-control my-2"
                placeholder="Contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
              <input
                type="text"
                className="form-control my-2"
                placeholder="Social Link"
                value={social}
                onChange={(e) => setSocial(e.target.value)}
              />
              <input
                type="text"
                className="form-control my-2"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="text"
                className="form-control my-2"
                placeholder="Section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
              <div className="d-flex justify-content-between mt-3">
                <button className="btn btn-success" onClick={handleSave}>
                  Save Changes
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
