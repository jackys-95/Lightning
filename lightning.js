const fetch = require('node-fetch');
global.fetch = fetch
global.Headers = fetch.Headers;
var config = require("./config.json");

const headers = new fetch.Headers({
	'Accept': 'application/vnd.twitchtv.v5+json',
	'Client-Id': config['Client-Id']
})

const init = {
	method: 'GET',
	headers: headers
};

function getTwitchUserStreamStatus(id) {
	return fetch('https://api.twitch.tv/kraken/streams/' + id, init)
		.then(response => response.json())
		.then(json => json.stream)
		.catch(err => console.log(err));
}

console.log("Executing requests for user: " + config['Target-User']);
getTwitchUserStreamStatus(config['Target-User'])
	.then(status => {
		if (!status) {
			console.log("User: " + config['Target-User'] + " is not streaming.");
		}
		else {
			console.log("User: " + config['Target-User'] + " is streaming!");
		}
	}
);

console.log("This code is being run asynchronously :)");
console.log("AYAYA");