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

    // Slack.addBotMessageToChannel(slackChannelId , 'Hello world!');

    // let ticketComments = await Zendesk.getPublicCommentsByTicketId(19);
    // let lastComment = ticketComments[ticketComments.length - 1];
    // console.log(JSON.stringify(lastComment));

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
  console.log(`Message to Post: ${lastComment.body}`); // could swap out for a parsed html_body at some point

  // Post that latest comment to Slack
  try {
    await Slack.addBotMessageToChannel(req.body.externalId, lastComment.body);
  } catch (e) {
    res.status(500).send(JSON.stringify(e));
  }
});

app.post('/slack', async (req, res) => {
  const body = req.body;

  if (body.type == 'url_verification') {
    res.status(200).send(req.body.challenge);

  } else if (body.type == 'message') {
    console.log(body);
    let slacKMessage = body.text;
    let slackChannel = body.channel;
    if (body.user) {
      console.log("We got here...");
      // It's a message from a human
      let slackUserId = body.user;
      const slackUser = await slackClient.users.info({ user: slackUserId });
      console.log("Message from: " + slackUser.user.profile.real_name + " | " + slackUser.user.profile.email);

      let zendeskUser = await Zendesk.findCustomerByEmail(slackUser.user.profile.email);
      if (!zendeskUser) { 
        zendeskUser = await Zendesk.createCustomerByNameEmail(
          slackUser.user.profile.real_name, 
          slackUser.user.profile.email
        );
      }
      console.log("Zendesk User Id: " + zendeskUser.id);

      let tickets = Zendesk.getTicketsByExternalId(slackChannel);
      let hasExistingTicket = tickets.length > 0;

      if (hasExistingTicket) {
        ticketIdToUpdate = tickets[0].id;
        try {
          await Zendesk.addCommentByTicketId(
            zendeskUser.id,
            ticketIdToUpdate,
            slacKMessage
          );
          console.log("Posted to Ticket Id: " + ticketIdToUpdate);
        } catch (e) {
          // TODO: POST TO SLACK ON FAILURE
          console.error(JSON.stringify(e));
        }
      } else {
        try {
          let ticket = await Zendesk.createTicketByCustomerId(
            zendeskUser.id,
            `New Slack Message from ${slackUser.user.profile.real_name}`,
            slacKMessage,
            slackChannel
          );
          console.log("Posted to Ticket Id: " + ticket.id);
        } catch (e) {
          // TODO: POST TO SLACK ON FAILURE
          console.error(JSON.stringify(e));
        }

        try {
          await Slack.addBotMessageToChannel(
            slackChannel, 
            'Hey there, I got your message sent over to a human. We\'ll send updates here in Slack and over email as we get them.'
          );
        } catch (e) {
          console.error(JSON.stringify(e));
        }
      }

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