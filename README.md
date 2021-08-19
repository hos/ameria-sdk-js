# ameria-sdk-js
The non official VPOS SDK for Ameria Bank

<br/>
<br/>
<br/>

### 2 Step Payments
This feature will allow you to first approve payment and then deposit it. To use this in test environment, you need
to contact technical support team in Ameria Bank and request to change API client settings. To use this in production
you need to send application to Ameria Bank using mobile/internet banking. You will send application to change you API client,
to **always** use 2 step payments. So after bank will approve you application, you can't use one step payment anymore.
Instead you will have to request another client and use 2 clients if you want to use both options simultaneously.
As soon as Ameria Bank changes you API `initPayment` will approve payment but will not deposit it. You will have to use
`confirmPayment` to deposit or `cancelPayment` to cancel it.


<br/>
<br/>
<br/>

### Binding Transactions
is a way to withdraw money from credit card without user interaction. This can be
used for recurring payments, subscriptions or just to save user's payment method instead of requiring it
every time user willing to make a payment.

To start using binding transactions, first, authorized person, (usually the director of the company) must
send an application using mobile/internet banking and wait until the Bank will approve it.
