const mongoose = require("mongoose");
const DocumentWatcher = require("../controllers/modularCodeExtractionFolder/services/documentWatcher");
const HospitalSubmitted = require("../models/HospitalSubmittedSchema");

const connectDb = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://mayurkalwar0251:voblc2X6BYuWCAIj@cluster0.nqeov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("MongoDB connected successfully");

    // Initialize document watcher after successful DB connection
    const watcher = new DocumentWatcher(
      "gemini-1.5-flash",
      process.env.GEMINI_API_KEY
    );

    await watcher.watchUploads(HospitalSubmitted);

    console.log("Document watcher initialized successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = { connectDb };

// const mongoose = require("mongoose");

// const connectDb = async () => {
//   try {
//     console.log(
//       "mongodb+srv://mayurkalwar0251:voblc2X6BYuWCAIj@cluster0.gszow.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
//     );

//     await mongoose.connect(
//       "mongodb+srv://mayurkalwar0251:voblc2X6BYuWCAIj@cluster0.nqeov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
//       {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       }
//     );
//     console.log(`MongoDB Atlas connected`);
//   } catch (error) {
//     console.log("Error connecting to MongoDB:", error);
//     process.exit(1);
//   }
// };

// // const connectDb = async () => {
// //   try {
// //     const connect = await mongoose.connect(process.env.DB);

// //     console.log(`MongoDB connected with server: `);
// //   } catch (error) {
// //     console.log(error.message, error);
// //   }
// // };

// module.exports = { connectDb };
