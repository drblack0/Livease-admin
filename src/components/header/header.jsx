import React, { useState, useEffect } from "react";
import "./header.scss";
import { getCurrentUser } from "../../util/helper/authHelper";

function Header() {
  const [userInfo, setUserInfo] = useState({
    name: "Admin",
    email: "admin@zeqlo.com",
    profilePic: "/assets/3d_avatar_12.png"
  });

  useEffect(() => {
    // Get user info from token and localStorage
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUserInfo({
        name: currentUser.name,
        email: currentUser.email,
        profilePic: currentUser.profilePic || "/assets/3d_avatar_12.png"
      });
    }
  }, []);

  return (
    <div className="header rad">
      {/* Search Bar */}
      <div className="search-box-container">
        <img src="/assets/Icon.png" alt="Search icon" />
        <input type="text" placeholder="Search here" className="search-box" />
      </div>

      {/* Right side icons and profile */}
      <div className="right-section">
        <div className="icon-wrapper">
          <img src="/assets/Frame 568.png" alt="avatar" />
        </div>
        <div className="icon-wrapper">
          <img src="/assets/Frame 548.png" alt="avatar" />
        </div>
        <div className="profile">
          <img src={userInfo.profilePic} alt="avatar" />
          <div className="info">
            <h4>{userInfo.name}</h4>
            <span>{userInfo.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
