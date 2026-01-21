// // export const getApiResponseReport = async (reportData) => {
// //     const url = "http://139.59.42.156:11434/api/generate";
// //     const headers = {
// //       "Content-Type": "application/json"
// //     };
// //     const data = {
// //       model: "gemma:2b",
// //       prompt: `Generate a report focusing on the following areas: technical proficiency, communication, decision-making, confidence, and language fluency. Evaluate the user’s responses to the provided questions based on the report data: ${reportData}. After the evaluation, provide a detailed analysis of the strengths and weaknesses in each of these areas. Additionally, include relevant YouTube links for each area to support further improvement and study.`,
// //       stream: false
// //     };
  
// //     try {
// //       const response = await fetch(url, {
// //         method: "POST",
// //         headers: headers,
// //         body: JSON.stringify(data),
// //       });
  
// //       if (response.ok) {
// //         const responseData = await response.json();
// //         return responseData.response; // Return the response from the API
// //       } else {
// //         console.error("Error fetching response from the API.");
// //         return null;
// //       }
// //     } catch (error) {
// //       console.error("Error in the fetch operation:", error);
// //       return null;
// //     }
// //   };


// export const getApiResponseReport = async (reportData) => {
//     const url = "http://139.59.42.156:11434/api/generate";
//     const headers = {
//       "Content-Type": "application/json"
//     };
  
//     // Prepare the answers for API evaluation
//     const questionsWithAnswers = reportData.questions?.map((question, index) => {
//       return {
//         questionText: question.questionText,
//         answer: question.answer || 'No answer provided'
//       };
//     });
  
//     // Prepare the data object for the API
//     const data = {
//       model: "gemma:2b",
//       prompt: `Please generate a report that focuses on the following areas: technical proficiency, communication, decision-making, confidence, and language fluency. Evaluate and compare the original answer with the response provided, and ask the model to rate the user's answers to the provided questions on a scale of 0 to 10 based on the data: ${JSON.stringify(questionsWithAnswers, null, 2)}. After the evaluation, provide a detailed analysis of each area. Additionally, include relevant YouTube links for each area to help with further improvement and study. and provide one report not question wise and negitive 60% negitive review`,
//       stream: false
//     };
  
//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify(data),
//       });
  
//       if (response.ok) {
//         const responseData = await response.json();
//         return responseData.response; // Return the response from the API
//       } else {
//         console.error("Error fetching response from the API.");
//         return null;
//       }
//     } catch (error) {
//       console.error("Error in the fetch operation:", error);
//       return null;
//     }
//   };


// export const getApiResponseReport = async (reportData) => {
//     const url = "http://139.59.42.156:11434/api/generate";  // Consider passing URL dynamically
//     const headers = {
//       "Content-Type": "application/json"
//     };

//     // Validate if reportData has questions
//     if (!reportData || !Array.isArray(reportData.questions)) {
//         console.error("Invalid reportData structure or missing questions.");
//         return null;
//     }

//     // Prepare the answers for API evaluation
//     const questionsWithAnswers = reportData.questions.map((question) => {
//       return {
//         questionText: question.questionText || 'No question provided',
//         answer: question.answer || 'No answer provided'
//       };
//     });

//     // Prepare the data object for the API
//     const data = {
//       model: "llama3:latest",
//       prompt: `Please generate a report that focuses on the following areas: a scale of 0 to 10 for technical proficiency, communication, decision-making, confidence, and language fluency. Evaluate and compare the original answer with the response provided. Rate the user's answers to the provided questions based on the following data: ${JSON.stringify(questionsWithAnswers, null, 2)}. After the evaluation, provide a detailed analysis of each area, including relevant YouTube links to help with improvement. Provide one report, not question-wise.`,
//       stream: false
//     };

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify(data),
//       });

//       if (response.ok) {
//         const responseData = await response.json();
//         if (responseData && responseData.response) {
//           return responseData.response; // Return the report if available
//         } else {
//           console.error("API did not return the expected response format.");
//           return null;
//         }
//       } else {
//         console.error(`Error fetching response from the API: ${response.statusText}`);
//         return null;
//       }
//     } catch (error) {
//       console.error("Error in the fetch operation:", error);
//       return null;
//     }
// };

