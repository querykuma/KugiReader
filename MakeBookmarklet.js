/**
 * @file MakeBookmarklet.js
 * @version: 1.2.1
 */

const fs = require("fs");

class MakeBookmarklet {
	static o_defaultOptions = {
		"f_encodeURIComponent": true,
		"s_banner": ""
	};

	constructor(o_options) {
		this.o_options = {
			...MakeBookmarklet.o_defaultOptions,
			...o_options
		};
	}

	/**
	 * 出力ファイル名s_filenameに対応するs_bannerを返す。
	 * webpack.config.jsのpluginsのnew MakeBookmarkletのs_bannerに
	 *  指定がなければ""を返す。
	 *  文字列が指定してあれば文字列を返す。
	 *  対応関係を示すオブジェクトが指定してあれば対応する文字列を返す。
	 */
	get_banner(s_filename, o_info) {
		const { s_banner } = this.o_options;

		if (!s_banner) {
			return "";
		}

		if (typeof (s_banner) === "string") {
			return s_banner;
		}

		if (typeof (s_banner) !== "object"
			|| s_banner.constructor !== Object) {
			return "";
		}

		const I_entrypoints = o_info.compilation.entrypoints.entries();
		let o_entrypoint;

		// eslint-disable-next-line no-sequences
		while (o_entrypoint = I_entrypoints.next(), !o_entrypoint.done) {
			const a_value = o_entrypoint.value;
			const s_files = a_value[1].getFiles();

			if (s_files.length !== 1) {
				console.log(`MakeBookmarkletにて予期されない形に会いました。s_files.length = ${s_files.length}`);
			}

			if (s_files[0] === s_filename) {
				const s_return = s_banner[a_value[0]];

				if (s_return === void 0) {
					return "";
				}
				return String(s_return);
			}
		}

		return "";
	}

	apply(compiler) {
		const s_pluginName = MakeBookmarklet.name;

		compiler.hooks.assetEmitted.tap(s_pluginName, (s_filename, o_info) => {
			const s_targetPath = o_info.targetPath;
			if (!s_targetPath.match(/\.js$/u)) {
				console.log(`${s_filename} は.jsではありません。`);
				return;
			}

			const s_content = o_info.content.toString("utf8");

			const { mode } = o_info.compilation.options;

			if ((mode === void 0 || mode === "production")
				&& !s_content.match(/^\(\(\)=>\{.*\}\)\(\);$/u)) {
				/**
				 * developmentはコメントが多いのでproduction modeのときのみチェックする。
				 * 設定ファイルや引数で指定しなかった場合、modeがundefinedで、production modeになる。
				 */
				console.log(`${s_filename} の中身が予期されない形をしています。`);
				return;
			}

			const s_banner = this.get_banner(s_filename, o_info);

			const s_preceding = `javascript:${s_banner && `/* ${s_banner} */`}`;
			const s_content2
				= this.o_options.f_encodeURIComponent
					? `${s_preceding}${encodeURIComponent(s_content)}`
					: `${s_preceding}${s_content}`;

			fs.stat(s_targetPath, (err, stats) => {
				if (err) { throw err; }
				if (!stats.isFile()) {
					console.log(`${s_filename} はファイルではありません。`);
					return;
				}

				fs.unlink(s_targetPath, (err2) => {
					if (err2) { throw err2; }

					fs.writeFile(s_targetPath, s_content2, "utf8", (err3) => {
						if (err3) { throw err3; }
						console.log(`${s_filename} をbookmarkletにしました。`);
					});
				});
			});
		});
	}
}

module.exports = MakeBookmarklet;
