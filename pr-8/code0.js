gdjs.MainMenuCode = {};
gdjs.MainMenuCode.localVariables = [];
gdjs.MainMenuCode.idToCallbackMap = new Map();
gdjs.MainMenuCode.GDCalendarMenuButtonObjects1= [];
gdjs.MainMenuCode.GDCalendarMenuButtonObjects2= [];
gdjs.MainMenuCode.GDCalendarMenuButtonTextObjects1= [];
gdjs.MainMenuCode.GDCalendarMenuButtonTextObjects2= [];
gdjs.MainMenuCode.GDbtnTrainingObjects1= [];
gdjs.MainMenuCode.GDbtnTrainingObjects2= [];
gdjs.MainMenuCode.GDbtnOnlineObjects1= [];
gdjs.MainMenuCode.GDbtnOnlineObjects2= [];
gdjs.MainMenuCode.GDbtnShopObjects1= [];
gdjs.MainMenuCode.GDbtnShopObjects2= [];
gdjs.MainMenuCode.GDbtnExitObjects1= [];
gdjs.MainMenuCode.GDbtnExitObjects2= [];
gdjs.MainMenuCode.GDbtnOptionsObjects1= [];
gdjs.MainMenuCode.GDbtnOptionsObjects2= [];
gdjs.MainMenuCode.GDMainMenuTitleObjects1= [];
gdjs.MainMenuCode.GDMainMenuTitleObjects2= [];
gdjs.MainMenuCode.GDMainMenuSkyObjects1= [];
gdjs.MainMenuCode.GDMainMenuSkyObjects2= [];
gdjs.MainMenuCode.GDMainMenuSeaObjects1= [];
gdjs.MainMenuCode.GDMainMenuSeaObjects2= [];
gdjs.MainMenuCode.GDMainMenuCloudObjects1= [];
gdjs.MainMenuCode.GDMainMenuCloudObjects2= [];
gdjs.MainMenuCode.GDMainMenuFarIslandsObjects1= [];
gdjs.MainMenuCode.GDMainMenuFarIslandsObjects2= [];
gdjs.MainMenuCode.GDMainMenuPalmObjects1= [];
gdjs.MainMenuCode.GDMainMenuPalmObjects2= [];
gdjs.MainMenuCode.GDMainMenuVegetationObjects1= [];
gdjs.MainMenuCode.GDMainMenuVegetationObjects2= [];
gdjs.MainMenuCode.GDMainMenuBeachObjects1= [];
gdjs.MainMenuCode.GDMainMenuBeachObjects2= [];
gdjs.MainMenuCode.GDMainMenuWaveObjects1= [];
gdjs.MainMenuCode.GDMainMenuWaveObjects2= [];
gdjs.MainMenuCode.GDMainMenuChestLidObjects1= [];
gdjs.MainMenuCode.GDMainMenuChestLidObjects2= [];
gdjs.MainMenuCode.GDMainMenuChestBaseObjects1= [];
gdjs.MainMenuCode.GDMainMenuChestBaseObjects2= [];
gdjs.MainMenuCode.GDMainMenuTreasureObjects1= [];
gdjs.MainMenuCode.GDMainMenuTreasureObjects2= [];
gdjs.MainMenuCode.GDMainMenuParrotObjects1= [];
gdjs.MainMenuCode.GDMainMenuParrotObjects2= [];
gdjs.MainMenuCode.GDMainMenuPirateObjects1= [];
gdjs.MainMenuCode.GDMainMenuPirateObjects2= [];
gdjs.MainMenuCode.GDMainMenuSparkleObjects1= [];
gdjs.MainMenuCode.GDMainMenuSparkleObjects2= [];
gdjs.MainMenuCode.GDMainMenuSandMoundObjects1= [];
gdjs.MainMenuCode.GDMainMenuSandMoundObjects2= [];
gdjs.MainMenuCode.GDMainMenuBackSandPileObjects1= [];
gdjs.MainMenuCode.GDMainMenuBackSandPileObjects2= [];
gdjs.MainMenuCode.GDMainMenuForegroundObjects1= [];
gdjs.MainMenuCode.GDMainMenuForegroundObjects2= [];
gdjs.MainMenuCode.GDMainMenuButtonObjects1= [];
gdjs.MainMenuCode.GDMainMenuButtonObjects2= [];
gdjs.MainMenuCode.GDMainMenuLogoObjects1= [];
gdjs.MainMenuCode.GDMainMenuLogoObjects2= [];
gdjs.MainMenuCode.GDBackgroundObjects1= [];
gdjs.MainMenuCode.GDBackgroundObjects2= [];
gdjs.MainMenuCode.GDMainMenuCoveObjects1= [];
gdjs.MainMenuCode.GDMainMenuCoveObjects2= [];
gdjs.MainMenuCode.GDMainMenuPirateShipObjects1= [];
gdjs.MainMenuCode.GDMainMenuPirateShipObjects2= [];
gdjs.MainMenuCode.GDMainMenuRowboatObjects1= [];
gdjs.MainMenuCode.GDMainMenuRowboatObjects2= [];
gdjs.MainMenuCode.GDMainMenuDetailPlantObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailPlantObjects2= [];
gdjs.MainMenuCode.GDMainMenuDetailDriftwoodObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailDriftwoodObjects2= [];
gdjs.MainMenuCode.GDMainMenuDetailShellPinkObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailShellPinkObjects2= [];
gdjs.MainMenuCode.GDMainMenuDetailShellConchObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailShellConchObjects2= [];
gdjs.MainMenuCode.GDMainMenuDetailShellBrokenObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailShellBrokenObjects2= [];
gdjs.MainMenuCode.GDMainMenuDetailStarfishObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailStarfishObjects2= [];
gdjs.MainMenuCode.GDMainMenuDetailStoneGrayObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailStoneGrayObjects2= [];
gdjs.MainMenuCode.GDMainMenuDetailStoneGoldObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailStoneGoldObjects2= [];
gdjs.MainMenuCode.GDMainMenuDetailStoneDarkObjects1= [];
gdjs.MainMenuCode.GDMainMenuDetailStoneDarkObjects2= [];
gdjs.MainMenuCode.GDMainMenuCodeRailObjects1= [];
gdjs.MainMenuCode.GDMainMenuCodeRailObjects2= [];
gdjs.MainMenuCode.GDMainMenuCodeTextObjects1= [];
gdjs.MainMenuCode.GDMainMenuCodeTextObjects2= [];


