# CIViQ+ AI Chatbot Guide

## Overview
The CIViQ+ AI Chatbot is a comprehensive 24/7 assistant integrated into your civic complaint management system. It helps citizens navigate the application, submit complaints, and get instant support.

## Features

### 🤖 **Always Available**
- 24/7 availability for citizen support
- Instant responses to user queries
- Context-aware conversations
- Remembers conversation history

### 💬 **Smart Assistance**
The chatbot can help with:

1. **Complaint Management**
   - Step-by-step guidance for submitting complaints
   - Explaining complaint statuses (Submitted, Assigned, In Progress, Resolved, etc.)
   - Understanding priority levels (Critical, High, Medium, Low)
   - Tracking complaint status

2. **Navigation Help**
   - Guide users through the application
   - Explain different sections and features
   - Role-specific navigation (Citizen, Authority, Admin)

3. **Map Features**
   - How to use the interactive complaints map
   - Understanding color-coded markers
   - Using filters and clusters
   - Finding complaints by location

4. **System Information**
   - Explaining complaint categories (Infrastructure, Sanitation, Transport, etc.)
   - Trust score system explanation
   - Best practices for filing complaints
   - Tips for faster resolution

5. **Problem Reporting**
   - Automatically detects when users report bugs or system issues
   - Alerts administrators when technical problems are mentioned
   - Provides troubleshooting steps

### 🎨 **User Interface**

**Chatbot Button:**
- Fixed position in bottom-right corner
- Pulsing animation to grab attention
- Click to open chat window

**Chat Window:**
- Modern, clean design with gradient headers
- Minimize/maximize functionality
- User and assistant messages clearly distinguished
- Timestamps on all messages
- Quick action buttons for common queries

**Quick Action Buttons:**
- "Submit complaint" - Instant guidance
- "Track complaints" - Status tracking help
- "Map help" - Interactive map tutorial

### 🔔 **Admin Notifications**

When users report system issues, bugs, or problems with the app, the chatbot:
1. Detects keywords like "bug", "error", "not working", "broken", "crash"
2. Sets an `alertAdmin: true` flag
3. Shows a notification to the user that admin has been alerted
4. Provides troubleshooting steps while help is on the way

### 📝 **Training & Intelligence**

The chatbot is trained with comprehensive knowledge about:
- Complete complaint submission workflow
- All 6 complaint categories with detailed descriptions
- 6 status types with meanings
- 4 priority levels with criteria
- Navigation paths for all 3 user roles
- Trust score system mechanics
- Map features and functionality
- Best practices and tips

### 🎯 **How It Works**

**Technical Implementation:**
1. **Frontend**: React component with real-time chat interface
2. **Backend**: API endpoint at `/api/chatbot` with intelligent response generation
3. **Context Awareness**: Maintains conversation history
4. **Role Adaptation**: Responses adapt based on user role (citizen/authority/admin)
5. **Error Handling**: Graceful fallbacks if API fails

### 💡 **Usage Tips**

**For Best Results:**
- Be specific in your questions
- Use natural language - the chatbot understands conversational queries
- Try the quick action buttons for common tasks
- Check conversation history by scrolling up

**Example Queries:**
- "How do I submit a complaint?"
- "What does 'in progress' status mean?"
- "I can't upload images, the app is broken"
- "Show me how to use the map"
- "What categories are available?"
- "How does the trust score work?"
- "I need help navigating to my complaints"

### 🚀 **Integration**

The chatbot is automatically integrated into all dashboard pages through the `DashboardLayout` component. No additional setup required - it's ready to use immediately!

### 📊 **Testing Results**

All API endpoints tested and verified:
- ✅ Greeting and welcome messages
- ✅ Complaint submission guidance
- ✅ Status tracking information
- ✅ Map usage instructions
- ✅ Category explanations
- ✅ Trust score details
- ✅ Bug/error detection and admin alerts
- ✅ Thank you / closing responses
- ✅ Default helpful responses

### 🔧 **API Endpoint**

**Endpoint**: `POST /api/chatbot`

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Your question" },
    { "role": "assistant", "content": "Previous response" }
  ],
  "userRole": "citizen",
  "userName": "User Name"
}
```

**Response:**
```json
{
  "message": "Chatbot response text",
  "alertAdmin": false
}
```

### 🎨 **Customization**

The chatbot appearance can be customized in `src/components/Chatbot.tsx`:
- Colors and gradients
- Window size and position
- Animation effects
- Quick action buttons
- Message styling

### 📱 **Responsive Design**

The chatbot is fully responsive and works across all devices:
- Desktop: Full-featured chat window
- Tablet: Optimized sizing
- Mobile: Compact interface with same functionality

---

**Ready to Help!** The CIViQ+ AI Chatbot is live and ready to assist your citizens 24/7. Just click the chat button in the bottom-right corner of any dashboard page!
