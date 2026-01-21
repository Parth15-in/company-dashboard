//models/InterviewJobRole.js
const mongoose = require('mongoose');

const InterviewJobRoleSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
 
  level: {
    type: String,
    required: true,
  },
  questions: [
    {
      questionText: {
        type: String,
        required: true,
      },
      answer: {
        type: String,
        default: null,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.models.InterviewJobRole || mongoose.model('InterviewJobRole', InterviewJobRoleSchema);
