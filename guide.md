# Petbox tutorial on TomoChain
 
This tutorial will take you through the process of building your blockchain game - an adoption tracking system for a pet shop, which will be run on TomoChain blockchain!
This tutorial is meant for those with a basic knowledge of TomoChain and smart contracts, who have some knowledge of HTML and JavaScript, but who are new to games on blockchain and DApps.
 
In this tutorial we will be covering:

* Setting up the development environment

* Creating a Truffle project using a Truffle Box

* Writing the smart contract

* Compiling and migrating the smart contract

* Testing the smart contract

* Creating a user interface to interact with the smart contract

* Interacting with the dapp in a browser

## Background
Pete Scandlon of Pete's Pet Shop is interested in using TomoChain as an efficient way to handle their pet adoptions. The store has space for 16 pets at a given time, and they already have a database of pets. As an initial proof of concept, Pete wants to see a dapp which associates a TomoChain address with a pet to be adopted.
The website structure and styling will be supplied. Our job is to write the smart contract and front-end logic for its usage.
Setting up the development environment

* Node.js v6+ LTS and npm (comes with Node)
* Truffle: npm install -g truffle

Creating a Truffle project using a Truffle Box
Truffle initializes in the current directory, so first create a directory in your development folder of choice and then moving inside it.
mkdir petbox && cd petbox



This tutorial reused a special Truffle Box just for this tutorial called pet-shop. Use the truffle unbox command to unpack this Truffle Box: truffle unbox pet-shop
Truffle can be initialized a few different ways. Another useful initialization command is truffle init. For more information, please see the documentation on Creating a project.

## Directory structure

* contracts/: Contains the Solidity source files for our smart contracts. 
* migrations/: Truffle uses a migration system to handle smart contract deployments and keep track of changes.
* test/: Contains both JavaScript and Solidity tests for our smart contracts
* truffle.js: Truffle configuration file

The pet-shop Truffle Box has extra files and folders in it, but we won't worry about those just yet.
Writing the smart contract
We'll start our dapp by writing the smart contract that acts as the back-end logic and storage.
Create a new file named Adoption.sol in the contracts/ directory.
Add the following content to the file:

````
pragma solidity >=0.4.21 <0.6.0;

contract Adoption {
    address[16] public adopters;
    // Adopting a pet
    function adopt(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 15);

        adopters[petId] = msg.sender;

        return petId;
    }

    // Retrieving the adopters
    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }
}
````


### Things to notice 

* In Solidity the types of both the function parameters and output must be specified. In this case we'll be taking in a petId (integer) and returning an integer.
We are checking to make sure petId is in range of our adopters array. Arrays in Solidity are indexed from 0, so the ID value will need to be between 0 and 15. We use the require() statement to ensure the ID is within range.
If the ID is in range, we then add the address that made the call to our adopters array. The address of the person or smart contract who called this function is denoted by msg.sender.
Finally, we return the petId provided as a confirmation.

* Since adopters is already declared, we can simply return it. Be sure to specify the return type (in this case, the type for adopters) as address[16].
The view keyword in the function declaration means that the function will not modify the state of the contract. Further information about the exact limits imposed by view is available here.
Compiling and migrating the smart contract
Now that we have written our smart contract, the next steps are to compile and migrate it to TomoChain (both testnet and mainnet).
Compilation

Solidity is a compiled language, meaning we need to compile our Solidity to bytecode for the Ethereum Virtual Machine (EVM) to execute. Think of it as translating our human-readable Solidity into something the EVM understands.
In a terminal, make sure you are in the root of the directory that contains the dapp and type: 

````
truffle compile
````

````
You should see output similar to the following:
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/Adoption.sol...
Writing artifacts to ./build/contracts
````

## Migration

Now that we've successfully compiled our contracts, it's time to migrate them to the blockchain!
A migration is a deployment script meant to alter the state of your application's contracts, moving it from one state to the next. For the first migration, you might just be deploying new code, but over time, other migrations might move data around or replace a contract with a new one.

Note that, there is one JavaScript file already in the migrations/ directory: `1_initial_migration.js`. This handles deploying the Migrations.sol contract to observe subsequent smart contract migrations, and ensures we don't double-migrate unchanged contracts in the future.
Now we are ready to create our own migration script.
Create a new file named `2_deploy_contracts.js` in the migrations/directory.
Add the following content to the `2_deploy_contracts.js` file:

````
var Adoption = artifacts.require("Adoption");

module.exports = function(deployer) {
  deployer.deploy(Adoption);
};
````

## Deploy on TomoChain testnet

Change truffle.json content as follows to connect to TomoChain testnet and mainnet through RPC:

````
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
 networks: {
   tomotestnet: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://testnet.tomochain.com"),
      network_id: 88,   
      production: true    // Treats this network as if it was a public net. (default: false)
   },
   tomomainnet: {
     // Useful for private networks
     provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://rpc.tomochain.com"),
     network_id: 89,   
     production: true    // Treats this network as if it was a public net. (default: false)
   }
 }
};
````
	
