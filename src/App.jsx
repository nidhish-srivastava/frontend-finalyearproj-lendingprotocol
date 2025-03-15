import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';
import { ClipboardIcon, CheckIcon, ArrowDownIcon, ArrowUpIcon, Wallet } from 'lucide-react';
import { Buffer } from 'buffer';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
window.Buffer = Buffer;

// Wallet connection and management - Local network only
const SolanaWalletApp = () => {
  // State for wallet and connection
  const [wallet, setWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [cluster] = useState('http://localhost:8899');  // Fixed to local
  const [copied, setCopied] = useState(false);
  const [connection, setConnection] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('send');
  const [airdropModalOpen, setAirdropModalOpen] = useState(false);
  const [airdropAmount, setAirdropAmount] = useState('1');
  const [isProcessingAirdrop, setIsProcessingAirdrop] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');

  // Initialize connection to local network
  useEffect(() => {
    const newConnection = new Connection(cluster, 'confirmed');
    setConnection(newConnection);
    
    // Update balance if wallet is connected
    if (wallet) {
      fetchWalletBalance(newConnection);
    }
  }, [wallet]);

  // Fetch wallet balance
  const fetchWalletBalance = async (conn) => {
    if (!wallet) return;
    try {
      const balance = await conn.getBalance(new PublicKey(walletAddress));
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Connect to Phantom wallet
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (!window.solana || !window.solana.isPhantom) {
        alert("Phantom wallet is not installed. Please install it from https://phantom.app/");
        setIsConnecting(false);
        return;
      }

      const response = await window.solana.connect();
      setWallet(response);
      setWalletAddress(response.publicKey.toString());
      
      // Fetch initial balance
      if (connection) {
        fetchWalletBalance(connection);
      }
      
      // Listen for account changes
      window.solana.on('accountChanged', async (publicKey) => {
        if (publicKey) {
          setWalletAddress(publicKey.toString());
          fetchWalletBalance(connection);
        } else {
          // Wallet disconnected
          setWallet(null);
          setWalletAddress('');
          setWalletBalance(0);
        }
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet: ' + error.message);
    }
    setIsConnecting(false);
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    if (window.solana) {
      await window.solana.disconnect();
      setWallet(null);
      setWalletAddress('');
      setWalletBalance(0);
    }
  };

  // Copy wallet address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show airdrop modal
  const openAirdropModal = () => {
    if (!wallet) {
      alert('Please connect your wallet first');
      return;
    }
    setAirdropModalOpen(true);
  };

  // Request airdrop with custom amount
  const handleAirdrop = async () => {
    if (!airdropAmount || parseFloat(airdropAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsProcessingAirdrop(true);
    try {
      const amountLamports = parseFloat(airdropAmount) * LAMPORTS_PER_SOL;
      
      const signature = await connection.requestAirdrop(
        new PublicKey(walletAddress),
        amountLamports
      );
      
      // Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Update balance
      await fetchWalletBalance(connection);
      
      // Record transaction
      setTransactions([
        {
          type: 'airdrop',
          amount: parseFloat(airdropAmount),
          signature,
          timestamp: new Date().toLocaleTimeString()
        },
        ...transactions
      ]);
      
      setAirdropModalOpen(false);
      alert('Airdrop successful!');
    } catch (error) {
      console.error('Airdrop failed:', error);
      alert('Airdrop failed: ' + error.message);
    }
    setIsProcessingAirdrop(false);
  };

  // Send SOL to another address
  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!wallet) {
      alert('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!receiverAddress) {
      alert('Please enter a valid receiver address');
      return;
    }

    const amountLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    
    try {
      // Verify the receiver address is valid
      const toPublicKey = new PublicKey(receiverAddress);
      
      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress),
          toPubkey: toPublicKey,
          lamports: amountLamports
        })
      );
      
      // Set recent blockhash
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      
      // Set fee payer
      transaction.feePayer = new PublicKey(walletAddress);
      
      // Send transaction
      const signed = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      
      // Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Record transaction
      setTransactions([
        {
          type: 'send',
          amount: parseFloat(amount),
          to: receiverAddress,
          signature,
          timestamp: new Date().toLocaleTimeString()
        },
        ...transactions
      ]);
      
      // Update balance
      await fetchWalletBalance(connection);
      
      // Reset form
      setAmount('');
      setReceiverAddress('');
      
      alert('Transaction successful!');
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed: ' + error.message);
    }
  };

  // Display shortened address
  const shortenAddress = (address) => {
    return address ? `${address.substring(0, 4)}...${address.substring(address.length - 4)}` : '';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header with wallet connection */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
          {/* Wallet Button/Info */}
          {!wallet ? (
            <button 
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="flex items-center">
              <div className="mr-4">
                <div className="font-medium">Wallet Address</div>
                <div className="text-sm text-gray-500">{shortenAddress(walletAddress)}</div>
              </div>
              <button 
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition text-sm"
                onClick={disconnectWallet}
              >
                Disconnect
              </button>
            </div>
          )}
          
          {/* Network Indicator - Always Local */}
          <div className="bg-gray-200 px-4 py-2 rounded-md">
            <span>Local Network</span>
          </div>
        </div>
        
        {/* Main Content */}
        {wallet ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Wallet Info */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">{walletBalance.toFixed(5)} SOL</h2>
              <p className="text-gray-500 truncate mt-1">{walletAddress}</p>
              
              {/* Airdrop Button */}
              {/* <button 
                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-md transition"
                onClick={openAirdropModal}
              >
                Airdrop SOL
              </button> */}
            </div>
            
            {/* Tabs */}
            <div className="flex border-b mb-6">
            <button 
                className={`py-2 px-4 font-medium ${activeTab === 'dashboard' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`py-2 px-4 font-medium ${activeTab === 'send' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('send')}
              >
                Send
              </button>
              <button 
                className={`py-2 px-4 font-medium ${activeTab === 'receive' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('receive')}
              >
                Receive
              </button>
              <button 
                className={`py-2 px-4 font-medium ${activeTab === 'activity' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('activity')}
              >
                Activity
              </button>
            </div>
            {
              activeTab === 'dashboard' && (
                <Dashboard/>
              )
            }
            {/* Send Tab */}
            {activeTab === 'send' && (
              <form onSubmit={handleSend}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Amount (SOL)</label>
                  <input 
                    type="number" 
                    min="0.000001"
                    step="0.000001"
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Recipient Address</label>
                  <input 
                    type="text"
                    value={receiverAddress} 
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Solana address"
                    required
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition flex items-center justify-center space-x-2"
                >
                  <ArrowUpIcon size={18} />
                  <span>Send SOL</span>
                </button>
              </form>
            )}
            
            {/* Receive Tab */}
            {activeTab === 'receive' && (
              <div className="text-center">
                  <button 
                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-md transition"
                onClick={openAirdropModal}
              >
                Receive SOL from Treasury
              </button>
                {/* <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">Your Wallet Address</h3>
                  <div className="bg-gray-100 p-4 rounded-md break-all">{walletAddress}</div>
                </div>

                
                
                <button 
                  onClick={copyAddress}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center space-x-2 mx-auto"
                >
                  {copied ? <CheckIcon size={18} /> : <ClipboardIcon size={18} />}
                  <span>{copied ? 'Copied!' : 'Copy Address'}</span>
                </button> */}
              </div>
            )}
            
            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-6">No transactions yet</p>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx, index) => (
                      <div key={index} className="border rounded-md p-4 flex items-center">
                        <div className={`p-2 rounded-full mr-4 ${
                          tx.type === 'airdrop' ? 'bg-purple-100 text-purple-500' : 
                          tx.type === 'send' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'
                        }`}>
                          {tx.type === 'airdrop' ? 'A' : 
                           tx.type === 'send' ? <ArrowUpIcon size={18} /> : <ArrowDownIcon size={18} />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {tx.type === 'airdrop' ? 'Airdrop' : tx.type === 'send' ? 'Sent' : 'Received'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tx.type === 'send' && `To: ${shortenAddress(tx.to)}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${tx.type === 'send' ? 'text-red-500' : 'text-green-500'}`}>
                            {tx.type === 'send' ? '-' : '+'}{tx.amount} SOL
                          </div>
                          {tx.id}
                          <div className="text-xs text-gray-500">{tx.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Wallet size={48} className="mx-auto text-blue-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Connect your Phantom wallet to send, receive and manage your SOL on your local Solana network</p>
            <button 
              className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        )}
      </div>
      
      {/* Airdrop Modal */}
      {airdropModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            {/* <h3 className="text-xl font-bold mb-4">Airdrop SOL</h3> */}
            <h3 className="text-xl font-bold mb-4">Receive SOL from Treasury</h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Amount (SOL)</label>
              <input 
                type="number" 
                min="0.000001"
                step="0.000001"
                value={airdropAmount} 
                onChange={(e) => setAirdropAmount(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => setAirdropModalOpen(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition"
                disabled={isProcessingAirdrop}
              >
                Cancel
              </button>
              <button 
                onClick={handleAirdrop}
                className="flex-1 bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition"
                disabled={isProcessingAirdrop}
              >
                {isProcessingAirdrop ? 'Processing...' : 'Confirm Airdrop'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolanaWalletApp;