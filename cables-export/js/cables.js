/******/ (() => { // webpackBootstrap
/******/ 	// runtime can't be in strict mode because a global variable is assign and maybe created.
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!****************************************!*\
  !*** ./src/core/index.js + 26 modules ***!
  \****************************************/
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Anim: () => (/* reexport */ Anim),
  AnimKey: () => (/* reexport */ AnimKey),
  CONSTANTS: () => (/* reexport */ CONSTANTS),
  EMBED: () => (/* reexport */ EMBED),
  Link: () => (/* reexport */ Link),
  LoadingStatus: () => (/* reexport */ LoadingStatus),
  MemProfilerItem: () => (/* reexport */ MemProfilerItem),
  Op: () => (/* reexport */ Op),
  Patch: () => (/* reexport */ Patch),
  PatchVariable: () => (/* reexport */ PatchVariable),
  Port: () => (/* reexport */ Port),
  Profiler: () => (/* reexport */ Profiler),
  RenderLoop: () => (/* reexport */ RenderLoop),
  Timer: () => (/* reexport */ Timer),
  "default": () => (/* binding */ core),
  now: () => (/* reexport */ now),
  utils: () => (/* reexport */ utils_namespaceObject)
});

// NAMESPACE OBJECT: ./src/core/utils.js
var utils_namespaceObject = {};
__webpack_require__.r(utils_namespaceObject);
__webpack_require__.d(utils_namespaceObject, {
  ajax: () => (ajax),
  basename: () => (basename),
  cacheBust: () => (cacheBust),
  clamp: () => (clamp),
  cleanJson: () => (cleanJson),
  cloneObject: () => (cloneObject),
  copyArray: () => (copyArray),
  escapeHTML: () => (escapeHTML),
  filename: () => (filename),
  float32Concat: () => (float32Concat),
  generateUUID: () => (generateUUID),
  getShortOpName: () => (getShortOpName),
  idleCallback: () => (idleCallback),
  idleCallbackSoon: () => (idleCallbackSoon),
  isNumeric: () => (isNumeric),
  logErrorConsole: () => (logErrorConsole),
  logStack: () => (logStack),
  map: () => (map),
  prefixedHash: () => (prefixedHash),
  request: () => (request),
  shortId: () => (shortId),
  shuffleArray: () => (shuffleArray),
  simpleId: () => (simpleId),
  smoothStep: () => (smoothStep),
  smootherStep: () => (smootherStep),
  uniqueArray: () => (uniqueArray),
  uuid: () => (uuid)
});

;// CONCATENATED MODULE: ../shared/client/src/eventlistener.js
class EventListener
{

    /**
     * @param {Object} emitter
     * @param {string} id
     * @param {string} eventName
     * @param {Function} cb
     */
    constructor(emitter, id, eventName, cb)
    {
        this.targetObj = emitter;
        this.id = id;
        this.eventName = eventName;
        this.cb = cb;
    }

    remove()
    {
        this.targetObj.off(this.id);
    }
}

;// CONCATENATED MODULE: ../shared/client/src/helper.js
/**
 * Shared helper methods for cables uis
 */
class Helper
{
    constructor()
    {
        this._simpleIdCounter = 0;
    }

    /**
     * generate a random v4 uuid
     *
     * @return {string}
     */
    uuid()
    {
        let d = new Date().getTime();
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) =>
        {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
    }

    /**
     * checks value for !isNan and isFinite
     *
     * @param {string} n
     * @return {boolean}
     */
    isNumeric(n)
    {
        // const nn = parseFloat(n);
        // return !isNaN(nn) && isFinite(nn);
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    /**
     * generate a simple ID using an internal counter
     *
     * @return {Number} new id
     * @static
     */
    simpleId()
    {
        this._simpleIdCounter++;
        return this._simpleIdCounter;
    }

    pathLookup(obj, path)
    {
        const parts = path.split(".");
        if (parts.length == 1)
        {
            return obj[parts[0]];
        }
        return this.pathLookup(obj[parts[0]], parts.slice(1).join("."));
    }

}
/* harmony default export */ const helper = (new Helper());

;// CONCATENATED MODULE: ../shared/client/src/logger.js
/* eslint-disable no-console */
class Logger
{

    /**
     * @param {any} initiator
     * @param {Object} options
     */
    constructor(initiator, options)
    {
        this.initiator = initiator;
        this._options = options;
        if (!this.initiator)
        {
            console.error("no log initator given");
            CABLES.logStack();
        }
    }

    /**
     * @param {string} t
     */
    stack(t)
    {
        console.info("[" + this.initiator + "] ", t);
        console.log((new Error()).stack);
    }

    /**
     * @param {string} t
     */
    groupCollapsed(t)
    {
        if ((CABLES.UI && CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 0 }, ...arguments)) || !CABLES.logSilent) console.log("[" + this.initiator + "]", ...arguments);

        console.groupCollapsed("[" + this.initiator + "] " + t);
    }

    /**
     * @param {any[][]} t
     */
    table(t)
    {
        console.table(t);
    }

    groupEnd()
    {
        console.groupEnd();
    }

    error()
    {

        if ((CABLES.UI && CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 2 }, ...arguments)) || !CABLES.UI)
        {
            console.error("[" + this.initiator + "]", ...arguments);
        }

        if (this._options && this._options.onError)
        {
            this._options.onError(this.initiator, ...arguments);
            // console.log("emitevent onerror...");
            // CABLES.patch.emitEvent("onError", this.initiator, ...arguments);
            // CABLES.logErrorConsole("[" + this.initiator + "]", ...arguments);
        }

    }

    errorGui()
    {
        if (CABLES.UI) CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 2 }, ...arguments);
    }

    warn()
    {
        if ((CABLES.UI && CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 1 }, ...arguments)))
            console.warn("[" + this.initiator + "]", ...arguments);
        return null;
    }

    verbose()
    {
        if ((CABLES.UI && CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 0 }, ...arguments)) || !CABLES.logSilent)
            console.log("[" + this.initiator + "]", ...arguments);
    }

    info()
    {
        if ((CABLES.UI && CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 0 }, ...arguments)) || !CABLES.logSilent)
            console.info("[" + this.initiator + "]", ...arguments);
    }

    log()
    {
        if ((CABLES.UI && CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 0 }, ...arguments)) || !CABLES.logSilent)
            console.log("[" + this.initiator + "]", ...arguments);
    }

    logGui()
    {
        if (CABLES.UI) CABLES.UI.logFilter.filterLog({ "initiator": this.initiator, "level": 0 }, ...arguments);
    }

    userInteraction(text)
    {
        // this.log({ "initiator": "userinteraction", "text": text });
    }
}

;// CONCATENATED MODULE: ../shared/client/src/eventtarget.js




/**
 * add eventlistener functionality to classes
 */
class Events
{
    #eventLog = new Logger("eventtarget");

    /** @type {Object<string,EventListener>} */
    #listeners = {};
    #logEvents = false;
    #logName = "";
    #eventCallbacks = {};
    #countErrorUnknowns = 0;
    eventsPaused = false;

    constructor()
    {
    }

    /**
     * @callback whatever
     * @param {...any} param
     */

