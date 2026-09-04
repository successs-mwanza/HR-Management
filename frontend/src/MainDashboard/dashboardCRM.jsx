import React, { useEffect, useState } from 'react';


function DashboardCRM() {
  const [stats, setStats] = useState({
    employees: 0,
    transactions: 0,
    attendanceRate: 0,
    loading: true,
  });

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';
    Promise.all([
      fetch(`${BASE}/employees`).then((res) => (res.ok ? res.json() : [])),
      fetch(`${BASE}/income-expenses`).then((res) => (res.ok ? res.json() : [])),
      fetch(`${BASE}/attendance/stats?date=${today}`).then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([employees, transactions, attendance]) => {
        setStats({
          employees: Array.isArray(employees) ? employees.length : 0,
          transactions: Array.isArray(transactions) ? transactions.length : 0,
          attendanceRate: attendance?.attendanceRate ?? 0,
          loading: false,
        });
      })
      .catch(() => {
        setStats((prev) => ({ ...prev, loading: false }));
      });
  }, []);

  const summaryCards = [
    {
      title: 'Employees',
      value: stats.loading ? 'Loading...' : stats.employees,
      icon: '👥',
      highlight: 'Registered in backend',
    },
    {
      title: 'Transactions',
      value: stats.loading ? 'Loading...' : stats.transactions,
      icon: '💰',
      highlight: 'Income & expense records',
    },
    {
      title: 'Attendance Rate',
      value: stats.loading ? 'Loading...' : `${Math.round(stats.attendanceRate)}%`,
      icon: '📊',
      highlight: 'From attendance stats',
    },
    {
      title: 'System Status',
      value: stats.loading ? 'Loading...' : 'Online',
      icon: '🔐',
      highlight: 'Backend connection active',
    },
  ];

  return (
    <>
      {/* Summary Cards - Rendered at the very top */}
      <div style={{ 
        padding: '16px 24px',
        background: '#f8fafc',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          flexWrap: 'wrap',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {summaryCards.map((card) => (
            <div
              key={card.title}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px 20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                flex: '1 1 200px',
                minWidth: '180px',
                maxWidth: '260px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{ fontSize: '28px' }}>{card.icon}</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>{card.title}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{card.value}</div>
                <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: 500 }}>{card.highlight}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </>
  );
}

export default DashboardCRM;