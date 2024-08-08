
/**
 * 
 * @param {ArrayBuffer} array 
 * @returns {ArrayBuffer}
 */
function crypt(array) {
    var result = new Uint8Array(array.length)
    for (var i = 0; i < array.length; i++) {
        result[i] = array[i] ^ array.length
    }
    return result
}

/**
 * 
 * @param {Uint8Array} array 
 */
function toText(array) {
    var binary = ""
    for (var i = 0; i < array.length; i++) {
        binary += String.fromCharCode(array[i])
    }
    return binary
}

/**
 * 
 * @param {Uint8Array} array 
 */
function toBase64(array) {
    var text = toText(array)
    return btoa(text)
}

/**
 * 
 * @param {String} text 
 * @returns {Uint8Array}
 */
function fromText(text) {
    var array = new Uint8Array(text.length)
    for (var i = 0; i < text.length; i++) {
        array[i] = text.charCodeAt(i)
    }
    return array
}

/**
 * 
 * @param {String} textBase64 
 * @returns {Uint8Array}
 */
function fromBase64(textBase64) {
    var text = atob(textBase64)
    var array = fromText(text)
    return array
}

function encodeText(text) {
    var encoder = new TextEncoder();
    var array = new Uint8Array(encoder.encode(text))
    var cryptedArray = crypt(array)
    var encoded = toBase64(cryptedArray)
    return encoded
}

function decodeText(text) {
    var array = crypt(fromBase64(text))
    var decoder = new TextDecoder()
    return decoder.decode(array)
}
