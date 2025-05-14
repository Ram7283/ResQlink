import { Link } from "wouter";

const CallToActionSection = () => {
  return (
    <section className="py-16 bg-primary bg-opacity-10">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-secondary mb-6">Ready to Make a Difference?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Join ResQLink today and be part of a global network of volunteers helping communities prepare for and respond to disasters.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="btn-primary">
            Register as Volunteer
          </Link>
          <Link href="/about" className="bg-white text-primary hover:bg-gray-50 border border-primary transition duration-300 px-8 py-3 rounded-md font-medium inline-flex items-center justify-center">
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
