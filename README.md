1.1

Create a swapper contract that:
- [X] Has a fromToken and a toToken property, they can be both sent in the constructor.
- [X] Has a provide(amount) function that will take the amount of the fromToken from the function caller.
- [X] Has a swap function that will exchange all provided tokens into the toToken
- [X] Has a withdraw function that allows the user that provided the tokens to withdraw the toTokens that he should be allowed to withdraw.

For the sake of simplicity: We can assume a 1 to 1 relationship between fromToken and toToken.

Tests:
- [] All functions should be unit tested, fully. 
- [] Swap function should be integration tested with a fork of mainnet (see hardhat mainnet forking)

1.2 (uniswap V2)

change swap functionality to use uniswap-v2 pool (use WETH-DAI pair).
add swap directly from ETH to DAI
receive ETH directly for DAI

// Ropsten network

// FROM
address ETH = 0xf70949bc9b52deffcda63b0d15608d601e3a7c49;
// TO
address DAI = 0xc715abcd34c8ed9ebbf95990e0c43401fbbc122d;

1.3 (Nice to have)

Create a job contract, that should comply to keep3r network interface, and that:

- Has a work() function that can only be called every 10 minutes. This function work should call on Swapper.swap(). Effectively, allowing the swap to only be executed every 10 minutes.
- Has a workable() returns (bool) function that returns true only if work can be executed. work should require(workable) 

Tests:
- All functions should be unit tested, fully. 
- Integration tests add the SwapperJob to the keep3r network impersonating (check hardhat tooling) governance.
- Integration tests add credits, and add job to the keep3r network.
*/

```sol
contract Swapper_1_1 {
    address fromToken;
    address toToken;
    mapping(address => mapping(address => uint)) ledger;

    constructor(address _fromToken, address _toToken) {
        fromToken = _fromToken;
        toToken = _toToken;
    }
    
    function provide(uint amount) external {
        ledger[msg.sender][fromToken] = amount;
    }
    
    function getBalance() external view returns(uint balanceTokenFrom, uint balanceTokenTo) {
        balanceTokenFrom = ledger[msg.sender][fromToken];
        balanceTokenTo = ledger[msg.sender][toToken];
    }
    
    function swap() external {
        mapping(address => uint) storage userBalance = ledger[msg.sender];

        userBalance[toToken] += userBalance[fromToken];
        userBalance[fromToken] = 0;
    }
    
    function withdraw() external returns (uint) {
        mapping(address => uint) storage userBalance = ledger[msg.sender];

        uint amount = userBalance[toToken];
        // some operation?
        userBalance[toToken] = 0;
        return amount;
    }
}


interface UniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
}

interface UniswapV2Pair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}
*/
```

1.2 (uniswap V2)

change swap functionality to use uniswap-v2 pool (use WETH-DAI pair).
add swap directly from ETH to DAI
receive ETH directly for DAI

// Ropsten network

// FROM
address ETH = 0xf70949bc9b52deffcda63b0d15608d601e3a7c49;
// TO
address DAI = 0xc715abcd34c8ed9ebbf95990e0c43401fbbc122d;

```sol
abstract contract RouterInterface {
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable {}
    
    address public WETH;
    
     function getAmountsIn(uint amountOut, address[] memory path)
        public
        view
        virtual
        returns (uint[] memory amounts);
        
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
        external
        payable
        virtual
        returns (uint[] memory amounts);
    
}
```
