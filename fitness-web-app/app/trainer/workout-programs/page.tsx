"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createWorkoutProgram, getClientsForTrainer, addExerciseToProgram, getWorkoutProgram, getTrainerWorkoutPrograms } from "@/services/services";
import { getToken, decodeJwt } from "@/services/services";
import { User } from "@/models/User";
import { WorkoutProgram } from "@/models/WorkoutProgram";
import styles from "@/styles/WorkoutProgram.module.css";

export default function CreateWorkoutProgram() {
  const [programName, setProgramName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(""); 
  const [clients, setClients] = useState<User[]>([]);
  const [personalTrainerId, setPersonalTrainerId] = useState<number | string>(""); 
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseDescription, setExerciseDescription] = useState("");
  const [sets, setSets] = useState("");
  const [repsTime, setRepsTime] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<number | undefined>(undefined); 
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>([]); 
  const router = useRouter();

  useEffect(() => {
    const fetchClients = async () => {
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

      try {
        const clientsList = await getClientsForTrainer(); 
        setClients(clientsList);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setError("Error fetching clients.");
      }
    };

    const fetchWorkoutPrograms = async () => {
      const token = getToken();
      if (!token) {
        setError("No valid token found. Please log in.");
        router.push("/Users/login");
        return;
      }

      try {
        const programsList = await getTrainerWorkoutPrograms(); 
        setWorkoutPrograms(programsList);
      } catch (error) {
        console.error("Error fetching workout programs:", error);
        setError("Error fetching workout programs.");
      }
    };

    fetchClients();
    fetchWorkoutPrograms();
  }, [router]);

  const handleAddExercise = async () => {
    if (exerciseName && exerciseDescription && sets && repsTime && selectedProgramId) {
        const newExercise = {
            name: exerciseName,
            description: exerciseDescription,
            sets: parseInt(sets),
            repetitions: parseInt(repsTime),
            workoutProgramId: selectedProgramId,  
            personalTrainerId: Number(personalTrainerId), 
        };
  
        setIsLoading(true);
  
        try {
            await addExerciseToProgram(selectedProgramId, newExercise);
            setExerciseName("");
            setExerciseDescription("");
            setSets("");
            setRepsTime("");
            setError("");
            alert("Exercise added successfully!");
        } catch (err) {
            console.error("Error adding exercise to the program:", err);
            setError("Error adding exercise to the program.");
        } finally {
            setIsLoading(false);
        }
    } else {
        setError("All exercise fields are required.");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!programName || !description || !clientId || !personalTrainerId) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }

    const newWorkoutProgram = {
      programName,
      description,
      clientId,
      personalTrainerId: personalTrainerId.toString(), 
      exercises: [], 
    };

    try {
      await createWorkoutProgram(newWorkoutProgram); 
      router.push("/trainer/workout-programs");
      alert("Workout program created successfully!");
    } catch (err) {
      console.error("Failed to create workout program", err);
      setError("Error creating workout program.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgramSelection = (programId: number) => {
    setSelectedProgramId(programId); 
    fetchProgramDetails(programId); 
  };

  const fetchProgramDetails = async (programId: number) => {
    try {
      const details = await getWorkoutProgram(programId); 
      console.log(details); 
    } catch (error) {
      console.error("Error fetching program details:", error);
      setError("Error fetching program details.");
    }
  };

  return (
    <div className={styles["create-workout-program-container"]}>
      <a href="/trainer/homepage" className={styles["back-to-home-button"]}>← Back to HomePage</a>
      <h1 className={styles["main-title"]}>Create Workout Program</h1>

      {/* Create Workout Program Form */}
      <div className={styles["form-container"]}>
        <form onSubmit={handleSubmit}>
          <input
            className={styles["input-field"]}
            type="text"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="Program Name"
            required
          />
          <textarea
            className={styles["input-field"]}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            required
          />
          <div>
            <label htmlFor="client">Select Client</label>
            <select
              className={styles["select-client"]}
              id="client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.userId} value={client.userId}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={styles["submit-button"]} disabled={isLoading}>
            {isLoading ? "Creating Program..." : "Create Program"}
          </button>
        </form>
      </div>

      <h2>Your Workout Programs</h2>
      <div className={styles["workout-programs-list"]}>
        {workoutPrograms.map((program) => (
          <div key={program.workoutProgramId}>
            <button className={styles["program-button"]} onClick={() => handleProgramSelection(program.workoutProgramId)}>{program.name}</button>
          </div>
        ))}
      </div>

      {/* Add Exercise Title and Form */}
      {selectedProgramId && (
        <div className={styles["add-exercise-form-container"]}>
          <h3 className={styles["add-exercise-title"]}>Add Exercise to Program</h3>
          <div className={styles["add-exercise-form"]}>
            <input
              className={styles["input-field"]}
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="Exercise Name"
              required
            />
            <textarea
              className={styles["input-field"]}
              value={exerciseDescription}
              onChange={(e) => setExerciseDescription(e.target.value)}
              placeholder="Exercise Description"
              required
            />
            <input
              className={styles["input-field"]}
              type="number"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              placeholder="Sets"
              required
            />
            <input
              className={styles["input-field"]}
              type="text"
              value={repsTime}
              onChange={(e) => setRepsTime(e.target.value)}
              placeholder="Reps/Time"
              required
            />
            <button className={styles["submit-button"]} onClick={handleAddExercise} disabled={isLoading}>
              {isLoading ? "Adding Exercise..." : "Add Exercise"}
            </button>
          </div>
        </div>
      )}

      {error && <p className={styles["error-message"]}>{error}</p>}
    </div>
  );
}