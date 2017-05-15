const { Client } = require('node-rest-client');
const schedule = require('node-schedule');
const twitch = require('twitch.tv');
const jsonfile = require('jsonfile');

const restClient = new Client();
const configFile = "config.json";

schedule.scheduleJob('/1 * * * * *', () => {
	// This job will run once per minute
	console.log("Job Started.");
	// Getting info from config.json
	return getConfig(configFile).then((config) => {
		console.log("Config Loaded, checking streams...");
		// Looping through each tracked stream
		let streamPromises = [];
		for(const stream of config.streams) {
			streamPromises.push(checkStream(stream, config));
		}
		return resolveAll(streamPromises);
	}).catch((error) => {
		console.log(error);
	});
});
	
function checkStream(stream, config) {
	console.log(`Checking Twitch ID ${stream.id}`);
	// Getting stream info from twitch API
	return getTwitchInfo(stream.id, config.twitchAuth).then((twitchResponse) => {
		if (!twitchResponse.stream) {
			// No stream info returned, means user isn't streaming right now
			console.log(`Twitch ID ${stream.id} (${stream.nickname}) is not live`);
			return Promise.resolve();
		}
		
		// Stream is active!
		// Checking to see if we've already sent out notifications for this one yet
		if(stream.latestStream === twitchResponse.stream._id) {
			// We've already sent out notifications for this stream. No need to do it again!
			console.log(`Already tracked this stream from Twitch ID ${stream.id} (${stream.nickname})`);
			return Promise.resolve();
		}
		
		// This is the first time we've seen this stream! Time to send out notifications!
		console.log(`Twitch ID ${stream.id} (${stream.nickname}) has started streaming!`);
		
		// But first we're going to update our config with the info of this stream
		stream.latestStream = twitchResponse.stream._id;
		return saveConfig(configFile, config).then(() => {
			// Patching bug where webhooks won't send if streamer hasn't specified a game on Twitch
			if(!twitchResponse.stream.game){
				twitchResponse.stream.game = "Not Playing";
			}
			
			// Now, on to notifications!
			// Iterate through each receiver for this stream
			let notificationPromises = [];
			for(const receiver of stream.receivers) {
				notificationPromises.push(notify(receiver, twitchResponse));
			}
			return resolveAll(notificationPromises);
		});
	});
}
				
function notify(receiver, twitchResponse) {
	// Build the request options
	const args = buildWebHook(twitchResponse, receiver);
	return new Promise((resolve, reject) => {
		restClient.post(receiver.webhook, args, function(data, webhookResponse) {
			console.log(`Sent webhook to ${receiver.nickname}`);
			resolve();
		});
	});
}

// Function that, paired with promise.all/map, will complete all promises even if one rejects
// as promise.all will usually reject the moment one of its promises rejects
function reflect(promise) {
	return promise.then(function (v) {
		return {v: v, status: "resolved"}
	},
	function (e) {
		console.log(e);
		return {e: e, status: "rejected"}
	});
}

function resolveAll(promises) {
	return Promise.all(promises.map(reflect));
}

function saveConfig(file, config) {
	return new Promise((resolve, reject) => {
		jsonfile.writeFile(file, config, (err) => {
			if(err){
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

function getConfig(file) {
	return new Promise((resolve, reject) => {
		jsonfile.readFile(file, (err, config) => {
			if(err){
				reject(err);
			} else {
				resolve(config);
			}
		});
	});
}

function getTwitchInfo(streamId, twitchAuth) {
	return new Promise((resolve, reject) => {
		twitch(`streams/${streamId}`, twitchAuth, (err, twitchResponse) => {
			if(err){
				reject(err);
			} else {
				resolve(twitchResponse);
			}
		});
	});
}

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
