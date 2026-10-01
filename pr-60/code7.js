gdjs.JournalSceneCode = {};
gdjs.JournalSceneCode.localVariables = [];
gdjs.JournalSceneCode.idToCallbackMap = new Map();
gdjs.JournalSceneCode.GDJournalPageObjects1= [];
gdjs.JournalSceneCode.GDJournalTitleObjects1= [];
gdjs.JournalSceneCode.GDJournalSubtitleObjects1= [];
gdjs.JournalSceneCode.GDJournalProfileHeadingObjects1= [];
gdjs.JournalSceneCode.GDJournalNameObjects1= [];
gdjs.JournalSceneCode.GDJournalTagObjects1= [];
gdjs.JournalSceneCode.GDJournalRankObjects1= [];
gdjs.JournalSceneCode.GDJournalOwnStatsObjects1= [];
gdjs.JournalSceneCode.GDJournalEditObjects1= [];
gdjs.JournalSceneCode.GDJournalListHeadingObjects1= [];
gdjs.JournalSceneCode.GDJournalHeadLegendObjects1= [];
gdjs.JournalSceneCode.GDJournalRowPlace1Objects1= [];
gdjs.JournalSceneCode.GDJournalRowName1Objects1= [];
gdjs.JournalSceneCode.GDJournalRowRank1Objects1= [];
gdjs.JournalSceneCode.GDJournalRowTag1Objects1= [];
gdjs.JournalSceneCode.GDJournalRowStats1Objects1= [];
gdjs.JournalSceneCode.GDJournalRowPlace2Objects1= [];
gdjs.JournalSceneCode.GDJournalRowName2Objects1= [];
gdjs.JournalSceneCode.GDJournalRowRank2Objects1= [];
gdjs.JournalSceneCode.GDJournalRowTag2Objects1= [];
gdjs.JournalSceneCode.GDJournalRowStats2Objects1= [];
gdjs.JournalSceneCode.GDJournalRowPlace3Objects1= [];
gdjs.JournalSceneCode.GDJournalRowName3Objects1= [];
gdjs.JournalSceneCode.GDJournalRowRank3Objects1= [];
gdjs.JournalSceneCode.GDJournalRowTag3Objects1= [];
gdjs.JournalSceneCode.GDJournalRowStats3Objects1= [];
gdjs.JournalSceneCode.GDJournalRowPlace4Objects1= [];
gdjs.JournalSceneCode.GDJournalRowName4Objects1= [];
gdjs.JournalSceneCode.GDJournalRowRank4Objects1= [];
gdjs.JournalSceneCode.GDJournalRowTag4Objects1= [];
gdjs.JournalSceneCode.GDJournalRowStats4Objects1= [];
gdjs.JournalSceneCode.GDJournalRowPlace5Objects1= [];
gdjs.JournalSceneCode.GDJournalRowName5Objects1= [];
gdjs.JournalSceneCode.GDJournalRowRank5Objects1= [];
gdjs.JournalSceneCode.GDJournalRowTag5Objects1= [];
gdjs.JournalSceneCode.GDJournalRowStats5Objects1= [];
gdjs.JournalSceneCode.GDJournalStatusObjects1= [];
gdjs.JournalSceneCode.GDJournalPreviousObjects1= [];
gdjs.JournalSceneCode.GDJournalPageNumberObjects1= [];
gdjs.JournalSceneCode.GDJournalNextObjects1= [];
gdjs.JournalSceneCode.GDJournalBackButtonObjects1= [];
gdjs.JournalSceneCode.GDJournalBackObjects1= [];
gdjs.JournalSceneCode.GDResourceHudCookieFrameObjects1= [];
gdjs.JournalSceneCode.GDResourceHudLockpickFrameObjects1= [];
gdjs.JournalSceneCode.GDResourceHudCookieIconObjects1= [];
gdjs.JournalSceneCode.GDResourceHudLockpickIconObjects1= [];
gdjs.JournalSceneCode.GDResourceHudCookiesTextObjects1= [];
gdjs.JournalSceneCode.GDResourceHudLockpicksTextObjects1= [];


