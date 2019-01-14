let {
    PrivateKey,
    Address,
    key,
    TransactionBuilder,
    TransactionHelper
    // axios
} = hx_js;
let {Apis, ChainConfig} = hx_js.bitshares_ws;

// import {PrivateKey, key} from "../lib";
let chainid =
    "2e13ba07b457f2e284dcfcbd3d4a3e4d78a6ed89a61006cdb7fdad6d67ef0b12";

ChainConfig.setChainId(
    // "fe70279c1d9850d4ddb6ca1f00c577bc2e86bf33d54fafd4c606a6937b89ae32"
    // "9f3b24c962226c1cb775144e73ba7bb177f9ed0b72fac69cd38764093ab530bd" // testnet
    "2e13ba07b457f2e284dcfcbd3d4a3e4d78a6ed89a61006cdb7fdad6d67ef0b12" // mainnet
);

// let nodeApiUrl = "ws://211.159.168.197:6090"; // mainnet: "ws://211.159.168.197:6090", testnet: "ws://47.74.44.110:8091";
// let nodeApiUrl = "ws://localhost:8090";
let nodeApiUrl = "wss://nodeapi.hxlab.org:443";

ChainConfig.address_prefix = "HX";
ChainConfig.expire_in_secs = 5 * 60; // 5 min

let seed = "THIS IS A TERRIBLE BRAINKEY SEED WORD SEQUENCE";
let pkey = PrivateKey.fromSeed(key.normalize_brainKey(seed));
let pubkey = pkey.toPublicKey();
let address = pubkey.toAddressString(
    ChainConfig.address_prefix,
    Address.AddressVersion.NORMAL
);

console.log("\nPrivate key:", pkey.toWif());
console.log("Public key :", pubkey.toString(), "\n");
console.log("Public key hex :", pubkey.toHex(), "\n");
console.log("Address:", address);

let toAddress = "HXNLhDsXUTy87nGYHfUsCD797MyDCUgXEAgr";

console.log("chain id bytes: ", TransactionHelper.bytes_to_hex(chainid));

let tr = new TransactionBuilder();

function testTransfer(tr) {
    let op = TransactionHelper.new_transfer_operation(
        address,
        toAddress,
        1,
        "1.3.0",
        "hello, 测试"
    );
    tr.add_type_operation("transfer", op);
}

let gpcHex =
    "0836789b24b8fb05b133c750d7190ec4ba2e3f50000003731b476c7561100019930d0a1a0a040804080878560000000000000000000000287740010000000000000000000002040a0000002c0000006c40000080000000a4808000ec8000008ac00080ecc000008ac08080a600000126008000020000000405696e6974040673746172740100000001000400000000010000000100000001000208000000224000001e4000804b00000000008000220000001ec0ff7f2600000126008000000000000000000000000000080000000100000001000000010000000100000001000000010000000100000001000000010000000670726f707300000000080000000000000000010000000100000001000208000000224000001e4000804b00000000008000220000001ec0ff7f2600000126008000000000000000000000000000080000000100000001000000010000000100000001000000010000000100000001000000010000000670726f707300000000080000000000000000070000000a00000001000306000000470040004a80c08046c0400081000100644000012600800005000000040873746f7261676504056e616d65041073696d706c655f636f6e747261637404067072696e74041773696d706c6520636f6e747261637420696e69746564010000000000000000000600000008000000080000000900000009000000090000000a000000010000000573656c66000000000600000001000000055f454e56000c000000100000000200050d00000086004000c1400000a440000186004000c180000007c1400007014102a440800181400100c00080009dc00001a6000001260080000600000004067072696e7404247374617274206170692063616c6c6564206f662073696d706c6520636f6e7472616374040e73746f726167652e6e616d653d040873746f7261676504056e616d65040768656c6c6f20010000000000000000000d0000000d0000000d0000000d0000000e0000000e0000000e0000000e0000000e0000000f0000000f0000000f0000000f00000010000000020000000573656c66000000000d00000004617267000000000d00000001000000055f454e560a000000010000000100000005000000050000000a00000007000000100000000c00000012000000120000000300000009436f6e7472616374010000000a0000000853746f72616765020000000a000000024d040000000a00000001000000055f454e560000000200000004696e6974000000057374617274000000000000000000000001000000046e616d6500000004";
