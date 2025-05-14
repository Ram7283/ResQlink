import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import path from "path";
import * as schema from "@shared/schema";
import { eq, desc, or } from "drizzle-orm";
import { db } from "../db";
import { broadcasts } from "@shared/schema";

// Auth middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
}

// Role check middleware
function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userRole = req.user?.role;
    if (userRole && roles.includes(userRole)) {
      return next();
    }
    
    return res.status(403).json({ message: "Access denied" });
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Define API routes
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'ResQLink API is running' });
  });
  
  // Statistics endpoint
  app.get('/api/statistics', async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ message: "Error fetching statistics" });
    }
  });
  
  // Help centers endpoints
  app.get('/api/help-centers', async (req, res) => {
    try {
      const helpCenters = await storage.getHelpCenters();
      res.json(helpCenters);
    } catch (error) {
      console.error('Error fetching help centers:', error);
      res.status(500).json({ message: "Error fetching help centers" });
    }
  });

  // GET all broadcasts
app.get("/api/broadcasts", isAuthenticated, async (req: Request, res: Response) => {
  const allBroadcasts = await db.select().from(broadcasts).orderBy(desc(broadcasts.createdAt));
  res.json(allBroadcasts);
});

// POST new broadcast
app.post("/api/broadcasts", isAuthenticated, hasRole(["admin"]), async (req: Request, res: Response) => {
  const { title, message, target } = req.body;
  if (!title || !message || !target) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const result = await db
    .insert(broadcasts)
    .values({ title, message, target })
    .returning();

  res.status(201).json(result[0]);
});