gdjs.JournalSceneCode.userFunc0xe66758 = function GDJSInlineCode(runtimeScene) {
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
gdjs.JournalSceneCode.userFunc0xce1c18 = function GDJSInlineCode(runtimeScene) {
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
gdjs.JournalSceneCode.userFunc0xe66b48 = function GDJSInlineCode(runtimeScene) {
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
gdjs.JournalSceneCode.userFunc0xa9cae8 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-061: Gemeinsame geprüfte Journal-Controllerquelle.
const journalCoreGame = runtimeScene.getGame();
if (!journalCoreGame.__lockLootJournalCore) {
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
  journalCoreGame.__lockLootJournalCore = module.exports;
}
};
gdjs.JournalSceneCode.userFunc0xce5cd8 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-061: Lokales Tagebuch. Der eingebettete Controller prüft alle Serverantworten.
const journalGame = runtimeScene.getGame();
const journalRemember = (element, properties) => Object.fromEntries(properties.map(property =>
  [property, {value: element?.style.getPropertyValue(property) || "",
    priority: element?.style.getPropertyPriority(property) || ""}]));
const journalRestoreStyle = (element, saved) => {
  if (!element || !saved) return;
  for (const [property, entry] of Object.entries(saved)) {
    if (entry.value) element.style.setProperty(property, entry.value, entry.priority);
    else element.style.removeProperty(property);
  }
};
if (!runtimeScene.__lockLootJournalPortraitStage) {
  const canvas = journalGame.getRenderer?.().getCanvas?.() || null;
  const stage = {scene: runtimeScene, canvas, restored: false,
    previousResolution: {adapt: journalGame.getAdaptGameResolutionAtRuntime(),
      width: journalGame.getGameResolutionWidth(), height: journalGame.getGameResolutionHeight()},
    previousCanvasStyle: journalRemember(canvas, ["width", "height", "left", "top", "position"]),
    previousPageStyle: typeof document === "undefined" ? null : {
      html: journalRemember(document.documentElement, ["background", "background-color"]),
      body: journalRemember(document.body, ["background", "background-color"])}};
  stage.restore = () => {
    if (stage.restored) return;
    stage.restored = true;
    stage.orientationNotice?.remove();
    journalRestoreStyle(stage.canvas, stage.previousCanvasStyle);
    if (typeof document !== "undefined" && stage.previousPageStyle) {
      journalRestoreStyle(document.documentElement, stage.previousPageStyle.html);
      journalRestoreStyle(document.body, stage.previousPageStyle.body);
    }
    journalGame.setGameResolutionSize(stage.previousResolution.width, stage.previousResolution.height);
    journalGame.setAdaptGameResolutionAtRuntime(stage.previousResolution.adapt);
  };
  runtimeScene.__lockLootJournalPortraitStage = stage;
  journalGame.__lockLootJournalPortraitStage = stage;
  if (!journalGame.__lockLootJournalPortraitCleanupRegistered) {
    gdjs.registerRuntimeSceneUnloadingCallback(scene => {
      const current = journalGame.__lockLootJournalPortraitStage;
      if (current?.scene === scene) {
        current.restore();
        delete scene.__lockLootJournalPortraitStage;
        journalGame.__lockLootJournalPortraitStage = null;
      }
    });
    journalGame.__lockLootJournalPortraitCleanupRegistered = true;
  }
}
journalGame.setAdaptGameResolutionAtRuntime(false);
if (journalGame.getGameResolutionWidth() !== 720 || journalGame.getGameResolutionHeight() !== 1280) {
  journalGame.setGameResolutionSize(720, 1280);
}
const journalStage = runtimeScene.__lockLootJournalPortraitStage;
const journalLandscapeWidth = typeof window === "undefined" ? 720 :
  720 * Math.min(window.innerWidth / 720, window.innerHeight / 1280);
if (typeof document !== "undefined" && journalStage) {
  const needsPortrait = !runtimeScene.__lockLootL061Journal?.dialog &&
    window.innerWidth > window.innerHeight && journalLandscapeWidth < 320;
  if (needsPortrait && !journalStage.orientationNotice) {
    const overlay = document.createElement("div");
    overlay.setAttribute("role", "status");
    overlay.style.cssText = "position:fixed;inset:0;z-index:200000;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:#102f36;color:#fff4dc;font:600 18px Arial,sans-serif;text-align:center;overflow:auto";
    const card = document.createElement("div");
    card.style.cssText = "max-width:420px;max-height:100%;overflow:auto;padding:22px;border:3px solid #bc914f;border-radius:18px;background:#174b53;box-shadow:0 10px 30px #061c22;box-sizing:border-box";
    overlay.append(card);
    document.body.append(overlay);
    journalStage.orientationNotice = overlay;
  }
  if (journalStage.orientationNotice) {
    journalStage.orientationNotice.style.display = needsPortrait ? "flex" : "none";
    const en = journalGame.__lockLootI18n?.language === "en";
    journalStage.orientationNotice.firstChild.textContent = en ?
      "↻ Rotate to portrait to read the journal. On a computer, make the window taller." :
      "↻ Drehe das Gerät ins Hochformat, um das Tagebuch zu lesen. Am Computer das Fenster höher ziehen.";
  }
}
if (journalStage?.canvas && typeof window !== "undefined") {
  const scale = Math.min(window.innerWidth / 720, window.innerHeight / 1280);
  const width = Math.max(1, Math.floor(720 * scale));
  const height = Math.max(1, Math.floor(1280 * scale));
  const desired = {position: "fixed", left: Math.floor((window.innerWidth - width) / 2) + "px",
    top: Math.floor((window.innerHeight - height) / 2) + "px",
    width: width + "px", height: height + "px"};
  for (const [property, value] of Object.entries(desired)) {
    journalStage.canvas.style.setProperty(property, value, "important");
  }
}
if (typeof document !== "undefined") for (const element of [document.documentElement, document.body]) {
  element.style.setProperty("background", "#102f36", "important");
  element.style.setProperty("background-color", "#102f36", "important");
}
const journalI18n = journalGame.__lockLootI18n;
const journalBackend = journalGame.__lockLootBackendRuntime;
const journalCore = journalGame.__lockLootJournalCore;
const journalObject = name => runtimeScene.getObjects(name)[0] || null;
const journalText = (name, value) => { const object = journalObject(name); if (object) object.setString(String(value)); };
const journalName = (name, value, size, maxWidth) => {
  const object = journalObject(name);
  if (!object) return;
  object.setWrapping(false);
  object.setString(String(value));
  for (let candidate = size; candidate >= 24; candidate--) {
    object.setCharacterSize(candidate);
    if (object.getWidth() <= maxWidth) break;
  }
};
const journalShow = (name, visible) => { const object = journalObject(name); if (object) object.hide(!visible); };
const journalT = (key, params = {}) => journalI18n ? journalI18n.t(key, params) : key;
const journalSceneCurrent = () => journalGame.getSceneStack().getCurrentScene() === runtimeScene;
const journalSafeNumber = value => {
  if (!Number.isSafeInteger(value) || value < 0) return "—";
  if (value >= 1000000000000) return "≈" +
    value.toExponential(0).replace("e+", "e");
  const locale = journalI18n?.language === "en" ? "en-US" : "de-DE";
  return value >= 1000000 ? "≈" + new Intl.NumberFormat(locale,
    {notation: "compact", maximumSignificantDigits: 4}).format(value) :
    value.toLocaleString(locale);
};

if (!runtimeScene.__lockLootL061Journal) {
  journalGame.__lockLootJournalSceneSerial = (journalGame.__lockLootJournalSceneSerial || 0) + 1;
  const state = {sceneId: `journal-${journalGame.__lockLootJournalSceneSerial}`,
    authGeneration: 0, session: null, active: true, dialog: null,
    lastLanguage: "", notice: "", authRejected: false, loading: false};
  runtimeScene.__lockLootL061Journal = state;
  const rawTransport = journalCore.createLocalJournalTransport();
  const context = () => ({environment: state.active && journalSceneCurrent() ?
    journalBackend?.environment : "blocked", sceneId: state.sceneId,
  authGeneration: state.authGeneration, uid: state.session?.uid || "",
  idToken: state.session?.idToken || ""});
  state.controller = journalCore.createJournalController({context,
    requestId: () => {
      const bytes = new Uint8Array(16);
      globalThis.crypto.getRandomValues(bytes);
      return "journal-" + [...bytes].map(value => value.toString(16).padStart(2, "0")).join("");
    },
    transport: async (url, data, token) => {
      try { return await rawTransport(url, data, token); }
      catch (error) {
        state.authRejected = error?.code === "functions/unauthenticated";
        throw error;
      }
    }});
  state.ensureSession = async force => {
    if (!journalBackend || !journalBackend.enabled || !journalBackend.isLocal) return false;
    const current = await (force ? journalBackend.refresh() : journalBackend.authenticate(false));
    if (!state.active || !journalSceneCurrent() || !current ||
        typeof current.uid !== "string" || typeof current.idToken !== "string") return false;
    if (state.session?.uid !== current.uid || state.session?.idToken !== current.idToken) {
      state.authGeneration++;
      state.session = current;
    }
    return true;
  };
  state.load = async (page = 0, half = 0) => {
    if (!state.active) return;
    if (state.loading) { state.queuedLoad = {page, half}; return; }
    state.loading = true;
    state.notice = "";
    try {
      if (!await state.ensureSession(false)) {
        await state.controller.load(page);
        return;
      }
      state.authRejected = false;
      let view = await state.controller.load(page);
      if (state.authRejected && state.active && journalSceneCurrent() &&
          await state.ensureSession(true)) {
        state.authRejected = false;
        view = await state.controller.load(page);
      }
      if (half && view.page === page && view.phase !== "loading") await state.controller.next();
      if (state.pendingNotice && ["ready", "empty"].includes(state.controller.view().phase)) {
        state.notice = state.pendingNotice;
      }
      state.pendingNotice = "";
    } catch (error) {
      state.pendingNotice = "";
      if (state.active) state.notice = "journal.connection_error";
    } finally {
      state.loading = false;
      if (state.queuedLoad && state.active) {
        const queued = state.queuedLoad;
        state.queuedLoad = null;
        void state.load(queued.page, queued.half);
      }
    }
  };
  if (!journalBackend?.isLocal) void state.controller.load(0);
  else void state.load(0);
}
const journalState = runtimeScene.__lockLootL061Journal;
const journalView = journalState.controller.view();
const journalRank = id => journalT("journal.rank." + id);
const journalButton = name => {
  const object = journalObject(name);
  if (!object || object.isHidden()) return false;
  const x = gdjs.evtTools.input.getCursorX(runtimeScene, "UI", 0);
  const y = gdjs.evtTools.input.getCursorY(runtimeScene, "UI", 0);
  const touchBounds = {JournalEdit: [408, 266, 230, 90],
    JournalPrevious: [107, 932, 175, 88], JournalNext: [465, 932, 175, 88],
    JournalBack: [214, 1021, 292, 88]};
  const bounds = touchBounds[name] || [object.getX(), object.getY(),
    object.getWidth(), object.getHeight()];
  return x >= bounds[0] && x <= bounds[0] + bounds[2] &&
    y >= bounds[1] && y <= bounds[1] + bounds[3];
};
const journalCloseDialog = () => {
  if (journalState.dialog) journalState.dialog.remove();
  journalState.dialog = null;
};
const journalOpenDialog = () => {
  if (journalState.dialog || !journalView.ownProfile || journalView.phase === "loading") return;
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;z-index:100000;display:flex;align-items:flex-start;justify-content:center;background:rgba(4,20,24,.72);padding:12px;box-sizing:border-box;overflow:auto";
  const form = document.createElement("form");
  form.style.cssText = "width:min(440px,100%);max-height:calc(100dvh - 24px);overflow:auto;margin:auto;background:#fff4dc;color:#173f47;border:4px solid #b78338;border-radius:18px;padding:20px;box-shadow:0 18px 48px #071b24;font:600 18px Arial,sans-serif;box-sizing:border-box";
  const title = document.createElement("label");
  title.textContent = journalT("journal.name_dialog");
  title.style.cssText = "display:block;margin-bottom:12px;font-size:24px";
  const input = document.createElement("input");
  input.type = "text";
  input.maxLength = 32;
  input.autocomplete = "nickname";
  input.value = journalView.ownProfile.displayName;
  input.setAttribute("aria-label", journalT("journal.name_dialog"));
  input.style.cssText = "width:100%;height:52px;box-sizing:border-box;border:2px solid #36717a;border-radius:8px;padding:8px 12px;font:22px Arial,sans-serif;background:#fffefa;color:#183d43";
  const error = document.createElement("p");
  error.setAttribute("role", "alert");
  error.style.cssText = "min-height:24px;color:#963820;font-size:15px;margin:8px 0 12px";
  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap;position:sticky;bottom:0;background:#fff4dc;padding-top:6px";
  const makeButton = (text, type) => {
    const button = document.createElement("button");
    button.type = type;
    button.textContent = text;
    button.style.cssText = "min-width:110px;min-height:48px;border:0;border-radius:9px;background:#17616b;color:#fff5d8;font:700 17px Arial,sans-serif;padding:8px 14px";
    return button;
  };
  const cancel = makeButton(journalT("journal.cancel"), "button");
  const save = makeButton(journalT("journal.save"), "submit");
  cancel.addEventListener("click", () => { if (!save.disabled) journalCloseDialog(); });
  actions.append(cancel, save);
  form.append(title, input, error, actions);
  overlay.append(form);
  document.body.append(overlay);
  journalState.dialog = overlay;
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (save.disabled || !journalState.active || !journalSceneCurrent()) return;
    save.disabled = true;
    cancel.disabled = true;
    error.textContent = "";
    try {
      const outcome = await journalState.controller.saveName(input.value);
      if (!journalState.active || !journalSceneCurrent() || journalState.dialog !== overlay) return;
      if (outcome.ok || outcome.reason === "conflict" || outcome.reason === "superseded") {
        const page = journalState.controller.view().page;
        const half = journalState.controller.view().half;
        journalCloseDialog();
        journalState.pendingNotice = outcome.ok ? "" : "journal.name_changed_elsewhere";
        void journalState.load(page, half);
      } else {
        error.textContent = journalT("journal.name_save_error");
        if (journalState.authRejected) void journalState.load(journalState.controller.view().page);
      }
    } catch (caught) {
      error.textContent = journalT("journal.name_invalid");
    } finally { save.disabled = false; cancel.disabled = false; }
  });
  input.focus();
  input.select();
};

