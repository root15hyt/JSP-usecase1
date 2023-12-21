console.log("index.js: loaded");

// エラーハンドリングのためにエントリーポイントを設ける。
// fetchUserInfo関数から返されたPromiseオブジェクトを、main関数でエラーハンドリングしてログを出力する。
async function main() {
    try {
        // HTMLの入力から受け取ったIDをfetchUserInfoに引き渡す。
        const userId = getUserId();
        const userInfo = await fetchUserInfo(userId);
        // ここではJSONオブジェクトで解決されるPromise
        const view = createView(userInfo);
        // ここではHTML文字列で解決されるPromise
        displayView(view);
    // Promiseチェーンでエラーがあった場合はキャッチされる
    // HTTP通信でのエラーはNetworkErrorオブジェクトでrejectされたPromiseが返される。errorをcatchする。 
    } catch (error) {
        // Promiseチェーンの中で発生したエラーを受け取る。
        console.error(`エラーが発生しました (${error})`);
    }
}

// GitHubからユーザー情報を取得する関数fetchUserInfoを定義する。
function fetchUserInfo(userId) {
    // 指定したGitHubユーザーIDの情報を取得するURLに対してfetchメソッドで、GETのHTTPリクエストを行う。
    // fetchメソッドはPromiseを返す。Promiseインスタンスはリクエストのレスポンスを表すResponseオブジェクトでresolveされる。
    // 送信したリクエストにレスポンスが返却されると、thenコールバックが呼び出される。
    return fetch(`https://api.github.com/users/${encodeURIComponent(userId)}`)
        .then(response => {
            // Responseオブジェクトのstatusプロパティからは、HTTPレスポンスのステータスコードが取得できる。 -> 200
            console.log(response.status);
            // エラーレスポンスが返されたことを検知する
            // Responseオブジェクトのokプロパティは、HTTPステータスコードが200番台であればtrueを返し、それ以外ならfalseを返す。
            if (!response.ok) {
                // エラーレスポンスからRejectedなPromiseを作成して返す
                return Promise.reject(new Error(`${response.status}:
                                                ${response.statusText}`));
            } else {
                return response.json();
            };
        });
}

// HTMLのinputタグに入力されたIDをJSに引き渡す関数
function getUserId() {
    const value = document.getElementById("userId").value;
    return encodeURIComponent(value);
}

// HTML文字列を組み立てるcreateView関数
function createView(userInfo) {
    return  escapeHTML`
    <h4>${userInfo.name} (@${userInfo.login})</h4>
    <img src="${userInfo.avatar_url}" alt="${userInfo.login}" height="100">
    <dl>
        <dt>Location</dt>
        <dd>${userInfo.location}</dd>
        <dt>Repositories</dt>
        <dd>${userInfo.public_repos}</dd>
    </dl>
    `;
}

// HTMLを表示するdisplayView関数
function displayView(view) {
    // document.getElementByIdメソッドを使い、id属性が設定された要素にアクセスする。
    // div#result要素が取得できたら、生成したHTML文字列をinnerHTMLプロパティにセットする。
    const result = document.getElementById("result");
    result.innerHTML = view;
}

// GitHubユーザーネームの記号がHTMLとして解釈されないようにするエスケープ（通常はライブラリが提供する機能を使用する）。
function escapeSpecialChars(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
// 文字列リテラルと値が元の順番通りに並ぶように文字列を組み立てつつ、値が文字列であればエスケープするタグ関数。
function escapeHTML(strings, ...values) {
    return strings.reduce((result, str, i) => {
        const value = values[i - 1];
        if (typeof value === "string") {
            return result + escapeSpecialChars(value) + str;
        } else {
            return result + String(value) + str;
        }
    });
}

