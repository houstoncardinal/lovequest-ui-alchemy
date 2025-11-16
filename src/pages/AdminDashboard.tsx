// ✅ MIGRATED TO FIREBASE - Terminal 3 - 2025-01-15
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  MessageSquare,
  Heart,
  Calendar,
  MapPin,
  Camera,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, where, getDocs, updateDoc, doc, getDoc, orderBy as firestoreOrderBy } from '@/integrations/firebase';
import { getUserProfile } from '@/lib/firestore/users';
import { useToast } from '@/hooks/use-toast';
import QuickReview from '@/components/QuickReview';

interface User {
  id: string;
  email: string;
  createdAt: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    age?: number;
    location?: string;
    bio?: string;
    photoURL?: string;
    verificationLevel?: string;
    canAccessApp?: boolean;
    lastActive?: string;
  };
}

interface VerificationRequest {
  id: string;
  userId: string;
  verificationType: string;
  status: string;
  idDocumentUrl?: string;
  facePhotoUrl?: string;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  profiles?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    photoURL?: string;
  };
}

interface ReportedContent {
  id: string;
  type: 'post' | 'user' | 'message';
  reportedBy: string;
  reportedUser: string;
  contentId: string;
  reason: string;
  status: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [reportedContent, setReportedContent] = useState<ReportedContent[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [showQuickReview, setShowQuickReview] = useState(false);

  // Check admin access
  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  // Load data
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadVerificationRequests();
      loadReportedContent();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Check if user is admin in Firebase
      const adminDocRef = doc(db, 'adminUsers', user.uid);
      const adminDoc = await getDoc(adminDocRef);

      if (!adminDoc.exists()) {
        toast({
          title: "Access Denied",
          description: "You don't have admin access to this dashboard.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Admin check error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Get all users from Firebase
      const usersQuery = query(
        collection(db, 'users'),
        firestoreOrderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email || '',
          createdAt: data.createdAt || new Date().toISOString(),
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
            displayName: data.displayName,
            age: data.age,
            location: data.location,
            bio: data.bio,
            photoURL: data.photoURL,
            verificationLevel: data.verificationLevel,
            canAccessApp: data.canAccessApp,
            lastActive: data.lastActive,
          }
        } as User;
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Load users error:', error);
      toast({
        title: "Load Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    }
  };

  const loadVerificationRequests = async () => {
    try {
      // Get verification requests from Firebase
      const requestsQuery = query(
        collection(db, 'verificationRequests'),
        firestoreOrderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(requestsQuery);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VerificationRequest[];

      // Get profiles for each request
      const requestsWithProfiles = await Promise.all(
        requests.map(async (request) => {
          try {
            const profile = await getUserProfile(request.userId);
            return {
              ...request,
              profiles: profile ? {
                firstName: profile.firstName,
                lastName: profile.lastName,
                displayName: profile.displayName,
                photoURL: profile.photoURL
              } : undefined
            };
          } catch (error) {
            console.error(`Error loading profile for user ${request.userId}:`, error);
            return request;
          }
        })
      );

      setVerificationRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Load verification requests error:', error);
      toast({
        title: "Load Error",
        description: "Failed to load verification requests.",
        variant: "destructive",
      });
    }
  };

  const loadReportedContent = async () => {
    // This would need to be implemented based on your reporting system
    // For now, we'll use mock data
    setReportedContent([]);
  };

  const handleVerificationAction = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    if (!user) return;

    try {
      const status = action === 'approve' ? 'approved' : 'rejected';

      // Update verification request in Firebase
      await updateDoc(doc(db, 'verificationRequests', requestId), {
        status,
        adminNotes: notes || null,
        reviewedAt: new Date().toISOString(),
        reviewedBy: user.uid,
        updatedAt: new Date().toISOString()
      });

      // If approved, update user profile to allow app access
      if (action === 'approve') {
        const request = verificationRequests.find(r => r.id === requestId);
        if (request) {
          await updateDoc(doc(db, 'users', request.userId), {
            canAccessApp: true,
            verificationLevel: 'verified',
            isVerified: true,
            updatedAt: new Date().toISOString()
          });
        }
      }

      toast({
        title: `Verification ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The verification request has been ${action}d.`,
      });

      loadVerificationRequests();
      loadUsers();
      setSelectedVerification(null);
    } catch (error) {
      console.error('Verification action error:', error);
      toast({
        title: "Action Failed",
        description: "Failed to update verification status.",
        variant: "destructive",
      });
    }
  };

  const handleUserAction = async (userId: string, action: 'enable' | 'disable') => {
    try {
      // Update user in Firebase
      await updateDoc(doc(db, 'users', userId), {
        canAccessApp: action === 'enable',
        updatedAt: new Date().toISOString()
      });

      toast({
        title: `User ${action === 'enable' ? 'Enabled' : 'Disabled'}`,
        description: `The user has been ${action}d.`,
      });

      loadUsers();
    } catch (error) {
      console.error('User action error:', error);
      toast({
        title: "Action Failed",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery ||
      user.profile?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.profile?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.profile?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = statusFilter === 'all' ||
      (statusFilter === 'verified' && user.profile?.canAccessApp) ||
      (statusFilter === 'pending' && !user.profile?.canAccessApp);

    return matchesSearch && matchesFilter;
  });

  const filteredVerifications = verificationRequests.filter(req => {
    const matchesSearch = !searchQuery ||
      req.profiles?.displayName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = statusFilter === 'all' || req.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (showQuickReview) {
    return <QuickReview onBack={() => setShowQuickReview(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, verifications, and content moderation</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.profile?.canAccessApp).length}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {verificationRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{reportedContent.length}</p>
                </div>
                <Shield className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <CardTitle>User Management</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={user.profile?.photoURL} />
                          <AvatarFallback>
                            {user.profile?.firstName?.[0]}{user.profile?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {user.profile?.displayName || `${user.profile?.firstName} ${user.profile?.lastName}`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Age: {user.profile?.age} • {user.profile?.location}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={user.profile?.canAccessApp ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                              {user.profile?.canAccessApp ? 'Verified' : 'Pending'}
                            </Badge>
                            {user.profile?.lastActive && (
                              <span className="text-xs text-gray-500">
                                Last active: {new Date(user.profile.lastActive).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                  <AvatarImage src={user.profile?.photoURL} />
                                  <AvatarFallback>
                                    {user.profile?.firstName?.[0]}{user.profile?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">{user.profile?.displayName}</h3>
                                  <p className="text-sm text-gray-600">Age: {user.profile?.age}</p>
                                </div>
                              </div>
                              {user.profile?.bio && (
                                <div>
                                  <h4 className="font-medium mb-1">Bio</h4>
                                  <p className="text-sm text-gray-600">{user.profile.bio}</p>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleUserAction(user.id, user.profile?.canAccessApp ? 'disable' : 'enable')}
                                  variant={user.profile?.canAccessApp ? 'destructive' : 'default'}
                                  className="flex-1"
                                >
                                  {user.profile?.canAccessApp ? 'Disable User' : 'Enable User'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verifications Tab */}
          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <CardTitle>Verification Requests</CardTitle>
                  <div className="flex gap-2">
                    {verificationRequests.filter(r => r.status === 'pending').length > 0 && (
                      <Button
                        onClick={() => setShowQuickReview(true)}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Quick Review ({verificationRequests.filter(r => r.status === 'pending').length})
                      </Button>
                    )}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search verifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredVerifications.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={request.profiles?.photoURL} />
                          <AvatarFallback>
                            {request.profiles?.firstName?.[0]}{request.profiles?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{request.profiles?.displayName}</h3>
                          <p className="text-sm text-gray-600">
                            {request.verificationType} verification
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusBadge(request.status)}>
                              {request.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedVerification(request)}>
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Verification Review</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                  <AvatarImage src={request.profiles?.photoURL} />
                                  <AvatarFallback>
                                    {request.profiles?.firstName?.[0]}{request.profiles?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">{request.profiles?.displayName}</h3>
                                  <Badge className={getStatusBadge(request.status)}>
                                    {request.status}
                                  </Badge>
                                </div>
                              </div>

                              {/* Document Images */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {request.idDocumentUrl && (
                                  <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                      <FileText className="w-4 h-4" />
                                      ID Document
                                    </h4>
                                    <img
                                      src={request.idDocumentUrl}
                                      alt="ID Document"
                                      className="w-full h-48 object-cover rounded-lg border"
                                    />
                                  </div>
                                )}
                                {request.facePhotoUrl && (
                                  <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                      <Camera className="w-4 h-4" />
                                      Face Photo
                                    </h4>
                                    <img
                                      src={request.facePhotoUrl}
                                      alt="Face Photo"
                                      className="w-full h-48 object-cover rounded-lg border"
                                    />
                                  </div>
                                )}
                              </div>

                              {request.notes && (
                                <div>
                                  <h4 className="font-medium mb-2">User Notes</h4>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {request.notes}
                                  </p>
                                </div>
                              )}

                              {request.status === 'pending' && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="admin-notes">Admin Notes (optional)</Label>
                                    <Textarea
                                      id="admin-notes"
                                      placeholder="Add notes about this verification..."
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => {
                                        const notes = (document.getElementById('admin-notes') as HTMLTextAreaElement)?.value;
                                        handleVerificationAction(request.id, 'approve', notes);
                                      }}
                                      className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        const notes = (document.getElementById('admin-notes') as HTMLTextAreaElement)?.value;
                                        handleVerificationAction(request.id, 'reject', notes);
                                      }}
                                      variant="destructive"
                                      className="flex-1"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {request.adminNotes && (
                                <div>
                                  <h4 className="font-medium mb-2">Admin Notes</h4>
                                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                                    {request.adminNotes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reported Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
                  <p className="text-gray-600">
                    When users report content or other users, they'll appear here for review.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;