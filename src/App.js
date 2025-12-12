// Import React and necessary hooks from React library
import React, { useEffect, useState } from "react";
// Import CSS styles for the application
import "./App.css";

// Base URL for all API calls to your deployed backend
const BASE = "https://se-backend-5mmf.onrender.com";

// Converts ISO date format (2024-12-06T15:30:00.000Z) to readable format (Dec 6, 2024, 3:30 PM) 12hrs not military time
const formatDateTime = (dateString) => {
  // If no date string provided, return "N/A"
  if (!dateString) return "N/A";
  // Create a Date object from the string
  const date = new Date(dateString);
  // Format date using browser's locale settings
  return date.toLocaleString('en-US', {
    year: 'numeric',    // 2024
    month: 'short',     // Dec
    day: 'numeric',     // 6
    hour: 'numeric',    // 3
    minute: '2-digit',  // 30
    hour12: true        // AM/PM format
  });
};

// Main App component - root component of the application
function App() {
  // State to track which view is currently active (patients, doctors, or appointments)
  // Initial state is "patients" (default view)
  const [view, setView] = useState("patients");

  // JSX returned by the App component
  return (
    <div className="App">
      <h1>Clinic Appointment System</h1>

      {/* Navigation bar with buttons to switch between views */}
      <nav>
        {/* When clicked, sets view state to "patients" */}
        <button onClick={() => setView("patients")}>Patients</button>
        {/* When clicked, sets view state to "doctors" */}
        <button onClick={() => setView("doctors")}>Doctors</button>
        {/* When clicked, sets view state to "appointments" */}
        <button onClick={() => setView("appointments")}>Appointments</button>
      </nav>

      {/* Conditional rendering based on current view state */}
      {/* If view === "patients", render Patients component */}
      {view === "patients" && <Patients />}
      {/* If view === "doctors", render Doctors component */}
      {view === "doctors" && <Doctors />}
      {/* If view === "appointments", render Appointments component */}
      {view === "appointments" && <Appointments />}
    </div>
  );
}

