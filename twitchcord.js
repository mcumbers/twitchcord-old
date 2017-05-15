const fs = require('fs');
const Client = require('node-rest-client').Client;
const schedule = require('node-schedule');
const twitch = require('twitch.tv');
const jsonfile = require('jsonfile');

const restClient = new Client();
const configFile = 'config.json';

const job = schedule.scheduleJob('/1 * * * * *', () => {
	// This job will run once per minute
	console.log("Job Started.");
	// Getting info from config.json
	jsonfile.readFile(configFile, (err, config) => {
		if(err){
			console.log(err);
			return;
		}
		console.log("Config Loaded, checking streams...");
		// Looping through each tracked stream
		for(const stream of config.streams) {
			console.log(`Checking Twitch ID ${stream.id}`);
			// Getting stream info from twitch API
			twitch(`streams/${stream.id}`, config.twitchInfo, (err, twitchResponse) =>{
				if(err){
					console.log(err);
					return;
				}
				if (!twitchResponse.stream) {
					// No stream info returned, means user isn't streaming right now
					console.log(`Twitch ID ${stream.id} (${stream.nickname}) is not live`);
					return;
				}
				// Stream is active!
				// Checking to see if we've already sent out notifications for this one yet
				if(stream.latestStream === twitchResponse.stream._id) {
					// We've already sent out notifications for this stream. No need to do it again!
					console.log(`Already tracked this stream from Twitch ID ${stream.id} (${stream.nickname})`);
					return;
				}

				// This is the first time we've seen this stream! Time to send out notifications!
				console.log(`Twitch ID ${stream.id} (${stream.nickname}) has started streaming!`);

				// But first we're going to update our config with the info of this stream
				streams[i].latestStream = twitchRes.stream._id;
				jsonfile.writeFile(config, config, (err) => {if(err){console.log(err);}});

				// Patching bug where webhooks won't send if streamer hasn't specified a game on Twitch
				if(!twitchResponse.stream.game){
					twitchResponse.stream.game = "Not Playing";
				}

				// Now, on to notifications!
				// Iterate through each receiver for this stream
				stream.receivers.forEach((receiver) => {
					// Build the Webhook
					const args = buildWebHook(twitchResponse, receiver);

					// Sending the Webhook
					restClient.post(receiver.webhook, args, function(data, webhookResponse) {
						console.log(`Sent webhook to ${receiver.nickname}`);
					});
				});
			});
		}
	});
});

function buildWebHook(twitchResponse, receiver) {
	return {
		data: {
			"username": `${twitchResponse.stream.channel.display_name}`,
			"avatar_url": `${twitchResponse.stream.channel.logo}`,
			"content": `${receiver.customMessage}`,
			"embeds": [{
				"author": {
					"name": `${twitchResponse.stream.channel.display_name}`,
					"icon_url": `${twitchResponse.stream.channel.logo}`
				},
				"title": `🔴 LIVE: ${twitchResponse.stream.channel.status}`,
				"url": `${twitchResponse.stream.channel.url}`,
				"color": 6570404,
				"fields": [{
					"name": "Game",
					"value": `${twitchResponse.stream.game}`,
					"inline": true
				},
					{
						"name": "Viewers",
						"value": `${twitchResponse.stream.viewers}`,
						"inline": true
					}
				],
				"image": {
					"url": `${twitchResponse.stream.preview.large}`
				},
				"thumbnail": {
					"url": `${twitchResponse.stream.channel.logo}`
				},
				"footer": {
					"text": `/${twitchResponse.stream.channel.name}`,
					"icon_url": `https://cdn.discordapp.com/attachments/250501026958934020/313483431088619520/GlitchBadge_Purple_256px.png`
				}
			}]
		},
		headers: {
			"Content-Type": "application/json"
		}
	};
}
