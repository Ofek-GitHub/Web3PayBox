// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract PayBox{

    // Define the Owner of the smart contract 

    address public owner;

    constructor(){
        owner = msg.sender; // the one who the deploy the function will be the owner. 
    }

    // Create struct and mapping for request , transaction and name

    struct request {
        address requester;
        uint256 amount;
        string message;
        string name;
    }

    struct sendReceive{
        string action;
        uint256 amount;
        string message;
        address otherPartyAddress;
        string otherPartyName;
    }

    struct userName{
        string name;
        bool hasName;
    }

    mapping(address => userName) names; // we dont want anyone to read them so we dont make them public.
    mapping(address => request[]) requests; // we can have multiple requests so we need an array.
    mapping(address => sendReceive[]) history; // history will store all the transactions that a user has been involved in.


    // Add name to wallet address

    function addName(string memory _name) public {
        userName storage newUserName = names[msg.sender]; // we use storage to permently store the name in the blockchain. and we add it to the mapping.
        newUserName.name = _name;
        newUserName.hasName = true;     // we create a new user name and set the hasName to true.
    }


    // Create a request for payment

    function createRequest(address user, uint256 _amount, string memory _message) public{
        request memory newRequest;
        newRequest.requester = msg.sender;
        newRequest.amount = _amount;
        newRequest.message = _message;
        
        if(names[msg.sender].hasName){ // if they have a name, great . if not so it will be an empty string.
            newRequest.name = names[msg.sender].name;
        }
        requests[user].push(newRequest); // we push forr the mapping of request the new request.

    }


    // Pay the request

    function payRequest(uint256 _request) public payable { // we need the index of the req we want to pay from the mapping requests.
        require(_request <requests[msg.sender].length,"Index is bigger then the actual length, cant find request.");

        request[] storage myRequests = requests[msg.sender];
        request storage payableRequest = myRequests[_request];

        uint256 toPay =  payableRequest.amount *1000000000000000000;
        require(msg.value == (toPay),"Pay The correct amount");

        payable(payableRequest.requester).transfer(msg.value);

        addHistoy(msg.sender, payableRequest.requester, payableRequest.amount, payableRequest.message); 
        
        myRequests[_request] = myRequests[myRequests.length-1];
        myRequests.pop();
    }

    function addHistoy(address sender, address receiver,uint256 _amount, string memory _message) private { // must be private so no person can change history.
       
       // we are adding to the history transaction of the sender and the receiver.

        sendReceive memory newSend;
        newSend.action = "-"; // negetive sign because user losing money.
        newSend.amount = _amount;
        newSend.message = _message;
        newSend.otherPartyAddress = receiver;
        
        if(names[receiver].hasName){
            newSend.otherPartyName = names[receiver].name; // if he have a name in names mapping we will take it.
        }
        history[sender].push(newSend);

        sendReceive memory newReceive;
        newReceive.action = "+"; // positive sign because user gaining money.
        newReceive.amount = _amount;
        newReceive.message = _message;
        newReceive.otherPartyAddress = sender;
        if(names[sender].hasName){
            newReceive.otherPartyName = names[sender].name; // if he have a name in names mapping we will take it.
        }
        history[receiver].push(newReceive);

    }




    


    
    // Define a function called 'getMyRequests' that is publicly accessible and does not modify the state of the contract. It takes an address as an argument, representing the user whose requests we want to retrieve.
    function getMyRequests(address _user) public view returns( 
        // The function returns four arrays: an array of addresses, an array of amounts, an array of messages, and an array of names. These represent the details of each request.
        address[] memory,
        uint256[] memory,
        string[] memory,
        string[] memory
    ) { 
        // Create a new array of addresses with the same length as the number of requests for the user.
        address[] memory addrs = new address[](requests[_user].length); 

        // Create a new array of amounts with the same length as the number of requests for the user.
        uint256[] memory amnts = new uint256[](requests[_user].length);

        // Create a new array of messages with the same length as the number of requests for the user.
        string[] memory msge = new string[](requests[_user].length);

        // Create a new array of names with the same length as the number of requests for the user.
        string[] memory nme = new string[](requests[_user].length);
        
        // Loop over each request for the user.
        for(uint i = 0; i < requests[_user].length; i++){
            // Store the requester's address of the i-th request in the 'addrs' array.
            addrs[i] = requests[_user][i].requester;

            // Store the amount of the i-th request in the 'amnts' array.
            amnts[i] = requests[_user][i].amount;

            // Store the message of the i-th request in the 'msge' array.
            msge[i] = requests[_user][i].message;

            // Store the name of the i-th request in the 'nme' array.
            nme[i] = requests[_user][i].name;
        }
        return (addrs, amnts, msge, nme); // Return the four arrays of addresses, amounts, messages, and names.
        
    }


    // get all historic transactions a user been involved in

    function getMyHistory(address _user) public view returns(sendReceive[] memory){
        return history[_user];
        
    }
    function getMyName(address _user) public view returns(userName memory) {
        return names[_user];
    }

    

}