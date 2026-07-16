import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../api";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
    setOpen(false);
  }

  return (
    <nav className={styles.nav}>
      <span className={styles.brand}>Time Booker</span>

      <div className={styles.menuWrapper} ref={menuRef}>
        <button
          className={styles.hamburger}
          onClick={() => setOpen(!open)}
          aria-label="Open menu"
        >
          <span />
          <span />
          <span />
        </button>

        {open && (
          <div className={styles.dropdown}>
            {user ? (
              <>
                <div className={styles.dropdownName}>
                  {user.first_name} {user.last_name}
                </div>
                <div className={styles.dropdownEmail}>{user.email}</div>
                <hr className={styles.divider} />
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.dropdownItem} onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/signup" className={styles.dropdownItem} onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
