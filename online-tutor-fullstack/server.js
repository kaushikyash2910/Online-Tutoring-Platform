require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(new Date().toISOString(), '→', req.method, req.url, 'body:', req.body || '');
  next();
});

app.use("/public", express.static(path.join(__dirname, "public")));


mongoose
  .connect("mongodb://127.0.0.1:27017/quicktutor", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));


const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true, trim: true },
  name: String,
  email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  password: String,
  role: { type: String, default: "user" },
});

const User = mongoose.model("User", userSchema);


const courseSchema = new mongoose.Schema({
  title: String,
  tag: String,
  duration: String,
  price: String,
  tutor: String,
  desc: String,
  createdAt: { type: Date, default: Date.now },
});

const Course = mongoose.model("Course", courseSchema);


function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_jwt_secret_change_me");
    req.user = decoded; 
    next();
  } catch (err) {
    console.warn("Auth verify error:", err && err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
}


app.post("/signup", async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body;

    const exists = await User.findOne({
      $or: [
        ...(email ? [{ email: String(email).trim().toLowerCase() }] : []),
        ...(username ? [{ username: String(username).trim() }] : []),
      ],
    });
    if (exists)
      return res.status(409).json({ message: "Email or username already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      username: username ? String(username).trim() : undefined,
      name,
      email: email ? String(email).trim().toLowerCase() : undefined,
      password: hashed,
      role: role || "user",
    });

    await user.save();

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Email or username already registered (index conflict)" });
    }
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/login", async (req, res) => {
  try {
    console.log('POST /login body:', req.body);
    const { email, password, username } = req.body;

   
    const lookup = email || username;
    if (!lookup || !password) {
      return res.status(400).json({ message: "email (or username) and password required" });
    }

   
    const user = await User.findOne({
      $or: [
        { email: lookup },
        { username: lookup }
      ]
    });

    console.log('found user:', !!user, user ? { email: user.email, username: user.username, name: user.name } : null);

    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const payload = { id: user._id.toString(), role: user.role, name: user.name, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "dev_jwt_secret_change_me", { expiresIn: "7d" });

    return res.json({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email, role: user.role, username: user.username }
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

app.get("/courses", async (req, res) => {
  const list = await Course.find().sort({ createdAt: -1 });
  res.json(list);
});

app.post("/courses", auth, adminOnly, async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.json({ message: "Course added", course: newCourse });
  } catch (err) {
    console.error("Course creation error:", err);
    res.status(500).json({ message: "Course creation failed" });
  }
});

app.put("/courses/:id", auth, adminOnly, async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    console.error("Course update error:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

app.delete("/courses/:id", auth, adminOnly, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Course delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

app.post("/api/auth/signup", (req, res) => res.redirect(307, "/signup"));
app.post("/api/auth/login", (req, res) => res.redirect(307, "/login"));
app.get("/api/auth/me", (req, res) => res.redirect(307, "/me"));
app.post("/api/auth/logout", (req, res) => res.json({ ok: true }));

app.get("/api/courses", (req, res) => res.redirect(307, "/courses"));
app.post("/api/courses", (req, res) => res.redirect(307, "/courses"));
app.put("/api/courses/:id", (req, res) => res.redirect(307, `/courses/${req.params.id}`));
app.delete("/api/courses/:id", (req, res) => res.redirect(307, `/courses/${req.params.id}`));

app.get("/api/allCourses", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching courses" });
  }
});

app.get("/createDefaultAdmin", async (req, res) => {
  const existing = await User.findOne({ username: "admin" });
  if (existing) return res.status(400).json({ message: "Admin already exists" });

  const hashed = await bcrypt.hash("admin123", 10);

  const admin = new User({
    username: "admin",
    email: "admin@example.com",
    password: hashed,
    role: "admin"
  });

  await admin.save();
  res.json({ message: "✅ Default admin created" });
});

app.post('/logout', (req,res)=>{
 
  res.json({ ok:true });
});

app.get("/", (req, res) => {
  res.redirect("/public/index.html");
});

app.listen(4000, () =>
  console.log(`🚀 Server running at http://localhost:4000`)
);
