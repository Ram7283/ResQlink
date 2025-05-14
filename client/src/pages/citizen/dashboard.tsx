import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SosAlert } from "@shared/schema";
import { Loader2, AlertTriangle, MapPin, Phone, Info, BadgeHelp, Navigation, Building, Upload, Clock, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const sosAlertSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().min(10, "Please provide a detailed description of the emergency"),
  imageUrl: z.string().optional(),
});

type SosAlertFormValues = z.infer<typeof sosAlertSchema>;

export default function CitizenDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sos");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [, setPageLocation] = useLocation();

  // State for geolocation
  const [geoLocation, setGeoLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Fetch user's SOS alerts
  const { data: sosAlerts = [], isLoading: alertsLoading } = useQuery<SosAlert[]>({
    queryKey: ["/api/sos"],
  });

  // Fetch help centers
  const { data: helpCenters = [], isLoading: helpCentersLoading } = useQuery<any[]>({
    queryKey: ["/api/help-centers"],
  });

  // Fetch resources
  const { data: resources = [], isLoading: resourcesLoading } = useQuery<any[]>({
    queryKey: ["/api/resources", { language: selectedLanguage }],
  });

  // Fetch broadcasts
  const { data: broadcasts = [] } = useQuery({
    queryKey: ["/api/broadcasts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/broadcasts");
      return res.json();
    },
  });

  // SOS alert form
  const sosForm = useForm<SosAlertFormValues>({
    resolver: zodResolver(sosAlertSchema),
    defaultValues: {
      latitude: geoLocation?.latitude || 0,
      longitude: geoLocation?.longitude || 0,
      description: "",
      imageUrl: "",
    },
  });

  // Update form values when geoLocation changes
  useEffect(() => {
    if (geoLocation) {
      sosForm.setValue("latitude", geoLocation.latitude);
      sosForm.setValue("longitude", geoLocation.longitude);
    }
  }, [geoLocation, sosForm]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        sosForm.setValue("latitude", position.coords.latitude);
        sosForm.setValue("longitude", position.coords.longitude);
        setIsLocating(false);
        toast({
          title: "Location obtained",
          description: "Your current location has been added to the form",
        });
      },
      (error) => {
        setIsLocating(false);
        toast({
          title: "Error getting location",
          description: error.message,
          variant: "destructive",
        });
      }
    );
  };

  // SOS alert mutation
  const sosAlertMutation = useMutation({
    mutationFn: async (values: SosAlertFormValues) => {
      const res = await apiRequest("POST", "/api/sos", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "SOS Alert Sent",
        description: "Your emergency alert has been sent successfully. Help is on the way.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sos"] });
      sosForm.reset();
      setGeoLocation(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send SOS Alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle SOS form submission
  const onSosSubmit = (values: SosAlertFormValues) => {
    if (!geoLocation) {
      toast({
        title: "Location required",
        description: "Please get your current location before submitting",
        variant: "destructive",
      });
      return;
    }
    sosAlertMutation.mutate(values);
  };

  // Cancel SOS alert mutation
  const cancelSosAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const res = await apiRequest("PATCH", `/api/sos/${alertId}/status`, { status: "cancelled" });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "SOS Alert Cancelled",
        description: "Your emergency alert has been cancelled",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sos"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel SOS Alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle SOS alert cancellation
  const handleCancelSosAlert = (alertId: number) => {
    if (confirm("Are you sure you want to cancel this SOS alert?")) {
      cancelSosAlertMutation.mutate(alertId);
    }
  };

  // Submit feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async (data: { sosAlertId: number; volunteerId: number; rating: number; comment: string }) => {
      const res = await apiRequest("POST", "/api/feedback", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sos"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit feedback",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (alertsLoading || helpCentersLoading || resourcesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter active SOS alerts (not cancelled or resolved)
  const activeSosAlerts = sosAlerts.filter((alert: SosAlert) => 
    !["cancelled", "resolved"].includes(alert.status)
  );

  // Filter historical SOS alerts (cancelled or resolved)
  const historicalSosAlerts = sosAlerts.filter((alert: SosAlert) => 
    ["cancelled", "resolved"].includes(alert.status)
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Citizen Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <Button 
          variant="outline"
          className="mt-4 md:mt-0 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={() => {
            logoutMutation.mutate();
            setPageLocation('/');
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Broadcast Messages */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Broadcast Messages</CardTitle>
          <CardDescription>Important announcements from administrators</CardDescription>
        </CardHeader>
        <CardContent>
          {broadcasts.length > 0 ? (
            <div className="space-y-4">
              {broadcasts
                .filter((b: any) => b.target === "all" || b.target === "citizens")
                .map((b: any) => (
                  <div key={b.id} className="border-b pb-3">
                    <h3 className="text-md font-semibold">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(b.createdAt).toLocaleString()}</p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No broadcasts available</p>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="sos">SOS Alert</TabsTrigger>
          <TabsTrigger value="status">Alert Status</TabsTrigger>
          <TabsTrigger value="help">Help Centers</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="sos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Send SOS Alert
                </CardTitle>
                <CardDescription>
                  Request emergency assistance in your location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...sosForm}>
                  <form onSubmit={sosForm.handleSubmit(onSosSubmit)} className="space-y-6">
                    <div className="bg-muted/50 p-4 rounded-md mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Your Location
                        </h3>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={getCurrentLocation}
                          disabled={isLocating}
                        >
                          {isLocating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Getting location...
                            </>
                          ) : (
                            <>
                              <Navigation className="h-4 w-4 mr-1" />
                              Get My Location
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={sosForm.control}
                          name="latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitude</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Latitude"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  disabled
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={sosForm.control}
                          name="longitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitude</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Longitude"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  disabled
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {geoLocation && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Location coordinates obtained. Please describe your emergency below.
                        </p>
                      )}
                    </div>

                    <FormField
                      control={sosForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your emergency situation in detail"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Please provide as much detail as possible about your emergency
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={sosForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload Image (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Input
                                type="text"
                                placeholder="Paste image URL"
                                {...field}
                                className="flex-1 mr-2"
                              />
                              <Button type="button" variant="outline" disabled>
                                <Upload className="h-4 w-4 mr-1" />
                                Upload
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Upload an image that might help responders understand the situation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-red-500 hover:bg-red-600"
                      disabled={sosAlertMutation.isPending || !geoLocation}
                    >
                      {sosAlertMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending Alert...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Send SOS Alert
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact Information</CardTitle>
                <CardDescription>
                  Important contact numbers for different emergencies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md flex items-start">
                  <Phone className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Emergency Services</h3>
                    <p className="text-sm text-muted-foreground mb-1">For immediate assistance</p>
                    <p className="text-xl font-bold">911</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex items-start">
                  <Phone className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Disaster Management Control Room</h3>
                    <p className="text-sm text-muted-foreground mb-1">For disaster related emergencies</p>
                    <p className="text-xl font-bold">1070</p>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md flex items-start">
                  <Phone className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Medical Emergency</h3>
                    <p className="text-sm text-muted-foreground mb-1">For medical emergencies</p>
                    <p className="text-xl font-bold">102</p>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md flex items-start">
                  <Phone className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Fire Emergency</h3>
                    <p className="text-sm text-muted-foreground mb-1">For fire related emergencies</p>
                    <p className="text-xl font-bold">101</p>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md flex items-start">
                  <Info className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Important Information</h3>
                    <p className="text-sm text-muted-foreground">
                      When calling emergency services, try to stay calm and provide your location 
                      and describe the emergency situation clearly. If you're in immediate danger, 
                      use the SOS Alert feature to also notify nearby volunteers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Your SOS Alerts</CardTitle>
              <CardDescription>
                Track status of your emergency requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active Alerts</TabsTrigger>
                  <TabsTrigger value="history">Alert History</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                  {activeSosAlerts.length > 0 ? (
                    <div className="space-y-4">
                      {activeSosAlerts.map((alert: SosAlert & { assignedVolunteer?: any }) => (
                        <Card key={alert.id}>
                          <div className={`h-2 ${
                            alert.status === "new" ? "bg-red-500" :
                            alert.status === "assigned" ? "bg-yellow-500" :
                            "bg-blue-500"
                          }`}></div>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold flex items-center">
                                  <AlertTriangle className={`h-4 w-4 mr-1 ${
                                    alert.status === "new" ? "text-red-500" :
                                    alert.status === "assigned" ? "text-yellow-500" :
                                    "text-blue-500"
                                  }`} />
                                  Alert #{alert.id}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  Sent on {new Date(alert.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  alert.status === "new" ? "destructive" :
                                  alert.status === "assigned" ? "warning" :
                                  "default"
                                }
                              >
                                {alert.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm font-medium">Description</p>
                                <p className="text-sm text-muted-foreground">
                                  {alert.description}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Location</p>
                                <p className="text-sm text-muted-foreground flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
                                </p>
                              </div>
                            </div>

                            {alert.assignedVolunteerId && (
                              <div className="mb-4 bg-muted/30 p-3 rounded-md">
                                <p className="text-sm font-medium mb-2">Assigned Volunteer</p>
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(alert.assignedVolunteer?.name || 'V')}`} />
                                    <AvatarFallback>{(alert.assignedVolunteer?.name || 'V').substring(0, 1).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {alert.assignedVolunteer?.name || "Volunteer"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {alert.status === "assigned" ? "On the way" : "Helping you"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end">
                              {alert.status === "new" && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleCancelSosAlert(alert.id)}
                                  disabled={cancelSosAlertMutation.isPending}
                                >
                                  Cancel Alert
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Active Alerts</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        You don't have any active SOS alerts at the moment. 
                        If you're experiencing an emergency, go to the SOS tab to create an alert.
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="history">
                  {historicalSosAlerts.length > 0 ? (
                    <div className="space-y-4">
                      {historicalSosAlerts.map((alert: SosAlert & { assignedVolunteer?: any }) => (
                        <Card key={alert.id}>
                          <div className={`h-2 ${
                            alert.status === "resolved" ? "bg-green-500" : "bg-gray-300"
                          }`}></div>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold flex items-center">
                                  <AlertTriangle className={`h-4 w-4 mr-1 ${
                                    alert.status === "resolved" ? "text-green-500" : "text-gray-500"
                                  }`} />
                                  Alert #{alert.id}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(alert.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  alert.status === "resolved" ? "success" : "secondary"
                                }
                              >
                                {alert.status}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4">
                              {alert.description}
                            </p>

                            {alert.assignedVolunteerId && alert.status === "resolved" && (
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-2">Helped By</p>
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(alert.assignedVolunteer?.name || 'V')}`} />
                                    <AvatarFallback>{(alert.assignedVolunteer?.name || 'V').substring(0, 1).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {alert.assignedVolunteer?.name || "Volunteer"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {alert.status === "resolved" && alert.assignedVolunteerId && (
                              <Button variant="outline" size="sm">
                                Submit Feedback
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Alert History</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        You don't have any past SOS alerts. Your alert history will appear here
                        after you've submitted and resolved alerts.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>Nearby Help Centers</CardTitle>
              <CardDescription>
                Find emergency shelters and assistance centers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    These centers provide food, shelter, medical assistance, and other resources during emergencies.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={getCurrentLocation} disabled={isLocating}>
                  {isLocating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Finding centers...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-1" />
                      Find Nearest Centers
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {helpCenters.length > 0 ? (
                  helpCenters.map((center: any) => (
                    <Card key={center.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold">{center.name}</h3>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm flex items-start">
                            <MapPin className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{center.address}</span>
                          </p>
                          <p className="text-sm flex items-start">
                            <Phone className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{center.contactNumber}</span>
                          </p>
                          <p className="text-sm flex items-start">
                            <Clock className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{center.operatingHours}</span>
                          </p>
                        </div>
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-1">Services Offered</h4>
                          <div className="flex flex-wrap gap-1">
                            {center.servicesOffered.map((service: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Get Directions
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Help Centers Found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      We couldn't find any help centers. Please check your location settings
                      or try again later.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Disaster Preparedness Resources</CardTitle>
                  <CardDescription>
                    Educational resources to help you prepare for emergencies
                  </CardDescription>
                </div>
                <div className="mt-4 md:mt-0">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.length > 0 ? (
                  resources.map((resource: any) => (
                    <Card key={resource.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-primary h-3"></div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold">{resource.title}</h3>
                            <Badge variant="outline">{resource.resourceType}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {resource.description}
                          </p>
                          <Button variant="outline" size="sm" className="w-full">
                            View Resource
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <BadgeHelp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Resources Found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      We couldn't find any resources in the selected language. 
                      Please try another language or check back later.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}