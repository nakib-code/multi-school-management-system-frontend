# Multi-School Management System — Frontend

A modern, responsive frontend for managing multiple schools from one platform. The application provides dashboards and management features for super admins, school admins, teachers, students, guardians, and other users.

## 📌 Project Overview

The Multi-School Management System helps schools manage their daily activities through a centralized web application.

The frontend connects to the backend API to handle authentication, school management, user management, admissions, payments, reports, and other school-related operations.

## ✨ Features

### Authentication & Authorization

* User authentication and session management
* Role-based access control
* Protected dashboard routes
* Role-specific navigation and dashboards

### Super Admin Dashboard

* Dashboard overview and statistics
* School registration management
* School approval and rejection
* School details and status management
* School user management
* Reports and audit logs
* Profile and settings management

### School Management

* View and manage schools
* Search and filter schools
* View school details and user summaries
* Manage school status and registration information

### User Management

* Manage administrators, managers, teachers, students, and guardians
* Search and filter users
* View user status and account information
* Pagination for user lists

### Student Admission

* Public admission form
* Student and guardian information
* Academic information and class selection
* Email OTP verification
* Online and cash payment options
* Separate admission payment page

### Payment

* Admission fee display
* Online payment gateway integration
* Payment initiation and redirection
* Payment status and error handling

> Payment availability depends on the backend configuration and API response. Email verification must be completed before proceeding to payment.

### User Experience

* Responsive design for desktop, tablet, and mobile
* Loading and error states
* Form validation
* Toast notifications
* Search, filtering, and pagination

## 🛠️ Technology Stack

* **Framework:** Next.js (App Router)
* **Library:** React
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui and Base UI
* **Data Fetching:** TanStack Query
* **Forms:** React Hook Form
* **Validation:** Zod
* **Icons:** Lucide React
* **Notifications:** Sonner
* **Animations:** Framer Motion
* **Theme:** next-themes

## 📋 Requirements

Make sure you have installed:

* Node.js
* npm or pnpm
* Git
* A running backend API

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_FRONTEND_REPOSITORY_URL>
```

### 2. Navigate to the Frontend Directory

```bash
cd <YOUR_FRONTEND_DIRECTORY>
```

If the repository contains only the frontend, run the commands directly inside the cloned project directory.

### 3. Install Dependencies

Using pnpm:

```bash
pnpm install
```

Or using npm:

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the frontend root directory.

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
```

Replace the example URL with your actual backend API base URL.

For production, use your deployed backend API URL.

**Important:** The environment variable name must match the one used by your frontend API client. If your project uses a different variable name, update this example accordingly.

Never put secret API keys, database credentials, JWT secrets, or payment gateway private credentials in a `NEXT_PUBLIC_` variable.

### 5. Start the Development Server

Using pnpm:

```bash
pnpm dev
```

Or using npm:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 📜 Available Scripts

The following are common Next.js commands. Check `package.json` for the exact scripts configured in this project.

| Command            | Description                                |
| ------------------ | ------------------------------------------ |
| `pnpm dev`         | Start the development server               |
| `pnpm build`       | Build the production application           |
| `pnpm start`       | Start the production server                |
| `pnpm lint`        | Run linting if a lint script is configured |
| `npx tsc --noEmit` | Check TypeScript errors                    |

If you use npm, replace `pnpm` with `npm run` where appropriate. The TypeScript command can be run directly with `npx`.

## 📁 Project Structure

The following is a high-level overview. Actual filenames may vary as the project develops.

```text
frontend/
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── super-admin/
│   │   └── admissions/
│   │       └── payment/
│   ├── components/
│   │   ├── admissions/
│   │   ├── layout/
│   │   └── ui/
│   ├── features/
│   │   ├── admissions/
│   │   ├── public/
│   │   └── super-admin/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Directory Responsibilities

* `src/app/` — Pages, layouts, and route definitions.
* `src/components/` — Reusable UI components.
* `src/features/` — Feature-specific APIs, hooks, types, and business UI.
* `src/hooks/` — Shared React hooks.
* `src/lib/` — Shared utilities and configuration.
* `src/types/` — Shared TypeScript types.
* `public/` — Static assets such as images and icons.

## 🔌 Backend API Integration

The frontend communicates with the backend through HTTP API requests.

The backend is responsible for:

* Authentication and authorization
* Database operations
* School and user management
* Admission creation and email verification
* Admission fee configuration
* Payment initiation and verification
* Business rules and access permissions

The frontend is responsible for:

* Displaying data from API responses
* Collecting and validating form input
* Managing loading, success, and error states
* Sending API requests
* Navigating between pages

The frontend must not be treated as the only security layer. Protected operations must also be validated by the backend.

## 🔐 Admission and Payment Flow

The admission process follows these steps:

1. The applicant completes the admission form.
2. The frontend submits the application to the backend.
3. The applicant receives an email OTP.
4. The applicant verifies the email.
5. After successful verification, the applicant can proceed with the selected payment method.
6. For online payment, the frontend opens the separate payment page and requests payment initiation from the backend.
7. The backend validates the application, verification status, and fee configuration before initiating payment.

For cash payment, the frontend displays the appropriate confirmation after successful verification.

## 🧪 Testing and Quality Checks

Before deploying, check the following:

* Authentication and protected routes
* Role-based dashboard access
* School listing, filtering, and pagination
* User listing and search
* Admission form validation
* Email OTP verification
* Online and cash payment flows
* API loading and error states
* Responsive layouts
* TypeScript and production build

Run the production build:

```bash
pnpm build
```

Fix any build errors before deploying.

## 🌐 Deployment

This project can be deployed to platforms that support Next.js, such as Vercel.

### Deployment Steps

1. Push the frontend code to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables.
4. Set the correct production backend API URL.
5. Deploy the application.
6. Test authentication, API requests, admissions, and payment flows on the deployed website.

Make sure the backend allows requests from the deployed frontend origin through its CORS configuration.

## 🔒 Security Notes

* Never commit `.env.local` or other files containing secrets.
* Never expose private backend or payment gateway credentials.
* Keep protected operations secured on the backend.
* Validate user permissions on the backend, not only in the UI.
* Require successful email verification before allowing payment initiation.
* Do not rely on frontend validation alone for payment security.

## 👨‍💻 Development Notes

* Use TypeScript for type safety.
* Keep reusable components inside the appropriate component directories.
* Organize feature-specific API functions, hooks, and types by feature.
* Use consistent loading, empty, and error states.
* Test API integrations before merging changes.
* Keep environment-specific configuration outside the source code.

## 📄 License

Add the project's license information here if a license has been selected.

---

**Multi-School Management System — Frontend**

Built with Next.js, React, TypeScript, and Tailwind CSS.
