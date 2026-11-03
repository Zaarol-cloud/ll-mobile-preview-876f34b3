// Generated static factories: unchanged source text, explicit CRLF-to-LF line endings.
import {dependencies} from "./personal-chest-browser-dependencies.mjs";
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
"prototypes/firebase-lock-attempt/functions/src/hints/beginner-information.cjs":function(module,exports,require){
"use strict";

const {visibleHintIsTrue} = require("./visible-hint-truth.cjs");

// Explicitly audited local families. A new hint type must be reviewed before
// it can take part in a proof; CODE hints read positions outside their labels.
const LOCAL_IDS = new Set([
  ..."01 02 03 05 06 07 08 09 12 13 14".split(" ").map(n => `T1-${n}`),
  ...Array.from({length: 10}, (_, digit) =>
    `T1-DIGIT-${String(digit).padStart(2, "0")}`),
  ..."01 02 03 04 06 07 08 09 10 11 12 13 14 15 16".split(" ")
    .map(n => `T2-${n}`),
  ..."01 02 03 04 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20"
    .split(" ").map(n => `T3-${n}`),
]);
const MAX_UNION_POSITIONS = 4; // At most 10^4 exhaustive assignments.

function beginnerHintIsTrue(hint, code) {
  return visibleHintIsTrue(hint, code);
}

function localReadPositions(hint, codeLength = 11) {
  if (!hint || !LOCAL_IDS.has(hint.id)) return null;
  const expected = hint.id === "T1-DIGIT-06" ? 2 :
    hint.id.startsWith("T1-") ? 1 : hint.id.startsWith("T2-") ? 2 : 3;
  const positions = hint.internalPositions;
  if (!Array.isArray(positions) || positions.length !== expected ||
      new Set(positions).size !== expected || positions.some(position =>
        !Number.isInteger(position) || position < 0 || position >= codeLength)) return null;
  return positions;
}

function proveStrictLocalImplication(oldHint, newHint, codeLength = 11) {
  if (!oldHint || !newHint || oldHint.tier !== newHint.tier) return null;
  if (![8, 10, 11, 12].includes(codeLength)) return null;
  const oldPositions = localReadPositions(oldHint, codeLength);
  const newPositions = localReadPositions(newHint, codeLength);
  if (!oldPositions || !newPositions) return null;
  const union = [...new Set([...oldPositions, ...newPositions])].sort((a, b) => a - b);
  if (union.length > MAX_UNION_POSITIONS) return null;
  const rows = 10 ** union.length;
  // All other coordinates are arbitrary, not fixed to the solution. The
  // allowlisted predicates read only their internalPositions.
  const code = Array(codeLength).fill(0);
  let excludedAssignments = 0;
  for (let row = 0; row < rows; row++) {
    let value = row;
    for (const position of union) {
      code[position] = value % 10;
      value = Math.floor(value / 10);
    }
    const oldTruth = beginnerHintIsTrue(oldHint, code);
    const newTruth = beginnerHintIsTrue(newHint, code);
    if (typeof oldTruth !== "boolean" || typeof newTruth !== "boolean" ||
        newTruth && !oldTruth) return null;
    excludedAssignments += Number(oldTruth && !newTruth);
  }
  if (excludedAssignments === 0) return null;
  return Object.freeze({excludedAssignments, rows,
    supportPositions: Object.freeze(union)});
}

module.exports = Object.freeze({LOCAL_IDS, MAX_UNION_POSITIONS,
  beginnerHintIsTrue, localReadPositions, proveStrictLocalImplication});

},
"prototypes/firebase-lock-attempt/functions/src/hints/extended-hint-generator.cjs":function(module,exports,require){
"use strict";

const {createHash} = require("node:crypto");
const core = require("./gdevelop-generator-core-v3.cjs");
const beginnerInformation = require("./beginner-information.cjs");
const distinctness = require("./hint-distinctness.cjs");
const localization = require("./hint-localization.cjs");
const policy = require("./package-count-policy.cjs");
const ranked = require("./ranked-hint-generator.cjs");
const information = require("./v4-package-information.cjs");
const packageRepair = require("./v4-package-repair.cjs");
const {coverageHintIsTrue, requireKnownSourceTruth} =
  require("./v4-coverage-truth.cjs");

const SEARCH_LIMITS = Object.freeze({plans: 16, candidateOrders: 8,
  pairStatesPerOrder: 2000, totalPairStates: 100000,
  candidateChecks: 500000, distinctnessProofs: 50000,
  sensitivityEvaluations: 200000, coverageRepairScans: 300,
  coverageSwaps: 3, coverageChoices: 8,
  finalCoverageScans: 2000, finalCoverageFinalizations: 8,
  generalReplacementScans: 2400, generalReplacementProofs: 800,
  generalReplacementFinalizations: 6,
  generalReplacementSwaps: 2});
const CODEWIDE_WITHOUT_CODE_ID = new Set(["T4-15", "T4-20", "T5-03"]);
const SIMPLE_EXTREMUM_CODE_IDS = new Set(["T1-CODE-03", "T2-CODE-04"]);
const allMask = length => (1 << length) - 1;
function bitCount(value) {
  let count = 0;
  for (let bits = value; bits; bits &= bits - 1) count++;
  return count;
}
function readsWholeCode(hint) {
  return hint.id.includes("-CODE-") ||
    CODEWIDE_WITHOUT_CODE_ID.has(hint.id);
}
function hasCoupledCodewideConstraint(hints) {
  return hints.some(hint => readsWholeCode(hint) &&
    !SIMPLE_EXTREMUM_CODE_IDS.has(hint.id));
}
function truthValue(hint, code) {
  try { return coverageHintIsTrue(hint, code); }
  catch { return null; }
}
function sensitivityMask(hint, code, cache, telemetry) {
  if (!hint || hint.id === "T5-04" || hint.truth !== true) return 0;
  const key = hint.signature + "|" + hint.text;
  if (cache.has(key)) return cache.get(key);
  let mask = 0;
  if (truthValue(hint, code) === true) {
    const positions = readsWholeCode(hint) ?
      code.map((_, position) => position) :
      [...new Set(hint.internalPositions)];
    for (const position of positions) {
      for (let digit = 0; digit <= 9; digit++) {
        if (digit === code[position]) continue;
        if (++telemetry.sensitivityEvaluations >
            SEARCH_LIMITS.sensitivityEvaluations) {
          throw new Error("Abdeckungs-Prüfbudget erschöpft.");
        }
        const alternative = code.slice();
        alternative[position] = digit;
        if (truthValue(hint, alternative) === false) {
          mask |= 1 << position;
          break;
        }
      }
    }
  }
  cache.set(key, mask);
  return mask;
}
function selectedSensitivityMask(selected, code, cache, telemetry) {
  return selected.reduce((mask, hint) =>
    mask | sensitivityMask(hint, code, cache, telemetry), 0);
}
function fullSetSensitivityMask(hints, code, telemetry) {
  const ordinary = hints.filter(hint => hint.id !== "T5-04");
  const meta = ordinary.length !== hints.length;
  telemetry.sensitivityEvaluations += ordinary.length;
  if (telemetry.sensitivityEvaluations >
      SEARCH_LIMITS.sensitivityEvaluations) {
    throw new Error("Abdeckungs-Prüfbudget erschöpft.");
  }
  requireKnownSourceTruth(hints, code);
  let mask = 0;
  for (let position = 0; position < code.length; position++) {
    for (let digit = 0; digit <= 9; digit++) {
      if (digit === code[position]) continue;
      telemetry.sensitivityEvaluations += ordinary.length;
      if (telemetry.sensitivityEvaluations >
          SEARCH_LIMITS.sensitivityEvaluations) {
        throw new Error("Abdeckungs-Prüfbudget erschöpft.");
      }
      const alternative = code.slice();
      alternative[position] = digit;
      const alternatives = ordinary.map(hint =>
        truthValue(hint, alternative));
      if (alternatives.some(value => typeof value !== "boolean")) continue;
      const falseCount = alternatives.filter(value =>
        value === false).length;
      if (meta ? falseCount !== 1 : falseCount !== 0) {
        mask |= 1 << position;
        break;
      }
    }
  }
  return mask;
}
function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}
function ordered(values, seed, purpose) {
  return values.slice().sort((a, b) =>
    hash(`${purpose}|${seed}|${a.signature}`).localeCompare(
      hash(`${purpose}|${seed}|${b.signature}`)) ||
    a.signature.localeCompare(b.signature));
}
function compatible(candidate, selected, context, cache, telemetry) {
  if (++telemetry.candidateChecks > SEARCH_LIMITS.candidateChecks) {
    throw new Error("Kandidaten-Suchbudget erschöpft.");
  }
  if (!candidate || candidate.truth !== true ||
      selected.some(previous => previous.signature === candidate.signature ||
        previous.text === candidate.text)) return false;
  return selected.every(previous => {
    if (++telemetry.candidateChecks > SEARCH_LIMITS.candidateChecks) {
      throw new Error("Kandidaten-Suchbudget erschöpft.");
    }
    if (candidate.id === "T5-04" || previous.id === "T5-04") return true;
    if (candidate.id === previous.id &&
        context.samePositionSet(candidate, previous)) return false;
    if (candidate.id !== previous.id &&
        context.candidatesConflict(candidate, previous)) return false;
    const oldSize = cache.size;
    const result = distinctness.pairIsDistinct(candidate, previous,
      context.code, cache);
    telemetry.distinctnessProofs += cache.size - oldSize;
    if (telemetry.distinctnessProofs > SEARCH_LIMITS.distinctnessProofs) {
      throw new Error("Gegenbeweis-Suchbudget erschöpft.");
    }
    return result;
  });
}
function chooseCoverageCandidate(pool, chosen, context, cache, telemetry,
  sensitivityCache) {
  const uniqueType = pool.some(hint =>
    !chosen.some(previous => previous.id === hint.id));
  const options = [];
  let scanned = 0;
  for (const hint of pool) {
    if (++scanned > 64) break;
    if (uniqueType && chosen.some(previous => previous.id === hint.id)) continue;
    if (!compatible(hint, chosen, context, cache, telemetry)) continue;
    options.push(hint);
    if (options.length >= SEARCH_LIMITS.coverageChoices) break;
  }
  if (!options.length) return null;
  const covered = selectedSensitivityMask(chosen, context.code,
    sensitivityCache, telemetry);
  const mentioned = new Set(chosen.flatMap(hint =>
    hint.internalPositions || []));
  let best = options[0];
  let bestScore = -1;
  for (const candidate of options) {
    const proofGain = bitCount(sensitivityMask(candidate, context.code,
      sensitivityCache, telemetry) & ~covered);
    const mentionGain = new Set(candidate.internalPositions
      .filter(position => !mentioned.has(position))).size;
    const score = mentionGain * 100 + proofGain * 10;
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}
function repairUnwitnessedPositions(context, chosen, anchor, pools,
  cache, sensitivityCache, telemetry) {
  // Coupled sets are repaired after beginner passes; final proof stays mandatory.
  if (hasCoupledCodewideConstraint(chosen)) return true;
  let covered = selectedSensitivityMask(chosen, context.code,
    sensitivityCache, telemetry);
  const targets = Array.from({length: context.code.length},
    (_, position) => position).filter(position =>
    !(covered & 1 << position));
  if (!targets.length) return true;
  const targetMask = targets.reduce((mask, position) =>
    mask | 1 << position, 0);
  let scans = 0;
  for (let swap = 0; swap < SEARCH_LIMITS.coverageSwaps &&
      (covered & targetMask) !== targetMask; swap++) {
    let best = null;
    outer: for (let index = 0; index < chosen.length; index++) {
      const old = chosen[index];
      if (old === anchor || !pools[old.tier]) continue;
      const others = chosen.filter((_, otherIndex) => otherIndex !== index);
      const othersMask = selectedSensitivityMask(others, context.code,
        sensitivityCache, telemetry);
      for (const candidate of pools[old.tier]) {
        if (++scans > SEARCH_LIMITS.coverageRepairScans) break outer;
        if (candidate.signature === old.signature) continue;
        const candidateMask = sensitivityMask(candidate, context.code,
          sensitivityCache, telemetry);
        const nextMask = othersMask | candidateMask;
        if ((covered & ~nextMask) !== 0 ||
            bitCount(nextMask & targetMask) <=
              bitCount(covered & targetMask) ||
            !compatible(candidate, others, context, cache, telemetry)) continue;
        const gain = bitCount(nextMask & targetMask) -
          bitCount(covered & targetMask);
        const strongerLocal = beginnerInformation
          .proveStrictLocalImplication(old, candidate,
            context.code.length);
        const score = (strongerLocal ? 1000000 : 0) +
          gain * 10000 + bitCount(nextMask) * 100 +
          candidate.informationStrength - old.informationStrength;
        if (!best || score > best.score) {
          best = {index, candidate, nextMask, score,
            old: chosen[index]};
        }
      }
    }
    if (!best) break;
    chosen[best.index] = best.candidate;
    covered = best.nextMask;
    telemetry.coverageSwaps++;
    telemetry.coverageSwapDetails.push({from: best.old.id,
      to: best.candidate.id, fromStrength: best.old.informationStrength,
      toStrength: best.candidate.informationStrength,
      fromPositions: best.old.internalPositions,
      toPositions: best.candidate.internalPositions});
  }
  return targets.every(position => !!(covered & 1 << position));
}
function selectCandidates(context, mix, seed, attempt, cache,
  sensitivityCache, telemetry) {
  const counts = mix.tierCounts.slice();
  const chosen = [];
  const anchorPool = ordered(context.tierPools[2].filter(hint =>
    hint.id === "T2-01" && hint.truth === true), seed, `anchor-${attempt}`);
  const anchor = anchorPool[attempt % anchorPool.length];
  if (!anchor) return null;
  chosen.push(anchor);
  counts[1]--;
  if (counts[1] < 0) return null;
  let meta = null;
  let witnesses = [];
  if (mix.tier5Requested) {
    const tier5Pool = ordered(context.tierPools[5].filter(hint =>
      hint.truth === true), seed, `tier5-${attempt}`);
    const metaPool = tier5Pool.filter(hint => hint.id === "T5-04");
    const selectedTier5 = attempt < Math.min(4, metaPool.length) ?
      metaPool[attempt] : tier5Pool[attempt % tier5Pool.length];
    if (selectedTier5?.id === "T5-04") telemetry.metaOffered++;
    if (!selectedTier5 ||
        !compatible(selectedTier5, chosen, context, cache, telemetry)) return null;
    chosen.push(selectedTier5);
    counts[4]--;
    if (selectedTier5.id === "T5-04") {
      meta = selectedTier5;
      witnesses = selectedTier5.details.witnessSignatures.map(signature =>
        context.candidateGroups[3]["T3-07"].find(hint =>
          hint.signature === signature));
      if (witnesses.length !== 3 ||
          new Set(witnesses.map(hint => hint?.signature)).size !== 3 ||
          witnesses.some(hint => !hint || hint.truth !== true ||
            context.estimateInformationExclusionPercent(hint) <
              context.minimumInformationPercent)) return null;
      telemetry.metaWitnessesAvailable++;
      for (const source of witnesses) {
        const witness = {...source,
          lengthClass: context.classifyHintLength(source)};
        if (!compatible(witness, chosen.filter(hint => hint !== anchor),
          context, cache, telemetry)) return null;
        chosen.push(witness);
        counts[2]--;
      }
      if (counts[2] < 0) return null;
      witnesses = chosen.slice(-3);
      telemetry.metaWitnessesAccepted++;
    }
  }
  const tierOrder = ["VERY_EASY", "EASY"].includes(mix.profileId) ?
    [1, 2, 3, 4] : [4, 3, 2, 1];
  const initialChosen = chosen.slice();
  const initialCounts = counts.slice();
  const pools = Object.fromEntries(tierOrder.map(tier => [tier,
    ordered(context.tierPools[tier].filter(hint => hint.truth === true),
      seed, `tier-${tier}-${attempt}`)]));
  let greedyComplete = true;
  for (const tier of tierOrder) {
    const pool = pools[tier];
    while (counts[tier - 1] > 0) {
      const fallback = () => pool.find(hint =>
        !chosen.some(previous => previous.id === hint.id) &&
        compatible(hint, meta ? chosen.filter(previous =>
          previous !== anchor) : chosen, context, cache, telemetry)) ||
        pool.find(hint => compatible(hint, meta ? chosen.filter(previous =>
          previous !== anchor) : chosen, context, cache,
          telemetry));
      const candidate = !meta && telemetry.coverageRejected > 0 ?
        chooseCoverageCandidate(pool, chosen, context, cache, telemetry,
          sensitivityCache) || fallback() : fallback();
      if (!candidate) {
        telemetry.maxChosen = Math.max(telemetry.maxChosen, chosen.length);
        telemetry.lastUnfilledTier = tier;
        greedyComplete = false;
        break;
      }
      chosen.push(candidate);
      counts[tier - 1]--;
    }
    if (!greedyComplete) break;
  }
  if (!greedyComplete && tierOrder[0] === 1 && attempt < 2) {
    const slots = [];
    const left = initialCounts.slice();
    while (left.some(value => value > 0)) {
      for (const tier of [1, 2, 3, 4]) {
        if (left[tier - 1] > 0) {
          slots.push(tier);
          left[tier - 1]--;
        }
      }
    }
    let beam = [initialChosen];
    for (let slot = 0; slot < slots.length; slot++) {
      const tier = slots[slot];
      const next = [];
      for (const state of beam) {
        let added = 0;
        for (const candidate of pools[tier]) {
          if (!compatible(candidate, meta ? state.filter(previous =>
            previous !== anchor) : state, context, cache, telemetry)) continue;
          next.push([...state, candidate]);
          if (++added >= 8) break;
        }
      }
      if (!next.length) return null;
      next.sort((leftState, rightState) => {
        const score = state => new Set(state.map(hint => hint.id)).size * 100 +
          new Set(state.flatMap(hint => hint.internalPositions)).size * 10 +
          state.reduce((sum, hint) => sum + hint.informationStrength, 0);
        return score(rightState) - score(leftState) ||
          hash(`${seed}|beam|${slot}|${leftState.map(hint =>
            hint.signature).join("|")}`).localeCompare(
            hash(`${seed}|beam|${slot}|${rightState.map(hint =>
              hint.signature).join("|")}`));
      });
      beam = next.slice(0, 16);
    }
    chosen.splice(0, chosen.length, ...beam[0]);
    greedyComplete = true;
  }
  if (!greedyComplete || chosen.length !== context.packageCount * 2) return null;
  if (!meta && !repairUnwitnessedPositions(context, chosen, anchor,
    pools, cache, sensitivityCache, telemetry)) {
    telemetry.coverageRejected++;
    return null;
  }
  if (meta) telemetry.metaSelected++;
  return {chosen, anchor, meta, witnesses};
}

function pairCandidates(context, selection, seed, attempt, telemetry) {
  const {chosen, anchor, meta, witnesses} = selection;
  const tier5 = chosen.find(hint => hint.tier === 5);
  const packages = Array.from({length: context.packageCount}, () => []);
  if (meta) {
    packages[0] = [meta, anchor];
    for (let index = 0; index < 3; index++) packages[index + 1] = [witnesses[index]];
  } else {
    packages[0] = [anchor];
    if (tier5) packages.at(-1).push(tier5);
  }
  const reserved = new Set(packages.flat().map(hint => hint.signature));
  const remaining = ordered(chosen.filter(hint => !reserved.has(hint.signature)),
    seed, `remaining-${attempt}`);
  if (remaining.length !== chosen.length - reserved.size) return null;
  let states = 0;
  const validPair = (first, second) =>
    first.id !== second.id && context.lengthPairAllowed(first, second) &&
    !(first.tier === 5 && second.tier === 4 ||
      first.tier === 4 && second.tier === 5) &&
    !context.candidatesConflict(first, second);
  const pairCost = (first, second) =>
    Number(first.tier === second.tier) * 1000 +
    Number(first.tier >= 3 && second.tier >= 3) * 100 +
    Number(first.lengthClass === "mittel" &&
      second.lengthClass === "mittel") * 5;
  const fillOrder = packages.map((_, index) => index)
    .filter(index => packages[index].length < 2)
    .sort((left, right) => {
      const priority = index => {
        const hint = packages[index][0];
        if (!hint) return 3;
        if (hint.tier === 5) return 0;
        if (hint.lengthClass === "lang") return 1;
        return 2;
      };
      return priority(left) - priority(right) || left - right;
    });
  const failed = new Set();
  function fill(orderIndex, available) {
    states++;
    telemetry.pairStates++;
    if (telemetry.pairStates > SEARCH_LIMITS.totalPairStates) {
      throw new Error("Paketmisch-Suchbudget erschöpft.");
    }
    if (states > SEARCH_LIMITS.pairStatesPerOrder) return false;
    if (orderIndex === fillOrder.length) return available.length === 0;
    const key = `${orderIndex}|${available.map(hint =>
      hint.signature).join(";")}`;
    if (failed.has(key)) return false;
    const packageIndex = fillOrder[orderIndex];
    const current = packages[packageIndex];
    const first = current[0] || available[0];
    if (!first) return false;
    const choices = (current.length ? available : available.slice(1))
      .filter(second => validPair(first, second))
      .sort((left, right) =>
        pairCost(first, left) +
          Number(first.lengthClass === "kurz" &&
            left.lengthClass === "kurz" &&
            available.some(hint => hint.lengthClass === "lang")) * 500 -
        pairCost(first, right) -
          Number(first.lengthClass === "kurz" &&
            right.lengthClass === "kurz" &&
            available.some(hint => hint.lengthClass === "lang")) * 500 ||
        hash(`pair|${seed}|${attempt}|${first.signature}|${left.signature}`)
          .localeCompare(hash(`pair|${seed}|${attempt}|${first.signature}|${right.signature}`)));
    for (const second of choices) {
      packages[packageIndex] = [first, second];
      const next = available.filter(item =>
        item !== second && (current.length || item !== first));
      if (fill(orderIndex + 1, next)) return true;
    }
    packages[packageIndex] = current;
    failed.add(key);
    return false;
  }
  if (!fill(0, remaining)) return null;
  if (meta) telemetry.metaPaired++;
  // Package numbers are private-seed shuffled after balanced pairs exist.
  // The T5-04 warning and three separate witnesses remain in packages 1-4.
  const fixed = meta ? packages.slice(0, 4) : [];
  const movable = meta ? packages.slice(4) : packages;
  const shuffled = ordered(movable.map((pack, index) => ({
    signature: `${index}|${pack.map(hint => hint.signature).join("+")}`, pack,
  })), seed, `package-${attempt}`).map(item => item.pack);
  return [...fixed, ...shuffled].flatMap((pack, packageIndex) =>
    pack.map((hint, slot) => ({...hint, packageNumber: packageIndex + 1,
      packagePosition: slot + 1})));
}

function validateEnglish(context) {
  const seen = new Set();
  for (let index = 0; index < context.selected.length; index += 2) {
    const pair = context.selected.slice(index, index + 2).map(hint => {
      const en = localization.localizedTexts(context.toInternalHint(hint)).en;
      if (typeof en !== "string" || !en.trim() || seen.has(en)) {
        throw new Error("Englischer Hinweis fehlt oder ist doppelt.");
      }
      seen.add(en);
      return {...hint, text: en,
        lengthClass: context.classifyHintLength({...hint, text: en})};
    });
    if (!context.lengthPairAllowed(...pair)) {
      throw new Error("Englisches Hinweispaket verletzt die Längenregel.");
    }
  }
}

function verifyFinalPairwise(context, cache) {
  const ordinary = context.selected.filter(hint =>
    hint.id !== "T5-04" && !hint.intentionallyFalse);
  for (let first = 0; first < ordinary.length; first++) {
    for (let second = first + 1; second < ordinary.length; second++) {
      if (!distinctness.pairIsDistinct(ordinary[first], ordinary[second],
        context.code, cache)) {
        throw new Error("Fertiger Satz enthält semantisch wiederholte Hinweise.");
      }
    }
  }
}

function repairFinalCoverage(context, finalizeSelection, cache,
  telemetry) {
  if (context.selected.some(hint => hint.id === "T5-04")) return true;
  const original = structuredClone(context.selected);
  const sensitivityCache = new Map();
  let scans = 0;
  let finalizations = 0;
  const changes = [];
  for (let step = 0; step < SEARCH_LIMITS.coverageSwaps; step++) {
    const covered = selectedSensitivityMask(context.selected,
      context.code, sensitivityCache, telemetry);
    if (covered === allMask(context.code.length)) {
      if (changes.length) telemetry.finalCoverageRepair = changes;
      return true;
    }
    const proposals = [];
    outer: for (let index = context.selected.length - 1; index >= 0;
      index--) {
      const old = context.selected[index];
      if (old.id === "T2-01" && old.packageNumber === 1) continue;
      const others = context.selected.filter((_, position) =>
        position !== index);
      const othersMask = selectedSensitivityMask(others,
        context.code, sensitivityCache, telemetry);
      for (const candidate of context.tierPools[old.tier]) {
        if (++scans > SEARCH_LIMITS.finalCoverageScans) break outer;
        if (candidate.truth !== true ||
            candidate.signature === old.signature) continue;
        const candidateMask = sensitivityMask(candidate,
          context.code, sensitivityCache, telemetry);
        const nextMask = othersMask | candidateMask;
        if ((covered & ~nextMask) !== 0 ||
            bitCount(nextMask) <= bitCount(covered) ||
            !compatible(candidate, others, context, cache, telemetry)) {
          continue;
        }
        const strongerLocal = beginnerInformation
          .proveStrictLocalImplication(old, candidate,
            context.code.length);
        proposals.push({index, old, candidate, nextMask,
          score: bitCount(nextMask) * 100000 +
            Number(strongerLocal) * 10000 +
            candidate.informationStrength - old.informationStrength});
      }
    }
    proposals.sort((left, right) => right.score - left.score ||
      right.index - left.index ||
      left.candidate.signature.localeCompare(right.candidate.signature));
    let accepted = false;
    const previous = structuredClone(context.selected);
    for (const proposal of proposals) {
      if (++finalizations > SEARCH_LIMITS.finalCoverageFinalizations) break;
      const proposed = structuredClone(previous);
      proposed[proposal.index] = {...structuredClone(proposal.candidate),
        packageNumber: proposal.old.packageNumber,
        packagePosition: proposal.old.packagePosition};
      context.selected.splice(0, context.selected.length, ...proposed);
      try {
        finalizeSelection();
        validateEnglish(context);
        verifyFinalPairwise(context, cache);
        const proven = fullSetSensitivityMask(context.selected,
          context.code, telemetry);
        if ((covered & ~proven) !== 0 ||
            bitCount(proven) <= bitCount(covered)) continue;
        changes.push({slot: proposal.index + 1,
          from: proposal.old.id, to: proposal.candidate.id,
          fromStrength: proposal.old.informationStrength,
          toStrength: proposal.candidate.informationStrength,
          witnessedPositions: bitCount(proven)});
        accepted = true;
        break;
      } catch {
        // Invalid same-tier proposals cannot replace the current set.
      }
    }
    if (!accepted) break;
  }
  context.selected.splice(0, context.selected.length, ...original);
  return false;
}

function packageCertificates(hints, code, allowGroupFallback = true) {
  const certificates = [];
  let previous = [];
  for (let index = 0; index < hints.length; index += 2) {
    const next = hints.slice(index, index + 2);
    certificates.push(information.findPositivePackageWitness(
      previous, next, code, {allowGroupFallback}));
    previous = previous.concat(next);
  }
  return certificates;
}
function progressScore(certificates) {
  const start = Math.max(0, certificates.length - 3);
  return certificates.reduce((score, item, index) =>
    score + (index >= start && item.status === "proven" ?
      certificates.length - index : 0), 0);
}
function sameEarlierHints(before, after, count) {
  return before.slice(0, count).every((hint, index) =>
    hint.id === after[index]?.id &&
    hint.signature === after[index]?.signature &&
    hint.text === after[index]?.text &&
    hint.tier === after[index]?.tier &&
    hint.truth === after[index]?.truth);
}
function sameOtherHints(before, after, replacedIndex) {
  return before.length === after.length &&
    before.every((hint, index) => index === replacedIndex ||
      JSON.stringify({id: hint.id, signature: hint.signature,
        text: hint.text, tier: hint.tier, truth: hint.truth,
        internalPositions: hint.internalPositions,
        details: hint.details}) ===
      JSON.stringify({id: after[index]?.id,
        signature: after[index]?.signature,
        text: after[index]?.text, tier: after[index]?.tier,
        truth: after[index]?.truth,
        internalPositions: after[index]?.internalPositions,
        details: after[index]?.details}));
}
function provePrefixConditionedReplacement(previous, old, candidate,
  codeLength) {
  if (old.tier !== candidate.tier) return null;
  const oldPositions = beginnerInformation.localReadPositions(old,
    codeLength);
  const candidatePositions = beginnerInformation.localReadPositions(
    candidate, codeLength);
  if (!oldPositions || !candidatePositions) return null;
  const union = [...new Set([...oldPositions, ...candidatePositions])]
    .sort((left, right) => left - right);
  if (union.length > beginnerInformation.MAX_UNION_POSITIONS) return null;
  const relevant = previous.filter(hint => {
    const positions = beginnerInformation.localReadPositions(hint,
      codeLength);
    return positions && positions.every(position =>
      union.includes(position));
  });
  const rows = 10 ** union.length;
  const code = Array(codeLength).fill(0);
  let excludedAssignments = 0;
  for (let row = 0; row < rows; row++) {
    let value = row;
    for (const position of union) {
      code[position] = value % 10;
      value = Math.floor(value / 10);
    }
    let prefixFalse = false;
    try {
      for (const hint of relevant) {
        const truth = beginnerInformation.beginnerHintIsTrue(hint,
          code);
        if (typeof truth !== "boolean") return null;
        if (!truth) {
          prefixFalse = true;
          break;
        }
      }
    } catch { return null; }
    if (prefixFalse) continue;
    let oldTruth;
    let newTruth;
    try {
      oldTruth = beginnerInformation.beginnerHintIsTrue(old, code);
      newTruth = beginnerInformation.beginnerHintIsTrue(candidate,
        code);
    } catch { return null; }
    if (typeof oldTruth !== "boolean" ||
        typeof newTruth !== "boolean" ||
        newTruth && !oldTruth) return null;
    excludedAssignments += Number(oldTruth && !newTruth);
  }
  return excludedAssignments ? {excludedAssignments, rows,
    prefixHints: relevant.length} : null;
}
function improvePackageProgress(context, finalizeSelection, cache,
  telemetry) {
  const packageCount = context.packageCount;
  if (packageCount < 8 ||
      context.selected.some(hint => hint.id === "T5-04")) return;
  const original = structuredClone(context.selected);
  const originalCertificates = packageCertificates(original,
    context.code, false);
  const lateStart = Math.max(0, packageCount - 4);
  const clusteredUnknown = originalCertificates.some((item,
    index) => index >= lateStart &&
      index + 1 < packageCount &&
      item.status === "unknown" &&
      originalCertificates[index + 1].status === "unknown");
  if (!clusteredUnknown) return;
  let best = {hints: original,
    certificates: originalCertificates,
    name: "original", preservedCount: original.length};
  let bestScore = progressScore(best.certificates);
  const lastThreeStart = packageCount - 3;
  const prefixCount = lastThreeStart * 2;
  let attemptedOrders = 0;
  let attemptedReplacements = 0;
  const tryFinalized = (proposed, name, preservedCount) => {
    context.selected.splice(0, context.selected.length,
      ...structuredClone(proposed));
    try {
      const finalized = finalizeSelection();
      validateEnglish(context);
      verifyFinalPairwise(context, cache);
      if (!sameEarlierHints(original, finalized,
          preservedCount)) return;
      const certificates = packageCertificates(finalized,
        context.code, false);
      const score = progressScore(certificates);
      if (score > bestScore ||
          score === bestScore &&
          preservedCount > best.preservedCount) {
        best = {hints: structuredClone(finalized),
          certificates, name, preservedCount};
        bestScore = score;
      }
    } catch {
      // Invalid variants never replace the original finished set.
    }
  };
  const penultimate = packageCount - 2;
  if (originalCertificates[penultimate]?.status === "unknown" &&
      originalCertificates[penultimate + 1]?.status ===
        "unknown") {
    const previous = original.slice(0, penultimate * 2);
    const sample = information.samplePrefixAlternatives(previous,
      context.code);
    if (sample.samples.length && !sample.budgetExhausted) {
      for (const slot of [penultimate * 2,
        penultimate * 2 + 1]) {
        const old = original[slot];
        const partner = original[slot ^ 1];
        const candidates = context.tierPools[old.tier]
          .slice(0, 800)
          .filter(candidate => candidate.truth === true &&
            candidate.signature !== old.signature &&
            candidate.informationStrength >=
              old.informationStrength)
          .map(candidate => ({
            candidate, gain: sample.samples.filter(code =>
              truthValue(partner, code) === true &&
              truthValue(old, code) === true &&
              truthValue(candidate, code) === false).length,
          }))
          .filter(row => row.gain > 0)
          .sort((left, right) => right.gain - left.gain ||
            right.candidate.informationStrength -
              left.candidate.informationStrength ||
            left.candidate.signature.localeCompare(
              right.candidate.signature));
        for (const {candidate} of candidates.slice(0, 4)) {
          attemptedReplacements++;
          const proposed = structuredClone(original);
          proposed[slot] = {...structuredClone(candidate),
            packageNumber: old.packageNumber,
            packagePosition: old.packagePosition};
          tryFinalized(proposed,
            `same-tier-slot-${slot + 1}`,
            penultimate * 2);
        }
      }
    }
  }
  if (originalCertificates.slice(lastThreeStart).some(item =>
    item.status === "unknown")) {
    const originalPackages = Array.from({length: packageCount},
      (_, index) => original.slice(index * 2, index * 2 + 2));
    for (const order of [[1, 0, 2], [0, 2, 1],
      [1, 2, 0]]) {
      attemptedOrders++;
      const packageOrder = [
        ...Array.from({length: lastThreeStart},
          (_, index) => index),
        ...order.map(offset => lastThreeStart + offset)];
      const proposed = packageOrder.flatMap((oldIndex,
        newIndex) => originalPackages[oldIndex].map(
        (hint, position) => ({...structuredClone(hint),
          packageNumber: newIndex + 1,
          packagePosition: position + 1})));
      tryFinalized(proposed,
        `tail-order-${order.join("")}`, prefixCount);
    }
  }
  context.selected.splice(0, context.selected.length,
    ...structuredClone(best.hints));
  telemetry.packageProgress = {selected: best.name,
    original: originalCertificates.map(item => item.status),
    final: best.certificates.map(item => item.status),
    attemptedOrders, attemptedReplacements};
}
function improveGeneralPackageContent(context, finalizeSelection,
  cache, telemetry) {
  if (context.selected.some(hint => hint.id === "T5-04")) return;
  const original = packageCertificates(context.selected, context.code);
  if (!original.slice(1).some(item => item.status === "unknown")) return;
  const originalStatuses = original.map(item => item.status);
  const originalCoverage = fullSetSensitivityMask(context.selected,
    context.code, telemetry);
  let scans = 0;
  let proofs = 0;
  let finalizations = 0;
  const accepted = [];
  const rejected = {nonLocalOld: 0, nonLocalCandidate: 0,
    implication: 0, compatibility: 0, packageWitness: 0,
    finalization: 0};
  for (let pass = 0; pass < SEARCH_LIMITS.generalReplacementSwaps;
    pass++) {
    const current = structuredClone(context.selected);
    const certificates = packageCertificates(current, context.code);
    const statuses = certificates.map(item => item.status);
    let improved = false;
    outer: for (let packageIndex = context.packageCount - 1;
      packageIndex >= 1; packageIndex--) {
      if (statuses[packageIndex] !== "unknown") continue;
      const previous = current.slice(0, packageIndex * 2);
      for (const slot of [packageIndex * 2,
        packageIndex * 2 + 1]) {
        const old = current[slot];
        if (!beginnerInformation.localReadPositions(old,
            context.code.length)) {
          rejected.nonLocalOld++;
          continue;
        }
        const partner = current[slot ^ 1];
        const others = current.filter((_, index) => index !== slot);
        const candidates = [];
        let searchExhausted = false;
        for (const candidate of context.tierPools[old.tier]) {
          if (++scans > SEARCH_LIMITS.generalReplacementScans ||
              proofs >= SEARCH_LIMITS.generalReplacementProofs) {
            searchExhausted = true;
            break;
          }
          if (candidate.truth !== true ||
              candidate.signature === old.signature) continue;
          if (!beginnerInformation.localReadPositions(candidate,
              context.code.length)) {
            rejected.nonLocalCandidate++;
            continue;
          }
          proofs++;
          const proof = provePrefixConditionedReplacement(previous,
            old, candidate, context.code.length);
          if (!proof) {
            rejected.implication++;
            continue;
          }
          if (!compatible(candidate, others, context,
              cache, telemetry)) {
            rejected.compatibility++;
            continue;
          }
          const next = slot % 2 === 0 ?
            [candidate, partner] : [partner, candidate];
          const witness = information.findPositivePackageWitness(
            previous, next, context.code);
          if (witness.status !== "proven") {
            rejected.packageWitness++;
            continue;
          }
          candidates.push({candidate, proof, witness});
        }
        candidates.sort((left, right) =>
          left.proof.excludedAssignments / left.proof.rows -
            right.proof.excludedAssignments / right.proof.rows ||
          right.candidate.informationStrength -
            left.candidate.informationStrength ||
          left.candidate.signature.localeCompare(
            right.candidate.signature));
        for (const entry of candidates) {
          if (++finalizations >
              SEARCH_LIMITS.generalReplacementFinalizations) break outer;
          const proposed = structuredClone(current);
          proposed[slot] = {...structuredClone(entry.candidate),
            packageNumber: old.packageNumber,
            packagePosition: old.packagePosition};
          context.selected.splice(0, context.selected.length,
            ...proposed);
          try {
            finalizeSelection();
            validateEnglish(context);
            verifyFinalPairwise(context, cache);
            if (!sameOtherHints(current, context.selected, slot)) {
              throw new Error("Andere Hinweise wurden verändert.");
            }
            const finalProof = provePrefixConditionedReplacement(previous,
              old, context.selected[slot], context.code.length);
            if (!finalProof) {
              throw new Error("Strenge lokale Implikation ging verloren.");
            }
            const after = packageCertificates(context.selected,
              context.code);
            if (after[packageIndex].status !== "proven" ||
                after.some((item, index) =>
                  statuses[index] === "proven" &&
                  item.status !== "proven")) {
              throw new Error("Positiver Paketzeuge ging verloren.");
            }
            const coverage = fullSetSensitivityMask(context.selected,
              context.code, telemetry);
            if ((originalCoverage & ~coverage) !== 0) {
              throw new Error("Abdeckungszeuge ging verloren.");
            }
            accepted.push({packageNumber: packageIndex + 1,
              slot: slot + 1, from: old.id,
              to: entry.candidate.id,
              excludedAssignments: finalProof.excludedAssignments,
              proofRows: finalProof.rows,
              witness: entry.witness.witness});
            improved = true;
            break outer;
          } catch {
            rejected.finalization++;
            context.selected.splice(0, context.selected.length,
              ...structuredClone(current));
          }
        }
        if (searchExhausted) break outer;
      }
    }
    if (!improved) break;
  }
  telemetry.generalPackageContent = {
    original: originalStatuses,
    final: packageCertificates(context.selected, context.code)
      .map(item => item.status),
    accepted, rejected, scans, proofs, finalizations};
}
function generateExtendedHintSet(input) {
  const configuration = policy.requireConfiguration(input);
  if (typeof input.seed !== "string" || input.seed.length < 1 ||
      input.seed.length > 256 || typeof input.solutionCode !== "string" ||
      input.solutionCode.length !== configuration.codeLength ||
      !/^\d+$/.test(input.solutionCode)) {
    throw new TypeError("Neue Lösung oder privater Seed ist ungültig.");
  }
  const policySeed = hash(`d203e-policy-seed|${input.seed}|` +
    `${configuration.profileId}|${configuration.packageCount}|` +
    configuration.codeLength);
  let realizedPlan;
  const startedAt = Date.now();
  const telemetry = {plans: 0, candidateOrders: 0, candidateChecks: 0,
    distinctnessProofs: 0, pairStates: 0, finalizedFailures: 0,
    maxChosen: 0, lastUnfilledTier: null, metaOffered: 0,
    metaSelected: 0, metaPaired: 0, metaFinalized: 0,
    metaWitnessesAvailable: 0, metaWitnessesAccepted: 0,
    sensitivityEvaluations: 0, coverageSwaps: 0,
    coverageSwapDetails: [],
    coverageRejected: 0, coverageWitnessedPositions: 0,
    coverageUnknownPositions: 0,
    phaseMs: {poolBuild: 0, selection: 0, finalization: 0,
      beginnerPasses: 0, validation: 0, internalMapping: 0}};
  const tier5Eligible = ["HARD", "VERY_HARD"].includes(configuration.profileId);
  let result;
  let selectorReturnedAt = null;
  const timingSink = phase => {
    if (phase === "poolReady") {
      telemetry.phaseMs.poolBuild = Date.now() - startedAt;
    } else if (phase === "selectorReturned") {
      selectorReturnedAt = Date.now();
    } else if (phase === "internalMappingComplete" &&
        selectorReturnedAt !== null) {
      telemetry.phaseMs.internalMapping =
        Date.now() - selectorReturnedAt;
    }
  };
  try {
  result = core.generateExtendedRankInternalHintSet({
    solutionCode: input.solutionCode, codeLength: configuration.codeLength,
    packageCount: configuration.packageCount, seed: input.seed,
    generatorVersion: policy.GENERATOR_VERSION,
    tier5Unlocked: tier5Eligible,
  }, (context, finalizeSelection) => {
    const cache = new Map();
    const sensitivityCache = new Map();
    let lastError;
    for (let planIndex = 0; planIndex < SEARCH_LIMITS.plans; planIndex++) {
      telemetry.plans++;
      const gate = context.tier5Available && planIndex <
        SEARCH_LIMITS.plans / 2;
      const plan = policy.planTierSlots({configuration,
        assignmentSeedHash: hash(`${policySeed}|plan-${planIndex}`),
        tier5Gate: gate});
      for (let order = 0; order < SEARCH_LIMITS.candidateOrders; order++) {
        telemetry.candidateOrders++;
        const seed = hash(`${policySeed}|${planIndex}|${order}`);
        const selectionStarted = Date.now();
        const selected = selectCandidates(context, plan, seed, order, cache,
          sensitivityCache, telemetry);
        if (!selected) {
          telemetry.phaseMs.selection += Date.now() - selectionStarted;
          continue;
        }
        const paired = pairCandidates(context, selected, seed, order,
          telemetry);
        telemetry.phaseMs.selection += Date.now() - selectionStarted;
        if (!paired) continue;
        context.selected.splice(0, context.selected.length,
          ...structuredClone(paired));
        try {
          const finalizationStarted = Date.now();
          let finalized;
          try { finalized = finalizeSelection(); }
          finally {
            telemetry.phaseMs.finalization +=
              Date.now() - finalizationStarted;
          }
          const validationStarted = Date.now();
          validateEnglish(context);
          telemetry.phaseMs.validation += Date.now() - validationStarted;
          if (["VERY_EASY", "EASY"].includes(configuration.profileId)) {
            context.quality = {cache};
            const beginnerStarted = Date.now();
            try {
              finalized = ranked.selectBeginnerPasses(context, plan,
                finalized, seed, finalizeSelection, 3).selected;
            } finally {
              telemetry.phaseMs.beginnerPasses +=
                Date.now() - beginnerStarted;
            }
            const secondValidationStarted = Date.now();
            validateEnglish(context);
            telemetry.phaseMs.validation +=
              Date.now() - secondValidationStarted;
          }
          if (!repairFinalCoverage(context, finalizeSelection,
              cache, telemetry)) {
            telemetry.coverageRejected++;
            throw new Error("Codeposition ohne positiven Abhängigkeitszeugen.");
          }
          improvePackageProgress(context, finalizeSelection,
            cache, telemetry);
          improveGeneralPackageContent(context, finalizeSelection,
            cache, telemetry);
          const repaired = packageRepair.repairPackageContent(
            context, finalizeSelection,
            {compatible, validateEnglish, verifyFinalPairwise,
              previousProofs: cache,
              fullSetSensitivityMask, allMask,
              packageStatuses: telemetry.generalPackageContent?.final ||
                telemetry.packageProgress?.final});
          if (repaired.repaired) telemetry.v4Repair =
            {witness: repaired.witness,
              metrics: repaired.metrics};
          else if (repaired.metrics?.prefixSessions)
            telemetry.v4Repair = {status: repaired.reason,
              metrics: repaired.metrics};
          finalized = context.selected;
          const pairwiseStarted = Date.now();
          verifyFinalPairwise(context, cache);
          telemetry.phaseMs.validation += Date.now() - pairwiseStarted;
          const sensitivity = fullSetSensitivityMask(context.selected,
            context.code, telemetry);
          if (!selected.meta &&
              sensitivity !== allMask(context.code.length)) {
            telemetry.coverageRejected++;
            throw new Error("Codeposition ohne positiven Abhängigkeitszeugen.");
          }
          telemetry.coverageWitnessedPositions = bitCount(sensitivity);
          telemetry.coverageUnknownPositions = context.code.length -
            bitCount(sensitivity);
          if (selected.meta) telemetry.metaFinalized++;
          realizedPlan = plan;
          return finalized;
        } catch (error) {
          telemetry.finalizedFailures++;
          lastError = error;
        }
      }
    }
    throw new Error("Kein vollständiger Satz innerhalb der festen Suchgrenzen: " +
      (lastError?.message || "keine zulässige Auswahl oder Paarung"));
  }, timingSink);
  } catch (error) {
    error.searchTelemetry = Object.freeze({...telemetry,
      elapsedMs: Date.now() - startedAt});
    throw error;
  }
  const actualTierCounts = [1, 2, 3, 4, 5].map(tier =>
    result.hints.filter(hint => hint.tier === tier).length);
  if (!realizedPlan ||
      actualTierCounts.join(",") !== realizedPlan.tierCounts.join(",")) {
    throw new Error("Realisierter Tiermix weicht vom gewählten Profil ab.");
  }
  return Object.freeze({configuration, policyVersion: policy.POLICY_VERSION,
    profileId: configuration.profileId,
    requestedTierCounts: realizedPlan.tierCounts,
    actualTierCounts: Object.freeze(actualTierCounts), hintSet: result,
    searchTelemetry: Object.freeze({...telemetry,
      elapsedMs: Date.now() - startedAt})});
}

module.exports = Object.freeze({SEARCH_LIMITS, generateExtendedHintSet});

},
"prototypes/firebase-lock-attempt/functions/src/hints/gdevelop-generator-core-v2.cjs":function(module,exports,require){
"use strict";

// Automatisch aus dem einzigen aktiven T1–T5-Generatorblock der GDevelop-
// Arbeitsdatei extrahiert. Historische hintType-1/2-Zweige sind nicht enthalten.
// Quellblock SHA-256: a00cb14a16bd3f7a42bdfb93a3b6e8f68d94dcb5cd0b310679719621db0ee6d8

const CUBE_DIGITS = new Set([0, 1, 8]);
const FIBONACCI_DIGITS = new Set([0, 1, 2, 3, 5, 8]);
const PRIME_DIGITS = new Set([2, 3, 5, 7]);
const PRIME_SUMS = new Set([2, 3, 5, 7, 11, 13, 17]);
const COMPOSITE_DIGITS = new Set([4, 6, 8, 9]);
const POWER_OF_TWO_DIGITS = new Set([1, 2, 4, 8]);
const TRIANGULAR_DIGITS = new Set([0, 1, 3, 6]);
const DISTINCT_PRIME_SUM_DIGITS = new Set([5, 7, 8, 9]);
const FACTORIAL_DIGITS = new Set([1, 2, 6]);
const SQUARE_SUMS = new Set([0, 1, 4, 9, 16]);
const FIBONACCI_SUMS = new Set([0, 1, 2, 3, 5, 8, 13]);
const hintDistinctness = (() => {
const PRIME_DIGITS = new Set([2, 3, 5, 7]);
const SQUARE_DIGITS = new Set([0, 1, 4, 9]);
const CUBE_DIGITS = new Set([0, 1, 8]);
const COMPOSITE_DIGITS = new Set([4, 6, 8, 9]);
const POWER_OF_TWO_DIGITS = new Set([1, 2, 4, 8]);
const FIBONACCI_DIGITS = new Set([0, 1, 2, 3, 5, 8]);
const DISTINCT_PRIME_SUM_DIGITS = new Set([5, 7, 8, 9]);
const FACTORIAL_DIGITS = new Set([1, 2, 6]);
const TRIANGULAR_DIGITS = new Set([0, 1, 3, 6]);
const SQUARE_SUMS = new Set([0, 1, 4, 9, 16]);
const FIBONACCI_SUMS = new Set([0, 1, 2, 3, 5, 8, 13]);
const PRIME_SUMS = new Set([2, 3, 5, 7, 11, 13, 17]);

const relation = (first, second) => first > second ? "größer" : first < second ? "kleiner" : "gleich";
const digitSum = (value) => String(value).split("").reduce((sum, digit) => sum + Number(digit), 0);
const statedEvenParity = (text) => {
  if (typeof text !== "string") return null;
  const even = /\bgerade\b/u.test(text.toLowerCase());
  const odd = /\bungerade\b/u.test(text.toLowerCase());
  return even === odd ? null : even;
};
const relationFromHint = (hint) => {
  if (["größer", "kleiner", "gleich"].includes(hint.details?.comparison)) return hint.details.comparison;
  const text = String(hint.text || "").toLowerCase();
  if (text.includes("größer") || text.includes("mehr")) return "größer";
  if (text.includes("kleiner") || text.includes("weniger")) return "kleiner";
  return "gleich";
};

function analyzeCode(code) {
  const indexed = code.map((value, position) => ({value, position}));
  const valuesFor = (predicate) => code.filter(predicate);
  const firstPositionFor = (predicate) => indexed.find((entry) => predicate(entry.value))?.position ?? null;
  const lastPositionFor = (predicate) => indexed.slice().reverse().find((entry) => predicate(entry.value))?.position ?? null;
  const primes = valuesFor((value) => PRIME_DIGITS.has(value));
  const evens = valuesFor((value) => value % 2 === 0);
  const odds = valuesFor((value) => value % 2 !== 0);
  const sorted = code.slice().sort((first, second) => first - second);
  const minimum = sorted[0];
  const maximum = sorted.at(-1);
  const median = sorted[5];
  const firstPrime = firstPositionFor((value) => PRIME_DIGITS.has(value));
  const lastPrime = lastPositionFor((value) => PRIME_DIGITS.has(value));
  const firstEven = firstPositionFor((value) => value % 2 === 0);
  const lastOdd = lastPositionFor((value) => value % 2 !== 0);
  const firstMinimum = code.indexOf(minimum);
  const lastMinimum = code.lastIndexOf(minimum);
  const firstMaximum = code.indexOf(maximum);
  const lastMaximum = code.lastIndexOf(maximum);
  return {
    minimum,
    maximum,
    median,
    medianFirst: code.indexOf(median),
    smallestEven: evens.length ? Math.min(...evens) : null,
    largestPrime: primes.length ? Math.max(...primes) : null,
    largestOdd: odds.length ? Math.max(...odds) : null,
    firstPrime,
    lastPrime,
    afterFirstPrime: Number.isInteger(firstPrime) && firstPrime < 10 ? firstPrime + 1 : null,
    beforeLastPrime: Number.isInteger(lastPrime) && lastPrime > 0 ? lastPrime - 1 : null,
    firstEven,
    lastOdd,
    firstMinimum,
    lastMinimum,
    firstMaximum,
    lastMaximum,
  };
}

function patternFrequencies(values) {
  const frequencies = new Map();
  for (const value of values) frequencies.set(value, (frequencies.get(value) || 0) + 1);
  return [...frequencies.values()];
}

function visibleHintIsTrue(hint, code) {
  const id = hint.id;
  const p = hint.internalPositions;
  const d = hint.details || {};
  const v = p.map((position) => code[position]);
  const text = String(hint.text || "").toLowerCase();

  if (/^T1-DIGIT-\d{2}$/.test(id)) {
    const digit = Number(id.slice(-2));
    return id === "T1-DIGIT-06" ? v[0] === 6 && v[1] === 3 : v[0] === digit;
  }
  if (id === "T1-01") {
    const even = statedEvenParity(hint.text);
    return even === null ? null : (v[0] % 2 === 0) === even;
  }
  if (id === "T1-02") return PRIME_DIGITS.has(v[0]) === !text.includes("keine primzahl");
  if (id === "T1-03") return SQUARE_DIGITS.has(v[0]) === !text.includes("keine quadratzahl");
  if (id === "T1-05") return COMPOSITE_DIGITS.has(v[0]) === (d.composite === true);
  if (id === "T1-06") return POWER_OF_TWO_DIGITS.has(v[0]) === (d.powerOfTwo === true);
  if (id === "T1-07") return CUBE_DIGITS.has(v[0]) === (d.cube === true);
  if (id === "T1-08") return FIBONACCI_DIGITS.has(v[0]) === !text.includes("nicht zur fibonacci");
  if (id === "T1-09") return (v[0] % 2 === (p[0] + 1) % 2) === (d.samePositionParity === true);
  if (id === "T1-12") return DISTINCT_PRIME_SUM_DIGITS.has(v[0]) === (d.distinctPrimeSum === true);
  if (id === "T1-13") return FACTORIAL_DIGITS.has(v[0]) === (d.factorial === true);
  if (id === "T1-14") return TRIANGULAR_DIGITS.has(v[0]) === (d.triangular === true);

  if (id === "T2-01") return relation(v[0], v[1]) === relationFromHint(hint);
  if (id === "T2-02") return SQUARE_SUMS.has(v[0] + v[1]) === (d.square === true);
  if (id === "T2-03") return SQUARE_DIGITS.has(Math.abs(v[0] - v[1])) === (d.square === true);
  if (id === "T2-04") return (v[0] % 2 === v[1] % 2) === (d.sameParity === true);
  if (id === "T2-06") {
    const even = statedEvenParity(hint.text);
    return even === null ? null :
      (Math.abs(v[0] - v[1]) % 2 === 0) === even;
  }
  if (id === "T2-07") return Number.isInteger(Math.sqrt(v[0] * v[1])) === (d.square === true);
  if (id === "T2-08") return Math.abs(v[0] - v[1]) === 1;
  if (id === "T2-09") return d.ratioDirection === "double" ? v[0] === 2 * v[1] : d.ratioDirection === "half" ? 2 * v[0] === v[1] : false;
  if (id === "T2-10") return FIBONACCI_SUMS.has(v[0] + v[1]) === (d.fibonacci === true);
  if (id === "T2-11") return v[1] !== 0 && v[0] % v[1] === 0;
  if (id === "T2-12") {
    const number = 10 * v[0] + v[1];
    const twoDigitSquare = v[0] !== 0 && Number.isInteger(Math.sqrt(number));
    return twoDigitSquare === (d.square === true);
  }
  if (id === "T2-13") return PRIME_DIGITS.has(Math.abs(v[0] - v[1])) === !text.includes("keine primzahl");
  if (id === "T2-14") return (v[0] === v[1]) === (d.equal === true);
  if (id === "T2-15") return Math.abs(v[0] - 5) === Math.abs(v[1] - 5);
  if (id === "T2-16") return PRIME_SUMS.has(v[0] + v[1]) === (d.prime === true);

  if (id === "T3-01") return relation(v[0] + v[1], v[2]) === d.comparison;
  if (id === "T3-02") return text.includes("kleiner") ? v[0] > v[1] && v[1] > v[2] : v[0] < v[1] && v[1] < v[2];
  if (id === "T3-03") return relation(v[0] * v[1], v[2]) === d.comparison;
  if (id === "T3-04") return new Set(v).size === 2 && patternFrequencies(v).includes(2);
  if (id === "T3-06") return v[1] - v[0] !== 0 && v[1] - v[0] === v[2] - v[1];
  if (id === "T3-07") return v[1] < v[0] && v[0] < v[2];
  if (id === "T3-08") return relation(Math.abs(v[0] - v[1]), v[2]) === d.comparison;
  if (id === "T3-09") {
    const palindrome = v[0] !== 0 && v[0] === v[2];
    return palindrome === (d.palindrome === true);
  }
  if (id === "T3-10") return v[0] + v[1] === v[2];
  if (id === "T3-11") return Math.abs(v[0] - v[1]) === v[2];
  if (id === "T3-12") return v[0] + v[1] === 2 * v[2];
  if (id === "T3-13") return PRIME_DIGITS.has(Math.max(...v) - Math.min(...v)) === (d.prime === true);
  if (id === "T3-14") {
    const sides = v.slice().sort((first, second) => first - second);
    return sides[0] > 0 && sides[0] + sides[1] > sides[2];
  }
  if (id === "T3-15") return ((v[0] + v[1] + v[2]) % 2 === 0) === (d.parity === "even");
  if (id === "T3-16") return (v[0] * v[1]) % 10 === v[2];
  if (id === "T3-17") return (d.variant === "productPlus" ? v[2] + v[0] * v[1] : v[2] - v[0] * v[1]) === d.result;
  if (id === "T3-18") return (d.variant === "groupedPlus" ? v[0] + v[1] : v[0] - v[1]) * v[2] === d.result;
  if (id === "T3-19") return digitSum(v[0] * v[1]) === v[2];
  if (id === "T3-20") return v[0] !== 0 && (10 * v[0] + v[1]) % d.divisor === 0;

  if (id === "T4-01") return v.every((value, index) => value === v[v.length - 1 - index]);
  if (id === "T4-02") return relation(v[0] + v[1], v[2] + v[3]) === relationFromHint(hint);
  if (id === "T4-03") return ((v[0] + v[1]) % 2 === (v[2] + v[3]) % 2) === (d.sameParity === true);
  if (id === "T4-04") return v[0] === v[2] && v[1] === v[3] && v[0] !== v[1];
  if (id === "T4-05") return Math.abs(v[0] - v[1]) > 0 && Math.abs(v[0] - v[1]) === Math.abs(v[2] - v[3]);
  if (id === "T4-06") return relation(v[0] * v[1], v[2] * v[3]) === d.comparison;
  if (id === "T4-07") return v[0] === v[1] && v[2] === v[3] && v[0] !== v[2];
  if (id === "T4-08") {
    const first = d.firstGroup.reduce((sum, position) => sum + code[position], 0);
    const second = d.secondGroup.reduce((sum, position) => sum + code[position], 0);
    return first === second;
  }
  if (id === "T4-09") {
    const counts = patternFrequencies(v);
    return counts.filter((count) => count === 2).length === 1 && counts.every((count) => count === 1 || count === 2);
  }
  if (id === "T4-10") return v[0] === v[3] && v[1] === v[4] && v[2] === v[5] && new Set(v.slice(0, 3)).size >= 2;
  if (id === "T4-11") return v.slice(1).every((value, index) => v[index] < value);
  if (id === "T4-12") return v.slice(1).every((value, index) => v[index] > value);
  if (id === "T4-13") return v[1] - v[0] !== 0 && v.slice(1).every((value, index) => value - v[index] === v[1] - v[0]);
  if (id === "T4-14") {
    const first = d.firstGroup.reduce((sum, position) => sum + code[position], 0);
    const second = d.secondGroup.reduce((sum, position) => sum + code[position], 0);
    return d.relation === "mehr" ? first > second : first < second;
  }
  if (id === "T4-15") return code.filter((value) => value === v[0]).length === d.frequency;
  if (id === "T4-16") {
    const counts = patternFrequencies(v);
    return counts.filter((count) => count === 2).length === 2 && counts.every((count) => count === 1 || count === 2);
  }
  if (id === "T4-17") return new Set(v).size === v.length;
  if (id === "T4-18") return v[0] + v[5] === v[1] + v[4] && v[1] + v[4] === v[2] + v[3];
  if (id === "T4-19") return Math.abs(v[0] + v[1] - v[3] - v[4]) === v[2];
  if (id === "T4-20") {
    const odd = code.filter((value, index) => index % 2 === 0).reduce((sum, value) => sum + value, 0);
    const even = code.filter((value, index) => index % 2 === 1).reduce((sum, value) => sum + value, 0);
    return relation(odd, even) === d.comparison;
  }
  if (id === "T4-21") return v.slice(0, -1).reduce((sum, value) => sum + value, 0) % 10 === v.at(-1);
  if (id === "T4-22") {
    const counts = patternFrequencies(v);
    return counts.filter((count) => count === 3).length === 1 && counts.every((count) => count === 1 || count === 3);
  }
  if (id === "T4-23") {
    const left = v[2] + v[0] * v[1];
    const right = v[3] + v[4] * v[5];
    return relation(left, right) === d.comparison;
  }

  const global = analyzeCode(code);
  if (id === "T1-CODE-01") return Number.isInteger(global.largestPrime) && relation(global.largestPrime, v[0]) === d.comparison;
  if (id === "T1-CODE-02") return Number.isInteger(global.smallestEven) && relation(global.smallestEven, v[0]) === d.comparison;
  if (id === "T1-CODE-03") {
    const extremum = v[0] === global.maximum ? "maximum" : v[0] === global.minimum ? "minimum" : "neither";
    return extremum === d.extremum;
  }
  if (id === "T1-CODE-04") return relation(global.median, v[0]) === d.comparison;
  if (id === "T2-CODE-01") {
    const source = d.sourceKey === "smallestEven" ? global.smallestEven : d.sourceKey === "largestPrime" ? global.largestPrime : global.largestOdd;
    if (!Number.isInteger(source)) return false;
    return d.mode === "greaterBoth" ? source > v[0] && source > v[1] : d.mode === "lessBoth" ? source < v[0] && source < v[1] : v[0] < source && source < v[1];
  }
  if (id === "T2-CODE-03") {
    if (!Number.isInteger(global.largestPrime)) return false;
    return d.mode === "bothGreater" ? v[0] > global.largestPrime && v[1] > global.largestPrime : d.mode === "bothSmaller" ? v[0] < global.largestPrime && v[1] < global.largestPrime : v[0] < global.largestPrime && global.largestPrime < v[1];
  }
  if (id === "T2-CODE-04") {
    const extremum = d.extremum === "minimum" ? global.minimum : global.maximum;
    const first = Math.abs(v[0] - extremum);
    const second = Math.abs(v[1] - extremum);
    return first > 0 && first < second;
  }
  if (id === "T3-CODE-01" || id === "T3-CODE-02") {
    const neighbor = id === "T3-CODE-01" ? global.afterFirstPrime : global.beforeLastPrime;
    if (!Number.isInteger(neighbor)) return false;
    const value = code[neighbor];
    return (value % 2 === 0 ? "even" : "odd") === d.parity && relation(value, code[d.targetPosition]) === d.comparison;
  }
  if (id === "T3-CODE-03") {
    const occurrence = d.occurrenceLabel.includes("ersten Vorkommen der kleinsten") ? global.firstMinimum : d.occurrenceLabel.includes("letzten Vorkommen der kleinsten") ? global.lastMinimum : d.occurrenceLabel.includes("ersten Vorkommen der größten") ? global.firstMaximum : global.lastMaximum;
    const neighbor = d.directionLabel === "vor" ? occurrence - 1 : occurrence + 1;
    return neighbor >= 0 && neighbor < 11 && relation(code[neighbor], code[d.targetPosition]) === d.comparison;
  }
  if (id === "T3-CODE-04") return Number.isInteger(global.afterFirstPrime) && Number.isInteger(global.beforeLastPrime) && relation(code[global.afterFirstPrime], code[global.beforeLastPrime]) === d.comparison;
  if (id === "T4-CODE-01") {
    const edgeMaximum = code[0] === global.maximum || code[10] === global.maximum;
    const abovePrimes = !Number.isInteger(global.largestPrime) || code[0] > global.largestPrime && code[10] > global.largestPrime;
    return !edgeMaximum && abovePrimes;
  }
  if (id === "T4-CODE-02") return Number.isInteger(global.afterFirstPrime) && Number.isInteger(global.smallestEven) && Number.isInteger(global.largestOdd) && global.smallestEven < code[global.afterFirstPrime] && code[global.afterFirstPrime] < global.largestOdd;
  if (id === "T4-CODE-03") return Number.isInteger(global.firstPrime) && global.firstPrime > 0 && Number.isInteger(global.lastPrime) && global.lastPrime < 10 && code[global.firstPrime - 1] + code[global.lastPrime + 1] === code[d.targetPosition];
  if (id === "T4-CODE-04") {
    if (!Number.isInteger(global.firstEven) || !Number.isInteger(global.lastOdd)) return false;
    const values = [code[global.firstEven], code[global.lastOdd], global.median];
    return d.direction === "ascending" ? values[0] < values[1] && values[1] < values[2] : values[0] > values[1] && values[1] > values[2];
  }
  if (id === "T4-CODE-05") return Number.isInteger(global.afterFirstPrime) && code[global.afterFirstPrime] === global.maximum - global.minimum;
  if (id === "T4-CODE-06") return global.minimum < code[0] && code[0] < global.maximum && global.minimum < code[10] && code[10] < global.maximum;
  if (id === "T4-CODE-07") return Number.isInteger(global.smallestEven) && Number.isInteger(global.largestPrime) && global.smallestEven < global.largestPrime && global.largestPrime < code[d.targetPosition];
  if (id === "T5-01") {
    const positions = d.rightVisiblePositions.map((position) => 11 - position);
    return relation(code[positions[0]], code[positions[1]]) === d.comparison;
  }
  if (id === "T5-02") {
    const divisor = v[2];
    return divisor > 1 && v[0] !== v[1] && v[0] % divisor > 0 && v[0] % divisor === v[1] % divisor;
  }
  if (id === "T5-03") {
    const positionsByKey = {
      afterFirstPrime: global.afterFirstPrime,
      beforeLastPrime: global.beforeLastPrime,
      firstEven: global.firstEven,
      lastOdd: global.lastOdd,
      afterFirstMinimum: global.firstMinimum < 10 ? global.firstMinimum + 1 : null,
      beforeLastMaximum: global.lastMaximum > 0 ? global.lastMaximum - 1 : null,
      medianFirstPosition: global.medianFirst,
    };
    const positions = d.derivationKeys.map((key) => positionsByKey[key]);
    if (positions.some((position) => !Number.isInteger(position))) return false;
    const values = positions.map((position) => code[position]);
    if (d.pattern === "arithmetic") return values[1] - values[0] !== 0 && values[1] - values[0] === values[2] - values[1];
    if (d.pattern === "ascending") return values[0] < values[1] && values[1] < values[2];
    if (d.pattern === "descending") return values[0] > values[1] && values[1] > values[2];
    return d.pattern === "firstThirdEqual" && values[0] === values[2] && values[0] !== values[1];
  }
  if (id === "T5-04") return true;
  return null;
}
// V2 excludes relational clues that only restate parity of several positions.
// Single-digit properties and mixed mathematical clues remain available.
const EXCLUDED_IDS = new Set(["T2-04", "T2-06", "T3-15", "T4-03"]);
const LOCAL_IDS = new Set([
  ..."01 02 03 05 06 07 08 09 12 13 14".split(" ").map(n => `T1-${n}`),
  ...Array.from({length: 10}, (_, n) => `T1-DIGIT-${String(n).padStart(2, "0")}`),
  ..."01 02 03 04 06 07 08 09 10 11 12 13 14 15 16".split(" ").map(n => `T2-${n}`),
  ..."01 02 03 04 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20".split(" ").map(n => `T3-${n}`),
  ..."01 02 03 04 05 06 07 08 09 10 11 12 13 14 16 17 18 19 21 22 23".split(" ").map(n => `T4-${n}`),
  "T5-01", "T5-02",
]);
const MAX_EXACT_POSITIONS = 4;
const MAX_SAMPLED_ROWS = 1024;

function localPositions(hint) {
  if (!hint || !LOCAL_IDS.has(hint.id) ||
      !Array.isArray(hint.internalPositions) ||
      hint.internalPositions.some(position => !Number.isInteger(position) ||
        position < 0 || position > 10)) return null;
  return [...new Set(hint.internalPositions)].sort((a, b) => a - b);
}

function truth(hint, code) {
  try { return visibleHintIsTrue(hint, code); }
  catch { return null; }
}

// A pair is certified only by actual counterexamples in both directions.
// Exhaustion proves implication for small local supports. Beyond four positions
// the search is bounded; missing evidence means "unknown", never "distinct".
function certifyDistinct(first, second, sourceCode, maxRows = MAX_SAMPLED_ROWS) {
  if (!first || !second || !Array.isArray(sourceCode) ||
      sourceCode.length !== 11 || !Number.isInteger(maxRows) ||
      maxRows < 1 || maxRows > MAX_SAMPLED_ROWS) return null;
  if (first.id === "T5-04" || second.id === "T5-04" ||
      first.intentionallyFalse || second.intentionallyFalse) return null;
  if (truth(first, sourceCode) !== true ||
      truth(second, sourceCode) !== true) return null;
  const firstLocal = localPositions(first);
  const secondLocal = localPositions(second);
  const support = firstLocal && secondLocal ?
    [...new Set([...firstLocal, ...secondLocal])].sort((a, b) => a - b) : null;
  const exact = support !== null && support.length <= MAX_EXACT_POSITIONS;
  const rows = exact ? 10 ** support.length : maxRows;
  let firstOnly = null;
  let secondOnly = null;
  let state = 2166136261;
  for (const character of [first.signature, second.signature].sort().join("|")) {
    state = Math.imul(state ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  const code = sourceCode.slice();
  for (let row = 0; row < rows; row++) {
    if (exact) {
      let value = row;
      for (const position of support) {
        code[position] = value % 10;
        value = Math.floor(value / 10);
      }
    } else if (row < 110) {
      code.splice(0, 11, ...sourceCode);
      code[Math.floor(row / 10) % 11] = row % 10;
    } else {
      for (let position = 0; position < 11; position++) {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        code[position] = (state >>> 0) % 10;
      }
    }
    const left = truth(first, code);
    const right = truth(second, code);
    if (typeof left !== "boolean" || typeof right !== "boolean") return null;
    if (left && !right && firstOnly === null) firstOnly = code.slice();
    if (right && !left && secondOnly === null) secondOnly = code.slice();
    if (firstOnly && secondOnly) return Object.freeze({
      firstOnly: Object.freeze(firstOnly),
      secondOnly: Object.freeze(secondOnly), rowsChecked: row + 1, exact,
    });
  }
  return null;
}

function pairIsDistinct(first, second, code, cache) {
  const key = [first.signature, second.signature].sort().join("|");
  if (!cache.has(key)) cache.set(key, certifyDistinct(first, second, code));
  return cache.get(key) !== null;
}
return Object.freeze({EXCLUDED_IDS, pairIsDistinct});
})();

const L054_DIVISORS = Object.freeze([2, 3, 4, 5, 6, 8, 9]);
const L054_HINT_IDS = new Set(['T3-17', 'T3-18', 'T3-19', 'T3-20', 'T4-23']);
const L054_MAX_RESULT = 45;
const L054_EXACT_RESULT_COUNTS = Object.freeze({ productPlus: Array(163).fill(0), productMinus: Array(163).fill(0), groupedPlus: Array(163).fill(0), groupedMinus: Array(163).fill(0) });
for (let first = 0; first <= 9; first++) {
  for (let second = 0; second <= 9; second++) {
    for (let third = 0; third <= 9; third++) {
      const results = { productPlus: third + first * second, productMinus: third - first * second, groupedPlus: (first + second) * third, groupedMinus: (first - second) * third };
      for (const variant of Object.keys(results)) if (results[variant] >= 0) L054_EXACT_RESULT_COUNTS[variant][results[variant]]++;
    }
  }
}
let l054ProductDigitSumAssignments = 0;
for (let first = 0; first <= 9; first++) {
  for (let second = 0; second <= 9; second++) {
    const product = first * second;
    const sum = l054DigitSum(product);
    if (product >= 10 && sum <= 9) l054ProductDigitSumAssignments++;
  }
}
const L054_PRODUCT_DIGIT_SUM_EXCLUSION_PERCENT = l054ExclusionPercent(l054ProductDigitSumAssignments, 1000);
const l054MixedValueCounts = Array(91).fill(0);
for (let first = 0; first <= 9; first++) for (let second = 0; second <= 9; second++) for (let third = 0; third <= 9; third++) l054MixedValueCounts[first * second + third]++;
let l054MixedLessAssignments = 0;
for (let left = 0; left < l054MixedValueCounts.length; left++) for (let right = left + 1; right < l054MixedValueCounts.length; right++) l054MixedLessAssignments += l054MixedValueCounts[left] * l054MixedValueCounts[right];
const L054_MIXED_EXCLUSION_PERCENT = l054ExclusionPercent(l054MixedLessAssignments, 1000000);
const DIGIT_HINT_DEFINITIONS = Object.freeze([
  Object.freeze({ id: 'T1-DIGIT-00', digit: 0, propertyKey: 'additiveIdentity', expression: '0', germanProperty: 'das neutrale Element der Addition' }),
  Object.freeze({ id: 'T1-DIGIT-01', digit: 1, propertyKey: 'multiplicativeIdentity', expression: '1', germanProperty: 'das neutrale Element der Multiplikation' }),
  Object.freeze({ id: 'T1-DIGIT-02', digit: 2, propertyKey: 'onlyEvenPrime', expression: '2', germanProperty: 'die einzige gerade Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-03', digit: 3, propertyKey: 'smallestOddPrime', expression: '3', germanProperty: 'die kleinste ungerade Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-04', digit: 4, propertyKey: 'squareOfSmallestPrime', expression: '2² = 4', germanProperty: 'das Quadrat der kleinsten Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-05', digit: 5, propertyKey: 'onlyOddPrimeDivisorOfTen', expression: '10 : 5 = 2', germanProperty: 'die einzige ungerade Primzahl, die ein Teiler von 10 ist' }),
  Object.freeze({ id: 'T1-DIGIT-06', digit: 6, propertyKey: 'factorialOfThree', expression: '3! = 6', sourceDigit: 3 }),
  Object.freeze({ id: 'T1-DIGIT-07', digit: 7, propertyKey: 'largestSingleDigitPrime', expression: '7', germanProperty: 'die größte einstellige Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-08', digit: 8, propertyKey: 'cubeOfSmallestPrime', expression: '2³ = 8', germanProperty: 'der Kubus der kleinsten Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-09', digit: 9, propertyKey: 'squareOfSmallestOddPrime', expression: '3² = 9', germanProperty: 'das Quadrat der kleinsten ungeraden Primzahl' })
]);
const DIGIT_HINT_BY_DIGIT = new Map(DIGIT_HINT_DEFINITIONS.map(definition => [definition.digit, definition]));
const DIGIT_HINT_IDS = new Set(DIGIT_HINT_DEFINITIONS.map(definition => definition.id));
const ORDINAL_NOMINATIVE = ['', 'erste', 'zweite', 'dritte', 'vierte', 'fünfte', 'sechste', 'siebte', 'achte', 'neunte', 'zehnte', 'elfte'];
const ORDINAL_DATIVE = ['', 'ersten', 'zweiten', 'dritten', 'vierten', 'fünften', 'sechsten', 'siebten', 'achten', 'neunten', 'zehnten', 'elften'];

function ordinal(position, grammaticalForm) {
  if (!Number.isInteger(position) || position < 1 || position > 11) throw new Error('Ungültige sichtbare Position für eine deutsche Ordnungszahl: ' + position);
  return grammaticalForm === 'dative' ? ORDINAL_DATIVE[position] : ORDINAL_NOMINATIVE[position];
}

function joinGerman(values) {
  if (values.length === 0) return '';
  if (values.length === 1) return values[0];
  return values.slice(0, -1).join(', ') + ' und ' + values[values.length - 1];
}

function positionList(positions) {
  const labels = positions.map(position => 'Position ' + (position + 1));
  if (labels.length === 1) return labels[0];
  return labels.slice(0, -1).join(', ') + ' und ' + labels[labels.length - 1];
}

function relation(valueA, valueB) {
  if (valueA > valueB) return 'größer';
  if (valueA < valueB) return 'kleiner';
  return 'gleich';
}

function comparisonText(code, positions) {
  const first = positions[0];
  const second = positions[1];
  const comparison = relation(code[first], code[second]);
  if (comparison === 'gleich') {
    return 'Die Ziffern an den Positionen ' + (first + 1) + ' und ' + (second + 1) + ' sind gleich.';
  }
  return 'Die Ziffer an Position ' + (first + 1) + ' ist ' + comparison + ' als die an Position ' + (second + 1) + '.';
}

function digitHintText(definition, positions) {
  if (definition.id === 'T1-DIGIT-06') return 'Die Ziffer an Position ' + (positions[0] + 1) + ' ist die Fakultät der Ziffer an Position ' + (positions[1] + 1) + '.';
  return 'Die Ziffer an Position ' + (positions[0] + 1) + ' ist ' + definition.germanProperty + '.';
}

function tier1ParityText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (code[positions[0]] % 2 === 0 ? 'gerade.' : 'ungerade.');
}

function tier1PrimeText(code, positions) {
  const isPrime = [2, 3, 5, 7].includes(code[positions[0]]);
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (isPrime ? 'eine Primzahl.' : 'keine Primzahl.');
}

function tier1SquareText(code, positions) {
  const isSquare = [0, 1, 4, 9].includes(code[positions[0]]);
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (isSquare ? 'eine Quadratzahl.' : 'keine Quadratzahl.');
}

function tier1CompositeText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (COMPOSITE_DIGITS.has(code[positions[0]]) ? 'eine zusammengesetzte Zahl.' : 'keine zusammengesetzte Zahl.');
}

function tier1PowerOfTwoText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (POWER_OF_TWO_DIGITS.has(code[positions[0]]) ? 'eine Zweierpotenz.' : 'keine Zweierpotenz.');
}

function tier1CubeText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (CUBE_DIGITS.has(code[positions[0]]) ? 'eine Kubikzahl.' : 'keine Kubikzahl.');
}

function tier1FibonacciText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' gehört ' + (FIBONACCI_DIGITS.has(code[positions[0]]) ? 'zur Fibonacci-Folge.' : 'nicht zur Fibonacci-Folge.');
}

function tier1PositionParityText(code, positions) {
  const sameParity = code[positions[0]] % 2 === (positions[0] + 1) % 2;
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' hat ' + (sameParity ? 'dieselbe Parität wie' : 'eine andere Parität als') + ' ihre Positionsnummer.';
}

function tier1DistinctPrimeSumText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' lässt sich ' + (DISTINCT_PRIME_SUM_DIGITS.has(code[positions[0]]) ? '' : 'nicht ') + 'als Summe zweier verschiedener Primzahlen schreiben.';
}

function tier1FactorialText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (FACTORIAL_DIGITS.has(code[positions[0]]) ? 'eine Fakultätszahl.' : 'keine Fakultätszahl.');
}

function tier1TriangularText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (TRIANGULAR_DIGITS.has(code[positions[0]]) ? 'eine Dreieckszahl.' : 'keine Dreieckszahl.');
}

function tier2SumSquareText(code, positions) {
  const sum = code[positions[0]] + code[positions[1]];
  return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (SQUARE_SUMS.has(sum) ? 'eine Quadratzahl.' : 'keine Quadratzahl.');
}

function tier2DifferenceSquareText(code, positions) {
  const difference = Math.abs(code[positions[0]] - code[positions[1]]);
  return 'Der Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (SQUARE_SUMS.has(difference) ? 'eine Quadratzahl.' : 'keine Quadratzahl.');
}

function tier2ParityText(code, positions) {
  const sameParity = code[positions[0]] % 2 === code[positions[1]] % 2;
  return 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' haben ' + (sameParity ? 'dieselbe' : 'unterschiedliche') + ' Parität.';
}

function tier2DifferenceParityText(code, positions) {
  const difference = Math.abs(code[positions[0]] - code[positions[1]]);
  return 'Der Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (difference % 2 === 0 ? 'gerade.' : 'ungerade.');
}

function tier2ProductSquareText(code, positions) {
  const product = code[positions[0]] * code[positions[1]];
  const isSquare = Number.isInteger(Math.sqrt(product));
  return 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (isSquare ? 'eine Quadratzahl.' : 'keine Quadratzahl.');
}

function tier2NeighborText(positions) {
  return 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' liegen auf dem Zahlenstrahl direkt nebeneinander.';
}

function tier2DoubleHalfText(code, positions) {
  const first = code[positions[0]];
  const second = code[positions[1]];
  if (first === second * 2) return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist doppelt so groß wie die Zahl an Position ' + (positions[1] + 1) + '.';
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist halb so groß wie die Zahl an Position ' + (positions[1] + 1) + '.';
}

function tier2SumFibonacciText(code, positions) {
  const sum = code[positions[0]] + code[positions[1]];
  return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (FIBONACCI_SUMS.has(sum) ? 'eine Fibonacci-Zahl.' : 'keine Fibonacci-Zahl.');
}

function tier2DivisibilityText(positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' lässt sich ohne Rest durch die Zahl an Position ' + (positions[1] + 1) + ' teilen.';
}

function tier2ComposedSquareText(code, positions) {
  const number = code[positions[0]] * 10 + code[positions[1]];
  const isSquare = Number.isInteger(Math.sqrt(number));
  return 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' bilden in dieser Reihenfolge ' + (isSquare ? 'eine zweistellige Quadratzahl.' : 'keine zweistellige Quadratzahl.');
}

function tier2DifferencePrimeText(code, positions) {
  const difference = Math.abs(code[positions[0]] - code[positions[1]]);
  return 'Der Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (PRIME_DIGITS.has(difference) ? 'eine Primzahl.' : 'keine Primzahl.');
}

function tier2EqualityText(code, positions) {
  return 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' sind ' + (code[positions[0]] === code[positions[1]] ? 'gleich.' : 'verschieden.');
}

function tier2MirrorDistanceText(positions) {
  return 'Die Zahlen an den spiegelbildlichen Positionen ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' liegen gleich weit von der 5 entfernt.';
}

function tier2SumPrimeText(code, positions) {
  const sum = code[positions[0]] + code[positions[1]];
  return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (PRIME_SUMS.has(sum) ? 'eine Primzahl.' : 'keine Primzahl.');
}

function tier3SumComparisonText(code, positions) {
  const sum = code[positions[0]] + code[positions[1]];
  const comparison = relation(sum, code[positions[2]]);
  if (comparison === 'gleich') return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist gleich der Zahl an Position ' + (positions[2] + 1) + '.';
  return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + comparison + ' als die Zahl an Position ' + (positions[2] + 1) + '.';
}

function tier3OrderText(code, positions) {
  const ascending = code[positions[0]] < code[positions[1]] && code[positions[1]] < code[positions[2]];
  return 'Die Zahlen an ' + positionList(positions) + ' werden in dieser Reihenfolge ' + (ascending ? 'größer.' : 'kleiner.');
}

function tier3ProductComparisonText(code, positions) {
  const product = code[positions[0]] * code[positions[1]];
  const comparison = relation(product, code[positions[2]]);
  if (comparison === 'gleich') return 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist gleich der Zahl an Position ' + (positions[2] + 1) + '.';
  return 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + comparison + ' als die Zahl an Position ' + (positions[2] + 1) + '.';
}

function tier3ExactlyTwoEqualText(positions) {
  return 'Von den Zahlen an ' + positionList(positions) + ' sind genau zwei gleich.';
}

function tier3ArithmeticSequenceText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' bilden in dieser Reihenfolge eine gleichmäßige Zahlenfolge.';
}

function tier3StrictBetweenText(positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist größer als die Zahl an Position ' + (positions[1] + 1) + ' und kleiner als die Zahl an Position ' + (positions[2] + 1) + '.';
}

function tier3DifferenceComparisonText(code, positions) {
  const difference = Math.abs(code[positions[0]] - code[positions[1]]);
  const comparison = relation(difference, code[positions[2]]);
  if (comparison === 'gleich') return 'Der Abstand zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist gleich der Zahl an Position ' + (positions[2] + 1) + '.';
  return 'Der Abstand zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + comparison + ' als die Zahl an Position ' + (positions[2] + 1) + '.';
}

function tier3ComposedPalindromeText(code, positions) {
  const isPalindrome = code[positions[0]] === code[positions[2]];
  return 'Die Zahlen an ' + positionList(positions) + ' bilden in dieser Reihenfolge ' + (isPalindrome ? 'eine dreistellige Palindromzahl.' : 'keine dreistellige Palindromzahl.');
}

function tier3ExactSumText(positions) {
  return 'Die Zahl an Position ' + (positions[2] + 1) + ' entspricht der Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + '.';
}

function tier3ExactDifferenceText(positions) {
  return 'Die Zahl an Position ' + (positions[2] + 1) + ' entspricht dem Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + '.';
}

function tier3AverageText(positions) {
  return 'Die Zahl an Position ' + (positions[2] + 1) + ' ist der Durchschnitt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + '.';
}

function tier3RangePrimeText(code, positions) {
  const values = positions.map(position => code[position]);
  const distance = Math.max(...values) - Math.min(...values);
  return 'Der Abstand zwischen der größten und der kleinsten Zahl an ' + positionList(positions) + ' ist ' + (PRIME_DIGITS.has(distance) ? 'eine Primzahl.' : 'keine Primzahl.');
}

function tier3TriangleText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' könnten die Seitenlängen eines Dreiecks bilden.';
}

function tier3SumParityText(code, positions) {
  const sum = positions.reduce((total, position) => total + code[position], 0);
  return 'Die Summe der Zahlen an ' + positionList(positions) + ' ist ' + (sum % 2 === 0 ? 'gerade.' : 'ungerade.');
}

function tier3ProductDigitText(positions) {
  return 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' endet auf die Zahl an Position ' + (positions[2] + 1) + '.';
}

function l054ExclusionPercent(validAssignments, domainSize) {
  return Number((100 * (1 - validAssignments / domainSize)).toFixed(2));
}

function l054ExactInformation(variant, result) {
  const counts = L054_EXACT_RESULT_COUNTS[variant];
  return counts && Number.isInteger(result) && result >= 0 && result < counts.length ? l054ExclusionPercent(counts[result], 1000) : 0;
}

function l054DigitSum(value) {
  return String(value).split('').reduce((sum, digit) => sum + Number(digit), 0);
}

function l054PointBeforeEvaluation(factorA, factorB, term, variant) {
  const result = variant === 'productPlus' ? term + factorA * factorB : variant === 'productMinus' ? term - factorA * factorB : NaN;
  const leftToRightResult = variant === 'productPlus' ? (term + factorA) * factorB : variant === 'productMinus' ? (term - factorA) * factorB : NaN;
  return { result, leftToRightResult, didacticallyValid: Number.isFinite(result) && result !== leftToRightResult };
}

function l054MixedComparisonEvaluation(code, positions) {
  const leftResult = code[positions[2]] + code[positions[0]] * code[positions[1]];
  const rightResult = code[positions[3]] + code[positions[4]] * code[positions[5]];
  const leftToRightLeftResult = (code[positions[2]] + code[positions[0]]) * code[positions[1]];
  const leftToRightRightResult = (code[positions[3]] + code[positions[4]]) * code[positions[5]];
  const comparison = relation(leftResult, rightResult);
  const leftToRightComparison = relation(leftToRightLeftResult, leftToRightRightResult);
  return { leftResult, rightResult, leftToRightLeftResult, leftToRightRightResult, comparison, leftToRightComparison, didacticallyValid: comparison !== 'gleich' && leftToRightComparison !== comparison };
}

function tier3PointBeforeText(positions, variant, result) {
  const operation = variant === 'productPlus' ? 'Summe' : 'Differenz';
  return 'Die ' + operation + ' aus der Ziffer an Position ' + (positions[2] + 1) + ' und dem Produkt der Ziffern an Position ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' beträgt ' + result + '.';
}

function tier3ParenthesesText(positions, variant, result) {
  const groupedOperation = variant === 'groupedPlus' ? 'Summe' : 'Differenz';
  return 'Das Produkt aus der Ziffer an Position ' + (positions[2] + 1) + ' und der ' + groupedOperation + ' der Ziffern an Position ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' beträgt ' + result + '.';
}

function tier3ProductDigitSumText(positions) {
  return 'Die Ziffer an Position ' + (positions[2] + 1) + ' entspricht der Quersumme des Produkts der Ziffern an Position ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + '.';
}

function tier3ComposedDivisibilityText(positions, divisor) {
  return 'Die Ziffern an Position ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' bilden in dieser Reihenfolge eine zweistellige Zahl, die durch ' + divisor + ' teilbar ist.';
}

function tier4MixedExpressionComparisonText(positions, comparison) {
  return 'Position ' + (positions[2] + 1) + ' + Position ' + (positions[0] + 1) + ' × Position ' + (positions[1] + 1) + ' ist ' + comparison + ' als Position ' + (positions[3] + 1) + ' + Position ' + (positions[4] + 1) + ' × Position ' + (positions[5] + 1) + '.';
}

function palindromeText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' ergeben in dieser Reihenfolge ein Palindrom.';
}

function pairSumComparisonText(code, positions) {
  const leftSum = code[positions[0]] + code[positions[1]];
  const rightSum = code[positions[2]] + code[positions[3]];
  const left = 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1);
  const right = 'die Zahlen an Position ' + (positions[2] + 1) + ' und Position ' + (positions[3] + 1);
  if (leftSum > rightSum) return left + ' ergeben zusammen mehr als ' + right + '.';
  if (leftSum < rightSum) return left + ' ergeben zusammen weniger als ' + right + '.';
  return left + ' ergeben dieselbe Summe wie ' + right + '.';
}

function tier4AbabText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' folgen in dieser Reihenfolge dem Muster A-B-A-B.';
}

function tier4EqualDistancesText(positions) {
  return 'Der Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist genauso groß wie der Unterschied zwischen den Zahlen an Position ' + (positions[2] + 1) + ' und Position ' + (positions[3] + 1) + '.';
}

function tier4PairSumParityText(code, positions) {
  const firstSum = code[positions[0]] + code[positions[1]];
  const secondSum = code[positions[2]] + code[positions[3]];
  const sameParity = firstSum % 2 === secondSum % 2;
  const firstPair = 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1);
  const secondPair = 'die Summe der Zahlen an Position ' + (positions[2] + 1) + ' und Position ' + (positions[3] + 1);
  return sameParity ? firstPair + ' und ' + secondPair + ' sind entweder beide gerade oder beide ungerade.' : firstPair + ' und ' + secondPair + ' besitzen unterschiedliche Parität; genau eine der beiden Summen ist gerade.';
}

function tier4ProductComparisonText(code, positions) {
  const firstProduct = code[positions[0]] * code[positions[1]];
  const secondProduct = code[positions[2]] * code[positions[3]];
  const comparison = relation(firstProduct, secondProduct);
  const firstPair = 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1);
  const secondPair = 'das Produkt der Zahlen an Position ' + (positions[2] + 1) + ' und Position ' + (positions[3] + 1);
  if (comparison === 'gleich') return firstPair + ' ist gleich ' + secondPair + '.';
  return firstPair + ' ist ' + comparison + ' als ' + secondPair + '.';
}

function tier4AabbText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' folgen in dieser Reihenfolge dem Muster A-A-B-B.';
}

function tier4EqualGroupSumsText(firstGroup, secondGroup) {
  return 'Die Zahlen an ' + positionList(firstGroup) + ' ergeben zusammen genauso viel wie die Zahlen an ' + positionList(secondGroup) + '.';
}

function tier4ExactlyOnePairText(positions) {
  return 'Unter den Zahlen an ' + positionList(positions) + ' kommt genau eine Zahl doppelt vor.';
}

function tier4AbcAbcText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' folgen in dieser Reihenfolge dem Muster A-B-C-A-B-C.';
}

function tier4StrictSequenceText(positions, direction) {
  return 'Die Zahlen an ' + positionList(positions) + ' werden in dieser Reihenfolge immer ' + (direction === 'ascending' ? 'größer.' : 'kleiner.');
}

function tier4ArithmeticSequenceText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' bilden in dieser Reihenfolge eine arithmetische Folge mit gleichbleibendem Abstand.';
}

function tier4GroupComparisonText(firstGroup, secondGroup, relationWord) {
  return 'Die Zahlen an ' + positionList(firstGroup) + ' ergeben zusammen ' + relationWord + ' als die Zahlen an ' + positionList(secondGroup) + '.';
}

function tier4CodeFrequencyText(positions, frequency) {
  const frequencyWords = ['', 'einmal', 'zweimal', 'dreimal', 'viermal', 'fünfmal', 'sechsmal', 'siebenmal', 'achtmal', 'neunmal', 'zehnmal', 'elfmal'];
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' kommt im gesamten Code genau ' + frequencyWords[frequency] + ' vor.';
}

function tier4TwoPairsText(positions) {
  return 'Unter den Zahlen an ' + positionList(positions) + ' befinden sich genau zwei unterschiedliche Zahlenpaare.';
}

function tier4AllDifferentText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' sind alle verschieden.';
}

function tier4ThreePairSumsText(positions) {
  return 'Bei den Positionen ' + positions.map(position => position + 1).join(', ') + ' ergeben die erste und letzte, die zweite und vorletzte sowie die beiden mittleren Zahlen jeweils dieselbe Summe.';
}

function tier4PairSumDifferenceText(positions) {
  return 'Die Zahl an Position ' + (positions[2] + 1) + ' entspricht dem Unterschied zwischen der Summe der Positionen ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' und der Summe der Positionen ' + (positions[3] + 1) + ' und ' + (positions[4] + 1) + '.';
}

function tier4OddEvenPositionSumText(code) {
  const oddPositionSum = code.filter((value, index) => index % 2 === 0).reduce((sum, value) => sum + value, 0);
  const evenPositionSum = code.filter((value, index) => index % 2 === 1).reduce((sum, value) => sum + value, 0);
  const comparison = relation(oddPositionSum, evenPositionSum);
  if (comparison === 'gleich') return 'Die Summe der Zahlen an ungeraden Positionen ist gleich der Summe der Zahlen an geraden Positionen.';
  return 'Die Summe der Zahlen an ungeraden Positionen ist ' + comparison + ' als die Summe der Zahlen an geraden Positionen.';
}

function tier4CheckDigitText(sourcePositions, targetPosition) {
  return 'Die Zahl an Position ' + (targetPosition + 1) + ' entspricht der letzten Ziffer der Summe der Zahlen an ' + positionList(sourcePositions) + '.';
}

function tier4ExactlyThreeEqualText(positions) {
  return 'Unter den Zahlen an ' + positionList(positions) + ' kommt genau eine Zahl dreimal vor.';
}

function analyzeCodewide(code) {
  const indexed = code.map((value, position) => ({ value, position }));
  const sortedValues = code.slice().sort((first, second) => first - second);
  const valuesFor = predicate => code.filter(predicate);
  const firstPositionFor = predicate => indexed.find(entry => predicate(entry.value))?.position ?? null;
  const lastPositionFor = predicate => indexed.slice().reverse().find(entry => predicate(entry.value))?.position ?? null;
  const primes = valuesFor(value => PRIME_DIGITS.has(value));
  const evenValues = valuesFor(value => value % 2 === 0);
  const oddValues = valuesFor(value => value % 2 !== 0);
  const minimum = sortedValues[0];
  const maximum = sortedValues[sortedValues.length - 1];
  const median = sortedValues[5];
  const firstPrimePosition = firstPositionFor(value => PRIME_DIGITS.has(value));
  const lastPrimePosition = lastPositionFor(value => PRIME_DIGITS.has(value));
  const firstEvenPosition = firstPositionFor(value => value % 2 === 0);
  const lastEvenPosition = lastPositionFor(value => value % 2 === 0);
  const firstOddPosition = firstPositionFor(value => value % 2 !== 0);
  const lastOddPosition = lastPositionFor(value => value % 2 !== 0);
  const before = position => Number.isInteger(position) && position > 0 ? position - 1 : null;
  const after = position => Number.isInteger(position) && position < code.length - 1 ? position + 1 : null;
  return {
    minimum,
    maximum,
    median,
    medianFirstPosition: code.indexOf(median),
    smallestPrime: primes.length > 0 ? Math.min(...primes) : null,
    largestPrime: primes.length > 0 ? Math.max(...primes) : null,
    smallestEven: evenValues.length > 0 ? Math.min(...evenValues) : null,
    largestEven: evenValues.length > 0 ? Math.max(...evenValues) : null,
    smallestOdd: oddValues.length > 0 ? Math.min(...oddValues) : null,
    largestOdd: oddValues.length > 0 ? Math.max(...oddValues) : null,
    hasPrime: primes.length > 0,
    hasEven: evenValues.length > 0,
    hasOdd: oddValues.length > 0,
    firstPrimePosition,
    lastPrimePosition,
    firstEvenPosition,
    lastEvenPosition,
    firstOddPosition,
    lastOddPosition,
    firstMinimumPosition: code.indexOf(minimum),
    lastMinimumPosition: code.lastIndexOf(minimum),
    firstMaximumPosition: code.indexOf(maximum),
    lastMaximumPosition: code.lastIndexOf(maximum),
    beforeFirstPrime: before(firstPrimePosition),
    afterFirstPrime: after(firstPrimePosition),
    beforeLastPrime: before(lastPrimePosition),
    afterLastPrime: after(lastPrimePosition)
  };
}

function comparisonVariants(subject, position, comparison) {
  const positionText = 'die Zahl an Position ' + (position + 1);
  const lowerSubject = subject.charAt(0).toLowerCase() + subject.slice(1);
  if (comparison === 'gleich') return [subject + ' entspricht ' + positionText + '.', 'An Position ' + (position + 1) + ' steht genau ' + lowerSubject + '.'];
  if (comparison === 'kleiner') return [subject + ' ist kleiner als ' + positionText + '.', 'Die Zahl an Position ' + (position + 1) + ' ist größer als ' + lowerSubject + '.'];
  return [subject + ' ist größer als ' + positionText + '.', 'Die Zahl an Position ' + (position + 1) + ' ist kleiner als ' + lowerSubject + '.'];
}

function codewideTextVariants(id, positions, details) {
  const p = index => positions[index] + 1;
  if (id === 'T1-CODE-01') return comparisonVariants('Die größte im Code vorkommende Primzahl', positions[0], details.comparison);
  if (id === 'T1-CODE-02') return comparisonVariants('Die kleinste gerade Zahl im Code', positions[0], details.comparison);
  if (id === 'T1-CODE-03') {
    if (details.extremum === 'maximum') return ['Die Zahl an Position ' + p(0) + ' ist die größte Zahl im gesamten Code.', 'An Position ' + p(0) + ' steht ein globaler Höchstwert des Codes.'];
    if (details.extremum === 'minimum') return ['Die Zahl an Position ' + p(0) + ' ist die kleinste Zahl im gesamten Code.', 'An Position ' + p(0) + ' steht ein globaler Tiefstwert des Codes.'];
    return ['Die Zahl an Position ' + p(0) + ' ist weder die größte noch die kleinste Zahl im Code.', 'Position ' + p(0) + ' enthält keinen globalen Extremwert des Codes.'];
  }
  if (id === 'T1-CODE-04') return comparisonVariants('Der Median aller Zahlen im Code', positions[0], details.comparison);
  if (id === 'T2-CODE-01') {
    const subject = details.subject;
    const lowerSubject = subject.charAt(0).toLowerCase() + subject.slice(1);
    if (details.mode === 'greaterBoth') return [subject + ' ist größer als die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.', 'Die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' sind beide kleiner als ' + lowerSubject + '.'];
    if (details.mode === 'lessBoth') return [subject + ' ist kleiner als die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.', 'Die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' sind beide größer als ' + lowerSubject + '.'];
    return [subject + ' ist größer als die Zahl an Position ' + p(0) + ', aber kleiner als die Zahl an Position ' + p(1) + '.', 'Zwischen den Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' liegt ' + lowerSubject + '.'];
  }
  if (id === 'T2-CODE-03') {
    if (details.mode === 'bothGreater') return ['Die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' sind beide größer als jede im Code vorkommende Primzahl.', 'Jede Primzahl des Codes ist kleiner als die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.'];
    if (details.mode === 'bothSmaller') return ['Die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' sind beide kleiner als die größte Primzahl im Code.', 'Die größte im Code vorkommende Primzahl übertrifft die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.'];
    return ['Die größte Primzahl im Code liegt zwischen den Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.', 'Die Zahl an Position ' + p(0) + ' ist kleiner und die Zahl an Position ' + p(1) + ' größer als die größte Primzahl im Code.'];
  }
  if (id === 'T2-CODE-04') return ['Die Zahl an Position ' + p(0) + ' liegt näher an der ' + details.extremumLabel + ' Zahl des Codes als die Zahl an Position ' + p(1) + '.', 'Der Abstand von Position ' + p(0) + ' zum globalen ' + details.extremumNoun + ' ist kleiner als der entsprechende Abstand von Position ' + p(1) + '.'];
  if (id === 'T3-CODE-01' || id === 'T3-CODE-02') {
    const location = id === 'T3-CODE-01' ? 'nach der ersten Primzahl von links' : 'vor der letzten Primzahl von links';
    const parity = details.parity === 'even' ? 'gerade' : 'ungerade';
    const relationWord = details.comparison === 'gleich' ? 'gleich der' : details.comparison + ' als die';
    return ['Unmittelbar ' + location + ' steht eine ' + parity + ' Zahl, die ' + relationWord + ' Zahl an Position ' + p(2) + ' ist.', 'Die ' + parity + ' Nachbarzahl unmittelbar ' + location + ' ist ' + relationWord + ' Zahl an Position ' + p(2) + '.'];
  }
  if (id === 'T3-CODE-03') {
    const relationWord = details.comparison === 'gleich' ? 'gleich der' : details.comparison + ' als die';
    return ['Unmittelbar ' + details.directionLabel + ' dem ' + details.occurrenceLabel + ' steht eine Zahl, die ' + relationWord + ' Zahl an Position ' + p(2) + ' ist.', 'Die Nachbarzahl direkt ' + details.directionLabel + ' dem ' + details.occurrenceLabel + ' ist ' + relationWord + ' Zahl an Position ' + p(2) + '.'];
  }
  if (id === 'T3-CODE-04') {
    const relationWord = details.comparison === 'gleich' ? 'gleich groß wie' : details.comparison + ' als';
    return ['Die Zahl unmittelbar nach der ersten Primzahl ist ' + relationWord + ' die Zahl unmittelbar vor der letzten Primzahl.', 'Der rechte Nachbar der ersten Primzahl ist ' + relationWord + ' der linke Nachbar der letzten Primzahl.'];
  }
  if (id === 'T4-CODE-01') return ['Weder die erste noch die letzte Zahl ist die größte Zahl im Code. Beide sind jedoch größer als jede im Code vorkommende Primzahl.', 'Die Randzahlen sind keine globalen Höchstwerte, übertreffen aber sämtliche Primzahlen des Codes.'];
  if (id === 'T4-CODE-02') return ['Die Zahl unmittelbar nach der ersten Primzahl ist größer als die kleinste gerade Zahl und kleiner als die größte ungerade Zahl im Code.', 'Der rechte Nachbar der ersten Primzahl liegt strikt zwischen der kleinsten geraden und der größten ungeraden Zahl des Codes.'];
  if (id === 'T4-CODE-03') return ['Die Zahl unmittelbar vor der ersten Primzahl und die Zahl unmittelbar nach der letzten Primzahl ergeben zusammen die Zahl an Position ' + p(2) + '.', 'Die Summe der beiden äußeren Primzahlnachbarn entspricht der Zahl an Position ' + p(2) + '.'];
  if (id === 'T4-CODE-04') {
    const direction = details.direction === 'ascending' ? 'streng aufsteigender' : 'streng absteigender';
    const verb = details.direction === 'ascending' ? 'werden nacheinander größer' : 'werden nacheinander kleiner';
    return ['Die erste gerade Zahl, die letzte ungerade Zahl und der Median des Codes stehen in ' + direction + ' Reihenfolge.', 'Erste gerade Zahl, letzte ungerade Zahl und Median ' + verb + '.'];
  }
  if (id === 'T4-CODE-05') return ['Die Zahl unmittelbar nach der ersten Primzahl entspricht dem Unterschied zwischen der größten und der kleinsten Zahl des Codes.', 'Der rechte Nachbar der ersten Primzahl ist genauso groß wie der Abstand der globalen Extremwerte.'];
  if (id === 'T4-CODE-06') return ['Weder Position 1 noch Position 11 enthält das Maximum oder Minimum des Codes. Beide Zahlen liegen strikt zwischen diesen Extremwerten.', 'Beide Randzahlen befinden sich wertmäßig zwischen dem globalen Minimum und Maximum, ohne selbst ein Extremwert zu sein.'];
  if (id === 'T4-CODE-07') return ['Im Code gilt: Die kleinste gerade Ziffer ist kleiner als die größte Primzahl, und diese ist kleiner als die Ziffer an Position ' + p(0) + '.', 'Die kleinste gerade Ziffer im Code ist kleiner als die größte Primzahl; diese wiederum ist kleiner als die Ziffer an Position ' + p(0) + '.'];
  return [];
}

function makeCandidate(tier, id, positions, text, signature, options) {
  const candidateOptions = options || {};
  return {
    tier,
    id,
    internalPositions: positions.slice(),
    visiblePositions: positions.map(position => position + 1),
    positionOrder: positions.slice(),
    text,
    canonicalText: text,
    languageTemplateId: 'kanonisch',
    languageVariantCount: 1,
    sentenceOpening: '',
    signature: signature || id + '|' + positions.join('-') + '|' + text,
    truth: true,
    informationStrength: candidateOptions.informationStrength || 1,
    optional: candidateOptions.optional === true,
    details: candidateOptions.details || {},
    codewideDerivations: candidateOptions.codewideDerivations || [],
    positionRoles: candidateOptions.positionRoles || positions.map((position, index) => 'Position ' + (index + 1)),
    mathematicalRule: candidateOptions.mathematicalRule || id + ': ' + text,
    requiresUnlock: candidateOptions.requiresUnlock === true,
    specialRuleType: candidateOptions.specialRuleType || 'normal',
    independentValidation: candidateOptions.independentValidation !== false,
    selectionPriority: Number.isFinite(candidateOptions.selectionPriority) ? candidateOptions.selectionPriority : 0
  };
}

function stableTextHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function ordinalSequence(sequence) {
  const positions = sequence.match(/1[01]|[1-9]/g);
  if (!positions || positions.length === 0) return sequence;
  return joinGerman(positions.map(position => ordinal(Number(position), 'dative')));
}

function numericPlaceVariant(text) {
  return text.replace(/\bPositionen\b/g, 'Stellen').replace(/\bPosition\b/g, 'Stelle');
}

function grammaticalDisplayBase(text) {
  return text.replace(/ entspricht die Zahl an /g, ' entspricht der Zahl an ');
}

function ordinalPositionVariant(text) {
  const numericSequence = 'Position (?:1[01]|[1-9])(?:, Position (?:1[01]|[1-9]))*(?: und Position (?:1[01]|[1-9]))?';
  const plainSequence = '(?:1[01]|[1-9])(?:, (?:1[01]|[1-9]))*(?: und (?:1[01]|[1-9]))?';
  let result = text;
  result = result.replace(new RegExp('\\b(Die|die) Zahlen an (' + numericSequence + ')', 'g'), (match, article, sequence) => article + ' Ziffern an der ' + ordinalSequence(sequence) + ' Stelle');
  result = result.replace(new RegExp('\\b(Die|die) Ziffern an den Positionen (' + plainSequence + ')', 'g'), (match, article, sequence) => article + ' Ziffern an der ' + ordinalSequence(sequence) + ' Stelle');
  result = result.replace(new RegExp('\\bZahlen an (' + numericSequence + ')', 'g'), (match, sequence) => 'Ziffern an der ' + ordinalSequence(sequence) + ' Stelle');
  result = result.replace(/\bDie Zahl an Position (1[01]|[1-9])/g, (match, position) => 'Die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\bdie Zahl an Position (1[01]|[1-9])/g, (match, position) => 'die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\bder Zahl an Position (1[01]|[1-9])/g, (match, position) => 'der ' + ordinal(Number(position), 'dative') + ' Ziffer');
  result = result.replace(/\bDie Ziffer an Position (1[01]|[1-9])/g, (match, position) => 'Die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\bdie Ziffer an Position (1[01]|[1-9])/g, (match, position) => 'die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\bals die an Position (1[01]|[1-9])/g, (match, position) => 'als die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\ban Position (1[01]|[1-9])/g, (match, position) => 'an der ' + ordinal(Number(position), 'dative') + ' Stelle');
  return result;
}

function sentenceOpening(text) {
  const normalizedOrdinals = ORDINAL_NOMINATIVE.concat(ORDINAL_DATIVE)
    .filter(Boolean)
    .reduce((value, ordinalWord) => value.replace(new RegExp('\\b' + ordinalWord + '\\b', 'gi'), '<ordinal>'), text.toLowerCase());
  return normalizedOrdinals.replace(/[.,:;!?]/g, '').split(/\s+/).slice(0, 4).join(' ');
}

function tier5PatternVariant(candidate) {
  if (candidate.id !== 'T5-03') return '';
  const labels = candidate.details.derivationLabels;
  if (!Array.isArray(labels) || labels.length !== 3) return '';
  const subject = labels.join('; ');
  const intro = 'Die drei codeweit abgeleiteten Werte – ' + subject + ' – ';
  if (candidate.details.pattern === 'arithmetic') return intro + 'bilden in dieser Reihenfolge eine arithmetische Folge mit gleichem, von null verschiedenem Abstand.';
  if (candidate.details.pattern === 'ascending') return intro + 'werden in der genannten Reihenfolge jeweils strikt größer.';
  if (candidate.details.pattern === 'descending') return intro + 'werden in der genannten Reihenfolge jeweils strikt kleiner.';
  if (candidate.details.pattern === 'firstThirdEqual') return intro + 'haben denselben ersten und dritten Wert, während der mittlere Wert abweicht.';
  return '';
}

function languageVariantsForCandidate(candidate, code) {
  if (candidate.id === 'T5-04' || candidate.intentionallyFalse === true) {
    return [{ id: 'wortgetreu-geschuetzt', text: candidate.text, opening: sentenceOpening(candidate.text), stableRank: 0 }];
  }
  if (candidate.id === 'T1-DIGIT-06') {
    const exactText = candidate.canonicalText || candidate.text;
    return [{ id: 'fakultaet-wortgetreu', text: exactText, opening: sentenceOpening(exactText), stableRank: 0 }];
  }
  if (candidate.id === 'T3-17' || candidate.id === 'T3-18' || candidate.id === 'T3-19' || candidate.id === 'T4-23') {
    const exactText = candidate.canonicalText || candidate.text;
    return [{ id: 'l054-mathematisch-wortgetreu', text: exactText, opening: sentenceOpening(exactText), stableRank: 0 }];
  }
  if (candidate.id === 'T5-01') {
    const rightPositions = candidate.details.rightVisiblePositions;
    const comparison = candidate.details.comparison;
    const intro = 'Für diesen Hinweis werden die Positionen von rechts gezählt. ';
    const tier5Variants = comparison === 'gleich' ? [
      { id: 'rechts-numerisch', text: intro + 'Die Zahlen an Position ' + rightPositions[0] + ' und Position ' + rightPositions[1] + ' sind gleich.' },
      { id: 'rechts-ordinal', text: intro + 'Die ' + ordinal(rightPositions[0]) + ' und ' + ordinal(rightPositions[1]) + ' Ziffer von rechts sind gleich.' },
      { id: 'rechts-stellen', text: intro + 'An den Stellen ' + rightPositions[0] + ' und ' + rightPositions[1] + ' steht von rechts gezählt derselbe Wert.' }
    ] : [
      { id: 'rechts-numerisch', text: candidate.canonicalText },
      { id: 'rechts-ordinal', text: intro + 'Die ' + ordinal(rightPositions[0]) + ' Ziffer von rechts ist ' + comparison + ' als die ' + ordinal(rightPositions[1]) + ' Ziffer von rechts.' },
      { id: 'rechts-stellen', text: intro + 'Von rechts betrachtet ist die Ziffer an Stelle ' + rightPositions[0] + ' ' + comparison + ' als die Ziffer an Stelle ' + rightPositions[1] + '.' }
    ];
    return tier5Variants.filter((variant, index) => tier5Variants.findIndex(other => other.text === variant.text) === index).map(variant => Object.assign({}, variant, {
      opening: sentenceOpening(variant.text),
      stableRank: stableTextHash(code.join('') + '|' + candidate.signature + '|language-v1|' + variant.id)
    }));
  }

  const baseTexts = [grammaticalDisplayBase(candidate.canonicalText || candidate.text)];
  if (candidate.id.includes('-CODE-')) {
    for (const text of codewideTextVariants(candidate.id, candidate.internalPositions, candidate.details)) baseTexts.push(grammaticalDisplayBase(text));
  }
  const tier5Pattern = tier5PatternVariant(candidate);
  if (tier5Pattern) baseTexts.push(tier5Pattern);

  const variants = [];
  const addVariant = (id, text) => {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (!normalized || variants.some(variant => variant.text === normalized)) return;
    variants.push({ id, text: normalized });
  };

  for (let index = 0; index < baseTexts.length; index++) {
    const baseText = baseTexts[index];
    addVariant('numerisch-' + index, baseText);
    addVariant('stellen-' + index, numericPlaceVariant(baseText));
    addVariant('ordinal-' + index, ordinalPositionVariant(baseText));
  }
  return variants.map(variant => Object.assign({}, variant, {
    opening: sentenceOpening(variant.text),
    stableRank: stableTextHash(code.join('') + '|' + candidate.signature + '|language-v1|' + variant.id)
  }));
}

function combinations(size, count) {
  const result = [];
  function collect(start, current) {
    if (current.length === count) {
      result.push(current.slice());
      return;
    }
    for (let index = start; index < size; index++) {
      current.push(index);
      collect(index + 1, current);
      current.pop();
    }
  }
  collect(0, []);
  return result;
}

function permutations(values) {
  const result = [];
  function collect(remaining, current) {
    if (remaining.length === 0) {
      result.push(current.slice());
      return;
    }
    for (let index = 0; index < remaining.length; index++) {
      const next = remaining[index];
      collect(remaining.slice(0, index).concat(remaining.slice(index + 1)), current.concat(next));
    }
  }
  collect(values, []);
  return result;
}

function freePositionOrder(positions) {
  if (positions.length < 4) return positions.slice();
  const ordered = [];
  for (let index = 0; index < positions.length; index += 2) ordered.push(positions[index]);
  const lastOddIndex = positions.length % 2 === 0 ? positions.length - 1 : positions.length - 2;
  for (let index = lastOddIndex; index >= 1; index -= 2) ordered.push(positions[index]);
  return ordered;
}

const MIN_HINT_EXCLUSION_PERCENT = 40;
const VISIBLE_SEMANTIC_AUDITED_HINT_IDS = new Set(["T1-01","T1-02","T1-03","T1-05","T1-06","T1-08","T1-09","T1-12","T1-14","T1-DIGIT-00","T1-DIGIT-01","T1-DIGIT-02","T1-DIGIT-03","T1-DIGIT-04","T1-DIGIT-05","T1-DIGIT-06","T1-DIGIT-07","T1-DIGIT-08","T1-DIGIT-09","T2-01","T2-03","T2-04","T2-06","T2-08","T2-09","T2-11","T2-13","T2-15","T2-CODE-03","T2-CODE-04","T3-02","T3-04","T3-06","T3-07","T3-08","T3-10","T3-11","T3-12","T3-13","T3-14","T3-15","T3-16","T3-CODE-01","T3-CODE-02","T3-CODE-03","T3-CODE-04","T4-01","T4-02","T4-03","T4-04","T4-05","T4-06","T4-07","T4-08","T4-09","T4-10","T4-11","T4-12","T4-13","T4-15","T4-16","T4-17","T4-18","T4-19","T4-21","T4-22","T4-CODE-01","T4-CODE-02","T4-CODE-03","T4-CODE-05","T4-CODE-06","T4-CODE-07","T1-CODE-04","T4-CODE-04","T5-01","T5-02","T5-03"]);

function estimateInformationExclusionPercent(candidate) {
  const details = candidate && candidate.details ? candidate.details : {};
  if (!candidate || typeof candidate.id !== 'string') return 0;
  if (candidate.id === 'T5-04') return 100;
  if (candidate.id === 'T3-17' || candidate.id === 'T3-18' || candidate.id === 'T3-19' || candidate.id === 'T3-20' || candidate.id === 'T4-23') return Number.isFinite(details.informationExclusionPercent) ? details.informationExclusionPercent : 0;
  if (candidate.id === 'T1-07') return details.cube === true ? 70 : details.cube === false ? 30 : 0;
  if (candidate.id === 'T1-13') return details.factorial === true ? 70 : details.factorial === false ? 30 : 0;
  if (candidate.id === 'T1-CODE-01') return details.comparison === 'größer' ? 39.52446 : details.comparison === 'kleiner' ? 75.681338 : details.comparison === 'gleich' ? 85.156999 : 0;
  if (candidate.id === 'T1-CODE-02') return details.comparison === 'größer' ? 95.135595 : details.comparison === 'kleiner' ? 19.816701 : details.comparison === 'gleich' ? 85.096532 : 0;
  if (candidate.id === 'T1-CODE-03') return details.extremum === 'maximum' || details.extremum === 'minimum' ? 85.085658 : details.extremum === 'neither' ? 29.828684 : 0;
  if (candidate.id === 'T2-02') return details.square === true ? 79 : details.square === false ? 21 : 0;
  if (candidate.id === 'T2-07') return details.square === true ? 64 : details.square === false ? 36 : 0;
  if (candidate.id === 'T2-10') return details.fibonacci === true ? 69 : details.fibonacci === false ? 31 : 0;
  if (candidate.id === 'T2-12') return details.square === true ? 94 : details.square === false ? 6 : 0;
  if (candidate.id === 'T2-14') return details.equal === true ? 90 : details.equal === false ? 10 : 0;
  if (candidate.id === 'T2-16') return details.prime === true ? 63 : details.prime === false ? 37 : 0;
  if (candidate.id === 'T2-CODE-01') {
    if (details.sourceKey === 'smallestEven') return details.mode === 'greaterBoth' ? 98.968864 : details.mode === 'lessBoth' ? 35.346914 : details.mode === 'between' ? 96.983958 : 0;
    if (details.sourceKey === 'largestPrime') return details.mode === 'greaterBoth' ? 62.687654 : details.mode === 'lessBoth' ? 93.284617 : details.mode === 'between' ? 86.257269 : 0;
    if (details.sourceKey === 'largestOdd') return details.mode === 'greaterBoth' ? 35.346914 : details.mode === 'lessBoth' ? 98.968864 : details.mode === 'between' ? 96.983958 : 0;
    return 0;
  }
  if (candidate.id === 'T3-01') return details.comparison === 'größer' ? 22 : details.comparison === 'kleiner' ? 83.5 : details.comparison === 'gleich' ? 94.5 : 0;
  if (candidate.id === 'T3-03') return details.comparison === 'größer' ? 29 : details.comparison === 'kleiner' ? 75.2 : details.comparison === 'gleich' ? 95.8 : 0;
  if (candidate.id === 'T3-09') return details.palindrome === true ? 91 : details.palindrome === false ? 9 : 0;
  if (candidate.id === 'T4-14') {
    if (!Array.isArray(details.firstGroup) || !Array.isArray(details.secondGroup)) return 0;
    if (details.firstGroup.length === 2 && details.secondGroup.length === 3) return details.relation === 'mehr' ? 77.626 : details.relation === 'weniger' ? 27.214 : 0;
    if (details.firstGroup.length === 3 && details.secondGroup.length === 3) return details.relation === 'mehr' || details.relation === 'weniger' ? 52.7626 : 0;
    return 0;
  }
  if (candidate.id === 'T4-20') return details.comparison === 'größer' ? 33.924516 : details.comparison === 'kleiner' ? 69.790585 : details.comparison === 'gleich' ? 96.284898 : 0;
  return VISIBLE_SEMANTIC_AUDITED_HINT_IDS.has(candidate.id) ? MIN_HINT_EXCLUSION_PERCENT : 0;
}

function createGenerator(code, existingComparison, generatorOptions) {
  const settings = generatorOptions || {};
  const GENERATOR_SEED = String(settings.seed || 'default');
  const qualityCache = new Map();
  const candidateGroups = {
    1: { 'T1-01': [], 'T1-02': [], 'T1-03': [], 'T1-05': [], 'T1-06': [], 'T1-07': [], 'T1-08': [], 'T1-09': [], 'T1-12': [], 'T1-13': [], 'T1-14': [], 'T1-DIGIT-00': [], 'T1-DIGIT-01': [], 'T1-DIGIT-02': [], 'T1-DIGIT-03': [], 'T1-DIGIT-04': [], 'T1-DIGIT-05': [], 'T1-DIGIT-06': [], 'T1-DIGIT-07': [], 'T1-DIGIT-08': [], 'T1-DIGIT-09': [], 'T1-CODE-01': [], 'T1-CODE-02': [], 'T1-CODE-03': [] },
    2: { 'T2-01': [], 'T2-02': [], 'T2-03': [], 'T2-04': [], 'T2-06': [], 'T2-07': [], 'T2-08': [], 'T2-09': [], 'T2-10': [], 'T2-11': [], 'T2-12': [], 'T2-13': [], 'T2-14': [], 'T2-15': [], 'T2-16': [], 'T2-CODE-01': [], 'T2-CODE-03': [], 'T2-CODE-04': [] },
    3: { 'T3-01': [], 'T3-02': [], 'T3-03': [], 'T3-04': [], 'T3-06': [], 'T3-07': [], 'T3-08': [], 'T3-09': [], 'T3-10': [], 'T3-11': [], 'T3-12': [], 'T3-13': [], 'T3-14': [], 'T3-15': [], 'T3-16': [], 'T3-17': [], 'T3-18': [], 'T3-19': [], 'T3-20': [], 'T3-CODE-01': [], 'T3-CODE-02': [], 'T3-CODE-03': [], 'T3-CODE-04': [] },
    4: { 'T4-01': [], 'T4-02': [], 'T4-03': [], 'T4-04': [], 'T4-05': [], 'T4-06': [], 'T4-07': [], 'T4-08': [], 'T4-09': [], 'T4-10': [], 'T4-11': [], 'T4-12': [], 'T4-13': [], 'T4-14': [], 'T4-15': [], 'T4-16': [], 'T4-17': [], 'T4-18': [], 'T4-19': [], 'T4-20': [], 'T4-21': [], 'T4-22': [], 'T4-23': [], 'T4-CODE-01': [], 'T4-CODE-02': [], 'T4-CODE-03': [], 'T4-CODE-05': [], 'T4-CODE-06': [], 'T4-CODE-07': [] },
    5: { 'T1-CODE-04': [], 'T4-CODE-04': [], 'T5-01': [], 'T5-02': [], 'T5-03': [], 'T5-04': [] }
  };
  const codewide = analyzeCodewide(code);
  const TIER_5_UNLOCKED = settings.tier5Unlocked === true;
  const MAX_OPTIONAL_CANDIDATES = 160;
  const groupComparisonCounts = { '2:3': 0, '3:3': 0 };

  function add(candidate) {
    candidateGroups[candidate.tier][candidate.id].push(candidate);
  }

  function addCodewideCandidate(tier, id, positions, details, options) {
    const candidateOptions = options || {};
    const texts = codewideTextVariants(id, positions, details);
    if (texts.length < 2) throw new Error('Codeweiter Typ ' + id + ' besitzt weniger als zwei Textvarianten.');
    let variantSeed = 2166136261;
    const variantSource = GENERATOR_SEED + '|' + id + '|' + positions.join('-') + '|' + (details.semanticKey || '') + '|' + code.join('');
    for (let index = 0; index < variantSource.length; index++) {
      variantSeed ^= variantSource.charCodeAt(index);
      variantSeed = Math.imul(variantSeed, 16777619);
    }
    const variantIndex = (variantSeed >>> 0) % texts.length;
    const candidateDetails = Object.assign({}, details, { variantIndex });
    const signature = id + '|' + positions.join('-') + '|' + (details.semanticKey || '');
    add(makeCandidate(tier, id, positions, texts[variantIndex], signature, {
      informationStrength: candidateOptions.informationStrength || 4,
      optional: candidateOptions.optional !== false,
      positionRoles: candidateOptions.positionRoles || positions.map(() => 'Beteiligte Position'),
      details: candidateDetails,
      codewideDerivations: candidateOptions.codewideDerivations || [],
      mathematicalRule: candidateOptions.mathematicalRule || id,
      requiresUnlock: tier === 5,
      specialRuleType: tier === 5 ? 'median-expertenhinweis' : 'normal',
      selectionPriority: candidateOptions.selectionPriority
    }));
  }

  function addCodewideCandidates() {
    for (let position = 0; position < code.length; position++) {
      if (codewide.hasPrime) {
        const comparison = relation(codewide.largestPrime, code[position]);
        addCodewideCandidate(1, 'T1-CODE-01', [position], { comparison, derivedValue: codewide.largestPrime, semanticKey: 'largestPrime|' + position + '|' + comparison }, { optional: true, positionRoles: ['Vergleichsposition'], codewideDerivations: ['größte vorkommende Primzahl'], mathematicalRule: 'Größte Primzahl des gesamten Codes wird mit einer Positionsziffer verglichen' });
      }
      if (codewide.hasEven) {
        const comparison = relation(codewide.smallestEven, code[position]);
        addCodewideCandidate(1, 'T1-CODE-02', [position], { comparison, derivedValue: codewide.smallestEven, semanticKey: 'smallestEven|' + position + '|' + comparison }, { optional: true, positionRoles: ['Vergleichsposition'], codewideDerivations: ['kleinste gerade Zahl'], mathematicalRule: 'Kleinste gerade Zahl des gesamten Codes einschließlich 0 wird mit einer Positionsziffer verglichen' });
      }
      if (codewide.minimum !== codewide.maximum) {
        const extremum = code[position] === codewide.maximum ? 'maximum' : code[position] === codewide.minimum ? 'minimum' : 'neither';
        addCodewideCandidate(1, 'T1-CODE-03', [position], { extremum, minimum: codewide.minimum, maximum: codewide.maximum, semanticKey: 'globalExtremum|' + position + '|' + extremum }, { optional: false, informationStrength: extremum === 'neither' ? 2 : 4, positionRoles: ['Prüfposition'], codewideDerivations: ['globale kleinste Ziffer', 'globale größte Ziffer'], mathematicalRule: 'Positionswert ist globales Maximum, globales Minimum oder keiner der Extremwerte' });
      }
      const medianComparison = relation(codewide.median, code[position]);
      addCodewideCandidate(5, 'T1-CODE-04', [position], { comparison: medianComparison, median: codewide.median, semanticKey: 'median|' + position + '|' + medianComparison }, { optional: false, positionRoles: ['Vergleichsposition'], codewideDerivations: ['Median aller elf Ziffern'], mathematicalRule: 'Median des gesamten Codes wird mit einer Positionsziffer verglichen' });
    }

    const tier2Sources = [
      { key: 'smallestEven', subject: 'Die kleinste gerade Zahl im Code', value: codewide.smallestEven, available: codewide.hasEven },
      { key: 'largestPrime', subject: 'Die größte Primzahl im Code', value: codewide.largestPrime, available: codewide.hasPrime },
      { key: 'largestOdd', subject: 'Die größte ungerade Zahl im Code', value: codewide.largestOdd, available: codewide.hasOdd }
    ];
    for (const pair of combinations(code.length, 2)) {
      for (const source of tier2Sources) {
        if (!source.available) continue;
        const firstValue = code[pair[0]];
        const secondValue = code[pair[1]];
        let orderedPair = pair.slice();
        let mode = null;
        if (source.value > firstValue && source.value > secondValue) mode = 'greaterBoth';
        else if (source.value < firstValue && source.value < secondValue) mode = 'lessBoth';
        else if (Math.min(firstValue, secondValue) < source.value && source.value < Math.max(firstValue, secondValue)) {
          orderedPair = firstValue < secondValue ? pair.slice() : pair.slice().reverse();
          mode = 'between';
        }
        if (mode) addCodewideCandidate(2, 'T2-CODE-01', orderedPair, { sourceKey: source.key, subject: source.subject, derivedValue: source.value, mode, semanticKey: source.key + '|' + orderedPair.join('-') + '|' + mode }, { positionRoles: mode === 'between' ? ['Untere Vergleichsposition', 'Obere Vergleichsposition'] : ['Vergleichsposition A', 'Vergleichsposition B'], codewideDerivations: [source.subject], mathematicalRule: 'Eine eindeutig abgeleitete globale Zahl wird gleichzeitig mit zwei Positionswerten verglichen' });
      }
      if (codewide.hasPrime) {
        const firstValue = code[pair[0]];
        const secondValue = code[pair[1]];
        let orderedPair = pair.slice();
        let mode = null;
        if (firstValue > codewide.largestPrime && secondValue > codewide.largestPrime) mode = 'bothGreater';
        else if (firstValue < codewide.largestPrime && secondValue < codewide.largestPrime) mode = 'bothSmaller';
        else if (Math.min(firstValue, secondValue) < codewide.largestPrime && codewide.largestPrime < Math.max(firstValue, secondValue)) {
          orderedPair = firstValue < secondValue ? pair.slice() : pair.slice().reverse();
          mode = 'between';
        }
        if (mode) addCodewideCandidate(2, 'T2-CODE-03', orderedPair, { mode, largestPrime: codewide.largestPrime, semanticKey: 'largestPrimePair|' + orderedPair.join('-') + '|' + mode }, { positionRoles: mode === 'between' ? ['Untere Position', 'Obere Position'] : ['Vergleichsposition A', 'Vergleichsposition B'], codewideDerivations: ['größte vorkommende Primzahl'], mathematicalRule: 'Zwei Positionswerte werden gemeinsam relativ zur größten Primzahl des Codes eingeordnet' });
      }
      for (const extremum of [
        { key: 'minimum', value: codewide.minimum, label: 'kleinsten', noun: 'Minimum' },
        { key: 'maximum', value: codewide.maximum, label: 'größten', noun: 'Maximum' }
      ]) {
        const firstDistance = Math.abs(code[pair[0]] - extremum.value);
        const secondDistance = Math.abs(code[pair[1]] - extremum.value);
        if (firstDistance === 0 || secondDistance === 0 || firstDistance === secondDistance) continue;
        const orderedPair = firstDistance < secondDistance ? pair.slice() : pair.slice().reverse();
        addCodewideCandidate(2, 'T2-CODE-04', orderedPair, { extremum: extremum.key, extremumValue: extremum.value, extremumLabel: extremum.label, extremumNoun: extremum.noun, closerDistance: Math.min(firstDistance, secondDistance), fartherDistance: Math.max(firstDistance, secondDistance), semanticKey: 'extremumDistance|' + extremum.key + '|' + orderedPair.join('-') }, { positionRoles: ['Nähere Position', 'Entferntere Position'], codewideDerivations: ['globales ' + extremum.noun], mathematicalRule: 'Absolute Abstände zweier Positionswerte zu einem globalen Extremwert werden strikt verglichen' });
      }
    }
    function addPrimeNeighborComparisons(id, anchorPosition, neighborPosition, directionLabel) {
      if (!Number.isInteger(anchorPosition) || !Number.isInteger(neighborPosition)) return;
      const parity = code[neighborPosition] % 2 === 0 ? 'even' : 'odd';
      for (let targetPosition = 0; targetPosition < code.length; targetPosition++) {
        if (targetPosition === anchorPosition || targetPosition === neighborPosition) continue;
        const comparison = relation(code[neighborPosition], code[targetPosition]);
        addCodewideCandidate(3, id, [anchorPosition, neighborPosition, targetPosition], { parity, comparison, anchorPosition, neighborPosition, targetPosition, semanticKey: id + '|' + neighborPosition + '|' + targetPosition + '|' + comparison }, { positionRoles: ['Abgeleitete Primzahlposition', 'Abgeleitete Nachbarposition', 'Vergleichsposition'], codewideDerivations: [directionLabel], mathematicalRule: 'Parität und Wert des abgeleiteten Primzahlnachbarn werden mit einer weiteren Position verglichen' });
      }
    }
    addPrimeNeighborComparisons('T3-CODE-01', codewide.firstPrimePosition, codewide.afterFirstPrime, 'erste Primzahl und rechter Nachbar');
    addPrimeNeighborComparisons('T3-CODE-02', codewide.lastPrimePosition, codewide.beforeLastPrime, 'letzte Primzahl und linker Nachbar');

    const extremeOccurrences = codewide.minimum === codewide.maximum ? [] : [
      { position: codewide.firstMinimumPosition, label: 'ersten Vorkommen der kleinsten Zahl', derivation: 'erstes Vorkommen des globalen Minimums' },
      { position: codewide.lastMinimumPosition, label: 'letzten Vorkommen der kleinsten Zahl', derivation: 'letztes Vorkommen des globalen Minimums' },
      { position: codewide.firstMaximumPosition, label: 'ersten Vorkommen der größten Zahl', derivation: 'erstes Vorkommen des globalen Maximums' },
      { position: codewide.lastMaximumPosition, label: 'letzten Vorkommen der größten Zahl', derivation: 'letztes Vorkommen des globalen Maximums' }
    ];
    for (const occurrence of extremeOccurrences) {
      for (const neighborRule of [
        { position: occurrence.position > 0 ? occurrence.position - 1 : null, label: 'vor' },
        { position: occurrence.position < code.length - 1 ? occurrence.position + 1 : null, label: 'nach' }
      ]) {
        if (!Number.isInteger(neighborRule.position)) continue;
        for (let targetPosition = 0; targetPosition < code.length; targetPosition++) {
          if (targetPosition === occurrence.position || targetPosition === neighborRule.position) continue;
          const comparison = relation(code[neighborRule.position], code[targetPosition]);
          addCodewideCandidate(3, 'T3-CODE-03', [occurrence.position, neighborRule.position, targetPosition], { occurrenceLabel: occurrence.label, directionLabel: neighborRule.label, occurrencePosition: occurrence.position, neighborPosition: neighborRule.position, targetPosition, comparison, semanticKey: 'extremeNeighbor|' + occurrence.derivation + '|' + neighborRule.position + '|' + targetPosition + '|' + comparison }, { positionRoles: ['Abgeleitete Extremposition', 'Abgeleitete Nachbarposition', 'Vergleichsposition'], codewideDerivations: [occurrence.derivation], mathematicalRule: 'Nachbar eines eindeutig bestimmten globalen Extremvorkommens wird mit einer weiteren Position verglichen' });
        }
      }
    }
    if (Number.isInteger(codewide.afterFirstPrime) && Number.isInteger(codewide.beforeLastPrime) && codewide.afterFirstPrime !== codewide.beforeLastPrime) {
      const comparison = relation(code[codewide.afterFirstPrime], code[codewide.beforeLastPrime]);
      addCodewideCandidate(3, 'T3-CODE-04', [codewide.afterFirstPrime, codewide.beforeLastPrime], { comparison, afterFirstPrime: codewide.afterFirstPrime, beforeLastPrime: codewide.beforeLastPrime, firstPrimePosition: codewide.firstPrimePosition, lastPrimePosition: codewide.lastPrimePosition, semanticKey: 'primeNeighbors|' + codewide.afterFirstPrime + '|' + codewide.beforeLastPrime + '|' + comparison }, { positionRoles: ['Rechter Nachbar der ersten Primzahl', 'Linker Nachbar der letzten Primzahl'], codewideDerivations: ['erster Primzahlnachbar rechts', 'letzter Primzahlnachbar links'], mathematicalRule: 'Die beiden eindeutig abgeleiteten Primzahlnachbarn werden miteinander verglichen' });
    }

    if (codewide.hasPrime && code[0] !== codewide.maximum && code[code.length - 1] !== codewide.maximum && code[0] > codewide.largestPrime && code[code.length - 1] > codewide.largestPrime) {
      addCodewideCandidate(4, 'T4-CODE-01', [0, code.length - 1], { maximum: codewide.maximum, largestPrime: codewide.largestPrime, semanticKey: 'edgeAbovePrimes' }, { selectionPriority: -18, positionRoles: ['Erste Position', 'Letzte Position'], codewideDerivations: ['globale größte Ziffer', 'größte vorkommende Primzahl'], mathematicalRule: 'Beide Randwerte sind keine globalen Maxima und liegen über sämtlichen Primzahlen des Codes' });
    }
    if (codewide.hasPrime && codewide.hasEven && codewide.hasOdd && Number.isInteger(codewide.afterFirstPrime)) {
      const neighborValue = code[codewide.afterFirstPrime];
      if (codewide.smallestEven < neighborValue && neighborValue < codewide.largestOdd) {
        addCodewideCandidate(4, 'T4-CODE-02', [codewide.firstPrimePosition, codewide.afterFirstPrime], { smallestEven: codewide.smallestEven, largestOdd: codewide.largestOdd, neighborPosition: codewide.afterFirstPrime, semanticKey: 'firstPrimeNeighborBetweenGlobalProperties' }, { positionRoles: ['Erste Primzahlposition', 'Rechter Nachbar'], codewideDerivations: ['erste Primzahl von links', 'kleinste gerade Zahl', 'größte ungerade Zahl'], mathematicalRule: 'Rechter Nachbar der ersten Primzahl liegt strikt zwischen zwei global abgeleiteten Werten' });
      }
    }
    if (Number.isInteger(codewide.beforeFirstPrime) && Number.isInteger(codewide.afterLastPrime) && codewide.beforeFirstPrime !== codewide.afterLastPrime) {
      const derivedSum = code[codewide.beforeFirstPrime] + code[codewide.afterLastPrime];
      if (derivedSum <= 9) {
        for (let targetPosition = 0; targetPosition < code.length; targetPosition++) {
          if (targetPosition === codewide.beforeFirstPrime || targetPosition === codewide.afterLastPrime || code[targetPosition] !== derivedSum) continue;
          addCodewideCandidate(4, 'T4-CODE-03', [codewide.beforeFirstPrime, codewide.afterLastPrime, targetPosition], { beforeFirstPrime: codewide.beforeFirstPrime, afterLastPrime: codewide.afterLastPrime, targetPosition, derivedSum, semanticKey: 'outerPrimeNeighborSum|' + codewide.beforeFirstPrime + '|' + codewide.afterLastPrime + '|' + targetPosition }, { positionRoles: ['Linker Nachbar der ersten Primzahl', 'Rechter Nachbar der letzten Primzahl', 'Zielposition'], codewideDerivations: ['linker Nachbar der ersten Primzahl', 'rechter Nachbar der letzten Primzahl'], mathematicalRule: 'Summe zweier eindeutig abgeleiteter Primzahlnachbarn entspricht einer weiteren Positionsziffer' });
        }
      }
    }
    if (codewide.hasEven && codewide.hasOdd) {
      const orderedValues = [code[codewide.firstEvenPosition], code[codewide.lastOddPosition], codewide.median];
      const distinctValues = new Set(orderedValues).size === 3;
      const ascending = orderedValues[0] < orderedValues[1] && orderedValues[1] < orderedValues[2];
      const descending = orderedValues[0] > orderedValues[1] && orderedValues[1] > orderedValues[2];
      if (distinctValues && (ascending || descending)) {
        const direction = ascending ? 'ascending' : 'descending';
        addCodewideCandidate(5, 'T4-CODE-04', [codewide.firstEvenPosition, codewide.lastOddPosition, codewide.medianFirstPosition], { direction, values: orderedValues, semanticKey: 'derivedStrictOrder|' + direction }, { positionRoles: ['Erste gerade Zahl', 'Letzte ungerade Zahl', 'Erstes Medianvorkommen'], codewideDerivations: ['erste gerade Zahl von links', 'letzte ungerade Zahl von links', 'Median aller elf Ziffern'], mathematicalRule: 'Drei global abgeleitete Werte stehen in strenger auf- oder absteigender Reihenfolge' });
      }
    }
    if (codewide.minimum !== codewide.maximum && Number.isInteger(codewide.afterFirstPrime)) {
      const globalDifference = Math.abs(codewide.maximum - codewide.minimum);
      if (code[codewide.afterFirstPrime] === globalDifference) {
        addCodewideCandidate(4, 'T4-CODE-05', [codewide.firstPrimePosition, codewide.afterFirstPrime], { globalDifference, minimum: codewide.minimum, maximum: codewide.maximum, semanticKey: 'firstPrimeNeighborGlobalDifference' }, { positionRoles: ['Erste Primzahlposition', 'Rechter Nachbar'], codewideDerivations: ['erste Primzahl von links', 'globale kleinste Ziffer', 'globale größte Ziffer'], mathematicalRule: 'Rechter Nachbar der ersten Primzahl entspricht dem absoluten Unterschied der globalen Extremwerte' });
      }
    }
    if (codewide.minimum !== codewide.maximum && codewide.minimum < code[0] && code[0] < codewide.maximum && codewide.minimum < code[code.length - 1] && code[code.length - 1] < codewide.maximum) {
      addCodewideCandidate(4, 'T4-CODE-06', [0, code.length - 1], { minimum: codewide.minimum, maximum: codewide.maximum, semanticKey: 'edgeBetweenGlobalExtrema' }, { positionRoles: ['Erste Position', 'Letzte Position'], codewideDerivations: ['globale kleinste Ziffer', 'globale größte Ziffer'], mathematicalRule: 'Beide Randwerte liegen strikt zwischen globalem Minimum und Maximum' });
    }
    if (codewide.hasEven && codewide.hasPrime && codewide.smallestEven < codewide.largestPrime) {
      for (let targetPosition = 0; targetPosition < code.length; targetPosition++) {
        if (codewide.largestPrime >= code[targetPosition]) continue;
        addCodewideCandidate(4, 'T4-CODE-07', [targetPosition], { smallestEven: codewide.smallestEven, largestPrime: codewide.largestPrime, targetPosition, semanticKey: 'smallestEvenBelowLargestPrimeBelowTarget|' + targetPosition }, { informationStrength: 6, selectionPriority: 8, positionRoles: ['Zielposition oberhalb der größten Primzahl'], codewideDerivations: ['kleinste gerade Ziffer', 'größte vorkommende Primzahl'], mathematicalRule: 'Kleinste gerade Ziffer < größte Primzahl < Wert der Zielposition' });
      }
    }
  }

  function addTier5Candidates() {
    if (!TIER_5_UNLOCKED) return;

    for (const pair of combinations(code.length, 2)) {
      const rightPositions = pair.map(position => code.length - position);
      const comparison = relation(code[pair[0]], code[pair[1]]);
      const text = 'Für diesen Hinweis werden die Positionen von rechts gezählt. Die Zahl an Position ' + rightPositions[0] + ' ist ' + comparison + ' als die Zahl an Position ' + rightPositions[1] + '.';
      add(makeCandidate(5, 'T5-01', pair, text, 'T5-01|right|' + pair.join('-') + '|' + comparison, { informationStrength: 5, optional: true, requiresUnlock: true, specialRuleType: 'positionszaehlung-von-rechts', independentValidation: true, positionRoles: ['Vergleichsposition A von rechts', 'Vergleichsposition B von rechts'], details: { rightVisiblePositions: rightPositions, normalVisiblePositions: pair.map(position => position + 1), comparison, positionCounting: 'right' }, mathematicalRule: 'Die Rechtsposition wird mit code.length - internem Index berechnet; anschließend werden die beiden tatsächlichen Werte verglichen.' }));
    }

    for (let divisorPosition = 0; divisorPosition < code.length; divisorPosition++) {
      const divisor = code[divisorPosition];
      if (divisor <= 1) continue;
      const operandPositions = Array.from({ length: code.length }, (_, position) => position).filter(position => position !== divisorPosition);
      for (const operandIndexes of combinations(operandPositions.length, 2)) {
        const firstPosition = operandPositions[operandIndexes[0]];
        const secondPosition = operandPositions[operandIndexes[1]];
        if (code[firstPosition] === code[secondPosition]) continue;
        const firstRemainder = code[firstPosition] % divisor;
        const secondRemainder = code[secondPosition] % divisor;
        if (firstRemainder <= 0 || firstRemainder !== secondRemainder) continue;
        const positions = [firstPosition, secondPosition, divisorPosition];
        const text = 'Die Zahlen an Position ' + (firstPosition + 1) + ' und Position ' + (secondPosition + 1) + ' hinterlassen bei der Teilung durch die Zahl an Position ' + (divisorPosition + 1) + ' denselben Rest.';
        add(makeCandidate(5, 'T5-02', positions, text, 'T5-02|' + firstPosition + '-' + secondPosition + '|divisor|' + divisorPosition, { informationStrength: 5, optional: true, requiresUnlock: true, specialRuleType: 'gleicher-positiver-rest', independentValidation: true, positionRoles: ['Dividend A', 'Dividend B', 'Divisor'], details: { firstRemainder, secondRemainder, commonRemainder: firstRemainder, divisorPosition, divisorValue: divisor }, mathematicalRule: 'Zwei verschiedene Werte besitzen bei Division durch einen dritten Wert größer als 1 denselben positiven Rest.' }));
      }
    }

    const derivedEntries = [];
    const addDerivedEntry = (key, label, position) => {
      if (!Number.isInteger(position) || position < 0 || position >= code.length) return;
      derivedEntries.push({ key, label, position });
    };
    addDerivedEntry('afterFirstPrime', 'die Zahl unmittelbar nach der ersten Primzahl', codewide.afterFirstPrime);
    addDerivedEntry('beforeLastPrime', 'die Zahl unmittelbar vor der letzten Primzahl', codewide.beforeLastPrime);
    addDerivedEntry('firstEven', 'die erste gerade Zahl von links', codewide.firstEvenPosition);
    addDerivedEntry('lastOdd', 'die letzte ungerade Zahl von links', codewide.lastOddPosition);
    addDerivedEntry('afterFirstMinimum', 'die Zahl unmittelbar nach dem ersten Vorkommen des Minimums', codewide.firstMinimumPosition < code.length - 1 ? codewide.firstMinimumPosition + 1 : null);
    addDerivedEntry('beforeLastMaximum', 'die Zahl unmittelbar vor dem letzten Vorkommen des Maximums', codewide.lastMaximumPosition > 0 ? codewide.lastMaximumPosition - 1 : null);
    addDerivedEntry('medianFirstPosition', 'der Median des Codes an seinem ersten Vorkommen', codewide.medianFirstPosition);
    for (const entryIndexes of combinations(derivedEntries.length, 3)) {
      for (const order of permutations(entryIndexes.map(index => derivedEntries[index]))) {
      const positions = order.map(entry => entry.position);
      if (new Set(positions).size !== positions.length) continue;
      const values = positions.map(position => code[position]);
      const firstDifference = values[1] - values[0];
      const secondDifference = values[2] - values[1];
      let pattern = null;
      let patternText = '';
      if (firstDifference !== 0 && firstDifference === secondDifference) { pattern = 'arithmetic'; patternText = 'bilden in dieser Reihenfolge eine arithmetische Folge mit gleichem, von null verschiedenem Abstand'; }
      else if (values[0] < values[1] && values[1] < values[2]) { pattern = 'ascending'; patternText = 'bilden in dieser Reihenfolge eine streng aufsteigende Folge'; }
      else if (values[0] > values[1] && values[1] > values[2]) { pattern = 'descending'; patternText = 'bilden in dieser Reihenfolge eine streng absteigende Folge'; }
      else if (values[0] === values[2] && values[0] !== values[1]) { pattern = 'firstThirdEqual'; patternText = 'besitzen in dieser Reihenfolge denselben ersten und dritten Wert, während der mittlere Wert davon abweicht'; }
      if (!pattern) continue;
      const text = order[0].label.charAt(0).toUpperCase() + order[0].label.slice(1) + ', ' + order[1].label + ' und ' + order[2].label + ' ' + patternText + '.';
      const derivationKeys = order.map(entry => entry.key);
        add(makeCandidate(5, 'T5-03', positions, text, 'T5-03|' + derivationKeys.join('-') + '|' + pattern, { informationStrength: 6, optional: true, requiresUnlock: true, specialRuleType: 'codeweit-abgeleitetes-muster', independentValidation: true, positionRoles: order.map(entry => entry.label), details: { derivationKeys, derivationLabels: order.map(entry => entry.label), pattern, derivedValues: values }, codewideDerivations: order.map(entry => entry.label), mathematicalRule: 'Drei eindeutig aus dem gesamten Code abgeleitete Werte erfüllen das gespeicherte Muster in der genannten Reihenfolge.' }));
      }
    }

    const betweenGroups = new Map();
    for (const witness of candidateGroups[3]['T3-07']) {
      const key = witness.details.lowerPosition + '|' + witness.details.upperPosition;
      if (!betweenGroups.has(key)) betweenGroups.set(key, []);
      if (!betweenGroups.get(key).some(candidate => candidate.details.targetPosition === witness.details.targetPosition)) betweenGroups.get(key).push(witness);
    }
    for (const witnesses of betweenGroups.values()) {
      if (witnesses.length < 3) continue;
      const proofWitnesses = witnesses.slice().sort((first, second) => first.details.targetPosition - second.details.targetPosition).slice(0, 3);
      const lowerPosition = proofWitnesses[0].details.lowerPosition;
      const upperPosition = proofWitnesses[0].details.upperPosition;
      add(makeCandidate(5, 'T5-04', [], 'Einer der genannten Hinweise ist falsch!', 'T5-04|proof|' + lowerPosition + '-' + upperPosition + '|' + proofWitnesses.map(candidate => candidate.details.targetPosition).join('-'), { informationStrength: 7, optional: true, requiresUnlock: true, specialRuleType: 'genau-ein-absichtlich-falscher-hinweis', independentValidation: true, details: { lowerPosition, upperPosition, witnessSignatures: proofWitnesses.map(candidate => candidate.signature), witnessTargetPositions: proofWitnesses.map(candidate => candidate.details.targetPosition), requiredTrueWitnessCount: 3, fairnessProofType: 'three-strict-between-witnesses' }, mathematicalRule: 'Genau ein anderer Hinweis ist falsch; drei wahre Zwischenbeziehungen identifizieren den umgekehrten Vergleich eindeutig.' }));
      if (candidateGroups[5]['T5-04'].length >= 24) break;
    }
  }

  function addProductComparisonCandidate(selectedPositions) {
    const orderedPositions = freePositionOrder(selectedPositions);
    const firstProduct = code[orderedPositions[0]] * code[orderedPositions[1]];
    const secondProduct = code[orderedPositions[2]] * code[orderedPositions[3]];
    const comparison = relation(firstProduct, secondProduct);
    add(makeCandidate(4, 'T4-06', orderedPositions, tier4ProductComparisonText(code, orderedPositions), null, { informationStrength: 3, positionRoles: ['Produkt A', 'Produkt A', 'Produkt B', 'Produkt B'], details: { firstProduct, secondProduct, comparison }, mathematicalRule: 'Produkt A wird mit Produkt B verglichen' }));
  }

  function orderSmallGroup(positions) {
    if (positions.length === 2) return [positions[1], positions[0]];
    if (positions.length === 3) return [positions[1], positions[2], positions[0]];
    return freePositionOrder(positions);
  }

  function addExactlyOnePairCandidate(selectedPositions) {
    const orderedPositions = freePositionOrder(selectedPositions);
    const frequencies = new Map();
    for (const position of orderedPositions) frequencies.set(code[position], (frequencies.get(code[position]) || 0) + 1);
    const counts = Array.from(frequencies.values());
    const hasExactlyOnePair = counts.filter(count => count === 2).length === 1 && counts.every(count => count === 1 || count === 2);
    if (hasExactlyOnePair) {
      add(makeCandidate(4, 'T4-09', orderedPositions, tier4ExactlyOnePairText(orderedPositions), null, { informationStrength: 3, optional: true }));
    }
  }

  function addEqualGroupSumCandidates(selectedPositions) {
    const firstGroupSize = selectedPositions.length === 5 ? 2 : 3;
    for (const selectedIndexes of combinations(selectedPositions.length, firstGroupSize)) {
      const firstRaw = selectedIndexes.map(index => selectedPositions[index]);
      const firstSet = new Set(firstRaw);
      const secondRaw = selectedPositions.filter(position => !firstSet.has(position));
      if (selectedPositions.length === 6 && firstRaw.join('-') > secondRaw.join('-')) continue;
      const firstGroup = orderSmallGroup(firstRaw);
      const secondGroup = orderSmallGroup(secondRaw);
      const firstSum = firstGroup.reduce((sum, position) => sum + code[position], 0);
      const secondSum = secondGroup.reduce((sum, position) => sum + code[position], 0);
      const positions = firstGroup.concat(secondGroup);
      if (firstSum === secondSum) {
        const signature = 'T4-08|' + firstGroup.join('-') + '|' + secondGroup.join('-');
        add(makeCandidate(4, 'T4-08', positions, tier4EqualGroupSumsText(firstGroup, secondGroup), signature, { informationStrength: 4, optional: true, positionRoles: firstGroup.map(() => 'Gruppe A').concat(secondGroup.map(() => 'Gruppe B')), details: { firstGroup, secondGroup, firstSum, secondSum }, mathematicalRule: 'Summe Gruppe A = Summe Gruppe B' }));
      } else {
        const groupSizeKey = firstGroup.length + ':' + secondGroup.length;
        if (groupComparisonCounts[groupSizeKey] >= MAX_OPTIONAL_CANDIDATES / 2) continue;
        const relationWord = firstSum > secondSum ? 'mehr' : 'weniger';
        const signature = 'T4-14|' + firstGroup.join('-') + '|' + secondGroup.join('-') + '|' + relationWord;
        add(makeCandidate(4, 'T4-14', positions, tier4GroupComparisonText(firstGroup, secondGroup, relationWord), signature, { informationStrength: 3, optional: true, positionRoles: firstGroup.map(() => 'Gruppe A').concat(secondGroup.map(() => 'Gruppe B')), details: { firstGroup, secondGroup, firstSum, secondSum, relation: relationWord }, mathematicalRule: 'Ungleiche Summen zweier disjunkter Gruppen' }));
        groupComparisonCounts[groupSizeKey]++;
      }
    }
  }

  function addSequenceCandidates(selectedPositions) {
    const values = selectedPositions.map(position => code[position]);
    if (new Set(values).size !== values.length) return;
    const ascending = selectedPositions.slice().sort((first, second) => code[first] - code[second]);
    const descending = ascending.slice().reverse();
    if (candidateGroups[4]['T4-11'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-11', ascending, tier4StrictSequenceText(ascending, 'ascending'), null, { informationStrength: 4, optional: true, details: { direction: 'ascending' }, mathematicalRule: 'Wert 1 < Wert 2 < ...' }));
    }
    if (candidateGroups[4]['T4-12'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-12', descending, tier4StrictSequenceText(descending, 'descending'), null, { informationStrength: 4, optional: true, details: { direction: 'descending' }, mathematicalRule: 'Wert 1 > Wert 2 > ...' }));
    }
    const distance = code[ascending[1]] - code[ascending[0]];
    const arithmetic = distance > 0 && ascending.slice(1).every((position, index) => code[position] - code[ascending[index]] === distance);
    if (arithmetic && candidateGroups[4]['T4-13'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-13', ascending, tier4ArithmeticSequenceText(ascending), 'T4-13|ascending|' + ascending.join('-'), { informationStrength: 4, optional: true, details: { distance }, mathematicalRule: 'Alle aufeinanderfolgenden Differenzen sind gleich und ungleich 0' }));
      if (candidateGroups[4]['T4-13'].length < MAX_OPTIONAL_CANDIDATES) {
        add(makeCandidate(4, 'T4-13', descending, tier4ArithmeticSequenceText(descending), 'T4-13|descending|' + descending.join('-'), { informationStrength: 4, optional: true, details: { distance: -distance }, mathematicalRule: 'Alle aufeinanderfolgenden Differenzen sind gleich und ungleich 0' }));
      }
    }
  }

  function addFrequencyPatternCandidates(selectedPositions) {
    const orderedPositions = freePositionOrder(selectedPositions);
    const frequencies = new Map();
    for (const position of orderedPositions) frequencies.set(code[position], (frequencies.get(code[position]) || 0) + 1);
    const counts = Array.from(frequencies.values());
    const twoPairs = counts.filter(count => count === 2).length === 2 && counts.every(count => count === 1 || count === 2);
    if (twoPairs && candidateGroups[4]['T4-16'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-16', orderedPositions, tier4TwoPairsText(orderedPositions), null, { informationStrength: 4, optional: true, details: { frequencyCounts: counts }, mathematicalRule: 'Genau zwei verschiedene Werte kommen jeweils exakt zweimal vor' }));
    }
    if (counts.every(count => count === 1) && candidateGroups[4]['T4-17'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-17', orderedPositions, tier4AllDifferentText(orderedPositions), null, { informationStrength: 3, optional: true, details: { frequencyCounts: counts }, mathematicalRule: 'Alle ausgewählten Werte sind paarweise verschieden' }));
    }
    const exactlyThree = counts.filter(count => count === 3).length === 1 && counts.every(count => count === 1 || count === 3);
    if (exactlyThree && candidateGroups[4]['T4-22'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-22', orderedPositions, tier4ExactlyThreeEqualText(orderedPositions), null, { informationStrength: 4, optional: true, details: { frequencyCounts: counts }, mathematicalRule: 'Genau ein Wert kommt dreimal vor; alle übrigen genau einmal' }));
    }
  }

  function perfectPairings(positions) {
    if (positions.length === 0) return [[]];
    const first = positions[0];
    const result = [];
    for (let index = 1; index < positions.length; index++) {
      const pair = [first, positions[index]];
      const remaining = positions.slice(1, index).concat(positions.slice(index + 1));
      for (const rest of perfectPairings(remaining)) result.push([pair].concat(rest));
    }
    return result;
  }

  function addThreePairSumsCandidates(selectedPositions) {
    if (candidateGroups[4]['T4-18'].length >= MAX_OPTIONAL_CANDIDATES) return;
    for (const pairing of perfectPairings(selectedPositions)) {
      const sums = pairing.map(pair => code[pair[0]] + code[pair[1]]);
      if (!sums.every(sum => sum === sums[0])) continue;
      const positions = [pairing[0][0], pairing[1][0], pairing[2][0], pairing[2][1], pairing[1][1], pairing[0][1]];
      const forward = positions.join('-');
      const backward = positions.slice().reverse().join('-');
      const signature = 'T4-18|' + (forward < backward ? forward : backward);
      add(makeCandidate(4, 'T4-18', positions, tier4ThreePairSumsText(positions), signature, { informationStrength: 5, optional: true, positionRoles: ['Paar 1', 'Paar 2', 'Paar 3', 'Paar 3', 'Paar 2', 'Paar 1'], details: { pairSum: sums[0] }, mathematicalRule: 'Wert 1 + Wert 6 = Wert 2 + Wert 5 = Wert 3 + Wert 4' }));
      if (candidateGroups[4]['T4-18'].length >= MAX_OPTIONAL_CANDIDATES) return;
    }
  }

  function addPairSumDifferenceCandidates(selectedPositions) {
    if (candidateGroups[4]['T4-19'].length >= MAX_OPTIONAL_CANDIDATES) return;
    for (const targetPosition of selectedPositions) {
      const sourcePositions = selectedPositions.filter(position => position !== targetPosition);
      for (const firstIndexes of combinations(sourcePositions.length, 2)) {
        const firstRaw = firstIndexes.map(index => sourcePositions[index]);
        const firstSet = new Set(firstRaw);
        const secondRaw = sourcePositions.filter(position => !firstSet.has(position));
        if (firstRaw.join('-') > secondRaw.join('-')) continue;
        const firstGroup = orderSmallGroup(firstRaw);
        const secondGroup = orderSmallGroup(secondRaw);
        const difference = Math.abs(firstGroup.reduce((sum, position) => sum + code[position], 0) - secondGroup.reduce((sum, position) => sum + code[position], 0));
        if (difference !== code[targetPosition]) continue;
        const positions = [firstGroup[0], firstGroup[1], targetPosition, secondGroup[0], secondGroup[1]];
        add(makeCandidate(4, 'T4-19', positions, tier4PairSumDifferenceText(positions), null, { informationStrength: 5, optional: true, positionRoles: ['Summe A', 'Summe A', 'Zielposition', 'Summe B', 'Summe B'], details: { firstGroup, secondGroup, targetPosition, difference }, mathematicalRule: 'Wert C = abs((Wert A + Wert B) - (Wert D + Wert E))' }));
        if (candidateGroups[4]['T4-19'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addCheckDigitCandidates(selectedPositions) {
    if (candidateGroups[4]['T4-21'].length >= MAX_OPTIONAL_CANDIDATES) return;
    for (const targetPosition of selectedPositions) {
      const sourcePositions = freePositionOrder(selectedPositions.filter(position => position !== targetPosition));
      const sourceSum = sourcePositions.reduce((sum, position) => sum + code[position], 0);
      if (sourceSum % 10 !== code[targetPosition]) continue;
      const positions = sourcePositions.concat(targetPosition);
      add(makeCandidate(4, 'T4-21', positions, tier4CheckDigitText(sourcePositions, targetPosition), null, { informationStrength: 5, optional: true, positionRoles: sourcePositions.map(() => 'Summenposition').concat('Prüfziffer'), details: { sourcePositions, targetPosition, sourceSum, checkDigit: sourceSum % 10 }, mathematicalRule: 'Summe der Quellwerte modulo 10 = Wert der Prüfziffer' }));
      if (candidateGroups[4]['T4-21'].length >= MAX_OPTIONAL_CANDIDATES) return;
    }
  }

  function addAbcAbcCandidates() {
    const positionsByValue = Array.from({ length: 10 }, () => []);
    for (let position = 0; position < code.length; position++) positionsByValue[code[position]].push(position);
    for (let firstValue = 0; firstValue <= 9; firstValue++) {
      for (let secondValue = 0; secondValue <= 9; secondValue++) {
        for (let thirdValue = 0; thirdValue <= 9; thirdValue++) {
          if (firstValue === secondValue && secondValue === thirdValue) continue;
          const pattern = [firstValue, secondValue, thirdValue, firstValue, secondValue, thirdValue];
          const cursors = Array(10).fill(0);
          const positions = [];
          let available = true;
          for (const value of pattern) {
            if (cursors[value] >= positionsByValue[value].length) { available = false; break; }
            positions.push(positionsByValue[value][cursors[value]++]);
          }
          if (!available) continue;
          add(makeCandidate(4, 'T4-10', positions, tier4AbcAbcText(positions), null, { informationStrength: 5, optional: true, details: { patternValues: [firstValue, secondValue, thirdValue] }, mathematicalRule: 'Wertfolge A-B-C-A-B-C mit mindestens zwei verschiedenen Werten' }));
          if (candidateGroups[4]['T4-10'].length >= MAX_OPTIONAL_CANDIDATES) return;
        }
      }
    }
  }

  function l054OrderedGroups(count, familyKey) {
    const offset = stableTextHash(familyKey + '|offset|' + code.join('')) % code.length;
    const step = 1 + stableTextHash(familyKey + '|step|' + code.join('')) % (code.length - 1);
    const positionOrder = Array.from({ length: code.length }, (_, index) => (offset + index * step) % code.length);
    return combinations(code.length, count).map(group => group.map(position => positionOrder[position]));
  }

  function addL054PointBeforeCandidates() {
    for (const triple of l054OrderedGroups(3, 'T3-17')) {
      for (const termPosition of triple) {
        const factors = triple.filter(position => position !== termPosition);
        if (code[factors[0]] < 2 || code[factors[1]] < 2 || code[termPosition] < 1) continue;
        const positions = [factors[0], factors[1], termPosition];
        const plusEvaluation = l054PointBeforeEvaluation(code[factors[0]], code[factors[1]], code[termPosition], 'productPlus');
        if (plusEvaluation.didacticallyValid && plusEvaluation.result <= L054_MAX_RESULT) {
          const informationExclusionPercent = l054ExactInformation('productPlus', plusEvaluation.result);
          add(makeCandidate(3, 'T3-17', positions, tier3PointBeforeText(positions, 'productPlus', plusEvaluation.result), 'T3-17|productPlus|' + positions.join('-') + '|' + plusEvaluation.result, { informationStrength: 5, optional: true, positionRoles: ['Faktor A', 'Faktor B', 'Summand'], details: { variant: 'productPlus', result: plusEvaluation.result, leftToRightResult: plusEvaluation.leftToRightResult, visibleOperatorOrder: 'summand-plus-product', factorPositions: factors, termPosition, informationExclusionPercent }, mathematicalRule: 'Wert C + Wert A × Wert B = gespeichertes Ergebnis; eine strikt links-nach-rechts berechnete Alternative muss davon abweichen.' }));
        }
        const minusEvaluation = l054PointBeforeEvaluation(code[factors[0]], code[factors[1]], code[termPosition], 'productMinus');
        if (minusEvaluation.didacticallyValid && minusEvaluation.result >= 0 && minusEvaluation.result <= L054_MAX_RESULT) {
          const informationExclusionPercent = l054ExactInformation('productMinus', minusEvaluation.result);
          add(makeCandidate(3, 'T3-17', positions, tier3PointBeforeText(positions, 'productMinus', minusEvaluation.result), 'T3-17|productMinus|' + positions.join('-') + '|' + minusEvaluation.result, { informationStrength: 5, optional: true, positionRoles: ['Faktor A', 'Faktor B', 'Minuend'], details: { variant: 'productMinus', result: minusEvaluation.result, leftToRightResult: minusEvaluation.leftToRightResult, visibleOperatorOrder: 'minuend-minus-product', factorPositions: factors, termPosition, informationExclusionPercent }, mathematicalRule: 'Wert C - Wert A × Wert B = gespeichertes nichtnegatives Ergebnis; eine strikt links-nach-rechts berechnete Alternative muss davon abweichen.' }));
        }
        if (candidateGroups[3]['T3-17'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addL054ParenthesesCandidates() {
    for (const triple of l054OrderedGroups(3, 'T3-18')) {
      for (const multiplierPosition of triple) {
        const operands = triple.filter(position => position !== multiplierPosition);
        if (code[multiplierPosition] < 2) continue;
        const sum = code[operands[0]] + code[operands[1]];
        const plusResult = sum * code[multiplierPosition];
        if (sum > 0 && plusResult <= L054_MAX_RESULT) {
          const positions = [operands[0], operands[1], multiplierPosition];
          const informationExclusionPercent = l054ExactInformation('groupedPlus', plusResult);
          add(makeCandidate(3, 'T3-18', positions, tier3ParenthesesText(positions, 'groupedPlus', plusResult), 'T3-18|groupedPlus|' + positions.join('-') + '|' + plusResult, { informationStrength: 5, optional: true, positionRoles: ['Klammeroperand A', 'Klammeroperand B', 'Multiplikator'], details: { variant: 'groupedPlus', result: plusResult, operandPositions: operands, multiplierPosition, informationExclusionPercent }, mathematicalRule: '(Wert A + Wert B) × Wert C = gespeichertes Ergebnis; die Klammer wird zuerst berechnet.' }));
        }
        const highPosition = code[operands[0]] >= code[operands[1]] ? operands[0] : operands[1];
        const lowPosition = highPosition === operands[0] ? operands[1] : operands[0];
        const difference = code[highPosition] - code[lowPosition];
        const minusResult = difference * code[multiplierPosition];
        if (difference > 0 && minusResult <= L054_MAX_RESULT) {
          const positions = [highPosition, lowPosition, multiplierPosition];
          const informationExclusionPercent = l054ExactInformation('groupedMinus', minusResult);
          add(makeCandidate(3, 'T3-18', positions, tier3ParenthesesText(positions, 'groupedMinus', minusResult), 'T3-18|groupedMinus|' + positions.join('-') + '|' + minusResult, { informationStrength: 5, optional: true, positionRoles: ['Minuend in Klammer', 'Subtrahend in Klammer', 'Multiplikator'], details: { variant: 'groupedMinus', result: minusResult, operandPositions: [highPosition, lowPosition], multiplierPosition, informationExclusionPercent }, mathematicalRule: '(Wert A - Wert B) × Wert C = gespeichertes Ergebnis; die Klammer wird zuerst berechnet.' }));
        }
        if (candidateGroups[3]['T3-18'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addL054ProductDigitSumCandidates() {
    for (const triple of l054OrderedGroups(3, 'T3-19')) {
      for (const targetPosition of triple) {
        const factors = triple.filter(position => position !== targetPosition);
        const product = code[factors[0]] * code[factors[1]];
        const digitSum = l054DigitSum(product);
        if (product < 10 || digitSum > 9 || code[targetPosition] !== digitSum) continue;
        const positions = [factors[0], factors[1], targetPosition];
        add(makeCandidate(3, 'T3-19', positions, tier3ProductDigitSumText(positions), 'T3-19|productDigitSum|' + positions.join('-'), { informationStrength: 5, optional: true, positionRoles: ['Faktor A', 'Faktor B', 'Quersummenziel'], details: { variant: 'productDigitSum', product, digitSum, targetPosition, informationExclusionPercent: L054_PRODUCT_DIGIT_SUM_EXCLUSION_PERCENT }, mathematicalRule: 'Das mindestens zweistellige Produkt aus Wert A und Wert B besitzt eine erste Quersumme von 0 bis 9, die exakt Wert C entspricht.' }));
        if (candidateGroups[3]['T3-19'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addL054ComposedDivisibilityCandidates() {
    const orderedPairs = l054OrderedGroups(2, 'T3-20').flatMap(pair => [pair, pair.slice().reverse()]);
    for (const pair of orderedPairs) {
      if (code[pair[0]] === 0) continue;
      const composedNumber = code[pair[0]] * 10 + code[pair[1]];
      for (const divisor of L054_DIVISORS) {
        if (composedNumber % divisor !== 0) continue;
        const validNumbers = Math.floor(99 / divisor) - Math.floor(9 / divisor);
        const informationExclusionPercent = l054ExclusionPercent(validNumbers, 100);
        add(makeCandidate(3, 'T3-20', pair, tier3ComposedDivisibilityText(pair, divisor), 'T3-20|composedDivisibility|' + pair.join('-') + '|' + divisor, { informationStrength: 4, optional: true, positionRoles: ['Zehnerstelle', 'Einerstelle'], details: { variant: 'composedDivisibility', composedNumber, divisor, informationExclusionPercent }, mathematicalRule: '10 × Wert A + Wert B bildet ohne führende Null eine zweistellige Zahl, die durch den gespeicherten Divisor größer 1 teilbar ist.' }));
        if (candidateGroups[3]['T3-20'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addL054MixedComparisonCandidates() {
    for (const positions of l054OrderedGroups(6, 'T4-23')) {
      if (code[positions[0]] < 2 || code[positions[1]] < 2 || code[positions[2]] < 1 || code[positions[3]] < 1 || code[positions[4]] < 2 || code[positions[5]] < 2) continue;
      const evaluation = l054MixedComparisonEvaluation(code, positions);
      if (!evaluation.didacticallyValid || Math.max(evaluation.leftResult, evaluation.rightResult) > L054_MAX_RESULT) continue;
      add(makeCandidate(4, 'T4-23', positions, tier4MixedExpressionComparisonText(positions, evaluation.comparison), 'T4-23|mixedComparison|' + positions.join('-') + '|' + evaluation.comparison, { informationStrength: 6, optional: true, positionRoles: ['Linker Faktor A', 'Linker Faktor B', 'Linker Summand', 'Rechter Summand', 'Rechter Faktor A', 'Rechter Faktor B'], details: { variant: 'mixedComparison', leftResult: evaluation.leftResult, rightResult: evaluation.rightResult, leftToRightLeftResult: evaluation.leftToRightLeftResult, leftToRightRightResult: evaluation.leftToRightRightResult, comparison: evaluation.comparison, leftToRightComparison: evaluation.leftToRightComparison, informationExclusionPercent: L054_MIXED_EXCLUSION_PERCENT }, mathematicalRule: 'Wert C + Wert A × Wert B wird mit Wert D + Wert E × Wert F verglichen; die strikt links-nach-rechts berechnete Vergleichsaussage muss falsch oder gleich sein.' }));
      if (candidateGroups[4]['T4-23'].length >= MAX_OPTIONAL_CANDIDATES) return;
    }
  }

  function addL054Candidates() {
    addL054PointBeforeCandidates();
    addL054ParenthesesCandidates();
    addL054ProductDigitSumCandidates();
    addL054ComposedDivisibilityCandidates();
    addL054MixedComparisonCandidates();
    for (const tier of [3, 4]) for (const id of L054_HINT_IDS) for (const candidate of candidateGroups[tier][id] || []) candidate.selectionPriority = 8;
  }

  for (let position = 0; position < code.length; position++) {
    const positions = [position];
    add(makeCandidate(1, 'T1-01', positions, tier1ParityText(code, positions)));
    add(makeCandidate(1, 'T1-02', positions, tier1PrimeText(code, positions)));
    add(makeCandidate(1, 'T1-03', positions, tier1SquareText(code, positions)));
    add(makeCandidate(1, 'T1-05', positions, tier1CompositeText(code, positions), null, { informationStrength: 2, details: { composite: COMPOSITE_DIGITS.has(code[position]) }, mathematicalRule: 'Zusammengesetzte Ziffer mit mehr als zwei positiven Teilern' }));
    add(makeCandidate(1, 'T1-06', positions, tier1PowerOfTwoText(code, positions), null, { informationStrength: 2, details: { powerOfTwo: POWER_OF_TWO_DIGITS.has(code[position]) }, mathematicalRule: 'Ziffer ist eine Potenz der Basis 2' }));
    add(makeCandidate(1, 'T1-07', positions, tier1CubeText(code, positions), null, { details: { cube: CUBE_DIGITS.has(code[position]) }, mathematicalRule: 'Ziffer ist eine Kubikzahl 0, 1 oder 8' }));
    add(makeCandidate(1, 'T1-08', positions, tier1FibonacciText(code, positions)));
    const samePositionParity = code[position] % 2 === (position + 1) % 2;
    add(makeCandidate(1, 'T1-09', positions, tier1PositionParityText(code, positions), null, { informationStrength: 2, details: { samePositionParity }, mathematicalRule: 'Parität der Ziffer im Vergleich zur sichtbaren Positionsnummer' }));
    add(makeCandidate(1, 'T1-12', positions, tier1DistinctPrimeSumText(code, positions), null, { informationStrength: 2, details: { distinctPrimeSum: DISTINCT_PRIME_SUM_DIGITS.has(code[position]) }, mathematicalRule: 'Ziffer ist als Summe zweier verschiedener Primziffern darstellbar' }));
    const factorial = FACTORIAL_DIGITS.has(code[position]);
    const factorialAllowedValues = factorial ? [1, 2, 6] : [0, 3, 4, 5, 7, 8, 9];
    add(makeCandidate(1, 'T1-13', positions, tier1FactorialText(code, positions), null, { informationStrength: factorial ? 3 : 1, details: { factorial, allowedValues: factorialAllowedValues }, mathematicalRule: 'Ziffer ist eine Fakultätszahl der Folge 1, 2, 6' }));
    add(makeCandidate(1, 'T1-14', positions, tier1TriangularText(code, positions), null, { informationStrength: 2, details: { triangular: TRIANGULAR_DIGITS.has(code[position]) }, mathematicalRule: 'Ziffer ist eine Dreieckszahl der Folge 0, 1, 3, 6' }));
    const digitHint = DIGIT_HINT_BY_DIGIT.get(code[position]);
    if (digitHint.id === 'T1-DIGIT-06') {
      for (let sourcePosition = 0; sourcePosition < code.length; sourcePosition++) {
        if (sourcePosition === position || code[sourcePosition] !== digitHint.sourceDigit) continue;
        const relationPositions = [position, sourcePosition];
        add(makeCandidate(1, digitHint.id, relationPositions, digitHintText(digitHint, relationPositions), digitHint.id + '|' + position + '|' + sourcePosition, { informationStrength: 6, optional: true, selectionPriority: 2, positionRoles: ['Fakultätsziel 6', 'Fakultätsbasis 3'], details: { digitValue: digitHint.digit, propertyKey: digitHint.propertyKey, expression: digitHint.expression, targetPosition: position, sourcePosition, sourceDigit: digitHint.sourceDigit }, mathematicalRule: 'Die Ziffer an der Quellposition ist exakt 3 und 3! = 6 bestimmt die Ziffer an der Zielposition.' }));
      }
    } else {
      add(makeCandidate(1, digitHint.id, positions, digitHintText(digitHint, positions), digitHint.id + '|' + position, { informationStrength: 6, optional: true, selectionPriority: 2, positionRoles: ['Direkt mathematisch bestimmte Ziffer'], details: { digitValue: digitHint.digit, propertyKey: digitHint.propertyKey, expression: digitHint.expression }, mathematicalRule: 'Die mathematische Eigenschaft ' + digitHint.propertyKey + ' bestimmt eindeutig die Ziffer ' + digitHint.digit + '.' }));
    }
  }

  const comparisonPositions = existingComparison.positions;
  const expectedComparisonText = comparisonText(code, comparisonPositions);
  const comparisonCandidateText = existingComparison.text === expectedComparisonText ? existingComparison.text : expectedComparisonText;
  add(makeCandidate(2, 'T2-01', comparisonPositions, comparisonCandidateText));

  for (const pair of combinations(code.length, 2)) {
    const pairSum = code[pair[0]] + code[pair[1]];
    const pairDifference = Math.abs(code[pair[0]] - code[pair[1]]);
    add(makeCandidate(2, 'T2-02', pair, tier2SumSquareText(code, pair), null, { informationStrength: 2, details: { sum: pairSum, square: SQUARE_SUMS.has(pairSum) }, mathematicalRule: 'Quadratzahleigenschaft der Summe zweier Positionen' }));
    add(makeCandidate(2, 'T2-03', pair, tier2DifferenceSquareText(code, pair), null, { informationStrength: 2, details: { difference: pairDifference, square: SQUARE_SUMS.has(pairDifference) }, mathematicalRule: 'Quadratzahleigenschaft des absoluten Unterschieds' }));
    add(makeCandidate(2, 'T2-04', pair, tier2ParityText(code, pair), null, { informationStrength: 2, details: { sameParity: code[pair[0]] % 2 === code[pair[1]] % 2 }, mathematicalRule: 'Beide Werte besitzen dieselbe oder unterschiedliche Parität' }));
    add(makeCandidate(2, 'T2-06', pair, tier2DifferenceParityText(code, pair)));
    const pairProduct = code[pair[0]] * code[pair[1]];
    const productSquare = Number.isInteger(Math.sqrt(pairProduct));
    add(makeCandidate(2, 'T2-07', pair, tier2ProductSquareText(code, pair), null, { informationStrength: productSquare ? 3 : 2, details: { product: pairProduct, square: productSquare }, mathematicalRule: 'Quadratzahleigenschaft des Produkts zweier Positionen' }));
    add(makeCandidate(2, 'T2-13', pair, tier2DifferencePrimeText(code, pair), null, { details: { difference: Math.abs(code[pair[0]] - code[pair[1]]) }, mathematicalRule: 'Primzahleigenschaft des absoluten Unterschieds' }));
    add(makeCandidate(2, 'T2-14', pair, tier2EqualityText(code, pair), null, { details: { equal: code[pair[0]] === code[pair[1]] }, mathematicalRule: 'Werte sind gleich oder verschieden' }));
    add(makeCandidate(2, 'T2-16', pair, tier2SumPrimeText(code, pair), null, { details: { sum: code[pair[0]] + code[pair[1]], prime: PRIME_SUMS.has(code[pair[0]] + code[pair[1]]) }, mathematicalRule: 'Primzahleigenschaft der Summe' }));
    if (Math.abs(code[pair[0]] - code[pair[1]]) === 1) {
      add(makeCandidate(2, 'T2-08', pair, tier2NeighborText(pair), null, { informationStrength: 3, optional: true }));
    }
    const firstValue = code[pair[0]];
    const secondValue = code[pair[1]];
    if (firstValue !== secondValue && (firstValue === secondValue * 2 || secondValue === firstValue * 2)) {
      const ratioDirection = code[pair[0]] === code[pair[1]] * 2 ? 'double' : 'half';
      add(makeCandidate(2, 'T2-09', pair, tier2DoubleHalfText(code, pair), null, { informationStrength: 3, optional: true, details: { ratioDirection }, mathematicalRule: ratioDirection === 'double' ? 'Wert A = 2 × Wert B' : 'Wert A × 2 = Wert B' }));
    }
    add(makeCandidate(2, 'T2-10', pair, tier2SumFibonacciText(code, pair), null, { informationStrength: 2, details: { sum: pairSum, fibonacci: FIBONACCI_SUMS.has(pairSum) }, mathematicalRule: 'Fibonacci-Eigenschaft der Summe zweier Positionen' }));
    for (const order of [pair, pair.slice().reverse()]) {
      const dividend = code[order[0]];
      const divisor = code[order[1]];
      if (divisor !== 0 && dividend !== divisor && dividend % divisor === 0 && dividend / divisor >= 2) {
        const strength = divisor === 1 ? 1 : 3;
        add(makeCandidate(2, 'T2-11', order, tier2DivisibilityText(order), null, { informationStrength: strength, optional: true, details: { dividend, divisor, quotient: dividend / divisor } }));
      }
      if (code[order[0]] !== 0) {
        const composedNumber = code[order[0]] * 10 + code[order[1]];
        const square = Number.isInteger(Math.sqrt(composedNumber));
        add(makeCandidate(2, 'T2-12', order, tier2ComposedSquareText(code, order), null, { informationStrength: square ? 4 : 2, details: { composedNumber, square }, mathematicalRule: 'Quadratzahleigenschaft der zweistelligen Zahl in gespeicherter Reihenfolge' }));
      }
    }
  }
  for (let mirrorIndex = 0; mirrorIndex < 5; mirrorIndex++) {
    const mirrorPair = [mirrorIndex, code.length - 1 - mirrorIndex];
    if (Math.abs(code[mirrorPair[0]] - 5) === Math.abs(code[mirrorPair[1]] - 5)) {
      add(makeCandidate(2, 'T2-15', mirrorPair, tier2MirrorDistanceText(mirrorPair), null, { informationStrength: 3, optional: true, details: { distance: Math.abs(code[mirrorPair[0]] - 5) }, mathematicalRule: 'abs(Wert A - 5) = abs(Wert B - 5)' }));
    }
  }

  for (const triple of combinations(code.length, 3)) {
    const sumComparison = relation(code[triple[0]] + code[triple[1]], code[triple[2]]);
    add(makeCandidate(3, 'T3-01', triple, tier3SumComparisonText(code, triple), null, { details: { comparison: sumComparison }, mathematicalRule: 'Summe der ersten zwei Werte wird mit dem dritten Wert verglichen' }));
    const tripleProduct = code[triple[0]] * code[triple[1]];
    const productComparison = relation(tripleProduct, code[triple[2]]);
    add(makeCandidate(3, 'T3-03', triple, tier3ProductComparisonText(code, triple), null, { informationStrength: 3, positionRoles: ['Faktor A', 'Faktor B', 'Vergleichsposition'], details: { product: tripleProduct, comparison: productComparison }, mathematicalRule: 'Produkt der ersten zwei Werte wird mit dem dritten Wert verglichen' }));
    const tripleValues = triple.map(position => code[position]);
    const distinctValueCount = new Set(tripleValues).size;
    const valuesAreDifferent = distinctValueCount === 3;
    const exactlyTwoEqual = distinctValueCount === 2 && tripleValues.some(value => tripleValues.filter(otherValue => otherValue === value).length === 2);
    if (exactlyTwoEqual) add(makeCandidate(3, 'T3-04', triple, tier3ExactlyTwoEqualText(triple), null, { informationStrength: 3, optional: true }));
    if (valuesAreDifferent) {
      const ascending = triple.slice().sort((first, second) => code[first] - code[second]);
      const descending = ascending.slice().reverse();
      add(makeCandidate(3, 'T3-02', ascending, tier3OrderText(code, ascending)));
      add(makeCandidate(3, 'T3-02', descending, tier3OrderText(code, descending)));
      const orderedByValue = triple.slice().sort((first, second) => code[first] - code[second]);
      const betweenOrder = [orderedByValue[1], orderedByValue[0], orderedByValue[2]];
      add(makeCandidate(3, 'T3-07', betweenOrder, tier3StrictBetweenText(betweenOrder), null, { informationStrength: 4, positionRoles: ['Zielposition', 'Untere Grenze', 'Obere Grenze'], details: { targetPosition: betweenOrder[0], lowerPosition: betweenOrder[1], upperPosition: betweenOrder[2] }, mathematicalRule: 'Wert der Zielposition ist strikt größer als der untere und strikt kleiner als der obere Positionswert' }));
    }
    const differenceOrder = [triple[1], triple[2], triple[0]];
    const comparedDifference = Math.abs(code[differenceOrder[0]] - code[differenceOrder[1]]);
    const differenceComparison = relation(comparedDifference, code[differenceOrder[2]]);
    add(makeCandidate(3, 'T3-08', differenceOrder, tier3DifferenceComparisonText(code, differenceOrder), null, { informationStrength: 3, positionRoles: ['Abstand A', 'Abstand B', 'Vergleichsposition'], details: { difference: comparedDifference, comparison: differenceComparison }, mathematicalRule: 'Absoluter Abstand der ersten zwei Werte wird mit dem dritten Wert verglichen' }));
    const sumParityOrder = [triple[2], triple[0], triple[1]];
    const tripleSum = sumParityOrder.reduce((sum, position) => sum + code[position], 0);
    add(makeCandidate(3, 'T3-15', sumParityOrder, tier3SumParityText(code, sumParityOrder), null, { informationStrength: 2, details: { sum: tripleSum, parity: tripleSum % 2 === 0 ? 'even' : 'odd' }, mathematicalRule: 'Parität der Summe dreier Werte' }));
    const roleOrders = [
      [triple[0], triple[1], triple[2]],
      [triple[0], triple[2], triple[1]],
      [triple[1], triple[2], triple[0]]
    ];
    for (const roleOrder of roleOrders) {
      const firstValue = code[roleOrder[0]];
      const secondValue = code[roleOrder[1]];
      const targetValue = code[roleOrder[2]];
      if (firstValue + secondValue === targetValue) {
        add(makeCandidate(3, 'T3-10', roleOrder, tier3ExactSumText(roleOrder), null, { informationStrength: 4, optional: true, positionRoles: ['Summand A', 'Summand B', 'Zielposition'], details: { targetPosition: roleOrder[2], sum: targetValue }, mathematicalRule: 'Wert A + Wert B = Wert C' }));
      }
      if (Math.abs(firstValue - secondValue) === targetValue) {
        add(makeCandidate(3, 'T3-11', roleOrder, tier3ExactDifferenceText(roleOrder), null, { informationStrength: 4, optional: true, positionRoles: ['Ausgangswert A', 'Ausgangswert B', 'Zielposition'], details: { targetPosition: roleOrder[2], difference: targetValue }, mathematicalRule: 'abs(Wert A - Wert B) = Wert C' }));
      }
      if (firstValue !== secondValue && firstValue + secondValue === 2 * targetValue) {
        add(makeCandidate(3, 'T3-12', roleOrder, tier3AverageText(roleOrder), null, { informationStrength: 4, optional: true, positionRoles: ['Außenwert A', 'Außenwert B', 'Durchschnittsposition'], details: { targetPosition: roleOrder[2], average: targetValue }, mathematicalRule: 'Wert A + Wert B = 2 × Wert C' }));
      }
      if ((firstValue * secondValue) % 10 === targetValue) {
        add(makeCandidate(3, 'T3-16', roleOrder, tier3ProductDigitText(roleOrder), null, { informationStrength: 5, optional: true, positionRoles: ['Faktor A', 'Faktor B', 'Zielposition'], details: { targetPosition: roleOrder[2], product: firstValue * secondValue, lastDigit: targetValue }, mathematicalRule: '(Wert A × Wert B) modulo 10 = Wert C' }));
      }
    }
    const rangeOrder = [triple[1], triple[2], triple[0]];
    const rangeValues = rangeOrder.map(position => code[position]);
    const rangeDistance = Math.max(...rangeValues) - Math.min(...rangeValues);
    if (rangeDistance > 0) {
      add(makeCandidate(3, 'T3-13', rangeOrder, tier3RangePrimeText(code, rangeOrder), null, { informationStrength: 3, details: { distance: rangeDistance, prime: PRIME_DIGITS.has(rangeDistance) }, mathematicalRule: 'Primzahleigenschaft des Abstands zwischen Maximum und Minimum' }));
    }
    const triangleValues = triple.map(position => code[position]).sort((first, second) => first - second);
    if (triangleValues[0] > 0 && triangleValues[0] + triangleValues[1] > triangleValues[2]) {
      const triangleOrder = [triple[1], triple[2], triple[0]];
      add(makeCandidate(3, 'T3-14', triangleOrder, tier3TriangleText(triangleOrder), null, { informationStrength: 3, optional: true, details: { sideValues: triangleOrder.map(position => code[position]) }, mathematicalRule: 'Alle Seiten > 0 und Summe der zwei kleineren Seiten > größte Seite' }));
    }
    for (const order of permutations(triple)) {
      const firstDistance = code[order[1]] - code[order[0]];
      const secondDistance = code[order[2]] - code[order[1]];
      if (firstDistance === secondDistance && firstDistance !== 0) {
        const forward = order.join('-');
        const backward = order.slice().reverse().join('-');
        const signature = 'T3-06|' + (forward < backward ? forward : backward);
        add(makeCandidate(3, 'T3-06', order, tier3ArithmeticSequenceText(order), signature, { informationStrength: 3, optional: true }));
      }
      if (code[order[0]] !== 0) {
        const composedNumber = code[order[0]] * 100 + code[order[1]] * 10 + code[order[2]];
        const palindrome = code[order[0]] === code[order[2]];
        add(makeCandidate(3, 'T3-09', order, tier3ComposedPalindromeText(code, order), null, { informationStrength: palindrome ? 4 : 2, details: { composedNumber, palindrome }, mathematicalRule: 'Palindrom-Eigenschaft der dreistelligen Zahl in gespeicherter Reihenfolge' }));
      }
    }
  }

  for (let position = 0; position < code.length; position++) {
    const frequency = code.filter(value => value === code[position]).length;
    const strength = frequency >= 2 && frequency <= 4 ? 4 : frequency === 1 ? 2 : 3;
    add(makeCandidate(4, 'T4-15', [position], tier4CodeFrequencyText([position], frequency), null, { informationStrength: strength, details: { sourcePosition: position, frequency, scope: 'entireCode' }, mathematicalRule: 'Häufigkeit des Wertes der Ausgangsposition in allen elf Codeziffern' }));
  }
  const oddPositions = Array.from({ length: code.length }, (_, index) => index).filter(index => index % 2 === 0);
  const evenPositions = Array.from({ length: code.length }, (_, index) => index).filter(index => index % 2 === 1);
  const oddPositionSum = oddPositions.reduce((sum, position) => sum + code[position], 0);
  const evenPositionSum = evenPositions.reduce((sum, position) => sum + code[position], 0);
  const positionSumComparison = relation(oddPositionSum, evenPositionSum);
  add(makeCandidate(4, 'T4-20', oddPositions.concat(evenPositions), tier4OddEvenPositionSumText(code), null, { informationStrength: 4, selectionPriority: -30, positionRoles: oddPositions.map(() => 'Ungerade sichtbare Position').concat(evenPositions.map(() => 'Gerade sichtbare Position')), details: { oddPositions, evenPositions, oddPositionSum, evenPositionSum, comparison: positionSumComparison, scope: 'entireCode' }, mathematicalRule: 'Summe der Werte an ungeraden sichtbaren Positionen wird mit der Summe an geraden sichtbaren Positionen verglichen' }));
  addAbcAbcCandidates();

  for (const selectedPositions of combinations(code.length, 4)) {
    for (const order of permutations(selectedPositions)) {
      if (code[order[0]] === code[order[3]] && code[order[1]] === code[order[2]]) {
        const forward = order.join('-');
        const backward = order.slice().reverse().join('-');
        const signature = 'T4-01|' + (forward < backward ? forward : backward);
        add(makeCandidate(4, 'T4-01', order, palindromeText(order), signature));
      }
      if (code[order[0]] === code[order[2]] && code[order[1]] === code[order[3]] && code[order[0]] !== code[order[1]]) {
        const forward = order.join('-');
        const backward = order.slice().reverse().join('-');
        const signature = 'T4-04|' + (forward < backward ? forward : backward);
        add(makeCandidate(4, 'T4-04', order, tier4AbabText(order), signature, { informationStrength: 4, optional: true }));
      }
      if (code[order[0]] === code[order[1]] && code[order[2]] === code[order[3]] && code[order[0]] !== code[order[2]]) {
        const forward = order.join('-');
        const backward = order.slice().reverse().join('-');
        const signature = 'T4-07|' + (forward < backward ? forward : backward);
        add(makeCandidate(4, 'T4-07', order, tier4AabbText(order), signature, { informationStrength: 4, optional: true, details: { pattern: 'A-A-B-B' }, mathematicalRule: 'Wertfolge A-A-B-B mit A ungleich B' }));
      }
    }
    const pairings = [
      [selectedPositions[0], selectedPositions[2], selectedPositions[1], selectedPositions[3]],
      [selectedPositions[0], selectedPositions[3], selectedPositions[2], selectedPositions[1]],
      [selectedPositions[1], selectedPositions[3], selectedPositions[0], selectedPositions[2]]
    ];
    for (const pairing of pairings) {
      add(makeCandidate(4, 'T4-02', pairing, pairSumComparisonText(code, pairing)));
      const firstDistance = Math.abs(code[pairing[0]] - code[pairing[1]]);
      const secondDistance = Math.abs(code[pairing[2]] - code[pairing[3]]);
      if (firstDistance === secondDistance && firstDistance > 0) {
        add(makeCandidate(4, 'T4-05', pairing, tier4EqualDistancesText(pairing), null, { informationStrength: 3, optional: true }));
      }
    }
    const orderedPositions = freePositionOrder(selectedPositions);
    const firstPairSum = code[orderedPositions[0]] + code[orderedPositions[1]];
    const secondPairSum = code[orderedPositions[2]] + code[orderedPositions[3]];
    const samePairSumParity = firstPairSum % 2 === secondPairSum % 2;
    add(makeCandidate(4, 'T4-03', orderedPositions, tier4PairSumParityText(code, orderedPositions), null, { informationStrength: 3, positionRoles: ['Summe A', 'Summe A', 'Summe B', 'Summe B'], details: { firstPairSum, secondPairSum, sameParity: samePairSumParity }, mathematicalRule: 'Parität von Summe A wird mit der Parität von Summe B verglichen' }));
    addProductComparisonCandidate(selectedPositions);
    addExactlyOnePairCandidate(selectedPositions);
    addSequenceCandidates(selectedPositions);
    addFrequencyPatternCandidates(selectedPositions);
    addCheckDigitCandidates(selectedPositions);
  }

  for (const selectedPositions of combinations(code.length, 5)) {
    addExactlyOnePairCandidate(selectedPositions);
    addEqualGroupSumCandidates(selectedPositions);
    addSequenceCandidates(selectedPositions);
    addFrequencyPatternCandidates(selectedPositions);
    addPairSumDifferenceCandidates(selectedPositions);
    addCheckDigitCandidates(selectedPositions);
  }

  for (const selectedPositions of combinations(code.length, 6)) {
    addExactlyOnePairCandidate(selectedPositions);
    addEqualGroupSumCandidates(selectedPositions);
    addSequenceCandidates(selectedPositions);
    addFrequencyPatternCandidates(selectedPositions);
    addThreePairSumsCandidates(selectedPositions);
    addCheckDigitCandidates(selectedPositions);
  }

  addL054Candidates();
  addCodewideCandidates();
  addTier5Candidates();

  function verifyCodewideCandidate(candidate) {
    const positions = candidate.internalPositions;
    const details = candidate.details;
    const id = candidate.id;
    let valid = false;
    if (id === 'T1-CODE-01') valid = positions.length === 1 && codewide.hasPrime && details.derivedValue === codewide.largestPrime && details.comparison === relation(codewide.largestPrime, code[positions[0]]);
    else if (id === 'T1-CODE-02') valid = positions.length === 1 && codewide.hasEven && details.derivedValue === codewide.smallestEven && details.comparison === relation(codewide.smallestEven, code[positions[0]]);
    else if (id === 'T1-CODE-03') {
      const expectedExtremum = code[positions[0]] === codewide.maximum ? 'maximum' : code[positions[0]] === codewide.minimum ? 'minimum' : 'neither';
      valid = positions.length === 1 && codewide.minimum !== codewide.maximum && details.minimum === codewide.minimum && details.maximum === codewide.maximum && details.extremum === expectedExtremum;
    } else if (id === 'T1-CODE-04') valid = positions.length === 1 && details.median === codewide.median && details.comparison === relation(codewide.median, code[positions[0]]);
    else if (id === 'T2-CODE-01') {
      const sources = {
        smallestEven: { value: codewide.smallestEven, available: codewide.hasEven, subject: 'Die kleinste gerade Zahl im Code' },
        largestPrime: { value: codewide.largestPrime, available: codewide.hasPrime, subject: 'Die größte Primzahl im Code' },
        largestOdd: { value: codewide.largestOdd, available: codewide.hasOdd, subject: 'Die größte ungerade Zahl im Code' }
      };
      const source = sources[details.sourceKey];
      if (positions.length === 2 && source && source.available && details.derivedValue === source.value && details.subject === source.subject) {
        const firstValue = code[positions[0]];
        const secondValue = code[positions[1]];
        valid = details.mode === 'greaterBoth' ? source.value > firstValue && source.value > secondValue : details.mode === 'lessBoth' ? source.value < firstValue && source.value < secondValue : details.mode === 'between' ? firstValue < source.value && source.value < secondValue : false;
      }
    }
    else if (id === 'T2-CODE-03') {
      if (positions.length === 2 && codewide.hasPrime && details.largestPrime === codewide.largestPrime) {
        const firstValue = code[positions[0]];
        const secondValue = code[positions[1]];
        valid = details.mode === 'bothGreater' ? firstValue > codewide.largestPrime && secondValue > codewide.largestPrime : details.mode === 'bothSmaller' ? firstValue < codewide.largestPrime && secondValue < codewide.largestPrime : details.mode === 'between' ? firstValue < codewide.largestPrime && codewide.largestPrime < secondValue : false;
      }
    } else if (id === 'T2-CODE-04') {
      const extremumValue = details.extremum === 'minimum' ? codewide.minimum : details.extremum === 'maximum' ? codewide.maximum : null;
      if (positions.length === 2 && Number.isInteger(extremumValue) && details.extremumValue === extremumValue) {
        const closerDistance = Math.abs(code[positions[0]] - extremumValue);
        const fartherDistance = Math.abs(code[positions[1]] - extremumValue);
        valid = closerDistance > 0 && closerDistance < fartherDistance && details.closerDistance === closerDistance && details.fartherDistance === fartherDistance;
      }
    } else if (id === 'T3-CODE-01' || id === 'T3-CODE-02') {
      const expectedAnchor = id === 'T3-CODE-01' ? codewide.firstPrimePosition : codewide.lastPrimePosition;
      const expectedNeighbor = id === 'T3-CODE-01' ? codewide.afterFirstPrime : codewide.beforeLastPrime;
      if (positions.length === 3 && Number.isInteger(expectedAnchor) && Number.isInteger(expectedNeighbor) && positions[0] === expectedAnchor && positions[1] === expectedNeighbor && positions[2] !== expectedAnchor && positions[2] !== expectedNeighbor) {
        const parity = code[expectedNeighbor] % 2 === 0 ? 'even' : 'odd';
        valid = details.anchorPosition === expectedAnchor && details.neighborPosition === expectedNeighbor && details.targetPosition === positions[2] && details.parity === parity && details.comparison === relation(code[expectedNeighbor], code[positions[2]]);
      }
    } else if (id === 'T3-CODE-03') {
      const occurrences = [
        { position: codewide.firstMinimumPosition, label: 'ersten Vorkommen der kleinsten Zahl' },
        { position: codewide.lastMinimumPosition, label: 'letzten Vorkommen der kleinsten Zahl' },
        { position: codewide.firstMaximumPosition, label: 'ersten Vorkommen der größten Zahl' },
        { position: codewide.lastMaximumPosition, label: 'letzten Vorkommen der größten Zahl' }
      ];
      const occurrence = occurrences.find(entry => entry.position === positions[0] && entry.label === details.occurrenceLabel);
      if (positions.length === 3 && codewide.minimum !== codewide.maximum && occurrence && positions[2] !== positions[0] && positions[2] !== positions[1]) {
        const expectedNeighbor = details.directionLabel === 'vor' ? positions[0] - 1 : details.directionLabel === 'nach' ? positions[0] + 1 : null;
        valid = Number.isInteger(expectedNeighbor) && expectedNeighbor >= 0 && expectedNeighbor < code.length && positions[1] === expectedNeighbor && details.occurrencePosition === positions[0] && details.neighborPosition === positions[1] && details.targetPosition === positions[2] && details.comparison === relation(code[positions[1]], code[positions[2]]);
      }
    } else if (id === 'T3-CODE-04') valid = positions.length === 2 && Number.isInteger(codewide.afterFirstPrime) && Number.isInteger(codewide.beforeLastPrime) && codewide.afterFirstPrime !== codewide.beforeLastPrime && positions[0] === codewide.afterFirstPrime && positions[1] === codewide.beforeLastPrime && details.firstPrimePosition === codewide.firstPrimePosition && details.lastPrimePosition === codewide.lastPrimePosition && details.comparison === relation(code[positions[0]], code[positions[1]]);
    else if (id === 'T4-CODE-01') valid = positions.length === 2 && positions[0] === 0 && positions[1] === code.length - 1 && codewide.hasPrime && details.maximum === codewide.maximum && details.largestPrime === codewide.largestPrime && code[0] !== codewide.maximum && code[code.length - 1] !== codewide.maximum && code[0] > codewide.largestPrime && code[code.length - 1] > codewide.largestPrime;
    else if (id === 'T4-CODE-02') valid = positions.length === 2 && positions[0] === codewide.firstPrimePosition && positions[1] === codewide.afterFirstPrime && codewide.hasPrime && codewide.hasEven && codewide.hasOdd && Number.isInteger(codewide.afterFirstPrime) && details.smallestEven === codewide.smallestEven && details.largestOdd === codewide.largestOdd && codewide.smallestEven < code[codewide.afterFirstPrime] && code[codewide.afterFirstPrime] < codewide.largestOdd;
    else if (id === 'T4-CODE-03') {
      if (positions.length === 3 && Number.isInteger(codewide.beforeFirstPrime) && Number.isInteger(codewide.afterLastPrime) && codewide.beforeFirstPrime !== codewide.afterLastPrime && positions[0] === codewide.beforeFirstPrime && positions[1] === codewide.afterLastPrime && positions[2] !== positions[0] && positions[2] !== positions[1]) {
        const derivedSum = code[positions[0]] + code[positions[1]];
        valid = derivedSum <= 9 && code[positions[2]] === derivedSum && details.derivedSum === derivedSum && details.targetPosition === positions[2];
      }
    } else if (id === 'T4-CODE-04') {
      const values = [code[codewide.firstEvenPosition], code[codewide.lastOddPosition], codewide.median];
      const ascending = values[0] < values[1] && values[1] < values[2];
      const descending = values[0] > values[1] && values[1] > values[2];
      valid = positions.length === 3 && codewide.hasEven && codewide.hasOdd && positions[0] === codewide.firstEvenPosition && positions[1] === codewide.lastOddPosition && positions[2] === codewide.medianFirstPosition && new Set(values).size === 3 && Array.isArray(details.values) && details.values.join('-') === values.join('-') && (details.direction === 'ascending' ? ascending : details.direction === 'descending' ? descending : false);
    } else if (id === 'T4-CODE-05') {
      const difference = Math.abs(codewide.maximum - codewide.minimum);
      valid = positions.length === 2 && codewide.minimum !== codewide.maximum && Number.isInteger(codewide.afterFirstPrime) && positions[0] === codewide.firstPrimePosition && positions[1] === codewide.afterFirstPrime && code[positions[1]] === difference && details.globalDifference === difference && details.minimum === codewide.minimum && details.maximum === codewide.maximum;
    } else if (id === 'T4-CODE-06') valid = positions.length === 2 && positions[0] === 0 && positions[1] === code.length - 1 && codewide.minimum !== codewide.maximum && details.minimum === codewide.minimum && details.maximum === codewide.maximum && codewide.minimum < code[0] && code[0] < codewide.maximum && codewide.minimum < code[code.length - 1] && code[code.length - 1] < codewide.maximum;
    else if (id === 'T4-CODE-07') valid = positions.length === 1 && codewide.hasEven && codewide.hasPrime && details.smallestEven === codewide.smallestEven && details.largestPrime === codewide.largestPrime && details.targetPosition === positions[0] && codewide.smallestEven < codewide.largestPrime && codewide.largestPrime < code[positions[0]];
    if (!valid) return false;
    const texts = codewideTextVariants(id, positions, details);
    let variantSeed = 2166136261;
    const variantSource = GENERATOR_SEED + '|' + id + '|' + positions.join('-') + '|' + (details.semanticKey || '') + '|' + code.join('');
    for (let index = 0; index < variantSource.length; index++) { variantSeed ^= variantSource.charCodeAt(index); variantSeed = Math.imul(variantSeed, 16777619); }
    const expectedVariantIndex = (variantSeed >>> 0) % texts.length;
    return texts.length >= 2 && details.variantIndex === expectedVariantIndex && candidate.text === texts[expectedVariantIndex] && candidate.codewideDerivations.length > 0;
  }

  function verifyCandidate(candidate) {
    if (!candidate.truth || !candidate.text || !candidate.signature) return false;
    if (!candidateGroups[candidate.tier] || !candidateGroups[candidate.tier][candidate.id]) return false;
    if (candidate.internalPositions.some(position => !Number.isInteger(position) || position < 0 || position >= code.length)) return false;
    if (new Set(candidate.internalPositions).size !== candidate.internalPositions.length) return false;
    if (candidate.visiblePositions.some((position, index) => position !== candidate.internalPositions[index] + 1)) return false;
    if (candidate.positionOrder.some((position, index) => position !== candidate.internalPositions[index])) return false;
    if (!Number.isFinite(candidate.informationStrength) || candidate.informationStrength < 1) return false;
    if (typeof candidate.optional !== 'boolean') return false;
    if (!candidate.details || typeof candidate.details !== 'object' || Array.isArray(candidate.details)) return false;
    if (!Array.isArray(candidate.codewideDerivations)) return false;
    if (!Array.isArray(candidate.positionRoles) || candidate.positionRoles.length !== candidate.internalPositions.length) return false;
    if (typeof candidate.mathematicalRule !== 'string' || candidate.mathematicalRule.length === 0) return false;
    if (typeof candidate.requiresUnlock !== 'boolean' || typeof candidate.specialRuleType !== 'string' || typeof candidate.independentValidation !== 'boolean' || !Number.isFinite(candidate.selectionPriority)) return false;
    if (candidate.tier === 5 && (!TIER_5_UNLOCKED || !candidate.requiresUnlock || !candidate.independentValidation)) return false;
    const positions = candidate.internalPositions;
    if (candidate.id.includes('-CODE-')) return verifyCodewideCandidate(candidate);
    if (DIGIT_HINT_IDS.has(candidate.id)) {
      const definition = DIGIT_HINT_DEFINITIONS.find(entry => entry.id === candidate.id);
      if (!definition || candidate.tier !== 1 || candidate.specialRuleType !== 'normal' || candidate.details.digitValue !== definition.digit || candidate.details.propertyKey !== definition.propertyKey || candidate.details.expression !== definition.expression) return false;
      if (candidate.id === 'T1-DIGIT-06') return positions.length === 2 && positions[0] !== positions[1] && code[positions[0]] === 6 && code[positions[1]] === 3 && candidate.details.targetPosition === positions[0] && candidate.details.sourcePosition === positions[1] && candidate.details.sourceDigit === 3 && candidate.text === digitHintText(definition, positions);
      return positions.length === 1 && code[positions[0]] === definition.digit && candidate.text === digitHintText(definition, positions);
    }
    if (candidate.id === 'T1-01') return candidate.text === tier1ParityText(code, positions);
    if (candidate.id === 'T1-02') return candidate.text === tier1PrimeText(code, positions);
    if (candidate.id === 'T1-03') return candidate.text === tier1SquareText(code, positions);
    if (candidate.id === 'T1-05') return positions.length === 1 && candidate.details.composite === COMPOSITE_DIGITS.has(code[positions[0]]) && candidate.text === tier1CompositeText(code, positions);
    if (candidate.id === 'T1-06') return positions.length === 1 && candidate.details.powerOfTwo === POWER_OF_TWO_DIGITS.has(code[positions[0]]) && candidate.text === tier1PowerOfTwoText(code, positions);
    if (candidate.id === 'T1-07') return positions.length === 1 && candidate.text === tier1CubeText(code, positions);
    if (candidate.id === 'T1-08') return positions.length === 1 && candidate.text === tier1FibonacciText(code, positions);
    if (candidate.id === 'T1-09') return positions.length === 1 && candidate.details.samePositionParity === (code[positions[0]] % 2 === (positions[0] + 1) % 2) && candidate.text === tier1PositionParityText(code, positions);
    if (candidate.id === 'T1-12') return positions.length === 1 && candidate.details.distinctPrimeSum === DISTINCT_PRIME_SUM_DIGITS.has(code[positions[0]]) && candidate.text === tier1DistinctPrimeSumText(code, positions);
    if (candidate.id === 'T1-13') {
      const factorial = FACTORIAL_DIGITS.has(code[positions[0]]);
      return positions.length === 1 && candidate.details.factorial === factorial && Array.isArray(candidate.details.allowedValues) && candidate.details.allowedValues.includes(code[positions[0]]) && candidate.text === tier1FactorialText(code, positions);
    }
    if (candidate.id === 'T1-14') return positions.length === 1 && candidate.details.triangular === TRIANGULAR_DIGITS.has(code[positions[0]]) && candidate.text === tier1TriangularText(code, positions);
    if (candidate.id === 'T2-01') return positions.length === 2 && positions[0] !== positions[1] && candidate.text === comparisonText(code, positions);
    if (candidate.id === 'T2-02') {
      const sum = code[positions[0]] + code[positions[1]];
      return positions.length === 2 && candidate.details.sum === sum && candidate.details.square === SQUARE_SUMS.has(sum) && candidate.text === tier2SumSquareText(code, positions);
    }
    if (candidate.id === 'T2-03') {
      const difference = Math.abs(code[positions[0]] - code[positions[1]]);
      return positions.length === 2 && candidate.details.difference === difference && candidate.details.square === SQUARE_SUMS.has(difference) && candidate.text === tier2DifferenceSquareText(code, positions);
    }
    if (candidate.id === 'T2-04') return positions.length === 2 && candidate.details.sameParity === (code[positions[0]] % 2 === code[positions[1]] % 2) && candidate.text === tier2ParityText(code, positions);
    if (candidate.id === 'T2-06') return positions.length === 2 && candidate.text === tier2DifferenceParityText(code, positions);
    if (candidate.id === 'T2-07') {
      const product = code[positions[0]] * code[positions[1]];
      const square = Number.isInteger(Math.sqrt(product));
      return positions.length === 2 && candidate.details.product === product && candidate.details.square === square && candidate.text === tier2ProductSquareText(code, positions);
    }
    if (candidate.id === 'T2-08') return positions.length === 2 && Math.abs(code[positions[0]] - code[positions[1]]) === 1 && candidate.text === tier2NeighborText(positions);
    if (candidate.id === 'T2-09') {
      const firstValue = code[positions[0]];
      const secondValue = code[positions[1]];
      const ratioDirection = firstValue === secondValue * 2 ? 'double' : 'half';
      return positions.length === 2 && firstValue !== secondValue && (firstValue === secondValue * 2 || secondValue === firstValue * 2) && candidate.details.ratioDirection === ratioDirection && candidate.text === tier2DoubleHalfText(code, positions);
    }
    if (candidate.id === 'T2-10') {
      const sum = code[positions[0]] + code[positions[1]];
      return positions.length === 2 && candidate.details.sum === sum && candidate.details.fibonacci === FIBONACCI_SUMS.has(sum) && candidate.text === tier2SumFibonacciText(code, positions);
    }
    if (candidate.id === 'T2-11') {
      const dividend = code[positions[0]];
      const divisor = code[positions[1]];
      return positions.length === 2 && divisor !== 0 && dividend !== divisor && dividend % divisor === 0 && dividend / divisor >= 2 && candidate.details.dividend === dividend && candidate.details.divisor === divisor && candidate.details.quotient === dividend / divisor && candidate.text === tier2DivisibilityText(positions);
    }
    if (candidate.id === 'T2-12') {
      const composedNumber = code[positions[0]] * 10 + code[positions[1]];
      const square = Number.isInteger(Math.sqrt(composedNumber));
      return positions.length === 2 && code[positions[0]] !== 0 && candidate.details.composedNumber === composedNumber && candidate.details.square === square && candidate.text === tier2ComposedSquareText(code, positions);
    }
    if (candidate.id === 'T2-13') {
      const difference = Math.abs(code[positions[0]] - code[positions[1]]);
      return positions.length === 2 && candidate.details.difference === difference && candidate.text === tier2DifferencePrimeText(code, positions);
    }
    if (candidate.id === 'T2-14') return positions.length === 2 && candidate.details.equal === (code[positions[0]] === code[positions[1]]) && candidate.text === tier2EqualityText(code, positions);
    if (candidate.id === 'T2-15') return positions.length === 2 && positions[0] + positions[1] === code.length - 1 && positions[0] !== 5 && Math.abs(code[positions[0]] - 5) === Math.abs(code[positions[1]] - 5) && candidate.text === tier2MirrorDistanceText(positions);
    if (candidate.id === 'T2-16') {
      const sum = code[positions[0]] + code[positions[1]];
      return positions.length === 2 && candidate.details.sum === sum && candidate.details.prime === PRIME_SUMS.has(sum) && candidate.text === tier2SumPrimeText(code, positions);
    }
    if (candidate.id === 'T3-01') return positions.length === 3 && candidate.text === tier3SumComparisonText(code, positions);
    if (candidate.id === 'T3-02') {
      const ascending = code[positions[0]] < code[positions[1]] && code[positions[1]] < code[positions[2]];
      const descending = code[positions[0]] > code[positions[1]] && code[positions[1]] > code[positions[2]];
      return positions.length === 3 && (ascending || descending) && candidate.text === tier3OrderText(code, positions);
    }
    if (candidate.id === 'T3-03') {
      const product = code[positions[0]] * code[positions[1]];
      const comparison = relation(product, code[positions[2]]);
      return positions.length === 3 && candidate.details.product === product && candidate.details.comparison === comparison && candidate.text === tier3ProductComparisonText(code, positions);
    }
    if (candidate.id === 'T3-04') {
      const values = positions.map(position => code[position]);
      const exactlyTwoEqual = new Set(values).size === 2 && values.some(value => values.filter(otherValue => otherValue === value).length === 2);
      return positions.length === 3 && exactlyTwoEqual && candidate.text === tier3ExactlyTwoEqualText(positions);
    }
    if (candidate.id === 'T3-06') {
      const firstDistance = code[positions[1]] - code[positions[0]];
      const secondDistance = code[positions[2]] - code[positions[1]];
      return positions.length === 3 && firstDistance === secondDistance && firstDistance !== 0 && candidate.text === tier3ArithmeticSequenceText(positions);
    }
    if (candidate.id === 'T3-07') {
      const targetPosition = positions[0];
      const lowerPosition = positions[1];
      const upperPosition = positions[2];
      return positions.length === 3 && new Set(positions).size === 3 && code[lowerPosition] < code[targetPosition] && code[targetPosition] < code[upperPosition] && code[lowerPosition] !== code[upperPosition] && candidate.details.targetPosition === targetPosition && candidate.details.lowerPosition === lowerPosition && candidate.details.upperPosition === upperPosition && candidate.text === tier3StrictBetweenText(positions);
    }
    if (candidate.id === 'T3-08') {
      const difference = Math.abs(code[positions[0]] - code[positions[1]]);
      const comparison = relation(difference, code[positions[2]]);
      return positions.length === 3 && candidate.details.difference === difference && candidate.details.comparison === comparison && candidate.text === tier3DifferenceComparisonText(code, positions);
    }
    if (candidate.id === 'T3-09') {
      const composedNumber = code[positions[0]] * 100 + code[positions[1]] * 10 + code[positions[2]];
      const palindrome = code[positions[0]] === code[positions[2]];
      return positions.length === 3 && code[positions[0]] !== 0 && candidate.details.composedNumber === composedNumber && candidate.details.palindrome === palindrome && candidate.text === tier3ComposedPalindromeText(code, positions);
    }
    if (candidate.id === 'T3-10') return positions.length === 3 && code[positions[0]] + code[positions[1]] === code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.text === tier3ExactSumText(positions);
    if (candidate.id === 'T3-11') return positions.length === 3 && Math.abs(code[positions[0]] - code[positions[1]]) === code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.text === tier3ExactDifferenceText(positions);
    if (candidate.id === 'T3-12') return positions.length === 3 && code[positions[0]] !== code[positions[1]] && code[positions[0]] + code[positions[1]] === 2 * code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.text === tier3AverageText(positions);
    if (candidate.id === 'T3-13') {
      const values = positions.map(position => code[position]);
      const distance = Math.max(...values) - Math.min(...values);
      return positions.length === 3 && distance > 0 && candidate.details.distance === distance && candidate.details.prime === PRIME_DIGITS.has(distance) && candidate.text === tier3RangePrimeText(code, positions);
    }
    if (candidate.id === 'T3-14') {
      const sides = positions.map(position => code[position]).sort((first, second) => first - second);
      return positions.length === 3 && sides[0] > 0 && sides[0] + sides[1] > sides[2] && candidate.text === tier3TriangleText(positions);
    }
    if (candidate.id === 'T3-15') {
      const sum = positions.reduce((total, position) => total + code[position], 0);
      return positions.length === 3 && candidate.details.sum === sum && candidate.details.parity === (sum % 2 === 0 ? 'even' : 'odd') && candidate.text === tier3SumParityText(code, positions);
    }
    if (candidate.id === 'T3-16') {
      const product = code[positions[0]] * code[positions[1]];
      return positions.length === 3 && product % 10 === code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.details.product === product && candidate.details.lastDigit === code[positions[2]] && candidate.text === tier3ProductDigitText(positions);
    }
    if (candidate.id === 'T3-17') {
      if (positions.length !== 3 || !['productPlus', 'productMinus'].includes(candidate.details.variant)) return false;
      const evaluation = l054PointBeforeEvaluation(code[positions[0]], code[positions[1]], code[positions[2]], candidate.details.variant);
      const expectedInformation = l054ExactInformation(candidate.details.variant, evaluation.result);
      return code[positions[0]] >= 2 && code[positions[1]] >= 2 && code[positions[2]] >= 1 && evaluation.didacticallyValid && evaluation.result >= 0 && evaluation.result <= L054_MAX_RESULT && candidate.details.result === evaluation.result && candidate.details.leftToRightResult === evaluation.leftToRightResult && candidate.details.termPosition === positions[2] && candidate.details.factorPositions.join('-') === positions.slice(0, 2).join('-') && candidate.details.informationExclusionPercent === expectedInformation && expectedInformation >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier3PointBeforeText(positions, candidate.details.variant, evaluation.result);
    }
    if (candidate.id === 'T3-18') {
      if (positions.length !== 3 || !['groupedPlus', 'groupedMinus'].includes(candidate.details.variant)) return false;
      const groupedValue = candidate.details.variant === 'groupedPlus' ? code[positions[0]] + code[positions[1]] : code[positions[0]] - code[positions[1]];
      const result = groupedValue * code[positions[2]];
      const expectedInformation = l054ExactInformation(candidate.details.variant, result);
      return code[positions[2]] >= 2 && groupedValue > 0 && result <= L054_MAX_RESULT && candidate.details.result === result && candidate.details.multiplierPosition === positions[2] && candidate.details.operandPositions.join('-') === positions.slice(0, 2).join('-') && candidate.details.informationExclusionPercent === expectedInformation && expectedInformation >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier3ParenthesesText(positions, candidate.details.variant, result);
    }
    if (candidate.id === 'T3-19') {
      const product = code[positions[0]] * code[positions[1]];
      const digitSum = l054DigitSum(product);
      return positions.length === 3 && product >= 10 && digitSum <= 9 && digitSum === code[positions[2]] && candidate.details.product === product && candidate.details.digitSum === digitSum && candidate.details.targetPosition === positions[2] && candidate.details.informationExclusionPercent === L054_PRODUCT_DIGIT_SUM_EXCLUSION_PERCENT && L054_PRODUCT_DIGIT_SUM_EXCLUSION_PERCENT >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier3ProductDigitSumText(positions);
    }
    if (candidate.id === 'T3-20') {
      const composedNumber = code[positions[0]] * 10 + code[positions[1]];
      const divisor = candidate.details.divisor;
      const validNumbers = L054_DIVISORS.includes(divisor) ? Math.floor(99 / divisor) - Math.floor(9 / divisor) : 100;
      const expectedInformation = l054ExclusionPercent(validNumbers, 100);
      return positions.length === 2 && code[positions[0]] !== 0 && divisor !== 0 && divisor !== 1 && L054_DIVISORS.includes(divisor) && composedNumber % divisor === 0 && candidate.details.composedNumber === composedNumber && candidate.details.informationExclusionPercent === expectedInformation && expectedInformation >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier3ComposedDivisibilityText(positions, divisor);
    }
    if (candidate.id === 'T4-01') {
      const isPalindrome = positions.length >= 4 && positions.every((position, index) => code[position] === code[positions[positions.length - 1 - index]]);
      return isPalindrome && candidate.text === palindromeText(positions);
    }
    if (candidate.id === 'T4-02') return positions.length === 4 && candidate.text === pairSumComparisonText(code, positions);
    if (candidate.id === 'T4-03') {
      const firstPairSum = code[positions[0]] + code[positions[1]];
      const secondPairSum = code[positions[2]] + code[positions[3]];
      return positions.length === 4 && candidate.details.firstPairSum === firstPairSum && candidate.details.secondPairSum === secondPairSum && candidate.details.sameParity === (firstPairSum % 2 === secondPairSum % 2) && candidate.text === tier4PairSumParityText(code, positions);
    }
    if (candidate.id === 'T4-04') return positions.length === 4 && code[positions[0]] === code[positions[2]] && code[positions[1]] === code[positions[3]] && code[positions[0]] !== code[positions[1]] && candidate.text === tier4AbabText(positions);
    if (candidate.id === 'T4-05') {
      const firstDistance = Math.abs(code[positions[0]] - code[positions[1]]);
      const secondDistance = Math.abs(code[positions[2]] - code[positions[3]]);
      return positions.length === 4 && firstDistance === secondDistance && firstDistance > 0 && candidate.text === tier4EqualDistancesText(positions);
    }
    if (candidate.id === 'T4-06') {
      const firstProduct = code[positions[0]] * code[positions[1]];
      const secondProduct = code[positions[2]] * code[positions[3]];
      const comparison = relation(firstProduct, secondProduct);
      return positions.length === 4 && candidate.details.firstProduct === firstProduct && candidate.details.secondProduct === secondProduct && candidate.details.comparison === comparison && candidate.text === tier4ProductComparisonText(code, positions);
    }
    if (candidate.id === 'T4-07') return positions.length === 4 && code[positions[0]] === code[positions[1]] && code[positions[2]] === code[positions[3]] && code[positions[0]] !== code[positions[2]] && candidate.details.pattern === 'A-A-B-B' && candidate.text === tier4AabbText(positions);
    if (candidate.id === 'T4-08') {
      const firstGroup = candidate.details.firstGroup;
      const secondGroup = candidate.details.secondGroup;
      if (!Array.isArray(firstGroup) || !Array.isArray(secondGroup) || firstGroup.concat(secondGroup).join('-') !== positions.join('-')) return false;
      const validSizes = firstGroup.length === 2 && secondGroup.length === 3 || firstGroup.length === 3 && secondGroup.length === 3;
      const allPositions = firstGroup.concat(secondGroup);
      const firstSum = firstGroup.reduce((sum, position) => sum + code[position], 0);
      const secondSum = secondGroup.reduce((sum, position) => sum + code[position], 0);
      return validSizes && new Set(allPositions).size === allPositions.length && firstSum === secondSum && candidate.text === tier4EqualGroupSumsText(firstGroup, secondGroup);
    }
    if (candidate.id === 'T4-09') {
      const frequencies = new Map();
      for (const position of positions) frequencies.set(code[position], (frequencies.get(code[position]) || 0) + 1);
      const counts = Array.from(frequencies.values());
      const hasExactlyOnePair = counts.filter(count => count === 2).length === 1 && counts.every(count => count === 1 || count === 2);
      return positions.length >= 4 && positions.length <= 6 && hasExactlyOnePair && candidate.text === tier4ExactlyOnePairText(positions);
    }
    if (candidate.id === 'T4-10') {
      const values = positions.map(position => code[position]);
      return positions.length === 6 && values[0] === values[3] && values[1] === values[4] && values[2] === values[5] && new Set(values.slice(0, 3)).size >= 2 && candidate.text === tier4AbcAbcText(positions);
    }
    if (candidate.id === 'T4-11') return positions.length >= 4 && positions.length <= 6 && positions.slice(1).every((position, index) => code[positions[index]] < code[position]) && candidate.text === tier4StrictSequenceText(positions, 'ascending');
    if (candidate.id === 'T4-12') return positions.length >= 4 && positions.length <= 6 && positions.slice(1).every((position, index) => code[positions[index]] > code[position]) && candidate.text === tier4StrictSequenceText(positions, 'descending');
    if (candidate.id === 'T4-13') {
      const distance = code[positions[1]] - code[positions[0]];
      return positions.length >= 4 && positions.length <= 6 && distance !== 0 && positions.slice(1).every((position, index) => code[position] - code[positions[index]] === distance) && candidate.details.distance === distance && candidate.text === tier4ArithmeticSequenceText(positions);
    }
    if (candidate.id === 'T4-14') {
      const firstGroup = candidate.details.firstGroup;
      const secondGroup = candidate.details.secondGroup;
      if (!Array.isArray(firstGroup) || !Array.isArray(secondGroup) || firstGroup.concat(secondGroup).join('-') !== positions.join('-')) return false;
      const validSizes = firstGroup.length === 2 && secondGroup.length === 3 || firstGroup.length === 3 && secondGroup.length === 3;
      const firstSum = firstGroup.reduce((sum, position) => sum + code[position], 0);
      const secondSum = secondGroup.reduce((sum, position) => sum + code[position], 0);
      const relationWord = firstSum > secondSum ? 'mehr' : 'weniger';
      return validSizes && new Set(positions).size === positions.length && firstSum !== secondSum && candidate.details.firstSum === firstSum && candidate.details.secondSum === secondSum && candidate.details.relation === relationWord && candidate.text === tier4GroupComparisonText(firstGroup, secondGroup, relationWord);
    }
    if (candidate.id === 'T4-15') {
      const frequency = code.filter(value => value === code[positions[0]]).length;
      return positions.length === 1 && candidate.details.sourcePosition === positions[0] && candidate.details.frequency === frequency && candidate.details.scope === 'entireCode' && candidate.text === tier4CodeFrequencyText(positions, frequency);
    }
    if (candidate.id === 'T4-16') {
      const counts = new Map();
      for (const position of positions) counts.set(code[position], (counts.get(code[position]) || 0) + 1);
      const frequencies = Array.from(counts.values());
      return positions.length >= 4 && positions.length <= 6 && frequencies.filter(count => count === 2).length === 2 && frequencies.every(count => count === 1 || count === 2) && candidate.text === tier4TwoPairsText(positions);
    }
    if (candidate.id === 'T4-17') return positions.length >= 4 && positions.length <= 6 && new Set(positions.map(position => code[position])).size === positions.length && candidate.text === tier4AllDifferentText(positions);
    if (candidate.id === 'T4-18') {
      const firstSum = code[positions[0]] + code[positions[5]];
      const secondSum = code[positions[1]] + code[positions[4]];
      const thirdSum = code[positions[2]] + code[positions[3]];
      return positions.length === 6 && firstSum === secondSum && secondSum === thirdSum && candidate.details.pairSum === firstSum && candidate.text === tier4ThreePairSumsText(positions);
    }
    if (candidate.id === 'T4-19') {
      const difference = Math.abs(code[positions[0]] + code[positions[1]] - code[positions[3]] - code[positions[4]]);
      return positions.length === 5 && difference === code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.details.difference === difference && candidate.text === tier4PairSumDifferenceText(positions);
    }
    if (candidate.id === 'T4-20') {
      const oddPositions = Array.from({ length: code.length }, (_, index) => index).filter(index => index % 2 === 0);
      const evenPositions = Array.from({ length: code.length }, (_, index) => index).filter(index => index % 2 === 1);
      const oddPositionSum = oddPositions.reduce((sum, position) => sum + code[position], 0);
      const evenPositionSum = evenPositions.reduce((sum, position) => sum + code[position], 0);
      const comparison = relation(oddPositionSum, evenPositionSum);
      return positions.length === code.length && positions.join('-') === oddPositions.concat(evenPositions).join('-') && candidate.details.oddPositions.join('-') === oddPositions.join('-') && candidate.details.evenPositions.join('-') === evenPositions.join('-') && candidate.details.oddPositionSum === oddPositionSum && candidate.details.evenPositionSum === evenPositionSum && candidate.details.comparison === comparison && candidate.details.scope === 'entireCode' && candidate.text === tier4OddEvenPositionSumText(code);
    }
    if (candidate.id === 'T4-21') {
      const sourcePositions = positions.slice(0, -1);
      const targetPosition = positions[positions.length - 1];
      const sourceSum = sourcePositions.reduce((sum, position) => sum + code[position], 0);
      return positions.length >= 4 && positions.length <= 6 && sourceSum % 10 === code[targetPosition] && candidate.details.targetPosition === targetPosition && candidate.details.sourceSum === sourceSum && candidate.details.checkDigit === code[targetPosition] && candidate.text === tier4CheckDigitText(sourcePositions, targetPosition);
    }
    if (candidate.id === 'T4-22') {
      const counts = new Map();
      for (const position of positions) counts.set(code[position], (counts.get(code[position]) || 0) + 1);
      const frequencies = Array.from(counts.values());
      return positions.length >= 4 && positions.length <= 6 && frequencies.filter(count => count === 3).length === 1 && frequencies.every(count => count === 1 || count === 3) && candidate.text === tier4ExactlyThreeEqualText(positions);
    }
    if (candidate.id === 'T4-23') {
      const evaluation = l054MixedComparisonEvaluation(code, positions);
      return positions.length === 6 && code[positions[0]] >= 2 && code[positions[1]] >= 2 && code[positions[2]] >= 1 && code[positions[3]] >= 1 && code[positions[4]] >= 2 && code[positions[5]] >= 2 && evaluation.didacticallyValid && Math.max(evaluation.leftResult, evaluation.rightResult) <= L054_MAX_RESULT && candidate.details.leftResult === evaluation.leftResult && candidate.details.rightResult === evaluation.rightResult && candidate.details.leftToRightLeftResult === evaluation.leftToRightLeftResult && candidate.details.leftToRightRightResult === evaluation.leftToRightRightResult && candidate.details.comparison === evaluation.comparison && candidate.details.leftToRightComparison === evaluation.leftToRightComparison && candidate.details.informationExclusionPercent === L054_MIXED_EXCLUSION_PERCENT && L054_MIXED_EXCLUSION_PERCENT >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier4MixedExpressionComparisonText(positions, evaluation.comparison);
    }
    if (candidate.id === 'T5-01') {
      if (positions.length !== 2 || positions[0] === positions[1] || candidate.details.positionCounting !== 'right') return false;
      const rightPositions = positions.map(position => code.length - position);
      const comparison = relation(code[positions[0]], code[positions[1]]);
      const expectedText = 'Für diesen Hinweis werden die Positionen von rechts gezählt. Die Zahl an Position ' + rightPositions[0] + ' ist ' + comparison + ' als die Zahl an Position ' + rightPositions[1] + '.';
      return candidate.details.rightVisiblePositions.join('-') === rightPositions.join('-') && candidate.details.normalVisiblePositions.join('-') === positions.map(position => position + 1).join('-') && candidate.details.comparison === comparison && candidate.text === expectedText;
    }
    if (candidate.id === 'T5-02') {
      if (positions.length !== 3 || new Set(positions).size !== 3) return false;
      const divisor = code[positions[2]];
      const firstRemainder = divisor > 1 ? code[positions[0]] % divisor : -1;
      const secondRemainder = divisor > 1 ? code[positions[1]] % divisor : -2;
      const expectedText = 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' hinterlassen bei der Teilung durch die Zahl an Position ' + (positions[2] + 1) + ' denselben Rest.';
      return divisor > 1 && code[positions[0]] !== code[positions[1]] && firstRemainder > 0 && firstRemainder === secondRemainder && candidate.details.divisorPosition === positions[2] && candidate.details.divisorValue === divisor && candidate.details.commonRemainder === firstRemainder && candidate.details.firstRemainder === firstRemainder && candidate.details.secondRemainder === secondRemainder && candidate.text === expectedText;
    }
    if (candidate.id === 'T5-03') {
      const derivedPositionByKey = { afterFirstPrime: codewide.afterFirstPrime, beforeLastPrime: codewide.beforeLastPrime, firstEven: codewide.firstEvenPosition, lastOdd: codewide.lastOddPosition, afterFirstMinimum: codewide.firstMinimumPosition < code.length - 1 ? codewide.firstMinimumPosition + 1 : null, beforeLastMaximum: codewide.lastMaximumPosition > 0 ? codewide.lastMaximumPosition - 1 : null, medianFirstPosition: codewide.medianFirstPosition };
      const labelByKey = { afterFirstPrime: 'die Zahl unmittelbar nach der ersten Primzahl', beforeLastPrime: 'die Zahl unmittelbar vor der letzten Primzahl', firstEven: 'die erste gerade Zahl von links', lastOdd: 'die letzte ungerade Zahl von links', afterFirstMinimum: 'die Zahl unmittelbar nach dem ersten Vorkommen des Minimums', beforeLastMaximum: 'die Zahl unmittelbar vor dem letzten Vorkommen des Maximums', medianFirstPosition: 'der Median des Codes an seinem ersten Vorkommen' };
      const keys = candidate.details.derivationKeys;
      if (!Array.isArray(keys) || keys.length !== 3 || new Set(keys).size !== 3 || keys.some(key => !Object.prototype.hasOwnProperty.call(derivedPositionByKey, key))) return false;
      const expectedPositions = keys.map(key => derivedPositionByKey[key]);
      if (expectedPositions.some(position => !Number.isInteger(position)) || new Set(expectedPositions).size !== 3 || expectedPositions.join('-') !== positions.join('-')) return false;
      const values = positions.map(position => code[position]);
      const firstDifference = values[1] - values[0];
      const secondDifference = values[2] - values[1];
      let validPattern = false;
      let patternText = '';
      if (candidate.details.pattern === 'arithmetic') { validPattern = firstDifference !== 0 && firstDifference === secondDifference; patternText = 'bilden in dieser Reihenfolge eine arithmetische Folge mit gleichem, von null verschiedenem Abstand'; }
      else if (candidate.details.pattern === 'ascending') { validPattern = values[0] < values[1] && values[1] < values[2] && !(firstDifference !== 0 && firstDifference === secondDifference); patternText = 'bilden in dieser Reihenfolge eine streng aufsteigende Folge'; }
      else if (candidate.details.pattern === 'descending') { validPattern = values[0] > values[1] && values[1] > values[2] && !(firstDifference !== 0 && firstDifference === secondDifference); patternText = 'bilden in dieser Reihenfolge eine streng absteigende Folge'; }
      else if (candidate.details.pattern === 'firstThirdEqual') { validPattern = values[0] === values[2] && values[0] !== values[1]; patternText = 'besitzen in dieser Reihenfolge denselben ersten und dritten Wert, während der mittlere Wert davon abweicht'; }
      const labels = keys.map(key => labelByKey[key]);
      const expectedText = labels[0].charAt(0).toUpperCase() + labels[0].slice(1) + ', ' + labels[1] + ' und ' + labels[2] + ' ' + patternText + '.';
      return validPattern && candidate.details.derivationLabels.join('|') === labels.join('|') && candidate.details.derivedValues.join('-') === values.join('-') && candidate.codewideDerivations.join('|') === labels.join('|') && candidate.text === expectedText;
    }
    if (candidate.id === 'T5-04') {
      if (positions.length !== 0 || candidate.text !== 'Einer der genannten Hinweise ist falsch!' || candidate.specialRuleType !== 'genau-ein-absichtlich-falscher-hinweis') return false;
      const witnessSignatures = candidate.details.witnessSignatures;
      const witnessTargets = candidate.details.witnessTargetPositions;
      if (!Array.isArray(witnessSignatures) || !Array.isArray(witnessTargets) || witnessSignatures.length !== 3 || witnessTargets.length !== 3 || new Set(witnessTargets).size !== 3 || candidate.details.requiredTrueWitnessCount !== 3 || candidate.details.fairnessProofType !== 'three-strict-between-witnesses') return false;
      const witnesses = witnessSignatures.map(signature => candidateGroups[3]['T3-07'].find(candidate => candidate.signature === signature));
      return witnesses.every((witness, index) => witness && witness.details.targetPosition === witnessTargets[index] && witness.details.lowerPosition === candidate.details.lowerPosition && witness.details.upperPosition === candidate.details.upperPosition && code[witness.details.lowerPosition] < code[witness.details.targetPosition] && code[witness.details.targetPosition] < code[witness.details.upperPosition]);
    }
    return false;
  }

  for (const tier of Object.keys(candidateGroups)) {
    for (const id of Object.keys(candidateGroups[tier])) {
      const uniqueCandidates = new Map();
      for (const candidate of candidateGroups[tier][id]) {
        if (verifyCandidate(candidate)) uniqueCandidates.set(candidate.signature, candidate);
      }
      candidateGroups[tier][id] = Array.from(uniqueCandidates.values());
    }
  }

  let randomState = 2166136261;
  for (const digit of code) {
    randomState ^= digit + 48;
    randomState = Math.imul(randomState, 16777619);
  }
  for (let index = 0; index < GENERATOR_SEED.length; index++) {
    randomState ^= GENERATOR_SEED.charCodeAt(index);
    randomState = Math.imul(randomState, 16777619);
  }
  randomState >>>= 0;
  if (randomState === 0) randomState = 1831565813;

  function random() {
    randomState ^= randomState << 13;
    randomState ^= randomState >>> 17;
    randomState ^= randomState << 5;
    return (randomState >>> 0) / 4294967296;
  }

  function shuffled(values) {
    const result = values.slice();
    for (let index = result.length - 1; index > 0; index--) {
      const target = Math.floor(random() * (index + 1));
      const temporary = result[index];
      result[index] = result[target];
      result[target] = temporary;
    }
    return result;
  }

  function overlapCount(first, second) {
    const used = new Set(first.internalPositions);
    return second.internalPositions.filter(position => used.has(position)).length;
  }

  function samePositionSet(first, second) {
    if (first.internalPositions.length !== second.internalPositions.length) return false;
    const firstPositions = first.internalPositions.slice().sort((a, b) => a - b).join('-');
    const secondPositions = second.internalPositions.slice().sort((a, b) => a - b).join('-');
    return firstPositions === secondPositions;
  }

  function candidatesConflict(first, second) {
    if (first.id === second.id || first.text === second.text || first.signature === second.signature) return true;
    const ids = new Set([first.id, second.id]);
    if (ids.has('T3-CODE-04') && ids.has('T3-CODE-01')) {
      const neighborHint = first.id === 'T3-CODE-01' ? first : second;
      const pairedHint = first.id === 'T3-CODE-04' ? first : second;
      if (neighborHint.details.neighborPosition === pairedHint.details.afterFirstPrime && neighborHint.details.targetPosition === pairedHint.details.beforeLastPrime) return true;
    }
    if (ids.has('T3-CODE-04') && ids.has('T3-CODE-02')) {
      const neighborHint = first.id === 'T3-CODE-02' ? first : second;
      const pairedHint = first.id === 'T3-CODE-04' ? first : second;
      if (neighborHint.details.neighborPosition === pairedHint.details.beforeLastPrime && neighborHint.details.targetPosition === pairedHint.details.afterFirstPrime) return true;
    }
    if (!samePositionSet(first, second)) return false;
    if (first.tier === 1 && second.tier === 1 && first.internalPositions.length === 1) {
      const firstValues = first.details.allowedValues;
      const secondValues = second.details.allowedValues;
      if (Array.isArray(firstValues) && Array.isArray(secondValues) && firstValues.slice().sort().join('-') === secondValues.slice().sort().join('-')) return true;
    }
    const conflictingTypeGroups = [
      ['T1-02', 'T1-05'],
      ['T1-03', 'T1-07'],
      ['T1-13', 'T1-12'],
      ['T1-CODE-01', 'T1-CODE-02'],
      ['T1-CODE-03', 'T1-CODE-04'],
      ['T2-02', 'T2-10'],
      ['T2-02', 'T2-15'],
      ['T2-02', 'T2-16'],
      ['T2-03', 'T2-06'],
      ['T2-03', 'T2-13'],
      ['T2-04', 'T2-06'],
      ['T2-06', 'T2-13'],
      ['T2-10', 'T2-15'],
      ['T2-10', 'T2-16'],
      ['T2-01', 'T2-14'],
      ['T2-14', 'T2-15'],
      ['T2-09', 'T2-11'],
      ['T2-CODE-01', 'T2-CODE-03'],
      ['T3-01', 'T3-10'],
      ['T3-02', 'T3-06'],
      ['T3-02', 'T3-07'],
      ['T3-06', 'T3-07'],
      ['T3-06', 'T3-12'],
      ['T3-03', 'T3-16'],
      ['T3-08', 'T3-11'],
      ['T4-08', 'T4-14'],
      ['T4-11', 'T4-12'],
      ['T4-11', 'T4-13'],
      ['T4-12', 'T4-13'],
      ['T4-11', 'T4-17'],
      ['T4-12', 'T4-17'],
      ['T4-CODE-01', 'T4-CODE-06'],
      ['T5-01', 'T2-01'],
      ['T5-03', 'T3-02'],
      ['T5-03', 'T3-06'],
      ['T5-03', 'T3-12'],
      ['T5-03', 'T4-CODE-04'],
      ['T3-17', 'T3-18'],
      ['T3-17', 'T3-19'],
      ['T3-18', 'T3-19'],
      ['T3-17', 'T3-03'],
      ['T3-17', 'T3-10'],
      ['T3-17', 'T3-16'],
      ['T3-18', 'T3-03'],
      ['T3-18', 'T3-10'],
      ['T3-18', 'T3-16'],
      ['T3-19', 'T3-03'],
      ['T3-19', 'T3-16'],
      ['T3-20', 'T2-12'],
    ];
    return conflictingTypeGroups.some(group => group.includes(first.id) && group.includes(second.id));
  }

  const positionUsage = Array(code.length).fill(0);

  function usageScore(candidate) {
    if (candidate.internalPositions.length === 0) return 0;
    return candidate.internalPositions.reduce((score, position) => score + positionUsage[position], 0) / candidate.internalPositions.length;
  }

  function typeVarietyPenalty(candidate) {
    return stableTextHash('type-variety|' + candidate.tier + '|' + candidate.id + '|' + code.join('')) % 25;
  }

  const SHORT_HINT_MAX_CHARS = 82;
  const MEDIUM_HINT_MAX_CHARS = 132;
  const MAX_TIER_5_HINTS = 1;
  const EXPLICIT_LONG_HINT_IDS = new Set(['T4-08', 'T4-14', 'T4-20', 'T4-CODE-01', 'T4-CODE-02', 'T4-CODE-03', 'T4-CODE-04', 'T4-CODE-07', 'T5-01', 'T5-03']);

  function classifyHintLength(candidate) {
    const visibleLength = candidate.text.replace(/\s+/g, ' ').trim().length;
    if (candidate.id === 'T5-04') return 'kurz';
    if (EXPLICIT_LONG_HINT_IDS.has(candidate.id) || visibleLength > MEDIUM_HINT_MAX_CHARS) return 'lang';
    if (candidate.tier === 5) return 'mittel';
    if (visibleLength > SHORT_HINT_MAX_CHARS) return 'mittel';
    return 'kurz';
  }

  function lengthPairAllowed(first, second) {
    const classes = [first.lengthClass, second.lengthClass];
    if (classes[0] === 'lang' && classes[1] === 'lang') return false;
    if (classes.includes('lang')) return classes.includes('kurz');
    return true;
  }

  const tierPools = {};
  for (let tier = 1; tier <= 5; tier++) {
    tierPools[tier] = [];
    for (const id of Object.keys(candidateGroups[tier] || {})) {
      const groupCandidates = candidateGroups[tier][id];
      const orderedCandidates = L054_HINT_IDS.has(id)
        ? groupCandidates.slice().sort((first, second) => stableTextHash('l054-pool|' + first.signature) - stableTextHash('l054-pool|' + second.signature) || first.signature.localeCompare(second.signature))
        : shuffled(groupCandidates);
      const candidates = orderedCandidates
        .filter(candidate => estimateInformationExclusionPercent(candidate) >= MIN_HINT_EXCLUSION_PERCENT && !hintDistinctness.EXCLUDED_IDS.has(candidate.id))
        .sort((first, second) => second.informationStrength - first.informationStrength)
        .slice(0, 18);
      for (const candidate of candidates) {
        candidate.lengthClass = classifyHintLength(candidate);
        tierPools[tier].push(candidate);
      }
    }
  }

  if (settings.mode === 'candidateAudit') {
    const generatedCandidates = Object.values(candidateGroups).flatMap(groups => Object.values(groups).flat());
    const rejectedCandidates = generatedCandidates.filter(candidate => estimateInformationExclusionPercent(candidate) < MIN_HINT_EXCLUSION_PERCENT);
    const rejectedById = {};
    for (const candidate of rejectedCandidates) rejectedById[candidate.id] = (rejectedById[candidate.id] || 0) + 1;
    return { generatedCandidateCount: generatedCandidates.length, acceptedCandidateCount: generatedCandidates.length - rejectedCandidates.length, rejectedCandidateCount: rejectedCandidates.length, rejectedById };
  }
  if (settings.mode === 'candidates') return Object.values(tierPools).flat();

  const TIER_5_RARITY_DIVISOR = 10;
  const tier5RarityBucket = stableTextHash('tier5-rarity|' + GENERATOR_SEED + '|' + code.join('')) % TIER_5_RARITY_DIVISOR;
  const tier5Available = TIER_5_UNLOCKED && tier5RarityBucket === 0 && tierPools[5].length > 0;
  const tier5TypeOrderBase = Object.keys(candidateGroups[5]);
  const tier5TypeRotation = (code.reduce((sum, value, index) => sum + value * (index + 1), 0) + stableTextHash('tier5-type|' + GENERATOR_SEED)) % tier5TypeOrderBase.length;
  const tier5TypeOrder = tier5TypeOrderBase.slice(tier5TypeRotation).concat(tier5TypeOrderBase.slice(0, tier5TypeRotation));
  const packageTierPatterns = [
    [[2, 1], [1, 2], [2, 2], [1, 1], [2, 3]],
    [[1, 3], [2, 3], [1, 2], [2, 2], [3, 3]],
    [[2, 3], [3, 2], [2, 4], [3, 3], [3, 4]],
    [[3, 4], [2, 4], [3, 3], [2, 3], [4, 4]],
    (tier5Available ? [[5, 2], [2, 5]] : []).concat([[3, 4], [4, 3], [3, 3], [2, 4], [4, 2]])
  ];
  const selected = [];
  const usedIds = new Set();
  const usedTexts = new Set();
  const usedSignatures = new Set();
  let repeatedTypeFallbackUsed = false;

  function conflictsWithPrevious(candidate, allowRepeatedIds) {
    if (usedTexts.has(candidate.text) || usedSignatures.has(candidate.signature)) return true;
    for (const previous of selected) {
      if (candidate.id !== 'T5-04' && previous.id !== 'T5-04' && !hintDistinctness.pairIsDistinct(candidate, previous, code, qualityCache)) return true;
      if (previous.id === candidate.id) {
        if (!allowRepeatedIds || samePositionSet(previous, candidate)) return true;
        continue;
      }
      if (candidatesConflict(previous, candidate)) return true;
    }
    return false;
  }

  function shuffledSelectionPool(source) {
    const existing = source.filter(candidate => !L054_HINT_IDS.has(candidate.id));
    const additions = source.filter(candidate => L054_HINT_IDS.has(candidate.id))
      .sort((first, second) => stableTextHash('l054-selection|' + first.signature) - stableTextHash('l054-selection|' + second.signature) || first.signature.localeCompare(second.signature));
    return shuffled(existing).concat(additions);
  }

  function selectPackage(packageIndex, requiredId) {
    const patterns = packageTierPatterns[packageIndex];
    for (const allowRepeatedIds of [false, true]) {
      for (let patternIndex = 0; patternIndex < patterns.length; patternIndex++) {
        const pattern = patterns[patternIndex];
        const rankCandidate = candidate => usageScore(candidate) * 14 + (candidate.lengthClass === 'lang' ? 6 : candidate.lengthClass === 'mittel' ? 3 : 0) - candidate.informationStrength + candidate.selectionPriority + typeVarietyPenalty(candidate) + (candidate.tier === 5 ? tier5TypeOrder.indexOf(candidate.id) * 1000 : 0);
        const firstSource = requiredId ? tierPools[pattern[0]].filter(candidate => candidate.id === requiredId) : tierPools[pattern[0]];
        const firstPool = shuffledSelectionPool(firstSource).sort((first, second) => rankCandidate(first) - rankCandidate(second)).slice(0, 48);
        const secondPool = shuffledSelectionPool(tierPools[pattern[1]]).sort((first, second) => rankCandidate(first) - rankCandidate(second)).slice(0, 48);
        let bestPair = null;
        let bestScore = Number.POSITIVE_INFINITY;
        for (const first of firstPool) {
          if (requiredId && first.id !== requiredId) continue;
          if (first.tier === 5 && selected.some(candidate => candidate.tier === 5)) continue;
          if (!allowRepeatedIds && usedIds.has(first.id)) continue;
          if (conflictsWithPrevious(first, allowRepeatedIds)) continue;
          for (const second of secondPool) {
            if (first === second || first.id === second.id || first.text === second.text || first.signature === second.signature) continue;
            if (second.tier === 5 && (first.tier === 5 || selected.some(candidate => candidate.tier === 5))) continue;
            if (!allowRepeatedIds && usedIds.has(second.id)) continue;
            if (conflictsWithPrevious(second, allowRepeatedIds) || candidatesConflict(first, second) || !lengthPairAllowed(first, second) || first.id !== 'T5-04' && second.id !== 'T5-04' && !hintDistinctness.pairIsDistinct(first, second, code, qualityCache)) continue;
            const overlap = overlapCount(first, second);
            const lengthPenalty = first.lengthClass === 'lang' || second.lengthClass === 'lang' ? 6 : first.lengthClass === 'mittel' && second.lengthClass === 'mittel' ? 4 : 0;
            const tier5TypePenalty = (first.tier === 5 ? tier5TypeOrder.indexOf(first.id) * 1000 : 0) + (second.tier === 5 ? tier5TypeOrder.indexOf(second.id) * 1000 : 0);
            const score = patternIndex * 10000 + overlap * 8 + (usageScore(first) + usageScore(second)) * 14 + lengthPenalty + tier5TypePenalty - first.informationStrength - second.informationStrength + first.selectionPriority + second.selectionPriority + typeVarietyPenalty(first) + typeVarietyPenalty(second);
            if (score < bestScore) {
              bestPair = [first, second];
              bestScore = score;
            }
          }
        }
        if (!bestPair) continue;
        if (allowRepeatedIds) repeatedTypeFallbackUsed = true;
        for (let position = 0; position < bestPair.length; position++) {
          const candidate = bestPair[position];
          candidate.packageNumber = packageIndex + 1;
          candidate.packagePosition = position + 1;
          selected.push(candidate);
          usedIds.add(candidate.id);
          usedTexts.add(candidate.text);
          usedSignatures.add(candidate.signature);
          for (const internalPosition of candidate.internalPositions) positionUsage[internalPosition]++;
        }
        return;
      }
    }
    throw new Error('Paket ' + (packageIndex + 1) + ' konnte nicht mit zwei gültigen Hinweisen gefüllt werden.');
  }

  function verifyIntentionallyFalseComparison(candidate) {
    if (!candidate || candidate.id !== 'T2-01' || candidate.truth !== false || candidate.intentionallyFalse !== true || candidate.internalPositions.length !== 2) return false;
    const firstPosition = candidate.internalPositions[0];
    const secondPosition = candidate.internalPositions[1];
    if (firstPosition === secondPosition || code[firstPosition] >= code[secondPosition]) return false;
    const expectedFalseText = 'Die Zahl an Position ' + (firstPosition + 1) + ' ist größer als die Zahl an Position ' + (secondPosition + 1) + '.';
    return candidate.text === expectedFalseText && candidate.details.actualRelation === 'kleiner' && candidate.details.falseRelation === 'größer' && candidate.details.independentlyConfirmedFalse === true;
  }

  function applyT504Structure() {
    const metaIndex = selected.findIndex(candidate => candidate.id === 'T5-04');
    if (metaIndex < 0) return;
    const metaCandidate = selected[metaIndex];
    const witnessCandidates = metaCandidate.details.witnessSignatures.map(signature => candidateGroups[3]['T3-07'].find(candidate => candidate.signature === signature));
    if (witnessCandidates.some(candidate => !candidate || !verifyCandidate(candidate))) throw new Error('T5-04 wurde verworfen: Die drei unabhängigen Zwischenhinweise sind nicht vollständig wahr.');
    for (const witness of witnessCandidates) witness.lengthClass = classifyHintLength(witness);

    const packageIndexes = [1, 2, 3];
    const assignedWitnesses = new Set();
    const assignedPackages = new Set();
    for (const packageIndex of packageIndexes) {
      for (let slot = 0; slot < 2; slot++) {
        const selectedIndex = packageIndex * 2 + slot;
        const witnessIndex = witnessCandidates.findIndex(candidate => candidate.signature === selected[selectedIndex].signature);
        if (witnessIndex >= 0 && !assignedWitnesses.has(witnessIndex)) {
          assignedWitnesses.add(witnessIndex);
          assignedPackages.add(packageIndex);
        }
      }
    }
    const remainingWitnessIndexes = witnessCandidates.map((candidate, index) => index).filter(index => !assignedWitnesses.has(index));
    const remainingPackages = packageIndexes.filter(packageIndex => !assignedPackages.has(packageIndex));
    if (remainingWitnessIndexes.length !== remainingPackages.length) throw new Error('T5-04 wurde verworfen: Die Fairness-Hinweise lassen sich nicht eindeutig auf drei Pakete verteilen.');
    for (let index = 0; index < remainingPackages.length; index++) {
      const packageIndex = remainingPackages[index];
      const witness = witnessCandidates[remainingWitnessIndexes[index]];
      const firstIndex = packageIndex * 2;
      const packageCandidates = [selected[firstIndex], selected[firstIndex + 1]];
      const preferredSlot = packageCandidates.findIndex(candidate => candidate.id === 'T3-07');
      const longSlot = packageCandidates.findIndex(candidate => candidate.lengthClass === 'lang');
      const slotOrder = Array.from(new Set([preferredSlot, longSlot, 0, 1].filter(slot => slot >= 0)));
      const replaceSlot = slotOrder.find(slot => { const partner = packageCandidates[slot === 0 ? 1 : 0]; return partner.id !== witness.id && !candidatesConflict(witness, partner) && lengthPairAllowed(witness, partner); });
      if (!Number.isInteger(replaceSlot)) throw new Error('T5-04 wurde verworfen: Ein Fairness-Hinweis verletzt die Typ-, Doppelungs- oder Längenregel seines Pakets.');
      selected[firstIndex + replaceSlot] = Object.assign({}, witness, { packageNumber: packageIndex + 1, packagePosition: replaceSlot + 1 });
    }

    const lowerPosition = metaCandidate.details.lowerPosition;
    const upperPosition = metaCandidate.details.upperPosition;
    const originalTrueText = comparisonText(code, [lowerPosition, upperPosition]);
    const falseText = 'Die Zahl an Position ' + (lowerPosition + 1) + ' ist größer als die Zahl an Position ' + (upperPosition + 1) + '.';
    const comparisonIndex = settings.rankSelector ? 1 : 0;
    const originalComparison = selected[comparisonIndex];
    const falseCandidate = Object.assign({}, originalComparison, {
      internalPositions: [lowerPosition, upperPosition],
      visiblePositions: [lowerPosition + 1, upperPosition + 1],
      positionOrder: [lowerPosition, upperPosition],
      positionRoles: ['Tatsächlich kleinere Position', 'Tatsächlich größere Position'],
      text: falseText,
      canonicalText: falseText,
      signature: 'T5-04-FALSE|T2-01|' + lowerPosition + '-' + upperPosition,
      truth: false,
      intentionallyFalse: true,
      specialRuleType: 'absichtlich-falscher-vergleich-fuer-T5-04',
      independentValidation: true,
      details: { actualRelation: 'kleiner', falseRelation: 'größer', originalTrueText, falseText, independentlyConfirmedFalse: true, metaHintId: 'T5-04' },
      mathematicalRule: 'Für T5-04 wird der nachweislich wahre Kleiner-Vergleich plausibel, aber absichtlich falsch als Größer-Vergleich ausgegeben.'
    });
    falseCandidate.lengthClass = classifyHintLength(falseCandidate);
    if (!verifyIntentionallyFalseComparison(falseCandidate)) throw new Error('T5-04 wurde verworfen: Der umgekehrte Vergleich ist nicht unabhängig als falsch bestätigt.');
    selected[comparisonIndex] = falseCandidate;

    const eightOtherTrueHints = selected.filter((candidate, index) => index !== metaIndex && index !== comparisonIndex);
    metaCandidate.details = Object.assign({}, metaCandidate.details, { falseHintId: falseCandidate.id, falseHintIndex: comparisonIndex, originalTrueVariant: originalTrueText, generatedFalseVariant: falseText, confirmedFalseTruthValue: false, otherEightHintsTrue: eightOtherTrueHints.length === 8 && eightOtherTrueHints.every(candidate => candidate.truth === true), exactlyOneFalse: true, fairnessValidated: true, fairnessReason: 'Drei verschiedene wahre Zwischenhinweise erzwingen dieselbe kleinere und größere Grenze. Wäre der umgekehrte Vergleich wahr, wären alle drei Zwischenhinweise zugleich falsch; daher ist der Vergleich eindeutig der einzige falsche Hinweis.' });
    metaCandidate.fairnessValidated = true;
    metaCandidate.falseHintId = falseCandidate.id;
  }

  function applyLanguageVariants() {
    const usedVisibleTexts = new Set();
    const openingUsage = new Map();
    const templateUsage = new Map();
    let exactPositionOpeningCount = 0;
    let previousOpening = '';

    for (let packageIndex = 0; packageIndex < 5; packageIndex++) {
      const firstCandidate = selected[packageIndex * 2];
      const secondCandidate = selected[packageIndex * 2 + 1];
      const firstVariants = languageVariantsForCandidate(firstCandidate, code);
      const secondVariants = languageVariantsForCandidate(secondCandidate, code);
      const combinations = [];

      for (const firstVariant of firstVariants) {
        for (const secondVariant of secondVariants) {
          if (firstVariant.text === secondVariant.text || usedVisibleTexts.has(firstVariant.text) || usedVisibleTexts.has(secondVariant.text)) continue;
          const addedExactOpenings = Number(firstVariant.text.startsWith('Die Zahl an Position')) + Number(secondVariant.text.startsWith('Die Zahl an Position'));
          if (exactPositionOpeningCount + addedExactOpenings > 2) continue;
          const firstLength = classifyHintLength(Object.assign({}, firstCandidate, { text: firstVariant.text }));
          const secondLength = classifyHintLength(Object.assign({}, secondCandidate, { text: secondVariant.text }));
          if (!lengthPairAllowed({ lengthClass: firstLength }, { lengthClass: secondLength })) continue;
          combinations.push({ firstVariant, secondVariant, firstLength, secondLength });
        }
      }

      if (combinations.length === 0) throw new Error('Für Hinweispaket ' + (packageIndex + 1) + ' wurde keine sprachlich und längenmäßig zulässige Variante gefunden.');
      let eligible = combinations;
      const differentPackageOpenings = eligible.filter(entry => entry.firstVariant.opening !== entry.secondVariant.opening);
      if (differentPackageOpenings.length > 0) eligible = differentPackageOpenings;
      const differentAdjacentOpening = eligible.filter(entry => !previousOpening || entry.firstVariant.opening !== previousOpening);
      if (differentAdjacentOpening.length > 0) eligible = differentAdjacentOpening;

      let best = null;
      let bestScore = Number.POSITIVE_INFINITY;
      for (const entry of eligible) {
        const firstTemplateFamily = entry.firstVariant.id.replace(/-\d+$/, '');
        const secondTemplateFamily = entry.secondVariant.id.replace(/-\d+$/, '');
        const openingPenalty = (openingUsage.get(entry.firstVariant.opening) || 0) + (openingUsage.get(entry.secondVariant.opening) || 0);
        const templatePenalty = (templateUsage.get(firstTemplateFamily) || 0) + (templateUsage.get(secondTemplateFamily) || 0);
        const exactOpeningPenalty = Number(entry.firstVariant.text.startsWith('Die Zahl an Position')) + Number(entry.secondVariant.text.startsWith('Die Zahl an Position'));
        const stableTieBreaker = (entry.firstVariant.stableRank + entry.secondVariant.stableRank) % 1009;
        const score = openingPenalty * 600 + templatePenalty * 180 + exactOpeningPenalty * 250 + stableTieBreaker;
        if (score < bestScore) {
          best = entry;
          bestScore = score;
        }
      }

      const assignments = [
        { candidate: firstCandidate, variant: best.firstVariant, lengthClass: best.firstLength },
        { candidate: secondCandidate, variant: best.secondVariant, lengthClass: best.secondLength }
      ];
      for (const assignment of assignments) {
        assignment.candidate.text = assignment.variant.text;
        assignment.candidate.languageTemplateId = assignment.variant.id;
        assignment.candidate.languageVariantCount = languageVariantsForCandidate(assignment.candidate, code).length;
        assignment.candidate.sentenceOpening = assignment.variant.opening;
        assignment.candidate.lengthClass = assignment.lengthClass;
        usedVisibleTexts.add(assignment.variant.text);
        openingUsage.set(assignment.variant.opening, (openingUsage.get(assignment.variant.opening) || 0) + 1);
        const templateFamily = assignment.variant.id.replace(/-\d+$/, '');
        templateUsage.set(templateFamily, (templateUsage.get(templateFamily) || 0) + 1);
        if (assignment.variant.text.startsWith('Die Zahl an Position')) exactPositionOpeningCount++;
        previousOpening = assignment.variant.opening;
      }
    }

    if (exactPositionOpeningCount > 2) throw new Error('Die exakte Satzeröffnung "Die Zahl an Position" wird zu häufig verwendet.');
  }

  function finalizeSelection() {
  applyT504Structure();
  applyLanguageVariants();
  qualityCache.clear();

  if (selected.length !== 10) throw new Error('Es wurden nicht genau zehn normale Hinweise erzeugt.');
  if (new Set(selected.map(candidate => candidate.text)).size !== selected.length) throw new Error('Die normalen Hinweispakete enthalten doppelte Texte.');
  const tier5Count = selected.filter(candidate => candidate.tier === 5).length;
  if (!TIER_5_UNLOCKED && tier5Count !== 0) throw new Error('Tier 5 wurde vor seiner Freischaltung ausgewählt.');
  if (tier5Count > MAX_TIER_5_HINTS) throw new Error('Mehr als ein Tier-5-Hinweis wurde ausgewählt.');
  const selectedMetaHint = selected.find(candidate => candidate.id === 'T5-04');
  if (selectedMetaHint) {
    const otherHints = selected.filter(candidate => candidate !== selectedMetaHint);
    const falseHints = otherHints.filter(candidate => candidate.truth === false);
    const trueHints = otherHints.filter(candidate => candidate.truth === true);
    if (selectedMetaHint.text !== 'Einer der genannten Hinweise ist falsch!' || selectedMetaHint.truth !== true || falseHints.length !== 1 || trueHints.length !== 8 || !verifyIntentionallyFalseComparison(falseHints[0]) || selectedMetaHint.fairnessValidated !== true || selectedMetaHint.details.otherEightHintsTrue !== true || selectedMetaHint.details.exactlyOneFalse !== true) throw new Error('T5-04 verletzt die Wahrheits- oder Fairnessstruktur aus einem Metahinweis, acht wahren und genau einem falschen Hinweis.');
  } else if (selected.some(candidate => candidate.truth !== true)) throw new Error('Außerhalb von T5-04 wurde ein nicht wahrer Hinweis ausgewählt.');
  for (let packageIndex = 0; packageIndex < 5; packageIndex++) {
    const first = selected[packageIndex * 2];
    const second = selected[packageIndex * 2 + 1];
    if (!first || !second || first.packageNumber !== packageIndex + 1 || second.packageNumber !== packageIndex + 1) throw new Error('Ein Hinweispaket ist unvollständig.');
    if (first.id === second.id || (!first.intentionallyFalse && !second.intentionallyFalse && candidatesConflict(first, second)) || !lengthPairAllowed(first, second)) throw new Error('Ein Hinweispaket verletzt Typ-, Doppelungs- oder Längenregeln.');
  }
  for (const candidate of selected) candidate.repeatedTypeFallbackUsed = repeatedTypeFallbackUsed;
  for (let first = 0; first < selected.length; first++) for (let second = first + 1; second < selected.length; second++) {
    const left = selected[first];
    const right = selected[second];
    if (left.id === 'T5-04' || right.id === 'T5-04' || left.intentionallyFalse || right.intentionallyFalse) continue;
    if (!hintDistinctness.pairIsDistinct(left, right, code, qualityCache)) throw new Error('Hinweissatz enthält semantisch wiederholte Aussagen.');
  }
  return selected;
  }
  if (typeof settings.rankSelector === 'function') {
    return settings.rankSelector({code, tierPools, candidateGroups, selected,
      tier5Available, candidatesConflict, samePositionSet,
      lengthPairAllowed, classifyHintLength, estimateInformationExclusionPercent,
      minimumInformationPercent: MIN_HINT_EXCLUSION_PERCENT,
      toInternalHint}, finalizeSelection);
  }
  selectPackage(0, 'T2-01');
  selectPackage(1);
  selectPackage(2);
  selectPackage(3);
  selectPackage(4);
  return finalizeSelection();
}

const GENERATOR_VERSION = 2;
const ACTIVE_HINT_IDS = Object.freeze([
  "T1-01",
  "T1-02",
  "T1-03",
  "T1-05",
  "T1-06",
  "T1-07",
  "T1-08",
  "T1-09",
  "T1-12",
  "T1-13",
  "T1-14",
  "T1-DIGIT-00",
  "T1-DIGIT-01",
  "T1-DIGIT-02",
  "T1-DIGIT-03",
  "T1-DIGIT-04",
  "T1-DIGIT-05",
  "T1-DIGIT-06",
  "T1-DIGIT-07",
  "T1-DIGIT-08",
  "T1-DIGIT-09",
  "T1-CODE-01",
  "T1-CODE-02",
  "T1-CODE-03",
  "T2-01",
  "T2-02",
  "T2-03",
  "T2-04",
  "T2-06",
  "T2-07",
  "T2-08",
  "T2-09",
  "T2-10",
  "T2-11",
  "T2-12",
  "T2-13",
  "T2-14",
  "T2-15",
  "T2-16",
  "T2-CODE-01",
  "T2-CODE-03",
  "T2-CODE-04",
  "T3-01",
  "T3-02",
  "T3-03",
  "T3-04",
  "T3-06",
  "T3-07",
  "T3-08",
  "T3-09",
  "T3-10",
  "T3-11",
  "T3-12",
  "T3-13",
  "T3-14",
  "T3-15",
  "T3-16",
  "T3-17",
  "T3-18",
  "T3-19",
  "T3-20",
  "T3-CODE-01",
  "T3-CODE-02",
  "T3-CODE-03",
  "T3-CODE-04",
  "T4-01",
  "T4-02",
  "T4-03",
  "T4-04",
  "T4-05",
  "T4-06",
  "T4-07",
  "T4-08",
  "T4-09",
  "T4-10",
  "T4-11",
  "T4-12",
  "T4-13",
  "T4-14",
  "T4-15",
  "T4-16",
  "T4-17",
  "T4-18",
  "T4-19",
  "T4-20",
  "T4-21",
  "T4-22",
  "T4-23",
  "T4-CODE-01",
  "T4-CODE-02",
  "T4-CODE-03",
  "T4-CODE-05",
  "T4-CODE-06",
  "T4-CODE-07",
  "T1-CODE-04",
  "T4-CODE-04",
  "T5-01",
  "T5-02",
  "T5-03",
  "T5-04"
]);
const CONFLICTING_TYPE_GROUPS = Object.freeze([
  [
    "T1-02",
    "T1-05"
  ],
  [
    "T1-03",
    "T1-07"
  ],
  [
    "T1-13",
    "T1-12"
  ],
  [
    "T1-CODE-01",
    "T1-CODE-02"
  ],
  [
    "T1-CODE-03",
    "T1-CODE-04"
  ],
  [
    "T2-02",
    "T2-10"
  ],
  [
    "T2-02",
    "T2-15"
  ],
  [
    "T2-02",
    "T2-16"
  ],
  [
    "T2-03",
    "T2-06"
  ],
  [
    "T2-03",
    "T2-13"
  ],
  [
    "T2-04",
    "T2-06"
  ],
  [
    "T2-06",
    "T2-13"
  ],
  [
    "T2-10",
    "T2-15"
  ],
  [
    "T2-10",
    "T2-16"
  ],
  [
    "T2-01",
    "T2-14"
  ],
  [
    "T2-14",
    "T2-15"
  ],
  [
    "T2-09",
    "T2-11"
  ],
  [
    "T2-CODE-01",
    "T2-CODE-03"
  ],
  [
    "T3-01",
    "T3-10"
  ],
  [
    "T3-02",
    "T3-06"
  ],
  [
    "T3-02",
    "T3-07"
  ],
  [
    "T3-06",
    "T3-07"
  ],
  [
    "T3-06",
    "T3-12"
  ],
  [
    "T3-03",
    "T3-16"
  ],
  [
    "T3-08",
    "T3-11"
  ],
  [
    "T4-08",
    "T4-14"
  ],
  [
    "T4-11",
    "T4-12"
  ],
  [
    "T4-11",
    "T4-13"
  ],
  [
    "T4-12",
    "T4-13"
  ],
  [
    "T4-11",
    "T4-17"
  ],
  [
    "T4-12",
    "T4-17"
  ],
  [
    "T4-CODE-01",
    "T4-CODE-06"
  ],
  [
    "T5-01",
    "T2-01"
  ],
  [
    "T5-03",
    "T3-02"
  ],
  [
    "T5-03",
    "T3-06"
  ],
  [
    "T5-03",
    "T3-12"
  ],
  [
    "T5-03",
    "T4-CODE-04"
  ],
  [
    "T3-17",
    "T3-18"
  ],
  [
    "T3-17",
    "T3-19"
  ],
  [
    "T3-18",
    "T3-19"
  ],
  [
    "T3-17",
    "T3-03"
  ],
  [
    "T3-17",
    "T3-10"
  ],
  [
    "T3-17",
    "T3-16"
  ],
  [
    "T3-18",
    "T3-03"
  ],
  [
    "T3-18",
    "T3-10"
  ],
  [
    "T3-18",
    "T3-16"
  ],
  [
    "T3-19",
    "T3-03"
  ],
  [
    "T3-19",
    "T3-16"
  ],
  [
    "T3-20",
    "T2-12"
  ]
].map((group) => Object.freeze(group)));
const GENERATOR_POLICY = Object.freeze({
  hintCount: 10,
  packageCount: 5,
  hintsPerPackage: 2,
  maximumTier5Hints: 1,
  tier5RarityDivisor: 10,
  shortHintMaximumCharacters: 82,
  mediumHintMaximumCharacters: 132,
  t504Text: 'Einer der genannten Hinweise ist falsch!',
  minimumHintExclusionPercent: MIN_HINT_EXCLUSION_PERCENT,
  informationFilterVersion: 'visible-semantic-l055b-v1',
});
const INTERNAL_ONLY_FIELDS = Object.freeze([
  'signature', 'truthValue', 'mathematicalRule', 'internalPositions', 'details',
  'specialRule', 'independentValidation', 'codewideDerivations'
]);

function requireInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Generatorparameter fehlen.');
  if (typeof input.solutionCode !== 'string' || !/^\d{11}$/.test(input.solutionCode)) throw new Error('solutionCode muss serverseitig aus exakt elf Ziffern bestehen.');
  if (input.generatorVersion !== GENERATOR_VERSION) throw new Error('Generatorversion wird nicht unterstützt.');
  if (typeof input.seed !== 'string' || input.seed.length < 1 || input.seed.length > 256) throw new Error('Seedinformation ist ungültig.');
  if (typeof input.tier5Unlocked !== 'boolean') throw new Error('tier5Unlocked muss ein Boolean sein.');
  return {
    code: [...input.solutionCode].map(Number),
    seed: input.seed,
    tier5Unlocked: input.tier5Unlocked,
  };
}

function initialComparison(code, seed) {
  const first = stableTextHash('T2-01-a|' + seed + '|' + code.join('')) % code.length;
  const offset = 1 + stableTextHash('T2-01-b|' + seed + '|' + code.join('')) % (code.length - 1);
  const second = (first + offset) % code.length;
  const positions = [first, second];
  return {positions, text: comparisonText(code, positions)};
}

function explanationFor(candidate) {
  let explanationType = 'regelpruefung';
  if (candidate.id === 'T5-04') explanationType = 'genau-ein-falscher-hinweis';
  else if (candidate.id === 'T5-01') explanationType = 'positionszaehlung-von-rechts';
  else if (candidate.id === 'T5-02') explanationType = 'gleicher-teilungsrest';
  else if (candidate.id === 'T5-03') explanationType = 'codeweite-ableitung';
  else if (candidate.id === 'T1-DIGIT-06') explanationType = 'fakultaetsbeziehung';
  else if (candidate.id === 'T3-17') explanationType = 'punkt-vor-strich';
  else if (candidate.id === 'T3-18') explanationType = 'klammerrechnung';
  else if (candidate.id === 'T3-19') explanationType = 'produktquersumme';
  else if (candidate.id === 'T3-20') explanationType = 'zweistellige-teilbarkeit';
  else if (candidate.id === 'T4-23') explanationType = 'gemischter-ausdrucksvergleich';
  else if (candidate.id.includes('-CODE-')) explanationType = 'codeweite-ableitung';
  else if (candidate.internalPositions.length >= 4) explanationType = 'mehrpositionsbeziehung';
  else if (candidate.internalPositions.length >= 2) explanationType = 'positionsbeziehung';
  else explanationType = 'zifferneigenschaft';
  const explanationData = {
    hintId: candidate.id,
    visiblePositions: candidate.visiblePositions.slice(),
    positionRoles: candidate.positionRoles.slice(),
  };
  if (candidate.id.startsWith('T1-DIGIT-')) explanationData.propertyKey = candidate.details.propertyKey;
  if (candidate.id === 'T4-CODE-07') explanationData.derivationKeys = ['smallestEven', 'largestPrime', 'targetPosition'];
  if (candidate.id === 'T3-17' || candidate.id === 'T3-18') {
    explanationData.variant = candidate.details.variant;
    explanationData.result = candidate.details.result;
  }
  if (candidate.id === 'T3-19') explanationData.operation = 'product-then-first-digit-sum';
  if (candidate.id === 'T3-20') explanationData.divisor = candidate.details.divisor;
  if (candidate.id === 'T4-23') explanationData.comparison = candidate.details.comparison;
  return {
    explanationType,
    explanationData,
  };
}

function packageCompatibilityFor(candidate) {
  return {
    lengthClass: candidate.lengthClass,
    conflictChecked: true,
    conflictPolicy: 'active-candidatesConflict-l054-v2',
    duplicateSignatureChecked: true,
    maximumOneTier5: true,
    digitHintsUseNormalTier1Rules: true,
    longHintRequiresShortPartner: true,
  };
}

function toInternalHint(candidate) {
  const explanation = explanationFor(candidate);
  return {
    id: candidate.id,
    tier: candidate.tier,
    text: candidate.text,
    canonicalText: candidate.canonicalText,
    signature: candidate.signature,
    truthValue: candidate.truth,
    mathematicalRule: candidate.mathematicalRule,
    internalPositions: candidate.internalPositions.slice(),
    visiblePositions: candidate.visiblePositions.slice(),
    positionOrder: candidate.positionOrder.slice(),
    positionRoles: candidate.positionRoles.slice(),
    details: structuredClone(candidate.details),
    packageCompatibility: packageCompatibilityFor(candidate),
    lengthClass: candidate.lengthClass,
    specialRule: candidate.specialRuleType,
    explanationType: explanation.explanationType,
    explanationData: explanation.explanationData,
    codewideDerivations: candidate.codewideDerivations.slice(),
    independentValidation: candidate.independentValidation,
    requiresUnlock: candidate.requiresUnlock,
    optional: candidate.optional,
    informationStrength: candidate.informationStrength,
    selectionPriority: candidate.selectionPriority,
    intentionallyFalse: candidate.intentionallyFalse === true,
    fairnessValidated: candidate.fairnessValidated === true,
    packageNumber: candidate.packageNumber || null,
    packagePosition: candidate.packagePosition || null,
    languageTemplateId: candidate.languageTemplateId,
    languageVariantCount: candidate.languageVariantCount,
    sentenceOpening: candidate.sentenceOpening,
    repeatedTypeFallbackUsed: candidate.repeatedTypeFallbackUsed === true,
  };
}

function generateInternalHintSetWithSelector(input, rankSelector) {
  const settings = requireInput(input);
  const comparison = initialComparison(settings.code, settings.seed);
  const candidates = createGenerator(settings.code, comparison,
    rankSelector ? {...settings, rankSelector} : settings);
  const hints = candidates.map(toInternalHint);
  const packages = Array.from({length: 5}, (_, index) => ({
    packageNumber: index + 1,
    hints: hints.filter((hint) => hint.packageNumber === index + 1),
  }));
  if (hints.length !== 10 || packages.some((entry) => entry.hints.length !== 2)) throw new Error('Interne Paketstruktur ist ungültig.');
  return {
    generatorVersion: GENERATOR_VERSION,
    seed: settings.seed,
    tier5Unlocked: settings.tier5Unlocked,
    hintCount: hints.length,
    packageCount: packages.length,
    hints,
    packages,
  };
}

function generateInternalHintSet(input) {
  return generateInternalHintSetWithSelector(input, null);
}

function generateRankInternalHintSet(input, rankSelector) {
  if (typeof rankSelector !== 'function') throw new TypeError('Rangselektor fehlt.');
  return generateInternalHintSetWithSelector(input, rankSelector);
}

function generateHintCandidates(input) {
  const settings = requireInput(input);
  const comparison = initialComparison(settings.code, settings.seed);
  return createGenerator(settings.code, comparison, {...settings, mode: 'candidates'}).map(toInternalHint);
}

function auditHintCandidateFilter(input) {
  const settings = requireInput(input);
  const comparison = initialComparison(settings.code, settings.seed);
  return createGenerator(settings.code, comparison, {...settings, mode: 'candidateAudit'});
}

function toClientSafeHint(hint) {
  return {
    id: hint.id,
    tier: hint.tier,
    text: hint.text,
    visiblePositions: hint.visiblePositions.slice(),
    positionRoles: hint.positionRoles.slice(),
    lengthClass: hint.lengthClass,
    packageNumber: hint.packageNumber,
    packagePosition: hint.packagePosition,
    explanationType: hint.explanationType,
    explanationData: structuredClone(hint.explanationData),
  };
}

function toClientSafeHintSet(internalSet) {
  if (!internalSet || !Array.isArray(internalSet.hints) || internalSet.hints.length !== 10) throw new Error('Interner Hinweissatz ist ungültig.');
  const hints = internalSet.hints.map(toClientSafeHint);
  return {
    generatorVersion: internalSet.generatorVersion,
    hintCount: hints.length,
    packageCount: 5,
    packages: Array.from({length: 5}, (_, index) => ({
      packageNumber: index + 1,
      hints: hints.filter((hint) => hint.packageNumber === index + 1),
    })),
  };
}

function generateClientSafeHintSet(input) {
  return toClientSafeHintSet(generateInternalHintSet(input));
}

module.exports = Object.freeze({
  ACTIVE_HINT_IDS,
  CONFLICTING_TYPE_GROUPS,
  GENERATOR_VERSION,
  GENERATOR_POLICY,
  INTERNAL_ONLY_FIELDS,
  SOURCE_SHA256: 'a00cb14a16bd3f7a42bdfb93a3b6e8f68d94dcb5cd0b310679719621db0ee6d8',
  l054PointBeforeEvaluation,
  l054MixedComparisonEvaluation,
  estimateInformationExclusionPercent,
  VISIBLE_SEMANTIC_AUDITED_HINT_IDS,
  auditHintCandidateFilter,
  generateHintCandidates,
  generateInternalHintSet,
  generateRankInternalHintSet,
  generateClientSafeHintSet,
  toClientSafeHintSet,
});

},
"prototypes/firebase-lock-attempt/functions/src/hints/gdevelop-generator-core-v3.cjs":function(module,exports,require){
"use strict";

// Automatisch aus dem einzigen aktiven T1–T5-Generatorblock der GDevelop-
// Arbeitsdatei extrahiert. Historische hintType-1/2-Zweige sind nicht enthalten.
// Quellblock SHA-256: a00cb14a16bd3f7a42bdfb93a3b6e8f68d94dcb5cd0b310679719621db0ee6d8

const CUBE_DIGITS = new Set([0, 1, 8]);
const FIBONACCI_DIGITS = new Set([0, 1, 2, 3, 5, 8]);
const PRIME_DIGITS = new Set([2, 3, 5, 7]);
const PRIME_SUMS = new Set([2, 3, 5, 7, 11, 13, 17]);
const COMPOSITE_DIGITS = new Set([4, 6, 8, 9]);
const POWER_OF_TWO_DIGITS = new Set([1, 2, 4, 8]);
const TRIANGULAR_DIGITS = new Set([0, 1, 3, 6]);
const DISTINCT_PRIME_SUM_DIGITS = new Set([5, 7, 8, 9]);
const FACTORIAL_DIGITS = new Set([1, 2, 6]);
const SQUARE_SUMS = new Set([0, 1, 4, 9, 16]);
const FIBONACCI_SUMS = new Set([0, 1, 2, 3, 5, 8, 13]);
const hintDistinctness = (() => {
const PRIME_DIGITS = new Set([2, 3, 5, 7]);
const SQUARE_DIGITS = new Set([0, 1, 4, 9]);
const CUBE_DIGITS = new Set([0, 1, 8]);
const COMPOSITE_DIGITS = new Set([4, 6, 8, 9]);
const POWER_OF_TWO_DIGITS = new Set([1, 2, 4, 8]);
const FIBONACCI_DIGITS = new Set([0, 1, 2, 3, 5, 8]);
const DISTINCT_PRIME_SUM_DIGITS = new Set([5, 7, 8, 9]);
const FACTORIAL_DIGITS = new Set([1, 2, 6]);
const TRIANGULAR_DIGITS = new Set([0, 1, 3, 6]);
const SQUARE_SUMS = new Set([0, 1, 4, 9, 16]);
const FIBONACCI_SUMS = new Set([0, 1, 2, 3, 5, 8, 13]);
const PRIME_SUMS = new Set([2, 3, 5, 7, 11, 13, 17]);

const relation = (first, second) => first > second ? "größer" : first < second ? "kleiner" : "gleich";
const digitSum = (value) => String(value).split("").reduce((sum, digit) => sum + Number(digit), 0);
const statedEvenParity = (text) => {
  if (typeof text !== "string") return null;
  const even = /\bgerade\b/u.test(text.toLowerCase());
  const odd = /\bungerade\b/u.test(text.toLowerCase());
  return even === odd ? null : even;
};
const relationFromHint = (hint) => {
  if (["größer", "kleiner", "gleich"].includes(hint.details?.comparison)) return hint.details.comparison;
  const text = String(hint.text || "").toLowerCase();
  if (text.includes("größer") || text.includes("mehr")) return "größer";
  if (text.includes("kleiner") || text.includes("weniger")) return "kleiner";
  return "gleich";
};

function analyzeCode(code) {
  const indexed = code.map((value, position) => ({value, position}));
  const valuesFor = (predicate) => code.filter(predicate);
  const firstPositionFor = (predicate) => indexed.find((entry) => predicate(entry.value))?.position ?? null;
  const lastPositionFor = (predicate) => indexed.slice().reverse().find((entry) => predicate(entry.value))?.position ?? null;
  const primes = valuesFor((value) => PRIME_DIGITS.has(value));
  const evens = valuesFor((value) => value % 2 === 0);
  const odds = valuesFor((value) => value % 2 !== 0);
  const sorted = code.slice().sort((first, second) => first - second);
  const minimum = sorted[0];
  const maximum = sorted.at(-1);
  const median = (sorted[code.length / 2 - 1] + sorted[code.length / 2]) / 2;
  const firstPrime = firstPositionFor((value) => PRIME_DIGITS.has(value));
  const lastPrime = lastPositionFor((value) => PRIME_DIGITS.has(value));
  const firstEven = firstPositionFor((value) => value % 2 === 0);
  const lastOdd = lastPositionFor((value) => value % 2 !== 0);
  const firstMinimum = code.indexOf(minimum);
  const lastMinimum = code.lastIndexOf(minimum);
  const firstMaximum = code.indexOf(maximum);
  const lastMaximum = code.lastIndexOf(maximum);
  return {
    minimum,
    maximum,
    median,
    medianFirst: code.indexOf(median),
    smallestEven: evens.length ? Math.min(...evens) : null,
    largestPrime: primes.length ? Math.max(...primes) : null,
    largestOdd: odds.length ? Math.max(...odds) : null,
    firstPrime,
    lastPrime,
    afterFirstPrime: Number.isInteger(firstPrime) && firstPrime < code.length - 1 ? firstPrime + 1 : null,
    beforeLastPrime: Number.isInteger(lastPrime) && lastPrime > 0 ? lastPrime - 1 : null,
    firstEven,
    lastOdd,
    firstMinimum,
    lastMinimum,
    firstMaximum,
    lastMaximum,
  };
}

function patternFrequencies(values) {
  const frequencies = new Map();
  for (const value of values) frequencies.set(value, (frequencies.get(value) || 0) + 1);
  return [...frequencies.values()];
}

function visibleHintIsTrue(hint, code) {
  const id = hint.id;
  const p = hint.internalPositions;
  const d = hint.details || {};
  const v = p.map((position) => code[position]);
  const text = String(hint.text || "").toLowerCase();

  if (/^T1-DIGIT-\d{2}$/.test(id)) {
    const digit = Number(id.slice(-2));
    return id === "T1-DIGIT-06" ? v[0] === 6 && v[1] === 3 : v[0] === digit;
  }
  if (id === "T1-01") {
    const even = statedEvenParity(hint.text);
    return even === null ? null : (v[0] % 2 === 0) === even;
  }
  if (id === "T1-02") return PRIME_DIGITS.has(v[0]) === !text.includes("keine primzahl");
  if (id === "T1-03") return SQUARE_DIGITS.has(v[0]) === !text.includes("keine quadratzahl");
  if (id === "T1-05") return COMPOSITE_DIGITS.has(v[0]) === (d.composite === true);
  if (id === "T1-06") return POWER_OF_TWO_DIGITS.has(v[0]) === (d.powerOfTwo === true);
  if (id === "T1-07") return CUBE_DIGITS.has(v[0]) === (d.cube === true);
  if (id === "T1-08") return FIBONACCI_DIGITS.has(v[0]) === !text.includes("nicht zur fibonacci");
  if (id === "T1-09") return (v[0] % 2 === (p[0] + 1) % 2) === (d.samePositionParity === true);
  if (id === "T1-12") return DISTINCT_PRIME_SUM_DIGITS.has(v[0]) === (d.distinctPrimeSum === true);
  if (id === "T1-13") return FACTORIAL_DIGITS.has(v[0]) === (d.factorial === true);
  if (id === "T1-14") return TRIANGULAR_DIGITS.has(v[0]) === (d.triangular === true);

  if (id === "T2-01") return relation(v[0], v[1]) === relationFromHint(hint);
  if (id === "T2-02") return SQUARE_SUMS.has(v[0] + v[1]) === (d.square === true);
  if (id === "T2-03") return SQUARE_DIGITS.has(Math.abs(v[0] - v[1])) === (d.square === true);
  if (id === "T2-04") return (v[0] % 2 === v[1] % 2) === (d.sameParity === true);
  if (id === "T2-06") {
    const even = statedEvenParity(hint.text);
    return even === null ? null :
      (Math.abs(v[0] - v[1]) % 2 === 0) === even;
  }
  if (id === "T2-07") return Number.isInteger(Math.sqrt(v[0] * v[1])) === (d.square === true);
  if (id === "T2-08") return Math.abs(v[0] - v[1]) === 1;
  if (id === "T2-09") return d.ratioDirection === "double" ? v[0] === 2 * v[1] : d.ratioDirection === "half" ? 2 * v[0] === v[1] : false;
  if (id === "T2-10") return FIBONACCI_SUMS.has(v[0] + v[1]) === (d.fibonacci === true);
  if (id === "T2-11") return v[1] !== 0 && v[0] % v[1] === 0;
  if (id === "T2-12") {
    const number = 10 * v[0] + v[1];
    const twoDigitSquare = v[0] !== 0 && Number.isInteger(Math.sqrt(number));
    return twoDigitSquare === (d.square === true);
  }
  if (id === "T2-13") return PRIME_DIGITS.has(Math.abs(v[0] - v[1])) === !text.includes("keine primzahl");
  if (id === "T2-14") return (v[0] === v[1]) === (d.equal === true);
  if (id === "T2-15") return Math.abs(v[0] - 5) === Math.abs(v[1] - 5);
  if (id === "T2-16") return PRIME_SUMS.has(v[0] + v[1]) === (d.prime === true);

  if (id === "T3-01") return relation(v[0] + v[1], v[2]) === d.comparison;
  if (id === "T3-02") return text.includes("kleiner") ? v[0] > v[1] && v[1] > v[2] : v[0] < v[1] && v[1] < v[2];
  if (id === "T3-03") return relation(v[0] * v[1], v[2]) === d.comparison;
  if (id === "T3-04") return new Set(v).size === 2 && patternFrequencies(v).includes(2);
  if (id === "T3-06") return v[1] - v[0] !== 0 && v[1] - v[0] === v[2] - v[1];
  if (id === "T3-07") return v[1] < v[0] && v[0] < v[2];
  if (id === "T3-08") return relation(Math.abs(v[0] - v[1]), v[2]) === d.comparison;
  if (id === "T3-09") {
    const palindrome = v[0] !== 0 && v[0] === v[2];
    return palindrome === (d.palindrome === true);
  }
  if (id === "T3-10") return v[0] + v[1] === v[2];
  if (id === "T3-11") return Math.abs(v[0] - v[1]) === v[2];
  if (id === "T3-12") return v[0] + v[1] === 2 * v[2];
  if (id === "T3-13") return PRIME_DIGITS.has(Math.max(...v) - Math.min(...v)) === (d.prime === true);
  if (id === "T3-14") {
    const sides = v.slice().sort((first, second) => first - second);
    return sides[0] > 0 && sides[0] + sides[1] > sides[2];
  }
  if (id === "T3-15") return ((v[0] + v[1] + v[2]) % 2 === 0) === (d.parity === "even");
  if (id === "T3-16") return (v[0] * v[1]) % 10 === v[2];
  if (id === "T3-17") return (d.variant === "productPlus" ? v[2] + v[0] * v[1] : v[2] - v[0] * v[1]) === d.result;
  if (id === "T3-18") return (d.variant === "groupedPlus" ? v[0] + v[1] : v[0] - v[1]) * v[2] === d.result;
  if (id === "T3-19") return digitSum(v[0] * v[1]) === v[2];
  if (id === "T3-20") return v[0] !== 0 && (10 * v[0] + v[1]) % d.divisor === 0;

  if (id === "T4-01") return v.every((value, index) => value === v[v.length - 1 - index]);
  if (id === "T4-02") return relation(v[0] + v[1], v[2] + v[3]) === relationFromHint(hint);
  if (id === "T4-03") return ((v[0] + v[1]) % 2 === (v[2] + v[3]) % 2) === (d.sameParity === true);
  if (id === "T4-04") return v[0] === v[2] && v[1] === v[3] && v[0] !== v[1];
  if (id === "T4-05") return Math.abs(v[0] - v[1]) > 0 && Math.abs(v[0] - v[1]) === Math.abs(v[2] - v[3]);
  if (id === "T4-06") return relation(v[0] * v[1], v[2] * v[3]) === d.comparison;
  if (id === "T4-07") return v[0] === v[1] && v[2] === v[3] && v[0] !== v[2];
  if (id === "T4-08") {
    const first = d.firstGroup.reduce((sum, position) => sum + code[position], 0);
    const second = d.secondGroup.reduce((sum, position) => sum + code[position], 0);
    return first === second;
  }
  if (id === "T4-09") {
    const counts = patternFrequencies(v);
    return counts.filter((count) => count === 2).length === 1 && counts.every((count) => count === 1 || count === 2);
  }
  if (id === "T4-10") return v[0] === v[3] && v[1] === v[4] && v[2] === v[5] && new Set(v.slice(0, 3)).size >= 2;
  if (id === "T4-11") return v.slice(1).every((value, index) => v[index] < value);
  if (id === "T4-12") return v.slice(1).every((value, index) => v[index] > value);
  if (id === "T4-13") return v[1] - v[0] !== 0 && v.slice(1).every((value, index) => value - v[index] === v[1] - v[0]);
  if (id === "T4-14") {
    const first = d.firstGroup.reduce((sum, position) => sum + code[position], 0);
    const second = d.secondGroup.reduce((sum, position) => sum + code[position], 0);
    return d.relation === "mehr" ? first > second : first < second;
  }
  if (id === "T4-15") return code.filter((value) => value === v[0]).length === d.frequency;
  if (id === "T4-16") {
    const counts = patternFrequencies(v);
    return counts.filter((count) => count === 2).length === 2 && counts.every((count) => count === 1 || count === 2);
  }
  if (id === "T4-17") return new Set(v).size === v.length;
  if (id === "T4-18") return v[0] + v[5] === v[1] + v[4] && v[1] + v[4] === v[2] + v[3];
  if (id === "T4-19") return Math.abs(v[0] + v[1] - v[3] - v[4]) === v[2];
  if (id === "T4-20") {
    const odd = code.filter((value, index) => index % 2 === 0).reduce((sum, value) => sum + value, 0);
    const even = code.filter((value, index) => index % 2 === 1).reduce((sum, value) => sum + value, 0);
    return relation(odd, even) === d.comparison;
  }
  if (id === "T4-21") return v.slice(0, -1).reduce((sum, value) => sum + value, 0) % 10 === v.at(-1);
  if (id === "T4-22") {
    const counts = patternFrequencies(v);
    return counts.filter((count) => count === 3).length === 1 && counts.every((count) => count === 1 || count === 3);
  }
  if (id === "T4-23") {
    const left = v[2] + v[0] * v[1];
    const right = v[3] + v[4] * v[5];
    return relation(left, right) === d.comparison;
  }

  const global = analyzeCode(code);
  if (id === "T1-CODE-01") return Number.isInteger(global.largestPrime) && relation(global.largestPrime, v[0]) === d.comparison;
  if (id === "T1-CODE-02") return Number.isInteger(global.smallestEven) && relation(global.smallestEven, v[0]) === d.comparison;
  if (id === "T1-CODE-03") {
    const extremum = v[0] === global.maximum ? "maximum" : v[0] === global.minimum ? "minimum" : "neither";
    return extremum === d.extremum;
  }
  if (id === "T1-CODE-04") return relation(global.median, v[0]) === d.comparison;
  if (id === "T2-CODE-01") {
    const source = d.sourceKey === "smallestEven" ? global.smallestEven : d.sourceKey === "largestPrime" ? global.largestPrime : global.largestOdd;
    if (!Number.isInteger(source)) return false;
    return d.mode === "greaterBoth" ? source > v[0] && source > v[1] : d.mode === "lessBoth" ? source < v[0] && source < v[1] : v[0] < source && source < v[1];
  }
  if (id === "T2-CODE-03") {
    if (!Number.isInteger(global.largestPrime)) return false;
    return d.mode === "bothGreater" ? v[0] > global.largestPrime && v[1] > global.largestPrime : d.mode === "bothSmaller" ? v[0] < global.largestPrime && v[1] < global.largestPrime : v[0] < global.largestPrime && global.largestPrime < v[1];
  }
  if (id === "T2-CODE-04") {
    const extremum = d.extremum === "minimum" ? global.minimum : global.maximum;
    const first = Math.abs(v[0] - extremum);
    const second = Math.abs(v[1] - extremum);
    return first > 0 && first < second;
  }
  if (id === "T3-CODE-01" || id === "T3-CODE-02") {
    const neighbor = id === "T3-CODE-01" ? global.afterFirstPrime : global.beforeLastPrime;
    if (!Number.isInteger(neighbor)) return false;
    const value = code[neighbor];
    return (value % 2 === 0 ? "even" : "odd") === d.parity && relation(value, code[d.targetPosition]) === d.comparison;
  }
  if (id === "T3-CODE-03") {
    const occurrence = d.occurrenceLabel.includes("ersten Vorkommen der kleinsten") ? global.firstMinimum : d.occurrenceLabel.includes("letzten Vorkommen der kleinsten") ? global.lastMinimum : d.occurrenceLabel.includes("ersten Vorkommen der größten") ? global.firstMaximum : global.lastMaximum;
    const neighbor = d.directionLabel === "vor" ? occurrence - 1 : occurrence + 1;
    return neighbor >= 0 && neighbor < code.length && relation(code[neighbor], code[d.targetPosition]) === d.comparison;
  }
  if (id === "T3-CODE-04") return Number.isInteger(global.afterFirstPrime) && Number.isInteger(global.beforeLastPrime) && relation(code[global.afterFirstPrime], code[global.beforeLastPrime]) === d.comparison;
  if (id === "T4-CODE-01") {
    const edgeMaximum = code[0] === global.maximum || code.at(-1) === global.maximum;
    const abovePrimes = !Number.isInteger(global.largestPrime) || code[0] > global.largestPrime && code.at(-1) > global.largestPrime;
    return !edgeMaximum && abovePrimes;
  }
  if (id === "T4-CODE-02") return Number.isInteger(global.afterFirstPrime) && Number.isInteger(global.smallestEven) && Number.isInteger(global.largestOdd) && global.smallestEven < code[global.afterFirstPrime] && code[global.afterFirstPrime] < global.largestOdd;
  if (id === "T4-CODE-03") return Number.isInteger(global.firstPrime) && global.firstPrime > 0 && Number.isInteger(global.lastPrime) && global.lastPrime < code.length - 1 && code[global.firstPrime - 1] + code[global.lastPrime + 1] === code[d.targetPosition];
  if (id === "T4-CODE-04") {
    if (!Number.isInteger(global.firstEven) || !Number.isInteger(global.lastOdd)) return false;
    const values = [code[global.firstEven], code[global.lastOdd], global.median];
    return d.direction === "ascending" ? values[0] < values[1] && values[1] < values[2] : values[0] > values[1] && values[1] > values[2];
  }
  if (id === "T4-CODE-05") return Number.isInteger(global.afterFirstPrime) && code[global.afterFirstPrime] === global.maximum - global.minimum;
  if (id === "T4-CODE-06") return global.minimum < code[0] && code[0] < global.maximum && global.minimum < code.at(-1) && code.at(-1) < global.maximum;
  if (id === "T4-CODE-07") return Number.isInteger(global.smallestEven) && Number.isInteger(global.largestPrime) && global.smallestEven < global.largestPrime && global.largestPrime < code[d.targetPosition];
  if (id === "T5-01") {
    const positions = d.rightVisiblePositions.map((position) => code.length - position);
    return relation(code[positions[0]], code[positions[1]]) === d.comparison;
  }
  if (id === "T5-02") {
    const divisor = v[2];
    return divisor > 1 && v[0] !== v[1] && v[0] % divisor > 0 && v[0] % divisor === v[1] % divisor;
  }
  if (id === "T5-03") {
    const positionsByKey = {
      afterFirstPrime: global.afterFirstPrime,
      beforeLastPrime: global.beforeLastPrime,
      firstEven: global.firstEven,
      lastOdd: global.lastOdd,
      afterFirstMinimum: global.firstMinimum < code.length - 1 ? global.firstMinimum + 1 : null,
      beforeLastMaximum: global.lastMaximum > 0 ? global.lastMaximum - 1 : null,
      medianFirstPosition: global.medianFirst,
    };
    const positions = d.derivationKeys.map((key) => positionsByKey[key]);
    if (positions.some((position) => !Number.isInteger(position))) return false;
    const values = positions.map((position) => code[position]);
    if (d.pattern === "arithmetic") return values[1] - values[0] !== 0 && values[1] - values[0] === values[2] - values[1];
    if (d.pattern === "ascending") return values[0] < values[1] && values[1] < values[2];
    if (d.pattern === "descending") return values[0] > values[1] && values[1] > values[2];
    return d.pattern === "firstThirdEqual" && values[0] === values[2] && values[0] !== values[1];
  }
  if (id === "T5-04") return true;
  return null;
}
// V2 excludes relational clues that only restate parity of several positions.
// Single-digit properties and mixed mathematical clues remain available.
const EXCLUDED_IDS = new Set(["T2-04", "T2-06", "T3-15", "T4-03"]);
const LOCAL_IDS = new Set([
  ..."01 02 03 05 06 07 08 09 12 13 14".split(" ").map(n => `T1-${n}`),
  ...Array.from({length: 10}, (_, n) => `T1-DIGIT-${String(n).padStart(2, "0")}`),
  ..."01 02 03 04 06 07 08 09 10 11 12 13 14 15 16".split(" ").map(n => `T2-${n}`),
  ..."01 02 03 04 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20".split(" ").map(n => `T3-${n}`),
  ..."01 02 03 04 05 06 07 08 09 10 11 12 13 14 16 17 18 19 21 22 23".split(" ").map(n => `T4-${n}`),
  "T5-01", "T5-02",
]);
const MAX_EXACT_POSITIONS = 4;
const MAX_SAMPLED_ROWS = 1024;

function localPositions(hint) {
  if (!hint || !LOCAL_IDS.has(hint.id) ||
      !Array.isArray(hint.internalPositions) ||
      hint.internalPositions.some(position => !Number.isInteger(position) ||
        position < 0 || position >= 12)) return null;
  return [...new Set(hint.internalPositions)].sort((a, b) => a - b);
}

function truth(hint, code, beforeEvaluation) {
  if (beforeEvaluation) beforeEvaluation();
  try { return visibleHintIsTrue(hint, code); }
  catch { return null; }
}

// A pair is certified only by actual counterexamples in both directions.
// Exhaustion proves implication for small local supports. Beyond four positions
// the search is bounded; missing evidence means "unknown", never "distinct".
function certifyDistinct(first, second, sourceCode,
  maxRows = MAX_SAMPLED_ROWS, beforeEvaluation) {
  if (!first || !second || !Array.isArray(sourceCode) ||
      ![8, 10, 12].includes(sourceCode.length) || !Number.isInteger(maxRows) ||
      maxRows < 1 || maxRows > MAX_SAMPLED_ROWS) return null;
  if (first.id === "T5-04" || second.id === "T5-04" ||
      first.intentionallyFalse || second.intentionallyFalse) return null;
  if (truth(first, sourceCode, beforeEvaluation) !== true ||
      truth(second, sourceCode, beforeEvaluation) !== true) return null;
  const firstLocal = localPositions(first);
  const secondLocal = localPositions(second);
  const support = firstLocal && secondLocal ?
    [...new Set([...firstLocal, ...secondLocal])].sort((a, b) => a - b) : null;
  if (support && support.some(position => position >= sourceCode.length)) return null;
  const exact = support !== null && support.length <= MAX_EXACT_POSITIONS;
  const rows = exact ? 10 ** support.length : maxRows;
  let firstOnly = null;
  let secondOnly = null;
  let state = 2166136261;
  for (const character of [first.signature, second.signature].sort().join("|")) {
    state = Math.imul(state ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  const code = sourceCode.slice();
  for (let row = 0; row < rows; row++) {
    if (exact) {
      let value = row;
      for (const position of support) {
        code[position] = value % 10;
        value = Math.floor(value / 10);
      }
    } else if (row < sourceCode.length * 10) {
      code.splice(0, sourceCode.length, ...sourceCode);
      code[Math.floor(row / 10) % sourceCode.length] = row % 10;
    } else {
      for (let position = 0; position < sourceCode.length; position++) {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        code[position] = (state >>> 0) % 10;
      }
    }
    const left = truth(first, code, beforeEvaluation);
    const right = truth(second, code, beforeEvaluation);
    if (typeof left !== "boolean" || typeof right !== "boolean") return null;
    if (left && !right && firstOnly === null) firstOnly = code.slice();
    if (right && !left && secondOnly === null) secondOnly = code.slice();
    if (firstOnly && secondOnly) return Object.freeze({
      firstOnly: Object.freeze(firstOnly),
      secondOnly: Object.freeze(secondOnly), rowsChecked: row + 1, exact,
    });
  }
  return null;
}

function pairIsDistinct(first, second, code, cache,
  beforeEvaluation) {
  const key = [first.signature, second.signature].sort().join("|");
  if (!cache.has(key)) cache.set(key, certifyDistinct(first,
    second, code, MAX_SAMPLED_ROWS, beforeEvaluation));
  return cache.get(key) !== null;
}
return Object.freeze({EXCLUDED_IDS, pairIsDistinct});
})();

const L054_DIVISORS = Object.freeze([2, 3, 4, 5, 6, 8, 9]);
const L054_HINT_IDS = new Set(['T3-17', 'T3-18', 'T3-19', 'T3-20', 'T4-23']);
const L054_MAX_RESULT = 45;
const L054_EXACT_RESULT_COUNTS = Object.freeze({ productPlus: Array(163).fill(0), productMinus: Array(163).fill(0), groupedPlus: Array(163).fill(0), groupedMinus: Array(163).fill(0) });
for (let first = 0; first <= 9; first++) {
  for (let second = 0; second <= 9; second++) {
    for (let third = 0; third <= 9; third++) {
      const results = { productPlus: third + first * second, productMinus: third - first * second, groupedPlus: (first + second) * third, groupedMinus: (first - second) * third };
      for (const variant of Object.keys(results)) if (results[variant] >= 0) L054_EXACT_RESULT_COUNTS[variant][results[variant]]++;
    }
  }
}
let l054ProductDigitSumAssignments = 0;
for (let first = 0; first <= 9; first++) {
  for (let second = 0; second <= 9; second++) {
    const product = first * second;
    const sum = l054DigitSum(product);
    if (product >= 10 && sum <= 9) l054ProductDigitSumAssignments++;
  }
}
const L054_PRODUCT_DIGIT_SUM_EXCLUSION_PERCENT = l054ExclusionPercent(l054ProductDigitSumAssignments, 1000);
const l054MixedValueCounts = Array(91).fill(0);
for (let first = 0; first <= 9; first++) for (let second = 0; second <= 9; second++) for (let third = 0; third <= 9; third++) l054MixedValueCounts[first * second + third]++;
let l054MixedLessAssignments = 0;
for (let left = 0; left < l054MixedValueCounts.length; left++) for (let right = left + 1; right < l054MixedValueCounts.length; right++) l054MixedLessAssignments += l054MixedValueCounts[left] * l054MixedValueCounts[right];
const L054_MIXED_EXCLUSION_PERCENT = l054ExclusionPercent(l054MixedLessAssignments, 1000000);
const DIGIT_HINT_DEFINITIONS = Object.freeze([
  Object.freeze({ id: 'T1-DIGIT-00', digit: 0, propertyKey: 'additiveIdentity', expression: '0', germanProperty: 'das neutrale Element der Addition' }),
  Object.freeze({ id: 'T1-DIGIT-01', digit: 1, propertyKey: 'multiplicativeIdentity', expression: '1', germanProperty: 'das neutrale Element der Multiplikation' }),
  Object.freeze({ id: 'T1-DIGIT-02', digit: 2, propertyKey: 'onlyEvenPrime', expression: '2', germanProperty: 'die einzige gerade Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-03', digit: 3, propertyKey: 'smallestOddPrime', expression: '3', germanProperty: 'die kleinste ungerade Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-04', digit: 4, propertyKey: 'squareOfSmallestPrime', expression: '2² = 4', germanProperty: 'das Quadrat der kleinsten Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-05', digit: 5, propertyKey: 'onlyOddPrimeDivisorOfTen', expression: '10 : 5 = 2', germanProperty: 'die einzige ungerade Primzahl, die ein Teiler von 10 ist' }),
  Object.freeze({ id: 'T1-DIGIT-06', digit: 6, propertyKey: 'factorialOfThree', expression: '3! = 6', sourceDigit: 3 }),
  Object.freeze({ id: 'T1-DIGIT-07', digit: 7, propertyKey: 'largestSingleDigitPrime', expression: '7', germanProperty: 'die größte einstellige Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-08', digit: 8, propertyKey: 'cubeOfSmallestPrime', expression: '2³ = 8', germanProperty: 'der Kubus der kleinsten Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-09', digit: 9, propertyKey: 'squareOfSmallestOddPrime', expression: '3² = 9', germanProperty: 'das Quadrat der kleinsten ungeraden Primzahl' })
]);
const DIGIT_HINT_BY_DIGIT = new Map(DIGIT_HINT_DEFINITIONS.map(definition => [definition.digit, definition]));
const DIGIT_HINT_IDS = new Set(DIGIT_HINT_DEFINITIONS.map(definition => definition.id));
const ORDINAL_NOMINATIVE = ['', 'erste', 'zweite', 'dritte', 'vierte', 'fünfte', 'sechste', 'siebte', 'achte', 'neunte', 'zehnte', 'elfte', 'zwölfte'];
const ORDINAL_DATIVE = ['', 'ersten', 'zweiten', 'dritten', 'vierten', 'fünften', 'sechsten', 'siebten', 'achten', 'neunten', 'zehnten', 'elften', 'zwölften'];

function ordinal(position, grammaticalForm) {
  if (!Number.isInteger(position) || position < 1 || position > 12) throw new Error('Ungültige sichtbare Position für eine deutsche Ordnungszahl: ' + position);
  return grammaticalForm === 'dative' ? ORDINAL_DATIVE[position] : ORDINAL_NOMINATIVE[position];
}

function joinGerman(values) {
  if (values.length === 0) return '';
  if (values.length === 1) return values[0];
  return values.slice(0, -1).join(', ') + ' und ' + values[values.length - 1];
}

function positionList(positions) {
  const labels = positions.map(position => 'Position ' + (position + 1));
  if (labels.length === 1) return labels[0];
  return labels.slice(0, -1).join(', ') + ' und ' + labels[labels.length - 1];
}

function relation(valueA, valueB) {
  if (valueA > valueB) return 'größer';
  if (valueA < valueB) return 'kleiner';
  return 'gleich';
}

function comparisonText(code, positions) {
  const first = positions[0];
  const second = positions[1];
  const comparison = relation(code[first], code[second]);
  if (comparison === 'gleich') {
    return 'Die Ziffern an den Positionen ' + (first + 1) + ' und ' + (second + 1) + ' sind gleich.';
  }
  return 'Die Ziffer an Position ' + (first + 1) + ' ist ' + comparison + ' als die an Position ' + (second + 1) + '.';
}

function digitHintText(definition, positions) {
  if (definition.id === 'T1-DIGIT-06') return 'Die Ziffer an Position ' + (positions[0] + 1) + ' ist die Fakultät der Ziffer an Position ' + (positions[1] + 1) + '.';
  return 'Die Ziffer an Position ' + (positions[0] + 1) + ' ist ' + definition.germanProperty + '.';
}

function tier1ParityText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (code[positions[0]] % 2 === 0 ? 'gerade.' : 'ungerade.');
}

function tier1PrimeText(code, positions) {
  const isPrime = [2, 3, 5, 7].includes(code[positions[0]]);
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (isPrime ? 'eine Primzahl.' : 'keine Primzahl.');
}

function tier1SquareText(code, positions) {
  const isSquare = [0, 1, 4, 9].includes(code[positions[0]]);
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (isSquare ? 'eine Quadratzahl.' : 'keine Quadratzahl.');
}

function tier1CompositeText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (COMPOSITE_DIGITS.has(code[positions[0]]) ? 'eine zusammengesetzte Zahl.' : 'keine zusammengesetzte Zahl.');
}

function tier1PowerOfTwoText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (POWER_OF_TWO_DIGITS.has(code[positions[0]]) ? 'eine Zweierpotenz.' : 'keine Zweierpotenz.');
}

function tier1CubeText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (CUBE_DIGITS.has(code[positions[0]]) ? 'eine Kubikzahl.' : 'keine Kubikzahl.');
}

function tier1FibonacciText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' gehört ' + (FIBONACCI_DIGITS.has(code[positions[0]]) ? 'zur Fibonacci-Folge.' : 'nicht zur Fibonacci-Folge.');
}

function tier1PositionParityText(code, positions) {
  const sameParity = code[positions[0]] % 2 === (positions[0] + 1) % 2;
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' hat ' + (sameParity ? 'dieselbe Parität wie' : 'eine andere Parität als') + ' ihre Positionsnummer.';
}

function tier1DistinctPrimeSumText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' lässt sich ' + (DISTINCT_PRIME_SUM_DIGITS.has(code[positions[0]]) ? '' : 'nicht ') + 'als Summe zweier verschiedener Primzahlen schreiben.';
}

function tier1FactorialText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (FACTORIAL_DIGITS.has(code[positions[0]]) ? 'eine Fakultätszahl.' : 'keine Fakultätszahl.');
}

function tier1TriangularText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (TRIANGULAR_DIGITS.has(code[positions[0]]) ? 'eine Dreieckszahl.' : 'keine Dreieckszahl.');
}

function tier2SumSquareText(code, positions) {
  const sum = code[positions[0]] + code[positions[1]];
  return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (SQUARE_SUMS.has(sum) ? 'eine Quadratzahl.' : 'keine Quadratzahl.');
}

function tier2DifferenceSquareText(code, positions) {
  const difference = Math.abs(code[positions[0]] - code[positions[1]]);
  return 'Der Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (SQUARE_SUMS.has(difference) ? 'eine Quadratzahl.' : 'keine Quadratzahl.');
}

function tier2ParityText(code, positions) {
  const sameParity = code[positions[0]] % 2 === code[positions[1]] % 2;
  return 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' haben ' + (sameParity ? 'dieselbe' : 'unterschiedliche') + ' Parität.';
}

function tier2DifferenceParityText(code, positions) {
  const difference = Math.abs(code[positions[0]] - code[positions[1]]);
  return 'Der Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (difference % 2 === 0 ? 'gerade.' : 'ungerade.');
}

function tier2ProductSquareText(code, positions) {
  const product = code[positions[0]] * code[positions[1]];
  const isSquare = Number.isInteger(Math.sqrt(product));
  return 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (isSquare ? 'eine Quadratzahl.' : 'keine Quadratzahl.');
}

function tier2NeighborText(positions) {
  return 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' liegen auf dem Zahlenstrahl direkt nebeneinander.';
}

function tier2DoubleHalfText(code, positions) {
  const first = code[positions[0]];
  const second = code[positions[1]];
  if (first === second * 2) return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist doppelt so groß wie die Zahl an Position ' + (positions[1] + 1) + '.';
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist halb so groß wie die Zahl an Position ' + (positions[1] + 1) + '.';
}

function tier2SumFibonacciText(code, positions) {
  const sum = code[positions[0]] + code[positions[1]];
  return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (FIBONACCI_SUMS.has(sum) ? 'eine Fibonacci-Zahl.' : 'keine Fibonacci-Zahl.');
}

function tier2DivisibilityText(positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' lässt sich ohne Rest durch die Zahl an Position ' + (positions[1] + 1) + ' teilen.';
}

function tier2ComposedSquareText(code, positions) {
  const number = code[positions[0]] * 10 + code[positions[1]];
  const isSquare = Number.isInteger(Math.sqrt(number));
  return 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' bilden in dieser Reihenfolge ' + (isSquare ? 'eine zweistellige Quadratzahl.' : 'keine zweistellige Quadratzahl.');
}

function tier2DifferencePrimeText(code, positions) {
  const difference = Math.abs(code[positions[0]] - code[positions[1]]);
  return 'Der Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (PRIME_DIGITS.has(difference) ? 'eine Primzahl.' : 'keine Primzahl.');
}

function tier2EqualityText(code, positions) {
  return 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' sind ' + (code[positions[0]] === code[positions[1]] ? 'gleich.' : 'verschieden.');
}

function tier2MirrorDistanceText(positions) {
  return 'Die Zahlen an den spiegelbildlichen Positionen ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' liegen gleich weit von der 5 entfernt.';
}

function tier2SumPrimeText(code, positions) {
  const sum = code[positions[0]] + code[positions[1]];
  return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (PRIME_SUMS.has(sum) ? 'eine Primzahl.' : 'keine Primzahl.');
}

function tier3SumComparisonText(code, positions) {
  const sum = code[positions[0]] + code[positions[1]];
  const comparison = relation(sum, code[positions[2]]);
  if (comparison === 'gleich') return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist gleich der Zahl an Position ' + (positions[2] + 1) + '.';
  return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + comparison + ' als die Zahl an Position ' + (positions[2] + 1) + '.';
}

function tier3OrderText(code, positions) {
  const ascending = code[positions[0]] < code[positions[1]] && code[positions[1]] < code[positions[2]];
  return 'Die Zahlen an ' + positionList(positions) + ' werden in dieser Reihenfolge ' + (ascending ? 'größer.' : 'kleiner.');
}

function tier3ProductComparisonText(code, positions) {
  const product = code[positions[0]] * code[positions[1]];
  const comparison = relation(product, code[positions[2]]);
  if (comparison === 'gleich') return 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist gleich der Zahl an Position ' + (positions[2] + 1) + '.';
  return 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + comparison + ' als die Zahl an Position ' + (positions[2] + 1) + '.';
}

function tier3ExactlyTwoEqualText(positions) {
  return 'Von den Zahlen an ' + positionList(positions) + ' sind genau zwei gleich.';
}

function tier3ArithmeticSequenceText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' bilden in dieser Reihenfolge eine gleichmäßige Zahlenfolge.';
}

function tier3StrictBetweenText(positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist größer als die Zahl an Position ' + (positions[1] + 1) + ' und kleiner als die Zahl an Position ' + (positions[2] + 1) + '.';
}

function tier3DifferenceComparisonText(code, positions) {
  const difference = Math.abs(code[positions[0]] - code[positions[1]]);
  const comparison = relation(difference, code[positions[2]]);
  if (comparison === 'gleich') return 'Der Abstand zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist gleich der Zahl an Position ' + (positions[2] + 1) + '.';
  return 'Der Abstand zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + comparison + ' als die Zahl an Position ' + (positions[2] + 1) + '.';
}

function tier3ComposedPalindromeText(code, positions) {
  const isPalindrome = code[positions[0]] === code[positions[2]];
  return 'Die Zahlen an ' + positionList(positions) + ' bilden in dieser Reihenfolge ' + (isPalindrome ? 'eine dreistellige Palindromzahl.' : 'keine dreistellige Palindromzahl.');
}

function tier3ExactSumText(positions) {
  return 'Die Zahl an Position ' + (positions[2] + 1) + ' entspricht der Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + '.';
}

function tier3ExactDifferenceText(positions) {
  return 'Die Zahl an Position ' + (positions[2] + 1) + ' entspricht dem Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + '.';
}

function tier3AverageText(positions) {
  return 'Die Zahl an Position ' + (positions[2] + 1) + ' ist der Durchschnitt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + '.';
}

function tier3RangePrimeText(code, positions) {
  const values = positions.map(position => code[position]);
  const distance = Math.max(...values) - Math.min(...values);
  return 'Der Abstand zwischen der größten und der kleinsten Zahl an ' + positionList(positions) + ' ist ' + (PRIME_DIGITS.has(distance) ? 'eine Primzahl.' : 'keine Primzahl.');
}

function tier3TriangleText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' könnten die Seitenlängen eines Dreiecks bilden.';
}

function tier3SumParityText(code, positions) {
  const sum = positions.reduce((total, position) => total + code[position], 0);
  return 'Die Summe der Zahlen an ' + positionList(positions) + ' ist ' + (sum % 2 === 0 ? 'gerade.' : 'ungerade.');
}

function tier3ProductDigitText(positions) {
  return 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' endet auf die Zahl an Position ' + (positions[2] + 1) + '.';
}

function l054ExclusionPercent(validAssignments, domainSize) {
  return Number((100 * (1 - validAssignments / domainSize)).toFixed(2));
}

function l054ExactInformation(variant, result) {
  const counts = L054_EXACT_RESULT_COUNTS[variant];
  return counts && Number.isInteger(result) && result >= 0 && result < counts.length ? l054ExclusionPercent(counts[result], 1000) : 0;
}

function l054DigitSum(value) {
  return String(value).split('').reduce((sum, digit) => sum + Number(digit), 0);
}

function l054PointBeforeEvaluation(factorA, factorB, term, variant) {
  const result = variant === 'productPlus' ? term + factorA * factorB : variant === 'productMinus' ? term - factorA * factorB : NaN;
  const leftToRightResult = variant === 'productPlus' ? (term + factorA) * factorB : variant === 'productMinus' ? (term - factorA) * factorB : NaN;
  return { result, leftToRightResult, didacticallyValid: Number.isFinite(result) && result !== leftToRightResult };
}

function l054MixedComparisonEvaluation(code, positions) {
  const leftResult = code[positions[2]] + code[positions[0]] * code[positions[1]];
  const rightResult = code[positions[3]] + code[positions[4]] * code[positions[5]];
  const leftToRightLeftResult = (code[positions[2]] + code[positions[0]]) * code[positions[1]];
  const leftToRightRightResult = (code[positions[3]] + code[positions[4]]) * code[positions[5]];
  const comparison = relation(leftResult, rightResult);
  const leftToRightComparison = relation(leftToRightLeftResult, leftToRightRightResult);
  return { leftResult, rightResult, leftToRightLeftResult, leftToRightRightResult, comparison, leftToRightComparison, didacticallyValid: comparison !== 'gleich' && leftToRightComparison !== comparison };
}

function tier3PointBeforeText(positions, variant, result) {
  const operation = variant === 'productPlus' ? 'Summe' : 'Differenz';
  return 'Die ' + operation + ' aus der Ziffer an Position ' + (positions[2] + 1) + ' und dem Produkt der Ziffern an Position ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' beträgt ' + result + '.';
}

function tier3ParenthesesText(positions, variant, result) {
  const groupedOperation = variant === 'groupedPlus' ? 'Summe' : 'Differenz';
  return 'Das Produkt aus der Ziffer an Position ' + (positions[2] + 1) + ' und der ' + groupedOperation + ' der Ziffern an Position ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' beträgt ' + result + '.';
}

function tier3ProductDigitSumText(positions) {
  return 'Die Ziffer an Position ' + (positions[2] + 1) + ' entspricht der Quersumme des Produkts der Ziffern an Position ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + '.';
}

function tier3ComposedDivisibilityText(positions, divisor) {
  return 'Die Ziffern an Position ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' bilden in dieser Reihenfolge eine zweistellige Zahl, die durch ' + divisor + ' teilbar ist.';
}

function tier4MixedExpressionComparisonText(positions, comparison) {
  return 'Position ' + (positions[2] + 1) + ' + Position ' + (positions[0] + 1) + ' × Position ' + (positions[1] + 1) + ' ist ' + comparison + ' als Position ' + (positions[3] + 1) + ' + Position ' + (positions[4] + 1) + ' × Position ' + (positions[5] + 1) + '.';
}

function palindromeText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' ergeben in dieser Reihenfolge ein Palindrom.';
}

function pairSumComparisonText(code, positions) {
  const leftSum = code[positions[0]] + code[positions[1]];
  const rightSum = code[positions[2]] + code[positions[3]];
  const left = 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1);
  const right = 'die Zahlen an Position ' + (positions[2] + 1) + ' und Position ' + (positions[3] + 1);
  if (leftSum > rightSum) return left + ' ergeben zusammen mehr als ' + right + '.';
  if (leftSum < rightSum) return left + ' ergeben zusammen weniger als ' + right + '.';
  return left + ' ergeben dieselbe Summe wie ' + right + '.';
}

function tier4AbabText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' folgen in dieser Reihenfolge dem Muster A-B-A-B.';
}

function tier4EqualDistancesText(positions) {
  return 'Der Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist genauso groß wie der Unterschied zwischen den Zahlen an Position ' + (positions[2] + 1) + ' und Position ' + (positions[3] + 1) + '.';
}

function tier4PairSumParityText(code, positions) {
  const firstSum = code[positions[0]] + code[positions[1]];
  const secondSum = code[positions[2]] + code[positions[3]];
  const sameParity = firstSum % 2 === secondSum % 2;
  const firstPair = 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1);
  const secondPair = 'die Summe der Zahlen an Position ' + (positions[2] + 1) + ' und Position ' + (positions[3] + 1);
  return sameParity ? firstPair + ' und ' + secondPair + ' sind entweder beide gerade oder beide ungerade.' : firstPair + ' und ' + secondPair + ' besitzen unterschiedliche Parität; genau eine der beiden Summen ist gerade.';
}

function tier4ProductComparisonText(code, positions) {
  const firstProduct = code[positions[0]] * code[positions[1]];
  const secondProduct = code[positions[2]] * code[positions[3]];
  const comparison = relation(firstProduct, secondProduct);
  const firstPair = 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1);
  const secondPair = 'das Produkt der Zahlen an Position ' + (positions[2] + 1) + ' und Position ' + (positions[3] + 1);
  if (comparison === 'gleich') return firstPair + ' ist gleich ' + secondPair + '.';
  return firstPair + ' ist ' + comparison + ' als ' + secondPair + '.';
}

function tier4AabbText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' folgen in dieser Reihenfolge dem Muster A-A-B-B.';
}

function tier4EqualGroupSumsText(firstGroup, secondGroup) {
  return 'Die Zahlen an ' + positionList(firstGroup) + ' ergeben zusammen genauso viel wie die Zahlen an ' + positionList(secondGroup) + '.';
}

function tier4ExactlyOnePairText(positions) {
  return 'Unter den Zahlen an ' + positionList(positions) + ' kommt genau eine Zahl doppelt vor.';
}

function tier4AbcAbcText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' folgen in dieser Reihenfolge dem Muster A-B-C-A-B-C.';
}

function tier4StrictSequenceText(positions, direction) {
  return 'Die Zahlen an ' + positionList(positions) + ' werden in dieser Reihenfolge immer ' + (direction === 'ascending' ? 'größer.' : 'kleiner.');
}

function tier4ArithmeticSequenceText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' bilden in dieser Reihenfolge eine arithmetische Folge mit gleichbleibendem Abstand.';
}

function tier4GroupComparisonText(firstGroup, secondGroup, relationWord) {
  return 'Die Zahlen an ' + positionList(firstGroup) + ' ergeben zusammen ' + relationWord + ' als die Zahlen an ' + positionList(secondGroup) + '.';
}

function tier4CodeFrequencyText(positions, frequency) {
  const frequencyWords = ['', 'einmal', 'zweimal', 'dreimal', 'viermal', 'fünfmal', 'sechsmal', 'siebenmal', 'achtmal', 'neunmal', 'zehnmal', 'elfmal', 'zwölfmal'];
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' kommt im gesamten Code genau ' + frequencyWords[frequency] + ' vor.';
}

function tier4TwoPairsText(positions) {
  return 'Unter den Zahlen an ' + positionList(positions) + ' befinden sich genau zwei unterschiedliche Zahlenpaare.';
}

function tier4AllDifferentText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' sind alle verschieden.';
}

function tier4ThreePairSumsText(positions) {
  return 'Bei den Positionen ' + positions.map(position => position + 1).join(', ') + ' ergeben die erste und letzte, die zweite und vorletzte sowie die beiden mittleren Zahlen jeweils dieselbe Summe.';
}

function tier4PairSumDifferenceText(positions) {
  return 'Die Zahl an Position ' + (positions[2] + 1) + ' entspricht dem Unterschied zwischen der Summe der Positionen ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' und der Summe der Positionen ' + (positions[3] + 1) + ' und ' + (positions[4] + 1) + '.';
}

function tier4OddEvenPositionSumText(code) {
  const oddPositionSum = code.filter((value, index) => index % 2 === 0).reduce((sum, value) => sum + value, 0);
  const evenPositionSum = code.filter((value, index) => index % 2 === 1).reduce((sum, value) => sum + value, 0);
  const comparison = relation(oddPositionSum, evenPositionSum);
  if (comparison === 'gleich') return 'Die Summe der Zahlen an ungeraden Positionen ist gleich der Summe der Zahlen an geraden Positionen.';
  return 'Die Summe der Zahlen an ungeraden Positionen ist ' + comparison + ' als die Summe der Zahlen an geraden Positionen.';
}

function tier4CheckDigitText(sourcePositions, targetPosition) {
  return 'Die Zahl an Position ' + (targetPosition + 1) + ' entspricht der letzten Ziffer der Summe der Zahlen an ' + positionList(sourcePositions) + '.';
}

function tier4ExactlyThreeEqualText(positions) {
  return 'Unter den Zahlen an ' + positionList(positions) + ' kommt genau eine Zahl dreimal vor.';
}

function analyzeCodewide(code) {
  const indexed = code.map((value, position) => ({ value, position }));
  const sortedValues = code.slice().sort((first, second) => first - second);
  const valuesFor = predicate => code.filter(predicate);
  const firstPositionFor = predicate => indexed.find(entry => predicate(entry.value))?.position ?? null;
  const lastPositionFor = predicate => indexed.slice().reverse().find(entry => predicate(entry.value))?.position ?? null;
  const primes = valuesFor(value => PRIME_DIGITS.has(value));
  const evenValues = valuesFor(value => value % 2 === 0);
  const oddValues = valuesFor(value => value % 2 !== 0);
  const minimum = sortedValues[0];
  const maximum = sortedValues[sortedValues.length - 1];
  const median = (sortedValues[code.length / 2 - 1] + sortedValues[code.length / 2]) / 2;
  const firstPrimePosition = firstPositionFor(value => PRIME_DIGITS.has(value));
  const lastPrimePosition = lastPositionFor(value => PRIME_DIGITS.has(value));
  const firstEvenPosition = firstPositionFor(value => value % 2 === 0);
  const lastEvenPosition = lastPositionFor(value => value % 2 === 0);
  const firstOddPosition = firstPositionFor(value => value % 2 !== 0);
  const lastOddPosition = lastPositionFor(value => value % 2 !== 0);
  const before = position => Number.isInteger(position) && position > 0 ? position - 1 : null;
  const after = position => Number.isInteger(position) && position < code.length - 1 ? position + 1 : null;
  return {
    minimum,
    maximum,
    median,
    medianFirstPosition: code.indexOf(median),
    smallestPrime: primes.length > 0 ? Math.min(...primes) : null,
    largestPrime: primes.length > 0 ? Math.max(...primes) : null,
    smallestEven: evenValues.length > 0 ? Math.min(...evenValues) : null,
    largestEven: evenValues.length > 0 ? Math.max(...evenValues) : null,
    smallestOdd: oddValues.length > 0 ? Math.min(...oddValues) : null,
    largestOdd: oddValues.length > 0 ? Math.max(...oddValues) : null,
    hasPrime: primes.length > 0,
    hasEven: evenValues.length > 0,
    hasOdd: oddValues.length > 0,
    firstPrimePosition,
    lastPrimePosition,
    firstEvenPosition,
    lastEvenPosition,
    firstOddPosition,
    lastOddPosition,
    firstMinimumPosition: code.indexOf(minimum),
    lastMinimumPosition: code.lastIndexOf(minimum),
    firstMaximumPosition: code.indexOf(maximum),
    lastMaximumPosition: code.lastIndexOf(maximum),
    beforeFirstPrime: before(firstPrimePosition),
    afterFirstPrime: after(firstPrimePosition),
    beforeLastPrime: before(lastPrimePosition),
    afterLastPrime: after(lastPrimePosition)
  };
}

function comparisonVariants(subject, position, comparison) {
  const positionText = 'die Zahl an Position ' + (position + 1);
  const lowerSubject = subject.charAt(0).toLowerCase() + subject.slice(1);
  if (comparison === 'gleich') return [subject + ' entspricht ' + positionText + '.', 'An Position ' + (position + 1) + ' steht genau ' + lowerSubject + '.'];
  if (comparison === 'kleiner') return [subject + ' ist kleiner als ' + positionText + '.', 'Die Zahl an Position ' + (position + 1) + ' ist größer als ' + lowerSubject + '.'];
  return [subject + ' ist größer als ' + positionText + '.', 'Die Zahl an Position ' + (position + 1) + ' ist kleiner als ' + lowerSubject + '.'];
}

function codewideTextVariants(id, positions, details) {
  const p = index => positions[index] + 1;
  if (id === 'T1-CODE-01') return comparisonVariants('Die größte im Code vorkommende Primzahl', positions[0], details.comparison);
  if (id === 'T1-CODE-02') return comparisonVariants('Die kleinste gerade Zahl im Code', positions[0], details.comparison);
  if (id === 'T1-CODE-03') {
    if (details.extremum === 'maximum') return ['Die Zahl an Position ' + p(0) + ' ist die größte Zahl im gesamten Code.', 'An Position ' + p(0) + ' steht ein globaler Höchstwert des Codes.'];
    if (details.extremum === 'minimum') return ['Die Zahl an Position ' + p(0) + ' ist die kleinste Zahl im gesamten Code.', 'An Position ' + p(0) + ' steht ein globaler Tiefstwert des Codes.'];
    return ['Die Zahl an Position ' + p(0) + ' ist weder die größte noch die kleinste Zahl im Code.', 'Position ' + p(0) + ' enthält keinen globalen Extremwert des Codes.'];
  }
  if (id === 'T1-CODE-04') return comparisonVariants('Der Median aller Zahlen im Code', positions[0], details.comparison);
  if (id === 'T2-CODE-01') {
    const subject = details.subject;
    const lowerSubject = subject.charAt(0).toLowerCase() + subject.slice(1);
    if (details.mode === 'greaterBoth') return [subject + ' ist größer als die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.', 'Die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' sind beide kleiner als ' + lowerSubject + '.'];
    if (details.mode === 'lessBoth') return [subject + ' ist kleiner als die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.', 'Die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' sind beide größer als ' + lowerSubject + '.'];
    return [subject + ' ist größer als die Zahl an Position ' + p(0) + ', aber kleiner als die Zahl an Position ' + p(1) + '.', 'Zwischen den Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' liegt ' + lowerSubject + '.'];
  }
  if (id === 'T2-CODE-03') {
    if (details.mode === 'bothGreater') return ['Die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' sind beide größer als jede im Code vorkommende Primzahl.', 'Jede Primzahl des Codes ist kleiner als die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.'];
    if (details.mode === 'bothSmaller') return ['Die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' sind beide kleiner als die größte Primzahl im Code.', 'Die größte im Code vorkommende Primzahl übertrifft die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.'];
    return ['Die größte Primzahl im Code liegt zwischen den Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.', 'Die Zahl an Position ' + p(0) + ' ist kleiner und die Zahl an Position ' + p(1) + ' größer als die größte Primzahl im Code.'];
  }
  if (id === 'T2-CODE-04') return ['Die Zahl an Position ' + p(0) + ' liegt näher an der ' + details.extremumLabel + ' Zahl des Codes als die Zahl an Position ' + p(1) + '.', 'Der Abstand von Position ' + p(0) + ' zum globalen ' + details.extremumNoun + ' ist kleiner als der entsprechende Abstand von Position ' + p(1) + '.'];
  if (id === 'T3-CODE-01' || id === 'T3-CODE-02') {
    const location = id === 'T3-CODE-01' ? 'nach der ersten Primzahl von links' : 'vor der letzten Primzahl von links';
    const parity = details.parity === 'even' ? 'gerade' : 'ungerade';
    const relationWord = details.comparison === 'gleich' ? 'gleich der' : details.comparison + ' als die';
    return ['Unmittelbar ' + location + ' steht eine ' + parity + ' Zahl, die ' + relationWord + ' Zahl an Position ' + p(2) + ' ist.', 'Die ' + parity + ' Nachbarzahl unmittelbar ' + location + ' ist ' + relationWord + ' Zahl an Position ' + p(2) + '.'];
  }
  if (id === 'T3-CODE-03') {
    const relationWord = details.comparison === 'gleich' ? 'gleich der' : details.comparison + ' als die';
    return ['Unmittelbar ' + details.directionLabel + ' dem ' + details.occurrenceLabel + ' steht eine Zahl, die ' + relationWord + ' Zahl an Position ' + p(2) + ' ist.', 'Die Nachbarzahl direkt ' + details.directionLabel + ' dem ' + details.occurrenceLabel + ' ist ' + relationWord + ' Zahl an Position ' + p(2) + '.'];
  }
  if (id === 'T3-CODE-04') {
    const relationWord = details.comparison === 'gleich' ? 'gleich groß wie' : details.comparison + ' als';
    return ['Die Zahl unmittelbar nach der ersten Primzahl ist ' + relationWord + ' die Zahl unmittelbar vor der letzten Primzahl.', 'Der rechte Nachbar der ersten Primzahl ist ' + relationWord + ' der linke Nachbar der letzten Primzahl.'];
  }
  if (id === 'T4-CODE-01') return ['Weder die erste noch die letzte Zahl ist die größte Zahl im Code. Beide sind jedoch größer als jede im Code vorkommende Primzahl.', 'Die Randzahlen sind keine globalen Höchstwerte, übertreffen aber sämtliche Primzahlen des Codes.'];
  if (id === 'T4-CODE-02') return ['Die Zahl unmittelbar nach der ersten Primzahl ist größer als die kleinste gerade Zahl und kleiner als die größte ungerade Zahl im Code.', 'Der rechte Nachbar der ersten Primzahl liegt strikt zwischen der kleinsten geraden und der größten ungeraden Zahl des Codes.'];
  if (id === 'T4-CODE-03') return ['Die Zahl unmittelbar vor der ersten Primzahl und die Zahl unmittelbar nach der letzten Primzahl ergeben zusammen die Zahl an Position ' + p(2) + '.', 'Die Summe der beiden äußeren Primzahlnachbarn entspricht der Zahl an Position ' + p(2) + '.'];
  if (id === 'T4-CODE-04') {
    const direction = details.direction === 'ascending' ? 'streng aufsteigender' : 'streng absteigender';
    const verb = details.direction === 'ascending' ? 'werden nacheinander größer' : 'werden nacheinander kleiner';
    return ['Die erste gerade Zahl, die letzte ungerade Zahl und der Median des Codes stehen in ' + direction + ' Reihenfolge.', 'Erste gerade Zahl, letzte ungerade Zahl und Median ' + verb + '.'];
  }
  if (id === 'T4-CODE-05') return ['Die Zahl unmittelbar nach der ersten Primzahl entspricht dem Unterschied zwischen der größten und der kleinsten Zahl des Codes.', 'Der rechte Nachbar der ersten Primzahl ist genauso groß wie der Abstand der globalen Extremwerte.'];
  if (id === 'T4-CODE-06') return ['Weder Position 1 noch Position ' + details.codeLength + ' enthält das Maximum oder Minimum des Codes. Beide Zahlen liegen strikt zwischen diesen Extremwerten.', 'Beide Randzahlen befinden sich wertmäßig zwischen dem globalen Minimum und Maximum, ohne selbst ein Extremwert zu sein.'];
  if (id === 'T4-CODE-07') return ['Im Code gilt: Die kleinste gerade Ziffer ist kleiner als die größte Primzahl, und diese ist kleiner als die Ziffer an Position ' + p(0) + '.', 'Die kleinste gerade Ziffer im Code ist kleiner als die größte Primzahl; diese wiederum ist kleiner als die Ziffer an Position ' + p(0) + '.'];
  return [];
}

function makeCandidate(tier, id, positions, text, signature, options) {
  const candidateOptions = options || {};
  return {
    tier,
    id,
    internalPositions: positions.slice(),
    visiblePositions: positions.map(position => position + 1),
    positionOrder: positions.slice(),
    text,
    canonicalText: text,
    languageTemplateId: 'kanonisch',
    languageVariantCount: 1,
    sentenceOpening: '',
    signature: signature || id + '|' + positions.join('-') + '|' + text,
    truth: true,
    informationStrength: candidateOptions.informationStrength || 1,
    optional: candidateOptions.optional === true,
    details: candidateOptions.details || {},
    codewideDerivations: candidateOptions.codewideDerivations || [],
    positionRoles: candidateOptions.positionRoles || positions.map((position, index) => 'Position ' + (index + 1)),
    mathematicalRule: candidateOptions.mathematicalRule || id + ': ' + text,
    requiresUnlock: candidateOptions.requiresUnlock === true,
    specialRuleType: candidateOptions.specialRuleType || 'normal',
    independentValidation: candidateOptions.independentValidation !== false,
    selectionPriority: Number.isFinite(candidateOptions.selectionPriority) ? candidateOptions.selectionPriority : 0
  };
}

function stableTextHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function ordinalSequence(sequence) {
  const positions = sequence.match(/1[0-2]|[1-9]/g);
  if (!positions || positions.length === 0) return sequence;
  return joinGerman(positions.map(position => ordinal(Number(position), 'dative')));
}

function numericPlaceVariant(text) {
  return text.replace(/\bPositionen\b/g, 'Stellen').replace(/\bPosition\b/g, 'Stelle');
}

function grammaticalDisplayBase(text) {
  return text.replace(/ entspricht die Zahl an /g, ' entspricht der Zahl an ');
}

function ordinalPositionVariant(text) {
  const numericSequence = 'Position (?:1[0-2]|[1-9])(?:, Position (?:1[0-2]|[1-9]))*(?: und Position (?:1[0-2]|[1-9]))?';
  const plainSequence = '(?:1[0-2]|[1-9])(?:, (?:1[0-2]|[1-9]))*(?: und (?:1[0-2]|[1-9]))?';
  let result = text;
  result = result.replace(new RegExp('\\b(Die|die) Zahlen an (' + numericSequence + ')', 'g'), (match, article, sequence) => article + ' Ziffern an der ' + ordinalSequence(sequence) + ' Stelle');
  result = result.replace(new RegExp('\\b(Die|die) Ziffern an den Positionen (' + plainSequence + ')', 'g'), (match, article, sequence) => article + ' Ziffern an der ' + ordinalSequence(sequence) + ' Stelle');
  result = result.replace(new RegExp('\\bZahlen an (' + numericSequence + ')', 'g'), (match, sequence) => 'Ziffern an der ' + ordinalSequence(sequence) + ' Stelle');
  result = result.replace(/\bDie Zahl an Position (1[0-2]|[1-9])/g, (match, position) => 'Die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\bdie Zahl an Position (1[0-2]|[1-9])/g, (match, position) => 'die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\bder Zahl an Position (1[0-2]|[1-9])/g, (match, position) => 'der ' + ordinal(Number(position), 'dative') + ' Ziffer');
  result = result.replace(/\bDie Ziffer an Position (1[0-2]|[1-9])/g, (match, position) => 'Die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\bdie Ziffer an Position (1[0-2]|[1-9])/g, (match, position) => 'die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\bals die an Position (1[0-2]|[1-9])/g, (match, position) => 'als die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\ban Position (1[0-2]|[1-9])/g, (match, position) => 'an der ' + ordinal(Number(position), 'dative') + ' Stelle');
  return result;
}

function sentenceOpening(text) {
  const normalizedOrdinals = ORDINAL_NOMINATIVE.concat(ORDINAL_DATIVE)
    .filter(Boolean)
    .reduce((value, ordinalWord) => value.replace(new RegExp('\\b' + ordinalWord + '\\b', 'gi'), '<ordinal>'), text.toLowerCase());
  return normalizedOrdinals.replace(/[.,:;!?]/g, '').split(/\s+/).slice(0, 4).join(' ');
}

function tier5PatternVariant(candidate) {
  if (candidate.id !== 'T5-03') return '';
  const labels = candidate.details.derivationLabels;
  if (!Array.isArray(labels) || labels.length !== 3) return '';
  const subject = labels.join('; ');
  const intro = 'Die drei codeweit abgeleiteten Werte – ' + subject + ' – ';
  if (candidate.details.pattern === 'arithmetic') return intro + 'bilden in dieser Reihenfolge eine arithmetische Folge mit gleichem, von null verschiedenem Abstand.';
  if (candidate.details.pattern === 'ascending') return intro + 'werden in der genannten Reihenfolge jeweils strikt größer.';
  if (candidate.details.pattern === 'descending') return intro + 'werden in der genannten Reihenfolge jeweils strikt kleiner.';
  if (candidate.details.pattern === 'firstThirdEqual') return intro + 'haben denselben ersten und dritten Wert, während der mittlere Wert abweicht.';
  return '';
}

function languageVariantsForCandidate(candidate, code) {
  if (candidate.id === 'T5-04' || candidate.intentionallyFalse === true) {
    return [{ id: 'wortgetreu-geschuetzt', text: candidate.text, opening: sentenceOpening(candidate.text), stableRank: 0 }];
  }
  if (candidate.id === 'T1-DIGIT-06') {
    const exactText = candidate.canonicalText || candidate.text;
    return [{ id: 'fakultaet-wortgetreu', text: exactText, opening: sentenceOpening(exactText), stableRank: 0 }];
  }
  if (candidate.id === 'T3-17' || candidate.id === 'T3-18' || candidate.id === 'T3-19' || candidate.id === 'T4-23') {
    const exactText = candidate.canonicalText || candidate.text;
    return [{ id: 'l054-mathematisch-wortgetreu', text: exactText, opening: sentenceOpening(exactText), stableRank: 0 }];
  }
  if (candidate.id === 'T5-01') {
    const rightPositions = candidate.details.rightVisiblePositions;
    const comparison = candidate.details.comparison;
    const intro = 'Für diesen Hinweis werden die Positionen von rechts gezählt. ';
    const tier5Variants = comparison === 'gleich' ? [
      { id: 'rechts-numerisch', text: intro + 'Die Zahlen an Position ' + rightPositions[0] + ' und Position ' + rightPositions[1] + ' sind gleich.' },
      { id: 'rechts-ordinal', text: intro + 'Die ' + ordinal(rightPositions[0]) + ' und ' + ordinal(rightPositions[1]) + ' Ziffer von rechts sind gleich.' },
      { id: 'rechts-stellen', text: intro + 'An den Stellen ' + rightPositions[0] + ' und ' + rightPositions[1] + ' steht von rechts gezählt derselbe Wert.' }
    ] : [
      { id: 'rechts-numerisch', text: candidate.canonicalText },
      { id: 'rechts-ordinal', text: intro + 'Die ' + ordinal(rightPositions[0]) + ' Ziffer von rechts ist ' + comparison + ' als die ' + ordinal(rightPositions[1]) + ' Ziffer von rechts.' },
      { id: 'rechts-stellen', text: intro + 'Von rechts betrachtet ist die Ziffer an Stelle ' + rightPositions[0] + ' ' + comparison + ' als die Ziffer an Stelle ' + rightPositions[1] + '.' }
    ];
    return tier5Variants.filter((variant, index) => tier5Variants.findIndex(other => other.text === variant.text) === index).map(variant => Object.assign({}, variant, {
      opening: sentenceOpening(variant.text),
      stableRank: stableTextHash(code.join('') + '|' + candidate.signature + '|language-v1|' + variant.id)
    }));
  }

  const baseTexts = [grammaticalDisplayBase(candidate.canonicalText || candidate.text)];
  if (candidate.id.includes('-CODE-')) {
    for (const text of codewideTextVariants(candidate.id, candidate.internalPositions, candidate.details)) baseTexts.push(grammaticalDisplayBase(text));
  }
  const tier5Pattern = tier5PatternVariant(candidate);
  if (tier5Pattern) baseTexts.push(tier5Pattern);

  const variants = [];
  const addVariant = (id, text) => {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (!normalized || variants.some(variant => variant.text === normalized)) return;
    variants.push({ id, text: normalized });
  };

  for (let index = 0; index < baseTexts.length; index++) {
    const baseText = baseTexts[index];
    addVariant('numerisch-' + index, baseText);
    addVariant('stellen-' + index, numericPlaceVariant(baseText));
    addVariant('ordinal-' + index, ordinalPositionVariant(baseText));
  }
  return variants.map(variant => Object.assign({}, variant, {
    opening: sentenceOpening(variant.text),
    stableRank: stableTextHash(code.join('') + '|' + candidate.signature + '|language-v1|' + variant.id)
  }));
}

function combinations(size, count) {
  const result = [];
  function collect(start, current) {
    if (current.length === count) {
      result.push(current.slice());
      return;
    }
    for (let index = start; index < size; index++) {
      current.push(index);
      collect(index + 1, current);
      current.pop();
    }
  }
  collect(0, []);
  return result;
}

function permutations(values) {
  const result = [];
  function collect(remaining, current) {
    if (remaining.length === 0) {
      result.push(current.slice());
      return;
    }
    for (let index = 0; index < remaining.length; index++) {
      const next = remaining[index];
      collect(remaining.slice(0, index).concat(remaining.slice(index + 1)), current.concat(next));
    }
  }
  collect(values, []);
  return result;
}

function freePositionOrder(positions) {
  if (positions.length < 4) return positions.slice();
  const ordered = [];
  for (let index = 0; index < positions.length; index += 2) ordered.push(positions[index]);
  const lastOddIndex = positions.length % 2 === 0 ? positions.length - 1 : positions.length - 2;
  for (let index = lastOddIndex; index >= 1; index -= 2) ordered.push(positions[index]);
  return ordered;
}

const MIN_HINT_EXCLUSION_PERCENT = 40;
const VISIBLE_SEMANTIC_AUDITED_HINT_IDS = new Set(["T1-01","T1-02","T1-03","T1-05","T1-06","T1-08","T1-09","T1-12","T1-14","T1-DIGIT-00","T1-DIGIT-01","T1-DIGIT-02","T1-DIGIT-03","T1-DIGIT-04","T1-DIGIT-05","T1-DIGIT-06","T1-DIGIT-07","T1-DIGIT-08","T1-DIGIT-09","T2-01","T2-03","T2-04","T2-06","T2-08","T2-09","T2-11","T2-13","T2-15","T2-CODE-03","T2-CODE-04","T3-02","T3-04","T3-06","T3-07","T3-08","T3-10","T3-11","T3-12","T3-13","T3-14","T3-15","T3-16","T3-CODE-01","T3-CODE-02","T3-CODE-03","T3-CODE-04","T4-01","T4-02","T4-03","T4-04","T4-05","T4-06","T4-07","T4-08","T4-09","T4-10","T4-11","T4-12","T4-13","T4-15","T4-16","T4-17","T4-18","T4-19","T4-21","T4-22","T4-CODE-01","T4-CODE-02","T4-CODE-03","T4-CODE-05","T4-CODE-06","T4-CODE-07","T1-CODE-04","T4-CODE-04","T5-01","T5-02","T5-03"]);

function estimateInformationExclusionPercent(candidate) {
  const details = candidate && candidate.details ? candidate.details : {};
  if (!candidate || typeof candidate.id !== 'string') return 0;
  if (candidate.id === 'T5-04') return 100;
  if (candidate.id === 'T3-17' || candidate.id === 'T3-18' || candidate.id === 'T3-19' || candidate.id === 'T3-20' || candidate.id === 'T4-23') return Number.isFinite(details.informationExclusionPercent) ? details.informationExclusionPercent : 0;
  if (candidate.id === 'T1-07') return details.cube === true ? 70 : details.cube === false ? 30 : 0;
  if (candidate.id === 'T1-13') return details.factorial === true ? 70 : details.factorial === false ? 30 : 0;
  if (candidate.id === 'T1-CODE-01') return details.comparison === 'größer' ? 39.52446 : details.comparison === 'kleiner' ? 75.681338 : details.comparison === 'gleich' ? 85.156999 : 0;
  if (candidate.id === 'T1-CODE-02') return details.comparison === 'größer' ? 95.135595 : details.comparison === 'kleiner' ? 19.816701 : details.comparison === 'gleich' ? 85.096532 : 0;
  if (candidate.id === 'T1-CODE-03') return details.extremum === 'maximum' || details.extremum === 'minimum' ? 85.085658 : details.extremum === 'neither' ? 29.828684 : 0;
  if (candidate.id === 'T2-02') return details.square === true ? 79 : details.square === false ? 21 : 0;
  if (candidate.id === 'T2-07') return details.square === true ? 64 : details.square === false ? 36 : 0;
  if (candidate.id === 'T2-10') return details.fibonacci === true ? 69 : details.fibonacci === false ? 31 : 0;
  if (candidate.id === 'T2-12') return details.square === true ? 94 : details.square === false ? 6 : 0;
  if (candidate.id === 'T2-14') return details.equal === true ? 90 : details.equal === false ? 10 : 0;
  if (candidate.id === 'T2-16') return details.prime === true ? 63 : details.prime === false ? 37 : 0;
  if (candidate.id === 'T2-CODE-01') {
    if (details.sourceKey === 'smallestEven') return details.mode === 'greaterBoth' ? 98.968864 : details.mode === 'lessBoth' ? 35.346914 : details.mode === 'between' ? 96.983958 : 0;
    if (details.sourceKey === 'largestPrime') return details.mode === 'greaterBoth' ? 62.687654 : details.mode === 'lessBoth' ? 93.284617 : details.mode === 'between' ? 86.257269 : 0;
    if (details.sourceKey === 'largestOdd') return details.mode === 'greaterBoth' ? 35.346914 : details.mode === 'lessBoth' ? 98.968864 : details.mode === 'between' ? 96.983958 : 0;
    return 0;
  }
  if (candidate.id === 'T3-01') return details.comparison === 'größer' ? 22 : details.comparison === 'kleiner' ? 83.5 : details.comparison === 'gleich' ? 94.5 : 0;
  if (candidate.id === 'T3-03') return details.comparison === 'größer' ? 29 : details.comparison === 'kleiner' ? 75.2 : details.comparison === 'gleich' ? 95.8 : 0;
  if (candidate.id === 'T3-09') return details.palindrome === true ? 91 : details.palindrome === false ? 9 : 0;
  if (candidate.id === 'T4-14') {
    if (!Array.isArray(details.firstGroup) || !Array.isArray(details.secondGroup)) return 0;
    if (details.firstGroup.length === 2 && details.secondGroup.length === 3) return details.relation === 'mehr' ? 77.626 : details.relation === 'weniger' ? 27.214 : 0;
    if (details.firstGroup.length === 3 && details.secondGroup.length === 3) return details.relation === 'mehr' || details.relation === 'weniger' ? 52.7626 : 0;
    return 0;
  }
  if (candidate.id === 'T4-20') return details.comparison === 'größer' ? 33.924516 : details.comparison === 'kleiner' ? 69.790585 : details.comparison === 'gleich' ? 96.284898 : 0;
  return VISIBLE_SEMANTIC_AUDITED_HINT_IDS.has(candidate.id) ? MIN_HINT_EXCLUSION_PERCENT : 0;
}

function createGenerator(code, existingComparison, generatorOptions) {
  const settings = generatorOptions || {};
  const packageCount = settings.packageCount || 5;
  const GENERATOR_SEED = String(settings.seed || 'default');
  const qualityCache = new Map();
  // V4 repeats finalization while testing beginner replacements. Preserve
  // certificates only when the entire visible candidate semantics match.
  const v4FinalizationCertificates = settings.extended ? new Map() : null;
  const MAX_V4_FINALIZATION_CERTIFICATES = 20000;
  const candidateGroups = {
    1: { 'T1-01': [], 'T1-02': [], 'T1-03': [], 'T1-05': [], 'T1-06': [], 'T1-07': [], 'T1-08': [], 'T1-09': [], 'T1-12': [], 'T1-13': [], 'T1-14': [], 'T1-DIGIT-00': [], 'T1-DIGIT-01': [], 'T1-DIGIT-02': [], 'T1-DIGIT-03': [], 'T1-DIGIT-04': [], 'T1-DIGIT-05': [], 'T1-DIGIT-06': [], 'T1-DIGIT-07': [], 'T1-DIGIT-08': [], 'T1-DIGIT-09': [], 'T1-CODE-01': [], 'T1-CODE-02': [], 'T1-CODE-03': [] },
    2: { 'T2-01': [], 'T2-02': [], 'T2-03': [], 'T2-04': [], 'T2-06': [], 'T2-07': [], 'T2-08': [], 'T2-09': [], 'T2-10': [], 'T2-11': [], 'T2-12': [], 'T2-13': [], 'T2-14': [], 'T2-15': [], 'T2-16': [], 'T2-CODE-01': [], 'T2-CODE-03': [], 'T2-CODE-04': [] },
    3: { 'T3-01': [], 'T3-02': [], 'T3-03': [], 'T3-04': [], 'T3-06': [], 'T3-07': [], 'T3-08': [], 'T3-09': [], 'T3-10': [], 'T3-11': [], 'T3-12': [], 'T3-13': [], 'T3-14': [], 'T3-15': [], 'T3-16': [], 'T3-17': [], 'T3-18': [], 'T3-19': [], 'T3-20': [], 'T3-CODE-01': [], 'T3-CODE-02': [], 'T3-CODE-03': [], 'T3-CODE-04': [] },
    4: { 'T4-01': [], 'T4-02': [], 'T4-03': [], 'T4-04': [], 'T4-05': [], 'T4-06': [], 'T4-07': [], 'T4-08': [], 'T4-09': [], 'T4-10': [], 'T4-11': [], 'T4-12': [], 'T4-13': [], 'T4-14': [], 'T4-15': [], 'T4-16': [], 'T4-17': [], 'T4-18': [], 'T4-19': [], 'T4-20': [], 'T4-21': [], 'T4-22': [], 'T4-23': [], 'T4-CODE-01': [], 'T4-CODE-02': [], 'T4-CODE-03': [], 'T4-CODE-05': [], 'T4-CODE-06': [], 'T4-CODE-07': [] },
    5: { 'T1-CODE-04': [], 'T4-CODE-04': [], 'T5-01': [], 'T5-02': [], 'T5-03': [], 'T5-04': [] }
  };
  const codewide = analyzeCodewide(code);
  const TIER_5_UNLOCKED = settings.tier5Unlocked === true;
  const MAX_OPTIONAL_CANDIDATES = 160;
  const groupComparisonCounts = { '2:3': 0, '3:3': 0 };

  function add(candidate) {
    candidateGroups[candidate.tier][candidate.id].push(candidate);
  }

  function addCodewideCandidate(tier, id, positions, details, options) {
    const candidateOptions = options || {};
    const codewideDetails = Object.assign({}, details, {codeLength: code.length});
    const texts = codewideTextVariants(id, positions, codewideDetails);
    if (texts.length < 2) throw new Error('Codeweiter Typ ' + id + ' besitzt weniger als zwei Textvarianten.');
    let variantSeed = 2166136261;
    const variantSource = GENERATOR_SEED + '|' + id + '|' + positions.join('-') + '|' + (details.semanticKey || '') + '|' + code.join('');
    for (let index = 0; index < variantSource.length; index++) {
      variantSeed ^= variantSource.charCodeAt(index);
      variantSeed = Math.imul(variantSeed, 16777619);
    }
    const variantIndex = (variantSeed >>> 0) % texts.length;
    const candidateDetails = Object.assign({}, codewideDetails, {variantIndex});
    const signature = id + '|' + positions.join('-') + '|' + (details.semanticKey || '');
    add(makeCandidate(tier, id, positions, texts[variantIndex], signature, {
      informationStrength: candidateOptions.informationStrength || 4,
      optional: candidateOptions.optional !== false,
      positionRoles: candidateOptions.positionRoles || positions.map(() => 'Beteiligte Position'),
      details: candidateDetails,
      codewideDerivations: candidateOptions.codewideDerivations || [],
      mathematicalRule: candidateOptions.mathematicalRule || id,
      requiresUnlock: tier === 5,
      specialRuleType: tier === 5 ? 'median-expertenhinweis' : 'normal',
      selectionPriority: candidateOptions.selectionPriority
    }));
  }

  function addCodewideCandidates() {
    for (let position = 0; position < code.length; position++) {
      if (codewide.hasPrime) {
        const comparison = relation(codewide.largestPrime, code[position]);
        addCodewideCandidate(1, 'T1-CODE-01', [position], { comparison, derivedValue: codewide.largestPrime, semanticKey: 'largestPrime|' + position + '|' + comparison }, { optional: true, positionRoles: ['Vergleichsposition'], codewideDerivations: ['größte vorkommende Primzahl'], mathematicalRule: 'Größte Primzahl des gesamten Codes wird mit einer Positionsziffer verglichen' });
      }
      if (codewide.hasEven) {
        const comparison = relation(codewide.smallestEven, code[position]);
        addCodewideCandidate(1, 'T1-CODE-02', [position], { comparison, derivedValue: codewide.smallestEven, semanticKey: 'smallestEven|' + position + '|' + comparison }, { optional: true, positionRoles: ['Vergleichsposition'], codewideDerivations: ['kleinste gerade Zahl'], mathematicalRule: 'Kleinste gerade Zahl des gesamten Codes einschließlich 0 wird mit einer Positionsziffer verglichen' });
      }
      if (codewide.minimum !== codewide.maximum) {
        const extremum = code[position] === codewide.maximum ? 'maximum' : code[position] === codewide.minimum ? 'minimum' : 'neither';
        addCodewideCandidate(1, 'T1-CODE-03', [position], { extremum, minimum: codewide.minimum, maximum: codewide.maximum, semanticKey: 'globalExtremum|' + position + '|' + extremum }, { optional: false, informationStrength: extremum === 'neither' ? 2 : 4, positionRoles: ['Prüfposition'], codewideDerivations: ['globale kleinste Ziffer', 'globale größte Ziffer'], mathematicalRule: 'Positionswert ist globales Maximum, globales Minimum oder keiner der Extremwerte' });
      }
      const medianComparison = relation(codewide.median, code[position]);
      addCodewideCandidate(5, 'T1-CODE-04', [position], { comparison: medianComparison, median: codewide.median, semanticKey: 'median|' + position + '|' + medianComparison }, { optional: false, positionRoles: ['Vergleichsposition'], codewideDerivations: ['Median aller ' + code.length + ' Ziffern'], mathematicalRule: 'Median des gesamten Codes wird mit einer Positionsziffer verglichen' });
    }

    const tier2Sources = [
      { key: 'smallestEven', subject: 'Die kleinste gerade Zahl im Code', value: codewide.smallestEven, available: codewide.hasEven },
      { key: 'largestPrime', subject: 'Die größte Primzahl im Code', value: codewide.largestPrime, available: codewide.hasPrime },
      { key: 'largestOdd', subject: 'Die größte ungerade Zahl im Code', value: codewide.largestOdd, available: codewide.hasOdd }
    ];
    for (const pair of combinations(code.length, 2)) {
      for (const source of tier2Sources) {
        if (!source.available) continue;
        const firstValue = code[pair[0]];
        const secondValue = code[pair[1]];
        let orderedPair = pair.slice();
        let mode = null;
        if (source.value > firstValue && source.value > secondValue) mode = 'greaterBoth';
        else if (source.value < firstValue && source.value < secondValue) mode = 'lessBoth';
        else if (Math.min(firstValue, secondValue) < source.value && source.value < Math.max(firstValue, secondValue)) {
          orderedPair = firstValue < secondValue ? pair.slice() : pair.slice().reverse();
          mode = 'between';
        }
        if (mode) addCodewideCandidate(2, 'T2-CODE-01', orderedPair, { sourceKey: source.key, subject: source.subject, derivedValue: source.value, mode, semanticKey: source.key + '|' + orderedPair.join('-') + '|' + mode }, { positionRoles: mode === 'between' ? ['Untere Vergleichsposition', 'Obere Vergleichsposition'] : ['Vergleichsposition A', 'Vergleichsposition B'], codewideDerivations: [source.subject], mathematicalRule: 'Eine eindeutig abgeleitete globale Zahl wird gleichzeitig mit zwei Positionswerten verglichen' });
      }
      if (codewide.hasPrime) {
        const firstValue = code[pair[0]];
        const secondValue = code[pair[1]];
        let orderedPair = pair.slice();
        let mode = null;
        if (firstValue > codewide.largestPrime && secondValue > codewide.largestPrime) mode = 'bothGreater';
        else if (firstValue < codewide.largestPrime && secondValue < codewide.largestPrime) mode = 'bothSmaller';
        else if (Math.min(firstValue, secondValue) < codewide.largestPrime && codewide.largestPrime < Math.max(firstValue, secondValue)) {
          orderedPair = firstValue < secondValue ? pair.slice() : pair.slice().reverse();
          mode = 'between';
        }
        if (mode) addCodewideCandidate(2, 'T2-CODE-03', orderedPair, { mode, largestPrime: codewide.largestPrime, semanticKey: 'largestPrimePair|' + orderedPair.join('-') + '|' + mode }, { positionRoles: mode === 'between' ? ['Untere Position', 'Obere Position'] : ['Vergleichsposition A', 'Vergleichsposition B'], codewideDerivations: ['größte vorkommende Primzahl'], mathematicalRule: 'Zwei Positionswerte werden gemeinsam relativ zur größten Primzahl des Codes eingeordnet' });
      }
      for (const extremum of [
        { key: 'minimum', value: codewide.minimum, label: 'kleinsten', noun: 'Minimum' },
        { key: 'maximum', value: codewide.maximum, label: 'größten', noun: 'Maximum' }
      ]) {
        const firstDistance = Math.abs(code[pair[0]] - extremum.value);
        const secondDistance = Math.abs(code[pair[1]] - extremum.value);
        if (firstDistance === 0 || secondDistance === 0 || firstDistance === secondDistance) continue;
        const orderedPair = firstDistance < secondDistance ? pair.slice() : pair.slice().reverse();
        addCodewideCandidate(2, 'T2-CODE-04', orderedPair, { extremum: extremum.key, extremumValue: extremum.value, extremumLabel: extremum.label, extremumNoun: extremum.noun, closerDistance: Math.min(firstDistance, secondDistance), fartherDistance: Math.max(firstDistance, secondDistance), semanticKey: 'extremumDistance|' + extremum.key + '|' + orderedPair.join('-') }, { positionRoles: ['Nähere Position', 'Entferntere Position'], codewideDerivations: ['globales ' + extremum.noun], mathematicalRule: 'Absolute Abstände zweier Positionswerte zu einem globalen Extremwert werden strikt verglichen' });
      }
    }
    function addPrimeNeighborComparisons(id, anchorPosition, neighborPosition, directionLabel) {
      if (!Number.isInteger(anchorPosition) || !Number.isInteger(neighborPosition)) return;
      const parity = code[neighborPosition] % 2 === 0 ? 'even' : 'odd';
      for (let targetPosition = 0; targetPosition < code.length; targetPosition++) {
        if (targetPosition === anchorPosition || targetPosition === neighborPosition) continue;
        const comparison = relation(code[neighborPosition], code[targetPosition]);
        addCodewideCandidate(3, id, [anchorPosition, neighborPosition, targetPosition], { parity, comparison, anchorPosition, neighborPosition, targetPosition, semanticKey: id + '|' + neighborPosition + '|' + targetPosition + '|' + comparison }, { positionRoles: ['Abgeleitete Primzahlposition', 'Abgeleitete Nachbarposition', 'Vergleichsposition'], codewideDerivations: [directionLabel], mathematicalRule: 'Parität und Wert des abgeleiteten Primzahlnachbarn werden mit einer weiteren Position verglichen' });
      }
    }
    addPrimeNeighborComparisons('T3-CODE-01', codewide.firstPrimePosition, codewide.afterFirstPrime, 'erste Primzahl und rechter Nachbar');
    addPrimeNeighborComparisons('T3-CODE-02', codewide.lastPrimePosition, codewide.beforeLastPrime, 'letzte Primzahl und linker Nachbar');

    const extremeOccurrences = codewide.minimum === codewide.maximum ? [] : [
      { position: codewide.firstMinimumPosition, label: 'ersten Vorkommen der kleinsten Zahl', derivation: 'erstes Vorkommen des globalen Minimums' },
      { position: codewide.lastMinimumPosition, label: 'letzten Vorkommen der kleinsten Zahl', derivation: 'letztes Vorkommen des globalen Minimums' },
      { position: codewide.firstMaximumPosition, label: 'ersten Vorkommen der größten Zahl', derivation: 'erstes Vorkommen des globalen Maximums' },
      { position: codewide.lastMaximumPosition, label: 'letzten Vorkommen der größten Zahl', derivation: 'letztes Vorkommen des globalen Maximums' }
    ];
    for (const occurrence of extremeOccurrences) {
      for (const neighborRule of [
        { position: occurrence.position > 0 ? occurrence.position - 1 : null, label: 'vor' },
        { position: occurrence.position < code.length - 1 ? occurrence.position + 1 : null, label: 'nach' }
      ]) {
        if (!Number.isInteger(neighborRule.position)) continue;
        for (let targetPosition = 0; targetPosition < code.length; targetPosition++) {
          if (targetPosition === occurrence.position || targetPosition === neighborRule.position) continue;
          const comparison = relation(code[neighborRule.position], code[targetPosition]);
          addCodewideCandidate(3, 'T3-CODE-03', [occurrence.position, neighborRule.position, targetPosition], { occurrenceLabel: occurrence.label, directionLabel: neighborRule.label, occurrencePosition: occurrence.position, neighborPosition: neighborRule.position, targetPosition, comparison, semanticKey: 'extremeNeighbor|' + occurrence.derivation + '|' + neighborRule.position + '|' + targetPosition + '|' + comparison }, { positionRoles: ['Abgeleitete Extremposition', 'Abgeleitete Nachbarposition', 'Vergleichsposition'], codewideDerivations: [occurrence.derivation], mathematicalRule: 'Nachbar eines eindeutig bestimmten globalen Extremvorkommens wird mit einer weiteren Position verglichen' });
        }
      }
    }
    if (Number.isInteger(codewide.afterFirstPrime) && Number.isInteger(codewide.beforeLastPrime) && codewide.afterFirstPrime !== codewide.beforeLastPrime) {
      const comparison = relation(code[codewide.afterFirstPrime], code[codewide.beforeLastPrime]);
      addCodewideCandidate(3, 'T3-CODE-04', [codewide.afterFirstPrime, codewide.beforeLastPrime], { comparison, afterFirstPrime: codewide.afterFirstPrime, beforeLastPrime: codewide.beforeLastPrime, firstPrimePosition: codewide.firstPrimePosition, lastPrimePosition: codewide.lastPrimePosition, semanticKey: 'primeNeighbors|' + codewide.afterFirstPrime + '|' + codewide.beforeLastPrime + '|' + comparison }, { positionRoles: ['Rechter Nachbar der ersten Primzahl', 'Linker Nachbar der letzten Primzahl'], codewideDerivations: ['erster Primzahlnachbar rechts', 'letzter Primzahlnachbar links'], mathematicalRule: 'Die beiden eindeutig abgeleiteten Primzahlnachbarn werden miteinander verglichen' });
    }

    if (codewide.hasPrime && code[0] !== codewide.maximum && code[code.length - 1] !== codewide.maximum && code[0] > codewide.largestPrime && code[code.length - 1] > codewide.largestPrime) {
      addCodewideCandidate(4, 'T4-CODE-01', [0, code.length - 1], { maximum: codewide.maximum, largestPrime: codewide.largestPrime, semanticKey: 'edgeAbovePrimes' }, { selectionPriority: -18, positionRoles: ['Erste Position', 'Letzte Position'], codewideDerivations: ['globale größte Ziffer', 'größte vorkommende Primzahl'], mathematicalRule: 'Beide Randwerte sind keine globalen Maxima und liegen über sämtlichen Primzahlen des Codes' });
    }
    if (codewide.hasPrime && codewide.hasEven && codewide.hasOdd && Number.isInteger(codewide.afterFirstPrime)) {
      const neighborValue = code[codewide.afterFirstPrime];
      if (codewide.smallestEven < neighborValue && neighborValue < codewide.largestOdd) {
        addCodewideCandidate(4, 'T4-CODE-02', [codewide.firstPrimePosition, codewide.afterFirstPrime], { smallestEven: codewide.smallestEven, largestOdd: codewide.largestOdd, neighborPosition: codewide.afterFirstPrime, semanticKey: 'firstPrimeNeighborBetweenGlobalProperties' }, { positionRoles: ['Erste Primzahlposition', 'Rechter Nachbar'], codewideDerivations: ['erste Primzahl von links', 'kleinste gerade Zahl', 'größte ungerade Zahl'], mathematicalRule: 'Rechter Nachbar der ersten Primzahl liegt strikt zwischen zwei global abgeleiteten Werten' });
      }
    }
    if (Number.isInteger(codewide.beforeFirstPrime) && Number.isInteger(codewide.afterLastPrime) && codewide.beforeFirstPrime !== codewide.afterLastPrime) {
      const derivedSum = code[codewide.beforeFirstPrime] + code[codewide.afterLastPrime];
      if (derivedSum <= 9) {
        for (let targetPosition = 0; targetPosition < code.length; targetPosition++) {
          if (targetPosition === codewide.beforeFirstPrime || targetPosition === codewide.afterLastPrime || code[targetPosition] !== derivedSum) continue;
          addCodewideCandidate(4, 'T4-CODE-03', [codewide.beforeFirstPrime, codewide.afterLastPrime, targetPosition], { beforeFirstPrime: codewide.beforeFirstPrime, afterLastPrime: codewide.afterLastPrime, targetPosition, derivedSum, semanticKey: 'outerPrimeNeighborSum|' + codewide.beforeFirstPrime + '|' + codewide.afterLastPrime + '|' + targetPosition }, { positionRoles: ['Linker Nachbar der ersten Primzahl', 'Rechter Nachbar der letzten Primzahl', 'Zielposition'], codewideDerivations: ['linker Nachbar der ersten Primzahl', 'rechter Nachbar der letzten Primzahl'], mathematicalRule: 'Summe zweier eindeutig abgeleiteter Primzahlnachbarn entspricht einer weiteren Positionsziffer' });
        }
      }
    }
    if (codewide.hasEven && codewide.hasOdd) {
      const orderedValues = [code[codewide.firstEvenPosition], code[codewide.lastOddPosition], codewide.median];
      const distinctValues = new Set(orderedValues).size === 3;
      const ascending = orderedValues[0] < orderedValues[1] && orderedValues[1] < orderedValues[2];
      const descending = orderedValues[0] > orderedValues[1] && orderedValues[1] > orderedValues[2];
      if (distinctValues && (ascending || descending)) {
        const direction = ascending ? 'ascending' : 'descending';
        addCodewideCandidate(5, 'T4-CODE-04', [codewide.firstEvenPosition, codewide.lastOddPosition], { direction, values: orderedValues, median: codewide.median, semanticKey: 'derivedStrictOrder|' + direction }, { positionRoles: ['Erste gerade Zahl', 'Letzte ungerade Zahl'], codewideDerivations: ['erste gerade Zahl von links', 'letzte ungerade Zahl von links', 'Median aller ' + code.length + ' Ziffern'], mathematicalRule: 'Drei global abgeleitete Werte stehen in strenger auf- oder absteigender Reihenfolge' });
      }
    }
    if (codewide.minimum !== codewide.maximum && Number.isInteger(codewide.afterFirstPrime)) {
      const globalDifference = Math.abs(codewide.maximum - codewide.minimum);
      if (code[codewide.afterFirstPrime] === globalDifference) {
        addCodewideCandidate(4, 'T4-CODE-05', [codewide.firstPrimePosition, codewide.afterFirstPrime], { globalDifference, minimum: codewide.minimum, maximum: codewide.maximum, semanticKey: 'firstPrimeNeighborGlobalDifference' }, { positionRoles: ['Erste Primzahlposition', 'Rechter Nachbar'], codewideDerivations: ['erste Primzahl von links', 'globale kleinste Ziffer', 'globale größte Ziffer'], mathematicalRule: 'Rechter Nachbar der ersten Primzahl entspricht dem absoluten Unterschied der globalen Extremwerte' });
      }
    }
    if (codewide.minimum !== codewide.maximum && codewide.minimum < code[0] && code[0] < codewide.maximum && codewide.minimum < code[code.length - 1] && code[code.length - 1] < codewide.maximum) {
      addCodewideCandidate(4, 'T4-CODE-06', [0, code.length - 1], { minimum: codewide.minimum, maximum: codewide.maximum, semanticKey: 'edgeBetweenGlobalExtrema' }, { positionRoles: ['Erste Position', 'Letzte Position'], codewideDerivations: ['globale kleinste Ziffer', 'globale größte Ziffer'], mathematicalRule: 'Beide Randwerte liegen strikt zwischen globalem Minimum und Maximum' });
    }
    if (codewide.hasEven && codewide.hasPrime && codewide.smallestEven < codewide.largestPrime) {
      for (let targetPosition = 0; targetPosition < code.length; targetPosition++) {
        if (codewide.largestPrime >= code[targetPosition]) continue;
        addCodewideCandidate(4, 'T4-CODE-07', [targetPosition], { smallestEven: codewide.smallestEven, largestPrime: codewide.largestPrime, targetPosition, semanticKey: 'smallestEvenBelowLargestPrimeBelowTarget|' + targetPosition }, { informationStrength: 6, selectionPriority: 8, positionRoles: ['Zielposition oberhalb der größten Primzahl'], codewideDerivations: ['kleinste gerade Ziffer', 'größte vorkommende Primzahl'], mathematicalRule: 'Kleinste gerade Ziffer < größte Primzahl < Wert der Zielposition' });
      }
    }
  }

  function addTier5Candidates() {
    if (!TIER_5_UNLOCKED) return;

    for (const pair of combinations(code.length, 2)) {
      const rightPositions = pair.map(position => code.length - position);
      const comparison = relation(code[pair[0]], code[pair[1]]);
      const text = 'Für diesen Hinweis werden die Positionen von rechts gezählt. Die Zahl an Position ' + rightPositions[0] + ' ist ' + comparison + ' als die Zahl an Position ' + rightPositions[1] + '.';
      add(makeCandidate(5, 'T5-01', pair, text, 'T5-01|right|' + pair.join('-') + '|' + comparison, { informationStrength: 5, optional: true, requiresUnlock: true, specialRuleType: 'positionszaehlung-von-rechts', independentValidation: true, positionRoles: ['Vergleichsposition A von rechts', 'Vergleichsposition B von rechts'], details: { rightVisiblePositions: rightPositions, normalVisiblePositions: pair.map(position => position + 1), comparison, positionCounting: 'right' }, mathematicalRule: 'Die Rechtsposition wird mit code.length - internem Index berechnet; anschließend werden die beiden tatsächlichen Werte verglichen.' }));
    }

    for (let divisorPosition = 0; divisorPosition < code.length; divisorPosition++) {
      const divisor = code[divisorPosition];
      if (divisor <= 1) continue;
      const operandPositions = Array.from({ length: code.length }, (_, position) => position).filter(position => position !== divisorPosition);
      for (const operandIndexes of combinations(operandPositions.length, 2)) {
        const firstPosition = operandPositions[operandIndexes[0]];
        const secondPosition = operandPositions[operandIndexes[1]];
        if (code[firstPosition] === code[secondPosition]) continue;
        const firstRemainder = code[firstPosition] % divisor;
        const secondRemainder = code[secondPosition] % divisor;
        if (firstRemainder <= 0 || firstRemainder !== secondRemainder) continue;
        const positions = [firstPosition, secondPosition, divisorPosition];
        const text = 'Die Zahlen an Position ' + (firstPosition + 1) + ' und Position ' + (secondPosition + 1) + ' hinterlassen bei der Teilung durch die Zahl an Position ' + (divisorPosition + 1) + ' denselben Rest.';
        add(makeCandidate(5, 'T5-02', positions, text, 'T5-02|' + firstPosition + '-' + secondPosition + '|divisor|' + divisorPosition, { informationStrength: 5, optional: true, requiresUnlock: true, specialRuleType: 'gleicher-positiver-rest', independentValidation: true, positionRoles: ['Dividend A', 'Dividend B', 'Divisor'], details: { firstRemainder, secondRemainder, commonRemainder: firstRemainder, divisorPosition, divisorValue: divisor }, mathematicalRule: 'Zwei verschiedene Werte besitzen bei Division durch einen dritten Wert größer als 1 denselben positiven Rest.' }));
      }
    }

    const derivedEntries = [];
    const addDerivedEntry = (key, label, position) => {
      if (!Number.isInteger(position) || position < 0 || position >= code.length) return;
      derivedEntries.push({ key, label, position });
    };
    addDerivedEntry('afterFirstPrime', 'die Zahl unmittelbar nach der ersten Primzahl', codewide.afterFirstPrime);
    addDerivedEntry('beforeLastPrime', 'die Zahl unmittelbar vor der letzten Primzahl', codewide.beforeLastPrime);
    addDerivedEntry('firstEven', 'die erste gerade Zahl von links', codewide.firstEvenPosition);
    addDerivedEntry('lastOdd', 'die letzte ungerade Zahl von links', codewide.lastOddPosition);
    addDerivedEntry('afterFirstMinimum', 'die Zahl unmittelbar nach dem ersten Vorkommen des Minimums', codewide.firstMinimumPosition < code.length - 1 ? codewide.firstMinimumPosition + 1 : null);
    addDerivedEntry('beforeLastMaximum', 'die Zahl unmittelbar vor dem letzten Vorkommen des Maximums', codewide.lastMaximumPosition > 0 ? codewide.lastMaximumPosition - 1 : null);
    addDerivedEntry('medianFirstPosition', 'der Median des Codes an seinem ersten Vorkommen', codewide.medianFirstPosition);
    for (const entryIndexes of combinations(derivedEntries.length, 3)) {
      for (const order of permutations(entryIndexes.map(index => derivedEntries[index]))) {
      const positions = order.map(entry => entry.position);
      if (new Set(positions).size !== positions.length) continue;
      const values = positions.map(position => code[position]);
      const firstDifference = values[1] - values[0];
      const secondDifference = values[2] - values[1];
      let pattern = null;
      let patternText = '';
      if (firstDifference !== 0 && firstDifference === secondDifference) { pattern = 'arithmetic'; patternText = 'bilden in dieser Reihenfolge eine arithmetische Folge mit gleichem, von null verschiedenem Abstand'; }
      else if (values[0] < values[1] && values[1] < values[2]) { pattern = 'ascending'; patternText = 'bilden in dieser Reihenfolge eine streng aufsteigende Folge'; }
      else if (values[0] > values[1] && values[1] > values[2]) { pattern = 'descending'; patternText = 'bilden in dieser Reihenfolge eine streng absteigende Folge'; }
      else if (values[0] === values[2] && values[0] !== values[1]) { pattern = 'firstThirdEqual'; patternText = 'besitzen in dieser Reihenfolge denselben ersten und dritten Wert, während der mittlere Wert davon abweicht'; }
      if (!pattern) continue;
      const text = order[0].label.charAt(0).toUpperCase() + order[0].label.slice(1) + ', ' + order[1].label + ' und ' + order[2].label + ' ' + patternText + '.';
      const derivationKeys = order.map(entry => entry.key);
        add(makeCandidate(5, 'T5-03', positions, text, 'T5-03|' + derivationKeys.join('-') + '|' + pattern, { informationStrength: 6, optional: true, requiresUnlock: true, specialRuleType: 'codeweit-abgeleitetes-muster', independentValidation: true, positionRoles: order.map(entry => entry.label), details: { derivationKeys, derivationLabels: order.map(entry => entry.label), pattern, derivedValues: values }, codewideDerivations: order.map(entry => entry.label), mathematicalRule: 'Drei eindeutig aus dem gesamten Code abgeleitete Werte erfüllen das gespeicherte Muster in der genannten Reihenfolge.' }));
      }
    }

    const betweenGroups = new Map();
    for (const witness of candidateGroups[3]['T3-07']) {
      const key = witness.details.lowerPosition + '|' + witness.details.upperPosition;
      if (!betweenGroups.has(key)) betweenGroups.set(key, []);
      if (!betweenGroups.get(key).some(candidate => candidate.details.targetPosition === witness.details.targetPosition)) betweenGroups.get(key).push(witness);
    }
    for (const witnesses of betweenGroups.values()) {
      if (witnesses.length < 3) continue;
      const proofWitnesses = witnesses.slice().sort((first, second) => first.details.targetPosition - second.details.targetPosition).slice(0, 3);
      const lowerPosition = proofWitnesses[0].details.lowerPosition;
      const upperPosition = proofWitnesses[0].details.upperPosition;
      add(makeCandidate(5, 'T5-04', [], 'Einer der genannten Hinweise ist falsch!', 'T5-04|proof|' + lowerPosition + '-' + upperPosition + '|' + proofWitnesses.map(candidate => candidate.details.targetPosition).join('-'), { informationStrength: 7, optional: true, requiresUnlock: true, specialRuleType: 'genau-ein-absichtlich-falscher-hinweis', independentValidation: true, details: { lowerPosition, upperPosition, witnessSignatures: proofWitnesses.map(candidate => candidate.signature), witnessTargetPositions: proofWitnesses.map(candidate => candidate.details.targetPosition), requiredTrueWitnessCount: 3, fairnessProofType: 'three-strict-between-witnesses' }, mathematicalRule: 'Genau ein anderer Hinweis ist falsch; drei wahre Zwischenbeziehungen identifizieren den umgekehrten Vergleich eindeutig.' }));
      if (candidateGroups[5]['T5-04'].length >= 24) break;
    }
  }

  function addProductComparisonCandidate(selectedPositions) {
    const orderedPositions = freePositionOrder(selectedPositions);
    const firstProduct = code[orderedPositions[0]] * code[orderedPositions[1]];
    const secondProduct = code[orderedPositions[2]] * code[orderedPositions[3]];
    const comparison = relation(firstProduct, secondProduct);
    add(makeCandidate(4, 'T4-06', orderedPositions, tier4ProductComparisonText(code, orderedPositions), null, { informationStrength: 3, positionRoles: ['Produkt A', 'Produkt A', 'Produkt B', 'Produkt B'], details: { firstProduct, secondProduct, comparison }, mathematicalRule: 'Produkt A wird mit Produkt B verglichen' }));
  }

  function orderSmallGroup(positions) {
    if (positions.length === 2) return [positions[1], positions[0]];
    if (positions.length === 3) return [positions[1], positions[2], positions[0]];
    return freePositionOrder(positions);
  }

  function addExactlyOnePairCandidate(selectedPositions) {
    const orderedPositions = freePositionOrder(selectedPositions);
    const frequencies = new Map();
    for (const position of orderedPositions) frequencies.set(code[position], (frequencies.get(code[position]) || 0) + 1);
    const counts = Array.from(frequencies.values());
    const hasExactlyOnePair = counts.filter(count => count === 2).length === 1 && counts.every(count => count === 1 || count === 2);
    if (hasExactlyOnePair) {
      add(makeCandidate(4, 'T4-09', orderedPositions, tier4ExactlyOnePairText(orderedPositions), null, { informationStrength: 3, optional: true }));
    }
  }

  function addEqualGroupSumCandidates(selectedPositions) {
    const firstGroupSize = selectedPositions.length === 5 ? 2 : 3;
    for (const selectedIndexes of combinations(selectedPositions.length, firstGroupSize)) {
      const firstRaw = selectedIndexes.map(index => selectedPositions[index]);
      const firstSet = new Set(firstRaw);
      const secondRaw = selectedPositions.filter(position => !firstSet.has(position));
      if (selectedPositions.length === 6 && firstRaw.join('-') > secondRaw.join('-')) continue;
      const firstGroup = orderSmallGroup(firstRaw);
      const secondGroup = orderSmallGroup(secondRaw);
      const firstSum = firstGroup.reduce((sum, position) => sum + code[position], 0);
      const secondSum = secondGroup.reduce((sum, position) => sum + code[position], 0);
      const positions = firstGroup.concat(secondGroup);
      if (firstSum === secondSum) {
        const signature = 'T4-08|' + firstGroup.join('-') + '|' + secondGroup.join('-');
        add(makeCandidate(4, 'T4-08', positions, tier4EqualGroupSumsText(firstGroup, secondGroup), signature, { informationStrength: 4, optional: true, positionRoles: firstGroup.map(() => 'Gruppe A').concat(secondGroup.map(() => 'Gruppe B')), details: { firstGroup, secondGroup, firstSum, secondSum }, mathematicalRule: 'Summe Gruppe A = Summe Gruppe B' }));
      } else {
        const groupSizeKey = firstGroup.length + ':' + secondGroup.length;
        if (groupComparisonCounts[groupSizeKey] >= MAX_OPTIONAL_CANDIDATES / 2) continue;
        const relationWord = firstSum > secondSum ? 'mehr' : 'weniger';
        const signature = 'T4-14|' + firstGroup.join('-') + '|' + secondGroup.join('-') + '|' + relationWord;
        add(makeCandidate(4, 'T4-14', positions, tier4GroupComparisonText(firstGroup, secondGroup, relationWord), signature, { informationStrength: 3, optional: true, positionRoles: firstGroup.map(() => 'Gruppe A').concat(secondGroup.map(() => 'Gruppe B')), details: { firstGroup, secondGroup, firstSum, secondSum, relation: relationWord }, mathematicalRule: 'Ungleiche Summen zweier disjunkter Gruppen' }));
        groupComparisonCounts[groupSizeKey]++;
      }
    }
  }

  function addSequenceCandidates(selectedPositions) {
    const values = selectedPositions.map(position => code[position]);
    if (new Set(values).size !== values.length) return;
    const ascending = selectedPositions.slice().sort((first, second) => code[first] - code[second]);
    const descending = ascending.slice().reverse();
    if (candidateGroups[4]['T4-11'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-11', ascending, tier4StrictSequenceText(ascending, 'ascending'), null, { informationStrength: 4, optional: true, details: { direction: 'ascending' }, mathematicalRule: 'Wert 1 < Wert 2 < ...' }));
    }
    if (candidateGroups[4]['T4-12'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-12', descending, tier4StrictSequenceText(descending, 'descending'), null, { informationStrength: 4, optional: true, details: { direction: 'descending' }, mathematicalRule: 'Wert 1 > Wert 2 > ...' }));
    }
    const distance = code[ascending[1]] - code[ascending[0]];
    const arithmetic = distance > 0 && ascending.slice(1).every((position, index) => code[position] - code[ascending[index]] === distance);
    if (arithmetic && candidateGroups[4]['T4-13'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-13', ascending, tier4ArithmeticSequenceText(ascending), 'T4-13|ascending|' + ascending.join('-'), { informationStrength: 4, optional: true, details: { distance }, mathematicalRule: 'Alle aufeinanderfolgenden Differenzen sind gleich und ungleich 0' }));
      if (candidateGroups[4]['T4-13'].length < MAX_OPTIONAL_CANDIDATES) {
        add(makeCandidate(4, 'T4-13', descending, tier4ArithmeticSequenceText(descending), 'T4-13|descending|' + descending.join('-'), { informationStrength: 4, optional: true, details: { distance: -distance }, mathematicalRule: 'Alle aufeinanderfolgenden Differenzen sind gleich und ungleich 0' }));
      }
    }
  }

  function addFrequencyPatternCandidates(selectedPositions) {
    const orderedPositions = freePositionOrder(selectedPositions);
    const frequencies = new Map();
    for (const position of orderedPositions) frequencies.set(code[position], (frequencies.get(code[position]) || 0) + 1);
    const counts = Array.from(frequencies.values());
    const twoPairs = counts.filter(count => count === 2).length === 2 && counts.every(count => count === 1 || count === 2);
    if (twoPairs && candidateGroups[4]['T4-16'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-16', orderedPositions, tier4TwoPairsText(orderedPositions), null, { informationStrength: 4, optional: true, details: { frequencyCounts: counts }, mathematicalRule: 'Genau zwei verschiedene Werte kommen jeweils exakt zweimal vor' }));
    }
    if (counts.every(count => count === 1) && candidateGroups[4]['T4-17'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-17', orderedPositions, tier4AllDifferentText(orderedPositions), null, { informationStrength: 3, optional: true, details: { frequencyCounts: counts }, mathematicalRule: 'Alle ausgewählten Werte sind paarweise verschieden' }));
    }
    const exactlyThree = counts.filter(count => count === 3).length === 1 && counts.every(count => count === 1 || count === 3);
    if (exactlyThree && candidateGroups[4]['T4-22'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-22', orderedPositions, tier4ExactlyThreeEqualText(orderedPositions), null, { informationStrength: 4, optional: true, details: { frequencyCounts: counts }, mathematicalRule: 'Genau ein Wert kommt dreimal vor; alle übrigen genau einmal' }));
    }
  }

  function perfectPairings(positions) {
    if (positions.length === 0) return [[]];
    const first = positions[0];
    const result = [];
    for (let index = 1; index < positions.length; index++) {
      const pair = [first, positions[index]];
      const remaining = positions.slice(1, index).concat(positions.slice(index + 1));
      for (const rest of perfectPairings(remaining)) result.push([pair].concat(rest));
    }
    return result;
  }

  function addThreePairSumsCandidates(selectedPositions) {
    if (candidateGroups[4]['T4-18'].length >= MAX_OPTIONAL_CANDIDATES) return;
    for (const pairing of perfectPairings(selectedPositions)) {
      const sums = pairing.map(pair => code[pair[0]] + code[pair[1]]);
      if (!sums.every(sum => sum === sums[0])) continue;
      const positions = [pairing[0][0], pairing[1][0], pairing[2][0], pairing[2][1], pairing[1][1], pairing[0][1]];
      const forward = positions.join('-');
      const backward = positions.slice().reverse().join('-');
      const signature = 'T4-18|' + (forward < backward ? forward : backward);
      add(makeCandidate(4, 'T4-18', positions, tier4ThreePairSumsText(positions), signature, { informationStrength: 5, optional: true, positionRoles: ['Paar 1', 'Paar 2', 'Paar 3', 'Paar 3', 'Paar 2', 'Paar 1'], details: { pairSum: sums[0] }, mathematicalRule: 'Wert 1 + Wert 6 = Wert 2 + Wert 5 = Wert 3 + Wert 4' }));
      if (candidateGroups[4]['T4-18'].length >= MAX_OPTIONAL_CANDIDATES) return;
    }
  }

  function addPairSumDifferenceCandidates(selectedPositions) {
    if (candidateGroups[4]['T4-19'].length >= MAX_OPTIONAL_CANDIDATES) return;
    for (const targetPosition of selectedPositions) {
      const sourcePositions = selectedPositions.filter(position => position !== targetPosition);
      for (const firstIndexes of combinations(sourcePositions.length, 2)) {
        const firstRaw = firstIndexes.map(index => sourcePositions[index]);
        const firstSet = new Set(firstRaw);
        const secondRaw = sourcePositions.filter(position => !firstSet.has(position));
        if (firstRaw.join('-') > secondRaw.join('-')) continue;
        const firstGroup = orderSmallGroup(firstRaw);
        const secondGroup = orderSmallGroup(secondRaw);
        const difference = Math.abs(firstGroup.reduce((sum, position) => sum + code[position], 0) - secondGroup.reduce((sum, position) => sum + code[position], 0));
        if (difference !== code[targetPosition]) continue;
        const positions = [firstGroup[0], firstGroup[1], targetPosition, secondGroup[0], secondGroup[1]];
        add(makeCandidate(4, 'T4-19', positions, tier4PairSumDifferenceText(positions), null, { informationStrength: 5, optional: true, positionRoles: ['Summe A', 'Summe A', 'Zielposition', 'Summe B', 'Summe B'], details: { firstGroup, secondGroup, targetPosition, difference }, mathematicalRule: 'Wert C = abs((Wert A + Wert B) - (Wert D + Wert E))' }));
        if (candidateGroups[4]['T4-19'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addCheckDigitCandidates(selectedPositions) {
    if (candidateGroups[4]['T4-21'].length >= MAX_OPTIONAL_CANDIDATES) return;
    for (const targetPosition of selectedPositions) {
      const sourcePositions = freePositionOrder(selectedPositions.filter(position => position !== targetPosition));
      const sourceSum = sourcePositions.reduce((sum, position) => sum + code[position], 0);
      if (sourceSum % 10 !== code[targetPosition]) continue;
      const positions = sourcePositions.concat(targetPosition);
      add(makeCandidate(4, 'T4-21', positions, tier4CheckDigitText(sourcePositions, targetPosition), null, { informationStrength: 5, optional: true, positionRoles: sourcePositions.map(() => 'Summenposition').concat('Prüfziffer'), details: { sourcePositions, targetPosition, sourceSum, checkDigit: sourceSum % 10 }, mathematicalRule: 'Summe der Quellwerte modulo 10 = Wert der Prüfziffer' }));
      if (candidateGroups[4]['T4-21'].length >= MAX_OPTIONAL_CANDIDATES) return;
    }
  }

  function addAbcAbcCandidates() {
    const positionsByValue = Array.from({ length: 10 }, () => []);
    for (let position = 0; position < code.length; position++) positionsByValue[code[position]].push(position);
    for (let firstValue = 0; firstValue <= 9; firstValue++) {
      for (let secondValue = 0; secondValue <= 9; secondValue++) {
        for (let thirdValue = 0; thirdValue <= 9; thirdValue++) {
          if (firstValue === secondValue && secondValue === thirdValue) continue;
          const pattern = [firstValue, secondValue, thirdValue, firstValue, secondValue, thirdValue];
          const cursors = Array(10).fill(0);
          const positions = [];
          let available = true;
          for (const value of pattern) {
            if (cursors[value] >= positionsByValue[value].length) { available = false; break; }
            positions.push(positionsByValue[value][cursors[value]++]);
          }
          if (!available) continue;
          add(makeCandidate(4, 'T4-10', positions, tier4AbcAbcText(positions), null, { informationStrength: 5, optional: true, details: { patternValues: [firstValue, secondValue, thirdValue] }, mathematicalRule: 'Wertfolge A-B-C-A-B-C mit mindestens zwei verschiedenen Werten' }));
          if (candidateGroups[4]['T4-10'].length >= MAX_OPTIONAL_CANDIDATES) return;
        }
      }
    }
  }

  function l054OrderedGroups(count, familyKey) {
    const offset = stableTextHash(familyKey + '|offset|' + code.join('')) % code.length;
    const step = 1 + stableTextHash(familyKey + '|step|' + code.join('')) % (code.length - 1);
    const positionOrder = Array.from({ length: code.length }, (_, index) => (offset + index * step) % code.length);
    return combinations(code.length, count).map(group => group.map(position => positionOrder[position]));
  }

  function addL054PointBeforeCandidates() {
    for (const triple of l054OrderedGroups(3, 'T3-17')) {
      for (const termPosition of triple) {
        const factors = triple.filter(position => position !== termPosition);
        if (code[factors[0]] < 2 || code[factors[1]] < 2 || code[termPosition] < 1) continue;
        const positions = [factors[0], factors[1], termPosition];
        const plusEvaluation = l054PointBeforeEvaluation(code[factors[0]], code[factors[1]], code[termPosition], 'productPlus');
        if (plusEvaluation.didacticallyValid && plusEvaluation.result <= L054_MAX_RESULT) {
          const informationExclusionPercent = l054ExactInformation('productPlus', plusEvaluation.result);
          add(makeCandidate(3, 'T3-17', positions, tier3PointBeforeText(positions, 'productPlus', plusEvaluation.result), 'T3-17|productPlus|' + positions.join('-') + '|' + plusEvaluation.result, { informationStrength: 5, optional: true, positionRoles: ['Faktor A', 'Faktor B', 'Summand'], details: { variant: 'productPlus', result: plusEvaluation.result, leftToRightResult: plusEvaluation.leftToRightResult, visibleOperatorOrder: 'summand-plus-product', factorPositions: factors, termPosition, informationExclusionPercent }, mathematicalRule: 'Wert C + Wert A × Wert B = gespeichertes Ergebnis; eine strikt links-nach-rechts berechnete Alternative muss davon abweichen.' }));
        }
        const minusEvaluation = l054PointBeforeEvaluation(code[factors[0]], code[factors[1]], code[termPosition], 'productMinus');
        if (minusEvaluation.didacticallyValid && minusEvaluation.result >= 0 && minusEvaluation.result <= L054_MAX_RESULT) {
          const informationExclusionPercent = l054ExactInformation('productMinus', minusEvaluation.result);
          add(makeCandidate(3, 'T3-17', positions, tier3PointBeforeText(positions, 'productMinus', minusEvaluation.result), 'T3-17|productMinus|' + positions.join('-') + '|' + minusEvaluation.result, { informationStrength: 5, optional: true, positionRoles: ['Faktor A', 'Faktor B', 'Minuend'], details: { variant: 'productMinus', result: minusEvaluation.result, leftToRightResult: minusEvaluation.leftToRightResult, visibleOperatorOrder: 'minuend-minus-product', factorPositions: factors, termPosition, informationExclusionPercent }, mathematicalRule: 'Wert C - Wert A × Wert B = gespeichertes nichtnegatives Ergebnis; eine strikt links-nach-rechts berechnete Alternative muss davon abweichen.' }));
        }
        if (candidateGroups[3]['T3-17'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addL054ParenthesesCandidates() {
    for (const triple of l054OrderedGroups(3, 'T3-18')) {
      for (const multiplierPosition of triple) {
        const operands = triple.filter(position => position !== multiplierPosition);
        if (code[multiplierPosition] < 2) continue;
        const sum = code[operands[0]] + code[operands[1]];
        const plusResult = sum * code[multiplierPosition];
        if (sum > 0 && plusResult <= L054_MAX_RESULT) {
          const positions = [operands[0], operands[1], multiplierPosition];
          const informationExclusionPercent = l054ExactInformation('groupedPlus', plusResult);
          add(makeCandidate(3, 'T3-18', positions, tier3ParenthesesText(positions, 'groupedPlus', plusResult), 'T3-18|groupedPlus|' + positions.join('-') + '|' + plusResult, { informationStrength: 5, optional: true, positionRoles: ['Klammeroperand A', 'Klammeroperand B', 'Multiplikator'], details: { variant: 'groupedPlus', result: plusResult, operandPositions: operands, multiplierPosition, informationExclusionPercent }, mathematicalRule: '(Wert A + Wert B) × Wert C = gespeichertes Ergebnis; die Klammer wird zuerst berechnet.' }));
        }
        const highPosition = code[operands[0]] >= code[operands[1]] ? operands[0] : operands[1];
        const lowPosition = highPosition === operands[0] ? operands[1] : operands[0];
        const difference = code[highPosition] - code[lowPosition];
        const minusResult = difference * code[multiplierPosition];
        if (difference > 0 && minusResult <= L054_MAX_RESULT) {
          const positions = [highPosition, lowPosition, multiplierPosition];
          const informationExclusionPercent = l054ExactInformation('groupedMinus', minusResult);
          add(makeCandidate(3, 'T3-18', positions, tier3ParenthesesText(positions, 'groupedMinus', minusResult), 'T3-18|groupedMinus|' + positions.join('-') + '|' + minusResult, { informationStrength: 5, optional: true, positionRoles: ['Minuend in Klammer', 'Subtrahend in Klammer', 'Multiplikator'], details: { variant: 'groupedMinus', result: minusResult, operandPositions: [highPosition, lowPosition], multiplierPosition, informationExclusionPercent }, mathematicalRule: '(Wert A - Wert B) × Wert C = gespeichertes Ergebnis; die Klammer wird zuerst berechnet.' }));
        }
        if (candidateGroups[3]['T3-18'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addL054ProductDigitSumCandidates() {
    for (const triple of l054OrderedGroups(3, 'T3-19')) {
      for (const targetPosition of triple) {
        const factors = triple.filter(position => position !== targetPosition);
        const product = code[factors[0]] * code[factors[1]];
        const digitSum = l054DigitSum(product);
        if (product < 10 || digitSum > 9 || code[targetPosition] !== digitSum) continue;
        const positions = [factors[0], factors[1], targetPosition];
        add(makeCandidate(3, 'T3-19', positions, tier3ProductDigitSumText(positions), 'T3-19|productDigitSum|' + positions.join('-'), { informationStrength: 5, optional: true, positionRoles: ['Faktor A', 'Faktor B', 'Quersummenziel'], details: { variant: 'productDigitSum', product, digitSum, targetPosition, informationExclusionPercent: L054_PRODUCT_DIGIT_SUM_EXCLUSION_PERCENT }, mathematicalRule: 'Das mindestens zweistellige Produkt aus Wert A und Wert B besitzt eine erste Quersumme von 0 bis 9, die exakt Wert C entspricht.' }));
        if (candidateGroups[3]['T3-19'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addL054ComposedDivisibilityCandidates() {
    const orderedPairs = l054OrderedGroups(2, 'T3-20').flatMap(pair => [pair, pair.slice().reverse()]);
    for (const pair of orderedPairs) {
      if (code[pair[0]] === 0) continue;
      const composedNumber = code[pair[0]] * 10 + code[pair[1]];
      for (const divisor of L054_DIVISORS) {
        if (composedNumber % divisor !== 0) continue;
        const validNumbers = Math.floor(99 / divisor) - Math.floor(9 / divisor);
        const informationExclusionPercent = l054ExclusionPercent(validNumbers, 100);
        add(makeCandidate(3, 'T3-20', pair, tier3ComposedDivisibilityText(pair, divisor), 'T3-20|composedDivisibility|' + pair.join('-') + '|' + divisor, { informationStrength: 4, optional: true, positionRoles: ['Zehnerstelle', 'Einerstelle'], details: { variant: 'composedDivisibility', composedNumber, divisor, informationExclusionPercent }, mathematicalRule: '10 × Wert A + Wert B bildet ohne führende Null eine zweistellige Zahl, die durch den gespeicherten Divisor größer 1 teilbar ist.' }));
        if (candidateGroups[3]['T3-20'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addL054MixedComparisonCandidates() {
    for (const positions of l054OrderedGroups(6, 'T4-23')) {
      if (code[positions[0]] < 2 || code[positions[1]] < 2 || code[positions[2]] < 1 || code[positions[3]] < 1 || code[positions[4]] < 2 || code[positions[5]] < 2) continue;
      const evaluation = l054MixedComparisonEvaluation(code, positions);
      if (!evaluation.didacticallyValid || Math.max(evaluation.leftResult, evaluation.rightResult) > L054_MAX_RESULT) continue;
      add(makeCandidate(4, 'T4-23', positions, tier4MixedExpressionComparisonText(positions, evaluation.comparison), 'T4-23|mixedComparison|' + positions.join('-') + '|' + evaluation.comparison, { informationStrength: 6, optional: true, positionRoles: ['Linker Faktor A', 'Linker Faktor B', 'Linker Summand', 'Rechter Summand', 'Rechter Faktor A', 'Rechter Faktor B'], details: { variant: 'mixedComparison', leftResult: evaluation.leftResult, rightResult: evaluation.rightResult, leftToRightLeftResult: evaluation.leftToRightLeftResult, leftToRightRightResult: evaluation.leftToRightRightResult, comparison: evaluation.comparison, leftToRightComparison: evaluation.leftToRightComparison, informationExclusionPercent: L054_MIXED_EXCLUSION_PERCENT }, mathematicalRule: 'Wert C + Wert A × Wert B wird mit Wert D + Wert E × Wert F verglichen; die strikt links-nach-rechts berechnete Vergleichsaussage muss falsch oder gleich sein.' }));
      if (candidateGroups[4]['T4-23'].length >= MAX_OPTIONAL_CANDIDATES) return;
    }
  }

  function addL054Candidates() {
    addL054PointBeforeCandidates();
    addL054ParenthesesCandidates();
    addL054ProductDigitSumCandidates();
    addL054ComposedDivisibilityCandidates();
    addL054MixedComparisonCandidates();
    for (const tier of [3, 4]) for (const id of L054_HINT_IDS) for (const candidate of candidateGroups[tier][id] || []) candidate.selectionPriority = 8;
  }

  for (let position = 0; position < code.length; position++) {
    const positions = [position];
    add(makeCandidate(1, 'T1-01', positions, tier1ParityText(code, positions)));
    add(makeCandidate(1, 'T1-02', positions, tier1PrimeText(code, positions)));
    add(makeCandidate(1, 'T1-03', positions, tier1SquareText(code, positions)));
    add(makeCandidate(1, 'T1-05', positions, tier1CompositeText(code, positions), null, { informationStrength: 2, details: { composite: COMPOSITE_DIGITS.has(code[position]) }, mathematicalRule: 'Zusammengesetzte Ziffer mit mehr als zwei positiven Teilern' }));
    add(makeCandidate(1, 'T1-06', positions, tier1PowerOfTwoText(code, positions), null, { informationStrength: 2, details: { powerOfTwo: POWER_OF_TWO_DIGITS.has(code[position]) }, mathematicalRule: 'Ziffer ist eine Potenz der Basis 2' }));
    add(makeCandidate(1, 'T1-07', positions, tier1CubeText(code, positions), null, { details: { cube: CUBE_DIGITS.has(code[position]) }, mathematicalRule: 'Ziffer ist eine Kubikzahl 0, 1 oder 8' }));
    add(makeCandidate(1, 'T1-08', positions, tier1FibonacciText(code, positions)));
    const samePositionParity = code[position] % 2 === (position + 1) % 2;
    add(makeCandidate(1, 'T1-09', positions, tier1PositionParityText(code, positions), null, { informationStrength: 2, details: { samePositionParity }, mathematicalRule: 'Parität der Ziffer im Vergleich zur sichtbaren Positionsnummer' }));
    add(makeCandidate(1, 'T1-12', positions, tier1DistinctPrimeSumText(code, positions), null, { informationStrength: 2, details: { distinctPrimeSum: DISTINCT_PRIME_SUM_DIGITS.has(code[position]) }, mathematicalRule: 'Ziffer ist als Summe zweier verschiedener Primziffern darstellbar' }));
    const factorial = FACTORIAL_DIGITS.has(code[position]);
    const factorialAllowedValues = factorial ? [1, 2, 6] : [0, 3, 4, 5, 7, 8, 9];
    add(makeCandidate(1, 'T1-13', positions, tier1FactorialText(code, positions), null, { informationStrength: factorial ? 3 : 1, details: { factorial, allowedValues: factorialAllowedValues }, mathematicalRule: 'Ziffer ist eine Fakultätszahl der Folge 1, 2, 6' }));
    add(makeCandidate(1, 'T1-14', positions, tier1TriangularText(code, positions), null, { informationStrength: 2, details: { triangular: TRIANGULAR_DIGITS.has(code[position]) }, mathematicalRule: 'Ziffer ist eine Dreieckszahl der Folge 0, 1, 3, 6' }));
    const digitHint = DIGIT_HINT_BY_DIGIT.get(code[position]);
    if (digitHint.id === 'T1-DIGIT-06') {
      for (let sourcePosition = 0; sourcePosition < code.length; sourcePosition++) {
        if (sourcePosition === position || code[sourcePosition] !== digitHint.sourceDigit) continue;
        const relationPositions = [position, sourcePosition];
        add(makeCandidate(1, digitHint.id, relationPositions, digitHintText(digitHint, relationPositions), digitHint.id + '|' + position + '|' + sourcePosition, { informationStrength: 6, optional: true, selectionPriority: 2, positionRoles: ['Fakultätsziel 6', 'Fakultätsbasis 3'], details: { digitValue: digitHint.digit, propertyKey: digitHint.propertyKey, expression: digitHint.expression, targetPosition: position, sourcePosition, sourceDigit: digitHint.sourceDigit }, mathematicalRule: 'Die Ziffer an der Quellposition ist exakt 3 und 3! = 6 bestimmt die Ziffer an der Zielposition.' }));
      }
    } else {
      add(makeCandidate(1, digitHint.id, positions, digitHintText(digitHint, positions), digitHint.id + '|' + position, { informationStrength: 6, optional: true, selectionPriority: 2, positionRoles: ['Direkt mathematisch bestimmte Ziffer'], details: { digitValue: digitHint.digit, propertyKey: digitHint.propertyKey, expression: digitHint.expression }, mathematicalRule: 'Die mathematische Eigenschaft ' + digitHint.propertyKey + ' bestimmt eindeutig die Ziffer ' + digitHint.digit + '.' }));
    }
  }

  const comparisonPositions = existingComparison.positions;
  const expectedComparisonText = comparisonText(code, comparisonPositions);
  const comparisonCandidateText = existingComparison.text === expectedComparisonText ? existingComparison.text : expectedComparisonText;
  add(makeCandidate(2, 'T2-01', comparisonPositions, comparisonCandidateText));

  for (const pair of combinations(code.length, 2)) {
    const pairSum = code[pair[0]] + code[pair[1]];
    const pairDifference = Math.abs(code[pair[0]] - code[pair[1]]);
    add(makeCandidate(2, 'T2-02', pair, tier2SumSquareText(code, pair), null, { informationStrength: 2, details: { sum: pairSum, square: SQUARE_SUMS.has(pairSum) }, mathematicalRule: 'Quadratzahleigenschaft der Summe zweier Positionen' }));
    add(makeCandidate(2, 'T2-03', pair, tier2DifferenceSquareText(code, pair), null, { informationStrength: 2, details: { difference: pairDifference, square: SQUARE_SUMS.has(pairDifference) }, mathematicalRule: 'Quadratzahleigenschaft des absoluten Unterschieds' }));
    add(makeCandidate(2, 'T2-04', pair, tier2ParityText(code, pair), null, { informationStrength: 2, details: { sameParity: code[pair[0]] % 2 === code[pair[1]] % 2 }, mathematicalRule: 'Beide Werte besitzen dieselbe oder unterschiedliche Parität' }));
    add(makeCandidate(2, 'T2-06', pair, tier2DifferenceParityText(code, pair)));
    const pairProduct = code[pair[0]] * code[pair[1]];
    const productSquare = Number.isInteger(Math.sqrt(pairProduct));
    add(makeCandidate(2, 'T2-07', pair, tier2ProductSquareText(code, pair), null, { informationStrength: productSquare ? 3 : 2, details: { product: pairProduct, square: productSquare }, mathematicalRule: 'Quadratzahleigenschaft des Produkts zweier Positionen' }));
    add(makeCandidate(2, 'T2-13', pair, tier2DifferencePrimeText(code, pair), null, { details: { difference: Math.abs(code[pair[0]] - code[pair[1]]) }, mathematicalRule: 'Primzahleigenschaft des absoluten Unterschieds' }));
    add(makeCandidate(2, 'T2-14', pair, tier2EqualityText(code, pair), null, { details: { equal: code[pair[0]] === code[pair[1]] }, mathematicalRule: 'Werte sind gleich oder verschieden' }));
    add(makeCandidate(2, 'T2-16', pair, tier2SumPrimeText(code, pair), null, { details: { sum: code[pair[0]] + code[pair[1]], prime: PRIME_SUMS.has(code[pair[0]] + code[pair[1]]) }, mathematicalRule: 'Primzahleigenschaft der Summe' }));
    if (Math.abs(code[pair[0]] - code[pair[1]]) === 1) {
      add(makeCandidate(2, 'T2-08', pair, tier2NeighborText(pair), null, { informationStrength: 3, optional: true }));
    }
    const firstValue = code[pair[0]];
    const secondValue = code[pair[1]];
    if (firstValue !== secondValue && (firstValue === secondValue * 2 || secondValue === firstValue * 2)) {
      const ratioDirection = code[pair[0]] === code[pair[1]] * 2 ? 'double' : 'half';
      add(makeCandidate(2, 'T2-09', pair, tier2DoubleHalfText(code, pair), null, { informationStrength: 3, optional: true, details: { ratioDirection }, mathematicalRule: ratioDirection === 'double' ? 'Wert A = 2 × Wert B' : 'Wert A × 2 = Wert B' }));
    }
    add(makeCandidate(2, 'T2-10', pair, tier2SumFibonacciText(code, pair), null, { informationStrength: 2, details: { sum: pairSum, fibonacci: FIBONACCI_SUMS.has(pairSum) }, mathematicalRule: 'Fibonacci-Eigenschaft der Summe zweier Positionen' }));
    for (const order of [pair, pair.slice().reverse()]) {
      const dividend = code[order[0]];
      const divisor = code[order[1]];
      if (divisor !== 0 && dividend !== divisor && dividend % divisor === 0 && dividend / divisor >= 2) {
        const strength = divisor === 1 ? 1 : 3;
        add(makeCandidate(2, 'T2-11', order, tier2DivisibilityText(order), null, { informationStrength: strength, optional: true, details: { dividend, divisor, quotient: dividend / divisor } }));
      }
      if (code[order[0]] !== 0) {
        const composedNumber = code[order[0]] * 10 + code[order[1]];
        const square = Number.isInteger(Math.sqrt(composedNumber));
        add(makeCandidate(2, 'T2-12', order, tier2ComposedSquareText(code, order), null, { informationStrength: square ? 4 : 2, details: { composedNumber, square }, mathematicalRule: 'Quadratzahleigenschaft der zweistelligen Zahl in gespeicherter Reihenfolge' }));
      }
    }
  }
  for (let mirrorIndex = 0; mirrorIndex < 5; mirrorIndex++) {
    const mirrorPair = [mirrorIndex, code.length - 1 - mirrorIndex];
    if (Math.abs(code[mirrorPair[0]] - 5) === Math.abs(code[mirrorPair[1]] - 5)) {
      add(makeCandidate(2, 'T2-15', mirrorPair, tier2MirrorDistanceText(mirrorPair), null, { informationStrength: 3, optional: true, details: { distance: Math.abs(code[mirrorPair[0]] - 5) }, mathematicalRule: 'abs(Wert A - 5) = abs(Wert B - 5)' }));
    }
  }

  for (const triple of combinations(code.length, 3)) {
    const sumComparison = relation(code[triple[0]] + code[triple[1]], code[triple[2]]);
    add(makeCandidate(3, 'T3-01', triple, tier3SumComparisonText(code, triple), null, { details: { comparison: sumComparison }, mathematicalRule: 'Summe der ersten zwei Werte wird mit dem dritten Wert verglichen' }));
    const tripleProduct = code[triple[0]] * code[triple[1]];
    const productComparison = relation(tripleProduct, code[triple[2]]);
    add(makeCandidate(3, 'T3-03', triple, tier3ProductComparisonText(code, triple), null, { informationStrength: 3, positionRoles: ['Faktor A', 'Faktor B', 'Vergleichsposition'], details: { product: tripleProduct, comparison: productComparison }, mathematicalRule: 'Produkt der ersten zwei Werte wird mit dem dritten Wert verglichen' }));
    const tripleValues = triple.map(position => code[position]);
    const distinctValueCount = new Set(tripleValues).size;
    const valuesAreDifferent = distinctValueCount === 3;
    const exactlyTwoEqual = distinctValueCount === 2 && tripleValues.some(value => tripleValues.filter(otherValue => otherValue === value).length === 2);
    if (exactlyTwoEqual) add(makeCandidate(3, 'T3-04', triple, tier3ExactlyTwoEqualText(triple), null, { informationStrength: 3, optional: true }));
    if (valuesAreDifferent) {
      const ascending = triple.slice().sort((first, second) => code[first] - code[second]);
      const descending = ascending.slice().reverse();
      add(makeCandidate(3, 'T3-02', ascending, tier3OrderText(code, ascending)));
      add(makeCandidate(3, 'T3-02', descending, tier3OrderText(code, descending)));
      const orderedByValue = triple.slice().sort((first, second) => code[first] - code[second]);
      const betweenOrder = [orderedByValue[1], orderedByValue[0], orderedByValue[2]];
      add(makeCandidate(3, 'T3-07', betweenOrder, tier3StrictBetweenText(betweenOrder), null, { informationStrength: 4, positionRoles: ['Zielposition', 'Untere Grenze', 'Obere Grenze'], details: { targetPosition: betweenOrder[0], lowerPosition: betweenOrder[1], upperPosition: betweenOrder[2] }, mathematicalRule: 'Wert der Zielposition ist strikt größer als der untere und strikt kleiner als der obere Positionswert' }));
    }
    const differenceOrder = [triple[1], triple[2], triple[0]];
    const comparedDifference = Math.abs(code[differenceOrder[0]] - code[differenceOrder[1]]);
    const differenceComparison = relation(comparedDifference, code[differenceOrder[2]]);
    add(makeCandidate(3, 'T3-08', differenceOrder, tier3DifferenceComparisonText(code, differenceOrder), null, { informationStrength: 3, positionRoles: ['Abstand A', 'Abstand B', 'Vergleichsposition'], details: { difference: comparedDifference, comparison: differenceComparison }, mathematicalRule: 'Absoluter Abstand der ersten zwei Werte wird mit dem dritten Wert verglichen' }));
    const sumParityOrder = [triple[2], triple[0], triple[1]];
    const tripleSum = sumParityOrder.reduce((sum, position) => sum + code[position], 0);
    add(makeCandidate(3, 'T3-15', sumParityOrder, tier3SumParityText(code, sumParityOrder), null, { informationStrength: 2, details: { sum: tripleSum, parity: tripleSum % 2 === 0 ? 'even' : 'odd' }, mathematicalRule: 'Parität der Summe dreier Werte' }));
    const roleOrders = [
      [triple[0], triple[1], triple[2]],
      [triple[0], triple[2], triple[1]],
      [triple[1], triple[2], triple[0]]
    ];
    for (const roleOrder of roleOrders) {
      const firstValue = code[roleOrder[0]];
      const secondValue = code[roleOrder[1]];
      const targetValue = code[roleOrder[2]];
      if (firstValue + secondValue === targetValue) {
        add(makeCandidate(3, 'T3-10', roleOrder, tier3ExactSumText(roleOrder), null, { informationStrength: 4, optional: true, positionRoles: ['Summand A', 'Summand B', 'Zielposition'], details: { targetPosition: roleOrder[2], sum: targetValue }, mathematicalRule: 'Wert A + Wert B = Wert C' }));
      }
      if (Math.abs(firstValue - secondValue) === targetValue) {
        add(makeCandidate(3, 'T3-11', roleOrder, tier3ExactDifferenceText(roleOrder), null, { informationStrength: 4, optional: true, positionRoles: ['Ausgangswert A', 'Ausgangswert B', 'Zielposition'], details: { targetPosition: roleOrder[2], difference: targetValue }, mathematicalRule: 'abs(Wert A - Wert B) = Wert C' }));
      }
      if (firstValue !== secondValue && firstValue + secondValue === 2 * targetValue) {
        add(makeCandidate(3, 'T3-12', roleOrder, tier3AverageText(roleOrder), null, { informationStrength: 4, optional: true, positionRoles: ['Außenwert A', 'Außenwert B', 'Durchschnittsposition'], details: { targetPosition: roleOrder[2], average: targetValue }, mathematicalRule: 'Wert A + Wert B = 2 × Wert C' }));
      }
      if ((firstValue * secondValue) % 10 === targetValue) {
        add(makeCandidate(3, 'T3-16', roleOrder, tier3ProductDigitText(roleOrder), null, { informationStrength: 5, optional: true, positionRoles: ['Faktor A', 'Faktor B', 'Zielposition'], details: { targetPosition: roleOrder[2], product: firstValue * secondValue, lastDigit: targetValue }, mathematicalRule: '(Wert A × Wert B) modulo 10 = Wert C' }));
      }
    }
    const rangeOrder = [triple[1], triple[2], triple[0]];
    const rangeValues = rangeOrder.map(position => code[position]);
    const rangeDistance = Math.max(...rangeValues) - Math.min(...rangeValues);
    if (rangeDistance > 0) {
      add(makeCandidate(3, 'T3-13', rangeOrder, tier3RangePrimeText(code, rangeOrder), null, { informationStrength: 3, details: { distance: rangeDistance, prime: PRIME_DIGITS.has(rangeDistance) }, mathematicalRule: 'Primzahleigenschaft des Abstands zwischen Maximum und Minimum' }));
    }
    const triangleValues = triple.map(position => code[position]).sort((first, second) => first - second);
    if (triangleValues[0] > 0 && triangleValues[0] + triangleValues[1] > triangleValues[2]) {
      const triangleOrder = [triple[1], triple[2], triple[0]];
      add(makeCandidate(3, 'T3-14', triangleOrder, tier3TriangleText(triangleOrder), null, { informationStrength: 3, optional: true, details: { sideValues: triangleOrder.map(position => code[position]) }, mathematicalRule: 'Alle Seiten > 0 und Summe der zwei kleineren Seiten > größte Seite' }));
    }
    for (const order of permutations(triple)) {
      const firstDistance = code[order[1]] - code[order[0]];
      const secondDistance = code[order[2]] - code[order[1]];
      if (firstDistance === secondDistance && firstDistance !== 0) {
        const forward = order.join('-');
        const backward = order.slice().reverse().join('-');
        const signature = 'T3-06|' + (forward < backward ? forward : backward);
        add(makeCandidate(3, 'T3-06', order, tier3ArithmeticSequenceText(order), signature, { informationStrength: 3, optional: true }));
      }
      if (code[order[0]] !== 0) {
        const composedNumber = code[order[0]] * 100 + code[order[1]] * 10 + code[order[2]];
        const palindrome = code[order[0]] === code[order[2]];
        add(makeCandidate(3, 'T3-09', order, tier3ComposedPalindromeText(code, order), null, { informationStrength: palindrome ? 4 : 2, details: { composedNumber, palindrome }, mathematicalRule: 'Palindrom-Eigenschaft der dreistelligen Zahl in gespeicherter Reihenfolge' }));
      }
    }
  }

  for (let position = 0; position < code.length; position++) {
    const frequency = code.filter(value => value === code[position]).length;
    const strength = frequency >= 2 && frequency <= 4 ? 4 : frequency === 1 ? 2 : 3;
    add(makeCandidate(4, 'T4-15', [position], tier4CodeFrequencyText([position], frequency), null, { informationStrength: strength, details: { sourcePosition: position, frequency, scope: 'entireCode' }, mathematicalRule: 'Häufigkeit des Wertes der Ausgangsposition in allen Codeziffern' }));
  }
  const oddPositions = Array.from({ length: code.length }, (_, index) => index).filter(index => index % 2 === 0);
  const evenPositions = Array.from({ length: code.length }, (_, index) => index).filter(index => index % 2 === 1);
  const oddPositionSum = oddPositions.reduce((sum, position) => sum + code[position], 0);
  const evenPositionSum = evenPositions.reduce((sum, position) => sum + code[position], 0);
  const positionSumComparison = relation(oddPositionSum, evenPositionSum);
  add(makeCandidate(4, 'T4-20', oddPositions.concat(evenPositions), tier4OddEvenPositionSumText(code), null, { informationStrength: 4, selectionPriority: -30, positionRoles: oddPositions.map(() => 'Ungerade sichtbare Position').concat(evenPositions.map(() => 'Gerade sichtbare Position')), details: { oddPositions, evenPositions, oddPositionSum, evenPositionSum, comparison: positionSumComparison, scope: 'entireCode' }, mathematicalRule: 'Summe der Werte an ungeraden sichtbaren Positionen wird mit der Summe an geraden sichtbaren Positionen verglichen' }));
  addAbcAbcCandidates();

  for (const selectedPositions of combinations(code.length, 4)) {
    for (const order of permutations(selectedPositions)) {
      if (code[order[0]] === code[order[3]] && code[order[1]] === code[order[2]]) {
        const forward = order.join('-');
        const backward = order.slice().reverse().join('-');
        const signature = 'T4-01|' + (forward < backward ? forward : backward);
        add(makeCandidate(4, 'T4-01', order, palindromeText(order), signature));
      }
      if (code[order[0]] === code[order[2]] && code[order[1]] === code[order[3]] && code[order[0]] !== code[order[1]]) {
        const forward = order.join('-');
        const backward = order.slice().reverse().join('-');
        const signature = 'T4-04|' + (forward < backward ? forward : backward);
        add(makeCandidate(4, 'T4-04', order, tier4AbabText(order), signature, { informationStrength: 4, optional: true }));
      }
      if (code[order[0]] === code[order[1]] && code[order[2]] === code[order[3]] && code[order[0]] !== code[order[2]]) {
        const forward = order.join('-');
        const backward = order.slice().reverse().join('-');
        const signature = 'T4-07|' + (forward < backward ? forward : backward);
        add(makeCandidate(4, 'T4-07', order, tier4AabbText(order), signature, { informationStrength: 4, optional: true, details: { pattern: 'A-A-B-B' }, mathematicalRule: 'Wertfolge A-A-B-B mit A ungleich B' }));
      }
    }
    const pairings = [
      [selectedPositions[0], selectedPositions[2], selectedPositions[1], selectedPositions[3]],
      [selectedPositions[0], selectedPositions[3], selectedPositions[2], selectedPositions[1]],
      [selectedPositions[1], selectedPositions[3], selectedPositions[0], selectedPositions[2]]
    ];
    for (const pairing of pairings) {
      add(makeCandidate(4, 'T4-02', pairing, pairSumComparisonText(code, pairing)));
      const firstDistance = Math.abs(code[pairing[0]] - code[pairing[1]]);
      const secondDistance = Math.abs(code[pairing[2]] - code[pairing[3]]);
      if (firstDistance === secondDistance && firstDistance > 0) {
        add(makeCandidate(4, 'T4-05', pairing, tier4EqualDistancesText(pairing), null, { informationStrength: 3, optional: true }));
      }
    }
    const orderedPositions = freePositionOrder(selectedPositions);
    const firstPairSum = code[orderedPositions[0]] + code[orderedPositions[1]];
    const secondPairSum = code[orderedPositions[2]] + code[orderedPositions[3]];
    const samePairSumParity = firstPairSum % 2 === secondPairSum % 2;
    add(makeCandidate(4, 'T4-03', orderedPositions, tier4PairSumParityText(code, orderedPositions), null, { informationStrength: 3, positionRoles: ['Summe A', 'Summe A', 'Summe B', 'Summe B'], details: { firstPairSum, secondPairSum, sameParity: samePairSumParity }, mathematicalRule: 'Parität von Summe A wird mit der Parität von Summe B verglichen' }));
    addProductComparisonCandidate(selectedPositions);
    addExactlyOnePairCandidate(selectedPositions);
    addSequenceCandidates(selectedPositions);
    addFrequencyPatternCandidates(selectedPositions);
    addCheckDigitCandidates(selectedPositions);
  }

  for (const selectedPositions of combinations(code.length, 5)) {
    addExactlyOnePairCandidate(selectedPositions);
    addEqualGroupSumCandidates(selectedPositions);
    addSequenceCandidates(selectedPositions);
    addFrequencyPatternCandidates(selectedPositions);
    addPairSumDifferenceCandidates(selectedPositions);
    addCheckDigitCandidates(selectedPositions);
  }

  for (const selectedPositions of combinations(code.length, 6)) {
    addExactlyOnePairCandidate(selectedPositions);
    addEqualGroupSumCandidates(selectedPositions);
    addSequenceCandidates(selectedPositions);
    addFrequencyPatternCandidates(selectedPositions);
    addThreePairSumsCandidates(selectedPositions);
    addCheckDigitCandidates(selectedPositions);
  }

  addL054Candidates();
  addCodewideCandidates();
  addTier5Candidates();

  function verifyCodewideCandidate(candidate) {
    const positions = candidate.internalPositions;
    const details = candidate.details;
    const id = candidate.id;
    let valid = false;
    if (id === 'T1-CODE-01') valid = positions.length === 1 && codewide.hasPrime && details.derivedValue === codewide.largestPrime && details.comparison === relation(codewide.largestPrime, code[positions[0]]);
    else if (id === 'T1-CODE-02') valid = positions.length === 1 && codewide.hasEven && details.derivedValue === codewide.smallestEven && details.comparison === relation(codewide.smallestEven, code[positions[0]]);
    else if (id === 'T1-CODE-03') {
      const expectedExtremum = code[positions[0]] === codewide.maximum ? 'maximum' : code[positions[0]] === codewide.minimum ? 'minimum' : 'neither';
      valid = positions.length === 1 && codewide.minimum !== codewide.maximum && details.minimum === codewide.minimum && details.maximum === codewide.maximum && details.extremum === expectedExtremum;
    } else if (id === 'T1-CODE-04') valid = positions.length === 1 && details.median === codewide.median && details.comparison === relation(codewide.median, code[positions[0]]);
    else if (id === 'T2-CODE-01') {
      const sources = {
        smallestEven: { value: codewide.smallestEven, available: codewide.hasEven, subject: 'Die kleinste gerade Zahl im Code' },
        largestPrime: { value: codewide.largestPrime, available: codewide.hasPrime, subject: 'Die größte Primzahl im Code' },
        largestOdd: { value: codewide.largestOdd, available: codewide.hasOdd, subject: 'Die größte ungerade Zahl im Code' }
      };
      const source = sources[details.sourceKey];
      if (positions.length === 2 && source && source.available && details.derivedValue === source.value && details.subject === source.subject) {
        const firstValue = code[positions[0]];
        const secondValue = code[positions[1]];
        valid = details.mode === 'greaterBoth' ? source.value > firstValue && source.value > secondValue : details.mode === 'lessBoth' ? source.value < firstValue && source.value < secondValue : details.mode === 'between' ? firstValue < source.value && source.value < secondValue : false;
      }
    }
    else if (id === 'T2-CODE-03') {
      if (positions.length === 2 && codewide.hasPrime && details.largestPrime === codewide.largestPrime) {
        const firstValue = code[positions[0]];
        const secondValue = code[positions[1]];
        valid = details.mode === 'bothGreater' ? firstValue > codewide.largestPrime && secondValue > codewide.largestPrime : details.mode === 'bothSmaller' ? firstValue < codewide.largestPrime && secondValue < codewide.largestPrime : details.mode === 'between' ? firstValue < codewide.largestPrime && codewide.largestPrime < secondValue : false;
      }
    } else if (id === 'T2-CODE-04') {
      const extremumValue = details.extremum === 'minimum' ? codewide.minimum : details.extremum === 'maximum' ? codewide.maximum : null;
      if (positions.length === 2 && Number.isInteger(extremumValue) && details.extremumValue === extremumValue) {
        const closerDistance = Math.abs(code[positions[0]] - extremumValue);
        const fartherDistance = Math.abs(code[positions[1]] - extremumValue);
        valid = closerDistance > 0 && closerDistance < fartherDistance && details.closerDistance === closerDistance && details.fartherDistance === fartherDistance;
      }
    } else if (id === 'T3-CODE-01' || id === 'T3-CODE-02') {
      const expectedAnchor = id === 'T3-CODE-01' ? codewide.firstPrimePosition : codewide.lastPrimePosition;
      const expectedNeighbor = id === 'T3-CODE-01' ? codewide.afterFirstPrime : codewide.beforeLastPrime;
      if (positions.length === 3 && Number.isInteger(expectedAnchor) && Number.isInteger(expectedNeighbor) && positions[0] === expectedAnchor && positions[1] === expectedNeighbor && positions[2] !== expectedAnchor && positions[2] !== expectedNeighbor) {
        const parity = code[expectedNeighbor] % 2 === 0 ? 'even' : 'odd';
        valid = details.anchorPosition === expectedAnchor && details.neighborPosition === expectedNeighbor && details.targetPosition === positions[2] && details.parity === parity && details.comparison === relation(code[expectedNeighbor], code[positions[2]]);
      }
    } else if (id === 'T3-CODE-03') {
      const occurrences = [
        { position: codewide.firstMinimumPosition, label: 'ersten Vorkommen der kleinsten Zahl' },
        { position: codewide.lastMinimumPosition, label: 'letzten Vorkommen der kleinsten Zahl' },
        { position: codewide.firstMaximumPosition, label: 'ersten Vorkommen der größten Zahl' },
        { position: codewide.lastMaximumPosition, label: 'letzten Vorkommen der größten Zahl' }
      ];
      const occurrence = occurrences.find(entry => entry.position === positions[0] && entry.label === details.occurrenceLabel);
      if (positions.length === 3 && codewide.minimum !== codewide.maximum && occurrence && positions[2] !== positions[0] && positions[2] !== positions[1]) {
        const expectedNeighbor = details.directionLabel === 'vor' ? positions[0] - 1 : details.directionLabel === 'nach' ? positions[0] + 1 : null;
        valid = Number.isInteger(expectedNeighbor) && expectedNeighbor >= 0 && expectedNeighbor < code.length && positions[1] === expectedNeighbor && details.occurrencePosition === positions[0] && details.neighborPosition === positions[1] && details.targetPosition === positions[2] && details.comparison === relation(code[positions[1]], code[positions[2]]);
      }
    } else if (id === 'T3-CODE-04') valid = positions.length === 2 && Number.isInteger(codewide.afterFirstPrime) && Number.isInteger(codewide.beforeLastPrime) && codewide.afterFirstPrime !== codewide.beforeLastPrime && positions[0] === codewide.afterFirstPrime && positions[1] === codewide.beforeLastPrime && details.firstPrimePosition === codewide.firstPrimePosition && details.lastPrimePosition === codewide.lastPrimePosition && details.comparison === relation(code[positions[0]], code[positions[1]]);
    else if (id === 'T4-CODE-01') valid = positions.length === 2 && positions[0] === 0 && positions[1] === code.length - 1 && codewide.hasPrime && details.maximum === codewide.maximum && details.largestPrime === codewide.largestPrime && code[0] !== codewide.maximum && code[code.length - 1] !== codewide.maximum && code[0] > codewide.largestPrime && code[code.length - 1] > codewide.largestPrime;
    else if (id === 'T4-CODE-02') valid = positions.length === 2 && positions[0] === codewide.firstPrimePosition && positions[1] === codewide.afterFirstPrime && codewide.hasPrime && codewide.hasEven && codewide.hasOdd && Number.isInteger(codewide.afterFirstPrime) && details.smallestEven === codewide.smallestEven && details.largestOdd === codewide.largestOdd && codewide.smallestEven < code[codewide.afterFirstPrime] && code[codewide.afterFirstPrime] < codewide.largestOdd;
    else if (id === 'T4-CODE-03') {
      if (positions.length === 3 && Number.isInteger(codewide.beforeFirstPrime) && Number.isInteger(codewide.afterLastPrime) && codewide.beforeFirstPrime !== codewide.afterLastPrime && positions[0] === codewide.beforeFirstPrime && positions[1] === codewide.afterLastPrime && positions[2] !== positions[0] && positions[2] !== positions[1]) {
        const derivedSum = code[positions[0]] + code[positions[1]];
        valid = derivedSum <= 9 && code[positions[2]] === derivedSum && details.derivedSum === derivedSum && details.targetPosition === positions[2];
      }
    } else if (id === 'T4-CODE-04') {
      const values = [code[codewide.firstEvenPosition], code[codewide.lastOddPosition], codewide.median];
      const ascending = values[0] < values[1] && values[1] < values[2];
      const descending = values[0] > values[1] && values[1] > values[2];
      valid = positions.length === 2 && codewide.hasEven && codewide.hasOdd && positions[0] === codewide.firstEvenPosition && positions[1] === codewide.lastOddPosition && details.median === codewide.median && new Set(values).size === 3 && Array.isArray(details.values) && details.values.join('-') === values.join('-') && (details.direction === 'ascending' ? ascending : details.direction === 'descending' ? descending : false);
    } else if (id === 'T4-CODE-05') {
      const difference = Math.abs(codewide.maximum - codewide.minimum);
      valid = positions.length === 2 && codewide.minimum !== codewide.maximum && Number.isInteger(codewide.afterFirstPrime) && positions[0] === codewide.firstPrimePosition && positions[1] === codewide.afterFirstPrime && code[positions[1]] === difference && details.globalDifference === difference && details.minimum === codewide.minimum && details.maximum === codewide.maximum;
    } else if (id === 'T4-CODE-06') valid = positions.length === 2 && positions[0] === 0 && positions[1] === code.length - 1 && codewide.minimum !== codewide.maximum && details.minimum === codewide.minimum && details.maximum === codewide.maximum && codewide.minimum < code[0] && code[0] < codewide.maximum && codewide.minimum < code[code.length - 1] && code[code.length - 1] < codewide.maximum;
    else if (id === 'T4-CODE-07') valid = positions.length === 1 && codewide.hasEven && codewide.hasPrime && details.smallestEven === codewide.smallestEven && details.largestPrime === codewide.largestPrime && details.targetPosition === positions[0] && codewide.smallestEven < codewide.largestPrime && codewide.largestPrime < code[positions[0]];
    if (!valid) return false;
    const texts = codewideTextVariants(id, positions, details);
    let variantSeed = 2166136261;
    const variantSource = GENERATOR_SEED + '|' + id + '|' + positions.join('-') + '|' + (details.semanticKey || '') + '|' + code.join('');
    for (let index = 0; index < variantSource.length; index++) { variantSeed ^= variantSource.charCodeAt(index); variantSeed = Math.imul(variantSeed, 16777619); }
    const expectedVariantIndex = (variantSeed >>> 0) % texts.length;
    return texts.length >= 2 && details.variantIndex === expectedVariantIndex && candidate.text === texts[expectedVariantIndex] && candidate.codewideDerivations.length > 0;
  }

  function verifyCandidate(candidate) {
    if (!candidate.truth || !candidate.text || !candidate.signature) return false;
    if (!candidateGroups[candidate.tier] || !candidateGroups[candidate.tier][candidate.id]) return false;
    if (candidate.internalPositions.some(position => !Number.isInteger(position) || position < 0 || position >= code.length)) return false;
    if (new Set(candidate.internalPositions).size !== candidate.internalPositions.length) return false;
    if (candidate.visiblePositions.some((position, index) => position !== candidate.internalPositions[index] + 1)) return false;
    if (candidate.positionOrder.some((position, index) => position !== candidate.internalPositions[index])) return false;
    if (!Number.isFinite(candidate.informationStrength) || candidate.informationStrength < 1) return false;
    if (typeof candidate.optional !== 'boolean') return false;
    if (!candidate.details || typeof candidate.details !== 'object' || Array.isArray(candidate.details)) return false;
    if (!Array.isArray(candidate.codewideDerivations)) return false;
    if (!Array.isArray(candidate.positionRoles) || candidate.positionRoles.length !== candidate.internalPositions.length) return false;
    if (typeof candidate.mathematicalRule !== 'string' || candidate.mathematicalRule.length === 0) return false;
    if (typeof candidate.requiresUnlock !== 'boolean' || typeof candidate.specialRuleType !== 'string' || typeof candidate.independentValidation !== 'boolean' || !Number.isFinite(candidate.selectionPriority)) return false;
    if (candidate.tier === 5 && (!TIER_5_UNLOCKED || !candidate.requiresUnlock || !candidate.independentValidation)) return false;
    const positions = candidate.internalPositions;
    if (candidate.id.includes('-CODE-')) return verifyCodewideCandidate(candidate);
    if (DIGIT_HINT_IDS.has(candidate.id)) {
      const definition = DIGIT_HINT_DEFINITIONS.find(entry => entry.id === candidate.id);
      if (!definition || candidate.tier !== 1 || candidate.specialRuleType !== 'normal' || candidate.details.digitValue !== definition.digit || candidate.details.propertyKey !== definition.propertyKey || candidate.details.expression !== definition.expression) return false;
      if (candidate.id === 'T1-DIGIT-06') return positions.length === 2 && positions[0] !== positions[1] && code[positions[0]] === 6 && code[positions[1]] === 3 && candidate.details.targetPosition === positions[0] && candidate.details.sourcePosition === positions[1] && candidate.details.sourceDigit === 3 && candidate.text === digitHintText(definition, positions);
      return positions.length === 1 && code[positions[0]] === definition.digit && candidate.text === digitHintText(definition, positions);
    }
    if (candidate.id === 'T1-01') return candidate.text === tier1ParityText(code, positions);
    if (candidate.id === 'T1-02') return candidate.text === tier1PrimeText(code, positions);
    if (candidate.id === 'T1-03') return candidate.text === tier1SquareText(code, positions);
    if (candidate.id === 'T1-05') return positions.length === 1 && candidate.details.composite === COMPOSITE_DIGITS.has(code[positions[0]]) && candidate.text === tier1CompositeText(code, positions);
    if (candidate.id === 'T1-06') return positions.length === 1 && candidate.details.powerOfTwo === POWER_OF_TWO_DIGITS.has(code[positions[0]]) && candidate.text === tier1PowerOfTwoText(code, positions);
    if (candidate.id === 'T1-07') return positions.length === 1 && candidate.text === tier1CubeText(code, positions);
    if (candidate.id === 'T1-08') return positions.length === 1 && candidate.text === tier1FibonacciText(code, positions);
    if (candidate.id === 'T1-09') return positions.length === 1 && candidate.details.samePositionParity === (code[positions[0]] % 2 === (positions[0] + 1) % 2) && candidate.text === tier1PositionParityText(code, positions);
    if (candidate.id === 'T1-12') return positions.length === 1 && candidate.details.distinctPrimeSum === DISTINCT_PRIME_SUM_DIGITS.has(code[positions[0]]) && candidate.text === tier1DistinctPrimeSumText(code, positions);
    if (candidate.id === 'T1-13') {
      const factorial = FACTORIAL_DIGITS.has(code[positions[0]]);
      return positions.length === 1 && candidate.details.factorial === factorial && Array.isArray(candidate.details.allowedValues) && candidate.details.allowedValues.includes(code[positions[0]]) && candidate.text === tier1FactorialText(code, positions);
    }
    if (candidate.id === 'T1-14') return positions.length === 1 && candidate.details.triangular === TRIANGULAR_DIGITS.has(code[positions[0]]) && candidate.text === tier1TriangularText(code, positions);
    if (candidate.id === 'T2-01') return positions.length === 2 && positions[0] !== positions[1] && candidate.text === comparisonText(code, positions);
    if (candidate.id === 'T2-02') {
      const sum = code[positions[0]] + code[positions[1]];
      return positions.length === 2 && candidate.details.sum === sum && candidate.details.square === SQUARE_SUMS.has(sum) && candidate.text === tier2SumSquareText(code, positions);
    }
    if (candidate.id === 'T2-03') {
      const difference = Math.abs(code[positions[0]] - code[positions[1]]);
      return positions.length === 2 && candidate.details.difference === difference && candidate.details.square === SQUARE_SUMS.has(difference) && candidate.text === tier2DifferenceSquareText(code, positions);
    }
    if (candidate.id === 'T2-04') return positions.length === 2 && candidate.details.sameParity === (code[positions[0]] % 2 === code[positions[1]] % 2) && candidate.text === tier2ParityText(code, positions);
    if (candidate.id === 'T2-06') return positions.length === 2 && candidate.text === tier2DifferenceParityText(code, positions);
    if (candidate.id === 'T2-07') {
      const product = code[positions[0]] * code[positions[1]];
      const square = Number.isInteger(Math.sqrt(product));
      return positions.length === 2 && candidate.details.product === product && candidate.details.square === square && candidate.text === tier2ProductSquareText(code, positions);
    }
    if (candidate.id === 'T2-08') return positions.length === 2 && Math.abs(code[positions[0]] - code[positions[1]]) === 1 && candidate.text === tier2NeighborText(positions);
    if (candidate.id === 'T2-09') {
      const firstValue = code[positions[0]];
      const secondValue = code[positions[1]];
      const ratioDirection = firstValue === secondValue * 2 ? 'double' : 'half';
      return positions.length === 2 && firstValue !== secondValue && (firstValue === secondValue * 2 || secondValue === firstValue * 2) && candidate.details.ratioDirection === ratioDirection && candidate.text === tier2DoubleHalfText(code, positions);
    }
    if (candidate.id === 'T2-10') {
      const sum = code[positions[0]] + code[positions[1]];
      return positions.length === 2 && candidate.details.sum === sum && candidate.details.fibonacci === FIBONACCI_SUMS.has(sum) && candidate.text === tier2SumFibonacciText(code, positions);
    }
    if (candidate.id === 'T2-11') {
      const dividend = code[positions[0]];
      const divisor = code[positions[1]];
      return positions.length === 2 && divisor !== 0 && dividend !== divisor && dividend % divisor === 0 && dividend / divisor >= 2 && candidate.details.dividend === dividend && candidate.details.divisor === divisor && candidate.details.quotient === dividend / divisor && candidate.text === tier2DivisibilityText(positions);
    }
    if (candidate.id === 'T2-12') {
      const composedNumber = code[positions[0]] * 10 + code[positions[1]];
      const square = Number.isInteger(Math.sqrt(composedNumber));
      return positions.length === 2 && code[positions[0]] !== 0 && candidate.details.composedNumber === composedNumber && candidate.details.square === square && candidate.text === tier2ComposedSquareText(code, positions);
    }
    if (candidate.id === 'T2-13') {
      const difference = Math.abs(code[positions[0]] - code[positions[1]]);
      return positions.length === 2 && candidate.details.difference === difference && candidate.text === tier2DifferencePrimeText(code, positions);
    }
    if (candidate.id === 'T2-14') return positions.length === 2 && candidate.details.equal === (code[positions[0]] === code[positions[1]]) && candidate.text === tier2EqualityText(code, positions);
    if (candidate.id === 'T2-15') return positions.length === 2 && positions[0] + positions[1] === code.length - 1 && positions[0] !== 5 && Math.abs(code[positions[0]] - 5) === Math.abs(code[positions[1]] - 5) && candidate.text === tier2MirrorDistanceText(positions);
    if (candidate.id === 'T2-16') {
      const sum = code[positions[0]] + code[positions[1]];
      return positions.length === 2 && candidate.details.sum === sum && candidate.details.prime === PRIME_SUMS.has(sum) && candidate.text === tier2SumPrimeText(code, positions);
    }
    if (candidate.id === 'T3-01') return positions.length === 3 && candidate.text === tier3SumComparisonText(code, positions);
    if (candidate.id === 'T3-02') {
      const ascending = code[positions[0]] < code[positions[1]] && code[positions[1]] < code[positions[2]];
      const descending = code[positions[0]] > code[positions[1]] && code[positions[1]] > code[positions[2]];
      return positions.length === 3 && (ascending || descending) && candidate.text === tier3OrderText(code, positions);
    }
    if (candidate.id === 'T3-03') {
      const product = code[positions[0]] * code[positions[1]];
      const comparison = relation(product, code[positions[2]]);
      return positions.length === 3 && candidate.details.product === product && candidate.details.comparison === comparison && candidate.text === tier3ProductComparisonText(code, positions);
    }
    if (candidate.id === 'T3-04') {
      const values = positions.map(position => code[position]);
      const exactlyTwoEqual = new Set(values).size === 2 && values.some(value => values.filter(otherValue => otherValue === value).length === 2);
      return positions.length === 3 && exactlyTwoEqual && candidate.text === tier3ExactlyTwoEqualText(positions);
    }
    if (candidate.id === 'T3-06') {
      const firstDistance = code[positions[1]] - code[positions[0]];
      const secondDistance = code[positions[2]] - code[positions[1]];
      return positions.length === 3 && firstDistance === secondDistance && firstDistance !== 0 && candidate.text === tier3ArithmeticSequenceText(positions);
    }
    if (candidate.id === 'T3-07') {
      const targetPosition = positions[0];
      const lowerPosition = positions[1];
      const upperPosition = positions[2];
      return positions.length === 3 && new Set(positions).size === 3 && code[lowerPosition] < code[targetPosition] && code[targetPosition] < code[upperPosition] && code[lowerPosition] !== code[upperPosition] && candidate.details.targetPosition === targetPosition && candidate.details.lowerPosition === lowerPosition && candidate.details.upperPosition === upperPosition && candidate.text === tier3StrictBetweenText(positions);
    }
    if (candidate.id === 'T3-08') {
      const difference = Math.abs(code[positions[0]] - code[positions[1]]);
      const comparison = relation(difference, code[positions[2]]);
      return positions.length === 3 && candidate.details.difference === difference && candidate.details.comparison === comparison && candidate.text === tier3DifferenceComparisonText(code, positions);
    }
    if (candidate.id === 'T3-09') {
      const composedNumber = code[positions[0]] * 100 + code[positions[1]] * 10 + code[positions[2]];
      const palindrome = code[positions[0]] === code[positions[2]];
      return positions.length === 3 && code[positions[0]] !== 0 && candidate.details.composedNumber === composedNumber && candidate.details.palindrome === palindrome && candidate.text === tier3ComposedPalindromeText(code, positions);
    }
    if (candidate.id === 'T3-10') return positions.length === 3 && code[positions[0]] + code[positions[1]] === code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.text === tier3ExactSumText(positions);
    if (candidate.id === 'T3-11') return positions.length === 3 && Math.abs(code[positions[0]] - code[positions[1]]) === code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.text === tier3ExactDifferenceText(positions);
    if (candidate.id === 'T3-12') return positions.length === 3 && code[positions[0]] !== code[positions[1]] && code[positions[0]] + code[positions[1]] === 2 * code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.text === tier3AverageText(positions);
    if (candidate.id === 'T3-13') {
      const values = positions.map(position => code[position]);
      const distance = Math.max(...values) - Math.min(...values);
      return positions.length === 3 && distance > 0 && candidate.details.distance === distance && candidate.details.prime === PRIME_DIGITS.has(distance) && candidate.text === tier3RangePrimeText(code, positions);
    }
    if (candidate.id === 'T3-14') {
      const sides = positions.map(position => code[position]).sort((first, second) => first - second);
      return positions.length === 3 && sides[0] > 0 && sides[0] + sides[1] > sides[2] && candidate.text === tier3TriangleText(positions);
    }
    if (candidate.id === 'T3-15') {
      const sum = positions.reduce((total, position) => total + code[position], 0);
      return positions.length === 3 && candidate.details.sum === sum && candidate.details.parity === (sum % 2 === 0 ? 'even' : 'odd') && candidate.text === tier3SumParityText(code, positions);
    }
    if (candidate.id === 'T3-16') {
      const product = code[positions[0]] * code[positions[1]];
      return positions.length === 3 && product % 10 === code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.details.product === product && candidate.details.lastDigit === code[positions[2]] && candidate.text === tier3ProductDigitText(positions);
    }
    if (candidate.id === 'T3-17') {
      if (positions.length !== 3 || !['productPlus', 'productMinus'].includes(candidate.details.variant)) return false;
      const evaluation = l054PointBeforeEvaluation(code[positions[0]], code[positions[1]], code[positions[2]], candidate.details.variant);
      const expectedInformation = l054ExactInformation(candidate.details.variant, evaluation.result);
      return code[positions[0]] >= 2 && code[positions[1]] >= 2 && code[positions[2]] >= 1 && evaluation.didacticallyValid && evaluation.result >= 0 && evaluation.result <= L054_MAX_RESULT && candidate.details.result === evaluation.result && candidate.details.leftToRightResult === evaluation.leftToRightResult && candidate.details.termPosition === positions[2] && candidate.details.factorPositions.join('-') === positions.slice(0, 2).join('-') && candidate.details.informationExclusionPercent === expectedInformation && expectedInformation >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier3PointBeforeText(positions, candidate.details.variant, evaluation.result);
    }
    if (candidate.id === 'T3-18') {
      if (positions.length !== 3 || !['groupedPlus', 'groupedMinus'].includes(candidate.details.variant)) return false;
      const groupedValue = candidate.details.variant === 'groupedPlus' ? code[positions[0]] + code[positions[1]] : code[positions[0]] - code[positions[1]];
      const result = groupedValue * code[positions[2]];
      const expectedInformation = l054ExactInformation(candidate.details.variant, result);
      return code[positions[2]] >= 2 && groupedValue > 0 && result <= L054_MAX_RESULT && candidate.details.result === result && candidate.details.multiplierPosition === positions[2] && candidate.details.operandPositions.join('-') === positions.slice(0, 2).join('-') && candidate.details.informationExclusionPercent === expectedInformation && expectedInformation >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier3ParenthesesText(positions, candidate.details.variant, result);
    }
    if (candidate.id === 'T3-19') {
      const product = code[positions[0]] * code[positions[1]];
      const digitSum = l054DigitSum(product);
      return positions.length === 3 && product >= 10 && digitSum <= 9 && digitSum === code[positions[2]] && candidate.details.product === product && candidate.details.digitSum === digitSum && candidate.details.targetPosition === positions[2] && candidate.details.informationExclusionPercent === L054_PRODUCT_DIGIT_SUM_EXCLUSION_PERCENT && L054_PRODUCT_DIGIT_SUM_EXCLUSION_PERCENT >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier3ProductDigitSumText(positions);
    }
    if (candidate.id === 'T3-20') {
      const composedNumber = code[positions[0]] * 10 + code[positions[1]];
      const divisor = candidate.details.divisor;
      const validNumbers = L054_DIVISORS.includes(divisor) ? Math.floor(99 / divisor) - Math.floor(9 / divisor) : 100;
      const expectedInformation = l054ExclusionPercent(validNumbers, 100);
      return positions.length === 2 && code[positions[0]] !== 0 && divisor !== 0 && divisor !== 1 && L054_DIVISORS.includes(divisor) && composedNumber % divisor === 0 && candidate.details.composedNumber === composedNumber && candidate.details.informationExclusionPercent === expectedInformation && expectedInformation >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier3ComposedDivisibilityText(positions, divisor);
    }
    if (candidate.id === 'T4-01') {
      const isPalindrome = positions.length >= 4 && positions.every((position, index) => code[position] === code[positions[positions.length - 1 - index]]);
      return isPalindrome && candidate.text === palindromeText(positions);
    }
    if (candidate.id === 'T4-02') return positions.length === 4 && candidate.text === pairSumComparisonText(code, positions);
    if (candidate.id === 'T4-03') {
      const firstPairSum = code[positions[0]] + code[positions[1]];
      const secondPairSum = code[positions[2]] + code[positions[3]];
      return positions.length === 4 && candidate.details.firstPairSum === firstPairSum && candidate.details.secondPairSum === secondPairSum && candidate.details.sameParity === (firstPairSum % 2 === secondPairSum % 2) && candidate.text === tier4PairSumParityText(code, positions);
    }
    if (candidate.id === 'T4-04') return positions.length === 4 && code[positions[0]] === code[positions[2]] && code[positions[1]] === code[positions[3]] && code[positions[0]] !== code[positions[1]] && candidate.text === tier4AbabText(positions);
    if (candidate.id === 'T4-05') {
      const firstDistance = Math.abs(code[positions[0]] - code[positions[1]]);
      const secondDistance = Math.abs(code[positions[2]] - code[positions[3]]);
      return positions.length === 4 && firstDistance === secondDistance && firstDistance > 0 && candidate.text === tier4EqualDistancesText(positions);
    }
    if (candidate.id === 'T4-06') {
      const firstProduct = code[positions[0]] * code[positions[1]];
      const secondProduct = code[positions[2]] * code[positions[3]];
      const comparison = relation(firstProduct, secondProduct);
      return positions.length === 4 && candidate.details.firstProduct === firstProduct && candidate.details.secondProduct === secondProduct && candidate.details.comparison === comparison && candidate.text === tier4ProductComparisonText(code, positions);
    }
    if (candidate.id === 'T4-07') return positions.length === 4 && code[positions[0]] === code[positions[1]] && code[positions[2]] === code[positions[3]] && code[positions[0]] !== code[positions[2]] && candidate.details.pattern === 'A-A-B-B' && candidate.text === tier4AabbText(positions);
    if (candidate.id === 'T4-08') {
      const firstGroup = candidate.details.firstGroup;
      const secondGroup = candidate.details.secondGroup;
      if (!Array.isArray(firstGroup) || !Array.isArray(secondGroup) || firstGroup.concat(secondGroup).join('-') !== positions.join('-')) return false;
      const validSizes = firstGroup.length === 2 && secondGroup.length === 3 || firstGroup.length === 3 && secondGroup.length === 3;
      const allPositions = firstGroup.concat(secondGroup);
      const firstSum = firstGroup.reduce((sum, position) => sum + code[position], 0);
      const secondSum = secondGroup.reduce((sum, position) => sum + code[position], 0);
      return validSizes && new Set(allPositions).size === allPositions.length && firstSum === secondSum && candidate.text === tier4EqualGroupSumsText(firstGroup, secondGroup);
    }
    if (candidate.id === 'T4-09') {
      const frequencies = new Map();
      for (const position of positions) frequencies.set(code[position], (frequencies.get(code[position]) || 0) + 1);
      const counts = Array.from(frequencies.values());
      const hasExactlyOnePair = counts.filter(count => count === 2).length === 1 && counts.every(count => count === 1 || count === 2);
      return positions.length >= 4 && positions.length <= 6 && hasExactlyOnePair && candidate.text === tier4ExactlyOnePairText(positions);
    }
    if (candidate.id === 'T4-10') {
      const values = positions.map(position => code[position]);
      return positions.length === 6 && values[0] === values[3] && values[1] === values[4] && values[2] === values[5] && new Set(values.slice(0, 3)).size >= 2 && candidate.text === tier4AbcAbcText(positions);
    }
    if (candidate.id === 'T4-11') return positions.length >= 4 && positions.length <= 6 && positions.slice(1).every((position, index) => code[positions[index]] < code[position]) && candidate.text === tier4StrictSequenceText(positions, 'ascending');
    if (candidate.id === 'T4-12') return positions.length >= 4 && positions.length <= 6 && positions.slice(1).every((position, index) => code[positions[index]] > code[position]) && candidate.text === tier4StrictSequenceText(positions, 'descending');
    if (candidate.id === 'T4-13') {
      const distance = code[positions[1]] - code[positions[0]];
      return positions.length >= 4 && positions.length <= 6 && distance !== 0 && positions.slice(1).every((position, index) => code[position] - code[positions[index]] === distance) && candidate.details.distance === distance && candidate.text === tier4ArithmeticSequenceText(positions);
    }
    if (candidate.id === 'T4-14') {
      const firstGroup = candidate.details.firstGroup;
      const secondGroup = candidate.details.secondGroup;
      if (!Array.isArray(firstGroup) || !Array.isArray(secondGroup) || firstGroup.concat(secondGroup).join('-') !== positions.join('-')) return false;
      const validSizes = firstGroup.length === 2 && secondGroup.length === 3 || firstGroup.length === 3 && secondGroup.length === 3;
      const firstSum = firstGroup.reduce((sum, position) => sum + code[position], 0);
      const secondSum = secondGroup.reduce((sum, position) => sum + code[position], 0);
      const relationWord = firstSum > secondSum ? 'mehr' : 'weniger';
      return validSizes && new Set(positions).size === positions.length && firstSum !== secondSum && candidate.details.firstSum === firstSum && candidate.details.secondSum === secondSum && candidate.details.relation === relationWord && candidate.text === tier4GroupComparisonText(firstGroup, secondGroup, relationWord);
    }
    if (candidate.id === 'T4-15') {
      const frequency = code.filter(value => value === code[positions[0]]).length;
      return positions.length === 1 && candidate.details.sourcePosition === positions[0] && candidate.details.frequency === frequency && candidate.details.scope === 'entireCode' && candidate.text === tier4CodeFrequencyText(positions, frequency);
    }
    if (candidate.id === 'T4-16') {
      const counts = new Map();
      for (const position of positions) counts.set(code[position], (counts.get(code[position]) || 0) + 1);
      const frequencies = Array.from(counts.values());
      return positions.length >= 4 && positions.length <= 6 && frequencies.filter(count => count === 2).length === 2 && frequencies.every(count => count === 1 || count === 2) && candidate.text === tier4TwoPairsText(positions);
    }
    if (candidate.id === 'T4-17') return positions.length >= 4 && positions.length <= 6 && new Set(positions.map(position => code[position])).size === positions.length && candidate.text === tier4AllDifferentText(positions);
    if (candidate.id === 'T4-18') {
      const firstSum = code[positions[0]] + code[positions[5]];
      const secondSum = code[positions[1]] + code[positions[4]];
      const thirdSum = code[positions[2]] + code[positions[3]];
      return positions.length === 6 && firstSum === secondSum && secondSum === thirdSum && candidate.details.pairSum === firstSum && candidate.text === tier4ThreePairSumsText(positions);
    }
    if (candidate.id === 'T4-19') {
      const difference = Math.abs(code[positions[0]] + code[positions[1]] - code[positions[3]] - code[positions[4]]);
      return positions.length === 5 && difference === code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.details.difference === difference && candidate.text === tier4PairSumDifferenceText(positions);
    }
    if (candidate.id === 'T4-20') {
      const oddPositions = Array.from({ length: code.length }, (_, index) => index).filter(index => index % 2 === 0);
      const evenPositions = Array.from({ length: code.length }, (_, index) => index).filter(index => index % 2 === 1);
      const oddPositionSum = oddPositions.reduce((sum, position) => sum + code[position], 0);
      const evenPositionSum = evenPositions.reduce((sum, position) => sum + code[position], 0);
      const comparison = relation(oddPositionSum, evenPositionSum);
      return positions.length === code.length && positions.join('-') === oddPositions.concat(evenPositions).join('-') && candidate.details.oddPositions.join('-') === oddPositions.join('-') && candidate.details.evenPositions.join('-') === evenPositions.join('-') && candidate.details.oddPositionSum === oddPositionSum && candidate.details.evenPositionSum === evenPositionSum && candidate.details.comparison === comparison && candidate.details.scope === 'entireCode' && candidate.text === tier4OddEvenPositionSumText(code);
    }
    if (candidate.id === 'T4-21') {
      const sourcePositions = positions.slice(0, -1);
      const targetPosition = positions[positions.length - 1];
      const sourceSum = sourcePositions.reduce((sum, position) => sum + code[position], 0);
      return positions.length >= 4 && positions.length <= 6 && sourceSum % 10 === code[targetPosition] && candidate.details.targetPosition === targetPosition && candidate.details.sourceSum === sourceSum && candidate.details.checkDigit === code[targetPosition] && candidate.text === tier4CheckDigitText(sourcePositions, targetPosition);
    }
    if (candidate.id === 'T4-22') {
      const counts = new Map();
      for (const position of positions) counts.set(code[position], (counts.get(code[position]) || 0) + 1);
      const frequencies = Array.from(counts.values());
      return positions.length >= 4 && positions.length <= 6 && frequencies.filter(count => count === 3).length === 1 && frequencies.every(count => count === 1 || count === 3) && candidate.text === tier4ExactlyThreeEqualText(positions);
    }
    if (candidate.id === 'T4-23') {
      const evaluation = l054MixedComparisonEvaluation(code, positions);
      return positions.length === 6 && code[positions[0]] >= 2 && code[positions[1]] >= 2 && code[positions[2]] >= 1 && code[positions[3]] >= 1 && code[positions[4]] >= 2 && code[positions[5]] >= 2 && evaluation.didacticallyValid && Math.max(evaluation.leftResult, evaluation.rightResult) <= L054_MAX_RESULT && candidate.details.leftResult === evaluation.leftResult && candidate.details.rightResult === evaluation.rightResult && candidate.details.leftToRightLeftResult === evaluation.leftToRightLeftResult && candidate.details.leftToRightRightResult === evaluation.leftToRightRightResult && candidate.details.comparison === evaluation.comparison && candidate.details.leftToRightComparison === evaluation.leftToRightComparison && candidate.details.informationExclusionPercent === L054_MIXED_EXCLUSION_PERCENT && L054_MIXED_EXCLUSION_PERCENT >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier4MixedExpressionComparisonText(positions, evaluation.comparison);
    }
    if (candidate.id === 'T5-01') {
      if (positions.length !== 2 || positions[0] === positions[1] || candidate.details.positionCounting !== 'right') return false;
      const rightPositions = positions.map(position => code.length - position);
      const comparison = relation(code[positions[0]], code[positions[1]]);
      const expectedText = 'Für diesen Hinweis werden die Positionen von rechts gezählt. Die Zahl an Position ' + rightPositions[0] + ' ist ' + comparison + ' als die Zahl an Position ' + rightPositions[1] + '.';
      return candidate.details.rightVisiblePositions.join('-') === rightPositions.join('-') && candidate.details.normalVisiblePositions.join('-') === positions.map(position => position + 1).join('-') && candidate.details.comparison === comparison && candidate.text === expectedText;
    }
    if (candidate.id === 'T5-02') {
      if (positions.length !== 3 || new Set(positions).size !== 3) return false;
      const divisor = code[positions[2]];
      const firstRemainder = divisor > 1 ? code[positions[0]] % divisor : -1;
      const secondRemainder = divisor > 1 ? code[positions[1]] % divisor : -2;
      const expectedText = 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' hinterlassen bei der Teilung durch die Zahl an Position ' + (positions[2] + 1) + ' denselben Rest.';
      return divisor > 1 && code[positions[0]] !== code[positions[1]] && firstRemainder > 0 && firstRemainder === secondRemainder && candidate.details.divisorPosition === positions[2] && candidate.details.divisorValue === divisor && candidate.details.commonRemainder === firstRemainder && candidate.details.firstRemainder === firstRemainder && candidate.details.secondRemainder === secondRemainder && candidate.text === expectedText;
    }
    if (candidate.id === 'T5-03') {
      const derivedPositionByKey = { afterFirstPrime: codewide.afterFirstPrime, beforeLastPrime: codewide.beforeLastPrime, firstEven: codewide.firstEvenPosition, lastOdd: codewide.lastOddPosition, afterFirstMinimum: codewide.firstMinimumPosition < code.length - 1 ? codewide.firstMinimumPosition + 1 : null, beforeLastMaximum: codewide.lastMaximumPosition > 0 ? codewide.lastMaximumPosition - 1 : null, medianFirstPosition: codewide.medianFirstPosition };
      const labelByKey = { afterFirstPrime: 'die Zahl unmittelbar nach der ersten Primzahl', beforeLastPrime: 'die Zahl unmittelbar vor der letzten Primzahl', firstEven: 'die erste gerade Zahl von links', lastOdd: 'die letzte ungerade Zahl von links', afterFirstMinimum: 'die Zahl unmittelbar nach dem ersten Vorkommen des Minimums', beforeLastMaximum: 'die Zahl unmittelbar vor dem letzten Vorkommen des Maximums', medianFirstPosition: 'der Median des Codes an seinem ersten Vorkommen' };
      const keys = candidate.details.derivationKeys;
      if (!Array.isArray(keys) || keys.length !== 3 || new Set(keys).size !== 3 || keys.some(key => !Object.prototype.hasOwnProperty.call(derivedPositionByKey, key))) return false;
      const expectedPositions = keys.map(key => derivedPositionByKey[key]);
      if (expectedPositions.some(position => !Number.isInteger(position)) || new Set(expectedPositions).size !== 3 || expectedPositions.join('-') !== positions.join('-')) return false;
      const values = positions.map(position => code[position]);
      const firstDifference = values[1] - values[0];
      const secondDifference = values[2] - values[1];
      let validPattern = false;
      let patternText = '';
      if (candidate.details.pattern === 'arithmetic') { validPattern = firstDifference !== 0 && firstDifference === secondDifference; patternText = 'bilden in dieser Reihenfolge eine arithmetische Folge mit gleichem, von null verschiedenem Abstand'; }
      else if (candidate.details.pattern === 'ascending') { validPattern = values[0] < values[1] && values[1] < values[2] && !(firstDifference !== 0 && firstDifference === secondDifference); patternText = 'bilden in dieser Reihenfolge eine streng aufsteigende Folge'; }
      else if (candidate.details.pattern === 'descending') { validPattern = values[0] > values[1] && values[1] > values[2] && !(firstDifference !== 0 && firstDifference === secondDifference); patternText = 'bilden in dieser Reihenfolge eine streng absteigende Folge'; }
      else if (candidate.details.pattern === 'firstThirdEqual') { validPattern = values[0] === values[2] && values[0] !== values[1]; patternText = 'besitzen in dieser Reihenfolge denselben ersten und dritten Wert, während der mittlere Wert davon abweicht'; }
      const labels = keys.map(key => labelByKey[key]);
      const expectedText = labels[0].charAt(0).toUpperCase() + labels[0].slice(1) + ', ' + labels[1] + ' und ' + labels[2] + ' ' + patternText + '.';
      return validPattern && candidate.details.derivationLabels.join('|') === labels.join('|') && candidate.details.derivedValues.join('-') === values.join('-') && candidate.codewideDerivations.join('|') === labels.join('|') && candidate.text === expectedText;
    }
    if (candidate.id === 'T5-04') {
      if (positions.length !== 0 || candidate.text !== 'Einer der genannten Hinweise ist falsch!' || candidate.specialRuleType !== 'genau-ein-absichtlich-falscher-hinweis') return false;
      const witnessSignatures = candidate.details.witnessSignatures;
      const witnessTargets = candidate.details.witnessTargetPositions;
      if (!Array.isArray(witnessSignatures) || !Array.isArray(witnessTargets) || witnessSignatures.length !== 3 || witnessTargets.length !== 3 || new Set(witnessTargets).size !== 3 || candidate.details.requiredTrueWitnessCount !== 3 || candidate.details.fairnessProofType !== 'three-strict-between-witnesses') return false;
      const witnesses = witnessSignatures.map(signature => candidateGroups[3]['T3-07'].find(candidate => candidate.signature === signature));
      return witnesses.every((witness, index) => witness && witness.details.targetPosition === witnessTargets[index] && witness.details.lowerPosition === candidate.details.lowerPosition && witness.details.upperPosition === candidate.details.upperPosition && code[witness.details.lowerPosition] < code[witness.details.targetPosition] && code[witness.details.targetPosition] < code[witness.details.upperPosition]);
    }
    return false;
  }

  for (const tier of Object.keys(candidateGroups)) {
    for (const id of Object.keys(candidateGroups[tier])) {
      const uniqueCandidates = new Map();
      for (const candidate of candidateGroups[tier][id]) {
        if (verifyCandidate(candidate)) uniqueCandidates.set(candidate.signature, candidate);
      }
      candidateGroups[tier][id] = Array.from(uniqueCandidates.values());
    }
  }

  let randomState = 2166136261;
  for (const digit of code) {
    randomState ^= digit + 48;
    randomState = Math.imul(randomState, 16777619);
  }
  for (let index = 0; index < GENERATOR_SEED.length; index++) {
    randomState ^= GENERATOR_SEED.charCodeAt(index);
    randomState = Math.imul(randomState, 16777619);
  }
  randomState >>>= 0;
  if (randomState === 0) randomState = 1831565813;

  function random() {
    randomState ^= randomState << 13;
    randomState ^= randomState >>> 17;
    randomState ^= randomState << 5;
    return (randomState >>> 0) / 4294967296;
  }

  function shuffled(values) {
    const result = values.slice();
    for (let index = result.length - 1; index > 0; index--) {
      const target = Math.floor(random() * (index + 1));
      const temporary = result[index];
      result[index] = result[target];
      result[target] = temporary;
    }
    return result;
  }

  function overlapCount(first, second) {
    const used = new Set(first.internalPositions);
    return second.internalPositions.filter(position => used.has(position)).length;
  }

  function samePositionSet(first, second) {
    if (first.internalPositions.length !== second.internalPositions.length) return false;
    const firstPositions = first.internalPositions.slice().sort((a, b) => a - b).join('-');
    const secondPositions = second.internalPositions.slice().sort((a, b) => a - b).join('-');
    return firstPositions === secondPositions;
  }

  function candidatesConflict(first, second) {
    if (first.id === second.id || first.text === second.text || first.signature === second.signature) return true;
    const ids = new Set([first.id, second.id]);
    if (ids.has('T3-CODE-04') && ids.has('T3-CODE-01')) {
      const neighborHint = first.id === 'T3-CODE-01' ? first : second;
      const pairedHint = first.id === 'T3-CODE-04' ? first : second;
      if (neighborHint.details.neighborPosition === pairedHint.details.afterFirstPrime && neighborHint.details.targetPosition === pairedHint.details.beforeLastPrime) return true;
    }
    if (ids.has('T3-CODE-04') && ids.has('T3-CODE-02')) {
      const neighborHint = first.id === 'T3-CODE-02' ? first : second;
      const pairedHint = first.id === 'T3-CODE-04' ? first : second;
      if (neighborHint.details.neighborPosition === pairedHint.details.beforeLastPrime && neighborHint.details.targetPosition === pairedHint.details.afterFirstPrime) return true;
    }
    if (!samePositionSet(first, second)) return false;
    if (first.tier === 1 && second.tier === 1 && first.internalPositions.length === 1) {
      const firstValues = first.details.allowedValues;
      const secondValues = second.details.allowedValues;
      if (Array.isArray(firstValues) && Array.isArray(secondValues) && firstValues.slice().sort().join('-') === secondValues.slice().sort().join('-')) return true;
    }
    const conflictingTypeGroups = [
      ['T1-02', 'T1-05'],
      ['T1-03', 'T1-07'],
      ['T1-13', 'T1-12'],
      ['T1-CODE-01', 'T1-CODE-02'],
      ['T1-CODE-03', 'T1-CODE-04'],
      ['T2-02', 'T2-10'],
      ['T2-02', 'T2-15'],
      ['T2-02', 'T2-16'],
      ['T2-03', 'T2-06'],
      ['T2-03', 'T2-13'],
      ['T2-04', 'T2-06'],
      ['T2-06', 'T2-13'],
      ['T2-10', 'T2-15'],
      ['T2-10', 'T2-16'],
      ['T2-01', 'T2-14'],
      ['T2-14', 'T2-15'],
      ['T2-09', 'T2-11'],
      ['T2-CODE-01', 'T2-CODE-03'],
      ['T3-01', 'T3-10'],
      ['T3-02', 'T3-06'],
      ['T3-02', 'T3-07'],
      ['T3-06', 'T3-07'],
      ['T3-06', 'T3-12'],
      ['T3-03', 'T3-16'],
      ['T3-08', 'T3-11'],
      ['T4-08', 'T4-14'],
      ['T4-11', 'T4-12'],
      ['T4-11', 'T4-13'],
      ['T4-12', 'T4-13'],
      ['T4-11', 'T4-17'],
      ['T4-12', 'T4-17'],
      ['T4-CODE-01', 'T4-CODE-06'],
      ['T5-01', 'T2-01'],
      ['T5-03', 'T3-02'],
      ['T5-03', 'T3-06'],
      ['T5-03', 'T3-12'],
      ['T5-03', 'T4-CODE-04'],
      ['T3-17', 'T3-18'],
      ['T3-17', 'T3-19'],
      ['T3-18', 'T3-19'],
      ['T3-17', 'T3-03'],
      ['T3-17', 'T3-10'],
      ['T3-17', 'T3-16'],
      ['T3-18', 'T3-03'],
      ['T3-18', 'T3-10'],
      ['T3-18', 'T3-16'],
      ['T3-19', 'T3-03'],
      ['T3-19', 'T3-16'],
      ['T3-20', 'T2-12'],
    ];
    return conflictingTypeGroups.some(group => group.includes(first.id) && group.includes(second.id));
  }

  const positionUsage = Array(code.length).fill(0);

  function usageScore(candidate) {
    if (candidate.internalPositions.length === 0) return 0;
    return candidate.internalPositions.reduce((score, position) => score + positionUsage[position], 0) / candidate.internalPositions.length;
  }

  function typeVarietyPenalty(candidate) {
    return stableTextHash('type-variety|' + candidate.tier + '|' + candidate.id + '|' + code.join('')) % 25;
  }

  const SHORT_HINT_MAX_CHARS = 82;
  const MEDIUM_HINT_MAX_CHARS = 132;
  const MAX_TIER_5_HINTS = 1;
  const EXPLICIT_LONG_HINT_IDS = new Set(['T4-08', 'T4-14', 'T4-20', 'T4-CODE-01', 'T4-CODE-02', 'T4-CODE-03', 'T4-CODE-04', 'T4-CODE-07', 'T5-01', 'T5-03']);

  function classifyHintLength(candidate) {
    const visibleLength = candidate.text.replace(/\s+/g, ' ').trim().length;
    if (candidate.id === 'T5-04') return 'kurz';
    if (EXPLICIT_LONG_HINT_IDS.has(candidate.id) || visibleLength > MEDIUM_HINT_MAX_CHARS) return 'lang';
    if (candidate.tier === 5) return 'mittel';
    if (visibleLength > SHORT_HINT_MAX_CHARS) return 'mittel';
    return 'kurz';
  }

  function lengthPairAllowed(first, second) {
    const classes = [first.lengthClass, second.lengthClass];
    if (classes[0] === 'lang' && classes[1] === 'lang') return false;
    if (classes.includes('lang')) return classes.includes('kurz');
    return true;
  }

  const tierPools = {};
  for (let tier = 1; tier <= 5; tier++) {
    tierPools[tier] = [];
    for (const id of Object.keys(candidateGroups[tier] || {})) {
      const groupCandidates = candidateGroups[tier][id];
      const orderedCandidates = L054_HINT_IDS.has(id)
        ? groupCandidates.slice().sort((first, second) => stableTextHash('l054-pool|' + first.signature) - stableTextHash('l054-pool|' + second.signature) || first.signature.localeCompare(second.signature))
        : shuffled(groupCandidates);
      const candidates = orderedCandidates
        .filter(candidate => estimateInformationExclusionPercent(candidate) >= MIN_HINT_EXCLUSION_PERCENT && !hintDistinctness.EXCLUDED_IDS.has(candidate.id))
        .sort((first, second) => second.informationStrength - first.informationStrength)
        .slice(0, settings.extended ? 36 : 18);
      for (const candidate of candidates) {
        candidate.lengthClass = classifyHintLength(candidate);
        tierPools[tier].push(candidate);
      }
    }
  }
  if (settings.extended && typeof settings.timingSink === 'function') {
    settings.timingSink('poolReady');
  }

  if (settings.mode === 'candidateAudit') {
    const generatedCandidates = Object.values(candidateGroups).flatMap(groups => Object.values(groups).flat());
    const rejectedCandidates = generatedCandidates.filter(candidate => estimateInformationExclusionPercent(candidate) < MIN_HINT_EXCLUSION_PERCENT);
    const rejectedById = {};
    for (const candidate of rejectedCandidates) rejectedById[candidate.id] = (rejectedById[candidate.id] || 0) + 1;
    return { generatedCandidateCount: generatedCandidates.length, acceptedCandidateCount: generatedCandidates.length - rejectedCandidates.length, rejectedCandidateCount: rejectedCandidates.length, rejectedById };
  }
  if (settings.mode === 'candidates') return Object.values(tierPools).flat();

  const TIER_5_RARITY_DIVISOR = 10;
  const tier5RarityBucket = stableTextHash('tier5-rarity|' + GENERATOR_SEED + '|' + code.join('')) % TIER_5_RARITY_DIVISOR;
  const tier5Available = TIER_5_UNLOCKED && tier5RarityBucket === 0 && tierPools[5].length > 0;
  const tier5TypeOrderBase = Object.keys(candidateGroups[5]);
  const tier5TypeRotation = (code.reduce((sum, value, index) => sum + value * (index + 1), 0) + stableTextHash('tier5-type|' + GENERATOR_SEED)) % tier5TypeOrderBase.length;
  const tier5TypeOrder = tier5TypeOrderBase.slice(tier5TypeRotation).concat(tier5TypeOrderBase.slice(0, tier5TypeRotation));
  const packageTierPatterns = [
    [[2, 1], [1, 2], [2, 2], [1, 1], [2, 3]],
    [[1, 3], [2, 3], [1, 2], [2, 2], [3, 3]],
    [[2, 3], [3, 2], [2, 4], [3, 3], [3, 4]],
    [[3, 4], [2, 4], [3, 3], [2, 3], [4, 4]],
    (tier5Available ? [[5, 2], [2, 5]] : []).concat([[3, 4], [4, 3], [3, 3], [2, 4], [4, 2]])
  ];
  const selected = [];
  const usedIds = new Set();
  const usedTexts = new Set();
  const usedSignatures = new Set();
  let repeatedTypeFallbackUsed = false;

  function conflictsWithPrevious(candidate, allowRepeatedIds) {
    if (usedTexts.has(candidate.text) || usedSignatures.has(candidate.signature)) return true;
    for (const previous of selected) {
      if (candidate.id !== 'T5-04' && previous.id !== 'T5-04' && !hintDistinctness.pairIsDistinct(candidate, previous, code, qualityCache)) return true;
      if (previous.id === candidate.id) {
        if (!allowRepeatedIds || samePositionSet(previous, candidate)) return true;
        continue;
      }
      if (candidatesConflict(previous, candidate)) return true;
    }
    return false;
  }

  function shuffledSelectionPool(source) {
    const existing = source.filter(candidate => !L054_HINT_IDS.has(candidate.id));
    const additions = source.filter(candidate => L054_HINT_IDS.has(candidate.id))
      .sort((first, second) => stableTextHash('l054-selection|' + first.signature) - stableTextHash('l054-selection|' + second.signature) || first.signature.localeCompare(second.signature));
    return shuffled(existing).concat(additions);
  }

  function selectPackage(packageIndex, requiredId) {
    const patterns = packageTierPatterns[packageIndex];
    for (const allowRepeatedIds of [false, true]) {
      for (let patternIndex = 0; patternIndex < patterns.length; patternIndex++) {
        const pattern = patterns[patternIndex];
        const rankCandidate = candidate => usageScore(candidate) * 14 + (candidate.lengthClass === 'lang' ? 6 : candidate.lengthClass === 'mittel' ? 3 : 0) - candidate.informationStrength + candidate.selectionPriority + typeVarietyPenalty(candidate) + (candidate.tier === 5 ? tier5TypeOrder.indexOf(candidate.id) * 1000 : 0);
        const firstSource = requiredId ? tierPools[pattern[0]].filter(candidate => candidate.id === requiredId) : tierPools[pattern[0]];
        const firstPool = shuffledSelectionPool(firstSource).sort((first, second) => rankCandidate(first) - rankCandidate(second)).slice(0, 48);
        const secondPool = shuffledSelectionPool(tierPools[pattern[1]]).sort((first, second) => rankCandidate(first) - rankCandidate(second)).slice(0, 48);
        let bestPair = null;
        let bestScore = Number.POSITIVE_INFINITY;
        for (const first of firstPool) {
          if (requiredId && first.id !== requiredId) continue;
          if (first.tier === 5 && selected.some(candidate => candidate.tier === 5)) continue;
          if (!allowRepeatedIds && usedIds.has(first.id)) continue;
          if (conflictsWithPrevious(first, allowRepeatedIds)) continue;
          for (const second of secondPool) {
            if (first === second || first.id === second.id || first.text === second.text || first.signature === second.signature) continue;
            if (second.tier === 5 && (first.tier === 5 || selected.some(candidate => candidate.tier === 5))) continue;
            if (!allowRepeatedIds && usedIds.has(second.id)) continue;
            if (conflictsWithPrevious(second, allowRepeatedIds) || candidatesConflict(first, second) || !lengthPairAllowed(first, second) || first.id !== 'T5-04' && second.id !== 'T5-04' && !hintDistinctness.pairIsDistinct(first, second, code, qualityCache)) continue;
            const overlap = overlapCount(first, second);
            const lengthPenalty = first.lengthClass === 'lang' || second.lengthClass === 'lang' ? 6 : first.lengthClass === 'mittel' && second.lengthClass === 'mittel' ? 4 : 0;
            const tier5TypePenalty = (first.tier === 5 ? tier5TypeOrder.indexOf(first.id) * 1000 : 0) + (second.tier === 5 ? tier5TypeOrder.indexOf(second.id) * 1000 : 0);
            const score = patternIndex * 10000 + overlap * 8 + (usageScore(first) + usageScore(second)) * 14 + lengthPenalty + tier5TypePenalty - first.informationStrength - second.informationStrength + first.selectionPriority + second.selectionPriority + typeVarietyPenalty(first) + typeVarietyPenalty(second);
            if (score < bestScore) {
              bestPair = [first, second];
              bestScore = score;
            }
          }
        }
        if (!bestPair) continue;
        if (allowRepeatedIds) repeatedTypeFallbackUsed = true;
        for (let position = 0; position < bestPair.length; position++) {
          const candidate = bestPair[position];
          candidate.packageNumber = packageIndex + 1;
          candidate.packagePosition = position + 1;
          selected.push(candidate);
          usedIds.add(candidate.id);
          usedTexts.add(candidate.text);
          usedSignatures.add(candidate.signature);
          for (const internalPosition of candidate.internalPositions) positionUsage[internalPosition]++;
        }
        return;
      }
    }
    throw new Error('Paket ' + (packageIndex + 1) + ' konnte nicht mit zwei gültigen Hinweisen gefüllt werden.');
  }

  function verifyIntentionallyFalseComparison(candidate) {
    if (!candidate || candidate.id !== 'T2-01' || candidate.truth !== false || candidate.intentionallyFalse !== true || candidate.internalPositions.length !== 2) return false;
    const firstPosition = candidate.internalPositions[0];
    const secondPosition = candidate.internalPositions[1];
    if (firstPosition === secondPosition || code[firstPosition] >= code[secondPosition]) return false;
    const expectedFalseText = 'Die Zahl an Position ' + (firstPosition + 1) + ' ist größer als die Zahl an Position ' + (secondPosition + 1) + '.';
    return candidate.text === expectedFalseText && candidate.details.actualRelation === 'kleiner' && candidate.details.falseRelation === 'größer' && candidate.details.independentlyConfirmedFalse === true;
  }

  function applyT504Structure() {
    const metaIndex = selected.findIndex(candidate => candidate.id === 'T5-04');
    if (metaIndex < 0) return;
    const metaCandidate = selected[metaIndex];
    const witnessCandidates = metaCandidate.details.witnessSignatures.map(signature => candidateGroups[3]['T3-07'].find(candidate => candidate.signature === signature));
    if (witnessCandidates.some(candidate => !candidate || !verifyCandidate(candidate))) throw new Error('T5-04 wurde verworfen: Die drei unabhängigen Zwischenhinweise sind nicht vollständig wahr.');
    for (const witness of witnessCandidates) witness.lengthClass = classifyHintLength(witness);

    const packageIndexes = [1, 2, 3];
    const assignedWitnesses = new Set();
    const assignedPackages = new Set();
    for (const packageIndex of packageIndexes) {
      for (let slot = 0; slot < 2; slot++) {
        const selectedIndex = packageIndex * 2 + slot;
        const witnessIndex = witnessCandidates.findIndex(candidate => candidate.signature === selected[selectedIndex].signature);
        if (witnessIndex >= 0 && !assignedWitnesses.has(witnessIndex)) {
          assignedWitnesses.add(witnessIndex);
          assignedPackages.add(packageIndex);
        }
      }
    }
    const remainingWitnessIndexes = witnessCandidates.map((candidate, index) => index).filter(index => !assignedWitnesses.has(index));
    const remainingPackages = packageIndexes.filter(packageIndex => !assignedPackages.has(packageIndex));
    if (remainingWitnessIndexes.length !== remainingPackages.length) throw new Error('T5-04 wurde verworfen: Die Fairness-Hinweise lassen sich nicht eindeutig auf drei Pakete verteilen.');
    for (let index = 0; index < remainingPackages.length; index++) {
      const packageIndex = remainingPackages[index];
      const witness = witnessCandidates[remainingWitnessIndexes[index]];
      const firstIndex = packageIndex * 2;
      const packageCandidates = [selected[firstIndex], selected[firstIndex + 1]];
      const preferredSlot = packageCandidates.findIndex(candidate => candidate.id === 'T3-07');
      const longSlot = packageCandidates.findIndex(candidate => candidate.lengthClass === 'lang');
      const slotOrder = Array.from(new Set([preferredSlot, longSlot, 0, 1].filter(slot => slot >= 0)));
      const replaceSlot = slotOrder.find(slot => { const partner = packageCandidates[slot === 0 ? 1 : 0]; return partner.id !== witness.id && !candidatesConflict(witness, partner) && lengthPairAllowed(witness, partner); });
      if (!Number.isInteger(replaceSlot)) throw new Error('T5-04 wurde verworfen: Ein Fairness-Hinweis verletzt die Typ-, Doppelungs- oder Längenregel seines Pakets.');
      selected[firstIndex + replaceSlot] = Object.assign({}, witness, { packageNumber: packageIndex + 1, packagePosition: replaceSlot + 1 });
    }

    const lowerPosition = metaCandidate.details.lowerPosition;
    const upperPosition = metaCandidate.details.upperPosition;
    const originalTrueText = comparisonText(code, [lowerPosition, upperPosition]);
    const falseText = 'Die Zahl an Position ' + (lowerPosition + 1) + ' ist größer als die Zahl an Position ' + (upperPosition + 1) + '.';
    const comparisonIndex = settings.rankSelector ? 1 : 0;
    const originalComparison = selected[comparisonIndex];
    const falseCandidate = Object.assign({}, originalComparison, {
      internalPositions: [lowerPosition, upperPosition],
      visiblePositions: [lowerPosition + 1, upperPosition + 1],
      positionOrder: [lowerPosition, upperPosition],
      positionRoles: ['Tatsächlich kleinere Position', 'Tatsächlich größere Position'],
      text: falseText,
      canonicalText: falseText,
      signature: 'T5-04-FALSE|T2-01|' + lowerPosition + '-' + upperPosition,
      truth: false,
      intentionallyFalse: true,
      specialRuleType: 'absichtlich-falscher-vergleich-fuer-T5-04',
      independentValidation: true,
      details: { actualRelation: 'kleiner', falseRelation: 'größer', originalTrueText, falseText, independentlyConfirmedFalse: true, metaHintId: 'T5-04' },
      mathematicalRule: 'Für T5-04 wird der nachweislich wahre Kleiner-Vergleich plausibel, aber absichtlich falsch als Größer-Vergleich ausgegeben.'
    });
    falseCandidate.lengthClass = classifyHintLength(falseCandidate);
    if (!verifyIntentionallyFalseComparison(falseCandidate)) throw new Error('T5-04 wurde verworfen: Der umgekehrte Vergleich ist nicht unabhängig als falsch bestätigt.');
    selected[comparisonIndex] = falseCandidate;

    const otherTrueHints = selected.filter((candidate, index) => index !== metaIndex && index !== comparisonIndex);
    metaCandidate.details = Object.assign({}, metaCandidate.details, { falseHintId: falseCandidate.id, falseHintIndex: comparisonIndex, originalTrueVariant: originalTrueText, generatedFalseVariant: falseText, confirmedFalseTruthValue: false, otherEightHintsTrue: otherTrueHints.length === 8 && otherTrueHints.every(candidate => candidate.truth === true), ...(settings.extended ? {otherTrueHintCount: otherTrueHints.length} : {}), exactlyOneFalse: true, fairnessValidated: true, fairnessReason: 'Drei verschiedene wahre Zwischenhinweise erzwingen dieselbe kleinere und größere Grenze. Wäre der umgekehrte Vergleich wahr, wären alle drei Zwischenhinweise zugleich falsch; daher ist der Vergleich eindeutig der einzige falsche Hinweis.' });
    metaCandidate.fairnessValidated = true;
    metaCandidate.falseHintId = falseCandidate.id;
  }

  function applyLanguageVariants() {
    const usedVisibleTexts = new Set();
    const openingUsage = new Map();
    const templateUsage = new Map();
    let exactPositionOpeningCount = 0;
    let previousOpening = '';

    for (let packageIndex = 0; packageIndex < packageCount; packageIndex++) {
      const firstCandidate = selected[packageIndex * 2];
      const secondCandidate = selected[packageIndex * 2 + 1];
      const firstVariants = languageVariantsForCandidate(firstCandidate, code);
      const secondVariants = languageVariantsForCandidate(secondCandidate, code);
      const combinations = [];

      for (const firstVariant of firstVariants) {
        for (const secondVariant of secondVariants) {
          if (firstVariant.text === secondVariant.text || usedVisibleTexts.has(firstVariant.text) || usedVisibleTexts.has(secondVariant.text)) continue;
          const addedExactOpenings = Number(firstVariant.text.startsWith('Die Zahl an Position')) + Number(secondVariant.text.startsWith('Die Zahl an Position'));
          if (exactPositionOpeningCount + addedExactOpenings >
              (settings.extended ? Math.ceil(packageCount * 2 / 5) : 2)) continue;
          const firstLength = classifyHintLength(Object.assign({}, firstCandidate, { text: firstVariant.text }));
          const secondLength = classifyHintLength(Object.assign({}, secondCandidate, { text: secondVariant.text }));
          if (!lengthPairAllowed({ lengthClass: firstLength }, { lengthClass: secondLength })) continue;
          combinations.push({ firstVariant, secondVariant, firstLength, secondLength });
        }
      }

      if (combinations.length === 0) throw new Error('Für Hinweispaket ' + (packageIndex + 1) + ' wurde keine sprachlich und längenmäßig zulässige Variante gefunden.');
      let eligible = combinations;
      const differentPackageOpenings = eligible.filter(entry => entry.firstVariant.opening !== entry.secondVariant.opening);
      if (differentPackageOpenings.length > 0) eligible = differentPackageOpenings;
      const differentAdjacentOpening = eligible.filter(entry => !previousOpening || entry.firstVariant.opening !== previousOpening);
      if (differentAdjacentOpening.length > 0) eligible = differentAdjacentOpening;

      let best = null;
      let bestScore = Number.POSITIVE_INFINITY;
      for (const entry of eligible) {
        const firstTemplateFamily = entry.firstVariant.id.replace(/-\d+$/, '');
        const secondTemplateFamily = entry.secondVariant.id.replace(/-\d+$/, '');
        const openingPenalty = (openingUsage.get(entry.firstVariant.opening) || 0) + (openingUsage.get(entry.secondVariant.opening) || 0);
        const templatePenalty = (templateUsage.get(firstTemplateFamily) || 0) + (templateUsage.get(secondTemplateFamily) || 0);
        const exactOpeningPenalty = Number(entry.firstVariant.text.startsWith('Die Zahl an Position')) + Number(entry.secondVariant.text.startsWith('Die Zahl an Position'));
        const stableTieBreaker = (entry.firstVariant.stableRank + entry.secondVariant.stableRank) % 1009;
        const score = openingPenalty * 600 + templatePenalty * 180 + exactOpeningPenalty * 250 + stableTieBreaker;
        if (score < bestScore) {
          best = entry;
          bestScore = score;
        }
      }

      const assignments = [
        { candidate: firstCandidate, variant: best.firstVariant, lengthClass: best.firstLength },
        { candidate: secondCandidate, variant: best.secondVariant, lengthClass: best.secondLength }
      ];
      for (const assignment of assignments) {
        assignment.candidate.text = assignment.variant.text;
        assignment.candidate.languageTemplateId = assignment.variant.id;
        assignment.candidate.languageVariantCount = languageVariantsForCandidate(assignment.candidate, code).length;
        assignment.candidate.sentenceOpening = assignment.variant.opening;
        assignment.candidate.lengthClass = assignment.lengthClass;
        usedVisibleTexts.add(assignment.variant.text);
        openingUsage.set(assignment.variant.opening, (openingUsage.get(assignment.variant.opening) || 0) + 1);
        const templateFamily = assignment.variant.id.replace(/-\d+$/, '');
        templateUsage.set(templateFamily, (templateUsage.get(templateFamily) || 0) + 1);
        if (assignment.variant.text.startsWith('Die Zahl an Position')) exactPositionOpeningCount++;
        previousOpening = assignment.variant.opening;
      }
    }

    if (exactPositionOpeningCount > (settings.extended ? Math.ceil(packageCount * 2 / 5) : 2)) throw new Error('Die exakte Satzeröffnung "Die Zahl an Position" wird zu häufig verwendet.');
  }

  function finalizeSelection(beforeEvaluation) {
  if (beforeEvaluation !== undefined &&
      typeof beforeEvaluation !== 'function')
    throw new TypeError('Ungültige Finalisierungszählung.');
  applyT504Structure();
  applyLanguageVariants();
  qualityCache.clear();
  const finalizationSemantics = v4FinalizationCertificates ?
    new Map(selected.map(candidate => [candidate,
      JSON.stringify(candidate)])) : null;

  if (selected.length !== packageCount * 2) throw new Error('Es wurde nicht die gewählte Hinweiszahl erzeugt.');
  if (new Set(selected.map(candidate => candidate.text)).size !== selected.length) throw new Error('Die normalen Hinweispakete enthalten doppelte Texte.');
  const tier5Count = selected.filter(candidate => candidate.tier === 5).length;
  if (!TIER_5_UNLOCKED && tier5Count !== 0) throw new Error('Tier 5 wurde vor seiner Freischaltung ausgewählt.');
  if (tier5Count > MAX_TIER_5_HINTS) throw new Error('Mehr als ein Tier-5-Hinweis wurde ausgewählt.');
  const selectedMetaHint = selected.find(candidate => candidate.id === 'T5-04');
  if (selectedMetaHint) {
    const otherHints = selected.filter(candidate => candidate !== selectedMetaHint);
    const falseHints = otherHints.filter(candidate => candidate.truth === false);
    const trueHints = otherHints.filter(candidate => candidate.truth === true);
    if (selectedMetaHint.text !== 'Einer der genannten Hinweise ist falsch!' || selectedMetaHint.truth !== true || falseHints.length !== 1 || trueHints.length !== packageCount * 2 - 2 || !verifyIntentionallyFalseComparison(falseHints[0]) || selectedMetaHint.fairnessValidated !== true || (settings.extended ? selectedMetaHint.details.otherTrueHintCount !== packageCount * 2 - 2 : selectedMetaHint.details.otherEightHintsTrue !== true) || selectedMetaHint.details.exactlyOneFalse !== true) throw new Error('T5-04 verletzt die Wahrheits- oder Fairnessstruktur des vollständigen Hinweissatzes.');
  } else if (selected.some(candidate => candidate.truth !== true)) throw new Error('Außerhalb von T5-04 wurde ein nicht wahrer Hinweis ausgewählt.');
  for (let packageIndex = 0; packageIndex < packageCount; packageIndex++) {
    const first = selected[packageIndex * 2];
    const second = selected[packageIndex * 2 + 1];
    if (!first || !second || first.packageNumber !== packageIndex + 1 || second.packageNumber !== packageIndex + 1) throw new Error('Ein Hinweispaket ist unvollständig.');
    if (first.id === second.id || (!first.intentionallyFalse && !second.intentionallyFalse && candidatesConflict(first, second)) || !lengthPairAllowed(first, second)) throw new Error('Ein Hinweispaket verletzt Typ-, Doppelungs- oder Längenregeln.');
  }
  for (const candidate of selected) candidate.repeatedTypeFallbackUsed = repeatedTypeFallbackUsed;
  for (let first = 0; first < selected.length; first++) for (let second = first + 1; second < selected.length; second++) {
    const left = selected[first];
    const right = selected[second];
    if (left.id === 'T5-04' || right.id === 'T5-04' || left.intentionallyFalse || right.intentionallyFalse) continue;
    if (v4FinalizationCertificates) {
      const pairSignature = [left.signature, right.signature].sort().join('|');
      const semantics = [
        finalizationSemantics.get(left),
        finalizationSemantics.get(right)
      ].sort();
      const stableKey = JSON.stringify([code.length, code, semantics]);
      if (v4FinalizationCertificates.has(stableKey)) {
        qualityCache.set(pairSignature,
          v4FinalizationCertificates.get(stableKey));
      }
      const distinct = hintDistinctness.pairIsDistinct(left, right,
        code, qualityCache, beforeEvaluation);
      if (!v4FinalizationCertificates.has(stableKey) &&
          v4FinalizationCertificates.size <
            MAX_V4_FINALIZATION_CERTIFICATES) {
        v4FinalizationCertificates.set(stableKey,
          qualityCache.get(pairSignature));
      }
      if (!distinct) throw new Error('Hinweissatz enthält semantisch wiederholte Aussagen.');
      continue;
    }
    if (!hintDistinctness.pairIsDistinct(left, right, code,
      qualityCache, beforeEvaluation)) throw new Error('Hinweissatz enthält semantisch wiederholte Aussagen.');
  }
  return selected;
  }
  if (typeof settings.rankSelector === 'function') {
    return settings.rankSelector({code, tierPools, candidateGroups, selected,
      packageCount,
      tier5Available, candidatesConflict, samePositionSet,
      lengthPairAllowed, classifyHintLength, estimateInformationExclusionPercent,
      languageVariantsForCandidate,
      minimumInformationPercent: MIN_HINT_EXCLUSION_PERCENT,
      toInternalHint}, finalizeSelection);
  }
  selectPackage(0, 'T2-01');
  selectPackage(1);
  selectPackage(2);
  selectPackage(3);
  selectPackage(4);
  return finalizeSelection();
}

const GENERATOR_VERSION = 3;
const ACTIVE_HINT_IDS = Object.freeze([
  "T1-01",
  "T1-02",
  "T1-03",
  "T1-05",
  "T1-06",
  "T1-07",
  "T1-08",
  "T1-09",
  "T1-12",
  "T1-13",
  "T1-14",
  "T1-DIGIT-00",
  "T1-DIGIT-01",
  "T1-DIGIT-02",
  "T1-DIGIT-03",
  "T1-DIGIT-04",
  "T1-DIGIT-05",
  "T1-DIGIT-06",
  "T1-DIGIT-07",
  "T1-DIGIT-08",
  "T1-DIGIT-09",
  "T1-CODE-01",
  "T1-CODE-02",
  "T1-CODE-03",
  "T2-01",
  "T2-02",
  "T2-03",
  "T2-04",
  "T2-06",
  "T2-07",
  "T2-08",
  "T2-09",
  "T2-10",
  "T2-11",
  "T2-12",
  "T2-13",
  "T2-14",
  "T2-15",
  "T2-16",
  "T2-CODE-01",
  "T2-CODE-03",
  "T2-CODE-04",
  "T3-01",
  "T3-02",
  "T3-03",
  "T3-04",
  "T3-06",
  "T3-07",
  "T3-08",
  "T3-09",
  "T3-10",
  "T3-11",
  "T3-12",
  "T3-13",
  "T3-14",
  "T3-15",
  "T3-16",
  "T3-17",
  "T3-18",
  "T3-19",
  "T3-20",
  "T3-CODE-01",
  "T3-CODE-02",
  "T3-CODE-03",
  "T3-CODE-04",
  "T4-01",
  "T4-02",
  "T4-03",
  "T4-04",
  "T4-05",
  "T4-06",
  "T4-07",
  "T4-08",
  "T4-09",
  "T4-10",
  "T4-11",
  "T4-12",
  "T4-13",
  "T4-14",
  "T4-15",
  "T4-16",
  "T4-17",
  "T4-18",
  "T4-19",
  "T4-20",
  "T4-21",
  "T4-22",
  "T4-23",
  "T4-CODE-01",
  "T4-CODE-02",
  "T4-CODE-03",
  "T4-CODE-05",
  "T4-CODE-06",
  "T4-CODE-07",
  "T1-CODE-04",
  "T4-CODE-04",
  "T5-01",
  "T5-02",
  "T5-03",
  "T5-04"
]);
const CONFLICTING_TYPE_GROUPS = Object.freeze([
  [
    "T1-02",
    "T1-05"
  ],
  [
    "T1-03",
    "T1-07"
  ],
  [
    "T1-13",
    "T1-12"
  ],
  [
    "T1-CODE-01",
    "T1-CODE-02"
  ],
  [
    "T1-CODE-03",
    "T1-CODE-04"
  ],
  [
    "T2-02",
    "T2-10"
  ],
  [
    "T2-02",
    "T2-15"
  ],
  [
    "T2-02",
    "T2-16"
  ],
  [
    "T2-03",
    "T2-06"
  ],
  [
    "T2-03",
    "T2-13"
  ],
  [
    "T2-04",
    "T2-06"
  ],
  [
    "T2-06",
    "T2-13"
  ],
  [
    "T2-10",
    "T2-15"
  ],
  [
    "T2-10",
    "T2-16"
  ],
  [
    "T2-01",
    "T2-14"
  ],
  [
    "T2-14",
    "T2-15"
  ],
  [
    "T2-09",
    "T2-11"
  ],
  [
    "T2-CODE-01",
    "T2-CODE-03"
  ],
  [
    "T3-01",
    "T3-10"
  ],
  [
    "T3-02",
    "T3-06"
  ],
  [
    "T3-02",
    "T3-07"
  ],
  [
    "T3-06",
    "T3-07"
  ],
  [
    "T3-06",
    "T3-12"
  ],
  [
    "T3-03",
    "T3-16"
  ],
  [
    "T3-08",
    "T3-11"
  ],
  [
    "T4-08",
    "T4-14"
  ],
  [
    "T4-11",
    "T4-12"
  ],
  [
    "T4-11",
    "T4-13"
  ],
  [
    "T4-12",
    "T4-13"
  ],
  [
    "T4-11",
    "T4-17"
  ],
  [
    "T4-12",
    "T4-17"
  ],
  [
    "T4-CODE-01",
    "T4-CODE-06"
  ],
  [
    "T5-01",
    "T2-01"
  ],
  [
    "T5-03",
    "T3-02"
  ],
  [
    "T5-03",
    "T3-06"
  ],
  [
    "T5-03",
    "T3-12"
  ],
  [
    "T5-03",
    "T4-CODE-04"
  ],
  [
    "T3-17",
    "T3-18"
  ],
  [
    "T3-17",
    "T3-19"
  ],
  [
    "T3-18",
    "T3-19"
  ],
  [
    "T3-17",
    "T3-03"
  ],
  [
    "T3-17",
    "T3-10"
  ],
  [
    "T3-17",
    "T3-16"
  ],
  [
    "T3-18",
    "T3-03"
  ],
  [
    "T3-18",
    "T3-10"
  ],
  [
    "T3-18",
    "T3-16"
  ],
  [
    "T3-19",
    "T3-03"
  ],
  [
    "T3-19",
    "T3-16"
  ],
  [
    "T3-20",
    "T2-12"
  ]
].map((group) => Object.freeze(group)));
const GENERATOR_POLICY = Object.freeze({
  supportedCodeLengths: Object.freeze([8, 10, 12]),
  hintCount: 10,
  packageCount: 5,
  hintsPerPackage: 2,
  maximumTier5Hints: 1,
  tier5RarityDivisor: 10,
  shortHintMaximumCharacters: 82,
  mediumHintMaximumCharacters: 132,
  t504Text: 'Einer der genannten Hinweise ist falsch!',
  minimumHintExclusionPercent: MIN_HINT_EXCLUSION_PERCENT,
  informationFilterVersion: 'visible-semantic-l055b-v1',
});
const INTERNAL_ONLY_FIELDS = Object.freeze([
  'signature', 'truthValue', 'mathematicalRule', 'internalPositions', 'details',
  'specialRule', 'independentValidation', 'codewideDerivations'
]);

function requireInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Generatorparameter fehlen.');
  if (typeof input.solutionCode !== 'string' || !/^(?:\d{8}|\d{10}|\d{12})$/.test(input.solutionCode) || input.codeLength !== input.solutionCode.length) throw new Error('solutionCode und codeLength müssen eine übereinstimmende neue Codelänge besitzen.');
  if (input.generatorVersion !== GENERATOR_VERSION) throw new Error('Generatorversion wird nicht unterstützt.');
  if (typeof input.seed !== 'string' || input.seed.length < 1 || input.seed.length > 256) throw new Error('Seedinformation ist ungültig.');
  if (typeof input.tier5Unlocked !== 'boolean') throw new Error('tier5Unlocked muss ein Boolean sein.');
  return {
    code: [...input.solutionCode].map(Number),
    seed: input.seed,
    tier5Unlocked: input.tier5Unlocked,
  };
}

function requireExtendedInput(input) {
  const packageCount = input?.packageCount;
  if (input?.generatorVersion !== 4 ||
      !Number.isSafeInteger(packageCount) ||
      packageCount < 5 || packageCount > 10) {
    throw new Error('Neue Generatorversion oder Paketanzahl ist ungültig.');
  }
  const settings = requireInput({...input, generatorVersion: GENERATOR_VERSION});
  return {...settings, packageCount, extended: true};
}

function initialComparison(code, seed) {
  const first = stableTextHash('T2-01-a|' + seed + '|' + code.join('')) % code.length;
  const offset = 1 + stableTextHash('T2-01-b|' + seed + '|' + code.join('')) % (code.length - 1);
  const second = (first + offset) % code.length;
  const positions = [first, second];
  return {positions, text: comparisonText(code, positions)};
}

function explanationFor(candidate) {
  let explanationType = 'regelpruefung';
  if (candidate.id === 'T5-04') explanationType = 'genau-ein-falscher-hinweis';
  else if (candidate.id === 'T5-01') explanationType = 'positionszaehlung-von-rechts';
  else if (candidate.id === 'T5-02') explanationType = 'gleicher-teilungsrest';
  else if (candidate.id === 'T5-03') explanationType = 'codeweite-ableitung';
  else if (candidate.id === 'T1-DIGIT-06') explanationType = 'fakultaetsbeziehung';
  else if (candidate.id === 'T3-17') explanationType = 'punkt-vor-strich';
  else if (candidate.id === 'T3-18') explanationType = 'klammerrechnung';
  else if (candidate.id === 'T3-19') explanationType = 'produktquersumme';
  else if (candidate.id === 'T3-20') explanationType = 'zweistellige-teilbarkeit';
  else if (candidate.id === 'T4-23') explanationType = 'gemischter-ausdrucksvergleich';
  else if (candidate.id.includes('-CODE-')) explanationType = 'codeweite-ableitung';
  else if (candidate.internalPositions.length >= 4) explanationType = 'mehrpositionsbeziehung';
  else if (candidate.internalPositions.length >= 2) explanationType = 'positionsbeziehung';
  else explanationType = 'zifferneigenschaft';
  const explanationData = {
    hintId: candidate.id,
    visiblePositions: candidate.visiblePositions.slice(),
    positionRoles: candidate.positionRoles.slice(),
  };
  if (candidate.id.startsWith('T1-DIGIT-')) explanationData.propertyKey = candidate.details.propertyKey;
  if (candidate.id === 'T4-CODE-07') explanationData.derivationKeys = ['smallestEven', 'largestPrime', 'targetPosition'];
  if (candidate.id === 'T4-CODE-04') explanationData.median = candidate.details.median;
  if (candidate.id === 'T3-17' || candidate.id === 'T3-18') {
    explanationData.variant = candidate.details.variant;
    explanationData.result = candidate.details.result;
  }
  if (candidate.id === 'T3-19') explanationData.operation = 'product-then-first-digit-sum';
  if (candidate.id === 'T3-20') explanationData.divisor = candidate.details.divisor;
  if (candidate.id === 'T4-23') explanationData.comparison = candidate.details.comparison;
  return {
    explanationType,
    explanationData,
  };
}

function packageCompatibilityFor(candidate) {
  return {
    lengthClass: candidate.lengthClass,
    conflictChecked: true,
    conflictPolicy: 'active-candidatesConflict-l054-v2',
    duplicateSignatureChecked: true,
    maximumOneTier5: true,
    digitHintsUseNormalTier1Rules: true,
    longHintRequiresShortPartner: true,
  };
}

function toInternalHint(candidate) {
  const explanation = explanationFor(candidate);
  return {
    id: candidate.id,
    tier: candidate.tier,
    text: candidate.text,
    canonicalText: candidate.canonicalText,
    signature: candidate.signature,
    truthValue: candidate.truth,
    mathematicalRule: candidate.mathematicalRule,
    internalPositions: candidate.internalPositions.slice(),
    visiblePositions: candidate.visiblePositions.slice(),
    positionOrder: candidate.positionOrder.slice(),
    positionRoles: candidate.positionRoles.slice(),
    details: structuredClone(candidate.details),
    packageCompatibility: packageCompatibilityFor(candidate),
    lengthClass: candidate.lengthClass,
    specialRule: candidate.specialRuleType,
    explanationType: explanation.explanationType,
    explanationData: explanation.explanationData,
    codewideDerivations: candidate.codewideDerivations.slice(),
    independentValidation: candidate.independentValidation,
    requiresUnlock: candidate.requiresUnlock,
    optional: candidate.optional,
    informationStrength: candidate.informationStrength,
    selectionPriority: candidate.selectionPriority,
    intentionallyFalse: candidate.intentionallyFalse === true,
    fairnessValidated: candidate.fairnessValidated === true,
    packageNumber: candidate.packageNumber || null,
    packagePosition: candidate.packagePosition || null,
    languageTemplateId: candidate.languageTemplateId,
    languageVariantCount: candidate.languageVariantCount,
    sentenceOpening: candidate.sentenceOpening,
    repeatedTypeFallbackUsed: candidate.repeatedTypeFallbackUsed === true,
  };
}

function generateInternalHintSetWithSelector(input, rankSelector) {
  const settings = requireInput(input);
  const comparison = initialComparison(settings.code, settings.seed);
  const candidates = createGenerator(settings.code, comparison,
    rankSelector ? {...settings, rankSelector} : settings);
  const hints = candidates.map(toInternalHint);
  const packages = Array.from({length: 5}, (_, index) => ({
    packageNumber: index + 1,
    hints: hints.filter((hint) => hint.packageNumber === index + 1),
  }));
  if (hints.length !== 10 || packages.some((entry) => entry.hints.length !== 2)) throw new Error('Interne Paketstruktur ist ungültig.');
  return {
    generatorVersion: GENERATOR_VERSION,
    seed: settings.seed,
    tier5Unlocked: settings.tier5Unlocked,
    hintCount: hints.length,
    packageCount: packages.length,
    hints,
    packages,
  };
}

function generateInternalHintSet(input) {
  return generateInternalHintSetWithSelector(input, null);
}

function generateRankInternalHintSet(input, rankSelector) {
  if (typeof rankSelector !== 'function') throw new TypeError('Rangselektor fehlt.');
  return generateInternalHintSetWithSelector(input, rankSelector);
}

function generateExtendedRankInternalHintSet(input, rankSelector, timingSink) {
  if (typeof rankSelector !== 'function') throw new TypeError('Profilselektor fehlt.');
  if (timingSink !== undefined && typeof timingSink !== 'function') {
    throw new TypeError('Zeitmessrückruf ist ungültig.');
  }
  const settings = requireExtendedInput(input);
  const comparison = initialComparison(settings.code, settings.seed);
  const candidates = createGenerator(settings.code, comparison,
    {...settings, rankSelector, timingSink});
  if (timingSink) timingSink('selectorReturned');
  const hints = candidates.map(toInternalHint);
  const packages = Array.from({length: settings.packageCount}, (_, index) => ({
    packageNumber: index + 1,
    hints: hints.filter(hint => hint.packageNumber === index + 1),
  }));
  if (hints.length !== settings.packageCount * 2 ||
      packages.some(entry => entry.hints.length !== 2)) {
    throw new Error('Neue interne Paketstruktur ist ungültig.');
  }
  if (timingSink) timingSink('internalMappingComplete');
  return {generatorVersion: 4, seed: settings.seed,
    tier5Unlocked: settings.tier5Unlocked,
    hintCount: hints.length, packageCount: settings.packageCount,
    hints, packages};
}

function generateHintCandidates(input) {
  const settings = requireInput(input);
  const comparison = initialComparison(settings.code, settings.seed);
  return createGenerator(settings.code, comparison, {...settings, mode: 'candidates'}).map(toInternalHint);
}

function auditHintCandidateFilter(input) {
  const settings = requireInput(input);
  const comparison = initialComparison(settings.code, settings.seed);
  return createGenerator(settings.code, comparison, {...settings, mode: 'candidateAudit'});
}

function toClientSafeHint(hint) {
  return {
    id: hint.id,
    tier: hint.tier,
    text: hint.text,
    visiblePositions: hint.visiblePositions.slice(),
    positionRoles: hint.positionRoles.slice(),
    lengthClass: hint.lengthClass,
    packageNumber: hint.packageNumber,
    packagePosition: hint.packagePosition,
    explanationType: hint.explanationType,
    explanationData: structuredClone(hint.explanationData),
  };
}

function toClientSafeHintSet(internalSet) {
  const packageCount = internalSet?.generatorVersion === 4 ?
    internalSet.packageCount : 5;
  if (!internalSet || !Array.isArray(internalSet.hints) ||
      !Number.isSafeInteger(packageCount) || packageCount < 5 ||
      packageCount > 10 || internalSet.hints.length !== packageCount * 2) {
    throw new Error('Interner Hinweissatz ist ungültig.');
  }
  const hints = internalSet.hints.map(toClientSafeHint);
  return {
    generatorVersion: internalSet.generatorVersion,
    hintCount: hints.length,
    packageCount,
    packages: Array.from({length: packageCount}, (_, index) => ({
      packageNumber: index + 1,
      hints: hints.filter((hint) => hint.packageNumber === index + 1),
    })),
  };
}

function generateClientSafeHintSet(input) {
  return toClientSafeHintSet(generateInternalHintSet(input));
}

module.exports = Object.freeze({
  ACTIVE_HINT_IDS,
  CONFLICTING_TYPE_GROUPS,
  GENERATOR_VERSION,
  GENERATOR_POLICY,
  INTERNAL_ONLY_FIELDS,
  SOURCE_SHA256: null,
  l054PointBeforeEvaluation,
  l054MixedComparisonEvaluation,
  estimateInformationExclusionPercent,
  VISIBLE_SEMANTIC_AUDITED_HINT_IDS,
  auditHintCandidateFilter,
  generateHintCandidates,
  generateInternalHintSet,
  generateRankInternalHintSet,
  generateExtendedRankInternalHintSet,
  generateClientSafeHintSet,
  toClientSafeHintSet,
});

},
"prototypes/firebase-lock-attempt/functions/src/hints/gdevelop-generator-core.cjs":function(module,exports,require){
"use strict";

// Automatisch aus dem einzigen aktiven T1–T5-Generatorblock der GDevelop-
// Arbeitsdatei extrahiert. Historische hintType-1/2-Zweige sind nicht enthalten.
// Quellblock SHA-256: 9577faf0f32b48bec84f669b0a46465058a43b52e9729486f9f41eb96074b88b

const CUBE_DIGITS = new Set([0, 1, 8]);
const FIBONACCI_DIGITS = new Set([0, 1, 2, 3, 5, 8]);
const PRIME_DIGITS = new Set([2, 3, 5, 7]);
const PRIME_SUMS = new Set([2, 3, 5, 7, 11, 13, 17]);
const COMPOSITE_DIGITS = new Set([4, 6, 8, 9]);
const POWER_OF_TWO_DIGITS = new Set([1, 2, 4, 8]);
const TRIANGULAR_DIGITS = new Set([0, 1, 3, 6]);
const DISTINCT_PRIME_SUM_DIGITS = new Set([5, 7, 8, 9]);
const FACTORIAL_DIGITS = new Set([1, 2, 6]);
const SQUARE_SUMS = new Set([0, 1, 4, 9, 16]);
const FIBONACCI_SUMS = new Set([0, 1, 2, 3, 5, 8, 13]);
const L054_DIVISORS = Object.freeze([2, 3, 4, 5, 6, 8, 9]);
const L054_HINT_IDS = new Set(['T3-17', 'T3-18', 'T3-19', 'T3-20', 'T4-23']);
const L054_MAX_RESULT = 45;
const L054_EXACT_RESULT_COUNTS = Object.freeze({ productPlus: Array(163).fill(0), productMinus: Array(163).fill(0), groupedPlus: Array(163).fill(0), groupedMinus: Array(163).fill(0) });
for (let first = 0; first <= 9; first++) {
  for (let second = 0; second <= 9; second++) {
    for (let third = 0; third <= 9; third++) {
      const results = { productPlus: third + first * second, productMinus: third - first * second, groupedPlus: (first + second) * third, groupedMinus: (first - second) * third };
      for (const variant of Object.keys(results)) if (results[variant] >= 0) L054_EXACT_RESULT_COUNTS[variant][results[variant]]++;
    }
  }
}
let l054ProductDigitSumAssignments = 0;
for (let first = 0; first <= 9; first++) {
  for (let second = 0; second <= 9; second++) {
    const product = first * second;
    const sum = l054DigitSum(product);
    if (product >= 10 && sum <= 9) l054ProductDigitSumAssignments++;
  }
}
const L054_PRODUCT_DIGIT_SUM_EXCLUSION_PERCENT = l054ExclusionPercent(l054ProductDigitSumAssignments, 1000);
const l054MixedValueCounts = Array(91).fill(0);
for (let first = 0; first <= 9; first++) for (let second = 0; second <= 9; second++) for (let third = 0; third <= 9; third++) l054MixedValueCounts[first * second + third]++;
let l054MixedLessAssignments = 0;
for (let left = 0; left < l054MixedValueCounts.length; left++) for (let right = left + 1; right < l054MixedValueCounts.length; right++) l054MixedLessAssignments += l054MixedValueCounts[left] * l054MixedValueCounts[right];
const L054_MIXED_EXCLUSION_PERCENT = l054ExclusionPercent(l054MixedLessAssignments, 1000000);
const DIGIT_HINT_DEFINITIONS = Object.freeze([
  Object.freeze({ id: 'T1-DIGIT-00', digit: 0, propertyKey: 'additiveIdentity', expression: '0', germanProperty: 'das neutrale Element der Addition' }),
  Object.freeze({ id: 'T1-DIGIT-01', digit: 1, propertyKey: 'multiplicativeIdentity', expression: '1', germanProperty: 'das neutrale Element der Multiplikation' }),
  Object.freeze({ id: 'T1-DIGIT-02', digit: 2, propertyKey: 'onlyEvenPrime', expression: '2', germanProperty: 'die einzige gerade Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-03', digit: 3, propertyKey: 'smallestOddPrime', expression: '3', germanProperty: 'die kleinste ungerade Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-04', digit: 4, propertyKey: 'squareOfSmallestPrime', expression: '2² = 4', germanProperty: 'das Quadrat der kleinsten Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-05', digit: 5, propertyKey: 'onlyOddPrimeDivisorOfTen', expression: '10 : 5 = 2', germanProperty: 'die einzige ungerade Primzahl, die ein Teiler von 10 ist' }),
  Object.freeze({ id: 'T1-DIGIT-06', digit: 6, propertyKey: 'factorialOfThree', expression: '3! = 6', sourceDigit: 3 }),
  Object.freeze({ id: 'T1-DIGIT-07', digit: 7, propertyKey: 'largestSingleDigitPrime', expression: '7', germanProperty: 'die größte einstellige Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-08', digit: 8, propertyKey: 'cubeOfSmallestPrime', expression: '2³ = 8', germanProperty: 'der Kubus der kleinsten Primzahl' }),
  Object.freeze({ id: 'T1-DIGIT-09', digit: 9, propertyKey: 'squareOfSmallestOddPrime', expression: '3² = 9', germanProperty: 'das Quadrat der kleinsten ungeraden Primzahl' })
]);
const DIGIT_HINT_BY_DIGIT = new Map(DIGIT_HINT_DEFINITIONS.map(definition => [definition.digit, definition]));
const DIGIT_HINT_IDS = new Set(DIGIT_HINT_DEFINITIONS.map(definition => definition.id));
const ORDINAL_NOMINATIVE = ['', 'erste', 'zweite', 'dritte', 'vierte', 'fünfte', 'sechste', 'siebte', 'achte', 'neunte', 'zehnte', 'elfte'];
const ORDINAL_DATIVE = ['', 'ersten', 'zweiten', 'dritten', 'vierten', 'fünften', 'sechsten', 'siebten', 'achten', 'neunten', 'zehnten', 'elften'];

function ordinal(position, grammaticalForm) {
  if (!Number.isInteger(position) || position < 1 || position > 11) throw new Error('Ungültige sichtbare Position für eine deutsche Ordnungszahl: ' + position);
  return grammaticalForm === 'dative' ? ORDINAL_DATIVE[position] : ORDINAL_NOMINATIVE[position];
}

function joinGerman(values) {
  if (values.length === 0) return '';
  if (values.length === 1) return values[0];
  return values.slice(0, -1).join(', ') + ' und ' + values[values.length - 1];
}

function positionList(positions) {
  const labels = positions.map(position => 'Position ' + (position + 1));
  if (labels.length === 1) return labels[0];
  return labels.slice(0, -1).join(', ') + ' und ' + labels[labels.length - 1];
}

function relation(valueA, valueB) {
  if (valueA > valueB) return 'größer';
  if (valueA < valueB) return 'kleiner';
  return 'gleich';
}

function comparisonText(code, positions) {
  const first = positions[0];
  const second = positions[1];
  const comparison = relation(code[first], code[second]);
  if (comparison === 'gleich') {
    return 'Die Ziffern an den Positionen ' + (first + 1) + ' und ' + (second + 1) + ' sind gleich.';
  }
  return 'Die Ziffer an Position ' + (first + 1) + ' ist ' + comparison + ' als die an Position ' + (second + 1) + '.';
}

function digitHintText(definition, positions) {
  if (definition.id === 'T1-DIGIT-06') return 'Die Ziffer an Position ' + (positions[0] + 1) + ' ist die Fakultät der Ziffer an Position ' + (positions[1] + 1) + '.';
  return 'Die Ziffer an Position ' + (positions[0] + 1) + ' ist ' + definition.germanProperty + '.';
}

function tier1ParityText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (code[positions[0]] % 2 === 0 ? 'gerade.' : 'ungerade.');
}

function tier1PrimeText(code, positions) {
  const isPrime = [2, 3, 5, 7].includes(code[positions[0]]);
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (isPrime ? 'eine Primzahl.' : 'keine Primzahl.');
}

function tier1SquareText(code, positions) {
  const isSquare = [0, 1, 4, 9].includes(code[positions[0]]);
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (isSquare ? 'eine Quadratzahl.' : 'keine Quadratzahl.');
}

function tier1CompositeText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (COMPOSITE_DIGITS.has(code[positions[0]]) ? 'eine zusammengesetzte Zahl.' : 'keine zusammengesetzte Zahl.');
}

function tier1PowerOfTwoText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (POWER_OF_TWO_DIGITS.has(code[positions[0]]) ? 'eine Zweierpotenz.' : 'keine Zweierpotenz.');
}

function tier1CubeText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (CUBE_DIGITS.has(code[positions[0]]) ? 'eine Kubikzahl.' : 'keine Kubikzahl.');
}

function tier1FibonacciText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' gehört ' + (FIBONACCI_DIGITS.has(code[positions[0]]) ? 'zur Fibonacci-Folge.' : 'nicht zur Fibonacci-Folge.');
}

function tier1PositionParityText(code, positions) {
  const sameParity = code[positions[0]] % 2 === (positions[0] + 1) % 2;
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' hat ' + (sameParity ? 'dieselbe Parität wie' : 'eine andere Parität als') + ' ihre Positionsnummer.';
}

function tier1DistinctPrimeSumText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' lässt sich ' + (DISTINCT_PRIME_SUM_DIGITS.has(code[positions[0]]) ? '' : 'nicht ') + 'als Summe zweier verschiedener Primzahlen schreiben.';
}

function tier1FactorialText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (FACTORIAL_DIGITS.has(code[positions[0]]) ? 'eine Fakultätszahl.' : 'keine Fakultätszahl.');
}

function tier1TriangularText(code, positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist ' + (TRIANGULAR_DIGITS.has(code[positions[0]]) ? 'eine Dreieckszahl.' : 'keine Dreieckszahl.');
}

function tier2SumSquareText(code, positions) {
  const sum = code[positions[0]] + code[positions[1]];
  return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (SQUARE_SUMS.has(sum) ? 'eine Quadratzahl.' : 'keine Quadratzahl.');
}

function tier2DifferenceSquareText(code, positions) {
  const difference = Math.abs(code[positions[0]] - code[positions[1]]);
  return 'Der Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (SQUARE_SUMS.has(difference) ? 'eine Quadratzahl.' : 'keine Quadratzahl.');
}

function tier2ParityText(code, positions) {
  const sameParity = code[positions[0]] % 2 === code[positions[1]] % 2;
  return 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' haben ' + (sameParity ? 'dieselbe' : 'unterschiedliche') + ' Parität.';
}

function tier2DifferenceParityText(code, positions) {
  const difference = Math.abs(code[positions[0]] - code[positions[1]]);
  return 'Der Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (difference % 2 === 0 ? 'gerade.' : 'ungerade.');
}

function tier2ProductSquareText(code, positions) {
  const product = code[positions[0]] * code[positions[1]];
  const isSquare = Number.isInteger(Math.sqrt(product));
  return 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (isSquare ? 'eine Quadratzahl.' : 'keine Quadratzahl.');
}

function tier2NeighborText(positions) {
  return 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' liegen auf dem Zahlenstrahl direkt nebeneinander.';
}

function tier2DoubleHalfText(code, positions) {
  const first = code[positions[0]];
  const second = code[positions[1]];
  if (first === second * 2) return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist doppelt so groß wie die Zahl an Position ' + (positions[1] + 1) + '.';
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist halb so groß wie die Zahl an Position ' + (positions[1] + 1) + '.';
}

function tier2SumFibonacciText(code, positions) {
  const sum = code[positions[0]] + code[positions[1]];
  return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (FIBONACCI_SUMS.has(sum) ? 'eine Fibonacci-Zahl.' : 'keine Fibonacci-Zahl.');
}

function tier2DivisibilityText(positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' lässt sich ohne Rest durch die Zahl an Position ' + (positions[1] + 1) + ' teilen.';
}

function tier2ComposedSquareText(code, positions) {
  const number = code[positions[0]] * 10 + code[positions[1]];
  const isSquare = Number.isInteger(Math.sqrt(number));
  return 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' bilden in dieser Reihenfolge ' + (isSquare ? 'eine zweistellige Quadratzahl.' : 'keine zweistellige Quadratzahl.');
}

function tier2DifferencePrimeText(code, positions) {
  const difference = Math.abs(code[positions[0]] - code[positions[1]]);
  return 'Der Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (PRIME_DIGITS.has(difference) ? 'eine Primzahl.' : 'keine Primzahl.');
}

function tier2EqualityText(code, positions) {
  return 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' sind ' + (code[positions[0]] === code[positions[1]] ? 'gleich.' : 'verschieden.');
}

function tier2MirrorDistanceText(positions) {
  return 'Die Zahlen an den spiegelbildlichen Positionen ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' liegen gleich weit von der 5 entfernt.';
}

function tier2SumPrimeText(code, positions) {
  const sum = code[positions[0]] + code[positions[1]];
  return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + (PRIME_SUMS.has(sum) ? 'eine Primzahl.' : 'keine Primzahl.');
}

function tier3SumComparisonText(code, positions) {
  const sum = code[positions[0]] + code[positions[1]];
  const comparison = relation(sum, code[positions[2]]);
  if (comparison === 'gleich') return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist gleich der Zahl an Position ' + (positions[2] + 1) + '.';
  return 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + comparison + ' als die Zahl an Position ' + (positions[2] + 1) + '.';
}

function tier3OrderText(code, positions) {
  const ascending = code[positions[0]] < code[positions[1]] && code[positions[1]] < code[positions[2]];
  return 'Die Zahlen an ' + positionList(positions) + ' werden in dieser Reihenfolge ' + (ascending ? 'größer.' : 'kleiner.');
}

function tier3ProductComparisonText(code, positions) {
  const product = code[positions[0]] * code[positions[1]];
  const comparison = relation(product, code[positions[2]]);
  if (comparison === 'gleich') return 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist gleich der Zahl an Position ' + (positions[2] + 1) + '.';
  return 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + comparison + ' als die Zahl an Position ' + (positions[2] + 1) + '.';
}

function tier3ExactlyTwoEqualText(positions) {
  return 'Von den Zahlen an ' + positionList(positions) + ' sind genau zwei gleich.';
}

function tier3ArithmeticSequenceText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' bilden in dieser Reihenfolge eine gleichmäßige Zahlenfolge.';
}

function tier3StrictBetweenText(positions) {
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' ist größer als die Zahl an Position ' + (positions[1] + 1) + ' und kleiner als die Zahl an Position ' + (positions[2] + 1) + '.';
}

function tier3DifferenceComparisonText(code, positions) {
  const difference = Math.abs(code[positions[0]] - code[positions[1]]);
  const comparison = relation(difference, code[positions[2]]);
  if (comparison === 'gleich') return 'Der Abstand zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist gleich der Zahl an Position ' + (positions[2] + 1) + '.';
  return 'Der Abstand zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist ' + comparison + ' als die Zahl an Position ' + (positions[2] + 1) + '.';
}

function tier3ComposedPalindromeText(code, positions) {
  const isPalindrome = code[positions[0]] === code[positions[2]];
  return 'Die Zahlen an ' + positionList(positions) + ' bilden in dieser Reihenfolge ' + (isPalindrome ? 'eine dreistellige Palindromzahl.' : 'keine dreistellige Palindromzahl.');
}

function tier3ExactSumText(positions) {
  return 'Die Zahl an Position ' + (positions[2] + 1) + ' entspricht der Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + '.';
}

function tier3ExactDifferenceText(positions) {
  return 'Die Zahl an Position ' + (positions[2] + 1) + ' entspricht dem Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + '.';
}

function tier3AverageText(positions) {
  return 'Die Zahl an Position ' + (positions[2] + 1) + ' ist der Durchschnitt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + '.';
}

function tier3RangePrimeText(code, positions) {
  const values = positions.map(position => code[position]);
  const distance = Math.max(...values) - Math.min(...values);
  return 'Der Abstand zwischen der größten und der kleinsten Zahl an ' + positionList(positions) + ' ist ' + (PRIME_DIGITS.has(distance) ? 'eine Primzahl.' : 'keine Primzahl.');
}

function tier3TriangleText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' könnten die Seitenlängen eines Dreiecks bilden.';
}

function tier3SumParityText(code, positions) {
  const sum = positions.reduce((total, position) => total + code[position], 0);
  return 'Die Summe der Zahlen an ' + positionList(positions) + ' ist ' + (sum % 2 === 0 ? 'gerade.' : 'ungerade.');
}

function tier3ProductDigitText(positions) {
  return 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' endet auf die Zahl an Position ' + (positions[2] + 1) + '.';
}

function l054ExclusionPercent(validAssignments, domainSize) {
  return Number((100 * (1 - validAssignments / domainSize)).toFixed(2));
}

function l054ExactInformation(variant, result) {
  const counts = L054_EXACT_RESULT_COUNTS[variant];
  return counts && Number.isInteger(result) && result >= 0 && result < counts.length ? l054ExclusionPercent(counts[result], 1000) : 0;
}

function l054DigitSum(value) {
  return String(value).split('').reduce((sum, digit) => sum + Number(digit), 0);
}

function l054PointBeforeEvaluation(factorA, factorB, term, variant) {
  const result = variant === 'productPlus' ? term + factorA * factorB : variant === 'productMinus' ? term - factorA * factorB : NaN;
  const leftToRightResult = variant === 'productPlus' ? (term + factorA) * factorB : variant === 'productMinus' ? (term - factorA) * factorB : NaN;
  return { result, leftToRightResult, didacticallyValid: Number.isFinite(result) && result !== leftToRightResult };
}

function l054MixedComparisonEvaluation(code, positions) {
  const leftResult = code[positions[2]] + code[positions[0]] * code[positions[1]];
  const rightResult = code[positions[3]] + code[positions[4]] * code[positions[5]];
  const leftToRightLeftResult = (code[positions[2]] + code[positions[0]]) * code[positions[1]];
  const leftToRightRightResult = (code[positions[3]] + code[positions[4]]) * code[positions[5]];
  const comparison = relation(leftResult, rightResult);
  const leftToRightComparison = relation(leftToRightLeftResult, leftToRightRightResult);
  return { leftResult, rightResult, leftToRightLeftResult, leftToRightRightResult, comparison, leftToRightComparison, didacticallyValid: comparison !== 'gleich' && leftToRightComparison !== comparison };
}

function tier3PointBeforeText(positions, variant, result) {
  const operation = variant === 'productPlus' ? 'Summe' : 'Differenz';
  return 'Die ' + operation + ' aus der Ziffer an Position ' + (positions[2] + 1) + ' und dem Produkt der Ziffern an Position ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' beträgt ' + result + '.';
}

function tier3ParenthesesText(positions, variant, result) {
  const groupedOperation = variant === 'groupedPlus' ? 'Summe' : 'Differenz';
  return 'Das Produkt aus der Ziffer an Position ' + (positions[2] + 1) + ' und der ' + groupedOperation + ' der Ziffern an Position ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' beträgt ' + result + '.';
}

function tier3ProductDigitSumText(positions) {
  return 'Die Ziffer an Position ' + (positions[2] + 1) + ' entspricht der Quersumme des Produkts der Ziffern an Position ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + '.';
}

function tier3ComposedDivisibilityText(positions, divisor) {
  return 'Die Ziffern an Position ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' bilden in dieser Reihenfolge eine zweistellige Zahl, die durch ' + divisor + ' teilbar ist.';
}

function tier4MixedExpressionComparisonText(positions, comparison) {
  return 'Position ' + (positions[2] + 1) + ' + Position ' + (positions[0] + 1) + ' × Position ' + (positions[1] + 1) + ' ist ' + comparison + ' als Position ' + (positions[3] + 1) + ' + Position ' + (positions[4] + 1) + ' × Position ' + (positions[5] + 1) + '.';
}

function palindromeText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' ergeben in dieser Reihenfolge ein Palindrom.';
}

function pairSumComparisonText(code, positions) {
  const leftSum = code[positions[0]] + code[positions[1]];
  const rightSum = code[positions[2]] + code[positions[3]];
  const left = 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1);
  const right = 'die Zahlen an Position ' + (positions[2] + 1) + ' und Position ' + (positions[3] + 1);
  if (leftSum > rightSum) return left + ' ergeben zusammen mehr als ' + right + '.';
  if (leftSum < rightSum) return left + ' ergeben zusammen weniger als ' + right + '.';
  return left + ' ergeben dieselbe Summe wie ' + right + '.';
}

function tier4AbabText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' folgen in dieser Reihenfolge dem Muster A-B-A-B.';
}

function tier4EqualDistancesText(positions) {
  return 'Der Unterschied zwischen den Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' ist genauso groß wie der Unterschied zwischen den Zahlen an Position ' + (positions[2] + 1) + ' und Position ' + (positions[3] + 1) + '.';
}

function tier4PairSumParityText(code, positions) {
  const firstSum = code[positions[0]] + code[positions[1]];
  const secondSum = code[positions[2]] + code[positions[3]];
  const sameParity = firstSum % 2 === secondSum % 2;
  const firstPair = 'Die Summe der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1);
  const secondPair = 'die Summe der Zahlen an Position ' + (positions[2] + 1) + ' und Position ' + (positions[3] + 1);
  return sameParity ? firstPair + ' und ' + secondPair + ' sind entweder beide gerade oder beide ungerade.' : firstPair + ' und ' + secondPair + ' besitzen unterschiedliche Parität; genau eine der beiden Summen ist gerade.';
}

function tier4ProductComparisonText(code, positions) {
  const firstProduct = code[positions[0]] * code[positions[1]];
  const secondProduct = code[positions[2]] * code[positions[3]];
  const comparison = relation(firstProduct, secondProduct);
  const firstPair = 'Das Produkt der Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1);
  const secondPair = 'das Produkt der Zahlen an Position ' + (positions[2] + 1) + ' und Position ' + (positions[3] + 1);
  if (comparison === 'gleich') return firstPair + ' ist gleich ' + secondPair + '.';
  return firstPair + ' ist ' + comparison + ' als ' + secondPair + '.';
}

function tier4AabbText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' folgen in dieser Reihenfolge dem Muster A-A-B-B.';
}

function tier4EqualGroupSumsText(firstGroup, secondGroup) {
  return 'Die Zahlen an ' + positionList(firstGroup) + ' ergeben zusammen genauso viel wie die Zahlen an ' + positionList(secondGroup) + '.';
}

function tier4ExactlyOnePairText(positions) {
  return 'Unter den Zahlen an ' + positionList(positions) + ' kommt genau eine Zahl doppelt vor.';
}

function tier4AbcAbcText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' folgen in dieser Reihenfolge dem Muster A-B-C-A-B-C.';
}

function tier4StrictSequenceText(positions, direction) {
  return 'Die Zahlen an ' + positionList(positions) + ' werden in dieser Reihenfolge immer ' + (direction === 'ascending' ? 'größer.' : 'kleiner.');
}

function tier4ArithmeticSequenceText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' bilden in dieser Reihenfolge eine arithmetische Folge mit gleichbleibendem Abstand.';
}

function tier4GroupComparisonText(firstGroup, secondGroup, relationWord) {
  return 'Die Zahlen an ' + positionList(firstGroup) + ' ergeben zusammen ' + relationWord + ' als die Zahlen an ' + positionList(secondGroup) + '.';
}

function tier4CodeFrequencyText(positions, frequency) {
  const frequencyWords = ['', 'einmal', 'zweimal', 'dreimal', 'viermal', 'fünfmal', 'sechsmal', 'siebenmal', 'achtmal', 'neunmal', 'zehnmal', 'elfmal'];
  return 'Die Zahl an Position ' + (positions[0] + 1) + ' kommt im gesamten Code genau ' + frequencyWords[frequency] + ' vor.';
}

function tier4TwoPairsText(positions) {
  return 'Unter den Zahlen an ' + positionList(positions) + ' befinden sich genau zwei unterschiedliche Zahlenpaare.';
}

function tier4AllDifferentText(positions) {
  return 'Die Zahlen an ' + positionList(positions) + ' sind alle verschieden.';
}

function tier4ThreePairSumsText(positions) {
  return 'Bei den Positionen ' + positions.map(position => position + 1).join(', ') + ' ergeben die erste und letzte, die zweite und vorletzte sowie die beiden mittleren Zahlen jeweils dieselbe Summe.';
}

function tier4PairSumDifferenceText(positions) {
  return 'Die Zahl an Position ' + (positions[2] + 1) + ' entspricht dem Unterschied zwischen der Summe der Positionen ' + (positions[0] + 1) + ' und ' + (positions[1] + 1) + ' und der Summe der Positionen ' + (positions[3] + 1) + ' und ' + (positions[4] + 1) + '.';
}

function tier4OddEvenPositionSumText(code) {
  const oddPositionSum = code.filter((value, index) => index % 2 === 0).reduce((sum, value) => sum + value, 0);
  const evenPositionSum = code.filter((value, index) => index % 2 === 1).reduce((sum, value) => sum + value, 0);
  const comparison = relation(oddPositionSum, evenPositionSum);
  if (comparison === 'gleich') return 'Die Summe der Zahlen an ungeraden Positionen ist gleich der Summe der Zahlen an geraden Positionen.';
  return 'Die Summe der Zahlen an ungeraden Positionen ist ' + comparison + ' als die Summe der Zahlen an geraden Positionen.';
}

function tier4CheckDigitText(sourcePositions, targetPosition) {
  return 'Die Zahl an Position ' + (targetPosition + 1) + ' entspricht der letzten Ziffer der Summe der Zahlen an ' + positionList(sourcePositions) + '.';
}

function tier4ExactlyThreeEqualText(positions) {
  return 'Unter den Zahlen an ' + positionList(positions) + ' kommt genau eine Zahl dreimal vor.';
}

function analyzeCodewide(code) {
  const indexed = code.map((value, position) => ({ value, position }));
  const sortedValues = code.slice().sort((first, second) => first - second);
  const valuesFor = predicate => code.filter(predicate);
  const firstPositionFor = predicate => indexed.find(entry => predicate(entry.value))?.position ?? null;
  const lastPositionFor = predicate => indexed.slice().reverse().find(entry => predicate(entry.value))?.position ?? null;
  const primes = valuesFor(value => PRIME_DIGITS.has(value));
  const evenValues = valuesFor(value => value % 2 === 0);
  const oddValues = valuesFor(value => value % 2 !== 0);
  const minimum = sortedValues[0];
  const maximum = sortedValues[sortedValues.length - 1];
  const median = sortedValues[5];
  const firstPrimePosition = firstPositionFor(value => PRIME_DIGITS.has(value));
  const lastPrimePosition = lastPositionFor(value => PRIME_DIGITS.has(value));
  const firstEvenPosition = firstPositionFor(value => value % 2 === 0);
  const lastEvenPosition = lastPositionFor(value => value % 2 === 0);
  const firstOddPosition = firstPositionFor(value => value % 2 !== 0);
  const lastOddPosition = lastPositionFor(value => value % 2 !== 0);
  const before = position => Number.isInteger(position) && position > 0 ? position - 1 : null;
  const after = position => Number.isInteger(position) && position < code.length - 1 ? position + 1 : null;
  return {
    minimum,
    maximum,
    median,
    medianFirstPosition: code.indexOf(median),
    smallestPrime: primes.length > 0 ? Math.min(...primes) : null,
    largestPrime: primes.length > 0 ? Math.max(...primes) : null,
    smallestEven: evenValues.length > 0 ? Math.min(...evenValues) : null,
    largestEven: evenValues.length > 0 ? Math.max(...evenValues) : null,
    smallestOdd: oddValues.length > 0 ? Math.min(...oddValues) : null,
    largestOdd: oddValues.length > 0 ? Math.max(...oddValues) : null,
    hasPrime: primes.length > 0,
    hasEven: evenValues.length > 0,
    hasOdd: oddValues.length > 0,
    firstPrimePosition,
    lastPrimePosition,
    firstEvenPosition,
    lastEvenPosition,
    firstOddPosition,
    lastOddPosition,
    firstMinimumPosition: code.indexOf(minimum),
    lastMinimumPosition: code.lastIndexOf(minimum),
    firstMaximumPosition: code.indexOf(maximum),
    lastMaximumPosition: code.lastIndexOf(maximum),
    beforeFirstPrime: before(firstPrimePosition),
    afterFirstPrime: after(firstPrimePosition),
    beforeLastPrime: before(lastPrimePosition),
    afterLastPrime: after(lastPrimePosition)
  };
}

function comparisonVariants(subject, position, comparison) {
  const positionText = 'die Zahl an Position ' + (position + 1);
  const lowerSubject = subject.charAt(0).toLowerCase() + subject.slice(1);
  if (comparison === 'gleich') return [subject + ' entspricht ' + positionText + '.', 'An Position ' + (position + 1) + ' steht genau ' + lowerSubject + '.'];
  if (comparison === 'kleiner') return [subject + ' ist kleiner als ' + positionText + '.', 'Die Zahl an Position ' + (position + 1) + ' ist größer als ' + lowerSubject + '.'];
  return [subject + ' ist größer als ' + positionText + '.', 'Die Zahl an Position ' + (position + 1) + ' ist kleiner als ' + lowerSubject + '.'];
}

function codewideTextVariants(id, positions, details) {
  const p = index => positions[index] + 1;
  if (id === 'T1-CODE-01') return comparisonVariants('Die größte im Code vorkommende Primzahl', positions[0], details.comparison);
  if (id === 'T1-CODE-02') return comparisonVariants('Die kleinste gerade Zahl im Code', positions[0], details.comparison);
  if (id === 'T1-CODE-03') {
    if (details.extremum === 'maximum') return ['Die Zahl an Position ' + p(0) + ' ist die größte Zahl im gesamten Code.', 'An Position ' + p(0) + ' steht ein globaler Höchstwert des Codes.'];
    if (details.extremum === 'minimum') return ['Die Zahl an Position ' + p(0) + ' ist die kleinste Zahl im gesamten Code.', 'An Position ' + p(0) + ' steht ein globaler Tiefstwert des Codes.'];
    return ['Die Zahl an Position ' + p(0) + ' ist weder die größte noch die kleinste Zahl im Code.', 'Position ' + p(0) + ' enthält keinen globalen Extremwert des Codes.'];
  }
  if (id === 'T1-CODE-04') return comparisonVariants('Der Median aller Zahlen im Code', positions[0], details.comparison);
  if (id === 'T2-CODE-01') {
    const subject = details.subject;
    const lowerSubject = subject.charAt(0).toLowerCase() + subject.slice(1);
    if (details.mode === 'greaterBoth') return [subject + ' ist größer als die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.', 'Die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' sind beide kleiner als ' + lowerSubject + '.'];
    if (details.mode === 'lessBoth') return [subject + ' ist kleiner als die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.', 'Die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' sind beide größer als ' + lowerSubject + '.'];
    return [subject + ' ist größer als die Zahl an Position ' + p(0) + ', aber kleiner als die Zahl an Position ' + p(1) + '.', 'Zwischen den Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' liegt ' + lowerSubject + '.'];
  }
  if (id === 'T2-CODE-03') {
    if (details.mode === 'bothGreater') return ['Die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' sind beide größer als jede im Code vorkommende Primzahl.', 'Jede Primzahl des Codes ist kleiner als die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.'];
    if (details.mode === 'bothSmaller') return ['Die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + ' sind beide kleiner als die größte Primzahl im Code.', 'Die größte im Code vorkommende Primzahl übertrifft die Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.'];
    return ['Die größte Primzahl im Code liegt zwischen den Zahlen an Position ' + p(0) + ' und Position ' + p(1) + '.', 'Die Zahl an Position ' + p(0) + ' ist kleiner und die Zahl an Position ' + p(1) + ' größer als die größte Primzahl im Code.'];
  }
  if (id === 'T2-CODE-04') return ['Die Zahl an Position ' + p(0) + ' liegt näher an der ' + details.extremumLabel + ' Zahl des Codes als die Zahl an Position ' + p(1) + '.', 'Der Abstand von Position ' + p(0) + ' zum globalen ' + details.extremumNoun + ' ist kleiner als der entsprechende Abstand von Position ' + p(1) + '.'];
  if (id === 'T3-CODE-01' || id === 'T3-CODE-02') {
    const location = id === 'T3-CODE-01' ? 'nach der ersten Primzahl von links' : 'vor der letzten Primzahl von links';
    const parity = details.parity === 'even' ? 'gerade' : 'ungerade';
    const relationWord = details.comparison === 'gleich' ? 'gleich der' : details.comparison + ' als die';
    return ['Unmittelbar ' + location + ' steht eine ' + parity + ' Zahl, die ' + relationWord + ' Zahl an Position ' + p(2) + ' ist.', 'Die ' + parity + ' Nachbarzahl unmittelbar ' + location + ' ist ' + relationWord + ' Zahl an Position ' + p(2) + '.'];
  }
  if (id === 'T3-CODE-03') {
    const relationWord = details.comparison === 'gleich' ? 'gleich der' : details.comparison + ' als die';
    return ['Unmittelbar ' + details.directionLabel + ' dem ' + details.occurrenceLabel + ' steht eine Zahl, die ' + relationWord + ' Zahl an Position ' + p(2) + ' ist.', 'Die Nachbarzahl direkt ' + details.directionLabel + ' dem ' + details.occurrenceLabel + ' ist ' + relationWord + ' Zahl an Position ' + p(2) + '.'];
  }
  if (id === 'T3-CODE-04') {
    const relationWord = details.comparison === 'gleich' ? 'gleich groß wie' : details.comparison + ' als';
    return ['Die Zahl unmittelbar nach der ersten Primzahl ist ' + relationWord + ' die Zahl unmittelbar vor der letzten Primzahl.', 'Der rechte Nachbar der ersten Primzahl ist ' + relationWord + ' der linke Nachbar der letzten Primzahl.'];
  }
  if (id === 'T4-CODE-01') return ['Weder die erste noch die letzte Zahl ist die größte Zahl im Code. Beide sind jedoch größer als jede im Code vorkommende Primzahl.', 'Die Randzahlen sind keine globalen Höchstwerte, übertreffen aber sämtliche Primzahlen des Codes.'];
  if (id === 'T4-CODE-02') return ['Die Zahl unmittelbar nach der ersten Primzahl ist größer als die kleinste gerade Zahl und kleiner als die größte ungerade Zahl im Code.', 'Der rechte Nachbar der ersten Primzahl liegt strikt zwischen der kleinsten geraden und der größten ungeraden Zahl des Codes.'];
  if (id === 'T4-CODE-03') return ['Die Zahl unmittelbar vor der ersten Primzahl und die Zahl unmittelbar nach der letzten Primzahl ergeben zusammen die Zahl an Position ' + p(2) + '.', 'Die Summe der beiden äußeren Primzahlnachbarn entspricht der Zahl an Position ' + p(2) + '.'];
  if (id === 'T4-CODE-04') {
    const direction = details.direction === 'ascending' ? 'streng aufsteigender' : 'streng absteigender';
    const verb = details.direction === 'ascending' ? 'werden nacheinander größer' : 'werden nacheinander kleiner';
    return ['Die erste gerade Zahl, die letzte ungerade Zahl und der Median des Codes stehen in ' + direction + ' Reihenfolge.', 'Erste gerade Zahl, letzte ungerade Zahl und Median ' + verb + '.'];
  }
  if (id === 'T4-CODE-05') return ['Die Zahl unmittelbar nach der ersten Primzahl entspricht dem Unterschied zwischen der größten und der kleinsten Zahl des Codes.', 'Der rechte Nachbar der ersten Primzahl ist genauso groß wie der Abstand der globalen Extremwerte.'];
  if (id === 'T4-CODE-06') return ['Weder Position 1 noch Position 11 enthält das Maximum oder Minimum des Codes. Beide Zahlen liegen strikt zwischen diesen Extremwerten.', 'Beide Randzahlen befinden sich wertmäßig zwischen dem globalen Minimum und Maximum, ohne selbst ein Extremwert zu sein.'];
  if (id === 'T4-CODE-07') return ['Im Code gilt: Die kleinste gerade Ziffer ist kleiner als die größte Primzahl, und diese ist kleiner als die Ziffer an Position ' + p(0) + '.', 'Die kleinste gerade Ziffer im Code ist kleiner als die größte Primzahl; diese wiederum ist kleiner als die Ziffer an Position ' + p(0) + '.'];
  return [];
}

function makeCandidate(tier, id, positions, text, signature, options) {
  const candidateOptions = options || {};
  return {
    tier,
    id,
    internalPositions: positions.slice(),
    visiblePositions: positions.map(position => position + 1),
    positionOrder: positions.slice(),
    text,
    canonicalText: text,
    languageTemplateId: 'kanonisch',
    languageVariantCount: 1,
    sentenceOpening: '',
    signature: signature || id + '|' + positions.join('-') + '|' + text,
    truth: true,
    informationStrength: candidateOptions.informationStrength || 1,
    optional: candidateOptions.optional === true,
    details: candidateOptions.details || {},
    codewideDerivations: candidateOptions.codewideDerivations || [],
    positionRoles: candidateOptions.positionRoles || positions.map((position, index) => 'Position ' + (index + 1)),
    mathematicalRule: candidateOptions.mathematicalRule || id + ': ' + text,
    requiresUnlock: candidateOptions.requiresUnlock === true,
    specialRuleType: candidateOptions.specialRuleType || 'normal',
    independentValidation: candidateOptions.independentValidation !== false,
    selectionPriority: Number.isFinite(candidateOptions.selectionPriority) ? candidateOptions.selectionPriority : 0
  };
}

function stableTextHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function ordinalSequence(sequence) {
  const positions = sequence.match(/1[01]|[1-9]/g);
  if (!positions || positions.length === 0) return sequence;
  return joinGerman(positions.map(position => ordinal(Number(position), 'dative')));
}

function numericPlaceVariant(text) {
  return text.replace(/\bPositionen\b/g, 'Stellen').replace(/\bPosition\b/g, 'Stelle');
}

function grammaticalDisplayBase(text) {
  return text.replace(/ entspricht die Zahl an /g, ' entspricht der Zahl an ');
}

function ordinalPositionVariant(text) {
  const numericSequence = 'Position (?:1[01]|[1-9])(?:, Position (?:1[01]|[1-9]))*(?: und Position (?:1[01]|[1-9]))?';
  const plainSequence = '(?:1[01]|[1-9])(?:, (?:1[01]|[1-9]))*(?: und (?:1[01]|[1-9]))?';
  let result = text;
  result = result.replace(new RegExp('\\b(Die|die) Zahlen an (' + numericSequence + ')', 'g'), (match, article, sequence) => article + ' Ziffern an der ' + ordinalSequence(sequence) + ' Stelle');
  result = result.replace(new RegExp('\\b(Die|die) Ziffern an den Positionen (' + plainSequence + ')', 'g'), (match, article, sequence) => article + ' Ziffern an der ' + ordinalSequence(sequence) + ' Stelle');
  result = result.replace(new RegExp('\\bZahlen an (' + numericSequence + ')', 'g'), (match, sequence) => 'Ziffern an der ' + ordinalSequence(sequence) + ' Stelle');
  result = result.replace(/\bDie Zahl an Position (1[01]|[1-9])/g, (match, position) => 'Die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\bdie Zahl an Position (1[01]|[1-9])/g, (match, position) => 'die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\bder Zahl an Position (1[01]|[1-9])/g, (match, position) => 'der ' + ordinal(Number(position), 'dative') + ' Ziffer');
  result = result.replace(/\bDie Ziffer an Position (1[01]|[1-9])/g, (match, position) => 'Die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\bdie Ziffer an Position (1[01]|[1-9])/g, (match, position) => 'die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\bals die an Position (1[01]|[1-9])/g, (match, position) => 'als die ' + ordinal(Number(position)) + ' Ziffer');
  result = result.replace(/\ban Position (1[01]|[1-9])/g, (match, position) => 'an der ' + ordinal(Number(position), 'dative') + ' Stelle');
  return result;
}

function sentenceOpening(text) {
  const normalizedOrdinals = ORDINAL_NOMINATIVE.concat(ORDINAL_DATIVE)
    .filter(Boolean)
    .reduce((value, ordinalWord) => value.replace(new RegExp('\\b' + ordinalWord + '\\b', 'gi'), '<ordinal>'), text.toLowerCase());
  return normalizedOrdinals.replace(/[.,:;!?]/g, '').split(/\s+/).slice(0, 4).join(' ');
}

function tier5PatternVariant(candidate) {
  if (candidate.id !== 'T5-03') return '';
  const labels = candidate.details.derivationLabels;
  if (!Array.isArray(labels) || labels.length !== 3) return '';
  const subject = labels.join('; ');
  const intro = 'Die drei codeweit abgeleiteten Werte – ' + subject + ' – ';
  if (candidate.details.pattern === 'arithmetic') return intro + 'bilden in dieser Reihenfolge eine arithmetische Folge mit gleichem, von null verschiedenem Abstand.';
  if (candidate.details.pattern === 'ascending') return intro + 'werden in der genannten Reihenfolge jeweils strikt größer.';
  if (candidate.details.pattern === 'descending') return intro + 'werden in der genannten Reihenfolge jeweils strikt kleiner.';
  if (candidate.details.pattern === 'firstThirdEqual') return intro + 'haben denselben ersten und dritten Wert, während der mittlere Wert abweicht.';
  return '';
}

function languageVariantsForCandidate(candidate, code) {
  if (candidate.id === 'T5-04' || candidate.intentionallyFalse === true) {
    return [{ id: 'wortgetreu-geschuetzt', text: candidate.text, opening: sentenceOpening(candidate.text), stableRank: 0 }];
  }
  if (candidate.id === 'T1-DIGIT-06') {
    const exactText = candidate.canonicalText || candidate.text;
    return [{ id: 'fakultaet-wortgetreu', text: exactText, opening: sentenceOpening(exactText), stableRank: 0 }];
  }
  if (candidate.id === 'T3-17' || candidate.id === 'T3-18' || candidate.id === 'T3-19' || candidate.id === 'T4-23') {
    const exactText = candidate.canonicalText || candidate.text;
    return [{ id: 'l054-mathematisch-wortgetreu', text: exactText, opening: sentenceOpening(exactText), stableRank: 0 }];
  }
  if (candidate.id === 'T5-01') {
    const rightPositions = candidate.details.rightVisiblePositions;
    const comparison = candidate.details.comparison;
    const intro = 'Für diesen Hinweis werden die Positionen von rechts gezählt. ';
    const tier5Variants = comparison === 'gleich' ? [
      { id: 'rechts-numerisch', text: intro + 'Die Zahlen an Position ' + rightPositions[0] + ' und Position ' + rightPositions[1] + ' sind gleich.' },
      { id: 'rechts-ordinal', text: intro + 'Die ' + ordinal(rightPositions[0]) + ' und ' + ordinal(rightPositions[1]) + ' Ziffer von rechts sind gleich.' },
      { id: 'rechts-stellen', text: intro + 'An den Stellen ' + rightPositions[0] + ' und ' + rightPositions[1] + ' steht von rechts gezählt derselbe Wert.' }
    ] : [
      { id: 'rechts-numerisch', text: candidate.canonicalText },
      { id: 'rechts-ordinal', text: intro + 'Die ' + ordinal(rightPositions[0]) + ' Ziffer von rechts ist ' + comparison + ' als die ' + ordinal(rightPositions[1]) + ' Ziffer von rechts.' },
      { id: 'rechts-stellen', text: intro + 'Von rechts betrachtet ist die Ziffer an Stelle ' + rightPositions[0] + ' ' + comparison + ' als die Ziffer an Stelle ' + rightPositions[1] + '.' }
    ];
    return tier5Variants.filter((variant, index) => tier5Variants.findIndex(other => other.text === variant.text) === index).map(variant => Object.assign({}, variant, {
      opening: sentenceOpening(variant.text),
      stableRank: stableTextHash(code.join('') + '|' + candidate.signature + '|language-v1|' + variant.id)
    }));
  }

  const baseTexts = [grammaticalDisplayBase(candidate.canonicalText || candidate.text)];
  if (candidate.id.includes('-CODE-')) {
    for (const text of codewideTextVariants(candidate.id, candidate.internalPositions, candidate.details)) baseTexts.push(grammaticalDisplayBase(text));
  }
  const tier5Pattern = tier5PatternVariant(candidate);
  if (tier5Pattern) baseTexts.push(tier5Pattern);

  const variants = [];
  const addVariant = (id, text) => {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (!normalized || variants.some(variant => variant.text === normalized)) return;
    variants.push({ id, text: normalized });
  };

  for (let index = 0; index < baseTexts.length; index++) {
    const baseText = baseTexts[index];
    addVariant('numerisch-' + index, baseText);
    addVariant('stellen-' + index, numericPlaceVariant(baseText));
    addVariant('ordinal-' + index, ordinalPositionVariant(baseText));
  }
  return variants.map(variant => Object.assign({}, variant, {
    opening: sentenceOpening(variant.text),
    stableRank: stableTextHash(code.join('') + '|' + candidate.signature + '|language-v1|' + variant.id)
  }));
}

function combinations(size, count) {
  const result = [];
  function collect(start, current) {
    if (current.length === count) {
      result.push(current.slice());
      return;
    }
    for (let index = start; index < size; index++) {
      current.push(index);
      collect(index + 1, current);
      current.pop();
    }
  }
  collect(0, []);
  return result;
}

function permutations(values) {
  const result = [];
  function collect(remaining, current) {
    if (remaining.length === 0) {
      result.push(current.slice());
      return;
    }
    for (let index = 0; index < remaining.length; index++) {
      const next = remaining[index];
      collect(remaining.slice(0, index).concat(remaining.slice(index + 1)), current.concat(next));
    }
  }
  collect(values, []);
  return result;
}

function freePositionOrder(positions) {
  if (positions.length < 4) return positions.slice();
  const ordered = [];
  for (let index = 0; index < positions.length; index += 2) ordered.push(positions[index]);
  const lastOddIndex = positions.length % 2 === 0 ? positions.length - 1 : positions.length - 2;
  for (let index = lastOddIndex; index >= 1; index -= 2) ordered.push(positions[index]);
  return ordered;
}

const MIN_HINT_EXCLUSION_PERCENT = 40;
const VISIBLE_SEMANTIC_AUDITED_HINT_IDS = new Set(["T1-01","T1-02","T1-03","T1-05","T1-06","T1-08","T1-09","T1-12","T1-14","T1-DIGIT-00","T1-DIGIT-01","T1-DIGIT-02","T1-DIGIT-03","T1-DIGIT-04","T1-DIGIT-05","T1-DIGIT-06","T1-DIGIT-07","T1-DIGIT-08","T1-DIGIT-09","T2-01","T2-03","T2-04","T2-06","T2-08","T2-09","T2-11","T2-13","T2-15","T2-CODE-03","T2-CODE-04","T3-02","T3-04","T3-06","T3-07","T3-08","T3-10","T3-11","T3-12","T3-13","T3-14","T3-15","T3-16","T3-CODE-01","T3-CODE-02","T3-CODE-03","T3-CODE-04","T4-01","T4-02","T4-03","T4-04","T4-05","T4-06","T4-07","T4-08","T4-09","T4-10","T4-11","T4-12","T4-13","T4-15","T4-16","T4-17","T4-18","T4-19","T4-21","T4-22","T4-CODE-01","T4-CODE-02","T4-CODE-03","T4-CODE-05","T4-CODE-06","T4-CODE-07","T1-CODE-04","T4-CODE-04","T5-01","T5-02","T5-03"]);

function estimateInformationExclusionPercent(candidate) {
  const details = candidate && candidate.details ? candidate.details : {};
  if (!candidate || typeof candidate.id !== 'string') return 0;
  if (candidate.id === 'T5-04') return 100;
  if (candidate.id === 'T3-17' || candidate.id === 'T3-18' || candidate.id === 'T3-19' || candidate.id === 'T3-20' || candidate.id === 'T4-23') return Number.isFinite(details.informationExclusionPercent) ? details.informationExclusionPercent : 0;
  if (candidate.id === 'T1-07') return details.cube === true ? 70 : details.cube === false ? 30 : 0;
  if (candidate.id === 'T1-13') return details.factorial === true ? 70 : details.factorial === false ? 30 : 0;
  if (candidate.id === 'T1-CODE-01') return details.comparison === 'größer' ? 39.52446 : details.comparison === 'kleiner' ? 75.681338 : details.comparison === 'gleich' ? 85.156999 : 0;
  if (candidate.id === 'T1-CODE-02') return details.comparison === 'größer' ? 95.135595 : details.comparison === 'kleiner' ? 19.816701 : details.comparison === 'gleich' ? 85.096532 : 0;
  if (candidate.id === 'T1-CODE-03') return details.extremum === 'maximum' || details.extremum === 'minimum' ? 85.085658 : details.extremum === 'neither' ? 29.828684 : 0;
  if (candidate.id === 'T2-02') return details.square === true ? 79 : details.square === false ? 21 : 0;
  if (candidate.id === 'T2-07') return details.square === true ? 64 : details.square === false ? 36 : 0;
  if (candidate.id === 'T2-10') return details.fibonacci === true ? 69 : details.fibonacci === false ? 31 : 0;
  if (candidate.id === 'T2-12') return details.square === true ? 94 : details.square === false ? 6 : 0;
  if (candidate.id === 'T2-14') return details.equal === true ? 90 : details.equal === false ? 10 : 0;
  if (candidate.id === 'T2-16') return details.prime === true ? 63 : details.prime === false ? 37 : 0;
  if (candidate.id === 'T2-CODE-01') {
    if (details.sourceKey === 'smallestEven') return details.mode === 'greaterBoth' ? 98.968864 : details.mode === 'lessBoth' ? 35.346914 : details.mode === 'between' ? 96.983958 : 0;
    if (details.sourceKey === 'largestPrime') return details.mode === 'greaterBoth' ? 62.687654 : details.mode === 'lessBoth' ? 93.284617 : details.mode === 'between' ? 86.257269 : 0;
    if (details.sourceKey === 'largestOdd') return details.mode === 'greaterBoth' ? 35.346914 : details.mode === 'lessBoth' ? 98.968864 : details.mode === 'between' ? 96.983958 : 0;
    return 0;
  }
  if (candidate.id === 'T3-01') return details.comparison === 'größer' ? 22 : details.comparison === 'kleiner' ? 83.5 : details.comparison === 'gleich' ? 94.5 : 0;
  if (candidate.id === 'T3-03') return details.comparison === 'größer' ? 29 : details.comparison === 'kleiner' ? 75.2 : details.comparison === 'gleich' ? 95.8 : 0;
  if (candidate.id === 'T3-09') return details.palindrome === true ? 91 : details.palindrome === false ? 9 : 0;
  if (candidate.id === 'T4-14') {
    if (!Array.isArray(details.firstGroup) || !Array.isArray(details.secondGroup)) return 0;
    if (details.firstGroup.length === 2 && details.secondGroup.length === 3) return details.relation === 'mehr' ? 77.626 : details.relation === 'weniger' ? 27.214 : 0;
    if (details.firstGroup.length === 3 && details.secondGroup.length === 3) return details.relation === 'mehr' || details.relation === 'weniger' ? 52.7626 : 0;
    return 0;
  }
  if (candidate.id === 'T4-20') return details.comparison === 'größer' ? 33.924516 : details.comparison === 'kleiner' ? 69.790585 : details.comparison === 'gleich' ? 96.284898 : 0;
  return VISIBLE_SEMANTIC_AUDITED_HINT_IDS.has(candidate.id) ? MIN_HINT_EXCLUSION_PERCENT : 0;
}

function createGenerator(code, existingComparison, generatorOptions) {
  const settings = generatorOptions || {};
  const GENERATOR_SEED = String(settings.seed || 'default');
  const candidateGroups = {
    1: { 'T1-01': [], 'T1-02': [], 'T1-03': [], 'T1-05': [], 'T1-06': [], 'T1-07': [], 'T1-08': [], 'T1-09': [], 'T1-12': [], 'T1-13': [], 'T1-14': [], 'T1-DIGIT-00': [], 'T1-DIGIT-01': [], 'T1-DIGIT-02': [], 'T1-DIGIT-03': [], 'T1-DIGIT-04': [], 'T1-DIGIT-05': [], 'T1-DIGIT-06': [], 'T1-DIGIT-07': [], 'T1-DIGIT-08': [], 'T1-DIGIT-09': [], 'T1-CODE-01': [], 'T1-CODE-02': [], 'T1-CODE-03': [] },
    2: { 'T2-01': [], 'T2-02': [], 'T2-03': [], 'T2-04': [], 'T2-06': [], 'T2-07': [], 'T2-08': [], 'T2-09': [], 'T2-10': [], 'T2-11': [], 'T2-12': [], 'T2-13': [], 'T2-14': [], 'T2-15': [], 'T2-16': [], 'T2-CODE-01': [], 'T2-CODE-03': [], 'T2-CODE-04': [] },
    3: { 'T3-01': [], 'T3-02': [], 'T3-03': [], 'T3-04': [], 'T3-06': [], 'T3-07': [], 'T3-08': [], 'T3-09': [], 'T3-10': [], 'T3-11': [], 'T3-12': [], 'T3-13': [], 'T3-14': [], 'T3-15': [], 'T3-16': [], 'T3-17': [], 'T3-18': [], 'T3-19': [], 'T3-20': [], 'T3-CODE-01': [], 'T3-CODE-02': [], 'T3-CODE-03': [], 'T3-CODE-04': [] },
    4: { 'T4-01': [], 'T4-02': [], 'T4-03': [], 'T4-04': [], 'T4-05': [], 'T4-06': [], 'T4-07': [], 'T4-08': [], 'T4-09': [], 'T4-10': [], 'T4-11': [], 'T4-12': [], 'T4-13': [], 'T4-14': [], 'T4-15': [], 'T4-16': [], 'T4-17': [], 'T4-18': [], 'T4-19': [], 'T4-20': [], 'T4-21': [], 'T4-22': [], 'T4-23': [], 'T4-CODE-01': [], 'T4-CODE-02': [], 'T4-CODE-03': [], 'T4-CODE-05': [], 'T4-CODE-06': [], 'T4-CODE-07': [] },
    5: { 'T1-CODE-04': [], 'T4-CODE-04': [], 'T5-01': [], 'T5-02': [], 'T5-03': [], 'T5-04': [] }
  };
  const codewide = analyzeCodewide(code);
  const TIER_5_UNLOCKED = settings.tier5Unlocked === true;
  const MAX_OPTIONAL_CANDIDATES = 160;
  const groupComparisonCounts = { '2:3': 0, '3:3': 0 };

  function add(candidate) {
    candidateGroups[candidate.tier][candidate.id].push(candidate);
  }

  function addCodewideCandidate(tier, id, positions, details, options) {
    const candidateOptions = options || {};
    const texts = codewideTextVariants(id, positions, details);
    if (texts.length < 2) throw new Error('Codeweiter Typ ' + id + ' besitzt weniger als zwei Textvarianten.');
    let variantSeed = 2166136261;
    const variantSource = GENERATOR_SEED + '|' + id + '|' + positions.join('-') + '|' + (details.semanticKey || '') + '|' + code.join('');
    for (let index = 0; index < variantSource.length; index++) {
      variantSeed ^= variantSource.charCodeAt(index);
      variantSeed = Math.imul(variantSeed, 16777619);
    }
    const variantIndex = (variantSeed >>> 0) % texts.length;
    const candidateDetails = Object.assign({}, details, { variantIndex });
    const signature = id + '|' + positions.join('-') + '|' + (details.semanticKey || '');
    add(makeCandidate(tier, id, positions, texts[variantIndex], signature, {
      informationStrength: candidateOptions.informationStrength || 4,
      optional: candidateOptions.optional !== false,
      positionRoles: candidateOptions.positionRoles || positions.map(() => 'Beteiligte Position'),
      details: candidateDetails,
      codewideDerivations: candidateOptions.codewideDerivations || [],
      mathematicalRule: candidateOptions.mathematicalRule || id,
      requiresUnlock: tier === 5,
      specialRuleType: tier === 5 ? 'median-expertenhinweis' : 'normal',
      selectionPriority: candidateOptions.selectionPriority
    }));
  }

  function addCodewideCandidates() {
    for (let position = 0; position < code.length; position++) {
      if (codewide.hasPrime) {
        const comparison = relation(codewide.largestPrime, code[position]);
        addCodewideCandidate(1, 'T1-CODE-01', [position], { comparison, derivedValue: codewide.largestPrime, semanticKey: 'largestPrime|' + position + '|' + comparison }, { optional: true, positionRoles: ['Vergleichsposition'], codewideDerivations: ['größte vorkommende Primzahl'], mathematicalRule: 'Größte Primzahl des gesamten Codes wird mit einer Positionsziffer verglichen' });
      }
      if (codewide.hasEven) {
        const comparison = relation(codewide.smallestEven, code[position]);
        addCodewideCandidate(1, 'T1-CODE-02', [position], { comparison, derivedValue: codewide.smallestEven, semanticKey: 'smallestEven|' + position + '|' + comparison }, { optional: true, positionRoles: ['Vergleichsposition'], codewideDerivations: ['kleinste gerade Zahl'], mathematicalRule: 'Kleinste gerade Zahl des gesamten Codes einschließlich 0 wird mit einer Positionsziffer verglichen' });
      }
      if (codewide.minimum !== codewide.maximum) {
        const extremum = code[position] === codewide.maximum ? 'maximum' : code[position] === codewide.minimum ? 'minimum' : 'neither';
        addCodewideCandidate(1, 'T1-CODE-03', [position], { extremum, minimum: codewide.minimum, maximum: codewide.maximum, semanticKey: 'globalExtremum|' + position + '|' + extremum }, { optional: false, informationStrength: extremum === 'neither' ? 2 : 4, positionRoles: ['Prüfposition'], codewideDerivations: ['globale kleinste Ziffer', 'globale größte Ziffer'], mathematicalRule: 'Positionswert ist globales Maximum, globales Minimum oder keiner der Extremwerte' });
      }
      const medianComparison = relation(codewide.median, code[position]);
      addCodewideCandidate(5, 'T1-CODE-04', [position], { comparison: medianComparison, median: codewide.median, semanticKey: 'median|' + position + '|' + medianComparison }, { optional: false, positionRoles: ['Vergleichsposition'], codewideDerivations: ['Median aller elf Ziffern'], mathematicalRule: 'Median des gesamten Codes wird mit einer Positionsziffer verglichen' });
    }

    const tier2Sources = [
      { key: 'smallestEven', subject: 'Die kleinste gerade Zahl im Code', value: codewide.smallestEven, available: codewide.hasEven },
      { key: 'largestPrime', subject: 'Die größte Primzahl im Code', value: codewide.largestPrime, available: codewide.hasPrime },
      { key: 'largestOdd', subject: 'Die größte ungerade Zahl im Code', value: codewide.largestOdd, available: codewide.hasOdd }
    ];
    for (const pair of combinations(code.length, 2)) {
      for (const source of tier2Sources) {
        if (!source.available) continue;
        const firstValue = code[pair[0]];
        const secondValue = code[pair[1]];
        let orderedPair = pair.slice();
        let mode = null;
        if (source.value > firstValue && source.value > secondValue) mode = 'greaterBoth';
        else if (source.value < firstValue && source.value < secondValue) mode = 'lessBoth';
        else if (Math.min(firstValue, secondValue) < source.value && source.value < Math.max(firstValue, secondValue)) {
          orderedPair = firstValue < secondValue ? pair.slice() : pair.slice().reverse();
          mode = 'between';
        }
        if (mode) addCodewideCandidate(2, 'T2-CODE-01', orderedPair, { sourceKey: source.key, subject: source.subject, derivedValue: source.value, mode, semanticKey: source.key + '|' + orderedPair.join('-') + '|' + mode }, { positionRoles: mode === 'between' ? ['Untere Vergleichsposition', 'Obere Vergleichsposition'] : ['Vergleichsposition A', 'Vergleichsposition B'], codewideDerivations: [source.subject], mathematicalRule: 'Eine eindeutig abgeleitete globale Zahl wird gleichzeitig mit zwei Positionswerten verglichen' });
      }
      if (codewide.hasPrime) {
        const firstValue = code[pair[0]];
        const secondValue = code[pair[1]];
        let orderedPair = pair.slice();
        let mode = null;
        if (firstValue > codewide.largestPrime && secondValue > codewide.largestPrime) mode = 'bothGreater';
        else if (firstValue < codewide.largestPrime && secondValue < codewide.largestPrime) mode = 'bothSmaller';
        else if (Math.min(firstValue, secondValue) < codewide.largestPrime && codewide.largestPrime < Math.max(firstValue, secondValue)) {
          orderedPair = firstValue < secondValue ? pair.slice() : pair.slice().reverse();
          mode = 'between';
        }
        if (mode) addCodewideCandidate(2, 'T2-CODE-03', orderedPair, { mode, largestPrime: codewide.largestPrime, semanticKey: 'largestPrimePair|' + orderedPair.join('-') + '|' + mode }, { positionRoles: mode === 'between' ? ['Untere Position', 'Obere Position'] : ['Vergleichsposition A', 'Vergleichsposition B'], codewideDerivations: ['größte vorkommende Primzahl'], mathematicalRule: 'Zwei Positionswerte werden gemeinsam relativ zur größten Primzahl des Codes eingeordnet' });
      }
      for (const extremum of [
        { key: 'minimum', value: codewide.minimum, label: 'kleinsten', noun: 'Minimum' },
        { key: 'maximum', value: codewide.maximum, label: 'größten', noun: 'Maximum' }
      ]) {
        const firstDistance = Math.abs(code[pair[0]] - extremum.value);
        const secondDistance = Math.abs(code[pair[1]] - extremum.value);
        if (firstDistance === 0 || secondDistance === 0 || firstDistance === secondDistance) continue;
        const orderedPair = firstDistance < secondDistance ? pair.slice() : pair.slice().reverse();
        addCodewideCandidate(2, 'T2-CODE-04', orderedPair, { extremum: extremum.key, extremumValue: extremum.value, extremumLabel: extremum.label, extremumNoun: extremum.noun, closerDistance: Math.min(firstDistance, secondDistance), fartherDistance: Math.max(firstDistance, secondDistance), semanticKey: 'extremumDistance|' + extremum.key + '|' + orderedPair.join('-') }, { positionRoles: ['Nähere Position', 'Entferntere Position'], codewideDerivations: ['globales ' + extremum.noun], mathematicalRule: 'Absolute Abstände zweier Positionswerte zu einem globalen Extremwert werden strikt verglichen' });
      }
    }
    function addPrimeNeighborComparisons(id, anchorPosition, neighborPosition, directionLabel) {
      if (!Number.isInteger(anchorPosition) || !Number.isInteger(neighborPosition)) return;
      const parity = code[neighborPosition] % 2 === 0 ? 'even' : 'odd';
      for (let targetPosition = 0; targetPosition < code.length; targetPosition++) {
        if (targetPosition === anchorPosition || targetPosition === neighborPosition) continue;
        const comparison = relation(code[neighborPosition], code[targetPosition]);
        addCodewideCandidate(3, id, [anchorPosition, neighborPosition, targetPosition], { parity, comparison, anchorPosition, neighborPosition, targetPosition, semanticKey: id + '|' + neighborPosition + '|' + targetPosition + '|' + comparison }, { positionRoles: ['Abgeleitete Primzahlposition', 'Abgeleitete Nachbarposition', 'Vergleichsposition'], codewideDerivations: [directionLabel], mathematicalRule: 'Parität und Wert des abgeleiteten Primzahlnachbarn werden mit einer weiteren Position verglichen' });
      }
    }
    addPrimeNeighborComparisons('T3-CODE-01', codewide.firstPrimePosition, codewide.afterFirstPrime, 'erste Primzahl und rechter Nachbar');
    addPrimeNeighborComparisons('T3-CODE-02', codewide.lastPrimePosition, codewide.beforeLastPrime, 'letzte Primzahl und linker Nachbar');

    const extremeOccurrences = codewide.minimum === codewide.maximum ? [] : [
      { position: codewide.firstMinimumPosition, label: 'ersten Vorkommen der kleinsten Zahl', derivation: 'erstes Vorkommen des globalen Minimums' },
      { position: codewide.lastMinimumPosition, label: 'letzten Vorkommen der kleinsten Zahl', derivation: 'letztes Vorkommen des globalen Minimums' },
      { position: codewide.firstMaximumPosition, label: 'ersten Vorkommen der größten Zahl', derivation: 'erstes Vorkommen des globalen Maximums' },
      { position: codewide.lastMaximumPosition, label: 'letzten Vorkommen der größten Zahl', derivation: 'letztes Vorkommen des globalen Maximums' }
    ];
    for (const occurrence of extremeOccurrences) {
      for (const neighborRule of [
        { position: occurrence.position > 0 ? occurrence.position - 1 : null, label: 'vor' },
        { position: occurrence.position < code.length - 1 ? occurrence.position + 1 : null, label: 'nach' }
      ]) {
        if (!Number.isInteger(neighborRule.position)) continue;
        for (let targetPosition = 0; targetPosition < code.length; targetPosition++) {
          if (targetPosition === occurrence.position || targetPosition === neighborRule.position) continue;
          const comparison = relation(code[neighborRule.position], code[targetPosition]);
          addCodewideCandidate(3, 'T3-CODE-03', [occurrence.position, neighborRule.position, targetPosition], { occurrenceLabel: occurrence.label, directionLabel: neighborRule.label, occurrencePosition: occurrence.position, neighborPosition: neighborRule.position, targetPosition, comparison, semanticKey: 'extremeNeighbor|' + occurrence.derivation + '|' + neighborRule.position + '|' + targetPosition + '|' + comparison }, { positionRoles: ['Abgeleitete Extremposition', 'Abgeleitete Nachbarposition', 'Vergleichsposition'], codewideDerivations: [occurrence.derivation], mathematicalRule: 'Nachbar eines eindeutig bestimmten globalen Extremvorkommens wird mit einer weiteren Position verglichen' });
        }
      }
    }
    if (Number.isInteger(codewide.afterFirstPrime) && Number.isInteger(codewide.beforeLastPrime) && codewide.afterFirstPrime !== codewide.beforeLastPrime) {
      const comparison = relation(code[codewide.afterFirstPrime], code[codewide.beforeLastPrime]);
      addCodewideCandidate(3, 'T3-CODE-04', [codewide.afterFirstPrime, codewide.beforeLastPrime], { comparison, afterFirstPrime: codewide.afterFirstPrime, beforeLastPrime: codewide.beforeLastPrime, firstPrimePosition: codewide.firstPrimePosition, lastPrimePosition: codewide.lastPrimePosition, semanticKey: 'primeNeighbors|' + codewide.afterFirstPrime + '|' + codewide.beforeLastPrime + '|' + comparison }, { positionRoles: ['Rechter Nachbar der ersten Primzahl', 'Linker Nachbar der letzten Primzahl'], codewideDerivations: ['erster Primzahlnachbar rechts', 'letzter Primzahlnachbar links'], mathematicalRule: 'Die beiden eindeutig abgeleiteten Primzahlnachbarn werden miteinander verglichen' });
    }

    if (codewide.hasPrime && code[0] !== codewide.maximum && code[code.length - 1] !== codewide.maximum && code[0] > codewide.largestPrime && code[code.length - 1] > codewide.largestPrime) {
      addCodewideCandidate(4, 'T4-CODE-01', [0, code.length - 1], { maximum: codewide.maximum, largestPrime: codewide.largestPrime, semanticKey: 'edgeAbovePrimes' }, { selectionPriority: -18, positionRoles: ['Erste Position', 'Letzte Position'], codewideDerivations: ['globale größte Ziffer', 'größte vorkommende Primzahl'], mathematicalRule: 'Beide Randwerte sind keine globalen Maxima und liegen über sämtlichen Primzahlen des Codes' });
    }
    if (codewide.hasPrime && codewide.hasEven && codewide.hasOdd && Number.isInteger(codewide.afterFirstPrime)) {
      const neighborValue = code[codewide.afterFirstPrime];
      if (codewide.smallestEven < neighborValue && neighborValue < codewide.largestOdd) {
        addCodewideCandidate(4, 'T4-CODE-02', [codewide.firstPrimePosition, codewide.afterFirstPrime], { smallestEven: codewide.smallestEven, largestOdd: codewide.largestOdd, neighborPosition: codewide.afterFirstPrime, semanticKey: 'firstPrimeNeighborBetweenGlobalProperties' }, { positionRoles: ['Erste Primzahlposition', 'Rechter Nachbar'], codewideDerivations: ['erste Primzahl von links', 'kleinste gerade Zahl', 'größte ungerade Zahl'], mathematicalRule: 'Rechter Nachbar der ersten Primzahl liegt strikt zwischen zwei global abgeleiteten Werten' });
      }
    }
    if (Number.isInteger(codewide.beforeFirstPrime) && Number.isInteger(codewide.afterLastPrime) && codewide.beforeFirstPrime !== codewide.afterLastPrime) {
      const derivedSum = code[codewide.beforeFirstPrime] + code[codewide.afterLastPrime];
      if (derivedSum <= 9) {
        for (let targetPosition = 0; targetPosition < code.length; targetPosition++) {
          if (targetPosition === codewide.beforeFirstPrime || targetPosition === codewide.afterLastPrime || code[targetPosition] !== derivedSum) continue;
          addCodewideCandidate(4, 'T4-CODE-03', [codewide.beforeFirstPrime, codewide.afterLastPrime, targetPosition], { beforeFirstPrime: codewide.beforeFirstPrime, afterLastPrime: codewide.afterLastPrime, targetPosition, derivedSum, semanticKey: 'outerPrimeNeighborSum|' + codewide.beforeFirstPrime + '|' + codewide.afterLastPrime + '|' + targetPosition }, { positionRoles: ['Linker Nachbar der ersten Primzahl', 'Rechter Nachbar der letzten Primzahl', 'Zielposition'], codewideDerivations: ['linker Nachbar der ersten Primzahl', 'rechter Nachbar der letzten Primzahl'], mathematicalRule: 'Summe zweier eindeutig abgeleiteter Primzahlnachbarn entspricht einer weiteren Positionsziffer' });
        }
      }
    }
    if (codewide.hasEven && codewide.hasOdd) {
      const orderedValues = [code[codewide.firstEvenPosition], code[codewide.lastOddPosition], codewide.median];
      const distinctValues = new Set(orderedValues).size === 3;
      const ascending = orderedValues[0] < orderedValues[1] && orderedValues[1] < orderedValues[2];
      const descending = orderedValues[0] > orderedValues[1] && orderedValues[1] > orderedValues[2];
      if (distinctValues && (ascending || descending)) {
        const direction = ascending ? 'ascending' : 'descending';
        addCodewideCandidate(5, 'T4-CODE-04', [codewide.firstEvenPosition, codewide.lastOddPosition, codewide.medianFirstPosition], { direction, values: orderedValues, semanticKey: 'derivedStrictOrder|' + direction }, { positionRoles: ['Erste gerade Zahl', 'Letzte ungerade Zahl', 'Erstes Medianvorkommen'], codewideDerivations: ['erste gerade Zahl von links', 'letzte ungerade Zahl von links', 'Median aller elf Ziffern'], mathematicalRule: 'Drei global abgeleitete Werte stehen in strenger auf- oder absteigender Reihenfolge' });
      }
    }
    if (codewide.minimum !== codewide.maximum && Number.isInteger(codewide.afterFirstPrime)) {
      const globalDifference = Math.abs(codewide.maximum - codewide.minimum);
      if (code[codewide.afterFirstPrime] === globalDifference) {
        addCodewideCandidate(4, 'T4-CODE-05', [codewide.firstPrimePosition, codewide.afterFirstPrime], { globalDifference, minimum: codewide.minimum, maximum: codewide.maximum, semanticKey: 'firstPrimeNeighborGlobalDifference' }, { positionRoles: ['Erste Primzahlposition', 'Rechter Nachbar'], codewideDerivations: ['erste Primzahl von links', 'globale kleinste Ziffer', 'globale größte Ziffer'], mathematicalRule: 'Rechter Nachbar der ersten Primzahl entspricht dem absoluten Unterschied der globalen Extremwerte' });
      }
    }
    if (codewide.minimum !== codewide.maximum && codewide.minimum < code[0] && code[0] < codewide.maximum && codewide.minimum < code[code.length - 1] && code[code.length - 1] < codewide.maximum) {
      addCodewideCandidate(4, 'T4-CODE-06', [0, code.length - 1], { minimum: codewide.minimum, maximum: codewide.maximum, semanticKey: 'edgeBetweenGlobalExtrema' }, { positionRoles: ['Erste Position', 'Letzte Position'], codewideDerivations: ['globale kleinste Ziffer', 'globale größte Ziffer'], mathematicalRule: 'Beide Randwerte liegen strikt zwischen globalem Minimum und Maximum' });
    }
    if (codewide.hasEven && codewide.hasPrime && codewide.smallestEven < codewide.largestPrime) {
      for (let targetPosition = 0; targetPosition < code.length; targetPosition++) {
        if (codewide.largestPrime >= code[targetPosition]) continue;
        addCodewideCandidate(4, 'T4-CODE-07', [targetPosition], { smallestEven: codewide.smallestEven, largestPrime: codewide.largestPrime, targetPosition, semanticKey: 'smallestEvenBelowLargestPrimeBelowTarget|' + targetPosition }, { informationStrength: 6, selectionPriority: 8, positionRoles: ['Zielposition oberhalb der größten Primzahl'], codewideDerivations: ['kleinste gerade Ziffer', 'größte vorkommende Primzahl'], mathematicalRule: 'Kleinste gerade Ziffer < größte Primzahl < Wert der Zielposition' });
      }
    }
  }

  function addTier5Candidates() {
    if (!TIER_5_UNLOCKED) return;

    for (const pair of combinations(code.length, 2)) {
      const rightPositions = pair.map(position => code.length - position);
      const comparison = relation(code[pair[0]], code[pair[1]]);
      const text = 'Für diesen Hinweis werden die Positionen von rechts gezählt. Die Zahl an Position ' + rightPositions[0] + ' ist ' + comparison + ' als die Zahl an Position ' + rightPositions[1] + '.';
      add(makeCandidate(5, 'T5-01', pair, text, 'T5-01|right|' + pair.join('-') + '|' + comparison, { informationStrength: 5, optional: true, requiresUnlock: true, specialRuleType: 'positionszaehlung-von-rechts', independentValidation: true, positionRoles: ['Vergleichsposition A von rechts', 'Vergleichsposition B von rechts'], details: { rightVisiblePositions: rightPositions, normalVisiblePositions: pair.map(position => position + 1), comparison, positionCounting: 'right' }, mathematicalRule: 'Die Rechtsposition wird mit code.length - internem Index berechnet; anschließend werden die beiden tatsächlichen Werte verglichen.' }));
    }

    for (let divisorPosition = 0; divisorPosition < code.length; divisorPosition++) {
      const divisor = code[divisorPosition];
      if (divisor <= 1) continue;
      const operandPositions = Array.from({ length: code.length }, (_, position) => position).filter(position => position !== divisorPosition);
      for (const operandIndexes of combinations(operandPositions.length, 2)) {
        const firstPosition = operandPositions[operandIndexes[0]];
        const secondPosition = operandPositions[operandIndexes[1]];
        if (code[firstPosition] === code[secondPosition]) continue;
        const firstRemainder = code[firstPosition] % divisor;
        const secondRemainder = code[secondPosition] % divisor;
        if (firstRemainder <= 0 || firstRemainder !== secondRemainder) continue;
        const positions = [firstPosition, secondPosition, divisorPosition];
        const text = 'Die Zahlen an Position ' + (firstPosition + 1) + ' und Position ' + (secondPosition + 1) + ' hinterlassen bei der Teilung durch die Zahl an Position ' + (divisorPosition + 1) + ' denselben Rest.';
        add(makeCandidate(5, 'T5-02', positions, text, 'T5-02|' + firstPosition + '-' + secondPosition + '|divisor|' + divisorPosition, { informationStrength: 5, optional: true, requiresUnlock: true, specialRuleType: 'gleicher-positiver-rest', independentValidation: true, positionRoles: ['Dividend A', 'Dividend B', 'Divisor'], details: { firstRemainder, secondRemainder, commonRemainder: firstRemainder, divisorPosition, divisorValue: divisor }, mathematicalRule: 'Zwei verschiedene Werte besitzen bei Division durch einen dritten Wert größer als 1 denselben positiven Rest.' }));
      }
    }

    const derivedEntries = [];
    const addDerivedEntry = (key, label, position) => {
      if (!Number.isInteger(position) || position < 0 || position >= code.length) return;
      derivedEntries.push({ key, label, position });
    };
    addDerivedEntry('afterFirstPrime', 'die Zahl unmittelbar nach der ersten Primzahl', codewide.afterFirstPrime);
    addDerivedEntry('beforeLastPrime', 'die Zahl unmittelbar vor der letzten Primzahl', codewide.beforeLastPrime);
    addDerivedEntry('firstEven', 'die erste gerade Zahl von links', codewide.firstEvenPosition);
    addDerivedEntry('lastOdd', 'die letzte ungerade Zahl von links', codewide.lastOddPosition);
    addDerivedEntry('afterFirstMinimum', 'die Zahl unmittelbar nach dem ersten Vorkommen des Minimums', codewide.firstMinimumPosition < code.length - 1 ? codewide.firstMinimumPosition + 1 : null);
    addDerivedEntry('beforeLastMaximum', 'die Zahl unmittelbar vor dem letzten Vorkommen des Maximums', codewide.lastMaximumPosition > 0 ? codewide.lastMaximumPosition - 1 : null);
    addDerivedEntry('medianFirstPosition', 'der Median des Codes an seinem ersten Vorkommen', codewide.medianFirstPosition);
    for (const entryIndexes of combinations(derivedEntries.length, 3)) {
      for (const order of permutations(entryIndexes.map(index => derivedEntries[index]))) {
      const positions = order.map(entry => entry.position);
      if (new Set(positions).size !== positions.length) continue;
      const values = positions.map(position => code[position]);
      const firstDifference = values[1] - values[0];
      const secondDifference = values[2] - values[1];
      let pattern = null;
      let patternText = '';
      if (firstDifference !== 0 && firstDifference === secondDifference) { pattern = 'arithmetic'; patternText = 'bilden in dieser Reihenfolge eine arithmetische Folge mit gleichem, von null verschiedenem Abstand'; }
      else if (values[0] < values[1] && values[1] < values[2]) { pattern = 'ascending'; patternText = 'bilden in dieser Reihenfolge eine streng aufsteigende Folge'; }
      else if (values[0] > values[1] && values[1] > values[2]) { pattern = 'descending'; patternText = 'bilden in dieser Reihenfolge eine streng absteigende Folge'; }
      else if (values[0] === values[2] && values[0] !== values[1]) { pattern = 'firstThirdEqual'; patternText = 'besitzen in dieser Reihenfolge denselben ersten und dritten Wert, während der mittlere Wert davon abweicht'; }
      if (!pattern) continue;
      const text = order[0].label.charAt(0).toUpperCase() + order[0].label.slice(1) + ', ' + order[1].label + ' und ' + order[2].label + ' ' + patternText + '.';
      const derivationKeys = order.map(entry => entry.key);
        add(makeCandidate(5, 'T5-03', positions, text, 'T5-03|' + derivationKeys.join('-') + '|' + pattern, { informationStrength: 6, optional: true, requiresUnlock: true, specialRuleType: 'codeweit-abgeleitetes-muster', independentValidation: true, positionRoles: order.map(entry => entry.label), details: { derivationKeys, derivationLabels: order.map(entry => entry.label), pattern, derivedValues: values }, codewideDerivations: order.map(entry => entry.label), mathematicalRule: 'Drei eindeutig aus dem gesamten Code abgeleitete Werte erfüllen das gespeicherte Muster in der genannten Reihenfolge.' }));
      }
    }

    const betweenGroups = new Map();
    for (const witness of candidateGroups[3]['T3-07']) {
      const key = witness.details.lowerPosition + '|' + witness.details.upperPosition;
      if (!betweenGroups.has(key)) betweenGroups.set(key, []);
      if (!betweenGroups.get(key).some(candidate => candidate.details.targetPosition === witness.details.targetPosition)) betweenGroups.get(key).push(witness);
    }
    for (const witnesses of betweenGroups.values()) {
      if (witnesses.length < 3) continue;
      const proofWitnesses = witnesses.slice().sort((first, second) => first.details.targetPosition - second.details.targetPosition).slice(0, 3);
      const lowerPosition = proofWitnesses[0].details.lowerPosition;
      const upperPosition = proofWitnesses[0].details.upperPosition;
      add(makeCandidate(5, 'T5-04', [], 'Einer der genannten Hinweise ist falsch!', 'T5-04|proof|' + lowerPosition + '-' + upperPosition + '|' + proofWitnesses.map(candidate => candidate.details.targetPosition).join('-'), { informationStrength: 7, optional: true, requiresUnlock: true, specialRuleType: 'genau-ein-absichtlich-falscher-hinweis', independentValidation: true, details: { lowerPosition, upperPosition, witnessSignatures: proofWitnesses.map(candidate => candidate.signature), witnessTargetPositions: proofWitnesses.map(candidate => candidate.details.targetPosition), requiredTrueWitnessCount: 3, fairnessProofType: 'three-strict-between-witnesses' }, mathematicalRule: 'Genau ein anderer Hinweis ist falsch; drei wahre Zwischenbeziehungen identifizieren den umgekehrten Vergleich eindeutig.' }));
      if (candidateGroups[5]['T5-04'].length >= 24) break;
    }
  }

  function addProductComparisonCandidate(selectedPositions) {
    const orderedPositions = freePositionOrder(selectedPositions);
    const firstProduct = code[orderedPositions[0]] * code[orderedPositions[1]];
    const secondProduct = code[orderedPositions[2]] * code[orderedPositions[3]];
    const comparison = relation(firstProduct, secondProduct);
    add(makeCandidate(4, 'T4-06', orderedPositions, tier4ProductComparisonText(code, orderedPositions), null, { informationStrength: 3, positionRoles: ['Produkt A', 'Produkt A', 'Produkt B', 'Produkt B'], details: { firstProduct, secondProduct, comparison }, mathematicalRule: 'Produkt A wird mit Produkt B verglichen' }));
  }

  function orderSmallGroup(positions) {
    if (positions.length === 2) return [positions[1], positions[0]];
    if (positions.length === 3) return [positions[1], positions[2], positions[0]];
    return freePositionOrder(positions);
  }

  function addExactlyOnePairCandidate(selectedPositions) {
    const orderedPositions = freePositionOrder(selectedPositions);
    const frequencies = new Map();
    for (const position of orderedPositions) frequencies.set(code[position], (frequencies.get(code[position]) || 0) + 1);
    const counts = Array.from(frequencies.values());
    const hasExactlyOnePair = counts.filter(count => count === 2).length === 1 && counts.every(count => count === 1 || count === 2);
    if (hasExactlyOnePair) {
      add(makeCandidate(4, 'T4-09', orderedPositions, tier4ExactlyOnePairText(orderedPositions), null, { informationStrength: 3, optional: true }));
    }
  }

  function addEqualGroupSumCandidates(selectedPositions) {
    const firstGroupSize = selectedPositions.length === 5 ? 2 : 3;
    for (const selectedIndexes of combinations(selectedPositions.length, firstGroupSize)) {
      const firstRaw = selectedIndexes.map(index => selectedPositions[index]);
      const firstSet = new Set(firstRaw);
      const secondRaw = selectedPositions.filter(position => !firstSet.has(position));
      if (selectedPositions.length === 6 && firstRaw.join('-') > secondRaw.join('-')) continue;
      const firstGroup = orderSmallGroup(firstRaw);
      const secondGroup = orderSmallGroup(secondRaw);
      const firstSum = firstGroup.reduce((sum, position) => sum + code[position], 0);
      const secondSum = secondGroup.reduce((sum, position) => sum + code[position], 0);
      const positions = firstGroup.concat(secondGroup);
      if (firstSum === secondSum) {
        const signature = 'T4-08|' + firstGroup.join('-') + '|' + secondGroup.join('-');
        add(makeCandidate(4, 'T4-08', positions, tier4EqualGroupSumsText(firstGroup, secondGroup), signature, { informationStrength: 4, optional: true, positionRoles: firstGroup.map(() => 'Gruppe A').concat(secondGroup.map(() => 'Gruppe B')), details: { firstGroup, secondGroup, firstSum, secondSum }, mathematicalRule: 'Summe Gruppe A = Summe Gruppe B' }));
      } else {
        const groupSizeKey = firstGroup.length + ':' + secondGroup.length;
        if (groupComparisonCounts[groupSizeKey] >= MAX_OPTIONAL_CANDIDATES / 2) continue;
        const relationWord = firstSum > secondSum ? 'mehr' : 'weniger';
        const signature = 'T4-14|' + firstGroup.join('-') + '|' + secondGroup.join('-') + '|' + relationWord;
        add(makeCandidate(4, 'T4-14', positions, tier4GroupComparisonText(firstGroup, secondGroup, relationWord), signature, { informationStrength: 3, optional: true, positionRoles: firstGroup.map(() => 'Gruppe A').concat(secondGroup.map(() => 'Gruppe B')), details: { firstGroup, secondGroup, firstSum, secondSum, relation: relationWord }, mathematicalRule: 'Ungleiche Summen zweier disjunkter Gruppen' }));
        groupComparisonCounts[groupSizeKey]++;
      }
    }
  }

  function addSequenceCandidates(selectedPositions) {
    const values = selectedPositions.map(position => code[position]);
    if (new Set(values).size !== values.length) return;
    const ascending = selectedPositions.slice().sort((first, second) => code[first] - code[second]);
    const descending = ascending.slice().reverse();
    if (candidateGroups[4]['T4-11'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-11', ascending, tier4StrictSequenceText(ascending, 'ascending'), null, { informationStrength: 4, optional: true, details: { direction: 'ascending' }, mathematicalRule: 'Wert 1 < Wert 2 < ...' }));
    }
    if (candidateGroups[4]['T4-12'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-12', descending, tier4StrictSequenceText(descending, 'descending'), null, { informationStrength: 4, optional: true, details: { direction: 'descending' }, mathematicalRule: 'Wert 1 > Wert 2 > ...' }));
    }
    const distance = code[ascending[1]] - code[ascending[0]];
    const arithmetic = distance > 0 && ascending.slice(1).every((position, index) => code[position] - code[ascending[index]] === distance);
    if (arithmetic && candidateGroups[4]['T4-13'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-13', ascending, tier4ArithmeticSequenceText(ascending), 'T4-13|ascending|' + ascending.join('-'), { informationStrength: 4, optional: true, details: { distance }, mathematicalRule: 'Alle aufeinanderfolgenden Differenzen sind gleich und ungleich 0' }));
      if (candidateGroups[4]['T4-13'].length < MAX_OPTIONAL_CANDIDATES) {
        add(makeCandidate(4, 'T4-13', descending, tier4ArithmeticSequenceText(descending), 'T4-13|descending|' + descending.join('-'), { informationStrength: 4, optional: true, details: { distance: -distance }, mathematicalRule: 'Alle aufeinanderfolgenden Differenzen sind gleich und ungleich 0' }));
      }
    }
  }

  function addFrequencyPatternCandidates(selectedPositions) {
    const orderedPositions = freePositionOrder(selectedPositions);
    const frequencies = new Map();
    for (const position of orderedPositions) frequencies.set(code[position], (frequencies.get(code[position]) || 0) + 1);
    const counts = Array.from(frequencies.values());
    const twoPairs = counts.filter(count => count === 2).length === 2 && counts.every(count => count === 1 || count === 2);
    if (twoPairs && candidateGroups[4]['T4-16'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-16', orderedPositions, tier4TwoPairsText(orderedPositions), null, { informationStrength: 4, optional: true, details: { frequencyCounts: counts }, mathematicalRule: 'Genau zwei verschiedene Werte kommen jeweils exakt zweimal vor' }));
    }
    if (counts.every(count => count === 1) && candidateGroups[4]['T4-17'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-17', orderedPositions, tier4AllDifferentText(orderedPositions), null, { informationStrength: 3, optional: true, details: { frequencyCounts: counts }, mathematicalRule: 'Alle ausgewählten Werte sind paarweise verschieden' }));
    }
    const exactlyThree = counts.filter(count => count === 3).length === 1 && counts.every(count => count === 1 || count === 3);
    if (exactlyThree && candidateGroups[4]['T4-22'].length < MAX_OPTIONAL_CANDIDATES) {
      add(makeCandidate(4, 'T4-22', orderedPositions, tier4ExactlyThreeEqualText(orderedPositions), null, { informationStrength: 4, optional: true, details: { frequencyCounts: counts }, mathematicalRule: 'Genau ein Wert kommt dreimal vor; alle übrigen genau einmal' }));
    }
  }

  function perfectPairings(positions) {
    if (positions.length === 0) return [[]];
    const first = positions[0];
    const result = [];
    for (let index = 1; index < positions.length; index++) {
      const pair = [first, positions[index]];
      const remaining = positions.slice(1, index).concat(positions.slice(index + 1));
      for (const rest of perfectPairings(remaining)) result.push([pair].concat(rest));
    }
    return result;
  }

  function addThreePairSumsCandidates(selectedPositions) {
    if (candidateGroups[4]['T4-18'].length >= MAX_OPTIONAL_CANDIDATES) return;
    for (const pairing of perfectPairings(selectedPositions)) {
      const sums = pairing.map(pair => code[pair[0]] + code[pair[1]]);
      if (!sums.every(sum => sum === sums[0])) continue;
      const positions = [pairing[0][0], pairing[1][0], pairing[2][0], pairing[2][1], pairing[1][1], pairing[0][1]];
      const forward = positions.join('-');
      const backward = positions.slice().reverse().join('-');
      const signature = 'T4-18|' + (forward < backward ? forward : backward);
      add(makeCandidate(4, 'T4-18', positions, tier4ThreePairSumsText(positions), signature, { informationStrength: 5, optional: true, positionRoles: ['Paar 1', 'Paar 2', 'Paar 3', 'Paar 3', 'Paar 2', 'Paar 1'], details: { pairSum: sums[0] }, mathematicalRule: 'Wert 1 + Wert 6 = Wert 2 + Wert 5 = Wert 3 + Wert 4' }));
      if (candidateGroups[4]['T4-18'].length >= MAX_OPTIONAL_CANDIDATES) return;
    }
  }

  function addPairSumDifferenceCandidates(selectedPositions) {
    if (candidateGroups[4]['T4-19'].length >= MAX_OPTIONAL_CANDIDATES) return;
    for (const targetPosition of selectedPositions) {
      const sourcePositions = selectedPositions.filter(position => position !== targetPosition);
      for (const firstIndexes of combinations(sourcePositions.length, 2)) {
        const firstRaw = firstIndexes.map(index => sourcePositions[index]);
        const firstSet = new Set(firstRaw);
        const secondRaw = sourcePositions.filter(position => !firstSet.has(position));
        if (firstRaw.join('-') > secondRaw.join('-')) continue;
        const firstGroup = orderSmallGroup(firstRaw);
        const secondGroup = orderSmallGroup(secondRaw);
        const difference = Math.abs(firstGroup.reduce((sum, position) => sum + code[position], 0) - secondGroup.reduce((sum, position) => sum + code[position], 0));
        if (difference !== code[targetPosition]) continue;
        const positions = [firstGroup[0], firstGroup[1], targetPosition, secondGroup[0], secondGroup[1]];
        add(makeCandidate(4, 'T4-19', positions, tier4PairSumDifferenceText(positions), null, { informationStrength: 5, optional: true, positionRoles: ['Summe A', 'Summe A', 'Zielposition', 'Summe B', 'Summe B'], details: { firstGroup, secondGroup, targetPosition, difference }, mathematicalRule: 'Wert C = abs((Wert A + Wert B) - (Wert D + Wert E))' }));
        if (candidateGroups[4]['T4-19'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addCheckDigitCandidates(selectedPositions) {
    if (candidateGroups[4]['T4-21'].length >= MAX_OPTIONAL_CANDIDATES) return;
    for (const targetPosition of selectedPositions) {
      const sourcePositions = freePositionOrder(selectedPositions.filter(position => position !== targetPosition));
      const sourceSum = sourcePositions.reduce((sum, position) => sum + code[position], 0);
      if (sourceSum % 10 !== code[targetPosition]) continue;
      const positions = sourcePositions.concat(targetPosition);
      add(makeCandidate(4, 'T4-21', positions, tier4CheckDigitText(sourcePositions, targetPosition), null, { informationStrength: 5, optional: true, positionRoles: sourcePositions.map(() => 'Summenposition').concat('Prüfziffer'), details: { sourcePositions, targetPosition, sourceSum, checkDigit: sourceSum % 10 }, mathematicalRule: 'Summe der Quellwerte modulo 10 = Wert der Prüfziffer' }));
      if (candidateGroups[4]['T4-21'].length >= MAX_OPTIONAL_CANDIDATES) return;
    }
  }

  function addAbcAbcCandidates() {
    const positionsByValue = Array.from({ length: 10 }, () => []);
    for (let position = 0; position < code.length; position++) positionsByValue[code[position]].push(position);
    for (let firstValue = 0; firstValue <= 9; firstValue++) {
      for (let secondValue = 0; secondValue <= 9; secondValue++) {
        for (let thirdValue = 0; thirdValue <= 9; thirdValue++) {
          if (firstValue === secondValue && secondValue === thirdValue) continue;
          const pattern = [firstValue, secondValue, thirdValue, firstValue, secondValue, thirdValue];
          const cursors = Array(10).fill(0);
          const positions = [];
          let available = true;
          for (const value of pattern) {
            if (cursors[value] >= positionsByValue[value].length) { available = false; break; }
            positions.push(positionsByValue[value][cursors[value]++]);
          }
          if (!available) continue;
          add(makeCandidate(4, 'T4-10', positions, tier4AbcAbcText(positions), null, { informationStrength: 5, optional: true, details: { patternValues: [firstValue, secondValue, thirdValue] }, mathematicalRule: 'Wertfolge A-B-C-A-B-C mit mindestens zwei verschiedenen Werten' }));
          if (candidateGroups[4]['T4-10'].length >= MAX_OPTIONAL_CANDIDATES) return;
        }
      }
    }
  }

  function l054OrderedGroups(count, familyKey) {
    const offset = stableTextHash(familyKey + '|offset|' + code.join('')) % code.length;
    const step = 1 + stableTextHash(familyKey + '|step|' + code.join('')) % (code.length - 1);
    const positionOrder = Array.from({ length: code.length }, (_, index) => (offset + index * step) % code.length);
    return combinations(code.length, count).map(group => group.map(position => positionOrder[position]));
  }

  function addL054PointBeforeCandidates() {
    for (const triple of l054OrderedGroups(3, 'T3-17')) {
      for (const termPosition of triple) {
        const factors = triple.filter(position => position !== termPosition);
        if (code[factors[0]] < 2 || code[factors[1]] < 2 || code[termPosition] < 1) continue;
        const positions = [factors[0], factors[1], termPosition];
        const plusEvaluation = l054PointBeforeEvaluation(code[factors[0]], code[factors[1]], code[termPosition], 'productPlus');
        if (plusEvaluation.didacticallyValid && plusEvaluation.result <= L054_MAX_RESULT) {
          const informationExclusionPercent = l054ExactInformation('productPlus', plusEvaluation.result);
          add(makeCandidate(3, 'T3-17', positions, tier3PointBeforeText(positions, 'productPlus', plusEvaluation.result), 'T3-17|productPlus|' + positions.join('-') + '|' + plusEvaluation.result, { informationStrength: 5, optional: true, positionRoles: ['Faktor A', 'Faktor B', 'Summand'], details: { variant: 'productPlus', result: plusEvaluation.result, leftToRightResult: plusEvaluation.leftToRightResult, visibleOperatorOrder: 'summand-plus-product', factorPositions: factors, termPosition, informationExclusionPercent }, mathematicalRule: 'Wert C + Wert A × Wert B = gespeichertes Ergebnis; eine strikt links-nach-rechts berechnete Alternative muss davon abweichen.' }));
        }
        const minusEvaluation = l054PointBeforeEvaluation(code[factors[0]], code[factors[1]], code[termPosition], 'productMinus');
        if (minusEvaluation.didacticallyValid && minusEvaluation.result >= 0 && minusEvaluation.result <= L054_MAX_RESULT) {
          const informationExclusionPercent = l054ExactInformation('productMinus', minusEvaluation.result);
          add(makeCandidate(3, 'T3-17', positions, tier3PointBeforeText(positions, 'productMinus', minusEvaluation.result), 'T3-17|productMinus|' + positions.join('-') + '|' + minusEvaluation.result, { informationStrength: 5, optional: true, positionRoles: ['Faktor A', 'Faktor B', 'Minuend'], details: { variant: 'productMinus', result: minusEvaluation.result, leftToRightResult: minusEvaluation.leftToRightResult, visibleOperatorOrder: 'minuend-minus-product', factorPositions: factors, termPosition, informationExclusionPercent }, mathematicalRule: 'Wert C - Wert A × Wert B = gespeichertes nichtnegatives Ergebnis; eine strikt links-nach-rechts berechnete Alternative muss davon abweichen.' }));
        }
        if (candidateGroups[3]['T3-17'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addL054ParenthesesCandidates() {
    for (const triple of l054OrderedGroups(3, 'T3-18')) {
      for (const multiplierPosition of triple) {
        const operands = triple.filter(position => position !== multiplierPosition);
        if (code[multiplierPosition] < 2) continue;
        const sum = code[operands[0]] + code[operands[1]];
        const plusResult = sum * code[multiplierPosition];
        if (sum > 0 && plusResult <= L054_MAX_RESULT) {
          const positions = [operands[0], operands[1], multiplierPosition];
          const informationExclusionPercent = l054ExactInformation('groupedPlus', plusResult);
          add(makeCandidate(3, 'T3-18', positions, tier3ParenthesesText(positions, 'groupedPlus', plusResult), 'T3-18|groupedPlus|' + positions.join('-') + '|' + plusResult, { informationStrength: 5, optional: true, positionRoles: ['Klammeroperand A', 'Klammeroperand B', 'Multiplikator'], details: { variant: 'groupedPlus', result: plusResult, operandPositions: operands, multiplierPosition, informationExclusionPercent }, mathematicalRule: '(Wert A + Wert B) × Wert C = gespeichertes Ergebnis; die Klammer wird zuerst berechnet.' }));
        }
        const highPosition = code[operands[0]] >= code[operands[1]] ? operands[0] : operands[1];
        const lowPosition = highPosition === operands[0] ? operands[1] : operands[0];
        const difference = code[highPosition] - code[lowPosition];
        const minusResult = difference * code[multiplierPosition];
        if (difference > 0 && minusResult <= L054_MAX_RESULT) {
          const positions = [highPosition, lowPosition, multiplierPosition];
          const informationExclusionPercent = l054ExactInformation('groupedMinus', minusResult);
          add(makeCandidate(3, 'T3-18', positions, tier3ParenthesesText(positions, 'groupedMinus', minusResult), 'T3-18|groupedMinus|' + positions.join('-') + '|' + minusResult, { informationStrength: 5, optional: true, positionRoles: ['Minuend in Klammer', 'Subtrahend in Klammer', 'Multiplikator'], details: { variant: 'groupedMinus', result: minusResult, operandPositions: [highPosition, lowPosition], multiplierPosition, informationExclusionPercent }, mathematicalRule: '(Wert A - Wert B) × Wert C = gespeichertes Ergebnis; die Klammer wird zuerst berechnet.' }));
        }
        if (candidateGroups[3]['T3-18'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addL054ProductDigitSumCandidates() {
    for (const triple of l054OrderedGroups(3, 'T3-19')) {
      for (const targetPosition of triple) {
        const factors = triple.filter(position => position !== targetPosition);
        const product = code[factors[0]] * code[factors[1]];
        const digitSum = l054DigitSum(product);
        if (product < 10 || digitSum > 9 || code[targetPosition] !== digitSum) continue;
        const positions = [factors[0], factors[1], targetPosition];
        add(makeCandidate(3, 'T3-19', positions, tier3ProductDigitSumText(positions), 'T3-19|productDigitSum|' + positions.join('-'), { informationStrength: 5, optional: true, positionRoles: ['Faktor A', 'Faktor B', 'Quersummenziel'], details: { variant: 'productDigitSum', product, digitSum, targetPosition, informationExclusionPercent: L054_PRODUCT_DIGIT_SUM_EXCLUSION_PERCENT }, mathematicalRule: 'Das mindestens zweistellige Produkt aus Wert A und Wert B besitzt eine erste Quersumme von 0 bis 9, die exakt Wert C entspricht.' }));
        if (candidateGroups[3]['T3-19'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addL054ComposedDivisibilityCandidates() {
    const orderedPairs = l054OrderedGroups(2, 'T3-20').flatMap(pair => [pair, pair.slice().reverse()]);
    for (const pair of orderedPairs) {
      if (code[pair[0]] === 0) continue;
      const composedNumber = code[pair[0]] * 10 + code[pair[1]];
      for (const divisor of L054_DIVISORS) {
        if (composedNumber % divisor !== 0) continue;
        const validNumbers = Math.floor(99 / divisor) - Math.floor(9 / divisor);
        const informationExclusionPercent = l054ExclusionPercent(validNumbers, 100);
        add(makeCandidate(3, 'T3-20', pair, tier3ComposedDivisibilityText(pair, divisor), 'T3-20|composedDivisibility|' + pair.join('-') + '|' + divisor, { informationStrength: 4, optional: true, positionRoles: ['Zehnerstelle', 'Einerstelle'], details: { variant: 'composedDivisibility', composedNumber, divisor, informationExclusionPercent }, mathematicalRule: '10 × Wert A + Wert B bildet ohne führende Null eine zweistellige Zahl, die durch den gespeicherten Divisor größer 1 teilbar ist.' }));
        if (candidateGroups[3]['T3-20'].length >= MAX_OPTIONAL_CANDIDATES) return;
      }
    }
  }

  function addL054MixedComparisonCandidates() {
    for (const positions of l054OrderedGroups(6, 'T4-23')) {
      if (code[positions[0]] < 2 || code[positions[1]] < 2 || code[positions[2]] < 1 || code[positions[3]] < 1 || code[positions[4]] < 2 || code[positions[5]] < 2) continue;
      const evaluation = l054MixedComparisonEvaluation(code, positions);
      if (!evaluation.didacticallyValid || Math.max(evaluation.leftResult, evaluation.rightResult) > L054_MAX_RESULT) continue;
      add(makeCandidate(4, 'T4-23', positions, tier4MixedExpressionComparisonText(positions, evaluation.comparison), 'T4-23|mixedComparison|' + positions.join('-') + '|' + evaluation.comparison, { informationStrength: 6, optional: true, positionRoles: ['Linker Faktor A', 'Linker Faktor B', 'Linker Summand', 'Rechter Summand', 'Rechter Faktor A', 'Rechter Faktor B'], details: { variant: 'mixedComparison', leftResult: evaluation.leftResult, rightResult: evaluation.rightResult, leftToRightLeftResult: evaluation.leftToRightLeftResult, leftToRightRightResult: evaluation.leftToRightRightResult, comparison: evaluation.comparison, leftToRightComparison: evaluation.leftToRightComparison, informationExclusionPercent: L054_MIXED_EXCLUSION_PERCENT }, mathematicalRule: 'Wert C + Wert A × Wert B wird mit Wert D + Wert E × Wert F verglichen; die strikt links-nach-rechts berechnete Vergleichsaussage muss falsch oder gleich sein.' }));
      if (candidateGroups[4]['T4-23'].length >= MAX_OPTIONAL_CANDIDATES) return;
    }
  }

  function addL054Candidates() {
    addL054PointBeforeCandidates();
    addL054ParenthesesCandidates();
    addL054ProductDigitSumCandidates();
    addL054ComposedDivisibilityCandidates();
    addL054MixedComparisonCandidates();
    for (const tier of [3, 4]) for (const id of L054_HINT_IDS) for (const candidate of candidateGroups[tier][id] || []) candidate.selectionPriority = 8;
  }

  for (let position = 0; position < code.length; position++) {
    const positions = [position];
    add(makeCandidate(1, 'T1-01', positions, tier1ParityText(code, positions)));
    add(makeCandidate(1, 'T1-02', positions, tier1PrimeText(code, positions)));
    add(makeCandidate(1, 'T1-03', positions, tier1SquareText(code, positions)));
    add(makeCandidate(1, 'T1-05', positions, tier1CompositeText(code, positions), null, { informationStrength: 2, details: { composite: COMPOSITE_DIGITS.has(code[position]) }, mathematicalRule: 'Zusammengesetzte Ziffer mit mehr als zwei positiven Teilern' }));
    add(makeCandidate(1, 'T1-06', positions, tier1PowerOfTwoText(code, positions), null, { informationStrength: 2, details: { powerOfTwo: POWER_OF_TWO_DIGITS.has(code[position]) }, mathematicalRule: 'Ziffer ist eine Potenz der Basis 2' }));
    add(makeCandidate(1, 'T1-07', positions, tier1CubeText(code, positions), null, { details: { cube: CUBE_DIGITS.has(code[position]) }, mathematicalRule: 'Ziffer ist eine Kubikzahl 0, 1 oder 8' }));
    add(makeCandidate(1, 'T1-08', positions, tier1FibonacciText(code, positions)));
    const samePositionParity = code[position] % 2 === (position + 1) % 2;
    add(makeCandidate(1, 'T1-09', positions, tier1PositionParityText(code, positions), null, { informationStrength: 2, details: { samePositionParity }, mathematicalRule: 'Parität der Ziffer im Vergleich zur sichtbaren Positionsnummer' }));
    add(makeCandidate(1, 'T1-12', positions, tier1DistinctPrimeSumText(code, positions), null, { informationStrength: 2, details: { distinctPrimeSum: DISTINCT_PRIME_SUM_DIGITS.has(code[position]) }, mathematicalRule: 'Ziffer ist als Summe zweier verschiedener Primziffern darstellbar' }));
    const factorial = FACTORIAL_DIGITS.has(code[position]);
    const factorialAllowedValues = factorial ? [1, 2, 6] : [0, 3, 4, 5, 7, 8, 9];
    add(makeCandidate(1, 'T1-13', positions, tier1FactorialText(code, positions), null, { informationStrength: factorial ? 3 : 1, details: { factorial, allowedValues: factorialAllowedValues }, mathematicalRule: 'Ziffer ist eine Fakultätszahl der Folge 1, 2, 6' }));
    add(makeCandidate(1, 'T1-14', positions, tier1TriangularText(code, positions), null, { informationStrength: 2, details: { triangular: TRIANGULAR_DIGITS.has(code[position]) }, mathematicalRule: 'Ziffer ist eine Dreieckszahl der Folge 0, 1, 3, 6' }));
    const digitHint = DIGIT_HINT_BY_DIGIT.get(code[position]);
    if (digitHint.id === 'T1-DIGIT-06') {
      for (let sourcePosition = 0; sourcePosition < code.length; sourcePosition++) {
        if (sourcePosition === position || code[sourcePosition] !== digitHint.sourceDigit) continue;
        const relationPositions = [position, sourcePosition];
        add(makeCandidate(1, digitHint.id, relationPositions, digitHintText(digitHint, relationPositions), digitHint.id + '|' + position + '|' + sourcePosition, { informationStrength: 6, optional: true, selectionPriority: 2, positionRoles: ['Fakultätsziel 6', 'Fakultätsbasis 3'], details: { digitValue: digitHint.digit, propertyKey: digitHint.propertyKey, expression: digitHint.expression, targetPosition: position, sourcePosition, sourceDigit: digitHint.sourceDigit }, mathematicalRule: 'Die Ziffer an der Quellposition ist exakt 3 und 3! = 6 bestimmt die Ziffer an der Zielposition.' }));
      }
    } else {
      add(makeCandidate(1, digitHint.id, positions, digitHintText(digitHint, positions), digitHint.id + '|' + position, { informationStrength: 6, optional: true, selectionPriority: 2, positionRoles: ['Direkt mathematisch bestimmte Ziffer'], details: { digitValue: digitHint.digit, propertyKey: digitHint.propertyKey, expression: digitHint.expression }, mathematicalRule: 'Die mathematische Eigenschaft ' + digitHint.propertyKey + ' bestimmt eindeutig die Ziffer ' + digitHint.digit + '.' }));
    }
  }

  const comparisonPositions = existingComparison.positions;
  const expectedComparisonText = comparisonText(code, comparisonPositions);
  const comparisonCandidateText = existingComparison.text === expectedComparisonText ? existingComparison.text : expectedComparisonText;
  add(makeCandidate(2, 'T2-01', comparisonPositions, comparisonCandidateText));

  for (const pair of combinations(code.length, 2)) {
    const pairSum = code[pair[0]] + code[pair[1]];
    const pairDifference = Math.abs(code[pair[0]] - code[pair[1]]);
    add(makeCandidate(2, 'T2-02', pair, tier2SumSquareText(code, pair), null, { informationStrength: 2, details: { sum: pairSum, square: SQUARE_SUMS.has(pairSum) }, mathematicalRule: 'Quadratzahleigenschaft der Summe zweier Positionen' }));
    add(makeCandidate(2, 'T2-03', pair, tier2DifferenceSquareText(code, pair), null, { informationStrength: 2, details: { difference: pairDifference, square: SQUARE_SUMS.has(pairDifference) }, mathematicalRule: 'Quadratzahleigenschaft des absoluten Unterschieds' }));
    add(makeCandidate(2, 'T2-04', pair, tier2ParityText(code, pair), null, { informationStrength: 2, details: { sameParity: code[pair[0]] % 2 === code[pair[1]] % 2 }, mathematicalRule: 'Beide Werte besitzen dieselbe oder unterschiedliche Parität' }));
    add(makeCandidate(2, 'T2-06', pair, tier2DifferenceParityText(code, pair)));
    const pairProduct = code[pair[0]] * code[pair[1]];
    const productSquare = Number.isInteger(Math.sqrt(pairProduct));
    add(makeCandidate(2, 'T2-07', pair, tier2ProductSquareText(code, pair), null, { informationStrength: productSquare ? 3 : 2, details: { product: pairProduct, square: productSquare }, mathematicalRule: 'Quadratzahleigenschaft des Produkts zweier Positionen' }));
    add(makeCandidate(2, 'T2-13', pair, tier2DifferencePrimeText(code, pair), null, { details: { difference: Math.abs(code[pair[0]] - code[pair[1]]) }, mathematicalRule: 'Primzahleigenschaft des absoluten Unterschieds' }));
    add(makeCandidate(2, 'T2-14', pair, tier2EqualityText(code, pair), null, { details: { equal: code[pair[0]] === code[pair[1]] }, mathematicalRule: 'Werte sind gleich oder verschieden' }));
    add(makeCandidate(2, 'T2-16', pair, tier2SumPrimeText(code, pair), null, { details: { sum: code[pair[0]] + code[pair[1]], prime: PRIME_SUMS.has(code[pair[0]] + code[pair[1]]) }, mathematicalRule: 'Primzahleigenschaft der Summe' }));
    if (Math.abs(code[pair[0]] - code[pair[1]]) === 1) {
      add(makeCandidate(2, 'T2-08', pair, tier2NeighborText(pair), null, { informationStrength: 3, optional: true }));
    }
    const firstValue = code[pair[0]];
    const secondValue = code[pair[1]];
    if (firstValue !== secondValue && (firstValue === secondValue * 2 || secondValue === firstValue * 2)) {
      const ratioDirection = code[pair[0]] === code[pair[1]] * 2 ? 'double' : 'half';
      add(makeCandidate(2, 'T2-09', pair, tier2DoubleHalfText(code, pair), null, { informationStrength: 3, optional: true, details: { ratioDirection }, mathematicalRule: ratioDirection === 'double' ? 'Wert A = 2 × Wert B' : 'Wert A × 2 = Wert B' }));
    }
    add(makeCandidate(2, 'T2-10', pair, tier2SumFibonacciText(code, pair), null, { informationStrength: 2, details: { sum: pairSum, fibonacci: FIBONACCI_SUMS.has(pairSum) }, mathematicalRule: 'Fibonacci-Eigenschaft der Summe zweier Positionen' }));
    for (const order of [pair, pair.slice().reverse()]) {
      const dividend = code[order[0]];
      const divisor = code[order[1]];
      if (divisor !== 0 && dividend !== divisor && dividend % divisor === 0 && dividend / divisor >= 2) {
        const strength = divisor === 1 ? 1 : 3;
        add(makeCandidate(2, 'T2-11', order, tier2DivisibilityText(order), null, { informationStrength: strength, optional: true, details: { dividend, divisor, quotient: dividend / divisor } }));
      }
      if (code[order[0]] !== 0) {
        const composedNumber = code[order[0]] * 10 + code[order[1]];
        const square = Number.isInteger(Math.sqrt(composedNumber));
        add(makeCandidate(2, 'T2-12', order, tier2ComposedSquareText(code, order), null, { informationStrength: square ? 4 : 2, details: { composedNumber, square }, mathematicalRule: 'Quadratzahleigenschaft der zweistelligen Zahl in gespeicherter Reihenfolge' }));
      }
    }
  }
  for (let mirrorIndex = 0; mirrorIndex < 5; mirrorIndex++) {
    const mirrorPair = [mirrorIndex, code.length - 1 - mirrorIndex];
    if (Math.abs(code[mirrorPair[0]] - 5) === Math.abs(code[mirrorPair[1]] - 5)) {
      add(makeCandidate(2, 'T2-15', mirrorPair, tier2MirrorDistanceText(mirrorPair), null, { informationStrength: 3, optional: true, details: { distance: Math.abs(code[mirrorPair[0]] - 5) }, mathematicalRule: 'abs(Wert A - 5) = abs(Wert B - 5)' }));
    }
  }

  for (const triple of combinations(code.length, 3)) {
    const sumComparison = relation(code[triple[0]] + code[triple[1]], code[triple[2]]);
    add(makeCandidate(3, 'T3-01', triple, tier3SumComparisonText(code, triple), null, { details: { comparison: sumComparison }, mathematicalRule: 'Summe der ersten zwei Werte wird mit dem dritten Wert verglichen' }));
    const tripleProduct = code[triple[0]] * code[triple[1]];
    const productComparison = relation(tripleProduct, code[triple[2]]);
    add(makeCandidate(3, 'T3-03', triple, tier3ProductComparisonText(code, triple), null, { informationStrength: 3, positionRoles: ['Faktor A', 'Faktor B', 'Vergleichsposition'], details: { product: tripleProduct, comparison: productComparison }, mathematicalRule: 'Produkt der ersten zwei Werte wird mit dem dritten Wert verglichen' }));
    const tripleValues = triple.map(position => code[position]);
    const distinctValueCount = new Set(tripleValues).size;
    const valuesAreDifferent = distinctValueCount === 3;
    const exactlyTwoEqual = distinctValueCount === 2 && tripleValues.some(value => tripleValues.filter(otherValue => otherValue === value).length === 2);
    if (exactlyTwoEqual) add(makeCandidate(3, 'T3-04', triple, tier3ExactlyTwoEqualText(triple), null, { informationStrength: 3, optional: true }));
    if (valuesAreDifferent) {
      const ascending = triple.slice().sort((first, second) => code[first] - code[second]);
      const descending = ascending.slice().reverse();
      add(makeCandidate(3, 'T3-02', ascending, tier3OrderText(code, ascending)));
      add(makeCandidate(3, 'T3-02', descending, tier3OrderText(code, descending)));
      const orderedByValue = triple.slice().sort((first, second) => code[first] - code[second]);
      const betweenOrder = [orderedByValue[1], orderedByValue[0], orderedByValue[2]];
      add(makeCandidate(3, 'T3-07', betweenOrder, tier3StrictBetweenText(betweenOrder), null, { informationStrength: 4, positionRoles: ['Zielposition', 'Untere Grenze', 'Obere Grenze'], details: { targetPosition: betweenOrder[0], lowerPosition: betweenOrder[1], upperPosition: betweenOrder[2] }, mathematicalRule: 'Wert der Zielposition ist strikt größer als der untere und strikt kleiner als der obere Positionswert' }));
    }
    const differenceOrder = [triple[1], triple[2], triple[0]];
    const comparedDifference = Math.abs(code[differenceOrder[0]] - code[differenceOrder[1]]);
    const differenceComparison = relation(comparedDifference, code[differenceOrder[2]]);
    add(makeCandidate(3, 'T3-08', differenceOrder, tier3DifferenceComparisonText(code, differenceOrder), null, { informationStrength: 3, positionRoles: ['Abstand A', 'Abstand B', 'Vergleichsposition'], details: { difference: comparedDifference, comparison: differenceComparison }, mathematicalRule: 'Absoluter Abstand der ersten zwei Werte wird mit dem dritten Wert verglichen' }));
    const sumParityOrder = [triple[2], triple[0], triple[1]];
    const tripleSum = sumParityOrder.reduce((sum, position) => sum + code[position], 0);
    add(makeCandidate(3, 'T3-15', sumParityOrder, tier3SumParityText(code, sumParityOrder), null, { informationStrength: 2, details: { sum: tripleSum, parity: tripleSum % 2 === 0 ? 'even' : 'odd' }, mathematicalRule: 'Parität der Summe dreier Werte' }));
    const roleOrders = [
      [triple[0], triple[1], triple[2]],
      [triple[0], triple[2], triple[1]],
      [triple[1], triple[2], triple[0]]
    ];
    for (const roleOrder of roleOrders) {
      const firstValue = code[roleOrder[0]];
      const secondValue = code[roleOrder[1]];
      const targetValue = code[roleOrder[2]];
      if (firstValue + secondValue === targetValue) {
        add(makeCandidate(3, 'T3-10', roleOrder, tier3ExactSumText(roleOrder), null, { informationStrength: 4, optional: true, positionRoles: ['Summand A', 'Summand B', 'Zielposition'], details: { targetPosition: roleOrder[2], sum: targetValue }, mathematicalRule: 'Wert A + Wert B = Wert C' }));
      }
      if (Math.abs(firstValue - secondValue) === targetValue) {
        add(makeCandidate(3, 'T3-11', roleOrder, tier3ExactDifferenceText(roleOrder), null, { informationStrength: 4, optional: true, positionRoles: ['Ausgangswert A', 'Ausgangswert B', 'Zielposition'], details: { targetPosition: roleOrder[2], difference: targetValue }, mathematicalRule: 'abs(Wert A - Wert B) = Wert C' }));
      }
      if (firstValue !== secondValue && firstValue + secondValue === 2 * targetValue) {
        add(makeCandidate(3, 'T3-12', roleOrder, tier3AverageText(roleOrder), null, { informationStrength: 4, optional: true, positionRoles: ['Außenwert A', 'Außenwert B', 'Durchschnittsposition'], details: { targetPosition: roleOrder[2], average: targetValue }, mathematicalRule: 'Wert A + Wert B = 2 × Wert C' }));
      }
      if ((firstValue * secondValue) % 10 === targetValue) {
        add(makeCandidate(3, 'T3-16', roleOrder, tier3ProductDigitText(roleOrder), null, { informationStrength: 5, optional: true, positionRoles: ['Faktor A', 'Faktor B', 'Zielposition'], details: { targetPosition: roleOrder[2], product: firstValue * secondValue, lastDigit: targetValue }, mathematicalRule: '(Wert A × Wert B) modulo 10 = Wert C' }));
      }
    }
    const rangeOrder = [triple[1], triple[2], triple[0]];
    const rangeValues = rangeOrder.map(position => code[position]);
    const rangeDistance = Math.max(...rangeValues) - Math.min(...rangeValues);
    if (rangeDistance > 0) {
      add(makeCandidate(3, 'T3-13', rangeOrder, tier3RangePrimeText(code, rangeOrder), null, { informationStrength: 3, details: { distance: rangeDistance, prime: PRIME_DIGITS.has(rangeDistance) }, mathematicalRule: 'Primzahleigenschaft des Abstands zwischen Maximum und Minimum' }));
    }
    const triangleValues = triple.map(position => code[position]).sort((first, second) => first - second);
    if (triangleValues[0] > 0 && triangleValues[0] + triangleValues[1] > triangleValues[2]) {
      const triangleOrder = [triple[1], triple[2], triple[0]];
      add(makeCandidate(3, 'T3-14', triangleOrder, tier3TriangleText(triangleOrder), null, { informationStrength: 3, optional: true, details: { sideValues: triangleOrder.map(position => code[position]) }, mathematicalRule: 'Alle Seiten > 0 und Summe der zwei kleineren Seiten > größte Seite' }));
    }
    for (const order of permutations(triple)) {
      const firstDistance = code[order[1]] - code[order[0]];
      const secondDistance = code[order[2]] - code[order[1]];
      if (firstDistance === secondDistance && firstDistance !== 0) {
        const forward = order.join('-');
        const backward = order.slice().reverse().join('-');
        const signature = 'T3-06|' + (forward < backward ? forward : backward);
        add(makeCandidate(3, 'T3-06', order, tier3ArithmeticSequenceText(order), signature, { informationStrength: 3, optional: true }));
      }
      if (code[order[0]] !== 0) {
        const composedNumber = code[order[0]] * 100 + code[order[1]] * 10 + code[order[2]];
        const palindrome = code[order[0]] === code[order[2]];
        add(makeCandidate(3, 'T3-09', order, tier3ComposedPalindromeText(code, order), null, { informationStrength: palindrome ? 4 : 2, details: { composedNumber, palindrome }, mathematicalRule: 'Palindrom-Eigenschaft der dreistelligen Zahl in gespeicherter Reihenfolge' }));
      }
    }
  }

  for (let position = 0; position < code.length; position++) {
    const frequency = code.filter(value => value === code[position]).length;
    const strength = frequency >= 2 && frequency <= 4 ? 4 : frequency === 1 ? 2 : 3;
    add(makeCandidate(4, 'T4-15', [position], tier4CodeFrequencyText([position], frequency), null, { informationStrength: strength, details: { sourcePosition: position, frequency, scope: 'entireCode' }, mathematicalRule: 'Häufigkeit des Wertes der Ausgangsposition in allen elf Codeziffern' }));
  }
  const oddPositions = Array.from({ length: code.length }, (_, index) => index).filter(index => index % 2 === 0);
  const evenPositions = Array.from({ length: code.length }, (_, index) => index).filter(index => index % 2 === 1);
  const oddPositionSum = oddPositions.reduce((sum, position) => sum + code[position], 0);
  const evenPositionSum = evenPositions.reduce((sum, position) => sum + code[position], 0);
  const positionSumComparison = relation(oddPositionSum, evenPositionSum);
  add(makeCandidate(4, 'T4-20', oddPositions.concat(evenPositions), tier4OddEvenPositionSumText(code), null, { informationStrength: 4, selectionPriority: -30, positionRoles: oddPositions.map(() => 'Ungerade sichtbare Position').concat(evenPositions.map(() => 'Gerade sichtbare Position')), details: { oddPositions, evenPositions, oddPositionSum, evenPositionSum, comparison: positionSumComparison, scope: 'entireCode' }, mathematicalRule: 'Summe der Werte an ungeraden sichtbaren Positionen wird mit der Summe an geraden sichtbaren Positionen verglichen' }));
  addAbcAbcCandidates();

  for (const selectedPositions of combinations(code.length, 4)) {
    for (const order of permutations(selectedPositions)) {
      if (code[order[0]] === code[order[3]] && code[order[1]] === code[order[2]]) {
        const forward = order.join('-');
        const backward = order.slice().reverse().join('-');
        const signature = 'T4-01|' + (forward < backward ? forward : backward);
        add(makeCandidate(4, 'T4-01', order, palindromeText(order), signature));
      }
      if (code[order[0]] === code[order[2]] && code[order[1]] === code[order[3]] && code[order[0]] !== code[order[1]]) {
        const forward = order.join('-');
        const backward = order.slice().reverse().join('-');
        const signature = 'T4-04|' + (forward < backward ? forward : backward);
        add(makeCandidate(4, 'T4-04', order, tier4AbabText(order), signature, { informationStrength: 4, optional: true }));
      }
      if (code[order[0]] === code[order[1]] && code[order[2]] === code[order[3]] && code[order[0]] !== code[order[2]]) {
        const forward = order.join('-');
        const backward = order.slice().reverse().join('-');
        const signature = 'T4-07|' + (forward < backward ? forward : backward);
        add(makeCandidate(4, 'T4-07', order, tier4AabbText(order), signature, { informationStrength: 4, optional: true, details: { pattern: 'A-A-B-B' }, mathematicalRule: 'Wertfolge A-A-B-B mit A ungleich B' }));
      }
    }
    const pairings = [
      [selectedPositions[0], selectedPositions[2], selectedPositions[1], selectedPositions[3]],
      [selectedPositions[0], selectedPositions[3], selectedPositions[2], selectedPositions[1]],
      [selectedPositions[1], selectedPositions[3], selectedPositions[0], selectedPositions[2]]
    ];
    for (const pairing of pairings) {
      add(makeCandidate(4, 'T4-02', pairing, pairSumComparisonText(code, pairing)));
      const firstDistance = Math.abs(code[pairing[0]] - code[pairing[1]]);
      const secondDistance = Math.abs(code[pairing[2]] - code[pairing[3]]);
      if (firstDistance === secondDistance && firstDistance > 0) {
        add(makeCandidate(4, 'T4-05', pairing, tier4EqualDistancesText(pairing), null, { informationStrength: 3, optional: true }));
      }
    }
    const orderedPositions = freePositionOrder(selectedPositions);
    const firstPairSum = code[orderedPositions[0]] + code[orderedPositions[1]];
    const secondPairSum = code[orderedPositions[2]] + code[orderedPositions[3]];
    const samePairSumParity = firstPairSum % 2 === secondPairSum % 2;
    add(makeCandidate(4, 'T4-03', orderedPositions, tier4PairSumParityText(code, orderedPositions), null, { informationStrength: 3, positionRoles: ['Summe A', 'Summe A', 'Summe B', 'Summe B'], details: { firstPairSum, secondPairSum, sameParity: samePairSumParity }, mathematicalRule: 'Parität von Summe A wird mit der Parität von Summe B verglichen' }));
    addProductComparisonCandidate(selectedPositions);
    addExactlyOnePairCandidate(selectedPositions);
    addSequenceCandidates(selectedPositions);
    addFrequencyPatternCandidates(selectedPositions);
    addCheckDigitCandidates(selectedPositions);
  }

  for (const selectedPositions of combinations(code.length, 5)) {
    addExactlyOnePairCandidate(selectedPositions);
    addEqualGroupSumCandidates(selectedPositions);
    addSequenceCandidates(selectedPositions);
    addFrequencyPatternCandidates(selectedPositions);
    addPairSumDifferenceCandidates(selectedPositions);
    addCheckDigitCandidates(selectedPositions);
  }

  for (const selectedPositions of combinations(code.length, 6)) {
    addExactlyOnePairCandidate(selectedPositions);
    addEqualGroupSumCandidates(selectedPositions);
    addSequenceCandidates(selectedPositions);
    addFrequencyPatternCandidates(selectedPositions);
    addThreePairSumsCandidates(selectedPositions);
    addCheckDigitCandidates(selectedPositions);
  }

  addL054Candidates();
  addCodewideCandidates();
  addTier5Candidates();

  function verifyCodewideCandidate(candidate) {
    const positions = candidate.internalPositions;
    const details = candidate.details;
    const id = candidate.id;
    let valid = false;
    if (id === 'T1-CODE-01') valid = positions.length === 1 && codewide.hasPrime && details.derivedValue === codewide.largestPrime && details.comparison === relation(codewide.largestPrime, code[positions[0]]);
    else if (id === 'T1-CODE-02') valid = positions.length === 1 && codewide.hasEven && details.derivedValue === codewide.smallestEven && details.comparison === relation(codewide.smallestEven, code[positions[0]]);
    else if (id === 'T1-CODE-03') {
      const expectedExtremum = code[positions[0]] === codewide.maximum ? 'maximum' : code[positions[0]] === codewide.minimum ? 'minimum' : 'neither';
      valid = positions.length === 1 && codewide.minimum !== codewide.maximum && details.minimum === codewide.minimum && details.maximum === codewide.maximum && details.extremum === expectedExtremum;
    } else if (id === 'T1-CODE-04') valid = positions.length === 1 && details.median === codewide.median && details.comparison === relation(codewide.median, code[positions[0]]);
    else if (id === 'T2-CODE-01') {
      const sources = {
        smallestEven: { value: codewide.smallestEven, available: codewide.hasEven, subject: 'Die kleinste gerade Zahl im Code' },
        largestPrime: { value: codewide.largestPrime, available: codewide.hasPrime, subject: 'Die größte Primzahl im Code' },
        largestOdd: { value: codewide.largestOdd, available: codewide.hasOdd, subject: 'Die größte ungerade Zahl im Code' }
      };
      const source = sources[details.sourceKey];
      if (positions.length === 2 && source && source.available && details.derivedValue === source.value && details.subject === source.subject) {
        const firstValue = code[positions[0]];
        const secondValue = code[positions[1]];
        valid = details.mode === 'greaterBoth' ? source.value > firstValue && source.value > secondValue : details.mode === 'lessBoth' ? source.value < firstValue && source.value < secondValue : details.mode === 'between' ? firstValue < source.value && source.value < secondValue : false;
      }
    }
    else if (id === 'T2-CODE-03') {
      if (positions.length === 2 && codewide.hasPrime && details.largestPrime === codewide.largestPrime) {
        const firstValue = code[positions[0]];
        const secondValue = code[positions[1]];
        valid = details.mode === 'bothGreater' ? firstValue > codewide.largestPrime && secondValue > codewide.largestPrime : details.mode === 'bothSmaller' ? firstValue < codewide.largestPrime && secondValue < codewide.largestPrime : details.mode === 'between' ? firstValue < codewide.largestPrime && codewide.largestPrime < secondValue : false;
      }
    } else if (id === 'T2-CODE-04') {
      const extremumValue = details.extremum === 'minimum' ? codewide.minimum : details.extremum === 'maximum' ? codewide.maximum : null;
      if (positions.length === 2 && Number.isInteger(extremumValue) && details.extremumValue === extremumValue) {
        const closerDistance = Math.abs(code[positions[0]] - extremumValue);
        const fartherDistance = Math.abs(code[positions[1]] - extremumValue);
        valid = closerDistance > 0 && closerDistance < fartherDistance && details.closerDistance === closerDistance && details.fartherDistance === fartherDistance;
      }
    } else if (id === 'T3-CODE-01' || id === 'T3-CODE-02') {
      const expectedAnchor = id === 'T3-CODE-01' ? codewide.firstPrimePosition : codewide.lastPrimePosition;
      const expectedNeighbor = id === 'T3-CODE-01' ? codewide.afterFirstPrime : codewide.beforeLastPrime;
      if (positions.length === 3 && Number.isInteger(expectedAnchor) && Number.isInteger(expectedNeighbor) && positions[0] === expectedAnchor && positions[1] === expectedNeighbor && positions[2] !== expectedAnchor && positions[2] !== expectedNeighbor) {
        const parity = code[expectedNeighbor] % 2 === 0 ? 'even' : 'odd';
        valid = details.anchorPosition === expectedAnchor && details.neighborPosition === expectedNeighbor && details.targetPosition === positions[2] && details.parity === parity && details.comparison === relation(code[expectedNeighbor], code[positions[2]]);
      }
    } else if (id === 'T3-CODE-03') {
      const occurrences = [
        { position: codewide.firstMinimumPosition, label: 'ersten Vorkommen der kleinsten Zahl' },
        { position: codewide.lastMinimumPosition, label: 'letzten Vorkommen der kleinsten Zahl' },
        { position: codewide.firstMaximumPosition, label: 'ersten Vorkommen der größten Zahl' },
        { position: codewide.lastMaximumPosition, label: 'letzten Vorkommen der größten Zahl' }
      ];
      const occurrence = occurrences.find(entry => entry.position === positions[0] && entry.label === details.occurrenceLabel);
      if (positions.length === 3 && codewide.minimum !== codewide.maximum && occurrence && positions[2] !== positions[0] && positions[2] !== positions[1]) {
        const expectedNeighbor = details.directionLabel === 'vor' ? positions[0] - 1 : details.directionLabel === 'nach' ? positions[0] + 1 : null;
        valid = Number.isInteger(expectedNeighbor) && expectedNeighbor >= 0 && expectedNeighbor < code.length && positions[1] === expectedNeighbor && details.occurrencePosition === positions[0] && details.neighborPosition === positions[1] && details.targetPosition === positions[2] && details.comparison === relation(code[positions[1]], code[positions[2]]);
      }
    } else if (id === 'T3-CODE-04') valid = positions.length === 2 && Number.isInteger(codewide.afterFirstPrime) && Number.isInteger(codewide.beforeLastPrime) && codewide.afterFirstPrime !== codewide.beforeLastPrime && positions[0] === codewide.afterFirstPrime && positions[1] === codewide.beforeLastPrime && details.firstPrimePosition === codewide.firstPrimePosition && details.lastPrimePosition === codewide.lastPrimePosition && details.comparison === relation(code[positions[0]], code[positions[1]]);
    else if (id === 'T4-CODE-01') valid = positions.length === 2 && positions[0] === 0 && positions[1] === code.length - 1 && codewide.hasPrime && details.maximum === codewide.maximum && details.largestPrime === codewide.largestPrime && code[0] !== codewide.maximum && code[code.length - 1] !== codewide.maximum && code[0] > codewide.largestPrime && code[code.length - 1] > codewide.largestPrime;
    else if (id === 'T4-CODE-02') valid = positions.length === 2 && positions[0] === codewide.firstPrimePosition && positions[1] === codewide.afterFirstPrime && codewide.hasPrime && codewide.hasEven && codewide.hasOdd && Number.isInteger(codewide.afterFirstPrime) && details.smallestEven === codewide.smallestEven && details.largestOdd === codewide.largestOdd && codewide.smallestEven < code[codewide.afterFirstPrime] && code[codewide.afterFirstPrime] < codewide.largestOdd;
    else if (id === 'T4-CODE-03') {
      if (positions.length === 3 && Number.isInteger(codewide.beforeFirstPrime) && Number.isInteger(codewide.afterLastPrime) && codewide.beforeFirstPrime !== codewide.afterLastPrime && positions[0] === codewide.beforeFirstPrime && positions[1] === codewide.afterLastPrime && positions[2] !== positions[0] && positions[2] !== positions[1]) {
        const derivedSum = code[positions[0]] + code[positions[1]];
        valid = derivedSum <= 9 && code[positions[2]] === derivedSum && details.derivedSum === derivedSum && details.targetPosition === positions[2];
      }
    } else if (id === 'T4-CODE-04') {
      const values = [code[codewide.firstEvenPosition], code[codewide.lastOddPosition], codewide.median];
      const ascending = values[0] < values[1] && values[1] < values[2];
      const descending = values[0] > values[1] && values[1] > values[2];
      valid = positions.length === 3 && codewide.hasEven && codewide.hasOdd && positions[0] === codewide.firstEvenPosition && positions[1] === codewide.lastOddPosition && positions[2] === codewide.medianFirstPosition && new Set(values).size === 3 && Array.isArray(details.values) && details.values.join('-') === values.join('-') && (details.direction === 'ascending' ? ascending : details.direction === 'descending' ? descending : false);
    } else if (id === 'T4-CODE-05') {
      const difference = Math.abs(codewide.maximum - codewide.minimum);
      valid = positions.length === 2 && codewide.minimum !== codewide.maximum && Number.isInteger(codewide.afterFirstPrime) && positions[0] === codewide.firstPrimePosition && positions[1] === codewide.afterFirstPrime && code[positions[1]] === difference && details.globalDifference === difference && details.minimum === codewide.minimum && details.maximum === codewide.maximum;
    } else if (id === 'T4-CODE-06') valid = positions.length === 2 && positions[0] === 0 && positions[1] === code.length - 1 && codewide.minimum !== codewide.maximum && details.minimum === codewide.minimum && details.maximum === codewide.maximum && codewide.minimum < code[0] && code[0] < codewide.maximum && codewide.minimum < code[code.length - 1] && code[code.length - 1] < codewide.maximum;
    else if (id === 'T4-CODE-07') valid = positions.length === 1 && codewide.hasEven && codewide.hasPrime && details.smallestEven === codewide.smallestEven && details.largestPrime === codewide.largestPrime && details.targetPosition === positions[0] && codewide.smallestEven < codewide.largestPrime && codewide.largestPrime < code[positions[0]];
    if (!valid) return false;
    const texts = codewideTextVariants(id, positions, details);
    let variantSeed = 2166136261;
    const variantSource = GENERATOR_SEED + '|' + id + '|' + positions.join('-') + '|' + (details.semanticKey || '') + '|' + code.join('');
    for (let index = 0; index < variantSource.length; index++) { variantSeed ^= variantSource.charCodeAt(index); variantSeed = Math.imul(variantSeed, 16777619); }
    const expectedVariantIndex = (variantSeed >>> 0) % texts.length;
    return texts.length >= 2 && details.variantIndex === expectedVariantIndex && candidate.text === texts[expectedVariantIndex] && candidate.codewideDerivations.length > 0;
  }

  function verifyCandidate(candidate) {
    if (!candidate.truth || !candidate.text || !candidate.signature) return false;
    if (!candidateGroups[candidate.tier] || !candidateGroups[candidate.tier][candidate.id]) return false;
    if (candidate.internalPositions.some(position => !Number.isInteger(position) || position < 0 || position >= code.length)) return false;
    if (new Set(candidate.internalPositions).size !== candidate.internalPositions.length) return false;
    if (candidate.visiblePositions.some((position, index) => position !== candidate.internalPositions[index] + 1)) return false;
    if (candidate.positionOrder.some((position, index) => position !== candidate.internalPositions[index])) return false;
    if (!Number.isFinite(candidate.informationStrength) || candidate.informationStrength < 1) return false;
    if (typeof candidate.optional !== 'boolean') return false;
    if (!candidate.details || typeof candidate.details !== 'object' || Array.isArray(candidate.details)) return false;
    if (!Array.isArray(candidate.codewideDerivations)) return false;
    if (!Array.isArray(candidate.positionRoles) || candidate.positionRoles.length !== candidate.internalPositions.length) return false;
    if (typeof candidate.mathematicalRule !== 'string' || candidate.mathematicalRule.length === 0) return false;
    if (typeof candidate.requiresUnlock !== 'boolean' || typeof candidate.specialRuleType !== 'string' || typeof candidate.independentValidation !== 'boolean' || !Number.isFinite(candidate.selectionPriority)) return false;
    if (candidate.tier === 5 && (!TIER_5_UNLOCKED || !candidate.requiresUnlock || !candidate.independentValidation)) return false;
    const positions = candidate.internalPositions;
    if (candidate.id.includes('-CODE-')) return verifyCodewideCandidate(candidate);
    if (DIGIT_HINT_IDS.has(candidate.id)) {
      const definition = DIGIT_HINT_DEFINITIONS.find(entry => entry.id === candidate.id);
      if (!definition || candidate.tier !== 1 || candidate.specialRuleType !== 'normal' || candidate.details.digitValue !== definition.digit || candidate.details.propertyKey !== definition.propertyKey || candidate.details.expression !== definition.expression) return false;
      if (candidate.id === 'T1-DIGIT-06') return positions.length === 2 && positions[0] !== positions[1] && code[positions[0]] === 6 && code[positions[1]] === 3 && candidate.details.targetPosition === positions[0] && candidate.details.sourcePosition === positions[1] && candidate.details.sourceDigit === 3 && candidate.text === digitHintText(definition, positions);
      return positions.length === 1 && code[positions[0]] === definition.digit && candidate.text === digitHintText(definition, positions);
    }
    if (candidate.id === 'T1-01') return candidate.text === tier1ParityText(code, positions);
    if (candidate.id === 'T1-02') return candidate.text === tier1PrimeText(code, positions);
    if (candidate.id === 'T1-03') return candidate.text === tier1SquareText(code, positions);
    if (candidate.id === 'T1-05') return positions.length === 1 && candidate.details.composite === COMPOSITE_DIGITS.has(code[positions[0]]) && candidate.text === tier1CompositeText(code, positions);
    if (candidate.id === 'T1-06') return positions.length === 1 && candidate.details.powerOfTwo === POWER_OF_TWO_DIGITS.has(code[positions[0]]) && candidate.text === tier1PowerOfTwoText(code, positions);
    if (candidate.id === 'T1-07') return positions.length === 1 && candidate.text === tier1CubeText(code, positions);
    if (candidate.id === 'T1-08') return positions.length === 1 && candidate.text === tier1FibonacciText(code, positions);
    if (candidate.id === 'T1-09') return positions.length === 1 && candidate.details.samePositionParity === (code[positions[0]] % 2 === (positions[0] + 1) % 2) && candidate.text === tier1PositionParityText(code, positions);
    if (candidate.id === 'T1-12') return positions.length === 1 && candidate.details.distinctPrimeSum === DISTINCT_PRIME_SUM_DIGITS.has(code[positions[0]]) && candidate.text === tier1DistinctPrimeSumText(code, positions);
    if (candidate.id === 'T1-13') {
      const factorial = FACTORIAL_DIGITS.has(code[positions[0]]);
      return positions.length === 1 && candidate.details.factorial === factorial && Array.isArray(candidate.details.allowedValues) && candidate.details.allowedValues.includes(code[positions[0]]) && candidate.text === tier1FactorialText(code, positions);
    }
    if (candidate.id === 'T1-14') return positions.length === 1 && candidate.details.triangular === TRIANGULAR_DIGITS.has(code[positions[0]]) && candidate.text === tier1TriangularText(code, positions);
    if (candidate.id === 'T2-01') return positions.length === 2 && positions[0] !== positions[1] && candidate.text === comparisonText(code, positions);
    if (candidate.id === 'T2-02') {
      const sum = code[positions[0]] + code[positions[1]];
      return positions.length === 2 && candidate.details.sum === sum && candidate.details.square === SQUARE_SUMS.has(sum) && candidate.text === tier2SumSquareText(code, positions);
    }
    if (candidate.id === 'T2-03') {
      const difference = Math.abs(code[positions[0]] - code[positions[1]]);
      return positions.length === 2 && candidate.details.difference === difference && candidate.details.square === SQUARE_SUMS.has(difference) && candidate.text === tier2DifferenceSquareText(code, positions);
    }
    if (candidate.id === 'T2-04') return positions.length === 2 && candidate.details.sameParity === (code[positions[0]] % 2 === code[positions[1]] % 2) && candidate.text === tier2ParityText(code, positions);
    if (candidate.id === 'T2-06') return positions.length === 2 && candidate.text === tier2DifferenceParityText(code, positions);
    if (candidate.id === 'T2-07') {
      const product = code[positions[0]] * code[positions[1]];
      const square = Number.isInteger(Math.sqrt(product));
      return positions.length === 2 && candidate.details.product === product && candidate.details.square === square && candidate.text === tier2ProductSquareText(code, positions);
    }
    if (candidate.id === 'T2-08') return positions.length === 2 && Math.abs(code[positions[0]] - code[positions[1]]) === 1 && candidate.text === tier2NeighborText(positions);
    if (candidate.id === 'T2-09') {
      const firstValue = code[positions[0]];
      const secondValue = code[positions[1]];
      const ratioDirection = firstValue === secondValue * 2 ? 'double' : 'half';
      return positions.length === 2 && firstValue !== secondValue && (firstValue === secondValue * 2 || secondValue === firstValue * 2) && candidate.details.ratioDirection === ratioDirection && candidate.text === tier2DoubleHalfText(code, positions);
    }
    if (candidate.id === 'T2-10') {
      const sum = code[positions[0]] + code[positions[1]];
      return positions.length === 2 && candidate.details.sum === sum && candidate.details.fibonacci === FIBONACCI_SUMS.has(sum) && candidate.text === tier2SumFibonacciText(code, positions);
    }
    if (candidate.id === 'T2-11') {
      const dividend = code[positions[0]];
      const divisor = code[positions[1]];
      return positions.length === 2 && divisor !== 0 && dividend !== divisor && dividend % divisor === 0 && dividend / divisor >= 2 && candidate.details.dividend === dividend && candidate.details.divisor === divisor && candidate.details.quotient === dividend / divisor && candidate.text === tier2DivisibilityText(positions);
    }
    if (candidate.id === 'T2-12') {
      const composedNumber = code[positions[0]] * 10 + code[positions[1]];
      const square = Number.isInteger(Math.sqrt(composedNumber));
      return positions.length === 2 && code[positions[0]] !== 0 && candidate.details.composedNumber === composedNumber && candidate.details.square === square && candidate.text === tier2ComposedSquareText(code, positions);
    }
    if (candidate.id === 'T2-13') {
      const difference = Math.abs(code[positions[0]] - code[positions[1]]);
      return positions.length === 2 && candidate.details.difference === difference && candidate.text === tier2DifferencePrimeText(code, positions);
    }
    if (candidate.id === 'T2-14') return positions.length === 2 && candidate.details.equal === (code[positions[0]] === code[positions[1]]) && candidate.text === tier2EqualityText(code, positions);
    if (candidate.id === 'T2-15') return positions.length === 2 && positions[0] + positions[1] === code.length - 1 && positions[0] !== 5 && Math.abs(code[positions[0]] - 5) === Math.abs(code[positions[1]] - 5) && candidate.text === tier2MirrorDistanceText(positions);
    if (candidate.id === 'T2-16') {
      const sum = code[positions[0]] + code[positions[1]];
      return positions.length === 2 && candidate.details.sum === sum && candidate.details.prime === PRIME_SUMS.has(sum) && candidate.text === tier2SumPrimeText(code, positions);
    }
    if (candidate.id === 'T3-01') return positions.length === 3 && candidate.text === tier3SumComparisonText(code, positions);
    if (candidate.id === 'T3-02') {
      const ascending = code[positions[0]] < code[positions[1]] && code[positions[1]] < code[positions[2]];
      const descending = code[positions[0]] > code[positions[1]] && code[positions[1]] > code[positions[2]];
      return positions.length === 3 && (ascending || descending) && candidate.text === tier3OrderText(code, positions);
    }
    if (candidate.id === 'T3-03') {
      const product = code[positions[0]] * code[positions[1]];
      const comparison = relation(product, code[positions[2]]);
      return positions.length === 3 && candidate.details.product === product && candidate.details.comparison === comparison && candidate.text === tier3ProductComparisonText(code, positions);
    }
    if (candidate.id === 'T3-04') {
      const values = positions.map(position => code[position]);
      const exactlyTwoEqual = new Set(values).size === 2 && values.some(value => values.filter(otherValue => otherValue === value).length === 2);
      return positions.length === 3 && exactlyTwoEqual && candidate.text === tier3ExactlyTwoEqualText(positions);
    }
    if (candidate.id === 'T3-06') {
      const firstDistance = code[positions[1]] - code[positions[0]];
      const secondDistance = code[positions[2]] - code[positions[1]];
      return positions.length === 3 && firstDistance === secondDistance && firstDistance !== 0 && candidate.text === tier3ArithmeticSequenceText(positions);
    }
    if (candidate.id === 'T3-07') {
      const targetPosition = positions[0];
      const lowerPosition = positions[1];
      const upperPosition = positions[2];
      return positions.length === 3 && new Set(positions).size === 3 && code[lowerPosition] < code[targetPosition] && code[targetPosition] < code[upperPosition] && code[lowerPosition] !== code[upperPosition] && candidate.details.targetPosition === targetPosition && candidate.details.lowerPosition === lowerPosition && candidate.details.upperPosition === upperPosition && candidate.text === tier3StrictBetweenText(positions);
    }
    if (candidate.id === 'T3-08') {
      const difference = Math.abs(code[positions[0]] - code[positions[1]]);
      const comparison = relation(difference, code[positions[2]]);
      return positions.length === 3 && candidate.details.difference === difference && candidate.details.comparison === comparison && candidate.text === tier3DifferenceComparisonText(code, positions);
    }
    if (candidate.id === 'T3-09') {
      const composedNumber = code[positions[0]] * 100 + code[positions[1]] * 10 + code[positions[2]];
      const palindrome = code[positions[0]] === code[positions[2]];
      return positions.length === 3 && code[positions[0]] !== 0 && candidate.details.composedNumber === composedNumber && candidate.details.palindrome === palindrome && candidate.text === tier3ComposedPalindromeText(code, positions);
    }
    if (candidate.id === 'T3-10') return positions.length === 3 && code[positions[0]] + code[positions[1]] === code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.text === tier3ExactSumText(positions);
    if (candidate.id === 'T3-11') return positions.length === 3 && Math.abs(code[positions[0]] - code[positions[1]]) === code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.text === tier3ExactDifferenceText(positions);
    if (candidate.id === 'T3-12') return positions.length === 3 && code[positions[0]] !== code[positions[1]] && code[positions[0]] + code[positions[1]] === 2 * code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.text === tier3AverageText(positions);
    if (candidate.id === 'T3-13') {
      const values = positions.map(position => code[position]);
      const distance = Math.max(...values) - Math.min(...values);
      return positions.length === 3 && distance > 0 && candidate.details.distance === distance && candidate.details.prime === PRIME_DIGITS.has(distance) && candidate.text === tier3RangePrimeText(code, positions);
    }
    if (candidate.id === 'T3-14') {
      const sides = positions.map(position => code[position]).sort((first, second) => first - second);
      return positions.length === 3 && sides[0] > 0 && sides[0] + sides[1] > sides[2] && candidate.text === tier3TriangleText(positions);
    }
    if (candidate.id === 'T3-15') {
      const sum = positions.reduce((total, position) => total + code[position], 0);
      return positions.length === 3 && candidate.details.sum === sum && candidate.details.parity === (sum % 2 === 0 ? 'even' : 'odd') && candidate.text === tier3SumParityText(code, positions);
    }
    if (candidate.id === 'T3-16') {
      const product = code[positions[0]] * code[positions[1]];
      return positions.length === 3 && product % 10 === code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.details.product === product && candidate.details.lastDigit === code[positions[2]] && candidate.text === tier3ProductDigitText(positions);
    }
    if (candidate.id === 'T3-17') {
      if (positions.length !== 3 || !['productPlus', 'productMinus'].includes(candidate.details.variant)) return false;
      const evaluation = l054PointBeforeEvaluation(code[positions[0]], code[positions[1]], code[positions[2]], candidate.details.variant);
      const expectedInformation = l054ExactInformation(candidate.details.variant, evaluation.result);
      return code[positions[0]] >= 2 && code[positions[1]] >= 2 && code[positions[2]] >= 1 && evaluation.didacticallyValid && evaluation.result >= 0 && evaluation.result <= L054_MAX_RESULT && candidate.details.result === evaluation.result && candidate.details.leftToRightResult === evaluation.leftToRightResult && candidate.details.termPosition === positions[2] && candidate.details.factorPositions.join('-') === positions.slice(0, 2).join('-') && candidate.details.informationExclusionPercent === expectedInformation && expectedInformation >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier3PointBeforeText(positions, candidate.details.variant, evaluation.result);
    }
    if (candidate.id === 'T3-18') {
      if (positions.length !== 3 || !['groupedPlus', 'groupedMinus'].includes(candidate.details.variant)) return false;
      const groupedValue = candidate.details.variant === 'groupedPlus' ? code[positions[0]] + code[positions[1]] : code[positions[0]] - code[positions[1]];
      const result = groupedValue * code[positions[2]];
      const expectedInformation = l054ExactInformation(candidate.details.variant, result);
      return code[positions[2]] >= 2 && groupedValue > 0 && result <= L054_MAX_RESULT && candidate.details.result === result && candidate.details.multiplierPosition === positions[2] && candidate.details.operandPositions.join('-') === positions.slice(0, 2).join('-') && candidate.details.informationExclusionPercent === expectedInformation && expectedInformation >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier3ParenthesesText(positions, candidate.details.variant, result);
    }
    if (candidate.id === 'T3-19') {
      const product = code[positions[0]] * code[positions[1]];
      const digitSum = l054DigitSum(product);
      return positions.length === 3 && product >= 10 && digitSum <= 9 && digitSum === code[positions[2]] && candidate.details.product === product && candidate.details.digitSum === digitSum && candidate.details.targetPosition === positions[2] && candidate.details.informationExclusionPercent === L054_PRODUCT_DIGIT_SUM_EXCLUSION_PERCENT && L054_PRODUCT_DIGIT_SUM_EXCLUSION_PERCENT >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier3ProductDigitSumText(positions);
    }
    if (candidate.id === 'T3-20') {
      const composedNumber = code[positions[0]] * 10 + code[positions[1]];
      const divisor = candidate.details.divisor;
      const validNumbers = L054_DIVISORS.includes(divisor) ? Math.floor(99 / divisor) - Math.floor(9 / divisor) : 100;
      const expectedInformation = l054ExclusionPercent(validNumbers, 100);
      return positions.length === 2 && code[positions[0]] !== 0 && divisor !== 0 && divisor !== 1 && L054_DIVISORS.includes(divisor) && composedNumber % divisor === 0 && candidate.details.composedNumber === composedNumber && candidate.details.informationExclusionPercent === expectedInformation && expectedInformation >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier3ComposedDivisibilityText(positions, divisor);
    }
    if (candidate.id === 'T4-01') {
      const isPalindrome = positions.length >= 4 && positions.every((position, index) => code[position] === code[positions[positions.length - 1 - index]]);
      return isPalindrome && candidate.text === palindromeText(positions);
    }
    if (candidate.id === 'T4-02') return positions.length === 4 && candidate.text === pairSumComparisonText(code, positions);
    if (candidate.id === 'T4-03') {
      const firstPairSum = code[positions[0]] + code[positions[1]];
      const secondPairSum = code[positions[2]] + code[positions[3]];
      return positions.length === 4 && candidate.details.firstPairSum === firstPairSum && candidate.details.secondPairSum === secondPairSum && candidate.details.sameParity === (firstPairSum % 2 === secondPairSum % 2) && candidate.text === tier4PairSumParityText(code, positions);
    }
    if (candidate.id === 'T4-04') return positions.length === 4 && code[positions[0]] === code[positions[2]] && code[positions[1]] === code[positions[3]] && code[positions[0]] !== code[positions[1]] && candidate.text === tier4AbabText(positions);
    if (candidate.id === 'T4-05') {
      const firstDistance = Math.abs(code[positions[0]] - code[positions[1]]);
      const secondDistance = Math.abs(code[positions[2]] - code[positions[3]]);
      return positions.length === 4 && firstDistance === secondDistance && firstDistance > 0 && candidate.text === tier4EqualDistancesText(positions);
    }
    if (candidate.id === 'T4-06') {
      const firstProduct = code[positions[0]] * code[positions[1]];
      const secondProduct = code[positions[2]] * code[positions[3]];
      const comparison = relation(firstProduct, secondProduct);
      return positions.length === 4 && candidate.details.firstProduct === firstProduct && candidate.details.secondProduct === secondProduct && candidate.details.comparison === comparison && candidate.text === tier4ProductComparisonText(code, positions);
    }
    if (candidate.id === 'T4-07') return positions.length === 4 && code[positions[0]] === code[positions[1]] && code[positions[2]] === code[positions[3]] && code[positions[0]] !== code[positions[2]] && candidate.details.pattern === 'A-A-B-B' && candidate.text === tier4AabbText(positions);
    if (candidate.id === 'T4-08') {
      const firstGroup = candidate.details.firstGroup;
      const secondGroup = candidate.details.secondGroup;
      if (!Array.isArray(firstGroup) || !Array.isArray(secondGroup) || firstGroup.concat(secondGroup).join('-') !== positions.join('-')) return false;
      const validSizes = firstGroup.length === 2 && secondGroup.length === 3 || firstGroup.length === 3 && secondGroup.length === 3;
      const allPositions = firstGroup.concat(secondGroup);
      const firstSum = firstGroup.reduce((sum, position) => sum + code[position], 0);
      const secondSum = secondGroup.reduce((sum, position) => sum + code[position], 0);
      return validSizes && new Set(allPositions).size === allPositions.length && firstSum === secondSum && candidate.text === tier4EqualGroupSumsText(firstGroup, secondGroup);
    }
    if (candidate.id === 'T4-09') {
      const frequencies = new Map();
      for (const position of positions) frequencies.set(code[position], (frequencies.get(code[position]) || 0) + 1);
      const counts = Array.from(frequencies.values());
      const hasExactlyOnePair = counts.filter(count => count === 2).length === 1 && counts.every(count => count === 1 || count === 2);
      return positions.length >= 4 && positions.length <= 6 && hasExactlyOnePair && candidate.text === tier4ExactlyOnePairText(positions);
    }
    if (candidate.id === 'T4-10') {
      const values = positions.map(position => code[position]);
      return positions.length === 6 && values[0] === values[3] && values[1] === values[4] && values[2] === values[5] && new Set(values.slice(0, 3)).size >= 2 && candidate.text === tier4AbcAbcText(positions);
    }
    if (candidate.id === 'T4-11') return positions.length >= 4 && positions.length <= 6 && positions.slice(1).every((position, index) => code[positions[index]] < code[position]) && candidate.text === tier4StrictSequenceText(positions, 'ascending');
    if (candidate.id === 'T4-12') return positions.length >= 4 && positions.length <= 6 && positions.slice(1).every((position, index) => code[positions[index]] > code[position]) && candidate.text === tier4StrictSequenceText(positions, 'descending');
    if (candidate.id === 'T4-13') {
      const distance = code[positions[1]] - code[positions[0]];
      return positions.length >= 4 && positions.length <= 6 && distance !== 0 && positions.slice(1).every((position, index) => code[position] - code[positions[index]] === distance) && candidate.details.distance === distance && candidate.text === tier4ArithmeticSequenceText(positions);
    }
    if (candidate.id === 'T4-14') {
      const firstGroup = candidate.details.firstGroup;
      const secondGroup = candidate.details.secondGroup;
      if (!Array.isArray(firstGroup) || !Array.isArray(secondGroup) || firstGroup.concat(secondGroup).join('-') !== positions.join('-')) return false;
      const validSizes = firstGroup.length === 2 && secondGroup.length === 3 || firstGroup.length === 3 && secondGroup.length === 3;
      const firstSum = firstGroup.reduce((sum, position) => sum + code[position], 0);
      const secondSum = secondGroup.reduce((sum, position) => sum + code[position], 0);
      const relationWord = firstSum > secondSum ? 'mehr' : 'weniger';
      return validSizes && new Set(positions).size === positions.length && firstSum !== secondSum && candidate.details.firstSum === firstSum && candidate.details.secondSum === secondSum && candidate.details.relation === relationWord && candidate.text === tier4GroupComparisonText(firstGroup, secondGroup, relationWord);
    }
    if (candidate.id === 'T4-15') {
      const frequency = code.filter(value => value === code[positions[0]]).length;
      return positions.length === 1 && candidate.details.sourcePosition === positions[0] && candidate.details.frequency === frequency && candidate.details.scope === 'entireCode' && candidate.text === tier4CodeFrequencyText(positions, frequency);
    }
    if (candidate.id === 'T4-16') {
      const counts = new Map();
      for (const position of positions) counts.set(code[position], (counts.get(code[position]) || 0) + 1);
      const frequencies = Array.from(counts.values());
      return positions.length >= 4 && positions.length <= 6 && frequencies.filter(count => count === 2).length === 2 && frequencies.every(count => count === 1 || count === 2) && candidate.text === tier4TwoPairsText(positions);
    }
    if (candidate.id === 'T4-17') return positions.length >= 4 && positions.length <= 6 && new Set(positions.map(position => code[position])).size === positions.length && candidate.text === tier4AllDifferentText(positions);
    if (candidate.id === 'T4-18') {
      const firstSum = code[positions[0]] + code[positions[5]];
      const secondSum = code[positions[1]] + code[positions[4]];
      const thirdSum = code[positions[2]] + code[positions[3]];
      return positions.length === 6 && firstSum === secondSum && secondSum === thirdSum && candidate.details.pairSum === firstSum && candidate.text === tier4ThreePairSumsText(positions);
    }
    if (candidate.id === 'T4-19') {
      const difference = Math.abs(code[positions[0]] + code[positions[1]] - code[positions[3]] - code[positions[4]]);
      return positions.length === 5 && difference === code[positions[2]] && candidate.details.targetPosition === positions[2] && candidate.details.difference === difference && candidate.text === tier4PairSumDifferenceText(positions);
    }
    if (candidate.id === 'T4-20') {
      const oddPositions = Array.from({ length: code.length }, (_, index) => index).filter(index => index % 2 === 0);
      const evenPositions = Array.from({ length: code.length }, (_, index) => index).filter(index => index % 2 === 1);
      const oddPositionSum = oddPositions.reduce((sum, position) => sum + code[position], 0);
      const evenPositionSum = evenPositions.reduce((sum, position) => sum + code[position], 0);
      const comparison = relation(oddPositionSum, evenPositionSum);
      return positions.length === code.length && positions.join('-') === oddPositions.concat(evenPositions).join('-') && candidate.details.oddPositions.join('-') === oddPositions.join('-') && candidate.details.evenPositions.join('-') === evenPositions.join('-') && candidate.details.oddPositionSum === oddPositionSum && candidate.details.evenPositionSum === evenPositionSum && candidate.details.comparison === comparison && candidate.details.scope === 'entireCode' && candidate.text === tier4OddEvenPositionSumText(code);
    }
    if (candidate.id === 'T4-21') {
      const sourcePositions = positions.slice(0, -1);
      const targetPosition = positions[positions.length - 1];
      const sourceSum = sourcePositions.reduce((sum, position) => sum + code[position], 0);
      return positions.length >= 4 && positions.length <= 6 && sourceSum % 10 === code[targetPosition] && candidate.details.targetPosition === targetPosition && candidate.details.sourceSum === sourceSum && candidate.details.checkDigit === code[targetPosition] && candidate.text === tier4CheckDigitText(sourcePositions, targetPosition);
    }
    if (candidate.id === 'T4-22') {
      const counts = new Map();
      for (const position of positions) counts.set(code[position], (counts.get(code[position]) || 0) + 1);
      const frequencies = Array.from(counts.values());
      return positions.length >= 4 && positions.length <= 6 && frequencies.filter(count => count === 3).length === 1 && frequencies.every(count => count === 1 || count === 3) && candidate.text === tier4ExactlyThreeEqualText(positions);
    }
    if (candidate.id === 'T4-23') {
      const evaluation = l054MixedComparisonEvaluation(code, positions);
      return positions.length === 6 && code[positions[0]] >= 2 && code[positions[1]] >= 2 && code[positions[2]] >= 1 && code[positions[3]] >= 1 && code[positions[4]] >= 2 && code[positions[5]] >= 2 && evaluation.didacticallyValid && Math.max(evaluation.leftResult, evaluation.rightResult) <= L054_MAX_RESULT && candidate.details.leftResult === evaluation.leftResult && candidate.details.rightResult === evaluation.rightResult && candidate.details.leftToRightLeftResult === evaluation.leftToRightLeftResult && candidate.details.leftToRightRightResult === evaluation.leftToRightRightResult && candidate.details.comparison === evaluation.comparison && candidate.details.leftToRightComparison === evaluation.leftToRightComparison && candidate.details.informationExclusionPercent === L054_MIXED_EXCLUSION_PERCENT && L054_MIXED_EXCLUSION_PERCENT >= MIN_HINT_EXCLUSION_PERCENT && candidate.text === tier4MixedExpressionComparisonText(positions, evaluation.comparison);
    }
    if (candidate.id === 'T5-01') {
      if (positions.length !== 2 || positions[0] === positions[1] || candidate.details.positionCounting !== 'right') return false;
      const rightPositions = positions.map(position => code.length - position);
      const comparison = relation(code[positions[0]], code[positions[1]]);
      const expectedText = 'Für diesen Hinweis werden die Positionen von rechts gezählt. Die Zahl an Position ' + rightPositions[0] + ' ist ' + comparison + ' als die Zahl an Position ' + rightPositions[1] + '.';
      return candidate.details.rightVisiblePositions.join('-') === rightPositions.join('-') && candidate.details.normalVisiblePositions.join('-') === positions.map(position => position + 1).join('-') && candidate.details.comparison === comparison && candidate.text === expectedText;
    }
    if (candidate.id === 'T5-02') {
      if (positions.length !== 3 || new Set(positions).size !== 3) return false;
      const divisor = code[positions[2]];
      const firstRemainder = divisor > 1 ? code[positions[0]] % divisor : -1;
      const secondRemainder = divisor > 1 ? code[positions[1]] % divisor : -2;
      const expectedText = 'Die Zahlen an Position ' + (positions[0] + 1) + ' und Position ' + (positions[1] + 1) + ' hinterlassen bei der Teilung durch die Zahl an Position ' + (positions[2] + 1) + ' denselben Rest.';
      return divisor > 1 && code[positions[0]] !== code[positions[1]] && firstRemainder > 0 && firstRemainder === secondRemainder && candidate.details.divisorPosition === positions[2] && candidate.details.divisorValue === divisor && candidate.details.commonRemainder === firstRemainder && candidate.details.firstRemainder === firstRemainder && candidate.details.secondRemainder === secondRemainder && candidate.text === expectedText;
    }
    if (candidate.id === 'T5-03') {
      const derivedPositionByKey = { afterFirstPrime: codewide.afterFirstPrime, beforeLastPrime: codewide.beforeLastPrime, firstEven: codewide.firstEvenPosition, lastOdd: codewide.lastOddPosition, afterFirstMinimum: codewide.firstMinimumPosition < code.length - 1 ? codewide.firstMinimumPosition + 1 : null, beforeLastMaximum: codewide.lastMaximumPosition > 0 ? codewide.lastMaximumPosition - 1 : null, medianFirstPosition: codewide.medianFirstPosition };
      const labelByKey = { afterFirstPrime: 'die Zahl unmittelbar nach der ersten Primzahl', beforeLastPrime: 'die Zahl unmittelbar vor der letzten Primzahl', firstEven: 'die erste gerade Zahl von links', lastOdd: 'die letzte ungerade Zahl von links', afterFirstMinimum: 'die Zahl unmittelbar nach dem ersten Vorkommen des Minimums', beforeLastMaximum: 'die Zahl unmittelbar vor dem letzten Vorkommen des Maximums', medianFirstPosition: 'der Median des Codes an seinem ersten Vorkommen' };
      const keys = candidate.details.derivationKeys;
      if (!Array.isArray(keys) || keys.length !== 3 || new Set(keys).size !== 3 || keys.some(key => !Object.prototype.hasOwnProperty.call(derivedPositionByKey, key))) return false;
      const expectedPositions = keys.map(key => derivedPositionByKey[key]);
      if (expectedPositions.some(position => !Number.isInteger(position)) || new Set(expectedPositions).size !== 3 || expectedPositions.join('-') !== positions.join('-')) return false;
      const values = positions.map(position => code[position]);
      const firstDifference = values[1] - values[0];
      const secondDifference = values[2] - values[1];
      let validPattern = false;
      let patternText = '';
      if (candidate.details.pattern === 'arithmetic') { validPattern = firstDifference !== 0 && firstDifference === secondDifference; patternText = 'bilden in dieser Reihenfolge eine arithmetische Folge mit gleichem, von null verschiedenem Abstand'; }
      else if (candidate.details.pattern === 'ascending') { validPattern = values[0] < values[1] && values[1] < values[2] && !(firstDifference !== 0 && firstDifference === secondDifference); patternText = 'bilden in dieser Reihenfolge eine streng aufsteigende Folge'; }
      else if (candidate.details.pattern === 'descending') { validPattern = values[0] > values[1] && values[1] > values[2] && !(firstDifference !== 0 && firstDifference === secondDifference); patternText = 'bilden in dieser Reihenfolge eine streng absteigende Folge'; }
      else if (candidate.details.pattern === 'firstThirdEqual') { validPattern = values[0] === values[2] && values[0] !== values[1]; patternText = 'besitzen in dieser Reihenfolge denselben ersten und dritten Wert, während der mittlere Wert davon abweicht'; }
      const labels = keys.map(key => labelByKey[key]);
      const expectedText = labels[0].charAt(0).toUpperCase() + labels[0].slice(1) + ', ' + labels[1] + ' und ' + labels[2] + ' ' + patternText + '.';
      return validPattern && candidate.details.derivationLabels.join('|') === labels.join('|') && candidate.details.derivedValues.join('-') === values.join('-') && candidate.codewideDerivations.join('|') === labels.join('|') && candidate.text === expectedText;
    }
    if (candidate.id === 'T5-04') {
      if (positions.length !== 0 || candidate.text !== 'Einer der genannten Hinweise ist falsch!' || candidate.specialRuleType !== 'genau-ein-absichtlich-falscher-hinweis') return false;
      const witnessSignatures = candidate.details.witnessSignatures;
      const witnessTargets = candidate.details.witnessTargetPositions;
      if (!Array.isArray(witnessSignatures) || !Array.isArray(witnessTargets) || witnessSignatures.length !== 3 || witnessTargets.length !== 3 || new Set(witnessTargets).size !== 3 || candidate.details.requiredTrueWitnessCount !== 3 || candidate.details.fairnessProofType !== 'three-strict-between-witnesses') return false;
      const witnesses = witnessSignatures.map(signature => candidateGroups[3]['T3-07'].find(candidate => candidate.signature === signature));
      return witnesses.every((witness, index) => witness && witness.details.targetPosition === witnessTargets[index] && witness.details.lowerPosition === candidate.details.lowerPosition && witness.details.upperPosition === candidate.details.upperPosition && code[witness.details.lowerPosition] < code[witness.details.targetPosition] && code[witness.details.targetPosition] < code[witness.details.upperPosition]);
    }
    return false;
  }

  for (const tier of Object.keys(candidateGroups)) {
    for (const id of Object.keys(candidateGroups[tier])) {
      const uniqueCandidates = new Map();
      for (const candidate of candidateGroups[tier][id]) {
        if (verifyCandidate(candidate)) uniqueCandidates.set(candidate.signature, candidate);
      }
      candidateGroups[tier][id] = Array.from(uniqueCandidates.values());
    }
  }

  let randomState = 2166136261;
  for (const digit of code) {
    randomState ^= digit + 48;
    randomState = Math.imul(randomState, 16777619);
  }
  for (let index = 0; index < GENERATOR_SEED.length; index++) {
    randomState ^= GENERATOR_SEED.charCodeAt(index);
    randomState = Math.imul(randomState, 16777619);
  }
  randomState >>>= 0;
  if (randomState === 0) randomState = 1831565813;

  function random() {
    randomState ^= randomState << 13;
    randomState ^= randomState >>> 17;
    randomState ^= randomState << 5;
    return (randomState >>> 0) / 4294967296;
  }

  function shuffled(values) {
    const result = values.slice();
    for (let index = result.length - 1; index > 0; index--) {
      const target = Math.floor(random() * (index + 1));
      const temporary = result[index];
      result[index] = result[target];
      result[target] = temporary;
    }
    return result;
  }

  function overlapCount(first, second) {
    const used = new Set(first.internalPositions);
    return second.internalPositions.filter(position => used.has(position)).length;
  }

  function samePositionSet(first, second) {
    if (first.internalPositions.length !== second.internalPositions.length) return false;
    const firstPositions = first.internalPositions.slice().sort((a, b) => a - b).join('-');
    const secondPositions = second.internalPositions.slice().sort((a, b) => a - b).join('-');
    return firstPositions === secondPositions;
  }

  function candidatesConflict(first, second) {
    if (first.id === second.id || first.text === second.text || first.signature === second.signature) return true;
    const ids = new Set([first.id, second.id]);
    if (ids.has('T3-CODE-04') && ids.has('T3-CODE-01')) {
      const neighborHint = first.id === 'T3-CODE-01' ? first : second;
      const pairedHint = first.id === 'T3-CODE-04' ? first : second;
      if (neighborHint.details.neighborPosition === pairedHint.details.afterFirstPrime && neighborHint.details.targetPosition === pairedHint.details.beforeLastPrime) return true;
    }
    if (ids.has('T3-CODE-04') && ids.has('T3-CODE-02')) {
      const neighborHint = first.id === 'T3-CODE-02' ? first : second;
      const pairedHint = first.id === 'T3-CODE-04' ? first : second;
      if (neighborHint.details.neighborPosition === pairedHint.details.beforeLastPrime && neighborHint.details.targetPosition === pairedHint.details.afterFirstPrime) return true;
    }
    if (!samePositionSet(first, second)) return false;
    if (first.tier === 1 && second.tier === 1 && first.internalPositions.length === 1) {
      const firstValues = first.details.allowedValues;
      const secondValues = second.details.allowedValues;
      if (Array.isArray(firstValues) && Array.isArray(secondValues) && firstValues.slice().sort().join('-') === secondValues.slice().sort().join('-')) return true;
    }
    const conflictingTypeGroups = [
      ['T1-02', 'T1-05'],
      ['T1-03', 'T1-07'],
      ['T1-13', 'T1-12'],
      ['T1-CODE-01', 'T1-CODE-02'],
      ['T1-CODE-03', 'T1-CODE-04'],
      ['T2-02', 'T2-10'],
      ['T2-02', 'T2-15'],
      ['T2-02', 'T2-16'],
      ['T2-03', 'T2-06'],
      ['T2-03', 'T2-13'],
      ['T2-04', 'T2-06'],
      ['T2-06', 'T2-13'],
      ['T2-10', 'T2-15'],
      ['T2-10', 'T2-16'],
      ['T2-01', 'T2-14'],
      ['T2-14', 'T2-15'],
      ['T2-09', 'T2-11'],
      ['T2-CODE-01', 'T2-CODE-03'],
      ['T3-01', 'T3-10'],
      ['T3-02', 'T3-06'],
      ['T3-02', 'T3-07'],
      ['T3-06', 'T3-07'],
      ['T3-06', 'T3-12'],
      ['T3-03', 'T3-16'],
      ['T3-08', 'T3-11'],
      ['T4-08', 'T4-14'],
      ['T4-11', 'T4-12'],
      ['T4-11', 'T4-13'],
      ['T4-12', 'T4-13'],
      ['T4-11', 'T4-17'],
      ['T4-12', 'T4-17'],
      ['T4-CODE-01', 'T4-CODE-06'],
      ['T5-01', 'T2-01'],
      ['T5-03', 'T3-02'],
      ['T5-03', 'T3-06'],
      ['T5-03', 'T3-12'],
      ['T5-03', 'T4-CODE-04'],
      ['T3-17', 'T3-18'],
      ['T3-17', 'T3-19'],
      ['T3-18', 'T3-19'],
      ['T3-17', 'T3-03'],
      ['T3-17', 'T3-10'],
      ['T3-17', 'T3-16'],
      ['T3-18', 'T3-03'],
      ['T3-18', 'T3-10'],
      ['T3-18', 'T3-16'],
      ['T3-19', 'T3-03'],
      ['T3-19', 'T3-16'],
      ['T3-20', 'T2-12'],
    ];
    return conflictingTypeGroups.some(group => group.includes(first.id) && group.includes(second.id));
  }

  const positionUsage = Array(code.length).fill(0);

  function usageScore(candidate) {
    if (candidate.internalPositions.length === 0) return 0;
    return candidate.internalPositions.reduce((score, position) => score + positionUsage[position], 0) / candidate.internalPositions.length;
  }

  function typeVarietyPenalty(candidate) {
    return stableTextHash('type-variety|' + candidate.tier + '|' + candidate.id + '|' + code.join('')) % 25;
  }

  const SHORT_HINT_MAX_CHARS = 82;
  const MEDIUM_HINT_MAX_CHARS = 132;
  const MAX_TIER_5_HINTS = 1;
  const EXPLICIT_LONG_HINT_IDS = new Set(['T4-08', 'T4-14', 'T4-20', 'T4-CODE-01', 'T4-CODE-02', 'T4-CODE-03', 'T4-CODE-04', 'T4-CODE-07', 'T5-01', 'T5-03']);

  function classifyHintLength(candidate) {
    const visibleLength = candidate.text.replace(/\s+/g, ' ').trim().length;
    if (candidate.id === 'T5-04') return 'kurz';
    if (EXPLICIT_LONG_HINT_IDS.has(candidate.id) || visibleLength > MEDIUM_HINT_MAX_CHARS) return 'lang';
    if (candidate.tier === 5) return 'mittel';
    if (visibleLength > SHORT_HINT_MAX_CHARS) return 'mittel';
    return 'kurz';
  }

  function lengthPairAllowed(first, second) {
    const classes = [first.lengthClass, second.lengthClass];
    if (classes[0] === 'lang' && classes[1] === 'lang') return false;
    if (classes.includes('lang')) return classes.includes('kurz');
    return true;
  }

  const tierPools = {};
  for (let tier = 1; tier <= 5; tier++) {
    tierPools[tier] = [];
    for (const id of Object.keys(candidateGroups[tier] || {})) {
      const groupCandidates = candidateGroups[tier][id];
      const orderedCandidates = L054_HINT_IDS.has(id)
        ? groupCandidates.slice().sort((first, second) => stableTextHash('l054-pool|' + first.signature) - stableTextHash('l054-pool|' + second.signature) || first.signature.localeCompare(second.signature))
        : shuffled(groupCandidates);
      const candidates = orderedCandidates
        .filter(candidate => estimateInformationExclusionPercent(candidate) >= MIN_HINT_EXCLUSION_PERCENT)
        .sort((first, second) => second.informationStrength - first.informationStrength)
        .slice(0, 18);
      for (const candidate of candidates) {
        candidate.lengthClass = classifyHintLength(candidate);
        tierPools[tier].push(candidate);
      }
    }
  }

  if (settings.mode === 'candidateAudit') {
    const generatedCandidates = Object.values(candidateGroups).flatMap(groups => Object.values(groups).flat());
    const rejectedCandidates = generatedCandidates.filter(candidate => estimateInformationExclusionPercent(candidate) < MIN_HINT_EXCLUSION_PERCENT);
    const rejectedById = {};
    for (const candidate of rejectedCandidates) rejectedById[candidate.id] = (rejectedById[candidate.id] || 0) + 1;
    return { generatedCandidateCount: generatedCandidates.length, acceptedCandidateCount: generatedCandidates.length - rejectedCandidates.length, rejectedCandidateCount: rejectedCandidates.length, rejectedById };
  }
  if (settings.mode === 'candidates') return Object.values(tierPools).flat();

  const TIER_5_RARITY_DIVISOR = 10;
  const tier5RarityBucket = stableTextHash('tier5-rarity|' + GENERATOR_SEED + '|' + code.join('')) % TIER_5_RARITY_DIVISOR;
  const tier5Available = TIER_5_UNLOCKED && tier5RarityBucket === 0 && tierPools[5].length > 0;
  const tier5TypeOrderBase = Object.keys(candidateGroups[5]);
  const tier5TypeRotation = (code.reduce((sum, value, index) => sum + value * (index + 1), 0) + stableTextHash('tier5-type|' + GENERATOR_SEED)) % tier5TypeOrderBase.length;
  const tier5TypeOrder = tier5TypeOrderBase.slice(tier5TypeRotation).concat(tier5TypeOrderBase.slice(0, tier5TypeRotation));
  const packageTierPatterns = [
    [[2, 1], [1, 2], [2, 2], [1, 1], [2, 3]],
    [[1, 3], [2, 3], [1, 2], [2, 2], [3, 3]],
    [[2, 3], [3, 2], [2, 4], [3, 3], [3, 4]],
    [[3, 4], [2, 4], [3, 3], [2, 3], [4, 4]],
    (tier5Available ? [[5, 2], [2, 5]] : []).concat([[3, 4], [4, 3], [3, 3], [2, 4], [4, 2]])
  ];
  const selected = [];
  const usedIds = new Set();
  const usedTexts = new Set();
  const usedSignatures = new Set();
  let repeatedTypeFallbackUsed = false;

  function conflictsWithPrevious(candidate, allowRepeatedIds) {
    if (usedTexts.has(candidate.text) || usedSignatures.has(candidate.signature)) return true;
    for (const previous of selected) {
      if (previous.id === candidate.id) {
        if (!allowRepeatedIds || samePositionSet(previous, candidate)) return true;
        continue;
      }
      if (candidatesConflict(previous, candidate)) return true;
    }
    return false;
  }

  function shuffledSelectionPool(source) {
    const existing = source.filter(candidate => !L054_HINT_IDS.has(candidate.id));
    const additions = source.filter(candidate => L054_HINT_IDS.has(candidate.id))
      .sort((first, second) => stableTextHash('l054-selection|' + first.signature) - stableTextHash('l054-selection|' + second.signature) || first.signature.localeCompare(second.signature));
    return shuffled(existing).concat(additions);
  }

  function selectPackage(packageIndex, requiredId) {
    const patterns = packageTierPatterns[packageIndex];
    for (const allowRepeatedIds of [false, true]) {
      for (let patternIndex = 0; patternIndex < patterns.length; patternIndex++) {
        const pattern = patterns[patternIndex];
        const rankCandidate = candidate => usageScore(candidate) * 14 + (candidate.lengthClass === 'lang' ? 6 : candidate.lengthClass === 'mittel' ? 3 : 0) - candidate.informationStrength + candidate.selectionPriority + typeVarietyPenalty(candidate) + (candidate.tier === 5 ? tier5TypeOrder.indexOf(candidate.id) * 1000 : 0);
        const firstSource = requiredId ? tierPools[pattern[0]].filter(candidate => candidate.id === requiredId) : tierPools[pattern[0]];
        const firstPool = shuffledSelectionPool(firstSource).sort((first, second) => rankCandidate(first) - rankCandidate(second)).slice(0, 48);
        const secondPool = shuffledSelectionPool(tierPools[pattern[1]]).sort((first, second) => rankCandidate(first) - rankCandidate(second)).slice(0, 48);
        let bestPair = null;
        let bestScore = Number.POSITIVE_INFINITY;
        for (const first of firstPool) {
          if (requiredId && first.id !== requiredId) continue;
          if (first.tier === 5 && selected.some(candidate => candidate.tier === 5)) continue;
          if (!allowRepeatedIds && usedIds.has(first.id)) continue;
          if (conflictsWithPrevious(first, allowRepeatedIds)) continue;
          for (const second of secondPool) {
            if (first === second || first.id === second.id || first.text === second.text || first.signature === second.signature) continue;
            if (second.tier === 5 && (first.tier === 5 || selected.some(candidate => candidate.tier === 5))) continue;
            if (!allowRepeatedIds && usedIds.has(second.id)) continue;
            if (conflictsWithPrevious(second, allowRepeatedIds) || candidatesConflict(first, second) || !lengthPairAllowed(first, second)) continue;
            const overlap = overlapCount(first, second);
            const lengthPenalty = first.lengthClass === 'lang' || second.lengthClass === 'lang' ? 6 : first.lengthClass === 'mittel' && second.lengthClass === 'mittel' ? 4 : 0;
            const tier5TypePenalty = (first.tier === 5 ? tier5TypeOrder.indexOf(first.id) * 1000 : 0) + (second.tier === 5 ? tier5TypeOrder.indexOf(second.id) * 1000 : 0);
            const score = patternIndex * 10000 + overlap * 8 + (usageScore(first) + usageScore(second)) * 14 + lengthPenalty + tier5TypePenalty - first.informationStrength - second.informationStrength + first.selectionPriority + second.selectionPriority + typeVarietyPenalty(first) + typeVarietyPenalty(second);
            if (score < bestScore) {
              bestPair = [first, second];
              bestScore = score;
            }
          }
        }
        if (!bestPair) continue;
        if (allowRepeatedIds) repeatedTypeFallbackUsed = true;
        for (let position = 0; position < bestPair.length; position++) {
          const candidate = bestPair[position];
          candidate.packageNumber = packageIndex + 1;
          candidate.packagePosition = position + 1;
          selected.push(candidate);
          usedIds.add(candidate.id);
          usedTexts.add(candidate.text);
          usedSignatures.add(candidate.signature);
          for (const internalPosition of candidate.internalPositions) positionUsage[internalPosition]++;
        }
        return;
      }
    }
    throw new Error('Paket ' + (packageIndex + 1) + ' konnte nicht mit zwei gültigen Hinweisen gefüllt werden.');
  }

  function verifyIntentionallyFalseComparison(candidate) {
    if (!candidate || candidate.id !== 'T2-01' || candidate.truth !== false || candidate.intentionallyFalse !== true || candidate.internalPositions.length !== 2) return false;
    const firstPosition = candidate.internalPositions[0];
    const secondPosition = candidate.internalPositions[1];
    if (firstPosition === secondPosition || code[firstPosition] >= code[secondPosition]) return false;
    const expectedFalseText = 'Die Zahl an Position ' + (firstPosition + 1) + ' ist größer als die Zahl an Position ' + (secondPosition + 1) + '.';
    return candidate.text === expectedFalseText && candidate.details.actualRelation === 'kleiner' && candidate.details.falseRelation === 'größer' && candidate.details.independentlyConfirmedFalse === true;
  }

  function applyT504Structure() {
    const metaIndex = selected.findIndex(candidate => candidate.id === 'T5-04');
    if (metaIndex < 0) return;
    const metaCandidate = selected[metaIndex];
    const witnessCandidates = metaCandidate.details.witnessSignatures.map(signature => candidateGroups[3]['T3-07'].find(candidate => candidate.signature === signature));
    if (witnessCandidates.some(candidate => !candidate || !verifyCandidate(candidate))) throw new Error('T5-04 wurde verworfen: Die drei unabhängigen Zwischenhinweise sind nicht vollständig wahr.');
    for (const witness of witnessCandidates) witness.lengthClass = classifyHintLength(witness);

    const packageIndexes = [1, 2, 3];
    const assignedWitnesses = new Set();
    const assignedPackages = new Set();
    for (const packageIndex of packageIndexes) {
      for (let slot = 0; slot < 2; slot++) {
        const selectedIndex = packageIndex * 2 + slot;
        const witnessIndex = witnessCandidates.findIndex(candidate => candidate.signature === selected[selectedIndex].signature);
        if (witnessIndex >= 0 && !assignedWitnesses.has(witnessIndex)) {
          assignedWitnesses.add(witnessIndex);
          assignedPackages.add(packageIndex);
        }
      }
    }
    const remainingWitnessIndexes = witnessCandidates.map((candidate, index) => index).filter(index => !assignedWitnesses.has(index));
    const remainingPackages = packageIndexes.filter(packageIndex => !assignedPackages.has(packageIndex));
    if (remainingWitnessIndexes.length !== remainingPackages.length) throw new Error('T5-04 wurde verworfen: Die Fairness-Hinweise lassen sich nicht eindeutig auf drei Pakete verteilen.');
    for (let index = 0; index < remainingPackages.length; index++) {
      const packageIndex = remainingPackages[index];
      const witness = witnessCandidates[remainingWitnessIndexes[index]];
      const firstIndex = packageIndex * 2;
      const packageCandidates = [selected[firstIndex], selected[firstIndex + 1]];
      const preferredSlot = packageCandidates.findIndex(candidate => candidate.id === 'T3-07');
      const longSlot = packageCandidates.findIndex(candidate => candidate.lengthClass === 'lang');
      const slotOrder = Array.from(new Set([preferredSlot, longSlot, 0, 1].filter(slot => slot >= 0)));
      const replaceSlot = slotOrder.find(slot => { const partner = packageCandidates[slot === 0 ? 1 : 0]; return partner.id !== witness.id && !candidatesConflict(witness, partner) && lengthPairAllowed(witness, partner); });
      if (!Number.isInteger(replaceSlot)) throw new Error('T5-04 wurde verworfen: Ein Fairness-Hinweis verletzt die Typ-, Doppelungs- oder Längenregel seines Pakets.');
      selected[firstIndex + replaceSlot] = Object.assign({}, witness, { packageNumber: packageIndex + 1, packagePosition: replaceSlot + 1 });
    }

    const lowerPosition = metaCandidate.details.lowerPosition;
    const upperPosition = metaCandidate.details.upperPosition;
    const originalTrueText = comparisonText(code, [lowerPosition, upperPosition]);
    const falseText = 'Die Zahl an Position ' + (lowerPosition + 1) + ' ist größer als die Zahl an Position ' + (upperPosition + 1) + '.';
    const comparisonIndex = settings.rankSelector ? 1 : 0;
    const originalComparison = selected[comparisonIndex];
    const falseCandidate = Object.assign({}, originalComparison, {
      internalPositions: [lowerPosition, upperPosition],
      visiblePositions: [lowerPosition + 1, upperPosition + 1],
      positionOrder: [lowerPosition, upperPosition],
      positionRoles: ['Tatsächlich kleinere Position', 'Tatsächlich größere Position'],
      text: falseText,
      canonicalText: falseText,
      signature: 'T5-04-FALSE|T2-01|' + lowerPosition + '-' + upperPosition,
      truth: false,
      intentionallyFalse: true,
      specialRuleType: 'absichtlich-falscher-vergleich-fuer-T5-04',
      independentValidation: true,
      details: { actualRelation: 'kleiner', falseRelation: 'größer', originalTrueText, falseText, independentlyConfirmedFalse: true, metaHintId: 'T5-04' },
      mathematicalRule: 'Für T5-04 wird der nachweislich wahre Kleiner-Vergleich plausibel, aber absichtlich falsch als Größer-Vergleich ausgegeben.'
    });
    falseCandidate.lengthClass = classifyHintLength(falseCandidate);
    if (!verifyIntentionallyFalseComparison(falseCandidate)) throw new Error('T5-04 wurde verworfen: Der umgekehrte Vergleich ist nicht unabhängig als falsch bestätigt.');
    selected[comparisonIndex] = falseCandidate;

    const eightOtherTrueHints = selected.filter((candidate, index) => index !== metaIndex && index !== comparisonIndex);
    metaCandidate.details = Object.assign({}, metaCandidate.details, { falseHintId: falseCandidate.id, falseHintIndex: comparisonIndex, originalTrueVariant: originalTrueText, generatedFalseVariant: falseText, confirmedFalseTruthValue: false, otherEightHintsTrue: eightOtherTrueHints.length === 8 && eightOtherTrueHints.every(candidate => candidate.truth === true), exactlyOneFalse: true, fairnessValidated: true, fairnessReason: 'Drei verschiedene wahre Zwischenhinweise erzwingen dieselbe kleinere und größere Grenze. Wäre der umgekehrte Vergleich wahr, wären alle drei Zwischenhinweise zugleich falsch; daher ist der Vergleich eindeutig der einzige falsche Hinweis.' });
    metaCandidate.fairnessValidated = true;
    metaCandidate.falseHintId = falseCandidate.id;
  }

  function applyLanguageVariants() {
    const usedVisibleTexts = new Set();
    const openingUsage = new Map();
    const templateUsage = new Map();
    let exactPositionOpeningCount = 0;
    let previousOpening = '';

    for (let packageIndex = 0; packageIndex < 5; packageIndex++) {
      const firstCandidate = selected[packageIndex * 2];
      const secondCandidate = selected[packageIndex * 2 + 1];
      const firstVariants = languageVariantsForCandidate(firstCandidate, code);
      const secondVariants = languageVariantsForCandidate(secondCandidate, code);
      const combinations = [];

      for (const firstVariant of firstVariants) {
        for (const secondVariant of secondVariants) {
          if (firstVariant.text === secondVariant.text || usedVisibleTexts.has(firstVariant.text) || usedVisibleTexts.has(secondVariant.text)) continue;
          const addedExactOpenings = Number(firstVariant.text.startsWith('Die Zahl an Position')) + Number(secondVariant.text.startsWith('Die Zahl an Position'));
          if (exactPositionOpeningCount + addedExactOpenings > 2) continue;
          const firstLength = classifyHintLength(Object.assign({}, firstCandidate, { text: firstVariant.text }));
          const secondLength = classifyHintLength(Object.assign({}, secondCandidate, { text: secondVariant.text }));
          if (!lengthPairAllowed({ lengthClass: firstLength }, { lengthClass: secondLength })) continue;
          combinations.push({ firstVariant, secondVariant, firstLength, secondLength });
        }
      }

      if (combinations.length === 0) throw new Error('Für Hinweispaket ' + (packageIndex + 1) + ' wurde keine sprachlich und längenmäßig zulässige Variante gefunden.');
      let eligible = combinations;
      const differentPackageOpenings = eligible.filter(entry => entry.firstVariant.opening !== entry.secondVariant.opening);
      if (differentPackageOpenings.length > 0) eligible = differentPackageOpenings;
      const differentAdjacentOpening = eligible.filter(entry => !previousOpening || entry.firstVariant.opening !== previousOpening);
      if (differentAdjacentOpening.length > 0) eligible = differentAdjacentOpening;

      let best = null;
      let bestScore = Number.POSITIVE_INFINITY;
      for (const entry of eligible) {
        const firstTemplateFamily = entry.firstVariant.id.replace(/-\d+$/, '');
        const secondTemplateFamily = entry.secondVariant.id.replace(/-\d+$/, '');
        const openingPenalty = (openingUsage.get(entry.firstVariant.opening) || 0) + (openingUsage.get(entry.secondVariant.opening) || 0);
        const templatePenalty = (templateUsage.get(firstTemplateFamily) || 0) + (templateUsage.get(secondTemplateFamily) || 0);
        const exactOpeningPenalty = Number(entry.firstVariant.text.startsWith('Die Zahl an Position')) + Number(entry.secondVariant.text.startsWith('Die Zahl an Position'));
        const stableTieBreaker = (entry.firstVariant.stableRank + entry.secondVariant.stableRank) % 1009;
        const score = openingPenalty * 600 + templatePenalty * 180 + exactOpeningPenalty * 250 + stableTieBreaker;
        if (score < bestScore) {
          best = entry;
          bestScore = score;
        }
      }

      const assignments = [
        { candidate: firstCandidate, variant: best.firstVariant, lengthClass: best.firstLength },
        { candidate: secondCandidate, variant: best.secondVariant, lengthClass: best.secondLength }
      ];
      for (const assignment of assignments) {
        assignment.candidate.text = assignment.variant.text;
        assignment.candidate.languageTemplateId = assignment.variant.id;
        assignment.candidate.languageVariantCount = languageVariantsForCandidate(assignment.candidate, code).length;
        assignment.candidate.sentenceOpening = assignment.variant.opening;
        assignment.candidate.lengthClass = assignment.lengthClass;
        usedVisibleTexts.add(assignment.variant.text);
        openingUsage.set(assignment.variant.opening, (openingUsage.get(assignment.variant.opening) || 0) + 1);
        const templateFamily = assignment.variant.id.replace(/-\d+$/, '');
        templateUsage.set(templateFamily, (templateUsage.get(templateFamily) || 0) + 1);
        if (assignment.variant.text.startsWith('Die Zahl an Position')) exactPositionOpeningCount++;
        previousOpening = assignment.variant.opening;
      }
    }

    if (exactPositionOpeningCount > 2) throw new Error('Die exakte Satzeröffnung "Die Zahl an Position" wird zu häufig verwendet.');
  }

  function finalizeSelection() {
  applyT504Structure();
  applyLanguageVariants();

  if (selected.length !== 10) throw new Error('Es wurden nicht genau zehn normale Hinweise erzeugt.');
  if (new Set(selected.map(candidate => candidate.text)).size !== selected.length) throw new Error('Die normalen Hinweispakete enthalten doppelte Texte.');
  const tier5Count = selected.filter(candidate => candidate.tier === 5).length;
  if (!TIER_5_UNLOCKED && tier5Count !== 0) throw new Error('Tier 5 wurde vor seiner Freischaltung ausgewählt.');
  if (tier5Count > MAX_TIER_5_HINTS) throw new Error('Mehr als ein Tier-5-Hinweis wurde ausgewählt.');
  const selectedMetaHint = selected.find(candidate => candidate.id === 'T5-04');
  if (selectedMetaHint) {
    const otherHints = selected.filter(candidate => candidate !== selectedMetaHint);
    const falseHints = otherHints.filter(candidate => candidate.truth === false);
    const trueHints = otherHints.filter(candidate => candidate.truth === true);
    if (selectedMetaHint.text !== 'Einer der genannten Hinweise ist falsch!' || selectedMetaHint.truth !== true || falseHints.length !== 1 || trueHints.length !== 8 || !verifyIntentionallyFalseComparison(falseHints[0]) || selectedMetaHint.fairnessValidated !== true || selectedMetaHint.details.otherEightHintsTrue !== true || selectedMetaHint.details.exactlyOneFalse !== true) throw new Error('T5-04 verletzt die Wahrheits- oder Fairnessstruktur aus einem Metahinweis, acht wahren und genau einem falschen Hinweis.');
  } else if (selected.some(candidate => candidate.truth !== true)) throw new Error('Außerhalb von T5-04 wurde ein nicht wahrer Hinweis ausgewählt.');
  for (let packageIndex = 0; packageIndex < 5; packageIndex++) {
    const first = selected[packageIndex * 2];
    const second = selected[packageIndex * 2 + 1];
    if (!first || !second || first.packageNumber !== packageIndex + 1 || second.packageNumber !== packageIndex + 1) throw new Error('Ein Hinweispaket ist unvollständig.');
    if (first.id === second.id || (!first.intentionallyFalse && !second.intentionallyFalse && candidatesConflict(first, second)) || !lengthPairAllowed(first, second)) throw new Error('Ein Hinweispaket verletzt Typ-, Doppelungs- oder Längenregeln.');
  }
  for (const candidate of selected) candidate.repeatedTypeFallbackUsed = repeatedTypeFallbackUsed;
  return selected;
  }
  if (typeof settings.rankSelector === 'function') {
    return settings.rankSelector({code, tierPools, candidateGroups, selected,
      tier5Available, candidatesConflict, samePositionSet,
      lengthPairAllowed, classifyHintLength, estimateInformationExclusionPercent,
      minimumInformationPercent: MIN_HINT_EXCLUSION_PERCENT,
      toInternalHint}, finalizeSelection);
  }
  selectPackage(0, 'T2-01');
  selectPackage(1);
  selectPackage(2);
  selectPackage(3);
  selectPackage(4);
  return finalizeSelection();
}

const GENERATOR_VERSION = 1;
const ACTIVE_HINT_IDS = Object.freeze([
  "T1-01",
  "T1-02",
  "T1-03",
  "T1-05",
  "T1-06",
  "T1-07",
  "T1-08",
  "T1-09",
  "T1-12",
  "T1-13",
  "T1-14",
  "T1-DIGIT-00",
  "T1-DIGIT-01",
  "T1-DIGIT-02",
  "T1-DIGIT-03",
  "T1-DIGIT-04",
  "T1-DIGIT-05",
  "T1-DIGIT-06",
  "T1-DIGIT-07",
  "T1-DIGIT-08",
  "T1-DIGIT-09",
  "T1-CODE-01",
  "T1-CODE-02",
  "T1-CODE-03",
  "T2-01",
  "T2-02",
  "T2-03",
  "T2-04",
  "T2-06",
  "T2-07",
  "T2-08",
  "T2-09",
  "T2-10",
  "T2-11",
  "T2-12",
  "T2-13",
  "T2-14",
  "T2-15",
  "T2-16",
  "T2-CODE-01",
  "T2-CODE-03",
  "T2-CODE-04",
  "T3-01",
  "T3-02",
  "T3-03",
  "T3-04",
  "T3-06",
  "T3-07",
  "T3-08",
  "T3-09",
  "T3-10",
  "T3-11",
  "T3-12",
  "T3-13",
  "T3-14",
  "T3-15",
  "T3-16",
  "T3-17",
  "T3-18",
  "T3-19",
  "T3-20",
  "T3-CODE-01",
  "T3-CODE-02",
  "T3-CODE-03",
  "T3-CODE-04",
  "T4-01",
  "T4-02",
  "T4-03",
  "T4-04",
  "T4-05",
  "T4-06",
  "T4-07",
  "T4-08",
  "T4-09",
  "T4-10",
  "T4-11",
  "T4-12",
  "T4-13",
  "T4-14",
  "T4-15",
  "T4-16",
  "T4-17",
  "T4-18",
  "T4-19",
  "T4-20",
  "T4-21",
  "T4-22",
  "T4-23",
  "T4-CODE-01",
  "T4-CODE-02",
  "T4-CODE-03",
  "T4-CODE-05",
  "T4-CODE-06",
  "T4-CODE-07",
  "T1-CODE-04",
  "T4-CODE-04",
  "T5-01",
  "T5-02",
  "T5-03",
  "T5-04"
]);
const CONFLICTING_TYPE_GROUPS = Object.freeze([
  [
    "T1-02",
    "T1-05"
  ],
  [
    "T1-03",
    "T1-07"
  ],
  [
    "T1-13",
    "T1-12"
  ],
  [
    "T1-CODE-01",
    "T1-CODE-02"
  ],
  [
    "T1-CODE-03",
    "T1-CODE-04"
  ],
  [
    "T2-02",
    "T2-10"
  ],
  [
    "T2-02",
    "T2-15"
  ],
  [
    "T2-02",
    "T2-16"
  ],
  [
    "T2-03",
    "T2-06"
  ],
  [
    "T2-03",
    "T2-13"
  ],
  [
    "T2-04",
    "T2-06"
  ],
  [
    "T2-06",
    "T2-13"
  ],
  [
    "T2-10",
    "T2-15"
  ],
  [
    "T2-10",
    "T2-16"
  ],
  [
    "T2-01",
    "T2-14"
  ],
  [
    "T2-14",
    "T2-15"
  ],
  [
    "T2-09",
    "T2-11"
  ],
  [
    "T2-CODE-01",
    "T2-CODE-03"
  ],
  [
    "T3-01",
    "T3-10"
  ],
  [
    "T3-02",
    "T3-06"
  ],
  [
    "T3-02",
    "T3-07"
  ],
  [
    "T3-06",
    "T3-07"
  ],
  [
    "T3-06",
    "T3-12"
  ],
  [
    "T3-03",
    "T3-16"
  ],
  [
    "T3-08",
    "T3-11"
  ],
  [
    "T4-08",
    "T4-14"
  ],
  [
    "T4-11",
    "T4-12"
  ],
  [
    "T4-11",
    "T4-13"
  ],
  [
    "T4-12",
    "T4-13"
  ],
  [
    "T4-11",
    "T4-17"
  ],
  [
    "T4-12",
    "T4-17"
  ],
  [
    "T4-CODE-01",
    "T4-CODE-06"
  ],
  [
    "T5-01",
    "T2-01"
  ],
  [
    "T5-03",
    "T3-02"
  ],
  [
    "T5-03",
    "T3-06"
  ],
  [
    "T5-03",
    "T3-12"
  ],
  [
    "T5-03",
    "T4-CODE-04"
  ],
  [
    "T3-17",
    "T3-18"
  ],
  [
    "T3-17",
    "T3-19"
  ],
  [
    "T3-18",
    "T3-19"
  ],
  [
    "T3-17",
    "T3-03"
  ],
  [
    "T3-17",
    "T3-10"
  ],
  [
    "T3-17",
    "T3-16"
  ],
  [
    "T3-18",
    "T3-03"
  ],
  [
    "T3-18",
    "T3-10"
  ],
  [
    "T3-18",
    "T3-16"
  ],
  [
    "T3-19",
    "T3-03"
  ],
  [
    "T3-19",
    "T3-16"
  ],
  [
    "T3-20",
    "T2-12"
  ]
].map((group) => Object.freeze(group)));
const GENERATOR_POLICY = Object.freeze({
  hintCount: 10,
  packageCount: 5,
  hintsPerPackage: 2,
  maximumTier5Hints: 1,
  tier5RarityDivisor: 10,
  shortHintMaximumCharacters: 82,
  mediumHintMaximumCharacters: 132,
  t504Text: 'Einer der genannten Hinweise ist falsch!',
  minimumHintExclusionPercent: MIN_HINT_EXCLUSION_PERCENT,
  informationFilterVersion: 'visible-semantic-l055b-v1',
});
const INTERNAL_ONLY_FIELDS = Object.freeze([
  'signature', 'truthValue', 'mathematicalRule', 'internalPositions', 'details',
  'specialRule', 'independentValidation', 'codewideDerivations'
]);

function requireInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Generatorparameter fehlen.');
  if (typeof input.solutionCode !== 'string' || !/^\d{11}$/.test(input.solutionCode)) throw new Error('solutionCode muss serverseitig aus exakt elf Ziffern bestehen.');
  if (input.generatorVersion !== GENERATOR_VERSION) throw new Error('Generatorversion wird nicht unterstützt.');
  if (typeof input.seed !== 'string' || input.seed.length < 1 || input.seed.length > 256) throw new Error('Seedinformation ist ungültig.');
  if (typeof input.tier5Unlocked !== 'boolean') throw new Error('tier5Unlocked muss ein Boolean sein.');
  return {
    code: [...input.solutionCode].map(Number),
    seed: input.seed,
    tier5Unlocked: input.tier5Unlocked,
  };
}

function initialComparison(code, seed) {
  const first = stableTextHash('T2-01-a|' + seed + '|' + code.join('')) % code.length;
  const offset = 1 + stableTextHash('T2-01-b|' + seed + '|' + code.join('')) % (code.length - 1);
  const second = (first + offset) % code.length;
  const positions = [first, second];
  return {positions, text: comparisonText(code, positions)};
}

function explanationFor(candidate) {
  let explanationType = 'regelpruefung';
  if (candidate.id === 'T5-04') explanationType = 'genau-ein-falscher-hinweis';
  else if (candidate.id === 'T5-01') explanationType = 'positionszaehlung-von-rechts';
  else if (candidate.id === 'T5-02') explanationType = 'gleicher-teilungsrest';
  else if (candidate.id === 'T5-03') explanationType = 'codeweite-ableitung';
  else if (candidate.id === 'T1-DIGIT-06') explanationType = 'fakultaetsbeziehung';
  else if (candidate.id === 'T3-17') explanationType = 'punkt-vor-strich';
  else if (candidate.id === 'T3-18') explanationType = 'klammerrechnung';
  else if (candidate.id === 'T3-19') explanationType = 'produktquersumme';
  else if (candidate.id === 'T3-20') explanationType = 'zweistellige-teilbarkeit';
  else if (candidate.id === 'T4-23') explanationType = 'gemischter-ausdrucksvergleich';
  else if (candidate.id.includes('-CODE-')) explanationType = 'codeweite-ableitung';
  else if (candidate.internalPositions.length >= 4) explanationType = 'mehrpositionsbeziehung';
  else if (candidate.internalPositions.length >= 2) explanationType = 'positionsbeziehung';
  else explanationType = 'zifferneigenschaft';
  const explanationData = {
    hintId: candidate.id,
    visiblePositions: candidate.visiblePositions.slice(),
    positionRoles: candidate.positionRoles.slice(),
  };
  if (candidate.id.startsWith('T1-DIGIT-')) explanationData.propertyKey = candidate.details.propertyKey;
  if (candidate.id === 'T4-CODE-07') explanationData.derivationKeys = ['smallestEven', 'largestPrime', 'targetPosition'];
  if (candidate.id === 'T3-17' || candidate.id === 'T3-18') {
    explanationData.variant = candidate.details.variant;
    explanationData.result = candidate.details.result;
  }
  if (candidate.id === 'T3-19') explanationData.operation = 'product-then-first-digit-sum';
  if (candidate.id === 'T3-20') explanationData.divisor = candidate.details.divisor;
  if (candidate.id === 'T4-23') explanationData.comparison = candidate.details.comparison;
  return {
    explanationType,
    explanationData,
  };
}

function packageCompatibilityFor(candidate) {
  return {
    lengthClass: candidate.lengthClass,
    conflictChecked: true,
    conflictPolicy: 'active-candidatesConflict-l054-v2',
    duplicateSignatureChecked: true,
    maximumOneTier5: true,
    digitHintsUseNormalTier1Rules: true,
    longHintRequiresShortPartner: true,
  };
}

function toInternalHint(candidate) {
  const explanation = explanationFor(candidate);
  return {
    id: candidate.id,
    tier: candidate.tier,
    text: candidate.text,
    canonicalText: candidate.canonicalText,
    signature: candidate.signature,
    truthValue: candidate.truth,
    mathematicalRule: candidate.mathematicalRule,
    internalPositions: candidate.internalPositions.slice(),
    visiblePositions: candidate.visiblePositions.slice(),
    positionOrder: candidate.positionOrder.slice(),
    positionRoles: candidate.positionRoles.slice(),
    details: structuredClone(candidate.details),
    packageCompatibility: packageCompatibilityFor(candidate),
    lengthClass: candidate.lengthClass,
    specialRule: candidate.specialRuleType,
    explanationType: explanation.explanationType,
    explanationData: explanation.explanationData,
    codewideDerivations: candidate.codewideDerivations.slice(),
    independentValidation: candidate.independentValidation,
    requiresUnlock: candidate.requiresUnlock,
    optional: candidate.optional,
    informationStrength: candidate.informationStrength,
    selectionPriority: candidate.selectionPriority,
    intentionallyFalse: candidate.intentionallyFalse === true,
    fairnessValidated: candidate.fairnessValidated === true,
    packageNumber: candidate.packageNumber || null,
    packagePosition: candidate.packagePosition || null,
    languageTemplateId: candidate.languageTemplateId,
    languageVariantCount: candidate.languageVariantCount,
    sentenceOpening: candidate.sentenceOpening,
    repeatedTypeFallbackUsed: candidate.repeatedTypeFallbackUsed === true,
  };
}

function generateInternalHintSetWithSelector(input, rankSelector) {
  const settings = requireInput(input);
  const comparison = initialComparison(settings.code, settings.seed);
  const candidates = createGenerator(settings.code, comparison,
    rankSelector ? {...settings, rankSelector} : settings);
  const hints = candidates.map(toInternalHint);
  const packages = Array.from({length: 5}, (_, index) => ({
    packageNumber: index + 1,
    hints: hints.filter((hint) => hint.packageNumber === index + 1),
  }));
  if (hints.length !== 10 || packages.some((entry) => entry.hints.length !== 2)) throw new Error('Interne Paketstruktur ist ungültig.');
  return {
    generatorVersion: GENERATOR_VERSION,
    seed: settings.seed,
    tier5Unlocked: settings.tier5Unlocked,
    hintCount: hints.length,
    packageCount: packages.length,
    hints,
    packages,
  };
}

function generateInternalHintSet(input) {
  return generateInternalHintSetWithSelector(input, null);
}

function generateRankInternalHintSet(input, rankSelector) {
  if (typeof rankSelector !== 'function') throw new TypeError('Rangselektor fehlt.');
  return generateInternalHintSetWithSelector(input, rankSelector);
}

function generateHintCandidates(input) {
  const settings = requireInput(input);
  const comparison = initialComparison(settings.code, settings.seed);
  return createGenerator(settings.code, comparison, {...settings, mode: 'candidates'}).map(toInternalHint);
}

function auditHintCandidateFilter(input) {
  const settings = requireInput(input);
  const comparison = initialComparison(settings.code, settings.seed);
  return createGenerator(settings.code, comparison, {...settings, mode: 'candidateAudit'});
}

function toClientSafeHint(hint) {
  return {
    id: hint.id,
    tier: hint.tier,
    text: hint.text,
    visiblePositions: hint.visiblePositions.slice(),
    positionRoles: hint.positionRoles.slice(),
    lengthClass: hint.lengthClass,
    packageNumber: hint.packageNumber,
    packagePosition: hint.packagePosition,
    explanationType: hint.explanationType,
    explanationData: structuredClone(hint.explanationData),
  };
}

function toClientSafeHintSet(internalSet) {
  if (!internalSet || !Array.isArray(internalSet.hints) || internalSet.hints.length !== 10) throw new Error('Interner Hinweissatz ist ungültig.');
  const hints = internalSet.hints.map(toClientSafeHint);
  return {
    generatorVersion: internalSet.generatorVersion,
    hintCount: hints.length,
    packageCount: 5,
    packages: Array.from({length: 5}, (_, index) => ({
      packageNumber: index + 1,
      hints: hints.filter((hint) => hint.packageNumber === index + 1),
    })),
  };
}

function generateClientSafeHintSet(input) {
  return toClientSafeHintSet(generateInternalHintSet(input));
}

module.exports = Object.freeze({
  ACTIVE_HINT_IDS,
  CONFLICTING_TYPE_GROUPS,
  GENERATOR_VERSION,
  GENERATOR_POLICY,
  INTERNAL_ONLY_FIELDS,
  SOURCE_SHA256: '9577faf0f32b48bec84f669b0a46465058a43b52e9729486f9f41eb96074b88b',
  l054PointBeforeEvaluation,
  l054MixedComparisonEvaluation,
  estimateInformationExclusionPercent,
  VISIBLE_SEMANTIC_AUDITED_HINT_IDS,
  auditHintCandidateFilter,
  generateHintCandidates,
  generateInternalHintSet,
  generateRankInternalHintSet,
  generateClientSafeHintSet,
  toClientSafeHintSet,
});

},
"prototypes/firebase-lock-attempt/functions/src/hints/hint-distinctness.cjs":function(module,exports,require){
"use strict";

const {visibleHintIsTrue} = require("./visible-hint-truth.cjs");

// V2 excludes relational clues that only restate parity of several positions.
// Single-digit properties and mixed mathematical clues remain available.
const EXCLUDED_IDS = new Set(["T2-04", "T2-06", "T3-15", "T4-03"]);
const LOCAL_IDS = new Set([
  ..."01 02 03 05 06 07 08 09 12 13 14".split(" ").map(n => `T1-${n}`),
  ...Array.from({length: 10}, (_, n) => `T1-DIGIT-${String(n).padStart(2, "0")}`),
  ..."01 02 03 04 06 07 08 09 10 11 12 13 14 15 16".split(" ").map(n => `T2-${n}`),
  ..."01 02 03 04 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20".split(" ").map(n => `T3-${n}`),
  ..."01 02 03 04 05 06 07 08 09 10 11 12 13 14 16 17 18 19 21 22 23".split(" ").map(n => `T4-${n}`),
  "T5-01", "T5-02",
]);
const MAX_EXACT_POSITIONS = 4;
const MAX_SAMPLED_ROWS = 1024;

function localPositions(hint) {
  if (!hint || !LOCAL_IDS.has(hint.id) ||
      !Array.isArray(hint.internalPositions) ||
      hint.internalPositions.some(position => !Number.isInteger(position) ||
        position < 0 || position >= 12)) return null;
  return [...new Set(hint.internalPositions)].sort((a, b) => a - b);
}

function truth(hint, code) {
  try { return visibleHintIsTrue(hint, code); }
  catch { return null; }
}

// A pair is certified only by actual counterexamples in both directions.
// Exhaustion proves implication for small local supports. Beyond four positions
// the search is bounded; missing evidence means "unknown", never "distinct".
function certifyDistinct(first, second, sourceCode, maxRows = MAX_SAMPLED_ROWS) {
  if (!first || !second || !Array.isArray(sourceCode) ||
      ![8, 10, 11, 12].includes(sourceCode.length) || !Number.isInteger(maxRows) ||
      maxRows < 1 || maxRows > MAX_SAMPLED_ROWS) return null;
  if (first.id === "T5-04" || second.id === "T5-04" ||
      first.intentionallyFalse || second.intentionallyFalse) return null;
  if (truth(first, sourceCode) !== true ||
      truth(second, sourceCode) !== true) return null;
  const firstLocal = localPositions(first);
  const secondLocal = localPositions(second);
  const support = firstLocal && secondLocal ?
    [...new Set([...firstLocal, ...secondLocal])].sort((a, b) => a - b) : null;
  if (support && support.some(position => position >= sourceCode.length)) return null;
  const exact = support !== null && support.length <= MAX_EXACT_POSITIONS;
  const rows = exact ? 10 ** support.length : maxRows;
  let firstOnly = null;
  let secondOnly = null;
  let state = 2166136261;
  for (const character of [first.signature, second.signature].sort().join("|")) {
    state = Math.imul(state ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  const code = sourceCode.slice();
  for (let row = 0; row < rows; row++) {
    if (exact) {
      let value = row;
      for (const position of support) {
        code[position] = value % 10;
        value = Math.floor(value / 10);
      }
    } else if (row < sourceCode.length * 10) {
      code.splice(0, sourceCode.length, ...sourceCode);
      code[Math.floor(row / 10) % sourceCode.length] = row % 10;
    } else {
      for (let position = 0; position < sourceCode.length; position++) {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        code[position] = (state >>> 0) % 10;
      }
    }
    const left = truth(first, code);
    const right = truth(second, code);
    if (typeof left !== "boolean" || typeof right !== "boolean") return null;
    if (left && !right && firstOnly === null) firstOnly = code.slice();
    if (right && !left && secondOnly === null) secondOnly = code.slice();
    if (firstOnly && secondOnly) return Object.freeze({
      firstOnly: Object.freeze(firstOnly),
      secondOnly: Object.freeze(secondOnly), rowsChecked: row + 1, exact,
    });
  }
  return null;
}

function pairIsDistinct(first, second, code, cache) {
  const key = [first.signature, second.signature].sort().join("|");
  if (!cache.has(key)) cache.set(key, certifyDistinct(first, second, code));
  return cache.get(key) !== null;
}

module.exports = Object.freeze({EXCLUDED_IDS, LOCAL_IDS, MAX_EXACT_POSITIONS,
  MAX_SAMPLED_ROWS, certifyDistinct, pairIsDistinct});

},
"prototypes/firebase-lock-attempt/functions/src/hints/hint-localization.cjs":function(module,exports,require){
"use strict";

// L&L-047: Typgebundene englische Darstellung bereits ausgewählter Hinweise.
// Auswahl, Wahrheit, Fairness, Paketordnung und Mathematik bleiben unangetastet.

const relationFromGerman = (text) => {
  const value = String(text || "").toLowerCase();
  if (value.includes("kleiner") || value.includes("weniger")) return "smaller";
  if (value.includes("größer") || value.includes("mehr")) return "greater";
  return "equal";
};
const relation = (hint) => {
  const value = hint.details && hint.details.comparison;
  if (value === "kleiner") return "smaller";
  if (value === "größer") return "greater";
  if (value === "gleich") return "equal";
  return relationFromGerman(hint.text);
};
const compare = (subject, relationValue, object) => relationValue === "equal" ?
  `${subject} is equal to ${object}.` : `${subject} is ${relationValue} than ${object}.`;
const relationClause = (hint, object) => relation(hint) === "equal" ?
  `equal to ${object}` : `${relation(hint)} than ${object}`;
const pos = (value) => `position ${Number(value)}`;
const digit = (value) => `the digit at ${pos(value)}`;
const leadingDigit = (value) => `The digit at ${pos(value)}`;
const digits = (values) => values.map((value) => pos(value)).join(", ").replace(/, ([^,]+)$/, " and $1");
const valuesAt = (values) => `the digits at ${digits(values)}`;
const germanHas = (hint, value) => String(hint.text || "").toLowerCase().includes(value.toLowerCase());
const englishDerivation = Object.freeze({
  afterFirstPrime: "the digit immediately after the first prime digit",
  beforeLastPrime: "the digit immediately before the last prime digit",
  firstEven: "the first even digit from the left",
  lastOdd: "the last odd digit from the left",
  afterFirstMinimum: "the digit immediately after the first occurrence of the minimum",
  beforeLastMaximum: "the digit immediately before the last occurrence of the maximum",
  medianFirstPosition: "the median of the code at its first occurrence",
});

function renderEnglish(hint) {
  if (!hint || typeof hint.id !== "string" || !Array.isArray(hint.visiblePositions)) {
    throw new Error("Hintdaten für die Lokalisierung sind ungültig.");
  }
  const id = hint.id;
  const p = hint.visiblePositions.map(Number);
  const d = hint.details && typeof hint.details === "object" ? hint.details : {};
  const isNot = germanHas(hint, " keine ") || germanHas(hint, " keine.") || germanHas(hint, " nicht ");
  let text = "";

  switch (id) {
    case "T1-01": text = `${digit(p[0])} is ${germanHas(hint, "ungerade") ? "odd" : "even"}.`; break;
    case "T1-02": text = `${digit(p[0])} is ${isNot ? "not " : ""}a prime digit.`; break;
    case "T1-03": text = `${digit(p[0])} is ${isNot ? "not " : ""}a square number.`; break;
    case "T1-05": text = `${digit(p[0])} is ${d.composite === false ? "not " : ""}a composite number.`; break;
    case "T1-06": text = `${digit(p[0])} is ${d.powerOfTwo === false ? "not " : ""}a power of two.`; break;
    case "T1-07": text = `${digit(p[0])} is ${isNot ? "not " : ""}a cube number.`; break;
    case "T1-08": text = `${digit(p[0])} ${isNot ? "does not belong" : "belongs"} to the Fibonacci sequence.`; break;
    case "T1-09": text = d.samePositionParity ? `${digit(p[0])} has the same parity as its position number.` : `${digit(p[0])} has a different parity from its position number.`; break;
    case "T1-12": text = `${digit(p[0])} ${d.distinctPrimeSum ? "can" : "cannot"} be written as the sum of two different prime digits.`; break;
    case "T1-13": text = `${digit(p[0])} is ${d.factorial === false ? "not " : ""}a factorial number.`; break;
    case "T1-14": text = `${digit(p[0])} is ${d.triangular === false ? "not " : ""}a triangular number.`; break;
    case "T1-CODE-01": text = compare("The largest prime digit in the code", relation(hint), digit(p[0])); break;
    case "T1-CODE-02": text = compare("The smallest even digit in the code", relation(hint), digit(p[0])); break;
    case "T1-CODE-03": text = d.extremum === "maximum" ? `${digit(p[0])} is the largest digit in the entire code.` : d.extremum === "minimum" ? `${digit(p[0])} is the smallest digit in the entire code.` : `${digit(p[0])} is neither the smallest nor the largest digit in the code.`; break;
    case "T1-CODE-04": text = compare("The median of all digits in the code", relation(hint), digit(p[0])); break;

    case "T2-01": text = relation(hint) === "equal" ? `${valuesAt(p)} are equal.` : compare(digit(p[0]), relation(hint), digit(p[1])); break;
    case "T2-02": text = `The sum of ${valuesAt(p)} is ${d.square ? "a" : "not a"} square number.`; break;
    case "T2-03": text = `The difference between ${valuesAt(p)} is ${d.square ? "a" : "not a"} square number.`; break;
    case "T2-04": text = `${valuesAt(p)} have ${d.sameParity ? "the same" : "different"} parity.`; break;
    case "T2-06": text = `The difference between ${valuesAt(p)} is ${germanHas(hint, "ungerade") ? "odd" : "even"}.`; break;
    case "T2-07": text = `The product of ${valuesAt(p)} is ${d.square ? "a" : "not a"} square number.`; break;
    case "T2-08": text = `${valuesAt(p)} are direct neighbors on the number line.`; break;
    case "T2-09": {
      if (d.ratioDirection === "double") text = `${digit(p[0])} is twice ${digit(p[1])}.`;
      else if (d.ratioDirection === "half") text = `${digit(p[0])} is half as large as ${digit(p[1])}.`;
      else throw new Error("T2-09 besitzt keine eindeutige Verh\u00e4ltnisrichtung.");
      break;
    }
    case "T2-10": text = `The sum of ${valuesAt(p)} is ${d.fibonacci ? "a" : "not a"} Fibonacci number.`; break;
    case "T2-11": text = `${digit(p[0])} is divisible by ${digit(p[1])} without a remainder.`; break;
    case "T2-12": text = `${valuesAt(p)} form ${d.square ? "a" : "not a"} two-digit square number in that order.`; break;
    case "T2-13": text = `The difference between ${valuesAt(p)} is ${germanHas(hint, "keine primzahl") ? "not a" : "a"} prime number.`; break;
    case "T2-14": text = `${valuesAt(p)} are ${d.equal ? "equal" : "different"}.`; break;
    case "T2-15": text = `${valuesAt(p)} at mirrored positions are equally far from 5.`; break;
    case "T2-16": text = `The sum of ${valuesAt(p)} is ${d.prime ? "a" : "not a"} prime number.`; break;
    case "T2-CODE-01": {
      const subject = d.sourceKey === "smallestEven" ? "The smallest even digit in the code" : d.sourceKey === "largestPrime" ? "The largest prime digit in the code" : "The largest odd digit in the code";
      text = d.mode === "between" ? `${subject} lies strictly between ${valuesAt(p)}.` : d.mode === "greaterBoth" ? `${subject} is greater than both ${valuesAt(p)}.` : `${subject} is smaller than both ${valuesAt(p)}.`;
      break;
    }
    case "T2-CODE-03": text = d.mode === "between" ? `The largest prime digit in the code lies strictly between ${valuesAt(p)}.` : d.mode === "bothGreater" ? `${valuesAt(p)} are both greater than the largest prime digit in the code.` : `${valuesAt(p)} are both smaller than the largest prime digit in the code.`; break;
    case "T2-CODE-04": text = `${digit(p[0])} is closer to the ${d.extremum === "maximum" ? "largest" : "smallest"} digit in the code than ${digit(p[1])}.`; break;

    case "T3-01": text = compare(`The sum of ${valuesAt(p.slice(0, 2))}`, relation(hint), digit(p[2])); break;
    case "T3-02": text = `${valuesAt(p)} become ${germanHas(hint, "kleiner") ? "smaller" : "greater"} in this order.`; break;
    case "T3-03": text = compare(`The product of ${valuesAt(p.slice(0, 2))}`, relation(hint), digit(p[2])); break;
    case "T3-04": text = `Exactly two of ${valuesAt(p)} are equal.`; break;
    case "T3-06": text = `${valuesAt(p)} form an arithmetic sequence with a constant interval in this order.`; break;
    case "T3-07": text = `${digit(p[0])} is greater than ${digit(p[1])} and smaller than ${digit(p[2])}.`; break;
    case "T3-08": text = compare(`The distance between ${valuesAt(p.slice(0, 2))}`, relation(hint), digit(p[2])); break;
    case "T3-09": text = `${valuesAt(p)} form ${d.palindrome ? "a" : "not a"} three-digit palindrome in this order.`; break;
    case "T3-10": text = `${digit(p[2])} equals the sum of ${valuesAt(p.slice(0, 2))}.`; break;
    case "T3-11": text = `${digit(p[2])} equals the difference between ${valuesAt(p.slice(0, 2))}.`; break;
    case "T3-12": text = `${digit(p[2])} is the average of ${valuesAt(p.slice(0, 2))}.`; break;
    case "T3-13": text = `The distance between the largest and smallest of ${valuesAt(p)} is ${d.prime ? "a" : "not a"} prime number.`; break;
    case "T3-14": text = `${valuesAt(p)} could be the side lengths of a triangle.`; break;
    case "T3-15": text = `The sum of ${valuesAt(p)} is ${d.parity === "even" ? "even" : "odd"}.`; break;
    case "T3-16": text = `The product of ${valuesAt(p.slice(0, 2))} ends in the digit at ${pos(p[2])}.`; break;
    case "T3-17": {
      if (!Number.isFinite(d.result)) throw new Error("T3-17 besitzt kein eindeutiges Ergebnis.");
      if (d.variant === "productPlus") text = `The sum of the digit at position ${p[2]} and the product of the digits at positions ${p[0]} and ${p[1]} is ${d.result}.`;
      else if (d.variant === "productMinus") text = `The difference between the digit at position ${p[2]} and the product of the digits at positions ${p[0]} and ${p[1]} is ${d.result}.`;
      else throw new Error("T3-17 besitzt keine eindeutige Rechenvariante.");
      break;
    }
    case "T3-18": {
      if (!Number.isFinite(d.result)) throw new Error("T3-18 besitzt kein eindeutiges Ergebnis.");
      if (d.variant === "groupedPlus") text = `The product of the digit at position ${p[2]} and the sum of the digits at positions ${p[0]} and ${p[1]} is ${d.result}.`;
      else if (d.variant === "groupedMinus") text = `The product of the digit at position ${p[2]} and the difference between the digits at positions ${p[0]} and ${p[1]} is ${d.result}.`;
      else throw new Error("T3-18 besitzt keine eindeutige Klammeroperation.");
      break;
    }
    case "T3-19": text = `The digit at position ${p[2]} equals the digit sum of the product of the digits at positions ${p[0]} and ${p[1]}.`; break;
    case "T3-20": {
      if (![2, 3, 4, 5, 6, 8, 9].includes(d.divisor)) throw new Error("T3-20 besitzt keinen zulässigen Divisor.");
      text = `The digits at positions ${p[0]} and ${p[1]} form, in that order, a two-digit number divisible by ${d.divisor}.`;
      break;
    }
    case "T1-DIGIT-00": text = `${leadingDigit(p[0])} is the additive identity.`; break;
    case "T1-DIGIT-01": text = `${leadingDigit(p[0])} is the multiplicative identity.`; break;
    case "T1-DIGIT-02": text = `${leadingDigit(p[0])} is the only even prime digit.`; break;
    case "T1-DIGIT-03": text = `${leadingDigit(p[0])} is the smallest odd prime digit.`; break;
    case "T1-DIGIT-04": text = `${leadingDigit(p[0])} is the square of the smallest prime digit.`; break;
    case "T1-DIGIT-05": text = `${leadingDigit(p[0])} is the only odd prime digit that divides 10.`; break;
    case "T1-DIGIT-06": text = `The digit at position ${p[0]} is the factorial of the digit at position ${p[1]}.`; break;
    case "T1-DIGIT-07": text = `${leadingDigit(p[0])} is the largest single-digit prime number.`; break;
    case "T1-DIGIT-08": text = `${leadingDigit(p[0])} is the cube of the smallest prime digit.`; break;
    case "T1-DIGIT-09": text = `${leadingDigit(p[0])} is the square of the smallest odd prime digit.`; break;
    case "T3-CODE-01": text = `Immediately after the first prime digit from the left is an ${d.parity === "even" ? "even" : "odd"} digit that is ${relationClause(hint, digit(p[2]))}.`; break;
    case "T3-CODE-02": text = `The ${d.parity === "even" ? "even" : "odd"} digit immediately before the last prime digit from the left is ${relationClause(hint, digit(p[2]))}.`; break;
    case "T3-CODE-03": {
      const occurrence = String(d.occurrenceLabel || "").includes("letzten") ? "last" : "first";
      const extreme = String(d.occurrenceLabel || "").includes("größten") ? "largest" : "smallest";
      const direction = d.directionLabel === "vor" ? "before" : "after";
      text = `The digit immediately ${direction} the ${occurrence} occurrence of the ${extreme} digit is ${relationClause(hint, digit(p[2]))}.`;
      break;
    }
    case "T3-CODE-04": text = compare("The right neighbor of the first prime digit", relation(hint), "the left neighbor of the last prime digit"); break;

    case "T4-01": text = `${valuesAt(p)} form a palindrome in this order.`; break;
    case "T4-02": text = compare(`The sum of ${valuesAt(p.slice(0, 2))}`, relation(hint), `the sum of ${valuesAt(p.slice(2))}`); break;
    case "T4-03": text = d.sameParity ?
      `The sum of ${valuesAt(p.slice(0, 2))} and the sum of ${valuesAt(p.slice(2))} are either both even or both odd.` :
      `The sum of ${valuesAt(p.slice(0, 2))} and the sum of ${valuesAt(p.slice(2))} have different parity; exactly one of the two sums is even.`; break;
    case "T4-04": text = `${valuesAt(p)} follow the A-B-A-B pattern in this order.`; break;
    case "T4-05": text = `The difference between ${valuesAt(p.slice(0, 2))} equals the difference between ${valuesAt(p.slice(2))}.`; break;
    case "T4-06": text = compare(`The product of ${valuesAt(p.slice(0, 2))}`, relation(hint), `the product of ${valuesAt(p.slice(2))}`); break;
    case "T4-07": text = `${valuesAt(p)} follow the A-A-B-B pattern in this order.`; break;
    case "T4-08": {
      const half = p.length / 2; text = `The sum of ${valuesAt(p.slice(0, half))} equals the sum of ${valuesAt(p.slice(half))}.`; break;
    }
    case "T4-09": text = `Among ${valuesAt(p)}, exactly one digit occurs twice.`; break;
    case "T4-10": text = `${valuesAt(p)} follow the A-B-C-A-B-C pattern in this order.`; break;
    case "T4-11": text = `${valuesAt(p)} become strictly greater in this order.`; break;
    case "T4-12": text = `${valuesAt(p)} become strictly smaller in this order.`; break;
    case "T4-13": text = `${valuesAt(p)} form an arithmetic sequence with a constant interval in this order.`; break;
    case "T4-14": {
      const half = p.length / 2; text = compare(`The sum of ${valuesAt(p.slice(0, half))}`, relation(hint), `the sum of ${valuesAt(p.slice(half))}`); break;
    }
    case "T4-15": text = `${digit(p[0])} occurs exactly ${d.frequency} times in the entire code.`; break;
    case "T4-16": text = `Among ${valuesAt(p)}, there are exactly two different pairs of equal digits.`; break;
    case "T4-17": text = `${valuesAt(p)} are all different.`; break;
    case "T4-18": text = `At ${digits(p)}, the first and last, second and second-last, and the two middle digits each have the same sum.`; break;
    case "T4-19": text = `${digit(p[2])} equals the difference between the sum of ${valuesAt(p.slice(0, 2))} and the sum of ${valuesAt(p.slice(3))}.`; break;
    case "T4-20": text = compare("The sum of the digits at odd positions", relation(hint), "the sum of the digits at even positions"); break;
    case "T4-21": text = `${digit(p[p.length - 1])} equals the last digit of the sum of ${valuesAt(p.slice(0, -1))}.`; break;
    case "T4-22": text = `Among ${valuesAt(p)}, exactly one digit occurs three times.`; break;
    case "T4-23": {
      const comparison = d.comparison === "kleiner" ? "less" : d.comparison === "größer" ? "greater" : "";
      if (!comparison) throw new Error("T4-23 besitzt keine strikte Vergleichsrichtung.");
      text = `Position ${p[2]} + position ${p[0]} × position ${p[1]} is ${comparison} than position ${p[3]} + position ${p[4]} × position ${p[5]}.`;
      break;
    }
    case "T4-CODE-01": text = "The first and last digits are not the global maximum, but both are greater than every prime digit in the code."; break;
    case "T4-CODE-02": text = "The right neighbor of the first prime digit lies strictly between the smallest even and largest odd digits in the code."; break;
    case "T4-CODE-03": text = `The sum of the digit immediately before the first prime digit and the digit immediately after the last prime digit equals ${digit(p[2])}.`; break;
    case "T4-CODE-04": text = `The first even digit, the last odd digit and the median of the code form a strictly ${d.direction === "ascending" ? "ascending" : "descending"} sequence.`; break;
    case "T4-CODE-05": text = "The digit immediately after the first prime digit equals the difference between the largest and smallest digits in the code."; break;
    case "T4-CODE-06": text = `Neither position 1 nor position ${d.codeLength || 11} contains the largest or smallest digit in the code. Both digits lie strictly between those extremes.`; break;
    case "T4-CODE-07": text = `The smallest even digit in the code is smaller than the largest prime digit, which in turn is smaller than ${digit(p[0])}.`; break;

    case "T5-01": {
      const right = Array.isArray(d.rightVisiblePositions) ? d.rightVisiblePositions : p;
      text = `For this hint, positions are counted from the right. ${compare(digit(right[0]), relation(hint), digit(right[1])).replace(/^the/, "The")}`;
      break;
    }
    case "T5-02": text = `${valuesAt(p.slice(0, 2))} leave the same remainder when divided by ${digit(p[2])}.`; break;
    case "T5-03": {
      const labels = Array.isArray(d.derivationKeys) ? d.derivationKeys.map((key) => englishDerivation[key] || String(key)) : p.map((value) => digit(value));
      const subject = `${labels[0]}, ${labels[1]} and ${labels[2]}`;
      if (d.pattern === "arithmetic") text = `${subject} form an arithmetic sequence with the same non-zero interval in that order.`;
      else if (d.pattern === "ascending") text = `${subject} form a strictly ascending sequence in that order.`;
      else if (d.pattern === "descending") text = `${subject} form a strictly descending sequence in that order.`;
      else text = `${subject} have equal first and third values in that order, while the middle value is different.`;
      text = text.charAt(0).toUpperCase() + text.slice(1);
      break;
    }
    case "T5-04": text = "One of the listed hints is false!"; break;
    default: throw new Error(`Keine englische Hintvorlage für ${id}.`);
  }

  if (!text || /undefined|NaN/.test(text)) throw new Error(`Ungültige englische Hintausgabe für ${id}.`);
  return text;
}

function localizedTexts(hint) {
  return Object.freeze({de: String(hint.text), en: renderEnglish(hint)});
}

module.exports = Object.freeze({localizedTexts, renderEnglish});

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
"prototypes/firebase-lock-attempt/functions/src/hints/personal-hint-assignment.cjs":function(module,exports,require){
"use strict";

const crypto = require("node:crypto");
const generator = require("./gdevelop-generator-core.cjs");
const qualityGenerator = require("./gdevelop-generator-core-v2.cjs");
const variableLengthGenerator = require("./gdevelop-generator-core-v3.cjs");
const extendedGenerator = require("./extended-hint-generator.cjs");
const packagePolicy = require("./package-count-policy.cjs");
const codeLengths = require("../code-length-contract.cjs");
const hintLocalization = require("./hint-localization.cjs");
const rankedGenerator = require("./ranked-hint-generator.cjs");
const rankPolicy = require("./rank-tier-policy.cjs");
const playerStatistics = require("../statistics/player-statistics.cjs");

const MAX_HINT_PACKAGES = 5;
const HINTS_PER_PACKAGE = 2;
const TOTAL_HINTS = MAX_HINT_PACKAGES * HINTS_PER_PACKAGE;
const CURRENT_GENERATOR_VERSION = 2;
const SUPPORTED_GENERATOR_VERSIONS = new Set([generator.GENERATOR_VERSION,
  CURRENT_GENERATOR_VERSION, variableLengthGenerator.GENERATOR_VERSION,
  packagePolicy.GENERATOR_VERSION]);
const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const SALT_PATTERN = /^[a-f0-9]{64}$/;
const ASSIGNMENT_MARKERS = Object.freeze(["assignedHints", "assignmentSeedHash",
  "generatorVersion", "tier5UnlockedAtAssignment", "t504Fairness",
  "assignmentPolicyVersion", "rankSnapshot", "requestedTierCounts",
  "actualTierCounts", "profileId", "packageCount",
  "packageRewardFactor"]);
const ORDINAL_NOMINATIVE = Object.freeze([null, "erste", "zweite", "dritte",
  "vierte", "fünfte", "sechste", "siebte", "achte", "neunte", "zehnte",
  "elfte", "zwölfte"]);

function t307AllowedGermanTexts(target, lower, upper) {
  return new Set([
    `Die Zahl an Position ${target} ist größer als die Zahl an Position ` +
      `${lower} und kleiner als die Zahl an Position ${upper}.`,
    `Die Zahl an Stelle ${target} ist größer als die Zahl an Stelle ` +
      `${lower} und kleiner als die Zahl an Stelle ${upper}.`,
    `Die ${ORDINAL_NOMINATIVE[target]} Ziffer ist größer als die ` +
      `${ORDINAL_NOMINATIVE[lower]} Ziffer und kleiner als die ` +
      `${ORDINAL_NOMINATIVE[upper]} Ziffer.`,
  ]);
}

function hasAssignmentTrace(value) {
  return !!value && typeof value === "object" &&
    ASSIGNMENT_MARKERS.some(key => Object.hasOwn(value, key));
}

function requireAssignmentInputs(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Zuweisungsparameter fehlen.");
  }
  if (typeof input.uid !== "string" || !ID_PATTERN.test(input.uid)) {
    throw new Error("UID ist ungültig.");
  }
  if (typeof input.chestId !== "string" || !ID_PATTERN.test(input.chestId)) {
    throw new Error("chestId ist ungültig.");
  }
  codeLengths.requireCode(input.solutionCode, input.generatorVersion,
      input.codeLength);
  if (typeof input.assignmentSalt !== "string" ||
      !SALT_PATTERN.test(input.assignmentSalt)) {
    throw new Error("assignmentSalt ist ungültig.");
  }
  if (!SUPPORTED_GENERATOR_VERSIONS.has(input.generatorVersion)) {
    throw new Error("Generatorversion wird nicht unterstützt.");
  }
  if (input.generatorVersion === packagePolicy.GENERATOR_VERSION) {
    packagePolicy.requireConfiguration(input);
  }
  if (input.generatorVersion === packagePolicy.GENERATOR_VERSION ?
      input.tier5Unlocked !== undefined :
      typeof input.tier5Unlocked !== "boolean") {
    throw new Error("tier5Unlocked ist ungültig.");
  }
  if (input.generatorSeedOverride !== undefined &&
      (typeof input.generatorSeedOverride !== "string" ||
       input.generatorSeedOverride.length < 1 ||
       input.generatorSeedOverride.length > 256)) {
    throw new Error("Privater Generator-Testseed ist ungültig.");
  }
}

function deriveAssignmentSeedHash(input) {
  requireAssignmentInputs(input);
  return crypto.createHash("sha256")
      .update(JSON.stringify({
        purpose: `LockAndLootPersonalHintAssignmentV${input.generatorVersion}`,
        chestId: input.chestId,
        uid: input.uid,
        assignmentSalt: input.assignmentSalt,
        generatorVersion: input.generatorVersion,
        generatorSeedOverride: input.generatorSeedOverride ?? null,
        ...(input.generatorVersion === packagePolicy.GENERATOR_VERSION ? {
          profileId: input.profileId, packageCount: input.packageCount,
          codeLength: input.codeLength,
        } : {}),
      }))
      .digest("hex");
}

function normalizeSequentialPackageOrder(hints) {
  const copiedHints = structuredClone(hints);
  const metaHint = copiedHints.find((hint) => hint.id === "T5-04");
  if (!metaHint) return copiedHints;
  const intentionallyFalseHint = copiedHints.find((hint) =>
    hint.intentionallyFalse === true && hint.truthValue === false);
  if (!intentionallyFalseHint) {
    throw new Error("T5-04 besitzt keinen eindeutig markierten falschen Hinweis.");
  }
  if (metaHint.packageNumber > intentionallyFalseHint.packageNumber) {
    const metaPackageNumber = metaHint.packageNumber;
    const falsePackageNumber = intentionallyFalseHint.packageNumber;
    for (const hint of copiedHints) {
      if (hint.packageNumber === metaPackageNumber) {
        hint.packageNumber = falsePackageNumber;
      } else if (hint.packageNumber === falsePackageNumber) {
        hint.packageNumber = metaPackageNumber;
      }
    }
  }
  copiedHints.sort((left, right) =>
    left.packageNumber - right.packageNumber ||
    left.packagePosition - right.packagePosition);
  const normalizedMeta = copiedHints.find((hint) => hint.id === "T5-04");
  const normalizedFalse = copiedHints.find((hint) =>
    hint.intentionallyFalse === true && hint.truthValue === false);
  if (normalizedMeta.packageNumber > normalizedFalse.packageNumber) {
    throw new Error("T5-04-Warnung liegt nach dem absichtlich falschen Hinweis.");
  }
  return copiedHints;
}

function t504FairnessSummary(internalHints, extended = false) {
  const metaHint = internalHints.find((hint) => hint.id === "T5-04");
  if (!metaHint) return {present: false};
  const falseHints = internalHints.filter((hint) =>
    hint.intentionallyFalse === true && hint.truthValue === false);
  const otherHints = internalHints.filter((hint) =>
    hint !== metaHint && hint !== falseHints[0]);
  if (falseHints.length !== 1 || metaHint.fairnessValidated !== true ||
      otherHints.length !== internalHints.length - 2 ||
      otherHints.some((hint) => hint.truthValue !== true) ||
      metaHint.packageNumber > falseHints[0].packageNumber) {
    throw new Error("T5-04-Fairness oder Freigabereihenfolge ist ungültig.");
  }
  return {
    present: true,
    metaHintId: "T5-04",
    metaPackageNumber: metaHint.packageNumber,
    intentionallyFalseHintId: falseHints[0].id,
    intentionallyFalsePackageNumber: falseHints[0].packageNumber,
    exactlyOneFalse: true,
    ...(extended ? {otherTrueHintCount: otherHints.length} :
      {otherEightHintsTrue: true}),
    warningBeforeFalseHint: true,
  };
}

function assignmentFromSet(input, assignmentSeedHash, internalSet,
    rankedMetadata = null) {
  const extended = input.generatorVersion === packagePolicy.GENERATOR_VERSION;
  const packageCount = extended ? input.packageCount : MAX_HINT_PACKAGES;
  if (internalSet.hints.length !== packageCount * HINTS_PER_PACKAGE ||
      internalSet.packages.length !== packageCount ||
      internalSet.packages.some((entry) => entry.hints.length !== HINTS_PER_PACKAGE)) {
    throw new Error("Persönlicher Hinweissatz ist unvollständig.");
  }
  const normalizedInternalHints = normalizeSequentialPackageOrder(internalSet.hints);
  const safeSet = (extended ? variableLengthGenerator : generator)
    .toClientSafeHintSet({
    generatorVersion: input.generatorVersion,
    ...(extended ? {packageCount} : {}),
    hints: normalizedInternalHints,
  });
  const internalByPackageSlot = new Map(normalizedInternalHints.map((hint) => [
    `${hint.packageNumber}:${hint.packagePosition}`,
    hint,
  ]));
  const assignedHints = safeSet.packages.flatMap((entry) => entry.hints).map((hint) => {
    const internalHint = internalByPackageSlot.get(`${hint.packageNumber}:${hint.packagePosition}`);
    if (!internalHint || internalHint.id !== hint.id) {
      throw new Error("Lokalisierte Hintzuordnung stimmt nicht mit dem sicheren Paket überein.");
    }
    return {...hint, textByLanguage: hintLocalization.localizedTexts(internalHint)};
  });
  return {
    assignmentSeedHash,
    generatorVersion: input.generatorVersion,
    ...(input.generatorVersion >= variableLengthGenerator.GENERATOR_VERSION ?
      {codeLength: input.codeLength} : {}),
    ...(extended ? {packageCount,
      profileId: input.profileId,
      packageRewardFactor: packagePolicy.PACKAGE_REWARD_FACTORS[packageCount]} : {}),
    tier5UnlockedAtAssignment: rankedMetadata ?
      (extended ? ["HARD", "VERY_HARD"].includes(input.profileId) :
        ["SCHATZJAEGER", "MEISTERNAVIGATOR"].includes(
          rankedMetadata.rankSnapshot.rankId)) : input.tier5Unlocked,
    assignedHints,
    t504Fairness: t504FairnessSummary(normalizedInternalHints, extended),
    ...(rankedMetadata ? {
      assignmentPolicyVersion: rankedMetadata.assignmentPolicyVersion,
      ...(extended ? {} : {rankSnapshot: rankedMetadata.rankSnapshot}),
      requestedTierCounts: rankedMetadata.requestedTierCounts,
      actualTierCounts: rankedMetadata.actualTierCounts,
    } : {}),
  };
}

function createAssignment(input) {
  const assignmentSeedHash = deriveAssignmentSeedHash(input);
  if (input.generatorVersion === packagePolicy.GENERATOR_VERSION) {
    throw new Error("Neue Paketzahlen benötigen ein ausdrücklich gewähltes Profil.");
  }
  const selectedGenerator = input.generatorVersion ===
    generator.GENERATOR_VERSION ? generator : input.generatorVersion ===
    qualityGenerator.GENERATOR_VERSION ? qualityGenerator :
    variableLengthGenerator;
  const internalSet = selectedGenerator.generateInternalHintSet({
    solutionCode: input.solutionCode,
    ...(input.generatorVersion === variableLengthGenerator.GENERATOR_VERSION ?
      {codeLength: input.codeLength} : {}),
    tier5Unlocked: input.tier5Unlocked,
    seed: input.generatorSeedOverride || assignmentSeedHash,
    generatorVersion: input.generatorVersion,
  });
  return assignmentFromSet(input, assignmentSeedHash, internalSet);
}

function createRankedAssignment(input) {
  const assignmentSeedHash = deriveAssignmentSeedHash(input);
  const extended = input.generatorVersion === packagePolicy.GENERATOR_VERSION;
  const ranked = extended ? extendedGenerator.generateExtendedHintSet({
    solutionCode: input.solutionCode, codeLength: input.codeLength,
    packageCount: input.packageCount, profileId: input.profileId,
    seed: input.generatorSeedOverride || assignmentSeedHash,
  }) : rankedGenerator.generateRankedHintSet({
    statistics: playerStatistics.validate(input.statistics),
    solutionCode: input.solutionCode,
    ...(input.generatorVersion === variableLengthGenerator.GENERATOR_VERSION ?
      {codeLength: input.codeLength} : {}),
    seed: input.generatorSeedOverride || assignmentSeedHash,
    generatorVersion: input.generatorVersion,
  });
  const result = assignmentFromSet(input, assignmentSeedHash, ranked.hintSet,
    extended ? {...ranked,
      assignmentPolicyVersion: packagePolicy.POLICY_VERSION} : ranked);
  requireStoredAssignment(result);
  return result;
}

function requireRankedMetadata(playerChest) {
  if (playerChest.generatorVersion === packagePolicy.GENERATOR_VERSION) {
    return requireExtendedMetadata(playerChest);
  }
  const keys = ["assignmentPolicyVersion", "rankSnapshot",
    "requestedTierCounts", "actualTierCounts"];
  const present = keys.filter(key => Object.hasOwn(playerChest, key));
  if (present.length === 0) return;
  if (present.length !== keys.length ||
      playerChest.assignmentPolicyVersion !== rankPolicy.POLICY_VERSION ||
      !playerChest.rankSnapshot ||
      typeof playerChest.rankSnapshot !== "object" ||
      Array.isArray(playerChest.rankSnapshot)) {
    throw new Error("Gespeicherte Rangzuweisung ist unvollständig.");
  }
  const snapshot = playerChest.rankSnapshot;
  if (Object.keys(snapshot).sort().join(",") !==
      "firstSolveCount,rankId" ||
      playerStatistics.rankFor(snapshot.firstSolveCount) !== snapshot.rankId) {
    throw new Error("Gespeicherter Rang-Snapshot ist ungültig.");
  }
  const expected = rankPolicy.RANKS[snapshot.rankId];
  for (const field of ["requestedTierCounts", "actualTierCounts"]) {
    const counts = playerChest[field];
    if (!Array.isArray(counts) || counts.length !== 5 ||
        counts.some((count, index) => !Number.isSafeInteger(count) ||
          count < expected.min[index] || count > expected.max[index]) ||
        counts.reduce((sum, count) => sum + count, 0) !== TOTAL_HINTS) {
      throw new Error("Gespeicherter Rang-Tiermix ist ungültig.");
    }
  }
  if (playerChest.requestedTierCounts.join(",") !==
      playerChest.actualTierCounts.join(",") ||
      playerChest.actualTierCounts.some((count, index) =>
        playerChest.assignedHints.filter(hint => hint.tier === index + 1)
          .length !== count)) {
    throw new Error("Gespeicherter Rang-Tiermix widerspricht den Hinweisen.");
  }
  if (["LANDRATTE", "FREIBEUTER"].includes(snapshot.rankId) &&
      Math.abs(playerChest.actualTierCounts[0] -
        playerChest.actualTierCounts[1]) > 1) {
    throw new Error("Gespeicherter unterer Rangmix ist unausgewogen.");
  }
  const tier5Eligible = ["SCHATZJAEGER", "MEISTERNAVIGATOR"]
    .includes(snapshot.rankId);
  if (playerChest.tier5UnlockedAtAssignment !== tier5Eligible ||
      playerChest.actualTierCounts[4] === 1 &&
      playerChest.actualTierCounts[2] < 3) {
    throw new Error("Gespeicherte Rangfreigabe oder T5-Fairness ist ungültig.");
  }
  for (let packageNumber = 1; packageNumber <= MAX_HINT_PACKAGES;
      packageNumber++) {
    const positions = playerChest.assignedHints
      .filter(hint => hint.packageNumber === packageNumber)
      .map(hint => hint.packagePosition).sort();
    if (positions.join(",") !== "1,2") {
      throw new Error("Gespeicherte Rang-Paketplätze sind doppelt.");
    }
  }
  const meta = playerChest.assignedHints.find(hint => hint.id === "T5-04");
  if (!meta) {
    if (playerChest.t504Fairness.present !== false) {
      throw new Error("Gespeicherter Metahinweisbeleg ist widersprüchlich.");
    }
  } else {
    const comparison = playerChest.assignedHints.find(hint =>
      hint.id === "T2-01" && hint.packageNumber === 1 &&
      hint.packagePosition === 2);
    const witnesses = playerChest.assignedHints.filter(hint =>
      hint.id === "T3-07" && [2, 3, 4].includes(hint.packageNumber));
    if (meta.packageNumber !== 1 || meta.packagePosition !== 1 ||
        !comparison || playerChest.t504Fairness.present !== true ||
        playerChest.t504Fairness.metaHintId !== "T5-04" ||
        playerChest.t504Fairness.intentionallyFalseHintId !== "T2-01" ||
        playerChest.t504Fairness.exactlyOneFalse !== true ||
        playerChest.t504Fairness.otherEightHintsTrue !== true ||
        playerChest.t504Fairness.warningBeforeFalseHint !== true ||
        playerChest.t504Fairness.metaPackageNumber !== 1 ||
        playerChest.t504Fairness.intentionallyFalsePackageNumber !== 1 ||
        witnesses.length !== 3 ||
        ![2, 3, 4].every(number => witnesses.some(hint =>
          hint.packageNumber === number))) {
      throw new Error("Gespeicherter T5-04-Rangbeleg ist ungültig.");
    }
    const [lower, upper] = comparison.visiblePositions;
    const expectedFalseGerman = `Die Zahl an Position ${lower} ist größer als ` +
      `die Zahl an Position ${upper}.`;
    const expectedFalseEnglish = `the digit at position ${lower} is greater ` +
      `than the digit at position ${upper}.`;
    if (!Number.isSafeInteger(lower) || !Number.isSafeInteger(upper) ||
        lower < 1 || lower > codeLengths.requiredCodeLength(
          playerChest.generatorVersion, playerChest.codeLength) ||
        upper < 1 || upper > codeLengths.requiredCodeLength(
          playerChest.generatorVersion, playerChest.codeLength) ||
        lower === upper ||
        comparison.visiblePositions.length !== 2 ||
        comparison.positionRoles.join("|") !==
          "Tatsächlich kleinere Position|Tatsächlich größere Position" ||
        comparison.text !== expectedFalseGerman ||
        comparison.textByLanguage.en !== expectedFalseEnglish ||
        meta.text !== "Einer der genannten Hinweise ist falsch!" ||
        meta.textByLanguage.en !== "One of the listed hints is false!" ||
        witnesses.some(hint => {
          const [target, witnessLower, witnessUpper] = hint.visiblePositions;
          return hint.visiblePositions.length !== 3 ||
            !Number.isSafeInteger(target) || target < 1 ||
            target > codeLengths.requiredCodeLength(
              playerChest.generatorVersion, playerChest.codeLength) ||
            target === lower || target === upper ||
            witnessLower !== lower || witnessUpper !== upper ||
            hint.positionRoles.join("|") !==
              "Zielposition|Untere Grenze|Obere Grenze" ||
            !t307AllowedGermanTexts(target, lower, upper).has(hint.text) ||
            hint.textByLanguage.en !== hintLocalization.renderEnglish(hint);
        }) ||
        new Set(witnesses.map(hint => hint.visiblePositions[0])).size !==
          witnesses.length) {
      throw new Error("Gespeicherte T5-04-Texte oder Zeugen sind widersprüchlich.");
    }
  }
}

function requireExtendedMetadata(playerChest) {
  const configuration = packagePolicy.requireConfiguration(playerChest);
  if (playerChest.assignmentPolicyVersion !== packagePolicy.POLICY_VERSION ||
      playerChest.packageRewardFactor !== configuration.packageRewardFactor ||
      playerChest.rankSnapshot !== undefined) {
    throw new Error("Gespeicherte Profilzuweisung ist unvollständig.");
  }
  const tier5Eligible = ["HARD", "VERY_HARD"].includes(configuration.profileId);
  const bounds = packagePolicy.tierBounds(configuration, tier5Eligible);
  for (const field of ["requestedTierCounts", "actualTierCounts"]) {
    const counts = playerChest[field];
    if (!Array.isArray(counts) || counts.length !== 5 ||
        counts.some((count, index) => !Number.isSafeInteger(count) ||
          count < bounds.min[index] || count > bounds.max[index]) ||
        counts.reduce((sum, count) => sum + count, 0) !==
          configuration.hintCount) {
      throw new Error("Gespeicherter Profil-Tiermix ist ungültig.");
    }
  }
  if (playerChest.requestedTierCounts.join(",") !==
      playerChest.actualTierCounts.join(",") ||
      playerChest.actualTierCounts.some((count, index) =>
        playerChest.assignedHints.filter(hint => hint.tier === index + 1)
          .length !== count) ||
      playerChest.tier5UnlockedAtAssignment !== tier5Eligible ||
      (bounds.balanceBeginner && Math.abs(
        playerChest.actualTierCounts[0] -
        playerChest.actualTierCounts[1]) > 1) ||
      (playerChest.actualTierCounts[4] === 1 &&
        playerChest.actualTierCounts[2] < 3)) {
    throw new Error("Gespeicherter Profil-Tiermix widerspricht den Hinweisen.");
  }
  const meta = playerChest.assignedHints.find(hint => hint.id === "T5-04");
  if (!meta) {
    if (playerChest.t504Fairness.present !== false) {
      throw new Error("Gespeicherter Metahinweisbeleg ist widersprüchlich.");
    }
    return;
  }
  const falseHint = playerChest.assignedHints.find(hint =>
    hint.id === "T2-01" && hint.packageNumber === 1 &&
    hint.packagePosition === 2);
  const witnesses = playerChest.assignedHints.filter(hint =>
    hint.id === "T3-07" && [2, 3, 4].includes(hint.packageNumber));
  if (meta.packageNumber !== 1 || meta.packagePosition !== 1 ||
      !falseHint || witnesses.length !== 3 ||
      ![2, 3, 4].every(number => witnesses.some(hint =>
        hint.packageNumber === number)) ||
      playerChest.t504Fairness.present !== true ||
      playerChest.t504Fairness.metaHintId !== "T5-04" ||
      playerChest.t504Fairness.exactlyOneFalse !== true ||
      playerChest.t504Fairness.otherTrueHintCount !==
        configuration.hintCount - 2 ||
      playerChest.t504Fairness.warningBeforeFalseHint !== true ||
      playerChest.t504Fairness.metaPackageNumber !== 1 ||
      playerChest.t504Fairness.intentionallyFalsePackageNumber !== 1 ||
      playerChest.t504Fairness.intentionallyFalseHintId !== "T2-01") {
    throw new Error("Gespeicherter T5-04-Profilbeleg ist ungültig.");
  }
  const [lower, upper] = falseHint.visiblePositions;
  const codeLength = configuration.codeLength;
  const expectedFalseGerman = `Die Zahl an Position ${lower} ist größer als ` +
    `die Zahl an Position ${upper}.`;
  const expectedFalseEnglish = `the digit at position ${lower} is greater ` +
    `than the digit at position ${upper}.`;
  if (!Number.isSafeInteger(lower) || !Number.isSafeInteger(upper) ||
      lower < 1 || lower > codeLength || upper < 1 || upper > codeLength ||
      lower === upper || falseHint.visiblePositions.length !== 2 ||
      falseHint.positionRoles.join("|") !==
        "Tatsächlich kleinere Position|Tatsächlich größere Position" ||
      falseHint.text !== expectedFalseGerman ||
      falseHint.textByLanguage.en !== expectedFalseEnglish ||
      meta.text !== "Einer der genannten Hinweise ist falsch!" ||
      meta.textByLanguage.en !== "One of the listed hints is false!" ||
      witnesses.some(hint => {
        const [target, witnessLower, witnessUpper] = hint.visiblePositions;
        return hint.visiblePositions.length !== 3 ||
          !Number.isSafeInteger(target) || target < 1 ||
          target > codeLength || target === lower || target === upper ||
          witnessLower !== lower || witnessUpper !== upper ||
          hint.positionRoles.join("|") !==
            "Zielposition|Untere Grenze|Obere Grenze" ||
          !t307AllowedGermanTexts(target, lower, upper).has(hint.text) ||
          hint.textByLanguage.en !== hintLocalization.renderEnglish(hint);
      }) || new Set(witnesses.map(hint =>
        hint.visiblePositions[0])).size !== 3) {
    throw new Error("Gespeicherte T5-04-Texte oder Zeugen sind widersprüchlich.");
  }
}

function requireStoredAssignment(playerChest) {
  const extended = playerChest?.generatorVersion ===
    packagePolicy.GENERATOR_VERSION;
  const packageCount = extended ? playerChest.packageCount : MAX_HINT_PACKAGES;
  if (!playerChest || typeof playerChest !== "object" ||
      !Array.isArray(playerChest.assignedHints) ||
      playerChest.assignedHints.length !== packageCount * HINTS_PER_PACKAGE ||
      typeof playerChest.assignmentSeedHash !== "string" ||
      !SALT_PATTERN.test(playerChest.assignmentSeedHash) ||
      !SUPPORTED_GENERATOR_VERSIONS.has(playerChest.generatorVersion) ||
      typeof playerChest.tier5UnlockedAtAssignment !== "boolean" ||
      !playerChest.t504Fairness ||
      typeof playerChest.t504Fairness.present !== "boolean") {
    throw new Error("Gespeicherter persönlicher Hinweissatz ist ungültig.");
  }
  const codeLength = codeLengths.requiredCodeLength(
      playerChest.generatorVersion, playerChest.codeLength);
  const packageCounts = new Map();
  for (const hint of playerChest.assignedHints) {
    if (!hint || typeof hint !== "object" ||
        typeof hint.id !== "string" || typeof hint.text !== "string" ||
        !hint.textByLanguage || typeof hint.textByLanguage.de !== "string" ||
        typeof hint.textByLanguage.en !== "string" ||
        hint.textByLanguage.de !== hint.text ||
        !Number.isSafeInteger(hint.tier) || hint.tier < 1 || hint.tier > 5 ||
        !Number.isSafeInteger(hint.packageNumber) ||
        hint.packageNumber < 1 || hint.packageNumber > packageCount ||
        !Number.isSafeInteger(hint.packagePosition) ||
        hint.packagePosition < 1 || hint.packagePosition > HINTS_PER_PACKAGE) {
      throw new Error("Gespeicherte Paketstruktur ist ungültig.");
    }
    if (extended && (Object.hasOwn(hint, "index") ||
        containsInternalClientFields(hint))) {
      throw new Error("Gespeicherter Profilhinweis enthält private oder fremde Indexdaten.");
    }
    if (!Array.isArray(hint.visiblePositions) ||
        hint.visiblePositions.some(position => !Number.isInteger(position) ||
          position < 1 || position > codeLength) ||
        (!Array.isArray(hint.positionRoles) ||
          hint.positionRoles.length !== hint.visiblePositions.length) ||
        !hint.explanationData ||
        hint.explanationData.hintId !== hint.id ||
        JSON.stringify(hint.explanationData.visiblePositions) !==
          JSON.stringify(hint.visiblePositions) ||
        JSON.stringify(hint.explanationData.positionRoles) !==
          JSON.stringify(hint.positionRoles)) {
      throw new Error("Gespeicherte Hinweisposition ist ungültig.");
    }
    packageCounts.set(hint.packageNumber, (packageCounts.get(hint.packageNumber) || 0) + 1);
  }
  for (let packageNumber = 1; packageNumber <= packageCount; packageNumber++) {
    if (packageCounts.get(packageNumber) !== HINTS_PER_PACKAGE) {
      throw new Error("Gespeichertes Hinweispaket ist unvollständig.");
    }
    if (playerChest.assignedHints.filter(hint =>
      hint.packageNumber === packageNumber).map(hint =>
      hint.packagePosition).sort().join(",") !== "1,2") {
      throw new Error("Gespeicherte Paketplätze sind doppelt.");
    }
  }
  requireRankedMetadata(playerChest);
  return playerChest;
}

function requirePurchasedPackageCount(value, assignmentContext) {
  // The optional context is a complete stored assignment, never a request limit.
  const assignment = assignmentContext === undefined ? null :
    requireStoredAssignment(assignmentContext);
  const maximum = assignment?.generatorVersion === packagePolicy.GENERATOR_VERSION ?
    assignment.packageCount : MAX_HINT_PACKAGES;
  if (!Number.isSafeInteger(value) || value < 0 || value > maximum) {
    throw new Error("purchasedPackageCount ist ungültig.");
  }
  return value;
}

function toIndexedClientSafeHints(playerChest, purchasedPackageCount) {
  const assignment = requireStoredAssignment(playerChest);
  const purchased = requirePurchasedPackageCount(purchasedPackageCount,
    assignment.generatorVersion === packagePolicy.GENERATOR_VERSION ? assignment : undefined);
  return assignment.assignedHints
      .filter((hint) => hint.packageNumber <= purchased)
      .sort((left, right) =>
        left.packageNumber - right.packageNumber ||
        left.packagePosition - right.packagePosition)
      .map((hint, index) => ({index: index + 1, ...hint}));
}

function clientHintState(playerChest) {
  const purchasedPackageCount = requirePurchasedPackageCount(
      playerChest.purchasedPackageCount,
      playerChest.generatorVersion === packagePolicy.GENERATOR_VERSION ? playerChest : undefined,
  );
  const revealedHints = toIndexedClientSafeHints(
      playerChest,
      purchasedPackageCount,
  );
  const revision = Number.isSafeInteger(playerChest.revision) &&
    playerChest.revision >= 0 ? playerChest.revision : 0;
  return {
    chestId: playerChest.chestId,
    generatorVersion: playerChest.generatorVersion,
    ...(playerChest.generatorVersion === variableLengthGenerator.GENERATOR_VERSION ||
      playerChest.generatorVersion === packagePolicy.GENERATOR_VERSION ?
      {codeLength: playerChest.codeLength} : {}),
    ...(playerChest.generatorVersion === packagePolicy.GENERATOR_VERSION ?
      {packageCount: playerChest.packageCount} : {}),
    purchasedPackageCount,
    revealedHintCount: revealedHints.length,
    revision,
    revealedHints,
  };
}

function nextPackage(playerChest) {
  const extended = playerChest.generatorVersion === packagePolicy.GENERATOR_VERSION;
  const purchasedPackageCount = requirePurchasedPackageCount(
      playerChest.purchasedPackageCount,
      extended ? playerChest : undefined,
  );
  const maximum = extended ? playerChest.packageCount : MAX_HINT_PACKAGES;
  if (purchasedPackageCount >= maximum) return null;
  const packageNumber = purchasedPackageCount + 1;
  const allRevealed = toIndexedClientSafeHints(playerChest, packageNumber);
  const hints = allRevealed.filter((hint) => hint.packageNumber === packageNumber);
  if (hints.length !== HINTS_PER_PACKAGE) {
    throw new Error("Nächstes Hinweispaket ist ungültig.");
  }
  return {packageNumber, hints};
}

function containsInternalClientFields(value) {
  const forbidden = new Set([
    "solutionCode", "assignmentSalt", "assignmentSeedHash", "assignedHints",
    "generatorSeedOverride",
    "assignmentPolicyVersion", "rankSnapshot", "requestedTierCounts",
    "actualTierCounts", "tierSlots", "firstSolveCountAtAssignment",
    "t504Fairness",
    "signature", "truthValue", "mathematicalRule", "internalPositions",
    "details", "specialRule", "independentValidation", "codewideDerivations",
    "intentionallyFalse", "fairnessValidated",
  ]);
  const visit = (entry) => {
    if (!entry || typeof entry !== "object") return false;
    return Object.entries(entry).some(([key, child]) =>
      forbidden.has(key) || visit(child));
  };
  return visit(value);
}

module.exports = Object.freeze({
  CURRENT_GENERATOR_VERSION,
  HINTS_PER_PACKAGE,
  MAX_HINT_PACKAGES,
  TOTAL_HINTS,
  clientHintState,
  containsInternalClientFields,
  createAssignment,
  createRankedAssignment,
  deriveAssignmentSeedHash,
  hasAssignmentTrace,
  nextPackage,
  normalizeSequentialPackageOrder,
  requirePurchasedPackageCount,
  requireStoredAssignment,
  t504FairnessSummary,
  toIndexedClientSafeHints,
});

},
"prototypes/firebase-lock-attempt/functions/src/hints/rank-tier-policy.cjs":function(module,exports,require){
"use strict";

const {createHash} = require("node:crypto");
const statisticsContract = require("../statistics/player-statistics.cjs");

// L&L-061 Phase 3: reine Sollverteilung. Keine Kandidaten- oder Paketzuweisung.
const POLICY_VERSION = 1;
const HINT_COUNT = 10;
const defineRank = (min, max, weights) => Object.freeze({
  min: Object.freeze(min), max: Object.freeze(max), weights: Object.freeze(weights),
});
const RANKS = Object.freeze({
  LANDRATTE: defineRank([0, 0, 0, 0, 0], [10, 10, 2, 0, 0], [4, 4, 2, 0, 0]),
  FREIBEUTER: defineRank([0, 0, 0, 0, 0], [10, 10, 4, 0, 0], [4, 4, 3, 0, 0]),
  SEEBAER: defineRank([1, 2, 2, 1, 0], [10, 10, 10, 2, 0], [1, 3, 3, 2, 0]),
  SCHATZJAEGER: defineRank([1, 1, 2, 2, 0], [10, 10, 10, 4, 1], [1, 2, 3, 3, 1]),
  MEISTERNAVIGATOR: defineRank([0, 0, 0, 0, 0], [2, 10, 10, 10, 1], [1, 3, 3, 3, 1]),
});

const targetCache = new Map();
function targetsFor(rankId, tier5Gate) {
  const key = `${rankId}|${Number(tier5Gate)}`;
  if (targetCache.has(key)) return targetCache.get(key);
  const rank = RANKS[rankId];
  const max = rank.max.slice();
  if (!tier5Gate) max[4] = 0;
  const targets = [];
  const enumerate = (index, remaining, counts) => {
    if (index === 4) {
      if (remaining < rank.min[4] || remaining > max[4]) return;
      const target = [...counts, remaining];
      if (["LANDRATTE", "FREIBEUTER"].includes(rankId) &&
          Math.abs(target[0] - target[1]) > 1) return;
      // T5-04 braucht drei T3-07-Zeugen. Ein T5-Sollplatz muss diese
      // Möglichkeit erhalten, auch wenn später ein anderer T5 gewählt wird.
      if (target[4] === 1 && target[2] < 3) return;
      targets.push(Object.freeze(target));
      return;
    }
    for (let count = rank.min[index]; count <= Math.min(max[index], remaining); count++) {
      enumerate(index + 1, remaining - count, [...counts, count]);
    }
  };
  enumerate(0, HINT_COUNT, []);
  if (targets.length === 0) throw new Error("Zehn zulässige Tier-Plätze sind nicht erreichbar.");
  const frozen = Object.freeze(targets);
  targetCache.set(key, frozen);
  return frozen;
}

function weightedChoice(seed, rankId, seat, choices) {
  const total = choices.reduce((sum, choice) => sum + choice.weight, 0);
  const bytes = createHash("sha256")
    .update(`l061-policy-v${POLICY_VERSION}|${seed}|${rankId}|${seat}`)
    .digest();
  let roll = bytes.readUInt32BE(0) / 0x100000000 * total;
  for (const choice of choices) {
    if (roll < choice.weight) return choice.index;
    roll -= choice.weight;
  }
  return choices[choices.length - 1].index;
}

function planTierSlots({statistics, assignmentSeedHash, tier5Gate}) {
  const trusted = statisticsContract.validate(statistics);
  if (typeof assignmentSeedHash !== "string" ||
      !/^[a-f0-9]{64}$/.test(assignmentSeedHash)) {
    throw new TypeError("Privater Zuweisungsseed ist ungültig.");
  }
  if (typeof tier5Gate !== "boolean") {
    throw new TypeError("Tier-5-Seltenheitsgate ist ungültig.");
  }
  const rankId = statisticsContract.rankFor(trusted.firstSolveCount);
  const rank = RANKS[rankId];
  let viable = targetsFor(rankId, tier5Gate);
  const counts = [0, 0, 0, 0, 0];
  const slots = [];
  for (let seat = 0; seat < HINT_COUNT; seat++) {
    const choices = [];
    for (let index = 0; index < 5; index++) {
      if (rank.weights[index] > 0 &&
          viable.some(target => counts[index] < target[index])) {
        choices.push({index, weight: rank.weights[index]});
      }
    }
    if (!choices.length) throw new Error("Tier-Plan ist nicht fortsetzbar.");
    const chosen = weightedChoice(assignmentSeedHash, rankId, seat, choices);
    counts[chosen]++;
    slots.push(chosen + 1);
    viable = viable.filter(target =>
      counts.every((count, index) => count <= target[index]));
    if (!viable.length) throw new Error("Tier-Plan ist nicht fortsetzbar.");
  }
  if (counts.reduce((sum, count) => sum + count, 0) !== HINT_COUNT ||
      counts.some((count, index) => count < rank.min[index] || count > rank.max[index])) {
    throw new Error("Tier-Plan verletzt Ranggrenzen.");
  }
  return Object.freeze({policyVersion: POLICY_VERSION, rankId,
    firstSolveCountAtAssignment: trusted.firstSolveCount,
    tier5Requested: counts[4] === 1,
    tierCounts: Object.freeze(counts),
    tierSlots: Object.freeze(slots)});
}

module.exports = Object.freeze({HINT_COUNT, POLICY_VERSION, RANKS, planTierSlots});

},
"prototypes/firebase-lock-attempt/functions/src/hints/ranked-hint-generator.cjs":function(module,exports,require){
"use strict";

const {createHash} = require("node:crypto");
const core = require("./gdevelop-generator-core.cjs");
const qualityCore = require("./gdevelop-generator-core-v2.cjs");
const variableLengthCore = require("./gdevelop-generator-core-v3.cjs");
const hintLocalization = require("./hint-localization.cjs");
const beginnerInformation = require("./beginner-information.cjs");
const distinctness = require("./hint-distinctness.cjs");
const policy = require("./rank-tier-policy.cjs");
const statisticsContract = require("../statistics/player-statistics.cjs");

const MAX_MIXES = 64;
const MAX_CANDIDATE_ORDERS = 32;
const MAX_PAIR_ORDERS = 16;
const BEGINNER_LIMITS = Object.freeze({maxScanned: 12000,
  maxSorted: 4096, maxInspected: 128, maxProofs: 16});
const MAX_BEGINNER_PASSES = 3;
const BEGINNER_TOTAL_LIMITS = Object.freeze({
  maxPasses: MAX_BEGINNER_PASSES,
  maxScanned: MAX_BEGINNER_PASSES * BEGINNER_LIMITS.maxScanned,
  maxSorted: MAX_BEGINNER_PASSES * BEGINNER_LIMITS.maxSorted,
  maxInspected: MAX_BEGINNER_PASSES * BEGINNER_LIMITS.maxInspected,
  maxProofs: MAX_BEGINNER_PASSES * BEGINNER_LIMITS.maxProofs,
  maxTruthRows: MAX_BEGINNER_PASSES * BEGINNER_LIMITS.maxProofs *
    10 ** beginnerInformation.MAX_UNION_POSITIONS,
});
function beginnerBudgetRemaining(inspected, proofs) {
  return inspected < BEGINNER_LIMITS.maxInspected &&
    proofs < BEGINNER_LIMITS.maxProofs;
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function ordered(values, seed, purpose) {
  return values.slice().sort((left, right) =>
    hash(`${purpose}|${seed}|${left.signature}`).localeCompare(
      hash(`${purpose}|${seed}|${right.signature}`)) ||
    left.signature.localeCompare(right.signature));
}

function mixOptions(statistics, seed, tier5Gate) {
  const mixes = [];
  const seen = new Set();
  for (let index = 0; index < MAX_MIXES; index++) {
    const mixSeed = index === 0 ? seed : hash(`l061-mix|${seed}|${index}`);
    const plan = policy.planTierSlots({statistics, assignmentSeedHash: mixSeed,
      tier5Gate});
    const key = plan.tierCounts.join(",");
    if (!seen.has(key)) { seen.add(key); mixes.push(plan); }
  }
  const initialHasT5 = mixes[0].tier5Requested;
  return [mixes[0], ...mixes.slice(1).filter(item =>
    item.tier5Requested === initialHasT5),
  ...mixes.slice(1).filter(item => item.tier5Requested !== initialHasT5)];
}

function hasRedundantPalindromeEquality(first, second, code) {
  const comparison = first.id === "T2-01" ? first :
    second.id === "T2-01" ? second : null;
  const palindrome = first.id === "T3-09" ? first :
    second.id === "T3-09" ? second : null;
  if (!comparison || !palindrome || !Array.isArray(code) ||
      ![8, 10, 11, 12].includes(code.length) || comparison.truth !== true ||
      palindrome.truth !== true || palindrome.details?.palindrome !== true ||
      comparison.internalPositions.length !== 2 ||
      palindrome.internalPositions.length !== 3) return false;
  const [left, , right] = palindrome.internalPositions;
  return left !== right &&
    code[left] === code[right] &&
    code[comparison.internalPositions[0]] ===
      code[comparison.internalPositions[1]] &&
    comparison.internalPositions.includes(left) &&
    comparison.internalPositions.includes(right);
}

function compatible(candidate, chosen, context) {
  return chosen.every(previous => {
    if (context.quality && candidate.id !== "T5-04" &&
        previous.id !== "T5-04" &&
        !distinctness.pairIsDistinct(candidate, previous, context.code,
          context.quality.cache)) return false;
    if (hasRedundantPalindromeEquality(candidate, previous, context.code)) return false;
    if (candidate.signature === previous.signature || candidate.text === previous.text) {
      return false;
    }
    if (candidate.id === previous.id) {
      return !context.samePositionSet(candidate, previous);
    }
    return !context.candidatesConflict(candidate, previous);
  });
}

function candidateSet(context, mix, seed, attempt) {
  const orderSeed = `${seed}|candidate-${attempt}`;
  const required = mix.tierCounts.slice();
  const chosen = [];
  const anchorPool = ordered(context.tierPools[2].filter(candidate =>
    candidate.id === "T2-01" && candidate.truth === true), orderSeed, "anchor");
  const anchor = anchorPool[0];
  if (!anchor) return null;
  chosen.push(anchor);
  required[1]--;
  if (required[1] < 0) return null;

  let meta = null;
  let witnesses = [];
  if (mix.tier5Requested) {
    const t5Pool = ordered(context.tierPools[5].filter(candidate =>
      candidate.truth === true), orderSeed, "tier5");
    const t5 = t5Pool[attempt % t5Pool.length];
    if (!t5 || !compatible(t5, chosen, context)) return null;
    chosen.push(t5);
    required[4]--;
    if (t5.id === "T5-04") {
      meta = t5;
      witnesses = t5.details.witnessSignatures.map(signature =>
        context.candidateGroups[3]["T3-07"].find(candidate =>
          candidate.signature === signature));
      if (witnesses.length !== 3 || witnesses.some(witness =>
        !witness || witness.truth !== true ||
        context.estimateInformationExclusionPercent(witness) <
          context.minimumInformationPercent)) return null;
      witnesses = witnesses.map(witness => ({...witness,
        lengthClass: context.classifyHintLength(witness)}));
      for (const witness of witnesses) {
        if (!compatible(witness, chosen, context)) return null;
        chosen.push(witness);
        required[2]--;
      }
      if (required[2] < 0) return null;
    }
  }

  const tiers = [4, 3, 2, 1];
  for (const tier of tiers) {
    const pool = ordered(context.tierPools[tier].filter(candidate =>
      candidate.truth === true), orderSeed, `tier-${tier}`);
    while (required[tier - 1] > 0) {
      const candidate = pool.find(item =>
        !chosen.some(previous => previous.id === item.id) &&
        compatible(item, chosen, context)) ||
        pool.find(item => compatible(item, chosen, context));
      if (!candidate) return null;
      chosen.push(candidate);
      required[tier - 1]--;
    }
  }
  if (chosen.length !== 10) return null;
  return {chosen, anchor, meta, witnesses};
}

function pairSet(context, set, seed, attempt) {
  const {chosen, anchor, meta, witnesses} = set;
  const tier5 = chosen.find(candidate => candidate.tier === 5);
  const packs = meta ? [[meta, anchor], [witnesses[0]], [witnesses[1]],
    [witnesses[2]], []] : [[anchor], [], [], [], tier5 ? [tier5] : []];
  const fixedSignatures = new Set(packs.flat().map(item => item.signature));
  const rest = chosen.filter(item => !fixedSignatures.has(item.signature));
  if (rest.length !== 10 - fixedSignatures.size) return null;
  const pairCost = (first, second) => {
    if (first.id === second.id ||
        !context.lengthPairAllowed(first, second) ||
        [first.tier, second.tier].includes(5) &&
        [first.tier, second.tier].includes(4)) return null;
    return Number(first.tier === second.tier) * 1000 +
      Number(first.tier >= 3 && second.tier >= 3) * 100 +
      Number([first.tier, second.tier].includes(5) &&
        [first.tier, second.tier].includes(3)) * 50 +
      Number(first.lengthClass === "mittel" &&
        second.lengthClass === "mittel") * 5;
  };
  const memo = new Map();
  const best = (packageIndex, mask) => {
    const key = `${packageIndex}|${mask}`;
    if (memo.has(key)) return memo.get(key);
    if (packageIndex === packs.length) {
      const terminal = mask === 0 ? {cost: 0, tie: "", pairs: []} : null;
      memo.set(key, terminal);
      return terminal;
    }
    const pack = packs[packageIndex];
    const options = [];
    if (pack.length === 2) options.push({pair: pack, used: 0});
    else if (pack.length === 1) {
      for (let first = 0; first < rest.length; first++) {
        if (mask & (1 << first)) options.push({pair: [pack[0], rest[first]],
          used: 1 << first});
      }
    } else {
      for (let first = 0; first < rest.length; first++) {
        if (!(mask & (1 << first))) continue;
        for (let second = first + 1; second < rest.length; second++) {
          if (mask & (1 << second)) options.push({pair: [rest[first], rest[second]],
            used: (1 << first) | (1 << second)});
        }
      }
    }
    let winner = null;
    for (const option of options) {
      const cost = pairCost(...option.pair);
      if (cost === null) continue;
      const tail = best(packageIndex + 1, mask & ~option.used);
      if (!tail) continue;
      const total = cost + tail.cost;
      const tie = hash(`pair|${seed}|${attempt}|${packageIndex}|` +
        `${option.pair.map(item => item.signature).join("+")}|${tail.tie}`);
      if (!winner || total < winner.cost ||
          total === winner.cost && tie < winner.tie) {
        winner = {cost: total, tie, pairs: [option.pair, ...tail.pairs]};
      }
    }
    memo.set(key, winner);
    return winner;
  };
  const solution = best(0, (1 << rest.length) - 1);
  if (!solution) return null;
  for (let index = 0; index < packs.length; index++) packs[index] = solution.pairs[index];
  // The legacy path keeps its fixed package order. The ranked path assigns
  // package numbers from the private seed after it has found fair pairs.
  // T5-04 remains first so its warning precedes the deliberately false clue;
  // the three witnesses remain in three separate following packages.
  const packageOrder = meta ? [packs[0], ...ordered(packs.slice(1, 4).map((pack, index) =>
    ({signature: String(index), pack})), seed, `package-${attempt}`).map(item => item.pack),
    packs[4]] :
    ordered(packs.map((pack, index) => ({signature: String(index), pack})),
      seed, `package-${attempt}`).map(item => item.pack);
  return packageOrder.flatMap((pack, packageIndex) => pack.map((candidate, position) =>
    ({...candidate, packageNumber: packageIndex + 1,
      packagePosition: position + 1})));
}

function validateEnglishPackages(context) {
  const englishTexts = new Set();
  for (let index = 0; index < context.selected.length; index += 2) {
    const first = context.selected[index];
    const second = context.selected[index + 1];
    const englishPair = [first, second].map(candidate => {
      const text = hintLocalization.localizedTexts(context.toInternalHint(candidate)).en;
      if (typeof text !== "string" || !text.trim() || englishTexts.has(text)) {
        throw new Error("Englischer Hinweistext fehlt oder ist doppelt.");
      }
      englishTexts.add(text);
      return {...candidate, text,
        lengthClass: context.classifyHintLength({...candidate, text})};
    });
    if (!context.lengthPairAllowed(...englishPair)) {
      throw new Error("Englisches Hinweispaket verletzt die Längenregel.");
    }
  }
}

function selectRanked(context, statistics, seed, finalizeSelection,
  beginnerPasses) {
  const mixes = mixOptions(statistics, seed, context.tier5Available);
  const beginner = ["LANDRATTE", "FREIBEUTER"].includes(
    statisticsContract.rankFor(statistics.firstSolveCount));
  let lastError;
  for (const mix of mixes) {
    for (let candidateAttempt = 0; candidateAttempt < MAX_CANDIDATE_ORDERS;
      candidateAttempt++) {
      const set = candidateSet(context, mix, seed, candidateAttempt);
      if (!set) continue;
      for (let pairAttempt = 0; pairAttempt < MAX_PAIR_ORDERS; pairAttempt++) {
        const paired = pairSet(context, set, seed, pairAttempt);
        if (!paired) continue;
        context.selected.splice(0, context.selected.length, ...structuredClone(paired));
        try {
          const finalized = finalizeSelection();
          if (context.quality) context.quality.cache.clear();
          if (context.quality && !qualitySetIsDistinct(finalized, context)) {
            throw new Error("Hinweissatz enthält semantisch wiederholte Aussagen.");
          }
          validateEnglishPackages(context);
          if (beginner) return selectBeginnerPasses(context, mix,
            finalized, seed, finalizeSelection, beginnerPasses);
          return {mix, selected: finalized};
        } catch (error) { lastError = error; }
      }
    }
  }
  throw new Error(`Kein zulässiger Rang-Hinweissatz innerhalb der Suchgrenzen: ${lastError?.message || "keine Paarung"}`);
}

function qualitySetIsDistinct(selected, context) {
  if (selected.some(hint => distinctness.EXCLUDED_IDS.has(hint.id))) return false;
  for (let first = 0; first < selected.length; first++) {
    for (let second = first + 1; second < selected.length; second++) {
      const left = selected[first];
      const right = selected[second];
      // T5-04 and its intentionally false statement are governed by their
      // separate, validated fairness structure rather than ordinary truth.
      if (left.id === "T5-04" || right.id === "T5-04" ||
          left.intentionallyFalse || right.intentionallyFalse) continue;
      if (!distinctness.pairIsDistinct(left, right, context.code,
        context.quality.cache)) return false;
    }
  }
  return true;
}

function selectBeginnerPasses(context, mix, finalized, seed,
  finalizeSelection, passLimit) {
  let current = structuredClone(finalized);
  for (let pass = 0; pass < passLimit; pass++) {
    const before = JSON.stringify(current);
    const passSeed = pass === 0 ? seed :
      hash(`l061-beginner-pass|${seed}|${pass}`);
    const next = selectBeginnerReplacement(context, mix, current,
      passSeed, finalizeSelection);
    current = structuredClone(next.selected);
    if (JSON.stringify(current) === before) break;
  }
  context.selected.splice(0, context.selected.length, ...current);
  return {mix, selected: context.selected};
}

function selectBeginnerReplacement(context, mix, finalized, seed,
  finalizeSelection) {
  const baseline = structuredClone(finalized);
  const proposals = [];
  let scanned = 0;
  collect: for (let index = 0; index < baseline.length; index++) {
    const old = baseline[index];
    if (old.id === "T2-01" ||
        !beginnerInformation.localReadPositions(old, context.code.length)) continue;
    const others = baseline.filter((_, otherIndex) => otherIndex !== index);
    for (const candidate of context.tierPools[old.tier]) {
      if (scanned >= BEGINNER_LIMITS.maxScanned ||
          proposals.length >= BEGINNER_LIMITS.maxSorted) break collect;
      scanned++;
      if (candidate.signature === old.signature ||
          !beginnerInformation.localReadPositions(candidate, context.code.length) ||
          !compatible(candidate, others, context)) continue;
      const support = new Set([...old.internalPositions,
        ...candidate.internalPositions]);
      if (support.size > beginnerInformation.MAX_UNION_POSITIONS) continue;
      proposals.push({index, candidate, supportSize: support.size,
        signature: `${index}|${candidate.signature}`});
    }
  }
  const candidates = ordered(proposals, seed, "beginner-replacement")
    .sort((left, right) => left.supportSize - right.supportSize);
  let inspected = 0;
  let proofs = 0;
  let winner = null;
  const lengthRank = {kurz: 0, mittel: 1, lang: 2};
  for (const proposal of candidates) {
    if (!beginnerBudgetRemaining(inspected, proofs)) break;
    inspected++;
    const old = baseline[proposal.index];
    const selected = structuredClone(baseline);
    selected[proposal.index] = {...structuredClone(proposal.candidate),
      packageNumber: old.packageNumber,
      packagePosition: old.packagePosition};
    context.selected.splice(0, context.selected.length, ...selected);
    try {
      const valid = finalizeSelection();
      validateEnglishPackages(context);
      const replacement = valid[proposal.index];
      if (lengthRank[replacement.lengthClass] > lengthRank[old.lengthClass] ||
          valid.some((hint, index) => index !== proposal.index &&
            (hint.signature !== baseline[index].signature ||
              hint.id !== baseline[index].id ||
              hint.text !== baseline[index].text ||
              hint.tier !== baseline[index].tier ||
              hint.truth !== baseline[index].truth ||
              JSON.stringify(hint.internalPositions) !==
                JSON.stringify(baseline[index].internalPositions) ||
              JSON.stringify(hint.details) !==
                JSON.stringify(baseline[index].details) ||
              hint.packageNumber !== baseline[index].packageNumber ||
              hint.packagePosition !== baseline[index].packagePosition))) continue;
      proofs++;
      const proof = beginnerInformation.proveStrictLocalImplication(
        old, replacement, context.code.length);
      if (!proof) continue;
      if (!winner || proof.excludedAssignments * winner.proof.rows >
          winner.proof.excludedAssignments * proof.rows) {
        winner = {selected: structuredClone(valid), proof};
      }
    } catch {
      // Invalid language, pairing or text candidates keep the old set.
    }
  }
  context.selected.splice(0, context.selected.length,
    ...structuredClone(winner?.selected || baseline));
  return {mix, selected: context.selected};
}

function generateRankedHintSetWithBeginnerPasses(input, beginnerPasses) {
  if (!Number.isInteger(beginnerPasses) || beginnerPasses < 1 ||
      beginnerPasses > MAX_BEGINNER_PASSES) {
    throw new TypeError("Ungültige Einsteiger-Passzahl.");
  }
  if (!input || typeof input !== "object") throw new TypeError("Rangparameter fehlen.");
  const statistics = statisticsContract.validate(input.statistics);
  if (typeof input.seed !== "string" || input.seed.length < 1 ||
      input.seed.length > 256 ||
      ![core.GENERATOR_VERSION, qualityCore.GENERATOR_VERSION,
        variableLengthCore.GENERATOR_VERSION]
        .includes(input.generatorVersion)) {
    throw new TypeError("Ranggenerator-Seed oder Version ist ungültig.");
  }
  const rankId = statisticsContract.rankFor(statistics.firstSolveCount);
  const t5Eligible = ["SCHATZJAEGER", "MEISTERNAVIGATOR"].includes(rankId);
  const policySeed = hash(`l061-policy-seed|${input.seed}`);
  let requestedMix;
  const selectedCore = input.generatorVersion ===
    core.GENERATOR_VERSION ? core : input.generatorVersion ===
    qualityCore.GENERATOR_VERSION ? qualityCore : variableLengthCore;
  const generated = selectedCore.generateRankInternalHintSet({solutionCode: input.solutionCode,
    seed: input.seed, generatorVersion: input.generatorVersion,
    ...(input.generatorVersion === variableLengthCore.GENERATOR_VERSION ?
      {codeLength: input.codeLength} : {}),
    tier5Unlocked: t5Eligible}, (context, finalizeSelection) => {
    if (input.generatorVersion >= 2) {
      context.quality = {cache: new Map()};
      for (const pool of Object.values(context.tierPools)) {
        for (let index = pool.length - 1; index >= 0; index--) {
          if (distinctness.EXCLUDED_IDS.has(pool[index].id)) pool.splice(index, 1);
        }
      }
    }
    const found = selectRanked(context, statistics, policySeed,
      finalizeSelection, beginnerPasses);
    requestedMix = found.mix;
    return found.selected;
  });
  const actualCounts = [1, 2, 3, 4, 5].map(tier =>
    generated.hints.filter(hint => hint.tier === tier).length);
  if (actualCounts.join(",") !== requestedMix.tierCounts.join(",")) {
    throw new Error("Realisierter Tiermix weicht vom Sollmix ab.");
  }
  return Object.freeze({assignmentPolicyVersion: policy.POLICY_VERSION,
    rankSnapshot: Object.freeze({rankId,
      firstSolveCount: statistics.firstSolveCount}),
    requestedTierCounts: requestedMix.tierCounts,
    actualTierCounts: Object.freeze(actualCounts),
    hintSet: generated});
}

function generateRankedHintSet(input) {
  return generateRankedHintSetWithBeginnerPasses(input, MAX_BEGINNER_PASSES);
}

module.exports = Object.freeze({generateRankedHintSet,
  generateRankedHintSetWithBeginnerPasses,
  hasRedundantPalindromeEquality, BEGINNER_LIMITS, BEGINNER_TOTAL_LIMITS,
  beginnerBudgetRemaining, selectBeginnerPasses});

},
"prototypes/firebase-lock-attempt/functions/src/hints/v4-coverage-truth.cjs":function(module,exports,require){
"use strict";

// V4-only sensitivity evaluator. Historical truth modules remain frozen.
const {visibleHintIsTrue} = require("./visible-hint-truth.cjs");

function coverageHintIsTrue(hint, code) {
  if (hint?.id !== "T1-CODE-03") {
    return visibleHintIsTrue(hint, code);
  }
  if (!Array.isArray(code) || ![8, 10, 12].includes(code.length) ||
      code.some(value => !Number.isInteger(value) || value < 0 || value > 9) ||
      !Array.isArray(hint.internalPositions) ||
      hint.internalPositions.length !== 1 ||
      !Number.isInteger(hint.internalPositions[0]) ||
      hint.internalPositions[0] < 0 ||
      hint.internalPositions[0] >= code.length) return null;
  const value = code[hint.internalPositions[0]];
  const minimum = Math.min(...code);
  const maximum = Math.max(...code);
  if (hint.details?.extremum === "minimum") return value === minimum;
  if (hint.details?.extremum === "maximum") return value === maximum;
  if (hint.details?.extremum === "neither") {
    return value !== minimum && value !== maximum;
  }
  return null;
}

function requireKnownSourceTruth(hints, code) {
  if (!Array.isArray(hints)) throw new TypeError("V4-Hinweissatz fehlt.");
  const ordinary = hints.filter(hint => hint.id !== "T5-04");
  const meta = ordinary.length !== hints.length;
  const values = ordinary.map(hint => {
    try { return coverageHintIsTrue(hint, code); }
    catch { return null; }
  });
  if (values.some(value => typeof value !== "boolean") ||
      values.filter(value => value === false).length !== Number(meta)) {
    throw new Error("V4-Abdeckung: Originalsatz besitzt keine bewiesene Wahrheitsstruktur.");
  }
  return values;
}

module.exports = Object.freeze({coverageHintIsTrue,
  requireKnownSourceTruth});


},
"prototypes/firebase-lock-attempt/functions/src/hints/v4-logical-witness.cjs":function(module,exports,require){
"use strict";
// v4-only logical witness kernel. Unattached to the generator.
// Provenance: d203e-exact-audit-core.mjs SHA-256
// 6096ab89add66ef57997bf603e374baaa630dd6ba96631c96831eda52da18e6d.
// Mechanically retained: global-state signatures, MDD make/apply/not/count,
// local factors, global constraints, and position-order choice.
// Adapted: product v4 truth, normal positions only, bounded internal session API.
// Nodes, truth calls, memo entries and pair queries are cumulative per session.
// samplePrefix has only a per-call cap; caller object size is not externally
// hardened. Do not expose this module as an untrusted public endpoint.
const {coverageHintIsTrue} = require("./v4-coverage-truth.cjs");

const REQUIRED_DETAILS = Object.freeze({
  "T1-05": ["composite"], "T1-06": ["powerOfTwo"],
  "T1-07": ["cube"], "T1-09": ["samePositionParity"],
  "T1-12": ["distinctPrimeSum"], "T1-13": ["factorial"],
  "T1-14": ["triangular"], "T2-02": ["square"],
  "T2-03": ["square"], "T2-07": ["square"],
  "T2-09": ["ratioDirection"], "T2-10": ["fibonacci"],
  "T2-12": ["square"], "T2-14": ["equal"],
  "T2-16": ["prime"], "T3-01": ["comparison"],
  "T3-03": ["comparison"], "T3-08": ["comparison"],
  "T3-09": ["palindrome"], "T3-13": ["prime"],
  "T3-17": ["variant", "result"],
  "T3-18": ["variant", "result"], "T3-20": ["divisor"],
  "T4-06": ["comparison"], "T4-08": ["firstGroup", "secondGroup"],
  "T4-14": ["firstGroup", "secondGroup", "relation"],
  "T4-15": ["frequency"], "T4-20": ["comparison"],
  "T4-23": ["comparison"], "T1-CODE-01": ["comparison"],
  "T1-CODE-02": ["comparison"], "T1-CODE-03": ["extremum"],
  "T1-CODE-04": ["comparison"],
  "T2-CODE-01": ["sourceKey", "mode"],
  "T2-CODE-03": ["mode"], "T2-CODE-04": ["extremum"],
  "T3-CODE-01": ["parity", "comparison", "targetPosition"],
  "T3-CODE-02": ["parity", "comparison", "targetPosition"],
  "T3-CODE-03": ["occurrenceLabel", "directionLabel", "targetPosition"],
  "T3-CODE-04": ["comparison"],
  "T4-CODE-03": ["targetPosition"],
  "T4-CODE-04": ["direction"], "T4-CODE-07": ["targetPosition"],
  "T5-01": ["rightVisiblePositions", "comparison"],
  "T5-03": ["derivationKeys", "pattern"],
});
const TEXT_DEPENDENT_IDS = new Set(["T1-01", "T1-02", "T1-03",
  "T1-08", "T2-01", "T2-06", "T2-13", "T3-02", "T4-02"]);

function createPrefixSpace({sourceCode, prefixHints, candidateHints = [], limits = {}}) {
const CODE_LENGTH = sourceCode?.length;
const DIGITS = Object.freeze(Array.from({length: 10}, (_, digit) => digit));
const PRIME_DIGITS = new Set([2, 3, 5, 7]);
const maxNodes = limits.nodes ?? 100000;
const maxEvaluations = limits.truthCalls ?? 200000;
let evaluations = 0;

const GLOBAL_HINT_IDS = new Set([
  "T1-CODE-01", "T1-CODE-02", "T1-CODE-03", "T1-CODE-04",
  "T2-CODE-01", "T2-CODE-03", "T2-CODE-04",
  "T3-CODE-01", "T3-CODE-02", "T3-CODE-03", "T3-CODE-04",
  "T4-CODE-01", "T4-CODE-02", "T4-CODE-03", "T4-CODE-04",
  "T4-CODE-05", "T4-CODE-06", "T4-CODE-07",
  "T4-15", "T4-20", "T5-03",
]);

const ORDER_INDEPENDENT_GLOBAL_HINT_IDS = new Set([
  "T1-CODE-01", "T1-CODE-02", "T1-CODE-03", "T1-CODE-04",
  "T2-CODE-01", "T2-CODE-03", "T2-CODE-04",
  "T4-CODE-01", "T4-CODE-06", "T4-CODE-07", "T4-15", "T4-20",
]);

function prepareHint(hint, interpretation) {
  if (interpretation !== "normal") throw new TypeError("Nur normale Positionssemantik.");
  return hint;
}

function histogram(prefix) {
  const counts = Array(10).fill(0);
  for (const digit of prefix) counts[digit] += 1;
  return counts;
}

function extrema(prefix) {
  if (!prefix.length) return {minimum: "_", maximum: "_"};
  return {minimum: Math.min(...prefix), maximum: Math.max(...prefix)};
}

function aggregate(prefix, predicate, reducer, empty = "_") {
  const values = prefix.filter(predicate);
  return values.length ? reducer(...values) : empty;
}

function largestPrime(prefix) {
  return aggregate(prefix, (digit) => PRIME_DIGITS.has(digit), Math.max);
}

function smallestEven(prefix) {
  return aggregate(prefix, (digit) => digit % 2 === 0, Math.min);
}

function largestOdd(prefix) {
  return aggregate(prefix, (digit) => digit % 2 !== 0, Math.max);
}

function firstPrimeNeighborAfter(prefix) {
  const position = prefix.findIndex((digit) => PRIME_DIGITS.has(digit));
  if (position < 0) return "none";
  if (position + 1 >= prefix.length) return "pending";
  return prefix[position + 1];
}

function firstPrimeNeighborBefore(prefix) {
  const position = prefix.findIndex((digit) => PRIME_DIGITS.has(digit));
  if (position < 0) return "none";
  return position === 0 ? "invalid" : prefix[position - 1];
}

function firstPrimeNeighborBeforeState(prefix) {
  const value = firstPrimeNeighborBefore(prefix);
  if (value !== "none") return String(value);
  return `none:${prefix.length ? prefix.at(-1) : "_"}`;
}

function lastPrimeNeighborBefore(prefix) {
  let position = -1;
  for (let index = prefix.length - 1; index >= 0; index -= 1) {
    if (PRIME_DIGITS.has(prefix[index])) {
      position = index;
      break;
    }
  }
  if (position < 0) return "none";
  return position === 0 ? "invalid" : prefix[position - 1];
}

function beforeLastPrimeState(prefix) {
  return `${lastPrimeNeighborBefore(prefix)}:${prefix.length ? prefix.at(-1) : "_"}`;
}

function lastPrimeNeighborAfter(prefix) {
  let position = -1;
  for (let index = prefix.length - 1; index >= 0; index -= 1) {
    if (PRIME_DIGITS.has(prefix[index])) {
      position = index;
      break;
    }
  }
  if (position < 0) return "none";
  if (position + 1 >= prefix.length) return "pending";
  return prefix[position + 1];
}

function firstEvenValue(prefix) {
  const position = prefix.findIndex((digit) => digit % 2 === 0);
  return position < 0 ? "none" : prefix[position];
}

function lastOddValue(prefix) {
  for (let index = prefix.length - 1; index >= 0; index -= 1) {
    if (prefix[index] % 2 !== 0) return prefix[index];
  }
  return "none";
}

function occurrenceNeighbor(prefix, extremumKind, occurrenceKind, direction) {
  if (!prefix.length) return "none";
  const extremum = extremumKind === "minimum" ? Math.min(...prefix) : Math.max(...prefix);
  const occurrence = occurrenceKind === "first" ? prefix.indexOf(extremum) : prefix.lastIndexOf(extremum);
  const neighbor = direction === "before" ? occurrence - 1 : occurrence + 1;
  if (neighbor < 0) return `${extremum}:invalid`;
  if (neighbor >= prefix.length) return `${extremum}:pending`;
  return `${extremum}:${prefix[neighbor]}`;
}

function occurrenceNeighborState(prefix, extremumKind, occurrenceKind, direction) {
  const value = occurrenceNeighbor(prefix, extremumKind, occurrenceKind, direction);
  return direction === "before" ?
    `${value}:${prefix.length ? prefix.at(-1) : "_"}` : value;
}

function t3Code03State(hint, prefix) {
  const label = hint.details?.occurrenceLabel || "";
  const extremumKind = label.includes("kleinsten") ? "minimum" : "maximum";
  const occurrenceKind = label.includes("ersten") ? "first" : "last";
  const direction = hint.details?.directionLabel === "vor" ? "before" : "after";
  return occurrenceNeighborState(prefix, extremumKind, occurrenceKind, direction);
}

function selectedDerivationState(key, prefix) {
  if (key === "afterFirstPrime") return firstPrimeNeighborAfter(prefix);
  if (key === "beforeLastPrime") return beforeLastPrimeState(prefix);
  if (key === "firstEven") return firstEvenValue(prefix);
  if (key === "lastOdd") return lastOddValue(prefix);
  if (key === "afterFirstMinimum") {
    return occurrenceNeighborState(prefix, "minimum", "first", "after");
  }
  if (key === "beforeLastMaximum") {
    return occurrenceNeighborState(prefix, "maximum", "last", "before");
  }
  if (key === "medianFirstPosition") return histogram(prefix).join(",");
  throw new Error(`Unbekannte T5-03-Ableitung: ${key}`);
}

/*
 * Every value in this signature is a left-to-right Markov register: two
 * prefixes with the same signature have the same transition for every next
 * digit and the same final truth value. Predecessor rules retain the current
 * last digit because a later prime or extremum can make it relevant.
 */
function globalStateSignature(hint, prefix) {
  const positions = hint.internalPositions || [];
  const valueAt = (position) => position < prefix.length ? prefix[position] : "_";
  const positionValues = positions.map(valueAt).join("");
  const {minimum, maximum} = extrema(prefix);
  if (hint.id === "T1-CODE-01") return `${largestPrime(prefix)}|${positionValues}`;
  if (hint.id === "T1-CODE-02") return `${smallestEven(prefix)}|${positionValues}`;
  if (hint.id === "T1-CODE-03") return `${minimum}|${maximum}|${positionValues}`;
  if (hint.id === "T1-CODE-04") return `${histogram(prefix).join(",")}|${positionValues}`;
  if (hint.id === "T2-CODE-01") {
    const source = hint.details?.sourceKey === "smallestEven" ? smallestEven(prefix) :
      hint.details?.sourceKey === "largestPrime" ? largestPrime(prefix) : largestOdd(prefix);
    return `${source}|${positionValues}`;
  }
  if (hint.id === "T2-CODE-03") return `${largestPrime(prefix)}|${positionValues}`;
  if (hint.id === "T2-CODE-04") return `${minimum}|${maximum}|${positionValues}`;
  if (hint.id === "T3-CODE-01") {
    return `${firstPrimeNeighborAfter(prefix)}|${valueAt(hint.details.targetPosition)}`;
  }
  if (hint.id === "T3-CODE-02") {
    return `${beforeLastPrimeState(prefix)}|${valueAt(hint.details.targetPosition)}`;
  }
  if (hint.id === "T3-CODE-03") {
    return `${t3Code03State(hint, prefix)}|${valueAt(hint.details.targetPosition)}`;
  }
  if (hint.id === "T3-CODE-04") {
    return `${firstPrimeNeighborAfter(prefix)}|${beforeLastPrimeState(prefix)}`;
  }
  if (hint.id === "T4-CODE-01") {
    return `${maximum}|${largestPrime(prefix)}|${valueAt(0)}|${valueAt(CODE_LENGTH - 1)}`;
  }
  if (hint.id === "T4-CODE-02") {
    return `${smallestEven(prefix)}|${largestOdd(prefix)}|${firstPrimeNeighborAfter(prefix)}`;
  }
  if (hint.id === "T4-CODE-03") {
    return `${firstPrimeNeighborBeforeState(prefix)}|${lastPrimeNeighborAfter(prefix)}|${valueAt(hint.details.targetPosition)}`;
  }
  if (hint.id === "T4-CODE-04") {
    return `${histogram(prefix).join(",")}|${firstEvenValue(prefix)}|${lastOddValue(prefix)}`;
  }
  if (hint.id === "T4-CODE-05") {
    return `${minimum}|${maximum}|${firstPrimeNeighborAfter(prefix)}`;
  }
  if (hint.id === "T4-CODE-06") {
    return `${minimum}|${maximum}|${valueAt(0)}|${valueAt(CODE_LENGTH - 1)}`;
  }
  if (hint.id === "T4-CODE-07") {
    return `${smallestEven(prefix)}|${largestPrime(prefix)}|${valueAt(hint.details.targetPosition)}`;
  }
  if (hint.id === "T4-15") {
    const sourcePosition = hint.internalPositions[0];
    if (sourcePosition >= prefix.length) return `${histogram(prefix).join(",")}|_`;
    const sourceDigit = prefix[sourcePosition];
    return `${sourceDigit}:${prefix.filter((digit) => digit === sourceDigit).length}`;
  }
  if (hint.id === "T4-20") {
    let oddPositionSum = 0;
    let evenPositionSum = 0;
    prefix.forEach((digit, index) => {
      if (index % 2 === 0) oddPositionSum += digit;
      else evenPositionSum += digit;
    });
    return `${oddPositionSum}|${evenPositionSum}`;
  }
  if (hint.id === "T5-03") {
    return hint.details.derivationKeys.map((key) => selectedDerivationState(key, prefix)).join("|");
  }
  throw new Error(`Globale Hintsemantik ist nicht zustandskomprimiert: ${hint.id}`);
}

function orderIndependentGlobalStateSignature(hint, assignment) {
  const assignedValues = assignment.filter((digit) => digit >= 0);
  const counts = histogram(assignedValues).join(",");
  const minimum = assignedValues.length ? Math.min(...assignedValues) : "_";
  const maximum = assignedValues.length ? Math.max(...assignedValues) : "_";
  const valueAt = (position) => assignment[position] >= 0 ? assignment[position] : "_";
  const positionValues = (hint.internalPositions || []).map(valueAt).join("");
  const partialLargestPrime = largestPrime(assignedValues);
  const partialSmallestEven = smallestEven(assignedValues);
  const partialLargestOdd = largestOdd(assignedValues);
  if (hint.id === "T1-CODE-01") return `${partialLargestPrime}|${positionValues}`;
  if (hint.id === "T1-CODE-02") return `${partialSmallestEven}|${positionValues}`;
  if (hint.id === "T1-CODE-03") return `${minimum}|${maximum}|${positionValues}`;
  if (hint.id === "T1-CODE-04") return `${counts}|${positionValues}`;
  if (hint.id === "T2-CODE-01") {
    const source = hint.details?.sourceKey === "smallestEven" ? partialSmallestEven :
      hint.details?.sourceKey === "largestPrime" ? partialLargestPrime : partialLargestOdd;
    return `${source}|${positionValues}`;
  }
  if (hint.id === "T2-CODE-03") return `${partialLargestPrime}|${positionValues}`;
  if (hint.id === "T2-CODE-04") return `${minimum}|${maximum}|${positionValues}`;
  if (hint.id === "T4-CODE-01") {
    return `${maximum}|${partialLargestPrime}|${valueAt(0)}|${valueAt(CODE_LENGTH - 1)}`;
  }
  if (hint.id === "T4-CODE-06") return `${minimum}|${maximum}|${valueAt(0)}|${valueAt(CODE_LENGTH - 1)}`;
  if (hint.id === "T4-CODE-07") {
    return `${partialSmallestEven}|${partialLargestPrime}|${valueAt(hint.details.targetPosition)}`;
  }
  if (hint.id === "T4-15") {
    const sourcePosition = hint.internalPositions[0];
    const sourceDigit = assignment[sourcePosition];
    if (sourceDigit < 0) return `${counts}|_`;
    return `${sourceDigit}:${assignment.filter((digit) => digit === sourceDigit).length}`;
  }
  if (hint.id === "T4-20") {
    let oddPositionSum = 0;
    let evenPositionSum = 0;
    assignment.forEach((digit, index) => {
      if (digit < 0) return;
      if (index % 2 === 0) oddPositionSum += digit;
      else evenPositionSum += digit;
    });
    return `${oddPositionSum}|${evenPositionSum}`;
  }
  throw new Error(`Globale Hintsemantik ist nicht reihenfolgeunabhängig: ${hint.id}`);
}

function fullEvaluation(hint, assignment) {
  if (evaluations >= maxEvaluations) throw new Error("LOGICAL_TRUTH_BUDGET");
  evaluations++;
  let value;
  try { value = coverageHintIsTrue(hint, assignment); } catch { value = null; }
  if (typeof value !== "boolean") throw new Error("LOGICAL_UNKNOWN_TRUTH");
  return value;
}

function normalizeDomains(domains) {
  if (domains === undefined) return Array.from({length: CODE_LENGTH}, () => DIGITS);
  if (!Array.isArray(domains) || domains.length !== CODE_LENGTH) {
    throw new Error("Domains muss genau die gewählte Zahl an Positionsdomänen enthalten.");
  }
  return domains.map((domain, position) => {
    if (!Array.isArray(domain) || !domain.length ||
        domain.some((digit) => !Number.isInteger(digit) || digit < 0 || digit > 9) ||
        new Set(domain).size !== domain.length) {
      throw new Error(`Ungültige Zifferndomäne an Position ${position + 1}.`);
    }
    return Object.freeze(domain.slice().sort((first, second) => first - second));
  });
}

class MddManager {
  constructor(domains, positionOrder) {
    this.domains = domains;
    this.positionOrder = positionOrder;
    this.levelByPosition = new Map();
    this.orderIsNatural = positionOrder.every((position, level) => position === level);
    this.nodes = [null, null];
    this.unique = Array.from({length: CODE_LENGTH}, () => new Map());
    this.applyMemo = new Map();
    this.notMemo = new Map();
    this.countMemo = new Map();
    this.uniqueHits = 0;
    this.applyHits = 0;
  }

  levelOf(id) {
    return id < 2 ? CODE_LENGTH : this.nodes[id].level;
  }

  childAt(id, level, digit) {
    return this.levelOf(id) === level ? this.nodes[id].children[digit] : id;
  }

  digitsAt(level) {
    return this.domains[this.positionOrder[level]];
  }

  make(level, childValues) {
    const digits = this.digitsAt(level);
    const first = childValues[digits[0]];
    if (digits.every((digit) => childValues[digit] === first)) return first;
    const key = digits.map((digit) => childValues[digit]).join(",");
    const previous = this.unique[level].get(key);
    if (previous !== undefined) {
      this.uniqueHits += 1;
      return previous;
    }
    const children = Array(10).fill(first);
    for (const digit of digits) children[digit] = childValues[digit];
    const id = this.nodes.length;
    if (this.nodes.length >= maxNodes) {
      throw new Error("Exaktaudit-MDD-Knotenbudget erschöpft.");
    }
    this.nodes.push({level, children});
    this.unique[level].set(key, id);
    return id;
  }

  apply(operation, first, second) {
    if (operation === "and") {
      if (first === 0 || second === 0) return 0;
      if (first === 1) return second;
      if (second === 1 || first === second) return first;
    } else if (operation === "or") {
      if (first === 1 || second === 1) return 1;
      if (first === 0) return second;
      if (second === 0 || first === second) return first;
    } else {
      throw new Error(`Unbekannte MDD-Operation: ${operation}`);
    }
    const low = Math.min(first, second);
    const high = Math.max(first, second);
    const key = `${operation}:${low}:${high}`;
    const previous = this.applyMemo.get(key);
    if (previous !== undefined) {
      this.applyHits += 1;
      return previous;
    }
    const level = Math.min(this.levelOf(first), this.levelOf(second));
    const children = Array(10).fill(0);
    for (const digit of this.digitsAt(level)) {
      children[digit] = this.apply(
          operation,
          this.childAt(first, level, digit),
          this.childAt(second, level, digit),
      );
    }
    const result = this.make(level, children);
    if (this.applyMemo.size >= maxNodes * 4) {
      throw new Error("Exaktaudit-Memo-Budget erschöpft.");
    }
    this.applyMemo.set(key, result);
    return result;
  }

  not(root) {
    if (root < 2) return 1 - root;
    const previous = this.notMemo.get(root);
    if (previous !== undefined) return previous;
    const node = this.nodes[root];
    const children = Array(10).fill(0);
    for (const digit of this.digitsAt(node.level)) {
      children[digit] = this.not(node.children[digit]);
    }
    const result = this.make(node.level, children);
    this.notMemo.set(root, result);
    return result;
  }

  count(root, level = 0) {
    if (root === 0) return 0n;
    if (level === CODE_LENGTH) return root === 1 ? 1n : 0n;
    const key = `${root}:${level}`;
    const previous = this.countMemo.get(key);
    if (previous !== undefined) return previous;
    let total = 0n;
    if (this.levelOf(root) > level) {
      total = BigInt(this.digitsAt(level).length) * this.count(root, level + 1);
    } else {
      for (const digit of this.digitsAt(level)) {
        total += this.count(this.nodes[root].children[digit], level + 1);
      }
    }
    this.countMemo.set(key, total);
    return total;
  }

}

function buildLocalFactor(manager, hint) {
  const positions = [...new Set(hint.internalPositions)].sort((first, second) =>
    manager.levelByPosition.get(first) - manager.levelByPosition.get(second));
  if (!positions.length || positions.some((position) => position < 0 || position >= CODE_LENGTH)) {
    throw new Error(`Lokaler Hint besitzt ungültige Positionen: ${hint.id}`);
  }
  const assignment = Array(CODE_LENGTH).fill(0);
  const visit = (scopeIndex) => {
    if (scopeIndex === positions.length) return fullEvaluation(hint, assignment) ? 1 : 0;
    const position = positions[scopeIndex];
    const level = manager.levelByPosition.get(position);
    const children = Array(10).fill(0);
    for (const digit of manager.digitsAt(level)) {
      assignment[position] = digit;
      children[digit] = visit(scopeIndex + 1);
    }
    return manager.make(level, children);
  };
  return visit(0);
}

function constrainLocalRoot(manager, baseRoot, hint, desiredTruth) {
  const positions = [...new Set(hint.internalPositions)].sort((first, second) =>
    manager.levelByPosition.get(first) - manager.levelByPosition.get(second));
  const relevant = new Set(positions);
  const lastLevel = manager.levelByPosition.get(positions.at(-1));
  const assignment = Array(CODE_LENGTH).fill(0);
  // A memo belongs to this baseRoot. Child root, level, and every assigned
  // relevant digit together determine the remaining local truth condition.
  const memo = cappedMap();
  const visit = (root, level) => {
    if (root === 0) return 0;
    if (level > lastLevel) {
      return fullEvaluation(hint, assignment) === desiredTruth ? root : 0;
    }
    const assigned = positions.filter(position =>
      manager.levelByPosition.get(position) < level)
      .map(position => assignment[position]).join("");
    const key = `${baseRoot}|${root}|${level}|${assigned}`;
    const previous = memo.get(key);
    if (previous !== undefined) return previous;
    const position = manager.positionOrder[level];
    if (!relevant.has(position) && manager.levelOf(root) > level) {
      const result = visit(root, level + 1);
      memo.set(key, result);
      return result;
    }
    const children = Array(10).fill(0);
    for (const digit of manager.digitsAt(level)) {
      if (relevant.has(position)) assignment[position] = digit;
      children[digit] = visit(manager.childAt(root, level, digit),
        level + 1);
    }
    const result = manager.make(level, children);
    memo.set(key, result);
    return result;
  };
  return {root: visit(baseRoot, 0), automatonStates: memo.size};
}

function constrainGlobalRoot(manager, baseRoot, hint, desiredTruth) {
  const assignment = Array(CODE_LENGTH).fill(-1);
  const prefix = [];
  const memo = cappedMap();
  const orderIndependent = ORDER_INDEPENDENT_GLOBAL_HINT_IDS.has(hint.id);
  if (!orderIndependent && !manager.orderIsNatural) {
    throw new Error(`Richtungsabhängiger Hinweis ${hint.id} benötigt die natürliche Positionsreihenfolge.`);
  }
  const visit = (root, level) => {
    if (root === 0) return 0;
    if (level === CODE_LENGTH) return fullEvaluation(hint, assignment) === desiredTruth ? 1 : 0;
    const signature = orderIndependent ?
      orderIndependentGlobalStateSignature(hint, assignment) : globalStateSignature(hint, prefix);
    const key = `${root};${level};${signature}`;
    const previous = memo.get(key);
    if (previous !== undefined) return previous;
    const children = Array(10).fill(0);
    const position = manager.positionOrder[level];
    for (const digit of manager.digitsAt(level)) {
      assignment[position] = digit;
      if (!orderIndependent) prefix.push(digit);
      children[digit] = visit(manager.childAt(root, level, digit), level + 1);
      if (!orderIndependent) prefix.pop();
    }
    assignment[position] = -1;
    const result = manager.make(level, children);
    if (memo.size >= maxNodes * 4) {
      throw new Error("Exaktaudit-Automatenbudget erschöpft.");
    }
    memo.set(key, result);
    return result;
  };
  return {root: visit(baseRoot, 0), automatonStates: memo.size};
}

function choosePositionOrder(hints, interpretation, domains) {
  const prepared = hints.filter((hint) => hint.id !== "T5-04")
      .map((hint) => prepareHint(hint, interpretation));
  if (prepared.some((hint) => GLOBAL_HINT_IDS.has(hint.id) &&
      !ORDER_INDEPENDENT_GLOBAL_HINT_IDS.has(hint.id))) {
    return Array.from({length: CODE_LENGTH}, (_, position) => position);
  }
  const weights = Array(CODE_LENGTH).fill(0);
  for (const hint of prepared) {
    const positions = [...new Set(hint.internalPositions || [])];
    const base = GLOBAL_HINT_IDS.has(hint.id) ? 20 : 100 / Math.max(1, positions.length);
    for (const position of positions) weights[position] += base;
    if (hint.id === "T4-15") weights[hint.internalPositions[0]] += 1000;
  }
  return Array.from({length: CODE_LENGTH}, (_, position) => position).sort((first, second) =>
    domains[first].length - domains[second].length || weights[second] - weights[first] || first - second);
}

function constrainRoot(manager, baseRoot, sourceHint, interpretation, desiredTruth = true) {
  const hint = prepareHint(sourceHint, interpretation);
  if (GLOBAL_HINT_IDS.has(hint.id)) {
    return constrainGlobalRoot(manager, baseRoot, hint, desiredTruth);
  }
  const factor = buildLocalFactor(manager, hint);
  return {
    root: manager.apply("and", baseRoot, desiredTruth ? factor : manager.not(factor)),
    automatonStates: 0,
  };
}

const DEFAULT_LIMITS = Object.freeze({nodes: 100000,
  truthCalls: 200000, memoEntries: 400000,
  conditionalQueries: 24, samples: 64});
const maxMemoEntries = limits.memoEntries ??
  DEFAULT_LIMITS.memoEntries;
const maxQueries = limits.conditionalQueries ??
  DEFAULT_LIMITS.conditionalQueries;
const maxSamples = limits.samples ?? DEFAULT_LIMITS.samples;
if (typeof sourceCode !== "string" ||
    ![8, 10, 12].includes(CODE_LENGTH) ||
    !/^\d+$/u.test(sourceCode) ||
    !Array.isArray(prefixHints) ||
    !Array.isArray(candidateHints) ||
    !limits || typeof limits !== "object" ||
    ![
      [maxNodes, DEFAULT_LIMITS.nodes],
      [maxEvaluations, DEFAULT_LIMITS.truthCalls],
      [maxMemoEntries, DEFAULT_LIMITS.memoEntries],
      [maxQueries, DEFAULT_LIMITS.conditionalQueries],
      [maxSamples, DEFAULT_LIMITS.samples],
    ].every(([value, maximum]) =>
      Number.isSafeInteger(value) && value >= 1 &&
      value <= maximum)) {
  throw new TypeError("Ungültige v4-Zeugen-Konfiguration.");
}
const source = [...sourceCode].map(Number);
let memoEntries = 0;
let queries = 0;
let attemptedQueries = 0;
let failure = null;
let root = 1;
let manager = null;
let automatonStates = 0;
const factorCache = cappedMap();
const constraintCache = cappedMap();
const registered = cappedMap();
function cappedMap(map = new Map()) {
  const originalSet = map.set.bind(map);
  map.set = (key, value) => {
    if (!map.has(key)) {
      if (memoEntries >= maxMemoEntries)
        throw new Error("LOGICAL_MEMO_BUDGET");
      memoEntries++;
    }
    return originalSet(key, value);
  };
  return map;
}
function freezeDeep(value) {
  if (value && typeof value === "object" &&
      !Object.isFrozen(value)) {
    for (const part of Object.values(value))
      freezeDeep(part);
    Object.freeze(value);
  }
  return value;
}
function cloneHint(value) {
  if (!value || typeof value !== "object" ||
      Array.isArray(value))
    throw new TypeError("V4-Hinweisobjekt fehlt.");
  let hint;
  try { hint = structuredClone(value); }
  catch { throw new TypeError("V4-Hinweis ist nicht kopierbar."); }
  if (typeof hint.id !== "string" ||
      !hint.id || hint.id === "T5-04" ||
      hint.intentionallyFalse === true ||
      hint.truth === false || hint.truthValue === false ||
      !Array.isArray(hint.internalPositions) ||
      hint.internalPositions.some(position =>
        !Number.isSafeInteger(position) || position < 0 ||
        position >= CODE_LENGTH) ||
      (REQUIRED_DETAILS[hint.id] || []).some(field =>
        !hint.details ||
        !Object.hasOwn(hint.details, field)) ||
      (TEXT_DEPENDENT_IDS.has(hint.id) &&
        (typeof hint.text !== "string" ||
          !hint.text.trim()))) {
    throw new TypeError("Nur gewöhnliche wahre v4-Hinweise mit vollständiger Semantik.");
  }
  if (hint.id === "T5-01") {
    const right = hint.details.rightVisiblePositions;
    const actual = hint.internalPositions.slice().sort((a, b) => a - b);
    const expected = Array.isArray(right) ?
      right.map(position => CODE_LENGTH - position).sort((a, b) => a - b) : [];
    if (right?.length !== 2 ||
        expected.some(position => !Number.isSafeInteger(position) ||
          position < 0 || position >= CODE_LENGTH) ||
        new Set(expected).size !== 2 ||
        actual.length !== 2 ||
        actual.some((position, index) => position !== expected[index])) {
      throw new TypeError("T5-01-Positionsmetadaten sind inkonsistent.");
    }
  }
  if (hint.id === "T4-08" || hint.id === "T4-14") {
    const first = hint.details.firstGroup;
    const second = hint.details.secondGroup;
    const positions = Array.isArray(first) && Array.isArray(second) ?
      [...first, ...second] : [];
    const actual = hint.internalPositions.slice().sort((a, b) => a - b);
    const expected = positions.slice().sort((a, b) => a - b);
    if (!Array.isArray(first) || !first.length ||
        !Array.isArray(second) || !second.length ||
        positions.some(position => !Number.isSafeInteger(position) ||
          position < 0 || position >= CODE_LENGTH) ||
        new Set(positions).size !== positions.length ||
        actual.length !== positions.length ||
        actual.some((position, index) => position !== expected[index])) {
      throw new TypeError(`${hint.id}-Gruppenpositionen sind inkonsistent.`);
    }
  }
  try { JSON.stringify(hint); }
  catch { throw new TypeError("Zyklischer v4-Hinweis."); }
  return freezeDeep(hint);
}
function semanticKey(hint) {
  // All own semantic and visible fields are included. A caller's signature
  // alone is never used as a truth or constraint cache key.
  return JSON.stringify(hint);
}
function markFailure(error) {
  const message = String(error?.message || error);
  failure = /budget/iu.test(message) ?
    "UNKNOWN_BUDGET" : "UNKNOWN_SEMANTICS";
  return failure;
}
function stats() {
  return Object.freeze({status: failure || "ready",
    nodes: manager ? manager.nodes.length - 2 : 0,
    truthCalls: evaluations, memoEntries,
    conditionalQueries: queries,
    attemptedQueries, automatonStates,
    positionOrder: manager ?
      Object.freeze(manager.positionOrder.slice()) : null});
}
function requireTrueAtSource(hint) {
  if (fullEvaluation(hint, source) !== true)
    throw new TypeError("V4-Hinweis ist am Quellcode nicht wahr.");
}
function trackManagerMaps(instance) {
  cappedMap(instance.levelByPosition);
  instance.positionOrder.forEach((position, level) =>
    instance.levelByPosition.set(position, level));
  for (const map of [...instance.unique,
    instance.applyMemo, instance.notMemo,
    instance.countMemo]) cappedMap(map);
}
function constrainCached(baseRoot, hint, desiredTruth) {
  const key = semanticKey(hint);
  const cacheKey = `${baseRoot}|${Number(desiredTruth)}|${key}`;
  if (constraintCache.has(cacheKey))
    return constraintCache.get(cacheKey);
  let next;
  if (GLOBAL_HINT_IDS.has(hint.id)) {
    next = constrainGlobalRoot(manager, baseRoot,
      hint, desiredTruth);
  } else if (new Set(hint.internalPositions).size >= 5 &&
      baseRoot !== 1) {
    next = constrainLocalRoot(manager, baseRoot,
      hint, desiredTruth);
  } else {
    let factor = factorCache.get(key);
    if (factor === undefined) {
      factor = buildLocalFactor(manager, hint);
      factorCache.set(key, factor);
    }
    next = {root: manager.apply("and", baseRoot,
      desiredTruth ? factor : manager.not(factor)),
    automatonStates: 0};
  }
  automatonStates += next.automatonStates;
  constraintCache.set(cacheKey, next.root);
  return next.root;
}
function unrank(rootId, rank) {
  const count = manager.count(rootId);
  if (rank < 0n || rank >= count)
    throw new RangeError("MDD-Rang außerhalb des Raums.");
  const code = Array(CODE_LENGTH).fill(0);
  let node = rootId;
  for (let level = 0; level < CODE_LENGTH; level++) {
    let chosen = false;
    for (const digit of manager.digitsAt(level)) {
      const child = manager.childAt(node, level, digit);
      const size = manager.count(child, level + 1);
      if (rank >= size) {rank -= size; continue;}
      code[manager.positionOrder[level]] = digit;
      node = child;
      chosen = true;
      break;
    }
    if (!chosen) throw new Error("MDD-Zeugenpfad fehlt.");
  }
  if (node !== 1) throw new Error("MDD-Zeugenpfad ist falsch.");
  return code.join("");
}
function stratified(rootId, limit, excluded = null) {
  if (!Number.isInteger(limit) || limit < 1 ||
      limit > maxSamples)
    throw new RangeError("Ungültige MDD-Probenzahl.");
  const count = manager.count(rootId);
  if (count === 0n) return [];
  const slots = count < BigInt(limit) ?
    Number(count) : limit;
  const found = [];
  const seen = new Set();
  for (let index = 0; index < slots; index++) {
    const rank = slots === 1 ? 0n :
      BigInt(index) * (count - 1n) /
        BigInt(slots - 1);
    const code = unrank(rootId, rank);
    if (code === excluded || seen.has(code)) continue;
    seen.add(code);
    found.push(code);
  }
  return found;
}
function oneNonSource(rootId) {
  const count = manager.count(rootId);
  if (count === 0n) return null;
  const first = unrank(rootId, 0n);
  if (first !== sourceCode) return first;
  return count > 1n ? unrank(rootId, 1n) : null;
}
function verifyWitness(code, first, second,
  expected) {
  if (code === sourceCode) throw new Error("Quelle ist kein Alternativzeuge.");
  const assignment = [...code].map(Number);
  for (const hint of prefix) {
    if (!fullEvaluation(hint, assignment))
      throw new Error("MDD-Präfixzeuge ist falsch.");
  }
  if (fullEvaluation(first, assignment) !==
        expected[0] ||
      fullEvaluation(second, assignment) !==
        expected[1]) {
    throw new Error("MDD-Paarzeuge ist falsch.");
  }
}
const prefix = prefixHints.map(cloneHint);
const candidateCopies = candidateHints.map(cloneHint);
try {
  const all = [...prefix, ...candidateCopies];
  for (const hint of all) {
    const key = semanticKey(hint);
    if (!registered.has(key)) {
      requireTrueAtSource(hint);
      registered.set(key, hint);
    }
  }
  const domains = normalizeDomains();
  manager = new MddManager(domains,
    choosePositionOrder(all, "normal", domains));
  trackManagerMaps(manager);
  // Compile the same conjunction from small local scopes to global hints.
  // This changes only internal MDD construction, never package hint order.
  const compilationOrder = prefix.map((hint, index) => ({hint, index}))
    .sort((first, second) => {
      const firstGlobal = Number(GLOBAL_HINT_IDS.has(first.hint.id));
      const secondGlobal = Number(GLOBAL_HINT_IDS.has(second.hint.id));
      return firstGlobal - secondGlobal ||
        (!firstGlobal ?
          new Set(first.hint.internalPositions).size -
          new Set(second.hint.internalPositions).size : 0) ||
        first.index - second.index;
    });
  for (const {hint} of compilationOrder) {
    root = constrainCached(root, hint, true);
    if (root === 0) break;
  }
  let sourcePath = root;
  for (let level = 0; level < CODE_LENGTH && sourcePath !== 0; level++) {
    const position = manager.positionOrder[level];
    sourcePath = manager.childAt(sourcePath, level, source[position]);
  }
  if (sourcePath !== 1)
    throw new Error("LOGICAL_SOURCE_NOT_IN_PREFIX");
} catch (error) {markFailure(error);}
function evaluatePair(firstInput, secondInput) {
  const conditions = {
    notAandB: {status: "NOT_EVALUATED", count: null,
      witness: null},
    AandNotB: {status: "NOT_EVALUATED", count: null,
      witness: null},
    AandB: {status: "NOT_EVALUATED", count: null,
      witness: null}};
  if (failure) return Object.freeze({status: failure,
    conditions, stats: stats()});
  const firstCopy = cloneHint(firstInput);
  const secondCopy = cloneHint(secondInput);
  const first = registered.get(semanticKey(firstCopy));
  const second = registered.get(semanticKey(secondCopy));
  if (!first || !second)
    throw new TypeError("Paarhinweise müssen vor dem Präfixraum registriert sein.");
  for (const [name, aTruth, bTruth] of [
    ["notAandB", false, true],
    ["AandNotB", true, false],
    ["AandB", true, true]]) {
    if (attemptedQueries >= maxQueries) {
      failure = "UNKNOWN_BUDGET";
      conditions[name] = {status: failure,
        count: null, witness: null,
        reason: "LOGICAL_QUERY_BUDGET"};
      break;
    }
    attemptedQueries++;
    try {
      const a = constrainCached(root, first,
        aTruth);
      const b = constrainCached(a, second,
        bTruth);
      const count = manager.count(b);
      const witness = count > 0n ?
        oneNonSource(b) : null;
      if (witness) verifyWitness(witness, first,
        second, [aTruth, bTruth]);
      conditions[name] = {status: "COMPLETE",
        count: count.toString(), witness,
        sourceOnly: count === 1n &&
          !witness};
      queries++;
    } catch (error) {
      conditions[name] = {status: markFailure(error),
        count: null, witness: null,
        reason: String(error.message || error)};
      break;
    }
  }
  return Object.freeze({status: failure || "complete",
    conditions, stats: stats()});
}
function samplePrefix(limit = maxSamples) {
  if (failure) return Object.freeze({status: failure,
    samples: [], stats: stats()});
  try {
    const samples = stratified(root, limit,
      sourceCode);
    for (const code of samples) {
      const assignment = [...code].map(Number);
      for (const hint of prefix) {
        if (!fullEvaluation(hint, assignment))
          throw new Error("MDD-Präfixzeuge ist falsch.");
      }
    }
    return Object.freeze({status: "complete",
      samples: Object.freeze(samples),
      stats: stats()});
  } catch (error) {
    return Object.freeze({status: markFailure(error),
      samples: [], stats: stats()});
  }
}
function enumeratePrefix(limit = 512) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 512)
    throw new RangeError("Ungültige vollständige Präfixgrenze.");
  if (failure) return Object.freeze({status: failure,
    count: null, codes: [], stats: stats()});
  try {
    const count = manager.count(root);
    if (count > BigInt(limit)) return Object.freeze({
      status: "UNKNOWN_TOO_LARGE", count: count.toString(),
      codes: Object.freeze([]), stats: stats()});
    const codes = [];
    for (let rank = 0n; rank < count; rank++) {
      const code = unrank(root, rank);
      const assignment = [...code].map(Number);
      if (prefix.some(hint => fullEvaluation(hint,
          assignment) !== true))
        throw new Error("MDD-Präfixpopulation ist falsch.");
      codes.push(code);
    }
    if (new Set(codes).size !== codes.length)
      throw new Error("MDD-Präfixpopulation enthält Duplikate.");
    return Object.freeze({status: "COMPLETE",
      count: count.toString(), codes: Object.freeze(codes),
      stats: stats()});
  } catch (error) {
    return Object.freeze({status: markFailure(error),
      count: null, codes: Object.freeze([]), stats: stats()});
  }
}
function prefixCount() {
  if (failure) return Object.freeze({status: failure,
    count: null, stats: stats()});
  try {
    return Object.freeze({status: "complete",
      count: manager.count(root).toString(),
      stats: stats()});
  } catch (error) {
    return Object.freeze({status: markFailure(error),
      count: null, stats: stats()});
  }
}
return Object.freeze({evaluatePair, samplePrefix,
  enumeratePrefix, prefixCount, stats});
}

module.exports = Object.freeze({createPrefixSpace});

},
"prototypes/firebase-lock-attempt/functions/src/hints/v4-package-information.cjs":function(module,exports,require){
"use strict";

const {coverageHintIsTrue} = require("./v4-coverage-truth.cjs");

const MAX_ALTERNATIVES = 6000;
const MAX_TRUTH_EVALUATIONS = 200000;
const MAX_PREFIX_SAMPLES = 64;

function validDigits(code) {
  return Array.isArray(code) && [8, 10, 12].includes(code.length) &&
    code.every(digit => Number.isInteger(digit) &&
      digit >= 0 && digit <= 9);
}

function hintTruth(hint, code, budget) {
  if (++budget.truthEvaluations > MAX_TRUTH_EVALUATIONS) {
    budget.exhausted = true;
    return null;
  }
  try { return coverageHintIsTrue(hint, code); }
  catch { return null; }
}

function visitAlternatives(source, visit) {
  const code = source.slice();
  let checkedCodes = 0;
  for (let first = 0; first < source.length; first++) {
    for (let firstDigit = 0; firstDigit <= 9; firstDigit++) {
      if (firstDigit === source[first]) continue;
      code[first] = firstDigit;
      if (++checkedCodes > MAX_ALTERNATIVES ||
          visit(code, checkedCodes)) {
        code[first] = source[first];
        return checkedCodes;
      }
      code[first] = source[first];
    }
  }
  for (let first = 0; first < source.length; first++) {
    for (let second = first + 1; second < source.length;
      second++) {
      for (let firstDigit = 0; firstDigit <= 9; firstDigit++) {
        if (firstDigit === source[first]) continue;
        code[first] = firstDigit;
        for (let secondDigit = 0; secondDigit <= 9;
          secondDigit++) {
          if (secondDigit === source[second]) continue;
          code[second] = secondDigit;
          if (++checkedCodes > MAX_ALTERNATIVES ||
              visit(code, checkedCodes)) {
            code[first] = source[first];
            code[second] = source[second];
            return checkedCodes;
          }
        }
        code[second] = source[second];
        code[first] = source[first];
      }
    }
  }
  return checkedCodes;
}

function inspectPrefix(previousHints, code, budget) {
  for (const hint of previousHints) {
    const truth = hintTruth(hint, code, budget);
    if (truth !== true) return false;
  }
  return true;
}

function requireOrdinary(previousHints, nextHints, source) {
  if (!validDigits(source) || !Array.isArray(previousHints) ||
      !Array.isArray(nextHints) || nextHints.length !== 2 ||
      [...previousHints, ...nextHints].some(hint =>
        !hint || hint.id === "T5-04" ||
        hint.intentionallyFalse === true)) {
    throw new TypeError("Nur gewöhnliche v4-Pakete mit gültigem Code.");
  }
}

function findPositivePackageWitness(previousHints, nextHints,
  source, {allowGroupFallback = true} = {}) {
  requireOrdinary(previousHints, nextHints, source);
  const budget = {truthEvaluations: 0, exhausted: false};
  let witness = null;
  let prefixCandidates = 0;
  let checkedCodes = visitAlternatives(source, code => {
    if (budget.exhausted) return true;
    if (!inspectPrefix(previousHints, code, budget)) return false;
    prefixCandidates++;
    for (const hint of nextHints) {
      if (hintTruth(hint, code, budget) === false) {
        witness = code.slice();
        return true;
      }
      if (budget.exhausted) return true;
    }
    return false;
  });
  if (allowGroupFallback && !witness && !budget.exhausted) {
    groups: for (const oldDigit of [...new Set(source)]
      .sort((first, second) => first - second)) {
      for (let newDigit = 0; newDigit <= 9; newDigit++) {
        if (newDigit === oldDigit) continue;
        if (checkedCodes >= MAX_ALTERNATIVES ||
            budget.truthEvaluations >= MAX_TRUTH_EVALUATIONS) {
          if (budget.truthEvaluations >= MAX_TRUTH_EVALUATIONS)
            budget.exhausted = true;
          break groups;
        }
        const code = source.map(digit =>
          digit === oldDigit ? newDigit : digit);
        checkedCodes++;
        let prefixTrue = true;
        for (const hint of previousHints) {
          if (budget.truthEvaluations >= MAX_TRUTH_EVALUATIONS) {
            budget.exhausted = true;
            break groups;
          }
          if (hintTruth(hint, code, budget) !== true) {
            prefixTrue = false;
            break;
          }
        }
        if (!prefixTrue) continue;
        prefixCandidates++;
        let pairFalse = false;
        let pairKnown = true;
        for (const hint of nextHints) {
          if (budget.truthEvaluations >= MAX_TRUTH_EVALUATIONS) {
            budget.exhausted = true;
            break groups;
          }
          const value = hintTruth(hint, code, budget);
          if (typeof value !== "boolean") {
            pairKnown = false;
            break;
          }
          if (!value) pairFalse = true;
        }
        if (pairKnown && pairFalse) {
          witness = code;
          break groups;
        }
      }
    }
  }
  return Object.freeze({status: witness ? "proven" : "unknown",
    witness: witness && witness.join(""), checkedCodes,
    prefixCandidates, truthEvaluations:
      budget.truthEvaluations, budgetExhausted: budget.exhausted});
}

function samplePrefixAlternatives(previousHints, source) {
  requireOrdinary(previousHints, [{id: "sample"}, {id: "sample"}],
    source);
  const budget = {truthEvaluations: 0, exhausted: false};
  const samples = [];
  const checkedCodes = visitAlternatives(source, code => {
    if (budget.exhausted) return true;
    if (inspectPrefix(previousHints, code, budget)) {
      samples.push(code.slice());
    }
    return samples.length >= MAX_PREFIX_SAMPLES;
  });
  return Object.freeze({samples, checkedCodes,
    truthEvaluations: budget.truthEvaluations,
    budgetExhausted: budget.exhausted,
    sampleLimitReached: samples.length >= MAX_PREFIX_SAMPLES});
}

module.exports = Object.freeze({MAX_ALTERNATIVES,
  MAX_TRUTH_EVALUATIONS, MAX_PREFIX_SAMPLES,
  findPositivePackageWitness, samplePrefixAlternatives});

},
"prototypes/firebase-lock-attempt/functions/src/hints/v4-package-repair.cjs":function(module,exports,require){
"use strict";

const assert = require("node:assert/strict");
const {createPrefixSpace} = require("./v4-logical-witness.cjs");
const {coverageHintIsTrue} = require("./v4-coverage-truth.cjs");
const {visibleHintIsTrue} = require("./visible-hint-truth.cjs");
const distinctness = require("./hint-distinctness.cjs");

const LIMITS = Object.freeze({prefixSessions: 8,
  candidateScans: 2400, truthCalls: 500000,
  maskPairChecks: 200000, concretePairChecks: 200000,
  finalizations: 6, fullPrefix: 512});
const PREFIX_PROOF_VERSION = "v4-paid-prefix-tail-1";
const ALLOWED_WORDING = new Set(["text", "languageTemplateId",
  "sentenceOpening", "lengthClass", "packageCompatibility"]);
class IncompleteRepair extends Error {
  constructor(reason) {super(reason); this.name = "IncompleteRepair";}
}
function pop(mask) {
  let count = 0;
  for (let value = mask; value; value &= value - 1n) count++;
  return count;
}
function bit(index) {return 1n << BigInt(index);}
function stripWording(hint) {
  return Object.fromEntries(Object.entries(hint)
    .filter(([key]) => !ALLOWED_WORDING.has(key)));
}
function stripPreFinalizationWording(hint) {
  const semantic = stripWording(hint);
  delete semantic.languageVariantCount;
  return semantic;
}
function stripLengthMirror(hint) {
  const value = hint.packageCompatibility;
  if (!value || typeof value !== "object" ||
      !Object.hasOwn(value, "lengthClass"))
    throw new IncompleteRepair("MISSING_LENGTH_MIRROR");
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => key !== "lengthClass"));
}
function wordingTriple(hint) {
  return {text: hint.text,
    languageTemplateId: hint.languageTemplateId,
    sentenceOpening: hint.sentenceOpening};
}
function revalidateDistinctnessProof(pair, proof, source,
  coverageTruth, visibleTruth) {
  const validCode = code => Array.isArray(code) &&
    code.length === source.length &&
    Array.from({length: source.length}, (_, index) =>
      Object.hasOwn(code, index) && Number.isInteger(code[index]) &&
      code[index] >= 0 && code[index] <= 9).every(Boolean);
  if (!Array.isArray(pair) || pair.length !== 2 ||
      !validCode(source) || !proof ||
      !validCode(proof.firstOnly) ||
      !validCode(proof.secondOnly)) return false;
  for (const truth of [coverageTruth, visibleTruth]) {
    const sourceValues = pair.map(hint => truth(hint, source));
    const firstValues = pair.map(hint =>
      truth(hint, proof.firstOnly));
    const secondValues = pair.map(hint =>
      truth(hint, proof.secondOnly));
    if ([...sourceValues, ...firstValues,
        ...secondValues].some(value => typeof value !== "boolean") ||
        !sourceValues.every(Boolean) ||
        firstValues[0] === firstValues[1] ||
        secondValues[0] === secondValues[1] ||
        firstValues[0] === secondValues[0]) return false;
  }
  return true;
}
function registeredWording(context, hint) {
  if (typeof context.languageVariantsForCandidate !==
      "function") return false;
  const candidate = context.tierPools[hint.tier]?.find(item =>
    item.signature === hint.signature);
  if (!candidate) return false;
  return context.languageVariantsForCandidate(candidate,
    context.code).some(variant =>
    variant.id === hint.languageTemplateId &&
    variant.text === hint.text &&
    variant.opening === hint.sentenceOpening);
}
function sameFrozenHint(context, old, output,
  oldAttestation, outputAttestation) {
  assert.deepEqual(stripWording(output), stripWording(old));
  assert.deepEqual(stripLengthMirror(output),
    stripLengthMirror(old));
  for (const hint of [old, output]) {
    const expected = context.classifyHintLength(hint);
    assert.equal(hint.lengthClass, expected);
    assert.equal(hint.packageCompatibility.lengthClass, expected);
    assert.ok(typeof hint.text === "string" && hint.text.length);
    assert.ok(typeof hint.languageTemplateId === "string" &&
      hint.languageTemplateId.length);
    assert.ok(typeof hint.sentenceOpening === "string");
  }
  assert.deepEqual(wordingTriple(old), oldAttestation);
  assert.deepEqual(wordingTriple(output), outputAttestation);
  assert.equal(registeredWording(context, old), true);
  assert.equal(registeredWording(context, output), true);
}
function repairPackageContent(context, finalizeSelection, hooks) {
  if (context.selected.some(hint => hint.id === "T5-04" ||
      hint.intentionallyFalse))
    return Object.freeze({repaired: false, reason: "META_ISOLATED"});
  const original = structuredClone(context.selected);
  const originalTriples = original.map(wordingTriple);
  const metrics = {prefixSessions: 0, candidateScans: 0,
    truthCalls: 0, maskPairChecks: 0, concretePairChecks: 0,
    finalizations: 0, candidateChecks: 0,
    distinctnessProofs: 0, distinctnessTruthCalls: 0,
    distinctnessSuccesses: 0, distinctnessFailures: 0,
    proofRevalidationTruthCalls: 0, reusedProofs: 0,
    rejectedPriorProofs: 0, revalidatedCacheProofs: 0,
    bankAttempts: 0, bankSuccesses: 0,
    bankCheckedCodes: 0, bankTruthCalls: 0,
    windows: [],
    finalizationRejected: 0, prefixCosts: []};
  const sourceCode = context.code.join("");
  const source = context.code.slice();
  const enumerated = new Map();
  const completePrefixProofs = new Map();
  const candidateTruthCache = new WeakMap();
  const qualityPairs = new Map();
  const qualitySemantics = new Map();
  const rejectedPrior = new Set();
  const proofBank = new Map();
  function addBank(pair, proof) {
    if (!proof) return;
    for (const hint of pair) {
      const entries = proofBank.get(hint.signature) || [];
      for (const code of [proof.firstOnly, proof.secondOnly]) {
        if (!Array.isArray(code) || code.length !== source.length)
          continue;
        const key = code.join("");
        if (!entries.some(entry => entry.join("") === key))
          entries.push(Object.freeze(code.slice()));
      }
      if (entries.length > 32) entries.splice(0, entries.length - 32);
      proofBank.set(hint.signature, entries);
    }
  }
  function pairKey(first, second) {
    return [first.signature, second.signature].sort().join("|");
  }
  function registerPairs(candidate, selected) {
    for (const previous of selected)
      qualityPairs.set(pairKey(candidate, previous),
        [candidate, previous]);
  }
  function pairSemantics(pair) {
    return pair.map(hint => JSON.stringify(hint)).sort().join("\u0000");
  }
  function validateProof(pair, proof) {
    const before = metrics.truthCalls;
    try {
      return revalidateDistinctnessProof(pair, proof, source,
        knownTruth, knownVisibleTruth);
    } finally {
      metrics.proofRevalidationTruthCalls +=
        metrics.truthCalls - before;
    }
  }
  function bankProof(pair) {
    const codes = [];
    const seen = new Set();
    for (const hint of pair)
      for (const code of (proofBank.get(hint.signature) || [])
        .slice(-4)) {
        const key = code.join("");
        if (seen.has(key)) continue;
        seen.add(key);
        codes.push(code);
      }
    if (!codes.length) return null;
    metrics.bankAttempts++;
    const before = metrics.truthCalls;
    let firstOnly = null;
    let secondOnly = null;
    let checked = 0;
    try {
      for (const code of codes.slice(0, 8)) {
        checked++;
        metrics.bankCheckedCodes++;
        const coverage = pair.map(hint => knownTruth(hint, code));
        const visible = pair.map(hint => knownVisibleTruth(hint, code));
        if (coverage[0] === false && coverage[1] === true &&
            visible[0] === false && visible[1] === true &&
            !firstOnly) firstOnly = code.slice();
        if (coverage[0] === true && coverage[1] === false &&
            visible[0] === true && visible[1] === false &&
            !secondOnly) secondOnly = code.slice();
        if (firstOnly && secondOnly) break;
      }
      if (firstOnly && secondOnly) {
        const proof = {firstOnly, secondOnly,
          rowsChecked: checked, exact: false};
        if (validateProof(pair, proof)) {
          metrics.bankSuccesses++;
          return proof;
        }
      }
      return null;
    } finally {
      metrics.bankTruthCalls += metrics.truthCalls - before;
    }
  }
  function maximumPairTruthCalls(first, second) {
    function localPositions(hint) {
      if (!distinctness.LOCAL_IDS.has(hint.id) ||
          !Array.isArray(hint.internalPositions) ||
          hint.internalPositions.some(position =>
            !Number.isInteger(position) || position < 0 ||
            position >= context.code.length)) return null;
      return [...new Set(hint.internalPositions)];
    }
    const left = localPositions(first);
    const right = localPositions(second);
    const support = left && right ?
      new Set([...left, ...right]).size : 5;
    return 2 + 2 * (support <= distinctness.MAX_EXACT_POSITIONS ?
      10 ** support : distinctness.MAX_SAMPLED_ROWS);
  }
  function observedCache() {
    const cache = new Map();
    const originalHas = cache.has.bind(cache);
    const originalGet = cache.get.bind(cache);
    cache.has = key => {
      const pair = qualityPairs.get(key);
      if (!pair) throw new IncompleteRepair("UNKNOWN_DISTINCTNESS_PAIR");
      const semantics = pairSemantics(pair);
      let cached = originalHas(key);
      if (cached && qualitySemantics.get(key) !== semantics) {
        const certificate = originalGet(key);
        if (certificate && validateProof(pair, certificate)) {
          qualitySemantics.set(key, semantics);
          metrics.revalidatedCacheProofs++;
        } else {
          cache.delete(key);
          qualitySemantics.delete(key);
          cached = false;
        }
      }
      if (!cached) {
        const priorKey = `${key}\u0000${semantics}`;
        const priorProof = hooks.previousProofs instanceof Map &&
          !rejectedPrior.has(priorKey) ?
          hooks.previousProofs.get(key) : null;
        if (priorProof) {
          if (validateProof(pair, priorProof)) {
            originalSet(key, Object.freeze({
              firstOnly: Object.freeze(priorProof.firstOnly.slice()),
              secondOnly: Object.freeze(priorProof.secondOnly.slice()),
              rowsChecked: priorProof.rowsChecked,
              exact: priorProof.exact,
            }));
            qualitySemantics.set(key, semantics);
            addBank(pair, priorProof);
            metrics.reusedProofs++;
            return true;
          }
          rejectedPrior.add(priorKey);
          metrics.rejectedPriorProofs++;
        }
        const fromBank = bankProof(pair);
        if (fromBank) {
          originalSet(key, Object.freeze({
            firstOnly: Object.freeze(fromBank.firstOnly.slice()),
            secondOnly: Object.freeze(fromBank.secondOnly.slice()),
            rowsChecked: fromBank.rowsChecked, exact: false,
          }));
          qualitySemantics.set(key, semantics);
          addBank(pair, fromBank);
          return true;
        }
        if (metrics.truthCalls + maximumPairTruthCalls(...pair) >
            LIMITS.truthCalls)
          throw new IncompleteRepair("UNKNOWN_TRUTHCALLS_BUDGET");
      }
      return cached;
    };
    const originalSet = cache.set.bind(cache);
    cache.set = (key, value) => {
      if (!originalHas(key)) {
        const pair = qualityPairs.get(key);
        const actualOrBound = value ?
          2 + 2 * value.rowsChecked :
          maximumPairTruthCalls(...pair);
        spend("truthCalls", LIMITS.truthCalls, actualOrBound);
        metrics.distinctnessTruthCalls += actualOrBound;
        if (value) {
          metrics.distinctnessSuccesses++;
          addBank(pair, value);
        }
        else metrics.distinctnessFailures++;
      }
      qualitySemantics.set(key, pairSemantics(qualityPairs.get(key)));
      return originalSet(key, value);
    };
    return cache;
  }
  const qualityCache = observedCache();
  let winner = null;
  function spend(field, maximum, amount = 1) {
    if (metrics[field] + amount > maximum)
      throw new IncompleteRepair(`UNKNOWN_${field.toUpperCase()}_BUDGET`);
    metrics[field] += amount;
  }
  function knownTruth(hint, code) {
    spend("truthCalls", LIMITS.truthCalls);
    let value;
    try {value = coverageHintIsTrue(hint, code);}
    catch {value = null;}
    if (typeof value !== "boolean")
      throw new IncompleteRepair("UNKNOWN_HINT_SEMANTICS");
    return value;
  }
  function knownVisibleTruth(hint, code) {
    spend("truthCalls", LIMITS.truthCalls);
    let value;
    try {value = visibleHintIsTrue(hint, code);}
    catch {value = null;}
    if (typeof value !== "boolean")
      throw new IncompleteRepair("UNKNOWN_VISIBLE_SEMANTICS");
    return value;
  }
  function candidateTruth(hint, codeString) {
    let rows = candidateTruthCache.get(hint);
    if (!rows) {
      rows = new Map();
      candidateTruthCache.set(hint, rows);
    }
    if (!rows.has(codeString))
      rows.set(codeString,
        knownTruth(hint, [...codeString].map(Number)));
    return rows.get(codeString);
  }
  function fullPrefix(startPackage) {
    if (enumerated.has(startPackage))
      return enumerated.get(startPackage);
    spend("prefixSessions", LIMITS.prefixSessions);
    const prefix = original.slice(0, 2 * (startPackage - 1));
    const remainingTruth = LIMITS.truthCalls - metrics.truthCalls;
    if (remainingTruth < 1)
      throw new IncompleteRepair("UNKNOWN_TRUTHCALLS_BUDGET");
    const session = createPrefixSpace({sourceCode,
      prefixHints: prefix, candidateHints: [],
      limits: {truthCalls: Math.min(200000, remainingTruth)}});
    const result = session.enumeratePrefix(LIMITS.fullPrefix);
    spend("truthCalls", LIMITS.truthCalls,
      result.stats.truthCalls);
    metrics.prefixCosts.push({startPackage,
      status: result.status, count: result.count,
      truthCalls: result.stats.truthCalls});
    const entry = result.status === "COMPLETE" ?
      {status: "COMPLETE", codes: result.codes,
        count: result.codes.length} :
      {status: result.status, codes: [], count: null};
    enumerated.set(startPackage, entry);
    if (entry.status === "COMPLETE")
      completePrefixProofs.set(startPackage, {
        status: "COMPLETE", version: PREFIX_PROOF_VERSION,
        sourceCode, prefixKey: prefixProofKey(prefix),
        count: entry.count, codes: entry.codes.slice()});
    return entry;
  }
  function masksFor(hints, codes) {
    return hints.map(hint => {
      let mask = 0n;
      for (let index = 0; index < codes.length; index++)
        if (!knownTruth(hint, [...codes[index]].map(Number)))
          mask |= bit(index);
      return mask;
    });
  }
  function baselineTail(startPackage, codes, fullMasks) {
    let alive = (1n << BigInt(codes.length)) - 1n;
    const counts = [];
    const masks = [];
    for (let packageIndex = startPackage;
      packageIndex <= context.packageCount; packageIndex++) {
      const pair = original.slice(2 * (packageIndex - 1),
        2 * packageIndex);
      const pairMasks = pair.map(hint => {
        let mask = 0n;
        for (let index = 0; index < codes.length; index++) {
          if (!fullMasks && !(alive & bit(index))) continue;
          if (!candidateTruth(hint, codes[index]))
            mask |= bit(index);
        }
        return mask;
      });
      masks.push(...pairMasks);
      const before = pop(alive);
      const aOwn = pop(alive & pairMasks[0] & ~pairMasks[1]);
      const bOwn = pop(alive & pairMasks[1] & ~pairMasks[0]);
      alive &= ~(pairMasks[0] | pairMasks[1]);
      counts.push({before, after: pop(alive), alive,
        aOwn, bOwn});
    }
    return {counts, masks, final: counts.at(-1).after};
  }
  function candidateGroups(window, codes) {
    const byTier = new Map();
    const firstSlot = 2 * (window.start - 1);
    const fixed = window.kind === "local" ?
      original.filter((_, index) => index < firstSlot ||
        index >= firstSlot + 2) :
      original.slice(0, firstSlot);
    const tiers = [...new Set(original.slice(2 * (window.start - 1),
      2 * window.end).map(hint => hint.tier))].sort();
    for (const tier of tiers) {
      const candidates = [];
      const pool = context.tierPools[tier].slice().sort((a, b) =>
        a.signature.localeCompare(b.signature) ||
        a.text.localeCompare(b.text));
      for (const hint of pool) {
        spend("candidateScans", LIMITS.candidateScans);
        if (hint.truth !== true || hint.id === "T5-04") continue;
        if (context.estimateInformationExclusionPercent(hint) <
            context.minimumInformationPercent) continue;
        if (fixed.some(previous =>
          previous.signature === hint.signature ||
          previous.text === hint.text ||
          hint.id === previous.id &&
            context.samePositionSet(hint, previous) ||
          hint.id !== previous.id &&
            context.candidatesConflict(hint, previous))) continue;
        candidates.push(hint);
      }
      byTier.set(tier, candidates);
    }
    const maskCache = new Map();
    return (tier, alive) => {
      const key = `${tier}|${alive}`;
      if (maskCache.has(key)) return maskCache.get(key);
      const masks = new Map();
      for (const hint of byTier.get(tier)) {
        let mask = 0n;
        for (let index = 0; index < codes.length; index++) {
          if (!(alive & bit(index)) || codes[index] === sourceCode)
            continue;
          if (!candidateTruth(hint, codes[index]))
            mask |= bit(index);
        }
        if (!mask) continue;
        const alternatives = masks.get(mask) || [];
        alternatives.push(hint);
        masks.set(mask, alternatives);
      }
      maskCache.set(key, masks);
      return masks;
    };
  }
  function localGuard(window, oldTail, afterPair, all) {
    let oldAlive = all;
    let newAlive = afterPair;
    const oldTarget = oldTail.masks[0] | oldTail.masks[1];
    oldAlive &= ~oldTarget;
    if (newAlive & ~oldAlive) return false;
    for (let index = 2; index < oldTail.masks.length;
      index += 2) {
      const mask = oldTail.masks[index] |
        oldTail.masks[index + 1];
      const oldNext = oldAlive & ~mask;
      const newNext = newAlive & ~mask;
      if (newNext & ~oldNext) return false;
      if (pop(oldNext) < pop(oldAlive) &&
          pop(newNext) >= pop(newAlive)) return false;
      oldAlive = oldNext;
      newAlive = newNext;
    }
    return pop(newAlive) <= oldTail.final;
  }
  function finalizedValid(window, codes, expectedSteps,
    oldTail, generatedTriples) {
    const fixed = new Set();
    for (let index = 0; index < original.length; index++)
      if (index < 2 * (window.start - 1) ||
          index >= 2 * window.end) fixed.add(index);
    for (const index of fixed)
      sameFrozenHint(context,
        context.toInternalHint(original[index]),
        context.toInternalHint(context.selected[index]),
        originalTriples[index], generatedTriples[index]);
    for (let index = 2 * (window.start - 1);
      index < 2 * window.end; index++) {
      const output = context.selected[index];
      assert.equal(output.tier, original[index].tier);
      assert.equal(output.packageNumber, Math.floor(index / 2) + 1);
      assert.equal(output.packagePosition, index % 2 + 1);
      const visible = context.toInternalHint(output);
      assert.equal(registeredWording(context, visible), true);
      const registeredCandidate = context.tierPools[visible.tier]
        .find(item => item.signature === visible.signature);
      assert.equal(visible.languageVariantCount,
        context.languageVariantsForCandidate(registeredCandidate,
          context.code).length);
      const derived = context.classifyHintLength(visible);
      assert.equal(visible.lengthClass, derived);
      assert.equal(visible.packageCompatibility.lengthClass,
        derived);
    }
    const all = (1n << BigInt(codes.length)) - 1n;
    let alive = all;
    const actualSteps = [];
    for (let packageIndex = window.start;
      packageIndex <= context.packageCount; packageIndex++) {
      const first = context.selected[2 * (packageIndex - 1)];
      const second = context.selected[2 * (packageIndex - 1) + 1];
      let aMask = 0n;
      let bMask = 0n;
      for (let index = 0; index < codes.length; index++) {
        if (!(alive & bit(index))) continue;
        const code = [...codes[index]].map(Number);
        if (!knownTruth(first, code)) aMask |= bit(index);
        if (!knownTruth(second, code)) bMask |= bit(index);
      }
      const aOwn = pop(alive & aMask & ~bMask);
      const bOwn = pop(alive & bMask & ~aMask);
      alive &= ~(aMask | bMask);
      actualSteps.push({after: pop(alive), aOwn, bOwn});
      if (packageIndex <= window.end &&
          (!aOwn || !bOwn)) return false;
    }
    if (pop(alive) > oldTail.final || !(alive &
        bit(codes.indexOf(sourceCode)))) return false;
    for (let index = 0; index < expectedSteps.length; index++) {
      const actual = actualSteps[index];
      const expected = expectedSteps[index];
      if (actual.after !== expected.after ||
          actual.aOwn !== expected.aOwn ||
          actual.bOwn !== expected.bOwn) return false;
    }
    if (window.kind === "local") {
      const targetIndex = 0;
      const oldTarget = oldTail.counts[targetIndex];
      const newTarget = actualSteps[targetIndex];
      if (oldTarget.aOwn && oldTarget.bOwn ||
          newTarget.after > oldTarget.after ||
          newTarget.after === oldTarget.after &&
            (!newTarget.aOwn || !newTarget.bOwn))
        return false;
      let previous = all & ~(oldTail.masks[0] |
        oldTail.masks[1]);
      let newPrevious = all & ~(masksFor(context.selected.slice(
        2 * (window.start - 1), 2 * window.start), codes)
        .reduce((mask, part) => mask | part, 0n));
      // Equal counts plus this subset check prove identical survivors.
      if (newPrevious & ~previous) return false;
      for (let index = 2; index < oldTail.masks.length;
        index += 2) {
        const oldNext = previous & ~(oldTail.masks[index] |
          oldTail.masks[index + 1]);
        const newMask = masksFor(context.selected.slice(
          2 * (window.start - 1) + index,
          2 * (window.start - 1) + index + 2), codes)
          .reduce((mask, part) => mask | part, 0n);
        const newNext = newPrevious & ~newMask;
        if (newNext & ~oldNext ||
            pop(oldNext) < pop(previous) &&
            pop(newNext) >= pop(newPrevious)) return false;
        previous = oldNext;
        newPrevious = newNext;
      }
    }
    for (const hint of context.selected)
      if (!knownTruth(hint, source)) return false;
    const coverageTelemetry = {sensitivityEvaluations: 0};
    const ordinaryCount = context.selected.length;
    const maximumCoverageCalls = ordinaryCount *
      (1 + context.code.length * 9) + ordinaryCount;
    if (metrics.truthCalls + maximumCoverageCalls >
        LIMITS.truthCalls)
      throw new IncompleteRepair("UNKNOWN_TRUTHCALLS_BUDGET");
    const mask = hooks.fullSetSensitivityMask(context.selected,
      context.code, coverageTelemetry);
    spend("truthCalls", LIMITS.truthCalls,
      coverageTelemetry.sensitivityEvaluations + ordinaryCount);
    return mask === hooks.allMask(context.code.length);
  }
  function attemptFinalization(window, codes, chosen,
    expectedSteps, oldTail) {
    spend("finalizations", LIMITS.finalizations);
    const proposed = structuredClone(original);
    for (let index = 0; index < chosen.length; index++) {
      const slot = 2 * (window.start - 1) + index;
      proposed[slot] = {...structuredClone(chosen[index]),
        packageNumber: Math.floor(slot / 2) + 1,
        packagePosition: slot % 2 + 1};
    }
    const proposedSemantics = proposed.map(hint =>
      structuredClone(stripPreFinalizationWording(
        context.toInternalHint(hint))));
    context.selected.splice(0, context.selected.length, ...proposed);
    try {
      let countingActive = true;
      try {
        finalizeSelection(() => {
          if (!countingActive)
            throw new IncompleteRepair("UNKNOWN_FINALIZATION_COUNT_SCOPE");
          spend("truthCalls", LIMITS.truthCalls);
        });
      } finally {
        countingActive = false;
      }
      const generatedTriples = context.selected.map(wordingTriple);
      hooks.validateEnglish(context);
      for (let index = 0; index < proposed.length; index++)
        assert.deepEqual(
          stripPreFinalizationWording(
            context.toInternalHint(context.selected[index])),
          proposedSemantics[index]);
      for (let index = 0; index < context.selected.length; index++)
        registerPairs(context.selected[index],
          context.selected.slice(0, index));
      hooks.verifyFinalPairwise(context, qualityCache);
      if (!finalizedValid(window, codes, expectedSteps,
          oldTail, generatedTriples)) return false;
      winner = {kind: window.kind, startPackage: window.start,
        endPackage: window.end,
        steps: expectedSteps.map(step => ({...step})),
        signatures: chosen.map(hint => hint.signature)};
      return true;
    } catch (error) {
      if (error instanceof IncompleteRepair) throw error;
      metrics.finalizationRejected++;
      return false;
    } finally {
      if (!winner) context.selected.splice(0,
        context.selected.length, ...structuredClone(original));
    }
  }
  function searchWindow(window, codes) {
    const all = (1n << BigInt(codes.length)) - 1n;
    const oldTail = baselineTail(window.start, codes,
      window.kind === "local");
    const targetStep = oldTail.counts[window.target - window.start];
    if (targetStep.after < targetStep.before &&
        targetStep.aOwn && targetStep.bOwn) return false;
    const groups = candidateGroups(window, codes);
    const firstSlot = 2 * (window.start - 1);
    const selected = window.kind === "local" ?
      original.filter((_, index) => index < firstSlot ||
        index >= firstSlot + 2) :
      original.slice(0, firstSlot);
    const chosen = [];
    const steps = [];
    const layerCount = window.end - window.start + 1;
    function logicalOptions(alive, layer) {
      const slot = 2 * (window.start - 1 + layer);
      const aTier = original[slot].tier;
      const bTier = original[slot + 1].tier;
      const result = [];
      for (const [aMask, aCandidates] of groups(aTier, alive))
        for (const [bMask, bCandidates] of groups(bTier, alive)) {
          spend("maskPairChecks", LIMITS.maskPairChecks);
          const aOwn = pop(alive & aMask & ~bMask);
          const bOwn = pop(alive & bMask & ~aMask);
          if (!aOwn || !bOwn) continue;
          const remaining = alive & ~(aMask | bMask);
          const count = pop(remaining);
          const remainingPackages = layerCount - layer - 1;
          if (window.kind === "tail") {
            if (count < 2 * remainingPackages + 1 ||
                layer === layerCount - 1 &&
                count > oldTail.final) continue;
          } else if (!localGuard(window, oldTail,
              remaining, all)) continue;
          result.push({aCandidates, bCandidates,
            remaining, count, aOwn, bOwn, aMask, bMask});
        }
      const before = pop(alive);
      const target = Math.max(2 * (layerCount - layer - 1) + 1,
        Math.round(before ** ((layerCount - layer - 1) /
          (layerCount - layer))));
      result.sort((a, b) =>
        Math.abs(a.count - target) -
          Math.abs(b.count - target) ||
        a.count - b.count ||
        (a.remaining < b.remaining ? -1 :
          a.remaining > b.remaining ? 1 : 0) ||
        (a.aMask < b.aMask ? -1 :
          a.aMask > b.aMask ? 1 : 0) ||
        (a.bMask < b.bMask ? -1 :
          a.bMask > b.bMask ? 1 : 0));
      return result;
    }
    function visit(alive, layer) {
      if (layer === layerCount)
        return attemptFinalization(window, codes,
          chosen, steps, oldTail);
      for (const option of logicalOptions(alive, layer))
        for (const first of option.aCandidates)
          for (const second of option.bCandidates) {
            spend("concretePairChecks", LIMITS.concretePairChecks);
            if (first.id === second.id ||
                !context.lengthPairAllowed(first, second) ||
                context.candidatesConflict(first, second)) continue;
            const telemetry = metrics;
            registerPairs(first, selected);
            if (!hooks.compatible(first, selected, context,
                qualityCache, telemetry)) continue;
            registerPairs(second, [...selected, first]);
            if (!hooks.compatible(second,
                [...selected, first], context,
                qualityCache, telemetry)) continue;
            chosen.push(first, second);
            selected.push(first, second);
            steps.push({before: pop(alive), after: option.count,
              aOwn: option.aOwn, bOwn: option.bOwn});
            const found = visit(option.remaining, layer + 1);
            steps.pop();
            selected.pop(); selected.pop();
            chosen.pop(); chosen.pop();
            if (found) return true;
          }
      return false;
    }
    const found = visit(all, 0);
    metrics.windows.push({kind: window.kind,
      startPackage: window.start, endPackage: window.end,
      prefixCount: codes.length, found});
    return found;
  }
  function withLogicalSpace(prefixHints, candidateHints,
    reserveFraction, run) {
    spend("prefixSessions", LIMITS.prefixSessions);
    const remaining = LIMITS.truthCalls - metrics.truthCalls;
    const reserved = Math.min(200000,
      Math.floor(remaining * reserveFraction));
    if (reserved < 1)
      throw new IncompleteRepair("UNKNOWN_TRUTHCALLS_BUDGET");
    spend("truthCalls", LIMITS.truthCalls, reserved);
    let space = null;
    try {
      space = createPrefixSpace({sourceCode,
        prefixHints, candidateHints,
        limits: {truthCalls: reserved,
          conditionalQueries: 24}});
      return run(space);
    } finally {
      if (space) {
        const used = space.stats().truthCalls;
        assert.ok(used <= reserved);
        metrics.truthCalls -= reserved - used;
      }
    }
  }
  function exactShortlistPair(prefixHints, pair) {
    return withLogicalSpace(prefixHints, pair, 1,
      space => {
        const before = space.prefixCount();
        if (before.status !== "complete")
          throw new IncompleteRepair(before.status);
        const result = space.evaluatePair(...pair);
        if (result.status !== "complete")
          throw new IncompleteRepair(result.status);
        return {before: before.count,
          after: result.conditions.AandB.count,
          aOwn: result.conditions.notAandB.count,
          bOwn: result.conditions.AandNotB.count};
      });
  }
  function shortlistTruth(hint, code) {
    const covered = knownTruth(hint, code);
    const visible = knownVisibleTruth(hint, code);
    return covered === visible ? covered : null;
  }
  function shortlistMask(hint, samples) {
    let mask = 0n;
    for (let index = 0; index < samples.length; index++) {
      const truth = shortlistTruth(hint,
        [...samples[index]].map(Number));
      if (truth === null) return null;
      if (!truth) mask |= bit(index);
    }
    return mask;
  }
  function prefixProofKey(hints) {
    return JSON.stringify(hints.map(hint => context.toInternalHint(hint)));
  }
  function validPrefixProof(proof, start, hints, bindOriginal) {
    return proof?.status === "COMPLETE" &&
      proof.version === PREFIX_PROOF_VERSION && proof.sourceCode === sourceCode &&
      Number.isInteger(proof.count) && proof.count > 0 && proof.count <= LIMITS.fullPrefix &&
      Array.isArray(proof.codes) && proof.codes.length === proof.count &&
      new Set(proof.codes).size === proof.count && proof.codes.includes(sourceCode) &&
      proof.codes.every(code => typeof code === "string" &&
        code.length === source.length && /^\d+$/u.test(code)) &&
      proof.prefixKey === prefixProofKey(hints.slice(0, 2 * (start - 1))) &&
      (!bindOriginal || proof.prefixKey ===
        prefixProofKey(original.slice(0, 2 * (start - 1))));
  }
  function paidPrefixTail(proof, start, hints, bindOriginal) {
    if (!validPrefixProof(proof, start, hints, bindOriginal))
      throw new IncompleteRepair("UNKNOWN_REUSE_PREFIX_BINDING");
    const certificate = {status: "COMPLETE", version: PREFIX_PROOF_VERSION,
      sourceCode, rows: []};
    let alive = proof.codes.slice();
    for (let number = start; number <= context.packageCount; number++) {
      const pair = hints.slice(2 * (number - 1), 2 * number);
      const survivors = [], aOwnCodes = [], bOwnCodes = [];
      for (const code of alive) {
        const digits = [...code].map(Number);
        const a = shortlistTruth(pair[0], digits), b = shortlistTruth(pair[1], digits);
        if (typeof a !== "boolean" || typeof b !== "boolean")
          throw new IncompleteRepair("UNKNOWN_REUSE_TRUTH");
        if (!a && b) aOwnCodes.push(code);
        else if (a && !b) bOwnCodes.push(code);
        else if (a && b) survivors.push(code);
      }
      if (!survivors.includes(sourceCode))
        throw new IncompleteRepair("UNKNOWN_REUSE_SOURCE_LOST");
      certificate.rows.push({number, prefixKey: prefixProofKey(hints.slice(0, 2 * (number - 1))),
        pairKey: prefixProofKey(pair), pairHints: structuredClone(pair),
        codesBefore: alive.slice(), survivors, aOwnCodes, bOwnCodes,
        step: {before: String(alive.length), after: String(survivors.length),
          aOwn: String(aOwnCodes.length), bOwn: String(bOwnCodes.length)}});
      alive = survivors;
    }
    return certificate;
  }
  function prefixTailStep(certificate, number, hints) {
    const row = certificate?.rows.find(item => item.number === number);
    const pair = hints.slice(2 * (number - 1), 2 * number);
    if (certificate?.status !== "COMPLETE" || certificate.version !== PREFIX_PROOF_VERSION ||
        certificate.sourceCode !== sourceCode || !row ||
        row.prefixKey !== prefixProofKey(hints.slice(0, 2 * (number - 1))) ||
        row.pairKey !== prefixProofKey(pair) || row.pairKey !== prefixProofKey(row.pairHints) ||
        row.codesBefore.length !== Number(row.step.before) ||
        row.survivors.length !== Number(row.step.after) ||
        row.aOwnCodes.length !== Number(row.step.aOwn) || row.bOwnCodes.length !== Number(row.step.bOwn) ||
        !row.codesBefore.includes(sourceCode) || !row.survivors.includes(sourceCode))
      throw new IncompleteRepair("UNKNOWN_REUSE_CERTIFICATE_BINDING");
    return {...row.step};
  }
  function shortlistFinalization(baseline, target,
    pair, targetStep, suffix) {
    spend("finalizations", LIMITS.finalizations);
    const slot = 2 * (target - 1);
    const proposed = structuredClone(baseline);
    for (let offset = 0; offset < 2; offset++)
      proposed[slot + offset] = {...structuredClone(pair[offset]),
        packageNumber: target, packagePosition: offset + 1};
    const semantics = proposed.map(hint =>
      structuredClone(stripPreFinalizationWording(
        context.toInternalHint(hint))));
    const baselineTriples = baseline.map(wordingTriple);
    context.selected.splice(0, context.selected.length,
      ...proposed);
    let accepted = false;
    try {
      let countingActive = true;
      try {
        finalizeSelection(() => {
          if (!countingActive)
            throw new IncompleteRepair(
              "UNKNOWN_FINALIZATION_COUNT_SCOPE");
          spend("truthCalls", LIMITS.truthCalls);
        });
      } finally {countingActive = false;}
      const generatedTriples = context.selected.map(wordingTriple);
      hooks.validateEnglish(context);
      for (let index = 0; index < proposed.length; index++) {
        const output = context.toInternalHint(
          context.selected[index]);
        assert.deepEqual(stripPreFinalizationWording(output),
          semantics[index]);
        if (index !== slot && index !== slot + 1)
          sameFrozenHint(context,
            context.toInternalHint(baseline[index]), output,
            baselineTriples[index], generatedTriples[index]);
        else {
          assert.equal(output.tier,
            baseline[index].tier);
          assert.equal(output.packageNumber, target);
          assert.equal(output.packagePosition,
            index - slot + 1);
          assert.equal(registeredWording(context, output),
            true);
          const registered = context.tierPools[output.tier]
            .find(item => item.signature === output.signature);
          assert.equal(output.languageVariantCount,
            context.languageVariantsForCandidate(registered,
              context.code).length);
          const length = context.classifyHintLength(output);
          assert.equal(output.lengthClass, length);
          assert.equal(output.packageCompatibility.lengthClass,
            length);
        }
      }
      for (let index = 0; index < context.selected.length;
        index++) registerPairs(context.selected[index],
          context.selected.slice(0, index));
      hooks.verifyFinalPairwise(context, qualityCache);
      for (const hint of context.selected)
        if (!shortlistTruth(hint, source)) return false;
      const coverageTelemetry = {sensitivityEvaluations: 0};
      const ordinaryCount = context.selected.length;
      const maximum = ordinaryCount *
        (1 + context.code.length * 9) + ordinaryCount;
      if (metrics.truthCalls + maximum > LIMITS.truthCalls)
        throw new IncompleteRepair(
          "UNKNOWN_TRUTHCALLS_BUDGET");
      const mask = hooks.fullSetSensitivityMask(
        context.selected, context.code,
        coverageTelemetry);
      spend("truthCalls", LIMITS.truthCalls,
        coverageTelemetry.sensitivityEvaluations +
          ordinaryCount);
      if (mask !== hooks.allMask(context.code.length))
        return false;
      winner = {kind: "local", startPackage: target,
        endPackage: target,
        steps: [{before: Number(targetStep.before),
          after: Number(targetStep.after),
          aOwn: Number(targetStep.aOwn),
          bOwn: Number(targetStep.bOwn)}],
        signatures: pair.map(hint => hint.signature),
        method: "sampled-shortlist-exact",
        suffixSteps: suffix.map(row => ({...row}))};
      accepted = true;
      return true;
    } catch (error) {
      if (error instanceof IncompleteRepair) throw error;
      metrics.finalizationRejected++;
      return false;
    } finally {
      if (!accepted) context.selected.splice(0,
        context.selected.length,
        ...structuredClone(baseline));
    }
  }
  function trySampledShortlist(previous) {
    if (!metrics.prefixCosts.some(row =>
      row.status === "UNKNOWN_TOO_LARGE"))
      return previous;
    const baseline = structuredClone(context.selected);
    const heldWitness = winner;
    let accepted = false;
    const detail = {status: "NOT_ATTEMPTED"};
    metrics.shortlist = detail;
    try {
      const unknown = hooks.packageStatuses
        .map((status, index) => status === "unknown" ?
          index + 1 : null).filter(Boolean);
      const target = unknown[0];
      if (!target) return previous;
      detail.target = target;
      const slot = 2 * (target - 1);
      const prefix = baseline.slice(0, slot);
      const oldPair = baseline.slice(slot, slot + 2);
      const fixed = baseline.filter((_, index) =>
        index < slot || index >= slot + 2);
      if (oldPair.length !== 2 ||
          oldPair.some(hint => hint.id === "T5-04" ||
            hint.intentionallyFalse)) return previous;
      // Only session-local, already paid complete evidence can select this path.
      // Check before registering the next pair, preserving the existing path otherwise.
      const cachedPrefix = completePrefixProofs.get(target + 2);
      const reusePrefix = target + 2 <= context.packageCount &&
        validPrefixProof(cachedPrefix, target + 2, baseline, true) ? cachedPrefix : null;
      const nextPair = reusePrefix ? baseline.slice(slot + 2, slot + 4) : [];
      const scanLeft = LIMITS.candidateScans -
        metrics.candidateScans;
      if (scanLeft < 2)
        throw new IncompleteRepair(
          "UNKNOWN_CANDIDATESCANS_BUDGET");
      const scanCaps = [Math.floor(scanLeft / 2),
        scanLeft - Math.floor(scanLeft / 2)];
      const rawCounts = oldPair.map(hint =>
        context.tierPools[hint.tier].length);
      if (rawCounts[0] + rawCounts[1] <= scanLeft)
        scanCaps.splice(0, 2, ...rawCounts);
      const eligible = (tier, cap) => context.tierPools[tier]
        .slice().sort((a, b) =>
          a.signature.localeCompare(b.signature) ||
          a.text.localeCompare(b.text))
        .slice(0, cap).filter(hint => {
          spend("candidateScans", LIMITS.candidateScans);
          return hint.truth === true &&
            hint.id !== "T5-04" &&
            context.estimateInformationExclusionPercent(hint) >=
              context.minimumInformationPercent &&
            !fixed.some(previousHint =>
              previousHint.signature === hint.signature ||
              previousHint.text === hint.text ||
              hint.id === previousHint.id &&
                context.samePositionSet(hint,
                  previousHint) ||
              hint.id !== previousHint.id &&
                context.candidatesConflict(hint,
                  previousHint)) &&
            shortlistTruth(hint, source) === true;
        });
      const pools = [eligible(oldPair[0].tier,
        scanCaps[0]), eligible(oldPair[1].tier,
        scanCaps[1])];
      if (pools.some(pool => !pool.length))
        return previous;
      const chosen = withLogicalSpace(prefix,
        [...oldPair, ...pools.flat(), ...nextPair], 0.65,
        space => {
          const counted = space.prefixCount();
          if (counted.status !== "complete")
            throw new IncompleteRepair(counted.status);
          detail.prefixCount = counted.count;
          if (BigInt(counted.count) <=
              BigInt(LIMITS.fullPrefix)) return null;
          const sampled = space.samplePrefix(64);
          if (sampled.status !== "complete")
            throw new IncompleteRepair(sampled.status);
          const samples = sampled.samples;
          detail.sampleCount = samples.length;
          const masks = pools.map(pool =>
            pool.map(hint => shortlistMask(hint,
              samples)));
          const rankSuffix = context.packageCount -
            target >= 4;
          const suffixMasks = rankSuffix ?
            baseline.slice(slot + 2).map(hint =>
              shortlistMask(hint, samples)) : [];
          if (suffixMasks.some(mask => mask === null))
            throw new IncompleteRepair(
              "UNKNOWN_SUFFIX_SEMANTICS");
          const all = (1n << BigInt(samples.length)) - 1n;
          const ranked = [];
          for (let left = 0; left < pools[0].length;
            left++) {
            const aMask = masks[0][left];
            if (aMask === null) continue;
            for (let right = 0; right <
              pools[1].length; right++) {
              spend("maskPairChecks", LIMITS.maskPairChecks);
              const bMask = masks[1][right];
              if (bMask === null) continue;
              const a = pools[0][left];
              const b = pools[1][right];
              if (a.id === b.id ||
                  !context.lengthPairAllowed(a, b) ||
                  context.candidatesConflict(a, b))
                continue;
              spend("concretePairChecks",
                LIMITS.concretePairChecks);
              const aOwn = pop(aMask & ~bMask);
              const bOwn = pop(bMask & ~aMask);
              if (!aOwn || !bOwn) continue;
              let alive = all & ~(aMask | bMask);
              const survivors = pop(alive);
              let positive = 0;
              for (let index = 0; index <
                suffixMasks.length; index += 2) {
                const suffixA = suffixMasks[index];
                const suffixB = suffixMasks[index + 1];
                if (pop(alive & suffixA &
                    ~suffixB)) positive++;
                if (pop(alive & suffixB &
                    ~suffixA)) positive++;
                alive &= ~(suffixA | suffixB);
              }
              const targetSize = Math.min(16,
                Math.max(4, Math.round(
                  samples.length / 4)));
              ranked.push({left, right,
                score: (suffixMasks.length - positive) *
                    100000 +
                  Math.abs(survivors - targetSize) *
                    100 - Math.min(aOwn, bOwn)});
            }
          }
          ranked.sort((a, b) => a.score - b.score ||
            pools[0][a.left].signature.localeCompare(
              pools[0][b.left].signature) ||
            pools[1][a.right].signature.localeCompare(
              pools[1][b.right].signature));
          const shortlist = [];
          for (const item of ranked) {
            if (shortlist.length === 6) break;
            if (shortlist.some(previousItem =>
              previousItem.left === item.left ||
              previousItem.right === item.right))
              continue;
            shortlist.push(item);
          }
          detail.shortlistCount = shortlist.length;
          const old = space.evaluatePair(...oldPair);
          if (old.status !== "complete")
            throw new IncompleteRepair(old.status);
          if (old.conditions.AandB.count !==
              counted.count) return null;
          const chosenFixed = fixed;
          for (const item of shortlist) {
            const pair = [pools[0][item.left],
              pools[1][item.right]];
            const proof = space.evaluatePair(...pair);
            if (proof.status !== "complete")
              throw new IncompleteRepair(proof.status);
            const targetStep = {before: counted.count,
              after: proof.conditions.AandB.count,
              aOwn: proof.conditions.notAandB.count,
              bOwn: proof.conditions.AandNotB.count};
            if (BigInt(targetStep.aOwn) === 0n ||
                BigInt(targetStep.bOwn) === 0n ||
                BigInt(targetStep.after) >=
                  BigInt(targetStep.before)) continue;
            registerPairs(pair[0], chosenFixed);
            if (!hooks.compatible(pair[0],
                chosenFixed, context, qualityCache,
                metrics)) continue;
            registerPairs(pair[1],
              [...chosenFixed, pair[0]]);
            if (!hooks.compatible(pair[1],
                [...chosenFixed, pair[0]], context,
                qualityCache, metrics)) continue;
            let nextStep = null;
            if (reusePrefix) {
              // The exact old null pair makes this prefix identical to the
              // old prefix after the target. The registered next pair can reuse it.
              const nextProof = space.evaluatePair(...nextPair);
              if (nextProof.status !== "complete")
                throw new IncompleteRepair(nextProof.status);
              nextStep = {before: counted.count, after: nextProof.conditions.AandB.count,
                aOwn: nextProof.conditions.notAandB.count, bOwn: nextProof.conditions.AandNotB.count,
                version: PREFIX_PROOF_VERSION, sourceCode,
                prefixKey: prefixProofKey(prefix), oldPairKey: prefixProofKey(oldPair),
                pairKey: prefixProofKey(nextPair)};
            }
            return {pair, targetStep, nextStep};
          }
          return null;
        });
      if (!chosen) return previous;
      const proposed = baseline.slice();
      proposed.splice(slot, 2, ...chosen.pair);
      let oldTail = null, newTail = null;
      if (reusePrefix) {
        const newPrefix = proposed.slice(0, 2 * target);
        const population = withLogicalSpace(newPrefix, [], 1,
          space => space.enumeratePrefix(LIMITS.fullPrefix));
        if (population.status !== "COMPLETE" || population.count !== chosen.targetStep.after ||
            population.codes.length !== Number(population.count))
          throw new IncompleteRepair("UNKNOWN_NEW_PAID_PREFIX");
        newTail = paidPrefixTail({status: "COMPLETE", version: PREFIX_PROOF_VERSION,
          sourceCode, prefixKey: prefixProofKey(newPrefix),
          count: population.codes.length, codes: population.codes.slice()},
        target + 1, proposed, false);
        oldTail = paidPrefixTail(reusePrefix, target + 2, baseline, true);
        detail.prefixReuse = {startPackage: target + 2, oldCount: reusePrefix.count,
          newCount: population.codes.length};
      }
      let oldPrevious = chosen.targetStep.before;
      let newPrevious = chosen.targetStep.after;
      const suffix = [];
      for (let number = target + 1;
        number <= context.packageCount; number++) {
        const pair = baseline.slice(2 * (number - 1),
          2 * number);
        let oldStep;
        if (reusePrefix && number === target + 1) {
          const proof = chosen.nextStep;
          if (!proof || proof.version !== PREFIX_PROOF_VERSION || proof.sourceCode !== sourceCode ||
              proof.prefixKey !== prefixProofKey(prefix) || proof.oldPairKey !== prefixProofKey(oldPair) ||
              proof.pairKey !== prefixProofKey(pair))
            throw new IncompleteRepair("UNKNOWN_REUSE_NEXT_PAIR_BINDING");
          oldStep = {before: proof.before, after: proof.after, aOwn: proof.aOwn, bOwn: proof.bOwn};
        } else oldStep = oldTail ? prefixTailStep(oldTail, number, baseline) :
          exactShortlistPair(baseline.slice(0, 2 * (number - 1)), pair);
        const newStep = newTail ? prefixTailStep(newTail, number, proposed) :
          exactShortlistPair(proposed.slice(0, 2 * (number - 1)), pair);
        if (oldStep.before !== oldPrevious ||
            newStep.before !== newPrevious ||
            BigInt(oldStep.aOwn) > 0n &&
              BigInt(newStep.aOwn) === 0n ||
            BigInt(oldStep.bOwn) > 0n &&
              BigInt(newStep.bOwn) === 0n ||
            BigInt(oldStep.after) <
              BigInt(oldStep.before) &&
              BigInt(newStep.after) >=
                BigInt(newStep.before) ||
            BigInt(newStep.after) >
              BigInt(oldStep.after))
          return previous;
        oldPrevious = oldStep.after;
        newPrevious = newStep.after;
        suffix.push({packageNumber: number,
          old: oldStep, replacement: newStep});
      }
      detail.suffix = suffix;
      if (shortlistFinalization(baseline, target,
          chosen.pair, chosen.targetStep,
          suffix)) {
        accepted = true;
        detail.status = "CERTIFIED";
        return Object.freeze({repaired: true,
          witness: winner, metrics});
      }
      return previous;
    } catch (error) {
      detail.status = error instanceof IncompleteRepair ?
        error.message : `UNKNOWN_SHORTLIST_ERROR:${error.message}`;
      return previous;
    } finally {
      if (!accepted) {
        context.selected.splice(0,
          context.selected.length,
          ...structuredClone(baseline));
        winner = heldWitness;
      }
    }
  }
  function runExistingRepair() {
  try {
    const statuses = hooks.packageStatuses;
    if (!Array.isArray(statuses) ||
        statuses.length !== context.packageCount)
      return Object.freeze({repaired: false,
        reason: "NO_PACKAGE_STATUS", metrics});
    const unknown = statuses.map((status, index) =>
      status === "unknown" ? index + 1 : null)
      .filter(Boolean);
    if (!unknown.length) return Object.freeze({repaired: false,
      reason: "NO_UNKNOWN_PACKAGE", metrics});
    const boundaryUnknown = unknown.filter(packageNumber =>
      statuses[packageNumber] === "proven");
    const target = boundaryUnknown.at(-1) || unknown[0];
    // Later prefixes cannot have more survivors than earlier prefixes.
    // Choose the earliest fully proven tail start before a later local pair.
    const localTargets = unknown.slice().reverse();
    const latestTarget = localTargets[0];
    const tailFirst = target === context.packageCount - 1 &&
      statuses[target] === "proven";
    function tryLocal(localTarget) {
      const localPrefix = fullPrefix(localTarget);
      if (localPrefix.status === "UNKNOWN_TOO_LARGE") return false;
      if (localPrefix.status !== "COMPLETE")
        throw new IncompleteRepair(
          `UNKNOWN_PREFIX_${localPrefix.status}`);
      if (localPrefix.count >= 3) {
        const local = {kind: "local", start: localTarget,
          end: localTarget, target: localTarget};
        return searchWindow(local, localPrefix.codes);
      }
      return false;
    }
    function holdLocal() {
      const held = {selected: structuredClone(context.selected),
        witness: winner};
      context.selected.splice(0, context.selected.length,
        ...structuredClone(original));
      winner = null;
      return held;
    }
    function useHeldLocal(held) {
      context.selected.splice(0, context.selected.length,
        ...structuredClone(held.selected));
      winner = held.witness;
      return Object.freeze({repaired: true, witness: winner, metrics});
    }
    function maybeBounded() {
      if (!winner || winner.kind !== "local")
        return Object.freeze({repaired: true, witness: winner, metrics});
      const held = holdLocal();
      try {
        const start = held.witness.startPackage;
        const prefix = fullPrefix(start);
        if (prefix.status !== "COMPLETE")
          return useHeldLocal(held);
        const old = baselineTail(start, prefix.codes, false);
        const firstUnique = old.counts.findIndex(step =>
          step.before > 1 && step.after === 1);
        const nullIndex = old.counts.findIndex((step, index) =>
          index < firstUnique && step.before > 1 &&
          step.after === step.before);
        if (firstUnique < 1 || nullIndex < 0 ||
            firstUnique + 1 > 6)
          return useHeldLocal(held);
        const bounded = {kind: "tail", start,
          end: start + firstUnique, target: start + nullIndex};
        if (searchWindow(bounded, prefix.codes))
          return Object.freeze({repaired: true, witness: winner, metrics});
      } catch {
        // A failed extra search cannot discard the certified local result.
      }
      return useHeldLocal(held);
    }
    let earliest = null;
    let unresolvedPrefix = null;
    const firstStart = Math.max(1,
      context.packageCount - 5);
    for (let start = target; start >= firstStart; start--) {
      const prefix = fullPrefix(start);
      if (prefix.status === "UNKNOWN_TOO_LARGE") break;
      if (prefix.status !== "COMPLETE") {
        unresolvedPrefix = `UNKNOWN_PREFIX_${prefix.status}`;
        break;
      }
      if (prefix.count >=
          2 * (context.packageCount - start + 1) + 1)
        earliest = {start, codes: prefix.codes};
    }
    // An earlier complete window can improve more packages. Keep a fully
    // finalized local result in case that wider search exhausts its budget.
    let heldLocal = null;
    if (earliest && earliest.start < target && !unresolvedPrefix &&
        (tryLocal(latestTarget) ||
          !tailFirst && target !== latestTarget && tryLocal(target)))
      heldLocal = holdLocal();
    if (earliest && !unresolvedPrefix) {
      const tail = {kind: "tail", start: earliest.start,
        end: context.packageCount, target};
      try {
        if (searchWindow(tail, earliest.codes))
          return Object.freeze({repaired: true,
            witness: winner, metrics});
      } catch (error) {
        if (heldLocal && error instanceof IncompleteRepair)
          return useHeldLocal(heldLocal);
        throw error;
      }
    }
    if (heldLocal) return useHeldLocal(heldLocal);
    if (tryLocal(latestTarget))
      return maybeBounded();
    if (!tailFirst && target !== latestTarget && tryLocal(target))
      return maybeBounded();
    for (const localTarget of localTargets)
      if (localTarget !== target &&
          localTarget !== latestTarget &&
          tryLocal(localTarget))
        return maybeBounded();
    if (tailFirst && target !== latestTarget && tryLocal(target))
      return maybeBounded();
    return Object.freeze({repaired: false,
      reason: unresolvedPrefix || "NO_CERTIFIED_REPAIR", metrics});
  } catch (error) {
    return Object.freeze({repaired: false,
      reason: error instanceof IncompleteRepair ?
        error.message : `UNKNOWN_REPAIR_ERROR:${error.message}`,
      metrics});
  } finally {
    if (!winner) context.selected.splice(0,
      context.selected.length, ...structuredClone(original));
  }
  }
  const previous = runExistingRepair();
  return trySampledShortlist(previous);
}

module.exports = Object.freeze({LIMITS, repairPackageContent,
  revalidateDistinctnessProof});

},
"prototypes/firebase-lock-attempt/functions/src/hints/visible-hint-truth.cjs":function(module,exports,require){
"use strict";

const PRIME_DIGITS = new Set([2, 3, 5, 7]);
const SQUARE_DIGITS = new Set([0, 1, 4, 9]);
const CUBE_DIGITS = new Set([0, 1, 8]);
const COMPOSITE_DIGITS = new Set([4, 6, 8, 9]);
const POWER_OF_TWO_DIGITS = new Set([1, 2, 4, 8]);
const FIBONACCI_DIGITS = new Set([0, 1, 2, 3, 5, 8]);
const DISTINCT_PRIME_SUM_DIGITS = new Set([5, 7, 8, 9]);
const FACTORIAL_DIGITS = new Set([1, 2, 6]);
const TRIANGULAR_DIGITS = new Set([0, 1, 3, 6]);
const SQUARE_SUMS = new Set([0, 1, 4, 9, 16]);
const FIBONACCI_SUMS = new Set([0, 1, 2, 3, 5, 8, 13]);
const PRIME_SUMS = new Set([2, 3, 5, 7, 11, 13, 17]);

const relation = (first, second) => first > second ? "größer" : first < second ? "kleiner" : "gleich";
const digitSum = (value) => String(value).split("").reduce((sum, digit) => sum + Number(digit), 0);
const statedEvenParity = (text) => {
  if (typeof text !== "string") return null;
  const even = /\bgerade\b/u.test(text.toLowerCase());
  const odd = /\bungerade\b/u.test(text.toLowerCase());
  return even === odd ? null : even;
};
const relationFromHint = (hint) => {
  if (["größer", "kleiner", "gleich"].includes(hint.details?.comparison)) return hint.details.comparison;
  const text = String(hint.text || "").toLowerCase();
  if (text.includes("größer") || text.includes("mehr")) return "größer";
  if (text.includes("kleiner") || text.includes("weniger")) return "kleiner";
  return "gleich";
};

function analyzeCode(code) {
  const indexed = code.map((value, position) => ({value, position}));
  const valuesFor = (predicate) => code.filter(predicate);
  const firstPositionFor = (predicate) => indexed.find((entry) => predicate(entry.value))?.position ?? null;
  const lastPositionFor = (predicate) => indexed.slice().reverse().find((entry) => predicate(entry.value))?.position ?? null;
  const primes = valuesFor((value) => PRIME_DIGITS.has(value));
  const evens = valuesFor((value) => value % 2 === 0);
  const odds = valuesFor((value) => value % 2 !== 0);
  const sorted = code.slice().sort((first, second) => first - second);
  const minimum = sorted[0];
  const maximum = sorted.at(-1);
  const median = code.length % 2 === 0 ?
    (sorted[code.length / 2 - 1] + sorted[code.length / 2]) / 2 :
    sorted[Math.floor(code.length / 2)];
  const firstPrime = firstPositionFor((value) => PRIME_DIGITS.has(value));
  const lastPrime = lastPositionFor((value) => PRIME_DIGITS.has(value));
  const firstEven = firstPositionFor((value) => value % 2 === 0);
  const lastOdd = lastPositionFor((value) => value % 2 !== 0);
  const firstMinimum = code.indexOf(minimum);
  const lastMinimum = code.lastIndexOf(minimum);
  const firstMaximum = code.indexOf(maximum);
  const lastMaximum = code.lastIndexOf(maximum);
  return {
    minimum,
    maximum,
    median,
    medianFirst: code.indexOf(median),
    smallestEven: evens.length ? Math.min(...evens) : null,
    largestPrime: primes.length ? Math.max(...primes) : null,
    largestOdd: odds.length ? Math.max(...odds) : null,
    firstPrime,
    lastPrime,
    afterFirstPrime: Number.isInteger(firstPrime) && firstPrime < code.length - 1 ? firstPrime + 1 : null,
    beforeLastPrime: Number.isInteger(lastPrime) && lastPrime > 0 ? lastPrime - 1 : null,
    firstEven,
    lastOdd,
    firstMinimum,
    lastMinimum,
    firstMaximum,
    lastMaximum,
  };
}

function patternFrequencies(values) {
  const frequencies = new Map();
  for (const value of values) frequencies.set(value, (frequencies.get(value) || 0) + 1);
  return [...frequencies.values()];
}

function visibleHintIsTrue(hint, code) {
  if (!hint || !Array.isArray(code) || ![8, 10, 11, 12].includes(code.length) ||
      code.some(value => !Number.isInteger(value) || value < 0 || value > 9) ||
      !Array.isArray(hint.internalPositions) ||
      hint.internalPositions.some(position => !Number.isInteger(position) ||
        position < 0 || position >= code.length)) return null;
  const id = hint.id;
  const p = hint.internalPositions;
  const d = hint.details || {};
  const v = p.map((position) => code[position]);
  const text = String(hint.text || "").toLowerCase();

  if (/^T1-DIGIT-\d{2}$/.test(id)) {
    const digit = Number(id.slice(-2));
    return id === "T1-DIGIT-06" ? v[0] === 6 && v[1] === 3 : v[0] === digit;
  }
  if (id === "T1-01") {
    const even = statedEvenParity(hint.text);
    return even === null ? null : (v[0] % 2 === 0) === even;
  }
  if (id === "T1-02") return PRIME_DIGITS.has(v[0]) === !text.includes("keine primzahl");
  if (id === "T1-03") return SQUARE_DIGITS.has(v[0]) === !text.includes("keine quadratzahl");
  if (id === "T1-05") return COMPOSITE_DIGITS.has(v[0]) === (d.composite === true);
  if (id === "T1-06") return POWER_OF_TWO_DIGITS.has(v[0]) === (d.powerOfTwo === true);
  if (id === "T1-07") return CUBE_DIGITS.has(v[0]) === (d.cube === true);
  if (id === "T1-08") return FIBONACCI_DIGITS.has(v[0]) === !text.includes("nicht zur fibonacci");
  if (id === "T1-09") return (v[0] % 2 === (p[0] + 1) % 2) === (d.samePositionParity === true);
  if (id === "T1-12") return DISTINCT_PRIME_SUM_DIGITS.has(v[0]) === (d.distinctPrimeSum === true);
  if (id === "T1-13") return FACTORIAL_DIGITS.has(v[0]) === (d.factorial === true);
  if (id === "T1-14") return TRIANGULAR_DIGITS.has(v[0]) === (d.triangular === true);

  if (id === "T2-01") return relation(v[0], v[1]) === relationFromHint(hint);
  if (id === "T2-02") return SQUARE_SUMS.has(v[0] + v[1]) === (d.square === true);
  if (id === "T2-03") return SQUARE_DIGITS.has(Math.abs(v[0] - v[1])) === (d.square === true);
  if (id === "T2-04") return (v[0] % 2 === v[1] % 2) === (d.sameParity === true);
  if (id === "T2-06") {
    const even = statedEvenParity(hint.text);
    return even === null ? null :
      (Math.abs(v[0] - v[1]) % 2 === 0) === even;
  }
  if (id === "T2-07") return Number.isInteger(Math.sqrt(v[0] * v[1])) === (d.square === true);
  if (id === "T2-08") return Math.abs(v[0] - v[1]) === 1;
  if (id === "T2-09") return d.ratioDirection === "double" ? v[0] === 2 * v[1] : d.ratioDirection === "half" ? 2 * v[0] === v[1] : false;
  if (id === "T2-10") return FIBONACCI_SUMS.has(v[0] + v[1]) === (d.fibonacci === true);
  if (id === "T2-11") return v[1] !== 0 && v[0] % v[1] === 0;
  if (id === "T2-12") {
    const number = 10 * v[0] + v[1];
    const twoDigitSquare = v[0] !== 0 && Number.isInteger(Math.sqrt(number));
    return twoDigitSquare === (d.square === true);
  }
  if (id === "T2-13") return PRIME_DIGITS.has(Math.abs(v[0] - v[1])) === !text.includes("keine primzahl");
  if (id === "T2-14") return (v[0] === v[1]) === (d.equal === true);
  if (id === "T2-15") return Math.abs(v[0] - 5) === Math.abs(v[1] - 5);
  if (id === "T2-16") return PRIME_SUMS.has(v[0] + v[1]) === (d.prime === true);

  if (id === "T3-01") return relation(v[0] + v[1], v[2]) === d.comparison;
  if (id === "T3-02") return text.includes("kleiner") ? v[0] > v[1] && v[1] > v[2] : v[0] < v[1] && v[1] < v[2];
  if (id === "T3-03") return relation(v[0] * v[1], v[2]) === d.comparison;
  if (id === "T3-04") return new Set(v).size === 2 && patternFrequencies(v).includes(2);
  if (id === "T3-06") return v[1] - v[0] !== 0 && v[1] - v[0] === v[2] - v[1];
  if (id === "T3-07") return v[1] < v[0] && v[0] < v[2];
  if (id === "T3-08") return relation(Math.abs(v[0] - v[1]), v[2]) === d.comparison;
  if (id === "T3-09") {
    const palindrome = v[0] !== 0 && v[0] === v[2];
    return palindrome === (d.palindrome === true);
  }
  if (id === "T3-10") return v[0] + v[1] === v[2];
  if (id === "T3-11") return Math.abs(v[0] - v[1]) === v[2];
  if (id === "T3-12") return v[0] + v[1] === 2 * v[2];
  if (id === "T3-13") return PRIME_DIGITS.has(Math.max(...v) - Math.min(...v)) === (d.prime === true);
  if (id === "T3-14") {
    const sides = v.slice().sort((first, second) => first - second);
    return sides[0] > 0 && sides[0] + sides[1] > sides[2];
  }
  if (id === "T3-15") return ((v[0] + v[1] + v[2]) % 2 === 0) === (d.parity === "even");
  if (id === "T3-16") return (v[0] * v[1]) % 10 === v[2];
  if (id === "T3-17") return (d.variant === "productPlus" ? v[2] + v[0] * v[1] : v[2] - v[0] * v[1]) === d.result;
  if (id === "T3-18") return (d.variant === "groupedPlus" ? v[0] + v[1] : v[0] - v[1]) * v[2] === d.result;
  if (id === "T3-19") return digitSum(v[0] * v[1]) === v[2];
  if (id === "T3-20") return v[0] !== 0 && (10 * v[0] + v[1]) % d.divisor === 0;

  if (id === "T4-01") return v.every((value, index) => value === v[v.length - 1 - index]);
  if (id === "T4-02") return relation(v[0] + v[1], v[2] + v[3]) === relationFromHint(hint);
  if (id === "T4-03") return ((v[0] + v[1]) % 2 === (v[2] + v[3]) % 2) === (d.sameParity === true);
  if (id === "T4-04") return v[0] === v[2] && v[1] === v[3] && v[0] !== v[1];
  if (id === "T4-05") return Math.abs(v[0] - v[1]) > 0 && Math.abs(v[0] - v[1]) === Math.abs(v[2] - v[3]);
  if (id === "T4-06") return relation(v[0] * v[1], v[2] * v[3]) === d.comparison;
  if (id === "T4-07") return v[0] === v[1] && v[2] === v[3] && v[0] !== v[2];
  if (id === "T4-08") {
    const first = d.firstGroup.reduce((sum, position) => sum + code[position], 0);
    const second = d.secondGroup.reduce((sum, position) => sum + code[position], 0);
    return first === second;
  }
  if (id === "T4-09") {
    const counts = patternFrequencies(v);
    return counts.filter((count) => count === 2).length === 1 && counts.every((count) => count === 1 || count === 2);
  }
  if (id === "T4-10") return v[0] === v[3] && v[1] === v[4] && v[2] === v[5] && new Set(v.slice(0, 3)).size >= 2;
  if (id === "T4-11") return v.slice(1).every((value, index) => v[index] < value);
  if (id === "T4-12") return v.slice(1).every((value, index) => v[index] > value);
  if (id === "T4-13") return v[1] - v[0] !== 0 && v.slice(1).every((value, index) => value - v[index] === v[1] - v[0]);
  if (id === "T4-14") {
    const first = d.firstGroup.reduce((sum, position) => sum + code[position], 0);
    const second = d.secondGroup.reduce((sum, position) => sum + code[position], 0);
    return d.relation === "mehr" ? first > second : first < second;
  }
  if (id === "T4-15") return code.filter((value) => value === v[0]).length === d.frequency;
  if (id === "T4-16") {
    const counts = patternFrequencies(v);
    return counts.filter((count) => count === 2).length === 2 && counts.every((count) => count === 1 || count === 2);
  }
  if (id === "T4-17") return new Set(v).size === v.length;
  if (id === "T4-18") return v[0] + v[5] === v[1] + v[4] && v[1] + v[4] === v[2] + v[3];
  if (id === "T4-19") return Math.abs(v[0] + v[1] - v[3] - v[4]) === v[2];
  if (id === "T4-20") {
    const odd = code.filter((value, index) => index % 2 === 0).reduce((sum, value) => sum + value, 0);
    const even = code.filter((value, index) => index % 2 === 1).reduce((sum, value) => sum + value, 0);
    return relation(odd, even) === d.comparison;
  }
  if (id === "T4-21") return v.slice(0, -1).reduce((sum, value) => sum + value, 0) % 10 === v.at(-1);
  if (id === "T4-22") {
    const counts = patternFrequencies(v);
    return counts.filter((count) => count === 3).length === 1 && counts.every((count) => count === 1 || count === 3);
  }
  if (id === "T4-23") {
    const left = v[2] + v[0] * v[1];
    const right = v[3] + v[4] * v[5];
    return relation(left, right) === d.comparison;
  }

  const global = analyzeCode(code);
  if (id === "T1-CODE-01") return Number.isInteger(global.largestPrime) && relation(global.largestPrime, v[0]) === d.comparison;
  if (id === "T1-CODE-02") return Number.isInteger(global.smallestEven) && relation(global.smallestEven, v[0]) === d.comparison;
  if (id === "T1-CODE-03") {
    const extremum = v[0] === global.maximum ? "maximum" : v[0] === global.minimum ? "minimum" : "neither";
    return extremum === d.extremum;
  }
  if (id === "T1-CODE-04") return relation(global.median, v[0]) === d.comparison;
  if (id === "T2-CODE-01") {
    const source = d.sourceKey === "smallestEven" ? global.smallestEven : d.sourceKey === "largestPrime" ? global.largestPrime : global.largestOdd;
    if (!Number.isInteger(source)) return false;
    return d.mode === "greaterBoth" ? source > v[0] && source > v[1] : d.mode === "lessBoth" ? source < v[0] && source < v[1] : v[0] < source && source < v[1];
  }
  if (id === "T2-CODE-03") {
    if (!Number.isInteger(global.largestPrime)) return false;
    return d.mode === "bothGreater" ? v[0] > global.largestPrime && v[1] > global.largestPrime : d.mode === "bothSmaller" ? v[0] < global.largestPrime && v[1] < global.largestPrime : v[0] < global.largestPrime && global.largestPrime < v[1];
  }
  if (id === "T2-CODE-04") {
    const extremum = d.extremum === "minimum" ? global.minimum : global.maximum;
    const first = Math.abs(v[0] - extremum);
    const second = Math.abs(v[1] - extremum);
    return first > 0 && first < second;
  }
  if (id === "T3-CODE-01" || id === "T3-CODE-02") {
    const neighbor = id === "T3-CODE-01" ? global.afterFirstPrime : global.beforeLastPrime;
    if (!Number.isInteger(neighbor)) return false;
    const value = code[neighbor];
    return (value % 2 === 0 ? "even" : "odd") === d.parity && relation(value, code[d.targetPosition]) === d.comparison;
  }
  if (id === "T3-CODE-03") {
    const occurrence = d.occurrenceLabel.includes("ersten Vorkommen der kleinsten") ? global.firstMinimum : d.occurrenceLabel.includes("letzten Vorkommen der kleinsten") ? global.lastMinimum : d.occurrenceLabel.includes("ersten Vorkommen der größten") ? global.firstMaximum : global.lastMaximum;
    const neighbor = d.directionLabel === "vor" ? occurrence - 1 : occurrence + 1;
    return neighbor >= 0 && neighbor < code.length && relation(code[neighbor], code[d.targetPosition]) === d.comparison;
  }
  if (id === "T3-CODE-04") return Number.isInteger(global.afterFirstPrime) && Number.isInteger(global.beforeLastPrime) && relation(code[global.afterFirstPrime], code[global.beforeLastPrime]) === d.comparison;
  if (id === "T4-CODE-01") {
    const edgeMaximum = code[0] === global.maximum || code.at(-1) === global.maximum;
    const abovePrimes = !Number.isInteger(global.largestPrime) || code[0] > global.largestPrime && code.at(-1) > global.largestPrime;
    return !edgeMaximum && abovePrimes;
  }
  if (id === "T4-CODE-02") return Number.isInteger(global.afterFirstPrime) && Number.isInteger(global.smallestEven) && Number.isInteger(global.largestOdd) && global.smallestEven < code[global.afterFirstPrime] && code[global.afterFirstPrime] < global.largestOdd;
  if (id === "T4-CODE-03") return Number.isInteger(global.firstPrime) && global.firstPrime > 0 && Number.isInteger(global.lastPrime) && global.lastPrime < code.length - 1 && code[global.firstPrime - 1] + code[global.lastPrime + 1] === code[d.targetPosition];
  if (id === "T4-CODE-04") {
    if (!Number.isInteger(global.firstEven) || !Number.isInteger(global.lastOdd)) return false;
    const values = [code[global.firstEven], code[global.lastOdd], global.median];
    return d.direction === "ascending" ? values[0] < values[1] && values[1] < values[2] : values[0] > values[1] && values[1] > values[2];
  }
  if (id === "T4-CODE-05") return Number.isInteger(global.afterFirstPrime) && code[global.afterFirstPrime] === global.maximum - global.minimum;
  if (id === "T4-CODE-06") return global.minimum < code[0] && code[0] < global.maximum && global.minimum < code.at(-1) && code.at(-1) < global.maximum;
  if (id === "T4-CODE-07") return Number.isInteger(global.smallestEven) && Number.isInteger(global.largestPrime) && global.smallestEven < global.largestPrime && global.largestPrime < code[d.targetPosition];
  if (id === "T5-01") {
    if (!Array.isArray(d.rightVisiblePositions) || d.rightVisiblePositions.some(position =>
      !Number.isInteger(position) || position < 1 || position > code.length)) return false;
    const positions = d.rightVisiblePositions.map((position) => code.length - position);
    return relation(code[positions[0]], code[positions[1]]) === d.comparison;
  }
  if (id === "T5-02") {
    const divisor = v[2];
    return divisor > 1 && v[0] !== v[1] && v[0] % divisor > 0 && v[0] % divisor === v[1] % divisor;
  }
  if (id === "T5-03") {
    const positionsByKey = {
      afterFirstPrime: global.afterFirstPrime,
      beforeLastPrime: global.beforeLastPrime,
      firstEven: global.firstEven,
      lastOdd: global.lastOdd,
      afterFirstMinimum: global.firstMinimum < code.length - 1 ? global.firstMinimum + 1 : null,
      beforeLastMaximum: global.lastMaximum > 0 ? global.lastMaximum - 1 : null,
      medianFirstPosition: global.medianFirst,
    };
    const positions = d.derivationKeys.map((key) => positionsByKey[key]);
    if (positions.some((position) => !Number.isInteger(position))) return false;
    const values = positions.map((position) => code[position]);
    if (d.pattern === "arithmetic") return values[1] - values[0] !== 0 && values[1] - values[0] === values[2] - values[1];
    if (d.pattern === "ascending") return values[0] < values[1] && values[1] < values[2];
    if (d.pattern === "descending") return values[0] > values[1] && values[1] > values[2];
    return d.pattern === "firstThirdEqual" && values[0] === values[2] && values[0] !== values[1];
  }
  if (id === "T5-04") return true;
  return null;
}

module.exports = Object.freeze({visibleHintIsTrue});

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
"prototypes/firebase-lock-attempt/functions/src/selection/chest-start-contract.cjs":function(module,exports,require){
"use strict";
const {createHash} = require("node:crypto");
const selectionPolicy = require("./chest-selection-policy.cjs");
const START_CONTRACT_VERSION = 1;
const STATE_SCHEMA_VERSION = 1;
const ID = /^[A-Za-z0-9_-]{1,64}$/;
const UID = /^[A-Za-z0-9_-]{1,128}$/;
const CHEST_ID = /^personal_[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;

function fail(code) { throw Object.assign(new TypeError(code), {code}); }
function id(value, chest = false) {
  if (typeof value !== "string" || !(chest ? CHEST_ID : ID).test(value) ||
      ["__proto__", "constructor", "prototype"].includes(value)) fail("INVALID_ID");
  return value;
}
function requireUid(value) {
  if (typeof value !== "string" || !UID.test(value)) fail("INVALID_UID");
  return value;
}
function dataCopy(value, depth = 0, ancestors = new Set(), budget = {left: 20000}) {
  if (--budget.left < 0 || depth > 32) fail("DATA_LIMIT");
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value || typeof value !== "object" || ancestors.has(value)) fail("INVALID_DATA");
  const array = Array.isArray(value);
  if (!array && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail("INVALID_DATA");
  ancestors.add(value);
  const result = array ? [] : {};
  const keys = Reflect.ownKeys(value);
  if (array && (!Number.isSafeInteger(value.length) || value.length > 10000 ||
      keys.length !== value.length + 1)) fail("INVALID_DATA");
  for (const key of keys) {
    if (array && key === "length") continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (typeof key !== "string" || ["__proto__", "constructor", "prototype"].includes(key) ||
        !descriptor.enumerable || !Object.hasOwn(descriptor, "value") ||
        array && (!/^(0|[1-9][0-9]*)$/.test(key) || Number(key) >= value.length)) fail("INVALID_DATA");
    result[key] = dataCopy(descriptor.value, depth + 1, ancestors, budget);
  }
  ancestors.delete(value);
  return result;
}
function exact(value, fields) {
  const copy = dataCopy(value);
  if (!copy || Array.isArray(copy) || typeof copy !== "object" ||
      Object.keys(copy).length !== fields.length ||
      Object.keys(copy).some(key => !fields.includes(key))) fail("INVALID_FIELDS");
  return copy;
}
function freeze(value) {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function canonical(value) {
  const copy = dataCopy(value);
  const sort = v => Array.isArray(v) ? v.map(sort) :
    v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sort(v[k])])) : v;
  return JSON.stringify(sort(copy));
}
const digest = value => createHash("sha256").update(canonical(value)).digest("hex");
function selectionInput(value) {
  const fields = {};
  for (const key of selectionPolicy.INPUT_FIELDS) fields[key] = value[key];
  return fields;
}
function requireStartRequest(value) {
  const request = exact(value, ["startContractVersion", "requestId", ...selectionPolicy.INPUT_FIELDS]);
  if (request.startContractVersion !== START_CONTRACT_VERSION) fail("UNSUPPORTED_START_VERSION");
  id(request.requestId);
  const selection = selectionPolicy.requireSelection(selectionInput(request));
  if (selection.modeId !== "PERSONAL") fail("CREW_START_NOT_IMPLEMENTED");
  return freeze({startContractVersion: START_CONTRACT_VERSION,
    requestId: request.requestId, selection});
}
module.exports = Object.freeze({START_CONTRACT_VERSION, STATE_SCHEMA_VERSION,
  fail, id, requireUid, dataCopy, exact, freeze, canonical, digest, selectionInput, requireStartRequest});

},
"prototypes/firebase-lock-attempt/functions/src/selection/personal-chest-runtime.cjs":function(module,exports,require){
"use strict";
// Pure candidate transitions. Only a later atomic adapter may persist them.
// Generator dependency is trusted and must run in a bounded worker when a hard
// wall-clock deadline is required. No partial result or fallback is accepted.
const c = require("./chest-start-contract.cjs");
const selectionPolicy = require("./chest-selection-policy.cjs");
const assignments = require("../hints/personal-hint-assignment.cjs");
const lengths = require("../code-length-contract.cjs");
const ASSIGNMENT_FIELDS = Object.freeze(["assignmentSeedHash", "generatorVersion",
  "codeLength", "packageCount", "profileId", "packageRewardFactor",
  "tier5UnlockedAtAssignment", "assignedHints", "t504Fairness",
  "assignmentPolicyVersion", "requestedTierCounts", "actualTierCounts"]);

function revision(value) {
  if (!Number.isSafeInteger(value) || value < 0) c.fail("INVALID_REVISION");
  return value;
}
function increment(value) {
  revision(value);
  if (value === Number.MAX_SAFE_INTEGER) c.fail("REVISION_OVERFLOW");
  return value + 1;
}
function requireMaterial(value, selection) {
  const material = c.exact(value, ["chestId", "solutionCode", "assignmentSalt"]);
  c.id(material.chestId, true);
  lengths.requireCode(material.solutionCode, selection.generatorVersion, selection.codeLength);
  if (typeof material.assignmentSalt !== "string" || !/^[a-f0-9]{64}$/.test(material.assignmentSalt)) c.fail("INVALID_PRIVATE_SALT");
  return material;
}
function generationInput(uid, chestId, selection, material) {
  return {uid, chestId, solutionCode: material.solutionCode,
    assignmentSalt: material.assignmentSalt, generatorVersion: selection.generatorVersion,
    codeLength: selection.codeLength, profileId: selection.profileId, packageCount: selection.packageCount};
}
function baseAssignment(stored) {
  const value = {};
  for (const key of ASSIGNMENT_FIELDS) value[key] = stored[key];
  return value;
}
function requireAssignment(assignment, uid, chestId, selection, material) {
  assignments.requireStoredAssignment(assignment);
  if (assignment.generatorVersion !== selection.generatorVersion ||
      assignment.assignmentPolicyVersion !== selection.hintPolicyVersion ||
      assignment.codeLength !== selection.codeLength || assignment.profileId !== selection.profileId ||
      assignment.packageCount !== selection.packageCount ||
      assignment.packageRewardFactor !== selection.factors.packageCount ||
      assignment.assignmentSeedHash !== assignments.deriveAssignmentSeedHash(
        generationInput(uid, chestId, selection, material))) c.fail("ASSIGNMENT_BINDING_MISMATCH");
}
function requireState(value, uid) {
  c.requireUid(uid);
  const state = c.exact(value, ["schemaVersion", "uid", "revision", "activeChestId", "chests", "operations"]);
  if (state.schemaVersion !== c.STATE_SCHEMA_VERSION || state.uid !== uid) c.fail("STATE_OWNER_OR_VERSION_MISMATCH");
  revision(state.revision);
  for (const field of ["chests", "operations"]) {
    if (!state[field] || typeof state[field] !== "object" || Array.isArray(state[field])) c.fail("INVALID_STATE_MAP");
  }
  const active = [];
  for (const [chestId, value] of Object.entries(state.chests)) {
    c.id(chestId, true);
    const record = c.exact(value, ["chestId", "selection", "material", "assignment",
      "generationContextHash", "assignmentDigest", "status", "closure"]);
    const selected = selectionPolicy.requireSelection(c.selectionInput(record.selection));
    if (selected.modeId !== "PERSONAL" || c.canonical(selected) !== c.canonical(record.selection) ||
        record.chestId !== chestId) c.fail("CHEST_SELECTION_MISMATCH");
    const material = requireMaterial({...record.material, chestId}, selected);
    c.exact(record.material, ["solutionCode", "assignmentSalt"]);
    const stored = c.exact(record.assignment, ["chestId", "revision", "purchasedPackageCount", ...ASSIGNMENT_FIELDS]);
    if (stored.chestId !== chestId) c.fail("ASSIGNMENT_ID_MISMATCH");
    revision(stored.revision);
    requireAssignment(stored, uid, chestId, selected, material);
    assignments.requirePurchasedPackageCount(stored.purchasedPackageCount, stored);
    if (record.generationContextHash !== c.digest(generationInput(uid, chestId, selected, material)) ||
        record.assignmentDigest !== c.digest(baseAssignment(stored))) c.fail("PRIVATE_OR_ASSIGNMENT_DIGEST_MISMATCH");
    if (record.status === "ACTIVE") {
      if (record.closure !== null) c.fail("INVALID_ACTIVE_CLOSURE");
      active.push(chestId);
    } else if (record.status === "CLOSED") {
      const close = c.exact(record.closure, ["endContractVersion", "requestId", "confirmedRevision"]);
      if (close.endContractVersion !== 1 || revision(close.confirmedRevision) < 1 ||
          close.confirmedRevision > state.revision) c.fail("INVALID_END_CONFIRMATION");
      c.id(close.requestId);
    } else c.fail("INVALID_CHEST_STATUS");
  }
  if (active.length > 1 || state.activeChestId !== (active[0] || null)) c.fail("INVALID_ACTIVE_REFERENCE");
  for (const [requestId, value] of Object.entries(state.operations)) {
    c.id(requestId);
    const op = c.exact(value, ["kind", "fingerprint", "chestId", "committedRevision"]);
    c.id(op.chestId, true);
    if (!["START", "END"].includes(op.kind) || typeof op.fingerprint !== "string" ||
        !Object.hasOwn(state.chests, op.chestId) || revision(op.committedRevision) < 1 ||
        op.committedRevision > state.revision) c.fail("INVALID_OPERATION");
    const record = state.chests[op.chestId];
    const expected = op.kind === "START" ? startFingerprint(record.selection) :
      endFingerprint(op.chestId, op.committedRevision - 1);
    if (op.fingerprint !== expected || op.kind === "END" &&
        (record.status !== "CLOSED" || record.closure.requestId !== requestId ||
          record.closure.confirmedRevision !== op.committedRevision)) c.fail("OPERATION_BINDING_MISMATCH");
  }
  for (const record of Object.values(state.chests)) {
    const starts = Object.values(state.operations).filter(op => op.kind === "START" && op.chestId === record.chestId);
    if (starts.length !== 1) c.fail("MISSING_LIFECYCLE_OPERATION");
    if (record.status === "CLOSED") {
      const endOp = Object.hasOwn(state.operations, record.closure.requestId) ?
        state.operations[record.closure.requestId] : null;
      if (!endOp || endOp.kind !== "END" || endOp.chestId !== record.chestId ||
          endOp.committedRevision !== record.closure.confirmedRevision ||
          endOp.committedRevision <= starts[0].committedRevision) c.fail("MISSING_LIFECYCLE_OPERATION");
    }
  }
  return c.freeze(state);
}
function initialState(uid) {
  c.requireUid(uid);
  return c.freeze({schemaVersion: c.STATE_SCHEMA_VERSION, uid, revision: 0,
    activeChestId: null, chests: {}, operations: {}});
}
function startFingerprint(selection) {
  return c.canonical({kind: "START", startContractVersion: c.START_CONTRACT_VERSION,
    selection: c.selectionInput(selection)});
}
function endFingerprint(chestId, expectedRevision) {
  return c.canonical({kind: "END", endContractVersion: 1, chestId, expectedRevision});
}
function projectChest(record) {
  if (!record) return null;
  const hintState = assignments.clientHintState(record.assignment);
  const result = {chestId: record.chestId, status: record.status,
    selection: record.selection, hintState};
  if (assignments.containsInternalClientFields(result)) c.fail("PRIVATE_PUBLIC_RESPONSE");
  return result;
}
function response(state, record, replayed) {
  return c.freeze(c.dataCopy({startContractVersion: c.START_CONTRACT_VERSION,
    uid: state.uid, revision: state.revision, activeChestId: state.activeChestId,
    replayed, chest: projectChest(record)}));
}
function candidate(before, next, record, replayed, changed) {
  return c.freeze({uid: before.uid, expectedRevision: before.revision,
    expectedStateDigest: c.digest(before), changed,
    nextState: next, response: response(next, record, replayed)});
}
function publicState({state, uid}) {
  const trusted = requireState(state, uid);
  return response(trusted, trusted.activeChestId ? trusted.chests[trusted.activeChestId] : null, false);
}
function defaultGenerate({assignmentInput, generationContextHash}) {
  return {status: "COMPLETE", generationContextHash,
    assignment: assignments.createRankedAssignment(assignmentInput)};
}
function createRuntime({generateAssignment = defaultGenerate} = {}) {
  if (typeof generateAssignment !== "function") c.fail("INVALID_GENERATOR_ADAPTER");
  async function prepareStart({state, uid, request, privateMaterial}) {
    const before = requireState(state, uid);
    const trustedRequest = c.requireStartRequest(request);
    const fingerprint = startFingerprint(trustedRequest.selection);
    const previous = Object.hasOwn(before.operations, trustedRequest.requestId) ?
      before.operations[trustedRequest.requestId] : null;
    if (previous) {
      if (previous.kind !== "START" || previous.fingerprint !== fingerprint) c.fail("REQUEST_REUSED");
      return candidate(before, before, before.chests[previous.chestId], true, false);
    }
    if (before.activeChestId) c.fail("ACTIVE_CHEST_EXISTS");
    const nextRevision = increment(before.revision);
    const material = requireMaterial(privateMaterial, trustedRequest.selection);
    if (Object.hasOwn(before.chests, material.chestId)) c.fail("CHEST_ID_REUSED");
    const input = c.freeze(generationInput(uid, material.chestId, trustedRequest.selection, material));
    const generationContextHash = c.digest(input);
    const generated = await generateAssignment(c.freeze({assignmentInput: input, generationContextHash}));
    const envelope = c.exact(generated, ["status", "generationContextHash", "assignment"]);
    if (envelope.status !== "COMPLETE" || envelope.generationContextHash !== generationContextHash) c.fail("GENERATION_NOT_COMPLETE_OR_MISBOUND");
    const assignment = c.exact(envelope.assignment, ASSIGNMENT_FIELDS);
    requireAssignment(assignment, uid, material.chestId, trustedRequest.selection, material);
    const record = {chestId: material.chestId, selection: trustedRequest.selection,
      material: {solutionCode: material.solutionCode, assignmentSalt: material.assignmentSalt},
      assignment: {chestId: material.chestId, revision: 0, purchasedPackageCount: 0, ...assignment},
      generationContextHash, assignmentDigest: c.digest(assignment), status: "ACTIVE", closure: null};
    const next = c.dataCopy(before);
    next.revision = nextRevision; next.activeChestId = material.chestId;
    next.chests[material.chestId] = record;
    next.operations[trustedRequest.requestId] = {kind: "START", fingerprint,
      chestId: material.chestId, committedRevision: nextRevision};
    const validated = requireState(next, uid);
    return candidate(before, validated, validated.chests[material.chestId], false, true);
  }
  // Trusted adapter boundary after verifying an end, not a player's claim.
  // C2B must commit this candidate atomically with its attempt/end operation.
  // No reward/cost ledger exists here.
  function prepareConfirmedEnd({state, uid, confirmation}) {
    const before = requireState(state, uid);
    const end = c.exact(confirmation, ["endContractVersion", "requestId", "chestId", "expectedRevision"]);
    if (end.endContractVersion !== 1) c.fail("UNSUPPORTED_END_VERSION");
    c.id(end.requestId); c.id(end.chestId, true); revision(end.expectedRevision);
    const fingerprint = endFingerprint(end.chestId, end.expectedRevision);
    const previous = Object.hasOwn(before.operations, end.requestId) ?
      before.operations[end.requestId] : null;
    if (previous) {
      if (previous.kind !== "END" || previous.fingerprint !== fingerprint) c.fail("REQUEST_REUSED");
      return candidate(before, before, before.chests[previous.chestId], true, false);
    }
    if (before.revision !== end.expectedRevision || before.activeChestId !== end.chestId) c.fail("STALE_END_CONFIRMATION");
    const next = c.dataCopy(before);
    next.revision = increment(before.revision); next.activeChestId = null;
    next.chests[end.chestId].status = "CLOSED";
    next.chests[end.chestId].closure = {endContractVersion: 1, requestId: end.requestId,
      confirmedRevision: next.revision};
    next.operations[end.requestId] = {kind: "END", fingerprint, chestId: end.chestId,
      committedRevision: next.revision};
    const validated = requireState(next, uid);
    return candidate(before, validated, validated.chests[end.chestId], false, true);
  }
  return Object.freeze({prepareStart, prepareConfirmedEnd});
}
module.exports = Object.freeze({initialState, requireState, publicState, createRuntime});

},
"prototypes/firebase-lock-attempt/functions/src/selection/personal-chest-working-set.cjs":function(module,exports,require){
"use strict";
// B1: explicitly versioned, bounded working set over individually addressed
// records. The C2A aggregate is used ONLY as a temporary validation/transition
// projection; it is never written as a persistent whole-history snapshot.
const c = require("./chest-start-contract.cjs");
const core = require("./personal-chest-runtime.cjs");
const WORKING_SET_VERSION = 2;
const DELTA_VERSION = 1;
const LOOKUP_VERSION = 1;
const DOCUMENT_VERSION = 2;
const MAX_READ_SET = 7;
const MAX_WRITES = 4;
const KINDS = ["HEAD", "CHEST", "ARCHIVE", "REQUEST"];
function ref(uid, kind, id) {
  c.requireUid(uid);
  if (!KINDS.includes(kind)) c.fail("INVALID_DOCUMENT_KIND");
  if (kind === "HEAD" ? id !== "current" : kind === "REQUEST" ?
    !c.id(id) : !c.id(id, true)) c.fail("INVALID_DOCUMENT_ID");
  return c.freeze({uid, kind, id});
}
const key = reference => c.canonical(reference);
function revision(value) {
  if (!Number.isSafeInteger(value) || value < 0) c.fail("INVALID_DOCUMENT_REVISION");
  return value;
}
function document(reference, rev, data) {
  return c.freeze(c.dataCopy({documentVersion: DOCUMENT_VERSION, ...reference,
    revision: revision(rev), data}));
}
function validateDocument(value, reference) {
  const doc = c.exact(value, ["documentVersion", "uid", "kind", "id", "revision", "data"]);
  if (doc.documentVersion !== DOCUMENT_VERSION ||
      ["uid", "kind", "id"].some(field => doc[field] !== reference[field])) c.fail("DOCUMENT_BINDING_MISMATCH");
  revision(doc.revision);
  if (doc.kind !== "HEAD" && doc.revision < 1) c.fail("INVALID_DOCUMENT_REVISION");
  if (doc.kind === "REQUEST" || doc.kind === "ARCHIVE") {
    if (doc.revision !== 1) c.fail("IMMUTABLE_DOCUMENT_REVISION");
  }
  if (doc.kind === "HEAD") {
    c.exact(doc.data, ["activeChestId"]);
    if (doc.data.activeChestId !== null) c.id(doc.data.activeChestId, true);
  }
  return c.freeze(doc);
}
function payloadFromState(state, chestId) {
  const record = state.chests[chestId];
  const starts = Object.entries(state.operations).filter(([, op]) =>
    op.kind === "START" && op.chestId === chestId);
  if (starts.length !== 1) c.fail("MISSING_START_ANCHOR");
  const end = record.status === "CLOSED" ? {
    requestId: record.closure.requestId, operation: state.operations[record.closure.requestId],
  } : null;
  return c.freeze(c.dataCopy({record,
    start: {requestId: starts[0][0], operation: starts[0][1]}, end}));
}
function createRuntime({readDocument, generateAssignment} = {}) {
  if (typeof readDocument !== "function") c.fail("INVALID_READ_PORT");
  const engine = core.createRuntime({generateAssignment});
  function session(uid) {
    c.requireUid(uid);
    const reads = new Map(), chests = new Map();
    async function get(reference) {
      const id = key(reference);
      if (reads.has(id)) return reads.get(id);
      if (reads.size >= MAX_READ_SET) c.fail("WORKING_SET_LIMIT");
      const lookup = c.dataCopy(await readDocument(reference));
      if (!lookup || lookup.lookupVersion !== LOOKUP_VERSION) c.fail("INVALID_LOOKUP");
      let doc = null;
      if (lookup.status === "ABSENT") c.exact(lookup, ["lookupVersion", "status"]);
      else if (lookup.status === "PRESENT") {
        c.exact(lookup, ["lookupVersion", "status", "document"]);
        doc = validateDocument(lookup.document, reference);
      } else c.fail("LOOKUP_NOT_COMPLETE");
      const found = {reference, doc};
      reads.set(id, found);
      return found;
    }
    async function required(reference) {
      const result = await get(reference);
      if (!result.doc) c.fail("MISSING_REFERENCED_DOCUMENT");
      return result.doc;
    }
    async function loadChest(chestId) {
      if (chests.has(chestId)) return chests.get(chestId);
      const doc = await required(ref(uid, "CHEST", chestId));
      const payload = c.exact(doc.data, ["record", "start", "end"]);
      if (payload.record.chestId !== chestId ||
          !["ACTIVE", "CLOSED"].includes(payload.record.status)) c.fail("CHEST_REFERENCE_MISMATCH");
      for (const anchor of [payload.start, ...(payload.end ? [payload.end] : [])]) {
        c.exact(anchor, ["requestId", "operation"]); c.id(anchor.requestId);
        const index = await required(ref(uid, "REQUEST", anchor.requestId));
        if (c.canonical(index.data) !== c.canonical(anchor.operation)) c.fail("REQUEST_ANCHOR_MISMATCH");
      }
      if (payload.record.status === "CLOSED") {
        if (!payload.end) c.fail("MISSING_END_ANCHOR");
        const archive = await required(ref(uid, "ARCHIVE", chestId));
        if (c.canonical(archive.data) !== c.canonical(payload)) c.fail("ARCHIVE_BINDING_MISMATCH");
      } else if (payload.end !== null) c.fail("INVALID_ACTIVE_END_ANCHOR");
      chests.set(chestId, {doc, payload});
      return chests.get(chestId);
    }
    let head;
    async function initialize(requestId) {
      const observed = await get(ref(uid, "HEAD", "current"));
      head = observed.doc || document(ref(uid, "HEAD", "current"), 0, {activeChestId: null});
      if (head.data.activeChestId !== null) {
        const active = await loadChest(head.data.activeChestId);
        if (active.payload.record.status !== "ACTIVE") c.fail("HEAD_NOT_ACTIVE");
      }
      const operation = await get(ref(uid, "REQUEST", requestId));
      if (operation.doc) {
        c.exact(operation.doc.data, ["kind", "fingerprint", "chestId", "committedRevision"]);
        c.id(operation.doc.data.chestId, true);
        const target = await loadChest(operation.doc.data.chestId);
        const anchor = operation.doc.data.kind === "START" ? target.payload.start :
          operation.doc.data.kind === "END" ? target.payload.end : null;
        if (!anchor || anchor.requestId !== requestId ||
            c.canonical(anchor.operation) !== c.canonical(operation.doc.data)) c.fail("REQUEST_TARGET_MISMATCH");
      }
      const state = {schemaVersion: 1, uid, revision: head.revision,
        activeChestId: head.data.activeChestId, chests: {}, operations: {}};
      for (const [id, item] of chests) {
        state.chests[id] = item.payload.record;
        for (const anchor of [item.payload.start, ...(item.payload.end ? [item.payload.end] : [])]) {
          if (Object.hasOwn(state.operations, anchor.requestId) &&
              c.canonical(state.operations[anchor.requestId]) !== c.canonical(anchor.operation)) c.fail("ANCHOR_ID_CONFLICT");
          state.operations[anchor.requestId] = anchor.operation;
        }
      }
      return core.requireState(state, uid);
    }
    function candidate(plan, transition, changedId, requestId) {
      const writes = [];
      if (plan.changed) {
        const next = plan.nextState;
        const headRef = ref(uid, "HEAD", "current");
        const oldHead = reads.get(key(headRef)).doc;
        writes.push({operation: oldHead ? "REPLACE" : "INSERT", ref: headRef,
          document: document(headRef, next.revision, {activeChestId: next.activeChestId})});
        const chestRef = ref(uid, "CHEST", changedId), oldChest = reads.get(key(chestRef)).doc;
        const payload = payloadFromState(next, changedId);
        if (oldChest && oldChest.revision === Number.MAX_SAFE_INTEGER) c.fail("DOCUMENT_REVISION_OVERFLOW");
        writes.push({operation: oldChest ? "REPLACE" : "INSERT", ref: chestRef,
          document: document(chestRef, oldChest ? oldChest.revision + 1 : 1, payload)});
        if (transition === "END") {
          const archiveRef = ref(uid, "ARCHIVE", changedId);
          writes.push({operation: "INSERT", ref: archiveRef,
            document: document(archiveRef, 1, payload)});
        }
        const operationRef = ref(uid, "REQUEST", requestId);
        writes.push({operation: "INSERT", ref: operationRef,
          document: document(operationRef, 1, next.operations[requestId])});
      }
      if (writes.length > MAX_WRITES) c.fail("DELTA_LIMIT");
      const readSet = [...reads.values()].map(item => ({
        ref: item.reference, expected: item.doc ? {exists: true,
          documentVersion: DOCUMENT_VERSION, revision: item.doc.revision,
          sha256: c.digest(item.doc)} : {exists: false},
      }));
      for (const write of writes) {
        const observed = reads.get(key(write.ref));
        if (!observed || (write.operation === "INSERT") !== (observed.doc === null)) c.fail("WRITE_WITHOUT_MATCHING_READ");
      }
      const delta = {deltaVersion: DELTA_VERSION, uid, readSet, writes};
      return c.freeze(c.dataCopy({workingSetVersion: WORKING_SET_VERSION, ...delta,
        deltaDigest: c.digest(delta), confirmationRequired: true,
        resultingHeadRevision: plan.nextState.revision,
        preparedResponse: {workingSetVersion: WORKING_SET_VERSION,
          committed: false, ...plan.response}}));
    }
    return {get, initialize, candidate, ref: (kind, id) => ref(uid, kind, id)};
  }
  async function prepareStart({uid, request, privateMaterial}) {
    const trusted = c.requireStartRequest(request);
    const requestSnapshot = c.freeze({startContractVersion: trusted.startContractVersion,
      requestId: trusted.requestId, ...c.selectionInput(trusted.selection)});
    const materialSnapshot = privateMaterial === undefined ? undefined :
      c.freeze(c.dataCopy(privateMaterial));
    const work = session(uid), state = await work.initialize(trusted.requestId);
    let material;
    if (!Object.hasOwn(state.operations, trusted.requestId) && state.activeChestId === null) {
      material = c.exact(materialSnapshot, ["chestId", "solutionCode", "assignmentSalt"]);
      c.id(material.chestId, true);
      for (const kind of ["CHEST", "ARCHIVE"]) {
        if ((await work.get(work.ref(kind, material.chestId))).doc) c.fail("CHEST_ID_REUSED");
      }
    }
    const plan = await engine.prepareStart({state, uid, request: requestSnapshot, privateMaterial: material});
    return work.candidate(plan, "START", plan.response.chest.chestId, trusted.requestId);
  }
  async function prepareConfirmedEnd({uid, confirmation}) {
    const end = c.exact(confirmation, ["endContractVersion", "requestId", "chestId", "expectedRevision"]);
    c.id(end.requestId); c.id(end.chestId, true);
    const work = session(uid), state = await work.initialize(end.requestId);
    if (!Object.hasOwn(state.operations, end.requestId) && state.activeChestId === end.chestId) {
      if ((await work.get(work.ref("ARCHIVE", end.chestId))).doc) c.fail("ARCHIVE_ALREADY_EXISTS");
    }
    const plan = engine.prepareConfirmedEnd({state, uid, confirmation: end});
    return work.candidate(plan, "END", end.chestId, end.requestId);
  }
  return Object.freeze({prepareStart, prepareConfirmedEnd});
}
// Trusted adapter receipt ONLY. This is not proof against an untrusted browser
// or a client-callable acceptance endpoint. Read-set verification is required
// even for a replay with zero writes.
function acknowledgeCommit(candidate, receipt) {
  const ack = c.exact(receipt, ["receiptVersion", "status", "uid", "deltaDigest", "headRevision"]);
  if (ack.receiptVersion !== 1 || ack.status !== "COMMITTED" ||
      candidate.workingSetVersion !== WORKING_SET_VERSION || candidate.deltaVersion !== DELTA_VERSION ||
      ack.uid !== candidate.uid || ack.deltaDigest !== candidate.deltaDigest ||
      ack.headRevision !== candidate.resultingHeadRevision ||
      c.digest({deltaVersion: candidate.deltaVersion, uid: candidate.uid,
        readSet: candidate.readSet, writes: candidate.writes}) !== candidate.deltaDigest) c.fail("COMMIT_RECEIPT_MISMATCH");
  return c.freeze(c.dataCopy({...candidate.preparedResponse, committed: true}));
}
module.exports = Object.freeze({WORKING_SET_VERSION, DELTA_VERSION,
  LOOKUP_VERSION, DOCUMENT_VERSION, MAX_READ_SET, MAX_WRITES, createRuntime, acknowledgeCommit});


},
"prototypes/firebase-lock-attempt/functions/src/statistics/player-statistics.cjs":function(module,exports,require){
"use strict";

const SCHEMA_VERSION = 1;
const MAX_COUNT = Number.MAX_SAFE_INTEGER;

function count(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TypeError(`${label} ist ungültig.`);
  }
  return value;
}

function add(value, increment, label) {
  count(increment, label);
  if (value > MAX_COUNT - increment) throw new TypeError(`${label} läuft über.`);
  return value + increment;
}

function rankFor(firstSolveCount) {
  count(firstSolveCount, "firstSolveCount");
  if (firstSolveCount <= 2) return "LANDRATTE";
  if (firstSolveCount <= 6) return "FREIBEUTER";
  if (firstSolveCount <= 14) return "SEEBAER";
  if (firstSolveCount <= 30) return "SCHATZJAEGER";
  return "MEISTERNAVIGATOR";
}

function empty() {
  return {schemaVersion: SCHEMA_VERSION, firstSolveCount: 0,
    cookiesConsumed: 0, lockpicksConsumed: 0};
}

function validate(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      value.schemaVersion !== SCHEMA_VERSION) {
    throw new TypeError("Statistikschema ist ungültig.");
  }
  return {schemaVersion: SCHEMA_VERSION,
    firstSolveCount: count(value.firstSolveCount, "firstSolveCount"),
    cookiesConsumed: count(value.cookiesConsumed, "cookiesConsumed"),
    lockpicksConsumed: count(value.lockpicksConsumed, "lockpicksConsumed")};
}

function increment(value, {wins = 0, cookies = 0, lockpicks = 0}) {
  const current = validate(value);
  return {...current,
    firstSolveCount: add(current.firstSolveCount, wins, "firstSolveCount"),
    cookiesConsumed: add(current.cookiesConsumed, cookies, "cookiesConsumed"),
    lockpicksConsumed: add(current.lockpicksConsumed, lockpicks, "lockpicksConsumed")};
}

function clientResult(value) {
  const current = validate(value);
  return Object.freeze({available: true, schemaVersion: current.schemaVersion,
    firstSolveCount: current.firstSolveCount,
    cookiesConsumed: current.cookiesConsumed,
    lockpicksConsumed: current.lockpicksConsumed,
    rankId: rankFor(current.firstSolveCount)});
}

// Eine alte Gewinnerurkunde ist die einzige historische Quelle für einen
// globalen Erstgewinn. Ein solved-Flag oder ein erfolgreicher Übungsversuch
// reicht ausdrücklich nicht aus.
function reconstruct({uid, winners, ledger, operations}) {
  let result = empty();
  const operationById = new Map();
  for (const entry of operations) {
    if (!entry || entry.documentId !== entry.requestId ||
        typeof entry.requestId !== "string" || !entry.requestId ||
        operationById.has(entry.requestId)) {
      throw new TypeError("Historischer Operationsbeleg ist widersprüchlich.");
    }
    operationById.set(entry.requestId, entry);
  }
  const winnerChestIds = new Set();
  const winnerRequestByChest = new Map();
  for (const entry of winners) {
    if (!entry || entry.winnerUid !== uid || entry.documentId !== entry.chestId ||
        typeof entry.chestId !== "string" ||
        !entry.chestId || winnerChestIds.has(entry.chestId) ||
        typeof entry.requestId !== "string" || !entry.requestId ||
        !Number.isSafeInteger(entry.closedRotation) || entry.closedRotation < 1) {
      throw new TypeError("Historischer Gewinnerbeleg ist widersprüchlich.");
    }
    const operation = operationById.get(entry.requestId);
    if (!operation || operation.action !== "attemptChest" ||
        operation.status !== "completed" || operation.chestId !== entry.chestId ||
        operation.result?.success !== true || operation.result?.winner !== true) {
      throw new TypeError("Gewinnerbeleg besitzt keinen passenden Schlossvorgang.");
    }
    winnerChestIds.add(entry.chestId);
    winnerRequestByChest.set(entry.chestId, entry.requestId);
    result = increment(result, {wins: 1});
  }
  const ledgerByRequest = new Map();
  for (const entry of ledger) {
    if (!entry || entry.documentId !== entry.requestId ||
        typeof entry.requestId !== "string" || !entry.requestId ||
        ledgerByRequest.has(entry.requestId)) {
      throw new TypeError("Historischer Ledgerbeleg ist widersprüchlich.");
    }
    ledgerByRequest.set(entry.requestId, entry);
    const operation = operationById.get(entry.requestId);
    if (entry.reason === "hint_package_purchase") {
      if (entry.resourceDeltas?.cookies !== -1 ||
          operation?.action !== "buyNextHintPackage" ||
          operation.status !== "completed" ||
          typeof entry.chestId !== "string" || !entry.chestId ||
          !Number.isSafeInteger(entry.packageNumber) ||
          entry.packageNumber < 1 || entry.packageNumber > 5 ||
          operation.chestId !== entry.chestId ||
          operation.packageNumber !== entry.packageNumber) {
        throw new TypeError("Keksbeleg ist ungültig.");
      }
      result = increment(result, {cookies: 1});
    } else if (["failed_chest_attempt", "winning_chest_attempt"].includes(entry.reason)) {
      if (entry.resourceType !== "lockpick" || entry.quantity !== 1 ||
          operation?.action !== "attemptChest" ||
          typeof entry.chestId !== "string" || !entry.chestId ||
          operation.status !== "completed" || operation.chestId !== entry.chestId ||
          operation.result?.success !== (entry.reason === "winning_chest_attempt")) {
        throw new TypeError("Dietrichbeleg ist ungültig.");
      }
      // Beim Gewinn enthält resourceDeltas bereits die Belohnung. Nur die
      // dokumentierte Brutto-Verbrauchsmenge zählt.
      if (entry.reason === "failed_chest_attempt" &&
          entry.resourceDeltas?.lockpicks !== -1) {
        throw new TypeError("Fehlversuchsbeleg ist ungültig.");
      }
      if (entry.reason === "winning_chest_attempt" &&
          (!winnerChestIds.has(entry.chestId) ||
           winnerRequestByChest.get(entry.chestId) !== entry.requestId ||
           operation.result?.lockpickCost !== 1)) {
        throw new TypeError("Gewinnverbrauch ist nicht belegt.");
      }
      result = increment(result, {lockpicks: 1});
    }
    // L&L-036_TEST_COOKIE_CONSUME ist ein isolierter Wallet-Test, kein
    // Hinweiskauf und kein Spielverbrauch für das Tagebuch.
  }
  for (const entry of operations) {
    if (entry.status !== "completed") continue;
    const matchingLedger = ledgerByRequest.get(entry.requestId);
    if (entry.action === "buyNextHintPackage" &&
        matchingLedger?.reason !== "hint_package_purchase") {
      throw new TypeError("Abgebuchter Hinweiskauf hat keinen passenden Ledgerbeleg.");
    }
    if (entry.action === "attemptChest" && matchingLedger &&
        matchingLedger.reason !== (entry.result?.success && entry.result?.winner ?
          "winning_chest_attempt" : "failed_chest_attempt")) {
      throw new TypeError("Schlossversuch hat einen widersprüchlichen Ledgerbeleg.");
    }
    if (entry.action === "attemptChest" && !matchingLedger) {
      const legacy = entry.result;
      if (typeof entry.chestId !== "string" || !entry.chestId ||
          typeof legacy?.success !== "boolean" ||
          legacy.chestId !== entry.chestId || legacy.winner !== undefined ||
          legacy.lockpickCost !== undefined ||
          !Number.isSafeInteger(legacy.attempts) || legacy.attempts < 1 ||
          !Number.isSafeInteger(legacy.lockpicksRemaining) ||
          legacy.lockpicksRemaining < 0 ||
          !Number.isSafeInteger(legacy.walletRevision) ||
          legacy.walletRevision < 1 ||
          !Number.isSafeInteger(legacy.chestRevision) ||
          legacy.chestRevision < 1 ||
          typeof entry.requestFingerprint !== "string" ||
          !/^[a-f0-9]{64}$/.test(entry.requestFingerprint)) {
        throw new TypeError("Schlossversuch ohne Ledgerbeleg ist ungültig.");
      }
      // Der ältere, nicht an die Kistenökonomie gebundene Testweg buchte
      // genau einen Dietrich, schrieb aber noch keinen Ledgerbeleg.
      result = increment(result, {lockpicks: 1});
    }
  }
  for (const entry of winners) {
    if (ledgerByRequest.get(entry.requestId)?.reason !== "winning_chest_attempt") {
      throw new TypeError("Gewinnerbeleg besitzt keinen passenden Verbrauchsbeleg.");
    }
  }
  return result;
}

module.exports = Object.freeze({SCHEMA_VERSION, clientResult, empty, increment,
  rankFor, reconstruct, validate});

}
};
const mappings={"prototypes/firebase-lock-attempt/functions/src/code-length-contract.cjs":{},"prototypes/firebase-lock-attempt/functions/src/hints/beginner-information.cjs":{"./visible-hint-truth.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/visible-hint-truth.cjs"},"prototypes/firebase-lock-attempt/functions/src/hints/extended-hint-generator.cjs":{"node:crypto":"node:crypto","./gdevelop-generator-core-v3.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/gdevelop-generator-core-v3.cjs","./beginner-information.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/beginner-information.cjs","./hint-distinctness.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/hint-distinctness.cjs","./hint-localization.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/hint-localization.cjs","./package-count-policy.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/package-count-policy.cjs","./ranked-hint-generator.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/ranked-hint-generator.cjs","./v4-package-information.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/v4-package-information.cjs","./v4-package-repair.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/v4-package-repair.cjs","./v4-coverage-truth.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/v4-coverage-truth.cjs"},"prototypes/firebase-lock-attempt/functions/src/hints/gdevelop-generator-core-v2.cjs":{},"prototypes/firebase-lock-attempt/functions/src/hints/gdevelop-generator-core-v3.cjs":{},"prototypes/firebase-lock-attempt/functions/src/hints/gdevelop-generator-core.cjs":{},"prototypes/firebase-lock-attempt/functions/src/hints/hint-distinctness.cjs":{"./visible-hint-truth.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/visible-hint-truth.cjs"},"prototypes/firebase-lock-attempt/functions/src/hints/hint-localization.cjs":{},"prototypes/firebase-lock-attempt/functions/src/hints/package-count-policy.cjs":{"node:crypto":"node:crypto"},"prototypes/firebase-lock-attempt/functions/src/hints/personal-hint-assignment.cjs":{"node:crypto":"node:crypto","./gdevelop-generator-core.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/gdevelop-generator-core.cjs","./gdevelop-generator-core-v2.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/gdevelop-generator-core-v2.cjs","./gdevelop-generator-core-v3.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/gdevelop-generator-core-v3.cjs","./extended-hint-generator.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/extended-hint-generator.cjs","./package-count-policy.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/package-count-policy.cjs","../code-length-contract.cjs":"prototypes/firebase-lock-attempt/functions/src/code-length-contract.cjs","./hint-localization.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/hint-localization.cjs","./ranked-hint-generator.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/ranked-hint-generator.cjs","./rank-tier-policy.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/rank-tier-policy.cjs","../statistics/player-statistics.cjs":"prototypes/firebase-lock-attempt/functions/src/statistics/player-statistics.cjs"},"prototypes/firebase-lock-attempt/functions/src/hints/rank-tier-policy.cjs":{"node:crypto":"node:crypto","../statistics/player-statistics.cjs":"prototypes/firebase-lock-attempt/functions/src/statistics/player-statistics.cjs"},"prototypes/firebase-lock-attempt/functions/src/hints/ranked-hint-generator.cjs":{"node:crypto":"node:crypto","./gdevelop-generator-core.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/gdevelop-generator-core.cjs","./gdevelop-generator-core-v2.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/gdevelop-generator-core-v2.cjs","./gdevelop-generator-core-v3.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/gdevelop-generator-core-v3.cjs","./hint-localization.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/hint-localization.cjs","./beginner-information.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/beginner-information.cjs","./hint-distinctness.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/hint-distinctness.cjs","./rank-tier-policy.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/rank-tier-policy.cjs","../statistics/player-statistics.cjs":"prototypes/firebase-lock-attempt/functions/src/statistics/player-statistics.cjs"},"prototypes/firebase-lock-attempt/functions/src/hints/v4-coverage-truth.cjs":{"./visible-hint-truth.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/visible-hint-truth.cjs"},"prototypes/firebase-lock-attempt/functions/src/hints/v4-logical-witness.cjs":{"./v4-coverage-truth.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/v4-coverage-truth.cjs"},"prototypes/firebase-lock-attempt/functions/src/hints/v4-package-information.cjs":{"./v4-coverage-truth.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/v4-coverage-truth.cjs"},"prototypes/firebase-lock-attempt/functions/src/hints/v4-package-repair.cjs":{"node:assert/strict":"node:assert/strict","./v4-logical-witness.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/v4-logical-witness.cjs","./v4-coverage-truth.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/v4-coverage-truth.cjs","./visible-hint-truth.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/visible-hint-truth.cjs","./hint-distinctness.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/hint-distinctness.cjs"},"prototypes/firebase-lock-attempt/functions/src/hints/visible-hint-truth.cjs":{},"prototypes/firebase-lock-attempt/functions/src/selection/chest-selection-policy.cjs":{"../hints/package-count-policy.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/package-count-policy.cjs","../code-length-contract.cjs":"prototypes/firebase-lock-attempt/functions/src/code-length-contract.cjs"},"prototypes/firebase-lock-attempt/functions/src/selection/chest-start-contract.cjs":{"node:crypto":"node:crypto","./chest-selection-policy.cjs":"prototypes/firebase-lock-attempt/functions/src/selection/chest-selection-policy.cjs"},"prototypes/firebase-lock-attempt/functions/src/selection/personal-chest-runtime.cjs":{"./chest-start-contract.cjs":"prototypes/firebase-lock-attempt/functions/src/selection/chest-start-contract.cjs","./chest-selection-policy.cjs":"prototypes/firebase-lock-attempt/functions/src/selection/chest-selection-policy.cjs","../hints/personal-hint-assignment.cjs":"prototypes/firebase-lock-attempt/functions/src/hints/personal-hint-assignment.cjs","../code-length-contract.cjs":"prototypes/firebase-lock-attempt/functions/src/code-length-contract.cjs"},"prototypes/firebase-lock-attempt/functions/src/selection/personal-chest-working-set.cjs":{"./chest-start-contract.cjs":"prototypes/firebase-lock-attempt/functions/src/selection/chest-start-contract.cjs","./personal-chest-runtime.cjs":"prototypes/firebase-lock-attempt/functions/src/selection/personal-chest-runtime.cjs"},"prototypes/firebase-lock-attempt/functions/src/statistics/player-statistics.cjs":{}};
const cache=new Map();
function load(id){
 if(Object.hasOwn(dependencies,id))return dependencies[id];
 if(cache.has(id))return cache.get(id).exports;
 if(!Object.hasOwn(factories,id))throw Error("UNKNOWN_BUNDLE_MODULE");
 const module={exports:{}};cache.set(id,module);
 factories[id](module,module.exports,request=>{
  if(!Object.hasOwn(mappings[id],request))throw Error("UNKNOWN_BUNDLE_REQUIRE");
  return load(mappings[id][request]);
 });return module.exports;
}
export const workingSet=load("prototypes/firebase-lock-attempt/functions/src/selection/personal-chest-working-set.cjs");
export const contracts=load("prototypes/firebase-lock-attempt/functions/src/selection/chest-start-contract.cjs");
export const assignments=load("prototypes/firebase-lock-attempt/functions/src/hints/personal-hint-assignment.cjs");
