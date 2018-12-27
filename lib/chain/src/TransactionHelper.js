var helper = {};

import secureRandom from "secure-random";

import {Long} from "bytebuffer";

import {Signature, PublicKey, hash, Address} from "../../ecc";
import {ops} from "../../serializer";
import {Apis} from "bitsharesjs-ws";
const Buffer = require("safe-buffer").Buffer;

helper.unique_nonce_entropy = null;
helper.unique_nonce_uint64 = function() {
    var entropy = (helper.unique_nonce_entropy = (() => {
        if (helper.unique_nonce_entropy === null) {
            //console.log('... secureRandom.randomUint8Array(1)[0]',secureRandom.randomUint8Array(1)[0])
            return parseInt(secureRandom.randomUint8Array(1)[0]);
        } else {
            return ++helper.unique_nonce_entropy % 256;
        }
    })());
    var long = Long.fromNumber(Date.now());
    //console.log('unique_nonce_uint64 date\t',ByteBuffer.allocate(8).writeUint64(long).toHex(0))
    //console.log('unique_nonce_uint64 entropy\t',ByteBuffer.allocate(8).writeUint64(Long.fromNumber(entropy)).toHex(0))
    long = long.shiftLeft(8).or(Long.fromNumber(entropy));
    //console.log('unique_nonce_uint64 shift8\t',ByteBuffer.allocate(8).writeUint64(long).toHex(0))
    return long.toString();
};

/* Todo, set fees */
helper.to_json = function(tr, broadcast = false) {
    return (function(tr, broadcast) {
        var tr_object = ops.signed_transaction.toObject(tr);
        if (broadcast) {
            var net = Apis.instance().network_api();
            console.log("... tr_object", JSON.stringify(tr_object));
            return net.exec("broadcast_transaction", [tr_object]);
        } else {
            return tr_object;
        }
    })(tr, broadcast);
};

helper.signed_tr_json = function(tr, private_keys) {
    var tr_buffer = ops.transaction.toBuffer(tr);
    tr = ops.transaction.toObject(tr);
    tr.signatures = (() => {
        var result = [];
        for (
            var i = 0;
            0 < private_keys.length
                ? i < private_keys.length
                : i > private_keys.length;
            0 < private_keys.length ? i++ : i++
        ) {
            var private_key = private_keys[i];
            result.push(Signature.signBuffer(tr_buffer, private_key).toHex());
        }
        return result;
    })();
    return tr;
};

helper.expire_in_min = function(min) {
    return Math.round(Date.now() / 1000) + min * 60;
};

helper.seconds_from_now = function(timeout_sec) {
    return Math.round(Date.now() / 1000) + timeout_sec;
};

/**
    Print to the console a JSON representation of any object in
    @graphene/serializer { types }
*/
helper.template = function(
    serializer_operation_type_name,
    debug = {use_default: true, annotate: true}
) {
    var so = ops[serializer_operation_type_name];
    if (!so) {
        throw new Error(
            `unknown serializer_operation_type ${serializer_operation_type_name}`
        );
    }
    return so.toObject(undefined, debug);
};

helper.new_operation = function(serializer_operation_type_name) {
    var so = ops[serializer_operation_type_name];
    if (!so) {
        throw new Error(
            `unknown serializer_operation_type ${serializer_operation_type_name}`
        );
    }
    var object = so.toObject(undefined, {use_default: true, annotate: true});
    return so.fromObject(object);
};

helper.instance = function(ObjectId) {
    return ObjectId.substring("0.0.".length);
};

helper.unicodeToHex = function(str) {
    var hex, i;
    var result = "";
    for (i = 0; i < str.length; i++) {
        hex = str.charCodeAt(i).toString(16);
        result += ("000" + hex).slice(-4);
    }
    return result;
};

helper.stringToBytes = function(str) {
    return Array.from(str).map(function(c) {
        return c.charCodeAt(0);
    });
};