// DELETE broadcast (admin only) - use storage abstraction
app.delete("/api/broadcasts/:id", isAuthenticated, hasRole(["admin"]), async (req: Request, res: Response) => {
  try {
    const broadcastId = parseInt(req.params.id);
    if (isNaN(broadcastId)) {
      return res.status(400).json({ message: "Invalid broadcast ID" });
    }

    await db.delete(broadcasts).where(eq(broadcasts.id, broadcastId));
    res.json({ message: "Broadcast deleted successfully" });
  } catch (error) {
    console.error("Error deleting broadcast:", error);
    res.status(500).json({ message: "Failed to delete broadcast" });
  }
});
  
  app.get('/api/help-centers/near', isAuthenticated, async (req, res) => {
    try {
      const { latitude, longitude, radius } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const helpCenters = await storage.getHelpCentersNearLocation(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        radius ? parseFloat(radius as string) : 10
      );
      
      res.json(helpCenters);
    } catch (error) {
      console.error('Error fetching nearby help centers:', error);
      res.status(500).json({ message: "Error fetching nearby help centers" });
    }
  });
  
  // Resources endpoints
  app.get('/api/resources', async (req, res) => {
    try {
      const { language = "en", limit, offset } = req.query;
      
      const resources = await storage.getResources(
        language as string,
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );
      
      res.json(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ message: "Error fetching resources" });
    }
  });
  
  app.get('/api/resources/:id', async (req, res) => {
    try {
      const resource = await storage.getResourceById(parseInt(req.params.id));
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.json(resource);
    } catch (error) {
      console.error('Error fetching resource:', error);
      res.status(500).json({ message: "Error fetching resource" });
    }
  });
  
  // SOS alert endpoints
  app.post('/api/sos', isAuthenticated, async (req, res) => {
    try {
      if (req.user?.role !== 'citizen') {
        return res.status(403).json({ message: "Only citizens can create SOS alerts" });
      }
      
      const alertData = {
        ...req.body,
        citizenId: req.user.id,
        status: "new" as schema.SosAlertStatus
      };
      
      const sosAlert = await storage.createSosAlert(alertData);
      
      // Update statistics
      const stats = await storage.getStatistics();
      if (stats) {
        await storage.updateStatistics({ peopleHelped: stats.peopleHelped + 1 });
      }
      
      res.status(201).json(sosAlert);
    } catch (error) {
      console.error('Error creating SOS alert:', error);
      res.status(500).json({ message: "Error creating SOS alert" });
    }
  });
  
  app.get('/api/sos', isAuthenticated, async (req, res) => {
    try {
      const { status, limit, offset } = req.query;
      
      // Check permissions based on role
      if (req.user?.role === 'citizen') {
        // Citizens can only see their own SOS alerts
        const sosAlerts = await db.query.sosAlerts.findMany({
          where: eq(schema.sosAlerts.citizenId, req.user.id),
          limit: limit ? parseInt(limit as string) : 10,
          offset: offset ? parseInt(offset as string) : 0,
          orderBy: desc(schema.sosAlerts.createdAt)
        });
        
        return res.json(sosAlerts);
      }
      
      // Admin and volunteers can see all SOS alerts with filtering
      const sosAlerts = await storage.getSosAlerts(
        status as schema.SosAlertStatus,
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );
      
      res.json(sosAlerts);
    } catch (error) {
      console.error('Error fetching SOS alerts:', error);
      res.status(500).json({ message: "Error fetching SOS alerts" });
    }
  });
  
  app.get('/api/sos/:id', isAuthenticated, async (req, res) => {
    try {
      const sosAlert = await storage.getSosAlertById(parseInt(req.params.id));
      
      if (!sosAlert) {
        return res.status(404).json({ message: "SOS alert not found" });
      }
      
      // Check permissions
      if (req.user?.role === 'citizen' && sosAlert.citizenId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(sosAlert);
    } catch (error) {
      console.error('Error fetching SOS alert:', error);
      res.status(500).json({ message: "Error fetching SOS alert" });
    }
  });
  
  app.patch('/api/sos/:id/status', isAuthenticated, async (req, res) => {
    try {
      const sosId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const sosAlert = await storage.getSosAlertById(sosId);
      
      if (!sosAlert) {
        return res.status(404).json({ message: "SOS alert not found" });
      }
      
      // Check permissions
      if (req.user?.role === 'citizen') {
        // Citizens can only cancel their own SOS alerts
        if (sosAlert.citizenId !== req.user.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        if (status !== 'cancelled') {
          return res.status(403).json({ message: "Citizens can only cancel SOS alerts" });
        }
      }
      
      await storage.updateSosAlertStatus(sosId, status);
      
      res.json({ message: "SOS alert status updated" });
    } catch (error) {
      console.error('Error updating SOS alert status:', error);
      res.status(500).json({ message: "Error updating SOS alert status" });
    }
  });
  
  app.post('/api/sos/:id/assign', hasRole(['admin', 'volunteer']), async (req, res) => {
    try {
      const sosId = parseInt(req.params.id);
      const { volunteerId } = req.body;
      
      if (!volunteerId) {
        return res.status(400).json({ message: "Volunteer ID is required" });
      }
      
      const sosAlert = await storage.getSosAlertById(sosId);
      
      if (!sosAlert) {
        return res.status(404).json({ message: "SOS alert not found" });
      }
      
      // If the user is a volunteer, they can only assign to themselves
      if (req.user?.role === 'volunteer' && volunteerId !== req.user.id) {
        return res.status(403).json({ message: "Volunteers can only assign alerts to themselves" });
      }
      
      await storage.assignVolunteerToSosAlert(sosId, volunteerId);
      
      res.json({ message: "Volunteer assigned to SOS alert" });
    } catch (error) {
      console.error('Error assigning volunteer to SOS alert:', error);
      res.status(500).json({ message: "Error assigning volunteer to SOS alert" });
    }
  });
  
  // Task completion endpoints
  app.post('/api/tasks/complete', hasRole(['volunteer']), async (req, res) => {
    try {
      const { sosAlertId, notes, proofImageUrl } = req.body;
      
      if (!sosAlertId) {
        return res.status(400).json({ message: "SOS Alert ID is required" });
      }
      
      // Verify the SOS alert exists and belongs to this volunteer
      const sosAlert = await storage.getSosAlertById(sosAlertId);
      
      if (!sosAlert) {
        return res.status(404).json({ message: "SOS alert not found" });
      }
      
      if (sosAlert.assignedVolunteerId !== req.user!.id) {
        return res.status(403).json({ message: "You can only complete tasks assigned to you" });
      }
      
      if (sosAlert.status !== "resolved") {
        return res.status(400).json({ message: "SOS alert must be marked as resolved before completing the task" });
      }
      
      // Create the task completion record
      const taskData = {
        sosAlertId,
        volunteerId: req.user!.id,
        notes: notes || "Task completed successfully",
        proofImageUrl: proofImageUrl,
        pointsAwarded: 0, // Points will be awarded by admin later
        completedAt: new Date()
      };
      
      const task = await storage.completeTask(taskData);
      
      // Get the current profile and update task count
      const volunteerProfile = await db.query.volunteerProfiles.findFirst({
        where: eq(schema.volunteerProfiles.userId, req.user!.id)
      });
      
      if (volunteerProfile) {
        await db.update(schema.volunteerProfiles)
          .set({ 
            tasksCompleted: (volunteerProfile.tasksCompleted || 0) + 1,
            status: "available" as schema.VolunteerStatus 
          })
          .where(eq(schema.volunteerProfiles.userId, req.user!.id));
      }
      
      // Update stats
      const stats = await storage.getStatistics();
      if (stats) {
        await storage.updateStatistics({ crisesResolved: stats.crisesResolved + 1 });
      }
      
      res.status(201).json(task);
    } catch (error) {
      console.error('Error completing task:', error);
      res.status(500).json({ message: "Error completing task" });
    }
  });
  
  app.get('/api/tasks', isAuthenticated, async (req, res) => {
    try {
      const { volunteerId, sosAlertId, limit, offset } = req.query;
      
      // If sosAlertId is provided, fetch tasks for that SOS alert
      if (sosAlertId && req.user?.role === 'admin') {
        const tasks = await db.query.taskCompletions.findMany({
          where: eq(schema.taskCompletions.sosAlertId, parseInt(sosAlertId as string)),
          orderBy: [desc(schema.taskCompletions.completedAt)]
        });
        
        // Enrich with volunteer data
        const tasksWithVolunteer = await Promise.all(
          tasks.map(async (task) => {
            const volunteer = await db.query.users.findFirst({
              where: eq(schema.users.id, task.volunteerId),
              with: {
                volunteerProfile: true
              }
            });
            
            return {
              ...task,
              volunteer
            };
          })
        );
        
        return res.json(tasksWithVolunteer);
      }
      
      // Check permissions
      if (req.user?.role === 'volunteer' && (!volunteerId || parseInt(volunteerId as string) !== req.user.id)) {
        // Volunteers can only see their own tasks
        const tasks = await storage.getTaskCompletions(
          req.user.id,
          limit ? parseInt(limit as string) : undefined,
          offset ? parseInt(offset as string) : undefined
        );
        
        return res.json(tasks);
      }
      
      if (req.user?.role === 'admin' && volunteerId) {
        // Admin can see any volunteer's tasks
        const tasks = await storage.getTaskCompletions(
          parseInt(volunteerId as string),
          limit ? parseInt(limit as string) : undefined,
          offset ? parseInt(offset as string) : undefined
        );
        
        return res.json(tasks);
      }
      
      return res.status(400).json({ message: "Volunteer ID or SOS Alert ID is required" });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });
  
  // Feedback endpoints
  app.post('/api/feedback', hasRole(['citizen']), async (req, res) => {
    try {
      const feedbackData = {
        ...req.body,
        citizenId: req.user!.id,
      };
      
      const feedback = await storage.submitFeedback(feedbackData);
      
      res.status(201).json(feedback);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ message: "Error submitting feedback" });
    }
  });
  
  app.get('/api/feedback', isAuthenticated, async (req, res) => {
    try {
      const { volunteerId, limit, offset } = req.query;
      
      if (!volunteerId) {
        return res.status(400).json({ message: "Volunteer ID is required" });
      }
      
      const feedback = await storage.getFeedbackByVolunteer(
        parseInt(volunteerId as string),
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );
      
      res.json(feedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ message: "Error fetching feedback" });
    }
  });
  
  // Volunteer endpoints

  // Admin assigns points to a volunteer after task completion
  app.post('/api/volunteer/:id/award-points', hasRole(['admin']), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const points = Number(req.body.points);
      if (isNaN(points)) {
        return res.status(400).json({ message: "Valid numeric points are required" });
      }

      await storage.updateVolunteerPoints(userId, points);
      res.json({ message: "Points awarded successfully" });
    } catch (error) {
      console.error("Error awarding points:", error);
      res.status(500).json({ message: "Failed to award points" });
    }
  });
  app.get('/api/volunteers', hasRole(['admin']), async (req, res) => {
    try {
      const { limit, offset } = req.query;
      
      // Get volunteer users with their profiles
      const volunteers = await db.query.users.findMany({
        where: eq(schema.users.role, 'volunteer'),
        with: {
          volunteerProfile: true
        },
        limit: limit ? parseInt(limit as string) : 10,
        offset: offset ? parseInt(offset as string) : 0,
        orderBy: desc(schema.users.id)
      });
      
      res.json(volunteers);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      res.status(500).json({ message: "Error fetching volunteers" });
    }
  });
  
  app.patch('/api/volunteers/status', hasRole(['volunteer']), async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      await storage.updateVolunteerStatus(req.user!.id, status);
      
      // Update active volunteers count in statistics
      const stats = await storage.getStatistics();
      
      if (stats) {
        if (status === 'available') {
          await storage.updateStatistics({ activeVolunteers: stats.activeVolunteers + 1 });
        } else if (status === 'offline') {
          await storage.updateStatistics({ activeVolunteers: Math.max(0, stats.activeVolunteers - 1) });
        }
      }
      
      res.json({ message: "Volunteer status updated" });
    } catch (error) {
      console.error('Error updating volunteer status:', error);
      res.status(500).json({ message: "Error updating volunteer status" });
    }
  });
  
  // Certificate endpoints
  app.get('/api/certificates', isAuthenticated, async (req, res) => {
    try {
      const { volunteerId } = req.query;
      
      if (!volunteerId) {
        return res.status(400).json({ message: "Volunteer ID is required" });
      }
      
      // Check permissions
      if (req.user?.role === 'volunteer' && parseInt(volunteerId as string) !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const certificates = await storage.getCertificates(parseInt(volunteerId as string));
      
      res.json(certificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      res.status(500).json({ message: "Error fetching certificates" });
    }
  });
  
  // Broadcast message endpoints
  app.post('/api/broadcasts', hasRole(['admin']), async (req, res) => {
    try {
      const messageData = {
        ...req.body,
        senderId: req.user!.id
      };
      
      // Create the broadcast message
      const message = await storage.createBroadcastMessage(messageData);
      
      // Send email notifications based on target role
      try {
        const { sendEmail, emailTemplates, DEFAULT_FROM_EMAIL } = await import('./services/email');
        
        // Get users to send the broadcast to
        let usersQuery = db.select()
          .from(schema.users)
          .where(
            messageData.targetRole === 'all' 
              ? or(eq(schema.users.role, 'volunteer'), eq(schema.users.role, 'citizen'))
              : eq(schema.users.role, messageData.targetRole)
          );
        
        const targetUsers = await usersQuery;
        const emailPromises = targetUsers
          .filter(user => !!user.email)
          .map(async (user) => {
            const emailContent = emailTemplates.broadcastMessage(
              user.name, 
              messageData.title,
              messageData.content
            );
            
            return sendEmail({
              to: user.email,
              from: DEFAULT_FROM_EMAIL,
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text
            });
          });
          
        // Send emails in parallel
        await Promise.allSettled(emailPromises);
        console.log(`Broadcast email sent to ${emailPromises.length} users`);
      } catch (emailError) {
        // Log the error but don't fail the broadcast creation
        console.error('Error sending broadcast emails:', emailError);
      }
      
      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating broadcast message:', error);
      res.status(500).json({ message: "Error creating broadcast message" });
    }
  });
  
  app.get('/api/broadcasts', isAuthenticated, async (req, res) => {
    try {
      const { limit, offset } = req.query;
      
      // Filter by user role
      const messages = await storage.getBroadcastMessages(
        req.user!.role,
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );
      
      res.json(messages);
    } catch (error) {
      console.error('Error fetching broadcast messages:', error);
      res.status(500).json({ message: "Error fetching broadcast messages" });
    }
  });
  
  // User management endpoints
  app.post('/api/users/volunteer', hasRole(['admin']), async (req, res) => {
    try {
      const userData = {
        ...req.body,
        role: 'volunteer'
      };
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Create volunteer profile
      await db.insert(schema.volunteerProfiles).values({
        userId: user.id,
        status: 'offline',
        points: 0,
        tasksCompleted: 0
      });
      
      // Auto-login the new volunteer after creation
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after volunteer creation:", err);
          return res.status(500).json({ message: "Auto-login failed" });
        }
        res.status(201).json({ message: "Volunteer created and logged in" });
      });
      return;
    } catch (error) {
      console.error('Error creating volunteer:', error);
      res.status(500).json({ message: "Error creating volunteer" });
    }
  });
  
  // Volunteer approval endpoints
  app.get('/api/volunteers/pending', hasRole(['admin']), async (req, res) => {
    try {
      // Get volunteer users with pending approval status
      const volunteers = await db.query.users.findMany({
        where: eq(schema.users.role, 'volunteer'),
        with: {
          volunteerProfile: true
        },
        orderBy: desc(schema.users.id)
      });
      
      // Filter volunteers with pending approval status
      const pendingVolunteers = volunteers.filter(volunteer => 
        volunteer.volunteerProfile && volunteer.volunteerProfile.approvalStatus === 'pending'
      );
      
      res.json(pendingVolunteers);
    } catch (error) {
      console.error('Error fetching pending volunteers:', error);
      res.status(500).json({ message: "Error fetching pending volunteers" });
    }
  });
  
  app.patch('/api/volunteers/:id/approve', hasRole(['admin']), async (req, res) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      // Verify the volunteer exists
      const volunteer = await db.query.users.findFirst({
        where: eq(schema.users.id, volunteerId),
        with: {
          volunteerProfile: true
        }
      });
      
      if (!volunteer || volunteer.role !== 'volunteer') {
        return res.status(404).json({ message: "Volunteer not found" });
      }
      
      // Update the volunteer's approval status
      await db.update(schema.volunteerProfiles)
        .set({ 
          status: 'available',
          approvalStatus: 'approved' as schema.VolunteerApprovalStatus 
        })
        .where(eq(schema.volunteerProfiles.userId, volunteerId));
      
      // Update statistics for active volunteers
      const stats = await storage.getStatistics();
      if (stats) {
        await storage.updateStatistics({ activeVolunteers: stats.activeVolunteers + 1 });
      }
      
      // Send email notification
      if (volunteer.email) {
        try {
          const { sendEmail, emailTemplates, DEFAULT_FROM_EMAIL } = await import('./services/email');
          const emailContent = emailTemplates.volunteerApproval(volunteer.name);
          
          await sendEmail({
            to: volunteer.email,
            from: DEFAULT_FROM_EMAIL,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text
          });
          
          console.log(`Approval notification email sent to volunteer ${volunteer.name} (${volunteer.email})`);
        } catch (emailError) {
          // Log the error but don't fail the approval process
          console.error('Failed to send approval email:', emailError);
        }
      }
      
      res.json({ message: "Volunteer approved successfully" });
    } catch (error) {
      console.error('Error approving volunteer:', error);
      res.status(500).json({ message: "Error approving volunteer" });
    }
  });
  
  app.patch('/api/volunteers/:id/reject', hasRole(['admin']), async (req, res) => {
    try {
      const volunteerId = parseInt(req.params.id);
      
      // Verify the volunteer exists
      const volunteer = await db.query.users.findFirst({
        where: eq(schema.users.id, volunteerId),
        with: {
          volunteerProfile: true
        }
      });
      
      if (!volunteer || volunteer.role !== 'volunteer') {
        return res.status(404).json({ message: "Volunteer not found" });
      }
      
      // Update the volunteer's approval status
      await db.update(schema.volunteerProfiles)
        .set({ approvalStatus: 'rejected', status: 'offline' })
        .where(eq(schema.volunteerProfiles.userId, volunteerId));
      
      // Send email notification
      if (volunteer.email) {
        try {
          const { sendEmail, emailTemplates, DEFAULT_FROM_EMAIL } = await import('./services/email');
          const emailContent = emailTemplates.volunteerRejection(volunteer.name);
          
          await sendEmail({
            to: volunteer.email,
            from: DEFAULT_FROM_EMAIL,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text
          });
          
          console.log(`Rejection notification email sent to volunteer ${volunteer.name} (${volunteer.email})`);
        } catch (emailError) {
          // Log the error but don't fail the rejection process
          console.error('Failed to send rejection email:', emailError);
        }
      }
      
      res.json({ message: "Volunteer rejected successfully" });
    } catch (error) {
      console.error('Error rejecting volunteer:', error);
      res.status(500).json({ message: "Error rejecting volunteer" });
    }
  });
  
  // Endpoint to update volunteer points
  app.patch('/api/volunteers/:id/points', hasRole(['admin']), async (req, res) => {
    try {
      const volunteerId = parseInt(req.params.id);
      const { points } = req.body;
      
      if (points === undefined) {
        return res.status(400).json({ message: "Points are required" });
      }
      
      // Verify the volunteer exists
      const volunteer = await db.query.users.findFirst({
        where: eq(schema.users.id, volunteerId),
        with: {
          volunteerProfile: true
        }
      });
      
      if (!volunteer || volunteer.role !== 'volunteer') {
        return res.status(404).json({ message: "Volunteer not found" });
      }
      
      // Update points
      await storage.updateVolunteerPoints(volunteerId, points);
      
      // Update badge based on new points
      const currentPoints = (volunteer.volunteerProfile?.points || 0) + points;
      let badge: schema.Badge | null = null;
      
      if (currentPoints >= 200) {
        badge = "ResQLegend";
      } else if (currentPoints >= 100) {
        badge = "DisasterHero";
      } else if (currentPoints >= 50) {
        badge = "RescueRookie";
      }
      
      if (badge) {
        await db.update(schema.volunteerProfiles)
          .set({ badge })
          .where(eq(schema.volunteerProfiles.userId, volunteerId));
      }
      
      // Send email notification about points awarded
      if (volunteer.email) {
        try {
          const { sendEmail, emailTemplates, DEFAULT_FROM_EMAIL } = await import('./services/email');
          const emailContent = emailTemplates.pointsAwarded(
            volunteer.name, 
            points, 
            currentPoints, 
            badge || volunteer.volunteerProfile?.badge || "Newcomer"
          );
          
          await sendEmail({
            to: volunteer.email,
            from: DEFAULT_FROM_EMAIL,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text
          });
          
          console.log(`Points award notification email sent to volunteer ${volunteer.name} (${volunteer.email})`);
        } catch (emailError) {
          // Log the error but don't fail the points update
          console.error('Failed to send points award email:', emailError);
        }
      }
      
      res.json({ 
        message: "Volunteer points updated successfully",
        newPoints: currentPoints,
        badge
      });
    } catch (error) {
      console.error('Error updating volunteer points:', error);
      res.status(500).json({ message: "Error updating volunteer points" });
    }
  });

  // Authenticated user profile (live fetch from DB)
  app.get('/api/me', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, userId)
      });

      const volunteerProfile = await db.query.volunteerProfiles.findFirst({
        where: eq(schema.volunteerProfiles.userId, userId)
      });

      res.json({ ...user, volunteerProfile });
    } catch (error) {
      console.error("Error in /api/me:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Fallback route to serve the SPA
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    if (process.env.NODE_ENV === 'production') {
      const clientPath = path.resolve(process.cwd(), 'dist', 'public', 'index.html');
      res.sendFile(clientPath);
    } else {
      next();
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time communications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients = new Map<number, WebSocket>();
  
  wss.on('connection', (ws) => {
    let userId: number | null = null;
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication
        if (data.type === 'auth' && typeof data.userId === 'number') {
          userId = data.userId;
          if (userId !== null) {
            clients.set(userId, ws);
          }
        }
        
        // Handle SOS alerts
        if (data.type === 'sos' && userId) {
          // Broadcast to admin and available volunteers
          clients.forEach((client, clientId) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'sos_alert',
                data: data.data
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  return httpServer;
}
