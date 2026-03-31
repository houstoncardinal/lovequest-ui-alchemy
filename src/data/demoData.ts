// Centralized demo data for the entire app — profiles, posts, and comments
import woman1 from "@/assets/profiles/woman-1.jpg";
import woman2 from "@/assets/profiles/woman-2.jpg";
import woman3 from "@/assets/profiles/woman-3.jpg";
import woman4 from "@/assets/profiles/woman-4.jpg";
import woman5 from "@/assets/profiles/woman-5.jpg";
import woman6 from "@/assets/profiles/woman-6.jpg";
import woman7 from "@/assets/profiles/woman-7.jpg";
import woman8 from "@/assets/profiles/woman-8.jpg";

import postMorning from "@/assets/posts/morning-routine.jpg";
import postSkincare from "@/assets/posts/skincare.jpg";
import postCoffee from "@/assets/posts/coffee-friends.jpg";
import postNature from "@/assets/posts/nature-walk.jpg";
import postTech from "@/assets/posts/tech-workspace.jpg";

// ─── Profile Images ─────────────────────────────────────────────
export const PROFILE_IMAGES = [woman1, woman2, woman3, woman4, woman5, woman6, woman7, woman8];

// ─── Demo Profiles (swipe deck + detail pages) ─────────────────
export interface DemoProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  age: number;
  gender: string;
  location: string;
  bio: string;
  avatar_url: string;
  education_level: string;
  career_field: string;
  marital_status: string;
  smoking_status: string;
  has_children: boolean;
  children_preference: string;
  is_verified: boolean;
  interests: string[];
  match_score: number;
}

export const DEMO_PROFILES: DemoProfile[] = [
  {
    user_id: "demo-1",
    first_name: "Aaliyah",
    last_name: "Thompson",
    display_name: "Aaliyah Thompson",
    age: 25,
    gender: "female",
    location: "Atlanta, GA",
    bio: "Coffee addict, book lover, and sunset chaser. Looking for someone to explore the city with and have deep late-night conversations. 📚☕",
    avatar_url: woman1,
    education_level: "Bachelor's Degree",
    career_field: "Marketing",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: true,
    interests: ["Travel", "Photography", "Coffee", "Reading", "Yoga"],
    match_score: 95,
  },
  {
    user_id: "demo-2",
    first_name: "Mei",
    last_name: "Chen",
    display_name: "Mei Chen",
    age: 24,
    gender: "female",
    location: "San Francisco, CA",
    bio: "Software engineer by day, foodie by night. Looking for someone ambitious who also knows how to have fun. Let's try that new sushi spot! 🍣",
    avatar_url: woman2,
    education_level: "Master's Degree",
    career_field: "Technology",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: true,
    interests: ["Coding", "Hiking", "Sushi", "Fitness", "Travel"],
    match_score: 92,
  },
  {
    user_id: "demo-3",
    first_name: "Isabella",
    last_name: "Rivera",
    display_name: "Isabella Rivera",
    age: 27,
    gender: "female",
    location: "Miami, FL",
    bio: "Entrepreneur building a skincare brand 🌿 Love beach sunsets, salsa dancing, and trying every brunch spot in town. Your adventure buddy awaits!",
    avatar_url: woman3,
    education_level: "Bachelor's Degree",
    career_field: "Entrepreneurship",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: false,
    interests: ["Business", "Skincare", "Dancing", "Photography", "Travel"],
    match_score: 88,
  },
  {
    user_id: "demo-4",
    first_name: "Priya",
    last_name: "Sharma",
    display_name: "Priya Sharma",
    age: 26,
    gender: "female",
    location: "New York, NY",
    bio: "Medical resident on a mission to heal the world 🩺 When I'm not at the hospital I'm painting, doing yoga, or exploring art galleries. Looking for depth and laughter.",
    avatar_url: woman4,
    education_level: "Medical School",
    career_field: "Healthcare",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: true,
    interests: ["Art", "Yoga", "Medicine", "Museums", "Cooking"],
    match_score: 94,
  },
  {
    user_id: "demo-5",
    first_name: "Fatima",
    last_name: "Al-Rashid",
    display_name: "Fatima Al-Rashid",
    age: 23,
    gender: "female",
    location: "Houston, TX",
    bio: "Grad student & bookworm 📖 Passionate about environmental science and making the world a better place. Looking for someone with big dreams and a kind heart.",
    avatar_url: woman5,
    education_level: "Graduate School",
    career_field: "Environmental Science",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: true,
    interests: ["Environment", "Reading", "Nature", "Cooking", "Gardening"],
    match_score: 91,
  },
  {
    user_id: "demo-6",
    first_name: "Claire",
    last_name: "O'Brien",
    display_name: "Claire O'Brien",
    age: 28,
    gender: "female",
    location: "Boston, MA",
    bio: "High school teacher with a heart of gold 💛 Weekends are for exploring museums, trying new restaurants, and cuddling my golden retriever.",
    avatar_url: woman6,
    education_level: "Master's Degree",
    career_field: "Education",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: true,
    interests: ["Teaching", "Art", "Dogs", "Food", "Museums"],
    match_score: 93,
  },
  {
    user_id: "demo-7",
    first_name: "Zara",
    last_name: "Williams",
    display_name: "Zara Williams",
    age: 22,
    gender: "female",
    location: "Chicago, IL",
    bio: "Fashion design student with a love for live music 🎶 Looking for someone creative, spontaneous, and ready for road trips. Let's make memories!",
    avatar_url: woman7,
    education_level: "Bachelor's Degree",
    career_field: "Fashion",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "open",
    is_verified: false,
    interests: ["Fashion", "Music", "Concerts", "Art", "Road Trips"],
    match_score: 87,
  },
  {
    user_id: "demo-8",
    first_name: "Luna",
    last_name: "Reyes",
    display_name: "Luna Reyes",
    age: 25,
    gender: "female",
    location: "Austin, TX",
    bio: "Yoga instructor & plant mom 🌱 I believe in good energy, great food, and deep conversations under the stars. Your zen partner awaits ✨",
    avatar_url: woman8,
    education_level: "Bachelor's Degree",
    career_field: "Wellness",
    marital_status: "never_married",
    smoking_status: "never",
    has_children: false,
    children_preference: "wants_children",
    is_verified: true,
    interests: ["Yoga", "Plants", "Meditation", "Cooking", "Astrology"],
    match_score: 90,
  },
];

