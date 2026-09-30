gdjs.MainMenuCode = {};
gdjs.MainMenuCode.localVariables = [];
gdjs.MainMenuCode.idToCallbackMap = new Map();
gdjs.MainMenuCode.GDMainMenuTitleObjects1= [];
gdjs.MainMenuCode.GDMainMenuSkyObjects1= [];
gdjs.MainMenuCode.GDMainMenuSeaObjects1= [];
gdjs.MainMenuCode.GDMainMenuCloudObjects1= [];
gdjs.MainMenuCode.GDMainMenuFarIslandsObjects1= [];
gdjs.MainMenuCode.GDMainMenuPalmObjects1= [];
gdjs.MainMenuCode.GDMainMenuVegetationObjects1= [];
gdjs.MainMenuCode.GDMainMenuBeachObjects1= [];
gdjs.MainMenuCode.GDMainMenuWaveObjects1= [];
gdjs.MainMenuCode.GDMainMenuChestLidObjects1= [];
gdjs.MainMenuCode.GDMainMenuChestBaseObjects1= [];
gdjs.MainMenuCode.GDMainMenuTreasureObjects1= [];
gdjs.MainMenuCode.GDMainMenuParrotObjects1= [];
gdjs.MainMenuCode.GDMainMenuPirateObjects1= [];
gdjs.MainMenuCode.GDMainMenuSparkleObjects1= [];
gdjs.MainMenuCode.GDMainMenuSandMoundObjects1= [];
gdjs.MainMenuCode.GDMainMenuBackSandPileObjects1= [];
gdjs.MainMenuCode.GDMainMenuForegroundObjects1= [];
gdjs.MainMenuCode.GDMainMenuButtonObjects1= [];
gdjs.MainMenuCode.GDMainMenuLogoObjects1= [];
gdjs.MainMenuCode.GDBackgroundObjects1= [];
gdjs.MainMenuCode.GDMainMenuCoveObjects1= [];
gdjs.MainMenuCode.GDMainMenuPirateShipObjects1= [];
gdjs.MainMenuCode.GDMainMenuRowboatObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailPlantObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailDriftwoodObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailShellPinkObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailShellConchObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailShellBrokenObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailStarfishObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailStoneGrayObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailStoneGoldObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailStoneDarkObjects1= [];
gdjs.MainMenuCode.GDMainMenuPlayButtonObjects1= [];
gdjs.MainMenuCode.GDMainMenuLastSolutionButtonObjects1= [];
gdjs.MainMenuCode.GDMainMenuLastSolutionTextObjects1= [];
gdjs.MainMenuCode.GDMainMenuShopButtonObjects1= [];
gdjs.MainMenuCode.GDMainMenuMusicButtonObjects1= [];
gdjs.MainMenuCode.GDMainMenuLanguageButtonObjects1= [];
gdjs.MainMenuCode.GDMainMenuChestCrestObjects1= [];
gdjs.MainMenuCode.GDMainMenuPlayTextObjects1= [];
gdjs.MainMenuCode.GDMainMenuShopTextObjects1= [];
gdjs.MainMenuCode.GDMainMenuMusicStateTextObjects1= [];
gdjs.MainMenuCode.GDMainMenuLanguageStateTextObjects1= [];
gdjs.MainMenuCode.GDMainMenuUtilityHintTextObjects1= [];
gdjs.MainMenuCode.GDMainMenuLanguagePanelObjects1= [];
gdjs.MainMenuCode.GDMainMenuLanguagePanelTitleObjects1= [];
gdjs.MainMenuCode.GDMainMenuLanguageDeButtonObjects1= [];
gdjs.MainMenuCode.GDMainMenuLanguageEnButtonObjects1= [];
gdjs.MainMenuCode.GDMainMenuLanguageDeTextObjects1= [];
gdjs.MainMenuCode.GDMainMenuLanguageEnTextObjects1= [];
gdjs.MainMenuCode.GDStagingBadgeObjects1= [];
gdjs.MainMenuCode.GDMenuBookPaperObjects1= [];
gdjs.MainMenuCode.GDMenuBookPlaceObjects1= [];
gdjs.MainMenuCode.GDMenuBookNameObjects1= [];
gdjs.MainMenuCode.GDMenuBookChestsLabelObjects1= [];
gdjs.MainMenuCode.GDMenuBookChestsCountObjects1= [];
gdjs.MainMenuCode.GDMenuBookConsumedLabelObjects1= [];
gdjs.MainMenuCode.GDMenuBookCookieIconObjects1= [];
gdjs.MainMenuCode.GDMenuBookCookieCountObjects1= [];
gdjs.MainMenuCode.GDMenuBookLockpickIconObjects1= [];
gdjs.MainMenuCode.GDMenuBookLockpickCountObjects1= [];
gdjs.MainMenuCode.GDMenuBookStatusObjects1= [];
gdjs.MainMenuCode.GDResourceHudCookieFrameObjects1= [];
gdjs.MainMenuCode.GDResourceHudLockpickFrameObjects1= [];
gdjs.MainMenuCode.GDResourceHudCookieIconObjects1= [];
gdjs.MainMenuCode.GDResourceHudLockpickIconObjects1= [];
gdjs.MainMenuCode.GDResourceHudCookiesTextObjects1= [];
gdjs.MainMenuCode.GDResourceHudLockpicksTextObjects1= [];


