gdjs.ShopSzeneCode = {};
gdjs.ShopSzeneCode.localVariables = [];
gdjs.ShopSzeneCode.idToCallbackMap = new Map();
gdjs.ShopSzeneCode.GDShopBackgroundObjects1= [];
gdjs.ShopSzeneCode.GDShopBackgroundObjects2= [];
gdjs.ShopSzeneCode.GDShopTabCookiesObjects1= [];
gdjs.ShopSzeneCode.GDShopTabCookiesObjects2= [];
gdjs.ShopSzeneCode.GDShopTabLockpicksObjects1= [];
gdjs.ShopSzeneCode.GDShopTabLockpicksObjects2= [];
gdjs.ShopSzeneCode.GDShopCardFrameObjects1= [];
gdjs.ShopSzeneCode.GDShopCardFrameObjects2= [];
gdjs.ShopSzeneCode.GDShopCardIconObjects1= [];
gdjs.ShopSzeneCode.GDShopCardIconObjects2= [];
gdjs.ShopSzeneCode.GDShopPremiumPanelObjects1= [];
gdjs.ShopSzeneCode.GDShopPremiumPanelObjects2= [];
gdjs.ShopSzeneCode.GDShopPremiumBadgeObjects1= [];
gdjs.ShopSzeneCode.GDShopPremiumBadgeObjects2= [];
gdjs.ShopSzeneCode.GDShopBackButtonObjects1= [];
gdjs.ShopSzeneCode.GDShopBackButtonObjects2= [];
gdjs.ShopSzeneCode.GDShopTitleTextObjects1= [];
gdjs.ShopSzeneCode.GDShopTitleTextObjects2= [];
gdjs.ShopSzeneCode.GDShopTabCookiesTextObjects1= [];
gdjs.ShopSzeneCode.GDShopTabCookiesTextObjects2= [];
gdjs.ShopSzeneCode.GDShopTabLockpicksTextObjects1= [];
gdjs.ShopSzeneCode.GDShopTabLockpicksTextObjects2= [];
gdjs.ShopSzeneCode.GDShopCardTitleTextObjects1= [];
gdjs.ShopSzeneCode.GDShopCardTitleTextObjects2= [];
gdjs.ShopSzeneCode.GDShopCardQuantityTextObjects1= [];
gdjs.ShopSzeneCode.GDShopCardQuantityTextObjects2= [];
gdjs.ShopSzeneCode.GDShopCardPriceTextObjects1= [];
gdjs.ShopSzeneCode.GDShopCardPriceTextObjects2= [];
gdjs.ShopSzeneCode.GDShopCardBonusTextObjects1= [];
gdjs.ShopSzeneCode.GDShopCardBonusTextObjects2= [];
gdjs.ShopSzeneCode.GDShopPremiumTitleTextObjects1= [];
gdjs.ShopSzeneCode.GDShopPremiumTitleTextObjects2= [];
gdjs.ShopSzeneCode.GDShopPremiumBodyTextObjects1= [];
gdjs.ShopSzeneCode.GDShopPremiumBodyTextObjects2= [];
gdjs.ShopSzeneCode.GDShopPremiumPriceTextObjects1= [];
gdjs.ShopSzeneCode.GDShopPremiumPriceTextObjects2= [];
gdjs.ShopSzeneCode.GDShopPremiumStatusTextObjects1= [];
gdjs.ShopSzeneCode.GDShopPremiumStatusTextObjects2= [];
gdjs.ShopSzeneCode.GDShopStatusTextObjects1= [];
gdjs.ShopSzeneCode.GDShopStatusTextObjects2= [];
gdjs.ShopSzeneCode.GDShopCalendarButtonObjects1= [];
gdjs.ShopSzeneCode.GDShopCalendarButtonObjects2= [];
gdjs.ShopSzeneCode.GDShopCalendarButtonTextObjects1= [];
gdjs.ShopSzeneCode.GDShopCalendarButtonTextObjects2= [];
gdjs.ShopSzeneCode.GDShopBackButtonTextObjects1= [];
gdjs.ShopSzeneCode.GDShopBackButtonTextObjects2= [];
gdjs.ShopSzeneCode.GDStagingBadgeObjects1= [];
gdjs.ShopSzeneCode.GDStagingBadgeObjects2= [];
gdjs.ShopSzeneCode.GDResourceHudCookieFrameObjects1= [];
gdjs.ShopSzeneCode.GDResourceHudCookieFrameObjects2= [];
gdjs.ShopSzeneCode.GDResourceHudLockpickFrameObjects1= [];
gdjs.ShopSzeneCode.GDResourceHudLockpickFrameObjects2= [];
gdjs.ShopSzeneCode.GDResourceHudCookieIconObjects1= [];
gdjs.ShopSzeneCode.GDResourceHudCookieIconObjects2= [];
gdjs.ShopSzeneCode.GDResourceHudLockpickIconObjects1= [];
gdjs.ShopSzeneCode.GDResourceHudLockpickIconObjects2= [];
gdjs.ShopSzeneCode.GDResourceHudCookiesTextObjects1= [];
gdjs.ShopSzeneCode.GDResourceHudCookiesTextObjects2= [];
gdjs.ShopSzeneCode.GDResourceHudLockpicksTextObjects1= [];
gdjs.ShopSzeneCode.GDResourceHudLockpicksTextObjects2= [];


