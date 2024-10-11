javascript: (() => {/* eslint-disable-line no-unused-labels */
	/**
	 * ブックマークレット名： KugiReader
	 * 日本語の区切り文字（句読点と括弧）を処理してネット記事を読みやすくするブックマークレットです。
	 * v1.0.0 | MIT License Copyright (c) 2024 Query Kuma
	 */

	const get_trustPolicy = () => {
		try {
			/* global trustedTypes */
			return trustedTypes.createPolicy("g_trustPolicy", { "createHTML": (s_html) => s_html });
		} catch (error) {
			return { "createHTML": (s_html) => s_html };
		}
	};

	const g_trustPolicy = get_trustPolicy();

	const add_style_sheet = () => {
		document.querySelector("#k_kugi_style")?.remove();

		document.head.insertAdjacentHTML("beforeend",
/*eslint-disable no-irregular-whitespace*/g_trustPolicy.createHTML(`
<style id="k_kugi_style">
.k_kuten {
	display: inline!important;
	float: unset!important;
	position: static!important;
	font-weight: bold;
	border-radius: 4px;
	margin-inline-start: 2px;
	margin-inline-end: 4px;
}
.k_touten {
	display: inline!important;
	float: unset!important;
	position: static!important;
	font-weight: bold;
	margin-inline-start: 2px;
	margin-inline-end: 8px;
}
.k_kuten.k_dark_color {
	color: #ddd;
	background: #464646;
	border: 1px #ddd dashed;
}
.k_touten.k_dark_color {
	color: #ddd;
	background: #5e5e5e;
}
.k_kuten.k_light_color,.k_touten.k_light_color {
	color: #333;
	background: #ccc;
	border: 1px #333 dashed;
}
.k_br {
	display: block;
	height: 1px;
	float: unset!important;
}
.k_space1,.k_space2,.k_space3,.k_space4 {
	display: inline!important;
	position: static!important;
	padding: 0!important;
}
.k_space_error:before {
	content: '　';
}
.k_space1:before {
	content: '　';
}
.k_space2:before {
	content: '　　';
}
.k_space3:before {
	content: '　　　';
}
.k_space4:before {
	content: '　　　　';
}
.k_kuten_br {
	content: "";
	display: block;
	position: relative;
	height: 0.75rem;
}
.k_kuten_br:before {
	content: "+";
	position: absolute;
	color: #afafaf;
	top:50%;
	transform: translateY(-50%);
	text-indent: 2rem;
	font-size: x-small;
}
.k_kuten_br.k_light_color:before {
	color: #ccc;
}
.k_kakko_l, .k_kakko_r {
	display: inline!important;
	font-size: inherit!important;
	position: static!important;
}
.k_kakko_l.k_dark_color {
	background-color: #94ffff;
	margin-inline-start: 1px;
	margin-inline-end: 2px;
}
.k_kakko_r.k_dark_color {
	background-color: #c8ff70;
	margin-inline-start: 2px;
	margin-inline-end: 1px;
}
.k_kakko_l.k_light_color {
	background-color: DarkSlateGray;
	margin-inline-start: 1px;
	margin-inline-end: 2px;
}
.k_kakko_r.k_light_color {
	background-color: #3c3909;
	margin-inline-start: 2px;
	margin-inline-end: 1px;
}
.k_noDisp {
	display: none;
}
.k_space_error {
	background-color: red;
}

dd {
	margin-block-end: 0.75rem;
}
body {
	line-height: 1.5;
}
</style>`)/*eslint-enable no-irregular-whitespace*/);
	};

	/**
	 * ターゲットノードをHTML文字列と置換する。
	 * @param {Node} N_target
	 * @param {string} s_html
	 */
	const replace_node_with_html = (N_target, s_html) => {
		const e_div = document.createElement("div");
		e_div.innerHTML = g_trustPolicy.createHTML(s_html);
		N_target.after(...e_div.childNodes);
		N_target.remove();
	};

	const 句読点と括弧を処理 = () => {
		/**
		 * パフォーマンス・チューニングのための変数M_tuneから.k_クラスを考慮しながら値を取得するget関数群。
		 */
		const get_checkVisibility = (e_target, M_tune) => e_target.matches(".k_kuten,.k_touten,.k_br,.k_space1,.k_space2,.k_space3,.k_space4,.k_kuten_br,.k_kakko_l,.k_kakko_r")
			|| M_tune.get(e_target).checkVisibility;

		const get_display = (e_target, M_tune) => e_target.matches(".k_kuten,.k_touten,.k_kakko_l,.k_kakko_r")
			? "inline"
			: M_tune.get(e_target).display;


		/**
		 * N_targetから開始して空白でないテキストノードか<STYLE>などでない初めての表示系要素を返す。
		 * nextSiblingとparentElementを辿る。
		 * 辿るときに、S_字下げの親 を超えない。
		 */
		const get_first_nonNull_Node = (N_target, S_字下げの親) => {
			let N_current = N_target;

			while (N_current) {
				switch (N_current.nodeType) {
					case Node.ELEMENT_NODE:
						if (["STYLE", "SCRIPT", "NOSCRIPT", "LINK", "SUP", "RUBY", "RB", "RP", "RT"].includes(N_current.tagName)) {
							break;
						}

						return N_current;

					case Node.TEXT_NODE:
						if (!N_current.textContent.match(/^\s*$/u)) {
							return N_current;
						}

						break;

					default:
						break;
				}

				while (!N_current.nextSibling
					&& !S_字下げの親.has(N_current.parentElement)) {

					N_current = N_current.parentElement;
				}

				N_current = N_current.nextSibling;
			}

			return null;
		};

		/**
		 * N_targetの次のノードから開始してget_first_nonNull_Node()を返す。
		 */
		const get_first_nonNull_nextNode = (N_target, S_字下げの親) => {
			let N_current = N_target;

			while (!N_current.nextSibling
				&& !S_字下げの親.has(N_current.parentElement)) {

				N_current = N_current.parentElement;
			}

			N_current = N_current.nextSibling;

			return get_first_nonNull_Node(N_current, S_字下げの親);
		};

		/**
		 * 要素の前景色が明るい色ならtrueを返す。相対輝度を計算して判定する。
		 * @param {Element} e_target
		 * @returns {boolean}
		 */
		const is_light_color = (e_target, M_tune) => {
			const { color } = M_tune.get(e_target);
			const [n_r, n_g, n_b] = color.match(/(\d+)/gu);
			return (0.2126 * n_r + 0.7152 * n_g + 0.0722 * n_b) > 0.5 * 255;
		};

		/**
		 * 字下げ用のクラス（k_space）ならtrueを返す。
		 * @param {Element} e_target
		 * @returns {boolean}
		 */
		const is_k_space = (e_target) => {
			if (!e_target) {
				return false;
			}

			if (e_target.nodeType !== Node.ELEMENT_NODE) {
				return false;
			}

			const I_classes = e_target.classList.values();
			let I_class;
			/* eslint-disable-next-line no-sequences */
			while ((I_class = I_classes.next()), !I_class.done) {
				if (I_class.value.startsWith("k_space")) {
					return true;
				}
			}

			return false;
		};

		/**
		 * 括弧用のクラス（k_kakko）ならtrueを返す。
		 */
		const is_k_kakko = (e_target) => {
			if (!e_target) {
				return false;
			}

			if (e_target.nodeType !== Node.ELEMENT_NODE) {
				return false;
			}

			const I_classes = e_target.classList.values();
			let I_class;
			/* eslint-disable-next-line no-sequences */
			while ((I_class = I_classes.next()), !I_class.done) {
				if (I_class.value.startsWith("k_kakko")) {
					return true;
				}
			}

			return false;
		};

		/**
		 * .k_brか<br>ならtrueを返す。pre-wrapのときテキストが改行を含んだ空白ならtrueを返す。
		 */
		const is_br = (e_target, M_tune) => {
			if (!e_target) {
				return false;
			}

			switch (e_target.nodeType) {
				case Node.ELEMENT_NODE:

					if (e_target.classList.contains("k_br")) {
						return true;
					}

					if (e_target.tagName === "BR") {
						return true;
					}

					return false;

				case Node.TEXT_NODE:
					if (e_target.textContent.match(/\n/u)
						&& e_target.textContent.match(/^\s+$/u)
						&& M_tune.get(e_target.parentElement).whiteSpace === "pre-wrap") {
						return true;
					}

					return false;

				default:
					return false;
			}
		};

		/**
		 * 最初の子孫が画像ならtrueを返す。
		 */
		const is_firstDescendant_image = (e_target) => {
			let e_first = e_target;

			while (e_first) {
				if (e_first.nodeType === Node.ELEMENT_NODE) {
					if (e_first.tagName === "IMG") {
						return true;
					}

					e_first = e_first.firstChild;
				} else {
					return false;
				}
			}

			return false;
		};

		const is_header = (N_target) => {
			if (!N_target) {
				return false;
			}

			if (N_target.nodeType !== Node.ELEMENT_NODE) {
				return false;
			}

			if (!["H1", "H2", "H3", "H4", "H5", "H6", "HGROUP"].includes(N_target.tagName)) {
				return false;
			}

			return true;
		};

		const ブロック系要素か = (e_target, M_tune) => {
			if (["IFRAME", "TEXTAREA", "FORM"].includes(e_target.tagName)) {
				return true;
			}

			const s_display = get_display(e_target, M_tune);

			if (s_display === "block") {
				return e_target === document.body
					|| get_display(e_target.parentElement, M_tune) !== "inline-flex";
			}

			return ["list-item", "table", "table-row", "table-cell", "flex", "grid", "-webkit-box"].includes(s_display);
		};

		const ブロック系要素か_チェック付き = (N_target, M_tune) => {
			if (!N_target) {
				return false;
			}

			if (N_target.nodeType !== Node.ELEMENT_NODE) {
				return false;
			}

			/**
			 * 途中で挿入した要素（.k_spaceや.k_br）はM_tuneに存在しないのでget_display（ブロック系要素）の前に除外する。
			 */
			if (is_k_space(N_target)) {
				return false;
			}

			if (is_br(N_target)) {
				return false;
			}

			return ブロック系要素か(N_target, M_tune);
		};

		const get_tune_map = () => {
			const M_tune = new Map();
			const i_body = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);

			let e_current;
			/* eslint-disable-next-line no-cond-assign */
			while (e_current = i_body.nextNode()) {
				const C_current = getComputedStyle(e_current);

				M_tune.set(e_current, {
					"display": C_current.display,
					"whiteSpace": C_current.whiteSpace,
					"flexDirection": C_current.flexDirection,
					"color": C_current.color,
					"float": C_current.float,
					"checkVisibility": e_current.checkVisibility({ "checkVisibilityCSS": true })
				});
			}

			return M_tune;
		};

		const get_字下げの親 = (M_tune) => {
			const S_字下げの親 = new Set();

			const i_body = document.createNodeIterator(document.body,
				NodeFilter.SHOW_ELEMENT,
				(N_current) => {
					if (N_current.closest("BR,SCRIPT,STYLE,NAV,NOSCRIPT,FOOTER,ASIDE,LINK,CANVAS,IMG,HR,EMBED,OBJECT,CODE,RT,H1,H2,H3,H4,H5,H6,HGROUP")) {
						return NodeFilter.FILTER_REJECT;
					}
					return NodeFilter.FILTER_ACCEPT;
				}
			);

			let e_current;
			/* eslint-disable-next-line no-cond-assign */
			while (e_current = i_body.nextNode()) {
				if (M_tune.get(e_current).float !== "none") {
					continue;
				}

				const s_display = get_display(e_current, M_tune);

				if (s_display === "block") {
					if (e_current === document.body
						|| get_display(e_current.parentElement, M_tune) !== "inline-flex") {
						S_字下げの親.add(e_current);
					}
				} else if (s_display === "list-item") {
					S_字下げの親.add(e_current);
				}
			}

			return S_字下げの親;
		};

		const update_区切り = (S_字下げの親, M_tune) => {
			/**
			 * 問題のあることが判明している文字についてHTML特殊文字に置換する。
			 */
			const escape_html = (s_text) => {
				const o_replace_table = {
					"&": "&amp;",
					"<": "&lt;",
					">": "&gt;"
				};

				return s_text.replaceAll(/[&<>]/gu, (s_match) => o_replace_table[s_match]);
			};

			/**
			 * 句点の直後にある閉じ括弧において括弧によってはハイライトしない。
			 * @returns {string}
			 */
			const get_閉じ括弧HTML = (s_閉じ括弧) => "）)".includes(s_閉じ括弧) ? s_閉じ括弧 : `<span class="k_kakko_r">${s_閉じ括弧}</span>`;

			/**
			 * replace_区切り_preWrap()とreplace_区切り_normal()はほとんど同じもの。whiteSpaceの扱いのみが異なる。
			 * whiteSpaceがpre-wrapの代表的なサイトはヤフーニュース。
			 */
			const replace_区切り_preWrap = (N_text, S_字下げの親_shadow) => {
				const s_target = N_text.textContent;

				/**
				 * replace_区切り_preWrap の r_区切り は「|\n+」を追加している。
				 */
				const r_区切り = /(([。、]+|[？！]+)|[「」｢｣《》『』＜＞])|\n+/gu;

				let n_pos_previous = 0;
				let m;
				let s_html = "";

				/* eslint-disable-next-line no-cond-assign */
				while (m = r_区切り.exec(s_target)) {
					const s_slice = s_target.slice(n_pos_previous, m.index);

					if (s_slice) {
						s_html += escape_html(s_slice);
					}

					const s_区切り = m[0];

					if ("\n".includes(s_区切り[0])) {
						s_html += `${s_区切り}<span class="k_br k_noDisp"></span>`;
					} else if ("「｢《『＜".includes(s_区切り[0])) {
						/**
						 * 左括弧をハイライトする。
						 */
						s_html += `<span class="k_kakko_l">${s_区切り}</span>`;
					} else if ("」｣》』＞".includes(s_区切り[0])) {
						/**
						 * 右括弧をハイライトする。
						 */
						s_html += `<span class="k_kakko_r">${s_区切り}</span>`;
					} else if ("。？！".includes(s_区切り[0])) {
						/**
						 * 句点の場合。
						 */

						const b_headerOrRt_descendant = N_text.parentElement.closest("H1,H2,H3,H4,H5,H6,HGROUP,RT");

						const s_閉じ括弧 = s_target[r_区切り.lastIndex];

						if (b_headerOrRt_descendant) {
							/**
							 * ヘッダーの場合、改行しない。
							 */
							s_html += `<span class="k_kuten">${s_区切り}</span>`;
						} else if (s_閉じ括弧 && "）)」｣》』＞".includes(s_閉じ括弧)) {
							/**
							 * 句読点の後に閉じ括弧がある場合。
							 */

							r_区切り.lastIndex++;

							const s_rest = s_target.slice(r_区切り.lastIndex);
							if (s_rest.match(/^[ \t]*$/u)) {
								/**
								 * テキストの最後までマッチした場合。
								 */
								const N_next = get_first_nonNull_nextNode(N_text, S_字下げの親_shadow);
								const e_next_br = (N_next && N_next.nodeType === Node.ELEMENT_NODE && N_next.tagName === "BR") ? N_next : false;

								if (N_next) {
									if (e_next_br) {
										/**
										 * 次の要素が<br>と同等の場合。
										 */
										s_html += `<span class="k_kuten">${s_区切り}</span>${get_閉じ括弧HTML(s_閉じ括弧)}`;

										const N_next_2 = get_first_nonNull_nextNode(e_next_br, S_字下げの親_shadow);

										/**
										 * <br><br>の場合を除いて次の<br>同等要素のクラスにk_kuten_brを追加する。
										 */
										if (!N_next_2 || N_next_2.nodeType !== Node.ELEMENT_NODE || N_next_2.tagName !== "BR") {
											e_next_br.classList.add("k_kuten_br");
										}
									} else if (ブロック系要素か_チェック付き(N_next, M_tune)) {
										/**
										 * 次の要素が<ol>か<ul>などの場合。
										 */
										s_html += `<span class="k_kuten">${s_区切り}</span>${get_閉じ括弧HTML(s_閉じ括弧)}`;
									} else {
										/**
										 * そうでなければ、閉じ括弧の後で改行する。
										 */
										s_html += `<span class="k_kuten">${s_区切り}</span>${get_閉じ括弧HTML(s_閉じ括弧)}<span class="k_br"></span>`;
									}
								} else {
									/**
									 * get_first_nonNull_nextNode()が存在しない場合、閉じ括弧の後で改行しない。
									 */
									s_html += `<span class="k_kuten">${s_区切り}</span>${get_閉じ括弧HTML(s_閉じ括弧)}`;
								}

							} else if (s_rest[0] && "。、？！".includes(s_rest[0])) {
								/**
								 * 以降、残りのテキストがある場合。
								 * かつ閉じ括弧の後に句読点が来る場合、閉じ括弧の後で改行しない。
								 */
								s_html += `<span class="k_kuten">${s_区切り}</span>${get_閉じ括弧HTML(s_閉じ括弧)}`;
							} else {
								/**
								 * そうでなければ、閉じ括弧の後で改行する。
								 */
								s_html += `<span class="k_kuten">${s_区切り}</span>${get_閉じ括弧HTML(s_閉じ括弧)}<span class="k_br"></span>`;
							}

						} else if (s_target.slice(r_区切り.lastIndex).match(/^[ \t]*$/u)) {
							/**
							 * テキストの最後までマッチした場合。
							 */
							const N_next = get_first_nonNull_nextNode(N_text, S_字下げの親_shadow);
							const e_next_br = (N_next && N_next.nodeType === Node.ELEMENT_NODE && N_next.tagName === "BR") ? N_next : false;

							if (N_next) {
								if (e_next_br) {
									/**
									 * 次の要素が<br>と同等の場合。
									 */
									s_html += `<span class="k_kuten">${s_区切り}</span>`;

									const N_next_2 = get_first_nonNull_nextNode(e_next_br, S_字下げの親_shadow);

									/**
									 * <br><br>の場合を除いて次の<br>同等要素のクラスにk_kuten_brを追加する。
									 */
									if (!N_next_2 || N_next_2.nodeType !== Node.ELEMENT_NODE || N_next_2.tagName !== "BR") {
										e_next_br.classList.add("k_kuten_br");
									}
								} else if (ブロック系要素か_チェック付き(N_next, M_tune)) {
									/**
									 * 次の要素が<ol>か<ul>などの場合。
									 */
									s_html += `<span class="k_kuten">${s_区切り}</span>`;
								} else if (N_next.textContent.match(/^\s*[）)」｣》』＞]/u)) {
									/**
									 * get_first_nonNull_nextNode()に閉じ括弧がある場合。
									 */
									s_html += `<span class="k_kuten">${s_区切り}</span>`;
								} else {
									s_html += `<span class="k_kuten">${s_区切り}</span><span class="k_br"></span>`;
								}
							} else {
								/**
								 * get_first_nonNull_nextNode()が存在しない場合。
								 */
								s_html += `<span class="k_kuten">${s_区切り}</span>`;
							}

						} else if (s_target.slice(r_区切り.lastIndex).match(/^((?!\n).)*?\S/su)) {
							/**
							 * 後続の文字列において行頭までに改行が存在しないなら改行を挿入する。
							 */
							s_html += `<span class="k_kuten">${s_区切り}</span><span class="k_br"></span>`;
						} else {
							/**
							 * k_noDispは非表示で改行は表示されない。k_brの位置を示すために挿入する。
							 */
							s_html += `<span class="k_kuten">${s_区切り}</span><span class="k_br k_noDisp"></span>`;
						}
					} else {
						/**
						 * 読点の場合。
						 */
						s_html += `<span class="k_touten">${s_区切り}</span>`;
					}

					n_pos_previous = r_区切り.lastIndex;
				}

				if (!s_html) {
					/**
					 * 行頭が空白だった場合。
					 */
					if (N_text.textContent !== s_target) {
						N_text.textContent = escape_html(s_target);
					}

					return;
				}

				if (n_pos_previous !== s_target.length) {
					s_html += escape_html(s_target.slice(n_pos_previous));
				}

				/**
				 * 後ろに改行のある"k_br k_noDisp"を削除する。
				 */
				s_html = s_html.replaceAll(/<span class="k_br k_noDisp"><\/span>(?=\n)/gu, "");

				replace_node_with_html(N_text, s_html);
			};

			const replace_区切り_normal = (N_text, S_字下げの親_shadow) => {
				const s_target = N_text.textContent;

				/**
				 * replace_区切り_normal の r_区切り は「|\n+」を削除している。
				 */
				const r_区切り = /(([。、]+|[？！]+)|[「」｢｣《》『』＜＞])/gu;

				let n_pos_previous = 0;
				let m;
				let s_html = "";

				/* eslint-disable-next-line no-cond-assign */
				while (m = r_区切り.exec(s_target)) {
					const s_slice = s_target.slice(n_pos_previous, m.index);

					if (s_slice) {
						s_html += escape_html(s_slice);
					}

					const s_区切り = m[0];

					if ("「｢《『＜".includes(s_区切り[0])) {
						/**
						 * 左括弧をハイライトする。
						 */
						s_html += `<span class="k_kakko_l">${s_区切り}</span>`;
					} else if ("」｣》』＞".includes(s_区切り[0])) {
						/**
						 * 右括弧をハイライトする。
						 */
						s_html += `<span class="k_kakko_r">${s_区切り}</span>`;
					} else if ("。？！".includes(s_区切り[0])) {
						/**
						 * 句点の場合。
						 */

						const b_headerOrRt_descendant = N_text.parentElement.closest("H1,H2,H3,H4,H5,H6,HGROUP,RT");

						const s_閉じ括弧 = s_target[r_区切り.lastIndex];

						if (b_headerOrRt_descendant) {
							/**
							 * ヘッダーの場合、改行しない。
							 */
							s_html += `<span class="k_kuten">${s_区切り}</span>`;
						} else if (s_閉じ括弧 && "）)」｣》』＞".includes(s_閉じ括弧)) {
							/**
							 * 句読点の後に閉じ括弧がある場合。
							 */

							r_区切り.lastIndex++;

							const s_rest = s_target.slice(r_区切り.lastIndex);

							if (s_rest.match(/^[ \t\n]*$/u)) {
								/**
								 * テキストの最後までマッチした場合。
								 */
								const N_next = get_first_nonNull_nextNode(N_text, S_字下げの親_shadow);
								const e_next_br = (N_next && N_next.nodeType === Node.ELEMENT_NODE && N_next.tagName === "BR") ? N_next : false;

								if (N_next) {
									if (e_next_br) {
										/**
										 * 次の要素が<br>と同等の場合。
										 */
										s_html += `<span class="k_kuten">${s_区切り}</span>${get_閉じ括弧HTML(s_閉じ括弧)}`;

										const N_next_2 = get_first_nonNull_nextNode(e_next_br, S_字下げの親_shadow);

										/**
										 * <br><br>の場合を除いて次の<br>同等要素のクラスにk_kuten_brを追加する。
										 */
										if (!N_next_2 || N_next_2.nodeType !== Node.ELEMENT_NODE || N_next_2.tagName !== "BR") {
											e_next_br.classList.add("k_kuten_br");
										}
									} else if (ブロック系要素か_チェック付き(N_next, M_tune)) {
										/**
										 * 次の要素が<ol>か<ul>などの場合。
										 */
										s_html += `<span class="k_kuten">${s_区切り}</span>${get_閉じ括弧HTML(s_閉じ括弧)}`;
									} else {
										/**
										 * そうでなければ、閉じ括弧の後で改行する。
										 */
										s_html += `<span class="k_kuten">${s_区切り}</span>${get_閉じ括弧HTML(s_閉じ括弧)}<span class="k_br"></span>`;
									}
								} else {
									/**
									 * get_first_nonNull_nextNode()が存在しない場合、閉じ括弧の後で改行しない。
									 */
									s_html += `<span class="k_kuten">${s_区切り}</span>${get_閉じ括弧HTML(s_閉じ括弧)}`;
								}

							} else if (s_rest[0] && "。、？！".includes(s_rest[0])) {
								/**
								 * 以降、残りのテキストがある場合。
								 * かつ閉じ括弧の後に句読点が来る場合、閉じ括弧の後で改行しない。
								 */
								s_html += `<span class="k_kuten">${s_区切り}</span>${get_閉じ括弧HTML(s_閉じ括弧)}`;
							} else {
								/**
								 * そうでなければ、閉じ括弧の後で改行する。
								 */
								s_html += `<span class="k_kuten">${s_区切り}</span>${get_閉じ括弧HTML(s_閉じ括弧)}<span class="k_br"></span>`;
							}

						} else if (s_target.slice(r_区切り.lastIndex).match(/^[ \t\n]*$/u)) {
							/**
							 * テキストの最後までマッチした場合。
							 */
							const N_next = get_first_nonNull_nextNode(N_text, S_字下げの親_shadow);
							const e_next_br = (N_next && N_next.nodeType === Node.ELEMENT_NODE && N_next.tagName === "BR") ? N_next : false;

							if (N_next) {
								if (e_next_br) {
									/**
									 * 次の要素が<br>と同等の場合。
									 */
									s_html += `<span class="k_kuten">${s_区切り}</span>`;

									const N_next_2 = get_first_nonNull_nextNode(e_next_br, S_字下げの親_shadow);

									/**
									 * <br><br>の場合を除いて次の<br>同等要素のクラスにk_kuten_brを追加する。
									 */
									if (!N_next_2 || N_next_2.nodeType !== Node.ELEMENT_NODE || N_next_2.tagName !== "BR") {
										e_next_br.classList.add("k_kuten_br");
									}
								} else if (ブロック系要素か_チェック付き(N_next, M_tune)) {
									/**
									 * 次の要素が<ol>か<ul>などの場合。
									 */
									s_html += `<span class="k_kuten">${s_区切り}</span>`;
								} else if (N_next.textContent.match(/^\s*[）)」｣》』＞]/u)) {
									/**
									 * get_first_nonNull_nextNode()に閉じ括弧がある場合。
									 */
									s_html += `<span class="k_kuten">${s_区切り}</span>`;
								} else {
									s_html += `<span class="k_kuten">${s_区切り}</span><span class="k_br"></span>`;
								}
							} else {
								/**
								 * get_first_nonNull_nextNode()が存在しない場合。
								 */
								s_html += `<span class="k_kuten">${s_区切り}</span>`;
							}

						} else {
							s_html += `<span class="k_kuten">${s_区切り}</span><span class="k_br"></span>`;
						}
					} else {
						/**
						 * 読点の場合。
						 */
						s_html += `<span class="k_touten">${s_区切り}</span>`;
					}

					n_pos_previous = r_区切り.lastIndex;
				}

				if (!s_html) {
					/**
					 * 行頭が空白だった場合。
					 */
					if (N_text.textContent !== s_target) {
						N_text.textContent = escape_html(s_target);
					}

					return;
				}

				if (n_pos_previous !== s_target.length) {
					s_html += escape_html(s_target.slice(n_pos_previous));
				}

				replace_node_with_html(N_text, s_html);
			};

			const replace_区切り = (N_text, S_字下げの親_shadow, M_tune_shadow) => {
				const b_preWrap = M_tune_shadow.get(N_text.parentElement).whiteSpace === "pre-wrap";

				if (b_preWrap) {
					replace_区切り_preWrap(N_text, S_字下げの親_shadow);
				} else {
					replace_区切り_normal(N_text, S_字下げの親_shadow);
				}
			};

			const get_all_textNodes = () => {
				const i_texts = document.createNodeIterator(
					document.body,
					NodeFilter.SHOW_TEXT
				);
				const N_texts = [];
				let N_current;

				/* eslint-disable-next-line no-cond-assign */
				while (N_current = i_texts.nextNode()) {

					if (N_current.parentElement.closest(".k_kuten,.k_touten,BR,SCRIPT,STYLE,NAV,NOSCRIPT,FOOTER,ASIDE,LINK,CANVAS,IMG,HR,EMBED,OBJECT,CODE,TEXTAREA,IFRAME")) {
						continue;
					}

					if (!get_checkVisibility(N_current.parentElement, M_tune)) {
						continue;
					}

					N_texts.push(N_current);
				}

				return N_texts;
			};

			const N_texts = get_all_textNodes();

			for (let index = 0; index < N_texts.length; index++) {
				const N_text = N_texts[index];
				replace_区切り(N_text, S_字下げの親, M_tune);
			}
		};

		const delete_最初の空白の子 = (S_字下げの親, M_tune) => {
			const I_keys = S_字下げの親.keys();
			let I_key;

			/* eslint-disable-next-line no-sequences */
			while ((I_key = I_keys.next()), !I_key.done) {
				const e_parent = I_key.value;

				const b_preWrap = M_tune.get(e_parent).whiteSpace === "pre-wrap";
				if (b_preWrap) {
					continue;
				}

				const N_first = e_parent.firstChild;
				if (N_first && N_first.nodeType === Node.TEXT_NODE
					&& N_first.textContent.match(/^\s*$/u)) {
					N_first.remove();
				}
			}
		};

		const 括弧に応じて字下げ挿入 = (S_字下げの親, M_tune) => {
			/**
			 * n_括弧_sum の数に応じて空白を空けた字下げ用のhtmlを返す。
			 */
			const make_空白html = (n_括弧_sum) => {
				let s_html;

				if (n_括弧_sum < 0) {
					console.log(`0未満の値は予期されません。n_括弧_sum = ${n_括弧_sum}`);

					return "<span class=\"k_space_error\"></span>";
				}

				switch (n_括弧_sum) {
					case 0:
						s_html = "<span class=\"k_space1\"></span>";
						break;

					case 1:
						s_html = "<span class=\"k_space2\"></span>";
						break;

					case 2:
						s_html = "<span class=\"k_space3\"></span>";
						break;

					default:
						s_html = "<span class=\"k_space4\"></span>";
						break;
				}

				return s_html;
			};

			/**
			 * s_累積 にある「開始括弧の数－閉じ括弧の数」を計算する。
			 * @returns {number}
			 */
			const count_括弧_sum = (s_累積) => {
				/**
				 * 文字列s_input内にある文字s_targetの数を返す。
				 * @returns {number}
				 */
				const count_letters_in_string = (s_input, s_target) => {
					/**
					 * `[${s_target}]`とするのは")"の場合にエスケープが必要なため。
					 */
					const r_letter = new RegExp(`[${s_target}]`, "gu");
					const m = s_input.match(r_letter);
					return m?.length ?? 0;
				};

				/**
				 * 文字列s_input内にある複数文字s_targetsの数を返す。
				 * @returns {number}
				 */
				const count_letters_in_strings = (s_input, s_targets) => {
					let n_sum_count_letters = 0;

					for (let index = 0; index < s_targets.length; index++) {
						const s_target = s_targets[index];
						n_sum_count_letters += count_letters_in_string(s_input, s_target);
					}

					return n_sum_count_letters;
				};

				const n_括弧_start = count_letters_in_strings(s_累積, "（(「｢《『＜");
				const n_括弧_close = count_letters_in_strings(s_累積, "）)」｣》』＞");
				const n_括弧_sum = n_括弧_start - n_括弧_close;

				return n_括弧_sum;
			};

			const 空白テキストを除いて最初の子か = (N_target) => {
				let N_current = N_target.previousSibling;

				while (N_current) {
					switch (N_current.nodeType) {
						case Node.TEXT_NODE:
							if (!N_current.textContent.match(/^\s*$/u)) {
								return false;
							}
							break;

						case Node.ELEMENT_NODE:
							if (!["STYLE", "SCRIPT", "NOSCRIPT", "LINK"].includes(N_current.tagName)) {
								return false;
							}
							break;

						default:
							break;
					}

					N_current = N_current.previousSibling;
				}

				return true;
			};

			const 祖先が改行要素で最初の子か = (N_target, S_字下げの親_shadow) => {
				let e_parent = N_target.parentElement;

				while (e_parent) {
					if (!空白テキストを除いて最初の子か(N_target)) {
						return false;
					}

					if (S_字下げの親_shadow.has(e_parent)) {
						return true;
					}

					N_target = e_parent;
					e_parent = e_parent.parentElement;
				}

				return false;
			};

			const nodeIterator = document.createNodeIterator(
				document.body,
				NodeFilter.SHOW_ALL,
				function (N_current) {
					if (N_current.nodeType === Node.TEXT_NODE) {

						if (N_current.parentElement.closest("SCRIPT,STYLE,NAV,NOSCRIPT,FOOTER,ASIDE,LINK,CANVAS,IMG,HR,EMBED,OBJECT,CODE,TEXTAREA,IFRAME")) {
							return NodeFilter.FILTER_REJECT;
						}

						if (!get_checkVisibility(N_current.parentElement, M_tune)) {
							return NodeFilter.FILTER_REJECT;
						}

						return NodeFilter.FILTER_ACCEPT;
					} else if (is_br(N_current, M_tune)) {

						if (!get_checkVisibility(N_current, M_tune)) {
							return NodeFilter.FILTER_REJECT;
						}

						return NodeFilter.FILTER_ACCEPT;
					} else if (is_header(N_current)) {

						if (!get_checkVisibility(N_current, M_tune)) {
							return NodeFilter.FILTER_REJECT;
						}

						return NodeFilter.FILTER_ACCEPT;
					}
				}
			);

			const N_items = [];
			let N_temp;

			/* eslint-disable-next-line no-cond-assign */
			while (N_temp = nodeIterator.nextNode()) {
				N_items.push(N_temp);
			}

			let s_累積 = "";
			let n_括弧_sum = 0;

			OUTER:
			for (let index = 0; index < N_items.length; index++) {
				const N_item = N_items[index];

				if (N_item.nodeType === Node.TEXT_NODE) {

					if (祖先が改行要素で最初の子か(N_item, S_字下げの親, M_tune)) {
						/**
						 * 祖先が改行要素で最初の子だった場合、文頭に字下げを挿入する場合と挿入しない場合がある。
						 * 文頭に字下げを挿入する場合は、文頭に字下げを挿入した後で s_累積 を N_item.textContent で初期化する必要がある。
						 * 括弧の数を数えるにあたって現在の N_item.textContent の値を考慮しないからである。
						 * しかし、文頭に字下げを挿入しない場合は、continueで抜ける前に s_累積 に N_item.textContent を加算する必要がある。
						 * 現在の N_item.textContent の値を、次に文頭に字下げを挿入するときに使うからである。
						 */

						const N_nonNull = get_first_nonNull_Node(N_item, S_字下げの親);

						if (N_nonNull
							&& N_nonNull.nodeType === Node.ELEMENT_NODE
							&& ブロック系要素か_チェック付き(N_nonNull, M_tune)) {
							s_累積 += N_item.textContent;
							continue;
						}

						if (N_item.textContent.match(/^\s*$/u)) {
							s_累積 += N_item.textContent;
							continue;
						}

						let e_parent = N_item.parentElement;
						/**
						 * 多重ループ
						 */
						while (e_parent) {
							if (S_字下げの親.has(e_parent)) {
								break;
							}

							if (ブロック系要素か(e_parent, M_tune)) {
								s_累積 += N_item.textContent;
								continue OUTER;
							}

							e_parent = e_parent.parentElement;
						}
						e_parent = e_parent ?? N_item.parentElement;

						const e_parent_parent = e_parent === document.body ? null : e_parent.parentElement;
						if (e_parent_parent
							&& (get_display(e_parent_parent, M_tune) === "flex"
								&& M_tune.get(e_parent_parent).flexDirection === "row"
								|| get_display(e_parent_parent, M_tune) === "grid")) {
							s_累積 += N_item.textContent;
							continue;
						}

						n_括弧_sum += count_括弧_sum(s_累積);
						n_括弧_sum = n_括弧_sum < 0 ? 0 : n_括弧_sum;
						s_累積 = N_item.textContent;

						let e_parent2 = N_item.parentElement;
						while (is_k_kakko(e_parent2)) {
							e_parent2 = e_parent2.parentElement;
						}

						e_parent2.insertAdjacentHTML("afterbegin", g_trustPolicy.createHTML(make_空白html(n_括弧_sum)));

					} else if (ブロック系要素か_チェック付き(N_item.previousSibling, M_tune)) {
						/**
						 * 前のノードが改行要素ならN_itemの前に字下げをする。
						 */

						const e_parent = N_item.parentElement;
						if (e_parent
							&& (["flex", "grid"].includes(get_display(e_parent, M_tune)))) {
							s_累積 += N_item.textContent;
							continue;
						}

						if (N_item.textContent.match(/^\s*$/u)) {
							s_累積 += N_item.textContent;
							continue;
						}

						if (N_item.previousSibling.textContent.match(/^\s*$/u)) {
							s_累積 += N_item.textContent;
							continue;
						}

						n_括弧_sum += count_括弧_sum(s_累積);
						n_括弧_sum = n_括弧_sum < 0 ? 0 : n_括弧_sum;
						s_累積 = N_item.textContent;

						N_item.previousSibling.insertAdjacentHTML("afterend", g_trustPolicy.createHTML(make_空白html(n_括弧_sum)));
					} else {
						s_累積 += N_item.textContent;
					}
				} else if (is_header(N_item)) {
					/**
					 * ヘッダを超えた場合、括弧の数をリセットする。
					 */
					s_累積 = "";
					n_括弧_sum = 0;

				} else {
					/**
					 * N_itemがis_br要素のとき。
					 */
					const N_next = get_first_nonNull_nextNode(N_item, S_字下げの親);

					if (!N_next) {
						continue;
					}

					if (is_br(N_next, M_tune)) {
						continue;
					}

					if (N_next && N_next.nodeType === Node.ELEMENT_NODE
						&& ブロック系要素か(N_next, M_tune)) {
						continue;
					}

					if (is_firstDescendant_image(N_next)) {
						continue;
					}

					n_括弧_sum += count_括弧_sum(s_累積);
					n_括弧_sum = n_括弧_sum < 0 ? 0 : n_括弧_sum;
					s_累積 = "";

					N_item.insertAdjacentHTML("afterend", g_trustPolicy.createHTML(make_空白html(n_括弧_sum)));
				}
			}
		};

		const delete_kSpace次の文頭空白 = () => {

			const get_kSpace_number = (e_target) => {
				const I_classes = e_target.classList.values();
				let I_class;
				/* eslint-disable-next-line no-sequences */
				while ((I_class = I_classes.next()), !I_class.done) {
					const m = I_class.value.match(/^k_space(\d+)$/u);
					if (m) {
						return m[1];
					}
				}
			};

			const e_spaces = document.querySelectorAll(".k_space1,.k_space2,.k_space3,.k_space4");
			for (let index = 0; index < e_spaces.length; index++) {
				const e_space = e_spaces[index];
				const N_next = e_space.nextSibling;

				if (!N_next) {
					continue;
				}

				if (N_next.nodeType !== Node.TEXT_NODE) {
					continue;
				}

				/**
				 * 次のノードの文頭の空白（半角空白とタブと改行）を削除する。
				 * さらに字下げクラス名にある数値（字下げする全角空白の数）に応じて全角空白を削除する。
				 */
				/* eslint-disable-next-line no-irregular-whitespace */
				if (N_next.textContent.match(/^[ \t\n　]/u)) {

					const n_space = get_kSpace_number(e_space);

					switch (n_space) {
						case "1":
							/* eslint-disable-next-line no-irregular-whitespace */
							N_next.textContent = N_next.textContent.replace(/^[ \t\n]*　{0,1}/u, "");
							break;

						case "2":
							/* eslint-disable-next-line no-irregular-whitespace */
							N_next.textContent = N_next.textContent.replace(/^[ \t\n]*　{0,2}/u, "");
							break;

						case "3":
							/* eslint-disable-next-line no-irregular-whitespace */
							N_next.textContent = N_next.textContent.replace(/^[ \t\n]*　{0,3}/u, "");
							break;

						case "4":
							/* eslint-disable-next-line no-irregular-whitespace */
							N_next.textContent = N_next.textContent.replace(/^[ \t\n]*　{0,4}/u, "");
							break;

						default:
							console.log(`switchにおいて予期されない値です。n_space=${n_space}`);
							break;
					}

				}
			}
		};

		const 前景色の明るさに応じてクラス追加 = (M_tune) => {
			const e_targets = document.querySelectorAll(".k_kuten,.k_touten,.k_kuten_br,.k_kakko_l,.k_kakko_r");

			for (let index = 0; index < e_targets.length; index++) {
				const e_target = e_targets[index];

				if (e_target.classList.contains("k_light_color")
					|| e_target.classList.contains("k_dark_color")) {
					continue;
				}

				if (is_light_color(e_target.parentElement, M_tune)) {
					e_target.classList.add("k_light_color");
				} else {
					e_target.classList.add("k_dark_color");
				}
			}
		};


		/**
		 * 	パフォーマンス・チューニングのためにgetComputedStyleとcheckVisibilityの結果を保存するMapを作る。
		 */
		const M_tune = get_tune_map();

		/**
		 * 最初の子を字下げする要素（block要素とlist-item要素）の集合を調べる。
		 */
		const S_字下げの親 = get_字下げの親(M_tune);

		/**
		 * １．祖先が<STYLE>などでないテキストノードを取得する。
		 * ２．区切り文字の正規表現でマッチさせる。
		 * ３．句読点を<span class="k_kuten">や<span class="k_touten">で囲む。
		 * ４．句点のときは<span class="k_br">を追加する。
		 * ５．括弧を<span class="k_kakko_l">や<span class="k_kakko_r">で囲む。
		 */
		update_区切り(S_字下げの親, M_tune);

		/**
		 * S_字下げの親 の最初の子がテキストノードで空白のみなら削除する。
		 */
		delete_最初の空白の子(S_字下げの親, M_tune);

		/**
		 * １．すべてのノードを取得する。
		 * ２．括弧の段数に応じて文頭に字下げ（k_space）を挿入する。
		 * ３．S_字下げの親 の最初の子に字下げを挿入する。
		 * ４．改行の後に字下げを挿入する。
		 * ５．ブロック系要素の次に字下げを挿入する。
		 */
		括弧に応じて字下げ挿入(S_字下げの親, M_tune);

		/**
		 * 字下げ（k_space）の次のテキストの文頭の空白を削除する。
		 */
		delete_kSpace次の文頭空白();

		/**
		 * 前景色が明るい色か暗い色かに応じて、クラスにk_light_colorかk_dark_colorを追加する。
		 */
		前景色の明るさに応じてクラス追加(M_tune);
	};

	const get_scroll_position = () => {
		const find_base_element = () => {
			const is_position_staticRelative = (e_temp) => {
				while (e_temp) {
					if (!["static", "relative"].includes(getComputedStyle(e_temp).position)) {
						return false;
					}

					e_temp = e_temp.parentElement;
				}

				return true;
			};

			/**
			 * すべての要素の座標のうち、祖先要素のpositionがすべてstaticかrelativeで、画面上に近い要素を取得する。
			 */
			const e_items = [...document.querySelectorAll("*")].filter((e_temp) => {
				const o_temp = e_temp.getBoundingClientRect();

				return o_temp.width !== 0
					&& o_temp.top >= 0
					&& o_temp.top < document.documentElement.clientHeight / 2
					&& is_position_staticRelative(e_temp);
			});

			return e_items[0];
		};

		const e_base = find_base_element();

		return {
			e_base,
			"n_base_top": e_base?.getBoundingClientRect().top
		};
	};

	const restore_scroll_position = (o_position) => {
		const n_base_top2 = o_position.e_base?.getBoundingClientRect().top;

		if (!o_position.e_base || Math.abs(n_base_top2 - o_position.n_base_top) < 50) {
			return;
		}

		scrollTo(0, document.documentElement.scrollTop + n_base_top2 - o_position.n_base_top);
	};

	const toggle_styleSheet = () => {
		const e_style = document.querySelector("#k_kugi_style");

		if (e_style.firstChild) {
			e_style.replaceChildren();
		} else {
			add_style_sheet();
		}
	};

	const main = () => {
		/**
		 * 画面上端に最も近い要素のスクロール位置を取得する。
		 */
		const o_position = get_scroll_position();

		if (document.querySelector("#k_kugi_style")) {
			/**
			 * 適用済みならスタイルシートの中身を削除する。
			 * スタイルシート削除済みならスタイルシートを追加する。
			 */
			toggle_styleSheet();

			/**
			 * 基準要素のスクロール位置が大きく変わったらスクロール位置を元に戻す。
			 */
			restore_scroll_position(o_position);

			return;
		}

		add_style_sheet();

		/**
		 * 句読点と括弧ハイライトし、改行と字下げを挿入する。
		 */
		句読点と括弧を処理();

		restore_scroll_position(o_position);
	};

	console.time();
	main();
	console.timeEnd();
})();
