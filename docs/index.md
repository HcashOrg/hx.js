hxjs
===========

hx javascript sdk

# Example

* see source code of `testweb/test.js`

# Build

```
    npm run-script build && npm run-script browserify
```

# Usage

* build manually or `npm install hxjs`
* include `hxjs.min.js` to your website

### Chain

This library provides utility functions to handle blockchain state as well as a login class that can be used for simple login functionality using a specific key seed.

#### Login

The login class uses the following format for keys:

```
keySeed = accountName + role + password
```

A minimum password length of 12 characters is enforced, but an even longer password is recommended. Three methods are provided:

```
generateKeys(account, password, [roles])
checkKeys(account, password, auths)
signTransaction(tr)
```

If checkKeys is successful, you can use signTransaction to sign a TransactionBuilder transaction using the private keys for that account.

### ECC

The ECC library contains all the crypto functions for private and public keys as well as transaction creation/signing.

#### Private keys

As a quick example, here's how to generate a new private key from a seed (a brainkey for example):

```
let {PrivateKey, key} = require("hxjs");

let seed = "THIS IS A TERRIBLE BRAINKEY SEED WORD SEQUENCE";
let pkey = PrivateKey.fromSeed( key.normalize_brainKey(seed) );

console.log("\nPrivate key:", pkey.toWif());
console.log("Public key :", pkey.toPublicKey().toString(), "\n");
```

#### Transactions

```
let {
    PrivateKey,
    Address,
    key,
    TransactionBuilder,
    TransactionHelper,
    NodeClient,
    Apis,
    ChainConfig
} = hx_js;
...
let tr = new TransactionBuilder();
let op = TransactionHelper.new_transfer_operation(
        fromAddress,
        toAddress,
        1, // asset amount
        "1.3.0", // asset id
        "memo here"
    );
tr.add_type_operation("transfer", op);
...
tr.add_signer(privateKey, pubkey);
tr.sign();

tr.broadcast(function() {
    console.log("broadcast callback called");
});
```

#### Operations

you can use TransactionHelper class to create some operations and then add them to transaction.


* transfer

```
    let op = TransactionHelper.new_transfer_operation(
        address,
        toAddress,
        1,
        "1.3.0",
        "hello, memo"
    );
    tr.add_type_operation("transfer", op);
```

* create contract

```
    tr.add_type_operation(
        "contract_register",
        TransactionHelper.new_contract_register_operation_from_gpc(
            address,
            pubkey,
            10000,
            1,
            gpcHex
        )
    );
```

* invoke contract

```
    var op = TransactionHelper.new_contract_invoke_operation(
        address,
        pubkey,
        2000,
        1,
        contractId,
        contractApi,
        apiArg
    );
    tr.add_type_operation("contract_invoke", op);
```

* transfer to contract

```
    let op = TransactionHelper.new_transfer_to_contract_operation(
        address,
        pubkey,
        contractId,
        1000,
        1,
        assetId,
        assetAmount,
        memo
    );
    tr.add_type_operation("transfer_contract", op);
```

* register account

```
    let op = TransactionHelper.new_register_account_operation(
        address,
        pubkey,
        accountName
    );
    tr.add_type_operation("account_create", op);
```

* lock balance to citizen

```
    let op = TransactionHelper.new_lockbalance_to_citizen_operation(
        address,
        ownerAccountId,
        citizenId,
        lockAssetId,
        lockAssetAmount
    );
    tr.add_type_operation("lockbalance", op);
```

* foreclose balance from citizen

```
    var op = TransactionHelper.new_forclose_balance_from_citizen_operation(
        address,
        ownerAccountId,
        citizenId,
        assetId,
        assetAmount
    );
    tr.add_type_operation("foreclose_balance", op);
```

* take payback from citizen

```
    var payBackBalances = [["volans", {amount: 100, asset_id: "1.3.0"}]];
    var op = TransactionHelper.new_take_payback_from_citizen_operation(
        address,
        payBackBalances
    );
    tr.add_type_operation("pay_back", op);
```

#### NodeClient RPC

* execDbApi

```
    var nodeClient = new NodeClient(apiInstance);
    nodeClient.execDbApi('get_contract_balance', 'contract-address-here')
        .then(data => {
            console.log("contract balances", data);
        });
```

* getGlobalDynamicProperties

```
    nodeClient.getGlobalDynamicProperties()
        .then(info => {
            console.log("chain info", info);
        })
        .catch(e => {
            console.log("error", e);
        });
```

* listAssets

```
    nodeClient.listAssets('', 100)
        .then(assets => {
            console.log("assets", assets);
        })
        .catch(e => {
            console.log("error", e);
        });
```

* nodeClient.getContractBalances(contractAddr)

* nodeClient.listCitizens(prefix, limit)

* nodeClient.getCitizensCount()

* nodeClient.getCitizen(citizenIdOrAccountName)

* nodeClient.getAccount(accountId)

* nodeClient.getAccountByName(accountName)

* nodeClient
        .invokeContractOffline(pubkey, contractId, contractApi, apiArg)

* nodeClient.invokeContractTesting(callerPubKey, contractId, contractApi, apiArg)

* transferToContractTesting

```
    nodeClient
        .transferToContractTesting(
            pubkey,
            contractId,
            assetAmount,
            assetSymbol,
            transferMemo
        )
        .then(data => {
            console.log("testTransferToContractTesting result", data);
            var feeAsset = data[0];
            var gasCount = data[1];
            console.log("transfer_to_contract_testing fee", feeAsset);
            console.log("transfer_to_contract_testing gasCount", gasCount);
        })
        .catch(err => {
            console.log(err);
        });
```

* nodeClient.registerContractTesting(pubkey, gpcHex)

* get address balances

```
    nodeClient.getAddrBalances(address).then(r => {
            console.log("balances: ", r);
        });
```

* nodeClient.getAccountByAddresss(address)

* nodeClient.getAccountLockBalances(accountName)

* nodeClient.getAddressPayBackBalance(address)

* nodeClient.getContractInfo(contractAddress)

* nodeClient.getSimpleContractInfo(contractAddress)

* nodeClient.getContractTxReceipt(txid)

* nodeClient.getTransactionById(txid)
