"use client";

import { useState, useEffect } from "react";
import { getToken, decodeJwt } from "@/services/services";
import { getClientWorkoutPrograms } from "@/services/services";
import { WorkoutProgram } from "@/models/WorkoutProgram";
import { useRouter } from "next/navigation";
import styles from "@/styles/ClientDashboard.module.css"; 
import UserInfo from "@/models/Userinfo";

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "workouts" | "profile">("dashboard");
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null); 
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndPrograms = async () => {
      const token = getToken();
      if (!token) {
        router.push("/Users/login");
        return;
      }

      const decodedUser = decodeJwt(token); 
      if (decodedUser) {
        setUser(decodedUser); // Save UserInfo for authentication
      }

      if (activeTab === "workouts") {
        try {
          const programs = await getClientWorkoutPrograms();
          setWorkoutPrograms(programs);
        } catch (err) {
          console.error("Error fetching workout programs:", err);
          setError("Failed to load workout programs.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserAndPrograms();
  }, [activeTab, router]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles["dashboard-container"]}>
      <h1>Client Dashboard</h1>

      {/* Navbar */}
      <nav className={styles["dashboard-nav"]}>
        <button onClick={() => setActiveTab("dashboard")} className={activeTab === "dashboard" ? styles["active-tab"] : ""}>
          Dashboard
        </button>
        <button onClick={() => setActiveTab("workouts")} className={activeTab === "workouts" ? styles["active-tab"] : ""}>
          Workout Programs
        </button>
        <button onClick={() => setActiveTab("profile")} className={activeTab === "profile" ? styles["active-tab"] : ""}>
          Profile
        </button>
        <button onClick={() => router.push("/Users/login")}>Logout</button>
      </nav>

      {/* Content */}
      <div className={styles["tab-content"]}>
        {activeTab === "dashboard" && (
          <div>
            <h2>Welcome, {user?.Name || "User"}!</h2>
            <p>Use the navigation buttons to view your workout programs or profile.</p>
          </div>
        )}

        {activeTab === "workouts" && (
          <div>
            <h2>Your Workout Programs</h2>
            {error ? (
              <p className={styles["error-message"]}>{error}</p>
            ) : workoutPrograms.length === 0 ? (
              <p>No workout programs available.</p>
            ) : (
              workoutPrograms.map((program) => (
                <div key={program.workoutProgramId} className={styles["program-card"]}>
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
          <div>
            <h2>Profile</h2>
            {user ? (
              <div className={styles["profile-details"]}>
                <p><strong>Name:</strong> {user.Name || "Unknown"}</p>
                <p><strong>Email:</strong> {user.Email || "Unknown"}</p>
                <p><strong>Role:</strong> {user.Role || "Unknown"}</p>
                {user.GroupId && <p><strong>Group ID:</strong> {user.GroupId}</p>}
                {user.UserId && <p><strong>User ID:</strong> {user.UserId}</p>}
                {user.exp && (
                  <p>
                    <strong>Session Expires:</strong>{" "}
                    {new Date(Number(user.exp) * 1000).toLocaleString()}
                  </p>
                )}
                {user.nbf && (
                  <p>
                    <strong>Session Active Since:</strong>{" "}
                    {new Date(Number(user.nbf) * 1000).toLocaleString()}
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
