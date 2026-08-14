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


gdjs.ShopSzeneCode.userFunc0xac9600 = function GDJSInlineCode(runtimeScene) {
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
gdjs.ShopSzeneCode.userFunc0xa0b640 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-044: Zentralen Shopkatalog laden, Wallet anzeigen und Käufe sicher deaktiviert lassen.
const shopVariables = runtimeScene.getVariables();
const shopI18n = runtimeScene.getGame().__lockLootI18n;
const shopT = (key, parameters = {}) => shopI18n.t(key, parameters);
const shopGame = runtimeScene.getGame();
const shopFallbackCatalog = Object.freeze({"shopCatalogVersion":1,"currency":"EUR","priceMode":"PLANNED_DISPLAY_ONLY","products":[{"internalProductKey":"cookies_49","category":"cookies","resourceType":"cookies","quantity":49,"plannedPriceMinorUnits":99,"bonusLabel":null,"sortOrder":10,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"cookies_119","category":"cookies","resourceType":"cookies","quantity":119,"plannedPriceMinorUnits":199,"bonusLabel":"+20 %","sortOrder":20,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"cookies_349","category":"cookies","resourceType":"cookies","quantity":349,"plannedPriceMinorUnits":499,"bonusLabel":"+40 %","sortOrder":30,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"cookies_999","category":"cookies","resourceType":"cookies","quantity":999,"plannedPriceMinorUnits":999,"bonusLabel":"+100 %","sortOrder":40,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"lockpicks_79","category":"lockpicks","resourceType":"lockpicks","quantity":79,"plannedPriceMinorUnits":99,"bonusLabel":null,"sortOrder":10,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"lockpicks_191","category":"lockpicks","resourceType":"lockpicks","quantity":191,"plannedPriceMinorUnits":199,"bonusLabel":"+20 %","sortOrder":20,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"lockpicks_559","category":"lockpicks","resourceType":"lockpicks","quantity":559,"plannedPriceMinorUnits":499,"bonusLabel":"+40 %","sortOrder":30,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"lockpicks_1599","category":"lockpicks","resourceType":"lockpicks","quantity":1599,"plannedPriceMinorUnits":999,"bonusLabel":"+100 %","sortOrder":40,"enabled":true,"googlePlayProductId":null},{"internalProductKey":"premium_pass_30_logins","category":"premium","resourceType":"premium_pass","quantity":1,"plannedPriceMinorUnits":499,"bonusLabel":null,"sortOrder":10,"enabled":true,"googlePlayProductId":null}]});
const shopSessionKey = "__lockLootShopSession";
const shopAuthStorageKey = "__lockLootL040LocalAuth";
const shopReadSession = () => {
  try {
    const raw = globalThis.localStorage ? globalThis.localStorage.getItem(shopAuthStorageKey) : "";
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed.idToken === "string" && typeof parsed.uid === "string" ? parsed : null;
  } catch (error) { return null; }
};
const shopSaveSession = (session) => {
  try { if (globalThis.localStorage) globalThis.localStorage.setItem(shopAuthStorageKey, JSON.stringify(session)); } catch (error) {}
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
  const state = {catalog: shopValidateCatalog(shopFallbackCatalog), category: "cookies", wallet: null, premiumEntitled: false, backendAvailable: false, statusMessage: shopT("shop.catalog_planned")};
  runtimeScene.__lockLootShopScene = state;
  shopRender(state);
  const authenticate = async () => {
    const auth = await requestJson(endpoints.auth, {returnSecureToken: true});
    if (!auth?.idToken || !auth?.localId) throw Object.assign(new Error("Anonyme Auth-Antwort ungültig."), {status: "AUTH_FAILED"});
    shopSession.idToken = auth.idToken; shopSession.uid = auth.localId; shopSession.refreshToken = auth.refreshToken || "";
    shopSaveSession(shopSession);
  };
  const load = async (retry) => {
    if (!shopSession.idToken) await authenticate();
    try {
      await callCallable(endpoints.prepare, {integration: "L&L-044"}, shopSession.idToken);
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
gdjs.ShopSzeneCode.userFunc0xc11440 = function GDJSInlineCode(runtimeScene) {
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
gdjs.ShopSzeneCode.userFunc0xafbca8 = function GDJSInlineCode(runtimeScene) {
"use strict";
// L&L-048: Zentrales, rein lesendes Ressourcen-HUD aus bestätigten Serverantworten.
const resourceHudGame = runtimeScene.getGame();
if (!resourceHudGame.__lockLootResourceHud) {
  const resourceHudConfig = JSON.parse(resourceHudGame.getVariables().get("resourceHudConfigJson").getAsString());
  const resourceHudStorageKey = "lockloot.wallet-confirmed.v1";
  const resourceHudAuthStorageKey = "__lockLootL040LocalAuth";
  const normalizeWallet = (wallet) => {
    if (!wallet || !Number.isSafeInteger(wallet.cookies) || wallet.cookies < 0 || !Number.isSafeInteger(wallet.lockpicks) || wallet.lockpicks < 0 || !Number.isSafeInteger(wallet.revision) || wallet.revision < 0) return null;
    return {cookies: wallet.cookies, lockpicks: wallet.lockpicks, revision: wallet.revision};
  };
  const readAuthUid = () => {
    try {
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


gdjs.ShopSzeneCode.userFunc0xac9600(runtimeScene);

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


gdjs.ShopSzeneCode.userFunc0xa0b640(runtimeScene);

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


gdjs.ShopSzeneCode.userFunc0xc11440(runtimeScene);

}


{


gdjs.ShopSzeneCode.userFunc0xafbca8(runtimeScene);

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
