import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User role enum
export const UserRoleEnum = z.enum(["admin", "volunteer", "citizen"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

// Volunteer status enum
export const VolunteerStatusEnum = z.enum(["available", "busy", "offline"]);
export type VolunteerStatus = z.infer<typeof VolunteerStatusEnum>;

// Badge enum
export const BadgeEnum = z.enum(["RescueRookie", "DisasterHero", "ResQLegend"]);
export type Badge = z.infer<typeof BadgeEnum>;

// SOS alert status enum
export const SosAlertStatusEnum = z.enum(["new", "assigned", "in-progress", "resolved", "cancelled"]);
export type SosAlertStatus = z.infer<typeof SosAlertStatusEnum>;

// Users table (base for all user types)
export const users = pgTable("users", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Admin specific profile
export const adminProfiles = pgTable("admin_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
});

// Volunteer approval status enum
export const VolunteerApprovalStatusEnum = z.enum(["pending", "approved", "rejected"]);
export type VolunteerApprovalStatus = z.infer<typeof VolunteerApprovalStatusEnum>;

// Volunteer profiles
export const volunteerProfiles = pgTable("volunteer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  status: text("status", { enum: ["available", "busy", "offline"] }).default("offline").notNull(),
  approvalStatus: text("approval_status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  points: integer("points").default(0).notNull(),
  tasksCompleted: integer("tasks_completed").default(0).notNull(),
  badge: text("badge", { enum: ["RescueRookie", "DisasterHero", "ResQLegend"] }),
  skills: json("skills").$type<string[]>(),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
});

// Citizen profiles
export const citizenProfiles = pgTable("citizen_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  emergencyContact: text("emergency_contact"),
  medicalInfo: text("medical_info"),
});

// SOS Alerts
export const sosAlerts = pgTable("sos_alerts", {
  id: serial("id").primaryKey(),
  citizenId: integer("citizen_id").references(() => users.id).notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  status: text("status", { enum: ["new", "assigned", "in-progress", "resolved", "cancelled"] }).default("new").notNull(),
  assignedVolunteerId: integer("assigned_volunteer_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Task Completions
export const taskCompletions = pgTable("task_completions", {
  id: serial("id").primaryKey(),
  sosAlertId: integer("sos_alert_id").references(() => sosAlerts.id).notNull(),
  volunteerId: integer("volunteer_id").references(() => users.id).notNull(),
  proofImageUrl: text("proof_image_url"),
  notes: text("notes"),
  pointsAwarded: integer("points_awarded").default(10).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Feedback and Ratings
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  sosAlertId: integer("sos_alert_id").references(() => sosAlerts.id).notNull(),
  citizenId: integer("citizen_id").references(() => users.id).notNull(),
  volunteerId: integer("volunteer_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Certificates
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").references(() => users.id).notNull(),
  certificateUrl: text("certificate_url").notNull(),
  qrCode: text("qr_code").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

// Help Centers
export const helpCenters = pgTable("help_centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  address: text("address").notNull(),
  contactNumber: text("contact_number"),
  servicesOffered: json("services_offered").$type<string[]>(),
  operatingHours: text("operating_hours"),
  status: text("status", { enum: ["active", "inactive"] }).default("active"),
});

// Broadcast Messages
export const broadcastMessages = pgTable("broadcast_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  targetRole: text("target_role", { enum: ["all", "volunteer", "citizen"] }).default("all").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Statistics
export const statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  crisesResolved: integer("crises_resolved").default(0).notNull(),
  activeVolunteers: integer("active_volunteers").default(0).notNull(),
  peopleHelped: integer("people_helped").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Resources for disaster preparedness
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  resourceType: text("resource_type", { enum: ["guide", "video", "document"] }).notNull(),
  language: text("language").default("en").notNull(),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
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
  givenFeedback: many(feedback, { relationName: "citizenFeedback" }),
}));

export const sosAlertsRelations = relations(sosAlerts, ({ one, many }) => ({
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
  feedback: one(feedback),
}));

// Schema validation for insert/select
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertVolunteerProfileSchema = createInsertSchema(volunteerProfiles);
export const selectVolunteerProfileSchema = createSelectSchema(volunteerProfiles);

export const insertCitizenProfileSchema = createInsertSchema(citizenProfiles);
export const selectCitizenProfileSchema = createSelectSchema(citizenProfiles);

export const insertSosAlertSchema = createInsertSchema(sosAlerts);
export const selectSosAlertSchema = createSelectSchema(sosAlerts);

export const insertFeedbackSchema = createInsertSchema(feedback);
export const selectFeedbackSchema = createSelectSchema(feedback);

export const insertTaskCompletionSchema = createInsertSchema(taskCompletions);
export const selectTaskCompletionSchema = createSelectSchema(taskCompletions);

export const insertHelpCenterSchema = createInsertSchema(helpCenters);
export const selectHelpCenterSchema = createSelectSchema(helpCenters);

export const insertResourceSchema = createInsertSchema(resources);
export const selectResourceSchema = createSelectSchema(resources);

export const insertStatisticsSchema = createInsertSchema(statistics);
export const selectStatisticsSchema = createSelectSchema(statistics);

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVolunteerProfile = z.infer<typeof insertVolunteerProfileSchema>;
export type VolunteerProfile = typeof volunteerProfiles.$inferSelect;

export type InsertCitizenProfile = z.infer<typeof insertCitizenProfileSchema>;
export type CitizenProfile = typeof citizenProfiles.$inferSelect;

export type InsertSosAlert = z.infer<typeof insertSosAlertSchema>;
export type SosAlert = typeof sosAlerts.$inferSelect;

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;
export type TaskCompletion = typeof taskCompletions.$inferSelect;

export type InsertHelpCenter = z.infer<typeof insertHelpCenterSchema>;
export type HelpCenter = typeof helpCenters.$inferSelect;

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

export type InsertStatistics = z.infer<typeof insertStatisticsSchema>;
export type Statistics = typeof statistics.$inferSelect;


export const broadcasts = pgTable("broadcasts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  target: text("target").notNull(), // "all", "citizens", "volunteers"
  createdAt: timestamp("created_at").defaultNow()
});