var gpcObject = TransactionHelper.decode_contract_code_object_from_gpc(gpcHex);

function testRegisterContractTesting(tr) {
    TransactionHelper.registerContractTesting(apiInstance, pubkey, gpcHex)
        .then(data => {
            console.log(data);
        })
        .catch(err => {
            console.log(err);
        });
}

function testRegisterContract(tr) {
    console.log("gpcObject", gpcObject);
    // let code = {
    //     abi: ["init", "start"],
    //     offline_abi: [
    //         // "offlineGetInfo"
    //     ],
    //     events: [],
    //     storage_properties: [["name", 4]], // [ [key, value], ... ]
    //     code: tokenContractBytes,
    //     code_hash: contractHash
    // };
    let code = gpcObject;
    var registerTime = Math.floor(new Date().getTime() / 1000);
    console.log("registerTime", registerTime);
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
}

// TODO: register contract testing, transfer to contract testing
// TODO: wrap some op creators

function testInvokeContract(tr) {
    var contractId = "HXCeMwCyGJhQhpXPZoMPYKgWuuh7eEzgCwkS";
    var contractApi = "balanceOf";
    var apiArg = "HXNUE3EyLeWpN5XA8S4q5DVrbGguWSmPfSoN";
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
}

function testTransferToContract(tr) {
    let contractId = "HXCeMwCyGJhQhpXPZoMPYKgWuuh7eEzgCwkS";
    let assetId = "1.3.0";
    let assetAmount = 1;
    let memo = "test";
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
}

function testCreateAccount(tr) {
    let accountName = "test00001";
    let op = TransactionHelper.new_register_account_operation(
        address,
        pubkey,
        accountName
    );
    tr.add_type_operation("account_create", op);
}

function testLockBalanceToCitizen(tr) {
    let lockAssetId = "1.3.0";
    var lockAssetAmount = 1000;
    let ownerAccountId = "1.2.1"; // caller's account id
    let citizenId = "1.6.1";
    let op = TransactionHelper.new_lockbalance_to_citizen_operation(
        address,
        ownerAccountId,
        citizenId,
        lockAssetId,
        lockAssetAmount
    );
    tr.add_type_operation("lockbalance", op);
}

function testForecloseBalanceFromCitizen(tr) {
    let assetId = "1.3.0";
    let assetAmount = 1000;
    let ownerAccountId = "1.2.1"; // caller's account id
    let citizenId = "1.6.1";
    var op = TransactionHelper.new_forclose_balance_from_citizen_operation(
        address,
        ownerAccountId,
        citizenId,
        assetId,
        assetAmount
    );
    tr.add_type_operation("foreclose_balance", op);
}

function testTakePaybackFromCitizen(tr) {
    var payBackBalances = [["volans", {amount: 100, asset_id: "1.3.0"}]];
    var op = TransactionHelper.new_take_payback_from_citizen_operation(
        address,
        payBackBalances
    );
    tr.add_type_operation("pay_back", op);
}

function testInvokeContractTesting(tr) {
    var contractId = "HXCeMwCyGJhQhpXPZoMPYKgWuuh7eEzgCwkS";
    var contractApi = "balanceOf";
    var apiArg = "HXNUE3EyLeWpN5XA8S4q5DVrbGguWSmPfSoN";
    TransactionHelper.invokeContractOffline(
        apiInstance,
        pubkey,
        contractId,
        contractApi,
        apiArg
    )
        .then(data => {
            console.log("testInvokeContractTesting result", data);
        })
        .catch(err => {
            console.log(err);
        });
}

