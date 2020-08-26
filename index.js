const electron = require("electron");
const path = require("path");
const {
	screen,
	app,
	BrowserWindow,
	nativeTheme,
	ipcMain,
} = require("electron");

function authWindow(json) {
	let authWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		"node-integration": false,
		"web-security": false,
	});

	let by_user = true;
	authWindow.on("closed", () => {
		if (by_user) app.quit();
	});

	const authUrl =
		"https://accounts.spotify.com/authorize?client_id=" +
		json["client_id"] +
		"&response_type=code&redirect_uri=https%3A%2F%2Fexample.com&scope=user-read-currently-playing";

	console.log(authUrl);

	authWindow.loadURL(authUrl);

	function show() {
		try {
			authWindow.show();
		} catch (err) {}
	}
	setTimeout(show, 1000);

	authWindow.webContents.on("will-redirect", function (event, newUrl) {
		if (!newUrl.startsWith("https://example.com")) {
			return;
		}
		by_user = false;
		authWindow.close();

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
			app.quit();
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
	});
}

function createWindow() {
	if (!app.commandLine.hasSwitch("skip-config-screen")) {
		let cfgWindow = new BrowserWindow({
			width: 800,
			height: 600,
			show: true,
			webPreferences: {
				nodeIntegration: true,
			},
		});

		cfgWindow.loadFile("./cfgWindow.html");

		let by_user = true;
		cfgWindow.on("closed", () => {
			if (by_user) app.quit();
		});

		ipcMain.on("config", (event, arg) => {
			console.log(arg);
			by_user = false;
			cfgWindow.close();
			cfgWindow = null;
			authWindow(arg);
		});
	} else {
		const json = require("./config").load(
			path.join(app.getPath("appData"), "spotifywidget")
		);
		authWindow(json);
	}
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows.length === 0) {
		createWindow();
	}
});
