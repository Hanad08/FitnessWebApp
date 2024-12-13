"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/services/services";  
import { getToken, decodeJwt } from "@/services/services";  
import styles from "@/styles/TrainerCreateClient.module.css";


export default function CreateClient() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [personalTrainerId, setPersonalTrainerId] = useState(""); 
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const fetchTrainerData = async () => {
      const token = getToken();
      if (!token) {
        setError("No valid token found. Please log in.");
        router.push("/Users/login");
        return;
      }

      const decodedTrainer = decodeJwt(token); 
      if (decodedTrainer?.Role !== "PersonalTrainer") {
        setError("Unauthorized access. You must be a Personal Trainer.");
        router.push("/Users/login");
        return;
      }

      setPersonalTrainerId(decodedTrainer.UserId);  
    };

    fetchTrainerData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!firstName || !lastName || !email || !password || !personalTrainerId) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("personalTrainerId", personalTrainerId);

    try {
      await createClient(formData);
      router.push("/trainer/clients");
      alert("Client created successfully!");  
    } catch (err) {
      console.error("Failed to create client", err);
      setError("Error creating client.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles["create-client-container"]}>
      <a href="/trainer/dashboard" className={styles["back-to-home-button"]}>← Back to Homepage</a>
      <h1>Create Client</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
          required
        />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating Client..." : "Create Client"}
        </button>
      </form>
      {error && <p className={styles["error-message"]}>{error}</p>}
    </div>
  );
}