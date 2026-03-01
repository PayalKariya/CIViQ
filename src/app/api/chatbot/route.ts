import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Comprehensive knowledge base about the CIViQ+ system
const SYSTEM_KNOWLEDGE = `You are a helpful AI assistant for CIViQ+ (Civic Complaint Management System), a comprehensive platform for Mumbai citizens to report and track civic issues. You are available 24/7 to assist users.

## YOUR CAPABILITIES:
1. Help users submit and track complaints
2. Guide users through the application navigation
3. Explain complaint statuses and priorities
4. Alert administrators when users report bugs or issues with the system
5. Provide general assistance and support

## COMPLAINT SYSTEM KNOWLEDGE:

### How to Submit a Complaint:
1. Navigate to "Submit Complaint" from the dashboard or sidebar
2. Select a category (Infrastructure, Sanitation, Transport, Street Light, Water Supply, Health)
3. Provide a clear title and detailed description
4. Set priority level (Low, Medium, High, Critical)
5. Add location (address or coordinates)
6. Upload photos/videos if available (optional but helpful)
7. Click Submit

### Complaint Categories:
- **Infrastructure**: Roads, bridges, buildings, public structures
- **Sanitation**: Garbage, drainage, cleanliness issues
- **Transport**: Public transport, traffic signals, parking
- **Street Light**: Broken or non-functional street lights
- **Water Supply**: Water leaks, shortages, quality issues
- **Health**: Public health concerns, pest control

### Complaint Status Types:
- **Submitted**: Complaint received, awaiting review
- **Assigned**: Assigned to an authority for action
- **In Progress**: Authority is actively working on it
- **Resolved**: Issue has been fixed
- **Rejected**: Complaint doesn't meet criteria
- **Escalated**: Forwarded to higher authorities

### Priority Levels:
- **Critical**: Emergency situations requiring immediate attention
- **High**: Urgent issues affecting many people
- **Medium**: Standard issues requiring timely resolution
- **Low**: Minor concerns that can be addressed later

### Navigation Guide:
**For Citizens:**
- Dashboard: View your complaints overview and statistics
- My Complaints: See all your submitted complaints
- Submit Complaint: File a new complaint
- Complaints Map: Interactive map showing all complaints in Mumbai
- Profile: Manage your account and trust score

**For Authorities:**
- Dashboard: View assigned complaints and metrics
- Assigned Complaints: Complaints you need to handle
- Update Status: Change complaint status and add comments
- View Map: See complaint locations

**For Admins:**
- Dashboard: Complete system overview and analytics
- All Complaints: Manage all complaints in the system
- User Management: Monitor users and authorities
- Analytics: View detailed reports and statistics

### Complaint Map Features:
- View all complaints across Mumbai
- Filter by category, status, priority
- Color-coded markers (Red: Critical/High, Orange: Medium, Green: Low)
- Click markers to see complaint details
- Cluster markers show multiple complaints in same area
- Hover over markers for quick preview

### Trust Score System:
- Citizens and authorities have trust scores (0-100)
- Scores increase with: Valid complaints, timely resolutions, helpful feedback
- Scores decrease with: False complaints, delayed responses
- High trust scores get priority treatment

### Tips for Better Complaints:
1. Be specific and detailed in descriptions
2. Include exact location or landmarks
3. Upload clear photos/videos showing the issue
4. Set appropriate priority level
5. Provide contact information for follow-up
6. Check if similar complaint already exists

### System Issues to Report:
If users report bugs, errors, or system problems, acknowledge them and let them know you'll alert the administrator. Common issues:
- App not loading correctly
- Unable to submit complaints
- Images not uploading
- Map not displaying
- Login/authentication problems
- Missing data or incorrect information

## RESPONSE STYLE:
- Be friendly, helpful, and professional
- Use simple language, avoid jargon
- Provide step-by-step guidance when needed
- Offer relevant suggestions
- Show empathy for citizen concerns
- Be concise but thorough
- Use emojis occasionally to be friendly (but not excessively)

## IMPORTANT RULES:
1. If user mentions app bugs/errors, set "alertAdmin": true in response
2. Always stay in character as CIViQ+ assistant
3. Focus on helping with complaint management and navigation
4. If asked about something outside your scope, politely redirect to support
5. Encourage users to submit complaints for civic issues
6. Promote using the map feature to see complaint density`;

