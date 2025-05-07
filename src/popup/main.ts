// Instruct typescript to handle svelte files
/// <reference types="svelte" />

import "../styles/global.css";
import { mount } from "svelte";

import App from "./App.svelte";
import { Logger } from "@/global/logger";

let app;

Logger.Init().then(() => {
  app = mount(App, {
    target: document.body,
    props: {},
  });
});

export default app;
