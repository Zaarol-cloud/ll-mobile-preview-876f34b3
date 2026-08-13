gdjs.BackendTestScene_95L035Code = {};
gdjs.BackendTestScene_95L035Code.localVariables = [];
gdjs.BackendTestScene_95L035Code.idToCallbackMap = new Map();
gdjs.BackendTestScene_95L035Code.GDBackendTestTitleObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendTestTitleObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendTestInfoObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendTestInfoObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendWrongButtonObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendWrongButtonObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendCorrectButtonObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendCorrectButtonObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendRepeatButtonObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendRepeatButtonObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendAuthButtonObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendAuthButtonObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendSharedChestStatusObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendSharedChestStatusObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendChestReloadButtonObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendChestReloadButtonObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendStaleChestButtonObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendStaleChestButtonObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendWalletStatusObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendWalletStatusObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendWalletReloadButtonObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendWalletReloadButtonObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendCookieButtonObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendCookieButtonObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendWalletRepeatButtonObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendWalletRepeatButtonObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendBoosterButtonObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendBoosterButtonObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendTestStatusObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendTestStatusObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendHintStatusObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendHintStatusObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendHintBuyButtonObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendHintBuyButtonObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendHintRepeatButtonObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendHintRepeatButtonObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendHintReloadButtonObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendHintReloadButtonObjects2= [];
gdjs.BackendTestScene_95L035Code.GDBackendCalendarClaimButtonObjects1= [];
gdjs.BackendTestScene_95L035Code.GDBackendCalendarClaimButtonObjects2= [];
gdjs.BackendTestScene_95L035Code.GDResourceHudCookieFrameObjects1= [];
gdjs.BackendTestScene_95L035Code.GDResourceHudCookieFrameObjects2= [];
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpickFrameObjects1= [];
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpickFrameObjects2= [];
gdjs.BackendTestScene_95L035Code.GDResourceHudCookieIconObjects1= [];
gdjs.BackendTestScene_95L035Code.GDResourceHudCookieIconObjects2= [];
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpickIconObjects1= [];
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpickIconObjects2= [];
gdjs.BackendTestScene_95L035Code.GDResourceHudCookiesTextObjects1= [];
gdjs.BackendTestScene_95L035Code.GDResourceHudCookiesTextObjects2= [];
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpicksTextObjects1= [];
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpicksTextObjects2= [];


gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendHintBuyButtonObjects1Objects = Hashtable.newFrom({"BackendHintBuyButton": gdjs.BackendTestScene_95L035Code.GDBackendHintBuyButtonObjects1});
gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendCalendarClaimButtonObjects1Objects = Hashtable.newFrom({"BackendCalendarClaimButton": gdjs.BackendTestScene_95L035Code.GDBackendCalendarClaimButtonObjects1});
gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendHintRepeatButtonObjects1Objects = Hashtable.newFrom({"BackendHintRepeatButton": gdjs.BackendTestScene_95L035Code.GDBackendHintRepeatButtonObjects1});
gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendHintReloadButtonObjects1Objects = Hashtable.newFrom({"BackendHintReloadButton": gdjs.BackendTestScene_95L035Code.GDBackendHintReloadButtonObjects1});
gdjs.BackendTestScene_95L035Code.userFunc0xce7628 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-035 bis L&L-042: Lokale Firebase-Emulator-Verbindung über offizielle REST-/Callable-Protokolle.
// Keine Firebase-Projektkonfiguration, kein externes SDK und niemals eine Produktionsverbindung.
if (runtimeScene.getTimeManager().isFirstFrame()) {
  const sceneVariables = runtimeScene.getVariables();
  const statusObjects = runtimeScene.getObjects("BackendTestStatus");
  const walletObjects = runtimeScene.getObjects("BackendWalletStatus");
  const chestObjects = runtimeScene.getObjects("BackendSharedChestStatus");
  const hintObjects = runtimeScene.getObjects("BackendHintStatus");
  const calendarObjects = runtimeScene.getObjects("BackendCalendarClaimButton");
  const setStatus = (text) => { if (statusObjects.length) statusObjects[0].setString(text); };
  const setWalletStatus = (text) => { if (walletObjects.length) walletObjects[0].setString(text); };
  const setChestStatus = (text) => { if (chestObjects.length) chestObjects[0].setString(text); };
  const setHintStatus = (text) => { if (hintObjects.length) hintObjects[0].setString(text); };
  const setCalendarStatus = (text) => { if (calendarObjects.length) calendarObjects[0].setString(text); };
  const endpoints = Object.freeze({
    auth: "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=local-emulator-only",
    prepare: "http://127.0.0.1:5001/demo-lock-loot-local/us-central1/prepareGDevelopTest",
    attempt: "http://127.0.0.1:5001/demo-lock-loot-local/europe-west1/attemptChest",
    wallet: "http://127.0.0.1:5001/demo-lock-loot-local/us-central1/bootstrapPlayerState",
    consumeCookie: "http://127.0.0.1:5001/demo-lock-loot-local/us-central1/consumeTestCookie",
    grantBooster5: "http://127.0.0.1:5001/demo-lock-loot-local/us-central1/grantTestBooster5",
    buyHintPackage: "http://127.0.0.1:5001/demo-lock-loot-local/europe-west1/buyNextHintPackage",
    claimCalendar: "http://127.0.0.1:5001/demo-lock-loot-local/europe-west1/claimDailyCalendarReward"
  });
  const assertLocalEndpoint = (endpoint) => {
    const parsed = new URL(endpoint);
    if (parsed.protocol !== "http:" || parsed.hostname !== "127.0.0.1" || !["9099", "5001"].includes(parsed.port)) throw new Error("Lokale Demo-Grenze verletzt.");
  };
  const requestJson = async (endpoint, body, idToken = "") => {
    assertLocalEndpoint(endpoint);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const headers = { "Content-Type": "application/json" };
      if (idToken) headers.Authorization = "Bearer " + idToken;
      const response = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body), signal: controller.signal });
      const responseText = await response.text();
      let payload = null;
      try { payload = responseText ? JSON.parse(responseText) : null; } catch (error) { throw Object.assign(new Error("Ungültige lokale JSON-Antwort."), { status: "INVALID_RESPONSE" }); }
      if (!response.ok || (payload && payload.error)) {
        const callableStatus = payload && payload.error && typeof payload.error.status === "string" ? payload.error.status : "";
        const details = payload && payload.error && payload.error.details && typeof payload.error.details === "object" ? payload.error.details : {};
        throw Object.assign(new Error("Lokale Anfrage abgelehnt."), { status: callableStatus || "HTTP_" + response.status, details, reason: typeof details.reason === "string" ? details.reason : "" });
      }
      return payload;
    } finally {
      clearTimeout(timeout);
    }
  };
  const callCallable = async (endpoint, data, idToken = "") => {
    const payload = await requestJson(endpoint, { data }, idToken);
    const result = payload && payload.result !== undefined ? payload.result : payload && payload.data;
    if (result === undefined) throw Object.assign(new Error("Callable-Ergebnis fehlt."), { status: "INVALID_RESPONSE" });
    return result;
  };
  const formatWallet = (wallet) => {
    const fields = ["cookies", "lockpicks", "booster5", "booster10", "booster25", "totalBoost", "revision", "schemaVersion"];
    if (!wallet || fields.some((field) => !Number.isSafeInteger(wallet[field]) || wallet[field] < 0) || wallet.schemaVersion !== 1) throw Object.assign(new Error("Ungültige Wallet-Antwort."), { status: "INVALID_RESPONSE" });
    return "SERVER-WALLET · L&L-036-TESTDATEN" +
      "\nKekse: " + wallet.cookies + "    Dietriche: " + wallet.lockpicks +
      "\nBooster 5 %: " + wallet.booster5 + "    10 %: " + wallet.booster10 + "    25 %: " + wallet.booster25 +
      "\nGesamtboost: " + wallet.totalBoost + " %" +
      "\nRevision: " + wallet.revision + "    Schema: " + wallet.schemaVersion;
  };
  const formatChest = (chest) => {
    if (!chest || typeof chest.chestId !== "string" || !chest.chestId || chest.status !== "active" || chest.schemaVersion !== 1 || !Number.isSafeInteger(chest.contentVersion) || chest.contentVersion < 1 || !Number.isSafeInteger(chest.hintGeneratorVersion) || chest.hintGeneratorVersion < 1) throw Object.assign(new Error("Ungültige Kisten-Antwort."), { status: "INVALID_RESPONSE" });
    return "GEMEINSAME TESTKISTE · L&L-037" +
      "\nAktuelle chestId: " + chest.chestId + "    Status: " + chest.status +
      "\nSchema: " + chest.schemaVersion + "    Inhalt: " + chest.contentVersion + "    Hinweise: " + chest.hintGeneratorVersion;
  };
  const formatHintState = (hintState, wallet) => {
    if (!hintState || typeof hintState.chestId !== "string" || !hintState.chestId || !Number.isSafeInteger(hintState.purchasedPackageCount) || hintState.purchasedPackageCount < 0 || hintState.purchasedPackageCount > 5 || !Number.isSafeInteger(hintState.revealedHintCount) || hintState.revealedHintCount !== hintState.purchasedPackageCount * 2 || !Array.isArray(hintState.revealedHints) || hintState.revealedHints.length !== hintState.revealedHintCount) throw Object.assign(new Error("Ungültiger persönlicher Hintzustand."), { status: "INVALID_RESPONSE" });
    const forbidden = ["solutionCode", "assignmentSalt", "assignmentSeedHash", "assignedHints", "truthValue", "internalPositions", "mathematicalRule", "signature"];
    const serialized = JSON.stringify(hintState);
    if (forbidden.some((field) => serialized.includes(field))) throw Object.assign(new Error("Interne Hintdaten in Clientantwort."), { status: "INVALID_RESPONSE" });
    const lines = hintState.revealedHints.map((hint) => {
      if (!hint || !Number.isSafeInteger(hint.index) || !Number.isSafeInteger(hint.packageNumber) || !Number.isSafeInteger(hint.tier) || typeof hint.id !== "string" || typeof hint.text !== "string") throw Object.assign(new Error("Ungültiger clientsicherer Hinweis."), { status: "INVALID_RESPONSE" });
      return hint.index + " · P" + hint.packageNumber + " · T" + hint.tier + " · " + hint.id + " · " + hint.text;
    });
    return "PERSÖNLICHE HINWEISE · L&L-039" +
      "\nKiste: " + hintState.chestId + "    Kekse: " + wallet.cookies +
      "    Pakete: " + hintState.purchasedPackageCount + " / 5    Hinweise: " + hintState.revealedHintCount + " / 10" +
      (lines.length ? "\n" + lines.join("\n") : "\nNoch keine Hinweise gekauft.");
  };
  const formatCalendarReward = (reward) => '+' + reward.cookies + ' K / +' + reward.lockpicks + ' D · B ' + reward.booster5 + '/' + reward.booster10 + '/' + reward.booster25;
  const formatCalendar = (calendar) => {
    if (!calendar || calendar.levelCount !== 30 || !Number.isSafeInteger(calendar.calendarVersion) || !Number.isSafeInteger(calendar.progress) || calendar.progress < 0 || calendar.progress > 30 || typeof calendar.todayClaimed !== 'boolean' || typeof calendar.cycleCompleted !== 'boolean' || typeof calendar.premiumEntitled !== 'boolean' || !Array.isArray(calendar.rewardOverview) || calendar.rewardOverview.length !== 30) throw Object.assign(new Error('Ungültiger clientsicherer Kalenderzustand.'), { status: 'INVALID_RESPONSE' });
    const available = !calendar.todayClaimed && !calendar.cycleCompleted;
    const entry = calendar.nextLevel === null ? null : calendar.rewardOverview[calendar.nextLevel - 1];
    const nextText = entry ? 'F ' + formatCalendarReward(entry.free) + ' | P ' + formatCalendarReward(entry.premium) : 'Zyklus abgeschlossen';
    return 'SCHATZKALENDER · L&L-042 · ' + calendar.progress + '/30 · HEUTE ' + (available ? 'JA' : 'NEIN') + ' · PREMIUM ' + (calendar.premiumEntitled ? 'JA' : 'NEIN') + '\nNÄCHSTE TESTBELOHNUNG: ' + nextText + '\nKALENDERBELOHNUNG BEANSPRUCHEN';
  };
  const state = { runtimeScene, endpoints, requestJson, callCallable, formatWallet, formatChest, formatHintState, formatCalendar, setWalletStatus, setChestStatus, setHintStatus, setCalendarStatus, idToken: "", uid: "", lastRequest: null, lastWalletRequest: null, lastHintRequest: null, lastHintResult: null, wallet: null, hintState: null, calendar: null, currentChest: null, previousChestId: "" };
  globalThis.__lockLootL035 = state;
  const applyBootstrap = (snapshot, trackPrevious = true) => {
    if (!snapshot || snapshot.uid !== state.uid) throw Object.assign(new Error("Bootstrap-UID stimmt nicht."), { status: "INVALID_RESPONSE" });
    formatWallet(snapshot);
    formatChest(snapshot.currentChest);
    if (trackPrevious && state.currentChest && state.currentChest.chestId !== snapshot.currentChest.chestId) state.previousChestId = state.currentChest.chestId;
    state.wallet = snapshot;
    state.hintState = snapshot.hintState;
    if (snapshot.calendar) state.calendar = snapshot.calendar;
    state.currentChest = snapshot.currentChest;
    setWalletStatus(formatWallet(snapshot));
    setChestStatus(formatChest(snapshot.currentChest));
    setHintStatus(formatHintState(snapshot.hintState, snapshot));
    if (snapshot.calendar) setCalendarStatus(formatCalendar(snapshot.calendar));
  };
  state.applyBootstrap = applyBootstrap;
  const authenticateAndPrepare = async () => {
    const authPayload = await requestJson(endpoints.auth, { returnSecureToken: true });
    if (!authPayload || typeof authPayload.idToken !== "string" || !authPayload.idToken || typeof authPayload.localId !== "string" || !authPayload.localId) throw Object.assign(new Error("Anonyme Auth-Antwort ungültig."), { status: "AUTH_FAILED" });
    state.idToken = authPayload.idToken;
    state.uid = authPayload.localId;
    state.lastRequest = null;
    state.lastWalletRequest = null;
    state.lastHintRequest = null;
    state.lastHintResult = null;
    state.previousChestId = "";
    state.currentChest = null;
    const prepared = await callCallable(endpoints.prepare, { integration: "L&L-042" }, state.idToken);
    if (!prepared || prepared.calendarVersion !== 1) throw Object.assign(new Error('Kalender-Testdaten fehlen.'), { status: 'INVALID_RESPONSE' });
    if (!prepared || typeof prepared.chestId !== "string" || !prepared.chestId || prepared.lockpicksRemaining !== 10) throw Object.assign(new Error("Testdaten-Antwort ungültig."), { status: "INVALID_RESPONSE" });
    const bootstrap = await callCallable(endpoints.wallet, { integration: "L&L-042" }, state.idToken);
    applyBootstrap(bootstrap, false);
    if (prepared.chestId !== state.currentChest.chestId) throw Object.assign(new Error("Vorbereitung und aktuelle Kiste weichen ab."), { status: "INVALID_RESPONSE" });
    return prepared;
  };
  state.authenticateAndPrepare = authenticateAndPrepare;
  sceneVariables.get("backendInitState").setString("authenticating");
  sceneVariables.get("backendRequestPending").setBoolean(true);
  setStatus("Entwicklungsstatus: Lokale Emulatorverbindung wird geprüft.\nAnonyme Testauthentifizierung läuft …\nKeine Produktionsverbindung.");
  void authenticateAndPrepare().then(() => {
    if (globalThis.__lockLootL035 !== state) return;
    sceneVariables.get("backendInitState").setString("ready");
    setStatus("Verbindung erfolgreich.\nLokale Test-UID: " + state.uid + "\nGemeinsame aktuelle Kiste: " + state.currentChest.chestId + "\nTestdaten bereit: 10 Test-Dietriche.");
  }).catch((error) => {
    if (globalThis.__lockLootL035 !== state) return;
    const networkError = error && (error.name === "AbortError" || error instanceof TypeError);
    sceneVariables.get("backendInitState").setString(networkError ? "emulator-unreachable" : "auth-error");
    setStatus(networkError ? "Emulator nicht erreichbar.\nPrüfe 127.0.0.1:9099 und 127.0.0.1:5001.\nKein Preview-Absturz." : "Authentifizierung oder lokale Testvorbereitung fehlgeschlagen.\nEs wurde kein Schlossversuch gestartet.");
  }).finally(() => {
    if (globalThis.__lockLootL035 === state) sceneVariables.get("backendRequestPending").setBoolean(false);
  });
}
};
gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendWrongButtonObjects1Objects = Hashtable.newFrom({"BackendWrongButton": gdjs.BackendTestScene_95L035Code.GDBackendWrongButtonObjects1});
gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendCorrectButtonObjects1Objects = Hashtable.newFrom({"BackendCorrectButton": gdjs.BackendTestScene_95L035Code.GDBackendCorrectButtonObjects1});
gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendRepeatButtonObjects1Objects = Hashtable.newFrom({"BackendRepeatButton": gdjs.BackendTestScene_95L035Code.GDBackendRepeatButtonObjects1});
gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendAuthButtonObjects1Objects = Hashtable.newFrom({"BackendAuthButton": gdjs.BackendTestScene_95L035Code.GDBackendAuthButtonObjects1});
gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendChestReloadButtonObjects1Objects = Hashtable.newFrom({"BackendChestReloadButton": gdjs.BackendTestScene_95L035Code.GDBackendChestReloadButtonObjects1});
gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendStaleChestButtonObjects1Objects = Hashtable.newFrom({"BackendStaleChestButton": gdjs.BackendTestScene_95L035Code.GDBackendStaleChestButtonObjects1});
gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendWalletReloadButtonObjects1Objects = Hashtable.newFrom({"BackendWalletReloadButton": gdjs.BackendTestScene_95L035Code.GDBackendWalletReloadButtonObjects1});
gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendCookieButtonObjects1Objects = Hashtable.newFrom({"BackendCookieButton": gdjs.BackendTestScene_95L035Code.GDBackendCookieButtonObjects1});
gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendWalletRepeatButtonObjects1Objects = Hashtable.newFrom({"BackendWalletRepeatButton": gdjs.BackendTestScene_95L035Code.GDBackendWalletRepeatButtonObjects1});
gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendBoosterButtonObjects1Objects = Hashtable.newFrom({"BackendBoosterButton": gdjs.BackendTestScene_95L035Code.GDBackendBoosterButtonObjects1});
gdjs.BackendTestScene_95L035Code.userFunc0xaf3498 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-035 bis L&L-042: Aktiver lokaler REST-/Callable-Adapter; keine bestehende TrainingScene-Variable wird benutzt.
const sceneVariables = runtimeScene.getVariables();
const initState = sceneVariables.get("backendInitState");
const actionVariable = sceneVariables.get("backendAction");
const pendingVariable = sceneVariables.get("backendRequestPending");
const statusObjects = runtimeScene.getObjects("BackendTestStatus");
const clientState = globalThis.__lockLootL035;
const sceneIsCurrent = () => globalThis.__lockLootL035 && globalThis.__lockLootL035.runtimeScene === runtimeScene;
const setStatus = (text) => { if (sceneIsCurrent() && statusObjects.length) statusObjects[0].setString(text); };
const requestedAction = actionVariable.getAsString();
if (requestedAction && initState.getAsString() !== "ready") {
  actionVariable.setString("");
  setStatus("Der lokale Backend-Test ist noch nicht bereit.\nAktueller Entwicklungsstatus: " + initState.getAsString());
}
if (requestedAction && initState.getAsString() === "ready" && !pendingVariable.getAsBoolean() && clientState) {
  actionVariable.setString("");
  pendingVariable.setBoolean(true);
  const makeRequestId = () => {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") return "gd-" + globalThis.crypto.randomUUID();
    if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== "function") throw new Error("Keine sichere requestId verfügbar.");
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    return "gd-" + Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  };
  const formatResult = (result, repeated) => {
    if (!result || typeof result.success !== "boolean" || !Number.isSafeInteger(result.lockpicksRemaining)) throw Object.assign(new Error("Ungültige Backend-Antwort."), { status: "INVALID_RESPONSE" });
    return "Verbindung erfolgreich.\nLokale Test-UID: " + clientState.uid +
      "\nBackend-Antwort: " + (result.success ? "Erfolg" : "Fehlversuch") +
      "\nErfolg: " + (result.success ? "ja" : "nein") +
      "\nVerbleibende Test-Dietriche: " + result.lockpicksRemaining +
      "\nrequestId: " + clientState.lastRequest.requestId +
      (repeated ? "\nIdempotenz: dieselbe requestId wurde erneut gesendet." : "");
  };
  void (async () => {
    if (requestedAction === 'calendar-claim') {
      const before = { cookies: clientState.wallet.cookies, lockpicks: clientState.wallet.lockpicks, booster5: clientState.wallet.booster5, booster10: clientState.wallet.booster10, booster25: clientState.wallet.booster25 };
      setStatus('Serverautoritiver Schatzkalender-Claim läuft …\nTagesgrenze: UTC · Testclock nur über lokale Adminhilfe.');
      const result = await clientState.callCallable(clientState.endpoints.claimCalendar, { integration: 'L&L-042', requestId: makeRequestId() }, clientState.idToken);
      if (!result || result.dayBoundary !== 'UTC' || !result.wallet || !result.calendar || !result.rewards || !result.rewards.free || !result.rewards.premium) throw Object.assign(new Error('Ungültige Kalenderclaim-Antwort.'), { status: 'INVALID_RESPONSE' });
      clientState.wallet = result.wallet;
      clientState.calendar = result.calendar;
      clientState.setWalletStatus(clientState.formatWallet(result.wallet));
      clientState.setHintStatus(clientState.formatHintState(clientState.hintState, result.wallet));
      clientState.setCalendarStatus(clientState.formatCalendar(result.calendar));
      const rewardText = (reward) => '+' + reward.cookies + ' K / +' + reward.lockpicks + ' D · Booster ' + reward.booster5 + '/' + reward.booster10 + '/' + reward.booster25;
      setStatus('Schatzkalender-Stufe ' + result.progressLevel + ' atomar beansprucht.\nWallet vorher: ' + before.cookies + ' K / ' + before.lockpicks + ' D · danach: ' + result.wallet.cookies + ' K / ' + result.wallet.lockpicks + ' D.\nKostenlos: ' + rewardText(result.rewards.free) + '\nPremium Extra: ' + rewardText(result.rewards.premium) + '\nQualifizierter UTC-Testtag: ' + result.qualifiedDayKey);
      return;
    }
    if (requestedAction === "chest-reload") {
      const beforeChestId = clientState.currentChest.chestId;
      const bootstrap = await clientState.callCallable(clientState.endpoints.wallet, { integration: "L&L-036" }, clientState.idToken);
      clientState.applyBootstrap(bootstrap, true);
      const changed = beforeChestId !== clientState.currentChest.chestId;
      setStatus("Gemeinsame Kiste neu geladen.\nAktuell: " + clientState.currentChest.chestId + (changed ? "\nVorherige Kiste für STALE_CHEST-Test: " + clientState.previousChestId : "\nKeine Änderung seit dem letzten Laden."));
      return;
    }
    if (requestedAction === "chest-stale") {
      if (!clientState.previousChestId || clientState.previousChestId === clientState.currentChest.chestId) {
        setStatus("STALE_CHEST-Test noch nicht möglich.\nVeröffentliche lokal Testkiste B und lade danach die aktuelle Kiste neu.");
        return;
      }
      const beforeLockpicks = clientState.wallet.lockpicks;
      const beforeRevision = clientState.wallet.revision;
      let staleRejected = false;
      try {
        await clientState.callCallable(clientState.endpoints.attempt, { requestId: makeRequestId(), chestId: clientState.previousChestId, enteredCode: "00000000000" }, clientState.idToken);
      } catch (error) {
        staleRejected = error && error.status === "FAILED_PRECONDITION" && error.reason === "STALE_CHEST";
      }
      if (!staleRejected) throw Object.assign(new Error("STALE_CHEST-Ablehnung fehlt."), { status: "STALE_TEST_FAILED" });
      const bootstrap = await clientState.callCallable(clientState.endpoints.wallet, { integration: "L&L-036" }, clientState.idToken);
      clientState.applyBootstrap(bootstrap, false);
      if (clientState.wallet.lockpicks !== beforeLockpicks || clientState.wallet.revision !== beforeRevision) throw Object.assign(new Error("Veralteter Versuch hat Wallet verändert."), { status: "STALE_TEST_FAILED" });
      setStatus("STALE_CHEST korrekt abgelehnt.\nVeraltete Kiste: " + clientState.previousChestId + "\nAktuelle Kiste: " + clientState.currentChest.chestId + "\nKein Dietrichverbrauch; Wallet-Revision unverändert.");
      return;
    }
    if (["hint-buy", "hint-repeat", "hint-reload"].includes(requestedAction)) {
      if (requestedAction === "hint-reload") {
        const bootstrap = await clientState.callCallable(clientState.endpoints.wallet, { integration: "L&L-036" }, clientState.idToken);
        clientState.applyBootstrap(bootstrap, true);
        setStatus("Persönlicher Hintzustand neu geladen.\nDieselben bereits gekauften Hinweise wurden in derselben Reihenfolge wiederhergestellt.\nNicht gekaufte Hinweise bleiben verborgen.");
        return;
      }
      const repeatedHintPurchase = requestedAction === "hint-repeat";
      if (repeatedHintPurchase && !clientState.lastHintRequest) {
        setStatus("Hint-Idempotenztest noch nicht möglich.\nKaufe zuerst ein Hinweispaket.");
        return;
      }
      if (!repeatedHintPurchase) {
        clientState.lastHintRequest = {
          integration: "L&L-039",
          requestId: makeRequestId(),
          chestId: clientState.currentChest.chestId,
          expectedContentVersion: clientState.currentChest.contentVersion,
          expectedWalletRevision: clientState.wallet.revision
        };
      }
      setStatus(repeatedHintPurchase ? "Gleiche Hintkauf-requestId wird erneut gesendet …" : "Serverautoritiver Hinweiskauf läuft …");
      const result = await clientState.callCallable(clientState.endpoints.buyHintPackage, { ...clientState.lastHintRequest }, clientState.idToken);
      if (!sceneIsCurrent()) return;
      if (!result || result.chestId !== clientState.currentChest.chestId || !Number.isSafeInteger(result.packageNumber) || !Array.isArray(result.newlyRevealedHints) || result.newlyRevealedHints.length !== 2 || !result.wallet || !result.hintState) throw Object.assign(new Error("Ungültige Hintkauf-Antwort."), { status: "INVALID_RESPONSE" });
      if (repeatedHintPurchase && clientState.lastHintResult && JSON.stringify(result) !== JSON.stringify(clientState.lastHintResult)) throw Object.assign(new Error("Hintkauf-Replay ist inkonsistent."), { status: "IDEMPOTENCY_TEST_FAILED" });
      clientState.lastHintResult = result;
      clientState.wallet = result.wallet;
      clientState.hintState = result.hintState;
      clientState.setWalletStatus(clientState.formatWallet(result.wallet));
      clientState.setHintStatus(clientState.formatHintState(result.hintState, result.wallet));
      const newTexts = result.newlyRevealedHints.map((hint) => "T" + hint.tier + " · " + hint.id + " · " + hint.text).join("\n");
      setStatus((repeatedHintPurchase ? "Idempotenz bestätigt: kein weiterer Keks und kein weiteres Paket." : "Hinweispaket " + result.packageNumber + " serverseitig gekauft.") + "\nrequestId: " + clientState.lastHintRequest.requestId + "\n" + newTexts);
      return;
    }
    if (["wallet-reload", "wallet-cookie", "wallet-repeat", "wallet-booster"].includes(requestedAction)) {
      if (requestedAction === "wallet-reload") {
        const bootstrap = await clientState.callCallable(clientState.endpoints.wallet, { integration: "L&L-036" }, clientState.idToken);
        clientState.applyBootstrap(bootstrap, true);
        setStatus("Server-Wallet neu geladen.\nKeine Buchung durchgeführt.\nRevision: " + clientState.wallet.revision);
        return;
      }
      const repeatedWallet = requestedAction === "wallet-repeat";
      if (repeatedWallet && !clientState.lastWalletRequest) {
        setStatus("Wallet-Idempotenztest noch nicht möglich.\nVerbrauche zuerst einen Testkeks oder schreibe einen Testbooster gut.");
        return;
      }
      if (!repeatedWallet) {
        const kind = requestedAction === "wallet-cookie" ? "cookie" : "booster5";
        clientState.lastWalletRequest = { kind, requestId: makeRequestId() };
      }
      const walletRequest = clientState.lastWalletRequest;
      const endpoint = walletRequest.kind === "cookie" ? clientState.endpoints.consumeCookie : clientState.endpoints.grantBooster5;
      setStatus(repeatedWallet ? "Gleiche Wallet-requestId wird erneut gesendet …" : "Serverautoritative Wallet-Testbuchung läuft …");
      clientState.wallet = await clientState.callCallable(endpoint, { integration: "L&L-036", requestId: walletRequest.requestId }, clientState.idToken);
      if (!sceneIsCurrent()) return;
      clientState.setWalletStatus(clientState.formatWallet(clientState.wallet));
      clientState.setHintStatus(clientState.formatHintState(clientState.hintState, clientState.wallet));
      const actionText = walletRequest.kind === "cookie" ? "1 Testkeks serverseitig verbraucht." : "1 Test-5-%-Booster serverseitig als Entwicklungstest gutgeschrieben.";
      setStatus(actionText + "\nRevision: " + clientState.wallet.revision + "\nrequestId: " + walletRequest.requestId + (repeatedWallet ? "\nIdempotenz: keine zweite Buchung." : ""));
      return;
    }
    if (requestedAction === "auth-error") {
      let rejectedAsExpected = false;
      try {
        await clientState.callCallable(clientState.endpoints.attempt, { requestId: makeRequestId(), chestId: clientState.currentChest.chestId, enteredCode: "00000000000" });
      } catch (error) {
        rejectedAsExpected = error && error.status === "UNAUTHENTICATED";
      }
      if (!rejectedAsExpected) throw Object.assign(new Error("Auth-Ablehnung fehlt."), { status: "AUTH_TEST_FAILED" });
      clientState.idToken = "";
      clientState.uid = "";
      await clientState.authenticateAndPrepare();
      if (!sceneIsCurrent()) return;
      setStatus("Auth-Fehlertest bestanden.\nNicht authentifizierter Versuch ohne Dietrichverbrauch abgelehnt.\nNeue lokale Test-UID: " + clientState.uid + "\nGemeinsame Kiste blieb: " + clientState.currentChest.chestId + "\nEigenes Startwallet: 10 Test-Dietriche.");
      return;
    }
    const repeated = requestedAction === "repeat";
    if (repeated && !clientState.lastRequest) {
      setStatus("Idempotenztest noch nicht möglich.\nSende zuerst einen falschen oder richtigen Testversuch.");
      return;
    }
    if (!repeated) {
      const localCorrectCodes = { "test-chest-001": "58310472961", "test-chest-002": "17420583649" };
      const enteredCode = requestedAction === "correct" ? localCorrectCodes[clientState.currentChest.chestId] : "00000000000";
      if (requestedAction === "correct" && typeof enteredCode !== "string") throw Object.assign(new Error("Kein lokaler Testcode für diese Kiste."), { status: "INVALID_RESPONSE" });
      clientState.lastRequest = { requestId: makeRequestId(), chestId: clientState.currentChest.chestId, enteredCode };
    }
    setStatus(repeated ? "Gleiche requestId wird erneut gesendet …" : "Backend-Testaufruf läuft …");
    const result = await clientState.callCallable(clientState.endpoints.attempt, { ...clientState.lastRequest }, clientState.idToken);
    if (!sceneIsCurrent()) return;
    const bootstrap = await clientState.callCallable(clientState.endpoints.wallet, { integration: "L&L-036" }, clientState.idToken);
    clientState.applyBootstrap(bootstrap, true);
    setStatus(formatResult(result, repeated));
  })().catch((error) => {
    if (!sceneIsCurrent()) return;
    const status = error && typeof error.status === "string" ? error.status : "";
    const networkError = error && (error.name === "AbortError" || error instanceof TypeError);
    if (error && error.name === "AbortError") {
      setStatus("Emulator-Antwort unklar: Zeitüberschreitung.\nErgebnis unbekannt – dieselbe requestId mit Test 3 wiederholen.");
    } else if (networkError) {
      setStatus("Emulator nicht erreichbar.\nPrüfe 127.0.0.1:9099 und 127.0.0.1:5001.\nKein Preview-Absturz.");
    } else if (status === "UNAUTHENTICATED") {
      setStatus("Backend lehnt Versuch ab: keine lokale Anmeldung.\nKein Dietrichverbrauch.");
    } else if (error && error.reason === 'CALENDAR_ALREADY_CLAIMED_TODAY') {
      setStatus('Heute bereits beansprucht.\nKein Fortschritt, keine Ressource und keine Revision wurden erneut gebucht.');
    } else if (error && error.reason === 'CALENDAR_CYCLE_COMPLETED') {
      setStatus('Schatzkalender-Zyklus bei 30/30 abgeschlossen.\nEin 31. Claim ist im normalen Spielerpfad gesperrt.');
    } else if (error && error.reason === "ALL_HINT_PACKAGES_PURCHASED") {
      setStatus("Alle fünf Hinweispakete wurden bereits gekauft.\nDer sechste Kauf wurde ohne Keksverbrauch abgelehnt.");
    } else if (error && error.reason === "NOT_ENOUGH_COOKIES") {
      setStatus("Hinweiskauf abgelehnt: nicht genügend Kekse.\nKein Paket wurde freigegeben.");
    } else if (["INVALID_ARGUMENT", "FAILED_PRECONDITION", "RESOURCE_EXHAUSTED", "ABORTED", "ALREADY_EXISTS"].includes(status)) {
      setStatus("Backend lehnt Versuch fachlich ab.\nFehlerklasse: " + status.toLowerCase().replaceAll("_", "-") + "\nKeine technische Rohmeldung wurde angezeigt.");
    } else if (status === "AUTH_FAILED" || status === "AUTH_TEST_FAILED") {
      setStatus("Authentifizierung fehlgeschlagen.\nEs wurde kein Schlossversuch gestartet.");
    } else if (status === "STALE_TEST_FAILED") {
      setStatus("STALE_CHEST-Sicherheitstest fehlgeschlagen.\nPrüfe den lokalen Emulatorstand; keine Produktionsverbindung.");
    } else {
      setStatus("Function-Aufruf fehlgeschlagen.\nPrüfe die lokalen Emulatoren.\nKeine technische Rohmeldung wurde angezeigt.");
    }
  }).finally(() => {
    if (sceneIsCurrent()) pendingVariable.setBoolean(false);
  });
}
};
gdjs.BackendTestScene_95L035Code.eventsList0 = function(runtimeScene) {

{

gdjs.copyArray(runtimeScene.getObjects("BackendHintBuyButton"), gdjs.BackendTestScene_95L035Code.GDBackendHintBuyButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendHintBuyButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(1).setString("hint-buy");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BackendCalendarClaimButton"), gdjs.BackendTestScene_95L035Code.GDBackendCalendarClaimButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendCalendarClaimButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(1).setString("calendar-claim");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BackendHintRepeatButton"), gdjs.BackendTestScene_95L035Code.GDBackendHintRepeatButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendHintRepeatButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(1).setString("hint-repeat");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BackendHintReloadButton"), gdjs.BackendTestScene_95L035Code.GDBackendHintReloadButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendHintReloadButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(1).setString("hint-reload");
}
}

}


