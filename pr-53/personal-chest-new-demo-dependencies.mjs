// Separate dependency boundary for the new demo generator. Historical bundles
// keep their original dependency module and saved assignments stay unchanged.
import {browserAssert as previous,browserCrypto} from './personal-chest-browser-dependencies.mjs';
const unsupported=name=>{throw Object.assign(new TypeError('Unsupported new-demo browser dependency: '+name),{code:'UNSUPPORTED_BROWSER_DEPENDENCY'});};
const failure=(actual,expected,operator)=>{throw Object.assign(new Error('Browser assertion failed: '+operator),{name:'AssertionError',code:'ERR_ASSERTION',actual,expected,operator});};
const methods=Object.freeze({
  equal:previous.equal,ok:previous.ok,deepEqual:previous.deepEqual,
  notEqual(actual,expected){if(Object.is(actual,expected))failure(actual,expected,'notStrictEqual');},
  match(actual,expected){
    // The audited callsites use ordinary, stateless RegExp literals on strings.
    // Reject custom/global/sticky regexes instead of approximating their state.
    if(typeof actual!=='string'||!(expected instanceof RegExp)||Object.getPrototypeOf(expected)!==RegExp.prototype||
      expected.global||expected.sticky||Reflect.ownKeys(expected).some(k=>k!=='lastIndex'))unsupported('assert.match arguments');
    if(!RegExp.prototype.test.call(expected,actual))failure(actual,expected,'match');
  }
});
export const browserAssert=new Proxy(methods,{get(target,key){if(!Object.hasOwn(target,key))unsupported('assert.'+String(key));return target[key];}});
export const dependencies=Object.freeze({'node:crypto':browserCrypto,'node:assert/strict':browserAssert});
