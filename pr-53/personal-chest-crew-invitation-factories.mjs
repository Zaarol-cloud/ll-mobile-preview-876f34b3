// Exact source bodies; no token or line-ending transformations.
import {browserCrypto} from './personal-chest-browser-dependencies.mjs';
const factories={
"prototypes/firebase-lock-attempt/functions/src/code-length-contract.cjs":function(module,exports,require){
"use strict";

const LEGACY_CODE_LENGTH = 11;
const VARIABLE_CODE_LENGTHS = Object.freeze([8, 10, 12]);
const SUPPORTED_CODE_LENGTHS = Object.freeze([8, 10, 11, 12]);

function requiredCodeLength(generatorVersion, declaredCodeLength) {
  if (generatorVersion === 1 || generatorVersion === 2) {
    if (declaredCodeLength !== undefined &&
        declaredCodeLength !== LEGACY_CODE_LENGTH) {
      throw new TypeError("Archivkiste und Codelänge widersprechen sich.");
    }
    return LEGACY_CODE_LENGTH;
  }
  if ((generatorVersion === 3 || generatorVersion === 4) &&
      VARIABLE_CODE_LENGTHS.includes(declaredCodeLength)) {
    return declaredCodeLength;
  }
  throw new TypeError("Generatorversion oder Codelänge ist ungültig.");
}

function validCode(code, codeLength) {
  return SUPPORTED_CODE_LENGTHS.includes(codeLength) &&
    typeof code === "string" && code.length === codeLength &&
    /^\d+$/.test(code);
}

function requireCode(code, generatorVersion, declaredCodeLength) {
  const codeLength = requiredCodeLength(generatorVersion, declaredCodeLength);
  if (!validCode(code, codeLength)) {
    throw new TypeError("Code und Kistenlänge widersprechen sich.");
  }
  return codeLength;
}

module.exports = Object.freeze({LEGACY_CODE_LENGTH, VARIABLE_CODE_LENGTHS,
  SUPPORTED_CODE_LENGTHS, requiredCodeLength, validCode, requireCode});

},
"prototypes/firebase-lock-attempt/functions/src/hints/package-count-policy.cjs":function(module,exports,require){
"use strict";

const {createHash} = require("node:crypto");

// New assignments use this policy. Stored generator versions 1-3 continue to
// use rank-tier-policy.cjs and exactly five packages.
const POLICY_VERSION = 2;
const GENERATOR_VERSION = 4;
const MIN_PACKAGES = 5;
const MAX_PACKAGES = 10;
const HINTS_PER_PACKAGE = 2;
const PACKAGE_REWARD_FACTORS = Object.freeze({5: 6, 6: 5, 7: 4,
  8: 3, 9: 2, 10: 1});
const defineProfile = (minimumAtTen, caps, weights, balanceBeginner = false) =>
  Object.freeze({minimumAtTen: Object.freeze(minimumAtTen),
    caps: Object.freeze(caps), weights: Object.freeze(weights),
    balanceBeginner});
const PROFILES = Object.freeze({
  VERY_EASY: defineProfile([0, 0, 0, 0, 0],
    [null, null, 2, 0, 0], [4, 4, 2, 0, 0],
    true),
  EASY: defineProfile([0, 0, 0, 0, 0],
    [null, null, 4, 0, 0], [4, 4, 3, 0, 0], true),
  NORMAL: defineProfile([1, 2, 2, 1, 0],
    [null, null, null, 2, 0], [1, 3, 3, 2, 0]),
  HARD: defineProfile([1, 1, 2, 2, 0],
    [null, null, null, 4, 1], [1, 2, 3, 3, 1]),
  VERY_HARD: defineProfile([0, 0, 0, 0, 0],
    [2, null, null, null, 1], [1, 3, 3, 3, 1]),
});

function requireConfiguration(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Neue Paketkonfiguration fehlt.");
  }
  const {packageCount, profileId, codeLength} = input;
  if (!Number.isSafeInteger(packageCount) || packageCount < MIN_PACKAGES ||
      packageCount > MAX_PACKAGES || typeof profileId !== "string" ||
      !Object.hasOwn(PROFILES, profileId) ||
      ![8, 10, 12].includes(codeLength)) {
    throw new TypeError("Neue Paket-, Profil- oder Codelängenkonfiguration ist ungültig.");
  }
  return Object.freeze({generatorVersion: GENERATOR_VERSION,
    policyVersion: POLICY_VERSION, packageCount, profileId, codeLength,
    hintCount: packageCount * HINTS_PER_PACKAGE,
    packageRewardFactor: PACKAGE_REWARD_FACTORS[packageCount]});
}

function tierBounds(configuration, tier5Gate) {
  const {hintCount, profileId} = requireConfiguration(configuration);
  if (typeof tier5Gate !== "boolean") throw new TypeError("T5-Gate ist ungültig.");
  const profile = PROFILES[profileId];
  // The two documented minimum mixes are per ten hints. Rounding upwards
  // prevents a larger set from diluting a promised minimum. This extension is
  // an implementation hypothesis to measure, not a new player decision.
  const min = profile.minimumAtTen.map(value =>
    value === 0 ? 0 : Math.ceil(value * hintCount / 10));
  const max = profile.caps.map((cap, index) =>
    index === 4 && !tier5Gate ? 0 : cap === null ? hintCount : cap);
  if (min.some((value, index) => value > max[index]) ||
      min.reduce((sum, value) => sum + value, 0) > hintCount) {
    throw new Error("Tiergrenzen sind nicht erreichbar.");
  }
  return Object.freeze({min: Object.freeze(min), max: Object.freeze(max),
    weights: profile.weights, balanceBeginner: profile.balanceBeginner === true});
}

function targetsFor(configuration, tier5Gate) {
  const {hintCount} = requireConfiguration(configuration);
  const bounds = tierBounds(configuration, tier5Gate);
  const targets = [];
  function enumerate(index, remaining, counts) {
    if (index === 4) {
      if (remaining < bounds.min[4] || remaining > bounds.max[4]) return;
      const target = [...counts, remaining];
      if (bounds.balanceBeginner && Math.abs(target[0] - target[1]) > 1) return;
      // The established package mixer reserves one true T2-01 comparison.
      if (target[1] < 1) return;
      if (target[4] === 1 && target[2] < 3) return;
      targets.push(Object.freeze(target));
      return;
    }
    for (let count = bounds.min[index];
      count <= Math.min(bounds.max[index], remaining); count++) {
      enumerate(index + 1, remaining - count, [...counts, count]);
    }
  }
  enumerate(0, hintCount, []);
  if (!targets.length) throw new Error("Kein zulässiger Tiermix erreichbar.");
  return targets;
}

function choice(seed, profileId, seat, choices) {
  const total = choices.reduce((sum, entry) => sum + entry.weight, 0);
  const bytes = createHash("sha256")
    .update(`d203e-policy-v${POLICY_VERSION}|${seed}|${profileId}|${seat}`)
    .digest();
  let roll = bytes.readUInt32BE(0) / 0x100000000 * total;
  for (const entry of choices) {
    if (roll < entry.weight) return entry.index;
    roll -= entry.weight;
  }
  return choices.at(-1).index;
}

function planTierSlots({configuration, assignmentSeedHash, tier5Gate}) {
  const trusted = requireConfiguration(configuration);
  if (typeof assignmentSeedHash !== "string" ||
      !/^[a-f0-9]{64}$/.test(assignmentSeedHash)) {
    throw new TypeError("Privater Zuweisungsseed ist ungültig.");
  }
  const bounds = tierBounds(trusted, tier5Gate);
  let viable = targetsFor(trusted, tier5Gate);
  const counts = [0, 0, 0, 0, 0];
  const slots = [];
  for (let seat = 0; seat < trusted.hintCount; seat++) {
    const choices = [];
    for (let index = 0; index < 5; index++) {
      if (bounds.weights[index] > 0 &&
          viable.some(target => counts[index] < target[index])) {
        choices.push({index, weight: bounds.weights[index]});
      }
    }
    if (!choices.length) throw new Error("Tierplan ist nicht fortsetzbar.");
    const selected = choice(assignmentSeedHash, trusted.profileId, seat, choices);
    counts[selected]++;
    slots.push(selected + 1);
    viable = viable.filter(target =>
      counts.every((count, index) => count <= target[index]));
    if (!viable.length) throw new Error("Tierplan ist nicht fortsetzbar.");
  }
  return Object.freeze({policyVersion: POLICY_VERSION,
    profileId: trusted.profileId, packageCount: trusted.packageCount,
    packageRewardFactor: trusted.packageRewardFactor,
    tier5Requested: counts[4] === 1,
    tierCounts: Object.freeze(counts), tierSlots: Object.freeze(slots)});
}

module.exports = Object.freeze({POLICY_VERSION, GENERATOR_VERSION,
  MIN_PACKAGES, MAX_PACKAGES, HINTS_PER_PACKAGE, PACKAGE_REWARD_FACTORS,
  PROFILES, requireConfiguration, tierBounds, targetsFor, planTierSlots});

},
"prototypes/firebase-lock-attempt/functions/src/selection/chest-selection-policy.cjs":function(module,exports,require){
"use strict";

// C1 is a pure rule preview. It does not start a chest or book any resources.
const packagePolicy = require("../hints/package-count-policy.cjs");
const codeLengths = require("../code-length-contract.cjs");

const SELECTION_POLICY_VERSION = 1;
const INPUT_FIELDS = Object.freeze(["selectionPolicyVersion", "modeId",
  "codeLength", "profileId", "packageCount"]);
const MODE_FACTORS = Object.freeze({PERSONAL: 1, CREW: 1});
const CODE_LENGTH_FACTORS = Object.freeze({8: 1, 10: 2, 12: 4});
const PROFILE_FACTORS = Object.freeze({VERY_EASY: 1, EASY: 2, NORMAL: 4,
  HARD: 8, VERY_HARD: 16});

function requireSelection(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Explicit chest selection is required.");
  }
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("Chest selection must be a plain data object.");
  }
  const fields = Reflect.ownKeys(input);
  if (fields.length !== INPUT_FIELDS.length ||
      fields.some(field => typeof field !== "string" ||
        !INPUT_FIELDS.includes(field))) {
    throw new TypeError("Chest selection fields do not match the contract.");
  }
  const values = {};
  for (const field of INPUT_FIELDS) {
    const descriptor = Object.getOwnPropertyDescriptor(input, field);
    if (!descriptor || !descriptor.enumerable ||
        !Object.hasOwn(descriptor, "value")) {
      throw new TypeError("Chest selection fields must be explicit data values.");
    }
    values[field] = descriptor.value;
  }
  if (values.selectionPolicyVersion !== SELECTION_POLICY_VERSION) {
    throw new TypeError("Unsupported chest selection policy version.");
  }
  if (typeof values.modeId !== "string" ||
      !Object.hasOwn(MODE_FACTORS, values.modeId)) {
    throw new TypeError("Unconfirmed or invalid chest mode.");
  }
  const configuration = packagePolicy.requireConfiguration({
    codeLength: values.codeLength, profileId: values.profileId,
    packageCount: values.packageCount,
  });
  codeLengths.requiredCodeLength(configuration.generatorVersion,
      configuration.codeLength);
  if (!Object.hasOwn(CODE_LENGTH_FACTORS, configuration.codeLength) ||
      !Object.hasOwn(PROFILE_FACTORS, configuration.profileId)) {
    throw new TypeError("Unconfirmed selection reward factor.");
  }
  const mode = MODE_FACTORS[values.modeId];
  const codeLength = CODE_LENGTH_FACTORS[configuration.codeLength];
  const hintDifficulty = PROFILE_FACTORS[configuration.profileId];
  const packageCount = configuration.packageRewardFactor;
  const total = mode * codeLength * hintDifficulty * packageCount;
  return Object.freeze({
    selectionPolicyVersion: SELECTION_POLICY_VERSION,
    modeId: values.modeId,
    codeLength: configuration.codeLength,
    profileId: configuration.profileId,
    packageCount: configuration.packageCount,
    generatorVersion: configuration.generatorVersion,
    hintPolicyVersion: configuration.policyVersion,
    hintsPerPackage: packagePolicy.HINTS_PER_PACKAGE,
    hintCount: configuration.hintCount,
    factors: Object.freeze({mode, codeLength, hintDifficulty, packageCount, total}),
    preview: Object.freeze({cookies: 2 * total, lockpicks: 3 * total, points: total}),
  });
}

