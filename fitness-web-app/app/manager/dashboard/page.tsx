"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createTrainer } from "@/services/services";
import styles from "@/styles/ManagerDashboard.module.css";

export default function ManagerDashboard() {
  const [newTrainer, setNewTrainer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState(false); 
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTrainer((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("firstName", newTrainer.firstName);
    formData.append("lastName", newTrainer.lastName);
    formData.append("email", newTrainer.email);
    formData.append("password", newTrainer.password);

    try {
      await createTrainer(formData);  
      alert("Trainer created successfully!");  
      router.push("/manager/dashboard");  
    } catch (err) {
      console.error("Error creating trainer:", err);
      setError("Failed to create trainer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    router.push("/Users/login");
  };

  return (
    <div className={styles.dashboardContainer}> 
      <h1 className={styles.header}>Manager Dashboard</h1>
      
      {/* Navigation Buttons */}
      <div className={styles.navButtons}>
        <button className={styles.createTrainerBtn} onClick={() => setShowForm(true)}>
          Create Trainer
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {showForm && (
        <div className={styles.createTrainerForm}>
          <h2>Create New Trainer</h2>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <form onSubmit={handleCreateTrainer}>
            <div>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={newTrainer.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={newTrainer.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={newTrainer.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={newTrainer.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Trainer"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}