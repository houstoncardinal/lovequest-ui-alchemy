# LoveQuest Firestore Schema Design
## Migration from Supabase PostgreSQL to Firebase Firestore

**Date:** January 2025
**Status:** Design Phase
**Source:** 26 Supabase tables → Firestore collections

---

## Core Principles

### NoSQL Design Patterns
1. **Denormalization**: Store redundant data for faster reads
2. **Subcollections**: Use for one-to-many relationships
3. **Flat Structure**: Avoid deep nesting (max 100 subcollection levels)
4. **Document Size**: Keep under 1MB limit
5. **Query Optimization**: Design for common query patterns

### Key Differences from PostgreSQL
- ❌ No JOINs → Use denormalization or multiple queries
- ❌ No complex queries → Pre-compute and store results
- ✅ Real-time listeners built-in
- ✅ Automatic scaling
- ✅ Better mobile offline support

---

## Collection Structure

### 1. `users/{userId}`
**Source**: `profiles` table (PostgreSQL)
**Purpose**: Main user profile data

```typescript
interface UserDocument {
  // Auth-synced fields (from Firebase Auth)
  uid: string;                    // Same as document ID
  email: string;
  displayName: string;
  photoURL: string | null;

  // Basic Profile
  firstName: string;
  lastName: string;
  dateOfBirth: Timestamp;
  age: number;                    // Calculated field
  gender: 'male' | 'female' | 'other';
  bio: string;
  location: string;

  // Geolocation
  geolocation: {
    latitude: number;
    longitude: number;
    geohash: string;              // For geoqueries
  };

  // Islamic Profile
  religionLevel: 'very_religious' | 'moderately_religious' | 'somewhat_religious' | 'not_religious';
  prayerFrequency: 'five_times' | 'regularly' | 'sometimes' | 'rarely' | 'never';
  madhab: 'hanafi' | 'maliki' | 'shafi' | 'hanbali' | 'no_preference';
  hijabStatus?: 'yes' | 'no' | 'sometimes';  // For females
  hajjUmrahExperience: 'hajj' | 'umrah' | 'both' | 'none' | 'planning';
  islamicKnowledgeLevel: 'scholar' | 'advanced' | 'intermediate' | 'beginner';
  readQuran: 'fluently' | 'with_difficulty' | 'learning' | 'cannot_read';

  // Lifestyle
  educationLevel: 'high_school' | 'bachelors' | 'masters' | 'phd' | 'other';
  careerField: string;
  incomeRange: string;
  smokingStatus: 'yes' | 'no' | 'occasionally';
  exerciseFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';
  dietPreferences: string[];

  // Family & Marriage
  maritalStatus: 'never_married' | 'divorced' | 'widowed';
  hasChildren: boolean;
  wantsChildren: boolean;
  childrenPreference: 'yes' | 'no' | 'open' | 'not_sure';
  familySizePreference: 'small' | 'medium' | 'large';

  // Verification
  isVerified: boolean;
  verificationLevel: 'none' | 'email' | 'phone' | 'id' | 'full';
  verificationRequired: boolean;
  canAccessApp: boolean;

  // Preferences Snapshot (denormalized from userPreferences)
  ageRangeMin: number;
  ageRangeMax: number;
  maxDistanceKm: number;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActive: Timestamp;
  profileCompleteness: number;    // Percentage (0-100)

  // Premium
  isPremium: boolean;
  premiumTier: 'free' | 'basic' | 'premium' | 'elite';
}
```

**Subcollections**:
- `users/{userId}/photos/{photoId}`
- `users/{userId}/settings/{settingType}`
- `users/{userId}/preferences/{preferenceType}`
- `users/{userId}/blockedUsers/{blockedUserId}`

---

### 2. `users/{userId}/photos/{photoId}`
**Source**: `photo_uploads` table
**Purpose**: User profile photos

```typescript
interface PhotoDocument {
  id: string;
  userId: string;                 // Denormalized for queries
  fileUrl: string;
  storagePath: string;            // Firebase Storage path
  fileSize: number;
  fileType: string;
  isPrimary: boolean;
  isVerified: boolean;
  uploadStatus: 'pending' | 'processing' | 'approved' | 'rejected';
  uploadedAt: Timestamp;
  verifiedAt: Timestamp | null;
  rejectionReason: string | null;
}
```

---

### 3. `users/{userId}/settings/{settingType}`
**Source**: `user_settings` + `notification_preferences`
**Purpose**: User app settings (document per setting category)

