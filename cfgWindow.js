const remote = require("electron").remote;
const path = require("path");
const { ipcRenderer } = require("electron");
const cfg_mng = require("./config");

const items = [
	"client_id",
	"client_secret",
	"position",
	"check_if_running",
	"white_font",
];

var client_secret;

var config_path;
let json;
if (remote.app.commandLine.hasSwitch("config_path")) {
	config_path = remote.app.commandLine.getSwitchValue("config_path");
	json = cfg_mng.load(config_path, true);
} else {
	config_path = path.join(remote.app.getPath("appData"), "spotifywidget");
	json = cfg_mng.load(config_path);
	config_path = path.join(config_path, "config.json");
}

console.log(json);

for (let i = 0; i < items.length; i++) {
	const value = json[items[i]];
	if (items[i] == "client_secret") {
		client_secret = json[items[i]];
		var el = document.getElementById("client_secret");
		el.onmouseover = () => {
			el.value = json[items[i]];
		};
		el.value = "Hover to show";

		continue;
	}
	if (value == "undefined") continue;
	if (value == "true" || value == "false")
		document.getElementById(items[i]).checked = value == "true";
	else document.getElementById(items[i]).value = value;
}
document.getElementById("submit").addEventListener("click", () => {
	json = {};

	for (let i = 0; i < items.length; i++) {
		const value = document.getElementById(items[i]).value;
		if (value == "Hover to show") json["client_secret"] = client_secret;
		else if (value == "on")
			json[items[i]] = document.getElementById(items[i]).checked;
		else json[items[i]] = value;
	}

	console.log(json);
	cfg_mng.save(config_path, JSON.stringify(json));

	ipcRenderer.sendSync("config", json);
});