{


gdjs.BackendTestScene_95L035Code.userFunc0xce7628(runtimeScene);

}


{

gdjs.copyArray(runtimeScene.getObjects("BackendWrongButton"), gdjs.BackendTestScene_95L035Code.GDBackendWrongButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendWrongButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(1).setString("wrong");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BackendCorrectButton"), gdjs.BackendTestScene_95L035Code.GDBackendCorrectButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendCorrectButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(1).setString("correct");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BackendRepeatButton"), gdjs.BackendTestScene_95L035Code.GDBackendRepeatButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendRepeatButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(1).setString("repeat");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BackendAuthButton"), gdjs.BackendTestScene_95L035Code.GDBackendAuthButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendAuthButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(1).setString("auth-error");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BackendChestReloadButton"), gdjs.BackendTestScene_95L035Code.GDBackendChestReloadButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendChestReloadButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(1).setString("chest-reload");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BackendStaleChestButton"), gdjs.BackendTestScene_95L035Code.GDBackendStaleChestButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendStaleChestButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(1).setString("chest-stale");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BackendWalletReloadButton"), gdjs.BackendTestScene_95L035Code.GDBackendWalletReloadButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendWalletReloadButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(1).setString("wallet-reload");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BackendCookieButton"), gdjs.BackendTestScene_95L035Code.GDBackendCookieButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendCookieButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(1).setString("wallet-cookie");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BackendWalletRepeatButton"), gdjs.BackendTestScene_95L035Code.GDBackendWalletRepeatButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendWalletRepeatButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(1).setString("wallet-repeat");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BackendBoosterButton"), gdjs.BackendTestScene_95L035Code.GDBackendBoosterButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.BackendTestScene_95L035Code.mapOfGDgdjs_9546BackendTestScene_959595L035Code_9546GDBackendBoosterButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(1).setString("wallet-booster");
}
}

}


