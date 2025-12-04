# Assistu - Intelligent Voice-Enabled Student Assistant

**Assistu** is a modern web-based academic assistant designed to help students manage their academic workflow through intelligent voice commands. This repository contains the **client application** built with Next.js and React.


> **Server Repository**: Access the Server `backend` of this client via [Assistu-Server](https://github.com/BazilSuhail/Assistu-Server)

The backend server handles authentication, voice processing, AI-powered features, and data management. Make sure to set up and run the server before using this client application.

---

## Project Overview

Assistu is an intelligent voice-enabled student assistant that simplifies academic management through natural speech interaction. Students can create tasks, schedule events, record notes, and generate study plans using voice commands, making academic organization effortless and accessible.

### Key Features

- **User Authentication** - Secure registration and login with JWT authentication
- **Voice-Controlled Tasks** - Create, edit, delete, and view tasks using natural voice commands
- **Smart Calendar** - Schedule and manage events via voice with an intuitive calendar UI
- **Voice Notes** - Upload or record voice notes with automatic transcription and summarization
- **Semantic Search** - Find similar notes using all-MiniLM-L6-v2 embedding model
- **Study Planner** - AI-generated study plans based on subjects, purpose, and dates
- **Voice Navigation** - Navigate throughout the application using voice commands
- **Audio Feedback** - Audible confirmations using browser's Speech Synthesis API
- **Multi-language Support** - Support for multiple languages
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### Technical Highlights

- **Voice Processing:** Real-time speech recognition with 99% accuracy
- **Performance:** Voice commands processed within 1.5 seconds
- **Security:** End-to-end encryption for sensitive data
- **Accessibility:** WCAG 2.1 compliant interface
- **AI-Powered:** Semantic search and intelligent study plan generation

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (React 19)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Icons:** [React Icons](https://react-icons.github.io/react-icons/)
- **Language:** JavaScript (ES6+)

---

## Installation Guide

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Assistu Server** running (see [server repository](https://github.com/BazilSuhail/Assistu-Server))

### Step 1: Clone the Repository

```bash
git clone https://github.com/BazilSuhail/Assistu-Client.git
cd Assistu-Client
```

### Step 2: Install Dependencies

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory and add your server API URL:

```env
NEXT_PUBLIC_SERVER_API_URL=http://localhost:8000/api
```

Replace `http://localhost:8000/api` with your actual server URL.

### Step 4: Run the Development Server

```bash
npm run dev
```

Or using yarn:

```bash
yarn dev
```

The application will start at **http://localhost:3000**

### Step 5: Build for Production (Optional)

```bash
npm run build
npm start
```

---

## Folder Structure

### `/app` Directory

The `app` directory follows Next.js 13+ App Router structure and contains all application pages:

```
app/
├── auth/
│   ├── login/          # User login page
│   └── register/       # User registration page
├── dashboard/          # Main dashboard with stats and overview
├── tasks/              # Task management page
│   └── [taskId]/       # Individual task detail page (dynamic route)
├── notes/              # Notes listing page
│   └── [noteId]/       # Individual note detail page (dynamic route)
├── calendar/           # Calendar view with event management
├── planner/            # Study planner page with AI-generated plans
├── settings/           # User settings and preferences
├── client-layout.jsx   # Client-side layout wrapper
├── layout.jsx          # Root layout component
├── page.jsx            # Landing/home page
└── globals.css         # Global styles and Tailwind configuration
```

**What each page does:**

- **`auth/login`** - Handles user authentication with JWT token storage
- **`auth/register`** - New user registration with form validation
- **`dashboard`** - Displays overview stats (tasks due, events, study hours, notes)
- **`tasks`** - Lists all tasks with filtering (All, Today, Overdue, Completed, By Subject)
- **`tasks/[taskId]`** - Shows detailed task view with edit/delete capabilities
- **`notes`** - Displays all voice notes with subject-based filtering
- **`notes/[noteId]`** - Shows transcribed note content with metadata
- **`calendar`** - Interactive calendar with event creation, editing, and deletion
- **`planner`** - AI-powered study plan generator and viewer
- **`settings`** - User preferences and account settings

### `/components` Directory

Reusable React components organized by feature:

```
components/
├── tasks/
│   ├── CreateTask.jsx      # Task creation modal with voice input
│   └── VoiceModal.jsx      # Voice recording modal for tasks
├── notes/
│   └── CreateNote.jsx      # Note creation modal with file upload
├── events/
│   └── CreateEvent.jsx     # Event creation modal for calendar
├── planner/
│   ├── CreatePlan.jsx      # Study plan creation form
│   └── PlanDetail.jsx      # Detailed study plan viewer
├── shared/
│   ├── loader.jsx          # Loading spinner component
│   └── voice-command-bar.jsx  # Global voice command interface
└── layout/
    ├── sidebar.jsx         # Desktop navigation sidebar
    └── bottom-nav.jsx      # Mobile bottom navigation
```

**What each component does:**

- **`tasks/CreateTask.jsx`** - Modal for creating tasks via voice or form input
- **`tasks/VoiceModal.jsx`** - Handles voice recording and processing for tasks
- **`notes/CreateNote.jsx`** - Allows uploading or recording voice notes
- **`events/CreateEvent.jsx`** - Form for scheduling calendar events
- **`planner/CreatePlan.jsx`** - Interface for generating AI study plans
- **`planner/PlanDetail.jsx`** - Displays detailed study plan with sessions
- **`shared/loader.jsx`** - Reusable loading animation
- **`shared/voice-command-bar.jsx`** - Global voice command interface for navigation
- **`layout/sidebar.jsx`** - Desktop navigation with links to all pages
- **`layout/bottom-nav.jsx`** - Mobile-optimized bottom navigation bar

### Other Important Directories

- **`/public`** - Static assets (images, icons, fonts)
- **`/node_modules`** - Project dependencies (auto-generated)
- **`.next`** - Next.js build output (auto-generated)

---

## Usage

1. **Register/Login** - Create an account or log in with existing credentials
2. **Dashboard** - View your academic overview and quick stats
3. **Tasks** - Manage your to-do list with voice commands
4. **Calendar** - Schedule and track events
5. **Notes** - Record and search voice notes
6. **Planner** - Generate AI-powered study plans
7. **Voice Commands** - Use the microphone icon to navigate and create items

---

## Security & Privacy

- JWT-based authentication with secure token storage
- End-to-end encryption for sensitive voice data
- HTTPS recommended for production deployment
- Compliance with WCAG 2.1 accessibility standards

---

## License

This project is part of an academic assignment and is intended for educational purposes.

