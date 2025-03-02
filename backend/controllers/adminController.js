const Admin = require("../models/ClinicAdmin");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const HealthPackage = require("../models/HealthPackage");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");

// View All Packages
const getPackages = async (req, res) => {
	try {
		const filter = { isActivated: true };
		const packages = await HealthPackage.find(filter);
		res.status(200).json(packages);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Update Package
const updatePackage = async (req, res) => {
	try {
		const { id } = req.params;
		const filter = { _id: id };

		// const packageExists = await HealthPackage.findOne(filter);
		// if (!packageExists) {
		// 	throw new Error("This package does not exist");
		// }
		const update = req.body;
		const updatedPackage = await HealthPackage.updateOne(filter, update);
		if (updatedPackage.modifiedCount === 0) {
			throw new Error("Package not found");
		}
		res.status(200).json(updatedPackage);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// add Package
const addPackage = async (req, res) => {
	try {
		const { name } = req.body;
		const packageExists = await HealthPackage.findOne({
			name: name.toLowerCase(),
			isActivated: true,
		});
		if (packageExists) {
			throw new Error("A package with this name already exists");
		}
		const addedPackage = {
			...req.body,
			name: name.toLowerCase(),
			isActivated: true,
		};
		const package = await HealthPackage.create(addedPackage);

		res.status(200).json(package);
	} catch (error) {
		console.log(error.message);
		res.status(500).json({ error: error.message });
	}
};

// delete Package
const deletePackage = async (req, res) => {
	try {
		const { id } = req.params;
		const filter = { _id: id };

		const deactivated = await HealthPackage.updateOne(filter, { isActivated: false });

		// const deletedPackage = await HealthPackage.deleteOne(filter);
		res.status(200).json(deactivated);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Add an Admin
const addAdmin = async (req, res) => {
	try {
		const { username, password, email } = req.body;

		const existingAdmin = await Admin.findOne({
			$or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
		});
		const patientExists = await Patient.findOne({
			$or: [{ username: username.toLowerCase() }, { email }],
		});
		const doctorExists = await Doctor.findOne({
			$or: [{ username: username.toLowerCase() }, { email }],
		});
		if (existingAdmin || patientExists || doctorExists) {
			return res.status(500).json({ error: "User with this username or email already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, saltRounds);

		const newAdmin = await Admin.create({
			// ...req.body,
			username: username.toLowerCase(),
			password: hashedPassword,
			email: email.toLowerCase(),
		});

		res.status(200).json(newAdmin);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// REVISE DELETES, DELETE WITH USERNAME?
// Delete a specific Admin - tested initially
const deleteAdmin = async (req, res) => {
	try {
		// const { id } = req.params;
		// const filter = { _id: id };
		const { username } = req.body;
		const filter = { username: username.toLowerCase() };
		const admin = await Admin.findOne(filter);

		if (!admin) {
			throw new Error("Admin not found");
		}

		const deletedAdminResponse = await Admin.deleteOne(filter);
		res.status(200).json(deletedAdminResponse);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Delete a specific Patient - tested initially
const deletePatient = async (req, res) => {
	try {
		// const { id } = req.params;
		// const filter = { _id: id };
		const { username } = req.body;
		const filter = { username: username.toLowerCase() };
		const patient = await Patient.findOne(filter);

		if (!patient) {
			throw new Error("Patient not found");
		}
		const idOfPatient = patient._id;
		//find and delete appointments
		// const findDeletedAppointments = await Appointment.find({ patient: idOfPatient });
		const deletedAppointments = await Appointment.deleteMany({ patient: idOfPatient });
		// find and delete prescriptions
		// const findDeletedPrescriptions = await Prescription.find({ patient: idOfPatient });
		const deletedPrescriptions = await Prescription.deleteMany({ patient: idOfPatient });

		const deletedPatientResponse = await Patient.deleteOne(filter);

		// search in Doctor and delete patient from patients array

		res.status(200).json(deletedPatientResponse);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Delete a specific Doctor
const deleteDoctor = async (req, res) => {
	try {
		// const { id } = req.params;
		// const filter = { _id: id };
		const { username } = req.body;
		const filter = { username: username, registrationStatus: "approved" };
		const doctor = await Doctor.findOne(filter);

		if (!doctor) {
			throw new Error("Doctor not found");
		}
		const idOfDoctor = doctor._id;
		// find and delete appointments
		const deletedAppointments = await Appointment.deleteMany({ doctor: idOfDoctor });
		// find and delete prescriptions
		const deletedPrescriptions = await Prescription.deleteMany({ doctor: idOfDoctor });

		const deletedDoctorResponse = await Doctor.deleteOne(filter);
		res.status(200).json(deletedDoctorResponse);
	} catch (error) {
		// console.log(error.message);
		res.status(500).json({ error: error.message });
	}
};

// Get all doctor applications
const getApplications = async (req, res) => {
	try {
		const applications = await Doctor.find({ registrationStatus: "pending" });
		res.status(200).json(applications);
	} catch (error) {
		// console.log("Error fetching doctor applications");
		res.status(500).json({ error: error.message });
	}
};

// View Doctor Application Info
const getApplicationInfo = async (req, res) => {
	try {
		const { id } = req.params;
		const application = await Doctor.findOne({
			$and: [{ _id: id }, { registrationStatus: "pending" }],
		});
		if (!application) {
			throw new Error("Application not found");
		}
		res.status(200).json(application);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Handle doctor application
const handleApplication = async (req, res) => {
	try {
		const { id } = req.params;
		const { registrationStatus } = req.body;
		const filter = { _id: id };
		const update = { registrationStatus };

		if (registrationStatus !== "approved" && registrationStatus !== "rejected") {
			throw new Error("Registration can either be approved or rejected");
		}

		if (registrationStatus === "rejected") {
			const rejectedApplication = await Doctor.deleteOne(filter);
			res.status(200).json(rejectedApplication);
		} else {
			const handledApplication = await Doctor.updateOne(filter, update);
			if (handledApplication.modifiedCount === 0) {
				throw new Error("Application not found");
			}
			res.status(200).json(handledApplication);
		}
	} catch (error) {
		console.log(error.message);
		res.status(500).json({ error: error.message });
	}
};

const changePassword = async (req, res) => {
	try {
		const { oldPassword, newPassword } = req.body;
		// ** REPLACE THIS LINE WITH LOGIC TO FIND CURRENTLY LOGGED IN DOCTOR ** DONE
		const username = req.userData.username;
		const loggedIn = await Admin.findOne({ username });
		// ** REPLACE THIS LINE WITH LOGIC TO FIND CURRENTLY LOGGED IN DOCTOR **

		const isMatch = await bcrypt.compare(oldPassword, loggedIn.password);
		if (!isMatch) {
			throw new Error("Old Password is incorrect");
		}
		const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
		const updatedUser = await Admin.updateOne({ _id: loggedIn._id }, { password: hashedPassword });
		res.status(200).json(updatedUser);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	getPackages,
	updatePackage,
	addPackage,
	deletePackage,
	getApplications,
	getApplicationInfo,
	handleApplication,
	addAdmin,
	deleteAdmin,
	deletePatient,
	deleteDoctor,
	changePassword,
};