helper.hex_to_bytes = function(hexStr) {
    var result = [];
    while (hexStr.length >= 2) {
        result.push(parseInt(hexStr.substring(0, 2), 16));
        hexStr = hexStr.substring(2, hexStr.length);
    }
    return result;
};

helper.bytes_to_hex = function(byteArray) {
    return Buffer.from(byteArray, "binary").toString("hex");
};

helper.new_contract_register_time = function() {
    return Math.floor(new Date().getTime() / 1000);
};

helper.calculate_contract_address = function(codeObject, registerTime) {
    var contractBuffer = ops.ContractInfoForCalculateAddress.toBuffer([
        codeObject,
        registerTime * 1000000
    ]);
    var addr = Address.fromBuffer(contractBuffer);
    addr.version = 0x1c;
    var bufsha512 = Address.sha512(contractBuffer);
    var addrAddy = Address.ripemd160(bufsha512);
    addr.addy = addrAddy;
    return addr.toString();
};

helper.decode_contract_code_object_from_gpc = function(gpcHex) {
    var gpcObject = ops.rawTypes.gpcData.toObject(helper.hex_to_bytes(gpcHex));
    return gpcObject;
};

helper.new_contract_register_operation_from_gpc = function(
    callerAddr,
    callerPubKey,
    gasLimit,
    gasPrice,
    gpcHex
) {
    var gpcObject = helper.decode_contract_code_object_from_gpc(gpcHex);
    return helper.new_contract_register_operation_from_gpc_object(
        callerAddr,
        callerPubKey,
        gasLimit,
        gasPrice,
        gpcObject
    );
};

helper.getEmptyAddress = function() {
    return "HXNKuyBkoGdZZSLyPbJEetheRhMjezkaXk2J";
};

helper.new_contract_register_operation_from_gpc_object = function(
    callerAddr,
    callerPubKey,
    gasLimit,
    gasPrice,
    gpcObject
) {
    var registerTime = helper.new_contract_register_time();
    var contractId = helper.calculate_contract_address(gpcObject, registerTime);
    var op = {
        fee: {
            amount: 0,
            asset_id: "1.3.0"
        },
        init_cost: gasLimit,
        gas_price: gasPrice,
        owner_addr: callerAddr,
        owner_pubkey: callerPubKey,
        register_time: registerTime,
        contract_id: contractId,
        contract_code: gpcObject,
        inherit_from: helper.getEmptyAddress()
    };
    return op;
};

helper.calculate_contract_hash = function(codeBytes) {
    var codeBuffer = ops.rawTypes.bytes().fromObject(codeBytes);
    var hashBuffer = hash.sha1(codeBuffer);
    return hashBuffer.toString("hex");
};

helper.new_contract_register_operation_from_info = function(
    callerAddr,
    callerPubKey,
    gasLimit,
    gasPrice,
    bytecodeHex,
    apis,
    offlineApis,
    events,
    storageProperties
) {
    var codeBytes = helper.hex_to_bytes(bytecodeHex);
    var contractCodeHash = helper.calculate_contract_hash(codeBytes);
    var gpcObject = {
        abi: apis,
        offline_abi: offlineApis,
        events: events,
        storage_properties: storageProperties,
        code: codeBytes,
        code_hash: contractCodeHash
    };
    return helper.new_contract_register_operation_from_gpc_object(
        callerAddr,
        callerPubKey,
        gasLimit,
        gasPrice,
        gpcObject
    );
};

// 合约调用
helper.new_contract_invoke_operation = function(
    callerAddr,
    callerPubKey,
    gasLimit,
    gasPrice,
    contractAddress,
    api,
    apiArg
) {
    var op = {
        fee: {
            amount: 0,
            asset_id: "1.3.0"
        },
        invoke_cost: gasLimit,
        gas_price: gasPrice,
        caller_addr: callerAddr,
        caller_pubkey: callerPubKey,
        contract_id: contractAddress,
        contract_api: api,
        contract_arg: apiArg
    };
    return op;
};

