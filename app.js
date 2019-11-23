const express = require('express');
const zendeskSdk = require('node-zendesk');
const bodyParser = require('body-parser');
const { WebClient } = require('@slack/web-api');

const Zendesk = require('./models/zendesk.js');
const Slack = require('./models/slack.js');

const app = express()
app.set('port', process.env.PORT || 5000);
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

let zClient = zendeskSdk.createClient({
  username:  'shaun.t.vanweelden@gmail.com',
  token:     process.env.ZENDESK_TOKEN,
  remoteUri: 'https://shaundev.zendesk.com/api/v2'
});
const slackClient = new WebClient(process.env.SLACK_TOKEN);


let requesterEmail = "customer7@timeshot.com";
let requesterName = "Test 7";

let subject = "Hey now, it's working"; // TODO: Try with ' in the subject
let body = "Care to celebrate?";
let comment = "Commenting is fun";

let ticketId = 14;

let slackUserId = 'UQAF29JLB';
let slackChannelId = 'DQMFNKUVA';

// Good helper function :) 
// console.log(JSON.stringify(result, null, 2, true));

(async () => {
  try {
    let user = await Zendesk.findCustomerByEmail(requesterEmail);
    if (!user) {
      user = await Zendesk.createCustomerByNameEmail(requesterName, requesterEmail);
    }
    console.log("User Id: " + user.id);
    // console.log("User:\n" + JSON.stringify(user, null, 2, true));

    // ticket = await Zendesk.createTicketByCustomerId(user.id, subject, body, slackChannelId);
    // console.log("Ticket:\n" + JSON.stringify(ticket, null, 2, true));

    // let comments = await Zendesk.getPublicCommentsByTicketId(ticketId);
    // console.log("Comments:\n" + JSON.stringify(comments, null, 2, true));

    // let result = await Zendesk.addCommentByTicketId(user.id, ticket.id, comment);
    // console.log("Result:\n" + JSON.stringify(result, null, 2, true));

    // const result = await slackClient.chat.postMessage({
    //   text: 'Hello world!',
    //   channel: slackChannelId,
    // });
    // console.log(`Successfully send message ${result.ts} in conversation ${slackChannelId}`);

    const slackUser = await slackClient.users.info({ user: 'UQAF29JLB' });
    console.log(slackUser.user.profile.real_name + " | " + slackUser.user.profile.email);

  } catch (e) {
    console.log(e);
  }
})();

app.get('/', (req, res) => res.send('Hello, World!'));

app.post('/zendesk', async (req, res) => {
  // Hit when new public comment is added to Zendesk Ticket

  // Get latest comment on that ticket
  let ticketComments = await Zendesk.getPublicCommentsByTicketId(req.body.ticketId);
  let lastComment = ticketComments[ticketComments.length - 1];

  console.log(`Channel Id: ${req.body.externalId}`);
  console.log(`Message to Post: ${lastComment}`);

  // Post that latest comment to Slack
  try {
    await Slack.addBotMessageToChannel(slackChannelId, 'Working now?');
  } catch (e) {
    console.error(JSON.stringify(e));
    res.status(500).send(JSON.stringify(e));
  }
});

app.post('/slack', async (req, res) => {
  const body = req.body;

  if (body.type == 'url_verification') {
    res.status(200).send(req.body.challenge);

  } else if (body.type == 'message') {
    console.log(body);
    let message = body.text;
    let channel = body.channel;
    if (body.user) {
      // It's a message from a human
      let userId = body.user;
      const slackUser = await slackClient.users.info({ user: userId });
      console.log(slackUser.user.profile.real_name + " | " + slackUser.user.profile.email);
    } else {
      // It's a message from a bot
    }

    res.status(200).send('');
  } else {
    console.log(body);
    res.status(200).send('');
  }
});

app.listen(app.get('port'), () => console.log(`Example app listening on port ${app.get('port')}!`))