gdjs.MainMenuCode.userFunc0xbb5f00 = function GDJSInlineCode(runtimeScene) {
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
gdjs.MainMenuCode.userFunc0xbbe258 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-024: Rein visuelle Steuerung des modularen Hauptmenüs.
// Bestehende Navigation, Online-Status und alle anderen Szenen bleiben unverändert.
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
  pirate.setPosition(-110, 245);
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
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDbtnTrainingObjects1Objects = Hashtable.newFrom({"btnTraining": gdjs.MainMenuCode.GDbtnTrainingObjects1});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDbtnOnlineObjects1Objects = Hashtable.newFrom({"btnOnline": gdjs.MainMenuCode.GDbtnOnlineObjects1});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDbtnShopObjects1Objects = Hashtable.newFrom({"btnShop": gdjs.MainMenuCode.GDbtnShopObjects1});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDbtnExitObjects1Objects = Hashtable.newFrom({"btnExit": gdjs.MainMenuCode.GDbtnExitObjects1});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDCalendarMenuButtonObjects1Objects = Hashtable.newFrom({"CalendarMenuButton": gdjs.MainMenuCode.GDCalendarMenuButtonObjects1});
gdjs.MainMenuCode.eventsList0 = function(runtimeScene) {

{


gdjs.MainMenuCode.userFunc0xbb5f00(runtimeScene);

}


{


gdjs.MainMenuCode.userFunc0xbbe258(runtimeScene);

}


{

gdjs.copyArray(runtimeScene.getObjects("btnTraining"), gdjs.MainMenuCode.GDbtnTrainingObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDbtnTrainingObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonPressed(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "TrainingScene", true);
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("btnOnline"), gdjs.MainMenuCode.GDbtnOnlineObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDbtnOnlineObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonPressed(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "OnlineSzene", true);
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("btnShop"), gdjs.MainMenuCode.GDbtnShopObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDbtnShopObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonPressed(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "ShopSzene", true);
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("btnExit"), gdjs.MainMenuCode.GDbtnExitObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDbtnExitObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonPressed(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.stopGame(runtimeScene);
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("CalendarMenuButton"), gdjs.MainMenuCode.GDCalendarMenuButtonObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDCalendarMenuButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "TreasureCalendarScene", true);
}
}

}


};

