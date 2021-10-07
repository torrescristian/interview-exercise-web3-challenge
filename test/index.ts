import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Swapper", function () {
  it("Should get DAIs amount", async function () {
    const Swapper = await ethers.getContractFactory("Swapper");
    const swapper = await Swapper.deploy();
    await swapper.deployed();

    const balance = await swapper.getBalance();

    expect(balance.weth).to.equal(0);
    expect(balance.dai).to.equal(0);

    const ethersToSend = 0.01;

    swapper.provide({
      value: ethers.utils.parseEther(String(ethersToSend)),
    })
    
    expect(balance.weth).to.equal(BigNumber.from(ethersToSend * (10 ** 18)));
    expect(balance.dai).to.equal(0);

    // const estimatedDais = await swapper.getEstimatedDAIForETH();
    // expect(estimatedDais).to.greaterThan(0);
    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
