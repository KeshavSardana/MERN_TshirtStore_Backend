const braintree = require("braintree");

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "f9hwrvmsc5xqpfd8",
  publicKey: "xmfrqjtyjzwqrpnm",
  privateKey: "9e7d79dffe9e680718bf2151f7f95093",
});

exports.getToken = (req, res) => {
  gateway.clientToken
    .generate({})
    .then((response) => {
      // pass clientToken to your front-end
      const clientToken = response.clientToken;
      return res.send(response);
    })
    .catch((err) => {
      return res.status(5000).send(err);
    });
};

exports.processPayment = (req, res) => {
  let nonceFromTheClient = req.body.paymentMethodNonce;
  let amount = req.body.amount;
  gateway.transaction
    .sale({
      amount: amount,
      paymentMethodNonce: nonceFromTheClient,
      options: {
        submitForSettlement: true,
      },
    })
    .then((result) => {
      return res.send(result);
    })
    .catch((err) => {
      return res.status(500).send(err);
    });
};
