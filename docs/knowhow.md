### Package Manager
- you can import 
```js
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
```
- but you need to make an import of npm for most JS-solidity frameworks
```sh
npm i @openzeppelin/contracts
```

### Forking mainnet
```js
// config
networks: {
  hardhat: {
    forking: {
      url: "https://eth-mainnet.alchemyapi.io/v2/<key>",
      blockNumber: 11095000
    }
  }
}
```
- cli
```shell
npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/<key> --fork-block-number 11095000
npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/erEEjAP53cFul9PPVKGKf6OhM7klh1l8 --fork-block-number 12103332
```

### Get Accounts
```ts
const [acc1, acc2] = await ethers.getSigners();
```

### set testing state EVM with mainforking
```ts
const forkBlockNumber: { [name: string]: number } = {
  dai: 12103332,
};

before(async () => {
  await evm.reset({
    jsonRpcUrl: getNodeUrl('mainnet'),
    blockNumber: forkBlockNumber.dai,
  });
  // ...
  snapshotId = await evm.snapshot.take();
});

beforeEach(async () => {
  await evm.snapshot.revert(snapshotId);
});
```

### get balance

```ts
// const account = web3.utils.toChecksumAddress(taskArgs.account);
const balance = await web3.eth.getBalance(account);
// ---
let daiWhale: JsonRpcSigner;
daiWhale = await wallet.impersonate(daiWhaleAddress);
daiWhale._address
```

### Parsers

```ts
// ---
web3.utils.fromWei(balance, "ether")
// ---
ethers.utils.parseEther('1');
// ---
// # ethers.utils.formatUnits( value [ , unit = "ether" ] ) ⇒ string
const oneGwei = BigNumber.from("1000000000");
const oneEther = BigNumber.from("1000000000000000000");

formatUnits(oneGwei, 0);
// '1000000000'

formatUnits(oneGwei, "gwei");
// '1.0'

formatUnits(oneGwei, 9);
// '1.0'

formatUnits(oneEther);
// '1.0'

formatUnits(oneEther, 18);
// '1.0'

const value = BigNumber.from("1000000000000000000");

formatEther(value);
// '1.0'

// # ethers.utils.parseUnits( value [ , unit = "ether" ] ) ⇒ BigNumber
parseUnits("1.0");
// { BigNumber: "1000000000000000000" }

parseUnits("1.0", "ether");
// { BigNumber: "1000000000000000000" }

parseUnits("1.0", 18);
// { BigNumber: "1000000000000000000" }

parseUnits("121.0", "gwei");
// { BigNumber: "121000000000" }

parseUnits("121.0", 9);
// { BigNumber: "121000000000" }

// # ethers.utils.parseEther( value ) ⇒ BigNumber

parseEther("1.0");
// { BigNumber: "1000000000000000000" }

parseEther("-0.5");
// { BigNumber: "-500000000000000000" }
```

### Cryptos
```ts
const dai: IERC20 = (await ethers.getContractAt('IERC20', '0x6b175474e89094c44da98b954eedeac495271d0f')) as unknown as IERC20;

// check balance
const balance = await dai.balanceOf(account.address);

// transfer
const transferTx: Promise<TransactionResponse> = await dai.connect(daiWhale).transfer(stranger.address, ethers.utils.parseEther('1'));
```
