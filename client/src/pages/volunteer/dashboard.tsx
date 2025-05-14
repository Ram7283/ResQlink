import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SosAlert, User, VolunteerStatus } from "@shared/schema";
import { Loader2, AlertTriangle, Clock, Trophy, CircleCheck, User as UserIcon, MapPin, ShieldAlert, LogOut, Camera, Upload, X, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Define enhanced user type with volunteer profile
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

export default function VolunteerDashboard() {
  const { user, logoutMutation } = useAuth();

  // Explicitly fetch the authenticated user's full data for dynamic updates
  const { data: profileUser } = useQuery<VolunteerWithProfile>({
    queryKey: ["/api/me"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/me");
      return await res.json();
    },
  });
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [, setLocation] = useLocation();

  // Volunteer status
  const [status, setStatus] = useState<VolunteerStatus>(
    (profileUser?.volunteerProfile?.status as VolunteerStatus) || "offline"
  );
  
  // Status mutation
  const statusMutation = useMutation({
    mutationFn: async (newStatus: VolunteerStatus) => {
      const res = await apiRequest("PATCH", "/api/volunteers/status", { status: newStatus });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: `Your status is now set to ${status}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Accept SOS alert mutation
  const acceptSosMutation = useMutation({
    mutationFn: async (sosId: number) => {
      const res = await apiRequest("POST", `/api/sos/${sosId}/assign`, { volunteerId: user?.id });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "SOS Alert accepted",
        description: "You have been assigned to this SOS alert",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sos"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to accept SOS alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // States for task completion dialog
  const [taskCompletionOpen, setTaskCompletionOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [currentSosId, setCurrentSosId] = useState<number | null>(null);
  const [proofImageUrl, setProofImageUrl] = useState("");
    
  // Update SOS alert status mutation
  const updateSosStatusMutation = useMutation({
    mutationFn: async ({ sosId, status }: { sosId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/sos/${sosId}/status`, { status });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "SOS Alert updated",
        description: `Alert status changed to ${variables.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sos"] });
      
      // If the status is resolved, open the task completion dialog
      if (variables.status === "resolved") {
        setCurrentSosId(variables.sosId);
        setTaskCompletionOpen(true);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update SOS alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch SOS alerts
  const { data: sosAlerts = [], isLoading: alertsLoading } = useQuery<SosAlert[]>({
    queryKey: ["/api/sos"],
  });

  // Fetch task completions
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<any[]>({
    queryKey: ["/api/tasks", { volunteerId: user?.id }],
    enabled: !!user?.id,
  });

  // Fetch certificates
  const { data: certificates = [], isLoading: certificatesLoading } = useQuery<any[]>({
    queryKey: ["/api/certificates"],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await apiRequest("GET", `/api/certificates?volunteerId=${user.id}`);
      return await res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch broadcast messages
  const { data: broadcasts = [] } = useQuery({
    queryKey: ["/api/broadcasts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/broadcasts");
      return res.json();
    },
  });

  // Handle status change
  const handleStatusChange = (newStatus: VolunteerStatus) => {
    setStatus(newStatus);
    statusMutation.mutate(newStatus);
  };
  
  // Handle accept SOS alert
  const handleAcceptSosAlert = (sosId: number) => {
    acceptSosMutation.mutate(sosId);
  };
  
  // Handle update SOS status
  const handleUpdateSosStatus = (sosId: number, newStatus: string) => {
    updateSosStatusMutation.mutate({ sosId, status: newStatus });
  };

  // Calculate next badge target
  const calculateNextBadgeProgress = () => {
    const points = profileUser?.volunteerProfile?.points || 0;
    if (points < 50) {
      return {
        current: "Newcomer",
        next: "Rescue Rookie",
        progress: (points / 50) * 100,
        target: 50
      };
    } else if (points < 100) {
      return {
        current: "Rescue Rookie",
        next: "Disaster Hero",
        progress: ((points - 50) / 50) * 100,
        target: 100
      };
    } else if (points < 200) {
      return {
        current: "Disaster Hero",
        next: "ResQ Legend",
        progress: ((points - 100) / 100) * 100,
        target: 200
      };
    } else {
      return {
        current: "ResQ Legend",
        next: "Master",
        progress: 100,
        target: points
      };
    }
  };

  const badgeProgress = calculateNextBadgeProgress();

  // Task completion mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskData: { sosAlertId: number; notes: string; proofImageUrl?: string }) => {
      const res = await apiRequest("POST", `/api/tasks/complete`, taskData);
      return await res.json();
    },
    onSuccess: () => {
      setTaskCompletionOpen(false);
      setCompletionNotes("");
      setProofImageUrl("");
      setCurrentSosId(null);
      
      // Update queries
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      
      // Update volunteer status back to available
      setStatus("available");
      statusMutation.mutate("available");
      
      toast({
        title: "Task Completed",
        description: "Your task completion has been submitted for review.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to complete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle task completion submission
  const handleTaskCompletion = () => {
    if (!currentSosId) return;
    
    completeTaskMutation.mutate({
      sosAlertId: currentSosId,
      notes: completionNotes,
      proofImageUrl: proofImageUrl || undefined
    });
  };
  
  // Show loading state
  if (alertsLoading || tasksLoading || certificatesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      {/* Task Completion Dialog */}
      <Dialog open={taskCompletionOpen} onOpenChange={setTaskCompletionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Task Completion</DialogTitle>
            <DialogDescription>
              Provide details about the completed task to receive points.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Task Notes</Label>
              <Textarea
                id="notes"
                placeholder="Describe how you resolved the situation..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="resize-none"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proofImageUrl">Proof Image URL (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="proofImageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={proofImageUrl}
                  onChange={(e) => setProofImageUrl(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  type="button"
                  onClick={() => setProofImageUrl("")}
                  disabled={!proofImageUrl}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload your image to an image hosting service and paste the URL here
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTaskCompletionOpen(false);
                setCompletionNotes("");
                setProofImageUrl("");
                setCurrentSosId(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleTaskCompletion}
              disabled={completeTaskMutation.isPending || !completionNotes}
            >
              {completeTaskMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Volunteer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profileUser?.name || user?.name}</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button
            variant={status === "available" ? "default" : "outline"}
            onClick={() => handleStatusChange("available" as VolunteerStatus)}
            disabled={statusMutation.isPending}
            className={cn(
              "transition-colors",
              status === "available"
                ? "bg-green-500 hover:bg-green-600 text-white shadow"
                : "hover:bg-green-50"
            )}
          >
            <CircleCheck className="mr-2 h-4 w-4" />
            Available
          </Button>
          <Button
            variant={status === "busy" ? "default" : "outline"}
            onClick={() => handleStatusChange("busy" as VolunteerStatus)}
            disabled={statusMutation.isPending}
            className={cn(
              "transition-colors",
              status === "busy"
                ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow"
                : "hover:bg-yellow-50"
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            Busy
          </Button>
          <Button
            variant={status === "offline" ? "default" : "outline"}
            onClick={() => handleStatusChange("offline" as VolunteerStatus)}
            disabled={statusMutation.isPending}
            className={cn(
              "transition-colors",
              status === "offline"
                ? "bg-gray-500 hover:bg-gray-600 text-white shadow"
                : "hover:bg-gray-50"
            )}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Offline
          </Button>
          <Button
            variant="outline"
            className="ml-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors"
            onClick={() => {
              logoutMutation.mutate();
              setLocation('/');
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Broadcast Messages */}
      <Card className="mb-8 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Broadcast Messages</CardTitle>
          <CardDescription>Latest announcements for you</CardDescription>
        </CardHeader>
        <CardContent>
          {broadcasts.length > 0 ? (
            <div className="space-y-4">
              {broadcasts
                .filter((b: any) => b.target === "all" || b.target === "volunteers")
                .map((b: any) => (
                  <div key={b.id} className="border-b pb-3">
                    <h3 className="text-md font-semibold">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(b.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No broadcasts yet</p>
          )}
        </CardContent>
      </Card>
        <Card className="rounded-lg shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 shadow">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser?.name || user?.name || '')}&size=96&background=random`} />
                <AvatarFallback>{(profileUser?.name || user?.name || '').substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{profileUser?.name || user?.name}</h2>
              <p className="text-muted-foreground mb-2">{profileUser?.email || user?.email}</p>
              <Badge className="mb-4 capitalize px-3 py-1 text-base rounded-full">
                {profileUser?.volunteerProfile?.badge || "Newcomer"}
              </Badge>
              <div className="w-full">
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-muted-foreground">Progress to {badgeProgress.next}</span>
                  <span className="text-muted-foreground">{Math.round(badgeProgress.progress)}%</span>
                </div>
                <Progress value={badgeProgress.progress} className="h-2 rounded mb-1" />
                <p className="text-xs text-muted-foreground">
                  {profileUser?.volunteerProfile?.points || 0} / {badgeProgress.target} points
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Activity Summary</h3>
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed Tasks</span>
                <span className="font-medium">{profileUser?.volunteerProfile?.tasksCompleted || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Points Earned</span>
                <span className="font-medium">{profileUser?.volunteerProfile?.points || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Badge</span>
                <span className="font-medium capitalize">{profileUser?.volunteerProfile?.badge || "Newcomer"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Certificates</span>
                <span className="font-medium">{certificates?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Current Status</h3>
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  status === "available"
                    ? "bg-green-100 text-green-700"
                    : status === "busy"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full mr-1",
                    status === "available"
                      ? "bg-green-500"
                      : status === "busy"
                      ? "bg-yellow-500"
                      : "bg-gray-300"
                  )}
                ></span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <p className="text-xl font-bold mb-4 capitalize">{status}</p>
            <p className="text-sm text-muted-foreground mb-6">
              {status === "available"
                ? "You are visible to admin for SOS assignments"
                : status === "busy"
                  ? "You are currently on a mission"
                  : "You are not accepting new missions"}
            </p>
            <div className="mt-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-primary/10 transition-colors"
                onClick={() => setActiveTab("sos")}
              >
                View SOS alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8 rounded-lg bg-muted/50">
          <TabsTrigger value="sos">SOS Alerts</TabsTrigger>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="sos">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>SOS Alerts</CardTitle>
              <CardDescription>
                Active emergency requests that need assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">ID</th>
                      <th className="py-3 px-4 text-left font-medium">Location</th>
                      <th className="py-3 px-4 text-left font-medium">Description</th>
                      <th className="py-3 px-4 text-left font-medium">Status</th>
                      <th className="py-3 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sosAlerts && sosAlerts.length > 0 ? (
                      sosAlerts
                        .filter((alert: SosAlert) =>
                          alert.status === "new" ||
                          (alert.assignedVolunteerId === (profileUser?.id || user?.id) &&
                            ["assigned", "in-progress"].includes(alert.status))
                        )
                        .map((alert: SosAlert) => (
                          <tr
                            key={alert.id}
                            className="border-b transition-colors hover:bg-muted/25"
                          >
                            <td className="py-3 px-4 font-semibold">#{alert.id}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-red-500" />
                                <span className="text-xs text-muted-foreground">
                                  {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="truncate block max-w-[300px] text-muted-foreground">
                                {alert.description}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {alert.status === "new" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium text-xs">
                                  <AlertTriangle className="h-3 w-3" /> New
                                </span>
                              )}
                              {alert.status === "assigned" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium text-xs">
                                  <Clock className="h-3 w-3" /> Assigned
                                </span>
                              )}
                              {alert.status === "in-progress" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium text-xs">
                                  <Loader2 className="h-3 w-3 animate-spin" /> In Progress
                                </span>
                              )}
                              {alert.status === "resolved" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium text-xs">
                                  <CircleCheck className="h-3 w-3" /> Resolved
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="hover:bg-primary/10 transition-colors">View</Button>
                                {alert.status === "new" && (
                                  <Button
                                    size="sm"
                                    className="hover:bg-green-100 hover:text-green-800 transition-colors"
                                    onClick={() => handleAcceptSosAlert(alert.id)}
                                    disabled={acceptSosMutation.isPending}
                                  >
                                    {acceptSosMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : null}
                                    Accept
                                  </Button>
                                )}
                                {alert.status === "assigned" &&
                                  alert.assignedVolunteerId === (profileUser?.id || user?.id) && (
                                    <Button
                                      size="sm"
                                      className="hover:bg-yellow-100 hover:text-yellow-800 transition-colors"
                                      onClick={() => handleUpdateSosStatus(alert.id, "in-progress")}
                                      disabled={updateSosStatusMutation.isPending}
                                    >
                                      {updateSosStatusMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                      ) : null}
                                      Start
                                    </Button>
                                  )}
                                {alert.status === "in-progress" &&
                                  alert.assignedVolunteerId === (profileUser?.id || user?.id) && (
                                    <Button
                                      size="sm"
                                      className="hover:bg-green-100 hover:text-green-800 transition-colors"
                                      onClick={() => handleUpdateSosStatus(alert.id, "resolved")}
                                      disabled={updateSosStatusMutation.isPending}
                                    >
                                      {updateSosStatusMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                      ) : null}
                                      Complete
                                    </Button>
                                  )}
                              </div>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-muted-foreground">
                          No active SOS alerts at the moment
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>
                History of completed missions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">SOS ID</th>
                      <th className="py-3 px-4 text-left font-medium">Completed</th>
                      <th className="py-3 px-4 text-left font-medium">Points</th>
                      <th className="py-3 px-4 text-left font-medium">Notes</th>
                      <th className="py-3 px-4 text-left font-medium">Proof</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks && tasks.length > 0 ? (
                      tasks.map((task: any) => (
                        <tr key={task.id} className="border-b transition-colors hover:bg-muted/25">
                          <td className="py-3 px-4 font-semibold">#{task.sosAlertId}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(task.completedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                              <span>+{task.pointsAwarded}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="truncate block max-w-[300px] text-muted-foreground">
                              {task.notes || "No notes provided"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {task.proofImageUrl ? (
                              <Button variant="outline" size="sm" className="hover:bg-primary/10 transition-colors">View Proof</Button>
                            ) : (
                              <span className="text-muted-foreground">No proof uploaded</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-muted-foreground">
                          You haven't completed any tasks yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
              <CardDescription>
                Recognition of your commitment and service
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certificates && certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((cert: any) => (
                    <Card
                      key={cert.id}
                      className="overflow-hidden rounded-lg shadow-sm border transition-shadow hover:shadow-md"
                    >
                      <div className="bg-primary h-2" />
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">Certificate of Excellence</h3>
                            <p className="text-xs text-muted-foreground">
                              Issued on {new Date(cert.issuedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <ShieldAlert className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm mb-4 text-muted-foreground">
                          This certifies that{" "}
                          <span className="font-medium text-foreground">
                            {profileUser?.name || user?.name}
                          </span>{" "}
                          has successfully completed 10 rescue missions with excellence and dedication.
                        </p>
                        <div className="flex justify-between gap-2">
                          <Button variant="outline" size="sm" className="hover:bg-primary/10 transition-colors">
                            View PDF
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-primary/10 transition-colors">
                            Verify QR
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Complete 10 rescue missions to earn your first certificate. Certificates
                    recognize your dedication and can be shared with others.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}