gdjs.ShopSzeneCode.userFunc0xcf9858 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-051: Zentrale, fail-closed Backendumgebung fuer local und staging.
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
const backendRuntime = backendGame.__lockLootBackendRuntime;
for (const badge of runtimeScene.getObjects("StagingBadge")) {
  const badgeI18n = backendGame.__lockLootI18n;
  badge.setString(badgeI18n ? badgeI18n.t("common.staging") : "STAGING");
  badge.hide(!backendRuntime || backendRuntime.environment !== "staging");
}
};
gdjs.ShopSzeneCode.userFunc0xcfa340 = function GDJSInlineCode(runtimeScene) {
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
    if (sceneName === 'SolutionScene') updateSolution(scene);
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
  musicGame[musicControllerKey] = { state, setEnabled, updateForScene };
}
musicGame[musicControllerKey].updateForScene(runtimeScene);
};
gdjs.ShopSzeneCode.userFunc0xa182c0 = function GDJSInlineCode(runtimeScene) {
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
gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopTabCookiesObjects1Objects = Hashtable.newFrom({"ShopTabCookies": gdjs.ShopSzeneCode.GDShopTabCookiesObjects1});
gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopTabLockpicksObjects1Objects = Hashtable.newFrom({"ShopTabLockpicks": gdjs.ShopSzeneCode.GDShopTabLockpicksObjects1});
gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopCardFrameObjects1Objects = Hashtable.newFrom({"ShopCardFrame": gdjs.ShopSzeneCode.GDShopCardFrameObjects1});
gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopPremiumPanelObjects1Objects = Hashtable.newFrom({"ShopPremiumPanel": gdjs.ShopSzeneCode.GDShopPremiumPanelObjects1});
gdjs.ShopSzeneCode.userFunc0xcfdc00 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-044: Zentralen Shopkatalog laden, Wallet anzeigen und Käufe sicher deaktiviert lassen.
const shopVariables = runtimeScene.getVariables();
const shopI18n = runtimeScene.getGame().__lockLootI18n;
const shopT = (key, parameters = {}) => shopI18n.t(key, parameters);
const shopGame = runtimeScene.getGame();
const shopFallbackCatalog = Object.freeze({"shopCatalogVersion":1,"currency":"EUR","priceMode":"PLANNED_DISPLAY_ONLY","products":[{"internalProductKey":"cookies_49","category":"cookies","resourceType":"cookies","quantity":49,"plannedPriceMinorUnits":99,"bonusLabel":null,"sortOrder":10,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"cookies_119","category":"cookies","resourceType":"cookies","quantity":119,"plannedPriceMinorUnits":199,"bonusLabel":"+20 %","sortOrder":20,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"cookies_349","category":"cookies","resourceType":"cookies","quantity":349,"plannedPriceMinorUnits":499,"bonusLabel":"+40 %","sortOrder":30,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"cookies_999","category":"cookies","resourceType":"cookies","quantity":999,"plannedPriceMinorUnits":999,"bonusLabel":"+100 %","sortOrder":40,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"lockpicks_79","category":"lockpicks","resourceType":"lockpicks","quantity":79,"plannedPriceMinorUnits":99,"bonusLabel":null,"sortOrder":10,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"lockpicks_191","category":"lockpicks","resourceType":"lockpicks","quantity":191,"plannedPriceMinorUnits":199,"bonusLabel":"+20 %","sortOrder":20,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"lockpicks_559","category":"lockpicks","resourceType":"lockpicks","quantity":559,"plannedPriceMinorUnits":499,"bonusLabel":"+40 %","sortOrder":30,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"lockpicks_1599","category":"lockpicks","resourceType":"lockpicks","quantity":1599,"plannedPriceMinorUnits":999,"bonusLabel":"+100 %","sortOrder":40,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"premium_pass_30_logins","category":"premium","resourceType":"premium_pass","quantity":1,"plannedPriceMinorUnits":499,"bonusLabel":null,"sortOrder":10,"enabled":true,"googlePlayProductId":null}]});
const shopSessionKey = "__lockLootShopSession";
const shopBackendRuntime = shopGame.__lockLootBackendRuntime;
const shopAuthStorageKey = shopBackendRuntime ? shopBackendRuntime.sessionStorageKey : "";
const shopReadSession = () => {
  try {
    const parsed = shopBackendRuntime ? shopBackendRuntime.readSession() : null;

    return parsed && typeof parsed.idToken === "string" && typeof parsed.uid === "string" ? parsed : null;
  } catch (error) { return null; }
};
const shopSaveSession = (session) => {
  try { if (shopBackendRuntime) shopBackendRuntime.saveSession(session); } catch (error) {}
};
if (!shopGame[shopSessionKey]) shopGame[shopSessionKey] = shopReadSession() || {idToken: "", uid: ""};
const shopSession = shopGame[shopSessionKey];
const shopObjects = (name) => runtimeScene.getObjects(name).slice().sort((left, right) => (left.getY() + left.getHeight() / 2) - (right.getY() + right.getHeight() / 2) || (left.getX() + left.getWidth() / 2) - (right.getX() + right.getWidth() / 2));
const shopSetText = (name, value) => { const objects = shopObjects(name); if (objects[0] && typeof objects[0].setString === "function") objects[0].setString(value); };
const shopSetColor = (object, value) => { if (object && typeof object.setColor === "function") object.setColor(value); };
const shopSetOpacity = (object, value) => { if (object && typeof object.setOpacity === "function") object.setOpacity(value); };
const shopFitText = (object, value, sizes, wrappingWidth = 0) => {
  if (!object) return;
  object.setString(value);
  const selected = value.length > sizes[2][0] ? sizes[2][1] : value.length > sizes[1][0] ? sizes[1][1] : sizes[0][1];
  if (typeof object.setCharacterSize === "function") object.setCharacterSize(selected);
  if (wrappingWidth && typeof object.setWrapping === "function") { object.setWrapping(true); object.setWrappingWidth(wrappingWidth); }
};
const shopFormatPrice = (minorUnits) => shopT("shop.price", { amount: (minorUnits / 100).toFixed(2).replace(".", shopI18n.language === "de" ? "," : ".") });
const shopValidateCatalog = (catalog) => {
  const validProduct = (product) => product && typeof product.internalProductKey === "string" &&
    ["cookies", "lockpicks", "premium"].includes(product.category) &&
    Number.isSafeInteger(product.quantity) && product.quantity > 0 &&
    Number.isSafeInteger(product.plannedPriceMinorUnits) && product.plannedPriceMinorUnits > 0 &&
    Number.isSafeInteger(product.sortOrder) && typeof product.enabled === "boolean" &&
    (product.bonusLabel === null || typeof product.bonusLabel === "string") &&
    (product.googlePlayProductId === null || typeof product.googlePlayProductId === "string");
  if (!catalog || catalog.shopCatalogVersion !== 1 || catalog.currency !== "EUR" ||
      catalog.priceMode !== "PLANNED_DISPLAY_ONLY" || !Array.isArray(catalog.products) ||
      !catalog.products.every(validProduct)) throw Object.assign(new Error("Ungültiger Shopkatalog."), {status: "INVALID_RESPONSE"});
  return catalog;
};
const shopValidateWallet = (wallet) => {
  if (!wallet || !Number.isSafeInteger(wallet.cookies) || wallet.cookies < 0 ||
      !Number.isSafeInteger(wallet.lockpicks) || wallet.lockpicks < 0 ||
      !Number.isSafeInteger(wallet.revision) || wallet.revision < 0) {
    throw Object.assign(new Error("Ungültige Wallet-Antwort."), {status: "INVALID_RESPONSE"});
  }
  return {cookies: wallet.cookies, lockpicks: wallet.lockpicks, revision: wallet.revision};
};
const shopRender = (state) => {
  const category = state.category;
  const products = state.catalog.products.filter((entry) => entry.enabled && entry.category === category).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 4);
  const cards = shopObjects("ShopCardFrame");
  const icons = shopObjects("ShopCardIcon");
  const titles = shopObjects("ShopCardTitleText");
  const quantities = shopObjects("ShopCardQuantityText");
  const prices = shopObjects("ShopCardPriceText");
  const bonuses = shopObjects("ShopCardBonusText");
  for (const cardText of [...titles, ...quantities, ...prices, ...bonuses]) {
    if (typeof cardText.showShadow === "function") cardText.showShadow(false);
    if (typeof cardText.setOutlineThickness === "function") cardText.setOutlineThickness(1);
  }
  for (let index = 0; index < 4; index += 1) {
    const product = products[index];
    const visible = Boolean(product);
    for (const object of [cards[index], icons[index], titles[index], quantities[index], prices[index], bonuses[index]]) shopSetOpacity(object, visible ? 255 : 0);
    if (!product) continue;
    if (icons[index] && typeof icons[index].setAnimation === "function") icons[index].setAnimation((category === "cookies" ? 0 : 4) + index);
    shopFitText(titles[index], shopT("shop.product." + product.internalProductKey), [[12, 15], [16, 13], [22, 12]], 180);
    const quantitySizes = category === "cookies" ? [[13, 22], [18, 18], [24, 15]] : [[13, 18], [18, 17], [24, 15]];
    shopFitText(quantities[index], shopT(category === "cookies" ? "shop.quantity_cookies" : "shop.quantity_lockpicks", { quantity: product.quantity }), quantitySizes);
    shopFitText(prices[index], shopFormatPrice(product.plannedPriceMinorUnits), [[11, 19], [16, 15], [24, 13]]);
    shopFitText(bonuses[index], product.bonusLabel ? shopT("shop.volume_bonus", { bonus: product.bonusLabel }) : shopT("shop.base_offer"), [[23, 15], [32, 14], [44, 12]], 180);
    shopSetColor(bonuses[index], product.bonusLabel ? "146;57;18" : "91;74;51");
  }
  const cookieTabs = shopObjects("ShopTabCookies");
  const lockpickTabs = shopObjects("ShopTabLockpicks");
  const cookieTabTexts = shopObjects("ShopTabCookiesText");
  const lockpickTabTexts = shopObjects("ShopTabLockpicksText");
  shopSetColor(cookieTabs[0], category === "cookies" ? "255;228;144" : "165;148;128");
  shopSetColor(lockpickTabs[0], category === "lockpicks" ? "225;242;248" : "165;148;128");
  shopSetOpacity(cookieTabs[0], category === "cookies" ? 255 : 208);
  shopSetOpacity(lockpickTabs[0], category === "lockpicks" ? 255 : 208);
  shopSetColor(cookieTabTexts[0], category === "cookies" ? "70;35;15" : "128;109;90");
  shopSetColor(lockpickTabTexts[0], category === "lockpicks" ? "55;64;70" : "128;109;90");
  shopSetOpacity(cookieTabTexts[0], category === "cookies" ? 255 : 228);
  shopSetOpacity(lockpickTabTexts[0], category === "lockpicks" ? 255 : 228);
  shopVariables.get("ShopCategory").setString(category);
  shopVariables.get("ShopCatalogVersion").setNumber(state.catalog.shopCatalogVersion);
  shopVariables.get("ShopBackendAvailable").setBoolean(state.backendAvailable);
  shopVariables.get("ShopPremiumEntitled").setBoolean(state.premiumEntitled);
  // L&L-047-Kompatibilität: "shop.inventory" bleibt im Katalog; L&L-048 rendert hier keine Walletwörter.
  const premiumPanels = shopObjects("ShopPremiumPanel"); const premiumBadges = shopObjects("ShopPremiumBadge"); const premiumStatuses = shopObjects("ShopPremiumStatusText");
  for (const premiumBadge of premiumBadges) shopSetOpacity(premiumBadge, state.premiumEntitled ? 255 : 105);
  shopSetColor(premiumPanels[0], state.premiumEntitled ? "255;255;255" : "170;160;170");
  shopSetColor(premiumStatuses[0], state.premiumEntitled ? "255;225;116" : "200;184;210");
  shopFitText(premiumStatuses[0], state.premiumEntitled ? shopT("shop.premium_active") : shopT("shop.premium_inactive"), [[32, 14], [42, 12], [54, 10]], 500);
  shopFitText(shopObjects("ShopStatusText")[0], state.statusMessage, [[54, 15], [74, 12], [96, 10]], 600);
};
const shopSetStatus = (state, message) => { state.statusMessage = message; shopVariables.get("ShopStatusMessage").setString(message); shopSetText("ShopStatusText", message); };

