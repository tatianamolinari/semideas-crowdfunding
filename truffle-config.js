const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');    // Useful for deploying to a public network.
const SEED_PHRASE = "benefit cake raise family jungle scheme view potato merge tower cage soup"

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    contracts_build_directory: path.join(__dirname, "client/src/contracts"),
    networks: {
        development: {
            port: 7545,
            network_id: "5777",
            host: "127.0.0.1"
        },
        rinkeby: {
            provider: () => new HDWalletProvider(SEED_PHRASE, `https://rinkeby.infura.io/v3/296eba79f82040fd95a0f48edd2289a9`),
            network_id: 4,       // Ropsten's id
            gas: 5500000,        
            confirmations: 10,    // # of confs to wait between deployments. (default: 0)
            timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
            skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
        },
    },
    compilers: {
        solc: {
            version: "^0.8.0"
        }
    }
};