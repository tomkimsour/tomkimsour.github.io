let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_36(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures__invoke1_mut__h0e75e54519953264(arg0, arg1, addHeapObject(arg2));
}

function makeClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        try {
            return f(state.a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b);
                state.a = 0;

            }
        }
    };
    real.original = state;

    return real;
}

let stack_pointer = 128;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
function __wbg_adapter_39(arg0, arg1, arg2) {
    try {
        wasm.wasm_bindgen__convert__closures__invoke1_ref__h17c8ca00566c1e9c(arg0, arg1, addBorrowedObject(arg2));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

function __wbg_adapter_42(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures__invoke1_mut__ha25f0437bf6a933a(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_45(arg0, arg1, arg2) {
    try {
        wasm._dyn_core__ops__function__FnMut___A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h8fe51c1c08735460(arg0, arg1, addBorrowedObject(arg2));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_instanceof_Window_ab008a2fc3b8ec24 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_ClipboardItem_7ca70213be4ae727 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ClipboardItem;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_read_5196846cb5c6d26d = function(arg0) {
        const ret = getObject(arg0).read();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_readText_9740aabc83506503 = function(arg0) {
        const ret = getObject(arg0).readText();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_write_6a735fcc9dab23cf = function(arg0, arg1) {
        const ret = getObject(arg0).write(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_writeText_b1d5ad4939d71c9b = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).writeText(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_clipboard_bd8c912a5ede0bab = function(arg0) {
        const ret = getObject(arg0).clipboard;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_navigator_c933756675c44b48 = function(arg0) {
        const ret = getObject(arg0).navigator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_90b2c36387ac1aa1 = function() { return handleError(function (arg0) {
        const ret = new ClipboardItem(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_types_67dfd124c7acfff7 = function(arg0) {
        const ret = getObject(arg0).types;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getType_8722a6750997a607 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getType(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg_cachekey_b81c1aacc6a0645c = function(arg0, arg1) {
        const ret = getObject(arg1).__yew_subtree_cache_key;
        getInt32Memory0()[arg0 / 4 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_subtreeid_e80a1798fee782f9 = function(arg0, arg1) {
        const ret = getObject(arg1).__yew_subtree_id;
        getInt32Memory0()[arg0 / 4 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_setsubtreeid_e1fab6b578c800cf = function(arg0, arg1) {
        getObject(arg0).__yew_subtree_id = arg1 >>> 0;
    };
    imports.wbg.__wbg_setcachekey_75bcd45312087529 = function(arg0, arg1) {
        getObject(arg0).__yew_subtree_cache_key = arg1 >>> 0;
    };
    imports.wbg.__wbg_setlistenerid_f2e783343fa0cec1 = function(arg0, arg1) {
        getObject(arg0).__yew_listener_id = arg1 >>> 0;
    };
    imports.wbg.__wbg_listenerid_6dcf1c62b7b7de58 = function(arg0, arg1) {
        const ret = getObject(arg1).__yew_listener_id;
        getInt32Memory0()[arg0 / 4 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_queueMicrotask_e5949c35d772a669 = function(arg0) {
        queueMicrotask(getObject(arg0));
    };
    imports.wbg.__wbg_queueMicrotask_2be8b97a81fe4d00 = function(arg0) {
        const ret = getObject(arg0).queueMicrotask;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_in = function(arg0, arg1) {
        const ret = getObject(arg0) in getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
        const ret = getObject(arg0) == getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbg_getwithrefkey_3b3c46ba20582127 = function(arg0, arg1) {
        const ret = getObject(arg0)[getObject(arg1)];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_error_a526fb08a0205972 = function(arg0, arg1) {
        var v0 = getArrayJsValueFromWasm0(arg0, arg1).slice();
        wasm.__wbindgen_free(arg0, arg1 * 4, 4);
        console.error(...v0);
    };
    imports.wbg.__wbg_documentElement_aab620794c1eb119 = function(arg0) {
        const ret = getObject(arg0).documentElement;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_body_11da0c1aa9610cb3 = function(arg0) {
        const ret = getObject(arg0).body;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_head_806a8bdbacfc5108 = function(arg0) {
        const ret = getObject(arg0).head;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createElement_9ce3fdea8322ff34 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createElementNS_6a08d8f33e767e18 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        const ret = getObject(arg0).createElementNS(arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createTextNode_01a7250c5ca46b04 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).createTextNode(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_querySelector_391afe271b8236d5 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).querySelector(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Window_cde2416cf5126a72 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_document_183cf1eecfdbffee = function(arg0) {
        const ret = getObject(arg0).document;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_location_61ca61017633c753 = function(arg0) {
        const ret = getObject(arg0).location;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_history_56dc869560201113 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).history;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_matchMedia_dd5eeb8cc5ff75ca = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).matchMedia(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Element_6c7af07f5e6c8d69 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Element;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_namespaceURI_2dd94d0147ffddf2 = function(arg0, arg1) {
        const ret = getObject(arg1).namespaceURI;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_setinnerHTML_b88bf159b62c2334 = function(arg0, arg1, arg2) {
        getObject(arg0).innerHTML = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_outerHTML_72dcf3aa34725f10 = function(arg0, arg1) {
        const ret = getObject(arg1).outerHTML;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_removeAttribute_dbd76981f9bb9f59 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).removeAttribute(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_setAttribute_aebcae2169f2f869 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_bubbles_c27af65192eb3569 = function(arg0) {
        const ret = getObject(arg0).bubbles;
        return ret;
    };
    imports.wbg.__wbg_cancelBubble_ee3f70328e901584 = function(arg0) {
        const ret = getObject(arg0).cancelBubble;
        return ret;
    };
    imports.wbg.__wbg_composedPath_ee37eece046b69a2 = function(arg0) {
        const ret = getObject(arg0).composedPath();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_value_539db729f551be3a = function(arg0, arg1) {
        const ret = getObject(arg1).value;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_setvalue_15231c60278dee22 = function(arg0, arg1, arg2) {
        getObject(arg0).value = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_instanceof_Blob_bd674d851f2d730d = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Blob;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_newwithu8arraysequenceandoptions_f520ece5c28a5211 = function() { return handleError(function (arg0, arg1) {
        const ret = new Blob(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_arrayBuffer_47d6dbeb91d823b0 = function(arg0) {
        const ret = getObject(arg0).arrayBuffer();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_ShadowRoot_f85f709c953844de = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ShadowRoot;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_host_73c8e95bf9b31ccd = function(arg0) {
        const ret = getObject(arg0).host;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_parentNode_e1c214fc3f362af0 = function(arg0) {
        const ret = getObject(arg0).parentNode;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_parentElement_592cb54944d3d002 = function(arg0) {
        const ret = getObject(arg0).parentElement;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_childNodes_e62200b977bdb1a0 = function(arg0) {
        const ret = getObject(arg0).childNodes;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_lastChild_b17b3c7498d25bd7 = function(arg0) {
        const ret = getObject(arg0).lastChild;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_nextSibling_d029031876ed1b1b = function(arg0) {
        const ret = getObject(arg0).nextSibling;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_setnodeValue_321840a6762ab272 = function(arg0, arg1, arg2) {
        getObject(arg0).nodeValue = arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_textContent_d69d000f6081b514 = function(arg0, arg1) {
        const ret = getObject(arg1).textContent;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_cloneNode_df9cbf9711e3707d = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).cloneNode();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_insertBefore_bdaeec8969497673 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).insertBefore(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_removeChild_a63022ebbfa6ebf5 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).removeChild(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_pathname_a83d8f2ebefa6791 = function(arg0, arg1) {
        const ret = getObject(arg1).pathname;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_search_8c5f74fa2d11377e = function(arg0, arg1) {
        const ret = getObject(arg1).search;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_hash_f468e7d38a21a76a = function(arg0, arg1) {
        const ret = getObject(arg1).hash;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_new_d7cd05d9de7d4000 = function() { return handleError(function (arg0, arg1) {
        const ret = new URL(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newwithbase_604e8dfd42d25665 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = new URL(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_href_2777cc28ba3aac82 = function(arg0, arg1) {
        const ret = getObject(arg1).href;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_matches_b15a28b7adb4d51b = function(arg0) {
        const ret = getObject(arg0).matches;
        return ret;
    };
    imports.wbg.__wbg_setchecked_5757666239434ecd = function(arg0, arg1) {
        getObject(arg0).checked = arg1 !== 0;
    };
    imports.wbg.__wbg_value_5e860795f53217cd = function(arg0, arg1) {
        const ret = getObject(arg1).value;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_setvalue_7d187f6cc23d8192 = function(arg0, arg1, arg2) {
        getObject(arg0).value = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_addEventListener_51709b9747ad8980 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4));
    }, arguments) };
    imports.wbg.__wbg_removeEventListener_5b1e762a7951280a = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).removeEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3), arg4 !== 0);
    }, arguments) };
    imports.wbg.__wbg_state_78eaa7b6ff3123a0 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).state;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_href_92490614763f3f7c = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).href;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_pathname_cd5a90c8f3ab524a = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).pathname;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_search_08fbba2309a249da = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).search;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_hash_ced9ee31706e591d = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).hash;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_get_4a9aa5157afeb382 = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_cace2e0b3ddc0502 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new_08236689f0afb357 = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newnoargs_ccdcae30fd002262 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_669127b9d730c650 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_c728d68b8b34487e = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_3fad056edded10bd = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_a4f46c98a61d4089 = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_17eff828815f7d84 = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_46f939f6541643c5 = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_from_ba72c50feaf1d8c0 = function(arg0) {
        const ret = Array.from(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_of_283796b230947688 = function(arg0) {
        const ret = Array.of(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_push_fd3233d09cf81821 = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_c7cc317e5c29cc0d = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_isSafeInteger_c38b0a16d0c7cef7 = function(arg0) {
        const ret = Number.isSafeInteger(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_entries_6d727b73ee02b7ce = function(arg0) {
        const ret = Object.entries(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_is_c74aa9bb973d6109 = function(arg0, arg1) {
        const ret = Object.is(getObject(arg0), getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_resolve_a3252b2860f0a09e = function(arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_89e1c559530b85cf = function(arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_1bbc9edafd859b06 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_344d9b41efe96da7 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_2dc04d99088b15e3 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_d8a000788389a31e = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_dcfd613a3420f908 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_a5587d6cd79ab197 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_19e6f142a5e7e1e1 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_set_40f7786a25a9cc7e = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1171 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 706, __wbg_adapter_36);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1460 = function(arg0, arg1, arg2) {
        const ret = makeClosure(arg0, arg1, 788, __wbg_adapter_39);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1585 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 842, __wbg_adapter_42);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1645 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 869, __wbg_adapter_45);
        return addHeapObject(ret);
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedFloat64Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint32Memory0 = null;
    cachedUint8Memory0 = null;

    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('portfolio-a0c41460a02972c_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;