// export const getApiResponseReport = async (reportData) => {
//     const url = "http://139.59.42.156:11434/api/generate";  // Consider passing URL dynamically
//     const headers = {
//       "Content-Type": "application/json"
//     };

//     // Validate if reportData has questions
//     if (!reportData || !Array.isArray(reportData.questions)) {
//         console.error("Invalid reportData structure or missing questions.");
//         return null;
//     }

//     // Prepare the answers for API evaluation
//     const questionsWithAnswers = reportData.questions.map((question) => {
//       return {
//         questionText: question.questionText || 'No question provided',
//         answer: question.answer || 'No answer provided'
//       };
//     });

//     // Prepare the data object for the API
//     const data = {
//       model: "llama3:latest",
//       prompt: `Generate a report scoring (0-10) technical proficiency, communication, decision-making, confidence, and language fluency. Compare the original and provided responses, evaluating the user's answers based on ${JSON.stringify(questionsWithAnswers, null, 2)}. After scoring, give a detailed analysis of each area with relevant YouTube links and books and websites name for improvement. Provide a single comprehensive report, not question-wise.`,
//       stream: false
//     };

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify(data),
//       });

//       if (response.ok) {
//         const responseData = await response.json();
//         if (responseData && responseData.response) {
//           return responseData.response; // Return the report if available
//         } else {
//           console.error("API did not return the expected response format.");
//           return null;
//         }
//       } else {
//         console.error(`Error fetching response from the API: ${response.statusText}`);
//         return null;
//       }
//     } catch (error) {
//       console.error("Error in the fetch operation:", error);
//       return null;
//     }
// };


// export const config = {
//   runtime: "nodejs", // Ensure it's a Node.js function
//   maxDuration: 300,
// };

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     const { data } = req.body;

//     try {
//       // Call the getApiResponse function directly within the handler
//       const responseData = await getApiResponseReport(data);

//       if (responseData) {
//         console.log('Fetched responseData:', responseData);  
        
//         // Return responseData directly as a JSON response
//         return res.status(200).json(responseData);
//       } else {
//         return res.status(500).json({
//           error: "Error: No questions fetched from the API.",
//         });
//       }
//     } catch (error) {
//       console.error('Error during processing:', error);
//       return res.status(500).json({
//         error: "Error during background processing.",
//       });
//     }
//   }

//   // If the method is not POST, return a 405 Method Not Allowed response
//   return res.status(405).json({ error: 'Method Not Allowed' });
// }

// // The API function to fetch questions
// export const getApiResponseReport = async (reportData) => {
//       const url = "http://139.59.75.143:11434/api/generate";  // Consider passing URL dynamically
//       const headers = {
//         "Content-Type": "application/json"
//       };
  
//       // Validate if reportData has questions
//       if (!reportData || !Array.isArray(reportData.questions)) {
//           console.error("Invalid reportData structure or missing questions.");
//           return null;
//       }
  
//       // Prepare the answers for API evaluation
//       const questionsWithAnswers = reportData.questions.map((question) => {
//         return {
//           questionText: question.questionText || 'No question provided',
//           answer: question.answer || 'No answer provided'
//         };
//       });
  
//       // Prepare the data object for the API
//       const data = {
//         model: "llama3:latest",

//         // prompt: `Generate a report scoring (0-10) technical proficiency, communication, decision-making, confidence, and language fluency. Compare the original and provided responses, evaluating the user's answers based on ${JSON.stringify(questionsWithAnswers, null, 2)}. After scoring, give a detailed analysis of each area with relevant YouTube embed links and books and websites name for improvement. Provide a single comprehensive report, not question-wise.`,

//         prompt: `Generate a report scoring (0-10) technical proficiency, communication, decision-making, confidence,  language fluency and overall(0-50). Compare the original and provided responses, evaluating the user's answers based on ${JSON.stringify(questionsWithAnswers, null, 2)}. After scoring, give a detailed analysis of each area with relevant YouTube links and books and websites name for improvement. Provide a single comprehensive report, not question-wise.`,

//         stream: false
//       };
  
