import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-secondary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                <svg
                  className="text-primary w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">ResQLink</span>
            </Link>
            <p className="text-blue-100 mb-6">Connecting communities, empowering volunteers, and coordinating rapid responses during disaster situations.</p>
            <div className="flex space-x-4">
              {[
                { icon: "facebook", href: "#" },
                { icon: "twitter", href: "#" },
                { icon: "instagram", href: "#" },
                { icon: "linkedin", href: "#" }
              ].map((social, index) => (
                <a 
                  key={index} 
                  href={social.href} 
                  className="text-white hover:text-primary transition"
                  aria-label={`Follow us on ${social.icon}`}
                >
                  <i className={`fab fa-${social.icon}${social.icon === 'linkedin' ? '-in' : social.icon === 'facebook' ? '-f' : ''}`}></i>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "About Us", href: "/about" },
                { name: "Services", href: "/services" },
                { name: "Contact", href: "/contact" },
                { name: "Login", href: "/login" },
                { name: "Register", href: "/register" }
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-blue-100 hover:text-primary transition">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Resources</h3>
            <ul className="space-y-3">
              {[
                { name: "Disaster Preparedness", href: "/resources/preparedness" },
                { name: "Training Materials", href: "/resources/training" },
                { name: "Help Centers", href: "/resources/help-centers" },
                { name: "Community Guidelines", href: "/resources/guidelines" },
                { name: "Volunteer Handbook", href: "/resources/handbook" }
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-blue-100 hover:text-primary transition">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 mt-1 mr-3 text-primary flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-blue-100">123 Disaster Relief St, Safety City, SC 12345</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 mt-1 mr-3 text-primary flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="text-blue-100">info@resqlink.com</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 mt-1 mr-3 text-primary flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="text-blue-100">+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-100">© 2023 ResQLink. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-blue-100 hover:text-primary transition">Privacy Policy</Link>
            <Link href="/terms" className="text-blue-100 hover:text-primary transition">Terms of Service</Link>
            <Link href="/cookies" className="text-blue-100 hover:text-primary transition">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
