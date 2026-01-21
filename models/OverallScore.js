const mongoose = require('mongoose');

const OverallScoreSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  
  email: {
    type: String,
    required: true,
  },
  overallScore: {
    type: String,
    required: true,
  },
  
},{timestamps:true});


module.exports = mongoose.models.OverallScore || mongoose.model('OverallScore', OverallScoreSchema);
