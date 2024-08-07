// Toggl API から今日のタイムエントリーを取得する
//
// [Time entries | Track Your Way](https://developers.track.toggl.com/docs/api/time_entries)
//
import config from "./config.json" with { type: "json" };

const getYmd = (date: Date): string => {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const d = (function () {
    if (Deno.args.length === 0) {
        return new Date();
    }
    return new Date(`${Deno.args[0]}T12:00:00+09:00`);
})();
// 1日の区間を6時間ずらす
d.setTime(d.getTime() - 6 * 60 * 60 * 1000);
const today = getYmd(d);
const tomorrow = getYmd(new Date(d.getTime() + 24 * 60 * 60 * 1000));
const start_date = encodeURIComponent(today + "T06:00:00+09:00");
const end_date = encodeURIComponent(tomorrow + "T06:00:00+09:00");
const endpoint = `https://api.track.toggl.com/api/v9/me/time_entries?start_date=${start_date}&end_date=${end_date}&meta=true`;

// ファイルから読み込む
const api_token = config.api_token;

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
    "client_name": string;
    "project_name": string;
    "description": string;
    "duration": number;
};
const client = config.client;
const work_entries = data.filter((entry: Entry) => entry.client_name === client);

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

    const tasks = Object.keys(summary[project]);
    tasks.sort();
    for (const task of tasks) {
        console.log(`- ${task}`);

        // 小数点以下は2桁まで表示する
        // const duration = summary[project][task] / 3600;
        // console.log(`- ${task}: ${duration.toFixed(2)}h`);
    }
    console.log("");
}
if (summary["misc."]) {
    console.log("### misc.");
    const tasks = Object.keys(summary["misc."]);
    tasks.sort();
    for (const task of tasks) {
        console.log(`- ${task}`);
        // const duration = summary["misc."][task] / 3600;
        // console.log(`- ${task}: ${duration.toFixed(2)}h`);
    }
}