Note that MNEMONIC is an environment variable whose value is your mnemonics phrase (recovery phrase). To deploy the contract on testnet, run:

````
truffle migrate --network tomotestnet 
````

````
Using network tomotestnet.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ...
Saving successful migration to network...
  ...
Running migration: 2_deploy_contracts.js
  Deploying Adoption...
  ...
Saving successful migration to network...
  ... 0xf36163615f41ef7ed8f4a8f192149a0bf633fe1a2398ce001bf44c43dc7bdda0
Saving artifacts...
````

## Interact with smart contracts
You've now written your smart contract and deployed it to TomoChain testnet. It's time to interact with the smart contract now to make sure it does what we want.
Testing the smart contract
Truffle is very flexible when it comes to smart contract testing, in that tests can be written either in JavaScript or Solidity. In this tutorial, we'll be writing our tests in Solidity.
Create a new file named TestAdoption.sol in the test/ directory. Add the following content to the `TestAdoption.sol` file:


````
pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Adoption.sol";

contract TestAdoption {
    // The address of the adoption contract to be tested
    Adoption adoption = Adoption(DeployedAddresses.Adoption());
    // The id of the pet that will be used for testing
    uint expectedPetId = 8;

    //The expected owner of adopted pet is this contract
    address expectedAdopter = this;

    // Testing the adopt() function
    function testUserCanAdoptPet() public {
        uint returnedId = adoption.adopt(expectedPetId);

        Assert.equal(returnedId, expectedPetId, "Adoption of the expected pet should match what is returned.");
    }

    // Testing retrieval of a single pet's owner
    function testGetAdopterAddressByPetId() public {
        address adopter = adoption.adopters(expectedPetId);

        Assert.equal(adopter, expectedAdopter, "Owner of the expected pet should be this contract");
    }

    // Testing retrieval of all pet owners
    function testGetAdopterAddressByPetIdInArray() public {
        // Store adopters in memory rather than contract's storage
        address[16] memory adopters = adoption.getAdopters();

        Assert.equal(adopters[expectedPetId], expectedAdopter, "Owner of the expected pet should be this contract");
    }
}
````


We start the contract off with 3 imports:

* `Assert.sol`: Gives us various assertions to use in our tests. In testing, an assertion checks for things like equality, inequality or emptiness to return a pass/fail from our test. Here's a full list of the assertions included with Truffle.
DeployedAddresses.sol: When running tests, Truffle will deploy a fresh instance of the contract being tested to the blockchain. This smart contract gets the address of the deployed contract.

* `Adoption.sol`: The smart contract we want to test.

First, one containing the smart contract to be tested, calling the DeployedAddresses smart contract to get its address.
Second, the id of the pet that will be used to test the adoption functions.
Third, since the TestAdoption contract will be sending the transaction, we set the expected adopter address to this, a contract-wide variable that gets the current contract's address.

We call the smart contract we declared earlier with the ID of `expectedPetId`.
Finally, we pass the actual value, the expected value and a failure message (which gets printed to the console if the test does not pass) to `Assert.equal()`.


After getting the adopter address stored by the adoption contract, we assert equality as we did above.
Testing retrieval of all pet owners
Since arrays can only return a single value given a single key, we create our own getter for the entire array.


Note the memory attribute on adopters. The memory attribute tells Solidity to temporarily store the value in memory, rather than saving it to the contract's storage. Since adopters is an array, and we know from the first adoption test that we adopted pet `expectedPetId`, we compare the testing contracts address with location `expectedPetId` in the array.
Running the tests
Back in the terminal, run the tests:
`truffle test`


If all the tests pass, you'll see console output similar to this:
   
````
Using network 'development'.
Compiling ./contracts/Adoption.sol...
Compiling ./test/TestAdoption.sol...
Compiling truffle/Assert.sol...
Compiling truffle/DeployedAddresses.sol...

TestAdoption
   ✓ testUserCanAdoptPet (91ms)
   ✓ testGetAdopterAddressByPetId (70ms)
   ✓ testGetAdopterAddressByPetIdInArray (89ms)

    3 passing (670ms)
````

## Creating a user interface to interact with the smart contract

Now that we've created the smart contract, deployed it to our local test blockchain and confirmed we can interact with it via the console, it's time to create a UI so that Pete has something to use for his pet shop!
Included with the pet-shop Truffle Box was code for the app's front-end. That code exists within the src/ directory.

### Instantiating web3

Open /src/js/app.js in a text editor.
Examine the file. Note that there is a global App object to manage our application, load in the pet data in init() and then call the function initWeb3(). The web3 JavaScript library interacts with the Ethereum blockchain. It can retrieve user accounts, send transactions, interact with smart contracts, and more.


