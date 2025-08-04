import './App.css'
import { useState } from 'react'
import { ABI, address } from './contractinfo'
import { createWalletClient, custom, parseEther } from 'viem';
import { sepolia } from 'viem/chains';

declare global {
interface Window {
    ethereum?: {
      request: <T>(args: { method: string; params?: unknown[] }) => Promise<T>;
      isMetaMask?: boolean;
    };
}
}



const walletClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum!),

})

const [w_account] = await walletClient.getAddresses()


function App() {
  const [account, setAccount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const deposit = async () => {
    console.log('Depositing account:', w_account);
    const hash = await walletClient.writeContract({
      account:w_account,
      address,
      abi: ABI,
      functionName:'deposit',
      args: [],
      value: parseEther(amount), 
    })
    console.log('Transaction hash:', hash);
  }

  const connect = async () => {
    if (window.ethereum) {
      try {
        // Request account access if needed
        const connected_account = await window.ethereum.request<string[]>({ method: 'eth_requestAccounts' });
        console.log('Wallet connected', connected_account);
        setAccount(connected_account[0]);
      } catch (error) {
        console.error('User denied account access', error);
      }
    } else {
      console.error('MetaMask is not installed');
    }
  }

  const disconnect = async () => {
    if (window.ethereum) {
      try {
        // Disconnect logic here (if applicable)
        await window.ethereum.request({ method: 'wallet_revokePermissions', params:[{eth_accounts:{}}] });
        console.log('Wallet disconnected');
        setAccount("");
      } catch (error) {
        console.error('Error disconnecting wallet', error);
      }
    } else {
      console.error('MetaMask is not installed');
    }
  }

  return (
    <>
    <h1>The Safe</h1>
    <button onClick={connect} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">Connect Wallet</button>
    <button onClick={disconnect} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Disconnect Wallet</button>
    <div className="mt-4">
      <p>Connected Account: {account}</p>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount to deposit"
        className="border p-2 rounded mr-2"
      />
      <button onClick={deposit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Deposit</button>
      </div>
    </>
  )
}

export default App