gdjs.MainMenuCode.userFunc0xe94888 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-051/L&L-059: Zentrale, fail-closed Backendumgebung und letzte Lösung.
const backendGame = runtimeScene.getGame();
if (!backendGame.__lockLootBackendRuntime) {
  const backendVariables = backendGame.getVariables();
  const environment = backendVariables.get("backendEnvironment").getAsString();
  let catalog = null;
  try { catalog = JSON.parse(backendVariables.get("backendConfigJson").getAsString()); } catch (error) {}
  const makeError = (message, status, details = {}) => Object.assign(new Error(message), { status, details, reason: typeof details.reason === "string" ? details.reason : "" });
  const allowedEnvironments = new Set(["local", "staging", "production"]);
  if (!catalog || catalog.schemaVersion !== 1 || !allowedEnvironments.has(environment)) {
    backendGame.__lockLootBackendRuntime = Object.freeze({
      environment: "blocked", enabled: false, sessionStorageKey: "", endpoints: Object.freeze({}),
      getUid: () => "", readSession: () => null, saveSession: () => {},
      authenticate: async () => { throw makeError("Backendkonfiguration fehlt.", "ENVIRONMENT_BLOCKED"); },
      refresh: async () => { throw makeError("Backendkonfiguration fehlt.", "ENVIRONMENT_BLOCKED"); },
      prepare: async () => { throw makeError("Backendkonfiguration fehlt.", "ENVIRONMENT_BLOCKED"); },
      callCallable: async () => { throw makeError("Backendkonfiguration fehlt.", "ENVIRONMENT_BLOCKED"); }
    });
  } else {
    const config = catalog[environment];
    const enabled = environment !== "production" && config && config.enabled === true;
    const isLocal = environment === "local";
    const endpointNames = ["bootstrap", "buyHintPackage", "attemptChest", "claim"];
    const endpoints = enabled ? Object.freeze(isLocal ? {...config.endpoints} : {...config.functionNames}) : Object.freeze({});
    const sessionStorageKey = enabled && typeof config.sessionStorageKey === "string" ? config.sessionStorageKey : "";
    let sdkPromise = null;
    let currentUid = "";
    const assertLocalEndpoint = endpoint => {
      const parsed = new URL(endpoint);
      if (parsed.protocol !== "http:" || parsed.hostname !== "127.0.0.1" || !["9099", "5001"].includes(parsed.port)) throw makeError("Lokale Backendgrenze verletzt.", "LOCAL_BOUNDARY");
    };
    const readSession = () => {
      if (!enabled || !isLocal) return null;
      try {
        const raw = globalThis.localStorage ? globalThis.localStorage.getItem(sessionStorageKey) : "";
        const value = raw ? JSON.parse(raw) : null;
        return value && typeof value.idToken === "string" && typeof value.uid === "string" ? value : null;
      } catch (error) { return null; }
    };
    const saveSession = session => {
      if (!enabled || !isLocal) return;
      try { if (globalThis.localStorage) globalThis.localStorage.setItem(sessionStorageKey, JSON.stringify(session)); } catch (error) {}
    };
    const requestJson = async (endpoint, body, idToken = "", formEncoded = false) => {
      assertLocalEndpoint(endpoint);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const headers = {"Content-Type": formEncoded ? "application/x-www-form-urlencoded" : "application/json"};
        if (idToken) headers.Authorization = "Bearer " + idToken;
        const response = await fetch(endpoint, {method: "POST", headers, body: formEncoded ? body : JSON.stringify(body), signal: controller.signal});
        const responseText = await response.text();
        let payload = null;
        try { payload = responseText ? JSON.parse(responseText) : null; } catch (error) { throw makeError("Ungueltige Backendantwort.", "INVALID_RESPONSE"); }
        if (!response.ok || payload && payload.error) {
          const status = payload && payload.error && typeof payload.error.status === "string" ? payload.error.status : "HTTP_" + response.status;
          const details = payload && payload.error && payload.error.details && typeof payload.error.details === "object" ? payload.error.details : {};
          throw makeError("Backendanfrage abgelehnt.", status, details);
        }
        return payload;
      } finally { clearTimeout(timeout); }
    };
    const validateStagingConfig = () => {
      if (!enabled || environment !== "staging" || config.projectId !== "lock-loot-staging" || config.region !== "europe-west1" || config.allowedOrigin !== "https://zaarol-cloud.github.io") throw makeError("Staginggrenze verletzt.", "STAGING_BOUNDARY");
      const web = config.firebaseWebConfig;
      const values = [web && web.apiKey, web && web.authDomain, web && web.projectId, web && web.appId, config.appCheckSiteKey];
      if (values.some(value => typeof value !== "string" || !value || value.startsWith("__LOCK_LOOT_")) || web.projectId !== "lock-loot-staging") throw makeError("Stagingkonfiguration ist noch nicht gesetzt.", "STAGING_CONFIG_MISSING");
      for (const name of endpointNames) if (typeof endpoints[name] !== "string" || !endpoints[name]) throw makeError("Staging-Callable fehlt.", "STAGING_CONFIG_MISSING");
    };
    const normalizeSdkError = error => {
      const rawCode = error && typeof error.code === "string" ? error.code.split("/").pop() : "";
      if (["network-request-failed", "unavailable", "deadline-exceeded"].includes(rawCode)) return Object.assign(new TypeError("Backend nicht erreichbar."), {status: "BACKEND_UNREACHABLE"});
      const status = rawCode ? rawCode.replace(/-/g, "_").toUpperCase() : "BACKEND_REJECTED";
      const details = error && error.details && typeof error.details === "object" ? error.details : {};
      return makeError("Backendanfrage abgelehnt.", status, details);
    };
    const ensureStagingSdk = async () => {
      validateStagingConfig();
      if (!sdkPromise) sdkPromise = (async () => {
        const version = catalog.sdkVersion;
        if (version !== "12.17.1") throw makeError("Firebase-SDK-Version nicht freigegeben.", "SDK_VERSION_BLOCKED");
        const base = "https://www.gstatic.com/firebasejs/" + version + "/";
        const [appModule, authModule, functionsModule, appCheckModule] = await Promise.all([
          import(base + "firebase-app.js"), import(base + "firebase-auth.js"),
          import(base + "firebase-functions.js"), import(base + "firebase-app-check.js")
        ]);
        const existing = appModule.getApps().find(app => app.name === "lock-loot-staging-client");
        const app = existing || appModule.initializeApp(config.firebaseWebConfig, "lock-loot-staging-client");
        const auth = authModule.getAuth(app);
        await authModule.setPersistence(auth, authModule.browserLocalPersistence);
        const appCheck = appCheckModule.initializeAppCheck(app, {
          provider: new appCheckModule.ReCaptchaEnterpriseProvider(config.appCheckSiteKey),
          isTokenAutoRefreshEnabled: true
        });
        const functions = functionsModule.getFunctions(app, config.region);
        return {authModule, functionsModule, auth, appCheck, functions};
      })();
      return sdkPromise;
    };
    const authenticate = async forceRefresh => {
      if (!enabled) throw makeError("Backendumgebung ist deaktiviert.", "ENVIRONMENT_BLOCKED");
      if (isLocal) {
        if (forceRefresh) {
          const session = readSession();
          if (!session || !session.refreshToken) throw makeError("Lokales Refresh-Token fehlt.", "AUTH_FAILED");
          const body = "grant_type=refresh_token&refresh_token=" + encodeURIComponent(session.refreshToken);
          const payload = await requestJson(config.endpoints.refresh, body, "", true);
          if (!payload || typeof payload.id_token !== "string" || typeof payload.user_id !== "string" || typeof payload.refresh_token !== "string") throw makeError("Lokale Token-Erneuerung ungueltig.", "AUTH_FAILED");
          const refreshed = {idToken: payload.id_token, uid: payload.user_id, refreshToken: payload.refresh_token};
          currentUid = refreshed.uid; saveSession(refreshed); return refreshed;
        }
        const existing = readSession();
        if (existing) { currentUid = existing.uid; return existing; }
        const payload = await requestJson(config.endpoints.auth, {returnSecureToken: true});
        if (!payload || typeof payload.idToken !== "string" || typeof payload.localId !== "string" || typeof payload.refreshToken !== "string") throw makeError("Anonyme Emulatorauthentifizierung ungueltig.", "AUTH_FAILED");
        const created = {idToken: payload.idToken, uid: payload.localId, refreshToken: payload.refreshToken};
        currentUid = created.uid; saveSession(created); return created;
      }
      try {
        const sdk = await ensureStagingSdk();
        if (typeof sdk.auth.authStateReady === "function") await sdk.auth.authStateReady();
        const user = sdk.auth.currentUser || (await sdk.authModule.signInAnonymously(sdk.auth)).user;
        if (forceRefresh) await user.getIdToken(true);
        currentUid = user.uid;
        return {idToken: "sdk-managed", uid: user.uid, refreshToken: "sdk-managed"};
      } catch (error) { throw normalizeSdkError(error); }
    };
    const callCallable = async (endpoint, data, idToken = "") => {
      if (!enabled) throw makeError("Backendumgebung ist deaktiviert.", "ENVIRONMENT_BLOCKED");
      if (isLocal) {
        const payload = await requestJson(endpoint, {data}, idToken);
        const result = payload && payload.result !== undefined ? payload.result : payload && payload.data;
        if (result === undefined) throw makeError("Callable-Ergebnis fehlt.", "INVALID_RESPONSE");
        return result;
      }
      try {
        const sdk = await ensureStagingSdk();
        if (!sdk.auth.currentUser) await authenticate(false);
        const normalized = {...data, integration: "L&L-051"};
        const callable = sdk.functionsModule.httpsCallable(sdk.functions, endpoint);
        const response = await callable(normalized);
        return response.data;
      } catch (error) { throw normalizeSdkError(error); }
    };
    const runtime = Object.freeze({
      environment, enabled, isLocal, config: Object.freeze({...config}), endpoints,
      sessionStorageKey, readSession, saveSession, getUid: () => currentUid,
      authenticate, refresh: async () => authenticate(true), callCallable,
      prepare: async integration => isLocal ? callCallable(config.endpoints.prepare, {integration}, (readSession() || {}).idToken || "") : null
    });
    backendGame.__lockLootBackendRuntime = runtime;
  }
}
// L&L-059: Einziger clientseitiger Zugang zu einer serverautoritativen letzten Lösung.
// Der Zustand ist UID-/Rotations-gebunden, tief eingefroren und wird vor jeder Mutation vollständig geprüft.
if (!backendGame.__lockLootLastSolution) {
  const globals = backendGame.getVariables();
  const idPattern = /^[A-Za-z0-9_-]{1,128}$/;
  const codePattern = /^\d{11}$/;
  const exactKeys = (value, keys) => value && typeof value === "object" && !Array.isArray(value) && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());
  const contractError = message => Object.assign(new Error(message), {status: "INVALID_RESPONSE"});
  const requireId = (value, field) => {
    if (typeof value !== "string" || !idPattern.test(value)) throw contractError(field + " ist ungültig.");
    return value;
  };
  const requirePositiveInteger = (value, field) => {
    if (!Number.isSafeInteger(value) || value < 1) throw contractError(field + " ist ungültig.");
    return value;
  };
  const requireNonNegativeInteger = (value, field) => {
    if (!Number.isSafeInteger(value) || value < 0) throw contractError(field + " ist ungültig.");
    return value;
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  const deepFreeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    for (const child of Object.values(value)) deepFreeze(child);
    return Object.freeze(value);
  };
  const forbiddenFields = new Set([
    "solution" + "Code", "assignmentSalt", "assignmentSeedHash", "assignedHints",
    "generatorSeedOverride", "t504Fairness", "signature", "truthValue",
    "mathematicalRule", "internalPositions", "details", "specialRule",
    "independentValidation", "codewideDerivations", "intentionallyFalse",
    "fairnessValidated"
  ]);
  const containsForbiddenField = value => {
    if (!value || typeof value !== "object") return false;
    return Object.entries(value).some(([key, child]) => forbiddenFields.has(key) || containsForbiddenField(child));
  };
  const requireShortString = (value, field, maximum = 512) => {
    if (typeof value !== "string" || !value.trim() || value.length > maximum) throw contractError(field + " ist ungültig.");
    return value;
  };
  const requireJsonScalarTree = (value, depth = 0) => {
    if (depth > 4) throw contractError("Erklärmetadaten sind zu tief verschachtelt.");
    if (value === null || typeof value === "boolean") return;
    if (typeof value === "string") { if (value.length > 256) throw contractError("Erklärtext ist zu lang."); return; }
    if (typeof value === "number") { if (!Number.isSafeInteger(value) || Math.abs(value) > 1000000) throw contractError("Erklärzahl ist ungültig."); return; }
    if (Array.isArray(value)) {
      if (value.length > 16) throw contractError("Erklärliste ist zu lang.");
      for (const child of value) requireJsonScalarTree(child, depth + 1);
      return;
    }
    if (value && typeof value === "object") {
      const keys = Object.keys(value);
      if (keys.length > 12) throw contractError("Zu viele Erklärfelder.");
      for (const child of Object.values(value)) requireJsonScalarTree(child, depth + 1);
      return;
    }
    throw contractError("Erklärmetadaten sind ungültig.");
  };
  const validateHint = (hint, index) => {
    const keys = ["index", "id", "tier", "text", "textByLanguage", "visiblePositions", "positionRoles", "lengthClass", "packageNumber", "packagePosition", "explanationType", "explanationData"];
    if (!exactKeys(hint, keys) || containsForbiddenField(hint)) throw contractError("Hinweisvertrag enthält unerwartete Felder.");
    if (hint.index !== index + 1 || hint.packageNumber !== Math.floor(index / 2) + 1 || hint.packagePosition !== index % 2 + 1) throw contractError("Hinweisreihenfolge ist ungültig.");
    requireId(hint.id, "hint.id");
    if (!Number.isSafeInteger(hint.tier) || hint.tier < 1 || hint.tier > 5) throw contractError("hint.tier ist ungültig.");
    requireShortString(hint.text, "hint.text");
    if (!exactKeys(hint.textByLanguage, ["de", "en"]) || hint.textByLanguage.de !== hint.text) throw contractError("Hintlokalisierung ist ungültig.");
    requireShortString(hint.textByLanguage.de, "hint.textByLanguage.de");
    requireShortString(hint.textByLanguage.en, "hint.textByLanguage.en");
    if (!Array.isArray(hint.visiblePositions) || hint.visiblePositions.length > 11 || hint.visiblePositions.some(position => !Number.isSafeInteger(position) || position < 1 || position > 11)) throw contractError("Hintpositionen sind ungültig.");
    if (!Array.isArray(hint.positionRoles) || hint.positionRoles.length !== hint.visiblePositions.length || hint.positionRoles.some(role => typeof role !== "string" || !role.trim() || role.length > 128)) throw contractError("Hintrollen sind ungültig.");
    if (!["kurz", "mittel", "lang"].includes(hint.lengthClass)) throw contractError("Hintlängenklasse ist ungültig.");
    requireShortString(hint.explanationType, "hint.explanationType", 64);
    const explanationKeys = ["hintId", "visiblePositions", "positionRoles", "propertyKey", "derivationKeys", "variant", "result", "operation", "divisor", "comparison"];
    if (!hint.explanationData || typeof hint.explanationData !== "object" || Array.isArray(hint.explanationData) || Object.keys(hint.explanationData).some(key => !explanationKeys.includes(key))) throw contractError("Erklärvertrag enthält unerwartete Felder.");
    if (hint.explanationData.hintId !== hint.id || JSON.stringify(hint.explanationData.visiblePositions) !== JSON.stringify(hint.visiblePositions) || JSON.stringify(hint.explanationData.positionRoles) !== JSON.stringify(hint.positionRoles)) throw contractError("Erklärvertrag passt nicht zum Hinweis.");
    requireJsonScalarTree(hint.explanationData);
    return {
      index: hint.index, id: hint.id, tier: hint.tier, text: hint.text,
      textByLanguage: {de: hint.textByLanguage.de, en: hint.textByLanguage.en},
      visiblePositions: [...hint.visiblePositions], positionRoles: [...hint.positionRoles],
      lengthClass: hint.lengthClass, packageNumber: hint.packageNumber,
      packagePosition: hint.packagePosition, explanationType: hint.explanationType,
      explanationData: clone(hint.explanationData)
    };
  };
  const normalizeContract = (value, context) => {
    if (!context || typeof context !== "object") throw contractError("Lösungskontext fehlt.");
    const generation = requirePositiveInteger(context.generation, "generation");
    const uid = requireId(context.uid, "uid");
    const activeChestId = requireId(context.activeChestId, "activeChestId");
    const rotation = requireNonNegativeInteger(context.rotation, "rotation");
    const activeContentVersion = requirePositiveInteger(context.activeContentVersion, "activeContentVersion");
    const contractKeys = ["schemaVersion", "rotation", "activeChestId", "available", "reason", "previousChestId", "snapshot"];
    if (!exactKeys(value, contractKeys) || value.schemaVersion !== 1 || value.rotation !== rotation || value.activeChestId !== activeChestId || typeof value.available !== "boolean") throw contractError("Letzte-Lösung-Vertrag ist ungültig.");
    const previousChestId = value.previousChestId === "" ? "" : requireId(value.previousChestId, "previousChestId");
    if (previousChestId === activeChestId) throw contractError("Aktive Kiste darf nie letzte Lösung sein.");
    if (!value.available) {
      if (!["NO_HISTORY", "NO_HINT_PURCHASE", "INVALID_SNAPSHOT"].includes(value.reason) || value.snapshot !== null) throw contractError("Deaktivierter Lösungsvertrag ist ungültig.");
      if (value.reason === "NO_HISTORY" && previousChestId !== "") throw contractError("NO_HISTORY enthält eine Kiste.");
      if (value.reason === "NO_HINT_PURCHASE" && previousChestId === "") throw contractError("NO_HINT_PURCHASE enthält keine Kiste.");
      const contract = {schemaVersion: 1, rotation, activeChestId, available: false, reason: value.reason, previousChestId, snapshot: null};
      return deepFreeze({uid, generation, rotation, activeChestId, activeContentVersion, contract, digest: JSON.stringify({activeContentVersion, contract})});
    }
    if (value.reason !== "ELIGIBLE" || !previousChestId) throw contractError("Berechtigter Lösungsvertrag ist ungültig.");
    const snapshotKeys = ["schemaVersion", "chestId", "closedCode", "purchasedPackageCount", "revealedHintCount", "revealedHints", "contentVersion", "hintGeneratorVersion", "playerChestRevision", "rotation"];
    const snapshot = value.snapshot;
    if (!exactKeys(snapshot, snapshotKeys) || snapshot.schemaVersion !== 1 || snapshot.chestId !== previousChestId || snapshot.rotation !== rotation || typeof snapshot.closedCode !== "string" || !codePattern.test(snapshot.closedCode)) throw contractError("Lösungssnapshot ist ungültig.");
    if (!Number.isSafeInteger(snapshot.purchasedPackageCount) || snapshot.purchasedPackageCount < 1 || snapshot.purchasedPackageCount > 5 || snapshot.revealedHintCount !== snapshot.purchasedPackageCount * 2 || !Array.isArray(snapshot.revealedHints) || snapshot.revealedHints.length !== snapshot.revealedHintCount) throw contractError("Gekaufte Hinweise stimmen nicht mit dem Snapshot überein.");
    const contentVersion = requirePositiveInteger(snapshot.contentVersion, "snapshot.contentVersion");
    if (contentVersion + 1 !== activeContentVersion) throw contractError("Lösungssnapshot gehört nicht zur vorherigen Kiste.");
    const normalizedSnapshot = {
      schemaVersion: 1, chestId: previousChestId, closedCode: snapshot.closedCode,
      purchasedPackageCount: snapshot.purchasedPackageCount,
      revealedHintCount: snapshot.revealedHintCount,
      revealedHints: snapshot.revealedHints.map(validateHint),
      contentVersion,
      hintGeneratorVersion: requirePositiveInteger(snapshot.hintGeneratorVersion, "snapshot.hintGeneratorVersion"),
      playerChestRevision: requireNonNegativeInteger(snapshot.playerChestRevision, "snapshot.playerChestRevision"),
      rotation
    };
    if (containsForbiddenField(normalizedSnapshot)) throw contractError("Interne Felder im Lösungssnapshot.");
    const contract = {schemaVersion: 1, rotation, activeChestId, available: true, reason: "ELIGIBLE", previousChestId, snapshot: normalizedSnapshot};
    return deepFreeze({uid, generation, rotation, activeChestId, activeContentVersion, contract, digest: JSON.stringify({activeContentVersion, contract})});
  };
  const clearGlobals = () => {
    globals.get("previousSolutionAvailable").setBoolean(false);
    globals.get("previousSolutionCode").fromJSObject([]);
    globals.get("previousSolutionHints").fromJSObject([]);
    globals.get("previousSolutionMetadata").fromJSObject([]);
    globals.get("previousSolutionHintCount").setNumber(0);
    globals.get("previousSolutionSourceMode").setString("");
  };
  const applyGlobals = snapshot => {
    clearGlobals();
    const metadata = clone(snapshot.revealedHints);
    globals.get("previousSolutionCode").fromJSObject(snapshot.closedCode.split("").map(Number));
    globals.get("previousSolutionHints").fromJSObject(metadata.map(hint => hint.textByLanguage.de));
    globals.get("previousSolutionMetadata").fromJSObject(metadata);
    globals.get("previousSolutionHintCount").setNumber(metadata.length);
    globals.get("previousSolutionSourceMode").setString("Server-L059");
    globals.get("previousSolutionAvailable").setBoolean(true);
  };
  const state = {uid: "", generation: 0, highestRotation: -1, highestContentVersion: -1, digest: "", activeChestId: "", available: false, reason: "UNINITIALIZED", snapshot: null};
  const markUnavailable = reason => {
    state.available = false;
    state.reason = typeof reason === "string" && reason ? reason : "UNAVAILABLE";
    state.snapshot = null;
    clearGlobals();
  };
  const begin = uid => {
    const validatedUid = requireId(uid, "uid");
    state.generation += 1;
    if (state.uid !== validatedUid) {
      state.uid = validatedUid;
      state.highestRotation = -1;
      state.highestContentVersion = -1;
      state.digest = "";
      state.activeChestId = "";
    }
    markUnavailable("LOADING");
    return Object.freeze({uid: state.uid, generation: state.generation});
  };
  const invalidate = reason => {
    state.generation += 1;
    markUnavailable(reason || "LOADING");
  };
  const isCurrent = token => !!(token && token.uid === state.uid && token.generation === state.generation);
  const commit = candidate => {
    if (!candidate || typeof candidate !== "object" || !Object.isFrozen(candidate)) throw contractError("Ungeprüfter Lösungskandidat.");
    if (state.uid !== candidate.uid || state.generation !== candidate.generation) return false;
    if (candidate.rotation < state.highestRotation || candidate.activeContentVersion < state.highestContentVersion) {
      markUnavailable("STALE_RESPONSE");
      return false;
    }
    if (state.highestRotation >= 0 && ((candidate.rotation > state.highestRotation && candidate.activeContentVersion <= state.highestContentVersion) || (candidate.rotation === state.highestRotation && candidate.activeContentVersion !== state.highestContentVersion))) {
      markUnavailable("INVALID_SNAPSHOT");
      return false;
    }
    if (candidate.rotation === state.highestRotation && state.digest && candidate.digest !== state.digest) {
      markUnavailable("INVALID_SNAPSHOT");
      return false;
    }
    state.highestRotation = candidate.rotation;
    state.highestContentVersion = candidate.activeContentVersion;
    state.digest = candidate.digest;
    state.activeChestId = candidate.activeChestId;
    state.available = candidate.contract.available;
    state.reason = candidate.contract.reason;
    state.snapshot = candidate.contract.available ? candidate.contract.snapshot : null;
    if (state.snapshot) applyGlobals(state.snapshot); else clearGlobals();
    return true;
  };
  const currentSnapshot = () => state.available && state.snapshot ? state.snapshot : null;
  const openSnapshot = () => {
    const snapshot = currentSnapshot();
    if (!snapshot) return false;
    applyGlobals(snapshot);
    return true;
  };
  backendGame.__lockLootLastSolution = Object.freeze({
    validate: normalizeContract, commit, begin, invalidate, isCurrent, markUnavailable, currentSnapshot, openSnapshot,
    getState: () => Object.freeze({uid: state.uid, generation: state.generation, highestRotation: state.highestRotation, highestContentVersion: state.highestContentVersion, activeChestId: state.activeChestId, available: state.available, reason: state.reason, snapshot: state.snapshot})
  });
}
const backendRuntime = backendGame.__lockLootBackendRuntime;
for (const badge of runtimeScene.getObjects("StagingBadge")) {
  const badgeI18n = backendGame.__lockLootI18n;
  badge.setString(badgeI18n ? badgeI18n.t("common.staging") : "STAGING");
  badge.hide(!backendRuntime || backendRuntime.environment !== "staging");
}
};
gdjs.MainMenuCode.userFunc0xcdd4b0 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-052: Eine zentrale, lokale und szenenübergreifende Musiksteuerung für alle aktiven Spielerszenen.
const musicGame = runtimeScene.getGame();
const musicControllerKey = '__lockLootMusicController';
if (!musicGame[musicControllerKey]) {
  const musicChannel = 20;
  const musicStorageKey = 'lockloot.music.enabled.v1';
  const forcedMainTrack = { name: 'music_main_always', style: 'Neutral', category: 'main' };
  const mainTracks = [
    forcedMainTrack,
    { name: 'music_main_accordion_1', style: 'Akkordeon', category: 'main' },
    { name: 'music_main_accordion_2', style: 'Akkordeon', category: 'main' },
    { name: 'music_main_marimba_1', style: 'Marimba', category: 'main' },
    { name: 'music_main_marimba_2', style: 'Marimba', category: 'main' }
  ];
  const puzzleTracks = [
    { name: 'music_puzzle_accordion_1', style: 'Akkordeon', category: 'puzzle' },
    { name: 'music_puzzle_accordion_2', style: 'Akkordeon', category: 'puzzle' },
    { name: 'music_puzzle_accordion_3', style: 'Akkordeon', category: 'puzzle' },
    { name: 'music_puzzle_accordion_4', style: 'Akkordeon', category: 'puzzle' },
    { name: 'music_puzzle_acoustic_1', style: 'Akustik', category: 'puzzle' },
    { name: 'music_puzzle_acoustic_2', style: 'Akustik', category: 'puzzle' },
    { name: 'music_puzzle_acoustic_3', style: 'Akustik', category: 'puzzle' },
    { name: 'music_puzzle_acoustic_4', style: 'Akustik', category: 'puzzle' },
    { name: 'music_puzzle_marimba_1', style: 'Marimba', category: 'puzzle' },
    { name: 'music_puzzle_marimba_2', style: 'Marimba', category: 'puzzle' },
    { name: 'music_puzzle_marimba_3', style: 'Marimba', category: 'puzzle' },
    { name: 'music_puzzle_marimba_4', style: 'Marimba', category: 'puzzle' },
    { name: 'music_puzzle_marimba_5', style: 'Marimba', category: 'puzzle' },
    { name: 'music_puzzle_marimba_6', style: 'Marimba', category: 'puzzle' }
  ];
  let storedMusicEnabled = '';
  try { storedMusicEnabled = globalThis.localStorage ? String(globalThis.localStorage.getItem(musicStorageKey) || '') : ''; } catch (error) {}
  const state = {
    storageKey: musicStorageKey,
    musicEnabled: storedMusicEnabled !== 'false',
    sessionStarted: false,
    currentTrack: null,
    currentCategory: '',
    recentTracks: [],
    lastStyle: '',
    puzzleTracksRemaining: 2,
    wasPlaying: false,
    lastStartAttempt: 0,
    activeScene: null,
    solutionState: null,
    victoryState: null,
    victoryActive: false,
    error: ''
  };
  const persistEnabled = () => {
    try { if (globalThis.localStorage) globalThis.localStorage.setItem(musicStorageKey, state.musicEnabled ? 'true' : 'false'); } catch (error) {}
  };
  const chooseTrack = pool => {
    const eligible = pool.filter(track => track.style !== state.lastStyle && !state.recentTracks.includes(track.name));
    if (eligible.length === 0) { state.error = 'Keine Musik erfüllt Stil- und Wiederholungsschutz.'; return null; }
    return eligible[Math.floor(Math.random() * eligible.length)];
  };
  const rememberTrack = track => {
    state.recentTracks.unshift(track.name);
    state.recentTracks = state.recentTracks.slice(0, 5);
    state.lastStyle = track.style;
  };
  const startTrack = (scene, track, remember) => {
    if (!state.musicEnabled || !track) return false;
    if (remember) rememberTrack(track);
    state.currentTrack = track;
    state.currentCategory = track.category;
    state.wasPlaying = false;
    state.lastStartAttempt = Date.now();
    gdjs.evtTools.sound.setMusicOnChannelVolume(scene, musicChannel, 70);
    gdjs.evtTools.sound.playMusicOnChannel(scene, track.name, musicChannel, false, 70, 1);
    return true;
  };
  const startNextTrack = scene => {
    let nextTrack = null;
    if (state.puzzleTracksRemaining > 0) {
      nextTrack = chooseTrack(puzzleTracks);
      if (nextTrack) state.puzzleTracksRemaining -= 1;
    } else {
      nextTrack = chooseTrack(mainTracks);
      if (nextTrack) state.puzzleTracksRemaining = 2;
    }
    return startTrack(scene, nextTrack, true);
  };
  const startMainTrack = scene => {
    state.error = '';
    const nextTrack = chooseTrack(mainTracks);
    if (nextTrack) state.puzzleTracksRemaining = 2;
    return startTrack(scene, nextTrack, true);
  };
  const startApplication = scene => {
    state.error = '';
    state.puzzleTracksRemaining = 2;
    return startTrack(scene, forcedMainTrack, true);
  };
  const stopCurrentTrack = scene => {
    gdjs.evtTools.sound.stopMusicOnChannel(scene, musicChannel);
    state.currentTrack = null;
    state.currentCategory = '';
    state.wasPlaying = false;
    state.lastStartAttempt = 0;
  };
  const enterMainMenu = scene => {
    if (!state.musicEnabled) return;
    const currentTrack = state.currentTrack;
    const mainTrackIsPlaying = currentTrack && currentTrack.category === 'main' && gdjs.evtTools.sound.isMusicOnChannelPlaying(scene, musicChannel);
    if (mainTrackIsPlaying) return;
    stopCurrentTrack(scene);
    startMainTrack(scene);
  };
  const enterSolution = scene => {
    stopCurrentTrack(scene);
    state.currentCategory = 'solution';
    state.solutionState = { scene, started: false, completed: false, lastStartAttempt: Date.now() };
    if (!state.musicEnabled) return;
    gdjs.evtTools.sound.setMusicOnChannelVolume(scene, musicChannel, 75);
    gdjs.evtTools.sound.playMusicOnChannel(scene, 'music_solution_once', musicChannel, false, 75, 1);
  };
  const updateSolution = scene => {
    if (!state.musicEnabled || !state.solutionState || state.solutionState.scene !== scene) return;
    const solutionPlaying = gdjs.evtTools.sound.isMusicOnChannelPlaying(scene, musicChannel);
    if (solutionPlaying) {
      state.solutionState.started = true;
    } else if (state.solutionState.started) {
      state.solutionState.completed = true;
    } else if (!state.solutionState.completed && Date.now() - state.solutionState.lastStartAttempt >= 1500) {
      state.solutionState.lastStartAttempt = Date.now();
      gdjs.evtTools.sound.playMusicOnChannel(scene, 'music_solution_once', musicChannel, false, 75, 1);
    }
  };
  const startVictory = scene => {
    if (state.victoryActive && state.victoryState?.scene === scene) return false;
    stopCurrentTrack(scene);
    state.victoryActive = true;
    state.victoryState = { scene, started: false, completed: false, lastStartAttempt: Date.now(), attempts: 0 };
    state.currentTrack = { name: 'music_victory_sequence', style: 'Victory', category: 'victory' };
    state.currentCategory = 'victory';
    if (!state.musicEnabled) return false;
    gdjs.evtTools.sound.setMusicOnChannelVolume(scene, musicChannel, 75);
    state.victoryState.attempts += 1;
    gdjs.evtTools.sound.playMusicOnChannel(scene, 'music_victory_sequence', musicChannel, false, 75, 1);
    return true;
  };
  const stopVictory = scene => {
    if (state.victoryActive || state.currentCategory === 'victory') {
      gdjs.evtTools.sound.stopMusicOnChannel(scene, musicChannel);
      state.currentTrack = null;
      state.currentCategory = '';
    }
    state.victoryActive = false;
    state.victoryState = null;
  };
  const silenceForChestEnd = scene => {
    stopCurrentTrack(scene);
    state.victoryActive = false;
    state.victoryState = null;
  };
  const updateVictory = scene => {
    if (!state.victoryActive || !state.victoryState || state.victoryState.scene !== scene || !state.musicEnabled) return;
    const playing = gdjs.evtTools.sound.isMusicOnChannelPlaying(scene, musicChannel);
    if (playing) state.victoryState.started = true;
    else if (state.victoryState.started) state.victoryState.completed = true;
    else if (!state.victoryState.completed && Date.now() - state.victoryState.lastStartAttempt >= 1500) {
      state.victoryState.lastStartAttempt = Date.now();
      state.victoryState.attempts += 1;
      gdjs.evtTools.sound.playMusicOnChannel(scene, 'music_victory_sequence', musicChannel, false, 75, 1);
    }
  };
  const updateRotation = scene => {
    if (!state.musicEnabled || !state.currentTrack || state.error) return;
    const playing = gdjs.evtTools.sound.isMusicOnChannelPlaying(scene, musicChannel);
    if (playing) { state.wasPlaying = true; return; }
    if (state.wasPlaying) { state.wasPlaying = false; startNextTrack(scene); return; }
    if (Date.now() - state.lastStartAttempt >= 1500) {
      state.lastStartAttempt = Date.now();
      gdjs.evtTools.sound.playMusicOnChannel(scene, state.currentTrack.name, musicChannel, false, 70, 1);
    }
  };
  const updateForScene = scene => {
    const sceneName = scene.getName();
    if (state.victoryActive && state.victoryState?.scene !== scene) stopVictory(scene);
    if (state.activeScene !== scene) {
      state.activeScene = scene;
      if (!state.sessionStarted) {
        state.sessionStarted = true;
        if (sceneName === 'SolutionScene') enterSolution(scene);
        else if (sceneName === 'MainMenu' || sceneName === 'TrainingScene') startApplication(scene);
      } else if (sceneName === 'MainMenu') {
        enterMainMenu(scene);
      } else if (sceneName === 'SolutionScene') {
        enterSolution(scene);
      } else if (sceneName === 'TrainingScene' && state.musicEnabled && !state.currentTrack) {
        startNextTrack(scene);
      }
    }
    gdjs.evtTools.sound.setMusicOnChannelVolume(scene, musicChannel, state.musicEnabled ? (sceneName === 'SolutionScene' ? 75 : 70) : 0);
    if (!state.musicEnabled) return;
    if (state.victoryActive) updateVictory(scene);
    else if (sceneName === 'SolutionScene') updateSolution(scene);
    else updateRotation(scene);
  };
  const setEnabled = (scene, enabled) => {
    const nextEnabled = enabled === true;
    const changed = state.musicEnabled !== nextEnabled;
    state.musicEnabled = nextEnabled;
    persistEnabled();
    if (!state.musicEnabled) {
      stopCurrentTrack(scene);
      state.solutionState = null;
      gdjs.evtTools.sound.setMusicOnChannelVolume(scene, musicChannel, 0);
      return false;
    }
    gdjs.evtTools.sound.setMusicOnChannelVolume(scene, musicChannel, 70);
    if (!changed) return true;
    state.error = '';
    const sceneName = scene.getName();
    if (sceneName === 'MainMenu') startMainTrack(scene);
    else if (sceneName === 'TrainingScene') startNextTrack(scene);
    else if (sceneName === 'SolutionScene') enterSolution(scene);
    return true;
  };
  musicGame[musicControllerKey] = { state, setEnabled, updateForScene, startVictory, stopVictory, silenceForChestEnd };
}
musicGame[musicControllerKey].updateForScene(runtimeScene);
};
gdjs.MainMenuCode.userFunc0xe53e00 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-061: Das bestehende Hauptmenü bleibt im lokalen und mobilen Hochformat vollständig sichtbar.
const journalMenuGame = runtimeScene.getGame();
const journalMenuRemember = (element, properties) => Object.fromEntries(properties.map(property =>
  [property, {value: element?.style.getPropertyValue(property) || "",
    priority: element?.style.getPropertyPriority(property) || ""}]));
