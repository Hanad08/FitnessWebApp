"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/services";
import Cookies from "js-cookie";
import styles from "@/styles/Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const jwt = await loginUser(email, password);
      console.log("JWT after login:", jwt); // Debug
      if (jwt) {
        Cookies.set("jwt_token", jwt, { expires: 1, secure: true });
        console.log("JWT Token in cookies: ", Cookies.get("jwt_token"));
        if (email.includes("_boss")) {
          router.replace("/manager/homepage"); 
        } else if (email.includes("_m") || email.includes("_w")) {
          router.replace("/trainer/homepage"); 
        } else if (email.includes("_c")) {
          router.replace("/client/homepage"); 
        } else {
          setError("Unknown user role. Please contact support.");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className={styles["login-container"]}>
    <div className={styles["login-box"]}>
      <a href="/" className={styles["back-link"]}>
        ← Back
      </a>
      <h1 className={styles["login-title"]}>Login</h1>
      <form onSubmit={handleSubmit} className={styles["login-form"]}>
        <div>
          <label htmlFor="email" className={styles["login-label"]}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className={styles["login-input"]}
          />
        </div>
        <div>
          <label htmlFor="password" className={styles["login-label"]}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className={styles["login-input"]}
          />
        </div>
        <button type="submit" className={styles["login-button"]}>
          Login
        </button>
      </form>
      {error && <p className={styles["error-message"]}>{error}</p>}
    </div>
  </div>
  );
}  