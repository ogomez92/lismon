# Introduction

This is a quick console app I threw together to notify me via sound if people are joining or leaving my icecast stream and tell me how many listeners there are.

## Usage

This has no binaries and probably never will. Create a .env file with the following data:

```.env
ICECAST_PASSWORD=xxx
ICECAST_URL=http://server.com:8000
MOUNTPOINT=/stream.mp3 #Don't forget the /!
```

This uses Cheerio and Axios behind the scenes. It requests the data and parses the response via XML.

By default it will request for listener count every 2000 ms. This is appropriate for most cases but if you have a very slow connection or your server doesn't handle this many requests you can change this value in the code (const TIME_BETWEEN_REQUESTS).

## Credits


All sounds by Currently Untitled Audio .design (sorry, Github doesn't let me link to .design sites in markdown for some reason).
