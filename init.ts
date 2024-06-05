const content = `{
    "api_token": "",
    "client": "client_name",
}
`;
await Deno.writeTextFile("./config.json", content, {
    mode: 0o600,
});
