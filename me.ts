const endpoint = "https://api.track.toggl.com/api/v9/me";

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
