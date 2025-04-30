const express = require("express");
// import mongoose from "mongoose";
const cors = require("cors");
const connectDB = require("./dataBase");
const bcrypt = require('bcryptjs');
const User = require("./Models/User");
const Doctor = require("./Models/doctors"); 
const Patient = require("./Models/patient");
const Browse = require("./Models/browse");
const upload = require("./config/multer");
const jwt = require("jsonwebtoken");
// import bodyParser from " body-parser";




require("dotenv").config();

const app = express();


connectDB();


app.use(cors({
    origin: ["http://localhost:5173","https://68126eeec63b0252dc555593--apnadoctor.netlify.app/"],
    credentials: true,
}));
app.use(express.json());



app.post('/signupdoc', async (req, res, next) => {
  try {
    const { name, email, password, phone, address,specialised, role } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await Doctor({
      name,
      email,
      password: hashedPassword,
      phone,
      specialised,
      address,
      role,
      isApproved: "Pending", 
    });
    await newUser.save()

    res.status(201).json({
      message: "Account created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isApproved: newUser.isApproved,
      }
    });
    
  } catch (error) {
    next(error);
  }
});


    app.get('/doc/pending', async (req, res) => {
      try {
        const pendingDoctors = await Doctor.find({ isApproved: false });
        res.json(pendingDoctors);
      } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
      }
    });
    


// Assuming you're using a single User model with `role` and `isApproved` fields

app.get("/doctor/pending-users", async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ role: "Doctor", isApproved: 'Pending' });
    res.status(200).json(pendingDoctors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending users", error: err.message });
  }
});




// const ADMIN_EMAIL = "sunnysangwan318@gmail.com";
// const ADMIN_PASSWORD = "1234"; 

// app.post("/admin/login", (req, res) => {
//   const { email, password } = req.body;

//   if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
//     return res.status(200).json({ message: "Admin login successful" });
//   }

//   return res.status(401).json({ message: "Invalid credentials" });
// });




app.put('/admin/approve-user/:userId', async (req, res) => {
  try {
    const id= req.params.userId;    
    const user = await Doctor.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isApproved = 'Accepted';
    await user.save();

    res.status(200).json({ message: "User approved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error approving user", error: err.message });
  }
});

app.put('/admin/reject-user/:userId', async (req, res) => {
  try {
    const user = await Doctor.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isApproved = 'Rejected';
    await user.save();

    res.status(200).json({ message: "User rejected successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting user", error: err.message });
  }
});


app.get('/allDoctors', async(req,res)=>{
  try {
    const user = await Doctor.find({ role: "Doctor" });
    res.status(200).json(user);
    
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending users", error: err.message });
  }
})




// Admin login Route

app.post("/login/user", async (req, res) => { 
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
  

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.role === "Admin") {
      return res.status(403).json({ message: "Permission Denied" });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});


// Doctor Login Route

app.post("/login/doctor", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Include password explicitly if it's excluded in schema
    const user = await Doctor.findOne({ email });
    console.log(user);
    

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role !== 'Doctor') {
      return res.status(403).json({ message: "Access denied for non-doctor users" });
    }

    if (user.isApproved !== 'Accepted') {
      return res.status(403).json({ message: "Account not approved yet" });
    }

    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});



app.post('/login/patient', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Patient.findOne({ email });
    if (!user) return res.status(404).json({ message: "Patient not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email:email}, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// POST: Patient Signup (auto-approved)
app.post('/signup/patient', async (req, res, next) => {
  try {
    const { name, email, password, age, gender, address, contact, role } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new Patient({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      address,
      contact,
      role,
      isApproved: "Approved",
    });

    await newUser.save();

    res.status(201).json({
      message: "Account created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isApproved: newUser.isApproved,
      }
    });

  } catch (error) {
    next(error);
  }
});

// ✅ GET: Fetch All Approved Patients (placed OUTSIDE the POST route)
app.get('/patients/approved', async (req, res) => {
  try {
    const approvedPatients = await Patient.find({ isApproved: "Approved" });
    res.status(200).json(approvedPatients);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});







app.post("/doctorsData", async (req, res) => {
    try {
        const doctors = await Doctor.insertMany(req.body);
        res.status(201).json({ message: "Doctors inserted successfully", doctors });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get("/doctorsData", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json({ message: "Doctors fetched successfully", doctors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


  
  

app.post("/patientsData", async (req, res) => {
  try {
    const patients = await Patient.insertMany(req.body);
    res.status(201).json({ message: "Patients inserted successfully", patients });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/patientsData", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patients", details: err.message });
  }
});


app.post("/browseData", upload.single('banner'), async (req, res) => {
  try {
    const { name, location, description } = req.body;
    const banner = req.file.path;

    const newHospital = new Browse({
      name,
      location,
      description,
      banner,
    });

    await newHospital.save();

    res.status(201).json({ message: "Hospital inserted successfully", hospital: newHospital });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});






// app.post("/browseData", async (req, res) => {
//   try {
//       const hospitals = await Browse.insertMany(req.body);
//       res.status(201).json({ message: "Hospitals inserted successfully", hospitals });
//   } catch (err) {
//       res.status(400).json({ error: err.message });
//   }
// });


app.get("/browseData", async (req, res) => {
  try {
      const hospitals = await Browse.find();
      res.json({ hospitals });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});




app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
