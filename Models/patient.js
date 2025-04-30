const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email:{
    type: String,
    required:true,
  },
  password:{
    type:String
  },
  age: {
    type: Number,
    required: true,
    min: 0
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"]
  },
  address: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  role:{
    type:String,
    enum:['Patient'],
    default: 'Patient'
  },
  isApproved: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  }, 
}, {
  timestamps: true
});

module.exports = mongoose.model("Patient", patientSchema);
