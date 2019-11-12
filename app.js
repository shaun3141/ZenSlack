const express = require('express');
const zendesk = require('node-zendesk');
 
let client = zendesk.createClient({
  username:  'shaun.t.vanweelden@gmail.com',
  token:     process.env.ZENDESK_TOKEN,
  remoteUri: 'https://shaundev.zendesk.com/api/v2'
});

console.log(process.env.ZENDESK_TOKEN)

const app = express()
const port = 3000;

let requesterEmail = "customer4@example.com";
let requesterName = "Test Van Weelden"

// See if user exists in Zendesk
client.users.search({query: `email:${requesterEmail}`}, function (err, req, result) {
  if (err) {
    console.log(err);
    return;
  }
  if (result.length > 0) {
    // User Exists, create Ticket
    const submitterId = result[0].id;
    console.log("User exists with Id: " + submitterId);
    createTicket(submitterId, "Whoa", "It Works!");
  } else {
    // Create User
    let user = {
      "user": {
        "name": requesterName, 
        "email": requesterEmail,
        "verified": true
      }
    }
    client.users.create(user, function (err, req, result) {
      if (err) {
        console.log(err);
        return;
      }
      const submitterId = result.id;
      console.log("User Created with Id: " + submitterId);
    });
    createTicket(submitterId, "Whoa", "It Works!");
  }
});

const createTicket = function(userId, subject, message) {
  
  let newRequest = {
    "ticket": {
      "subject": subject,
      "comment": {
        "body": message
      },
      'priority': "High",
      'requester_id': userId,
      'type': "Problem"
    }
  };
  
  client.tickets.create(newRequest, function (err, req, result) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(JSON.stringify(result, null, 2, true));
  });
}

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))