const journalMenuRestoreStyle = (element, saved) => {
  if (!element || !saved) return;
  for (const [property, entry] of Object.entries(saved)) {
    if (entry.value) element.style.setProperty(property, entry.value, entry.priority);
    else element.style.removeProperty(property);
  }
};
if (!runtimeScene.__lockLootL061MenuPortrait) {
  const canvas = journalMenuGame.getRenderer?.().getCanvas?.() || null;
  const stage = {scene: runtimeScene, canvas, restored: false,
    previousResolution: {adapt: journalMenuGame.getAdaptGameResolutionAtRuntime(),
      width: journalMenuGame.getGameResolutionWidth(), height: journalMenuGame.getGameResolutionHeight()},
    previousCanvasStyle: journalMenuRemember(canvas, ["width", "height", "left", "top", "position"]),
    previousPageStyle: typeof document === "undefined" ? null : {
      html: journalMenuRemember(document.documentElement, ["background", "background-color"]),
      body: journalMenuRemember(document.body, ["background", "background-color"])}};
  stage.restore = () => {
    if (stage.restored) return;
    stage.restored = true;
    stage.orientationNotice?.remove();
    journalMenuRestoreStyle(stage.canvas, stage.previousCanvasStyle);
    if (typeof document !== "undefined" && stage.previousPageStyle) {
      journalMenuRestoreStyle(document.documentElement, stage.previousPageStyle.html);
      journalMenuRestoreStyle(document.body, stage.previousPageStyle.body);
    }
    journalMenuGame.setGameResolutionSize(stage.previousResolution.width, stage.previousResolution.height);
    journalMenuGame.setAdaptGameResolutionAtRuntime(stage.previousResolution.adapt);
  };
  runtimeScene.__lockLootL061MenuPortrait = stage;
  journalMenuGame.__lockLootL061MenuPortrait = stage;
  if (!journalMenuGame.__lockLootL061MenuPortraitCleanupRegistered) {
    gdjs.registerRuntimeSceneUnloadingCallback(scene => {
      const current = journalMenuGame.__lockLootL061MenuPortrait;
      if (current?.scene === scene) {
        current.restore();
        delete scene.__lockLootL061MenuPortrait;
        journalMenuGame.__lockLootL061MenuPortrait = null;
      }
    });
    journalMenuGame.__lockLootL061MenuPortraitCleanupRegistered = true;
  }
}
journalMenuGame.setAdaptGameResolutionAtRuntime(false);
if (journalMenuGame.getGameResolutionWidth() !== 720 || journalMenuGame.getGameResolutionHeight() !== 1280) {
  journalMenuGame.setGameResolutionSize(720, 1280);
}
const journalMenuStage = runtimeScene.__lockLootL061MenuPortrait;
const journalMenuLandscapeWidth = typeof window === "undefined" ? 720 :
  720 * Math.min(window.innerWidth / 720, window.innerHeight / 1280);
