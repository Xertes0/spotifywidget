const { ipcRenderer } = require("electron");
const child_process = require("child_process");
const { isRegExp } = require("util");

var token = "";
var ref_token = "";

let check_if_running;

async function getTokens(code, client_id, client_secret) {
	const response = await window.fetch(
		"https://accounts.spotify.com/api/token",
		{
			method: "POST",
			headers: {
				//"Authorization":"Basic " + clientId + ":" + clientSecret,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body:
				"grant_type=authorization_code&client_id=" +
				client_id +
				"&client_secret=" +
				client_secret +
				"&code=" +
				code +
				"&redirect_uri=https%3A%2F%2Fexample.com",
		}
	);

	console.log(response);
	return response.json();
}

async function upToken() {
	const response = await window.fetch(
		"https://accounts.spotify.com/api/token",
		{
			method: "POST",
			headers: {
				//"Authorization":"Basic " + clientId + ":" + clientSecret,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: "grant_type=refresh_token&refresh_token=" + ref_token,
		}
	);

	console.log(response);
	return response.json();
}

async function getTrack() {
	const response = await window.fetch(
		"https://api.spotify.com/v1/me/player/currently-playing",
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + token,
			},
		}
	);

	console.log(response);
	if (response.status == 204) return "Not playing";
	return response.json();
}

function update() {
	function update() {
		getTrack().then((data) => {
			console.log(data);
			if (data === "Not playing") {
				document.getElementById("title").innerHTML = "Currently Not Playing";
				document.getElementById("artists").innerHTML = "Spotify";
				document.getElementById("photo").src = "blank.png";
				return;
			}

			const name = data["item"]["name"];
			let artists = "";
			if (data["item"]["artists"].length == 1) {
				artists = data["item"]["artists"][0]["name"];
			} else {
				for (i = 0; i < data["item"]["artists"].length; i++) {
					artists += " " + data["item"]["artists"][i]["name"];
					if (i < data["item"]["artists"].length - 1) artists += ",";
				}
			}

			const album = data["item"]["album"]["name"];
			const photo = data["item"]["album"]["images"][0]["url"];

			console.log(name);
			console.log(artists);
			console.log(album);
			console.log(photo);

			document.getElementById("title").innerHTML = name;
			document.getElementById("artists").innerHTML = artists;
			document.getElementById("photo").src = photo;
		});
	}

	// If specified in the config
	// Check if spotify is running
	if (process.platform == "linux" && check_if_running)
		child_process.exec("/usr/bin/pgrep spotify", (err, stdout, sterr) => {
			if (stdout != "" || !err) update();
		});
	else {
		update();
	}
}

ipcRenderer.on("loaded", (event, code, json) => {
	console.log("ipcRenderer");
	console.log(code);
	check_if_running = json["check_if_running"] == "true";

	if (json["position"].split("-")[1] == "left") {
		document.getElementById("main").style.marginLeft = "160px";
		document.getElementById("photo-div").style.left = "10px";
	} else {
		document.getElementById("photo-div").style.left = "390px";
	}

	getTokens(code, json["client_id"], json["client_secret"]).then((data) => {
		console.log(data);

		token = data["access_token"];
		ref_token = data["refresh_token"];

		setInterval(upToken, parseInt(data["expires_in"]) * 1000 - 5000); // expires_in time in SECONDS    also subtract 5000 ms for latency recompensation
		setInterval(update, 5000);
	});
});
