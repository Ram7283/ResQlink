import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Shield, Heart, Star, Award, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>About Us - ResQLink</title>
        <meta name="description" content="Learn about ResQLink's mission to connect communities, empower volunteers, and coordinate rapid responses during disasters." />
      </Helmet>
      
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">About ResQLink</h1>
          <p className="text-lg text-muted-foreground mb-10">
            ResQLink is a comprehensive disaster management platform that connects citizens in need with nearby volunteers, 
            enabling faster emergency response and more coordinated disaster management.
          </p>
          
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <Card className="overflow-hidden">
                <div className="h-1 bg-primary"></div>
                <CardContent className="p-6">
                  <p className="mb-4">
                    Our mission is to leverage technology to save lives and reduce suffering during disasters
                    by creating a transparent, efficient, and responsive emergency management ecosystem.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                      </div>
                      <h3 className="font-semibold mb-2">Rapid Response</h3>
                      <p className="text-sm text-muted-foreground">
                        Connecting those in need with nearby help as quickly as possible
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                        <Shield className="h-6 w-6 text-blue-500" />
                      </div>
                      <h3 className="font-semibold mb-2">Community Resilience</h3>
                      <p className="text-sm text-muted-foreground">
                        Building stronger, more prepared communities through coordination
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                        <Heart className="h-6 w-6 text-green-500" />
                      </div>
                      <h3 className="font-semibold mb-2">Volunteer Empowerment</h3>
                      <p className="text-sm text-muted-foreground">
                        Recognizing and rewarding those who help others in times of need
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">Our Core Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start mb-4">
                      <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mr-4">
                        <Star className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Transparency</h3>
                        <p className="text-sm text-muted-foreground">
                          We believe in complete transparency in disaster response, ensuring everyone has access to reliable information.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start mb-4">
                      <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mr-4">
                        <Award className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Recognition</h3>
                        <p className="text-sm text-muted-foreground">
                          We recognize and reward volunteers who dedicate their time and skills to helping others in times of crisis.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start mb-4">
                      <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center mr-4">
                        <Users className="h-5 w-5 text-teal-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Inclusivity</h3>
                        <p className="text-sm text-muted-foreground">
                          We ensure our platform is accessible to everyone, regardless of language, background, or technical ability.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start mb-4">
                      <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center mr-4">
                        <Shield className="h-5 w-5 text-rose-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Reliability</h3>
                        <p className="text-sm text-muted-foreground">
                          We prioritize building a reliable system that works even in challenging conditions with limited connectivity.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">Our Team</h2>
              <p className="text-muted-foreground mb-6">
                ResQLink was created by a passionate team of developers, disaster management experts, and community organizers 
                who believe in the power of technology to make a difference during emergencies.
              </p>
              <p className="text-muted-foreground">
                Our diverse team brings together expertise in software development, emergency response, 
                volunteer coordination, and community building to create a platform that truly serves the needs 
                of both citizens and responders during disasters.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}