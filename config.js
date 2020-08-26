const path = require("path");
const fs = require("fs");

module.exports = {
	load: function (config_path, is_custom = false) {
		let data;
		console.log(config_path);

		if (is_custom) {
			try {
				data = fs.readFileSync(config_path);
			} catch (err) {
				console.error("Could not read the config path: " + err);
			}
		} else {
			try {
				data = fs.readFileSync(path.join(config_path, "config.json"));
			} catch (err) {
				try {
					fs.mkdirSync(config_path);
				} catch (err) {}
				data = null;
			}
		}

		if (data !== null) return JSON.parse(data);
		else return {};
	},

	save: function (config_path, data) {
		fs.writeFileSync(config_path, data);
	},
};