if (runtimeScene.getTimeManager().isFirstFrame()) {
  const backendRuntime = shopGame.__lockLootBackendRuntime;
  if (!backendRuntime || !backendRuntime.enabled) throw Object.assign(new Error('Backendumgebung ist deaktiviert.'), { status: 'ENVIRONMENT_BLOCKED' });
  const endpoints = backendRuntime.endpoints;
  const callCallable = (endpoint, data, idToken) => backendRuntime.callCallable(endpoint, data, idToken);
  const state = {catalog: shopValidateCatalog(shopFallbackCatalog), category: "cookies", wallet: null, premiumEntitled: false, backendAvailable: false, statusMessage: shopT("shop.catalog_planned")};
  runtimeScene.__lockLootShopScene = state;
  shopRender(state);
  const authenticate = async () => {
    const auth = await backendRuntime.authenticate(false);
    shopSession.idToken = auth.idToken; shopSession.uid = auth.uid; shopSession.refreshToken = auth.refreshToken || ''; shopSaveSession(shopSession);
  };
  const load = async (retry) => {
    if (!shopSession.idToken) await authenticate();
    try {
      await backendRuntime.prepare("L&L-044");
      const snapshot = await callCallable(endpoints.bootstrap, {integration: "L&L-044"}, shopSession.idToken);
      if (!snapshot || snapshot.uid !== shopSession.uid) throw Object.assign(new Error("Bootstrap-UID stimmt nicht."), {status: "INVALID_RESPONSE"});
      state.wallet = shopValidateWallet(snapshot);
      const hud = shopGame.__lockLootResourceHud;
      if (hud) hud.acceptConfirmed(state.wallet, shopSession.uid, runtimeScene);
      state.catalog = shopValidateCatalog(snapshot.shopCatalog);
      state.premiumEntitled = Boolean(snapshot.calendar && snapshot.calendar.premiumEntitled === true);
      state.backendAvailable = true;
      shopVariables.get("ShopWalletCookies").setNumber(state.wallet.cookies);
      shopVariables.get("ShopWalletLockpicks").setNumber(state.wallet.lockpicks);
      shopSetStatus(state, shopT("shop.server_loaded"));
      shopRender(state);
    } catch (error) {
      if (retry && error?.status === "UNAUTHENTICATED") { shopSession.idToken = ""; shopSession.uid = ""; return load(false); }
      throw error;
    }
  };
  void load(true).catch(() => {
    if (runtimeScene.__lockLootShopScene !== state) return;
    state.backendAvailable = false; state.wallet = null; state.premiumEntitled = false;
    shopSetStatus(state, shopT("shop.backend_offline"));
    shopRender(state);
  });
}