// 转账
helper.new_transfer_operation = function(
    fromAddress,
    toAddress,
    amount,
    assetId,
    memo
) {
    var memoObject = undefined;
    if (memo) {
        if (typeof memo === "string") {
            memo = helper.hex_to_bytes(helper.unicodeToHex(memo));
        }
        memoObject = {
            from: "HX1111111111111111111111111111111114T1Anm",
            to: "HX1111111111111111111111111111111114T1Anm",
            nonce: 0,
            message: memo
        };
    }
    var op = {
        fee: {
            amount: 0,
            asset_id: "1.3.0"
        },
        from: "1.2.0",
        to: "1.2.0",
        from_addr: fromAddress,
        to_addr: toAddress,
        amount: {amount: amount, asset_id: assetId},
        memo: memoObject
    };
    return op;
};

// 注册账户
helper.new_register_account_operation = function(address, pubkey, accountName) {
    var op = {
        fee: {
            amount: 0,
            asset_id: "1.3.0"
        },
        registrar: "1.2.0",
        referrer: "1.2.0",
        referrer_percent: 0,
        name: accountName,
        owner: {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [[pubkey, 1]],
            address_auths: []
        },
        active: {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [[pubkey, 1]],
            address_auths: []
        },
        payer: address,
        options: {
            memo_key: pubkey,
            voting_account: "1.2.5",
            num_witness: 0,
            num_committee: 0,
            votes: [],
            miner_pledge_pay_back: 10,
            extensions: []
        },
        extensions: []
    };
    return op;
};

// 质押
helper.new_lockbalance_to_citizen_operation = function(
    address,
    ownerAccountId,
    lockToCitizenId,
    lockAssetId,
    lockAssetAmount
) {
    var op = {
        lock_asset_id: lockAssetId,
        lock_asset_amount: lockAssetAmount,
        contract_addr: helper.getEmptyAddress(),
        lock_balance_account: ownerAccountId,
        lockto_miner_account: lockToCitizenId,
        lock_balance_addr: address,
        fee: {
            amount: 0,
            asset_id: "1.3.0"
        }
    };
    return op;
};

// 取消质押
helper.new_forclose_balance_from_citizen_operation = function(
    address,
    ownerAccountId,
    fromCitizenId,
    lockAssetId,
    lockAssetAmount
) {
    var op = {
        fee: {
            amount: 0,
            asset_id: "1.3.0"
        },
        foreclose_asset_id: lockAssetId,
        foreclose_asset_amount: lockAssetAmount,
        foreclose_contract_addr: helper.getEmptyAddress(),
        foreclose_account: ownerAccountId,
        foreclose_miner_account: fromCitizenId,
        foreclose_addr: address
    };
    return op;
};

// 领取分红
// @param payBackBalances: format is: [ [citizenName,{"amount":xxxx,"asset_id":xxxx}], ... ]
helper.new_take_payback_from_citizen_operation = function(
    address,
    payBackBalances
) {
    var op = {
        pay_back_owner: address,
        fee: {
            amount: 0,
            asset_id: "1.3.0"
        },
        pay_back_balance: payBackBalances
    };
    return op;
};

helper.new_transfer_to_contract_operation = function(
    address,
    pubkey,
    contractId,
    gasLimit,
    gasPrice,
    assetId,
    assetAmount,
    memo
) {
    var op = {
        fee: {
            amount: 0,
            asset_id: "1.3.0"
        },
        invoke_cost: gasLimit,
        gas_price: gasPrice,
        caller_addr: address,
        caller_pubkey: pubkey,
        contract_id: contractId,
        amount: {
            amount: assetAmount,
            asset_id: assetId
        },
        param: memo || ""
    };
    return op;
};

helper.execDbApi = function(apiInstance) {
    let args = Array.from(arguments);
    var method = args[1];
    var params = args.slice(2);
    return apiInstance.db_api().exec(method, params);
};

