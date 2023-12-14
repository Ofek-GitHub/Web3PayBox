// Importing required modules
const express = require("express"); // Express.js for creating the server
const Moralis = require("moralis").default; // Moralis SDK for interacting with Moralis server
const app = express(); // Creating an instance of Express.js server
const cors = require("cors"); // CORS middleware for enabling Cross-Origin Resource Sharing
require("dotenv").config(); // dotenv for loading environment variables from a .env file
const port = 3001; // Port on which the server will listen
const ABI = require("./abi.json"); // Importing the ABI of the contract
const { Transaction } = require("ethers");

// Using middleware
app.use(cors()); // Enabling CORS for all routes
app.use(express.json()); // Enabling parsing of JSON payloads in the request body

function convertArrayToObjects(arr) {
  const dataArray = arr.map((transaction, index) => ({
    key: (arr.length + 1 - index).toString(), // for the mapping
    type: transaction[0],
    amount: transaction[1],
    message: transaction[2],
    address: `${transaction[3].slice(0, 4)}...${transaction[3].slice(38)}`,
    subject: transaction[4],
  }));
  return dataArray.reverse();
}

// Defining a GET route
app.get("/getNameAndBalance", async (req, res) => {
  // This route will return the name and balance of a user
  const { userAddress } = req.query; // Getting the user address from the query parameters
  console.log(userAddress);

  const response = await Moralis.EvmApi.utils.runContractFunction({
    chain: "0x13881", // Chain ID of the mumbai testnet
    address: "0x3140533540C32B56E9188506A4A5bB3798f8F98B", // Address of the deployed contract
    functionName: "getMyName",
    abi: ABI,
    params: { _user: userAddress },
  });

  const jsonResponeName = response.raw; // Getting the raw response from the Moralis server

  const secResponse = await Moralis.EvmApi.balance.getNativeBalance({
    chain: "0x13881", // Chain ID of the mumbai testnet
    address: userAddress,
  });

  const jsonResponseBal = (secResponse.raw.balance / 1e18).toFixed(2); //calculating the balance in MATIC and rounding it to 2 decimal places

  const thirResponse = await Moralis.EvmApi.token.getTokenPrice({
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", // Address of the token because we want to get the price of MATIC at the current situation to calculate the balance in dollars
  });

  const jsonResponseDollars = (
    thirResponse.raw.usdPrice * jsonResponseBal
  ).toFixed(2); // Calculating the balance in dollars and rounding it to 2 decimal places

  const fourResponse = await Moralis.EvmApi.utils.runContractFunction({
    chain: "0x13881", // Chain ID of the mumbai testnet
    address: "0x3140533540C32B56E9188506A4A5bB3798f8F98B", // Address of the deployed contract
    functionName: "getMyHistory",
    abi: ABI,
    params: { _user: userAddress },
  });

  const jsonResponseHistoy = convertArrayToObjects(fourResponse.raw);

  const fiveResponse = await Moralis.EvmApi.utils.runContractFunction({
    chain: "0x13881", // Chain ID of the mumbai testnet
    address: "0x3140533540C32B56E9188506A4A5bB3798f8F98B", // Address of the deployed contract
    functionName: "getMyRequests",
    abi: ABI,
    params: { _user: userAddress },
  });
  const jsonResponseRequests = fiveResponse.raw;

  const jsonResponse = {
    name: jsonResponeName,
    balance: jsonResponseBal,
    dollars: jsonResponseDollars,
    history: jsonResponseHistoy,
    requests: jsonResponseRequests,
  }; // Creating a JSON response

  console.log(jsonResponse); // Logging the JSON response to the console

  return res.status(200).json(jsonResponse); // Returning the JSON response to the client
});

// Starting the Moralis SDK
Moralis.start({
  apiKey: process.env.MORALIS_KEY, // Using the Moralis API key from environment variables
}).then(() => {
  // Starting the Express.js server after the Moralis SDK has been initialized
  app.listen(port, () => {
    console.log(`Listening for API Calls`); // Logging a message to the console when the server starts listening
  });
});
