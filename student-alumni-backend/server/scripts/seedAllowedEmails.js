/**
 * Run: node scripts/seedAllowedEmails.js
 * Edit the list below to include all allowed college emails and admins.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const AllowedEmail = require("../../models/AllowedEmail");

const list = [
  { email: "nandini@iiitd.ac.in", role: "student" },
  { email: "vindhya@iiitd.ac.in", role: "student" },
  { email: "zubiya@iiitd.ac.in", role: "student" },
  { email: "ankit@iiitd.ac.in", role: "alumni" },
  { email: "gauri@iiitd.ac.in", role: "alumni" },
  { email: "admin@iiitd.ac.in", role: "admin" },
  // add more emails here...
  //   admin@iiitd.ac.in - asdf
  // ankit@iiitd.ac.in - qwerty
  // nandini@iiitd.ac.in - 1234
  // vindhya@iiitd.ac.in - Vindhya@3
  // zubiya@iiitd.ac.in - Zubiya@123
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    for (const item of list) {
      await AllowedEmail.updateOne(
        { email: item.email },
        { $set: item },
        { upsert: true }
      );
      console.log("Upserted:", item.email);
    }
    console.log("Done seeding allowed emails.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