journalText("JournalTitle", journalT("journal.title"));
journalText("JournalSubtitle", journalT("journal.subtitle"));
journalText("JournalProfileHeading", journalT("journal.my_profile"));
journalName("JournalName", journalView.ownProfile?.displayName || "—", 27, 510);
journalText("JournalTag", journalView.ownProfile ? "#" + journalView.ownProfile.tag : "");
journalText("JournalRank", journalView.own ? journalRank(journalView.own.rankId) : "—");
journalText("JournalOwnStats", journalView.own ? journalT("journal.own_stats", {
  wins: journalSafeNumber(journalView.own.firstSolveCount),
  cookies: journalSafeNumber(journalView.own.cookiesConsumed),
  lockpicks: journalSafeNumber(journalView.own.lockpicksConsumed)}) : "");
journalText("JournalEdit", journalT("journal.edit_name"));
journalText("JournalListHeading", journalT("journal.leaderboard"));
journalText("JournalHeadLegend", journalT("journal.stats_legend"));
for (let index = 0; index < 5; index++) {
  const entry = journalView.rows[index];
  const suffix = String(index + 1);
  journalText("JournalRowPlace" + suffix, entry ? entry.place ?? "—" : "");
  journalName("JournalRowName" + suffix, entry ? entry.displayName : "", 28, 465);
  journalText("JournalRowRank" + suffix, entry ? journalT("journal.rank_label",
    {rank: journalRank(entry.rankId)}) : "");
  journalText("JournalRowTag" + suffix, entry ? "#" + entry.tag : "");
  journalText("JournalRowStats" + suffix, entry ? journalT("journal.row_stats", {
    wins: journalSafeNumber(entry.firstSolveCount),
    cookies: journalSafeNumber(entry.cookiesConsumed),
    lockpicks: journalSafeNumber(entry.lockpicksConsumed)}) : "");
}
const statusKey = ({loading: "journal.loading", offline: "journal.offline",
  unavailable: "journal.unavailable", partial: "journal.partial",
  empty: "journal.empty", invalid: "journal.invalid", error: "journal.error",
  idle: "journal.loading"})[journalView.phase];
