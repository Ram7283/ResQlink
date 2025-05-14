import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("🌱 Seeding database...");
    
    // Check if admin exists
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "admin")
    });

    // Insert admin if not exists
    if (!existingAdmin) {
      const hashedPassword = await hashPassword("admin123");
      
      // Create admin user
      const [adminUser] = await db.insert(schema.users).values({
        username: "admin",
        password: hashedPassword,
        email: "admin@resqlink.org",
        name: "System Administrator",
        role: "admin",
        location: "Headquarters",
        phone: "+1-555-ADMIN",
        language: "en"
      }).returning();
      
      // Create admin profile
      await db.insert(schema.adminProfiles).values({
        userId: adminUser.id
      });
      
      console.log("✅ Admin user created");
    } else {
      console.log("👌 Admin user already exists, skipping");
    }
    
    // Check if statistics exists
    const existingStats = await db.query.statistics.findFirst();
    
    // Insert statistics if not exists
    if (!existingStats) {
      await db.insert(schema.statistics).values({
        crisesResolved: 300,
        activeVolunteers: 750,
        peopleHelped: 15000
      });
      
      console.log("✅ Statistics seeded");
    } else {
      console.log("👌 Statistics already exist, skipping");
    }
    
    // Create some help centers
    const existingHelpCenters = await db.query.helpCenters.findMany();
    
    if (existingHelpCenters.length === 0) {
      await db.insert(schema.helpCenters).values([
        {
          name: "Downtown Relief Center",
          latitude: 40.7128,
          longitude: -74.0060,
          address: "123 Main St, New York, NY 10001",
          contactNumber: "+1-555-1234",
          servicesOffered: ["Medical Aid", "Food Distribution", "Shelter"],
          operatingHours: "24/7",
          status: "active"
        },
        {
          name: "Westside Emergency Hub",
          latitude: 34.0522,
          longitude: -118.2437,
          address: "456 Sunset Blvd, Los Angeles, CA 90001",
          contactNumber: "+1-555-5678",
          servicesOffered: ["Medical Aid", "Water Supply", "Communications"],
          operatingHours: "8am-8pm",
          status: "active"
        },
        {
          name: "Bayside Disaster Response",
          latitude: 37.7749,
          longitude: -122.4194,
          address: "789 Bay St, San Francisco, CA 94111",
          contactNumber: "+1-555-9012",
          servicesOffered: ["Medical Aid", "Evacuation", "Temporary Housing"],
          operatingHours: "24/7",
          status: "active"
        },
      ]);
      
      console.log("✅ Help centers seeded");
    } else {
      console.log("👌 Help centers already exist, skipping");
    }
    
    // Create some disaster preparedness resources
    const existingResources = await db.query.resources.findMany();
    
    if (existingResources.length === 0) {
      await db.insert(schema.resources).values([
        {
          title: "Emergency Kit Preparation",
          description: "Learn how to prepare an emergency kit for your family",
          content: "# Emergency Kit Preparation\n\nAn emergency kit should contain essential items to help your family survive for at least 72 hours.\n\n## Essential Items\n\n- Water (one gallon per person per day)\n- Non-perishable food\n- Flashlight and extra batteries\n- First aid kit\n- Whistle to signal for help\n- Dust mask\n- Moist towelettes, garbage bags, and plastic ties for personal sanitation\n- Wrench or pliers to turn off utilities\n- Manual can opener\n- Local maps\n- Cell phone with chargers and a backup battery\n\n## Additional Items\n\n- Prescription medications\n- Non-prescription medications such as pain relievers\n- Glasses and contact lens solution\n- Infant formula, bottles, diapers, wipes, and diaper rash cream\n- Pet food and extra water for your pet\n- Cash or traveler's checks\n- Important family documents such as copies of insurance policies, identification, and bank account records saved electronically or in a waterproof container\n- Sleeping bag or warm blanket for each person\n- Complete change of clothing appropriate for your climate\n- Fire extinguisher\n- Matches in a waterproof container\n- Feminine supplies and personal hygiene items\n- Mess kits, paper cups, plates, paper towels, and plastic utensils\n- Paper and pencil\n- Books, games, puzzles, or other activities for children",
          resourceType: "guide",
          language: "en",
          fileUrl: "/resources/emergency-kit.pdf"
        },
        {
          title: "तैयारी निर्देशिका",
          description: "आपदा से पहले तैयारी कैसे करें",
          content: "# आपदा तैयारी निर्देशिका\n\nआपदा से पहले तैयारी करना महत्वपूर्ण है ताकि आप और आपका परिवार सुरक्षित रहें।\n\n## महत्वपूर्ण कदम\n\n1. आपातकालीन किट तैयार करें\n2. एक परिवार संचार योजना विकसित करें\n3. आपातकालीन अलर्ट प्राप्त करने के लिए साइन अप करें\n4. अपने क्षेत्र में निकासी मार्गों और शरण स्थानों के बारे में जानें\n5. अपने घर को सुरक्षित करने के लिए कदम उठाएं\n\n## आपदा के प्रकार\n\n### बाढ़\n- ऊंचे स्थान पर जाएं\n- बिजली से दूर रहें\n- बहते पानी से दूर रहें\n\n### भूकंप\n- टेबल के नीचे जाएं, पकड़ें और पकड़े रहें\n- खुले दरवाजे से दूर रहें\n- बाहर खुली जगह में जाएं\n\n### आग\n- बाहर निकलें और बाहर रहें\n- 911 पर कॉल करें\n- धुएं से नीचे रहें",
          resourceType: "guide",
          language: "hi",
          fileUrl: "/resources/preparation-guide-hindi.pdf"
        },
        {
          title: "அவசரகால நடவடிக்கைகள்",
          description: "பேரிடர் நேரத்தில் என்ன செய்ய வேண்டும்",
          content: "# அவசரகால நடவடிக்கைகள்\n\n## அவசரகால தொடர்பு நம்பர்கள்\n\n- அவசரகால ஒருங்கிணைப்பு: 108\n- காவல்துறை: 100\n- தீயணைப்பு: 101\n- ஆம்புலன்ஸ்: 102\n\n## வெள்ளத்தின் போது\n\n1. உயரமான பகுதிக்கு செல்லவும்\n2. மின்சாரம் பாய்ந்துகொண்டிருக்கும் பகுதிகளை தவிர்க்கவும்\n3. வெள்ளத்தில் நடக்க வேண்டாம்\n4. அதிகாரிகளின் அறிவுறுத்தல்களை பின்பற்றவும்\n\n## நிலநடுக்கத்தின் போது\n\n1. மேசைக்கு அடியில் போய் பாதுகாப்பாக இருக்கவும்\n2. சன்னல்கள் மற்றும் கண்ணாடிகளிலிருந்து விலகி இருக்கவும்\n3. நிலநடுக்கம் நின்ற பிறகு கட்டிடத்தை விட்டு வெளியேறவும்\n\n## தீ விபத்தின் போது\n\n1. அமைதியாக இருந்து வெளியேறுங்கள்\n2. புகை மூச்சில் போகாமல் தரையில் ஊர்ந்து செல்லுங்கள்\n3. கதவை தொடுவதற்கு முன் சூடாக உள்ளதா என சோதிக்கவும்\n4. வெளியே சென்றவுடன் உதவிக்கு அழைக்கவும்",
          resourceType: "guide",
          language: "ta",
          fileUrl: "/resources/emergency-actions-tamil.pdf"
        },
      ]);
      
      console.log("✅ Resources seeded");
    } else {
      console.log("👌 Resources already exist, skipping");
    }
    
    console.log("✅ Database seeded successfully");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seed();