if (typeof document !== "undefined" && journalMenuStage) {
  const needsPortrait = window.innerWidth > window.innerHeight && journalMenuLandscapeWidth < 320;
  if (needsPortrait && !journalMenuStage.orientationNotice) {
    const overlay = document.createElement("div");
    overlay.setAttribute("role", "status");
    overlay.style.cssText = "position:fixed;inset:0;z-index:200000;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:#102f36;color:#fff4dc;font:600 18px Arial,sans-serif;text-align:center;overflow:auto";
    const card = document.createElement("div");
    card.style.cssText = "max-width:420px;max-height:100%;overflow:auto;padding:22px;border:3px solid #bc914f;border-radius:18px;background:#174b53;box-shadow:0 10px 30px #061c22;box-sizing:border-box";
    overlay.append(card);
    document.body.append(overlay);
    journalMenuStage.orientationNotice = overlay;
  }
  if (journalMenuStage.orientationNotice) {
    journalMenuStage.orientationNotice.style.display = needsPortrait ? "flex" : "none";
    const en = journalMenuGame.__lockLootI18n?.language === "en";
    journalMenuStage.orientationNotice.firstChild.textContent = en ?
      "↻ Rotate to portrait to use the menu. On a computer, make the window taller." :
      "↻ Drehe das Gerät ins Hochformat, um das Menü zu nutzen. Am Computer das Fenster höher ziehen.";
  }
}
if (journalMenuStage?.canvas && typeof window !== "undefined") {
  const scale = Math.min(window.innerWidth / 720, window.innerHeight / 1280);
  const width = Math.max(1, Math.floor(720 * scale));
  const height = Math.max(1, Math.floor(1280 * scale));
  const desired = {position: "fixed", left: Math.floor((window.innerWidth - width) / 2) + "px",
    top: Math.floor((window.innerHeight - height) / 2) + "px",
    width: width + "px", height: height + "px"};
  for (const [property, value] of Object.entries(desired)) {
    journalMenuStage.canvas.style.setProperty(property, value, "important");
  }
}
if (typeof document !== "undefined") for (const element of [document.documentElement, document.body]) {
  element.style.setProperty("background", "#102f36", "important");
  element.style.setProperty("background-color", "#102f36", "important");
}
};
gdjs.MainMenuCode.userFunc0xe553d0 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-047: Zentrales lokales Lokalisierungssystem; keine Cloud- oder Firebase-Abhängigkeit.
const localizationGame = runtimeScene.getGame();
if (!localizationGame.__lockLootI18n) {
  const storageKey = "lockloot.language.v1";
  const catalog = JSON.parse(localizationGame.getVariables().get("localizationCatalogJson").getAsString());
  const languages = new Set(catalog.supportedLanguages.map(entry => entry.code));
  let storedLanguage = "";
  try { storedLanguage = globalThis.localStorage ? String(globalThis.localStorage.getItem(storageKey) || "") : ""; } catch (error) {}
  const state = {
    catalog,
    storageKey,
    language: languages.has(storedLanguage) ? storedLanguage : catalog.defaultLanguage,
    revision: 1,
    t(key, parameters = {}) {
      const entry = catalog.strings[key];
      if (!entry) return "[MISSING:" + key + "]";
      const template = typeof entry[state.language] === "string" ? entry[state.language] : entry[catalog.defaultLanguage];
      if (typeof template !== "string") return "[MISSING:" + key + "]";
      const required = [...new Set([...template.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map(match => match[1]))].sort();
      const supplied = Object.keys(parameters).sort();
      if (JSON.stringify(required) !== JSON.stringify(supplied)) throw new Error("Invalid localization parameters for " + key + ": expected " + required.join(",") + "; received " + supplied.join(","));
      return template.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (match, name) => String(parameters[name]));
    },
    setLanguage(language) {
      if (!languages.has(language)) return false;
      if (state.language !== language) { state.language = language; state.revision += 1; }
      localizationGame.getVariables().get("localizationLanguage").setString(state.language);
      try { if (globalThis.localStorage) globalThis.localStorage.setItem(storageKey, state.language); } catch (error) {}
      return true;
    }
  };
  localizationGame.__lockLootI18n = state;
  state.setLanguage(state.language);
}
const sceneLocalization = localizationGame.__lockLootI18n;
localizationGame.getVariables().get("localizationLanguage").setString(sceneLocalization.language);
};
gdjs.MainMenuCode.userFunc0xe52668 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-052: Initialisierung und Laufzeitaktualisierung erfolgen zentral über MusicController_Events.
};
gdjs.MainMenuCode.userFunc0xe94910 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-024: Rein visuelle Steuerung des modularen Hauptmenüs.
// Die bestehende modulare Welt und alle anderen Szenen bleiben unverändert.
if (!runtimeScene.__lockLootMainMenuVisualState) {
  runtimeScene.__lockLootMainMenuVisualState = { time: 0 };
}