{


gdjs.BackendTestScene_95L035Code.userFunc0xaf3498(runtimeScene);

}


};

gdjs.BackendTestScene_95L035Code.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.BackendTestScene_95L035Code.GDBackendTestTitleObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendTestTitleObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendTestInfoObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendTestInfoObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWrongButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWrongButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendCorrectButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendCorrectButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendRepeatButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendRepeatButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendAuthButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendAuthButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendSharedChestStatusObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendSharedChestStatusObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendChestReloadButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendChestReloadButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendStaleChestButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendStaleChestButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWalletStatusObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWalletStatusObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWalletReloadButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWalletReloadButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendCookieButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendCookieButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWalletRepeatButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWalletRepeatButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendBoosterButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendBoosterButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendTestStatusObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendTestStatusObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintStatusObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintStatusObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintBuyButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintBuyButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintRepeatButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintRepeatButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintReloadButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintReloadButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendCalendarClaimButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendCalendarClaimButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudCookieFrameObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudCookieFrameObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpickFrameObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpickFrameObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudCookieIconObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudCookieIconObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpickIconObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpickIconObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudCookiesTextObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudCookiesTextObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpicksTextObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpicksTextObjects2.length = 0;

