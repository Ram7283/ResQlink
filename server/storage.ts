import { db, pool } from "../db";
import * as schema from "@shared/schema";
import { eq, and, desc, asc, sql, count } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { Store } from "express-session";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser: (id: number) => Promise<schema.User | undefined>;
  getUserByUsername: (username: string) => Promise<schema.User | undefined>;
  createUser: (userData: schema.InsertUser) => Promise<schema.User>;
  
  // Volunteer methods
  getVolunteerProfile: (userId: number) => Promise<schema.VolunteerProfile | undefined>;
  updateVolunteerStatus: (userId: number, status: schema.VolunteerStatus) => Promise<void>;
  updateVolunteerPoints: (userId: number, points: number) => Promise<void>;
  getVolunteers: (limit?: number, offset?: number) => Promise<schema.User[]>;
  getAvailableVolunteersNearLocation: (latitude: number, longitude: number, radius: number) => Promise<schema.User[]>;
  
  // Citizen methods
  getCitizenProfile: (userId: number) => Promise<schema.CitizenProfile | undefined>;
  
  // SOS methods
  createSosAlert: (alertData: schema.InsertSosAlert) => Promise<schema.SosAlert>;
  getSosAlerts: (status?: schema.SosAlertStatus, limit?: number, offset?: number) => Promise<schema.SosAlert[]>;
  getSosAlertById: (id: number) => Promise<schema.SosAlert | undefined>;
  updateSosAlertStatus: (id: number, status: schema.SosAlertStatus) => Promise<void>;
  assignVolunteerToSosAlert: (alertId: number, volunteerId: number) => Promise<void>;
  
  // Task completion methods
  completeTask: (taskData: schema.InsertTaskCompletion) => Promise<schema.TaskCompletion>;
  getTaskCompletions: (volunteerId: number, limit?: number, offset?: number) => Promise<schema.TaskCompletion[]>;
  
  // Feedback methods
  submitFeedback: (feedbackData: schema.InsertFeedback) => Promise<schema.Feedback>;
  getFeedbackByVolunteer: (volunteerId: number, limit?: number, offset?: number) => Promise<schema.Feedback[]>;
  
  // Certificate methods
  createCertificate: (volunteerId: number, certificateUrl: string, qrCode: string) => Promise<typeof schema.certificates.$inferInsert>;
  getCertificates: (volunteerId: number) => Promise<typeof schema.certificates.$inferSelect[]>;
  
  // Help Center methods
  getHelpCenters: () => Promise<schema.HelpCenter[]>;
  getHelpCentersNearLocation: (latitude: number, longitude: number, radius: number) => Promise<schema.HelpCenter[]>;
  
  // Resource methods
  getResources: (language?: string, limit?: number, offset?: number) => Promise<schema.Resource[]>;
  getResourceById: (id: number) => Promise<schema.Resource | undefined>;
  
  // Broadcast methods
  createBroadcastMessage: (messageData: typeof schema.broadcastMessages.$inferInsert) => Promise<typeof schema.broadcastMessages.$inferSelect>;
  getBroadcastMessages: (targetRole?: string, limit?: number, offset?: number) => Promise<typeof schema.broadcastMessages.$inferSelect[]>;
  
  // Statistics methods
  getStatistics: () => Promise<typeof schema.statistics.$inferSelect | undefined>;
  updateStatistics: (statsData: Partial<typeof schema.statistics.$inferSelect>) => Promise<void>;
  
  // Session store
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;
  
  constructor() {
    // Initialize the session store with the pool from db/index.ts
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session' 
    });
  }
  
  // User methods
  async getUser(id: number): Promise<schema.User | undefined> {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });
  }
  
  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    return await db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
  }
  
  async createUser(userData: schema.InsertUser): Promise<schema.User> {
    const [user] = await db.insert(schema.users).values(userData).returning();
    return user;
  }
  
  // Volunteer methods
  async getVolunteerProfile(userId: number): Promise<schema.VolunteerProfile | undefined> {
    return await db.query.volunteerProfiles.findFirst({
      where: eq(schema.volunteerProfiles.userId, userId)
    });
  }
  
  async updateVolunteerStatus(userId: number, status: schema.VolunteerStatus): Promise<void> {
    await db.update(schema.volunteerProfiles)
      .set({ status })
      .where(eq(schema.volunteerProfiles.userId, userId));
  }
  
  async updateVolunteerPoints(userId: number, points: number): Promise<void> {
    if (points === undefined) return; // Skip if no points provided
    
    const volunteerProfile = await this.getVolunteerProfile(userId);
    if (!volunteerProfile) return;
    
    const newPoints = Number(volunteerProfile.points) + Number(points);
    let badge = volunteerProfile.badge;
    
    // Update badge based on points
    if (newPoints >= 200) {
      badge = "ResQLegend";
    } else if (newPoints >= 100) {
      badge = "DisasterHero";
    } else if (newPoints >= 50) {
      badge = "RescueRookie";
    }
    
    await db.update(schema.volunteerProfiles)
      .set({ points: newPoints, badge })
      .where(eq(schema.volunteerProfiles.userId, userId));
  }
  
  async getVolunteers(limit = 10, offset = 0): Promise<schema.User[]> {
    return await db.query.users.findMany({
      where: eq(schema.users.role, "volunteer"),
      limit,
      offset,
      with: {
        volunteerProfile: true
      }
    });
  }
  
  async getAvailableVolunteersNearLocation(
    latitude: number, 
    longitude: number, 
    radius: number = 10
  ): Promise<schema.User[]> {
    // This is a simplified implementation - in a real app, you would use 
    // a more sophisticated geospatial query like PostGIS
    return await db.query.users.findMany({
      where: eq(schema.users.role, "volunteer"),
      with: {
        volunteerProfile: true
      }
    });
  }
  
  // Citizen methods
  async getCitizenProfile(userId: number): Promise<schema.CitizenProfile | undefined> {
    return await db.query.citizenProfiles.findFirst({
      where: eq(schema.citizenProfiles.userId, userId)
    });
  }
  
  // SOS methods
  async createSosAlert(alertData: schema.InsertSosAlert): Promise<schema.SosAlert> {
    const [alert] = await db.insert(schema.sosAlerts)
      .values(alertData)
      .returning();
    return alert;
  }
  
  async getSosAlerts(
    status?: schema.SosAlertStatus,
    limit = 10, 
    offset = 0
  ): Promise<schema.SosAlert[]> {
    if (status) {
      return await db.query.sosAlerts.findMany({
        where: eq(schema.sosAlerts.status, status),
        limit,
        offset,
        orderBy: [desc(schema.sosAlerts.createdAt)]
      });
    }
    
    return await db.query.sosAlerts.findMany({
      limit,
      offset,
      orderBy: [desc(schema.sosAlerts.createdAt)]
    });
  }
  
  async getSosAlertById(id: number): Promise<schema.SosAlert | undefined> {
    return await db.query.sosAlerts.findFirst({
      where: eq(schema.sosAlerts.id, id),
      with: {
        citizen: true,
        assignedVolunteer: true
      }
    });
  }
  
  async updateSosAlertStatus(id: number, status: schema.SosAlertStatus): Promise<void> {
    await db.update(schema.sosAlerts)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(schema.sosAlerts.id, id));
    
    // If resolved, update statistics
    if (status === "resolved") {
      // Increment crisis resolved count
      const stats = await this.getStatistics();
      if (stats) {
        await this.updateStatistics({ 
          crisesResolved: stats.crisesResolved + 1 
        });
      }
    }
  }
  
  async assignVolunteerToSosAlert(alertId: number, volunteerId: number): Promise<void> {
    await db.update(schema.sosAlerts)
      .set({ 
        assignedVolunteerId: volunteerId,
        status: "assigned",
        updatedAt: new Date()
      })
      .where(eq(schema.sosAlerts.id, alertId));
  }
  
  // Task completion methods
  async completeTask(taskData: schema.InsertTaskCompletion): Promise<schema.TaskCompletion> {
    const [task] = await db.insert(schema.taskCompletions)
      .values(taskData)
      .returning();
    
    // Get volunteer profile
    const profile = await this.getVolunteerProfile(taskData.volunteerId);
    if (profile) {
      // Update task count
      const updatedTaskCount = profile.tasksCompleted + 1;
      
      // Update volunteer profile
      await db.update(schema.volunteerProfiles)
        .set({ 
          tasksCompleted: updatedTaskCount
        })
        .where(eq(schema.volunteerProfiles.userId, taskData.volunteerId));
      
      // Update volunteer points if points are provided
      if (taskData.pointsAwarded) {
        await this.updateVolunteerPoints(taskData.volunteerId, taskData.pointsAwarded);
      }
      
      // Check if volunteer should get a certificate (every 10 tasks)
      if (updatedTaskCount % 10 === 0) {
        // In a real implementation, you would generate a PDF certificate and QR code here
        const certificateUrl = `/certificates/volunteer-${taskData.volunteerId}-cert-${Date.now()}.pdf`;
        const qrCode = `https://resqlink.org/verify-certificate/${taskData.volunteerId}-${Date.now()}`;
        await this.createCertificate(taskData.volunteerId, certificateUrl, qrCode);
      }
    }
    
    return task;
  }
  
  async getTaskCompletions(volunteerId: number, limit = 10, offset = 0): Promise<schema.TaskCompletion[]> {
    return await db.query.taskCompletions.findMany({
      where: eq(schema.taskCompletions.volunteerId, volunteerId),
      limit,
      offset,
      orderBy: [desc(schema.taskCompletions.completedAt)]
    });
  }
  
  // Feedback methods
  async submitFeedback(feedbackData: schema.InsertFeedback): Promise<schema.Feedback> {
    const [feedback] = await db.insert(schema.feedback)
      .values(feedbackData)
      .returning();
    return feedback;
  }
  
  async getFeedbackByVolunteer(volunteerId: number, limit = 10, offset = 0): Promise<schema.Feedback[]> {
    return await db.query.feedback.findMany({
      where: eq(schema.feedback.volunteerId, volunteerId),
      limit,
      offset,
      orderBy: [desc(schema.feedback.createdAt)]
    });
  }
  
  // Certificate methods
  async createCertificate(
    volunteerId: number, 
    certificateUrl: string, 
    qrCode: string
  ): Promise<typeof schema.certificates.$inferInsert> {
    const [certificate] = await db.insert(schema.certificates)
      .values({
        volunteerId,
        certificateUrl,
        qrCode,
        issuedAt: new Date()
      })
      .returning();
    return certificate;
  }
  
  async getCertificates(volunteerId: number): Promise<typeof schema.certificates.$inferSelect[]> {
    return await db.query.certificates.findMany({
      where: eq(schema.certificates.volunteerId, volunteerId),
      orderBy: [desc(schema.certificates.issuedAt)]
    });
  }
  
  // Help Center methods
  async getHelpCenters(): Promise<schema.HelpCenter[]> {
    return await db.query.helpCenters.findMany({
      where: eq(schema.helpCenters.status, "active")
    });
  }
  
  async getHelpCentersNearLocation(
    latitude: number, 
    longitude: number, 
    radius: number = 10
  ): Promise<schema.HelpCenter[]> {
    // This is a simplified implementation - in a real app, you would use 
    // a more sophisticated geospatial query like PostGIS
    return await db.query.helpCenters.findMany({
      where: eq(schema.helpCenters.status, "active")
    });
  }
  
  // Resource methods
  async getResources(language = "en", limit = 10, offset = 0): Promise<schema.Resource[]> {
    return await db.query.resources.findMany({
      where: eq(schema.resources.language, language),
      limit,
      offset,
      orderBy: [asc(schema.resources.title)]
    });
  }
  
  async getResourceById(id: number): Promise<schema.Resource | undefined> {
    return await db.query.resources.findFirst({
      where: eq(schema.resources.id, id)
    });
  }
  
  // Broadcast methods
  async createBroadcastMessage(
    messageData: typeof schema.broadcastMessages.$inferInsert
  ): Promise<typeof schema.broadcastMessages.$inferSelect> {
    const [message] = await db.insert(schema.broadcastMessages)
      .values(messageData)
      .returning();
    return message;
  }
  
  async getBroadcastMessages(
    targetRole?: string, 
    limit = 10, 
    offset = 0
  ): Promise<typeof schema.broadcastMessages.$inferSelect[]> {
    const query = db.select().from(schema.broadcastMessages)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(schema.broadcastMessages.createdAt));
    
    if (targetRole) {
      const role = targetRole === "all" ? "all" : targetRole;
      return await query.where(sql`${schema.broadcastMessages.targetRole} = ${role}`);
    }
    
    return await query;
  }
  
  // Statistics methods
  async getStatistics(): Promise<typeof schema.statistics.$inferSelect | undefined> {
    return await db.query.statistics.findFirst();
  }
  
  async updateStatistics(statsData: Partial<typeof schema.statistics.$inferSelect>): Promise<void> {
    const existingStats = await this.getStatistics();
    
    if (existingStats) {
      await db.update(schema.statistics)
        .set({ 
          ...statsData,
          updatedAt: new Date()
        })
        .where(eq(schema.statistics.id, existingStats.id));
    } else {
      await db.insert(schema.statistics)
        .values({
          crisesResolved: 0,
          activeVolunteers: 0,
          peopleHelped: 0,
          ...statsData as any // Type assertion to handle dynamic properties
        });
    }
  }
}

export const storage = new DatabaseStorage();