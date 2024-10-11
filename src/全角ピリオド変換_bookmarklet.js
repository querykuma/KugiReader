javascript: (() => {/* eslint-disable-line no-unused-labels */
	/**
	 * ブックマークレット名： 全角ピリオド変換（KugiReader補助）
	 * 概要： 全角ピリオド「．」と全角カンマ「，」を全角句読点「。、」に変換する。KugiReaderが動作するようにする補助ブックマークレット。
	 * v1.0.0 | MIT License Copyright (c) 2024 Query Kuma
	 */

	/**
	 * ターゲットノードを置換用ノードと置換する。
	 * @param {Node} N_target
	 * @param {Node[]|NodeList|Node} N_replaced_items
	 */
	const replace_node_with = (N_target, N_replaced_items) => {
		if (Array.isArray(N_replaced_items)
			|| N_replaced_items instanceof NodeList) {
			N_target.after(...N_replaced_items);
		} else {
			N_target.after(N_replaced_items);
		}

		N_target.remove();
	};

	const main = () => {
		let N_current;
		const i_texts = document.createNodeIterator(
			document.body,
			NodeFilter.SHOW_TEXT
		);

		/* eslint-disable-next-line no-cond-assign */
		while (N_current = i_texts.nextNode()) {

			if (N_current.textContent.match(/[．，]/u)) {
				replace_node_with(N_current,
					N_current.textContent.replaceAll(/[．，]/gu,
						(s_match) => s_match === "．" ? "。" : "、"));
			}
		}
	};

	main();
})();