async function callGeminiWithContext(
  systemKnowledge: string,
  messages: Message[],
  userRole: string,
  userName: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const conversationText = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const prompt = `
${systemKnowledge}

You are CIViQ+ assistant. Current user:
- Name: ${userName}
- Role: ${userRole}

Conversation so far:
${conversationText}

Reply as CIViQ+ assistant. Be concise, friendly, and focus on complaint management, navigation, trust scores, and system help.
`;

  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
      apiKey,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${text}`);
  }

  const data = await res.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    (Array.isArray(data?.candidates?.[0]?.content?.parts)
      ? data.candidates[0].content.parts.map((p: any) => p.text).join(' ')
      : '');

  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  return text.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userRole, userName } = body as {
      messages: Message[];
      userRole: string;
      userName: string;
    };

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1];

    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Detect if admin should be alerted (same keyword logic as in generateResponse)
    const lowerMessage = lastUserMessage.content.toLowerCase();
    const bugKeywords = [
      'bug',
      'error',
      'not working',
      'broken',
      'crash',
      'problem with app',
      'issue with',
      'cant load',
      "can't load",
      'not loading',
      'not displaying',
    ];
    const alertAdmin = bugKeywords.some((keyword) => lowerMessage.includes(keyword));

    try {
      // Primary path: use Gemini with system knowledge and full conversation
      const aiText = await callGeminiWithContext(
        SYSTEM_KNOWLEDGE,
        messages,
        userRole,
        userName
      );

      return NextResponse.json({ message: aiText, alertAdmin });
    } catch (e) {
      console.error('Gemini error, falling back to rule-based bot:', e);

      // Fallback: existing rule-based generator
      const response = generateResponse(
        lastUserMessage.content,
        userRole,
        userName,
        messages
      );

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

function generateResponse(
  userMessage: string,
  userRole: string,
  userName: string,
  conversationHistory: Message[]
): { message: string; alertAdmin: boolean } {
  const lowerMessage = userMessage.toLowerCase();
  let alertAdmin = false;

  // Check for system issues/bugs
  const bugKeywords = ['bug', 'error', 'not working', 'broken', 'crash', 'problem with app', 'issue with', 'cant load', "can't load", 'not loading', 'not displaying'];
  if (bugKeywords.some(keyword => lowerMessage.includes(keyword))) {
    alertAdmin = true;
  }

  // Intent detection and response generation
  let message = '';

  // Greeting
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    message = `Hello ${userName}! 👋 How can I help you today? I can assist with:\n\n• Submitting complaints\n• Tracking complaint status\n• Navigating the app\n• Understanding the map\n• General guidance\n\nWhat would you like to know?`;
  }
  
  // Submit complaint help
  else if (lowerMessage.includes('submit') || lowerMessage.includes('file') || lowerMessage.includes('report') || lowerMessage.includes('complaint')) {
    if (lowerMessage.includes('how') || lowerMessage.includes('help')) {
      message = `Here's how to submit a complaint:\n\n1. **Navigate**: Click "Submit Complaint" in your dashboard\n2. **Category**: Choose the right category (Infrastructure, Sanitation, Transport, Street Light, Water Supply, Health)\n3. **Details**: Provide a clear title and detailed description\n4. **Priority**: Set urgency level (Critical/High/Medium/Low)\n5. **Location**: Add the exact address or drop a pin\n6. **Evidence**: Upload photos/videos (optional but helpful)\n7. **Submit**: Review and click Submit\n\n💡 Tip: Be specific and include landmarks for faster resolution!\n\nNeed help with a specific step?`;
    } else {
      message = `To submit a new complaint, go to the "Submit Complaint" section from your dashboard. Make sure to:\n\n✓ Choose the correct category\n✓ Write a clear description\n✓ Set appropriate priority\n✓ Add location details\n✓ Upload photos if possible\n\nThis helps authorities resolve issues faster!`;
    }
  }
  
  // Track complaints
  else if (lowerMessage.includes('track') || lowerMessage.includes('status') || lowerMessage.includes('check my')) {
    message = `You can track your complaints in the "My Complaints" section. Here's what each status means:\n\n📋 **Submitted**: Complaint received, awaiting review\n👤 **Assigned**: Given to an authority\n⚙️ **In Progress**: Being worked on actively\n✅ **Resolved**: Issue fixed!\n❌ **Rejected**: Didn't meet criteria\n⬆️ **Escalated**: Sent to higher authorities\n\nYou'll also receive notifications for status updates. Want to check a specific complaint?`;
  }
  
  // Map help
  else if (lowerMessage.includes('map')) {
    message = `The Interactive Complaints Map shows all complaints across Mumbai! Here's how to use it:\n\n🗺️ **Features:**\n• Color-coded markers (🔴 Critical/High, 🟠 Medium, 🟢 Low)\n• Click markers for details\n• Hover for quick preview\n• Clusters show multiple complaints in same area\n\n🔍 **Filters:**\n• Filter by category, status, or priority\n• See complaint density in different areas\n• Click the filter icon to reset\n\n📍 Access it from "Complaints Map" in your dashboard!\n\nNeed help with specific map features?`;
  }
  
  // Navigation help
  else if (lowerMessage.includes('navigate') || lowerMessage.includes('where') || lowerMessage.includes('find') || lowerMessage.includes('go to')) {
    const roleNavigation = {
      citizen: `**Your Dashboard Navigation:**\n\n🏠 **Dashboard**: Overview and statistics\n📝 **My Complaints**: All your submissions\n➕ **Submit Complaint**: File new complaint\n🗺️ **Complaints Map**: Interactive map\n👤 **Profile**: Account settings\n\nAll options are in the sidebar. What would you like to access?`,
      authority: `**Your Dashboard Navigation:**\n\n🏠 **Dashboard**: Assigned complaints overview\n📋 **Assigned Complaints**: Complaints to handle\n🗺️ **View Map**: Complaint locations\n👤 **Profile**: Account settings\n\nNeed help with complaint management?`,
      admin: `**Your Admin Dashboard:**\n\n🏠 **Dashboard**: Complete system overview\n📊 **Analytics**: Detailed reports\n👥 **User Management**: Monitor all users\n📋 **All Complaints**: System-wide complaints\n🗺️ **Map View**: All locations\n\nWhat would you like to manage?`
    };
    message = roleNavigation[userRole as keyof typeof roleNavigation] || roleNavigation.citizen;
  }
  
  // Priority/urgency
  else if (lowerMessage.includes('priority') || lowerMessage.includes('urgent') || lowerMessage.includes('emergency')) {
    message = `Here's how to set the right priority level:\n\n🔴 **Critical**: Life-threatening emergencies\n• Major infrastructure collapse\n• Severe health hazards\n• Immediate danger to public\n\n🟠 **High**: Urgent issues affecting many people\n• Roads blocked\n• Water supply failures\n• Major sanitation issues\n\n🟡 **Medium**: Standard issues\n• Potholes\n• Minor drainage problems\n• Street light outages\n\n🟢 **Low**: Minor concerns\n• Cosmetic issues\n• Non-urgent maintenance\n\nChoose wisely - accurate priority helps authorities respond faster!`;
  }
  
  // Categories
  else if (lowerMessage.includes('categor')) {
    message = `**Complaint Categories:**\n\n🏗️ **Infrastructure**: Roads, bridges, buildings, public structures\n🗑️ **Sanitation**: Garbage, drainage, cleanliness\n🚦 **Transport**: Public transport, traffic signals, parking\n💡 **Street Light**: Broken or non-functional lights\n💧 **Water Supply**: Leaks, shortages, quality issues\n🏥 **Health**: Public health concerns, pest control\n\nChoose the category that best matches your issue!`;
  }
  
  // Trust score
  else if (lowerMessage.includes('trust') || lowerMessage.includes('score') || lowerMessage.includes('rating')) {
    message = `**Trust Score System** (0-100 points):\n\n⬆️ **Score Increases With:**\n• Valid, well-documented complaints\n• Providing helpful feedback\n• Timely responses and updates\n• Community-helpful behavior\n\n⬇️ **Score Decreases With:**\n• False or spam complaints\n• Delayed responses\n• Incomplete information\n\n🌟 **Benefits of High Score:**\n• Priority treatment\n• Faster response times\n• Enhanced credibility\n\nCheck your score in your profile!`;
  }
  
  // Bug/system issue
  else if (alertAdmin) {
    message = `I'm sorry you're experiencing issues! 😟\n\nI've alerted the system administrator about this problem. In the meantime:\n\n1. Try refreshing the page\n2. Clear your browser cache\n3. Check your internet connection\n4. Try a different browser\n\nIf the issue persists, the admin team will investigate and fix it soon. You can also reach out to support directly.\n\nIs there anything else I can help you with?`;
  }
  
  // Thank you
  else if (lowerMessage.match(/thank|thanks/)) {
    message = `You're welcome! 😊 I'm always here to help.\n\nIf you have any more questions about:\n• Submitting complaints\n• Tracking status\n• Using the map\n• Navigating the app\n\nFeel free to ask anytime! Have a great day!`;
  }
  
  // Default response
  else {
    message = `I'd be happy to help! I can assist with:\n\n📝 **Complaint Management**\n• How to submit complaints\n• Track complaint status\n• Understanding priorities\n\n🗺️ **Navigation**\n• Using the interactive map\n• Accessing different sections\n• Finding features\n\n❓ **General Help**\n• Categories and status types\n• Trust score system\n• Best practices\n\nWhat would you like to know more about?`;
  }

  return { message, alertAdmin };
}
