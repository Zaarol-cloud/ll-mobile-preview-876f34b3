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


gdjs.MainMenuCode.userFunc0xcae690 = function GDJSInlineCode(runtimeScene) {
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
gdjs.MainMenuCode.userFunc0xce8058 = function GDJSInlineCode(runtimeScene) {
"use strict";
const game = runtimeScene.getGame();
const controllerKey = '__lockLootMusicController';
if (!game[controllerKey]) {
  const musicChannel = 20;
  const forcedMainTrack = { name: 'music_main_always', style: 'Neutral' };
  const mainTracks = [
    { name: 'music_main_accordion_1', style: 'Akkordeon' },
    { name: 'music_main_accordion_2', style: 'Akkordeon' },
    { name: 'music_main_marimba_1', style: 'Marimba' },
    { name: 'music_main_marimba_2', style: 'Marimba' }
  ];
  const puzzleTracks = [
    { name: 'music_puzzle_accordion_1', style: 'Akkordeon' },
    { name: 'music_puzzle_accordion_2', style: 'Akkordeon' },
    { name: 'music_puzzle_accordion_3', style: 'Akkordeon' },
    { name: 'music_puzzle_accordion_4', style: 'Akkordeon' },
    { name: 'music_puzzle_acoustic_1', style: 'Akustik' },
    { name: 'music_puzzle_acoustic_2', style: 'Akustik' },
    { name: 'music_puzzle_acoustic_3', style: 'Akustik' },
    { name: 'music_puzzle_acoustic_4', style: 'Akustik' },
    { name: 'music_puzzle_marimba_1', style: 'Marimba' },
    { name: 'music_puzzle_marimba_2', style: 'Marimba' },
    { name: 'music_puzzle_marimba_3', style: 'Marimba' },
    { name: 'music_puzzle_marimba_4', style: 'Marimba' },
    { name: 'music_puzzle_marimba_5', style: 'Marimba' },
    { name: 'music_puzzle_marimba_6', style: 'Marimba' }
  ];
  const state = { currentTrack: null, recentTracks: [], lastStyle: '', puzzleTracksRemaining: 2, wasPlaying: false, lastStartAttempt: 0, mainMenuScene: null, error: '' };
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
    if (!track) return;
    if (remember) rememberTrack(track);
    state.currentTrack = track;
    state.wasPlaying = false;
    state.lastStartAttempt = Date.now();
    gdjs.evtTools.sound.playMusicOnChannel(scene, track.name, musicChannel, false, 70, 1);
  };
  const startNextTrack = scene => {
    let nextTrack = null;
    if (state.puzzleTracksRemaining > 0) {
      nextTrack = chooseTrack(puzzleTracks);
      if (nextTrack) state.puzzleTracksRemaining--;
    } else {
      nextTrack = chooseTrack(mainTracks);
      if (nextTrack) state.puzzleTracksRemaining = 2;
    }
    startTrack(scene, nextTrack, true);
  };
  const forceMain = scene => {
    gdjs.evtTools.sound.stopMusicOnChannel(scene, musicChannel);
    state.recentTracks = [];
    state.lastStyle = '';
    state.puzzleTracksRemaining = 2;
    state.error = '';
    startTrack(scene, forcedMainTrack, true);
  };
  const update = scene => {
    if (!state.currentTrack || state.error) return;
    const playing = gdjs.evtTools.sound.isMusicOnChannelPlaying(scene, musicChannel);
    if (playing) { state.wasPlaying = true; return; }
    if (state.wasPlaying) { state.wasPlaying = false; startNextTrack(scene); return; }
    if (Date.now() - state.lastStartAttempt >= 1500) {
      state.lastStartAttempt = Date.now();
      gdjs.evtTools.sound.playMusicOnChannel(scene, state.currentTrack.name, musicChannel, false, 70, 1);
    }
  };
  game[controllerKey] = { state, forceMain, update };
}
const controller = game[controllerKey];
if (controller.state.mainMenuScene !== runtimeScene) {
  controller.state.mainMenuScene = runtimeScene;
  const currentTrack = controller.state.currentTrack;
  const mainTrackIsPlaying = currentTrack && currentTrack.name.startsWith('music_main_') && gdjs.evtTools.sound.isMusicOnChannelPlaying(runtimeScene, 20);
  if (!mainTrackIsPlaying) controller.forceMain(runtimeScene);
}
controller.update(runtimeScene);
};
gdjs.MainMenuCode.userFunc0x9fcaf0 = function GDJSInlineCode(runtimeScene) {
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
  const baseX = index === 0 ? 0 : 320;
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
gdjs.MainMenuCode.userFunc0xcdc210 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-046/L&L-047: Aufgeräumte Hauptnavigation, unveränderte Musiksteuerung und lokale Sprachwahl.
const menuGame = runtimeScene.getGame();
const menuI18n = menuGame.__lockLootI18n;
const menuController = menuGame.__lockLootMusicController;
if (!runtimeScene.__lockLootL046Menu) {
  runtimeScene.__lockLootL046Menu = { musicEnabled: menuGame.__lockLootMusicEnabled !== false, languagePanelOpen: false, hoverName: "" };
  menuGame.__lockLootMusicEnabled = runtimeScene.__lockLootL046Menu.musicEnabled;
}
const menuState = runtimeScene.__lockLootL046Menu;
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
  if (button) { button.setOpacity(hovered ? 255 : 238); button.setColor(hovered ? "255;239;184" : "255;255;255"); }
}
gdjs.evtTools.sound.setMusicOnChannelVolume(runtimeScene, 20, menuState.musicEnabled ? 70 : 0);
if (gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left")) {
  if (menuState.languagePanelOpen && cursorOnMenuObject(deButton)) { menuI18n.setLanguage("de"); menuState.languagePanelOpen = false; }
  else if (menuState.languagePanelOpen && cursorOnMenuObject(enButton)) { menuI18n.setLanguage("en"); menuState.languagePanelOpen = false; }
  else if (cursorOnMenuObject(languageButton)) menuState.languagePanelOpen = !menuState.languagePanelOpen;
  else if (!menuState.languagePanelOpen && cursorOnMenuObject(playButton)) gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "TrainingScene", false);
  else if (!menuState.languagePanelOpen && cursorOnMenuObject(shopButton)) gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "TreasureCalendarScene", false);
  else if (!menuState.languagePanelOpen && cursorOnMenuObject(musicButton)) {
    menuState.musicEnabled = !menuState.musicEnabled;
    menuGame.__lockLootMusicEnabled = menuState.musicEnabled;
    gdjs.evtTools.sound.setMusicOnChannelVolume(runtimeScene, 20, menuState.musicEnabled ? 70 : 0);
    if (menuState.musicEnabled && menuController && menuController.state && !menuController.state.currentTrack) menuController.forceMain(runtimeScene);
  } else if (menuState.languagePanelOpen) menuState.languagePanelOpen = false;
}
};
gdjs.MainMenuCode.eventsList0 = function(runtimeScene) {

{


gdjs.MainMenuCode.userFunc0xcae690(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xce8058(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0x9fcaf0(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xcdc210(runtimeScene);

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


return;

}

gdjs['MainMenuCode'] = gdjs.MainMenuCode;
