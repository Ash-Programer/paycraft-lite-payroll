import { useState, useEffect } from "react";
import api from "../api/api";
import {
  Plus,
  Users,
  Search,
  X,
  Briefcase,
  Wallet,
  UserCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // Initial Form State matching your exact API payload
  const initialForm = {
    name: "",
    email: "",
    password: "password123", // Default as per requirement 3.1
    pan: "",
    bank_account: "",
    department: "",
    designation: "",
    doj: "",
    monthly_ctc: "",
    structure: {
      basic: "",
      hra: "",
      special_allowance: "",
      employer_pf: "",
    },
  };

  const [form, setForm] = useState(initialForm);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/employees");
      setEmployees(data);
    } catch (err) {
      setStatus({ type: "error", message: "Failed to fetch employees" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Saving employee..." });

    try {
      await api.post("/employees", form);
      setStatus({ type: "success", message: "Employee added successfully!" });
      setForm(initialForm);
      setTimeout(() => {
        setShowModal(false);
        setStatus({ type: "", message: "" });
      }, 1500);
      fetchEmployees();
    } catch (err) {
      const errorMsg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        "Submission failed";
      setStatus({ type: "error", message: errorMsg });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Users className="text-blue-600" size={32} />
            Employee Directory
          </h1>
          <p className="text-slate-500 mt-1">
            Manage staff records and salary configurations.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={20} /> Add New Employee
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-600" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-5">Employee Info</th>
                  <th className="p-5">Position</th>
                  <th className="p-5">Joining Date</th>
                  <th className="p-5 text-right">Monthly CTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {emp.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-slate-700 font-medium">
                        {emp.designation}
                      </div>
                      <div className="text-xs text-slate-400">
                        {emp.department}
                      </div>
                    </td>
                    <td className="p-5 text-slate-600 text-sm">
                      {new Date(emp.date_of_joining).toLocaleDateString()}
                    </td>
                    <td className="p-5 text-right">
                      <span className="font-bold text-slate-900">
                        ₹{parseFloat(emp.monthly_ctc).toLocaleString("en-IN")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {employees.length === 0 && (
              <div className="p-20 text-center text-slate-400">
                No employees found. Start by adding one.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modern Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-100">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-slate-800">
                Onboard Employee
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {status.message && (
                <div
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
                >
                  {status.type === "loading" ? (
                    <Loader2 className="animate-spin" />
                  ) : status.type === "success" ? (
                    <CheckCircle />
                  ) : null}
                  {status.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section 1: Personal info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase text-blue-600 flex items-center gap-2 mb-4">
                    <UserCircle size={16} /> Basic Information
                  </h3>
                  <div className="space-y-4">
                    <input
                      placeholder="Full Name"
                      className="w-full p-3 border rounded-xl"
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                    />
                    <input
                      placeholder="Email Address"
                      type="email"
                      className="w-full p-3 border rounded-xl"
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                    />
                    <input
                      placeholder="PAN Number (e.g. ABCDE1234F)"
                      className="w-full p-3 border rounded-xl uppercase"
                      onChange={(e) =>
                        setForm({ ...form, pan: e.target.value })
                      }
                      required
                    />
                    <input
                      placeholder="Bank Account Number"
                      className="w-full p-3 border rounded-xl"
                      onChange={(e) =>
                        setForm({ ...form, bank_account: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Section 2: Work Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase text-blue-600 flex items-center gap-2 mb-4">
                    <Briefcase size={16} /> Job Details
                  </h3>
                  <div className="space-y-4">
                    <input
                      placeholder="Department"
                      className="w-full p-3 border rounded-xl"
                      onChange={(e) =>
                        setForm({ ...form, department: e.target.value })
                      }
                      required
                    />
                    <input
                      placeholder="Designation"
                      className="w-full p-3 border rounded-xl"
                      onChange={(e) =>
                        setForm({ ...form, designation: e.target.value })
                      }
                      required
                    />
                    <div className="flex flex-col">
                      <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                        Date of Joining
                      </label>
                      <input
                        type="date"
                        className="w-full p-3 border rounded-xl"
                        onChange={(e) =>
                          setForm({ ...form, doj: e.target.value })
                        }
                        required
                      />
                    </div>
                    <input
                      placeholder="Monthly CTC (Total)"
                      type="number"
                      className="w-full p-3 border-2 border-blue-100 rounded-xl bg-blue-50/30 font-bold"
                      onChange={(e) =>
                        setForm({ ...form, monthly_ctc: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Section 3: Salary Breakdown (The 'structure' object) */}
                <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold uppercase text-slate-500 flex items-center gap-2 mb-2">
                    <Wallet size={16} /> Salary Structure Breakdown (Monthly)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 ml-1">
                        BASIC
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-xl bg-white"
                        placeholder="e.g. 50000"
                        onChange={(e) =>
                          setForm({
                            ...form,
                            structure: {
                              ...form.structure,
                              basic: e.target.value,
                            },
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 ml-1">
                        HRA
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-xl bg-white"
                        placeholder="e.g. 20000"
                        onChange={(e) =>
                          setForm({
                            ...form,
                            structure: {
                              ...form.structure,
                              hra: e.target.value,
                            },
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 ml-1">
                        SPECIAL ALLOWANCE
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-xl bg-white"
                        placeholder="e.g. 10000"
                        onChange={(e) =>
                          setForm({
                            ...form,
                            structure: {
                              ...form.structure,
                              special_allowance: e.target.value,
                            },
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 ml-1">
                        EMPLOYER PF
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-xl bg-white"
                        placeholder="e.g. 1800"
                        onChange={(e) =>
                          setForm({
                            ...form,
                            structure: {
                              ...form.structure,
                              employer_pf: e.target.value,
                            },
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition"
                >
                  Save Employee Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
