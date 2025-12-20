# E-Learning Platform Frontend

This is the React 18 frontend for the E-Learning Platform, built with Vite and Tailwind CSS.

## Features

- **Role-Based Access**: Specialized dashboards for Students, Instructors, and Admins.
- **Authentication**: Secure Login and Signup with JWT handling.
- **Modern UI**: Polished interface using Tailwind CSS, matching the Figma design system.
- **Routing**: Protected and Role-Based routes to ensure security.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router DOM v6
- Axios
- Lucide React (Icons)

## Setup Instructions

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file in the root directory if you need to override the API URL:
    ```env
    VITE_API_BASE_URL=http://localhost:5000/api
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```

## Project Structure

- `src/api`: API integration and Axios setup.
- `src/components`: Reusable UI components.
- `src/context`: React Context Providers (Auth, etc.).
- `src/pages`: Main application pages.
- `src/routes`: Routing configuration and guards.
