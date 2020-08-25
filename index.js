const electron = require("electron");
const { screen, app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

let data;
const config_path = path.join(app.getPath("appData"), "spotifywidget");

if (app.commandLine.hasSwitch("config")) {
	const data_path = app.commandLine.getSwitchValue("config");
	console.log(data_path);
	data = fs.readFileSync(data_path);
} else {
	try {
		data = fs.readFileSync(config_path + "/config.json");
	} catch (err) {
		try {
			fs.mkdirSync(config_path);
		} catch (err) {}
		fs.writeFileSync(
			config_path + "/config.json",
			'{"client_id": "Your client id","client_secret": "Your client secret", ' +
				'"position": "top-right","check_if_running": "false"}'
		);

		no_data();
		return;
	}
}

const json = JSON.parse(data);

console.log(json);

const client_id = json["client_id"];

if (client_id == "Your client id") {
	no_data();
	return;
}

function no_data() {
	console.error(
		"Put your client id and client secret (https://developer.spotify.com/dashboard) to the " +
			path.join(config_path, "config.json") +
			" file!"
	);
	app.quit();
	return;
}

function createWindow() {
	let authWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		"node-integration": false,
		"web-security": false,
	});

	const authUrl =
		"https://accounts.spotify.com/authorize?client_id=" +
		client_id +
		"&response_type=code&redirect_uri=https%3A%2F%2Fexample.com&scope=user-read-currently-playing";

	console.log(authUrl);

	authWindow.loadURL(authUrl);
	authWindow.show();

	authWindow.webContents.on("will-redirect", function (event, newUrl) {
		if (!newUrl.startsWith("https://example.com")) {
			return;
		}

		console.log(newUrl);

		const winWidth = 550;
		const winHeigh = 170;

		let window;
		if (app.commandLine.hasSwitch("dev")) {
			window = new BrowserWindow({
				width: winWidth,
				height: winHeigh,
				//frame: false,
				//transparent: true,
				//type: "desktop",
				webPreferences: {
					nodeIntegration: true,
				},
			});
		} else {
			window = new BrowserWindow({
				width: winWidth,
				height: winHeigh,
				frame: false,
				transparent: true,
				type: "toolbar",
				show: true,
				webPreferences: {
					nodeIntegration: true,
					devTools: false,
				},
			});

			window.setIgnoreMouseEvents(true);
		}

		const top = json["position"].split("-")[0];
		const right = json["position"].split("-")[1];
		console.log(top);
		console.log(right);

		const sSize = screen.getPrimaryDisplay().size;

		let yPos;
		switch (top) {
			case "top": {
				yPos = 0;
				break;
			}
			case "bottom": {
				yPos = sSize.height - winHeigh;
				break;
			}
			default: {
				console.error('Invalid config value of "position"');
				break;
			}
		}

		let xPos;
		switch (right) {
			case "right": {
				xPos = sSize.width - winWidth;
				break;
			}
			case "left": {
				xPos = 0;
				break;
			}
			default: {
				console.error('Invalid config value of "position"');
				break;
			}
		}

		window.setPosition(xPos, yPos);
		window.loadFile("window.html");
		window.webContents.on("did-finish-load", () => {
			window.webContents.send("loaded", newUrl.slice(26), json);
		});
		window.on("closed", () => {
			window = null;
		});
		window.webContents.on(
			"console-message",
			(event, level, msg, line, source_id) => {
				console.log(
					"Messege from " +
						source_id +
						" line " +
						line +
						" level " +
						level +
						":" +
						msg
				);
			}
		);
		authWindow.close();
	});
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	console.error("window all closed");
	if (process.platform != "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows.length === 0) {
		createWindow();
	}
});