journalText("JournalStatus", journalState.notice && ["ready", "empty", "idle"].includes(journalView.phase) ?
  journalT(journalState.notice) : statusKey ? journalT(statusKey) : "");
const journalStatusObject = journalObject("JournalStatus");
if (journalStatusObject) {
  const roomy = journalView.rows.length === 0;
  journalStatusObject.setPosition(115, roomy ? 675 : 948);
  journalStatusObject.setCharacterSize(roomy ? 26 : 22);
  journalStatusObject.setWrapping(true);
  journalStatusObject.setWrappingWidth(520);
  journalStatusObject.setLineHeight(32);
}
journalText("JournalPageNumber", journalT("journal.page", {page: journalView.page * 2 + journalView.half + 1}));
journalText("JournalPrevious", journalT("journal.previous"));
journalText("JournalNext", journalT("journal.next"));
journalText("JournalBack", journalT("journal.back"));
const prevAvailable = journalView.phase !== "loading" && (journalView.page > 0 || journalView.half > 0);
const nextAvailable = journalView.phase !== "loading" &&
  (journalView.hasMoreInPage || journalView.hasNextPage);
for (const [name, available] of [["JournalPrevious", prevAvailable], ["JournalNext", nextAvailable],
  ["JournalEdit", !!journalView.ownProfile]]) {
  const object = journalObject(name);
  if (object) object.setOpacity(available ? 255 : 100);
}
if (!journalState.dialog && journalStage?.orientationNotice?.style.display !== "flex" &&
    gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left")) {
  if (journalButton("JournalBack")) {
    journalState.active = false;
    journalState.controller.reset();
    journalCloseDialog();
    journalStage?.restore();
    gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "MainMenu", false);
  } else if (journalButton("JournalEdit") && journalView.ownProfile) journalOpenDialog();
  else if (journalButton("JournalPrevious") && prevAvailable) {
    if (journalView.half) void journalState.controller.previous();
    else void journalState.load(journalView.page - 1, 1);
  } else if (journalButton("JournalNext") && nextAvailable) {
    if (journalView.hasMoreInPage) void journalState.controller.next();
    else void journalState.load(journalView.page + 1, 0);
  }
}
};
gdjs.JournalSceneCode.eventsList0 = function(runtimeScene) {

{


gdjs.JournalSceneCode.userFunc0xe66758(runtimeScene);

}


{


gdjs.JournalSceneCode.userFunc0xce1c18(runtimeScene);

}


{


gdjs.JournalSceneCode.userFunc0xe66b48(runtimeScene);

}


{


gdjs.JournalSceneCode.userFunc0xa9cae8(runtimeScene);

}


{


gdjs.JournalSceneCode.userFunc0xce5cd8(runtimeScene);

}


};

