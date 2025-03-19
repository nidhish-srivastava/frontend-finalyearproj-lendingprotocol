import React, { useState, useEffect } from 'react';

function Dashboard() {
  // Sample data - in a real app, this would come from props
  const [userStats, setUserStats] = useState({
    deposited: 5.5,
    borrowed: 2.2,
    health: 85,
    availableToBorrow: 3.3
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate data loading
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Function to determine health status color
  const getHealthColor = (health) => {
    if (health > 80) return 'bg-green-500';
    if (health > 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-500/50 transition-all duration-300 shadow-sm">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Total Deposited</h3>
              <p className="text-2xl font-bold text-gray-800">{userStats.deposited} <span className="text-base text-gray-500">SOL</span></p>
              <div className="mt-2 text-xs text-green-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
                2.4% from last week
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-500/50 transition-all duration-300 shadow-sm">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Total Borrowed</h3>
              <p className="text-2xl font-bold text-gray-800">{userStats.borrowed} <span className="text-base text-gray-500">SOL</span></p>
              <div className="mt-2 text-xs text-yellow-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                </svg>
                0.5% from last week
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-500/50 transition-all duration-300 shadow-sm">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Account Health</h3>
              <p className="text-2xl font-bold text-gray-800">{userStats.health}%</p>
              <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getHealthColor(userStats.health)} transition-all duration-500`} 
                  style={{ width: `${userStats.health}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {userStats.health > 80 ? 'Excellent' : userStats.health > 50 ? 'Good' : 'At Risk'}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-500/50 transition-all duration-300 shadow-sm">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Available to Borrow</h3>
              <p className="text-2xl font-bold text-gray-800">{userStats.availableToBorrow} <span className="text-base text-gray-500">SOL</span></p>
              <div className="mt-2 text-xs text-blue-600">
                Based on current collateral ratio
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Deposit
              </button>
              <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors shadow-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                </svg>
                Borrow
              </button>
              <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors shadow-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                </svg>
                Repay
              </button>
              <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors shadow-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Withdraw
              </button>
            </div>
          </div>
          
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Market Conditions</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Borrow APR</span>
                  <span className="text-gray-800 font-medium">3.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Supply APY</span>
                  <span className="text-gray-800 font-medium">1.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Utilization Rate</span>
                  <span className="text-gray-800 font-medium">65%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Liquidation Risk</h3>
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  Your current collateral ratio: <span className="text-gray-800 font-medium">160%</span>
                </div>
                <div className="text-gray-600">
                  Liquidation threshold: <span className="text-gray-800 font-medium">120%</span>
                </div>
              </div>
              <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: "75%" }}></div>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                Safe zone - 40% buffer before liquidation risk
              </div>
            </div>
          </div> */}
        </>
      )}
    </div>
  );
}

export default Dashboard;