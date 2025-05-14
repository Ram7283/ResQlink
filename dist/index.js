var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/services/email.ts
var email_exports = {};
__export(email_exports, {
  DEFAULT_FROM_EMAIL: () => DEFAULT_FROM_EMAIL,
  emailTemplates: () => emailTemplates,
  sendEmail: () => sendEmail
});
import { MailService } from "@sendgrid/mail";
async function sendEmail(params) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Email sending disabled: SENDGRID_API_KEY not set");
    return false;
  }
  try {
    await mailService.send({
      to: params.to,
      from: params.from || DEFAULT_FROM_EMAIL,
      subject: params.subject,
      text: params.text || "",
      html: params.html || ""
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error("SendGrid email error:", error);
    return false;
  }
}
var mailService, DEFAULT_FROM_EMAIL, emailTemplates;
var init_email = __esm({
  "server/services/email.ts"() {
    "use strict";
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SENDGRID_API_KEY environment variable is not set. Email functionality will be disabled.");
    }
    mailService = new MailService();
    if (process.env.SENDGRID_API_KEY) {
      mailService.setApiKey(process.env.SENDGRID_API_KEY);
    }
    DEFAULT_FROM_EMAIL = "notifications@resqlink.org";
    emailTemplates = {
      volunteerApproval: (volunteerName) => ({
        subject: "ResQLink: Your Volunteer Application Has Been Approved",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://resqlink.org/logo.png" alt="ResQLink Logo" style="width: 150px;" />
        </div>
        <div style="padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0;">
          <h2>Welcome to the ResQLink Volunteer Team!</h2>
          <p>Hello ${volunteerName},</p>
          <p>We are pleased to inform you that your application to join ResQLink as a volunteer has been <strong>approved</strong>!</p>
          <p>You are now part of a dedicated community of individuals committed to helping others during crisis situations.</p>
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Log in to your ResQLink account</li>
              <li>Update your availability status when you're ready to help</li>
              <li>Review the resources in your dashboard to familiarize yourself with protocols</li>
            </ol>
          </div>
          <p>Thank you for your dedication to helping those in need. Together, we can make a difference!</p>
          <p>Best regards,<br />The ResQLink Team</p>
          <a href="https://resqlink.org/login" style="display: block; text-align: center; margin: 30px auto; padding: 10px 25px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; width: 150px;">Log In Now</a>
        </div>
        <div style="text-align: center; padding: 15px; font-size: 12px; color: #777;">
          <p>\xA9 2025 ResQLink. All rights reserved.</p>
        </div>
      </div>
    `,
        text: `Welcome to the ResQLink Volunteer Team!
    
Hello ${volunteerName},

We are pleased to inform you that your application to join ResQLink as a volunteer has been approved!

You are now part of a dedicated community of individuals committed to helping others during crisis situations.

Next Steps:
1. Log in to your ResQLink account
2. Update your availability status when you're ready to help
3. Review the resources in your dashboard to familiarize yourself with protocols

Thank you for your dedication to helping those in need. Together, we can make a difference!

Best regards,
The ResQLink Team`
      }),
      volunteerRejection: (volunteerName) => ({
        subject: "ResQLink: Status Update on Your Volunteer Application",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://resqlink.org/logo.png" alt="ResQLink Logo" style="width: 150px;" />
        </div>
        <div style="padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0;">
          <h2>Volunteer Application Update</h2>
          <p>Hello ${volunteerName},</p>
          <p>Thank you for your interest in volunteering with ResQLink.</p>
          <p>After careful review of your application, we regret to inform you that we are unable to proceed with your volunteer registration at this time.</p>
          <p>If you would like to discuss this further or receive feedback on your application, please contact our support team at support@resqlink.org.</p>
          <p>We encourage you to consider applying again in the future.</p>
          <p>Best regards,<br />The ResQLink Team</p>
        </div>
        <div style="text-align: center; padding: 15px; font-size: 12px; color: #777;">
          <p>\xA9 2025 ResQLink. All rights reserved.</p>
        </div>
      </div>
    `,
        text: `Volunteer Application Update

Hello ${volunteerName},

Thank you for your interest in volunteering with ResQLink.

After careful review of your application, we regret to inform you that we are unable to proceed with your volunteer registration at this time.

If you would like to discuss this further or receive feedback on your application, please contact our support team at support@resqlink.org.

We encourage you to consider applying again in the future.

Best regards,
The ResQLink Team`
      }),
      sosAlertNotification: (volunteerName, alertDetails) => ({
        subject: "URGENT: SOS Alert in Your Area",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://resqlink.org/logo.png" alt="ResQLink Logo" style="width: 150px;" />
        </div>
        <div style="padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0; background-color: #fff8f8;">
          <h2 style="color: #d9534f;">\u26A0\uFE0F URGENT: SOS Alert in Your Area</h2>
          <p>Hello ${volunteerName},</p>
          <p>A citizen in your area needs immediate assistance:</p>
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #d9534f;">
            <p><strong>Location:</strong> ${alertDetails.location}</p>
            <p><strong>Description:</strong> ${alertDetails.description}</p>
          </div>
          <p>Please log in to the ResQLink platform immediately to view details and respond if you're available.</p>
          <a href="https://resqlink.org/volunteer/dashboard" style="display: block; text-align: center; margin: 30px auto; padding: 10px 25px; background-color: #d9534f; color: white; text-decoration: none; border-radius: 4px; width: 200px;">Respond Now</a>
          <p>Your quick response could save lives.</p>
          <p>Thank you for your dedication,<br />The ResQLink Team</p>
        </div>
      </div>
    `,
        text: `\u26A0\uFE0F URGENT: SOS Alert in Your Area

Hello ${volunteerName},

A citizen in your area needs immediate assistance:

Location: ${alertDetails.location}
Description: ${alertDetails.description}

Please log in to the ResQLink platform immediately to view details and respond if you're available.

Your quick response could save lives.

Thank you for your dedication,
The ResQLink Team`
      }),
      certificateGenerated: (volunteerName, certificateLink) => ({
        subject: "ResQLink: Your Achievement Certificate",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://resqlink.org/logo.png" alt="ResQLink Logo" style="width: 150px;" />
        </div>
        <div style="padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0;">
          <h2>Your Certificate of Achievement</h2>
          <p>Hello ${volunteerName},</p>
          <p>Congratulations on completing 10 successful rescue missions with ResQLink!</p>
          <p>Your dedication and commitment to helping others during crisis situations has been truly outstanding.</p>
          <p>We are pleased to award you with a Certificate of Achievement recognizing your valuable contributions to the community.</p>
          <a href="${certificateLink}" style="display: block; text-align: center; margin: 30px auto; padding: 10px 25px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; width: 200px;">View Your Certificate</a>
          <p>Thank you for your exceptional service!</p>
          <p>Best regards,<br />The ResQLink Team</p>
        </div>
      </div>
    `,
        text: `Your Certificate of Achievement

Hello ${volunteerName},

Congratulations on completing 10 successful rescue missions with ResQLink!

Your dedication and commitment to helping others during crisis situations has been truly outstanding.

We are pleased to award you with a Certificate of Achievement recognizing your valuable contributions to the community.

You can view and download your certificate here: ${certificateLink}

Thank you for your exceptional service!

Best regards,
The ResQLink Team`
      }),
      broadcastMessage: (userName, title, message) => ({
        subject: `ResQLink Broadcast: ${title}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://resqlink.org/logo.png" alt="ResQLink Logo" style="width: 150px;" />
        </div>
        <div style="padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0;">
          <h2>${title}</h2>
          <p>Hello ${userName},</p>
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p>${message}</p>
          </div>
          <p>Stay safe and thank you for being part of ResQLink.</p>
          <p>Best regards,<br />The ResQLink Team</p>
          <a href="https://resqlink.org/dashboard" style="display: block; text-align: center; margin: 30px auto; padding: 10px 25px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; width: 200px;">Go to Dashboard</a>
        </div>
      </div>
    `,
        text: `${title}

Hello ${userName},

${message}

Stay safe and thank you for being part of ResQLink.

Best regards,
The ResQLink Team`
      }),
      pointsAwarded: (volunteerName, pointsAwarded, totalPoints, badge) => ({
        subject: "ResQLink: Points Awarded for Your Service",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://resqlink.org/logo.png" alt="ResQLink Logo" style="width: 150px;" />
        </div>
        <div style="padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0;">
          <h2>Points Awarded for Your Service!</h2>
          <p>Hello ${volunteerName},</p>
          <p>Congratulations! You've been awarded <strong>${pointsAwarded} points</strong> for your recent assistance during an emergency.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center;">
            <h3 style="margin-top: 0; color: #4CAF50;">Your Volunteer Status</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${totalPoints} Total Points</p>
            <div style="background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px; display: inline-block; margin-top: 10px;">
              <p style="margin: 0; font-weight: bold;">Current Badge: ${badge}</p>
            </div>
          </div>
          
          <p>Your dedication to helping those in need is invaluable. These points reflect the impact you're making in your community.</p>
          <p>Continue responding to alerts and completing missions to earn more points and unlock higher badges!</p>
          <p>Thank you for your service,<br />The ResQLink Team</p>
          <a href="https://resqlink.org/volunteer/dashboard" style="display: block; text-align: center; margin: 30px auto; padding: 10px 25px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; width: 200px;">View Your Dashboard</a>
        </div>
        <div style="text-align: center; padding: 15px; font-size: 12px; color: #777;">
          <p>\xA9 2025 ResQLink. All rights reserved.</p>
        </div>
      </div>
    `,
        text: `Points Awarded for Your Service!

Hello ${volunteerName},

Congratulations! You've been awarded ${pointsAwarded} points for your recent assistance during an emergency.

Your Volunteer Status
Total Points: ${totalPoints}
Current Badge: ${badge}

Your dedication to helping those in need is invaluable. These points reflect the impact you're making in your community.

Continue responding to alerts and completing missions to earn more points and unlock higher badges!

Thank you for your service,
The ResQLink Team`
      })
    };
  }
});

// server/index.ts
import path4 from "path";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// db/index.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  BadgeEnum: () => BadgeEnum,
  SosAlertStatusEnum: () => SosAlertStatusEnum,
  UserRoleEnum: () => UserRoleEnum,
  VolunteerApprovalStatusEnum: () => VolunteerApprovalStatusEnum,
  VolunteerStatusEnum: () => VolunteerStatusEnum,
  adminProfiles: () => adminProfiles,
  broadcastMessages: () => broadcastMessages,
  broadcasts: () => broadcasts,
  certificates: () => certificates,
  citizenProfiles: () => citizenProfiles,
  feedback: () => feedback,
  helpCenters: () => helpCenters,
  insertCitizenProfileSchema: () => insertCitizenProfileSchema,
  insertFeedbackSchema: () => insertFeedbackSchema,
  insertHelpCenterSchema: () => insertHelpCenterSchema,
  insertResourceSchema: () => insertResourceSchema,
  insertSosAlertSchema: () => insertSosAlertSchema,
  insertStatisticsSchema: () => insertStatisticsSchema,
  insertTaskCompletionSchema: () => insertTaskCompletionSchema,
  insertUserSchema: () => insertUserSchema,
  insertVolunteerProfileSchema: () => insertVolunteerProfileSchema,
  resources: () => resources,
  selectCitizenProfileSchema: () => selectCitizenProfileSchema,
  selectFeedbackSchema: () => selectFeedbackSchema,
  selectHelpCenterSchema: () => selectHelpCenterSchema,
  selectResourceSchema: () => selectResourceSchema,
  selectSosAlertSchema: () => selectSosAlertSchema,
  selectStatisticsSchema: () => selectStatisticsSchema,
  selectTaskCompletionSchema: () => selectTaskCompletionSchema,
  selectUserSchema: () => selectUserSchema,
  selectVolunteerProfileSchema: () => selectVolunteerProfileSchema,
  sosAlerts: () => sosAlerts,
  sosAlertsRelations: () => sosAlertsRelations,
  statistics: () => statistics,
  taskCompletions: () => taskCompletions,
  users: () => users,
  usersRelations: () => usersRelations,
  volunteerProfiles: () => volunteerProfiles
});
import { pgTable, text, serial, integer, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var UserRoleEnum = z.enum(["admin", "volunteer", "citizen"]);
var VolunteerStatusEnum = z.enum(["available", "busy", "offline"]);
var BadgeEnum = z.enum(["RescueRookie", "DisasterHero", "ResQLegend"]);
var SosAlertStatusEnum = z.enum(["new", "assigned", "in-progress", "resolved", "cancelled"]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "volunteer", "citizen"] }).notNull(),
  location: text("location"),
  phone: text("phone"),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var adminProfiles = pgTable("admin_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique()
});
var VolunteerApprovalStatusEnum = z.enum(["pending", "approved", "rejected"]);
var volunteerProfiles = pgTable("volunteer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  status: text("status", { enum: ["available", "busy", "offline"] }).default("offline").notNull(),
  approvalStatus: text("approval_status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  points: integer("points").default(0).notNull(),
  tasksCompleted: integer("tasks_completed").default(0).notNull(),
  badge: text("badge", { enum: ["RescueRookie", "DisasterHero", "ResQLegend"] }),
  skills: json("skills").$type(),
  bio: text("bio"),
  profilePicture: text("profile_picture")
});
var citizenProfiles = pgTable("citizen_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  emergencyContact: text("emergency_contact"),
  medicalInfo: text("medical_info")
});
var sosAlerts = pgTable("sos_alerts", {
  id: serial("id").primaryKey(),
  citizenId: integer("citizen_id").references(() => users.id).notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  status: text("status", { enum: ["new", "assigned", "in-progress", "resolved", "cancelled"] }).default("new").notNull(),
  assignedVolunteerId: integer("assigned_volunteer_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var taskCompletions = pgTable("task_completions", {
  id: serial("id").primaryKey(),
  sosAlertId: integer("sos_alert_id").references(() => sosAlerts.id).notNull(),
  volunteerId: integer("volunteer_id").references(() => users.id).notNull(),
  proofImageUrl: text("proof_image_url"),
  notes: text("notes"),
  pointsAwarded: integer("points_awarded").default(10).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull()
});
var feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  sosAlertId: integer("sos_alert_id").references(() => sosAlerts.id).notNull(),
  citizenId: integer("citizen_id").references(() => users.id).notNull(),
  volunteerId: integer("volunteer_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").references(() => users.id).notNull(),
  certificateUrl: text("certificate_url").notNull(),
  qrCode: text("qr_code").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull()
});
var helpCenters = pgTable("help_centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  address: text("address").notNull(),
  contactNumber: text("contact_number"),
  servicesOffered: json("services_offered").$type(),
  operatingHours: text("operating_hours"),
  status: text("status", { enum: ["active", "inactive"] }).default("active")
});
var broadcastMessages = pgTable("broadcast_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  targetRole: text("target_role", { enum: ["all", "volunteer", "citizen"] }).default("all").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  crisesResolved: integer("crises_resolved").default(0).notNull(),
  activeVolunteers: integer("active_volunteers").default(0).notNull(),
  peopleHelped: integer("people_helped").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  resourceType: text("resource_type", { enum: ["guide", "video", "document"] }).notNull(),
  language: text("language").default("en").notNull(),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var usersRelations = relations(users, ({ one, many }) => ({
  adminProfile: one(adminProfiles, {
    fields: [users.id],
    references: [adminProfiles.userId]
  }),
  volunteerProfile: one(volunteerProfiles, {
    fields: [users.id],
    references: [volunteerProfiles.userId]
  }),
  citizenProfile: one(citizenProfiles, {
    fields: [users.id],
    references: [citizenProfiles.userId]
  }),
  sosAlerts: many(sosAlerts, { relationName: "citizenSosAlerts" }),
  assignedAlerts: many(sosAlerts, { relationName: "volunteerSosAlerts" }),
  sentBroadcasts: many(broadcastMessages),
  completedTasks: many(taskCompletions),
  certificates: many(certificates),
  receivedFeedback: many(feedback, { relationName: "volunteerFeedback" }),
  givenFeedback: many(feedback, { relationName: "citizenFeedback" })
}));
var sosAlertsRelations = relations(sosAlerts, ({ one, many }) => ({
  citizen: one(users, {
    fields: [sosAlerts.citizenId],
    references: [users.id],
    relationName: "citizenSosAlerts"
  }),
  assignedVolunteer: one(users, {
    fields: [sosAlerts.assignedVolunteerId],
    references: [users.id],
    relationName: "volunteerSosAlerts"
  }),
  completion: one(taskCompletions),
  feedback: one(feedback)
}));
var insertUserSchema = createInsertSchema(users);
var selectUserSchema = createSelectSchema(users);
var insertVolunteerProfileSchema = createInsertSchema(volunteerProfiles);
var selectVolunteerProfileSchema = createSelectSchema(volunteerProfiles);
var insertCitizenProfileSchema = createInsertSchema(citizenProfiles);
var selectCitizenProfileSchema = createSelectSchema(citizenProfiles);
var insertSosAlertSchema = createInsertSchema(sosAlerts);
var selectSosAlertSchema = createSelectSchema(sosAlerts);
var insertFeedbackSchema = createInsertSchema(feedback);
var selectFeedbackSchema = createSelectSchema(feedback);
var insertTaskCompletionSchema = createInsertSchema(taskCompletions);
var selectTaskCompletionSchema = createSelectSchema(taskCompletions);
var insertHelpCenterSchema = createInsertSchema(helpCenters);
var selectHelpCenterSchema = createSelectSchema(helpCenters);
var insertResourceSchema = createInsertSchema(resources);
var selectResourceSchema = createSelectSchema(resources);
var insertStatisticsSchema = createInsertSchema(statistics);
var selectStatisticsSchema = createSelectSchema(statistics);
var broadcasts = pgTable("broadcasts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  target: text("target").notNull(),
  // "all", "citizens", "volunteers"
  createdAt: timestamp("created_at").defaultNow()
});

// db/index.ts
import dotenv from "dotenv";
dotenv.config();
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, asc, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: "session"
    });
  }
  // User methods
  async getUser(id) {
    return await db.query.users.findFirst({
      where: eq(users.id, id)
    });
  }
  async getUserByUsername(username) {
    return await db.query.users.findFirst({
      where: eq(users.username, username)
    });
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  // Volunteer methods
  async getVolunteerProfile(userId) {
    return await db.query.volunteerProfiles.findFirst({
      where: eq(volunteerProfiles.userId, userId)
    });
  }
  async updateVolunteerStatus(userId, status) {
    await db.update(volunteerProfiles).set({ status }).where(eq(volunteerProfiles.userId, userId));
  }
  async updateVolunteerPoints(userId, points) {
    if (points === void 0) return;
    const volunteerProfile = await this.getVolunteerProfile(userId);
    if (!volunteerProfile) return;
    const newPoints = Number(volunteerProfile.points) + Number(points);
    let badge = volunteerProfile.badge;
    if (newPoints >= 200) {
      badge = "ResQLegend";
    } else if (newPoints >= 100) {
      badge = "DisasterHero";
    } else if (newPoints >= 50) {
      badge = "RescueRookie";
    }
    await db.update(volunteerProfiles).set({ points: newPoints, badge }).where(eq(volunteerProfiles.userId, userId));
  }
  async getVolunteers(limit = 10, offset = 0) {
    return await db.query.users.findMany({
      where: eq(users.role, "volunteer"),
      limit,
      offset,
      with: {
        volunteerProfile: true
      }
    });
  }
  async getAvailableVolunteersNearLocation(latitude, longitude, radius = 10) {
    return await db.query.users.findMany({
      where: eq(users.role, "volunteer"),
      with: {
        volunteerProfile: true
      }
    });
  }
  // Citizen methods
  async getCitizenProfile(userId) {
    return await db.query.citizenProfiles.findFirst({
      where: eq(citizenProfiles.userId, userId)
    });
  }
  // SOS methods
  async createSosAlert(alertData) {
    const [alert] = await db.insert(sosAlerts).values(alertData).returning();
    return alert;
  }
  async getSosAlerts(status, limit = 10, offset = 0) {
    if (status) {
      return await db.query.sosAlerts.findMany({
        where: eq(sosAlerts.status, status),
        limit,
        offset,
        orderBy: [desc(sosAlerts.createdAt)]
      });
    }
    return await db.query.sosAlerts.findMany({
      limit,
      offset,
      orderBy: [desc(sosAlerts.createdAt)]
    });
  }
  async getSosAlertById(id) {
    return await db.query.sosAlerts.findFirst({
      where: eq(sosAlerts.id, id),
      with: {
        citizen: true,
        assignedVolunteer: true
      }
    });
  }
  async updateSosAlertStatus(id, status) {
    await db.update(sosAlerts).set({
      status,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(sosAlerts.id, id));
    if (status === "resolved") {
      const stats = await this.getStatistics();
      if (stats) {
        await this.updateStatistics({
          crisesResolved: stats.crisesResolved + 1
        });
      }
    }
  }
  async assignVolunteerToSosAlert(alertId, volunteerId) {
    await db.update(sosAlerts).set({
      assignedVolunteerId: volunteerId,
      status: "assigned",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(sosAlerts.id, alertId));
  }
  // Task completion methods
  async completeTask(taskData) {
    const [task] = await db.insert(taskCompletions).values(taskData).returning();
    const profile = await this.getVolunteerProfile(taskData.volunteerId);
    if (profile) {
      const updatedTaskCount = profile.tasksCompleted + 1;
      await db.update(volunteerProfiles).set({
        tasksCompleted: updatedTaskCount
      }).where(eq(volunteerProfiles.userId, taskData.volunteerId));
      if (taskData.pointsAwarded) {
        await this.updateVolunteerPoints(taskData.volunteerId, taskData.pointsAwarded);
      }
      if (updatedTaskCount % 10 === 0) {
        const certificateUrl = `/certificates/volunteer-${taskData.volunteerId}-cert-${Date.now()}.pdf`;
        const qrCode = `https://resqlink.org/verify-certificate/${taskData.volunteerId}-${Date.now()}`;
        await this.createCertificate(taskData.volunteerId, certificateUrl, qrCode);
      }
    }
    return task;
  }
  async getTaskCompletions(volunteerId, limit = 10, offset = 0) {
    return await db.query.taskCompletions.findMany({
      where: eq(taskCompletions.volunteerId, volunteerId),
      limit,
      offset,
      orderBy: [desc(taskCompletions.completedAt)]
    });
  }
  // Feedback methods
  async submitFeedback(feedbackData) {
    const [feedback2] = await db.insert(feedback).values(feedbackData).returning();
    return feedback2;
  }
  async getFeedbackByVolunteer(volunteerId, limit = 10, offset = 0) {
    return await db.query.feedback.findMany({
      where: eq(feedback.volunteerId, volunteerId),
      limit,
      offset,
      orderBy: [desc(feedback.createdAt)]
    });
  }
  // Certificate methods
  async createCertificate(volunteerId, certificateUrl, qrCode) {
    const [certificate] = await db.insert(certificates).values({
      volunteerId,
      certificateUrl,
      qrCode,
      issuedAt: /* @__PURE__ */ new Date()
    }).returning();
    return certificate;
  }
  async getCertificates(volunteerId) {
    return await db.query.certificates.findMany({
      where: eq(certificates.volunteerId, volunteerId),
      orderBy: [desc(certificates.issuedAt)]
    });
  }
  // Help Center methods
  async getHelpCenters() {
    return await db.query.helpCenters.findMany({
      where: eq(helpCenters.status, "active")
    });
  }
  async getHelpCentersNearLocation(latitude, longitude, radius = 10) {
    return await db.query.helpCenters.findMany({
      where: eq(helpCenters.status, "active")
    });
  }
  // Resource methods
  async getResources(language = "en", limit = 10, offset = 0) {
    return await db.query.resources.findMany({
      where: eq(resources.language, language),
      limit,
      offset,
      orderBy: [asc(resources.title)]
    });
  }
  async getResourceById(id) {
    return await db.query.resources.findFirst({
      where: eq(resources.id, id)
    });
  }
  // Broadcast methods
  async createBroadcastMessage(messageData) {
    const [message] = await db.insert(broadcastMessages).values(messageData).returning();
    return message;
  }
  async getBroadcastMessages(targetRole, limit = 10, offset = 0) {
    const query = db.select().from(broadcastMessages).limit(limit).offset(offset).orderBy(desc(broadcastMessages.createdAt));
    if (targetRole) {
      const role = targetRole === "all" ? "all" : targetRole;
      return await query.where(sql`${broadcastMessages.targetRole} = ${role}`);
    }
    return await query;
  }
  // Statistics methods
  async getStatistics() {
    return await db.query.statistics.findFirst();
  }
  async updateStatistics(statsData) {
    const existingStats = await this.getStatistics();
    if (existingStats) {
      await db.update(statistics).set({
        ...statsData,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(statistics.id, existingStats.id));
    } else {
      await db.insert(statistics).values({
        crisesResolved: 0,
        activeVolunteers: 0,
        peopleHelped: 0,
        ...statsData
        // Type assertion to handle dynamic properties
      });
    }
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { eq as eq2 } from "drizzle-orm";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "resqlink-secure-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1e3 * 60 * 60 * 24
      // 1 day
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });
      if (req.body.role === "citizen") {
        const citizenData = {
          userId: user.id,
          emergencyContact: req.body.emergencyContact || null,
          medicalInfo: req.body.medicalInfo || null
        };
        await db.insert(citizenProfiles).values(citizenData);
      } else if (req.body.role === "volunteer") {
        const skillsArray = req.body.skills ? req.body.skills.split(",").map((s) => s.trim()) : [];
        const volunteerData = {
          userId: user.id,
          status: "offline",
          approvalStatus: "pending",
          points: 0,
          tasksCompleted: 0,
          skills: skillsArray,
          bio: req.body.bio || null
        };
        await db.insert(volunteerProfiles).values(volunteerData);
      }
      if (req.body.role === "volunteer") {
        return res.status(201).json({ message: "Volunteer registered successfully. Awaiting admin approval." });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    if (req.isAuthenticated()) {
      req.logout((err) => {
        if (err) console.error("Error logging out previous session:", err);
      });
    }
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid username or password" });
      }
      (async () => {
        if (user.role === "volunteer") {
          const volProfile = await db.select().from(volunteerProfiles).where(eq2(volunteerProfiles.userId, user.id)).limit(1);
          const profile = volProfile[0];
          if (!profile || profile.approvalStatus !== "approved") {
            return res.status(403).json({ message: "Your volunteer request is pending approval." });
          }
        }
        req.login(user, (err2) => {
          if (err2) {
            return next(err2);
          }
          const { password, ...userWithoutPassword } = user;
          return res.status(200).json(userWithoutPassword);
        });
      })().catch(next);
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.sendStatus(200);
      });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

// server/routes.ts
import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import path from "path";
import { eq as eq3, desc as desc2, or } from "drizzle-orm";
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
}
function hasRole(roles) {
  return (req, res, next) => {
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
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "ResQLink API is running" });
  });
  app2.get("/api/statistics", async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Error fetching statistics" });
    }
  });
  app2.get("/api/help-centers", async (req, res) => {
    try {
      const helpCenters2 = await storage.getHelpCenters();
      res.json(helpCenters2);
    } catch (error) {
      console.error("Error fetching help centers:", error);
      res.status(500).json({ message: "Error fetching help centers" });
    }
  });
  app2.get("/api/broadcasts", isAuthenticated, async (req, res) => {
    const allBroadcasts = await db.select().from(broadcasts).orderBy(desc2(broadcasts.createdAt));
    res.json(allBroadcasts);
  });
  app2.post("/api/broadcasts", isAuthenticated, hasRole(["admin"]), async (req, res) => {
    const { title, message, target } = req.body;
    if (!title || !message || !target) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    const result = await db.insert(broadcasts).values({ title, message, target }).returning();
    res.status(201).json(result[0]);
  });
  app2.delete("/api/broadcasts/:id", isAuthenticated, hasRole(["admin"]), async (req, res) => {
    try {
      const broadcastId = parseInt(req.params.id);
      if (isNaN(broadcastId)) {
        return res.status(400).json({ message: "Invalid broadcast ID" });
      }
      await db.delete(broadcasts).where(eq3(broadcasts.id, broadcastId));
      res.json({ message: "Broadcast deleted successfully" });
    } catch (error) {
      console.error("Error deleting broadcast:", error);
      res.status(500).json({ message: "Failed to delete broadcast" });
    }
  });
  app2.get("/api/help-centers/near", isAuthenticated, async (req, res) => {
    try {
      const { latitude, longitude, radius } = req.query;
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      const helpCenters2 = await storage.getHelpCentersNearLocation(
        parseFloat(latitude),
        parseFloat(longitude),
        radius ? parseFloat(radius) : 10
      );
      res.json(helpCenters2);
    } catch (error) {
      console.error("Error fetching nearby help centers:", error);
      res.status(500).json({ message: "Error fetching nearby help centers" });
    }
  });
  app2.get("/api/resources", async (req, res) => {
    try {
      const { language = "en", limit, offset } = req.query;
      const resources2 = await storage.getResources(
        language,
        limit ? parseInt(limit) : void 0,
        offset ? parseInt(offset) : void 0
      );
      res.json(resources2);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Error fetching resources" });
    }
  });
  app2.get("/api/resources/:id", async (req, res) => {
    try {
      const resource = await storage.getResourceById(parseInt(req.params.id));
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json(resource);
    } catch (error) {
      console.error("Error fetching resource:", error);
      res.status(500).json({ message: "Error fetching resource" });
    }
  });
  app2.post("/api/sos", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.role !== "citizen") {
        return res.status(403).json({ message: "Only citizens can create SOS alerts" });
      }
      const alertData = {
        ...req.body,
        citizenId: req.user.id,
        status: "new"
      };
      const sosAlert = await storage.createSosAlert(alertData);
      const stats = await storage.getStatistics();
      if (stats) {
        await storage.updateStatistics({ peopleHelped: stats.peopleHelped + 1 });
      }
      res.status(201).json(sosAlert);
    } catch (error) {
      console.error("Error creating SOS alert:", error);
      res.status(500).json({ message: "Error creating SOS alert" });
    }
  });
  app2.get("/api/sos", isAuthenticated, async (req, res) => {
    try {
      const { status, limit, offset } = req.query;
      if (req.user?.role === "citizen") {
        const sosAlerts3 = await db.query.sosAlerts.findMany({
          where: eq3(sosAlerts.citizenId, req.user.id),
          limit: limit ? parseInt(limit) : 10,
          offset: offset ? parseInt(offset) : 0,
          orderBy: desc2(sosAlerts.createdAt)
        });
        return res.json(sosAlerts3);
      }
      const sosAlerts2 = await storage.getSosAlerts(
        status,
        limit ? parseInt(limit) : void 0,
        offset ? parseInt(offset) : void 0
      );
      res.json(sosAlerts2);
    } catch (error) {
      console.error("Error fetching SOS alerts:", error);
      res.status(500).json({ message: "Error fetching SOS alerts" });
    }
  });
  app2.get("/api/sos/:id", isAuthenticated, async (req, res) => {
    try {
      const sosAlert = await storage.getSosAlertById(parseInt(req.params.id));
      if (!sosAlert) {
        return res.status(404).json({ message: "SOS alert not found" });
      }
      if (req.user?.role === "citizen" && sosAlert.citizenId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(sosAlert);
    } catch (error) {
      console.error("Error fetching SOS alert:", error);
      res.status(500).json({ message: "Error fetching SOS alert" });
    }
  });
  app2.patch("/api/sos/:id/status", isAuthenticated, async (req, res) => {
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
      if (req.user?.role === "citizen") {
        if (sosAlert.citizenId !== req.user.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        if (status !== "cancelled") {
          return res.status(403).json({ message: "Citizens can only cancel SOS alerts" });
        }
      }
      await storage.updateSosAlertStatus(sosId, status);
      res.json({ message: "SOS alert status updated" });
    } catch (error) {
      console.error("Error updating SOS alert status:", error);
      res.status(500).json({ message: "Error updating SOS alert status" });
    }
  });
  app2.post("/api/sos/:id/assign", hasRole(["admin", "volunteer"]), async (req, res) => {
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
      if (req.user?.role === "volunteer" && volunteerId !== req.user.id) {
        return res.status(403).json({ message: "Volunteers can only assign alerts to themselves" });
      }
      await storage.assignVolunteerToSosAlert(sosId, volunteerId);
      res.json({ message: "Volunteer assigned to SOS alert" });
    } catch (error) {
      console.error("Error assigning volunteer to SOS alert:", error);
      res.status(500).json({ message: "Error assigning volunteer to SOS alert" });
    }
  });
  app2.post("/api/tasks/complete", hasRole(["volunteer"]), async (req, res) => {
    try {
      const { sosAlertId, notes, proofImageUrl } = req.body;
      if (!sosAlertId) {
        return res.status(400).json({ message: "SOS Alert ID is required" });
      }
      const sosAlert = await storage.getSosAlertById(sosAlertId);
      if (!sosAlert) {
        return res.status(404).json({ message: "SOS alert not found" });
      }
      if (sosAlert.assignedVolunteerId !== req.user.id) {
        return res.status(403).json({ message: "You can only complete tasks assigned to you" });
      }
      if (sosAlert.status !== "resolved") {
        return res.status(400).json({ message: "SOS alert must be marked as resolved before completing the task" });
      }
      const taskData = {
        sosAlertId,
        volunteerId: req.user.id,
        notes: notes || "Task completed successfully",
        proofImageUrl,
        pointsAwarded: 0,
        // Points will be awarded by admin later
        completedAt: /* @__PURE__ */ new Date()
      };
      const task = await storage.completeTask(taskData);
      const volunteerProfile = await db.query.volunteerProfiles.findFirst({
        where: eq3(volunteerProfiles.userId, req.user.id)
      });
      if (volunteerProfile) {
        await db.update(volunteerProfiles).set({
          tasksCompleted: (volunteerProfile.tasksCompleted || 0) + 1,
          status: "available"
        }).where(eq3(volunteerProfiles.userId, req.user.id));
      }
      const stats = await storage.getStatistics();
      if (stats) {
        await storage.updateStatistics({ crisesResolved: stats.crisesResolved + 1 });
      }
      res.status(201).json(task);
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Error completing task" });
    }
  });
  app2.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const { volunteerId, sosAlertId, limit, offset } = req.query;
      if (sosAlertId && req.user?.role === "admin") {
        const tasks = await db.query.taskCompletions.findMany({
          where: eq3(taskCompletions.sosAlertId, parseInt(sosAlertId)),
          orderBy: [desc2(taskCompletions.completedAt)]
        });
        const tasksWithVolunteer = await Promise.all(
          tasks.map(async (task) => {
            const volunteer = await db.query.users.findFirst({
              where: eq3(users.id, task.volunteerId),
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
      if (req.user?.role === "volunteer" && (!volunteerId || parseInt(volunteerId) !== req.user.id)) {
        const tasks = await storage.getTaskCompletions(
          req.user.id,
          limit ? parseInt(limit) : void 0,
          offset ? parseInt(offset) : void 0
        );
        return res.json(tasks);
      }
      if (req.user?.role === "admin" && volunteerId) {
        const tasks = await storage.getTaskCompletions(
          parseInt(volunteerId),
          limit ? parseInt(limit) : void 0,
          offset ? parseInt(offset) : void 0
        );
        return res.json(tasks);
      }
      return res.status(400).json({ message: "Volunteer ID or SOS Alert ID is required" });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });
  app2.post("/api/feedback", hasRole(["citizen"]), async (req, res) => {
    try {
      const feedbackData = {
        ...req.body,
        citizenId: req.user.id
      };
      const feedback2 = await storage.submitFeedback(feedbackData);
      res.status(201).json(feedback2);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Error submitting feedback" });
    }
  });
  app2.get("/api/feedback", isAuthenticated, async (req, res) => {
    try {
      const { volunteerId, limit, offset } = req.query;
      if (!volunteerId) {
        return res.status(400).json({ message: "Volunteer ID is required" });
      }
      const feedback2 = await storage.getFeedbackByVolunteer(
        parseInt(volunteerId),
        limit ? parseInt(limit) : void 0,
        offset ? parseInt(offset) : void 0
      );
      res.json(feedback2);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Error fetching feedback" });
    }
  });
  app2.post("/api/volunteer/:id/award-points", hasRole(["admin"]), async (req, res) => {
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
  app2.get("/api/volunteers", hasRole(["admin"]), async (req, res) => {
    try {
      const { limit, offset } = req.query;
      const volunteers = await db.query.users.findMany({
        where: eq3(users.role, "volunteer"),
        with: {
          volunteerProfile: true
        },
        limit: limit ? parseInt(limit) : 10,
        offset: offset ? parseInt(offset) : 0,
        orderBy: desc2(users.id)
      });
      res.json(volunteers);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      res.status(500).json({ message: "Error fetching volunteers" });
    }
  });
  app2.patch("/api/volunteers/status", hasRole(["volunteer"]), async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      await storage.updateVolunteerStatus(req.user.id, status);
      const stats = await storage.getStatistics();
      if (stats) {
        if (status === "available") {
          await storage.updateStatistics({ activeVolunteers: stats.activeVolunteers + 1 });
        } else if (status === "offline") {
          await storage.updateStatistics({ activeVolunteers: Math.max(0, stats.activeVolunteers - 1) });
        }
      }
      res.json({ message: "Volunteer status updated" });
    } catch (error) {
      console.error("Error updating volunteer status:", error);
      res.status(500).json({ message: "Error updating volunteer status" });
    }
  });
  app2.get("/api/certificates", isAuthenticated, async (req, res) => {
    try {
      const { volunteerId } = req.query;
      if (!volunteerId) {
        return res.status(400).json({ message: "Volunteer ID is required" });
      }
      if (req.user?.role === "volunteer" && parseInt(volunteerId) !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const certificates2 = await storage.getCertificates(parseInt(volunteerId));
      res.json(certificates2);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Error fetching certificates" });
    }
  });
  app2.post("/api/broadcasts", hasRole(["admin"]), async (req, res) => {
    try {
      const messageData = {
        ...req.body,
        senderId: req.user.id
      };
      const message = await storage.createBroadcastMessage(messageData);
      try {
        const { sendEmail: sendEmail2, emailTemplates: emailTemplates2, DEFAULT_FROM_EMAIL: DEFAULT_FROM_EMAIL2 } = await Promise.resolve().then(() => (init_email(), email_exports));
        let usersQuery = db.select().from(users).where(
          messageData.targetRole === "all" ? or(eq3(users.role, "volunteer"), eq3(users.role, "citizen")) : eq3(users.role, messageData.targetRole)
        );
        const targetUsers = await usersQuery;
        const emailPromises = targetUsers.filter((user) => !!user.email).map(async (user) => {
          const emailContent = emailTemplates2.broadcastMessage(
            user.name,
            messageData.title,
            messageData.content
          );
          return sendEmail2({
            to: user.email,
            from: DEFAULT_FROM_EMAIL2,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text
          });
        });
        await Promise.allSettled(emailPromises);
        console.log(`Broadcast email sent to ${emailPromises.length} users`);
      } catch (emailError) {
        console.error("Error sending broadcast emails:", emailError);
      }
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating broadcast message:", error);
      res.status(500).json({ message: "Error creating broadcast message" });
    }
  });
  app2.get("/api/broadcasts", isAuthenticated, async (req, res) => {
    try {
      const { limit, offset } = req.query;
      const messages = await storage.getBroadcastMessages(
        req.user.role,
        limit ? parseInt(limit) : void 0,
        offset ? parseInt(offset) : void 0
      );
      res.json(messages);
    } catch (error) {
      console.error("Error fetching broadcast messages:", error);
      res.status(500).json({ message: "Error fetching broadcast messages" });
    }
  });
  app2.post("/api/users/volunteer", hasRole(["admin"]), async (req, res) => {
    try {
      const userData = {
        ...req.body,
        role: "volunteer"
      };
      const user = await storage.createUser(userData);
      await db.insert(volunteerProfiles).values({
        userId: user.id,
        status: "offline",
        points: 0,
        tasksCompleted: 0
      });
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after volunteer creation:", err);
          return res.status(500).json({ message: "Auto-login failed" });
        }
        res.status(201).json({ message: "Volunteer created and logged in" });
      });
      return;
    } catch (error) {
      console.error("Error creating volunteer:", error);
      res.status(500).json({ message: "Error creating volunteer" });
    }
  });
  app2.get("/api/volunteers/pending", hasRole(["admin"]), async (req, res) => {
    try {
      const volunteers = await db.query.users.findMany({
        where: eq3(users.role, "volunteer"),
        with: {
          volunteerProfile: true
        },
        orderBy: desc2(users.id)
      });
      const pendingVolunteers = volunteers.filter(
        (volunteer) => volunteer.volunteerProfile && volunteer.volunteerProfile.approvalStatus === "pending"
      );
      res.json(pendingVolunteers);
    } catch (error) {
      console.error("Error fetching pending volunteers:", error);
      res.status(500).json({ message: "Error fetching pending volunteers" });
    }
  });
  app2.patch("/api/volunteers/:id/approve", hasRole(["admin"]), async (req, res) => {
    try {
      const volunteerId = parseInt(req.params.id);
      const volunteer = await db.query.users.findFirst({
        where: eq3(users.id, volunteerId),
        with: {
          volunteerProfile: true
        }
      });
      if (!volunteer || volunteer.role !== "volunteer") {
        return res.status(404).json({ message: "Volunteer not found" });
      }
      await db.update(volunteerProfiles).set({
        status: "available",
        approvalStatus: "approved"
      }).where(eq3(volunteerProfiles.userId, volunteerId));
      const stats = await storage.getStatistics();
      if (stats) {
        await storage.updateStatistics({ activeVolunteers: stats.activeVolunteers + 1 });
      }
      if (volunteer.email) {
        try {
          const { sendEmail: sendEmail2, emailTemplates: emailTemplates2, DEFAULT_FROM_EMAIL: DEFAULT_FROM_EMAIL2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          const emailContent = emailTemplates2.volunteerApproval(volunteer.name);
          await sendEmail2({
            to: volunteer.email,
            from: DEFAULT_FROM_EMAIL2,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text
          });
          console.log(`Approval notification email sent to volunteer ${volunteer.name} (${volunteer.email})`);
        } catch (emailError) {
          console.error("Failed to send approval email:", emailError);
        }
      }
      res.json({ message: "Volunteer approved successfully" });
    } catch (error) {
      console.error("Error approving volunteer:", error);
      res.status(500).json({ message: "Error approving volunteer" });
    }
  });
  app2.patch("/api/volunteers/:id/reject", hasRole(["admin"]), async (req, res) => {
    try {
      const volunteerId = parseInt(req.params.id);
      const volunteer = await db.query.users.findFirst({
        where: eq3(users.id, volunteerId),
        with: {
          volunteerProfile: true
        }
      });
      if (!volunteer || volunteer.role !== "volunteer") {
        return res.status(404).json({ message: "Volunteer not found" });
      }
      await db.update(volunteerProfiles).set({ approvalStatus: "rejected", status: "offline" }).where(eq3(volunteerProfiles.userId, volunteerId));
      if (volunteer.email) {
        try {
          const { sendEmail: sendEmail2, emailTemplates: emailTemplates2, DEFAULT_FROM_EMAIL: DEFAULT_FROM_EMAIL2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          const emailContent = emailTemplates2.volunteerRejection(volunteer.name);
          await sendEmail2({
            to: volunteer.email,
            from: DEFAULT_FROM_EMAIL2,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text
          });
          console.log(`Rejection notification email sent to volunteer ${volunteer.name} (${volunteer.email})`);
        } catch (emailError) {
          console.error("Failed to send rejection email:", emailError);
        }
      }
      res.json({ message: "Volunteer rejected successfully" });
    } catch (error) {
      console.error("Error rejecting volunteer:", error);
      res.status(500).json({ message: "Error rejecting volunteer" });
    }
  });
  app2.patch("/api/volunteers/:id/points", hasRole(["admin"]), async (req, res) => {
    try {
      const volunteerId = parseInt(req.params.id);
      const { points } = req.body;
      if (points === void 0) {
        return res.status(400).json({ message: "Points are required" });
      }
      const volunteer = await db.query.users.findFirst({
        where: eq3(users.id, volunteerId),
        with: {
          volunteerProfile: true
        }
      });
      if (!volunteer || volunteer.role !== "volunteer") {
        return res.status(404).json({ message: "Volunteer not found" });
      }
      await storage.updateVolunteerPoints(volunteerId, points);
      const currentPoints = (volunteer.volunteerProfile?.points || 0) + points;
      let badge = null;
      if (currentPoints >= 200) {
        badge = "ResQLegend";
      } else if (currentPoints >= 100) {
        badge = "DisasterHero";
      } else if (currentPoints >= 50) {
        badge = "RescueRookie";
      }
      if (badge) {
        await db.update(volunteerProfiles).set({ badge }).where(eq3(volunteerProfiles.userId, volunteerId));
      }
      if (volunteer.email) {
        try {
          const { sendEmail: sendEmail2, emailTemplates: emailTemplates2, DEFAULT_FROM_EMAIL: DEFAULT_FROM_EMAIL2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          const emailContent = emailTemplates2.pointsAwarded(
            volunteer.name,
            points,
            currentPoints,
            badge || volunteer.volunteerProfile?.badge || "Newcomer"
          );
          await sendEmail2({
            to: volunteer.email,
            from: DEFAULT_FROM_EMAIL2,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text
          });
          console.log(`Points award notification email sent to volunteer ${volunteer.name} (${volunteer.email})`);
        } catch (emailError) {
          console.error("Failed to send points award email:", emailError);
        }
      }
      res.json({
        message: "Volunteer points updated successfully",
        newPoints: currentPoints,
        badge
      });
    } catch (error) {
      console.error("Error updating volunteer points:", error);
      res.status(500).json({ message: "Error updating volunteer points" });
    }
  });
  app2.get("/api/me", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await db.query.users.findFirst({
        where: eq3(users.id, userId)
      });
      const volunteerProfile = await db.query.volunteerProfiles.findFirst({
        where: eq3(volunteerProfiles.userId, userId)
      });
      res.json({ ...user, volunteerProfile });
    } catch (error) {
      console.error("Error in /api/me:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });
  app2.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (process.env.NODE_ENV === "production") {
      const clientPath = path.resolve(process.cwd(), "dist", "public", "index.html");
      res.sendFile(clientPath);
    } else {
      next();
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = /* @__PURE__ */ new Map();
  wss.on("connection", (ws2) => {
    let userId = null;
    ws2.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "auth" && typeof data.userId === "number") {
          userId = data.userId;
          if (userId !== null) {
            clients.set(userId, ws2);
          }
        }
        if (data.type === "sos" && userId) {
          clients.forEach((client, clientId) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: "sos_alert",
                data: data.data
              }));
            }
          });
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    });
    ws2.on("close", () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  base: "./",
  resolve: {
    alias: {
      "@db": path2.resolve(import.meta.dirname, "db"),
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
    app.get("*", (req, res) => {
      if (!req.path.startsWith("/api")) {
        res.sendFile(path4.resolve("dist/public/index.html"));
      }
    });
  }
  const port = process.env.PORT || 5e3;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    log(`Serving on port ${port}`);
  });
})();