    /**
     * add event listener
     * @param {string} eventName event name
     * @param {whatever} cb callback
     * @param {string} idPrefix prefix for id, default empty
     * @return {EventListener} eventlistener
     */
    on(eventName, cb, idPrefix = "")
    {
        const newId = (idPrefix || "") + helper.simpleId();

        const event = new EventListener(this, newId, eventName, cb);

        if (!this.#eventCallbacks[eventName]) this.#eventCallbacks[eventName] = [event];
        else this.#eventCallbacks[eventName].push(event);

        this.#listeners[event.id] = event;

        return event;
    }

    removeAllEventListeners()
    {
        for (const i in this.#listeners)
        {
            this.off(this.#listeners[i]);
        }
    }

    /**
     *
     * @param {string} which
     * @param {whatever} cb
     */
    addEventListener(which, cb, idPrefix = "")
    {
        return this.on(which, cb, idPrefix);
    }

    /**
     * check event listener registration
     * @param {string|EventListener} id event id
     * @param {whatever} cb callback - deprecated
     * @return {boolean}
     */
    hasEventListener(id, cb = null)
    {
        if (id && !cb)
        {
            if (typeof id == "string") // check by id
                return !!this.#listeners[id];
            else
                return !!this.#listeners[id.id];

        }
        else
        {
            this.#eventLog.warn("old eventtarget function haseventlistener!");
            if (id && cb)
            {
                if (this.#eventCallbacks[id])
                {
                    const idx = this.#eventCallbacks[id].indexOf(cb);
                    return idx !== -1;
                }
            }
        }
    }

    /**
     * check event listener by name
     * @param {string } eventName event name
     * @return {boolean}
     */
    hasListenerForEventName(eventName)
    {
        return this.#eventCallbacks[eventName] && this.#eventCallbacks[eventName].length > 0;
    }

    /** @deprecated */
    removeEventListener(id)
    {
        return this.off(id);
    }

    /**
     * remove event listener registration
     * @param {EventListener} listenerParam
     */
    off(listenerParam)
    {
        if (listenerParam === null || listenerParam === undefined)
        {
            this.#eventLog.warn("removeEventListener id null", listenerParam);
            return;
        }

        let id = listenerParam; // old off was using id strings directly, now uses eventlistener class
        // @ts-ignore
        if (listenerParam.eventName) id = listenerParam.id;

        if (typeof id != "string")
        {
            console.log("old function signature: removeEventListener! use listener id");
            return;
        }

        const event = this.#listeners[id];
        if (!event)
        {
            if (this.#countErrorUnknowns == 20) this.#eventLog.warn("stopped reporting unknown events");
            if (this.#countErrorUnknowns < 20)
            {
                this.#eventLog.warn("could not find event...", id, event);
                console.trace();
            }
            this.#countErrorUnknowns++;
            return;
        }

        let removeCount = 0;

        let found = true;
        while (found)
        {
            found = false;
            let index = -1;
            for (let i = 0; i < this.#eventCallbacks[event.eventName].length; i++)
            {
                if (this.#eventCallbacks[event.eventName][i].id.indexOf(id) === 0) // this._eventCallbacks[event.eventName][i].id == which ||
                {
                    found = true;
                    index = i;
                }
            }

            if (index !== -1)
            {
                this.#eventCallbacks[event.eventName].splice(index, 1);
                delete this.#listeners[id];
                removeCount++;
            }
        }

        if (removeCount == 0)console.log("no events removed", event.eventName, id);

        return;
    }

    /**
     * enable/disable logging of events for the class
     *
     * @param {boolean} enabled
     * @param {string} logName
     */
    logEvents(enabled, logName)
    {
        this.#logEvents = enabled;
        this.#logName = logName;
    }

    /**
     * emit event
     *
     * @param {string} which event name
     * @param {*} param1
     * @param {*} param2
     * @param {*} param3
     * @param {*} param4
     * @param {*} param5
     * @param {*} param6
     */
    emitEvent(which, param1 = null, param2 = null, param3 = null, param4 = null, param5 = null, param6 = null, param7 = null, param8 = null)
    {
        if (this.eventsPaused) return;
        if (this.#logEvents) this.#eventLog.log("[event] ", this.#logName, which, this.#eventCallbacks);

        if (this.#eventCallbacks[which])
        {
            for (let i = 0; i < this.#eventCallbacks[which].length; i++)
            {
                if (this.#eventCallbacks[which][i])
                {
                    this.#eventCallbacks[which][i].cb(param1, param2, param3, param4, param5, param6, param7, param8);
                }
            }
        }
        else
        {
            if (this.#logEvents) this.#eventLog.log("[event] has no event callback", which, this.#eventCallbacks);
        }
    }
}

;// CONCATENATED MODULE: ./src/core/anim_key.js


class AnimKey
{

    /** @type {Anim} */
    anim = null;
    id = CABLES.simpleId();
    time = 0.0;
    value = 0.0;
    onChange = null;
    _easing = 0;
    bezCp1 = null;
    bezCp2 = null;
    bezAn = null;
    cb = null;
    cbTriggered = false;
    temp = {};
    uiAttribs = {};

    /** @type {Anim} */
    clip = null;
    clipId = null;

    /**
     * @param {SerializedKey} obj
     * @param {Anim} [an]
     */
    constructor(obj, an)
    {
        this.anim = obj.anim || an || null;
        this.setEasing(Anim.EASING_LINEAR);
        this.set(obj);
    }

    /**
     * @param {any} clipId
     * @param {Anim} a
     */
    setClip(clipId, a)
    {
        this.clipId = clipId;
        this.clip = a;
        if (this.anim) this.anim.emitEvent(Anim.EVENT_CHANGE);
    }

    emitChange()
    {
        if (this.anim.batchMode) return;
        if (!this.anim) return;
        this.bezAn = null;
        if (this.onChange !== null) this.onChange();
        this.anim.forceChangeCallbackSoon();
        for (let i = 0; i < this.anim.keys.length; i++)
            this.anim.keys[i].bezAn = null;
    }

    delete()
    {
        if (this.anim) this.anim.remove(this);
        else console.log("animkey without anim...");
    }

    /**
     * @param {Object} o
     */
    setUiAttribs(o)
    {
        for (const i in o)
        {
            this.uiAttribs[i] = o[i];
            if (o[i] === null) delete this.uiAttribs[i];
        }
        if (this.anim) this.anim.emitEvent(Anim.EVENT_CHANGE);
    }

    /**
     * @param {Number} e
     */
    setEasing(e)
    {
        if (this.anim.uiAttribs.readOnly) return;
        if (this.anim.uiAttribs.muted) return;

        let changed = false;
        if (this._easing != e)changed = true;
        this._easing = e;
        if (this._easing != Anim.EASING_CLIP)
        {
            this.clipId = "";
            this.clip = null;
        }

        if (this._easing == Anim.EASING_LINEAR) this.ease = this.easeLinear;
        else if (this._easing == Anim.EASING_ABSOLUTE) this.ease = this.easeAbsolute;
        else if (this._easing == Anim.EASING_SMOOTHSTEP) this.ease = AnimKey.easeSmoothStep;
        else if (this._easing == Anim.EASING_SMOOTHERSTEP) this.ease = AnimKey.easeSmootherStep;

        /* minimalcore:start */
        else if (this._easing == Anim.EASING_CUBIC_IN) this.ease = AnimKey.easeCubicIn;
        else if (this._easing == Anim.EASING_CUBIC_OUT) this.ease = AnimKey.easeCubicOut;
        else if (this._easing == Anim.EASING_CUBIC_INOUT) this.ease = AnimKey.easeCubicInOut;
        else if (this._easing == Anim.EASING_EXPO_IN) this.ease = AnimKey.easeExpoIn;
        else if (this._easing == Anim.EASING_EXPO_OUT) this.ease = AnimKey.easeExpoOut;
        else if (this._easing == Anim.EASING_EXPO_INOUT) this.ease = AnimKey.easeExpoInOut;
        else if (this._easing == Anim.EASING_SIN_IN) this.ease = AnimKey.easeSinIn;
        else if (this._easing == Anim.EASING_SIN_OUT) this.ease = AnimKey.easeSinOut;
        else if (this._easing == Anim.EASING_SIN_INOUT) this.ease = AnimKey.easeSinInOut;
        else if (this._easing == Anim.EASING_BACK_OUT) this.ease = AnimKey.easeOutBack;
        else if (this._easing == Anim.EASING_BACK_IN) this.ease = AnimKey.easeInBack;
        else if (this._easing == Anim.EASING_BACK_INOUT) this.ease = AnimKey.easeInOutBack;
        else if (this._easing == Anim.EASING_ELASTIC_IN) this.ease = AnimKey.easeInElastic;
        else if (this._easing == Anim.EASING_ELASTIC_OUT) this.ease = AnimKey.easeOutElastic;
        // else if (this._easing == Anim.EASING_ELASTIC_INOUT) this.ease = AnimKey.easeElasticInOut;
        else if (this._easing == Anim.EASING_BOUNCE_IN) this.ease = AnimKey.easeInBounce;
        else if (this._easing == Anim.EASING_BOUNCE_OUT) this.ease = AnimKey.easeOutBounce;
        else if (this._easing == Anim.EASING_QUART_OUT) this.ease = AnimKey.easeOutQuart;
        else if (this._easing == Anim.EASING_QUART_IN) this.ease = AnimKey.easeInQuart;
        else if (this._easing == Anim.EASING_QUART_INOUT) this.ease = AnimKey.easeInOutQuart;
        else if (this._easing == Anim.EASING_QUINT_OUT) this.ease = AnimKey.easeOutQuint;
        else if (this._easing == Anim.EASING_QUINT_IN) this.ease = AnimKey.easeInQuint;
        else if (this._easing == Anim.EASING_QUINT_INOUT) this.ease = AnimKey.easeInOutQuint;

        /* minimalcore:end */
        else if (this._easing == Anim.EASING_CLIP) this.ease = this.easeAbsolute;
        else if (this._easing == Anim.EASING_CUBICSPLINE)
        {
            if (this.ease != this.easeCubicSpline)
            {
                this.ease = this.easeCubicSpline;
                this.bezReset();
            }

            this.bezAn = null;
        }
        else
        {
            this._easing = Anim.EASING_LINEAR;
            this.ease = this.easeLinear;
        }
        if (changed) this.emitChange();
    }

    bezReset()
    {

        let xx = 0.5;
        const pk = this.anim.getPrevKey(this.time);
        if (pk)xx = (this.time - pk.time) / 2;

        let x2 = 0.5;
        const nk = this.anim.getNextKey(this.time);
        if (nk)x2 = (nk.time - this.time) / 2;

        this.bezCp1 = [-Math.min(xx, x2), 0];
        this.bezCp2 = [Math.min(xx, x2), 0];
        this.emitChange();
    }

    trigger()
    {
        this.cb();
        this.cbTriggered = true;
    }

    /**
     * @param {number} v
     */
    setValue(v)
    {
        this.value = v;
        this.emitChange();
    }

    /**
     * @param {number} t
     * @param {number} v
     */
    setBezCp1(t, v)
    {
        this.bezCp1 = [t, v];
        this.emitChange();
    }

    /**
     * @param {number} t
     * @param {number} v
     */
    setBezCp2(t, v)
    {
        this.bezCp2 = [t, v];
        this.emitChange();
    }

    /**
     * @param {SerializedKey} obj
     */
    set(obj)
    {
        if (obj)
        {
            if (obj.hasOwnProperty("e")) this.setEasing(obj.e);
            if (obj.cb)
            {
                this.cb = obj.cb;
                this.cbTriggered = false;
            }

            if (obj.hasOwnProperty("cp1"))
            {
                this.bezCp1 = obj.cp1;
                this.bezCp2 = obj.cp2;
            }

            if (obj.hasOwnProperty("t")) this.time = obj.t;
            if (obj.hasOwnProperty("time")) this.time = obj.time;
            if (obj.hasOwnProperty("v")) this.value = obj.v;
            else if (obj.hasOwnProperty("value")) this.value = obj.value;

            if (obj.hasOwnProperty("uiAttribs")) this.setUiAttribs(obj.uiAttribs);
            if (obj.clipId) this.clipId = obj.clipId;
        }
        this.emitChange();
    }

    /**
   * @returns {Object}
   */
    getSerialized()
    {
        const obj = {};
        obj.t = this.time;
        obj.v = this.value;
        obj.e = this._easing;
        obj.uiAttribs = this.uiAttribs;
        if (this.clipId)obj.clipId = this.clipId;

        if (this._easing === Anim.EASING_CUBICSPLINE)
        {
            obj.cp1 = this.bezCp1;
            obj.cp2 = this.bezCp2;
        }

        return obj;
    }

    getEasing()
    {
        return this._easing;
    }

    /**
     * @param {number} perc
     * @param {AnimKey} key2
     */
    easeCubicSpline(perc, key2)
    {
        if (!this.bezAn)
        {
            const samples = 30;

            // const prevKey = this.anim.getPrevKey(this.time);
            this.bezAn = new Anim();
            for (let i = 0; i <= samples + 1; i++)
            {
                const c = AnimKey.cubicSpline(i / samples, this, key2);
                this.bezAn.setValue(c[0], c[1]);
            }
        }

        return this.bezAn.getValue(this.time + perc * (key2.time - this.time));
        // return AnimKey.cubicSpline(perc, this, key2);
    }

    /**
     * @param {number} perc
     * @param {AnimKey} key2
     */
    easeLinear(perc, key2)
    {
        return AnimKey.linear(perc, this, key2);
    }

    easeAbsolute()
    {
        return this.value;
    }
}

AnimKey.cubicSpline = function (t, key1, key2)
{
    const tInv = 1 - t;
    const tInvSq = tInv * tInv;
    const tSq = t * t;

    const c0 = tInvSq * tInv;
    const c1 = 3 * tInvSq * t;
    const c2 = 3 * tInv * tSq;
    const c3 = tSq * t;

    key1.bezCp1 = key1.bezCp1 || [-0.5, 0];
    key1.bezCp2 = key1.bezCp2 || [0.5, 0];
    key2.bezCp1 = key2.bezCp1 || [-0.5, 0];
    key2.bezCp2 = key2.bezCp2 || [0.5, 0];

    const x1 = Math.min(key2.time, key1.bezCp2[0] + key1.time);
    const xp = Math.max(key1.time, key2.bezCp1[0] + key2.time);
    // const xp = key2.bezCp1[0] + key2.time;
    // console.log("textjjjj", key2.time, key0.time);

    // const x = c0 + c1 * (key1.bezCp2[0]) + c2 * (key2.bezCp1[0]) + c3;
    const x = c0 * key1.time + c1 * (x1) + c2 * (xp) + c3 * (key2.time);
    const y = c0 * key1.value + c1 * (key1.bezCp2[1] + key1.value) + c2 * (key2.bezCp1[1] + key2.value) + c3 * (key2.value);

    return [x, y];
};

AnimKey.linear = function (perc, key1, key2)
{
    return (key1.value) + (key2.value - key1.value) * perc;
};

/* minimalcore:start */
const easeExpoIn = function (t)
{
    return (t = 2 ** (10 * (t - 1)));
};

AnimKey.easeExpoIn = function (t, key2)
{
    t = easeExpoIn(t);
    return AnimKey.linear(t, this, key2);
};

const easeExpoOut = function (t)
{
    t = -(2 ** (-10 * t)) + 1;
    return t;
};

AnimKey.easeExpoOut = function (t, key2)
{
    t = easeExpoOut(t);
    return AnimKey.linear(t, this, key2);
};

const easeExpoInOut = function (t)
{
    t *= 2;
    if (t < 1)
    {
        t = 0.5 * 2 ** (10 * (t - 1));
    }
    else
    {
        t--;
        t = 0.5 * (-(2 ** (-10 * t)) + 2);
    }
    return t;
};

AnimKey.easeExpoInOut = function (t, key2)
{
    t = easeExpoInOut(t);
    return AnimKey.linear(t, this, key2);
};

AnimKey.easeSinIn = function (t, key2)
{
    t = -1 * Math.cos((t * Math.PI) / 2) + 1;
    return AnimKey.linear(t, this, key2);
};

AnimKey.easeSinOut = function (t, key2)
{
    t = Math.sin((t * Math.PI) / 2);
    return AnimKey.linear(t, this, key2);
};

AnimKey.easeSinInOut = function (t, key2)
{
    t = -0.5 * (Math.cos(Math.PI * t) - 1.0);
    return AnimKey.linear(t, this, key2);
};

const easeCubicIn = function (t)
{
    t = t * t * t;
    return t;
};

AnimKey.easeCubicIn = function (t, key2)
{
    t = easeCubicIn(t);
    return AnimKey.linear(t, this, key2);
};

// b 0
// c 1/2 or 1
// d always 1
// easeOutCubic: function (x, t, b, c, d) {
//     return c*((t=t/d-1)*t*t + 1) + b;

AnimKey.easeInQuint = function (t, key2)
{
    t = t * t * t * t * t;
    return AnimKey.linear(t, this, key2);
};
AnimKey.easeOutQuint = function (t, key2)
{
    t = (t -= 1) * t * t * t * t + 1;
    return AnimKey.linear(t, this, key2);
};
AnimKey.easeInOutQuint = function (t, key2)
{
    if ((t /= 0.5) < 1) t = 0.5 * t * t * t * t * t;
    else t = 0.5 * ((t -= 2) * t * t * t * t + 2);
    return AnimKey.linear(t, this, key2);
};

AnimKey.easeInQuart = function (t, key2)
{
    t = t * t * t * t;
    return AnimKey.linear(t, this, key2);
};

AnimKey.easeOutQuart = function (t, key2)
{
    // return -c * ((t=t/d-1)*t*t*t - 1) + b;
    t = -1 * ((t -= 1) * t * t * t - 1);
    return AnimKey.linear(t, this, key2);
};

AnimKey.easeInOutQuart = function (t, key2)
{
    if ((t /= 0.5) < 1) t = 0.5 * t * t * t * t;
    else t = -0.5 * ((t -= 2) * t * t * t - 2);
    return AnimKey.linear(t, this, key2);
};

AnimKey.bounce = function (t)
{
    if ((t /= 1) < 1 / 2.75) t = 7.5625 * t * t;
    else if (t < 2 / 2.75) t = 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    else if (t < 2.5 / 2.75) t = 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    else t = 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    return t;
};

AnimKey.easeInBounce = function (t, key2)
{
    return AnimKey.linear(AnimKey.bounce(t), this, key2);
    // return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d);
};

AnimKey.easeOutBounce = function (t, key2)
{
    return AnimKey.linear(AnimKey.bounce(t), this, key2);
};

AnimKey.easeInElastic = function (t, key2)
{
    let s = 1.70158;
    let p = 0;
    let a = 1;

    const b = 0;
    const d = 1;
    const c = 1;

    if (t === 0) t = b;
    else if ((t /= d) == 1) t = b + c;
    else
    {
        if (!p) p = d * 0.3;
        if (a < Math.abs(c))
        {
            a = c;
            s = p / 4;
        }
        else s = (p / (2 * Math.PI)) * Math.asin(c / a);
        t = -(a * 2 ** (10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b;
    }

    return AnimKey.linear(t, this, key2);
};

AnimKey.easeOutElastic = function (t, key2)
{
    let s = 1.70158;
    let p = 0;
    let a = 1;

    const b = 0;
    const d = 1;
    const c = 1;

    if (t === 0) t = b;
    else if ((t /= d) == 1) t = b + c;
    else
    {
        if (!p) p = d * 0.3;
        if (a < Math.abs(c))
        {
            a = c;
            s = p / 4;
        }
        else s = (p / (2 * Math.PI)) * Math.asin(c / a);
        t = a * 2 ** (-10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) + c + b;
    }

    return AnimKey.linear(t, this, key2);
};

AnimKey.easeInBack = function (t, key2)
{
    const s = 1.70158;
    t = t * t * ((s + 1) * t - s);

    return AnimKey.linear(t, this, key2);
};

AnimKey.easeOutBack = function (t, key2)
{
    const s = 1.70158;
    t = (t = t / 1 - 1) * t * ((s + 1) * t + s) + 1;

    return AnimKey.linear(t, this, key2);
};

AnimKey.easeInOutBack = function (t, key2)
{
    let s = 1.70158;
    const c = 1 / 2;
    if ((t /= 1 / 2) < 1) t = c * (t * t * (((s *= 1.525) + 1) * t - s));
    else t = c * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);

    return AnimKey.linear(t, this, key2);
};

const easeCubicOut = function (t)
{
    t--;
    t = t * t * t + 1;
    return t;
};

AnimKey.easeCubicOut = function (t, key2)
{
    t = easeCubicOut(t);
    return AnimKey.linear(t, this, key2);
};

const easeCubicInOut = function (t)
{
    t *= 2;
    if (t < 1) t = 0.5 * t * t * t;
    else
    {
        t -= 2;
        t = 0.5 * (t * t * t + 2);
    }
    return t;
};

AnimKey.easeCubicInOut = function (t, key2)
{
    t = easeCubicInOut(t);
    return AnimKey.linear(t, this, key2);
};

/* minimalcore:end */
AnimKey.easeSmoothStep = function (perc, key2)
{
    // var x = Math.max(0, Math.min(1, (perc-0)/(1-0)));
    const x = Math.max(0, Math.min(1, perc));
    perc = x * x * (3 - 2 * x); // smoothstep
    return AnimKey.linear(perc, this, key2);
};

AnimKey.easeSmootherStep = function (perc, key2)
{
    const x = Math.max(0, Math.min(1, (perc - 0) / (1 - 0)));
    perc = x * x * x * (x * (x * 6 - 15) + 10); // smootherstep
    return AnimKey.linear(perc, this, key2);
};

;// CONCATENATED MODULE: ./src/core/anim.js







let counts = {};

/**
 * Keyframed interpolated animation.
 *
 * @class
 * @param cfg
 * @example
 * var anim=new CABLES.Anim();
 * anim.setValue(0,0);  // set value 0 at 0 seconds
 * anim.setValue(10,1); // set value 1 at 10 seconds
 * anim.getValue(5);    // get value at 5 seconds - this returns 0.5
 */

class Anim extends Events
{
    static EVENT_KEY_DELETE = "keyDelete";
    static EVENT_CHANGE = "onChange";
    static EVENT_UIATTRIB_CHANGE = "uiattrchange";

    static LOOP_OFF = 0;
    static LOOP_REPEAT = 1;
    static LOOP_MIRROR = 2;
    static LOOP_OFFSET = 3;

    static EASING_LINEAR = 0;
    static EASING_ABSOLUTE = 1;
    static EASING_SMOOTHSTEP = 2;
    static EASING_SMOOTHERSTEP = 3;

    /* minimalcore:start */
    static EASING_CUBICSPLINE = 4;

    static EASING_CUBIC_IN = 5;
    static EASING_CUBIC_OUT = 6;
    static EASING_CUBIC_INOUT = 7;

    static EASING_EXPO_IN = 8;
    static EASING_EXPO_OUT = 9;
    static EASING_EXPO_INOUT = 10;

    static EASING_SIN_IN = 11;
    static EASING_SIN_OUT = 12;
    static EASING_SIN_INOUT = 13;

    static EASING_BACK_IN = 14;
    static EASING_BACK_OUT = 15;
    static EASING_BACK_INOUT = 16;

    static EASING_ELASTIC_IN = 17;
    static EASING_ELASTIC_OUT = 18;

    static EASING_BOUNCE_IN = 19;
    static EASING_BOUNCE_OUT = 21;

    static EASING_QUART_IN = 22;
    static EASING_QUART_OUT = 23;
    static EASING_QUART_INOUT = 24;

    static EASING_QUINT_IN = 25;
    static EASING_QUINT_OUT = 26;
    static EASING_QUINT_INOUT = 27;

    /* minimalcore:end */

    static EASING_CLIP = 28;

    static EASINGNAMES = ["linear", "absolute", "smoothstep", "smootherstep", "Cubic In", "Cubic Out", "Cubic In Out", "Expo In", "Expo Out", "Expo In Out", "Sin In", "Sin Out", "Sin In Out", "Quart In", "Quart Out", "Quart In Out", "Quint In", "Quint Out", "Quint In Out", "Back In", "Back Out", "Back In Out", "Elastic In", "Elastic Out", "Bounce In", "Bounce Out", "Clip"];

    #tlActive = true;
    uiAttribs = {};
    loop = 0;
    onLooped = null;
    _timesLooped = 0;
    #needsSort = false;
    _cachedIndex = 0;

    /** @type {Port} */
    port = null;

    /** @type {AnimKey[]} */
    keys = [];
    onChange = null;
    stayInTimeline = false;
    batchMode = false;
    #log = new Logger("Anim");

    /**
     * @param {AnimCfg} [cfg]
     */
    constructor(cfg = {})
    {
        super();
        cfg = cfg || {};
        this.id = uuid();
        this.name = cfg.name || null;

        /** @type {Number} */
        this.defaultEasing = cfg.defaultEasing || Anim.EASING_LINEAR;
    }

    forceChangeCallback()
    {
        if (this.onChange !== null) this.onChange();
        this.emitEvent(Anim.EVENT_CHANGE, this);
    }

    forceChangeCallbackSoon()
    {
        if (this.batchMode) return;
        if (!this.forcecbto)
            this.forcecbto = setTimeout(() =>
            {
                this.forceChangeCallback();
                this.forcecbto = null;
            },
            50);
    }

    getLoop()
    {
        return this.loop;
    }

    /**
     * @param {number} loopType
     */
    setLoop(loopType)
    {
        if (loopType === false)loopType = 0;
        if (loopType === true)loopType = 1;

        this.loop = loopType;
        this.emitEvent(Anim.EVENT_CHANGE, this);
    }

    /**
     * returns true if animation has ended at @time
     * checks if last key time is < time
     * @param {Number} time
     * @returns {Boolean}
     */
    hasEnded(time)
    {
        if (this.#needsSort) this.sortKeys();
        if (this.keys.length === 0) return true;
        if (this.keys[this.keys.length - 1].time <= time) return true;
        return false;
    }

    /**
     * @param {number} time
     */
    hasStarted(time)
    {
        if (this.#needsSort) this.sortKeys();
        if (this.keys.length === 0) return false;
        if (time >= this.keys[0].time) return true;
        return false;
    }

    /**
     * @param {number} time
     */
    isRising(time)
    {
        if (this.#needsSort) this.sortKeys();
        if (this.hasEnded(time)) return false;
        const ki = this.getKeyIndex(time);
        if (this.keys[ki].value < this.keys[ki + 1].value) return true;
        return false;
    }

    /**
     * remove all keys from animation before time
     * @param {Number} time
     */
    clearBefore(time)
    {
        if (this.#needsSort) this.sortKeys();
        const v = this.getValue(time);
        const ki = this.getKeyIndex(time);

        this.setValue(time, v);

        if (ki > 1)
        {
            this.keys.splice(0, ki);
            this.#needsSort = true;
        }
    }

    /**
     * remove all keys from animation
     * @param {Number} [time=0] set a new key at time with the old value at time
     * @memberof Anim
     * @instance
     * @function
     */
    clear(time)
    {
        if (this.#needsSort) this.sortKeys();
        let v = 0;
        if (time) v = this.getValue(time);

        for (let i = 0; i < this.keys.length; i++)
            this.emitEvent(Anim.EVENT_KEY_DELETE, this.keys[i]);

        this.keys.length = 0;
        if (time) this.setValue(time, v);
        this.#needsSort = true;
        if (this.onChange !== null) this.onChange();
        this.emitEvent(Anim.EVENT_CHANGE, this);
    }

    checkIsSorted()
    {
        let isSorted = true;
        for (let i = 0; i < this.keys.length - 1; i++)
            if (this.keys[i].time > this.keys[i + 1].time)
            {
                isSorted = false;
                break;
            }

        return isSorted;
    }

    sortKeys()
    {
        if (this.batchMode) return;
        if (!this.checkIsSorted())
        {
            this.keys.sort((a, b) => { return a.time - b.time; });
            this.#needsSort = false;

            this.emitEvent(Anim.EVENT_CHANGE);
        }
    }

    hasDuplicates()
    {
        const test = {};
        let count = 0;
        for (let i = 0; i < this.keys.length; i++)
        {
            test[this.keys[i].time] = 1;
            count++;
        }

        const keys = Object.keys(test);
        if (keys.length != count)
        {
            return true;
        }
        return false;
    }

    removeDuplicates()
    {
        if (this.hasDuplicates())
        {
            if (this.#needsSort) this.sortKeys();
            let count = 0;

            while (this.hasDuplicates())
            {
                for (let i = 0; i < this.keys.length - 1; i++)
                {
                    if (this.keys[i].time == this.keys[i + 1].time)
                    {
                        const oldkey = this.keys[i];
                        this.keys.splice(i, 1);
                        this.emitEvent(Anim.EVENT_KEY_DELETE, oldkey);
                    }
                    count++;
                }
            }
            this.#needsSort = true;
        }
    }

    getLengthLoop()
    {
        if (this.#needsSort) this.sortKeys();
        if (this.keys.length < 2) return 0;
        return this.lastKey.time - this.firstKey.time;
    }

    getLength()
    {
        if (this.#needsSort) this.sortKeys();
        if (this.keys.length === 0) return 0;
        return this.lastKey.time;
    }

    /**
     * @param {number} time
     */
    getKeyIndex(time)
    {
        if (this.#needsSort) this.sortKeys();
        let index = 0;
        let start = 0;
        if (this._cachedIndex && this.keys.length > this._cachedIndex && time >= this.keys[this._cachedIndex].time) start = this._cachedIndex;
        for (let i = start; i < this.keys.length; i++)
        {
            if (time >= this.keys[i].time) index = i;
            if (this.keys[i].time > time)
            {
                if (time != 0) this._cachedIndex = index;
                return index;
            }
        }

        return index;
    }

    /**
     * set value at time
     * @param {Number} time
     * @param {Number} value
     * @param {Function} cb callback
     */
    setValue(time, value, cb = null)
    {
        if (CABLES.UI && CABLES.UI.showDevInfos) if (isNaN(value)) CABLES.logStack();

        if (this.#needsSort) this.sortKeys();
        let found = null;

        if (!this.batchMode)
            if (this.keys.length == 0 || time <= this.lastKey.time)
                for (let i = 0; i < this.keys.length; i++)
                    if (this.keys[i].time == time)
                    {
                        found = this.keys[i];
                        this.keys[i].setValue(value);
                        this.keys[i].cb = cb;
                        break;
                    }

        if (!found)
        {
            found = new AnimKey(
                {
                    "time": time,
                    "value": value,
                    "e": this.defaultEasing,
                    "cb": cb,
                    "anim": this
                });
            this.keys.push(found);

        }

        if (!this.batchMode)
        {

            if (this.onChange) this.onChange();
            this.emitEvent(Anim.EVENT_CHANGE, this);
            this.#needsSort = true;
        }
        return found;
    }

    /**
     * @param {number} index
     * @param {number} easing
     */
    setKeyEasing(index, easing)
    {
        if (this.keys[index])
        {
            this.keys[index].setEasing(easing);
            this.emitEvent(Anim.EVENT_CHANGE, this);
        }
    }

    /**
     * @param {object} obj
     * @param {boolean} [clear]
     * @param {object} [missingClipAnims]
     */
    deserialize(obj, clear, missingClipAnims)
    {
        if (obj.loop) this.loop = obj.loop;
        if (obj.tlActive) this.#tlActive = obj.tlActive;
        if (obj.height) this.uiAttribs.height = obj.height;
        if (clear)
        {
            while (this.keys.length) this.keys[0].delete();

            this.keys.length = 0;
        }

        for (const ani in obj.keys)
        {
            let newKey = new AnimKey(obj.keys[ani], this);
            this.keys.push(newKey);
            if (missingClipAnims)
                if (obj.keys[ani].clipId)
                {
                    missingClipAnims[obj.keys[ani].clipId] = missingClipAnims[obj.keys[ani].clipId] || [];
                    if (missingClipAnims)missingClipAnims[obj.keys[ani].clipId].push(newKey);
                }
        }
        this.sortKeys();
    }

    /**
     * @returns {SerializedAnim}
     */
    getSerialized()
    {

        /* minimalcore:start */
        /** @type {SerializedAnim} */
        const obj = {};
        obj.keys = [];
        obj.loop = this.loop;
        if (this.#tlActive)obj.tlActive = this.tlActive;
        if (this.uiAttribs.height)obj.height = this.uiAttribs.height;

        for (let i = 0; i < this.keys.length; i++)
            obj.keys.push(this.keys[i].getSerialized());

        return obj;

    /* minimalcore:end */
    }

    /**
     * @param {number} time
     */
    getKey(time)
    {
        if (this.#needsSort) this.sortKeys();
        const index = this.getKeyIndex(time);
        return this.keys[index];
    }

    /**
     * @param {number} time
     */
    getNextKey(time)
    {
        if (this.#needsSort) this.sortKeys();
        let index = this.getKeyIndex(time) + 1;
        if (index >= this.keys.length) return null;

        return this.keys[index];
    }

    /**
     * @param {number} time
     */
    getPrevKey(time)
    {
        if (this.#needsSort) this.sortKeys();
        let index = this.getKeyIndex(time) - 1;
        if (index < 0) return null;

        return this.keys[index];
    }

    /**
     * @param {number} time
     */
    isFinished(time)
    {
        if (this.#needsSort) this.sortKeys();
        if (this.keys.length <= 0) return true;
        return time > this.lastKey.time;
    }

    /**
     * @param {number} time
     */
    isStarted(time)
    {
        if (this.#needsSort) this.sortKeys();
        if (this.keys.length <= 0) return false;
        return time >= this.firstKey.time;
    }

    /**
     * @param {AnimKey} k
     * @param {undefined} [events]
     */
    remove(k, events)
    {
        for (let i = 0; i < this.keys.length; i++)
        {
            if (this.keys[i] == k)
            {
                this.emitEvent(Anim.EVENT_KEY_DELETE, this.keys[i]);
                this.keys.splice(i, 1);
                this.#needsSort = true;
                if (events === undefined)
                {
                    this.emitEvent(Anim.EVENT_CHANGE, this);
                }
                return;
            }
        }
    }

    get lastKey()
    {
        if (this.#needsSort) this.sortKeys();
        return this.keys[this.keys.length - 1];
    }

    get firstKey()
    {
        if (this.#needsSort) this.sortKeys();
        return this.keys[0];
    }

    /**
     * @param {number} time
     */
    getLoopIndex(time)
    {
        if (this.#needsSort) this.sortKeys();
        if (this.keys.length < 2) return 0;
        return (time - this.firstKey.time) / this.getLengthLoop();
    }

    /**
     * get value at time
     * @function getValue
     * @memberof Anim
     * @instance
     * @param {Number} [time] time
     * @returns {Number} interpolated value at time
     */
    getValue(time = 0)
    {

        let valAdd = 0;
        if (this.keys.length === 0) return 0;
        if (this.#needsSort) this.sortKeys();

        if (!this.loop && time > this.lastKey.time)
        {
            if (this.lastKey.cb && !this.lastKey.cbTriggered) this.lastKey.trigger();

            return this.lastKey.value;
        }

        if (time < this.firstKey.time) return this.keys[0].value;

        if (this.loop && this.keys.length > 1 && time > this.lastKey.time)
        {
            const currentLoop = this.getLoopIndex(time);
            if (currentLoop > this._timesLooped)
            {
                this._timesLooped++;
                if (this.onLooped) this.onLooped();
            }

            time = (time - this.firstKey.time) % (this.getLengthLoop());

            if (this.loop == Anim.LOOP_REPEAT) { }
            else if (this.loop == Anim.LOOP_MIRROR)
            {
                if (Math.floor(currentLoop) % 2 == 1)time = this.getLengthLoop() - time;
            }
            else if (this.loop == Anim.LOOP_OFFSET)
            {
                valAdd = (this.lastKey.value - this.keys[0].value) * Math.floor(currentLoop);
            }

            time += this.firstKey.time;
        }

        const index = this.getKeyIndex(time);
        if (index >= this.keys.length - 1)
        {
            if (this.lastKey.cb && !this.lastKey.cbTriggered) this.lastKey.trigger();
            return this.lastKey.value;
        }

        const index2 = index + 1;
        const key1 = this.keys[index];
        const key2 = this.keys[index2];

        if (key1.cb && !key1.cbTriggered) key1.trigger();

        if (!key2) return -1;

        const perc = (time - key1.time) / (key2.time - key1.time);

        if (key1.getEasing() == Anim.EASING_CLIP)
        {
            if (!key1.clip && this.port)
            {
                const patch = this.port.op.patch;
                const clip = patch.getVar(key1.clipId)?.getValue();
                if (clip) key1.clip = clip;
            }
            if (key1.clip && key1.clip.getValue)
            {
                return key1.clip.getValue(perc * key1.clip.getLength());
            }
            else
            {
                this.#log.warn("no clip found");
            }
        }

        return key1.ease(perc, key2) + valAdd;
    }

    /**
     * @param {AnimKey} k
     */
    addKey(k)
    {
        if (k.time === undefined)
        {
            this.#log.warn("key time undefined, ignoring!");
        }
        else
        {
            this.keys.push(k);
            if (this.onChange !== null) this.onChange();
            this.emitEvent(Anim.EVENT_CHANGE, this);
            this.#needsSort = true;
        }
    }

    sortSoon()
    {
        this.#needsSort = true;
    }

    /**
     * @param {string} str
     */
    easingFromString(str)
    {
        // todo smarter way to map ?
        if (str == "linear") return Anim.EASING_LINEAR;
        if (str == "absolute") return Anim.EASING_ABSOLUTE;
        if (str == "smoothstep") return Anim.EASING_SMOOTHSTEP;
        if (str == "smootherstep") return Anim.EASING_SMOOTHERSTEP;

        /* minimalcore:start */
        if (str == "Cubic In") return Anim.EASING_CUBIC_IN;
        if (str == "Cubic Out") return Anim.EASING_CUBIC_OUT;
        if (str == "Cubic In Out") return Anim.EASING_CUBIC_INOUT;

        if (str == "Expo In") return Anim.EASING_EXPO_IN;
        if (str == "Expo Out") return Anim.EASING_EXPO_OUT;
        if (str == "Expo In Out") return Anim.EASING_EXPO_INOUT;

        if (str == "Sin In") return Anim.EASING_SIN_IN;
        if (str == "Sin Out") return Anim.EASING_SIN_OUT;
        if (str == "Sin In Out") return Anim.EASING_SIN_INOUT;

        if (str == "Back In") return Anim.EASING_BACK_IN;
        if (str == "Back Out") return Anim.EASING_BACK_OUT;
        if (str == "Back In Out") return Anim.EASING_BACK_INOUT;

        if (str == "Elastic In") return Anim.EASING_ELASTIC_IN;
        if (str == "Elastic Out") return Anim.EASING_ELASTIC_OUT;

        if (str == "Bounce In") return Anim.EASING_BOUNCE_IN;
        if (str == "Bounce Out") return Anim.EASING_BOUNCE_OUT;

        if (str == "Quart Out") return Anim.EASING_QUART_OUT;
        if (str == "Quart In") return Anim.EASING_QUART_IN;
        if (str == "Quart In Out") return Anim.EASING_QUART_INOUT;

        if (str == "Quint Out") return Anim.EASING_QUINT_OUT;
        if (str == "Quint In") return Anim.EASING_QUINT_IN;
        if (str == "Quint In Out") return Anim.EASING_QUINT_INOUT;

        /* minimalcore:end */
        this.#log.warn("unknown anim easing?", str);
    }

    /**
     * @param {Op} op
     * @param {string} title
     * @param {function} cb
     * @returns {Port}
     */
    createPort(op, title, cb)
    {
        const port = op.inDropDown(title, Anim.EASINGNAMES, "linear");
        port.set("linear");
        port.defaultValue = 0;

        port.onChange = () =>
        {
            this.defaultEasing = this.easingFromString(port.get());
            this.emitEvent("onChangeDefaultEasing", this);

            if (cb) cb();
        };

        return port;
    }

    get tlActive()
    {
        return this.#tlActive;
    }

    set tlActive(b)
    {
        if (CABLES.UI)
        {
            this.#tlActive = b;
            window.gui.emitEvent("tlActiveChanged", this);
            this.forceChangeCallbackSoon();
        }
    }

    /**
     * @param {Object} o
     */
    setUiAttribs(o)
    {
        for (const i in o)
        {
            this.uiAttribs[i] = o[i];
            if (o[i] === null) delete this.uiAttribs[i];
        }

        this.emitEvent(Anim.EVENT_UIATTRIB_CHANGE);
    }

    /**
     * @param {number} t
     * @param {number} t2
     */
    hasKeyframesBetween(t, t2)
    {
        for (let i = 0; i < this.keys.length; i++)
            if (this.keys[i].time >= t && this.keys[i].time <= t2) return true;

        return false;
    }

    /**
     * @param {Patch} patch
     */
    static initClipsFromVars(patch)
    {
        for (const i in patch.missingClipAnims)
        {

            const v = patch.getVar(i);

            for (let j = 0; j < patch.missingClipAnims[i].length; j++)
            {
                patch.missingClipAnims[i].clip = v.getValue();
                delete patch.missingClipAnims[i];
            }

        }

    }
}

;// CONCATENATED MODULE: ./src/core/constants.js


const CONSTANTS = {
    "ANIM": {
        "EASINGS": Anim.EASINGNAMES,
        "EASING_LINEAR": 0,
        "EASING_ABSOLUTE": 1,
        "EASING_SMOOTHSTEP": 2,
        "EASING_SMOOTHERSTEP": 3,
        "EASING_CUBICSPLINE": 4,

        /* minimalcore:start */
        "EASING_CUBIC_IN": 5,
        "EASING_CUBIC_OUT": 6,
        "EASING_CUBIC_INOUT": 7,

        "EASING_EXPO_IN": 8,
        "EASING_EXPO_OUT": 9,
        "EASING_EXPO_INOUT": 10,

        "EASING_SIN_IN": 11,
        "EASING_SIN_OUT": 12,
        "EASING_SIN_INOUT": 13,

        "EASING_BACK_IN": 14,
        "EASING_BACK_OUT": 15,
        "EASING_BACK_INOUT": 16,

        "EASING_ELASTIC_IN": 17,
        "EASING_ELASTIC_OUT": 18,

        "EASING_BOUNCE_IN": 19,
        "EASING_BOUNCE_OUT": 21,

        "EASING_QUART_IN": 22,
        "EASING_QUART_OUT": 23,
        "EASING_QUART_INOUT": 24,

        "EASING_QUINT_IN": 25,
        "EASING_QUINT_OUT": 26,
        "EASING_QUINT_INOUT": 27,

        /* minimalcore:end */
        "EASING_CLIP": 28,
    },

    "OP": {
        "OP_PORT_TYPE_VALUE": 0,
        "OP_PORT_TYPE_NUMBER": 0,
        "OP_PORT_TYPE_FUNCTION": 1,
        "OP_PORT_TYPE_TRIGGER": 1,
        "OP_PORT_TYPE_OBJECT": 2,
        "OP_PORT_TYPE_TEXTURE": 2,
        "OP_PORT_TYPE_ARRAY": 3,
        "OP_PORT_TYPE_DYNAMIC": 4,
        "OP_PORT_TYPE_STRING": 5,

        "OP_VERSION_PREFIX": "_v",
    },

    "PORT": {
        "PORT_DIR_IN": 0,
        "PORT_DIR_OUT": 1,
    },

    "PACO": {
        "PACO_CLEAR": 0,
        "PACO_VALUECHANGE": 1,
        "PACO_OP_DELETE": 2,
        "PACO_UNLINK": 3,
        "PACO_LINK": 4,
        "PACO_LOAD": 5,
        "PACO_OP_CREATE": 6,
        "PACO_OP_ENABLE": 7,
        "PACO_OP_DISABLE": 8,
        "PACO_UIATTRIBS": 9,
        "PACO_VARIABLES": 10,
        "PACO_TRIGGERS": 11,
        "PACO_PORT_SETVARIABLE": 12,
        "PACO_PORT_SETANIMATED": 13,
        "PACO_PORT_ANIM_UPDATED": 14,
        "PACO_DESERIALIZE": 15,
        "PACO_OP_RELOAD": 16
    },
};

;// CONCATENATED MODULE: ./src/core/extendjs.js
/**
 * extend javascript functionality
 */

/**
 * @external Math
 */

/**
 * set random seed for seededRandom()
 * @type Number
 * @static
 */
Math.randomSeed = 1;

/**
 * @function external:Math#setRandomSeed
 * @param {number} seed
 */
Math.setRandomSeed = function (seed)
{
    // https://github.com/cables-gl/cables_docs/issues/622
    Math.randomSeed = seed * 50728129;
    if (seed != 0)
    {
        Math.randomSeed = Math.seededRandom() * 17624813;
        Math.randomSeed = Math.seededRandom() * 9737333;
    }
};

/**
 * generate a seeded random number
 * @function seededRandom
 * @memberof Math
 * @param {Number} max minimum possible random number
 * @param {Number} min maximum possible random number
 * @return {Number} random value
 * @static
 */
Math.seededRandom = function (max, min)
{
    if (Math.randomSeed === 0) Math.randomSeed = Math.random() * 999;
    max = max || 1;
    min = min || 0;

    Math.randomSeed = (Math.randomSeed * 9301 + 49297) % 233280;
    const rnd = Math.randomSeed / 233280.0;

    return min + rnd * (max - min);
};

/**
 * @namespace String
 */

/**
 * append a linebreak to a string
 * @this {String}
 * @returns {string} string with newline appended
*/
String.prototype.endl = function ()
{
    return this + "\n";
};

/* minimalcore:start */
String.prototype.contains = function (str)
{
    console.warn("string.contains deprecated, use string.includes"); // eslint-disable-line
    console.log((new Error()).stack); // eslint-disable-line
    return this.includes(str);
};

/* minimalcore:end */

/* minimalcore:start */
if (!window.requestIdleCallback)
{

    function shimIdleCb(cb, num)
    {
        return setTimeout(cb, num || 50);
    }

    function shimCancelIdleCb(to)
    {
        clearTimeout(to);
    }

    window.requestIdleCallback = shimIdleCb;
    window.cancelIdleCallback = shimCancelIdleCb;
}

/* minimalcore:end */

function extendJs() {}

;// CONCATENATED MODULE: ./src/core/utils.js
/**
 * @namespace external:CABLES#Utils
 */





extendJs();

/**
 * Merge two Float32Arrays.
 * @function float32Concat
 * @param {Float32Array} first Left-hand side array
 * @param {Float32Array} second Right-hand side array
 * @return {Float32Array}
 * @static
 */
function float32Concat(first, second)
{
    if (!(first instanceof Float32Array)) first = new Float32Array(first);
    if (!(second instanceof Float32Array)) second = new Float32Array(second);

    const result = new Float32Array(first.length + second.length);

    result.set(first);
    result.set(second, first.length);

    return result;
}

/**
 * get op shortname: only last part of fullname and without version
 * @function getShortOpName
 * @memberof CABLES
 * @param {string} fullname full op name
 * @static
 */
const getShortOpName = function (fullname)
{
    let name = fullname.split(".")[fullname.split(".").length - 1];

    if (name.includes(CONSTANTS.OP.OP_VERSION_PREFIX))
    {
        const n = name.split(CONSTANTS.OP.OP_VERSION_PREFIX)[1];
        name = name.substring(0, name.length - (CONSTANTS.OP.OP_VERSION_PREFIX + n).length);
    }
    return name;
};

/**
 * randomize order of an array
 * @function shuffleArray
 * @param {Array|Float32Array} array {Array} original
 * @return {Array|Float32Array} shuffled array
 * @static
 */
/* minimalcore:start */
const shuffleArray = function (array)
{
    for (let i = array.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.seededRandom() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

/* minimalcore:end */

/**
 * generate a short "relativly unique" id
 * @function shortId
 * @return {String} generated ID
 * @static
 */
// WARNING this is slow when done alot !!!
const _shortIds = {};
const shortId = function ()
{
    let str = Math.random().toString(36).substr(2, 9);

    if (_shortIds.hasOwnProperty(str)) str = shortId();
    _shortIds[str] = true;
    return str;
};

/**
 * @typedef {String} UUID
*/

/**
 * generate a UUID
 * @function uuid
 * @return {UUID} generated UUID
 * @static
 */
const uuid = helper.uuid;
const generateUUID = uuid;
const isNumeric = helper.isNumeric;

/* minimalcore:start */
function cleanJson(obj)
{
    for (const i in obj)
    {
        if (obj[i] && typeof objValue === "object" && obj[i].constructor === Object) obj[i] = cleanJson(obj[i]);

        if (obj[i] === null || obj[i] === undefined) delete obj[i];
        else if (Array.isArray(obj[i]) && obj[i].length == 0) delete obj[i];
    }

    return obj;
}

/* minimalcore:end */
/**
 * @see http://stackoverflow.com/q/7616461/940217
 * @param {string} str
 * @param {string} prefix
 * @return {string}
 */
const prefixedHash = function (str, prefix = "id")
{
    let hash = 0;
    if (str.length > 0)
    {
        for (let i = 0; i < str.length; i++)
        {
            let character = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + character;
            hash &= hash; // Convert to 32bit integer
        }
    }
    return prefix + "" + hash;
};

/**
 * generate a simple ID
 * @return {Number} new id
 * @static
 */
let simpleIdCounter = 0;
const simpleId = function ()
{
    simpleIdCounter++;
    return simpleIdCounter;
};

/**
 * smoothStep a value
 * @param {Number} perc value value to be smoothed [0-1]
 * @return {Number} smoothed value
 * @static
 */
const smoothStep = function (perc)
{
    const x = Math.max(0, Math.min(1, (perc - 0) / (1 - 0)));
    perc = x * x * (3 - 2 * x); // smoothstep
    return perc;
};

/**
 * smootherstep a value
 * @param {Number} perc value to be smoothed [0-1]
 * @return {Number} smoothed value
 * @static
 */
const smootherStep = function (perc)
{
    const x = Math.max(0, Math.min(1, (perc - 0) / (1 - 0)));
    perc = x * x * x * (x * (x * 6 - 15) + 10); // smootherstep
    return perc;
};

/**
 * clamp number / make sure its between min/max
 * @param {Number} value value to be mapped
 * @param {Number} min minimum value
 * @param {Number} max maximum value
 * @static
 */
const clamp = function (value, min, max)
{
    return Math.min(Math.max(value, min), max);
};

/**
 * map a value in a range to a value in another range
 * @param {Number} x value to be mapped
 * @param {Number} _oldMin old range minimum value
 * @param {Number} _oldMax old range maximum value
 * @param {Number} _newMin new range minimum value
 * @param {Number} _newMax new range maximum value
 * @param {Number} _easing
 * @param {Boolean} clampval
 * @return {Number} mapped value
 * @static
 */
const map = function (x, _oldMin, _oldMax, _newMin, _newMax, _easing = 0, clampval = true)
{
    if (clampval)
    {
        if (x >= _oldMax) return _newMax;
        if (x <= _oldMin) return _newMin;
    }

    let reverseInput = false;
    const oldMin = Math.min(_oldMin, _oldMax);
    const oldMax = Math.max(_oldMin, _oldMax);
    if (oldMin != _oldMin) reverseInput = true;

    let reverseOutput = false;
    const newMin = Math.min(_newMin, _newMax);
    const newMax = Math.max(_newMin, _newMax);
    if (newMin != _newMin) reverseOutput = true;

    let portion = 0;
    let r = 0;

    if (reverseInput) portion = ((oldMax - x) * (newMax - newMin)) / (oldMax - oldMin);
    else portion = ((x - oldMin) * (newMax - newMin)) / (oldMax - oldMin);

    if (reverseOutput) r = newMax - portion;
    else r = portion + newMin;

    if (!_easing) return r;
    if (_easing == 1)
    {
        // smoothstep
        x = Math.max(0, Math.min(1, (r - _newMin) / (_newMax - _newMin)));
        return _newMin + x * x * (3 - 2 * x) * (_newMax - _newMin);
    }
    if (_easing == 2)
    {
        // smootherstep
        x = Math.max(0, Math.min(1, (r - _newMin) / (_newMax - _newMin)));
        return _newMin + x * x * x * (x * (x * 6 - 15) + 10) * (_newMax - _newMin);
    }

    return r;
};

// ----------------------------------------------------------------

/**
 * append a unique/random parameter to a url, so the browser is forced to reload the file, even if its cached
 * @static
 * @param {String} url The url to append the cachebuster parameter to.
 * @return {String} url with cachebuster parameter
 */
/* minimalcore:start */
const cacheBust = function (url = "")
{
    if (!url) return "";
    if (url.startsWith("data:")) return;
    if (url.includes("?")) url += "&";
    else url += "?";
    return url + "cache=" + CABLES.uuid();
};

/* minimalcore:end */

/**
 * copy the content of an array
 * @static
 * @param {Array} src sourceArray
 * @param {Array} dst optional
 * @return {Array} dst
 */
const copyArray = function (src, dst)
{
    if (!src) return null;
    dst = dst || [];
    dst.length = src.length;
    for (let i = 0; i < src.length; i++)
        dst[i] = src[i];

    return dst;
};

/**
 * return the filename part of a url without extension
 * @static
 * @param {String} url
 * @return {String} just the filename
 */
const basename = function (url)
{
    let name = CABLES.filename(url);

    const parts2 = name.split(".");
    name = parts2[0];

    return name;
};

/**
 * output a stacktrace to the console
 * @static
 */
const logStack = function ()
{
    // eslint-disable-next-line
    console.log("logstack", (new Error()).stack);
};

/**
 * return the filename part of a url
 * @static
 * @param {String} url
 * @return {String} just the filename
 */
const filename = function (url)
{
    let name = "";
    if (!url) return "";

    if (url.startsWith("data:") && url.includes(":"))
    {
        const parts = url.split(",");
        return parts[0];
    }

    let parts = (url + "").split("/");
    if (parts.length > 0)
    {
        const str = parts[parts.length - 1];
        let parts2 = str.split("?");
        name = parts2[0];
    }

    return name || "";
};

/* minimalcore:start */
/**
 * make an ajax request
 * @static
 * @function ajax
 * @param {string} url
 * @param {function} cb
 * @param {string} method
 * @param {null} post
 * @param {null} contenttype
 * @param {boolean} jsonP
 * @param {object} headers
 * @param {object} options
 */
function ajax(url, cb, method, post, contenttype, jsonP, headers = {}, options = {})
{
    const requestOptions = {
        "url": url,
        "cb": cb,
        "method": method,
        "data": post,
        "contenttype": contenttype,
        "sync": false,
        "jsonP": jsonP,
        "headers": headers,
    };
    if (options && options.credentials) requestOptions.credentials = options.credentials;
    request(requestOptions);
}

function request(options)
{
    if (!options.hasOwnProperty("asynch")) options.asynch = true;

    let xhr;
    try
    {
        xhr = new XMLHttpRequest();
    }
    catch (e) {}

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState != 4) return;

        if (options.cb)
        {
            if (xhr.status == 200 || xhr.status == 0) options.cb(false, xhr.responseText, xhr);
            else options.cb(true, xhr.responseText, xhr);
        }
    };

    try
    {
        xhr.open(options.method ? options.method.toUpperCase() : "GET", options.url, !options.sync);
    }
    catch (e)
    {
        if (options.cb && e) options.cb(true, e.msg, xhr);
    }

    if (typeof options.headers === "object")
    {
        if (options.headers)
        {
            const keys = Object.keys(options.headers);
            for (let i = 0; i < keys.length; i++)
            {
                const name = keys[i];
                const value = options.headers[name];
                xhr.setRequestHeader(name, value);
            }
        }
    }

    if (options.credentials && options.credentials !== "omit")
    {
        xhr.withCredentials = true;
    }

    try
    {
        if (!options.post && !options.data)
        {
            xhr.send();
        }
        else
        {
            xhr.setRequestHeader(
                "Content-type",
                options.contenttype ? options.contenttype : "application/x-www-form-urlencoded",
            );
            xhr.send(options.data || options.post);
        }
    }
    catch (e)
    {
        if (options.cb) options.cb(true, e.msg, xhr);
    }
}

/* minimalcore:end */
// ----------------------------------------------------------------

const logErrorConsole = function (initiator)
{
    CABLES.errorConsole = CABLES.errorConsole || { "log": [] };
    CABLES.errorConsole.log.push({ "initiator": initiator, "arguments": arguments });

    if (!CABLES.errorConsole.ele)
    {
        const ele = document.createElement("div");
        ele.id = "cablesErrorConsole";
        ele.style.width = "90%";
        ele.style.height = "300px";
        ele.style.zIndex = "9999999";
        ele.style.display = "inline-block";
        ele.style.position = "absolute";
        ele.style.padding = "10px";
        ele.style.fontFamily = "monospace";
        ele.style.color = "red";
        ele.style.backgroundColor = "#200";

        CABLES.errorConsole.ele = ele;
        document.body.appendChild(ele);
    }

    let logHtml = "ERROR<br/>for more info, open your browsers dev tools console (Ctrl+Shift+I or Command+Alt+I)<br/>";

    for (let l = 0; l < CABLES.errorConsole.log.length; l++)
    {
        logHtml += CABLES.errorConsole.log[l].initiator + " ";
        for (let i = 1; i < CABLES.errorConsole.log[l].arguments.length; i++)
        {
            if (i > 2)logHtml += ", ";
            let arg = CABLES.errorConsole.log[l].arguments[i];
            if (arg.constructor.name.indexOf("Error") > -1 || arg.constructor.name.indexOf("error") > -1)
            {
                let txt = "Uncaught ErrorEvent ";
                if (arg.message)txt += " message: " + arg.message;
                logHtml += txt;
            }
            else if (typeof arg == "string")
                logHtml += arg;
            else if (typeof arg == "number")
                logHtml += String(arg) + " ";
        }
        logHtml += "<br/>";
    }

    CABLES.errorConsole.ele.innerHTML = logHtml;
};

/**
 * @param {Array<any>} arr
 */
function uniqueArray(arr)
{
    const u = {}, a = [];
    for (let i = 0, l = arr.length; i < l; ++i)
    {
        if (!u.hasOwnProperty(arr[i]))
        {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
}

const htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
};

/** Used to match HTML entities and HTML characters. */
const reUnescapedHtml = /[&<>"']/g;
const reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

// from https://github.com/lodash/lodash/blob/master/escape.js
/*  eslint-disable */
const escapeHTML = function(string)
{
    return string && reHasUnescapedHtml.test(string) ?
        string.replace(reUnescapedHtml, function(chr) { return htmlEscapes[chr]; })
        : string || "";
}
/* eslint-enable */

/**
 * @param {string} idleTo
 * @param {function} cb
 */
function idleCallbackSoon(idleTo, cb)
{
    if (idleTo)clearTimeout(idleTo);
    const idleToNew = setTimeout(() =>
    {
        // idleTo = null;

        // requestIdleCallback(cb);
        cb();

    }, 30);
    return idleToNew;

}

/**
 * @param {function} cb
 */
function idleCallback(cb)
{

    const idleToNew = setTimeout(() =>
    {
        cb();

    }, 30);
}

/**
 * @param {Object} o
 */
function cloneObject(o)
{
    try
    {
        return structuredClone(o);
    }
    catch (e)
    {
        return JSON.parse(JSON.stringify(o));
    }
}

;// CONCATENATED MODULE: ./src/core/core_port.js








/**
 * @typedef PortUiAttribs
 * @property  {String} [title] overwrite title of port (by default this is portname)
 * @property  {String} [display] how the port is displayed and interacted in the paramerer panel
 * @property  {Boolean} [greyout] port paramater will appear greyed out, can not be
 * @property  {Boolean} [hidePort] port will be hidden from op
 * @property  {Boolean} [hideParam] port params will be hidden from parameter panel
 * @property  {Boolean} [showIndex] only for dropdowns - show value index (e.g. `0 - normal` )
 * @property  {String} [editorSyntax] set syntax highlighting theme for editor port
 * @property  {Boolean} [ignoreObjTypeErrors] do not auto check object types
 * @property  {string} [group] do not set manually - group ports, usually set by op.setPortGroup...
 * @property  {Boolean} [isAnimated] internal: do not set manually
 * @property  {Boolean} [useVariable] internal: do not set manually
 * @property  {string} [variableName] internal: do not set manually
 * @property  {Number} [order] internal: do not set manually
 * @property  {Number} [stride] internal: do not set manually
 * @property  {Boolean} [expose] internal: do not set manually
 * @property  {String} [increment] internal: do not set manually
 * @property  {PortUiAttribsDisplay} display internal: do not set manually
 * @property  {String} [axis] internal: do not set manually
 * @property  {String} [type] internal: do not set manually
 * @property  {String} [objType] internal: do not set manually
 * @property  {String} [filter] internal: do not set manually
 * @property  {boolean} [hideFormatButton] internal: do not set manually
 * @property  {boolean} [editShortcut] internal: do not set manually
 * @property  {String} [filter] internal: do not set manually
 * @property  {boolean} [preview] internal: do not set manually
 * @property  {boolean} [colorPick] internal: do not set manually
 * @property  {Array<String>} [values] internal: do not set manually
 * @property  {boolean} [boundToVar] internal: do not set manually
 * @property  {boolean} [addPort] internal: do not set manually
 * @property  {boolean} [notWorking] internal: do not set manually
 * @property  {number} [glPortIndex] internal: do not set manually
 * @property  {boolean} [readOnly] internal: do not set manually
 * @property  {Boolean} [multiPortManual] internal: do not set manually
 * @property  {Number} [multiPortNum] internal: do not set manually
 * @property  {boolean} [multiPort] internal: do not set manually
 * @property  {number} [longPort]
 * @property  {boolean} [tlDrawKeys]
 * @property  {number} [tlEase] default easing when animating parameter
 * @property  {boolean} [hover]
*/

/**
 * data is coming into and out of ops through input and output ports
 * @namespace external:CABLES#Port
 * @module Port
 * @class
 * @example
 * const myPort=op.inString("String Port");
 */
class Port extends Events
{
    static DIR_IN = 0;
    static DIR_OUT = 1;

    static TYPE_VALUE = 0;
    static TYPE_NUMBER = 0;
    static TYPE_FUNCTION = 1;
    static TYPE_TRIGGER = 1;
    static TYPE_OBJECT = 2;
    static TYPE_TEXTURE = 2;
    static TYPE_ARRAY = 3;
    static TYPE_DYNAMIC = 4;
    static TYPE_STRING = 5;

    static EVENT_UIATTRCHANGE = "onUiAttrChange";
    static EVENT_VALUE_CHANGE = "change";

    static EVENT_LINK_CHANGED = "onLinkChanged";
    static EVENT_LINK_REMOVED = "onLinkRemoved";

    #log = new Logger("core_port");
    #oldAnimVal = -5711;

    animMuted = false;

    lastAnimTime = 0;
    #uiActiveState = true;
    #valueBeforeLink = null;
    #animated = false;
    #useVariableName = null;

    /** @type {Op} */
    #op = null;
    tempData = {};

    /**
     * @param {Op} ___op
     * @param {string} name
     * @param {number} type
     * @param {PortUiAttribs} uiAttribs
     */
    constructor(___op, name, type, uiAttribs = {})
    {
        super();
        this.data = {}; // UNUSED, DEPRECATED, only left in for backwards compatibility with userops

        /**
         * @type {Number}
         * @description direction of port (input(0) or output(1))
         */
        this.direction = Port.DIR_IN;
        this.id = String(CABLES.simpleId());

        /** @type {Op} */
        this.#op = ___op;

        /** @type {Array<Link>} */
        this.links = [];

        /** @type {any} */
        this.value = 0.0;

        this.name = name;

        /** @type {number} */
        this.type = type || Port.TYPE_VALUE;

        /** @type {PortUiAttribs} */
        this.uiAttribs = uiAttribs || {};

        /** @type {Anim} */
        this.anim = null;

        this.defaultValue = null;

        this.ignoreValueSerialize = false;
        this.onLinkChanged = null;
        this.crashed = false;

        this.onValueChanged = null;
        this.onTriggered = null;
        this.changeAlways = false;
        this.forceRefChange = false;

        this.activityCounter = 0;
        this.apf = 0;
        this.activityCounterStartFrame = 0;

        this.canLink = null; // function can be overwritten
        this.preserveLinks = null;
        this.indexPort = null;
    }

    get parent()
    {
        this.#log.stack("use port.op, not .parent");
        return this.op;
    }

    get title()
    {
        return this.uiAttribs.title || this.name;
    }

    get op()
    {
        return this.#op;
    }

    get val()
    {
        return this.get();
    }

    set val(v)
    {
        this.setValue(v);
    }

    /**
     * copy over a uiattrib from an external connected port to another port
     * @param {string} which attrib name
     * @param {Port} port source port
     * @example
     *
     *  inArray.onLinkChanged=()=>
     *  {
     *      if(inArray) inArray.copyLinkedUiAttrib("stride", outArray);
     *  };
     *
     */
    copyLinkedUiAttrib(which, port)
    {

        /* minimalcore:start */
        if (!CABLES.UI) return;
        if (!this.isLinked()) return;

        const attr = {};
        attr[which] = this.links[0].getOtherPort(this).getUiAttrib(which);
        port.setUiAttribs(attr);

    /* minimalcore:end */
    }

    /*
     * TODO make extend class for ports, like for ops only for ui
     */
    getValueForDisplay()
    {

        /* minimalcore:start */
        let str = this.value;

        if (typeof this.value === "string" || this.value instanceof String)
        {
            if (str.length > 1000)
            {
                str = str.substring(0, 999);
                str += "...";
            }
            if (this.uiAttribs && (this.uiAttribs.display == "boolnum"))
            {
                str += " - ";

                if (!this.value) str += "false";
                else str += "true";
            }

            str = str.replace(/[\u00A0-\u9999<>&]/g, function (/** @type {String} */ i)
            {
                return "&#" + i.charCodeAt(0) + ";";
            });

            if (str.length > 100) str = str.substring(0, 100);
        }
        else
        {
            str = String(this.value);
        }
        return str;

    /* minimalcore:end */
    }

    /**
     * change listener for input value ports, overwrite to react to changes
     * @example
     * const myPort=op.inString("MyPort");
     * myPort.onChange=function()
     * {
     *   console.log("was changed to: ",myPort.get());
     * }
     *
     */
    onAnimToggle() {}

    _onAnimToggle()
    {
        this.onAnimToggle();
    }

    /**
     * @description remove port
     */
    remove()
    {
        this.removeLinks();
        this.#op.removePort(this);
    }

    /**
     * set ui attributes
     * @param {PortUiAttribs} newAttribs
     * @example
     * myPort.setUiAttribs({greyout:true});
     */
    setUiAttribs(newAttribs)
    {

        /* minimalcore:start */
        let changed = false;
        if (!this.uiAttribs) this.uiAttribs = {};

        for (const p in newAttribs)
        {
            if (newAttribs[p] === undefined)
            {
                delete this.uiAttribs[p];
                continue;
            }
            if (this.uiAttribs[p] != newAttribs[p]) changed = true;
            this.uiAttribs[p] = newAttribs[p];

            if (p == "group" && this.indexPort) this.indexPort.setUiAttribs({ "group": newAttribs[p] });
        }

        if (newAttribs.hasOwnProperty("expose")) this.#op.patch.emitEvent("subpatchExpose", this.#op.uiAttribs.subPatch);

        if (changed) this.emitEvent(Port.EVENT_UIATTRCHANGE, newAttribs, this);

    /* minimalcore:end */
    }

    /**
     * get ui attributes
     * @example
     * myPort.getUiAttribs();
     */
    getUiAttribs()
    {
        return this.uiAttribs;
    }

    /**
     * get ui attribute
     * @param {String} attribName
     * <pre>
     * attribName - return value of the ui-attribute, or null on unknown attribute
     * </pre>
     * @example
     * myPort.setUiAttribs("values");
     */
    getUiAttrib(attribName)
    {

        /* minimalcore:start */
        if (!this.uiAttribs || !this.uiAttribs.hasOwnProperty(attribName)) return null;
        return this.uiAttribs[attribName];

    /* minimalcore:end */
    }

    /**
     * @description get value of port
     */
    get()
    {
        if (CABLES.UI && this.#animated && this.lastAnimTime == this.#op.patch.timer.getTime() && !CABLES.UI.keyframeAutoCreate)
        {
            return this.value;
        }
        if (!this.animMuted && this.#animated && this.lastAnimFrame != this.#op.patch.getFrameNum())
        {
            this.lastAnimTime = this.#op.patch.timer.getTime();
            this.lastAnimFrame = this.#op.patch.getFrameNum();

            let animval = this.anim.getValue(this.#op.patch.timer.getTime());

            if (this.value != animval)
            {
                this.value = animval;
                this.#oldAnimVal = this.value;
                this.forceChange();
            }
        }

        return this.value;
    }

    /**
     * @description set value of port / will send value to all linked ports (only for output ports)
     * @param {string | number | boolean | any[]} v
     */
    set(v)
    {
        this.setValue(v);
    }

    /**
     * @param {object|array} v
     */
    setRef(v)
    {
        this.forceRefChange = true;
        this.setValue(v);
    }

    /**
     * @param {string|boolean|number} v
     */
    setValue(v)
    {
        if (v === undefined) v = null;

        if (CABLES.UI && CABLES.UI.showDevInfos)
        {
            CABLES.UI.countSetWarns = CABLES.UI.countSetWarns || 0;
            if (CABLES.UI.countSetWarns < 20 && this.direction == CONSTANTS.PORT.PORT_DIR_OUT && this.type == Port.TYPE_OBJECT && v && !this.forceRefChange)
            {
                this.#log.warn("object port [" + this.name + "] uses .set [" + this.op.objName + "]");

                CABLES.UI.countSetWarns++;
            }
        }

        if (this.#op.enabled && !this.crashed)
        {
            if (v !== this.value || this.changeAlways || this.type == Port.TYPE_TEXTURE || this.type == Port.TYPE_ARRAY)
            {
                if (CABLES.UI && this.#animated)
                {
                    CABLES.UI.PREVISKEYVAL = null;
                    if (!CABLES.UI.keyframeAutoCreate) CABLES.UI.PREVISKEYVAL = v;
                }

                if (CABLES.UI && this.#animated && CABLES.UI.keyframeAutoCreate)
                {
                    let t = this.#op.patch.timer.getTime();
                    if (CABLES.UI && CABLES.Patch.getGui().glTimeline) CABLES.Patch.getGui().glTimeline.createKey(this.anim, t, v);
                    else this.anim.setValue(t, v);
                }
                else
                {
                    try
                    {
                        this.value = v;
                        this.forceChange();
                    }
                    catch (ex)
                    {
                        this.crashed = true;

                        this.setValue = function (_v) {};
                        this.onTriggered = function () {};

                        this.#log.error("exception in ", this.#op);
                        this.#log.error(ex);

                        this.#op.patch.emitEvent("exception", ex, this.#op);
                    }

                    if (this.#op && this.#op.patch && this.#op.patch.isEditorMode() && this.type == Port.TYPE_TEXTURE)CABLES.Patch.getGui().texturePreview().updateTexturePort(this);
                }

                if (this.direction == CONSTANTS.PORT.PORT_DIR_OUT) for (let i = 0; i < this.links.length; ++i) this.links[i].setValue();
            }
        }
    }

    updateAnim()
    {
        if (!this.#animated || this.animMuted) return;
        this.value = this.get();

        if (this.#oldAnimVal != this.value || this.changeAlways)
        {
            this.#oldAnimVal = this.value;
            this.forceChange();
        }

        this.#oldAnimVal = this.value;
    }

    forceChange()
    {
        if (this.onValueChanged || this.onChange)
        {

        /*
         * very temporary: deprecated warning!!!!!!!!!
         * if(params.length>0) this._log.warn('TOM: port has onchange params!',this._op.objName,this.name);
         */
        }
        this._activity();
        this.emitEvent(Port.EVENT_VALUE_CHANGE, this.value, this);

        if (this.onChange) this.onChange(this, this.value);
        else if (this.onValueChanged) this.onValueChanged(this, this.value); // deprecated
    }

    /**
     * @description get port type as string, e.g. "Function","Value"...
     * @return {String} type
     */
    getTypeString()
    {
        return Port.getTypeString(this.type);
    }

    /**
     * @param {Object} objPort
     */
    deSerializeSettings(objPort)
    {
        if (!objPort) return;
        if (objPort.animated) this.setAnimated(objPort.animated);
        if (objPort.useVariable) this.setVariableName(objPort.useVariable);

        /* minimalcore:start */
        if (objPort.title) this.setUiAttribs({ "title": objPort.title });
        if (objPort.expose) this.setUiAttribs({ "expose": true });
        if (objPort.order) this.setUiAttribs({ "order": objPort.order });

        /* minimalcore:end */

        if (objPort.multiPortManual) this.setUiAttribs({ "multiPortManual": objPort.multiPortManual });
        if (objPort.multiPortNum) this.setUiAttribs({ "multiPortNum": objPort.multiPortNum });

        if (objPort.anim)
        {
            if (!this.anim) this.anim = new Anim({ "name": "port " + this.name });
            this.#op.hasAnimPort = true;
            this.anim.port = this;

            this.anim.deserialize(objPort.anim, true, this.op.patch.clipAnims);
            this.#op.patch.emitEvent("portAnimUpdated", this.#op, this, this.anim);

            this.bindAnimListeners();
            this.anim.sortKeys();
        }
    }

    /**
     * @param {any} v
     */
    setInitialValue(v)
    {
        if (this.op.preservedPortLinks[this.name])
        {
            for (let i = 0; i < this.op.preservedPortLinks[this.name].length; i++)
            {
                const lobj = this.op.preservedPortLinks[this.name][i];
                this.op.patch._addLink(
                    lobj.objIn,
                    lobj.objOut,
                    lobj.portIn,
                    lobj.portOut);
            }
        }

        if (this.op.preservedPortValues && this.op.preservedPortValues.hasOwnProperty(this.name) && this.op.preservedPortValues[this.name] !== undefined)
        {
            this.set(this.op.preservedPortValues[this.name]);
        }
        else
        if (v !== undefined) this.set(v);
        if (v !== undefined) this.defaultValue = v;
    }

    getSerialized()
    {

        /* minimalcore:start */
        let obj = { "name": this.getName() };

        if (!this.ignoreValueSerialize && this.links.length === 0)
        {
            if (this.type == Port.TYPE_OBJECT && this.value && this.value.tex) {}
            else obj.value = this.value;
        }
        if (this.#useVariableName) obj.useVariable = this.#useVariableName;
        if (this.#animated) obj.animated = true;
        if (this.anim) obj.anim = this.anim.getSerialized();
        if (this.uiAttribs.multiPortNum) obj.multiPortNum = this.uiAttribs.multiPortNum;
        if (this.uiAttribs.multiPortManual) obj.multiPortManual = this.uiAttribs.multiPortManual;

        if (this.uiAttribs.display == "file") obj.display = this.uiAttribs.display;
        if (this.uiAttribs.expose)
        {
            obj.expose = true;
            if (this.uiAttribs.hasOwnProperty("order")) obj.order = this.uiAttribs.order;
        }
        if (this.uiAttribs.title) obj.title = this.uiAttribs.title;
        if ((this.preserveLinks || this.direction == CONSTANTS.PORT.PORT_DIR_OUT) && this.links.length > 0)
        {
            obj.links = [];
            for (const i in this.links)
            {
                if (!this.links[i].ignoreInSerialize && (this.links[i].portIn && this.links[i].portOut)) obj.links.push(this.links[i].getSerialized());
            }
        }

        if (this.direction == Port.DIR_IN && this.links.length > 0)
        {
            for (const i in this.links)
            {
                if (!this.links[i].portIn || !this.links[i].portOut) continue;

                const otherp = this.links[i].getOtherPort(this);
                // check if functions exist, are defined in core_extend_ops code in ui
                if (otherp.op.isInBlueprint2 && this.op.isInBlueprint2)
                {
                    if (otherp.op.isInBlueprint2() && !this.op.isInBlueprint2())
                    {
                        obj.links = obj.links || [];
                        obj.links.push(this.links[i].getSerialized());
                    }
                }
            }
        }

        if (obj.links && obj.links.length == 0) delete obj.links;
        if (this.type === Port.TYPE_FUNCTION) delete obj.value;
        if (this.type === Port.TYPE_FUNCTION && this.links.length == 0) obj = null;
        if (obj && Object.keys(obj).length == 1 && obj.name)obj = null; // obj is null if there is no real information other than name

        cleanJson(obj);

        return obj;

        /* minimalcore:end */
    }

    /**
     * will be overwritten in ui
     * @param {Port} port1
     * @param {Port} port2
     * @returns {boolean}
     */
    shouldLink(port1, port2)
    {
        return !!(port1 && port2);
    }

    /**
     * @description remove all links from port
     */
    removeLinks()
    {
        let count = 0;
        while (this.links.length > 0)
        {
            count++;

            /* minimalcore:start */
            if (count > 5000)
            {
                this.#log.warn("could not delete links... / infinite loop");
                this.links.length = 0;
                break;
            }

            /* minimalcore:end */
            this.links[0].remove();
            this.op.patch.emitEvent("onPortUnlink", this);
        }
    }

    /**
     * @description remove all link from port
     * @param {Link} link
     */
    removeLink(link)
    {
        for (let i = 0; i < this.links.length; i++)
            if (this.links[i] == link)
                this.links.splice(i, 1);

        if (this.direction == Port.DIR_IN)
        {
            if (this.type == Port.TYPE_VALUE) this.setValue(this.#valueBeforeLink || 0);
            else this.setValue(this.#valueBeforeLink || null);
        }

        /* minimalcore:start */
        if (CABLES.UI && this.#op.checkLinkTimeWarnings) this.#op.checkLinkTimeWarnings();

        /* minimalcore:end */

        try
        {
            if (this.onLinkChanged) this.onLinkChanged();
            this.emitEvent(Port.EVENT_LINK_CHANGED);
            this.emitEvent(Port.EVENT_LINK_REMOVED);
            this.#op.emitEvent(Port.EVENT_LINK_CHANGED);
            this.op.patch.emitEvent("onPortUnlink", this);
        }
        catch (e)
        {
            this.#log.error(e);
        }
    }

    /**
     * @description return port name
     */
    getName()
    {
        return this.name;
    }

    /**
     * @description return port name or title
     */
    getTitle()
    {
        if (this.uiAttribs.title) return this.uiAttribs.title;
        return this.name;
    }

    /**
     * @param {Link} l
     */
    addLink(l)
    {
        this.#valueBeforeLink = this.value;
        this.links.push(l);

        /* minimalcore:start */
        if (CABLES.UI && this.#op.checkLinkTimeWarnings) this.#op.checkLinkTimeWarnings();

        /* minimalcore:end */

        try
        {
            if (this.onLinkChanged) this.onLinkChanged();
            this.emitEvent(Port.EVENT_LINK_CHANGED);
            this.#op.emitEvent(Port.EVENT_LINK_CHANGED);
        }
        catch (e)
        {
            this.#log.error(e);
        }
    }

    /**
     * @param {Port} p2 otherPort
     * @description return link, which is linked to otherPort
     */
    getLinkTo(p2)
    {
        for (const i in this.links) if (this.links[i].portIn == p2 || this.links[i].portOut == p2) return this.links[i];
    }

    /**
     * @param {Port} p2 otherPort
     * @description removes link, which is linked to otherPort
     */
    removeLinkTo(p2)
    {
        for (const i in this.links)
        {
            if (this.links[i].portIn == p2 || this.links[i].portOut == p2)
            {
                this.links[i].remove();

                /* minimalcore:start */
                if (CABLES.UI && this.#op.checkLinkTimeWarnings) this.#op.checkLinkTimeWarnings();

                /* minimalcore:end */

                if (this.onLinkChanged) this.onLinkChanged();
                this.emitEvent(Port.EVENT_LINK_CHANGED);
                this.emitEvent(Port.EVENT_LINK_REMOVED);
                this.op.patch.emitEvent("onPortUnlink", this);
                return;
            }
        }
    }

    /**
     * @param {Port} p2 otherPort
     * @description returns true if port is linked to otherPort
     */
    isLinkedTo(p2)
    {
        for (const i in this.links) if (this.links[i].portIn == p2 || this.links[i].portOut == p2) return true;

        return false;
    }

    _activity()
    {
        this.activityCounter++;
    }

    /**
     * @description trigger the linked port (usually invoked on an output function port)
     */
    trigger()
    {
        const linksLength = this.links.length;

        this._activity();
        if (linksLength === 0) return;
        if (!this.#op.enabled) return;

        let portTriggered = null;
        try
        {
            for (let i = 0; i < linksLength; ++i)
            {
                if (this.links[i].portIn)
                {
                    portTriggered = this.links[i].portIn;

                    portTriggered.op.patch.pushTriggerStack(portTriggered);
                    if (!portTriggered._onTriggered)
                    {
                        this.#log.log("no porttriggered?!", portTriggered, portTriggered._onTriggered); // eslint-disable-line
                    }
                    else
                        portTriggered._onTriggered();

                    portTriggered.op.patch.popTriggerStack();
                }
                if (this.links[i]) this.links[i].activity();
            }
        }
        catch (ex)
        {
            if (!portTriggered) return this.#log.error("unknown port error");

            /* minimalcore:start */
            portTriggered.op.enabled = false;
            portTriggered.op.setUiError("crash", "op crashed, port exception " + portTriggered.name, 3);

            if (this.#op.patch.isEditorMode())
            {
                if (portTriggered.op.onError) portTriggered.op.onError(ex);
            }

            /* minimalcore:end */
            this.#log.error("exception in port: ", portTriggered.name, portTriggered.op.name, portTriggered.op.id);
            this.#log.error(ex);
        }
    }

    /* minimalcore:start */
    call()
    {
        this.#log.warn("call deprecated - use trigger() ");
        this.trigger();
    }

    /* minimalcore:end */

    execute()
    {
    }

    /**
     * @param {string} n
     */
    setVariableName(n)
    {
        this.#useVariableName = n;

        this.#op.patch.on("variableRename", (oldname, newname) =>
        {
            if (oldname != this.#useVariableName) return;
            this.#useVariableName = newname;
        });
    }

    getVariableName()
    {
        return this.#useVariableName;
    }

    /**
     * @param {String} varName
     */
    setVariable(varName)
    {
        this.setAnimated(false);
        const attr = { "useVariable": false };

        if (this._variableIn && this._varChangeListenerId)
        {
            this._variableIn.off(this._varChangeListenerId);
            this._variableIn = null;
        }

        if (varName)
        {
            this._variableIn = this.#op.patch.getVar(varName);

            if (!this._variableIn)
            {
                // this._log.warn("PORT VAR NOT FOUND!!!", v);
            }
            else
            {
                if (this.type == Port.TYPE_OBJECT)
                {
                    this._varChangeListenerId = this._variableIn.on("change", () => { this.set(null); this.set(this._variableIn.getValue()); });
                }
                else
                {
                    this._varChangeListenerId = this._variableIn.on("change", this.set.bind(this));
                }

                this.set(this._variableIn.getValue());
                this.forceChange();
            }

            this.#useVariableName = varName;
            attr.useVariable = true;
            attr.variableName = this.#useVariableName;
        }
        else
        {
            attr.variableName = this.#useVariableName = null;
            attr.useVariable = false;
        }

        this.setUiAttribs(attr);
        this.#op.patch.emitEvent("portSetVariable", this.#op, this, varName);
    }

    /**
     * @param {boolean} a
     */
    _handleNoTriggerOpAnimUpdates(a)
    {
        let hasTriggerPort = false;
        // for (let i = 0; i < this._op.portsIn.length; i++)
        // {
        //     if (this._op.portsIn[i].type == Port.TYPE_FUNCTION)
        //     {
        //         hasTriggerPort = true;
        //         break;
        //     }
        // }

        if (!hasTriggerPort)
        {
            if (a)
                this._notriggerAnimUpdate = this.#op.patch.on("onRenderFrame", () =>
                {
                    this.updateAnim();
                });
            else if (this._notriggerAnimUpdate) this._notriggerAnimUpdate = this.#op.patch.off(this._notriggerAnimUpdate);
        }
    }

    bindAnimListeners()
    {
        this.anim.on(Anim.EVENT_CHANGE, () =>
        {
            this.#op.patch.emitEvent("portAnimUpdated", this.#op, this, this.anim);
            this.#op.patch.updateAnimMaxTimeSoon();
        });
        this.anim.on(Anim.EVENT_KEY_DELETE, () =>
        {
            this.#op.patch.updateAnimMaxTimeSoon();
        });

    }

    /**
     * @param {boolean} a
     */
    setAnimated(a)
    {
        let changed = false;
        if (this.#animated != a)
        {
            this.#animated = a;
            this.#op.hasAnimPort = true;
            changed = true;
        }

        if (this.#animated && !this.anim)
        {
            this.anim = new Anim({ "name": "port " + this.name });
            this.bindAnimListeners();
        }

        if (this.#animated)
        {
            let time = 0;
            if (this.#op.patch.gui && this.#op.patch.gui.glTimeline)time = this.#op.patch.timer.getTime();// if timeline is already used otherwise create first key at 0

            if (this.anim.keys.length == 0) this.anim.setValue(time, this.value);
        }
        else
        {
            this.anim = null;
        }

        this._handleNoTriggerOpAnimUpdates(a);

        this.#op.patch.emitEvent("portAnimToggle", this.#op, this, this.anim);

        this.setUiAttribs({ "isAnimated": this.#animated });
        if (changed) this._onAnimToggle();
    }

    toggleAnim()
    {

        /* minimalcore:start */
        this.setAnimated(!this.#animated);
        this.setUiAttribs({ "isAnimated": this.#animated });
        this.#op.patch.emitEvent("portAnimUpdated", this.#op, this, this.anim);
        this.#op.patch.emitEvent("portAnimToggle", this.#op, this, this.anim);

        /* minimalcore:end */
    }

    /**
     * <pre>
     * CABLES.Port.TYPE_VALUE = 0;
     * CABLES.Port.TYPE_FUNCTION = 1;
     * CABLES.Port.TYPE_OBJECT = 2;
     * CABLES.Port.TYPE_TEXTURE = 2;
     * CABLES.Port.TYPE_ARRAY = 3;
     * CABLES.Port.TYPE_DYNAMIC = 4;
     * CABLES.Port.TYPE_STRING = 5;
     * </pre>
     * @return {Number} type of port
     */
    getType()
    {
        return this.type;
    }

    /**
     * @return {Boolean} true if port is linked
     */
    isLinked()
    {
        return this.links.length > 0 || this.#animated || this.#useVariableName != null;
    }

    isBoundToVar()
    {
        const b = this.#useVariableName != null;
        this.uiAttribs.boundToVar = b;
        return b;
    }

    /**
     * @return {Boolean} true if port is animated
     */
    isAnimated()
    {
        return this.#animated;
    }

    /**
     * @return {Boolean} true if port is hidden
     */
    isHidden()
    {
        return this.uiAttribs.hidePort;
    }

    /**
     * @description set callback, which will be executed when port was triggered (usually output port)
     * @param {string} [name] used for tribberButtons (multiple buttons...)
     */
    _onTriggered(name)
    {
        this._activity();
        this.#op.updateAnims();
        if (this.#op.enabled && this.onTriggered) this.onTriggered();

        if (this.#op.enabled) this.emitEvent("trigger", name);
    }

    /**
     * @deprecated
     * @param {function} cb
     */
    onValueChange(cb)
    {
        this.onChange = cb;
    }

    /**
     * @deprecated
     */
    hidePort() {}

    /**
     * Returns the port type string, e.g. "value" based on the port type number
     * @param {Number} type - The port type number
     * @returns {String} - The port type as string
     */
    static portTypeNumberToString(type)
    {

        /* minimalcore:start */
        if (type == Port.TYPE_VALUE) return "value";
        if (type == Port.TYPE_FUNCTION) return "function";
        if (type == Port.TYPE_OBJECT) return "object";
        if (type == Port.TYPE_ARRAY) return "array";
        if (type == Port.TYPE_STRING) return "string";
        if (type == Port.TYPE_DYNAMIC) return "dynamic";
        return "unknown";

        /* minimalcore:end */
    }

    static getTypeString(t)
    {
        // todo:needed only in ui ?remove from core?

        /* minimalcore:start */
        if (t == Port.TYPE_VALUE) return "Number";
        if (t == Port.TYPE_FUNCTION) return "Trigger";
        if (t == Port.TYPE_OBJECT) return "Object";
        if (t == Port.TYPE_DYNAMIC) return "Dynamic";
        if (t == Port.TYPE_ARRAY) return "Array";
        if (t == Port.TYPE_STRING) return "String";
        return "Unknown";

        /* minimalcore:end */
    }

}

;// CONCATENATED MODULE: ./src/core/core_link.js




/**
 * @namespace external:CABLES#Link
 * @description a link is a connection between two ops/ports -> one input and one output port
 * @hideconstructor
 * @class
 */
class Link extends Events
{
    #log = new Logger("link");

    /**
     * @param {Patch} p
     */
    constructor(p)
    {
        super();

        this.id = CABLES.simpleId();

        /** @type {Port} */
        this.portIn = null;

        /** @type {Port} */
        this.portOut = null;

        /** @type {Patch} */
        this._patch = p;
        this.activityCounter = 0;
        this.ignoreInSerialize = false;
    }

    /**
     * @param {any} v
     */
    setValue(v)
    {
        if (v === undefined) this._setValue();
        else this.portIn.set(v);
    }

    activity()
    {
        this.activityCounter++;
    }

    _setValue()
    {
        if (!this.portOut)
        {
            this.remove();
            return;
        }
        const v = this.portOut.get();

        if (v == v) // NaN is the only JavaScript value that is treated as unequal to itself
        {
            if (this.portIn.type != Port.TYPE_FUNCTION) this.activity();

            if (this.portIn.get() !== v)
            {
                this.portIn.set(v);
            }
            else
            {
                if (this.portIn.changeAlways) this.portIn.set(v);
                if (this.portOut.forceRefChange) this.portIn.forceChange();
            }
        }
    }

    /**
     * @function getOtherPort
     * @memberof Link
     * @instance
     * @param {Port} p port
     * @description returns the port of the link, which is not port
     */
    getOtherPort(p)
    {
        if (p == this.portIn) return this.portOut;
        return this.portIn;
    }

    /**
     * @function remove
     * @memberof Link
     * @instance
     * @description unlink/remove this link from all ports
     */
    remove()
    {
        if (this.portIn) this.portIn.removeLink(this);
        if (this.portOut) this.portOut.removeLink(this);
        if (this._patch)
        {
            this._patch.emitEvent("onUnLink", this.portIn, this.portOut, this);
        }

        if (this.portIn && (this.portIn.type == Port.TYPE_OBJECT || this.portIn.type == Port.TYPE_ARRAY))
        {
            this.portIn.set(null);
            if (this.portIn.links.length > 0) this.portIn.set(this.portIn.links[0].getOtherPort(this.portIn).get());
        }

        if (this.portIn) this.portIn.op._checkLinksNeededToWork();
        if (this.portOut) this.portOut.op._checkLinksNeededToWork();

        this.portIn = null;
        this.portOut = null;
        this._patch = null;
    }

    /**
     * @function link
     * @memberof Link
     * @instance
     * @description link those two ports
     * @param {Port} p1 port1
     * @param {Port} p2 port2
     */
    link(p1, p2)
    {
        if (!Link.canLink(p1, p2))
        {
            this.#log.warn("[core_link] cannot link ports!", p1, p2);
            return false;
        }

        if (p1.direction == Port.DIR_IN)
        {
            this.portIn = p1;
            this.portOut = p2;
        }
        else
        {
            this.portIn = p2;
            this.portOut = p1;
        }

        p1.addLink(this);
        p2.addLink(this);

        this.setValue();

        p1.op._checkLinksNeededToWork();
        p2.op._checkLinksNeededToWork();
    }

    getSerialized()
    {

        /* minimalcore:start */
        const obj = {};

        obj.portIn = this.portIn.getName();
        obj.portOut = this.portOut.getName();
        obj.objIn = this.portIn.op.id;
        obj.objOut = this.portOut.op.id;

        return obj;

        /* minimalcore:end */
    }

    /**
     * return a text message with human readable reason if ports can not be linked, or can be
     *
     * @param {Port} p1 port1
     * @param {Port} p2 port2
     */
    static canLinkText(p1, p2)
    {

        /* minimalcore:start */
        if (p1.direction == p2.direction)
        {
            let txt = "(out)";
            if (p2.direction == Port.DIR_IN) txt = "(in)";
            return "can not link: same direction " + txt;
        }
        if (p1.op == p2.op) return "can not link: same op";
        if (p1.type != Port.TYPE_DYNAMIC && p2.type != Port.TYPE_DYNAMIC)
        {
            if (p1.type != p2.type) return "can not link: different type";
        }

        if (CABLES.UI && p1.type == Port.TYPE_OBJECT && p2.type == Port.TYPE_OBJECT)
        {
            if (p1.uiAttribs.objType && p2.uiAttribs.objType)
                if (p1.uiAttribs.objType != p2.uiAttribs.objType)
                    return "incompatible objects";
        }

        if (!p1) return "can not link: port 1 invalid";
        if (!p2) return "can not link: port 2 invalid";

        if (p1.direction == Port.DIR_IN && p1.isAnimated()) return "can not link: is animated";
        if (p2.direction == Port.DIR_IN && p2.isAnimated()) return "can not link: is animated";

        if (p1.isLinkedTo(p2)) return "ports already linked";

        if ((p1.canLink && !p1.canLink(p2)) || (p2.canLink && !p2.canLink(p1))) return "Incompatible";

        return "can link";

        /* minimalcore:end */
    }

    /**
     * return true if ports can be linked
     *
     * @param {Port} p1 port1
     * @param {Port} p2 port2
     * @returns {Boolean}
     */
    static canLink(p1, p2)
    {

        /* minimalcore:start */
        if (!p1) return false;
        if (!p2) return false;
        if (p1.direction == Port.DIR_IN && p1.isAnimated()) return false;
        if (p2.direction == Port.DIR_IN && p2.isAnimated()) return false;

        if (p1.isHidden() || p2.isHidden()) return false;

        if (p1.isLinkedTo(p2)) return false;

        if (p1.direction == p2.direction) return false;

        if (CABLES.UI && p1.type == Port.TYPE_OBJECT && p2.type == Port.TYPE_OBJECT)
        {
            if (p1.uiAttribs.objType && p2.uiAttribs.objType)
            {
                if (p1.uiAttribs.objType.indexOf("sg_") == 0 && p2.uiAttribs.objType.indexOf("sg_") == 0) return true;
                if (p1.uiAttribs.objType != p2.uiAttribs.objType)
                    return false;
            }
        }

        if (p1.type != p2.type && (p1.type != Port.TYPE_DYNAMIC && p2.type != Port.TYPE_DYNAMIC)) return false;
        if (p1.type == Port.TYPE_DYNAMIC || p2.type == Port.TYPE_DYNAMIC) return true;

        if (p1.op == p2.op) return false;

        if (p1.canLink && !p1.canLink(p2)) return false;
        if (p2.canLink && !p2.canLink(p1)) return false;

        /* minimalcore:end */
        return true;
    }
}

// --------------------------------------------

;// CONCATENATED MODULE: ./src/core/loadingstatus.js





/**
 * @typedef LoadingTask
 * @property {Op} [op]
 * @property {string} [id]
 * @property {string} [name]
 * @property {string} [type]
 */

/**
 * LoadingStatus class, manages asynchronous loading jobs
 */
class LoadingStatus extends Events
{
    #patch = null;

    /** @type {Function[]} */
    _cbFinished = [];

    /** @type {Function[]} */
    _assetTasks = [];

    _percent = 0;
    _count = 0;
    _countFinished = 0;
    _order = 0;
    _startTime = 0;
    _wasFinishedPrinted = false;
    _loadingAssetTaskCb = false;

    /** @type {Object.<String,LoadingTask>} */
    _loadingAssets = {};

    #log = new Logger("LoadingStatus");
    consoleLog = false;

    /**
     * @param {Patch} patch
     */
    constructor(patch)
    {
        super();
        this.#patch = patch;
    }

    /**
     * @param {string} str
     * @param {LoadingTask} loadingTask
     */
    log(str, loadingTask)
    {
        if (!this.consoleLog) return;

        let lstr = "[load] " + str + " " + loadingTask?.name;

        if (loadingTask.op)
        {
            lstr += " op:" + loadingTask.op.name;

            if (loadingTask.op.tags && loadingTask.op.tags.length) lstr += " (tags: " + loadingTask.op.tags.join(",") + ")";
            else lstr += "(no tags)";
        }

        console.log(lstr);
    }

    /**
     * @param {Function} cb
     */
    setOnFinishedLoading(cb)
    {
        this._cbFinished.push(cb);
    }

    getNumAssets()
    {
        return this._countFinished;
    }

    getProgress()
    {
        return this._percent;
    }

    checkStatus()
    {
        this._countFinished = 0;
        this._count = 0;

        for (const i in this._loadingAssets)
        {
            this._count++;
            if (!this._loadingAssets[i].finished)
            {
                this._countFinished++;
            }
        }

        this._percent = (this._count - this._countFinished) / this._count;

        if (this._countFinished === 0)
        {
            for (let j = 0; j < this._cbFinished.length; j++)
            {
                if (this._cbFinished[j])
                {
                    const cb = this._cbFinished[j];
                    setTimeout(() => { cb(this.#patch); this.emitEvent("finishedAll"); }, 100);
                }
            }

            if (!this._wasFinishedPrinted)
            {
                this._wasFinishedPrinted = true;
                this.print();
            }
            this.emitEvent("finishedAll");
        }
    }

    getList()
    {
        let arr = [];
        for (const i in this._loadingAssets)
        {
            arr.push(this._loadingAssets[i]);
        }

        return arr;
    }

    getListJobs()
    {
        let arr = [];
        for (const i in this._loadingAssets)
        {
            if (!this._loadingAssets[i].finished)arr.push(this._loadingAssets[i].name);
        }

        return arr;
    }

    print()
    {
        if (this.#patch.config.silent) return;

        const rows = [];

        for (const i in this._loadingAssets)
        {
            rows.push([
                this._loadingAssets[i].order,
                this._loadingAssets[i].type,
                this._loadingAssets[i].name,
                (this._loadingAssets[i].timeEnd - this._loadingAssets[i].timeStart) / 1000 + "s",
            ]);
        }

        this.#log.groupCollapsed("finished loading " + this._order + " assets in " + (Date.now() - this._startTime) / 1000 + "s");
        this.#log.table(rows);
        this.#log.groupEnd();
    }

    /**
     * @param {string} id
     */
    finished(id)
    {
        const l = this._loadingAssets[id];
        if (l)
        {
            if (l.finished) this.#log.warn("loading job was already finished", l);
            if (l.op) l.op.setUiAttribs({ "loading": false });
            l.finished = true;
            l.timeEnd = Date.now();
            this.log("finished", l);
        }

        this.checkStatus();
        this.emitEvent("finishedTask");
        return null;
    }

    _startAssetTasks()
    {
        for (let i = 0; i < this._assetTasks.length; i++)
            CABLES.idleCallback(this._assetTasks[i]);

        this._assetTasks.length = 0;
    }

    /**
     * delay an asset loading task, mainly to wait for ui to be finished loading and showing, and only then start loading assets
     * @param {function} cb callback
     */
    addAssetLoadingTask(cb)
    {
        if (this.#patch.isEditorMode() && !CABLES.UI.loaded)
        {
            this._assetTasks.push(cb);

            if (!this._loadingAssetTaskCb)window.gui.addEventListener("uiloaded", this._startAssetTasks.bind(this));
            this._loadingAssetTaskCb = true;
        }
        else
        {
            CABLES.idleCallback(cb);
        }
        this.emitEvent("addAssetTask");
    }

    /**
     * @param {string} name
     */
    existByName(name)
    {
        for (let i in this._loadingAssets)
        {
            if (this._loadingAssets[i].name == name && !this._loadingAssets[i].finished)
                return true;
        }
    }

    /**
     * @param {string} type
     * @param {string} name
     * @param {Op} [op]
     */
    start(type, name, op)
    {
        if (this._startTime == 0) this._startTime = Date.now();
        const id = generateUUID();

        name = name || "unknown";
        if (name.length > 100)name = name.substring(0, 100);

        if (op)op.setUiAttrib({ "loading": true });

        /** @type {LoadingTask} */
        this._loadingAssets[id] = {
            "id": id,
            "op": op,
            "type": type,
            "name": name,
            "finished": false,
            "timeStart": Date.now(),
            "order": this._order,
        };
        this._order++;
        this.log("start loading", this._loadingAssets[id]);
        // console.log("text", this._loadingAssets[id]);
        // console.trace("hurz");

        this.emitEvent("startTask");

        return id;
    }
}

;// CONCATENATED MODULE: ./src/core/core_variable.js


class PatchVariable extends Events
{
    #name;

    /**
     * @param {String} name
     * @param {String|Number} val
     * @param {number} type
     */
    constructor(name, val, type)
    {
        super();
        this.#name = name;
        this.type = type;
        this.setValue(val);
    }

    /**
     * keeping this for backwards compatibility in older
     * exports before using eventtarget
     *
     * @param cb
     */
    addListener(cb)
    {
        this.on("change", cb, "var");
    }

    /**
     * @returns {String|Number|Boolean|Object}
     */
    getValue()
    {
        return this._v;
    }

    get name()
    {
        return this.#name;
    }

    /**
     * @returns {String|Number|Boolean}
     */
    getName()
    {
        return this.#name;
    }

    /**
     * @param {string | number} v
     * @returns {any}
     */
    setValue(v)
    {
        this._v = v;
        this.emitEvent("change", v, this);
    }
}

;// CONCATENATED MODULE: ./src/core/timer.js


/**
 * @namespace CABLES
 */

const internalNow = function ()
{
    return window.performance.now();
};

/*
 * current time in milliseconds
 * @memberof CABLES
 * @function now
 * @static
 *
 */
const now = function ()
{
    return internalNow();
};

/**
 * Measuring time
 */
class Timer extends Events
{
    static EVENT_PLAY_PAUSE = "playPause";
    static EVENT_TIME_CHANGED = "timeChange";

    #lastTime = 0;
    #timeOffset = 0;
    #currentTime = 0;
    #paused = true;
    #delay = 0;
    #timeStart = 0;
    #ts;

    constructor()
    {
        super();

        this.#timeStart = 0;
        this.overwriteTime = -1;
    }

    #internalNow()
    {
        if (this.#ts) return this.#ts;
        return internalNow();
    }

    #getTime()
    {
        this.#lastTime = (this.#internalNow() - this.#timeStart) / 1000;
        return this.#lastTime + this.#timeOffset;
    }

    /**
     * @param {number} d
     */
    setDelay(d)
    {
        this.#delay = d;
        this.emitEvent(Timer.EVENT_TIME_CHANGED);
    }

    /**
     * @description returns true if timer is playing
     * @return {Boolean} value
     */
    isPlaying()
    {
        return !this.#paused;
    }

    /**
     * @description update timer
     * @param {any} ts
     * @return {Number} time
     */
    update(ts)
    {
        if (ts) this.#ts = ts;
        if (this.#paused) return;
        this.#currentTime = this.#getTime();

        return this.#currentTime;
    }

    /**
     * @return {Number} time in milliseconds
     */
    getMillis()
    {
        return this.get() * 1000;
    }

    /**
     * @return {Number} value time in seconds
     */
    get()
    {
        return this.getTime();
    }

    getTime()
    {
        if (this.overwriteTime >= 0) return this.overwriteTime - this.#delay;
        return this.#currentTime - this.#delay;
    }

    /**
     * toggle between play/pause state
     */
    togglePlay()
    {
        if (this.#paused) this.play();
        else this.pause();
    }

    /**
     * set current time
     * @param {Number} t
     */
    setTime(t)
    {
        if (isNaN(t) || t < 0) t = 0;
        this.#timeStart = this.#internalNow();
        this.#timeOffset = t;
        this.#currentTime = t;
        this.emitEvent((Timer.EVENT_TIME_CHANGED));
    }

    /**
     * @param {number} val
     */
    setOffset(val)
    {
        if (this.#currentTime + val < 0)
        {
            this.#timeStart = this.#internalNow();
            this.#timeOffset = 0;
            this.#currentTime = 0;
        }
        else
        {
            this.#timeOffset += val;
            this.#currentTime = this.#lastTime + this.#timeOffset;
        }
        this.emitEvent(Timer.EVENT_TIME_CHANGED);
    }

    /**
     * (re)starts the timer
     */
    play()
    {
        this.#timeStart = this.#internalNow();
        this.#paused = false;
        this.emitEvent(Timer.EVENT_PLAY_PAUSE);
    }

    /**
     * pauses the timer
     */
    pause()
    {
        this.#timeOffset = this.#currentTime;
        this.#paused = true;
        this.emitEvent(Timer.EVENT_PLAY_PAUSE);
    }

    static now()
    {
        return window.performance.now();
    }
}



;// CONCATENATED MODULE: ./src/core/core_patch.js











/** @global CABLES.OPS  */

/**
 * @typedef {import("./core_op.js").OpUiAttribs} OpUiAttribs
 */

/**
 * @typedef PatchConfig
 * @property {String} [prefixAssetPath=''] prefix for path to assets
 * @property {String} [assetPath=''] path to assets
 * @property {String} [jsPath=''] path to javascript files
 * @property {String} [glCanvasId='glcanvas'] dom element id of canvas element
 * @property {Function} [onError=null] called when an error occurs
 * @property {Function} [onFinishedLoading=null] called when patch finished loading all assets
 * @property {Function} [onFirstFrameRendered=null] called when patch rendered it's first frame
 * @property {Boolean} [glCanvasResizeToWindow=false] resize canvas automatically to window size
 * @property {Boolean} [glCanvasResizeToParent] resize canvas automatically to parent element
 * @property {Boolean} [doRequestAnimation=true] do requestAnimationFrame set to false if you want to trigger exec() from outside (only do if you know what you are doing)
 * @property {Boolean} [clearCanvasColor=true] clear canvas in transparent color every frame
 * @property {Boolean} [clearCanvasDepth=true] clear depth every frame
 * @property {Boolean} [glValidateShader=true] enable/disable validation of shaders *
 * @property {Boolean} [silent=false]
 * @property {Number} [fpsLimit=0] 0 for maximum possible frames per second
 * @property {String} [glslPrecision='mediump'] default precision for glsl shader
 * @property {String} [prefixJsPath]
 * @property {Function} [onPatchLoaded]
 * @property {Object} [canvas]
 * @property {Object} [patch]
 * @property {String} [patchFile]
 * @property {String} [subPatch] internal use
 * @property {Number} [masterVolume] 0 for maximum possible frames per second
 * @property {HTMLCanvasElement} [glCanvas]
 * @property {HTMLElement} [containerElement]
 * @property {boolean} [editorMode]
 * @property {Object} [variables] object of key value pairs, that initialize variables
*/

/**
 * @typedef CoreOp
 * @type Op
 */

/**
 * @template T Patch
 *
 * Patch class, contains all operators,values,links etc. manages loading and running of the whole patch
 *
 * see {@link PatchConfig}
 *
 * @example
 * CABLES.patch=new CABLES.Patch(
 * {
 *     patch:pStr,
 *     glCanvasId:'glcanvas',
 *     glCanvasResizeToWindow:true,
 *     canvas:{powerPreference:"high-performance"},
 *     prefixAssetPath:'/assets/',
 *     prefixJsPath:'/js/',
 *     onError:function(e){console.log(e);}
 *     glslPrecision:'highp'
 * });
 */
class Patch extends Events
{
    static EVENT_OP_DELETED = "onOpDelete";
    static EVENT_OP_ADDED = "onOpAdd";
    static EVENT_PAUSE = "pause";
    static EVENT_RESUME = "resume";
    static EVENT_PATCHLOADEND = "patchLoadEnd";
    static EVENT_VARIABLES_CHANGED = "variablesChanged";
    static EVENT_RENDER_FRAME = "onRenderFrame";
    static EVENT_RENDERED_ONE_FRAME = "renderedOneFrame";
    static EVENT_LINK = "onLink";
    static EVENT_VALUESSET = "loadedValueSet";
    static EVENT_DISPOSE = "dispose";
    static EVENT_ANIM_MAXTIME_CHANGE = "animmaxtimechange";
    static EVENT_INIT_CGL = "INIT_CGL";

    #log;
    #renderOneFrame = false;
    #initialDeserialize = true;

    /** @type {Array<Op>} */
    ops = [];
    settings = {};
    animMaxTime = 0;
    missingClipAnims = {};

    profiler = null;
    aborted = false;
    _crashedOps = [];
    animFrameOps = [];
    _animReq = null;
    _opIdCache = {};
    _triggerStack = [];
    storeObjNames = false; // remove after may release
    _volumeListeners = [];
    namedTriggers = {};

    _origData = null;
    tempData = {};
    frameStore = {};

    /** @param {PatchConfig} cfg */
    constructor(cfg)
    {
        super();

        /** @type {RenderLoop} */
        this.renderloop = null;

        /** @type {PatchConfig} */
        this.config = cfg ||
        {
            "glCanvasResizeToWindow": false,
            "prefixAssetPath": "",
            "prefixJsPath": "",
            "silent": true,
            "onError": null,
            "onFinishedLoading": null,
            "onFirstFrameRendered": null,
            "onPatchLoaded": null,
            "fpsLimit": 0,

        };

        this.#log = new Logger("core_patch", { "onError": cfg.onError });
        this.timer = new Timer();
        this.freeTimer = new Timer();
        this.gui = null;
        CABLES.logSilent = this.silent = true;

        /** @type {LoadingStatus} */
        this.loading = new LoadingStatus(this);

        /* minimalcore:start */
        if (!(function () { return !this; }())) this.#log.warn("not in strict mode: core patch");

        if (this.config.hasOwnProperty("silent")) this.silent = CABLES.logSilent = this.config.silent;
        if (!this.config.hasOwnProperty("doRequestAnimation")) this.config.doRequestAnimation = true;

        if (!this.config.prefixAssetPath) this.config.prefixAssetPath = "";
        if (!this.config.prefixJsPath) this.config.prefixJsPath = "";
        if (!this.config.masterVolume) this.config.masterVolume = 1.0;

        /* minimalcore:end */

        /** @type {Object<string,PatchVariable>} */
        this._variables = {};

        this.vars = {};
        if (cfg && cfg.vars) this.vars = cfg.vars; // vars is old!

        this.cgl = null;// new CGL.Context(this);
        this.cgp = null;

        this._subpatchOpCache = {};
        window.dispatchEvent(new CustomEvent(Patch.EVENT_INIT_CGL, { "detail": this }));

        this.loading.setOnFinishedLoading(this.config.onFinishedLoading);

        if (!CABLES.OPS)
        {
            this.aborted = true;
            throw new Error("no CABLES.OPS found");
        }

        this.freeTimer.play();
        // if (this.renderloop) this.renderloop.exec(0);

        if (this.config.patch)
        {
            this.deSerialize(this.config.patch);
        }
        else if (this.config.patchFile)
        {
            ajax(
                this.config.patchFile,
                (err, _data) =>
                {
                    try
                    {
                        const data = JSON.parse(_data);
                        if (err)
                        {
                            const txt = "";
                            this.#log.error("err", err);
                            this.#log.error("data", data);
                            this.#log.error("data", data.msg);
                            return;
                        }
                        this.deSerialize(data);
                    }
                    catch (e)
                    {
                        this.#log.error("could not load/parse patch ", e);
                    }
                }
            );
        }
        this.timer.play();

        console.log("made with https://cables.gl"); // eslint-disable-line
        this.cg = undefined;
    }

    /* minimalcore:start */
    static getGui()
    {
        // @ts-ignore
        return window.gui;
    }

    /* minimalcore:end */

    isPlaying()
    {
        if (this.renderloop) return !this.renderloop.paused;
        return false;
    }

    /** @deprecated */
    renderOneFrame()
    {
    }

    /**
     * returns true if patch is opened in editor/gui mode
     * @return {Boolean} editor mode
     */
    isEditorMode()
    {
        return this.config.editorMode === true;
    }

    /**
     * pauses patch execution
     */
    pause()
    {
        this.emitEvent(Patch.EVENT_PAUSE);
        if (this.renderloop) this.renderloop.pause();
        this.freeTimer.pause();
    }

    /**
     * resumes patch execution
     */
    resume()
    {
        this.freeTimer.play();
        this.emitEvent(Patch.EVENT_RESUME);
        if (this.renderloop) this.renderloop.resume();
    }

    /**
     * set volume [0-1]
     * @param {Number} v volume
     */
    setVolume(v)
    {
        this.config.masterVolume = v;
        for (let i = 0; i < this._volumeListeners.length; i++) this._volumeListeners[i].onMasterVolumeChanged(v);
    }

    /**
     * get asset path
     * @returns {string}
     */
    getAssetPath(patchId = null)
    {
        if (this.config.hasOwnProperty("assetPath"))
        {
            return this.config.assetPath;
        }
        else if (this.isEditorMode())
        {
            let id = patchId || Patch.getGui().project()._id;
            return "/assets/" + id + "/";
        }
        else if (document.location.href.indexOf("cables.gl") > 0 || document.location.href.indexOf("cables.local") > 0)
        {
            const parts = document.location.pathname.split("/");
            let id = patchId || parts[parts.length - 1];
            return "/assets/" + id + "/";
        }
        else
        {
            return "assets/";
        }
    }

    /**
     * get js path
     * @returns {string}
     */
    getJsPath()
    {
        if (this.config.hasOwnProperty("jsPath"))
        {
            return this.config.jsPath;
        }
        else
        {
            return "js/";
        }
    }

    /**
     * get url/filepath for a filename
     * this uses prefixAssetpath in exported patches
     * @param {String} filename
     * @return {String} url
     */
    getFilePath(filename)
    {
        if (!filename) return filename;
        filename = String(filename);
        if (filename.indexOf("https:") === 0 || filename.indexOf("http:") === 0) return filename;
        if (filename.indexOf("data:") === 0) return filename;
        if (filename.indexOf("file:") === 0) return filename;
        filename = filename.replace("//", "/");
        if (filename.startsWith(this.config.prefixAssetPath)) filename = filename.replace(this.config.prefixAssetPath, "");
        return this.config.prefixAssetPath + filename + (this.config.suffixAssetPath || ""); //
    }

    clear()
    {
        this.emitEvent("patchClearStart");
        this.animFrameOps.length = 0;
        this.timer = new Timer();
        while (this.ops.length > 0) this.deleteOp(this.ops[0].id);

        this._opIdCache = {};
        this.emitEvent("patchClearEnd");
    }

    /**
     * @param {string} identifier
     * @param {string} id
     * @param {string} [opName]
     * @returns {Op}
     */
    createOp(identifier, id, opName = null)
    {

        /**
         * @type {Op}
         */
        let op = null;
        let objName = "";

        try
        {
            if (!identifier)
            {
                console.error("createop identifier false", identifier);// eslint-disable-line
                console.log((new Error()).stack);// eslint-disable-line
                return;
            }
            if (identifier.indexOf("Ops.") === -1)
            {

                /*
                 * this should be a uuid, not a namespace
                 * creating ops by id should be the default way from now on!
                 */
                const opId = identifier;

                if (CABLES.OPS[opId])
                {
                    objName = CABLES.OPS[opId].objName;
                    try
                    {
                        op = new CABLES.OPS[opId].f(this, objName, id, opId);
                    }
                    catch (e)
                    {
                        this._crashedOps.push(objName);
                        this.#log.error("[instancing error] constructor: " + objName, e);

                        /* minimalcore:start */
                        if (!this.isEditorMode())
                        {
                            this.#log.error("INSTANCE_ERR", "Instancing Error: " + objName, e);
                        }
                        else
                        {
                            // construct a "empty" op, use CABLES.Op here to get UiOp class in editor
                            op = new CABLES.Op(this, objName, id);
                            op.setUiError("instancingError", "Failed to instanciate op", 3);
                            op.setEnabled(false);
                            if (this.#initialDeserialize) Patch.getGui().patchView.store.opCrashed = true;
                        }

                        /* minimalcore:end */
                    }
                    op.opId = opId;
                }
                else
                {
                    if (opName)
                    {
                        identifier = opName;
                        this.#log.warn("could not find op by id: " + opId);
                    }
                    else
                    {
                        throw new Error("could not find op by id: " + opId, { "cause": "opId:" + opId });
                    }
                }
            }

            if (!op)
            {
                // fallback: create by objname!
                objName = identifier;
                const parts = identifier.split(".");
                const opObj = Patch.getOpClass(objName);

                if (!opObj)
                {
                    this.emitEvent("criticalError", { "title": "Unknown op: " + objName, "text": "Unknown op: " + objName });

                    this.#log.error("unknown op: " + objName);
                    throw new Error("unknown op: " + objName);
                }
                else
                {
                    op = new opObj(this, objName, id);
                }

                if (op)
                {
                    op.opId = null;
                    for (const i in CABLES.OPS)
                    {
                        if (CABLES.OPS[i].objName == objName) op.opId = i;
                    }
                }
            }
        }
        catch (e)
        {
            this._crashedOps.push(objName);

            this.#log.error("[instancing error] " + objName, e);

            /* minimalcore:start */
            if (!this.isEditorMode())
            {
                this.#log.error("INSTANCE_ERR", "Instancing Error: " + objName, e);

                // throw new Error("instancing error 1" + objName);
            }
            else
            {
                if (this.#initialDeserialize) Patch.getGui().patchView.store.opCrashed = true;
            }

            /* minimalcore:end */
        }

        if (op)
        {
            op._objName = objName;
            op.patch = this;
        }
        else
        {
            this.#log.log("no op was created!?", identifier, id);
        }
        return op;
    }

    /**
     * create a new op in patch
     * @param {string} opIdentifier uuid or name, e.g. Ops.Math.Sum
     * @param {OpUiAttribs} uiAttribs Attributes
     * @param {string} [id]
     * @param {boolean} [fromDeserialize]
     * @param {string} [opName] e.g. Ops.Math.Sum
     * @param {import("./core_op.js").OpAttribs} opAttribs
     * @returns {T} op
     * @example
     * // add invisible op
     * patch.addOp('Ops.Math.Sum', { showUiAttribs: false });
     */
    addOp(opIdentifier, uiAttribs, id, fromDeserialize = false, opName = null, opAttribs = {})
    {
        const op = this.createOp(opIdentifier, id, opName);

        if (op)
        {
            op.attribs = opAttribs;
            uiAttribs = uiAttribs || {};
            uiAttribs.subPatch = uiAttribs.subPatch || 0;
            op.setUiAttribs(uiAttribs);
            if (op.onCreate) op.onCreate();

            if (op.hasOwnProperty("onAnimFrame") && op.onAnimFrame) this.addOnAnimFrame(op);
            if (op.hasOwnProperty("onMasterVolumeChanged")) this._volumeListeners.push(op);

            if (this._opIdCache[op.id])
            {
                this.#log.warn("opid with id " + op.id + " already exists in patch!");
                this.deleteOp(op.id); // strange with subpatch ops: why is this needed, somehow ops get added twice ???.....
                // return;
            }

            this.ops.push(op);
            this._opIdCache[op.id] = op;

            if (this._subPatchCacheAdd) this._subPatchCacheAdd(uiAttribs.subPatch, op);
            this.emitEvent(Patch.EVENT_OP_ADDED, op, fromDeserialize);

            if (op.init) op.init();

            op.emitEvent(Op.EVENT_INIT, fromDeserialize);
        }
        else
        {
            this.#log.error("addop: op could not be created: ", opIdentifier);
        }

        return op;
    }

    /**
     * @param {Op} op
     */
    addOnAnimFrame(op)
    {
        for (let i = 0; i < this.animFrameOps.length; i++) if (this.animFrameOps[i] == op) { return; }

        this.animFrameOps.push(op);
    }

    /**
     * @param {Op} op
     */
    removeOnAnimFrame(op)
    {
        for (let i = 0; i < this.animFrameOps.length; i++)
        {
            if (this.animFrameOps[i] == op)
            {
                this.animFrameOps.splice(i, 1);
                return;
            }
        }
    }

    /**
     * @param {function} cb
     */
    addOnAnimFrameCallback(cb)
    {
        this.animFrameCallbacks.push(cb);
    }

    /**
     * @param {function} cb
     */
    removeOnAnimCallback(cb)
    {
        for (let i = 0; i < this.animFrameCallbacks.length; i++)
        {
            if (this.animFrameCallbacks[i] == cb)
            {
                this.animFrameCallbacks.splice(i, 1);
                return;
            }
        }
    }

    updateAnimMaxTimeSoon()
    {
        if (this.toAnimMaxTime)clearTimeout(this.toAnimMaxTime);
        this.toAnimMaxTime = setTimeout(() =>
        {
            this.updateAnimMaxTime();
        }, 50);
    }

    updateAnimMaxTime()
    {
        let maxTime = 0;
        for (let i = 0; i < this.ops.length; i++)
        {
            if (this.ops[i].hasAnimPort)
            {
                for (let j = 0; j < this.ops[i].portsIn.length; j++)
                {
                    if (this.ops[i].portsIn[j].anim)
                    {
                        if (this.ops[i].portsIn[j].anim.lastKey && this.ops[i].portsIn[j].anim.lastKey.time > maxTime)
                        {
                            maxTime = this.ops[i].portsIn[j].anim.lastKey.time;
                        }
                    }
                }
            }
        }
        if (maxTime != this.animMaxTime)
        {
            this.animMaxTime = maxTime;
            this.emitEvent(Patch.EVENT_ANIM_MAXTIME_CHANGE);
        }
    }

    // @todo move to ui ?
    /**
     * @param {string} opid
     * @param {boolean} [tryRelink]
     * @param {boolean} [reloadingOp]
     */
    deleteOp(opid, tryRelink, reloadingOp)
    {
        let found = false;
        const perf = Patch.getGui()?.uiProfiler.start("[corepatch] delete op");

        this._opIdCache[opid];
        for (let i = 0; i < this.ops.length; i++)
        {
            if (this.ops[i].id == opid)
            {
                const op = this.ops[i];

                /** @type {Port} */
                let reLinkP1 = null;

                /** @type {Port} */
                let reLinkP2 = null;

                if (op)
                {
                    found = true;

                    /* minimalcore:start */
                    if (tryRelink)
                    {
                        if (op.portsIn.length > 0 && op.getFirstPortIn() && op.getFirstPortIn().isLinked() && (op.portsOut.length > 0 && op.getFirstPortOut() && op.getFirstPortOut().isLinked()))
                        {
                            if (op.getFirstPortIn().getType() == op.getFirstPortOut().getType() &&
                                op.getFirstPortIn().isLinked())
                            {
                                reLinkP1 = op.getFirstPortIn()?.links[0]?.getOtherPort(op.getFirstPortIn());
                                reLinkP2 = op.getFirstPortOut()?.links[0]?.getOtherPort(op.getFirstPortOut());
                            }
                        }
                    }

                    /* minimalcore:end */

                    const opToDelete = this.ops[i];
                    opToDelete.removeLinks();

                    this.ops.splice(i, 1);
                    opToDelete.emitEvent("delete", opToDelete);
                    this.emitEvent(Patch.EVENT_OP_DELETED, opToDelete, reloadingOp);

                    if (this.clearSubPatchCache) this.clearSubPatchCache(opToDelete.uiAttribs.subPatch);

                    if (opToDelete.onDelete) opToDelete.onDelete(reloadingOp);
                    opToDelete.cleanUp();

                    /* minimalcore:start */
                    if (!reloadingOp && reLinkP1 && reLinkP2 && reLinkP1.op && reLinkP2.op)
                    {
                        this.link(reLinkP1.op, reLinkP1.getName(), reLinkP2.op, reLinkP2.getName());
                    }

                    /* minimalcore:end */

                    delete this._opIdCache[opid];
                    break;
                }
            }
        }
        perf?.finish();

        if (!found) this.#log.warn("core patch deleteop: not found...", opid);
    }

    getFrameNum()
    {
        if (this.renderloop) return this.renderloop.frameNum;
    }

    /**
     * @param {number} [time]
     * @param {number} [delta]
     * @param {number} [timestamp]
     */
    updateAnims(time, delta, timestamp)
    {
        if (!this.renderloop) return;
        this.timer.update(timestamp);
        this.freeTimer.update(timestamp);

        time = time || this.timer.getTime();

        for (let i = 0; i < this.animFrameOps.length; ++i)
            if (this.animFrameOps[i].onAnimFrame)
                this.animFrameOps[i].onAnimFrame(time, this.renderloop.frameNum, delta);
    }

    /**
     * link two ops/ports
     * @param {Op} op1
     * @param {String} port1Name
     * @param {Op} op2
     * @param {String} port2Name
     * @param {boolean} lowerCase
     * @param {boolean} fromDeserialize
     * @returns {Link}
     */
    link(op1, port1Name, op2, port2Name, lowerCase = false, fromDeserialize = false)
    {

        /* minimalcore:start */
        if (!op1) return this.#log.warn("link: op1 is null ");
        if (!op2) return this.#log.warn("link: op2 is null");

        /* minimalcore:end */

        const port1 = op1.getPort(port1Name, lowerCase);
        const port2 = op2.getPort(port2Name, lowerCase);

        /* minimalcore:start */
        if (!port1) return this.#log.warn("port1 not found! " + port1Name + " (" + op1.objName + ")");
        if (!port2) return this.#log.warn("port2 not found! " + port2Name + " of " + op2.name + "(" + op2.objName + ")", op2);

        if (!port1.shouldLink(port1, port2) || !port2.shouldLink(port1, port2)) return null;

        /* minimalcore:end */
        if (Link.canLink(port1, port2))
        {
            const link = new Link(this);
            if (port1 && port2)
                link.link(port1, port2);

            this.emitEvent(Patch.EVENT_LINK, port1, port2, link, fromDeserialize);
            return link;
        }
    }

    /**
     * @param {Object} options
     * @returns {Object|String}
     */
    serialize(options)
    {

        /* minimalcore:start */
        const obj = {};

        options = options || {};
        obj.ops = [];
        obj.settings = this.settings;
        for (let i = 0; i < this.ops.length; i++)
        {
            const op = this.ops[i];
            if (op && op.getSerialized)obj.ops.push(op.getSerialized());
        }

        cleanJson(obj);

        if (options.asObject) return obj;
        return JSON.stringify(obj);

        /* minimalcore:end */
    }

    /* minimalcore:start */
    getOpsByRefId(refId) // needed for instancing ops ?
    {

        // const perf = Patch.getGui().uiProfiler.start("[corepatchetend] getOpsByRefId");
        const refOps = [];
        // const ops = gui.corePatch().ops;
        for (let i = 0; i < this.ops.length; i++)
            if (this.ops[i].storage && this.ops[i].storage.ref == refId) refOps.push(this.ops[i]);
        // perf.finish();
        return refOps;
    }

    /* minimalcore:end */

    /**
     * @param {String} opid
     * @returns {Op}
     */
    getOpById(opid)
    {
        return this._opIdCache[opid];
    }

    /**
     * @param {String} name
     */
    getOpsByObjName(name)
    {
        const arr = [];
        // for (const i in this.ops
        for (let i = 0; i < this.ops.length; i++)
            if (this.ops[i].objName == name) arr.push(this.ops[i]);
        return arr;
    }

    /**
     * @param {String} opid
     */
    getOpsByOpId(opid)
    {
        const arr = [];
        // for (const i in this.ops)
        for (let i = 0; i < this.ops.length; i++)
            if (this.ops[i].opId == opid) arr.push(this.ops[i]);
        return arr;
    }

    getSubPatchOpsByName(patchId, objName)
    {
        const arr = [];
        // for (const i in this.ops)
        for (let i = 0; i < this.ops.length; i++)
            if (this.ops[i].uiAttribs && this.ops[i].uiAttribs.subPatch == patchId && this.ops[i].objName == objName)
                arr.push(this.ops[i]);

        return arr;
    }

    getSubPatchOp(patchId, objName)
    {
        return this.getFirstSubPatchOpByName(patchId, objName);
    }

    /**
     * @param {string} patchId
     * @param {string} objName
     * @returns {Op}
     */
    getFirstSubPatchOpByName(patchId, objName)
    {
        for (let i = 0; i < this.ops.length; i++)
            if (this.ops[i].uiAttribs && this.ops[i].uiAttribs.subPatch == patchId && this.ops[i].objName == objName)
                return this.ops[i];

        return null;
    }

    _addLink(opinid, opoutid, inName, outName)
    {
        return this.link(this.getOpById(opinid), inName, this.getOpById(opoutid), outName, false, true);
    }

    /**
     * @param {String} s
     */
    logStartup(s)
    {
        if (window.logStartup)window.logStartup(s);
    }

    /**
     * @typedef DeserializeOptions
     * @property {boolean} [genIds]
     * @property {boolean} [createRef]
     */

    /**
     * Description
     * @param {Object} obj
     * @param {DeserializeOptions} options
     * @returns {any}
     */
    deSerialize(obj, options = { "genIds": false, "createRef": false })
    {
        if (this.aborted) return;
        const newOps = [];
        const loadingId = this.loading.start("core", "deserialize");

        if (typeof obj === "string") obj = JSON.parse(obj);

        if (this.#initialDeserialize)
        {
            this.namespace = obj.namespace || "";
            this.name = obj.name || "";
            this.settings = obj.settings;
        }

        this.emitEvent("patchLoadStart");

        obj.ops = obj.ops || [];

        this.logStartup("add " + obj.ops.length + " ops... ");

        const addedOps = [];

        // add ops...
        for (let iop = 0; iop < obj.ops.length; iop++)
        {
            const start = CABLES.now();
            const opData = obj.ops[iop];

            /** @type {Op} */
            let op = null;

            try
            {
                if (opData.opId) op = this.addOp(opData.opId, opData.uiAttribs, opData.id, true, opData.objName, opData.attribs);
                else op = this.addOp(opData.objName, opData.uiAttribs, opData.id, true, null, opData.attribs);
            }
            catch (e)
            {
                this.#log.error("[instancing error] op data:", opData, e);
                // throw new Error("could not create op by id: <b>" + (opData.objName || opData.opId) + "</b> (" + opData.id + ")");
            }

            if (op)
            {
                addedOps.push(op);
                if (options.genIds) op.id = shortId();
                op.portsInData = opData.portsIn;
                op._origData = structuredClone(opData);
                op.storage = opData.storage;
                // if (opData.hasOwnProperty("disabled"))op.setEnabled(!opData.disabled);

                // for (const ipi in opData.portsIn)
                if (opData.portsIn)
                    for (let ipi = 0; ipi < opData.portsIn.length; ipi++)
                    {
                        const objPort = opData.portsIn[ipi];
                        if (objPort && objPort.hasOwnProperty("name"))
                        {
                            const port = op.getPort(objPort.name);

                            if (port && (port.uiAttribs.display == "bool" || port.uiAttribs.type == "bool") && !isNaN(objPort.value)) objPort.value = objPort.value == true ? 1 : 0;
                            if (port && objPort.value !== undefined && port.type != Port.TYPE_TEXTURE) port.set(objPort.value);

                            if (port)
                            {
                                port.deSerializeSettings(objPort);
                            }
                            else
                            {
                                op.preservedPortValues = op.preservedPortValues || {};
                                op.preservedPortValues[objPort.name] = objPort.value;
                            }
                        }
                    }

                if (opData.portsOut)
                    for (let ipo = 0; ipo < opData.portsOut.length; ipo++)
                    {
                        const objPort = opData.portsOut[ipo];
                        if (objPort && objPort.hasOwnProperty("name"))
                        {
                            const port2 = op.getPort(objPort.name);

                            if (port2)
                            {
                                port2.deSerializeSettings(objPort);

                                if (port2.uiAttribs.hasOwnProperty("title"))
                                {
                                    op.preservedPortTitles = op.preservedPortTitles || {};
                                    op.preservedPortTitles[port2.name] = port2.uiAttribs.title;
                                }

                                if (port2.type != Port.TYPE_TEXTURE && objPort.hasOwnProperty("value"))
                                    port2.set(obj.ops[iop].portsOut[ipo].value);

                                if (objPort.expose) port2.setUiAttribs({ "expose": true });
                            }
                        }
                    }
                newOps.push(op);
            }

            const timeused = Math.round(100 * (CABLES.now() - start)) / 100;
            if (!this.silent && timeused > 5) console.log("long op init ", obj.ops[iop].objName, timeused); // eslint-disable-line
        }
        this.logStartup("add ops done");

        // for (const i in this.ops)
        for (let i = 0; i < this.ops.length; i++)
        {
            // deprecated use event
            if (this.ops[i].onLoadedValueSet)
            {
                this.ops[i].onLoadedValueSet(this.ops[i]._origData);
                this.ops[i].onLoadedValueSet = null;
                this.ops[i]._origData = null;
            }

            // this is only emited when the patch is loaded from serializid data, e.g. loading from api
            // NOT when op is created by hand!
            this.ops[i].emitEvent(Patch.EVENT_VALUESSET);
        }

        this.logStartup("creating links");

        if (options.opsCreated)options.opsCreated(addedOps);
        // create links...
        if (obj.ops)
        {
            for (let iop = 0; iop < obj.ops.length; iop++)
            {
                if (obj.ops[iop].portsIn)
                {
                    for (let ipi2 = 0; ipi2 < obj.ops[iop].portsIn.length; ipi2++)
                    {
                        if (obj.ops[iop].portsIn[ipi2] && obj.ops[iop].portsIn[ipi2].links)
                        {
                            for (let ili = 0; ili < obj.ops[iop].portsIn[ipi2].links.length; ili++)
                            {
                                this._addLink(
                                    obj.ops[iop].portsIn[ipi2].links[ili].objIn,
                                    obj.ops[iop].portsIn[ipi2].links[ili].objOut,
                                    obj.ops[iop].portsIn[ipi2].links[ili].portIn,
                                    obj.ops[iop].portsIn[ipi2].links[ili].portOut);

                                /*
                                 * const took = performance.now - startTime;
                                 * if (took > 100)console.log(obj().ops[iop].portsIn[ipi2].links[ili].objIn, obj.ops[iop].portsIn[ipi2].links[ili].objOut, took);
                                 */
                            }
                        }
                    }
                }
                if (obj.ops[iop].portsOut)
                    for (let ipi2 = 0; ipi2 < obj.ops[iop].portsOut.length; ipi2++)
                        if (obj.ops[iop].portsOut[ipi2] && obj.ops[iop].portsOut[ipi2].links)
                        {
                            for (let ili = 0; ili < obj.ops[iop].portsOut[ipi2].links.length; ili++)
                            {
                                if (obj.ops[iop].portsOut[ipi2].links[ili])
                                {
                                    if (obj.ops[iop].portsOut[ipi2].links[ili].subOpRef)
                                    {
                                        // lost link
                                        const outOp = this.getOpById(obj.ops[iop].portsOut[ipi2].links[ili].objOut);
                                        let dstOp = null;
                                        let theSubPatch = 0;

                                        for (let i = 0; i < this.ops.length; i++)
                                        {
                                            if (
                                                this.ops[i].storage &&
                                                this.ops[i].storage.ref == obj.ops[iop].portsOut[ipi2].links[ili].subOpRef &&
                                                outOp.uiAttribs.subPatch == this.ops[i].uiAttribs.subPatch
                                            )
                                            {
                                                theSubPatch = this.ops[i].patchId.get();
                                                break;
                                            }
                                        }

                                        for (let i = 0; i < this.ops.length; i++)
                                        {
                                            if (
                                                this.ops[i].storage &&
                                                this.ops[i].storage.ref == obj.ops[iop].portsOut[ipi2].links[ili].refOp &&
                                                this.ops[i].uiAttribs.subPatch == theSubPatch)
                                            {
                                                dstOp = this.ops[i];
                                                break;
                                            }
                                        }

                                        if (!dstOp) this.#log.warn("could not find op for lost link");
                                        else
                                        {
                                            this._addLink(
                                                dstOp.id,
                                                obj.ops[iop].portsOut[ipi2].links[ili].objOut,

                                                obj.ops[iop].portsOut[ipi2].links[ili].portIn,
                                                obj.ops[iop].portsOut[ipi2].links[ili].portOut);
                                        }
                                    }
                                    else
                                    {
                                        const l = this._addLink(obj.ops[iop].portsOut[ipi2].links[ili].objIn, obj.ops[iop].portsOut[ipi2].links[ili].objOut, obj.ops[iop].portsOut[ipi2].links[ili].portIn, obj.ops[iop].portsOut[ipi2].links[ili].portOut);

                                        if (!l)
                                        {
                                            const op1 = this.getOpById(obj.ops[iop].portsOut[ipi2].links[ili].objIn);
                                            const op2 = this.getOpById(obj.ops[iop].portsOut[ipi2].links[ili].objOut);

                                            if (!op1)console.log("could not find link op1");// eslint-disable-line
                                            if (!op2)console.log("could not find link op2");// eslint-disable-line

                                            const p1Name = obj.ops[iop].portsOut[ipi2].links[ili].portIn;

                                            if (op1 && !op1.getPort(p1Name))
                                            {
                                                // console.log("PRESERVE port 1 not found", p1Name);

                                                op1.preservedPortLinks[p1Name] = op1.preservedPortLinks[p1Name] || [];
                                                op1.preservedPortLinks[p1Name].push(obj.ops[iop].portsOut[ipi2].links[ili]);
                                            }

                                            const p2Name = obj.ops[iop].portsOut[ipi2].links[ili].portOut;
                                            if (op2 && !op2.getPort(p2Name))
                                            {
                                                // console.log("PRESERVE port 2 not found", obj.ops[iop].portsOut[ipi2].links[ili].portOut);
                                                op2.preservedPortLinks[p1Name] = op2.preservedPortLinks[p1Name] || [];
                                                op2.preservedPortLinks[p1Name].push(obj.ops[iop].portsOut[ipi2].links[ili]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
            }
        }

        this.logStartup("calling ops onloaded");

        // for (const i in this.ops)
        for (let i = 0; i < this.ops.length; i++)
        {
            if (this.ops[i].onLoaded)
            {
                // TODO: deprecated - use even
                this.ops[i].onLoaded();
                this.ops[i].onLoaded = null;
            }
        }

        this.logStartup("initializing ops...");
        for (let i = 0; i < this.ops.length; i++)
        // for (const i in this.ops)
        {
            if (this.ops[i].init)
            {
                try
                {
                    this.ops[i].init();
                    this.ops[i].init = null;
                }
                catch (e)
                {
                    console.error("op.init crash", e); // eslint-disable-line
                }
            }
        }

        this.logStartup("initializing vars...");

        if (this.config.variables)
            for (const varName in this.config.variables)
                this.setVarValue(varName, this.config.variables[varName]);

        this.logStartup("initializing var ports");

        // for (const i in this.ops)
        for (let i = 0; i < this.ops.length; i++)
        {
            this.ops[i].initVarPorts();
            delete this.ops[i].uiAttribs.pasted;
        }

        setTimeout(() => { this.loading.finished(loadingId); }, 100);

        this.updateAnimMaxTime();
        if (this.config.onPatchLoaded) this.config.onPatchLoaded(this);

        this.emitEvent(Patch.EVENT_PATCHLOADEND, newOps, obj, options.genIds);
        this.#initialDeserialize = false;
    }

    // ----------------------

    /**
     * set variable value
     * @function setVariable
     * @memberof Patch
     * @param {String} name of variable
     * @param {Number|String|Boolean} val value
     */
    setVariable(name, val)
    {
        if (this._variables[name] !== undefined)
        {
            this._variables[name].setValue(val);
        }
        else
        {
            this.#log.warn("variable " + name + " not found!");
        }
    }

    _sortVars()
    {

        /* minimalcore:start */
        if (!this.isEditorMode()) return;
        const ordered = {};
        Object.keys(this._variables).sort(
            (a, b) =>
            { return a.localeCompare(b, "en", { "sensitivity": "base" }); }
        ).forEach((key) =>
        {
            ordered[key] = this._variables[key];
        });
        this._variables = ordered;

        /* minimalcore:end */
    }

    /**
     * has variable
     * @param {String} name of variable
     */
    hasVar(name)
    {
        return this._variables[name] !== undefined;
    }

    // used internally
    /**
     * @param {string} name
     * @param {string | number} val
     * @param {number} [type]
     */
    setVarValue(name, val, type)
    {
        if (this.hasVar(name))
        {
            this._variables[name].setValue(val);
        }
        else
        {
            this._variables[name] = new PatchVariable(name, val, type);
            this._sortVars();
            this.emitEvent(Patch.EVENT_VARIABLES_CHANGED);
        }
        return this._variables[name];
    }

    // old?
    getVarValue(name, val)
    {
        if (this._variables.hasOwnProperty(name)) return this._variables[name].getValue();
    }

    /**
     * @param {String} name
     * @return {PatchVariable} variable
     */
    getVar(name)
    {
        if (this._variables.hasOwnProperty(name)) return this._variables[name];
    }

    /**
     * @param {string} name
     */
    deleteVar(name)
    {
        for (let i = 0; i < this.ops.length; i++)
            for (let j = 0; j < this.ops[i].portsIn.length; j++)
                if (this.ops[i].portsIn[j].getVariableName() == name)
                    this.ops[i].portsIn[j].setVariable(null);

        delete this._variables[name];
        this.emitEvent("variableDeleted", name);
        this.emitEvent("variablesChanged");
    }

    /**
     * @param {number} t
     * @returns {PatchVariable[]}
     */
    /* minimalcore:start */
    getVars(t = undefined)
    {
        if (t === undefined) return this._variables;
        if (t === 1) return {};

        // const perf = Patch.getGui().uiProfiler.start("[corepatchetend] getVars");// todo should work event based

        const vars = [];
        let tStr = "";
        if (t == Port.TYPE_STRING) tStr = "string";
        else if (t == Port.TYPE_VALUE) tStr = "number";
        else if (t == Port.TYPE_ARRAY) tStr = "array";
        else if (t == Port.TYPE_OBJECT) tStr = "object";
        else if (t == Port.TYPE_DYNAMIC) tStr = "dynamic";
        else
        {
            console.log("unknown port type", t); // eslint-disable-line
            console.log(new Error().stack); // eslint-disable-line
        }

        for (const i in this._variables)
        {
            if (!this._variables[i].type || this._variables[i].type == tStr || this._variables[i].type == t) vars.push(this._variables[i]);
        }

        // perf.finish();

        return vars;
    }

    /* minimalcore:end */

    /**
     * @description invoke pre rendering of ops
     */
    preRenderOps()
    {
        this.#log.log("prerendering...");

        for (let i = 0; i < this.ops.length; i++)
        {
            if (this.ops[i].preRender)
            {
                this.ops[i].preRender();
                this.#log.log("prerender " + this.ops[i].objName);
            }
        }
    }

    /**
     * @description stop, dispose and cleanup patch
     */
    dispose()
    {
        this.pause();
        this.clear();
        this.emitEvent(Patch.EVENT_DISPOSE);
    }

    /**
     * @param {Port} p
     */
    pushTriggerStack(p)
    {
        this._triggerStack.push(p);
    }

    popTriggerStack()
    {
        this._triggerStack.pop();
    }

    printTriggerStack()
    {

        /* minimalcore:start */
        if (this._triggerStack.length == 0)
        {
            // console.log("stack length", this._triggerStack.length); // eslint-disable-line
            return;
        }
        console.groupCollapsed( // eslint-disable-line
            "trigger port stack " + this._triggerStack[this._triggerStack.length - 1].op.objName + "." + this._triggerStack[this._triggerStack.length - 1].name,
        );

        const rows = [];
        for (let i = 0; i < this._triggerStack.length; i++)
        {
            rows.push(i + ". " + this._triggerStack[i].op.objName + " " + this._triggerStack[i].name);
        }

        console.table(rows); // eslint-disable-line
        console.groupEnd(); // eslint-disable-line
        /* minimalcore:end */
    }

    get containerElement()
    {
        if (this.config.containerElement) return this.config.containerElement;
        if (this.cg && this.cg.canvas.parentElement) return this.cg.canvas.parentElement;
        if (this.cgl && this.cgl.canvas.parentElement) return this.cgl.canvas.parentElement;
        return document.body;
    }

    /**
     * returns document object of the patch could be != global document object when opening canvas ina popout window
     * @return {Object} document
     */
    getDocument()
    {
        return this.containerElement.ownerDocument;
        // return this.cgl.canvas.ownerDocument;
    }

    /**
     * @param {string} objName
     */
    static getOpClass(objName)
    {
        const parts = objName.split(".");
        let opObj = null;

        try
        {
            if (parts.length == 2) opObj = window[parts[0]][parts[1]];
            else if (parts.length == 3) opObj = window[parts[0]][parts[1]][parts[2]];
            else if (parts.length == 4) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]];
            else if (parts.length == 5) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]];
            else if (parts.length == 6) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]];
            else if (parts.length == 7) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]];
            else if (parts.length == 8) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]];
            else if (parts.length == 9) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]];
            else if (parts.length == 10) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]];
            return opObj;
        }
        catch (e)
        {
            return null;
        }
    }

    /**
     * @param {Object} json
     * @param {Object} options
     */
    static replaceOpIds(json, options)
    {
        const opids = {};
        for (const i in json.ops)
        {
            opids[json.ops[i].id] = json.ops[i];
        }

        for (const j in json.ops)
        {
            for (const k in json.ops[j].portsOut)
            {
                const links = json.ops[j].portsOut[k].links;
                if (links)
                {
                    let l = links.length;

                    while (l--)
                    {
                        if (links[l] && (!opids[links[l].objIn] || !opids[links[l].objOut]))
                        {
                            if (!options.doNotUnlinkLostLinks)
                            {
                                links.splice(l, 1);
                            }

                            /* minimalcore:start */
                            else
                            {
                                if (options.fixLostLinks)
                                {
                                    const op = Patch.getGui().corePatch().getOpById(links[l].objIn);
                                    if (!op) console.log("op not found!"); // eslint-disable-line
                                    else
                                    {
                                        const outerOp = Patch.getGui().patchView.getSubPatchOuterOp(op.uiAttribs.subPatch);
                                        if (outerOp)
                                        {
                                            op.storage = op.storage || {};
                                            op.storage.ref = op.storage.ref || shortId();
                                            links[l].refOp = op.storage.ref;
                                            links[l].subOpRef = outerOp.storage.ref;
                                        }
                                    }
                                }
                            }

                            /* minimalcore:end */
                        }
                    }
                }
            }
        }

        for (const i in json.ops)
        {
            const op = json.ops[i];
            const oldId = op.id;
            let newId = shortId();

            if (options.prefixHash) newId = prefixedHash(options.prefixHash + oldId);

            else if (options.prefixId) newId = options.prefixId + oldId;
            else if (options.refAsId) // when saving json
            {
                if (op.storage && op.storage.ref)
                {
                    newId = op.storage.ref;
                    delete op.storage.ref;
                }
                else
                {
                    op.storage = op.storage || {};
                    op.storage.ref = newId = shortId();
                }
            }

            const newID = op.id = newId;

            if (options.oldIdAsRef) // when loading json
            {
                op.storage = op.storage || {};
                op.storage.ref = oldId;
            }

            for (const j in json.ops)
            {
                if (json.ops[j].portsIn)
                    for (const k in json.ops[j].portsIn)
                    {
                        if (json.ops[j].portsIn[k].links)
                        {
                            let l = json.ops[j].portsIn[k].links.length;

                            while (l--) if (json.ops[j].portsIn[k].links[l] === null) json.ops[j].portsIn[k].links.splice(l, 1);

                            for (l in json.ops[j].portsIn[k].links)
                            {
                                if (json.ops[j].portsIn[k].links[l].objIn === oldId) json.ops[j].portsIn[k].links[l].objIn = newID;
                                if (json.ops[j].portsIn[k].links[l].objOut === oldId) json.ops[j].portsIn[k].links[l].objOut = newID;
                            }
                        }
                    }

                if (json.ops[j].portsOut)
                    for (const k in json.ops[j].portsOut)
                    {
                        if (json.ops[j].portsOut[k].links)
                        {
                            let l = json.ops[j].portsOut[k].links.length;

                            while (l--) if (json.ops[j].portsOut[k].links[l] === null) json.ops[j].portsOut[k].links.splice(l, 1);

                            for (l in json.ops[j].portsOut[k].links)
                            {
                                if (json.ops[j].portsOut[k].links[l].objIn === oldId) json.ops[j].portsOut[k].links[l].objIn = newID;
                                if (json.ops[j].portsOut[k].links[l].objOut === oldId) json.ops[j].portsOut[k].links[l].objOut = newID;
                            }
                        }
                    }
            }
        }

        // set correct subpatch
        const subpatchIds = [];
        const fixedSubPatches = [];

        for (let i = 0; i < json.ops.length; i++)
        {
        // if (CABLES.Op.isSubPatchOpName(json.ops[i].objName))
            if (json.ops[i].storage && json.ops[i].storage.subPatchVer)
            {
            // for (const k in json.ops[i].portsInckkkkk
                for (let k = 0; k < json.ops[i].portsIn.length; k++)
                {
                    if (json.ops[i].portsIn[k].name === "patchId")
                    {
                        let newId = shortId();

                        if (options.prefixHash) newId = prefixedHash(options.prefixHash + json.ops[i].portsIn[k].value);

                        const oldSubPatchId = json.ops[i].portsIn[k].value;
                        const newSubPatchId = json.ops[i].portsIn[k].value = newId;

                        subpatchIds.push(newSubPatchId);

                        for (let j = 0; j < json.ops.length; j++)
                        {
                        // op has no uiAttribs in export, we don't care about subpatches in export though
                            if (json.ops[j].uiAttribs)
                            {
                                if (json.ops[j].uiAttribs.subPatch === oldSubPatchId)
                                {
                                    json.ops[j].uiAttribs.subPatch = newSubPatchId;
                                    fixedSubPatches.push(json.ops[j].id);
                                }
                            }
                        }
                    }
                }
            }
        }

        for (const kk in json.ops)
        {
            let found = false;
            for (let j = 0; j < fixedSubPatches.length; j++)
            {
                if (json.ops[kk].id === fixedSubPatches[j])
                {
                    found = true;
                    break;
                }
            }
            // op has no uiAttribs in export, we don't care about subpatches in export though
            if (!found && json.ops[kk].uiAttribs && options.parentSubPatchId != null)
                json.ops[kk].uiAttribs.subPatch = options.parentSubPatchId;
        }

        return json;
    }
}

/**
 * op added to patch event
 * @event onOpAdd
 *
 * @memberof Patch
 * @type {Object}
 * @property {Op} op new op
 */

/**
 * op deleted from patch
 * @event onOpDelete
 * @memberof Patch
 * @type {Object}
 * @property {Op} op that will be deleted
 */

/**
 * link event - two ports will be linked
 * @event onLink
 * @memberof Patch
 * @type {Object}
 * @property {Port} port1
 * @property {Port} port2
 */

/**
 * unlink event - a link was deleted
 * @event onUnLink
 * @memberof Patch
 * @type {Object}
 */

/**
 * variables has been changed / a variable has been added to the patch
 * @event variablesChanged
 * @memberof Patch
 * @type {Object}
 * @property {Port} port1
 * @property {Port} port2
 */

;// CONCATENATED MODULE: ./src/core/core_port_switch.js



class SwitchPort extends Port
{
    constructor(__parent, name, type, uiAttribs, indexPort)
    {
        super(__parent, name, type, uiAttribs);

        this.get = () =>
        {
            let s = super.get();

            if (CABLES.UI)
            {
                if (
                    s === "" ||
                    s === null ||
                    s === undefined ||
                    (uiAttribs.values && uiAttribs.values.indexOf(String(s)) === -1)
                )
                {
                    this.op.setUiError("invalidswitch", "Invalid Value [" + this.name + "]: \"" + s + "\"", 1);
                }
                else this.op.setUiError("invalidswitch", null);
            }

            if (s === null || s === undefined)s = "";

            return s;
        };

        this.indexPort = indexPort;
        this.indexPort.set = (value) =>
        {
            const values = uiAttribs.values;

            if (!values)
            {
                // console.log("switch port has no values", this);
                return;
            }

            let intValue = Math.floor(value);

            intValue = Math.min(intValue, values.length - 1);
            intValue = Math.max(intValue, 0);

            this.indexPort.setValue(intValue);
            this.set(values[intValue]);

            /* minimalcore:start */
            if (this.op.patch.isEditorMode() && performance.now() - (this.lastTime || 0) > 100 && Patch.getGui() && Patch.getGui().patchView.isCurrentOp(this.op))
            {
                Patch.getGui().opParams.show(this.op);
                this.lastTime = performance.now();
            }

            /* minimalcore:end */
        };
    }

    /**
     * @param {import("./core_port.js").PortUiAttribs} attribs
     */
    setUiAttribs(attribs)
    {
        const hidePort = attribs.hidePort;
        attribs.hidePort = true;
        super.setUiAttribs(attribs);
        if (typeof hidePort !== "undefined")
            this.indexPort.setUiAttribs({ hidePort });
    }
}

;// CONCATENATED MODULE: ./src/core/core_port_multi.js





const MIN_NUM_PORTS = 2;

class MultiPort extends Port
{

    /* minimalcore:start */
    /**
     * @param {import("./core_op.js").Op<any>} __parent
     * @param {string} name
     * @param {number} type
     * @param {number} dir
     * @param {import("./core_port.js").PortUiAttribs} uiAttribs
     * @param {import("./core_port.js").PortUiAttribs} [uiAttribsPorts]
     */
    constructor(__parent, name, type, dir, uiAttribs, uiAttribsPorts)
    {
        super(__parent, name, Port.TYPE_ARRAY, uiAttribs);

        this._log = new Logger("multiport old");
        this.setUiAttribs({ "multiPort": true, "group": this.name, "order": -1 });
        this.ports = [];
        this.direction = dir;
        this._uiAttribsPorts = uiAttribsPorts;

        const updateArray = () =>
        {
            const arr = [];

            let ll = 1;
            if (this.uiAttribs.multiPortManual)ll = 0;

            for (let i = 0; i < this.ports.length - ll; i++)
                arr[i] = this.ports[i];

            this.setRef(arr);
        };

        const updateUi = () =>
        {
            let grey = !this.uiAttribs.multiPortManual || false;

            if (this.direction == CONSTANTS.PORT.PORT_DIR_OUT)grey = false;

            for (let i = 0; i < this.ports.length; i++)
            {
                let lp; // undefined to remove/not set it
                // let opacity;// undefined to remove/not set it
                // let grey;// undefined to remove/not set it
                let addPort = false;
                let title;
                let o = {};

                // console.log("this.op.preservedPortTitles", this.op.preservedPortTitles, this.op.preservedPortTitles[po.name], po.name);
                if (this.op.preservedPortTitles && this.op.preservedPortTitles[this.ports[i].name]) title = this.op.preservedPortTitles[this.ports[i].name];

                // if (!this.uiAttribs.multiPortManual)grey = true;
                if (i == 0) lp = this.ports.length;

                if (!this.uiAttribs.multiPortManual)
                    if (i == this.ports.length - 1)
                    {
                        title = "add port";
                        addPort = true;
                        grey = true;
                    }

                for (const attin in this._uiAttribsPorts)
                {
                    o[attin] = this._uiAttribsPorts[attin];
                }

                o.addPort = addPort;
                o.longPort = lp;
                o.title = title;
                o.greyout = grey;
                o.group = this.name;

                this.ports[i].setUiAttribs(o);
            }
        };

        this.removeInvalidPorts = () =>
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                if (!this.ports[i]) this.ports.splice(i, 1);
            }

            if (!this.uiAttribs.multiPortManual)
            {
                if (this.ports.length > MIN_NUM_PORTS)

                    for (let i = this.ports.length - 1; i > 1; i--)
                    {
                        if (!this.ports[i].isLinked()) this.uiAttribs.multiPortNum = i;
                        else break;
                    }
            }

            updateArray();
        };

        this.countPorts = () =>
        {

            const gui = Patch.getGui();

            if (CABLES.UI && !gui.isRemoteClient && gui.patchView && gui.patchView.patchRenderer && gui.patchView.patchRenderer.isDraggingPort())
            {
                clearTimeout(this.retryTo);
                this.retryTo = setTimeout(this.countPorts.bind(this));
                return;
            }

            this.retryTo = null;

            let redo = false;
            this.removeListeners();
            this.removeInvalidPorts();

            for (let i = 0; i < this.ports.length; i++)
            {
                if (this.ports[i] && this.ports[i].links.length > 1)
                {
                    const po = this.ports[i + 1];
                    const otherPort = this.ports[i].links[0].getOtherPort(this.ports[i]);

                    if (!po || !otherPort)
                    {
                        this._log.warn("no port found?");
                    }
                    else
                    {
                        this.ports[i].links[0].remove();
                        this.op.patch.link(this.op, po.name, otherPort.op, otherPort.name);
                        redo = true;
                    }
                    break;
                }
            }

            if (!this.uiAttribs.multiPortManual)
            {
                let foundHole = true;
                while (foundHole)
                {
                    // console.log("search holes...");
                    foundHole = false;

                    for (let i = this.ports.length - 1; i > 1; i--)
                    {
                        if (this.ports[i] && this.ports[i].links.length > 0 && this.ports[i - 1].links.length == 0)
                        {
                            // console.log("found hole!");

                            // found hole
                            const otherPort = this.ports[i].links[0].getOtherPort(this.ports[i]);
                            this.ports[i].links[0].remove();

                            const po = this.ports[i - 1];

                            if (po && this.ports[i])
                            {
                                // console.log("move ", this.ports[i].name, "to", po.name);
                                this.op.patch.link(this.op, po.name, otherPort.op, otherPort.name);
                                foundHole = true;
                                redo = true;
                                break;
                            }
                        }
                    }

                    // this.checkNum();
                }

                // this.removeInvalidPorts();
            }

            if (!this.uiAttribs.multiPortManual) // if auto
            {
                while (this.ports.length > MIN_NUM_PORTS && !this.ports[this.ports.length - 1].isLinked() && !this.ports[this.ports.length - 2].isLinked())
                {
                    let i = this.ports.length - 1;
                    if (!this.ports[i].isLinked() && this.ports[i - 1] && !this.ports[i - 1].isLinked())
                    {
                        this.ports[i].setUiAttribs({ "removed": true });
                        this.ports[i].remove();
                        // this.ports[i] = null;
                        this.ports.splice(i, 1);
                    }
                }
            }

            this.removeInvalidPorts();

            if (!this.uiAttribs.multiPortManual && this.ports.length > 0 && this.ports[this.ports.length - 1].isLinked()) this.newPort();

            updateArray();
            updateUi();

            if (redo) this.countPorts();
            else this.addListeners();
        };

        this.removeListeners = () =>
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                const po = this.ports[i];
                if (po.multiPortChangeListener) po.multiPortChangeListener = po.off(po.multiPortChangeListener);
                if (po.multiLinkChangeListener) po.multiLinkChangeListener = po.off(po.multiLinkChangeListener);
            }
        };

        this.addListeners = () =>
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                const po = this.ports[i];
                const idx = i;

                if (po.multiPortChangeListener)po.multiPortChangeListener = po.off(po.multiPortChangeListener);
                po.multiPortChangeListener = po.on("change", updateArray.bind(this));

                if (po.multiPortTriggerListener)po.multiPortTriggerListener = po.off(po.multiPortTriggerListener);
                po.multiPortTriggerListener = po.on("trigger", () => { this._onTriggered(); });

                if (po.multiLinkChangeListener)po.multiLinkChangeListener = po.off(po.multiLinkChangeListener);
                po.multiLinkChangeListener = po.on("onLinkChanged", () =>
                {
                    this.countPorts();
                    this.emitEvent("onLinkChanged");
                });

                if (po.multiLinkRemoveListener)po.multiLinkRemoveListener = po.off(po.multiLinkRemoveListener);
                po.multiLinkRemoveListener = po.on("onLinkRemoved", () =>
                {
                    // this.removeInvalidPorts();
                    // this.checkNum();
                    // this.countPorts();
                    updateUi();
                    this.emitEvent("onLinkChanged");
                    // this.countPorts.bind(this);
                });
            }
        };

        this.newPort = () =>
        {

            /** @type {import("./core_port.js").PortUiAttribs} */
            const attrs = {};
            // if (type == CABLES.OP_PORT_TYPE_STRING) attrs.type = "string";
            attrs.type = type;
            const po = this.op.newPort(this.op, name + "_" + this.ports.length, type, attrs);

            po.direction = dir;

            if (this.direction == CONSTANTS.PORT.PORT_DIR_OUT) this.op.addOutPort(po);
            else this.op.addInPort(po, this.ports[this.ports.length - 1]);
            this.ports.push(po);

            if (type == Port.TYPE_NUMBER) po.setInitialValue(0);
            else if (type == Port.TYPE_STRING) po.setInitialValue("");

            this.addListeners();

            updateUi();
            updateArray();
            this.emitEvent("onLinkChanged");
            // console.log("this.op.preservedPortTitles", this.op.preservedPortTitles, this.op.preservedPortTitles[po.name], po.name);
            if (this.op.preservedPortTitles && this.op.preservedPortTitles[po.name]) po.setUiAttribs({ "title": this.op.preservedPortTitles[po.name] });

            return po;
        };

        this.initPorts = () =>
        {
            for (let i = 0; i < MIN_NUM_PORTS; i++) this.newPort();
            updateArray();
            updateUi();
        };

        this.checkNum = () =>
        {
            this.uiAttribs.multiPortNum = Math.max(MIN_NUM_PORTS, this.uiAttribs.multiPortNum);

            while (this.ports.length < this.uiAttribs.multiPortNum) this.newPort();
            while (this.ports.length > this.uiAttribs.multiPortNum) if (this.ports[this.ports.length - 1]) this.ports.pop().remove();

            this.removeInvalidPorts();
        };

        this.incDec = (incDir) =>
        {
            this.uiAttribs.multiPortNum = this.uiAttribs.multiPortNum || MIN_NUM_PORTS;
            // console.log("this.uiAttribs.multiPortNum", this.uiAttribs.multiPortNum, this.uiAttribs.multiPortNum + incDir);
            this.setUiAttribs({ "multiPortNum": this.uiAttribs.multiPortNum + incDir });
            this.checkNum();

            updateUi();
        };

        this.toggleManual = () =>
        {
            this.setUiAttribs({ "multiPortManual": !this.uiAttribs.multiPortManual });
            this.op.refreshParams();
        };

        this.on("onUiAttrChange", (attribs) =>
        {
            if (attribs.hasOwnProperty("multiPortManual"))
            {
                updateUi();
                this.removeInvalidPorts();
                this.checkNum();
                this.countPorts();
                updateUi();
            }
        });

        this.on("onUiAttrChange", this.checkNum.bind(this));
        this.checkNum();
        this.countPorts();
        this.removeInvalidPorts();
        updateUi();
    }

/* minimalcore:end */
}

;// CONCATENATED MODULE: ./src/core/core_port_multi2.js





class MultiPort2 extends Port
{

    /**
     * @param {import("./core_op.js").Op<any>} __parent
     * @param {string} name
     * @param {number} type
     * @param {number} dir
     * @param {import("./core_port.js").PortUiAttribs} uiAttribs
     * @param {import("./core_port.js").PortUiAttribs} [uiAttribsPorts]
     */
    constructor(__parent, name, type, dir, uiAttribs, uiAttribsPorts, minNumPorts = 1)
    {
        super(__parent, name, Port.TYPE_ARRAY, uiAttribs);

        this._log = new Logger("multiport2");
        this.setUiAttribs({ "multiPort2": true, "multiPort": true, "group": this.name, "order": -1, "multiPortManual": true });
        this.minNumPorts = minNumPorts;

        /** @type {Port[]} */
        this.ports = [];
        this.direction = dir;
        this._uiAttribsPorts = uiAttribsPorts;

        const updateArray = () =>
        {
            const arr = [];

            let ll = 1;// do not include addport

            for (let i = 0; i < this.ports.length - ll; i++)
                arr[i] = this.ports[i];

            this.setRef(arr);
        };

        const updateUi = () =>
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                let lp; // undefined to remove/not set it
                let addPort = false;
                let title;
                let grey = false;
                let o = {};

                if (this.op.preservedPortTitles && this.op.preservedPortTitles[this.ports[i].name]) title = this.op.preservedPortTitles[this.ports[i].name];
                if (i == 0) lp = this.ports.length;

                if (i == this.ports.length - 1)
                {
                    title = "add port";
                    addPort = true;
                    grey = true;
                }

                for (const attin in this._uiAttribsPorts)
                    o[attin] = this._uiAttribsPorts[attin];

                o.addPort = addPort;
                o.longPort = lp;
                o.title = title;
                o.greyout = grey;
                o.group = this.name;

                this.ports[i].setUiAttribs(o);
            }
        };

        this.removeInvalidPorts = () =>
        {

            let changed = false;
            for (let i = 0; i < this.ports.length; i++)
                if (!this.ports[i])
                {
                    changed = true;
                    this.ports.splice(i, 1);
                }

            if (changed)updateArray();
        };

        this.countPorts = () =>
        {

            /* minimalcore:start */
            const gui = Patch.getGui();
            if (CABLES.UI && !gui.isRemoteClient && gui.patchView && gui.patchView.patchRenderer && gui.patchView.patchRenderer.isDraggingPort())
            {
                clearTimeout(this.retryTo);
                this.retryTo = setTimeout(this.countPorts.bind(this));
                return;
            }

            /* minimalcore:end */
            this.retryTo = null;

            let redo = false;
            this.removeListeners();
            this.removeInvalidPorts();

            for (let i = 0; i < this.ports.length; i++)
            {
                if (this.ports[i] && this.ports[i].links.length > 1)
                {
                    const po = this.ports[i + 1];
                    const otherPort = this.ports[i].links[0].getOtherPort(this.ports[i]);

                    if (!po || !otherPort)
                    {
                        this._log.warn("no port found?");
                    }
                    else
                    {
                        this.ports[i].links[0].remove();
                        this.op.patch.link(this.op, po.name, otherPort.op, otherPort.name);
                        redo = true;
                    }
                    break;
                }
            }

            const idxLastPort = this.ports.length - 1;

            if (this.ports.length >= 1 && this.ports[idxLastPort].uiAttribs.addPort && this.ports[idxLastPort].isLinked())
            {
                this.newPort();
                this.setUiAttribs({ "multiPortNum": this.ports.length });
            }

            this.removeInvalidPorts();

            updateArray();
            updateUi();

            if (redo) this.countPorts();
            else this.addListeners();
        };

        this.removeListeners = () =>
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                const po = this.ports[i];
                if (po.multiPortChangeListener) po.multiPortChangeListener = po.off(po.multiPortChangeListener);
                if (po.multiLinkChangeListener) po.multiLinkChangeListener = po.off(po.multiLinkChangeListener);
            }
        };

        this.addListeners = () =>
        {
            for (let i = 0; i < this.ports.length; i++)
            {
                const po = this.ports[i];
                const idx = i;

                if (po.multiPortChangeListener)po.multiPortChangeListener = po.off(po.multiPortChangeListener);
                po.multiPortChangeListener = po.on("change", updateArray.bind(this));

                if (po.multiPortTriggerListener)po.multiPortTriggerListener = po.off(po.multiPortTriggerListener);
                po.multiPortTriggerListener = po.on("trigger", () => { this._onTriggered(idx); });

                if (po.multiLinkChangeListener)po.multiLinkChangeListener = po.off(po.multiLinkChangeListener);
                po.multiLinkChangeListener = po.on("onLinkChanged", () =>
                {
                    this.countPorts();
                    this.emitEvent("onLinkChanged");
                });

                if (po.multiLinkRemoveListener)po.multiLinkRemoveListener = po.off(po.multiLinkRemoveListener);
                po.multiLinkRemoveListener = po.on("onLinkRemoved", () =>
                {
                    updateUi();
                    this.countPorts();
                    this.emitEvent("onLinkChanged");
                });
            }
        };

        this.newPort = (reason) =>
        {

            /** @type {import("./core_port.js").PortUiAttribs} */
            const attrs = {};
            // if (type == CABLES.OP_PORT_TYPE_STRING) attrs.type = "string";
            attrs.type = type;
            const po = this.op.newPort(this.op, name + "_" + this.ports.length, type, attrs);

            po.direction = dir;

            if (this.direction == CONSTANTS.PORT.PORT_DIR_OUT) this.op.addOutPort(po);
            else this.op.addInPort(po, this.ports[this.ports.length - 1]);
            this.ports.push(po);

            if (type == Port.TYPE_NUMBER) po.setInitialValue(0);
            else if (type == Port.TYPE_STRING) po.setInitialValue("");

            this.addListeners();

            updateUi();
            updateArray();
            this.emitEvent("onLinkChanged");

            if (this.op.preservedPortTitles && this.op.preservedPortTitles[po.name]) po.setUiAttribs({ "title": this.op.preservedPortTitles[po.name] });

            return po;
        };

        this.initPorts = () =>
        {
            while (this.ports.length < this.minNumPorts) this.newPort("init" + this.minNumPorts);
            updateArray();
            updateUi();
        };

        this.checkNum = () =>
        {
            this.uiAttribs.multiPortNum ||= this.minNumPorts;
            this.uiAttribs.multiPortNum = Math.max(this.minNumPorts, this.uiAttribs.multiPortNum);

            while (this.ports.length < this.uiAttribs.multiPortNum) this.newPort("checknum");
            while (this.ports.length > this.uiAttribs.multiPortNum) if (this.ports[this.ports.length - 1]) this.ports.pop().remove();

            this.removeInvalidPorts();
            if (this.ports.length > 1 && this.ports[this.ports.length - 1].uiAttribs.addPort && this.ports[this.ports.length - 1].isLinked())
            {
                this.ports[this.ports.length - 1].removeLinks();
            }
        };

        this.incDec = (incDir) =>
        {
            this.uiAttribs.multiPortNum = this.uiAttribs.multiPortNum || this.minNumPorts;
            this.setUiAttribs({ "multiPortNum": this.uiAttribs.multiPortNum + incDir });
            this.checkNum();

            updateUi();
        };

        this.on(Port.EVENT_UIATTRCHANGE, this.checkNum.bind(this));
        this.checkNum();
        this.countPorts();
        this.removeInvalidPorts();
        updateUi();
    }
}

;// CONCATENATED MODULE: ./src/core/uierrors.js
let simpleLogDiv = null;
const data = {};
let lastHtml = "";

function showUiErrors(op, id, txt, level, options)
{

    data[op.id + id] = { "op": op, "txt": txt, "id": id, options };

    let html = "";
    let found = false;
    for (const i in data)
    {
        if (data[i] && data[i].txt)
        {
            html += data[i].op.name + ": " + data[i].txt + " " + (data[i].options?.info || "") + "<br/>";
            found = true;
        }
    }

    if (simpleLogDiv && !found)
    {
        simpleLogDiv.remove();
        simpleLogDiv = null;
        return;
    }
    if (!found) return;
    if (!simpleLogDiv)
    {
        simpleLogDiv = document.createElement("div");
        simpleLogDiv.style.position = "absolute";
        simpleLogDiv.style.border = "1px solid red";
        simpleLogDiv.style.backgroundColor = "#222";
        simpleLogDiv.style.zIndex = "100000";
        simpleLogDiv.style.padding = "10px";
        simpleLogDiv.style.top = "0px";

        simpleLogDiv.classList.add("cablesErrorLog");
        document.body.appendChild(simpleLogDiv);

    }
    if (lastHtml != html)
    {
        simpleLogDiv.innerHTML = html;
        lastHtml = html;
    }
}

;// CONCATENATED MODULE: ./src/core/core_op.js










/**
 * @typedef Translation
 * @property {number} [x]
 * @property {number} [y]
 */

/**
 * @typedef OpAttribs
 * @property {string[]} [tags] tags
 */

/**
 * @typedef OpUiAttribs
 * @property {string} [title] overwrite op title
 * @property {string} [hidePort] hidePort
 * @property {string} [title] overwrite op title
 * @property {String} [title=''] overwrite title of port (by default this is portname)
 * @property {string} [extendTitle] extended op title, shown in grey next to op name
 * @property {object} [storage]
 * @property {boolean} [working]
 * @property {boolean} [bookmarked]
 * @property {boolean} [selected]
 * @property {boolean} [disabled]
 * @property {boolean} [loading]
 * @property {boolean} [resizable]
 * @property {boolean} [hidden]
 * @property {object} [uierrors]
 * @property {string} [color]
 * @property {object} [area]
 * @property {string} [comment]
 * @property {number} [height]
 * @property {number} [width]
 * @property {Translation} [translate]
 * @property {string|number} [subPatch]
 * @property {string} [comment_title]
 * @property {boolean} [highlighted]
 * @property {boolean} [highlightedMore]
 * @property {string} [mathTitle]
 * @property {string} [extendTitlePort]
 * @property {string} [display]
 * @property {string} [hasArea]
 * @property {boolean} [resizableX]
 * @property {boolean} [resizableY]
 * @property {number} [tlOrder]
 * @property {number} [heatmapIntensity]
 * @property {string} [commentOverwrite]
 * @property {string} [comment_text]
 * @property {boolean} [createdLocally]
 * @property {boolean} [stretchPorts]
 */

/**
 * @typedef CorePatch
 * @type Patch
 */

/**
 * @template T
*/
class Op extends Events
{
    static OP_VERSION_PREFIX = "_v";
    static EVENT_INIT = "init";
    static EVENT_UIATTR_CHANGE = "onUiAttribsChange";
    static EVENT_PORT_ADD = "onPortAdd";
    static EVENT_PORT_REMOVE = "onPortRemove";

    static UI_ERRORLEVEL_HINT = 0;
    static UI_ERRORLEVEL_WARNING = 1;
    static UI_ERRORLEVEL_ERROR = 2;
    static UI_ERRORLEVEL_NOTWORKING = 3;

    #objName = "";
    #log = new Logger("core_op");
    //    #name = "";
    #shortOpName = "";

    opId = ""; // unique op id

    /** @type {Array<Port>} */
    portsOut = [];

    /** @type {Patch} */
    patch = null;

    data = {}; // UNUSED, DEPRECATED, only left in for backwards compatibility with userops
    storage = {}; // op-specific data to be included in export

    /** @type {Array<Port>} */
    portsIn = [];
    portsInData = []; // original loaded patch data

    /** @type {OpUiAttribs} */
    uiAttribs = {};

    /** @type {OpAttribs} */
    attribs = {};

    enabled = true;

    onAnimFrame = null;

    preservedPortTitles = {};
    preservedPortValues = {};
    preservedPortLinks = {};

    /* minimalcore:start */
    linkTimeRules = {
        "needsLinkedToWork": [],
        "needsStringToWork": [],
        "needsParentOp": null
    };

    inValueSlider = this.inFloatSlider;

    /* minimalcore:end */

    shouldWork = {};
    hasUiErrors = 0;

    /** @type {Object} */
    uiErrors = {};
    hasAnimPort = false;

    /** @type {Port} */
    patchId = null; // will be defined by subpatchops

    /**
     * @param {Patch} _patch
     * @param {String} _objName
     * @param {String} _id=null
    */
    constructor(_patch, _objName, _id = null)
    {
        super();

        this.opId = _id;
        this.#objName = _objName;
        this.patch = _patch;

        this.#shortOpName = CABLES.getShortOpName(_objName);
        this.getTitle();

        this.id = _id || shortId(); // instance id
        this.onAddPort = null;
        this.onCreate = null;
        this.onResize = null;
        this.onLoaded = null;
        this.onDelete = null;
        this.onError = null;

        this._instances = null;

        /**
         * overwrite this to prerender shader and meshes / will be called by op `loadingStatus`
         */
        this.preRender = null;

        /**
         * overwrite this to initialize your op
         */
        this.init = null;

        /**
         * Implement to render 2d canvas based graphics from in an op - optionaly defined in op instance
         * @param {CanvasRenderingContext2D} context of canvas 2d
         * @param {Object} layer info
         * @param {number} layer.x x position on canvas
         * @param {number} layer.y y position on canvas
         * @param {number} layer.width width of canvas
         * @param {number} layer.height height of canvas
         * @param {number} layer.scale current scaling of patchfield view
         */
    }

    /* minimalcore:start */
    isInBlueprint2() // will be overwritten in ui
    {
        return false;
    }

    /* minimalcore:end */

    /* minimalcore:start */
    getSubPatch()// will be overwritten in ui
    {
        return 0;
    }

    /* minimalcore:end */

    get name()
    {
        return this.getTitle();
    }

    set name(n)
    {
        this.setTitle(n);
    }

    get tags()
    {
        return this.attribs.tags || [];
    }

    /**
     * @param {string[]} n
     */
    set tags(n)
    {
        this.attribs.tags = n || [];
    }

    /**
     * @param {string} on
     */
    set _objName(on)
    {
        this.#objName = on;
        this.#log = new Logger("op " + on);
    }

    get objName()
    {
        return this.#objName;
    }

    get shortName()
    {
        return this.#shortOpName;
    }

    /**
     * op.require
     *
     * @param {String} _name - module name
     * @returns {Object}
     */
    /* minimalcore:start */
    require(_name)
    {
        if (CABLES.platform && CABLES.StandaloneElectron && !CABLES.platform.frontendOptions.isElectron)
            this.setUiError("notstandalone", "This op will only work in cables standalone version", 3);

        return null;
    }

    /* minimalcore:end */

    /* minimalcore:start */
    checkMainloopExists()
    {
        if (!CABLES.UI) return;
        if (!this.patch.tempData.mainloopOp) this.setUiError("nomainloop", "patch should have a mainloop to use this op");
        else this.setUiError("nomainloop", null);
    }

    /* minimalcore:end */

    /** @returns {string} */
    getTitle()
    {
        if (!this.uiAttribs) return "nouiattribs" + this.shortName;

        return this.uiAttribs.title || this.#shortOpName;
    }

    /**
     * @param {string} title
     */
    setTitle(title)
    {

        if (title != this.getTitle()) this._setUiAttrib({ "title": title });
    }

    /* minimalcore:start */
    /**
     * @param {Object} newAttribs
     */
    setStorage(newAttribs)
    {
        if (!newAttribs) return;
        this.storage = this.storage || {};

        let changed = false;
        for (const p in newAttribs)
        {
            if (this.storage[p] != newAttribs[p]) changed = true;
            this.storage[p] = newAttribs[p];
        }

        if (changed) this.emitEvent("onStorageChange", newAttribs);
    }

    /* minimalcore:end */

    isSubPatchOp()
    {
        if (this.patchId && this.storage) return (this.storage.subPatchVer || this.storage.blueprintVer || 0);
        return false;
    }

    /**
     * setUiAttrib
     * @param {OpUiAttribs} newAttribs, e.g. {"attrib":value}
     * @example
     * op.setUiAttrib({"extendTitle":str});
     */
    setUiAttrib(newAttribs)
    {
        this._setUiAttrib(newAttribs);
    }

    /**
     * @param {OpUiAttribs} a
     */
    setUiAttribs(a)
    {
        this._setUiAttrib(a);
    }

    /* minimalcore:start */
    /**
     * @deprecated
     * @param {OpUiAttribs} a
     */
    uiAttr(a)
    {
        this._setUiAttrib(a);
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {any[]} values
     * @param {string} v
     * @param {boolean} noindex
     */
    inValueSelect(name, values, v, noindex)
    {
        return this.inDropDown(name, values, v, noindex);
    }

    /**
     *
     * @deprecated
     * @param {string} name
     * @param {number} v
     */
    inValueInt(name, v)
    {
        return this.inInt(name, v);
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {string} v
     */
    outFunction(name, v)
    {
        return this.outTrigger(name, v);
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {number} v
     */
    outValue(name, v)
    {
        return this.outNumber(name, v);
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {boolean} v
     */
    outValueBool(name, v)
    {
        return this.outBool(name, v);
    }

    /**
     * deprecated create output boolean port
     * @deprecated
     * @param {String} name
     * @param {boolean} v default value
     * @return {Port} created port
     */
    outBool(name, v)
    {
        // old: use outBoolNum
        const p = this.addOutPort(
            this.newPort(this, name, Port.TYPE_VALUE, {
                "display": "bool"
            })
        );
        if (v !== undefined) p.set(v);
        else p.set(0);
        return p;
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {string} v
     */
    outValueString(name, v)
    {
        const p = this.addOutPort(
            this.newPort(this, name, Port.TYPE_VALUE, {
                "type": "string"
            })
        );
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {any} filter
     * @param {any} options
     * @param {any} v
     */
    inDynamic(name, filter, options, v)
    {
        const p = this.newPort(this, name, Port.TYPE_DYNAMIC, options);

        p.shouldLink = () =>
        {
            if (filter && Array.isArray(filter)) return false; // types do not match
            return true; // no filter set
        };

        this.addInPort(p);
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /* minimalcore:end */

    /**
     * @TODO  move to ui extend class.....
     * @param {OpUiAttribs} newAttribs
     */
    _setUiAttrib(newAttribs)
    {

        /* minimalcore:start */
        if (!newAttribs) return;

        if (typeof newAttribs != "object") this.#log.error("op.uiAttrib attribs are not of type object");
        if (!this.uiAttribs) this.uiAttribs = {};

        let changed = false;
        let emitMove = false;
        if (
            CABLES.UI &&
            newAttribs.hasOwnProperty("translate") &&
            (
                !this.uiAttribs.translate ||
                this.uiAttribs.translate.x != newAttribs.translate.x ||
                this.uiAttribs.translate.y != newAttribs.translate.y
            )) emitMove = true;

        if (newAttribs.hasOwnProperty("title") && newAttribs.title != this.uiAttribs.title)
        {
            this.uiAttribs.title = newAttribs.title;
            changed = true;
        }

        if (newAttribs.hasOwnProperty("disabled"))
        {
            changed = true;
            this.setEnabled(!newAttribs.disabled);
        }

        for (const p in newAttribs)
        {
            if (this.uiAttribs[p] != newAttribs[p]) changed = true;
            this.uiAttribs[p] = newAttribs[p];
        }

        if (this.uiAttribs.hasOwnProperty("vizLayerMaxZoom") && this.uiAttribs.vizLayerMaxZoom == false) delete this.uiAttribs.vizLayerMaxZoom;
        if (this.uiAttribs.hasOwnProperty("highlighted") && this.uiAttribs.highlighted == false) delete this.uiAttribs.highlighted;
        if (this.uiAttribs.hasOwnProperty("highlightedMore") && this.uiAttribs.highlightedMore == false) delete this.uiAttribs.highlightedMore;
        if (this.uiAttribs.hasOwnProperty("selected") && this.uiAttribs.selected == false) delete this.uiAttribs.selected;
        if (this.uiAttribs.hasOwnProperty("selected")) changed = true;

        if (changed)
        {
            this.emitEvent(Op.EVENT_UIATTR_CHANGE, newAttribs);
            this.patch.emitEvent("onUiAttribsChange", this, newAttribs);
        }

        if (emitMove) this.emitEvent("move");

        /* minimalcore:end */

    }

    getName()
    {
        return this.#shortOpName;
    }

    /**
     * @param {Port} p
     */
    addOutPort(p)
    {
        p.direction = CONSTANTS.PORT.PORT_DIR_OUT;
        if (p.op != this) this.#log.error("port op is not this...");
        // p._op = this; // remove if above does never happen....

        this.portsOut.push(p);
        this.emitEvent(Op.EVENT_PORT_ADD, p);
        return p;
    }

    /* minimalcore:start */
    hasDynamicPort()
    {
        let i = 0;
        for (i = 0; i < this.portsIn.length; i++)
        {
            if (this.portsIn[i].type == Port.TYPE_DYNAMIC) return true;
            if (this.portsIn[i].getName() == "dyn") return true;
        }
        for (i = 0; i < this.portsOut.length; i++)
        {
            if (this.portsOut[i].type == Port.TYPE_DYNAMIC) return true;
            if (this.portsOut[i].getName() == "dyn") return true;
        }

        return false;
    }

    /* minimalcore:end */

    /**
     * @param {any | Port | MultiPort} p
     * @param {Port} [afterPort] insert the port after given port
     */
    addInPort(p, afterPort)
    {
        p.direction = Port.DIR_IN;
        p._op = this;

        if (!afterPort)
        {
            this.portsIn.push(p);
        }
        else
        {
            const idx = this.portsIn.indexOf(afterPort);
            this.portsIn.splice(idx + 1, 0, p);
        }
        this.emitEvent(Op.EVENT_PORT_ADD, p);

        return p;
    }

    /**
     *
     * @param {string} name
     * @param {string} v
     */
    inFunction(name, v)
    {
        return this.inTrigger(name, v);
    }

    /**
     * create a trigger input port
     * @param {String} name
     * @param {String} v
     * @return {Port} created port
     *
     */
    inTrigger(name, v)
    {
        const p = this.addInPort(this.newPort(this, name, Port.TYPE_FUNCTION));
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * create multiple UI trigger buttons
     * @param {String} name
     * @param {Array} v
     * @return {Port} created port
     */
    inTriggerButton(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_FUNCTION, {
                "display": "button"
            })
        );
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * @param {string} name
     * @param {any} v
     */
    inUiTriggerButtons(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_FUNCTION, {
                "display": "buttons"
            })
        );
        if (v !== undefined) p.set(v);
        return p;
    }

    /* minimalcore:start */
    /**
     * @deprecated
     * @param {string} name
     * @param {number} v
     */
    inValueFloat(name, v)
    {
        return this.inFloat(name, v);
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {number} v
     */
    inValue(name, v)
    {
        return this.inFloat(name, v);
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {number | boolean} v
     */
    inValueBool(name, v)
    {
        return this.inBool(name, v);
    }

    /* minimalcore:end */

    /**
     * create a number value input port
     * @param {String} name
     * @param {Number} v
     * @return {Port} created port
     */
    inFloat(name, v)
    {
        const p = this.addInPort(this.newPort(this, name, Port.TYPE_VALUE));

        p.setInitialValue(v);

        return p;
    }

    /**
     * create a boolean input port, displayed as a checkbox
     * @param {String} name
     * @param {Boolean|number} v
     * @return {Port} created port
     */
    inBool(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_NUMBER, {
                "display": "bool"
            })
        );

        if (v === true)v = 1;
        if (v === false)v = 0;
        p.setInitialValue(v);

        return p;
    }

    /**
     * @param {string} name
     * @param {number} type
     */
    inMultiPort(name, type, uiAttrs)
    {
        const attrs =
            {
                "addPort": true,
                "hidePort": true
            };

        const p = new MultiPort(this, name, type, Port.DIR_IN, attrs, uiAttrs);

        p.ignoreValueSerialize = true;

        this.addInPort(p);
        p.initPorts();

        return p;
    }

    /**
     * @param {string} name
     * @param {number} type
     * @param {import("./core_port.js").PortUiAttribs} uiAttrs
     */
    inMultiPort2(name, type, uiAttrs, minNum = 2)
    {
        const attrs =
            {
                "addPort": true,
                "hidePort": true
            };

        const p = new MultiPort2(this, name, type, Port.DIR_IN, attrs, uiAttrs, minNum);
        p.ignoreValueSerialize = true;

        this.addInPort(p);
        p.initPorts();

        return p;
    }

    /**
     * @param {string} name
     * @param {number} type
     */
    outMultiPort(name, type, uiAttribsPort = {})
    {
        const p = new MultiPort(
            this,
            name,
            type,
            CONSTANTS.PORT.PORT_DIR_OUT,
            {
                "display": "multiport",
                "hidePort": true
            },
            uiAttribsPort
        );
        p.ignoreValueSerialize = true;

        this.addOutPort(p);
        p.initPorts();

        return p;
    }

    /**
     * @param {string} name
     * @param {number} type
     */
    outMultiPort2(name, type, uiAttribsPort = {}, minNum = 2)
    {
        const p = new MultiPort2(
            this,
            name,
            type,
            CONSTANTS.PORT.PORT_DIR_OUT,
            {
                "display": "multiport",
                "hidePort": true
            },
            uiAttribsPort,
            minNum
        );
        p.ignoreValueSerialize = true;

        this.addOutPort(p);
        p.initPorts();

        return p;
    }

    /**
     * @param {string} name
     * @param {string} v
     */
    inValueString(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_STRING, {
                "type": "string"
            })
        );
        p.value = "";

        p.setInitialValue(v);
        return p;
    }

    /**
     * create a String value input port
     * @param {String} name
     * @param {String} v default value
     * @return {Port} created port
     */
    inString(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_STRING, {
                "type": "string"
            })
        );
        v = v || "";

        p.setInitialValue(v);
        return p;
    }

    // /**
    //  * create a String value input port displayed as TextArea
    //  * @memberof Op
    //  * @param {String} name
    //  * @param {String} v default value
    //  * @return {Port} created port
    //  */
    // inValueText(name, v)
    // {
    //     const p = this.addInPort(
    //         this.newPort(this, name, Port.TYPE_VALUE, {
    //             "type": "string",
    //             "display": "text"
    //         })
    //     );
    //     p.value = "";

    //     p.setInitialValue(v);

    //     /*
    //      * if (v !== undefined)
    //      * {
    //      *     p.set(v);
    //      *     p.defaultValue = v;
    //      * }
    //      */
    //     return p;
    // }

    /**
     * @param {string} name
     * @param {string} v
     */
    inTextarea(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_STRING, {
                "type": "string",
                "display": "text"
            })
        );
        p.value = "";
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /**
     * create a String value input port displayed as editor
     * @param {String} name
     * @param {String} v default value
     * @param {String} syntax language
     * @param {Boolean} hideFormatButton
     * @return {Port} created port
     */
    inStringEditor(name, v, syntax, hideFormatButton = true)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_STRING, {
                "type": "string",
                "display": "editor",
                "editShortcut": true,
                "editorSyntax": syntax,
                "hideFormatButton": hideFormatButton
            }));

        p.value = "";
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /**
     *
     * @param {string} name
     * @param {String} v
     * @param {String} syntax
     */
    inValueEditor(name, v, syntax, hideFormatButton = true)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_NUMBER, {
                "type": "string",
                "display": "editor",
                "editorSyntax": syntax,
                "hideFormatButton": hideFormatButton
            })
        );
        p.value = "";
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /**
     * create a string select box
     * @param {String} name
     * @param {Array} values
     * @param {String} v default value
     * @param {boolean} [noindex]
     * @return {Port} created port
     */
    inDropDown(name, values, v, noindex)
    {
        let p = null;
        if (!noindex)
        {
            const indexPort = this.newPort(this, name + " index", Port.TYPE_NUMBER, {
                "increment": "integer",
                "hideParam": true
            });
            const n = this.addInPort(indexPort);

            if (values) for (let i = 0; i < values.length; i++) values[i] = String(values[i]);

            const valuePort = new SwitchPort(
                this,
                name,
                Port.TYPE_STRING,
                {
                    "display": "dropdown",
                    "hidePort": true,
                    "type": "string",
                    "values": values
                },
                n
            );

            valuePort.indexPort = indexPort;

            valuePort.on("change", (/** @type {any} */ val, /** @type {Port} */ thePort) =>
            {
                if (!thePort.indexPort.isLinked() && thePort.uiAttribs.values)
                {
                    const idx = thePort.uiAttribs.values.indexOf(val);
                    if (idx > -1) thePort.indexPort.set(idx);
                }
            });

            indexPort.on(Port.EVENT_LINK_CHANGED, () =>
            {
                valuePort.setUiAttribs({ "greyout": indexPort.isLinked() });
                valuePort.forceChange();
            });

            p = this.addInPort(valuePort);

            if (v !== undefined)
            {
                p.set(v);
                const index = values.findIndex((item) => { return item == v; });
                n.setValue(index);
                p.defaultValue = v;
                n.defaultValue = index;
            }
        }
        else
        {
            const valuePort = this.newPort(this, name, Port.TYPE_STRING, {
                "display": "dropdown",
                "hidePort": true,
                "type": "string",
                "values": values
            });

            p = this.addInPort(valuePort);
        }

        return p;
    }

    /**
     * create a string switch box
     * @param {String} name
     * @param {Array} values
     * @param {String} v default value
     * @param {boolean} noindex
     * @return {Port} created port
     */
    inSwitch(name, values, v, noindex)
    {
        let p = null;
        if (!noindex)
        {
            if (!v)v = values[0];
            const indexPort = this.newPort(this, name + " index", Port.TYPE_VALUE, {
                "increment": "integer",
                "values": values,
                "hideParam": true
            });
            const n = this.addInPort(indexPort);

            if (values) for (let i = 0; i < values.length; i++) values[i] = String(values[i]);

            const switchPort = new SwitchPort(
                this,
                name,
                Port.TYPE_STRING,
                {
                    "display": "switch",
                    "hidePort": true,
                    "type": "string",
                    "values": values
                },
                n
            );

            switchPort.indexPort = indexPort;

            switchPort.on("change", (val, thePort) =>
            {
                if (!thePort.indexPort.isLinked() && thePort.uiAttribs.values)
                {
                    const idx = thePort.uiAttribs.values.indexOf(val);
                    if (idx > -1) thePort.indexPort.set(idx);
                }
            });
            p = this.addInPort(switchPort);

            indexPort.on(Port.EVENT_LINK_CHANGED, () =>
            {
                switchPort.setUiAttribs({ "greyout": indexPort.isLinked() });
                switchPort.forceChange();
            });

            if (v !== undefined)
            {
                p.set(v);
                const index = values.findIndex((item) => { return item == v; });
                n.setValue(index);
                p.defaultValue = v;
                n.defaultValue = index;
            }
        }
        else
        {
            const switchPort = this.newPort(this, name, Port.TYPE_STRING, {
                "display": "switch",
                "hidePort": true,
                "type": "string",
                "values": values
            });
            p = this.addInPort(switchPort);
        }

        return p;
    }

    /**
     * create a integer input port
     * @param {String} name
     * @param {number} v default value
     * @return {Port} created port
     */
    inInt(name, v)
    {
        // old
        const p = this.addInPort(this.newPort(this, name, Port.TYPE_VALUE, { "increment": "integer" }));
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /**
     * create a file/URL input port
     * @param {String} name
     * @param {String} filter
     * @param {String} v
     * @return {Port} created port
     */
    inFile(name, filter, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_VALUE, {
                "display": "file",
                "type": "string",
                "filter": filter
            })
        );
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /**
     * create a file/URL input port
     * @param {String} name
     * @param {String} filter
     * @param {String} v
     * @return {Port} created port
     */
    inUrl(name, filter, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_STRING, {
                "display": "file",
                "type": "string",
                "filter": filter
            })
        );
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /**
     * create a texture input port
     * @param {String} name
     * @param {any} v
     * @return {Port} created port
     */
    inTexture(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_OBJECT, {
                "display": "texture",
                "objType": "texture",
                "preview": true
            })
        );
        p.ignoreValueSerialize = true;
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * create a object input port
     * @param {String} name
     * @param {Object} v
     * @param {String} objType
     * @return {Port} created port
     */
    inObject(name, v, objType)
    {
        const p = this.addInPort(this.newPort(this, name, Port.TYPE_OBJECT, { "objType": objType }));
        p.ignoreValueSerialize = true;

        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * @param {string} name
     * @param {string} v
     */
    inGradient(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_STRING, {
                "display": "gradient"
            })
        );
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * @param {string} name
     * @param {string} v
     */
    inCurve(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_STRING, {
                "display": "curve"
            })
        );
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * @param {Port} p
     * returns {number}
     */
    getPortVisibleIndex(p)
    {
        let ports = this.portsIn;
        if (p.direction == CONSTANTS.PORT_DIR_OUT)ports = this.portsOut;

        let index = 0;
        for (let i = 0; i < ports.length; i++)
        {
            if (ports[i].uiAttribs.hidePort) continue;
            index++;
            if (ports[i] == p) return index;
        }
    }

    /**
     * create a array input port
     * @param {String} name
     * @param {Array|Number} v
     * @param {Number} _stride
     * @return {Port} created port
     */
    inArray(name, v = undefined, _stride = undefined)
    {
        let stride = _stride;
        // @ts-ignore
        if (!_stride && CABLES.isNumeric(v))stride = v;

        const p = this.addInPort(this.newPort(this, name, Port.TYPE_ARRAY, { "stride": stride }));

        if (v !== undefined && (Array.isArray(v) || v == null)) p.set(v);

        return p;
    }

    /**
     * create a value slider input port
     * @param {String} name
     * @param {number} v
     * @param {number} min
     * @param {number} max
     * @return {Port} created port
     */
    inFloatSlider(name, v, min, max)
    {
        const uiattribs = { "display": "range" };

        if (min != undefined && max != undefined)
        {
            uiattribs.min = min;
            uiattribs.max = max;
        }

        const p = this.addInPort(this.newPort(this, name, Port.TYPE_VALUE, uiattribs));
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /**
     * create output trigger port
     * @param {String} name
     * @param {String} v
     * @return {Port} created port
     */
    outTrigger(name, v)
    {
        // old
        const p = this.addOutPort(this.newPort(this, name, Port.TYPE_FUNCTION));
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * create output value port
     * @param {String} name
     * @param {number} v default value
     * @return {Port} created port
     */
    outNumber(name, v)
    {
        const p = this.addOutPort(this.newPort(this, name, Port.TYPE_VALUE));
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * create output boolean port,value will be converted to 0 or 1
     * @param {String} name
     * @param {string | number | boolean | any[]} v
     * @return {Port} created port
     */
    outBoolNum(name, v)
    {
        const p = this.addOutPort(
            this.newPort(this, name, Port.TYPE_VALUE, {
                "display": "boolnum"
            })
        );

        p.set = function (b)
        {
            this.setValue(b ? 1 : 0);
        }.bind(p);

        if (v !== undefined) p.set(v);
        else p.set(0);
        return p;
    }

    /**
     * create output string port
     * @param {string} name
     * @param {String} v
     * @return {Port} created port
     */
    outString(name, v)
    {
        const p = this.addOutPort(
            this.newPort(this, name, Port.TYPE_STRING, {
                "type": "string"
            })
        );
        if (v !== undefined) p.set(v);
        else p.set("");
        return p;
    }

    /**
     * create output object port
     * @param {String} name
     * @return {Port} created port
     * @param {object} v
     * @param {string} objType
     */
    outObject(name, v, objType)
    {
        const p = this.addOutPort(this.newPort(this, name, Port.TYPE_OBJECT, { "objType": objType || null }));
        p.set(v || null);
        p.ignoreValueSerialize = true;
        return p;
    }

    /**
     * create output array port
     * @param {String} name
     * @return {Port} created port
     * @param {array|number} v
     * @param {number} stride
     */
    outArray(name, v, stride)
    {
        if (!stride && CABLES.isNumeric(v))stride = v;
        const p = this.addOutPort(this.newPort(this, name, Port.TYPE_ARRAY, { "stride": stride }));
        if (v !== undefined && (Array.isArray(v) || v == null)) p.set(v);

        p.ignoreValueSerialize = true;
        return p;
    }

    /**
     * create output texture port
     * @abstract
     * @param {String} name
     * @return {Port} created port
     * @param {any} v
     */
    outTexture(name, v)
    {
        // overwrite in gui...
        return null;
    }

    removeLinks()
    {
        for (let i = 0; i < this.portsIn.length; i++) this.portsIn[i].removeLinks();
        for (let i = 0; i < this.portsOut.length; i++) this.portsOut[i].removeLinks();
    }

    // @TODO should be move to extend...
    getSerialized()
    {

        /* minimalcore:start */
        const opObj = {};

        if (this.opId) opObj.opId = this.opId;
        if (this.patch.storeObjNames) opObj.objName = this.objName;

        opObj.id = this.id;
        opObj.attribs = cloneObject(this.attribs) || {};
        opObj.uiAttribs = cloneObject(this.uiAttribs) || {};

        if (this.storage && Object.keys(this.storage).length > 0) opObj.storage = structuredClone(this.storage);
        if (this.uiAttribs.hasOwnProperty("working") && this.uiAttribs.working == true) delete this.uiAttribs.working;
        if (opObj.uiAttribs.hasOwnProperty("uierrors")) delete opObj.uiAttribs.uierrors;
        if (opObj.uiAttribs.hasOwnProperty("highlighted")) delete opObj.uiAttribs.highlighted;
        if (opObj.uiAttribs.hasOwnProperty("highlightedMore")) delete opObj.uiAttribs.highlightedMore;
        if (opObj.uiAttribs.hasOwnProperty("heatmapIntensity")) delete opObj.uiAttribs.heatmapIntensity;

        if (opObj.uiAttribs.title === "") delete opObj.uiAttribs.title;
        if (opObj.uiAttribs.color === null) delete opObj.uiAttribs.color;
        if (opObj.uiAttribs.comment === null) delete opObj.uiAttribs.comment;

        if (opObj.uiAttribs.title == this.#shortOpName ||
            (this.uiAttribs.title || "").toLowerCase() == this.#shortOpName.toLowerCase()) delete opObj.uiAttribs.title;

        opObj.portsIn = [];
        opObj.portsOut = [];

        for (let i = 0; i < this.portsIn.length; i++)
        {
            const s = this.portsIn[i].getSerialized();
            if (s) opObj.portsIn.push(s);
        }

        for (let i = 0; i < this.portsOut.length; i++)
        {
            const s = this.portsOut[i].getSerialized();
            if (s) opObj.portsOut.push(s);
        }

        if (opObj.portsIn.length == 0) delete opObj.portsIn;
        if (opObj.portsOut.length == 0) delete opObj.portsOut;
        cleanJson(opObj);

        return opObj;

        /* minimalcore:end */
    }

    /**
     * @param {number} type
     */
    getFirstOutPortByType(type)
    {
        for (let i = 0; i < this.portsOut.length; i++)
            if (this.portsOut[i].type == type) return this.portsOut[i];
    }

    /**
     * @param {number} type
     */
    getFirstInPortByType(type)
    {
        for (let i = 0; i < this.portsIn.length; i++)
            if (this.portsIn[i].type == type) return this.portsIn[i];
    }

    /**
     * return port by the name portName
     * @param {String} name
     * @param {boolean} [lowerCase]
     * @return {Port}
     */
    getPort(name, lowerCase = false)
    {
        return this.getPortByName(name, lowerCase);
    }

    /**
     * @param {string} name
     * @param {boolean} [lowerCase]
     * @returns {Port}
     */
    getPortByName(name, lowerCase = false)
    {
        if (lowerCase)
        {
            for (let ipi = 0; ipi < this.portsIn.length; ipi++)
                if (this.portsIn[ipi].getName().toLowerCase() == name || this.portsIn[ipi].id.toLowerCase() == name)
                    return this.portsIn[ipi];

            for (let ipo = 0; ipo < this.portsOut.length; ipo++)
                if (this.portsOut[ipo].getName().toLowerCase() == name || this.portsOut[ipo].id.toLowerCase() == name)
                    return this.portsOut[ipo];
        }
        else
        {
            for (let ipi = 0; ipi < this.portsIn.length; ipi++)
                if (this.portsIn[ipi].getName() == name || this.portsIn[ipi].id == name)
                    return this.portsIn[ipi];

            for (let ipo = 0; ipo < this.portsOut.length; ipo++)
                if (this.portsOut[ipo].getName() == name || this.portsOut[ipo].id == name)
                    return this.portsOut[ipo];
        }
    }

    /**
     * return port by the name id
     * @param {String} id
     * @return {Port}
     */
    getPortById(id)
    {
        for (let ipi = 0; ipi < this.portsIn.length; ipi++) if (this.portsIn[ipi].id == id) return this.portsIn[ipi];
        for (let ipo = 0; ipo < this.portsOut.length; ipo++) if (this.portsOut[ipo].id == id) return this.portsOut[ipo];
    }

    updateAnims()
    {
        if (this.hasAnimPort)
            for (let i = 0; i < this.portsIn.length; i++) this.portsIn[i].updateAnim();
    }

    log()
    {
        this.#log.log(...arguments);
    }

    logError()
    {
        this.#log.error(...arguments);
    }

    logWarn()
    {
        this.#log.warn(...arguments);
    }

    logVerbose()
    {
        this.#log.verbose(...arguments);
    }

    /* minimalcore:start */

    /**
     * @deprecated
     */
    error()
    {
        this.#log.error(...arguments);
    }

    /**
     * @deprecated
     */
    warn()
    {
        this.#log.warn(...arguments);
    }

    /**
     * @deprecated
     */
    verbose()
    {
        this.#log.verbose(...arguments);
    }

    /* minimalcore:end */
    // todo: check instancing stuff?
    cleanUp()
    {

        /* minimalcore:start */
        if (this._instances)
        {
            for (let i = 0; i < this._instances.length; i++)
                if (this._instances[i].onDelete) this._instances[i].onDelete();

            this._instances.length = 0;
        }

        for (let i = 0; i < this.portsIn.length; i++)
            this.portsIn[i].setAnimated(false);

        if (this.onAnimFrame) this.patch.removeOnAnimFrame(this);

    /* minimalcore:end */
    }

    // todo: check instancing stuff?
    instanced(triggerPort)
    {
        return false;

        /*
         * this._log.log("instanced", this.patch.instancing.numCycles());
         * if (this.patch.instancing.numCycles() === 0) return false;
         */

        /*
         * let i = 0;
         * let ipi = 0;
         * if (!this._instances || this._instances.length != this.patch.instancing.numCycles())
         * {
         *     if (!this._instances) this._instances = [];
         *     this._.log("creating instances of ", this.objName, this.patch.instancing.numCycles(), this._instances.length);
         *     this._instances.length = this.patch.instancing.numCycles();
         */

        /*
         *     for (i = 0; i < this._instances.length; i++)
         *     {
         *         this._instances[i] = this.patch.createOp(this.objName, true);
         *         this._instances[i].instanced ()
         *         {
         *             return false;
         *         };
         *         this._instances[i].uiAttr(this.uiAttribs);
         */

        /*
         *         for (let ipo = 0; ipo < this.portsOut.length; ipo++)
         *         {
         *             if (this.portsOut[ipo].type == Port.TYPE_FUNCTION)
         *             {
         *                 this._instances[i].getPortByName(this.portsOut[ipo].name).trigger = this.portsOut[ipo].trigger.bind(this.portsOut[ipo]);
         *             }
         *         }
         *     }
         */

        /*
         *     for (ipi = 0; ipi < this.portsIn.length; ipi++)
         *     {
         *         this.portsIn[ipi].onChange = null;
         *         this.portsIn[ipi].onValueChanged = null;
         *     }
         * }
         */

        /*
         * const theTriggerPort = null;
         * for (ipi = 0; ipi < this.portsIn.length; ipi++)
         * {
         *     if (
         *         this.portsIn[ipi].type == Port.TYPE_VALUE ||
         *         this.portsIn[ipi].type == Port.TYPE_ARRAY
         *     )
         *     {
         *         this._instances[this.patch.instancing.index()].portsIn[ipi].set(this.portsIn[ipi].get());
         *     }
         *     if (this.portsIn[ipi].type == Port.TYPE_FUNCTION)
         *     {
         *         // if(this._instances[ this.patch.instancing.index() ].portsIn[ipi].name==triggerPort.name)
         *         // theTriggerPort=this._instances[ this.patch.instancing.index() ].portsIn[ipi];
         *     }
         * }
         */

        // if (theTriggerPort) theTriggerPort.onTriggered();

        /*
         * for (ipi = 0; ipi < this.portsOut.length; ipi++)
         * {
         *     if (this.portsOut[ipi].type == Port.TYPE_VALUE)
         *     {
         *         this.portsOut[ipi].set(this._instances[this.patch.instancing.index()].portsOut[ipi].get());
         *     }
         * }
         */

        // return true;
    }

    // todo: check instancing stuff?
    initInstancable()
    {
        //         if(this.isInstanced)
        //         {
        //             this._log.log('cancel instancing');
        //             return;
        //         }
        //         this._instances=[];
        //         for(var ipi=0;ipi<this.portsIn.length;ipi++)
        //         {
        //             if(this.portsIn[ipi].type==Port.TYPE_VALUE)
        //             {
        //
        //             }
        //             if(this.portsIn[ipi].type==Port.TYPE_FUNCTION)
        //             {
        //                 // var piIndex=ipi;
        //                 this.portsIn[ipi].onTriggered=function(piIndex)
        //                 {
        //
        //                     var i=0;
        // // this._log.log('trigger',this._instances.length);
        //
        //                 }.bind(this,ipi );
        //
        //             }
        // };
        // this._instances=null;
    }

    // setValues(obj)
    // {
    //     for (const i in obj)
    //     {
    //         const port = this.getPortByName(i);
    //         if (port) port.set(obj[i]);
    //         else this._log.warn("op.setValues: port not found:", i);
    //     }
    // }

    /**
     * return true if op has this error message id
     * @param {String} id
     * @returns {Boolean} - has id
     */
    hasUiError(id)
    {

        /* minimalcore:start */
        return this.uiErrors.hasOwnProperty(id) && this.uiErrors[id];

        /* minimalcore:end */
    }

    /**
     * show op error message - set message to null to remove error message
     * @param {string} _id error id
     * @param {string} _txt text message
     * @param {number} _level level
     */
    setUiError(_id, _txt, _level = 2, _options = {})
    {
        const a = { "_txt": _txt };
        // overwritten in ui: core_extend_op
        if (_level >= 2)showUiErrors(this, _id, _txt, _level, _options);
    }

    /**
     * enable/disable op
     * @function
     * @param {boolean} b
     */
    setEnabled(b)
    {
        this.enabled = b;
        this.emitEvent("onEnabledChange", b);
    }

    /**
     * organize ports into a group
     * @function
     * @param {String} name
     * @param {Array} ports
     */
    setPortGroup(name, ports)
    {

        /* minimalcore:start */
        for (let i = 0; i < ports.length; i++)
        {
            if (ports[i])
                if (ports[i].setUiAttribs) ports[i].setUiAttribs({ "group": name });
                else this.#log.error("setPortGroup: invalid port!");
        }

        /* minimalcore:end */
    }

    /**
     * visually indicate ports that they are coordinate inputs
     * @function
     * @param {Port} px
     * @param {Port} py
     * @param {Port} pz
     */
    setUiAxisPorts(px, py, pz)
    {

        /* minimalcore:start */
        if (px) px.setUiAttribs({ "axis": "X" });
        if (py) py.setUiAttribs({ "axis": "Y" });
        if (pz) pz.setUiAttribs({ "axis": "Z" });

        /* minimalcore:end */
    }

    /**
     * remove port from op
     * @param {Port} port to remove
     */
    removePort(port)
    {
        for (let ipi = 0; ipi < this.portsIn.length; ipi++)
        {
            if (this.portsIn[ipi] == port)
            {
                this.portsIn.splice(ipi, 1);
                this.emitEvent(Op.EVENT_UIATTR_CHANGE, {});
                this.emitEvent("onPortRemoved", {});
                return;
            }
        }
        for (let ipi = 0; ipi < this.portsOut.length; ipi++)
        {
            if (this.portsOut[ipi] == port)
            {
                this.portsOut.splice(ipi, 1);
                this.emitEvent(Op.EVENT_UIATTR_CHANGE, {});
                this.emitEvent("onPortRemoved", {});
                return;
            }
        }
    }

    /**
     * show a warning of this op is not a child of parentOpName
     * @function
     * @param {String} parentOpName
     */
    toWorkNeedsParent(parentOpName)
    {

        /* minimalcore:start */
        this.linkTimeRules.needsParentOp = parentOpName;

        /* minimalcore:end */
    }

    /**
     * show a warning of this op is a child of parentOpName
     * @param {String} parentOpName
     * @param {number} type
     */
    toWorkShouldNotBeChild(parentOpName, type)
    {

        /* minimalcore:start */
        if (!this.patch.isEditorMode()) return;
        this.linkTimeRules.forbiddenParent = parentOpName;
        if (type != undefined) this.linkTimeRules.forbiddenParentType = type;

        /* minimalcore:end */
    }

    toWorkPortsNeedsString()
    {

        /* minimalcore:start */
        if (!this.patch.isEditorMode()) return;
        for (let i = 0; i < arguments.length; i++)
            if (this.linkTimeRules.needsStringToWork.indexOf(arguments[i]) == -1) this.linkTimeRules.needsStringToWork.push(arguments[i]);

        /* minimalcore:end */
    }

    /**
     * show a small X to indicate op is not working when given ports are not linked
     * @param {Array<Port>} port
     */
    toWorkPortsNeedToBeLinked()
    {

        /* minimalcore:start */
        if (!this.patch.isEditorMode()) return;
        for (let i = 0; i < arguments.length; i++)
            if (this.linkTimeRules.needsLinkedToWork.indexOf(arguments[i]) == -1) this.linkTimeRules.needsLinkedToWork.push(arguments[i]);

        /* minimalcore:end */
    }

    toWorkPortsNeedToBeLinkedReset()
    {

        /* minimalcore:start */
        if (!this.patch.isEditorMode()) return;
        this.linkTimeRules.needsLinkedToWork.length = 0;
        if (this.checkLinkTimeWarnings) this.checkLinkTimeWarnings();

        /* minimalcore:end */
    }

    initVarPorts()
    {
        for (let i = 0; i < this.portsIn.length; i++)
            if (this.portsIn[i].getVariableName()) this.portsIn[i].setVariable(this.portsIn[i].getVariableName());
    }

    checkLinkTimeWarnings() {}
    _checkLinksNeededToWork() { }

    /**
     * refresh op parameters, if current op is selected
     */
    refreshParams()
    {

        /* minimalcore:start */
        if (this.patch && this.patch.isEditorMode() && this.isCurrentUiOp()) Patch.getGui().opParams.show(this);

        /* minimalcore:end */
    }

    /**
     * Returns true if op is selected and parameter are shown in the editor, can only return true if in editor/ui
     * @returns {Boolean} - is current ui op
     */
    isCurrentUiOp()
    {

        /* minimalcore:start */
        if (this.patch.isEditorMode()) return Patch.getGui().patchView.isCurrentOp(this);

        /* minimalcore:end */
    }

    /**
     *
     * @param {Number} api graphics api, 1 = webgl, 2 = webgpu
     */
    checkGraphicsApi(api = 1)
    {

        /* minimalcore:start */
        if (this.patch.isEditorMode())
            if (this.patch.cg && this.patch.cg.gApi != api)
                this.setUiError("wronggapi", "Wrong graphics API", 2);

        /* minimalcore:end */

    }

    /**
     * @param {Op} op
     * @param {string} name
     * @param {number} type
     * @param {import("./core_port.js").PortUiAttribs} [uiAttribs]
     */
    newPort(op, name, type, uiAttribs)
    {
        return new CABLES.Port(op, name, type, uiAttribs);
    }

}

;// CONCATENATED MODULE: ./src/core/embedding.js



const EMBED = {};

/* minimalcore:start */

/**
 * add patch into html element (will create canvas and set size to fill containerElement)
 * @name CABLES.EMBED#addPatch
 * @param {object|string} _element containerElement dom element or id of element
 * @param {Object} options patch options
 * @function
 */
EMBED.addPatch = function (_element, options)
{
    let el = _element;
    let id = generateUUID();
    if (typeof _element == "string")
    {
        id = _element;
        el = document.getElementById(id);

        if (!el)
        {
            console.error(id + " Container Element not found!"); // eslint-disable-line
            return;
        }
    }

    const canvEl = document.createElement("canvas");
    canvEl.id = "glcanvas_" + id;
    canvEl.width = el.clientWidth;
    canvEl.height = el.clientHeight;

    window.addEventListener(
        "resize",
        function ()
        {
            this.height = el.clientHeight;
            this.width = el.clientWidth;
        }.bind(canvEl),
    );

    el.appendChild(canvEl);

    options = options || {};
    options.glCanvasId = canvEl.id;

    if (!options.onError)
    {
        options.onError = function (err)
        {
            console.error(err);// eslint-disable-line
        };
    }

    CABLES.patch = new Patch(options);
    return canvEl;
};



/* minimalcore:end */

;// CONCATENATED MODULE: ./src/core/core_profiler.js



/**
 * @typedef ProfilerItem
 * @property  {String} [title] overwrite title of port (by default this is portname)
 * @property numTriggers {number}
 * @property timeUsed {number}
 * @property timeUsedFrame {number}
 * @property opid {string}
 * @property subPatch {string}

 * @property timePsMsAvg {number}
 * @property timePsMs {number}
 * @property timePsCount {number}
 * @property _timePsCount {number}
 * @property _timePsStart {number}
 * @property _timePsMs {number}
 */

class Profiler
{

    /* minimalcore:start */
    /**
     * @param {Patch} patch
     */
    constructor(patch)
    {
        this.startFrame = patch.getFrameNum();

        /** @type {Object.<string, ProfilerItem>} */
        this.items = {};
        this.currentId = null;
        this.currentStart = 0;
        this._patch = patch;
    }

    getItems()
    {
        return this.items;
    }

    clear()
    {
        this.currentStart = performance.now();
        if (this.paused) return;
        this.items = {};
    }

    togglePause()
    {
        this.paused = !this.paused;
        if (!this.paused)
        {
            this.items = {};
            this.currentStart = performance.now();
        }
    }

    /**
     * @param {any} type
     * @param {Object} object
     */
    add(type, object)
    {
        if (this.paused) return;

        if (this.currentId !== null)
        {
            if (!object || object.id != this.currentId)
            {
                const item = this.items[this.currentId];
                if (item)
                {
                    item.timeUsed += performance.now() - this.currentStart;
                    item._timePsCount++;
                    item._timePsMs += performance.now() - this.currentStart;

                    if (item._timePsStart == 0 || performance.now() > item._timePsStart + 1000)
                    {
                        item.timePsMs = item._timePsMs;
                        item.timePsMsAvg = item._timePsMs / item._timePsCount;
                        item.timePsCount = item._timePsCount;
                        item._timePsCount = 0;
                        item._timePsMs = 0;
                        item._timePsStart = performance.now();
                    }

                    if (!item.peakTime || now() - item.peakTime > 5000)
                    {
                        item.peak = 0;
                        item.peakTime = now();
                    }
                    item.peak = Math.max(item.peak, performance.now() - this.currentStart);
                }
            }
        }

        if (object !== null)
        {
            if (!this.items[object.id])
            {
                this.items[object.id] = {
                    "numTriggers": 0,
                    "timeUsed": 0,
                    "timeUsedFrame": 0,
                    "timePsMsAvg": 0,
                    "timePsMs": 0,
                    "_timePsCount": 0,
                    "_timePsMs": 0,
                    "_timePsStart": performance.now()
                };
            }

            if (this.items[object.id].lastFrame != this._patch.getFrameNum()) this.items[object.id].numTriggers = 0;

            this.items[object.id].lastFrame = this._patch.getFrameNum();
            this.items[object.id].numTriggers++;
            this.items[object.id].opid = object.op.id;
            this.items[object.id].title = object.op.name + "." + object.name;
            this.items[object.id].subPatch = object.op.uiAttribs.subPatch;

            this.currentId = object.id;
            this.currentStart = performance.now();
        }
        else
        {
            this.currentId = null;
        }
    }

    print()
    {
        for (const i in this.items)
        {
            console.log(this.items[i].title + ": " + this.items[i].numTriggers + " / " + this.items[i].timeUsed); // eslint-disable-line
        }
    }

    /* minimalcore:end */
}

;// CONCATENATED MODULE: ./src/core/sessionvar.js
// todo: old... remove this from ops...

/* minimalcore:start */
/**
 * todo: old... remove this from ops...
 *
 * @class
 */
const Variable = function ()
{
    let value = null;
    const changedCallbacks = [];

    this.onChanged = function (f)
    {
        changedCallbacks.push(f);
    };

    this.getValue = function ()
    {
        return value;
    };

    this.setValue = function (v)
    {
        value = v;
        this.emitChanged();
    };

    this.emitChanged = function ()
    {
        for (let i = 0; i < changedCallbacks.length; i++)
        {
            changedCallbacks[i]();
        }
    };
};



/* minimalcore:end */

;// CONCATENATED MODULE: ./src/core/renderloop.js


class RenderLoop extends Events
{
    paused = false;
    frameNum = 0;

    frameStartTime = 0;

    /**
     * @param {number} _timestamp
     */
    exec(_timestamp) {}
    pause() {}
    resume() {}

}

;// CONCATENATED MODULE: ./src/core/stack.js
class Stack
{
    #arr = [];

    /**
     * @param {any} a
     */
    push(a)
    {
        this.#arr.push(a);
    }

    pop()
    {
        return this.#arr.pop();
    }

    clear()
    {
        this.#arr.length = 0;
        return this;
    }

    current()
    {
        return this.#arr[this.#arr.length - 1];
    }

    array()
    {
        return this.#arr;
    }

}

;// CONCATENATED MODULE: ./src/core/memprofiler.js
class MemProfiler
{
    items = {};
    usageCpu = 0;
    usageGpu = 0;

    constructor()
    {
        setInterval(() =>
        {
            let sum = 0;
            let sumGpu = 0;
            let count = 0;
            for (const i in this.items)
            {
                sumGpu += this.items[i].sizeGpu;
                sum += this.items[i].size;
                count++;
            }

            this.usageCpu = sum;
            this.usageGpu = sumGpu;
        }, 2000);

    }

    getUsage()
    {
        return this.usageCpu;
    }

    getUsageGpu()
    {
        return this.usageGpu;
    }

    /**
     * @param {MemProfilerItem} item
     */
    add(item)
    {
        this.items[item.id] = item;
    }

    remove(item)
    {
        delete this.items[item.id];
    }
}

class MemProfilerItem
{

    id = CABLES.uuid();
    name = "";
    type = "";
    size = 0;
    category = 0;
    data = {};

    /**
     * @param {string} [name]
     * @param {string} [type]
     * @param {number} [size]
     * @param {{}} [data]
     */
    constructor(name, type, size, data)
    {
        this.name = name,
        this.type = type;
        this.size = size || 0;
        this.sizeGpu = 0;
        this.data = data;
        CABLES.memProfiler.add(this);
    }

    dispose()
    {
        this.size = 0;
        CABLES.memProfiler.remove(this);
    }

    /**
     * @param {number} s
     */
    setSize(s)
    {
        this.size = s;
    }

    /**
     * @param {number} s
     */
    setSizeGpu(s)
    {
        this.sizeGpu = s;
    }
}

;// CONCATENATED MODULE: ./src/core/index.js




















CABLES = CABLES || {};
CABLES = {
    ...CABLES,
    ...CONSTANTS.PORT,
    ...CONSTANTS.PACO,
    ...CONSTANTS.ANIM,
    ...CONSTANTS.OP
};

CABLES.EMBED = EMBED;
CABLES.Link = Link;
CABLES.Port = Port;
CABLES.Op = Op;
CABLES.Profiler = Profiler;
CABLES.Patch = Patch;
CABLES.Timer = Timer;
CABLES.LoadingStatus = LoadingStatus;
CABLES.now = now;
CABLES.internalNow = internalNow;
CABLES.Anim = Anim;
CABLES.AnimKey = AnimKey;
CABLES.RenderLoop = RenderLoop;
CABLES.idleCallbackSoon = idleCallbackSoon;
CABLES.idleCallback = idleCallback;
CABLES.cloneObject = cloneObject;

CABLES.shortId = shortId;
CABLES.uuid = uuid;
CABLES.getShortOpName = getShortOpName;
CABLES.simpleId = simpleId;
CABLES.clamp = clamp;
CABLES.map = map;
CABLES.generateUUID = generateUUID;
CABLES.prefixedHash = prefixedHash;
CABLES.smoothStep = smoothStep;
CABLES.smootherStep = smootherStep;
CABLES.copyArray = copyArray;
CABLES.basename = basename;
CABLES.logStack = logStack;
CABLES.filename = filename;

/* minimalcore:start */
CABLES.ajax = ajax;
CABLES.cacheBust = cacheBust;
CABLES.shuffleArray = shuffleArray;
CABLES.Variable = Variable;

/* minimalcore:end */

CABLES.logErrorConsole = logErrorConsole;
CABLES.isNumeric = isNumeric;
CABLES.uniqueArray = uniqueArray;
CABLES.Stack = Stack;

/** @type {Array<Op>} */
CABLES.OPS = [];
CABLES.utils = utils_namespaceObject;
CABLES.CONSTANTS = CONSTANTS;

CABLES.SHARED = {};
CABLES.SHARED.Events = Events;
CABLES.SHARED.Logger = Logger;
CABLES.memProfiler = new MemProfiler();
CABLES.MemProfilerItem = MemProfilerItem;

/* harmony default export */ const core = (CABLES);
// add additional exports to CABLES as well (see above i.e. CABLES.Port) to make them avaialable in corelibs...
// this is because corelibs are build/loaded via webpack and expect these exports to be avaialable on the global CABLES object


if (!(function () { return !this; }())) console.warn("not in strict mode: index core"); // eslint-disable-line

})();

var __webpack_export_target__ = (CABLES = typeof CABLES === "undefined" ? {} : CABLES);
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;


var CABLES = CABLES || {}; CABLES.build = {"timestamp":1783592430559,"created":"2026-07-09T10:20:30.559Z","git":{"branch":"develop","commit":"eadf9affc66eed407a2f4b732751742221563a0a","date":"1783590099","message":"fix gltfnodetransforms mixed anim/static rotations and sorting - cables-gl/cables/issues/8404"}};
//# cables.js.map