import {requireValidatedLegacySource} from './d205-legacy-source.mjs';

// This public projection is separate from the private import proposal. A
// retired old puzzle is learning material, never a synthetic new victory.
export function createLegacySolution(value) {
  const p=requireValidatedLegacySource(value), count=p.oldState.purchasedPackageCount;
  const snapshot=count===0?null:Object.freeze({schemaVersion:1,chestId:'teacher_demo_chest_v1',
    closedCode:p.closedCode,hintGeneratorVersion:1,codeLength:11,packageCount:5,
    purchasedPackageCount:count,revealedHintCount:count*2,revealedHints:p.paidHints});
  return Object.freeze({legacySolutionVersion:1,status:snapshot?'AVAILABLE':'DISABLED',
    reason:snapshot?null:'NO_PAID_HINTS',wasSolved:p.oldState.wasSolved,
    sourceBinding:Object.freeze({sourceCommit:p.source.sourceCommit,fixtureSha256:p.source.fixtureSha256,
      sourceDigest:p.source.rawSha256,setId:p.oldState.setId}),snapshot});
}
