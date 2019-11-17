const zendesk = require('node-zendesk');

let client = zendesk.createClient({
  username:  'shaun.t.vanweelden@gmail.com',
  token:     process.env.ZENDESK_TOKEN,
  remoteUri: 'https://shaundev.zendesk.com/api/v2'
});

// Design Decisions:
// Should we email the customer of their Zendesk Request?
// If we do, if customer replies, do we add that to the Slack thread?

exports.findCustomerByEmail = function(email) {
  return new Promise(function(resolve, reject) {
    client.users.search({query: `email:${email}`}, function (err, req, result) {
      if (err) {
        reject(err);
      }
      if (result.length > 0) {
        // User Exists
        resolve(result[0]);
      } else {
        // No user
        resolve(null);
      }
    });
  });
}

exports.createCustomerByNameEmail = function(name, email) {
  return new Promise(function(resolve, reject) {
    // Create a User object
    let user = {
      "user": {
        "name": name, 
        "email": email,
        "verified": true
      }
    }
    client.users.create(user, function (err, req, result) {
      if (err) {
        reject(err);
      } else {
        console.log("User Created with Id: " + result.id);
        resolve(result);
      }
    });
  });
}

exports.createTicketFromCustomerId = function(userId, subject, message) {
  return new Promise(function(resolve, reject) {
    // Create a new Ticket
    let newTicket = {
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
    
    client.tickets.create(newTicket, function (err, req, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}