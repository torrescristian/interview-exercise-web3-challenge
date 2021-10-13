import { BigNumber } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { IERC20, Swapper } from "../typechain";

describe("Swapper", () => {
  let dai: IERC20;
  let finalDaiBalance: BigNumber;
  let owner: SignerWithAddress;
  let swapper: Swapper;

  before(async () => {
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl:
              "https://eth-mainnet.alchemyapi.io/v2/erEEjAP53cFul9PPVKGKf6OhM7klh1l8",
            blockNumber: 12103332,
          },
        },
      ],
    });

    const Swapper = await ethers.getContractFactory("Swapper");
    [owner] = await ethers.getSigners();
    swapper = await Swapper.connect(owner).deploy();
    await swapper.deployed();
    dai = (await ethers.getContractAt(
      "IERC20",
      await swapper.daiAddress()
    )) as unknown as IERC20;
  });

  it("should create an account with an empty balance", async () => {
    const balance = await swapper.getBalance();
    expect(balance.weth).to.equal(0);
    expect(balance.dai).to.equal(0);
  });

  it("should provide one ether to the owner account", async () => {
    const ONE_ETHER = ethers.utils.parseEther("1");

    await swapper.provide({
      value: ONE_ETHER,
    });

    const balance = await swapper.getBalance();
    expect(balance.weth).to.equal(ONE_ETHER);
    expect(balance.dai).to.equal(0);
  });

  it("should get an estimated amount of DAIs for WETHs", async () => {
    const estimatedDai = await swapper.getEstimatedDAIForETH();
    expect(estimatedDai.gt(100)).to.be.true;
  });

  it("should swap all the WETH for the maximum amount of DAIs", async () => {
    const estimatedDais = await swapper.getEstimatedDAIForETH();
    await swapper.swap();

    const balance = await swapper.getBalance();

    expect(balance.weth).to.equal(0);

    finalDaiBalance = balance.dai;
    expect(finalDaiBalance.gt(100)).to.be.true;
    expect(finalDaiBalance).to.be.equal(
      estimatedDais,
      `real dai price was "${finalDaiBalance}" instead of "${estimatedDais}"`
    );
  });

  it("should be able to withdraw all DAI balance", async () => {
    const initialBalance = await swapper.getBalance();

    expect(initialBalance.weth).to.equal(0);
    expect(initialBalance.dai).to.be.equal(finalDaiBalance);

    await swapper.withdraw();

    const finalBalance = await swapper.getBalance();
    expect(finalBalance.weth).to.equal(0);
    expect(finalBalance.dai).to.equal(0);

    const ownerDaiBalance = await dai.balanceOf(owner.address);
    expect(ownerDaiBalance, "ownerDaiBalance").to.be.equal(finalDaiBalance);
  });
});
