const mongoose = require("mongoose");

const browseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
    required: true,
  },
});

const Browse = mongoose.model("Browse", browseSchema);

module.exports = Browse;









// is code se hum direct path deke bhi image le skate h 




// const mongoose = require("mongoose");

// const browseSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   location: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
//   image: {
//     type: String,
//     required: true,
//   },
// });

// const Browse = mongoose.model("Browse", browseSchema);

// module.exports = Browse;
