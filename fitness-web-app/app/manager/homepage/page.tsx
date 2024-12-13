"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, decodeJwt, clearToken } from "@/services/services"; 
import { UserInfo } from "@/models/Userinfo";
import styles from "@/styles/ManagerHomepage.module.css"; 
 
export default function ManagerHomepage() {
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
      if (decoded.Role !== "Manager") {
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
      clearToken(); 
      router.replace("/Users/login"); 
    }
  }, [router]);

  if (isLoading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className={styles.homepageContainer}>
      <h1 className={styles.welcomeMessage}>
        Welcome, {userInfo?.Name || "Manager"}!
      </h1>
      <p className={styles.homepageDescription}>
        This is your homepage. Access all your functionality below.
      </p>
      <div className={styles.buttonContainer}>
        <button
          onClick={() => router.push("/manager/dashboard")}
          className={styles.dashboardButton}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
