/* global require,module,__dirname */
const path = require("path");
const MakeBookmarklet = require("./MakeBookmarklet.js");
const o_package = require("./package.json");

module.exports = {
	"mode": "production",
	"context": path.resolve(__dirname, "src"),
	"entry": {
		"kugi_reader_bookmarklet": "./kugi_reader_bookmarklet.js",
		"en_kugi_reader_bookmarklet": "./en_kugi_reader_bookmarklet.js",
		"全角ピリオド変換_bookmarklet": "./全角ピリオド変換_bookmarklet.js"
	},
	"output": {
		"filename": "[name]_min.js"
	},
	"plugins": [
		new MakeBookmarklet({
			"f_encodeURIComponent": false,
			"s_banner": {
				"kugi_reader_bookmarklet": `v${o_package.version}`,
				"en_kugi_reader_bookmarklet": "v1.0.0",
				"全角ピリオド変換_bookmarklet": "v1.0.0"
			}
		})
	]
};
