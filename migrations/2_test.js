const Astronaut = artifacts.require("Astronaut");

module.exports = function (deployer) {
  deployer.deploy(Astronaut,"Astronaut", "NAUT");
};
