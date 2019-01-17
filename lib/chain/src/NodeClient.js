import secureRandom from "secure-random";

import {Long} from "bytebuffer";

import {Signature, PublicKey, hash, Address} from "../../ecc";
import {ops} from "../../serializer";
import {Apis} from "bitsharesjs-ws";
// TODO: import axios
const Buffer = require("safe-buffer").Buffer;

class NodeClient {
    constructor(apiInstance) {
        this.apiInstance = apiInstance;
    }

    afterInited() {
        return this.apiInstance.init_promise;
    }

    execDbApi() {
        let args = Array.from(arguments);
        var method = args[0];
        var params = args.slice(1);
        return this.apiInstance.db_api().exec(method, params);
    }

    // 查询资产列表
    listAssets(lower_bound_symbol, limit) {
        return this.apiInstance
            .db_api()
            .exec("list_assets", [lower_bound_symbol, limit]);
    }

    // 查询地址的资产余额
    getAddrBalances(address) {
        return this.apiInstance.db_api().exec("get_addr_balances", [address]);
    }

    // 查询合约的资产余额
    getContractBalances = function(address) {
        return this.apiInstance
            .db_api()
            .exec("get_contract_balance", [address]);
    };

    // 查询质押收益
    getAddressPayBackBalance(address) {
        return this.apiInstance
            .db_api()
            .exec("get_address_pay_back_balance", [address, "HX"]);
    }

    // 查询citizen列表
    listCitizens(prefix, limit) {
        return this.apiInstance
            .db_api()
            .exec("lookup_miner_accounts", [prefix, limit]);
    }

    // 查询citizens数量
    getCitizensCount = function() {
        return this.apiInstance.db_api().exec("get_miner_count", []);
    };

    // 查询citizen信息
    getCitizen = function(citizenIdOrAccountName) {
        return this.apiInstance
            .db_api()
            .exec("get_miner", [citizenIdOrAccountName]);
    };

    // 查询account信息
    getAccount = function(accountId) {
        return this.apiInstance.db_api().exec("get_account", [accountId]);
    };

    // 根据账户名查询账户信息
    getAccountByName = function(accountName) {
        return this.apiInstance
            .db_api()
            .exec("get_account_by_name", [accountName]);
    };

    // 根据账户查询地址信息
    getAccountByAddresss = function(address) {
        return apiInstance
            .db_api()
            .exec("get_accounts_addr", [[address]])
            .then(accounts => {
                return accounts[0];
            });
    };

    // 获取合约信息
    getContractInfo = function(contractAddr) {
        return this.apiInstance
            .db_api()
            .exec("get_contract_info", [contractAddr]);
    };

    // 获取合约除字节码外的信息
    getSimpleContractInfo = function(contractAddr) {
        return apiInstance
            .db_api()
            .exec("get_simple_contract_info", [contractAddr]);
    };

    // 获取合约交易的receipt
    getContractTxReceipt = function(txid) {
        return this.apiInstance
            .db_api()
            .exec("get_contract_invoke_object", [txid]);
    };

    // 根据交易id查找交易
    getTransactionById = function(txid) {
        return this.apiInstance.db_api().exec("get_transaction_by_id", [txid]);
    };

    // 查询账户的质押信息
    getAccountLockBalances = function(accountName) {
        return this.apiInstance
            .db_api()
            .exec("get_account_lock_balance", [accountName]);
    };

    invokeContractOffline = function(
        callerPubKey,
        contractId,
        contractApi,
        apiArg
    ) {
        return this.apiInstance
            .db_api()
            .exec("invoke_contract_offline", [
                callerPubKey.toString(),
                contractId,
                contractApi,
                apiArg
            ]);
    };

    invokeContractTesting = function(
        callerPubKey,
        contractId,
        contractApi,
        apiArg
    ) {
        return this.apiInstance
            .db_api()
            .exec("invoke_contract_testing", [
                callerPubKey.toString(),
                contractId,
                contractApi,
                apiArg
            ]);
    };

    registerContractTesting(callerPubKey, contractGpcHex) {
        return this.apiInstance
            .db_api()
            .exec("register_contract_testing", [
                callerPubKey.toString(),
                contractGpcHex
            ]);
    }
    // @return [{amount: ..., asset_id: "..."}, gas_count]
    transferToContractTesting(
        callerPubKey,
        contractId,
        assetAmount,
        assetIdOrSymbol,
        transferMemo
    ) {
        return this.apiInstance
            .db_api()
            .exec("transfer_to_contract_testing", [
                callerPubKey.toString(),
                contractId,
                assetAmount,
                assetIdOrSymbol,
                transferMemo
            ]);
    }
}

export default NodeClient;
