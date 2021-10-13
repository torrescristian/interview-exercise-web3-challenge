import { BigNumber } from '@ethersproject/bignumber';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { IERC20, Swapper } from '../typechain';

describe('Swapper', () => {
  let dai: IERC20;
  let finalDaiBalance: BigNumber;
  let owner: SignerWithAddress;
  let swapper: Swapper;
  const ONE_ETHER = ethers.utils.parseEther('1');
  const TWO_ETHERS = ethers.utils.parseEther('2');

  before(async () => {
    await network.provider.request({
      method: 'hardhat_reset',
      params: [
        {
          forking: {
            jsonRpcUrl:
              'https://eth-mainnet.alchemyapi.io/v2/erEEjAP53cFul9PPVKGKf6OhM7klh1l8',
            blockNumber: 12103332,
          },
        },
      ],
    });

    const Swapper = await ethers.getContractFactory('Swapper');
    [owner] = await ethers.getSigners();
    swapper = await Swapper.connect(owner).deploy();
    await swapper.deployed();
    dai = (await ethers.getContractAt(
      'IERC20',
      await swapper.DAI_ADDRESS()
    )) as unknown as IERC20;
  });

  it('should create an account with an empty balance', async () => {
    const balance = await swapper.getBalance();
    expect(balance.weth, 'weth').to.equal(0);
    expect(balance.dai, 'dai').to.equal(0);

    const contractBalance = await swapper.getContractBalance();
    expect(contractBalance, 'contractBalance').to.equal(0);
  });

  it('should provide one ether to the owner account', async () => {
    await swapper.provide({
      value: ONE_ETHER,
    });

    const balance = await swapper.getBalance();
    expect(balance.weth, 'weth').to.equal(ONE_ETHER);
    expect(balance.dai, 'dai').to.equal(0);

    const contractBalance = await swapper.getContractBalance();
    expect(contractBalance, 'contractBalance').to.equal(ONE_ETHER);
  });

  it('should be able to provide multiple times', async () => {
    await swapper.provide({
      value: ONE_ETHER,
    });

    const balance = await swapper.getBalance();
    expect(balance.weth, 'weth').to.equal(TWO_ETHERS);
    expect(balance.dai, 'dai').to.equal(0);

    const contractBalance = await swapper.getContractBalance();
    expect(contractBalance, 'contractBalance').to.equal(TWO_ETHERS);
  });

  it('should get an estimated amount of DAIs for WETHs', async () => {
    const estimatedDai = await swapper.getEstimatedDAIForETH();
    expect(estimatedDai.gt(100)).to.be.true;
  });

  it('should swap all the WETH for the maximum amount of DAIs', async () => {
    const estimatedDAIs = await swapper.getEstimatedDAIForETH();
    await swapper.swap();

    const balance = await swapper.getBalance();

    expect(balance.weth, 'balance.weth').to.equal(0);

    const daiBalance = balance.dai;
    expect(daiBalance.gt(100)).to.be.true;
    expect(daiBalance).to.equal(
      estimatedDAIs,
      `real dai price was "${daiBalance}" instead of "${estimatedDAIs}"`
    );
  });

  it('should be able to provide and swap again after a previous swap', async () => {
    const prevBalance = await swapper.getBalance();

    await swapper.provide({
      value: ONE_ETHER,
    });

    const foundedBalance = await swapper.getBalance();
    expect(foundedBalance.weth, 'foundedBalance.weth').to.equal(ONE_ETHER);
    expect(foundedBalance.dai, 'foundedBalance.dai').to.equal(prevBalance.dai);

    const estimatedDAIs = await swapper.getEstimatedDAIForETH();
    await swapper.swap();

    const finalBalance = await swapper.getBalance();
    expect(finalBalance.weth, 'weth').to.equal(0);
    finalDaiBalance = finalBalance.dai;
    expect(finalDaiBalance, 'finalDaiBalance').to.equal(prevBalance.dai.add(estimatedDAIs));
  });

  it('should be able to withdraw all DAI balance', async () => {
    const initialBalance = await swapper.getBalance();

    expect(initialBalance.weth, 'initialBalance.weth').to.equal(0);
    expect(initialBalance.dai, 'initialBalance.dai').to.equal(finalDaiBalance);

    await swapper.withdraw();

    const finalBalance = await swapper.getBalance();
    expect(finalBalance.weth, 'finalBalance.weth').to.equal(0);
    expect(finalBalance.dai, 'finalBalance.dai').to.equal(0);

    const contractBalance = await swapper.getContractBalance();
    expect(contractBalance, 'contractBalance').to.equal(0);

    const ownerDaiBalance = await dai.balanceOf(owner.address);
    expect(ownerDaiBalance, 'ownerDaiBalance').to.equal(initialBalance.dai);
  });
});
