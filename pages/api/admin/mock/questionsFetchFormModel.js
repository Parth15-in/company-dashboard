// // api/response.js


// export const getApiResponse = async (jobrole,level) => {
//     const url = "http://139.59.42.156:11434/api/generate";
//     const headers = {
//       "Content-Type": "application/json"
//     };
//     const payload  = {
//       model: "gemma:2b",
//       prompt: `give mi 15 question to ${jobrole} this job role ${level} level`,
//       stream: false
//     };
  
//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify(payload ),
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
  

// export const getApiResponse = async (jobrole, level) => {
//   const url = `${process.env.NEXT_PUBLIC_HOST}/api/proxy`; // Replace with your Vercel proxy URL
//   const headers = {
//     "Content-Type": "application/json",
//   };

//   const payload  = {
//     model: "gemma:2b",
//     prompt: `give mi 15 question to ${jobrole} this job role for ${level} level`,
//     stream: false,
//   };

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: headers,
//       body: JSON.stringify(payload ),
//     });

//     if (response.ok) {
//       const responseData = await response.json();
//       return responseData.response; // Return the response from the API
//     } else {
//       console.error("Error fetching response from the API.");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error in the fetch operation:", error);
//     return null;
//   }
// };


 // Importing the function for fetching questions

//  export const config = {
//   runtime: "nodejs", // Ensure it's a Node.js function
//   maxDuration: 300,
// };

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     const { jobRole, level } = req.body;

//     try {
//       // Call the getApiResponse function directly within the handler
//       const fetchedQuestions = await getApiResponse(jobRole, level);

//       if (fetchedQuestions) {
//         console.log('Fetched Questions:', fetchedQuestions);  // Log the fetched questions
        
//         // You can also store the questions or perform further processing if necessary
//         // Example: await saveQuestionsToDatabase(fetchedQuestions);

//         return res.status(200).json({
//           message: "Job role submitted. Questions fetched successfully.",
//           questions: fetchedQuestions,
//         });
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
// export const getApiResponse = async (jobRole, level) => {
//   const url = "http://139.59.75.143:11434/api/generate";
//   const headers = {
//     "Content-Type": "application/json",
//   };
//   const payload  = {
//     model: "llama3.1:8b-instruct-q4_K_M",
//     prompt: `Give me 10 questions for the ${jobRole} job role at ${level} level`, // Fixed template string

//     stream: false,
//   };

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: headers,
//       body: JSON.stringify(payload ),
//     });

//     if (response.ok) {
//       const responseData = await response.json();
//       return responseData.response; // Return the response from the API
//     } else {
//       console.error("Error fetching response from the API.");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error in the fetch operation:", error);
//     return null;
//   }
// };



// export const config = {
//   runtime: 'nodejs',
//   maxDuration: 300,
// };

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method Not Allowed' });
//   }

//   const { jobRole, level } = req.body;

//   if (!jobRole || !level) {
//     return res.status(400).json({ error: 'Job role and level are required.' });
//   }

//   try {
//     const questions = await getApiResponse(jobRole, level);

//     if (questions) {
//       return res.status(200).json({
//         message: 'Job role submitted. Questions fetched successfully.',
//         questions,
//       });
//     } else {
//       return res.status(500).json({ error: 'No questions fetched from Claude API.' });
//     }
//   } catch (error) {
//     console.error('Error during processing:', error);
//     return res.status(500).json({ error: 'Error during background processing.' });
//   }
// }

// async function getApiResponse(jobRole, level) {
//   const url = 'https://api.anthropic.com/v1/messages';

//   const headers = {
//     'Content-Type': 'application/json',
//     'x-api-key': process.env.ANTHROPIC_API_KEY,
//     'anthropic-version': '2023-06-01',
//   };

//   const prompt = `Give me 10 interview questions for the ${jobRole} role at ${level} level.`;

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
  runtime: 'nodejs',
  maxDuration: 300,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { jobRole, level } = req.body;

  if (!jobRole || !level) {
    return res.status(400).json({ error: 'Job role and level are required.' });
  }

  try {
    console.log(`Processing request for job role: ${jobRole}, level: ${level}`);
    const questions = await getChatGPTResponse(jobRole, level);

    if (questions) {
      // Log success but don't log the actual questions (could be large)
      console.log('Questions fetched successfully');
      return res.status(200).json({
        message: 'Job role submitted. Questions fetched successfully.',
        questions,
      });
    } else {
      console.error('No questions were fetched from ChatGPT API');
      return res.status(500).json({ error: 'No questions fetched from ChatGPT API.' });
    }
  } catch (error) {
    console.error('Error during processing:', error);
    return res.status(500).json({ error: `Error during processing: ${error.message}` });
  }
}

async function getChatGPTResponse(jobRole, level) {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  // Get API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OpenAI API key is missing. Please add OPENAI_API_KEY to your environment variables.');
    return null;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  const prompt = `Generate 10 interview questions for a ${jobRole} position at ${level} level. Format the questions as a numbered list (1., 2., etc.) with each question on a new line.`;

  const payload = {
    model: 'gpt-4', // Using gpt-4 for better structured responses
    temperature: 0.7,
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  try {
    console.log(`Fetching questions for ${jobRole} at ${level} level...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return null;
    }
    
    if (data?.choices?.[0]?.message?.content) {
      console.log('Successfully received response from OpenAI');
      return data.choices[0].message.content;
    } else {
      console.error('Unexpected response format from OpenAI:', data);
      return null;
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return null;
  }
}
