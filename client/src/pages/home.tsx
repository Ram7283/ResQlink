import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertTriangle, Users, Shield, MapPin, Clock, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import lottie from "lottie-web";

export default function Home() {
  const { user } = useAuth();
  const globeAnimationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the Lottie animation when component mounts
    if (globeAnimationRef.current) {
      const animation = lottie.loadAnimation({
        container: globeAnimationRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://assets5.lottiefiles.com/packages/lf20_UU2Kkp.json' // Earth spinning animation
      });
      
      return () => {
        // Clean up the animation when component unmounts
        animation.destroy();
      };
    }
  }, []);

  // Redirect based on user role if authenticated
  if (user) {
    if (user.role === "admin") {
      return <Redirect to="/admin/dashboard" />;
    } else if (user.role === "volunteer") {
      return <Redirect to="/volunteer/dashboard" />;
    } else if (user.role === "citizen") {
      return <Redirect to="/citizen/dashboard" />;
    }
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>ResQLink - Real-Time Disaster Management Platform</title>
        <meta name="description" content="Connect communities, empower volunteers, and coordinate rapid responses when every minute counts during disaster situations." />
      </Helmet>
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-black opacity-30"></div>
        </div>
        <div className="container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center relative z-10">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Real-Time Disaster Management Platform
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-xl">
              ResQLink connects citizens in distress with nearby volunteers, 
              enabling faster emergency response and more coordinated 
              disaster management through a transparent reward system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button size="lg" className="text-lg bg-white text-primary hover:bg-gray-100">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Request Help
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg border-white text-white hover:bg-white/10">
                  <Shield className="mr-2 h-5 w-5" />
                  Volunteer Now
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <div ref={globeAnimationRef} className="w-full max-w-md h-80 md:h-96"></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-background text-primary dark:text-primary-foreground py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold mb-2">15,000+</div>
                <div className="text-muted-foreground">People Helped</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold mb-2">750+</div>
                <div className="text-muted-foreground">Active Volunteers</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold mb-2">300+</div>
                <div className="text-muted-foreground">Crises Resolved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How ResQLink Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform connects citizens in need with nearby volunteers,
              providing real-time emergency response during disasters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="font-bold text-xl mb-2">1. Send SOS</h3>
                <p className="text-muted-foreground">
                  Citizens in distress can quickly send an SOS alert with their location 
                  and emergency details through the platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <MapPin className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="font-bold text-xl mb-2">2. Locate Volunteers</h3>
                <p className="text-muted-foreground">
                  The system automatically identifies and alerts nearby available 
                  volunteers who can provide immediate assistance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-green-500" />
                </div>
                <h3 className="font-bold text-xl mb-2">3. Provide Assistance</h3>
                <p className="text-muted-foreground">
                  Volunteers respond to the emergency, provide assistance, 
                  and log their actions to earn points and recognition.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Who Can Use ResQLink?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform serves different users with tailored features for each role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="overflow-hidden">
              <div className="h-3 bg-red-500"></div>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-xl mb-2 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-red-500" />
                    Citizens
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    People who need emergency assistance during disasters.
                  </p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mr-2 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                    </div>
                    <span className="text-sm">Send SOS alerts with location</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mr-2 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                    </div>
                    <span className="text-sm">Find nearby help centers</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mr-2 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                    </div>
                    <span className="text-sm">Access disaster preparedness resources</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mr-2 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                    </div>
                    <span className="text-sm">Track status of assistance requests</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-3 bg-blue-500"></div>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-xl mb-2 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-500" />
                    Volunteers
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    People who want to help others during emergencies.
                  </p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-2 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                    </div>
                    <span className="text-sm">Receive nearby SOS alerts</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-2 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                    </div>
                    <span className="text-sm">Update availability status</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-2 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                    </div>
                    <span className="text-sm">Earn points and badges for helping</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-2 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                    </div>
                    <span className="text-sm">Receive certificates for service</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-3 bg-amber-500"></div>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-xl mb-2 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-amber-500" />
                    Administrators
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Officials who manage and coordinate disaster response.
                  </p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mr-2 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                    </div>
                    <span className="text-sm">Monitor real-time SOS alerts</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mr-2 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                    </div>
                    <span className="text-sm">Manage volunteer assignments</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mr-2 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                    </div>
                    <span className="text-sm">View analytics and performance data</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mr-2 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                    </div>
                    <span className="text-sm">Send broadcast messages to users</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Join ResQLink Today</h2>
            <p className="text-xl mb-8">
              Be part of a community dedicated to helping each other during disasters.
              Register now to request help or volunteer your services.
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg bg-white text-primary hover:bg-gray-100">
                <Globe className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