gdjs.JournalSceneCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.JournalSceneCode.GDJournalPageObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalTitleObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalSubtitleObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalProfileHeadingObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalNameObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalTagObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalRankObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalOwnStatsObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalEditObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalListHeadingObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalHeadLegendObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowPlace1Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowName1Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowRank1Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowTag1Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowStats1Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowPlace2Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowName2Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowRank2Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowTag2Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowStats2Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowPlace3Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowName3Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowRank3Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowTag3Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowStats3Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowPlace4Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowName4Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowRank4Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowTag4Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowStats4Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowPlace5Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowName5Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowRank5Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowTag5Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowStats5Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalStatusObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalPreviousObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalPageNumberObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalNextObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalBackButtonObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalBackObjects1.length = 0;
gdjs.JournalSceneCode.GDResourceHudCookieFrameObjects1.length = 0;
gdjs.JournalSceneCode.GDResourceHudLockpickFrameObjects1.length = 0;
gdjs.JournalSceneCode.GDResourceHudCookieIconObjects1.length = 0;
gdjs.JournalSceneCode.GDResourceHudLockpickIconObjects1.length = 0;
gdjs.JournalSceneCode.GDResourceHudCookiesTextObjects1.length = 0;
gdjs.JournalSceneCode.GDResourceHudLockpicksTextObjects1.length = 0;

