const yargs = require('yargs');
const privKeyLocal = "1895A43E023C2E5552A82E13B2A6FE8151E64AA4478FD350818241D131DFD7E4"
const PrivateKeyProvider = require("truffle-privatekey-provider");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    tomotestnet: {
      // Useful for private networks
       provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://testnet.tomochain.com"),
       network_id: 88,   // This network is yours, in the cloud.
       production: true    // Treats this network as if it was a public net. (default: false)
    },
    localnet: {
      // Useful for private networks
      provider: () => new PrivateKeyProvider(privKeyLocal, "https://localhost:8080"),
      network_id: 88,   // This network is yours, in the cloud.
      production: true    // Treats this network as if it was a public net. (default: false)
    },
    tomomainnet: {
      // Useful for private networks
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://rpc.tomochain.com"),
      network_id: 89,   // This network is yours, in the cloud.
      production: true    // Treats this network as if it was a public net. (default: false)
    }
  }
};
