import bcrypt from "bcrypt";
import UserModel from "../models/UserModel.js";

async function hashPasswords() {
  try {
    // Fetch all user documents
    const users = await UserModel.find({}).maxTimeMS(30000); 
    console.log(users);

    // Hash passwords for each user
    for (const user of users) {
      if (!user.password) continue; // Skip if password is missing
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      await user.save();
    }

    console.log("Passwords hashed successfully");
  } catch (error) {
    console.error("Error hashing passwords:", error);
  }
}

// Call the function to hash passwords
hashPasswords();

// const hashedPassword = await bcrypt.hash("hey1234", 10);
// console.log(hashedPassword)