// ─── Detailed profile data for ProfileDetail page ────────────────
export interface DemoProfileDetail {
  name: string;
  age: number;
  distance: string;
  commonInterests: number;
  bio: string;
  image: string;
  images: string[];
  isPremium: boolean;
  details: {
    gender: string;
    religion: string;
    zodiac: string;
    drinking: string;
    smoking: string;
    height: string;
    education: string;
    jobTitle: string;
    company: string;
  };
  interests: { icon: string; label: string; highlighted?: boolean }[];
  lifestyle: { pets: string; workout: string; diet: string; socialLevel: string };
  values: string[];
  voiceNotes: { id: string; prompt: string; duration: string; audioUrl: null }[];
  photos: { url: string; caption: string }[];
}

export const DEMO_PROFILE_DETAILS: Record<string, DemoProfileDetail> = {
  "demo-1": {
    name: "Aaliyah Thompson",
    age: 25,
    distance: "2 km away",
    commonInterests: 5,
    bio: "Coffee addict, book lover, and sunset chaser. Looking for someone to explore the city with and have deep late-night conversations. 📚☕",
    image: woman1,
    images: [woman1, woman7, woman8],
    isPremium: true,
    details: { gender: "Woman", religion: "Open-minded", zodiac: "Libra", drinking: "Socially", smoking: "Never", height: "5'6\"", education: "Bachelor's Degree", jobTitle: "Marketing Manager", company: "Creative Agency" },
    interests: [{ icon: "✈️", label: "Travel", highlighted: true }, { icon: "📸", label: "Photography", highlighted: true }, { icon: "☕", label: "Coffee", highlighted: true }, { icon: "📚", label: "Reading" }, { icon: "🧘", label: "Yoga" }],
    lifestyle: { pets: "Dog lover 🐕", workout: "Yoga & Running", diet: "No Restrictions", socialLevel: "Ambivert" },
    values: ["Creativity", "Honesty", "Adventure", "Growth", "Humor"],
    voiceNotes: [{ id: "vn1", prompt: "What's your perfect date idea?", duration: "0:45", audioUrl: null }],
    photos: [{ url: woman1, caption: "Golden hour vibes ☀️" }, { url: woman7, caption: "City exploring 🏙️" }, { url: woman8, caption: "Weekend adventures 🌿" }],
  },
  "demo-2": {
    name: "Mei Chen",
    age: 24,
    distance: "3.5 km away",
    commonInterests: 4,
    bio: "Software engineer by day, foodie by night. Looking for someone ambitious who also knows how to have fun. Let's try that new sushi spot! 🍣",
    image: woman2,
    images: [woman2, woman4, woman6],
    isPremium: false,
    details: { gender: "Woman", religion: "All Backgrounds", zodiac: "Virgo", drinking: "Socially", smoking: "Never", height: "5'4\"", education: "Master's Degree", jobTitle: "Software Engineer", company: "Tech Startup" },
    interests: [{ icon: "💻", label: "Coding", highlighted: true }, { icon: "🥾", label: "Hiking", highlighted: true }, { icon: "🍣", label: "Sushi" }, { icon: "🏋️", label: "Fitness" }, { icon: "✈️", label: "Travel" }],
    lifestyle: { pets: "Cat lover 🐱", workout: "Gym & Hiking", diet: "Pescatarian", socialLevel: "Introvert" },
    values: ["Ambition", "Intelligence", "Humor", "Loyalty", "Growth"],
    voiceNotes: [{ id: "vn1", prompt: "What's your biggest passion?", duration: "0:52", audioUrl: null }],
    photos: [{ url: woman2, caption: "Coffee shop coding ☕💻" }, { url: woman4, caption: "Hiking adventures 🏔️" }, { url: woman6, caption: "Foodie life 🍣" }],
  },
  "demo-3": {
    name: "Isabella Rivera",
    age: 27,
    distance: "1.8 km away",
    commonInterests: 4,
    bio: "Entrepreneur building a skincare brand 🌿 Love beach sunsets, salsa dancing, and trying every brunch spot in town.",
    image: woman3,
    images: [woman3, woman8, woman1],
    isPremium: true,
    details: { gender: "Woman", religion: "Catholic", zodiac: "Leo", drinking: "Socially", smoking: "Never", height: "5'5\"", education: "Bachelor's Degree", jobTitle: "CEO / Founder", company: "Glow Naturals" },
    interests: [{ icon: "💼", label: "Business", highlighted: true }, { icon: "🌿", label: "Skincare", highlighted: true }, { icon: "💃", label: "Dancing" }, { icon: "📸", label: "Photography" }, { icon: "✈️", label: "Travel" }],
    lifestyle: { pets: "No pets yet", workout: "Dance & Pilates", diet: "Vegetarian", socialLevel: "Extrovert" },
    values: ["Passion", "Independence", "Family", "Creativity", "Faith"],
    voiceNotes: [{ id: "vn1", prompt: "What inspires you?", duration: "1:03", audioUrl: null }],
    photos: [{ url: woman3, caption: "Beach sunset vibes 🌅" }, { url: woman8, caption: "Brunch date 🥂" }, { url: woman1, caption: "Building my dream ✨" }],
  },
  "demo-4": {
    name: "Priya Sharma",
    age: 26,
    distance: "4 km away",
    commonInterests: 5,
    bio: "Medical resident on a mission to heal the world 🩺 When I'm not at the hospital I'm painting, doing yoga, or exploring art galleries.",
    image: woman4,
    images: [woman4, woman2, woman5],
    isPremium: false,
    details: { gender: "Woman", religion: "Hindu", zodiac: "Pisces", drinking: "Never", smoking: "Never", height: "5'3\"", education: "Medical School", jobTitle: "Medical Resident", company: "NYU Hospital" },
    interests: [{ icon: "🎨", label: "Art", highlighted: true }, { icon: "🧘", label: "Yoga", highlighted: true }, { icon: "🩺", label: "Medicine" }, { icon: "🏛️", label: "Museums" }, { icon: "🍳", label: "Cooking" }],
    lifestyle: { pets: "Love all animals 🐾", workout: "Yoga & Meditation", diet: "Vegetarian", socialLevel: "Ambivert" },
    values: ["Compassion", "Knowledge", "Health", "Spirituality", "Kindness"],
    voiceNotes: [{ id: "vn1", prompt: "What does healing mean to you?", duration: "1:15", audioUrl: null }],
    photos: [{ url: woman4, caption: "Art gallery day 🎨" }, { url: woman2, caption: "Morning yoga 🧘" }, { url: woman5, caption: "Study break ☕" }],
  },
  "demo-5": {
    name: "Fatima Al-Rashid",
    age: 23,
    distance: "2.5 km away",
    commonInterests: 4,
    bio: "Grad student & bookworm 📖 Passionate about environmental science and making the world a better place.",
    image: woman5,
    images: [woman5, woman3, woman6],
    isPremium: true,
    details: { gender: "Woman", religion: "Muslim", zodiac: "Aquarius", drinking: "Never", smoking: "Never", height: "5'5\"", education: "Graduate School", jobTitle: "Research Assistant", company: "Rice University" },
    interests: [{ icon: "🌍", label: "Environment", highlighted: true }, { icon: "📚", label: "Reading", highlighted: true }, { icon: "🌿", label: "Nature" }, { icon: "🍳", label: "Cooking" }, { icon: "🌻", label: "Gardening" }],
    lifestyle: { pets: "Cat lover 🐱", workout: "Walking & Yoga", diet: "Halal", socialLevel: "Introvert" },
    values: ["Faith", "Knowledge", "Sustainability", "Family", "Kindness"],
    voiceNotes: [{ id: "vn1", prompt: "What's your dream for the future?", duration: "0:58", audioUrl: null }],
    photos: [{ url: woman5, caption: "Campus vibes 🎓" }, { url: woman3, caption: "Nature trail 🌿" }, { url: woman6, caption: "Study session 📚" }],
  },
  "demo-6": {
    name: "Claire O'Brien",
    age: 28,
    distance: "1 km away",
    commonInterests: 5,
    bio: "High school teacher with a heart of gold 💛 Weekends are for exploring museums, trying new restaurants, and cuddling my golden retriever.",
    image: woman6,
    images: [woman6, woman1, woman3],
    isPremium: false,
    details: { gender: "Woman", religion: "Catholic", zodiac: "Cancer", drinking: "Socially", smoking: "Never", height: "5'7\"", education: "Master's Degree", jobTitle: "English Teacher", company: "Boston Latin" },
    interests: [{ icon: "📚", label: "Teaching", highlighted: true }, { icon: "🎨", label: "Art", highlighted: true }, { icon: "🐕", label: "Dogs" }, { icon: "🍕", label: "Food" }, { icon: "🏛️", label: "Museums" }],
    lifestyle: { pets: "Golden retriever named Biscuit 🐕", workout: "Running & Swimming", diet: "No Restrictions", socialLevel: "Extrovert" },
    values: ["Education", "Empathy", "Family", "Humor", "Loyalty"],
    voiceNotes: [{ id: "vn1", prompt: "What's your favourite thing about teaching?", duration: "0:42", audioUrl: null }],
    photos: [{ url: woman6, caption: "Coffee shop grading 📝" }, { url: woman1, caption: "Museum day 🏛️" }, { url: woman3, caption: "Biscuit & me 🐕" }],
  },
  "demo-7": {
    name: "Zara Williams",
    age: 22,
    distance: "3 km away",
    commonInterests: 3,
    bio: "Fashion design student with a love for live music 🎶 Looking for someone creative, spontaneous, and ready for road trips.",
    image: woman7,
    images: [woman7, woman8, woman2],
    isPremium: false,
    details: { gender: "Woman", religion: "Spiritual", zodiac: "Aries", drinking: "Socially", smoking: "Never", height: "5'8\"", education: "Bachelor's Degree", jobTitle: "Fashion Student", company: "Parsons School" },
    interests: [{ icon: "👗", label: "Fashion", highlighted: true }, { icon: "🎵", label: "Music", highlighted: true }, { icon: "🎤", label: "Concerts" }, { icon: "🎨", label: "Art" }, { icon: "🚗", label: "Road Trips" }],
    lifestyle: { pets: "No pets yet", workout: "Dance & Cycling", diet: "No Restrictions", socialLevel: "Extrovert" },
    values: ["Creativity", "Freedom", "Authenticity", "Fun", "Expression"],
    voiceNotes: [{ id: "vn1", prompt: "Describe your style in 3 words", duration: "0:35", audioUrl: null }],
    photos: [{ url: woman7, caption: "City streets 🏙️" }, { url: woman8, caption: "Concert night 🎤" }, { url: woman2, caption: "Studio session 🧵" }],
  },
  "demo-8": {
    name: "Luna Reyes",
    age: 25,
    distance: "2 km away",
    commonInterests: 4,
    bio: "Yoga instructor & plant mom 🌱 I believe in good energy, great food, and deep conversations under the stars.",
    image: woman8,
    images: [woman8, woman5, woman1],
    isPremium: true,
    details: { gender: "Woman", religion: "Spiritual", zodiac: "Sagittarius", drinking: "Never", smoking: "Never", height: "5'6\"", education: "Bachelor's Degree", jobTitle: "Yoga Instructor", company: "Soul Yoga Studio" },
    interests: [{ icon: "🧘", label: "Yoga", highlighted: true }, { icon: "🌱", label: "Plants", highlighted: true }, { icon: "🧠", label: "Meditation" }, { icon: "🍳", label: "Cooking" }, { icon: "⭐", label: "Astrology" }],
    lifestyle: { pets: "Plant babies 🌿", workout: "Yoga daily", diet: "Vegan", socialLevel: "Ambivert" },
    values: ["Mindfulness", "Balance", "Nature", "Growth", "Love"],
    voiceNotes: [{ id: "vn1", prompt: "What does peace mean to you?", duration: "1:02", audioUrl: null }],
    photos: [{ url: woman8, caption: "Garden meditation 🌿" }, { url: woman5, caption: "Sunrise yoga ☀️" }, { url: woman1, caption: "Plant shopping 🌱" }],
  },
};