#### Things to notice:

First, we check if we are using modern dapp browsers or the more recent versions of MetaMask where an ethereum provider is injected into the window object. If so, we use it to create our web3 object, but we also need to explicitly request access to the accounts with ethereum.enable().
If the ethereum object does not exist, we then check for an injected web3instance. If it exists, this indicates that we are using an older dapp browser (like Mist or an older version of MetaMask). If so, we get its provider and use it to create our web3 object.
If no injected web3 instance is present, we create our web3 object based on our local provider. (This fallback is fine for development environments, but insecure and not suitable for production.)

### Instantiating the contract
Now that we can interact with TomoChain via web3, we need to instantiate our smart contract so web3 knows where to find it and how it works. Truffle has a library to help with this called truffle-contract. It keeps information about the contract in sync with migrations, so you don't need to change the contract's deployed address manually.

* Things to notice:
We first retrieve the artifact file for our smart contract. Artifacts are information about our contract such as its deployed address and Application Binary Interface (ABI). The ABI is a JavaScript object defining how to interact with the contract including its variables, functions and their parameters.
Once we have the artifacts in our callback, we pass them to `TruffleContract()`. This creates an instance of the contract we can interact with.
With our contract instantiated, we set its web3 provider using the App.web3Provider value we stored earlier when setting up web3.
We then call the app's markAdopted() function in case any pets are already adopted from a previous visit. We've encapsulated this in a separate function since we'll need to update the UI any time we make a change to the smart contract's data.

## Getting The Adopted Pets and Updating The UI

* Things to notice:
We access the deployed Adoption contract, then call getAdopters() on that instance.
We first declare the variable adoptionInstance outside of the smart contract calls so we can access the instance after initially retrieving it.
Using call() allows us to read data from the blockchain without having to send a full transaction, meaning we won't have to spend any ether.
After calling getAdopters(), we then loop through all of them, checking to see if an address is stored for each pet. Since the array contains address types, Ethereum initializes the array with 16 empty addresses. This is why we check for an empty address string rather than null or other falsey value.
Once a petId with a corresponding address is found, we disable its adopt button and change the button text to "Success", so the user gets some feedback.
Any errors are logged to the console.

## Handling the adopt() Function

* Things to notice:
We use web3 to get the user's accounts. In the callback after an error check, we then select the first account.
From there, we get the deployed contract as we did above and store the instance in adoptionInstance. This time though, we're going to send a transaction instead of a call. Transactions require a "from" address and have an associated cost. This cost, paid in ether, is called gas. The gas cost is the fee for performing computation and/or storing data in a smart contract. We send the transaction by executing the adopt() function with both the pet's ID and an object containing the account address, which we stored earlier in account.
The result of sending a transaction is the transaction object. If there are no errors, we proceed to call our markAdopted() function to sync the UI with our newly stored data.
Interacting with the dapp in a browser
Now we're ready to use our dapp!

## Installing and configuring MetaMask
The easiest way to interact with our dapp in a browser is through MetaMask, a browser extension for both Chrome and Firefox. Please refer to https://docs.tomochain.com/get-started/wallet/ to connect Metamask to TomoChain and request TOMO faucet to test your games from https://faucet.testnet.tomochain.com/.
 
Installing and configuring lite-server
We can now start a local web server and use the dapp. We're using the lite-server library to serve our static files. This shipped with the pet-shop Truffle Box, but let's take a look at how it works.
Open bs-config.json in a text editor (in the project's root directory) and examine the contents:

````{
  "server": {
    "baseDir": ["./src", "./build/contracts"]
  }
}
````


This tells lite-server which files to include in our base directory. We add the ./src directory for our website files and ./build/contracts directory for the contract artifacts.
We've also added a dev command to the scripts object in the package.json file in the project's root directory. The scripts object allows us to alias console commands to a single npm command. In this case we're just doing a single command, but it's possible to have more complex configurations. Here's what yours should look like:

````
"scripts": {
  "dev": "lite-server",
  "test": "echo \"Error: no test specified\" && exit 1"
},
````


This tells npm to run our local install of lite-server when we execute npm run dev from the console.
Using the dapp
Start the local web server:
`npm run dev`


The dev server will launch and automatically open a new browser tab containing your dapp.

To use the dapp, click the Adopt button on the pet of your choice.
You'll be automatically prompted to approve the transaction by MetaMask. Click Submit to approve the transaction.

You'll see the button next to the adopted pet change to say "Success" and become disabled, just as we specified, because the pet has now been adopted.

Note: If the button doesn't automatically change to say "Success", refreshing the app in the browser should trigger it.
And in MetaMask, you'll see the transaction listed:

You'll also see the same transaction listed in Ganache under the "Transactions" section.
Congratulations! You have taken a huge step to becoming a full-fledged dapp developer. For developing locally, you have all the tools you need to start making more advanced dapps. 
