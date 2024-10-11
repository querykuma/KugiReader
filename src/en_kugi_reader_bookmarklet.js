javascript: (() => {/* eslint-disable-line no-unused-labels */
	/**
	 * ブックマークレット名： EnKugiReader
	 * KugiReaderの英語版。
	 * 丸括弧で囲まれたテキストを非強調表示して目立たなくする。
	 * 区切り文字「.?!,:;"“”—–…」を強調表示する。
	 * v1.0.0 | MIT License Copyright (c) 2024 Query Kuma
	 */
	console.log("en_kugi_reader_bookmarklet.js");

	const add_style_sheet = () => {
		document.querySelector("#ek_kugi_style")?.remove();

		document.head.insertAdjacentHTML("beforeend",
/*eslint-disable no-irregular-whitespace*/`
<style id="ek_kugi_style">
.ek_kakko, .ek_kuten,.ek_touten, .ek_quote, .ek_dash {
	display: inline!important;
	float: unset!important;
	position: static!important;
}
.ek_kakko {
	color: #b4b4b4;
}
.ek_kuten {
	color: #ddd;
	background-color: #464646;
	border: 1px #ddd dashed;
	font-weight: bold;
	border-radius: 4px;
	margin-inline-start: 4px;
	margin-inline-end: 12px;
	padding: 1px;
}
.ek_touten {
	color: #ddd;
	background-color: #5e5e5e;
	font-weight: bold;
	margin-inline-start: 2px;
	margin-inline-end: 4px;
	padding-block-end: 3px;
}
.ek_quote {
	background-color: #c8ff70;
	margin-inline-start: 2px;
	margin-inline-end: 2px;
}
.ek_dash {
	background-color: #ffeff2;
}
</style>`/*eslint-enable no-irregular-whitespace*/);
	};

	const toggle_styleSheet = () => {
		const e_style = document.querySelector("#ek_kugi_style");

		if (e_style.firstChild) {
			e_style.replaceChildren();
		} else {
			add_style_sheet();
		}
	};

	/**
	 * ターゲットノードをHTML文字列と置換する。
	 * @param {Node} N_target
	 * @param {string} s_html
	 */
	const replace_node_with_html = (N_target, s_html) => {
		const e_div = document.createElement("div");
		e_div.innerHTML = s_html;
		N_target.after(...e_div.childNodes);
		N_target.remove();
	};

	const replace_text = (N_target) => {
		const s_target = N_target.textContent;

		const r_区切り = /\(.*?\)|\(.*|[^(]*?\)|[.?!]+|[,:;]+|"|“|”|—|–|…/sgu;

		let n_pos_previous = 0;
		let m;
		let s_html = "";

		/* eslint-disable-next-line no-cond-assign */
		while (m = r_区切り.exec(s_target)) {
			const s_slice = s_target.slice(n_pos_previous, m.index);

			const s_match = m[0];

			if (s_match.at(-1) === ")") {
				s_html += `${s_slice}<span class="ek_kakko">${s_match}</span>`;
			} else {
				switch (s_match[0]) {
					case "(":
						s_html += `${s_slice}<span class="ek_kakko">${s_match}</span>`;
						break;

					case ".":
					case "?":
					case "!":
						s_html += `${s_slice}<span class="ek_kuten">${s_match}</span>`;
						break;

					case ",":
					case ":":
					case ";":
						s_html += `${s_slice}<span class="ek_touten">${s_match}</span>`;
						break;

					case "\"":
					case "“":
					case "”":
						s_html += `${s_slice}<span class="ek_quote">${s_match}</span>`;
						break;

					case "—":
					case "–":
					case "…":
						s_html += `${s_slice}<span class="ek_dash">${s_match}</span>`;
						break;

					default:
						console.log(`%c switch文において予期されない値です。「${s_match}」`, "color:hotpink;");
						break;
				}
			}

			n_pos_previous = r_区切り.lastIndex;
		}

		if (s_html !== "") {
			s_html += s_target.slice(n_pos_previous);
			replace_node_with_html(N_target, s_html);
		}
	};

	const replace_texts = () => {

		const i_texts = document.createNodeIterator(
			document.body,
			NodeFilter.SHOW_TEXT,
			(N_current) => {
				if (N_current.parentElement.closest("SCRIPT,STYLE,NAV,NOSCRIPT,FOOTER,ASIDE,LINK,CANVAS,IMG,HR,EMBED,OBJECT,CODE,TEXTAREA,IFRAME")) {
					return NodeFilter.FILTER_REJECT;
				}

				if (N_current.textContent.match(/^\s*$/u)) {
					return NodeFilter.FILTER_REJECT;
				}

				return NodeFilter.FILTER_ACCEPT;
			});

		const N_texts = [];
		let N_current;

		/* eslint-disable-next-line no-cond-assign */
		while (N_current = i_texts.nextNode()) {
			N_texts.push(N_current);
		}

		for (let index = 0; index < N_texts.length; index++) {
			const N_text = N_texts[index];

			replace_text(N_text);
		}
	};

	const main = () => {
		if (document.querySelector("#ek_kugi_style")) {
			toggle_styleSheet();
			return;
		}

		add_style_sheet();
		replace_texts();
	};

	main();
})();