gdjs.MainMenuCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.MainMenuCode.GDCalendarMenuButtonObjects1.length = 0;
gdjs.MainMenuCode.GDCalendarMenuButtonObjects2.length = 0;
gdjs.MainMenuCode.GDCalendarMenuButtonTextObjects1.length = 0;
gdjs.MainMenuCode.GDCalendarMenuButtonTextObjects2.length = 0;
gdjs.MainMenuCode.GDbtnTrainingObjects1.length = 0;
gdjs.MainMenuCode.GDbtnTrainingObjects2.length = 0;
gdjs.MainMenuCode.GDbtnOnlineObjects1.length = 0;
gdjs.MainMenuCode.GDbtnOnlineObjects2.length = 0;
gdjs.MainMenuCode.GDbtnShopObjects1.length = 0;
gdjs.MainMenuCode.GDbtnShopObjects2.length = 0;
gdjs.MainMenuCode.GDbtnExitObjects1.length = 0;
gdjs.MainMenuCode.GDbtnExitObjects2.length = 0;
gdjs.MainMenuCode.GDbtnOptionsObjects1.length = 0;
gdjs.MainMenuCode.GDbtnOptionsObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuTitleObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuTitleObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuSkyObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSkyObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuSeaObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSeaObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuCloudObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuCloudObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuFarIslandsObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuFarIslandsObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuPalmObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPalmObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuVegetationObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuVegetationObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuBeachObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuBeachObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuWaveObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuWaveObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuChestLidObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuChestLidObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuChestBaseObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuChestBaseObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuTreasureObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuTreasureObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuParrotObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuParrotObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuPirateObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPirateObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuSparkleObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSparkleObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuSandMoundObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSandMoundObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuBackSandPileObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuBackSandPileObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuForegroundObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuForegroundObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuButtonObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuLogoObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLogoObjects2.length = 0;
gdjs.MainMenuCode.GDBackgroundObjects1.length = 0;
gdjs.MainMenuCode.GDBackgroundObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuCoveObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuCoveObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuPirateShipObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPirateShipObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuRowboatObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuRowboatObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailPlantObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailPlantObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailDriftwoodObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailDriftwoodObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellPinkObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellPinkObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellConchObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellConchObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellBrokenObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellBrokenObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStarfishObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStarfishObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneGrayObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneGrayObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneGoldObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneGoldObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneDarkObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneDarkObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuCodeRailObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuCodeRailObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuCodeTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuCodeTextObjects2.length = 0;

gdjs.MainMenuCode.eventsList0(runtimeScene);
gdjs.MainMenuCode.GDCalendarMenuButtonObjects1.length = 0;
gdjs.MainMenuCode.GDCalendarMenuButtonObjects2.length = 0;
gdjs.MainMenuCode.GDCalendarMenuButtonTextObjects1.length = 0;
gdjs.MainMenuCode.GDCalendarMenuButtonTextObjects2.length = 0;
gdjs.MainMenuCode.GDbtnTrainingObjects1.length = 0;
gdjs.MainMenuCode.GDbtnTrainingObjects2.length = 0;
gdjs.MainMenuCode.GDbtnOnlineObjects1.length = 0;
gdjs.MainMenuCode.GDbtnOnlineObjects2.length = 0;
gdjs.MainMenuCode.GDbtnShopObjects1.length = 0;
gdjs.MainMenuCode.GDbtnShopObjects2.length = 0;
gdjs.MainMenuCode.GDbtnExitObjects1.length = 0;
gdjs.MainMenuCode.GDbtnExitObjects2.length = 0;
gdjs.MainMenuCode.GDbtnOptionsObjects1.length = 0;
gdjs.MainMenuCode.GDbtnOptionsObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuTitleObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuTitleObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuSkyObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSkyObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuSeaObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSeaObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuCloudObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuCloudObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuFarIslandsObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuFarIslandsObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuPalmObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPalmObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuVegetationObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuVegetationObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuBeachObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuBeachObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuWaveObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuWaveObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuChestLidObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuChestLidObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuChestBaseObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuChestBaseObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuTreasureObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuTreasureObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuParrotObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuParrotObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuPirateObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPirateObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuSparkleObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSparkleObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuSandMoundObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuSandMoundObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuBackSandPileObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuBackSandPileObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuForegroundObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuForegroundObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuButtonObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuButtonObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuLogoObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuLogoObjects2.length = 0;
gdjs.MainMenuCode.GDBackgroundObjects1.length = 0;
gdjs.MainMenuCode.GDBackgroundObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuCoveObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuCoveObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuPirateShipObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuPirateShipObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuRowboatObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuRowboatObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailPlantObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailPlantObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailDriftwoodObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailDriftwoodObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellPinkObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellPinkObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellConchObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellConchObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellBrokenObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailShellBrokenObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStarfishObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStarfishObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneGrayObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneGrayObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneGoldObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneGoldObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneDarkObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuDetailStoneDarkObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuCodeRailObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuCodeRailObjects2.length = 0;
gdjs.MainMenuCode.GDMainMenuCodeTextObjects1.length = 0;
gdjs.MainMenuCode.GDMainMenuCodeTextObjects2.length = 0;


return;

}

gdjs['MainMenuCode'] = gdjs.MainMenuCode;
