const hre = require("hardhat");

async function main() {
  const StudentRegistry = await hre.ethers.getContractFactory("StudentRegistry");
  const studentRegistry = await StudentRegistry.deploy();
  await studentRegistry.waitForDeployment();
  //await studentRegistry.deployTransaction.wait();
  //console.log(studentRegistry);  // 查看合約物件的詳細資訊

  console.log("StudentRegistry 合約已部署到:",await studentRegistry.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
