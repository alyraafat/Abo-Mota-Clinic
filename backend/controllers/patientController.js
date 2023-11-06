const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const getPatient = async (req, res) => {
	try {
		const patient = await Patient.findOne({}).populate("healthPackage.package");
		res.status(200).json(patient);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get all patient prescriptions
const getPrescriptions = async (req, res) => {
	try {
		// const patient = await Patient.findOne({}).populate({
		//   path: "prescriptions",
		//   populate: [
		//     {
		//       path: "medicines",
		//       model: "Medicine",
		//     },
		//     {
		//       path: "doctor",
		//       model: "Doctor",
		//     },
		//   ],
		// });
		// res.status(200).json(patient.prescriptions);
		const { _id } = await Patient.findOne({});
		const prescriptions = await Prescription.find({ patient: _id }).populate([
			{
				path: "medicines.medicine",
				model: "Medicine",
			},
			{
				path: "doctor",
				model: "Doctor",
			},
		]);
		res.status(200).json(prescriptions);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get all patient's registered family members
const getFamilyMembers = async (req, res) => {
	try {
		// ???
		const patient = await Patient.findOne({});
		// .populate("familyMembers._id");
		// ???
		res.status(200).json(patient.familyMembers);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Add a patient's family member
const addFamilyMember = async (req, res) => {
	try {
		const { nationalId, name, gender, age, relationToPatient } = req.body;
		const loggedIn = await Patient.findOne({});
		loggedIn.familyMembers.push({
			nationalId,
			name,
			gender,
			age,
			relationToPatient,
		});
		const updated = await Patient.updateOne({}, { familyMembers: loggedIn.familyMembers });
		// const familyMember = await Patient.findOne({ nationalId: nationalId });
		// loggedIn.familyMembers.push({
		// 	_id: familyMember._id,
		// 	relationToPatient: relationToPatient,
		// });
		// const updated = await Patient.updateOne(
		// 	{ _id: loggedIn._id },
		// 	{ familyMembers: loggedIn.familyMembers }
		// );
		res.status(200).json(updated);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get all doctors
const getDoctors = async (req, res) => {
	try {
		const doctors = await Doctor.find({ registrationStatus: "approved" }).select("-password");
		const doctorsWithAppointments = await Promise.all(
			doctors.map(async (doctor) => {
				const appointments = await Appointment.find({ doctor: doctor._id, status: "unbooked" });
				return { ...doctor._doc, appointments };
			})
		);
		res.status(200).json(doctorsWithAppointments);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get all appointments
const getAppointments = async (req, res) => {
	try {
		// const patient = await Patient.findOne({}).populate({
		//   path: "appointments",
		//   populate: {
		//     path: "doctor",
		//     model: "Doctor",
		//   },
		// });
		// res.status(200).json(patient.appointments);
		const { _id } = await Patient.findOne({});
		const appointments = await Appointment.find({ patient: _id }).populate("doctor");
		res.status(200).json(appointments);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const changePassword = async (req, res) => {
	try {
		const { oldPassword, newPassword } = req.body;
		// ** REPLACE THIS LINE WITH LOGIC TO FIND CURRENTLY LOGGED IN PATIENT **
		const loggedIn = await Patient.findOne({ username: "3ebs" });
		// ** REPLACE THIS LINE WITH LOGIC TO FIND CURRENTLY LOGGED IN PATIENT **

		const isMatch = await bcrypt.compare(oldPassword, loggedIn.password);
		if (!isMatch) {
			throw new Error("Old Password is incorrect");
		}
		const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
		const updatedUser = await Patient.updateOne(
			{ _id: loggedIn._id },
			{ password: hashedPassword }
		);
		res.status(200).json(updatedUser);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	getPatient,
	getPrescriptions,
	getFamilyMembers,
	addFamilyMember,
	getDoctors,
	getAppointments,
	changePassword,
};
