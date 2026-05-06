import React, { useEffect, useMemo, useState } from 'react'
import {
  dashboardStyles,
  trendStyles
} from '../assets/dummyStyles';

import {
  GAUGE_COLORS,
  COLORS
} from '../assets/color';

import { useOutletContext } from 'react-router-dom';
import {
  getTimeFrameRange,
  getPreviousTimeFrameRange,
  calculateData
} from "../components/Helpers";

import axios from 'axios';

import {
  ArrowDown,
  PieChart as PieChartIcon,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
  PiggyBank
} from 'lucide-react';

import FinancialCard from '../components/FinancialCard';
import GaugeCard from '../components/GaugeCard';

import {
  Cell,
  Legend,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

import AddTransactionModal from '../components/Add';

const API_BASE =`${import.meta.env.VITE_API_URL}/api`;

const getAuthHeader = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};
};

function toIsoWithClientTime(dateValue) {
  if (!dateValue) return new Date().toISOString();

  if (typeof dateValue === "string" && dateValue.length === 10) {
    const now = new Date();
    const hhmmss = now.toTimeString().slice(0, 8);
    return new Date(`${dateValue}T${hhmmss}`).toISOString();
  }

  return new Date(dateValue).toISOString();
}

const Dashboard = () => {

  const {
    transactions = [],
    timeFrame = "monthly",
    refreshTransactions
  } = useOutletContext();

  const [showModal, setShowModal] = useState(false);
  const [gaugeData, setGaugeData] = useState([]);
  const [overviewMeta, setOverviewMeta] = useState({});
  const [loading, setLoading] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "expense",
    category: "Food",
  });

  const timeFrameRange = useMemo(() => getTimeFrameRange(timeFrame), [timeFrame]);
  const prevTimeFrameRange = useMemo(() => getPreviousTimeFrameRange(timeFrame), [timeFrame]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= new Date(timeFrameRange.start) && d <= new Date(timeFrameRange.end);
    });
  }, [transactions, timeFrameRange]);

  const prevFilteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= new Date(prevTimeFrameRange.start) && d <= new Date(prevTimeFrameRange.end);
    });
  }, [transactions, prevTimeFrameRange]);

  const currentData = useMemo(() => {
    const data = calculateData(filteredTransactions);
    return { ...data, savings: data.income - data.expenses };
  }, [filteredTransactions]);

  const prevData = useMemo(() => {
    const data = calculateData(prevFilteredTransactions);
    return { ...data, savings: data.income - data.expenses };
  }, [prevFilteredTransactions]);

  // FETCH DASHBOARD
  const fetchDashboardOverview = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard`, {
        headers: getAuthHeader(),
      });

      if (!res?.data?.success) return;

      setOverviewMeta(res.data.data || {});

    } catch (err) {
      console.log("Dashboard fetch error:", err.message);
    }
  };

  useEffect(() => {
    fetchDashboardOverview();
  }, []);

  // GAUGE
  useEffect(() => {
    setGaugeData([
      { name: "Income", value: currentData.income, max: Math.max(currentData.income, 5000) },
      { name: "Spent", value: currentData.expenses, max: Math.max(currentData.expenses, 3000) },
      { name: "Savings", value: currentData.savings, max: Math.max(Math.abs(currentData.savings), 2000) },
    ]);
  }, [currentData]);

  const expenseChange = useMemo(() => {
    if (!prevData.expenses) return 0;
    return Math.round(((currentData.expenses - prevData.expenses) / prevData.expenses) * 100);
  }, [currentData, prevData]);

  // PIE DATA
  const financialOverviewData = useMemo(() => {
    const categories = {};

    filteredTransactions.forEach((t) => {
      if (t.type === "expense") {
        categories[t.category] =
          (categories[t.category] || 0) + t.amount;
      }
    });

    return Object.keys(categories).map((key) => ({
      name: key,
      value: categories[key],
    }));
  }, [filteredTransactions]);

  // ADD TRANSACTION
  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount) return;

    try {
      setLoading(true);

      const payload = {
        date: toIsoWithClientTime(newTransaction.date),
        description: newTransaction.description,
        amount: Number(newTransaction.amount),
        category: newTransaction.category,
      };

      const url =
        newTransaction.type === "income"
          ? `${API_BASE}/income/add`
          : `${API_BASE}/expense/add`;

      await axios.post(url, payload, {
        headers: getAuthHeader(),
      });

      await refreshTransactions();
      await fetchDashboardOverview();

      setShowModal(false);

      setNewTransaction({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        type: "expense",
        category: "Food",
      });

    } catch (err) {
      console.log("Add error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={dashboardStyles.container}>

      {/* HEADER */}
      <div className={dashboardStyles.headerContainer}>
        <h1 className={dashboardStyles.headerTitle}>Finance Dashboard</h1>

        <button onClick={() => setShowModal(true)} className={dashboardStyles.addButton}>
          <Plus size={20} /> Add Transaction
        </button>
      </div>

      {/* SUMMARY */}
      <div className={dashboardStyles.summaryGrid}>
        <FinancialCard icon={<Wallet />} label="Balance" value={`₹${currentData.income - currentData.expenses}`} />
        <FinancialCard icon={<ArrowDown />} label="Expenses" value={`₹${currentData.expenses}`} />
        <FinancialCard icon={<PiggyBank />} label="Savings" value={`₹${currentData.savings}`} />
      </div>

      {/* GAUGE */}
      <div className={dashboardStyles.gaugeGrid}>
        {gaugeData.map((g) => (
          <GaugeCard key={g.name} gauge={g} colorInfo={GAUGE_COLORS[g.name]} />
        ))}
      </div>

      {/* PIE */}
      <div className={dashboardStyles.pieChartContainer}>
        <h3 className={dashboardStyles.pieChartTitle}>
          <PieChartIcon /> Expense Distribution
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={financialOverviewData} dataKey="value">
              {(financialOverviewData || []).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 MODERN RECENT SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        {/* INCOME */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
            <TrendingUp /> Recent Income
          </h3>

          {(overviewMeta?.recentTransactions || [])
            .filter((t) => t.type === "income")
            .slice(0, 4)
            .map((item, i) => (
              <div key={i} className="flex justify-between items-center mt-3">
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-green-600 font-semibold">+₹{item.amount}</p>
              </div>
            ))}
        </div>

        {/* EXPENSE */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600">
            <TrendingDown /> Recent Expenses
          </h3>

          {(overviewMeta?.recentTransactions || [])
            .filter((t) => t.type === "expense")
            .slice(0, 4)
            .map((item, i) => (
              <div key={i} className="flex justify-between items-center mt-3">
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-red-500 font-semibold">-₹{item.amount}</p>
              </div>
            ))}
        </div>

      </div>

      <AddTransactionModal
        showModal={showModal}
        setShowModal={setShowModal}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        handleAddTransaction={handleAddTransaction}
        loading={loading}
      />

    </div>
  );
};

export default Dashboard;