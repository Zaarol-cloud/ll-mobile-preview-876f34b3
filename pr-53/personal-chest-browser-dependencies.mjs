// Only the Node APIs used by the frozen source graph are supported.
import {sha256} from "./personal-chest-storage-contract.mjs";
const unsupported = name => {throw Object.assign(new TypeError("Unsupported browser dependency: "+name),
  {code:"UNSUPPORTED_BROWSER_DEPENDENCY"});};
function assertion(actual,expected,operator) {
  throw Object.assign(new Error("Browser assertion failed: "+operator),
    {name:"AssertionError",code:"ERR_ASSERTION",actual,expected,operator});
}
function deep(a,b,ancestors=new Set()) {
  if(Object.is(a,b))return true;
  if(a===null || b===null || typeof a!=="object" || typeof b!=="object")return false;
  if(Object.getPrototypeOf(a)!==Object.getPrototypeOf(b))return false;
  const array=Array.isArray(a);
  if(array!==Array.isArray(b))return false;
  if(!array && ![Object.prototype,null].includes(Object.getPrototypeOf(a)))
    unsupported("deepEqual object type");
  if(ancestors.has(a) || ancestors.has(b))unsupported("deepEqual cycles");
  if(array && a.length!==b.length)return false;
  const keys=v=>Reflect.ownKeys(v).filter(k=>Object.getOwnPropertyDescriptor(v,k).enumerable);
  const ak=keys(a),bk=keys(b);
  if(ak.length!==bk.length || ak.some(k=>!bk.includes(k)))return false;
  ancestors.add(a);ancestors.add(b);
  try {
    return ak.every(k=>{
      const ad=Object.getOwnPropertyDescriptor(a,k),bd=Object.getOwnPropertyDescriptor(b,k);
      if(!Object.hasOwn(ad,"value") || !Object.hasOwn(bd,"value"))unsupported("deepEqual accessors");
      return deep(ad.value,bd.value,ancestors);
    });
  } finally{ancestors.delete(a);ancestors.delete(b);}
}
const limited = (object,name) => new Proxy(Object.freeze(object),{
  get(target,key){if(!Object.hasOwn(target,key))unsupported(name+"."+String(key));return target[key];}
});
export const browserAssert = limited({
  equal(actual,expected){if(!Object.is(actual,expected))assertion(actual,expected,"strictEqual");},
  ok(actual){if(!actual)assertion(actual,true,"ok");},
  deepEqual(actual,expected){if(!deep(actual,expected))assertion(actual,expected,"deepStrictEqual");}
},"assert/strict");
export const browserCrypto = limited({
  createHash(algorithm,...options) {
    if(algorithm!=="sha256" || options.length)unsupported("createHash algorithm/options");
    let text="",updated=false,finished=false;
    const hash=limited({
      update(value,encoding) {
        if(finished || updated || typeof value!=="string" ||
          encoding!==undefined && encoding!=="utf8")unsupported("hash.update");
        // The frozen graph uses one UTF-8 string update per hash. Reject other
        // update shapes instead of emulating unsupported Node buffer behavior.
        text=value;updated=true;return hash;
      },
      digest(encoding) {
        if(finished || encoding!==undefined && encoding!=="hex")unsupported("hash.digest");
        finished=true;const hex=sha256(text);
        return encoding==="hex" ? hex : limited({
          readUInt32BE(offset){if(offset!==0)unsupported("digest.readUInt32BE offset");return Number.parseInt(hex.slice(0,8),16);}
        },"digest");
      }
    },"hash");
    return hash;
  }
},"crypto");
export const dependencies = Object.freeze({"node:crypto":browserCrypto,"node:assert/strict":browserAssert});

