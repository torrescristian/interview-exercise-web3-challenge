[X] 1.1

Create a swapper contract that:
- [X] Has a fromToken and a toToken property, they can be both sent in the constructor.
- [X] Has a provide(amount) function that will take the amount of the fromToken from the function caller.
- [X] Has a swap function that will exchange all provided tokens into the toToken
- [X] Has a withdraw function that allows the user that provided the tokens to withdraw the toTokens that he should be allowed to withdraw.

For the sake of simplicity: We can assume a 1 to 1 relationship between fromToken and toToken.

Tests:
- [X] All functions should be unit tested, fully. 
- [X] Swap function should be integration tested with a fork of mainnet (see hardhat mainnet forking)

[X] 1.2 (uniswap V2)

- [X] change swap functionality to use uniswap-v2 pool (use WETH-DAI pair).
- [X] add swap directly from ETH to DAI
- [X] receive ETH directly for DAI

[] 1.3 (Nice to have)

Create a job contract, that should comply to keep3r network interface, and that:

- Has a work() function that can only be called every 10 minutes. This function work should call on Swapper.swap(). Effectively, allowing the swap to only be executed every 10 minutes.
- Has a workable() returns (bool) function that returns true only if work can be executed. work should require(workable) 

Tests:
- All functions should be unit tested, fully. 
- Integration tests add the SwapperJob to the keep3r network impersonating (check hardhat tooling) governance.
- Integration tests add credits, and add job to the keep3r network.
*/

