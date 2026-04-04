import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBriefcase, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../../services/api";
import { getTailoredResumes, getCoverLetters } from "../../services/api";
import { SkeletonApplicationCard } from "../Common/Skeleton";
import toast from "react-hot-toast";

const statusColors = {
  Saved: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  Applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Interview:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Offer: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const ApplicationTracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    status: "Saved",
    dateApplied: new Date().toISOString().slice(0, 10),
    notes: "",
    tailoredResumeId: "",
    coverLetterId: "",
    jobDescription: "",
  });
  const [tailoredResumes, setTailoredResumes] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [apps, resumes, letters] = await Promise.all([
        getApplications(),
        getTailoredResumes(),
        getCoverLetters(),
      ]);

      let applicationsArray = Array.isArray(apps) ? apps : apps?.data || [];
      console.log("Applications array:", applicationsArray);

      const coverLettersArray = Array.isArray(letters)
        ? letters
        : letters?.data || [];

      setApplications(applicationsArray);
      setTailoredResumes(Array.isArray(resumes) ? resumes : []);
      setCoverLetters(coverLettersArray);

      if (applicationsArray.length === 0) {
        console.log("No applications found");
      }
    } catch (err) {
      console.error("Load data error:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      jobTitle: "",
      company: "",
      status: "Saved",
      dateApplied: new Date().toISOString().slice(0, 10),
      notes: "",
      tailoredResumeId: "",
      coverLetterId: "",
      jobDescription: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.dateApplied) delete payload.dateApplied;
      if (editingId) {
        await updateApplication(editingId, payload);
        toast.success("Application updated");
      } else {
        await createApplication(payload);
        toast.success("Application added");
      }
      setShowForm(false);
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this application?")) {
      try {
        await deleteApplication(id);
        toast.success("Deleted");
        loadData();
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleEdit = (app) => {
    setFormData({
      jobTitle: app.jobTitle,
      company: app.company,
      status: app.status,
      dateApplied: app.dateApplied?.slice(0, 10) || "",
      notes: app.notes || "",
      tailoredResumeId: app.tailoredResumeId || "",
      coverLetterId: app.coverLetterId || "",
      jobDescription: app.jobDescription || "",
    });
    setEditingId(app._id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonApplicationCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <FaBriefcase className="text-indigo-600 dark:text-indigo-400" />{" "}
          Application Tracker
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-1"
        >
          <FaPlus size={14} /> Add Application
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-auto"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              {editingId ? "Edit" : "Add"} Application
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Job Title *"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
                className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                required
              />
              <input
                type="text"
                placeholder="Company *"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                required
              />
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              >
                {Object.keys(statusColors).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <input
                type="date"
                value={formData.dateApplied}
                onChange={(e) =>
                  setFormData({ ...formData, dateApplied: e.target.value })
                }
                className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
              <select
                value={formData.tailoredResumeId}
                onChange={(e) =>
                  setFormData({ ...formData, tailoredResumeId: e.target.value })
                }
                className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              >
                <option value="">Link Tailored Resume (optional)</option>
                {tailoredResumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name ||
                      r.tailoredResume?.slice(0, 50) ||
                      "Tailored Resume"}
                  </option>
                ))}
              </select>
              <select
                value={formData.coverLetterId}
                onChange={(e) =>
                  setFormData({ ...formData, coverLetterId: e.target.value })
                }
                className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              >
                <option value="">Link Cover Letter (optional)</option>
                {coverLetters.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name || l.coverLetter?.slice(0, 50) || "Cover Letter"}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Notes"
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
              <textarea
                placeholder="Job Description (optional)"
                rows={4}
                value={formData.jobDescription}
                onChange={(e) =>
                  setFormData({ ...formData, jobDescription: e.target.value })
                }
                className="input-field bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Applications List */}
      <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        {applications.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No applications yet. Add your first job application.
          </p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-start bg-white dark:bg-gray-800"
              >
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                    {app.jobTitle}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {app.company}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[app.status]}`}
                    >
                      {app.status}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(app.dateApplied).toLocaleDateString()}
                    </span>
                  </div>
                  {app.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                      {app.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(app)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(app._id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationTracker;
