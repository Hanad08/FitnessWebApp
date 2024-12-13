"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className={styles.navbar}>
      <div className={styles["navbar-container"]}>
        {/* Logo og appnavn */}
        <div className={styles["nav-logo"]}>
          <Link href="/" className="flex items-center space-x-2">
            <span>Fitness App</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className={styles["nav-links"]}>
          <Link href="/" className={styles["nav-link"]}>
            Home
          </Link>

          {status === "authenticated" && session?.user?.role === "Manager" && (
            <Link href="/manager/dashboard" className={styles["nav-link"]}>
              Manager Dashboard
            </Link>
          )}

          {status === "authenticated" && session?.user?.role === "Trainer" && (
            <Link href="/trainer/dashboard" className={styles["nav-link"]}>
              Trainer Dashboard
            </Link>
          )}

          {status === "authenticated" && session?.user?.role === "Client" && (
            <Link href="/client/dashboard" className={styles["nav-link"]}>
              Client Dashboard
            </Link>
          )}

          {/* Login/Logout */}
          {status === "authenticated" ? (
            <button
              onClick={() => signOut()}
              className={styles["nav-button"]}
            >
              Logout
            </button>
          ) : (
            <Link href="/Users/login" className={styles["nav-link"]}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}