//       try {
//         const response = await fetch(url, {
//           method: "POST",
//           headers: headers,
//           body: JSON.stringify(data),
//         });
  
//         if (response.ok) {
//           const responseData = await response.json();
//           if (responseData && responseData.response) {
//             return responseData.response; // Return the report if available
//           } else {
//             console.error("API did not return the expected response format.");
//             return null;
//           }
//         } else {
//           console.error(`Error fetching response from the API: ${response.statusText}`);
//           return null;
//         }
//       } catch (error) {
//         console.error("Error in the fetch operation:", error);
//         return null;
//       }
//   };
  


// export const config = {
//     runtime: "nodejs", // Ensure it's a Node.js function
//     maxDuration: 300,
//   };
  
//   export default async function handler(req, res) {
//     if (req.method === 'POST') {
//       const { data } = req.body;
  
//       try {
//         // Call the getApiResponse function directly within the handler
//         const responseData = await getApiResponseReport(data);
  
//         if (responseData) {
//           console.log('Fetched responseData:', responseData);  
          
//           // Return responseData directly as a JSON response
//           return res.status(200).json(responseData);
//         } else {
//           return res.status(500).json({
//             error: "Error: No questions fetched from the API.",
//           });
//         }
//       } catch (error) {
//         console.error('Error during processing:', error);
//         return res.status(500).json({
//           error: "Error during background processing.",
//         });
//       }
//     }
  
//     // If the method is not POST, return a 405 Method Not Allowed response
//     return res.status(405).json({ error: 'Method Not Allowed' });
//   }
// async function getApiResponseReport(data) {
//   const url = 'https://api.anthropic.com/v1/messages';

//   const headers = {
//     'Content-Type': 'application/json',
//     'x-api-key': process.env.ANTHROPIC_API_KEY,
//     'anthropic-version': '2023-06-01',
//   };

//   const prompt = `Generate a report scoring (0-10) technical proficiency, communication, decision-making, confidence,  language fluency and overall(0-50). Compare the original and provided responses, evaluating the user's answers based on ${JSON.stringify(data, null, 2)}. After scoring, give a detailed analysis of each area with relevant YouTube links and books and websites name for improvement. Provide a single comprehensive report, not question-wise.`;

//   const payload = {
//     model: "claude-3-7-sonnet-20250219", // You can change to 'claude-3-sonnet-20240229' for a lighter model
//     max_tokens: 1000,
//     temperature: 0.7,
//     messages: [
//       {
//         role: "user",
//         content: prompt,
//       },
//     ],
//   };

//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers,
//       body: JSON.stringify(payload ),
//     });

//     const responseData = await response.json();

//     if (response.ok && responseData?.content?.[0]?.text) {
//       return responseData.content[0].text;
//     } else {
//       console.error('Claude API error:', responseData);
//       return null;
//     }
//   } catch (error) {
//     console.error('Error calling Claude API:', error);
//     return null;
//   }
// }


export const config = {
  runtime: "nodejs",
  maxDuration: 300,
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { data } = req.body;

    try {
      const responseData = await getApiResponseReport(data);

      if (responseData) {
        console.log('Fetched responseData:', responseData);
        return res.status(200).json({ report: responseData });
      } else {
        return res.status(500).json({
          error: "Error: No report fetched from ChatGPT API.",
        });
      }
    } catch (error) {
      console.error('Error during processing:', error);
      return res.status(500).json({
        error: "Error during background processing.",
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

async function getApiResponseReport(data) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Use your GPT API key here
  };

  const prompt = `Generate a report scoring (0-10) technical proficiency, communication, decision-making, confidence, language fluency and overall (0-50). Compare the original and provided responses, evaluating the user's answers based on ${JSON.stringify(data, null, 2)}. After scoring, give a detailed analysis of each area with relevant YouTube links, books, and website names for improvement. Provide a single comprehensive report, not question-wise.`;

  const payload = {
    model: "gpt-4", // or gpt-4-turbo if using the turbo version
    temperature: 0.7,
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (response.ok && responseData?.choices?.[0]?.message?.content) {
      return responseData.choices[0].message.content;
    } else {
      console.error('ChatGPT API error:', responseData);
      return null;
    }
  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    return null;
  }
}
