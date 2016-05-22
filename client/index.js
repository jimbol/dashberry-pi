(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
window.Vue = require('vue');

var apiURL = 'https://api.github.com/repos/vuejs/vue/commits?per_page=3&sha='

var socket = io.connect();
socket.on('chores', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});

var socket;
var connected=false;

window.setFocus = function() {
  var iframe = document.getElementById("kallender");
  iframe.contentWindow.focus();
}

// demo code
var demo = new Vue({

  el: '#demo',

  data: {
    branches: ['master', 'dev'],
    currentBranch: 'master',
    commits: null
  },

  created: function () {
    this.fetchData()
  },

  watch: {
    currentBranch: 'fetchData'
  },

  filters: {
    truncate: function (v) {
      var newline = v.indexOf('\n')
      return newline > 0 ? v.slice(0, newline) : v
    },
    formatDate: function (v) {
      return v.replace(/T|Z/g, ' ')
    }
  },

  methods: {
    fetchData: function () {
      var xhr = new XMLHttpRequest()
      var self = this
      xhr.open('GET', apiURL + self.currentBranch)
      xhr.onload = function () {
        self.commits = JSON.parse(xhr.responseText)
      }
      xhr.send()
    }
  }
})

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_6bbedf5b.js","/")
},{"buffer":2,"oMfpAn":5,"vue":6}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/index.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer")
},{"base64-js":3,"buffer":2,"ieee754":4,"oMfpAn":5}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib")
},{"buffer":2,"oMfpAn":5}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754")
},{"buffer":2,"oMfpAn":5}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/process/browser.js","/../../node_modules/gulp-browserify/node_modules/browserify/node_modules/process")
},{"buffer":2,"oMfpAn":5}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * Vue.js v1.0.24
 * (c) 2016 Evan You
 * Released under the MIT License.
 */
'use strict';

function set(obj, key, val) {
  if (hasOwn(obj, key)) {
    obj[key] = val;
    return;
  }
  if (obj._isVue) {
    set(obj._data, key, val);
    return;
  }
  var ob = obj.__ob__;
  if (!ob) {
    obj[key] = val;
    return;
  }
  ob.convert(key, val);
  ob.dep.notify();
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      vm._proxy(key);
      vm._digest();
    }
  }
  return val;
}

/**
 * Delete a property and trigger change if necessary.
 *
 * @param {Object} obj
 * @param {String} key
 */

function del(obj, key) {
  if (!hasOwn(obj, key)) {
    return;
  }
  delete obj[key];
  var ob = obj.__ob__;
  if (!ob) {
    if (obj._isVue) {
      delete obj._data[key];
      obj._digest();
    }
    return;
  }
  ob.dep.notify();
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      vm._unproxy(key);
      vm._digest();
    }
  }
}

var hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Check whether the object has the property.
 *
 * @param {Object} obj
 * @param {String} key
 * @return {Boolean}
 */

function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

/**
 * Check if an expression is a literal value.
 *
 * @param {String} exp
 * @return {Boolean}
 */

var literalValueRE = /^\s?(true|false|-?[\d\.]+|'[^']*'|"[^"]*")\s?$/;

function isLiteral(exp) {
  return literalValueRE.test(exp);
}

/**
 * Check if a string starts with $ or _
 *
 * @param {String} str
 * @return {Boolean}
 */

function isReserved(str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}

/**
 * Guard text output, make sure undefined outputs
 * empty string
 *
 * @param {*} value
 * @return {String}
 */

function _toString(value) {
  return value == null ? '' : value.toString();
}

/**
 * Check and convert possible numeric strings to numbers
 * before setting back to data
 *
 * @param {*} value
 * @return {*|Number}
 */

function toNumber(value) {
  if (typeof value !== 'string') {
    return value;
  } else {
    var parsed = Number(value);
    return isNaN(parsed) ? value : parsed;
  }
}

/**
 * Convert string boolean literals into real booleans.
 *
 * @param {*} value
 * @return {*|Boolean}
 */

function toBoolean(value) {
  return value === 'true' ? true : value === 'false' ? false : value;
}

/**
 * Strip quotes from a string
 *
 * @param {String} str
 * @return {String | false}
 */

function stripQuotes(str) {
  var a = str.charCodeAt(0);
  var b = str.charCodeAt(str.length - 1);
  return a === b && (a === 0x22 || a === 0x27) ? str.slice(1, -1) : str;
}

/**
 * Camelize a hyphen-delmited string.
 *
 * @param {String} str
 * @return {String}
 */

var camelizeRE = /-(\w)/g;

function camelize(str) {
  return str.replace(camelizeRE, toUpper);
}

function toUpper(_, c) {
  return c ? c.toUpperCase() : '';
}

/**
 * Hyphenate a camelCase string.
 *
 * @param {String} str
 * @return {String}
 */

var hyphenateRE = /([a-z\d])([A-Z])/g;

function hyphenate(str) {
  return str.replace(hyphenateRE, '$1-$2').toLowerCase();
}

/**
 * Converts hyphen/underscore/slash delimitered names into
 * camelized classNames.
 *
 * e.g. my-component => MyComponent
 *      some_else    => SomeElse
 *      some/comp    => SomeComp
 *
 * @param {String} str
 * @return {String}
 */

var classifyRE = /(?:^|[-_\/])(\w)/g;

function classify(str) {
  return str.replace(classifyRE, toUpper);
}

/**
 * Simple bind, faster than native
 *
 * @param {Function} fn
 * @param {Object} ctx
 * @return {Function}
 */

function bind(fn, ctx) {
  return function (a) {
    var l = arguments.length;
    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
  };
}

/**
 * Convert an Array-like object to a real Array.
 *
 * @param {Array-like} list
 * @param {Number} [start] - start index
 * @return {Array}
 */

function toArray(list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret;
}

/**
 * Mix properties into target object.
 *
 * @param {Object} to
 * @param {Object} from
 */

function extend(to, from) {
  var keys = Object.keys(from);
  var i = keys.length;
  while (i--) {
    to[keys[i]] = from[keys[i]];
  }
  return to;
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 *
 * @param {*} obj
 * @return {Boolean}
 */

function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';

function isPlainObject(obj) {
  return toString.call(obj) === OBJECT_STRING;
}

/**
 * Array type check.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var isArray = Array.isArray;

/**
 * Define a property.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @param {Boolean} [enumerable]
 */

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Debounce a function so it only gets called after the
 * input stops arriving after the given wait period.
 *
 * @param {Function} func
 * @param {Number} wait
 * @return {Function} - the debounced function
 */

function _debounce(func, wait) {
  var timeout, args, context, timestamp, result;
  var later = function later() {
    var last = Date.now() - timestamp;
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    }
  };
  return function () {
    context = this;
    args = arguments;
    timestamp = Date.now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    return result;
  };
}

/**
 * Manual indexOf because it's slightly faster than
 * native.
 *
 * @param {Array} arr
 * @param {*} obj
 */

function indexOf(arr, obj) {
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj) return i;
  }
  return -1;
}

/**
 * Make a cancellable version of an async callback.
 *
 * @param {Function} fn
 * @return {Function}
 */

function cancellable(fn) {
  var cb = function cb() {
    if (!cb.cancelled) {
      return fn.apply(this, arguments);
    }
  };
  cb.cancel = function () {
    cb.cancelled = true;
  };
  return cb;
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 *
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 */

function looseEqual(a, b) {
  /* eslint-disable eqeqeq */
  return a == b || (isObject(a) && isObject(b) ? JSON.stringify(a) === JSON.stringify(b) : false);
  /* eslint-enable eqeqeq */
}

var hasProto = ('__proto__' in {});

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]';

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

// UA sniffing for working around browser-specific quirks
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isAndroid = UA && UA.indexOf('android') > 0;
var isIos = UA && /(iphone|ipad|ipod|ios)/i.test(UA);
var isWechat = UA && UA.indexOf('micromessenger') > 0;

var transitionProp = undefined;
var transitionEndEvent = undefined;
var animationProp = undefined;
var animationEndEvent = undefined;

// Transition property/event sniffing
if (inBrowser && !isIE9) {
  var isWebkitTrans = window.ontransitionend === undefined && window.onwebkittransitionend !== undefined;
  var isWebkitAnim = window.onanimationend === undefined && window.onwebkitanimationend !== undefined;
  transitionProp = isWebkitTrans ? 'WebkitTransition' : 'transition';
  transitionEndEvent = isWebkitTrans ? 'webkitTransitionEnd' : 'transitionend';
  animationProp = isWebkitAnim ? 'WebkitAnimation' : 'animation';
  animationEndEvent = isWebkitAnim ? 'webkitAnimationEnd' : 'animationend';
}

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available, and fallback to
 * setTimeout(0).
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

var nextTick = (function () {
  var callbacks = [];
  var pending = false;
  var timerFunc;
  function nextTickHandler() {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks = [];
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  /* istanbul ignore if */
  if (typeof MutationObserver !== 'undefined' && !(isWechat && isIos)) {
    var counter = 1;
    var observer = new MutationObserver(nextTickHandler);
    var textNode = document.createTextNode(counter);
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = counter;
    };
  } else {
    // webpack attempts to inject a shim for setImmediate
    // if it is used as a global, so we have to work around that to
    // avoid bundling unnecessary code.
    var context = inBrowser ? window : typeof global !== 'undefined' ? global : {};
    timerFunc = context.setImmediate || setTimeout;
  }
  return function (cb, ctx) {
    var func = ctx ? function () {
      cb.call(ctx);
    } : cb;
    callbacks.push(func);
    if (pending) return;
    pending = true;
    timerFunc(nextTickHandler, 0);
  };
})();

var _Set = undefined;
/* istanbul ignore if */
if (typeof Set !== 'undefined' && Set.toString().match(/native code/)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = function () {
    this.set = Object.create(null);
  };
  _Set.prototype.has = function (key) {
    return this.set[key] !== undefined;
  };
  _Set.prototype.add = function (key) {
    this.set[key] = 1;
  };
  _Set.prototype.clear = function () {
    this.set = Object.create(null);
  };
}

function Cache(limit) {
  this.size = 0;
  this.limit = limit;
  this.head = this.tail = undefined;
  this._keymap = Object.create(null);
}

var p = Cache.prototype;

/**
 * Put <value> into the cache associated with <key>.
 * Returns the entry which was removed to make room for
 * the new entry. Otherwise undefined is returned.
 * (i.e. if there was enough room already).
 *
 * @param {String} key
 * @param {*} value
 * @return {Entry|undefined}
 */

p.put = function (key, value) {
  var removed;
  if (this.size === this.limit) {
    removed = this.shift();
  }

  var entry = this.get(key, true);
  if (!entry) {
    entry = {
      key: key
    };
    this._keymap[key] = entry;
    if (this.tail) {
      this.tail.newer = entry;
      entry.older = this.tail;
    } else {
      this.head = entry;
    }
    this.tail = entry;
    this.size++;
  }
  entry.value = value;

  return removed;
};

/**
 * Purge the least recently used (oldest) entry from the
 * cache. Returns the removed entry or undefined if the
 * cache was empty.
 */

p.shift = function () {
  var entry = this.head;
  if (entry) {
    this.head = this.head.newer;
    this.head.older = undefined;
    entry.newer = entry.older = undefined;
    this._keymap[entry.key] = undefined;
    this.size--;
  }
  return entry;
};

/**
 * Get and register recent use of <key>. Returns the value
 * associated with <key> or undefined if not in cache.
 *
 * @param {String} key
 * @param {Boolean} returnEntry
 * @return {Entry|*}
 */

p.get = function (key, returnEntry) {
  var entry = this._keymap[key];
  if (entry === undefined) return;
  if (entry === this.tail) {
    return returnEntry ? entry : entry.value;
  }
  // HEAD--------------TAIL
  //   <.older   .newer>
  //  <--- add direction --
  //   A  B  C  <D>  E
  if (entry.newer) {
    if (entry === this.head) {
      this.head = entry.newer;
    }
    entry.newer.older = entry.older; // C <-- E.
  }
  if (entry.older) {
    entry.older.newer = entry.newer; // C. --> E
  }
  entry.newer = undefined; // D --x
  entry.older = this.tail; // D. --> E
  if (this.tail) {
    this.tail.newer = entry; // E. <-- D
  }
  this.tail = entry;
  return returnEntry ? entry : entry.value;
};

var cache$1 = new Cache(1000);
var filterTokenRE = /[^\s'"]+|'[^']*'|"[^"]*"/g;
var reservedArgRE = /^in$|^-?\d+/;

/**
 * Parser state
 */

var str;
var dir;
var c;
var prev;
var i;
var l;
var lastFilterIndex;
var inSingle;
var inDouble;
var curly;
var square;
var paren;
/**
 * Push a filter to the current directive object
 */

function pushFilter() {
  var exp = str.slice(lastFilterIndex, i).trim();
  var filter;
  if (exp) {
    filter = {};
    var tokens = exp.match(filterTokenRE);
    filter.name = tokens[0];
    if (tokens.length > 1) {
      filter.args = tokens.slice(1).map(processFilterArg);
    }
  }
  if (filter) {
    (dir.filters = dir.filters || []).push(filter);
  }
  lastFilterIndex = i + 1;
}

/**
 * Check if an argument is dynamic and strip quotes.
 *
 * @param {String} arg
 * @return {Object}
 */

function processFilterArg(arg) {
  if (reservedArgRE.test(arg)) {
    return {
      value: toNumber(arg),
      dynamic: false
    };
  } else {
    var stripped = stripQuotes(arg);
    var dynamic = stripped === arg;
    return {
      value: dynamic ? arg : stripped,
      dynamic: dynamic
    };
  }
}

/**
 * Parse a directive value and extract the expression
 * and its filters into a descriptor.
 *
 * Example:
 *
 * "a + 1 | uppercase" will yield:
 * {
 *   expression: 'a + 1',
 *   filters: [
 *     { name: 'uppercase', args: null }
 *   ]
 * }
 *
 * @param {String} s
 * @return {Object}
 */

function parseDirective(s) {
  var hit = cache$1.get(s);
  if (hit) {
    return hit;
  }

  // reset parser state
  str = s;
  inSingle = inDouble = false;
  curly = square = paren = 0;
  lastFilterIndex = 0;
  dir = {};

  for (i = 0, l = str.length; i < l; i++) {
    prev = c;
    c = str.charCodeAt(i);
    if (inSingle) {
      // check single quote
      if (c === 0x27 && prev !== 0x5C) inSingle = !inSingle;
    } else if (inDouble) {
      // check double quote
      if (c === 0x22 && prev !== 0x5C) inDouble = !inDouble;
    } else if (c === 0x7C && // pipe
    str.charCodeAt(i + 1) !== 0x7C && str.charCodeAt(i - 1) !== 0x7C) {
      if (dir.expression == null) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        dir.expression = str.slice(0, i).trim();
      } else {
        // already has filter
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22:
          inDouble = true;break; // "
        case 0x27:
          inSingle = true;break; // '
        case 0x28:
          paren++;break; // (
        case 0x29:
          paren--;break; // )
        case 0x5B:
          square++;break; // [
        case 0x5D:
          square--;break; // ]
        case 0x7B:
          curly++;break; // {
        case 0x7D:
          curly--;break; // }
      }
    }
  }

  if (dir.expression == null) {
    dir.expression = str.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  cache$1.put(s, dir);
  return dir;
}

var directive = Object.freeze({
  parseDirective: parseDirective
});

var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
var cache = undefined;
var tagRE = undefined;
var htmlRE = undefined;
/**
 * Escape a string so it can be used in a RegExp
 * constructor.
 *
 * @param {String} str
 */

function escapeRegex(str) {
  return str.replace(regexEscapeRE, '\\$&');
}

function compileRegex() {
  var open = escapeRegex(config.delimiters[0]);
  var close = escapeRegex(config.delimiters[1]);
  var unsafeOpen = escapeRegex(config.unsafeDelimiters[0]);
  var unsafeClose = escapeRegex(config.unsafeDelimiters[1]);
  tagRE = new RegExp(unsafeOpen + '((?:.|\\n)+?)' + unsafeClose + '|' + open + '((?:.|\\n)+?)' + close, 'g');
  htmlRE = new RegExp('^' + unsafeOpen + '.*' + unsafeClose + '$');
  // reset cache
  cache = new Cache(1000);
}

/**
 * Parse a template text string into an array of tokens.
 *
 * @param {String} text
 * @return {Array<Object> | null}
 *               - {String} type
 *               - {String} value
 *               - {Boolean} [html]
 *               - {Boolean} [oneTime]
 */

function parseText(text) {
  if (!cache) {
    compileRegex();
  }
  var hit = cache.get(text);
  if (hit) {
    return hit;
  }
  if (!tagRE.test(text)) {
    return null;
  }
  var tokens = [];
  var lastIndex = tagRE.lastIndex = 0;
  var match, index, html, value, first, oneTime;
  /* eslint-disable no-cond-assign */
  while (match = tagRE.exec(text)) {
    /* eslint-enable no-cond-assign */
    index = match.index;
    // push text token
    if (index > lastIndex) {
      tokens.push({
        value: text.slice(lastIndex, index)
      });
    }
    // tag token
    html = htmlRE.test(match[0]);
    value = html ? match[1] : match[2];
    first = value.charCodeAt(0);
    oneTime = first === 42; // *
    value = oneTime ? value.slice(1) : value;
    tokens.push({
      tag: true,
      value: value.trim(),
      html: html,
      oneTime: oneTime
    });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({
      value: text.slice(lastIndex)
    });
  }
  cache.put(text, tokens);
  return tokens;
}

/**
 * Format a list of tokens into an expression.
 * e.g. tokens parsed from 'a {{b}} c' can be serialized
 * into one single expression as '"a " + b + " c"'.
 *
 * @param {Array} tokens
 * @param {Vue} [vm]
 * @return {String}
 */

function tokensToExp(tokens, vm) {
  if (tokens.length > 1) {
    return tokens.map(function (token) {
      return formatToken(token, vm);
    }).join('+');
  } else {
    return formatToken(tokens[0], vm, true);
  }
}

/**
 * Format a single token.
 *
 * @param {Object} token
 * @param {Vue} [vm]
 * @param {Boolean} [single]
 * @return {String}
 */

function formatToken(token, vm, single) {
  return token.tag ? token.oneTime && vm ? '"' + vm.$eval(token.value) + '"' : inlineFilters(token.value, single) : '"' + token.value + '"';
}

/**
 * For an attribute with multiple interpolation tags,
 * e.g. attr="some-{{thing | filter}}", in order to combine
 * the whole thing into a single watchable expression, we
 * have to inline those filters. This function does exactly
 * that. This is a bit hacky but it avoids heavy changes
 * to directive parser and watcher mechanism.
 *
 * @param {String} exp
 * @param {Boolean} single
 * @return {String}
 */

var filterRE = /[^|]\|[^|]/;
function inlineFilters(exp, single) {
  if (!filterRE.test(exp)) {
    return single ? exp : '(' + exp + ')';
  } else {
    var dir = parseDirective(exp);
    if (!dir.filters) {
      return '(' + exp + ')';
    } else {
      return 'this._applyFilters(' + dir.expression + // value
      ',null,' + // oldValue (null for read)
      JSON.stringify(dir.filters) + // filter descriptors
      ',false)'; // write?
    }
  }
}

var text = Object.freeze({
  compileRegex: compileRegex,
  parseText: parseText,
  tokensToExp: tokensToExp
});

var delimiters = ['{{', '}}'];
var unsafeDelimiters = ['{{{', '}}}'];

var config = Object.defineProperties({

  /**
   * Whether to print debug messages.
   * Also enables stack trace for warnings.
   *
   * @type {Boolean}
   */

  debug: false,

  /**
   * Whether to suppress warnings.
   *
   * @type {Boolean}
   */

  silent: false,

  /**
   * Whether to use async rendering.
   */

  async: true,

  /**
   * Whether to warn against errors caught when evaluating
   * expressions.
   */

  warnExpressionErrors: true,

  /**
   * Whether to allow devtools inspection.
   * Disabled by default in production builds.
   */

  devtools: process.env.NODE_ENV !== 'production',

  /**
   * Internal flag to indicate the delimiters have been
   * changed.
   *
   * @type {Boolean}
   */

  _delimitersChanged: true,

  /**
   * List of asset types that a component can own.
   *
   * @type {Array}
   */

  _assetTypes: ['component', 'directive', 'elementDirective', 'filter', 'transition', 'partial'],

  /**
   * prop binding modes
   */

  _propBindingModes: {
    ONE_WAY: 0,
    TWO_WAY: 1,
    ONE_TIME: 2
  },

  /**
   * Max circular updates allowed in a batcher flush cycle.
   */

  _maxUpdateCount: 100

}, {
  delimiters: { /**
                 * Interpolation delimiters. Changing these would trigger
                 * the text parser to re-compile the regular expressions.
                 *
                 * @type {Array<String>}
                 */

    get: function get() {
      return delimiters;
    },
    set: function set(val) {
      delimiters = val;
      compileRegex();
    },
    configurable: true,
    enumerable: true
  },
  unsafeDelimiters: {
    get: function get() {
      return unsafeDelimiters;
    },
    set: function set(val) {
      unsafeDelimiters = val;
      compileRegex();
    },
    configurable: true,
    enumerable: true
  }
});

var warn = undefined;
var formatComponentName = undefined;

if (process.env.NODE_ENV !== 'production') {
  (function () {
    var hasConsole = typeof console !== 'undefined';

    warn = function (msg, vm) {
      if (hasConsole && !config.silent) {
        console.error('[Vue warn]: ' + msg + (vm ? formatComponentName(vm) : ''));
      }
    };

    formatComponentName = function (vm) {
      var name = vm._isVue ? vm.$options.name : vm.name;
      return name ? ' (found in component: <' + hyphenate(name) + '>)' : '';
    };
  })();
}

/**
 * Append with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function appendWithTransition(el, target, vm, cb) {
  applyTransition(el, 1, function () {
    target.appendChild(el);
  }, vm, cb);
}

/**
 * InsertBefore with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function beforeWithTransition(el, target, vm, cb) {
  applyTransition(el, 1, function () {
    before(el, target);
  }, vm, cb);
}

/**
 * Remove with transition.
 *
 * @param {Element} el
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function removeWithTransition(el, vm, cb) {
  applyTransition(el, -1, function () {
    remove(el);
  }, vm, cb);
}

/**
 * Apply transitions with an operation callback.
 *
 * @param {Element} el
 * @param {Number} direction
 *                  1: enter
 *                 -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function applyTransition(el, direction, op, vm, cb) {
  var transition = el.__v_trans;
  if (!transition ||
  // skip if there are no js hooks and CSS transition is
  // not supported
  !transition.hooks && !transitionEndEvent ||
  // skip transitions for initial compile
  !vm._isCompiled ||
  // if the vm is being manipulated by a parent directive
  // during the parent's compilation phase, skip the
  // animation.
  vm.$parent && !vm.$parent._isCompiled) {
    op();
    if (cb) cb();
    return;
  }
  var action = direction > 0 ? 'enter' : 'leave';
  transition[action](op, cb);
}

var transition = Object.freeze({
  appendWithTransition: appendWithTransition,
  beforeWithTransition: beforeWithTransition,
  removeWithTransition: removeWithTransition,
  applyTransition: applyTransition
});

/**
 * Query an element selector if it's not an element already.
 *
 * @param {String|Element} el
 * @return {Element}
 */

function query(el) {
  if (typeof el === 'string') {
    var selector = el;
    el = document.querySelector(el);
    if (!el) {
      process.env.NODE_ENV !== 'production' && warn('Cannot find element: ' + selector);
    }
  }
  return el;
}

/**
 * Check if a node is in the document.
 * Note: document.documentElement.contains should work here
 * but always returns false for comment nodes in phantomjs,
 * making unit tests difficult. This is fixed by doing the
 * contains() check on the node's parentNode instead of
 * the node itself.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function inDoc(node) {
  if (!node) return false;
  var doc = node.ownerDocument.documentElement;
  var parent = node.parentNode;
  return doc === node || doc === parent || !!(parent && parent.nodeType === 1 && doc.contains(parent));
}

/**
 * Get and remove an attribute from a node.
 *
 * @param {Node} node
 * @param {String} _attr
 */

function getAttr(node, _attr) {
  var val = node.getAttribute(_attr);
  if (val !== null) {
    node.removeAttribute(_attr);
  }
  return val;
}

/**
 * Get an attribute with colon or v-bind: prefix.
 *
 * @param {Node} node
 * @param {String} name
 * @return {String|null}
 */

function getBindAttr(node, name) {
  var val = getAttr(node, ':' + name);
  if (val === null) {
    val = getAttr(node, 'v-bind:' + name);
  }
  return val;
}

/**
 * Check the presence of a bind attribute.
 *
 * @param {Node} node
 * @param {String} name
 * @return {Boolean}
 */

function hasBindAttr(node, name) {
  return node.hasAttribute(name) || node.hasAttribute(':' + name) || node.hasAttribute('v-bind:' + name);
}

/**
 * Insert el before target
 *
 * @param {Element} el
 * @param {Element} target
 */

function before(el, target) {
  target.parentNode.insertBefore(el, target);
}

/**
 * Insert el after target
 *
 * @param {Element} el
 * @param {Element} target
 */

function after(el, target) {
  if (target.nextSibling) {
    before(el, target.nextSibling);
  } else {
    target.parentNode.appendChild(el);
  }
}

/**
 * Remove el from DOM
 *
 * @param {Element} el
 */

function remove(el) {
  el.parentNode.removeChild(el);
}

/**
 * Prepend el to target
 *
 * @param {Element} el
 * @param {Element} target
 */

function prepend(el, target) {
  if (target.firstChild) {
    before(el, target.firstChild);
  } else {
    target.appendChild(el);
  }
}

/**
 * Replace target with el
 *
 * @param {Element} target
 * @param {Element} el
 */

function replace(target, el) {
  var parent = target.parentNode;
  if (parent) {
    parent.replaceChild(el, target);
  }
}

/**
 * Add event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 * @param {Boolean} [useCapture]
 */

function on(el, event, cb, useCapture) {
  el.addEventListener(event, cb, useCapture);
}

/**
 * Remove event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 */

function off(el, event, cb) {
  el.removeEventListener(event, cb);
}

/**
 * For IE9 compat: when both class and :class are present
 * getAttribute('class') returns wrong value...
 *
 * @param {Element} el
 * @return {String}
 */

function getClass(el) {
  var classname = el.className;
  if (typeof classname === 'object') {
    classname = classname.baseVal || '';
  }
  return classname;
}

/**
 * In IE9, setAttribute('class') will result in empty class
 * if the element also has the :class attribute; However in
 * PhantomJS, setting `className` does not work on SVG elements...
 * So we have to do a conditional check here.
 *
 * @param {Element} el
 * @param {String} cls
 */

function setClass(el, cls) {
  /* istanbul ignore if */
  if (isIE9 && !/svg$/.test(el.namespaceURI)) {
    el.className = cls;
  } else {
    el.setAttribute('class', cls);
  }
}

/**
 * Add class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {String} cls
 */

function addClass(el, cls) {
  if (el.classList) {
    el.classList.add(cls);
  } else {
    var cur = ' ' + getClass(el) + ' ';
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      setClass(el, (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {String} cls
 */

function removeClass(el, cls) {
  if (el.classList) {
    el.classList.remove(cls);
  } else {
    var cur = ' ' + getClass(el) + ' ';
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    setClass(el, cur.trim());
  }
  if (!el.className) {
    el.removeAttribute('class');
  }
}

/**
 * Extract raw content inside an element into a temporary
 * container div
 *
 * @param {Element} el
 * @param {Boolean} asFragment
 * @return {Element|DocumentFragment}
 */

function extractContent(el, asFragment) {
  var child;
  var rawContent;
  /* istanbul ignore if */
  if (isTemplate(el) && isFragment(el.content)) {
    el = el.content;
  }
  if (el.hasChildNodes()) {
    trimNode(el);
    rawContent = asFragment ? document.createDocumentFragment() : document.createElement('div');
    /* eslint-disable no-cond-assign */
    while (child = el.firstChild) {
      /* eslint-enable no-cond-assign */
      rawContent.appendChild(child);
    }
  }
  return rawContent;
}

/**
 * Trim possible empty head/tail text and comment
 * nodes inside a parent.
 *
 * @param {Node} node
 */

function trimNode(node) {
  var child;
  /* eslint-disable no-sequences */
  while ((child = node.firstChild, isTrimmable(child))) {
    node.removeChild(child);
  }
  while ((child = node.lastChild, isTrimmable(child))) {
    node.removeChild(child);
  }
  /* eslint-enable no-sequences */
}

function isTrimmable(node) {
  return node && (node.nodeType === 3 && !node.data.trim() || node.nodeType === 8);
}

/**
 * Check if an element is a template tag.
 * Note if the template appears inside an SVG its tagName
 * will be in lowercase.
 *
 * @param {Element} el
 */

function isTemplate(el) {
  return el.tagName && el.tagName.toLowerCase() === 'template';
}

/**
 * Create an "anchor" for performing dom insertion/removals.
 * This is used in a number of scenarios:
 * - fragment instance
 * - v-html
 * - v-if
 * - v-for
 * - component
 *
 * @param {String} content
 * @param {Boolean} persist - IE trashes empty textNodes on
 *                            cloneNode(true), so in certain
 *                            cases the anchor needs to be
 *                            non-empty to be persisted in
 *                            templates.
 * @return {Comment|Text}
 */

function createAnchor(content, persist) {
  var anchor = config.debug ? document.createComment(content) : document.createTextNode(persist ? ' ' : '');
  anchor.__v_anchor = true;
  return anchor;
}

/**
 * Find a component ref attribute that starts with $.
 *
 * @param {Element} node
 * @return {String|undefined}
 */

var refRE = /^v-ref:/;

function findRef(node) {
  if (node.hasAttributes()) {
    var attrs = node.attributes;
    for (var i = 0, l = attrs.length; i < l; i++) {
      var name = attrs[i].name;
      if (refRE.test(name)) {
        return camelize(name.replace(refRE, ''));
      }
    }
  }
}

/**
 * Map a function to a range of nodes .
 *
 * @param {Node} node
 * @param {Node} end
 * @param {Function} op
 */

function mapNodeRange(node, end, op) {
  var next;
  while (node !== end) {
    next = node.nextSibling;
    op(node);
    node = next;
  }
  op(end);
}

/**
 * Remove a range of nodes with transition, store
 * the nodes in a fragment with correct ordering,
 * and call callback when done.
 *
 * @param {Node} start
 * @param {Node} end
 * @param {Vue} vm
 * @param {DocumentFragment} frag
 * @param {Function} cb
 */

function removeNodeRange(start, end, vm, frag, cb) {
  var done = false;
  var removed = 0;
  var nodes = [];
  mapNodeRange(start, end, function (node) {
    if (node === end) done = true;
    nodes.push(node);
    removeWithTransition(node, vm, onRemoved);
  });
  function onRemoved() {
    removed++;
    if (done && removed >= nodes.length) {
      for (var i = 0; i < nodes.length; i++) {
        frag.appendChild(nodes[i]);
      }
      cb && cb();
    }
  }
}

/**
 * Check if a node is a DocumentFragment.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function isFragment(node) {
  return node && node.nodeType === 11;
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 *
 * @param {Element} el
 * @return {String}
 */

function getOuterHTML(el) {
  if (el.outerHTML) {
    return el.outerHTML;
  } else {
    var container = document.createElement('div');
    container.appendChild(el.cloneNode(true));
    return container.innerHTML;
  }
}

var commonTagRE = /^(div|p|span|img|a|b|i|br|ul|ol|li|h1|h2|h3|h4|h5|h6|code|pre|table|th|td|tr|form|label|input|select|option|nav|article|section|header|footer)$/i;
var reservedTagRE = /^(slot|partial|component)$/i;

var isUnknownElement = undefined;
if (process.env.NODE_ENV !== 'production') {
  isUnknownElement = function (el, tag) {
    if (tag.indexOf('-') > -1) {
      // http://stackoverflow.com/a/28210364/1070244
      return el.constructor === window.HTMLUnknownElement || el.constructor === window.HTMLElement;
    } else {
      return (/HTMLUnknownElement/.test(el.toString()) &&
        // Chrome returns unknown for several HTML5 elements.
        // https://code.google.com/p/chromium/issues/detail?id=540526
        !/^(data|time|rtc|rb)$/.test(tag)
      );
    }
  };
}

/**
 * Check if an element is a component, if yes return its
 * component id.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Object|undefined}
 */

function checkComponentAttr(el, options) {
  var tag = el.tagName.toLowerCase();
  var hasAttrs = el.hasAttributes();
  if (!commonTagRE.test(tag) && !reservedTagRE.test(tag)) {
    if (resolveAsset(options, 'components', tag)) {
      return { id: tag };
    } else {
      var is = hasAttrs && getIsBinding(el, options);
      if (is) {
        return is;
      } else if (process.env.NODE_ENV !== 'production') {
        var expectedTag = options._componentNameMap && options._componentNameMap[tag];
        if (expectedTag) {
          warn('Unknown custom element: <' + tag + '> - ' + 'did you mean <' + expectedTag + '>? ' + 'HTML is case-insensitive, remember to use kebab-case in templates.');
        } else if (isUnknownElement(el, tag)) {
          warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly? For recursive components, ' + 'make sure to provide the "name" option.');
        }
      }
    }
  } else if (hasAttrs) {
    return getIsBinding(el, options);
  }
}

/**
 * Get "is" binding from an element.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Object|undefined}
 */

function getIsBinding(el, options) {
  // dynamic syntax
  var exp = el.getAttribute('is');
  if (exp != null) {
    if (resolveAsset(options, 'components', exp)) {
      el.removeAttribute('is');
      return { id: exp };
    }
  } else {
    exp = getBindAttr(el, 'is');
    if (exp != null) {
      return { id: exp, dynamic: true };
    }
  }
}

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 *
 * All strategy functions follow the same signature:
 *
 * @param {*} parentVal
 * @param {*} childVal
 * @param {Vue} [vm]
 */

var strats = config.optionMergeStrategies = Object.create(null);

/**
 * Helper that recursively merges two data objects together.
 */

function mergeData(to, from) {
  var key, toVal, fromVal;
  for (key in from) {
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (isObject(toVal) && isObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to;
}

/**
 * Data
 */

strats.data = function (parentVal, childVal, vm) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal;
    }
    if (typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn('The "data" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
      return parentVal;
    }
    if (!parentVal) {
      return childVal;
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn() {
      return mergeData(childVal.call(this), parentVal.call(this));
    };
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn() {
      // instance merge
      var instanceData = typeof childVal === 'function' ? childVal.call(vm) : childVal;
      var defaultData = typeof parentVal === 'function' ? parentVal.call(vm) : undefined;
      if (instanceData) {
        return mergeData(instanceData, defaultData);
      } else {
        return defaultData;
      }
    };
  }
};

/**
 * El
 */

strats.el = function (parentVal, childVal, vm) {
  if (!vm && childVal && typeof childVal !== 'function') {
    process.env.NODE_ENV !== 'production' && warn('The "el" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
    return;
  }
  var ret = childVal || parentVal;
  // invoke the element factory if this is instance merge
  return vm && typeof ret === 'function' ? ret.call(vm) : ret;
};

/**
 * Hooks and param attributes are merged as arrays.
 */

strats.init = strats.created = strats.ready = strats.attached = strats.detached = strats.beforeCompile = strats.compiled = strats.beforeDestroy = strats.destroyed = strats.activate = function (parentVal, childVal) {
  return childVal ? parentVal ? parentVal.concat(childVal) : isArray(childVal) ? childVal : [childVal] : parentVal;
};

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */

function mergeAssets(parentVal, childVal) {
  var res = Object.create(parentVal || null);
  return childVal ? extend(res, guardArrayAssets(childVal)) : res;
}

config._assetTypes.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Events & Watchers.
 *
 * Events & watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */

strats.watch = strats.events = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = {};
  extend(ret, parentVal);
  for (var key in childVal) {
    var parent = ret[key];
    var child = childVal[key];
    if (parent && !isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent ? parent.concat(child) : [child];
  }
  return ret;
};

/**
 * Other object hashes.
 */

strats.props = strats.methods = strats.computed = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = Object.create(null);
  extend(ret, parentVal);
  extend(ret, childVal);
  return ret;
};

/**
 * Default strategy.
 */

var defaultStrat = function defaultStrat(parentVal, childVal) {
  return childVal === undefined ? parentVal : childVal;
};

/**
 * Make sure component options get converted to actual
 * constructors.
 *
 * @param {Object} options
 */

function guardComponents(options) {
  if (options.components) {
    var components = options.components = guardArrayAssets(options.components);
    var ids = Object.keys(components);
    var def;
    if (process.env.NODE_ENV !== 'production') {
      var map = options._componentNameMap = {};
    }
    for (var i = 0, l = ids.length; i < l; i++) {
      var key = ids[i];
      if (commonTagRE.test(key) || reservedTagRE.test(key)) {
        process.env.NODE_ENV !== 'production' && warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + key);
        continue;
      }
      // record a all lowercase <-> kebab-case mapping for
      // possible custom element case error warning
      if (process.env.NODE_ENV !== 'production') {
        map[key.replace(/-/g, '').toLowerCase()] = hyphenate(key);
      }
      def = components[key];
      if (isPlainObject(def)) {
        components[key] = Vue.extend(def);
      }
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 *
 * @param {Object} options
 */

function guardProps(options) {
  var props = options.props;
  var i, val;
  if (isArray(props)) {
    options.props = {};
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        options.props[val] = null;
      } else if (val.name) {
        options.props[val.name] = val;
      }
    }
  } else if (isPlainObject(props)) {
    var keys = Object.keys(props);
    i = keys.length;
    while (i--) {
      val = props[keys[i]];
      if (typeof val === 'function') {
        props[keys[i]] = { type: val };
      }
    }
  }
}

/**
 * Guard an Array-format assets option and converted it
 * into the key-value Object format.
 *
 * @param {Object|Array} assets
 * @return {Object}
 */

function guardArrayAssets(assets) {
  if (isArray(assets)) {
    var res = {};
    var i = assets.length;
    var asset;
    while (i--) {
      asset = assets[i];
      var id = typeof asset === 'function' ? asset.options && asset.options.name || asset.id : asset.name || asset.id;
      if (!id) {
        process.env.NODE_ENV !== 'production' && warn('Array-syntax assets must provide a "name" or "id" field.');
      } else {
        res[id] = asset;
      }
    }
    return res;
  }
  return assets;
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 *
 * @param {Object} parent
 * @param {Object} child
 * @param {Vue} [vm] - if vm is present, indicates this is
 *                     an instantiation merge.
 */

function mergeOptions(parent, child, vm) {
  guardComponents(child);
  guardProps(child);
  if (process.env.NODE_ENV !== 'production') {
    if (child.propsData && !vm) {
      warn('propsData can only be used as an instantiation option.');
    }
  }
  var options = {};
  var key;
  if (child['extends']) {
    parent = typeof child['extends'] === 'function' ? mergeOptions(parent, child['extends'].options, vm) : mergeOptions(parent, child['extends'], vm);
  }
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm);
    }
  }
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options;
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 *
 * @param {Object} options
 * @param {String} type
 * @param {String} id
 * @param {Boolean} warnMissing
 * @return {Object|Function}
 */

function resolveAsset(options, type, id, warnMissing) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return;
  }
  var assets = options[type];
  var camelizedId;
  var res = assets[id] ||
  // camelCase ID
  assets[camelizedId = camelize(id)] ||
  // Pascal Case ID
  assets[camelizedId.charAt(0).toUpperCase() + camelizedId.slice(1)];
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options);
  }
  return res;
}

var uid$1 = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 *
 * @constructor
 */
function Dep() {
  this.id = uid$1++;
  this.subs = [];
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;

/**
 * Add a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.addSub = function (sub) {
  this.subs.push(sub);
};

/**
 * Remove a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.removeSub = function (sub) {
  this.subs.$remove(sub);
};

/**
 * Add self as a dependency to the target watcher.
 */

Dep.prototype.depend = function () {
  Dep.target.addDep(this);
};

/**
 * Notify all subscribers of a new value.
 */

Dep.prototype.notify = function () {
  // stablize the subscriber list first
  var subs = toArray(this.subs);
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */

;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator() {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length;
    var args = new Array(i);
    while (i--) {
      args[i] = arguments[i];
    }
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
        inserted = args;
        break;
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    // notify change
    ob.dep.notify();
    return result;
  });
});

/**
 * Swap the element at the given index with a new value
 * and emits corresponding event.
 *
 * @param {Number} index
 * @param {*} val
 * @return {*} - replaced element
 */

def(arrayProto, '$set', function $set(index, val) {
  if (index >= this.length) {
    this.length = Number(index) + 1;
  }
  return this.splice(index, 1, val)[0];
});

/**
 * Convenience method to remove the element at given index or target element reference.
 *
 * @param {*} item
 */

def(arrayProto, '$remove', function $remove(item) {
  /* istanbul ignore if */
  if (!this.length) return;
  var index = indexOf(this, item);
  if (index > -1) {
    return this.splice(index, 1);
  }
});

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However in certain cases, e.g.
 * v-for scope alias and props, we don't want to force conversion
 * because the value may be a nested value under a frozen data structure.
 *
 * So whenever we want to set a reactive property without forcing
 * conversion on the new value, we wrap that call inside this function.
 */

var shouldConvert = true;

function withoutConversion(fn) {
  shouldConvert = false;
  fn();
  shouldConvert = true;
}

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 *
 * @param {Array|Object} value
 * @constructor
 */

function Observer(value) {
  this.value = value;
  this.dep = new Dep();
  def(value, '__ob__', this);
  if (isArray(value)) {
    var augment = hasProto ? protoAugment : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
}

// Instance methods

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 *
 * @param {Object} obj
 */

Observer.prototype.walk = function (obj) {
  var keys = Object.keys(obj);
  for (var i = 0, l = keys.length; i < l; i++) {
    this.convert(keys[i], obj[keys[i]]);
  }
};

/**
 * Observe a list of Array items.
 *
 * @param {Array} items
 */

Observer.prototype.observeArray = function (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

/**
 * Convert a property into getter/setter so we can emit
 * the events when the property is accessed/changed.
 *
 * @param {String} key
 * @param {*} val
 */

Observer.prototype.convert = function (key, val) {
  defineReactive(this.value, key, val);
};

/**
 * Add an owner vm, so that when $set/$delete mutations
 * happen we can notify owner vms to proxy the keys and
 * digest the watchers. This is only called when the object
 * is observed as an instance's root $data.
 *
 * @param {Vue} vm
 */

Observer.prototype.addVm = function (vm) {
  (this.vms || (this.vms = [])).push(vm);
};

/**
 * Remove an owner vm. This is called when the object is
 * swapped out as an instance's $data object.
 *
 * @param {Vue} vm
 */

Observer.prototype.removeVm = function (vm) {
  this.vms.$remove(vm);
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 *
 * @param {Object|Array} target
 * @param {Object} src
 */

function protoAugment(target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function copyAugment(target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 *
 * @param {*} value
 * @param {Vue} [vm]
 * @return {Observer|undefined}
 * @static
 */

function observe(value, vm) {
  if (!value || typeof value !== 'object') {
    return;
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (shouldConvert && (isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
    ob = new Observer(value);
  }
  if (ob && vm) {
    ob.addVm(vm);
  }
  return ob;
}

/**
 * Define a reactive property on an Object.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 */

function defineReactive(obj, key, val) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;

  var childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        if (isArray(value)) {
          for (var e, i = 0, l = value.length; i < l; i++) {
            e = value[i];
            e && e.__ob__ && e.__ob__.dep.depend();
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      if (newVal === value) {
        return;
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = observe(newVal);
      dep.notify();
    }
  });
}



var util = Object.freeze({
	defineReactive: defineReactive,
	set: set,
	del: del,
	hasOwn: hasOwn,
	isLiteral: isLiteral,
	isReserved: isReserved,
	_toString: _toString,
	toNumber: toNumber,
	toBoolean: toBoolean,
	stripQuotes: stripQuotes,
	camelize: camelize,
	hyphenate: hyphenate,
	classify: classify,
	bind: bind,
	toArray: toArray,
	extend: extend,
	isObject: isObject,
	isPlainObject: isPlainObject,
	def: def,
	debounce: _debounce,
	indexOf: indexOf,
	cancellable: cancellable,
	looseEqual: looseEqual,
	isArray: isArray,
	hasProto: hasProto,
	inBrowser: inBrowser,
	devtools: devtools,
	isIE9: isIE9,
	isAndroid: isAndroid,
	isIos: isIos,
	isWechat: isWechat,
	get transitionProp () { return transitionProp; },
	get transitionEndEvent () { return transitionEndEvent; },
	get animationProp () { return animationProp; },
	get animationEndEvent () { return animationEndEvent; },
	nextTick: nextTick,
	get _Set () { return _Set; },
	query: query,
	inDoc: inDoc,
	getAttr: getAttr,
	getBindAttr: getBindAttr,
	hasBindAttr: hasBindAttr,
	before: before,
	after: after,
	remove: remove,
	prepend: prepend,
	replace: replace,
	on: on,
	off: off,
	setClass: setClass,
	addClass: addClass,
	removeClass: removeClass,
	extractContent: extractContent,
	trimNode: trimNode,
	isTemplate: isTemplate,
	createAnchor: createAnchor,
	findRef: findRef,
	mapNodeRange: mapNodeRange,
	removeNodeRange: removeNodeRange,
	isFragment: isFragment,
	getOuterHTML: getOuterHTML,
	mergeOptions: mergeOptions,
	resolveAsset: resolveAsset,
	checkComponentAttr: checkComponentAttr,
	commonTagRE: commonTagRE,
	reservedTagRE: reservedTagRE,
	get warn () { return warn; }
});

var uid = 0;

function initMixin (Vue) {
  /**
   * The main init sequence. This is called for every
   * instance, including ones that are created from extended
   * constructors.
   *
   * @param {Object} options - this options object should be
   *                           the result of merging class
   *                           options and the options passed
   *                           in to the constructor.
   */

  Vue.prototype._init = function (options) {
    options = options || {};

    this.$el = null;
    this.$parent = options.parent;
    this.$root = this.$parent ? this.$parent.$root : this;
    this.$children = [];
    this.$refs = {}; // child vm references
    this.$els = {}; // element references
    this._watchers = []; // all watchers as an array
    this._directives = []; // all directives

    // a uid
    this._uid = uid++;

    // a flag to avoid this being observed
    this._isVue = true;

    // events bookkeeping
    this._events = {}; // registered callbacks
    this._eventsCount = {}; // for $broadcast optimization

    // fragment instance properties
    this._isFragment = false;
    this._fragment = // @type {DocumentFragment}
    this._fragmentStart = // @type {Text|Comment}
    this._fragmentEnd = null; // @type {Text|Comment}

    // lifecycle state
    this._isCompiled = this._isDestroyed = this._isReady = this._isAttached = this._isBeingDestroyed = this._vForRemoving = false;
    this._unlinkFn = null;

    // context:
    // if this is a transcluded component, context
    // will be the common parent vm of this instance
    // and its host.
    this._context = options._context || this.$parent;

    // scope:
    // if this is inside an inline v-for, the scope
    // will be the intermediate scope created for this
    // repeat fragment. this is used for linking props
    // and container directives.
    this._scope = options._scope;

    // fragment:
    // if this instance is compiled inside a Fragment, it
    // needs to reigster itself as a child of that fragment
    // for attach/detach to work properly.
    this._frag = options._frag;
    if (this._frag) {
      this._frag.children.push(this);
    }

    // push self into parent / transclusion host
    if (this.$parent) {
      this.$parent.$children.push(this);
    }

    // merge options.
    options = this.$options = mergeOptions(this.constructor.options, options, this);

    // set ref
    this._updateRef();

    // initialize data as empty object.
    // it will be filled up in _initData().
    this._data = {};

    // call init hook
    this._callHook('init');

    // initialize data observation and scope inheritance.
    this._initState();

    // setup event system and option events.
    this._initEvents();

    // call created hook
    this._callHook('created');

    // if `el` option is passed, start compilation.
    if (options.el) {
      this.$mount(options.el);
    }
  };
}

var pathCache = new Cache(1000);

// actions
var APPEND = 0;
var PUSH = 1;
var INC_SUB_PATH_DEPTH = 2;
var PUSH_SUB_PATH = 3;

// states
var BEFORE_PATH = 0;
var IN_PATH = 1;
var BEFORE_IDENT = 2;
var IN_IDENT = 3;
var IN_SUB_PATH = 4;
var IN_SINGLE_QUOTE = 5;
var IN_DOUBLE_QUOTE = 6;
var AFTER_PATH = 7;
var ERROR = 8;

var pathStateMachine = [];

pathStateMachine[BEFORE_PATH] = {
  'ws': [BEFORE_PATH],
  'ident': [IN_IDENT, APPEND],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[IN_PATH] = {
  'ws': [IN_PATH],
  '.': [BEFORE_IDENT],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[BEFORE_IDENT] = {
  'ws': [BEFORE_IDENT],
  'ident': [IN_IDENT, APPEND]
};

pathStateMachine[IN_IDENT] = {
  'ident': [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  'number': [IN_IDENT, APPEND],
  'ws': [IN_PATH, PUSH],
  '.': [BEFORE_IDENT, PUSH],
  '[': [IN_SUB_PATH, PUSH],
  'eof': [AFTER_PATH, PUSH]
};

pathStateMachine[IN_SUB_PATH] = {
  "'": [IN_SINGLE_QUOTE, APPEND],
  '"': [IN_DOUBLE_QUOTE, APPEND],
  '[': [IN_SUB_PATH, INC_SUB_PATH_DEPTH],
  ']': [IN_PATH, PUSH_SUB_PATH],
  'eof': ERROR,
  'else': [IN_SUB_PATH, APPEND]
};

pathStateMachine[IN_SINGLE_QUOTE] = {
  "'": [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_SINGLE_QUOTE, APPEND]
};

pathStateMachine[IN_DOUBLE_QUOTE] = {
  '"': [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_DOUBLE_QUOTE, APPEND]
};

/**
 * Determine the type of a character in a keypath.
 *
 * @param {Char} ch
 * @return {String} type
 */

function getPathCharType(ch) {
  if (ch === undefined) {
    return 'eof';
  }

  var code = ch.charCodeAt(0);

  switch (code) {
    case 0x5B: // [
    case 0x5D: // ]
    case 0x2E: // .
    case 0x22: // "
    case 0x27: // '
    case 0x30:
      // 0
      return ch;

    case 0x5F: // _
    case 0x24:
      // $
      return 'ident';

    case 0x20: // Space
    case 0x09: // Tab
    case 0x0A: // Newline
    case 0x0D: // Return
    case 0xA0: // No-break space
    case 0xFEFF: // Byte Order Mark
    case 0x2028: // Line Separator
    case 0x2029:
      // Paragraph Separator
      return 'ws';
  }

  // a-z, A-Z
  if (code >= 0x61 && code <= 0x7A || code >= 0x41 && code <= 0x5A) {
    return 'ident';
  }

  // 1-9
  if (code >= 0x31 && code <= 0x39) {
    return 'number';
  }

  return 'else';
}

/**
 * Format a subPath, return its plain form if it is
 * a literal string or number. Otherwise prepend the
 * dynamic indicator (*).
 *
 * @param {String} path
 * @return {String}
 */

function formatSubPath(path) {
  var trimmed = path.trim();
  // invalid leading 0
  if (path.charAt(0) === '0' && isNaN(path)) {
    return false;
  }
  return isLiteral(trimmed) ? stripQuotes(trimmed) : '*' + trimmed;
}

/**
 * Parse a string path into an array of segments
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parse(path) {
  var keys = [];
  var index = -1;
  var mode = BEFORE_PATH;
  var subPathDepth = 0;
  var c, newChar, key, type, transition, action, typeMap;

  var actions = [];

  actions[PUSH] = function () {
    if (key !== undefined) {
      keys.push(key);
      key = undefined;
    }
  };

  actions[APPEND] = function () {
    if (key === undefined) {
      key = newChar;
    } else {
      key += newChar;
    }
  };

  actions[INC_SUB_PATH_DEPTH] = function () {
    actions[APPEND]();
    subPathDepth++;
  };

  actions[PUSH_SUB_PATH] = function () {
    if (subPathDepth > 0) {
      subPathDepth--;
      mode = IN_SUB_PATH;
      actions[APPEND]();
    } else {
      subPathDepth = 0;
      key = formatSubPath(key);
      if (key === false) {
        return false;
      } else {
        actions[PUSH]();
      }
    }
  };

  function maybeUnescapeQuote() {
    var nextChar = path[index + 1];
    if (mode === IN_SINGLE_QUOTE && nextChar === "'" || mode === IN_DOUBLE_QUOTE && nextChar === '"') {
      index++;
      newChar = '\\' + nextChar;
      actions[APPEND]();
      return true;
    }
  }

  while (mode != null) {
    index++;
    c = path[index];

    if (c === '\\' && maybeUnescapeQuote()) {
      continue;
    }

    type = getPathCharType(c);
    typeMap = pathStateMachine[mode];
    transition = typeMap[type] || typeMap['else'] || ERROR;

    if (transition === ERROR) {
      return; // parse error
    }

    mode = transition[0];
    action = actions[transition[1]];
    if (action) {
      newChar = transition[2];
      newChar = newChar === undefined ? c : newChar;
      if (action() === false) {
        return;
      }
    }

    if (mode === AFTER_PATH) {
      keys.raw = path;
      return keys;
    }
  }
}

/**
 * External parse that check for a cache hit first
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parsePath(path) {
  var hit = pathCache.get(path);
  if (!hit) {
    hit = parse(path);
    if (hit) {
      pathCache.put(path, hit);
    }
  }
  return hit;
}

/**
 * Get from an object from a path string
 *
 * @param {Object} obj
 * @param {String} path
 */

function getPath(obj, path) {
  return parseExpression(path).get(obj);
}

/**
 * Warn against setting non-existent root path on a vm.
 */

var warnNonExistent;
if (process.env.NODE_ENV !== 'production') {
  warnNonExistent = function (path, vm) {
    warn('You are setting a non-existent path "' + path.raw + '" ' + 'on a vm instance. Consider pre-initializing the property ' + 'with the "data" option for more reliable reactivity ' + 'and better performance.', vm);
  };
}

/**
 * Set on an object from a path
 *
 * @param {Object} obj
 * @param {String | Array} path
 * @param {*} val
 */

function setPath(obj, path, val) {
  var original = obj;
  if (typeof path === 'string') {
    path = parse(path);
  }
  if (!path || !isObject(obj)) {
    return false;
  }
  var last, key;
  for (var i = 0, l = path.length; i < l; i++) {
    last = obj;
    key = path[i];
    if (key.charAt(0) === '*') {
      key = parseExpression(key.slice(1)).get.call(original, original);
    }
    if (i < l - 1) {
      obj = obj[key];
      if (!isObject(obj)) {
        obj = {};
        if (process.env.NODE_ENV !== 'production' && last._isVue) {
          warnNonExistent(path, last);
        }
        set(last, key, obj);
      }
    } else {
      if (isArray(obj)) {
        obj.$set(key, val);
      } else if (key in obj) {
        obj[key] = val;
      } else {
        if (process.env.NODE_ENV !== 'production' && obj._isVue) {
          warnNonExistent(path, obj);
        }
        set(obj, key, val);
      }
    }
  }
  return true;
}

var path = Object.freeze({
  parsePath: parsePath,
  getPath: getPath,
  setPath: setPath
});

var expressionCache = new Cache(1000);

var allowedKeywords = 'Math,Date,this,true,false,null,undefined,Infinity,NaN,' + 'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,' + 'encodeURIComponent,parseInt,parseFloat';
var allowedKeywordsRE = new RegExp('^(' + allowedKeywords.replace(/,/g, '\\b|') + '\\b)');

// keywords that don't make sense inside expressions
var improperKeywords = 'break,case,class,catch,const,continue,debugger,default,' + 'delete,do,else,export,extends,finally,for,function,if,' + 'import,in,instanceof,let,return,super,switch,throw,try,' + 'var,while,with,yield,enum,await,implements,package,' + 'protected,static,interface,private,public';
var improperKeywordsRE = new RegExp('^(' + improperKeywords.replace(/,/g, '\\b|') + '\\b)');

var wsRE = /\s/g;
var newlineRE = /\n/g;
var saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g;
var restoreRE = /"(\d+)"/g;
var pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;
var identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g;
var booleanLiteralRE = /^(?:true|false)$/;

/**
 * Save / Rewrite / Restore
 *
 * When rewriting paths found in an expression, it is
 * possible for the same letter sequences to be found in
 * strings and Object literal property keys. Therefore we
 * remove and store these parts in a temporary array, and
 * restore them after the path rewrite.
 */

var saved = [];

/**
 * Save replacer
 *
 * The save regex can match two possible cases:
 * 1. An opening object literal
 * 2. A string
 * If matched as a plain string, we need to escape its
 * newlines, since the string needs to be preserved when
 * generating the function body.
 *
 * @param {String} str
 * @param {String} isString - str if matched as a string
 * @return {String} - placeholder with index
 */

function save(str, isString) {
  var i = saved.length;
  saved[i] = isString ? str.replace(newlineRE, '\\n') : str;
  return '"' + i + '"';
}

/**
 * Path rewrite replacer
 *
 * @param {String} raw
 * @return {String}
 */

function rewrite(raw) {
  var c = raw.charAt(0);
  var path = raw.slice(1);
  if (allowedKeywordsRE.test(path)) {
    return raw;
  } else {
    path = path.indexOf('"') > -1 ? path.replace(restoreRE, restore) : path;
    return c + 'scope.' + path;
  }
}

/**
 * Restore replacer
 *
 * @param {String} str
 * @param {String} i - matched save index
 * @return {String}
 */

function restore(str, i) {
  return saved[i];
}

/**
 * Rewrite an expression, prefixing all path accessors with
 * `scope.` and generate getter/setter functions.
 *
 * @param {String} exp
 * @return {Function}
 */

function compileGetter(exp) {
  if (improperKeywordsRE.test(exp)) {
    process.env.NODE_ENV !== 'production' && warn('Avoid using reserved keywords in expression: ' + exp);
  }
  // reset state
  saved.length = 0;
  // save strings and object literal keys
  var body = exp.replace(saveRE, save).replace(wsRE, '');
  // rewrite all paths
  // pad 1 space here becaue the regex matches 1 extra char
  body = (' ' + body).replace(identRE, rewrite).replace(restoreRE, restore);
  return makeGetterFn(body);
}

/**
 * Build a getter function. Requires eval.
 *
 * We isolate the try/catch so it doesn't affect the
 * optimization of the parse function when it is not called.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeGetterFn(body) {
  try {
    /* eslint-disable no-new-func */
    return new Function('scope', 'return ' + body + ';');
    /* eslint-enable no-new-func */
  } catch (e) {
    process.env.NODE_ENV !== 'production' && warn('Invalid expression. ' + 'Generated function body: ' + body);
  }
}

/**
 * Compile a setter function for the expression.
 *
 * @param {String} exp
 * @return {Function|undefined}
 */

function compileSetter(exp) {
  var path = parsePath(exp);
  if (path) {
    return function (scope, val) {
      setPath(scope, path, val);
    };
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid setter expression: ' + exp);
  }
}

/**
 * Parse an expression into re-written getter/setters.
 *
 * @param {String} exp
 * @param {Boolean} needSet
 * @return {Function}
 */

function parseExpression(exp, needSet) {
  exp = exp.trim();
  // try cache
  var hit = expressionCache.get(exp);
  if (hit) {
    if (needSet && !hit.set) {
      hit.set = compileSetter(hit.exp);
    }
    return hit;
  }
  var res = { exp: exp };
  res.get = isSimplePath(exp) && exp.indexOf('[') < 0
  // optimized super simple getter
  ? makeGetterFn('scope.' + exp)
  // dynamic getter
  : compileGetter(exp);
  if (needSet) {
    res.set = compileSetter(exp);
  }
  expressionCache.put(exp, res);
  return res;
}

/**
 * Check if an expression is a simple path.
 *
 * @param {String} exp
 * @return {Boolean}
 */

function isSimplePath(exp) {
  return pathTestRE.test(exp) &&
  // don't treat true/false as paths
  !booleanLiteralRE.test(exp) &&
  // Math constants e.g. Math.PI, Math.E etc.
  exp.slice(0, 5) !== 'Math.';
}

var expression = Object.freeze({
  parseExpression: parseExpression,
  isSimplePath: isSimplePath
});

// we have two separate queues: one for directive updates
// and one for user watcher registered via $watch().
// we want to guarantee directive updates to be called
// before user watchers so that when user watchers are
// triggered, the DOM would have already been in updated
// state.

var queue = [];
var userQueue = [];
var has = {};
var circular = {};
var waiting = false;

/**
 * Reset the batcher's state.
 */

function resetBatcherState() {
  queue.length = 0;
  userQueue.length = 0;
  has = {};
  circular = {};
  waiting = false;
}

/**
 * Flush both queues and run the watchers.
 */

function flushBatcherQueue() {
  var _again = true;

  _function: while (_again) {
    _again = false;

    runBatcherQueue(queue);
    runBatcherQueue(userQueue);
    // user watchers triggered more watchers,
    // keep flushing until it depletes
    if (queue.length) {
      _again = true;
      continue _function;
    }
    // dev tool hook
    /* istanbul ignore if */
    if (devtools && config.devtools) {
      devtools.emit('flush');
    }
    resetBatcherState();
  }
}

/**
 * Run the watchers in a single queue.
 *
 * @param {Array} queue
 */

function runBatcherQueue(queue) {
  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (var i = 0; i < queue.length; i++) {
    var watcher = queue[i];
    var id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > config._maxUpdateCount) {
        warn('You may have an infinite update loop for watcher ' + 'with expression "' + watcher.expression + '"', watcher.vm);
        break;
      }
    }
  }
  queue.length = 0;
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 *
 * @param {Watcher} watcher
 *   properties:
 *   - {Number} id
 *   - {Function} run
 */

function pushWatcher(watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    // push watcher into appropriate queue
    var q = watcher.user ? userQueue : queue;
    has[id] = q.length;
    q.push(watcher);
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushBatcherQueue);
    }
  }
}

var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 *
 * @param {Vue} vm
 * @param {String|Function} expOrFn
 * @param {Function} cb
 * @param {Object} options
 *                 - {Array} filters
 *                 - {Boolean} twoWay
 *                 - {Boolean} deep
 *                 - {Boolean} user
 *                 - {Boolean} sync
 *                 - {Boolean} lazy
 *                 - {Function} [preProcess]
 *                 - {Function} [postProcess]
 * @constructor
 */
function Watcher(vm, expOrFn, cb, options) {
  // mix in options
  if (options) {
    extend(this, options);
  }
  var isFn = typeof expOrFn === 'function';
  this.vm = vm;
  vm._watchers.push(this);
  this.expression = expOrFn;
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.prevError = null; // for async error stacks
  // parse expression for getter/setter
  if (isFn) {
    this.getter = expOrFn;
    this.setter = undefined;
  } else {
    var res = parseExpression(expOrFn, this.twoWay);
    this.getter = res.get;
    this.setter = res.set;
  }
  this.value = this.lazy ? undefined : this.get();
  // state for avoiding false triggers for deep and Array
  // watchers during vm._digest()
  this.queued = this.shallow = false;
}

/**
 * Evaluate the getter, and re-collect dependencies.
 */

Watcher.prototype.get = function () {
  this.beforeGet();
  var scope = this.scope || this.vm;
  var value;
  try {
    value = this.getter.call(scope, scope);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production' && config.warnExpressionErrors) {
      warn('Error when evaluating expression ' + '"' + this.expression + '": ' + e.toString(), this.vm);
    }
  }
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value);
  }
  if (this.preProcess) {
    value = this.preProcess(value);
  }
  if (this.filters) {
    value = scope._applyFilters(value, null, this.filters, false);
  }
  if (this.postProcess) {
    value = this.postProcess(value);
  }
  this.afterGet();
  return value;
};

/**
 * Set the corresponding value with the setter.
 *
 * @param {*} value
 */

Watcher.prototype.set = function (value) {
  var scope = this.scope || this.vm;
  if (this.filters) {
    value = scope._applyFilters(value, this.value, this.filters, true);
  }
  try {
    this.setter.call(scope, scope, value);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production' && config.warnExpressionErrors) {
      warn('Error when evaluating setter ' + '"' + this.expression + '": ' + e.toString(), this.vm);
    }
  }
  // two-way sync for v-for alias
  var forContext = scope.$forContext;
  if (forContext && forContext.alias === this.expression) {
    if (forContext.filters) {
      process.env.NODE_ENV !== 'production' && warn('It seems you are using two-way binding on ' + 'a v-for alias (' + this.expression + '), and the ' + 'v-for has filters. This will not work properly. ' + 'Either remove the filters or use an array of ' + 'objects and bind to object properties instead.', this.vm);
      return;
    }
    forContext._withLock(function () {
      if (scope.$key) {
        // original is an object
        forContext.rawValue[scope.$key] = value;
      } else {
        forContext.rawValue.$set(scope.$index, value);
      }
    });
  }
};

/**
 * Prepare for dependency collection.
 */

Watcher.prototype.beforeGet = function () {
  Dep.target = this;
};

/**
 * Add a dependency to this directive.
 *
 * @param {Dep} dep
 */

Watcher.prototype.addDep = function (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 */

Watcher.prototype.afterGet = function () {
  Dep.target = null;
  var i = this.deps.length;
  while (i--) {
    var dep = this.deps[i];
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 *
 * @param {Boolean} shallow
 */

Watcher.prototype.update = function (shallow) {
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync || !config.async) {
    this.run();
  } else {
    // if queued, only overwrite shallow with non-shallow,
    // but not the other way around.
    this.shallow = this.queued ? shallow ? this.shallow : false : !!shallow;
    this.queued = true;
    // record before-push error stack in debug mode
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.debug) {
      this.prevError = new Error('[vue] async stack trace');
    }
    pushWatcher(this);
  }
};

/**
 * Batcher job interface.
 * Will be called by the batcher.
 */

Watcher.prototype.run = function () {
  if (this.active) {
    var value = this.get();
    if (value !== this.value ||
    // Deep watchers and watchers on Object/Arrays should fire even
    // when the value is the same, because the value may
    // have mutated; but only do so if this is a
    // non-shallow update (caused by a vm digest).
    (isObject(value) || this.deep) && !this.shallow) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      // in debug + async mode, when a watcher callbacks
      // throws, we also throw the saved before-push error
      // so the full cross-tick stack trace is available.
      var prevError = this.prevError;
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.debug && prevError) {
        this.prevError = null;
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          nextTick(function () {
            throw prevError;
          }, 0);
          throw e;
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
    this.queued = this.shallow = false;
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */

Watcher.prototype.evaluate = function () {
  // avoid overwriting another watcher that is being
  // collected.
  var current = Dep.target;
  this.value = this.get();
  this.dirty = false;
  Dep.target = current;
};

/**
 * Depend on all deps collected by this watcher.
 */

Watcher.prototype.depend = function () {
  var i = this.deps.length;
  while (i--) {
    this.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subcriber list.
 */

Watcher.prototype.teardown = function () {
  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed or is performing a v-for
    // re-render (the watcher list is then filtered by v-for).
    if (!this.vm._isBeingDestroyed && !this.vm._vForRemoving) {
      this.vm._watchers.$remove(this);
    }
    var i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this);
    }
    this.active = false;
    this.vm = this.cb = this.value = null;
  }
};

/**
 * Recrusively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 *
 * @param {*} val
 */

var seenObjects = new _Set();
function traverse(val, seen) {
  var i = undefined,
      keys = undefined;
  if (!seen) {
    seen = seenObjects;
    seen.clear();
  }
  var isA = isArray(val);
  var isO = isObject(val);
  if (isA || isO) {
    if (val.__ob__) {
      var depId = val.__ob__.dep.id;
      if (seen.has(depId)) {
        return;
      } else {
        seen.add(depId);
      }
    }
    if (isA) {
      i = val.length;
      while (i--) traverse(val[i], seen);
    } else if (isO) {
      keys = Object.keys(val);
      i = keys.length;
      while (i--) traverse(val[keys[i]], seen);
    }
  }
}

var text$1 = {

  bind: function bind() {
    this.attr = this.el.nodeType === 3 ? 'data' : 'textContent';
  },

  update: function update(value) {
    this.el[this.attr] = _toString(value);
  }
};

var templateCache = new Cache(1000);
var idSelectorCache = new Cache(1000);

var map = {
  efault: [0, '', ''],
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>']
};

map.td = map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option = map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead = map.tbody = map.colgroup = map.caption = map.tfoot = [1, '<table>', '</table>'];

map.g = map.defs = map.symbol = map.use = map.image = map.text = map.circle = map.ellipse = map.line = map.path = map.polygon = map.polyline = map.rect = [1, '<svg ' + 'xmlns="http://www.w3.org/2000/svg" ' + 'xmlns:xlink="http://www.w3.org/1999/xlink" ' + 'xmlns:ev="http://www.w3.org/2001/xml-events"' + 'version="1.1">', '</svg>'];

/**
 * Check if a node is a supported template node with a
 * DocumentFragment content.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function isRealTemplate(node) {
  return isTemplate(node) && isFragment(node.content);
}

var tagRE$1 = /<([\w:-]+)/;
var entityRE = /&#?\w+?;/;

/**
 * Convert a string template to a DocumentFragment.
 * Determines correct wrapping by tag types. Wrapping
 * strategy found in jQuery & component/domify.
 *
 * @param {String} templateString
 * @param {Boolean} raw
 * @return {DocumentFragment}
 */

function stringToFragment(templateString, raw) {
  // try a cache hit first
  var cacheKey = raw ? templateString : templateString.trim();
  var hit = templateCache.get(cacheKey);
  if (hit) {
    return hit;
  }

  var frag = document.createDocumentFragment();
  var tagMatch = templateString.match(tagRE$1);
  var entityMatch = entityRE.test(templateString);

  if (!tagMatch && !entityMatch) {
    // text only, return a single text node.
    frag.appendChild(document.createTextNode(templateString));
  } else {
    var tag = tagMatch && tagMatch[1];
    var wrap = map[tag] || map.efault;
    var depth = wrap[0];
    var prefix = wrap[1];
    var suffix = wrap[2];
    var node = document.createElement('div');

    node.innerHTML = prefix + templateString + suffix;
    while (depth--) {
      node = node.lastChild;
    }

    var child;
    /* eslint-disable no-cond-assign */
    while (child = node.firstChild) {
      /* eslint-enable no-cond-assign */
      frag.appendChild(child);
    }
  }
  if (!raw) {
    trimNode(frag);
  }
  templateCache.put(cacheKey, frag);
  return frag;
}

/**
 * Convert a template node to a DocumentFragment.
 *
 * @param {Node} node
 * @return {DocumentFragment}
 */

function nodeToFragment(node) {
  // if its a template tag and the browser supports it,
  // its content is already a document fragment. However, iOS Safari has
  // bug when using directly cloned template content with touch
  // events and can cause crashes when the nodes are removed from DOM, so we
  // have to treat template elements as string templates. (#2805)
  /* istanbul ignore if */
  if (isRealTemplate(node)) {
    return stringToFragment(node.innerHTML);
  }
  // script template
  if (node.tagName === 'SCRIPT') {
    return stringToFragment(node.textContent);
  }
  // normal node, clone it to avoid mutating the original
  var clonedNode = cloneNode(node);
  var frag = document.createDocumentFragment();
  var child;
  /* eslint-disable no-cond-assign */
  while (child = clonedNode.firstChild) {
    /* eslint-enable no-cond-assign */
    frag.appendChild(child);
  }
  trimNode(frag);
  return frag;
}

// Test for the presence of the Safari template cloning bug
// https://bugs.webkit.org/showug.cgi?id=137755
var hasBrokenTemplate = (function () {
  /* istanbul ignore else */
  if (inBrowser) {
    var a = document.createElement('div');
    a.innerHTML = '<template>1</template>';
    return !a.cloneNode(true).firstChild.innerHTML;
  } else {
    return false;
  }
})();

// Test for IE10/11 textarea placeholder clone bug
var hasTextareaCloneBug = (function () {
  /* istanbul ignore else */
  if (inBrowser) {
    var t = document.createElement('textarea');
    t.placeholder = 't';
    return t.cloneNode(true).value === 't';
  } else {
    return false;
  }
})();

/**
 * 1. Deal with Safari cloning nested <template> bug by
 *    manually cloning all template instances.
 * 2. Deal with IE10/11 textarea placeholder bug by setting
 *    the correct value after cloning.
 *
 * @param {Element|DocumentFragment} node
 * @return {Element|DocumentFragment}
 */

function cloneNode(node) {
  /* istanbul ignore if */
  if (!node.querySelectorAll) {
    return node.cloneNode();
  }
  var res = node.cloneNode(true);
  var i, original, cloned;
  /* istanbul ignore if */
  if (hasBrokenTemplate) {
    var tempClone = res;
    if (isRealTemplate(node)) {
      node = node.content;
      tempClone = res.content;
    }
    original = node.querySelectorAll('template');
    if (original.length) {
      cloned = tempClone.querySelectorAll('template');
      i = cloned.length;
      while (i--) {
        cloned[i].parentNode.replaceChild(cloneNode(original[i]), cloned[i]);
      }
    }
  }
  /* istanbul ignore if */
  if (hasTextareaCloneBug) {
    if (node.tagName === 'TEXTAREA') {
      res.value = node.value;
    } else {
      original = node.querySelectorAll('textarea');
      if (original.length) {
        cloned = res.querySelectorAll('textarea');
        i = cloned.length;
        while (i--) {
          cloned[i].value = original[i].value;
        }
      }
    }
  }
  return res;
}

/**
 * Process the template option and normalizes it into a
 * a DocumentFragment that can be used as a partial or a
 * instance template.
 *
 * @param {*} template
 *        Possible values include:
 *        - DocumentFragment object
 *        - Node object of type Template
 *        - id selector: '#some-template-id'
 *        - template string: '<div><span>{{msg}}</span></div>'
 * @param {Boolean} shouldClone
 * @param {Boolean} raw
 *        inline HTML interpolation. Do not check for id
 *        selector and keep whitespace in the string.
 * @return {DocumentFragment|undefined}
 */

function parseTemplate(template, shouldClone, raw) {
  var node, frag;

  // if the template is already a document fragment,
  // do nothing
  if (isFragment(template)) {
    trimNode(template);
    return shouldClone ? cloneNode(template) : template;
  }

  if (typeof template === 'string') {
    // id selector
    if (!raw && template.charAt(0) === '#') {
      // id selector can be cached too
      frag = idSelectorCache.get(template);
      if (!frag) {
        node = document.getElementById(template.slice(1));
        if (node) {
          frag = nodeToFragment(node);
          // save selector to cache
          idSelectorCache.put(template, frag);
        }
      }
    } else {
      // normal string template
      frag = stringToFragment(template, raw);
    }
  } else if (template.nodeType) {
    // a direct node
    frag = nodeToFragment(template);
  }

  return frag && shouldClone ? cloneNode(frag) : frag;
}

var template = Object.freeze({
  cloneNode: cloneNode,
  parseTemplate: parseTemplate
});

var html = {

  bind: function bind() {
    // a comment node means this is a binding for
    // {{{ inline unescaped html }}}
    if (this.el.nodeType === 8) {
      // hold nodes
      this.nodes = [];
      // replace the placeholder with proper anchor
      this.anchor = createAnchor('v-html');
      replace(this.el, this.anchor);
    }
  },

  update: function update(value) {
    value = _toString(value);
    if (this.nodes) {
      this.swap(value);
    } else {
      this.el.innerHTML = value;
    }
  },

  swap: function swap(value) {
    // remove old nodes
    var i = this.nodes.length;
    while (i--) {
      remove(this.nodes[i]);
    }
    // convert new value to a fragment
    // do not attempt to retrieve from id selector
    var frag = parseTemplate(value, true, true);
    // save a reference to these nodes so we can remove later
    this.nodes = toArray(frag.childNodes);
    before(frag, this.anchor);
  }
};

/**
 * Abstraction for a partially-compiled fragment.
 * Can optionally compile content with a child scope.
 *
 * @param {Function} linker
 * @param {Vue} vm
 * @param {DocumentFragment} frag
 * @param {Vue} [host]
 * @param {Object} [scope]
 * @param {Fragment} [parentFrag]
 */
function Fragment(linker, vm, frag, host, scope, parentFrag) {
  this.children = [];
  this.childFrags = [];
  this.vm = vm;
  this.scope = scope;
  this.inserted = false;
  this.parentFrag = parentFrag;
  if (parentFrag) {
    parentFrag.childFrags.push(this);
  }
  this.unlink = linker(vm, frag, host, scope, this);
  var single = this.single = frag.childNodes.length === 1 &&
  // do not go single mode if the only node is an anchor
  !frag.childNodes[0].__v_anchor;
  if (single) {
    this.node = frag.childNodes[0];
    this.before = singleBefore;
    this.remove = singleRemove;
  } else {
    this.node = createAnchor('fragment-start');
    this.end = createAnchor('fragment-end');
    this.frag = frag;
    prepend(this.node, frag);
    frag.appendChild(this.end);
    this.before = multiBefore;
    this.remove = multiRemove;
  }
  this.node.__v_frag = this;
}

/**
 * Call attach/detach for all components contained within
 * this fragment. Also do so recursively for all child
 * fragments.
 *
 * @param {Function} hook
 */

Fragment.prototype.callHook = function (hook) {
  var i, l;
  for (i = 0, l = this.childFrags.length; i < l; i++) {
    this.childFrags[i].callHook(hook);
  }
  for (i = 0, l = this.children.length; i < l; i++) {
    hook(this.children[i]);
  }
};

/**
 * Insert fragment before target, single node version
 *
 * @param {Node} target
 * @param {Boolean} withTransition
 */

function singleBefore(target, withTransition) {
  this.inserted = true;
  var method = withTransition !== false ? beforeWithTransition : before;
  method(this.node, target, this.vm);
  if (inDoc(this.node)) {
    this.callHook(attach);
  }
}

/**
 * Remove fragment, single node version
 */

function singleRemove() {
  this.inserted = false;
  var shouldCallRemove = inDoc(this.node);
  var self = this;
  this.beforeRemove();
  removeWithTransition(this.node, this.vm, function () {
    if (shouldCallRemove) {
      self.callHook(detach);
    }
    self.destroy();
  });
}

/**
 * Insert fragment before target, multi-nodes version
 *
 * @param {Node} target
 * @param {Boolean} withTransition
 */

function multiBefore(target, withTransition) {
  this.inserted = true;
  var vm = this.vm;
  var method = withTransition !== false ? beforeWithTransition : before;
  mapNodeRange(this.node, this.end, function (node) {
    method(node, target, vm);
  });
  if (inDoc(this.node)) {
    this.callHook(attach);
  }
}

/**
 * Remove fragment, multi-nodes version
 */

function multiRemove() {
  this.inserted = false;
  var self = this;
  var shouldCallRemove = inDoc(this.node);
  this.beforeRemove();
  removeNodeRange(this.node, this.end, this.vm, this.frag, function () {
    if (shouldCallRemove) {
      self.callHook(detach);
    }
    self.destroy();
  });
}

/**
 * Prepare the fragment for removal.
 */

Fragment.prototype.beforeRemove = function () {
  var i, l;
  for (i = 0, l = this.childFrags.length; i < l; i++) {
    // call the same method recursively on child
    // fragments, depth-first
    this.childFrags[i].beforeRemove(false);
  }
  for (i = 0, l = this.children.length; i < l; i++) {
    // Call destroy for all contained instances,
    // with remove:false and defer:true.
    // Defer is necessary because we need to
    // keep the children to call detach hooks
    // on them.
    this.children[i].$destroy(false, true);
  }
  var dirs = this.unlink.dirs;
  for (i = 0, l = dirs.length; i < l; i++) {
    // disable the watchers on all the directives
    // so that the rendered content stays the same
    // during removal.
    dirs[i]._watcher && dirs[i]._watcher.teardown();
  }
};

/**
 * Destroy the fragment.
 */

Fragment.prototype.destroy = function () {
  if (this.parentFrag) {
    this.parentFrag.childFrags.$remove(this);
  }
  this.node.__v_frag = null;
  this.unlink();
};

/**
 * Call attach hook for a Vue instance.
 *
 * @param {Vue} child
 */

function attach(child) {
  if (!child._isAttached && inDoc(child.$el)) {
    child._callHook('attached');
  }
}

/**
 * Call detach hook for a Vue instance.
 *
 * @param {Vue} child
 */

function detach(child) {
  if (child._isAttached && !inDoc(child.$el)) {
    child._callHook('detached');
  }
}

var linkerCache = new Cache(5000);

/**
 * A factory that can be used to create instances of a
 * fragment. Caches the compiled linker if possible.
 *
 * @param {Vue} vm
 * @param {Element|String} el
 */
function FragmentFactory(vm, el) {
  this.vm = vm;
  var template;
  var isString = typeof el === 'string';
  if (isString || isTemplate(el) && !el.hasAttribute('v-if')) {
    template = parseTemplate(el, true);
  } else {
    template = document.createDocumentFragment();
    template.appendChild(el);
  }
  this.template = template;
  // linker can be cached, but only for components
  var linker;
  var cid = vm.constructor.cid;
  if (cid > 0) {
    var cacheId = cid + (isString ? el : getOuterHTML(el));
    linker = linkerCache.get(cacheId);
    if (!linker) {
      linker = compile(template, vm.$options, true);
      linkerCache.put(cacheId, linker);
    }
  } else {
    linker = compile(template, vm.$options, true);
  }
  this.linker = linker;
}

/**
 * Create a fragment instance with given host and scope.
 *
 * @param {Vue} host
 * @param {Object} scope
 * @param {Fragment} parentFrag
 */

FragmentFactory.prototype.create = function (host, scope, parentFrag) {
  var frag = cloneNode(this.template);
  return new Fragment(this.linker, this.vm, frag, host, scope, parentFrag);
};

var ON = 700;
var MODEL = 800;
var BIND = 850;
var TRANSITION = 1100;
var EL = 1500;
var COMPONENT = 1500;
var PARTIAL = 1750;
var IF = 2100;
var FOR = 2200;
var SLOT = 2300;

var uid$3 = 0;

var vFor = {

  priority: FOR,
  terminal: true,

  params: ['track-by', 'stagger', 'enter-stagger', 'leave-stagger'],

  bind: function bind() {
    // support "item in/of items" syntax
    var inMatch = this.expression.match(/(.*) (?:in|of) (.*)/);
    if (inMatch) {
      var itMatch = inMatch[1].match(/\((.*),(.*)\)/);
      if (itMatch) {
        this.iterator = itMatch[1].trim();
        this.alias = itMatch[2].trim();
      } else {
        this.alias = inMatch[1].trim();
      }
      this.expression = inMatch[2];
    }

    if (!this.alias) {
      process.env.NODE_ENV !== 'production' && warn('Invalid v-for expression "' + this.descriptor.raw + '": ' + 'alias is required.', this.vm);
      return;
    }

    // uid as a cache identifier
    this.id = '__v-for__' + ++uid$3;

    // check if this is an option list,
    // so that we know if we need to update the <select>'s
    // v-model when the option list has changed.
    // because v-model has a lower priority than v-for,
    // the v-model is not bound here yet, so we have to
    // retrive it in the actual updateModel() function.
    var tag = this.el.tagName;
    this.isOption = (tag === 'OPTION' || tag === 'OPTGROUP') && this.el.parentNode.tagName === 'SELECT';

    // setup anchor nodes
    this.start = createAnchor('v-for-start');
    this.end = createAnchor('v-for-end');
    replace(this.el, this.end);
    before(this.start, this.end);

    // cache
    this.cache = Object.create(null);

    // fragment factory
    this.factory = new FragmentFactory(this.vm, this.el);
  },

  update: function update(data) {
    this.diff(data);
    this.updateRef();
    this.updateModel();
  },

  /**
   * Diff, based on new data and old data, determine the
   * minimum amount of DOM manipulations needed to make the
   * DOM reflect the new data Array.
   *
   * The algorithm diffs the new data Array by storing a
   * hidden reference to an owner vm instance on previously
   * seen data. This allows us to achieve O(n) which is
   * better than a levenshtein distance based algorithm,
   * which is O(m * n).
   *
   * @param {Array} data
   */

  diff: function diff(data) {
    // check if the Array was converted from an Object
    var item = data[0];
    var convertedFromObject = this.fromObject = isObject(item) && hasOwn(item, '$key') && hasOwn(item, '$value');

    var trackByKey = this.params.trackBy;
    var oldFrags = this.frags;
    var frags = this.frags = new Array(data.length);
    var alias = this.alias;
    var iterator = this.iterator;
    var start = this.start;
    var end = this.end;
    var inDocument = inDoc(start);
    var init = !oldFrags;
    var i, l, frag, key, value, primitive;

    // First pass, go through the new Array and fill up
    // the new frags array. If a piece of data has a cached
    // instance for it, we reuse it. Otherwise build a new
    // instance.
    for (i = 0, l = data.length; i < l; i++) {
      item = data[i];
      key = convertedFromObject ? item.$key : null;
      value = convertedFromObject ? item.$value : item;
      primitive = !isObject(value);
      frag = !init && this.getCachedFrag(value, i, key);
      if (frag) {
        // reusable fragment
        frag.reused = true;
        // update $index
        frag.scope.$index = i;
        // update $key
        if (key) {
          frag.scope.$key = key;
        }
        // update iterator
        if (iterator) {
          frag.scope[iterator] = key !== null ? key : i;
        }
        // update data for track-by, object repeat &
        // primitive values.
        if (trackByKey || convertedFromObject || primitive) {
          withoutConversion(function () {
            frag.scope[alias] = value;
          });
        }
      } else {
        // new isntance
        frag = this.create(value, alias, i, key);
        frag.fresh = !init;
      }
      frags[i] = frag;
      if (init) {
        frag.before(end);
      }
    }

    // we're done for the initial render.
    if (init) {
      return;
    }

    // Second pass, go through the old fragments and
    // destroy those who are not reused (and remove them
    // from cache)
    var removalIndex = 0;
    var totalRemoved = oldFrags.length - frags.length;
    // when removing a large number of fragments, watcher removal
    // turns out to be a perf bottleneck, so we batch the watcher
    // removals into a single filter call!
    this.vm._vForRemoving = true;
    for (i = 0, l = oldFrags.length; i < l; i++) {
      frag = oldFrags[i];
      if (!frag.reused) {
        this.deleteCachedFrag(frag);
        this.remove(frag, removalIndex++, totalRemoved, inDocument);
      }
    }
    this.vm._vForRemoving = false;
    if (removalIndex) {
      this.vm._watchers = this.vm._watchers.filter(function (w) {
        return w.active;
      });
    }

    // Final pass, move/insert new fragments into the
    // right place.
    var targetPrev, prevEl, currentPrev;
    var insertionIndex = 0;
    for (i = 0, l = frags.length; i < l; i++) {
      frag = frags[i];
      // this is the frag that we should be after
      targetPrev = frags[i - 1];
      prevEl = targetPrev ? targetPrev.staggerCb ? targetPrev.staggerAnchor : targetPrev.end || targetPrev.node : start;
      if (frag.reused && !frag.staggerCb) {
        currentPrev = findPrevFrag(frag, start, this.id);
        if (currentPrev !== targetPrev && (!currentPrev ||
        // optimization for moving a single item.
        // thanks to suggestions by @livoras in #1807
        findPrevFrag(currentPrev, start, this.id) !== targetPrev)) {
          this.move(frag, prevEl);
        }
      } else {
        // new instance, or still in stagger.
        // insert with updated stagger index.
        this.insert(frag, insertionIndex++, prevEl, inDocument);
      }
      frag.reused = frag.fresh = false;
    }
  },

  /**
   * Create a new fragment instance.
   *
   * @param {*} value
   * @param {String} alias
   * @param {Number} index
   * @param {String} [key]
   * @return {Fragment}
   */

  create: function create(value, alias, index, key) {
    var host = this._host;
    // create iteration scope
    var parentScope = this._scope || this.vm;
    var scope = Object.create(parentScope);
    // ref holder for the scope
    scope.$refs = Object.create(parentScope.$refs);
    scope.$els = Object.create(parentScope.$els);
    // make sure point $parent to parent scope
    scope.$parent = parentScope;
    // for two-way binding on alias
    scope.$forContext = this;
    // define scope properties
    // important: define the scope alias without forced conversion
    // so that frozen data structures remain non-reactive.
    withoutConversion(function () {
      defineReactive(scope, alias, value);
    });
    defineReactive(scope, '$index', index);
    if (key) {
      defineReactive(scope, '$key', key);
    } else if (scope.$key) {
      // avoid accidental fallback
      def(scope, '$key', null);
    }
    if (this.iterator) {
      defineReactive(scope, this.iterator, key !== null ? key : index);
    }
    var frag = this.factory.create(host, scope, this._frag);
    frag.forId = this.id;
    this.cacheFrag(value, frag, index, key);
    return frag;
  },

  /**
   * Update the v-ref on owner vm.
   */

  updateRef: function updateRef() {
    var ref = this.descriptor.ref;
    if (!ref) return;
    var hash = (this._scope || this.vm).$refs;
    var refs;
    if (!this.fromObject) {
      refs = this.frags.map(findVmFromFrag);
    } else {
      refs = {};
      this.frags.forEach(function (frag) {
        refs[frag.scope.$key] = findVmFromFrag(frag);
      });
    }
    hash[ref] = refs;
  },

  /**
   * For option lists, update the containing v-model on
   * parent <select>.
   */

  updateModel: function updateModel() {
    if (this.isOption) {
      var parent = this.start.parentNode;
      var model = parent && parent.__v_model;
      if (model) {
        model.forceUpdate();
      }
    }
  },

  /**
   * Insert a fragment. Handles staggering.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Node} prevEl
   * @param {Boolean} inDocument
   */

  insert: function insert(frag, index, prevEl, inDocument) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel();
      frag.staggerCb = null;
    }
    var staggerAmount = this.getStagger(frag, index, null, 'enter');
    if (inDocument && staggerAmount) {
      // create an anchor and insert it synchronously,
      // so that we can resolve the correct order without
      // worrying about some elements not inserted yet
      var anchor = frag.staggerAnchor;
      if (!anchor) {
        anchor = frag.staggerAnchor = createAnchor('stagger-anchor');
        anchor.__v_frag = frag;
      }
      after(anchor, prevEl);
      var op = frag.staggerCb = cancellable(function () {
        frag.staggerCb = null;
        frag.before(anchor);
        remove(anchor);
      });
      setTimeout(op, staggerAmount);
    } else {
      var target = prevEl.nextSibling;
      /* istanbul ignore if */
      if (!target) {
        // reset end anchor position in case the position was messed up
        // by an external drag-n-drop library.
        after(this.end, prevEl);
        target = this.end;
      }
      frag.before(target);
    }
  },

  /**
   * Remove a fragment. Handles staggering.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {Boolean} inDocument
   */

  remove: function remove(frag, index, total, inDocument) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel();
      frag.staggerCb = null;
      // it's not possible for the same frag to be removed
      // twice, so if we have a pending stagger callback,
      // it means this frag is queued for enter but removed
      // before its transition started. Since it is already
      // destroyed, we can just leave it in detached state.
      return;
    }
    var staggerAmount = this.getStagger(frag, index, total, 'leave');
    if (inDocument && staggerAmount) {
      var op = frag.staggerCb = cancellable(function () {
        frag.staggerCb = null;
        frag.remove();
      });
      setTimeout(op, staggerAmount);
    } else {
      frag.remove();
    }
  },

  /**
   * Move a fragment to a new position.
   * Force no transition.
   *
   * @param {Fragment} frag
   * @param {Node} prevEl
   */

  move: function move(frag, prevEl) {
    // fix a common issue with Sortable:
    // if prevEl doesn't have nextSibling, this means it's
    // been dragged after the end anchor. Just re-position
    // the end anchor to the end of the container.
    /* istanbul ignore if */
    if (!prevEl.nextSibling) {
      this.end.parentNode.appendChild(this.end);
    }
    frag.before(prevEl.nextSibling, false);
  },

  /**
   * Cache a fragment using track-by or the object key.
   *
   * @param {*} value
   * @param {Fragment} frag
   * @param {Number} index
   * @param {String} [key]
   */

  cacheFrag: function cacheFrag(value, frag, index, key) {
    var trackByKey = this.params.trackBy;
    var cache = this.cache;
    var primitive = !isObject(value);
    var id;
    if (key || trackByKey || primitive) {
      id = getTrackByKey(index, key, value, trackByKey);
      if (!cache[id]) {
        cache[id] = frag;
      } else if (trackByKey !== '$index') {
        process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
      }
    } else {
      id = this.id;
      if (hasOwn(value, id)) {
        if (value[id] === null) {
          value[id] = frag;
        } else {
          process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
        }
      } else if (Object.isExtensible(value)) {
        def(value, id, frag);
      } else if (process.env.NODE_ENV !== 'production') {
        warn('Frozen v-for objects cannot be automatically tracked, make sure to ' + 'provide a track-by key.');
      }
    }
    frag.raw = value;
  },

  /**
   * Get a cached fragment from the value/index/key
   *
   * @param {*} value
   * @param {Number} index
   * @param {String} key
   * @return {Fragment}
   */

  getCachedFrag: function getCachedFrag(value, index, key) {
    var trackByKey = this.params.trackBy;
    var primitive = !isObject(value);
    var frag;
    if (key || trackByKey || primitive) {
      var id = getTrackByKey(index, key, value, trackByKey);
      frag = this.cache[id];
    } else {
      frag = value[this.id];
    }
    if (frag && (frag.reused || frag.fresh)) {
      process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
    }
    return frag;
  },

  /**
   * Delete a fragment from cache.
   *
   * @param {Fragment} frag
   */

  deleteCachedFrag: function deleteCachedFrag(frag) {
    var value = frag.raw;
    var trackByKey = this.params.trackBy;
    var scope = frag.scope;
    var index = scope.$index;
    // fix #948: avoid accidentally fall through to
    // a parent repeater which happens to have $key.
    var key = hasOwn(scope, '$key') && scope.$key;
    var primitive = !isObject(value);
    if (trackByKey || key || primitive) {
      var id = getTrackByKey(index, key, value, trackByKey);
      this.cache[id] = null;
    } else {
      value[this.id] = null;
      frag.raw = null;
    }
  },

  /**
   * Get the stagger amount for an insertion/removal.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {String} type
   */

  getStagger: function getStagger(frag, index, total, type) {
    type = type + 'Stagger';
    var trans = frag.node.__v_trans;
    var hooks = trans && trans.hooks;
    var hook = hooks && (hooks[type] || hooks.stagger);
    return hook ? hook.call(frag, index, total) : index * parseInt(this.params[type] || this.params.stagger, 10);
  },

  /**
   * Pre-process the value before piping it through the
   * filters. This is passed to and called by the watcher.
   */

  _preProcess: function _preProcess(value) {
    // regardless of type, store the un-filtered raw value.
    this.rawValue = value;
    return value;
  },

  /**
   * Post-process the value after it has been piped through
   * the filters. This is passed to and called by the watcher.
   *
   * It is necessary for this to be called during the
   * wathcer's dependency collection phase because we want
   * the v-for to update when the source Object is mutated.
   */

  _postProcess: function _postProcess(value) {
    if (isArray(value)) {
      return value;
    } else if (isPlainObject(value)) {
      // convert plain object to array.
      var keys = Object.keys(value);
      var i = keys.length;
      var res = new Array(i);
      var key;
      while (i--) {
        key = keys[i];
        res[i] = {
          $key: key,
          $value: value[key]
        };
      }
      return res;
    } else {
      if (typeof value === 'number' && !isNaN(value)) {
        value = range(value);
      }
      return value || [];
    }
  },

  unbind: function unbind() {
    if (this.descriptor.ref) {
      (this._scope || this.vm).$refs[this.descriptor.ref] = null;
    }
    if (this.frags) {
      var i = this.frags.length;
      var frag;
      while (i--) {
        frag = this.frags[i];
        this.deleteCachedFrag(frag);
        frag.destroy();
      }
    }
  }
};

/**
 * Helper to find the previous element that is a fragment
 * anchor. This is necessary because a destroyed frag's
 * element could still be lingering in the DOM before its
 * leaving transition finishes, but its inserted flag
 * should have been set to false so we can skip them.
 *
 * If this is a block repeat, we want to make sure we only
 * return frag that is bound to this v-for. (see #929)
 *
 * @param {Fragment} frag
 * @param {Comment|Text} anchor
 * @param {String} id
 * @return {Fragment}
 */

function findPrevFrag(frag, anchor, id) {
  var el = frag.node.previousSibling;
  /* istanbul ignore if */
  if (!el) return;
  frag = el.__v_frag;
  while ((!frag || frag.forId !== id || !frag.inserted) && el !== anchor) {
    el = el.previousSibling;
    /* istanbul ignore if */
    if (!el) return;
    frag = el.__v_frag;
  }
  return frag;
}

/**
 * Find a vm from a fragment.
 *
 * @param {Fragment} frag
 * @return {Vue|undefined}
 */

function findVmFromFrag(frag) {
  var node = frag.node;
  // handle multi-node frag
  if (frag.end) {
    while (!node.__vue__ && node !== frag.end && node.nextSibling) {
      node = node.nextSibling;
    }
  }
  return node.__vue__;
}

/**
 * Create a range array from given number.
 *
 * @param {Number} n
 * @return {Array}
 */

function range(n) {
  var i = -1;
  var ret = new Array(Math.floor(n));
  while (++i < n) {
    ret[i] = i;
  }
  return ret;
}

/**
 * Get the track by key for an item.
 *
 * @param {Number} index
 * @param {String} key
 * @param {*} value
 * @param {String} [trackByKey]
 */

function getTrackByKey(index, key, value, trackByKey) {
  return trackByKey ? trackByKey === '$index' ? index : trackByKey.charAt(0).match(/\w/) ? getPath(value, trackByKey) : value[trackByKey] : key || value;
}

if (process.env.NODE_ENV !== 'production') {
  vFor.warnDuplicate = function (value) {
    warn('Duplicate value found in v-for="' + this.descriptor.raw + '": ' + JSON.stringify(value) + '. Use track-by="$index" if ' + 'you are expecting duplicate values.', this.vm);
  };
}

var vIf = {

  priority: IF,
  terminal: true,

  bind: function bind() {
    var el = this.el;
    if (!el.__vue__) {
      // check else block
      var next = el.nextElementSibling;
      if (next && getAttr(next, 'v-else') !== null) {
        remove(next);
        this.elseEl = next;
      }
      // check main block
      this.anchor = createAnchor('v-if');
      replace(el, this.anchor);
    } else {
      process.env.NODE_ENV !== 'production' && warn('v-if="' + this.expression + '" cannot be ' + 'used on an instance root element.', this.vm);
      this.invalid = true;
    }
  },

  update: function update(value) {
    if (this.invalid) return;
    if (value) {
      if (!this.frag) {
        this.insert();
      }
    } else {
      this.remove();
    }
  },

  insert: function insert() {
    if (this.elseFrag) {
      this.elseFrag.remove();
      this.elseFrag = null;
    }
    // lazy init factory
    if (!this.factory) {
      this.factory = new FragmentFactory(this.vm, this.el);
    }
    this.frag = this.factory.create(this._host, this._scope, this._frag);
    this.frag.before(this.anchor);
  },

  remove: function remove() {
    if (this.frag) {
      this.frag.remove();
      this.frag = null;
    }
    if (this.elseEl && !this.elseFrag) {
      if (!this.elseFactory) {
        this.elseFactory = new FragmentFactory(this.elseEl._context || this.vm, this.elseEl);
      }
      this.elseFrag = this.elseFactory.create(this._host, this._scope, this._frag);
      this.elseFrag.before(this.anchor);
    }
  },

  unbind: function unbind() {
    if (this.frag) {
      this.frag.destroy();
    }
    if (this.elseFrag) {
      this.elseFrag.destroy();
    }
  }
};

var show = {

  bind: function bind() {
    // check else block
    var next = this.el.nextElementSibling;
    if (next && getAttr(next, 'v-else') !== null) {
      this.elseEl = next;
    }
  },

  update: function update(value) {
    this.apply(this.el, value);
    if (this.elseEl) {
      this.apply(this.elseEl, !value);
    }
  },

  apply: function apply(el, value) {
    if (inDoc(el)) {
      applyTransition(el, value ? 1 : -1, toggle, this.vm);
    } else {
      toggle();
    }
    function toggle() {
      el.style.display = value ? '' : 'none';
    }
  }
};

var text$2 = {

  bind: function bind() {
    var self = this;
    var el = this.el;
    var isRange = el.type === 'range';
    var lazy = this.params.lazy;
    var number = this.params.number;
    var debounce = this.params.debounce;

    // handle composition events.
    //   http://blog.evanyou.me/2014/01/03/composition-event/
    // skip this for Android because it handles composition
    // events quite differently. Android doesn't trigger
    // composition events for language input methods e.g.
    // Chinese, but instead triggers them for spelling
    // suggestions... (see Discussion/#162)
    var composing = false;
    if (!isAndroid && !isRange) {
      this.on('compositionstart', function () {
        composing = true;
      });
      this.on('compositionend', function () {
        composing = false;
        // in IE11 the "compositionend" event fires AFTER
        // the "input" event, so the input handler is blocked
        // at the end... have to call it here.
        //
        // #1327: in lazy mode this is unecessary.
        if (!lazy) {
          self.listener();
        }
      });
    }

    // prevent messing with the input when user is typing,
    // and force update on blur.
    this.focused = false;
    if (!isRange && !lazy) {
      this.on('focus', function () {
        self.focused = true;
      });
      this.on('blur', function () {
        self.focused = false;
        // do not sync value after fragment removal (#2017)
        if (!self._frag || self._frag.inserted) {
          self.rawListener();
        }
      });
    }

    // Now attach the main listener
    this.listener = this.rawListener = function () {
      if (composing || !self._bound) {
        return;
      }
      var val = number || isRange ? toNumber(el.value) : el.value;
      self.set(val);
      // force update on next tick to avoid lock & same value
      // also only update when user is not typing
      nextTick(function () {
        if (self._bound && !self.focused) {
          self.update(self._watcher.value);
        }
      });
    };

    // apply debounce
    if (debounce) {
      this.listener = _debounce(this.listener, debounce);
    }

    // Support jQuery events, since jQuery.trigger() doesn't
    // trigger native events in some cases and some plugins
    // rely on $.trigger()
    //
    // We want to make sure if a listener is attached using
    // jQuery, it is also removed with jQuery, that's why
    // we do the check for each directive instance and
    // store that check result on itself. This also allows
    // easier test coverage control by unsetting the global
    // jQuery variable in tests.
    this.hasjQuery = typeof jQuery === 'function';
    if (this.hasjQuery) {
      var method = jQuery.fn.on ? 'on' : 'bind';
      jQuery(el)[method]('change', this.rawListener);
      if (!lazy) {
        jQuery(el)[method]('input', this.listener);
      }
    } else {
      this.on('change', this.rawListener);
      if (!lazy) {
        this.on('input', this.listener);
      }
    }

    // IE9 doesn't fire input event on backspace/del/cut
    if (!lazy && isIE9) {
      this.on('cut', function () {
        nextTick(self.listener);
      });
      this.on('keyup', function (e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          self.listener();
        }
      });
    }

    // set initial value if present
    if (el.hasAttribute('value') || el.tagName === 'TEXTAREA' && el.value.trim()) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    this.el.value = _toString(value);
  },

  unbind: function unbind() {
    var el = this.el;
    if (this.hasjQuery) {
      var method = jQuery.fn.off ? 'off' : 'unbind';
      jQuery(el)[method]('change', this.listener);
      jQuery(el)[method]('input', this.listener);
    }
  }
};

var radio = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    this.getValue = function () {
      // value overwrite via v-bind:value
      if (el.hasOwnProperty('_value')) {
        return el._value;
      }
      var val = el.value;
      if (self.params.number) {
        val = toNumber(val);
      }
      return val;
    };

    this.listener = function () {
      self.set(self.getValue());
    };
    this.on('change', this.listener);

    if (el.hasAttribute('checked')) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    this.el.checked = looseEqual(value, this.getValue());
  }
};

var select = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    // method to force update DOM using latest value.
    this.forceUpdate = function () {
      if (self._watcher) {
        self.update(self._watcher.get());
      }
    };

    // check if this is a multiple select
    var multiple = this.multiple = el.hasAttribute('multiple');

    // attach listener
    this.listener = function () {
      var value = getValue(el, multiple);
      value = self.params.number ? isArray(value) ? value.map(toNumber) : toNumber(value) : value;
      self.set(value);
    };
    this.on('change', this.listener);

    // if has initial value, set afterBind
    var initValue = getValue(el, multiple, true);
    if (multiple && initValue.length || !multiple && initValue !== null) {
      this.afterBind = this.listener;
    }

    // All major browsers except Firefox resets
    // selectedIndex with value -1 to 0 when the element
    // is appended to a new parent, therefore we have to
    // force a DOM update whenever that happens...
    this.vm.$on('hook:attached', this.forceUpdate);
  },

  update: function update(value) {
    var el = this.el;
    el.selectedIndex = -1;
    var multi = this.multiple && isArray(value);
    var options = el.options;
    var i = options.length;
    var op, val;
    while (i--) {
      op = options[i];
      val = op.hasOwnProperty('_value') ? op._value : op.value;
      /* eslint-disable eqeqeq */
      op.selected = multi ? indexOf$1(value, val) > -1 : looseEqual(value, val);
      /* eslint-enable eqeqeq */
    }
  },

  unbind: function unbind() {
    /* istanbul ignore next */
    this.vm.$off('hook:attached', this.forceUpdate);
  }
};

/**
 * Get select value
 *
 * @param {SelectElement} el
 * @param {Boolean} multi
 * @param {Boolean} init
 * @return {Array|*}
 */

function getValue(el, multi, init) {
  var res = multi ? [] : null;
  var op, val, selected;
  for (var i = 0, l = el.options.length; i < l; i++) {
    op = el.options[i];
    selected = init ? op.hasAttribute('selected') : op.selected;
    if (selected) {
      val = op.hasOwnProperty('_value') ? op._value : op.value;
      if (multi) {
        res.push(val);
      } else {
        return val;
      }
    }
  }
  return res;
}

/**
 * Native Array.indexOf uses strict equal, but in this
 * case we need to match string/numbers with custom equal.
 *
 * @param {Array} arr
 * @param {*} val
 */

function indexOf$1(arr, val) {
  var i = arr.length;
  while (i--) {
    if (looseEqual(arr[i], val)) {
      return i;
    }
  }
  return -1;
}

var checkbox = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    this.getValue = function () {
      return el.hasOwnProperty('_value') ? el._value : self.params.number ? toNumber(el.value) : el.value;
    };

    function getBooleanValue() {
      var val = el.checked;
      if (val && el.hasOwnProperty('_trueValue')) {
        return el._trueValue;
      }
      if (!val && el.hasOwnProperty('_falseValue')) {
        return el._falseValue;
      }
      return val;
    }

    this.listener = function () {
      var model = self._watcher.value;
      if (isArray(model)) {
        var val = self.getValue();
        if (el.checked) {
          if (indexOf(model, val) < 0) {
            model.push(val);
          }
        } else {
          model.$remove(val);
        }
      } else {
        self.set(getBooleanValue());
      }
    };

    this.on('change', this.listener);
    if (el.hasAttribute('checked')) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    var el = this.el;
    if (isArray(value)) {
      el.checked = indexOf(value, this.getValue()) > -1;
    } else {
      if (el.hasOwnProperty('_trueValue')) {
        el.checked = looseEqual(value, el._trueValue);
      } else {
        el.checked = !!value;
      }
    }
  }
};

var handlers = {
  text: text$2,
  radio: radio,
  select: select,
  checkbox: checkbox
};

var model = {

  priority: MODEL,
  twoWay: true,
  handlers: handlers,
  params: ['lazy', 'number', 'debounce'],

  /**
   * Possible elements:
   *   <select>
   *   <textarea>
   *   <input type="*">
   *     - text
   *     - checkbox
   *     - radio
   *     - number
   */

  bind: function bind() {
    // friendly warning...
    this.checkFilters();
    if (this.hasRead && !this.hasWrite) {
      process.env.NODE_ENV !== 'production' && warn('It seems you are using a read-only filter with ' + 'v-model="' + this.descriptor.raw + '". ' + 'You might want to use a two-way filter to ensure correct behavior.', this.vm);
    }
    var el = this.el;
    var tag = el.tagName;
    var handler;
    if (tag === 'INPUT') {
      handler = handlers[el.type] || handlers.text;
    } else if (tag === 'SELECT') {
      handler = handlers.select;
    } else if (tag === 'TEXTAREA') {
      handler = handlers.text;
    } else {
      process.env.NODE_ENV !== 'production' && warn('v-model does not support element type: ' + tag, this.vm);
      return;
    }
    el.__v_model = this;
    handler.bind.call(this);
    this.update = handler.update;
    this._unbind = handler.unbind;
  },

  /**
   * Check read/write filter stats.
   */

  checkFilters: function checkFilters() {
    var filters = this.filters;
    if (!filters) return;
    var i = filters.length;
    while (i--) {
      var filter = resolveAsset(this.vm.$options, 'filters', filters[i].name);
      if (typeof filter === 'function' || filter.read) {
        this.hasRead = true;
      }
      if (filter.write) {
        this.hasWrite = true;
      }
    }
  },

  unbind: function unbind() {
    this.el.__v_model = null;
    this._unbind && this._unbind();
  }
};

// keyCode aliases
var keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  'delete': [8, 46],
  up: 38,
  left: 37,
  right: 39,
  down: 40
};

function keyFilter(handler, keys) {
  var codes = keys.map(function (key) {
    var charCode = key.charCodeAt(0);
    if (charCode > 47 && charCode < 58) {
      return parseInt(key, 10);
    }
    if (key.length === 1) {
      charCode = key.toUpperCase().charCodeAt(0);
      if (charCode > 64 && charCode < 91) {
        return charCode;
      }
    }
    return keyCodes[key];
  });
  codes = [].concat.apply([], codes);
  return function keyHandler(e) {
    if (codes.indexOf(e.keyCode) > -1) {
      return handler.call(this, e);
    }
  };
}

function stopFilter(handler) {
  return function stopHandler(e) {
    e.stopPropagation();
    return handler.call(this, e);
  };
}

function preventFilter(handler) {
  return function preventHandler(e) {
    e.preventDefault();
    return handler.call(this, e);
  };
}

function selfFilter(handler) {
  return function selfHandler(e) {
    if (e.target === e.currentTarget) {
      return handler.call(this, e);
    }
  };
}

var on$1 = {

  priority: ON,
  acceptStatement: true,
  keyCodes: keyCodes,

  bind: function bind() {
    // deal with iframes
    if (this.el.tagName === 'IFRAME' && this.arg !== 'load') {
      var self = this;
      this.iframeBind = function () {
        on(self.el.contentWindow, self.arg, self.handler, self.modifiers.capture);
      };
      this.on('load', this.iframeBind);
    }
  },

  update: function update(handler) {
    // stub a noop for v-on with no value,
    // e.g. @mousedown.prevent
    if (!this.descriptor.raw) {
      handler = function () {};
    }

    if (typeof handler !== 'function') {
      process.env.NODE_ENV !== 'production' && warn('v-on:' + this.arg + '="' + this.expression + '" expects a function value, ' + 'got ' + handler, this.vm);
      return;
    }

    // apply modifiers
    if (this.modifiers.stop) {
      handler = stopFilter(handler);
    }
    if (this.modifiers.prevent) {
      handler = preventFilter(handler);
    }
    if (this.modifiers.self) {
      handler = selfFilter(handler);
    }
    // key filter
    var keys = Object.keys(this.modifiers).filter(function (key) {
      return key !== 'stop' && key !== 'prevent' && key !== 'self' && key !== 'capture';
    });
    if (keys.length) {
      handler = keyFilter(handler, keys);
    }

    this.reset();
    this.handler = handler;

    if (this.iframeBind) {
      this.iframeBind();
    } else {
      on(this.el, this.arg, this.handler, this.modifiers.capture);
    }
  },

  reset: function reset() {
    var el = this.iframeBind ? this.el.contentWindow : this.el;
    if (this.handler) {
      off(el, this.arg, this.handler);
    }
  },

  unbind: function unbind() {
    this.reset();
  }
};

var prefixes = ['-webkit-', '-moz-', '-ms-'];
var camelPrefixes = ['Webkit', 'Moz', 'ms'];
var importantRE = /!important;?$/;
var propCache = Object.create(null);

var testEl = null;

var style = {

  deep: true,

  update: function update(value) {
    if (typeof value === 'string') {
      this.el.style.cssText = value;
    } else if (isArray(value)) {
      this.handleObject(value.reduce(extend, {}));
    } else {
      this.handleObject(value || {});
    }
  },

  handleObject: function handleObject(value) {
    // cache object styles so that only changed props
    // are actually updated.
    var cache = this.cache || (this.cache = {});
    var name, val;
    for (name in cache) {
      if (!(name in value)) {
        this.handleSingle(name, null);
        delete cache[name];
      }
    }
    for (name in value) {
      val = value[name];
      if (val !== cache[name]) {
        cache[name] = val;
        this.handleSingle(name, val);
      }
    }
  },

  handleSingle: function handleSingle(prop, value) {
    prop = normalize(prop);
    if (!prop) return; // unsupported prop
    // cast possible numbers/booleans into strings
    if (value != null) value += '';
    if (value) {
      var isImportant = importantRE.test(value) ? 'important' : '';
      if (isImportant) {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          warn('It\'s probably a bad idea to use !important with inline rules. ' + 'This feature will be deprecated in a future version of Vue.');
        }
        value = value.replace(importantRE, '').trim();
        this.el.style.setProperty(prop.kebab, value, isImportant);
      } else {
        this.el.style[prop.camel] = value;
      }
    } else {
      this.el.style[prop.camel] = '';
    }
  }

};

/**
 * Normalize a CSS property name.
 * - cache result
 * - auto prefix
 * - camelCase -> dash-case
 *
 * @param {String} prop
 * @return {String}
 */

function normalize(prop) {
  if (propCache[prop]) {
    return propCache[prop];
  }
  var res = prefix(prop);
  propCache[prop] = propCache[res] = res;
  return res;
}

/**
 * Auto detect the appropriate prefix for a CSS property.
 * https://gist.github.com/paulirish/523692
 *
 * @param {String} prop
 * @return {String}
 */

function prefix(prop) {
  prop = hyphenate(prop);
  var camel = camelize(prop);
  var upper = camel.charAt(0).toUpperCase() + camel.slice(1);
  if (!testEl) {
    testEl = document.createElement('div');
  }
  var i = prefixes.length;
  var prefixed;
  if (camel !== 'filter' && camel in testEl.style) {
    return {
      kebab: prop,
      camel: camel
    };
  }
  while (i--) {
    prefixed = camelPrefixes[i] + upper;
    if (prefixed in testEl.style) {
      return {
        kebab: prefixes[i] + prop,
        camel: prefixed
      };
    }
  }
}

// xlink
var xlinkNS = 'http://www.w3.org/1999/xlink';
var xlinkRE = /^xlink:/;

// check for attributes that prohibit interpolations
var disallowedInterpAttrRE = /^v-|^:|^@|^(?:is|transition|transition-mode|debounce|track-by|stagger|enter-stagger|leave-stagger)$/;
// these attributes should also set their corresponding properties
// because they only affect the initial state of the element
var attrWithPropsRE = /^(?:value|checked|selected|muted)$/;
// these attributes expect enumrated values of "true" or "false"
// but are not boolean attributes
var enumeratedAttrRE = /^(?:draggable|contenteditable|spellcheck)$/;

// these attributes should set a hidden property for
// binding v-model to object values
var modelProps = {
  value: '_value',
  'true-value': '_trueValue',
  'false-value': '_falseValue'
};

var bind$1 = {

  priority: BIND,

  bind: function bind() {
    var attr = this.arg;
    var tag = this.el.tagName;
    // should be deep watch on object mode
    if (!attr) {
      this.deep = true;
    }
    // handle interpolation bindings
    var descriptor = this.descriptor;
    var tokens = descriptor.interp;
    if (tokens) {
      // handle interpolations with one-time tokens
      if (descriptor.hasOneTime) {
        this.expression = tokensToExp(tokens, this._scope || this.vm);
      }

      // only allow binding on native attributes
      if (disallowedInterpAttrRE.test(attr) || attr === 'name' && (tag === 'PARTIAL' || tag === 'SLOT')) {
        process.env.NODE_ENV !== 'production' && warn(attr + '="' + descriptor.raw + '": ' + 'attribute interpolation is not allowed in Vue.js ' + 'directives and special attributes.', this.vm);
        this.el.removeAttribute(attr);
        this.invalid = true;
      }

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production') {
        var raw = attr + '="' + descriptor.raw + '": ';
        // warn src
        if (attr === 'src') {
          warn(raw + 'interpolation in "src" attribute will cause ' + 'a 404 request. Use v-bind:src instead.', this.vm);
        }

        // warn style
        if (attr === 'style') {
          warn(raw + 'interpolation in "style" attribute will cause ' + 'the attribute to be discarded in Internet Explorer. ' + 'Use v-bind:style instead.', this.vm);
        }
      }
    }
  },

  update: function update(value) {
    if (this.invalid) {
      return;
    }
    var attr = this.arg;
    if (this.arg) {
      this.handleSingle(attr, value);
    } else {
      this.handleObject(value || {});
    }
  },

  // share object handler with v-bind:class
  handleObject: style.handleObject,

  handleSingle: function handleSingle(attr, value) {
    var el = this.el;
    var interp = this.descriptor.interp;
    if (this.modifiers.camel) {
      attr = camelize(attr);
    }
    if (!interp && attrWithPropsRE.test(attr) && attr in el) {
      var attrValue = attr === 'value' ? value == null // IE9 will set input.value to "null" for null...
      ? '' : value : value;

      if (el[attr] !== attrValue) {
        el[attr] = attrValue;
      }
    }
    // set model props
    var modelProp = modelProps[attr];
    if (!interp && modelProp) {
      el[modelProp] = value;
      // update v-model if present
      var model = el.__v_model;
      if (model) {
        model.listener();
      }
    }
    // do not set value attribute for textarea
    if (attr === 'value' && el.tagName === 'TEXTAREA') {
      el.removeAttribute(attr);
      return;
    }
    // update attribute
    if (enumeratedAttrRE.test(attr)) {
      el.setAttribute(attr, value ? 'true' : 'false');
    } else if (value != null && value !== false) {
      if (attr === 'class') {
        // handle edge case #1960:
        // class interpolation should not overwrite Vue transition class
        if (el.__v_trans) {
          value += ' ' + el.__v_trans.id + '-transition';
        }
        setClass(el, value);
      } else if (xlinkRE.test(attr)) {
        el.setAttributeNS(xlinkNS, attr, value === true ? '' : value);
      } else {
        el.setAttribute(attr, value === true ? '' : value);
      }
    } else {
      el.removeAttribute(attr);
    }
  }
};

var el = {

  priority: EL,

  bind: function bind() {
    /* istanbul ignore if */
    if (!this.arg) {
      return;
    }
    var id = this.id = camelize(this.arg);
    var refs = (this._scope || this.vm).$els;
    if (hasOwn(refs, id)) {
      refs[id] = this.el;
    } else {
      defineReactive(refs, id, this.el);
    }
  },

  unbind: function unbind() {
    var refs = (this._scope || this.vm).$els;
    if (refs[this.id] === this.el) {
      refs[this.id] = null;
    }
  }
};

var ref = {
  bind: function bind() {
    process.env.NODE_ENV !== 'production' && warn('v-ref:' + this.arg + ' must be used on a child ' + 'component. Found on <' + this.el.tagName.toLowerCase() + '>.', this.vm);
  }
};

var cloak = {
  bind: function bind() {
    var el = this.el;
    this.vm.$once('pre-hook:compiled', function () {
      el.removeAttribute('v-cloak');
    });
  }
};

// must export plain object
var directives = {
  text: text$1,
  html: html,
  'for': vFor,
  'if': vIf,
  show: show,
  model: model,
  on: on$1,
  bind: bind$1,
  el: el,
  ref: ref,
  cloak: cloak
};

var vClass = {

  deep: true,

  update: function update(value) {
    if (!value) {
      this.cleanup();
    } else if (typeof value === 'string') {
      this.setClass(value.trim().split(/\s+/));
    } else {
      this.setClass(normalize$1(value));
    }
  },

  setClass: function setClass(value) {
    this.cleanup(value);
    for (var i = 0, l = value.length; i < l; i++) {
      var val = value[i];
      if (val) {
        apply(this.el, val, addClass);
      }
    }
    this.prevKeys = value;
  },

  cleanup: function cleanup(value) {
    var prevKeys = this.prevKeys;
    if (!prevKeys) return;
    var i = prevKeys.length;
    while (i--) {
      var key = prevKeys[i];
      if (!value || value.indexOf(key) < 0) {
        apply(this.el, key, removeClass);
      }
    }
  }
};

/**
 * Normalize objects and arrays (potentially containing objects)
 * into array of strings.
 *
 * @param {Object|Array<String|Object>} value
 * @return {Array<String>}
 */

function normalize$1(value) {
  var res = [];
  if (isArray(value)) {
    for (var i = 0, l = value.length; i < l; i++) {
      var _key = value[i];
      if (_key) {
        if (typeof _key === 'string') {
          res.push(_key);
        } else {
          for (var k in _key) {
            if (_key[k]) res.push(k);
          }
        }
      }
    }
  } else if (isObject(value)) {
    for (var key in value) {
      if (value[key]) res.push(key);
    }
  }
  return res;
}

/**
 * Add or remove a class/classes on an element
 *
 * @param {Element} el
 * @param {String} key The class name. This may or may not
 *                     contain a space character, in such a
 *                     case we'll deal with multiple class
 *                     names at once.
 * @param {Function} fn
 */

function apply(el, key, fn) {
  key = key.trim();
  if (key.indexOf(' ') === -1) {
    fn(el, key);
    return;
  }
  // The key contains one or more space characters.
  // Since a class name doesn't accept such characters, we
  // treat it as multiple classes.
  var keys = key.split(/\s+/);
  for (var i = 0, l = keys.length; i < l; i++) {
    fn(el, keys[i]);
  }
}

var component = {

  priority: COMPONENT,

  params: ['keep-alive', 'transition-mode', 'inline-template'],

  /**
   * Setup. Two possible usages:
   *
   * - static:
   *   <comp> or <div v-component="comp">
   *
   * - dynamic:
   *   <component :is="view">
   */

  bind: function bind() {
    if (!this.el.__vue__) {
      // keep-alive cache
      this.keepAlive = this.params.keepAlive;
      if (this.keepAlive) {
        this.cache = {};
      }
      // check inline-template
      if (this.params.inlineTemplate) {
        // extract inline template as a DocumentFragment
        this.inlineTemplate = extractContent(this.el, true);
      }
      // component resolution related state
      this.pendingComponentCb = this.Component = null;
      // transition related state
      this.pendingRemovals = 0;
      this.pendingRemovalCb = null;
      // create a ref anchor
      this.anchor = createAnchor('v-component');
      replace(this.el, this.anchor);
      // remove is attribute.
      // this is removed during compilation, but because compilation is
      // cached, when the component is used elsewhere this attribute
      // will remain at link time.
      this.el.removeAttribute('is');
      this.el.removeAttribute(':is');
      // remove ref, same as above
      if (this.descriptor.ref) {
        this.el.removeAttribute('v-ref:' + hyphenate(this.descriptor.ref));
      }
      // if static, build right now.
      if (this.literal) {
        this.setComponent(this.expression);
      }
    } else {
      process.env.NODE_ENV !== 'production' && warn('cannot mount component "' + this.expression + '" ' + 'on already mounted element: ' + this.el);
    }
  },

  /**
   * Public update, called by the watcher in the dynamic
   * literal scenario, e.g. <component :is="view">
   */

  update: function update(value) {
    if (!this.literal) {
      this.setComponent(value);
    }
  },

  /**
   * Switch dynamic components. May resolve the component
   * asynchronously, and perform transition based on
   * specified transition mode. Accepts a few additional
   * arguments specifically for vue-router.
   *
   * The callback is called when the full transition is
   * finished.
   *
   * @param {String} value
   * @param {Function} [cb]
   */

  setComponent: function setComponent(value, cb) {
    this.invalidatePending();
    if (!value) {
      // just remove current
      this.unbuild(true);
      this.remove(this.childVM, cb);
      this.childVM = null;
    } else {
      var self = this;
      this.resolveComponent(value, function () {
        self.mountComponent(cb);
      });
    }
  },

  /**
   * Resolve the component constructor to use when creating
   * the child vm.
   *
   * @param {String|Function} value
   * @param {Function} cb
   */

  resolveComponent: function resolveComponent(value, cb) {
    var self = this;
    this.pendingComponentCb = cancellable(function (Component) {
      self.ComponentName = Component.options.name || (typeof value === 'string' ? value : null);
      self.Component = Component;
      cb();
    });
    this.vm._resolveComponent(value, this.pendingComponentCb);
  },

  /**
   * Create a new instance using the current constructor and
   * replace the existing instance. This method doesn't care
   * whether the new component and the old one are actually
   * the same.
   *
   * @param {Function} [cb]
   */

  mountComponent: function mountComponent(cb) {
    // actual mount
    this.unbuild(true);
    var self = this;
    var activateHooks = this.Component.options.activate;
    var cached = this.getCached();
    var newComponent = this.build();
    if (activateHooks && !cached) {
      this.waitingFor = newComponent;
      callActivateHooks(activateHooks, newComponent, function () {
        if (self.waitingFor !== newComponent) {
          return;
        }
        self.waitingFor = null;
        self.transition(newComponent, cb);
      });
    } else {
      // update ref for kept-alive component
      if (cached) {
        newComponent._updateRef();
      }
      this.transition(newComponent, cb);
    }
  },

  /**
   * When the component changes or unbinds before an async
   * constructor is resolved, we need to invalidate its
   * pending callback.
   */

  invalidatePending: function invalidatePending() {
    if (this.pendingComponentCb) {
      this.pendingComponentCb.cancel();
      this.pendingComponentCb = null;
    }
  },

  /**
   * Instantiate/insert a new child vm.
   * If keep alive and has cached instance, insert that
   * instance; otherwise build a new one and cache it.
   *
   * @param {Object} [extraOptions]
   * @return {Vue} - the created instance
   */

  build: function build(extraOptions) {
    var cached = this.getCached();
    if (cached) {
      return cached;
    }
    if (this.Component) {
      // default options
      var options = {
        name: this.ComponentName,
        el: cloneNode(this.el),
        template: this.inlineTemplate,
        // make sure to add the child with correct parent
        // if this is a transcluded component, its parent
        // should be the transclusion host.
        parent: this._host || this.vm,
        // if no inline-template, then the compiled
        // linker can be cached for better performance.
        _linkerCachable: !this.inlineTemplate,
        _ref: this.descriptor.ref,
        _asComponent: true,
        _isRouterView: this._isRouterView,
        // if this is a transcluded component, context
        // will be the common parent vm of this instance
        // and its host.
        _context: this.vm,
        // if this is inside an inline v-for, the scope
        // will be the intermediate scope created for this
        // repeat fragment. this is used for linking props
        // and container directives.
        _scope: this._scope,
        // pass in the owner fragment of this component.
        // this is necessary so that the fragment can keep
        // track of its contained components in order to
        // call attach/detach hooks for them.
        _frag: this._frag
      };
      // extra options
      // in 1.0.0 this is used by vue-router only
      /* istanbul ignore if */
      if (extraOptions) {
        extend(options, extraOptions);
      }
      var child = new this.Component(options);
      if (this.keepAlive) {
        this.cache[this.Component.cid] = child;
      }
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && this.el.hasAttribute('transition') && child._isFragment) {
        warn('Transitions will not work on a fragment instance. ' + 'Template: ' + child.$options.template, child);
      }
      return child;
    }
  },

  /**
   * Try to get a cached instance of the current component.
   *
   * @return {Vue|undefined}
   */

  getCached: function getCached() {
    return this.keepAlive && this.cache[this.Component.cid];
  },

  /**
   * Teardown the current child, but defers cleanup so
   * that we can separate the destroy and removal steps.
   *
   * @param {Boolean} defer
   */

  unbuild: function unbuild(defer) {
    if (this.waitingFor) {
      if (!this.keepAlive) {
        this.waitingFor.$destroy();
      }
      this.waitingFor = null;
    }
    var child = this.childVM;
    if (!child || this.keepAlive) {
      if (child) {
        // remove ref
        child._inactive = true;
        child._updateRef(true);
      }
      return;
    }
    // the sole purpose of `deferCleanup` is so that we can
    // "deactivate" the vm right now and perform DOM removal
    // later.
    child.$destroy(false, defer);
  },

  /**
   * Remove current destroyed child and manually do
   * the cleanup after removal.
   *
   * @param {Function} cb
   */

  remove: function remove(child, cb) {
    var keepAlive = this.keepAlive;
    if (child) {
      // we may have a component switch when a previous
      // component is still being transitioned out.
      // we want to trigger only one lastest insertion cb
      // when the existing transition finishes. (#1119)
      this.pendingRemovals++;
      this.pendingRemovalCb = cb;
      var self = this;
      child.$remove(function () {
        self.pendingRemovals--;
        if (!keepAlive) child._cleanup();
        if (!self.pendingRemovals && self.pendingRemovalCb) {
          self.pendingRemovalCb();
          self.pendingRemovalCb = null;
        }
      });
    } else if (cb) {
      cb();
    }
  },

  /**
   * Actually swap the components, depending on the
   * transition mode. Defaults to simultaneous.
   *
   * @param {Vue} target
   * @param {Function} [cb]
   */

  transition: function transition(target, cb) {
    var self = this;
    var current = this.childVM;
    // for devtool inspection
    if (current) current._inactive = true;
    target._inactive = false;
    this.childVM = target;
    switch (self.params.transitionMode) {
      case 'in-out':
        target.$before(self.anchor, function () {
          self.remove(current, cb);
        });
        break;
      case 'out-in':
        self.remove(current, function () {
          target.$before(self.anchor, cb);
        });
        break;
      default:
        self.remove(current);
        target.$before(self.anchor, cb);
    }
  },

  /**
   * Unbind.
   */

  unbind: function unbind() {
    this.invalidatePending();
    // Do not defer cleanup when unbinding
    this.unbuild();
    // destroy all keep-alive cached instances
    if (this.cache) {
      for (var key in this.cache) {
        this.cache[key].$destroy();
      }
      this.cache = null;
    }
  }
};

/**
 * Call activate hooks in order (asynchronous)
 *
 * @param {Array} hooks
 * @param {Vue} vm
 * @param {Function} cb
 */

function callActivateHooks(hooks, vm, cb) {
  var total = hooks.length;
  var called = 0;
  hooks[0].call(vm, next);
  function next() {
    if (++called >= total) {
      cb();
    } else {
      hooks[called].call(vm, next);
    }
  }
}

var propBindingModes = config._propBindingModes;
var empty = {};

// regexes
var identRE$1 = /^[$_a-zA-Z]+[\w$]*$/;
var settablePathRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[[^\[\]]+\])*$/;

/**
 * Compile props on a root element and return
 * a props link function.
 *
 * @param {Element|DocumentFragment} el
 * @param {Array} propOptions
 * @param {Vue} vm
 * @return {Function} propsLinkFn
 */

function compileProps(el, propOptions, vm) {
  var props = [];
  var names = Object.keys(propOptions);
  var i = names.length;
  var options, name, attr, value, path, parsed, prop;
  while (i--) {
    name = names[i];
    options = propOptions[name] || empty;

    if (process.env.NODE_ENV !== 'production' && name === '$data') {
      warn('Do not use $data as prop.', vm);
      continue;
    }

    // props could contain dashes, which will be
    // interpreted as minus calculations by the parser
    // so we need to camelize the path here
    path = camelize(name);
    if (!identRE$1.test(path)) {
      process.env.NODE_ENV !== 'production' && warn('Invalid prop key: "' + name + '". Prop keys ' + 'must be valid identifiers.', vm);
      continue;
    }

    prop = {
      name: name,
      path: path,
      options: options,
      mode: propBindingModes.ONE_WAY,
      raw: null
    };

    attr = hyphenate(name);
    // first check dynamic version
    if ((value = getBindAttr(el, attr)) === null) {
      if ((value = getBindAttr(el, attr + '.sync')) !== null) {
        prop.mode = propBindingModes.TWO_WAY;
      } else if ((value = getBindAttr(el, attr + '.once')) !== null) {
        prop.mode = propBindingModes.ONE_TIME;
      }
    }
    if (value !== null) {
      // has dynamic binding!
      prop.raw = value;
      parsed = parseDirective(value);
      value = parsed.expression;
      prop.filters = parsed.filters;
      // check binding type
      if (isLiteral(value) && !parsed.filters) {
        // for expressions containing literal numbers and
        // booleans, there's no need to setup a prop binding,
        // so we can optimize them as a one-time set.
        prop.optimizedLiteral = true;
      } else {
        prop.dynamic = true;
        // check non-settable path for two-way bindings
        if (process.env.NODE_ENV !== 'production' && prop.mode === propBindingModes.TWO_WAY && !settablePathRE.test(value)) {
          prop.mode = propBindingModes.ONE_WAY;
          warn('Cannot bind two-way prop with non-settable ' + 'parent path: ' + value, vm);
        }
      }
      prop.parentPath = value;

      // warn required two-way
      if (process.env.NODE_ENV !== 'production' && options.twoWay && prop.mode !== propBindingModes.TWO_WAY) {
        warn('Prop "' + name + '" expects a two-way binding type.', vm);
      }
    } else if ((value = getAttr(el, attr)) !== null) {
      // has literal binding!
      prop.raw = value;
    } else if (process.env.NODE_ENV !== 'production') {
      // check possible camelCase prop usage
      var lowerCaseName = path.toLowerCase();
      value = /[A-Z\-]/.test(name) && (el.getAttribute(lowerCaseName) || el.getAttribute(':' + lowerCaseName) || el.getAttribute('v-bind:' + lowerCaseName) || el.getAttribute(':' + lowerCaseName + '.once') || el.getAttribute('v-bind:' + lowerCaseName + '.once') || el.getAttribute(':' + lowerCaseName + '.sync') || el.getAttribute('v-bind:' + lowerCaseName + '.sync'));
      if (value) {
        warn('Possible usage error for prop `' + lowerCaseName + '` - ' + 'did you mean `' + attr + '`? HTML is case-insensitive, remember to use ' + 'kebab-case for props in templates.', vm);
      } else if (options.required) {
        // warn missing required
        warn('Missing required prop: ' + name, vm);
      }
    }
    // push prop
    props.push(prop);
  }
  return makePropsLinkFn(props);
}

/**
 * Build a function that applies props to a vm.
 *
 * @param {Array} props
 * @return {Function} propsLinkFn
 */

function makePropsLinkFn(props) {
  return function propsLinkFn(vm, scope) {
    // store resolved props info
    vm._props = {};
    var inlineProps = vm.$options.propsData;
    var i = props.length;
    var prop, path, options, value, raw;
    while (i--) {
      prop = props[i];
      raw = prop.raw;
      path = prop.path;
      options = prop.options;
      vm._props[path] = prop;
      if (inlineProps && hasOwn(inlineProps, path)) {
        initProp(vm, prop, inlineProps[path]);
      }if (raw === null) {
        // initialize absent prop
        initProp(vm, prop, undefined);
      } else if (prop.dynamic) {
        // dynamic prop
        if (prop.mode === propBindingModes.ONE_TIME) {
          // one time binding
          value = (scope || vm._context || vm).$get(prop.parentPath);
          initProp(vm, prop, value);
        } else {
          if (vm._context) {
            // dynamic binding
            vm._bindDir({
              name: 'prop',
              def: propDef,
              prop: prop
            }, null, null, scope); // el, host, scope
          } else {
              // root instance
              initProp(vm, prop, vm.$get(prop.parentPath));
            }
        }
      } else if (prop.optimizedLiteral) {
        // optimized literal, cast it and just set once
        var stripped = stripQuotes(raw);
        value = stripped === raw ? toBoolean(toNumber(raw)) : stripped;
        initProp(vm, prop, value);
      } else {
        // string literal, but we need to cater for
        // Boolean props with no value, or with same
        // literal value (e.g. disabled="disabled")
        // see https://github.com/vuejs/vue-loader/issues/182
        value = options.type === Boolean && (raw === '' || raw === hyphenate(prop.name)) ? true : raw;
        initProp(vm, prop, value);
      }
    }
  };
}

/**
 * Process a prop with a rawValue, applying necessary coersions,
 * default values & assertions and call the given callback with
 * processed value.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} rawValue
 * @param {Function} fn
 */

function processPropValue(vm, prop, rawValue, fn) {
  var isSimple = prop.dynamic && isSimplePath(prop.parentPath);
  var value = rawValue;
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop);
  }
  value = coerceProp(prop, value);
  var coerced = value !== rawValue;
  if (!assertProp(prop, value, vm)) {
    value = undefined;
  }
  if (isSimple && !coerced) {
    withoutConversion(function () {
      fn(value);
    });
  } else {
    fn(value);
  }
}

/**
 * Set a prop's initial value on a vm and its data object.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} value
 */

function initProp(vm, prop, value) {
  processPropValue(vm, prop, value, function (value) {
    defineReactive(vm, prop.path, value);
  });
}

/**
 * Update a prop's value on a vm.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} value
 */

function updateProp(vm, prop, value) {
  processPropValue(vm, prop, value, function (value) {
    vm[prop.path] = value;
  });
}

/**
 * Get the default value of a prop.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @return {*}
 */

function getPropDefaultValue(vm, prop) {
  // no default, return undefined
  var options = prop.options;
  if (!hasOwn(options, 'default')) {
    // absent boolean value defaults to false
    return options.type === Boolean ? false : undefined;
  }
  var def = options['default'];
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    process.env.NODE_ENV !== 'production' && warn('Invalid default value for prop "' + prop.name + '": ' + 'Props with type Object/Array must use a factory function ' + 'to return the default value.', vm);
  }
  // call factory function for non-Function types
  return typeof def === 'function' && options.type !== Function ? def.call(vm) : def;
}

/**
 * Assert whether a prop is valid.
 *
 * @param {Object} prop
 * @param {*} value
 * @param {Vue} vm
 */

function assertProp(prop, value, vm) {
  if (!prop.options.required && ( // non-required
  prop.raw === null || // abscent
  value == null) // null or undefined
  ) {
      return true;
    }
  var options = prop.options;
  var type = options.type;
  var valid = !type;
  var expectedTypes = [];
  if (type) {
    if (!isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType);
      valid = assertedType.valid;
    }
  }
  if (!valid) {
    if (process.env.NODE_ENV !== 'production') {
      warn('Invalid prop: type check failed for prop "' + prop.name + '".' + ' Expected ' + expectedTypes.map(formatType).join(', ') + ', got ' + formatValue(value) + '.', vm);
    }
    return false;
  }
  var validator = options.validator;
  if (validator) {
    if (!validator(value)) {
      process.env.NODE_ENV !== 'production' && warn('Invalid prop: custom validator check failed for prop "' + prop.name + '".', vm);
      return false;
    }
  }
  return true;
}

/**
 * Force parsing value with coerce option.
 *
 * @param {*} value
 * @param {Object} options
 * @return {*}
 */

function coerceProp(prop, value) {
  var coerce = prop.options.coerce;
  if (!coerce) {
    return value;
  }
  // coerce is a function
  return coerce(value);
}

/**
 * Assert the type of a value
 *
 * @param {*} value
 * @param {Function} type
 * @return {Object}
 */

function assertType(value, type) {
  var valid;
  var expectedType;
  if (type === String) {
    expectedType = 'string';
    valid = typeof value === expectedType;
  } else if (type === Number) {
    expectedType = 'number';
    valid = typeof value === expectedType;
  } else if (type === Boolean) {
    expectedType = 'boolean';
    valid = typeof value === expectedType;
  } else if (type === Function) {
    expectedType = 'function';
    valid = typeof value === expectedType;
  } else if (type === Object) {
    expectedType = 'object';
    valid = isPlainObject(value);
  } else if (type === Array) {
    expectedType = 'array';
    valid = isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid: valid,
    expectedType: expectedType
  };
}

/**
 * Format type for output
 *
 * @param {String} type
 * @return {String}
 */

function formatType(type) {
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'custom type';
}

/**
 * Format value
 *
 * @param {*} value
 * @return {String}
 */

function formatValue(val) {
  return Object.prototype.toString.call(val).slice(8, -1);
}

var bindingModes = config._propBindingModes;

var propDef = {

  bind: function bind() {
    var child = this.vm;
    var parent = child._context;
    // passed in from compiler directly
    var prop = this.descriptor.prop;
    var childKey = prop.path;
    var parentKey = prop.parentPath;
    var twoWay = prop.mode === bindingModes.TWO_WAY;

    var parentWatcher = this.parentWatcher = new Watcher(parent, parentKey, function (val) {
      updateProp(child, prop, val);
    }, {
      twoWay: twoWay,
      filters: prop.filters,
      // important: props need to be observed on the
      // v-for scope if present
      scope: this._scope
    });

    // set the child initial value.
    initProp(child, prop, parentWatcher.value);

    // setup two-way binding
    if (twoWay) {
      // important: defer the child watcher creation until
      // the created hook (after data observation)
      var self = this;
      child.$once('pre-hook:created', function () {
        self.childWatcher = new Watcher(child, childKey, function (val) {
          parentWatcher.set(val);
        }, {
          // ensure sync upward before parent sync down.
          // this is necessary in cases e.g. the child
          // mutates a prop array, then replaces it. (#1683)
          sync: true
        });
      });
    }
  },

  unbind: function unbind() {
    this.parentWatcher.teardown();
    if (this.childWatcher) {
      this.childWatcher.teardown();
    }
  }
};

var queue$1 = [];
var queued = false;

/**
 * Push a job into the queue.
 *
 * @param {Function} job
 */

function pushJob(job) {
  queue$1.push(job);
  if (!queued) {
    queued = true;
    nextTick(flush);
  }
}

/**
 * Flush the queue, and do one forced reflow before
 * triggering transitions.
 */

function flush() {
  // Force layout
  var f = document.documentElement.offsetHeight;
  for (var i = 0; i < queue$1.length; i++) {
    queue$1[i]();
  }
  queue$1 = [];
  queued = false;
  // dummy return, so js linters don't complain about
  // unused variable f
  return f;
}

var TYPE_TRANSITION = 'transition';
var TYPE_ANIMATION = 'animation';
var transDurationProp = transitionProp + 'Duration';
var animDurationProp = animationProp + 'Duration';

/**
 * If a just-entered element is applied the
 * leave class while its enter transition hasn't started yet,
 * and the transitioned property has the same value for both
 * enter/leave, then the leave transition will be skipped and
 * the transitionend event never fires. This function ensures
 * its callback to be called after a transition has started
 * by waiting for double raf.
 *
 * It falls back to setTimeout on devices that support CSS
 * transitions but not raf (e.g. Android 4.2 browser) - since
 * these environments are usually slow, we are giving it a
 * relatively large timeout.
 */

var raf = inBrowser && window.requestAnimationFrame;
var waitForTransitionStart = raf
/* istanbul ignore next */
? function (fn) {
  raf(function () {
    raf(fn);
  });
} : function (fn) {
  setTimeout(fn, 50);
};

/**
 * A Transition object that encapsulates the state and logic
 * of the transition.
 *
 * @param {Element} el
 * @param {String} id
 * @param {Object} hooks
 * @param {Vue} vm
 */
function Transition(el, id, hooks, vm) {
  this.id = id;
  this.el = el;
  this.enterClass = hooks && hooks.enterClass || id + '-enter';
  this.leaveClass = hooks && hooks.leaveClass || id + '-leave';
  this.hooks = hooks;
  this.vm = vm;
  // async state
  this.pendingCssEvent = this.pendingCssCb = this.cancel = this.pendingJsCb = this.op = this.cb = null;
  this.justEntered = false;
  this.entered = this.left = false;
  this.typeCache = {};
  // check css transition type
  this.type = hooks && hooks.type;
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production') {
    if (this.type && this.type !== TYPE_TRANSITION && this.type !== TYPE_ANIMATION) {
      warn('invalid CSS transition type for transition="' + this.id + '": ' + this.type, vm);
    }
  }
  // bind
  var self = this;['enterNextTick', 'enterDone', 'leaveNextTick', 'leaveDone'].forEach(function (m) {
    self[m] = bind(self[m], self);
  });
}

var p$1 = Transition.prototype;

/**
 * Start an entering transition.
 *
 * 1. enter transition triggered
 * 2. call beforeEnter hook
 * 3. add enter class
 * 4. insert/show element
 * 5. call enter hook (with possible explicit js callback)
 * 6. reflow
 * 7. based on transition type:
 *    - transition:
 *        remove class now, wait for transitionend,
 *        then done if there's no explicit js callback.
 *    - animation:
 *        wait for animationend, remove class,
 *        then done if there's no explicit js callback.
 *    - no css transition:
 *        done now if there's no explicit js callback.
 * 8. wait for either done or js callback, then call
 *    afterEnter hook.
 *
 * @param {Function} op - insert/show the element
 * @param {Function} [cb]
 */

p$1.enter = function (op, cb) {
  this.cancelPending();
  this.callHook('beforeEnter');
  this.cb = cb;
  addClass(this.el, this.enterClass);
  op();
  this.entered = false;
  this.callHookWithCb('enter');
  if (this.entered) {
    return; // user called done synchronously.
  }
  this.cancel = this.hooks && this.hooks.enterCancelled;
  pushJob(this.enterNextTick);
};

/**
 * The "nextTick" phase of an entering transition, which is
 * to be pushed into a queue and executed after a reflow so
 * that removing the class can trigger a CSS transition.
 */

p$1.enterNextTick = function () {
  var _this = this;

  // prevent transition skipping
  this.justEntered = true;
  waitForTransitionStart(function () {
    _this.justEntered = false;
  });
  var enterDone = this.enterDone;
  var type = this.getCssTransitionType(this.enterClass);
  if (!this.pendingJsCb) {
    if (type === TYPE_TRANSITION) {
      // trigger transition by removing enter class now
      removeClass(this.el, this.enterClass);
      this.setupCssCb(transitionEndEvent, enterDone);
    } else if (type === TYPE_ANIMATION) {
      this.setupCssCb(animationEndEvent, enterDone);
    } else {
      enterDone();
    }
  } else if (type === TYPE_TRANSITION) {
    removeClass(this.el, this.enterClass);
  }
};

/**
 * The "cleanup" phase of an entering transition.
 */

p$1.enterDone = function () {
  this.entered = true;
  this.cancel = this.pendingJsCb = null;
  removeClass(this.el, this.enterClass);
  this.callHook('afterEnter');
  if (this.cb) this.cb();
};

/**
 * Start a leaving transition.
 *
 * 1. leave transition triggered.
 * 2. call beforeLeave hook
 * 3. add leave class (trigger css transition)
 * 4. call leave hook (with possible explicit js callback)
 * 5. reflow if no explicit js callback is provided
 * 6. based on transition type:
 *    - transition or animation:
 *        wait for end event, remove class, then done if
 *        there's no explicit js callback.
 *    - no css transition:
 *        done if there's no explicit js callback.
 * 7. wait for either done or js callback, then call
 *    afterLeave hook.
 *
 * @param {Function} op - remove/hide the element
 * @param {Function} [cb]
 */

p$1.leave = function (op, cb) {
  this.cancelPending();
  this.callHook('beforeLeave');
  this.op = op;
  this.cb = cb;
  addClass(this.el, this.leaveClass);
  this.left = false;
  this.callHookWithCb('leave');
  if (this.left) {
    return; // user called done synchronously.
  }
  this.cancel = this.hooks && this.hooks.leaveCancelled;
  // only need to handle leaveDone if
  // 1. the transition is already done (synchronously called
  //    by the user, which causes this.op set to null)
  // 2. there's no explicit js callback
  if (this.op && !this.pendingJsCb) {
    // if a CSS transition leaves immediately after enter,
    // the transitionend event never fires. therefore we
    // detect such cases and end the leave immediately.
    if (this.justEntered) {
      this.leaveDone();
    } else {
      pushJob(this.leaveNextTick);
    }
  }
};

/**
 * The "nextTick" phase of a leaving transition.
 */

p$1.leaveNextTick = function () {
  var type = this.getCssTransitionType(this.leaveClass);
  if (type) {
    var event = type === TYPE_TRANSITION ? transitionEndEvent : animationEndEvent;
    this.setupCssCb(event, this.leaveDone);
  } else {
    this.leaveDone();
  }
};

/**
 * The "cleanup" phase of a leaving transition.
 */

p$1.leaveDone = function () {
  this.left = true;
  this.cancel = this.pendingJsCb = null;
  this.op();
  removeClass(this.el, this.leaveClass);
  this.callHook('afterLeave');
  if (this.cb) this.cb();
  this.op = null;
};

/**
 * Cancel any pending callbacks from a previously running
 * but not finished transition.
 */

p$1.cancelPending = function () {
  this.op = this.cb = null;
  var hasPending = false;
  if (this.pendingCssCb) {
    hasPending = true;
    off(this.el, this.pendingCssEvent, this.pendingCssCb);
    this.pendingCssEvent = this.pendingCssCb = null;
  }
  if (this.pendingJsCb) {
    hasPending = true;
    this.pendingJsCb.cancel();
    this.pendingJsCb = null;
  }
  if (hasPending) {
    removeClass(this.el, this.enterClass);
    removeClass(this.el, this.leaveClass);
  }
  if (this.cancel) {
    this.cancel.call(this.vm, this.el);
    this.cancel = null;
  }
};

/**
 * Call a user-provided synchronous hook function.
 *
 * @param {String} type
 */

p$1.callHook = function (type) {
  if (this.hooks && this.hooks[type]) {
    this.hooks[type].call(this.vm, this.el);
  }
};

/**
 * Call a user-provided, potentially-async hook function.
 * We check for the length of arguments to see if the hook
 * expects a `done` callback. If true, the transition's end
 * will be determined by when the user calls that callback;
 * otherwise, the end is determined by the CSS transition or
 * animation.
 *
 * @param {String} type
 */

p$1.callHookWithCb = function (type) {
  var hook = this.hooks && this.hooks[type];
  if (hook) {
    if (hook.length > 1) {
      this.pendingJsCb = cancellable(this[type + 'Done']);
    }
    hook.call(this.vm, this.el, this.pendingJsCb);
  }
};

/**
 * Get an element's transition type based on the
 * calculated styles.
 *
 * @param {String} className
 * @return {Number}
 */

p$1.getCssTransitionType = function (className) {
  /* istanbul ignore if */
  if (!transitionEndEvent ||
  // skip CSS transitions if page is not visible -
  // this solves the issue of transitionend events not
  // firing until the page is visible again.
  // pageVisibility API is supported in IE10+, same as
  // CSS transitions.
  document.hidden ||
  // explicit js-only transition
  this.hooks && this.hooks.css === false ||
  // element is hidden
  isHidden(this.el)) {
    return;
  }
  var type = this.type || this.typeCache[className];
  if (type) return type;
  var inlineStyles = this.el.style;
  var computedStyles = window.getComputedStyle(this.el);
  var transDuration = inlineStyles[transDurationProp] || computedStyles[transDurationProp];
  if (transDuration && transDuration !== '0s') {
    type = TYPE_TRANSITION;
  } else {
    var animDuration = inlineStyles[animDurationProp] || computedStyles[animDurationProp];
    if (animDuration && animDuration !== '0s') {
      type = TYPE_ANIMATION;
    }
  }
  if (type) {
    this.typeCache[className] = type;
  }
  return type;
};

/**
 * Setup a CSS transitionend/animationend callback.
 *
 * @param {String} event
 * @param {Function} cb
 */

p$1.setupCssCb = function (event, cb) {
  this.pendingCssEvent = event;
  var self = this;
  var el = this.el;
  var onEnd = this.pendingCssCb = function (e) {
    if (e.target === el) {
      off(el, event, onEnd);
      self.pendingCssEvent = self.pendingCssCb = null;
      if (!self.pendingJsCb && cb) {
        cb();
      }
    }
  };
  on(el, event, onEnd);
};

/**
 * Check if an element is hidden - in that case we can just
 * skip the transition alltogether.
 *
 * @param {Element} el
 * @return {Boolean}
 */

function isHidden(el) {
  if (/svg$/.test(el.namespaceURI)) {
    // SVG elements do not have offset(Width|Height)
    // so we need to check the client rect
    var rect = el.getBoundingClientRect();
    return !(rect.width || rect.height);
  } else {
    return !(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }
}

var transition$1 = {

  priority: TRANSITION,

  update: function update(id, oldId) {
    var el = this.el;
    // resolve on owner vm
    var hooks = resolveAsset(this.vm.$options, 'transitions', id);
    id = id || 'v';
    el.__v_trans = new Transition(el, id, hooks, this.vm);
    if (oldId) {
      removeClass(el, oldId + '-transition');
    }
    addClass(el, id + '-transition');
  }
};

var internalDirectives = {
  style: style,
  'class': vClass,
  component: component,
  prop: propDef,
  transition: transition$1
};

// special binding prefixes
var bindRE = /^v-bind:|^:/;
var onRE = /^v-on:|^@/;
var dirAttrRE = /^v-([^:]+)(?:$|:(.*)$)/;
var modifierRE = /\.[^\.]+/g;
var transitionRE = /^(v-bind:|:)?transition$/;

// default directive priority
var DEFAULT_PRIORITY = 1000;
var DEFAULT_TERMINAL_PRIORITY = 2000;

/**
 * Compile a template and return a reusable composite link
 * function, which recursively contains more link functions
 * inside. This top level compile function would normally
 * be called on instance root nodes, but can also be used
 * for partial compilation if the partial argument is true.
 *
 * The returned composite link function, when called, will
 * return an unlink function that tearsdown all directives
 * created during the linking phase.
 *
 * @param {Element|DocumentFragment} el
 * @param {Object} options
 * @param {Boolean} partial
 * @return {Function}
 */

function compile(el, options, partial) {
  // link function for the node itself.
  var nodeLinkFn = partial || !options._asComponent ? compileNode(el, options) : null;
  // link function for the childNodes
  var childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && !isScript(el) && el.hasChildNodes() ? compileNodeList(el.childNodes, options) : null;

  /**
   * A composite linker function to be called on a already
   * compiled piece of DOM, which instantiates all directive
   * instances.
   *
   * @param {Vue} vm
   * @param {Element|DocumentFragment} el
   * @param {Vue} [host] - host vm of transcluded content
   * @param {Object} [scope] - v-for scope
   * @param {Fragment} [frag] - link context fragment
   * @return {Function|undefined}
   */

  return function compositeLinkFn(vm, el, host, scope, frag) {
    // cache childNodes before linking parent, fix #657
    var childNodes = toArray(el.childNodes);
    // link
    var dirs = linkAndCapture(function compositeLinkCapturer() {
      if (nodeLinkFn) nodeLinkFn(vm, el, host, scope, frag);
      if (childLinkFn) childLinkFn(vm, childNodes, host, scope, frag);
    }, vm);
    return makeUnlinkFn(vm, dirs);
  };
}

/**
 * Apply a linker to a vm/element pair and capture the
 * directives created during the process.
 *
 * @param {Function} linker
 * @param {Vue} vm
 */

function linkAndCapture(linker, vm) {
  /* istanbul ignore if */
  if (process.env.NODE_ENV === 'production') {
    // reset directives before every capture in production
    // mode, so that when unlinking we don't need to splice
    // them out (which turns out to be a perf hit).
    // they are kept in development mode because they are
    // useful for Vue's own tests.
    vm._directives = [];
  }
  var originalDirCount = vm._directives.length;
  linker();
  var dirs = vm._directives.slice(originalDirCount);
  dirs.sort(directiveComparator);
  for (var i = 0, l = dirs.length; i < l; i++) {
    dirs[i]._bind();
  }
  return dirs;
}

/**
 * Directive priority sort comparator
 *
 * @param {Object} a
 * @param {Object} b
 */

function directiveComparator(a, b) {
  a = a.descriptor.def.priority || DEFAULT_PRIORITY;
  b = b.descriptor.def.priority || DEFAULT_PRIORITY;
  return a > b ? -1 : a === b ? 0 : 1;
}

/**
 * Linker functions return an unlink function that
 * tearsdown all directives instances generated during
 * the process.
 *
 * We create unlink functions with only the necessary
 * information to avoid retaining additional closures.
 *
 * @param {Vue} vm
 * @param {Array} dirs
 * @param {Vue} [context]
 * @param {Array} [contextDirs]
 * @return {Function}
 */

function makeUnlinkFn(vm, dirs, context, contextDirs) {
  function unlink(destroying) {
    teardownDirs(vm, dirs, destroying);
    if (context && contextDirs) {
      teardownDirs(context, contextDirs);
    }
  }
  // expose linked directives
  unlink.dirs = dirs;
  return unlink;
}

/**
 * Teardown partial linked directives.
 *
 * @param {Vue} vm
 * @param {Array} dirs
 * @param {Boolean} destroying
 */

function teardownDirs(vm, dirs, destroying) {
  var i = dirs.length;
  while (i--) {
    dirs[i]._teardown();
    if (process.env.NODE_ENV !== 'production' && !destroying) {
      vm._directives.$remove(dirs[i]);
    }
  }
}

/**
 * Compile link props on an instance.
 *
 * @param {Vue} vm
 * @param {Element} el
 * @param {Object} props
 * @param {Object} [scope]
 * @return {Function}
 */

function compileAndLinkProps(vm, el, props, scope) {
  var propsLinkFn = compileProps(el, props, vm);
  var propDirs = linkAndCapture(function () {
    propsLinkFn(vm, scope);
  }, vm);
  return makeUnlinkFn(vm, propDirs);
}

/**
 * Compile the root element of an instance.
 *
 * 1. attrs on context container (context scope)
 * 2. attrs on the component template root node, if
 *    replace:true (child scope)
 *
 * If this is a fragment instance, we only need to compile 1.
 *
 * @param {Element} el
 * @param {Object} options
 * @param {Object} contextOptions
 * @return {Function}
 */

function compileRoot(el, options, contextOptions) {
  var containerAttrs = options._containerAttrs;
  var replacerAttrs = options._replacerAttrs;
  var contextLinkFn, replacerLinkFn;

  // only need to compile other attributes for
  // non-fragment instances
  if (el.nodeType !== 11) {
    // for components, container and replacer need to be
    // compiled separately and linked in different scopes.
    if (options._asComponent) {
      // 2. container attributes
      if (containerAttrs && contextOptions) {
        contextLinkFn = compileDirectives(containerAttrs, contextOptions);
      }
      if (replacerAttrs) {
        // 3. replacer attributes
        replacerLinkFn = compileDirectives(replacerAttrs, options);
      }
    } else {
      // non-component, just compile as a normal element.
      replacerLinkFn = compileDirectives(el.attributes, options);
    }
  } else if (process.env.NODE_ENV !== 'production' && containerAttrs) {
    // warn container directives for fragment instances
    var names = containerAttrs.filter(function (attr) {
      // allow vue-loader/vueify scoped css attributes
      return attr.name.indexOf('_v-') < 0 &&
      // allow event listeners
      !onRE.test(attr.name) &&
      // allow slots
      attr.name !== 'slot';
    }).map(function (attr) {
      return '"' + attr.name + '"';
    });
    if (names.length) {
      var plural = names.length > 1;
      warn('Attribute' + (plural ? 's ' : ' ') + names.join(', ') + (plural ? ' are' : ' is') + ' ignored on component ' + '<' + options.el.tagName.toLowerCase() + '> because ' + 'the component is a fragment instance: ' + 'http://vuejs.org/guide/components.html#Fragment-Instance');
    }
  }

  options._containerAttrs = options._replacerAttrs = null;
  return function rootLinkFn(vm, el, scope) {
    // link context scope dirs
    var context = vm._context;
    var contextDirs;
    if (context && contextLinkFn) {
      contextDirs = linkAndCapture(function () {
        contextLinkFn(context, el, null, scope);
      }, context);
    }

    // link self
    var selfDirs = linkAndCapture(function () {
      if (replacerLinkFn) replacerLinkFn(vm, el);
    }, vm);

    // return the unlink function that tearsdown context
    // container directives.
    return makeUnlinkFn(vm, selfDirs, context, contextDirs);
  };
}

/**
 * Compile a node and return a nodeLinkFn based on the
 * node type.
 *
 * @param {Node} node
 * @param {Object} options
 * @return {Function|null}
 */

function compileNode(node, options) {
  var type = node.nodeType;
  if (type === 1 && !isScript(node)) {
    return compileElement(node, options);
  } else if (type === 3 && node.data.trim()) {
    return compileTextNode(node, options);
  } else {
    return null;
  }
}

/**
 * Compile an element and return a nodeLinkFn.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function|null}
 */

function compileElement(el, options) {
  // preprocess textareas.
  // textarea treats its text content as the initial value.
  // just bind it as an attr directive for value.
  if (el.tagName === 'TEXTAREA') {
    var tokens = parseText(el.value);
    if (tokens) {
      el.setAttribute(':value', tokensToExp(tokens));
      el.value = '';
    }
  }
  var linkFn;
  var hasAttrs = el.hasAttributes();
  var attrs = hasAttrs && toArray(el.attributes);
  // check terminal directives (for & if)
  if (hasAttrs) {
    linkFn = checkTerminalDirectives(el, attrs, options);
  }
  // check element directives
  if (!linkFn) {
    linkFn = checkElementDirectives(el, options);
  }
  // check component
  if (!linkFn) {
    linkFn = checkComponent(el, options);
  }
  // normal directives
  if (!linkFn && hasAttrs) {
    linkFn = compileDirectives(attrs, options);
  }
  return linkFn;
}

/**
 * Compile a textNode and return a nodeLinkFn.
 *
 * @param {TextNode} node
 * @param {Object} options
 * @return {Function|null} textNodeLinkFn
 */

function compileTextNode(node, options) {
  // skip marked text nodes
  if (node._skip) {
    return removeText;
  }

  var tokens = parseText(node.wholeText);
  if (!tokens) {
    return null;
  }

  // mark adjacent text nodes as skipped,
  // because we are using node.wholeText to compile
  // all adjacent text nodes together. This fixes
  // issues in IE where sometimes it splits up a single
  // text node into multiple ones.
  var next = node.nextSibling;
  while (next && next.nodeType === 3) {
    next._skip = true;
    next = next.nextSibling;
  }

  var frag = document.createDocumentFragment();
  var el, token;
  for (var i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i];
    el = token.tag ? processTextToken(token, options) : document.createTextNode(token.value);
    frag.appendChild(el);
  }
  return makeTextNodeLinkFn(tokens, frag, options);
}

/**
 * Linker for an skipped text node.
 *
 * @param {Vue} vm
 * @param {Text} node
 */

function removeText(vm, node) {
  remove(node);
}

/**
 * Process a single text token.
 *
 * @param {Object} token
 * @param {Object} options
 * @return {Node}
 */

function processTextToken(token, options) {
  var el;
  if (token.oneTime) {
    el = document.createTextNode(token.value);
  } else {
    if (token.html) {
      el = document.createComment('v-html');
      setTokenType('html');
    } else {
      // IE will clean up empty textNodes during
      // frag.cloneNode(true), so we have to give it
      // something here...
      el = document.createTextNode(' ');
      setTokenType('text');
    }
  }
  function setTokenType(type) {
    if (token.descriptor) return;
    var parsed = parseDirective(token.value);
    token.descriptor = {
      name: type,
      def: directives[type],
      expression: parsed.expression,
      filters: parsed.filters
    };
  }
  return el;
}

/**
 * Build a function that processes a textNode.
 *
 * @param {Array<Object>} tokens
 * @param {DocumentFragment} frag
 */

function makeTextNodeLinkFn(tokens, frag) {
  return function textNodeLinkFn(vm, el, host, scope) {
    var fragClone = frag.cloneNode(true);
    var childNodes = toArray(fragClone.childNodes);
    var token, value, node;
    for (var i = 0, l = tokens.length; i < l; i++) {
      token = tokens[i];
      value = token.value;
      if (token.tag) {
        node = childNodes[i];
        if (token.oneTime) {
          value = (scope || vm).$eval(value);
          if (token.html) {
            replace(node, parseTemplate(value, true));
          } else {
            node.data = value;
          }
        } else {
          vm._bindDir(token.descriptor, node, host, scope);
        }
      }
    }
    replace(el, fragClone);
  };
}

/**
 * Compile a node list and return a childLinkFn.
 *
 * @param {NodeList} nodeList
 * @param {Object} options
 * @return {Function|undefined}
 */

function compileNodeList(nodeList, options) {
  var linkFns = [];
  var nodeLinkFn, childLinkFn, node;
  for (var i = 0, l = nodeList.length; i < l; i++) {
    node = nodeList[i];
    nodeLinkFn = compileNode(node, options);
    childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && node.tagName !== 'SCRIPT' && node.hasChildNodes() ? compileNodeList(node.childNodes, options) : null;
    linkFns.push(nodeLinkFn, childLinkFn);
  }
  return linkFns.length ? makeChildLinkFn(linkFns) : null;
}

/**
 * Make a child link function for a node's childNodes.
 *
 * @param {Array<Function>} linkFns
 * @return {Function} childLinkFn
 */

function makeChildLinkFn(linkFns) {
  return function childLinkFn(vm, nodes, host, scope, frag) {
    var node, nodeLinkFn, childrenLinkFn;
    for (var i = 0, n = 0, l = linkFns.length; i < l; n++) {
      node = nodes[n];
      nodeLinkFn = linkFns[i++];
      childrenLinkFn = linkFns[i++];
      // cache childNodes before linking parent, fix #657
      var childNodes = toArray(node.childNodes);
      if (nodeLinkFn) {
        nodeLinkFn(vm, node, host, scope, frag);
      }
      if (childrenLinkFn) {
        childrenLinkFn(vm, childNodes, host, scope, frag);
      }
    }
  };
}

/**
 * Check for element directives (custom elements that should
 * be resovled as terminal directives).
 *
 * @param {Element} el
 * @param {Object} options
 */

function checkElementDirectives(el, options) {
  var tag = el.tagName.toLowerCase();
  if (commonTagRE.test(tag)) {
    return;
  }
  var def = resolveAsset(options, 'elementDirectives', tag);
  if (def) {
    return makeTerminalNodeLinkFn(el, tag, '', options, def);
  }
}

/**
 * Check if an element is a component. If yes, return
 * a component link function.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function|undefined}
 */

function checkComponent(el, options) {
  var component = checkComponentAttr(el, options);
  if (component) {
    var ref = findRef(el);
    var descriptor = {
      name: 'component',
      ref: ref,
      expression: component.id,
      def: internalDirectives.component,
      modifiers: {
        literal: !component.dynamic
      }
    };
    var componentLinkFn = function componentLinkFn(vm, el, host, scope, frag) {
      if (ref) {
        defineReactive((scope || vm).$refs, ref, null);
      }
      vm._bindDir(descriptor, el, host, scope, frag);
    };
    componentLinkFn.terminal = true;
    return componentLinkFn;
  }
}

/**
 * Check an element for terminal directives in fixed order.
 * If it finds one, return a terminal link function.
 *
 * @param {Element} el
 * @param {Array} attrs
 * @param {Object} options
 * @return {Function} terminalLinkFn
 */

function checkTerminalDirectives(el, attrs, options) {
  // skip v-pre
  if (getAttr(el, 'v-pre') !== null) {
    return skip;
  }
  // skip v-else block, but only if following v-if
  if (el.hasAttribute('v-else')) {
    var prev = el.previousElementSibling;
    if (prev && prev.hasAttribute('v-if')) {
      return skip;
    }
  }

  var attr, name, value, modifiers, matched, dirName, rawName, arg, def, termDef;
  for (var i = 0, j = attrs.length; i < j; i++) {
    attr = attrs[i];
    name = attr.name.replace(modifierRE, '');
    if (matched = name.match(dirAttrRE)) {
      def = resolveAsset(options, 'directives', matched[1]);
      if (def && def.terminal) {
        if (!termDef || (def.priority || DEFAULT_TERMINAL_PRIORITY) > termDef.priority) {
          termDef = def;
          rawName = attr.name;
          modifiers = parseModifiers(attr.name);
          value = attr.value;
          dirName = matched[1];
          arg = matched[2];
        }
      }
    }
  }

  if (termDef) {
    return makeTerminalNodeLinkFn(el, dirName, value, options, termDef, rawName, arg, modifiers);
  }
}

function skip() {}
skip.terminal = true;

/**
 * Build a node link function for a terminal directive.
 * A terminal link function terminates the current
 * compilation recursion and handles compilation of the
 * subtree in the directive.
 *
 * @param {Element} el
 * @param {String} dirName
 * @param {String} value
 * @param {Object} options
 * @param {Object} def
 * @param {String} [rawName]
 * @param {String} [arg]
 * @param {Object} [modifiers]
 * @return {Function} terminalLinkFn
 */

function makeTerminalNodeLinkFn(el, dirName, value, options, def, rawName, arg, modifiers) {
  var parsed = parseDirective(value);
  var descriptor = {
    name: dirName,
    arg: arg,
    expression: parsed.expression,
    filters: parsed.filters,
    raw: value,
    attr: rawName,
    modifiers: modifiers,
    def: def
  };
  // check ref for v-for and router-view
  if (dirName === 'for' || dirName === 'router-view') {
    descriptor.ref = findRef(el);
  }
  var fn = function terminalNodeLinkFn(vm, el, host, scope, frag) {
    if (descriptor.ref) {
      defineReactive((scope || vm).$refs, descriptor.ref, null);
    }
    vm._bindDir(descriptor, el, host, scope, frag);
  };
  fn.terminal = true;
  return fn;
}

/**
 * Compile the directives on an element and return a linker.
 *
 * @param {Array|NamedNodeMap} attrs
 * @param {Object} options
 * @return {Function}
 */

function compileDirectives(attrs, options) {
  var i = attrs.length;
  var dirs = [];
  var attr, name, value, rawName, rawValue, dirName, arg, modifiers, dirDef, tokens, matched;
  while (i--) {
    attr = attrs[i];
    name = rawName = attr.name;
    value = rawValue = attr.value;
    tokens = parseText(value);
    // reset arg
    arg = null;
    // check modifiers
    modifiers = parseModifiers(name);
    name = name.replace(modifierRE, '');

    // attribute interpolations
    if (tokens) {
      value = tokensToExp(tokens);
      arg = name;
      pushDir('bind', directives.bind, tokens);
      // warn against mixing mustaches with v-bind
      if (process.env.NODE_ENV !== 'production') {
        if (name === 'class' && Array.prototype.some.call(attrs, function (attr) {
          return attr.name === ':class' || attr.name === 'v-bind:class';
        })) {
          warn('class="' + rawValue + '": Do not mix mustache interpolation ' + 'and v-bind for "class" on the same element. Use one or the other.', options);
        }
      }
    } else

      // special attribute: transition
      if (transitionRE.test(name)) {
        modifiers.literal = !bindRE.test(name);
        pushDir('transition', internalDirectives.transition);
      } else

        // event handlers
        if (onRE.test(name)) {
          arg = name.replace(onRE, '');
          pushDir('on', directives.on);
        } else

          // attribute bindings
          if (bindRE.test(name)) {
            dirName = name.replace(bindRE, '');
            if (dirName === 'style' || dirName === 'class') {
              pushDir(dirName, internalDirectives[dirName]);
            } else {
              arg = dirName;
              pushDir('bind', directives.bind);
            }
          } else

            // normal directives
            if (matched = name.match(dirAttrRE)) {
              dirName = matched[1];
              arg = matched[2];

              // skip v-else (when used with v-show)
              if (dirName === 'else') {
                continue;
              }

              dirDef = resolveAsset(options, 'directives', dirName, true);
              if (dirDef) {
                pushDir(dirName, dirDef);
              }
            }
  }

  /**
   * Push a directive.
   *
   * @param {String} dirName
   * @param {Object|Function} def
   * @param {Array} [interpTokens]
   */

  function pushDir(dirName, def, interpTokens) {
    var hasOneTimeToken = interpTokens && hasOneTime(interpTokens);
    var parsed = !hasOneTimeToken && parseDirective(value);
    dirs.push({
      name: dirName,
      attr: rawName,
      raw: rawValue,
      def: def,
      arg: arg,
      modifiers: modifiers,
      // conversion from interpolation strings with one-time token
      // to expression is differed until directive bind time so that we
      // have access to the actual vm context for one-time bindings.
      expression: parsed && parsed.expression,
      filters: parsed && parsed.filters,
      interp: interpTokens,
      hasOneTime: hasOneTimeToken
    });
  }

  if (dirs.length) {
    return makeNodeLinkFn(dirs);
  }
}

/**
 * Parse modifiers from directive attribute name.
 *
 * @param {String} name
 * @return {Object}
 */

function parseModifiers(name) {
  var res = Object.create(null);
  var match = name.match(modifierRE);
  if (match) {
    var i = match.length;
    while (i--) {
      res[match[i].slice(1)] = true;
    }
  }
  return res;
}

/**
 * Build a link function for all directives on a single node.
 *
 * @param {Array} directives
 * @return {Function} directivesLinkFn
 */

function makeNodeLinkFn(directives) {
  return function nodeLinkFn(vm, el, host, scope, frag) {
    // reverse apply because it's sorted low to high
    var i = directives.length;
    while (i--) {
      vm._bindDir(directives[i], el, host, scope, frag);
    }
  };
}

/**
 * Check if an interpolation string contains one-time tokens.
 *
 * @param {Array} tokens
 * @return {Boolean}
 */

function hasOneTime(tokens) {
  var i = tokens.length;
  while (i--) {
    if (tokens[i].oneTime) return true;
  }
}

function isScript(el) {
  return el.tagName === 'SCRIPT' && (!el.hasAttribute('type') || el.getAttribute('type') === 'text/javascript');
}

var specialCharRE = /[^\w\-:\.]/;

/**
 * Process an element or a DocumentFragment based on a
 * instance option object. This allows us to transclude
 * a template node/fragment before the instance is created,
 * so the processed fragment can then be cloned and reused
 * in v-for.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transclude(el, options) {
  // extract container attributes to pass them down
  // to compiler, because they need to be compiled in
  // parent scope. we are mutating the options object here
  // assuming the same object will be used for compile
  // right after this.
  if (options) {
    options._containerAttrs = extractAttrs(el);
  }
  // for template tags, what we want is its content as
  // a documentFragment (for fragment instances)
  if (isTemplate(el)) {
    el = parseTemplate(el);
  }
  if (options) {
    if (options._asComponent && !options.template) {
      options.template = '<slot></slot>';
    }
    if (options.template) {
      options._content = extractContent(el);
      el = transcludeTemplate(el, options);
    }
  }
  if (isFragment(el)) {
    // anchors for fragment instance
    // passing in `persist: true` to avoid them being
    // discarded by IE during template cloning
    prepend(createAnchor('v-start', true), el);
    el.appendChild(createAnchor('v-end', true));
  }
  return el;
}

/**
 * Process the template option.
 * If the replace option is true this will swap the $el.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transcludeTemplate(el, options) {
  var template = options.template;
  var frag = parseTemplate(template, true);
  if (frag) {
    var replacer = frag.firstChild;
    var tag = replacer.tagName && replacer.tagName.toLowerCase();
    if (options.replace) {
      /* istanbul ignore if */
      if (el === document.body) {
        process.env.NODE_ENV !== 'production' && warn('You are mounting an instance with a template to ' + '<body>. This will replace <body> entirely. You ' + 'should probably use `replace: false` here.');
      }
      // there are many cases where the instance must
      // become a fragment instance: basically anything that
      // can create more than 1 root nodes.
      if (
      // multi-children template
      frag.childNodes.length > 1 ||
      // non-element template
      replacer.nodeType !== 1 ||
      // single nested component
      tag === 'component' || resolveAsset(options, 'components', tag) || hasBindAttr(replacer, 'is') ||
      // element directive
      resolveAsset(options, 'elementDirectives', tag) ||
      // for block
      replacer.hasAttribute('v-for') ||
      // if block
      replacer.hasAttribute('v-if')) {
        return frag;
      } else {
        options._replacerAttrs = extractAttrs(replacer);
        mergeAttrs(el, replacer);
        return replacer;
      }
    } else {
      el.appendChild(frag);
      return el;
    }
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid template option: ' + template);
  }
}

/**
 * Helper to extract a component container's attributes
 * into a plain object array.
 *
 * @param {Element} el
 * @return {Array}
 */

function extractAttrs(el) {
  if (el.nodeType === 1 && el.hasAttributes()) {
    return toArray(el.attributes);
  }
}

/**
 * Merge the attributes of two elements, and make sure
 * the class names are merged properly.
 *
 * @param {Element} from
 * @param {Element} to
 */

function mergeAttrs(from, to) {
  var attrs = from.attributes;
  var i = attrs.length;
  var name, value;
  while (i--) {
    name = attrs[i].name;
    value = attrs[i].value;
    if (!to.hasAttribute(name) && !specialCharRE.test(name)) {
      to.setAttribute(name, value);
    } else if (name === 'class' && !parseText(value) && (value = value.trim())) {
      value.split(/\s+/).forEach(function (cls) {
        addClass(to, cls);
      });
    }
  }
}

/**
 * Scan and determine slot content distribution.
 * We do this during transclusion instead at compile time so that
 * the distribution is decoupled from the compilation order of
 * the slots.
 *
 * @param {Element|DocumentFragment} template
 * @param {Element} content
 * @param {Vue} vm
 */

function resolveSlots(vm, content) {
  if (!content) {
    return;
  }
  var contents = vm._slotContents = Object.create(null);
  var el, name;
  for (var i = 0, l = content.children.length; i < l; i++) {
    el = content.children[i];
    /* eslint-disable no-cond-assign */
    if (name = el.getAttribute('slot')) {
      (contents[name] || (contents[name] = [])).push(el);
    }
    /* eslint-enable no-cond-assign */
    if (process.env.NODE_ENV !== 'production' && getBindAttr(el, 'slot')) {
      warn('The "slot" attribute must be static.', vm.$parent);
    }
  }
  for (name in contents) {
    contents[name] = extractFragment(contents[name], content);
  }
  if (content.hasChildNodes()) {
    var nodes = content.childNodes;
    if (nodes.length === 1 && nodes[0].nodeType === 3 && !nodes[0].data.trim()) {
      return;
    }
    contents['default'] = extractFragment(content.childNodes, content);
  }
}

/**
 * Extract qualified content nodes from a node list.
 *
 * @param {NodeList} nodes
 * @return {DocumentFragment}
 */

function extractFragment(nodes, parent) {
  var frag = document.createDocumentFragment();
  nodes = toArray(nodes);
  for (var i = 0, l = nodes.length; i < l; i++) {
    var node = nodes[i];
    if (isTemplate(node) && !node.hasAttribute('v-if') && !node.hasAttribute('v-for')) {
      parent.removeChild(node);
      node = parseTemplate(node, true);
    }
    frag.appendChild(node);
  }
  return frag;
}



var compiler = Object.freeze({
	compile: compile,
	compileAndLinkProps: compileAndLinkProps,
	compileRoot: compileRoot,
	transclude: transclude,
	resolveSlots: resolveSlots
});

function stateMixin (Vue) {
  /**
   * Accessor for `$data` property, since setting $data
   * requires observing the new object and updating
   * proxied properties.
   */

  Object.defineProperty(Vue.prototype, '$data', {
    get: function get() {
      return this._data;
    },
    set: function set(newData) {
      if (newData !== this._data) {
        this._setData(newData);
      }
    }
  });

  /**
   * Setup the scope of an instance, which contains:
   * - observed data
   * - computed properties
   * - user methods
   * - meta properties
   */

  Vue.prototype._initState = function () {
    this._initProps();
    this._initMeta();
    this._initMethods();
    this._initData();
    this._initComputed();
  };

  /**
   * Initialize props.
   */

  Vue.prototype._initProps = function () {
    var options = this.$options;
    var el = options.el;
    var props = options.props;
    if (props && !el) {
      process.env.NODE_ENV !== 'production' && warn('Props will not be compiled if no `el` option is ' + 'provided at instantiation.', this);
    }
    // make sure to convert string selectors into element now
    el = options.el = query(el);
    this._propsUnlinkFn = el && el.nodeType === 1 && props
    // props must be linked in proper scope if inside v-for
    ? compileAndLinkProps(this, el, props, this._scope) : null;
  };

  /**
   * Initialize the data.
   */

  Vue.prototype._initData = function () {
    var dataFn = this.$options.data;
    var data = this._data = dataFn ? dataFn() : {};
    if (!isPlainObject(data)) {
      data = {};
      process.env.NODE_ENV !== 'production' && warn('data functions should return an object.', this);
    }
    var props = this._props;
    // proxy data on instance
    var keys = Object.keys(data);
    var i, key;
    i = keys.length;
    while (i--) {
      key = keys[i];
      // there are two scenarios where we can proxy a data key:
      // 1. it's not already defined as a prop
      // 2. it's provided via a instantiation option AND there are no
      //    template prop present
      if (!props || !hasOwn(props, key)) {
        this._proxy(key);
      } else if (process.env.NODE_ENV !== 'production') {
        warn('Data field "' + key + '" is already defined ' + 'as a prop. To provide default value for a prop, use the "default" ' + 'prop option; if you want to pass prop values to an instantiation ' + 'call, use the "propsData" option.', this);
      }
    }
    // observe data
    observe(data, this);
  };

  /**
   * Swap the instance's $data. Called in $data's setter.
   *
   * @param {Object} newData
   */

  Vue.prototype._setData = function (newData) {
    newData = newData || {};
    var oldData = this._data;
    this._data = newData;
    var keys, key, i;
    // unproxy keys not present in new data
    keys = Object.keys(oldData);
    i = keys.length;
    while (i--) {
      key = keys[i];
      if (!(key in newData)) {
        this._unproxy(key);
      }
    }
    // proxy keys not already proxied,
    // and trigger change for changed values
    keys = Object.keys(newData);
    i = keys.length;
    while (i--) {
      key = keys[i];
      if (!hasOwn(this, key)) {
        // new property
        this._proxy(key);
      }
    }
    oldData.__ob__.removeVm(this);
    observe(newData, this);
    this._digest();
  };

  /**
   * Proxy a property, so that
   * vm.prop === vm._data.prop
   *
   * @param {String} key
   */

  Vue.prototype._proxy = function (key) {
    if (!isReserved(key)) {
      // need to store ref to self here
      // because these getter/setters might
      // be called by child scopes via
      // prototype inheritance.
      var self = this;
      Object.defineProperty(self, key, {
        configurable: true,
        enumerable: true,
        get: function proxyGetter() {
          return self._data[key];
        },
        set: function proxySetter(val) {
          self._data[key] = val;
        }
      });
    }
  };

  /**
   * Unproxy a property.
   *
   * @param {String} key
   */

  Vue.prototype._unproxy = function (key) {
    if (!isReserved(key)) {
      delete this[key];
    }
  };

  /**
   * Force update on every watcher in scope.
   */

  Vue.prototype._digest = function () {
    for (var i = 0, l = this._watchers.length; i < l; i++) {
      this._watchers[i].update(true); // shallow updates
    }
  };

  /**
   * Setup computed properties. They are essentially
   * special getter/setters
   */

  function noop() {}
  Vue.prototype._initComputed = function () {
    var computed = this.$options.computed;
    if (computed) {
      for (var key in computed) {
        var userDef = computed[key];
        var def = {
          enumerable: true,
          configurable: true
        };
        if (typeof userDef === 'function') {
          def.get = makeComputedGetter(userDef, this);
          def.set = noop;
        } else {
          def.get = userDef.get ? userDef.cache !== false ? makeComputedGetter(userDef.get, this) : bind(userDef.get, this) : noop;
          def.set = userDef.set ? bind(userDef.set, this) : noop;
        }
        Object.defineProperty(this, key, def);
      }
    }
  };

  function makeComputedGetter(getter, owner) {
    var watcher = new Watcher(owner, getter, null, {
      lazy: true
    });
    return function computedGetter() {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    };
  }

  /**
   * Setup instance methods. Methods must be bound to the
   * instance since they might be passed down as a prop to
   * child components.
   */

  Vue.prototype._initMethods = function () {
    var methods = this.$options.methods;
    if (methods) {
      for (var key in methods) {
        this[key] = bind(methods[key], this);
      }
    }
  };

  /**
   * Initialize meta information like $index, $key & $value.
   */

  Vue.prototype._initMeta = function () {
    var metas = this.$options._meta;
    if (metas) {
      for (var key in metas) {
        defineReactive(this, key, metas[key]);
      }
    }
  };
}

var eventRE = /^v-on:|^@/;

function eventsMixin (Vue) {
  /**
   * Setup the instance's option events & watchers.
   * If the value is a string, we pull it from the
   * instance's methods by name.
   */

  Vue.prototype._initEvents = function () {
    var options = this.$options;
    if (options._asComponent) {
      registerComponentEvents(this, options.el);
    }
    registerCallbacks(this, '$on', options.events);
    registerCallbacks(this, '$watch', options.watch);
  };

  /**
   * Register v-on events on a child component
   *
   * @param {Vue} vm
   * @param {Element} el
   */

  function registerComponentEvents(vm, el) {
    var attrs = el.attributes;
    var name, value, handler;
    for (var i = 0, l = attrs.length; i < l; i++) {
      name = attrs[i].name;
      if (eventRE.test(name)) {
        name = name.replace(eventRE, '');
        // force the expression into a statement so that
        // it always dynamically resolves the method to call (#2670)
        // kinda ugly hack, but does the job.
        value = attrs[i].value;
        if (isSimplePath(value)) {
          value += '.apply(this, $arguments)';
        }
        handler = (vm._scope || vm._context).$eval(value, true);
        handler._fromParent = true;
        vm.$on(name.replace(eventRE), handler);
      }
    }
  }

  /**
   * Register callbacks for option events and watchers.
   *
   * @param {Vue} vm
   * @param {String} action
   * @param {Object} hash
   */

  function registerCallbacks(vm, action, hash) {
    if (!hash) return;
    var handlers, key, i, j;
    for (key in hash) {
      handlers = hash[key];
      if (isArray(handlers)) {
        for (i = 0, j = handlers.length; i < j; i++) {
          register(vm, action, key, handlers[i]);
        }
      } else {
        register(vm, action, key, handlers);
      }
    }
  }

  /**
   * Helper to register an event/watch callback.
   *
   * @param {Vue} vm
   * @param {String} action
   * @param {String} key
   * @param {Function|String|Object} handler
   * @param {Object} [options]
   */

  function register(vm, action, key, handler, options) {
    var type = typeof handler;
    if (type === 'function') {
      vm[action](key, handler, options);
    } else if (type === 'string') {
      var methods = vm.$options.methods;
      var method = methods && methods[handler];
      if (method) {
        vm[action](key, method, options);
      } else {
        process.env.NODE_ENV !== 'production' && warn('Unknown method: "' + handler + '" when ' + 'registering callback for ' + action + ': "' + key + '".', vm);
      }
    } else if (handler && type === 'object') {
      register(vm, action, key, handler.handler, handler);
    }
  }

  /**
   * Setup recursive attached/detached calls
   */

  Vue.prototype._initDOMHooks = function () {
    this.$on('hook:attached', onAttached);
    this.$on('hook:detached', onDetached);
  };

  /**
   * Callback to recursively call attached hook on children
   */

  function onAttached() {
    if (!this._isAttached) {
      this._isAttached = true;
      this.$children.forEach(callAttach);
    }
  }

  /**
   * Iterator to call attached hook
   *
   * @param {Vue} child
   */

  function callAttach(child) {
    if (!child._isAttached && inDoc(child.$el)) {
      child._callHook('attached');
    }
  }

  /**
   * Callback to recursively call detached hook on children
   */

  function onDetached() {
    if (this._isAttached) {
      this._isAttached = false;
      this.$children.forEach(callDetach);
    }
  }

  /**
   * Iterator to call detached hook
   *
   * @param {Vue} child
   */

  function callDetach(child) {
    if (child._isAttached && !inDoc(child.$el)) {
      child._callHook('detached');
    }
  }

  /**
   * Trigger all handlers for a hook
   *
   * @param {String} hook
   */

  Vue.prototype._callHook = function (hook) {
    this.$emit('pre-hook:' + hook);
    var handlers = this.$options[hook];
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        handlers[i].call(this);
      }
    }
    this.$emit('hook:' + hook);
  };
}

function noop() {}

/**
 * A directive links a DOM element with a piece of data,
 * which is the result of evaluating an expression.
 * It registers a watcher with the expression and calls
 * the DOM update function when a change is triggered.
 *
 * @param {Object} descriptor
 *                 - {String} name
 *                 - {Object} def
 *                 - {String} expression
 *                 - {Array<Object>} [filters]
 *                 - {Object} [modifiers]
 *                 - {Boolean} literal
 *                 - {String} attr
 *                 - {String} arg
 *                 - {String} raw
 *                 - {String} [ref]
 *                 - {Array<Object>} [interp]
 *                 - {Boolean} [hasOneTime]
 * @param {Vue} vm
 * @param {Node} el
 * @param {Vue} [host] - transclusion host component
 * @param {Object} [scope] - v-for scope
 * @param {Fragment} [frag] - owner fragment
 * @constructor
 */
function Directive(descriptor, vm, el, host, scope, frag) {
  this.vm = vm;
  this.el = el;
  // copy descriptor properties
  this.descriptor = descriptor;
  this.name = descriptor.name;
  this.expression = descriptor.expression;
  this.arg = descriptor.arg;
  this.modifiers = descriptor.modifiers;
  this.filters = descriptor.filters;
  this.literal = this.modifiers && this.modifiers.literal;
  // private
  this._locked = false;
  this._bound = false;
  this._listeners = null;
  // link context
  this._host = host;
  this._scope = scope;
  this._frag = frag;
  // store directives on node in dev mode
  if (process.env.NODE_ENV !== 'production' && this.el) {
    this.el._vue_directives = this.el._vue_directives || [];
    this.el._vue_directives.push(this);
  }
}

/**
 * Initialize the directive, mixin definition properties,
 * setup the watcher, call definition bind() and update()
 * if present.
 */

Directive.prototype._bind = function () {
  var name = this.name;
  var descriptor = this.descriptor;

  // remove attribute
  if ((name !== 'cloak' || this.vm._isCompiled) && this.el && this.el.removeAttribute) {
    var attr = descriptor.attr || 'v-' + name;
    this.el.removeAttribute(attr);
  }

  // copy def properties
  var def = descriptor.def;
  if (typeof def === 'function') {
    this.update = def;
  } else {
    extend(this, def);
  }

  // setup directive params
  this._setupParams();

  // initial bind
  if (this.bind) {
    this.bind();
  }
  this._bound = true;

  if (this.literal) {
    this.update && this.update(descriptor.raw);
  } else if ((this.expression || this.modifiers) && (this.update || this.twoWay) && !this._checkStatement()) {
    // wrapped updater for context
    var dir = this;
    if (this.update) {
      this._update = function (val, oldVal) {
        if (!dir._locked) {
          dir.update(val, oldVal);
        }
      };
    } else {
      this._update = noop;
    }
    var preProcess = this._preProcess ? bind(this._preProcess, this) : null;
    var postProcess = this._postProcess ? bind(this._postProcess, this) : null;
    var watcher = this._watcher = new Watcher(this.vm, this.expression, this._update, // callback
    {
      filters: this.filters,
      twoWay: this.twoWay,
      deep: this.deep,
      preProcess: preProcess,
      postProcess: postProcess,
      scope: this._scope
    });
    // v-model with inital inline value need to sync back to
    // model instead of update to DOM on init. They would
    // set the afterBind hook to indicate that.
    if (this.afterBind) {
      this.afterBind();
    } else if (this.update) {
      this.update(watcher.value);
    }
  }
};

/**
 * Setup all param attributes, e.g. track-by,
 * transition-mode, etc...
 */

Directive.prototype._setupParams = function () {
  if (!this.params) {
    return;
  }
  var params = this.params;
  // swap the params array with a fresh object.
  this.params = Object.create(null);
  var i = params.length;
  var key, val, mappedKey;
  while (i--) {
    key = hyphenate(params[i]);
    mappedKey = camelize(key);
    val = getBindAttr(this.el, key);
    if (val != null) {
      // dynamic
      this._setupParamWatcher(mappedKey, val);
    } else {
      // static
      val = getAttr(this.el, key);
      if (val != null) {
        this.params[mappedKey] = val === '' ? true : val;
      }
    }
  }
};

/**
 * Setup a watcher for a dynamic param.
 *
 * @param {String} key
 * @param {String} expression
 */

Directive.prototype._setupParamWatcher = function (key, expression) {
  var self = this;
  var called = false;
  var unwatch = (this._scope || this.vm).$watch(expression, function (val, oldVal) {
    self.params[key] = val;
    // since we are in immediate mode,
    // only call the param change callbacks if this is not the first update.
    if (called) {
      var cb = self.paramWatchers && self.paramWatchers[key];
      if (cb) {
        cb.call(self, val, oldVal);
      }
    } else {
      called = true;
    }
  }, {
    immediate: true,
    user: false
  });(this._paramUnwatchFns || (this._paramUnwatchFns = [])).push(unwatch);
};

/**
 * Check if the directive is a function caller
 * and if the expression is a callable one. If both true,
 * we wrap up the expression and use it as the event
 * handler.
 *
 * e.g. on-click="a++"
 *
 * @return {Boolean}
 */

Directive.prototype._checkStatement = function () {
  var expression = this.expression;
  if (expression && this.acceptStatement && !isSimplePath(expression)) {
    var fn = parseExpression(expression).get;
    var scope = this._scope || this.vm;
    var handler = function handler(e) {
      scope.$event = e;
      fn.call(scope, scope);
      scope.$event = null;
    };
    if (this.filters) {
      handler = scope._applyFilters(handler, null, this.filters);
    }
    this.update(handler);
    return true;
  }
};

/**
 * Set the corresponding value with the setter.
 * This should only be used in two-way directives
 * e.g. v-model.
 *
 * @param {*} value
 * @public
 */

Directive.prototype.set = function (value) {
  /* istanbul ignore else */
  if (this.twoWay) {
    this._withLock(function () {
      this._watcher.set(value);
    });
  } else if (process.env.NODE_ENV !== 'production') {
    warn('Directive.set() can only be used inside twoWay' + 'directives.');
  }
};

/**
 * Execute a function while preventing that function from
 * triggering updates on this directive instance.
 *
 * @param {Function} fn
 */

Directive.prototype._withLock = function (fn) {
  var self = this;
  self._locked = true;
  fn.call(self);
  nextTick(function () {
    self._locked = false;
  });
};

/**
 * Convenience method that attaches a DOM event listener
 * to the directive element and autometically tears it down
 * during unbind.
 *
 * @param {String} event
 * @param {Function} handler
 * @param {Boolean} [useCapture]
 */

Directive.prototype.on = function (event, handler, useCapture) {
  on(this.el, event, handler, useCapture);(this._listeners || (this._listeners = [])).push([event, handler]);
};

/**
 * Teardown the watcher and call unbind.
 */

Directive.prototype._teardown = function () {
  if (this._bound) {
    this._bound = false;
    if (this.unbind) {
      this.unbind();
    }
    if (this._watcher) {
      this._watcher.teardown();
    }
    var listeners = this._listeners;
    var i;
    if (listeners) {
      i = listeners.length;
      while (i--) {
        off(this.el, listeners[i][0], listeners[i][1]);
      }
    }
    var unwatchFns = this._paramUnwatchFns;
    if (unwatchFns) {
      i = unwatchFns.length;
      while (i--) {
        unwatchFns[i]();
      }
    }
    if (process.env.NODE_ENV !== 'production' && this.el) {
      this.el._vue_directives.$remove(this);
    }
    this.vm = this.el = this._watcher = this._listeners = null;
  }
};

function lifecycleMixin (Vue) {
  /**
   * Update v-ref for component.
   *
   * @param {Boolean} remove
   */

  Vue.prototype._updateRef = function (remove) {
    var ref = this.$options._ref;
    if (ref) {
      var refs = (this._scope || this._context).$refs;
      if (remove) {
        if (refs[ref] === this) {
          refs[ref] = null;
        }
      } else {
        refs[ref] = this;
      }
    }
  };

  /**
   * Transclude, compile and link element.
   *
   * If a pre-compiled linker is available, that means the
   * passed in element will be pre-transcluded and compiled
   * as well - all we need to do is to call the linker.
   *
   * Otherwise we need to call transclude/compile/link here.
   *
   * @param {Element} el
   */

  Vue.prototype._compile = function (el) {
    var options = this.$options;

    // transclude and init element
    // transclude can potentially replace original
    // so we need to keep reference; this step also injects
    // the template and caches the original attributes
    // on the container node and replacer node.
    var original = el;
    el = transclude(el, options);
    this._initElement(el);

    // handle v-pre on root node (#2026)
    if (el.nodeType === 1 && getAttr(el, 'v-pre') !== null) {
      return;
    }

    // root is always compiled per-instance, because
    // container attrs and props can be different every time.
    var contextOptions = this._context && this._context.$options;
    var rootLinker = compileRoot(el, options, contextOptions);

    // resolve slot distribution
    resolveSlots(this, options._content);

    // compile and link the rest
    var contentLinkFn;
    var ctor = this.constructor;
    // component compilation can be cached
    // as long as it's not using inline-template
    if (options._linkerCachable) {
      contentLinkFn = ctor.linker;
      if (!contentLinkFn) {
        contentLinkFn = ctor.linker = compile(el, options);
      }
    }

    // link phase
    // make sure to link root with prop scope!
    var rootUnlinkFn = rootLinker(this, el, this._scope);
    var contentUnlinkFn = contentLinkFn ? contentLinkFn(this, el) : compile(el, options)(this, el);

    // register composite unlink function
    // to be called during instance destruction
    this._unlinkFn = function () {
      rootUnlinkFn();
      // passing destroying: true to avoid searching and
      // splicing the directives
      contentUnlinkFn(true);
    };

    // finally replace original
    if (options.replace) {
      replace(original, el);
    }

    this._isCompiled = true;
    this._callHook('compiled');
  };

  /**
   * Initialize instance element. Called in the public
   * $mount() method.
   *
   * @param {Element} el
   */

  Vue.prototype._initElement = function (el) {
    if (isFragment(el)) {
      this._isFragment = true;
      this.$el = this._fragmentStart = el.firstChild;
      this._fragmentEnd = el.lastChild;
      // set persisted text anchors to empty
      if (this._fragmentStart.nodeType === 3) {
        this._fragmentStart.data = this._fragmentEnd.data = '';
      }
      this._fragment = el;
    } else {
      this.$el = el;
    }
    this.$el.__vue__ = this;
    this._callHook('beforeCompile');
  };

  /**
   * Create and bind a directive to an element.
   *
   * @param {Object} descriptor - parsed directive descriptor
   * @param {Node} node   - target node
   * @param {Vue} [host] - transclusion host component
   * @param {Object} [scope] - v-for scope
   * @param {Fragment} [frag] - owner fragment
   */

  Vue.prototype._bindDir = function (descriptor, node, host, scope, frag) {
    this._directives.push(new Directive(descriptor, this, node, host, scope, frag));
  };

  /**
   * Teardown an instance, unobserves the data, unbind all the
   * directives, turn off all the event listeners, etc.
   *
   * @param {Boolean} remove - whether to remove the DOM node.
   * @param {Boolean} deferCleanup - if true, defer cleanup to
   *                                 be called later
   */

  Vue.prototype._destroy = function (remove, deferCleanup) {
    if (this._isBeingDestroyed) {
      if (!deferCleanup) {
        this._cleanup();
      }
      return;
    }

    var destroyReady;
    var pendingRemoval;

    var self = this;
    // Cleanup should be called either synchronously or asynchronoysly as
    // callback of this.$remove(), or if remove and deferCleanup are false.
    // In any case it should be called after all other removing, unbinding and
    // turning of is done
    var cleanupIfPossible = function cleanupIfPossible() {
      if (destroyReady && !pendingRemoval && !deferCleanup) {
        self._cleanup();
      }
    };

    // remove DOM element
    if (remove && this.$el) {
      pendingRemoval = true;
      this.$remove(function () {
        pendingRemoval = false;
        cleanupIfPossible();
      });
    }

    this._callHook('beforeDestroy');
    this._isBeingDestroyed = true;
    var i;
    // remove self from parent. only necessary
    // if parent is not being destroyed as well.
    var parent = this.$parent;
    if (parent && !parent._isBeingDestroyed) {
      parent.$children.$remove(this);
      // unregister ref (remove: true)
      this._updateRef(true);
    }
    // destroy all children.
    i = this.$children.length;
    while (i--) {
      this.$children[i].$destroy();
    }
    // teardown props
    if (this._propsUnlinkFn) {
      this._propsUnlinkFn();
    }
    // teardown all directives. this also tearsdown all
    // directive-owned watchers.
    if (this._unlinkFn) {
      this._unlinkFn();
    }
    i = this._watchers.length;
    while (i--) {
      this._watchers[i].teardown();
    }
    // remove reference to self on $el
    if (this.$el) {
      this.$el.__vue__ = null;
    }

    destroyReady = true;
    cleanupIfPossible();
  };

  /**
   * Clean up to ensure garbage collection.
   * This is called after the leave transition if there
   * is any.
   */

  Vue.prototype._cleanup = function () {
    if (this._isDestroyed) {
      return;
    }
    // remove self from owner fragment
    // do it in cleanup so that we can call $destroy with
    // defer right when a fragment is about to be removed.
    if (this._frag) {
      this._frag.children.$remove(this);
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (this._data && this._data.__ob__) {
      this._data.__ob__.removeVm(this);
    }
    // Clean up references to private properties and other
    // instances. preserve reference to _data so that proxy
    // accessors still work. The only potential side effect
    // here is that mutating the instance after it's destroyed
    // may affect the state of other components that are still
    // observing the same object, but that seems to be a
    // reasonable responsibility for the user rather than
    // always throwing an error on them.
    this.$el = this.$parent = this.$root = this.$children = this._watchers = this._context = this._scope = this._directives = null;
    // call the last hook...
    this._isDestroyed = true;
    this._callHook('destroyed');
    // turn off all instance listeners.
    this.$off();
  };
}

function miscMixin (Vue) {
  /**
   * Apply a list of filter (descriptors) to a value.
   * Using plain for loops here because this will be called in
   * the getter of any watcher with filters so it is very
   * performance sensitive.
   *
   * @param {*} value
   * @param {*} [oldValue]
   * @param {Array} filters
   * @param {Boolean} write
   * @return {*}
   */

  Vue.prototype._applyFilters = function (value, oldValue, filters, write) {
    var filter, fn, args, arg, offset, i, l, j, k;
    for (i = 0, l = filters.length; i < l; i++) {
      filter = filters[write ? l - i - 1 : i];
      fn = resolveAsset(this.$options, 'filters', filter.name, true);
      if (!fn) continue;
      fn = write ? fn.write : fn.read || fn;
      if (typeof fn !== 'function') continue;
      args = write ? [value, oldValue] : [value];
      offset = write ? 2 : 1;
      if (filter.args) {
        for (j = 0, k = filter.args.length; j < k; j++) {
          arg = filter.args[j];
          args[j + offset] = arg.dynamic ? this.$get(arg.value) : arg.value;
        }
      }
      value = fn.apply(this, args);
    }
    return value;
  };

  /**
   * Resolve a component, depending on whether the component
   * is defined normally or using an async factory function.
   * Resolves synchronously if already resolved, otherwise
   * resolves asynchronously and caches the resolved
   * constructor on the factory.
   *
   * @param {String|Function} value
   * @param {Function} cb
   */

  Vue.prototype._resolveComponent = function (value, cb) {
    var factory;
    if (typeof value === 'function') {
      factory = value;
    } else {
      factory = resolveAsset(this.$options, 'components', value, true);
    }
    /* istanbul ignore if */
    if (!factory) {
      return;
    }
    // async component factory
    if (!factory.options) {
      if (factory.resolved) {
        // cached
        cb(factory.resolved);
      } else if (factory.requested) {
        // pool callbacks
        factory.pendingCallbacks.push(cb);
      } else {
        factory.requested = true;
        var cbs = factory.pendingCallbacks = [cb];
        factory.call(this, function resolve(res) {
          if (isPlainObject(res)) {
            res = Vue.extend(res);
          }
          // cache resolved
          factory.resolved = res;
          // invoke callbacks
          for (var i = 0, l = cbs.length; i < l; i++) {
            cbs[i](res);
          }
        }, function reject(reason) {
          process.env.NODE_ENV !== 'production' && warn('Failed to resolve async component' + (typeof value === 'string' ? ': ' + value : '') + '. ' + (reason ? '\nReason: ' + reason : ''));
        });
      }
    } else {
      // normal component
      cb(factory);
    }
  };
}

var filterRE$1 = /[^|]\|[^|]/;

function dataAPI (Vue) {
  /**
   * Get the value from an expression on this vm.
   *
   * @param {String} exp
   * @param {Boolean} [asStatement]
   * @return {*}
   */

  Vue.prototype.$get = function (exp, asStatement) {
    var res = parseExpression(exp);
    if (res) {
      if (asStatement) {
        var self = this;
        return function statementHandler() {
          self.$arguments = toArray(arguments);
          var result = res.get.call(self, self);
          self.$arguments = null;
          return result;
        };
      } else {
        try {
          return res.get.call(this, this);
        } catch (e) {}
      }
    }
  };

  /**
   * Set the value from an expression on this vm.
   * The expression must be a valid left-hand
   * expression in an assignment.
   *
   * @param {String} exp
   * @param {*} val
   */

  Vue.prototype.$set = function (exp, val) {
    var res = parseExpression(exp, true);
    if (res && res.set) {
      res.set.call(this, this, val);
    }
  };

  /**
   * Delete a property on the VM
   *
   * @param {String} key
   */

  Vue.prototype.$delete = function (key) {
    del(this._data, key);
  };

  /**
   * Watch an expression, trigger callback when its
   * value changes.
   *
   * @param {String|Function} expOrFn
   * @param {Function} cb
   * @param {Object} [options]
   *                 - {Boolean} deep
   *                 - {Boolean} immediate
   * @return {Function} - unwatchFn
   */

  Vue.prototype.$watch = function (expOrFn, cb, options) {
    var vm = this;
    var parsed;
    if (typeof expOrFn === 'string') {
      parsed = parseDirective(expOrFn);
      expOrFn = parsed.expression;
    }
    var watcher = new Watcher(vm, expOrFn, cb, {
      deep: options && options.deep,
      sync: options && options.sync,
      filters: parsed && parsed.filters,
      user: !options || options.user !== false
    });
    if (options && options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn() {
      watcher.teardown();
    };
  };

  /**
   * Evaluate a text directive, including filters.
   *
   * @param {String} text
   * @param {Boolean} [asStatement]
   * @return {String}
   */

  Vue.prototype.$eval = function (text, asStatement) {
    // check for filters.
    if (filterRE$1.test(text)) {
      var dir = parseDirective(text);
      // the filter regex check might give false positive
      // for pipes inside strings, so it's possible that
      // we don't get any filters here
      var val = this.$get(dir.expression, asStatement);
      return dir.filters ? this._applyFilters(val, null, dir.filters) : val;
    } else {
      // no filter
      return this.$get(text, asStatement);
    }
  };

  /**
   * Interpolate a piece of template text.
   *
   * @param {String} text
   * @return {String}
   */

  Vue.prototype.$interpolate = function (text) {
    var tokens = parseText(text);
    var vm = this;
    if (tokens) {
      if (tokens.length === 1) {
        return vm.$eval(tokens[0].value) + '';
      } else {
        return tokens.map(function (token) {
          return token.tag ? vm.$eval(token.value) : token.value;
        }).join('');
      }
    } else {
      return text;
    }
  };

  /**
   * Log instance data as a plain JS object
   * so that it is easier to inspect in console.
   * This method assumes console is available.
   *
   * @param {String} [path]
   */

  Vue.prototype.$log = function (path) {
    var data = path ? getPath(this._data, path) : this._data;
    if (data) {
      data = clean(data);
    }
    // include computed fields
    if (!path) {
      var key;
      for (key in this.$options.computed) {
        data[key] = clean(this[key]);
      }
      if (this._props) {
        for (key in this._props) {
          data[key] = clean(this[key]);
        }
      }
    }
    console.log(data);
  };

  /**
   * "clean" a getter/setter converted object into a plain
   * object copy.
   *
   * @param {Object} - obj
   * @return {Object}
   */

  function clean(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
}

function domAPI (Vue) {
  /**
   * Convenience on-instance nextTick. The callback is
   * auto-bound to the instance, and this avoids component
   * modules having to rely on the global Vue.
   *
   * @param {Function} fn
   */

  Vue.prototype.$nextTick = function (fn) {
    nextTick(fn, this);
  };

  /**
   * Append instance to target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$appendTo = function (target, cb, withTransition) {
    return insert(this, target, cb, withTransition, append, appendWithTransition);
  };

  /**
   * Prepend instance to target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$prependTo = function (target, cb, withTransition) {
    target = query(target);
    if (target.hasChildNodes()) {
      this.$before(target.firstChild, cb, withTransition);
    } else {
      this.$appendTo(target, cb, withTransition);
    }
    return this;
  };

  /**
   * Insert instance before target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$before = function (target, cb, withTransition) {
    return insert(this, target, cb, withTransition, beforeWithCb, beforeWithTransition);
  };

  /**
   * Insert instance after target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$after = function (target, cb, withTransition) {
    target = query(target);
    if (target.nextSibling) {
      this.$before(target.nextSibling, cb, withTransition);
    } else {
      this.$appendTo(target.parentNode, cb, withTransition);
    }
    return this;
  };

  /**
   * Remove instance from DOM
   *
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$remove = function (cb, withTransition) {
    if (!this.$el.parentNode) {
      return cb && cb();
    }
    var inDocument = this._isAttached && inDoc(this.$el);
    // if we are not in document, no need to check
    // for transitions
    if (!inDocument) withTransition = false;
    var self = this;
    var realCb = function realCb() {
      if (inDocument) self._callHook('detached');
      if (cb) cb();
    };
    if (this._isFragment) {
      removeNodeRange(this._fragmentStart, this._fragmentEnd, this, this._fragment, realCb);
    } else {
      var op = withTransition === false ? removeWithCb : removeWithTransition;
      op(this.$el, this, realCb);
    }
    return this;
  };

  /**
   * Shared DOM insertion function.
   *
   * @param {Vue} vm
   * @param {Element} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition]
   * @param {Function} op1 - op for non-transition insert
   * @param {Function} op2 - op for transition insert
   * @return vm
   */

  function insert(vm, target, cb, withTransition, op1, op2) {
    target = query(target);
    var targetIsDetached = !inDoc(target);
    var op = withTransition === false || targetIsDetached ? op1 : op2;
    var shouldCallHook = !targetIsDetached && !vm._isAttached && !inDoc(vm.$el);
    if (vm._isFragment) {
      mapNodeRange(vm._fragmentStart, vm._fragmentEnd, function (node) {
        op(node, target, vm);
      });
      cb && cb();
    } else {
      op(vm.$el, target, vm, cb);
    }
    if (shouldCallHook) {
      vm._callHook('attached');
    }
    return vm;
  }

  /**
   * Check for selectors
   *
   * @param {String|Element} el
   */

  function query(el) {
    return typeof el === 'string' ? document.querySelector(el) : el;
  }

  /**
   * Append operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function append(el, target, vm, cb) {
    target.appendChild(el);
    if (cb) cb();
  }

  /**
   * InsertBefore operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function beforeWithCb(el, target, vm, cb) {
    before(el, target);
    if (cb) cb();
  }

  /**
   * Remove operation that takes a callback.
   *
   * @param {Node} el
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function removeWithCb(el, vm, cb) {
    remove(el);
    if (cb) cb();
  }
}

function eventsAPI (Vue) {
  /**
   * Listen on the given `event` with `fn`.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$on = function (event, fn) {
    (this._events[event] || (this._events[event] = [])).push(fn);
    modifyListenerCount(this, event, 1);
    return this;
  };

  /**
   * Adds an `event` listener that will be invoked a single
   * time then automatically removed.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$once = function (event, fn) {
    var self = this;
    function on() {
      self.$off(event, on);
      fn.apply(this, arguments);
    }
    on.fn = fn;
    this.$on(event, on);
    return this;
  };

  /**
   * Remove the given callback for `event` or all
   * registered callbacks.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$off = function (event, fn) {
    var cbs;
    // all
    if (!arguments.length) {
      if (this.$parent) {
        for (event in this._events) {
          cbs = this._events[event];
          if (cbs) {
            modifyListenerCount(this, event, -cbs.length);
          }
        }
      }
      this._events = {};
      return this;
    }
    // specific event
    cbs = this._events[event];
    if (!cbs) {
      return this;
    }
    if (arguments.length === 1) {
      modifyListenerCount(this, event, -cbs.length);
      this._events[event] = null;
      return this;
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        modifyListenerCount(this, event, -1);
        cbs.splice(i, 1);
        break;
      }
    }
    return this;
  };

  /**
   * Trigger an event on self.
   *
   * @param {String|Object} event
   * @return {Boolean} shouldPropagate
   */

  Vue.prototype.$emit = function (event) {
    var isSource = typeof event === 'string';
    event = isSource ? event : event.name;
    var cbs = this._events[event];
    var shouldPropagate = isSource || !cbs;
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      // this is a somewhat hacky solution to the question raised
      // in #2102: for an inline component listener like <comp @test="doThis">,
      // the propagation handling is somewhat broken. Therefore we
      // need to treat these inline callbacks differently.
      var hasParentCbs = isSource && cbs.some(function (cb) {
        return cb._fromParent;
      });
      if (hasParentCbs) {
        shouldPropagate = false;
      }
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        var cb = cbs[i];
        var res = cb.apply(this, args);
        if (res === true && (!hasParentCbs || cb._fromParent)) {
          shouldPropagate = true;
        }
      }
    }
    return shouldPropagate;
  };

  /**
   * Recursively broadcast an event to all children instances.
   *
   * @param {String|Object} event
   * @param {...*} additional arguments
   */

  Vue.prototype.$broadcast = function (event) {
    var isSource = typeof event === 'string';
    event = isSource ? event : event.name;
    // if no child has registered for this event,
    // then there's no need to broadcast.
    if (!this._eventsCount[event]) return;
    var children = this.$children;
    var args = toArray(arguments);
    if (isSource) {
      // use object event to indicate non-source emit
      // on children
      args[0] = { name: event, source: this };
    }
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var shouldPropagate = child.$emit.apply(child, args);
      if (shouldPropagate) {
        child.$broadcast.apply(child, args);
      }
    }
    return this;
  };

  /**
   * Recursively propagate an event up the parent chain.
   *
   * @param {String} event
   * @param {...*} additional arguments
   */

  Vue.prototype.$dispatch = function (event) {
    var shouldPropagate = this.$emit.apply(this, arguments);
    if (!shouldPropagate) return;
    var parent = this.$parent;
    var args = toArray(arguments);
    // use object event to indicate non-source emit
    // on parents
    args[0] = { name: event, source: this };
    while (parent) {
      shouldPropagate = parent.$emit.apply(parent, args);
      parent = shouldPropagate ? parent.$parent : null;
    }
    return this;
  };

  /**
   * Modify the listener counts on all parents.
   * This bookkeeping allows $broadcast to return early when
   * no child has listened to a certain event.
   *
   * @param {Vue} vm
   * @param {String} event
   * @param {Number} count
   */

  var hookRE = /^hook:/;
  function modifyListenerCount(vm, event, count) {
    var parent = vm.$parent;
    // hooks do not get broadcasted so no need
    // to do bookkeeping for them
    if (!parent || !count || hookRE.test(event)) return;
    while (parent) {
      parent._eventsCount[event] = (parent._eventsCount[event] || 0) + count;
      parent = parent.$parent;
    }
  }
}

function lifecycleAPI (Vue) {
  /**
   * Set instance target element and kick off the compilation
   * process. The passed in `el` can be a selector string, an
   * existing Element, or a DocumentFragment (for block
   * instances).
   *
   * @param {Element|DocumentFragment|string} el
   * @public
   */

  Vue.prototype.$mount = function (el) {
    if (this._isCompiled) {
      process.env.NODE_ENV !== 'production' && warn('$mount() should be called only once.', this);
      return;
    }
    el = query(el);
    if (!el) {
      el = document.createElement('div');
    }
    this._compile(el);
    this._initDOMHooks();
    if (inDoc(this.$el)) {
      this._callHook('attached');
      ready.call(this);
    } else {
      this.$once('hook:attached', ready);
    }
    return this;
  };

  /**
   * Mark an instance as ready.
   */

  function ready() {
    this._isAttached = true;
    this._isReady = true;
    this._callHook('ready');
  }

  /**
   * Teardown the instance, simply delegate to the internal
   * _destroy.
   *
   * @param {Boolean} remove
   * @param {Boolean} deferCleanup
   */

  Vue.prototype.$destroy = function (remove, deferCleanup) {
    this._destroy(remove, deferCleanup);
  };

  /**
   * Partially compile a piece of DOM and return a
   * decompile function.
   *
   * @param {Element|DocumentFragment} el
   * @param {Vue} [host]
   * @param {Object} [scope]
   * @param {Fragment} [frag]
   * @return {Function}
   */

  Vue.prototype.$compile = function (el, host, scope, frag) {
    return compile(el, this.$options, true)(this, el, host, scope, frag);
  };
}

/**
 * The exposed Vue constructor.
 *
 * API conventions:
 * - public API methods/properties are prefixed with `$`
 * - internal methods/properties are prefixed with `_`
 * - non-prefixed properties are assumed to be proxied user
 *   data.
 *
 * @constructor
 * @param {Object} [options]
 * @public
 */

function Vue(options) {
  this._init(options);
}

// install internals
initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
miscMixin(Vue);

// install instance APIs
dataAPI(Vue);
domAPI(Vue);
eventsAPI(Vue);
lifecycleAPI(Vue);

var slot = {

  priority: SLOT,
  params: ['name'],

  bind: function bind() {
    // this was resolved during component transclusion
    var name = this.params.name || 'default';
    var content = this.vm._slotContents && this.vm._slotContents[name];
    if (!content || !content.hasChildNodes()) {
      this.fallback();
    } else {
      this.compile(content.cloneNode(true), this.vm._context, this.vm);
    }
  },

  compile: function compile(content, context, host) {
    if (content && context) {
      if (this.el.hasChildNodes() && content.childNodes.length === 1 && content.childNodes[0].nodeType === 1 && content.childNodes[0].hasAttribute('v-if')) {
        // if the inserted slot has v-if
        // inject fallback content as the v-else
        var elseBlock = document.createElement('template');
        elseBlock.setAttribute('v-else', '');
        elseBlock.innerHTML = this.el.innerHTML;
        // the else block should be compiled in child scope
        elseBlock._context = this.vm;
        content.appendChild(elseBlock);
      }
      var scope = host ? host._scope : this._scope;
      this.unlink = context.$compile(content, host, scope, this._frag);
    }
    if (content) {
      replace(this.el, content);
    } else {
      remove(this.el);
    }
  },

  fallback: function fallback() {
    this.compile(extractContent(this.el, true), this.vm);
  },

  unbind: function unbind() {
    if (this.unlink) {
      this.unlink();
    }
  }
};

var partial = {

  priority: PARTIAL,

  params: ['name'],

  // watch changes to name for dynamic partials
  paramWatchers: {
    name: function name(value) {
      vIf.remove.call(this);
      if (value) {
        this.insert(value);
      }
    }
  },

  bind: function bind() {
    this.anchor = createAnchor('v-partial');
    replace(this.el, this.anchor);
    this.insert(this.params.name);
  },

  insert: function insert(id) {
    var partial = resolveAsset(this.vm.$options, 'partials', id, true);
    if (partial) {
      this.factory = new FragmentFactory(this.vm, partial);
      vIf.insert.call(this);
    }
  },

  unbind: function unbind() {
    if (this.frag) {
      this.frag.destroy();
    }
  }
};

var elementDirectives = {
  slot: slot,
  partial: partial
};

var convertArray = vFor._postProcess;

/**
 * Limit filter for arrays
 *
 * @param {Number} n
 * @param {Number} offset (Decimal expected)
 */

function limitBy(arr, n, offset) {
  offset = offset ? parseInt(offset, 10) : 0;
  n = toNumber(n);
  return typeof n === 'number' ? arr.slice(offset, offset + n) : arr;
}

/**
 * Filter filter for arrays
 *
 * @param {String} search
 * @param {String} [delimiter]
 * @param {String} ...dataKeys
 */

function filterBy(arr, search, delimiter) {
  arr = convertArray(arr);
  if (search == null) {
    return arr;
  }
  if (typeof search === 'function') {
    return arr.filter(search);
  }
  // cast to lowercase string
  search = ('' + search).toLowerCase();
  // allow optional `in` delimiter
  // because why not
  var n = delimiter === 'in' ? 3 : 2;
  // extract and flatten keys
  var keys = Array.prototype.concat.apply([], toArray(arguments, n));
  var res = [];
  var item, key, val, j;
  for (var i = 0, l = arr.length; i < l; i++) {
    item = arr[i];
    val = item && item.$value || item;
    j = keys.length;
    if (j) {
      while (j--) {
        key = keys[j];
        if (key === '$key' && contains(item.$key, search) || contains(getPath(val, key), search)) {
          res.push(item);
          break;
        }
      }
    } else if (contains(item, search)) {
      res.push(item);
    }
  }
  return res;
}

/**
 * Filter filter for arrays
 *
 * @param {String|Array<String>|Function} ...sortKeys
 * @param {Number} [order]
 */

function orderBy(arr) {
  var comparator = null;
  var sortKeys = undefined;
  arr = convertArray(arr);

  // determine order (last argument)
  var args = toArray(arguments, 1);
  var order = args[args.length - 1];
  if (typeof order === 'number') {
    order = order < 0 ? -1 : 1;
    args = args.length > 1 ? args.slice(0, -1) : args;
  } else {
    order = 1;
  }

  // determine sortKeys & comparator
  var firstArg = args[0];
  if (!firstArg) {
    return arr;
  } else if (typeof firstArg === 'function') {
    // custom comparator
    comparator = function (a, b) {
      return firstArg(a, b) * order;
    };
  } else {
    // string keys. flatten first
    sortKeys = Array.prototype.concat.apply([], args);
    comparator = function (a, b, i) {
      i = i || 0;
      return i >= sortKeys.length - 1 ? baseCompare(a, b, i) : baseCompare(a, b, i) || comparator(a, b, i + 1);
    };
  }

  function baseCompare(a, b, sortKeyIndex) {
    var sortKey = sortKeys[sortKeyIndex];
    if (sortKey) {
      if (sortKey !== '$key') {
        if (isObject(a) && '$value' in a) a = a.$value;
        if (isObject(b) && '$value' in b) b = b.$value;
      }
      a = isObject(a) ? getPath(a, sortKey) : a;
      b = isObject(b) ? getPath(b, sortKey) : b;
    }
    return a === b ? 0 : a > b ? order : -order;
  }

  // sort on a copy to avoid mutating original array
  return arr.slice().sort(comparator);
}

/**
 * String contain helper
 *
 * @param {*} val
 * @param {String} search
 */

function contains(val, search) {
  var i;
  if (isPlainObject(val)) {
    var keys = Object.keys(val);
    i = keys.length;
    while (i--) {
      if (contains(val[keys[i]], search)) {
        return true;
      }
    }
  } else if (isArray(val)) {
    i = val.length;
    while (i--) {
      if (contains(val[i], search)) {
        return true;
      }
    }
  } else if (val != null) {
    return val.toString().toLowerCase().indexOf(search) > -1;
  }
}

var digitsRE = /(\d{3})(?=\d)/g;

// asset collections must be a plain object.
var filters = {

  orderBy: orderBy,
  filterBy: filterBy,
  limitBy: limitBy,

  /**
   * Stringify value.
   *
   * @param {Number} indent
   */

  json: {
    read: function read(value, indent) {
      return typeof value === 'string' ? value : JSON.stringify(value, null, Number(indent) || 2);
    },
    write: function write(value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
  },

  /**
   * 'abc' => 'Abc'
   */

  capitalize: function capitalize(value) {
    if (!value && value !== 0) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
  },

  /**
   * 'abc' => 'ABC'
   */

  uppercase: function uppercase(value) {
    return value || value === 0 ? value.toString().toUpperCase() : '';
  },

  /**
   * 'AbC' => 'abc'
   */

  lowercase: function lowercase(value) {
    return value || value === 0 ? value.toString().toLowerCase() : '';
  },

  /**
   * 12345 => $12,345.00
   *
   * @param {String} sign
   * @param {Number} decimals Decimal places
   */

  currency: function currency(value, _currency, decimals) {
    value = parseFloat(value);
    if (!isFinite(value) || !value && value !== 0) return '';
    _currency = _currency != null ? _currency : '$';
    decimals = decimals != null ? decimals : 2;
    var stringified = Math.abs(value).toFixed(decimals);
    var _int = decimals ? stringified.slice(0, -1 - decimals) : stringified;
    var i = _int.length % 3;
    var head = i > 0 ? _int.slice(0, i) + (_int.length > 3 ? ',' : '') : '';
    var _float = decimals ? stringified.slice(-1 - decimals) : '';
    var sign = value < 0 ? '-' : '';
    return sign + _currency + head + _int.slice(i).replace(digitsRE, '$1,') + _float;
  },

  /**
   * 'item' => 'items'
   *
   * @params
   *  an array of strings corresponding to
   *  the single, double, triple ... forms of the word to
   *  be pluralized. When the number to be pluralized
   *  exceeds the length of the args, it will use the last
   *  entry in the array.
   *
   *  e.g. ['single', 'double', 'triple', 'multiple']
   */

  pluralize: function pluralize(value) {
    var args = toArray(arguments, 1);
    return args.length > 1 ? args[value % 10 - 1] || args[args.length - 1] : args[0] + (value === 1 ? '' : 's');
  },

  /**
   * Debounce a handler function.
   *
   * @param {Function} handler
   * @param {Number} delay = 300
   * @return {Function}
   */

  debounce: function debounce(handler, delay) {
    if (!handler) return;
    if (!delay) {
      delay = 300;
    }
    return _debounce(handler, delay);
  }
};

function installGlobalAPI (Vue) {
  /**
   * Vue and every constructor that extends Vue has an
   * associated options object, which can be accessed during
   * compilation steps as `this.constructor.options`.
   *
   * These can be seen as the default options of every
   * Vue instance.
   */

  Vue.options = {
    directives: directives,
    elementDirectives: elementDirectives,
    filters: filters,
    transitions: {},
    components: {},
    partials: {},
    replace: true
  };

  /**
   * Expose useful internals
   */

  Vue.util = util;
  Vue.config = config;
  Vue.set = set;
  Vue['delete'] = del;
  Vue.nextTick = nextTick;

  /**
   * The following are exposed for advanced usage / plugins
   */

  Vue.compiler = compiler;
  Vue.FragmentFactory = FragmentFactory;
  Vue.internalDirectives = internalDirectives;
  Vue.parsers = {
    path: path,
    text: text,
    template: template,
    directive: directive,
    expression: expression
  };

  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */

  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   *
   * @param {Object} extendOptions
   */

  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var isFirstExtend = Super.cid === 0;
    if (isFirstExtend && extendOptions._Ctor) {
      return extendOptions._Ctor;
    }
    var name = extendOptions.name || Super.options.name;
    if (process.env.NODE_ENV !== 'production') {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        warn('Invalid component name: "' + name + '". Component names ' + 'can only contain alphanumeric characaters and the hyphen.');
        name = null;
      }
    }
    var Sub = createClass(name || 'VueComponent');
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(Super.options, extendOptions);
    Sub['super'] = Super;
    // allow further extension
    Sub.extend = Super.extend;
    // create asset registers, so extended classes
    // can have their private assets too.
    config._assetTypes.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }
    // cache constructor
    if (isFirstExtend) {
      extendOptions._Ctor = Sub;
    }
    return Sub;
  };

  /**
   * A function that returns a sub-class constructor with the
   * given name. This gives us much nicer output when
   * logging instances in the console.
   *
   * @param {String} name
   * @return {Function}
   */

  function createClass(name) {
    /* eslint-disable no-new-func */
    return new Function('return function ' + classify(name) + ' (options) { this._init(options) }')();
    /* eslint-enable no-new-func */
  }

  /**
   * Plugin system
   *
   * @param {Object} plugin
   */

  Vue.use = function (plugin) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return;
    }
    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else {
      plugin.apply(null, args);
    }
    plugin.installed = true;
    return this;
  };

  /**
   * Apply a global mixin by merging it into the default
   * options.
   */

  Vue.mixin = function (mixin) {
    Vue.options = mergeOptions(Vue.options, mixin);
  };

  /**
   * Create asset registration methods with the following
   * signature:
   *
   * @param {String} id
   * @param {*} definition
   */

  config._assetTypes.forEach(function (type) {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id];
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          if (type === 'component' && (commonTagRE.test(id) || reservedTagRE.test(id))) {
            warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + id);
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = id;
          definition = Vue.extend(definition);
        }
        this.options[type + 's'][id] = definition;
        return definition;
      }
    };
  });

  // expose internal transition API
  extend(Vue.transition, transition);
}

installGlobalAPI(Vue);

Vue.version = '1.0.24';

// devtools global hook
/* istanbul ignore next */
setTimeout(function () {
  if (config.devtools) {
    if (devtools) {
      devtools.emit('init', Vue);
    } else if (process.env.NODE_ENV !== 'production' && inBrowser && /Chrome\/\d+/.test(window.navigator.userAgent)) {
      console.log('Download the Vue Devtools for a better development experience:\n' + 'https://github.com/vuejs/vue-devtools');
    }
  }
}, 0);

module.exports = Vue;
}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/vue/dist/vue.common.js","/../../node_modules/vue/dist")
},{"buffer":2,"oMfpAn":5}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYWhhbGwvUmVwb3MvZGFzaGJlcnJ5LXBpL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9qYWhhbGwvUmVwb3MvZGFzaGJlcnJ5LXBpL2NsaWVudC9qcy9mYWtlXzZiYmVkZjViLmpzIiwiL1VzZXJzL2phaGFsbC9SZXBvcy9kYXNoYmVycnktcGkvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiL1VzZXJzL2phaGFsbC9SZXBvcy9kYXNoYmVycnktcGkvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIi9Vc2Vycy9qYWhhbGwvUmVwb3MvZGFzaGJlcnJ5LXBpL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIi9Vc2Vycy9qYWhhbGwvUmVwb3MvZGFzaGJlcnJ5LXBpL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9qYWhhbGwvUmVwb3MvZGFzaGJlcnJ5LXBpL25vZGVfbW9kdWxlcy92dWUvZGlzdC92dWUuY29tbW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2bENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbndpbmRvdy5WdWUgPSByZXF1aXJlKCd2dWUnKTtcblxudmFyIGFwaVVSTCA9ICdodHRwczovL2FwaS5naXRodWIuY29tL3JlcG9zL3Z1ZWpzL3Z1ZS9jb21taXRzP3Blcl9wYWdlPTMmc2hhPSdcblxudmFyIHNvY2tldCA9IGlvLmNvbm5lY3QoKTtcbnNvY2tldC5vbignY2hvcmVzJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgY29uc29sZS5sb2coZGF0YSk7XG4gIHNvY2tldC5lbWl0KCdteSBvdGhlciBldmVudCcsIHsgbXk6ICdkYXRhJyB9KTtcbn0pO1xuXG52YXIgc29ja2V0O1xudmFyIGNvbm5lY3RlZD1mYWxzZTtcblxud2luZG93LnNldEZvY3VzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpZnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImthbGxlbmRlclwiKTtcbiAgaWZyYW1lLmNvbnRlbnRXaW5kb3cuZm9jdXMoKTtcbn1cblxuLy8gZGVtbyBjb2RlXG52YXIgZGVtbyA9IG5ldyBWdWUoe1xuXG4gIGVsOiAnI2RlbW8nLFxuXG4gIGRhdGE6IHtcbiAgICBicmFuY2hlczogWydtYXN0ZXInLCAnZGV2J10sXG4gICAgY3VycmVudEJyYW5jaDogJ21hc3RlcicsXG4gICAgY29tbWl0czogbnVsbFxuICB9LFxuXG4gIGNyZWF0ZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZldGNoRGF0YSgpXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBjdXJyZW50QnJhbmNoOiAnZmV0Y2hEYXRhJ1xuICB9LFxuXG4gIGZpbHRlcnM6IHtcbiAgICB0cnVuY2F0ZTogZnVuY3Rpb24gKHYpIHtcbiAgICAgIHZhciBuZXdsaW5lID0gdi5pbmRleE9mKCdcXG4nKVxuICAgICAgcmV0dXJuIG5ld2xpbmUgPiAwID8gdi5zbGljZSgwLCBuZXdsaW5lKSA6IHZcbiAgICB9LFxuICAgIGZvcm1hdERhdGU6IGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gdi5yZXBsYWNlKC9UfFovZywgJyAnKVxuICAgIH1cbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZmV0Y2hEYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgeGhyLm9wZW4oJ0dFVCcsIGFwaVVSTCArIHNlbGYuY3VycmVudEJyYW5jaClcbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuY29tbWl0cyA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dClcbiAgICAgIH1cbiAgICAgIHhoci5zZW5kKClcbiAgICB9XG4gIH1cbn0pXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZmFrZV82YmJlZGY1Yi5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcblxuLyoqXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChjb21wYXRpYmxlIGRvd24gdG8gSUU2KVxuICovXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgLy8gRGV0ZWN0IGlmIGJyb3dzZXIgc3VwcG9ydHMgVHlwZWQgQXJyYXlzLiBTdXBwb3J0ZWQgYnJvd3NlcnMgYXJlIElFIDEwKywgRmlyZWZveCA0KyxcbiAgLy8gQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLiBJZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZGluZ1xuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XG4gIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBiZSBhYmxlIHRvIGFkZCBhbGwgdGhlIG5vZGUgQnVmZmVyIEFQSSBtZXRob2RzLiBUaGlzIGlzIGFuIGlzc3VlXG4gIC8vIGluIEZpcmVmb3ggNC0yOS4gTm93IGZpeGVkOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcbiAgdHJ5IHtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDApXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIHJldHVybiA0MiA9PT0gYXJyLmZvbygpICYmXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxuICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnICYmIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArICc9J1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxuICB2YXIgbGVuZ3RoXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXG4gICAgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYnVmID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcbiAgICBidWYgPSB0aGlzXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgaVxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiB0eXBlb2Ygc3ViamVjdC5ieXRlTGVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XG4gICAgYnVmLl9zZXQoc3ViamVjdClcbiAgfSBlbHNlIGlmIChpc0FycmF5aXNoKHN1YmplY3QpKSB7XG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxuICAgICAgZWxzZVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0W2ldXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgYnVmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbi8vIFNUQVRJQyBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcbiAgcmV0dXJuICEhKGIgIT09IG51bGwgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XG4gIHZhciByZXRcbiAgc3RyID0gc3RyICsgJydcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXG4gICAgICAnbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gYnl0ZVxuICB9XG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gX3V0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXG4gIGVuZCA9IChlbmQgIT09IHVuZGVmaW5lZClcbiAgICA/IE51bWJlcihlbmQpXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxuXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXG4gICAgcmV0dXJuICcnXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpc1xuXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAobGVuIDwgMTAwIHx8ICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXMgPSAnJ1xuICB2YXIgdG1wID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICAgICAgdG1wID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxufVxuXG5mdW5jdGlvbiBfYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2krMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcblxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxuICB9IGVsc2Uge1xuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDJdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cbiAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldF0gPDwgMjQgPj4+IDApXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDAwMDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEZsb2F0IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZilcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVyblxuXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgdGhpcy53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MTYoYnVmLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxuICB9XG5cbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gdGhpcy5sZW5ndGgsICdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0aGlzW2ldID0gdmFsdWVcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXQgPSBbXVxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXG4gICAgaWYgKGkgPT09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlCdWZmZXJgIHdpdGggdGhlICpjb3BpZWQqIG1lbW9yeSBvZiB0aGUgYnVmZmVyIGluc3RhbmNlLlxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXG4gKi9cbkJ1ZmZlci5wcm90b3R5cGUudG9BcnJheUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKVxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcbiAgfVxufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcblxuLyoqXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXG4gKi9cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXG5mdW5jdGlvbiBjbGFtcCAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgaW5kZXggKz0gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGhcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoc3ViamVjdCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0pKHN1YmplY3QpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGlmIChiIDw9IDB4N0YpXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcbiAgICBlbHNlIHtcbiAgICAgIHZhciBzdGFydCA9IGlcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIHBvc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuLypcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XG4gKiBpcyBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdFxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHZlcmlmdWludCAodmFsdWUsIG1heCkge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnNpbnQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxufVxuXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcbiAgaWYgKCF0ZXN0KSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnRmFpbGVkIGFzc2VydGlvbicpXG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYlwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbmV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaWVlZTc1NFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3NcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiFcbiAqIFZ1ZS5qcyB2MS4wLjI0XG4gKiAoYykgMjAxNiBFdmFuIFlvdVxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHNldChvYmosIGtleSwgdmFsKSB7XG4gIGlmIChoYXNPd24ob2JqLCBrZXkpKSB7XG4gICAgb2JqW2tleV0gPSB2YWw7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChvYmouX2lzVnVlKSB7XG4gICAgc2V0KG9iai5fZGF0YSwga2V5LCB2YWwpO1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgb2IgPSBvYmouX19vYl9fO1xuICBpZiAoIW9iKSB7XG4gICAgb2JqW2tleV0gPSB2YWw7XG4gICAgcmV0dXJuO1xuICB9XG4gIG9iLmNvbnZlcnQoa2V5LCB2YWwpO1xuICBvYi5kZXAubm90aWZ5KCk7XG4gIGlmIChvYi52bXMpIHtcbiAgICB2YXIgaSA9IG9iLnZtcy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdmFyIHZtID0gb2Iudm1zW2ldO1xuICAgICAgdm0uX3Byb3h5KGtleSk7XG4gICAgICB2bS5fZGlnZXN0KCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB2YWw7XG59XG5cbi8qKlxuICogRGVsZXRlIGEgcHJvcGVydHkgYW5kIHRyaWdnZXIgY2hhbmdlIGlmIG5lY2Vzc2FyeS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKi9cblxuZnVuY3Rpb24gZGVsKG9iaiwga2V5KSB7XG4gIGlmICghaGFzT3duKG9iaiwga2V5KSkge1xuICAgIHJldHVybjtcbiAgfVxuICBkZWxldGUgb2JqW2tleV07XG4gIHZhciBvYiA9IG9iai5fX29iX187XG4gIGlmICghb2IpIHtcbiAgICBpZiAob2JqLl9pc1Z1ZSkge1xuICAgICAgZGVsZXRlIG9iai5fZGF0YVtrZXldO1xuICAgICAgb2JqLl9kaWdlc3QoKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG4gIG9iLmRlcC5ub3RpZnkoKTtcbiAgaWYgKG9iLnZtcykge1xuICAgIHZhciBpID0gb2Iudm1zLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB2YXIgdm0gPSBvYi52bXNbaV07XG4gICAgICB2bS5fdW5wcm94eShrZXkpO1xuICAgICAgdm0uX2RpZ2VzdCgpO1xuICAgIH1cbiAgfVxufVxuXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBvYmplY3QgaGFzIHRoZSBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGhhc093bihvYmosIGtleSkge1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYW4gZXhwcmVzc2lvbiBpcyBhIGxpdGVyYWwgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV4cFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG52YXIgbGl0ZXJhbFZhbHVlUkUgPSAvXlxccz8odHJ1ZXxmYWxzZXwtP1tcXGRcXC5dK3wnW14nXSonfFwiW15cIl0qXCIpXFxzPyQvO1xuXG5mdW5jdGlvbiBpc0xpdGVyYWwoZXhwKSB7XG4gIHJldHVybiBsaXRlcmFsVmFsdWVSRS50ZXN0KGV4cCk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBzdHJpbmcgc3RhcnRzIHdpdGggJCBvciBfXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc1Jlc2VydmVkKHN0cikge1xuICB2YXIgYyA9IChzdHIgKyAnJykuY2hhckNvZGVBdCgwKTtcbiAgcmV0dXJuIGMgPT09IDB4MjQgfHwgYyA9PT0gMHg1Rjtcbn1cblxuLyoqXG4gKiBHdWFyZCB0ZXh0IG91dHB1dCwgbWFrZSBzdXJlIHVuZGVmaW5lZCBvdXRwdXRzXG4gKiBlbXB0eSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gX3RvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsID8gJycgOiB2YWx1ZS50b1N0cmluZygpO1xufVxuXG4vKipcbiAqIENoZWNrIGFuZCBjb252ZXJ0IHBvc3NpYmxlIG51bWVyaWMgc3RyaW5ncyB0byBudW1iZXJzXG4gKiBiZWZvcmUgc2V0dGluZyBiYWNrIHRvIGRhdGFcbiAqXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJuIHsqfE51bWJlcn1cbiAqL1xuXG5mdW5jdGlvbiB0b051bWJlcih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFyc2VkID0gTnVtYmVyKHZhbHVlKTtcbiAgICByZXR1cm4gaXNOYU4ocGFyc2VkKSA/IHZhbHVlIDogcGFyc2VkO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydCBzdHJpbmcgYm9vbGVhbiBsaXRlcmFscyBpbnRvIHJlYWwgYm9vbGVhbnMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybiB7KnxCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIHRvQm9vbGVhbih2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09ICd0cnVlJyA/IHRydWUgOiB2YWx1ZSA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogdmFsdWU7XG59XG5cbi8qKlxuICogU3RyaXAgcXVvdGVzIGZyb20gYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmcgfCBmYWxzZX1cbiAqL1xuXG5mdW5jdGlvbiBzdHJpcFF1b3RlcyhzdHIpIHtcbiAgdmFyIGEgPSBzdHIuY2hhckNvZGVBdCgwKTtcbiAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChzdHIubGVuZ3RoIC0gMSk7XG4gIHJldHVybiBhID09PSBiICYmIChhID09PSAweDIyIHx8IGEgPT09IDB4MjcpID8gc3RyLnNsaWNlKDEsIC0xKSA6IHN0cjtcbn1cblxuLyoqXG4gKiBDYW1lbGl6ZSBhIGh5cGhlbi1kZWxtaXRlZCBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbnZhciBjYW1lbGl6ZVJFID0gLy0oXFx3KS9nO1xuXG5mdW5jdGlvbiBjYW1lbGl6ZShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKGNhbWVsaXplUkUsIHRvVXBwZXIpO1xufVxuXG5mdW5jdGlvbiB0b1VwcGVyKF8sIGMpIHtcbiAgcmV0dXJuIGMgPyBjLnRvVXBwZXJDYXNlKCkgOiAnJztcbn1cblxuLyoqXG4gKiBIeXBoZW5hdGUgYSBjYW1lbENhc2Ugc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG52YXIgaHlwaGVuYXRlUkUgPSAvKFthLXpcXGRdKShbQS1aXSkvZztcblxuZnVuY3Rpb24gaHlwaGVuYXRlKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoaHlwaGVuYXRlUkUsICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cbi8qKlxuICogQ29udmVydHMgaHlwaGVuL3VuZGVyc2NvcmUvc2xhc2ggZGVsaW1pdGVyZWQgbmFtZXMgaW50b1xuICogY2FtZWxpemVkIGNsYXNzTmFtZXMuXG4gKlxuICogZS5nLiBteS1jb21wb25lbnQgPT4gTXlDb21wb25lbnRcbiAqICAgICAgc29tZV9lbHNlICAgID0+IFNvbWVFbHNlXG4gKiAgICAgIHNvbWUvY29tcCAgICA9PiBTb21lQ29tcFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG52YXIgY2xhc3NpZnlSRSA9IC8oPzpefFstX1xcL10pKFxcdykvZztcblxuZnVuY3Rpb24gY2xhc3NpZnkoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShjbGFzc2lmeVJFLCB0b1VwcGVyKTtcbn1cblxuLyoqXG4gKiBTaW1wbGUgYmluZCwgZmFzdGVyIHRoYW4gbmF0aXZlXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjdHhcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIGJpbmQoZm4sIGN0eCkge1xuICByZXR1cm4gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgbCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgcmV0dXJuIGwgPyBsID4gMSA/IGZuLmFwcGx5KGN0eCwgYXJndW1lbnRzKSA6IGZuLmNhbGwoY3R4LCBhKSA6IGZuLmNhbGwoY3R4KTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGFuIEFycmF5LWxpa2Ugb2JqZWN0IHRvIGEgcmVhbCBBcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5LWxpa2V9IGxpc3RcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc3RhcnRdIC0gc3RhcnQgaW5kZXhcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIHRvQXJyYXkobGlzdCwgc3RhcnQpIHtcbiAgc3RhcnQgPSBzdGFydCB8fCAwO1xuICB2YXIgaSA9IGxpc3QubGVuZ3RoIC0gc3RhcnQ7XG4gIHZhciByZXQgPSBuZXcgQXJyYXkoaSk7XG4gIHdoaWxlIChpLS0pIHtcbiAgICByZXRbaV0gPSBsaXN0W2kgKyBzdGFydF07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBNaXggcHJvcGVydGllcyBpbnRvIHRhcmdldCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHRvXG4gKiBAcGFyYW0ge09iamVjdH0gZnJvbVxuICovXG5cbmZ1bmN0aW9uIGV4dGVuZCh0bywgZnJvbSkge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGZyb20pO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgdG9ba2V5c1tpXV0gPSBmcm9tW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiB0bztcbn1cblxuLyoqXG4gKiBRdWljayBvYmplY3QgY2hlY2sgLSB0aGlzIGlzIHByaW1hcmlseSB1c2VkIHRvIHRlbGxcbiAqIE9iamVjdHMgZnJvbSBwcmltaXRpdmUgdmFsdWVzIHdoZW4gd2Uga25vdyB0aGUgdmFsdWVcbiAqIGlzIGEgSlNPTi1jb21wbGlhbnQgdHlwZS5cbiAqXG4gKiBAcGFyYW0geyp9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG9iaiAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBTdHJpY3Qgb2JqZWN0IHR5cGUgY2hlY2suIE9ubHkgcmV0dXJucyB0cnVlXG4gKiBmb3IgcGxhaW4gSmF2YVNjcmlwdCBvYmplY3RzLlxuICpcbiAqIEBwYXJhbSB7Kn0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgT0JKRUNUX1NUUklORyA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSBPQkpFQ1RfU1RSSU5HO1xufVxuXG4vKipcbiAqIEFycmF5IHR5cGUgY2hlY2suXG4gKlxuICogQHBhcmFtIHsqfSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG4vKipcbiAqIERlZmluZSBhIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtlbnVtZXJhYmxlXVxuICovXG5cbmZ1bmN0aW9uIGRlZihvYmosIGtleSwgdmFsLCBlbnVtZXJhYmxlKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgIHZhbHVlOiB2YWwsXG4gICAgZW51bWVyYWJsZTogISFlbnVtZXJhYmxlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbn1cblxuLyoqXG4gKiBEZWJvdW5jZSBhIGZ1bmN0aW9uIHNvIGl0IG9ubHkgZ2V0cyBjYWxsZWQgYWZ0ZXIgdGhlXG4gKiBpbnB1dCBzdG9wcyBhcnJpdmluZyBhZnRlciB0aGUgZ2l2ZW4gd2FpdCBwZXJpb2QuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuY1xuICogQHBhcmFtIHtOdW1iZXJ9IHdhaXRcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSAtIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb25cbiAqL1xuXG5mdW5jdGlvbiBfZGVib3VuY2UoZnVuYywgd2FpdCkge1xuICB2YXIgdGltZW91dCwgYXJncywgY29udGV4dCwgdGltZXN0YW1wLCByZXN1bHQ7XG4gIHZhciBsYXRlciA9IGZ1bmN0aW9uIGxhdGVyKCkge1xuICAgIHZhciBsYXN0ID0gRGF0ZS5ub3coKSAtIHRpbWVzdGFtcDtcbiAgICBpZiAobGFzdCA8IHdhaXQgJiYgbGFzdCA+PSAwKSB7XG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICB9XG4gIH07XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgY29udGV4dCA9IHRoaXM7XG4gICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICB0aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuICAgIGlmICghdGltZW91dCkge1xuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG4vKipcbiAqIE1hbnVhbCBpbmRleE9mIGJlY2F1c2UgaXQncyBzbGlnaHRseSBmYXN0ZXIgdGhhblxuICogbmF0aXZlLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHBhcmFtIHsqfSBvYmpcbiAqL1xuXG5mdW5jdGlvbiBpbmRleE9mKGFyciwgb2JqKSB7XG4gIHZhciBpID0gYXJyLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIGlmIChhcnJbaV0gPT09IG9iaikgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIE1ha2UgYSBjYW5jZWxsYWJsZSB2ZXJzaW9uIG9mIGFuIGFzeW5jIGNhbGxiYWNrLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBjYW5jZWxsYWJsZShmbikge1xuICB2YXIgY2IgPSBmdW5jdGlvbiBjYigpIHtcbiAgICBpZiAoIWNiLmNhbmNlbGxlZCkge1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9O1xuICBjYi5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgY2IuY2FuY2VsbGVkID0gdHJ1ZTtcbiAgfTtcbiAgcmV0dXJuIGNiO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHR3byB2YWx1ZXMgYXJlIGxvb3NlbHkgZXF1YWwgLSB0aGF0IGlzLFxuICogaWYgdGhleSBhcmUgcGxhaW4gb2JqZWN0cywgZG8gdGhleSBoYXZlIHRoZSBzYW1lIHNoYXBlP1xuICpcbiAqIEBwYXJhbSB7Kn0gYVxuICogQHBhcmFtIHsqfSBiXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGxvb3NlRXF1YWwoYSwgYikge1xuICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cbiAgcmV0dXJuIGEgPT0gYiB8fCAoaXNPYmplY3QoYSkgJiYgaXNPYmplY3QoYikgPyBKU09OLnN0cmluZ2lmeShhKSA9PT0gSlNPTi5zdHJpbmdpZnkoYikgOiBmYWxzZSk7XG4gIC8qIGVzbGludC1lbmFibGUgZXFlcWVxICovXG59XG5cbnZhciBoYXNQcm90byA9ICgnX19wcm90b19fJyBpbiB7fSk7XG5cbi8vIEJyb3dzZXIgZW52aXJvbm1lbnQgc25pZmZpbmdcbnZhciBpbkJyb3dzZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwod2luZG93KSAhPT0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbi8vIGRldGVjdCBkZXZ0b29sc1xudmFyIGRldnRvb2xzID0gaW5Ccm93c2VyICYmIHdpbmRvdy5fX1ZVRV9ERVZUT09MU19HTE9CQUxfSE9PS19fO1xuXG4vLyBVQSBzbmlmZmluZyBmb3Igd29ya2luZyBhcm91bmQgYnJvd3Nlci1zcGVjaWZpYyBxdWlya3NcbnZhciBVQSA9IGluQnJvd3NlciAmJiB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xudmFyIGlzSUU5ID0gVUEgJiYgVUEuaW5kZXhPZignbXNpZSA5LjAnKSA+IDA7XG52YXIgaXNBbmRyb2lkID0gVUEgJiYgVUEuaW5kZXhPZignYW5kcm9pZCcpID4gMDtcbnZhciBpc0lvcyA9IFVBICYmIC8oaXBob25lfGlwYWR8aXBvZHxpb3MpL2kudGVzdChVQSk7XG52YXIgaXNXZWNoYXQgPSBVQSAmJiBVQS5pbmRleE9mKCdtaWNyb21lc3NlbmdlcicpID4gMDtcblxudmFyIHRyYW5zaXRpb25Qcm9wID0gdW5kZWZpbmVkO1xudmFyIHRyYW5zaXRpb25FbmRFdmVudCA9IHVuZGVmaW5lZDtcbnZhciBhbmltYXRpb25Qcm9wID0gdW5kZWZpbmVkO1xudmFyIGFuaW1hdGlvbkVuZEV2ZW50ID0gdW5kZWZpbmVkO1xuXG4vLyBUcmFuc2l0aW9uIHByb3BlcnR5L2V2ZW50IHNuaWZmaW5nXG5pZiAoaW5Ccm93c2VyICYmICFpc0lFOSkge1xuICB2YXIgaXNXZWJraXRUcmFucyA9IHdpbmRvdy5vbnRyYW5zaXRpb25lbmQgPT09IHVuZGVmaW5lZCAmJiB3aW5kb3cub253ZWJraXR0cmFuc2l0aW9uZW5kICE9PSB1bmRlZmluZWQ7XG4gIHZhciBpc1dlYmtpdEFuaW0gPSB3aW5kb3cub25hbmltYXRpb25lbmQgPT09IHVuZGVmaW5lZCAmJiB3aW5kb3cub253ZWJraXRhbmltYXRpb25lbmQgIT09IHVuZGVmaW5lZDtcbiAgdHJhbnNpdGlvblByb3AgPSBpc1dlYmtpdFRyYW5zID8gJ1dlYmtpdFRyYW5zaXRpb24nIDogJ3RyYW5zaXRpb24nO1xuICB0cmFuc2l0aW9uRW5kRXZlbnQgPSBpc1dlYmtpdFRyYW5zID8gJ3dlYmtpdFRyYW5zaXRpb25FbmQnIDogJ3RyYW5zaXRpb25lbmQnO1xuICBhbmltYXRpb25Qcm9wID0gaXNXZWJraXRBbmltID8gJ1dlYmtpdEFuaW1hdGlvbicgOiAnYW5pbWF0aW9uJztcbiAgYW5pbWF0aW9uRW5kRXZlbnQgPSBpc1dlYmtpdEFuaW0gPyAnd2Via2l0QW5pbWF0aW9uRW5kJyA6ICdhbmltYXRpb25lbmQnO1xufVxuXG4vKipcbiAqIERlZmVyIGEgdGFzayB0byBleGVjdXRlIGl0IGFzeW5jaHJvbm91c2x5LiBJZGVhbGx5IHRoaXNcbiAqIHNob3VsZCBiZSBleGVjdXRlZCBhcyBhIG1pY3JvdGFzaywgc28gd2UgbGV2ZXJhZ2VcbiAqIE11dGF0aW9uT2JzZXJ2ZXIgaWYgaXQncyBhdmFpbGFibGUsIGFuZCBmYWxsYmFjayB0b1xuICogc2V0VGltZW91dCgwKS5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYlxuICogQHBhcmFtIHtPYmplY3R9IGN0eFxuICovXG5cbnZhciBuZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBjYWxsYmFja3MgPSBbXTtcbiAgdmFyIHBlbmRpbmcgPSBmYWxzZTtcbiAgdmFyIHRpbWVyRnVuYztcbiAgZnVuY3Rpb24gbmV4dFRpY2tIYW5kbGVyKCkge1xuICAgIHBlbmRpbmcgPSBmYWxzZTtcbiAgICB2YXIgY29waWVzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGNhbGxiYWNrcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29waWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb3BpZXNbaV0oKTtcbiAgICB9XG4gIH1cblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKHR5cGVvZiBNdXRhdGlvbk9ic2VydmVyICE9PSAndW5kZWZpbmVkJyAmJiAhKGlzV2VjaGF0ICYmIGlzSW9zKSkge1xuICAgIHZhciBjb3VudGVyID0gMTtcbiAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihuZXh0VGlja0hhbmRsZXIpO1xuICAgIHZhciB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNvdW50ZXIpO1xuICAgIG9ic2VydmVyLm9ic2VydmUodGV4dE5vZGUsIHtcbiAgICAgIGNoYXJhY3RlckRhdGE6IHRydWVcbiAgICB9KTtcbiAgICB0aW1lckZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjb3VudGVyID0gKGNvdW50ZXIgKyAxKSAlIDI7XG4gICAgICB0ZXh0Tm9kZS5kYXRhID0gY291bnRlcjtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIC8vIHdlYnBhY2sgYXR0ZW1wdHMgdG8gaW5qZWN0IGEgc2hpbSBmb3Igc2V0SW1tZWRpYXRlXG4gICAgLy8gaWYgaXQgaXMgdXNlZCBhcyBhIGdsb2JhbCwgc28gd2UgaGF2ZSB0byB3b3JrIGFyb3VuZCB0aGF0IHRvXG4gICAgLy8gYXZvaWQgYnVuZGxpbmcgdW5uZWNlc3NhcnkgY29kZS5cbiAgICB2YXIgY29udGV4dCA9IGluQnJvd3NlciA/IHdpbmRvdyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDoge307XG4gICAgdGltZXJGdW5jID0gY29udGV4dC5zZXRJbW1lZGlhdGUgfHwgc2V0VGltZW91dDtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKGNiLCBjdHgpIHtcbiAgICB2YXIgZnVuYyA9IGN0eCA/IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNiLmNhbGwoY3R4KTtcbiAgICB9IDogY2I7XG4gICAgY2FsbGJhY2tzLnB1c2goZnVuYyk7XG4gICAgaWYgKHBlbmRpbmcpIHJldHVybjtcbiAgICBwZW5kaW5nID0gdHJ1ZTtcbiAgICB0aW1lckZ1bmMobmV4dFRpY2tIYW5kbGVyLCAwKTtcbiAgfTtcbn0pKCk7XG5cbnZhciBfU2V0ID0gdW5kZWZpbmVkO1xuLyogaXN0YW5idWwgaWdub3JlIGlmICovXG5pZiAodHlwZW9mIFNldCAhPT0gJ3VuZGVmaW5lZCcgJiYgU2V0LnRvU3RyaW5nKCkubWF0Y2goL25hdGl2ZSBjb2RlLykpIHtcbiAgLy8gdXNlIG5hdGl2ZSBTZXQgd2hlbiBhdmFpbGFibGUuXG4gIF9TZXQgPSBTZXQ7XG59IGVsc2Uge1xuICAvLyBhIG5vbi1zdGFuZGFyZCBTZXQgcG9seWZpbGwgdGhhdCBvbmx5IHdvcmtzIHdpdGggcHJpbWl0aXZlIGtleXMuXG4gIF9TZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB9O1xuICBfU2V0LnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0W2tleV0gIT09IHVuZGVmaW5lZDtcbiAgfTtcbiAgX1NldC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHRoaXMuc2V0W2tleV0gPSAxO1xuICB9O1xuICBfU2V0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIENhY2hlKGxpbWl0KSB7XG4gIHRoaXMuc2l6ZSA9IDA7XG4gIHRoaXMubGltaXQgPSBsaW1pdDtcbiAgdGhpcy5oZWFkID0gdGhpcy50YWlsID0gdW5kZWZpbmVkO1xuICB0aGlzLl9rZXltYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xufVxuXG52YXIgcCA9IENhY2hlLnByb3RvdHlwZTtcblxuLyoqXG4gKiBQdXQgPHZhbHVlPiBpbnRvIHRoZSBjYWNoZSBhc3NvY2lhdGVkIHdpdGggPGtleT4uXG4gKiBSZXR1cm5zIHRoZSBlbnRyeSB3aGljaCB3YXMgcmVtb3ZlZCB0byBtYWtlIHJvb20gZm9yXG4gKiB0aGUgbmV3IGVudHJ5LiBPdGhlcndpc2UgdW5kZWZpbmVkIGlzIHJldHVybmVkLlxuICogKGkuZS4gaWYgdGhlcmUgd2FzIGVub3VnaCByb29tIGFscmVhZHkpLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge0VudHJ5fHVuZGVmaW5lZH1cbiAqL1xuXG5wLnB1dCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHZhciByZW1vdmVkO1xuICBpZiAodGhpcy5zaXplID09PSB0aGlzLmxpbWl0KSB7XG4gICAgcmVtb3ZlZCA9IHRoaXMuc2hpZnQoKTtcbiAgfVxuXG4gIHZhciBlbnRyeSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gIGlmICghZW50cnkpIHtcbiAgICBlbnRyeSA9IHtcbiAgICAgIGtleToga2V5XG4gICAgfTtcbiAgICB0aGlzLl9rZXltYXBba2V5XSA9IGVudHJ5O1xuICAgIGlmICh0aGlzLnRhaWwpIHtcbiAgICAgIHRoaXMudGFpbC5uZXdlciA9IGVudHJ5O1xuICAgICAgZW50cnkub2xkZXIgPSB0aGlzLnRhaWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGVhZCA9IGVudHJ5O1xuICAgIH1cbiAgICB0aGlzLnRhaWwgPSBlbnRyeTtcbiAgICB0aGlzLnNpemUrKztcbiAgfVxuICBlbnRyeS52YWx1ZSA9IHZhbHVlO1xuXG4gIHJldHVybiByZW1vdmVkO1xufTtcblxuLyoqXG4gKiBQdXJnZSB0aGUgbGVhc3QgcmVjZW50bHkgdXNlZCAob2xkZXN0KSBlbnRyeSBmcm9tIHRoZVxuICogY2FjaGUuIFJldHVybnMgdGhlIHJlbW92ZWQgZW50cnkgb3IgdW5kZWZpbmVkIGlmIHRoZVxuICogY2FjaGUgd2FzIGVtcHR5LlxuICovXG5cbnAuc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlbnRyeSA9IHRoaXMuaGVhZDtcbiAgaWYgKGVudHJ5KSB7XG4gICAgdGhpcy5oZWFkID0gdGhpcy5oZWFkLm5ld2VyO1xuICAgIHRoaXMuaGVhZC5vbGRlciA9IHVuZGVmaW5lZDtcbiAgICBlbnRyeS5uZXdlciA9IGVudHJ5Lm9sZGVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2tleW1hcFtlbnRyeS5rZXldID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc2l6ZS0tO1xuICB9XG4gIHJldHVybiBlbnRyeTtcbn07XG5cbi8qKlxuICogR2V0IGFuZCByZWdpc3RlciByZWNlbnQgdXNlIG9mIDxrZXk+LiBSZXR1cm5zIHRoZSB2YWx1ZVxuICogYXNzb2NpYXRlZCB3aXRoIDxrZXk+IG9yIHVuZGVmaW5lZCBpZiBub3QgaW4gY2FjaGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtCb29sZWFufSByZXR1cm5FbnRyeVxuICogQHJldHVybiB7RW50cnl8Kn1cbiAqL1xuXG5wLmdldCA9IGZ1bmN0aW9uIChrZXksIHJldHVybkVudHJ5KSB7XG4gIHZhciBlbnRyeSA9IHRoaXMuX2tleW1hcFtrZXldO1xuICBpZiAoZW50cnkgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICBpZiAoZW50cnkgPT09IHRoaXMudGFpbCkge1xuICAgIHJldHVybiByZXR1cm5FbnRyeSA/IGVudHJ5IDogZW50cnkudmFsdWU7XG4gIH1cbiAgLy8gSEVBRC0tLS0tLS0tLS0tLS0tVEFJTFxuICAvLyAgIDwub2xkZXIgICAubmV3ZXI+XG4gIC8vICA8LS0tIGFkZCBkaXJlY3Rpb24gLS1cbiAgLy8gICBBICBCICBDICA8RD4gIEVcbiAgaWYgKGVudHJ5Lm5ld2VyKSB7XG4gICAgaWYgKGVudHJ5ID09PSB0aGlzLmhlYWQpIHtcbiAgICAgIHRoaXMuaGVhZCA9IGVudHJ5Lm5ld2VyO1xuICAgIH1cbiAgICBlbnRyeS5uZXdlci5vbGRlciA9IGVudHJ5Lm9sZGVyOyAvLyBDIDwtLSBFLlxuICB9XG4gIGlmIChlbnRyeS5vbGRlcikge1xuICAgIGVudHJ5Lm9sZGVyLm5ld2VyID0gZW50cnkubmV3ZXI7IC8vIEMuIC0tPiBFXG4gIH1cbiAgZW50cnkubmV3ZXIgPSB1bmRlZmluZWQ7IC8vIEQgLS14XG4gIGVudHJ5Lm9sZGVyID0gdGhpcy50YWlsOyAvLyBELiAtLT4gRVxuICBpZiAodGhpcy50YWlsKSB7XG4gICAgdGhpcy50YWlsLm5ld2VyID0gZW50cnk7IC8vIEUuIDwtLSBEXG4gIH1cbiAgdGhpcy50YWlsID0gZW50cnk7XG4gIHJldHVybiByZXR1cm5FbnRyeSA/IGVudHJ5IDogZW50cnkudmFsdWU7XG59O1xuXG52YXIgY2FjaGUkMSA9IG5ldyBDYWNoZSgxMDAwKTtcbnZhciBmaWx0ZXJUb2tlblJFID0gL1teXFxzJ1wiXSt8J1teJ10qJ3xcIlteXCJdKlwiL2c7XG52YXIgcmVzZXJ2ZWRBcmdSRSA9IC9eaW4kfF4tP1xcZCsvO1xuXG4vKipcbiAqIFBhcnNlciBzdGF0ZVxuICovXG5cbnZhciBzdHI7XG52YXIgZGlyO1xudmFyIGM7XG52YXIgcHJldjtcbnZhciBpO1xudmFyIGw7XG52YXIgbGFzdEZpbHRlckluZGV4O1xudmFyIGluU2luZ2xlO1xudmFyIGluRG91YmxlO1xudmFyIGN1cmx5O1xudmFyIHNxdWFyZTtcbnZhciBwYXJlbjtcbi8qKlxuICogUHVzaCBhIGZpbHRlciB0byB0aGUgY3VycmVudCBkaXJlY3RpdmUgb2JqZWN0XG4gKi9cblxuZnVuY3Rpb24gcHVzaEZpbHRlcigpIHtcbiAgdmFyIGV4cCA9IHN0ci5zbGljZShsYXN0RmlsdGVySW5kZXgsIGkpLnRyaW0oKTtcbiAgdmFyIGZpbHRlcjtcbiAgaWYgKGV4cCkge1xuICAgIGZpbHRlciA9IHt9O1xuICAgIHZhciB0b2tlbnMgPSBleHAubWF0Y2goZmlsdGVyVG9rZW5SRSk7XG4gICAgZmlsdGVyLm5hbWUgPSB0b2tlbnNbMF07XG4gICAgaWYgKHRva2Vucy5sZW5ndGggPiAxKSB7XG4gICAgICBmaWx0ZXIuYXJncyA9IHRva2Vucy5zbGljZSgxKS5tYXAocHJvY2Vzc0ZpbHRlckFyZyk7XG4gICAgfVxuICB9XG4gIGlmIChmaWx0ZXIpIHtcbiAgICAoZGlyLmZpbHRlcnMgPSBkaXIuZmlsdGVycyB8fCBbXSkucHVzaChmaWx0ZXIpO1xuICB9XG4gIGxhc3RGaWx0ZXJJbmRleCA9IGkgKyAxO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGFuIGFyZ3VtZW50IGlzIGR5bmFtaWMgYW5kIHN0cmlwIHF1b3Rlcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYXJnXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gcHJvY2Vzc0ZpbHRlckFyZyhhcmcpIHtcbiAgaWYgKHJlc2VydmVkQXJnUkUudGVzdChhcmcpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiB0b051bWJlcihhcmcpLFxuICAgICAgZHluYW1pYzogZmFsc2VcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHZhciBzdHJpcHBlZCA9IHN0cmlwUXVvdGVzKGFyZyk7XG4gICAgdmFyIGR5bmFtaWMgPSBzdHJpcHBlZCA9PT0gYXJnO1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogZHluYW1pYyA/IGFyZyA6IHN0cmlwcGVkLFxuICAgICAgZHluYW1pYzogZHluYW1pY1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSBhIGRpcmVjdGl2ZSB2YWx1ZSBhbmQgZXh0cmFjdCB0aGUgZXhwcmVzc2lvblxuICogYW5kIGl0cyBmaWx0ZXJzIGludG8gYSBkZXNjcmlwdG9yLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogXCJhICsgMSB8IHVwcGVyY2FzZVwiIHdpbGwgeWllbGQ6XG4gKiB7XG4gKiAgIGV4cHJlc3Npb246ICdhICsgMScsXG4gKiAgIGZpbHRlcnM6IFtcbiAqICAgICB7IG5hbWU6ICd1cHBlcmNhc2UnLCBhcmdzOiBudWxsIH1cbiAqICAgXVxuICogfVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gcGFyc2VEaXJlY3RpdmUocykge1xuICB2YXIgaGl0ID0gY2FjaGUkMS5nZXQocyk7XG4gIGlmIChoaXQpIHtcbiAgICByZXR1cm4gaGl0O1xuICB9XG5cbiAgLy8gcmVzZXQgcGFyc2VyIHN0YXRlXG4gIHN0ciA9IHM7XG4gIGluU2luZ2xlID0gaW5Eb3VibGUgPSBmYWxzZTtcbiAgY3VybHkgPSBzcXVhcmUgPSBwYXJlbiA9IDA7XG4gIGxhc3RGaWx0ZXJJbmRleCA9IDA7XG4gIGRpciA9IHt9O1xuXG4gIGZvciAoaSA9IDAsIGwgPSBzdHIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgcHJldiA9IGM7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChpblNpbmdsZSkge1xuICAgICAgLy8gY2hlY2sgc2luZ2xlIHF1b3RlXG4gICAgICBpZiAoYyA9PT0gMHgyNyAmJiBwcmV2ICE9PSAweDVDKSBpblNpbmdsZSA9ICFpblNpbmdsZTtcbiAgICB9IGVsc2UgaWYgKGluRG91YmxlKSB7XG4gICAgICAvLyBjaGVjayBkb3VibGUgcXVvdGVcbiAgICAgIGlmIChjID09PSAweDIyICYmIHByZXYgIT09IDB4NUMpIGluRG91YmxlID0gIWluRG91YmxlO1xuICAgIH0gZWxzZSBpZiAoYyA9PT0gMHg3QyAmJiAvLyBwaXBlXG4gICAgc3RyLmNoYXJDb2RlQXQoaSArIDEpICE9PSAweDdDICYmIHN0ci5jaGFyQ29kZUF0KGkgLSAxKSAhPT0gMHg3Qykge1xuICAgICAgaWYgKGRpci5leHByZXNzaW9uID09IG51bGwpIHtcbiAgICAgICAgLy8gZmlyc3QgZmlsdGVyLCBlbmQgb2YgZXhwcmVzc2lvblxuICAgICAgICBsYXN0RmlsdGVySW5kZXggPSBpICsgMTtcbiAgICAgICAgZGlyLmV4cHJlc3Npb24gPSBzdHIuc2xpY2UoMCwgaSkudHJpbSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYWxyZWFkeSBoYXMgZmlsdGVyXG4gICAgICAgIHB1c2hGaWx0ZXIoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3dpdGNoIChjKSB7XG4gICAgICAgIGNhc2UgMHgyMjpcbiAgICAgICAgICBpbkRvdWJsZSA9IHRydWU7YnJlYWs7IC8vIFwiXG4gICAgICAgIGNhc2UgMHgyNzpcbiAgICAgICAgICBpblNpbmdsZSA9IHRydWU7YnJlYWs7IC8vICdcbiAgICAgICAgY2FzZSAweDI4OlxuICAgICAgICAgIHBhcmVuKys7YnJlYWs7IC8vIChcbiAgICAgICAgY2FzZSAweDI5OlxuICAgICAgICAgIHBhcmVuLS07YnJlYWs7IC8vIClcbiAgICAgICAgY2FzZSAweDVCOlxuICAgICAgICAgIHNxdWFyZSsrO2JyZWFrOyAvLyBbXG4gICAgICAgIGNhc2UgMHg1RDpcbiAgICAgICAgICBzcXVhcmUtLTticmVhazsgLy8gXVxuICAgICAgICBjYXNlIDB4N0I6XG4gICAgICAgICAgY3VybHkrKzticmVhazsgLy8ge1xuICAgICAgICBjYXNlIDB4N0Q6XG4gICAgICAgICAgY3VybHktLTticmVhazsgLy8gfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChkaXIuZXhwcmVzc2lvbiA9PSBudWxsKSB7XG4gICAgZGlyLmV4cHJlc3Npb24gPSBzdHIuc2xpY2UoMCwgaSkudHJpbSgpO1xuICB9IGVsc2UgaWYgKGxhc3RGaWx0ZXJJbmRleCAhPT0gMCkge1xuICAgIHB1c2hGaWx0ZXIoKTtcbiAgfVxuXG4gIGNhY2hlJDEucHV0KHMsIGRpcik7XG4gIHJldHVybiBkaXI7XG59XG5cbnZhciBkaXJlY3RpdmUgPSBPYmplY3QuZnJlZXplKHtcbiAgcGFyc2VEaXJlY3RpdmU6IHBhcnNlRGlyZWN0aXZlXG59KTtcblxudmFyIHJlZ2V4RXNjYXBlUkUgPSAvWy0uKis/XiR7fSgpfFtcXF1cXC9cXFxcXS9nO1xudmFyIGNhY2hlID0gdW5kZWZpbmVkO1xudmFyIHRhZ1JFID0gdW5kZWZpbmVkO1xudmFyIGh0bWxSRSA9IHVuZGVmaW5lZDtcbi8qKlxuICogRXNjYXBlIGEgc3RyaW5nIHNvIGl0IGNhbiBiZSB1c2VkIGluIGEgUmVnRXhwXG4gKiBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKi9cblxuZnVuY3Rpb24gZXNjYXBlUmVnZXgoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShyZWdleEVzY2FwZVJFLCAnXFxcXCQmJyk7XG59XG5cbmZ1bmN0aW9uIGNvbXBpbGVSZWdleCgpIHtcbiAgdmFyIG9wZW4gPSBlc2NhcGVSZWdleChjb25maWcuZGVsaW1pdGVyc1swXSk7XG4gIHZhciBjbG9zZSA9IGVzY2FwZVJlZ2V4KGNvbmZpZy5kZWxpbWl0ZXJzWzFdKTtcbiAgdmFyIHVuc2FmZU9wZW4gPSBlc2NhcGVSZWdleChjb25maWcudW5zYWZlRGVsaW1pdGVyc1swXSk7XG4gIHZhciB1bnNhZmVDbG9zZSA9IGVzY2FwZVJlZ2V4KGNvbmZpZy51bnNhZmVEZWxpbWl0ZXJzWzFdKTtcbiAgdGFnUkUgPSBuZXcgUmVnRXhwKHVuc2FmZU9wZW4gKyAnKCg/Oi58XFxcXG4pKz8pJyArIHVuc2FmZUNsb3NlICsgJ3wnICsgb3BlbiArICcoKD86LnxcXFxcbikrPyknICsgY2xvc2UsICdnJyk7XG4gIGh0bWxSRSA9IG5ldyBSZWdFeHAoJ14nICsgdW5zYWZlT3BlbiArICcuKicgKyB1bnNhZmVDbG9zZSArICckJyk7XG4gIC8vIHJlc2V0IGNhY2hlXG4gIGNhY2hlID0gbmV3IENhY2hlKDEwMDApO1xufVxuXG4vKipcbiAqIFBhcnNlIGEgdGVtcGxhdGUgdGV4dCBzdHJpbmcgaW50byBhbiBhcnJheSBvZiB0b2tlbnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHRleHRcbiAqIEByZXR1cm4ge0FycmF5PE9iamVjdD4gfCBudWxsfVxuICogICAgICAgICAgICAgICAtIHtTdHJpbmd9IHR5cGVcbiAqICAgICAgICAgICAgICAgLSB7U3RyaW5nfSB2YWx1ZVxuICogICAgICAgICAgICAgICAtIHtCb29sZWFufSBbaHRtbF1cbiAqICAgICAgICAgICAgICAgLSB7Qm9vbGVhbn0gW29uZVRpbWVdXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VUZXh0KHRleHQpIHtcbiAgaWYgKCFjYWNoZSkge1xuICAgIGNvbXBpbGVSZWdleCgpO1xuICB9XG4gIHZhciBoaXQgPSBjYWNoZS5nZXQodGV4dCk7XG4gIGlmIChoaXQpIHtcbiAgICByZXR1cm4gaGl0O1xuICB9XG4gIGlmICghdGFnUkUudGVzdCh0ZXh0KSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciB0b2tlbnMgPSBbXTtcbiAgdmFyIGxhc3RJbmRleCA9IHRhZ1JFLmxhc3RJbmRleCA9IDA7XG4gIHZhciBtYXRjaCwgaW5kZXgsIGh0bWwsIHZhbHVlLCBmaXJzdCwgb25lVGltZTtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uZC1hc3NpZ24gKi9cbiAgd2hpbGUgKG1hdGNoID0gdGFnUkUuZXhlYyh0ZXh0KSkge1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uZC1hc3NpZ24gKi9cbiAgICBpbmRleCA9IG1hdGNoLmluZGV4O1xuICAgIC8vIHB1c2ggdGV4dCB0b2tlblxuICAgIGlmIChpbmRleCA+IGxhc3RJbmRleCkge1xuICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICB2YWx1ZTogdGV4dC5zbGljZShsYXN0SW5kZXgsIGluZGV4KVxuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIHRhZyB0b2tlblxuICAgIGh0bWwgPSBodG1sUkUudGVzdChtYXRjaFswXSk7XG4gICAgdmFsdWUgPSBodG1sID8gbWF0Y2hbMV0gOiBtYXRjaFsyXTtcbiAgICBmaXJzdCA9IHZhbHVlLmNoYXJDb2RlQXQoMCk7XG4gICAgb25lVGltZSA9IGZpcnN0ID09PSA0MjsgLy8gKlxuICAgIHZhbHVlID0gb25lVGltZSA/IHZhbHVlLnNsaWNlKDEpIDogdmFsdWU7XG4gICAgdG9rZW5zLnB1c2goe1xuICAgICAgdGFnOiB0cnVlLFxuICAgICAgdmFsdWU6IHZhbHVlLnRyaW0oKSxcbiAgICAgIGh0bWw6IGh0bWwsXG4gICAgICBvbmVUaW1lOiBvbmVUaW1lXG4gICAgfSk7XG4gICAgbGFzdEluZGV4ID0gaW5kZXggKyBtYXRjaFswXS5sZW5ndGg7XG4gIH1cbiAgaWYgKGxhc3RJbmRleCA8IHRleHQubGVuZ3RoKSB7XG4gICAgdG9rZW5zLnB1c2goe1xuICAgICAgdmFsdWU6IHRleHQuc2xpY2UobGFzdEluZGV4KVxuICAgIH0pO1xuICB9XG4gIGNhY2hlLnB1dCh0ZXh0LCB0b2tlbnMpO1xuICByZXR1cm4gdG9rZW5zO1xufVxuXG4vKipcbiAqIEZvcm1hdCBhIGxpc3Qgb2YgdG9rZW5zIGludG8gYW4gZXhwcmVzc2lvbi5cbiAqIGUuZy4gdG9rZW5zIHBhcnNlZCBmcm9tICdhIHt7Yn19IGMnIGNhbiBiZSBzZXJpYWxpemVkXG4gKiBpbnRvIG9uZSBzaW5nbGUgZXhwcmVzc2lvbiBhcyAnXCJhIFwiICsgYiArIFwiIGNcIicuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gdG9rZW5zXG4gKiBAcGFyYW0ge1Z1ZX0gW3ZtXVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHRva2Vuc1RvRXhwKHRva2Vucywgdm0pIHtcbiAgaWYgKHRva2Vucy5sZW5ndGggPiAxKSB7XG4gICAgcmV0dXJuIHRva2Vucy5tYXAoZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgICByZXR1cm4gZm9ybWF0VG9rZW4odG9rZW4sIHZtKTtcbiAgICB9KS5qb2luKCcrJyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZvcm1hdFRva2VuKHRva2Vuc1swXSwgdm0sIHRydWUpO1xuICB9XG59XG5cbi8qKlxuICogRm9ybWF0IGEgc2luZ2xlIHRva2VuLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB0b2tlblxuICogQHBhcmFtIHtWdWV9IFt2bV1cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3NpbmdsZV1cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBmb3JtYXRUb2tlbih0b2tlbiwgdm0sIHNpbmdsZSkge1xuICByZXR1cm4gdG9rZW4udGFnID8gdG9rZW4ub25lVGltZSAmJiB2bSA/ICdcIicgKyB2bS4kZXZhbCh0b2tlbi52YWx1ZSkgKyAnXCInIDogaW5saW5lRmlsdGVycyh0b2tlbi52YWx1ZSwgc2luZ2xlKSA6ICdcIicgKyB0b2tlbi52YWx1ZSArICdcIic7XG59XG5cbi8qKlxuICogRm9yIGFuIGF0dHJpYnV0ZSB3aXRoIG11bHRpcGxlIGludGVycG9sYXRpb24gdGFncyxcbiAqIGUuZy4gYXR0cj1cInNvbWUte3t0aGluZyB8IGZpbHRlcn19XCIsIGluIG9yZGVyIHRvIGNvbWJpbmVcbiAqIHRoZSB3aG9sZSB0aGluZyBpbnRvIGEgc2luZ2xlIHdhdGNoYWJsZSBleHByZXNzaW9uLCB3ZVxuICogaGF2ZSB0byBpbmxpbmUgdGhvc2UgZmlsdGVycy4gVGhpcyBmdW5jdGlvbiBkb2VzIGV4YWN0bHlcbiAqIHRoYXQuIFRoaXMgaXMgYSBiaXQgaGFja3kgYnV0IGl0IGF2b2lkcyBoZWF2eSBjaGFuZ2VzXG4gKiB0byBkaXJlY3RpdmUgcGFyc2VyIGFuZCB3YXRjaGVyIG1lY2hhbmlzbS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXhwXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHNpbmdsZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbnZhciBmaWx0ZXJSRSA9IC9bXnxdXFx8W158XS87XG5mdW5jdGlvbiBpbmxpbmVGaWx0ZXJzKGV4cCwgc2luZ2xlKSB7XG4gIGlmICghZmlsdGVyUkUudGVzdChleHApKSB7XG4gICAgcmV0dXJuIHNpbmdsZSA/IGV4cCA6ICcoJyArIGV4cCArICcpJztcbiAgfSBlbHNlIHtcbiAgICB2YXIgZGlyID0gcGFyc2VEaXJlY3RpdmUoZXhwKTtcbiAgICBpZiAoIWRpci5maWx0ZXJzKSB7XG4gICAgICByZXR1cm4gJygnICsgZXhwICsgJyknO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ3RoaXMuX2FwcGx5RmlsdGVycygnICsgZGlyLmV4cHJlc3Npb24gKyAvLyB2YWx1ZVxuICAgICAgJyxudWxsLCcgKyAvLyBvbGRWYWx1ZSAobnVsbCBmb3IgcmVhZClcbiAgICAgIEpTT04uc3RyaW5naWZ5KGRpci5maWx0ZXJzKSArIC8vIGZpbHRlciBkZXNjcmlwdG9yc1xuICAgICAgJyxmYWxzZSknOyAvLyB3cml0ZT9cbiAgICB9XG4gIH1cbn1cblxudmFyIHRleHQgPSBPYmplY3QuZnJlZXplKHtcbiAgY29tcGlsZVJlZ2V4OiBjb21waWxlUmVnZXgsXG4gIHBhcnNlVGV4dDogcGFyc2VUZXh0LFxuICB0b2tlbnNUb0V4cDogdG9rZW5zVG9FeHBcbn0pO1xuXG52YXIgZGVsaW1pdGVycyA9IFsne3snLCAnfX0nXTtcbnZhciB1bnNhZmVEZWxpbWl0ZXJzID0gWyd7e3snLCAnfX19J107XG5cbnZhciBjb25maWcgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gcHJpbnQgZGVidWcgbWVzc2FnZXMuXG4gICAqIEFsc28gZW5hYmxlcyBzdGFjayB0cmFjZSBmb3Igd2FybmluZ3MuXG4gICAqXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cblxuICBkZWJ1ZzogZmFsc2UsXG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gc3VwcHJlc3Mgd2FybmluZ3MuXG4gICAqXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cblxuICBzaWxlbnQ6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIHVzZSBhc3luYyByZW5kZXJpbmcuXG4gICAqL1xuXG4gIGFzeW5jOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIHdhcm4gYWdhaW5zdCBlcnJvcnMgY2F1Z2h0IHdoZW4gZXZhbHVhdGluZ1xuICAgKiBleHByZXNzaW9ucy5cbiAgICovXG5cbiAgd2FybkV4cHJlc3Npb25FcnJvcnM6IHRydWUsXG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gYWxsb3cgZGV2dG9vbHMgaW5zcGVjdGlvbi5cbiAgICogRGlzYWJsZWQgYnkgZGVmYXVsdCBpbiBwcm9kdWN0aW9uIGJ1aWxkcy5cbiAgICovXG5cbiAgZGV2dG9vbHM6IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicsXG5cbiAgLyoqXG4gICAqIEludGVybmFsIGZsYWcgdG8gaW5kaWNhdGUgdGhlIGRlbGltaXRlcnMgaGF2ZSBiZWVuXG4gICAqIGNoYW5nZWQuXG4gICAqXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cblxuICBfZGVsaW1pdGVyc0NoYW5nZWQ6IHRydWUsXG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgYXNzZXQgdHlwZXMgdGhhdCBhIGNvbXBvbmVudCBjYW4gb3duLlxuICAgKlxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqL1xuXG4gIF9hc3NldFR5cGVzOiBbJ2NvbXBvbmVudCcsICdkaXJlY3RpdmUnLCAnZWxlbWVudERpcmVjdGl2ZScsICdmaWx0ZXInLCAndHJhbnNpdGlvbicsICdwYXJ0aWFsJ10sXG5cbiAgLyoqXG4gICAqIHByb3AgYmluZGluZyBtb2Rlc1xuICAgKi9cblxuICBfcHJvcEJpbmRpbmdNb2Rlczoge1xuICAgIE9ORV9XQVk6IDAsXG4gICAgVFdPX1dBWTogMSxcbiAgICBPTkVfVElNRTogMlxuICB9LFxuXG4gIC8qKlxuICAgKiBNYXggY2lyY3VsYXIgdXBkYXRlcyBhbGxvd2VkIGluIGEgYmF0Y2hlciBmbHVzaCBjeWNsZS5cbiAgICovXG5cbiAgX21heFVwZGF0ZUNvdW50OiAxMDBcblxufSwge1xuICBkZWxpbWl0ZXJzOiB7IC8qKlxuICAgICAgICAgICAgICAgICAqIEludGVycG9sYXRpb24gZGVsaW1pdGVycy4gQ2hhbmdpbmcgdGhlc2Ugd291bGQgdHJpZ2dlclxuICAgICAgICAgICAgICAgICAqIHRoZSB0ZXh0IHBhcnNlciB0byByZS1jb21waWxlIHRoZSByZWd1bGFyIGV4cHJlc3Npb25zLlxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogQHR5cGUge0FycmF5PFN0cmluZz59XG4gICAgICAgICAgICAgICAgICovXG5cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBkZWxpbWl0ZXJzO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodmFsKSB7XG4gICAgICBkZWxpbWl0ZXJzID0gdmFsO1xuICAgICAgY29tcGlsZVJlZ2V4KCk7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9LFxuICB1bnNhZmVEZWxpbWl0ZXJzOiB7XG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdW5zYWZlRGVsaW1pdGVycztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHZhbCkge1xuICAgICAgdW5zYWZlRGVsaW1pdGVycyA9IHZhbDtcbiAgICAgIGNvbXBpbGVSZWdleCgpO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfVxufSk7XG5cbnZhciB3YXJuID0gdW5kZWZpbmVkO1xudmFyIGZvcm1hdENvbXBvbmVudE5hbWUgPSB1bmRlZmluZWQ7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGhhc0NvbnNvbGUgPSB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbiAgICB3YXJuID0gZnVuY3Rpb24gKG1zZywgdm0pIHtcbiAgICAgIGlmIChoYXNDb25zb2xlICYmICFjb25maWcuc2lsZW50KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tWdWUgd2Fybl06ICcgKyBtc2cgKyAodm0gPyBmb3JtYXRDb21wb25lbnROYW1lKHZtKSA6ICcnKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZvcm1hdENvbXBvbmVudE5hbWUgPSBmdW5jdGlvbiAodm0pIHtcbiAgICAgIHZhciBuYW1lID0gdm0uX2lzVnVlID8gdm0uJG9wdGlvbnMubmFtZSA6IHZtLm5hbWU7XG4gICAgICByZXR1cm4gbmFtZSA/ICcgKGZvdW5kIGluIGNvbXBvbmVudDogPCcgKyBoeXBoZW5hdGUobmFtZSkgKyAnPiknIDogJyc7XG4gICAgfTtcbiAgfSkoKTtcbn1cblxuLyoqXG4gKiBBcHBlbmQgd2l0aCB0cmFuc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0XG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cbiAqL1xuXG5mdW5jdGlvbiBhcHBlbmRXaXRoVHJhbnNpdGlvbihlbCwgdGFyZ2V0LCB2bSwgY2IpIHtcbiAgYXBwbHlUcmFuc2l0aW9uKGVsLCAxLCBmdW5jdGlvbiAoKSB7XG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKGVsKTtcbiAgfSwgdm0sIGNiKTtcbn1cblxuLyoqXG4gKiBJbnNlcnRCZWZvcmUgd2l0aCB0cmFuc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0XG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cbiAqL1xuXG5mdW5jdGlvbiBiZWZvcmVXaXRoVHJhbnNpdGlvbihlbCwgdGFyZ2V0LCB2bSwgY2IpIHtcbiAgYXBwbHlUcmFuc2l0aW9uKGVsLCAxLCBmdW5jdGlvbiAoKSB7XG4gICAgYmVmb3JlKGVsLCB0YXJnZXQpO1xuICB9LCB2bSwgY2IpO1xufVxuXG4vKipcbiAqIFJlbW92ZSB3aXRoIHRyYW5zaXRpb24uXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gKi9cblxuZnVuY3Rpb24gcmVtb3ZlV2l0aFRyYW5zaXRpb24oZWwsIHZtLCBjYikge1xuICBhcHBseVRyYW5zaXRpb24oZWwsIC0xLCBmdW5jdGlvbiAoKSB7XG4gICAgcmVtb3ZlKGVsKTtcbiAgfSwgdm0sIGNiKTtcbn1cblxuLyoqXG4gKiBBcHBseSB0cmFuc2l0aW9ucyB3aXRoIGFuIG9wZXJhdGlvbiBjYWxsYmFjay5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge051bWJlcn0gZGlyZWN0aW9uXG4gKiAgICAgICAgICAgICAgICAgIDE6IGVudGVyXG4gKiAgICAgICAgICAgICAgICAgLTE6IGxlYXZlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcCAtIHRoZSBhY3R1YWwgRE9NIG9wZXJhdGlvblxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gKi9cblxuZnVuY3Rpb24gYXBwbHlUcmFuc2l0aW9uKGVsLCBkaXJlY3Rpb24sIG9wLCB2bSwgY2IpIHtcbiAgdmFyIHRyYW5zaXRpb24gPSBlbC5fX3ZfdHJhbnM7XG4gIGlmICghdHJhbnNpdGlvbiB8fFxuICAvLyBza2lwIGlmIHRoZXJlIGFyZSBubyBqcyBob29rcyBhbmQgQ1NTIHRyYW5zaXRpb24gaXNcbiAgLy8gbm90IHN1cHBvcnRlZFxuICAhdHJhbnNpdGlvbi5ob29rcyAmJiAhdHJhbnNpdGlvbkVuZEV2ZW50IHx8XG4gIC8vIHNraXAgdHJhbnNpdGlvbnMgZm9yIGluaXRpYWwgY29tcGlsZVxuICAhdm0uX2lzQ29tcGlsZWQgfHxcbiAgLy8gaWYgdGhlIHZtIGlzIGJlaW5nIG1hbmlwdWxhdGVkIGJ5IGEgcGFyZW50IGRpcmVjdGl2ZVxuICAvLyBkdXJpbmcgdGhlIHBhcmVudCdzIGNvbXBpbGF0aW9uIHBoYXNlLCBza2lwIHRoZVxuICAvLyBhbmltYXRpb24uXG4gIHZtLiRwYXJlbnQgJiYgIXZtLiRwYXJlbnQuX2lzQ29tcGlsZWQpIHtcbiAgICBvcCgpO1xuICAgIGlmIChjYikgY2IoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGFjdGlvbiA9IGRpcmVjdGlvbiA+IDAgPyAnZW50ZXInIDogJ2xlYXZlJztcbiAgdHJhbnNpdGlvblthY3Rpb25dKG9wLCBjYik7XG59XG5cbnZhciB0cmFuc2l0aW9uID0gT2JqZWN0LmZyZWV6ZSh7XG4gIGFwcGVuZFdpdGhUcmFuc2l0aW9uOiBhcHBlbmRXaXRoVHJhbnNpdGlvbixcbiAgYmVmb3JlV2l0aFRyYW5zaXRpb246IGJlZm9yZVdpdGhUcmFuc2l0aW9uLFxuICByZW1vdmVXaXRoVHJhbnNpdGlvbjogcmVtb3ZlV2l0aFRyYW5zaXRpb24sXG4gIGFwcGx5VHJhbnNpdGlvbjogYXBwbHlUcmFuc2l0aW9uXG59KTtcblxuLyoqXG4gKiBRdWVyeSBhbiBlbGVtZW50IHNlbGVjdG9yIGlmIGl0J3Mgbm90IGFuIGVsZW1lbnQgYWxyZWFkeS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fSBlbFxuICogQHJldHVybiB7RWxlbWVudH1cbiAqL1xuXG5mdW5jdGlvbiBxdWVyeShlbCkge1xuICBpZiAodHlwZW9mIGVsID09PSAnc3RyaW5nJykge1xuICAgIHZhciBzZWxlY3RvciA9IGVsO1xuICAgIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbCk7XG4gICAgaWYgKCFlbCkge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdDYW5ub3QgZmluZCBlbGVtZW50OiAnICsgc2VsZWN0b3IpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZWw7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBub2RlIGlzIGluIHRoZSBkb2N1bWVudC5cbiAqIE5vdGU6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jb250YWlucyBzaG91bGQgd29yayBoZXJlXG4gKiBidXQgYWx3YXlzIHJldHVybnMgZmFsc2UgZm9yIGNvbW1lbnQgbm9kZXMgaW4gcGhhbnRvbWpzLFxuICogbWFraW5nIHVuaXQgdGVzdHMgZGlmZmljdWx0LiBUaGlzIGlzIGZpeGVkIGJ5IGRvaW5nIHRoZVxuICogY29udGFpbnMoKSBjaGVjayBvbiB0aGUgbm9kZSdzIHBhcmVudE5vZGUgaW5zdGVhZCBvZlxuICogdGhlIG5vZGUgaXRzZWxmLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpbkRvYyhub2RlKSB7XG4gIGlmICghbm9kZSkgcmV0dXJuIGZhbHNlO1xuICB2YXIgZG9jID0gbm9kZS5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgdmFyIHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgcmV0dXJuIGRvYyA9PT0gbm9kZSB8fCBkb2MgPT09IHBhcmVudCB8fCAhIShwYXJlbnQgJiYgcGFyZW50Lm5vZGVUeXBlID09PSAxICYmIGRvYy5jb250YWlucyhwYXJlbnQpKTtcbn1cblxuLyoqXG4gKiBHZXQgYW5kIHJlbW92ZSBhbiBhdHRyaWJ1dGUgZnJvbSBhIG5vZGUuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcGFyYW0ge1N0cmluZ30gX2F0dHJcbiAqL1xuXG5mdW5jdGlvbiBnZXRBdHRyKG5vZGUsIF9hdHRyKSB7XG4gIHZhciB2YWwgPSBub2RlLmdldEF0dHJpYnV0ZShfYXR0cik7XG4gIGlmICh2YWwgIT09IG51bGwpIHtcbiAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShfYXR0cik7XG4gIH1cbiAgcmV0dXJuIHZhbDtcbn1cblxuLyoqXG4gKiBHZXQgYW4gYXR0cmlidXRlIHdpdGggY29sb24gb3Igdi1iaW5kOiBwcmVmaXguXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7U3RyaW5nfG51bGx9XG4gKi9cblxuZnVuY3Rpb24gZ2V0QmluZEF0dHIobm9kZSwgbmFtZSkge1xuICB2YXIgdmFsID0gZ2V0QXR0cihub2RlLCAnOicgKyBuYW1lKTtcbiAgaWYgKHZhbCA9PT0gbnVsbCkge1xuICAgIHZhbCA9IGdldEF0dHIobm9kZSwgJ3YtYmluZDonICsgbmFtZSk7XG4gIH1cbiAgcmV0dXJuIHZhbDtcbn1cblxuLyoqXG4gKiBDaGVjayB0aGUgcHJlc2VuY2Ugb2YgYSBiaW5kIGF0dHJpYnV0ZS5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGhhc0JpbmRBdHRyKG5vZGUsIG5hbWUpIHtcbiAgcmV0dXJuIG5vZGUuaGFzQXR0cmlidXRlKG5hbWUpIHx8IG5vZGUuaGFzQXR0cmlidXRlKCc6JyArIG5hbWUpIHx8IG5vZGUuaGFzQXR0cmlidXRlKCd2LWJpbmQ6JyArIG5hbWUpO1xufVxuXG4vKipcbiAqIEluc2VydCBlbCBiZWZvcmUgdGFyZ2V0XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRcbiAqL1xuXG5mdW5jdGlvbiBiZWZvcmUoZWwsIHRhcmdldCkge1xuICB0YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldCk7XG59XG5cbi8qKlxuICogSW5zZXJ0IGVsIGFmdGVyIHRhcmdldFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0XG4gKi9cblxuZnVuY3Rpb24gYWZ0ZXIoZWwsIHRhcmdldCkge1xuICBpZiAodGFyZ2V0Lm5leHRTaWJsaW5nKSB7XG4gICAgYmVmb3JlKGVsLCB0YXJnZXQubmV4dFNpYmxpbmcpO1xuICB9IGVsc2Uge1xuICAgIHRhcmdldC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGVsKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZSBlbCBmcm9tIERPTVxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqL1xuXG5mdW5jdGlvbiByZW1vdmUoZWwpIHtcbiAgZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbCk7XG59XG5cbi8qKlxuICogUHJlcGVuZCBlbCB0byB0YXJnZXRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICovXG5cbmZ1bmN0aW9uIHByZXBlbmQoZWwsIHRhcmdldCkge1xuICBpZiAodGFyZ2V0LmZpcnN0Q2hpbGQpIHtcbiAgICBiZWZvcmUoZWwsIHRhcmdldC5maXJzdENoaWxkKTtcbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoZWwpO1xuICB9XG59XG5cbi8qKlxuICogUmVwbGFjZSB0YXJnZXQgd2l0aCBlbFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKi9cblxuZnVuY3Rpb24gcmVwbGFjZSh0YXJnZXQsIGVsKSB7XG4gIHZhciBwYXJlbnQgPSB0YXJnZXQucGFyZW50Tm9kZTtcbiAgaWYgKHBhcmVudCkge1xuICAgIHBhcmVudC5yZXBsYWNlQ2hpbGQoZWwsIHRhcmdldCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgZXZlbnQgbGlzdGVuZXIgc2hvcnRoYW5kLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2JcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3VzZUNhcHR1cmVdXG4gKi9cblxuZnVuY3Rpb24gb24oZWwsIGV2ZW50LCBjYiwgdXNlQ2FwdHVyZSkge1xuICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYiwgdXNlQ2FwdHVyZSk7XG59XG5cbi8qKlxuICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVyIHNob3J0aGFuZC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gKi9cblxuZnVuY3Rpb24gb2ZmKGVsLCBldmVudCwgY2IpIHtcbiAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgY2IpO1xufVxuXG4vKipcbiAqIEZvciBJRTkgY29tcGF0OiB3aGVuIGJvdGggY2xhc3MgYW5kIDpjbGFzcyBhcmUgcHJlc2VudFxuICogZ2V0QXR0cmlidXRlKCdjbGFzcycpIHJldHVybnMgd3JvbmcgdmFsdWUuLi5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gZ2V0Q2xhc3MoZWwpIHtcbiAgdmFyIGNsYXNzbmFtZSA9IGVsLmNsYXNzTmFtZTtcbiAgaWYgKHR5cGVvZiBjbGFzc25hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgY2xhc3NuYW1lID0gY2xhc3NuYW1lLmJhc2VWYWwgfHwgJyc7XG4gIH1cbiAgcmV0dXJuIGNsYXNzbmFtZTtcbn1cblxuLyoqXG4gKiBJbiBJRTksIHNldEF0dHJpYnV0ZSgnY2xhc3MnKSB3aWxsIHJlc3VsdCBpbiBlbXB0eSBjbGFzc1xuICogaWYgdGhlIGVsZW1lbnQgYWxzbyBoYXMgdGhlIDpjbGFzcyBhdHRyaWJ1dGU7IEhvd2V2ZXIgaW5cbiAqIFBoYW50b21KUywgc2V0dGluZyBgY2xhc3NOYW1lYCBkb2VzIG5vdCB3b3JrIG9uIFNWRyBlbGVtZW50cy4uLlxuICogU28gd2UgaGF2ZSB0byBkbyBhIGNvbmRpdGlvbmFsIGNoZWNrIGhlcmUuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IGNsc1xuICovXG5cbmZ1bmN0aW9uIHNldENsYXNzKGVsLCBjbHMpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmIChpc0lFOSAmJiAhL3N2ZyQvLnRlc3QoZWwubmFtZXNwYWNlVVJJKSkge1xuICAgIGVsLmNsYXNzTmFtZSA9IGNscztcbiAgfSBlbHNlIHtcbiAgICBlbC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgY2xzKTtcbiAgfVxufVxuXG4vKipcbiAqIEFkZCBjbGFzcyB3aXRoIGNvbXBhdGliaWxpdHkgZm9yIElFICYgU1ZHXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IGNsc1xuICovXG5cbmZ1bmN0aW9uIGFkZENsYXNzKGVsLCBjbHMpIHtcbiAgaWYgKGVsLmNsYXNzTGlzdCkge1xuICAgIGVsLmNsYXNzTGlzdC5hZGQoY2xzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgY3VyID0gJyAnICsgZ2V0Q2xhc3MoZWwpICsgJyAnO1xuICAgIGlmIChjdXIuaW5kZXhPZignICcgKyBjbHMgKyAnICcpIDwgMCkge1xuICAgICAgc2V0Q2xhc3MoZWwsIChjdXIgKyBjbHMpLnRyaW0oKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlIGNsYXNzIHdpdGggY29tcGF0aWJpbGl0eSBmb3IgSUUgJiBTVkdcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gY2xzXG4gKi9cblxuZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWwsIGNscykge1xuICBpZiAoZWwuY2xhc3NMaXN0KSB7XG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZShjbHMpO1xuICB9IGVsc2Uge1xuICAgIHZhciBjdXIgPSAnICcgKyBnZXRDbGFzcyhlbCkgKyAnICc7XG4gICAgdmFyIHRhciA9ICcgJyArIGNscyArICcgJztcbiAgICB3aGlsZSAoY3VyLmluZGV4T2YodGFyKSA+PSAwKSB7XG4gICAgICBjdXIgPSBjdXIucmVwbGFjZSh0YXIsICcgJyk7XG4gICAgfVxuICAgIHNldENsYXNzKGVsLCBjdXIudHJpbSgpKTtcbiAgfVxuICBpZiAoIWVsLmNsYXNzTmFtZSkge1xuICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSgnY2xhc3MnKTtcbiAgfVxufVxuXG4vKipcbiAqIEV4dHJhY3QgcmF3IGNvbnRlbnQgaW5zaWRlIGFuIGVsZW1lbnQgaW50byBhIHRlbXBvcmFyeVxuICogY29udGFpbmVyIGRpdlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gYXNGcmFnbWVudFxuICogQHJldHVybiB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fVxuICovXG5cbmZ1bmN0aW9uIGV4dHJhY3RDb250ZW50KGVsLCBhc0ZyYWdtZW50KSB7XG4gIHZhciBjaGlsZDtcbiAgdmFyIHJhd0NvbnRlbnQ7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoaXNUZW1wbGF0ZShlbCkgJiYgaXNGcmFnbWVudChlbC5jb250ZW50KSkge1xuICAgIGVsID0gZWwuY29udGVudDtcbiAgfVxuICBpZiAoZWwuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgdHJpbU5vZGUoZWwpO1xuICAgIHJhd0NvbnRlbnQgPSBhc0ZyYWdtZW50ID8gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uZC1hc3NpZ24gKi9cbiAgICB3aGlsZSAoY2hpbGQgPSBlbC5maXJzdENoaWxkKSB7XG4gICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbmQtYXNzaWduICovXG4gICAgICByYXdDb250ZW50LmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJhd0NvbnRlbnQ7XG59XG5cbi8qKlxuICogVHJpbSBwb3NzaWJsZSBlbXB0eSBoZWFkL3RhaWwgdGV4dCBhbmQgY29tbWVudFxuICogbm9kZXMgaW5zaWRlIGEgcGFyZW50LlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICovXG5cbmZ1bmN0aW9uIHRyaW1Ob2RlKG5vZGUpIHtcbiAgdmFyIGNoaWxkO1xuICAvKiBlc2xpbnQtZGlzYWJsZSBuby1zZXF1ZW5jZXMgKi9cbiAgd2hpbGUgKChjaGlsZCA9IG5vZGUuZmlyc3RDaGlsZCwgaXNUcmltbWFibGUoY2hpbGQpKSkge1xuICAgIG5vZGUucmVtb3ZlQ2hpbGQoY2hpbGQpO1xuICB9XG4gIHdoaWxlICgoY2hpbGQgPSBub2RlLmxhc3RDaGlsZCwgaXNUcmltbWFibGUoY2hpbGQpKSkge1xuICAgIG5vZGUucmVtb3ZlQ2hpbGQoY2hpbGQpO1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgbm8tc2VxdWVuY2VzICovXG59XG5cbmZ1bmN0aW9uIGlzVHJpbW1hYmxlKG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUgJiYgKG5vZGUubm9kZVR5cGUgPT09IDMgJiYgIW5vZGUuZGF0YS50cmltKCkgfHwgbm9kZS5ub2RlVHlwZSA9PT0gOCk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYW4gZWxlbWVudCBpcyBhIHRlbXBsYXRlIHRhZy5cbiAqIE5vdGUgaWYgdGhlIHRlbXBsYXRlIGFwcGVhcnMgaW5zaWRlIGFuIFNWRyBpdHMgdGFnTmFtZVxuICogd2lsbCBiZSBpbiBsb3dlcmNhc2UuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICovXG5cbmZ1bmN0aW9uIGlzVGVtcGxhdGUoZWwpIHtcbiAgcmV0dXJuIGVsLnRhZ05hbWUgJiYgZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAndGVtcGxhdGUnO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBcImFuY2hvclwiIGZvciBwZXJmb3JtaW5nIGRvbSBpbnNlcnRpb24vcmVtb3ZhbHMuXG4gKiBUaGlzIGlzIHVzZWQgaW4gYSBudW1iZXIgb2Ygc2NlbmFyaW9zOlxuICogLSBmcmFnbWVudCBpbnN0YW5jZVxuICogLSB2LWh0bWxcbiAqIC0gdi1pZlxuICogLSB2LWZvclxuICogLSBjb21wb25lbnRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gY29udGVudFxuICogQHBhcmFtIHtCb29sZWFufSBwZXJzaXN0IC0gSUUgdHJhc2hlcyBlbXB0eSB0ZXh0Tm9kZXMgb25cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lTm9kZSh0cnVlKSwgc28gaW4gY2VydGFpblxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZXMgdGhlIGFuY2hvciBuZWVkcyB0byBiZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9uLWVtcHR5IHRvIGJlIHBlcnNpc3RlZCBpblxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVzLlxuICogQHJldHVybiB7Q29tbWVudHxUZXh0fVxuICovXG5cbmZ1bmN0aW9uIGNyZWF0ZUFuY2hvcihjb250ZW50LCBwZXJzaXN0KSB7XG4gIHZhciBhbmNob3IgPSBjb25maWcuZGVidWcgPyBkb2N1bWVudC5jcmVhdGVDb21tZW50KGNvbnRlbnQpIDogZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocGVyc2lzdCA/ICcgJyA6ICcnKTtcbiAgYW5jaG9yLl9fdl9hbmNob3IgPSB0cnVlO1xuICByZXR1cm4gYW5jaG9yO1xufVxuXG4vKipcbiAqIEZpbmQgYSBjb21wb25lbnQgcmVmIGF0dHJpYnV0ZSB0aGF0IHN0YXJ0cyB3aXRoICQuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBub2RlXG4gKiBAcmV0dXJuIHtTdHJpbmd8dW5kZWZpbmVkfVxuICovXG5cbnZhciByZWZSRSA9IC9edi1yZWY6LztcblxuZnVuY3Rpb24gZmluZFJlZihub2RlKSB7XG4gIGlmIChub2RlLmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgIHZhciBhdHRycyA9IG5vZGUuYXR0cmlidXRlcztcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGF0dHJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIG5hbWUgPSBhdHRyc1tpXS5uYW1lO1xuICAgICAgaWYgKHJlZlJFLnRlc3QobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIGNhbWVsaXplKG5hbWUucmVwbGFjZShyZWZSRSwgJycpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBNYXAgYSBmdW5jdGlvbiB0byBhIHJhbmdlIG9mIG5vZGVzIC5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAqIEBwYXJhbSB7Tm9kZX0gZW5kXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcFxuICovXG5cbmZ1bmN0aW9uIG1hcE5vZGVSYW5nZShub2RlLCBlbmQsIG9wKSB7XG4gIHZhciBuZXh0O1xuICB3aGlsZSAobm9kZSAhPT0gZW5kKSB7XG4gICAgbmV4dCA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgb3Aobm9kZSk7XG4gICAgbm9kZSA9IG5leHQ7XG4gIH1cbiAgb3AoZW5kKTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYSByYW5nZSBvZiBub2RlcyB3aXRoIHRyYW5zaXRpb24sIHN0b3JlXG4gKiB0aGUgbm9kZXMgaW4gYSBmcmFnbWVudCB3aXRoIGNvcnJlY3Qgb3JkZXJpbmcsXG4gKiBhbmQgY2FsbCBjYWxsYmFjayB3aGVuIGRvbmUuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBzdGFydFxuICogQHBhcmFtIHtOb2RlfSBlbmRcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICogQHBhcmFtIHtEb2N1bWVudEZyYWdtZW50fSBmcmFnXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYlxuICovXG5cbmZ1bmN0aW9uIHJlbW92ZU5vZGVSYW5nZShzdGFydCwgZW5kLCB2bSwgZnJhZywgY2IpIHtcbiAgdmFyIGRvbmUgPSBmYWxzZTtcbiAgdmFyIHJlbW92ZWQgPSAwO1xuICB2YXIgbm9kZXMgPSBbXTtcbiAgbWFwTm9kZVJhbmdlKHN0YXJ0LCBlbmQsIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgaWYgKG5vZGUgPT09IGVuZCkgZG9uZSA9IHRydWU7XG4gICAgbm9kZXMucHVzaChub2RlKTtcbiAgICByZW1vdmVXaXRoVHJhbnNpdGlvbihub2RlLCB2bSwgb25SZW1vdmVkKTtcbiAgfSk7XG4gIGZ1bmN0aW9uIG9uUmVtb3ZlZCgpIHtcbiAgICByZW1vdmVkKys7XG4gICAgaWYgKGRvbmUgJiYgcmVtb3ZlZCA+PSBub2Rlcy5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChub2Rlc1tpXSk7XG4gICAgICB9XG4gICAgICBjYiAmJiBjYigpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgbm9kZSBpcyBhIERvY3VtZW50RnJhZ21lbnQuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzRnJhZ21lbnQobm9kZSkge1xuICByZXR1cm4gbm9kZSAmJiBub2RlLm5vZGVUeXBlID09PSAxMTtcbn1cblxuLyoqXG4gKiBHZXQgb3V0ZXJIVE1MIG9mIGVsZW1lbnRzLCB0YWtpbmcgY2FyZVxuICogb2YgU1ZHIGVsZW1lbnRzIGluIElFIGFzIHdlbGwuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIGdldE91dGVySFRNTChlbCkge1xuICBpZiAoZWwub3V0ZXJIVE1MKSB7XG4gICAgcmV0dXJuIGVsLm91dGVySFRNTDtcbiAgfSBlbHNlIHtcbiAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsLmNsb25lTm9kZSh0cnVlKSk7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5pbm5lckhUTUw7XG4gIH1cbn1cblxudmFyIGNvbW1vblRhZ1JFID0gL14oZGl2fHB8c3BhbnxpbWd8YXxifGl8YnJ8dWx8b2x8bGl8aDF8aDJ8aDN8aDR8aDV8aDZ8Y29kZXxwcmV8dGFibGV8dGh8dGR8dHJ8Zm9ybXxsYWJlbHxpbnB1dHxzZWxlY3R8b3B0aW9ufG5hdnxhcnRpY2xlfHNlY3Rpb258aGVhZGVyfGZvb3RlcikkL2k7XG52YXIgcmVzZXJ2ZWRUYWdSRSA9IC9eKHNsb3R8cGFydGlhbHxjb21wb25lbnQpJC9pO1xuXG52YXIgaXNVbmtub3duRWxlbWVudCA9IHVuZGVmaW5lZDtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGlzVW5rbm93bkVsZW1lbnQgPSBmdW5jdGlvbiAoZWwsIHRhZykge1xuICAgIGlmICh0YWcuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI4MjEwMzY0LzEwNzAyNDRcbiAgICAgIHJldHVybiBlbC5jb25zdHJ1Y3RvciA9PT0gd2luZG93LkhUTUxVbmtub3duRWxlbWVudCB8fCBlbC5jb25zdHJ1Y3RvciA9PT0gd2luZG93LkhUTUxFbGVtZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKC9IVE1MVW5rbm93bkVsZW1lbnQvLnRlc3QoZWwudG9TdHJpbmcoKSkgJiZcbiAgICAgICAgLy8gQ2hyb21lIHJldHVybnMgdW5rbm93biBmb3Igc2V2ZXJhbCBIVE1MNSBlbGVtZW50cy5cbiAgICAgICAgLy8gaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTU0MDUyNlxuICAgICAgICAhL14oZGF0YXx0aW1lfHJ0Y3xyYikkLy50ZXN0KHRhZylcbiAgICAgICk7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGFuIGVsZW1lbnQgaXMgYSBjb21wb25lbnQsIGlmIHllcyByZXR1cm4gaXRzXG4gKiBjb21wb25lbnQgaWQuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge09iamVjdHx1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gY2hlY2tDb21wb25lbnRBdHRyKGVsLCBvcHRpb25zKSB7XG4gIHZhciB0YWcgPSBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gIHZhciBoYXNBdHRycyA9IGVsLmhhc0F0dHJpYnV0ZXMoKTtcbiAgaWYgKCFjb21tb25UYWdSRS50ZXN0KHRhZykgJiYgIXJlc2VydmVkVGFnUkUudGVzdCh0YWcpKSB7XG4gICAgaWYgKHJlc29sdmVBc3NldChvcHRpb25zLCAnY29tcG9uZW50cycsIHRhZykpIHtcbiAgICAgIHJldHVybiB7IGlkOiB0YWcgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGlzID0gaGFzQXR0cnMgJiYgZ2V0SXNCaW5kaW5nKGVsLCBvcHRpb25zKTtcbiAgICAgIGlmIChpcykge1xuICAgICAgICByZXR1cm4gaXM7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgdmFyIGV4cGVjdGVkVGFnID0gb3B0aW9ucy5fY29tcG9uZW50TmFtZU1hcCAmJiBvcHRpb25zLl9jb21wb25lbnROYW1lTWFwW3RhZ107XG4gICAgICAgIGlmIChleHBlY3RlZFRhZykge1xuICAgICAgICAgIHdhcm4oJ1Vua25vd24gY3VzdG9tIGVsZW1lbnQ6IDwnICsgdGFnICsgJz4gLSAnICsgJ2RpZCB5b3UgbWVhbiA8JyArIGV4cGVjdGVkVGFnICsgJz4/ICcgKyAnSFRNTCBpcyBjYXNlLWluc2Vuc2l0aXZlLCByZW1lbWJlciB0byB1c2Uga2ViYWItY2FzZSBpbiB0ZW1wbGF0ZXMuJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNVbmtub3duRWxlbWVudChlbCwgdGFnKSkge1xuICAgICAgICAgIHdhcm4oJ1Vua25vd24gY3VzdG9tIGVsZW1lbnQ6IDwnICsgdGFnICsgJz4gLSBkaWQgeW91ICcgKyAncmVnaXN0ZXIgdGhlIGNvbXBvbmVudCBjb3JyZWN0bHk/IEZvciByZWN1cnNpdmUgY29tcG9uZW50cywgJyArICdtYWtlIHN1cmUgdG8gcHJvdmlkZSB0aGUgXCJuYW1lXCIgb3B0aW9uLicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGhhc0F0dHJzKSB7XG4gICAgcmV0dXJuIGdldElzQmluZGluZyhlbCwgb3B0aW9ucyk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgXCJpc1wiIGJpbmRpbmcgZnJvbSBhbiBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtPYmplY3R8dW5kZWZpbmVkfVxuICovXG5cbmZ1bmN0aW9uIGdldElzQmluZGluZyhlbCwgb3B0aW9ucykge1xuICAvLyBkeW5hbWljIHN5bnRheFxuICB2YXIgZXhwID0gZWwuZ2V0QXR0cmlidXRlKCdpcycpO1xuICBpZiAoZXhwICE9IG51bGwpIHtcbiAgICBpZiAocmVzb2x2ZUFzc2V0KG9wdGlvbnMsICdjb21wb25lbnRzJywgZXhwKSkge1xuICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKCdpcycpO1xuICAgICAgcmV0dXJuIHsgaWQ6IGV4cCB9O1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBleHAgPSBnZXRCaW5kQXR0cihlbCwgJ2lzJyk7XG4gICAgaWYgKGV4cCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4geyBpZDogZXhwLCBkeW5hbWljOiB0cnVlIH07XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogT3B0aW9uIG92ZXJ3cml0aW5nIHN0cmF0ZWdpZXMgYXJlIGZ1bmN0aW9ucyB0aGF0IGhhbmRsZVxuICogaG93IHRvIG1lcmdlIGEgcGFyZW50IG9wdGlvbiB2YWx1ZSBhbmQgYSBjaGlsZCBvcHRpb25cbiAqIHZhbHVlIGludG8gdGhlIGZpbmFsIHZhbHVlLlxuICpcbiAqIEFsbCBzdHJhdGVneSBmdW5jdGlvbnMgZm9sbG93IHRoZSBzYW1lIHNpZ25hdHVyZTpcbiAqXG4gKiBAcGFyYW0geyp9IHBhcmVudFZhbFxuICogQHBhcmFtIHsqfSBjaGlsZFZhbFxuICogQHBhcmFtIHtWdWV9IFt2bV1cbiAqL1xuXG52YXIgc3RyYXRzID0gY29uZmlnLm9wdGlvbk1lcmdlU3RyYXRlZ2llcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbi8qKlxuICogSGVscGVyIHRoYXQgcmVjdXJzaXZlbHkgbWVyZ2VzIHR3byBkYXRhIG9iamVjdHMgdG9nZXRoZXIuXG4gKi9cblxuZnVuY3Rpb24gbWVyZ2VEYXRhKHRvLCBmcm9tKSB7XG4gIHZhciBrZXksIHRvVmFsLCBmcm9tVmFsO1xuICBmb3IgKGtleSBpbiBmcm9tKSB7XG4gICAgdG9WYWwgPSB0b1trZXldO1xuICAgIGZyb21WYWwgPSBmcm9tW2tleV07XG4gICAgaWYgKCFoYXNPd24odG8sIGtleSkpIHtcbiAgICAgIHNldCh0bywga2V5LCBmcm9tVmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHRvVmFsKSAmJiBpc09iamVjdChmcm9tVmFsKSkge1xuICAgICAgbWVyZ2VEYXRhKHRvVmFsLCBmcm9tVmFsKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRvO1xufVxuXG4vKipcbiAqIERhdGFcbiAqL1xuXG5zdHJhdHMuZGF0YSA9IGZ1bmN0aW9uIChwYXJlbnRWYWwsIGNoaWxkVmFsLCB2bSkge1xuICBpZiAoIXZtKSB7XG4gICAgLy8gaW4gYSBWdWUuZXh0ZW5kIG1lcmdlLCBib3RoIHNob3VsZCBiZSBmdW5jdGlvbnNcbiAgICBpZiAoIWNoaWxkVmFsKSB7XG4gICAgICByZXR1cm4gcGFyZW50VmFsO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNoaWxkVmFsICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oJ1RoZSBcImRhdGFcIiBvcHRpb24gc2hvdWxkIGJlIGEgZnVuY3Rpb24gJyArICd0aGF0IHJldHVybnMgYSBwZXItaW5zdGFuY2UgdmFsdWUgaW4gY29tcG9uZW50ICcgKyAnZGVmaW5pdGlvbnMuJywgdm0pO1xuICAgICAgcmV0dXJuIHBhcmVudFZhbDtcbiAgICB9XG4gICAgaWYgKCFwYXJlbnRWYWwpIHtcbiAgICAgIHJldHVybiBjaGlsZFZhbDtcbiAgICB9XG4gICAgLy8gd2hlbiBwYXJlbnRWYWwgJiBjaGlsZFZhbCBhcmUgYm90aCBwcmVzZW50LFxuICAgIC8vIHdlIG5lZWQgdG8gcmV0dXJuIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAgIC8vIG1lcmdlZCByZXN1bHQgb2YgYm90aCBmdW5jdGlvbnMuLi4gbm8gbmVlZCB0b1xuICAgIC8vIGNoZWNrIGlmIHBhcmVudFZhbCBpcyBhIGZ1bmN0aW9uIGhlcmUgYmVjYXVzZVxuICAgIC8vIGl0IGhhcyB0byBiZSBhIGZ1bmN0aW9uIHRvIHBhc3MgcHJldmlvdXMgbWVyZ2VzLlxuICAgIHJldHVybiBmdW5jdGlvbiBtZXJnZWREYXRhRm4oKSB7XG4gICAgICByZXR1cm4gbWVyZ2VEYXRhKGNoaWxkVmFsLmNhbGwodGhpcyksIHBhcmVudFZhbC5jYWxsKHRoaXMpKTtcbiAgICB9O1xuICB9IGVsc2UgaWYgKHBhcmVudFZhbCB8fCBjaGlsZFZhbCkge1xuICAgIHJldHVybiBmdW5jdGlvbiBtZXJnZWRJbnN0YW5jZURhdGFGbigpIHtcbiAgICAgIC8vIGluc3RhbmNlIG1lcmdlXG4gICAgICB2YXIgaW5zdGFuY2VEYXRhID0gdHlwZW9mIGNoaWxkVmFsID09PSAnZnVuY3Rpb24nID8gY2hpbGRWYWwuY2FsbCh2bSkgOiBjaGlsZFZhbDtcbiAgICAgIHZhciBkZWZhdWx0RGF0YSA9IHR5cGVvZiBwYXJlbnRWYWwgPT09ICdmdW5jdGlvbicgPyBwYXJlbnRWYWwuY2FsbCh2bSkgOiB1bmRlZmluZWQ7XG4gICAgICBpZiAoaW5zdGFuY2VEYXRhKSB7XG4gICAgICAgIHJldHVybiBtZXJnZURhdGEoaW5zdGFuY2VEYXRhLCBkZWZhdWx0RGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZGVmYXVsdERhdGE7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxuLyoqXG4gKiBFbFxuICovXG5cbnN0cmF0cy5lbCA9IGZ1bmN0aW9uIChwYXJlbnRWYWwsIGNoaWxkVmFsLCB2bSkge1xuICBpZiAoIXZtICYmIGNoaWxkVmFsICYmIHR5cGVvZiBjaGlsZFZhbCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignVGhlIFwiZWxcIiBvcHRpb24gc2hvdWxkIGJlIGEgZnVuY3Rpb24gJyArICd0aGF0IHJldHVybnMgYSBwZXItaW5zdGFuY2UgdmFsdWUgaW4gY29tcG9uZW50ICcgKyAnZGVmaW5pdGlvbnMuJywgdm0pO1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgcmV0ID0gY2hpbGRWYWwgfHwgcGFyZW50VmFsO1xuICAvLyBpbnZva2UgdGhlIGVsZW1lbnQgZmFjdG9yeSBpZiB0aGlzIGlzIGluc3RhbmNlIG1lcmdlXG4gIHJldHVybiB2bSAmJiB0eXBlb2YgcmV0ID09PSAnZnVuY3Rpb24nID8gcmV0LmNhbGwodm0pIDogcmV0O1xufTtcblxuLyoqXG4gKiBIb29rcyBhbmQgcGFyYW0gYXR0cmlidXRlcyBhcmUgbWVyZ2VkIGFzIGFycmF5cy5cbiAqL1xuXG5zdHJhdHMuaW5pdCA9IHN0cmF0cy5jcmVhdGVkID0gc3RyYXRzLnJlYWR5ID0gc3RyYXRzLmF0dGFjaGVkID0gc3RyYXRzLmRldGFjaGVkID0gc3RyYXRzLmJlZm9yZUNvbXBpbGUgPSBzdHJhdHMuY29tcGlsZWQgPSBzdHJhdHMuYmVmb3JlRGVzdHJveSA9IHN0cmF0cy5kZXN0cm95ZWQgPSBzdHJhdHMuYWN0aXZhdGUgPSBmdW5jdGlvbiAocGFyZW50VmFsLCBjaGlsZFZhbCkge1xuICByZXR1cm4gY2hpbGRWYWwgPyBwYXJlbnRWYWwgPyBwYXJlbnRWYWwuY29uY2F0KGNoaWxkVmFsKSA6IGlzQXJyYXkoY2hpbGRWYWwpID8gY2hpbGRWYWwgOiBbY2hpbGRWYWxdIDogcGFyZW50VmFsO1xufTtcblxuLyoqXG4gKiBBc3NldHNcbiAqXG4gKiBXaGVuIGEgdm0gaXMgcHJlc2VudCAoaW5zdGFuY2UgY3JlYXRpb24pLCB3ZSBuZWVkIHRvIGRvXG4gKiBhIHRocmVlLXdheSBtZXJnZSBiZXR3ZWVuIGNvbnN0cnVjdG9yIG9wdGlvbnMsIGluc3RhbmNlXG4gKiBvcHRpb25zIGFuZCBwYXJlbnQgb3B0aW9ucy5cbiAqL1xuXG5mdW5jdGlvbiBtZXJnZUFzc2V0cyhwYXJlbnRWYWwsIGNoaWxkVmFsKSB7XG4gIHZhciByZXMgPSBPYmplY3QuY3JlYXRlKHBhcmVudFZhbCB8fCBudWxsKTtcbiAgcmV0dXJuIGNoaWxkVmFsID8gZXh0ZW5kKHJlcywgZ3VhcmRBcnJheUFzc2V0cyhjaGlsZFZhbCkpIDogcmVzO1xufVxuXG5jb25maWcuX2Fzc2V0VHlwZXMuZm9yRWFjaChmdW5jdGlvbiAodHlwZSkge1xuICBzdHJhdHNbdHlwZSArICdzJ10gPSBtZXJnZUFzc2V0cztcbn0pO1xuXG4vKipcbiAqIEV2ZW50cyAmIFdhdGNoZXJzLlxuICpcbiAqIEV2ZW50cyAmIHdhdGNoZXJzIGhhc2hlcyBzaG91bGQgbm90IG92ZXJ3cml0ZSBvbmVcbiAqIGFub3RoZXIsIHNvIHdlIG1lcmdlIHRoZW0gYXMgYXJyYXlzLlxuICovXG5cbnN0cmF0cy53YXRjaCA9IHN0cmF0cy5ldmVudHMgPSBmdW5jdGlvbiAocGFyZW50VmFsLCBjaGlsZFZhbCkge1xuICBpZiAoIWNoaWxkVmFsKSByZXR1cm4gcGFyZW50VmFsO1xuICBpZiAoIXBhcmVudFZhbCkgcmV0dXJuIGNoaWxkVmFsO1xuICB2YXIgcmV0ID0ge307XG4gIGV4dGVuZChyZXQsIHBhcmVudFZhbCk7XG4gIGZvciAodmFyIGtleSBpbiBjaGlsZFZhbCkge1xuICAgIHZhciBwYXJlbnQgPSByZXRba2V5XTtcbiAgICB2YXIgY2hpbGQgPSBjaGlsZFZhbFtrZXldO1xuICAgIGlmIChwYXJlbnQgJiYgIWlzQXJyYXkocGFyZW50KSkge1xuICAgICAgcGFyZW50ID0gW3BhcmVudF07XG4gICAgfVxuICAgIHJldFtrZXldID0gcGFyZW50ID8gcGFyZW50LmNvbmNhdChjaGlsZCkgOiBbY2hpbGRdO1xuICB9XG4gIHJldHVybiByZXQ7XG59O1xuXG4vKipcbiAqIE90aGVyIG9iamVjdCBoYXNoZXMuXG4gKi9cblxuc3RyYXRzLnByb3BzID0gc3RyYXRzLm1ldGhvZHMgPSBzdHJhdHMuY29tcHV0ZWQgPSBmdW5jdGlvbiAocGFyZW50VmFsLCBjaGlsZFZhbCkge1xuICBpZiAoIWNoaWxkVmFsKSByZXR1cm4gcGFyZW50VmFsO1xuICBpZiAoIXBhcmVudFZhbCkgcmV0dXJuIGNoaWxkVmFsO1xuICB2YXIgcmV0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgZXh0ZW5kKHJldCwgcGFyZW50VmFsKTtcbiAgZXh0ZW5kKHJldCwgY2hpbGRWYWwpO1xuICByZXR1cm4gcmV0O1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IHN0cmF0ZWd5LlxuICovXG5cbnZhciBkZWZhdWx0U3RyYXQgPSBmdW5jdGlvbiBkZWZhdWx0U3RyYXQocGFyZW50VmFsLCBjaGlsZFZhbCkge1xuICByZXR1cm4gY2hpbGRWYWwgPT09IHVuZGVmaW5lZCA/IHBhcmVudFZhbCA6IGNoaWxkVmFsO1xufTtcblxuLyoqXG4gKiBNYWtlIHN1cmUgY29tcG9uZW50IG9wdGlvbnMgZ2V0IGNvbnZlcnRlZCB0byBhY3R1YWxcbiAqIGNvbnN0cnVjdG9ycy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIGd1YXJkQ29tcG9uZW50cyhvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zLmNvbXBvbmVudHMpIHtcbiAgICB2YXIgY29tcG9uZW50cyA9IG9wdGlvbnMuY29tcG9uZW50cyA9IGd1YXJkQXJyYXlBc3NldHMob3B0aW9ucy5jb21wb25lbnRzKTtcbiAgICB2YXIgaWRzID0gT2JqZWN0LmtleXMoY29tcG9uZW50cyk7XG4gICAgdmFyIGRlZjtcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgdmFyIG1hcCA9IG9wdGlvbnMuX2NvbXBvbmVudE5hbWVNYXAgPSB7fTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBpZHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0gaWRzW2ldO1xuICAgICAgaWYgKGNvbW1vblRhZ1JFLnRlc3Qoa2V5KSB8fCByZXNlcnZlZFRhZ1JFLnRlc3Qoa2V5KSkge1xuICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oJ0RvIG5vdCB1c2UgYnVpbHQtaW4gb3IgcmVzZXJ2ZWQgSFRNTCBlbGVtZW50cyBhcyBjb21wb25lbnQgJyArICdpZDogJyArIGtleSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgLy8gcmVjb3JkIGEgYWxsIGxvd2VyY2FzZSA8LT4ga2ViYWItY2FzZSBtYXBwaW5nIGZvclxuICAgICAgLy8gcG9zc2libGUgY3VzdG9tIGVsZW1lbnQgY2FzZSBlcnJvciB3YXJuaW5nXG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICBtYXBba2V5LnJlcGxhY2UoLy0vZywgJycpLnRvTG93ZXJDYXNlKCldID0gaHlwaGVuYXRlKGtleSk7XG4gICAgICB9XG4gICAgICBkZWYgPSBjb21wb25lbnRzW2tleV07XG4gICAgICBpZiAoaXNQbGFpbk9iamVjdChkZWYpKSB7XG4gICAgICAgIGNvbXBvbmVudHNba2V5XSA9IFZ1ZS5leHRlbmQoZGVmKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFbnN1cmUgYWxsIHByb3BzIG9wdGlvbiBzeW50YXggYXJlIG5vcm1hbGl6ZWQgaW50byB0aGVcbiAqIE9iamVjdC1iYXNlZCBmb3JtYXQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBndWFyZFByb3BzKG9wdGlvbnMpIHtcbiAgdmFyIHByb3BzID0gb3B0aW9ucy5wcm9wcztcbiAgdmFyIGksIHZhbDtcbiAgaWYgKGlzQXJyYXkocHJvcHMpKSB7XG4gICAgb3B0aW9ucy5wcm9wcyA9IHt9O1xuICAgIGkgPSBwcm9wcy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdmFsID0gcHJvcHNbaV07XG4gICAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgb3B0aW9ucy5wcm9wc1t2YWxdID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAodmFsLm5hbWUpIHtcbiAgICAgICAgb3B0aW9ucy5wcm9wc1t2YWwubmFtZV0gPSB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QocHJvcHMpKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhwcm9wcyk7XG4gICAgaSA9IGtleXMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHZhbCA9IHByb3BzW2tleXNbaV1dO1xuICAgICAgaWYgKHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcHJvcHNba2V5c1tpXV0gPSB7IHR5cGU6IHZhbCB9O1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEd1YXJkIGFuIEFycmF5LWZvcm1hdCBhc3NldHMgb3B0aW9uIGFuZCBjb252ZXJ0ZWQgaXRcbiAqIGludG8gdGhlIGtleS12YWx1ZSBPYmplY3QgZm9ybWF0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBhc3NldHNcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBndWFyZEFycmF5QXNzZXRzKGFzc2V0cykge1xuICBpZiAoaXNBcnJheShhc3NldHMpKSB7XG4gICAgdmFyIHJlcyA9IHt9O1xuICAgIHZhciBpID0gYXNzZXRzLmxlbmd0aDtcbiAgICB2YXIgYXNzZXQ7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgYXNzZXQgPSBhc3NldHNbaV07XG4gICAgICB2YXIgaWQgPSB0eXBlb2YgYXNzZXQgPT09ICdmdW5jdGlvbicgPyBhc3NldC5vcHRpb25zICYmIGFzc2V0Lm9wdGlvbnMubmFtZSB8fCBhc3NldC5pZCA6IGFzc2V0Lm5hbWUgfHwgYXNzZXQuaWQ7XG4gICAgICBpZiAoIWlkKSB7XG4gICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignQXJyYXktc3ludGF4IGFzc2V0cyBtdXN0IHByb3ZpZGUgYSBcIm5hbWVcIiBvciBcImlkXCIgZmllbGQuJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNbaWRdID0gYXNzZXQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgcmV0dXJuIGFzc2V0cztcbn1cblxuLyoqXG4gKiBNZXJnZSB0d28gb3B0aW9uIG9iamVjdHMgaW50byBhIG5ldyBvbmUuXG4gKiBDb3JlIHV0aWxpdHkgdXNlZCBpbiBib3RoIGluc3RhbnRpYXRpb24gYW5kIGluaGVyaXRhbmNlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJlbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBjaGlsZFxuICogQHBhcmFtIHtWdWV9IFt2bV0gLSBpZiB2bSBpcyBwcmVzZW50LCBpbmRpY2F0ZXMgdGhpcyBpc1xuICogICAgICAgICAgICAgICAgICAgICBhbiBpbnN0YW50aWF0aW9uIG1lcmdlLlxuICovXG5cbmZ1bmN0aW9uIG1lcmdlT3B0aW9ucyhwYXJlbnQsIGNoaWxkLCB2bSkge1xuICBndWFyZENvbXBvbmVudHMoY2hpbGQpO1xuICBndWFyZFByb3BzKGNoaWxkKTtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBpZiAoY2hpbGQucHJvcHNEYXRhICYmICF2bSkge1xuICAgICAgd2FybigncHJvcHNEYXRhIGNhbiBvbmx5IGJlIHVzZWQgYXMgYW4gaW5zdGFudGlhdGlvbiBvcHRpb24uJyk7XG4gICAgfVxuICB9XG4gIHZhciBvcHRpb25zID0ge307XG4gIHZhciBrZXk7XG4gIGlmIChjaGlsZFsnZXh0ZW5kcyddKSB7XG4gICAgcGFyZW50ID0gdHlwZW9mIGNoaWxkWydleHRlbmRzJ10gPT09ICdmdW5jdGlvbicgPyBtZXJnZU9wdGlvbnMocGFyZW50LCBjaGlsZFsnZXh0ZW5kcyddLm9wdGlvbnMsIHZtKSA6IG1lcmdlT3B0aW9ucyhwYXJlbnQsIGNoaWxkWydleHRlbmRzJ10sIHZtKTtcbiAgfVxuICBpZiAoY2hpbGQubWl4aW5zKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGlsZC5taXhpbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBwYXJlbnQgPSBtZXJnZU9wdGlvbnMocGFyZW50LCBjaGlsZC5taXhpbnNbaV0sIHZtKTtcbiAgICB9XG4gIH1cbiAgZm9yIChrZXkgaW4gcGFyZW50KSB7XG4gICAgbWVyZ2VGaWVsZChrZXkpO1xuICB9XG4gIGZvciAoa2V5IGluIGNoaWxkKSB7XG4gICAgaWYgKCFoYXNPd24ocGFyZW50LCBrZXkpKSB7XG4gICAgICBtZXJnZUZpZWxkKGtleSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG1lcmdlRmllbGQoa2V5KSB7XG4gICAgdmFyIHN0cmF0ID0gc3RyYXRzW2tleV0gfHwgZGVmYXVsdFN0cmF0O1xuICAgIG9wdGlvbnNba2V5XSA9IHN0cmF0KHBhcmVudFtrZXldLCBjaGlsZFtrZXldLCB2bSwga2V5KTtcbiAgfVxuICByZXR1cm4gb3B0aW9ucztcbn1cblxuLyoqXG4gKiBSZXNvbHZlIGFuIGFzc2V0LlxuICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIGJlY2F1c2UgY2hpbGQgaW5zdGFuY2VzIG5lZWQgYWNjZXNzXG4gKiB0byBhc3NldHMgZGVmaW5lZCBpbiBpdHMgYW5jZXN0b3IgY2hhaW4uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge1N0cmluZ30gaWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gd2Fybk1pc3NpbmdcbiAqIEByZXR1cm4ge09iamVjdHxGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiByZXNvbHZlQXNzZXQob3B0aW9ucywgdHlwZSwgaWQsIHdhcm5NaXNzaW5nKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAodHlwZW9mIGlkICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgYXNzZXRzID0gb3B0aW9uc1t0eXBlXTtcbiAgdmFyIGNhbWVsaXplZElkO1xuICB2YXIgcmVzID0gYXNzZXRzW2lkXSB8fFxuICAvLyBjYW1lbENhc2UgSURcbiAgYXNzZXRzW2NhbWVsaXplZElkID0gY2FtZWxpemUoaWQpXSB8fFxuICAvLyBQYXNjYWwgQ2FzZSBJRFxuICBhc3NldHNbY2FtZWxpemVkSWQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBjYW1lbGl6ZWRJZC5zbGljZSgxKV07XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm5NaXNzaW5nICYmICFyZXMpIHtcbiAgICB3YXJuKCdGYWlsZWQgdG8gcmVzb2x2ZSAnICsgdHlwZS5zbGljZSgwLCAtMSkgKyAnOiAnICsgaWQsIG9wdGlvbnMpO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbnZhciB1aWQkMSA9IDA7XG5cbi8qKlxuICogQSBkZXAgaXMgYW4gb2JzZXJ2YWJsZSB0aGF0IGNhbiBoYXZlIG11bHRpcGxlXG4gKiBkaXJlY3RpdmVzIHN1YnNjcmliaW5nIHRvIGl0LlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEZXAoKSB7XG4gIHRoaXMuaWQgPSB1aWQkMSsrO1xuICB0aGlzLnN1YnMgPSBbXTtcbn1cblxuLy8gdGhlIGN1cnJlbnQgdGFyZ2V0IHdhdGNoZXIgYmVpbmcgZXZhbHVhdGVkLlxuLy8gdGhpcyBpcyBnbG9iYWxseSB1bmlxdWUgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBvbmx5IG9uZVxuLy8gd2F0Y2hlciBiZWluZyBldmFsdWF0ZWQgYXQgYW55IHRpbWUuXG5EZXAudGFyZ2V0ID0gbnVsbDtcblxuLyoqXG4gKiBBZGQgYSBkaXJlY3RpdmUgc3Vic2NyaWJlci5cbiAqXG4gKiBAcGFyYW0ge0RpcmVjdGl2ZX0gc3ViXG4gKi9cblxuRGVwLnByb3RvdHlwZS5hZGRTdWIgPSBmdW5jdGlvbiAoc3ViKSB7XG4gIHRoaXMuc3Vicy5wdXNoKHN1Yik7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhIGRpcmVjdGl2ZSBzdWJzY3JpYmVyLlxuICpcbiAqIEBwYXJhbSB7RGlyZWN0aXZlfSBzdWJcbiAqL1xuXG5EZXAucHJvdG90eXBlLnJlbW92ZVN1YiA9IGZ1bmN0aW9uIChzdWIpIHtcbiAgdGhpcy5zdWJzLiRyZW1vdmUoc3ViKTtcbn07XG5cbi8qKlxuICogQWRkIHNlbGYgYXMgYSBkZXBlbmRlbmN5IHRvIHRoZSB0YXJnZXQgd2F0Y2hlci5cbiAqL1xuXG5EZXAucHJvdG90eXBlLmRlcGVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgRGVwLnRhcmdldC5hZGREZXAodGhpcyk7XG59O1xuXG4vKipcbiAqIE5vdGlmeSBhbGwgc3Vic2NyaWJlcnMgb2YgYSBuZXcgdmFsdWUuXG4gKi9cblxuRGVwLnByb3RvdHlwZS5ub3RpZnkgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIHN0YWJsaXplIHRoZSBzdWJzY3JpYmVyIGxpc3QgZmlyc3RcbiAgdmFyIHN1YnMgPSB0b0FycmF5KHRoaXMuc3Vicyk7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gc3Vicy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBzdWJzW2ldLnVwZGF0ZSgpO1xuICB9XG59O1xuXG52YXIgYXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZTtcbnZhciBhcnJheU1ldGhvZHMgPSBPYmplY3QuY3JlYXRlKGFycmF5UHJvdG8pXG5cbi8qKlxuICogSW50ZXJjZXB0IG11dGF0aW5nIG1ldGhvZHMgYW5kIGVtaXQgZXZlbnRzXG4gKi9cblxuO1sncHVzaCcsICdwb3AnLCAnc2hpZnQnLCAndW5zaGlmdCcsICdzcGxpY2UnLCAnc29ydCcsICdyZXZlcnNlJ10uZm9yRWFjaChmdW5jdGlvbiAobWV0aG9kKSB7XG4gIC8vIGNhY2hlIG9yaWdpbmFsIG1ldGhvZFxuICB2YXIgb3JpZ2luYWwgPSBhcnJheVByb3RvW21ldGhvZF07XG4gIGRlZihhcnJheU1ldGhvZHMsIG1ldGhvZCwgZnVuY3Rpb24gbXV0YXRvcigpIHtcbiAgICAvLyBhdm9pZCBsZWFraW5nIGFyZ3VtZW50czpcbiAgICAvLyBodHRwOi8vanNwZXJmLmNvbS9jbG9zdXJlLXdpdGgtYXJndW1lbnRzXG4gICAgdmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGkpO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB2YXIgb2IgPSB0aGlzLl9fb2JfXztcbiAgICB2YXIgaW5zZXJ0ZWQ7XG4gICAgc3dpdGNoIChtZXRob2QpIHtcbiAgICAgIGNhc2UgJ3B1c2gnOlxuICAgICAgICBpbnNlcnRlZCA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndW5zaGlmdCc6XG4gICAgICAgIGluc2VydGVkID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzcGxpY2UnOlxuICAgICAgICBpbnNlcnRlZCA9IGFyZ3Muc2xpY2UoMik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoaW5zZXJ0ZWQpIG9iLm9ic2VydmVBcnJheShpbnNlcnRlZCk7XG4gICAgLy8gbm90aWZ5IGNoYW5nZVxuICAgIG9iLmRlcC5ub3RpZnkoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9KTtcbn0pO1xuXG4vKipcbiAqIFN3YXAgdGhlIGVsZW1lbnQgYXQgdGhlIGdpdmVuIGluZGV4IHdpdGggYSBuZXcgdmFsdWVcbiAqIGFuZCBlbWl0cyBjb3JyZXNwb25kaW5nIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4geyp9IC0gcmVwbGFjZWQgZWxlbWVudFxuICovXG5cbmRlZihhcnJheVByb3RvLCAnJHNldCcsIGZ1bmN0aW9uICRzZXQoaW5kZXgsIHZhbCkge1xuICBpZiAoaW5kZXggPj0gdGhpcy5sZW5ndGgpIHtcbiAgICB0aGlzLmxlbmd0aCA9IE51bWJlcihpbmRleCkgKyAxO1xuICB9XG4gIHJldHVybiB0aGlzLnNwbGljZShpbmRleCwgMSwgdmFsKVswXTtcbn0pO1xuXG4vKipcbiAqIENvbnZlbmllbmNlIG1ldGhvZCB0byByZW1vdmUgdGhlIGVsZW1lbnQgYXQgZ2l2ZW4gaW5kZXggb3IgdGFyZ2V0IGVsZW1lbnQgcmVmZXJlbmNlLlxuICpcbiAqIEBwYXJhbSB7Kn0gaXRlbVxuICovXG5cbmRlZihhcnJheVByb3RvLCAnJHJlbW92ZScsIGZ1bmN0aW9uICRyZW1vdmUoaXRlbSkge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKCF0aGlzLmxlbmd0aCkgcmV0dXJuO1xuICB2YXIgaW5kZXggPSBpbmRleE9mKHRoaXMsIGl0ZW0pO1xuICBpZiAoaW5kZXggPiAtMSkge1xuICAgIHJldHVybiB0aGlzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbn0pO1xuXG52YXIgYXJyYXlLZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYXJyYXlNZXRob2RzKTtcblxuLyoqXG4gKiBCeSBkZWZhdWx0LCB3aGVuIGEgcmVhY3RpdmUgcHJvcGVydHkgaXMgc2V0LCB0aGUgbmV3IHZhbHVlIGlzXG4gKiBhbHNvIGNvbnZlcnRlZCB0byBiZWNvbWUgcmVhY3RpdmUuIEhvd2V2ZXIgaW4gY2VydGFpbiBjYXNlcywgZS5nLlxuICogdi1mb3Igc2NvcGUgYWxpYXMgYW5kIHByb3BzLCB3ZSBkb24ndCB3YW50IHRvIGZvcmNlIGNvbnZlcnNpb25cbiAqIGJlY2F1c2UgdGhlIHZhbHVlIG1heSBiZSBhIG5lc3RlZCB2YWx1ZSB1bmRlciBhIGZyb3plbiBkYXRhIHN0cnVjdHVyZS5cbiAqXG4gKiBTbyB3aGVuZXZlciB3ZSB3YW50IHRvIHNldCBhIHJlYWN0aXZlIHByb3BlcnR5IHdpdGhvdXQgZm9yY2luZ1xuICogY29udmVyc2lvbiBvbiB0aGUgbmV3IHZhbHVlLCB3ZSB3cmFwIHRoYXQgY2FsbCBpbnNpZGUgdGhpcyBmdW5jdGlvbi5cbiAqL1xuXG52YXIgc2hvdWxkQ29udmVydCA9IHRydWU7XG5cbmZ1bmN0aW9uIHdpdGhvdXRDb252ZXJzaW9uKGZuKSB7XG4gIHNob3VsZENvbnZlcnQgPSBmYWxzZTtcbiAgZm4oKTtcbiAgc2hvdWxkQ29udmVydCA9IHRydWU7XG59XG5cbi8qKlxuICogT2JzZXJ2ZXIgY2xhc3MgdGhhdCBhcmUgYXR0YWNoZWQgdG8gZWFjaCBvYnNlcnZlZFxuICogb2JqZWN0LiBPbmNlIGF0dGFjaGVkLCB0aGUgb2JzZXJ2ZXIgY29udmVydHMgdGFyZ2V0XG4gKiBvYmplY3QncyBwcm9wZXJ0eSBrZXlzIGludG8gZ2V0dGVyL3NldHRlcnMgdGhhdFxuICogY29sbGVjdCBkZXBlbmRlbmNpZXMgYW5kIGRpc3BhdGNoZXMgdXBkYXRlcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gdmFsdWVcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5cbmZ1bmN0aW9uIE9ic2VydmVyKHZhbHVlKSB7XG4gIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgdGhpcy5kZXAgPSBuZXcgRGVwKCk7XG4gIGRlZih2YWx1ZSwgJ19fb2JfXycsIHRoaXMpO1xuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICB2YXIgYXVnbWVudCA9IGhhc1Byb3RvID8gcHJvdG9BdWdtZW50IDogY29weUF1Z21lbnQ7XG4gICAgYXVnbWVudCh2YWx1ZSwgYXJyYXlNZXRob2RzLCBhcnJheUtleXMpO1xuICAgIHRoaXMub2JzZXJ2ZUFycmF5KHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLndhbGsodmFsdWUpO1xuICB9XG59XG5cbi8vIEluc3RhbmNlIG1ldGhvZHNcblxuLyoqXG4gKiBXYWxrIHRocm91Z2ggZWFjaCBwcm9wZXJ0eSBhbmQgY29udmVydCB0aGVtIGludG9cbiAqIGdldHRlci9zZXR0ZXJzLiBUaGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSBjYWxsZWQgd2hlblxuICogdmFsdWUgdHlwZSBpcyBPYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICovXG5cbk9ic2VydmVyLnByb3RvdHlwZS53YWxrID0gZnVuY3Rpb24gKG9iaikge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG4gIGZvciAodmFyIGkgPSAwLCBsID0ga2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB0aGlzLmNvbnZlcnQoa2V5c1tpXSwgb2JqW2tleXNbaV1dKTtcbiAgfVxufTtcblxuLyoqXG4gKiBPYnNlcnZlIGEgbGlzdCBvZiBBcnJheSBpdGVtcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBpdGVtc1xuICovXG5cbk9ic2VydmVyLnByb3RvdHlwZS5vYnNlcnZlQXJyYXkgPSBmdW5jdGlvbiAoaXRlbXMpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBpdGVtcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBvYnNlcnZlKGl0ZW1zW2ldKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDb252ZXJ0IGEgcHJvcGVydHkgaW50byBnZXR0ZXIvc2V0dGVyIHNvIHdlIGNhbiBlbWl0XG4gKiB0aGUgZXZlbnRzIHdoZW4gdGhlIHByb3BlcnR5IGlzIGFjY2Vzc2VkL2NoYW5nZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHsqfSB2YWxcbiAqL1xuXG5PYnNlcnZlci5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uIChrZXksIHZhbCkge1xuICBkZWZpbmVSZWFjdGl2ZSh0aGlzLnZhbHVlLCBrZXksIHZhbCk7XG59O1xuXG4vKipcbiAqIEFkZCBhbiBvd25lciB2bSwgc28gdGhhdCB3aGVuICRzZXQvJGRlbGV0ZSBtdXRhdGlvbnNcbiAqIGhhcHBlbiB3ZSBjYW4gbm90aWZ5IG93bmVyIHZtcyB0byBwcm94eSB0aGUga2V5cyBhbmRcbiAqIGRpZ2VzdCB0aGUgd2F0Y2hlcnMuIFRoaXMgaXMgb25seSBjYWxsZWQgd2hlbiB0aGUgb2JqZWN0XG4gKiBpcyBvYnNlcnZlZCBhcyBhbiBpbnN0YW5jZSdzIHJvb3QgJGRhdGEuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKi9cblxuT2JzZXJ2ZXIucHJvdG90eXBlLmFkZFZtID0gZnVuY3Rpb24gKHZtKSB7XG4gICh0aGlzLnZtcyB8fCAodGhpcy52bXMgPSBbXSkpLnB1c2godm0pO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gb3duZXIgdm0uIFRoaXMgaXMgY2FsbGVkIHdoZW4gdGhlIG9iamVjdCBpc1xuICogc3dhcHBlZCBvdXQgYXMgYW4gaW5zdGFuY2UncyAkZGF0YSBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKi9cblxuT2JzZXJ2ZXIucHJvdG90eXBlLnJlbW92ZVZtID0gZnVuY3Rpb24gKHZtKSB7XG4gIHRoaXMudm1zLiRyZW1vdmUodm0pO1xufTtcblxuLy8gaGVscGVyc1xuXG4vKipcbiAqIEF1Z21lbnQgYW4gdGFyZ2V0IE9iamVjdCBvciBBcnJheSBieSBpbnRlcmNlcHRpbmdcbiAqIHRoZSBwcm90b3R5cGUgY2hhaW4gdXNpbmcgX19wcm90b19fXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IHRhcmdldFxuICogQHBhcmFtIHtPYmplY3R9IHNyY1xuICovXG5cbmZ1bmN0aW9uIHByb3RvQXVnbWVudCh0YXJnZXQsIHNyYykge1xuICAvKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuICB0YXJnZXQuX19wcm90b19fID0gc3JjO1xuICAvKiBlc2xpbnQtZW5hYmxlIG5vLXByb3RvICovXG59XG5cbi8qKlxuICogQXVnbWVudCBhbiB0YXJnZXQgT2JqZWN0IG9yIEFycmF5IGJ5IGRlZmluaW5nXG4gKiBoaWRkZW4gcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gdGFyZ2V0XG4gKiBAcGFyYW0ge09iamVjdH0gcHJvdG9cbiAqL1xuXG5mdW5jdGlvbiBjb3B5QXVnbWVudCh0YXJnZXQsIHNyYywga2V5cykge1xuICBmb3IgKHZhciBpID0gMCwgbCA9IGtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgZGVmKHRhcmdldCwga2V5LCBzcmNba2V5XSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBdHRlbXB0IHRvIGNyZWF0ZSBhbiBvYnNlcnZlciBpbnN0YW5jZSBmb3IgYSB2YWx1ZSxcbiAqIHJldHVybnMgdGhlIG5ldyBvYnNlcnZlciBpZiBzdWNjZXNzZnVsbHkgb2JzZXJ2ZWQsXG4gKiBvciB0aGUgZXhpc3Rpbmcgb2JzZXJ2ZXIgaWYgdGhlIHZhbHVlIGFscmVhZHkgaGFzIG9uZS5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcGFyYW0ge1Z1ZX0gW3ZtXVxuICogQHJldHVybiB7T2JzZXJ2ZXJ8dW5kZWZpbmVkfVxuICogQHN0YXRpY1xuICovXG5cbmZ1bmN0aW9uIG9ic2VydmUodmFsdWUsIHZtKSB7XG4gIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgb2I7XG4gIGlmIChoYXNPd24odmFsdWUsICdfX29iX18nKSAmJiB2YWx1ZS5fX29iX18gaW5zdGFuY2VvZiBPYnNlcnZlcikge1xuICAgIG9iID0gdmFsdWUuX19vYl9fO1xuICB9IGVsc2UgaWYgKHNob3VsZENvbnZlcnQgJiYgKGlzQXJyYXkodmFsdWUpIHx8IGlzUGxhaW5PYmplY3QodmFsdWUpKSAmJiBPYmplY3QuaXNFeHRlbnNpYmxlKHZhbHVlKSAmJiAhdmFsdWUuX2lzVnVlKSB7XG4gICAgb2IgPSBuZXcgT2JzZXJ2ZXIodmFsdWUpO1xuICB9XG4gIGlmIChvYiAmJiB2bSkge1xuICAgIG9iLmFkZFZtKHZtKTtcbiAgfVxuICByZXR1cm4gb2I7XG59XG5cbi8qKlxuICogRGVmaW5lIGEgcmVhY3RpdmUgcHJvcGVydHkgb24gYW4gT2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKi9cblxuZnVuY3Rpb24gZGVmaW5lUmVhY3RpdmUob2JqLCBrZXksIHZhbCkge1xuICB2YXIgZGVwID0gbmV3IERlcCgpO1xuXG4gIHZhciBwcm9wZXJ0eSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBrZXkpO1xuICBpZiAocHJvcGVydHkgJiYgcHJvcGVydHkuY29uZmlndXJhYmxlID09PSBmYWxzZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGNhdGVyIGZvciBwcmUtZGVmaW5lZCBnZXR0ZXIvc2V0dGVyc1xuICB2YXIgZ2V0dGVyID0gcHJvcGVydHkgJiYgcHJvcGVydHkuZ2V0O1xuICB2YXIgc2V0dGVyID0gcHJvcGVydHkgJiYgcHJvcGVydHkuc2V0O1xuXG4gIHZhciBjaGlsZE9iID0gb2JzZXJ2ZSh2YWwpO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uIHJlYWN0aXZlR2V0dGVyKCkge1xuICAgICAgdmFyIHZhbHVlID0gZ2V0dGVyID8gZ2V0dGVyLmNhbGwob2JqKSA6IHZhbDtcbiAgICAgIGlmIChEZXAudGFyZ2V0KSB7XG4gICAgICAgIGRlcC5kZXBlbmQoKTtcbiAgICAgICAgaWYgKGNoaWxkT2IpIHtcbiAgICAgICAgICBjaGlsZE9iLmRlcC5kZXBlbmQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICBmb3IgKHZhciBlLCBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgZSA9IHZhbHVlW2ldO1xuICAgICAgICAgICAgZSAmJiBlLl9fb2JfXyAmJiBlLl9fb2JfXy5kZXAuZGVwZW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uIHJlYWN0aXZlU2V0dGVyKG5ld1ZhbCkge1xuICAgICAgdmFyIHZhbHVlID0gZ2V0dGVyID8gZ2V0dGVyLmNhbGwob2JqKSA6IHZhbDtcbiAgICAgIGlmIChuZXdWYWwgPT09IHZhbHVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChzZXR0ZXIpIHtcbiAgICAgICAgc2V0dGVyLmNhbGwob2JqLCBuZXdWYWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gbmV3VmFsO1xuICAgICAgfVxuICAgICAgY2hpbGRPYiA9IG9ic2VydmUobmV3VmFsKTtcbiAgICAgIGRlcC5ub3RpZnkoKTtcbiAgICB9XG4gIH0pO1xufVxuXG5cblxudmFyIHV0aWwgPSBPYmplY3QuZnJlZXplKHtcblx0ZGVmaW5lUmVhY3RpdmU6IGRlZmluZVJlYWN0aXZlLFxuXHRzZXQ6IHNldCxcblx0ZGVsOiBkZWwsXG5cdGhhc093bjogaGFzT3duLFxuXHRpc0xpdGVyYWw6IGlzTGl0ZXJhbCxcblx0aXNSZXNlcnZlZDogaXNSZXNlcnZlZCxcblx0X3RvU3RyaW5nOiBfdG9TdHJpbmcsXG5cdHRvTnVtYmVyOiB0b051bWJlcixcblx0dG9Cb29sZWFuOiB0b0Jvb2xlYW4sXG5cdHN0cmlwUXVvdGVzOiBzdHJpcFF1b3Rlcyxcblx0Y2FtZWxpemU6IGNhbWVsaXplLFxuXHRoeXBoZW5hdGU6IGh5cGhlbmF0ZSxcblx0Y2xhc3NpZnk6IGNsYXNzaWZ5LFxuXHRiaW5kOiBiaW5kLFxuXHR0b0FycmF5OiB0b0FycmF5LFxuXHRleHRlbmQ6IGV4dGVuZCxcblx0aXNPYmplY3Q6IGlzT2JqZWN0LFxuXHRpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuXHRkZWY6IGRlZixcblx0ZGVib3VuY2U6IF9kZWJvdW5jZSxcblx0aW5kZXhPZjogaW5kZXhPZixcblx0Y2FuY2VsbGFibGU6IGNhbmNlbGxhYmxlLFxuXHRsb29zZUVxdWFsOiBsb29zZUVxdWFsLFxuXHRpc0FycmF5OiBpc0FycmF5LFxuXHRoYXNQcm90bzogaGFzUHJvdG8sXG5cdGluQnJvd3NlcjogaW5Ccm93c2VyLFxuXHRkZXZ0b29sczogZGV2dG9vbHMsXG5cdGlzSUU5OiBpc0lFOSxcblx0aXNBbmRyb2lkOiBpc0FuZHJvaWQsXG5cdGlzSW9zOiBpc0lvcyxcblx0aXNXZWNoYXQ6IGlzV2VjaGF0LFxuXHRnZXQgdHJhbnNpdGlvblByb3AgKCkgeyByZXR1cm4gdHJhbnNpdGlvblByb3A7IH0sXG5cdGdldCB0cmFuc2l0aW9uRW5kRXZlbnQgKCkgeyByZXR1cm4gdHJhbnNpdGlvbkVuZEV2ZW50OyB9LFxuXHRnZXQgYW5pbWF0aW9uUHJvcCAoKSB7IHJldHVybiBhbmltYXRpb25Qcm9wOyB9LFxuXHRnZXQgYW5pbWF0aW9uRW5kRXZlbnQgKCkgeyByZXR1cm4gYW5pbWF0aW9uRW5kRXZlbnQ7IH0sXG5cdG5leHRUaWNrOiBuZXh0VGljayxcblx0Z2V0IF9TZXQgKCkgeyByZXR1cm4gX1NldDsgfSxcblx0cXVlcnk6IHF1ZXJ5LFxuXHRpbkRvYzogaW5Eb2MsXG5cdGdldEF0dHI6IGdldEF0dHIsXG5cdGdldEJpbmRBdHRyOiBnZXRCaW5kQXR0cixcblx0aGFzQmluZEF0dHI6IGhhc0JpbmRBdHRyLFxuXHRiZWZvcmU6IGJlZm9yZSxcblx0YWZ0ZXI6IGFmdGVyLFxuXHRyZW1vdmU6IHJlbW92ZSxcblx0cHJlcGVuZDogcHJlcGVuZCxcblx0cmVwbGFjZTogcmVwbGFjZSxcblx0b246IG9uLFxuXHRvZmY6IG9mZixcblx0c2V0Q2xhc3M6IHNldENsYXNzLFxuXHRhZGRDbGFzczogYWRkQ2xhc3MsXG5cdHJlbW92ZUNsYXNzOiByZW1vdmVDbGFzcyxcblx0ZXh0cmFjdENvbnRlbnQ6IGV4dHJhY3RDb250ZW50LFxuXHR0cmltTm9kZTogdHJpbU5vZGUsXG5cdGlzVGVtcGxhdGU6IGlzVGVtcGxhdGUsXG5cdGNyZWF0ZUFuY2hvcjogY3JlYXRlQW5jaG9yLFxuXHRmaW5kUmVmOiBmaW5kUmVmLFxuXHRtYXBOb2RlUmFuZ2U6IG1hcE5vZGVSYW5nZSxcblx0cmVtb3ZlTm9kZVJhbmdlOiByZW1vdmVOb2RlUmFuZ2UsXG5cdGlzRnJhZ21lbnQ6IGlzRnJhZ21lbnQsXG5cdGdldE91dGVySFRNTDogZ2V0T3V0ZXJIVE1MLFxuXHRtZXJnZU9wdGlvbnM6IG1lcmdlT3B0aW9ucyxcblx0cmVzb2x2ZUFzc2V0OiByZXNvbHZlQXNzZXQsXG5cdGNoZWNrQ29tcG9uZW50QXR0cjogY2hlY2tDb21wb25lbnRBdHRyLFxuXHRjb21tb25UYWdSRTogY29tbW9uVGFnUkUsXG5cdHJlc2VydmVkVGFnUkU6IHJlc2VydmVkVGFnUkUsXG5cdGdldCB3YXJuICgpIHsgcmV0dXJuIHdhcm47IH1cbn0pO1xuXG52YXIgdWlkID0gMDtcblxuZnVuY3Rpb24gaW5pdE1peGluIChWdWUpIHtcbiAgLyoqXG4gICAqIFRoZSBtYWluIGluaXQgc2VxdWVuY2UuIFRoaXMgaXMgY2FsbGVkIGZvciBldmVyeVxuICAgKiBpbnN0YW5jZSwgaW5jbHVkaW5nIG9uZXMgdGhhdCBhcmUgY3JlYXRlZCBmcm9tIGV4dGVuZGVkXG4gICAqIGNvbnN0cnVjdG9ycy5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSB0aGlzIG9wdGlvbnMgb2JqZWN0IHNob3VsZCBiZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSByZXN1bHQgb2YgbWVyZ2luZyBjbGFzc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMgYW5kIHRoZSBvcHRpb25zIHBhc3NlZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGluIHRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB0aGlzLiRlbCA9IG51bGw7XG4gICAgdGhpcy4kcGFyZW50ID0gb3B0aW9ucy5wYXJlbnQ7XG4gICAgdGhpcy4kcm9vdCA9IHRoaXMuJHBhcmVudCA/IHRoaXMuJHBhcmVudC4kcm9vdCA6IHRoaXM7XG4gICAgdGhpcy4kY2hpbGRyZW4gPSBbXTtcbiAgICB0aGlzLiRyZWZzID0ge307IC8vIGNoaWxkIHZtIHJlZmVyZW5jZXNcbiAgICB0aGlzLiRlbHMgPSB7fTsgLy8gZWxlbWVudCByZWZlcmVuY2VzXG4gICAgdGhpcy5fd2F0Y2hlcnMgPSBbXTsgLy8gYWxsIHdhdGNoZXJzIGFzIGFuIGFycmF5XG4gICAgdGhpcy5fZGlyZWN0aXZlcyA9IFtdOyAvLyBhbGwgZGlyZWN0aXZlc1xuXG4gICAgLy8gYSB1aWRcbiAgICB0aGlzLl91aWQgPSB1aWQrKztcblxuICAgIC8vIGEgZmxhZyB0byBhdm9pZCB0aGlzIGJlaW5nIG9ic2VydmVkXG4gICAgdGhpcy5faXNWdWUgPSB0cnVlO1xuXG4gICAgLy8gZXZlbnRzIGJvb2trZWVwaW5nXG4gICAgdGhpcy5fZXZlbnRzID0ge307IC8vIHJlZ2lzdGVyZWQgY2FsbGJhY2tzXG4gICAgdGhpcy5fZXZlbnRzQ291bnQgPSB7fTsgLy8gZm9yICRicm9hZGNhc3Qgb3B0aW1pemF0aW9uXG5cbiAgICAvLyBmcmFnbWVudCBpbnN0YW5jZSBwcm9wZXJ0aWVzXG4gICAgdGhpcy5faXNGcmFnbWVudCA9IGZhbHNlO1xuICAgIHRoaXMuX2ZyYWdtZW50ID0gLy8gQHR5cGUge0RvY3VtZW50RnJhZ21lbnR9XG4gICAgdGhpcy5fZnJhZ21lbnRTdGFydCA9IC8vIEB0eXBlIHtUZXh0fENvbW1lbnR9XG4gICAgdGhpcy5fZnJhZ21lbnRFbmQgPSBudWxsOyAvLyBAdHlwZSB7VGV4dHxDb21tZW50fVxuXG4gICAgLy8gbGlmZWN5Y2xlIHN0YXRlXG4gICAgdGhpcy5faXNDb21waWxlZCA9IHRoaXMuX2lzRGVzdHJveWVkID0gdGhpcy5faXNSZWFkeSA9IHRoaXMuX2lzQXR0YWNoZWQgPSB0aGlzLl9pc0JlaW5nRGVzdHJveWVkID0gdGhpcy5fdkZvclJlbW92aW5nID0gZmFsc2U7XG4gICAgdGhpcy5fdW5saW5rRm4gPSBudWxsO1xuXG4gICAgLy8gY29udGV4dDpcbiAgICAvLyBpZiB0aGlzIGlzIGEgdHJhbnNjbHVkZWQgY29tcG9uZW50LCBjb250ZXh0XG4gICAgLy8gd2lsbCBiZSB0aGUgY29tbW9uIHBhcmVudCB2bSBvZiB0aGlzIGluc3RhbmNlXG4gICAgLy8gYW5kIGl0cyBob3N0LlxuICAgIHRoaXMuX2NvbnRleHQgPSBvcHRpb25zLl9jb250ZXh0IHx8IHRoaXMuJHBhcmVudDtcblxuICAgIC8vIHNjb3BlOlxuICAgIC8vIGlmIHRoaXMgaXMgaW5zaWRlIGFuIGlubGluZSB2LWZvciwgdGhlIHNjb3BlXG4gICAgLy8gd2lsbCBiZSB0aGUgaW50ZXJtZWRpYXRlIHNjb3BlIGNyZWF0ZWQgZm9yIHRoaXNcbiAgICAvLyByZXBlYXQgZnJhZ21lbnQuIHRoaXMgaXMgdXNlZCBmb3IgbGlua2luZyBwcm9wc1xuICAgIC8vIGFuZCBjb250YWluZXIgZGlyZWN0aXZlcy5cbiAgICB0aGlzLl9zY29wZSA9IG9wdGlvbnMuX3Njb3BlO1xuXG4gICAgLy8gZnJhZ21lbnQ6XG4gICAgLy8gaWYgdGhpcyBpbnN0YW5jZSBpcyBjb21waWxlZCBpbnNpZGUgYSBGcmFnbWVudCwgaXRcbiAgICAvLyBuZWVkcyB0byByZWlnc3RlciBpdHNlbGYgYXMgYSBjaGlsZCBvZiB0aGF0IGZyYWdtZW50XG4gICAgLy8gZm9yIGF0dGFjaC9kZXRhY2ggdG8gd29yayBwcm9wZXJseS5cbiAgICB0aGlzLl9mcmFnID0gb3B0aW9ucy5fZnJhZztcbiAgICBpZiAodGhpcy5fZnJhZykge1xuICAgICAgdGhpcy5fZnJhZy5jaGlsZHJlbi5wdXNoKHRoaXMpO1xuICAgIH1cblxuICAgIC8vIHB1c2ggc2VsZiBpbnRvIHBhcmVudCAvIHRyYW5zY2x1c2lvbiBob3N0XG4gICAgaWYgKHRoaXMuJHBhcmVudCkge1xuICAgICAgdGhpcy4kcGFyZW50LiRjaGlsZHJlbi5wdXNoKHRoaXMpO1xuICAgIH1cblxuICAgIC8vIG1lcmdlIG9wdGlvbnMuXG4gICAgb3B0aW9ucyA9IHRoaXMuJG9wdGlvbnMgPSBtZXJnZU9wdGlvbnModGhpcy5jb25zdHJ1Y3Rvci5vcHRpb25zLCBvcHRpb25zLCB0aGlzKTtcblxuICAgIC8vIHNldCByZWZcbiAgICB0aGlzLl91cGRhdGVSZWYoKTtcblxuICAgIC8vIGluaXRpYWxpemUgZGF0YSBhcyBlbXB0eSBvYmplY3QuXG4gICAgLy8gaXQgd2lsbCBiZSBmaWxsZWQgdXAgaW4gX2luaXREYXRhKCkuXG4gICAgdGhpcy5fZGF0YSA9IHt9O1xuXG4gICAgLy8gY2FsbCBpbml0IGhvb2tcbiAgICB0aGlzLl9jYWxsSG9vaygnaW5pdCcpO1xuXG4gICAgLy8gaW5pdGlhbGl6ZSBkYXRhIG9ic2VydmF0aW9uIGFuZCBzY29wZSBpbmhlcml0YW5jZS5cbiAgICB0aGlzLl9pbml0U3RhdGUoKTtcblxuICAgIC8vIHNldHVwIGV2ZW50IHN5c3RlbSBhbmQgb3B0aW9uIGV2ZW50cy5cbiAgICB0aGlzLl9pbml0RXZlbnRzKCk7XG5cbiAgICAvLyBjYWxsIGNyZWF0ZWQgaG9va1xuICAgIHRoaXMuX2NhbGxIb29rKCdjcmVhdGVkJyk7XG5cbiAgICAvLyBpZiBgZWxgIG9wdGlvbiBpcyBwYXNzZWQsIHN0YXJ0IGNvbXBpbGF0aW9uLlxuICAgIGlmIChvcHRpb25zLmVsKSB7XG4gICAgICB0aGlzLiRtb3VudChvcHRpb25zLmVsKTtcbiAgICB9XG4gIH07XG59XG5cbnZhciBwYXRoQ2FjaGUgPSBuZXcgQ2FjaGUoMTAwMCk7XG5cbi8vIGFjdGlvbnNcbnZhciBBUFBFTkQgPSAwO1xudmFyIFBVU0ggPSAxO1xudmFyIElOQ19TVUJfUEFUSF9ERVBUSCA9IDI7XG52YXIgUFVTSF9TVUJfUEFUSCA9IDM7XG5cbi8vIHN0YXRlc1xudmFyIEJFRk9SRV9QQVRIID0gMDtcbnZhciBJTl9QQVRIID0gMTtcbnZhciBCRUZPUkVfSURFTlQgPSAyO1xudmFyIElOX0lERU5UID0gMztcbnZhciBJTl9TVUJfUEFUSCA9IDQ7XG52YXIgSU5fU0lOR0xFX1FVT1RFID0gNTtcbnZhciBJTl9ET1VCTEVfUVVPVEUgPSA2O1xudmFyIEFGVEVSX1BBVEggPSA3O1xudmFyIEVSUk9SID0gODtcblxudmFyIHBhdGhTdGF0ZU1hY2hpbmUgPSBbXTtcblxucGF0aFN0YXRlTWFjaGluZVtCRUZPUkVfUEFUSF0gPSB7XG4gICd3cyc6IFtCRUZPUkVfUEFUSF0sXG4gICdpZGVudCc6IFtJTl9JREVOVCwgQVBQRU5EXSxcbiAgJ1snOiBbSU5fU1VCX1BBVEhdLFxuICAnZW9mJzogW0FGVEVSX1BBVEhdXG59O1xuXG5wYXRoU3RhdGVNYWNoaW5lW0lOX1BBVEhdID0ge1xuICAnd3MnOiBbSU5fUEFUSF0sXG4gICcuJzogW0JFRk9SRV9JREVOVF0sXG4gICdbJzogW0lOX1NVQl9QQVRIXSxcbiAgJ2VvZic6IFtBRlRFUl9QQVRIXVxufTtcblxucGF0aFN0YXRlTWFjaGluZVtCRUZPUkVfSURFTlRdID0ge1xuICAnd3MnOiBbQkVGT1JFX0lERU5UXSxcbiAgJ2lkZW50JzogW0lOX0lERU5ULCBBUFBFTkRdXG59O1xuXG5wYXRoU3RhdGVNYWNoaW5lW0lOX0lERU5UXSA9IHtcbiAgJ2lkZW50JzogW0lOX0lERU5ULCBBUFBFTkRdLFxuICAnMCc6IFtJTl9JREVOVCwgQVBQRU5EXSxcbiAgJ251bWJlcic6IFtJTl9JREVOVCwgQVBQRU5EXSxcbiAgJ3dzJzogW0lOX1BBVEgsIFBVU0hdLFxuICAnLic6IFtCRUZPUkVfSURFTlQsIFBVU0hdLFxuICAnWyc6IFtJTl9TVUJfUEFUSCwgUFVTSF0sXG4gICdlb2YnOiBbQUZURVJfUEFUSCwgUFVTSF1cbn07XG5cbnBhdGhTdGF0ZU1hY2hpbmVbSU5fU1VCX1BBVEhdID0ge1xuICBcIidcIjogW0lOX1NJTkdMRV9RVU9URSwgQVBQRU5EXSxcbiAgJ1wiJzogW0lOX0RPVUJMRV9RVU9URSwgQVBQRU5EXSxcbiAgJ1snOiBbSU5fU1VCX1BBVEgsIElOQ19TVUJfUEFUSF9ERVBUSF0sXG4gICddJzogW0lOX1BBVEgsIFBVU0hfU1VCX1BBVEhdLFxuICAnZW9mJzogRVJST1IsXG4gICdlbHNlJzogW0lOX1NVQl9QQVRILCBBUFBFTkRdXG59O1xuXG5wYXRoU3RhdGVNYWNoaW5lW0lOX1NJTkdMRV9RVU9URV0gPSB7XG4gIFwiJ1wiOiBbSU5fU1VCX1BBVEgsIEFQUEVORF0sXG4gICdlb2YnOiBFUlJPUixcbiAgJ2Vsc2UnOiBbSU5fU0lOR0xFX1FVT1RFLCBBUFBFTkRdXG59O1xuXG5wYXRoU3RhdGVNYWNoaW5lW0lOX0RPVUJMRV9RVU9URV0gPSB7XG4gICdcIic6IFtJTl9TVUJfUEFUSCwgQVBQRU5EXSxcbiAgJ2VvZic6IEVSUk9SLFxuICAnZWxzZSc6IFtJTl9ET1VCTEVfUVVPVEUsIEFQUEVORF1cbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHRoZSB0eXBlIG9mIGEgY2hhcmFjdGVyIGluIGEga2V5cGF0aC5cbiAqXG4gKiBAcGFyYW0ge0NoYXJ9IGNoXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHR5cGVcbiAqL1xuXG5mdW5jdGlvbiBnZXRQYXRoQ2hhclR5cGUoY2gpIHtcbiAgaWYgKGNoID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gJ2VvZic7XG4gIH1cblxuICB2YXIgY29kZSA9IGNoLmNoYXJDb2RlQXQoMCk7XG5cbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAweDVCOiAvLyBbXG4gICAgY2FzZSAweDVEOiAvLyBdXG4gICAgY2FzZSAweDJFOiAvLyAuXG4gICAgY2FzZSAweDIyOiAvLyBcIlxuICAgIGNhc2UgMHgyNzogLy8gJ1xuICAgIGNhc2UgMHgzMDpcbiAgICAgIC8vIDBcbiAgICAgIHJldHVybiBjaDtcblxuICAgIGNhc2UgMHg1RjogLy8gX1xuICAgIGNhc2UgMHgyNDpcbiAgICAgIC8vICRcbiAgICAgIHJldHVybiAnaWRlbnQnO1xuXG4gICAgY2FzZSAweDIwOiAvLyBTcGFjZVxuICAgIGNhc2UgMHgwOTogLy8gVGFiXG4gICAgY2FzZSAweDBBOiAvLyBOZXdsaW5lXG4gICAgY2FzZSAweDBEOiAvLyBSZXR1cm5cbiAgICBjYXNlIDB4QTA6IC8vIE5vLWJyZWFrIHNwYWNlXG4gICAgY2FzZSAweEZFRkY6IC8vIEJ5dGUgT3JkZXIgTWFya1xuICAgIGNhc2UgMHgyMDI4OiAvLyBMaW5lIFNlcGFyYXRvclxuICAgIGNhc2UgMHgyMDI5OlxuICAgICAgLy8gUGFyYWdyYXBoIFNlcGFyYXRvclxuICAgICAgcmV0dXJuICd3cyc7XG4gIH1cblxuICAvLyBhLXosIEEtWlxuICBpZiAoY29kZSA+PSAweDYxICYmIGNvZGUgPD0gMHg3QSB8fCBjb2RlID49IDB4NDEgJiYgY29kZSA8PSAweDVBKSB7XG4gICAgcmV0dXJuICdpZGVudCc7XG4gIH1cblxuICAvLyAxLTlcbiAgaWYgKGNvZGUgPj0gMHgzMSAmJiBjb2RlIDw9IDB4MzkpIHtcbiAgICByZXR1cm4gJ251bWJlcic7XG4gIH1cblxuICByZXR1cm4gJ2Vsc2UnO1xufVxuXG4vKipcbiAqIEZvcm1hdCBhIHN1YlBhdGgsIHJldHVybiBpdHMgcGxhaW4gZm9ybSBpZiBpdCBpc1xuICogYSBsaXRlcmFsIHN0cmluZyBvciBudW1iZXIuIE90aGVyd2lzZSBwcmVwZW5kIHRoZVxuICogZHluYW1pYyBpbmRpY2F0b3IgKCopLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gZm9ybWF0U3ViUGF0aChwYXRoKSB7XG4gIHZhciB0cmltbWVkID0gcGF0aC50cmltKCk7XG4gIC8vIGludmFsaWQgbGVhZGluZyAwXG4gIGlmIChwYXRoLmNoYXJBdCgwKSA9PT0gJzAnICYmIGlzTmFOKHBhdGgpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBpc0xpdGVyYWwodHJpbW1lZCkgPyBzdHJpcFF1b3Rlcyh0cmltbWVkKSA6ICcqJyArIHRyaW1tZWQ7XG59XG5cbi8qKlxuICogUGFyc2UgYSBzdHJpbmcgcGF0aCBpbnRvIGFuIGFycmF5IG9mIHNlZ21lbnRzXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAqIEByZXR1cm4ge0FycmF5fHVuZGVmaW5lZH1cbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShwYXRoKSB7XG4gIHZhciBrZXlzID0gW107XG4gIHZhciBpbmRleCA9IC0xO1xuICB2YXIgbW9kZSA9IEJFRk9SRV9QQVRIO1xuICB2YXIgc3ViUGF0aERlcHRoID0gMDtcbiAgdmFyIGMsIG5ld0NoYXIsIGtleSwgdHlwZSwgdHJhbnNpdGlvbiwgYWN0aW9uLCB0eXBlTWFwO1xuXG4gIHZhciBhY3Rpb25zID0gW107XG5cbiAgYWN0aW9uc1tQVVNIXSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoa2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAga2V5ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfTtcblxuICBhY3Rpb25zW0FQUEVORF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGtleSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBrZXkgPSBuZXdDaGFyO1xuICAgIH0gZWxzZSB7XG4gICAgICBrZXkgKz0gbmV3Q2hhcjtcbiAgICB9XG4gIH07XG5cbiAgYWN0aW9uc1tJTkNfU1VCX1BBVEhfREVQVEhdID0gZnVuY3Rpb24gKCkge1xuICAgIGFjdGlvbnNbQVBQRU5EXSgpO1xuICAgIHN1YlBhdGhEZXB0aCsrO1xuICB9O1xuXG4gIGFjdGlvbnNbUFVTSF9TVUJfUEFUSF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHN1YlBhdGhEZXB0aCA+IDApIHtcbiAgICAgIHN1YlBhdGhEZXB0aC0tO1xuICAgICAgbW9kZSA9IElOX1NVQl9QQVRIO1xuICAgICAgYWN0aW9uc1tBUFBFTkRdKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1YlBhdGhEZXB0aCA9IDA7XG4gICAgICBrZXkgPSBmb3JtYXRTdWJQYXRoKGtleSk7XG4gICAgICBpZiAoa2V5ID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY3Rpb25zW1BVU0hdKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIG1heWJlVW5lc2NhcGVRdW90ZSgpIHtcbiAgICB2YXIgbmV4dENoYXIgPSBwYXRoW2luZGV4ICsgMV07XG4gICAgaWYgKG1vZGUgPT09IElOX1NJTkdMRV9RVU9URSAmJiBuZXh0Q2hhciA9PT0gXCInXCIgfHwgbW9kZSA9PT0gSU5fRE9VQkxFX1FVT1RFICYmIG5leHRDaGFyID09PSAnXCInKSB7XG4gICAgICBpbmRleCsrO1xuICAgICAgbmV3Q2hhciA9ICdcXFxcJyArIG5leHRDaGFyO1xuICAgICAgYWN0aW9uc1tBUFBFTkRdKCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICB3aGlsZSAobW9kZSAhPSBudWxsKSB7XG4gICAgaW5kZXgrKztcbiAgICBjID0gcGF0aFtpbmRleF07XG5cbiAgICBpZiAoYyA9PT0gJ1xcXFwnICYmIG1heWJlVW5lc2NhcGVRdW90ZSgpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB0eXBlID0gZ2V0UGF0aENoYXJUeXBlKGMpO1xuICAgIHR5cGVNYXAgPSBwYXRoU3RhdGVNYWNoaW5lW21vZGVdO1xuICAgIHRyYW5zaXRpb24gPSB0eXBlTWFwW3R5cGVdIHx8IHR5cGVNYXBbJ2Vsc2UnXSB8fCBFUlJPUjtcblxuICAgIGlmICh0cmFuc2l0aW9uID09PSBFUlJPUikge1xuICAgICAgcmV0dXJuOyAvLyBwYXJzZSBlcnJvclxuICAgIH1cblxuICAgIG1vZGUgPSB0cmFuc2l0aW9uWzBdO1xuICAgIGFjdGlvbiA9IGFjdGlvbnNbdHJhbnNpdGlvblsxXV07XG4gICAgaWYgKGFjdGlvbikge1xuICAgICAgbmV3Q2hhciA9IHRyYW5zaXRpb25bMl07XG4gICAgICBuZXdDaGFyID0gbmV3Q2hhciA9PT0gdW5kZWZpbmVkID8gYyA6IG5ld0NoYXI7XG4gICAgICBpZiAoYWN0aW9uKCkgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobW9kZSA9PT0gQUZURVJfUEFUSCkge1xuICAgICAga2V5cy5yYXcgPSBwYXRoO1xuICAgICAgcmV0dXJuIGtleXM7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRXh0ZXJuYWwgcGFyc2UgdGhhdCBjaGVjayBmb3IgYSBjYWNoZSBoaXQgZmlyc3RcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICogQHJldHVybiB7QXJyYXl8dW5kZWZpbmVkfVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlUGF0aChwYXRoKSB7XG4gIHZhciBoaXQgPSBwYXRoQ2FjaGUuZ2V0KHBhdGgpO1xuICBpZiAoIWhpdCkge1xuICAgIGhpdCA9IHBhcnNlKHBhdGgpO1xuICAgIGlmIChoaXQpIHtcbiAgICAgIHBhdGhDYWNoZS5wdXQocGF0aCwgaGl0KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGhpdDtcbn1cblxuLyoqXG4gKiBHZXQgZnJvbSBhbiBvYmplY3QgZnJvbSBhIHBhdGggc3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAqL1xuXG5mdW5jdGlvbiBnZXRQYXRoKG9iaiwgcGF0aCkge1xuICByZXR1cm4gcGFyc2VFeHByZXNzaW9uKHBhdGgpLmdldChvYmopO1xufVxuXG4vKipcbiAqIFdhcm4gYWdhaW5zdCBzZXR0aW5nIG5vbi1leGlzdGVudCByb290IHBhdGggb24gYSB2bS5cbiAqL1xuXG52YXIgd2Fybk5vbkV4aXN0ZW50O1xuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgd2Fybk5vbkV4aXN0ZW50ID0gZnVuY3Rpb24gKHBhdGgsIHZtKSB7XG4gICAgd2FybignWW91IGFyZSBzZXR0aW5nIGEgbm9uLWV4aXN0ZW50IHBhdGggXCInICsgcGF0aC5yYXcgKyAnXCIgJyArICdvbiBhIHZtIGluc3RhbmNlLiBDb25zaWRlciBwcmUtaW5pdGlhbGl6aW5nIHRoZSBwcm9wZXJ0eSAnICsgJ3dpdGggdGhlIFwiZGF0YVwiIG9wdGlvbiBmb3IgbW9yZSByZWxpYWJsZSByZWFjdGl2aXR5ICcgKyAnYW5kIGJldHRlciBwZXJmb3JtYW5jZS4nLCB2bSk7XG4gIH07XG59XG5cbi8qKlxuICogU2V0IG9uIGFuIG9iamVjdCBmcm9tIGEgcGF0aFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7U3RyaW5nIHwgQXJyYXl9IHBhdGhcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKi9cblxuZnVuY3Rpb24gc2V0UGF0aChvYmosIHBhdGgsIHZhbCkge1xuICB2YXIgb3JpZ2luYWwgPSBvYmo7XG4gIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICBwYXRoID0gcGFyc2UocGF0aCk7XG4gIH1cbiAgaWYgKCFwYXRoIHx8ICFpc09iamVjdChvYmopKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBsYXN0LCBrZXk7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gcGF0aC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBsYXN0ID0gb2JqO1xuICAgIGtleSA9IHBhdGhbaV07XG4gICAgaWYgKGtleS5jaGFyQXQoMCkgPT09ICcqJykge1xuICAgICAga2V5ID0gcGFyc2VFeHByZXNzaW9uKGtleS5zbGljZSgxKSkuZ2V0LmNhbGwob3JpZ2luYWwsIG9yaWdpbmFsKTtcbiAgICB9XG4gICAgaWYgKGkgPCBsIC0gMSkge1xuICAgICAgb2JqID0gb2JqW2tleV07XG4gICAgICBpZiAoIWlzT2JqZWN0KG9iaikpIHtcbiAgICAgICAgb2JqID0ge307XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIGxhc3QuX2lzVnVlKSB7XG4gICAgICAgICAgd2Fybk5vbkV4aXN0ZW50KHBhdGgsIGxhc3QpO1xuICAgICAgICB9XG4gICAgICAgIHNldChsYXN0LCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgb2JqLiRzZXQoa2V5LCB2YWwpO1xuICAgICAgfSBlbHNlIGlmIChrZXkgaW4gb2JqKSB7XG4gICAgICAgIG9ialtrZXldID0gdmFsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgb2JqLl9pc1Z1ZSkge1xuICAgICAgICAgIHdhcm5Ob25FeGlzdGVudChwYXRoLCBvYmopO1xuICAgICAgICB9XG4gICAgICAgIHNldChvYmosIGtleSwgdmFsKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbnZhciBwYXRoID0gT2JqZWN0LmZyZWV6ZSh7XG4gIHBhcnNlUGF0aDogcGFyc2VQYXRoLFxuICBnZXRQYXRoOiBnZXRQYXRoLFxuICBzZXRQYXRoOiBzZXRQYXRoXG59KTtcblxudmFyIGV4cHJlc3Npb25DYWNoZSA9IG5ldyBDYWNoZSgxMDAwKTtcblxudmFyIGFsbG93ZWRLZXl3b3JkcyA9ICdNYXRoLERhdGUsdGhpcyx0cnVlLGZhbHNlLG51bGwsdW5kZWZpbmVkLEluZmluaXR5LE5hTiwnICsgJ2lzTmFOLGlzRmluaXRlLGRlY29kZVVSSSxkZWNvZGVVUklDb21wb25lbnQsZW5jb2RlVVJJLCcgKyAnZW5jb2RlVVJJQ29tcG9uZW50LHBhcnNlSW50LHBhcnNlRmxvYXQnO1xudmFyIGFsbG93ZWRLZXl3b3Jkc1JFID0gbmV3IFJlZ0V4cCgnXignICsgYWxsb3dlZEtleXdvcmRzLnJlcGxhY2UoLywvZywgJ1xcXFxifCcpICsgJ1xcXFxiKScpO1xuXG4vLyBrZXl3b3JkcyB0aGF0IGRvbid0IG1ha2Ugc2Vuc2UgaW5zaWRlIGV4cHJlc3Npb25zXG52YXIgaW1wcm9wZXJLZXl3b3JkcyA9ICdicmVhayxjYXNlLGNsYXNzLGNhdGNoLGNvbnN0LGNvbnRpbnVlLGRlYnVnZ2VyLGRlZmF1bHQsJyArICdkZWxldGUsZG8sZWxzZSxleHBvcnQsZXh0ZW5kcyxmaW5hbGx5LGZvcixmdW5jdGlvbixpZiwnICsgJ2ltcG9ydCxpbixpbnN0YW5jZW9mLGxldCxyZXR1cm4sc3VwZXIsc3dpdGNoLHRocm93LHRyeSwnICsgJ3Zhcix3aGlsZSx3aXRoLHlpZWxkLGVudW0sYXdhaXQsaW1wbGVtZW50cyxwYWNrYWdlLCcgKyAncHJvdGVjdGVkLHN0YXRpYyxpbnRlcmZhY2UscHJpdmF0ZSxwdWJsaWMnO1xudmFyIGltcHJvcGVyS2V5d29yZHNSRSA9IG5ldyBSZWdFeHAoJ14oJyArIGltcHJvcGVyS2V5d29yZHMucmVwbGFjZSgvLC9nLCAnXFxcXGJ8JykgKyAnXFxcXGIpJyk7XG5cbnZhciB3c1JFID0gL1xccy9nO1xudmFyIG5ld2xpbmVSRSA9IC9cXG4vZztcbnZhciBzYXZlUkUgPSAvW1xceyxdXFxzKltcXHdcXCRfXStcXHMqOnwoJyg/OlteJ1xcXFxdfFxcXFwuKSonfFwiKD86W15cIlxcXFxdfFxcXFwuKSpcInxgKD86W15gXFxcXF18XFxcXC4pKlxcJFxce3xcXH0oPzpbXmBcXFxcXXxcXFxcLikqYHxgKD86W15gXFxcXF18XFxcXC4pKmApfG5ldyB8dHlwZW9mIHx2b2lkIC9nO1xudmFyIHJlc3RvcmVSRSA9IC9cIihcXGQrKVwiL2c7XG52YXIgcGF0aFRlc3RSRSA9IC9eW0EtWmEtel8kXVtcXHckXSooPzpcXC5bQS1aYS16XyRdW1xcdyRdKnxcXFsnLio/J1xcXXxcXFtcIi4qP1wiXFxdfFxcW1xcZCtcXF18XFxbW0EtWmEtel8kXVtcXHckXSpcXF0pKiQvO1xudmFyIGlkZW50UkUgPSAvW15cXHckXFwuXSg/OltBLVphLXpfJF1bXFx3JF0qKS9nO1xudmFyIGJvb2xlYW5MaXRlcmFsUkUgPSAvXig/OnRydWV8ZmFsc2UpJC87XG5cbi8qKlxuICogU2F2ZSAvIFJld3JpdGUgLyBSZXN0b3JlXG4gKlxuICogV2hlbiByZXdyaXRpbmcgcGF0aHMgZm91bmQgaW4gYW4gZXhwcmVzc2lvbiwgaXQgaXNcbiAqIHBvc3NpYmxlIGZvciB0aGUgc2FtZSBsZXR0ZXIgc2VxdWVuY2VzIHRvIGJlIGZvdW5kIGluXG4gKiBzdHJpbmdzIGFuZCBPYmplY3QgbGl0ZXJhbCBwcm9wZXJ0eSBrZXlzLiBUaGVyZWZvcmUgd2VcbiAqIHJlbW92ZSBhbmQgc3RvcmUgdGhlc2UgcGFydHMgaW4gYSB0ZW1wb3JhcnkgYXJyYXksIGFuZFxuICogcmVzdG9yZSB0aGVtIGFmdGVyIHRoZSBwYXRoIHJld3JpdGUuXG4gKi9cblxudmFyIHNhdmVkID0gW107XG5cbi8qKlxuICogU2F2ZSByZXBsYWNlclxuICpcbiAqIFRoZSBzYXZlIHJlZ2V4IGNhbiBtYXRjaCB0d28gcG9zc2libGUgY2FzZXM6XG4gKiAxLiBBbiBvcGVuaW5nIG9iamVjdCBsaXRlcmFsXG4gKiAyLiBBIHN0cmluZ1xuICogSWYgbWF0Y2hlZCBhcyBhIHBsYWluIHN0cmluZywgd2UgbmVlZCB0byBlc2NhcGUgaXRzXG4gKiBuZXdsaW5lcywgc2luY2UgdGhlIHN0cmluZyBuZWVkcyB0byBiZSBwcmVzZXJ2ZWQgd2hlblxuICogZ2VuZXJhdGluZyB0aGUgZnVuY3Rpb24gYm9keS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ30gaXNTdHJpbmcgLSBzdHIgaWYgbWF0Y2hlZCBhcyBhIHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfSAtIHBsYWNlaG9sZGVyIHdpdGggaW5kZXhcbiAqL1xuXG5mdW5jdGlvbiBzYXZlKHN0ciwgaXNTdHJpbmcpIHtcbiAgdmFyIGkgPSBzYXZlZC5sZW5ndGg7XG4gIHNhdmVkW2ldID0gaXNTdHJpbmcgPyBzdHIucmVwbGFjZShuZXdsaW5lUkUsICdcXFxcbicpIDogc3RyO1xuICByZXR1cm4gJ1wiJyArIGkgKyAnXCInO1xufVxuXG4vKipcbiAqIFBhdGggcmV3cml0ZSByZXBsYWNlclxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSByYXdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiByZXdyaXRlKHJhdykge1xuICB2YXIgYyA9IHJhdy5jaGFyQXQoMCk7XG4gIHZhciBwYXRoID0gcmF3LnNsaWNlKDEpO1xuICBpZiAoYWxsb3dlZEtleXdvcmRzUkUudGVzdChwYXRoKSkge1xuICAgIHJldHVybiByYXc7XG4gIH0gZWxzZSB7XG4gICAgcGF0aCA9IHBhdGguaW5kZXhPZignXCInKSA+IC0xID8gcGF0aC5yZXBsYWNlKHJlc3RvcmVSRSwgcmVzdG9yZSkgOiBwYXRoO1xuICAgIHJldHVybiBjICsgJ3Njb3BlLicgKyBwYXRoO1xuICB9XG59XG5cbi8qKlxuICogUmVzdG9yZSByZXBsYWNlclxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBpIC0gbWF0Y2hlZCBzYXZlIGluZGV4XG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gcmVzdG9yZShzdHIsIGkpIHtcbiAgcmV0dXJuIHNhdmVkW2ldO1xufVxuXG4vKipcbiAqIFJld3JpdGUgYW4gZXhwcmVzc2lvbiwgcHJlZml4aW5nIGFsbCBwYXRoIGFjY2Vzc29ycyB3aXRoXG4gKiBgc2NvcGUuYCBhbmQgZ2VuZXJhdGUgZ2V0dGVyL3NldHRlciBmdW5jdGlvbnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV4cFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gY29tcGlsZUdldHRlcihleHApIHtcbiAgaWYgKGltcHJvcGVyS2V5d29yZHNSRS50ZXN0KGV4cCkpIHtcbiAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oJ0F2b2lkIHVzaW5nIHJlc2VydmVkIGtleXdvcmRzIGluIGV4cHJlc3Npb246ICcgKyBleHApO1xuICB9XG4gIC8vIHJlc2V0IHN0YXRlXG4gIHNhdmVkLmxlbmd0aCA9IDA7XG4gIC8vIHNhdmUgc3RyaW5ncyBhbmQgb2JqZWN0IGxpdGVyYWwga2V5c1xuICB2YXIgYm9keSA9IGV4cC5yZXBsYWNlKHNhdmVSRSwgc2F2ZSkucmVwbGFjZSh3c1JFLCAnJyk7XG4gIC8vIHJld3JpdGUgYWxsIHBhdGhzXG4gIC8vIHBhZCAxIHNwYWNlIGhlcmUgYmVjYXVlIHRoZSByZWdleCBtYXRjaGVzIDEgZXh0cmEgY2hhclxuICBib2R5ID0gKCcgJyArIGJvZHkpLnJlcGxhY2UoaWRlbnRSRSwgcmV3cml0ZSkucmVwbGFjZShyZXN0b3JlUkUsIHJlc3RvcmUpO1xuICByZXR1cm4gbWFrZUdldHRlckZuKGJvZHkpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgZ2V0dGVyIGZ1bmN0aW9uLiBSZXF1aXJlcyBldmFsLlxuICpcbiAqIFdlIGlzb2xhdGUgdGhlIHRyeS9jYXRjaCBzbyBpdCBkb2Vzbid0IGFmZmVjdCB0aGVcbiAqIG9wdGltaXphdGlvbiBvZiB0aGUgcGFyc2UgZnVuY3Rpb24gd2hlbiBpdCBpcyBub3QgY2FsbGVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBib2R5XG4gKiBAcmV0dXJuIHtGdW5jdGlvbnx1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gbWFrZUdldHRlckZuKGJvZHkpIHtcbiAgdHJ5IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1uZXctZnVuYyAqL1xuICAgIHJldHVybiBuZXcgRnVuY3Rpb24oJ3Njb3BlJywgJ3JldHVybiAnICsgYm9keSArICc7Jyk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1uZXctZnVuYyAqL1xuICB9IGNhdGNoIChlKSB7XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdJbnZhbGlkIGV4cHJlc3Npb24uICcgKyAnR2VuZXJhdGVkIGZ1bmN0aW9uIGJvZHk6ICcgKyBib2R5KTtcbiAgfVxufVxuXG4vKipcbiAqIENvbXBpbGUgYSBzZXR0ZXIgZnVuY3Rpb24gZm9yIHRoZSBleHByZXNzaW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBleHBcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufHVuZGVmaW5lZH1cbiAqL1xuXG5mdW5jdGlvbiBjb21waWxlU2V0dGVyKGV4cCkge1xuICB2YXIgcGF0aCA9IHBhcnNlUGF0aChleHApO1xuICBpZiAocGF0aCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NvcGUsIHZhbCkge1xuICAgICAgc2V0UGF0aChzY29wZSwgcGF0aCwgdmFsKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignSW52YWxpZCBzZXR0ZXIgZXhwcmVzc2lvbjogJyArIGV4cCk7XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSBhbiBleHByZXNzaW9uIGludG8gcmUtd3JpdHRlbiBnZXR0ZXIvc2V0dGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXhwXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG5lZWRTZXRcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlRXhwcmVzc2lvbihleHAsIG5lZWRTZXQpIHtcbiAgZXhwID0gZXhwLnRyaW0oKTtcbiAgLy8gdHJ5IGNhY2hlXG4gIHZhciBoaXQgPSBleHByZXNzaW9uQ2FjaGUuZ2V0KGV4cCk7XG4gIGlmIChoaXQpIHtcbiAgICBpZiAobmVlZFNldCAmJiAhaGl0LnNldCkge1xuICAgICAgaGl0LnNldCA9IGNvbXBpbGVTZXR0ZXIoaGl0LmV4cCk7XG4gICAgfVxuICAgIHJldHVybiBoaXQ7XG4gIH1cbiAgdmFyIHJlcyA9IHsgZXhwOiBleHAgfTtcbiAgcmVzLmdldCA9IGlzU2ltcGxlUGF0aChleHApICYmIGV4cC5pbmRleE9mKCdbJykgPCAwXG4gIC8vIG9wdGltaXplZCBzdXBlciBzaW1wbGUgZ2V0dGVyXG4gID8gbWFrZUdldHRlckZuKCdzY29wZS4nICsgZXhwKVxuICAvLyBkeW5hbWljIGdldHRlclxuICA6IGNvbXBpbGVHZXR0ZXIoZXhwKTtcbiAgaWYgKG5lZWRTZXQpIHtcbiAgICByZXMuc2V0ID0gY29tcGlsZVNldHRlcihleHApO1xuICB9XG4gIGV4cHJlc3Npb25DYWNoZS5wdXQoZXhwLCByZXMpO1xuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGFuIGV4cHJlc3Npb24gaXMgYSBzaW1wbGUgcGF0aC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXhwXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzU2ltcGxlUGF0aChleHApIHtcbiAgcmV0dXJuIHBhdGhUZXN0UkUudGVzdChleHApICYmXG4gIC8vIGRvbid0IHRyZWF0IHRydWUvZmFsc2UgYXMgcGF0aHNcbiAgIWJvb2xlYW5MaXRlcmFsUkUudGVzdChleHApICYmXG4gIC8vIE1hdGggY29uc3RhbnRzIGUuZy4gTWF0aC5QSSwgTWF0aC5FIGV0Yy5cbiAgZXhwLnNsaWNlKDAsIDUpICE9PSAnTWF0aC4nO1xufVxuXG52YXIgZXhwcmVzc2lvbiA9IE9iamVjdC5mcmVlemUoe1xuICBwYXJzZUV4cHJlc3Npb246IHBhcnNlRXhwcmVzc2lvbixcbiAgaXNTaW1wbGVQYXRoOiBpc1NpbXBsZVBhdGhcbn0pO1xuXG4vLyB3ZSBoYXZlIHR3byBzZXBhcmF0ZSBxdWV1ZXM6IG9uZSBmb3IgZGlyZWN0aXZlIHVwZGF0ZXNcbi8vIGFuZCBvbmUgZm9yIHVzZXIgd2F0Y2hlciByZWdpc3RlcmVkIHZpYSAkd2F0Y2goKS5cbi8vIHdlIHdhbnQgdG8gZ3VhcmFudGVlIGRpcmVjdGl2ZSB1cGRhdGVzIHRvIGJlIGNhbGxlZFxuLy8gYmVmb3JlIHVzZXIgd2F0Y2hlcnMgc28gdGhhdCB3aGVuIHVzZXIgd2F0Y2hlcnMgYXJlXG4vLyB0cmlnZ2VyZWQsIHRoZSBET00gd291bGQgaGF2ZSBhbHJlYWR5IGJlZW4gaW4gdXBkYXRlZFxuLy8gc3RhdGUuXG5cbnZhciBxdWV1ZSA9IFtdO1xudmFyIHVzZXJRdWV1ZSA9IFtdO1xudmFyIGhhcyA9IHt9O1xudmFyIGNpcmN1bGFyID0ge307XG52YXIgd2FpdGluZyA9IGZhbHNlO1xuXG4vKipcbiAqIFJlc2V0IHRoZSBiYXRjaGVyJ3Mgc3RhdGUuXG4gKi9cblxuZnVuY3Rpb24gcmVzZXRCYXRjaGVyU3RhdGUoKSB7XG4gIHF1ZXVlLmxlbmd0aCA9IDA7XG4gIHVzZXJRdWV1ZS5sZW5ndGggPSAwO1xuICBoYXMgPSB7fTtcbiAgY2lyY3VsYXIgPSB7fTtcbiAgd2FpdGluZyA9IGZhbHNlO1xufVxuXG4vKipcbiAqIEZsdXNoIGJvdGggcXVldWVzIGFuZCBydW4gdGhlIHdhdGNoZXJzLlxuICovXG5cbmZ1bmN0aW9uIGZsdXNoQmF0Y2hlclF1ZXVlKCkge1xuICB2YXIgX2FnYWluID0gdHJ1ZTtcblxuICBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHtcbiAgICBfYWdhaW4gPSBmYWxzZTtcblxuICAgIHJ1bkJhdGNoZXJRdWV1ZShxdWV1ZSk7XG4gICAgcnVuQmF0Y2hlclF1ZXVlKHVzZXJRdWV1ZSk7XG4gICAgLy8gdXNlciB3YXRjaGVycyB0cmlnZ2VyZWQgbW9yZSB3YXRjaGVycyxcbiAgICAvLyBrZWVwIGZsdXNoaW5nIHVudGlsIGl0IGRlcGxldGVzXG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgX2FnYWluID0gdHJ1ZTtcbiAgICAgIGNvbnRpbnVlIF9mdW5jdGlvbjtcbiAgICB9XG4gICAgLy8gZGV2IHRvb2wgaG9va1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChkZXZ0b29scyAmJiBjb25maWcuZGV2dG9vbHMpIHtcbiAgICAgIGRldnRvb2xzLmVtaXQoJ2ZsdXNoJyk7XG4gICAgfVxuICAgIHJlc2V0QmF0Y2hlclN0YXRlKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSdW4gdGhlIHdhdGNoZXJzIGluIGEgc2luZ2xlIHF1ZXVlLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHF1ZXVlXG4gKi9cblxuZnVuY3Rpb24gcnVuQmF0Y2hlclF1ZXVlKHF1ZXVlKSB7XG4gIC8vIGRvIG5vdCBjYWNoZSBsZW5ndGggYmVjYXVzZSBtb3JlIHdhdGNoZXJzIG1pZ2h0IGJlIHB1c2hlZFxuICAvLyBhcyB3ZSBydW4gZXhpc3Rpbmcgd2F0Y2hlcnNcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciB3YXRjaGVyID0gcXVldWVbaV07XG4gICAgdmFyIGlkID0gd2F0Y2hlci5pZDtcbiAgICBoYXNbaWRdID0gbnVsbDtcbiAgICB3YXRjaGVyLnJ1bigpO1xuICAgIC8vIGluIGRldiBidWlsZCwgY2hlY2sgYW5kIHN0b3AgY2lyY3VsYXIgdXBkYXRlcy5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBoYXNbaWRdICE9IG51bGwpIHtcbiAgICAgIGNpcmN1bGFyW2lkXSA9IChjaXJjdWxhcltpZF0gfHwgMCkgKyAxO1xuICAgICAgaWYgKGNpcmN1bGFyW2lkXSA+IGNvbmZpZy5fbWF4VXBkYXRlQ291bnQpIHtcbiAgICAgICAgd2FybignWW91IG1heSBoYXZlIGFuIGluZmluaXRlIHVwZGF0ZSBsb29wIGZvciB3YXRjaGVyICcgKyAnd2l0aCBleHByZXNzaW9uIFwiJyArIHdhdGNoZXIuZXhwcmVzc2lvbiArICdcIicsIHdhdGNoZXIudm0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcXVldWUubGVuZ3RoID0gMDtcbn1cblxuLyoqXG4gKiBQdXNoIGEgd2F0Y2hlciBpbnRvIHRoZSB3YXRjaGVyIHF1ZXVlLlxuICogSm9icyB3aXRoIGR1cGxpY2F0ZSBJRHMgd2lsbCBiZSBza2lwcGVkIHVubGVzcyBpdCdzXG4gKiBwdXNoZWQgd2hlbiB0aGUgcXVldWUgaXMgYmVpbmcgZmx1c2hlZC5cbiAqXG4gKiBAcGFyYW0ge1dhdGNoZXJ9IHdhdGNoZXJcbiAqICAgcHJvcGVydGllczpcbiAqICAgLSB7TnVtYmVyfSBpZFxuICogICAtIHtGdW5jdGlvbn0gcnVuXG4gKi9cblxuZnVuY3Rpb24gcHVzaFdhdGNoZXIod2F0Y2hlcikge1xuICB2YXIgaWQgPSB3YXRjaGVyLmlkO1xuICBpZiAoaGFzW2lkXSA9PSBudWxsKSB7XG4gICAgLy8gcHVzaCB3YXRjaGVyIGludG8gYXBwcm9wcmlhdGUgcXVldWVcbiAgICB2YXIgcSA9IHdhdGNoZXIudXNlciA/IHVzZXJRdWV1ZSA6IHF1ZXVlO1xuICAgIGhhc1tpZF0gPSBxLmxlbmd0aDtcbiAgICBxLnB1c2god2F0Y2hlcik7XG4gICAgLy8gcXVldWUgdGhlIGZsdXNoXG4gICAgaWYgKCF3YWl0aW5nKSB7XG4gICAgICB3YWl0aW5nID0gdHJ1ZTtcbiAgICAgIG5leHRUaWNrKGZsdXNoQmF0Y2hlclF1ZXVlKTtcbiAgICB9XG4gIH1cbn1cblxudmFyIHVpZCQyID0gMDtcblxuLyoqXG4gKiBBIHdhdGNoZXIgcGFyc2VzIGFuIGV4cHJlc3Npb24sIGNvbGxlY3RzIGRlcGVuZGVuY2llcyxcbiAqIGFuZCBmaXJlcyBjYWxsYmFjayB3aGVuIHRoZSBleHByZXNzaW9uIHZhbHVlIGNoYW5nZXMuXG4gKiBUaGlzIGlzIHVzZWQgZm9yIGJvdGggdGhlICR3YXRjaCgpIGFwaSBhbmQgZGlyZWN0aXZlcy5cbiAqXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBleHBPckZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgICAgICAgICAgICAgICAtIHtBcnJheX0gZmlsdGVyc1xuICogICAgICAgICAgICAgICAgIC0ge0Jvb2xlYW59IHR3b1dheVxuICogICAgICAgICAgICAgICAgIC0ge0Jvb2xlYW59IGRlZXBcbiAqICAgICAgICAgICAgICAgICAtIHtCb29sZWFufSB1c2VyXG4gKiAgICAgICAgICAgICAgICAgLSB7Qm9vbGVhbn0gc3luY1xuICogICAgICAgICAgICAgICAgIC0ge0Jvb2xlYW59IGxhenlcbiAqICAgICAgICAgICAgICAgICAtIHtGdW5jdGlvbn0gW3ByZVByb2Nlc3NdXG4gKiAgICAgICAgICAgICAgICAgLSB7RnVuY3Rpb259IFtwb3N0UHJvY2Vzc11cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBXYXRjaGVyKHZtLCBleHBPckZuLCBjYiwgb3B0aW9ucykge1xuICAvLyBtaXggaW4gb3B0aW9uc1xuICBpZiAob3B0aW9ucykge1xuICAgIGV4dGVuZCh0aGlzLCBvcHRpb25zKTtcbiAgfVxuICB2YXIgaXNGbiA9IHR5cGVvZiBleHBPckZuID09PSAnZnVuY3Rpb24nO1xuICB0aGlzLnZtID0gdm07XG4gIHZtLl93YXRjaGVycy5wdXNoKHRoaXMpO1xuICB0aGlzLmV4cHJlc3Npb24gPSBleHBPckZuO1xuICB0aGlzLmNiID0gY2I7XG4gIHRoaXMuaWQgPSArK3VpZCQyOyAvLyB1aWQgZm9yIGJhdGNoaW5nXG4gIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgdGhpcy5kaXJ0eSA9IHRoaXMubGF6eTsgLy8gZm9yIGxhenkgd2F0Y2hlcnNcbiAgdGhpcy5kZXBzID0gW107XG4gIHRoaXMubmV3RGVwcyA9IFtdO1xuICB0aGlzLmRlcElkcyA9IG5ldyBfU2V0KCk7XG4gIHRoaXMubmV3RGVwSWRzID0gbmV3IF9TZXQoKTtcbiAgdGhpcy5wcmV2RXJyb3IgPSBudWxsOyAvLyBmb3IgYXN5bmMgZXJyb3Igc3RhY2tzXG4gIC8vIHBhcnNlIGV4cHJlc3Npb24gZm9yIGdldHRlci9zZXR0ZXJcbiAgaWYgKGlzRm4pIHtcbiAgICB0aGlzLmdldHRlciA9IGV4cE9yRm47XG4gICAgdGhpcy5zZXR0ZXIgPSB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHJlcyA9IHBhcnNlRXhwcmVzc2lvbihleHBPckZuLCB0aGlzLnR3b1dheSk7XG4gICAgdGhpcy5nZXR0ZXIgPSByZXMuZ2V0O1xuICAgIHRoaXMuc2V0dGVyID0gcmVzLnNldDtcbiAgfVxuICB0aGlzLnZhbHVlID0gdGhpcy5sYXp5ID8gdW5kZWZpbmVkIDogdGhpcy5nZXQoKTtcbiAgLy8gc3RhdGUgZm9yIGF2b2lkaW5nIGZhbHNlIHRyaWdnZXJzIGZvciBkZWVwIGFuZCBBcnJheVxuICAvLyB3YXRjaGVycyBkdXJpbmcgdm0uX2RpZ2VzdCgpXG4gIHRoaXMucXVldWVkID0gdGhpcy5zaGFsbG93ID0gZmFsc2U7XG59XG5cbi8qKlxuICogRXZhbHVhdGUgdGhlIGdldHRlciwgYW5kIHJlLWNvbGxlY3QgZGVwZW5kZW5jaWVzLlxuICovXG5cbldhdGNoZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5iZWZvcmVHZXQoKTtcbiAgdmFyIHNjb3BlID0gdGhpcy5zY29wZSB8fCB0aGlzLnZtO1xuICB2YXIgdmFsdWU7XG4gIHRyeSB7XG4gICAgdmFsdWUgPSB0aGlzLmdldHRlci5jYWxsKHNjb3BlLCBzY29wZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBjb25maWcud2FybkV4cHJlc3Npb25FcnJvcnMpIHtcbiAgICAgIHdhcm4oJ0Vycm9yIHdoZW4gZXZhbHVhdGluZyBleHByZXNzaW9uICcgKyAnXCInICsgdGhpcy5leHByZXNzaW9uICsgJ1wiOiAnICsgZS50b1N0cmluZygpLCB0aGlzLnZtKTtcbiAgICB9XG4gIH1cbiAgLy8gXCJ0b3VjaFwiIGV2ZXJ5IHByb3BlcnR5IHNvIHRoZXkgYXJlIGFsbCB0cmFja2VkIGFzXG4gIC8vIGRlcGVuZGVuY2llcyBmb3IgZGVlcCB3YXRjaGluZ1xuICBpZiAodGhpcy5kZWVwKSB7XG4gICAgdHJhdmVyc2UodmFsdWUpO1xuICB9XG4gIGlmICh0aGlzLnByZVByb2Nlc3MpIHtcbiAgICB2YWx1ZSA9IHRoaXMucHJlUHJvY2Vzcyh2YWx1ZSk7XG4gIH1cbiAgaWYgKHRoaXMuZmlsdGVycykge1xuICAgIHZhbHVlID0gc2NvcGUuX2FwcGx5RmlsdGVycyh2YWx1ZSwgbnVsbCwgdGhpcy5maWx0ZXJzLCBmYWxzZSk7XG4gIH1cbiAgaWYgKHRoaXMucG9zdFByb2Nlc3MpIHtcbiAgICB2YWx1ZSA9IHRoaXMucG9zdFByb2Nlc3ModmFsdWUpO1xuICB9XG4gIHRoaXMuYWZ0ZXJHZXQoKTtcbiAgcmV0dXJuIHZhbHVlO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWUgd2l0aCB0aGUgc2V0dGVyLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqL1xuXG5XYXRjaGVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIHNjb3BlID0gdGhpcy5zY29wZSB8fCB0aGlzLnZtO1xuICBpZiAodGhpcy5maWx0ZXJzKSB7XG4gICAgdmFsdWUgPSBzY29wZS5fYXBwbHlGaWx0ZXJzKHZhbHVlLCB0aGlzLnZhbHVlLCB0aGlzLmZpbHRlcnMsIHRydWUpO1xuICB9XG4gIHRyeSB7XG4gICAgdGhpcy5zZXR0ZXIuY2FsbChzY29wZSwgc2NvcGUsIHZhbHVlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIGNvbmZpZy53YXJuRXhwcmVzc2lvbkVycm9ycykge1xuICAgICAgd2FybignRXJyb3Igd2hlbiBldmFsdWF0aW5nIHNldHRlciAnICsgJ1wiJyArIHRoaXMuZXhwcmVzc2lvbiArICdcIjogJyArIGUudG9TdHJpbmcoKSwgdGhpcy52bSk7XG4gICAgfVxuICB9XG4gIC8vIHR3by13YXkgc3luYyBmb3Igdi1mb3IgYWxpYXNcbiAgdmFyIGZvckNvbnRleHQgPSBzY29wZS4kZm9yQ29udGV4dDtcbiAgaWYgKGZvckNvbnRleHQgJiYgZm9yQ29udGV4dC5hbGlhcyA9PT0gdGhpcy5leHByZXNzaW9uKSB7XG4gICAgaWYgKGZvckNvbnRleHQuZmlsdGVycykge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdJdCBzZWVtcyB5b3UgYXJlIHVzaW5nIHR3by13YXkgYmluZGluZyBvbiAnICsgJ2Egdi1mb3IgYWxpYXMgKCcgKyB0aGlzLmV4cHJlc3Npb24gKyAnKSwgYW5kIHRoZSAnICsgJ3YtZm9yIGhhcyBmaWx0ZXJzLiBUaGlzIHdpbGwgbm90IHdvcmsgcHJvcGVybHkuICcgKyAnRWl0aGVyIHJlbW92ZSB0aGUgZmlsdGVycyBvciB1c2UgYW4gYXJyYXkgb2YgJyArICdvYmplY3RzIGFuZCBiaW5kIHRvIG9iamVjdCBwcm9wZXJ0aWVzIGluc3RlYWQuJywgdGhpcy52bSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvckNvbnRleHQuX3dpdGhMb2NrKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzY29wZS4ka2V5KSB7XG4gICAgICAgIC8vIG9yaWdpbmFsIGlzIGFuIG9iamVjdFxuICAgICAgICBmb3JDb250ZXh0LnJhd1ZhbHVlW3Njb3BlLiRrZXldID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3JDb250ZXh0LnJhd1ZhbHVlLiRzZXQoc2NvcGUuJGluZGV4LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogUHJlcGFyZSBmb3IgZGVwZW5kZW5jeSBjb2xsZWN0aW9uLlxuICovXG5cbldhdGNoZXIucHJvdG90eXBlLmJlZm9yZUdldCA9IGZ1bmN0aW9uICgpIHtcbiAgRGVwLnRhcmdldCA9IHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhIGRlcGVuZGVuY3kgdG8gdGhpcyBkaXJlY3RpdmUuXG4gKlxuICogQHBhcmFtIHtEZXB9IGRlcFxuICovXG5cbldhdGNoZXIucHJvdG90eXBlLmFkZERlcCA9IGZ1bmN0aW9uIChkZXApIHtcbiAgdmFyIGlkID0gZGVwLmlkO1xuICBpZiAoIXRoaXMubmV3RGVwSWRzLmhhcyhpZCkpIHtcbiAgICB0aGlzLm5ld0RlcElkcy5hZGQoaWQpO1xuICAgIHRoaXMubmV3RGVwcy5wdXNoKGRlcCk7XG4gICAgaWYgKCF0aGlzLmRlcElkcy5oYXMoaWQpKSB7XG4gICAgICBkZXAuYWRkU3ViKHRoaXMpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBDbGVhbiB1cCBmb3IgZGVwZW5kZW5jeSBjb2xsZWN0aW9uLlxuICovXG5cbldhdGNoZXIucHJvdG90eXBlLmFmdGVyR2V0ID0gZnVuY3Rpb24gKCkge1xuICBEZXAudGFyZ2V0ID0gbnVsbDtcbiAgdmFyIGkgPSB0aGlzLmRlcHMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgdmFyIGRlcCA9IHRoaXMuZGVwc1tpXTtcbiAgICBpZiAoIXRoaXMubmV3RGVwSWRzLmhhcyhkZXAuaWQpKSB7XG4gICAgICBkZXAucmVtb3ZlU3ViKHRoaXMpO1xuICAgIH1cbiAgfVxuICB2YXIgdG1wID0gdGhpcy5kZXBJZHM7XG4gIHRoaXMuZGVwSWRzID0gdGhpcy5uZXdEZXBJZHM7XG4gIHRoaXMubmV3RGVwSWRzID0gdG1wO1xuICB0aGlzLm5ld0RlcElkcy5jbGVhcigpO1xuICB0bXAgPSB0aGlzLmRlcHM7XG4gIHRoaXMuZGVwcyA9IHRoaXMubmV3RGVwcztcbiAgdGhpcy5uZXdEZXBzID0gdG1wO1xuICB0aGlzLm5ld0RlcHMubGVuZ3RoID0gMDtcbn07XG5cbi8qKlxuICogU3Vic2NyaWJlciBpbnRlcmZhY2UuXG4gKiBXaWxsIGJlIGNhbGxlZCB3aGVuIGEgZGVwZW5kZW5jeSBjaGFuZ2VzLlxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gc2hhbGxvd1xuICovXG5cbldhdGNoZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChzaGFsbG93KSB7XG4gIGlmICh0aGlzLmxhenkpIHtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICh0aGlzLnN5bmMgfHwgIWNvbmZpZy5hc3luYykge1xuICAgIHRoaXMucnVuKCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gaWYgcXVldWVkLCBvbmx5IG92ZXJ3cml0ZSBzaGFsbG93IHdpdGggbm9uLXNoYWxsb3csXG4gICAgLy8gYnV0IG5vdCB0aGUgb3RoZXIgd2F5IGFyb3VuZC5cbiAgICB0aGlzLnNoYWxsb3cgPSB0aGlzLnF1ZXVlZCA/IHNoYWxsb3cgPyB0aGlzLnNoYWxsb3cgOiBmYWxzZSA6ICEhc2hhbGxvdztcbiAgICB0aGlzLnF1ZXVlZCA9IHRydWU7XG4gICAgLy8gcmVjb3JkIGJlZm9yZS1wdXNoIGVycm9yIHN0YWNrIGluIGRlYnVnIG1vZGVcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBjb25maWcuZGVidWcpIHtcbiAgICAgIHRoaXMucHJldkVycm9yID0gbmV3IEVycm9yKCdbdnVlXSBhc3luYyBzdGFjayB0cmFjZScpO1xuICAgIH1cbiAgICBwdXNoV2F0Y2hlcih0aGlzKTtcbiAgfVxufTtcblxuLyoqXG4gKiBCYXRjaGVyIGpvYiBpbnRlcmZhY2UuXG4gKiBXaWxsIGJlIGNhbGxlZCBieSB0aGUgYmF0Y2hlci5cbiAqL1xuXG5XYXRjaGVyLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0KCk7XG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLnZhbHVlIHx8XG4gICAgLy8gRGVlcCB3YXRjaGVycyBhbmQgd2F0Y2hlcnMgb24gT2JqZWN0L0FycmF5cyBzaG91bGQgZmlyZSBldmVuXG4gICAgLy8gd2hlbiB0aGUgdmFsdWUgaXMgdGhlIHNhbWUsIGJlY2F1c2UgdGhlIHZhbHVlIG1heVxuICAgIC8vIGhhdmUgbXV0YXRlZDsgYnV0IG9ubHkgZG8gc28gaWYgdGhpcyBpcyBhXG4gICAgLy8gbm9uLXNoYWxsb3cgdXBkYXRlIChjYXVzZWQgYnkgYSB2bSBkaWdlc3QpLlxuICAgIChpc09iamVjdCh2YWx1ZSkgfHwgdGhpcy5kZWVwKSAmJiAhdGhpcy5zaGFsbG93KSB7XG4gICAgICAvLyBzZXQgbmV3IHZhbHVlXG4gICAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgLy8gaW4gZGVidWcgKyBhc3luYyBtb2RlLCB3aGVuIGEgd2F0Y2hlciBjYWxsYmFja3NcbiAgICAgIC8vIHRocm93cywgd2UgYWxzbyB0aHJvdyB0aGUgc2F2ZWQgYmVmb3JlLXB1c2ggZXJyb3JcbiAgICAgIC8vIHNvIHRoZSBmdWxsIGNyb3NzLXRpY2sgc3RhY2sgdHJhY2UgaXMgYXZhaWxhYmxlLlxuICAgICAgdmFyIHByZXZFcnJvciA9IHRoaXMucHJldkVycm9yO1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBjb25maWcuZGVidWcgJiYgcHJldkVycm9yKSB7XG4gICAgICAgIHRoaXMucHJldkVycm9yID0gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmNiLmNhbGwodGhpcy52bSwgdmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRocm93IHByZXZFcnJvcjtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNiLmNhbGwodGhpcy52bSwgdmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5xdWV1ZWQgPSB0aGlzLnNoYWxsb3cgPSBmYWxzZTtcbiAgfVxufTtcblxuLyoqXG4gKiBFdmFsdWF0ZSB0aGUgdmFsdWUgb2YgdGhlIHdhdGNoZXIuXG4gKiBUaGlzIG9ubHkgZ2V0cyBjYWxsZWQgZm9yIGxhenkgd2F0Y2hlcnMuXG4gKi9cblxuV2F0Y2hlci5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIGF2b2lkIG92ZXJ3cml0aW5nIGFub3RoZXIgd2F0Y2hlciB0aGF0IGlzIGJlaW5nXG4gIC8vIGNvbGxlY3RlZC5cbiAgdmFyIGN1cnJlbnQgPSBEZXAudGFyZ2V0O1xuICB0aGlzLnZhbHVlID0gdGhpcy5nZXQoKTtcbiAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuICBEZXAudGFyZ2V0ID0gY3VycmVudDtcbn07XG5cbi8qKlxuICogRGVwZW5kIG9uIGFsbCBkZXBzIGNvbGxlY3RlZCBieSB0aGlzIHdhdGNoZXIuXG4gKi9cblxuV2F0Y2hlci5wcm90b3R5cGUuZGVwZW5kID0gZnVuY3Rpb24gKCkge1xuICB2YXIgaSA9IHRoaXMuZGVwcy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICB0aGlzLmRlcHNbaV0uZGVwZW5kKCk7XG4gIH1cbn07XG5cbi8qKlxuICogUmVtb3ZlIHNlbGYgZnJvbSBhbGwgZGVwZW5kZW5jaWVzJyBzdWJjcmliZXIgbGlzdC5cbiAqL1xuXG5XYXRjaGVyLnByb3RvdHlwZS50ZWFyZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgLy8gcmVtb3ZlIHNlbGYgZnJvbSB2bSdzIHdhdGNoZXIgbGlzdFxuICAgIC8vIHRoaXMgaXMgYSBzb21ld2hhdCBleHBlbnNpdmUgb3BlcmF0aW9uIHNvIHdlIHNraXAgaXRcbiAgICAvLyBpZiB0aGUgdm0gaXMgYmVpbmcgZGVzdHJveWVkIG9yIGlzIHBlcmZvcm1pbmcgYSB2LWZvclxuICAgIC8vIHJlLXJlbmRlciAodGhlIHdhdGNoZXIgbGlzdCBpcyB0aGVuIGZpbHRlcmVkIGJ5IHYtZm9yKS5cbiAgICBpZiAoIXRoaXMudm0uX2lzQmVpbmdEZXN0cm95ZWQgJiYgIXRoaXMudm0uX3ZGb3JSZW1vdmluZykge1xuICAgICAgdGhpcy52bS5fd2F0Y2hlcnMuJHJlbW92ZSh0aGlzKTtcbiAgICB9XG4gICAgdmFyIGkgPSB0aGlzLmRlcHMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHRoaXMuZGVwc1tpXS5yZW1vdmVTdWIodGhpcyk7XG4gICAgfVxuICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy52bSA9IHRoaXMuY2IgPSB0aGlzLnZhbHVlID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBSZWNydXNpdmVseSB0cmF2ZXJzZSBhbiBvYmplY3QgdG8gZXZva2UgYWxsIGNvbnZlcnRlZFxuICogZ2V0dGVycywgc28gdGhhdCBldmVyeSBuZXN0ZWQgcHJvcGVydHkgaW5zaWRlIHRoZSBvYmplY3RcbiAqIGlzIGNvbGxlY3RlZCBhcyBhIFwiZGVlcFwiIGRlcGVuZGVuY3kuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqL1xuXG52YXIgc2Vlbk9iamVjdHMgPSBuZXcgX1NldCgpO1xuZnVuY3Rpb24gdHJhdmVyc2UodmFsLCBzZWVuKSB7XG4gIHZhciBpID0gdW5kZWZpbmVkLFxuICAgICAga2V5cyA9IHVuZGVmaW5lZDtcbiAgaWYgKCFzZWVuKSB7XG4gICAgc2VlbiA9IHNlZW5PYmplY3RzO1xuICAgIHNlZW4uY2xlYXIoKTtcbiAgfVxuICB2YXIgaXNBID0gaXNBcnJheSh2YWwpO1xuICB2YXIgaXNPID0gaXNPYmplY3QodmFsKTtcbiAgaWYgKGlzQSB8fCBpc08pIHtcbiAgICBpZiAodmFsLl9fb2JfXykge1xuICAgICAgdmFyIGRlcElkID0gdmFsLl9fb2JfXy5kZXAuaWQ7XG4gICAgICBpZiAoc2Vlbi5oYXMoZGVwSWQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlZW4uYWRkKGRlcElkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzQSkge1xuICAgICAgaSA9IHZhbC5sZW5ndGg7XG4gICAgICB3aGlsZSAoaS0tKSB0cmF2ZXJzZSh2YWxbaV0sIHNlZW4pO1xuICAgIH0gZWxzZSBpZiAoaXNPKSB7XG4gICAgICBrZXlzID0gT2JqZWN0LmtleXModmFsKTtcbiAgICAgIGkgPSBrZXlzLmxlbmd0aDtcbiAgICAgIHdoaWxlIChpLS0pIHRyYXZlcnNlKHZhbFtrZXlzW2ldXSwgc2Vlbik7XG4gICAgfVxuICB9XG59XG5cbnZhciB0ZXh0JDEgPSB7XG5cbiAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICB0aGlzLmF0dHIgPSB0aGlzLmVsLm5vZGVUeXBlID09PSAzID8gJ2RhdGEnIDogJ3RleHRDb250ZW50JztcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2YWx1ZSkge1xuICAgIHRoaXMuZWxbdGhpcy5hdHRyXSA9IF90b1N0cmluZyh2YWx1ZSk7XG4gIH1cbn07XG5cbnZhciB0ZW1wbGF0ZUNhY2hlID0gbmV3IENhY2hlKDEwMDApO1xudmFyIGlkU2VsZWN0b3JDYWNoZSA9IG5ldyBDYWNoZSgxMDAwKTtcblxudmFyIG1hcCA9IHtcbiAgZWZhdWx0OiBbMCwgJycsICcnXSxcbiAgbGVnZW5kOiBbMSwgJzxmaWVsZHNldD4nLCAnPC9maWVsZHNldD4nXSxcbiAgdHI6IFsyLCAnPHRhYmxlPjx0Ym9keT4nLCAnPC90Ym9keT48L3RhYmxlPiddLFxuICBjb2w6IFsyLCAnPHRhYmxlPjx0Ym9keT48L3Rib2R5Pjxjb2xncm91cD4nLCAnPC9jb2xncm91cD48L3RhYmxlPiddXG59O1xuXG5tYXAudGQgPSBtYXAudGggPSBbMywgJzx0YWJsZT48dGJvZHk+PHRyPicsICc8L3RyPjwvdGJvZHk+PC90YWJsZT4nXTtcblxubWFwLm9wdGlvbiA9IG1hcC5vcHRncm91cCA9IFsxLCAnPHNlbGVjdCBtdWx0aXBsZT1cIm11bHRpcGxlXCI+JywgJzwvc2VsZWN0PiddO1xuXG5tYXAudGhlYWQgPSBtYXAudGJvZHkgPSBtYXAuY29sZ3JvdXAgPSBtYXAuY2FwdGlvbiA9IG1hcC50Zm9vdCA9IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddO1xuXG5tYXAuZyA9IG1hcC5kZWZzID0gbWFwLnN5bWJvbCA9IG1hcC51c2UgPSBtYXAuaW1hZ2UgPSBtYXAudGV4dCA9IG1hcC5jaXJjbGUgPSBtYXAuZWxsaXBzZSA9IG1hcC5saW5lID0gbWFwLnBhdGggPSBtYXAucG9seWdvbiA9IG1hcC5wb2x5bGluZSA9IG1hcC5yZWN0ID0gWzEsICc8c3ZnICcgKyAneG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiICcgKyAneG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgJyArICd4bWxuczpldj1cImh0dHA6Ly93d3cudzMub3JnLzIwMDEveG1sLWV2ZW50c1wiJyArICd2ZXJzaW9uPVwiMS4xXCI+JywgJzwvc3ZnPiddO1xuXG4vKipcbiAqIENoZWNrIGlmIGEgbm9kZSBpcyBhIHN1cHBvcnRlZCB0ZW1wbGF0ZSBub2RlIHdpdGggYVxuICogRG9jdW1lbnRGcmFnbWVudCBjb250ZW50LlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc1JlYWxUZW1wbGF0ZShub2RlKSB7XG4gIHJldHVybiBpc1RlbXBsYXRlKG5vZGUpICYmIGlzRnJhZ21lbnQobm9kZS5jb250ZW50KTtcbn1cblxudmFyIHRhZ1JFJDEgPSAvPChbXFx3Oi1dKykvO1xudmFyIGVudGl0eVJFID0gLyYjP1xcdys/Oy87XG5cbi8qKlxuICogQ29udmVydCBhIHN0cmluZyB0ZW1wbGF0ZSB0byBhIERvY3VtZW50RnJhZ21lbnQuXG4gKiBEZXRlcm1pbmVzIGNvcnJlY3Qgd3JhcHBpbmcgYnkgdGFnIHR5cGVzLiBXcmFwcGluZ1xuICogc3RyYXRlZ3kgZm91bmQgaW4galF1ZXJ5ICYgY29tcG9uZW50L2RvbWlmeS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdGVtcGxhdGVTdHJpbmdcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmF3XG4gKiBAcmV0dXJuIHtEb2N1bWVudEZyYWdtZW50fVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ1RvRnJhZ21lbnQodGVtcGxhdGVTdHJpbmcsIHJhdykge1xuICAvLyB0cnkgYSBjYWNoZSBoaXQgZmlyc3RcbiAgdmFyIGNhY2hlS2V5ID0gcmF3ID8gdGVtcGxhdGVTdHJpbmcgOiB0ZW1wbGF0ZVN0cmluZy50cmltKCk7XG4gIHZhciBoaXQgPSB0ZW1wbGF0ZUNhY2hlLmdldChjYWNoZUtleSk7XG4gIGlmIChoaXQpIHtcbiAgICByZXR1cm4gaGl0O1xuICB9XG5cbiAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHZhciB0YWdNYXRjaCA9IHRlbXBsYXRlU3RyaW5nLm1hdGNoKHRhZ1JFJDEpO1xuICB2YXIgZW50aXR5TWF0Y2ggPSBlbnRpdHlSRS50ZXN0KHRlbXBsYXRlU3RyaW5nKTtcblxuICBpZiAoIXRhZ01hdGNoICYmICFlbnRpdHlNYXRjaCkge1xuICAgIC8vIHRleHQgb25seSwgcmV0dXJuIGEgc2luZ2xlIHRleHQgbm9kZS5cbiAgICBmcmFnLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRlbXBsYXRlU3RyaW5nKSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHRhZyA9IHRhZ01hdGNoICYmIHRhZ01hdGNoWzFdO1xuICAgIHZhciB3cmFwID0gbWFwW3RhZ10gfHwgbWFwLmVmYXVsdDtcbiAgICB2YXIgZGVwdGggPSB3cmFwWzBdO1xuICAgIHZhciBwcmVmaXggPSB3cmFwWzFdO1xuICAgIHZhciBzdWZmaXggPSB3cmFwWzJdO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICBub2RlLmlubmVySFRNTCA9IHByZWZpeCArIHRlbXBsYXRlU3RyaW5nICsgc3VmZml4O1xuICAgIHdoaWxlIChkZXB0aC0tKSB7XG4gICAgICBub2RlID0gbm9kZS5sYXN0Q2hpbGQ7XG4gICAgfVxuXG4gICAgdmFyIGNoaWxkO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbmQtYXNzaWduICovXG4gICAgd2hpbGUgKGNoaWxkID0gbm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbmQtYXNzaWduICovXG4gICAgICBmcmFnLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFyYXcpIHtcbiAgICB0cmltTm9kZShmcmFnKTtcbiAgfVxuICB0ZW1wbGF0ZUNhY2hlLnB1dChjYWNoZUtleSwgZnJhZyk7XG4gIHJldHVybiBmcmFnO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSB0ZW1wbGF0ZSBub2RlIHRvIGEgRG9jdW1lbnRGcmFnbWVudC5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAqIEByZXR1cm4ge0RvY3VtZW50RnJhZ21lbnR9XG4gKi9cblxuZnVuY3Rpb24gbm9kZVRvRnJhZ21lbnQobm9kZSkge1xuICAvLyBpZiBpdHMgYSB0ZW1wbGF0ZSB0YWcgYW5kIHRoZSBicm93c2VyIHN1cHBvcnRzIGl0LFxuICAvLyBpdHMgY29udGVudCBpcyBhbHJlYWR5IGEgZG9jdW1lbnQgZnJhZ21lbnQuIEhvd2V2ZXIsIGlPUyBTYWZhcmkgaGFzXG4gIC8vIGJ1ZyB3aGVuIHVzaW5nIGRpcmVjdGx5IGNsb25lZCB0ZW1wbGF0ZSBjb250ZW50IHdpdGggdG91Y2hcbiAgLy8gZXZlbnRzIGFuZCBjYW4gY2F1c2UgY3Jhc2hlcyB3aGVuIHRoZSBub2RlcyBhcmUgcmVtb3ZlZCBmcm9tIERPTSwgc28gd2VcbiAgLy8gaGF2ZSB0byB0cmVhdCB0ZW1wbGF0ZSBlbGVtZW50cyBhcyBzdHJpbmcgdGVtcGxhdGVzLiAoIzI4MDUpXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoaXNSZWFsVGVtcGxhdGUobm9kZSkpIHtcbiAgICByZXR1cm4gc3RyaW5nVG9GcmFnbWVudChub2RlLmlubmVySFRNTCk7XG4gIH1cbiAgLy8gc2NyaXB0IHRlbXBsYXRlXG4gIGlmIChub2RlLnRhZ05hbWUgPT09ICdTQ1JJUFQnKSB7XG4gICAgcmV0dXJuIHN0cmluZ1RvRnJhZ21lbnQobm9kZS50ZXh0Q29udGVudCk7XG4gIH1cbiAgLy8gbm9ybWFsIG5vZGUsIGNsb25lIGl0IHRvIGF2b2lkIG11dGF0aW5nIHRoZSBvcmlnaW5hbFxuICB2YXIgY2xvbmVkTm9kZSA9IGNsb25lTm9kZShub2RlKTtcbiAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHZhciBjaGlsZDtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uZC1hc3NpZ24gKi9cbiAgd2hpbGUgKGNoaWxkID0gY2xvbmVkTm9kZS5maXJzdENoaWxkKSB7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25kLWFzc2lnbiAqL1xuICAgIGZyYWcuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICB9XG4gIHRyaW1Ob2RlKGZyYWcpO1xuICByZXR1cm4gZnJhZztcbn1cblxuLy8gVGVzdCBmb3IgdGhlIHByZXNlbmNlIG9mIHRoZSBTYWZhcmkgdGVtcGxhdGUgY2xvbmluZyBidWdcbi8vIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3d1Zy5jZ2k/aWQ9MTM3NzU1XG52YXIgaGFzQnJva2VuVGVtcGxhdGUgPSAoZnVuY3Rpb24gKCkge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoaW5Ccm93c2VyKSB7XG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBhLmlubmVySFRNTCA9ICc8dGVtcGxhdGU+MTwvdGVtcGxhdGU+JztcbiAgICByZXR1cm4gIWEuY2xvbmVOb2RlKHRydWUpLmZpcnN0Q2hpbGQuaW5uZXJIVE1MO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufSkoKTtcblxuLy8gVGVzdCBmb3IgSUUxMC8xMSB0ZXh0YXJlYSBwbGFjZWhvbGRlciBjbG9uZSBidWdcbnZhciBoYXNUZXh0YXJlYUNsb25lQnVnID0gKGZ1bmN0aW9uICgpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKGluQnJvd3Nlcikge1xuICAgIHZhciB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgICB0LnBsYWNlaG9sZGVyID0gJ3QnO1xuICAgIHJldHVybiB0LmNsb25lTm9kZSh0cnVlKS52YWx1ZSA9PT0gJ3QnO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufSkoKTtcblxuLyoqXG4gKiAxLiBEZWFsIHdpdGggU2FmYXJpIGNsb25pbmcgbmVzdGVkIDx0ZW1wbGF0ZT4gYnVnIGJ5XG4gKiAgICBtYW51YWxseSBjbG9uaW5nIGFsbCB0ZW1wbGF0ZSBpbnN0YW5jZXMuXG4gKiAyLiBEZWFsIHdpdGggSUUxMC8xMSB0ZXh0YXJlYSBwbGFjZWhvbGRlciBidWcgYnkgc2V0dGluZ1xuICogICAgdGhlIGNvcnJlY3QgdmFsdWUgYWZ0ZXIgY2xvbmluZy5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR8RG9jdW1lbnRGcmFnbWVudH0gbm9kZVxuICogQHJldHVybiB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fVxuICovXG5cbmZ1bmN0aW9uIGNsb25lTm9kZShub2RlKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoIW5vZGUucXVlcnlTZWxlY3RvckFsbCkge1xuICAgIHJldHVybiBub2RlLmNsb25lTm9kZSgpO1xuICB9XG4gIHZhciByZXMgPSBub2RlLmNsb25lTm9kZSh0cnVlKTtcbiAgdmFyIGksIG9yaWdpbmFsLCBjbG9uZWQ7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoaGFzQnJva2VuVGVtcGxhdGUpIHtcbiAgICB2YXIgdGVtcENsb25lID0gcmVzO1xuICAgIGlmIChpc1JlYWxUZW1wbGF0ZShub2RlKSkge1xuICAgICAgbm9kZSA9IG5vZGUuY29udGVudDtcbiAgICAgIHRlbXBDbG9uZSA9IHJlcy5jb250ZW50O1xuICAgIH1cbiAgICBvcmlnaW5hbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbCgndGVtcGxhdGUnKTtcbiAgICBpZiAob3JpZ2luYWwubGVuZ3RoKSB7XG4gICAgICBjbG9uZWQgPSB0ZW1wQ2xvbmUucXVlcnlTZWxlY3RvckFsbCgndGVtcGxhdGUnKTtcbiAgICAgIGkgPSBjbG9uZWQubGVuZ3RoO1xuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICBjbG9uZWRbaV0ucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoY2xvbmVOb2RlKG9yaWdpbmFsW2ldKSwgY2xvbmVkW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmIChoYXNUZXh0YXJlYUNsb25lQnVnKSB7XG4gICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJykge1xuICAgICAgcmVzLnZhbHVlID0gbm9kZS52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3JpZ2luYWwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RleHRhcmVhJyk7XG4gICAgICBpZiAob3JpZ2luYWwubGVuZ3RoKSB7XG4gICAgICAgIGNsb25lZCA9IHJlcy5xdWVyeVNlbGVjdG9yQWxsKCd0ZXh0YXJlYScpO1xuICAgICAgICBpID0gY2xvbmVkLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgIGNsb25lZFtpXS52YWx1ZSA9IG9yaWdpbmFsW2ldLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbi8qKlxuICogUHJvY2VzcyB0aGUgdGVtcGxhdGUgb3B0aW9uIGFuZCBub3JtYWxpemVzIGl0IGludG8gYVxuICogYSBEb2N1bWVudEZyYWdtZW50IHRoYXQgY2FuIGJlIHVzZWQgYXMgYSBwYXJ0aWFsIG9yIGFcbiAqIGluc3RhbmNlIHRlbXBsYXRlLlxuICpcbiAqIEBwYXJhbSB7Kn0gdGVtcGxhdGVcbiAqICAgICAgICBQb3NzaWJsZSB2YWx1ZXMgaW5jbHVkZTpcbiAqICAgICAgICAtIERvY3VtZW50RnJhZ21lbnQgb2JqZWN0XG4gKiAgICAgICAgLSBOb2RlIG9iamVjdCBvZiB0eXBlIFRlbXBsYXRlXG4gKiAgICAgICAgLSBpZCBzZWxlY3RvcjogJyNzb21lLXRlbXBsYXRlLWlkJ1xuICogICAgICAgIC0gdGVtcGxhdGUgc3RyaW5nOiAnPGRpdj48c3Bhbj57e21zZ319PC9zcGFuPjwvZGl2PidcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gc2hvdWxkQ2xvbmVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmF3XG4gKiAgICAgICAgaW5saW5lIEhUTUwgaW50ZXJwb2xhdGlvbi4gRG8gbm90IGNoZWNrIGZvciBpZFxuICogICAgICAgIHNlbGVjdG9yIGFuZCBrZWVwIHdoaXRlc3BhY2UgaW4gdGhlIHN0cmluZy5cbiAqIEByZXR1cm4ge0RvY3VtZW50RnJhZ21lbnR8dW5kZWZpbmVkfVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlVGVtcGxhdGUodGVtcGxhdGUsIHNob3VsZENsb25lLCByYXcpIHtcbiAgdmFyIG5vZGUsIGZyYWc7XG5cbiAgLy8gaWYgdGhlIHRlbXBsYXRlIGlzIGFscmVhZHkgYSBkb2N1bWVudCBmcmFnbWVudCxcbiAgLy8gZG8gbm90aGluZ1xuICBpZiAoaXNGcmFnbWVudCh0ZW1wbGF0ZSkpIHtcbiAgICB0cmltTm9kZSh0ZW1wbGF0ZSk7XG4gICAgcmV0dXJuIHNob3VsZENsb25lID8gY2xvbmVOb2RlKHRlbXBsYXRlKSA6IHRlbXBsYXRlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB0ZW1wbGF0ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAvLyBpZCBzZWxlY3RvclxuICAgIGlmICghcmF3ICYmIHRlbXBsYXRlLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgICAvLyBpZCBzZWxlY3RvciBjYW4gYmUgY2FjaGVkIHRvb1xuICAgICAgZnJhZyA9IGlkU2VsZWN0b3JDYWNoZS5nZXQodGVtcGxhdGUpO1xuICAgICAgaWYgKCFmcmFnKSB7XG4gICAgICAgIG5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0ZW1wbGF0ZS5zbGljZSgxKSk7XG4gICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgZnJhZyA9IG5vZGVUb0ZyYWdtZW50KG5vZGUpO1xuICAgICAgICAgIC8vIHNhdmUgc2VsZWN0b3IgdG8gY2FjaGVcbiAgICAgICAgICBpZFNlbGVjdG9yQ2FjaGUucHV0KHRlbXBsYXRlLCBmcmFnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBub3JtYWwgc3RyaW5nIHRlbXBsYXRlXG4gICAgICBmcmFnID0gc3RyaW5nVG9GcmFnbWVudCh0ZW1wbGF0ZSwgcmF3KTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodGVtcGxhdGUubm9kZVR5cGUpIHtcbiAgICAvLyBhIGRpcmVjdCBub2RlXG4gICAgZnJhZyA9IG5vZGVUb0ZyYWdtZW50KHRlbXBsYXRlKTtcbiAgfVxuXG4gIHJldHVybiBmcmFnICYmIHNob3VsZENsb25lID8gY2xvbmVOb2RlKGZyYWcpIDogZnJhZztcbn1cblxudmFyIHRlbXBsYXRlID0gT2JqZWN0LmZyZWV6ZSh7XG4gIGNsb25lTm9kZTogY2xvbmVOb2RlLFxuICBwYXJzZVRlbXBsYXRlOiBwYXJzZVRlbXBsYXRlXG59KTtcblxudmFyIGh0bWwgPSB7XG5cbiAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICAvLyBhIGNvbW1lbnQgbm9kZSBtZWFucyB0aGlzIGlzIGEgYmluZGluZyBmb3JcbiAgICAvLyB7e3sgaW5saW5lIHVuZXNjYXBlZCBodG1sIH19fVxuICAgIGlmICh0aGlzLmVsLm5vZGVUeXBlID09PSA4KSB7XG4gICAgICAvLyBob2xkIG5vZGVzXG4gICAgICB0aGlzLm5vZGVzID0gW107XG4gICAgICAvLyByZXBsYWNlIHRoZSBwbGFjZWhvbGRlciB3aXRoIHByb3BlciBhbmNob3JcbiAgICAgIHRoaXMuYW5jaG9yID0gY3JlYXRlQW5jaG9yKCd2LWh0bWwnKTtcbiAgICAgIHJlcGxhY2UodGhpcy5lbCwgdGhpcy5hbmNob3IpO1xuICAgIH1cbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2YWx1ZSkge1xuICAgIHZhbHVlID0gX3RvU3RyaW5nKHZhbHVlKTtcbiAgICBpZiAodGhpcy5ub2Rlcykge1xuICAgICAgdGhpcy5zd2FwKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSB2YWx1ZTtcbiAgICB9XG4gIH0sXG5cbiAgc3dhcDogZnVuY3Rpb24gc3dhcCh2YWx1ZSkge1xuICAgIC8vIHJlbW92ZSBvbGQgbm9kZXNcbiAgICB2YXIgaSA9IHRoaXMubm9kZXMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHJlbW92ZSh0aGlzLm5vZGVzW2ldKTtcbiAgICB9XG4gICAgLy8gY29udmVydCBuZXcgdmFsdWUgdG8gYSBmcmFnbWVudFxuICAgIC8vIGRvIG5vdCBhdHRlbXB0IHRvIHJldHJpZXZlIGZyb20gaWQgc2VsZWN0b3JcbiAgICB2YXIgZnJhZyA9IHBhcnNlVGVtcGxhdGUodmFsdWUsIHRydWUsIHRydWUpO1xuICAgIC8vIHNhdmUgYSByZWZlcmVuY2UgdG8gdGhlc2Ugbm9kZXMgc28gd2UgY2FuIHJlbW92ZSBsYXRlclxuICAgIHRoaXMubm9kZXMgPSB0b0FycmF5KGZyYWcuY2hpbGROb2Rlcyk7XG4gICAgYmVmb3JlKGZyYWcsIHRoaXMuYW5jaG9yKTtcbiAgfVxufTtcblxuLyoqXG4gKiBBYnN0cmFjdGlvbiBmb3IgYSBwYXJ0aWFsbHktY29tcGlsZWQgZnJhZ21lbnQuXG4gKiBDYW4gb3B0aW9uYWxseSBjb21waWxlIGNvbnRlbnQgd2l0aCBhIGNoaWxkIHNjb3BlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpbmtlclxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge0RvY3VtZW50RnJhZ21lbnR9IGZyYWdcbiAqIEBwYXJhbSB7VnVlfSBbaG9zdF1cbiAqIEBwYXJhbSB7T2JqZWN0fSBbc2NvcGVdXG4gKiBAcGFyYW0ge0ZyYWdtZW50fSBbcGFyZW50RnJhZ11cbiAqL1xuZnVuY3Rpb24gRnJhZ21lbnQobGlua2VyLCB2bSwgZnJhZywgaG9zdCwgc2NvcGUsIHBhcmVudEZyYWcpIHtcbiAgdGhpcy5jaGlsZHJlbiA9IFtdO1xuICB0aGlzLmNoaWxkRnJhZ3MgPSBbXTtcbiAgdGhpcy52bSA9IHZtO1xuICB0aGlzLnNjb3BlID0gc2NvcGU7XG4gIHRoaXMuaW5zZXJ0ZWQgPSBmYWxzZTtcbiAgdGhpcy5wYXJlbnRGcmFnID0gcGFyZW50RnJhZztcbiAgaWYgKHBhcmVudEZyYWcpIHtcbiAgICBwYXJlbnRGcmFnLmNoaWxkRnJhZ3MucHVzaCh0aGlzKTtcbiAgfVxuICB0aGlzLnVubGluayA9IGxpbmtlcih2bSwgZnJhZywgaG9zdCwgc2NvcGUsIHRoaXMpO1xuICB2YXIgc2luZ2xlID0gdGhpcy5zaW5nbGUgPSBmcmFnLmNoaWxkTm9kZXMubGVuZ3RoID09PSAxICYmXG4gIC8vIGRvIG5vdCBnbyBzaW5nbGUgbW9kZSBpZiB0aGUgb25seSBub2RlIGlzIGFuIGFuY2hvclxuICAhZnJhZy5jaGlsZE5vZGVzWzBdLl9fdl9hbmNob3I7XG4gIGlmIChzaW5nbGUpIHtcbiAgICB0aGlzLm5vZGUgPSBmcmFnLmNoaWxkTm9kZXNbMF07XG4gICAgdGhpcy5iZWZvcmUgPSBzaW5nbGVCZWZvcmU7XG4gICAgdGhpcy5yZW1vdmUgPSBzaW5nbGVSZW1vdmU7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5ub2RlID0gY3JlYXRlQW5jaG9yKCdmcmFnbWVudC1zdGFydCcpO1xuICAgIHRoaXMuZW5kID0gY3JlYXRlQW5jaG9yKCdmcmFnbWVudC1lbmQnKTtcbiAgICB0aGlzLmZyYWcgPSBmcmFnO1xuICAgIHByZXBlbmQodGhpcy5ub2RlLCBmcmFnKTtcbiAgICBmcmFnLmFwcGVuZENoaWxkKHRoaXMuZW5kKTtcbiAgICB0aGlzLmJlZm9yZSA9IG11bHRpQmVmb3JlO1xuICAgIHRoaXMucmVtb3ZlID0gbXVsdGlSZW1vdmU7XG4gIH1cbiAgdGhpcy5ub2RlLl9fdl9mcmFnID0gdGhpcztcbn1cblxuLyoqXG4gKiBDYWxsIGF0dGFjaC9kZXRhY2ggZm9yIGFsbCBjb21wb25lbnRzIGNvbnRhaW5lZCB3aXRoaW5cbiAqIHRoaXMgZnJhZ21lbnQuIEFsc28gZG8gc28gcmVjdXJzaXZlbHkgZm9yIGFsbCBjaGlsZFxuICogZnJhZ21lbnRzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhvb2tcbiAqL1xuXG5GcmFnbWVudC5wcm90b3R5cGUuY2FsbEhvb2sgPSBmdW5jdGlvbiAoaG9vaykge1xuICB2YXIgaSwgbDtcbiAgZm9yIChpID0gMCwgbCA9IHRoaXMuY2hpbGRGcmFncy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB0aGlzLmNoaWxkRnJhZ3NbaV0uY2FsbEhvb2soaG9vayk7XG4gIH1cbiAgZm9yIChpID0gMCwgbCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgaG9vayh0aGlzLmNoaWxkcmVuW2ldKTtcbiAgfVxufTtcblxuLyoqXG4gKiBJbnNlcnQgZnJhZ21lbnQgYmVmb3JlIHRhcmdldCwgc2luZ2xlIG5vZGUgdmVyc2lvblxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gdGFyZ2V0XG4gKiBAcGFyYW0ge0Jvb2xlYW59IHdpdGhUcmFuc2l0aW9uXG4gKi9cblxuZnVuY3Rpb24gc2luZ2xlQmVmb3JlKHRhcmdldCwgd2l0aFRyYW5zaXRpb24pIHtcbiAgdGhpcy5pbnNlcnRlZCA9IHRydWU7XG4gIHZhciBtZXRob2QgPSB3aXRoVHJhbnNpdGlvbiAhPT0gZmFsc2UgPyBiZWZvcmVXaXRoVHJhbnNpdGlvbiA6IGJlZm9yZTtcbiAgbWV0aG9kKHRoaXMubm9kZSwgdGFyZ2V0LCB0aGlzLnZtKTtcbiAgaWYgKGluRG9jKHRoaXMubm9kZSkpIHtcbiAgICB0aGlzLmNhbGxIb29rKGF0dGFjaCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmUgZnJhZ21lbnQsIHNpbmdsZSBub2RlIHZlcnNpb25cbiAqL1xuXG5mdW5jdGlvbiBzaW5nbGVSZW1vdmUoKSB7XG4gIHRoaXMuaW5zZXJ0ZWQgPSBmYWxzZTtcbiAgdmFyIHNob3VsZENhbGxSZW1vdmUgPSBpbkRvYyh0aGlzLm5vZGUpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuYmVmb3JlUmVtb3ZlKCk7XG4gIHJlbW92ZVdpdGhUcmFuc2l0aW9uKHRoaXMubm9kZSwgdGhpcy52bSwgZnVuY3Rpb24gKCkge1xuICAgIGlmIChzaG91bGRDYWxsUmVtb3ZlKSB7XG4gICAgICBzZWxmLmNhbGxIb29rKGRldGFjaCk7XG4gICAgfVxuICAgIHNlbGYuZGVzdHJveSgpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBJbnNlcnQgZnJhZ21lbnQgYmVmb3JlIHRhcmdldCwgbXVsdGktbm9kZXMgdmVyc2lvblxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gdGFyZ2V0XG4gKiBAcGFyYW0ge0Jvb2xlYW59IHdpdGhUcmFuc2l0aW9uXG4gKi9cblxuZnVuY3Rpb24gbXVsdGlCZWZvcmUodGFyZ2V0LCB3aXRoVHJhbnNpdGlvbikge1xuICB0aGlzLmluc2VydGVkID0gdHJ1ZTtcbiAgdmFyIHZtID0gdGhpcy52bTtcbiAgdmFyIG1ldGhvZCA9IHdpdGhUcmFuc2l0aW9uICE9PSBmYWxzZSA/IGJlZm9yZVdpdGhUcmFuc2l0aW9uIDogYmVmb3JlO1xuICBtYXBOb2RlUmFuZ2UodGhpcy5ub2RlLCB0aGlzLmVuZCwgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICBtZXRob2Qobm9kZSwgdGFyZ2V0LCB2bSk7XG4gIH0pO1xuICBpZiAoaW5Eb2ModGhpcy5ub2RlKSkge1xuICAgIHRoaXMuY2FsbEhvb2soYXR0YWNoKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZSBmcmFnbWVudCwgbXVsdGktbm9kZXMgdmVyc2lvblxuICovXG5cbmZ1bmN0aW9uIG11bHRpUmVtb3ZlKCkge1xuICB0aGlzLmluc2VydGVkID0gZmFsc2U7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHNob3VsZENhbGxSZW1vdmUgPSBpbkRvYyh0aGlzLm5vZGUpO1xuICB0aGlzLmJlZm9yZVJlbW92ZSgpO1xuICByZW1vdmVOb2RlUmFuZ2UodGhpcy5ub2RlLCB0aGlzLmVuZCwgdGhpcy52bSwgdGhpcy5mcmFnLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHNob3VsZENhbGxSZW1vdmUpIHtcbiAgICAgIHNlbGYuY2FsbEhvb2soZGV0YWNoKTtcbiAgICB9XG4gICAgc2VsZi5kZXN0cm95KCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFByZXBhcmUgdGhlIGZyYWdtZW50IGZvciByZW1vdmFsLlxuICovXG5cbkZyYWdtZW50LnByb3RvdHlwZS5iZWZvcmVSZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBpLCBsO1xuICBmb3IgKGkgPSAwLCBsID0gdGhpcy5jaGlsZEZyYWdzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIC8vIGNhbGwgdGhlIHNhbWUgbWV0aG9kIHJlY3Vyc2l2ZWx5IG9uIGNoaWxkXG4gICAgLy8gZnJhZ21lbnRzLCBkZXB0aC1maXJzdFxuICAgIHRoaXMuY2hpbGRGcmFnc1tpXS5iZWZvcmVSZW1vdmUoZmFsc2UpO1xuICB9XG4gIGZvciAoaSA9IDAsIGwgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIC8vIENhbGwgZGVzdHJveSBmb3IgYWxsIGNvbnRhaW5lZCBpbnN0YW5jZXMsXG4gICAgLy8gd2l0aCByZW1vdmU6ZmFsc2UgYW5kIGRlZmVyOnRydWUuXG4gICAgLy8gRGVmZXIgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugd2UgbmVlZCB0b1xuICAgIC8vIGtlZXAgdGhlIGNoaWxkcmVuIHRvIGNhbGwgZGV0YWNoIGhvb2tzXG4gICAgLy8gb24gdGhlbS5cbiAgICB0aGlzLmNoaWxkcmVuW2ldLiRkZXN0cm95KGZhbHNlLCB0cnVlKTtcbiAgfVxuICB2YXIgZGlycyA9IHRoaXMudW5saW5rLmRpcnM7XG4gIGZvciAoaSA9IDAsIGwgPSBkaXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIC8vIGRpc2FibGUgdGhlIHdhdGNoZXJzIG9uIGFsbCB0aGUgZGlyZWN0aXZlc1xuICAgIC8vIHNvIHRoYXQgdGhlIHJlbmRlcmVkIGNvbnRlbnQgc3RheXMgdGhlIHNhbWVcbiAgICAvLyBkdXJpbmcgcmVtb3ZhbC5cbiAgICBkaXJzW2ldLl93YXRjaGVyICYmIGRpcnNbaV0uX3dhdGNoZXIudGVhcmRvd24oKTtcbiAgfVxufTtcblxuLyoqXG4gKiBEZXN0cm95IHRoZSBmcmFnbWVudC5cbiAqL1xuXG5GcmFnbWVudC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMucGFyZW50RnJhZykge1xuICAgIHRoaXMucGFyZW50RnJhZy5jaGlsZEZyYWdzLiRyZW1vdmUodGhpcyk7XG4gIH1cbiAgdGhpcy5ub2RlLl9fdl9mcmFnID0gbnVsbDtcbiAgdGhpcy51bmxpbmsoKTtcbn07XG5cbi8qKlxuICogQ2FsbCBhdHRhY2ggaG9vayBmb3IgYSBWdWUgaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIHtWdWV9IGNoaWxkXG4gKi9cblxuZnVuY3Rpb24gYXR0YWNoKGNoaWxkKSB7XG4gIGlmICghY2hpbGQuX2lzQXR0YWNoZWQgJiYgaW5Eb2MoY2hpbGQuJGVsKSkge1xuICAgIGNoaWxkLl9jYWxsSG9vaygnYXR0YWNoZWQnKTtcbiAgfVxufVxuXG4vKipcbiAqIENhbGwgZGV0YWNoIGhvb2sgZm9yIGEgVnVlIGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSB7VnVlfSBjaGlsZFxuICovXG5cbmZ1bmN0aW9uIGRldGFjaChjaGlsZCkge1xuICBpZiAoY2hpbGQuX2lzQXR0YWNoZWQgJiYgIWluRG9jKGNoaWxkLiRlbCkpIHtcbiAgICBjaGlsZC5fY2FsbEhvb2soJ2RldGFjaGVkJyk7XG4gIH1cbn1cblxudmFyIGxpbmtlckNhY2hlID0gbmV3IENhY2hlKDUwMDApO1xuXG4vKipcbiAqIEEgZmFjdG9yeSB0aGF0IGNhbiBiZSB1c2VkIHRvIGNyZWF0ZSBpbnN0YW5jZXMgb2YgYVxuICogZnJhZ21lbnQuIENhY2hlcyB0aGUgY29tcGlsZWQgbGlua2VyIGlmIHBvc3NpYmxlLlxuICpcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICogQHBhcmFtIHtFbGVtZW50fFN0cmluZ30gZWxcbiAqL1xuZnVuY3Rpb24gRnJhZ21lbnRGYWN0b3J5KHZtLCBlbCkge1xuICB0aGlzLnZtID0gdm07XG4gIHZhciB0ZW1wbGF0ZTtcbiAgdmFyIGlzU3RyaW5nID0gdHlwZW9mIGVsID09PSAnc3RyaW5nJztcbiAgaWYgKGlzU3RyaW5nIHx8IGlzVGVtcGxhdGUoZWwpICYmICFlbC5oYXNBdHRyaWJ1dGUoJ3YtaWYnKSkge1xuICAgIHRlbXBsYXRlID0gcGFyc2VUZW1wbGF0ZShlbCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgdGVtcGxhdGUuYXBwZW5kQ2hpbGQoZWwpO1xuICB9XG4gIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgLy8gbGlua2VyIGNhbiBiZSBjYWNoZWQsIGJ1dCBvbmx5IGZvciBjb21wb25lbnRzXG4gIHZhciBsaW5rZXI7XG4gIHZhciBjaWQgPSB2bS5jb25zdHJ1Y3Rvci5jaWQ7XG4gIGlmIChjaWQgPiAwKSB7XG4gICAgdmFyIGNhY2hlSWQgPSBjaWQgKyAoaXNTdHJpbmcgPyBlbCA6IGdldE91dGVySFRNTChlbCkpO1xuICAgIGxpbmtlciA9IGxpbmtlckNhY2hlLmdldChjYWNoZUlkKTtcbiAgICBpZiAoIWxpbmtlcikge1xuICAgICAgbGlua2VyID0gY29tcGlsZSh0ZW1wbGF0ZSwgdm0uJG9wdGlvbnMsIHRydWUpO1xuICAgICAgbGlua2VyQ2FjaGUucHV0KGNhY2hlSWQsIGxpbmtlcik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxpbmtlciA9IGNvbXBpbGUodGVtcGxhdGUsIHZtLiRvcHRpb25zLCB0cnVlKTtcbiAgfVxuICB0aGlzLmxpbmtlciA9IGxpbmtlcjtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBmcmFnbWVudCBpbnN0YW5jZSB3aXRoIGdpdmVuIGhvc3QgYW5kIHNjb3BlLlxuICpcbiAqIEBwYXJhbSB7VnVlfSBob3N0XG4gKiBAcGFyYW0ge09iamVjdH0gc2NvcGVcbiAqIEBwYXJhbSB7RnJhZ21lbnR9IHBhcmVudEZyYWdcbiAqL1xuXG5GcmFnbWVudEZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uIChob3N0LCBzY29wZSwgcGFyZW50RnJhZykge1xuICB2YXIgZnJhZyA9IGNsb25lTm9kZSh0aGlzLnRlbXBsYXRlKTtcbiAgcmV0dXJuIG5ldyBGcmFnbWVudCh0aGlzLmxpbmtlciwgdGhpcy52bSwgZnJhZywgaG9zdCwgc2NvcGUsIHBhcmVudEZyYWcpO1xufTtcblxudmFyIE9OID0gNzAwO1xudmFyIE1PREVMID0gODAwO1xudmFyIEJJTkQgPSA4NTA7XG52YXIgVFJBTlNJVElPTiA9IDExMDA7XG52YXIgRUwgPSAxNTAwO1xudmFyIENPTVBPTkVOVCA9IDE1MDA7XG52YXIgUEFSVElBTCA9IDE3NTA7XG52YXIgSUYgPSAyMTAwO1xudmFyIEZPUiA9IDIyMDA7XG52YXIgU0xPVCA9IDIzMDA7XG5cbnZhciB1aWQkMyA9IDA7XG5cbnZhciB2Rm9yID0ge1xuXG4gIHByaW9yaXR5OiBGT1IsXG4gIHRlcm1pbmFsOiB0cnVlLFxuXG4gIHBhcmFtczogWyd0cmFjay1ieScsICdzdGFnZ2VyJywgJ2VudGVyLXN0YWdnZXInLCAnbGVhdmUtc3RhZ2dlciddLFxuXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgLy8gc3VwcG9ydCBcIml0ZW0gaW4vb2YgaXRlbXNcIiBzeW50YXhcbiAgICB2YXIgaW5NYXRjaCA9IHRoaXMuZXhwcmVzc2lvbi5tYXRjaCgvKC4qKSAoPzppbnxvZikgKC4qKS8pO1xuICAgIGlmIChpbk1hdGNoKSB7XG4gICAgICB2YXIgaXRNYXRjaCA9IGluTWF0Y2hbMV0ubWF0Y2goL1xcKCguKiksKC4qKVxcKS8pO1xuICAgICAgaWYgKGl0TWF0Y2gpIHtcbiAgICAgICAgdGhpcy5pdGVyYXRvciA9IGl0TWF0Y2hbMV0udHJpbSgpO1xuICAgICAgICB0aGlzLmFsaWFzID0gaXRNYXRjaFsyXS50cmltKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFsaWFzID0gaW5NYXRjaFsxXS50cmltKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmV4cHJlc3Npb24gPSBpbk1hdGNoWzJdO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5hbGlhcykge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdJbnZhbGlkIHYtZm9yIGV4cHJlc3Npb24gXCInICsgdGhpcy5kZXNjcmlwdG9yLnJhdyArICdcIjogJyArICdhbGlhcyBpcyByZXF1aXJlZC4nLCB0aGlzLnZtKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyB1aWQgYXMgYSBjYWNoZSBpZGVudGlmaWVyXG4gICAgdGhpcy5pZCA9ICdfX3YtZm9yX18nICsgKyt1aWQkMztcblxuICAgIC8vIGNoZWNrIGlmIHRoaXMgaXMgYW4gb3B0aW9uIGxpc3QsXG4gICAgLy8gc28gdGhhdCB3ZSBrbm93IGlmIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSA8c2VsZWN0PidzXG4gICAgLy8gdi1tb2RlbCB3aGVuIHRoZSBvcHRpb24gbGlzdCBoYXMgY2hhbmdlZC5cbiAgICAvLyBiZWNhdXNlIHYtbW9kZWwgaGFzIGEgbG93ZXIgcHJpb3JpdHkgdGhhbiB2LWZvcixcbiAgICAvLyB0aGUgdi1tb2RlbCBpcyBub3QgYm91bmQgaGVyZSB5ZXQsIHNvIHdlIGhhdmUgdG9cbiAgICAvLyByZXRyaXZlIGl0IGluIHRoZSBhY3R1YWwgdXBkYXRlTW9kZWwoKSBmdW5jdGlvbi5cbiAgICB2YXIgdGFnID0gdGhpcy5lbC50YWdOYW1lO1xuICAgIHRoaXMuaXNPcHRpb24gPSAodGFnID09PSAnT1BUSU9OJyB8fCB0YWcgPT09ICdPUFRHUk9VUCcpICYmIHRoaXMuZWwucGFyZW50Tm9kZS50YWdOYW1lID09PSAnU0VMRUNUJztcblxuICAgIC8vIHNldHVwIGFuY2hvciBub2Rlc1xuICAgIHRoaXMuc3RhcnQgPSBjcmVhdGVBbmNob3IoJ3YtZm9yLXN0YXJ0Jyk7XG4gICAgdGhpcy5lbmQgPSBjcmVhdGVBbmNob3IoJ3YtZm9yLWVuZCcpO1xuICAgIHJlcGxhY2UodGhpcy5lbCwgdGhpcy5lbmQpO1xuICAgIGJlZm9yZSh0aGlzLnN0YXJ0LCB0aGlzLmVuZCk7XG5cbiAgICAvLyBjYWNoZVxuICAgIHRoaXMuY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgLy8gZnJhZ21lbnQgZmFjdG9yeVxuICAgIHRoaXMuZmFjdG9yeSA9IG5ldyBGcmFnbWVudEZhY3RvcnkodGhpcy52bSwgdGhpcy5lbCk7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoZGF0YSkge1xuICAgIHRoaXMuZGlmZihkYXRhKTtcbiAgICB0aGlzLnVwZGF0ZVJlZigpO1xuICAgIHRoaXMudXBkYXRlTW9kZWwoKTtcbiAgfSxcblxuICAvKipcbiAgICogRGlmZiwgYmFzZWQgb24gbmV3IGRhdGEgYW5kIG9sZCBkYXRhLCBkZXRlcm1pbmUgdGhlXG4gICAqIG1pbmltdW0gYW1vdW50IG9mIERPTSBtYW5pcHVsYXRpb25zIG5lZWRlZCB0byBtYWtlIHRoZVxuICAgKiBET00gcmVmbGVjdCB0aGUgbmV3IGRhdGEgQXJyYXkuXG4gICAqXG4gICAqIFRoZSBhbGdvcml0aG0gZGlmZnMgdGhlIG5ldyBkYXRhIEFycmF5IGJ5IHN0b3JpbmcgYVxuICAgKiBoaWRkZW4gcmVmZXJlbmNlIHRvIGFuIG93bmVyIHZtIGluc3RhbmNlIG9uIHByZXZpb3VzbHlcbiAgICogc2VlbiBkYXRhLiBUaGlzIGFsbG93cyB1cyB0byBhY2hpZXZlIE8obikgd2hpY2ggaXNcbiAgICogYmV0dGVyIHRoYW4gYSBsZXZlbnNodGVpbiBkaXN0YW5jZSBiYXNlZCBhbGdvcml0aG0sXG4gICAqIHdoaWNoIGlzIE8obSAqIG4pLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhXG4gICAqL1xuXG4gIGRpZmY6IGZ1bmN0aW9uIGRpZmYoZGF0YSkge1xuICAgIC8vIGNoZWNrIGlmIHRoZSBBcnJheSB3YXMgY29udmVydGVkIGZyb20gYW4gT2JqZWN0XG4gICAgdmFyIGl0ZW0gPSBkYXRhWzBdO1xuICAgIHZhciBjb252ZXJ0ZWRGcm9tT2JqZWN0ID0gdGhpcy5mcm9tT2JqZWN0ID0gaXNPYmplY3QoaXRlbSkgJiYgaGFzT3duKGl0ZW0sICcka2V5JykgJiYgaGFzT3duKGl0ZW0sICckdmFsdWUnKTtcblxuICAgIHZhciB0cmFja0J5S2V5ID0gdGhpcy5wYXJhbXMudHJhY2tCeTtcbiAgICB2YXIgb2xkRnJhZ3MgPSB0aGlzLmZyYWdzO1xuICAgIHZhciBmcmFncyA9IHRoaXMuZnJhZ3MgPSBuZXcgQXJyYXkoZGF0YS5sZW5ndGgpO1xuICAgIHZhciBhbGlhcyA9IHRoaXMuYWxpYXM7XG4gICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5pdGVyYXRvcjtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLnN0YXJ0O1xuICAgIHZhciBlbmQgPSB0aGlzLmVuZDtcbiAgICB2YXIgaW5Eb2N1bWVudCA9IGluRG9jKHN0YXJ0KTtcbiAgICB2YXIgaW5pdCA9ICFvbGRGcmFncztcbiAgICB2YXIgaSwgbCwgZnJhZywga2V5LCB2YWx1ZSwgcHJpbWl0aXZlO1xuXG4gICAgLy8gRmlyc3QgcGFzcywgZ28gdGhyb3VnaCB0aGUgbmV3IEFycmF5IGFuZCBmaWxsIHVwXG4gICAgLy8gdGhlIG5ldyBmcmFncyBhcnJheS4gSWYgYSBwaWVjZSBvZiBkYXRhIGhhcyBhIGNhY2hlZFxuICAgIC8vIGluc3RhbmNlIGZvciBpdCwgd2UgcmV1c2UgaXQuIE90aGVyd2lzZSBidWlsZCBhIG5ld1xuICAgIC8vIGluc3RhbmNlLlxuICAgIGZvciAoaSA9IDAsIGwgPSBkYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaXRlbSA9IGRhdGFbaV07XG4gICAgICBrZXkgPSBjb252ZXJ0ZWRGcm9tT2JqZWN0ID8gaXRlbS4ka2V5IDogbnVsbDtcbiAgICAgIHZhbHVlID0gY29udmVydGVkRnJvbU9iamVjdCA/IGl0ZW0uJHZhbHVlIDogaXRlbTtcbiAgICAgIHByaW1pdGl2ZSA9ICFpc09iamVjdCh2YWx1ZSk7XG4gICAgICBmcmFnID0gIWluaXQgJiYgdGhpcy5nZXRDYWNoZWRGcmFnKHZhbHVlLCBpLCBrZXkpO1xuICAgICAgaWYgKGZyYWcpIHtcbiAgICAgICAgLy8gcmV1c2FibGUgZnJhZ21lbnRcbiAgICAgICAgZnJhZy5yZXVzZWQgPSB0cnVlO1xuICAgICAgICAvLyB1cGRhdGUgJGluZGV4XG4gICAgICAgIGZyYWcuc2NvcGUuJGluZGV4ID0gaTtcbiAgICAgICAgLy8gdXBkYXRlICRrZXlcbiAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgIGZyYWcuc2NvcGUuJGtleSA9IGtleTtcbiAgICAgICAgfVxuICAgICAgICAvLyB1cGRhdGUgaXRlcmF0b3JcbiAgICAgICAgaWYgKGl0ZXJhdG9yKSB7XG4gICAgICAgICAgZnJhZy5zY29wZVtpdGVyYXRvcl0gPSBrZXkgIT09IG51bGwgPyBrZXkgOiBpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHVwZGF0ZSBkYXRhIGZvciB0cmFjay1ieSwgb2JqZWN0IHJlcGVhdCAmXG4gICAgICAgIC8vIHByaW1pdGl2ZSB2YWx1ZXMuXG4gICAgICAgIGlmICh0cmFja0J5S2V5IHx8IGNvbnZlcnRlZEZyb21PYmplY3QgfHwgcHJpbWl0aXZlKSB7XG4gICAgICAgICAgd2l0aG91dENvbnZlcnNpb24oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnJhZy5zY29wZVthbGlhc10gPSB2YWx1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbmV3IGlzbnRhbmNlXG4gICAgICAgIGZyYWcgPSB0aGlzLmNyZWF0ZSh2YWx1ZSwgYWxpYXMsIGksIGtleSk7XG4gICAgICAgIGZyYWcuZnJlc2ggPSAhaW5pdDtcbiAgICAgIH1cbiAgICAgIGZyYWdzW2ldID0gZnJhZztcbiAgICAgIGlmIChpbml0KSB7XG4gICAgICAgIGZyYWcuYmVmb3JlKGVuZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gd2UncmUgZG9uZSBmb3IgdGhlIGluaXRpYWwgcmVuZGVyLlxuICAgIGlmIChpbml0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gU2Vjb25kIHBhc3MsIGdvIHRocm91Z2ggdGhlIG9sZCBmcmFnbWVudHMgYW5kXG4gICAgLy8gZGVzdHJveSB0aG9zZSB3aG8gYXJlIG5vdCByZXVzZWQgKGFuZCByZW1vdmUgdGhlbVxuICAgIC8vIGZyb20gY2FjaGUpXG4gICAgdmFyIHJlbW92YWxJbmRleCA9IDA7XG4gICAgdmFyIHRvdGFsUmVtb3ZlZCA9IG9sZEZyYWdzLmxlbmd0aCAtIGZyYWdzLmxlbmd0aDtcbiAgICAvLyB3aGVuIHJlbW92aW5nIGEgbGFyZ2UgbnVtYmVyIG9mIGZyYWdtZW50cywgd2F0Y2hlciByZW1vdmFsXG4gICAgLy8gdHVybnMgb3V0IHRvIGJlIGEgcGVyZiBib3R0bGVuZWNrLCBzbyB3ZSBiYXRjaCB0aGUgd2F0Y2hlclxuICAgIC8vIHJlbW92YWxzIGludG8gYSBzaW5nbGUgZmlsdGVyIGNhbGwhXG4gICAgdGhpcy52bS5fdkZvclJlbW92aW5nID0gdHJ1ZTtcbiAgICBmb3IgKGkgPSAwLCBsID0gb2xkRnJhZ3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmcmFnID0gb2xkRnJhZ3NbaV07XG4gICAgICBpZiAoIWZyYWcucmV1c2VkKSB7XG4gICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVkRnJhZyhmcmFnKTtcbiAgICAgICAgdGhpcy5yZW1vdmUoZnJhZywgcmVtb3ZhbEluZGV4KyssIHRvdGFsUmVtb3ZlZCwgaW5Eb2N1bWVudCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudm0uX3ZGb3JSZW1vdmluZyA9IGZhbHNlO1xuICAgIGlmIChyZW1vdmFsSW5kZXgpIHtcbiAgICAgIHRoaXMudm0uX3dhdGNoZXJzID0gdGhpcy52bS5fd2F0Y2hlcnMuZmlsdGVyKGZ1bmN0aW9uICh3KSB7XG4gICAgICAgIHJldHVybiB3LmFjdGl2ZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEZpbmFsIHBhc3MsIG1vdmUvaW5zZXJ0IG5ldyBmcmFnbWVudHMgaW50byB0aGVcbiAgICAvLyByaWdodCBwbGFjZS5cbiAgICB2YXIgdGFyZ2V0UHJldiwgcHJldkVsLCBjdXJyZW50UHJldjtcbiAgICB2YXIgaW5zZXJ0aW9uSW5kZXggPSAwO1xuICAgIGZvciAoaSA9IDAsIGwgPSBmcmFncy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZyYWcgPSBmcmFnc1tpXTtcbiAgICAgIC8vIHRoaXMgaXMgdGhlIGZyYWcgdGhhdCB3ZSBzaG91bGQgYmUgYWZ0ZXJcbiAgICAgIHRhcmdldFByZXYgPSBmcmFnc1tpIC0gMV07XG4gICAgICBwcmV2RWwgPSB0YXJnZXRQcmV2ID8gdGFyZ2V0UHJldi5zdGFnZ2VyQ2IgPyB0YXJnZXRQcmV2LnN0YWdnZXJBbmNob3IgOiB0YXJnZXRQcmV2LmVuZCB8fCB0YXJnZXRQcmV2Lm5vZGUgOiBzdGFydDtcbiAgICAgIGlmIChmcmFnLnJldXNlZCAmJiAhZnJhZy5zdGFnZ2VyQ2IpIHtcbiAgICAgICAgY3VycmVudFByZXYgPSBmaW5kUHJldkZyYWcoZnJhZywgc3RhcnQsIHRoaXMuaWQpO1xuICAgICAgICBpZiAoY3VycmVudFByZXYgIT09IHRhcmdldFByZXYgJiYgKCFjdXJyZW50UHJldiB8fFxuICAgICAgICAvLyBvcHRpbWl6YXRpb24gZm9yIG1vdmluZyBhIHNpbmdsZSBpdGVtLlxuICAgICAgICAvLyB0aGFua3MgdG8gc3VnZ2VzdGlvbnMgYnkgQGxpdm9yYXMgaW4gIzE4MDdcbiAgICAgICAgZmluZFByZXZGcmFnKGN1cnJlbnRQcmV2LCBzdGFydCwgdGhpcy5pZCkgIT09IHRhcmdldFByZXYpKSB7XG4gICAgICAgICAgdGhpcy5tb3ZlKGZyYWcsIHByZXZFbCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG5ldyBpbnN0YW5jZSwgb3Igc3RpbGwgaW4gc3RhZ2dlci5cbiAgICAgICAgLy8gaW5zZXJ0IHdpdGggdXBkYXRlZCBzdGFnZ2VyIGluZGV4LlxuICAgICAgICB0aGlzLmluc2VydChmcmFnLCBpbnNlcnRpb25JbmRleCsrLCBwcmV2RWwsIGluRG9jdW1lbnQpO1xuICAgICAgfVxuICAgICAgZnJhZy5yZXVzZWQgPSBmcmFnLmZyZXNoID0gZmFsc2U7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgZnJhZ21lbnQgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGFsaWFzXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICAgKiBAcGFyYW0ge1N0cmluZ30gW2tleV1cbiAgICogQHJldHVybiB7RnJhZ21lbnR9XG4gICAqL1xuXG4gIGNyZWF0ZTogZnVuY3Rpb24gY3JlYXRlKHZhbHVlLCBhbGlhcywgaW5kZXgsIGtleSkge1xuICAgIHZhciBob3N0ID0gdGhpcy5faG9zdDtcbiAgICAvLyBjcmVhdGUgaXRlcmF0aW9uIHNjb3BlXG4gICAgdmFyIHBhcmVudFNjb3BlID0gdGhpcy5fc2NvcGUgfHwgdGhpcy52bTtcbiAgICB2YXIgc2NvcGUgPSBPYmplY3QuY3JlYXRlKHBhcmVudFNjb3BlKTtcbiAgICAvLyByZWYgaG9sZGVyIGZvciB0aGUgc2NvcGVcbiAgICBzY29wZS4kcmVmcyA9IE9iamVjdC5jcmVhdGUocGFyZW50U2NvcGUuJHJlZnMpO1xuICAgIHNjb3BlLiRlbHMgPSBPYmplY3QuY3JlYXRlKHBhcmVudFNjb3BlLiRlbHMpO1xuICAgIC8vIG1ha2Ugc3VyZSBwb2ludCAkcGFyZW50IHRvIHBhcmVudCBzY29wZVxuICAgIHNjb3BlLiRwYXJlbnQgPSBwYXJlbnRTY29wZTtcbiAgICAvLyBmb3IgdHdvLXdheSBiaW5kaW5nIG9uIGFsaWFzXG4gICAgc2NvcGUuJGZvckNvbnRleHQgPSB0aGlzO1xuICAgIC8vIGRlZmluZSBzY29wZSBwcm9wZXJ0aWVzXG4gICAgLy8gaW1wb3J0YW50OiBkZWZpbmUgdGhlIHNjb3BlIGFsaWFzIHdpdGhvdXQgZm9yY2VkIGNvbnZlcnNpb25cbiAgICAvLyBzbyB0aGF0IGZyb3plbiBkYXRhIHN0cnVjdHVyZXMgcmVtYWluIG5vbi1yZWFjdGl2ZS5cbiAgICB3aXRob3V0Q29udmVyc2lvbihmdW5jdGlvbiAoKSB7XG4gICAgICBkZWZpbmVSZWFjdGl2ZShzY29wZSwgYWxpYXMsIHZhbHVlKTtcbiAgICB9KTtcbiAgICBkZWZpbmVSZWFjdGl2ZShzY29wZSwgJyRpbmRleCcsIGluZGV4KTtcbiAgICBpZiAoa2V5KSB7XG4gICAgICBkZWZpbmVSZWFjdGl2ZShzY29wZSwgJyRrZXknLCBrZXkpO1xuICAgIH0gZWxzZSBpZiAoc2NvcGUuJGtleSkge1xuICAgICAgLy8gYXZvaWQgYWNjaWRlbnRhbCBmYWxsYmFja1xuICAgICAgZGVmKHNjb3BlLCAnJGtleScsIG51bGwpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pdGVyYXRvcikge1xuICAgICAgZGVmaW5lUmVhY3RpdmUoc2NvcGUsIHRoaXMuaXRlcmF0b3IsIGtleSAhPT0gbnVsbCA/IGtleSA6IGluZGV4KTtcbiAgICB9XG4gICAgdmFyIGZyYWcgPSB0aGlzLmZhY3RvcnkuY3JlYXRlKGhvc3QsIHNjb3BlLCB0aGlzLl9mcmFnKTtcbiAgICBmcmFnLmZvcklkID0gdGhpcy5pZDtcbiAgICB0aGlzLmNhY2hlRnJhZyh2YWx1ZSwgZnJhZywgaW5kZXgsIGtleSk7XG4gICAgcmV0dXJuIGZyYWc7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgdi1yZWYgb24gb3duZXIgdm0uXG4gICAqL1xuXG4gIHVwZGF0ZVJlZjogZnVuY3Rpb24gdXBkYXRlUmVmKCkge1xuICAgIHZhciByZWYgPSB0aGlzLmRlc2NyaXB0b3IucmVmO1xuICAgIGlmICghcmVmKSByZXR1cm47XG4gICAgdmFyIGhhc2ggPSAodGhpcy5fc2NvcGUgfHwgdGhpcy52bSkuJHJlZnM7XG4gICAgdmFyIHJlZnM7XG4gICAgaWYgKCF0aGlzLmZyb21PYmplY3QpIHtcbiAgICAgIHJlZnMgPSB0aGlzLmZyYWdzLm1hcChmaW5kVm1Gcm9tRnJhZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZnMgPSB7fTtcbiAgICAgIHRoaXMuZnJhZ3MuZm9yRWFjaChmdW5jdGlvbiAoZnJhZykge1xuICAgICAgICByZWZzW2ZyYWcuc2NvcGUuJGtleV0gPSBmaW5kVm1Gcm9tRnJhZyhmcmFnKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBoYXNoW3JlZl0gPSByZWZzO1xuICB9LFxuXG4gIC8qKlxuICAgKiBGb3Igb3B0aW9uIGxpc3RzLCB1cGRhdGUgdGhlIGNvbnRhaW5pbmcgdi1tb2RlbCBvblxuICAgKiBwYXJlbnQgPHNlbGVjdD4uXG4gICAqL1xuXG4gIHVwZGF0ZU1vZGVsOiBmdW5jdGlvbiB1cGRhdGVNb2RlbCgpIHtcbiAgICBpZiAodGhpcy5pc09wdGlvbikge1xuICAgICAgdmFyIHBhcmVudCA9IHRoaXMuc3RhcnQucGFyZW50Tm9kZTtcbiAgICAgIHZhciBtb2RlbCA9IHBhcmVudCAmJiBwYXJlbnQuX192X21vZGVsO1xuICAgICAgaWYgKG1vZGVsKSB7XG4gICAgICAgIG1vZGVsLmZvcmNlVXBkYXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYSBmcmFnbWVudC4gSGFuZGxlcyBzdGFnZ2VyaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge0ZyYWdtZW50fSBmcmFnXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICAgKiBAcGFyYW0ge05vZGV9IHByZXZFbFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGluRG9jdW1lbnRcbiAgICovXG5cbiAgaW5zZXJ0OiBmdW5jdGlvbiBpbnNlcnQoZnJhZywgaW5kZXgsIHByZXZFbCwgaW5Eb2N1bWVudCkge1xuICAgIGlmIChmcmFnLnN0YWdnZXJDYikge1xuICAgICAgZnJhZy5zdGFnZ2VyQ2IuY2FuY2VsKCk7XG4gICAgICBmcmFnLnN0YWdnZXJDYiA9IG51bGw7XG4gICAgfVxuICAgIHZhciBzdGFnZ2VyQW1vdW50ID0gdGhpcy5nZXRTdGFnZ2VyKGZyYWcsIGluZGV4LCBudWxsLCAnZW50ZXInKTtcbiAgICBpZiAoaW5Eb2N1bWVudCAmJiBzdGFnZ2VyQW1vdW50KSB7XG4gICAgICAvLyBjcmVhdGUgYW4gYW5jaG9yIGFuZCBpbnNlcnQgaXQgc3luY2hyb25vdXNseSxcbiAgICAgIC8vIHNvIHRoYXQgd2UgY2FuIHJlc29sdmUgdGhlIGNvcnJlY3Qgb3JkZXIgd2l0aG91dFxuICAgICAgLy8gd29ycnlpbmcgYWJvdXQgc29tZSBlbGVtZW50cyBub3QgaW5zZXJ0ZWQgeWV0XG4gICAgICB2YXIgYW5jaG9yID0gZnJhZy5zdGFnZ2VyQW5jaG9yO1xuICAgICAgaWYgKCFhbmNob3IpIHtcbiAgICAgICAgYW5jaG9yID0gZnJhZy5zdGFnZ2VyQW5jaG9yID0gY3JlYXRlQW5jaG9yKCdzdGFnZ2VyLWFuY2hvcicpO1xuICAgICAgICBhbmNob3IuX192X2ZyYWcgPSBmcmFnO1xuICAgICAgfVxuICAgICAgYWZ0ZXIoYW5jaG9yLCBwcmV2RWwpO1xuICAgICAgdmFyIG9wID0gZnJhZy5zdGFnZ2VyQ2IgPSBjYW5jZWxsYWJsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZyYWcuc3RhZ2dlckNiID0gbnVsbDtcbiAgICAgICAgZnJhZy5iZWZvcmUoYW5jaG9yKTtcbiAgICAgICAgcmVtb3ZlKGFuY2hvcik7XG4gICAgICB9KTtcbiAgICAgIHNldFRpbWVvdXQob3AsIHN0YWdnZXJBbW91bnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gcHJldkVsLm5leHRTaWJsaW5nO1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICAvLyByZXNldCBlbmQgYW5jaG9yIHBvc2l0aW9uIGluIGNhc2UgdGhlIHBvc2l0aW9uIHdhcyBtZXNzZWQgdXBcbiAgICAgICAgLy8gYnkgYW4gZXh0ZXJuYWwgZHJhZy1uLWRyb3AgbGlicmFyeS5cbiAgICAgICAgYWZ0ZXIodGhpcy5lbmQsIHByZXZFbCk7XG4gICAgICAgIHRhcmdldCA9IHRoaXMuZW5kO1xuICAgICAgfVxuICAgICAgZnJhZy5iZWZvcmUodGFyZ2V0KTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGZyYWdtZW50LiBIYW5kbGVzIHN0YWdnZXJpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7RnJhZ21lbnR9IGZyYWdcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0b3RhbFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGluRG9jdW1lbnRcbiAgICovXG5cbiAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoZnJhZywgaW5kZXgsIHRvdGFsLCBpbkRvY3VtZW50KSB7XG4gICAgaWYgKGZyYWcuc3RhZ2dlckNiKSB7XG4gICAgICBmcmFnLnN0YWdnZXJDYi5jYW5jZWwoKTtcbiAgICAgIGZyYWcuc3RhZ2dlckNiID0gbnVsbDtcbiAgICAgIC8vIGl0J3Mgbm90IHBvc3NpYmxlIGZvciB0aGUgc2FtZSBmcmFnIHRvIGJlIHJlbW92ZWRcbiAgICAgIC8vIHR3aWNlLCBzbyBpZiB3ZSBoYXZlIGEgcGVuZGluZyBzdGFnZ2VyIGNhbGxiYWNrLFxuICAgICAgLy8gaXQgbWVhbnMgdGhpcyBmcmFnIGlzIHF1ZXVlZCBmb3IgZW50ZXIgYnV0IHJlbW92ZWRcbiAgICAgIC8vIGJlZm9yZSBpdHMgdHJhbnNpdGlvbiBzdGFydGVkLiBTaW5jZSBpdCBpcyBhbHJlYWR5XG4gICAgICAvLyBkZXN0cm95ZWQsIHdlIGNhbiBqdXN0IGxlYXZlIGl0IGluIGRldGFjaGVkIHN0YXRlLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgc3RhZ2dlckFtb3VudCA9IHRoaXMuZ2V0U3RhZ2dlcihmcmFnLCBpbmRleCwgdG90YWwsICdsZWF2ZScpO1xuICAgIGlmIChpbkRvY3VtZW50ICYmIHN0YWdnZXJBbW91bnQpIHtcbiAgICAgIHZhciBvcCA9IGZyYWcuc3RhZ2dlckNiID0gY2FuY2VsbGFibGUoZnVuY3Rpb24gKCkge1xuICAgICAgICBmcmFnLnN0YWdnZXJDYiA9IG51bGw7XG4gICAgICAgIGZyYWcucmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgICAgIHNldFRpbWVvdXQob3AsIHN0YWdnZXJBbW91bnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmcmFnLnJlbW92ZSgpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogTW92ZSBhIGZyYWdtZW50IHRvIGEgbmV3IHBvc2l0aW9uLlxuICAgKiBGb3JjZSBubyB0cmFuc2l0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge0ZyYWdtZW50fSBmcmFnXG4gICAqIEBwYXJhbSB7Tm9kZX0gcHJldkVsXG4gICAqL1xuXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoZnJhZywgcHJldkVsKSB7XG4gICAgLy8gZml4IGEgY29tbW9uIGlzc3VlIHdpdGggU29ydGFibGU6XG4gICAgLy8gaWYgcHJldkVsIGRvZXNuJ3QgaGF2ZSBuZXh0U2libGluZywgdGhpcyBtZWFucyBpdCdzXG4gICAgLy8gYmVlbiBkcmFnZ2VkIGFmdGVyIHRoZSBlbmQgYW5jaG9yLiBKdXN0IHJlLXBvc2l0aW9uXG4gICAgLy8gdGhlIGVuZCBhbmNob3IgdG8gdGhlIGVuZCBvZiB0aGUgY29udGFpbmVyLlxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghcHJldkVsLm5leHRTaWJsaW5nKSB7XG4gICAgICB0aGlzLmVuZC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMuZW5kKTtcbiAgICB9XG4gICAgZnJhZy5iZWZvcmUocHJldkVsLm5leHRTaWJsaW5nLCBmYWxzZSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhY2hlIGEgZnJhZ21lbnQgdXNpbmcgdHJhY2stYnkgb3IgdGhlIG9iamVjdCBrZXkuXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICogQHBhcmFtIHtGcmFnbWVudH0gZnJhZ1xuICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAgICogQHBhcmFtIHtTdHJpbmd9IFtrZXldXG4gICAqL1xuXG4gIGNhY2hlRnJhZzogZnVuY3Rpb24gY2FjaGVGcmFnKHZhbHVlLCBmcmFnLCBpbmRleCwga2V5KSB7XG4gICAgdmFyIHRyYWNrQnlLZXkgPSB0aGlzLnBhcmFtcy50cmFja0J5O1xuICAgIHZhciBjYWNoZSA9IHRoaXMuY2FjaGU7XG4gICAgdmFyIHByaW1pdGl2ZSA9ICFpc09iamVjdCh2YWx1ZSk7XG4gICAgdmFyIGlkO1xuICAgIGlmIChrZXkgfHwgdHJhY2tCeUtleSB8fCBwcmltaXRpdmUpIHtcbiAgICAgIGlkID0gZ2V0VHJhY2tCeUtleShpbmRleCwga2V5LCB2YWx1ZSwgdHJhY2tCeUtleSk7XG4gICAgICBpZiAoIWNhY2hlW2lkXSkge1xuICAgICAgICBjYWNoZVtpZF0gPSBmcmFnO1xuICAgICAgfSBlbHNlIGlmICh0cmFja0J5S2V5ICE9PSAnJGluZGV4Jykge1xuICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHRoaXMud2FybkR1cGxpY2F0ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlkID0gdGhpcy5pZDtcbiAgICAgIGlmIChoYXNPd24odmFsdWUsIGlkKSkge1xuICAgICAgICBpZiAodmFsdWVbaWRdID09PSBudWxsKSB7XG4gICAgICAgICAgdmFsdWVbaWRdID0gZnJhZztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHRoaXMud2FybkR1cGxpY2F0ZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoT2JqZWN0LmlzRXh0ZW5zaWJsZSh2YWx1ZSkpIHtcbiAgICAgICAgZGVmKHZhbHVlLCBpZCwgZnJhZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgd2FybignRnJvemVuIHYtZm9yIG9iamVjdHMgY2Fubm90IGJlIGF1dG9tYXRpY2FsbHkgdHJhY2tlZCwgbWFrZSBzdXJlIHRvICcgKyAncHJvdmlkZSBhIHRyYWNrLWJ5IGtleS4nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZnJhZy5yYXcgPSB2YWx1ZTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0IGEgY2FjaGVkIGZyYWdtZW50IGZyb20gdGhlIHZhbHVlL2luZGV4L2tleVxuICAgKlxuICAgKiBAcGFyYW0geyp9IHZhbHVlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge0ZyYWdtZW50fVxuICAgKi9cblxuICBnZXRDYWNoZWRGcmFnOiBmdW5jdGlvbiBnZXRDYWNoZWRGcmFnKHZhbHVlLCBpbmRleCwga2V5KSB7XG4gICAgdmFyIHRyYWNrQnlLZXkgPSB0aGlzLnBhcmFtcy50cmFja0J5O1xuICAgIHZhciBwcmltaXRpdmUgPSAhaXNPYmplY3QodmFsdWUpO1xuICAgIHZhciBmcmFnO1xuICAgIGlmIChrZXkgfHwgdHJhY2tCeUtleSB8fCBwcmltaXRpdmUpIHtcbiAgICAgIHZhciBpZCA9IGdldFRyYWNrQnlLZXkoaW5kZXgsIGtleSwgdmFsdWUsIHRyYWNrQnlLZXkpO1xuICAgICAgZnJhZyA9IHRoaXMuY2FjaGVbaWRdO1xuICAgIH0gZWxzZSB7XG4gICAgICBmcmFnID0gdmFsdWVbdGhpcy5pZF07XG4gICAgfVxuICAgIGlmIChmcmFnICYmIChmcmFnLnJldXNlZCB8fCBmcmFnLmZyZXNoKSkge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB0aGlzLndhcm5EdXBsaWNhdGUodmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gZnJhZztcbiAgfSxcblxuICAvKipcbiAgICogRGVsZXRlIGEgZnJhZ21lbnQgZnJvbSBjYWNoZS5cbiAgICpcbiAgICogQHBhcmFtIHtGcmFnbWVudH0gZnJhZ1xuICAgKi9cblxuICBkZWxldGVDYWNoZWRGcmFnOiBmdW5jdGlvbiBkZWxldGVDYWNoZWRGcmFnKGZyYWcpIHtcbiAgICB2YXIgdmFsdWUgPSBmcmFnLnJhdztcbiAgICB2YXIgdHJhY2tCeUtleSA9IHRoaXMucGFyYW1zLnRyYWNrQnk7XG4gICAgdmFyIHNjb3BlID0gZnJhZy5zY29wZTtcbiAgICB2YXIgaW5kZXggPSBzY29wZS4kaW5kZXg7XG4gICAgLy8gZml4ICM5NDg6IGF2b2lkIGFjY2lkZW50YWxseSBmYWxsIHRocm91Z2ggdG9cbiAgICAvLyBhIHBhcmVudCByZXBlYXRlciB3aGljaCBoYXBwZW5zIHRvIGhhdmUgJGtleS5cbiAgICB2YXIga2V5ID0gaGFzT3duKHNjb3BlLCAnJGtleScpICYmIHNjb3BlLiRrZXk7XG4gICAgdmFyIHByaW1pdGl2ZSA9ICFpc09iamVjdCh2YWx1ZSk7XG4gICAgaWYgKHRyYWNrQnlLZXkgfHwga2V5IHx8IHByaW1pdGl2ZSkge1xuICAgICAgdmFyIGlkID0gZ2V0VHJhY2tCeUtleShpbmRleCwga2V5LCB2YWx1ZSwgdHJhY2tCeUtleSk7XG4gICAgICB0aGlzLmNhY2hlW2lkXSA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlW3RoaXMuaWRdID0gbnVsbDtcbiAgICAgIGZyYWcucmF3ID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc3RhZ2dlciBhbW91bnQgZm9yIGFuIGluc2VydGlvbi9yZW1vdmFsLlxuICAgKlxuICAgKiBAcGFyYW0ge0ZyYWdtZW50fSBmcmFnXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICAgKiBAcGFyYW0ge051bWJlcn0gdG90YWxcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICovXG5cbiAgZ2V0U3RhZ2dlcjogZnVuY3Rpb24gZ2V0U3RhZ2dlcihmcmFnLCBpbmRleCwgdG90YWwsIHR5cGUpIHtcbiAgICB0eXBlID0gdHlwZSArICdTdGFnZ2VyJztcbiAgICB2YXIgdHJhbnMgPSBmcmFnLm5vZGUuX192X3RyYW5zO1xuICAgIHZhciBob29rcyA9IHRyYW5zICYmIHRyYW5zLmhvb2tzO1xuICAgIHZhciBob29rID0gaG9va3MgJiYgKGhvb2tzW3R5cGVdIHx8IGhvb2tzLnN0YWdnZXIpO1xuICAgIHJldHVybiBob29rID8gaG9vay5jYWxsKGZyYWcsIGluZGV4LCB0b3RhbCkgOiBpbmRleCAqIHBhcnNlSW50KHRoaXMucGFyYW1zW3R5cGVdIHx8IHRoaXMucGFyYW1zLnN0YWdnZXIsIDEwKTtcbiAgfSxcblxuICAvKipcbiAgICogUHJlLXByb2Nlc3MgdGhlIHZhbHVlIGJlZm9yZSBwaXBpbmcgaXQgdGhyb3VnaCB0aGVcbiAgICogZmlsdGVycy4gVGhpcyBpcyBwYXNzZWQgdG8gYW5kIGNhbGxlZCBieSB0aGUgd2F0Y2hlci5cbiAgICovXG5cbiAgX3ByZVByb2Nlc3M6IGZ1bmN0aW9uIF9wcmVQcm9jZXNzKHZhbHVlKSB7XG4gICAgLy8gcmVnYXJkbGVzcyBvZiB0eXBlLCBzdG9yZSB0aGUgdW4tZmlsdGVyZWQgcmF3IHZhbHVlLlxuICAgIHRoaXMucmF3VmFsdWUgPSB2YWx1ZTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFBvc3QtcHJvY2VzcyB0aGUgdmFsdWUgYWZ0ZXIgaXQgaGFzIGJlZW4gcGlwZWQgdGhyb3VnaFxuICAgKiB0aGUgZmlsdGVycy4gVGhpcyBpcyBwYXNzZWQgdG8gYW5kIGNhbGxlZCBieSB0aGUgd2F0Y2hlci5cbiAgICpcbiAgICogSXQgaXMgbmVjZXNzYXJ5IGZvciB0aGlzIHRvIGJlIGNhbGxlZCBkdXJpbmcgdGhlXG4gICAqIHdhdGhjZXIncyBkZXBlbmRlbmN5IGNvbGxlY3Rpb24gcGhhc2UgYmVjYXVzZSB3ZSB3YW50XG4gICAqIHRoZSB2LWZvciB0byB1cGRhdGUgd2hlbiB0aGUgc291cmNlIE9iamVjdCBpcyBtdXRhdGVkLlxuICAgKi9cblxuICBfcG9zdFByb2Nlc3M6IGZ1bmN0aW9uIF9wb3N0UHJvY2Vzcyh2YWx1ZSkge1xuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWx1ZSkpIHtcbiAgICAgIC8vIGNvbnZlcnQgcGxhaW4gb2JqZWN0IHRvIGFycmF5LlxuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gICAgICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICAgICAgdmFyIHJlcyA9IG5ldyBBcnJheShpKTtcbiAgICAgIHZhciBrZXk7XG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgIHJlc1tpXSA9IHtcbiAgICAgICAgICAka2V5OiBrZXksXG4gICAgICAgICAgJHZhbHVlOiB2YWx1ZVtrZXldXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpKSB7XG4gICAgICAgIHZhbHVlID0gcmFuZ2UodmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlIHx8IFtdO1xuICAgIH1cbiAgfSxcblxuICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCgpIHtcbiAgICBpZiAodGhpcy5kZXNjcmlwdG9yLnJlZikge1xuICAgICAgKHRoaXMuX3Njb3BlIHx8IHRoaXMudm0pLiRyZWZzW3RoaXMuZGVzY3JpcHRvci5yZWZdID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuZnJhZ3MpIHtcbiAgICAgIHZhciBpID0gdGhpcy5mcmFncy5sZW5ndGg7XG4gICAgICB2YXIgZnJhZztcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgZnJhZyA9IHRoaXMuZnJhZ3NbaV07XG4gICAgICAgIHRoaXMuZGVsZXRlQ2FjaGVkRnJhZyhmcmFnKTtcbiAgICAgICAgZnJhZy5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEhlbHBlciB0byBmaW5kIHRoZSBwcmV2aW91cyBlbGVtZW50IHRoYXQgaXMgYSBmcmFnbWVudFxuICogYW5jaG9yLiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIGEgZGVzdHJveWVkIGZyYWcnc1xuICogZWxlbWVudCBjb3VsZCBzdGlsbCBiZSBsaW5nZXJpbmcgaW4gdGhlIERPTSBiZWZvcmUgaXRzXG4gKiBsZWF2aW5nIHRyYW5zaXRpb24gZmluaXNoZXMsIGJ1dCBpdHMgaW5zZXJ0ZWQgZmxhZ1xuICogc2hvdWxkIGhhdmUgYmVlbiBzZXQgdG8gZmFsc2Ugc28gd2UgY2FuIHNraXAgdGhlbS5cbiAqXG4gKiBJZiB0aGlzIGlzIGEgYmxvY2sgcmVwZWF0LCB3ZSB3YW50IHRvIG1ha2Ugc3VyZSB3ZSBvbmx5XG4gKiByZXR1cm4gZnJhZyB0aGF0IGlzIGJvdW5kIHRvIHRoaXMgdi1mb3IuIChzZWUgIzkyOSlcbiAqXG4gKiBAcGFyYW0ge0ZyYWdtZW50fSBmcmFnXG4gKiBAcGFyYW0ge0NvbW1lbnR8VGV4dH0gYW5jaG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWRcbiAqIEByZXR1cm4ge0ZyYWdtZW50fVxuICovXG5cbmZ1bmN0aW9uIGZpbmRQcmV2RnJhZyhmcmFnLCBhbmNob3IsIGlkKSB7XG4gIHZhciBlbCA9IGZyYWcubm9kZS5wcmV2aW91c1NpYmxpbmc7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoIWVsKSByZXR1cm47XG4gIGZyYWcgPSBlbC5fX3ZfZnJhZztcbiAgd2hpbGUgKCghZnJhZyB8fCBmcmFnLmZvcklkICE9PSBpZCB8fCAhZnJhZy5pbnNlcnRlZCkgJiYgZWwgIT09IGFuY2hvcikge1xuICAgIGVsID0gZWwucHJldmlvdXNTaWJsaW5nO1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghZWwpIHJldHVybjtcbiAgICBmcmFnID0gZWwuX192X2ZyYWc7XG4gIH1cbiAgcmV0dXJuIGZyYWc7XG59XG5cbi8qKlxuICogRmluZCBhIHZtIGZyb20gYSBmcmFnbWVudC5cbiAqXG4gKiBAcGFyYW0ge0ZyYWdtZW50fSBmcmFnXG4gKiBAcmV0dXJuIHtWdWV8dW5kZWZpbmVkfVxuICovXG5cbmZ1bmN0aW9uIGZpbmRWbUZyb21GcmFnKGZyYWcpIHtcbiAgdmFyIG5vZGUgPSBmcmFnLm5vZGU7XG4gIC8vIGhhbmRsZSBtdWx0aS1ub2RlIGZyYWdcbiAgaWYgKGZyYWcuZW5kKSB7XG4gICAgd2hpbGUgKCFub2RlLl9fdnVlX18gJiYgbm9kZSAhPT0gZnJhZy5lbmQgJiYgbm9kZS5uZXh0U2libGluZykge1xuICAgICAgbm9kZSA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgfVxuICB9XG4gIHJldHVybiBub2RlLl9fdnVlX187XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgcmFuZ2UgYXJyYXkgZnJvbSBnaXZlbiBudW1iZXIuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIHJhbmdlKG4pIHtcbiAgdmFyIGkgPSAtMTtcbiAgdmFyIHJldCA9IG5ldyBBcnJheShNYXRoLmZsb29yKG4pKTtcbiAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICByZXRbaV0gPSBpO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogR2V0IHRoZSB0cmFjayBieSBrZXkgZm9yIGFuIGl0ZW0uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcGFyYW0ge1N0cmluZ30gW3RyYWNrQnlLZXldXG4gKi9cblxuZnVuY3Rpb24gZ2V0VHJhY2tCeUtleShpbmRleCwga2V5LCB2YWx1ZSwgdHJhY2tCeUtleSkge1xuICByZXR1cm4gdHJhY2tCeUtleSA/IHRyYWNrQnlLZXkgPT09ICckaW5kZXgnID8gaW5kZXggOiB0cmFja0J5S2V5LmNoYXJBdCgwKS5tYXRjaCgvXFx3LykgPyBnZXRQYXRoKHZhbHVlLCB0cmFja0J5S2V5KSA6IHZhbHVlW3RyYWNrQnlLZXldIDoga2V5IHx8IHZhbHVlO1xufVxuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICB2Rm9yLndhcm5EdXBsaWNhdGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB3YXJuKCdEdXBsaWNhdGUgdmFsdWUgZm91bmQgaW4gdi1mb3I9XCInICsgdGhpcy5kZXNjcmlwdG9yLnJhdyArICdcIjogJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKSArICcuIFVzZSB0cmFjay1ieT1cIiRpbmRleFwiIGlmICcgKyAneW91IGFyZSBleHBlY3RpbmcgZHVwbGljYXRlIHZhbHVlcy4nLCB0aGlzLnZtKTtcbiAgfTtcbn1cblxudmFyIHZJZiA9IHtcblxuICBwcmlvcml0eTogSUYsXG4gIHRlcm1pbmFsOiB0cnVlLFxuXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICBpZiAoIWVsLl9fdnVlX18pIHtcbiAgICAgIC8vIGNoZWNrIGVsc2UgYmxvY2tcbiAgICAgIHZhciBuZXh0ID0gZWwubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgaWYgKG5leHQgJiYgZ2V0QXR0cihuZXh0LCAndi1lbHNlJykgIT09IG51bGwpIHtcbiAgICAgICAgcmVtb3ZlKG5leHQpO1xuICAgICAgICB0aGlzLmVsc2VFbCA9IG5leHQ7XG4gICAgICB9XG4gICAgICAvLyBjaGVjayBtYWluIGJsb2NrXG4gICAgICB0aGlzLmFuY2hvciA9IGNyZWF0ZUFuY2hvcigndi1pZicpO1xuICAgICAgcmVwbGFjZShlbCwgdGhpcy5hbmNob3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oJ3YtaWY9XCInICsgdGhpcy5leHByZXNzaW9uICsgJ1wiIGNhbm5vdCBiZSAnICsgJ3VzZWQgb24gYW4gaW5zdGFuY2Ugcm9vdCBlbGVtZW50LicsIHRoaXMudm0pO1xuICAgICAgdGhpcy5pbnZhbGlkID0gdHJ1ZTtcbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUodmFsdWUpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkKSByZXR1cm47XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBpZiAoIXRoaXMuZnJhZykge1xuICAgICAgICB0aGlzLmluc2VydCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbW92ZSgpO1xuICAgIH1cbiAgfSxcblxuICBpbnNlcnQ6IGZ1bmN0aW9uIGluc2VydCgpIHtcbiAgICBpZiAodGhpcy5lbHNlRnJhZykge1xuICAgICAgdGhpcy5lbHNlRnJhZy5yZW1vdmUoKTtcbiAgICAgIHRoaXMuZWxzZUZyYWcgPSBudWxsO1xuICAgIH1cbiAgICAvLyBsYXp5IGluaXQgZmFjdG9yeVxuICAgIGlmICghdGhpcy5mYWN0b3J5KSB7XG4gICAgICB0aGlzLmZhY3RvcnkgPSBuZXcgRnJhZ21lbnRGYWN0b3J5KHRoaXMudm0sIHRoaXMuZWwpO1xuICAgIH1cbiAgICB0aGlzLmZyYWcgPSB0aGlzLmZhY3RvcnkuY3JlYXRlKHRoaXMuX2hvc3QsIHRoaXMuX3Njb3BlLCB0aGlzLl9mcmFnKTtcbiAgICB0aGlzLmZyYWcuYmVmb3JlKHRoaXMuYW5jaG9yKTtcbiAgfSxcblxuICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICBpZiAodGhpcy5mcmFnKSB7XG4gICAgICB0aGlzLmZyYWcucmVtb3ZlKCk7XG4gICAgICB0aGlzLmZyYWcgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5lbHNlRWwgJiYgIXRoaXMuZWxzZUZyYWcpIHtcbiAgICAgIGlmICghdGhpcy5lbHNlRmFjdG9yeSkge1xuICAgICAgICB0aGlzLmVsc2VGYWN0b3J5ID0gbmV3IEZyYWdtZW50RmFjdG9yeSh0aGlzLmVsc2VFbC5fY29udGV4dCB8fCB0aGlzLnZtLCB0aGlzLmVsc2VFbCk7XG4gICAgICB9XG4gICAgICB0aGlzLmVsc2VGcmFnID0gdGhpcy5lbHNlRmFjdG9yeS5jcmVhdGUodGhpcy5faG9zdCwgdGhpcy5fc2NvcGUsIHRoaXMuX2ZyYWcpO1xuICAgICAgdGhpcy5lbHNlRnJhZy5iZWZvcmUodGhpcy5hbmNob3IpO1xuICAgIH1cbiAgfSxcblxuICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCgpIHtcbiAgICBpZiAodGhpcy5mcmFnKSB7XG4gICAgICB0aGlzLmZyYWcuZGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5lbHNlRnJhZykge1xuICAgICAgdGhpcy5lbHNlRnJhZy5kZXN0cm95KCk7XG4gICAgfVxuICB9XG59O1xuXG52YXIgc2hvdyA9IHtcblxuICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgIC8vIGNoZWNrIGVsc2UgYmxvY2tcbiAgICB2YXIgbmV4dCA9IHRoaXMuZWwubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgIGlmIChuZXh0ICYmIGdldEF0dHIobmV4dCwgJ3YtZWxzZScpICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmVsc2VFbCA9IG5leHQ7XG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZhbHVlKSB7XG4gICAgdGhpcy5hcHBseSh0aGlzLmVsLCB2YWx1ZSk7XG4gICAgaWYgKHRoaXMuZWxzZUVsKSB7XG4gICAgICB0aGlzLmFwcGx5KHRoaXMuZWxzZUVsLCAhdmFsdWUpO1xuICAgIH1cbiAgfSxcblxuICBhcHBseTogZnVuY3Rpb24gYXBwbHkoZWwsIHZhbHVlKSB7XG4gICAgaWYgKGluRG9jKGVsKSkge1xuICAgICAgYXBwbHlUcmFuc2l0aW9uKGVsLCB2YWx1ZSA/IDEgOiAtMSwgdG9nZ2xlLCB0aGlzLnZtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9nZ2xlKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRvZ2dsZSgpIHtcbiAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSB2YWx1ZSA/ICcnIDogJ25vbmUnO1xuICAgIH1cbiAgfVxufTtcblxudmFyIHRleHQkMiA9IHtcblxuICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIHZhciBpc1JhbmdlID0gZWwudHlwZSA9PT0gJ3JhbmdlJztcbiAgICB2YXIgbGF6eSA9IHRoaXMucGFyYW1zLmxhenk7XG4gICAgdmFyIG51bWJlciA9IHRoaXMucGFyYW1zLm51bWJlcjtcbiAgICB2YXIgZGVib3VuY2UgPSB0aGlzLnBhcmFtcy5kZWJvdW5jZTtcblxuICAgIC8vIGhhbmRsZSBjb21wb3NpdGlvbiBldmVudHMuXG4gICAgLy8gICBodHRwOi8vYmxvZy5ldmFueW91Lm1lLzIwMTQvMDEvMDMvY29tcG9zaXRpb24tZXZlbnQvXG4gICAgLy8gc2tpcCB0aGlzIGZvciBBbmRyb2lkIGJlY2F1c2UgaXQgaGFuZGxlcyBjb21wb3NpdGlvblxuICAgIC8vIGV2ZW50cyBxdWl0ZSBkaWZmZXJlbnRseS4gQW5kcm9pZCBkb2Vzbid0IHRyaWdnZXJcbiAgICAvLyBjb21wb3NpdGlvbiBldmVudHMgZm9yIGxhbmd1YWdlIGlucHV0IG1ldGhvZHMgZS5nLlxuICAgIC8vIENoaW5lc2UsIGJ1dCBpbnN0ZWFkIHRyaWdnZXJzIHRoZW0gZm9yIHNwZWxsaW5nXG4gICAgLy8gc3VnZ2VzdGlvbnMuLi4gKHNlZSBEaXNjdXNzaW9uLyMxNjIpXG4gICAgdmFyIGNvbXBvc2luZyA9IGZhbHNlO1xuICAgIGlmICghaXNBbmRyb2lkICYmICFpc1JhbmdlKSB7XG4gICAgICB0aGlzLm9uKCdjb21wb3NpdGlvbnN0YXJ0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICBjb21wb3NpbmcgPSB0cnVlO1xuICAgICAgfSk7XG4gICAgICB0aGlzLm9uKCdjb21wb3NpdGlvbmVuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29tcG9zaW5nID0gZmFsc2U7XG4gICAgICAgIC8vIGluIElFMTEgdGhlIFwiY29tcG9zaXRpb25lbmRcIiBldmVudCBmaXJlcyBBRlRFUlxuICAgICAgICAvLyB0aGUgXCJpbnB1dFwiIGV2ZW50LCBzbyB0aGUgaW5wdXQgaGFuZGxlciBpcyBibG9ja2VkXG4gICAgICAgIC8vIGF0IHRoZSBlbmQuLi4gaGF2ZSB0byBjYWxsIGl0IGhlcmUuXG4gICAgICAgIC8vXG4gICAgICAgIC8vICMxMzI3OiBpbiBsYXp5IG1vZGUgdGhpcyBpcyB1bmVjZXNzYXJ5LlxuICAgICAgICBpZiAoIWxhenkpIHtcbiAgICAgICAgICBzZWxmLmxpc3RlbmVyKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHByZXZlbnQgbWVzc2luZyB3aXRoIHRoZSBpbnB1dCB3aGVuIHVzZXIgaXMgdHlwaW5nLFxuICAgIC8vIGFuZCBmb3JjZSB1cGRhdGUgb24gYmx1ci5cbiAgICB0aGlzLmZvY3VzZWQgPSBmYWxzZTtcbiAgICBpZiAoIWlzUmFuZ2UgJiYgIWxhenkpIHtcbiAgICAgIHRoaXMub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmZvY3VzZWQgPSB0cnVlO1xuICAgICAgfSk7XG4gICAgICB0aGlzLm9uKCdibHVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmZvY3VzZWQgPSBmYWxzZTtcbiAgICAgICAgLy8gZG8gbm90IHN5bmMgdmFsdWUgYWZ0ZXIgZnJhZ21lbnQgcmVtb3ZhbCAoIzIwMTcpXG4gICAgICAgIGlmICghc2VsZi5fZnJhZyB8fCBzZWxmLl9mcmFnLmluc2VydGVkKSB7XG4gICAgICAgICAgc2VsZi5yYXdMaXN0ZW5lcigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBOb3cgYXR0YWNoIHRoZSBtYWluIGxpc3RlbmVyXG4gICAgdGhpcy5saXN0ZW5lciA9IHRoaXMucmF3TGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoY29tcG9zaW5nIHx8ICFzZWxmLl9ib3VuZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgdmFsID0gbnVtYmVyIHx8IGlzUmFuZ2UgPyB0b051bWJlcihlbC52YWx1ZSkgOiBlbC52YWx1ZTtcbiAgICAgIHNlbGYuc2V0KHZhbCk7XG4gICAgICAvLyBmb3JjZSB1cGRhdGUgb24gbmV4dCB0aWNrIHRvIGF2b2lkIGxvY2sgJiBzYW1lIHZhbHVlXG4gICAgICAvLyBhbHNvIG9ubHkgdXBkYXRlIHdoZW4gdXNlciBpcyBub3QgdHlwaW5nXG4gICAgICBuZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChzZWxmLl9ib3VuZCAmJiAhc2VsZi5mb2N1c2VkKSB7XG4gICAgICAgICAgc2VsZi51cGRhdGUoc2VsZi5fd2F0Y2hlci52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBhcHBseSBkZWJvdW5jZVxuICAgIGlmIChkZWJvdW5jZSkge1xuICAgICAgdGhpcy5saXN0ZW5lciA9IF9kZWJvdW5jZSh0aGlzLmxpc3RlbmVyLCBkZWJvdW5jZSk7XG4gICAgfVxuXG4gICAgLy8gU3VwcG9ydCBqUXVlcnkgZXZlbnRzLCBzaW5jZSBqUXVlcnkudHJpZ2dlcigpIGRvZXNuJ3RcbiAgICAvLyB0cmlnZ2VyIG5hdGl2ZSBldmVudHMgaW4gc29tZSBjYXNlcyBhbmQgc29tZSBwbHVnaW5zXG4gICAgLy8gcmVseSBvbiAkLnRyaWdnZXIoKVxuICAgIC8vXG4gICAgLy8gV2Ugd2FudCB0byBtYWtlIHN1cmUgaWYgYSBsaXN0ZW5lciBpcyBhdHRhY2hlZCB1c2luZ1xuICAgIC8vIGpRdWVyeSwgaXQgaXMgYWxzbyByZW1vdmVkIHdpdGggalF1ZXJ5LCB0aGF0J3Mgd2h5XG4gICAgLy8gd2UgZG8gdGhlIGNoZWNrIGZvciBlYWNoIGRpcmVjdGl2ZSBpbnN0YW5jZSBhbmRcbiAgICAvLyBzdG9yZSB0aGF0IGNoZWNrIHJlc3VsdCBvbiBpdHNlbGYuIFRoaXMgYWxzbyBhbGxvd3NcbiAgICAvLyBlYXNpZXIgdGVzdCBjb3ZlcmFnZSBjb250cm9sIGJ5IHVuc2V0dGluZyB0aGUgZ2xvYmFsXG4gICAgLy8galF1ZXJ5IHZhcmlhYmxlIGluIHRlc3RzLlxuICAgIHRoaXMuaGFzalF1ZXJ5ID0gdHlwZW9mIGpRdWVyeSA9PT0gJ2Z1bmN0aW9uJztcbiAgICBpZiAodGhpcy5oYXNqUXVlcnkpIHtcbiAgICAgIHZhciBtZXRob2QgPSBqUXVlcnkuZm4ub24gPyAnb24nIDogJ2JpbmQnO1xuICAgICAgalF1ZXJ5KGVsKVttZXRob2RdKCdjaGFuZ2UnLCB0aGlzLnJhd0xpc3RlbmVyKTtcbiAgICAgIGlmICghbGF6eSkge1xuICAgICAgICBqUXVlcnkoZWwpW21ldGhvZF0oJ2lucHV0JywgdGhpcy5saXN0ZW5lcik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ2NoYW5nZScsIHRoaXMucmF3TGlzdGVuZXIpO1xuICAgICAgaWYgKCFsYXp5KSB7XG4gICAgICAgIHRoaXMub24oJ2lucHV0JywgdGhpcy5saXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSUU5IGRvZXNuJ3QgZmlyZSBpbnB1dCBldmVudCBvbiBiYWNrc3BhY2UvZGVsL2N1dFxuICAgIGlmICghbGF6eSAmJiBpc0lFOSkge1xuICAgICAgdGhpcy5vbignY3V0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICBuZXh0VGljayhzZWxmLmxpc3RlbmVyKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5vbigna2V5dXAnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSA0NiB8fCBlLmtleUNvZGUgPT09IDgpIHtcbiAgICAgICAgICBzZWxmLmxpc3RlbmVyKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHNldCBpbml0aWFsIHZhbHVlIGlmIHByZXNlbnRcbiAgICBpZiAoZWwuaGFzQXR0cmlidXRlKCd2YWx1ZScpIHx8IGVsLnRhZ05hbWUgPT09ICdURVhUQVJFQScgJiYgZWwudmFsdWUudHJpbSgpKSB7XG4gICAgICB0aGlzLmFmdGVyQmluZCA9IHRoaXMubGlzdGVuZXI7XG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZhbHVlKSB7XG4gICAgdGhpcy5lbC52YWx1ZSA9IF90b1N0cmluZyh2YWx1ZSk7XG4gIH0sXG5cbiAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICBpZiAodGhpcy5oYXNqUXVlcnkpIHtcbiAgICAgIHZhciBtZXRob2QgPSBqUXVlcnkuZm4ub2ZmID8gJ29mZicgOiAndW5iaW5kJztcbiAgICAgIGpRdWVyeShlbClbbWV0aG9kXSgnY2hhbmdlJywgdGhpcy5saXN0ZW5lcik7XG4gICAgICBqUXVlcnkoZWwpW21ldGhvZF0oJ2lucHV0JywgdGhpcy5saXN0ZW5lcik7XG4gICAgfVxuICB9XG59O1xuXG52YXIgcmFkaW8gPSB7XG5cbiAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcblxuICAgIHRoaXMuZ2V0VmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyB2YWx1ZSBvdmVyd3JpdGUgdmlhIHYtYmluZDp2YWx1ZVxuICAgICAgaWYgKGVsLmhhc093blByb3BlcnR5KCdfdmFsdWUnKSkge1xuICAgICAgICByZXR1cm4gZWwuX3ZhbHVlO1xuICAgICAgfVxuICAgICAgdmFyIHZhbCA9IGVsLnZhbHVlO1xuICAgICAgaWYgKHNlbGYucGFyYW1zLm51bWJlcikge1xuICAgICAgICB2YWwgPSB0b051bWJlcih2YWwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9O1xuXG4gICAgdGhpcy5saXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuc2V0KHNlbGYuZ2V0VmFsdWUoKSk7XG4gICAgfTtcbiAgICB0aGlzLm9uKCdjaGFuZ2UnLCB0aGlzLmxpc3RlbmVyKTtcblxuICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2NoZWNrZWQnKSkge1xuICAgICAgdGhpcy5hZnRlckJpbmQgPSB0aGlzLmxpc3RlbmVyO1xuICAgIH1cbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2YWx1ZSkge1xuICAgIHRoaXMuZWwuY2hlY2tlZCA9IGxvb3NlRXF1YWwodmFsdWUsIHRoaXMuZ2V0VmFsdWUoKSk7XG4gIH1cbn07XG5cbnZhciBzZWxlY3QgPSB7XG5cbiAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcblxuICAgIC8vIG1ldGhvZCB0byBmb3JjZSB1cGRhdGUgRE9NIHVzaW5nIGxhdGVzdCB2YWx1ZS5cbiAgICB0aGlzLmZvcmNlVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHNlbGYuX3dhdGNoZXIpIHtcbiAgICAgICAgc2VsZi51cGRhdGUoc2VsZi5fd2F0Y2hlci5nZXQoKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIGNoZWNrIGlmIHRoaXMgaXMgYSBtdWx0aXBsZSBzZWxlY3RcbiAgICB2YXIgbXVsdGlwbGUgPSB0aGlzLm11bHRpcGxlID0gZWwuaGFzQXR0cmlidXRlKCdtdWx0aXBsZScpO1xuXG4gICAgLy8gYXR0YWNoIGxpc3RlbmVyXG4gICAgdGhpcy5saXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGdldFZhbHVlKGVsLCBtdWx0aXBsZSk7XG4gICAgICB2YWx1ZSA9IHNlbGYucGFyYW1zLm51bWJlciA/IGlzQXJyYXkodmFsdWUpID8gdmFsdWUubWFwKHRvTnVtYmVyKSA6IHRvTnVtYmVyKHZhbHVlKSA6IHZhbHVlO1xuICAgICAgc2VsZi5zZXQodmFsdWUpO1xuICAgIH07XG4gICAgdGhpcy5vbignY2hhbmdlJywgdGhpcy5saXN0ZW5lcik7XG5cbiAgICAvLyBpZiBoYXMgaW5pdGlhbCB2YWx1ZSwgc2V0IGFmdGVyQmluZFxuICAgIHZhciBpbml0VmFsdWUgPSBnZXRWYWx1ZShlbCwgbXVsdGlwbGUsIHRydWUpO1xuICAgIGlmIChtdWx0aXBsZSAmJiBpbml0VmFsdWUubGVuZ3RoIHx8ICFtdWx0aXBsZSAmJiBpbml0VmFsdWUgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuYWZ0ZXJCaW5kID0gdGhpcy5saXN0ZW5lcjtcbiAgICB9XG5cbiAgICAvLyBBbGwgbWFqb3IgYnJvd3NlcnMgZXhjZXB0IEZpcmVmb3ggcmVzZXRzXG4gICAgLy8gc2VsZWN0ZWRJbmRleCB3aXRoIHZhbHVlIC0xIHRvIDAgd2hlbiB0aGUgZWxlbWVudFxuICAgIC8vIGlzIGFwcGVuZGVkIHRvIGEgbmV3IHBhcmVudCwgdGhlcmVmb3JlIHdlIGhhdmUgdG9cbiAgICAvLyBmb3JjZSBhIERPTSB1cGRhdGUgd2hlbmV2ZXIgdGhhdCBoYXBwZW5zLi4uXG4gICAgdGhpcy52bS4kb24oJ2hvb2s6YXR0YWNoZWQnLCB0aGlzLmZvcmNlVXBkYXRlKTtcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2YWx1ZSkge1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgZWwuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgIHZhciBtdWx0aSA9IHRoaXMubXVsdGlwbGUgJiYgaXNBcnJheSh2YWx1ZSk7XG4gICAgdmFyIG9wdGlvbnMgPSBlbC5vcHRpb25zO1xuICAgIHZhciBpID0gb3B0aW9ucy5sZW5ndGg7XG4gICAgdmFyIG9wLCB2YWw7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgb3AgPSBvcHRpb25zW2ldO1xuICAgICAgdmFsID0gb3AuaGFzT3duUHJvcGVydHkoJ192YWx1ZScpID8gb3AuX3ZhbHVlIDogb3AudmFsdWU7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cbiAgICAgIG9wLnNlbGVjdGVkID0gbXVsdGkgPyBpbmRleE9mJDEodmFsdWUsIHZhbCkgPiAtMSA6IGxvb3NlRXF1YWwodmFsdWUsIHZhbCk7XG4gICAgICAvKiBlc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xuICAgIH1cbiAgfSxcblxuICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCgpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHRoaXMudm0uJG9mZignaG9vazphdHRhY2hlZCcsIHRoaXMuZm9yY2VVcGRhdGUpO1xuICB9XG59O1xuXG4vKipcbiAqIEdldCBzZWxlY3QgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge1NlbGVjdEVsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG11bHRpXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGluaXRcbiAqIEByZXR1cm4ge0FycmF5fCp9XG4gKi9cblxuZnVuY3Rpb24gZ2V0VmFsdWUoZWwsIG11bHRpLCBpbml0KSB7XG4gIHZhciByZXMgPSBtdWx0aSA/IFtdIDogbnVsbDtcbiAgdmFyIG9wLCB2YWwsIHNlbGVjdGVkO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IGVsLm9wdGlvbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgb3AgPSBlbC5vcHRpb25zW2ldO1xuICAgIHNlbGVjdGVkID0gaW5pdCA/IG9wLmhhc0F0dHJpYnV0ZSgnc2VsZWN0ZWQnKSA6IG9wLnNlbGVjdGVkO1xuICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgdmFsID0gb3AuaGFzT3duUHJvcGVydHkoJ192YWx1ZScpID8gb3AuX3ZhbHVlIDogb3AudmFsdWU7XG4gICAgICBpZiAobXVsdGkpIHtcbiAgICAgICAgcmVzLnB1c2godmFsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbi8qKlxuICogTmF0aXZlIEFycmF5LmluZGV4T2YgdXNlcyBzdHJpY3QgZXF1YWwsIGJ1dCBpbiB0aGlzXG4gKiBjYXNlIHdlIG5lZWQgdG8gbWF0Y2ggc3RyaW5nL251bWJlcnMgd2l0aCBjdXN0b20gZXF1YWwuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0geyp9IHZhbFxuICovXG5cbmZ1bmN0aW9uIGluZGV4T2YkMShhcnIsIHZhbCkge1xuICB2YXIgaSA9IGFyci5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBpZiAobG9vc2VFcXVhbChhcnJbaV0sIHZhbCkpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbnZhciBjaGVja2JveCA9IHtcblxuICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuXG4gICAgdGhpcy5nZXRWYWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBlbC5oYXNPd25Qcm9wZXJ0eSgnX3ZhbHVlJykgPyBlbC5fdmFsdWUgOiBzZWxmLnBhcmFtcy5udW1iZXIgPyB0b051bWJlcihlbC52YWx1ZSkgOiBlbC52YWx1ZTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0Qm9vbGVhblZhbHVlKCkge1xuICAgICAgdmFyIHZhbCA9IGVsLmNoZWNrZWQ7XG4gICAgICBpZiAodmFsICYmIGVsLmhhc093blByb3BlcnR5KCdfdHJ1ZVZhbHVlJykpIHtcbiAgICAgICAgcmV0dXJuIGVsLl90cnVlVmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAoIXZhbCAmJiBlbC5oYXNPd25Qcm9wZXJ0eSgnX2ZhbHNlVmFsdWUnKSkge1xuICAgICAgICByZXR1cm4gZWwuX2ZhbHNlVmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cblxuICAgIHRoaXMubGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbW9kZWwgPSBzZWxmLl93YXRjaGVyLnZhbHVlO1xuICAgICAgaWYgKGlzQXJyYXkobW9kZWwpKSB7XG4gICAgICAgIHZhciB2YWwgPSBzZWxmLmdldFZhbHVlKCk7XG4gICAgICAgIGlmIChlbC5jaGVja2VkKSB7XG4gICAgICAgICAgaWYgKGluZGV4T2YobW9kZWwsIHZhbCkgPCAwKSB7XG4gICAgICAgICAgICBtb2RlbC5wdXNoKHZhbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1vZGVsLiRyZW1vdmUodmFsKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5zZXQoZ2V0Qm9vbGVhblZhbHVlKCkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm9uKCdjaGFuZ2UnLCB0aGlzLmxpc3RlbmVyKTtcbiAgICBpZiAoZWwuaGFzQXR0cmlidXRlKCdjaGVja2VkJykpIHtcbiAgICAgIHRoaXMuYWZ0ZXJCaW5kID0gdGhpcy5saXN0ZW5lcjtcbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUodmFsdWUpIHtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgZWwuY2hlY2tlZCA9IGluZGV4T2YodmFsdWUsIHRoaXMuZ2V0VmFsdWUoKSkgPiAtMTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGVsLmhhc093blByb3BlcnR5KCdfdHJ1ZVZhbHVlJykpIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9IGxvb3NlRXF1YWwodmFsdWUsIGVsLl90cnVlVmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9ICEhdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG52YXIgaGFuZGxlcnMgPSB7XG4gIHRleHQ6IHRleHQkMixcbiAgcmFkaW86IHJhZGlvLFxuICBzZWxlY3Q6IHNlbGVjdCxcbiAgY2hlY2tib3g6IGNoZWNrYm94XG59O1xuXG52YXIgbW9kZWwgPSB7XG5cbiAgcHJpb3JpdHk6IE1PREVMLFxuICB0d29XYXk6IHRydWUsXG4gIGhhbmRsZXJzOiBoYW5kbGVycyxcbiAgcGFyYW1zOiBbJ2xhenknLCAnbnVtYmVyJywgJ2RlYm91bmNlJ10sXG5cbiAgLyoqXG4gICAqIFBvc3NpYmxlIGVsZW1lbnRzOlxuICAgKiAgIDxzZWxlY3Q+XG4gICAqICAgPHRleHRhcmVhPlxuICAgKiAgIDxpbnB1dCB0eXBlPVwiKlwiPlxuICAgKiAgICAgLSB0ZXh0XG4gICAqICAgICAtIGNoZWNrYm94XG4gICAqICAgICAtIHJhZGlvXG4gICAqICAgICAtIG51bWJlclxuICAgKi9cblxuICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgIC8vIGZyaWVuZGx5IHdhcm5pbmcuLi5cbiAgICB0aGlzLmNoZWNrRmlsdGVycygpO1xuICAgIGlmICh0aGlzLmhhc1JlYWQgJiYgIXRoaXMuaGFzV3JpdGUpIHtcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignSXQgc2VlbXMgeW91IGFyZSB1c2luZyBhIHJlYWQtb25seSBmaWx0ZXIgd2l0aCAnICsgJ3YtbW9kZWw9XCInICsgdGhpcy5kZXNjcmlwdG9yLnJhdyArICdcIi4gJyArICdZb3UgbWlnaHQgd2FudCB0byB1c2UgYSB0d28td2F5IGZpbHRlciB0byBlbnN1cmUgY29ycmVjdCBiZWhhdmlvci4nLCB0aGlzLnZtKTtcbiAgICB9XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICB2YXIgdGFnID0gZWwudGFnTmFtZTtcbiAgICB2YXIgaGFuZGxlcjtcbiAgICBpZiAodGFnID09PSAnSU5QVVQnKSB7XG4gICAgICBoYW5kbGVyID0gaGFuZGxlcnNbZWwudHlwZV0gfHwgaGFuZGxlcnMudGV4dDtcbiAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgIGhhbmRsZXIgPSBoYW5kbGVycy5zZWxlY3Q7XG4gICAgfSBlbHNlIGlmICh0YWcgPT09ICdURVhUQVJFQScpIHtcbiAgICAgIGhhbmRsZXIgPSBoYW5kbGVycy50ZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oJ3YtbW9kZWwgZG9lcyBub3Qgc3VwcG9ydCBlbGVtZW50IHR5cGU6ICcgKyB0YWcsIHRoaXMudm0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbC5fX3ZfbW9kZWwgPSB0aGlzO1xuICAgIGhhbmRsZXIuYmluZC5jYWxsKHRoaXMpO1xuICAgIHRoaXMudXBkYXRlID0gaGFuZGxlci51cGRhdGU7XG4gICAgdGhpcy5fdW5iaW5kID0gaGFuZGxlci51bmJpbmQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrIHJlYWQvd3JpdGUgZmlsdGVyIHN0YXRzLlxuICAgKi9cblxuICBjaGVja0ZpbHRlcnM6IGZ1bmN0aW9uIGNoZWNrRmlsdGVycygpIHtcbiAgICB2YXIgZmlsdGVycyA9IHRoaXMuZmlsdGVycztcbiAgICBpZiAoIWZpbHRlcnMpIHJldHVybjtcbiAgICB2YXIgaSA9IGZpbHRlcnMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHZhciBmaWx0ZXIgPSByZXNvbHZlQXNzZXQodGhpcy52bS4kb3B0aW9ucywgJ2ZpbHRlcnMnLCBmaWx0ZXJzW2ldLm5hbWUpO1xuICAgICAgaWYgKHR5cGVvZiBmaWx0ZXIgPT09ICdmdW5jdGlvbicgfHwgZmlsdGVyLnJlYWQpIHtcbiAgICAgICAgdGhpcy5oYXNSZWFkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChmaWx0ZXIud3JpdGUpIHtcbiAgICAgICAgdGhpcy5oYXNXcml0ZSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKCkge1xuICAgIHRoaXMuZWwuX192X21vZGVsID0gbnVsbDtcbiAgICB0aGlzLl91bmJpbmQgJiYgdGhpcy5fdW5iaW5kKCk7XG4gIH1cbn07XG5cbi8vIGtleUNvZGUgYWxpYXNlc1xudmFyIGtleUNvZGVzID0ge1xuICBlc2M6IDI3LFxuICB0YWI6IDksXG4gIGVudGVyOiAxMyxcbiAgc3BhY2U6IDMyLFxuICAnZGVsZXRlJzogWzgsIDQ2XSxcbiAgdXA6IDM4LFxuICBsZWZ0OiAzNyxcbiAgcmlnaHQ6IDM5LFxuICBkb3duOiA0MFxufTtcblxuZnVuY3Rpb24ga2V5RmlsdGVyKGhhbmRsZXIsIGtleXMpIHtcbiAgdmFyIGNvZGVzID0ga2V5cy5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBjaGFyQ29kZSA9IGtleS5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChjaGFyQ29kZSA+IDQ3ICYmIGNoYXJDb2RlIDwgNTgpIHtcbiAgICAgIHJldHVybiBwYXJzZUludChrZXksIDEwKTtcbiAgICB9XG4gICAgaWYgKGtleS5sZW5ndGggPT09IDEpIHtcbiAgICAgIGNoYXJDb2RlID0ga2V5LnRvVXBwZXJDYXNlKCkuY2hhckNvZGVBdCgwKTtcbiAgICAgIGlmIChjaGFyQ29kZSA+IDY0ICYmIGNoYXJDb2RlIDwgOTEpIHtcbiAgICAgICAgcmV0dXJuIGNoYXJDb2RlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5Q29kZXNba2V5XTtcbiAgfSk7XG4gIGNvZGVzID0gW10uY29uY2F0LmFwcGx5KFtdLCBjb2Rlcyk7XG4gIHJldHVybiBmdW5jdGlvbiBrZXlIYW5kbGVyKGUpIHtcbiAgICBpZiAoY29kZXMuaW5kZXhPZihlLmtleUNvZGUpID4gLTEpIHtcbiAgICAgIHJldHVybiBoYW5kbGVyLmNhbGwodGhpcywgZSk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBzdG9wRmlsdGVyKGhhbmRsZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHN0b3BIYW5kbGVyKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIHJldHVybiBoYW5kbGVyLmNhbGwodGhpcywgZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByZXZlbnRGaWx0ZXIoaGFuZGxlcikge1xuICByZXR1cm4gZnVuY3Rpb24gcHJldmVudEhhbmRsZXIoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICByZXR1cm4gaGFuZGxlci5jYWxsKHRoaXMsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzZWxmRmlsdGVyKGhhbmRsZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHNlbGZIYW5kbGVyKGUpIHtcbiAgICBpZiAoZS50YXJnZXQgPT09IGUuY3VycmVudFRhcmdldCkge1xuICAgICAgcmV0dXJuIGhhbmRsZXIuY2FsbCh0aGlzLCBlKTtcbiAgICB9XG4gIH07XG59XG5cbnZhciBvbiQxID0ge1xuXG4gIHByaW9yaXR5OiBPTixcbiAgYWNjZXB0U3RhdGVtZW50OiB0cnVlLFxuICBrZXlDb2Rlczoga2V5Q29kZXMsXG5cbiAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICAvLyBkZWFsIHdpdGggaWZyYW1lc1xuICAgIGlmICh0aGlzLmVsLnRhZ05hbWUgPT09ICdJRlJBTUUnICYmIHRoaXMuYXJnICE9PSAnbG9hZCcpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMuaWZyYW1lQmluZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgb24oc2VsZi5lbC5jb250ZW50V2luZG93LCBzZWxmLmFyZywgc2VsZi5oYW5kbGVyLCBzZWxmLm1vZGlmaWVycy5jYXB0dXJlKTtcbiAgICAgIH07XG4gICAgICB0aGlzLm9uKCdsb2FkJywgdGhpcy5pZnJhbWVCaW5kKTtcbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoaGFuZGxlcikge1xuICAgIC8vIHN0dWIgYSBub29wIGZvciB2LW9uIHdpdGggbm8gdmFsdWUsXG4gICAgLy8gZS5nLiBAbW91c2Vkb3duLnByZXZlbnRcbiAgICBpZiAoIXRoaXMuZGVzY3JpcHRvci5yYXcpIHtcbiAgICAgIGhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2Fybigndi1vbjonICsgdGhpcy5hcmcgKyAnPVwiJyArIHRoaXMuZXhwcmVzc2lvbiArICdcIiBleHBlY3RzIGEgZnVuY3Rpb24gdmFsdWUsICcgKyAnZ290ICcgKyBoYW5kbGVyLCB0aGlzLnZtKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBhcHBseSBtb2RpZmllcnNcbiAgICBpZiAodGhpcy5tb2RpZmllcnMuc3RvcCkge1xuICAgICAgaGFuZGxlciA9IHN0b3BGaWx0ZXIoaGFuZGxlcik7XG4gICAgfVxuICAgIGlmICh0aGlzLm1vZGlmaWVycy5wcmV2ZW50KSB7XG4gICAgICBoYW5kbGVyID0gcHJldmVudEZpbHRlcihoYW5kbGVyKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubW9kaWZpZXJzLnNlbGYpIHtcbiAgICAgIGhhbmRsZXIgPSBzZWxmRmlsdGVyKGhhbmRsZXIpO1xuICAgIH1cbiAgICAvLyBrZXkgZmlsdGVyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLm1vZGlmaWVycykuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBrZXkgIT09ICdzdG9wJyAmJiBrZXkgIT09ICdwcmV2ZW50JyAmJiBrZXkgIT09ICdzZWxmJyAmJiBrZXkgIT09ICdjYXB0dXJlJztcbiAgICB9KTtcbiAgICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICAgIGhhbmRsZXIgPSBrZXlGaWx0ZXIoaGFuZGxlciwga2V5cyk7XG4gICAgfVxuXG4gICAgdGhpcy5yZXNldCgpO1xuICAgIHRoaXMuaGFuZGxlciA9IGhhbmRsZXI7XG5cbiAgICBpZiAodGhpcy5pZnJhbWVCaW5kKSB7XG4gICAgICB0aGlzLmlmcmFtZUJpbmQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb24odGhpcy5lbCwgdGhpcy5hcmcsIHRoaXMuaGFuZGxlciwgdGhpcy5tb2RpZmllcnMuY2FwdHVyZSk7XG4gICAgfVxuICB9LFxuXG4gIHJlc2V0OiBmdW5jdGlvbiByZXNldCgpIHtcbiAgICB2YXIgZWwgPSB0aGlzLmlmcmFtZUJpbmQgPyB0aGlzLmVsLmNvbnRlbnRXaW5kb3cgOiB0aGlzLmVsO1xuICAgIGlmICh0aGlzLmhhbmRsZXIpIHtcbiAgICAgIG9mZihlbCwgdGhpcy5hcmcsIHRoaXMuaGFuZGxlcik7XG4gICAgfVxuICB9LFxuXG4gIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKCkge1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxufTtcblxudmFyIHByZWZpeGVzID0gWyctd2Via2l0LScsICctbW96LScsICctbXMtJ107XG52YXIgY2FtZWxQcmVmaXhlcyA9IFsnV2Via2l0JywgJ01veicsICdtcyddO1xudmFyIGltcG9ydGFudFJFID0gLyFpbXBvcnRhbnQ7PyQvO1xudmFyIHByb3BDYWNoZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbnZhciB0ZXN0RWwgPSBudWxsO1xuXG52YXIgc3R5bGUgPSB7XG5cbiAgZGVlcDogdHJ1ZSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmVsLnN0eWxlLmNzc1RleHQgPSB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICB0aGlzLmhhbmRsZU9iamVjdCh2YWx1ZS5yZWR1Y2UoZXh0ZW5kLCB7fSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhhbmRsZU9iamVjdCh2YWx1ZSB8fCB7fSk7XG4gICAgfVxuICB9LFxuXG4gIGhhbmRsZU9iamVjdDogZnVuY3Rpb24gaGFuZGxlT2JqZWN0KHZhbHVlKSB7XG4gICAgLy8gY2FjaGUgb2JqZWN0IHN0eWxlcyBzbyB0aGF0IG9ubHkgY2hhbmdlZCBwcm9wc1xuICAgIC8vIGFyZSBhY3R1YWxseSB1cGRhdGVkLlxuICAgIHZhciBjYWNoZSA9IHRoaXMuY2FjaGUgfHwgKHRoaXMuY2FjaGUgPSB7fSk7XG4gICAgdmFyIG5hbWUsIHZhbDtcbiAgICBmb3IgKG5hbWUgaW4gY2FjaGUpIHtcbiAgICAgIGlmICghKG5hbWUgaW4gdmFsdWUpKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlU2luZ2xlKG5hbWUsIG51bGwpO1xuICAgICAgICBkZWxldGUgY2FjaGVbbmFtZV07XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAobmFtZSBpbiB2YWx1ZSkge1xuICAgICAgdmFsID0gdmFsdWVbbmFtZV07XG4gICAgICBpZiAodmFsICE9PSBjYWNoZVtuYW1lXSkge1xuICAgICAgICBjYWNoZVtuYW1lXSA9IHZhbDtcbiAgICAgICAgdGhpcy5oYW5kbGVTaW5nbGUobmFtZSwgdmFsKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgaGFuZGxlU2luZ2xlOiBmdW5jdGlvbiBoYW5kbGVTaW5nbGUocHJvcCwgdmFsdWUpIHtcbiAgICBwcm9wID0gbm9ybWFsaXplKHByb3ApO1xuICAgIGlmICghcHJvcCkgcmV0dXJuOyAvLyB1bnN1cHBvcnRlZCBwcm9wXG4gICAgLy8gY2FzdCBwb3NzaWJsZSBudW1iZXJzL2Jvb2xlYW5zIGludG8gc3RyaW5nc1xuICAgIGlmICh2YWx1ZSAhPSBudWxsKSB2YWx1ZSArPSAnJztcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHZhciBpc0ltcG9ydGFudCA9IGltcG9ydGFudFJFLnRlc3QodmFsdWUpID8gJ2ltcG9ydGFudCcgOiAnJztcbiAgICAgIGlmIChpc0ltcG9ydGFudCkge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICB3YXJuKCdJdFxcJ3MgcHJvYmFibHkgYSBiYWQgaWRlYSB0byB1c2UgIWltcG9ydGFudCB3aXRoIGlubGluZSBydWxlcy4gJyArICdUaGlzIGZlYXR1cmUgd2lsbCBiZSBkZXByZWNhdGVkIGluIGEgZnV0dXJlIHZlcnNpb24gb2YgVnVlLicpO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZShpbXBvcnRhbnRSRSwgJycpLnRyaW0oKTtcbiAgICAgICAgdGhpcy5lbC5zdHlsZS5zZXRQcm9wZXJ0eShwcm9wLmtlYmFiLCB2YWx1ZSwgaXNJbXBvcnRhbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbC5zdHlsZVtwcm9wLmNhbWVsXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVsLnN0eWxlW3Byb3AuY2FtZWxdID0gJyc7XG4gICAgfVxuICB9XG5cbn07XG5cbi8qKlxuICogTm9ybWFsaXplIGEgQ1NTIHByb3BlcnR5IG5hbWUuXG4gKiAtIGNhY2hlIHJlc3VsdFxuICogLSBhdXRvIHByZWZpeFxuICogLSBjYW1lbENhc2UgLT4gZGFzaC1jYXNlXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBub3JtYWxpemUocHJvcCkge1xuICBpZiAocHJvcENhY2hlW3Byb3BdKSB7XG4gICAgcmV0dXJuIHByb3BDYWNoZVtwcm9wXTtcbiAgfVxuICB2YXIgcmVzID0gcHJlZml4KHByb3ApO1xuICBwcm9wQ2FjaGVbcHJvcF0gPSBwcm9wQ2FjaGVbcmVzXSA9IHJlcztcbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBBdXRvIGRldGVjdCB0aGUgYXBwcm9wcmlhdGUgcHJlZml4IGZvciBhIENTUyBwcm9wZXJ0eS5cbiAqIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3BhdWxpcmlzaC81MjM2OTJcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHByZWZpeChwcm9wKSB7XG4gIHByb3AgPSBoeXBoZW5hdGUocHJvcCk7XG4gIHZhciBjYW1lbCA9IGNhbWVsaXplKHByb3ApO1xuICB2YXIgdXBwZXIgPSBjYW1lbC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGNhbWVsLnNsaWNlKDEpO1xuICBpZiAoIXRlc3RFbCkge1xuICAgIHRlc3RFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB9XG4gIHZhciBpID0gcHJlZml4ZXMubGVuZ3RoO1xuICB2YXIgcHJlZml4ZWQ7XG4gIGlmIChjYW1lbCAhPT0gJ2ZpbHRlcicgJiYgY2FtZWwgaW4gdGVzdEVsLnN0eWxlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGtlYmFiOiBwcm9wLFxuICAgICAgY2FtZWw6IGNhbWVsXG4gICAgfTtcbiAgfVxuICB3aGlsZSAoaS0tKSB7XG4gICAgcHJlZml4ZWQgPSBjYW1lbFByZWZpeGVzW2ldICsgdXBwZXI7XG4gICAgaWYgKHByZWZpeGVkIGluIHRlc3RFbC5zdHlsZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2ViYWI6IHByZWZpeGVzW2ldICsgcHJvcCxcbiAgICAgICAgY2FtZWw6IHByZWZpeGVkXG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuXG4vLyB4bGlua1xudmFyIHhsaW5rTlMgPSAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayc7XG52YXIgeGxpbmtSRSA9IC9eeGxpbms6LztcblxuLy8gY2hlY2sgZm9yIGF0dHJpYnV0ZXMgdGhhdCBwcm9oaWJpdCBpbnRlcnBvbGF0aW9uc1xudmFyIGRpc2FsbG93ZWRJbnRlcnBBdHRyUkUgPSAvXnYtfF46fF5AfF4oPzppc3x0cmFuc2l0aW9ufHRyYW5zaXRpb24tbW9kZXxkZWJvdW5jZXx0cmFjay1ieXxzdGFnZ2VyfGVudGVyLXN0YWdnZXJ8bGVhdmUtc3RhZ2dlcikkLztcbi8vIHRoZXNlIGF0dHJpYnV0ZXMgc2hvdWxkIGFsc28gc2V0IHRoZWlyIGNvcnJlc3BvbmRpbmcgcHJvcGVydGllc1xuLy8gYmVjYXVzZSB0aGV5IG9ubHkgYWZmZWN0IHRoZSBpbml0aWFsIHN0YXRlIG9mIHRoZSBlbGVtZW50XG52YXIgYXR0cldpdGhQcm9wc1JFID0gL14oPzp2YWx1ZXxjaGVja2VkfHNlbGVjdGVkfG11dGVkKSQvO1xuLy8gdGhlc2UgYXR0cmlidXRlcyBleHBlY3QgZW51bXJhdGVkIHZhbHVlcyBvZiBcInRydWVcIiBvciBcImZhbHNlXCJcbi8vIGJ1dCBhcmUgbm90IGJvb2xlYW4gYXR0cmlidXRlc1xudmFyIGVudW1lcmF0ZWRBdHRyUkUgPSAvXig/OmRyYWdnYWJsZXxjb250ZW50ZWRpdGFibGV8c3BlbGxjaGVjaykkLztcblxuLy8gdGhlc2UgYXR0cmlidXRlcyBzaG91bGQgc2V0IGEgaGlkZGVuIHByb3BlcnR5IGZvclxuLy8gYmluZGluZyB2LW1vZGVsIHRvIG9iamVjdCB2YWx1ZXNcbnZhciBtb2RlbFByb3BzID0ge1xuICB2YWx1ZTogJ192YWx1ZScsXG4gICd0cnVlLXZhbHVlJzogJ190cnVlVmFsdWUnLFxuICAnZmFsc2UtdmFsdWUnOiAnX2ZhbHNlVmFsdWUnXG59O1xuXG52YXIgYmluZCQxID0ge1xuXG4gIHByaW9yaXR5OiBCSU5ELFxuXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgdmFyIGF0dHIgPSB0aGlzLmFyZztcbiAgICB2YXIgdGFnID0gdGhpcy5lbC50YWdOYW1lO1xuICAgIC8vIHNob3VsZCBiZSBkZWVwIHdhdGNoIG9uIG9iamVjdCBtb2RlXG4gICAgaWYgKCFhdHRyKSB7XG4gICAgICB0aGlzLmRlZXAgPSB0cnVlO1xuICAgIH1cbiAgICAvLyBoYW5kbGUgaW50ZXJwb2xhdGlvbiBiaW5kaW5nc1xuICAgIHZhciBkZXNjcmlwdG9yID0gdGhpcy5kZXNjcmlwdG9yO1xuICAgIHZhciB0b2tlbnMgPSBkZXNjcmlwdG9yLmludGVycDtcbiAgICBpZiAodG9rZW5zKSB7XG4gICAgICAvLyBoYW5kbGUgaW50ZXJwb2xhdGlvbnMgd2l0aCBvbmUtdGltZSB0b2tlbnNcbiAgICAgIGlmIChkZXNjcmlwdG9yLmhhc09uZVRpbWUpIHtcbiAgICAgICAgdGhpcy5leHByZXNzaW9uID0gdG9rZW5zVG9FeHAodG9rZW5zLCB0aGlzLl9zY29wZSB8fCB0aGlzLnZtKTtcbiAgICAgIH1cblxuICAgICAgLy8gb25seSBhbGxvdyBiaW5kaW5nIG9uIG5hdGl2ZSBhdHRyaWJ1dGVzXG4gICAgICBpZiAoZGlzYWxsb3dlZEludGVycEF0dHJSRS50ZXN0KGF0dHIpIHx8IGF0dHIgPT09ICduYW1lJyAmJiAodGFnID09PSAnUEFSVElBTCcgfHwgdGFnID09PSAnU0xPVCcpKSB7XG4gICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybihhdHRyICsgJz1cIicgKyBkZXNjcmlwdG9yLnJhdyArICdcIjogJyArICdhdHRyaWJ1dGUgaW50ZXJwb2xhdGlvbiBpcyBub3QgYWxsb3dlZCBpbiBWdWUuanMgJyArICdkaXJlY3RpdmVzIGFuZCBzcGVjaWFsIGF0dHJpYnV0ZXMuJywgdGhpcy52bSk7XG4gICAgICAgIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKGF0dHIpO1xuICAgICAgICB0aGlzLmludmFsaWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIHZhciByYXcgPSBhdHRyICsgJz1cIicgKyBkZXNjcmlwdG9yLnJhdyArICdcIjogJztcbiAgICAgICAgLy8gd2FybiBzcmNcbiAgICAgICAgaWYgKGF0dHIgPT09ICdzcmMnKSB7XG4gICAgICAgICAgd2FybihyYXcgKyAnaW50ZXJwb2xhdGlvbiBpbiBcInNyY1wiIGF0dHJpYnV0ZSB3aWxsIGNhdXNlICcgKyAnYSA0MDQgcmVxdWVzdC4gVXNlIHYtYmluZDpzcmMgaW5zdGVhZC4nLCB0aGlzLnZtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHdhcm4gc3R5bGVcbiAgICAgICAgaWYgKGF0dHIgPT09ICdzdHlsZScpIHtcbiAgICAgICAgICB3YXJuKHJhdyArICdpbnRlcnBvbGF0aW9uIGluIFwic3R5bGVcIiBhdHRyaWJ1dGUgd2lsbCBjYXVzZSAnICsgJ3RoZSBhdHRyaWJ1dGUgdG8gYmUgZGlzY2FyZGVkIGluIEludGVybmV0IEV4cGxvcmVyLiAnICsgJ1VzZSB2LWJpbmQ6c3R5bGUgaW5zdGVhZC4nLCB0aGlzLnZtKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLmludmFsaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGF0dHIgPSB0aGlzLmFyZztcbiAgICBpZiAodGhpcy5hcmcpIHtcbiAgICAgIHRoaXMuaGFuZGxlU2luZ2xlKGF0dHIsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oYW5kbGVPYmplY3QodmFsdWUgfHwge30pO1xuICAgIH1cbiAgfSxcblxuICAvLyBzaGFyZSBvYmplY3QgaGFuZGxlciB3aXRoIHYtYmluZDpjbGFzc1xuICBoYW5kbGVPYmplY3Q6IHN0eWxlLmhhbmRsZU9iamVjdCxcblxuICBoYW5kbGVTaW5nbGU6IGZ1bmN0aW9uIGhhbmRsZVNpbmdsZShhdHRyLCB2YWx1ZSkge1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgdmFyIGludGVycCA9IHRoaXMuZGVzY3JpcHRvci5pbnRlcnA7XG4gICAgaWYgKHRoaXMubW9kaWZpZXJzLmNhbWVsKSB7XG4gICAgICBhdHRyID0gY2FtZWxpemUoYXR0cik7XG4gICAgfVxuICAgIGlmICghaW50ZXJwICYmIGF0dHJXaXRoUHJvcHNSRS50ZXN0KGF0dHIpICYmIGF0dHIgaW4gZWwpIHtcbiAgICAgIHZhciBhdHRyVmFsdWUgPSBhdHRyID09PSAndmFsdWUnID8gdmFsdWUgPT0gbnVsbCAvLyBJRTkgd2lsbCBzZXQgaW5wdXQudmFsdWUgdG8gXCJudWxsXCIgZm9yIG51bGwuLi5cbiAgICAgID8gJycgOiB2YWx1ZSA6IHZhbHVlO1xuXG4gICAgICBpZiAoZWxbYXR0cl0gIT09IGF0dHJWYWx1ZSkge1xuICAgICAgICBlbFthdHRyXSA9IGF0dHJWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gc2V0IG1vZGVsIHByb3BzXG4gICAgdmFyIG1vZGVsUHJvcCA9IG1vZGVsUHJvcHNbYXR0cl07XG4gICAgaWYgKCFpbnRlcnAgJiYgbW9kZWxQcm9wKSB7XG4gICAgICBlbFttb2RlbFByb3BdID0gdmFsdWU7XG4gICAgICAvLyB1cGRhdGUgdi1tb2RlbCBpZiBwcmVzZW50XG4gICAgICB2YXIgbW9kZWwgPSBlbC5fX3ZfbW9kZWw7XG4gICAgICBpZiAobW9kZWwpIHtcbiAgICAgICAgbW9kZWwubGlzdGVuZXIoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gZG8gbm90IHNldCB2YWx1ZSBhdHRyaWJ1dGUgZm9yIHRleHRhcmVhXG4gICAgaWYgKGF0dHIgPT09ICd2YWx1ZScgJiYgZWwudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJykge1xuICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKGF0dHIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyB1cGRhdGUgYXR0cmlidXRlXG4gICAgaWYgKGVudW1lcmF0ZWRBdHRyUkUudGVzdChhdHRyKSkge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKGF0dHIsIHZhbHVlID8gJ3RydWUnIDogJ2ZhbHNlJyk7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSAhPSBudWxsICYmIHZhbHVlICE9PSBmYWxzZSkge1xuICAgICAgaWYgKGF0dHIgPT09ICdjbGFzcycpIHtcbiAgICAgICAgLy8gaGFuZGxlIGVkZ2UgY2FzZSAjMTk2MDpcbiAgICAgICAgLy8gY2xhc3MgaW50ZXJwb2xhdGlvbiBzaG91bGQgbm90IG92ZXJ3cml0ZSBWdWUgdHJhbnNpdGlvbiBjbGFzc1xuICAgICAgICBpZiAoZWwuX192X3RyYW5zKSB7XG4gICAgICAgICAgdmFsdWUgKz0gJyAnICsgZWwuX192X3RyYW5zLmlkICsgJy10cmFuc2l0aW9uJztcbiAgICAgICAgfVxuICAgICAgICBzZXRDbGFzcyhlbCwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmICh4bGlua1JFLnRlc3QoYXR0cikpIHtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlTlMoeGxpbmtOUywgYXR0ciwgdmFsdWUgPT09IHRydWUgPyAnJyA6IHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZShhdHRyLCB2YWx1ZSA9PT0gdHJ1ZSA/ICcnIDogdmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoYXR0cik7XG4gICAgfVxuICB9XG59O1xuXG52YXIgZWwgPSB7XG5cbiAgcHJpb3JpdHk6IEVMLFxuXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCF0aGlzLmFyZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaWQgPSB0aGlzLmlkID0gY2FtZWxpemUodGhpcy5hcmcpO1xuICAgIHZhciByZWZzID0gKHRoaXMuX3Njb3BlIHx8IHRoaXMudm0pLiRlbHM7XG4gICAgaWYgKGhhc093bihyZWZzLCBpZCkpIHtcbiAgICAgIHJlZnNbaWRdID0gdGhpcy5lbDtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmaW5lUmVhY3RpdmUocmVmcywgaWQsIHRoaXMuZWwpO1xuICAgIH1cbiAgfSxcblxuICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCgpIHtcbiAgICB2YXIgcmVmcyA9ICh0aGlzLl9zY29wZSB8fCB0aGlzLnZtKS4kZWxzO1xuICAgIGlmIChyZWZzW3RoaXMuaWRdID09PSB0aGlzLmVsKSB7XG4gICAgICByZWZzW3RoaXMuaWRdID0gbnVsbDtcbiAgICB9XG4gIH1cbn07XG5cbnZhciByZWYgPSB7XG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCd2LXJlZjonICsgdGhpcy5hcmcgKyAnIG11c3QgYmUgdXNlZCBvbiBhIGNoaWxkICcgKyAnY29tcG9uZW50LiBGb3VuZCBvbiA8JyArIHRoaXMuZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpICsgJz4uJywgdGhpcy52bSk7XG4gIH1cbn07XG5cbnZhciBjbG9hayA9IHtcbiAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIHRoaXMudm0uJG9uY2UoJ3ByZS1ob29rOmNvbXBpbGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKCd2LWNsb2FrJyk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vIG11c3QgZXhwb3J0IHBsYWluIG9iamVjdFxudmFyIGRpcmVjdGl2ZXMgPSB7XG4gIHRleHQ6IHRleHQkMSxcbiAgaHRtbDogaHRtbCxcbiAgJ2Zvcic6IHZGb3IsXG4gICdpZic6IHZJZixcbiAgc2hvdzogc2hvdyxcbiAgbW9kZWw6IG1vZGVsLFxuICBvbjogb24kMSxcbiAgYmluZDogYmluZCQxLFxuICBlbDogZWwsXG4gIHJlZjogcmVmLFxuICBjbG9hazogY2xvYWtcbn07XG5cbnZhciB2Q2xhc3MgPSB7XG5cbiAgZGVlcDogdHJ1ZSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2YWx1ZSkge1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHRoaXMuY2xlYW51cCgpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5zZXRDbGFzcyh2YWx1ZS50cmltKCkuc3BsaXQoL1xccysvKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0Q2xhc3Mobm9ybWFsaXplJDEodmFsdWUpKTtcbiAgICB9XG4gIH0sXG5cbiAgc2V0Q2xhc3M6IGZ1bmN0aW9uIHNldENsYXNzKHZhbHVlKSB7XG4gICAgdGhpcy5jbGVhbnVwKHZhbHVlKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIHZhbCA9IHZhbHVlW2ldO1xuICAgICAgaWYgKHZhbCkge1xuICAgICAgICBhcHBseSh0aGlzLmVsLCB2YWwsIGFkZENsYXNzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5wcmV2S2V5cyA9IHZhbHVlO1xuICB9LFxuXG4gIGNsZWFudXA6IGZ1bmN0aW9uIGNsZWFudXAodmFsdWUpIHtcbiAgICB2YXIgcHJldktleXMgPSB0aGlzLnByZXZLZXlzO1xuICAgIGlmICghcHJldktleXMpIHJldHVybjtcbiAgICB2YXIgaSA9IHByZXZLZXlzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB2YXIga2V5ID0gcHJldktleXNbaV07XG4gICAgICBpZiAoIXZhbHVlIHx8IHZhbHVlLmluZGV4T2Yoa2V5KSA8IDApIHtcbiAgICAgICAgYXBwbHkodGhpcy5lbCwga2V5LCByZW1vdmVDbGFzcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBvYmplY3RzIGFuZCBhcnJheXMgKHBvdGVudGlhbGx5IGNvbnRhaW5pbmcgb2JqZWN0cylcbiAqIGludG8gYXJyYXkgb2Ygc3RyaW5ncy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheTxTdHJpbmd8T2JqZWN0Pn0gdmFsdWVcbiAqIEByZXR1cm4ge0FycmF5PFN0cmluZz59XG4gKi9cblxuZnVuY3Rpb24gbm9ybWFsaXplJDEodmFsdWUpIHtcbiAgdmFyIHJlcyA9IFtdO1xuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIF9rZXkgPSB2YWx1ZVtpXTtcbiAgICAgIGlmIChfa2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgX2tleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICByZXMucHVzaChfa2V5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKHZhciBrIGluIF9rZXkpIHtcbiAgICAgICAgICAgIGlmIChfa2V5W2tdKSByZXMucHVzaChrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWVba2V5XSkgcmVzLnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBBZGQgb3IgcmVtb3ZlIGEgY2xhc3MvY2xhc3NlcyBvbiBhbiBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IGtleSBUaGUgY2xhc3MgbmFtZS4gVGhpcyBtYXkgb3IgbWF5IG5vdFxuICogICAgICAgICAgICAgICAgICAgICBjb250YWluIGEgc3BhY2UgY2hhcmFjdGVyLCBpbiBzdWNoIGFcbiAqICAgICAgICAgICAgICAgICAgICAgY2FzZSB3ZSdsbCBkZWFsIHdpdGggbXVsdGlwbGUgY2xhc3NcbiAqICAgICAgICAgICAgICAgICAgICAgbmFtZXMgYXQgb25jZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKi9cblxuZnVuY3Rpb24gYXBwbHkoZWwsIGtleSwgZm4pIHtcbiAga2V5ID0ga2V5LnRyaW0oKTtcbiAgaWYgKGtleS5pbmRleE9mKCcgJykgPT09IC0xKSB7XG4gICAgZm4oZWwsIGtleSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIFRoZSBrZXkgY29udGFpbnMgb25lIG9yIG1vcmUgc3BhY2UgY2hhcmFjdGVycy5cbiAgLy8gU2luY2UgYSBjbGFzcyBuYW1lIGRvZXNuJ3QgYWNjZXB0IHN1Y2ggY2hhcmFjdGVycywgd2VcbiAgLy8gdHJlYXQgaXQgYXMgbXVsdGlwbGUgY2xhc3Nlcy5cbiAgdmFyIGtleXMgPSBrZXkuc3BsaXQoL1xccysvKTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBrZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZuKGVsLCBrZXlzW2ldKTtcbiAgfVxufVxuXG52YXIgY29tcG9uZW50ID0ge1xuXG4gIHByaW9yaXR5OiBDT01QT05FTlQsXG5cbiAgcGFyYW1zOiBbJ2tlZXAtYWxpdmUnLCAndHJhbnNpdGlvbi1tb2RlJywgJ2lubGluZS10ZW1wbGF0ZSddLFxuXG4gIC8qKlxuICAgKiBTZXR1cC4gVHdvIHBvc3NpYmxlIHVzYWdlczpcbiAgICpcbiAgICogLSBzdGF0aWM6XG4gICAqICAgPGNvbXA+IG9yIDxkaXYgdi1jb21wb25lbnQ9XCJjb21wXCI+XG4gICAqXG4gICAqIC0gZHluYW1pYzpcbiAgICogICA8Y29tcG9uZW50IDppcz1cInZpZXdcIj5cbiAgICovXG5cbiAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICBpZiAoIXRoaXMuZWwuX192dWVfXykge1xuICAgICAgLy8ga2VlcC1hbGl2ZSBjYWNoZVxuICAgICAgdGhpcy5rZWVwQWxpdmUgPSB0aGlzLnBhcmFtcy5rZWVwQWxpdmU7XG4gICAgICBpZiAodGhpcy5rZWVwQWxpdmUpIHtcbiAgICAgICAgdGhpcy5jYWNoZSA9IHt9O1xuICAgICAgfVxuICAgICAgLy8gY2hlY2sgaW5saW5lLXRlbXBsYXRlXG4gICAgICBpZiAodGhpcy5wYXJhbXMuaW5saW5lVGVtcGxhdGUpIHtcbiAgICAgICAgLy8gZXh0cmFjdCBpbmxpbmUgdGVtcGxhdGUgYXMgYSBEb2N1bWVudEZyYWdtZW50XG4gICAgICAgIHRoaXMuaW5saW5lVGVtcGxhdGUgPSBleHRyYWN0Q29udGVudCh0aGlzLmVsLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIC8vIGNvbXBvbmVudCByZXNvbHV0aW9uIHJlbGF0ZWQgc3RhdGVcbiAgICAgIHRoaXMucGVuZGluZ0NvbXBvbmVudENiID0gdGhpcy5Db21wb25lbnQgPSBudWxsO1xuICAgICAgLy8gdHJhbnNpdGlvbiByZWxhdGVkIHN0YXRlXG4gICAgICB0aGlzLnBlbmRpbmdSZW1vdmFscyA9IDA7XG4gICAgICB0aGlzLnBlbmRpbmdSZW1vdmFsQ2IgPSBudWxsO1xuICAgICAgLy8gY3JlYXRlIGEgcmVmIGFuY2hvclxuICAgICAgdGhpcy5hbmNob3IgPSBjcmVhdGVBbmNob3IoJ3YtY29tcG9uZW50Jyk7XG4gICAgICByZXBsYWNlKHRoaXMuZWwsIHRoaXMuYW5jaG9yKTtcbiAgICAgIC8vIHJlbW92ZSBpcyBhdHRyaWJ1dGUuXG4gICAgICAvLyB0aGlzIGlzIHJlbW92ZWQgZHVyaW5nIGNvbXBpbGF0aW9uLCBidXQgYmVjYXVzZSBjb21waWxhdGlvbiBpc1xuICAgICAgLy8gY2FjaGVkLCB3aGVuIHRoZSBjb21wb25lbnQgaXMgdXNlZCBlbHNld2hlcmUgdGhpcyBhdHRyaWJ1dGVcbiAgICAgIC8vIHdpbGwgcmVtYWluIGF0IGxpbmsgdGltZS5cbiAgICAgIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKCdpcycpO1xuICAgICAgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoJzppcycpO1xuICAgICAgLy8gcmVtb3ZlIHJlZiwgc2FtZSBhcyBhYm92ZVxuICAgICAgaWYgKHRoaXMuZGVzY3JpcHRvci5yZWYpIHtcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoJ3YtcmVmOicgKyBoeXBoZW5hdGUodGhpcy5kZXNjcmlwdG9yLnJlZikpO1xuICAgICAgfVxuICAgICAgLy8gaWYgc3RhdGljLCBidWlsZCByaWdodCBub3cuXG4gICAgICBpZiAodGhpcy5saXRlcmFsKSB7XG4gICAgICAgIHRoaXMuc2V0Q29tcG9uZW50KHRoaXMuZXhwcmVzc2lvbik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignY2Fubm90IG1vdW50IGNvbXBvbmVudCBcIicgKyB0aGlzLmV4cHJlc3Npb24gKyAnXCIgJyArICdvbiBhbHJlYWR5IG1vdW50ZWQgZWxlbWVudDogJyArIHRoaXMuZWwpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogUHVibGljIHVwZGF0ZSwgY2FsbGVkIGJ5IHRoZSB3YXRjaGVyIGluIHRoZSBkeW5hbWljXG4gICAqIGxpdGVyYWwgc2NlbmFyaW8sIGUuZy4gPGNvbXBvbmVudCA6aXM9XCJ2aWV3XCI+XG4gICAqL1xuXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZhbHVlKSB7XG4gICAgaWYgKCF0aGlzLmxpdGVyYWwpIHtcbiAgICAgIHRoaXMuc2V0Q29tcG9uZW50KHZhbHVlKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFN3aXRjaCBkeW5hbWljIGNvbXBvbmVudHMuIE1heSByZXNvbHZlIHRoZSBjb21wb25lbnRcbiAgICogYXN5bmNocm9ub3VzbHksIGFuZCBwZXJmb3JtIHRyYW5zaXRpb24gYmFzZWQgb25cbiAgICogc3BlY2lmaWVkIHRyYW5zaXRpb24gbW9kZS4gQWNjZXB0cyBhIGZldyBhZGRpdGlvbmFsXG4gICAqIGFyZ3VtZW50cyBzcGVjaWZpY2FsbHkgZm9yIHZ1ZS1yb3V0ZXIuXG4gICAqXG4gICAqIFRoZSBjYWxsYmFjayBpcyBjYWxsZWQgd2hlbiB0aGUgZnVsbCB0cmFuc2l0aW9uIGlzXG4gICAqIGZpbmlzaGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICAgKi9cblxuICBzZXRDb21wb25lbnQ6IGZ1bmN0aW9uIHNldENvbXBvbmVudCh2YWx1ZSwgY2IpIHtcbiAgICB0aGlzLmludmFsaWRhdGVQZW5kaW5nKCk7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgLy8ganVzdCByZW1vdmUgY3VycmVudFxuICAgICAgdGhpcy51bmJ1aWxkKHRydWUpO1xuICAgICAgdGhpcy5yZW1vdmUodGhpcy5jaGlsZFZNLCBjYik7XG4gICAgICB0aGlzLmNoaWxkVk0gPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLnJlc29sdmVDb21wb25lbnQodmFsdWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5tb3VudENvbXBvbmVudChjYik7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlc29sdmUgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB0byB1c2Ugd2hlbiBjcmVhdGluZ1xuICAgKiB0aGUgY2hpbGQgdm0uXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSB2YWx1ZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYlxuICAgKi9cblxuICByZXNvbHZlQ29tcG9uZW50OiBmdW5jdGlvbiByZXNvbHZlQ29tcG9uZW50KHZhbHVlLCBjYikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLnBlbmRpbmdDb21wb25lbnRDYiA9IGNhbmNlbGxhYmxlKGZ1bmN0aW9uIChDb21wb25lbnQpIHtcbiAgICAgIHNlbGYuQ29tcG9uZW50TmFtZSA9IENvbXBvbmVudC5vcHRpb25zLm5hbWUgfHwgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZSA6IG51bGwpO1xuICAgICAgc2VsZi5Db21wb25lbnQgPSBDb21wb25lbnQ7XG4gICAgICBjYigpO1xuICAgIH0pO1xuICAgIHRoaXMudm0uX3Jlc29sdmVDb21wb25lbnQodmFsdWUsIHRoaXMucGVuZGluZ0NvbXBvbmVudENiKTtcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIHVzaW5nIHRoZSBjdXJyZW50IGNvbnN0cnVjdG9yIGFuZFxuICAgKiByZXBsYWNlIHRoZSBleGlzdGluZyBpbnN0YW5jZS4gVGhpcyBtZXRob2QgZG9lc24ndCBjYXJlXG4gICAqIHdoZXRoZXIgdGhlIG5ldyBjb21wb25lbnQgYW5kIHRoZSBvbGQgb25lIGFyZSBhY3R1YWxseVxuICAgKiB0aGUgc2FtZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICAgKi9cblxuICBtb3VudENvbXBvbmVudDogZnVuY3Rpb24gbW91bnRDb21wb25lbnQoY2IpIHtcbiAgICAvLyBhY3R1YWwgbW91bnRcbiAgICB0aGlzLnVuYnVpbGQodHJ1ZSk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBhY3RpdmF0ZUhvb2tzID0gdGhpcy5Db21wb25lbnQub3B0aW9ucy5hY3RpdmF0ZTtcbiAgICB2YXIgY2FjaGVkID0gdGhpcy5nZXRDYWNoZWQoKTtcbiAgICB2YXIgbmV3Q29tcG9uZW50ID0gdGhpcy5idWlsZCgpO1xuICAgIGlmIChhY3RpdmF0ZUhvb2tzICYmICFjYWNoZWQpIHtcbiAgICAgIHRoaXMud2FpdGluZ0ZvciA9IG5ld0NvbXBvbmVudDtcbiAgICAgIGNhbGxBY3RpdmF0ZUhvb2tzKGFjdGl2YXRlSG9va3MsIG5ld0NvbXBvbmVudCwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoc2VsZi53YWl0aW5nRm9yICE9PSBuZXdDb21wb25lbnQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi53YWl0aW5nRm9yID0gbnVsbDtcbiAgICAgICAgc2VsZi50cmFuc2l0aW9uKG5ld0NvbXBvbmVudCwgY2IpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHVwZGF0ZSByZWYgZm9yIGtlcHQtYWxpdmUgY29tcG9uZW50XG4gICAgICBpZiAoY2FjaGVkKSB7XG4gICAgICAgIG5ld0NvbXBvbmVudC5fdXBkYXRlUmVmKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnRyYW5zaXRpb24obmV3Q29tcG9uZW50LCBjYik7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSBjb21wb25lbnQgY2hhbmdlcyBvciB1bmJpbmRzIGJlZm9yZSBhbiBhc3luY1xuICAgKiBjb25zdHJ1Y3RvciBpcyByZXNvbHZlZCwgd2UgbmVlZCB0byBpbnZhbGlkYXRlIGl0c1xuICAgKiBwZW5kaW5nIGNhbGxiYWNrLlxuICAgKi9cblxuICBpbnZhbGlkYXRlUGVuZGluZzogZnVuY3Rpb24gaW52YWxpZGF0ZVBlbmRpbmcoKSB7XG4gICAgaWYgKHRoaXMucGVuZGluZ0NvbXBvbmVudENiKSB7XG4gICAgICB0aGlzLnBlbmRpbmdDb21wb25lbnRDYi5jYW5jZWwoKTtcbiAgICAgIHRoaXMucGVuZGluZ0NvbXBvbmVudENiID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlL2luc2VydCBhIG5ldyBjaGlsZCB2bS5cbiAgICogSWYga2VlcCBhbGl2ZSBhbmQgaGFzIGNhY2hlZCBpbnN0YW5jZSwgaW5zZXJ0IHRoYXRcbiAgICogaW5zdGFuY2U7IG90aGVyd2lzZSBidWlsZCBhIG5ldyBvbmUgYW5kIGNhY2hlIGl0LlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gW2V4dHJhT3B0aW9uc11cbiAgICogQHJldHVybiB7VnVlfSAtIHRoZSBjcmVhdGVkIGluc3RhbmNlXG4gICAqL1xuXG4gIGJ1aWxkOiBmdW5jdGlvbiBidWlsZChleHRyYU9wdGlvbnMpIHtcbiAgICB2YXIgY2FjaGVkID0gdGhpcy5nZXRDYWNoZWQoKTtcbiAgICBpZiAoY2FjaGVkKSB7XG4gICAgICByZXR1cm4gY2FjaGVkO1xuICAgIH1cbiAgICBpZiAodGhpcy5Db21wb25lbnQpIHtcbiAgICAgIC8vIGRlZmF1bHQgb3B0aW9uc1xuICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgIG5hbWU6IHRoaXMuQ29tcG9uZW50TmFtZSxcbiAgICAgICAgZWw6IGNsb25lTm9kZSh0aGlzLmVsKSxcbiAgICAgICAgdGVtcGxhdGU6IHRoaXMuaW5saW5lVGVtcGxhdGUsXG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0byBhZGQgdGhlIGNoaWxkIHdpdGggY29ycmVjdCBwYXJlbnRcbiAgICAgICAgLy8gaWYgdGhpcyBpcyBhIHRyYW5zY2x1ZGVkIGNvbXBvbmVudCwgaXRzIHBhcmVudFxuICAgICAgICAvLyBzaG91bGQgYmUgdGhlIHRyYW5zY2x1c2lvbiBob3N0LlxuICAgICAgICBwYXJlbnQ6IHRoaXMuX2hvc3QgfHwgdGhpcy52bSxcbiAgICAgICAgLy8gaWYgbm8gaW5saW5lLXRlbXBsYXRlLCB0aGVuIHRoZSBjb21waWxlZFxuICAgICAgICAvLyBsaW5rZXIgY2FuIGJlIGNhY2hlZCBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlLlxuICAgICAgICBfbGlua2VyQ2FjaGFibGU6ICF0aGlzLmlubGluZVRlbXBsYXRlLFxuICAgICAgICBfcmVmOiB0aGlzLmRlc2NyaXB0b3IucmVmLFxuICAgICAgICBfYXNDb21wb25lbnQ6IHRydWUsXG4gICAgICAgIF9pc1JvdXRlclZpZXc6IHRoaXMuX2lzUm91dGVyVmlldyxcbiAgICAgICAgLy8gaWYgdGhpcyBpcyBhIHRyYW5zY2x1ZGVkIGNvbXBvbmVudCwgY29udGV4dFxuICAgICAgICAvLyB3aWxsIGJlIHRoZSBjb21tb24gcGFyZW50IHZtIG9mIHRoaXMgaW5zdGFuY2VcbiAgICAgICAgLy8gYW5kIGl0cyBob3N0LlxuICAgICAgICBfY29udGV4dDogdGhpcy52bSxcbiAgICAgICAgLy8gaWYgdGhpcyBpcyBpbnNpZGUgYW4gaW5saW5lIHYtZm9yLCB0aGUgc2NvcGVcbiAgICAgICAgLy8gd2lsbCBiZSB0aGUgaW50ZXJtZWRpYXRlIHNjb3BlIGNyZWF0ZWQgZm9yIHRoaXNcbiAgICAgICAgLy8gcmVwZWF0IGZyYWdtZW50LiB0aGlzIGlzIHVzZWQgZm9yIGxpbmtpbmcgcHJvcHNcbiAgICAgICAgLy8gYW5kIGNvbnRhaW5lciBkaXJlY3RpdmVzLlxuICAgICAgICBfc2NvcGU6IHRoaXMuX3Njb3BlLFxuICAgICAgICAvLyBwYXNzIGluIHRoZSBvd25lciBmcmFnbWVudCBvZiB0aGlzIGNvbXBvbmVudC5cbiAgICAgICAgLy8gdGhpcyBpcyBuZWNlc3Nhcnkgc28gdGhhdCB0aGUgZnJhZ21lbnQgY2FuIGtlZXBcbiAgICAgICAgLy8gdHJhY2sgb2YgaXRzIGNvbnRhaW5lZCBjb21wb25lbnRzIGluIG9yZGVyIHRvXG4gICAgICAgIC8vIGNhbGwgYXR0YWNoL2RldGFjaCBob29rcyBmb3IgdGhlbS5cbiAgICAgICAgX2ZyYWc6IHRoaXMuX2ZyYWdcbiAgICAgIH07XG4gICAgICAvLyBleHRyYSBvcHRpb25zXG4gICAgICAvLyBpbiAxLjAuMCB0aGlzIGlzIHVzZWQgYnkgdnVlLXJvdXRlciBvbmx5XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmIChleHRyYU9wdGlvbnMpIHtcbiAgICAgICAgZXh0ZW5kKG9wdGlvbnMsIGV4dHJhT3B0aW9ucyk7XG4gICAgICB9XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgdGhpcy5Db21wb25lbnQob3B0aW9ucyk7XG4gICAgICBpZiAodGhpcy5rZWVwQWxpdmUpIHtcbiAgICAgICAgdGhpcy5jYWNoZVt0aGlzLkNvbXBvbmVudC5jaWRdID0gY2hpbGQ7XG4gICAgICB9XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHRoaXMuZWwuaGFzQXR0cmlidXRlKCd0cmFuc2l0aW9uJykgJiYgY2hpbGQuX2lzRnJhZ21lbnQpIHtcbiAgICAgICAgd2FybignVHJhbnNpdGlvbnMgd2lsbCBub3Qgd29yayBvbiBhIGZyYWdtZW50IGluc3RhbmNlLiAnICsgJ1RlbXBsYXRlOiAnICsgY2hpbGQuJG9wdGlvbnMudGVtcGxhdGUsIGNoaWxkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGlsZDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFRyeSB0byBnZXQgYSBjYWNoZWQgaW5zdGFuY2Ugb2YgdGhlIGN1cnJlbnQgY29tcG9uZW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtWdWV8dW5kZWZpbmVkfVxuICAgKi9cblxuICBnZXRDYWNoZWQ6IGZ1bmN0aW9uIGdldENhY2hlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5rZWVwQWxpdmUgJiYgdGhpcy5jYWNoZVt0aGlzLkNvbXBvbmVudC5jaWRdO1xuICB9LFxuXG4gIC8qKlxuICAgKiBUZWFyZG93biB0aGUgY3VycmVudCBjaGlsZCwgYnV0IGRlZmVycyBjbGVhbnVwIHNvXG4gICAqIHRoYXQgd2UgY2FuIHNlcGFyYXRlIHRoZSBkZXN0cm95IGFuZCByZW1vdmFsIHN0ZXBzLlxuICAgKlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGRlZmVyXG4gICAqL1xuXG4gIHVuYnVpbGQ6IGZ1bmN0aW9uIHVuYnVpbGQoZGVmZXIpIHtcbiAgICBpZiAodGhpcy53YWl0aW5nRm9yKSB7XG4gICAgICBpZiAoIXRoaXMua2VlcEFsaXZlKSB7XG4gICAgICAgIHRoaXMud2FpdGluZ0Zvci4kZGVzdHJveSgpO1xuICAgICAgfVxuICAgICAgdGhpcy53YWl0aW5nRm9yID0gbnVsbDtcbiAgICB9XG4gICAgdmFyIGNoaWxkID0gdGhpcy5jaGlsZFZNO1xuICAgIGlmICghY2hpbGQgfHwgdGhpcy5rZWVwQWxpdmUpIHtcbiAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICAvLyByZW1vdmUgcmVmXG4gICAgICAgIGNoaWxkLl9pbmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIGNoaWxkLl91cGRhdGVSZWYodHJ1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIHRoZSBzb2xlIHB1cnBvc2Ugb2YgYGRlZmVyQ2xlYW51cGAgaXMgc28gdGhhdCB3ZSBjYW5cbiAgICAvLyBcImRlYWN0aXZhdGVcIiB0aGUgdm0gcmlnaHQgbm93IGFuZCBwZXJmb3JtIERPTSByZW1vdmFsXG4gICAgLy8gbGF0ZXIuXG4gICAgY2hpbGQuJGRlc3Ryb3koZmFsc2UsIGRlZmVyKTtcbiAgfSxcblxuICAvKipcbiAgICogUmVtb3ZlIGN1cnJlbnQgZGVzdHJveWVkIGNoaWxkIGFuZCBtYW51YWxseSBkb1xuICAgKiB0aGUgY2xlYW51cCBhZnRlciByZW1vdmFsLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYlxuICAgKi9cblxuICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShjaGlsZCwgY2IpIHtcbiAgICB2YXIga2VlcEFsaXZlID0gdGhpcy5rZWVwQWxpdmU7XG4gICAgaWYgKGNoaWxkKSB7XG4gICAgICAvLyB3ZSBtYXkgaGF2ZSBhIGNvbXBvbmVudCBzd2l0Y2ggd2hlbiBhIHByZXZpb3VzXG4gICAgICAvLyBjb21wb25lbnQgaXMgc3RpbGwgYmVpbmcgdHJhbnNpdGlvbmVkIG91dC5cbiAgICAgIC8vIHdlIHdhbnQgdG8gdHJpZ2dlciBvbmx5IG9uZSBsYXN0ZXN0IGluc2VydGlvbiBjYlxuICAgICAgLy8gd2hlbiB0aGUgZXhpc3RpbmcgdHJhbnNpdGlvbiBmaW5pc2hlcy4gKCMxMTE5KVxuICAgICAgdGhpcy5wZW5kaW5nUmVtb3ZhbHMrKztcbiAgICAgIHRoaXMucGVuZGluZ1JlbW92YWxDYiA9IGNiO1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgY2hpbGQuJHJlbW92ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYucGVuZGluZ1JlbW92YWxzLS07XG4gICAgICAgIGlmICgha2VlcEFsaXZlKSBjaGlsZC5fY2xlYW51cCgpO1xuICAgICAgICBpZiAoIXNlbGYucGVuZGluZ1JlbW92YWxzICYmIHNlbGYucGVuZGluZ1JlbW92YWxDYikge1xuICAgICAgICAgIHNlbGYucGVuZGluZ1JlbW92YWxDYigpO1xuICAgICAgICAgIHNlbGYucGVuZGluZ1JlbW92YWxDYiA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoY2IpIHtcbiAgICAgIGNiKCk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBY3R1YWxseSBzd2FwIHRoZSBjb21wb25lbnRzLCBkZXBlbmRpbmcgb24gdGhlXG4gICAqIHRyYW5zaXRpb24gbW9kZS4gRGVmYXVsdHMgdG8gc2ltdWx0YW5lb3VzLlxuICAgKlxuICAgKiBAcGFyYW0ge1Z1ZX0gdGFyZ2V0XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cbiAgICovXG5cbiAgdHJhbnNpdGlvbjogZnVuY3Rpb24gdHJhbnNpdGlvbih0YXJnZXQsIGNiKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBjdXJyZW50ID0gdGhpcy5jaGlsZFZNO1xuICAgIC8vIGZvciBkZXZ0b29sIGluc3BlY3Rpb25cbiAgICBpZiAoY3VycmVudCkgY3VycmVudC5faW5hY3RpdmUgPSB0cnVlO1xuICAgIHRhcmdldC5faW5hY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLmNoaWxkVk0gPSB0YXJnZXQ7XG4gICAgc3dpdGNoIChzZWxmLnBhcmFtcy50cmFuc2l0aW9uTW9kZSkge1xuICAgICAgY2FzZSAnaW4tb3V0JzpcbiAgICAgICAgdGFyZ2V0LiRiZWZvcmUoc2VsZi5hbmNob3IsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzZWxmLnJlbW92ZShjdXJyZW50LCBjYik7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ291dC1pbic6XG4gICAgICAgIHNlbGYucmVtb3ZlKGN1cnJlbnQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0YXJnZXQuJGJlZm9yZShzZWxmLmFuY2hvciwgY2IpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzZWxmLnJlbW92ZShjdXJyZW50KTtcbiAgICAgICAgdGFyZ2V0LiRiZWZvcmUoc2VsZi5hbmNob3IsIGNiKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVuYmluZC5cbiAgICovXG5cbiAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgdGhpcy5pbnZhbGlkYXRlUGVuZGluZygpO1xuICAgIC8vIERvIG5vdCBkZWZlciBjbGVhbnVwIHdoZW4gdW5iaW5kaW5nXG4gICAgdGhpcy51bmJ1aWxkKCk7XG4gICAgLy8gZGVzdHJveSBhbGwga2VlcC1hbGl2ZSBjYWNoZWQgaW5zdGFuY2VzXG4gICAgaWYgKHRoaXMuY2FjaGUpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmNhY2hlKSB7XG4gICAgICAgIHRoaXMuY2FjaGVba2V5XS4kZGVzdHJveSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5jYWNoZSA9IG51bGw7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIENhbGwgYWN0aXZhdGUgaG9va3MgaW4gb3JkZXIgKGFzeW5jaHJvbm91cylcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBob29rc1xuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYlxuICovXG5cbmZ1bmN0aW9uIGNhbGxBY3RpdmF0ZUhvb2tzKGhvb2tzLCB2bSwgY2IpIHtcbiAgdmFyIHRvdGFsID0gaG9va3MubGVuZ3RoO1xuICB2YXIgY2FsbGVkID0gMDtcbiAgaG9va3NbMF0uY2FsbCh2bSwgbmV4dCk7XG4gIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgaWYgKCsrY2FsbGVkID49IHRvdGFsKSB7XG4gICAgICBjYigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBob29rc1tjYWxsZWRdLmNhbGwodm0sIG5leHQpO1xuICAgIH1cbiAgfVxufVxuXG52YXIgcHJvcEJpbmRpbmdNb2RlcyA9IGNvbmZpZy5fcHJvcEJpbmRpbmdNb2RlcztcbnZhciBlbXB0eSA9IHt9O1xuXG4vLyByZWdleGVzXG52YXIgaWRlbnRSRSQxID0gL15bJF9hLXpBLVpdK1tcXHckXSokLztcbnZhciBzZXR0YWJsZVBhdGhSRSA9IC9eW0EtWmEtel8kXVtcXHckXSooXFwuW0EtWmEtel8kXVtcXHckXSp8XFxbW15cXFtcXF1dK1xcXSkqJC87XG5cbi8qKlxuICogQ29tcGlsZSBwcm9wcyBvbiBhIHJvb3QgZWxlbWVudCBhbmQgcmV0dXJuXG4gKiBhIHByb3BzIGxpbmsgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fERvY3VtZW50RnJhZ21lbnR9IGVsXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wT3B0aW9uc1xuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gcHJvcHNMaW5rRm5cbiAqL1xuXG5mdW5jdGlvbiBjb21waWxlUHJvcHMoZWwsIHByb3BPcHRpb25zLCB2bSkge1xuICB2YXIgcHJvcHMgPSBbXTtcbiAgdmFyIG5hbWVzID0gT2JqZWN0LmtleXMocHJvcE9wdGlvbnMpO1xuICB2YXIgaSA9IG5hbWVzLmxlbmd0aDtcbiAgdmFyIG9wdGlvbnMsIG5hbWUsIGF0dHIsIHZhbHVlLCBwYXRoLCBwYXJzZWQsIHByb3A7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBuYW1lID0gbmFtZXNbaV07XG4gICAgb3B0aW9ucyA9IHByb3BPcHRpb25zW25hbWVdIHx8IGVtcHR5O1xuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgbmFtZSA9PT0gJyRkYXRhJykge1xuICAgICAgd2FybignRG8gbm90IHVzZSAkZGF0YSBhcyBwcm9wLicsIHZtKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHByb3BzIGNvdWxkIGNvbnRhaW4gZGFzaGVzLCB3aGljaCB3aWxsIGJlXG4gICAgLy8gaW50ZXJwcmV0ZWQgYXMgbWludXMgY2FsY3VsYXRpb25zIGJ5IHRoZSBwYXJzZXJcbiAgICAvLyBzbyB3ZSBuZWVkIHRvIGNhbWVsaXplIHRoZSBwYXRoIGhlcmVcbiAgICBwYXRoID0gY2FtZWxpemUobmFtZSk7XG4gICAgaWYgKCFpZGVudFJFJDEudGVzdChwYXRoKSkge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdJbnZhbGlkIHByb3Aga2V5OiBcIicgKyBuYW1lICsgJ1wiLiBQcm9wIGtleXMgJyArICdtdXN0IGJlIHZhbGlkIGlkZW50aWZpZXJzLicsIHZtKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHByb3AgPSB7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgcGF0aDogcGF0aCxcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICBtb2RlOiBwcm9wQmluZGluZ01vZGVzLk9ORV9XQVksXG4gICAgICByYXc6IG51bGxcbiAgICB9O1xuXG4gICAgYXR0ciA9IGh5cGhlbmF0ZShuYW1lKTtcbiAgICAvLyBmaXJzdCBjaGVjayBkeW5hbWljIHZlcnNpb25cbiAgICBpZiAoKHZhbHVlID0gZ2V0QmluZEF0dHIoZWwsIGF0dHIpKSA9PT0gbnVsbCkge1xuICAgICAgaWYgKCh2YWx1ZSA9IGdldEJpbmRBdHRyKGVsLCBhdHRyICsgJy5zeW5jJykpICE9PSBudWxsKSB7XG4gICAgICAgIHByb3AubW9kZSA9IHByb3BCaW5kaW5nTW9kZXMuVFdPX1dBWTtcbiAgICAgIH0gZWxzZSBpZiAoKHZhbHVlID0gZ2V0QmluZEF0dHIoZWwsIGF0dHIgKyAnLm9uY2UnKSkgIT09IG51bGwpIHtcbiAgICAgICAgcHJvcC5tb2RlID0gcHJvcEJpbmRpbmdNb2Rlcy5PTkVfVElNRTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAvLyBoYXMgZHluYW1pYyBiaW5kaW5nIVxuICAgICAgcHJvcC5yYXcgPSB2YWx1ZTtcbiAgICAgIHBhcnNlZCA9IHBhcnNlRGlyZWN0aXZlKHZhbHVlKTtcbiAgICAgIHZhbHVlID0gcGFyc2VkLmV4cHJlc3Npb247XG4gICAgICBwcm9wLmZpbHRlcnMgPSBwYXJzZWQuZmlsdGVycztcbiAgICAgIC8vIGNoZWNrIGJpbmRpbmcgdHlwZVxuICAgICAgaWYgKGlzTGl0ZXJhbCh2YWx1ZSkgJiYgIXBhcnNlZC5maWx0ZXJzKSB7XG4gICAgICAgIC8vIGZvciBleHByZXNzaW9ucyBjb250YWluaW5nIGxpdGVyYWwgbnVtYmVycyBhbmRcbiAgICAgICAgLy8gYm9vbGVhbnMsIHRoZXJlJ3Mgbm8gbmVlZCB0byBzZXR1cCBhIHByb3AgYmluZGluZyxcbiAgICAgICAgLy8gc28gd2UgY2FuIG9wdGltaXplIHRoZW0gYXMgYSBvbmUtdGltZSBzZXQuXG4gICAgICAgIHByb3Aub3B0aW1pemVkTGl0ZXJhbCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9wLmR5bmFtaWMgPSB0cnVlO1xuICAgICAgICAvLyBjaGVjayBub24tc2V0dGFibGUgcGF0aCBmb3IgdHdvLXdheSBiaW5kaW5nc1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBwcm9wLm1vZGUgPT09IHByb3BCaW5kaW5nTW9kZXMuVFdPX1dBWSAmJiAhc2V0dGFibGVQYXRoUkUudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICBwcm9wLm1vZGUgPSBwcm9wQmluZGluZ01vZGVzLk9ORV9XQVk7XG4gICAgICAgICAgd2FybignQ2Fubm90IGJpbmQgdHdvLXdheSBwcm9wIHdpdGggbm9uLXNldHRhYmxlICcgKyAncGFyZW50IHBhdGg6ICcgKyB2YWx1ZSwgdm0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwcm9wLnBhcmVudFBhdGggPSB2YWx1ZTtcblxuICAgICAgLy8gd2FybiByZXF1aXJlZCB0d28td2F5XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBvcHRpb25zLnR3b1dheSAmJiBwcm9wLm1vZGUgIT09IHByb3BCaW5kaW5nTW9kZXMuVFdPX1dBWSkge1xuICAgICAgICB3YXJuKCdQcm9wIFwiJyArIG5hbWUgKyAnXCIgZXhwZWN0cyBhIHR3by13YXkgYmluZGluZyB0eXBlLicsIHZtKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCh2YWx1ZSA9IGdldEF0dHIoZWwsIGF0dHIpKSAhPT0gbnVsbCkge1xuICAgICAgLy8gaGFzIGxpdGVyYWwgYmluZGluZyFcbiAgICAgIHByb3AucmF3ID0gdmFsdWU7XG4gICAgfSBlbHNlIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAvLyBjaGVjayBwb3NzaWJsZSBjYW1lbENhc2UgcHJvcCB1c2FnZVxuICAgICAgdmFyIGxvd2VyQ2FzZU5hbWUgPSBwYXRoLnRvTG93ZXJDYXNlKCk7XG4gICAgICB2YWx1ZSA9IC9bQS1aXFwtXS8udGVzdChuYW1lKSAmJiAoZWwuZ2V0QXR0cmlidXRlKGxvd2VyQ2FzZU5hbWUpIHx8IGVsLmdldEF0dHJpYnV0ZSgnOicgKyBsb3dlckNhc2VOYW1lKSB8fCBlbC5nZXRBdHRyaWJ1dGUoJ3YtYmluZDonICsgbG93ZXJDYXNlTmFtZSkgfHwgZWwuZ2V0QXR0cmlidXRlKCc6JyArIGxvd2VyQ2FzZU5hbWUgKyAnLm9uY2UnKSB8fCBlbC5nZXRBdHRyaWJ1dGUoJ3YtYmluZDonICsgbG93ZXJDYXNlTmFtZSArICcub25jZScpIHx8IGVsLmdldEF0dHJpYnV0ZSgnOicgKyBsb3dlckNhc2VOYW1lICsgJy5zeW5jJykgfHwgZWwuZ2V0QXR0cmlidXRlKCd2LWJpbmQ6JyArIGxvd2VyQ2FzZU5hbWUgKyAnLnN5bmMnKSk7XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgd2FybignUG9zc2libGUgdXNhZ2UgZXJyb3IgZm9yIHByb3AgYCcgKyBsb3dlckNhc2VOYW1lICsgJ2AgLSAnICsgJ2RpZCB5b3UgbWVhbiBgJyArIGF0dHIgKyAnYD8gSFRNTCBpcyBjYXNlLWluc2Vuc2l0aXZlLCByZW1lbWJlciB0byB1c2UgJyArICdrZWJhYi1jYXNlIGZvciBwcm9wcyBpbiB0ZW1wbGF0ZXMuJywgdm0pO1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnJlcXVpcmVkKSB7XG4gICAgICAgIC8vIHdhcm4gbWlzc2luZyByZXF1aXJlZFxuICAgICAgICB3YXJuKCdNaXNzaW5nIHJlcXVpcmVkIHByb3A6ICcgKyBuYW1lLCB2bSk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIHB1c2ggcHJvcFxuICAgIHByb3BzLnB1c2gocHJvcCk7XG4gIH1cbiAgcmV0dXJuIG1ha2VQcm9wc0xpbmtGbihwcm9wcyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBmdW5jdGlvbiB0aGF0IGFwcGxpZXMgcHJvcHMgdG8gYSB2bS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wc1xuICogQHJldHVybiB7RnVuY3Rpb259IHByb3BzTGlua0ZuXG4gKi9cblxuZnVuY3Rpb24gbWFrZVByb3BzTGlua0ZuKHByb3BzKSB7XG4gIHJldHVybiBmdW5jdGlvbiBwcm9wc0xpbmtGbih2bSwgc2NvcGUpIHtcbiAgICAvLyBzdG9yZSByZXNvbHZlZCBwcm9wcyBpbmZvXG4gICAgdm0uX3Byb3BzID0ge307XG4gICAgdmFyIGlubGluZVByb3BzID0gdm0uJG9wdGlvbnMucHJvcHNEYXRhO1xuICAgIHZhciBpID0gcHJvcHMubGVuZ3RoO1xuICAgIHZhciBwcm9wLCBwYXRoLCBvcHRpb25zLCB2YWx1ZSwgcmF3O1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHByb3AgPSBwcm9wc1tpXTtcbiAgICAgIHJhdyA9IHByb3AucmF3O1xuICAgICAgcGF0aCA9IHByb3AucGF0aDtcbiAgICAgIG9wdGlvbnMgPSBwcm9wLm9wdGlvbnM7XG4gICAgICB2bS5fcHJvcHNbcGF0aF0gPSBwcm9wO1xuICAgICAgaWYgKGlubGluZVByb3BzICYmIGhhc093bihpbmxpbmVQcm9wcywgcGF0aCkpIHtcbiAgICAgICAgaW5pdFByb3Aodm0sIHByb3AsIGlubGluZVByb3BzW3BhdGhdKTtcbiAgICAgIH1pZiAocmF3ID09PSBudWxsKSB7XG4gICAgICAgIC8vIGluaXRpYWxpemUgYWJzZW50IHByb3BcbiAgICAgICAgaW5pdFByb3Aodm0sIHByb3AsIHVuZGVmaW5lZCk7XG4gICAgICB9IGVsc2UgaWYgKHByb3AuZHluYW1pYykge1xuICAgICAgICAvLyBkeW5hbWljIHByb3BcbiAgICAgICAgaWYgKHByb3AubW9kZSA9PT0gcHJvcEJpbmRpbmdNb2Rlcy5PTkVfVElNRSkge1xuICAgICAgICAgIC8vIG9uZSB0aW1lIGJpbmRpbmdcbiAgICAgICAgICB2YWx1ZSA9IChzY29wZSB8fCB2bS5fY29udGV4dCB8fCB2bSkuJGdldChwcm9wLnBhcmVudFBhdGgpO1xuICAgICAgICAgIGluaXRQcm9wKHZtLCBwcm9wLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHZtLl9jb250ZXh0KSB7XG4gICAgICAgICAgICAvLyBkeW5hbWljIGJpbmRpbmdcbiAgICAgICAgICAgIHZtLl9iaW5kRGlyKHtcbiAgICAgICAgICAgICAgbmFtZTogJ3Byb3AnLFxuICAgICAgICAgICAgICBkZWY6IHByb3BEZWYsXG4gICAgICAgICAgICAgIHByb3A6IHByb3BcbiAgICAgICAgICAgIH0sIG51bGwsIG51bGwsIHNjb3BlKTsgLy8gZWwsIGhvc3QsIHNjb3BlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gcm9vdCBpbnN0YW5jZVxuICAgICAgICAgICAgICBpbml0UHJvcCh2bSwgcHJvcCwgdm0uJGdldChwcm9wLnBhcmVudFBhdGgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwcm9wLm9wdGltaXplZExpdGVyYWwpIHtcbiAgICAgICAgLy8gb3B0aW1pemVkIGxpdGVyYWwsIGNhc3QgaXQgYW5kIGp1c3Qgc2V0IG9uY2VcbiAgICAgICAgdmFyIHN0cmlwcGVkID0gc3RyaXBRdW90ZXMocmF3KTtcbiAgICAgICAgdmFsdWUgPSBzdHJpcHBlZCA9PT0gcmF3ID8gdG9Cb29sZWFuKHRvTnVtYmVyKHJhdykpIDogc3RyaXBwZWQ7XG4gICAgICAgIGluaXRQcm9wKHZtLCBwcm9wLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBzdHJpbmcgbGl0ZXJhbCwgYnV0IHdlIG5lZWQgdG8gY2F0ZXIgZm9yXG4gICAgICAgIC8vIEJvb2xlYW4gcHJvcHMgd2l0aCBubyB2YWx1ZSwgb3Igd2l0aCBzYW1lXG4gICAgICAgIC8vIGxpdGVyYWwgdmFsdWUgKGUuZy4gZGlzYWJsZWQ9XCJkaXNhYmxlZFwiKVxuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS1sb2FkZXIvaXNzdWVzLzE4MlxuICAgICAgICB2YWx1ZSA9IG9wdGlvbnMudHlwZSA9PT0gQm9vbGVhbiAmJiAocmF3ID09PSAnJyB8fCByYXcgPT09IGh5cGhlbmF0ZShwcm9wLm5hbWUpKSA/IHRydWUgOiByYXc7XG4gICAgICAgIGluaXRQcm9wKHZtLCBwcm9wLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFByb2Nlc3MgYSBwcm9wIHdpdGggYSByYXdWYWx1ZSwgYXBwbHlpbmcgbmVjZXNzYXJ5IGNvZXJzaW9ucyxcbiAqIGRlZmF1bHQgdmFsdWVzICYgYXNzZXJ0aW9ucyBhbmQgY2FsbCB0aGUgZ2l2ZW4gY2FsbGJhY2sgd2l0aFxuICogcHJvY2Vzc2VkIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICogQHBhcmFtIHtPYmplY3R9IHByb3BcbiAqIEBwYXJhbSB7Kn0gcmF3VmFsdWVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKi9cblxuZnVuY3Rpb24gcHJvY2Vzc1Byb3BWYWx1ZSh2bSwgcHJvcCwgcmF3VmFsdWUsIGZuKSB7XG4gIHZhciBpc1NpbXBsZSA9IHByb3AuZHluYW1pYyAmJiBpc1NpbXBsZVBhdGgocHJvcC5wYXJlbnRQYXRoKTtcbiAgdmFyIHZhbHVlID0gcmF3VmFsdWU7XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFsdWUgPSBnZXRQcm9wRGVmYXVsdFZhbHVlKHZtLCBwcm9wKTtcbiAgfVxuICB2YWx1ZSA9IGNvZXJjZVByb3AocHJvcCwgdmFsdWUpO1xuICB2YXIgY29lcmNlZCA9IHZhbHVlICE9PSByYXdWYWx1ZTtcbiAgaWYgKCFhc3NlcnRQcm9wKHByb3AsIHZhbHVlLCB2bSkpIHtcbiAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgfVxuICBpZiAoaXNTaW1wbGUgJiYgIWNvZXJjZWQpIHtcbiAgICB3aXRob3V0Q29udmVyc2lvbihmdW5jdGlvbiAoKSB7XG4gICAgICBmbih2YWx1ZSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgZm4odmFsdWUpO1xuICB9XG59XG5cbi8qKlxuICogU2V0IGEgcHJvcCdzIGluaXRpYWwgdmFsdWUgb24gYSB2bSBhbmQgaXRzIGRhdGEgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICogQHBhcmFtIHtPYmplY3R9IHByb3BcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqL1xuXG5mdW5jdGlvbiBpbml0UHJvcCh2bSwgcHJvcCwgdmFsdWUpIHtcbiAgcHJvY2Vzc1Byb3BWYWx1ZSh2bSwgcHJvcCwgdmFsdWUsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGRlZmluZVJlYWN0aXZlKHZtLCBwcm9wLnBhdGgsIHZhbHVlKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVXBkYXRlIGEgcHJvcCdzIHZhbHVlIG9uIGEgdm0uXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcFxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICovXG5cbmZ1bmN0aW9uIHVwZGF0ZVByb3Aodm0sIHByb3AsIHZhbHVlKSB7XG4gIHByb2Nlc3NQcm9wVmFsdWUodm0sIHByb3AsIHZhbHVlLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2bVtwcm9wLnBhdGhdID0gdmFsdWU7XG4gIH0pO1xufVxuXG4vKipcbiAqIEdldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBhIHByb3AuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcFxuICogQHJldHVybiB7Kn1cbiAqL1xuXG5mdW5jdGlvbiBnZXRQcm9wRGVmYXVsdFZhbHVlKHZtLCBwcm9wKSB7XG4gIC8vIG5vIGRlZmF1bHQsIHJldHVybiB1bmRlZmluZWRcbiAgdmFyIG9wdGlvbnMgPSBwcm9wLm9wdGlvbnM7XG4gIGlmICghaGFzT3duKG9wdGlvbnMsICdkZWZhdWx0JykpIHtcbiAgICAvLyBhYnNlbnQgYm9vbGVhbiB2YWx1ZSBkZWZhdWx0cyB0byBmYWxzZVxuICAgIHJldHVybiBvcHRpb25zLnR5cGUgPT09IEJvb2xlYW4gPyBmYWxzZSA6IHVuZGVmaW5lZDtcbiAgfVxuICB2YXIgZGVmID0gb3B0aW9uc1snZGVmYXVsdCddO1xuICAvLyB3YXJuIGFnYWluc3Qgbm9uLWZhY3RvcnkgZGVmYXVsdHMgZm9yIE9iamVjdCAmIEFycmF5XG4gIGlmIChpc09iamVjdChkZWYpKSB7XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdJbnZhbGlkIGRlZmF1bHQgdmFsdWUgZm9yIHByb3AgXCInICsgcHJvcC5uYW1lICsgJ1wiOiAnICsgJ1Byb3BzIHdpdGggdHlwZSBPYmplY3QvQXJyYXkgbXVzdCB1c2UgYSBmYWN0b3J5IGZ1bmN0aW9uICcgKyAndG8gcmV0dXJuIHRoZSBkZWZhdWx0IHZhbHVlLicsIHZtKTtcbiAgfVxuICAvLyBjYWxsIGZhY3RvcnkgZnVuY3Rpb24gZm9yIG5vbi1GdW5jdGlvbiB0eXBlc1xuICByZXR1cm4gdHlwZW9mIGRlZiA9PT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zLnR5cGUgIT09IEZ1bmN0aW9uID8gZGVmLmNhbGwodm0pIDogZGVmO1xufVxuXG4vKipcbiAqIEFzc2VydCB3aGV0aGVyIGEgcHJvcCBpcyB2YWxpZC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcFxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHBhcmFtIHtWdWV9IHZtXG4gKi9cblxuZnVuY3Rpb24gYXNzZXJ0UHJvcChwcm9wLCB2YWx1ZSwgdm0pIHtcbiAgaWYgKCFwcm9wLm9wdGlvbnMucmVxdWlyZWQgJiYgKCAvLyBub24tcmVxdWlyZWRcbiAgcHJvcC5yYXcgPT09IG51bGwgfHwgLy8gYWJzY2VudFxuICB2YWx1ZSA9PSBudWxsKSAvLyBudWxsIG9yIHVuZGVmaW5lZFxuICApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgdmFyIG9wdGlvbnMgPSBwcm9wLm9wdGlvbnM7XG4gIHZhciB0eXBlID0gb3B0aW9ucy50eXBlO1xuICB2YXIgdmFsaWQgPSAhdHlwZTtcbiAgdmFyIGV4cGVjdGVkVHlwZXMgPSBbXTtcbiAgaWYgKHR5cGUpIHtcbiAgICBpZiAoIWlzQXJyYXkodHlwZSkpIHtcbiAgICAgIHR5cGUgPSBbdHlwZV07XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGggJiYgIXZhbGlkOyBpKyspIHtcbiAgICAgIHZhciBhc3NlcnRlZFR5cGUgPSBhc3NlcnRUeXBlKHZhbHVlLCB0eXBlW2ldKTtcbiAgICAgIGV4cGVjdGVkVHlwZXMucHVzaChhc3NlcnRlZFR5cGUuZXhwZWN0ZWRUeXBlKTtcbiAgICAgIHZhbGlkID0gYXNzZXJ0ZWRUeXBlLnZhbGlkO1xuICAgIH1cbiAgfVxuICBpZiAoIXZhbGlkKSB7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIHdhcm4oJ0ludmFsaWQgcHJvcDogdHlwZSBjaGVjayBmYWlsZWQgZm9yIHByb3AgXCInICsgcHJvcC5uYW1lICsgJ1wiLicgKyAnIEV4cGVjdGVkICcgKyBleHBlY3RlZFR5cGVzLm1hcChmb3JtYXRUeXBlKS5qb2luKCcsICcpICsgJywgZ290ICcgKyBmb3JtYXRWYWx1ZSh2YWx1ZSkgKyAnLicsIHZtKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB2YWxpZGF0b3IgPSBvcHRpb25zLnZhbGlkYXRvcjtcbiAgaWYgKHZhbGlkYXRvcikge1xuICAgIGlmICghdmFsaWRhdG9yKHZhbHVlKSkge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdJbnZhbGlkIHByb3A6IGN1c3RvbSB2YWxpZGF0b3IgY2hlY2sgZmFpbGVkIGZvciBwcm9wIFwiJyArIHByb3AubmFtZSArICdcIi4nLCB2bSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEZvcmNlIHBhcnNpbmcgdmFsdWUgd2l0aCBjb2VyY2Ugb3B0aW9uLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHsqfVxuICovXG5cbmZ1bmN0aW9uIGNvZXJjZVByb3AocHJvcCwgdmFsdWUpIHtcbiAgdmFyIGNvZXJjZSA9IHByb3Aub3B0aW9ucy5jb2VyY2U7XG4gIGlmICghY29lcmNlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIC8vIGNvZXJjZSBpcyBhIGZ1bmN0aW9uXG4gIHJldHVybiBjb2VyY2UodmFsdWUpO1xufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgdHlwZSBvZiBhIHZhbHVlXG4gKlxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHlwZVxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIGFzc2VydFR5cGUodmFsdWUsIHR5cGUpIHtcbiAgdmFyIHZhbGlkO1xuICB2YXIgZXhwZWN0ZWRUeXBlO1xuICBpZiAodHlwZSA9PT0gU3RyaW5nKSB7XG4gICAgZXhwZWN0ZWRUeXBlID0gJ3N0cmluZyc7XG4gICAgdmFsaWQgPSB0eXBlb2YgdmFsdWUgPT09IGV4cGVjdGVkVHlwZTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSBOdW1iZXIpIHtcbiAgICBleHBlY3RlZFR5cGUgPSAnbnVtYmVyJztcbiAgICB2YWxpZCA9IHR5cGVvZiB2YWx1ZSA9PT0gZXhwZWN0ZWRUeXBlO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09IEJvb2xlYW4pIHtcbiAgICBleHBlY3RlZFR5cGUgPSAnYm9vbGVhbic7XG4gICAgdmFsaWQgPSB0eXBlb2YgdmFsdWUgPT09IGV4cGVjdGVkVHlwZTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSBGdW5jdGlvbikge1xuICAgIGV4cGVjdGVkVHlwZSA9ICdmdW5jdGlvbic7XG4gICAgdmFsaWQgPSB0eXBlb2YgdmFsdWUgPT09IGV4cGVjdGVkVHlwZTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSBPYmplY3QpIHtcbiAgICBleHBlY3RlZFR5cGUgPSAnb2JqZWN0JztcbiAgICB2YWxpZCA9IGlzUGxhaW5PYmplY3QodmFsdWUpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09IEFycmF5KSB7XG4gICAgZXhwZWN0ZWRUeXBlID0gJ2FycmF5JztcbiAgICB2YWxpZCA9IGlzQXJyYXkodmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIHZhbGlkID0gdmFsdWUgaW5zdGFuY2VvZiB0eXBlO1xuICB9XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6IHZhbGlkLFxuICAgIGV4cGVjdGVkVHlwZTogZXhwZWN0ZWRUeXBlXG4gIH07XG59XG5cbi8qKlxuICogRm9ybWF0IHR5cGUgZm9yIG91dHB1dFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gZm9ybWF0VHlwZSh0eXBlKSB7XG4gIHJldHVybiB0eXBlID8gdHlwZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR5cGUuc2xpY2UoMSkgOiAnY3VzdG9tIHR5cGUnO1xufVxuXG4vKipcbiAqIEZvcm1hdCB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZSh2YWwpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpLnNsaWNlKDgsIC0xKTtcbn1cblxudmFyIGJpbmRpbmdNb2RlcyA9IGNvbmZpZy5fcHJvcEJpbmRpbmdNb2RlcztcblxudmFyIHByb3BEZWYgPSB7XG5cbiAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICB2YXIgY2hpbGQgPSB0aGlzLnZtO1xuICAgIHZhciBwYXJlbnQgPSBjaGlsZC5fY29udGV4dDtcbiAgICAvLyBwYXNzZWQgaW4gZnJvbSBjb21waWxlciBkaXJlY3RseVxuICAgIHZhciBwcm9wID0gdGhpcy5kZXNjcmlwdG9yLnByb3A7XG4gICAgdmFyIGNoaWxkS2V5ID0gcHJvcC5wYXRoO1xuICAgIHZhciBwYXJlbnRLZXkgPSBwcm9wLnBhcmVudFBhdGg7XG4gICAgdmFyIHR3b1dheSA9IHByb3AubW9kZSA9PT0gYmluZGluZ01vZGVzLlRXT19XQVk7XG5cbiAgICB2YXIgcGFyZW50V2F0Y2hlciA9IHRoaXMucGFyZW50V2F0Y2hlciA9IG5ldyBXYXRjaGVyKHBhcmVudCwgcGFyZW50S2V5LCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICB1cGRhdGVQcm9wKGNoaWxkLCBwcm9wLCB2YWwpO1xuICAgIH0sIHtcbiAgICAgIHR3b1dheTogdHdvV2F5LFxuICAgICAgZmlsdGVyczogcHJvcC5maWx0ZXJzLFxuICAgICAgLy8gaW1wb3J0YW50OiBwcm9wcyBuZWVkIHRvIGJlIG9ic2VydmVkIG9uIHRoZVxuICAgICAgLy8gdi1mb3Igc2NvcGUgaWYgcHJlc2VudFxuICAgICAgc2NvcGU6IHRoaXMuX3Njb3BlXG4gICAgfSk7XG5cbiAgICAvLyBzZXQgdGhlIGNoaWxkIGluaXRpYWwgdmFsdWUuXG4gICAgaW5pdFByb3AoY2hpbGQsIHByb3AsIHBhcmVudFdhdGNoZXIudmFsdWUpO1xuXG4gICAgLy8gc2V0dXAgdHdvLXdheSBiaW5kaW5nXG4gICAgaWYgKHR3b1dheSkge1xuICAgICAgLy8gaW1wb3J0YW50OiBkZWZlciB0aGUgY2hpbGQgd2F0Y2hlciBjcmVhdGlvbiB1bnRpbFxuICAgICAgLy8gdGhlIGNyZWF0ZWQgaG9vayAoYWZ0ZXIgZGF0YSBvYnNlcnZhdGlvbilcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIGNoaWxkLiRvbmNlKCdwcmUtaG9vazpjcmVhdGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmNoaWxkV2F0Y2hlciA9IG5ldyBXYXRjaGVyKGNoaWxkLCBjaGlsZEtleSwgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICAgIHBhcmVudFdhdGNoZXIuc2V0KHZhbCk7XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAvLyBlbnN1cmUgc3luYyB1cHdhcmQgYmVmb3JlIHBhcmVudCBzeW5jIGRvd24uXG4gICAgICAgICAgLy8gdGhpcyBpcyBuZWNlc3NhcnkgaW4gY2FzZXMgZS5nLiB0aGUgY2hpbGRcbiAgICAgICAgICAvLyBtdXRhdGVzIGEgcHJvcCBhcnJheSwgdGhlbiByZXBsYWNlcyBpdC4gKCMxNjgzKVxuICAgICAgICAgIHN5bmM6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgdGhpcy5wYXJlbnRXYXRjaGVyLnRlYXJkb3duKCk7XG4gICAgaWYgKHRoaXMuY2hpbGRXYXRjaGVyKSB7XG4gICAgICB0aGlzLmNoaWxkV2F0Y2hlci50ZWFyZG93bigpO1xuICAgIH1cbiAgfVxufTtcblxudmFyIHF1ZXVlJDEgPSBbXTtcbnZhciBxdWV1ZWQgPSBmYWxzZTtcblxuLyoqXG4gKiBQdXNoIGEgam9iIGludG8gdGhlIHF1ZXVlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGpvYlxuICovXG5cbmZ1bmN0aW9uIHB1c2hKb2Ioam9iKSB7XG4gIHF1ZXVlJDEucHVzaChqb2IpO1xuICBpZiAoIXF1ZXVlZCkge1xuICAgIHF1ZXVlZCA9IHRydWU7XG4gICAgbmV4dFRpY2soZmx1c2gpO1xuICB9XG59XG5cbi8qKlxuICogRmx1c2ggdGhlIHF1ZXVlLCBhbmQgZG8gb25lIGZvcmNlZCByZWZsb3cgYmVmb3JlXG4gKiB0cmlnZ2VyaW5nIHRyYW5zaXRpb25zLlxuICovXG5cbmZ1bmN0aW9uIGZsdXNoKCkge1xuICAvLyBGb3JjZSBsYXlvdXRcbiAgdmFyIGYgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHF1ZXVlJDEubGVuZ3RoOyBpKyspIHtcbiAgICBxdWV1ZSQxW2ldKCk7XG4gIH1cbiAgcXVldWUkMSA9IFtdO1xuICBxdWV1ZWQgPSBmYWxzZTtcbiAgLy8gZHVtbXkgcmV0dXJuLCBzbyBqcyBsaW50ZXJzIGRvbid0IGNvbXBsYWluIGFib3V0XG4gIC8vIHVudXNlZCB2YXJpYWJsZSBmXG4gIHJldHVybiBmO1xufVxuXG52YXIgVFlQRV9UUkFOU0lUSU9OID0gJ3RyYW5zaXRpb24nO1xudmFyIFRZUEVfQU5JTUFUSU9OID0gJ2FuaW1hdGlvbic7XG52YXIgdHJhbnNEdXJhdGlvblByb3AgPSB0cmFuc2l0aW9uUHJvcCArICdEdXJhdGlvbic7XG52YXIgYW5pbUR1cmF0aW9uUHJvcCA9IGFuaW1hdGlvblByb3AgKyAnRHVyYXRpb24nO1xuXG4vKipcbiAqIElmIGEganVzdC1lbnRlcmVkIGVsZW1lbnQgaXMgYXBwbGllZCB0aGVcbiAqIGxlYXZlIGNsYXNzIHdoaWxlIGl0cyBlbnRlciB0cmFuc2l0aW9uIGhhc24ndCBzdGFydGVkIHlldCxcbiAqIGFuZCB0aGUgdHJhbnNpdGlvbmVkIHByb3BlcnR5IGhhcyB0aGUgc2FtZSB2YWx1ZSBmb3IgYm90aFxuICogZW50ZXIvbGVhdmUsIHRoZW4gdGhlIGxlYXZlIHRyYW5zaXRpb24gd2lsbCBiZSBza2lwcGVkIGFuZFxuICogdGhlIHRyYW5zaXRpb25lbmQgZXZlbnQgbmV2ZXIgZmlyZXMuIFRoaXMgZnVuY3Rpb24gZW5zdXJlc1xuICogaXRzIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBhZnRlciBhIHRyYW5zaXRpb24gaGFzIHN0YXJ0ZWRcbiAqIGJ5IHdhaXRpbmcgZm9yIGRvdWJsZSByYWYuXG4gKlxuICogSXQgZmFsbHMgYmFjayB0byBzZXRUaW1lb3V0IG9uIGRldmljZXMgdGhhdCBzdXBwb3J0IENTU1xuICogdHJhbnNpdGlvbnMgYnV0IG5vdCByYWYgKGUuZy4gQW5kcm9pZCA0LjIgYnJvd3NlcikgLSBzaW5jZVxuICogdGhlc2UgZW52aXJvbm1lbnRzIGFyZSB1c3VhbGx5IHNsb3csIHdlIGFyZSBnaXZpbmcgaXQgYVxuICogcmVsYXRpdmVseSBsYXJnZSB0aW1lb3V0LlxuICovXG5cbnZhciByYWYgPSBpbkJyb3dzZXIgJiYgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcbnZhciB3YWl0Rm9yVHJhbnNpdGlvblN0YXJ0ID0gcmFmXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuPyBmdW5jdGlvbiAoZm4pIHtcbiAgcmFmKGZ1bmN0aW9uICgpIHtcbiAgICByYWYoZm4pO1xuICB9KTtcbn0gOiBmdW5jdGlvbiAoZm4pIHtcbiAgc2V0VGltZW91dChmbiwgNTApO1xufTtcblxuLyoqXG4gKiBBIFRyYW5zaXRpb24gb2JqZWN0IHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBzdGF0ZSBhbmQgbG9naWNcbiAqIG9mIHRoZSB0cmFuc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZFxuICogQHBhcmFtIHtPYmplY3R9IGhvb2tzXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqL1xuZnVuY3Rpb24gVHJhbnNpdGlvbihlbCwgaWQsIGhvb2tzLCB2bSkge1xuICB0aGlzLmlkID0gaWQ7XG4gIHRoaXMuZWwgPSBlbDtcbiAgdGhpcy5lbnRlckNsYXNzID0gaG9va3MgJiYgaG9va3MuZW50ZXJDbGFzcyB8fCBpZCArICctZW50ZXInO1xuICB0aGlzLmxlYXZlQ2xhc3MgPSBob29rcyAmJiBob29rcy5sZWF2ZUNsYXNzIHx8IGlkICsgJy1sZWF2ZSc7XG4gIHRoaXMuaG9va3MgPSBob29rcztcbiAgdGhpcy52bSA9IHZtO1xuICAvLyBhc3luYyBzdGF0ZVxuICB0aGlzLnBlbmRpbmdDc3NFdmVudCA9IHRoaXMucGVuZGluZ0Nzc0NiID0gdGhpcy5jYW5jZWwgPSB0aGlzLnBlbmRpbmdKc0NiID0gdGhpcy5vcCA9IHRoaXMuY2IgPSBudWxsO1xuICB0aGlzLmp1c3RFbnRlcmVkID0gZmFsc2U7XG4gIHRoaXMuZW50ZXJlZCA9IHRoaXMubGVmdCA9IGZhbHNlO1xuICB0aGlzLnR5cGVDYWNoZSA9IHt9O1xuICAvLyBjaGVjayBjc3MgdHJhbnNpdGlvbiB0eXBlXG4gIHRoaXMudHlwZSA9IGhvb2tzICYmIGhvb2tzLnR5cGU7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIGlmICh0aGlzLnR5cGUgJiYgdGhpcy50eXBlICE9PSBUWVBFX1RSQU5TSVRJT04gJiYgdGhpcy50eXBlICE9PSBUWVBFX0FOSU1BVElPTikge1xuICAgICAgd2FybignaW52YWxpZCBDU1MgdHJhbnNpdGlvbiB0eXBlIGZvciB0cmFuc2l0aW9uPVwiJyArIHRoaXMuaWQgKyAnXCI6ICcgKyB0aGlzLnR5cGUsIHZtKTtcbiAgICB9XG4gIH1cbiAgLy8gYmluZFxuICB2YXIgc2VsZiA9IHRoaXM7WydlbnRlck5leHRUaWNrJywgJ2VudGVyRG9uZScsICdsZWF2ZU5leHRUaWNrJywgJ2xlYXZlRG9uZSddLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICBzZWxmW21dID0gYmluZChzZWxmW21dLCBzZWxmKTtcbiAgfSk7XG59XG5cbnZhciBwJDEgPSBUcmFuc2l0aW9uLnByb3RvdHlwZTtcblxuLyoqXG4gKiBTdGFydCBhbiBlbnRlcmluZyB0cmFuc2l0aW9uLlxuICpcbiAqIDEuIGVudGVyIHRyYW5zaXRpb24gdHJpZ2dlcmVkXG4gKiAyLiBjYWxsIGJlZm9yZUVudGVyIGhvb2tcbiAqIDMuIGFkZCBlbnRlciBjbGFzc1xuICogNC4gaW5zZXJ0L3Nob3cgZWxlbWVudFxuICogNS4gY2FsbCBlbnRlciBob29rICh3aXRoIHBvc3NpYmxlIGV4cGxpY2l0IGpzIGNhbGxiYWNrKVxuICogNi4gcmVmbG93XG4gKiA3LiBiYXNlZCBvbiB0cmFuc2l0aW9uIHR5cGU6XG4gKiAgICAtIHRyYW5zaXRpb246XG4gKiAgICAgICAgcmVtb3ZlIGNsYXNzIG5vdywgd2FpdCBmb3IgdHJhbnNpdGlvbmVuZCxcbiAqICAgICAgICB0aGVuIGRvbmUgaWYgdGhlcmUncyBubyBleHBsaWNpdCBqcyBjYWxsYmFjay5cbiAqICAgIC0gYW5pbWF0aW9uOlxuICogICAgICAgIHdhaXQgZm9yIGFuaW1hdGlvbmVuZCwgcmVtb3ZlIGNsYXNzLFxuICogICAgICAgIHRoZW4gZG9uZSBpZiB0aGVyZSdzIG5vIGV4cGxpY2l0IGpzIGNhbGxiYWNrLlxuICogICAgLSBubyBjc3MgdHJhbnNpdGlvbjpcbiAqICAgICAgICBkb25lIG5vdyBpZiB0aGVyZSdzIG5vIGV4cGxpY2l0IGpzIGNhbGxiYWNrLlxuICogOC4gd2FpdCBmb3IgZWl0aGVyIGRvbmUgb3IganMgY2FsbGJhY2ssIHRoZW4gY2FsbFxuICogICAgYWZ0ZXJFbnRlciBob29rLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9wIC0gaW5zZXJ0L3Nob3cgdGhlIGVsZW1lbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cbiAqL1xuXG5wJDEuZW50ZXIgPSBmdW5jdGlvbiAob3AsIGNiKSB7XG4gIHRoaXMuY2FuY2VsUGVuZGluZygpO1xuICB0aGlzLmNhbGxIb29rKCdiZWZvcmVFbnRlcicpO1xuICB0aGlzLmNiID0gY2I7XG4gIGFkZENsYXNzKHRoaXMuZWwsIHRoaXMuZW50ZXJDbGFzcyk7XG4gIG9wKCk7XG4gIHRoaXMuZW50ZXJlZCA9IGZhbHNlO1xuICB0aGlzLmNhbGxIb29rV2l0aENiKCdlbnRlcicpO1xuICBpZiAodGhpcy5lbnRlcmVkKSB7XG4gICAgcmV0dXJuOyAvLyB1c2VyIGNhbGxlZCBkb25lIHN5bmNocm9ub3VzbHkuXG4gIH1cbiAgdGhpcy5jYW5jZWwgPSB0aGlzLmhvb2tzICYmIHRoaXMuaG9va3MuZW50ZXJDYW5jZWxsZWQ7XG4gIHB1c2hKb2IodGhpcy5lbnRlck5leHRUaWNrKTtcbn07XG5cbi8qKlxuICogVGhlIFwibmV4dFRpY2tcIiBwaGFzZSBvZiBhbiBlbnRlcmluZyB0cmFuc2l0aW9uLCB3aGljaCBpc1xuICogdG8gYmUgcHVzaGVkIGludG8gYSBxdWV1ZSBhbmQgZXhlY3V0ZWQgYWZ0ZXIgYSByZWZsb3cgc29cbiAqIHRoYXQgcmVtb3ZpbmcgdGhlIGNsYXNzIGNhbiB0cmlnZ2VyIGEgQ1NTIHRyYW5zaXRpb24uXG4gKi9cblxucCQxLmVudGVyTmV4dFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgLy8gcHJldmVudCB0cmFuc2l0aW9uIHNraXBwaW5nXG4gIHRoaXMuanVzdEVudGVyZWQgPSB0cnVlO1xuICB3YWl0Rm9yVHJhbnNpdGlvblN0YXJ0KGZ1bmN0aW9uICgpIHtcbiAgICBfdGhpcy5qdXN0RW50ZXJlZCA9IGZhbHNlO1xuICB9KTtcbiAgdmFyIGVudGVyRG9uZSA9IHRoaXMuZW50ZXJEb25lO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0Q3NzVHJhbnNpdGlvblR5cGUodGhpcy5lbnRlckNsYXNzKTtcbiAgaWYgKCF0aGlzLnBlbmRpbmdKc0NiKSB7XG4gICAgaWYgKHR5cGUgPT09IFRZUEVfVFJBTlNJVElPTikge1xuICAgICAgLy8gdHJpZ2dlciB0cmFuc2l0aW9uIGJ5IHJlbW92aW5nIGVudGVyIGNsYXNzIG5vd1xuICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5lbCwgdGhpcy5lbnRlckNsYXNzKTtcbiAgICAgIHRoaXMuc2V0dXBDc3NDYih0cmFuc2l0aW9uRW5kRXZlbnQsIGVudGVyRG9uZSk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBUWVBFX0FOSU1BVElPTikge1xuICAgICAgdGhpcy5zZXR1cENzc0NiKGFuaW1hdGlvbkVuZEV2ZW50LCBlbnRlckRvbmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbnRlckRvbmUoKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gVFlQRV9UUkFOU0lUSU9OKSB7XG4gICAgcmVtb3ZlQ2xhc3ModGhpcy5lbCwgdGhpcy5lbnRlckNsYXNzKTtcbiAgfVxufTtcblxuLyoqXG4gKiBUaGUgXCJjbGVhbnVwXCIgcGhhc2Ugb2YgYW4gZW50ZXJpbmcgdHJhbnNpdGlvbi5cbiAqL1xuXG5wJDEuZW50ZXJEb25lID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmVudGVyZWQgPSB0cnVlO1xuICB0aGlzLmNhbmNlbCA9IHRoaXMucGVuZGluZ0pzQ2IgPSBudWxsO1xuICByZW1vdmVDbGFzcyh0aGlzLmVsLCB0aGlzLmVudGVyQ2xhc3MpO1xuICB0aGlzLmNhbGxIb29rKCdhZnRlckVudGVyJyk7XG4gIGlmICh0aGlzLmNiKSB0aGlzLmNiKCk7XG59O1xuXG4vKipcbiAqIFN0YXJ0IGEgbGVhdmluZyB0cmFuc2l0aW9uLlxuICpcbiAqIDEuIGxlYXZlIHRyYW5zaXRpb24gdHJpZ2dlcmVkLlxuICogMi4gY2FsbCBiZWZvcmVMZWF2ZSBob29rXG4gKiAzLiBhZGQgbGVhdmUgY2xhc3MgKHRyaWdnZXIgY3NzIHRyYW5zaXRpb24pXG4gKiA0LiBjYWxsIGxlYXZlIGhvb2sgKHdpdGggcG9zc2libGUgZXhwbGljaXQganMgY2FsbGJhY2spXG4gKiA1LiByZWZsb3cgaWYgbm8gZXhwbGljaXQganMgY2FsbGJhY2sgaXMgcHJvdmlkZWRcbiAqIDYuIGJhc2VkIG9uIHRyYW5zaXRpb24gdHlwZTpcbiAqICAgIC0gdHJhbnNpdGlvbiBvciBhbmltYXRpb246XG4gKiAgICAgICAgd2FpdCBmb3IgZW5kIGV2ZW50LCByZW1vdmUgY2xhc3MsIHRoZW4gZG9uZSBpZlxuICogICAgICAgIHRoZXJlJ3Mgbm8gZXhwbGljaXQganMgY2FsbGJhY2suXG4gKiAgICAtIG5vIGNzcyB0cmFuc2l0aW9uOlxuICogICAgICAgIGRvbmUgaWYgdGhlcmUncyBubyBleHBsaWNpdCBqcyBjYWxsYmFjay5cbiAqIDcuIHdhaXQgZm9yIGVpdGhlciBkb25lIG9yIGpzIGNhbGxiYWNrLCB0aGVuIGNhbGxcbiAqICAgIGFmdGVyTGVhdmUgaG9vay5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcCAtIHJlbW92ZS9oaWRlIHRoZSBlbGVtZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gKi9cblxucCQxLmxlYXZlID0gZnVuY3Rpb24gKG9wLCBjYikge1xuICB0aGlzLmNhbmNlbFBlbmRpbmcoKTtcbiAgdGhpcy5jYWxsSG9vaygnYmVmb3JlTGVhdmUnKTtcbiAgdGhpcy5vcCA9IG9wO1xuICB0aGlzLmNiID0gY2I7XG4gIGFkZENsYXNzKHRoaXMuZWwsIHRoaXMubGVhdmVDbGFzcyk7XG4gIHRoaXMubGVmdCA9IGZhbHNlO1xuICB0aGlzLmNhbGxIb29rV2l0aENiKCdsZWF2ZScpO1xuICBpZiAodGhpcy5sZWZ0KSB7XG4gICAgcmV0dXJuOyAvLyB1c2VyIGNhbGxlZCBkb25lIHN5bmNocm9ub3VzbHkuXG4gIH1cbiAgdGhpcy5jYW5jZWwgPSB0aGlzLmhvb2tzICYmIHRoaXMuaG9va3MubGVhdmVDYW5jZWxsZWQ7XG4gIC8vIG9ubHkgbmVlZCB0byBoYW5kbGUgbGVhdmVEb25lIGlmXG4gIC8vIDEuIHRoZSB0cmFuc2l0aW9uIGlzIGFscmVhZHkgZG9uZSAoc3luY2hyb25vdXNseSBjYWxsZWRcbiAgLy8gICAgYnkgdGhlIHVzZXIsIHdoaWNoIGNhdXNlcyB0aGlzLm9wIHNldCB0byBudWxsKVxuICAvLyAyLiB0aGVyZSdzIG5vIGV4cGxpY2l0IGpzIGNhbGxiYWNrXG4gIGlmICh0aGlzLm9wICYmICF0aGlzLnBlbmRpbmdKc0NiKSB7XG4gICAgLy8gaWYgYSBDU1MgdHJhbnNpdGlvbiBsZWF2ZXMgaW1tZWRpYXRlbHkgYWZ0ZXIgZW50ZXIsXG4gICAgLy8gdGhlIHRyYW5zaXRpb25lbmQgZXZlbnQgbmV2ZXIgZmlyZXMuIHRoZXJlZm9yZSB3ZVxuICAgIC8vIGRldGVjdCBzdWNoIGNhc2VzIGFuZCBlbmQgdGhlIGxlYXZlIGltbWVkaWF0ZWx5LlxuICAgIGlmICh0aGlzLmp1c3RFbnRlcmVkKSB7XG4gICAgICB0aGlzLmxlYXZlRG9uZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwdXNoSm9iKHRoaXMubGVhdmVOZXh0VGljayk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFRoZSBcIm5leHRUaWNrXCIgcGhhc2Ugb2YgYSBsZWF2aW5nIHRyYW5zaXRpb24uXG4gKi9cblxucCQxLmxlYXZlTmV4dFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB0eXBlID0gdGhpcy5nZXRDc3NUcmFuc2l0aW9uVHlwZSh0aGlzLmxlYXZlQ2xhc3MpO1xuICBpZiAodHlwZSkge1xuICAgIHZhciBldmVudCA9IHR5cGUgPT09IFRZUEVfVFJBTlNJVElPTiA/IHRyYW5zaXRpb25FbmRFdmVudCA6IGFuaW1hdGlvbkVuZEV2ZW50O1xuICAgIHRoaXMuc2V0dXBDc3NDYihldmVudCwgdGhpcy5sZWF2ZURvbmUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMubGVhdmVEb25lKCk7XG4gIH1cbn07XG5cbi8qKlxuICogVGhlIFwiY2xlYW51cFwiIHBoYXNlIG9mIGEgbGVhdmluZyB0cmFuc2l0aW9uLlxuICovXG5cbnAkMS5sZWF2ZURvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMubGVmdCA9IHRydWU7XG4gIHRoaXMuY2FuY2VsID0gdGhpcy5wZW5kaW5nSnNDYiA9IG51bGw7XG4gIHRoaXMub3AoKTtcbiAgcmVtb3ZlQ2xhc3ModGhpcy5lbCwgdGhpcy5sZWF2ZUNsYXNzKTtcbiAgdGhpcy5jYWxsSG9vaygnYWZ0ZXJMZWF2ZScpO1xuICBpZiAodGhpcy5jYikgdGhpcy5jYigpO1xuICB0aGlzLm9wID0gbnVsbDtcbn07XG5cbi8qKlxuICogQ2FuY2VsIGFueSBwZW5kaW5nIGNhbGxiYWNrcyBmcm9tIGEgcHJldmlvdXNseSBydW5uaW5nXG4gKiBidXQgbm90IGZpbmlzaGVkIHRyYW5zaXRpb24uXG4gKi9cblxucCQxLmNhbmNlbFBlbmRpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMub3AgPSB0aGlzLmNiID0gbnVsbDtcbiAgdmFyIGhhc1BlbmRpbmcgPSBmYWxzZTtcbiAgaWYgKHRoaXMucGVuZGluZ0Nzc0NiKSB7XG4gICAgaGFzUGVuZGluZyA9IHRydWU7XG4gICAgb2ZmKHRoaXMuZWwsIHRoaXMucGVuZGluZ0Nzc0V2ZW50LCB0aGlzLnBlbmRpbmdDc3NDYik7XG4gICAgdGhpcy5wZW5kaW5nQ3NzRXZlbnQgPSB0aGlzLnBlbmRpbmdDc3NDYiA9IG51bGw7XG4gIH1cbiAgaWYgKHRoaXMucGVuZGluZ0pzQ2IpIHtcbiAgICBoYXNQZW5kaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnBlbmRpbmdKc0NiLmNhbmNlbCgpO1xuICAgIHRoaXMucGVuZGluZ0pzQ2IgPSBudWxsO1xuICB9XG4gIGlmIChoYXNQZW5kaW5nKSB7XG4gICAgcmVtb3ZlQ2xhc3ModGhpcy5lbCwgdGhpcy5lbnRlckNsYXNzKTtcbiAgICByZW1vdmVDbGFzcyh0aGlzLmVsLCB0aGlzLmxlYXZlQ2xhc3MpO1xuICB9XG4gIGlmICh0aGlzLmNhbmNlbCkge1xuICAgIHRoaXMuY2FuY2VsLmNhbGwodGhpcy52bSwgdGhpcy5lbCk7XG4gICAgdGhpcy5jYW5jZWwgPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIENhbGwgYSB1c2VyLXByb3ZpZGVkIHN5bmNocm9ub3VzIGhvb2sgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqL1xuXG5wJDEuY2FsbEhvb2sgPSBmdW5jdGlvbiAodHlwZSkge1xuICBpZiAodGhpcy5ob29rcyAmJiB0aGlzLmhvb2tzW3R5cGVdKSB7XG4gICAgdGhpcy5ob29rc1t0eXBlXS5jYWxsKHRoaXMudm0sIHRoaXMuZWwpO1xuICB9XG59O1xuXG4vKipcbiAqIENhbGwgYSB1c2VyLXByb3ZpZGVkLCBwb3RlbnRpYWxseS1hc3luYyBob29rIGZ1bmN0aW9uLlxuICogV2UgY2hlY2sgZm9yIHRoZSBsZW5ndGggb2YgYXJndW1lbnRzIHRvIHNlZSBpZiB0aGUgaG9va1xuICogZXhwZWN0cyBhIGBkb25lYCBjYWxsYmFjay4gSWYgdHJ1ZSwgdGhlIHRyYW5zaXRpb24ncyBlbmRcbiAqIHdpbGwgYmUgZGV0ZXJtaW5lZCBieSB3aGVuIHRoZSB1c2VyIGNhbGxzIHRoYXQgY2FsbGJhY2s7XG4gKiBvdGhlcndpc2UsIHRoZSBlbmQgaXMgZGV0ZXJtaW5lZCBieSB0aGUgQ1NTIHRyYW5zaXRpb24gb3JcbiAqIGFuaW1hdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICovXG5cbnAkMS5jYWxsSG9va1dpdGhDYiA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHZhciBob29rID0gdGhpcy5ob29rcyAmJiB0aGlzLmhvb2tzW3R5cGVdO1xuICBpZiAoaG9vaykge1xuICAgIGlmIChob29rLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRoaXMucGVuZGluZ0pzQ2IgPSBjYW5jZWxsYWJsZSh0aGlzW3R5cGUgKyAnRG9uZSddKTtcbiAgICB9XG4gICAgaG9vay5jYWxsKHRoaXMudm0sIHRoaXMuZWwsIHRoaXMucGVuZGluZ0pzQ2IpO1xuICB9XG59O1xuXG4vKipcbiAqIEdldCBhbiBlbGVtZW50J3MgdHJhbnNpdGlvbiB0eXBlIGJhc2VkIG9uIHRoZVxuICogY2FsY3VsYXRlZCBzdHlsZXMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZVxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5cbnAkMS5nZXRDc3NUcmFuc2l0aW9uVHlwZSA9IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICghdHJhbnNpdGlvbkVuZEV2ZW50IHx8XG4gIC8vIHNraXAgQ1NTIHRyYW5zaXRpb25zIGlmIHBhZ2UgaXMgbm90IHZpc2libGUgLVxuICAvLyB0aGlzIHNvbHZlcyB0aGUgaXNzdWUgb2YgdHJhbnNpdGlvbmVuZCBldmVudHMgbm90XG4gIC8vIGZpcmluZyB1bnRpbCB0aGUgcGFnZSBpcyB2aXNpYmxlIGFnYWluLlxuICAvLyBwYWdlVmlzaWJpbGl0eSBBUEkgaXMgc3VwcG9ydGVkIGluIElFMTArLCBzYW1lIGFzXG4gIC8vIENTUyB0cmFuc2l0aW9ucy5cbiAgZG9jdW1lbnQuaGlkZGVuIHx8XG4gIC8vIGV4cGxpY2l0IGpzLW9ubHkgdHJhbnNpdGlvblxuICB0aGlzLmhvb2tzICYmIHRoaXMuaG9va3MuY3NzID09PSBmYWxzZSB8fFxuICAvLyBlbGVtZW50IGlzIGhpZGRlblxuICBpc0hpZGRlbih0aGlzLmVsKSkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgdHlwZSA9IHRoaXMudHlwZSB8fCB0aGlzLnR5cGVDYWNoZVtjbGFzc05hbWVdO1xuICBpZiAodHlwZSkgcmV0dXJuIHR5cGU7XG4gIHZhciBpbmxpbmVTdHlsZXMgPSB0aGlzLmVsLnN0eWxlO1xuICB2YXIgY29tcHV0ZWRTdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmVsKTtcbiAgdmFyIHRyYW5zRHVyYXRpb24gPSBpbmxpbmVTdHlsZXNbdHJhbnNEdXJhdGlvblByb3BdIHx8IGNvbXB1dGVkU3R5bGVzW3RyYW5zRHVyYXRpb25Qcm9wXTtcbiAgaWYgKHRyYW5zRHVyYXRpb24gJiYgdHJhbnNEdXJhdGlvbiAhPT0gJzBzJykge1xuICAgIHR5cGUgPSBUWVBFX1RSQU5TSVRJT047XG4gIH0gZWxzZSB7XG4gICAgdmFyIGFuaW1EdXJhdGlvbiA9IGlubGluZVN0eWxlc1thbmltRHVyYXRpb25Qcm9wXSB8fCBjb21wdXRlZFN0eWxlc1thbmltRHVyYXRpb25Qcm9wXTtcbiAgICBpZiAoYW5pbUR1cmF0aW9uICYmIGFuaW1EdXJhdGlvbiAhPT0gJzBzJykge1xuICAgICAgdHlwZSA9IFRZUEVfQU5JTUFUSU9OO1xuICAgIH1cbiAgfVxuICBpZiAodHlwZSkge1xuICAgIHRoaXMudHlwZUNhY2hlW2NsYXNzTmFtZV0gPSB0eXBlO1xuICB9XG4gIHJldHVybiB0eXBlO1xufTtcblxuLyoqXG4gKiBTZXR1cCBhIENTUyB0cmFuc2l0aW9uZW5kL2FuaW1hdGlvbmVuZCBjYWxsYmFjay5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gKi9cblxucCQxLnNldHVwQ3NzQ2IgPSBmdW5jdGlvbiAoZXZlbnQsIGNiKSB7XG4gIHRoaXMucGVuZGluZ0Nzc0V2ZW50ID0gZXZlbnQ7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIGVsID0gdGhpcy5lbDtcbiAgdmFyIG9uRW5kID0gdGhpcy5wZW5kaW5nQ3NzQ2IgPSBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlLnRhcmdldCA9PT0gZWwpIHtcbiAgICAgIG9mZihlbCwgZXZlbnQsIG9uRW5kKTtcbiAgICAgIHNlbGYucGVuZGluZ0Nzc0V2ZW50ID0gc2VsZi5wZW5kaW5nQ3NzQ2IgPSBudWxsO1xuICAgICAgaWYgKCFzZWxmLnBlbmRpbmdKc0NiICYmIGNiKSB7XG4gICAgICAgIGNiKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBvbihlbCwgZXZlbnQsIG9uRW5kKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYW4gZWxlbWVudCBpcyBoaWRkZW4gLSBpbiB0aGF0IGNhc2Ugd2UgY2FuIGp1c3RcbiAqIHNraXAgdGhlIHRyYW5zaXRpb24gYWxsdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc0hpZGRlbihlbCkge1xuICBpZiAoL3N2ZyQvLnRlc3QoZWwubmFtZXNwYWNlVVJJKSkge1xuICAgIC8vIFNWRyBlbGVtZW50cyBkbyBub3QgaGF2ZSBvZmZzZXQoV2lkdGh8SGVpZ2h0KVxuICAgIC8vIHNvIHdlIG5lZWQgdG8gY2hlY2sgdGhlIGNsaWVudCByZWN0XG4gICAgdmFyIHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4gIShyZWN0LndpZHRoIHx8IHJlY3QuaGVpZ2h0KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gIShlbC5vZmZzZXRXaWR0aCB8fCBlbC5vZmZzZXRIZWlnaHQgfHwgZWwuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGgpO1xuICB9XG59XG5cbnZhciB0cmFuc2l0aW9uJDEgPSB7XG5cbiAgcHJpb3JpdHk6IFRSQU5TSVRJT04sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoaWQsIG9sZElkKSB7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICAvLyByZXNvbHZlIG9uIG93bmVyIHZtXG4gICAgdmFyIGhvb2tzID0gcmVzb2x2ZUFzc2V0KHRoaXMudm0uJG9wdGlvbnMsICd0cmFuc2l0aW9ucycsIGlkKTtcbiAgICBpZCA9IGlkIHx8ICd2JztcbiAgICBlbC5fX3ZfdHJhbnMgPSBuZXcgVHJhbnNpdGlvbihlbCwgaWQsIGhvb2tzLCB0aGlzLnZtKTtcbiAgICBpZiAob2xkSWQpIHtcbiAgICAgIHJlbW92ZUNsYXNzKGVsLCBvbGRJZCArICctdHJhbnNpdGlvbicpO1xuICAgIH1cbiAgICBhZGRDbGFzcyhlbCwgaWQgKyAnLXRyYW5zaXRpb24nKTtcbiAgfVxufTtcblxudmFyIGludGVybmFsRGlyZWN0aXZlcyA9IHtcbiAgc3R5bGU6IHN0eWxlLFxuICAnY2xhc3MnOiB2Q2xhc3MsXG4gIGNvbXBvbmVudDogY29tcG9uZW50LFxuICBwcm9wOiBwcm9wRGVmLFxuICB0cmFuc2l0aW9uOiB0cmFuc2l0aW9uJDFcbn07XG5cbi8vIHNwZWNpYWwgYmluZGluZyBwcmVmaXhlc1xudmFyIGJpbmRSRSA9IC9edi1iaW5kOnxeOi87XG52YXIgb25SRSA9IC9edi1vbjp8XkAvO1xudmFyIGRpckF0dHJSRSA9IC9edi0oW146XSspKD86JHw6KC4qKSQpLztcbnZhciBtb2RpZmllclJFID0gL1xcLlteXFwuXSsvZztcbnZhciB0cmFuc2l0aW9uUkUgPSAvXih2LWJpbmQ6fDopP3RyYW5zaXRpb24kLztcblxuLy8gZGVmYXVsdCBkaXJlY3RpdmUgcHJpb3JpdHlcbnZhciBERUZBVUxUX1BSSU9SSVRZID0gMTAwMDtcbnZhciBERUZBVUxUX1RFUk1JTkFMX1BSSU9SSVRZID0gMjAwMDtcblxuLyoqXG4gKiBDb21waWxlIGEgdGVtcGxhdGUgYW5kIHJldHVybiBhIHJldXNhYmxlIGNvbXBvc2l0ZSBsaW5rXG4gKiBmdW5jdGlvbiwgd2hpY2ggcmVjdXJzaXZlbHkgY29udGFpbnMgbW9yZSBsaW5rIGZ1bmN0aW9uc1xuICogaW5zaWRlLiBUaGlzIHRvcCBsZXZlbCBjb21waWxlIGZ1bmN0aW9uIHdvdWxkIG5vcm1hbGx5XG4gKiBiZSBjYWxsZWQgb24gaW5zdGFuY2Ugcm9vdCBub2RlcywgYnV0IGNhbiBhbHNvIGJlIHVzZWRcbiAqIGZvciBwYXJ0aWFsIGNvbXBpbGF0aW9uIGlmIHRoZSBwYXJ0aWFsIGFyZ3VtZW50IGlzIHRydWUuXG4gKlxuICogVGhlIHJldHVybmVkIGNvbXBvc2l0ZSBsaW5rIGZ1bmN0aW9uLCB3aGVuIGNhbGxlZCwgd2lsbFxuICogcmV0dXJuIGFuIHVubGluayBmdW5jdGlvbiB0aGF0IHRlYXJzZG93biBhbGwgZGlyZWN0aXZlc1xuICogY3JlYXRlZCBkdXJpbmcgdGhlIGxpbmtpbmcgcGhhc2UuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fERvY3VtZW50RnJhZ21lbnR9IGVsXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtCb29sZWFufSBwYXJ0aWFsXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBjb21waWxlKGVsLCBvcHRpb25zLCBwYXJ0aWFsKSB7XG4gIC8vIGxpbmsgZnVuY3Rpb24gZm9yIHRoZSBub2RlIGl0c2VsZi5cbiAgdmFyIG5vZGVMaW5rRm4gPSBwYXJ0aWFsIHx8ICFvcHRpb25zLl9hc0NvbXBvbmVudCA/IGNvbXBpbGVOb2RlKGVsLCBvcHRpb25zKSA6IG51bGw7XG4gIC8vIGxpbmsgZnVuY3Rpb24gZm9yIHRoZSBjaGlsZE5vZGVzXG4gIHZhciBjaGlsZExpbmtGbiA9ICEobm9kZUxpbmtGbiAmJiBub2RlTGlua0ZuLnRlcm1pbmFsKSAmJiAhaXNTY3JpcHQoZWwpICYmIGVsLmhhc0NoaWxkTm9kZXMoKSA/IGNvbXBpbGVOb2RlTGlzdChlbC5jaGlsZE5vZGVzLCBvcHRpb25zKSA6IG51bGw7XG5cbiAgLyoqXG4gICAqIEEgY29tcG9zaXRlIGxpbmtlciBmdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gYSBhbHJlYWR5XG4gICAqIGNvbXBpbGVkIHBpZWNlIG9mIERPTSwgd2hpY2ggaW5zdGFudGlhdGVzIGFsbCBkaXJlY3RpdmVcbiAgICogaW5zdGFuY2VzLlxuICAgKlxuICAgKiBAcGFyYW0ge1Z1ZX0gdm1cbiAgICogQHBhcmFtIHtFbGVtZW50fERvY3VtZW50RnJhZ21lbnR9IGVsXG4gICAqIEBwYXJhbSB7VnVlfSBbaG9zdF0gLSBob3N0IHZtIG9mIHRyYW5zY2x1ZGVkIGNvbnRlbnRcbiAgICogQHBhcmFtIHtPYmplY3R9IFtzY29wZV0gLSB2LWZvciBzY29wZVxuICAgKiBAcGFyYW0ge0ZyYWdtZW50fSBbZnJhZ10gLSBsaW5rIGNvbnRleHQgZnJhZ21lbnRcbiAgICogQHJldHVybiB7RnVuY3Rpb258dW5kZWZpbmVkfVxuICAgKi9cblxuICByZXR1cm4gZnVuY3Rpb24gY29tcG9zaXRlTGlua0ZuKHZtLCBlbCwgaG9zdCwgc2NvcGUsIGZyYWcpIHtcbiAgICAvLyBjYWNoZSBjaGlsZE5vZGVzIGJlZm9yZSBsaW5raW5nIHBhcmVudCwgZml4ICM2NTdcbiAgICB2YXIgY2hpbGROb2RlcyA9IHRvQXJyYXkoZWwuY2hpbGROb2Rlcyk7XG4gICAgLy8gbGlua1xuICAgIHZhciBkaXJzID0gbGlua0FuZENhcHR1cmUoZnVuY3Rpb24gY29tcG9zaXRlTGlua0NhcHR1cmVyKCkge1xuICAgICAgaWYgKG5vZGVMaW5rRm4pIG5vZGVMaW5rRm4odm0sIGVsLCBob3N0LCBzY29wZSwgZnJhZyk7XG4gICAgICBpZiAoY2hpbGRMaW5rRm4pIGNoaWxkTGlua0ZuKHZtLCBjaGlsZE5vZGVzLCBob3N0LCBzY29wZSwgZnJhZyk7XG4gICAgfSwgdm0pO1xuICAgIHJldHVybiBtYWtlVW5saW5rRm4odm0sIGRpcnMpO1xuICB9O1xufVxuXG4vKipcbiAqIEFwcGx5IGEgbGlua2VyIHRvIGEgdm0vZWxlbWVudCBwYWlyIGFuZCBjYXB0dXJlIHRoZVxuICogZGlyZWN0aXZlcyBjcmVhdGVkIGR1cmluZyB0aGUgcHJvY2Vzcy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaW5rZXJcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICovXG5cbmZ1bmN0aW9uIGxpbmtBbmRDYXB0dXJlKGxpbmtlciwgdm0pIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgLy8gcmVzZXQgZGlyZWN0aXZlcyBiZWZvcmUgZXZlcnkgY2FwdHVyZSBpbiBwcm9kdWN0aW9uXG4gICAgLy8gbW9kZSwgc28gdGhhdCB3aGVuIHVubGlua2luZyB3ZSBkb24ndCBuZWVkIHRvIHNwbGljZVxuICAgIC8vIHRoZW0gb3V0ICh3aGljaCB0dXJucyBvdXQgdG8gYmUgYSBwZXJmIGhpdCkuXG4gICAgLy8gdGhleSBhcmUga2VwdCBpbiBkZXZlbG9wbWVudCBtb2RlIGJlY2F1c2UgdGhleSBhcmVcbiAgICAvLyB1c2VmdWwgZm9yIFZ1ZSdzIG93biB0ZXN0cy5cbiAgICB2bS5fZGlyZWN0aXZlcyA9IFtdO1xuICB9XG4gIHZhciBvcmlnaW5hbERpckNvdW50ID0gdm0uX2RpcmVjdGl2ZXMubGVuZ3RoO1xuICBsaW5rZXIoKTtcbiAgdmFyIGRpcnMgPSB2bS5fZGlyZWN0aXZlcy5zbGljZShvcmlnaW5hbERpckNvdW50KTtcbiAgZGlycy5zb3J0KGRpcmVjdGl2ZUNvbXBhcmF0b3IpO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IGRpcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZGlyc1tpXS5fYmluZCgpO1xuICB9XG4gIHJldHVybiBkaXJzO1xufVxuXG4vKipcbiAqIERpcmVjdGl2ZSBwcmlvcml0eSBzb3J0IGNvbXBhcmF0b3JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqL1xuXG5mdW5jdGlvbiBkaXJlY3RpdmVDb21wYXJhdG9yKGEsIGIpIHtcbiAgYSA9IGEuZGVzY3JpcHRvci5kZWYucHJpb3JpdHkgfHwgREVGQVVMVF9QUklPUklUWTtcbiAgYiA9IGIuZGVzY3JpcHRvci5kZWYucHJpb3JpdHkgfHwgREVGQVVMVF9QUklPUklUWTtcbiAgcmV0dXJuIGEgPiBiID8gLTEgOiBhID09PSBiID8gMCA6IDE7XG59XG5cbi8qKlxuICogTGlua2VyIGZ1bmN0aW9ucyByZXR1cm4gYW4gdW5saW5rIGZ1bmN0aW9uIHRoYXRcbiAqIHRlYXJzZG93biBhbGwgZGlyZWN0aXZlcyBpbnN0YW5jZXMgZ2VuZXJhdGVkIGR1cmluZ1xuICogdGhlIHByb2Nlc3MuXG4gKlxuICogV2UgY3JlYXRlIHVubGluayBmdW5jdGlvbnMgd2l0aCBvbmx5IHRoZSBuZWNlc3NhcnlcbiAqIGluZm9ybWF0aW9uIHRvIGF2b2lkIHJldGFpbmluZyBhZGRpdGlvbmFsIGNsb3N1cmVzLlxuICpcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICogQHBhcmFtIHtBcnJheX0gZGlyc1xuICogQHBhcmFtIHtWdWV9IFtjb250ZXh0XVxuICogQHBhcmFtIHtBcnJheX0gW2NvbnRleHREaXJzXVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gbWFrZVVubGlua0ZuKHZtLCBkaXJzLCBjb250ZXh0LCBjb250ZXh0RGlycykge1xuICBmdW5jdGlvbiB1bmxpbmsoZGVzdHJveWluZykge1xuICAgIHRlYXJkb3duRGlycyh2bSwgZGlycywgZGVzdHJveWluZyk7XG4gICAgaWYgKGNvbnRleHQgJiYgY29udGV4dERpcnMpIHtcbiAgICAgIHRlYXJkb3duRGlycyhjb250ZXh0LCBjb250ZXh0RGlycyk7XG4gICAgfVxuICB9XG4gIC8vIGV4cG9zZSBsaW5rZWQgZGlyZWN0aXZlc1xuICB1bmxpbmsuZGlycyA9IGRpcnM7XG4gIHJldHVybiB1bmxpbms7XG59XG5cbi8qKlxuICogVGVhcmRvd24gcGFydGlhbCBsaW5rZWQgZGlyZWN0aXZlcy5cbiAqXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEBwYXJhbSB7QXJyYXl9IGRpcnNcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZGVzdHJveWluZ1xuICovXG5cbmZ1bmN0aW9uIHRlYXJkb3duRGlycyh2bSwgZGlycywgZGVzdHJveWluZykge1xuICB2YXIgaSA9IGRpcnMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgZGlyc1tpXS5fdGVhcmRvd24oKTtcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiAhZGVzdHJveWluZykge1xuICAgICAgdm0uX2RpcmVjdGl2ZXMuJHJlbW92ZShkaXJzW2ldKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDb21waWxlIGxpbmsgcHJvcHMgb24gYW4gaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbc2NvcGVdXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBjb21waWxlQW5kTGlua1Byb3BzKHZtLCBlbCwgcHJvcHMsIHNjb3BlKSB7XG4gIHZhciBwcm9wc0xpbmtGbiA9IGNvbXBpbGVQcm9wcyhlbCwgcHJvcHMsIHZtKTtcbiAgdmFyIHByb3BEaXJzID0gbGlua0FuZENhcHR1cmUoZnVuY3Rpb24gKCkge1xuICAgIHByb3BzTGlua0ZuKHZtLCBzY29wZSk7XG4gIH0sIHZtKTtcbiAgcmV0dXJuIG1ha2VVbmxpbmtGbih2bSwgcHJvcERpcnMpO1xufVxuXG4vKipcbiAqIENvbXBpbGUgdGhlIHJvb3QgZWxlbWVudCBvZiBhbiBpbnN0YW5jZS5cbiAqXG4gKiAxLiBhdHRycyBvbiBjb250ZXh0IGNvbnRhaW5lciAoY29udGV4dCBzY29wZSlcbiAqIDIuIGF0dHJzIG9uIHRoZSBjb21wb25lbnQgdGVtcGxhdGUgcm9vdCBub2RlLCBpZlxuICogICAgcmVwbGFjZTp0cnVlIChjaGlsZCBzY29wZSlcbiAqXG4gKiBJZiB0aGlzIGlzIGEgZnJhZ21lbnQgaW5zdGFuY2UsIHdlIG9ubHkgbmVlZCB0byBjb21waWxlIDEuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0T3B0aW9uc1xuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gY29tcGlsZVJvb3QoZWwsIG9wdGlvbnMsIGNvbnRleHRPcHRpb25zKSB7XG4gIHZhciBjb250YWluZXJBdHRycyA9IG9wdGlvbnMuX2NvbnRhaW5lckF0dHJzO1xuICB2YXIgcmVwbGFjZXJBdHRycyA9IG9wdGlvbnMuX3JlcGxhY2VyQXR0cnM7XG4gIHZhciBjb250ZXh0TGlua0ZuLCByZXBsYWNlckxpbmtGbjtcblxuICAvLyBvbmx5IG5lZWQgdG8gY29tcGlsZSBvdGhlciBhdHRyaWJ1dGVzIGZvclxuICAvLyBub24tZnJhZ21lbnQgaW5zdGFuY2VzXG4gIGlmIChlbC5ub2RlVHlwZSAhPT0gMTEpIHtcbiAgICAvLyBmb3IgY29tcG9uZW50cywgY29udGFpbmVyIGFuZCByZXBsYWNlciBuZWVkIHRvIGJlXG4gICAgLy8gY29tcGlsZWQgc2VwYXJhdGVseSBhbmQgbGlua2VkIGluIGRpZmZlcmVudCBzY29wZXMuXG4gICAgaWYgKG9wdGlvbnMuX2FzQ29tcG9uZW50KSB7XG4gICAgICAvLyAyLiBjb250YWluZXIgYXR0cmlidXRlc1xuICAgICAgaWYgKGNvbnRhaW5lckF0dHJzICYmIGNvbnRleHRPcHRpb25zKSB7XG4gICAgICAgIGNvbnRleHRMaW5rRm4gPSBjb21waWxlRGlyZWN0aXZlcyhjb250YWluZXJBdHRycywgY29udGV4dE9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgaWYgKHJlcGxhY2VyQXR0cnMpIHtcbiAgICAgICAgLy8gMy4gcmVwbGFjZXIgYXR0cmlidXRlc1xuICAgICAgICByZXBsYWNlckxpbmtGbiA9IGNvbXBpbGVEaXJlY3RpdmVzKHJlcGxhY2VyQXR0cnMsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBub24tY29tcG9uZW50LCBqdXN0IGNvbXBpbGUgYXMgYSBub3JtYWwgZWxlbWVudC5cbiAgICAgIHJlcGxhY2VyTGlua0ZuID0gY29tcGlsZURpcmVjdGl2ZXMoZWwuYXR0cmlidXRlcywgb3B0aW9ucyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgY29udGFpbmVyQXR0cnMpIHtcbiAgICAvLyB3YXJuIGNvbnRhaW5lciBkaXJlY3RpdmVzIGZvciBmcmFnbWVudCBpbnN0YW5jZXNcbiAgICB2YXIgbmFtZXMgPSBjb250YWluZXJBdHRycy5maWx0ZXIoZnVuY3Rpb24gKGF0dHIpIHtcbiAgICAgIC8vIGFsbG93IHZ1ZS1sb2FkZXIvdnVlaWZ5IHNjb3BlZCBjc3MgYXR0cmlidXRlc1xuICAgICAgcmV0dXJuIGF0dHIubmFtZS5pbmRleE9mKCdfdi0nKSA8IDAgJiZcbiAgICAgIC8vIGFsbG93IGV2ZW50IGxpc3RlbmVyc1xuICAgICAgIW9uUkUudGVzdChhdHRyLm5hbWUpICYmXG4gICAgICAvLyBhbGxvdyBzbG90c1xuICAgICAgYXR0ci5uYW1lICE9PSAnc2xvdCc7XG4gICAgfSkubWFwKGZ1bmN0aW9uIChhdHRyKSB7XG4gICAgICByZXR1cm4gJ1wiJyArIGF0dHIubmFtZSArICdcIic7XG4gICAgfSk7XG4gICAgaWYgKG5hbWVzLmxlbmd0aCkge1xuICAgICAgdmFyIHBsdXJhbCA9IG5hbWVzLmxlbmd0aCA+IDE7XG4gICAgICB3YXJuKCdBdHRyaWJ1dGUnICsgKHBsdXJhbCA/ICdzICcgOiAnICcpICsgbmFtZXMuam9pbignLCAnKSArIChwbHVyYWwgPyAnIGFyZScgOiAnIGlzJykgKyAnIGlnbm9yZWQgb24gY29tcG9uZW50ICcgKyAnPCcgKyBvcHRpb25zLmVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSArICc+IGJlY2F1c2UgJyArICd0aGUgY29tcG9uZW50IGlzIGEgZnJhZ21lbnQgaW5zdGFuY2U6ICcgKyAnaHR0cDovL3Z1ZWpzLm9yZy9ndWlkZS9jb21wb25lbnRzLmh0bWwjRnJhZ21lbnQtSW5zdGFuY2UnKTtcbiAgICB9XG4gIH1cblxuICBvcHRpb25zLl9jb250YWluZXJBdHRycyA9IG9wdGlvbnMuX3JlcGxhY2VyQXR0cnMgPSBudWxsO1xuICByZXR1cm4gZnVuY3Rpb24gcm9vdExpbmtGbih2bSwgZWwsIHNjb3BlKSB7XG4gICAgLy8gbGluayBjb250ZXh0IHNjb3BlIGRpcnNcbiAgICB2YXIgY29udGV4dCA9IHZtLl9jb250ZXh0O1xuICAgIHZhciBjb250ZXh0RGlycztcbiAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0TGlua0ZuKSB7XG4gICAgICBjb250ZXh0RGlycyA9IGxpbmtBbmRDYXB0dXJlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29udGV4dExpbmtGbihjb250ZXh0LCBlbCwgbnVsbCwgc2NvcGUpO1xuICAgICAgfSwgY29udGV4dCk7XG4gICAgfVxuXG4gICAgLy8gbGluayBzZWxmXG4gICAgdmFyIHNlbGZEaXJzID0gbGlua0FuZENhcHR1cmUoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHJlcGxhY2VyTGlua0ZuKSByZXBsYWNlckxpbmtGbih2bSwgZWwpO1xuICAgIH0sIHZtKTtcblxuICAgIC8vIHJldHVybiB0aGUgdW5saW5rIGZ1bmN0aW9uIHRoYXQgdGVhcnNkb3duIGNvbnRleHRcbiAgICAvLyBjb250YWluZXIgZGlyZWN0aXZlcy5cbiAgICByZXR1cm4gbWFrZVVubGlua0ZuKHZtLCBzZWxmRGlycywgY29udGV4dCwgY29udGV4dERpcnMpO1xuICB9O1xufVxuXG4vKipcbiAqIENvbXBpbGUgYSBub2RlIGFuZCByZXR1cm4gYSBub2RlTGlua0ZuIGJhc2VkIG9uIHRoZVxuICogbm9kZSB0eXBlLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufG51bGx9XG4gKi9cblxuZnVuY3Rpb24gY29tcGlsZU5vZGUobm9kZSwgb3B0aW9ucykge1xuICB2YXIgdHlwZSA9IG5vZGUubm9kZVR5cGU7XG4gIGlmICh0eXBlID09PSAxICYmICFpc1NjcmlwdChub2RlKSkge1xuICAgIHJldHVybiBjb21waWxlRWxlbWVudChub2RlLCBvcHRpb25zKTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSAzICYmIG5vZGUuZGF0YS50cmltKCkpIHtcbiAgICByZXR1cm4gY29tcGlsZVRleHROb2RlKG5vZGUsIG9wdGlvbnMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogQ29tcGlsZSBhbiBlbGVtZW50IGFuZCByZXR1cm4gYSBub2RlTGlua0ZuLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtGdW5jdGlvbnxudWxsfVxuICovXG5cbmZ1bmN0aW9uIGNvbXBpbGVFbGVtZW50KGVsLCBvcHRpb25zKSB7XG4gIC8vIHByZXByb2Nlc3MgdGV4dGFyZWFzLlxuICAvLyB0ZXh0YXJlYSB0cmVhdHMgaXRzIHRleHQgY29udGVudCBhcyB0aGUgaW5pdGlhbCB2YWx1ZS5cbiAgLy8ganVzdCBiaW5kIGl0IGFzIGFuIGF0dHIgZGlyZWN0aXZlIGZvciB2YWx1ZS5cbiAgaWYgKGVsLnRhZ05hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICB2YXIgdG9rZW5zID0gcGFyc2VUZXh0KGVsLnZhbHVlKTtcbiAgICBpZiAodG9rZW5zKSB7XG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoJzp2YWx1ZScsIHRva2Vuc1RvRXhwKHRva2VucykpO1xuICAgICAgZWwudmFsdWUgPSAnJztcbiAgICB9XG4gIH1cbiAgdmFyIGxpbmtGbjtcbiAgdmFyIGhhc0F0dHJzID0gZWwuaGFzQXR0cmlidXRlcygpO1xuICB2YXIgYXR0cnMgPSBoYXNBdHRycyAmJiB0b0FycmF5KGVsLmF0dHJpYnV0ZXMpO1xuICAvLyBjaGVjayB0ZXJtaW5hbCBkaXJlY3RpdmVzIChmb3IgJiBpZilcbiAgaWYgKGhhc0F0dHJzKSB7XG4gICAgbGlua0ZuID0gY2hlY2tUZXJtaW5hbERpcmVjdGl2ZXMoZWwsIGF0dHJzLCBvcHRpb25zKTtcbiAgfVxuICAvLyBjaGVjayBlbGVtZW50IGRpcmVjdGl2ZXNcbiAgaWYgKCFsaW5rRm4pIHtcbiAgICBsaW5rRm4gPSBjaGVja0VsZW1lbnREaXJlY3RpdmVzKGVsLCBvcHRpb25zKTtcbiAgfVxuICAvLyBjaGVjayBjb21wb25lbnRcbiAgaWYgKCFsaW5rRm4pIHtcbiAgICBsaW5rRm4gPSBjaGVja0NvbXBvbmVudChlbCwgb3B0aW9ucyk7XG4gIH1cbiAgLy8gbm9ybWFsIGRpcmVjdGl2ZXNcbiAgaWYgKCFsaW5rRm4gJiYgaGFzQXR0cnMpIHtcbiAgICBsaW5rRm4gPSBjb21waWxlRGlyZWN0aXZlcyhhdHRycywgb3B0aW9ucyk7XG4gIH1cbiAgcmV0dXJuIGxpbmtGbjtcbn1cblxuLyoqXG4gKiBDb21waWxlIGEgdGV4dE5vZGUgYW5kIHJldHVybiBhIG5vZGVMaW5rRm4uXG4gKlxuICogQHBhcmFtIHtUZXh0Tm9kZX0gbm9kZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufG51bGx9IHRleHROb2RlTGlua0ZuXG4gKi9cblxuZnVuY3Rpb24gY29tcGlsZVRleHROb2RlKG5vZGUsIG9wdGlvbnMpIHtcbiAgLy8gc2tpcCBtYXJrZWQgdGV4dCBub2Rlc1xuICBpZiAobm9kZS5fc2tpcCkge1xuICAgIHJldHVybiByZW1vdmVUZXh0O1xuICB9XG5cbiAgdmFyIHRva2VucyA9IHBhcnNlVGV4dChub2RlLndob2xlVGV4dCk7XG4gIGlmICghdG9rZW5zKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBtYXJrIGFkamFjZW50IHRleHQgbm9kZXMgYXMgc2tpcHBlZCxcbiAgLy8gYmVjYXVzZSB3ZSBhcmUgdXNpbmcgbm9kZS53aG9sZVRleHQgdG8gY29tcGlsZVxuICAvLyBhbGwgYWRqYWNlbnQgdGV4dCBub2RlcyB0b2dldGhlci4gVGhpcyBmaXhlc1xuICAvLyBpc3N1ZXMgaW4gSUUgd2hlcmUgc29tZXRpbWVzIGl0IHNwbGl0cyB1cCBhIHNpbmdsZVxuICAvLyB0ZXh0IG5vZGUgaW50byBtdWx0aXBsZSBvbmVzLlxuICB2YXIgbmV4dCA9IG5vZGUubmV4dFNpYmxpbmc7XG4gIHdoaWxlIChuZXh0ICYmIG5leHQubm9kZVR5cGUgPT09IDMpIHtcbiAgICBuZXh0Ll9za2lwID0gdHJ1ZTtcbiAgICBuZXh0ID0gbmV4dC5uZXh0U2libGluZztcbiAgfVxuXG4gIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICB2YXIgZWwsIHRva2VuO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHRva2Vucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB0b2tlbiA9IHRva2Vuc1tpXTtcbiAgICBlbCA9IHRva2VuLnRhZyA/IHByb2Nlc3NUZXh0VG9rZW4odG9rZW4sIG9wdGlvbnMpIDogZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodG9rZW4udmFsdWUpO1xuICAgIGZyYWcuYXBwZW5kQ2hpbGQoZWwpO1xuICB9XG4gIHJldHVybiBtYWtlVGV4dE5vZGVMaW5rRm4odG9rZW5zLCBmcmFnLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBMaW5rZXIgZm9yIGFuIHNraXBwZWQgdGV4dCBub2RlLlxuICpcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICogQHBhcmFtIHtUZXh0fSBub2RlXG4gKi9cblxuZnVuY3Rpb24gcmVtb3ZlVGV4dCh2bSwgbm9kZSkge1xuICByZW1vdmUobm9kZSk7XG59XG5cbi8qKlxuICogUHJvY2VzcyBhIHNpbmdsZSB0ZXh0IHRva2VuLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB0b2tlblxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge05vZGV9XG4gKi9cblxuZnVuY3Rpb24gcHJvY2Vzc1RleHRUb2tlbih0b2tlbiwgb3B0aW9ucykge1xuICB2YXIgZWw7XG4gIGlmICh0b2tlbi5vbmVUaW1lKSB7XG4gICAgZWwgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0b2tlbi52YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHRva2VuLmh0bWwpIHtcbiAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgndi1odG1sJyk7XG4gICAgICBzZXRUb2tlblR5cGUoJ2h0bWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSUUgd2lsbCBjbGVhbiB1cCBlbXB0eSB0ZXh0Tm9kZXMgZHVyaW5nXG4gICAgICAvLyBmcmFnLmNsb25lTm9kZSh0cnVlKSwgc28gd2UgaGF2ZSB0byBnaXZlIGl0XG4gICAgICAvLyBzb21ldGhpbmcgaGVyZS4uLlxuICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnICcpO1xuICAgICAgc2V0VG9rZW5UeXBlKCd0ZXh0Jyk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHNldFRva2VuVHlwZSh0eXBlKSB7XG4gICAgaWYgKHRva2VuLmRlc2NyaXB0b3IpIHJldHVybjtcbiAgICB2YXIgcGFyc2VkID0gcGFyc2VEaXJlY3RpdmUodG9rZW4udmFsdWUpO1xuICAgIHRva2VuLmRlc2NyaXB0b3IgPSB7XG4gICAgICBuYW1lOiB0eXBlLFxuICAgICAgZGVmOiBkaXJlY3RpdmVzW3R5cGVdLFxuICAgICAgZXhwcmVzc2lvbjogcGFyc2VkLmV4cHJlc3Npb24sXG4gICAgICBmaWx0ZXJzOiBwYXJzZWQuZmlsdGVyc1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGVsO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgZnVuY3Rpb24gdGhhdCBwcm9jZXNzZXMgYSB0ZXh0Tm9kZS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PE9iamVjdD59IHRva2Vuc1xuICogQHBhcmFtIHtEb2N1bWVudEZyYWdtZW50fSBmcmFnXG4gKi9cblxuZnVuY3Rpb24gbWFrZVRleHROb2RlTGlua0ZuKHRva2VucywgZnJhZykge1xuICByZXR1cm4gZnVuY3Rpb24gdGV4dE5vZGVMaW5rRm4odm0sIGVsLCBob3N0LCBzY29wZSkge1xuICAgIHZhciBmcmFnQ2xvbmUgPSBmcmFnLmNsb25lTm9kZSh0cnVlKTtcbiAgICB2YXIgY2hpbGROb2RlcyA9IHRvQXJyYXkoZnJhZ0Nsb25lLmNoaWxkTm9kZXMpO1xuICAgIHZhciB0b2tlbiwgdmFsdWUsIG5vZGU7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0b2tlbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgIHZhbHVlID0gdG9rZW4udmFsdWU7XG4gICAgICBpZiAodG9rZW4udGFnKSB7XG4gICAgICAgIG5vZGUgPSBjaGlsZE5vZGVzW2ldO1xuICAgICAgICBpZiAodG9rZW4ub25lVGltZSkge1xuICAgICAgICAgIHZhbHVlID0gKHNjb3BlIHx8IHZtKS4kZXZhbCh2YWx1ZSk7XG4gICAgICAgICAgaWYgKHRva2VuLmh0bWwpIHtcbiAgICAgICAgICAgIHJlcGxhY2Uobm9kZSwgcGFyc2VUZW1wbGF0ZSh2YWx1ZSwgdHJ1ZSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub2RlLmRhdGEgPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdm0uX2JpbmREaXIodG9rZW4uZGVzY3JpcHRvciwgbm9kZSwgaG9zdCwgc2NvcGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJlcGxhY2UoZWwsIGZyYWdDbG9uZSk7XG4gIH07XG59XG5cbi8qKlxuICogQ29tcGlsZSBhIG5vZGUgbGlzdCBhbmQgcmV0dXJuIGEgY2hpbGRMaW5rRm4uXG4gKlxuICogQHBhcmFtIHtOb2RlTGlzdH0gbm9kZUxpc3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtGdW5jdGlvbnx1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gY29tcGlsZU5vZGVMaXN0KG5vZGVMaXN0LCBvcHRpb25zKSB7XG4gIHZhciBsaW5rRm5zID0gW107XG4gIHZhciBub2RlTGlua0ZuLCBjaGlsZExpbmtGbiwgbm9kZTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2RlTGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBub2RlID0gbm9kZUxpc3RbaV07XG4gICAgbm9kZUxpbmtGbiA9IGNvbXBpbGVOb2RlKG5vZGUsIG9wdGlvbnMpO1xuICAgIGNoaWxkTGlua0ZuID0gIShub2RlTGlua0ZuICYmIG5vZGVMaW5rRm4udGVybWluYWwpICYmIG5vZGUudGFnTmFtZSAhPT0gJ1NDUklQVCcgJiYgbm9kZS5oYXNDaGlsZE5vZGVzKCkgPyBjb21waWxlTm9kZUxpc3Qobm9kZS5jaGlsZE5vZGVzLCBvcHRpb25zKSA6IG51bGw7XG4gICAgbGlua0Zucy5wdXNoKG5vZGVMaW5rRm4sIGNoaWxkTGlua0ZuKTtcbiAgfVxuICByZXR1cm4gbGlua0Zucy5sZW5ndGggPyBtYWtlQ2hpbGRMaW5rRm4obGlua0ZucykgOiBudWxsO1xufVxuXG4vKipcbiAqIE1ha2UgYSBjaGlsZCBsaW5rIGZ1bmN0aW9uIGZvciBhIG5vZGUncyBjaGlsZE5vZGVzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8RnVuY3Rpb24+fSBsaW5rRm5zXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gY2hpbGRMaW5rRm5cbiAqL1xuXG5mdW5jdGlvbiBtYWtlQ2hpbGRMaW5rRm4obGlua0Zucykge1xuICByZXR1cm4gZnVuY3Rpb24gY2hpbGRMaW5rRm4odm0sIG5vZGVzLCBob3N0LCBzY29wZSwgZnJhZykge1xuICAgIHZhciBub2RlLCBub2RlTGlua0ZuLCBjaGlsZHJlbkxpbmtGbjtcbiAgICBmb3IgKHZhciBpID0gMCwgbiA9IDAsIGwgPSBsaW5rRm5zLmxlbmd0aDsgaSA8IGw7IG4rKykge1xuICAgICAgbm9kZSA9IG5vZGVzW25dO1xuICAgICAgbm9kZUxpbmtGbiA9IGxpbmtGbnNbaSsrXTtcbiAgICAgIGNoaWxkcmVuTGlua0ZuID0gbGlua0Zuc1tpKytdO1xuICAgICAgLy8gY2FjaGUgY2hpbGROb2RlcyBiZWZvcmUgbGlua2luZyBwYXJlbnQsIGZpeCAjNjU3XG4gICAgICB2YXIgY2hpbGROb2RlcyA9IHRvQXJyYXkobm9kZS5jaGlsZE5vZGVzKTtcbiAgICAgIGlmIChub2RlTGlua0ZuKSB7XG4gICAgICAgIG5vZGVMaW5rRm4odm0sIG5vZGUsIGhvc3QsIHNjb3BlLCBmcmFnKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGlsZHJlbkxpbmtGbikge1xuICAgICAgICBjaGlsZHJlbkxpbmtGbih2bSwgY2hpbGROb2RlcywgaG9zdCwgc2NvcGUsIGZyYWcpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBDaGVjayBmb3IgZWxlbWVudCBkaXJlY3RpdmVzIChjdXN0b20gZWxlbWVudHMgdGhhdCBzaG91bGRcbiAqIGJlIHJlc292bGVkIGFzIHRlcm1pbmFsIGRpcmVjdGl2ZXMpLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblxuZnVuY3Rpb24gY2hlY2tFbGVtZW50RGlyZWN0aXZlcyhlbCwgb3B0aW9ucykge1xuICB2YXIgdGFnID0gZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICBpZiAoY29tbW9uVGFnUkUudGVzdCh0YWcpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBkZWYgPSByZXNvbHZlQXNzZXQob3B0aW9ucywgJ2VsZW1lbnREaXJlY3RpdmVzJywgdGFnKTtcbiAgaWYgKGRlZikge1xuICAgIHJldHVybiBtYWtlVGVybWluYWxOb2RlTGlua0ZuKGVsLCB0YWcsICcnLCBvcHRpb25zLCBkZWYpO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYW4gZWxlbWVudCBpcyBhIGNvbXBvbmVudC4gSWYgeWVzLCByZXR1cm5cbiAqIGEgY29tcG9uZW50IGxpbmsgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufHVuZGVmaW5lZH1cbiAqL1xuXG5mdW5jdGlvbiBjaGVja0NvbXBvbmVudChlbCwgb3B0aW9ucykge1xuICB2YXIgY29tcG9uZW50ID0gY2hlY2tDb21wb25lbnRBdHRyKGVsLCBvcHRpb25zKTtcbiAgaWYgKGNvbXBvbmVudCkge1xuICAgIHZhciByZWYgPSBmaW5kUmVmKGVsKTtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHtcbiAgICAgIG5hbWU6ICdjb21wb25lbnQnLFxuICAgICAgcmVmOiByZWYsXG4gICAgICBleHByZXNzaW9uOiBjb21wb25lbnQuaWQsXG4gICAgICBkZWY6IGludGVybmFsRGlyZWN0aXZlcy5jb21wb25lbnQsXG4gICAgICBtb2RpZmllcnM6IHtcbiAgICAgICAgbGl0ZXJhbDogIWNvbXBvbmVudC5keW5hbWljXG4gICAgICB9XG4gICAgfTtcbiAgICB2YXIgY29tcG9uZW50TGlua0ZuID0gZnVuY3Rpb24gY29tcG9uZW50TGlua0ZuKHZtLCBlbCwgaG9zdCwgc2NvcGUsIGZyYWcpIHtcbiAgICAgIGlmIChyZWYpIHtcbiAgICAgICAgZGVmaW5lUmVhY3RpdmUoKHNjb3BlIHx8IHZtKS4kcmVmcywgcmVmLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIHZtLl9iaW5kRGlyKGRlc2NyaXB0b3IsIGVsLCBob3N0LCBzY29wZSwgZnJhZyk7XG4gICAgfTtcbiAgICBjb21wb25lbnRMaW5rRm4udGVybWluYWwgPSB0cnVlO1xuICAgIHJldHVybiBjb21wb25lbnRMaW5rRm47XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVjayBhbiBlbGVtZW50IGZvciB0ZXJtaW5hbCBkaXJlY3RpdmVzIGluIGZpeGVkIG9yZGVyLlxuICogSWYgaXQgZmluZHMgb25lLCByZXR1cm4gYSB0ZXJtaW5hbCBsaW5rIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7QXJyYXl9IGF0dHJzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7RnVuY3Rpb259IHRlcm1pbmFsTGlua0ZuXG4gKi9cblxuZnVuY3Rpb24gY2hlY2tUZXJtaW5hbERpcmVjdGl2ZXMoZWwsIGF0dHJzLCBvcHRpb25zKSB7XG4gIC8vIHNraXAgdi1wcmVcbiAgaWYgKGdldEF0dHIoZWwsICd2LXByZScpICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIHNraXA7XG4gIH1cbiAgLy8gc2tpcCB2LWVsc2UgYmxvY2ssIGJ1dCBvbmx5IGlmIGZvbGxvd2luZyB2LWlmXG4gIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ3YtZWxzZScpKSB7XG4gICAgdmFyIHByZXYgPSBlbC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgIGlmIChwcmV2ICYmIHByZXYuaGFzQXR0cmlidXRlKCd2LWlmJykpIHtcbiAgICAgIHJldHVybiBza2lwO1xuICAgIH1cbiAgfVxuXG4gIHZhciBhdHRyLCBuYW1lLCB2YWx1ZSwgbW9kaWZpZXJzLCBtYXRjaGVkLCBkaXJOYW1lLCByYXdOYW1lLCBhcmcsIGRlZiwgdGVybURlZjtcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBhdHRycy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICBhdHRyID0gYXR0cnNbaV07XG4gICAgbmFtZSA9IGF0dHIubmFtZS5yZXBsYWNlKG1vZGlmaWVyUkUsICcnKTtcbiAgICBpZiAobWF0Y2hlZCA9IG5hbWUubWF0Y2goZGlyQXR0clJFKSkge1xuICAgICAgZGVmID0gcmVzb2x2ZUFzc2V0KG9wdGlvbnMsICdkaXJlY3RpdmVzJywgbWF0Y2hlZFsxXSk7XG4gICAgICBpZiAoZGVmICYmIGRlZi50ZXJtaW5hbCkge1xuICAgICAgICBpZiAoIXRlcm1EZWYgfHwgKGRlZi5wcmlvcml0eSB8fCBERUZBVUxUX1RFUk1JTkFMX1BSSU9SSVRZKSA+IHRlcm1EZWYucHJpb3JpdHkpIHtcbiAgICAgICAgICB0ZXJtRGVmID0gZGVmO1xuICAgICAgICAgIHJhd05hbWUgPSBhdHRyLm5hbWU7XG4gICAgICAgICAgbW9kaWZpZXJzID0gcGFyc2VNb2RpZmllcnMoYXR0ci5uYW1lKTtcbiAgICAgICAgICB2YWx1ZSA9IGF0dHIudmFsdWU7XG4gICAgICAgICAgZGlyTmFtZSA9IG1hdGNoZWRbMV07XG4gICAgICAgICAgYXJnID0gbWF0Y2hlZFsyXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmICh0ZXJtRGVmKSB7XG4gICAgcmV0dXJuIG1ha2VUZXJtaW5hbE5vZGVMaW5rRm4oZWwsIGRpck5hbWUsIHZhbHVlLCBvcHRpb25zLCB0ZXJtRGVmLCByYXdOYW1lLCBhcmcsIG1vZGlmaWVycyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2tpcCgpIHt9XG5za2lwLnRlcm1pbmFsID0gdHJ1ZTtcblxuLyoqXG4gKiBCdWlsZCBhIG5vZGUgbGluayBmdW5jdGlvbiBmb3IgYSB0ZXJtaW5hbCBkaXJlY3RpdmUuXG4gKiBBIHRlcm1pbmFsIGxpbmsgZnVuY3Rpb24gdGVybWluYXRlcyB0aGUgY3VycmVudFxuICogY29tcGlsYXRpb24gcmVjdXJzaW9uIGFuZCBoYW5kbGVzIGNvbXBpbGF0aW9uIG9mIHRoZVxuICogc3VidHJlZSBpbiB0aGUgZGlyZWN0aXZlLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBkaXJOYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmXG4gKiBAcGFyYW0ge1N0cmluZ30gW3Jhd05hbWVdXG4gKiBAcGFyYW0ge1N0cmluZ30gW2FyZ11cbiAqIEBwYXJhbSB7T2JqZWN0fSBbbW9kaWZpZXJzXVxuICogQHJldHVybiB7RnVuY3Rpb259IHRlcm1pbmFsTGlua0ZuXG4gKi9cblxuZnVuY3Rpb24gbWFrZVRlcm1pbmFsTm9kZUxpbmtGbihlbCwgZGlyTmFtZSwgdmFsdWUsIG9wdGlvbnMsIGRlZiwgcmF3TmFtZSwgYXJnLCBtb2RpZmllcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHBhcnNlRGlyZWN0aXZlKHZhbHVlKTtcbiAgdmFyIGRlc2NyaXB0b3IgPSB7XG4gICAgbmFtZTogZGlyTmFtZSxcbiAgICBhcmc6IGFyZyxcbiAgICBleHByZXNzaW9uOiBwYXJzZWQuZXhwcmVzc2lvbixcbiAgICBmaWx0ZXJzOiBwYXJzZWQuZmlsdGVycyxcbiAgICByYXc6IHZhbHVlLFxuICAgIGF0dHI6IHJhd05hbWUsXG4gICAgbW9kaWZpZXJzOiBtb2RpZmllcnMsXG4gICAgZGVmOiBkZWZcbiAgfTtcbiAgLy8gY2hlY2sgcmVmIGZvciB2LWZvciBhbmQgcm91dGVyLXZpZXdcbiAgaWYgKGRpck5hbWUgPT09ICdmb3InIHx8IGRpck5hbWUgPT09ICdyb3V0ZXItdmlldycpIHtcbiAgICBkZXNjcmlwdG9yLnJlZiA9IGZpbmRSZWYoZWwpO1xuICB9XG4gIHZhciBmbiA9IGZ1bmN0aW9uIHRlcm1pbmFsTm9kZUxpbmtGbih2bSwgZWwsIGhvc3QsIHNjb3BlLCBmcmFnKSB7XG4gICAgaWYgKGRlc2NyaXB0b3IucmVmKSB7XG4gICAgICBkZWZpbmVSZWFjdGl2ZSgoc2NvcGUgfHwgdm0pLiRyZWZzLCBkZXNjcmlwdG9yLnJlZiwgbnVsbCk7XG4gICAgfVxuICAgIHZtLl9iaW5kRGlyKGRlc2NyaXB0b3IsIGVsLCBob3N0LCBzY29wZSwgZnJhZyk7XG4gIH07XG4gIGZuLnRlcm1pbmFsID0gdHJ1ZTtcbiAgcmV0dXJuIGZuO1xufVxuXG4vKipcbiAqIENvbXBpbGUgdGhlIGRpcmVjdGl2ZXMgb24gYW4gZWxlbWVudCBhbmQgcmV0dXJuIGEgbGlua2VyLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl8TmFtZWROb2RlTWFwfSBhdHRyc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIGNvbXBpbGVEaXJlY3RpdmVzKGF0dHJzLCBvcHRpb25zKSB7XG4gIHZhciBpID0gYXR0cnMubGVuZ3RoO1xuICB2YXIgZGlycyA9IFtdO1xuICB2YXIgYXR0ciwgbmFtZSwgdmFsdWUsIHJhd05hbWUsIHJhd1ZhbHVlLCBkaXJOYW1lLCBhcmcsIG1vZGlmaWVycywgZGlyRGVmLCB0b2tlbnMsIG1hdGNoZWQ7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBhdHRyID0gYXR0cnNbaV07XG4gICAgbmFtZSA9IHJhd05hbWUgPSBhdHRyLm5hbWU7XG4gICAgdmFsdWUgPSByYXdWYWx1ZSA9IGF0dHIudmFsdWU7XG4gICAgdG9rZW5zID0gcGFyc2VUZXh0KHZhbHVlKTtcbiAgICAvLyByZXNldCBhcmdcbiAgICBhcmcgPSBudWxsO1xuICAgIC8vIGNoZWNrIG1vZGlmaWVyc1xuICAgIG1vZGlmaWVycyA9IHBhcnNlTW9kaWZpZXJzKG5hbWUpO1xuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UobW9kaWZpZXJSRSwgJycpO1xuXG4gICAgLy8gYXR0cmlidXRlIGludGVycG9sYXRpb25zXG4gICAgaWYgKHRva2Vucykge1xuICAgICAgdmFsdWUgPSB0b2tlbnNUb0V4cCh0b2tlbnMpO1xuICAgICAgYXJnID0gbmFtZTtcbiAgICAgIHB1c2hEaXIoJ2JpbmQnLCBkaXJlY3RpdmVzLmJpbmQsIHRva2Vucyk7XG4gICAgICAvLyB3YXJuIGFnYWluc3QgbWl4aW5nIG11c3RhY2hlcyB3aXRoIHYtYmluZFxuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgaWYgKG5hbWUgPT09ICdjbGFzcycgJiYgQXJyYXkucHJvdG90eXBlLnNvbWUuY2FsbChhdHRycywgZnVuY3Rpb24gKGF0dHIpIHtcbiAgICAgICAgICByZXR1cm4gYXR0ci5uYW1lID09PSAnOmNsYXNzJyB8fCBhdHRyLm5hbWUgPT09ICd2LWJpbmQ6Y2xhc3MnO1xuICAgICAgICB9KSkge1xuICAgICAgICAgIHdhcm4oJ2NsYXNzPVwiJyArIHJhd1ZhbHVlICsgJ1wiOiBEbyBub3QgbWl4IG11c3RhY2hlIGludGVycG9sYXRpb24gJyArICdhbmQgdi1iaW5kIGZvciBcImNsYXNzXCIgb24gdGhlIHNhbWUgZWxlbWVudC4gVXNlIG9uZSBvciB0aGUgb3RoZXIuJywgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2VcblxuICAgICAgLy8gc3BlY2lhbCBhdHRyaWJ1dGU6IHRyYW5zaXRpb25cbiAgICAgIGlmICh0cmFuc2l0aW9uUkUudGVzdChuYW1lKSkge1xuICAgICAgICBtb2RpZmllcnMubGl0ZXJhbCA9ICFiaW5kUkUudGVzdChuYW1lKTtcbiAgICAgICAgcHVzaERpcigndHJhbnNpdGlvbicsIGludGVybmFsRGlyZWN0aXZlcy50cmFuc2l0aW9uKTtcbiAgICAgIH0gZWxzZVxuXG4gICAgICAgIC8vIGV2ZW50IGhhbmRsZXJzXG4gICAgICAgIGlmIChvblJFLnRlc3QobmFtZSkpIHtcbiAgICAgICAgICBhcmcgPSBuYW1lLnJlcGxhY2Uob25SRSwgJycpO1xuICAgICAgICAgIHB1c2hEaXIoJ29uJywgZGlyZWN0aXZlcy5vbik7XG4gICAgICAgIH0gZWxzZVxuXG4gICAgICAgICAgLy8gYXR0cmlidXRlIGJpbmRpbmdzXG4gICAgICAgICAgaWYgKGJpbmRSRS50ZXN0KG5hbWUpKSB7XG4gICAgICAgICAgICBkaXJOYW1lID0gbmFtZS5yZXBsYWNlKGJpbmRSRSwgJycpO1xuICAgICAgICAgICAgaWYgKGRpck5hbWUgPT09ICdzdHlsZScgfHwgZGlyTmFtZSA9PT0gJ2NsYXNzJykge1xuICAgICAgICAgICAgICBwdXNoRGlyKGRpck5hbWUsIGludGVybmFsRGlyZWN0aXZlc1tkaXJOYW1lXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBhcmcgPSBkaXJOYW1lO1xuICAgICAgICAgICAgICBwdXNoRGlyKCdiaW5kJywgZGlyZWN0aXZlcy5iaW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2VcblxuICAgICAgICAgICAgLy8gbm9ybWFsIGRpcmVjdGl2ZXNcbiAgICAgICAgICAgIGlmIChtYXRjaGVkID0gbmFtZS5tYXRjaChkaXJBdHRyUkUpKSB7XG4gICAgICAgICAgICAgIGRpck5hbWUgPSBtYXRjaGVkWzFdO1xuICAgICAgICAgICAgICBhcmcgPSBtYXRjaGVkWzJdO1xuXG4gICAgICAgICAgICAgIC8vIHNraXAgdi1lbHNlICh3aGVuIHVzZWQgd2l0aCB2LXNob3cpXG4gICAgICAgICAgICAgIGlmIChkaXJOYW1lID09PSAnZWxzZScpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGRpckRlZiA9IHJlc29sdmVBc3NldChvcHRpb25zLCAnZGlyZWN0aXZlcycsIGRpck5hbWUsIHRydWUpO1xuICAgICAgICAgICAgICBpZiAoZGlyRGVmKSB7XG4gICAgICAgICAgICAgICAgcHVzaERpcihkaXJOYW1lLCBkaXJEZWYpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHVzaCBhIGRpcmVjdGl2ZS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRpck5hbWVcbiAgICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IGRlZlxuICAgKiBAcGFyYW0ge0FycmF5fSBbaW50ZXJwVG9rZW5zXVxuICAgKi9cblxuICBmdW5jdGlvbiBwdXNoRGlyKGRpck5hbWUsIGRlZiwgaW50ZXJwVG9rZW5zKSB7XG4gICAgdmFyIGhhc09uZVRpbWVUb2tlbiA9IGludGVycFRva2VucyAmJiBoYXNPbmVUaW1lKGludGVycFRva2Vucyk7XG4gICAgdmFyIHBhcnNlZCA9ICFoYXNPbmVUaW1lVG9rZW4gJiYgcGFyc2VEaXJlY3RpdmUodmFsdWUpO1xuICAgIGRpcnMucHVzaCh7XG4gICAgICBuYW1lOiBkaXJOYW1lLFxuICAgICAgYXR0cjogcmF3TmFtZSxcbiAgICAgIHJhdzogcmF3VmFsdWUsXG4gICAgICBkZWY6IGRlZixcbiAgICAgIGFyZzogYXJnLFxuICAgICAgbW9kaWZpZXJzOiBtb2RpZmllcnMsXG4gICAgICAvLyBjb252ZXJzaW9uIGZyb20gaW50ZXJwb2xhdGlvbiBzdHJpbmdzIHdpdGggb25lLXRpbWUgdG9rZW5cbiAgICAgIC8vIHRvIGV4cHJlc3Npb24gaXMgZGlmZmVyZWQgdW50aWwgZGlyZWN0aXZlIGJpbmQgdGltZSBzbyB0aGF0IHdlXG4gICAgICAvLyBoYXZlIGFjY2VzcyB0byB0aGUgYWN0dWFsIHZtIGNvbnRleHQgZm9yIG9uZS10aW1lIGJpbmRpbmdzLlxuICAgICAgZXhwcmVzc2lvbjogcGFyc2VkICYmIHBhcnNlZC5leHByZXNzaW9uLFxuICAgICAgZmlsdGVyczogcGFyc2VkICYmIHBhcnNlZC5maWx0ZXJzLFxuICAgICAgaW50ZXJwOiBpbnRlcnBUb2tlbnMsXG4gICAgICBoYXNPbmVUaW1lOiBoYXNPbmVUaW1lVG9rZW5cbiAgICB9KTtcbiAgfVxuXG4gIGlmIChkaXJzLmxlbmd0aCkge1xuICAgIHJldHVybiBtYWtlTm9kZUxpbmtGbihkaXJzKTtcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlIG1vZGlmaWVycyBmcm9tIGRpcmVjdGl2ZSBhdHRyaWJ1dGUgbmFtZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlTW9kaWZpZXJzKG5hbWUpIHtcbiAgdmFyIHJlcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHZhciBtYXRjaCA9IG5hbWUubWF0Y2gobW9kaWZpZXJSRSk7XG4gIGlmIChtYXRjaCkge1xuICAgIHZhciBpID0gbWF0Y2gubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHJlc1ttYXRjaFtpXS5zbGljZSgxKV0gPSB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgbGluayBmdW5jdGlvbiBmb3IgYWxsIGRpcmVjdGl2ZXMgb24gYSBzaW5nbGUgbm9kZS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBkaXJlY3RpdmVzXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gZGlyZWN0aXZlc0xpbmtGblxuICovXG5cbmZ1bmN0aW9uIG1ha2VOb2RlTGlua0ZuKGRpcmVjdGl2ZXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG5vZGVMaW5rRm4odm0sIGVsLCBob3N0LCBzY29wZSwgZnJhZykge1xuICAgIC8vIHJldmVyc2UgYXBwbHkgYmVjYXVzZSBpdCdzIHNvcnRlZCBsb3cgdG8gaGlnaFxuICAgIHZhciBpID0gZGlyZWN0aXZlcy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdm0uX2JpbmREaXIoZGlyZWN0aXZlc1tpXSwgZWwsIGhvc3QsIHNjb3BlLCBmcmFnKTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYW4gaW50ZXJwb2xhdGlvbiBzdHJpbmcgY29udGFpbnMgb25lLXRpbWUgdG9rZW5zLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHRva2Vuc1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBoYXNPbmVUaW1lKHRva2Vucykge1xuICB2YXIgaSA9IHRva2Vucy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBpZiAodG9rZW5zW2ldLm9uZVRpbWUpIHJldHVybiB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzU2NyaXB0KGVsKSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnU0NSSVBUJyAmJiAoIWVsLmhhc0F0dHJpYnV0ZSgndHlwZScpIHx8IGVsLmdldEF0dHJpYnV0ZSgndHlwZScpID09PSAndGV4dC9qYXZhc2NyaXB0Jyk7XG59XG5cbnZhciBzcGVjaWFsQ2hhclJFID0gL1teXFx3XFwtOlxcLl0vO1xuXG4vKipcbiAqIFByb2Nlc3MgYW4gZWxlbWVudCBvciBhIERvY3VtZW50RnJhZ21lbnQgYmFzZWQgb24gYVxuICogaW5zdGFuY2Ugb3B0aW9uIG9iamVjdC4gVGhpcyBhbGxvd3MgdXMgdG8gdHJhbnNjbHVkZVxuICogYSB0ZW1wbGF0ZSBub2RlL2ZyYWdtZW50IGJlZm9yZSB0aGUgaW5zdGFuY2UgaXMgY3JlYXRlZCxcbiAqIHNvIHRoZSBwcm9jZXNzZWQgZnJhZ21lbnQgY2FuIHRoZW4gYmUgY2xvbmVkIGFuZCByZXVzZWRcbiAqIGluIHYtZm9yLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtFbGVtZW50fERvY3VtZW50RnJhZ21lbnR9XG4gKi9cblxuZnVuY3Rpb24gdHJhbnNjbHVkZShlbCwgb3B0aW9ucykge1xuICAvLyBleHRyYWN0IGNvbnRhaW5lciBhdHRyaWJ1dGVzIHRvIHBhc3MgdGhlbSBkb3duXG4gIC8vIHRvIGNvbXBpbGVyLCBiZWNhdXNlIHRoZXkgbmVlZCB0byBiZSBjb21waWxlZCBpblxuICAvLyBwYXJlbnQgc2NvcGUuIHdlIGFyZSBtdXRhdGluZyB0aGUgb3B0aW9ucyBvYmplY3QgaGVyZVxuICAvLyBhc3N1bWluZyB0aGUgc2FtZSBvYmplY3Qgd2lsbCBiZSB1c2VkIGZvciBjb21waWxlXG4gIC8vIHJpZ2h0IGFmdGVyIHRoaXMuXG4gIGlmIChvcHRpb25zKSB7XG4gICAgb3B0aW9ucy5fY29udGFpbmVyQXR0cnMgPSBleHRyYWN0QXR0cnMoZWwpO1xuICB9XG4gIC8vIGZvciB0ZW1wbGF0ZSB0YWdzLCB3aGF0IHdlIHdhbnQgaXMgaXRzIGNvbnRlbnQgYXNcbiAgLy8gYSBkb2N1bWVudEZyYWdtZW50IChmb3IgZnJhZ21lbnQgaW5zdGFuY2VzKVxuICBpZiAoaXNUZW1wbGF0ZShlbCkpIHtcbiAgICBlbCA9IHBhcnNlVGVtcGxhdGUoZWwpO1xuICB9XG4gIGlmIChvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuX2FzQ29tcG9uZW50ICYmICFvcHRpb25zLnRlbXBsYXRlKSB7XG4gICAgICBvcHRpb25zLnRlbXBsYXRlID0gJzxzbG90Pjwvc2xvdD4nO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy50ZW1wbGF0ZSkge1xuICAgICAgb3B0aW9ucy5fY29udGVudCA9IGV4dHJhY3RDb250ZW50KGVsKTtcbiAgICAgIGVsID0gdHJhbnNjbHVkZVRlbXBsYXRlKGVsLCBvcHRpb25zKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzRnJhZ21lbnQoZWwpKSB7XG4gICAgLy8gYW5jaG9ycyBmb3IgZnJhZ21lbnQgaW5zdGFuY2VcbiAgICAvLyBwYXNzaW5nIGluIGBwZXJzaXN0OiB0cnVlYCB0byBhdm9pZCB0aGVtIGJlaW5nXG4gICAgLy8gZGlzY2FyZGVkIGJ5IElFIGR1cmluZyB0ZW1wbGF0ZSBjbG9uaW5nXG4gICAgcHJlcGVuZChjcmVhdGVBbmNob3IoJ3Ytc3RhcnQnLCB0cnVlKSwgZWwpO1xuICAgIGVsLmFwcGVuZENoaWxkKGNyZWF0ZUFuY2hvcigndi1lbmQnLCB0cnVlKSk7XG4gIH1cbiAgcmV0dXJuIGVsO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgdGhlIHRlbXBsYXRlIG9wdGlvbi5cbiAqIElmIHRoZSByZXBsYWNlIG9wdGlvbiBpcyB0cnVlIHRoaXMgd2lsbCBzd2FwIHRoZSAkZWwuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0VsZW1lbnR8RG9jdW1lbnRGcmFnbWVudH1cbiAqL1xuXG5mdW5jdGlvbiB0cmFuc2NsdWRlVGVtcGxhdGUoZWwsIG9wdGlvbnMpIHtcbiAgdmFyIHRlbXBsYXRlID0gb3B0aW9ucy50ZW1wbGF0ZTtcbiAgdmFyIGZyYWcgPSBwYXJzZVRlbXBsYXRlKHRlbXBsYXRlLCB0cnVlKTtcbiAgaWYgKGZyYWcpIHtcbiAgICB2YXIgcmVwbGFjZXIgPSBmcmFnLmZpcnN0Q2hpbGQ7XG4gICAgdmFyIHRhZyA9IHJlcGxhY2VyLnRhZ05hbWUgJiYgcmVwbGFjZXIudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChvcHRpb25zLnJlcGxhY2UpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKGVsID09PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignWW91IGFyZSBtb3VudGluZyBhbiBpbnN0YW5jZSB3aXRoIGEgdGVtcGxhdGUgdG8gJyArICc8Ym9keT4uIFRoaXMgd2lsbCByZXBsYWNlIDxib2R5PiBlbnRpcmVseS4gWW91ICcgKyAnc2hvdWxkIHByb2JhYmx5IHVzZSBgcmVwbGFjZTogZmFsc2VgIGhlcmUuJyk7XG4gICAgICB9XG4gICAgICAvLyB0aGVyZSBhcmUgbWFueSBjYXNlcyB3aGVyZSB0aGUgaW5zdGFuY2UgbXVzdFxuICAgICAgLy8gYmVjb21lIGEgZnJhZ21lbnQgaW5zdGFuY2U6IGJhc2ljYWxseSBhbnl0aGluZyB0aGF0XG4gICAgICAvLyBjYW4gY3JlYXRlIG1vcmUgdGhhbiAxIHJvb3Qgbm9kZXMuXG4gICAgICBpZiAoXG4gICAgICAvLyBtdWx0aS1jaGlsZHJlbiB0ZW1wbGF0ZVxuICAgICAgZnJhZy5jaGlsZE5vZGVzLmxlbmd0aCA+IDEgfHxcbiAgICAgIC8vIG5vbi1lbGVtZW50IHRlbXBsYXRlXG4gICAgICByZXBsYWNlci5ub2RlVHlwZSAhPT0gMSB8fFxuICAgICAgLy8gc2luZ2xlIG5lc3RlZCBjb21wb25lbnRcbiAgICAgIHRhZyA9PT0gJ2NvbXBvbmVudCcgfHwgcmVzb2x2ZUFzc2V0KG9wdGlvbnMsICdjb21wb25lbnRzJywgdGFnKSB8fCBoYXNCaW5kQXR0cihyZXBsYWNlciwgJ2lzJykgfHxcbiAgICAgIC8vIGVsZW1lbnQgZGlyZWN0aXZlXG4gICAgICByZXNvbHZlQXNzZXQob3B0aW9ucywgJ2VsZW1lbnREaXJlY3RpdmVzJywgdGFnKSB8fFxuICAgICAgLy8gZm9yIGJsb2NrXG4gICAgICByZXBsYWNlci5oYXNBdHRyaWJ1dGUoJ3YtZm9yJykgfHxcbiAgICAgIC8vIGlmIGJsb2NrXG4gICAgICByZXBsYWNlci5oYXNBdHRyaWJ1dGUoJ3YtaWYnKSkge1xuICAgICAgICByZXR1cm4gZnJhZztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wdGlvbnMuX3JlcGxhY2VyQXR0cnMgPSBleHRyYWN0QXR0cnMocmVwbGFjZXIpO1xuICAgICAgICBtZXJnZUF0dHJzKGVsLCByZXBsYWNlcik7XG4gICAgICAgIHJldHVybiByZXBsYWNlcjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWwuYXBwZW5kQ2hpbGQoZnJhZyk7XG4gICAgICByZXR1cm4gZWw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignSW52YWxpZCB0ZW1wbGF0ZSBvcHRpb246ICcgKyB0ZW1wbGF0ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgdG8gZXh0cmFjdCBhIGNvbXBvbmVudCBjb250YWluZXIncyBhdHRyaWJ1dGVzXG4gKiBpbnRvIGEgcGxhaW4gb2JqZWN0IGFycmF5LlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIGV4dHJhY3RBdHRycyhlbCkge1xuICBpZiAoZWwubm9kZVR5cGUgPT09IDEgJiYgZWwuaGFzQXR0cmlidXRlcygpKSB7XG4gICAgcmV0dXJuIHRvQXJyYXkoZWwuYXR0cmlidXRlcyk7XG4gIH1cbn1cblxuLyoqXG4gKiBNZXJnZSB0aGUgYXR0cmlidXRlcyBvZiB0d28gZWxlbWVudHMsIGFuZCBtYWtlIHN1cmVcbiAqIHRoZSBjbGFzcyBuYW1lcyBhcmUgbWVyZ2VkIHByb3Blcmx5LlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZnJvbVxuICogQHBhcmFtIHtFbGVtZW50fSB0b1xuICovXG5cbmZ1bmN0aW9uIG1lcmdlQXR0cnMoZnJvbSwgdG8pIHtcbiAgdmFyIGF0dHJzID0gZnJvbS5hdHRyaWJ1dGVzO1xuICB2YXIgaSA9IGF0dHJzLmxlbmd0aDtcbiAgdmFyIG5hbWUsIHZhbHVlO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgbmFtZSA9IGF0dHJzW2ldLm5hbWU7XG4gICAgdmFsdWUgPSBhdHRyc1tpXS52YWx1ZTtcbiAgICBpZiAoIXRvLmhhc0F0dHJpYnV0ZShuYW1lKSAmJiAhc3BlY2lhbENoYXJSRS50ZXN0KG5hbWUpKSB7XG4gICAgICB0by5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ2NsYXNzJyAmJiAhcGFyc2VUZXh0KHZhbHVlKSAmJiAodmFsdWUgPSB2YWx1ZS50cmltKCkpKSB7XG4gICAgICB2YWx1ZS5zcGxpdCgvXFxzKy8pLmZvckVhY2goZnVuY3Rpb24gKGNscykge1xuICAgICAgICBhZGRDbGFzcyh0bywgY2xzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFNjYW4gYW5kIGRldGVybWluZSBzbG90IGNvbnRlbnQgZGlzdHJpYnV0aW9uLlxuICogV2UgZG8gdGhpcyBkdXJpbmcgdHJhbnNjbHVzaW9uIGluc3RlYWQgYXQgY29tcGlsZSB0aW1lIHNvIHRoYXRcbiAqIHRoZSBkaXN0cmlidXRpb24gaXMgZGVjb3VwbGVkIGZyb20gdGhlIGNvbXBpbGF0aW9uIG9yZGVyIG9mXG4gKiB0aGUgc2xvdHMuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fERvY3VtZW50RnJhZ21lbnR9IHRlbXBsYXRlXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRlbnRcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICovXG5cbmZ1bmN0aW9uIHJlc29sdmVTbG90cyh2bSwgY29udGVudCkge1xuICBpZiAoIWNvbnRlbnQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGNvbnRlbnRzID0gdm0uX3Nsb3RDb250ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHZhciBlbCwgbmFtZTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBjb250ZW50LmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGVsID0gY29udGVudC5jaGlsZHJlbltpXTtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25kLWFzc2lnbiAqL1xuICAgIGlmIChuYW1lID0gZWwuZ2V0QXR0cmlidXRlKCdzbG90JykpIHtcbiAgICAgIChjb250ZW50c1tuYW1lXSB8fCAoY29udGVudHNbbmFtZV0gPSBbXSkpLnB1c2goZWwpO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbmQtYXNzaWduICovXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgZ2V0QmluZEF0dHIoZWwsICdzbG90JykpIHtcbiAgICAgIHdhcm4oJ1RoZSBcInNsb3RcIiBhdHRyaWJ1dGUgbXVzdCBiZSBzdGF0aWMuJywgdm0uJHBhcmVudCk7XG4gICAgfVxuICB9XG4gIGZvciAobmFtZSBpbiBjb250ZW50cykge1xuICAgIGNvbnRlbnRzW25hbWVdID0gZXh0cmFjdEZyYWdtZW50KGNvbnRlbnRzW25hbWVdLCBjb250ZW50KTtcbiAgfVxuICBpZiAoY29udGVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICB2YXIgbm9kZXMgPSBjb250ZW50LmNoaWxkTm9kZXM7XG4gICAgaWYgKG5vZGVzLmxlbmd0aCA9PT0gMSAmJiBub2Rlc1swXS5ub2RlVHlwZSA9PT0gMyAmJiAhbm9kZXNbMF0uZGF0YS50cmltKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29udGVudHNbJ2RlZmF1bHQnXSA9IGV4dHJhY3RGcmFnbWVudChjb250ZW50LmNoaWxkTm9kZXMsIGNvbnRlbnQpO1xuICB9XG59XG5cbi8qKlxuICogRXh0cmFjdCBxdWFsaWZpZWQgY29udGVudCBub2RlcyBmcm9tIGEgbm9kZSBsaXN0LlxuICpcbiAqIEBwYXJhbSB7Tm9kZUxpc3R9IG5vZGVzXG4gKiBAcmV0dXJuIHtEb2N1bWVudEZyYWdtZW50fVxuICovXG5cbmZ1bmN0aW9uIGV4dHJhY3RGcmFnbWVudChub2RlcywgcGFyZW50KSB7XG4gIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICBub2RlcyA9IHRvQXJyYXkobm9kZXMpO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IG5vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHZhciBub2RlID0gbm9kZXNbaV07XG4gICAgaWYgKGlzVGVtcGxhdGUobm9kZSkgJiYgIW5vZGUuaGFzQXR0cmlidXRlKCd2LWlmJykgJiYgIW5vZGUuaGFzQXR0cmlidXRlKCd2LWZvcicpKSB7XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICBub2RlID0gcGFyc2VUZW1wbGF0ZShub2RlLCB0cnVlKTtcbiAgICB9XG4gICAgZnJhZy5hcHBlbmRDaGlsZChub2RlKTtcbiAgfVxuICByZXR1cm4gZnJhZztcbn1cblxuXG5cbnZhciBjb21waWxlciA9IE9iamVjdC5mcmVlemUoe1xuXHRjb21waWxlOiBjb21waWxlLFxuXHRjb21waWxlQW5kTGlua1Byb3BzOiBjb21waWxlQW5kTGlua1Byb3BzLFxuXHRjb21waWxlUm9vdDogY29tcGlsZVJvb3QsXG5cdHRyYW5zY2x1ZGU6IHRyYW5zY2x1ZGUsXG5cdHJlc29sdmVTbG90czogcmVzb2x2ZVNsb3RzXG59KTtcblxuZnVuY3Rpb24gc3RhdGVNaXhpbiAoVnVlKSB7XG4gIC8qKlxuICAgKiBBY2Nlc3NvciBmb3IgYCRkYXRhYCBwcm9wZXJ0eSwgc2luY2Ugc2V0dGluZyAkZGF0YVxuICAgKiByZXF1aXJlcyBvYnNlcnZpbmcgdGhlIG5ldyBvYmplY3QgYW5kIHVwZGF0aW5nXG4gICAqIHByb3hpZWQgcHJvcGVydGllcy5cbiAgICovXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFZ1ZS5wcm90b3R5cGUsICckZGF0YScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kYXRhO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQobmV3RGF0YSkge1xuICAgICAgaWYgKG5ld0RhdGEgIT09IHRoaXMuX2RhdGEpIHtcbiAgICAgICAgdGhpcy5fc2V0RGF0YShuZXdEYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBTZXR1cCB0aGUgc2NvcGUgb2YgYW4gaW5zdGFuY2UsIHdoaWNoIGNvbnRhaW5zOlxuICAgKiAtIG9ic2VydmVkIGRhdGFcbiAgICogLSBjb21wdXRlZCBwcm9wZXJ0aWVzXG4gICAqIC0gdXNlciBtZXRob2RzXG4gICAqIC0gbWV0YSBwcm9wZXJ0aWVzXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuX2luaXRTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9pbml0UHJvcHMoKTtcbiAgICB0aGlzLl9pbml0TWV0YSgpO1xuICAgIHRoaXMuX2luaXRNZXRob2RzKCk7XG4gICAgdGhpcy5faW5pdERhdGEoKTtcbiAgICB0aGlzLl9pbml0Q29tcHV0ZWQoKTtcbiAgfTtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBwcm9wcy5cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5faW5pdFByb3BzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvcHRpb25zID0gdGhpcy4kb3B0aW9ucztcbiAgICB2YXIgZWwgPSBvcHRpb25zLmVsO1xuICAgIHZhciBwcm9wcyA9IG9wdGlvbnMucHJvcHM7XG4gICAgaWYgKHByb3BzICYmICFlbCkge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdQcm9wcyB3aWxsIG5vdCBiZSBjb21waWxlZCBpZiBubyBgZWxgIG9wdGlvbiBpcyAnICsgJ3Byb3ZpZGVkIGF0IGluc3RhbnRpYXRpb24uJywgdGhpcyk7XG4gICAgfVxuICAgIC8vIG1ha2Ugc3VyZSB0byBjb252ZXJ0IHN0cmluZyBzZWxlY3RvcnMgaW50byBlbGVtZW50IG5vd1xuICAgIGVsID0gb3B0aW9ucy5lbCA9IHF1ZXJ5KGVsKTtcbiAgICB0aGlzLl9wcm9wc1VubGlua0ZuID0gZWwgJiYgZWwubm9kZVR5cGUgPT09IDEgJiYgcHJvcHNcbiAgICAvLyBwcm9wcyBtdXN0IGJlIGxpbmtlZCBpbiBwcm9wZXIgc2NvcGUgaWYgaW5zaWRlIHYtZm9yXG4gICAgPyBjb21waWxlQW5kTGlua1Byb3BzKHRoaXMsIGVsLCBwcm9wcywgdGhpcy5fc2NvcGUpIDogbnVsbDtcbiAgfTtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSB0aGUgZGF0YS5cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5faW5pdERhdGEgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRhdGFGbiA9IHRoaXMuJG9wdGlvbnMuZGF0YTtcbiAgICB2YXIgZGF0YSA9IHRoaXMuX2RhdGEgPSBkYXRhRm4gPyBkYXRhRm4oKSA6IHt9O1xuICAgIGlmICghaXNQbGFpbk9iamVjdChkYXRhKSkge1xuICAgICAgZGF0YSA9IHt9O1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdkYXRhIGZ1bmN0aW9ucyBzaG91bGQgcmV0dXJuIGFuIG9iamVjdC4nLCB0aGlzKTtcbiAgICB9XG4gICAgdmFyIHByb3BzID0gdGhpcy5fcHJvcHM7XG4gICAgLy8gcHJveHkgZGF0YSBvbiBpbnN0YW5jZVxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZGF0YSk7XG4gICAgdmFyIGksIGtleTtcbiAgICBpID0ga2V5cy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgIC8vIHRoZXJlIGFyZSB0d28gc2NlbmFyaW9zIHdoZXJlIHdlIGNhbiBwcm94eSBhIGRhdGEga2V5OlxuICAgICAgLy8gMS4gaXQncyBub3QgYWxyZWFkeSBkZWZpbmVkIGFzIGEgcHJvcFxuICAgICAgLy8gMi4gaXQncyBwcm92aWRlZCB2aWEgYSBpbnN0YW50aWF0aW9uIG9wdGlvbiBBTkQgdGhlcmUgYXJlIG5vXG4gICAgICAvLyAgICB0ZW1wbGF0ZSBwcm9wIHByZXNlbnRcbiAgICAgIGlmICghcHJvcHMgfHwgIWhhc093bihwcm9wcywga2V5KSkge1xuICAgICAgICB0aGlzLl9wcm94eShrZXkpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIHdhcm4oJ0RhdGEgZmllbGQgXCInICsga2V5ICsgJ1wiIGlzIGFscmVhZHkgZGVmaW5lZCAnICsgJ2FzIGEgcHJvcC4gVG8gcHJvdmlkZSBkZWZhdWx0IHZhbHVlIGZvciBhIHByb3AsIHVzZSB0aGUgXCJkZWZhdWx0XCIgJyArICdwcm9wIG9wdGlvbjsgaWYgeW91IHdhbnQgdG8gcGFzcyBwcm9wIHZhbHVlcyB0byBhbiBpbnN0YW50aWF0aW9uICcgKyAnY2FsbCwgdXNlIHRoZSBcInByb3BzRGF0YVwiIG9wdGlvbi4nLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gb2JzZXJ2ZSBkYXRhXG4gICAgb2JzZXJ2ZShkYXRhLCB0aGlzKTtcbiAgfTtcblxuICAvKipcbiAgICogU3dhcCB0aGUgaW5zdGFuY2UncyAkZGF0YS4gQ2FsbGVkIGluICRkYXRhJ3Mgc2V0dGVyLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gbmV3RGF0YVxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLl9zZXREYXRhID0gZnVuY3Rpb24gKG5ld0RhdGEpIHtcbiAgICBuZXdEYXRhID0gbmV3RGF0YSB8fCB7fTtcbiAgICB2YXIgb2xkRGF0YSA9IHRoaXMuX2RhdGE7XG4gICAgdGhpcy5fZGF0YSA9IG5ld0RhdGE7XG4gICAgdmFyIGtleXMsIGtleSwgaTtcbiAgICAvLyB1bnByb3h5IGtleXMgbm90IHByZXNlbnQgaW4gbmV3IGRhdGFcbiAgICBrZXlzID0gT2JqZWN0LmtleXMob2xkRGF0YSk7XG4gICAgaSA9IGtleXMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICBpZiAoIShrZXkgaW4gbmV3RGF0YSkpIHtcbiAgICAgICAgdGhpcy5fdW5wcm94eShrZXkpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBwcm94eSBrZXlzIG5vdCBhbHJlYWR5IHByb3hpZWQsXG4gICAgLy8gYW5kIHRyaWdnZXIgY2hhbmdlIGZvciBjaGFuZ2VkIHZhbHVlc1xuICAgIGtleXMgPSBPYmplY3Qua2V5cyhuZXdEYXRhKTtcbiAgICBpID0ga2V5cy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmICghaGFzT3duKHRoaXMsIGtleSkpIHtcbiAgICAgICAgLy8gbmV3IHByb3BlcnR5XG4gICAgICAgIHRoaXMuX3Byb3h5KGtleSk7XG4gICAgICB9XG4gICAgfVxuICAgIG9sZERhdGEuX19vYl9fLnJlbW92ZVZtKHRoaXMpO1xuICAgIG9ic2VydmUobmV3RGF0YSwgdGhpcyk7XG4gICAgdGhpcy5fZGlnZXN0KCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFByb3h5IGEgcHJvcGVydHksIHNvIHRoYXRcbiAgICogdm0ucHJvcCA9PT0gdm0uX2RhdGEucHJvcFxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuX3Byb3h5ID0gZnVuY3Rpb24gKGtleSkge1xuICAgIGlmICghaXNSZXNlcnZlZChrZXkpKSB7XG4gICAgICAvLyBuZWVkIHRvIHN0b3JlIHJlZiB0byBzZWxmIGhlcmVcbiAgICAgIC8vIGJlY2F1c2UgdGhlc2UgZ2V0dGVyL3NldHRlcnMgbWlnaHRcbiAgICAgIC8vIGJlIGNhbGxlZCBieSBjaGlsZCBzY29wZXMgdmlhXG4gICAgICAvLyBwcm90b3R5cGUgaW5oZXJpdGFuY2UuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2VsZiwga2V5LCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBwcm94eUdldHRlcigpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5fZGF0YVtrZXldO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHByb3h5U2V0dGVyKHZhbCkge1xuICAgICAgICAgIHNlbGYuX2RhdGFba2V5XSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBVbnByb3h5IGEgcHJvcGVydHkuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5fdW5wcm94eSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoIWlzUmVzZXJ2ZWQoa2V5KSkge1xuICAgICAgZGVsZXRlIHRoaXNba2V5XTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEZvcmNlIHVwZGF0ZSBvbiBldmVyeSB3YXRjaGVyIGluIHNjb3BlLlxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLl9kaWdlc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLl93YXRjaGVycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMuX3dhdGNoZXJzW2ldLnVwZGF0ZSh0cnVlKTsgLy8gc2hhbGxvdyB1cGRhdGVzXG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBTZXR1cCBjb21wdXRlZCBwcm9wZXJ0aWVzLiBUaGV5IGFyZSBlc3NlbnRpYWxseVxuICAgKiBzcGVjaWFsIGdldHRlci9zZXR0ZXJzXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG5vb3AoKSB7fVxuICBWdWUucHJvdG90eXBlLl9pbml0Q29tcHV0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbXB1dGVkID0gdGhpcy4kb3B0aW9ucy5jb21wdXRlZDtcbiAgICBpZiAoY29tcHV0ZWQpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBjb21wdXRlZCkge1xuICAgICAgICB2YXIgdXNlckRlZiA9IGNvbXB1dGVkW2tleV07XG4gICAgICAgIHZhciBkZWYgPSB7XG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHR5cGVvZiB1c2VyRGVmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgZGVmLmdldCA9IG1ha2VDb21wdXRlZEdldHRlcih1c2VyRGVmLCB0aGlzKTtcbiAgICAgICAgICBkZWYuc2V0ID0gbm9vcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWYuZ2V0ID0gdXNlckRlZi5nZXQgPyB1c2VyRGVmLmNhY2hlICE9PSBmYWxzZSA/IG1ha2VDb21wdXRlZEdldHRlcih1c2VyRGVmLmdldCwgdGhpcykgOiBiaW5kKHVzZXJEZWYuZ2V0LCB0aGlzKSA6IG5vb3A7XG4gICAgICAgICAgZGVmLnNldCA9IHVzZXJEZWYuc2V0ID8gYmluZCh1c2VyRGVmLnNldCwgdGhpcykgOiBub29wO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBrZXksIGRlZik7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VDb21wdXRlZEdldHRlcihnZXR0ZXIsIG93bmVyKSB7XG4gICAgdmFyIHdhdGNoZXIgPSBuZXcgV2F0Y2hlcihvd25lciwgZ2V0dGVyLCBudWxsLCB7XG4gICAgICBsYXp5OiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGNvbXB1dGVkR2V0dGVyKCkge1xuICAgICAgaWYgKHdhdGNoZXIuZGlydHkpIHtcbiAgICAgICAgd2F0Y2hlci5ldmFsdWF0ZSgpO1xuICAgICAgfVxuICAgICAgaWYgKERlcC50YXJnZXQpIHtcbiAgICAgICAgd2F0Y2hlci5kZXBlbmQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB3YXRjaGVyLnZhbHVlO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU2V0dXAgaW5zdGFuY2UgbWV0aG9kcy4gTWV0aG9kcyBtdXN0IGJlIGJvdW5kIHRvIHRoZVxuICAgKiBpbnN0YW5jZSBzaW5jZSB0aGV5IG1pZ2h0IGJlIHBhc3NlZCBkb3duIGFzIGEgcHJvcCB0b1xuICAgKiBjaGlsZCBjb21wb25lbnRzLlxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLl9pbml0TWV0aG9kcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbWV0aG9kcyA9IHRoaXMuJG9wdGlvbnMubWV0aG9kcztcbiAgICBpZiAobWV0aG9kcykge1xuICAgICAgZm9yICh2YXIga2V5IGluIG1ldGhvZHMpIHtcbiAgICAgICAgdGhpc1trZXldID0gYmluZChtZXRob2RzW2tleV0sIHRoaXMpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBtZXRhIGluZm9ybWF0aW9uIGxpa2UgJGluZGV4LCAka2V5ICYgJHZhbHVlLlxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLl9pbml0TWV0YSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbWV0YXMgPSB0aGlzLiRvcHRpb25zLl9tZXRhO1xuICAgIGlmIChtZXRhcykge1xuICAgICAgZm9yICh2YXIga2V5IGluIG1ldGFzKSB7XG4gICAgICAgIGRlZmluZVJlYWN0aXZlKHRoaXMsIGtleSwgbWV0YXNba2V5XSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG52YXIgZXZlbnRSRSA9IC9edi1vbjp8XkAvO1xuXG5mdW5jdGlvbiBldmVudHNNaXhpbiAoVnVlKSB7XG4gIC8qKlxuICAgKiBTZXR1cCB0aGUgaW5zdGFuY2UncyBvcHRpb24gZXZlbnRzICYgd2F0Y2hlcnMuXG4gICAqIElmIHRoZSB2YWx1ZSBpcyBhIHN0cmluZywgd2UgcHVsbCBpdCBmcm9tIHRoZVxuICAgKiBpbnN0YW5jZSdzIG1ldGhvZHMgYnkgbmFtZS5cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5faW5pdEV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuJG9wdGlvbnM7XG4gICAgaWYgKG9wdGlvbnMuX2FzQ29tcG9uZW50KSB7XG4gICAgICByZWdpc3RlckNvbXBvbmVudEV2ZW50cyh0aGlzLCBvcHRpb25zLmVsKTtcbiAgICB9XG4gICAgcmVnaXN0ZXJDYWxsYmFja3ModGhpcywgJyRvbicsIG9wdGlvbnMuZXZlbnRzKTtcbiAgICByZWdpc3RlckNhbGxiYWNrcyh0aGlzLCAnJHdhdGNoJywgb3B0aW9ucy53YXRjaCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIHYtb24gZXZlbnRzIG9uIGEgY2hpbGQgY29tcG9uZW50XG4gICAqXG4gICAqIEBwYXJhbSB7VnVlfSB2bVxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyQ29tcG9uZW50RXZlbnRzKHZtLCBlbCkge1xuICAgIHZhciBhdHRycyA9IGVsLmF0dHJpYnV0ZXM7XG4gICAgdmFyIG5hbWUsIHZhbHVlLCBoYW5kbGVyO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXR0cnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBuYW1lID0gYXR0cnNbaV0ubmFtZTtcbiAgICAgIGlmIChldmVudFJFLnRlc3QobmFtZSkpIHtcbiAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZShldmVudFJFLCAnJyk7XG4gICAgICAgIC8vIGZvcmNlIHRoZSBleHByZXNzaW9uIGludG8gYSBzdGF0ZW1lbnQgc28gdGhhdFxuICAgICAgICAvLyBpdCBhbHdheXMgZHluYW1pY2FsbHkgcmVzb2x2ZXMgdGhlIG1ldGhvZCB0byBjYWxsICgjMjY3MClcbiAgICAgICAgLy8ga2luZGEgdWdseSBoYWNrLCBidXQgZG9lcyB0aGUgam9iLlxuICAgICAgICB2YWx1ZSA9IGF0dHJzW2ldLnZhbHVlO1xuICAgICAgICBpZiAoaXNTaW1wbGVQYXRoKHZhbHVlKSkge1xuICAgICAgICAgIHZhbHVlICs9ICcuYXBwbHkodGhpcywgJGFyZ3VtZW50cyknO1xuICAgICAgICB9XG4gICAgICAgIGhhbmRsZXIgPSAodm0uX3Njb3BlIHx8IHZtLl9jb250ZXh0KS4kZXZhbCh2YWx1ZSwgdHJ1ZSk7XG4gICAgICAgIGhhbmRsZXIuX2Zyb21QYXJlbnQgPSB0cnVlO1xuICAgICAgICB2bS4kb24obmFtZS5yZXBsYWNlKGV2ZW50UkUpLCBoYW5kbGVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgY2FsbGJhY2tzIGZvciBvcHRpb24gZXZlbnRzIGFuZCB3YXRjaGVycy5cbiAgICpcbiAgICogQHBhcmFtIHtWdWV9IHZtXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhY3Rpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IGhhc2hcbiAgICovXG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXJDYWxsYmFja3Modm0sIGFjdGlvbiwgaGFzaCkge1xuICAgIGlmICghaGFzaCkgcmV0dXJuO1xuICAgIHZhciBoYW5kbGVycywga2V5LCBpLCBqO1xuICAgIGZvciAoa2V5IGluIGhhc2gpIHtcbiAgICAgIGhhbmRsZXJzID0gaGFzaFtrZXldO1xuICAgICAgaWYgKGlzQXJyYXkoaGFuZGxlcnMpKSB7XG4gICAgICAgIGZvciAoaSA9IDAsIGogPSBoYW5kbGVycy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICByZWdpc3Rlcih2bSwgYWN0aW9uLCBrZXksIGhhbmRsZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVnaXN0ZXIodm0sIGFjdGlvbiwga2V5LCBoYW5kbGVycyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciB0byByZWdpc3RlciBhbiBldmVudC93YXRjaCBjYWxsYmFjay5cbiAgICpcbiAgICogQHBhcmFtIHtWdWV9IHZtXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ3xPYmplY3R9IGhhbmRsZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKi9cblxuICBmdW5jdGlvbiByZWdpc3Rlcih2bSwgYWN0aW9uLCBrZXksIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBoYW5kbGVyO1xuICAgIGlmICh0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB2bVthY3Rpb25dKGtleSwgaGFuZGxlciwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgdmFyIG1ldGhvZHMgPSB2bS4kb3B0aW9ucy5tZXRob2RzO1xuICAgICAgdmFyIG1ldGhvZCA9IG1ldGhvZHMgJiYgbWV0aG9kc1toYW5kbGVyXTtcbiAgICAgIGlmIChtZXRob2QpIHtcbiAgICAgICAgdm1bYWN0aW9uXShrZXksIG1ldGhvZCwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oJ1Vua25vd24gbWV0aG9kOiBcIicgKyBoYW5kbGVyICsgJ1wiIHdoZW4gJyArICdyZWdpc3RlcmluZyBjYWxsYmFjayBmb3IgJyArIGFjdGlvbiArICc6IFwiJyArIGtleSArICdcIi4nLCB2bSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICByZWdpc3Rlcih2bSwgYWN0aW9uLCBrZXksIGhhbmRsZXIuaGFuZGxlciwgaGFuZGxlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHVwIHJlY3Vyc2l2ZSBhdHRhY2hlZC9kZXRhY2hlZCBjYWxsc1xuICAgKi9cblxuICBWdWUucHJvdG90eXBlLl9pbml0RE9NSG9va3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy4kb24oJ2hvb2s6YXR0YWNoZWQnLCBvbkF0dGFjaGVkKTtcbiAgICB0aGlzLiRvbignaG9vazpkZXRhY2hlZCcsIG9uRGV0YWNoZWQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsYmFjayB0byByZWN1cnNpdmVseSBjYWxsIGF0dGFjaGVkIGhvb2sgb24gY2hpbGRyZW5cbiAgICovXG5cbiAgZnVuY3Rpb24gb25BdHRhY2hlZCgpIHtcbiAgICBpZiAoIXRoaXMuX2lzQXR0YWNoZWQpIHtcbiAgICAgIHRoaXMuX2lzQXR0YWNoZWQgPSB0cnVlO1xuICAgICAgdGhpcy4kY2hpbGRyZW4uZm9yRWFjaChjYWxsQXR0YWNoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0b3IgdG8gY2FsbCBhdHRhY2hlZCBob29rXG4gICAqXG4gICAqIEBwYXJhbSB7VnVlfSBjaGlsZFxuICAgKi9cblxuICBmdW5jdGlvbiBjYWxsQXR0YWNoKGNoaWxkKSB7XG4gICAgaWYgKCFjaGlsZC5faXNBdHRhY2hlZCAmJiBpbkRvYyhjaGlsZC4kZWwpKSB7XG4gICAgICBjaGlsZC5fY2FsbEhvb2soJ2F0dGFjaGVkJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRvIHJlY3Vyc2l2ZWx5IGNhbGwgZGV0YWNoZWQgaG9vayBvbiBjaGlsZHJlblxuICAgKi9cblxuICBmdW5jdGlvbiBvbkRldGFjaGVkKCkge1xuICAgIGlmICh0aGlzLl9pc0F0dGFjaGVkKSB7XG4gICAgICB0aGlzLl9pc0F0dGFjaGVkID0gZmFsc2U7XG4gICAgICB0aGlzLiRjaGlsZHJlbi5mb3JFYWNoKGNhbGxEZXRhY2gpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRvciB0byBjYWxsIGRldGFjaGVkIGhvb2tcbiAgICpcbiAgICogQHBhcmFtIHtWdWV9IGNoaWxkXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNhbGxEZXRhY2goY2hpbGQpIHtcbiAgICBpZiAoY2hpbGQuX2lzQXR0YWNoZWQgJiYgIWluRG9jKGNoaWxkLiRlbCkpIHtcbiAgICAgIGNoaWxkLl9jYWxsSG9vaygnZGV0YWNoZWQnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciBhbGwgaGFuZGxlcnMgZm9yIGEgaG9va1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gaG9va1xuICAgKi9cblxuICBWdWUucHJvdG90eXBlLl9jYWxsSG9vayA9IGZ1bmN0aW9uIChob29rKSB7XG4gICAgdGhpcy4kZW1pdCgncHJlLWhvb2s6JyArIGhvb2spO1xuICAgIHZhciBoYW5kbGVycyA9IHRoaXMuJG9wdGlvbnNbaG9va107XG4gICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGhhbmRsZXJzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICBoYW5kbGVyc1tpXS5jYWxsKHRoaXMpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLiRlbWl0KCdob29rOicgKyBob29rKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgbGlua3MgYSBET00gZWxlbWVudCB3aXRoIGEgcGllY2Ugb2YgZGF0YSxcbiAqIHdoaWNoIGlzIHRoZSByZXN1bHQgb2YgZXZhbHVhdGluZyBhbiBleHByZXNzaW9uLlxuICogSXQgcmVnaXN0ZXJzIGEgd2F0Y2hlciB3aXRoIHRoZSBleHByZXNzaW9uIGFuZCBjYWxsc1xuICogdGhlIERPTSB1cGRhdGUgZnVuY3Rpb24gd2hlbiBhIGNoYW5nZSBpcyB0cmlnZ2VyZWQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlc2NyaXB0b3JcbiAqICAgICAgICAgICAgICAgICAtIHtTdHJpbmd9IG5hbWVcbiAqICAgICAgICAgICAgICAgICAtIHtPYmplY3R9IGRlZlxuICogICAgICAgICAgICAgICAgIC0ge1N0cmluZ30gZXhwcmVzc2lvblxuICogICAgICAgICAgICAgICAgIC0ge0FycmF5PE9iamVjdD59IFtmaWx0ZXJzXVxuICogICAgICAgICAgICAgICAgIC0ge09iamVjdH0gW21vZGlmaWVyc11cbiAqICAgICAgICAgICAgICAgICAtIHtCb29sZWFufSBsaXRlcmFsXG4gKiAgICAgICAgICAgICAgICAgLSB7U3RyaW5nfSBhdHRyXG4gKiAgICAgICAgICAgICAgICAgLSB7U3RyaW5nfSBhcmdcbiAqICAgICAgICAgICAgICAgICAtIHtTdHJpbmd9IHJhd1xuICogICAgICAgICAgICAgICAgIC0ge1N0cmluZ30gW3JlZl1cbiAqICAgICAgICAgICAgICAgICAtIHtBcnJheTxPYmplY3Q+fSBbaW50ZXJwXVxuICogICAgICAgICAgICAgICAgIC0ge0Jvb2xlYW59IFtoYXNPbmVUaW1lXVxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge05vZGV9IGVsXG4gKiBAcGFyYW0ge1Z1ZX0gW2hvc3RdIC0gdHJhbnNjbHVzaW9uIGhvc3QgY29tcG9uZW50XG4gKiBAcGFyYW0ge09iamVjdH0gW3Njb3BlXSAtIHYtZm9yIHNjb3BlXG4gKiBAcGFyYW0ge0ZyYWdtZW50fSBbZnJhZ10gLSBvd25lciBmcmFnbWVudFxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIERpcmVjdGl2ZShkZXNjcmlwdG9yLCB2bSwgZWwsIGhvc3QsIHNjb3BlLCBmcmFnKSB7XG4gIHRoaXMudm0gPSB2bTtcbiAgdGhpcy5lbCA9IGVsO1xuICAvLyBjb3B5IGRlc2NyaXB0b3IgcHJvcGVydGllc1xuICB0aGlzLmRlc2NyaXB0b3IgPSBkZXNjcmlwdG9yO1xuICB0aGlzLm5hbWUgPSBkZXNjcmlwdG9yLm5hbWU7XG4gIHRoaXMuZXhwcmVzc2lvbiA9IGRlc2NyaXB0b3IuZXhwcmVzc2lvbjtcbiAgdGhpcy5hcmcgPSBkZXNjcmlwdG9yLmFyZztcbiAgdGhpcy5tb2RpZmllcnMgPSBkZXNjcmlwdG9yLm1vZGlmaWVycztcbiAgdGhpcy5maWx0ZXJzID0gZGVzY3JpcHRvci5maWx0ZXJzO1xuICB0aGlzLmxpdGVyYWwgPSB0aGlzLm1vZGlmaWVycyAmJiB0aGlzLm1vZGlmaWVycy5saXRlcmFsO1xuICAvLyBwcml2YXRlXG4gIHRoaXMuX2xvY2tlZCA9IGZhbHNlO1xuICB0aGlzLl9ib3VuZCA9IGZhbHNlO1xuICB0aGlzLl9saXN0ZW5lcnMgPSBudWxsO1xuICAvLyBsaW5rIGNvbnRleHRcbiAgdGhpcy5faG9zdCA9IGhvc3Q7XG4gIHRoaXMuX3Njb3BlID0gc2NvcGU7XG4gIHRoaXMuX2ZyYWcgPSBmcmFnO1xuICAvLyBzdG9yZSBkaXJlY3RpdmVzIG9uIG5vZGUgaW4gZGV2IG1vZGVcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgdGhpcy5lbCkge1xuICAgIHRoaXMuZWwuX3Z1ZV9kaXJlY3RpdmVzID0gdGhpcy5lbC5fdnVlX2RpcmVjdGl2ZXMgfHwgW107XG4gICAgdGhpcy5lbC5fdnVlX2RpcmVjdGl2ZXMucHVzaCh0aGlzKTtcbiAgfVxufVxuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIGRpcmVjdGl2ZSwgbWl4aW4gZGVmaW5pdGlvbiBwcm9wZXJ0aWVzLFxuICogc2V0dXAgdGhlIHdhdGNoZXIsIGNhbGwgZGVmaW5pdGlvbiBiaW5kKCkgYW5kIHVwZGF0ZSgpXG4gKiBpZiBwcmVzZW50LlxuICovXG5cbkRpcmVjdGl2ZS5wcm90b3R5cGUuX2JpbmQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBuYW1lID0gdGhpcy5uYW1lO1xuICB2YXIgZGVzY3JpcHRvciA9IHRoaXMuZGVzY3JpcHRvcjtcblxuICAvLyByZW1vdmUgYXR0cmlidXRlXG4gIGlmICgobmFtZSAhPT0gJ2Nsb2FrJyB8fCB0aGlzLnZtLl9pc0NvbXBpbGVkKSAmJiB0aGlzLmVsICYmIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKSB7XG4gICAgdmFyIGF0dHIgPSBkZXNjcmlwdG9yLmF0dHIgfHwgJ3YtJyArIG5hbWU7XG4gICAgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoYXR0cik7XG4gIH1cblxuICAvLyBjb3B5IGRlZiBwcm9wZXJ0aWVzXG4gIHZhciBkZWYgPSBkZXNjcmlwdG9yLmRlZjtcbiAgaWYgKHR5cGVvZiBkZWYgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0aGlzLnVwZGF0ZSA9IGRlZjtcbiAgfSBlbHNlIHtcbiAgICBleHRlbmQodGhpcywgZGVmKTtcbiAgfVxuXG4gIC8vIHNldHVwIGRpcmVjdGl2ZSBwYXJhbXNcbiAgdGhpcy5fc2V0dXBQYXJhbXMoKTtcblxuICAvLyBpbml0aWFsIGJpbmRcbiAgaWYgKHRoaXMuYmluZCkge1xuICAgIHRoaXMuYmluZCgpO1xuICB9XG4gIHRoaXMuX2JvdW5kID0gdHJ1ZTtcblxuICBpZiAodGhpcy5saXRlcmFsKSB7XG4gICAgdGhpcy51cGRhdGUgJiYgdGhpcy51cGRhdGUoZGVzY3JpcHRvci5yYXcpO1xuICB9IGVsc2UgaWYgKCh0aGlzLmV4cHJlc3Npb24gfHwgdGhpcy5tb2RpZmllcnMpICYmICh0aGlzLnVwZGF0ZSB8fCB0aGlzLnR3b1dheSkgJiYgIXRoaXMuX2NoZWNrU3RhdGVtZW50KCkpIHtcbiAgICAvLyB3cmFwcGVkIHVwZGF0ZXIgZm9yIGNvbnRleHRcbiAgICB2YXIgZGlyID0gdGhpcztcbiAgICBpZiAodGhpcy51cGRhdGUpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZSA9IGZ1bmN0aW9uICh2YWwsIG9sZFZhbCkge1xuICAgICAgICBpZiAoIWRpci5fbG9ja2VkKSB7XG4gICAgICAgICAgZGlyLnVwZGF0ZSh2YWwsIG9sZFZhbCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3VwZGF0ZSA9IG5vb3A7XG4gICAgfVxuICAgIHZhciBwcmVQcm9jZXNzID0gdGhpcy5fcHJlUHJvY2VzcyA/IGJpbmQodGhpcy5fcHJlUHJvY2VzcywgdGhpcykgOiBudWxsO1xuICAgIHZhciBwb3N0UHJvY2VzcyA9IHRoaXMuX3Bvc3RQcm9jZXNzID8gYmluZCh0aGlzLl9wb3N0UHJvY2VzcywgdGhpcykgOiBudWxsO1xuICAgIHZhciB3YXRjaGVyID0gdGhpcy5fd2F0Y2hlciA9IG5ldyBXYXRjaGVyKHRoaXMudm0sIHRoaXMuZXhwcmVzc2lvbiwgdGhpcy5fdXBkYXRlLCAvLyBjYWxsYmFja1xuICAgIHtcbiAgICAgIGZpbHRlcnM6IHRoaXMuZmlsdGVycyxcbiAgICAgIHR3b1dheTogdGhpcy50d29XYXksXG4gICAgICBkZWVwOiB0aGlzLmRlZXAsXG4gICAgICBwcmVQcm9jZXNzOiBwcmVQcm9jZXNzLFxuICAgICAgcG9zdFByb2Nlc3M6IHBvc3RQcm9jZXNzLFxuICAgICAgc2NvcGU6IHRoaXMuX3Njb3BlXG4gICAgfSk7XG4gICAgLy8gdi1tb2RlbCB3aXRoIGluaXRhbCBpbmxpbmUgdmFsdWUgbmVlZCB0byBzeW5jIGJhY2sgdG9cbiAgICAvLyBtb2RlbCBpbnN0ZWFkIG9mIHVwZGF0ZSB0byBET00gb24gaW5pdC4gVGhleSB3b3VsZFxuICAgIC8vIHNldCB0aGUgYWZ0ZXJCaW5kIGhvb2sgdG8gaW5kaWNhdGUgdGhhdC5cbiAgICBpZiAodGhpcy5hZnRlckJpbmQpIHtcbiAgICAgIHRoaXMuYWZ0ZXJCaW5kKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnVwZGF0ZSkge1xuICAgICAgdGhpcy51cGRhdGUod2F0Y2hlci52YWx1ZSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFNldHVwIGFsbCBwYXJhbSBhdHRyaWJ1dGVzLCBlLmcuIHRyYWNrLWJ5LFxuICogdHJhbnNpdGlvbi1tb2RlLCBldGMuLi5cbiAqL1xuXG5EaXJlY3RpdmUucHJvdG90eXBlLl9zZXR1cFBhcmFtcyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLnBhcmFtcykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgcGFyYW1zID0gdGhpcy5wYXJhbXM7XG4gIC8vIHN3YXAgdGhlIHBhcmFtcyBhcnJheSB3aXRoIGEgZnJlc2ggb2JqZWN0LlxuICB0aGlzLnBhcmFtcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHZhciBpID0gcGFyYW1zLmxlbmd0aDtcbiAgdmFyIGtleSwgdmFsLCBtYXBwZWRLZXk7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBrZXkgPSBoeXBoZW5hdGUocGFyYW1zW2ldKTtcbiAgICBtYXBwZWRLZXkgPSBjYW1lbGl6ZShrZXkpO1xuICAgIHZhbCA9IGdldEJpbmRBdHRyKHRoaXMuZWwsIGtleSk7XG4gICAgaWYgKHZhbCAhPSBudWxsKSB7XG4gICAgICAvLyBkeW5hbWljXG4gICAgICB0aGlzLl9zZXR1cFBhcmFtV2F0Y2hlcihtYXBwZWRLZXksIHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHN0YXRpY1xuICAgICAgdmFsID0gZ2V0QXR0cih0aGlzLmVsLCBrZXkpO1xuICAgICAgaWYgKHZhbCAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMucGFyYW1zW21hcHBlZEtleV0gPSB2YWwgPT09ICcnID8gdHJ1ZSA6IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogU2V0dXAgYSB3YXRjaGVyIGZvciBhIGR5bmFtaWMgcGFyYW0uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtTdHJpbmd9IGV4cHJlc3Npb25cbiAqL1xuXG5EaXJlY3RpdmUucHJvdG90eXBlLl9zZXR1cFBhcmFtV2F0Y2hlciA9IGZ1bmN0aW9uIChrZXksIGV4cHJlc3Npb24pIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgY2FsbGVkID0gZmFsc2U7XG4gIHZhciB1bndhdGNoID0gKHRoaXMuX3Njb3BlIHx8IHRoaXMudm0pLiR3YXRjaChleHByZXNzaW9uLCBmdW5jdGlvbiAodmFsLCBvbGRWYWwpIHtcbiAgICBzZWxmLnBhcmFtc1trZXldID0gdmFsO1xuICAgIC8vIHNpbmNlIHdlIGFyZSBpbiBpbW1lZGlhdGUgbW9kZSxcbiAgICAvLyBvbmx5IGNhbGwgdGhlIHBhcmFtIGNoYW5nZSBjYWxsYmFja3MgaWYgdGhpcyBpcyBub3QgdGhlIGZpcnN0IHVwZGF0ZS5cbiAgICBpZiAoY2FsbGVkKSB7XG4gICAgICB2YXIgY2IgPSBzZWxmLnBhcmFtV2F0Y2hlcnMgJiYgc2VsZi5wYXJhbVdhdGNoZXJzW2tleV07XG4gICAgICBpZiAoY2IpIHtcbiAgICAgICAgY2IuY2FsbChzZWxmLCB2YWwsIG9sZFZhbCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgIHVzZXI6IGZhbHNlXG4gIH0pOyh0aGlzLl9wYXJhbVVud2F0Y2hGbnMgfHwgKHRoaXMuX3BhcmFtVW53YXRjaEZucyA9IFtdKSkucHVzaCh1bndhdGNoKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIGRpcmVjdGl2ZSBpcyBhIGZ1bmN0aW9uIGNhbGxlclxuICogYW5kIGlmIHRoZSBleHByZXNzaW9uIGlzIGEgY2FsbGFibGUgb25lLiBJZiBib3RoIHRydWUsXG4gKiB3ZSB3cmFwIHVwIHRoZSBleHByZXNzaW9uIGFuZCB1c2UgaXQgYXMgdGhlIGV2ZW50XG4gKiBoYW5kbGVyLlxuICpcbiAqIGUuZy4gb24tY2xpY2s9XCJhKytcIlxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuRGlyZWN0aXZlLnByb3RvdHlwZS5fY2hlY2tTdGF0ZW1lbnQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBleHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uO1xuICBpZiAoZXhwcmVzc2lvbiAmJiB0aGlzLmFjY2VwdFN0YXRlbWVudCAmJiAhaXNTaW1wbGVQYXRoKGV4cHJlc3Npb24pKSB7XG4gICAgdmFyIGZuID0gcGFyc2VFeHByZXNzaW9uKGV4cHJlc3Npb24pLmdldDtcbiAgICB2YXIgc2NvcGUgPSB0aGlzLl9zY29wZSB8fCB0aGlzLnZtO1xuICAgIHZhciBoYW5kbGVyID0gZnVuY3Rpb24gaGFuZGxlcihlKSB7XG4gICAgICBzY29wZS4kZXZlbnQgPSBlO1xuICAgICAgZm4uY2FsbChzY29wZSwgc2NvcGUpO1xuICAgICAgc2NvcGUuJGV2ZW50ID0gbnVsbDtcbiAgICB9O1xuICAgIGlmICh0aGlzLmZpbHRlcnMpIHtcbiAgICAgIGhhbmRsZXIgPSBzY29wZS5fYXBwbHlGaWx0ZXJzKGhhbmRsZXIsIG51bGwsIHRoaXMuZmlsdGVycyk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlKGhhbmRsZXIpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZSB3aXRoIHRoZSBzZXR0ZXIuXG4gKiBUaGlzIHNob3VsZCBvbmx5IGJlIHVzZWQgaW4gdHdvLXdheSBkaXJlY3RpdmVzXG4gKiBlLmcuIHYtbW9kZWwuXG4gKlxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHB1YmxpY1xuICovXG5cbkRpcmVjdGl2ZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gIGlmICh0aGlzLnR3b1dheSkge1xuICAgIHRoaXMuX3dpdGhMb2NrKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuX3dhdGNoZXIuc2V0KHZhbHVlKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgd2FybignRGlyZWN0aXZlLnNldCgpIGNhbiBvbmx5IGJlIHVzZWQgaW5zaWRlIHR3b1dheScgKyAnZGlyZWN0aXZlcy4nKTtcbiAgfVxufTtcblxuLyoqXG4gKiBFeGVjdXRlIGEgZnVuY3Rpb24gd2hpbGUgcHJldmVudGluZyB0aGF0IGZ1bmN0aW9uIGZyb21cbiAqIHRyaWdnZXJpbmcgdXBkYXRlcyBvbiB0aGlzIGRpcmVjdGl2ZSBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICovXG5cbkRpcmVjdGl2ZS5wcm90b3R5cGUuX3dpdGhMb2NrID0gZnVuY3Rpb24gKGZuKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5fbG9ja2VkID0gdHJ1ZTtcbiAgZm4uY2FsbChzZWxmKTtcbiAgbmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgIHNlbGYuX2xvY2tlZCA9IGZhbHNlO1xuICB9KTtcbn07XG5cbi8qKlxuICogQ29udmVuaWVuY2UgbWV0aG9kIHRoYXQgYXR0YWNoZXMgYSBET00gZXZlbnQgbGlzdGVuZXJcbiAqIHRvIHRoZSBkaXJlY3RpdmUgZWxlbWVudCBhbmQgYXV0b21ldGljYWxseSB0ZWFycyBpdCBkb3duXG4gKiBkdXJpbmcgdW5iaW5kLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICogQHBhcmFtIHtCb29sZWFufSBbdXNlQ2FwdHVyZV1cbiAqL1xuXG5EaXJlY3RpdmUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyLCB1c2VDYXB0dXJlKSB7XG4gIG9uKHRoaXMuZWwsIGV2ZW50LCBoYW5kbGVyLCB1c2VDYXB0dXJlKTsodGhpcy5fbGlzdGVuZXJzIHx8ICh0aGlzLl9saXN0ZW5lcnMgPSBbXSkpLnB1c2goW2V2ZW50LCBoYW5kbGVyXSk7XG59O1xuXG4vKipcbiAqIFRlYXJkb3duIHRoZSB3YXRjaGVyIGFuZCBjYWxsIHVuYmluZC5cbiAqL1xuXG5EaXJlY3RpdmUucHJvdG90eXBlLl90ZWFyZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX2JvdW5kKSB7XG4gICAgdGhpcy5fYm91bmQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy51bmJpbmQpIHtcbiAgICAgIHRoaXMudW5iaW5kKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl93YXRjaGVyKSB7XG4gICAgICB0aGlzLl93YXRjaGVyLnRlYXJkb3duKCk7XG4gICAgfVxuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gICAgdmFyIGk7XG4gICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgaSA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIG9mZih0aGlzLmVsLCBsaXN0ZW5lcnNbaV1bMF0sIGxpc3RlbmVyc1tpXVsxXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciB1bndhdGNoRm5zID0gdGhpcy5fcGFyYW1VbndhdGNoRm5zO1xuICAgIGlmICh1bndhdGNoRm5zKSB7XG4gICAgICBpID0gdW53YXRjaEZucy5sZW5ndGg7XG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIHVud2F0Y2hGbnNbaV0oKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgdGhpcy5lbCkge1xuICAgICAgdGhpcy5lbC5fdnVlX2RpcmVjdGl2ZXMuJHJlbW92ZSh0aGlzKTtcbiAgICB9XG4gICAgdGhpcy52bSA9IHRoaXMuZWwgPSB0aGlzLl93YXRjaGVyID0gdGhpcy5fbGlzdGVuZXJzID0gbnVsbDtcbiAgfVxufTtcblxuZnVuY3Rpb24gbGlmZWN5Y2xlTWl4aW4gKFZ1ZSkge1xuICAvKipcbiAgICogVXBkYXRlIHYtcmVmIGZvciBjb21wb25lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVtb3ZlXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuX3VwZGF0ZVJlZiA9IGZ1bmN0aW9uIChyZW1vdmUpIHtcbiAgICB2YXIgcmVmID0gdGhpcy4kb3B0aW9ucy5fcmVmO1xuICAgIGlmIChyZWYpIHtcbiAgICAgIHZhciByZWZzID0gKHRoaXMuX3Njb3BlIHx8IHRoaXMuX2NvbnRleHQpLiRyZWZzO1xuICAgICAgaWYgKHJlbW92ZSkge1xuICAgICAgICBpZiAocmVmc1tyZWZdID09PSB0aGlzKSB7XG4gICAgICAgICAgcmVmc1tyZWZdID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVmc1tyZWZdID0gdGhpcztcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFRyYW5zY2x1ZGUsIGNvbXBpbGUgYW5kIGxpbmsgZWxlbWVudC5cbiAgICpcbiAgICogSWYgYSBwcmUtY29tcGlsZWQgbGlua2VyIGlzIGF2YWlsYWJsZSwgdGhhdCBtZWFucyB0aGVcbiAgICogcGFzc2VkIGluIGVsZW1lbnQgd2lsbCBiZSBwcmUtdHJhbnNjbHVkZWQgYW5kIGNvbXBpbGVkXG4gICAqIGFzIHdlbGwgLSBhbGwgd2UgbmVlZCB0byBkbyBpcyB0byBjYWxsIHRoZSBsaW5rZXIuXG4gICAqXG4gICAqIE90aGVyd2lzZSB3ZSBuZWVkIHRvIGNhbGwgdHJhbnNjbHVkZS9jb21waWxlL2xpbmsgaGVyZS5cbiAgICpcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLl9jb21waWxlID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLiRvcHRpb25zO1xuXG4gICAgLy8gdHJhbnNjbHVkZSBhbmQgaW5pdCBlbGVtZW50XG4gICAgLy8gdHJhbnNjbHVkZSBjYW4gcG90ZW50aWFsbHkgcmVwbGFjZSBvcmlnaW5hbFxuICAgIC8vIHNvIHdlIG5lZWQgdG8ga2VlcCByZWZlcmVuY2U7IHRoaXMgc3RlcCBhbHNvIGluamVjdHNcbiAgICAvLyB0aGUgdGVtcGxhdGUgYW5kIGNhY2hlcyB0aGUgb3JpZ2luYWwgYXR0cmlidXRlc1xuICAgIC8vIG9uIHRoZSBjb250YWluZXIgbm9kZSBhbmQgcmVwbGFjZXIgbm9kZS5cbiAgICB2YXIgb3JpZ2luYWwgPSBlbDtcbiAgICBlbCA9IHRyYW5zY2x1ZGUoZWwsIG9wdGlvbnMpO1xuICAgIHRoaXMuX2luaXRFbGVtZW50KGVsKTtcblxuICAgIC8vIGhhbmRsZSB2LXByZSBvbiByb290IG5vZGUgKCMyMDI2KVxuICAgIGlmIChlbC5ub2RlVHlwZSA9PT0gMSAmJiBnZXRBdHRyKGVsLCAndi1wcmUnKSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHJvb3QgaXMgYWx3YXlzIGNvbXBpbGVkIHBlci1pbnN0YW5jZSwgYmVjYXVzZVxuICAgIC8vIGNvbnRhaW5lciBhdHRycyBhbmQgcHJvcHMgY2FuIGJlIGRpZmZlcmVudCBldmVyeSB0aW1lLlxuICAgIHZhciBjb250ZXh0T3B0aW9ucyA9IHRoaXMuX2NvbnRleHQgJiYgdGhpcy5fY29udGV4dC4kb3B0aW9ucztcbiAgICB2YXIgcm9vdExpbmtlciA9IGNvbXBpbGVSb290KGVsLCBvcHRpb25zLCBjb250ZXh0T3B0aW9ucyk7XG5cbiAgICAvLyByZXNvbHZlIHNsb3QgZGlzdHJpYnV0aW9uXG4gICAgcmVzb2x2ZVNsb3RzKHRoaXMsIG9wdGlvbnMuX2NvbnRlbnQpO1xuXG4gICAgLy8gY29tcGlsZSBhbmQgbGluayB0aGUgcmVzdFxuICAgIHZhciBjb250ZW50TGlua0ZuO1xuICAgIHZhciBjdG9yID0gdGhpcy5jb25zdHJ1Y3RvcjtcbiAgICAvLyBjb21wb25lbnQgY29tcGlsYXRpb24gY2FuIGJlIGNhY2hlZFxuICAgIC8vIGFzIGxvbmcgYXMgaXQncyBub3QgdXNpbmcgaW5saW5lLXRlbXBsYXRlXG4gICAgaWYgKG9wdGlvbnMuX2xpbmtlckNhY2hhYmxlKSB7XG4gICAgICBjb250ZW50TGlua0ZuID0gY3Rvci5saW5rZXI7XG4gICAgICBpZiAoIWNvbnRlbnRMaW5rRm4pIHtcbiAgICAgICAgY29udGVudExpbmtGbiA9IGN0b3IubGlua2VyID0gY29tcGlsZShlbCwgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbGluayBwaGFzZVxuICAgIC8vIG1ha2Ugc3VyZSB0byBsaW5rIHJvb3Qgd2l0aCBwcm9wIHNjb3BlIVxuICAgIHZhciByb290VW5saW5rRm4gPSByb290TGlua2VyKHRoaXMsIGVsLCB0aGlzLl9zY29wZSk7XG4gICAgdmFyIGNvbnRlbnRVbmxpbmtGbiA9IGNvbnRlbnRMaW5rRm4gPyBjb250ZW50TGlua0ZuKHRoaXMsIGVsKSA6IGNvbXBpbGUoZWwsIG9wdGlvbnMpKHRoaXMsIGVsKTtcblxuICAgIC8vIHJlZ2lzdGVyIGNvbXBvc2l0ZSB1bmxpbmsgZnVuY3Rpb25cbiAgICAvLyB0byBiZSBjYWxsZWQgZHVyaW5nIGluc3RhbmNlIGRlc3RydWN0aW9uXG4gICAgdGhpcy5fdW5saW5rRm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICByb290VW5saW5rRm4oKTtcbiAgICAgIC8vIHBhc3NpbmcgZGVzdHJveWluZzogdHJ1ZSB0byBhdm9pZCBzZWFyY2hpbmcgYW5kXG4gICAgICAvLyBzcGxpY2luZyB0aGUgZGlyZWN0aXZlc1xuICAgICAgY29udGVudFVubGlua0ZuKHRydWUpO1xuICAgIH07XG5cbiAgICAvLyBmaW5hbGx5IHJlcGxhY2Ugb3JpZ2luYWxcbiAgICBpZiAob3B0aW9ucy5yZXBsYWNlKSB7XG4gICAgICByZXBsYWNlKG9yaWdpbmFsLCBlbCk7XG4gICAgfVxuXG4gICAgdGhpcy5faXNDb21waWxlZCA9IHRydWU7XG4gICAgdGhpcy5fY2FsbEhvb2soJ2NvbXBpbGVkJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgaW5zdGFuY2UgZWxlbWVudC4gQ2FsbGVkIGluIHRoZSBwdWJsaWNcbiAgICogJG1vdW50KCkgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuX2luaXRFbGVtZW50ID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgaWYgKGlzRnJhZ21lbnQoZWwpKSB7XG4gICAgICB0aGlzLl9pc0ZyYWdtZW50ID0gdHJ1ZTtcbiAgICAgIHRoaXMuJGVsID0gdGhpcy5fZnJhZ21lbnRTdGFydCA9IGVsLmZpcnN0Q2hpbGQ7XG4gICAgICB0aGlzLl9mcmFnbWVudEVuZCA9IGVsLmxhc3RDaGlsZDtcbiAgICAgIC8vIHNldCBwZXJzaXN0ZWQgdGV4dCBhbmNob3JzIHRvIGVtcHR5XG4gICAgICBpZiAodGhpcy5fZnJhZ21lbnRTdGFydC5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICB0aGlzLl9mcmFnbWVudFN0YXJ0LmRhdGEgPSB0aGlzLl9mcmFnbWVudEVuZC5kYXRhID0gJyc7XG4gICAgICB9XG4gICAgICB0aGlzLl9mcmFnbWVudCA9IGVsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiRlbCA9IGVsO1xuICAgIH1cbiAgICB0aGlzLiRlbC5fX3Z1ZV9fID0gdGhpcztcbiAgICB0aGlzLl9jYWxsSG9vaygnYmVmb3JlQ29tcGlsZScpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYW5kIGJpbmQgYSBkaXJlY3RpdmUgdG8gYW4gZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGRlc2NyaXB0b3IgLSBwYXJzZWQgZGlyZWN0aXZlIGRlc2NyaXB0b3JcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlICAgLSB0YXJnZXQgbm9kZVxuICAgKiBAcGFyYW0ge1Z1ZX0gW2hvc3RdIC0gdHJhbnNjbHVzaW9uIGhvc3QgY29tcG9uZW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbc2NvcGVdIC0gdi1mb3Igc2NvcGVcbiAgICogQHBhcmFtIHtGcmFnbWVudH0gW2ZyYWddIC0gb3duZXIgZnJhZ21lbnRcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5fYmluZERpciA9IGZ1bmN0aW9uIChkZXNjcmlwdG9yLCBub2RlLCBob3N0LCBzY29wZSwgZnJhZykge1xuICAgIHRoaXMuX2RpcmVjdGl2ZXMucHVzaChuZXcgRGlyZWN0aXZlKGRlc2NyaXB0b3IsIHRoaXMsIG5vZGUsIGhvc3QsIHNjb3BlLCBmcmFnKSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRlYXJkb3duIGFuIGluc3RhbmNlLCB1bm9ic2VydmVzIHRoZSBkYXRhLCB1bmJpbmQgYWxsIHRoZVxuICAgKiBkaXJlY3RpdmVzLCB0dXJuIG9mZiBhbGwgdGhlIGV2ZW50IGxpc3RlbmVycywgZXRjLlxuICAgKlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHJlbW92ZSAtIHdoZXRoZXIgdG8gcmVtb3ZlIHRoZSBET00gbm9kZS5cbiAgICogQHBhcmFtIHtCb29sZWFufSBkZWZlckNsZWFudXAgLSBpZiB0cnVlLCBkZWZlciBjbGVhbnVwIHRvXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmUgY2FsbGVkIGxhdGVyXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuX2Rlc3Ryb3kgPSBmdW5jdGlvbiAocmVtb3ZlLCBkZWZlckNsZWFudXApIHtcbiAgICBpZiAodGhpcy5faXNCZWluZ0Rlc3Ryb3llZCkge1xuICAgICAgaWYgKCFkZWZlckNsZWFudXApIHtcbiAgICAgICAgdGhpcy5fY2xlYW51cCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBkZXN0cm95UmVhZHk7XG4gICAgdmFyIHBlbmRpbmdSZW1vdmFsO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vIENsZWFudXAgc2hvdWxkIGJlIGNhbGxlZCBlaXRoZXIgc3luY2hyb25vdXNseSBvciBhc3luY2hyb25veXNseSBhc1xuICAgIC8vIGNhbGxiYWNrIG9mIHRoaXMuJHJlbW92ZSgpLCBvciBpZiByZW1vdmUgYW5kIGRlZmVyQ2xlYW51cCBhcmUgZmFsc2UuXG4gICAgLy8gSW4gYW55IGNhc2UgaXQgc2hvdWxkIGJlIGNhbGxlZCBhZnRlciBhbGwgb3RoZXIgcmVtb3ZpbmcsIHVuYmluZGluZyBhbmRcbiAgICAvLyB0dXJuaW5nIG9mIGlzIGRvbmVcbiAgICB2YXIgY2xlYW51cElmUG9zc2libGUgPSBmdW5jdGlvbiBjbGVhbnVwSWZQb3NzaWJsZSgpIHtcbiAgICAgIGlmIChkZXN0cm95UmVhZHkgJiYgIXBlbmRpbmdSZW1vdmFsICYmICFkZWZlckNsZWFudXApIHtcbiAgICAgICAgc2VsZi5fY2xlYW51cCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyByZW1vdmUgRE9NIGVsZW1lbnRcbiAgICBpZiAocmVtb3ZlICYmIHRoaXMuJGVsKSB7XG4gICAgICBwZW5kaW5nUmVtb3ZhbCA9IHRydWU7XG4gICAgICB0aGlzLiRyZW1vdmUoZnVuY3Rpb24gKCkge1xuICAgICAgICBwZW5kaW5nUmVtb3ZhbCA9IGZhbHNlO1xuICAgICAgICBjbGVhbnVwSWZQb3NzaWJsZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fY2FsbEhvb2soJ2JlZm9yZURlc3Ryb3knKTtcbiAgICB0aGlzLl9pc0JlaW5nRGVzdHJveWVkID0gdHJ1ZTtcbiAgICB2YXIgaTtcbiAgICAvLyByZW1vdmUgc2VsZiBmcm9tIHBhcmVudC4gb25seSBuZWNlc3NhcnlcbiAgICAvLyBpZiBwYXJlbnQgaXMgbm90IGJlaW5nIGRlc3Ryb3llZCBhcyB3ZWxsLlxuICAgIHZhciBwYXJlbnQgPSB0aGlzLiRwYXJlbnQ7XG4gICAgaWYgKHBhcmVudCAmJiAhcGFyZW50Ll9pc0JlaW5nRGVzdHJveWVkKSB7XG4gICAgICBwYXJlbnQuJGNoaWxkcmVuLiRyZW1vdmUodGhpcyk7XG4gICAgICAvLyB1bnJlZ2lzdGVyIHJlZiAocmVtb3ZlOiB0cnVlKVxuICAgICAgdGhpcy5fdXBkYXRlUmVmKHRydWUpO1xuICAgIH1cbiAgICAvLyBkZXN0cm95IGFsbCBjaGlsZHJlbi5cbiAgICBpID0gdGhpcy4kY2hpbGRyZW4ubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHRoaXMuJGNoaWxkcmVuW2ldLiRkZXN0cm95KCk7XG4gICAgfVxuICAgIC8vIHRlYXJkb3duIHByb3BzXG4gICAgaWYgKHRoaXMuX3Byb3BzVW5saW5rRm4pIHtcbiAgICAgIHRoaXMuX3Byb3BzVW5saW5rRm4oKTtcbiAgICB9XG4gICAgLy8gdGVhcmRvd24gYWxsIGRpcmVjdGl2ZXMuIHRoaXMgYWxzbyB0ZWFyc2Rvd24gYWxsXG4gICAgLy8gZGlyZWN0aXZlLW93bmVkIHdhdGNoZXJzLlxuICAgIGlmICh0aGlzLl91bmxpbmtGbikge1xuICAgICAgdGhpcy5fdW5saW5rRm4oKTtcbiAgICB9XG4gICAgaSA9IHRoaXMuX3dhdGNoZXJzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB0aGlzLl93YXRjaGVyc1tpXS50ZWFyZG93bigpO1xuICAgIH1cbiAgICAvLyByZW1vdmUgcmVmZXJlbmNlIHRvIHNlbGYgb24gJGVsXG4gICAgaWYgKHRoaXMuJGVsKSB7XG4gICAgICB0aGlzLiRlbC5fX3Z1ZV9fID0gbnVsbDtcbiAgICB9XG5cbiAgICBkZXN0cm95UmVhZHkgPSB0cnVlO1xuICAgIGNsZWFudXBJZlBvc3NpYmxlKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENsZWFuIHVwIHRvIGVuc3VyZSBnYXJiYWdlIGNvbGxlY3Rpb24uXG4gICAqIFRoaXMgaXMgY2FsbGVkIGFmdGVyIHRoZSBsZWF2ZSB0cmFuc2l0aW9uIGlmIHRoZXJlXG4gICAqIGlzIGFueS5cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5fY2xlYW51cCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gcmVtb3ZlIHNlbGYgZnJvbSBvd25lciBmcmFnbWVudFxuICAgIC8vIGRvIGl0IGluIGNsZWFudXAgc28gdGhhdCB3ZSBjYW4gY2FsbCAkZGVzdHJveSB3aXRoXG4gICAgLy8gZGVmZXIgcmlnaHQgd2hlbiBhIGZyYWdtZW50IGlzIGFib3V0IHRvIGJlIHJlbW92ZWQuXG4gICAgaWYgKHRoaXMuX2ZyYWcpIHtcbiAgICAgIHRoaXMuX2ZyYWcuY2hpbGRyZW4uJHJlbW92ZSh0aGlzKTtcbiAgICB9XG4gICAgLy8gcmVtb3ZlIHJlZmVyZW5jZSBmcm9tIGRhdGEgb2JcbiAgICAvLyBmcm96ZW4gb2JqZWN0IG1heSBub3QgaGF2ZSBvYnNlcnZlci5cbiAgICBpZiAodGhpcy5fZGF0YSAmJiB0aGlzLl9kYXRhLl9fb2JfXykge1xuICAgICAgdGhpcy5fZGF0YS5fX29iX18ucmVtb3ZlVm0odGhpcyk7XG4gICAgfVxuICAgIC8vIENsZWFuIHVwIHJlZmVyZW5jZXMgdG8gcHJpdmF0ZSBwcm9wZXJ0aWVzIGFuZCBvdGhlclxuICAgIC8vIGluc3RhbmNlcy4gcHJlc2VydmUgcmVmZXJlbmNlIHRvIF9kYXRhIHNvIHRoYXQgcHJveHlcbiAgICAvLyBhY2Nlc3NvcnMgc3RpbGwgd29yay4gVGhlIG9ubHkgcG90ZW50aWFsIHNpZGUgZWZmZWN0XG4gICAgLy8gaGVyZSBpcyB0aGF0IG11dGF0aW5nIHRoZSBpbnN0YW5jZSBhZnRlciBpdCdzIGRlc3Ryb3llZFxuICAgIC8vIG1heSBhZmZlY3QgdGhlIHN0YXRlIG9mIG90aGVyIGNvbXBvbmVudHMgdGhhdCBhcmUgc3RpbGxcbiAgICAvLyBvYnNlcnZpbmcgdGhlIHNhbWUgb2JqZWN0LCBidXQgdGhhdCBzZWVtcyB0byBiZSBhXG4gICAgLy8gcmVhc29uYWJsZSByZXNwb25zaWJpbGl0eSBmb3IgdGhlIHVzZXIgcmF0aGVyIHRoYW5cbiAgICAvLyBhbHdheXMgdGhyb3dpbmcgYW4gZXJyb3Igb24gdGhlbS5cbiAgICB0aGlzLiRlbCA9IHRoaXMuJHBhcmVudCA9IHRoaXMuJHJvb3QgPSB0aGlzLiRjaGlsZHJlbiA9IHRoaXMuX3dhdGNoZXJzID0gdGhpcy5fY29udGV4dCA9IHRoaXMuX3Njb3BlID0gdGhpcy5fZGlyZWN0aXZlcyA9IG51bGw7XG4gICAgLy8gY2FsbCB0aGUgbGFzdCBob29rLi4uXG4gICAgdGhpcy5faXNEZXN0cm95ZWQgPSB0cnVlO1xuICAgIHRoaXMuX2NhbGxIb29rKCdkZXN0cm95ZWQnKTtcbiAgICAvLyB0dXJuIG9mZiBhbGwgaW5zdGFuY2UgbGlzdGVuZXJzLlxuICAgIHRoaXMuJG9mZigpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBtaXNjTWl4aW4gKFZ1ZSkge1xuICAvKipcbiAgICogQXBwbHkgYSBsaXN0IG9mIGZpbHRlciAoZGVzY3JpcHRvcnMpIHRvIGEgdmFsdWUuXG4gICAqIFVzaW5nIHBsYWluIGZvciBsb29wcyBoZXJlIGJlY2F1c2UgdGhpcyB3aWxsIGJlIGNhbGxlZCBpblxuICAgKiB0aGUgZ2V0dGVyIG9mIGFueSB3YXRjaGVyIHdpdGggZmlsdGVycyBzbyBpdCBpcyB2ZXJ5XG4gICAqIHBlcmZvcm1hbmNlIHNlbnNpdGl2ZS5cbiAgICpcbiAgICogQHBhcmFtIHsqfSB2YWx1ZVxuICAgKiBAcGFyYW0geyp9IFtvbGRWYWx1ZV1cbiAgICogQHBhcmFtIHtBcnJheX0gZmlsdGVyc1xuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHdyaXRlXG4gICAqIEByZXR1cm4geyp9XG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuX2FwcGx5RmlsdGVycyA9IGZ1bmN0aW9uICh2YWx1ZSwgb2xkVmFsdWUsIGZpbHRlcnMsIHdyaXRlKSB7XG4gICAgdmFyIGZpbHRlciwgZm4sIGFyZ3MsIGFyZywgb2Zmc2V0LCBpLCBsLCBqLCBrO1xuICAgIGZvciAoaSA9IDAsIGwgPSBmaWx0ZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZmlsdGVyID0gZmlsdGVyc1t3cml0ZSA/IGwgLSBpIC0gMSA6IGldO1xuICAgICAgZm4gPSByZXNvbHZlQXNzZXQodGhpcy4kb3B0aW9ucywgJ2ZpbHRlcnMnLCBmaWx0ZXIubmFtZSwgdHJ1ZSk7XG4gICAgICBpZiAoIWZuKSBjb250aW51ZTtcbiAgICAgIGZuID0gd3JpdGUgPyBmbi53cml0ZSA6IGZuLnJlYWQgfHwgZm47XG4gICAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSBjb250aW51ZTtcbiAgICAgIGFyZ3MgPSB3cml0ZSA/IFt2YWx1ZSwgb2xkVmFsdWVdIDogW3ZhbHVlXTtcbiAgICAgIG9mZnNldCA9IHdyaXRlID8gMiA6IDE7XG4gICAgICBpZiAoZmlsdGVyLmFyZ3MpIHtcbiAgICAgICAgZm9yIChqID0gMCwgayA9IGZpbHRlci5hcmdzLmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgIGFyZyA9IGZpbHRlci5hcmdzW2pdO1xuICAgICAgICAgIGFyZ3NbaiArIG9mZnNldF0gPSBhcmcuZHluYW1pYyA/IHRoaXMuJGdldChhcmcudmFsdWUpIDogYXJnLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YWx1ZSA9IGZuLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlc29sdmUgYSBjb21wb25lbnQsIGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBjb21wb25lbnRcbiAgICogaXMgZGVmaW5lZCBub3JtYWxseSBvciB1c2luZyBhbiBhc3luYyBmYWN0b3J5IGZ1bmN0aW9uLlxuICAgKiBSZXNvbHZlcyBzeW5jaHJvbm91c2x5IGlmIGFscmVhZHkgcmVzb2x2ZWQsIG90aGVyd2lzZVxuICAgKiByZXNvbHZlcyBhc3luY2hyb25vdXNseSBhbmQgY2FjaGVzIHRoZSByZXNvbHZlZFxuICAgKiBjb25zdHJ1Y3RvciBvbiB0aGUgZmFjdG9yeS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHZhbHVlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuX3Jlc29sdmVDb21wb25lbnQgPSBmdW5jdGlvbiAodmFsdWUsIGNiKSB7XG4gICAgdmFyIGZhY3Rvcnk7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZmFjdG9yeSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBmYWN0b3J5ID0gcmVzb2x2ZUFzc2V0KHRoaXMuJG9wdGlvbnMsICdjb21wb25lbnRzJywgdmFsdWUsIHRydWUpO1xuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIWZhY3RvcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gYXN5bmMgY29tcG9uZW50IGZhY3RvcnlcbiAgICBpZiAoIWZhY3Rvcnkub3B0aW9ucykge1xuICAgICAgaWYgKGZhY3RvcnkucmVzb2x2ZWQpIHtcbiAgICAgICAgLy8gY2FjaGVkXG4gICAgICAgIGNiKGZhY3RvcnkucmVzb2x2ZWQpO1xuICAgICAgfSBlbHNlIGlmIChmYWN0b3J5LnJlcXVlc3RlZCkge1xuICAgICAgICAvLyBwb29sIGNhbGxiYWNrc1xuICAgICAgICBmYWN0b3J5LnBlbmRpbmdDYWxsYmFja3MucHVzaChjYik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5LnJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgIHZhciBjYnMgPSBmYWN0b3J5LnBlbmRpbmdDYWxsYmFja3MgPSBbY2JdO1xuICAgICAgICBmYWN0b3J5LmNhbGwodGhpcywgZnVuY3Rpb24gcmVzb2x2ZShyZXMpIHtcbiAgICAgICAgICBpZiAoaXNQbGFpbk9iamVjdChyZXMpKSB7XG4gICAgICAgICAgICByZXMgPSBWdWUuZXh0ZW5kKHJlcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGNhY2hlIHJlc29sdmVkXG4gICAgICAgICAgZmFjdG9yeS5yZXNvbHZlZCA9IHJlcztcbiAgICAgICAgICAvLyBpbnZva2UgY2FsbGJhY2tzXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjYnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBjYnNbaV0ocmVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uIHJlamVjdChyZWFzb24pIHtcbiAgICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oJ0ZhaWxlZCB0byByZXNvbHZlIGFzeW5jIGNvbXBvbmVudCcgKyAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/ICc6ICcgKyB2YWx1ZSA6ICcnKSArICcuICcgKyAocmVhc29uID8gJ1xcblJlYXNvbjogJyArIHJlYXNvbiA6ICcnKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBub3JtYWwgY29tcG9uZW50XG4gICAgICBjYihmYWN0b3J5KTtcbiAgICB9XG4gIH07XG59XG5cbnZhciBmaWx0ZXJSRSQxID0gL1tefF1cXHxbXnxdLztcblxuZnVuY3Rpb24gZGF0YUFQSSAoVnVlKSB7XG4gIC8qKlxuICAgKiBHZXQgdGhlIHZhbHVlIGZyb20gYW4gZXhwcmVzc2lvbiBvbiB0aGlzIHZtLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXhwXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2FzU3RhdGVtZW50XVxuICAgKiBAcmV0dXJuIHsqfVxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLiRnZXQgPSBmdW5jdGlvbiAoZXhwLCBhc1N0YXRlbWVudCkge1xuICAgIHZhciByZXMgPSBwYXJzZUV4cHJlc3Npb24oZXhwKTtcbiAgICBpZiAocmVzKSB7XG4gICAgICBpZiAoYXNTdGF0ZW1lbnQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gc3RhdGVtZW50SGFuZGxlcigpIHtcbiAgICAgICAgICBzZWxmLiRhcmd1bWVudHMgPSB0b0FycmF5KGFyZ3VtZW50cyk7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IHJlcy5nZXQuY2FsbChzZWxmLCBzZWxmKTtcbiAgICAgICAgICBzZWxmLiRhcmd1bWVudHMgPSBudWxsO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiByZXMuZ2V0LmNhbGwodGhpcywgdGhpcyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHZhbHVlIGZyb20gYW4gZXhwcmVzc2lvbiBvbiB0aGlzIHZtLlxuICAgKiBUaGUgZXhwcmVzc2lvbiBtdXN0IGJlIGEgdmFsaWQgbGVmdC1oYW5kXG4gICAqIGV4cHJlc3Npb24gaW4gYW4gYXNzaWdubWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGV4cFxuICAgKiBAcGFyYW0geyp9IHZhbFxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLiRzZXQgPSBmdW5jdGlvbiAoZXhwLCB2YWwpIHtcbiAgICB2YXIgcmVzID0gcGFyc2VFeHByZXNzaW9uKGV4cCwgdHJ1ZSk7XG4gICAgaWYgKHJlcyAmJiByZXMuc2V0KSB7XG4gICAgICByZXMuc2V0LmNhbGwodGhpcywgdGhpcywgdmFsKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIERlbGV0ZSBhIHByb3BlcnR5IG9uIHRoZSBWTVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJGRlbGV0ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBkZWwodGhpcy5fZGF0YSwga2V5KTtcbiAgfTtcblxuICAvKipcbiAgICogV2F0Y2ggYW4gZXhwcmVzc2lvbiwgdHJpZ2dlciBjYWxsYmFjayB3aGVuIGl0c1xuICAgKiB2YWx1ZSBjaGFuZ2VzLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gZXhwT3JGblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqICAgICAgICAgICAgICAgICAtIHtCb29sZWFufSBkZWVwXG4gICAqICAgICAgICAgICAgICAgICAtIHtCb29sZWFufSBpbW1lZGlhdGVcbiAgICogQHJldHVybiB7RnVuY3Rpb259IC0gdW53YXRjaEZuXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJHdhdGNoID0gZnVuY3Rpb24gKGV4cE9yRm4sIGNiLCBvcHRpb25zKSB7XG4gICAgdmFyIHZtID0gdGhpcztcbiAgICB2YXIgcGFyc2VkO1xuICAgIGlmICh0eXBlb2YgZXhwT3JGbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHBhcnNlZCA9IHBhcnNlRGlyZWN0aXZlKGV4cE9yRm4pO1xuICAgICAgZXhwT3JGbiA9IHBhcnNlZC5leHByZXNzaW9uO1xuICAgIH1cbiAgICB2YXIgd2F0Y2hlciA9IG5ldyBXYXRjaGVyKHZtLCBleHBPckZuLCBjYiwge1xuICAgICAgZGVlcDogb3B0aW9ucyAmJiBvcHRpb25zLmRlZXAsXG4gICAgICBzeW5jOiBvcHRpb25zICYmIG9wdGlvbnMuc3luYyxcbiAgICAgIGZpbHRlcnM6IHBhcnNlZCAmJiBwYXJzZWQuZmlsdGVycyxcbiAgICAgIHVzZXI6ICFvcHRpb25zIHx8IG9wdGlvbnMudXNlciAhPT0gZmFsc2VcbiAgICB9KTtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmltbWVkaWF0ZSkge1xuICAgICAgY2IuY2FsbCh2bSwgd2F0Y2hlci52YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiB1bndhdGNoRm4oKSB7XG4gICAgICB3YXRjaGVyLnRlYXJkb3duKCk7XG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogRXZhbHVhdGUgYSB0ZXh0IGRpcmVjdGl2ZSwgaW5jbHVkaW5nIGZpbHRlcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0XG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2FzU3RhdGVtZW50XVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJGV2YWwgPSBmdW5jdGlvbiAodGV4dCwgYXNTdGF0ZW1lbnQpIHtcbiAgICAvLyBjaGVjayBmb3IgZmlsdGVycy5cbiAgICBpZiAoZmlsdGVyUkUkMS50ZXN0KHRleHQpKSB7XG4gICAgICB2YXIgZGlyID0gcGFyc2VEaXJlY3RpdmUodGV4dCk7XG4gICAgICAvLyB0aGUgZmlsdGVyIHJlZ2V4IGNoZWNrIG1pZ2h0IGdpdmUgZmFsc2UgcG9zaXRpdmVcbiAgICAgIC8vIGZvciBwaXBlcyBpbnNpZGUgc3RyaW5ncywgc28gaXQncyBwb3NzaWJsZSB0aGF0XG4gICAgICAvLyB3ZSBkb24ndCBnZXQgYW55IGZpbHRlcnMgaGVyZVxuICAgICAgdmFyIHZhbCA9IHRoaXMuJGdldChkaXIuZXhwcmVzc2lvbiwgYXNTdGF0ZW1lbnQpO1xuICAgICAgcmV0dXJuIGRpci5maWx0ZXJzID8gdGhpcy5fYXBwbHlGaWx0ZXJzKHZhbCwgbnVsbCwgZGlyLmZpbHRlcnMpIDogdmFsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBubyBmaWx0ZXJcbiAgICAgIHJldHVybiB0aGlzLiRnZXQodGV4dCwgYXNTdGF0ZW1lbnQpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogSW50ZXJwb2xhdGUgYSBwaWVjZSBvZiB0ZW1wbGF0ZSB0ZXh0LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdGV4dFxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJGludGVycG9sYXRlID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgICB2YXIgdG9rZW5zID0gcGFyc2VUZXh0KHRleHQpO1xuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgaWYgKHRva2Vucykge1xuICAgICAgaWYgKHRva2Vucy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHZtLiRldmFsKHRva2Vuc1swXS52YWx1ZSkgKyAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0b2tlbnMubWFwKGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgICAgIHJldHVybiB0b2tlbi50YWcgPyB2bS4kZXZhbCh0b2tlbi52YWx1ZSkgOiB0b2tlbi52YWx1ZTtcbiAgICAgICAgfSkuam9pbignJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogTG9nIGluc3RhbmNlIGRhdGEgYXMgYSBwbGFpbiBKUyBvYmplY3RcbiAgICogc28gdGhhdCBpdCBpcyBlYXNpZXIgdG8gaW5zcGVjdCBpbiBjb25zb2xlLlxuICAgKiBUaGlzIG1ldGhvZCBhc3N1bWVzIGNvbnNvbGUgaXMgYXZhaWxhYmxlLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gW3BhdGhdXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJGxvZyA9IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgdmFyIGRhdGEgPSBwYXRoID8gZ2V0UGF0aCh0aGlzLl9kYXRhLCBwYXRoKSA6IHRoaXMuX2RhdGE7XG4gICAgaWYgKGRhdGEpIHtcbiAgICAgIGRhdGEgPSBjbGVhbihkYXRhKTtcbiAgICB9XG4gICAgLy8gaW5jbHVkZSBjb21wdXRlZCBmaWVsZHNcbiAgICBpZiAoIXBhdGgpIHtcbiAgICAgIHZhciBrZXk7XG4gICAgICBmb3IgKGtleSBpbiB0aGlzLiRvcHRpb25zLmNvbXB1dGVkKSB7XG4gICAgICAgIGRhdGFba2V5XSA9IGNsZWFuKHRoaXNba2V5XSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fcHJvcHMpIHtcbiAgICAgICAgZm9yIChrZXkgaW4gdGhpcy5fcHJvcHMpIHtcbiAgICAgICAgICBkYXRhW2tleV0gPSBjbGVhbih0aGlzW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBcImNsZWFuXCIgYSBnZXR0ZXIvc2V0dGVyIGNvbnZlcnRlZCBvYmplY3QgaW50byBhIHBsYWluXG4gICAqIG9iamVjdCBjb3B5LlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gLSBvYmpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICBmdW5jdGlvbiBjbGVhbihvYmopIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkb21BUEkgKFZ1ZSkge1xuICAvKipcbiAgICogQ29udmVuaWVuY2Ugb24taW5zdGFuY2UgbmV4dFRpY2suIFRoZSBjYWxsYmFjayBpc1xuICAgKiBhdXRvLWJvdW5kIHRvIHRoZSBpbnN0YW5jZSwgYW5kIHRoaXMgYXZvaWRzIGNvbXBvbmVudFxuICAgKiBtb2R1bGVzIGhhdmluZyB0byByZWx5IG9uIHRoZSBnbG9iYWwgVnVlLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLiRuZXh0VGljayA9IGZ1bmN0aW9uIChmbikge1xuICAgIG5leHRUaWNrKGZuLCB0aGlzKTtcbiAgfTtcblxuICAvKipcbiAgICogQXBwZW5kIGluc3RhbmNlIHRvIHRhcmdldFxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3dpdGhUcmFuc2l0aW9uXSAtIGRlZmF1bHRzIHRvIHRydWVcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kYXBwZW5kVG8gPSBmdW5jdGlvbiAodGFyZ2V0LCBjYiwgd2l0aFRyYW5zaXRpb24pIHtcbiAgICByZXR1cm4gaW5zZXJ0KHRoaXMsIHRhcmdldCwgY2IsIHdpdGhUcmFuc2l0aW9uLCBhcHBlbmQsIGFwcGVuZFdpdGhUcmFuc2l0aW9uKTtcbiAgfTtcblxuICAvKipcbiAgICogUHJlcGVuZCBpbnN0YW5jZSB0byB0YXJnZXRcbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSB0YXJnZXRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFt3aXRoVHJhbnNpdGlvbl0gLSBkZWZhdWx0cyB0byB0cnVlXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJHByZXBlbmRUbyA9IGZ1bmN0aW9uICh0YXJnZXQsIGNiLCB3aXRoVHJhbnNpdGlvbikge1xuICAgIHRhcmdldCA9IHF1ZXJ5KHRhcmdldCk7XG4gICAgaWYgKHRhcmdldC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgIHRoaXMuJGJlZm9yZSh0YXJnZXQuZmlyc3RDaGlsZCwgY2IsIHdpdGhUcmFuc2l0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4kYXBwZW5kVG8odGFyZ2V0LCBjYiwgd2l0aFRyYW5zaXRpb24pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogSW5zZXJ0IGluc3RhbmNlIGJlZm9yZSB0YXJnZXRcbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSB0YXJnZXRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFt3aXRoVHJhbnNpdGlvbl0gLSBkZWZhdWx0cyB0byB0cnVlXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJGJlZm9yZSA9IGZ1bmN0aW9uICh0YXJnZXQsIGNiLCB3aXRoVHJhbnNpdGlvbikge1xuICAgIHJldHVybiBpbnNlcnQodGhpcywgdGFyZ2V0LCBjYiwgd2l0aFRyYW5zaXRpb24sIGJlZm9yZVdpdGhDYiwgYmVmb3JlV2l0aFRyYW5zaXRpb24pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbnNlcnQgaW5zdGFuY2UgYWZ0ZXIgdGFyZ2V0XG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gdGFyZ2V0XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cbiAgICogQHBhcmFtIHtCb29sZWFufSBbd2l0aFRyYW5zaXRpb25dIC0gZGVmYXVsdHMgdG8gdHJ1ZVxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLiRhZnRlciA9IGZ1bmN0aW9uICh0YXJnZXQsIGNiLCB3aXRoVHJhbnNpdGlvbikge1xuICAgIHRhcmdldCA9IHF1ZXJ5KHRhcmdldCk7XG4gICAgaWYgKHRhcmdldC5uZXh0U2libGluZykge1xuICAgICAgdGhpcy4kYmVmb3JlKHRhcmdldC5uZXh0U2libGluZywgY2IsIHdpdGhUcmFuc2l0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4kYXBwZW5kVG8odGFyZ2V0LnBhcmVudE5vZGUsIGNiLCB3aXRoVHJhbnNpdGlvbik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmUgaW5zdGFuY2UgZnJvbSBET01cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFt3aXRoVHJhbnNpdGlvbl0gLSBkZWZhdWx0cyB0byB0cnVlXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJHJlbW92ZSA9IGZ1bmN0aW9uIChjYiwgd2l0aFRyYW5zaXRpb24pIHtcbiAgICBpZiAoIXRoaXMuJGVsLnBhcmVudE5vZGUpIHtcbiAgICAgIHJldHVybiBjYiAmJiBjYigpO1xuICAgIH1cbiAgICB2YXIgaW5Eb2N1bWVudCA9IHRoaXMuX2lzQXR0YWNoZWQgJiYgaW5Eb2ModGhpcy4kZWwpO1xuICAgIC8vIGlmIHdlIGFyZSBub3QgaW4gZG9jdW1lbnQsIG5vIG5lZWQgdG8gY2hlY2tcbiAgICAvLyBmb3IgdHJhbnNpdGlvbnNcbiAgICBpZiAoIWluRG9jdW1lbnQpIHdpdGhUcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciByZWFsQ2IgPSBmdW5jdGlvbiByZWFsQ2IoKSB7XG4gICAgICBpZiAoaW5Eb2N1bWVudCkgc2VsZi5fY2FsbEhvb2soJ2RldGFjaGVkJyk7XG4gICAgICBpZiAoY2IpIGNiKCk7XG4gICAgfTtcbiAgICBpZiAodGhpcy5faXNGcmFnbWVudCkge1xuICAgICAgcmVtb3ZlTm9kZVJhbmdlKHRoaXMuX2ZyYWdtZW50U3RhcnQsIHRoaXMuX2ZyYWdtZW50RW5kLCB0aGlzLCB0aGlzLl9mcmFnbWVudCwgcmVhbENiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG9wID0gd2l0aFRyYW5zaXRpb24gPT09IGZhbHNlID8gcmVtb3ZlV2l0aENiIDogcmVtb3ZlV2l0aFRyYW5zaXRpb247XG4gICAgICBvcCh0aGlzLiRlbCwgdGhpcywgcmVhbENiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNoYXJlZCBET00gaW5zZXJ0aW9uIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge1Z1ZX0gdm1cbiAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFt3aXRoVHJhbnNpdGlvbl1cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gb3AxIC0gb3AgZm9yIG5vbi10cmFuc2l0aW9uIGluc2VydFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcDIgLSBvcCBmb3IgdHJhbnNpdGlvbiBpbnNlcnRcbiAgICogQHJldHVybiB2bVxuICAgKi9cblxuICBmdW5jdGlvbiBpbnNlcnQodm0sIHRhcmdldCwgY2IsIHdpdGhUcmFuc2l0aW9uLCBvcDEsIG9wMikge1xuICAgIHRhcmdldCA9IHF1ZXJ5KHRhcmdldCk7XG4gICAgdmFyIHRhcmdldElzRGV0YWNoZWQgPSAhaW5Eb2ModGFyZ2V0KTtcbiAgICB2YXIgb3AgPSB3aXRoVHJhbnNpdGlvbiA9PT0gZmFsc2UgfHwgdGFyZ2V0SXNEZXRhY2hlZCA/IG9wMSA6IG9wMjtcbiAgICB2YXIgc2hvdWxkQ2FsbEhvb2sgPSAhdGFyZ2V0SXNEZXRhY2hlZCAmJiAhdm0uX2lzQXR0YWNoZWQgJiYgIWluRG9jKHZtLiRlbCk7XG4gICAgaWYgKHZtLl9pc0ZyYWdtZW50KSB7XG4gICAgICBtYXBOb2RlUmFuZ2Uodm0uX2ZyYWdtZW50U3RhcnQsIHZtLl9mcmFnbWVudEVuZCwgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgb3Aobm9kZSwgdGFyZ2V0LCB2bSk7XG4gICAgICB9KTtcbiAgICAgIGNiICYmIGNiKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wKHZtLiRlbCwgdGFyZ2V0LCB2bSwgY2IpO1xuICAgIH1cbiAgICBpZiAoc2hvdWxkQ2FsbEhvb2spIHtcbiAgICAgIHZtLl9jYWxsSG9vaygnYXR0YWNoZWQnKTtcbiAgICB9XG4gICAgcmV0dXJuIHZtO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciBzZWxlY3RvcnNcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudH0gZWxcbiAgICovXG5cbiAgZnVuY3Rpb24gcXVlcnkoZWwpIHtcbiAgICByZXR1cm4gdHlwZW9mIGVsID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwpIDogZWw7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kIG9wZXJhdGlvbiB0aGF0IHRha2VzIGEgY2FsbGJhY2suXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gZWxcbiAgICogQHBhcmFtIHtOb2RlfSB0YXJnZXRcbiAgICogQHBhcmFtIHtWdWV9IHZtIC0gdW51c2VkXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cbiAgICovXG5cbiAgZnVuY3Rpb24gYXBwZW5kKGVsLCB0YXJnZXQsIHZtLCBjYikge1xuICAgIHRhcmdldC5hcHBlbmRDaGlsZChlbCk7XG4gICAgaWYgKGNiKSBjYigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc2VydEJlZm9yZSBvcGVyYXRpb24gdGhhdCB0YWtlcyBhIGNhbGxiYWNrLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IGVsXG4gICAqIEBwYXJhbSB7Tm9kZX0gdGFyZ2V0XG4gICAqIEBwYXJhbSB7VnVlfSB2bSAtIHVudXNlZFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGJlZm9yZVdpdGhDYihlbCwgdGFyZ2V0LCB2bSwgY2IpIHtcbiAgICBiZWZvcmUoZWwsIHRhcmdldCk7XG4gICAgaWYgKGNiKSBjYigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBvcGVyYXRpb24gdGhhdCB0YWtlcyBhIGNhbGxiYWNrLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IGVsXG4gICAqIEBwYXJhbSB7VnVlfSB2bSAtIHVudXNlZFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJlbW92ZVdpdGhDYihlbCwgdm0sIGNiKSB7XG4gICAgcmVtb3ZlKGVsKTtcbiAgICBpZiAoY2IpIGNiKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZlbnRzQVBJIChWdWUpIHtcbiAgLyoqXG4gICAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLiRvbiA9IGZ1bmN0aW9uIChldmVudCwgZm4pIHtcbiAgICAodGhpcy5fZXZlbnRzW2V2ZW50XSB8fCAodGhpcy5fZXZlbnRzW2V2ZW50XSA9IFtdKSkucHVzaChmbik7XG4gICAgbW9kaWZ5TGlzdGVuZXJDb3VudCh0aGlzLCBldmVudCwgMSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICAgKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kb25jZSA9IGZ1bmN0aW9uIChldmVudCwgZm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgZnVuY3Rpb24gb24oKSB7XG4gICAgICBzZWxmLiRvZmYoZXZlbnQsIG9uKTtcbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICAgIG9uLmZuID0gZm47XG4gICAgdGhpcy4kb24oZXZlbnQsIG9uKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAgICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLiRvZmYgPSBmdW5jdGlvbiAoZXZlbnQsIGZuKSB7XG4gICAgdmFyIGNicztcbiAgICAvLyBhbGxcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGlmICh0aGlzLiRwYXJlbnQpIHtcbiAgICAgICAgZm9yIChldmVudCBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgICAgICBjYnMgPSB0aGlzLl9ldmVudHNbZXZlbnRdO1xuICAgICAgICAgIGlmIChjYnMpIHtcbiAgICAgICAgICAgIG1vZGlmeUxpc3RlbmVyQ291bnQodGhpcywgZXZlbnQsIC1jYnMubGVuZ3RoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8vIHNwZWNpZmljIGV2ZW50XG4gICAgY2JzID0gdGhpcy5fZXZlbnRzW2V2ZW50XTtcbiAgICBpZiAoIWNicykge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICBtb2RpZnlMaXN0ZW5lckNvdW50KHRoaXMsIGV2ZW50LCAtY2JzLmxlbmd0aCk7XG4gICAgICB0aGlzLl9ldmVudHNbZXZlbnRdID0gbnVsbDtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvLyBzcGVjaWZpYyBoYW5kbGVyXG4gICAgdmFyIGNiO1xuICAgIHZhciBpID0gY2JzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBjYiA9IGNic1tpXTtcbiAgICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICAgIG1vZGlmeUxpc3RlbmVyQ291bnQodGhpcywgZXZlbnQsIC0xKTtcbiAgICAgICAgY2JzLnNwbGljZShpLCAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGFuIGV2ZW50IG9uIHNlbGYuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZXZlbnRcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gc2hvdWxkUHJvcGFnYXRlXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJGVtaXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgaXNTb3VyY2UgPSB0eXBlb2YgZXZlbnQgPT09ICdzdHJpbmcnO1xuICAgIGV2ZW50ID0gaXNTb3VyY2UgPyBldmVudCA6IGV2ZW50Lm5hbWU7XG4gICAgdmFyIGNicyA9IHRoaXMuX2V2ZW50c1tldmVudF07XG4gICAgdmFyIHNob3VsZFByb3BhZ2F0ZSA9IGlzU291cmNlIHx8ICFjYnM7XG4gICAgaWYgKGNicykge1xuICAgICAgY2JzID0gY2JzLmxlbmd0aCA+IDEgPyB0b0FycmF5KGNicykgOiBjYnM7XG4gICAgICAvLyB0aGlzIGlzIGEgc29tZXdoYXQgaGFja3kgc29sdXRpb24gdG8gdGhlIHF1ZXN0aW9uIHJhaXNlZFxuICAgICAgLy8gaW4gIzIxMDI6IGZvciBhbiBpbmxpbmUgY29tcG9uZW50IGxpc3RlbmVyIGxpa2UgPGNvbXAgQHRlc3Q9XCJkb1RoaXNcIj4sXG4gICAgICAvLyB0aGUgcHJvcGFnYXRpb24gaGFuZGxpbmcgaXMgc29tZXdoYXQgYnJva2VuLiBUaGVyZWZvcmUgd2VcbiAgICAgIC8vIG5lZWQgdG8gdHJlYXQgdGhlc2UgaW5saW5lIGNhbGxiYWNrcyBkaWZmZXJlbnRseS5cbiAgICAgIHZhciBoYXNQYXJlbnRDYnMgPSBpc1NvdXJjZSAmJiBjYnMuc29tZShmdW5jdGlvbiAoY2IpIHtcbiAgICAgICAgcmV0dXJuIGNiLl9mcm9tUGFyZW50O1xuICAgICAgfSk7XG4gICAgICBpZiAoaGFzUGFyZW50Q2JzKSB7XG4gICAgICAgIHNob3VsZFByb3BhZ2F0ZSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIGFyZ3MgPSB0b0FycmF5KGFyZ3VtZW50cywgMSk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNicy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGNiID0gY2JzW2ldO1xuICAgICAgICB2YXIgcmVzID0gY2IuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIGlmIChyZXMgPT09IHRydWUgJiYgKCFoYXNQYXJlbnRDYnMgfHwgY2IuX2Zyb21QYXJlbnQpKSB7XG4gICAgICAgICAgc2hvdWxkUHJvcGFnYXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2hvdWxkUHJvcGFnYXRlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmVseSBicm9hZGNhc3QgYW4gZXZlbnQgdG8gYWxsIGNoaWxkcmVuIGluc3RhbmNlcy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBldmVudFxuICAgKiBAcGFyYW0gey4uLip9IGFkZGl0aW9uYWwgYXJndW1lbnRzXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJGJyb2FkY2FzdCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBpc1NvdXJjZSA9IHR5cGVvZiBldmVudCA9PT0gJ3N0cmluZyc7XG4gICAgZXZlbnQgPSBpc1NvdXJjZSA/IGV2ZW50IDogZXZlbnQubmFtZTtcbiAgICAvLyBpZiBubyBjaGlsZCBoYXMgcmVnaXN0ZXJlZCBmb3IgdGhpcyBldmVudCxcbiAgICAvLyB0aGVuIHRoZXJlJ3Mgbm8gbmVlZCB0byBicm9hZGNhc3QuXG4gICAgaWYgKCF0aGlzLl9ldmVudHNDb3VudFtldmVudF0pIHJldHVybjtcbiAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLiRjaGlsZHJlbjtcbiAgICB2YXIgYXJncyA9IHRvQXJyYXkoYXJndW1lbnRzKTtcbiAgICBpZiAoaXNTb3VyY2UpIHtcbiAgICAgIC8vIHVzZSBvYmplY3QgZXZlbnQgdG8gaW5kaWNhdGUgbm9uLXNvdXJjZSBlbWl0XG4gICAgICAvLyBvbiBjaGlsZHJlblxuICAgICAgYXJnc1swXSA9IHsgbmFtZTogZXZlbnQsIHNvdXJjZTogdGhpcyB9O1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICB2YXIgc2hvdWxkUHJvcGFnYXRlID0gY2hpbGQuJGVtaXQuYXBwbHkoY2hpbGQsIGFyZ3MpO1xuICAgICAgaWYgKHNob3VsZFByb3BhZ2F0ZSkge1xuICAgICAgICBjaGlsZC4kYnJvYWRjYXN0LmFwcGx5KGNoaWxkLCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZWx5IHByb3BhZ2F0ZSBhbiBldmVudCB1cCB0aGUgcGFyZW50IGNoYWluLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgICogQHBhcmFtIHsuLi4qfSBhZGRpdGlvbmFsIGFyZ3VtZW50c1xuICAgKi9cblxuICBWdWUucHJvdG90eXBlLiRkaXNwYXRjaCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBzaG91bGRQcm9wYWdhdGUgPSB0aGlzLiRlbWl0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKCFzaG91bGRQcm9wYWdhdGUpIHJldHVybjtcbiAgICB2YXIgcGFyZW50ID0gdGhpcy4kcGFyZW50O1xuICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMpO1xuICAgIC8vIHVzZSBvYmplY3QgZXZlbnQgdG8gaW5kaWNhdGUgbm9uLXNvdXJjZSBlbWl0XG4gICAgLy8gb24gcGFyZW50c1xuICAgIGFyZ3NbMF0gPSB7IG5hbWU6IGV2ZW50LCBzb3VyY2U6IHRoaXMgfTtcbiAgICB3aGlsZSAocGFyZW50KSB7XG4gICAgICBzaG91bGRQcm9wYWdhdGUgPSBwYXJlbnQuJGVtaXQuYXBwbHkocGFyZW50LCBhcmdzKTtcbiAgICAgIHBhcmVudCA9IHNob3VsZFByb3BhZ2F0ZSA/IHBhcmVudC4kcGFyZW50IDogbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIE1vZGlmeSB0aGUgbGlzdGVuZXIgY291bnRzIG9uIGFsbCBwYXJlbnRzLlxuICAgKiBUaGlzIGJvb2trZWVwaW5nIGFsbG93cyAkYnJvYWRjYXN0IHRvIHJldHVybiBlYXJseSB3aGVuXG4gICAqIG5vIGNoaWxkIGhhcyBsaXN0ZW5lZCB0byBhIGNlcnRhaW4gZXZlbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7VnVlfSB2bVxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50XG4gICAqL1xuXG4gIHZhciBob29rUkUgPSAvXmhvb2s6LztcbiAgZnVuY3Rpb24gbW9kaWZ5TGlzdGVuZXJDb3VudCh2bSwgZXZlbnQsIGNvdW50KSB7XG4gICAgdmFyIHBhcmVudCA9IHZtLiRwYXJlbnQ7XG4gICAgLy8gaG9va3MgZG8gbm90IGdldCBicm9hZGNhc3RlZCBzbyBubyBuZWVkXG4gICAgLy8gdG8gZG8gYm9va2tlZXBpbmcgZm9yIHRoZW1cbiAgICBpZiAoIXBhcmVudCB8fCAhY291bnQgfHwgaG9va1JFLnRlc3QoZXZlbnQpKSByZXR1cm47XG4gICAgd2hpbGUgKHBhcmVudCkge1xuICAgICAgcGFyZW50Ll9ldmVudHNDb3VudFtldmVudF0gPSAocGFyZW50Ll9ldmVudHNDb3VudFtldmVudF0gfHwgMCkgKyBjb3VudDtcbiAgICAgIHBhcmVudCA9IHBhcmVudC4kcGFyZW50O1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBsaWZlY3ljbGVBUEkgKFZ1ZSkge1xuICAvKipcbiAgICogU2V0IGluc3RhbmNlIHRhcmdldCBlbGVtZW50IGFuZCBraWNrIG9mZiB0aGUgY29tcGlsYXRpb25cbiAgICogcHJvY2Vzcy4gVGhlIHBhc3NlZCBpbiBgZWxgIGNhbiBiZSBhIHNlbGVjdG9yIHN0cmluZywgYW5cbiAgICogZXhpc3RpbmcgRWxlbWVudCwgb3IgYSBEb2N1bWVudEZyYWdtZW50IChmb3IgYmxvY2tcbiAgICogaW5zdGFuY2VzKS5cbiAgICpcbiAgICogQHBhcmFtIHtFbGVtZW50fERvY3VtZW50RnJhZ21lbnR8c3RyaW5nfSBlbFxuICAgKiBAcHVibGljXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJG1vdW50ID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgaWYgKHRoaXMuX2lzQ29tcGlsZWQpIHtcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignJG1vdW50KCkgc2hvdWxkIGJlIGNhbGxlZCBvbmx5IG9uY2UuJywgdGhpcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsID0gcXVlcnkoZWwpO1xuICAgIGlmICghZWwpIHtcbiAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgfVxuICAgIHRoaXMuX2NvbXBpbGUoZWwpO1xuICAgIHRoaXMuX2luaXRET01Ib29rcygpO1xuICAgIGlmIChpbkRvYyh0aGlzLiRlbCkpIHtcbiAgICAgIHRoaXMuX2NhbGxIb29rKCdhdHRhY2hlZCcpO1xuICAgICAgcmVhZHkuY2FsbCh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4kb25jZSgnaG9vazphdHRhY2hlZCcsIHJlYWR5KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIE1hcmsgYW4gaW5zdGFuY2UgYXMgcmVhZHkuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJlYWR5KCkge1xuICAgIHRoaXMuX2lzQXR0YWNoZWQgPSB0cnVlO1xuICAgIHRoaXMuX2lzUmVhZHkgPSB0cnVlO1xuICAgIHRoaXMuX2NhbGxIb29rKCdyZWFkeScpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRlYXJkb3duIHRoZSBpbnN0YW5jZSwgc2ltcGx5IGRlbGVnYXRlIHRvIHRoZSBpbnRlcm5hbFxuICAgKiBfZGVzdHJveS5cbiAgICpcbiAgICogQHBhcmFtIHtCb29sZWFufSByZW1vdmVcbiAgICogQHBhcmFtIHtCb29sZWFufSBkZWZlckNsZWFudXBcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kZGVzdHJveSA9IGZ1bmN0aW9uIChyZW1vdmUsIGRlZmVyQ2xlYW51cCkge1xuICAgIHRoaXMuX2Rlc3Ryb3kocmVtb3ZlLCBkZWZlckNsZWFudXApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQYXJ0aWFsbHkgY29tcGlsZSBhIHBpZWNlIG9mIERPTSBhbmQgcmV0dXJuIGFcbiAgICogZGVjb21waWxlIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR8RG9jdW1lbnRGcmFnbWVudH0gZWxcbiAgICogQHBhcmFtIHtWdWV9IFtob3N0XVxuICAgKiBAcGFyYW0ge09iamVjdH0gW3Njb3BlXVxuICAgKiBAcGFyYW0ge0ZyYWdtZW50fSBbZnJhZ11cbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJGNvbXBpbGUgPSBmdW5jdGlvbiAoZWwsIGhvc3QsIHNjb3BlLCBmcmFnKSB7XG4gICAgcmV0dXJuIGNvbXBpbGUoZWwsIHRoaXMuJG9wdGlvbnMsIHRydWUpKHRoaXMsIGVsLCBob3N0LCBzY29wZSwgZnJhZyk7XG4gIH07XG59XG5cbi8qKlxuICogVGhlIGV4cG9zZWQgVnVlIGNvbnN0cnVjdG9yLlxuICpcbiAqIEFQSSBjb252ZW50aW9uczpcbiAqIC0gcHVibGljIEFQSSBtZXRob2RzL3Byb3BlcnRpZXMgYXJlIHByZWZpeGVkIHdpdGggYCRgXG4gKiAtIGludGVybmFsIG1ldGhvZHMvcHJvcGVydGllcyBhcmUgcHJlZml4ZWQgd2l0aCBgX2BcbiAqIC0gbm9uLXByZWZpeGVkIHByb3BlcnRpZXMgYXJlIGFzc3VtZWQgdG8gYmUgcHJveGllZCB1c2VyXG4gKiAgIGRhdGEuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcHVibGljXG4gKi9cblxuZnVuY3Rpb24gVnVlKG9wdGlvbnMpIHtcbiAgdGhpcy5faW5pdChvcHRpb25zKTtcbn1cblxuLy8gaW5zdGFsbCBpbnRlcm5hbHNcbmluaXRNaXhpbihWdWUpO1xuc3RhdGVNaXhpbihWdWUpO1xuZXZlbnRzTWl4aW4oVnVlKTtcbmxpZmVjeWNsZU1peGluKFZ1ZSk7XG5taXNjTWl4aW4oVnVlKTtcblxuLy8gaW5zdGFsbCBpbnN0YW5jZSBBUElzXG5kYXRhQVBJKFZ1ZSk7XG5kb21BUEkoVnVlKTtcbmV2ZW50c0FQSShWdWUpO1xubGlmZWN5Y2xlQVBJKFZ1ZSk7XG5cbnZhciBzbG90ID0ge1xuXG4gIHByaW9yaXR5OiBTTE9ULFxuICBwYXJhbXM6IFsnbmFtZSddLFxuXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgLy8gdGhpcyB3YXMgcmVzb2x2ZWQgZHVyaW5nIGNvbXBvbmVudCB0cmFuc2NsdXNpb25cbiAgICB2YXIgbmFtZSA9IHRoaXMucGFyYW1zLm5hbWUgfHwgJ2RlZmF1bHQnO1xuICAgIHZhciBjb250ZW50ID0gdGhpcy52bS5fc2xvdENvbnRlbnRzICYmIHRoaXMudm0uX3Nsb3RDb250ZW50c1tuYW1lXTtcbiAgICBpZiAoIWNvbnRlbnQgfHwgIWNvbnRlbnQuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICB0aGlzLmZhbGxiYWNrKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29tcGlsZShjb250ZW50LmNsb25lTm9kZSh0cnVlKSwgdGhpcy52bS5fY29udGV4dCwgdGhpcy52bSk7XG4gICAgfVxuICB9LFxuXG4gIGNvbXBpbGU6IGZ1bmN0aW9uIGNvbXBpbGUoY29udGVudCwgY29udGV4dCwgaG9zdCkge1xuICAgIGlmIChjb250ZW50ICYmIGNvbnRleHQpIHtcbiAgICAgIGlmICh0aGlzLmVsLmhhc0NoaWxkTm9kZXMoKSAmJiBjb250ZW50LmNoaWxkTm9kZXMubGVuZ3RoID09PSAxICYmIGNvbnRlbnQuY2hpbGROb2Rlc1swXS5ub2RlVHlwZSA9PT0gMSAmJiBjb250ZW50LmNoaWxkTm9kZXNbMF0uaGFzQXR0cmlidXRlKCd2LWlmJykpIHtcbiAgICAgICAgLy8gaWYgdGhlIGluc2VydGVkIHNsb3QgaGFzIHYtaWZcbiAgICAgICAgLy8gaW5qZWN0IGZhbGxiYWNrIGNvbnRlbnQgYXMgdGhlIHYtZWxzZVxuICAgICAgICB2YXIgZWxzZUJsb2NrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICAgICAgZWxzZUJsb2NrLnNldEF0dHJpYnV0ZSgndi1lbHNlJywgJycpO1xuICAgICAgICBlbHNlQmxvY2suaW5uZXJIVE1MID0gdGhpcy5lbC5pbm5lckhUTUw7XG4gICAgICAgIC8vIHRoZSBlbHNlIGJsb2NrIHNob3VsZCBiZSBjb21waWxlZCBpbiBjaGlsZCBzY29wZVxuICAgICAgICBlbHNlQmxvY2suX2NvbnRleHQgPSB0aGlzLnZtO1xuICAgICAgICBjb250ZW50LmFwcGVuZENoaWxkKGVsc2VCbG9jayk7XG4gICAgICB9XG4gICAgICB2YXIgc2NvcGUgPSBob3N0ID8gaG9zdC5fc2NvcGUgOiB0aGlzLl9zY29wZTtcbiAgICAgIHRoaXMudW5saW5rID0gY29udGV4dC4kY29tcGlsZShjb250ZW50LCBob3N0LCBzY29wZSwgdGhpcy5fZnJhZyk7XG4gICAgfVxuICAgIGlmIChjb250ZW50KSB7XG4gICAgICByZXBsYWNlKHRoaXMuZWwsIGNvbnRlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmUodGhpcy5lbCk7XG4gICAgfVxuICB9LFxuXG4gIGZhbGxiYWNrOiBmdW5jdGlvbiBmYWxsYmFjaygpIHtcbiAgICB0aGlzLmNvbXBpbGUoZXh0cmFjdENvbnRlbnQodGhpcy5lbCwgdHJ1ZSksIHRoaXMudm0pO1xuICB9LFxuXG4gIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLnVubGluaykge1xuICAgICAgdGhpcy51bmxpbmsoKTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciBwYXJ0aWFsID0ge1xuXG4gIHByaW9yaXR5OiBQQVJUSUFMLFxuXG4gIHBhcmFtczogWyduYW1lJ10sXG5cbiAgLy8gd2F0Y2ggY2hhbmdlcyB0byBuYW1lIGZvciBkeW5hbWljIHBhcnRpYWxzXG4gIHBhcmFtV2F0Y2hlcnM6IHtcbiAgICBuYW1lOiBmdW5jdGlvbiBuYW1lKHZhbHVlKSB7XG4gICAgICB2SWYucmVtb3ZlLmNhbGwodGhpcyk7XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5pbnNlcnQodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgIHRoaXMuYW5jaG9yID0gY3JlYXRlQW5jaG9yKCd2LXBhcnRpYWwnKTtcbiAgICByZXBsYWNlKHRoaXMuZWwsIHRoaXMuYW5jaG9yKTtcbiAgICB0aGlzLmluc2VydCh0aGlzLnBhcmFtcy5uYW1lKTtcbiAgfSxcblxuICBpbnNlcnQ6IGZ1bmN0aW9uIGluc2VydChpZCkge1xuICAgIHZhciBwYXJ0aWFsID0gcmVzb2x2ZUFzc2V0KHRoaXMudm0uJG9wdGlvbnMsICdwYXJ0aWFscycsIGlkLCB0cnVlKTtcbiAgICBpZiAocGFydGlhbCkge1xuICAgICAgdGhpcy5mYWN0b3J5ID0gbmV3IEZyYWdtZW50RmFjdG9yeSh0aGlzLnZtLCBwYXJ0aWFsKTtcbiAgICAgIHZJZi5pbnNlcnQuY2FsbCh0aGlzKTtcbiAgICB9XG4gIH0sXG5cbiAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgaWYgKHRoaXMuZnJhZykge1xuICAgICAgdGhpcy5mcmFnLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciBlbGVtZW50RGlyZWN0aXZlcyA9IHtcbiAgc2xvdDogc2xvdCxcbiAgcGFydGlhbDogcGFydGlhbFxufTtcblxudmFyIGNvbnZlcnRBcnJheSA9IHZGb3IuX3Bvc3RQcm9jZXNzO1xuXG4vKipcbiAqIExpbWl0IGZpbHRlciBmb3IgYXJyYXlzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgKERlY2ltYWwgZXhwZWN0ZWQpXG4gKi9cblxuZnVuY3Rpb24gbGltaXRCeShhcnIsIG4sIG9mZnNldCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPyBwYXJzZUludChvZmZzZXQsIDEwKSA6IDA7XG4gIG4gPSB0b051bWJlcihuKTtcbiAgcmV0dXJuIHR5cGVvZiBuID09PSAnbnVtYmVyJyA/IGFyci5zbGljZShvZmZzZXQsIG9mZnNldCArIG4pIDogYXJyO1xufVxuXG4vKipcbiAqIEZpbHRlciBmaWx0ZXIgZm9yIGFycmF5c1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWFyY2hcbiAqIEBwYXJhbSB7U3RyaW5nfSBbZGVsaW1pdGVyXVxuICogQHBhcmFtIHtTdHJpbmd9IC4uLmRhdGFLZXlzXG4gKi9cblxuZnVuY3Rpb24gZmlsdGVyQnkoYXJyLCBzZWFyY2gsIGRlbGltaXRlcikge1xuICBhcnIgPSBjb252ZXJ0QXJyYXkoYXJyKTtcbiAgaWYgKHNlYXJjaCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuICBpZiAodHlwZW9mIHNlYXJjaCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBhcnIuZmlsdGVyKHNlYXJjaCk7XG4gIH1cbiAgLy8gY2FzdCB0byBsb3dlcmNhc2Ugc3RyaW5nXG4gIHNlYXJjaCA9ICgnJyArIHNlYXJjaCkudG9Mb3dlckNhc2UoKTtcbiAgLy8gYWxsb3cgb3B0aW9uYWwgYGluYCBkZWxpbWl0ZXJcbiAgLy8gYmVjYXVzZSB3aHkgbm90XG4gIHZhciBuID0gZGVsaW1pdGVyID09PSAnaW4nID8gMyA6IDI7XG4gIC8vIGV4dHJhY3QgYW5kIGZsYXR0ZW4ga2V5c1xuICB2YXIga2V5cyA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIHRvQXJyYXkoYXJndW1lbnRzLCBuKSk7XG4gIHZhciByZXMgPSBbXTtcbiAgdmFyIGl0ZW0sIGtleSwgdmFsLCBqO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBpdGVtID0gYXJyW2ldO1xuICAgIHZhbCA9IGl0ZW0gJiYgaXRlbS4kdmFsdWUgfHwgaXRlbTtcbiAgICBqID0ga2V5cy5sZW5ndGg7XG4gICAgaWYgKGopIHtcbiAgICAgIHdoaWxlIChqLS0pIHtcbiAgICAgICAga2V5ID0ga2V5c1tqXTtcbiAgICAgICAgaWYgKGtleSA9PT0gJyRrZXknICYmIGNvbnRhaW5zKGl0ZW0uJGtleSwgc2VhcmNoKSB8fCBjb250YWlucyhnZXRQYXRoKHZhbCwga2V5KSwgc2VhcmNoKSkge1xuICAgICAgICAgIHJlcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjb250YWlucyhpdGVtLCBzZWFyY2gpKSB7XG4gICAgICByZXMucHVzaChpdGVtKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBGaWx0ZXIgZmlsdGVyIGZvciBhcnJheXNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheTxTdHJpbmc+fEZ1bmN0aW9ufSAuLi5zb3J0S2V5c1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcmRlcl1cbiAqL1xuXG5mdW5jdGlvbiBvcmRlckJ5KGFycikge1xuICB2YXIgY29tcGFyYXRvciA9IG51bGw7XG4gIHZhciBzb3J0S2V5cyA9IHVuZGVmaW5lZDtcbiAgYXJyID0gY29udmVydEFycmF5KGFycik7XG5cbiAgLy8gZGV0ZXJtaW5lIG9yZGVyIChsYXN0IGFyZ3VtZW50KVxuICB2YXIgYXJncyA9IHRvQXJyYXkoYXJndW1lbnRzLCAxKTtcbiAgdmFyIG9yZGVyID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xuICBpZiAodHlwZW9mIG9yZGVyID09PSAnbnVtYmVyJykge1xuICAgIG9yZGVyID0gb3JkZXIgPCAwID8gLTEgOiAxO1xuICAgIGFyZ3MgPSBhcmdzLmxlbmd0aCA+IDEgPyBhcmdzLnNsaWNlKDAsIC0xKSA6IGFyZ3M7XG4gIH0gZWxzZSB7XG4gICAgb3JkZXIgPSAxO1xuICB9XG5cbiAgLy8gZGV0ZXJtaW5lIHNvcnRLZXlzICYgY29tcGFyYXRvclxuICB2YXIgZmlyc3RBcmcgPSBhcmdzWzBdO1xuICBpZiAoIWZpcnN0QXJnKSB7XG4gICAgcmV0dXJuIGFycjtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZmlyc3RBcmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBjdXN0b20gY29tcGFyYXRvclxuICAgIGNvbXBhcmF0b3IgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGZpcnN0QXJnKGEsIGIpICogb3JkZXI7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBzdHJpbmcga2V5cy4gZmxhdHRlbiBmaXJzdFxuICAgIHNvcnRLZXlzID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgYXJncyk7XG4gICAgY29tcGFyYXRvciA9IGZ1bmN0aW9uIChhLCBiLCBpKSB7XG4gICAgICBpID0gaSB8fCAwO1xuICAgICAgcmV0dXJuIGkgPj0gc29ydEtleXMubGVuZ3RoIC0gMSA/IGJhc2VDb21wYXJlKGEsIGIsIGkpIDogYmFzZUNvbXBhcmUoYSwgYiwgaSkgfHwgY29tcGFyYXRvcihhLCBiLCBpICsgMSk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJhc2VDb21wYXJlKGEsIGIsIHNvcnRLZXlJbmRleCkge1xuICAgIHZhciBzb3J0S2V5ID0gc29ydEtleXNbc29ydEtleUluZGV4XTtcbiAgICBpZiAoc29ydEtleSkge1xuICAgICAgaWYgKHNvcnRLZXkgIT09ICcka2V5Jykge1xuICAgICAgICBpZiAoaXNPYmplY3QoYSkgJiYgJyR2YWx1ZScgaW4gYSkgYSA9IGEuJHZhbHVlO1xuICAgICAgICBpZiAoaXNPYmplY3QoYikgJiYgJyR2YWx1ZScgaW4gYikgYiA9IGIuJHZhbHVlO1xuICAgICAgfVxuICAgICAgYSA9IGlzT2JqZWN0KGEpID8gZ2V0UGF0aChhLCBzb3J0S2V5KSA6IGE7XG4gICAgICBiID0gaXNPYmplY3QoYikgPyBnZXRQYXRoKGIsIHNvcnRLZXkpIDogYjtcbiAgICB9XG4gICAgcmV0dXJuIGEgPT09IGIgPyAwIDogYSA+IGIgPyBvcmRlciA6IC1vcmRlcjtcbiAgfVxuXG4gIC8vIHNvcnQgb24gYSBjb3B5IHRvIGF2b2lkIG11dGF0aW5nIG9yaWdpbmFsIGFycmF5XG4gIHJldHVybiBhcnIuc2xpY2UoKS5zb3J0KGNvbXBhcmF0b3IpO1xufVxuXG4vKipcbiAqIFN0cmluZyBjb250YWluIGhlbHBlclxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VhcmNoXG4gKi9cblxuZnVuY3Rpb24gY29udGFpbnModmFsLCBzZWFyY2gpIHtcbiAgdmFyIGk7XG4gIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbCk7XG4gICAgaSA9IGtleXMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGlmIChjb250YWlucyh2YWxba2V5c1tpXV0sIHNlYXJjaCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgIGkgPSB2YWwubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGlmIChjb250YWlucyh2YWxbaV0sIHNlYXJjaCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHZhbCAhPSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2gpID4gLTE7XG4gIH1cbn1cblxudmFyIGRpZ2l0c1JFID0gLyhcXGR7M30pKD89XFxkKS9nO1xuXG4vLyBhc3NldCBjb2xsZWN0aW9ucyBtdXN0IGJlIGEgcGxhaW4gb2JqZWN0LlxudmFyIGZpbHRlcnMgPSB7XG5cbiAgb3JkZXJCeTogb3JkZXJCeSxcbiAgZmlsdGVyQnk6IGZpbHRlckJ5LFxuICBsaW1pdEJ5OiBsaW1pdEJ5LFxuXG4gIC8qKlxuICAgKiBTdHJpbmdpZnkgdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRlbnRcbiAgICovXG5cbiAganNvbjoge1xuICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQodmFsdWUsIGluZGVudCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCBOdW1iZXIoaW5kZW50KSB8fCAyKTtcbiAgICB9LFxuICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSh2YWx1ZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiAnYWJjJyA9PiAnQWJjJ1xuICAgKi9cblxuICBjYXBpdGFsaXplOiBmdW5jdGlvbiBjYXBpdGFsaXplKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkgcmV0dXJuICcnO1xuICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICByZXR1cm4gdmFsdWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB2YWx1ZS5zbGljZSgxKTtcbiAgfSxcblxuICAvKipcbiAgICogJ2FiYycgPT4gJ0FCQydcbiAgICovXG5cbiAgdXBwZXJjYXNlOiBmdW5jdGlvbiB1cHBlcmNhc2UodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgfHwgdmFsdWUgPT09IDAgPyB2YWx1ZS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkgOiAnJztcbiAgfSxcblxuICAvKipcbiAgICogJ0FiQycgPT4gJ2FiYydcbiAgICovXG5cbiAgbG93ZXJjYXNlOiBmdW5jdGlvbiBsb3dlcmNhc2UodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgfHwgdmFsdWUgPT09IDAgPyB2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgOiAnJztcbiAgfSxcblxuICAvKipcbiAgICogMTIzNDUgPT4gJDEyLDM0NS4wMFxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2lnblxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVjaW1hbHMgRGVjaW1hbCBwbGFjZXNcbiAgICovXG5cbiAgY3VycmVuY3k6IGZ1bmN0aW9uIGN1cnJlbmN5KHZhbHVlLCBfY3VycmVuY3ksIGRlY2ltYWxzKSB7XG4gICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICBpZiAoIWlzRmluaXRlKHZhbHVlKSB8fCAhdmFsdWUgJiYgdmFsdWUgIT09IDApIHJldHVybiAnJztcbiAgICBfY3VycmVuY3kgPSBfY3VycmVuY3kgIT0gbnVsbCA/IF9jdXJyZW5jeSA6ICckJztcbiAgICBkZWNpbWFscyA9IGRlY2ltYWxzICE9IG51bGwgPyBkZWNpbWFscyA6IDI7XG4gICAgdmFyIHN0cmluZ2lmaWVkID0gTWF0aC5hYnModmFsdWUpLnRvRml4ZWQoZGVjaW1hbHMpO1xuICAgIHZhciBfaW50ID0gZGVjaW1hbHMgPyBzdHJpbmdpZmllZC5zbGljZSgwLCAtMSAtIGRlY2ltYWxzKSA6IHN0cmluZ2lmaWVkO1xuICAgIHZhciBpID0gX2ludC5sZW5ndGggJSAzO1xuICAgIHZhciBoZWFkID0gaSA+IDAgPyBfaW50LnNsaWNlKDAsIGkpICsgKF9pbnQubGVuZ3RoID4gMyA/ICcsJyA6ICcnKSA6ICcnO1xuICAgIHZhciBfZmxvYXQgPSBkZWNpbWFscyA/IHN0cmluZ2lmaWVkLnNsaWNlKC0xIC0gZGVjaW1hbHMpIDogJyc7XG4gICAgdmFyIHNpZ24gPSB2YWx1ZSA8IDAgPyAnLScgOiAnJztcbiAgICByZXR1cm4gc2lnbiArIF9jdXJyZW5jeSArIGhlYWQgKyBfaW50LnNsaWNlKGkpLnJlcGxhY2UoZGlnaXRzUkUsICckMSwnKSArIF9mbG9hdDtcbiAgfSxcblxuICAvKipcbiAgICogJ2l0ZW0nID0+ICdpdGVtcydcbiAgICpcbiAgICogQHBhcmFtc1xuICAgKiAgYW4gYXJyYXkgb2Ygc3RyaW5ncyBjb3JyZXNwb25kaW5nIHRvXG4gICAqICB0aGUgc2luZ2xlLCBkb3VibGUsIHRyaXBsZSAuLi4gZm9ybXMgb2YgdGhlIHdvcmQgdG9cbiAgICogIGJlIHBsdXJhbGl6ZWQuIFdoZW4gdGhlIG51bWJlciB0byBiZSBwbHVyYWxpemVkXG4gICAqICBleGNlZWRzIHRoZSBsZW5ndGggb2YgdGhlIGFyZ3MsIGl0IHdpbGwgdXNlIHRoZSBsYXN0XG4gICAqICBlbnRyeSBpbiB0aGUgYXJyYXkuXG4gICAqXG4gICAqICBlLmcuIFsnc2luZ2xlJywgJ2RvdWJsZScsICd0cmlwbGUnLCAnbXVsdGlwbGUnXVxuICAgKi9cblxuICBwbHVyYWxpemU6IGZ1bmN0aW9uIHBsdXJhbGl6ZSh2YWx1ZSkge1xuICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBhcmdzLmxlbmd0aCA+IDEgPyBhcmdzW3ZhbHVlICUgMTAgLSAxXSB8fCBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gOiBhcmdzWzBdICsgKHZhbHVlID09PSAxID8gJycgOiAncycpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBEZWJvdW5jZSBhIGhhbmRsZXIgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5ID0gMzAwXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgKi9cblxuICBkZWJvdW5jZTogZnVuY3Rpb24gZGVib3VuY2UoaGFuZGxlciwgZGVsYXkpIHtcbiAgICBpZiAoIWhhbmRsZXIpIHJldHVybjtcbiAgICBpZiAoIWRlbGF5KSB7XG4gICAgICBkZWxheSA9IDMwMDtcbiAgICB9XG4gICAgcmV0dXJuIF9kZWJvdW5jZShoYW5kbGVyLCBkZWxheSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGluc3RhbGxHbG9iYWxBUEkgKFZ1ZSkge1xuICAvKipcbiAgICogVnVlIGFuZCBldmVyeSBjb25zdHJ1Y3RvciB0aGF0IGV4dGVuZHMgVnVlIGhhcyBhblxuICAgKiBhc3NvY2lhdGVkIG9wdGlvbnMgb2JqZWN0LCB3aGljaCBjYW4gYmUgYWNjZXNzZWQgZHVyaW5nXG4gICAqIGNvbXBpbGF0aW9uIHN0ZXBzIGFzIGB0aGlzLmNvbnN0cnVjdG9yLm9wdGlvbnNgLlxuICAgKlxuICAgKiBUaGVzZSBjYW4gYmUgc2VlbiBhcyB0aGUgZGVmYXVsdCBvcHRpb25zIG9mIGV2ZXJ5XG4gICAqIFZ1ZSBpbnN0YW5jZS5cbiAgICovXG5cbiAgVnVlLm9wdGlvbnMgPSB7XG4gICAgZGlyZWN0aXZlczogZGlyZWN0aXZlcyxcbiAgICBlbGVtZW50RGlyZWN0aXZlczogZWxlbWVudERpcmVjdGl2ZXMsXG4gICAgZmlsdGVyczogZmlsdGVycyxcbiAgICB0cmFuc2l0aW9uczoge30sXG4gICAgY29tcG9uZW50czoge30sXG4gICAgcGFydGlhbHM6IHt9LFxuICAgIHJlcGxhY2U6IHRydWVcbiAgfTtcblxuICAvKipcbiAgICogRXhwb3NlIHVzZWZ1bCBpbnRlcm5hbHNcbiAgICovXG5cbiAgVnVlLnV0aWwgPSB1dGlsO1xuICBWdWUuY29uZmlnID0gY29uZmlnO1xuICBWdWUuc2V0ID0gc2V0O1xuICBWdWVbJ2RlbGV0ZSddID0gZGVsO1xuICBWdWUubmV4dFRpY2sgPSBuZXh0VGljaztcblxuICAvKipcbiAgICogVGhlIGZvbGxvd2luZyBhcmUgZXhwb3NlZCBmb3IgYWR2YW5jZWQgdXNhZ2UgLyBwbHVnaW5zXG4gICAqL1xuXG4gIFZ1ZS5jb21waWxlciA9IGNvbXBpbGVyO1xuICBWdWUuRnJhZ21lbnRGYWN0b3J5ID0gRnJhZ21lbnRGYWN0b3J5O1xuICBWdWUuaW50ZXJuYWxEaXJlY3RpdmVzID0gaW50ZXJuYWxEaXJlY3RpdmVzO1xuICBWdWUucGFyc2VycyA9IHtcbiAgICBwYXRoOiBwYXRoLFxuICAgIHRleHQ6IHRleHQsXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxuICAgIGRpcmVjdGl2ZTogZGlyZWN0aXZlLFxuICAgIGV4cHJlc3Npb246IGV4cHJlc3Npb25cbiAgfTtcblxuICAvKipcbiAgICogRWFjaCBpbnN0YW5jZSBjb25zdHJ1Y3RvciwgaW5jbHVkaW5nIFZ1ZSwgaGFzIGEgdW5pcXVlXG4gICAqIGNpZC4gVGhpcyBlbmFibGVzIHVzIHRvIGNyZWF0ZSB3cmFwcGVkIFwiY2hpbGRcbiAgICogY29uc3RydWN0b3JzXCIgZm9yIHByb3RvdHlwYWwgaW5oZXJpdGFuY2UgYW5kIGNhY2hlIHRoZW0uXG4gICAqL1xuXG4gIFZ1ZS5jaWQgPSAwO1xuICB2YXIgY2lkID0gMTtcblxuICAvKipcbiAgICogQ2xhc3MgaW5oZXJpdGFuY2VcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGV4dGVuZE9wdGlvbnNcbiAgICovXG5cbiAgVnVlLmV4dGVuZCA9IGZ1bmN0aW9uIChleHRlbmRPcHRpb25zKSB7XG4gICAgZXh0ZW5kT3B0aW9ucyA9IGV4dGVuZE9wdGlvbnMgfHwge307XG4gICAgdmFyIFN1cGVyID0gdGhpcztcbiAgICB2YXIgaXNGaXJzdEV4dGVuZCA9IFN1cGVyLmNpZCA9PT0gMDtcbiAgICBpZiAoaXNGaXJzdEV4dGVuZCAmJiBleHRlbmRPcHRpb25zLl9DdG9yKSB7XG4gICAgICByZXR1cm4gZXh0ZW5kT3B0aW9ucy5fQ3RvcjtcbiAgICB9XG4gICAgdmFyIG5hbWUgPSBleHRlbmRPcHRpb25zLm5hbWUgfHwgU3VwZXIub3B0aW9ucy5uYW1lO1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBpZiAoIS9eW2EtekEtWl1bXFx3LV0qJC8udGVzdChuYW1lKSkge1xuICAgICAgICB3YXJuKCdJbnZhbGlkIGNvbXBvbmVudCBuYW1lOiBcIicgKyBuYW1lICsgJ1wiLiBDb21wb25lbnQgbmFtZXMgJyArICdjYW4gb25seSBjb250YWluIGFscGhhbnVtZXJpYyBjaGFyYWNhdGVycyBhbmQgdGhlIGh5cGhlbi4nKTtcbiAgICAgICAgbmFtZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBTdWIgPSBjcmVhdGVDbGFzcyhuYW1lIHx8ICdWdWVDb21wb25lbnQnKTtcbiAgICBTdWIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTdXBlci5wcm90b3R5cGUpO1xuICAgIFN1Yi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdWI7XG4gICAgU3ViLmNpZCA9IGNpZCsrO1xuICAgIFN1Yi5vcHRpb25zID0gbWVyZ2VPcHRpb25zKFN1cGVyLm9wdGlvbnMsIGV4dGVuZE9wdGlvbnMpO1xuICAgIFN1Ylsnc3VwZXInXSA9IFN1cGVyO1xuICAgIC8vIGFsbG93IGZ1cnRoZXIgZXh0ZW5zaW9uXG4gICAgU3ViLmV4dGVuZCA9IFN1cGVyLmV4dGVuZDtcbiAgICAvLyBjcmVhdGUgYXNzZXQgcmVnaXN0ZXJzLCBzbyBleHRlbmRlZCBjbGFzc2VzXG4gICAgLy8gY2FuIGhhdmUgdGhlaXIgcHJpdmF0ZSBhc3NldHMgdG9vLlxuICAgIGNvbmZpZy5fYXNzZXRUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICBTdWJbdHlwZV0gPSBTdXBlclt0eXBlXTtcbiAgICB9KTtcbiAgICAvLyBlbmFibGUgcmVjdXJzaXZlIHNlbGYtbG9va3VwXG4gICAgaWYgKG5hbWUpIHtcbiAgICAgIFN1Yi5vcHRpb25zLmNvbXBvbmVudHNbbmFtZV0gPSBTdWI7XG4gICAgfVxuICAgIC8vIGNhY2hlIGNvbnN0cnVjdG9yXG4gICAgaWYgKGlzRmlyc3RFeHRlbmQpIHtcbiAgICAgIGV4dGVuZE9wdGlvbnMuX0N0b3IgPSBTdWI7XG4gICAgfVxuICAgIHJldHVybiBTdWI7XG4gIH07XG5cbiAgLyoqXG4gICAqIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgc3ViLWNsYXNzIGNvbnN0cnVjdG9yIHdpdGggdGhlXG4gICAqIGdpdmVuIG5hbWUuIFRoaXMgZ2l2ZXMgdXMgbXVjaCBuaWNlciBvdXRwdXQgd2hlblxuICAgKiBsb2dnaW5nIGluc3RhbmNlcyBpbiB0aGUgY29uc29sZS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNsYXNzKG5hbWUpIHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1uZXctZnVuYyAqL1xuICAgIHJldHVybiBuZXcgRnVuY3Rpb24oJ3JldHVybiBmdW5jdGlvbiAnICsgY2xhc3NpZnkobmFtZSkgKyAnIChvcHRpb25zKSB7IHRoaXMuX2luaXQob3B0aW9ucykgfScpKCk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1uZXctZnVuYyAqL1xuICB9XG5cbiAgLyoqXG4gICAqIFBsdWdpbiBzeXN0ZW1cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpblxuICAgKi9cblxuICBWdWUudXNlID0gZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChwbHVnaW4uaW5zdGFsbGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGFkZGl0aW9uYWwgcGFyYW1ldGVyc1xuICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMsIDEpO1xuICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcbiAgICBpZiAodHlwZW9mIHBsdWdpbi5pbnN0YWxsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwbHVnaW4uaW5zdGFsbC5hcHBseShwbHVnaW4sIGFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwbHVnaW4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfVxuICAgIHBsdWdpbi5pbnN0YWxsZWQgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcHBseSBhIGdsb2JhbCBtaXhpbiBieSBtZXJnaW5nIGl0IGludG8gdGhlIGRlZmF1bHRcbiAgICogb3B0aW9ucy5cbiAgICovXG5cbiAgVnVlLm1peGluID0gZnVuY3Rpb24gKG1peGluKSB7XG4gICAgVnVlLm9wdGlvbnMgPSBtZXJnZU9wdGlvbnMoVnVlLm9wdGlvbnMsIG1peGluKTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlIGFzc2V0IHJlZ2lzdHJhdGlvbiBtZXRob2RzIHdpdGggdGhlIGZvbGxvd2luZ1xuICAgKiBzaWduYXR1cmU6XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBpZFxuICAgKiBAcGFyYW0geyp9IGRlZmluaXRpb25cbiAgICovXG5cbiAgY29uZmlnLl9hc3NldFR5cGVzLmZvckVhY2goZnVuY3Rpb24gKHR5cGUpIHtcbiAgICBWdWVbdHlwZV0gPSBmdW5jdGlvbiAoaWQsIGRlZmluaXRpb24pIHtcbiAgICAgIGlmICghZGVmaW5pdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW3R5cGUgKyAncyddW2lkXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgIGlmICh0eXBlID09PSAnY29tcG9uZW50JyAmJiAoY29tbW9uVGFnUkUudGVzdChpZCkgfHwgcmVzZXJ2ZWRUYWdSRS50ZXN0KGlkKSkpIHtcbiAgICAgICAgICAgIHdhcm4oJ0RvIG5vdCB1c2UgYnVpbHQtaW4gb3IgcmVzZXJ2ZWQgSFRNTCBlbGVtZW50cyBhcyBjb21wb25lbnQgJyArICdpZDogJyArIGlkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09ICdjb21wb25lbnQnICYmIGlzUGxhaW5PYmplY3QoZGVmaW5pdGlvbikpIHtcbiAgICAgICAgICBkZWZpbml0aW9uLm5hbWUgPSBpZDtcbiAgICAgICAgICBkZWZpbml0aW9uID0gVnVlLmV4dGVuZChkZWZpbml0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9wdGlvbnNbdHlwZSArICdzJ11baWRdID0gZGVmaW5pdGlvbjtcbiAgICAgICAgcmV0dXJuIGRlZmluaXRpb247XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gZXhwb3NlIGludGVybmFsIHRyYW5zaXRpb24gQVBJXG4gIGV4dGVuZChWdWUudHJhbnNpdGlvbiwgdHJhbnNpdGlvbik7XG59XG5cbmluc3RhbGxHbG9iYWxBUEkoVnVlKTtcblxuVnVlLnZlcnNpb24gPSAnMS4wLjI0JztcblxuLy8gZGV2dG9vbHMgZ2xvYmFsIGhvb2tcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgaWYgKGNvbmZpZy5kZXZ0b29scykge1xuICAgIGlmIChkZXZ0b29scykge1xuICAgICAgZGV2dG9vbHMuZW1pdCgnaW5pdCcsIFZ1ZSk7XG4gICAgfSBlbHNlIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIGluQnJvd3NlciAmJiAvQ2hyb21lXFwvXFxkKy8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdEb3dubG9hZCB0aGUgVnVlIERldnRvb2xzIGZvciBhIGJldHRlciBkZXZlbG9wbWVudCBleHBlcmllbmNlOlxcbicgKyAnaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS1kZXZ0b29scycpO1xuICAgIH1cbiAgfVxufSwgMCk7XG5cbm1vZHVsZS5leHBvcnRzID0gVnVlO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJvTWZwQW5cIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvdnVlL2Rpc3QvdnVlLmNvbW1vbi5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy92dWUvZGlzdFwiKSJdfQ==
