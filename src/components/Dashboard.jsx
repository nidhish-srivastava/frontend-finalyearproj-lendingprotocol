import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [userStats, setUserStats] = useState({
    sent: 0,
    borrowed: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // Fetch real data from local storage or external API
    const borrowedAmount = parseFloat(localStorage.getItem('borrowedAmount')) || 0;
    const sentAmount = parseFloat(localStorage.getItem('sentAmount')) || 0;

    setUserStats({
      sent: sentAmount,
      borrowed: borrowedAmount,
    });

    setLoading(false);
  }, []);


  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Your Lending Dashboard</h2>
        <div className="text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500">Loading your account data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Grid for stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Deposited Amount */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-500/50 transition-all duration-300 shadow-sm">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Total Sent</h3>
              <p className="text-2xl font-bold text-gray-800">
                {userStats.sent} <span className="text-base text-gray-500">SOL</span>
              </p>
            </div>

            {/* Borrowed Amount */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-500/50 transition-all duration-300 shadow-sm">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Total Borrowed</h3>
              <p className="text-2xl font-bold text-gray-800">
                {userStats.borrowed} <span className="text-base text-gray-500">SOL</span>
              </p>
            </div>
          </div>


          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm flex items-center">
                Deposit
              </button>
              <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors shadow-sm flex items-center">
                Borrow
              </button>
              <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors shadow-sm flex items-center">
                Repay
              </button>
              <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors shadow-sm flex items-center">
                Withdraw
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
