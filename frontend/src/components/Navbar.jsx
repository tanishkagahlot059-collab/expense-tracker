import React, { useEffect, useRef, useState } from 'react'
import { navbarStyles } from '../assets/dummyStyles'
import img1 from '../assets/logo.png';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const Navbar = ({ user: propUser, onLogout }) => {
    const navigate = useNavigate();
    const menuRef = useRef();
    const [menuOpen, setMenuOpen] = useState(false);

    // ✅ FIX 1: user state
    const [user, setUser] = useState(propUser || null);

    // ✅ sync propUser
    useEffect(() => {
        if (propUser) {
            setUser(propUser);
        }
    }, [propUser]);

    // ✅ fetch user if not provided
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await axios.get(`${BASE_URL}/user/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const userData = response.data.user || response.data;
                setUser(userData); // ✅ IMPORTANT FIX
            } catch (error) {
                console.error("Failed to load profile", error);
            }
        };

        if (!propUser) {
            fetchUserData();
        }
    }, [propUser]);

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    const handleLogout = () => {
        setMenuOpen(false);
        localStorage.removeItem("token");
        onLogout?.();
        navigate("/login");
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className={navbarStyles.header}>
            <div className={navbarStyles.container}>
                {/* logo */}
                <div onClick={() => navigate("/")} className={navbarStyles.logoContainer}>
                    <div className={navbarStyles.logoImage}>
                        <img src={img1} alt="logo" />
                    </div>
                    <span className={navbarStyles.logoText}>Expense Tracker</span>
                </div>

                {/* user */}
                {user && (
                    <div className={navbarStyles.userContainer} ref={menuRef}>
                        <button onClick={toggleMenu} className={navbarStyles.userButton}>
                            <div className="relative">
                                <div className={navbarStyles.userAvatar}>
                                    {user?.profilePic ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}${user.profilePic}`}
                                            alt="profile"
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <span>
                                            {user?.name?.[0]?.toUpperCase() || "U"}
                                        </span>
                                    )}
                                </div>
                                <div className={navbarStyles.statusIndicator}></div>
                            </div>

                            <div className={navbarStyles.userTextContainer}>
                                <p className={navbarStyles.userName}>{user?.name || "user"}</p>
                                <p className={navbarStyles.userEmail}>{user?.email || "email"}</p>
                            </div>

                            <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />
                        </button>

                        {/* dropdown */}
                        {menuOpen && (
                            <div className={navbarStyles.dropdownMenu}>
                                <div className={navbarStyles.dropdownHeader}>
                                    <div className="flex items-center gap-3">

                                        <div className={navbarStyles.dropdownAvatar}>
                                            {/* ✅ PROFILE PIC FIX */}
                                            {user?.profilePic ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}${user.profilePic}`}
                                                    alt="profile"
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                user?.name?.[0]?.toUpperCase() || "U"
                                            )}
                                        </div>

                                        <div>
                                            <div className={navbarStyles.dropdownName}>
                                                {user?.name || "User"}
                                            </div>
                                            <div className={navbarStyles.dropdownEmail}>
                                                {user?.email || "email"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={navbarStyles.menuItemContainer}>
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            navigate("/profile");
                                        }}
                                        className={navbarStyles.menuItem}
                                    >
                                        <User className="w-4 h-4" />
                                        <span>My Profile</span>
                                    </button>
                                </div>

                                <div className={navbarStyles.menuItemBorder}>
                                    <button onClick={handleLogout} className={navbarStyles.logoutButton}>
                                        <LogOut className="w-4 h-4" />
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;