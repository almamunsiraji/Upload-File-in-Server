const express = require("express");
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const fs = require("fs"); // Added for directory creation
const path = require("path"); // Added for path handling
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const port = 8000;

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Connecting to DB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/userTestDB");
    console.log("DB is connected");
  } catch (error) {
    console.log("DB is not connected");
    console.log(error);
    process.exit(1);
  }
};

// Creating schema and Model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, " User name is required"],
  },
  image: {
    type: String,
    required: [true, " User image is required"],
  },
});

const User = mongoose.model("Users", userSchema);

// File upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

app.get("/register", (req, res) => {
  res.status(200).sendFile(__dirname + "/index.html");
});

app.post("/register", upload.single("image"), async (req, res) => {
  try {
    const newUser = new User({
      name: req.body.name,
      image: req.file.filename, // Changed from req.body.filename to req.file.filename
    });
    await newUser.save();
    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/test", (req, res) => {
  res.status(200).send("testing api");
});

app.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`);
  await connectDB();
});