gdjs.JournalSceneCode.eventsList0(runtimeScene);
gdjs.JournalSceneCode.GDJournalPageObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalTitleObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalSubtitleObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalProfileHeadingObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalNameObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalTagObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalRankObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalOwnStatsObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalEditObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalListHeadingObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalHeadLegendObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowPlace1Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowName1Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowRank1Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowTag1Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowStats1Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowPlace2Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowName2Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowRank2Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowTag2Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowStats2Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowPlace3Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowName3Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowRank3Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowTag3Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowStats3Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowPlace4Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowName4Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowRank4Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowTag4Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowStats4Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowPlace5Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowName5Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowRank5Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowTag5Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalRowStats5Objects1.length = 0;
gdjs.JournalSceneCode.GDJournalStatusObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalPreviousObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalPageNumberObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalNextObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalBackButtonObjects1.length = 0;
gdjs.JournalSceneCode.GDJournalBackObjects1.length = 0;
gdjs.JournalSceneCode.GDResourceHudCookieFrameObjects1.length = 0;
gdjs.JournalSceneCode.GDResourceHudLockpickFrameObjects1.length = 0;
gdjs.JournalSceneCode.GDResourceHudCookieIconObjects1.length = 0;
gdjs.JournalSceneCode.GDResourceHudLockpickIconObjects1.length = 0;
gdjs.JournalSceneCode.GDResourceHudCookiesTextObjects1.length = 0;
gdjs.JournalSceneCode.GDResourceHudLockpicksTextObjects1.length = 0;


return;

}

gdjs['JournalSceneCode'] = gdjs.JournalSceneCode;
