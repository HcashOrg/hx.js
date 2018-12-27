import assert from "assert";
import {ChainConfig} from "bitsharesjs-ws";
import {sha256, sha512, ripemd160} from "./hash";
import {encode, decode} from "bs58";
import deepEqual from "deep-equal";
const Buffer = require("safe-buffer").Buffer;

class AddressVersion {
    static NORMAL = 0x35;
    static MULTISIG = 0x32;
    static CONTRACT = 0x1c;
}

/** Addresses are shortened non-reversable hashes of a public key.  The full PublicKey is preferred.
 */
class Address {
    constructor(addy, version = AddressVersion.NORMAL) {
        this.addy = addy;
        this.version = version;
    }

    static fromBuffer(buffer) {
        var _hash = sha512(buffer);
        var addy = ripemd160(_hash);
        return new Address(addy);
    }

    static fromString(string, address_prefix = ChainConfig.address_prefix) {
        var prefix = string.slice(0, address_prefix.length);
        assert.equal(
            address_prefix,
            prefix,
            `Expecting key to begin with ${address_prefix}, instead got ${prefix}`
        );
        var addy = string.slice(address_prefix.length);
        addy = new Buffer(decode(addy), "binary");
        var checksum = addy.slice(-4);
        addy = addy.slice(0, -4);
        var new_checksum = ripemd160(addy);
        new_checksum = new_checksum.slice(0, 4);
        var isEqual = deepEqual(checksum, new_checksum); //, 'Invalid checksum'
        if (!isEqual) {
            throw new Error("Checksum did not match");
        }
        return new Address(addy.slice(1), addy[0]);
    }

    /** @return Address*/
    static fromPublic(public_key, compressed = true, version = 56) {
        var sha2 = sha256(public_key.toBuffer(compressed));
        var rep = ripemd160(sha2);
        var versionBuffer = Buffer.alloc(1);
        versionBuffer.writeUInt8(0xff & version, 0);
        var addr = Buffer.concat([versionBuffer, rep]);
        var check = sha256(addr);
        check = sha256(check);
        var buffer = Buffer.concat([addr, check.slice(0, 4)]);
        return new Address(ripemd160(buffer));
    }

    static sha512(buf, encoding) {
        return sha512(buf, encoding);
    }
    static ripemd160(buf, encoding) {
        return ripemd160(buf, encoding);
    }

    static bufferFrom(data) {
        return Buffer.from(data);
    }

    toBuffer() {
        var binAddr = Buffer.concat([Buffer.from([this.version]), this.addy]);
        return binAddr;
    }

    getBufferWithoutVersion() {
        return this.addy;
    }

    toString(address_prefix = ChainConfig.address_prefix) {
        var addyBuf = this.toBuffer();
        var checksum = ripemd160(addyBuf);
        var addy = Buffer.concat([addyBuf, checksum.slice(0, 4)]);
        return address_prefix + encode(addy);
    }
}

Address.AddressVersion = AddressVersion;

export default Address;
