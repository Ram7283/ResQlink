import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, VolunteerStatus } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Enhanced user type with profiles
type EnhancedUser = SelectUser & {
  volunteerProfile?: {
    points: number;
    badge: string;
    status: VolunteerStatus;
    tasksCompleted: number;
    skills?: string[] | string;
    approvalStatus?: string;
    bio?: string;
    profilePicture?: string;
  },
  citizenProfile?: {
    emergencyContact?: string;
    medicalInfo?: string;
    preferences?: string;
  }
};

type AuthContextType = {
  user: EnhancedUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<EnhancedUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<EnhancedUser, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  email: string;
  name: string;
  phone: string;
  location?: string;
  role: 'citizen' | 'volunteer';
  language?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  // Volunteer-specific fields
  skills?: string;
  availability?: string;
  certifications?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<EnhancedUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (userData: EnhancedUser) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (userData: EnhancedUser) => {
      if (userData.role === 'volunteer') {
        toast({
          title: "Registration successful",
          description: `Thank you for volunteering, ${userData.name}! Your request has been sent to an admin. Please wait for confirmation.`,
        });
      } else {
        queryClient.setQueryData(["/api/user"], userData);
        toast({
          title: "Registration successful",
          description: `Welcome to ResQLink, ${userData.name}!`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
      queryClient.clear(); // clear all React Query cache
      localStorage.clear(); // clear any persistent state
      sessionStorage.clear(); // clear temporary storage
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      window.location.href = "/"; // force redirect to home or login
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}