export interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'available' | 'busy' | 'offline';
  points: number;
  tasksCompleted: number;
  badge: 'Rescue Rookie' | 'Disaster Hero' | 'ResQ Legend' | null;
}

export interface SosAlert {
  id: number;
  citizenId: number;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl?: string;
  status: 'new' | 'assigned' | 'in-progress' | 'resolved' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  assignedVolunteerId?: number;
}

export interface Citizen {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
}

export interface StatisticsData {
  crisesResolved: number;
  activeVolunteers: number;
  peopleHelped: number;
}

export interface UserRole {
  name: string;
  features: string[];
  icon: string;
}