// Helper to look up a detail profile, falling back for old numeric IDs
export const getDemoProfileDetail = (id: string): DemoProfileDetail | null => {
  if (DEMO_PROFILE_DETAILS[id]) return DEMO_PROFILE_DETAILS[id];
  // Legacy numeric id mapping
  const legacyMap: Record<string, string> = { "1": "demo-1", "2": "demo-2", "3": "demo-3", "4": "demo-4", "5": "demo-5", "6": "demo-6", "p1": "demo-1", "p2": "demo-2", "p3": "demo-3" };
  const mapped = legacyMap[id];
  return mapped ? DEMO_PROFILE_DETAILS[mapped] : DEMO_PROFILE_DETAILS["demo-1"];
};

// ─── Demo Community Posts ────────────────────────────────────────
export interface DemoPost {
  id: string;
  content: string;
  image_url?: string;
  location?: string;
  hashtags?: string[];
  mood?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author_id: string;
  profiles: {
    display_name: string;
    photos?: string[];
  };
  user_liked: boolean;
}

export const DEMO_POSTS: DemoPost[] = [
  {
    id: "demo-post-1",
    content: "Grateful for another beautiful day! 🌅 Starting mornings with journaling and a great workout has been a game-changer. What's your morning routine? ☀️✨",
    image_url: postMorning,
    location: "Atlanta, GA",
    hashtags: ["SelfGrowth", "MorningVibes", "Wellness"],
    mood: "grateful",
    likes_count: 47,
    comments_count: 12,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    author_id: "demo-1",
    profiles: { display_name: "Aaliyah Thompson", photos: [woman1] },
    user_liked: false,
  },
  {
    id: "demo-post-2",
    content: "Trying out this incredible clean beauty brand! Their products are amazing and so gentle on the skin 💄✨ Supporting small businesses is everything!\n\nWhat's your go-to skincare product?",
    image_url: postSkincare,
    location: "Miami, FL",
    hashtags: ["CleanBeauty", "SmallBusiness", "Skincare"],
    mood: "excited",
    likes_count: 33,
    comments_count: 8,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    author_id: "demo-3",
    profiles: { display_name: "Isabella Rivera", photos: [woman3] },
    user_liked: false,
  },
  {
    id: "demo-post-3",
    content: "Weekend thoughts: What's better than sitting with good company, discussing big ideas, and dreaming about making a positive impact? 🤝 Coffee not included, but highly recommended ☕️",
    image_url: postCoffee,
    location: "Chicago, IL",
    hashtags: ["GoodVibes", "Community", "WeekendMood"],
    mood: "inspired",
    likes_count: 62,
    comments_count: 19,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    author_id: "demo-7",
    profiles: { display_name: "Zara Williams", photos: [woman7] },
    user_liked: false,
  },
  {
    id: "demo-post-4",
    content: "Nature walks and meditation = perfect Sunday afternoon 🏞️ The outdoors always recharges my soul. Grateful for simple pleasures.\n\nWhat's your favorite way to unwind? 🌿🧘‍♀️",
    image_url: postNature,
    location: "Austin, TX",
    hashtags: ["NatureHeals", "Mindfulness", "SundayVibes"],
    mood: "peaceful",
    likes_count: 28,
    comments_count: 7,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    author_id: "demo-8",
    profiles: { display_name: "Luna Reyes", photos: [woman8] },
    user_liked: false,
  },
  {
    id: "demo-post-5",
    content: "Just shipped a major feature update! 💻🚀 When you build with passion and purpose, everything falls into place. So proud of this team.\n\nAny other women in tech here? Let's connect!",
    image_url: postTech,
    location: "San Francisco, CA",
    hashtags: ["WomenInTech", "BuildInPublic", "TechLife"],
    mood: "happy",
    likes_count: 54,
    comments_count: 15,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    author_id: "demo-2",
    profiles: { display_name: "Mei Chen", photos: [woman2] },
    user_liked: false,
  },
  {
    id: "demo-post-6",
    content: "Teaching moment: Always stay curious and never stop learning! Watching my students discover new concepts fills me with so much hope for the future 📚👩‍🏫\n\nEducation changes lives, one lesson at a time.",
    location: "Boston, MA",
    hashtags: ["Teaching", "Education", "Inspiration"],
    mood: "hopeful",
    likes_count: 41,
    comments_count: 11,
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    author_id: "demo-6",
    profiles: { display_name: "Claire O'Brien", photos: [woman6] },
    user_liked: false,
  },
  {
    id: "demo-post-7",
    content: "Research update: Our team just published findings on urban sustainability 🌍📊 It's incredible what happens when passionate people come together for a common cause.\n\nProud to be part of this movement!",
    location: "Houston, TX",
    hashtags: ["Sustainability", "Research", "Science"],
    mood: "inspired",
    likes_count: 36,
    comments_count: 9,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    author_id: "demo-5",
    profiles: { display_name: "Fatima Al-Rashid", photos: [woman5] },
    user_liked: false,
  },
  {
    id: "demo-post-8",
    content: "After a 12-hour shift at the hospital, there's nothing like coming home to a warm bath and some Rumi poetry 🩺📖\n\nReminder: Take care of the caretakers too 💛",
    location: "New York, NY",
    hashtags: ["DoctorLife", "SelfCare", "HealthcareHeroes"],
    mood: "thoughtful",
    likes_count: 52,
    comments_count: 14,
    created_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    author_id: "demo-4",
    profiles: { display_name: "Priya Sharma", photos: [woman4] },
    user_liked: false,
  },
];

