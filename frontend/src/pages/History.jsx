import { useState, useEffect } from "react";
import api from "../api/api";
import {
  History as HistoryIcon,
  Download,
  Loader2,
  Search,
} from "lucide-react";

export default function History() {
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [filter, setFilter] = useState({ month: "", year: "" });

  const fetchSlips = async () => {
    setLoading(true);
    try {
      const activeFilters = {};
      // Only add to object if there is a real value
      if (filter.month && filter.month !== "")
        activeFilters.month = filter.month;
      if (filter.year && filter.year !== "") activeFilters.year = filter.year;

      const params = new URLSearchParams(activeFilters).toString();

      // If params is empty, this becomes just "/payslips"
      const { data } = await api.get(`/payslips${params ? `?${params}` : ""}`);
      setSlips(data);
    } catch (err) {
      console.error("Error fetching slips:", err);
    } finally {
      setLoading(false);
    }
  };

  // This will run once on mount (to show all)
  // and then every time the user types in the filter boxes
  useEffect(() => {
    fetchSlips();
  }, [filter]);

  const handleDownload = async (slipId, month, year) => {
    setDownloadingId(slipId);
    try {
      const response = await api.get(`/payslips/${slipId}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payslip_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HistoryIcon className="text-blue-600" /> Payslip History
        </h1>

        {/* Filter Section */}
        <div className="flex flex-wrap gap-3 bg-white p-2 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 px-2 text-slate-400 border-r">
            <Search size={18} />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <input
            type="number"
            placeholder="Month (MM)"
            className="w-28 p-1 text-sm outline-none"
            value={filter.month}
            onChange={(e) => setFilter({ ...filter, month: e.target.value })}
          />
          <input
            type="number"
            placeholder="Year (YYYY)"
            className="w-28 p-1 text-sm outline-none border-l pl-3"
            value={filter.year}
            onChange={(e) => setFilter({ ...filter, year: e.target.value })}
          />
          {(filter.month || filter.year) && (
            <button
              onClick={() => setFilter({ month: "", year: "" })}
              className="text-xs text-red-500 hover:underline px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-200">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="text-slate-500 font-medium">
              Fetching records...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b text-slate-600 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="p-4">Employee Details</th>
                  <th className="p-4">Pay Period</th>
                  <th className="p-4">Net Amount</th>
                  <th className="p-4">Email Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slips.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">
                        {s.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {s.pan}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-700">
                        {new Date(0, s.month - 1).toLocaleString("default", {
                          month: "long",
                        })}{" "}
                        {s.year}
                      </span>
                      <span className="ml-2 text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-full text-slate-600">
                        v{s.version}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-blue-700 font-bold">
                        ₹{parseFloat(s.net_pay).toLocaleString("en-IN")}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          s.email_status === "SENT"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {s.email_status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDownload(s.id, s.month, s.year)}
                        disabled={downloadingId === s.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all font-semibold text-sm disabled:opacity-50"
                      >
                        {downloadingId === s.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                        {downloadingId === s.id ? "Working..." : "PDF"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {slips.length === 0 && (
              <div className="p-20 text-center">
                <div className="text-slate-300 mb-2 font-bold text-lg">
                  Empty State
                </div>
                <div className="text-slate-400">
                  No payslip records found for the current selection.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
