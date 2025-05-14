import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SosAlert, SosAlertStatus, User, VolunteerStatus, Statistics } from "@shared/schema";
import { 
  Loader2, UserCheck, AlertTriangle, Award, Users, Check, ChevronRight, Bell, 
  MessageSquare, Settings, MapPin, Clock, BarChart3, Search, PlusCircle,
  Calendar, Filter, UserX, UserPlus, CheckCircle2, Activity, ArrowUpRight,
  Eye, Pencil, Trash2, LogOut
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Define types for enhanced type safety
type VolunteerWithProfile = User & { 
  volunteerProfile?: { 
    points: number;
    badge: string; 
    status: VolunteerStatus;
    tasksCompleted: number;
    skills?: string[] | string;
    approvalStatus?: string;
    bio?: string;
    profilePicture?: string;
  } 
};

type SosAlertWithUsers = SosAlert & { 
  citizen?: User;
  assignedVolunteer?: User;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const { logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [pointsDialogOpen, setPointsDialogOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerWithProfile | null>(null);
  const [pointsToAward, setPointsToAward] = useState(10);
  // SOS Alerts filter state
  const [sosFilter, setSosFilter] = useState("all");

  const [volunteerStatusFilter, setVolunteerStatusFilter] = useState("all");

  const { data: broadcasts = [], isLoading: broadcastsLoading } = useQuery<any[]>({
    queryKey: ["/api/broadcasts"],
  });
  
  // Broadcast message state
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("all");
  // --- Broadcast edit/delete states ---
  const [editingBroadcastId, setEditingBroadcastId] = useState<number | null>(null);
  const [editedMessage, setEditedMessage] = useState("");
  // Mutation for updating a broadcast
  const updateBroadcastMutation = useMutation({
    mutationFn: async ({ id, message }: { id: number; message: string }) => {
      const res = await apiRequest("PATCH", `/api/broadcasts/${id}`, { message });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broadcasts"] });
      setEditingBroadcastId(null);
      toast({ title: "Broadcast Updated" });
    },
  });

  // Mutation for deleting a broadcast
  const deleteBroadcastMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/broadcasts/${id}`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broadcasts"] });
      toast({ title: "Broadcast Deleted" });
    },
  });

  // Function to display skill type in human-readable format
  const getSkillsDisplay = (skillType?: string): string => {
    if (!skillType) return "Not specified";
    
    const skillsMap: {[key: string]: string} = {
      "first_aid": "First Aid & CPR",
      "search_rescue": "Search & Rescue",
      "medical": "Medical Professional",
      "firefighting": "Firefighting",
      "emergency_mgmt": "Emergency Management",
      "construction": "Construction & Engineering",
      "transportation": "Transportation & Logistics",
      "communication": "Communication & Coordination",
      "counseling": "Mental Health Support",
      "other": "Other Skills"
    };
    
    return skillsMap[skillType] || skillType;
  };
  
  // Handle awarding points to volunteer
  const handleAwardPoints = (volunteer: VolunteerWithProfile) => {
    setSelectedVolunteer(volunteer);
    setPointsToAward(10);
    setPointsDialogOpen(true);
  };

  // Explicitly handle undefined values with default empty objects/arrays
  const { data: statistics = { peopleHelped: 0, activeVolunteers: 0, crisesResolved: 0 }, isLoading: statsLoading } = 
    useQuery<Statistics>({
      queryKey: ["/api/statistics"],
    });

  const { data: volunteers = [], isLoading: volunteersLoading } = 
    useQuery<VolunteerWithProfile[]>({
      queryKey: ["/api/volunteers"],
    });

  const { data: pendingVolunteers = [], isLoading: pendingVolunteersLoading } = 
    useQuery<VolunteerWithProfile[]>({
      queryKey: ["/api/volunteers/pending"],
    });

  const { data: sosAlerts = [], isLoading: alertsLoading } = 
    useQuery<SosAlertWithUsers[]>({
      queryKey: ["/api/sos"],
    });
    
  // Mutations for volunteer approval actions
  const approveVolunteerMutation = useMutation({
    mutationFn: async (volunteerId: number) => {
      const res = await apiRequest("PATCH", `/api/volunteers/${volunteerId}/approve`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Volunteer approved",
        description: "The volunteer has been approved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const rejectVolunteerMutation = useMutation({
    mutationFn: async (volunteerId: number) => {
      const res = await apiRequest("PATCH", `/api/volunteers/${volunteerId}/reject`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      toast({
        title: "Volunteer rejected",
        description: "The volunteer has been rejected successfully.",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Mutations for SOS alert management
  const assignSosAlertMutation = useMutation({
    mutationFn: async ({ sosId, volunteerId }: { sosId: number, volunteerId: number }) => {
      const res = await apiRequest("POST", `/api/sos/${sosId}/assign`, { volunteerId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sos"] });
      toast({
        title: "SOS Alert Assigned",
        description: "The SOS alert has been assigned successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const updateSosStatusMutation = useMutation({
    mutationFn: async ({ sosId, status }: { sosId: number, status: SosAlertStatus }) => {
      const res = await apiRequest("PATCH", `/api/sos/${sosId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sos"] });
      toast({
        title: "SOS Alert Updated",
        description: "The SOS alert status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Mutation for awarding points to volunteers
  const awardPointsMutation = useMutation({
    mutationFn: async ({ volunteerId, points }: { volunteerId: number, points: number }) => {
      const res = await apiRequest("POST", `/api/volunteer/${volunteerId}/award-points`, { points: Number(points) });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] }); // ✅ Refresh volunteer view
      setPointsDialogOpen(false);
      toast({
        title: "Points Awarded",
        description: `Successfully awarded points. New total: ${data.newPoints} points. ${data.badge ? `New badge: ${data.badge}` : ''}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  
  const broadcastMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/broadcasts", {
        title: broadcastTitle,
        message: broadcastMessage,
        target: broadcastTarget,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broadcasts"] });
      toast({ title: "Broadcast Sent", description: "Message delivered successfully." });
      setBroadcastTitle("");
      setBroadcastMessage("");
      setBroadcastTarget("all");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  // Handle approve all volunteers
  const handleApproveAll = () => {
    if (pendingVolunteers.length === 0) {
      toast({
        title: "No pending volunteers",
        description: "There are no pending volunteers to approve.",
        variant: "default"
      });
      return;
    }
    
    pendingVolunteers.forEach(volunteer => {
      approveVolunteerMutation.mutate(volunteer.id);
    });
  };
  

  
  // Handle reject all volunteers
  const handleRejectAll = () => {
    if (pendingVolunteers.length === 0) {
      toast({
        title: "No pending volunteers",
        description: "There are no pending volunteers to reject.",
        variant: "default"
      });
      return;
    }
    
    pendingVolunteers.forEach(volunteer => {
      rejectVolunteerMutation.mutate(volunteer.id);
    });
  };

  if (statsLoading || volunteersLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-primary flex items-center">
            <span className="bg-primary text-white p-1 rounded mr-2 text-xs">Admin</span>
            ResQLink
          </h2>
        </div>
        
        <div className="flex-1 py-2 overflow-y-auto">
          <nav className="px-2 space-y-1">
            <button 
              onClick={() => setActiveTab("overview")} 
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md w-full transition-colors",
                activeTab === "overview" 
                  ? "bg-primary text-white" 
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              Dashboard
            </button>
            
            <button 
              onClick={() => setActiveTab("volunteers")} 
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md w-full transition-colors",
                activeTab === "volunteers" 
                  ? "bg-primary text-white" 
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <UserCheck className="mr-3 h-5 w-5" />
              Volunteers
              {pendingVolunteers.length > 0 && (
                <Badge className="ml-auto bg-red-500">{pendingVolunteers.length}</Badge>
              )}
            </button>
            
            <button 
              onClick={() => setActiveTab("sos")} 
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md w-full transition-colors",
                activeTab === "sos" 
                  ? "bg-primary text-white" 
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <AlertTriangle className="mr-3 h-5 w-5" />
              SOS Alerts
            </button>
            
            <button 
              onClick={() => setActiveTab("broadcasts")} 
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md w-full transition-colors",
                activeTab === "broadcasts" 
                  ? "bg-primary text-white" 
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Bell className="mr-3 h-5 w-5" />
              Broadcasts
            </button>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="https://ui-avatars.com/api/?name=Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">System Administrator</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">admin@resqlink.org</p>
            </div>
            <div className="ml-auto flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  toast({
                    title: "System Settings",
                    description: "Settings functionality will be added in future updates.",
                  })
                }
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  logoutMutation.mutate();
                  setLocation('/');
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "volunteers" && "Manage Volunteers"}
              {activeTab === "sos" && "SOS Alerts Management"}
              {activeTab === "broadcasts" && "Broadcast Messaging"}
            </h1>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search..." 
                  className="w-64 pl-8 rounded-full h-9 focus-visible:ring-primary" 
                />
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Notifications",
                    description: "You have no new notifications",
                  });
                }}
              >
                <Bell className="h-4 w-4 mr-2" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  logoutMutation.mutate();
                  setLocation('/');
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
              <TabsTrigger value="sos">SOS Alerts</TabsTrigger>
              <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
            </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="People Helped"
              value={statistics?.peopleHelped || 0}
              description="Citizens who received assistance"
              icon={<Users className="h-6 w-6" />}
              trend="+5% from last week"
              className="bg-blue-50 dark:bg-blue-950"
            />
            <StatsCard
              title="Active Volunteers"
              value={statistics?.activeVolunteers || 0}
              description="Volunteers currently available"
              icon={<UserCheck className="h-6 w-6" />}
              trend="+2% from last week"
              className="bg-green-50 dark:bg-green-950"
            />
            <StatsCard
              title="Crises Resolved"
              value={statistics?.crisesResolved || 0}
              description="Successfully completed rescues"
              icon={<Check className="h-6 w-6" />}
              trend="+8% from last week"
              className="bg-purple-50 dark:bg-purple-950"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent SOS Alerts</CardTitle>
                <CardDescription>Latest emergency requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sosAlerts && sosAlerts.length > 0 ? (
                    sosAlerts.slice(0, 5).map((alert: SosAlert) => (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <div className="flex items-center">
                          <AlertTriangle
                            className={cn(
                              "h-5 w-5 mr-3",
                              alert.status === "new" ? "text-red-500" :
                              alert.status === "assigned" ? "text-yellow-500" :
                              alert.status === "in-progress" ? "text-blue-500" :
                              alert.status === "resolved" ? "text-green-500" : "text-gray-500"
                            )}
                          />
                          <div>
                            <p className="font-medium">Alert #{alert.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {alert.description.substring(0, 30)}...
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            alert.status === "new" ? "destructive" :
                            alert.status === "assigned" ? "warning" :
                            alert.status === "in-progress" ? "default" :
                            alert.status === "resolved" ? "success" : "secondary"
                          } 
                          className={
                            alert.status === "assigned" ? "bg-amber-500 text-white hover:bg-amber-500/80" : 
                            alert.status === "resolved" ? "bg-green-500 text-white hover:bg-green-500/80" : ""
                          }
                        >
                          {alert.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No recent alerts</p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setActiveTab("sos")}
                >
                  View All Alerts
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Volunteers</CardTitle>
                <CardDescription>Most active rescuers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {volunteers && volunteers.length > 0 ? (
                    volunteers
                      .slice(0, 5)
                      .sort((a: any, b: any) => 
                        (b.volunteerProfile?.points || 0) - (a.volunteerProfile?.points || 0)
                      )
                      .map((volunteer: User & { volunteerProfile?: { points: number, badge: string }}) => (
                        <div
                          key={volunteer.id}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div className="flex items-center">
                            <Avatar className="h-9 w-9 mr-3">
                              <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(volunteer.name)}`} />
                              <AvatarFallback>{volunteer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{volunteer.name}</p>
                              <div className="flex items-center">
                                <Award className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                                <p className="text-sm text-muted-foreground">
                                  {volunteer.volunteerProfile?.points || 0} points
                                </p>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {volunteer.volunteerProfile?.badge || "Rookie"}
                          </Badge>
                        </div>
                      ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No volunteers yet</p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setActiveTab("volunteers")}
                >
                  View All Volunteers
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volunteers">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-amber-500" />
                    Pending Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{pendingVolunteers.length}</p>
                  <p className="text-sm text-muted-foreground">Volunteers awaiting approval</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab("volunteers")}
                  >
                    Review Applications
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-green-500" />
                    Active Volunteers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{statistics?.activeVolunteers || 0}</p>
                  <p className="text-sm text-muted-foreground">Available for assignments</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Active Volunteers",
                        description: "Showing all active volunteers in the table below",
                      });
                    }}
                  >
                    View All
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Award className="h-5 w-5 mr-2 text-blue-500" />
                    Total Points Awarded
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {volunteers?.reduce((total: number, v: any) => total + (v.volunteerProfile?.points || 0), 0) || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Cumulative recognition points</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Adjust Points",
                        description:
                          "Use the 'Award Points' button in the volunteers table to adjust individual scores.",
                      });
                    }}
                  >
                    Adjust Points
                  </Button>
                </CardFooter>
              </Card>
            </div>
          
            {/* Pending Approvals Section */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pending Volunteer Approvals</CardTitle>
                    <CardDescription>Review and approve volunteer applications</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRejectAll}
                      disabled={pendingVolunteers.length === 0}
                    >
                      <UserX className="mr-1 h-4 w-4" />
                      Reject All
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleApproveAll}
                      disabled={pendingVolunteers.length === 0}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Approve All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {pendingVolunteers.length > 0 ? (
                      pendingVolunteers.map((volunteer) => (
                        <Card key={volunteer.id} className="bg-muted/40">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(volunteer.name)}`} />
                                  <AvatarFallback>{volunteer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{volunteer.name}</h4>
                                  <p className="text-sm text-muted-foreground">{volunteer.email}</p>
                                  <div className="flex gap-3 mt-1">
                                    <div className="flex items-center">
                                      <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                      <span className="text-xs">{volunteer.location || "Location not specified"}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                      <span className="text-xs">
                                        Applied {new Date(volunteer.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => rejectVolunteerMutation.mutate(volunteer.id)}
                                >
                                  Decline
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  onClick={() => approveVolunteerMutation.mutate(volunteer.id)}
                                >
                                  Approve
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3 space-y-2">
                              <div>
                                <p className="text-sm font-medium mb-1">Primary Skill:</p>
                                <Badge variant="outline" className="bg-blue-50">
                                  {volunteer.volunteerProfile?.skills === "first_aid" && "First Aid & CPR"}
                                  {volunteer.volunteerProfile?.skills === "search_rescue" && "Search & Rescue"}
                                  {volunteer.volunteerProfile?.skills === "medical" && "Medical Professional"}
                                  {volunteer.volunteerProfile?.skills === "firefighting" && "Firefighting"}
                                  {volunteer.volunteerProfile?.skills === "emergency_mgmt" && "Emergency Management"}
                                  {volunteer.volunteerProfile?.skills === "construction" && "Construction & Engineering"}
                                  {volunteer.volunteerProfile?.skills === "transportation" && "Transportation & Logistics"}
                                  {volunteer.volunteerProfile?.skills === "communication" && "Communication & Coordination"}
                                  {volunteer.volunteerProfile?.skills === "counseling" && "Mental Health Support"}
                                  {volunteer.volunteerProfile?.skills === "other" && "Other Skills"}
                                  {!volunteer.volunteerProfile?.skills && "No skills specified"}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Status:</p>
                                <Badge variant={
                                  volunteer.volunteerProfile?.status === "available" ? "success" :
                                  volunteer.volunteerProfile?.status === "busy" ? "warning" :
                                  "secondary"
                                } className="bg-green-50">
                                  {volunteer.volunteerProfile?.status || "offline"}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Tasks Completed:</p>
                                <p className="text-sm text-muted-foreground">
                                  {volunteer.volunteerProfile?.tasksCompleted || 0}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No pending volunteer applications</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Volunteer Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Manage Volunteers</CardTitle>
                    <CardDescription>View, add or edit volunteer accounts</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                    <Select onValueChange={(value) => setVolunteerStatusFilter(value)} value={volunteerStatusFilter}>
                        <SelectTrigger className="w-[160px] h-9">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Filters",
                            description: "Advanced filtering options will be available soon",
                          });
                        }}
                      >
                        <Filter className="mr-1 h-4 w-4" />
                        Filters
                      </Button>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Add Volunteer",
                          description: "Volunteer registration form will open soon",
                        });
                      }}
                    >
                      <PlusCircle className="mr-1 h-4 w-4" />
                      Add Volunteer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Name</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Points</th>
                        <th className="py-3 px-4 text-left font-medium">Tasks</th>
                        <th className="py-3 px-4 text-left font-medium">Badge</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volunteers && volunteers.length > 0 ? (
                        volunteers.map((volunteer: User & { volunteerProfile?: any }) => (
                          <tr key={volunteer.id} className="border-b">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(volunteer.name)}`} />
                                  <AvatarFallback>{volunteer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{volunteer.name}</p>
                                  <p className="text-xs text-muted-foreground">{volunteer.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  volunteer.volunteerProfile?.status === "available" ? "success" :
                                  volunteer.volunteerProfile?.status === "busy" ? "warning" : "secondary"
                                }
                                className={
                                  volunteer.volunteerProfile?.status === "available" ? "bg-green-500 text-white hover:bg-green-500/80" : 
                                  volunteer.volunteerProfile?.status === "busy" ? "bg-amber-500 text-white hover:bg-amber-500/80" : ""
                                }
                              >
                                {volunteer.volunteerProfile?.status || "offline"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">{volunteer.volunteerProfile?.points || 0}</td>
                            <td className="py-3 px-4">{volunteer.volunteerProfile?.tasksCompleted || 0}</td>
                            <td className="py-3 px-4">{volunteer.volunteerProfile?.badge || "None"}</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    // Show volunteer profile details in a toast
                                    toast({
                                      title: "Volunteer Profile",
                                      description: (
                                        <div className="mt-2 space-y-2">
                                          <p><strong>Name:</strong> {volunteer.name}</p>
                                          <p><strong>Email:</strong> {volunteer.email}</p>
                                          <p><strong>Phone:</strong> {volunteer.phone || "Not provided"}</p>
                                          <p><strong>Location:</strong> {volunteer.location || "Not provided"}</p>
                                          <p><strong>Status:</strong> {volunteer.volunteerProfile?.status || "offline"}</p>
                                          <p><strong>Points:</strong> {volunteer.volunteerProfile?.points || 0}</p>
                                          <p><strong>Tasks Completed:</strong> {volunteer.volunteerProfile?.tasksCompleted || 0}</p>
                                          <p><strong>Skills:</strong> {getSkillsDisplay(volunteer.volunteerProfile?.skills)}</p>
                                        </div>
                                      ),
                                      duration: 10000,
                                    });
                                  }}
                                >
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    // Open dialog to award points to volunteer
                                    handleAwardPoints(volunteer);
                                  }}
                                >
                                  Award Points
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-muted-foreground">
                            No volunteers found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled
                    onClick={() => {
                      toast({
                        title: "Pagination",
                        description: "No previous page available.",
                      });
                    }}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Pagination",
                        description: "There are no more volunteers to display.",
                      });
                    }}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sos">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                    New Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {sosAlerts?.filter((alert: any) => alert.status === "new").length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Awaiting response</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="destructive" size="sm" className="w-full">
                    Respond Now
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-yellow-500" />
                    In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {sosAlerts?.filter((alert: any) => alert.status === "in-progress" || alert.status === "assigned").length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Active responses</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                    Resolved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {sosAlerts?.filter((alert: any) => alert.status === "resolved").length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed rescues</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" size="sm" className="w-full">
                    View Records
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-gray-50 dark:bg-gray-800/20 border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                    Active Regions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Areas with alerts</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" size="sm" className="w-full">
                    View Map
                  </Button>
                </CardFooter>
              </Card>
            </div>
          
            {/* SOS Alert Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>SOS Alerts</CardTitle>
                    <CardDescription>Monitor and manage emergency requests</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Select onValueChange={(val) => setSosFilter(val)} value={sosFilter}>
                        <SelectTrigger className="w-[160px] h-9">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast({
                            title: "Filters",
                            description: "Advanced filtering options will be available soon",
                          })
                        }
                      >
                        <Filter className="mr-1 h-4 w-4" />
                        Filters
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        toast({
                          title: "Coming Soon",
                          description:
                            "This feature is under development and will be available soon.",
                        })
                      }
                    >
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">ID</th>
                        <th className="py-3 px-4 text-left font-medium">Citizen</th>
                        <th className="py-3 px-4 text-left font-medium">Location</th>
                        <th className="py-3 px-4 text-left font-medium">Description</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Assigned To</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sosAlerts && sosAlerts.length > 0 ? (
                        (sosFilter === "all"
                          ? sosAlerts
                          : sosAlerts.filter((alert) => alert.status === sosFilter)
                        ).map((alert: SosAlert & { citizen?: User, assignedVolunteer?: User }) => (
                          <tr key={alert.id} className="border-b">
                            <td className="py-3 px-4">#{alert.id}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <Avatar className="h-7 w-7 mr-2">
                                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(alert.citizen?.name || 'User')}`} />
                                  <AvatarFallback>{(alert.citizen?.name || 'U').substring(0, 1).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span>{alert.citizen?.name || `Citizen #${alert.citizenId}`}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <span className="text-xs">
                                  {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="truncate block max-w-[200px]">{alert.description}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  alert.status === "new" ? "destructive" :
                                  alert.status === "assigned" ? "default" :
                                  alert.status === "in-progress" ? "default" :
                                  alert.status === "resolved" ? "success" : "secondary"
                                }
                                className={
                                  alert.status === "assigned" ? "bg-amber-500 text-white hover:bg-amber-500/80" : 
                                  alert.status === "resolved" ? "bg-green-500 text-white hover:bg-green-500/80" : ""
                                }
                              >
                                {alert.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {alert.assignedVolunteerId ? (
                                <div className="flex items-center">
                                  <Avatar className="h-7 w-7 mr-2">
                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(alert.assignedVolunteer?.name || 'V')}`} />
                                    <AvatarFallback>{(alert.assignedVolunteer?.name || 'V').substring(0, 1).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <span>{alert.assignedVolunteer?.name || `Volunteer #${alert.assignedVolunteerId}`}</span>
                                </div>
                              ) : (
                                <Badge variant="outline">Unassigned</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Select 
                                  defaultValue={alert.status} 
                                  disabled={alert.status === "resolved" || alert.status === "cancelled"}
                                  onValueChange={(value) => {
                                    if (value !== alert.status) {
                                      updateSosStatusMutation.mutate({ 
                                        sosId: alert.id, 
                                        status: value as SosAlertStatus 
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8 w-32">
                                    <SelectValue placeholder="Change status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="assigned">Assigned</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      disabled={
                                        alert.status === "resolved" || 
                                        alert.status === "cancelled" || 
                                        !volunteers.some(v => v.volunteerProfile?.status === "available")
                                      }
                                    >
                                      Assign
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Assign Volunteer to SOS Alert #{alert.id}</DialogTitle>
                                      <DialogDescription>
                                        Select an available volunteer to assign to this emergency alert.
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Available Volunteers</label>
                                        
                                        {volunteers && volunteers.filter(v => 
                                          v.volunteerProfile?.status === "available" && 
                                          v.volunteerProfile?.approvalStatus === "approved"
                                        ).length > 0 ? (
                                          <div className="max-h-60 overflow-auto rounded-md border">
                                            <table className="w-full text-sm">
                                              <thead>
                                                <tr className="border-b bg-muted/50">
                                                  <th className="py-2 px-4 text-left font-medium">Name</th>
                                                  <th className="py-2 px-4 text-left font-medium">Points</th>
                                                  <th className="py-2 px-4 text-left font-medium">Badge</th>
                                                  <th className="py-2 px-4 text-left font-medium">Actions</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {volunteers.filter(v => 
                                                  v.volunteerProfile?.status === "available" && 
                                                  v.volunteerProfile?.approvalStatus === "approved"
                                                ).map(volunteer => (
                                                  <tr key={volunteer.id} className="border-b">
                                                    <td className="py-2 px-4">
                                                      <div className="flex items-center">
                                                        <Avatar className="h-6 w-6 mr-2">
                                                          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(volunteer.name)}`} />
                                                          <AvatarFallback>{volunteer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{volunteer.name}</span>
                                                      </div>
                                                    </td>
                                                    <td className="py-2 px-4">{volunteer.volunteerProfile?.points || 0}</td>
                                                    <td className="py-2 px-4">
                                                      <Badge variant="outline">{volunteer.volunteerProfile?.badge || "Newcomer"}</Badge>
                                                    </td>
                                                    <td className="py-2 px-4">
                                                      <Button 
                                                        size="sm" 
                                                        variant="default"
                                                        onClick={() => {
                                                          assignSosAlertMutation.mutate({
                                                            sosId: alert.id,
                                                            volunteerId: volunteer.id
                                                          });
                                                        }}
                                                        disabled={assignSosAlertMutation.isPending}
                                                      >
                                                        {assignSosAlertMutation.isPending ? 
                                                          <Loader2 className="h-4 w-4 animate-spin mr-1" /> : 
                                                          <UserCheck className="h-4 w-4 mr-1" />
                                                        }
                                                        Assign
                                                      </Button>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : (
                                          <div className="p-4 text-center border rounded-md">
                                            <UserX className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">No available volunteers found.</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                      </DialogClose>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-muted-foreground">
                            No SOS alerts found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    onClick={() => {
                      toast({
                        title: "Pagination",
                        description: "No previous page available.",
                      });
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Pagination",
                        description: "There are no more items to display.",
                      });
                    }}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="broadcasts">
          <div className="space-y-6">
            {/* Removed disabled broadcast feature cards */}
          
            {/* Broadcast Message Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Broadcast Messages</CardTitle>
                    <CardDescription>Send announcements to users</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[160px] h-9">
                          <SelectValue placeholder="Filter by target" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Recipients</SelectItem>
                          <SelectItem value="citizens">Citizens</SelectItem>
                          <SelectItem value="volunteers">Volunteers</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Filters",
                            description: "Filter options will be available soon.",
                          });
                        }}
                      >
                        <Filter className="mr-1 h-4 w-4" />
                        Filters
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Broadcast creation form */}
                <div className="space-y-4 mt-6">
                  <Input
                    placeholder="Broadcast Title"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                  />
                  <textarea
                    placeholder="Message"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full border rounded p-2 h-24"
                  />
                  <Select onValueChange={setBroadcastTarget} value={broadcastTarget}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Target Audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="citizens">Citizens</SelectItem>
                      <SelectItem value="volunteers">Volunteers</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      if (!broadcastTitle || !broadcastMessage) {
                        toast({
                          title: "Error",
                          description: "Please provide both a title and message.",
                          variant: "destructive",
                        });
                        return;
                      }
                      broadcastMutation.mutate();
                    }}
                  >
                    Send Broadcast
                  </Button>
                </div>
                {/* End broadcast creation form */}
                <div className="rounded-md border mt-8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Title</th>
                        <th className="py-3 px-4 text-left font-medium">Target</th>
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {broadcasts.length > 0 ? (
                        broadcasts.map((b: any) => (
                          <tr key={b.id} className="border-b">
                            <td className="py-3 px-4">{b.title}</td>
                            <td className="py-3 px-4 capitalize">{b.target}</td>
                            <td className="py-3 px-4">{new Date(b.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Sent</Badge>
                            </td>
                            <td className="py-3 px-4 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingBroadcastId(b.id);
                                  setEditedMessage(b.message);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteBroadcastMutation.mutate(b.id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center text-muted-foreground py-4">
                            No broadcast messages found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Edit Broadcast Message Form - moved outside table */}
                {editingBroadcastId && (
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-medium">Edit Message</h4>
                    <textarea
                      className="w-full border rounded p-2 h-24"
                      value={editedMessage}
                      onChange={(e) => setEditedMessage(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          updateBroadcastMutation.mutate({ id: editingBroadcastId, message: editedMessage })
                        }
                      >
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditingBroadcastId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled
                    onClick={() => {
                      toast({
                        title: "Pagination",
                        description: "No previous page available.",
                      });
                    }}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Pagination",
                        description: "There are no more items to display.",
                      });
                    }}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Award Points Dialog */}
      <Dialog open={pointsDialogOpen} onOpenChange={setPointsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              Award Points to Volunteer
            </DialogTitle>
            <DialogDescription>
              Reward {selectedVolunteer?.name} for their contribution to the community.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Current Stats</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded-md">
                    <div className="text-muted-foreground">Current Points</div>
                    <div className="font-medium">{selectedVolunteer?.volunteerProfile?.points || 0}</div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-md">
                    <div className="text-muted-foreground">Current Badge</div>
                    <div className="font-medium">{selectedVolunteer?.volunteerProfile?.badge || "None"}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Points to Award</label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[pointsToAward]}
                    min={5}
                    max={50}
                    step={5}
                    onValueChange={(value) => setPointsToAward(value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 rounded-md border border-input bg-background px-3 py-1 text-sm text-right">
                    {pointsToAward}
                  </span>
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
                <h4 className="font-medium text-sm flex items-center text-orange-800 dark:text-orange-300">
                  <Award className="h-4 w-4 mr-1" />
                  Badge Thresholds
                </h4>
                <ul className="mt-1 text-xs space-y-1 text-orange-700 dark:text-orange-400">
                  <li className="flex justify-between">
                    <span>Rescue Rookie:</span>
                    <span>50+ points</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Disaster Hero:</span>
                    <span>100+ points</span>
                  </li>
                  <li className="flex justify-between">
                    <span>ResQ Legend:</span>
                    <span>200+ points</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPointsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedVolunteer) {
                  awardPointsMutation.mutate({
                    volunteerId: selectedVolunteer.id,
                    points: pointsToAward
                  });
                }
              }}
              disabled={awardPointsMutation.isPending}
              className="gap-1"
            >
              {awardPointsMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Award Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  trend: string;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold">{value.toLocaleString()}</h3>
          </div>
          <div className="bg-white dark:bg-black rounded-full p-2">
            {icon}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
        <p className="text-xs font-medium mt-3 text-muted-foreground">{trend}</p>
      </CardContent>
    </Card>
  );
}