const shopState = runtimeScene.__lockLootShopScene;
const shopActionVariable = shopVariables.get("ShopAction");
const shopAction = shopActionVariable.getAsString();
if (shopState && shopAction) {
  shopActionVariable.setString("");
  if (shopAction === "category-cookies" || shopAction === "category-lockpicks") {
    shopState.category = shopAction === "category-cookies" ? "cookies" : "lockpicks";
    shopSetStatus(shopState, shopState.category === "cookies" ? shopT("shop.cookies_disabled") : shopT("shop.lockpicks_disabled"));
    shopRender(shopState);
  } else if (shopAction === "product" || shopAction === "premium") {
    // L&L-044: Kein Kauf, keine Walletgutschrift und keine Premiumaktivierung.
    shopSetStatus(shopState, shopT("shop.purchases_later"));
    shopRender(shopState);
  }
}
};
gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopCalendarButtonObjects1Objects = Hashtable.newFrom({"ShopCalendarButton": gdjs.ShopSzeneCode.GDShopCalendarButtonObjects1});
gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopBackButtonObjects1Objects = Hashtable.newFrom({"ShopBackButton": gdjs.ShopSzeneCode.GDShopBackButtonObjects1});
gdjs.ShopSzeneCode.userFunc0xc18f18 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-047: Statische Shop-Spielertexte aus dem zentralen Katalog.
const i18n = runtimeScene.getGame().__lockLootI18n;
if (!runtimeScene.__lockLootL047Shop || runtimeScene.__lockLootL047Shop !== i18n.revision) {
  runtimeScene.__lockLootL047Shop = i18n.revision;
  const set = (name, key) => { const object = runtimeScene.getObjects(name)[0]; if (object) object.setString(i18n.t(key)); };
  set("ShopTitleText", "shop.title"); set("ShopTabCookiesText", "shop.cookies"); set("ShopTabLockpicksText", "shop.lockpicks");
  set("ShopPremiumTitleText", "shop.premium_title"); set("ShopPremiumBodyText", "shop.premium_body"); set("ShopPremiumPriceText", "shop.premium_price");
  set("ShopCalendarButtonText", "shop.calendar"); set("ShopBackButtonText", "shop.back");
  const state = runtimeScene.__lockLootShopScene; if (state && typeof shopRender === "function") shopRender(state);
}
};
gdjs.ShopSzeneCode.userFunc0xa09d78 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-048: Zentrales, rein lesendes Ressourcen-HUD aus bestätigten Serverantworten.
const resourceHudGame = runtimeScene.getGame();
if (!resourceHudGame.__lockLootResourceHud) {
  const resourceHudConfig = JSON.parse(resourceHudGame.getVariables().get("resourceHudConfigJson").getAsString());
  const resourceHudStorageKey = "lockloot.wallet-confirmed.v1";
  const resourceHudAuthStorageKey = resourceHudGame.__lockLootBackendRuntime ? resourceHudGame.__lockLootBackendRuntime.sessionStorageKey : "__lockLootL040LocalAuth";
  const normalizeWallet = (wallet) => {
    if (!wallet || !Number.isSafeInteger(wallet.cookies) || wallet.cookies < 0 || !Number.isSafeInteger(wallet.lockpicks) || wallet.lockpicks < 0 || !Number.isSafeInteger(wallet.revision) || wallet.revision < 0) return null;
    return {cookies: wallet.cookies, lockpicks: wallet.lockpicks, revision: wallet.revision};
  };
  const readAuthUid = () => {
    try {
      const backendUid = resourceHudGame.__lockLootBackendRuntime ? resourceHudGame.__lockLootBackendRuntime.getUid() : "";
      if (backendUid) return backendUid;
      const raw = globalThis.localStorage ? globalThis.localStorage.getItem(resourceHudAuthStorageKey) : "";
      const session = raw ? JSON.parse(raw) : null;
      return session && typeof session.uid === "string" ? session.uid : "";
    } catch (error) { return ""; }
  };
  const readConfirmed = () => {
    try {
      const raw = globalThis.localStorage ? globalThis.localStorage.getItem(resourceHudStorageKey) : "";
      const cached = raw ? JSON.parse(raw) : null;
      const wallet = normalizeWallet(cached);
      const activeUid = readAuthUid();
      return wallet && activeUid && cached.uid === activeUid ? {...wallet, uid: activeUid} : null;
    } catch (error) { return null; }
  };
  const objects = (scene, name) => scene.getObjects(name);
  const place = (object, x, y, width, height, zOrder) => {
    if (!object) return;
    object.setPosition(x, y);
    if (typeof object.setWidth === "function") object.setWidth(width);
    if (typeof object.setHeight === "function") object.setHeight(height);
    if (typeof object.setZOrder === "function") object.setZOrder(zOrder);
  };
  const state = {
    config: Object.freeze(resourceHudConfig),
    confirmed: readConfirmed(),
    acceptConfirmed(wallet, uid, scene) {
      const safeWallet = normalizeWallet(wallet);
      if (!safeWallet || typeof uid !== "string" || !uid) return false;
      state.confirmed = {...safeWallet, uid};
      try {
        if (globalThis.localStorage) globalThis.localStorage.setItem(resourceHudStorageKey, JSON.stringify(state.confirmed));
      } catch (error) {}
      if (scene) state.render(scene);
      return true;
    },
    render(scene) {
      const c = state.config;
      const firstY = c.anchorY;
      const secondY = c.anchorY + c.rowHeight + c.rowGap;
      place(objects(scene, "ResourceHudCookieFrame")[0], c.anchorX, firstY, c.width, c.rowHeight, c.frameZ);
      place(objects(scene, "ResourceHudLockpickFrame")[0], c.anchorX, secondY, c.width, c.rowHeight, c.frameZ);
      place(objects(scene, "ResourceHudCookieIcon")[0], c.anchorX + c.iconInsetX, firstY + c.iconInsetY, c.iconSize, c.iconSize, c.iconZ);
      place(objects(scene, "ResourceHudLockpickIcon")[0], c.anchorX + c.iconInsetX, secondY + c.iconInsetY, c.iconSize, c.iconSize, c.iconZ);
      const cookieText = objects(scene, "ResourceHudCookiesText")[0];
      const lockpickText = objects(scene, "ResourceHudLockpicksText")[0];
      place(cookieText, c.anchorX + c.textOffsetX, firstY + c.textInsetY, c.textWidth, c.textHeight, c.textZ);
      place(lockpickText, c.anchorX + c.textOffsetX, secondY + c.textInsetY, c.textWidth, c.textHeight, c.textZ);
      const value = state.confirmed;
      if (cookieText) {
        cookieText.setString(value ? String(value.cookies) : c.unavailableText);
        if (typeof cookieText.setCharacterSize === "function") cookieText.setCharacterSize(c.fontSize);
      }
      if (lockpickText) {
        lockpickText.setString(value ? String(value.lockpicks) : c.unavailableText);
        if (typeof lockpickText.setCharacterSize === "function") lockpickText.setCharacterSize(c.fontSize);
      }
    }
  };
  resourceHudGame.__lockLootResourceHud = state;
}
const resourceHud = resourceHudGame.__lockLootResourceHud;
if (!runtimeScene.getObjects("ResourceHudCookieFrame").length) {
  gdjs.evtTools.runtimeScene.createObjectsFromExternalLayout(runtimeScene, "SharedResourceHUD_720x1280", 0, 0, 0);
}
resourceHud.render(runtimeScene);
};
gdjs.ShopSzeneCode.eventsList0 = function(runtimeScene) {

{


gdjs.ShopSzeneCode.userFunc0xcf9858(runtimeScene);

}


{


gdjs.ShopSzeneCode.userFunc0xcfa340(runtimeScene);

}


{


gdjs.ShopSzeneCode.userFunc0xa182c0(runtimeScene);

}


{

gdjs.copyArray(runtimeScene.getObjects("ShopTabCookies"), gdjs.ShopSzeneCode.GDShopTabCookiesObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopTabCookiesObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(0).setString("category-cookies");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("ShopTabLockpicks"), gdjs.ShopSzeneCode.GDShopTabLockpicksObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopTabLockpicksObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(0).setString("category-lockpicks");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("ShopCardFrame"), gdjs.ShopSzeneCode.GDShopCardFrameObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopCardFrameObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(0).setString("product");
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("ShopPremiumPanel"), gdjs.ShopSzeneCode.GDShopPremiumPanelObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopPremiumPanelObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().getFromIndex(0).setString("premium");
}
}

}


