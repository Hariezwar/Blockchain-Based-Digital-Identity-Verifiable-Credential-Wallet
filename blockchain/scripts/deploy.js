const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  const IssuerRegistry = await hre.ethers.getContractFactory("IssuerRegistry");
  const issuerRegistry = await IssuerRegistry.deploy();
  await issuerRegistry.waitForDeployment();
  const issuerRegistryAddress = await issuerRegistry.getAddress();
  console.log(`IssuerRegistry deployed to: ${issuerRegistryAddress}`);

  const CredentialStatusRegistry = await hre.ethers.getContractFactory("CredentialStatusRegistry");
  const statusRegistry = await CredentialStatusRegistry.deploy(issuerRegistryAddress);
  await statusRegistry.waitForDeployment();
  const statusRegistryAddress = await statusRegistry.getAddress();
  console.log(`CredentialStatusRegistry deployed to: ${statusRegistryAddress}`);

  const DIDRegistry = await hre.ethers.getContractFactory("DIDRegistry");
  const didRegistry = await DIDRegistry.deploy();
  await didRegistry.waitForDeployment();
  const didRegistryAddress = await didRegistry.getAddress();
  console.log(`DIDRegistry deployed to: ${didRegistryAddress}`);

  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log(`CONTRACT_ISSUER_REGISTRY=${issuerRegistryAddress}`);
  console.log(`CONTRACT_STATUS_REGISTRY=${statusRegistryAddress}`);
  console.log(`CONTRACT_DID_REGISTRY=${didRegistryAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
