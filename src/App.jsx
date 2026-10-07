import { useState, useEffect } from "react";

const API = "https://job-api-zeek.onrender.com/api";
const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState({ company: "", role: "" });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

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
    if (!res.ok) {
      const err = new Error(data.message || "Something went wrong");
      err.status = res.status;
      throw err;
    }
    return data;
  }

  useEffect(() => {
    if (token) loadJobs();
  }, [token]);

  async function loadJobs() {
    try {
      setJobs(await request("/jobs"));
    } catch (err) {
      if (err.status === 401) logout(); // token expired
      else setError(err.message);
    }
  }

  async function handleAuth(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const data = await request(path, { method: "POST", body: JSON.stringify(form) });
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function addJob(e) {
    e.preventDefault();
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
    if (!window.confirm("Delete this job?")) return;
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
    setError("");
  }

  // ---------- Not logged in ----------
  if (!token) {
    return (
      <form className="auth-card" onSubmit={handleAuth}>
        <h2>{mode === "login" ? "Log in" : "Create account"}</h2>
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
        <button disabled={busy}>
          {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </button>
        <p className="error">{error}</p>
        <button
          type="button"
          className="link"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "Need an account? Register" : "Have an account? Log in"}
        </button>
      </form>
    );
  }

  // ---------- Logged in ----------
  const counts = Object.fromEntries(
    STATUSES.map((s) => [s, jobs.filter((j) => j.status === s).length])
  );

  const visible = jobs.filter(
    (j) =>
      (filter === "All" || j.status === filter) &&
      `${j.company} ${j.role}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div className="topbar">
        <h1>My Job Applications</h1>
        <button className="ghost" onClick={logout}>Log out</button>
      </div>

      <div className="stats">
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`stat ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(filter === s ? "All" : s)}
          >
            <b>{counts[s]}</b>
            <span>{s}</span>
          </button>
        ))}
      </div>

      <form className="add-form" onSubmit={addJob}>
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
        <button>Add job</button>
      </form>
      <p className="error">{error}</p>

      <div className="toolbar">
        <input
          placeholder="Search company or role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {visible.length === 0 && (
        <p className="empty">
          {jobs.length === 0 ? "No jobs yet. Add your first one above." : "No jobs match your search."}
        </p>
      )}

      {visible.map((j) => (
        <div className="job" key={j._id}>
          <div>
            <h3>{j.company}</h3>
            <p>{j.role}</p>
          </div>
          <div className="job-actions">
            <select
              className={`badge s-${j.status}`}
              value={j.status}
              onChange={(e) => updateStatus(j._id, e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button className="danger" onClick={() => deleteJob(j._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
