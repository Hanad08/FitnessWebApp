"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, decodeJwt, clearToken } from "@/services/services"; 
import { UserInfo } from "@/models/Userinfo"; 
import styles from "@/styles/ClientHomepage.module.css"; 

export default function ClientHomepage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null); 
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const token = getToken(); 

    if (!token) {
      router.replace("/Users/login"); 
      return;
    }

    try {
      const decoded = decodeJwt(token); 
      if (!decoded) {
        throw new Error("Invalid token structure.");
      }
      if (decoded.Role !== "Client") {
        clearToken(); 
        router.replace("/Users/login"); 
        return;
      }
      if (decoded.exp && Date.now() >= parseInt(decoded.exp) * 1000) {
        clearToken(); 
        router.replace("/Users/login"); 
        return;
      }

      setUserInfo(decoded); 
      setIsLoading(false); 
    } catch (error) {
      console.error("Authorization error:", error);
      clearToken(); // Fjern token ved fejl
      router.replace("/Users/login"); 
    }
  }, [router]);

  if (isLoading) {
    return <p className="text-center mt-10">Loading...</p>;
  }
  return (
    <div className={styles["homepage-container"]}>
      <h1 className={styles["welcome-message"]}>
        Welcome, {userInfo?.Name || "Client"}!
      </h1>
      <p className={styles["homepage-description"]}>
        This is your homepage. Access all your functionality below.
      </p>
      <div className={styles["button-container"]}>
        <button
          onClick={() => router.push("/client/dashboard")}
          className={styles["dashboard-button"]}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}