import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import getServerSession from "next-auth";
import { revalidateTag } from "next/cache";
import { authController } from "@/app/auth/authController";
import WorkoutProgram from "@/models/WorkoutProgram";
import Exercise from "@/models/Exercise";
import UserInfo from "@/models/Userinfo";
import User from "@/models/User";
import { redirect } from "next/navigation";

const API_URL = "https://swafe24fitness.azurewebsites.net/api"

////////////////////////////
// JWT & COOKIE FUNCTIONS
////////////////////////////

export const decodeJwt = (token: string): UserInfo | null => {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) {
      throw new Error("Invalid JWT structure.");
    }
    const payloadJson = atob(payloadBase64);
    const payload: UserInfo = JSON.parse(payloadJson);
    return payload;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

// Helper to manage cookies
export const setToken = (token: string) => {
  Cookies.set("jwt_token", token, { expires: 1, secure: true });
};

export const getToken = (): string | null => {
  return Cookies.get("jwt_token") || null;
};

export const clearToken = () => {
  Cookies.remove("jwt_token");
};



////////////////////////                                                        
//      API CALLS                                           
////////////////////////

// API call function to handle requests and responses
const apiCall = async <T>(
    url: string,
    method: "GET" | "POST" | "UPDATE" | "DELETE",
    token: string,
    body?: object
  ): Promise<T> => {
    try {
      const response = await axios({
        url,
        method,
        data: body,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response?.data) {
        return response.data; 
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error?.response?.data?.message ||
          error.message ||
          "Something went wrong with the API."
        );
      } else {
        throw new Error("An unknown error occurred.");
      }
    }
  };  

////////////////////                                                          
//  POST REQUESTS                                         
////////////////////

// Service to login a user
  export const loginUser = async (
    email: string,
    password: string
  ): Promise<string> => {
    try {
      const response = await axios.post(`${API_URL}/Users/login`, {
        email,
        password,
      });
      console.log("Response from login:", response); 
      if (response.data?.jwt) {
        const decoded = decodeJwt(response.data.jwt);
        if (!decoded) throw new Error("Invalid JWT token structure.");
        setToken(response.data.jwt);
        return response.data.jwt; 
      } else {
      throw new Error("Login failed. Invalid credentials.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error?.response?.data?.message || error.message;
        throw new Error(message || "Something went wrong with the API.");
      } else {
        throw new Error("An unknown error occurred.");
      }
    }
  };

// Service to create a client
export const createClient = async (formData: FormData): Promise<User> => {
  const token = await getToken();
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  }

  const newClient = {
    userId: 0,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    personalTrainerId: Number(formData.get("personalTrainerId")),
    accountType: "Client",
  };

  try {
    return await apiCall<User>(`${API_URL}/Users`, "POST", token, newClient);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to create client.");
    } else if (error instanceof Error) {
      throw new Error(`Failed to create client: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while creating client.");
    }
  }
};

// Service to create a workout program
export const createWorkoutProgram = async (
  workoutProgram: { programName: string; description: string; clientId: string; personalTrainerId: string }
): Promise<WorkoutProgram> => {
  const token = await getToken();
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  }

  const newWorkoutProgram = {
    name: workoutProgram.programName,
    description: workoutProgram.description,
    exercises: [],  // Add logic if you need exercises
    personalTrainerId: Number(workoutProgram.personalTrainerId),
    clientId: Number(workoutProgram.clientId),
  };

  try {
    const response = await apiCall<WorkoutProgram>(`${API_URL}/WorkoutPrograms`, "POST", token, newWorkoutProgram);
    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to create workout program.");
    } else if (error instanceof Error) {
      throw new Error(`Failed to create workout program: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while creating workout program.");
    }
  }
};