// 查询资产列表
helper.listAssets = function(apiInstance, lower_bound_symbol, limit) {
    return apiInstance
        .db_api()
        .exec("list_assets", [lower_bound_symbol, limit]);
};

// 查询地址的资产余额
helper.getAddrBalances = function(apiInstance, address) {
    return apiInstance.db_api().exec("get_addr_balances", [address]);
};

// 查询合约的资产余额
helper.getContractBalances = function(apiInstance, address) {
    return apiInstance.db_api().exec("get_contract_balance", [address]);
};

// 查询质押收益
helper.getAddressPayBackBalance = function(apiInstance, address) {
    return apiInstance
        .db_api()
        .exec("get_address_pay_back_balance", [address, "HX"]);
};

// 查询citizen列表
helper.listCitizens = function(apiInstance, offset, limit) {
    return apiInstance.db_api().exec("list_citizens", [offset, limit]);
};

// 查询citizen信息
helper.getCitizen = function(apiInstance, citizenIdOrAccountName) {
    return apiInstance.db_api().exec("get_citizen", [citizenIdOrAccountName]);
};

// 查询account信息
helper.getAccount = function(apiInstance, accountId) {
    return apiInstance.db_api().exec("get_account", [accountId]);
};

// 根据账户查询地址信息
helper.getAccountByAddresss = function(apiInstance, address) {
    return apiInstance
        .db_api()
        .exec("get_accounts_addr", [[address]])
        .then(accounts => {
            return accounts[0];
        });
};

// 获取合约信息
helper.getContractInfo = function(apiInstance, contractAddr) {
    return apiInstance.db_api().exec("get_contract_info", [contractAddr]);
};

// 获取合约除字节码外的信息
helper.getSimpleContractInfo = function(apiInstance, contractAddr) {
    return apiInstance
        .db_api()
        .exec("get_simple_contract_info", [contractAddr]);
};

// 获取合约交易的receipt
helper.getContractTxReceipt = function(apiInstance, txid) {
    return apiInstance.db_api().exec("get_contract_invoke_object", [txid]);
};

// 根据交易id查找交易
(helper.getTransactionById = function(apiInstance, txid) {
    return apiInstance.db_api().exec("get_transaction_by_id", [txid]);
}),
    // 查询账户的质押信息
    (helper.getAccountLockBalances = function(apiInstance, accountName) {
        return apiInstance
            .db_api()
            .exec("get_account_lock_balance", [accountName]);
    });

helper.invokeContractOffline = function(
    apiInstance,
    callerPubKey,
    contractId,
    contractApi,
    apiArg
) {
    return apiInstance
        .db_api()
        .exec("invoke_contract_offline", [
            callerPubKey.toString(),
            contractId,
            contractApi,
            apiArg
        ]);
};

helper.invokeContractTesting = function(
    apiInstance,
    callerPubKey,
    contractId,
    contractApi,
    apiArg
) {
    return apiInstance
        .db_api()
        .exec("invoke_contract_testing", [
            callerPubKey.toString(),
            contractId,
            contractApi,
            apiArg
        ]);
};

// @return [{amount: ..., asset_id: "..."}, gas_count]
helper.transferToContractTesting = function(
    apiInstance,
    callerPubKey,
    contractId,
    assetAmount,
    assetIdOrSymbol,
    transferMemo
) {
    return apiInstance
        .db_api()
        .exec("transfer_to_contract_testing", [
            callerPubKey.toString(),
            contractId,
            assetAmount,
            assetIdOrSymbol,
            transferMemo
        ]);
};

helper.registerContractTesting = function(
    apiInstance,
    callerPubKey,
    contracgGpcHex
) {
    return apiInstance
        .db_api()
        .exec("register_contract_testing", [
            callerPubKey.toString(),
            contracgGpcHex
        ]);
};

export default helper;
