"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getClients, getTrainerWorkoutPrograms } from "@/services/services"; 
import { getToken, decodeJwt } from "@/services/services"; 
import { User } from "@/models/User"; 
import { WorkoutProgram } from "@/models/WorkoutProgram"; 
import styles from "@/styles/TrainerDashboard.module.css";
import { UserInfo } from "@/models/Userinfo";

export default function TrainerDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "clients" | "workouts" | "profile">("dashboard");
  const [clients, setClients] = useState<User[]>([]); 
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>([]); 
  const [trainer, setTrainer] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string>(""); 
  const router = useRouter();

  useEffect(() => {
    const fetchTrainerData = async () => {
      const token = getToken();
      if (!token) {
        router.push("/Users/login");  
        return;
      }

      const decodedTrainer = decodeJwt(token); 
      setTrainer(decodedTrainer);  

      if (decodedTrainer?.Role !== "PersonalTrainer") {
        setError("Unauthorized access. You must be a Personal Trainer.");
        router.push("/Users/login");
        return;
      }

      if (activeTab === "clients") {
        try {
          const clientsList = await getClients(); 
          setClients(clientsList); 
        } catch (err) {
          console.error("Error fetching clients:", err);
          setError("Failed to load clients.");
        }
      } else if (activeTab === "workouts") {
        try {
          const programs = await getTrainerWorkoutPrograms(); 
          setWorkoutPrograms(programs); 
        } catch (err) {
          console.error("Error fetching workout programs:", err);
          setError("Failed to load workout programs.");
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchTrainerData();
  }, [activeTab, router]);  

  if (isLoading) {
    return <p className="loading">Loading...</p>; 
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardTitle}>Trainer Dashboard</h1>

      {/* Back Button */}
      <button 
        onClick={() => router.push("/trainer/homepage")}
        className={styles.backButton}
      >
        &larr; Back to Homepage
      </button>

      {/* Main content container */}
      <div className={styles.welcomeContainer}>
        <h2>Welcome, {trainer?.Name|| "Trainer"}!</h2>
        <p>Use the navigation buttons to manage clients, workout programs, and profile.</p>

        {/* Buttons */}
        <div className={styles.dashboardButtons}>
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={activeTab === "dashboard" ? styles.activeTab : ""}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("clients")}
            className={activeTab === "clients" ? styles.activeTab : ""}
          >
            Clients
          </button>
          <button 
            onClick={() => setActiveTab("workouts")}
            className={activeTab === "workouts" ? styles.activeTab : ""}
          >
            Workout Programs
          </button>
          <button 
            onClick={() => setActiveTab("profile")}
            className={activeTab === "profile" ? styles.activeTab : ""}
          >
            Profile
          </button>
          <button 
            onClick={() => router.push("/Users/login")}
            className={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "clients" && (
          <div className={styles.clientsList}>
            <h2>Your Clients</h2>
            {error ? (
              <p className={styles.errorMessage}>{error}</p>
            ) : clients.length === 0 ? (
              <p>No clients available.</p>
            ) : (
              clients.map((client) => (
                <div key={client.userId} className={styles.clientCard}>
                  <h3>{client.firstName} {client.lastName}</h3>
                  <p>Email: {client.email}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "workouts" && (
          <div className={styles.workoutPrograms}>
            <h2>Your Workout Programs</h2>
            {error ? (
              <p className={styles.errorMessage}>{error}</p>
            ) : workoutPrograms.length === 0 ? (
              <p>No workout programs available.</p>
            ) : (
              workoutPrograms.map((program) => (
                <div key={program.workoutProgramId} className={styles.programCard}>
                  <h3>{program.name}</h3>
                  <p>{program.description}</p>
                  <table>
                    <thead>
                      <tr>
                        <th>Exercise</th>
                        <th>Description</th>
                        <th>Sets</th>
                        <th>Reps/Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {program.exercises.map((exercise) => (
                        <tr key={exercise.exerciseId}>
                          <td>{exercise.name}</td>
                          <td>{exercise.description}</td>
                          <td>{exercise.sets}</td>
                          <td>{exercise.repetitions || exercise.time || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className={styles.profileDetails}>
            <h2>Profile</h2>
            {trainer ? (
              <div className={styles.profileDetailsContent}>
               <p><strong>Name:</strong> {trainer.Name || "Unknown"} </p>
               <p><strong>Email:</strong> {trainer.Email || "Unknown"}</p>
               <p><strong>Role:</strong> {trainer.Role || "Unknown"}</p>
               {trainer.GroupId && <p><strong>Group ID:</strong> {trainer.GroupId}</p>}
               {trainer.UserId && <p><strong>User ID:</strong> {trainer.UserId}</p>}
               {trainer.exp && (
                 <p>
                   <strong>Session Expires:</strong>{" "}
                   {new Date(Number(trainer.exp) * 1000).toLocaleString()}
                 </p>
               )}
               {trainer.nbf && (
                 <p>
                   <strong>Session Active Since:</strong>{" "}
                   {new Date(Number(trainer.nbf) * 1000).toLocaleString()}
                 </p>
               )}
             </div>
            ) : (
              <p>No profile information available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}