import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  FaIdBadge,
  FaPhone,
  FaHashtag,
  FaCircleUser,
  FaSchool,
} from "react-icons/fa6"; // Placeholder imports for icons

interface User {
  fullName?: string;
  contact?: string;
  social?: string;
  section?: string;
}

export default function Profile() {
  const [userData, setUserData] = useState<User>({});
  const [imageUrl, setImageUrl] = useState(
    "https://bxemmrkbsnygfipesymp.supabase.co/storage/v1/object/public/Valmart/profiles/DefaultPhoto.jpg"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [social, setSocial] = useState("");
  const [username, setUsername] = useState("");
  const [section, setSection] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          setUserData(userDocSnapshot.data() as User);
          // Set state variables with data from the document
          setFullName(userDocSnapshot.data().fullName || "");
          setContact(userDocSnapshot.data().contact || "");
          setSocial(userDocSnapshot.data().social || "");
          setUsername(userDocSnapshot.data().username || ""); // Assuming you have a 'username' field
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
        fullName,
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
    <div className="container-fluid mt-4 pt-3 text-center">
      <div className="d-flex flex-row mt-5">
        <label htmlFor="profilePic" className="d-block">
          <img
            src={imageUrl || "placeholder.jpg"}
            alt="Profile"
            className="rounded-circle"
            style={{
              cursor: "pointer",
              width: "clamp(100px, 20vw, 200px)",
              height: "clamp(100px, 20vw, 200px)",
            }}
          />
        </label>
        <input
          type="file"
          id="profilePic"
          accept="image/*"
          onChange={handleImageUpload} // Use handleImageUpload here
          className="d-none"
        />
        <div className="d-flex flex-column text-start ms-5 mt-5 pt-3 justify-content-center">
          <h3 className="fs-3 fs-sm-5">
            @{fullName ? fullName.replace(/\s+/g, "_") : "Placeholder"}
          </h3>
          <p className="ms-2">
            Section: {section || "Placeholder for Section"}
          </p>
        </div>
        <div className=" ms-5 mt-5 justify-content-center align-items-center">
          <button
            className="btn btn-primary"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="d-flex flex-md-row flex-column mt-2">
        <div className="d-flex flex-md-row flex-column ">
          <div className="d-flex flex-column text-lg-start text-center me-lg-5">
            <p className="mt-5 mb-3">
              {" "}
              <FaIdBadge
                className="me-2 fs-1 fs-md-3"
                style={{
                  color: "#C11818",
                }}
              />
              Full Name: {fullName || "Placeholder for Full Name"}
            </p>
            <p className="mt-5 mb-3">
              {""}
              <FaPhone
                className="me-2 fs-1 fs-md-3"
                style={{
                  color: "#C11818",
                }}
              />
              Contact:{""}
              {contact || "Placeholder for Contact"}
            </p>
            <p className="mt-5 mb-3">
              {""}
              <FaHashtag
                className="me-2 fs-1 fs-md-3"
                style={{
                  color: "#C11818",
                }}
              />
              Social Link: {""}
              {social || "Placeholder for Social Link"}
            </p>
          </div>
          <div className="d-flex flex-column text-lg-start text-center">
            <p className="mt-5 mb-3">
              {""}
              <FaCircleUser
                className="me-2 fs-1 fs-md-3"
                style={{
                  color: "#C11818",
                }}
              />
              Username:{""} {username || "Placeholder for Username"}
            </p>
            <p className="mt-5 mb-3">
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
            <span className="fs-4 fw-bold">16</span>
            <span className="ms-2">items sold</span>
            <span className="ms-2">🌟</span>
          </div>
          <div className="bg-danger text-white px-4 py-2 h-25 rounded d-flex align-items-center">
            <span className="fs-4 fw-bold">27</span>
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
