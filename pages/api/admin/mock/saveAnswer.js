// // import JobRole from '/models/jobRole';

// // export async function handler(req, res) {
// //   const { email } = req.query;

// //   if (!email) {
// //     return res.status(400).json({ message: 'Email parameter is required' });
// //   }

// //   try {
// //     // Attempt to find the job role by email
// //     const jobRole = await JobRole.findOne({ email });

// //     if (!jobRole) {
// //       return res.status(404).json({ message: 'Job role not found' });
// //     }

// //     const questions = jobRole.questions
// //       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
// //       .map(q => ({
// //         questionText: q.questionText,
// //         answer: q.answer || '', // Provide an empty string if the answer is null
// //       }));

// //     return res.status(200).json(questions);
// //   } catch (error) {
// //     console.error('Error fetching questions:', error); // Log the actual error
// //     return res.status(500).json({ message: 'Server error', error: error.message });
// //   }
// // }

// // export default handler;


// import JobRole from '/models/jobRole';

// export async function handler(req, res) {
//   const { email } = req.query;

//   if (!email) {
//     return res.status(400).json({ message: 'Email parameter is required' });
//   }

//   // Handle GET request (fetch questions)
//   if (req.method === 'GET') {
//     try {
//       // Attempt to find the job role by email
//       const jobRole = await JobRole.findOne({ email });

//       if (!jobRole) {
//         return res.status(404).json({ message: 'Job role not found' });
//       }

//       const questions = jobRole.questions
//         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//         .map(q => ({
//           questionText: q.questionText,
//           answer: q.answer || '', // Provide an empty string if the answer is null
//         }));

//       return res.status(200).json(questions);
//     } catch (error) {
//       console.error('Error fetching questions:', error); // Log the actual error
//       return res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   }

//   // Handle PUT request (update answer)
//   if (req.method === 'PUT') {
//     const { questionText, answer } = req.body;

//     if (!questionText || answer === undefined) {
//       return res.status(400).json({ message: 'Both questionText and answer are required' });
//     }

//     try {
//       // Attempt to find the job role by email
//       const jobRole = await JobRole.findOne({ email });

//       if (!jobRole) {
//         return res.status(404).json({ message: 'Job role not found' });
//       }

//       // Find the question to update
//       const questionIndex = jobRole.questions.findIndex(q => q.questionText === questionText);

//       if (questionIndex === -1) {
//         return res.status(404).json({ message: 'Question not found' });
//       }

//       // Update the answer
//       jobRole.questions[questionIndex].answer = answer;

//       // Save the updated job role
//       await jobRole.save();

//       return res.status(200).json({ message: 'Answer updated successfully' });
//     } catch (error) {
//       console.error('Error updating answer:', error); // Log the actual error
//       return res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   }

//   // If the method is not GET or PUT
//   return res.status(405).json({ message: 'Method Not Allowed' });
// }

// export default handler;


// import JobRole from '/models/jobRole';

// // Save answer API
// export async function handler(req, res) {
//   if (req.method === 'PUT') {
//     const { email, questionId, answer } = req.body;
//     if (!email || !questionId || answer === undefined) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }
//     try {
//       // Find the job role by email and update the answer for the specific questionId
//       const jobRole = await JobRole.findOne({ email });
//       if (!jobRole) {
//         return res.status(404).json({ message: 'Job role not found' });
//       }

//       // Update the specific question by questionId
//       const question = jobRole.questions.find(q => q._id.toString() === questionId);
//       if (!question) {
//         return res.status(404).json({ message: 'Question not found' });
//       }

//       question.answer = answer; // Update answer
//       await jobRole.save(); // Save the updated job role

//       return res.status(200).json({ message: 'Answer saved successfully' });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: 'Internal server error' });
//     }
//   } else {
//     return res.status(405).json({ message: 'Method Not Allowed' });
//   }
// }

// export default handler;
import JobRole from '../../../../models/JobRole';
import connectDb from '../../../../lib/db';
// import { ObjectId } from 'mongodb'; // Import ObjectId for comparison

// Save answer API
export async function handler(req, res) {
  if (req.method === 'PUT') {
    await connectDb()
    const {_id, email, questionId, answer } = req.body;

    // Validate request body
    if (!email || !questionId || answer === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      // Find the job role by email
      const jobRole = await JobRole.findOne({ email,_id });

      // If job role not found
      if (!jobRole) {
        return res.status(404).json({ message: 'Job role not found' });
      }

      // Log jobRole and questionId for debugging
      // console.log('Job role found:', jobRole);
      // console.log('Question ID to find:', questionId);

      // Find the specific question by its _id (convert to string or ObjectId if necessary)
      const question = jobRole.questions.find(q => q._id.toString() === String(questionId));

      // If question not found, log the available questions and provide more detailed message
      if (!question) {
        console.log('Available question IDs:', jobRole.questions.map(q => q._id.toString()));
        return res.status(404).json({ message: `Question with ID ${questionId} not found. Available questions: ${jobRole.questions.map(q => q._id.toString()).join(', ')}` });
      }

      // Update the answer of the found question
      question.answer = answer;

      // Save the updated job role
      await jobRole.save();

      return res.status(200).json({ message: 'Answer saved successfully' });
    } catch (error) {
      // Log error and return server error response
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    // If the method is not PUT, return Method Not Allowed
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}

export default handler;