const visualState = runtimeScene.__lockLootMainMenuVisualState;
const elapsedSeconds = Math.min(runtimeScene.getElapsedTime() / 1000, 0.05);
visualState.time += elapsedSeconds;

const clouds = runtimeScene.getObjects("MainMenuCloud");
for (let index = 0; index < clouds.length; index += 1) {
  const cloud = clouds[index];
  const speed = index === 0 ? 4 : 6;
  cloud.setX(cloud.getX() + speed * elapsedSeconds);
  if (cloud.getX() > 720) cloud.setX(-cloud.getWidth() - 24);
}

const waves = runtimeScene.getObjects("MainMenuWave");
for (let index = 0; index < waves.length; index += 1) {
  const wave = waves[index];
  const baseX = index === 0 ? -1 : 319;
  const baseY = index === 0 ? 465 : 475;
  wave.setPosition(
    baseX + Math.sin(visualState.time * 0.75 + index * 1.7) * 10,
    baseY + Math.sin(visualState.time * 1.1 + index) * 3
  );
  wave.setOpacity(180 + Math.sin(visualState.time + index) * 28);
}

const pirateFrameDurations = [0.18, 0.12, 0.14, 0.14, 0.15, 0.14, 0.10, 0.12, 0.10, 0.12, 0.16, 0.12, 0.18];
const pirateCycleDuration = pirateFrameDurations.reduce((sum, duration) => sum + duration, 0);
let pirateTime = visualState.time % pirateCycleDuration;
let pirateFrame = 0;
for (let index = 0; index < pirateFrameDurations.length; index += 1) {
  if (pirateTime < pirateFrameDurations[index]) {
    pirateFrame = index;
    break;
  }
  pirateTime -= pirateFrameDurations[index];
}
for (const pirate of runtimeScene.getObjects("MainMenuPirate")) {
  pirate.setPosition(-75, 245);
  pirate.setAnimationFrame(pirateFrame);
}

const parrotTime = visualState.time % 6.2;
let parrotFrame = 0;
if (parrotTime >= 2.2 && parrotTime < 2.5) parrotFrame = 1;
if (parrotTime >= 2.5 && parrotTime < 2.78) parrotFrame = 2;
if (parrotTime >= 2.78 && parrotTime < 3.12) parrotFrame = 3;
if (parrotTime >= 3.12 && parrotTime < 3.48) parrotFrame = 4;
if (parrotTime >= 3.48 && parrotTime < 3.72) parrotFrame = 5;
for (const parrot of runtimeScene.getObjects("MainMenuParrot")) {
  parrot.setPosition(420, 326);
  parrot.setAnimationFrame(parrotFrame);
}