**Documents**: `general`, `notifications`, `privacy`

```typescript
interface GeneralSettings {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  unitsSystem: 'metric' | 'imperial';
}

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  newMatches: boolean;
  newMessages: boolean;
  newLikes: boolean;
  matchExpiring: boolean;
  communityPosts: boolean;
  marketing: boolean;
}

interface PrivacySettings {
  showActiveStatus: boolean;
  incognitoMode: boolean;
  showDistance: boolean;
  showAge: boolean;
  allowMessagesFrom: 'matches_only' | 'everyone';
}
```

---

### 4. `users/{userId}/preferences/{preferenceType}`
**Source**: `user_preferences`
**Purpose**: Match preferences

**Documents**: `search`, `dealBreakers`

```typescript
interface SearchPreferences {
  ageRangeMin: number;
  ageRangeMax: number;
  maxDistanceKm: number;
  showMe: 'men' | 'women' | 'everyone';
  lookingFor: 'marriage' | 'friendship' | 'networking';
  religionLevelPreference: string[];
  prayerFreference: string[];
  madhabPreference: string[];
  educationPreference: string[];
}

interface DealBreakers {
  smoking: boolean;
  children: boolean;
  religiousLevel: string[];
  // ... other deal breakers
}
```

---

### 5. `matches/{matchId}`
**Source**: `matches` table
**Purpose**: Mutual matches between users

```typescript
interface MatchDocument {
  id: string;
  user1Id: string;
  user2Id: string;

  // Denormalized user data for quick access
  user1: {
    displayName: string;
    photoURL: string;
    age: number;
  };
  user2: {
    displayName: string;
    photoURL: string;
    age: number;
  };

  // Match metadata
  matchedAt: Timestamp;
  compatibilityScore: number;     // Denormalized from insights

  // Conversation state
  lastMessageAt: Timestamp | null;
  lastMessagePreview: string | null;
  unreadCountUser1: number;
  unreadCountUser2: number;

  // Status
  status: 'active' | 'expired' | 'unmatched';
  expiresAt: Timestamp | null;
}
```

**Subcollections**:
- `matches/{matchId}/messages/{messageId}`
- `matches/{matchId}/insights/{insightId}`

---

### 6. `matches/{matchId}/messages/{messageId}`
**Source**: `messages` table
**Purpose**: Messages between matched users

```typescript
interface MessageDocument {
  id: string;
  matchId: string;                // Parent match
  senderId: string;
  receiverId: string;

  content: string;
  messageType: 'text' | 'image' | 'voice' | 'video';
  attachmentUrl: string | null;

  isRead: boolean;
  readAt: Timestamp | null;
  isDeleted: boolean;
  deletedBy: string | null;

  sentAt: Timestamp;
}
```

---

### 7. `likes/{likeId}`
**Source**: `user_likes` table
**Purpose**: User swipes/likes

```typescript
interface LikeDocument {
  id: string;
  likerId: string;
  likedId: string;

  // Denormalized for queries
  likerName: string;
  likerPhoto: string;

  createdAt: Timestamp;

  // For mutual match detection
  isMatched: boolean;             // Set to true when mutual like occurs
}
```

**Composite Index**: `likedId` ASC, `isMatched` ASC, `createdAt` DESC

---

### 8. `matchInsights/{insightId}`
**Source**: `match_insights` table
**Purpose**: Compatibility analysis between users

```typescript
interface MatchInsightDocument {
  id: string;
  user1Id: string;
  user2Id: string;

  // Overall compatibility
  compatibilityScore: number;     // 0-100

  // Category scores
  religiousCompatibility: number;
  locationCompatibility: number;
  ageCompatibility: number;
  lifestyleCompatibility: number;
  familyCompatibility: number;

  // Detailed insights
  insightsData: {
    strengths: string[];
    potentialChallenges: string[];
    commonInterests: string[];
    valueDifferences: string[];
  };

  calculatedAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 9. `posts/{postId}`
**Source**: `posts` table
**Purpose**: Community posts

```typescript
interface PostDocument {
  id: string;
  userId: string;

  // Denormalized author info
  authorName: string;
  authorPhoto: string;
  authorVerified: boolean;

  content: string;
  imageUrl: string | null;
  location: string | null;
  mood: string | null;
  hashtags: string[];

  // Engagement
  likesCount: number;
  commentsCount: number;

