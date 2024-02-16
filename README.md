# Toggl 用のツールキット

## 業務レポートの作成

```bash
deno run --allow-net --allow-read ./work_report.ts
```

### WSLからクリップボードにコピーする

```bash
# UTF-8なので、絵文字も考慮すると、UTF-16に変換する
deno run --allow-net --allow-read ./work_report.ts | iconv -f utf-8 -t utf-16le | clip.exe
```
