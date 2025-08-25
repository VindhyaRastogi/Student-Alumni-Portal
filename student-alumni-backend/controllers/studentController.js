const Student = require('../models/Student');

const saveStudentProfile = async (req, res) => {
  try {
    const { fullName, email, gender, phone, degree, specialization, batch, linkedin } = req.body;
    const profilePicture = req.file ? req.file.filename : null;

    let student = await Student.findOne({ userId: req.user._id });
    if (student) {
      Object.assign(student, { fullName, email, gender, phone, degree, specialization, batch, linkedin });
      if (profilePicture) student.profilePicture = profilePicture;
      await student.save();
    } else {
      student = await Student.create({
        userId: req.user._id,
        fullName,
        email,
        gender,
        phone,
        degree,
        specialization,
        batch,
        linkedin,
        profilePicture
      });
    }

    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { saveStudentProfile };
