import React, { memo, useState, useEffect } from 'react'
import { profileStyles } from '../assets/dummyStyles'
import Modal from 'react-modal';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const BASE_URL = "http://localhost:4000/api";

Modal.setAppElement('#root');

const getAuthToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const PasswordInput = memo(({ name, label, value, error, showField, onToggle, onChange }) => (
  <div>
    <label className={profileStyles.passwordLabel}>{label}</label>

    <div className={profileStyles.passwordContainer}>
      <input
        type={showField ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={name === "current" ? "current-password" : "new-password"}
        className={`w-full px-4 py-2 rounded-lg border ${error ? "border-red-400" : "border-gray-300"
          } focus:ring-2 focus:ring-teal-400 outline-none`}
        placeholder={`Enter ${label.toLowerCase()}`}
      />

      <button type="button" onClick={onToggle} className={profileStyles.passwordToggle}>
        {showField ? <EyeOff /> : <Eye />}
      </button>
    </div>

    {error && <p className={profileStyles.errorText}>{error}</p>}
  </div>
));

const ProfilePage = ({ user, onUpdateProfile, onLogout }) => {

  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [tempUser, setTempUser] = useState({ name: '', email: '' });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  // sync user
  useEffect(() => {
    if (user) {
      setTempUser({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  // IMAGE UPLOAD
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const res = await axios.put(
        `${BASE_URL}/user/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`
          }
        }
      );

      onUpdateProfile?.(res.data.user);
      toast.success("Profile image updated");

    } catch {
      toast.error("Image upload failed");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempUser(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    onLogout?.();
    navigate("/login");
  };

  return (
    <div className={profileStyles.container}>

      <ToastContainer autoClose={2000} />

      <div className={profileStyles.mainContainer}>

        {/* HEADER */}
        <div className={profileStyles.header}>
          <div className="flex flex-col items-center">

            {/* PROFILE IMAGE */}
            <div className="relative w-24 h-24">
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-500 flex items-center justify-center border-2 border-white">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}

              <input
                type="file"
                id="profileUpload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <label
                htmlFor="profileUpload"
                className="absolute bottom-0 right-0 bg-500 text-white p-2 rounded-full cursor-pointer"
              >
                📷
              </label>
            </div>

            <h1 className={`${profileStyles.userName} text-white mt-3`}>
              {user?.name}
            </h1>

            <p className={`${profileStyles.userEmail} text-white opacity-80`}>
              {user?.email}
            </p>

          </div>
        </div>

        {/* CONTENT */}
        <div className={profileStyles.content}>
          <div className={profileStyles.grid}>

            {/* PERSONAL INFO */}
            <div className={profileStyles.card}>
              <div className='flex justify-between items-center mb-6'>
                <h2 className={profileStyles.cardTitle}>
                  <User className={profileStyles.icon} />
                  Personal Information
                </h2>

                {!editMode && (
                  <button onClick={() => setEditMode(true)} className={profileStyles.editButton}>
                    Edit
                  </button>
                )}
              </div>

              {editMode ? (
                <div className='space-y-4'>
                  <input
                    name="name"
                    value={tempUser.name}
                    onChange={handleInputChange}
                    className={profileStyles.input}
                  />

                  <input
                    name="email"
                    value={tempUser.email}
                    onChange={handleInputChange}
                    className={profileStyles.input}
                  />

                  <div className="flex gap-3">
                    <button className={profileStyles.buttonPrimary}>Save</button>
                    <button onClick={() => setEditMode(false)} className={profileStyles.buttonSecondary}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex justify-between border-b pb-2">
                    <p>Name:</p>
                    <p>{user?.name}</p>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <p>Email:</p>
                    <p>{user?.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* SECURITY */}
            <div className={profileStyles.card}>
              <h2 className={profileStyles.cardTitle}>
                <Lock className={profileStyles.icon} />
                Account Security
              </h2>

              <button
                onClick={handleLogout}
                className={`${profileStyles.buttonPrimary} mt-6 w-full`}
              >
                Logout
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;