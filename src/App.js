import React, { useState, useEffect } from 'react';
import './App.css';
import { Web3Auth } from '@web3auth/modal';
import Web3 from 'web3';
import GameItemABI from './contracts/GameItemABI.json';
const { BigNumber } = require("bignumber.js");


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
    console.log("Start of mintNFT function");

    if (!web3) {
        console.log("Web3 instance not found. Exiting function.");
        return;
    }

    const contract = new web3.eth.Contract(GameItemABI, "0x09ef840920Fe5Eb4C7C1b638F896734978646685");
    console.log("Contract created:", contract);

    try {
        console.log("Token URI:", tokenURI);
        const data = contract.methods.mintItem(tokenURI).encodeABI();
        console.log("Encoded Data:", data);

        const nonce = await web3.eth.getTransactionCount(fromAddress, "pending");
        console.log("Fetched nonce:", nonce);
        const incrementedNonce = new BigNumber(nonce).plus(1).toString(10);
        console.log("Incremented nonce:", incrementedNonce);

        const gasPricePercentageIncrease = 1.5; 
        const currentGasPrice = await web3.eth.getGasPrice();
        console.log("Current gas price:", currentGasPrice);
        const newGasPrice = new BigNumber(currentGasPrice).times(gasPricePercentageIncrease).toString(10);
        console.log("New gas price:", newGasPrice);

        const hardcodedGasLimit = 300000;

        const gasLimitHex = web3.utils.toHex(hardcodedGasLimit);
        const gasPriceHex = web3.utils.toHex(newGasPrice);
        const incrementedNonceHex = web3.utils.toHex(incrementedNonce);
        console.log("Hex values - Gas Limit:", gasLimitHex, ", Gas Price:", gasPriceHex, ", Incremented Nonce:", incrementedNonceHex);

        const privateKey = await getPrivateKey();
        console.log("Private key fetched:", privateKey);  // For security reasons, you might want to comment this out in production

        const tx = {
            from: fromAddress,
            to: contract.options.address,
            gas: gasLimitHex,
            gasPrice: gasPriceHex,
            data: data,
        };
        console.log("Transaction object:", tx);

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        console.log("Transaction signed");

        const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("Transaction result:", result);


        setTransactionHash(result.transactionHash);
        console.log("Transaction hash set:", result.transactionHash);
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
