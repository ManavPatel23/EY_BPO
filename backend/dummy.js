const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
const PORT = 5000;

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const GEMINI_API_KEY = "AIzaSyALA1GrzKOwb8hLh66GzDUryzICH1cH1Wg";
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// app.post("/extract-text", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No image uploaded" });
//     }

//     // Convert image to Base64
//     const imagePath = req.file.path;
//     const imageBuffer = fs.readFileSync(imagePath);
//     const base64Image = imageBuffer.toString("base64");

//     // Updated prompt to explicitly request JSON format
//     const prompt = `Extract information from this hospital bill image and return it in the following JSON structure. Do not include any additional text or markdown:
//     {
//       "Patient_Name": "",
//       "Address": "",
//       "Phone": "",
//       "Statement_Date": "",
//       "Due_Date": "",
//       "Invoice_Number": "",
//       "Total_Amount_Due": "",
//       "Insurance_Details": "",
//       "Service_Breakdown": {
//         "items": [
//           {
//             "service": "",
//             "description": "",
//             "amount": ""
//           }
//         ]
//       },
//       "Subtotal": "",
//       "Tax": "",
//       "Hospital_Info": {
//         "name": "",
//         "contact": "",
//         "address": ""
//       }
//     }`;

//     // Request to Gemini API
//     const response = await axios.post(
//       `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
//       {
//         contents: [
//           {
//             parts: [
//               { text: prompt },
//               {
//                 inline_data: {
//                   mime_type: req.file.mimetype,
//                   data: base64Image,
//                 },
//               },
//             ],
//           },
//         ],
//       },
//       { headers: { "Content-Type": "application/json" } }
//     );

//     // Cleanup uploaded file
//     fs.unlinkSync(imagePath);

//     let extractedText =
//       response.data.candidates[0]?.content?.parts[0]?.text || "{}";

//     // Clean the response text to ensure it's valid JSON
//     extractedText = extractedText.replace(/```json\n?|\n?```/g, "").trim();

//     try {
//       const jsonData = JSON.parse(extractedText);
//       res.json({
//         success: true,
//         extracted_text: jsonData,
//       });
//     } catch (e) {
//       console.error("JSON parsing error:", e);
//       res.status(422).json({
//         success: false,
//         error: "Failed to parse response as JSON",
//         raw_text: extractedText,
//       });
//     }
//   } catch (error) {
//     console.error("Error processing image:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to process image",
//       details: error.message,
//     });
//   }
// });

// app.get("/test-gemini", async (req, res) => {
//   try {
//     const response = await axios.post(
//       `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
//       {
//         contents: [
//           {
//             parts: [
//               {
//                 text: 'Return this response as JSON: { "test": "successful" }',
//               },
//             ],
//           },
//         ],
//       }
//     );

//     res.json({
//       success: true,
//       data: response.data,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.response?.data || error.message,
//     });
//   }
// });

app.post("/get-hospitals", async (req, res) => {
  try {
    const { city } = req.body;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City name is required",
      });
    }

    const prompt = `
      Provide a JSON array limit=50 of hospitals in Kandivali Taluka in ${city} City with the following format and real data:
      [
        {
          "hospitalName": "Sample Hospital",
          "address": {
            "street": "123 Main Street",
            "city": "${city}",
            "state": "Sample State",
            "country": "Sample Country",
            "pincode": "123456"
          },
          "specialization": ["Cardiology", "Neurology"]
        }
      ]

      Dont give any text/disclaimer other than the provided format or i will be having issue. 
    `;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topP: 1,
          topK: 32,
          maxOutputTokens: 4096,
        },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // Extracting text from Gemini response
    let hospitalsData =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Ensure only valid JSON is extracted
    hospitalsData = hospitalsData
      .replace(/```json\n?/, "") // Remove starting ```json
      .replace(/\n?```/, "") // Remove ending ```
      .trim(); // Trim any extra spaces

    // Convert string to JSON
    const parsedData = JSON.parse(hospitalsData);

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
