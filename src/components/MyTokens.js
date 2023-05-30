import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Web3Context } from '../utils/Web3Provider';
import './MyToken.css';
import BatchTransfer from './BatchTransfer';

const MyTokens = () => {
  const { web3, contract } = useContext(Web3Context);
  const [tokens, setTokens] = useState([]);

  const fetchTokens = useCallback(async () => {
    if (web3 && contract) {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
        
      const tokenIds = await contract.methods.tokensOfOwner(account).call();
      const tokensData = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const tokenInfo = await contract.methods
            .getTokenInfo(tokenId)
            .call({ from: account });
  
          const metadataUri = tokenInfo.uri.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
          const response = await fetch(metadataUri);
          const metadata = await response.json();
  
          if (!metadata.image) {
            console.error(`Metadata image does not exist for token ID ${tokenId}`);
            return null;
          }
  
          const imageUrl = `https://cloudflare-ipfs.com/ipfs/${metadata.image.replace('ipfs://', '')}`;
          const { name, description } = metadata;
  
          return { id: tokenId, imageUrl, name, description, ...tokenInfo };
        })
      );
  
      setTokens(tokensData.filter(token => token !== null));
    }
  }, [web3, contract]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);
  

  return (
    <div className="my-tokens-container">
      <BatchTransfer />
      <h2 className="tokens-heading">My Tokens</h2>
      <button className="refresh-button" onClick={fetchTokens}>
        Refresh Tokens
      </button>
      <div className="token-list">
        {tokens.map((token) => (
          <div key={token.id} className="token-card">
            <p className="token-id">ID: {token.id}</p>
            <img src={token.imageUrl} alt={token.name} className="token-image" />
            <div className="token-info">
              <p className="token-name">{token.name}</p>
              <p className="token-description">{token.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
};

export default MyTokens;
