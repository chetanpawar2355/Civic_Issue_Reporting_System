# 🏙️ SheherSetu – Civic Issue Reporting System

**SheherSetu** is a full-stack web application designed to bridge the gap between citizens and local authorities by making civic issue reporting, tracking, and resolution more transparent and efficient.

Citizens can report civic problems, employees can manage assigned issues, and administrators can oversee the complete issue resolution workflow.

## 🌟 Key Features

- **User Authentication:** Secure authentication using Passport.js.
- **Civic Issue Reporting:** Submit civic complaints with relevant details and images.
- **Role-Based Access:** Separate workflows for Users, Employees, and Administrators.
- **Issue Assignment:** Administrators can assign reported issues to employees.
- **Status Tracking:** Track issues throughout their resolution lifecycle.
- **Image Uploads:** Cloudinary integration for storing and managing issue images.
- **Resolution Verification:** Employees submit resolution evidence before an issue moves to review.
- **Database Integration:** MongoDB for managing users, complaints, assignments, and issue statuses.
- **MVC Architecture:** Organized application structure for maintainability and scalability.

## 👥 User Roles

| Role | Responsibilities |
|---|---|
| User | Report civic issues and track their progress |
| Employee | Manage assigned issues and submit resolution evidence |
| Admin | Manage reported issues, assign employees, and oversee resolution |

## 🔄 Issue Lifecycle

The application follows a structured issue management workflow:

**Pending → Assigned → In Progress → Pending Review → Resolved**

1. **Pending:** A newly reported issue awaits assignment.
2. **Assigned:** The administrator assigns the issue to an employee.
3. **In Progress:** The assigned employee works on the issue.
4. **Pending Review:** Resolution evidence is submitted for review.
5. **Resolved:** The issue is marked resolved after the review process.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | HTML, CSS, JavaScript, EJS, Bootstrap |
| Backend | Node.js, Express.js |
| Database | MongoDB, MongoDB Atlas |
| Authentication | Passport.js |
| Image Storage | Cloudinary |
| Architecture | Model-View-Controller (MVC) |
| Deployment | Vercel |
| Development Tools | Git, GitHub, VS Code |

## 🏗️ Architecture

SheherSetu follows the MVC architecture to separate application responsibilities:

- **Model:** Manages database schemas and data operations.
- **View:** Renders user interfaces using EJS templates.
- **Controller:** Handles application logic, requests, and issue workflows.
- **Routes:** Define application endpoints and connect them to controllers.
- **Middleware:** Supports authentication, authorization, and request processing.

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm
- A MongoDB database or MongoDB Atlas account
- A Cloudinary account

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/chetanpawar2355/Civic_Issue_Reporting_System.git
```

**2. Navigate to the project directory**

```bash
cd Civic_Issue_Reporting_System
```

**3. Install dependencies**

```bash
npm install
```

**4. Configure environment variables**

Create a `.env` file in the project root and add the configuration required by your application.

```env
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Add any other variables required by your existing application, such as OAuth credentials if Google authentication is configured.

**Important:** Use the exact environment variable names expected by your source code. Never commit real credentials, API secrets, or database passwords to GitHub.

**5. Start the application**

```bash
npm start
```

If your project uses a different start script, run the command defined in your `package.json`.

Open the local URL configured by your application in your browser.

## 📸 Screenshots

**1. Home page:**

<img width="1886" height="850" alt="image" src="https://github.com/user-attachments/assets/5c784de7-91e1-44b7-8f1c-a929ab1eeb00" />
<img width="1895" height="830" alt="image" src="https://github.com/user-attachments/assets/8fa8fde3-fbe9-492b-97a0-c971350111ca" />
<img width="1887" height="760" alt="image" src="https://github.com/user-attachments/assets/23600c62-de3e-4dba-8471-3dc0aa76a9c1" />

**2. User dashboard:**

<img width="1892" height="673" alt="image" src="https://github.com/user-attachments/assets/1590fd8c-b7c5-4c7b-a0d5-983ce6ab076c" />

**3. Report issue page:**

<img width="1891" height="860" alt="image" src="https://github.com/user-attachments/assets/2b867b4b-1aa4-4377-9119-92fce6427db8" />

**4. Issue details and status tracking:**

<img width="1895" height="822" alt="image" src="https://github.com/user-attachments/assets/7d65befc-3184-459b-b846-cc786ccbd6b0" />
<img width="1893" height="666" alt="image" src="https://github.com/user-attachments/assets/9f72414a-1696-40ff-995d-890fabdd1adf" />
<img width="1892" height="857" alt="image" src="https://github.com/user-attachments/assets/c5cb3360-ece9-428a-ba75-3b2f8f6ea3cb" />

**5. Employee dashboard:**

<img width="1890" height="857" alt="image" src="https://github.com/user-attachments/assets/386fd30f-2f00-4e78-ab12-9482e76996e3" />

**6. Admin dashboard:**

<img width="1890" height="852" alt="image" src="https://github.com/user-attachments/assets/69d90eb6-4190-47f2-a6a2-578e40e1bf14" />

## 🚀 Future Enhancements

- Real-time notifications for issue status updates.
- Interactive maps for better visualization of civic issues.
- Analytics dashboard for monitoring issue resolution trends.
- Improved search and filtering for reported complaints.
- Enhanced accessibility and mobile responsiveness.

## 🎯 Project Objective

SheherSetu aims to simplify civic issue reporting through a centralized digital platform that improves accountability, streamlines complaint management, and provides visibility into the issue resolution process.

This project demonstrates practical implementation of full-stack web development, RESTful application workflows, database integration, authentication, role-based authorization, and cloud-based image storage.

## 👨‍💻 Author

**Chetan Pawar**

- GitHub: [chetanpawar2355](https://github.com/chetanpawar2355)
- Project Repository: [Civic Issue Reporting System](https://github.com/chetanpawar2355/Civic_Issue_Reporting_System)

---

*Built to make civic issue reporting and resolution more transparent and accessible.*