// ─── Demo Comments for PostDetailView ────────────────────────────
export interface DemoComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { display_name: string; avatar_url: string; first_name: string; last_name: string };
}

export const getDemoComments = (postId: string): DemoComment[] => {
  const now = Date.now();
  const allComments: Record<string, DemoComment[]> = {
    "demo-post-1": [
      { id: "c1", content: "Love this! Journaling has changed my life too 📝", created_at: new Date(now - 1 * 60 * 60 * 1000).toISOString(), user_id: "demo-4", profiles: { display_name: "Priya Sharma", avatar_url: woman4, first_name: "Priya", last_name: "Sharma" } },
      { id: "c2", content: "What journal do you use? I need recommendations!", created_at: new Date(now - 50 * 60 * 1000).toISOString(), user_id: "demo-6", profiles: { display_name: "Claire O'Brien", avatar_url: woman6, first_name: "Claire", last_name: "O'Brien" } },
      { id: "c3", content: "Morning routines are everything 🙌 Mine includes meditation and green tea", created_at: new Date(now - 40 * 60 * 1000).toISOString(), user_id: "demo-8", profiles: { display_name: "Luna Reyes", avatar_url: woman8, first_name: "Luna", last_name: "Reyes" } },
      { id: "c4", content: "That view is incredible! Where is this?", created_at: new Date(now - 30 * 60 * 1000).toISOString(), user_id: "demo-2", profiles: { display_name: "Mei Chen", avatar_url: woman2, first_name: "Mei", last_name: "Chen" } },
    ],
    "demo-post-2": [
      { id: "c5", content: "Omg I need this in my life! Drop the brand name please 🙏", created_at: new Date(now - 3 * 60 * 60 * 1000).toISOString(), user_id: "demo-1", profiles: { display_name: "Aaliyah Thompson", avatar_url: woman1, first_name: "Aaliyah", last_name: "Thompson" } },
      { id: "c6", content: "Supporting small businesses is so important! 💕", created_at: new Date(now - 2.5 * 60 * 60 * 1000).toISOString(), user_id: "demo-7", profiles: { display_name: "Zara Williams", avatar_url: woman7, first_name: "Zara", last_name: "Williams" } },
      { id: "c7", content: "Clean beauty all the way! My skin has never been better since switching", created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(), user_id: "demo-5", profiles: { display_name: "Fatima Al-Rashid", avatar_url: woman5, first_name: "Fatima", last_name: "Al-Rashid" } },
    ],
    "demo-post-3": [
      { id: "c8", content: "This is literally me and my girls every Saturday! ☕❤️", created_at: new Date(now - 5 * 60 * 60 * 1000).toISOString(), user_id: "demo-3", profiles: { display_name: "Isabella Rivera", avatar_url: woman3, first_name: "Isabella", last_name: "Rivera" } },
      { id: "c9", content: "Deep conversations > small talk, always 🤝", created_at: new Date(now - 4.5 * 60 * 60 * 1000).toISOString(), user_id: "demo-4", profiles: { display_name: "Priya Sharma", avatar_url: woman4, first_name: "Priya", last_name: "Sharma" } },
      { id: "c10", content: "The best ideas come from these kinds of moments!", created_at: new Date(now - 4 * 60 * 60 * 1000).toISOString(), user_id: "demo-2", profiles: { display_name: "Mei Chen", avatar_url: woman2, first_name: "Mei", last_name: "Chen" } },
      { id: "c11", content: "I need more of this energy in my life ✨", created_at: new Date(now - 3.5 * 60 * 60 * 1000).toISOString(), user_id: "demo-8", profiles: { display_name: "Luna Reyes", avatar_url: woman8, first_name: "Luna", last_name: "Reyes" } },
      { id: "c12", content: "Where is this cafe? It looks so cozy!", created_at: new Date(now - 3 * 60 * 60 * 1000).toISOString(), user_id: "demo-6", profiles: { display_name: "Claire O'Brien", avatar_url: woman6, first_name: "Claire", last_name: "O'Brien" } },
    ],
    "demo-post-4": [
      { id: "c13", content: "Nature therapy is the best therapy 🌿", created_at: new Date(now - 7 * 60 * 60 * 1000).toISOString(), user_id: "demo-5", profiles: { display_name: "Fatima Al-Rashid", avatar_url: woman5, first_name: "Fatima", last_name: "Al-Rashid" } },
      { id: "c14", content: "I need to do more of this. Thanks for the reminder! 🧘‍♀️", created_at: new Date(now - 6.5 * 60 * 60 * 1000).toISOString(), user_id: "demo-1", profiles: { display_name: "Aaliyah Thompson", avatar_url: woman1, first_name: "Aaliyah", last_name: "Thompson" } },
    ],
    "demo-post-5": [
      { id: "c15", content: "Women in tech rise up! 🙌💻 So inspiring!", created_at: new Date(now - 11 * 60 * 60 * 1000).toISOString(), user_id: "demo-7", profiles: { display_name: "Zara Williams", avatar_url: woman7, first_name: "Zara", last_name: "Williams" } },
      { id: "c16", content: "Congrats on the launch! What stack are you using?", created_at: new Date(now - 10 * 60 * 60 * 1000).toISOString(), user_id: "demo-4", profiles: { display_name: "Priya Sharma", avatar_url: woman4, first_name: "Priya", last_name: "Sharma" } },
      { id: "c17", content: "This workspace setup is goals 😍", created_at: new Date(now - 9 * 60 * 60 * 1000).toISOString(), user_id: "demo-1", profiles: { display_name: "Aaliyah Thompson", avatar_url: woman1, first_name: "Aaliyah", last_name: "Thompson" } },
    ],
  };
  return allComments[postId] || [
    { id: "c-default-1", content: "Love this post! ❤️", created_at: new Date(now - 1 * 60 * 60 * 1000).toISOString(), user_id: "demo-1", profiles: { display_name: "Aaliyah Thompson", avatar_url: woman1, first_name: "Aaliyah", last_name: "Thompson" } },
    { id: "c-default-2", content: "So inspiring! Keep sharing 🙏", created_at: new Date(now - 30 * 60 * 1000).toISOString(), user_id: "demo-6", profiles: { display_name: "Claire O'Brien", avatar_url: woman6, first_name: "Claire", last_name: "O'Brien" } },
  ];
};

// Helper to get a demo post by ID
export const getDemoPost = (postId: string): DemoPost | null => {
  return DEMO_POSTS.find(p => p.id === postId) || DEMO_POSTS[0];
};