// Service to create a new personal trainer
export const createTrainer = async (
  formData: FormData
): Promise<User> => {
  const token = await getToken();
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  }

  const newTrainer = {
    userId: 0,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    accountType: "PersonalTrainer",
  };
  try {
    return await apiCall<User>(`${API_URL}/Users`, "POST", token, newTrainer);
    } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to create trainer.");
    } else if (error instanceof Error) {
      throw new Error(`Failed to create trainer: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while creating trainer.");
    }
  }
};

// Service to add an exercise to a specific workout program
export const addExerciseToProgram = async (
  programId: number,
  exerciseData: { name: string, description: string, sets: number, repetitions: number, workoutProgramId: number, personalTrainerId: number }
): Promise<Exercise> => {
  const token = await getToken();
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  }

  if (!programId) {
    throw new Error("Program ID is required.");
  }

  try {
    const response = await apiCall<Exercise>(
      `${API_URL}/Exercises/Program/${programId}`,
      "POST",
      token,
      exerciseData
    );
    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to add exercise to program.");
    } else if (error instanceof Error) {
      throw new Error(`Failed to add exercise to program: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while adding exercise.");
    }
  }
};


//////////////////////////////                                         
// GET REQUESTS                                                
//////////////////////////////

// Service to get all clients for a trainer
export const getClients = async (): Promise<User[]> => {
  const token = await getToken();
  console.log("Token:", token);
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  }

  try {
    const response = await axios.get(`${API_URL}/Users/Clients`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("API Response (Clients):", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching clients:", error.response?.data || error.message);
      throw new Error(`Failed to fetch clients: ${error.response?.data?.message || error.message}`);
    } else {
      throw new Error("An unknown error occurred while fetching clients.");
    }
  }
};


// Service to fetch workout programs for a client
export const getClientWorkoutPrograms = async (): Promise<WorkoutProgram[]> => {
  const token = getToken();
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  }

  const decoded = decodeJwt(token);
  if (!decoded || decoded.Role !== "Client") {
    throw new Error("Unauthorized access. You must be a client.");
  }

  try {
    const response = await fetch(`${API_URL}/WorkoutPrograms/client/${decoded.UserId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data: WorkoutProgram[] = await response.json();
    console.log("Fetched workout programs:", data); 
    return data;
  } catch (error) {
    console.error("Error fetching workout programs:", error);
    throw new Error("Failed to fetch workout programs for the client.");
  }
};


// Service to get the personal trainer for the logged-in user
export const getTrainers = async (): Promise<User> => {
  const token = await getToken(); 
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  }

  try {
    const response = await axios.get(`${API_URL}/Users/Trainer`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      console.log("API Response (Trainer):", response.data);
      return response.data;
    } else {
      throw new Error("Failed to fetch trainer details.");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.error("Error fetching trainer: Personal Trainer not set.");
        throw new Error("Personal Trainer not set. Please check your trainer details.");
      }
      console.error("Error fetching trainer:", error.response?.data || error.message);
      throw new Error(`Failed to fetch trainer: ${error.response?.data?.message || error.message}`);
    } else {
      throw new Error("An unknown error occurred while fetching trainer.");
    }
  }
};

// Service to get clients for the trainer
export const getClientsForTrainer = async (): Promise<User[]> => {
  const token = await getToken();  
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  }

  try {
    const response = await axios.get(`${API_URL}/Users/Clients`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      console.log("API Response (Clients):", response.data);
      return response.data;  
    } else {
      throw new Error("Failed to fetch clients.");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching clients:", error.response?.data || error.message);
      throw new Error(`Failed to fetch clients: ${error.response?.data?.message || error.message}`);
    } else {
      console.error("An unknown error occurred while fetching clients.", error);
      throw new Error("An unknown error occurred while fetching clients.");
    }
  }
};


// Service to get workout programs for a trainer
export const getTrainerWorkoutPrograms = async (): Promise<WorkoutProgram[]> => {
  const token = await getToken();
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  }

  try {
    const response = await axios.get(`${API_URL}/WorkoutPrograms/trainer`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      console.log("API Response (Trainer Workout Programs):", response.data);
      return response.data;
    } else {
      throw new Error("Failed to fetch workout programs.");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch workout programs: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while fetching workout programs.");
    }
  }
};


// Service to get a specific workout program by its ID
export const getWorkoutProgram = async (programId: number): Promise<WorkoutProgram> => {
  const token = await getToken();
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  }

  try {
    const response = await axios.get(`${API_URL}/WorkoutPrograms/${programId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      console.log("API Response (Workout Program):", response.data);
      return response.data;
    } else {
      throw new Error("Failed to fetch workout program details.");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to fetch workout program details.");
    } else {
      throw new Error("An unknown error occurred while fetching workout program details.");
    }
  }
};