{


gdjs.ShopSzeneCode.userFunc0xcfdc00(runtimeScene);

}


{

gdjs.copyArray(runtimeScene.getObjects("ShopCalendarButton"), gdjs.ShopSzeneCode.GDShopCalendarButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopCalendarButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "TreasureCalendarScene", false);
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("ShopBackButton"), gdjs.ShopSzeneCode.GDShopBackButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopBackButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "MainMenu", false);
}
}

}


{


gdjs.ShopSzeneCode.userFunc0xc18f18(runtimeScene);

}


{


gdjs.ShopSzeneCode.userFunc0xa09d78(runtimeScene);

}


};

gdjs.ShopSzeneCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.ShopSzeneCode.GDShopBackgroundObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopBackgroundObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopTabCookiesObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopTabCookiesObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopTabLockpicksObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopTabLockpicksObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCardFrameObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCardFrameObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCardIconObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCardIconObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumPanelObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumPanelObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumBadgeObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumBadgeObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopBackButtonObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopBackButtonObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopTitleTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopTitleTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopTabCookiesTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopTabCookiesTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopTabLockpicksTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopTabLockpicksTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCardTitleTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCardTitleTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCardQuantityTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCardQuantityTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCardPriceTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCardPriceTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCardBonusTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCardBonusTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumTitleTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumTitleTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumBodyTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumBodyTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumPriceTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumPriceTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumStatusTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumStatusTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopStatusTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopStatusTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCalendarButtonObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCalendarButtonObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCalendarButtonTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCalendarButtonTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopBackButtonTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopBackButtonTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDStagingBadgeObjects1.length = 0;
gdjs.ShopSzeneCode.GDStagingBadgeObjects2.length = 0;
gdjs.ShopSzeneCode.GDResourceHudCookieFrameObjects1.length = 0;
gdjs.ShopSzeneCode.GDResourceHudCookieFrameObjects2.length = 0;
gdjs.ShopSzeneCode.GDResourceHudLockpickFrameObjects1.length = 0;
gdjs.ShopSzeneCode.GDResourceHudLockpickFrameObjects2.length = 0;
gdjs.ShopSzeneCode.GDResourceHudCookieIconObjects1.length = 0;
gdjs.ShopSzeneCode.GDResourceHudCookieIconObjects2.length = 0;
gdjs.ShopSzeneCode.GDResourceHudLockpickIconObjects1.length = 0;
gdjs.ShopSzeneCode.GDResourceHudLockpickIconObjects2.length = 0;
gdjs.ShopSzeneCode.GDResourceHudCookiesTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDResourceHudCookiesTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDResourceHudLockpicksTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDResourceHudLockpicksTextObjects2.length = 0;

