var request = require("request")

module.exports = function getAPI(apiMethod, options, callback) {
	var baseUrl = "https://api.twitch.tv/kraken/"

	if (typeof options === "function") {
		callback = options
		options = null
	}

	options = options || {}

	baseUrl = options.baseUrl || baseUrl

	var headers = {
		"User-Agent": options.ua || "node.js twitch.tv by mediremi",
		"Accept": "application/vnd.twitchtv.v" + (options.apiVersion || "3") + "+json",
		"Client-ID": options.clientID || ""
	}

	if (typeof options.auth === "string"){
		headers["Authorization"] = "OAuth " + options.auth;
	}

	request({
		url: baseUrl + apiMethod,
		headers: headers
	}, function(error, response, body) {
		if (!error) {
			// catch JSON parse errors
			try {
				var parsedBody = JSON.parse(body);
			} catch(e){
				return callback(e, null);
			}

			// API returned a success
			if(response.statusCode == 200){
				callback(null, parsedBody)
			}
			// API returned an error
			else {
				callback(parsedBody, null)
			}
		}
		// errors during request
		else {
			callback(error, null)
		}
	})
}
