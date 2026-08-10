gdjs.ShopSzeneCode = {};
gdjs.ShopSzeneCode.localVariables = [];
gdjs.ShopSzeneCode.idToCallbackMap = new Map();
gdjs.ShopSzeneCode.GDShopBackgroundObjects1= [];
gdjs.ShopSzeneCode.GDShopBackgroundObjects2= [];
gdjs.ShopSzeneCode.GDShopWalletBarObjects1= [];
gdjs.ShopSzeneCode.GDShopWalletBarObjects2= [];
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
gdjs.ShopSzeneCode.GDShopParrotObjects1= [];
gdjs.ShopSzeneCode.GDShopParrotObjects2= [];
gdjs.ShopSzeneCode.GDShopBackButtonObjects1= [];
gdjs.ShopSzeneCode.GDShopBackButtonObjects2= [];
gdjs.ShopSzeneCode.GDShopTitleTextObjects1= [];
gdjs.ShopSzeneCode.GDShopTitleTextObjects2= [];
gdjs.ShopSzeneCode.GDShopWalletLabelTextObjects1= [];
gdjs.ShopSzeneCode.GDShopWalletLabelTextObjects2= [];
gdjs.ShopSzeneCode.GDShopWalletCookiesTextObjects1= [];
gdjs.ShopSzeneCode.GDShopWalletCookiesTextObjects2= [];
gdjs.ShopSzeneCode.GDShopWalletLockpicksTextObjects1= [];
gdjs.ShopSzeneCode.GDShopWalletLockpicksTextObjects2= [];
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
gdjs.ShopSzeneCode.GDShopDisclaimerTextObjects1= [];
gdjs.ShopSzeneCode.GDShopDisclaimerTextObjects2= [];


gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopTabCookiesObjects1Objects = Hashtable.newFrom({"ShopTabCookies": gdjs.ShopSzeneCode.GDShopTabCookiesObjects1});
gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopTabLockpicksObjects1Objects = Hashtable.newFrom({"ShopTabLockpicks": gdjs.ShopSzeneCode.GDShopTabLockpicksObjects1});
gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopCardFrameObjects1Objects = Hashtable.newFrom({"ShopCardFrame": gdjs.ShopSzeneCode.GDShopCardFrameObjects1});
gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopPremiumPanelObjects1Objects = Hashtable.newFrom({"ShopPremiumPanel": gdjs.ShopSzeneCode.GDShopPremiumPanelObjects1});
gdjs.ShopSzeneCode.userFunc0x9d72d8 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-044: Zentralen Shopkatalog laden, Wallet anzeigen und Käufe sicher deaktiviert lassen.
const shopVariables = runtimeScene.getVariables();
const shopGame = runtimeScene.getGame();
const shopFallbackCatalog = Object.freeze({"shopCatalogVersion":1,"currency":"EUR","priceMode":"PLANNED_DISPLAY_ONLY","products":[{"internalProductKey":"cookies_49","category":"cookies","resourceType":"cookies","quantity":49,"plannedPriceMinorUnits":99,"bonusLabel":null,"sortOrder":10,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"cookies_119","category":"cookies","resourceType":"cookies","quantity":119,"plannedPriceMinorUnits":199,"bonusLabel":"+20 %","sortOrder":20,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"cookies_349","category":"cookies","resourceType":"cookies","quantity":349,"plannedPriceMinorUnits":499,"bonusLabel":"+40 %","sortOrder":30,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"cookies_999","category":"cookies","resourceType":"cookies","quantity":999,"plannedPriceMinorUnits":999,"bonusLabel":"+100 %","sortOrder":40,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"lockpicks_79","category":"lockpicks","resourceType":"lockpicks","quantity":79,"plannedPriceMinorUnits":99,"bonusLabel":null,"sortOrder":10,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"lockpicks_191","category":"lockpicks","resourceType":"lockpicks","quantity":191,"plannedPriceMinorUnits":199,"bonusLabel":"+20 %","sortOrder":20,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"lockpicks_559","category":"lockpicks","resourceType":"lockpicks","quantity":559,"plannedPriceMinorUnits":499,"bonusLabel":"+40 %","sortOrder":30,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"lockpicks_1599","category":"lockpicks","resourceType":"lockpicks","quantity":1599,"plannedPriceMinorUnits":999,"bonusLabel":"+100 %","sortOrder":40,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"premium_pass_30_logins","category":"premium","resourceType":"premium_pass","quantity":1,"plannedPriceMinorUnits":499,"bonusLabel":null,"sortOrder":10,"enabled":true,"googlePlayProductId":null}]});
const shopSessionKey = "__lockLootShopSession";
if (!shopGame[shopSessionKey]) shopGame[shopSessionKey] = {idToken: "", uid: ""};
const shopSession = shopGame[shopSessionKey];
const shopObjects = (name) => runtimeScene.getObjects(name).slice().sort((left, right) => left.getY() - right.getY() || left.getX() - right.getX());
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
const shopFormatPrice = (minorUnits) => (minorUnits / 100).toFixed(2).replace(".", ",") + " €";
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
  for (let index = 0; index < 4; index += 1) {
    const product = products[index];
    const visible = Boolean(product);
    for (const object of [cards[index], icons[index], titles[index], quantities[index], prices[index], bonuses[index]]) shopSetOpacity(object, visible ? 255 : 0);
    if (!product) continue;
    if (icons[index] && typeof icons[index].setAnimation === "function") icons[index].setAnimation(category === "cookies" ? 0 : 1);
    titles[index].setString(category === "cookies" ? "KEKSPAKET" : "DIETRICHPACK");
    shopFitText(quantities[index], String(product.quantity) + (category === "cookies" ? " KEKSE" : " DIETRICHE"), [[14, 25], [18, 19], [24, 15]]);
    shopFitText(prices[index], shopFormatPrice(product.plannedPriceMinorUnits), [[11, 19], [16, 15], [24, 13]]);
    shopFitText(bonuses[index], product.bonusLabel ? product.bonusLabel + " MENGENBONUS" : "BASISANGEBOT", [[23, 15], [32, 12], [44, 10]], 264);
    shopSetColor(bonuses[index], product.bonusLabel ? "146;57;18" : "91;74;51");
  }
  const cookieTabs = shopObjects("ShopTabCookies");
  const lockpickTabs = shopObjects("ShopTabLockpicks");
  shopSetColor(cookieTabs[0], category === "cookies" ? "255;211;89" : "150;124;96");
  shopSetColor(lockpickTabs[0], category === "lockpicks" ? "205;232;242" : "150;124;96");
  shopVariables.get("ShopCategory").setString(category);
  shopVariables.get("ShopCatalogVersion").setNumber(state.catalog.shopCatalogVersion);
  shopVariables.get("ShopBackendAvailable").setBoolean(state.backendAvailable);
  shopVariables.get("ShopPremiumEntitled").setBoolean(state.premiumEntitled);
  const walletCookieText = state.wallet ? "KEKSE " + state.wallet.cookies : "KEKSE NICHT VERFÜGBAR";
  const walletLockpickText = state.wallet ? "DIETRICHE " + state.wallet.lockpicks : "DIETRICHE NICHT VERFÜGBAR";
  shopFitText(shopObjects("ShopWalletCookiesText")[0], walletCookieText, [[18, 18], [24, 15], [32, 12]]);
  shopFitText(shopObjects("ShopWalletLockpicksText")[0], walletLockpickText, [[18, 18], [24, 15], [32, 12]]);
  const premiumPanels = shopObjects("ShopPremiumPanel"); const premiumBadges = shopObjects("ShopPremiumBadge"); const premiumStatuses = shopObjects("ShopPremiumStatusText");
  shopSetOpacity(premiumBadges[0], state.premiumEntitled ? 255 : 105);
  shopSetColor(premiumPanels[0], state.premiumEntitled ? "255;255;255" : "170;160;170");
  shopSetColor(premiumStatuses[0], state.premiumEntitled ? "255;225;116" : "200;184;210");
  shopFitText(premiumStatuses[0], state.premiumEntitled ? "AKTIV · FÜR DIESEN KALENDERZYKLUS" : "NOCH NICHT FREIGESCHALTET", [[32, 14], [42, 12], [54, 10]], 500);
  shopFitText(shopObjects("ShopStatusText")[0], state.statusMessage, [[54, 15], [74, 12], [96, 10]], 420);
};
const shopSetStatus = (state, message) => { state.statusMessage = message; shopVariables.get("ShopStatusMessage").setString(message); shopSetText("ShopStatusText", message); };

