import React, { useState, useEffect } from 'react';
import './App.css';
import { Web3Auth } from '@web3auth/modal';
import Web3 from 'web3';
import GameItemABI from './contracts/GameItemABI.json';

const web3auth = new Web3Auth({
  clientId: "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ", // get it from Web3Auth Dashboard
  web3AuthNetwork: "sapphire_mainnet",
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "0x5",
    rpcTarget: "https://eth-goerli.g.alchemy.com/v2/5kJ19pS_d17Gf4Cj8Y7Rcu69MSZRZlYF",
    displayName: "Goerli Testnet",
    blockExplorer: "https://goerli.etherscan.io",
    ticker: "ETH",
    tickerName: "Ethereum",
  },
});



function App() {
  const [web3, setWeb3] = useState(null);
  const [fromAddress, setFromAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null); // 1. New state variable
  const [mintedEvent, setMintedEvent] = useState(null); // New state variable for the event



  const connectWallet = async () => {
    await web3auth.initModal();
    const web3authProvider = await web3auth.connect();
    const web3Instance = new Web3(web3authProvider);
    setWeb3(web3Instance);
    const accounts = await web3Instance.eth.getAccounts();
    const account = accounts[0];
    setFromAddress(account);

    // Fetch the balance and update state
    const ethBalance = await web3Instance.eth.getBalance(account);
    const ethBalanceInEther = web3Instance.utils.fromWei(ethBalance, 'ether');
    setBalance(ethBalanceInEther);
  };

  

  const mintNFT = async (tokenURI) => {
    if (!web3) return;
    const contract = new web3.eth.Contract(GameItemABI, "0x09ef840920Fe5Eb4C7C1b638F896734978646685");
    try {
      console.log("Token URI:", tokenURI);
      const data = contract.methods.mintItem(tokenURI).encodeABI();
      console.log("Encoded Data:", data);
  
      // Get the current nonce and increment it
      const nonce = await web3.eth.getTransactionCount(fromAddress, "pending");
      const incrementedNonce = (BigInt(nonce) + 1n).toString();
  
      // Calculate a new gas price slightly higher than the current one
      const currentGasPrice = await web3.eth.getGasPrice();
  
      const hardcodedGasLimit = 300000; // Set your desired gas limit here
      const privateKey = await getPrivateKey();
  
      const tx = {
        from: fromAddress,
        to: contract.options.address,
        gas: hardcodedGasLimit,
        gasPrice: currentGasPrice, // Convert to string
        nonce: incrementedNonce, // Use the incremented nonce
        data: data,
      };
  
      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey); // Sign the transaction with your private key
  
      const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  
      contract.events.MintedNFT((error, event) => {
        if (error) {
          console.error("Error listening to MintedNFT event:", error);
        } else {
          console.log("MintedNFT event:", event);
          setMintedEvent(event);
        }
      });
  
      setTransactionHash(result.transactionHash);
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };
  

  const getPrivateKey = async () => {
    const privateKey = await web3auth.provider.request({
      method: "eth_private_key",
    });
    return privateKey;
  };

useEffect(() => {
  if (transactionHash) {
    // Fetch the transaction receipt to check its status
    web3.eth.getTransactionReceipt(transactionHash)
      .then((receipt) => {
        console.log("Transaction Receipt:", receipt);

        if (receipt.status === true) {
          alert("NFT minted!");
        } else {
          console.error("Transaction failed:", receipt);
        }
      })
      .catch((error) => {
        console.error("Error fetching transaction receipt:", error);
      });
  }
}, [transactionHash]);



return (
  <div className="App">
    {!web3 && (
      <button onClick={connectWallet}>Connect Wallet</button>
    )}
    {fromAddress && (
      <div>
        <p>Connected Address: {fromAddress}</p>
        <p>Balance: {balance} ETH</p>
        <input type="text" placeholder="Token URI" id="tokenURI" />
        <button onClick={() => mintNFT(document.getElementById("tokenURI").value)}>
          Mint NFT
        </button>
        {transactionHash && (
          <p>Transaction Hash: <a href={`https://goerli.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">{transactionHash}</a></p>
        )}
        {mintedEvent && (
          <p>MintedNFT Event: {JSON.stringify(mintedEvent)}</p>
        )}
      </div>
    )}
  </div>
);
}

export default App;
