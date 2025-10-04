import React, { useEffect, useState, useContext } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg rounded-2xl ${className}`}
  >
    {children}
  </div>
);

const CustomerDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [consumptionData, setConsumptionData] = useState([]);
  const [totalDue, setTotalDue] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchBills = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/customer/bills",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBills(res.data);

        const due = res.data
          .filter((b) => b.status === "unpaid")
          .reduce((acc, b) => acc + b.amount, 0);
        setTotalDue(due);
      } catch (error) {
        console.error("Error fetching bills", error);
      }
    };

    const fetchPayments = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/customer/payments",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPayments(res.data);
      } catch (error) {
        console.error("Error fetching payments", error);
      }
    };

    const fetchConsumption = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/customer/consumption",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Format: [{ month: 'Jan', value: 120 }, ...]
        const formatted = res.data.map((item) => ({
          month: item.month,
          units: item.units,
        }));
        setConsumptionData(formatted);
      } catch (error) {
        console.error("Error fetching consumption data", error);
      }
    };

    fetchBills();
    fetchPayments();
    fetchConsumption();
  }, [user, token]);

  const handlePayAll = () => {
    alert("Redirect to Payment Gateway for all unpaid bills");
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-tr from-[#232526] to-[#414345] text-white p-4 overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute w-96 h-96 bg-yellow-500 rounded-full filter blur-3xl opacity-30 top-[-100px] left-[-100px]"></div>
      <div className="absolute w-72 h-72 bg-yellow-500 rounded-full filter blur-3xl opacity-30 bottom-[-50px] right-[-50px]"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        <DashboardHeader />

        <h2 className="text-2xl md:text-3xl font-bold mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile */}
          <GlassCard className="p-6 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">My Profile</h3>
            <div className="space-y-2 text-sm">
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

          {/* Total Due */}
          <GlassCard className="p-6 flex flex-col items-center justify-center text-center lg:col-span-1">
            <p className="text-gray-300 text-sm">Total Amount Due</p>
            <h2 className="text-3xl font-bold text-green-400 mt-2">
              ₹{totalDue.toFixed(2)}
            </h2>
            <button
              onClick={handlePayAll}
              disabled={totalDue === 0}
              className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 px-6 py-2 rounded-lg font-semibold"
            >
              Pay All Unpaid
            </button>
          </GlassCard>

          {/* Consumption History */}
          <GlassCard className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">
              Consumption History (kWh)
            </h3>
            {consumptionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="month" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="units" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-300 text-center">
                No consumption data available
              </p>
            )}
          </GlassCard>
        </div>

        {/* Bill History */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Bill History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="text-gray-300 uppercase text-xs border-b border-white/20">
                <tr>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Units (kWh)</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
  {bills.length > 0 ? (
    // Sort bills by issueDate descending (latest first)
    [...bills].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)).map((bill) => (
      <tr key={bill._id}>
        <td className="p-3 text-white">{bill.issueDate?.slice(0, 10)}</td>
        <td className="p-3 text-gray-200">{bill.dueDate?.slice(0, 10)}</td>
        <td className="p-3 text-gray-200">{bill.units}</td>
        <td className="p-3 text-gray-200">₹{bill.amount}</td>
        <td className="p-3">
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
        <td className="p-3">
          {bill.status === "unpaid" && (
            <button className="text-green-400 hover:underline">
              Pay
            </button>
          )}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" className="text-center text-gray-300 py-6">
        No bills found.
      </td>
    </tr>
  )}
</tbody>

            </table>
          </div>
        </GlassCard>

        {/* Payment History */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment History</h3>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="text-gray-300 uppercase text-xs border-b border-white/20">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td className="p-3 text-white">{p.date?.slice(0, 10)}</td>
                      <td className="p-3 text-gray-200">₹{p.amount}</td>
                      <td className="p-3 text-gray-300">{p.method}</td>
                      <td className="p-3 text-green-400">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-300 text-center">No payment records.</p>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default CustomerDashboard;
