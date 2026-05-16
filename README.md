# TaskTracker

TaskTracker is a task management app built for speed, clarity, and collaboration. It lets you organize work into boards, lists, and cards with smooth drag-and-drop, rich text editing, authentication, and real-world project workflows.

Live demo:
👉 [https://tasktrackerpro.vercel.app/](https://tasktrackerpro.vercel.app/)

---

## Features

* Board, list, and card based task management
* Drag and drop cards and lists
* Rich text editor for task descriptions
* User authentication and session management
* Light and dark theme support
* Responsive design for desktop and mobile
* Form validation with strong type safety
* Scalable backend with Prisma ORM
* Email support for notifications and workflows

---

## Tech Stack

### Frontend

* **Next.js 15** (App Router, Turbopack)
* **React 19**
* **TypeScript**
* **Tailwind CSS**
* **ShadCN** for accessible components
* **Redux Toolkit** for state management
* **dnd-kit** for drag and drop
* **TipTap** rich text editor
* **React Hook Form** + **Zod** for form validation

### Backend & Services

* **NextAuth.js** for authentication
* **Prisma** ORM
* **Supabase** (database / services)
* **Nodemailer** for email handling

### Tooling

* **ESLint**
* **PostCSS**
* **Turbopack**
* **Vercel** for deployment

---

## Project Structure

```
src/
├── app/                # Next.js app router
├── components/         # Reusable UI components
├── components/email/   # Email templates
├── lib/                # Utilities and helpers
├── store/              # Redux store and slices
├── styles/             # Global styles
├── types/              # TypeScript types
├── prisma/             # Prisma schema and migrations
```

---

## Getting Started

### Prerequisites

Make sure you have:

* Node.js 18+
* npm or pnpm
* A database supported by Prisma

---

### Installation

Clone the repository:

```bash
git clone https://github.com/akashgupta157/TaskTracker
cd tasktracker
```

Install dependencies:

```bash
npm install
```

---

### Environment Variables

Create a `.env` file in the root directory and add:

```env
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DIRECT_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email
EMAIL=your_email_address
EMAIL_PASSWORD=your_email_app_password

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

```

---

### Database Setup

Generate Prisma client and apply migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

---

### Run the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

| Script          | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start development server     |
| `npm run build` | Build for production         |
| `npm run start` | Run production server        |
| `npm run lint`  | Run ESLint                   |
| `npm run email` | Run email development server |

---

## Deployment

This project is optimized for **Vercel**.

To deploy:

1. Push the repo to GitHub
2. Import it into Vercel
3. Add environment variables
4. Deploy

The `vercel-build` script ensures Prisma runs correctly during build.

---

## Roadmap

* Team collaboration and shared boards
* Real-time updates
* Activity logs
* File attachments
* Role-based permissions

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Open a pull request

Keep commits clean and focused.

---

## License

This project is licensed under the **MIT License**.

---