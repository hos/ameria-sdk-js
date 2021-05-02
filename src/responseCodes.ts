export default {
  "0-1": {
    description: "Processing center response timeout",
    message: "sv_unavailable",
  },
  "0-100": {
    description: "No payment attempts",
    message: "no_payments_yet",
  },
  "0-2000": {
    description: "Transaction declined since the card is in the blacklist",
    message: "Decline. PAN blacklisted",
  },
  "0-2001": {
    description:
      "Transaction declined since Client’s IP address is in the blacklist",
    message: "Decline. IP blacklisted",
  },
  "0-20010": {
    description:
      "Transaction declined since payment amount exceeded the limits set by the issuer bank",
    message: "BLOCKED_BY_LIMIT",
  },
  "0-2002": {
    description:
      "Transaction declined since payment amount exceeded the limits (daily turnover limits of the merchant set by the acquiring bank or one card turnover limit of the merchant or one transaction limit of the merchant)",
    message: "Decline. Payment over limit",
  },
  "0-2004": {
    description: "Payment through SSL without entering SVС data is forbidden",
    message: "SSL without CVC forbidden",
  },
  "0-2005": {
    description:
      "We failed to check the issuer’s signature, i.e. PARes was readable but was not signed correctly",
    message: "Decline. 3DSec sign error",
  },
  "0-2006": {
    description: "Issuer declined authentication",
    message: "Decline. 3DSec decline",
  },
  "0-2007": {
    description:
      "Card data registration timeout starting from the moment of payment registration (timeout will be in 20 minutes)",
    message: "Decline. Payment time limit",
  },
  "0-2011": {
    description:
      "Card is included in 3d secure but the issuer bank is not ready (at that moment) to execute 3ds of transaction",
    message: "Declined. PaRes status is unknown",
  },
  "0-2012": {
    description: "This operation is not supported",
    message: "Operation not supported",
  },
  "0-2013": {
    description: "Payment attempts expired",
    message: "Исчерпаны попытки оплаты",
  },
  "0-2015": {
    description: "VERes of DS contain iReq, due to which payment was declined",
    message: "Decline by iReq in VERes",
  },
  "0-2016": {
    description:
      "Issuer bank is not ready (at that moment) to execute 3ds of transaction (for instance, the bank’s ACS does not function). We cannot define whether the card is included in 3d secure or not.",
    message: "Declined. VeRes status is unknown",
  },
  "0-2018": {
    description:
      "Directory server Visa or MasterCard cannot be reached or “connection failed” error is received in response to request VeReq. This error is the result interaction of payment gateway and MPS servers due to their technical failures.",
    message: "Declined. DS connection timeout",
  },
  "0-2019": {
    description:
      "Issuer’s PARes contains iReq, due to which payment was declined.",
    message: "Decline by iReq in PARes",
  },
  "0-9000": {
    description: "Transactions start",
    message: "Started",
  },
  "00": {
    description: "Payment successfully completed",
    message: "Approved.",
  },
  "01": {
    description:
      "Order with the given number is already registered in the system",
    message: "Order already exists",
  },
  "0100": {
    description: "Issuer bank has forbidden online card transactions",
    message: "Decline. Card declined",
  },
  "01001": {
    description:
      "At the moment of registering the transaction, i.e. when the card details are not entered yet",
    message: "Decline. Data input timeout",
  },
  "0101": {
    description: "Card’s validity period has expired",
    message: "Decline. Expired card",
  },
  "0103": {
    description:
      "No connection with the issuer bank, the merchant must call the issuer bank",
    message: "Decline. Call issuer",
  },
  "0104": {
    description: "Attempt to make a transaction via blocked account",
    message: "Decline. Card declined",
  },
  "0107": {
    description: "It is necessary to call the issuer bank",
    message: "Decline. Call issuer",
  },
  "0109": {
    description:
      "Merchant’s/*terminal ID is invalid (for completion and preauthorization with different IDs)",
    message: "Decline. Invalid merchant",
  },
  "0110": {
    description: "Transaction amount is invalid",
    message: "Decline. Invalid amount",
  },
  "0111": {
    description: "Card number is invalid",
    message: "Decline. No card record on Decline. Wrong PAN",
  },
  "0116": {
    description: "Transaction amount exceeds the available account balance",
    message: "Decline. Decline. Not enough money",
  },
  "0120": {
    description:
      "Transaction declined since it is not allowed by the issuer\nPayment network code: 57\nReason for declining the transaction should be clarified from the issuer.",
    message: "Decline. Not allowed",
  },
  "0121": {
    description:
      "Attempt to make a transaction exceeding the daily limit set by the issuer bank",
    message: "Decline. Excds wdrwl limt",
  },
  "0123": {
    description:
      "Limit on the number of transactions is exceeded. Client has made maximum number of transactions within the limit and attempts to make one more transaction",
    message: "Decline. Excds wdrwl ltmt",
  },
  "0125": {
    description:
      "Invalid Card number\nAttempt to refund an amount exceeding the hold, attempt to refund zero amount",
    message: "Decline. Card declined",
  },
  "0151017": {
    description: "3-D Secure connection error",
    message: "Decline. 3DSec comm error",
  },
  "0151018": {
    description: "Processing timeout, failed to send",
    message: "Decline. Processing timeout",
  },
  "0151019": {
    description:
      "Processing timeout, sent but no response received from the bank",
    message: "Decline. Processing timeout",
  },
  "02001": {
    description:
      "Fraudulent transaction ( according to processing or payment network)",
    message: "Decline. Fraud",
  },
  "02003": {
    description:
      "Merchant is not allowed to perform SSL (Not 3d-Secure/SecureCode) transactions",
    message: "Decline. SSL restricted",
  },
  "02005": {
    description: "Payment does not comply with the  3ds verification terms",
    message: "3DS rule failed",
  },
  "0208": {
    description: "Card is lost",
    message: "Decline. Card is lost",
  },
  "0209": {
    description: "Card limitations are exceeded",
    message: "Decline. Card limitations exceeded",
  },
  "0341014": {
    description: "RBS decline error",
    message: "Decline. General Error",
  },
  "0341041": {
    description: "Refund error",
    message: "Decline. Refund failed",
  },
  "05": {
    description: "Error in request parameters",
    message: "Incorrect Parameters",
  },
  "071015": {
    description: "Incorrect card parameters input",
    message: "Decline. Input error",
  },
  "08204": {
    description:
      "Such order has already been registered (check by order number)",
    message: "Decline. Duplicate order",
  },
  "09001": {
    description: "Internal code of RBS rejection",
    message: "RBS internal error",
  },
  "0902": {
    description: "Cardholder attempts to make a forbidden transaction",
    message: "Decline. Invalid trans",
  },
  "0903": {
    description:
      "Attempt to make a transaction in the amount exceeding the limit set by the issuer bank",
    message: "Decline. Re-enter trans.",
  },
  "0904": {
    description: "Error message format according to issuer bank",
    message: "Decline. Format error",
  },
  "0907": {
    description:
      "No connection with the issuer bank. Stand-in authorization is not allowed for the given card number (this mode means that the issuer cannot connect to the payment network, so the transaction is either in offline mode and is then going to be sent to the back office or will be declined)",
    message: "Decline. Host not avail.",
  },
  "0909": {
    description:
      "General system failure fixed by the payment network or the issuer bank",
    message: "Decline. Call issuer",
  },
  "0910": {
    description: "Issuer bank is not available",
    message: "Decline. Host not avail.",
  },
  "0913": {
    description: "Invalid transaction format according to the network",
    message: "Decline. Invalid trans",
  },
  "0914": {
    description:
      "Transaction is not found (while sending completion, reversal or refund request)",
    message: "Decline. Orig trans not found",
  },
  "0999": {
    description:
      "Transaction authorization did not start. Declined due to fraud or 3dsec error.",
    message: "Declined by fraud",
  },
  "02": {
    description: "Order declined due to errors in payment details ",
    message: "Missing message",
  },
  "03": {
    description: "Unknown (forbidden) currency",
    message: "Incorrect Currency",
  },
  "04": {
    description: "Required parameter of the request is missing",
    message: "Required parameter missed",
  },
  "06": {
    description: "Unregistered OrderId",
    message: "Unregistered OrderId",
  },
  "07": {
    description: "System error",
    message: "System Error",
  },
  "20": {
    description: "Incorrect Username and Password",
    message: "Incorrect Username and Password",
  },
  "30": {
    description: "Incorrect Value of Opaque field of the initial request",
    message: "Incorrect Value of Opaque field of the initial request",
  },
  "550": {
    description: "System Error",
    message: "System Error",
  },
  "514": {
    description: "",
    message: "Do not have Reverse operation permission",
  },
  "513": {
    description: "",
    message: "Do not have Refund operation permission",
  },
  "560": {
    description: "",
    message: "Operation failed",
  },
  "520": {
    description: "",
    message: "Overtime error",
  },
  "50": {
    description: "",
    message: "Payment sum error",
  },
  "510": {
    description: "",
    message: "Incorrect parameters",
  },
  "500": {
    description: "",
    message: "Unknown error",
  },
};
