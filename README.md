# LinkBoard 🔗

A full-stack personal resource organizer where users can save, organize, and manage useful links into custom collections.

## Features

- 🔐 Secure user authentication (signup/login) with hashed passwords
- 📁 Create, edit, and delete collections
- 🔗 Add, edit, and delete links inside each collection
- 🔍 Live search and filtering of saved links
- 🔒 Each user's data is private and isolated from other users
- 🎨 Custom dark-themed, animated, responsive UI

## Tech Stack

**Frontend:** HTML5, CSS3, JavaScript (Fetch API)
**Backend:** Node.js, Express.js, JWT, bcrypt.js
**Database:** MongoDB Atlas, Mongoose

## Getting Started

1. Clone the repository
2. Run `npm install` inside the `backend` folder
3. Create a `.env` file in `backend` with:




MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000

4. Run `node server.js` inside `backend`
5. Open `frontend/index.html` with Live Server (or any local server)

## Author

Built by Haris Khan as a final bootcamp project.