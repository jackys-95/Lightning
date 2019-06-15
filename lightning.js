const fetch = require('node-fetch');
global.fetch = fetch
global.Headers = fetch.Headers;
var config = require("./config.json");

function generateHeaders(accessToken) {
	return new fetch.Headers({
		'Authorization': "Bearer " + accessToken,
		'Client-Id': config['Client-Id']
	});
}

function getTwitchAppAccessToken() {
	return fetch("https://id.twitch.tv/oauth2/token" +
	    "?client_id=" + config['Client-Id'] +
	    "&client_secret=" + config['Client-Secret'] +
	    "&grant_type=client_credentials", { method: 'POST' })
		.then(response => response.json());
}

function getTwitchUserStreamStatus(username) {
	return fetch('https://api.twitch.tv/helix/streams?user_login=' + username, {
		method: 'GET', headers: generateHeaders(accessToken) })
		.then(response => response.json())
		.then(json => {
			return json.data;
		})
		.catch(err => console.log(err));
}

function generateMessage(streamJson) {
	function stringReplace(str, search, replace) {
		return str.split(search).join(replace)
	}
	imageURL = stringReplace(streamJson.thumbnail_url, "{width}", "1920");
	imageURL = stringReplace(imageURL, "{height}", "1080");
	console.log(imageURL);
	return {
		"content": streamJson.user_name + " is streaming!",
		"tts": false,
		"embeds": [{
			"color": 16758465,
			"author": {
				"name": streamJson.user_name + " is now live on Twitch!",
				"url": "https://www.twitch.tv/" + streamJson.user_name,
				"icon_url": "https://static-cdn.jtvnw.net/user-default-pictures/4cbf10f1-bb9f-4f57-90e1-15bf06cfe6f5-profile_image-70x70.jpg"
			},
			"url": "https://www.twitch.tv/" + streamJson.user_name,
			"description": "\n{GameTitle} for {ViewCount} viewers.\n [Click to watch!](https://www.twitch.tv/" + streamJson.user_name + ")",
			"image": {
				"url": imageURL
			},
			"footer": {
				"text": "Sent by Lightning"
			}
		}]
	};
}

async function postToDiscord(streamJson) {
	return fetch('https://discordapp.com/api/webhooks/' + config['Discord-Hook-Id'] + '/' +
		config['Discord-Hook-Token'], {
			method: 'POST', headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(generateMessage(streamJson))
		})
	.then(response => response)
	.catch(err => console.log(err));
}

async function checkUserStreamStatus() {
	return await getTwitchUserStreamStatus(config['Target-User'])
		.then(async data => {
			if (data != null && data.length != 0) {
				var t2 = process.hrtime(t1);
				console.info('Execution time (s): %ds', t2[0]);
				console.log(data[0]);
				await postToDiscord(data[0]).then(response => console.log("Discord webhook response code: " + response.status));
				return true;
			}
			else {
				return false;
			}
		})
		.catch(err => console.log(err));
}

async function measureStreamStartLatency() {
	var isStreaming = false;
	while (!isStreaming) {
		await sleep(1000);
		isStreaming = await checkUserStreamStatus();
	}
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

var accessToken;
getTwitchAppAccessToken().then(json => json.access_token);
var t1 = process.hrtime();
measureStreamStartLatency();