import React, { useContext, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { File, NFTStorage } from 'nft.storage';

import { Web3Context } from '../utils/Web3Provider';
import './BatchMint.css';

const BatchMint = () => {
  const { web3, contract } = useContext(Web3Context);
  const [mintData, setMintData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [useSharedData, setUseSharedData] = useState(false);
  const [mintingFee] = useState(50); // Specify the minting fee in Ether

  const nftStorageToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdGOTA4QjNBRDJGMDFGNjE2MjU1MTA0ODIwNjFmNTY5Mzc2QTg3MjYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3OTI5MDE5ODQyMCwibmFtZSI6Ik5FV0VTVCJ9.FGtIrIhKhgSx-10iVlI4sM_78o7jSghZsG5BpqZ4xfA';
  const client = new NFTStorage({ token: nftStorageToken });

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    setMintData((prevState) => {
      const newState = [...prevState];
      newState[index][name] = value;
      return newState;
    });
  };

  const handleFilesChange = (event) => {
    const files = [...event.target.files];
    const newMintData = files.map((file) => ({
      name: '',
      description: '',
      file: file,
      uri: '',
    }));
    setMintData((prevState) => [...prevState, ...newMintData]);
  };

  const handleImageUpload = async (index) => {
    try {
      const file = mintData[index].file;
      setUploading(true);
      const metadata = await client.store({
        name: mintData[index].name,
        description: mintData[index].description,
        image: new File([file], file.name, { type: file.type }),
      });

      setMintData((prevState) => {
        const newState = [...prevState];
        newState[index].uri = metadata.url;
        return newState;
      });

      setError(null);
    } catch (error) {
      console.error('Error while uploading image:', error);
      setError(`Error while uploading image: ${error.message}`);
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

  const handleRemoveFields = (index) => {
    setMintData((prevState) => {
      const newState = [...prevState];
      newState.splice(index, 1);
      return newState;
    });
  };

  const handleToggle = () => {
    setUseSharedData((prevState) => !prevState);
  };

  const handleBatchMint = async (event) => {
    event.preventDefault();
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

      const numNFTs = mintData.length;
      const calculatedFee = web3.utils.toWei((mintingFee * numNFTs).toString(), 'ether'); // Convert to Wei

      // Call the contract method to mint NFTs with the calculated fee
      await contract.methods
        .batchMint(names, descriptions, uris)
        .send({ from: accounts[0], value: calculatedFee });

      setMintData([]);
      setMintSuccess(true);
      setError(null);
    } catch (error) {
      console.error('Error in batch minting:', error);
      setError(`Error in batch minting: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate the cost
  const totalCost = mintingFee * mintData.length;

  return (
    <div className="background">
      <div className="BatchMint">
        <div className="Batch-Title">
          <h1>Batch Minting</h1>
        </div>
        <h2>Minting Fee: {mintingFee} Ether</h2>
        <h2>Number of NFTs: {mintData.length}</h2>
        <h2>Total Cost: {totalCost} Ether</h2> {/* Display the total cost */}
        <form onSubmit={handleBatchMint}>
          <div className="shared-data-toggle">
            {/* Use Shared Data Tooltip */}
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="shared-data-tooltip">Input name/description then toggle to share data across all Minted NFTs</Tooltip>}
            >
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
            mintData.map((mintField, index) => (
              <div key={index} className="mint-field">
                <label htmlFor={`name-${index}`}>Token Name:</label>
                <input
                  type="text"
                  id={`name-${index}`}
                  name="name"
                  value={useSharedData ? mintData[0].name : mintField.name}
                  onChange={(event) => handleChange(index, event)}
                  placeholder="Token Name"
                  required
                  aria-label="Token Name"
                  disabled={useSharedData}
                />
                <label htmlFor={`description-${index}`}>Token Description:</label>
                <textarea
                  id={`description-${index}`}
                  name="description"
                  value={useSharedData ? mintData[0].description : mintField.description}
                  onChange={(event) => handleChange(index, event)}
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
                <button type="button" onClick={() => handleRemoveFields(index)}>
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
