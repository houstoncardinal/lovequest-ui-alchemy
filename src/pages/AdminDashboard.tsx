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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    age?: number;
    location?: string;
    bio?: string;
    avatar_url?: string;
    verification_level?: string;
    can_access_app?: boolean;
    last_active?: string;
  };
}

interface VerificationRequest {
  id: string;
  user_id: string;
  verification_type: string;
  status: string;
  id_document_url?: string;
  face_photo_url?: string;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface ReportedContent {
  id: string;
  type: 'post' | 'user' | 'message';
  reported_by: string;
  reported_user: string;
  content_id: string;
  reason: string;
  status: string;
  created_at: string;
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
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
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
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          first_name,
          last_name,
          display_name,
          age,
          location,
          bio,
          avatar_url,
          verification_level,
          can_access_app,
          last_active,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match User interface
      const usersData = data.map(profile => ({
        id: profile.user_id,
        email: '', // We'll need to fetch this separately if needed
        created_at: profile.created_at,
        profile: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          display_name: profile.display_name,
          age: profile.age,
          location: profile.location,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          verification_level: profile.verification_level,
          can_access_app: profile.can_access_app,
          last_active: profile.last_active,
        }
      }));

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
      // First get verification requests
      const { data: requests, error: requestsError } = await supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Then get profiles for each request
      const requestsWithProfiles = await Promise.all(
        (requests || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, display_name, avatar_url')
            .eq('user_id', request.user_id)
            .single();

          return {
            ...request,
            profiles: profile
          };
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
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      
      const { error: updateError } = await supabase
        .from('verification_requests')
        .update({
          status,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, update user profile to allow app access
      if (action === 'approve') {
        const request = verificationRequests.find(r => r.id === requestId);
        if (request) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              can_access_app: true,
              verification_level: 'verified',
              is_verified: true
            })
            .eq('user_id', request.user_id);

          if (profileError) throw profileError;
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
      const { error } = await supabase
        .from('profiles')
        .update({
          can_access_app: action === 'enable'
        })
        .eq('user_id', userId);

      if (error) throw error;

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
      user.profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.profile?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.profile?.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = statusFilter === 'all' || 
      (statusFilter === 'verified' && user.profile?.can_access_app) ||
      (statusFilter === 'pending' && !user.profile?.can_access_app);
    
    return matchesSearch && matchesFilter;
  });

  const filteredVerifications = verificationRequests.filter(req => {
    const matchesSearch = !searchQuery || 
      req.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
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
                    {users.filter(u => u.profile?.can_access_app).length}
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
                          <AvatarImage src={user.profile?.avatar_url} />
                          <AvatarFallback>
                            {user.profile?.first_name?.[0]}{user.profile?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {user.profile?.display_name || `${user.profile?.first_name} ${user.profile?.last_name}`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Age: {user.profile?.age} • {user.profile?.location}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={user.profile?.can_access_app ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                              {user.profile?.can_access_app ? 'Verified' : 'Pending'}
                            </Badge>
                            {user.profile?.last_active && (
                              <span className="text-xs text-gray-500">
                                Last active: {new Date(user.profile.last_active).toLocaleDateString()}
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
                                  <AvatarImage src={user.profile?.avatar_url} />
                                  <AvatarFallback>
                                    {user.profile?.first_name?.[0]}{user.profile?.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">{user.profile?.display_name}</h3>
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
                                  onClick={() => handleUserAction(user.id, user.profile?.can_access_app ? 'disable' : 'enable')}
                                  variant={user.profile?.can_access_app ? 'destructive' : 'default'}
                                  className="flex-1"
                                >
                                  {user.profile?.can_access_app ? 'Disable User' : 'Enable User'}
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
                          <AvatarImage src={request.profiles?.avatar_url} />
                          <AvatarFallback>
                            {request.profiles?.first_name?.[0]}{request.profiles?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{request.profiles?.display_name}</h3>
                          <p className="text-sm text-gray-600">
                            {request.verification_type} verification
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusBadge(request.status)}>
                              {request.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(request.created_at).toLocaleDateString()}
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
                                  <AvatarImage src={request.profiles?.avatar_url} />
                                  <AvatarFallback>
                                    {request.profiles?.first_name?.[0]}{request.profiles?.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">{request.profiles?.display_name}</h3>
                                  <Badge className={getStatusBadge(request.status)}>
                                    {request.status}
                                  </Badge>
                                </div>
                              </div>

                              {/* Document Images */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {request.id_document_url && (
                                  <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                      <FileText className="w-4 h-4" />
                                      ID Document
                                    </h4>
                                    <img
                                      src={`${supabase.storage.from('verification-documents').getPublicUrl(request.id_document_url).data.publicUrl}`}
                                      alt="ID Document"
                                      className="w-full h-48 object-cover rounded-lg border"
                                    />
                                  </div>
                                )}
                                {request.face_photo_url && (
                                  <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                      <Camera className="w-4 h-4" />
                                      Face Photo
                                    </h4>
                                    <img
                                      src={`${supabase.storage.from('verification-documents').getPublicUrl(request.face_photo_url).data.publicUrl}`}
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

                              {request.admin_notes && (
                                <div>
                                  <h4 className="font-medium mb-2">Admin Notes</h4>
                                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                                    {request.admin_notes}
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