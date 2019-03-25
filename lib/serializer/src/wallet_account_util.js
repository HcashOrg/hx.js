import types from "./types";
import SerializerImpl from "./serializer";
import {Aes, hash, PrivateKey} from "../../ecc";
const Buffer = require("safe-buffer").Buffer;

const {
    //id_type,
    varint32,
    uint8,
    uint16,
    uint32,
    int64,
    uint64,
    string,
    bytes,
    bool,
    tuple,
    codeBytes,
    array,
    protocol_id_type,
    object_id_type,
    vote_id,
    future_extensions,
    static_variant,
    map,
    set,
    public_key,
    public_key_bytes,
    address,
    time_point_sec,
    time_point,
    optional
} = types;

const Serializer = function(operation_name, serilization_types_object) {
    return new SerializerImpl(operation_name, serilization_types_object);
};

const crosschain_prkeys = new Serializer("crosschain_prkeys", {
    addr: string,
    pubkey: string,
    wif_key: string
});

const plain_keys = new Serializer("plain_keys", {
    keys: map(address, string),
    crosschain_keys: map(string, crosschain_prkeys),
    checksum: bytes(64)
});

class HxWalletAccount {
    constructor() {
        this.id = ""; // account id
        this.name = ""; // account name
        this.addr = ""; // account address
        this.privateKeyStr = "";
    }
}

class HxAccountsWalletInfo {
    constructor(json) {
        this.chain_id = json.json;
        this.my_accounts = json.my_accounts || [];
        this.cipher_keys = json.cipher_keys || ""; // aes encrypted private keys
        this.cipher_keys_extend = json.cipher_keys_extend || ""; // not supported yet
        this.plainKeys = null;
    }
    valid() {
        if (!this.cipher_keys) {
            return false;
        }
        return true;
    }
    decodeCipherKeys(password) {
        if (!this.valid()) {
            throw new Error("invalid wallet json");
        }
        const passwordBuf = Buffer.from(password);
        const pw = hash.sha512(passwordBuf);
        const aes = Aes.fromBuffer(pw);
        const decryptedBuf = aes.decryptHexToBuffer(this.cipher_keys);
        const pk = plain_keys.fromHex(decryptedBuf.toString("hex"));
        if (!pk) {
            throw new Error("invalid password");
        }
        if (
            !pk.checksum ||
            pk.checksum.toString("hex") !== pw.toString("hex")
        ) {
            throw new Error("invalid wallet checksum");
        }
        for (const key of pk.keys) {
            const addr = key[0].toString("HX");
            for (const account of this.my_accounts) {
                if (account.addr === addr) {
                    account.privateKeyWif = key[1].toString(); // WIF format
                    account.privateKey = PrivateKey.fromWif(
                        account.privateKeyWif
                    );
                }
            }
        }
        return this;
    }
}

export default {
    // decode from hx pc wallet wallet.json
    decodeWalletJson(walletJson, password) {
        const walletInfo = new HxAccountsWalletInfo(walletJson);
        walletInfo.decodeCipherKeys(password);
        return walletInfo;
    }
};