// Service to get details of a specific workout program
export const getWorkoutProgramDetails = async (programId: number): Promise<WorkoutProgram> => {
  const token = await getToken();
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  }

  try {
    const response = await axios.get(`${API_URL}/WorkoutPrograms/${programId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      console.log("API Response (Workout Program Details):", response.data);
      return response.data;
    } else {
      throw new Error("Failed to fetch workout program details.");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch workout program details: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while fetching workout program details.");
    }
  }
};


// Service to get all exercises
export const getExercises = async (): Promise<Exercise[]> => {
  const token = await getToken();
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  } try {
    const response = await axios.get(`${API_URL}/Exercises`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; 
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch exercises: ${error.response?.data?.message || error.message}`);
    } else if (error instanceof Error) {
      throw new Error(`Failed to fetch exercises: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching exercises.');
    }
  }
};

// Service to get all users
export const getUsers = async (): Promise<User[]> => {
  const token = await getToken();
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  } try {
    const response = await axios.get(`${API_URL}/Users`, {
    headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; 
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch users: ${error.response?.data?.message || error.message}`);
    } else if (error instanceof Error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching users.');
    }
  }
};


//////////////////////                                                        
// DELETE REQUESTS                                           
//////////////////////

// Service to delete a client
export const deleteClient = async (userId: number): Promise<User> => {
  const token = await getToken();
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  } try {
    return await apiCall<User>(`${API_URL}/Users/${userId}`, "DELETE", token);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to delete client: ${error?.response?.data?.message || error.message}`);
    } else if (error instanceof Error) {
      throw new Error(`Failed to delete client: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while deleting the client.");
    }
  }
};

// Service to delete a workout program
export const deleteWorkoutProgram = async (programId: number): Promise<WorkoutProgram> => {
  const token = await getToken();
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  } try {
    return await apiCall<WorkoutProgram>(`${API_URL}/WorkoutPrograms/${programId}`, "DELETE", token);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to delete workout program: ${error?.response?.data?.message || error.message}`);
    } else if (error instanceof Error) {
      throw new Error(`Failed to delete workout program: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while deleting the workout program.");
    }
  }
}

// Service to delete an exercise from a workout program
export const deleteExerciseFromProgram = async (programId: number, exerciseId: number): Promise<Exercise> => {
  const token = await getToken();
  if (!token) {
    throw new Error("No valid token found. Please log in.");
  } try {
    return await apiCall<Exercise>(`${API_URL}/Exercises/${exerciseId}/Program/${programId}`, "DELETE", token);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to delete exercise from program: ${error?.response?.data?.message || error.message}`);
    } else if (error instanceof Error) {
      throw new Error(`Failed to delete exercise from program: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while deleting the exercise from the program.");
    }
  }
};

/////////////////////////////////////////////////////////////                                                       
// HELPER FUNCTIONS FOR AUTHENTICATION AND CACHE INVALIDATION                          
/////////////////////////////////////////////////////////////

// Add the revalidateTag function for cache invalidation if necessary.
export const revalidateCache = () => {
  revalidateTag("trainerWorkoutPrograms");
  revalidateTag("clientWorkoutPrograms");
  revalidateTag("exercises");
};

// Session controller to handle user roles and redirection
export async function SessionController() {
    const session = await getServerSession(authController);
    if (!session || !(session as any).user) {
      redirect("")
    } return { role: (session as any)?.user?.role, name: (session as any)?.user?.name };
}