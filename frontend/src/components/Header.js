import React from "react";
import { Container, Dropdown, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { resolveAssetUrl } from "../utils/files";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const avatarUrl = resolveAssetUrl(user?.avatarImage);

  const avatarContent = avatarUrl ? (
    <img src={avatarUrl} alt={user?.name || "Profile"} className="profileAvatarImage" />
  ) : (
    <div className="profileAvatarFallback">{getInitials(user?.name || "F")}</div>
  );

  return (
    <div className="headerShell">
      <Navbar expand="lg" className="navbarCSS">
        <Container fluid className="headerInner">
          <Navbar.Brand onClick={() => navigate("/")} className="text-white navTitle" role="button">
            Finora
          </Navbar.Brand>

          <div className="profileArea">
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="profileToggle text-decoration-none"
                id="profile-dropdown"
              >
                {avatarContent}
                <div className="profileText">
                  <span className="profileName">{user?.name || "User"}</span>
                  <span className="profileEmail">{user?.email || ""}</span>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="profileMenu">
                <div className="profileMenuHeader">
                  <div className="profileMenuName">{user?.name || "User"}</div>
                  <div className="profileMenuEmail">{user?.email || ""}</div>
                </div>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => navigate("/profile")}>View Profile</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/setAvatar")}>Choose Avatar</Dropdown.Item>
                <Dropdown.Item onClick={onLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Container>
      </Navbar>
    </div>
  );
};

export default Header;