gdjs.BackendTestScene_95L035Code.eventsList0(runtimeScene);
gdjs.BackendTestScene_95L035Code.GDBackendTestTitleObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendTestTitleObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendTestInfoObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendTestInfoObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWrongButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWrongButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendCorrectButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendCorrectButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendRepeatButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendRepeatButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendAuthButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendAuthButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendSharedChestStatusObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendSharedChestStatusObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendChestReloadButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendChestReloadButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendStaleChestButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendStaleChestButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWalletStatusObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWalletStatusObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWalletReloadButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWalletReloadButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendCookieButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendCookieButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWalletRepeatButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendWalletRepeatButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendBoosterButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendBoosterButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendTestStatusObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendTestStatusObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintStatusObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintStatusObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintBuyButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintBuyButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintRepeatButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintRepeatButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintReloadButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendHintReloadButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendCalendarClaimButtonObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDBackendCalendarClaimButtonObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudCookieFrameObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudCookieFrameObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpickFrameObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpickFrameObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudCookieIconObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudCookieIconObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpickIconObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpickIconObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudCookiesTextObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudCookiesTextObjects2.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpicksTextObjects1.length = 0;
gdjs.BackendTestScene_95L035Code.GDResourceHudLockpicksTextObjects2.length = 0;


return;

}

gdjs['BackendTestScene_95L035Code'] = gdjs.BackendTestScene_95L035Code;
