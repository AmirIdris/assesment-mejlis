// app.config.ts
import { createApp } from "vinxi";
import path from "path";
var app_config_default = createApp({
  routers: [
    {
      name: "server",
      type: "http",
      handler: "./app/entry.server.tsx"
    },
    {
      name: "client",
      type: "client",
      handler: "./app/entry.client.tsx"
    }
  ],
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./app"),
        "~": path.resolve(__dirname, ".")
      }
    }
  }
});
export {
  app_config_default as default
};