const sparkles = runtimeScene.getObjects("MainMenuSparkle");
for (let index = 0; index < sparkles.length; index += 1) {
  const sparkle = sparkles[index];
  sparkle.setOpacity(105 + (Math.sin(visualState.time * 2 + index * 2.1) + 1) * 62);
  sparkle.setAngle(Math.sin(visualState.time * 0.8 + index) * 4);
}


};
gdjs.MainMenuCode.userFunc0xe51c68 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-046/L&L-047/L&L-052/L&L-059: Hauptnavigation, persistente Musik, Sprachwahl und serverautoritative letzte Lösung.
const menuGame = runtimeScene.getGame();
const menuI18n = menuGame.__lockLootI18n;
const menuController = menuGame.__lockLootMusicController;
const menuBackend = menuGame.__lockLootBackendRuntime;
const menuLastSolution = menuGame.__lockLootLastSolution;
if (!runtimeScene.__lockLootL046Menu) {
  menuGame.__lockLootMainMenuGeneration = Number.isSafeInteger(menuGame.__lockLootMainMenuGeneration) ? menuGame.__lockLootMainMenuGeneration + 1 : 1;
  runtimeScene.__lockLootL046Menu = {
    musicEnabled: menuController ? menuController.state.musicEnabled : true,
    languagePanelOpen: false, hoverName: "", loadingLastSolution: false,
    lastSolutionReady: false, uid: "", requestSerial: 0, retryAt: 0,
    pendingLastSolutionOpen: null,
    sceneGeneration: menuGame.__lockLootMainMenuGeneration
  };
  if (menuLastSolution) menuLastSolution.invalidate("LOADING");
}
const menuState = runtimeScene.__lockLootL046Menu;
if (menuController) menuState.musicEnabled = menuController.state.musicEnabled;
const menuCursorX = gdjs.evtTools.input.getCursorX(runtimeScene, "UI", 0);
const menuCursorY = gdjs.evtTools.input.getCursorY(runtimeScene, "UI", 0);
const firstMenuObject = name => runtimeScene.getObjects(name)[0] || null;
const cursorOnMenuObject = object => object && typeof object.isHidden === "function" && !object.isHidden() && menuCursorX >= object.getX() && menuCursorX <= object.getX() + object.getWidth() && menuCursorY >= object.getY() && menuCursorY <= object.getY() + object.getHeight();
const setMenuText = (name, value) => { const object = firstMenuObject(name); if (object) object.setString(value); };
const showMenuObject = (name, visible) => { for (const object of runtimeScene.getObjects(name)) object.hide(!visible); };
const networkError = error => error && (error.name === "AbortError" || error instanceof TypeError || error.status === "BACKEND_UNREACHABLE");
const menuSceneIsCurrent = sceneGeneration => runtimeScene.__lockLootL046Menu === menuState && menuState.sceneGeneration === sceneGeneration && menuGame.__lockLootMainMenuGeneration === sceneGeneration && menuGame.getSceneStack().getCurrentScene() === runtimeScene;
const loadLastSolution = async (openAfterValidation = false) => {
  if (menuState.loadingLastSolution || !menuBackend || !menuBackend.enabled || !menuLastSolution) return;
  menuState.loadingLastSolution = true;
  menuState.lastSolutionReady = false;
  menuState.pendingLastSolutionOpen = null;
  if (openAfterValidation) menuLastSolution.invalidate("CLICK_REVALIDATION");
  const serial = ++menuState.requestSerial;
  const sceneGeneration = menuState.sceneGeneration;
  let requestToken = null;
  const requestIsCurrent = () => serial === menuState.requestSerial && menuSceneIsCurrent(sceneGeneration) && (!requestToken || menuLastSolution.isCurrent(requestToken));
  try {
    let session = await menuBackend.authenticate(false);
    if (!requestIsCurrent()) return;
    if (!session || typeof session.uid !== "string") throw Object.assign(new Error("Anmeldung fehlt."), {status: "INVALID_RESPONSE"});
    menuState.uid = session.uid;
    requestToken = menuLastSolution.begin(session.uid);
    await menuBackend.prepare("L&L-041");
    if (!requestIsCurrent()) return;
    let response;
    try {
      response = await menuBackend.callCallable(menuBackend.endpoints.bootstrap, {integration: "L&L-041"}, session.idToken);
      if (!requestIsCurrent()) return;
    } catch (error) {
      if (!requestIsCurrent()) return;
      const authRejected = error && ["UNAUTHENTICATED", "HTTP_401", "AUTH_FAILED"].includes(error.status);
      if (!authRejected) throw error;
      session = await menuBackend.refresh();
      if (!requestIsCurrent()) return;
      menuState.uid = session.uid;
      requestToken = menuLastSolution.begin(session.uid);
      response = await menuBackend.callCallable(menuBackend.endpoints.bootstrap, {integration: "L&L-041"}, session.idToken);
      if (!requestIsCurrent()) return;
    }
    const confirmedSession = await menuBackend.authenticate(false);
    if (!requestIsCurrent()) return;
    if (!confirmedSession || confirmedSession.uid !== session.uid) {
      menuState.loadingLastSolution = false;
      menuLastSolution.invalidate("AUTH_CHANGED");
      return;
    }
    if (!requestIsCurrent()) return;
    if (!response || response.uid !== session.uid || !response.currentChest || response.currentChest.status !== "active" || response.currentChest.schemaVersion !== 1 || !Number.isSafeInteger(response.currentChest.contentVersion) || response.currentChest.contentVersion < 1 || !response.economy || response.economy.activeChestId !== response.currentChest.chestId || !Number.isSafeInteger(response.economy.rotation) || response.economy.rotation < 0) throw Object.assign(new Error("Menübootstrap ist ungültig."), {status: "INVALID_RESPONSE"});
    if (JSON.stringify(response).includes('"' + ("solution" + "Code") + '"') || Object.prototype.hasOwnProperty.call(response, "solutionSnapshot")) throw Object.assign(new Error("Aktive oder alte private Lösung außerhalb des Vertrags."), {status: "INVALID_RESPONSE"});
    const candidate = menuLastSolution.validate(response.lastSolution, {
      uid: session.uid,
      generation: requestToken.generation,
      activeChestId: response.currentChest.chestId,
      activeContentVersion: response.currentChest.contentVersion,
      rotation: response.economy.rotation
    });
    if (!menuLastSolution.commit(candidate)) throw Object.assign(new Error("Veraltete oder widersprüchliche Lösungsantwort."), {status: "INVALID_RESPONSE"});
    menuState.lastSolutionReady = true;
    menuState.retryAt = 0;
    if (openAfterValidation) {
      const freshState = menuLastSolution.getState();
      if (serial !== menuState.requestSerial || !menuSceneIsCurrent(sceneGeneration) || !menuLastSolution.isCurrent(requestToken) || !freshState.available || freshState.uid !== session.uid || freshState.generation !== requestToken.generation || freshState.highestRotation !== response.economy.rotation || freshState.activeChestId !== response.currentChest.chestId || freshState.highestContentVersion !== response.currentChest.contentVersion || !freshState.snapshot || freshState.snapshot.chestId !== response.lastSolution.previousChestId) {
        menuLastSolution.markUnavailable("INVALID_SNAPSHOT");
        menuState.lastSolutionReady = false;
        return;
      }
      menuState.lastSolutionReady = false;
      menuState.pendingLastSolutionOpen = Object.freeze({
        serial, sceneGeneration, uid: session.uid,
        requestGeneration: requestToken.generation,
        rotation: response.economy.rotation,
        activeChestId: response.currentChest.chestId,
        contentVersion: response.currentChest.contentVersion,
        previousChestId: response.lastSolution.previousChestId
      });
    }
  } catch (error) {
    if (!requestIsCurrent()) return;
    menuLastSolution.markUnavailable(networkError(error) ? "BACKEND_UNREACHABLE" : "INVALID_SNAPSHOT");
    menuState.retryAt = networkError(error) ? Date.now() + 12000 : Number.POSITIVE_INFINITY;
  } finally {
    if (requestIsCurrent()) menuState.loadingLastSolution = false;
  }
};
let lastSolutionOpenRequested = false;
if (menuState.pendingLastSolutionOpen) {
  const pending = menuState.pendingLastSolutionOpen;
  menuState.pendingLastSolutionOpen = null;
  const freshState = menuLastSolution ? menuLastSolution.getState() : null;
  const pendingIsCurrent = pending.serial === menuState.requestSerial && pending.sceneGeneration === menuState.sceneGeneration && menuSceneIsCurrent(pending.sceneGeneration);
  const pendingMatches = !!(pendingIsCurrent && freshState && freshState.available && freshState.uid === pending.uid && freshState.generation === pending.requestGeneration && freshState.highestRotation === pending.rotation && freshState.activeChestId === pending.activeChestId && freshState.highestContentVersion === pending.contentVersion && freshState.snapshot && freshState.snapshot.chestId === pending.previousChestId);
  if (pendingMatches && menuLastSolution.openSnapshot()) {
    lastSolutionOpenRequested = true;
    menuState.requestSerial += 1;
    menuState.lastSolutionReady = false;
    gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "SolutionScene", false);
  } else {
    if (pendingIsCurrent && menuLastSolution) menuLastSolution.markUnavailable("INVALID_SNAPSHOT");
    menuState.lastSolutionReady = false;
    menuState.retryAt = Number.POSITIVE_INFINITY;
  }
}
if (!lastSolutionOpenRequested && !menuState.pendingLastSolutionOpen && !menuState.loadingLastSolution && !menuState.lastSolutionReady && Date.now() >= menuState.retryAt) void loadLastSolution(false);
const playButton = firstMenuObject("MainMenuPlayButton");
const lastSolutionButton = firstMenuObject("MainMenuLastSolutionButton");
const shopButton = firstMenuObject("MainMenuShopButton");
const musicButton = firstMenuObject("MainMenuMusicButton");
const languageButton = firstMenuObject("MainMenuLanguageButton");
const deButton = firstMenuObject("MainMenuLanguageDeButton");
const enButton = firstMenuObject("MainMenuLanguageEnButton");
const solutionState = menuLastSolution ? menuLastSolution.getState() : null;
const lastSolutionEnabled = !!(menuState.lastSolutionReady && solutionState && solutionState.available && solutionState.uid === menuState.uid && solutionState.activeChestId && solutionState.snapshot && solutionState.snapshot.chestId !== solutionState.activeChestId);
const panelObjects = ["MainMenuLanguagePanel", "MainMenuLanguagePanelTitle", "MainMenuLanguageDeButton", "MainMenuLanguageEnButton", "MainMenuLanguageDeText", "MainMenuLanguageEnText"];
for (const name of panelObjects) showMenuObject(name, menuState.languagePanelOpen);
setMenuText("MainMenuPlayText", menuI18n.t("menu.play"));
setMenuText("MainMenuLastSolutionText", menuI18n.t("menu.last_solution"));
setMenuText("MainMenuShopText", menuI18n.t("menu.shop"));
setMenuText("MainMenuMusicStateText", menuI18n.t(menuState.musicEnabled ? "menu.music_on" : "menu.music_off"));
setMenuText("MainMenuLanguageStateText", menuI18n.t("menu.language"));
setMenuText("MainMenuLanguagePanelTitle", menuI18n.t("menu.language_panel_title"));
setMenuText("MainMenuLanguageDeText", menuI18n.t("menu.language_de"));
setMenuText("MainMenuLanguageEnText", menuI18n.t("menu.language_en"));
setMenuText("MainMenuUtilityHintText", "");
const lastSolutionText = firstMenuObject("MainMenuLastSolutionText");
if (lastSolutionText) lastSolutionText.setColor(lastSolutionEnabled ? "255;244;206" : "165;165;165");
const buttonEntries = [["play", playButton], ["lastSolution", lastSolutionButton], ["shop", shopButton], ["music", musicButton], ["language", languageButton], ["de", deButton], ["en", enButton]];
menuState.hoverName = "";
for (const [name, button] of buttonEntries) {
  const available = (!['de', 'en'].includes(name) || menuState.languagePanelOpen) && (name !== "lastSolution" || lastSolutionEnabled);
  const hovered = available && cursorOnMenuObject(button);
  if (hovered) menuState.hoverName = name;
  if (button) {
    const selectedLanguage = menuState.languagePanelOpen && ((name === "de" && menuI18n.language === "de") || (name === "en" && menuI18n.language === "en"));
    button.setOpacity(name === "lastSolution" && !lastSolutionEnabled ? 132 : hovered || selectedLanguage ? 255 : 238);
    button.setColor(name === "lastSolution" && !lastSolutionEnabled ? "118;118;118" : hovered ? "255;239;184" : selectedLanguage ? "255;223;142" : "255;255;255");
  }
}
const menuPortraitNoticeVisible = menuGame.__lockLootL061MenuPortrait?.orientationNotice?.style.display === "flex";
menuState.languagePanelWasOpenOnRelease = false;
if (!menuPortraitNoticeVisible && gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left")) {
  menuState.languagePanelWasOpenOnRelease = menuState.languagePanelOpen;
  if (menuState.languagePanelOpen && cursorOnMenuObject(deButton)) { menuI18n.setLanguage("de"); menuState.languagePanelOpen = false; }
  else if (menuState.languagePanelOpen && cursorOnMenuObject(enButton)) { menuI18n.setLanguage("en"); menuState.languagePanelOpen = false; }
  else if (cursorOnMenuObject(languageButton)) menuState.languagePanelOpen = !menuState.languagePanelOpen;
  else if (!menuState.languagePanelOpen && cursorOnMenuObject(playButton)) gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "TrainingScene", false);
  else if (!menuState.languagePanelOpen && lastSolutionEnabled && cursorOnMenuObject(lastSolutionButton)) void loadLastSolution(true);
  else if (!menuState.languagePanelOpen && cursorOnMenuObject(shopButton)) gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "TreasureCalendarScene", false);
  else if (!menuState.languagePanelOpen && cursorOnMenuObject(musicButton)) {
    if (menuController) menuController.setEnabled(runtimeScene, !menuController.state.musicEnabled);
    menuState.musicEnabled = menuController ? menuController.state.musicEnabled : false;
  } else if (menuState.languagePanelOpen) menuState.languagePanelOpen = false;
}
};
gdjs.MainMenuCode.userFunc0xe54a90 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-061 MENU-BOOK CORE: exakt derselbe geprüfte Journal-Controller.
const menuBookCoreGame = runtimeScene.getGame();
if (!menuBookCoreGame.__lockLootJournalCore) {
  const module = {exports: {}};
  (function(module) {
"use strict";

const INTEGRATION = "L&L-061";
const SCOPE = "LOCAL_DEMO_INDEXED_STATISTICS_TOP_100";
const BASE = "http://127.0.0.1:5001/demo-lock-loot-local/us-central1/";
const URLS = Object.freeze({page: `${BASE}getLocalJournalPage`,
  name: `${BASE}setLocalJournalName`});
const KEYS = Object.prototype.hasOwnProperty;
const TAG = /^[A-F0-9]{8}$/;
const REQUEST_ID = /^[A-Za-z0-9_-]{1,64}$/;
const NAME = /^[\p{L}\p{N}](?:[\p{L}\p{M}\p{N} '-]*[\p{L}\p{N}])?$/u;
const INVISIBLE = /[\u115F\u1160\u3164\uFFA0]|\p{Default_Ignorable_Code_Point}/u;

function createLocalJournalTransport({fetchImpl = globalThis.fetch, timeoutMs = 8000} = {}) {
  if (typeof fetchImpl !== "function" || !Number.isSafeInteger(timeoutMs) ||
      timeoutMs < 1 || timeoutMs > 30000) throw new TypeError("INVALID_TRANSPORT");
  return async (url, data, idToken) => {
    if (!Object.values(URLS).includes(url) ||
        typeof idToken !== "string" || !idToken) throw new TypeError("INVALID_LOCAL_REQUEST");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, {method: "POST", redirect: "error",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${idToken}`},
        body: JSON.stringify({data}), signal: controller.signal});
      const envelope = await response.json();
      if (!response.ok) {
        const status = envelope?.error?.status;
        const error = new Error("LOCAL_JOURNAL_REQUEST_FAILED");
        error.code = status === "ABORTED" ? "functions/aborted" :
          status === "UNAUTHENTICATED" || response.status === 401 ?
            "functions/unauthenticated" : "functions/error";
        throw error;
      }
      if (!exact(envelope, ["result"])) throw new TypeError("INVALID_CALLABLE_ENVELOPE");
      return envelope.result;
    } finally { clearTimeout(timer); }
  };
}

function exact(value, fields) {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    Object.keys(value).length === fields.length &&
    fields.every((key) => KEYS.call(value, key));
}
function safeCount(value) { return Number.isSafeInteger(value) && value >= 0; }
function rankFor(count) {
  if (count <= 2) return "LANDRATTE";
  if (count <= 6) return "FREIBEUTER";
  if (count <= 14) return "SEEBAER";
  if (count <= 30) return "SCHATZJAEGER";
  return "MEISTERNAVIGATOR";
}
function normalizeName(value) {
  if (typeof value !== "string" || INVISIBLE.test(value)) throw new TypeError("INVALID_NAME");
  const name = value.normalize("NFKC").trim().replace(/ +/g, " ");
  if ([...name].length < 3 || [...name].length > 16 ||
      INVISIBLE.test(name) || !NAME.test(name)) throw new TypeError("INVALID_NAME");
  return name;
}
function profile(value) {
  if (!exact(value, ["displayName", "tag", "version"]) ||
      typeof value.tag !== "string" || !TAG.test(value.tag) ||
      !safeCount(value.version) ||
      normalizeName(value.displayName) !== value.displayName) throw new TypeError("INVALID_PROFILE");
  return {...value};
}
function row(value, partial, allowOutside = false) {
  const fields = ["place", "displayName", "tag", "firstSolveCount",
    "cookiesConsumed", "lockpicksConsumed", "rankId", "isSelf"];
  if (!exact(value, fields) ||
      !(value.place === null || safeCount(value.place) && value.place >= 1 && value.place <= 100) ||
      typeof value.tag !== "string" || !TAG.test(value.tag) ||
      normalizeName(value.displayName) !== value.displayName ||
      !safeCount(value.firstSolveCount) || !safeCount(value.cookiesConsumed) ||
      !safeCount(value.lockpicksConsumed) || value.rankId !== rankFor(value.firstSolveCount) ||
      typeof value.isSelf !== "boolean" ||
      (partial ? value.place !== null : !allowOutside && value.place === null)) {
    throw new TypeError("INVALID_ROW");
  }
  return {...value};
}
function sameRow(left, right) {
  return ["place", "displayName", "tag", "firstSolveCount",
    "cookiesConsumed", "lockpicksConsumed", "rankId", "isSelf"]
      .every((field) => left[field] === right[field]);
}
function pageResult(value, requestedPage) {
  const fields = ["schemaVersion", "status", "scope", "populationComplete",
    "page", "pageSize", "hasNextPage", "rows", "own", "ownProfile"];
  if (!exact(value, fields) || value.schemaVersion !== 1 ||
      !["verified", "partial", "unavailable"].includes(value.status) ||
      value.scope !== SCOPE || value.page !== requestedPage || value.pageSize !== 10 ||
      typeof value.populationComplete !== "boolean" ||
      value.populationComplete !== (value.status === "verified") ||
      typeof value.hasNextPage !== "boolean" ||
      (requestedPage === 9 && value.hasNextPage) ||
      !Array.isArray(value.rows) || value.rows.length > 10) throw new TypeError("INVALID_PAGE");
  if (value.status === "unavailable") {
    if (value.rows.length || value.own !== null || value.ownProfile !== null ||
        value.hasNextPage) throw new TypeError("INVALID_PAGE");
    return {...value, rows: []};
  }
  const partial = value.status === "partial";
  const rows = value.rows.map((item) => row(item, partial));
  const tags = new Set();
  let lastCount = null;
  let lastPlace = null;
  let self = null;
  for (let index = 0; index < rows.length; index++) {
    const current = rows[index];
    if (tags.has(current.tag) || current.firstSolveCount > (lastCount ?? Infinity) ||
        (!partial && (current.place > requestedPage * 10 + index + 1 ||
        lastPlace !== null && (current.place < lastPlace ||
          current.firstSolveCount === lastCount && current.place !== lastPlace ||
          current.firstSolveCount < lastCount && current.place !==
            requestedPage * 10 + index + 1) ||
        lastPlace === null && requestedPage === 0 && current.place !== 1))) {
      throw new TypeError("INVALID_ORDER");
    }
    tags.add(current.tag);
    lastCount = current.firstSolveCount;
    lastPlace = current.place;
    if (current.isSelf) {
      if (self) throw new TypeError("DUPLICATE_SELF");
      self = current;
    }
  }
  if ((value.own === null) !== (value.ownProfile === null)) throw new TypeError("INVALID_OWN");
  const own = value.own === null ? null : row(value.own, partial, true);
  const ownProfile = value.ownProfile === null ? null : profile(value.ownProfile);
  if (value.status === "verified" && !own ||
      own && (!own.isSelf || own.tag !== ownProfile.tag ||
        own.displayName !== ownProfile.displayName ||
        self && !sameRow(self, own) ||
        !self && tags.has(own.tag)) ||
      self && !own) throw new TypeError("INVALID_OWN");
  return {...value, rows, own, ownProfile};
}
function nameResult(value, previousVersion, previousTag) {
  if (!exact(value, ["schemaVersion", "profile", "replayed"]) ||
      value.schemaVersion !== 1 || typeof value.replayed !== "boolean") {
    throw new TypeError("INVALID_NAME_RESULT");
  }
  const next = profile(value.profile);
  if (next.version < previousVersion + 1 || next.tag !== previousTag) {
    throw new TypeError("INVALID_NAME_RESULT");
  }
  return {profile: next, replayed: value.replayed};
}
function emptyView() {
  return {phase: "idle", page: 0, half: 0, rows: [], own: null,
    ownProfile: null, hasNextPage: false, nameStatus: "idle"};
}
function createJournalController({context, transport, requestId, visibleRows = 5}) {
  if (typeof context !== "function" || typeof transport !== "function" ||
      typeof requestId !== "function" || ![2, 5].includes(visibleRows)) {
    throw new TypeError("INVALID_ADAPTER");
  }
  let view = emptyView();
  let fingerprint = null;
  let generation = 0;
  let loadGeneration = 0;
  const pageCache = new Map();
  let nameAttempt = null;
  let namePromise = null;
  function session() {
    const current = context();
    const next = current && [current.environment, current.sceneId,
      current.authGeneration, current.uid, current.idToken];
    const stamp = JSON.stringify(next);
    if (stamp !== fingerprint) {
      fingerprint = stamp;
      generation++;
      loadGeneration++;
      view = emptyView();
      pageCache.clear();
      nameAttempt = null;
      namePromise = null;
    }
    if (!current || current.environment !== "local" ||
        typeof current.sceneId !== "string" || !current.sceneId ||
        !safeCount(current.authGeneration) ||
        typeof current.uid !== "string" || !current.uid ||
        typeof current.idToken !== "string" || !current.idToken) return null;
    return {idToken: current.idToken, generation};
  }
  function current(token) { return session()?.generation === token.generation; }
  function publicView() {
    session();
    const offset = view.half * visibleRows;
    return {...view, rows: view.rows.slice(offset, offset + visibleRows).map((item) => ({...item})),
      hasMoreInPage: view.rows.length > offset + visibleRows,
      own: view.own && {...view.own}, ownProfile: view.ownProfile && {...view.ownProfile}};
  }
  async function load(page = 0, {useCache = false} = {}) {
    if (!Number.isInteger(page) || page < 0 || page > 9) throw new RangeError("INVALID_PAGE_NUMBER");
    const token = session();
    const sequence = ++loadGeneration;
    const priorProfile = token ? view.ownProfile : null;
    view = {...emptyView(), phase: token ? "loading" : "offline", page,
      ownProfile: priorProfile};
    if (!token) return publicView();
    try {
      const result = useCache && pageCache.has(page) ? pageCache.get(page) :
        pageResult(await transport(URLS.page, {integration: INTEGRATION, page}, token.idToken), page);
      if (!current(token) || sequence !== loadGeneration) return publicView();
      if (!useCache || result.status !== "verified") pageCache.clear();
      if (result.status === "verified") pageCache.set(page, result);
      view = {phase: result.status === "unavailable" ? "unavailable" :
        result.status === "partial" ? "partial" : result.rows.length ? "ready" : "empty",
      page, half: 0, rows: result.rows, own: result.own,
      ownProfile: result.ownProfile, hasNextPage: result.hasNextPage,
      nameStatus: view.nameStatus};
    } catch (error) {
      if (current(token) && sequence === loadGeneration) {
        pageCache.clear();
        view = {...emptyView(), phase: error instanceof TypeError &&
          (/^INVALID_/.test(error.message) || error.message === "DUPLICATE_SELF") ?
          "invalid" : "error", page};
      }
    }
    return publicView();
  }
  function next() {
    session();
    if (!["ready", "empty"].includes(view.phase)) return Promise.resolve(publicView());
    if (view.rows.length > (view.half + 1) * visibleRows) {
      view.half++;
      return Promise.resolve(publicView());
    }
    return view.hasNextPage && view.page < 9 ? load(view.page + 1, {useCache: true}) :
      Promise.resolve(publicView());
  }
  function previous() {
    session();
    if (!["ready", "empty"].includes(view.phase)) return Promise.resolve(publicView());
    if (view.half > 0) {
      view.half--;
      return Promise.resolve(publicView());
    }
    const targetPage = view.page - 1;
    const currentGeneration = generation;
    const sequence = loadGeneration + 1;
    return view.page > 0 ? load(targetPage, {useCache: true}).then(() => {
      if (generation === currentGeneration && sequence === loadGeneration &&
          view.page === targetPage && view.rows.length > visibleRows) {
        view.half = Math.ceil(view.rows.length / visibleRows) - 1;
      }
      return publicView();
    }) : Promise.resolve(publicView());
  }
  async function saveName(value) {
    const token = session();
    if (!token || !view.ownProfile) return {ok: false, reason: "unavailable"};
    const name = normalizeName(value);
    if (namePromise) return nameAttempt?.name === name ? namePromise :
      {ok: false, reason: "busy"};
    if (!nameAttempt || nameAttempt.name !== name) {
      const id = requestId();
      if (typeof id !== "string" || !REQUEST_ID.test(id)) throw new TypeError("INVALID_REQUEST_ID");
      nameAttempt = {name, expectedVersion: view.ownProfile.version,
        tag: view.ownProfile.tag, id};
    }
    const attempt = nameAttempt;
    view.nameStatus = "saving";
    const promise = (async () => {
      await Promise.resolve();
      try {
        const raw = await transport(URLS.name, {integration: INTEGRATION,
          requestId: attempt.id, expectedVersion: attempt.expectedVersion,
          displayName: attempt.name}, token.idToken);
        const result = nameResult(raw, attempt.expectedVersion, attempt.tag);
        if (!current(token) || attempt !== nameAttempt) return {ok: false, reason: "stale"};
        nameAttempt = null;
        pageCache.clear();
        const newer = view.ownProfile &&
          (view.ownProfile.version > result.profile.version ||
            view.ownProfile.version === result.profile.version &&
            (view.ownProfile.displayName !== result.profile.displayName ||
              view.ownProfile.tag !== result.profile.tag));
        if (newer) {
          view.nameStatus = "superseded";
          return {ok: false, reason: "superseded"};
        }
        loadGeneration++;
        if (view.phase === "loading") {
          view = {...emptyView(), page: view.page, phase: "idle"};
        }
        view.ownProfile = result.profile;
        if (view.own) view.own = {...view.own,
          displayName: result.profile.displayName, tag: result.profile.tag};
        view.rows = view.rows.map((item) => item.isSelf ? {...item,
          displayName: result.profile.displayName, tag: result.profile.tag} : item);
        view.nameStatus = "saved";
        return {ok: true, replayed: result.replayed};
      } catch (error) {
        if (!current(token) || attempt !== nameAttempt) return {ok: false, reason: "stale"};
        if (error?.code === "functions/aborted" || error?.code === "aborted") {
          nameAttempt = null;
          view = {...emptyView(), page: view.page, phase: "error", nameStatus: "conflict"};
          return {ok: false, reason: "conflict"};
        }
        view.nameStatus = "error";
        return {ok: false, reason: "error"};
      } finally {
        if (namePromise === promise) namePromise = null;
      }
    })();
    namePromise = promise;
    return promise;
  }
  function reset() {
    fingerprint = null;
    generation++;
    loadGeneration++;
    nameAttempt = null;
    namePromise = null;
    view = emptyView();
    pageCache.clear();
  }
  return Object.freeze({view: publicView, load, next, previous, saveName, reset});
}

module.exports = Object.freeze({URLS, createLocalJournalTransport, createJournalController,
  normalizeName, pageResult, nameResult});

  })(module);
  menuBookCoreGame.__lockLootJournalCore = module.exports;
}
};
gdjs.MainMenuCode.userFunc0xe57da8 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-061 MENU-BOOK VIEW
// L&L-061: Kompaktes Hauptmenübuch mit verifiziertem Platz 1.
const menuBookGame = runtimeScene.getGame();
const menuBookI18n = menuBookGame.__lockLootI18n;
const menuBookBackend = menuBookGame.__lockLootBackendRuntime;
const menuBookCore = menuBookGame.__lockLootJournalCore;
const menuBookObject = name => runtimeScene.getObjects(name)[0] || null;
const menuBookText = (name, value) => {
  const object = menuBookObject(name);
  if (object) object.setString(String(value));
};
const menuBookT = (key, params = {}) => menuBookI18n ? menuBookI18n.t(key, params) : key;
const menuBookCurrent = () => menuBookGame.getSceneStack().getCurrentScene() === runtimeScene;
const menuBookCount = value => {
  if (!Number.isSafeInteger(value) || value < 0) return "";
  const locale = menuBookI18n?.language === "en" ? "en-US" : "de-DE";
  const exact = value.toLocaleString(locale);
  const context = typeof document === "undefined" ? null :
    document.createElement("canvas").getContext("2d");
  if (!context) return exact;
  context.font = "bold 22px Arial";
  if (context.measureText(exact).width <= 108) return exact;
  const short = "≈" + value.toExponential(1).replace("e+", "e");
  return context.measureText(short).width <= 108 ? short :
    "≈" + value.toExponential(0).replace("e+", "e");
};
const menuBookName = value => {
  const object = menuBookObject("MenuBookName");
  if (!object) return;
  const chars = [...String(value || "").trim()];
  const context = typeof document === "undefined" ? null :
    document.createElement("canvas").getContext("2d");
  let display = chars.join("");
  if (context && chars.length) {
    context.font = "bold 20px Arial";
    const fits = text => context.measureText(text).width <= 116;
    if (!fits(display)) {
      let split = null;
      for (let index = 1; index < chars.length; index++) {
        const first = chars.slice(0, index).join("").trimEnd();
        const second = chars.slice(index).join("").trimStart();
        if (fits(first) && fits(second) &&
            (split === null || Math.abs(index - chars.length / 2) <
              Math.abs(split - chars.length / 2))) split = index;
      }
      if (split !== null) {
        display = chars.slice(0, split).join("").trimEnd() + "\n" +
          chars.slice(split).join("").trimStart();
      } else {
        let first = "";
        let cursor = 0;
        while (cursor < chars.length && fits(first + chars[cursor])) {
          first += chars[cursor++];
        }
        let second = "";
        while (cursor < chars.length && fits(second + chars[cursor] + "…")) {
          second += chars[cursor++];
        }
        display = first.trimEnd() + "\n" + second.trimEnd() +
          (cursor < chars.length ? "…" : "");
      }
    }
  }
  object.setWrapping(false);
  object.setCharacterSize(20);
  object.setLineHeight(22);
  object.setString(display);
};
if (!runtimeScene.__lockLootL061MenuBook) {
  menuBookGame.__lockLootL061MenuBookSerial =
    (menuBookGame.__lockLootL061MenuBookSerial || 0) + 1;
  const state = {sceneId: `menu-book-${menuBookGame.__lockLootL061MenuBookSerial}`,
    active: true, authGeneration: 0, session: null, busy: false,
    notice: "", authRejected: false, started: false,
    recoveryPending: false,
    waitStartedAt: Date.now()};
  runtimeScene.__lockLootL061MenuBook = state;
  // Zwei Linien liegen auf derselben gedrehten Buchfläche, mit freiem Falz.
  const segments = [[420, 957, 512, 957], [559, 957, 651, 957]];
  if (typeof PIXI !== "undefined" && runtimeScene.getLayer) {
    const drawing = new PIXI.Graphics();
    drawing.lineStyle(1.5, 0x956e32, 0.75);
    const angle = -5 * Math.PI / 180;
    const rotate = (x, y) => {
      const dx = x - 536;
      const dy = y - 951.5;
      return [536 + dx * Math.cos(angle) - dy * Math.sin(angle),
        951.5 + dx * Math.sin(angle) + dy * Math.cos(angle)];
    };
    for (const [x1, y1, x2, y2] of segments) {
      const start = rotate(x1, y1);
      const end = rotate(x2, y2);
      drawing.moveTo(...start);
      drawing.lineTo(...end);
    }
    runtimeScene.getLayer("UI").getRenderer().addRendererObject(drawing, 22);
    state.dividerDrawing = drawing;
  }
  const rawTransport = menuBookCore.createLocalJournalTransport();
  const context = () => ({environment: state.active && menuBookCurrent() ?
    menuBookBackend?.environment : "blocked", sceneId: state.sceneId,
  authGeneration: state.authGeneration, uid: state.session?.uid || "",
  idToken: state.session?.idToken || ""});
  state.controller = menuBookCore.createJournalController({context, visibleRows: 2,
    requestId: () => "menu-book-read-only",
    transport: async (url, data, token) => {
      try { return await rawTransport(url, data, token); }
      catch (error) {
        state.authRejected = error?.code === "functions/unauthenticated";
        throw error;
      }
    }});
  state.ensureSession = async force => {
    if (!menuBookBackend?.enabled || !menuBookBackend.isLocal) return false;
    const current = await (force ? menuBookBackend.refresh() :
      menuBookBackend.authenticate(false));
    if (!state.active || !menuBookCurrent() || !current ||
        typeof current.uid !== "string" ||
        typeof current.idToken !== "string") return false;
    if (state.session?.uid !== current.uid || state.session?.idToken !== current.idToken) {
      state.authGeneration++;
      state.session = current;
    }
    return true;
  };
  state.navigate = async action => {
    if (!state.active || state.busy) return;
    state.busy = true;
    state.notice = "";
    try {
      if (!await state.ensureSession(false)) {
        state.session = null;
        await state.controller.load(0);
        return;
      }
      state.authRejected = false;
      let result = await (action === "next" ? state.controller.next() :
        action === "previous" ? state.controller.previous() :
          state.controller.load(0));
      if (state.authRejected && state.active && menuBookCurrent() &&
          await state.ensureSession(true)) {
        state.authRejected = false;
        result = await state.controller.load(result.page);
      }
      return result;
    } catch {
      if (state.active) state.notice = "journal.connection_error";
    } finally { state.busy = false; }
  };
  if (!menuBookBackend?.isLocal) {
    state.started = true;
    void state.controller.load(0);
  }
  if (!menuBookGame.__lockLootL061MenuBookCleanupRegistered) {
    gdjs.registerRuntimeSceneUnloadingCallback(scene => {
      const old = scene.__lockLootL061MenuBook;
      if (old) {
        old.active = false;
        old.controller.reset();
        old.dividerDrawing?.destroy();
        delete scene.__lockLootL061MenuBook;
      }
    });
    menuBookGame.__lockLootL061MenuBookCleanupRegistered = true;
  }
}
const menuBookState = runtimeScene.__lockLootL061MenuBook;
if (menuBookBackend?.isLocal && menuBookState.active) {
  const menuAuth = runtimeScene.__lockLootL046Menu;
  const waited = Date.now() - menuBookState.waitStartedAt;
  const initialUidReady = !!menuAuth?.uid &&
    menuBookBackend.getUid() === menuAuth.uid;
  if (!menuBookState.started && !menuAuth?.loadingLastSolution &&
      (initialUidReady || menuAuth?.retryAt > 0 || waited > 30000)) {
    menuBookState.started = true;
    menuBookState.recoveryPending = menuAuth?.retryAt > 0;
    void menuBookState.navigate("load");
  } else if (!menuBookState.started && waited > 30000) {
    menuBookState.notice = "journal.connection_error";
  } else if (menuBookState.recoveryPending && !menuBookState.busy &&
      !menuAuth?.loadingLastSolution && menuAuth?.lastSolutionReady &&
      menuAuth.retryAt === 0 && initialUidReady) {
    menuBookState.recoveryPending = false;
    void menuBookState.navigate("load");
  }
}
const menuBookView = menuBookState.controller.view();
const menuBookVerified = ["ready", "empty"].includes(menuBookView.phase);
const leader = menuBookVerified && menuBookView.page === 0 &&
  menuBookView.half === 0 && menuBookView.rows[0]?.place === 1 ?
  menuBookView.rows[0] : null;
menuBookText("MenuBookPlace", leader ? "1." : "");
menuBookName(leader?.displayName || "");
menuBookText("MenuBookChestsLabel", leader ? menuBookT("journal.menu_chests_opened") : "");
const chestsLabel = menuBookObject("MenuBookChestsLabel");
if (chestsLabel) chestsLabel.setLineHeight(20);
menuBookText("MenuBookChestsCount", leader ? menuBookCount(leader.firstSolveCount) : "");
menuBookText("MenuBookConsumedLabel", leader ? menuBookT("journal.menu_consumed") : "");
for (const [iconName, countName, value] of [
    ["MenuBookCookieIcon", "MenuBookCookieCount", leader?.cookiesConsumed],
    ["MenuBookLockpickIcon", "MenuBookLockpickCount", leader?.lockpicksConsumed]]) {
  const icon = menuBookObject(iconName);
  if (icon) icon.setOpacity(leader ? 255 : 0);
  menuBookText(countName, leader ? menuBookCount(value) : "");
}
const menuBookStatusKey = menuBookState.notice ? "journal.menu_unavailable" :
  leader ? "" : ["loading", "idle"].includes(menuBookView.phase) ?
    "journal.menu_loading" : menuBookView.phase === "empty" ?
      "journal.menu_empty" : "journal.menu_unavailable";
menuBookText("MenuBookStatus", menuBookStatusKey ? menuBookT(menuBookStatusKey) : "");
const menuBookStatus = menuBookObject("MenuBookStatus");
if (menuBookStatus) {
  menuBookStatus.setWrapping(true);
  menuBookStatus.setWrappingWidth(116);
  menuBookStatus.setLineHeight(21);
}
// GDevelop/Pixi verankert Text in der gerenderten Textmitte. Darum wird
// jede Textmitte nach dem dynamischen setString auf die gedrehte Buchzelle
// gesetzt; damit folgen auch zwei Namenszeilen und Zahlen dem Papierfalz.
const menuBookCells = {
  MenuBookPlace: [411, 883, 113, 42],
  MenuBookName: [547, 881, 119, 46],
  MenuBookChestsLabel: [405, 925, 121, 36],
  MenuBookChestsCount: [548, 930, 115, 26],
  MenuBookConsumedLabel: [408, 962, 115, 24],
  MenuBookCookieCount: [548, 985, 115, 25],
  MenuBookLockpickCount: [548, 1010, 115, 25],
  MenuBookStatus: [546, 891, 120, 96]
};
const menuBookRadians = -5 * Math.PI / 180;
for (const [name, [left, top, width, height]] of Object.entries(menuBookCells)) {
  const object = menuBookObject(name);
  if (!object) continue;
  const dx = left + width / 2 - 536;
  const dy = top + height / 2 - 951.5;
  const pivotX = 536 + dx * Math.cos(menuBookRadians) - dy * Math.sin(menuBookRadians);
  const pivotY = 951.5 + dx * Math.sin(menuBookRadians) + dy * Math.cos(menuBookRadians);
  object.setPosition(pivotX - object.getWidth() / 2, pivotY);
  object.setAngle(-5);
}
const menuBookPanelOpen = runtimeScene.__lockLootL046Menu?.languagePanelOpen ||
  runtimeScene.__lockLootL046Menu?.languagePanelWasOpenOnRelease;
const menuBookPortraitBlocked =
  runtimeScene.__lockLootL061MenuPortrait?.orientationNotice?.style.display === "flex";
if (menuBookState.active && menuBookCurrent() && !menuBookPanelOpen &&
    !menuBookPortraitBlocked &&
    gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left")) {
  const x = gdjs.evtTools.input.getCursorX(runtimeScene, "UI", 0);
  const y = gdjs.evtTools.input.getCursorY(runtimeScene, "UI", 0);
  const radians = -5 * Math.PI / 180;
  const dx = x - 536;
  const dy = y - 951.5;
  const localX = 536 + dx * Math.cos(radians) + dy * Math.sin(radians);
  const localY = 951.5 - dx * Math.sin(radians) + dy * Math.cos(radians);
  if (localX >= 388 && localX <= 684 && localY >= 855 && localY <= 1048) {
    menuBookState.active = false;
    menuBookState.controller.reset();
    gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "JournalScene", false);
  }
}
};
gdjs.MainMenuCode.eventsList0 = function(runtimeScene) {

{


gdjs.MainMenuCode.userFunc0xe94888(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xcdd4b0(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xe53e00(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xe553d0(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xe52668(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xe94910(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xe51c68(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xe54a90(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xe57da8(runtimeScene);

}


};

gdjs.MainMenuCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.MainMenuCode.GDMainMenuTitleObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSkyObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSeaObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuCloudObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuFarIslandsObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPalmObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuVegetationObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuBeachObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuWaveObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuChestLidObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuChestBaseObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuTreasureObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuParrotObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPirateObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSparkleObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSandMoundObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuBackSandPileObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuForegroundObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLogoObjects1.length = 0;
gdjs.MainMenuCode.GDBackgroundObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuCoveObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPirateShipObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuRowboatObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailPlantObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailDriftwoodObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellPinkObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellConchObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellBrokenObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStarfishObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneGrayObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneGoldObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneDarkObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPlayButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLastSolutionButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLastSolutionTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuShopButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuMusicButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguageButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuChestCrestObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPlayTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuShopTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuMusicStateTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguageStateTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuUtilityHintTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguagePanelObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguagePanelTitleObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguageDeButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguageEnButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguageDeTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguageEnTextObjects1.length = 0;
gdjs.MainMenuCode.GDStagingBadgeObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookPaperObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookPlaceObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookNameObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookChestsLabelObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookChestsCountObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookConsumedLabelObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookCookieIconObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookCookieCountObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookLockpickIconObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookLockpickCountObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookStatusObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudCookieFrameObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudLockpickFrameObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudCookieIconObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudLockpickIconObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudCookiesTextObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudLockpicksTextObjects1.length = 0;

gdjs.MainMenuCode.eventsList0(runtimeScene);
gdjs.MainMenuCode.GDMainMenuTitleObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSkyObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSeaObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuCloudObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuFarIslandsObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPalmObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuVegetationObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuBeachObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuWaveObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuChestLidObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuChestBaseObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuTreasureObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuParrotObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPirateObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSparkleObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSandMoundObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuBackSandPileObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuForegroundObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLogoObjects1.length = 0;
gdjs.MainMenuCode.GDBackgroundObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuCoveObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPirateShipObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuRowboatObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailPlantObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailDriftwoodObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellPinkObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellConchObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellBrokenObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStarfishObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneGrayObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneGoldObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneDarkObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPlayButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLastSolutionButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLastSolutionTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuShopButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuMusicButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguageButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuChestCrestObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPlayTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuShopTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuMusicStateTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguageStateTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuUtilityHintTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguagePanelObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguagePanelTitleObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguageDeButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguageEnButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguageDeTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLanguageEnTextObjects1.length = 0;
gdjs.MainMenuCode.GDStagingBadgeObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookPaperObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookPlaceObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookNameObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookChestsLabelObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookChestsCountObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookConsumedLabelObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookCookieIconObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookCookieCountObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookLockpickIconObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookLockpickCountObjects1.length = 0;
gdjs.MainMenuCode.GDMenuBookStatusObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudCookieFrameObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudLockpickFrameObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudCookieIconObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudLockpickIconObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudCookiesTextObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudLockpicksTextObjects1.length = 0;


return;

}

gdjs['MainMenuCode'] = gdjs.MainMenuCode;
