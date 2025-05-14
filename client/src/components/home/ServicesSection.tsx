import {
  Bell,
  Users,
  Award,
  Map,
  BarChart3,
  Globe
} from "lucide-react";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServiceCard = ({ icon, title, description }: ServiceCardProps) => (
  <div className="service-card">
    <div className="icon-container">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-secondary mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const ServicesSection = () => {
  const services = [
    {
      icon: <Bell className="text-xl text-primary" />,
      title: "Real-time SOS Alerts",
      description: "Instant notification system with geolocation to quickly identify and respond to emergencies."
    },
    {
      icon: <Users className="text-xl text-primary" />,
      title: "Volunteer Management",
      description: "Coordinate and deploy volunteers efficiently based on skills, location, and availability."
    },
    {
      icon: <Award className="text-xl text-primary" />,
      title: "Reward System",
      description: "Recognize volunteer efforts with points, badges, and certificates for their dedication and service."
    },
    {
      icon: <Map className="text-xl text-primary" />,
      title: "Interactive Maps",
      description: "Visualize disaster zones, available resources, and help centers with real-time updates."
    },
    {
      icon: <BarChart3 className="text-xl text-primary" />,
      title: "Analytics Dashboard",
      description: "Comprehensive reporting tools and performance metrics to optimize disaster response efforts."
    },
    {
      icon: <Globe className="text-xl text-primary" />,
      title: "Multilingual Support",
      description: "Break language barriers with support for English, Hindi, and Tamil for wider accessibility."
    }
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive disaster management solutions to help communities prepare, respond, and recover effectively.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
