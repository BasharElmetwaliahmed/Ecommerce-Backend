const { createHmac } = require("crypto");

const webhookProcessed = (req, res) => {
  console.log("webhookProcessed")
  try {
    const payload = req.body.obj;
    const {
      amount_cents,
      created_at,
      currency,
      error_occured,
      has_parent_transaction,
      id,
      integration_id,
      is_3d_secure,
      is_auth,
      is_capture,
      is_refunded,
      is_standalone_payment,
      is_voided,
      order: { id: order_id },
      owner,
      pending,
      source_data: {
        pan: source_data_pan,
        sub_type: source_data_sub_type,
        type: source_data_type,
      },
      success,
    } = req.body.obj;
    let lexogragical =
      amount_cents +
      created_at +
      currency +
      error_occured +
      has_parent_transaction +
      id +
      integration_id +
      is_3d_secure +
      is_auth +
      is_capture +
      is_refunded +
      is_standalone_payment +
      is_voided +
      order_id +
      owner +
      pending +
      source_data_pan +
      source_data_sub_type +
      source_data_type +
      success;
    let hash = createHmac("sha512", "61B8A5EEAAEAFED869BBBD4BE2EB6E3E")
      .update(lexogragical)
      .digest("hex");
    console.log(success);
    if (hash === req.query.hmac) {
      console.log("hash accept",payload);
      return;
    }
    res.json({
      message: "Transaction processed webhook received successfully",
    });
  } catch (error) {
    res.status(400).json({ msg: error });
  }
};
const webhookResponse = (req, res) => {
  console.log(webhookProcessed);
  let success = req.query.success;
  if (success === "true") {
    return res
      .status(200)
      .json({ message: "Transaction response webhook received successfully" });
  } else {
    return res
      .status(400)
      .json({ message: "Transaction response webhook declined" });
  }
};
module.exports = { webhookProcessed, webhookResponse };
