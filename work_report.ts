// Toggl API から今日のタイムエントリーを取得する
//
// [Time entries | Track Your Way](https://developers.track.toggl.com/docs/api/time_entries)
//
const today = (new Date()).toISOString().split("T")[0];
const start_date = encodeURIComponent(today + "T00:00:00+09:00");
const end_date = encodeURIComponent(today + "T23:59:59+09:00");
const endpoint = `https://api.track.toggl.com/api/v9/me/time_entries?start_date=${start_date}&end_date=${end_date}&meta=true`;

// ファイルから読み込む
const api_token = (await Deno.readTextFile("api_token.txt")).trim();

const res = await fetch(endpoint, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${api_token}:api_token`)}`
    }
});

const data = await res.json();
console.log(data);
