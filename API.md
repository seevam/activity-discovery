# API Documentation - Identity Collage Builder

Complete API reference for all backend endpoints.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.vercel.app/api`

---

## Collages API

### Create New Collage
```
POST /api/collages
```

**Request Body:**
```json
{
  "studentId": "uuid",
  "session1Input": {
    "themes": ["Creative Problem-Solver", "Helper", "Builder"],
    "interests": ["Coding", "Art", "Gaming"],
    "careerClusters": ["STEM", "Arts & Communications"]
  },
  "templateType": "grid"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "studentId": "uuid",
  "status": "in_progress",
  "createdAt": "2024-01-15T10:30:00Z",
  ...
}
```

### Get Collage by ID
```
GET /api/collages/[id]
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "studentId": "uuid",
  "session1Input": {...},
  "canvasJSON": {...},
  "badges": ["strength-scout"],
  ...
}
```

### Get Student's Collages
```
GET /api/collages?studentId=uuid
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "status": "completed",
    "createdAt": "2024-01-15T10:30:00Z",
    ...
  }
]
```

### Update Collage (Auto-save)
```
PUT /api/collages/[id]
```

**Request Body:**
```json
{
  "canvasJSON": {...},
  "challenge1Complete": true,
  "challenge2Complete": false,
  "elementCount": 5,
  "timeSpentSeconds": 180
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "updatedAt": "2024-01-15T10:33:00Z",
  ...
}
```

### Complete Challenge
```
POST /api/collages/[id]/challenges/[challengeNumber]/complete
```

**Request Body:**
```json
{
  "elements": [
    {
      "type": "image",
      "source": "search",
      "url": "https://..."
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "badgeUnlocked": {
    "id": "strength-scout",
    "name": "Strength Scout",
    "stickersUnlocked": ["💡", "🧠", ...]
  }
}
```

### Mark Collage Complete
```
POST /api/collages/[id]/complete
```

**Request Body:**
```json
{
  "aboutMe": "I'm a creative problem-solver..."
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "completed",
  "completedAt": "2024-01-15T11:00:00Z",
  "allBadgesUnlocked": true
}
```

---

## Personalization API

### Generate AI Personalization
```
POST /api/personalize
```

**Request Body:**
```json
{
  "session1Input": {
    "themes": ["Creative", "Helper", "Builder"],
    "interests": ["Coding", "Art"],
    "careerClusters": ["STEM"]
  }
}
```

**Response:** `200 OK`
```json
{
  "challengePrompts": {
    "1": "Based on your creative and technical skills...",
    "2": "Your values likely include...",
    ...
  },
  "imageKeywords": ["coding", "art", "creativity", ...],
  "suggestedValues": ["Innovation", "Creativity", "Compassion", ...],
  "quotes": [
    {
      "text": "Creativity takes courage.",
      "author": "Henri Matisse",
      "theme": "creativity"
    }
  ]
}
```

---

## Image Search API

### Search Unsplash Images
```
GET /api/images/search?q=heart&perPage=20
```

**Query Parameters:**
- `q` (required): Search query
- `perPage` (optional): Number of results (default: 20)

**Response:** `200 OK`
```json
[
  {
    "id": "abc123",
    "url": "https://images.unsplash.com/...",
    "fullUrl": "https://images.unsplash.com/.../regular",
    "alt": "red heart",
    "photographer": "John Doe",
    "photographerUrl": "https://unsplash.com/@johndoe"
  }
]
```

---

## AI Image Generation API

### Generate Image with DALL-E
```
POST /api/images/generate
```

**Request Body:**
```json
{
  "prompt": "a colorful heart with wings",
  "style": "illustration"
}
```

**Style Options:**
- `icon`: Simple icon, flat design
- `illustration`: Digital illustration
- `abstract`: Abstract art
- `realistic`: Photorealistic

**Response:** `200 OK`
```json
{
  "id": "gen-abc123",
  "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "prompt": "a colorful heart with wings, digital illustration..."
}
```

**Rate Limiting:**
- 10 generations per activity session
- Credit tracking per student

---

## About Me Suggestions API

### Generate About Me Text
```
POST /api/about-me/suggestions
```

**Request Body:**
```json
{
  "themes": ["Creative", "Helper"],
  "interests": ["Coding", "Art"],
  "values": ["Innovation", "Compassion"],
  "careerClusters": ["STEM"],
  "quote": "Creativity takes courage."
}
```

**Response:** `200 OK`
```json
{
  "suggestions": [
    {
      "focus": "creative",
      "text": "I'm a creative problem-solver who loves..."
    },
    {
      "focus": "collaborative",
      "text": "Helping others is what makes me happiest..."
    },
    {
      "focus": "builder",
      "text": "I'm a hands-on builder who loves turning ideas..."
    }
  ]
}
```

---

## File Upload API

### Upload Image
```
POST /api/upload
```

**Request:** `multipart/form-data`
```
Content-Type: multipart/form-data
file: [binary data]
```

**Validation:**
- Max size: 5MB
- Allowed types: JPG, PNG, GIF, WebP

**Response:** `200 OK`
```json
{
  "url": "https://your-storage.com/uploads/abc123.jpg",
  "filename": "my-image.jpg",
  "size": 1234567,
  "type": "image/jpeg"
}
```

---

## Export API

### Generate PDF
```
POST /api/export/pdf
```

**Request Body:**
```json
{
  "collageId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "pdfUrl": "https://storage.com/collages/abc123.pdf",
  "size": 2456789
}
```

### Generate PNG
```
POST /api/export/png
```

**Request Body:**
```json
{
  "collageId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "pngUrl": "https://storage.com/collages/abc123.png",
  "width": 800,
  "height": 600,
  "size": 345678
}
```

---

## Analytics API

### Track Event
```
POST /api/analytics/track
```

**Request Body:**
```json
{
  "collageId": "uuid",
  "event": "challenge_completed",
  "data": {
    "challengeNumber": 1,
    "timeSpent": 120,
    "elementsAdded": 3
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

**Tracked Events:**
- `collage_started`
- `challenge_started`
- `challenge_completed`
- `challenge_skipped`
- `tool_used`
- `badge_unlocked`
- `image_searched`
- `ai_image_generated`
- `pdf_downloaded`
- `collage_completed`

---

## Badge System API

### Get Unlocked Badges
```
GET /api/badges?collageId=uuid
```

**Response:** `200 OK`
```json
[
  {
    "id": "strength-scout",
    "name": "Strength Scout",
    "emoji": "🏆",
    "unlocked": true,
    "unlockedAt": "2024-01-15T10:35:00Z"
  },
  {
    "id": "values-champion",
    "name": "Values Champion",
    "emoji": "💎",
    "unlocked": false
  }
]
```

### Get Unlocked Stickers
```
GET /api/stickers?collageId=uuid
```

**Response:** `200 OK`
```json
{
  "basic": ["😀", "😊", "🎉", "❤️"],
  "unlocked": ["💡", "🧠", "⚡", "🔦", "❤️", "💙", ...]
}
```

---

## Error Responses

All endpoints may return these error codes:

### 400 Bad Request
```json
{
  "error": "Missing required fields",
  "details": {
    "field": "studentId",
    "message": "studentId is required"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Collage with ID xyz not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "AI generation limit reached. Try again later.",
  "retryAfter": 3600
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Implementation Examples

### Example: Create and Auto-save Collage

```typescript
// 1. Create collage
const response = await fetch('/api/collages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentId: 'uuid',
    session1Input: {...},
    templateType: 'grid'
  })
});
const collage = await response.json();

// 2. Auto-save every 30 seconds
setInterval(async () => {
  await fetch(`/api/collages/${collage.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      canvasJSON: canvas.toJSON(),
      elementCount: canvas.getObjects().length,
      timeSpentSeconds: getElapsedTime()
    })
  });
}, 30000);
```

### Example: Search Images

```typescript
const searchImages = async (query: string) => {
  const response = await fetch(
    `/api/images/search?q=${encodeURIComponent(query)}&perPage=20`
  );
  const images = await response.json();
  return images;
};
```

### Example: Generate AI Image

```typescript
const generateImage = async (prompt: string, style: string) => {
  const response = await fetch('/api/images/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, style })
  });

  if (!response.ok) {
    throw new Error('Failed to generate image');
  }

  const result = await response.json();
  return result.url;
};
```

---

## Rate Limits

- **Unsplash**: 50 requests/hour (free tier)
- **OpenAI Images**: 10 per activity session
- **OpenAI Chat**: Unlimited (subject to account limits)
- **Database Operations**: No limit

## Security Considerations

1. **API Keys**: Never expose API keys client-side
2. **Authentication**: Implement student authentication
3. **File Upload**: Validate file types and sizes
4. **Rate Limiting**: Implement per-student limits
5. **CORS**: Configure allowed origins in production

---

For implementation details, see the code examples in `lib/api/`.
