/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomiclabs/hardhat-truffle5");
//require("@nomiclabs/hardhat-web3-legacy"); ---> esto hace que rompan mis tests
require('solidity-coverage');

module.exports = {
  solidity: "0.6.0",
};
