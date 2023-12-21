console.log("index.js: loaded");

// エラーハンドリングのためにエントリーポイントを設ける。
function main() {
    fetchUserInfo("js-primer-example")
}


// GitHubからユーザー情報を取得する関数fetchUserInfoを定義する。
function fetchUserInfo(userId) {
    // 指定したGitHubユーザーIDの情報を取得するURLに対してfetchメソッドで、GETのHTTPリクエストを行う。
    // fetchメソッドはPromiseを返す。Promiseインスタンスはリクエストのレスポンスを表すResponseオブジェクトでresolveされる。
    // 送信したリクエストにレスポンスが返却されると、thenコールバックが呼び出される。
    fetch(`https://api.github.com/users/${encodeURIComponent(userId)}`)
        .then(response => {
            // Responseオブジェクトのstatusプロパティからは、HTTPレスポンスのステータスコードが取得できる。 -> 200
            console.log(response.status);
            // エラーレスポンスが返されたことを検知する
            // Responseオブジェクトのokプロパティは、HTTPステータスコードが200番台であればtrueを返し、それ以外ならfalseを返す。
            if (!response.ok) {
                console.log("エラーレスポンス", response);
            } else {
                return response.json().then(userInfo => {
                    // JSONパースされたオブジェクトが渡される
                    // ResponseオブジェクトのjsonメソッドもPromiseを返す。これはHTTPレスポンスボディをJSONとしてパースしたオブジェクトでresolveされる。-> {...}
                    console.log(userInfo);
                    // HTMLの組み立て
                    const view = createView(userInfo);
                    // HTMLの挿入
                    displayView(view);
                });
            }
            // HTTP通信でのエラーはNetworkErrorオブジェクトでrejectされたPromiseが返される。errorをcatchする。 
            }).catch(error => {
                console.error(error)
            });
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

