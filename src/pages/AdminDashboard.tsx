import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Shield, AlertTriangle, CheckCircle, XCircle, Eye, Search,
  Heart, MessageSquare, Bell, FileText, Trash2, UserCheck, UserX,
  BarChart3, Ban, Crown, RefreshCw, ChevronDown, ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [profiles, setProfiles] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, reports: 0, matches: 0, posts: 0, blocks: 0, likes: 0, messages: 0 });

  useEffect(() => { checkAdminAccess(); }, [user]);

  useEffect(() => {
    if (isAdmin) loadAllData();
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error || !data) {
        toast({ title: "Access Denied", description: "You don't have admin access.", variant: "destructive" });
        navigate('/');
        return;
      }
      setIsAdmin(true);
    } catch { navigate('/'); }
    finally { setLoading(false); }
  };

  const loadAllData = async () => {
    await Promise.all([
      loadProfiles(), loadReports(), loadPosts(),
      loadMatches(), loadBlocks(), loadLikes(),
      loadUserRoles(), loadStats(),
    ]);
  };

  const loadProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setProfiles(data || []);
  };

  const loadReports = async () => {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    setReports(data || []);
  };

  const loadPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(100);
    setPosts(data || []);
  };

  const loadMatches = async () => {
    const { data } = await supabase.from('matches').select('*').order('created_at', { ascending: false }).limit(100);
    setMatches(data || []);
  };

  const loadBlocks = async () => {
    const { data } = await supabase.from('blocks').select('*').order('created_at', { ascending: false });
    setBlocks(data || []);
  };

  const loadLikes = async () => {
    const { data } = await supabase.from('likes').select('*').order('created_at', { ascending: false }).limit(200);
    setLikes(data || []);
  };

  const loadUserRoles = async () => {
    const { data } = await supabase.from('user_roles').select('*');
    setUserRoles(data || []);
  };

  const loadStats = async () => {
    const [p, r, m, po, b, l, msg] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('blocks').select('*', { count: 'exact', head: true }),
      supabase.from('likes').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
    ]);
    setStats({
      users: p.count || 0, reports: r.count || 0, matches: m.count || 0,
      posts: po.count || 0, blocks: b.count || 0, likes: l.count || 0, messages: msg.count || 0,
    });
  };

  // ── Actions ──
  const handleVerifyUser = async (userId: string, verified: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_verified: verified }).eq('user_id', userId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: verified ? "User Verified" : "Verification Removed" });
    loadProfiles();
  };

  const handleTogglePremium = async (userId: string, premium: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_premium: premium }).eq('user_id', userId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: premium ? "Premium Enabled" : "Premium Removed" });
    loadProfiles();
  };

  const handleReportAction = async (reportId: string, status: 'pending' | 'reviewed' | 'resolved' | 'dismissed') => {
    const { error } = await supabase.from('reports').update({ status }).eq('id', reportId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Report ${status}` });
    loadReports();
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post permanently?")) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Post deleted" });
    loadPosts();
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Delete this match? Messages will remain.")) return;
    const { error } = await supabase.from('matches').delete().eq('id', matchId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Match deleted" });
    loadMatches();
  };

  const handleRemoveBlock = async (blockId: string) => {
    const { error } = await supabase.from('blocks').delete().eq('id', blockId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Block removed" });
    loadBlocks();
  };

  const handleSetRole = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    // Check existing role
    const existing = userRoles.find(r => r.user_id === userId);
    if (existing) {
      if (role === 'user') {
        await supabase.from('user_roles').delete().eq('id', existing.id);
      } else {
        await supabase.from('user_roles').update({ role }).eq('id', existing.id);
      }
    } else if (role !== 'user') {
      await supabase.from('user_roles').insert({ user_id: userId, role });
    }
    toast({ title: `Role updated to ${role}` });
    loadUserRoles();
  };

  const getProfileName = (userId: string) => {
    const p = profiles.find(p => p.user_id === userId);
    return p?.display_name || userId.slice(0, 8);
  };

  const getUserRole = (userId: string) => {
    return userRoles.find(r => r.user_id === userId)?.role || 'user';
  };

  const filteredProfiles = profiles.filter(p =>
    !searchQuery || p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user_id.includes(searchQuery)
  );

  const filteredReports = reports.filter(r =>
    !searchQuery || r.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reporter_id.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Full control over your application</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadAllData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {[
            { label: 'Users', value: stats.users, icon: Users, color: 'text-blue-600' },
            { label: 'Matches', value: stats.matches, icon: Heart, color: 'text-pink-600' },
            { label: 'Likes', value: stats.likes, icon: Heart, color: 'text-red-500' },
            { label: 'Messages', value: stats.messages, icon: MessageSquare, color: 'text-green-600' },
            { label: 'Posts', value: stats.posts, icon: FileText, color: 'text-purple-600' },
            { label: 'Reports', value: stats.reports, icon: AlertTriangle, color: 'text-amber-600' },
            { label: 'Blocks', value: stats.blocks, icon: Ban, color: 'text-red-600' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-3 text-center">
                <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users, reports, IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="users">Users ({stats.users})</TabsTrigger>
            <TabsTrigger value="reports">Reports ({stats.reports})</TabsTrigger>
            <TabsTrigger value="posts">Posts ({stats.posts})</TabsTrigger>
            <TabsTrigger value="matches">Matches ({stats.matches})</TabsTrigger>
            <TabsTrigger value="blocks">Blocks ({stats.blocks})</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>

          {/* ── Users Tab ── */}
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.map((p) => (
                        <TableRow key={p.user_id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={p.photos?.[0]} />
                                <AvatarFallback>{(p.display_name || '?')[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{p.display_name || 'No name'}</p>
                                <p className="text-xs text-muted-foreground">{p.user_id.slice(0, 8)}…</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{p.age || '–'}</TableCell>
                          <TableCell className="text-sm">{p.location || '–'}</TableCell>
                          <TableCell>
                            <Switch checked={p.is_verified || false} onCheckedChange={(v) => handleVerifyUser(p.user_id, v)} />
                          </TableCell>
                          <TableCell>
                            <Switch checked={p.is_premium || false} onCheckedChange={(v) => handleTogglePremium(p.user_id, v)} />
                          </TableCell>
                          <TableCell>
                            <Select value={getUserRole(p.user_id)} onValueChange={(v) => handleSetRole(p.user_id, v as any)}>
                              <SelectTrigger className="w-28 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {p.last_active ? new Date(p.last_active).toLocaleDateString() : '–'}
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader><DialogTitle>User Profile</DialogTitle></DialogHeader>
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16">
                                      <AvatarImage src={p.photos?.[0]} />
                                      <AvatarFallback>{(p.display_name || '?')[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="font-bold text-lg">{p.display_name}</h3>
                                      <p className="text-sm text-muted-foreground">{p.gender}, Age {p.age} • {p.location}</p>
                                      <div className="flex gap-2 mt-1">
                                        {p.is_verified && <Badge className="bg-blue-100 text-blue-800 text-xs">Verified</Badge>}
                                        {p.is_premium && <Badge className="bg-amber-100 text-amber-800 text-xs">Premium</Badge>}
                                        <Badge variant="outline" className="text-xs">{getUserRole(p.user_id)}</Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><span className="text-muted-foreground">Bio:</span> {p.bio || '–'}</div>
                                    <div><span className="text-muted-foreground">Looking for:</span> {p.looking_for || '–'}</div>
                                    <div><span className="text-muted-foreground">Education:</span> {p.education || '–'}</div>
                                    <div><span className="text-muted-foreground">Occupation:</span> {p.occupation || '–'}</div>
                                    <div><span className="text-muted-foreground">Religion:</span> {p.religion || '–'}</div>
                                    <div><span className="text-muted-foreground">Height:</span> {p.height || '–'}</div>
                                    <div><span className="text-muted-foreground">Smoking:</span> {p.smoking || '–'}</div>
                                    <div><span className="text-muted-foreground">Drinking:</span> {p.drinking || '–'}</div>
                                  </div>
                                  {p.interests?.length > 0 && (
                                    <div>
                                      <span className="text-sm text-muted-foreground">Interests:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {p.interests.map((i: string) => <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>)}
                                      </div>
                                    </div>
                                  )}
                                  {p.photos?.length > 0 && (
                                    <div>
                                      <span className="text-sm text-muted-foreground">Photos ({p.photos.length}):</span>
                                      <div className="flex gap-2 mt-1 overflow-x-auto">
                                        {p.photos.map((url: string, i: number) => (
                                          <img key={i} src={url} className="w-20 h-20 rounded-lg object-cover" />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    ID: {p.user_id} • Joined: {new Date(p.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredProfiles.length === 0 && (
                        <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Reports Tab ── */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Reports ({reports.filter(r => r.status === 'pending').length} pending)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Reported User</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-sm">{getProfileName(r.reporter_id)}</TableCell>
                          <TableCell className="text-sm">{getProfileName(r.reported_user_id)}</TableCell>
                          <TableCell><Badge variant="outline">{r.reason}</Badge></TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">{r.details || '–'}</TableCell>
                          <TableCell>
                            <Badge className={
                              r.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              r.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                              r.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-muted text-muted-foreground'
                            }>{r.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {r.status === 'pending' && (
                                <>
                                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleReportAction(r.id, 'reviewed')}>Review</Button>
                                  <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleReportAction(r.id, 'resolved')}>
                                    <CheckCircle className="w-3 h-3 mr-1" />Resolve
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleReportAction(r.id, 'dismissed')}>Dismiss</Button>
                                </>
                              )}
                              {r.status !== 'pending' && (
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleReportAction(r.id, 'pending')}>Reopen</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {reports.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />No reports yet
                        </TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Posts Tab ── */}
          <TabsContent value="posts">
            <Card>
              <CardHeader><CardTitle>Content Moderation ({stats.posts} posts)</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Author</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Likes</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-sm">{getProfileName(p.author_id)}</TableCell>
                          <TableCell className="text-sm max-w-[300px]">
                            <p className="truncate">{p.content}</p>
                            {p.image_url && <Badge variant="secondary" className="text-xs mt-1">Has Image</Badge>}
                          </TableCell>
                          <TableCell>{p.likes_count || 0}</TableCell>
                          <TableCell>{p.comments_count || 0}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleDeletePost(p.id)}>
                              <Trash2 className="w-3 h-3 mr-1" />Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {posts.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No posts</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Matches Tab ── */}
          <TabsContent value="matches">
            <Card>
              <CardHeader><CardTitle>Matches ({stats.matches})</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User 1</TableHead>
                        <TableHead>User 2</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Matched At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matches.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="text-sm">{getProfileName(m.user1_id)}</TableCell>
                          <TableCell className="text-sm">{getProfileName(m.user2_id)}</TableCell>
                          <TableCell><Badge variant="outline">{m.status}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {m.matched_at ? new Date(m.matched_at).toLocaleDateString() : '–'}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleDeleteMatch(m.id)}>
                              <Trash2 className="w-3 h-3 mr-1" />Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {matches.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No matches</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Blocks Tab ── */}
          <TabsContent value="blocks">
            <Card>
              <CardHeader><CardTitle>Blocks ({stats.blocks})</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Blocker</TableHead>
                        <TableHead>Blocked</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blocks.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="text-sm">{getProfileName(b.blocker_id)}</TableCell>
                          <TableCell className="text-sm">{getProfileName(b.blocked_id)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleRemoveBlock(b.id)}>
                              Remove Block
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {blocks.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No blocks</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Roles Tab ── */}
          <TabsContent value="roles">
            <Card>
              <CardHeader><CardTitle>User Roles & Permissions</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userRoles.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={profiles.find(p => p.user_id === r.user_id)?.photos?.[0]} />
                                <AvatarFallback>{getProfileName(r.user_id)[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{getProfileName(r.user_id)}</p>
                                <p className="text-xs text-muted-foreground">{r.user_id.slice(0, 8)}…</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              r.role === 'admin' ? 'bg-red-100 text-red-800' :
                              r.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                              'bg-muted text-muted-foreground'
                            }>{r.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Select value={r.role} onValueChange={(v) => handleSetRole(r.user_id, v as any)}>
                              <SelectTrigger className="w-28 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Remove Role</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                      {userRoles.length === 0 && (
                        <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No special roles assigned</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
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
