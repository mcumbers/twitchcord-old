# twitch.tv
node.js lib for Twitch.tv's REST API
---

`npm install twitch.tv`

## Example

```js
var twitch = require("twitch.tv")

twitch("streams", function(err, res) {
  console.log(res)
})
```

## API

### `twitch(apiMethod[, options], callback)`

Default options:
```js
{
  ua: "node.js twitch.tv by mediremi",
  apiVersion: "3",
  clientID: ""
}
```

* `options.baseUrl` -> `Twitch.tv` API base URL
* `options.ua` -> User agent sent to `Twitch.tv`
* `options.apiVersion` -> API version used
* `options.clientID` -> Client ID provided by `Twitch.tv`. Used for rate-limiting
* `options.auth` -> OAuth token provided by `Twitch.tv`. Used for privileged requests ([doc here](https://dev.twitch.tv/docs/v5/guides/authentication/))

`callback` is called with two parameters: `err` and `response`.

> [Available Twitch API methods](https://github.com/justintv/twitch-api#index)

Examples:

```js
twitch("channel", function(err, res) {
  console.log(res)
})

twitch("games/top", function(err, res) {
  if (err) return console.error(err)

  console.log(res.top)
})

twitch("videos/top", {
  ua: "get-cool-twitch-vids.com",
  apiVersion: 1,
  clientID: "axjhfp777tflhy0yjb5sftsil"
})

twitch("channels/44322889", {
  apiVersion: 5,
  clientID: "uo6dggojyb8d6soh92zknwmi5ej1q2"
})

// https://dev.twitch.tv/docs/v5/reference/users/#get-user
twitch("user", {
  apiVersion: 5,
  clientID: "uo6dggojyb8d6soh92zknwmi5ej1q2",
  auth: "cfabdegwdoklmawdzdo98xt2fo512y"
})
```