/* ------------------------------------------
   PATIENTS CRUD COMPONENT
   Implements Create, Read, Update, Delete operations for patients
------------------------------------------- */
function Patients() {
  // State to store array of patients fetched from API
  const [patients, setPatients] = useState([]);
  // State to track which patient is being edited (null = no editing)
  const [editingId, setEditingId] = useState(null);
  // State for form data with initial empty values
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    email: "",
    phone: ""
  });

  // Function to fetch patients data from backend API
  const fetchPatients = async () => {
    try {
      // Send GET request to /patients endpoint
      const res = await fetch(`${BASE}/patients`);
      // Check if response is not OK (status 404, 500, etc.)
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Parse JSON response from API
      const data = await res.json();
      // Handle both response formats: array or {items: []} object
      const patientsArray = Array.isArray(data) ? data : (data.items || []);
      // Update patients state with fetched data
      setPatients(patientsArray);
    } catch (error) {
      // Log error to console for debugging
      console.error("Failed to fetch patients:", error);
      // Set patients to empty array on error
      setPatients([]);
    }
  };

  // useEffect hook runs fetchPatients when component mounts (empty dependency array [])
  useEffect(() => {
    fetchPatients();
  }, []);

  // Function to handle form submission (create or update patient)
  const createPatient = async (e) => {
    // Prevent default form submission behavior (page refresh)
    e.preventDefault();
    try {
      // Determine HTTP method: PUT for editing, POST for creating
      const method = editingId ? "PUT" : "POST";
      // Build URL: include ID for update, base URL for create
      const url = editingId ? `${BASE}/patients/${editingId}` : `${BASE}/patients`;
      
      // Send request to API with form data
      await fetch(url, {
        method,                     // POST or PUT
        headers: { "Content-Type": "application/json" },  // Tell server we're sending JSON
        body: JSON.stringify(form)  // Convert form state to JSON string
      });
      
      // Refresh patients list after successful save
      fetchPatients();
      // Clear form fields
      setForm({ name: "", birthDate: "", email: "", phone: "" });
      // Reset editing state
      setEditingId(null);
    } catch (error) {
      // Handle errors during save operation
      console.error("Error saving patient:", error);
      alert(`Failed to save patient: ${error.message}`);
    }
  };

  // Function to delete a patient
  const deletePatient = async (id) => {
    // Confirm deletion with user
    if (!window.confirm("Delete this patient?")) return;
    try {
      // Send DELETE request to API with patient ID
      await fetch(`${BASE}/patients/${id}`, { method: "DELETE" });
      // Refresh patients list after deletion
      fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert(`Failed to delete patient: ${error.message}`);
    }
  };

  // Function to populate form with patient data for editing
  const editPatient = (patient) => {
    // Set form state with patient data
    setForm({
      name: patient.name,
      // Convert ISO date (2024-12-06T00:00:00.000Z) to YYYY-MM-DD for date input
      birthDate: patient.birthDate.split('T')[0],
      email: patient.email,
      phone: patient.phone
    });
    // Set editing ID to patient's _id
    setEditingId(patient._id);
  };

  // JSX for Patients component
  return (
    <div className="container">
      <h2>Patients</h2>

      {/* Form for creating/editing patients */}
      <form onSubmit={createPatient}>
        {/* Name input field */}
        <input placeholder="Name"
          value={form.name}
          // Update form state when input changes
          onChange={(e) => setForm({ ...form, name: e.target.value })} 
          required /> {/* HTML5 validation: field cannot be empty */}

        {/* Date input field */}
        <input type="date"
          value={form.birthDate}
          onChange={(e) => setForm({ ...form, birthDate: e.target.value })} 
          required />

        {/* Email input field */}
        <input placeholder="Email" type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
          required />

        {/* Phone input field */}
        <input placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} 
          required />

        {/* Submit button - text changes based on editing state */}
        <button className="action edit" type="submit">
          {editingId ? "Update Patient" : "Add Patient"}
        </button>
        {/* Show Cancel button only when editing */}
        {editingId && (
          <button type="button" onClick={() => {
            // Clear form and exit edit mode
            setForm({ name: "", birthDate: "", email: "", phone: "" });
            setEditingId(null);
          }}>
            Cancel
          </button>
        )}
      </form>

      {/* Table to display patients */}
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {/* Map through patients array to create table rows */}
          {patients.map((p) => (
            <tr key={p._id}> {/* Unique key for React optimization */}
              <td>{p.name}</td>
              <td>{p.email}</td>
              <td>{p.phone}</td>
              <td>
                {/* Edit button - calls editPatient function with patient data */}
                <button className="action edit" onClick={() => editPatient(p)}>
                  Edit
                </button>
                {/* Delete button - calls deletePatient function with patient ID */}
                <button className="action delete" onClick={() => deletePatient(p._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------
   DOCTORS CRUD COMPONENT
   Similar structure to Patients component
------------------------------------------- */
function Doctors() {
  // State for doctors list
  const [doctors, setDoctors] = useState([]);
  // State for tracking which doctor is being edited
  const [editingId, setEditingId] = useState(null);
  // Loading state for better UX
  const [loading, setLoading] = useState(true);
  // Form state for doctor data
  const [form, setForm] = useState({ name: "", specialty: "" });

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      setLoading(true); // Start loading
      const res = await fetch(`${BASE}/doctors`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Extract items array from response
      const doctorsArray = data.items || [];
      setDoctors(doctorsArray);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      setDoctors([]);
    } finally {
      setLoading(false); // Stop loading regardless of success/failure
    }
  };

  // Fetch doctors on component mount
  useEffect(() => { fetchDoctors(); }, []);

  // Save doctor (create or update)
  const saveDoctor = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${BASE}/doctors/${editingId}` : `${BASE}/doctors`;
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      fetchDoctors();
      setForm({ name: "", specialty: "" });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving doctor:", error);
      alert(`Failed to save doctor: ${error.message}`);
    }
  };

  // Delete doctor
  const deleteDoctor = async (id) => {
    if (!window.confirm("Delete this doctor?")) return;
    try {
      await fetch(`${BASE}/doctors/${id}`, { method: "DELETE" });
      fetchDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      alert(`Failed to delete doctor: ${error.message}`);
    }
  };

  // Edit doctor
  const editDoctor = (doctor) => {
    setForm({ name: doctor.name, specialty: doctor.specialty });
    setEditingId(doctor._id);
  };

  return (
    <div className="container">
      <h2>Doctors</h2>

      <form onSubmit={saveDoctor}>
        <input placeholder="Doctor Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} 
          required />

        <input placeholder="Specialty"
          value={form.specialty}
          onChange={(e) => setForm({ ...form, specialty: e.target.value })} 
          required />

        <button className="action edit">
          {editingId ? "Update Doctor" : "Add Doctor"}
        </button>
        {editingId && (
          <button type="button" onClick={() => {
            setForm({ name: "", specialty: "" });
            setEditingId(null);
          }}>
            Cancel
          </button>
        )}
      </form>

      {/* Show loading message or doctors table */}
      {loading ? (
        <p>Loading doctors...</p>
      ) : (
        <table>
          <thead>
            <tr><th>Name</th><th>Specialty</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d._id}>
                <td>{d.name}</td>
                <td>{d.specialty}</td>
                <td>
                  <button className="action edit" onClick={() => editDoctor(d)}>
                    Edit
                  </button>
                  <button className="action delete" onClick={() => deleteDoctor(d._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------------------------
   APPOINTMENTS CRUD COMPONENT
   Most complex component - involves multiple entities
------------------------------------------- */
function Appointments() {
  // States for appointments, patients, and doctors
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state for appointment data
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    startAt: "",
    endAt: "",
    notes: ""
  });

  // Fetch all data needed for appointments
  const fetchAll = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments (should include patient and doctor data via populate)
      const appointmentsRes = await fetch(`${BASE}/appointments`);
      const appointmentsData = await appointmentsRes.json();
      setAppointments(appointmentsData.items || appointmentsData || []);
      
      // Fetch patients for dropdown
      const patientsRes = await fetch(`${BASE}/patients`);
      const patientsData = await patientsRes.json();
      setPatients(patientsData.items || patientsData || []);
      
      // Fetch doctors for dropdown
      const doctorsRes = await fetch(`${BASE}/doctors`);
      const doctorsData = await doctorsRes.json();
      setDoctors(doctorsData.items || []);
      
    } catch (error) {
      console.error("Failed to fetch data:", error);
      // Set all to empty arrays on error
      setAppointments([]);
      setPatients([]);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data on component mount
  useEffect(() => { fetchAll(); }, []);

  // Save appointment (create or update)
  const saveAppointment = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${BASE}/appointments/${editingId}` : `${BASE}/appointments`;
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      fetchAll();
      // Clear form
      setForm({ patientId: "", doctorId: "", startAt: "", endAt: "", notes: "" });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert(`Failed to save appointment: ${error.message}`);
    }
  };

  // Delete appointment
  const deleteAppt = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await fetch(`${BASE}/appointments/${id}`, { method: "DELETE" });
      fetchAll();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert(`Failed to delete appointment: ${error.message}`);
    }
  };

  // Edit appointment - populate form with existing data
  const editAppointment = (appt) => {
    // Helper to format date for datetime-local input
    const formatForInput = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      // Convert to YYYY-MM-DDTHH:MM format
      return date.toISOString().slice(0, 16);
    };

    // Populate form with appointment data
    setForm({
      // Handle both populated object and plain ID
      patientId: appt.patientId?._id || appt.patientId || "",
      doctorId: appt.doctorId?._id || appt.doctorId || "",
      startAt: formatForInput(appt.startAt),
      endAt: formatForInput(appt.endAt),
      notes: appt.notes || ""
    });
    setEditingId(appt._id);
  };

  return (
    <div className="container">
      <h2>Appointments</h2>

      <form onSubmit={saveAppointment}>
        {/* Patient dropdown select */}
        <select
          value={form.patientId}
          onChange={(e) => setForm({ ...form, patientId: e.target.value })}
          required
        >
          <option value="">Select Patient</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        {/* Doctor dropdown select */}
        <select
          value={form.doctorId}
          onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
          required
        >
          <option value="">Select Doctor</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>

        {/* Start date/time input */}
        <input type="datetime-local"
          value={form.startAt}
          onChange={(e) => setForm({ ...form, startAt: e.target.value })}
          required />

        {/* End date/time input */}
        <input type="datetime-local"
          value={form.endAt}
          onChange={(e) => setForm({ ...form, endAt: e.target.value })}
          required />

        {/* Optional notes field */}
        <input placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })} />

        <button className="action edit">
          {editingId ? "Update Appointment" : "Schedule Appointment"}
        </button>
        {editingId && (
          <button type="button" onClick={() => {
            setForm({ patientId: "", doctorId: "", startAt: "", endAt: "", notes: "" });
            setEditingId(null);
          }}>
            Cancel
          </button>
        )}
      </form>

      {/* Show loading or appointments table */}
      {loading ? (
        <p>Loading appointments...</p>
      ) : (
        <table>
          <thead>
            <tr><th>Patient</th><th>Doctor</th><th>Start</th><th>End</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id}>
                {/* Optional chaining: a.patientId?.name - safe if patientId is null */}
                <td>{a.patientId?.name || "Unknown"}</td>
                <td>{a.doctorId?.name || "Unknown"}</td>
                {/* Use formatDateTime helper for readable dates */}
                <td>{formatDateTime(a.startAt)}</td>
                <td>{formatDateTime(a.endAt)}</td>
                <td>
                  <button className="action edit" onClick={() => editAppointment(a)}>
                    Edit
                  </button>
                  <button className="action delete" onClick={() => deleteAppt(a._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Export App component as default export
export default App;