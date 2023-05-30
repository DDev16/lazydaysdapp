import React, { useContext, useState } from 'react';
import { Web3Context } from '../utils/Web3Provider';
import { NFTStorage, File } from 'nft.storage';
import './BatchMint.css';

import { OverlayTrigger, Tooltip } from 'react-bootstrap';



const BatchMint = () => {
  const { web3, contract } = useContext(Web3Context);
  const [mintData, setMintData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [useSharedData, setUseSharedData] = useState(false);

  const nftStorageToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdGOTA4QjNBRDJGMDFGNjE2MjU1MTA0ODIwNjFmNTY5Mzc2QTg3MjYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3OTI5MDE5ODQyMCwibmFtZSI6Ik5FV0VTVCJ9.FGtIrIhKhgSx-10iVlI4sM_78o7jSghZsG5BpqZ4xfA';
  const client = new NFTStorage({ token: nftStorageToken });

  const handleChange = (i, e) => {
    const { name, value } = e.target;
    setMintData((prevState) => {
      const newState = [...prevState];
      newState[i][name] = value;
      return newState;
    });
  };

  const handleFilesChange = (e) => {
    const files = [...e.target.files];
    const newMintData = files.map((file) => ({
      name: '',
      description: '',
      file: file,
      uri: '',
    }));
    setMintData((prevState) => [...prevState, ...newMintData]);
  };

  const handleImageUpload = async (i) => {
    try {
      const file = mintData[i].file;
      setUploading(true);
      const metadata = await client.store({
        name: mintData[i].name,
        description: mintData[i].description,
        image: new File([file], file.name, { type: file.type }),
      });

      setMintData((prevState) => {
        const newState = [...prevState];
        newState[i].uri = metadata.url;
        return newState;
      });

      setError(null);
    } catch (error) {
      console.error('Error while uploading image:', error);
      setError('Error while uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAllImagesUpload = async () => {
    for (let i = 0; i < mintData.length; i++) {
      if (mintData[i].file && !mintData[i].uri) {
        await handleImageUpload(i);
      }
    }
  };

  const handleAddFields = () => {
    setMintData((prevState) => {
      const newState = [...prevState];
      newState.push({ name: '', description: '', file: null, uri: '' });
      return newState;
    });
  };

  const handleRemoveFields = (i) => {
    setMintData((prevState) => {
      const newState = [...prevState];
      newState.splice(i, 1);
      return newState;
    });
  };

  const handleToggle = () => {
    setUseSharedData((prevState) => !prevState);
  };

  const handleBatchMint = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accounts = await web3.eth.getAccounts();
      const names = useSharedData
        ? Array(mintData.length).fill(mintData[0].name)
        : mintData.map((data) => data.name);
      const descriptions = useSharedData
        ? Array(mintData.length).fill(mintData[0].description)
        : mintData.map((data) => data.description);
      const uris = mintData.map((data) => data.uri);

      await contract.methods.batchMint(names, descriptions, uris).send({ from: accounts[0] });

      setMintData([]);
      setMintSuccess(true);
      setError(null);
    } catch (error) {
      console.error('Error in batch minting:', error);
      setError('Error in batch minting: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="background">
      <div className="BatchMint">
        <div className="Batch-Title">
          <h1>Batch Minting</h1>
        </div>
        <form onSubmit={handleBatchMint}>
          <div className="shared-data-toggle">
            {/* Use Shared Data Tooltip */}
            <OverlayTrigger placement="top" overlay={<Tooltip id="shared-data-tooltip">Input name/description then toggle to share data across all Minted NFTs</Tooltip>}>
              <label htmlFor="shared-data">Use Shared Data:</label>
            </OverlayTrigger>
            <input type="checkbox" id="shared-data" checked={useSharedData} onChange={handleToggle} />
          </div>
          {/* File Input Tooltip */}
          <OverlayTrigger placement="top" overlay={<Tooltip id="file-input-tooltip">Upload up to 50 at once</Tooltip>}>
            <input
              type="file"
              name="file"
              onChange={handleFilesChange}
              accept="image/*"
              required
              multiple
              aria-label="Upload Image"
            />
          </OverlayTrigger>
        {mintData.length > 0 &&
          mintData.map((mintField, idx) => (
            <div key={idx} className="mint-field">
              <label htmlFor={`name-${idx}`}>Token Name:</label>
              <input
                type="text"
                id={`name-${idx}`}
                name="name"
                value={useSharedData ? mintData[0].name : mintField.name}
                onChange={(e) => handleChange(idx, e)}
                placeholder="Token Name"
                required
                aria-label="Token Name"
                disabled={useSharedData}
              />
              <label htmlFor={`description-${idx}`}>Token Description:</label>
              <textarea
                id={`description-${idx}`}
                name="description"
                value={useSharedData ? mintData[0].description : mintField.description}
                onChange={(e) => handleChange(idx, e)}
                placeholder="Token Description"
                required
                aria-label="Token Description"
                disabled={useSharedData}
              />
              <button type="button" onClick={handleAllImagesUpload} disabled={uploading}>
                {uploading ? 'Uploading All...' : 'Upload All Images'}
              </button>
              {mintField.file && (
                <div>
                  <img
                    src={URL.createObjectURL(mintField.file)}
                    alt="Uploaded Token"
                    className="uploaded-image"
                  />
                </div>
              )}
              <input
                type="text"
                name="uri"
                value={mintField.uri}
                readOnly
                placeholder="Token URI"
                aria-label="Token URI"
              />
              <button type="button" onClick={() => handleRemoveFields(idx)}>
                Remove
              </button>
            </div>
          ))}
        {mintData.length === 0 && (
          <div className="mint-field">
            <p>No files added.</p>
          </div>
        )}
        <button type="button" onClick={handleAddFields}>
          Add More Tokens
        </button>
        <button disabled={loading} type="submit">
          {loading ? 'Minting...' : 'Batch Mint'}
        </button>
      </form>
      {mintSuccess && <p className="success-message">Batch minting successful!</p>}
      {error && <p className="error-message">Error: {error}</p>}
    </div>
     </div>
  );
};

export default BatchMint;