module.exports = Object.freeze({SELECTION_POLICY_VERSION, INPUT_FIELDS,
  MODE_FACTORS, CODE_LENGTH_FACTORS, PROFILE_FACTORS, requireSelection});

},
"prototypes/firebase-lock-attempt/functions/src/selection/crew-invitation-core.cjs":function(module,exports,require){
"use strict";
// Shared wire logic; crypto and C1 are injected trusted adapters.
function createCrewInvitationCore({requireSelection,sha256Utf8}){
 const selectionPolicy={requireSelection};
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const LENGTHS = [8, 10, 12];
const PROFILES = ["VERY_EASY", "EASY", "NORMAL", "HARD", "VERY_HARD"];
const MAX_INPUT_LENGTH = 80;
const RULE_SET = Object.freeze({ruleSetId: 1, selectionPolicyVersion: 1,
  generatorVersion: 4, hintPolicyVersion: 2, hintsPerPackage: 2,
  assignmentSeedVersion: 4, instanceDerivationVersion: 1,
  solutionDerivationVersion: 1, personalSaltDerivationVersion: 1,
  feedbackPolicyVersion: 1, rewardRuleVersion: 1});
const fail = code => {throw Object.assign(new TypeError(code), {code});};
const freeze = value => {if(value && typeof value === "object") {for(const x of Object.values(value))freeze(x);Object.freeze(value);}return value;};
function fields(value, names) {
  if(!value || typeof value !== "object" || Array.isArray(value) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(value)))fail("INVALID_FIELDS");
  const keys=Reflect.ownKeys(value);
  if(keys.length!==names.length || keys.some(k=>typeof k!=="string" || !names.includes(k)))fail("INVALID_FIELDS");
  const result={};
  for(const k of names){const d=Object.getOwnPropertyDescriptor(value,k);if(!d?.enumerable || !Object.hasOwn(d,"value"))fail("INVALID_FIELDS");result[k]=d.value;}
  return result;
}
function hex(value, length, error){if(typeof value!=="string" || value.length!==length || !/^[0-9a-f]+$/.test(value))fail(error);return value;}
const hash = value => {const result=sha256Utf8(JSON.stringify(value));return hex(result,64,'INVALID_SHA_RESULT');};
const fromHex=text=>Uint8Array.from(text.match(/../g).map(x=>Number.parseInt(x,16)));
const toHex=bytes=>Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');
function selected(value){
  const input=fields(value,["selectionPolicyVersion","modeId","codeLength","profileId","packageCount"]);
  if(input.modeId!=="CREW")fail("CREW_MODE_REQUIRED");
  const s=selectionPolicy.requireSelection(input);
  const length=LENGTHS.indexOf(input.codeLength),profile=PROFILES.indexOf(input.profileId);
  if(input.selectionPolicyVersion!==1 || length<0 || profile<0 ||
    !Number.isInteger(input.packageCount) || input.packageCount<5 || input.packageCount>10)fail("INVALID_SELECTION");
  const total=[1,2,4][length]*[1,2,4,8,16][profile]*(11-input.packageCount);
  const expected={selectionPolicyVersion:1,modeId:"CREW",codeLength:input.codeLength,
    profileId:input.profileId,packageCount:input.packageCount,generatorVersion:4,
    hintPolicyVersion:2,hintsPerPackage:2,hintCount:input.packageCount*2,
    factors:{mode:1,codeLength:[1,2,4][length],hintDifficulty:[1,2,4,8,16][profile],packageCount:11-input.packageCount,total},
    preview:{cookies:2*total,lockpicks:3*total,points:total}};
  // A future change to C1 defaults cannot silently reinterpret LLC1/ruleset 1.
  if(JSON.stringify(s)!==JSON.stringify(expected))fail("RULESET_SOURCE_MISMATCH");
  return freeze(expected);
}
function encode(bytes){
  let bits=0,buffer=0,result="";
  for(const byte of bytes){buffer=(buffer<<8)|byte;bits+=8;while(bits>=5){bits-=5;result+=ALPHABET[(buffer>>>bits)&31];}buffer&=(1<<bits)-1;}
  if(bits)result+=ALPHABET[(buffer<<(5-bits))&31];return result;
}
function decode(text){
  let bits=0,buffer=0;const bytes=[];
  for(const char of text){const n=ALPHABET.indexOf(char);if(n<0)fail("INVALID_BASE32");buffer=(buffer<<5)|n;bits+=5;if(bits>=8){bits-=8;bytes.push((buffer>>>bits)&255);}buffer&=(1<<bits)-1;}
  if(bytes.length!==21 || bits!==2 || buffer!==0 || encode(bytes)!==text)fail("NONCANONICAL_BASE32");
  return Uint8Array.from(bytes);
}
const checksum = payloadHex => hash(["lock-loot/crew/invitation-checksum/v1",payloadHex]).slice(0,8).toUpperCase();
function publicView(payload, invitationCode){
  if(payload[0]!==1)fail("UNSUPPORTED_INVITATION_VERSION");
  if(payload[1]!==1)fail("UNSUPPORTED_RULESET");
  if(payload[2]>2 || payload[3]>4 || payload[4]<5 || payload[4]>10)fail("INVALID_SELECTION");
  const selection=selected({selectionPolicyVersion:1,modeId:"CREW",codeLength:LENGTHS[payload[2]],profileId:PROFILES[payload[3]],packageCount:payload[4]});
  const instanceDigest=hash(["lock-loot/crew/instance/v1",invitationCode]);
  const encoded=invitationCode.split("-")[1];
  return freeze({invitationContractVersion:1,ruleSetId:1,ruleSet:RULE_SET,invitationCode,
    displayCode:"LLC1-"+encoded.match(/.{1,4}/g).join("-")+"-"+invitationCode.split("-")[2],
    publicPayloadHex:toHex(payload),instanceId:"crew_"+instanceDigest.slice(0,56),instanceDigest,selection});
}
function parseInvitation(value){
  if(typeof value!=="string")fail("INVALID_INVITATION_TYPE");
  if(value.length>MAX_INPUT_LENGTH)fail("INVITATION_TOO_LONG");
  if(!/^[\x20-\x7e]*$/.test(value))fail("INVALID_INVITATION_CHARACTERS");
  const text=value.replace(/^ +| +$/g,"").toUpperCase();
  const match=/^LLC([0-9])-([A-Z2-7]{34}|(?:[A-Z2-7]{4}-){8}[A-Z2-7]{2})-([0-9A-F]{8})$/.exec(text);
  if(!match)fail("INVALID_INVITATION_FORMAT");
  if(match[1]!=="1")fail("UNSUPPORTED_INVITATION_VERSION");
  const encoded=match[2].replaceAll("-",""),payload=decode(encoded),payloadHex=toHex(payload);
  if(checksum(payloadHex)!==match[3])fail("INVITATION_CHECKSUM_MISMATCH");
  return publicView(payload,"LLC1-"+encoded+"-"+match[3]);
}
function createInvitation(value){
  const input=fields(value,["nonceHex","selection"]),nonce=hex(input.nonceHex,32,"INVALID_NONCE"),s=selected(input.selection);
  const payload=Uint8Array.from([1,1,LENGTHS.indexOf(s.codeLength),PROFILES.indexOf(s.profileId),s.packageCount,...fromHex(nonce)]);
  return parseInvitation("LLC1-"+encode(payload)+"-"+checksum(toHex(payload)));
}

const plans=new WeakMap();
function preparePrivateMaterial(value){
 const input=fields(value,['invitationCode','browserSaltHex']),keyHex=hex(input.browserSaltHex,64,'INVALID_BROWSER_SALT'),view=parseInvitation(input.invitationCode);let solutionCode='';
 for(let block=0;block<256&&solutionCode.length<view.selection.codeLength;block++)for(const byte of fromHex(hash(['lock-loot/crew/solution/v1',view.invitationCode,block])))if(byte<250&&solutionCode.length<view.selection.codeLength)solutionCode+=String(byte%10);
 if(solutionCode.length!==view.selection.codeLength)fail('DERIVATION_LIMIT');
 const handle=Object.freeze({});plans.set(handle,Object.freeze({chestId:view.instanceId,solutionCode,keyHex,messageText:JSON.stringify(['lock-loot/crew/personal-assignment-salt/v1',view.instanceDigest,1])}));return handle;
}
function hmacInput(handle){const plan=plans.get(handle);if(!plan)fail('PRIVATE_PLAN_REQUIRED');return Object.freeze({keyHex:plan.keyHex,messageText:plan.messageText});}
function finishPrivateMaterial(handle,saltHex){const plan=plans.get(handle);if(!plan)fail('PRIVATE_PLAN_REQUIRED');const assignmentSalt=hex(saltHex,64,'INVALID_HMAC_RESULT');plans.delete(handle);return freeze({chestId:plan.chestId,solutionCode:plan.solutionCode,assignmentSalt});}
return Object.freeze({INVITATION_CONTRACT_VERSION:1,MAX_INPUT_LENGTH,RULE_SET,createInvitation,parseInvitation,preparePrivateMaterial,hmacInput,finishPrivateMaterial});
}
module.exports=Object.freeze({createCrewInvitationCore});

}
};
const mappings={"prototypes/firebase-lock-attempt/functions/src/code-length-contract.cjs":{},"prototypes/firebase-lock-attempt/functions/src/hints/package-count-policy.cjs":{"node:crypto":"node:crypto"},"prototypes/firebase-lock-attempt/functions/src/selection/chest-selection-policy.cjs":{"../hints/package-count-policy.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/package-count-policy.cjs","../code-length-contract.cjs":"prototypes/firebase-lock-attempt/functions/src/code-length-contract.cjs"},"prototypes/firebase-lock-attempt/functions/src/selection/crew-invitation-core.cjs":{}};
const cache=new Map();
function load(id){if(id==='node:crypto')return browserCrypto;if(cache.has(id))return cache.get(id).exports;if(!Object.hasOwn(factories,id))throw Error('UNKNOWN_MODULE');const module={exports:{}};cache.set(id,module);factories[id](module,module.exports,name=>{if(!Object.hasOwn(mappings[id],name))throw Error('UNKNOWN_REQUIRE');return load(mappings[id][name]);});return module.exports;}
export const {createCrewInvitationCore}=load('prototypes/firebase-lock-attempt/functions/src/selection/crew-invitation-core.cjs');
export const {requireSelection}=load('prototypes/firebase-lock-attempt/functions/src/selection/chest-selection-policy.cjs');
