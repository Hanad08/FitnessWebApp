"use client";

import React, { useState } from "react";
import { createTrainer } from "@/services/services";
import { useRouter } from "next/navigation";
import styles from "@/styles/ManagerCreateTrainer.module.css";

export default function ManagerCreateTrainer() {
  const [trainerForm, setTrainerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrainerForm({
      ...trainerForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("firstName", trainerForm.firstName);
    formData.append("lastName", trainerForm.lastName);
    formData.append("email", trainerForm.email);
    formData.append("password", trainerForm.password);

    try {
      await createTrainer(formData);
      alert("Trainer created successfully!");
      router.push("/manager/dashboard");
    } catch (err) {
      console.error("Failed to create trainer", err);
      setError("Failed to create trainer. Please try again.");
    }
  };

  return (
    <div className={styles["create-trainer-container"]}>
      <h1>Create New Trainer</h1>
      {error && <p className={styles["error-message"]}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          value={trainerForm.firstName}
          onChange={handleChange}
          placeholder="First Name"
          required
        />
        <input
          type="text"
          name="lastName"
          value={trainerForm.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          required
        />
        <input
          type="email"
          name="email"
          value={trainerForm.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={trainerForm.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <button type="submit">Create Trainer</button>
      </form>
    </div>
  );
}