gdjs.ShopSzeneCode.eventsList0(runtimeScene);
gdjs.ShopSzeneCode.GDShopBackgroundObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopBackgroundObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopTabCookiesObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopTabCookiesObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopTabLockpicksObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopTabLockpicksObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCardFrameObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCardFrameObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCardIconObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCardIconObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumPanelObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumPanelObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumBadgeObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumBadgeObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopBackButtonObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopBackButtonObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopTitleTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopTitleTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopTabCookiesTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopTabCookiesTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopTabLockpicksTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopTabLockpicksTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCardTitleTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCardTitleTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCardQuantityTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCardQuantityTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCardPriceTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCardPriceTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCardBonusTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCardBonusTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumTitleTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumTitleTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumBodyTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumBodyTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumPriceTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumPriceTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumStatusTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopPremiumStatusTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopStatusTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopStatusTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCalendarButtonObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCalendarButtonObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopCalendarButtonTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopCalendarButtonTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopBackButtonTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopBackButtonTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDStagingBadgeObjects1.length = 0;
gdjs.ShopSzeneCode.GDStagingBadgeObjects2.length = 0;
gdjs.ShopSzeneCode.GDResourceHudCookieFrameObjects1.length = 0;
gdjs.ShopSzeneCode.GDResourceHudCookieFrameObjects2.length = 0;
gdjs.ShopSzeneCode.GDResourceHudLockpickFrameObjects1.length = 0;
gdjs.ShopSzeneCode.GDResourceHudLockpickFrameObjects2.length = 0;
gdjs.ShopSzeneCode.GDResourceHudCookieIconObjects1.length = 0;
gdjs.ShopSzeneCode.GDResourceHudCookieIconObjects2.length = 0;
gdjs.ShopSzeneCode.GDResourceHudLockpickIconObjects1.length = 0;
gdjs.ShopSzeneCode.GDResourceHudLockpickIconObjects2.length = 0;
gdjs.ShopSzeneCode.GDResourceHudCookiesTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDResourceHudCookiesTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDResourceHudLockpicksTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDResourceHudLockpicksTextObjects2.length = 0;


return;

}

gdjs['ShopSzeneCode'] = gdjs.ShopSzeneCode;
