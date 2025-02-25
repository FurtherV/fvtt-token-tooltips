const MODULE_ID = "%config.id%";

Hooks.once("init", () => {
  console.debug(`${MODULE_ID} - Debug File Loaded!`);
});

Hooks.on("hotReload", (data) => {
  if (data.packageId === MODULE_ID && data.extension === "hbs") {
    console.debug(`Deleting cached ${data.path}!`);
    delete globalThis["Handlebars"].partials["/" + data.path];

    Object.values(ui.windows).filter((app) => {
      console.debug(app.options.template);
      if (app.options.template.includes(MODULE_ID)) {
        console.debug(`Rerendering app ${app.appId} with template ${app.options.template}!`);
        app.render(true);
      }
    });
  }
});
