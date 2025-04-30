const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email:{
    type: String,
    required:true,
  },
  password:{
    type:String
  },
  specialised: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  isApproved: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },  
  role: { type: String, enum: [ 'Doctor'], default: 'Patient' },

}, {
  timestamps: true 
});

module.exports = mongoose.model("doctor", doctorSchema);
