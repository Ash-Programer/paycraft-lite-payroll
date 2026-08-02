import { useState, useEffect } from "react";
import api from "../api/api";
import { FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function GenerateSlip() {
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" }); // { type: 'success' | 'error', message: '' }

  // Initial Form State
  const initialFormState = {
    employeeId: "",
    month: new Date().getMonth(), // Defaults to previous month (0-indexed logic)
    year: new Date().getFullYear(),
    lopDays: 0,
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    // Fetch employee list for the dropdown
    api
      .get("/employees")
      .then((res) => setEmps(res.data))
      .catch(() =>
        setStatus({ type: "error", message: "Failed to load employee list" }),
      );
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await api.post("/payslips/generate", form);

      // 1. Show Success Message
      setStatus({
        type: "success",
        message: `Success! Payslip generated and emailed to the employee.`,
      });

      // 2. Clear Form (Requirement: all fields emptied)
      setForm({
        employeeId: "",
        month: "",
        year: new Date().getFullYear(),
        lopDays: 0,
      });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Error generating slip. Please check inputs.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FileText className="text-blue-400" />
            Payroll Generation
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate a monthly salary slip and send it via email automatically.
          </p>
        </div>

        <div className="p-8">
          {/* Status Messages */}
          {status.message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                status.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span className="font-medium">{status.message}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Select Employee
              </label>
              <select
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={form.employeeId}
                onChange={(e) =>
                  setForm({ ...form, employeeId: e.target.value })
                }
                required
              >
                <option value="">-- Choose an employee --</option>
                {emps.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {e.designation}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Month */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Month (1-12)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  placeholder="e.g. 10"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={form.month}
                  onChange={(e) => setForm({ ...form, month: e.target.value })}
                  required
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  placeholder="e.g. 2023"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* LOP Days */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Loss of Pay (LOP) Days
              </label>
              <input
                type="number"
                min="0"
                max="31"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={form.lopDays}
                onChange={(e) => setForm({ ...form, lopDays: e.target.value })}
                required
              />
              <p className="text-xs text-slate-400 mt-2 italic">
                * This will prorate the Basic, HRA, and Allowances for this
                month.
              </p>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center gap-3 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Calculating & Generating...
                </>
              ) : (
                "Generate & Email Payslip"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
