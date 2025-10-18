import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import DashboardHeader from "../components/DashboardHeader";
import { AuthContext } from "../context/AuthContext";
import { XMarkIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { BaseUrl } from "../../Urls";

// Reusable GlassCard
const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg rounded-2xl ${className}`}
  >
    {children}
  </div>
);

// Action Button
const ActionButton = ({
  children,
  onClick,
  disabled = false,
  type = "button",
}) => (
  <button
    onClick={onClick}
    type={type}
    disabled={disabled}
    className={`w-full sm:!w-[68%] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors`}
  >
    {children}
  </button>
);

// Customer Dropdown with search
const CustomerDropdown = ({
  customers,
  selectedCustomer,
  setSelectedCustomer,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full !py-[0.75rem] !px-4 !bg-none !bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-gray-100 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      >
        {selectedCustomer ? (
          <div className="flex flex-col items-start leading-tight">
            <span className="font-medium">{selectedCustomer.name}</span>
            <span className="text-sm text-gray-300">
              {selectedCustomer.email}
            </span>
          </div>
        ) : (
          "Select Customer"
        )}
        <span className="ml-2">▼</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 w-full max-h-[250px] overflow-y-auto mt-1 bg-[#4a4c4d] border border-white/20 rounded-lg shadow-lg z-[9999] scrollwidth">
          <div className="sticky top-0 bg-[#4a4c4d] p-2 border-b border-white/20">
            <input
              type="text"
              placeholder="Search customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white/10 text-gray-100 placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((c, idx) => (
              <div
                key={c._id}
                className={`w-full cursor-pointer hover:bg-gray-200 hover:text-black transition-colors ${
                  idx !== filteredCustomers.length - 1
                    ? "border-b border-gray-400/50"
                    : ""
                }`}
                onClick={() => {
                  setSelectedCustomer(c);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <div className="px-4 py-2 w-full">
                  {c.name} <br /> ({c.email})
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-300">No customers found</div>
          )}
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [unitsConsumed, setUnitsConsumed] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");
  const [searchTerm, setSearchTerm] = useState("");
  const [editBill, setEditBill] = useState(null);
  const [editUnits, setEditUnits] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editStatus, setEditStatus] = useState("");

  // New states for year/month filter
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        `${BaseUrl}/api/admin/customers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Fetch bills
  const fetchBills = async () => {
    try {
      const res = await axios.get(`${BaseUrl}/api/admin/bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBills(res.data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchBills();
  }, [token]);

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !unitsConsumed) {
      setMessage("⚠️ Please select a customer and enter units consumed.");
      setMessageType("error");
      return;
    }

    const units = parseFloat(unitsConsumed);
    if (units <= 0) {
      setMessage("⚠️ Units consumed must be greater than zero.");
      setMessageType("error");
      return;
    }

    const wheelingCharge = 1.24;
    let amount = 0;
    if (units <= 100) amount = units * (4.43 + wheelingCharge);
    else if (units <= 300)
      amount =
        100 * (4.43 + wheelingCharge) + (units - 100) * (9.64 + wheelingCharge);
    else if (units <= 500)
      amount =
        100 * (4.43 + wheelingCharge) +
        200 * (9.64 + wheelingCharge) +
        (units - 300) * (12.83 + wheelingCharge);
    else
      amount =
        100 * (4.43 + wheelingCharge) +
        200 * (9.64 + wheelingCharge) +
        200 * (12.83 + wheelingCharge) +
        (units - 500) * (14.33 + wheelingCharge);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    try {
      await axios.post(
        `${BaseUrl}/api/admin/bills`,
        {
          user: selectedCustomer._id,
          units,
          amount: parseFloat(amount.toFixed(2)),
          dueDate: dueDate.toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchBills();
      setSelectedCustomer(null);
      setUnitsConsumed("");
      setMessage(
        `✅ Bill generated successfully! Amount: ₹${parseFloat(
          amount.toFixed(2)
        )}`
      );
      setMessageType("success");
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "❌ Error generating bill.");
      setMessageType("error");
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDeleteBill = async (id) => {
    try {
      await axios.delete(`${BaseUrl}/api/admin/bills/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBills();
      setMessage("🗑️ Bill deleted successfully.");
      setMessageType("success");
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("❌ Error deleting bill.");
      setMessageType("error");
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const openEditModal = (bill) => {
    setEditBill(bill);
    setEditUnits(bill.units);
    setEditAmount(bill.amount);
    setEditDueDate(bill.dueDate?.slice(0, 10));
    setEditStatus(bill.status);
  };

  const handleSaveEdit = async () => {
    if (!editBill) return;

    try {
      await axios.put(
        `${BaseUrl}/api/admin/bills/${editBill._id}`,
        {
          units: editUnits,
          amount: editAmount,
          dueDate: editDueDate,
          status: editStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchBills();
      setEditBill(null);
      setMessage("✅ Bill updated successfully.");
      setMessageType("success");
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error("Update error:", error);
      setMessage(error.response?.data?.message || "❌ Error updating bill.");
      setMessageType("error");
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Filter bills
  const filteredBills = bills
    .filter(
      (bill) =>
        bill.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((bill) => {
      if (!filterYear && !filterMonth) return true;
      const issue = new Date(bill.issueDate);
      const yearMatch = filterYear ? issue.getFullYear() === parseInt(filterYear) : true;
      const monthMatch = filterMonth ? issue.getMonth() + 1 === parseInt(filterMonth) : true;
      return yearMatch && monthMatch;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.issueDate) -
        new Date(a.createdAt || a.issueDate)
    );

  // Generate year options dynamically
  const years = Array.from(
    new Set(bills.map((b) => new Date(b.issueDate).getFullYear()))
  ).sort((a, b) => b - a);

  const months = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  return (
    <div className="min-h-screen flex flex-col relative lg:flex-row bg-gradient-to-tr from-[#232526] to-[#414345] text-white p-4 sm:p-6 overflow-hidden">
      {/* Floating message */}
      {message && (
        <div
          className={`fixed z-50 flex items-center justify-between w-[90%] max-w-2xl px-4 py-3 rounded-lg shadow-lg border ${
            messageType === "error"
              ? "bg-red-500/20 text-red-400 border-red-400/30"
              : "bg-green-500/20 text-green-400 border-green-400/30"
          } top-14 sm:top-4 md:top-6 left-1/2 transform -translate-x-1/2`}
        >
          <span className="text-sm font-medium">{message}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-4 text-white text-lg font-bold hover:text-gray-300 !bg-transparent !bg-none !shadow-none"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      <main className="flex-1 relative z-10 space-y-8 px-4 sm:px-6 lg:px-16 xl:px-24">
        <DashboardHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4 border-b border-white/20 pb-2">
                My Profile
              </h2>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-semibold text-gray-200">Name:</span>{" "}
                  {user?.name}
                </p>
                <p>
                  <span className="font-semibold text-gray-200">Email:</span>{" "}
                  {user?.email}
                </p>
                <p>
                  <span className="font-semibold text-gray-200">Role:</span>{" "}
                  {user?.role}
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Generate Bill + Table */}
          <div className="lg:col-span-2 space-y-8">
            {/* Generate Bill */}
            <GlassCard className="p-6 overflow-visible relative z-10">
              <h2 className="text-xl font-semibold mb-4">Generate Bill</h2>
              <hr className="border-white/20 mb-4" />
              <form
                onSubmit={handleGenerateBill}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <CustomerDropdown
                  customers={customers}
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                />
                <input
                  type="number"
                  placeholder="Units Consumed (kWh)"
                  value={unitsConsumed}
                  onChange={(e) => setUnitsConsumed(e.target.value)}
                  className="w-full sm:w-auto bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200"
                />
                <ActionButton type="submit">Generate Bill</ActionButton>
              </form>
            </GlassCard>

            {/* All Bills Table with fixed header */}
            <GlassCard className="p-6">
  <h2 className="text-xl font-semibold mb-2">All Bills</h2>
  <hr className="border-white/20 mb-4" />

  {/* Search + Filters */}
  <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
    <input
      type="text"
      placeholder="Search by name, email or status..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full sm:w-1/2 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
    <select
      value={filterYear}
      onChange={(e) => setFilterYear(e.target.value)}
      className="w-full sm:w-1/4 bg-[#4a4c4d] shadow-[1px_2px_4px_rgb(32,32,32)] border border-white/20 rounded-lg px-4 py-2 text-gray-200"
    >
      <option value="">All Years</option>
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
    <select
      value={filterMonth}
      onChange={(e) => setFilterMonth(e.target.value)}
      className="w-full sm:w-1/4 bg-[#4a4c4d] shadow-[1px_2px_4px_rgb(32,32,32)] border border-white/20 rounded-lg px-4 py-2 text-gray-200"
    >
      <option value="">All Months</option>
      {months.map((m) => (
        <option key={m.value} value={m.value}>
          {m.name}
        </option>
      ))}
    </select>
  </div>

  {/* Responsive table wrapper */}
  <div className="overflow-x-auto w-full scrollwidth">
    <div className="inline-block min-w-[800px] w-full scrollwidth" style={{ maxHeight: "50vh", overflowY: "auto" }}>
      <table className="w-full text-sm text-left border-collapse">
        {/* Table Head */}
        <thead className="text-gray-300 uppercase text-xs border-b border-white/20 sticky top-0 bg-[#2d2f31] z-10">
          <tr>
            <th className="p-3 sm:p-4">Customer</th>
            <th className="p-3 sm:p-4">Email</th>
            <th className="p-3 sm:p-4">Units</th>
            <th className="p-3 sm:p-4">Amount</th>
            <th className="p-3 sm:p-4">Issue Date</th>
            <th className="p-3 sm:p-4">Due Date</th>
            <th className="p-3 sm:p-4">Status</th>
            <th className="p-3 sm:p-4">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-white/20">
          {filteredBills.length > 0 ? (
            filteredBills.map((bill) => (
              <tr key={bill._id} className="hover:bg-white/10 transition-colors">
                <td className="p-3 sm:p-4 text-white">{bill.user?.name}</td>
                <td className="p-3 sm:p-4 text-gray-300">{bill.user?.email}</td>
                <td className="p-3 sm:p-4 text-gray-200">{bill.units} kWh</td>
                <td className="p-3 sm:p-4 text-gray-200">₹{bill.amount}</td>
                <td className="p-3 sm:p-4 text-gray-400">{bill.issueDate?.slice(0, 10)}</td>
                <td className="p-3 sm:p-4 text-gray-400">{bill.dueDate?.slice(0, 10)}</td>
                <td className="p-3 sm:p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      bill.status === "paid"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {bill.status}
                  </span>
                </td>
                <td className="p-3 sm:p-4 flex gap-2">
                  <PencilIcon
                    onClick={() => openEditModal(bill)}
                    className="w-5 h-5 text-yellow-400 cursor-pointer hover:text-yellow-300"
                  />
                  <TrashIcon
                    onClick={() => handleDeleteBill(bill._id)}
                    className="w-5 h-5 text-red-400 cursor-pointer hover:text-red-300"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center text-gray-300 py-12">
                No bills found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</GlassCard>

          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#2d2f31] p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Bill</h2>
            <div className="space-y-3">
              <input
                type="number"
                value={editUnits}
                onChange={(e) => setEditUnits(e.target.value)}
                placeholder="Units"
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-gray-200"
              />
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Amount"
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-gray-200"
              />
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-gray-200"
              />
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full bg-[#4a4c4d] border border-white/20 rounded px-3 py-2 text-gray-200"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditBill(null)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
