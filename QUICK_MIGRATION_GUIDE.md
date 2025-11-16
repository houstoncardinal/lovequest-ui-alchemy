# Quick Migration Guide for Remaining Pages

## Pattern: Supabase → Firebase

### Import Changes

**BEFORE (Supabase):**
```typescript
import { supabase } from "@/integrations/supabase/client";
```

**AFTER (Firebase):**
```typescript
import { db, collection, query, where, getDocs, addDoc, updateDoc, doc } from "@/integrations/firebase";
import { getUserProfile, updateUserProfile } from "@/lib/firestore/users";
import { createLike, getUserMatches } from "@/lib/firestore/matches";
import { sendMessage, subscribeToMessages } from "@/lib/firestore/messages";
```

### Common Patterns

#### 1. Auth User ID
**BEFORE:**
```typescript
user.id
```

**AFTER:**
```typescript
user.uid
```

#### 2. Fetch Data
**BEFORE:**
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId)
  .single();
```

**AFTER:**
```typescript
const profile = await getUserProfile(userId);
// OR
const docSnap = await getDoc(doc(db, 'users', userId));
const data = docSnap.data();
```

#### 3. Create/Insert
**BEFORE:**
```typescript
const { error } = await supabase
  .from('user_likes')
  .insert({ liker_id: userId, liked_id: likedId });
```

**AFTER:**
```typescript
await createLike(userId, likedId);
// OR
await addDoc(collection(db, 'likes'), { likerId: userId, likedId: likedId });
```

#### 4. Update
**BEFORE:**
```typescript
await supabase
  .from('profiles')
  .update({ bio: 'New bio' })
  .eq('user_id', userId);
```

**AFTER:**
```typescript
await updateUserProfile(userId, { bio: 'New bio' });
// OR
await updateDoc(doc(db, 'users', userId), { bio: 'New bio' });
```

#### 5. Real-time Subscriptions
**BEFORE:**
```typescript
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, handler)
  .subscribe();
```

**AFTER:**
```typescript
const unsubscribe = subscribeToMessages(matchId, (messages) => {
  // Handle messages
});

// Cleanup
return () => unsubscribe();
```

#### 6. Query with Filters
**BEFORE:**
```typescript
const { data } = await supabase
  .from('matches')
  .select('*')
  .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
  .eq('status', 'active')
  .order('matched_at', { ascending: false });
```

**AFTER:**
```typescript
const matches = await getUserMatches(userId);
// Helper handles the complex OR query
```

#### 7. RPC Functions
**BEFORE:**
```typescript
const { data } = await supabase.rpc('get_match_recommendations', {
  target_user_id: userId,
  limit: 10
});
```

**AFTER:**
```typescript
// Implement in Cloud Function and call via HTTPS
const getMatchRecommendations = httpsCallable(functions, 'getMatchRecommendations');
const result = await getMatchRecommendations({ userId, limit: 10 });
```

## File-by-File Migration Checklist

### Critical Pages (Do First)
- [ ] Home.tsx - Discovery/swipe
- [ ] Matches.tsx - Matched users
- [ ] Messages.tsx - Conversation list
- [ ] MessagingInterface.tsx - Chat UI
- [ ] EditProfile.tsx - Profile editing
- [ ] ProfileDetail.tsx - View profile

### Secondary Pages
- [ ] ForYou.tsx - Recommendations
- [ ] Community.tsx - Community feed
- [ ] Onboarding.tsx - New user onboarding
- [ ] ManagePhotos.tsx - Photo management

### Admin/Advanced
- [ ] AdminDashboard.tsx
- [ ] Verification.tsx
- [ ] AdvancedSearch.tsx

### Hooks
- [ ] useRealTimeMessages.tsx
- [ ] useRealTimeMatches.tsx
- [ ] useNotificationCounts.tsx

---

**Migration Speed:** ~10-15 minutes per file with helpers
**Total Estimated Time:** 6-8 hours for all 38 files
