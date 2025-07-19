# My Personal Blogspot

A modern, responsive, and personalized blog platform built with the MERN stack (MongoDB, Express.js, Node.js) for the backend and EJS with custom CSS for a premium, Material You-inspired frontend. Designed for a single admin user to easily manage and publish blog posts.

---

## ✨ Features

* **Admin Authentication:** Secure login for a single admin user using `bcrypt` for password hashing and `express-session` for session management.
* **Blog Post Management:**
    * Create, view, edit, and delete blog posts through a dedicated admin dashboard.
    * Support for **Markdown** content in posts.
    * Optional **Header Image** upload for posts, displayed as a preview on cards and as a banner on the full post view.
    * Dedicated **Short Description** field for homepage cards for clean previews.
    * Option to add **Author** and **Location** for each post.
* **Public Blog View:**
    * Homepage (`/`) displays all blog posts with a short description, image preview, and basic metadata.
    * Individual post pages (`/posts/:id`) show the full content, header image, and detailed metadata.
* **Engagement & Interactivity:**
    * **Like Button & Count:** Readers can like posts (tracked per session via `localStorage`), and like counts are stored and displayed.
    * **View Count:** Tracks and displays how many times a post has been viewed (once per session per browser).
    * **Share Buttons:** Easy sharing to popular social media platforms (Twitter, Facebook, LinkedIn, WhatsApp, Email) and a "Copy Link" option.
* **Search Functionality:** Quickly find blog posts by title using a search bar in the navigation.
* **Pagination:** Displays 5 blog posts per page on the homepage, with "Next" and "Previous" navigation.
* **Responsive & Modern UI:**
    * Material You-inspired design with a clean, professional aesthetic.
    * **Dark and Light Mode** support with user preference saved.
    * Custom CSS, Google Fonts, and Bootstrap Icons for a polished look.
    * Custom, purely CSS-driven responsive navigation bar for seamless mobile experience.
* **Dedicated About Me Page:** A static page (`/about`) to share information about the blog creator.

---

## 🛠️ Technologies Used

**Backend:**
* **Node.js:** JavaScript runtime.
* **Express.js:** Web application framework for Node.js.
* **MongoDB:** NoSQL database for data storage.
* **Mongoose:** ODM (Object Data Modeling) for MongoDB, simplifying data interactions.
* **Bcrypt.js:** For hashing and salting passwords securely.
* **Express-session:** Middleware for managing user sessions.
* **Multer:** Middleware for handling `multipart/form-data`, primarily for file uploads.
* **Connect-flash:** For displaying flash messages (e.g., success/error notifications).
* **Method-override:** Allows using `PUT` and `DELETE` HTTP methods in forms where the browser only supports `GET` and `POST`.
* **Dotenv:** Loads environment variables from a `.env` file.

**Frontend:**
* **EJS (Embedded JavaScript):** Templating engine for dynamic HTML rendering.
* **Bootstrap 5:** Frontend framework for responsive design and UI components.
* **Custom CSS:** Extensive custom styling for a unique, premium look.
* **Google Fonts:** `Inter` (body) and `Playfair Display` (headings) for enhanced typography.
* **Bootstrap Icons:** For a wide range of icons.
* **Marked.js:** A Markdown parser used on the server-side to convert Markdown content to HTML.

---

## 🚀 Getting Started

Follow these steps to get your blog platform up and running locally.

### Prerequisites

* Node.js (LTS version recommended)
* npm (Node Package Manager, comes with Node.js)
* MongoDB (Community Edition or MongoDB Atlas account)

### Installation

1.  **Clone the repository (or download the code):**
    ```bash
    git clone [https://github.com/codedbysoumyajit/personal-blogspot.git](https://github.com/codedbysoumyajit/personal-blogspot.git)
    cd personal-blogspot
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    In the root directory of your project, create a file named `.env` and add the following:
    ```
    MONGO_URI=mongodb://localhost:27017/personalblogdb
    SESSION_SECRET=a_very_long_and_random_string_for_session_secret_123abc456def
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=your_secure_admin_password
    ```
    * **`MONGO_URI`**: Your MongoDB connection string. If using local MongoDB, the provided one works. For MongoDB Atlas, get your connection string from their dashboard.
    * **`SESSION_SECRET`**: A long, random string for securing your Express sessions. **Generate a strong one!**
    * **`ADMIN_USERNAME`**: The username for your blog's admin account.
    * **`ADMIN_PASSWORD`**: The password for your admin account. **Choose a strong password!**

4.  **Create the uploads directory:**
    This directory will store your uploaded header images.
    ```bash
    mkdir public/uploads
    ```

### Running the Application

1.  **Start your MongoDB server:**
    If running locally, ensure your MongoDB instance is active. If using MongoDB Atlas, no local action is needed.

2.  **Start the Node.js application:**
    ```bash
    npm start
    ```
    For development with automatic restarts on file changes, you can use `nodemon`:
    ```bash
    npm install -g nodemon # If you don't have nodemon installed globally
    npm run dev
    ```

3.  **Access the application:**
    Open your web browser and navigate to:
    ```
    http://localhost:3000
    ```

---

## 🔑 Admin Access

On the first successful run, if no admin user exists in the database, a default admin user will be created using the `ADMIN_USERNAME` and `ADMIN_PASSWORD` specified in your `.env` file.

To log in:
1.  Go to `http://localhost:3000/auth/login`
2.  Enter the `ADMIN_USERNAME` and `ADMIN_PASSWORD` from your `.env` file.
3.  You will be redirected to the admin dashboard (`/admin/dashboard`) where you can manage posts.

---

## 📝 Usage

### For Blog Visitors:

* **View Posts:** Browse the homepage (`/`) for the latest posts. Use pagination to navigate through older posts.
* **Search:** Use the search bar in the navbar to find posts by title.
* **Read Full Post:** Click "Read More" or the post title on a card to view the full content.
* **Like Posts:** Click the heart icon on any post to show your appreciation (tracked per browser session).
* **Share Posts:** On individual post pages, use the share buttons to easily share the content.
* **About Me:** Visit the `/about` page to learn more about the blog author.

### For Admin User:

* **Login:** Access the admin login page via the "Admin Login" link in the navbar or directly at `/auth/login`.
* **Admin Dashboard:** After logging in, you'll be taken to `/admin/dashboard` where you can:
    * See a list of all posts.
    * **Create New Post:** Click "Create New Post" to add a new entry. Remember to fill in Title, Description, Content, Author, and optionally Location and a Header Image.
    * **Edit Post:** Click the "Edit" button next to any post to modify its details. You can update the image, content, description, author, or location.
    * **Delete Post:** Click the "Delete" button to remove a post. (This also deletes the associated header image file from the server).

---

## 🤝 Contributing

This project is primarily designed as a personal blog platform. However, if you have suggestions for improvements or encounter bugs, feel free to open an issue!

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
*(You would typically create a `LICENSE` file in the root with the MIT license text.)*

---
