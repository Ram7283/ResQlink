import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface StepProps {
  number: number;
  title: string;
  description: string;
}

const Step = ({ number, title, description }: StepProps) => (
  <div className="flex gap-4">
    <div className="step-number">{number}</div>
    <div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="feature-text">{description}</p>
    </div>
  </div>
);

const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      title: "Submit SOS Request",
      description: "Citizens can quickly send distress signals with automatic location detection and optional images."
    },
    {
      number: 2,
      title: "Alert Nearby Volunteers",
      description: "Available volunteers in the vicinity receive instant notifications about the emergency."
    },
    {
      number: 3,
      title: "Coordinate Response",
      description: "Admin can monitor, assign, and track response activities in real-time for optimal coordination."
    },
    {
      number: 4,
      title: "Reward & Recognize",
      description: "Volunteers earn points, badges, and certificates for successfully completing missions."
    }
  ];

  return (
    <section className="bg-gradient-feature py-16 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="lg:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1543269664-76bc3997d9ea" 
              alt="Emergency responders in action" 
              className="rounded-xl shadow-lg mx-auto"
              loading="lazy"
            />
          </div>
          
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold mb-6">How ResQLink Works</h2>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <Step
                  key={index}
                  number={step.number}
                  title={step.title}
                  description={step.description}
                />
              ))}
              
              <div className="mt-8">
                <Link 
                  href="/how-it-works" 
                  className="bg-white text-primary hover:bg-opacity-90 transition duration-300 px-6 py-3 rounded-md font-medium inline-flex items-center"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
