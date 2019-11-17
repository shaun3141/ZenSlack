const express = require('express');
const zendeskSdk = require('node-zendesk');
const bodyParser = require('body-parser');

const Zendesk = require('./models/zendesk.js');

const app = express()
app.set('port', process.env.PORT || 5000);
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

let zClient = zendeskSdk.createClient({
  username:  'shaun.t.vanweelden@gmail.com',
  token:     process.env.ZENDESK_TOKEN,
  remoteUri: 'https://shaundev.zendesk.com/api/v2'
});


let requesterEmail = "customer6@example.com";
let requesterName = "Test6";
let requesterUserId = '397057006634'

let subject = "Hey now, it's working"; // TODO: Try with ' in the subject
let body = "Care to celebrate?";
let comment = "Commenting is fun";

let ticketId = 14;

// Good helper function :) 
// console.log(JSON.stringify(result, null, 2, true));

(async () => {
  try {
    let user = await Zendesk.findCustomerByEmail(requesterEmail);
    if (!user) {
      user = await Zendesk.createCustomerByNameEmail(requesterName, requesterEmail);
    }
    // console.log("User:\n" + JSON.stringify(user, null, 2, true));

    // ticket = await Zendesk.createTicketByCustomerId(user.id, subject, body);
    // console.log("Ticket:\n" + JSON.stringify(ticket, null, 2, true));

    // let comments = await Zendesk.getPublicCommentsByTicketId(ticketId);
    // console.log("Comments:\n" + JSON.stringify(comments, null, 2, true));

    let result = await Zendesk.addCommentByTicketId(requesterUserId, 14, comment);
    console.log("Result:\n" + JSON.stringify(result, null, 2, true));

  } catch (e) {
    console.log(e);
  }
})();

app.get('/', (req, res) => res.send('Hello, World!'));

app.post('/zendesk', (req, res) => {
  // Hit when new comment is added to Zendesk Ticket
  console.log(req.body);
  res.status(200).send();
});

app.post('/slack', (req, res) => {
  console.log(req.body);
  res.status(200).send(req.body.challenge);
});

app.listen(app.get('port'), () => console.log(`Example app listening on port ${app.get('port')}!`))