/** ConsoleSetup.gs — one-time console installer. Run once from the editor; safe to re-run. */
function installConsole() {
  const ui = SpreadsheetApp.getUi();
  const r  = ui.prompt('Owner email', 'Used for the daily digest email.',
    ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const email = r.getResponseText().trim();
  if (!/^[^@\s]+@[^@\s]+$/.test(email)) return ui.alert('Not a valid email.');

  PropertiesService.getScriptProperties().setProperty('OWNER_EMAIL', email);
  PropertiesService.getScriptProperties().setProperty('COST_MONTH_CAP_USD', '2000');

  buildDashboardTab();
  installDailyEmailTrigger();
  installDashboardRebuildTrigger();

  ui.alert('Console installed',
    'Owner email: ' + email + '\n' +
    'Dashboard tab created.\n' +
    'Daily email at 9am (project time zone).\n' +
    'Dashboard rebuilds hourly.\n\n' +
    'Open the "Alaya" menu in the top bar to use the console.',
    ui.ButtonSet.OK);
}
