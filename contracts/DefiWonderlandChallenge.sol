pragma solidity ^0.8.0;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

enum INDEX_OF {
  WETH,
  DAI
}

// 1.2 (uniswap V2)
contract Swapper {
  // state vars
  address public constant DAI_ADDRESS =
    0x6B175474E89094C44Da98b954EedeAC495271d0F;
  address constant WETH_ADDRESS = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
  address constant UNISWAP_ROUTER_ADDRESS =
    0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

  address constant FROM_TOKEN = WETH_ADDRESS;
  address constant TO_TOKEN = DAI_ADDRESS;

  mapping(address => mapping(address => uint)) ledger;

  IUniswapV2Router02 private uniswapRouter;

  constructor() {
    uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
  }

  function _getPathForETHToDAI() private pure returns (address[] memory) {
    address[] memory path = new address[](2);

    path[uint(INDEX_OF.WETH)] = WETH_ADDRESS;
    path[uint(INDEX_OF.DAI)] = DAI_ADDRESS;

    return path;
  }

  function getBalance() external view returns (uint weth, uint dai) {
    weth = ledger[msg.sender][FROM_TOKEN];
    dai = ledger[msg.sender][TO_TOKEN];
  }

  function getContractBalance() external view returns (uint) {
    return address(this).balance;
  }

  function getEstimatedDAIForETH() public view returns (uint) {
    mapping(address => uint) storage userBalance = ledger[msg.sender];

    uint[] memory amounts = uniswapRouter.getAmountsOut(
      userBalance[FROM_TOKEN],
      _getPathForETHToDAI()
    );

    return amounts[uint(INDEX_OF.DAI)];
  }

  function provide() external payable {
    ledger[msg.sender][FROM_TOKEN] += msg.value;
  }

  function swap() external {
    mapping(address => uint) storage userBalance = ledger[msg.sender];

    uint deadline = block.timestamp + 15; // + 15 seg
    uint[] memory amounts = uniswapRouter.swapExactETHForTokens{
      value: userBalance[FROM_TOKEN]
    }(getEstimatedDAIForETH(), _getPathForETHToDAI(), address(this), deadline);

    userBalance[TO_TOKEN] += amounts[uint(INDEX_OF.DAI)];
    userBalance[FROM_TOKEN] = 0;
  }

  function withdraw() external returns (uint) {
    mapping(address => uint) storage userBalance = ledger[msg.sender];

    uint amount = userBalance[TO_TOKEN];

    assert(amount > 0);

    bool success = IERC20(DAI_ADDRESS).transfer(msg.sender, amount);

    assert(success);

    userBalance[TO_TOKEN] = 0;
    return amount;
  }
}
