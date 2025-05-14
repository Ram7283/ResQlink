import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { db } from "../db";
import * as schema from "@shared/schema";
import { User as SelectUser } from "@shared/schema";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "resqlink-secure-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(req.body.password);
      
      // Create user
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });
      
      // Create profile based on role
      if (req.body.role === "citizen") {
        // Create citizen profile
        const citizenData: typeof schema.citizenProfiles.$inferInsert = {
          userId: user.id,
          emergencyContact: req.body.emergencyContact || null,
          medicalInfo: req.body.medicalInfo || null
        };
        
        await db.insert(schema.citizenProfiles).values(citizenData);
      } else if (req.body.role === "volunteer") {
        // Create volunteer profile with pending approval status
        const skillsArray = req.body.skills ? req.body.skills.split(',').map((s: string) => s.trim()) : [];
        
        // Use the proper type from the schema
        const volunteerData: typeof schema.volunteerProfiles.$inferInsert = {
          userId: user.id,
          status: "offline",
          approvalStatus: "pending",
          points: 0,
          tasksCompleted: 0,
          skills: skillsArray,
          bio: req.body.bio || null
        };
        
        // Insert the volunteer profile
        await db.insert(schema.volunteerProfiles).values(volunteerData);
      }

      // If registering as a volunteer, do not auto-login, just return a message
      if (req.body.role === "volunteer") {
        return res.status(201).json({ message: "Volunteer registered successfully. Awaiting admin approval." });
      }

      // Otherwise, log user in (e.g., citizen)
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    if (req.isAuthenticated()) {
      req.logout((err) => {
        if (err) console.error("Error logging out previous session:", err);
      });
    }
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid username or password" });
      }
      (async () => {
        // Block unapproved volunteers
        if (user.role === "volunteer") {
          const volProfile = await db.select()
            .from(schema.volunteerProfiles)
            .where(eq(schema.volunteerProfiles.userId, user.id))
            .limit(1);
          const profile = volProfile[0];
          if (!profile || profile.approvalStatus !== "approved") {
            return res.status(403).json({ message: "Your volunteer request is pending approval." });
          }
        }
        // Approved or non-volunteer: proceed to login
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          const { password, ...userWithoutPassword } = user;
          return res.status(200).json(userWithoutPassword);
        });
      })().catch(next);
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy(() => {
        res.clearCookie("connect.sid"); // adjust cookie name if different
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
}