function testTransferToContractTesting(tr) {
    var contractId = "HXCeMwCyGJhQhpXPZoMPYKgWuuh7eEzgCwkS";
    var assetAmount = 1;
    var assetSymbol = "HX";
    var transferMemo = "test";
    TransactionHelper.transferToContractTesting(
        apiInstance,
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
}

function testRegisterContractTesting(tr) {
    TransactionHelper.registerContractTesting(apiInstance, pubkey, gpcHex)
        .then(data => {
            console.log("testRegisterContractTesting result", data);
        })
        .catch(err => {
            console.log(err);
        });
}

// testTransfer(tr);
// testRegisterContract(tr);
// testInvokeContract(tr);
// testCreateAccount(tr);
// testLockBalanceToCitizen(tr);
// testForecloseBalanceFromCitizen(tr);
// testTakePaybackFromCitizen(tr);
testTransferToContract(tr);

function assertTrue(expr, msg) {
    if (!expr) {
        throw new Error(msg || "assert failed");
    }
}

let sig =
    "1f5dce0dfd3831dd3a5966e0fb795c1baf7756f420fe92779a3c7e94c0df0da4a953b50a650c762a02171900d42604640bf689088c28961aa41d07f9ff7968d846";
let privatekeystr = "5KAffU3Pw7RNJAJ3d1qUrJ6QPVb6UFx6CJ4MhgfoHL7YwYspHhs";
let pubkeystr = "HXN8mT7XvtTARjdZQ9bqHRoJRMf7P7azFqTQACckaVenM2GmJyxLh ";

let txHex = "";
let sigDigest = tr.sha256(
    tr.sha256(
        tr.concatBuffer([tr.createBuffer(chainid), tr.createBuffer(txHex)])
    )
);
let sigDigestFromServer = "";
let pubkeyStrDecodeFromServer = "";
let txid = tr.sha256(tr.createBuffer(txHex)).toString("hex");
let txIdFromServer =
    "aee0c9c276a7f5c36e72fa42055e52b020d326166b5b8eb8060006c67946457d";
let txServer =
    "c65749db1744d795de5b0100c8000000000000000000000035c3bc82517997870466a130bc08776e9cdbc58835a44a460166def18fb69012c4cd31659258892f010000000000000000000000";
console.log("txid: " + txid);
console.log("txIdFromServer: " + txIdFromServer);
console.log("sigDegest: " + sigDigest.toString("hex"));
console.log("sigDigestFromServer: " + sigDigestFromServer);
console.log("sig: " + sig);
console.log("pubkeyFromServer: " + pubkeyStrDecodeFromServer);
// let pubkeyUnCompressed = pubkey.toUncompressed()
// console.log('pubkeyUnCompressed: ' + pubkeyUnCompressed.toString())
let toRecoverDigest = tr
    .sha256(tr.concatBuffer([tr.createBuffer(chainid), tr.createBuffer(txHex)]))
    .toString("hex");
let toRecoverDigestFromServer = "";

let recovered = tr.recoverPublicKeyFromBufferFunc(
    tr.createBuffer(sig, "hex"),
    tr.concatBuffer([tr.createBuffer(chainid), tr.createBuffer(txHex)])
);
console.log("toRecoverDigest: " + toRecoverDigest);
console.log("toRecoverDigestFromServer: " + toRecoverDigestFromServer);
console.log("recovered pubkey: " + recovered.toPublicKeyString());

let apiInstance = Apis.instance(nodeApiUrl, true);
apiInstance.init_promise
    .then(function() {
        TransactionHelper.getAddrBalances(apiInstance, address).then(r => {
            console.log("balances: ", r);
        });
        TransactionHelper.getAccountByAddresss(
            apiInstance,
            "HXNdkruwzhKc8EQKVNirF7xPLLpEojResJcZ"
        ).then(r => {
            console.log("account found by address: ", r);
        });

        TransactionHelper.getAddressPayBackBalance(apiInstance, address)
            .then(data => {
                console.log(data);
            })
            .catch(err => {
                console.log(err);
            });

        testInvokeContractTesting(tr);
        testRegisterContractTesting(tr);
        testTransferToContractTesting(tr);

        tr.set_expire_seconds(0);
        return tr
            .set_required_fees()
            .then(() => {
                assertTrue(tr.operations[0][1].fee.asset_id === "1.3.0");
                assertTrue(tr.operations[0][1].fee.amount >= 0); // == 0 when is lock balance and foreclose
                return true;
            })
            .then(function() {
                console.log(tr);
            })
            .then(() => tr.finalize());
    })
    .then(() => {
        tr.add_signer(pkey, pubkey);
        tr.sign();

        var broadcast = true;
        if (broadcast) {
            tr.broadcast(function() {
                console.log("broadcast callback called");
            });
        }
    })
    .catch(function(err) {
        console.log(err);
    });
