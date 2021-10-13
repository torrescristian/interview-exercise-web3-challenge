pragma solidity ^0.8.0;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

enum INDEX_OF {
    WETH,
    DAI
}

// 1.2 (uniswap V2)
contract Swapper {
    address constant uniswapV2FactoryAddress =
        0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address constant public daiAddress = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address constant wethAddress = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant fromToken = wethAddress;
    address constant toToken = daiAddress;
    address constant UNISWAP_ROUTER_ADDRESS =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    mapping(address => mapping(address => uint256)) ledger;

    IUniswapV2Router02 private uniswapRouter;

    constructor() {
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
    }

    function provide() external payable {
        ledger[msg.sender][fromToken] += msg.value;
    }

    function getBalance() external view returns (uint256 weth, uint256 dai) {
        weth = ledger[msg.sender][fromToken];
        dai = ledger[msg.sender][toToken];
    }

    function swap() external {
        mapping(address => uint) storage userBalance = ledger[msg.sender];
        
        uint deadline = block.timestamp + 15;
        uint[] memory amounts = uniswapRouter.swapExactETHForTokens{ value: userBalance[fromToken] }(
            getEstimatedDAIForETH(),
            getPathForETHToDAI(),
            address(this),
            deadline
        );

        userBalance[toToken] += amounts[uint(INDEX_OF.DAI)];
        userBalance[fromToken] = 0;
    }

    function withdraw() external returns (uint256) {
        mapping(address => uint256) storage userBalance = ledger[msg.sender];

        uint256 amount = userBalance[toToken];

        assert(amount > 0);

        bool success = IERC20(daiAddress).transfer(msg.sender, amount);

        assert(success);

        userBalance[toToken] = 0;
        return amount;
    }

    function getEstimatedDAIForETH() public view returns (uint256) {
        mapping(address => uint256) storage userBalance = ledger[msg.sender];

        uint256[] memory amounts = uniswapRouter.getAmountsOut(
            userBalance[fromToken],
            getPathForETHToDAI()
        );

        return amounts[uint(INDEX_OF.DAI)];
    }

    function getPathForETHToDAI() private pure returns (address[] memory) {
        address[] memory path = new address[](2);

        path[uint(INDEX_OF.WETH)] = wethAddress;
        path[uint(INDEX_OF.DAI)] = daiAddress;

        return path;
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
