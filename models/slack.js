const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_TOKEN);

exports.addBotMessageToChannel = function(channelId, text) {
  return new Promise(async function(resolve, reject) {
    try {
      let message = await slackClient.chat.postMessage({
        text: text,
        channel: channelId
      });
      resolve(message);
    } catch (e) {
      reject(e);
    }
  });
}

exports.getUserById = function(userId) {
  return new Promise(async function(resolve, reject) {
    try {
      resolve(await slackClient.users.info({ user: userId }))
    } catch (e) {
      reject(e);
    }
  });
}