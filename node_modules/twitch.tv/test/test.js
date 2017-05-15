var test = require("tape")
var twitch = require("../")

function testAPI(t) {
	t.plan(1)

	twitch("twitch/test", {
		baseUrl: "http://localhost:8000/"
	}, function(err, response) {
		t.ok(response.ok === true)
	})
}

setUpServer(function() {
	test("Test the API", testAPI)
})

function setUpServer(cb) {
	var server = require("express")()
	var http

	server.get("/twitch/test", function(req, res) {
		res.send(JSON.stringify({
			ok: true
		}))

		setTimeout(function() {
			http.close()
		}, 500)
	})

	http = server.listen(8000, cb)
}
