export default {
  providers: [
    "@ulu/frontend",
    {
      name: "static-mock",
      prefix: "static",
      snippets: {},
      configuration: {},
      guides: {},
      reference: {}
    },
    "./local-provider.json"
  ]
};
