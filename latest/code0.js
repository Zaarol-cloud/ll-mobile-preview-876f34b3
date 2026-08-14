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
gdjs.MainMenuCode.GDResourceHudCookieFrameObjects1= [];
gdjs.MainMenuCode.GDResourceHudLockpickFrameObjects1= [];
gdjs.MainMenuCode.GDResourceHudCookieIconObjects1= [];
gdjs.MainMenuCode.GDResourceHudLockpickIconObjects1= [];
gdjs.MainMenuCode.GDResourceHudCookiesTextObjects1= [];
gdjs.MainMenuCode.GDResourceHudLockpicksTextObjects1= [];


gdjs.MainMenuCode.userFunc0xce8df0 = function GDJSInlineCode(runtimeScene) {
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
gdjs.MainMenuCode.userFunc0xce8f08 = function GDJSInlineCode(runtimeScene) {
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
gdjs.MainMenuCode.userFunc0xa0dab0 = function GDJSInlineCode(runtimeScene) {
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
gdjs.MainMenuCode.userFunc0xce5428 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-052: Initialisierung und Laufzeitaktualisierung erfolgen zentral über MusicController_Events.
};
gdjs.MainMenuCode.userFunc0xbe7438 = function GDJSInlineCode(runtimeScene) {
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
gdjs.MainMenuCode.userFunc0xce5770 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-046/L&L-047/L&L-052: Aufgeräumte Hauptnavigation, zentrale persistente Musiksteuerung und lokale Sprachwahl.
const menuGame = runtimeScene.getGame();
const menuI18n = menuGame.__lockLootI18n;
const menuController = menuGame.__lockLootMusicController;
if (!runtimeScene.__lockLootL046Menu) {
  runtimeScene.__lockLootL046Menu = { musicEnabled: menuController ? menuController.state.musicEnabled : true, languagePanelOpen: false, hoverName: "" };
}
const menuState = runtimeScene.__lockLootL046Menu;
if (menuController) menuState.musicEnabled = menuController.state.musicEnabled;
const menuCursorX = gdjs.evtTools.input.getCursorX(runtimeScene, "UI", 0);
const menuCursorY = gdjs.evtTools.input.getCursorY(runtimeScene, "UI", 0);
const firstMenuObject = name => runtimeScene.getObjects(name)[0] || null;
const cursorOnMenuObject = object => object && menuCursorX >= object.getX() && menuCursorX <= object.getX() + object.getWidth() && menuCursorY >= object.getY() && menuCursorY <= object.getY() + object.getHeight();
const setMenuText = (name, value) => { const object = firstMenuObject(name); if (object) object.setString(value); };
const showMenuObject = (name, visible) => { for (const object of runtimeScene.getObjects(name)) object.hide(!visible); };
const playButton = firstMenuObject("MainMenuPlayButton");
const shopButton = firstMenuObject("MainMenuShopButton");
const musicButton = firstMenuObject("MainMenuMusicButton");
const languageButton = firstMenuObject("MainMenuLanguageButton");
const deButton = firstMenuObject("MainMenuLanguageDeButton");
const enButton = firstMenuObject("MainMenuLanguageEnButton");
const panelObjects = ["MainMenuLanguagePanel", "MainMenuLanguagePanelTitle", "MainMenuLanguageDeButton", "MainMenuLanguageEnButton", "MainMenuLanguageDeText", "MainMenuLanguageEnText"];
for (const name of panelObjects) showMenuObject(name, menuState.languagePanelOpen);
setMenuText("MainMenuPlayText", menuI18n.t("menu.play"));
setMenuText("MainMenuShopText", menuI18n.t("menu.shop"));
setMenuText("MainMenuMusicStateText", menuI18n.t(menuState.musicEnabled ? "menu.music_on" : "menu.music_off"));
setMenuText("MainMenuLanguageStateText", menuI18n.t("menu.language"));
setMenuText("MainMenuLanguagePanelTitle", menuI18n.t("menu.language_panel_title"));
setMenuText("MainMenuLanguageDeText", menuI18n.t("menu.language_de"));
setMenuText("MainMenuLanguageEnText", menuI18n.t("menu.language_en"));
setMenuText("MainMenuUtilityHintText", "");
const buttonEntries = [["play", playButton], ["shop", shopButton], ["music", musicButton], ["language", languageButton], ["de", deButton], ["en", enButton]];
menuState.hoverName = "";
for (const [name, button] of buttonEntries) {
  const available = !["de", "en"].includes(name) || menuState.languagePanelOpen;
  const hovered = available && cursorOnMenuObject(button);
  if (hovered) menuState.hoverName = name;
  if (button) {
    const selectedLanguage = menuState.languagePanelOpen && ((name === "de" && menuI18n.language === "de") || (name === "en" && menuI18n.language === "en"));
    button.setOpacity(hovered || selectedLanguage ? 255 : 238);
    button.setColor(hovered ? "255;239;184" : selectedLanguage ? "255;223;142" : "255;255;255");
  }
}
if (gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left")) {
  if (menuState.languagePanelOpen && cursorOnMenuObject(deButton)) { menuI18n.setLanguage("de"); menuState.languagePanelOpen = false; }
  else if (menuState.languagePanelOpen && cursorOnMenuObject(enButton)) { menuI18n.setLanguage("en"); menuState.languagePanelOpen = false; }
  else if (cursorOnMenuObject(languageButton)) menuState.languagePanelOpen = !menuState.languagePanelOpen;
  else if (!menuState.languagePanelOpen && cursorOnMenuObject(playButton)) gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "TrainingScene", false);
  else if (!menuState.languagePanelOpen && cursorOnMenuObject(shopButton)) gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "TreasureCalendarScene", false);
  else if (!menuState.languagePanelOpen && cursorOnMenuObject(musicButton)) {
    if (menuController) menuController.setEnabled(runtimeScene, !menuController.state.musicEnabled);
    menuState.musicEnabled = menuController ? menuController.state.musicEnabled : false;
  } else if (menuState.languagePanelOpen) menuState.languagePanelOpen = false;
}
};
gdjs.MainMenuCode.eventsList0 = function(runtimeScene) {

{


gdjs.MainMenuCode.userFunc0xce8df0(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xce8f08(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xa0dab0(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xce5428(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xbe7438(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xce5770(runtimeScene);

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
gdjs.MainMenuCode.GDResourceHudCookieFrameObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudLockpickFrameObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudCookieIconObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudLockpickIconObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudCookiesTextObjects1.length = 0;
gdjs.MainMenuCode.GDResourceHudLockpicksTextObjects1.length = 0;


return;

}

gdjs['MainMenuCode'] = gdjs.MainMenuCode;
