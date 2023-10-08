const express = require("express");
const {
	getDoctorProfile,
	editDetails,
	getDoctorAppointments,
	getDoctorPatients,
} = require("../controllers/doctorController");


const router = express.Router();

// Get Doctor's Details 
router.get("/", getDoctorProfile);

// Edit Email, Affiliation, Rate (?)
router.patch("/", editDetails);

// View All Doctor's Appointments
router.get("/appointments", getDoctorAppointments);

// View All Doctor's Patients
router.get("/patients", getDoctorPatients);

module.exports = router;