  // Moderation
  isTrending: boolean;
  isApproved: boolean;
  isFlagged: boolean;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Subcollections**:
- `posts/{postId}/likes/{userId}` - Simple userId docs
- `posts/{postId}/comments/{commentId}`

---

### 10. `posts/{postId}/comments/{commentId}`
**Source**: `post_comments` table

```typescript
interface CommentDocument {
  id: string;
  postId: string;
  userId: string;

  // Denormalized commenter info
  authorName: string;
  authorPhoto: string;

  content: string;
  likesCount: number;

  createdAt: Timestamp;
}
```

---

### 11. `verificationRequests/{requestId}`
**Source**: `verification_requests` table
**Purpose**: ID verification requests

```typescript
interface VerificationRequestDocument {
  id: string;
  userId: string;

  // Denormalized user info
  userName: string;
  userEmail: string;

  verificationType: 'id_card' | 'passport' | 'selfie' | 'video';

  // Document URLs (Firebase Storage)
  idDocumentUrl: string;
  facePhotoUrl: string;
  videoUrl: string | null;

  status: 'pending' | 'under_review' | 'approved' | 'rejected';

  reviewedBy: string | null;
  reviewedAt: Timestamp | null;
  adminNotes: string | null;

  submittedAt: Timestamp;
}
```

---

### 12. `pushTokens/{tokenId}`
**Source**: `push_notification_tokens` table
**Purpose**: FCM device tokens

```typescript
interface PushTokenDocument {
  id: string;
  userId: string;
  token: string;                  // FCM token
  deviceType: 'ios' | 'android' | 'web';
  deviceId: string;
  isActive: boolean;
  createdAt: Timestamp;
  lastUsedAt: Timestamp;
}
```

---

### 13. `premiumSubscriptions/{subscriptionId}`
**Source**: `premium_subscriptions` table

```typescript
interface SubscriptionDocument {
  id: string;
  userId: string;

  tier: 'basic' | 'premium' | 'elite';
  status: 'active' | 'cancelled' | 'expired';

  startDate: Timestamp;
  endDate: Timestamp;
  autoRenew: boolean;

  // Payment info
  paymentMethod: string;
  lastPaymentDate: Timestamp | null;
  nextBillingDate: Timestamp | null;

  // Usage
  featureUsage: {
    superLikesRemaining: number;
    boostsRemaining: number;
    rewindsRemaining: number;
  };
}
```

---

### 14. `userReports/{reportId}`
**Source**: `user_reports` table
**Purpose**: User reports/flags

```typescript
interface UserReportDocument {
  id: string;
  reporterId: string;
  reportedUserId: string;

  reason: 'spam' | 'inappropriate' | 'fake_profile' | 'harassment' | 'other';
  description: string;
  evidence: string[];             // URLs to screenshots

  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';

  adminNotes: string | null;
  actionTaken: string | null;

  createdAt: Timestamp;
  resolvedAt: Timestamp | null;
}
```

---

### 15. `videoCallSessions/{sessionId}`
**Source**: `video_call_sessions` table

```typescript
interface VideoCallDocument {
  id: string;
  matchId: string;
  callerId: string;
  receiverId: string;

  status: 'ringing' | 'active' | 'ended' | 'missed' | 'declined';

  startedAt: Timestamp | null;
  endedAt: Timestamp | null;
  duration: number | null;        // Seconds

  roomId: string;                 // WebRTC room ID
}
```

---

### 16. `adminUsers/{userId}`
**Source**: `admin_users` + `user_roles` tables
**Purpose**: Admin access control

```typescript
interface AdminDocument {
  userId: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'support';
  permissions: string[];

  grantedBy: string;
  grantedAt: Timestamp;

  isActive: boolean;
}
```

---

## Aggregate Collections (Pre-computed Data)

### 17. `userStats/{userId}`
**Purpose**: Cached user statistics for performance

```typescript
interface UserStatsDocument {
  userId: string;

  profileViews: number;
  likesReceived: number;
  likesSent: number;
  matchesTotal: number;
  messagesExchanged: number;

  lastCalculatedAt: Timestamp;
}
```

---

### 18. `matchRecommendations/{userId}/recommended/{recommendedUserId}`
**Purpose**: Pre-computed match recommendations (refreshed daily)

```typescript
interface RecommendationDocument {
  userId: string;                 // Who gets this recommendation
  recommendedUserId: string;      // Who is recommended

  score: number;                  // Match score (0-100)
  reasons: string[];              // Why they're a good match

  // Denormalized profile data
  profile: {
    displayName: string;
    age: number;
    photoURL: string;
    location: string;
    bio: string;
  };

  generatedAt: Timestamp;
  expiresAt: Timestamp;           // Refresh after 24 hours
}
```

---

## Security Rules Pattern

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isAdmin() {
      return exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid));
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId) || isAdmin();

      // Subcollections
      match /photos/{photoId} {
        allow read: if isSignedIn();
        allow write: if isOwner(userId);
      }

      match /settings/{settingType} {
        allow read, write: if isOwner(userId);
      }

      match /preferences/{preferenceType} {
        allow read, write: if isOwner(userId);
      }
    }

    // Matches collection
    match /matches/{matchId} {
      allow read: if isSignedIn() &&
        (resource.data.user1Id == request.auth.uid || resource.data.user2Id == request.auth.uid);
      allow create: if isSignedIn();
      allow update: if isSignedIn() &&
        (resource.data.user1Id == request.auth.uid || resource.data.user2Id == request.auth.uid);

      match /messages/{messageId} {
        allow read: if isSignedIn() &&
          (get(/databases/$(database)/documents/matches/$(matchId)).data.user1Id == request.auth.uid ||
           get(/databases/$(database)/documents/matches/$(matchId)).data.user2Id == request.auth.uid);
        allow create: if isSignedIn() &&
          (get(/databases/$(database)/documents/matches/$(matchId)).data.user1Id == request.auth.uid ||
           get(/databases/$(database)/documents/matches/$(matchId)).data.user2Id == request.auth.uid);
      }
    }

    // Likes collection
    match /likes/{likeId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.resource.data.likerId == request.auth.uid;
      allow delete: if isSignedIn() && resource.data.likerId == request.auth.uid;
    }

    // Posts collection
    match /posts/{postId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow delete: if (isSignedIn() && resource.data.userId == request.auth.uid) || isAdmin();

      match /comments/{commentId} {
        allow read: if isSignedIn();
        allow create: if isSignedIn();
        allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
      }
    }

    // Admin-only collections
    match /verificationRequests/{requestId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow create: if isSignedIn();
      allow update: if isAdmin();
    }

    match /userReports/{reportId} {
      allow read: if isAdmin();
      allow create: if isSignedIn();
      allow update: if isAdmin();
    }
  }
}
```

---

## Composite Indexes Required

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "gender", "order": "ASCENDING" },
        { "fieldPath": "age", "order": "ASCENDING" },
        { "fieldPath": "canAccessApp", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "likes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "likedId", "order": "ASCENDING" },
        { "fieldPath": "isMatched", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user1Id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "lastMessageAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user2Id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "lastMessageAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isApproved", "order": "ASCENDING" },
        { "fieldPath": "isTrending", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "matchId", "order": "ASCENDING" },
        { "fieldPath": "sentAt", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## Migration Strategy

### Data Denormalization Examples

1. **User Info in Matches**:
   - Instead of JOIN, store `{ displayName, photoURL, age }` in match document
   - Update when user profile changes via Cloud Function trigger

2. **Unread Counts**:
   - Store at match level instead of calculating each time
   - Increment/decrement via Cloud Function on message create/read

3. **Post Engagement**:
   - Store `likesCount` and `commentsCount` on post document
   - Update via Cloud Function triggers on like/comment add/remove

### Query Optimization

1. **Get User's Matches**:
   ```typescript
   // Query 1: Matches where user is user1
   const matches1 = await db.collection('matches')
     .where('user1Id', '==', userId)
     .where('status', '==', 'active')
     .orderBy('lastMessageAt', 'desc')
     .get();

   // Query 2: Matches where user is user2
   const matches2 = await db.collection('matches')
     .where('user2Id', '==', userId)
     .where('status', '==', 'active')
     .orderBy('lastMessageAt', 'desc')
     .get();

   // Merge results in app code
   ```

2. **Get Match Recommendations**:
   - Use pre-computed `matchRecommendations` collection
   - Refresh daily via Cloud Scheduler + Cloud Function

---

## Next Steps

1. ✅ Create `firestore.rules` file with security rules
2. ✅ Create `firestore.indexes.json` with composite indexes
3. ⏳ Implement TypeScript interfaces in `/src/types/firestore.ts`
4. ⏳ Create Firestore helper utilities in `/src/lib/firestore/`
5. ⏳ Build Cloud Functions for denormalization triggers
6. ⏳ Create data migration scripts from Supabase

---

**End of Schema Design**
