# twitchcord  
Twitch stream notifications on Discord in (usually) less than 60 seconds
------

## This version of twitchcord is now deprecated. 
## Check [Here](https://github.com/mcumbers/twitchcord) for a version that uses the new twitch API

Originally made by myself for [Jeremy Dooley's Twitch/Discord Community](https://www.twitch.tv/dooleynotedgaming), this handy little node script will check any streams specified once per minute and send a webhook to Discord if they're live.

![alt text][example]

---
### Setup:
+ First you're going to need to [Make a New Twitch Application](https://www.twitch.tv/kraken/oauth2/clients/new)
  * Give it a clever name
  * Set the Redirect URI to `http://localhost`
  * Accept the terms
+ Copy the Client ID from you new Twitch Application and set twitchAuth.clientID to it in `config.json` (Paste it at Line 3, Column 18)
  * Save config.json
+ Run `npm i`

#### Your App is now (technically) functional!

### Configuration:  
I'd like to think the `config.json` is fairly straightforward...  
+ Each object in `streams` is a different streamer that the script will check  
  * `id` is the Unique Account ID of the twitch streamer (You can get this from [TwitchTools](https://www.twitchtools.com/channels))  
  * `nickname` is only used internally, but makes it easier for you to distinguish which stream is which  
  * `latestStream` is the variable modified by the program to make sure it only sends out one round of notifications per stream  
  * `receivers` is an array of sub-objects for each notification you want to send out.
    * `nickname` Again, only used internally; the nickname for this server/channel/webhook link you're sending out
    * `customMessage` is the message sent above the embed. If you want to ping everyone, or a certain group of users, this is where you can put that.
    * `webhook` is the actual webhook URL that you get from Discord

[example]: https://cdn.discordapp.com/attachments/250501026958934020/313503671801610241/Capture.PNG "Webhook Example"
