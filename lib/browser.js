const bitshares_ws = require("bitsharesjs-ws");

const {Apis, ChainConfig} = bitshares_ws;

module.exports = {
    PrivateKey: require("./ecc/src/PrivateKey"),
    Address: require("./ecc/src/address"),
    PublicKey: require("./ecc/src/PublicKey"),
    Signature: require("./ecc/src/signature"),
    key: require("./ecc/src/KeyUtils"),
    TransactionBuilder: require("./chain/src/TransactionBuilder"),
    TransactionHelper: require("./chain/src/TransactionHelper"),
    Login: require("./chain/src/AccountLogin"),
    bitshares_ws: bitshares_ws,
    Apis: Apis,
    ChainConfig: ChainConfig
    // axios: require("axios")
};
