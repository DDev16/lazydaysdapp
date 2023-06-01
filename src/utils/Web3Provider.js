import React, { useState, useEffect, createContext } from 'react';
import Web3 from 'web3';
import MyNFT from '../abi/MyNFT.js'; 

export const Web3Context = createContext();

const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);

        if (!initialized) {
          await window.ethereum.enable();
          setInitialized(true);
        }
        setWeb3(web3Instance);
        setContract(null); // Reset contract when network changes

        const handleNetworkChange = () => {
          window.location.reload(); // Reload the page on network change
        };

        window.ethereum.on('chainChanged', handleNetworkChange);

        const networkId = await web3Instance.eth.net.getId();
        let contractAddress = '';

        if (networkId === 19) {
          // Songbird network
          contractAddress = '0x9309a0A7229C0b039b7017872A96d544FC17DaDF';
        } else if (networkId === 14) {
          // Flare network
          contractAddress = '0x92Dd5BF315b84F1fA0fB9865ca9130a45f99e117';
        } else {
          // Add more conditions for other networks
          // ...
        }

        const contractInstance = new web3Instance.eth.Contract(
          MyNFT.abi,
          contractAddress
        );
        setContract(contractInstance);
      } else {
        window.alert('You need to install MetaMask!');
      }
    };

    initializeWeb3();
  }, [initialized]);

  return (
    <Web3Context.Provider value={{ web3, contract }}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;
