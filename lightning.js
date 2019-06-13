const fetch = require('node-fetch');
global.fetch = fetch
global.Headers = fetch.Headers;
var config = require("./config.json");

function generateHeaders(accessToken) {
	return new fetch.Headers({
		'Accept': 'application/vnd.twitchtv.v5+json',
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

async function checkUserStreamStatus() {
	return await getTwitchUserStreamStatus(config['Target-User'])
		.then(data => {
			if (data != null && data.length != 0) {
				var t2 = process.hrtime(t1);
				console.info('Execution time (s): %ds', t2[0]);
				console.log(data);
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