const express = require("express");
const {
	getPatient,
	getPrescriptions,
	getFamilyMembers,
	addFamilyMember,
	getDoctors,
	getAppointments,
	changePassword,
	getPackages,
	getAvailableAppointments,
	linkFamilyMember,
	subscribeToHealthPackage,
	getMyPackage,
	getFamilyPackages,
	payByWallet,
	viewWallet,
	uploadMedicalHistory,
	deleteMedicalHistory,
	bookAppointment,
	creditDoctor,
	selfCancelSubscription,
	familyCancelSubscription,
	packageUnsubscribe,
	rescheduleAppointment,
	cancelAppointment,
	requestFollowUp,
	getFamilyMemberAppointments,
	orderPrescription,
} = require("../controllers/patientController");

const router = express.Router();
const authorize = require("../middlewares/authorization");
const multer = require("multer");

// Get Patient
router.get("/", authorize, getPatient);

// Get all patient prescriptions
router.get("/prescriptions", authorize, getPrescriptions);

// Get all patient's registered family members
router.get("/family", authorize, getFamilyMembers);

// Register a patient's family member
router.post("/family", authorize, addFamilyMember);

// Get all doctors
router.get("/doctors", authorize, getDoctors);

// Get all appointments
router.get("/appointments", authorize, getAppointments);

//handle uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Upload a medical history record
router.post(
	"/uploadMedicalHistory",
	authorize,
	upload.fields([{ name: "medicalHistory", maxCount: 1 }]),
	uploadMedicalHistory
);

//Delete a medical history record
router.patch("/deleteMedicalHistory/:id", authorize, deleteMedicalHistory);

// Change Password
router.patch("/changePassword", authorize, changePassword);

// Get all packages
router.get("/packages", authorize, getPackages);

// Get available appointments
router.get("/availableAppointments", authorize, getAvailableAppointments);

// Link Family Member Account
router.post("/linkFamily", authorize, linkFamilyMember);

// Pay appointment by card
// router.patch("/payCard", authorize, payAppointmentByCard);

// Pay appointment by wallet
router.patch("/payWallet", authorize, payByWallet);

router.patch("/creditDoctor", authorize, creditDoctor);

// Subscribe to a health package
router.post("/subscribe", authorize, subscribeToHealthPackage);

// Get Subscribed Package for myself
router.get("/myPackage", authorize, getMyPackage);

// Get Subscribed Family Member Packages
router.get("/familyPackages", authorize, getFamilyPackages);

// Finalizes appointment booking in database
// Sets status to booked
router.post("/bookAppointment", authorize, bookAppointment);

// Get Amount in my Wallet
router.get("/wallet", authorize, viewWallet);

// Get Status of my package
// router.get("/myPackageStatus", authorize, viewMyPackageStatus);

// Get status of family member
// router.get("/familyPackageStatus", authorize, viewFamilyPackageStatus);

// Cancel my subscription
router.post("/cancelMySub", authorize, selfCancelSubscription);

// Cancel family member subscription
router.post("/cancelFamilySub", authorize, familyCancelSubscription);

// Unsubscribe from my package
router.post("/unsubscribe", authorize, packageUnsubscribe);

// Reschedule appointment
router.patch("/rescheduleAppointment", authorize, rescheduleAppointment);

// Cancel Appointment
router.patch("/cancelAppointment", authorize, cancelAppointment);

// Request Follow Up
router.post("/followUp", authorize, requestFollowUp);

// Get Family Member Appointments
router.get("/familyAppointments", authorize, getFamilyMemberAppointments);

// Create a prescription's order
router.post("/prescription", authorize, orderPrescription);
module.exports = router;
