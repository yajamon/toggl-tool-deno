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
        "Authorization": `Basic ${btoa(`${api_token}:api_token`)}`,
    },
});

const data = await res.json();

// 業務用のタイムエントリーだけを集計する
type Entry = {
    "client_name": string,
    "project_name": string,
    "description": string,
    "duration": number,
};
const work_entries = data.filter((entry: Entry) => entry.client_name === "client_name");

// Projectごと、タスクごとに集計する
type Summary = Record<string, Record<string, number>>;

const summary: Summary = {};
for (const entry of work_entries) {
    const project = entry.project_name;
    const task = entry.description;
    const duration = entry.duration;

    if (!summary[project]) {
        summary[project] = {};
    }
    if (!summary[project][task]) {
        summary[project][task] = 0;
    }
    if (duration > 0) {
        summary[project][task] += duration;
    }
}

// 集計結果を markdown 書式で表示する
// Project 「misc.」 だけはあとで表示する
for (const project in summary) {
    if (project === "misc.") {
        continue;
    }
    console.log(`### ${project}`);
    for (const task in summary[project]) {
        // 小数点以下は2桁まで表示する
        console.log(`- ${task}`);
        // const duration = summary[project][task] / 3600;
        // console.log(`- ${task}: ${duration.toFixed(2)}h`);
    }
    console.log("");
}
if (summary["misc."]) {
    console.log("### misc.");
    for (const task in summary["misc."]) {
        console.log(`- ${task}`);
        // const duration = summary["misc."][task] / 3600;
        // console.log(`- ${task}: ${duration.toFixed(2)}h`);
    }
}
