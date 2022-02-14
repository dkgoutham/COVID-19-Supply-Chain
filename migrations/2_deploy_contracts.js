const Chain = artifacts.require("Chain");

module.exports = function(deployer) {
  deployer.deploy(Chain);
};
