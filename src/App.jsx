import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState({ company: "", role: "" });

  // One helper for all API calls: adds the token and handles errors
  async function request(path, options = {}) {
    const res = await fetch(API + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong");
    return data;
  }

  // Load jobs when the user logs in
  useEffect(() => {
    if (token) loadJobs();
  }, [token]);

  async function loadJobs() {
    try {
      setJobs(await request("/jobs"));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAuth() {
    setError("");
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const data = await request(path, { method: "POST", body: JSON.stringify(form) });
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    }
  }

  async function addJob() {
    setError("");
    try {
      const created = await request("/jobs", { method: "POST", body: JSON.stringify(job) });
      setJobs([created, ...jobs]);
      setJob({ company: "", role: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(id, status) {
    try {
      const updated = await request(`/jobs/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setJobs(jobs.map((j) => (j._id === id ? updated : j)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteJob(id) {
    try {
      await request(`/jobs/${id}`, { method: "DELETE" });
      setJobs(jobs.filter((j) => j._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setJobs([]);
  }

  // ---------- Not logged in: show login / register ----------
  if (!token) {
    return (
      <div style={{ maxWidth: 360, margin: "40px auto" }}>
        <h2>{mode === "login" ? "Login" : "Register"}</h2>
        {mode === "register" && (
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button onClick={handleAuth}>{mode === "login" ? "Login" : "Create account"}</button>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Need an account? Register" : "Have an account? Login"}
        </button>
      </div>
    );
  }

  // ---------- Logged in: show jobs ----------
  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <button onClick={logout}>Logout</button>
      <h2>My Job Applications</h2>

      <input
        placeholder="Company"
        value={job.company}
        onChange={(e) => setJob({ ...job, company: e.target.value })}
      />
      <input
        placeholder="Role"
        value={job.role}
        onChange={(e) => setJob({ ...job, role: e.target.value })}
      />
      <button onClick={addJob}>Add job</button>
      <p style={{ color: "red" }}>{error}</p>

      {jobs.length === 0 && <p>No jobs yet. Add your first one above.</p>}

      {jobs.map((j) => (
        <div key={j._id} style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
          <b>{j.company}</b> - {j.role}{" "}
          <select value={j.status} onChange={(e) => updateStatus(j._id, e.target.value)}>
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>{" "}
          <button onClick={() => deleteJob(j._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}