if (runtimeScene.getTimeManager().isFirstFrame()) {
  const endpoints = Object.freeze({
    auth: "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=local-emulator-only",
    prepare: "http://127.0.0.1:5001/demo-lock-loot-local/us-central1/prepareGDevelopTest",
    bootstrap: "http://127.0.0.1:5001/demo-lock-loot-local/us-central1/bootstrapPlayerState"
  });
  const assertLocal = (endpoint) => { const parsed = new URL(endpoint); if (parsed.protocol !== "http:" || parsed.hostname !== "127.0.0.1" || !["5001", "9099"].includes(parsed.port)) throw new Error("Lokale Demo-Grenze verletzt."); };
  const requestJson = async (endpoint, body, idToken = "") => {
    assertLocal(endpoint);
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const headers = {"Content-Type": "application/json"}; if (idToken) headers.Authorization = "Bearer " + idToken;
      const response = await fetch(endpoint, {method: "POST", headers, body: JSON.stringify(body), signal: controller.signal});
      const payload = JSON.parse(await response.text());
      if (!response.ok || payload.error) { const status = payload?.error?.status || "HTTP_" + response.status; throw Object.assign(new Error("Lokale Anfrage abgelehnt."), {status}); }
      return payload;
    } finally { clearTimeout(timeout); }
  };
  const callCallable = async (endpoint, data, idToken) => { const payload = await requestJson(endpoint, {data}, idToken); return payload.result !== undefined ? payload.result : payload.data; };
  const state = {catalog: shopValidateCatalog(shopFallbackCatalog), category: "cookies", wallet: null, premiumEntitled: false, backendAvailable: false, statusMessage: "KATALOG V1 · PREISE NUR GEPLANT"};
  runtimeScene.__lockLootShopScene = state;
  shopRender(state);
  const authenticate = async () => {
    const auth = await requestJson(endpoints.auth, {returnSecureToken: true});
    if (!auth?.idToken || !auth?.localId) throw Object.assign(new Error("Anonyme Auth-Antwort ungültig."), {status: "AUTH_FAILED"});
    shopSession.idToken = auth.idToken; shopSession.uid = auth.localId;
  };
  const load = async (retry) => {
    if (!shopSession.idToken) await authenticate();
    try {
      await callCallable(endpoints.prepare, {integration: "L&L-044"}, shopSession.idToken);
      const snapshot = await callCallable(endpoints.bootstrap, {integration: "L&L-044"}, shopSession.idToken);
      if (!snapshot || snapshot.uid !== shopSession.uid) throw Object.assign(new Error("Bootstrap-UID stimmt nicht."), {status: "INVALID_RESPONSE"});
      state.wallet = shopValidateWallet(snapshot);
      state.catalog = shopValidateCatalog(snapshot.shopCatalog);
      state.premiumEntitled = Boolean(snapshot.calendar && snapshot.calendar.premiumEntitled === true);
      state.backendAvailable = true;
      shopVariables.get("ShopWalletCookies").setNumber(state.wallet.cookies);
      shopVariables.get("ShopWalletLockpicks").setNumber(state.wallet.lockpicks);
      shopSetStatus(state, "SERVERSTAND GELADEN · KÄUFE WERDEN SPÄTER AKTIVIERT.");
      shopRender(state);
    } catch (error) {
      if (retry && error?.status === "UNAUTHENTICATED") { shopSession.idToken = ""; shopSession.uid = ""; return load(false); }
      throw error;
    }
  };
  void load(true).catch(() => {
    if (runtimeScene.__lockLootShopScene !== state) return;
    state.backendAvailable = false; state.wallet = null; state.premiumEntitled = false;
    shopSetStatus(state, "BACKEND NICHT ERREICHBAR · KATALOG WEITER VERFÜGBAR");
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
    shopSetStatus(shopState, shopState.category === "cookies" ? "KEKSANGEBOTE · KÄUFE NOCH DEAKTIVIERT" : "DIETRICHANGEBOTE · KÄUFE NOCH DEAKTIVIERT");
    shopRender(shopState);
  } else if (shopAction === "product" || shopAction === "premium") {
    // L&L-044: Kein Kauf, keine Walletgutschrift und keine Premiumaktivierung.
    shopSetStatus(shopState, "KÄUFE WERDEN SPÄTER AKTIVIERT.");
    shopRender(shopState);
  }
}
};
gdjs.ShopSzeneCode.mapOfGDgdjs_9546ShopSzeneCode_9546GDShopBackButtonObjects1Objects = Hashtable.newFrom({"ShopBackButton": gdjs.ShopSzeneCode.GDShopBackButtonObjects1});
gdjs.ShopSzeneCode.eventsList0 = function(runtimeScene) {

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


gdjs.ShopSzeneCode.userFunc0x9d72d8(runtimeScene);

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


};

gdjs.ShopSzeneCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.ShopSzeneCode.GDShopBackgroundObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopBackgroundObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopWalletBarObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopWalletBarObjects2.length = 0;
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
gdjs.ShopSzeneCode.GDShopParrotObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopParrotObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopBackButtonObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopBackButtonObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopTitleTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopTitleTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopWalletLabelTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopWalletLabelTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopWalletCookiesTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopWalletCookiesTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopWalletLockpicksTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopWalletLockpicksTextObjects2.length = 0;
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
gdjs.ShopSzeneCode.GDShopDisclaimerTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopDisclaimerTextObjects2.length = 0;

gdjs.ShopSzeneCode.eventsList0(runtimeScene);
gdjs.ShopSzeneCode.GDShopBackgroundObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopBackgroundObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopWalletBarObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopWalletBarObjects2.length = 0;
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
gdjs.ShopSzeneCode.GDShopParrotObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopParrotObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopBackButtonObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopBackButtonObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopTitleTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopTitleTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopWalletLabelTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopWalletLabelTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopWalletCookiesTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopWalletCookiesTextObjects2.length = 0;
gdjs.ShopSzeneCode.GDShopWalletLockpicksTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopWalletLockpicksTextObjects2.length = 0;
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
gdjs.ShopSzeneCode.GDShopDisclaimerTextObjects1.length = 0;
gdjs.ShopSzeneCode.GDShopDisclaimerTextObjects2.length = 0;


return;

}

gdjs['ShopSzeneCode'] = gdjs.ShopSzeneCode;
