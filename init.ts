const content = `{
    "api_token": "",
    "client": "client_name"
}
`;
await Deno.writeTextFile("./config.json", content, {
    createNew: true,
    mode: 0o600,
});
