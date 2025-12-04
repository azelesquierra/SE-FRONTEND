import React, { useEffect, useState } from "react";
import "./App.css";

const BASE = "https://api-se-midterm.onrender.com/";

function App() {
  const [view, setView] = useState("patients");

  return (
    <div className="App">
      <h1>Clinic Appointment System</h1>

      <nav>
        <button onClick={() => setView("patients")}>Patients</button>
        <button onClick={() => setView("doctors")}>Doctors</button>
        <button onClick={() => setView("appointments")}>Appointments</button>
      </nav>

      {view === "patients" && <Patients />}
      {view === "doctors" && <Doctors />}
      {view === "appointments" && <Appointments />}
    </div>
  );
}

/* ------------------------------------------
   PATIENTS CRUD
------------------------------------------- */
function Patients() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    email: "",
    phone: ""
  });

  const fetchPatients = async () => {
    const res = await fetch(`${BASE}/patients`);
    const data = await res.json();
    setPatients(data);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const createPatient = async (e) => {
    e.preventDefault();
    await fetch(`${BASE}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    fetchPatients();
    setForm({ name: "", birthDate: "", email: "", phone: "" });
  };

  const deletePatient = async (id) => {
    await fetch(`${BASE}/patients/${id}`, { method: "DELETE" });
    fetchPatients();
  };

  return (
    <div className="container">
      <h2>Patients</h2>

      {/* CREATE FORM */}
      <form onSubmit={createPatient}>
        <input placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <input type="date"
          value={form.birthDate}
          onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />

        <input placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />

        <input placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <button className="action edit" type="submit">Add Patient</button>
      </form>

      {/* LIST */}
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.email}</td>
              <td>{p.phone}</td>
              <td>
                <button className="action delete"
                  onClick={() => deletePatient(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------
   DOCTORS CRUD
------------------------------------------- */
function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ name: "", specialty: "" });

  const fetchDoctors = async () => {
    const res = await fetch(`${BASE}/doctors`);
    const data = await res.json();
    setDoctors(data);
  };

  useEffect(() => { fetchDoctors(); }, []);

  const createDoctor = async (e) => {
    e.preventDefault();
    await fetch(`${BASE}/doctors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    fetchDoctors();
    setForm({ name: "", specialty: "" });
  };

  const deleteDoctor = async (id) => {
    await fetch(`${BASE}/doctors/${id}`, { method: "DELETE" });
    fetchDoctors();
  };

  return (
    <div className="container">
      <h2>Doctors</h2>

      <form onSubmit={createDoctor}>
        <input placeholder="Doctor Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <input placeholder="Specialty"
          value={form.specialty}
          onChange={(e) => setForm({ ...form, specialty: e.target.value })} />

        <button className="action edit">Add Doctor</button>
      </form>

      <table>
        <thead>
          <tr><th>Name</th><th>Specialty</th><th></th></tr>
        </thead>
        <tbody>
          {doctors.map((d) => (
            <tr key={d._id}>
              <td>{d.name}</td>
              <td>{d.specialty}</td>
              <td>
                <button className="action delete"
                  onClick={() => deleteDoctor(d._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------
   APPOINTMENTS CRUD
------------------------------------------- */
function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    startAt: "",
    endAt: "",
    notes: ""
  });

  const fetchAll = async () => {
    setAppointments(await (await fetch(`${BASE}/appointments`)).json());
    setPatients(await (await fetch(`${BASE}/patients`)).json());
    setDoctors(await (await fetch(`${BASE}/doctors`)).json());
  };

  useEffect(() => { fetchAll(); }, []);

  const createAppointment = async (e) => {
    e.preventDefault();
    await fetch(`${BASE}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    fetchAll();
  };

  const deleteAppt = async (id) => {
    await fetch(`${BASE}/appointments/${id}`, { method: "DELETE" });
    fetchAll();
  };

  return (
    <div className="container">
      <h2>Appointments</h2>

      <form onSubmit={createAppointment}>
        <select
          value={form.patientId}
          onChange={(e) => setForm({ ...form, patientId: e.target.value })}
        >
          <option>Select Patient</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        <select
          value={form.doctorId}
          onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
        >
          <option>Select Doctor</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>

        <input type="datetime-local"
          value={form.startAt}
          onChange={(e) => setForm({ ...form, startAt: e.target.value })} />

        <input type="datetime-local"
          value={form.endAt}
          onChange={(e) => setForm({ ...form, endAt: e.target.value })} />

        <input placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })} />

        <button className="action edit">Schedule Appointment</button>
      </form>

      <table>
        <thead>
          <tr><th>Patient</th><th>Doctor</th><th>Start</th><th>End</th><th></th></tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a._id}>
              <td>{a.patient?.name}</td>
              <td>{a.doctor?.name}</td>
              <td>{a.startAt}</td>
              <td>{a.endAt}</td>
              <td>
                <button className="action delete"
                  onClick={() => deleteAppt(a._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default App;
