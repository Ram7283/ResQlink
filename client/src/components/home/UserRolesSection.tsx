import { 
  ShieldCheck, 
  Heart, 
  Users
} from "lucide-react";

interface RoleFeature {
  text: string;
}

interface RoleCardProps {
  image: string;
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  features: RoleFeature[];
  checkColor: string;
}

const RoleCard = ({ image, title, icon, iconColor, features, checkColor }: RoleCardProps) => (
  <div className="role-card">
    <img 
      src={image}
      alt={`${title} role illustration`}
      className="w-full h-48 object-cover rounded-lg mb-6"
      loading="lazy"
    />
    <h3 className={`text-xl font-semibold text-secondary mb-3 flex items-center`}>
      <span className={`mr-2 ${iconColor}`}>{icon}</span>
      {title}
    </h3>
    <ul className="text-gray-600 space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <svg
            className={`w-5 h-5 mt-1 mr-2 ${checkColor}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{feature.text}</span>
        </li>
      ))}
    </ul>
  </div>
);

const UserRolesSection = () => {
  const roles = [
    {
      image: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae",
      title: "Admin",
      icon: <ShieldCheck className="w-5 h-5" />,
      iconColor: "text-primary",
      checkColor: "text-primary",
      features: [
        { text: "Manage users and monitor SOS alerts" },
        { text: "Assign volunteers to emergency cases" },
        { text: "Access analytics dashboard and reports" },
        { text: "Broadcast messages to all users" }
      ]
    },
    {
      image: "https://pixabay.com/get/g26c9fd9a6764bddd170e4e85184153aa51da539efa74bef5c364e6ebbdc586eb377828450f9b15c53470d50d18641f2a1a943421491d4b74d6c87685007dfc6b_1280.jpg",
      title: "Volunteer",
      icon: <Heart className="w-5 h-5" />,
      iconColor: "text-accent",
      checkColor: "text-accent",
      features: [
        { text: "View and accept nearby SOS alerts" },
        { text: "Upload proof of task completion" },
        { text: "Earn rewards and certificates" },
        { text: "Track performance on leaderboards" }
      ]
    },
    {
      image: "https://images.unsplash.com/photo-1464998857633-50e59fbf2fe6",
      title: "Citizen",
      icon: <Users className="w-5 h-5" />,
      iconColor: "text-blue-500",
      checkColor: "text-blue-500",
      features: [
        { text: "Submit SOS requests with geolocation" },
        { text: "Track real-time request status" },
        { text: "Access disaster preparedness resources" },
        { text: "Rate and review volunteer assistance" }
      ]
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary mb-4">User Roles</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            ResQLink serves different stakeholders with tailored features to streamline disaster response.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <RoleCard
              key={index}
              image={role.image}
              title={role.title}
              icon={role.icon}
              iconColor={role.iconColor}
              features={role.features}
              checkColor={role.checkColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserRolesSection;
