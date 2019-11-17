const express = require('express');
const zendeskSdk = require('node-zendesk');

const Zendesk = require('./models/zendesk.js');


let client = zendeskSdk.createClient({
  username:  'shaun.t.vanweelden@gmail.com',
  token:     process.env.ZENDESK_TOKEN,
  remoteUri: 'https://shaundev.zendesk.com/api/v2'
});

const app = express()
const port = 3000;

let requesterEmail = "customer6@example.com";
let requesterName = "Test6";

let subject = "Hey now, it's working"; // TODO: Try with ' in the subject
let body = "Care to celebrate?";

// Good helper function :) 
// console.log(JSON.stringify(result, null, 2, true));

(async () => {
  try {
    let user = await Zendesk.findCustomerByEmail(requesterEmail);
    if (!user) {
      user = await Zendesk.createCustomerByNameEmail(requesterName, requesterEmail);
    }
    // console.log("User:\n" + JSON.stringify(user, null, 2, true));

    ticket = await Zendesk.createTicketFromCustomerId(user.id, subject, body);
    // console.log("Ticket:\n" + JSON.stringify(ticket, null, 2, true));

  } catch (e) {
    console.log(e);
  }
})();

// // See if user exists in Zendesk
// client.users.search({query: `email:${requesterEmail}`}, function (err, req, result) {
//   if (err) {
//     console.log(err);
//     return;
//   }
//   if (result.length > 0) {
//     // User Exists, create Ticket
//     const submitterId = result[0].id;
//     console.log("User exists with Id: " + submitterId);
//     createTicket(submitterId, "Whoa", "It Works!");
//   } else {
    // // Create User
    // let user = {
    //   "user": {
    //     "name": requesterName, 
    //     "email": requesterEmail,
    //     "verified": true
    //   }
    // }
    // client.users.create(user, function (err, req, result) {
    //   if (err) {
    //     console.log(err);
    //     return;
    //   }
    //   const submitterId = result.id;
    //   console.log("User Created with Id: " + submitterId);
    // });
//     createTicket(submitterId, "Whoa", "It Works!");
//   }
// });

// const createTicket = function(userId, subject, message) {
  
  // let newRequest = {
  //   "ticket": {
  //     "subject": subject,
  //     "comment": {
  //       "body": message
  //     },
  //     'priority': "High",
  //     'requester_id': userId,
  //     'type': "Problem"
  //   }
  // };
  
  // client.tickets.create(newRequest, function (err, req, result) {
  //   if (err) {
  //     console.log(err);
  //     return;
  //   }
  //   console.log(JSON.stringify(result, null, 2, true));
  // });
// }

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))