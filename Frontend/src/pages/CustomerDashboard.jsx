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
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import CountUp from "react-countup";
import { BaseUrl } from "../../Urls";

// Reusable GlassCard Component
const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg rounded-2xl ${className}`}
  >
    {children}
  </div>
);

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CustomerDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [allConsumptionData, setAllConsumptionData] = useState([]);
  const [consumptionData, setConsumptionData] = useState([]);
  const [totalDue, setTotalDue] = useState(0);

  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [availableYears, setAvailableYears] = useState([]);

  // Unit Calculator states
  const [calculatorUnits, setCalculatorUnits] = useState("");
  const [calculatorAmount, setCalculatorAmount] = useState(null);
  const [calculatorInfo, setCalculatorInfo] = useState("");
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .razorpay-container {
        backdrop-filter: blur(20px) !important;
        background-color: rgba(255, 255, 255, 0.05) !important;
        border-radius: 1rem !important;
        max-width: 450px !important;
        width: 90% !important;
        margin: 0 auto !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchBills = async () => {
      try {
        const res = await axios.get(`${BaseUrl}/api/customer/bills`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBills(res.data);

        const due = res.data
          .filter((b) => b.status === "unpaid")
          .reduce((acc, b) => acc + b.amount, 0);
        setTotalDue(due);

        const years = Array.from(
          new Set(res.data.map((b) => new Date(b.issueDate).getFullYear()))
        ).sort();
        setAvailableYears(years);
      } catch (error) {
        console.error("Error fetching bills", error);
      }
    };

    const fetchPayments = async () => {
      try {
        const res = await axios.get(`${BaseUrl}/api/customer/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(res.data);
      } catch (error) {
        console.error("Error fetching payments", error);
      }
    };

    const fetchConsumption = async () => {
      try {
        const res = await axios.get(`${BaseUrl}/api/customer/consumption`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllConsumptionData(res.data);

        const years = Array.from(
          new Set(res.data.map((item) => item.year))
        ).sort();
        setAvailableYears((prev) =>
          Array.from(new Set([...prev, ...years])).sort()
        );
      } catch (error) {
        console.error("Error fetching consumption data", error);
      }
    };

    fetchBills();
    fetchPayments();
    fetchConsumption();
  }, [user, token]);

  // Aggregate consumption data
  useEffect(() => {
    if (!allConsumptionData.length) return;

    let filtered = allConsumptionData.filter((d) => d.year === selectedYear);
    if (selectedMonth > 0)
      filtered = filtered.filter((d) => d.month === selectedMonth);

    const monthMap = {};
    filtered.forEach((item) => {
      const key = item.month;
      if (!monthMap[key]) monthMap[key] = 0;
      monthMap[key] += item.units;
    });

    const chartData = Object.keys(monthMap)
      .sort((a, b) => a - b)
      .map((m) => ({ month: monthNames[m - 1], units: monthMap[m] }));

    setConsumptionData(chartData);
  }, [allConsumptionData, selectedYear, selectedMonth]);

  const handlePayBill = async (bill) => {
    try {
      const res = await axios.post(
        `${BaseUrl}/api/customer/razorpay/order`,
        { amount: bill.amount, billId: bill._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, key, amount } = res.data;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "PowerPe",
        description: "Electricity Bill Payment",
        image: "/LogoP.png",
        order_id: orderId,
        handler: async function (response) {
          setIsRazorpayOpen(false);
          const verifyRes = await axios.post(
            `${BaseUrl}/api/customer/razorpay/verify`,
            { ...response, billId: bill._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (verifyRes.data.success) {
            alert("Payment Successful ✅");
            window.location.reload();
          } else {
            alert("Payment Verification Failed ❌");
          }
        },
        modal: {
          ondismiss: function () {
            setIsRazorpayOpen(false);
          },
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#4a4c4d" },
      };

      const razor = new window.Razorpay(options);
      setIsRazorpayOpen(true);
      razor.open();
    } catch (error) {
      console.error("Payment Error:", error);
      setIsRazorpayOpen(false);
      alert("Something went wrong with payment!");
    }
  };

  const handleCalculateUnits = () => {
    const units = parseFloat(calculatorUnits);
    if (!units || units <= 0) {
      setCalculatorAmount(null);
      setCalculatorInfo("Enter valid units");
      return;
    }

    const wheelingCharge = 1.24;
    let amount = 0;
    let details = "";

    if (units <= 100) {
      amount = units * (4.43 + wheelingCharge);
      details = `0-100 Units: ₹4.43/unit + Wheeling ₹${wheelingCharge}`;
    } else if (units <= 300) {
      amount =
        100 * (4.43 + wheelingCharge) + (units - 100) * (9.64 + wheelingCharge);
      details = `0-100: ₹4.43 + ₹${wheelingCharge}, 101-${units}: ₹9.64 + ₹${wheelingCharge}`;
    } else if (units <= 500) {
      amount =
        100 * (4.43 + wheelingCharge) +
        200 * (9.64 + wheelingCharge) +
        (units - 300) * (12.83 + wheelingCharge);
      details = `0-100: ₹4.43 + ₹${wheelingCharge}, 101-300: ₹9.64 + ₹${wheelingCharge}, 301-${units}: ₹12.83 + ₹${wheelingCharge}`;
    } else {
      amount =
        100 * (4.43 + wheelingCharge) +
        200 * (9.64 + wheelingCharge) +
        200 * (12.83 + wheelingCharge) +
        (units - 500) * (14.33 + wheelingCharge);
      details = `0-100: ₹4.43 + ₹${wheelingCharge}, 101-300: ₹9.64 + ₹${wheelingCharge}, 301-500: ₹12.83 + ₹${wheelingCharge}, 501+: ₹14.33 + ₹${wheelingCharge}`;
    }

    setCalculatorAmount(amount.toFixed(2));
    setCalculatorInfo(details);
  };

  // Filtered bills and payments for table display
  const filteredBills = bills.filter((bill) => {
    const date = new Date(bill.issueDate);
    const yearMatch = date.getFullYear() === selectedYear;
    const monthMatch =
      selectedMonth === 0 || date.getMonth() + 1 === selectedMonth;
    return yearMatch && monthMatch;
  });

  const filteredPayments = payments.filter((p) => {
    const date = new Date(p.createdAt);
    const yearMatch = date.getFullYear() === selectedYear;
    const monthMatch =
      selectedMonth === 0 || date.getMonth() + 1 === selectedMonth;
    return yearMatch && monthMatch;
  });

  return (
    <div
      className={`min-h-screen relative text-white p-4 overflow-hidden transition-all duration-700 ${
        isRazorpayOpen
          ? "backdrop-blur-2xl brightness-56 scale-[0.99999] bg-black/55"
          : "bg-gradient-to-tr from-[#232526] to-[#414345]"
      }`}
    >
      {/* Floating background blobs */}
      <div className="absolute w-96 h-96 bg-yellow-500 rounded-full filter blur-3xl opacity-30 top-[-100px] left-[-100px]"></div>
      <div className="absolute w-72 h-72 bg-yellow-500 rounded-full filter blur-3xl opacity-30 bottom-[-50px] right-[-50px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <DashboardHeader />
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Dashboard</h2>

        {/* Grid layout: mimic AdminDashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Profile Card */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold">My Profile</h3>
              <hr className="border-white/20 mb-3" />
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

            {/* Total Due Card */}
            <GlassCard className="p-6 flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-semibold">Total Amount Due</h3>
              <hr className="border-white/20 mb-3" />
              <h2 className="text-3xl font-bold text-green-400 mt-2">
                <CountUp
                  start={0}
                  end={totalDue}
                  duration={2} // animation duration in seconds
                  separator=","
                  decimals={2}
                  prefix="₹"
                />
              </h2>
            </GlassCard>
          </div>

          {/* Right Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Unit Calculator */}
            <GlassCard className="p-6 min-h-[220px] flex flex-col justify-between">
              <h3 className="text-lg font-semibold">Unit Calculator</h3>
              <hr className="border-white/20 mb-3" />
              <div>
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                  <input
                    type="number"
                    placeholder="Enter units consumed"
                    value={calculatorUnits}
                    onChange={(e) => setCalculatorUnits(e.target.value)}
                    className="w-full sm:w-[60%] bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-gray-200"
                  />
                  <button
                    onClick={handleCalculateUnits}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
                  >
                    Calculate
                  </button>
                </div>
                <div className="text-gray-300 mt-2">
                  <p className="text-sm">
                    Rate Applied:{" "}
                    <span className="text-yellow-400 font-semibold">
                      {calculatorInfo || "—"}
                    </span>
                  </p>
                  <p className="mt-1 font-semibold">
                    Total Amount:{" "}
                    <span className="text-green-400">
                      {calculatorAmount ? `₹${calculatorAmount}` : "₹0.00"}
                    </span>
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Consumption History */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold">
                Consumption History (kWh)
              </h3>
              <hr className="border-white/20 mb-3" />

              {/* Filters */}
              <div className="flex justify-end gap-2 mb-3">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-[#4a4c4d] text-white px-2 py-1 rounded !w-[150px]"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-[#4a4c4d] text-white px-2 py-1 rounded !w-[150px]"
                >
                  <option value={0}>All Months</option>
                  {monthNames.map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {consumptionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={consumptionData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="month" stroke="#ccc" />
                    <YAxis
                      stroke="#ccc"
                      label={{
                        value: "Units",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#ccc",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f1f1f",
                        border: "none",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <defs>
                      <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="100%" stopColor="#FF8C00" />
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="units"
                      fill="url(#barColor)"
                      name="Months"
                      barSize={40}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-300 text-center">
                  No consumption data available
                </p>
              )}
            </GlassCard>

            {/* Bill History with filters */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold">Bill History</h3>
              <hr className="border-white/20 mb-3" />

              {/* Filters */}
              <div className="flex justify-end gap-2 mb-3">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-[#4a4c4d] text-white px-2 py-1 rounded !w-[150px]"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-[#4a4c4d] text-white px-2 py-1 rounded !w-[150px]"
                >
                  <option value={0}>All Months</option>
                  {monthNames.map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto scrollwidth">
                <div
                  className="inline-block min-w-[700px] w-full scrollwidth"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-gray-300 uppercase text-xs border-b border-white/20 sticky top-0 bg-[#1f1f1f] z-10">
                      <tr>
                        <th className="p-3">Issue Date</th>
                        <th className="p-3">Due Date</th>
                        <th className="p-3">Units</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20">
                      {filteredBills.length > 0 ? (
                        [...filteredBills]
                          .sort(
                            (a, b) =>
                              new Date(b.issueDate) - new Date(a.issueDate)
                          )
                          .map((bill) => (
                            <tr key={bill._id}>
                              <td className="p-3 text-white">
                                {bill.issueDate?.slice(0, 10)}
                              </td>
                              <td className="p-3 text-gray-200">
                                {bill.dueDate?.slice(0, 10)}
                              </td>
                              <td className="p-3 text-gray-200">
                                {bill.units}
                              </td>
                              <td className="p-3 text-gray-200">
                                ₹{bill.amount}
                              </td>
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
                                  <button
                                    className="text-green-400 hover:underline"
                                    onClick={() => handlePayBill(bill)}
                                  >
                                    Pay
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center text-gray-300 py-6"
                          >
                            No bills found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </GlassCard>

            {/* Payment History with filters */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold">Payment History</h3>
              <hr className="border-white/20 mb-3" />

              {/* Filters */}
              <div className="flex justify-end gap-2 mb-3">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-[#4a4c4d] text-white px-2 py-1 rounded !w-[150px]"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-[#4a4c4d] text-white px-2 py-1 rounded !w-[150px]"
                >
                  <option value={0}>All Months</option>
                  {monthNames.map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto scrollbarnone">
                <div
                  className="inline-block min-w-[700px] w-full scrollwidth"
                  style={{
                    maxHeight: filteredPayments.length > 4 ? "300px" : "auto",
                    overflowY: filteredPayments.length > 4 ? "auto" : "visible",
                  }}
                >
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-gray-300 uppercase text-xs border-b border-white/20 sticky top-0 bg-[#1f1f1f] z-10">
                      <tr>
                        <th className="p-3">User Email</th>
                        <th className="p-3">Payment ID</th>
                        <th className="p-3">Bill ID</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Time</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20">
                      {filteredPayments.length > 0 ? (
                        [...filteredPayments]
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt)
                          )
                          .map((p, i) => (
                            <tr key={i}>
                              <td className="p-3 text-gray-200">
                                {p.userEmail}
                              </td>
                              <td className="p-3 text-gray-200">
                                {p.paymentId}
                              </td>
                              <td className="p-3 text-gray-200">{p.billId}</td>
                              <td className="p-3 text-gray-200">
                                {typeof p.amount === "number"
                                  ? `₹${p.amount}`
                                  : p.amount}
                              </td>
                              <td className="p-3 text-gray-200">{p.method}</td>
                              <td className="p-3 text-gray-200">
                                {new Date(p.createdAt).toLocaleString()}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    p.status === "completed"
                                      ? "bg-green-500/20 text-green-400"
                                      : p.status === "failed"
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-yellow-500/20 text-yellow-400"
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center text-gray-300 py-6"
                          >
                            No payment history found.
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
      </div>
    </div>
  );
};

export default CustomerDashboard;
