import React, { useState } from 'react';
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
    rpcTarget: "https://rpc.ankr.com/eth_goerli",
    displayName: "Goerli Testnet",
    blockExplorer: "https://goerli.etherscan.io",
    ticker: "ETH",
    tickerName: "Ethereum",
  },
});

function App() {
  const [web3, setWeb3] = useState(null);
  const [fromAddress, setFromAddress] = useState(null);

  const connectWallet = async () => {
    await web3auth.initModal();
    const web3authProvider = await web3auth.connect();
    const web3Instance = new Web3(web3authProvider);
    setWeb3(web3Instance);
    const accounts = await web3Instance.eth.getAccounts();
    setFromAddress(accounts[0]);
  };

  const mintNFT = async (tokenURI) => {
    if (!web3) return;
    const contract = new web3.eth.Contract(GameItemABI, "0x214df020589B8b7e9F1721F6a2F15807e82B030f");
    try {
      await contract.methods.mintItem(tokenURI).send({ from: fromAddress });
      alert("NFT minted!");
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };

  return (
    <div className="App">
      {!web3 && (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      {fromAddress && (
        <div>
          <input type="text" placeholder="Token URI" id="tokenURI" />
          <button onClick={() => mintNFT(document.getElementById("tokenURI").value)}>
            Mint NFT
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
