const vtt = "Foundry VTT";


/* -------------------------------------------- */
/*  Entities and Permissions
/* -------------------------------------------- */

const USER_PERMISSIONS = {
  "NONE": 0,
  "PLAYER": 1,
  "TRUSTED": 2,
  "ASSISTANT": 3,
  "GAMEMASTER": 4
};
Object.freeze(USER_PERMISSIONS);


const ENTITY_PERMISSIONS = {
  "NONE": 0,
  "LIMITED": 1,
  "OBSERVER": 2,
  "OWNER": 3
};
Object.freeze(ENTITY_PERMISSIONS);


const BASE_ENTITY_TYPE = "base";

// Allowed types of Entities which may exist in a Compendium
const COMPENDIUM_ENTITY_TYPES = ["Actor", "Item", "Scene", "JournalEntry", "Playlist"];
Object.freeze(COMPENDIUM_ENTITY_TYPES);


// The sorting density for entities and folders
const SORT_INTEGER_DENSITY = 100000;
Object.freeze(SORT_INTEGER_DENSITY);


/* -------------------------------------------- */
/*  Tokens
/* -------------------------------------------- */

const DEFAULT_TOKEN = 'icons/svg/mystery-man.svg';
const DEFAULT_NOTE_ICON = 'icons/svg/book.svg';

/**
 * Describe the various thresholds of token control upon which to show certain pieces of information
 * NONE - no information is displayed
 * CONTROL - displayed when the token is controlled
 * OWNER HOVER - displayed when hovered by a GM or a user who owns the actor
 * HOVER - displayed when hovered by any user
 * OWNER - always displayed for a GM or for a user who owns the actor
 * ALWAYS - always displayed for everyone
 * @type {Object}
 */
const TOKEN_DISPLAY_MODES = {
  "NONE": 0,
  "CONTROL": 10,
  "OWNER_HOVER": 20,
  "HOVER": 30,
  "OWNER": 40,
  "ALWAYS": 50
};

const TOKEN_DISPOSITIONS = {
  "HOSTILE": -1,
  "NEUTRAL": 0,
  "FRIENDLY": 1
};

/* -------------------------------------------- */
/*  Scenes
/* -------------------------------------------- */

const GRID_TYPES = {
  "GRIDLESS": 0,
  "SQUARE": 1,
  "HEXODDR": 2,
  "HEXEVENR": 3,
  "HEXODDQ": 4,
  "HEXEVENQ": 5
};

const MIN_GRID_SIZE = 50;


/* -------------------------------------------- */
/*  WALL OBJECTS
/* -------------------------------------------- */

const WALL_TYPES = {
  "REGULAR": "w",
  "INVISIBLE": "i",
  "DOOR": "d",
  "SECRET": "s"
};

const WALL_DIRECTIONS = {
  BOTH: 0,
  LEFT: 1,
  RIGHT: 2
};

const WALL_DOOR_TYPES = {
  NONE: 0,
  DOOR: 1,
  SECRET: 2
};

const WALL_DOOR_STATES = {
  CLOSED: 0,
  OPEN: 1,
  LOCKED: 2
};

const WALL_MOVEMENT_TYPES = {
  NONE: 0,
  NORMAL: 1
};

const WALL_SENSE_TYPES = {
  NONE: 0,
  NORMAL: 1,
  LIMITED: 2
};


/* -------------------------------------------- */


/**
 * Audio PLAYBACK MODES
 * @type {Object}
 */
const PLAYLIST_MODES = {
  "DISABLED": -1,
  "SEQUENTIAL": 0,
  "SHUFFLE": 1,
  "SIMULTANEOUS": 2
};


/* -------------------------------------------- */
/*  FILES
/* -------------------------------------------- */

const IMAGE_FILE_EXTENSIONS = ["jpg", "jpeg", "png", "svg", "webp"];
const VIDEO_FILE_EXTENSIONS = ["mp4", "ogg", "webm"];
const AUDIO_FILE_EXTENSIONS = ["flac", "mp3", "ogg", "wav", "webm"];

/* -------------------------------------------- */

try {
module.exports = {
	vtt,
  BASE_ENTITY_TYPE,
  DEFAULT_TOKEN,
  ENTITY_PERMISSIONS,
  GRID_TYPES,
  MIN_GRID_SIZE,
  PLAYLIST_MODES,
  SORT_INTEGER_DENSITY,
  TOKEN_DISPLAY_MODES,
  USER_PERMISSIONS,
  WALL_TYPES,
  WALL_DIRECTIONS,
  WALL_DOOR_TYPES,
  WALL_DOOR_STATES,
  WALL_MOVEMENT_TYPES,
  WALL_SENSE_TYPES,
  IMAGE_FILE_EXTENSIONS,
  VIDEO_FILE_EXTENSIONS,
  AUDIO_FILE_EXTENSIONS
};
} catch(err) {}


/* -------------------------------------------- */
/*  Math Functions                              */
/* -------------------------------------------- */


Math.clamped = function(x, min, max) {
  return Math.min(max, Math.max(x, min));
};


Math.decimals = function(number, places) {
  let scl = Math.pow(10, places);
  return Math.round(number * scl) / scl;
};

toDegrees = function(angle) {
  return angle * (180 / Math.PI);
};

toRadians = function(degree) {
  return (Math.round(degree) % 360) * (Math.PI / 180);
};

/* -------------------------------------------- */
/* String Methods                               */
/* -------------------------------------------- */


String.prototype.capitalize = function() {
  if ( !this.length ) return this;
  return this.charAt(0).toUpperCase() + this.slice(1);
};


String.prototype.titleCase = function() {
  if (!this.length) return this;
  return this.toLowerCase().split(' ').map(function (word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ');
};


/**
 * Strip any <script> tags which were included within a provided string
 * @return {String|*}
 */
String.prototype.stripScripts = function() {
  let el = document.createElement("div");
  el.innerHTML = this;
  for ( let s of el.getElementsByTagName("script") ) {
    s.parentNode.removeChild(s);
  }
  return el.innerHTML;
};



/* -------------------------------------------- */
/* Number Methods                               */
/* -------------------------------------------- */


Number.prototype.ordinalString = function() {
  let s=["th","st","nd","rd"],
    v=this%100;
  return this+(s[(v-20)%10]||s[v]||s[0]);
};


Number.prototype.paddedString = function(digits) {
  let s = "000000000" + this;
  return s.substr(s.length-digits);
};


Number.prototype.signedString = function() {
  return (( this < 0 ) ? "" : "+") + this;
};


Number.prototype.between = function(a, b, inclusive=true) {
  let min = Math.min(a, b);
  let max = Math.max(a, b);
  return inclusive ? this >= min && this <= max : this > min && this < max;
};


/* -------------------------------------------- */
/* Array Methods                                */
/* -------------------------------------------- */


Array.fromRange = function(n) {
  return Array.from(new Array(parseInt(n)).keys());
};


Array.prototype.deepFlatten = function() {
  return this.reduce((acc, val) => Array.isArray(val) ? acc.concat(val.deepFlatten()) : acc.concat(val), []);
};


/**
 * Test equality of the values of this array against the values of some other Array
 * @param {Array} other
 */
Array.prototype.equals = function(other) {
  if ( !(other instanceof Array) || (other.length !== this.length) ) return false;
  return this.every((v, i) => other[i] === v);
};


/**
 * Partition an original array into two children array based on a logical test
 * Elements which test as false go into the first result while elements testing as true appear in the second
 * @param rule {Function}
 * @return {Array}    An Array of length two whose elements are the partitioned pieces of the original
 */
Array.prototype.partition = function(rule) {
  return this.reduce((acc, val) => {
    let test = rule(val);
    acc[Number(test)].push(val);
    return acc;
  }, [[], []]);
};



/* -------------------------------------------- */
/* Object Methods                               */
/* -------------------------------------------- */

/**
 * A cheap data duplication trick, surprisingly relatively performant
 * @param {Object} original   Some sort of data
 */
function duplicate(original) {
  return JSON.parse(JSON.stringify(original));
}


/* -------------------------------------------- */
/* Object Methods                               */
/* -------------------------------------------- */


RegExp.escape= function(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};


/* -------------------------------------------- */


/**
 * Flatten a possibly multi-dimensional object to a one-dimensional one by converting all nested keys to dot notation
 * @param {Object} obj  The object to flatten
 * @param {Number} _d   Recursion depth, to prevent overflow
 * @return {Object}     A flattened object
 */
function flattenObject(obj, _d=0) {
  const flat = {};
  if ( _d > 10 ) throw new Error("Maximum depth exceeded");
  for ( let [k, v] of Object.entries(obj) ) {

    // Inner objects
    if ( v instanceof Object && !Array.isArray(v) ) {
      let inner = flattenObject(v, _d+1);
      for ( let [ik, iv] of Object.entries(inner) ) {
        flat[`${k}.${ik}`] = iv;
      }
    }

    // Inner values
    else flat[k] = v;
  }
  return flat;
}


/* -------------------------------------------- */


/**
 * Expand a flattened object to be a standard multi-dimensional nested Object by converting all dot-notation keys to
 * inner objects.
 *
 * @param {Object} obj  The object to expand
 * @param {Number} _d   Recursion depth, to prevent overflow
 * @return {Object}     An expanded object
 */
function expandObject(obj, _d=0) {
  const expanded = {};
  if ( _d > 10 ) throw new Error("Maximum depth exceeded");
  for ( let [k, v] of Object.entries(obj) ) {
    if ( v instanceof Object && !Array.isArray(v) ) v = expandObject(v, _d+1);
    setProperty(expanded, k, v);
  }
  return expanded;
}


/* -------------------------------------------- */



/**
 Update a source object by replacing its keys and values with those from a target object.

 Arguments:
   original (Object): The initial object which should be updated with values from the target
   other (Object): A new object whose values should replace those in the source
   insert (bool): Control whether to insert new parent objects in the structure which did not previously exist
   in the source object
   overwrite (bool): Control whether to replace existing values in the source, or only merge values which do not
   currently exist
   inplace (bool): Update the values of original inplace? Otherwise duplicate the original and return a safe copy

 Returns:
  (Object): The original source object including updated, inserted, or overwritten records
 */
function mergeObject(original, other, {insertKeys=true, insertValues=true, overwrite=true, inplace=true}={}, _d=0) {
  other = other || {};
  if (!(original instanceof Object) || !(other instanceof Object)) throw "One of original or other are not Objects!";
  let depth = _d + 1;

  // Maybe copy the original data
  original = ( inplace ) ? original : duplicate(original);

  // Iterate over the other object
  for ( let [k, v] of Object.entries(other) ) {
    let x = original[k],
      has = hasProperty(original, k),
      xObj = ( x instanceof Object && !Array.isArray(x) ),
      vObj = ( v instanceof Object && !Array.isArray(v) );

    // Case 1 - Key exists
    if (has) {

      // 1.1 -  existing inner object
      if (xObj) {
        if (vObj) {
          mergeObject(x, v, {
            insertKeys: insertValues,
            insertValues: true,
            overwrite: overwrite,
            inplace: true
          }, depth);
        }
        else throw new Error("You cannot merge a non-object with an existing object");
      }

      // 1.2 - can overwrite or insert values
      else if (overwrite || (x === undefined && insertValues)) {
        setProperty(original, k, v);
      }
    }

    // Case 2 - Key does not exist
    else {

      // 2.1 - dot notation, check for insert key or value
      if ( k.indexOf('.') !== -1 ) {
        let base = k.split(".").shift(),
          hasBase = original.hasOwnProperty(base);
        if ((hasBase && insertValues) || (!hasBase && insertKeys)) {
          setProperty(original, k, v);
        }
      }

      // Case 3 - non-existing attributes
      else {
        let canInsert = (depth === 1 && insertKeys ) || ( depth > 1 && insertValues );
        if (canInsert) original[k] = v;
      }
    }
  }

  // Return the object for use
  return original;
}


/* -------------------------------------------- */


/**
 * Deeply difference an object against some other, returning the update keys and values
 * @param {Object} original
 * @param {Object} other
 * @return {Object}
 */
function diffObject(original, other) {

  function _isArrayDifferent(v0, v1) {
    if ( v0.length !== v1.length ) return true;
    return v0.some((v, i) => v !== v1[i]);
  }

  function _isObjectDifferent(v0, v1) {
    let k0 = Object.keys(v0),
        k1 = Object.keys(v1);
    if ( !k0.length && !k1.length ) return false;
    if ( k0.length !== k1.length ) return true;
    if ( _isArrayDifferent(k0, k1) ) return true;
    return k0.some((k, i) => v0[k] !== v1[k]);
  }

  function _isDifferent(v0, v1) {
    if ( typeof v0 !== typeof v1 ) return true;
    if ( v0 instanceof Array ) return _isArrayDifferent(v0, v1);
    if ( v0 instanceof Object ) return _isObjectDifferent(v0, v1);
    return v0 !== v1;
  }

  return Object.keys(other).reduce((obj, key) => {
    if ( _isDifferent(original[key], other[key]) ) obj[key] = other[key];
    return obj;
  }, {});
}


/* -------------------------------------------- */


/**
 * A helper function which tests whether an object has a property or nested property given a string key.
 * The string key supports the notation a.b.c which would return true if object[a][b][c] exists
 * @param object {Object}   The object to traverse
 * @param key {String}      An object property with notation a.b.c
 *
 * @return {Boolean}        An indicator for whether the property exists
 */
function hasProperty(object, key) {
  if ( !key ) return false;
  let target = object;
  for ( let p of key.split('.') ) {
    if ( target.hasOwnProperty(p) ) target = target[p];
    else return false;
  }
  return true;
}


/* -------------------------------------------- */


/**
 * A helper function which searches through an object to retrieve a value by a string key.
 * The string key supports the notation a.b.c which would return object[a][b][c]
 * @param object {Object}   The object to traverse
 * @param key {String}      An object property with notation a.b.c
 *
 * @return {*}              The value of the found property
 */
function getProperty(object, key) {
  if ( !key ) return undefined;
  let target = object;
  for ( let p of key.split('.') ) {
    if ( p in target ) target = target[p];
    else return undefined;
  }
  return target;
}


/* -------------------------------------------- */


/**
 * A helper function which searches through an object to assign a value using a string key
 * This string key supports the notation a.b.c which would target object[a][b][c]
 *
 * @param object {Object}   The object to update
 * @param key {String}      The string key
 * @param value             The value to be assigned
 *
 * @return {Boolean}        A flag for whether or not the object was updated
 */
function setProperty(object, key, value) {
  let target = object;
  let changed = false;

  // Convert the key to an object reference if it contains dot notation
  if ( key.indexOf('.') !== -1 ) {
    let parts = key.split('.');
    key = parts.pop();
    target = parts.reduce((o, i) => {
      if ( !o.hasOwnProperty(i) ) o[i] = {};
      return o[i];
    }, object);
  }

  // Update the target
  if ( target[key] !== value ) {
    changed = true;
    target[key] = value;
  }

  // Return changed status
  return changed;
}


/* -------------------------------------------- */
/*  Form Methods                                */
/* -------------------------------------------- */


validateForm = function(formElement) {
  const form = new FormData(formElement);
  const formData = {};

  // Always include Boolean checkboxes
  for ( let box of formElement.querySelectorAll('input[type="checkbox"]') ) {
    if ( box.disabled ) continue;
    formData[box.name] = Boolean(box.checked) || false;
  }

  // Grab images which are editable
  for ( let img of formElement.querySelectorAll('img[data-edit]') ) {
    if ( img.getAttribute("disabled") ) continue;
    formData[img.dataset.edit] = img.src.replace(window.location.origin+"/", "");
  }

  // Grab divs which are editable
  for ( let div of formElement.querySelectorAll('div[data-edit]') ) {
    if ( div.getAttribute("disabled") ) continue;
    formData[div.dataset.edit] = div.innerHTML.trim();
  }

  // Iterate over form elements, validating and converting type
  form.forEach((v, k) => {
    let input = formElement[k];

    // Skip checkboxes which have already been handled
    if ( input.type === "checkbox" ) return;

    // Skip fields which are set as disabled
    if ( input.disabled ) return;

    // Cast the input to a specific dtype
    let dtype = input.dataset.dtype || "String";
    if ( dtype && window[dtype] ) formData[k] = window[dtype](v);

    // Otherwise accept the key as given
    else formData[k] = v;
  });
  return formData;
};


/* -------------------------------------------- */


/**
 * Express a timestamp as a relative string
 * @param timeStamp {Date}
 * @return {string}
 */
timeSince = function(timeStamp) {
  timeStamp = new Date(timeStamp);
  let now = new Date(),
      secondsPast = (now - timeStamp) / 1000,
      since = "";

  // Format the time
  if (secondsPast < 60) {
    since = parseInt(secondsPast);
    if ( since <= 0 ) return "Now";
    else since = since + "s";
  }
  else if (secondsPast < 3600) since = parseInt(secondsPast/60) + 'm';
  else if (secondsPast <= 86400) since = parseInt(secondsPast/3600) + 'h';
  else {
    let hours = parseInt(secondsPast/3600),
        days = parseInt(hours/24);
    since = `${days}d ${hours % 24}h`;
  }

  // Return the string
  return since + " ago";
};


/* -------------------------------------------- */
/*  Colors
/* -------------------------------------------- */

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 1] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b) {
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  let d = max - min;
  s = max == 0 ? 0 : d / max;
  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, v];
}

/* -------------------------------------------- */

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 1].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v) {
  let r, g, b;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return [r, g, b];
}

/**
 * Converts a color as an [R, G, B] array of normalized floats to a hexadecimal number.
 * @param {Array.<Number>} rgb - Array of numbers where all values are normalized floats from 0.0 to 1.0.
 * @return {Number} Number in hexadecimal.
 */
function rgbToHex(rgb) {
  return (((rgb[0] * 255) << 16) + ((rgb[1] * 255) << 8) + (rgb[2] * 255 | 0));
}


/* -------------------------------------------- */
/*  Versioning
/* -------------------------------------------- */

/**
 * Return whether or not a version (v1) is more advanced than some other version (v0)
 * Supports numeric or string version numbers
 * @param {Number|String} v0
 * @param {Number|String} v1
 * @return {Boolean}
 */
function isNewerVersion(v1, v0) {
  if ( typeof v0 === "string" ) {
    v0 = v0.split('.').map(Number).reduce((num, part, i, parts) => {
      return num + (part * (10 ** (parts.length - i + 1)));
    }, 0);
  }
  if ( typeof v1 === "string" ) {
    v1 = v1.split('.').map(Number).reduce((num, part, i, parts) => {
      return num + (part * (10 ** (parts.length - i + 1)));
    }, 0);
  }
  return v1 > v0;
}


try {
  module.exports = {
    duplicate: duplicate,
    flattenObject,
    expandObject,
    mergeObject,
    hasProperty,
    getProperty,
    setProperty,
    validateForm,
    hsvToRgb,
    rgbToHsv,
    rgbToHex,
    isNewerVersion
  };
} catch(err) {}


/* -------------------------------------------- */

const CONFIG = {

  /**
   * Configuration for the default Actor entity class
   * @private
   */
  Actor: {
    entityClass: null,
    sheetClasses: {},
    sidebarIcon: "fas fa-user"
  },

  /**
   * Configuration for the default Item entity class
   */
  Item: {
    entityClass: null,
    sheetClass: null,
    sidebarIcon: "fas fa-suitcase"
  },

  /**
   * Configuration for the JournalEntry entity
   */
  JournalEntry: {
    entityClass: null,
    sheetClass: null,
    noteIcons: {
      "Anchor": "icons/svg/anchor.svg",
      "Book": "icons/svg/book.svg",
      "Bridge": "icons/svg/bridge.svg",
      "Cave": "icons/svg/cave.svg",
      "Castle": "icons/svg/castle.svg",
      "City": "icons/svg/city.svg",
      "Mountain": "icons/svg/mountain.svg",
      "Obelisk": "icons/svg/obelisk.svg",
      "Ruins": "icons/svg/ruins.svg",
      "Tower": "icons/svg/tower.svg",
      "Skull": "icons/svg/skull.svg",
      "Sword": "icons/svg/sword.svg",
      "Village": "icons/svg/village.svg"
    },
    sidebarIcon: "fas fa-book-open"
  },

  /**
   * Configuration for the default Scene entity class
   * @private
   */
  Scene: {
    entityClass: null,
    sheetClass: null,
    notesClass: null,
    sidebarIcon: "fas fa-map"
  },

  /**
   * Configuration for the default Playlist entity class
   * @private
   */
  Playlist: {
    entityClass: null,
    sheetClass: null,
    sidebarIcon: "fas fa-music"
  },

  SightLayer: {
    debug: false
  },

  /**
   * Token Configuration
   */
  Token: {
    visibilityControlIcon: "icons/svg/cowled.svg",
    effectsControlIcon: "icons/svg/aura.svg",
    combatControlIcon: "icons/svg/combat.svg",
    defeatedIcon: "icons/svg/skull.svg"
  },

  /**
   * Tile Object Configuration
   */
  Tile: {
    visibilityControlIcon: "icons/svg/cowled.svg",
    lockedControlIcon: "icons/svg/padlock.svg"
  },

  /**
   * Available Weather Effects implemntations
   * @type {Array}
   */
  weatherEffects: {},

  /**
   * An array of status effect icons which can be applied to Tokens
   * @type {Array}
   */
  statusEffects: [
    "icons/svg/skull.svg",
    "icons/svg/bones.svg",
    "icons/svg/sleep.svg",
    "icons/svg/stoned.svg",

    "icons/svg/eye.svg",
    "icons/svg/net.svg",
    "icons/svg/target.svg",
    "icons/svg/trap.svg",

    "icons/svg/blood.svg",
    "icons/svg/regen.svg",
    "icons/svg/degen.svg",
    "icons/svg/heal.svg",

    "icons/svg/radiation.svg",
    "icons/svg/biohazard.svg",
    "icons/svg/poison.svg",
    "icons/svg/hazard.svg",

    "icons/svg/pill.svg",
    "icons/svg/terror.svg",
    "icons/svg/sun.svg",
    "icons/svg/angel.svg",

    "icons/svg/fire.svg",
    "icons/svg/frozen.svg",
    "icons/svg/lightning.svg",
    "icons/svg/acid.svg",
    
    "icons/svg/fire-shield.svg",
    "icons/svg/ice-shield.svg",
    "icons/svg/mage-shield.svg",
    "icons/svg/holy-shield.svg"
  ],

  /**
   * A mapping of core audio effects used which can be replaced by systems or mods
   * @type {Object}
   */
  sounds: {
    dice: "sounds/dice.wav",
    lock: "sounds/lock.wav",
    notification: "sounds/notify.wav",
    combat: "sounds/drums.wav"
  },

  /**
   * Define the set of supported languages for localization
   * @type {Object}
   */
  supportedLanguages: {
    en: "English",
    br: "Português (Brasil)",
    fr: "Français",
    nl: "Nederlands"
  },

  /**
   * Maximum canvas zoom scale
   * @type {Number}
   */
  maxCanvasZoom: 3.0
};

/**
 * A helper class to manage common audio loading and playback functionality
 */
class AudioHelper {
  constructor() {

    /**
     * The set of Howl instances which have been created for different audio paths
     * @type {Object}
     */
    this.sounds = {};

    /**
     * A user gesture must be registered before audio can be played.
     * This Array contains the Howl instances which are requested for playback prior to a gesture.
     * Once a gesture is observed, we begin playing all elements of this Array.
     * @type {Array}
     */
    this.autoplayPending = [];

    /**
     * Register client-level settings for global volume overrides
     */
    game.settings.register("core", "globalPlaylistVolume", {
      name: "Global Playlist Volume",
      hint: "Define a global playlist volume modifier",
      scope: "client",
      config: false,
      default: 1.0,
      type: Number,
      onChange: volume => {
        for ( let p of game.playlists.entities ) {
          p.sounds.filter(s => s.playing).forEach(s => p.playSound(s));
        }
      }
    });

    game.settings.register("core", "globalAmbientVolume", {
      name: "Global Ambient Volume",
      hint: "Define a global ambient volume modifier",
      scope: "client",
      config: false,
      default: 1.0,
      type: Number,
      onChange: volume => {
        if ( canvas.ready ) {
          if ( canvas.background.isVideo ) canvas.background.source.volume = volume;
          canvas.sounds.update();
        }
      }
    });

    game.settings.register("core", "globalInterfaceVolume", {
      name: "Global Interface Volume",
      hint: "Define a global interface volume modifier",
      scope: "client",
      config: false,
      default: 0.5,
      type: Number
    });
  }

  /* -------------------------------------------- */

  /**
   * Create a Howl instance
   * @param src
   * @param preload
   * @param autoplay
   * @return {Howl}
   */
  create({src, preload=false, autoplay=false, volume=0.0, loop=false} = {}) {

    // Return an existing howl if one already exists for the source
    if ( src in this.sounds ) {
      return this.sounds[src].howl;
    }

    // Create the Howl instance
    let howl = new Howl({
      src: src,
      preload: preload,
      autoplay: autoplay,
      volume: volume,
      loop: loop,
      html5: true,
      onload: () => this.sounds[src].loaded = true,
      onplay: id => this.sounds[src].ids.push(id)
    });

    // Record the Howl instance for later use
    this.sounds[src] = {
      howl: howl,
      loaded: false,
      ids: []
    };
    return howl;
  }

  /* -------------------------------------------- */

  /**
   * Play a single audio effect by it's source path and Howl ID
   * @param {String} src
   * @param {Number} id
   */
  play(src, id) {
    let howl = this.sounds[src];
    if ( !howl ) throw new Error("Howl instance does not exist for sound " + src);
    howl.play(id);
  }

  /* -------------------------------------------- */

  _awaitFirstGesture() {
    let handler = event => {
      document.removeEventListener("mousemove", handler);
      console.log(`${vtt} | Activating web audio after receiving user gesture.`);
      this.autoplayPending.forEach(fn => fn());
      this.autoplayPending = [];
    };
    document.addEventListener("mousemove", handler);
  }

  /* -------------------------------------------- */

  preload(data) {
    game.socket.emit("preloadAudio", data);
    this.constructor.preload(data);
  }


  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Open socket listeners which transact ChatMessage data
   * @private
   */
  static socketListeners(socket) {
    socket.on('playAudio', this.play);
    socket.on('preloadAudio', this.preload);
  }

  /* -------------------------------------------- */

  /**
   * Play a one-off sound effect which is not part of a Playlist
   *
   * @param {Object} data           An object configuring the audio data to play
   * @param {String} data.src       The audio source file path, either a public URL or a local path relative to the public directory
   * @param {Number} data.volume    The volume level at which to play the audio, between 0 and 1.
   * @param {Boolean} data.autoplay Begin playback of the audio effect immediately once it is loaded.
   * @param {Boolean} data.loop     Loop the audio effect and continue playing it until it is manually stopped.
   * @param {Boolean} [push]        Push the audio sound effect to other connected clients?
   *
   * @return {Howl}                 A Howl instance which controls audio playback.
   *
   * @example
   * // Play the sound of a locked door for all players
   * Audio.play({src: "sounds/lock.wav", volume: 0.8, autoplay: true, loop: false}, true);
   */
  static play(data, push=false) {
    let audioData = mergeObject({src: null, volume: 1.0, autoplay: true, loop: false}, data, {insertKeys: true});
    audioData.volume *= game.settings.get("core", "globalInterfaceVolume");
    if ( push ) game.socket.emit("playAudio", audioData);
    new Howl(audioData);
  }

  /* -------------------------------------------- */

  /**
   * Create a Howl object and load it to be ready for later playback
   * @param {Object} data         The audio data to preload
   */
  static preload(data) {
    game.audio.create({
      src: data.path,
      autoplay: false,
      preload: true
    }).load();
  }
}


FONTS = {
  "Signika": {
    custom: {
      families: ['Signika'],
      urls: ['/fonts/signika/signika.css']
    }
  },
  "FontAwesome": {
    custom: {
      families: ['FontAwesome'],
      urls: ['/fonts/fontawesome/css/all.min.css']
    }
  },
  _loaded: []
};


/**
 * Load font, and perform a callback once the font has been rendered
 * @param fontName
 * @param callback
 */
function loadFont(fontName, callback) {
  const font = $.extend(FONTS[fontName], {
    fontloading: function(fontFamily, fvd) {
      console.log("Foundry VTT | Loading Font: " + fontFamily);
      let temp = document.createElement('p');
      temp.id = fontFamily;
      temp.classList.add("font-preload");
      temp.style.fontFamily = fontFamily;
      temp.style.fontSize = "0px";
      temp.style.visibility = "hidden";
      temp.innerHTML = ".";
      document.body.appendChild(temp);
    },
    fontactive: () => {
      console.log(`${vtt} | Loaded font ${fontName}`);
      $( 'p#'+fontName ).remove();
      if ( callback ) callback();
    },
    fontinactive: () => {
      console.log("Something went wrong with " + fontName);
      $( 'p#'+fontName ).remove();
    }
  });

  if (!FONTS._loaded.includes(fontName)) {
    WebFont.load(font);
    FONTS._loaded.push(fontName);
  }
}

class Hooks {

  /**
   * Register a callback handler which should be triggered when a hook is triggered.
   *
   * @param {String} hook   The unique name of the hooked event
   * @param {Function} fn   The callback function which should be triggered when the hook event occurs
   */
  static on(hook, fn) {
    console.log(`${vtt} | Registered callback for ${hook} hook`);
    this._hooks[hook] = this._hooks[hook] || [];
    this._hooks[hook].push(fn);
  }

  /* -------------------------------------------- */

  /**
   * Register a callback handler for an event which is only triggered once the first time the event occurs.
   * After a "once" hook is triggered the hook is automatically removed.
   *
   * @param {String} hook   The unique name of the hooked event
   * @param {Function} fn   The callback function which should be triggered when the hook event occurs
   */
  static once(hook, fn) {
    this._once.push(fn);
    this.on(hook, fn);
  }

  /* -------------------------------------------- */

  /**
   * Unregister a callback handler for a particular hook event
   *
   * @param {String} hook   The unique name of the hooked event
   * @param {Function} fn   The function that should be removed from the set of hooked callbacks
   */
  static off(hook, fn) {
    console.log(`${vtt} | Unregistered callback for ${hook} hook`);
    const fns = this._hooks[hook];
    let idx = fns.indexOf(fn);
    if ( idx !== -1 ) fns.splice(idx, 1);
  }

  /* -------------------------------------------- */

  /**
   * Call all hook listeners in the order in which they were registered
   * Hooks called this way can not be handled by returning false and will always trigger every hook callback.
   *
   * @param {String} hook   The hook being triggered
   * @param {...*} args      Arguments passed to the hook callback functions
   */
  static callAll(hook, ...args) {
    if ( !this._hooks.hasOwnProperty(hook) ) return;
    const fns = new Array(...this._hooks[hook]);
    for ( let fn of fns ) {
      this._call(hook, fn, args);
    }
    return true;
  }

  /* -------------------------------------------- */

  /**
   * Call hook listeners in the order in which they were registered.
   * Continue calling hooks until either all have been called or one returns `false`.
   *
   * Hook listeners which return `false` denote that the original event has been adequately handled and no further
   * hooks should be called.
   *
   * @param {String} hook   The hook being triggered
   * @param {...*} args      Arguments passed to the hook callback functions
   */
  static call(hook, ...args) {
    if ( !this._hooks.hasOwnProperty(hook) ) return;
    const fns = new Array(...this._hooks[hook]);
    for ( let fn of fns ) {
      let callAdditional = this._call(hook, fn, args);
      if ( callAdditional === false ) return false;
    }
    return true;
  }

  /* -------------------------------------------- */

  /**
   * Call a hooked function using provided arguments and perhaps unregister it.
   * @private
   */
  static _call(hook, fn, args) {
    if ( this._once.includes(fn) ) this.off(hook, fn);
    return fn(...args);
  }
}

// Static class attributes
Hooks._hooks = {};
Hooks._once = [];


// Keyboard key code constants
const KEYS = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  ESC: 27,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
  A: 65,
  D: 68,
  S: 83,
  W: 87,
  Z: 90,
  C: 67,
  V: 86,
  NUM1: 97,
  NUM2: 98,
  NUM3: 99,
  NUM4: 100,
  NUM5: 101,
  NUM6: 102,
  NUM7: 103,
  NUM8: 104,
  NUM9: 105,
  F5: 116
};


/* -------------------------------------------- */


class KeyboardManager {
  constructor() {

    // Track known key codes
    this.keys = KEYS;
    this.codes = [];
    for (let k of Object.values(KEYS)) {
      this.codes.push(k);
    }
    this._reset();

    // Status handlers
    this._moveTime = null;

    // Activate input listeners
    window.addEventListener('keydown', e => this._onKeyDown(e));
    window.addEventListener('keyup', e => this._onKeyUp(e));
    window.addEventListener("visibilitychange", e => this._reset(e));
    window.addEventListener("wheel", e => this._onWheel(e), {passive: false});
  }

  /* -------------------------------------------- */

  /**
   * Reset tracking for which keys are in the down and released states
   * @private
   */
  _reset() {
    this._downKeys = new Set([]);
    this._releasedKeys = new Set([]);
  }

  /* -------------------------------------------- */

  /**
   * Return whether the keyCode is currently in the DOWN state
   * @param {Number} keyCode    The key code to test
   * @type {Boolean}
   */
  isDown(keyCode) {
    return this._downKeys.has(keyCode);
  }

  /* -------------------------------------------- */

  /**
   * A helper method to test whether, given an Event, the CTRL (or CMD) keys are pressed
   * @param event
   * @return {Boolean}
   */
  isCtrl(event) {
    event = event.hasOwnProperty("ctrlKey") ? event : event.data.originalEvent;
    return event.ctrlKey || event.metaKey;
  }

  /* -------------------------------------------- */

  _onKeyDown(event) {
    let kc = event.keyCode;

    // Redirect apple CMD to CTRL
    if ( [91, 224].includes(kc) ) kc = KEYS.CTRL;

    // Handle valid codes
    if ( !this.codes.includes(kc) ) return;
    this._downKeys.add(kc);
    this._handleKeys(event, kc, false);
  }

  /* -------------------------------------------- */

  _onKeyUp(event) {
    let kc = event.keyCode;

    // Redirect apple CMD to CTRL
    if ( [91, 224].includes(kc) ) kc = KEYS.CMD;

    // Handle valid codes
    if ( !this.codes.includes(kc) ) return;
    this._downKeys.delete(kc);
    this._releasedKeys.add(kc);
    this._handleKeys(event, kc, true);
  }

  /* -------------------------------------------- */

  /**
   * Master mouse-wheel event keyboard handler
   * @private
   */
  _onWheel(event) {
    if ( event.ctrlKey ) event.preventDefault();

    // Handle wheel events for the canvas if it is ready and if it is our hover target
    let hover = document.elementFromPoint(event.clientX, event.clientY);
    if ( canvas.ready && hover && hover.id === "board" ) {
      event.preventDefault();
      let layer = canvas.activeLayer;
      let isCtrl = event.ctrlKey || event.metaKey,
          isShift = event.shiftKey;

      // Case 1 - rotate tokens or tiles
      if ( layer instanceof PlaceablesLayer && ( isCtrl || isShift ) ) {
        let objects = layer.placeables.filter(p => p._controlled);
        for ( let o of objects ) {
          o._onWheel(event);
        }
      }

      // Case 2 - zoom the canvas
      else canvas._onWheel(event);
    }
  }

  /* -------------------------------------------- */

  get moveKeys() {
    return [KEYS.UP, KEYS.LEFT, KEYS.DOWN, KEYS.RIGHT, KEYS.W, KEYS.A, KEYS.S, KEYS.D,
            KEYS.NUM1, KEYS.NUM2, KEYS.NUM3, KEYS.NUM4, KEYS.NUM5, KEYS.NUM6, KEYS.NUM7, KEYS.NUM8, KEYS.NUM9];
  }

  /* -------------------------------------------- */

  get hasFocus() {
    return ( $(":focus").length ) ? true : false;
  }

  /* -------------------------------------------- */

  _handleKeys(event, kc, up) {

    // Collect meta modifiers
    const modifiers = {
      isShift: event.shiftKey,
      isCtrl: event.ctrlKey || event.modKey,
      isAlt: event.altKey,
      hasFocus: this.hasFocus
    };

    // Disptach events to bound handlers
    if ( kc === KEYS.TAB ) this._onTab(event, up, modifiers);
    else if ( kc === KEYS.ESC ) this._onEscape(event, up, modifiers);
    else if ( kc === KEYS.SPACE ) this._onSpace(event, up, modifiers);
    else if ( this.moveKeys.includes(kc) ) this._onMovement(event, up, modifiers);
    else if ( kc === KEYS.Z ) this._onUndo(event, up, modifiers);
    else if ( [KEYS.DELETE, KEYS.BACKSPACE].includes(kc) ) this._onDelete(event, up, modifiers);
    else if ( kc === KEYS.ALT ) this._onAlt(event, up, modifiers);
    // else if ( kc === KEYS.F5 ) window.location.reload();
    else if ( kc === KEYS.C ) this._onCopy(event, up, modifiers);
    else if ( kc === KEYS.V ) this._onPaste(event, up, modifiers);

    // If the event was handled, reset the list of tracked keys
    if ( event.defaultPrevented ) this._releasedKeys = new Set([]);
  }

  /* -------------------------------------------- */

  /**
   * Handle TAB keypress events
   * @param event {Event}
   * @param up {Boolean}
   * @param modifiers {Object}
   * @private
   */
  _onTab(event, up, modifiers) {

    // Take no action if a form field has focus
    if ( modifiers.hasFocus ) return;

    // Prevent default on TAB-down and prepare to enact TAB workflow on UP
    if ( !up ) event.preventDefault();

    // Tab workflow on key-up
    if ( canvas.ready && up ) {
      event.preventDefault();

      // First attempt to cycle tokens
      let cycled = canvas.tokens.cycleTokens(!modifiers.shiftKey);

      // If we did not cycle, recenter the canvas
      if ( !cycled ) canvas.recenter();
      this._tabState = 0;
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle ESC keypress events
   * @param event {Event}
   * @param up {Boolean}
   * @param modifiers {Object}
   * @private
   */
  _onEscape(event, up, modifiers) {
    if ( !up || modifiers.hasFocus ) return;

    // Save fog of war if there are pending changes
    if ( canvas.ready ) canvas.sight.saveFog();

    // Case 1 - dismiss an open context menu
    if ( ui.context && ui.context.menu.length ) ui.context.close();

    // Case 2 - close open UI windows
    else if ( Object.keys(ui.windows).length ) {
      Object.values(ui.windows).forEach(app => app.close());
    }

    // Case 3 (GM) - release controlled objects
    else if ( canvas.ready && game.user.isGM && Object.keys(canvas.activeLayer._controlled).length ) {
      event.preventDefault();
      canvas.activeLayer.releaseAll();
    }

    // Case 4 - toggle the main menu
    else ui.menu.toggle();
  }

  /* -------------------------------------------- */

  /**
   * Handle SPACE keypress events
   * @param event {Event}
   * @param up {Boolean}
   * @param modifiers {Object}
   * @private
   */
  _onSpace(event, up, modifiers) {
    const ruler = canvas.controls.ruler;

    // Move along a measured ruler
    if ( up && canvas.ready && ruler.active ) {
      let moved = ruler.moveToken(event);
      if ( moved ) event.preventDefault();
    }

    // Pause the game
    else if ( up && !modifiers.hasFocus && game.user.isGM ) {
      event.preventDefault();
      game.togglePause(null, true);
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle ALT keypress events
   * @param event {Event}
   * @param up {Boolean}
   * @param modifiers {Object}
   * @private
   */
  _onAlt(event, up, modifiers) {
    if ( !canvas.ready ) return;
    event.preventDefault();

    // Highlight placeable objects on any layers which are visible
    const layers = canvas.layers.filter(l => l.objects && l.objects.visible);
    for ( let layer of layers ) {
      layer.placeables.filter(t => t.visible).forEach(t => {
        if ( !up ) t._onMouseOver(event);
        else t._onMouseOut(event);
      })
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle WASD or ARROW keypress events
   * @param event {Event}
   * @param up {Boolean}
   * @param modifiers {Object}
   * @private
   */
  _onMovement(event, up, modifiers) {
    if ( !canvas.ready || up || modifiers.hasFocus ) return;
    event.preventDefault();
    const layer = canvas.activeLayer;

    // Delay 50ms before shifting tokens in order to capture diagonal movements
    if ( layer instanceof TokenLayer || layer instanceof TilesLayer ) {
      setTimeout(() => this._handleMovement(event, layer), 50);
    }
  }

  /* -------------------------------------------- */

  _handleMovement(event, layer) {

    // Throttle keyboard movement to once per 150ms
    let now = Date.now();
    if ( now - this._moveTime < 150 ) return;
    this._moveTime = now;

    // Get controlled objects
    let objects = layer.placeables.filter(o => o._controlled);
    if ( objects.length === 0 ) return;
    let offsets = [0, 0];

    // Regular movement
    if ( [KEYS.W, KEYS.UP, KEYS.NUM8].some(k => this.isDown(k)) ) offsets[1] -= 1;
    if ( [KEYS.A, KEYS.LEFT, KEYS.NUM4].some(k => this.isDown(k)) ) offsets[0] -= 1;
    if ( [KEYS.S, KEYS.DOWN, KEYS.NUM2].some(k => this.isDown(k)) ) offsets[1] += 1;
    if ( [KEYS.D, KEYS.RIGHT, KEYS.NUM6].some(k => this.isDown(k)) ) offsets[0] += 1;

    // Diagonal movement
    if ( this.isDown(KEYS.NUM1) ) { offsets[0] -= 1; offsets[1] += 1; }
    if ( this.isDown(KEYS.NUM3) ) { offsets[0] += 1; offsets[1] += 1; }
    if ( this.isDown(KEYS.NUM7) ) { offsets[0] -= 1; offsets[1] -= 1; }
    if ( this.isDown(KEYS.NUM9) ) { offsets[0] += 1; offsets[1] -= 1; }

    // Rotate or shift tokens
    const cls = layer.constructor.placeableClass;
    cls.moveMany(offsets, event.shiftKey);
  }

  /* -------------------------------------------- */

  /**
   * Handle Z Keypress Events to generally undo previous actions
   * @param event {Event}
   * @param up {Boolean}
   * @param modifiers {Object}
   * @private
   */
  _onUndo(event, up, modifiers) {
    if ( modifiers.hasFocus || !canvas.ready ) return;

    // Ensure we are on a Placeables layer
    const layer = canvas.activeLayer;
    if ( !layer instanceof PlaceablesLayer ) return;

    // Undo history for the Layer
    if ( up && modifiers.isCtrl && game.user.isGM ) {
      if ( layer.history.length ) {
        layer.undoHistory();
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle "C" keypress events to copy data to clipboard
   * @param event {Event}
   * @param up {Boolean}
   * @param modifiers {Object}
   * @private
   */
  _onCopy(event, up, modifiers) {
    if ( !game.user.isGM ) return;
    if ( !canvas.ready || up || modifiers.hasFocus || !modifiers.isCtrl ) return;
    let layer = canvas.activeLayer;
    if ( layer instanceof PlaceablesLayer ) layer.copyObjects();
  }

  /* -------------------------------------------- */

  /**
   * Handle "V" keypress events to paste data from clipboard
   * @param event {Event}
   * @param up {Boolean}
   * @param modifiers {Object}
   * @private
   */
  _onPaste(event, up, modifiers ) {
    if ( !game.user.isGM ) return;
    if ( !canvas.ready || up || modifiers.hasFocus || !modifiers.isCtrl ) return;
    let layer = canvas.activeLayer;
    if ( layer instanceof PlaceablesLayer ) {
      let pos = canvas.app.renderer.plugins.interaction.mouse.getLocalPosition(canvas.tokens);
      layer.pasteObjects(pos);
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle DELETE Keypress Events
   * @param {Event} event
   * @param {Boolean} up
   * @param modifiers {Object}
   * @private
   */
  _onDelete(event, up) {
    if ( canvas.ready && up && !this.hasFocus ) {
      event.preventDefault();
      if ( canvas.activeLayer instanceof PlaceablesLayer ) canvas.activeLayer._onDeleteKey(event);
    }
  }
}

/* -------------------------------------------- */

/**
 * An abstract interface for defining setting storage patterns
 * Each setting is a key/value pair
 */
class ClientSettings {
  constructor(worldSettings) {

    /**
     * A object of registered game settings for this scope
     * @type {Object}
     */
    this.settings = {};

    /**
     * The storage interfaces used for persisting settings
     * Each storage interface shares the same API as window.localStorage
     */
    this.storage = {
      client: window.localStorage,
      world: new WorldSettingsStorage(worldSettings)
    }
  }

  /* -------------------------------------------- */

  /**
   * Return a singleton instance of the Game Settings Configuration app
   * @return {SettingsConfig}
   */
  get sheet() {
    if ( !this._sheet ) this._sheet = new SettingsConfig(this.settings);
    return this._sheet;
  }

  /* -------------------------------------------- */

  /**
   * Register a new game setting under this setting scope
   * @param module {String}   The module namespace under which the setting is registered
   * @param key {String}      The key name for the setting under the namespace module
   * @param data {Object}     Configuration for setting data
   */
  register(module, key, data) {
    if ( !module || !key ) throw new Error("You must specify both module and key portions of the setting");
    data["key"] = key;
    data["module"] = module;
    data["scope"] = ["client", "world"].includes(data.scope) ? data.scope : "client";
    key = `${module}.${key}`;
    this.settings[key] = data;
  }

  /* -------------------------------------------- */

  /**
   * Get the value of a game setting for a certain module and setting key
   * @param module {String}   The module namespace under which the setting is registered
   * @param key {String}      The setting key to retrieve
   */
  get(module, key) {
    if ( !module || !key ) throw new Error("You must specify both module and key portions of the setting");
    key = `${module}.${key}`;
    if ( !this.settings.hasOwnProperty(key) ) throw new Error("This is not a registered game setting");

    // Get the setting and the correct storage interface
    let setting = this.settings[key],
        storage = this.storage[setting.scope];

    // Get the setting value
    let value = JSON.parse(storage.getItem(key));
    value = value !== null ? value : setting.default;

    // Cast the value using the requested type
    return setting.type(value);
  }

  /* -------------------------------------------- */

  /**
   * Get the value of a game setting for a certain module and setting key
   * @param module {String}   The module namespace under which the setting is registered
   * @param key {String}      The setting key to retrieve
   * @param value             The data to assign to the setting key
   */
  async set(module, key, value) {
    if ( !module || !key ) throw new Error("You must specify both module and key portions of the setting");
    key = `${module}.${key}`;

    // Get the setting and the correct storage interface
    if ( !this.settings.hasOwnProperty(key) ) throw new Error("This is not a registered game setting");
    let setting = this.settings[key];

    // Push world setting changes
    return this.update(key, value);
  }

  /* -------------------------------------------- */

  /**
   * Update the setting storage with a new value
   * @param {String} key
   * @param {*} value
   * @return {Promise}
   */
  async update(key, value) {
    let setting = this.settings[key],
        storage = this.storage[setting.scope];
    await storage.setItem(key, JSON.stringify(value));

    // Trigger change callback
    let onChange = this.settings[key].onChange;
    if ( onChange instanceof Function ) onChange(value);

    // Return the new value
    return value;
  }

  /* -------------------------------------------- */

  static socketListeners(socket) {
    socket.on('updateWorldSetting', (key, value) => {
      value = JSON.parse(value);
      const setting = game.settings.settings[key];
      game.settings.storage.world._set(key, value);
      if ( setting.onChange instanceof Function ) setting.onChange(value);
      game.settings.sheet.render();
    });
  }
}


/* -------------------------------------------- */


/**
 * A simple interface for World settings storage which imitates the API provided by localStorage
 */
class WorldSettingsStorage {
  constructor(settings) {
    this.data = {};
    for ( let s of settings ) {
      this._set(s.key, s.value);
    }
  }

  getItem(key) {
    return this.data[key] || null;
  }

  setItem(key, value) {
    return new Promise((resolve, reject) => {
      game.socket.emit("updateWorldSetting", key, value, setting => {
        this._set(key, setting.value);
        resolve();
      });
    });
  }

  _set(key, value) {
    this.data[key] = value;
  }
}


/* -------------------------------------------- */


class SocketInterface {

  /**
   * A generalized socket trigger interface which standardizes the way that information is provided to the server
   *
   * @param {String} eventName      The socket event name to emit
   * @param {Object} eventData      Data provided to the server as part of the event
   * @param {Object} options        Additional options which contextualize the socket request
   * @param {String} preHook        If an optional preHook is provided, ensure it does not return false before
   *                                proceeding with the socket emission.
   * @param {*} context             The Entity or Object context for the request. Passed as the first argument to the
   *                                preHook.
   * @return {Promise}              A Promise which resolves to the return value of the provided handler function
   */
  static trigger(eventName, eventData, options={}, preHook, context) {

    // Dispatch the pre-hook
    if ( preHook ) {
      let hookArgs = context ? Array(context, ...Object.values(eventData)) : Object.values(eventData);
      let allowed = Hooks.call(preHook, ...hookArgs);
      if ( allowed === false ) {
        console.log(`${vtt} | ${eventName} submission prevented by ${preHook} hook`);
        return new Promise(resolve => null);   // Deliberately return an unresolved Promise
      }
    }

    // Dispatch the socket event
    return new Promise((resolve, reject) => {
      game.socket.emit(eventName, eventData, options, response => {
        if ( response.hasOwnProperty("error") ) {
          this._handleDatabaseError(response.error);
          reject();
        }
        else resolve(response);
      });
    })
  }

  /* -------------------------------------------- */

  /**
   * General use handler for receiving a database error and transforming it into a notification and log message
   * @param err
   * @private
   */
  static _handleDatabaseError(err) {
    let error = err instanceof Error ? err : err.error;
    ui.notifications.error(error.message);
    console.error(error.stack);
  }
}

/**
 * Export data content to be saved to a local file
 * @param {String} data       Data content converted to a string
 * @param {String} type       The type of
 * @param {String} filename   The filename of the resulting download
 */
function saveDataToFile(data, type, filename) {
  const blob = new Blob([data], {type: type});

  // Create an element to trigger the download
  let a = document.createElement('a');
  a.href = window.URL.createObjectURL(blob);
  a.download = filename;

  // Dispatch a click event to the element
  a.dispatchEvent(new MouseEvent("click", {bubbles: true, cancelable: true, view: window}));
  setTimeout(() => window.URL.revokeObjectURL(a.href), 100);
}


/* -------------------------------------------- */


/**
 * Read text data from a user provided File object
 * @param {File} file           A File object
 * @return {Promise.<String>}   A Promise which resolves to the loaded text data
 */
function readTextFromFile(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = ev => {
      resolve(reader.result);
    };
    reader.onerror = ev => {
      reader.abort();
      reject();
    };
    reader.readAsText(file);
  });
}


/* -------------------------------------------- */

let _appId = 0;
let _maxZ = 100;

const MIN_WINDOW_WIDTH = 200,
      MIN_WINDOW_HEIGHT = 50;

/**
 * The standard application window that is rendered for a large variety of UI elements in Foundry VTT
 *
 * @param options {Object}    Configuration options which control how the application is rendered
 *
 * @param options.height {Number}   The height in pixels (or "auto") for the rendered element
 * @param options.width {Number}    The width in pixels (or "auto") for the rendered element
 * @param options.top {Number}      The vertical position (from the top) of the rendered element
 * @param options.left {Number}     The horizontal position (from the left) of the rendered element
 * @param options.template {String} The default HTML template path to use for applications of this type
 * @param options.popOut {Boolean}  Display the element wrapped in a containing window frame (true, the default) or
 *                                  only the inner HTML (false).
 * @param options.minimizable {Boolean} Customize whether the application is able to be minimized by double-clicking
 *                                  the header. Default behavior is the value of `options.popOut`
 * @param options.resizable {Boolean} Customize whether a window application window may be re-sized by dragging a
 *                                  handle in the bottom-right corner of the window display.
 */
class Application {
  constructor(options) {

    /**
     * The options provided to this application upon initialization
     * @type {Object}
     */
    this.options = mergeObject(this.constructor.defaultOptions, options || {}, {
      insertKeys: true,
      insertValues: false,
      overwrite: true,
      inplace: false
    });

    /**
     * The application ID is a unique incrementing integer which is used to identify every application window
     * drawn by the VTT
     * @type {Number}
     */
    this.appId = _appId += 1;

    /**
     * An internal reference to the HTML element this application renders
     * @type {jQuery}
     */
    this._element = null;

    /**
     * Track the current position and dimensions of the Application UI
     * @type {Object}
     */
    this.position = {
      width: this.options.width,
      height: this.options.height,
      left: this.options.left,
      top: this.options.top,
      scale: this.options.scale
    };

    /**
     * Track whether the Application is currently minimized
     * @type {Boolean}
     * @private
     */
    this._minimized = false;

    /**
     * Track whether the Application has been successfully rendered
     * @type {Boolean}
     * @private
     */
    this._rendered = false;
  }

	/* -------------------------------------------- */

  /**
   * Assign the default options which are supported by this Application
   */
	static get defaultOptions() {
    let config = CONFIG[this.name] || {};
    return {
      width: config.width,
      height: config.height,
      top: null,
      left: null,
      popOut: true,
      minimizable: true,
      id: "",
      classes: [],
      title: "",
      template: config.template
    };
  };

  /* -------------------------------------------- */

  /**
   * Return the CSS application ID which uniquely references this UI element
   */
  get id() {
    return this.options.id ? this.options.id : `app-${this.appId}`;
  }

  /* -------------------------------------------- */

  /**
   * Return the active application element, if it currently exists in the DOM
   * @type {jQuery|HTMLElement}
   */
  get element() {
    if ( this._element ) return this._element;
    let selector = "#"+this.id;
    return $(selector);
  }

  /* -------------------------------------------- */

  /**
   * The path to the HTML template file which should be used to render the inner content of the app
   * @type {String}
   */
  get template() {
    return this.options.template;
  }

  /* -------------------------------------------- */

  /**
   * Control the rendering style of the application. If popOut is true, the application is rendered in its own
   * wrapper window, otherwise only the inner app content is rendered
   * @type {boolean}
   */
  get popOut() {
    return (this.options.popOut !== undefined) ? Boolean(this.options.popOut) : true;
  }

  /* -------------------------------------------- */

  /**
   * An Application window should define its own title definition logic which may be dynamic depending on its data
   * @type {String}
   */
  get title() {
    return this.options.title;
  }

  /* -------------------------------------------- */
  /* Application rendering
  /* -------------------------------------------- */

  /**
   * An application should define the data object used to render its template.
   * This function may either return an Object directly, or a Promise which resolves to an Object
   * If undefined, the default implementation will return an empty object allowing only for rendering of static HTML
   *
   * @return {Object|Promise}
   */
  getData(options) {
    return {};
  }

	/* -------------------------------------------- */

  /**
   * Render the Application by evaluating it's HTML template against the object of data provided by the getData method
   * If the Application is rendered as a pop-out window, wrap the contained HTML in an outer frame with window controls
   *
   * @param {Boolean} force   Add the rendered application to the DOM if it is not already present. If false, the
   *                          Application will only be re-rendered if it is already present.
   * @param {Object} options  Additional rendering options which are applied to customize the way that the Application
   *                          is rendered in the DOM.
   *
   * @param {Number} options.left           The left positioning attribute
   * @param {Number} options.top            The top positioning attribute
   * @param {Number} options.width          The rendered width
   * @param {Number} options.height         The rendered height
   * @param {Number} options.scale          The rendered transformation scale
   * @param {Boolean} options.log           Whether to display a log message that the Application was rendered
   * @param {String} options.renderContext  A context-providing string which suggests what event triggered the render
   * @param {*} options.renderData          The data change which motivated the render request
   *
   */
	render(force=false, options={}) {
	  this._render(force, options);
	  return this;
  }

  /* -------------------------------------------- */

  /**
   * An asynchronous inner function which handles the rendering of the Application
   * @param {Object} options    Provided rendering options, see the render function for details
   * @return {Promise}
   * @private
   */
  async _render(force=false, options={}) {
    this._rendered = false;

    // Get the existing HTML element and data for rendering
    const element = this.element;
    if ( !force && !element.length ) return;
    if ( options.log || (force && !element.length) ) console.log(`${vtt} | Rendering ${this.constructor.name}`);

    // Obtain application data used for rendering
    const data = await this.getData(options);

    // Render the inner content
    const inner = await this._renderInner(data, options);
    let html = inner;

    // If the application already exists in the DOM, replace the inner content
    if ( element.length ) this._replaceHTML(element, html, options);

    // Otherwise render a new app
    else {

      // Wrap a popOut application in an outer frame
      if ( this.popOut ) {
        html = await this._renderOuter(options);
        html.find('.window-content').append(inner);
        ui.windows[this.appId] = this;
      }

      // Add the HTML to the DOM and record the element
      this._injectHTML(html, options);
    }

    // Set the application position (if it's not currently minimized)
    if ( this.popOut && !this._minimized ) this.setPosition(this.position);

    // Activate event listeners on the inner HTML
    this.activateListeners(inner);

    // Dispatch the render<Application> hook
    Hooks.call("render"+this.constructor.name, this, html, data);
    this._rendered = true;
  }

	/* -------------------------------------------- */

  /**
   * Render the outer application wrapper
   * @return {Promise.<HTMLElement>}   A promise resolving to the constructed jQuery object
   * @private
   */
	async _renderOuter(options) {

    // Gather basic application data
    const classes = options.classes || this.options.classes;
    const windowData = {
      id: this.id,
      classes: classes.join(" "),
      appId: this.appId,
      title: this.title,
      headerButtons: this._getHeaderButtons()
    };

    // Render the template and return the promise
    let html = await renderTemplate("templates/app-window.html", windowData);
    html = $(html);

    // Activate header button click listeners
    windowData.headerButtons.forEach(button => {
      const btn = html.find(`a.${button.class}`);
      btn.mousedown(ev => ev.stopPropagation()).mouseup(ev => {
        ev.preventDefault();
        button.onclick(ev);
      })
    });

    // Make the outer window draggable
    const header = html.find('header')[0];
    new Draggable(this, html, header, this.options.resizable);

    // Make the outer window minimizable
    if ( this.options.minimizable ) {
      header.addEventListener('dblclick', this._onToggleMinimize.bind(this));
    }

    // Set the outer frame z-index
    if ( Object.keys(ui.windows).length === 0 ) _maxZ = 100;
    html.css({zIndex: ++_maxZ});

    // Return the outer frame
    return html;
  }

  /* -------------------------------------------- */

  /**
   * Render the inner application content
   * @param {Object} data         The data used to render the inner template
   * @return {Promise.<jQuery>}   A promise resolving to the constructed jQuery object
   * @private
   */
	async _renderInner(data, options) {
    let html = await renderTemplate(this.template, data);
    if ( html === "" ) throw new Error(`No data was returned from template ${this.template}`);
    return $(html);
  }

	/* -------------------------------------------- */

  /**
   * Customize how inner HTML is replaced when the application is refreshed
   * @param {HTMLElement|jQuery} element  The original HTML element
   * @param {HTMLElement|jQuery} html     New updated HTML
   * @private
   */
	_replaceHTML(element, html, options) {
	  if ( !element.length ) return;

	  // For pop-out windows update the inner content and the window title
    if ( this.popOut ) {
      element.find('.window-content').html(html);
      element.find('.window-title').text(this.title);
    }

    // For regular applications, replace the whole thing
    else element.replaceWith(html);
  }

	/* -------------------------------------------- */

  /**
   * Customize how a new HTML Application is added and first appears in the DOC
   * @param html {jQuery}
   * @private
   */
	_injectHTML(html, options) {
    $('body').append(html);
    this._element = html;
    html.hide().fadeIn(200);
  }

	/* -------------------------------------------- */

  /**
   * Specify the set of config buttons which should appear in the Application header
   * Buttons should be returned as an Array of Objects with the following keys:
   * label: The button label
   * icon: A font-awesome glyph icon
   * class: the css class of the button
   * onclick: the button click handler
   * @return {Array.<Object>}
   * @private
   */
  _getHeaderButtons() {
    return [
      {
        label: "Close",
        class: "close",
        icon: "fas fa-times",
        onclick: ev => this.close()
      }
    ];
  }

	/* -------------------------------------------- */
	/* Event Listeners and Handlers
	/* -------------------------------------------- */

  /**
   * Once the HTML for an Application has been rendered, activate event listeners which provide interactivity for
   * the application
   * @param html {jQuery|HTMLElement}
   */
  activateListeners(html) {}

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /**
   * Close the application and un-register references to it within UI mappings
   * This function returns a Promise which resolves once the window closing animation concludes
   * @return {Promise}
   */
  async close() {
    let el = this.element;
    if ( !el.length ) return Promise.resolve();
    el.css({minHeight: 0});
    return new Promise(resolve => {
      el.slideUp(200, () => {
        el.remove();
        this._element = null;
        delete ui.windows[this.appId];
        this._rendered = false;
        resolve();
      });
    });
  }

  /* -------------------------------------------- */

  /**
   * Minimize the pop-out window, collapsing it to a small tab
   * Take no action for applications which are not of the pop-out variety or apps which are already minimized
   * @return {Promise}    A Promise which resolves to true once the minimization action has completed
   */
  async minimize() {
    if ( !this.popOut || [true, null].includes(this._minimized) ) return;
    this._minimized = null;

    // Get content
    let window = this.element,
        header = window.find('.window-header'),
        content = window.find('.window-content');

    // Remove minimum width and height styling rules
    window.css({minWidth: 100, minHeight: 30});

    // Slide-up content
    content.slideUp(100);

    // Slide up window height
    return new Promise((resolve) => {
      window.animate({height: `${header[0].offsetHeight+1}px`}, 100, () => {
        header.children().not(".window-title").not(".close").hide();
        window.animate({width: MIN_WINDOW_WIDTH}, 100, () => {
          window.addClass("minimized");
          this._minimized = true;
          resolve(true);
        });
      });
    })
  }

  /* -------------------------------------------- */

  /**
   * Maximize the pop-out window, expanding it to its original size
   * Take no action for applications which are not of the pop-out variety or are already maximized
   * @return {Promise}    A Promise which resolves to true once the maximization action has completed
   */
  async maximize() {
    if ( !this.popOut || [false, null].includes(this._minimized) ) return;
    this._minimized = null;

    // Get content
    let window = this.element,
        header = window.find('.window-header'),
        content = window.find('.window-content');

    // Expand window
    return new Promise((resolve) => {
      window.animate({width: this.position.width, height: this.position.height}, 100, () => {
        header.children().show();
        content.slideDown(100, () => {
          window.removeClass("minimized");
          this._minimized = false;
          window.css({minWidth: '', minHeight: ''});
          this.setPosition(this.position);
          resolve(true);
        });
      });
    })
  }

  /* -------------------------------------------- */

  /**
   * Set the application position and store it's new location
   * @param {Number} left
   * @param {Number} top
   * @param {Number} width
   * @param {Number} height
   */
  setPosition({left, top, width, height, scale}={}) {
    let el = this.element[0],
      p = this.position,
      pop = this.popOut,
      updateSize = false;

    // Update Width
    if ( !el.style.width || width ) {
      let minWidth = el.style.minWidth || pop ? MIN_WINDOW_WIDTH : 0;
      p.width = Math.clamped(
        minWidth,
        width || el.offsetWidth,
        el.style.maxWidth || (0.95 * window.innerWidth)
      );
      el.style.width = p.width+"px";
      updateSize = true;
    }

    // Update Height
    if ( !el.style.height || height ) {
      let minHeight = el.style.minHeight || pop ? MIN_WINDOW_HEIGHT : 0;
      p.height = Math.clamped(
        minHeight,
        height || el.offsetHeight,
        el.style.maxHeight || (0.95 * window.innerHeight)
      );
      el.style.height = p.height+"px";
      updateSize = true;
    }

    // Update Left
    if ( (pop && !el.style.left) || Number.isFinite(left) ) {
      let maxLeft = Math.max(window.innerWidth - el.offsetWidth, 0);
      if ( !Number.isFinite(left) ) left = (window.innerWidth - el.offsetWidth) / 2;
      p.left = Math.clamped(left, 0, maxLeft);
      el.style.left = p.left+"px";
    }

    // Update Top
    if ( (pop && !el.style.top) || Number.isFinite(top) ) {
      let maxTop = Math.max(window.innerHeight - el.offsetHeight, 0);
      if ( !Number.isFinite(top) ) top = (window.innerHeight - el.offsetHeight) / 2;
      p.top = Math.clamped(top, 0, maxTop);
      el.style.top = p.top+"px";
    }

    // Update Scale
    if ( scale ) {
      p.scale = scale;
      if ( scale === 1 ) el.style.transform = "";
      else el.style.transform = `scale(${scale})`;
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle application minimization behavior - collapsing content and reducing the size of the header
   * @param {Event} ev
   * @private
   */
  _onToggleMinimize(ev) {
    ev.preventDefault();
    if ( this._minimized ) this.maximize(ev);
    else this.minimize(ev);
  }

  /* -------------------------------------------- */

  /**
   * Additional actions to take when the application window is resized
   * @param {Event} event
   * @private
   */
  _onResize(event) {}
}

/* -------------------------------------------- */

/**
 * An abstract pattern for defining an Application responsible for updating some object using an HTML form
 *
 * A few critical assumptions:
 * 1) This application is used to only edit one object at a time
 * 2) The template used contains one (and only one) HTML <form> as it's outer-most element
 * 3) This abstract layer has no knowledge of what is being updated, so the implementation must define _updateObject
 *
 * @type {Application}
 *
 * @param object {*}                    Some object or entity which is the target to be updated.
 *
 * @param [options] {Object}            Additional options which modify the rendering of the sheet.
 * @param options.editable {Boolean}        (true) Is the form editable, or should its fields be disabled?
 * @param options.closeOnSubmit {Boolean}   (true) Automatically close the form when the submit button is pressed.
 * @param options.submitOnClose {Boolean}   (false) Automatically submit the form if the application window is closed.
 * @param options.submitOnUnfocus {Boolean} (false) Automatically submit the form if an input field is unfocused.
 */
class FormApplication extends Application {
  constructor(object, options) {
    super(options);

    /**
     * The object target which we are using this form to modify
     * @type {*}
     */
    this.object = object;

    /**
     * A convenience reference to the form HTMLElement
     * @type {HTMLElement}
     */
    this.form = null;

    /**
     * Keep track of any FilePicker instances which are associated with this form
     * The values of this Array are inner-objects with references to the FilePicker instances and other metadata
     * @type {Array}
     */
    this.filepickers = [];

    /**
     * Keep track of any mce editors which may be active as part of this form
     * The values of this Array are inner-objects with references to the MCE editor and other metadata
     * @type {Object}
     */
    this.editors = {};
  }

	/* -------------------------------------------- */

  /**
   * Assign the default options which are supported by the entity edit sheet
   * @type {Object}
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.classes = ["form"];
	  options.closeOnSubmit = true;
	  options.submitOnClose = false;
	  options.submitOnUnfocus = false;
	  options.editable = true;
	  return options;
  }

	/* -------------------------------------------- */

  /**
   * Is the Form Application currently editable?
   * @type {Boolean}
   */
	get isEditable() {
	  return this.options.editable;
  }

	/* -------------------------------------------- */

  /**
   * Provide data to the form
   * @return {Object}   The data provided to the template when rendering the form
   */
  getData() {
    return {
      object: duplicate(this.object),
      options: this.options
    }
  }

  /* -------------------------------------------- */

  /**
   * Render the FormApplication inner sheet content.
   * See Application._renderInner for more detail.
   * @private
   */
  async _renderInner(...args) {
    const html = await super._renderInner(...args);
    this.form = html[0];
    return html;
  }

	/* -------------------------------------------- */
	/*  Event Listeners and Handlers                */
	/* -------------------------------------------- */

  /**
   * Activate the default set of listeners for the Entity sheet
   * These listeners handle basic stuff like form submission or updating images
   *
   * @param html {JQuery}     The rendered template ready to have listeners attached
   */
	activateListeners(html) {

    // Disable input fields if the form is not editable
    if ( !this.isEditable ) {
      this._disableFields(this.form);
      return
    }

    // Process form submission
    this.form.onsubmit = this._onSubmit.bind(this);

    // Maybe process unfocus events
    if ( this.options.submitOnUnfocus ) {
      html.find("input").focusout(this._onUnfocus.bind(this));
    }

    // Detect and activate TinyMCE rich text editors
    html.find('.editor-content[data-edit]').each((i, div) => this._activateEditor(div));

    // Detect and activate file-picker buttons
    html.find('button.file-picker').each((i, button) => this._activateFilePicker(button));

    // Color change inputs
    html.find('input[type="color"][data-edit]').change(this._onColorPickerChange.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * If the form is not editable, disable its input fields
   * @param form {HTMLElement}
   * @private
   */
  _disableFields(form) {
    const inputs = ["INPUT", "SELECT", "TEXTAREA", "BUTTON"];
    for ( let i of inputs ) {
      for ( let el of form.getElementsByTagName(i) ) el.setAttribute("disabled", "");
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle the change of a color picker input which enters it's chosen value into a related input field
   * @private
   */
  _onColorPickerChange(event) {
    event.preventDefault();
    let input = event.target,
        form = input.form;
    form[input.dataset.edit].value = input.value;
  }

  /* -------------------------------------------- */

  /**
   * Handle standard form submission steps
   * @private
   */
  _onSubmit(event, {preventClose=false}={}) {
    event.preventDefault();
    if ( !this._rendered || !this.options.editable || this._submitting ) return false;
    this._submitting = true;

    // Acquire the basic form data
    const form = this.element.find("form").first()[0];
    const formData = validateForm(form);

    // Add or remove fields for modified MCE editors
    Object.values(this.editors).forEach(ed => {
      if ( ed.mce && ed.changed ) formData[ed.target] = ed.mce.getContent();
      else delete formData[ed.target];
    });

    // Trigger the object update
    this._updateObject(event, formData);
    if ( this.options.closeOnSubmit && !preventClose ) this.close();
    this._submitting = false;
  }

  /* -------------------------------------------- */

  /**
   * Handle unfocusing an input on form - maybe trigger an update if ``options.liveUpdate`` has been set to true
   * @param event {Event}   The initial triggering event
   * @private
   */
  _onUnfocus(event) {
    this._submitting = true;
    setTimeout(() => {
      let hasFocus = $(":focus").length;
      if ( !hasFocus ) this._onSubmit(event);
      this._submitting = false;
    }, 25);
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {
    throw new Error("A subclass of the FormApplication must implement the _updateObject method.")
  }

  /* -------------------------------------------- */
  /*  TinyMCE Editor
  /* -------------------------------------------- */

  /**
   * Activate a TinyMCE editor instance present within the form
   * @param div {HTMLElement}
   * @private
   */
  _activateEditor(div) {

    // Get the editor content div
    let target = div.getAttribute("data-edit"),
        button = div.nextElementSibling,
        hasButton = button && button.classList.contains("editor-edit"),
        wrap = div.parentElement.parentElement,
        wc = $(div).parents(".window-content")[0];

    // Determine the preferred editor height
    let heights = [wrap.offsetHeight, wc ? wc.offsetHeight : null];
    if ( div.offsetHeight > 0 ) heights.push(div.offsetHeight);
    let height = Math.min(...heights.filter(h => Number.isFinite(h))) - 36;

    // Get initial content
    const data = this.object instanceof Entity ? this.object.data : this.object,
          initialContent = getProperty(data, target);

    // Add record to editors registry
    this.editors[target] = {
      target: target,
      button: button,
      hasButton: hasButton,
      mce: null,
      active: !hasButton,
      changed: false
    };

    // Define editor options
    let editorOpts = {
      target: div,
      height: height,
      setup: mce => this.editors[target].mce = mce,
      save_onsavecallback: mce => {
        this._onEditorSave(target, mce.getElement(), mce.getContent());
        if (hasButton) {
          mce.remove();
          button.style.display = "block";
        }
      }
    };

    // Define the creation function
    const _createEditor = (target, editorOpts, initialContent) => {
      createEditor(editorOpts, initialContent).then(mce => {
        mce[0].focus();
        mce[0].on('change', ev => this.editors[target].changed = true);
      });
    };

    // If we are using a toggle button, delay activation until it is clicked
    if (hasButton) button.onclick = event => {
      this.editors[target].changed = false;
      this.editors[target].active = true;
      button.style.display = "none";
      editorOpts["height"] = div.offsetHeight - 36;
      _createEditor(target, editorOpts, initialContent);

    };
    else _createEditor(target, editorOpts, initialContent);
  }

  /* -------------------------------------------- */

  /**
   * By default, when the editor is saved treat it as a form submission event
   * @private
   */
  _onEditorSave(target, element, content) {
    element.innerHTML = content;
    const formData = validateForm(this.form);
    let event = new Event("mcesave");

    // Remove the MCE from the set of active editors
    this.editors[target].active = false;
    this.editors[target].mce.destroy();
    this.editors[target].mce = null;

    // Update the form object
    this._updateObject(event, formData);
  }

  /* -------------------------------------------- */
  /*  FilePicker UI
  /* -------------------------------------------- */

  /**
   * Activate a FilePicker instance present within the form
   * @param button {HTMLElement}
   * @private
   */
  _activateFilePicker(button) {
    button.onclick = event => {
      event.preventDefault();
      let target = button.getAttribute("data-target");
      let fp = FilePicker.fromButton(button);
      this.filepickers.push({
        target: target,
        app: fp
      });
      fp.browse();
    }
  }

  /* -------------------------------------------- */
  /*  METHODS                                     */
  /* -------------------------------------------- */

  /**
   * Extend the logic applied when the application is closed to destroy any remaining MCE instances
   * This function returns a Promise which resolves once the window closing animation concludes
   * @return {Promise}
   */
  async close() {
    if ( !this._rendered ) return;

    // Optionally trigger a save
    if ( this.options.submitOnClose && !this._submitting ) {
      this._onSubmit(new Event("submitOnClose"), {preventClose: true});
    }

    // Close any open FilePicker instances
    this.filepickers.forEach(fp => {
      if ( fp.app ) fp.app.close();
    });

    // Close any open MCE editors
    Object.values(this.editors).forEach(ed => {
      if ( ed.mce ) ed.mce.destroy();
    });
    this.editors = {};

    // Close the application itself
    return super.close();
  }
}


/* -------------------------------------------- */


/**
 * A simple implementation of the FormApplication pattern which is specialized in editing Entity instances
 * @type {FormApplication}
 */
class BaseEntitySheet extends FormApplication {
  constructor(...args) {
    super(...args);

    // Register the sheet as an active Application for the Entity
    this.entity.apps[this.appId] = this;
  }

	/* -------------------------------------------- */

  /**
   * A convenience accessor for the object property of the inherited FormApplication instance
   */
	get entity() {
	  return this.object;
  }

	/* -------------------------------------------- */

  /**
   * The BaseEntitySheet requires that the form itself be editable as well as the entity be owned
   * @type {Boolean}
   */
	get isEditable() {
	  return this.options.editable && this.entity.owner;
  }

	/* -------------------------------------------- */

  /**
   * Assign the default options which are supported by the entity edit sheet
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.classes = ["sheet"];
	  options.template = `templates/sheets/${this.name.toLowerCase()}.html`;
	  return options;
  }

	/* -------------------------------------------- */

  /**
   * The displayed window title for the sheet - the entity name by default
   * @type {String}
   */
  get title() {
    return this.entity.name;
  }

	/* -------------------------------------------- */

  /**
   * Default data preparation logic for the entity sheet
   */
  getData() {
    let isOwner = this.entity.owner;
    return {
      entity: duplicate(this.entity.data),
      owner: isOwner,
      limited: this.entity.limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: isOwner ? "editable" : "locked"
    }
  }

	/* -------------------------------------------- */

  /**
   * Extend the definition of header buttons for Entity Sheet forms to include an option to import from a Compendium
   * @private
   */
  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();
    if ( this.options.compendium ) {
      buttons.unshift({
        label: "Import",
        class: "import",
        icon: "fas fa-download",
        onclick: async ev => {
          await this.close();
          this.entity.collection.importFromCollection(this.options.compendium, this.entity._id);
        }
      });
    }
    return buttons;
  }

	/* -------------------------------------------- */

  /**
   * Implement the _updateObject method as required by the parent class spec
   * This defines how to update the subject of the form when the form is submitted
   * @private
   */
  _updateObject(event, formData) {
    formData["_id"] = this.object._id;
    this.entity.update(formData);
  }
}

/* -------------------------------------------- */

/**
 * A helper class which assists with localization and string translation
 */
class Localization {
  constructor() {

    /**
     * The target language for localization
     * @type {String}
     */
    this.lang = null;

    /**
     * The translation dictionary for the target language
     * @type {Object}
     */
    this.translations = {};
  }

	/* -------------------------------------------- */

  /**
   * Prepare the dictionary of translation strings for the requested language
   * @return {Promise}
   * @private
   */
  async _getTranslations() {
    const translations = {};

    // Define the order of translations to apply
    const loadOrder = [
      `lang/${this.lang}.json`
    ];

    // Add game system translations
    if ( game.system ) {
      const systemLanguages = game.system.languages;
      if ( systemLanguages instanceof Object && systemLanguages.hasOwnProperty(this.lang) ) {
        loadOrder.push(`systems/${game.system.name}/${systemLanguages[this.lang]}`);
      }
    }

    // Add module translations
    if ( game.modules ) {
      for ( let module of game.modules ) {
        const lang = module.data.languages;
        if ( lang instanceof Object && lang.hasOwnProperty(this.lang) ) {
          loadOrder.push(`modules/${module.name}/${lang[this.lang]}`);
        }
      }
    }

    // Load the translations sequentially, overwriting any previously defined strings
    for ( let src of loadOrder ) {
      let json = await this._loadTranslationFile(src);
      mergeObject(translations, json, {inplace: true});
    }

    // Return the prepared translations
    return translations;
  }

	/* -------------------------------------------- */

  /**
   * Load a single translation file and return its contents as processed JSON
   * @param {String} src    The translation file path to load
   * @private
   */
  async _loadTranslationFile(src) {
    const resp = await fetch(src);
    if ( resp.status !== 200 ) {
      console.warn(`${vtt} | Unable to load requested localization file ${src}`);
      return {};
    }
    return resp.json().then(json => {
      console.log(`${vtt} | Loaded localization file ${src}`);
      return json;
    }).catch(err => {
      console.error(`Unable to parse localization file ${src}: ${err}`);
      return {};
    });
  }

	/* -------------------------------------------- */

  /**
   * Set a language as the active translation source for the session
   * @param {String} lang       A language string in CONFIG.supportedLanguages
   * @return {Promise}          A Promise which resolves once the translations for the requested language are ready
   */
  async setLanguage(lang) {
    if ( !Object.keys(CONFIG.supportedLanguages).includes(lang) ) {
      throw new Error(`Cannot set language ${lang}, as it is not in the supported set`);
    }
    this.lang = lang;
    this.translations = await this._getTranslations()
  }

	/* -------------------------------------------- */

  /**
   * Localize a string by drawing a translation from the available translations dictionary, if available
   * If a translation is not available, the original string is returned
   * @param {String} stringId     The string ID to translate
   * @return {String}             The translated string
   */
  localize(stringId) {
    return getProperty(this.translations, stringId) || stringId;
  }
}


// Register Handlebars Extensions
HandlebarsIntl.registerWith(Handlebars);

// Global template cache
_templateCache = {};


/**
 * Get a template from the server by submitting a socket request and caching the result 
 *
 * @param {String} path         The file path to the target HTML template
 */
function getTemplate(path) {
  return new Promise(function (resolve, reject) {
    if (path in _templateCache) {
      resolve(_templateCache[path]);
      return;
    }

    // Get the template from the server
    game.socket.emit('template', path, resp => {
      compiled = Handlebars.compile(resp.html);
      Handlebars.registerPartial(path, compiled);
      _templateCache[path] = compiled;
      console.log(`Foundry VTT | Pushed compiled template ${path} to cache.`);
      resolve(compiled);
    });
  });
}


/* -------------------------------------------- */

/**
 * Load and cache a set of templates by providing an Array of paths
 * @param {Array} paths
 * @return {Promise}
 */
async function loadTemplates(paths) {
  for ( let p of paths ) {
    await getTemplate(p);
  }
}

/* -------------------------------------------- */


/**
 * Get and render a template using provided data and handle the returned HTML
 * Support asynchronous file template file loading with a client-side caching layer
 *
 * @param {String} path             The file path to the target HTML template
 * @param {Object} data             A data object against which to compile the template
 *
 * @return {Promise.<HTMLElement>}  Returns the rendered HTML
 */
function renderTemplate(path, data) {
  return getTemplate(path).then(template => {
    return template(data || {});
  });
}


/* -------------------------------------------- */


/**
 * A Handlebars helper to set an <option> within a <select> block as selected based on its value
 */
Handlebars.registerHelper('select', function (selected, options) {
  let rx = new RegExp(' value=\"' + selected + '\"');
  let html = options.fn(this);
  return html.replace(rx, "$& selected");
});


/* -------------------------------------------- */


Handlebars.registerHelper('checked', function(value, options) {
  return Boolean(value) ? "checked" : "";
});


/* -------------------------------------------- */

/**
 * An Handlebars helper to format numbers
 */
Handlebars.registerHelper('numberFormat', function (value, options) {

  // Helper parameters
  let dec = (options.hash['decimals'] !== undefined) ? options.hash['decimals'] : 0,
     sign = options.hash['sign'] || false;

  // Parse to float
  value = parseFloat(value).toFixed(dec);

  // Attach sign
  if (sign ) {
    return ( value >= 0 ) ? "+"+value : value;
  } else {
    return value;
  }
});


/* -------------------------------------------- */

Handlebars.registerHelper('timeSince', function(value, options) {
  return timeSince(value);
});

/* -------------------------------------------- */


/**
 * Render a file-picker button linked to an <input> field
 */
Handlebars.registerHelper('filePicker', function(options) {
  let type = options.hash['type'],
      target = options.hash['target'];
  if ( !target ) throw new Error("You must define the name of the target field.");

  // Construct the HTML
  return new Handlebars.SafeString(`
  <button type="button" class="file-picker" data-type="${type}" data-target="${target}" title="Browse Files" tabindex="-1">
      <i class="fas fa-file-import fa-fw"></i>
  </button>`);
});


/* -------------------------------------------- */


/**
 * Render a MCE editor container with an optional toggle button
 */
Handlebars.registerHelper('editor', function(options) {
  let target = options.hash['target'],
      content = options.hash['content'] || "",
      button = Boolean(options.hash['button']),
      owner = Boolean(options.hash['owner']),
      editable = Boolean(options.hash['editable']);
  if ( !target ) throw new Error("You must define the name of a target field.");

  // Enrich the content
  content = enrichHTML(content, {secrets: owner, entities: true});

  // Construct the HTML
  let editor = $(`<div class="editor"><div class="editor-content" data-edit="${target}">${content}</div></div>`);

  // Append edit button
  if ( button && editable ) editor.append($('<a class="editor-edit"><i class="fas fa-edit"></i></a>'));
  return new Handlebars.SafeString(editor[0].outerHTML);
});



/* -------------------------------------------- */


Handlebars.registerHelper('localize', function(value, options) {
  return game.i18n.localize(value);
});

/* -------------------------------------------- */

/* Client Globals */
let socket,
  canvas,
  keyboard,
  game = {},
  ui = { windows: {} };

/**
 * The core Game instance which encapsulates the data, settings, and states relevant for managing the game experience.
 * The singleton instance of the Game class is available as the global variable ``game``.
 *
 * @param {Object} worldData    An object of all the World data vended by the server when the client first connects
 * @param {String} userId       The ID of the currently active user, retrieved from their session cookie
 * @param {Socket} socket       The open web-socket which should be used to transact game-state data
 */
class Game {
  constructor(worldData, userId, socket) {

    /**
     * The object of world data passed from the server
     * @type {Object}
     */
    this.data = worldData;

    /**
     * The id of the active game user
     * @type {String}
     */
    this.userId = userId;

    /**
     * A reference to the open Socket.io connection
     * @type {WebSocket}
     */
    this.socket = socket;

    /**
     * Client settings which are used to configure application behavior
     * @type {ClientSettings}
     */
    this.settings = new ClientSettings(this.data.settings || []);

    /**
     * Localization support
     * @type {Localization}
     */
    this.i18n = new Localization();

    /**
     * Whether the Game is running in debug mode
     * @type {Boolean}
     */
    this.debug = false;
  }

  /* -------------------------------------------- */

  /**
   * Fetch World data and return a Game instance
   * @return {Promise<Game>}
   */
  static async create() {

    // Connect to the game socket
    const socket = io.connect(window.location.origin, {
      'reconnection': true,
      'reconnectionDelay': 1000,
      'reconnectionAttempts': 3,
      'reconnectionDelayMax': 5000
    });

    // Get the session user
    const cookies = Game.getCookies(),
          userId = cookies.user;
    console.log(`${vtt} | Connected to socket as User ${userId}`);

    // Fetch World data and return a Game instance
    return new Promise((resolve, reject) => {
      socket.emit('world', worldData => {
        const game = new Game(worldData || {}, userId, socket);
        resolve(game);
      });
    });
  }

  /* -------------------------------------------- */

  /**
   * Initialize the Game for the current window location
   */
  async initialize() {
    console.log(`${vtt} | Initializing session`);

    // Call pre-setup hooks
    Hooks.callAll('init');

    // Begin loading fonts
    loadFont("Signika");
    loadFont("FontAwesome");

    // Register game settings
    this.registerSettings();

    // Load localization data
    await this.i18n.setLanguage(game.settings.get("core", "language"));

    // Activate event listeners
    this.activateListeners();

    // Initialize client view
    const url = window.location.pathname;
    if (url.startsWith("/game")) return this._initializeGame();
    else if (url.startsWith("/setup")) return this._initializeSetup();
    else if (url.startsWith("/stream")) return this._initializeStream();
    else if (url.startsWith("/players")) return this._initializePlayers();
    else if (url.startsWith("/update")) return this._initializeUpdate();
  }

  /* -------------------------------------------- */
  /*  Primary Game Initialization
  /* -------------------------------------------- */

  /**
   * Fully set up the game state, initializing Entities, UI applications, and the Canvas
   */
  async setupGame() {

    // Create Audio Helper
    this.audio = new AudioHelper();

    // Initialization Steps
    this.initializeEntities();
    await this.initializePacks();
    this.initializeUI();
    await this.initializeCanvas();
    this.initializeKeyboard();
    this.openSockets();

    // If the player is not a GM and does not have an impersonated character, prompt for selection
    if (!this.user.isGM && !this.user.character) {
      new PlayerConfig(this.user).render(true);
    }

    // Await the first user gesture to begin audio playback
    this.audio._awaitFirstGesture();

    // Call all game ready hooks
    Hooks.callAll('ready');
  }

  /* -------------------------------------------- */

  /**
   * Initialize game state data by creating Collections for all Entity types
   */
  initializeEntities() {
    this.users = new Users(this.data.users);
    this.messages = new Messages(this.data.messages);
    this.scenes = new Scenes(this.data.scenes);
    this.actors = new Actors(this.data.actors);
    this.items = new Items(this.data.items);
    this.journal = new Journal(this.data.journal);
    this.playlists = new Playlists(this.data.playlists);
    this.combats = new CombatEncounters(this.data.combat);
    this.folders = new Folders(this.data.folders);
  }

  /* -------------------------------------------- */

  /**
   * Initialization actions for compendium packs
   */
  async initializePacks() {
    const visibility = await game.settings.get("core", "compendiumVisibility");
    this.packs = this.data.packs.map(metadata => {
      const pack = new Compendium(metadata);
      if ( visibility[pack.collection] === false ) pack.public = false;
      return pack;
    });
  }

  /* -------------------------------------------- */

  /**
   * Initialize core UI elements
   */
  initializeUI() {
    ui.nav = new SceneNavigation().render();
    ui.controls = new SceneControls();
    ui.notifications = new Notifications().render();
    ui.sidebar = new Sidebar().render();
    ui.players = new PlayerList().render();
    ui.pause = new Pause().render();
    ui.menu = new MainMenu();
  }

  /* -------------------------------------------- */

  /**
   * Initialize the game Canvas
   */
  async initializeCanvas() {
    if (document.getElementById("board")) {
      canvas = new Canvas();
      await canvas.draw();
    }
  }

  /* -------------------------------------------- */

  /**
   * Initialize Keyboard and Mouse controls
   */
  initializeKeyboard() {
    keyboard = new KeyboardManager();
  }

  /* -------------------------------------------- */

  /**
   * Register core game settings
   */
  registerSettings() {

    // Language preference
    game.settings.register("core", "language", {
      name: "SETTINGS.LangN",
      hint: "SETTINGS.LangL",
      scope: "client",
      config: true,
      default: "en",
      type: String,
      choices: CONFIG.supportedLanguages,
      onChange: lang => window.location.reload()
    });

    // Register module configuration settings
    game.settings.register("core", ModuleManagement.CONFIG_SETTING, {
      name: "Module Configuration Settings",
      scope: "world",
      config: false,
      default: {},
      type: Object,
      onChange: settings => {
        console.log(settings);
      }
    });

    // Register compendium visibility setting
    game.settings.register("core", "compendiumVisibility", {
      name: "Compendium Visibility Controls",
      scope: "world",
      config: false,
      default: {},
      type: Object,
      onChange: enabled => {
        game.packs.forEach(p => p.public = enabled.hasOwnProperty(p.collection) ? enabled[p.collection] : true);
        ui.compendium.render();
      }
    });

    // Allow Trusted player uploads
    game.settings.register("core", "allowTrustedUpload", {
      name: "SETTINGS.TrustUpN",
      hint: "SETTINGS.TrustUpL",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });

    // Combat Tracker Configuration
    game.settings.register("core", Combat.CONFIG_SETTING, {
      name: "Combat Tracker Configuration",
      scope: "world",
      config: false,
      default: {},
      type: Object,
      onChange: () => {
        if (game.combat) {
          game.combat.setupTurns();
          game.combats.render();
        }
      }
    });

    // Entity Sheet Class Configuration
    game.settings.register("core", "sheetClasses", {
      name: "Sheet Class Configuration",
      scope: "world",
      config: false,
      default: {},
      type: Object,
      onChange: setting => game.actors._updateDefaultSheets(setting)
    });

    // Register game settings which modify behavior of the walls layer
    game.settings.register("core", "playerDoors", {
      name: "SETTINGS.PDoorN",
      hint: "SETTINGS.PDoorL",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });

    // Are Chat Bubbles Enabled?
    game.settings.register("core", "chatBubbles", {
      name: "SETTINGS.CBubN",
      hint: "SETTINGS.CBubL",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });

    // Register game settings which configure Message behavior
    game.settings.register("core", "secretMessages", {
      name: "SETTINGS.SMesgN",
      hint: "SETTINGS.SMesgL",
      scope: "world",
      config: true,
      default: true,
      type: Boolean,
      onChange: enabled => ui.chat.postAll()
    });

    // Soft Shadows
    game.settings.register("core", "softShadows", {
      name: "SETTINGS.SoftSN",
      hint: "SETTINGS.SoftSL",
      config: true,
      default: true,
      type: Boolean,
      onChange: enabled => {
        if ( canvas.sight ) canvas.sight._onChangeSoftShadows(enabled);
      }
    });

    // Show Player Cursors
    game.settings.register("core", "showCursors", {
      name: "SETTINGS.CursorN",
      hint: "SETTINGS.CursorL",
      scope: "world",
      config: true,
      default: true,
      type: Boolean,
      onChange: enabled => {
        if ( canvas.controls ) canvas.controls._onChangeCursorSetting(enabled);
      }
    });
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * The currently connected User
   * @type {User}
   */
  get user() {
    return this.users ? this.users.get(this.userId) : null;
  }

  /* -------------------------------------------- */

  /**
   * Metadata regarding the current game World
   * @type {Object}
   */
  get world() {
    return this.data.world;
  }

  /* -------------------------------------------- */

  /**
   * Metadata regarding the game System which powers this World
   * @type {Object}
   */
  get system() {
    return this.data.system;
  }

  /* -------------------------------------------- */

  /**
   * An Array of metadata for each Module which is active within this game World
   * @type {Array<Object>}
   */
  get modules() {
    return this.data.modules;
  }

  /* -------------------------------------------- */

  /**
   * A convenience accessor for the currently active Combat encounter
   * @type {Combat}
   */
  get combat() {
    return this.combats.active;
  }

  /* -------------------------------------------- */

  /**
   * A state variable which tracks whether or not the game session is currently paused
   * @type {Boolean}
   */
  get paused() {
    return this.data.paused;
  }

  /* -------------------------------------------- */

  /**
   * A convenient reference to the currently active canvas tool
   * @type {String}
   */
  get activeTool() {
    return ui.controls.activeTool;
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /**
   * Toggle the pause state of the game
   * Trigger the `pauseGame` Hook when the paused state changes
   * @param {Boolean} pause     The new pause state
   * @param {Boolean} [push]    Push the pause state change to other connected clients?
   */
  togglePause(pause, push = false) {
    this.data.paused = pause || !this.data.paused;
    if (push && game.user.isGM) game.socket.emit("pause", this.data.paused);

    // Render the paused UI
    ui.pause.render();

    // Call API hooks
    Hooks.callAll("pauseGame", this.data.paused);
  }

  /* -------------------------------------------- */
  /*  Cookie Management                           */
  /* -------------------------------------------- */

  static getCookies() {
    const cookies = {};
    for (let cookie of document.cookie.split('; ')) {
      let [name, value] = cookie.split("=");
      cookies[name] = decodeURIComponent(value);
    }
    return cookies;
  }

  /* -------------------------------------------- */

  static clearCookies() {
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    return true;
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers               */
  /* -------------------------------------------- */

  /**
   * Open socket listeners which transact game state data
   */
  openSockets() {
    AudioHelper.socketListeners(this.socket);
    Game.socketListeners(this.socket);
    Users.socketListeners(this.socket);
    Scenes.socketListeners(this.socket);
    Actors.socketListeners(this.socket);
    Items.socketListeners(this.socket);
    Journal.socketListeners(this.socket);
    Playlists.socketListeners(this.socket);
    CombatEncounters.socketListeners(this.socket);
    Messages.socketListeners(this.socket);
    Folders.socketListeners(this.socket);
    ClientSettings.socketListeners(this.socket);
    ControlsLayer.socketListeners(this.socket);
  }

  /* -------------------------------------------- */

  /**
   * General game-state socket listeners and event handlers
   * @param socket
   */
  static socketListeners(socket) {

    // Disconnection and reconnection attempts
    socket.on('disconnect', (reason) => {
      ui.notifications.error("You have lost connection to the server, attempting to re-establish.");
    });

    // Reconnect failed
    socket.on('reconnect_failed', () => {
      ui.notifications.error("Server connection lost.");
      window.location.href = "/no";
    });

    // Reconnect succeeded
    socket.on('reconnect', (attemptNumber) => {
      ui.notifications.info("Server connection re-established.");
    });

    // Handle pause
    socket.on('pause', pause => {
      game.togglePause(pause, false);
    });
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Activate Event Listeners which apply to every Game View
   */
  activateListeners() {

    // Disable touch zoom
    document.addEventListener("touchmove", ev => {
      if (ev.scale !== 1) ev.preventDefault();
    });

    // Disable right-click
    document.addEventListener("contextmenu", ev => ev.preventDefault());

    // Disable mouse 3, 4, and 5
    document.addEventListener("mousedown", ev =>  {
      if ([3, 4, 5].includes(ev.button)) ev.preventDefault();
    });

    // Handle window resizing
    window.addEventListener("resize", event => this._onResize(event));

    // Entity links
    $("body").on("click", "a.entity-link", this._onEntityLink);
  }

  /* -------------------------------------------- */

  /**
   * Handle resizing of the game window
   * Reposition any active UI windows
   * @private
   */
  _onResize(event) {
    Object.values(ui.windows).forEach(app => app.setPosition());
    if (canvas && canvas.ready) canvas._onResize(event)
  }

  /* -------------------------------------------- */

  /**
   * Handle Entity Links
   * @param event
   * @private
   */
  _onEntityLink(event) {
    let a = event.currentTarget,
      cls = CONFIG[a.getAttribute("data-entity")].entityClass,
      ent = cls.collection.get(a.getAttribute("data-id"));

    // Render the application
    if (ent.entity === "Scene") ent.notes.render(true);
    else ent.sheet.render(true);
  }

  /* -------------------------------------------- */
  /*  Game Initialization Functions
  /* -------------------------------------------- */

  /**
   * Initialization steps for the primary Game view
   * @private
   */
  async _initializeGame() {

    // Require a valid user cookie
    if (!this.userId) {
      let err = "Something went wrong with your user cookie, please reload your session.";
      $('body').html($(`<div class="banner error">${err}</div>`));
      throw new Error(err);
    }

    // Setup the game
    this.setupGame();

    // Set a timeout of 10 minutes before kicking the user off
    setTimeout(() => {
      if (this.user.isGM || !this.data.demo) return;
      console.log(`${vtt} | Ending demo session after 10 minutes. Thanks for testing!`);
      this.socket.disconnect();
      Game.clearCookies();
      window.location = window.location.origin + "/join";
    }, 1000 * 60 * 10);

    // Context menu listeners
    ContextMenu.eventListeners();

    // Force hyperlinks to a separate window/tab
    $(document).on('click', 'a[href]', ev => {
      if ( ev.target.href === "javascript:void(0)" ) return;
      ev.preventDefault();
      window.open(ev.target.href, "_blank");
    });
  };

  /* -------------------------------------------- */

  /**
   * Initialization steps for the game setup view
   * @private
   */
  async _initializeSetup() {

    // Load World Data
    const setupData = await WorldManagement.getSetupData();

    // Render Applications
    ui.notifications = new Notifications().render();
    if (!signedEULA) new EULA().render(true);
    ui.worlds = new WorldManagement(setupData.worlds, setupData.systems, CURRENT_WORLD).render(true);
  };

  /* -------------------------------------------- */

  /**
   * Initialization steps for the Stream helper view
   * @private
   */
  async _initializeStream() {
    this.users = new Users(this.data.users);
    this.messages = new Messages(this.data.messages);
    this.actors = new Actors(this.data.actors);
    ui.chat = new ChatLog({stream: true}).render();
    Messages.socketListeners(this.socket);
  }

  /* -------------------------------------------- */

  /**
   * Initialize the Player Management View
   * @private
   */
  async _initializePlayers() {
    this.users = new Users(this.data.users);
    this.players = new UserManagement(this.users);
    this.players.render(true);
  };

  /* -------------------------------------------- */

  /**
   * Initialization steps for the game setup view
   * @private
   */
  async _initializeUpdate() {

    // Require a valid user cookie
    if (this.world && !this.userId) {
      let err = "Something went wrong with your user cookie, please reload your session.";
      $('body').html($(`<div class="banner error">${err}</div>`));
      throw new Error(err);
    }

    let socket = io.connect(window.location.origin);
    let updater = new Updater();
    game = {socket: socket, updater: updater};
    updater.render(true);
    Updater.socketListeners(socket);
  };
}

/* -------------------------------------------- */

/**
 * Create and initialize the Game
 */
(async function() {
  game = await Game.create();
  game.initialize();
})();

/**
 * The base Die class.
 *
 * Each Die instance represents a distinct term in a roll equation which transacts rolls of an die with some number
 * of faces. The Die instance provides controls for rerolling, exploding, counting, or modifying the set of results
 * from the Die.
 *
 * @param {Number} faces    The number of faces for this Die
 *
 * @example
 * // Define a 6-sided die
 * let die = new Die(6);
 *
 * // Roll the die 4 times
 * die.roll(4);
 *
 * // Roll another 2 times, adding the new results to the existing set
 * die.roll(2);
 *
 * // For all 6 of the initial rolls, reroll if any result was a 1
 * die.reroll([1]);
 *
 * // For set of remaining results, roll a bonus die if any result was a 6
 * die.explode([6]);
 *
 * // Count the total number of rolls which was greater than 3
 * die.countSuccess(3, ">");
 *
 * // Display the total number of successes
 * console.log(die.total);
 */
class Die {
  constructor(faces, options={}) {

    /**
     * The number of faces for this Die
     * @type {Number}
     *
     * @example
     * let die = new Die(6);    // A 6-sided die has six faces
     * console.log(die.faces)   // 6
     */
    this.faces = this._getFaces(faces);

    /**
     * An Array representing the faces of the die
     * @type {Array}
      *
     * @example
     * let die = new Die(6);    // One side for each of the possible faces
     * console.log(die.sides)   // [1,2,3,4,5,6]
     */
    this.sides = (faces instanceof Array) ?
      faces.map(s => parseInt(s)) :
      Array.from(new Array(parseInt(faces))).map((e, i) => i+1);

    /**
     * Track all dice which have ever been rolled
     * @type {Array}
     *
     * @example
     * let die = new Die(4);
     * die.roll(4);             // Roll 4d4
     * console.log(die.rolls);  // [{...}, {...}, {...}, {...}]
     */
    this.rolls = [];

    /**
     * Any additional options which may be required by the Die
     */
    this.options = options;
  }

  /* -------------------------------------------- */

  /**
   * Track the set of kept results out of all rolls
   * @type {Array}
   *
   * @example
   * let die = new Die(6);
   * die.roll(6);               // Roll 6d6
   * console.log(die.results);  // [6,4,1,2,3,4]
   * die.keepHighest(2);        // Keep the 2 best results
   * console.log(die.results);  // [6,4]
   */
  get results() {
    return this.rolls.filter(r => !r.rerolled && !r.discarded).map(r => {
      if ( r.success === true ) return 1;
      else if ( r.success === false ) return 0;
      return r.roll;
    });
  }

  /* -------------------------------------------- */

  /**
   * The sum of all kept results
   * @type {Number}
   *
   * @example
   * let die = new Die(20);
   * die.roll(2);               // Roll 2d20
   * console.log(die.results)   // [6,17]
   * console.log(die.total)     // 23
   */
  get total() {
    const total = this.results.reduce((t, n) => t + n);
    if ( this.options.marginSuccess ) return total - parseInt(this.options.marginSuccess);
    else if ( this.options.marginFailure ) return parseInt(this.options.marginFailure) - total;
    return total;
  }

  /* -------------------------------------------- */

  _getFaces(f) {
    if ( Number.isFinite(f) && f > 0 ) return f;
    else throw new Error(`Invalid number of faces ${f} for Die class`);
  }

  /* -------------------------------------------- */

  /**
   * Roll this Die once
   * @return {Number}
   * @private
   */
  _roll() {
    let res = Math.floor(twist.random() * this.sides.length);
    return {
      roll: this.sides[res]
    };
  }

  /* -------------------------------------------- */

  /**
   * Roll the initial set of results for the Die
   * @param {Number} nd     The number of times to roll the die
   * @return {Die}          The updated die containing new rolls
   *
   * @example
   * let die = new Die(6);
   * die.roll(6);               // Roll 6d6
   * console.log(die.results);  // [5,2,4,4,1,6]
   * console.log(die.total);    // 22
   */
  roll(nd) {
    nd = nd || 1;
    let rolls = [];
    for (let n=1; n <= nd; n++) {
      rolls.push(this._roll());
    }
    this.rolls = this.rolls.concat(rolls);
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Re-roll any results with results in the provided target set
   * Dice which have already been re-rolled will not be re-rolled again
   * @param {Array} targets       Target results which would trigger a reroll
   * @return {Die}                The updated die containing new rolls
   *
   * @example
   * let die = new Die(4);
   * die.roll(3);               // Roll 3d4
   * console.log(die.results);  // [1,3,4]
   * die.reroll([1,2]);         // Re-roll 1s or 2s
   * console.log(die.results);  // [3,4,2]
   */
  reroll(targets) {
    if ( !targets || !targets.length ) return this.rolls;

    // Flag dice which are eligible for re-roll
    let eligible = this.rolls.filter(r => {
      if ( r.rerolled || r.discarded ) return false;
      else if ( targets.includes(r.roll) ) return r.rerolled = true;
      return false;
    });

    // Roll any eligible dice
    let rolls = eligible.map(r => this._roll());
    this.rolls = this.rolls.concat(rolls);
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Explode the rolls in this set by rolling additional dice for each roll which achieved a certain result
   * Dice which have been re-rolled or have already exploded cannot explode
   * @param {Array} range         The range of target results which would trigger an explode
   * @return {Die}                The updated die containing new rolls
   *
   * @example
   * let die = new Die(8);
   * die.roll(6);               // Roll 6d8
   * console.log(die.results);  // [8,3,6,4,2,7]
   * die.explode([7,8]);        // Explode on 7s and 8s, rolling additional dice
   * console.log(die.results);  // [8,3,6,4,2,7,7,2,3]
   */
  explode(range) {
    if ( !range || !range.length || (range.length === this.faces) ) return this;

    // Explode until there are no valid results left to explode
    let exploding = true,
        rolls = this.rolls;
    while ( exploding ) {

      // Get the dice which are eligible to explode
      let eligible = rolls.filter((r, i) => {
        if (r.rerolled || r.discarded || r.exploded) return false;
        if (range.includes(r.roll)) return r.exploded = true;
        return false;
      });

      // Roll any eligible dice
      rolls = eligible.map(r => this._roll());
      exploding = rolls.length > 0;
      this.rolls = this.rolls.concat(rolls);
    }
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Filter the result set, keeping the highest n results in order
   * @param {Number} n    The number of results to keep
   * @return {Die}        The updated die containing new rolls
   *
   * @example
   * let die = new Die(6);
   * die.roll(4);               // Roll 4d6
   * console.log(die.results);  // [6,2,1,5]
   * die.keepHighest(2);        // Keep the best 2 results
   * console.log(die.results);  // [6,5]
   */
  keepHighest(n) {
    let cut = this.results.sort((a, b) => b - a)[n - 1],
        kept = 0;
    let rolls = this.rolls.filter(r => !r.rerolled && !r.discarded);

    // First drop any results that are strictly lower than the cut
    rolls.forEach(r => {
      if ( r.roll > cut ) ++kept;
      else if ( r.roll < cut ) r.discarded = true;
    });

    // Next keep ties until we have reached the target
    rolls.filter(r => r.roll === cut).forEach(r => {
      if ( kept < n ) ++kept;
      else r.discarded = true;
    });
    return this
  }

  /* -------------------------------------------- */

  /**
   * Filter the result set, keeping the lowest n results in order
   * @param {Number} n    The number of results to keep
   * @return {Array}      The filtered results
   *
   * @example
   * let die = new Die(6);
   * die.roll(4);               // Roll 4d6
   * console.log(die.results);  // [6,2,1,5]
   * die.keepLowest(3);         // Kepe the lowest 3 results
   * console.log(die.results);  // [2,1,5]
   */
  keepLowest(n) {
    let cut = this.results.sort((a, b) => a - b)[n - 1],
        kept = 0;
    let rolls = this.rolls.filter(r => !r.rerolled && !r.discarded);

    // First drop any results that are strictly higher than the cut
    rolls.forEach(r => {
      if ( r.roll < cut ) ++kept;
      else if ( r.roll > cut ) r.discarded = true;
    });

    // Next keep ties until we have reached the target
    rolls.filter(r => r.roll === cut).forEach(r => {
      if ( kept < n ) ++kept;
      else r.discarded = true;
    });
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Map results to 0 or 1 depending on whether they match a success condition
   * @param {Number} target     The target result to test against
   * @param {String} operator   The comparison operator against which to test. Default is '>='
   *
   * @example
   * let die = new Die(3);
   * die.roll(6);               // Roll 6d3
   * console.log(die.results);  // [1,3,1,2,2,3]
   * die.countSuccess(3);       // Count the results where a 3 was rolled
   * console.log(die.results);  // [0,1,0,0,0,1]
   * console.log(die.total);    // 2
   */
  countSuccess(target, operator) {
    operator = operator || ">=";
    this.rolls.forEach(r => {
      if ( r.rerolled || r.discarded ) return;
      if ( (operator === '>=') && Number(r.roll >= target)) r.success = true;
      else if ( (operator === '>') && Number(r.roll > target)) r.success = true;
      else if ( (operator === '=') && Number(r.roll === target)) r.success = true;
      else if ( (operator === '<') && Number(r.roll < target)) r.success = true;
      else if ( (operator === '<=') && Number(r.roll <= target)) r.success = true;
      else r.success = false;
    });
  }

  /* -------------------------------------------- */

  /**
   * Special Die types may optionally define a tooltip used in lieu of the numeric result
   * @param {Number} result   The rolled die result
   * @private
   */
  _getTooltip(result) {
    return result;
  }
}

/**
 * A special die used by Fate/Fudge systems
 * Mathematically behaves like 1d3-2
 * @type {Die}
 */
class FateDie extends Die {
  constructor() {
    super(3);
    this.sides = [-1, 0, 1];
  }

  /* -------------------------------------------- */

  /**
   * Special Die types may optionally define a tooltip used in lieu of the numeric result
   * @param {Number} result   The rolled die result
   * @private
   */
  _getTooltip(result) {
    return {
      "-1": "-",
      "0": "&nbsp;",
      "1": "+"
    }[result];
  }
}

/**
 * This class provides an interface and API for conducting dice rolls.
 * The basic structure for a dice roll is a string formula and an object of data against which to parse it.
 *
 * @param formula {String}    The string formula to parse
 * @param data {Object}       The data object against which to parse attributes within the formula
 *
 * @example
 * // Attack with advantage!
 * let r = new Roll("2d20kh + @prof + @strMod", {prof: 2, strMod: 4});
 *
 * // The parsed components of the roll formula
 * console.log(r.parts);    // [Die, +, 2, +, 4]
 * 
 * // Execute the roll
 * r.roll();
 *
 * // The resulting equation after it was rolled
 * console.log(r.result);   // 16 + 2 + 4
 *
 * // The total resulting from the roll
 * console.log(r.total);    // 22
 */
class Roll {
  constructor(formula, data) {

    /**
     * The original provided formula
     * This formula will be reinterpreted once components have been parsed
     * @type {String}
     */
    this._formula = formula;

    /**
     * The original provided data
     * @type {Object}
     */
    this.data = data;

    /**
     * An array of parsed formula terms
     * @type {Array}
     */
    this.terms = [];

    /**
     * An array of evaluate Roll parts
     * @type {Array}
     */
    this.parts = [];

    /**
     * An internal flag for whether the Roll object has been rolled
     * @private
     */
    this._rolled = false;

    /**
     * Cache the rolled total to avoid re-evaluating it multiple times
     */
    this._result = null;

    /**
     * Regular expression patterns
     */
    this.rgx = {
      reroll: /r(<=|>=|<|>)?([0-9]+)?/,
      explode: /x(<=|>=|<|>)?([0-9]+)?/,
      keep: /(kh|kl|dh|dl)([0-9]+)?/,
      success: /(cs|cf|ms)(<=?|>=?|=)?([0-9]+)?/
    };

    // Initialize the roll
    this._init(this._formula);
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * Express the Roll as a formatted string formula
   * @return {String}
   */
  get formula() {
    if ( !this._rolled ) return this._formula;
    return this.parts.map(p => p instanceof Die ? p.formula : p).join(" ");
  }

  /**
   * The resulting arithmetic expression after rolls have been evaluated
   * @return {String}
   */
  get result() {
    return this._result;
  }

  /**
   * Express the total result of the roll
   * @return {Number}
   */
  get total() {
    if ( !this._rolled ) return null;
    let total = eval(this.result);
    return Number.isInteger(total) ? total : Math.round(total * 100) / 100;
  }

  /**
   * Get an Array of any :class:`Die` objects which were rolled as part of the evaluation of this roll
   * @type {Array}
   */
  get dice() {
    return this.parts.filter(p => p instanceof Die);
  }

  /**
   * The regular expression used to identify a Die component of a Roll
   * @private
   * @type {String}
   */
  static get diceRgx() {
    return '([0-9]+)?[dD]([0-9fF]+)([a-z][a-z0-9<=>]+)?';
  }

  /**
   * Record supported arithmetic operators for Roll instances
   * @private
   * @type {Array.<String>}
   */
  static get arithmeticOperators() {
    return ["+", "-", "*", "/"];
  }

  /* -------------------------------------------- */
  /*  Initialization                              */
  /* -------------------------------------------- */

  /**
   * Initialize the roll object using a provided formula
   * @param formula {String}    The roll formula
   * @private
   */
  _init(formula) {

    // Step 1 - Substitute provided data
    formula = this._replaceData(formula);

    // Step 2 - Parse the substituted formula into parts
    this.terms = this._getTerms(formula);
  }

  /* -------------------------------------------- */

  /**
   * Replace referenced data attributes in the roll formula with the syntax `@attr` with the corresponding key from
   * the provided `data` object.
   * @param {String} formula    The original formula within which to replace
   * @private
   */
  _replaceData(formula) {
    let dataRgx = new RegExp(/@([a-z.0-9]+)/g);
    return formula.replace(dataRgx, (match, term) => {
      let value = getProperty(this.data, term);
      return value ? String(value).trim() : "0";
    });
  }

  /* -------------------------------------------- */

  /**
   * Parse a string formula, extracting arithmetic operators and enforcing standardized spacing
   * Return the terms of the formula as an Array
   * @private
   */
  _getTerms(formula) {
    let arith = this.constructor.arithmeticOperators,
        math = arith.concat(["(", ")"]),
        split = new RegExp(math.map(t => "\\" + t).join("|"), "g"),
        terms = formula.replace(split, t => `;${t};`).split(";");
    return terms.map(t => t.trim()).filter(t => t !== "").filter((t, i, arr) => {
      return !((t === "+") && (arr[i-1] === "+"))
    });
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /**
   * Execute the Roll, replacing dice and evaluating the total result
   * @returns {Roll}    The rolled Roll object, able to be chained into other methods
   *
   * @example
   * let r = new Roll("2d6 + 4 + 1d4");
   * r.roll();
   * > 12
   */
  roll() {
    if ( this._rolled ) throw new Error("This Roll object has already been rolled.");
    this.parts = this._replaceDice(this.terms);

    // Evaluate the result to make sure it is safe
    let result = this.parts.map(p => p instanceof Die ? p.total : p).join(" ");
    this._result = this._validateResult(result);

    // Denote that the roll has been evaluated
    this._rolled = true;
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Create a new Roll object using the original provided formula and data
   * Each roll is immutable, so this method returns a new Roll instance using the same data.
   * @returns {Roll}    A new Roll object, rolled using the same formula and data
   */
  reroll() {
    let r = new this.constructor(this._formula, this.data);
    return r.roll();
  }

  /* -------------------------------------------- */

  /**
   * Replace terms within a formula group which match a dice roll syntax with a :class:`Die` instance
   * Basic syntax is {n}d{X}{mods}
   * @private
   */
  _replaceDice(terms) {
    return terms.map((term, i) => {

      // Recursively delegate inner groups
      if (term instanceof Array) {
        return this._replaceDice(term);
      }

      // Check for match
      let rgx = term.match(new RegExp(this.constructor.diceRgx));
      if (!rgx) return term;

      // Get die sides
      let sides = rgx[2],
          cls = Die;
      if ( /[f|F]/.test(sides) ) cls = FateDie;
      else {
        sides = parseInt(sides);
        if (sides > 10000) throw new Error("You may not roll dice with more than 10000 sides");
      }

      // Get dice number and sides
      let number = parseInt(rgx[1] || 1);
      if ( !Number.isFinite(number) || number <= 0 ) throw new Error("Invalid number of rolled dice.");
      else if ( number > 100 ) throw new Error("You may not roll more than 100 dice at a time");

      // Determine which roll options are requested
      let options = this._parseOptions(rgx[3]);

      // Create the Die and roll it
      let die = new cls(sides);
      die.roll(number);

      // Apply any modifiers
      for ( let option of options ) {
        this._rerollDie(die, option);
        this._explodeDie(die, option);
        this._keepDropDie(die, option);
        this._successDie(die, option);
      }

      // Replace the part with the Die
      die.formula = `${number}d${sides}${options.join("").toLowerCase()}`;
      return die;
    });
  }

  /* -------------------------------------------- */

  _validateResult(result) {
    const unsafeMath = /([a-zA-Z_{1}][a-zA-Z0-9_]+)(?=[\s+]?\()/g;
    let valid = true;
    result.replace(unsafeMath, fn => {
      if ( Math.hasOwnProperty(fn) ) return "Math."+fn;
      else valid = false;
    });
    if ( !valid ) throw new Error("Invalid arithmetic expression!");
    return result;
  }

  /* -------------------------------------------- */

  /**
   * Parse options and determine their order of operations
   * @param {String} query    The dice roll options query
   */
  _parseOptions(query) {
    if ( !query ) return [];
    for ( let p of Object.values(this.rgx) ) {
      query = query.replace(RegExp(p, "g"), match => match+";");
    }
    let options = query.split(';').filter(o => o !== "");
    return options;
  }

  /* -------------------------------------------- */

  /**
   * Reroll a single die by parsing the option string
   * @private
   */
  _rerollDie(die, option) {
    let rr = option.match(this.rgx.reroll);
    if ( !rr ) return;

    // Determine the reroll range
    let target, nrr = parseInt(rr[2] || 1);
    if ( rr[1] ) {
      if ( rr[1] === "<" )        target = Array.fromRange(nrr);
      else if ( rr[1] === "<=" )  target = Array.fromRange(nrr).map(n => n + 1);
      else if ( rr[1] === ">" )   target = Array.fromRange(die.faces - nrr).map(n => n + nrr + 1);
      else if ( rr[1] === ">=" )  target = Array.fromRange(die.faces - nrr + 1).map(n => n + nrr);
    }
    else target = [nrr];

    // Reroll the die
    die.reroll(target);
  }

  /* -------------------------------------------- */

  /**
   * Explode a single die by parsing the option string
   * @private
   */
  _explodeDie(die, option) {
    let ex = option.match(this.rgx.explode);
    if ( !ex ) return;
    let operator = ex[1];
    let target = parseInt(ex[2] || die.faces);

    // Define target arrays
    let range = die.sides.filter(s => {
      if ( operator === "<" ) return s < target;
      else if ( operator === "<=" ) return s <= target;
      else if ( operator === ">" ) return s > target;
      else if ( operator === ">=" ) return s >= target;
      return s === target;
    });

    // Explode the die
    die.explode(range);
  }

  /* -------------------------------------------- */

  /**
   * Keep or drop die by parsing the option string
   * @private
   */
  _keepDropDie(die, option) {
    let kd = option.match(this.rgx.keep);
    if ( !kd ) return;
    let nr = die.results.length,
        mode = kd[1],
        num = parseInt(kd[2] || 1);

    // Highest
    if ( ["kh", "dl"].includes(mode) ) {
      if ( mode === "dl" ) num = Math.max(nr - num, 1);
      die.keepHighest(num);
    }

    // Lowest
    else if ( ["kl", "dh"].includes(mode) ) {
      if ( mode === "dh" ) num = Math.min(nr - num);
      die.keepLowest(num);
    }
  }

  /* -------------------------------------------- */

  /**
   * Count successes or margin of success
   * @private
   */
  _successDie(die, option) {
    let cs = option.match(this.rgx.success);
    if ( !cs ) return;
    let mode = cs[1],
        operator = cs[2],
        target = parseInt(cs[3]);

    // Count successes or failures
    if ( ["cs", "cf"].includes(mode) ) {

      // Flip the operator for counting failures
      if (mode === "cf") {
        operator = {
          ">=": "<",
          ">": "<=",
          "<": ">=",
          "<=": ">"
        }[operator];
      }

      // Apply the die function
      die.countSuccess(target, operator);
    }

    // Margin of success or failure
    else if ( mode === "ms" ) {
      if ([">", ">=", "=", undefined].includes(operator) ) die.options["marginSuccess"] = target;
      else if (["<", "<="].includes(operator)) die.options["marginFailure"] = target;
    }
  }

  /* -------------------------------------------- */
  /*  HTML Rendering
  /* -------------------------------------------- */

  /**
   * Render a Roll instance to HTML
   * @param chatOptions {Object}      An object configuring the behavior of the resulting chat message.
   * @return {Promise.<HTMLElement>}  A Promise which resolves to the rendered HTML
   */
  async render(chatOptions) {
    chatOptions = mergeObject({
      user: game.user._id,
      flavor: null,
      template: CONFIG.Roll.template
    }, chatOptions || {});

    // Execute the roll, if needed
    if ( !this._rolled ) this.roll();

    // Construct chat data
    const chatData = {
      user: chatOptions.user,
      formula: this.formula,
      tooltip: await this.getTooltip(),
      total: this.total,
      flavor: chatOptions.flavor
    };

    // Render the requested chat template
    return renderTemplate(chatOptions.template, chatData);
  }

  /* -------------------------------------------- */

  /**
   * Render the tooltip HTML for a Roll instance
   * @return {Promise.<HTMLElement>}
   */
  getTooltip() {
    const data = {
      formula: this.formula,
      total: this.total
    };

    // Prepare dice parts
	  const dice = this.parts.filter(p => p instanceof Die);
	  data["parts"] = dice.map(d => {
	    let minRoll = Math.min(...d.sides),
          maxRoll = Math.max(...d.sides);

	    // Generate tooltip data
      return {
        formula: d.formula,
        total: d.total,
        faces: d.faces,
        rolls: d.rolls.map(r => {
          return {
            result: d._getTooltip(r.roll),
            classes: [
              "d"+d.faces,
              r.rerolled ? "rerolled" : null,
              r.exploded ? "exploded" : null,
              r.discarded ? "discarded": null,
              (r.roll === minRoll) ? "min" : null,
              (r.roll === maxRoll) ? "max" : null
            ].filter(c => c).join(" ")
          }
        })
      };
    });

	  // Render the tooltip template
    return renderTemplate(CONFIG.Roll.tooltip, data);
  }

  /* -------------------------------------------- */

  /**
   * Dispatch a Roll instance to a new ChatMessage entity
   * @param {Object} chatData           The data object to use when creating the message
   * @return {Promise.<ChatMessage>}    A promise which resolves to the created Chat Message
   */
  toMessage(chatData) {
    chatData = mergeObject({
      user: game.user._id,
      rollMode: game.settings.get("core", "rollMode"),
      sound: CONFIG.sounds.dice
    }, chatData || {});

    // Add the roll
    if ( !this._rolled ) this.roll();
    chatData.roll = this;

    // Handle type
    if ( ["gmroll", "blindroll"].includes(chatData.rollMode) ) {
      chatData["whisper"] = game.users.entities.filter(u => u.isGM).map(u => u._id);
      if ( chatData.rollMode === "blindroll" ) {
        chatData["blind"] = true;
        AudioHelper.play({src: chatData["sound"]});
      }
    }

    // Create the message
    return ChatMessage.create(chatData);
  }

  /* -------------------------------------------- */
  /*  Methods
  /* -------------------------------------------- */

  /**
   * Alter the Roll formula by adding or multiplying the number of dice included in each roll term
   *
   * @param add {Number}      A number of dice to add to each Die term
   * @param multiply {Number} A multiplier for the number of dice in each Die term
   *
   * @example
   * let r = new Roll("4d8 + 4 + 2d4");
   * r.alter(1, 2);
   * r.formula;
   * > 9d8 + 4 + 5d4
   */
  alter(add, multiply) {
    let rgx = new RegExp(Roll.diceRgx, 'g');
    let formula = this.formula.replace(rgx, (match, nd, d, mods) => {
      nd = (nd * parseInt(multiply || 1)) + parseInt(add || 0);
      mods = mods || "";
      return nd + "d" + d + mods;
    });
    this._init(formula);
    this._rolled = false;
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Acquire data object representing the most-likely current actor.
   * This data can be included in the invocation of a Roll instance for evaluating dynamic attributes.
   *
   * @return {Object}     An object of data representing the current Actor (if any)
   */
  static getActorData() {
    let data;

    // If the user is a GM - include the data for the currently selected token
    if ( game.user.isGM && canvas.ready ) {
      let ct = canvas.tokens.controlled;
      if ( ct.length  === 1 ) {
        let actor = canvas.tokens.controlled.shift().actor;
        data = duplicate(actor.data.data);
        data["name"] = actor.name;
      }
    }

    // Otherwise, if the user has an impersonated character, use their own character's data
    else if ( game.user.character ) {
      let actor = game.user.character;
      data = duplicate(actor.data.data);
      data["name"] = actor.name;
    }
    return data;
  }

  /* -------------------------------------------- */

  static simulate(formula, n) {
    let results = [...Array(n)].reduce((arr, v) => {
      let r = new Roll(formula);
      arr.push(r.roll().total);
      return arr;
    }, []);
    let mean = results.reduce((sum, v) => sum += v, 0) / results.length;
    console.log(`Rolled ${formula} ${n} times. Average result: ${mean}`);
    return results;
  }

  /* -------------------------------------------- */
  /*  Saving and Loading
  /* -------------------------------------------- */

  /**
   * Structure the Roll data as an object suitable for JSON stringification
   * @return {Object}     Structured data which can be serialized into JSON
   */
  toJSON() {

    // Structure roll parts
    const parts = this.parts.map(p => {
      if ( p instanceof Die ) {
        return {
          class: p.constructor.name,
          faces: p.faces,
          rolls: p.rolls,
          formula: p.formula,
          options: p.options
        };
      }
      else return p;
    });

    // Serialize roll equation
    return {
      class: this.constructor.name,
      formula: this.formula,
      parts: parts,
      total: this.total
    };
  }

  /* -------------------------------------------- */

  /**
   * Recreate a Roll instance using a provided JSON string
   * @param {String} json   Serialized JSON data representing the Roll
   * @return {Roll}         A revived Roll instance
   */
  static fromJSON(json) {
    const data = JSON.parse(json);
    if ( data.class !== "Roll" ) throw new Error("Unable to recreate Roll instance from provided data");

    // Create the instance
    let roll = new this(data.formula);

    // Update parts
    roll.parts = data.parts.map(p => {

      // Die rolls
      if (p instanceof Object && p.class) {
        let cls = CONFIG.diceTypes.find(d => d.name === p.class);
        if ( !cls ) throw new Error(`Unrecognized die type ${p.class}`);
        let d = new cls(p.faces, p.options);
        d.rolls = p.rolls;
        d.formula = p.formula;
        return d;
      }

      // String parts
      return p;
    });

    // Ensure we re-derived the correct total
    roll._result = roll.parts.map(p => p instanceof Die ? p.total : p).join(" ");
    roll._rolled = true;
    if ( roll.total !== data.total ) throw new Error("The result of the recombined Roll was inconsistent.");
    return roll;
  }
}


/* -------------------------------------------- */


CONFIG.Roll = {
  template: "templates/dice/roll.html",
  tooltip: "templates/dice/tooltip.html"
};

CONFIG.diceTypes = [Die, FateDie];



const MAX_INT = 4294967296.0,
    N = 624,
    M = 397,
    UPPER_MASK = 0x80000000,
    LOWER_MASK = 0x7fffffff,
    MATRIX_A = 0x9908b0df;

/**
 * A standalone, pure JavaScript implementation of the Mersenne Twister pseudo random number generator. Compatible
 * with Node.js, requirejs and browser environments. Packages are available for npm, Jam and Bower.
 *
 * @author Raphael Pigulla <pigulla@four66.com>
 * @license See the attached LICENSE file.
 * @version 0.2.3
 */
class MersenneTwister {

  /**
   * Instantiates a new Mersenne Twister.
   *
   * @constructor
   * @alias module:MersenneTwister
   * @since 0.1.0
   * @param {number=} seed The initial seed value.
   */
  constructor(seed) {
    if (typeof seed === 'undefined') {
      seed = new Date().getTime();
    }
    this.mt = new Array(N);
    this.mti = N + 1;
    this.seed(seed);
  };

  /**
   * Initializes the state vector by using one unsigned 32-bit integer "seed", which may be zero.
   *
   * @since 0.1.0
   * @param {number} seed The seed value.
   */
  seed(seed) {
    let s;

    this.mt[0] = seed >>> 0;

    for (this.mti = 1; this.mti < N; this.mti++) {
      s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
      this.mt[this.mti] =
        (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + this.mti;
      this.mt[this.mti] >>>= 0;
    }
  };

  /**
   * Initializes the state vector by using an array key[] of unsigned 32-bit integers of the specified length. If
   * length is smaller than 624, then each array of 32-bit integers gives distinct initial state vector. This is
   * useful if you want a larger seed space than 32-bit word.
   *
   * @since 0.1.0
   * @param {array} vector The seed vector.
   */
  seedArray(vector) {
    let i = 1,
      j = 0,
      k = N > vector.length ? N : vector.length,
      s;

    this.seed(19650218);

    for (; k > 0; k--) {
      s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);

      this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525))) +
        vector[j] + j;
      this.mt[i] >>>= 0;
      i++;
      j++;
      if (i >= N) {
        this.mt[0] = this.mt[N - 1];
        i = 1;
      }
      if (j >= vector.length) {
        j = 0;
      }
    }

    for (k = N - 1; k; k--) {
      s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] =
        (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941)) - i;
      this.mt[i] >>>= 0;
      i++;
      if (i >= N) {
        this.mt[0] = this.mt[N - 1];
        i = 1;
      }
    }

    this.mt[0] = 0x80000000;
  };

  /**
   * Generates a random unsigned 32-bit integer.
   *
   * @since 0.1.0
   * @returns {number}
   */
  int() {
    let y,
      kk,
      mag01 = new Array(0, MATRIX_A);

    if (this.mti >= N) {
      if (this.mti === N + 1) {
        this.seed(5489);
      }

      for (kk = 0; kk < N - M; kk++) {
        y = (this.mt[kk] & UPPER_MASK) | (this.mt[kk + 1] & LOWER_MASK);
        this.mt[kk] = this.mt[kk + M] ^ (y >>> 1) ^ mag01[y & 1];
      }

      for (; kk < N - 1; kk++) {
        y = (this.mt[kk] & UPPER_MASK) | (this.mt[kk + 1] & LOWER_MASK);
        this.mt[kk] = this.mt[kk + (M - N)] ^ (y >>> 1) ^ mag01[y & 1];
      }

      y = (this.mt[N - 1] & UPPER_MASK) | (this.mt[0] & LOWER_MASK);
      this.mt[N - 1] = this.mt[M - 1] ^ (y >>> 1) ^ mag01[y & 1];
      this.mti = 0;
    }

    y = this.mt[this.mti++];

    y ^= (y >>> 11);
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= (y >>> 18);

    return y >>> 0;
  };

  /**
   * Generates a random unsigned 31-bit integer.
   *
   * @since 0.1.0
   * @returns {number}
   */
  int31() {
    return this.int() >>> 1;
  };

  /**
   * Generates a random real in the interval [0;1] with 32-bit resolution.
   *
   * @since 0.1.0
   * @returns {number}
   */
  real() {
    return this.int() * (1.0 / (MAX_INT - 1));
  };

  /**
   * Generates a random real in the interval ]0;1[ with 32-bit resolution.
   *
   * @since 0.1.0
   * @returns {number}
   */
  realx() {
    return (this.int() + 0.5) * (1.0 / MAX_INT);
  };

  /**
   * Generates a random real in the interval [0;1[ with 32-bit resolution.
   *
   * @since 0.1.0
   * @returns {number}
   */
  rnd() {
    return this.int() * (1.0 / MAX_INT);
  };

  /**
   * Generates a random real in the interval [0;1[ with 32-bit resolution.
   *
   * Same as .rnd() method - for consistency with Math.random() interface.
   *
   * @since 0.2.0
   * @returns {number}
   */
  random() {
    return this.rnd();
  };

  /**
   * Generates a random real in the interval [0;1[ with 53-bit resolution.
   *
   * @since 0.1.0
   * @returns {number}
   */
  rndHiRes() {
    const a = this.int() >>> 5,
      b = this.int() >>> 6;
    return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
  };
}

const twist = new MersenneTwister();


/**
 * A class pattern for collections of Entity objects within the Foundry VTT Framework
 *
 * @param {Object} data             An Array of Entity data from which to create instances
 * @param {Array} apps              An Array of Application instances which the Collection modifies
 */
class Collection {
  constructor(data, apps) {

    /**
     * An Array of all the Entity instances of this type which are contained within the collection
     * @type {Array}
     */
    this.entities = [];

    /**
     * A reference to the original source data provided by the server
     * @type {Object}
     */
    this.source = data;

    /**
     * An Array of application references which will be automatically updated when the collection content changes
     * @type {Array}
     */
    this.apps = apps || [];

    // Create existing entities
    for ( let d of data ) {
      this.entities.push(new this.object(d));
    }
  }

	/* -------------------------------------------- */

  /**
   * Make the collection iterable
   */  [Symbol.iterator]() {
    return this.entities.values();
  }

	/* -------------------------------------------- */

  /**
   * The Collection name
   * @type {String}
   */
	get name() {
	  return this.constructor.name;
  }

	/* -------------------------------------------- */

  /**
   * Return a reference to the singleton instance of this Collection
   * By default, a Collection is located in `game[Collection.name]`, for example `game.actors`
   *
   * @type {Collection}
   */
  static get instance() {
    return game[this.name.toLowerCase()];
  }
	/* -------------------------------------------- */

  /**
   * Return a reference to the SidebarDirectory application for this Collection
   * @return {*}
   */
  static get directory() {
    return ui[this.name.toLowerCase()];
  }

	/* -------------------------------------------- */

  /**
   * Return a reference to the Entity subclass which should be used when creating elements of this Collection
   *
   * This should always be an explicit reference to the class which is used in this game to represent the entity,
   * and not the base implementation of that entity type.
   * For example :class:`Actor5e` not :class:`Actor`
   *
   * @type {Entity}
   */
  get object() {
    return Entity;
  }

	/* -------------------------------------------- */

  /**
   * Return the base Entity name which this collection manages.
   *
   * This should always be the primitive name of the entity type, not the name of a specific subclass implementation
   * For example "Actor", not "Actor5e"
   *
   * @type {String}
   */
	get entity() {
	  return this.object.entity;
  }

	/* -------------------------------------------- */

  /**
   * Add a new Entity to the Collection, asserting that they are of the correct type
   *
   * @param entity {Entity}   The entity instance to add to the collection
   */
	insert(entity) {
    if ( !( entity instanceof this.object ) ) {
      throw `You may only push instances of ${this.object.name} to the ${this.name} collection`;
    }

    // Is the data already in the source?
    let source_index = this.source.findIndex(e => e._id === entity._id);
    if ( source_index !== -1 ) {
      this.source[source_index] = entity.data;
    } else {
      this.source.push(entity.data);
    }

    // Is the entity already in the collection?
    let collection_index = this.index(entity._id);
    if ( collection_index !== -1 ) {
      this.entities[collection_index] = entity;
    } else {
      this.entities.push(entity);
    }
  }

	/* -------------------------------------------- */

  /**
   * Remove an Entity from the Collection by its ID.
   *
   * @param id {String}   The entity ID which should be removed
   */
	remove(id) {

	  // Remove from source
    let sourceIndex = this.source.findIndex(e => e._id === id);
    if ( sourceIndex !== -1 ) this.source.splice(sourceIndex, 1);

	  // Remove from collection
	  let entityIndex = this.index(id);
	  if ( entityIndex !== -1 ) this.entities.splice(entityIndex, 1);
  }

	/* -------------------------------------------- */

  /**
   * Get an element from the collection by ID
   *
   * @param id {String}   The entity ID to retrieve from the collection
   * @return {Entity}     The retrieved Entity, if the ID was found, otherwise null;
   */
	get(id) {
	  return this.entities.find(e => e._id === id);
  }

	/* -------------------------------------------- */

  /**
   * Retrieve the index of an entity within the collection by its ID
   *
   * @param id {String}   The entity ID to retrieve from the collection
   * @return {Number}     The index of the Entity within the collection, if found, otherwise -1;
   */
	index(id) {
	  return this.entities.findIndex(e => e._id == id);
  }

	/* -------------------------------------------- */

  /**
   * Re-render any currently visible applications associated with this Collection
   */
	render(...args) {
    for ( let a of this.apps ) a.render(...args);
  }

  /* -------------------------------------------- */

  /**
   * Import an Entity from a compendium collection, adding it to the current World
   * @param collection {String}     The name of the pack from which to import
   * @param entryId {String}        The ID of the compendium entry to import
   * @return {Promise}              A Promise containing the imported Entity
   */
  importFromCollection(collection, entryId) {
    const entName = this.object.entity;
    const pack = game.packs.find(p => p.collection === collection);
    if ( pack.metadata.entity !== entName ) return;
    return pack.getEntity(entryId).then(ent => {
      console.log(`${vtt} | Importing ${entName} ${ent.name} from ${collection}`);
      delete ent.data._id;
      return ent.constructor.create(ent.data);
    });
  }

	/* -------------------------------------------- */
	/*  Socket Listeners and Handlers               */
	/* -------------------------------------------- */

  /**
   * Activate socket listeners related to this particular Entity type
   * @param {Socket} socket   The open game socket
   */
	static socketListeners(socket) {
	  let c = this.instance;
    socket.on('create'+c.entity, c.create.bind(c))
          .on('update'+c.entity, c.update.bind(c))
          .on('delete'+c.entity, c.delete.bind(c));
  }

	/* -------------------------------------------- */

  /**
   * Create a new entity using provided input data
   * The data for entity creation is provided from the server through the create<Entity> socket
   * @param {Object} created      The created Entity data
   * @return {Entity}             The created Entity instance
   */
  create({created, temporary=false}) {

    // Create the Entity
    let entity = new this.object(created);
    console.log(`${vtt} | Creating new ${this.entity} with ID ${entity._id}`);

    // Add it to the collection
    if ( !temporary ) this.insert(entity);

    // Call entity creation steps
    entity._onCreate(created);

    // Call entity creation hook
    Hooks.callAll(`create${this.entity}`, entity);

    // Return the created entity
    return entity;
  }

	/* -------------------------------------------- */

  /**
   * Update an existing Entity within the Collection using provided update data
   * The data used to update an entity is provided through the update<Entity> socket
   *
   * @param {Object} updated    The updated Entity data
   * @return {Entity}           The updated Entity instance
   */
	update({updated}) {

	  // Retrieve the entity to update
    let entity = this.get(updated._id);
    if ( !entity ) throw new Error(`The ${this.entity} to update with _id ${updated._id} does not exist`);

    // Merge new data with the existing data object
	  mergeObject(entity.data, updated, {insertKeys: true, insertValues: true, inplace: true, overwrite: true});
	  if ( updated.permission && entity.data.permission ) entity.data.permission = updated.permission;

    // Call entity _onUpdate handler
    entity._onUpdate(updated);

    // Call entity creation hook
    Hooks.callAll(`update${this.entity}`, entity, updated);

    // Return the updated entity
    return entity;
  }

	/* -------------------------------------------- */

  /**
   * Delete an existing Entity from this Collection using its ID
   *
   * @param {String} deleted      The ID of the deleted Entity
   * @return {String}             The ID of the Entity which was successfully deleted
   * */
	delete({deleted}) {
	  let entity = this.get(deleted);
	  console.log(`${vtt} | Deleting ${this.entity} with ID ${entity._id}`);

	  // Remove the entity from it's collection
    this.remove(deleted);

	  // Trigger entity _onDelete steps
	  entity._onDelete();

    // Call entity deletion hooks
    Hooks.callAll(`delete${this.entity}`, entity);

    // Return the deleted ID
    return deleted
  }
}
/**
 * The Compendium class provides an interface for interacting with compendium packs which are 
 * collections of similar Entities which are stored outside of the world database but able to
 * be easily imported into an active session.
 * 
 * When the game session is initialized, each available compendium pack is constructed and 
 * added to the ``game.packs``.
 *
 * Each Compendium is distinctly referenced using its canonical "collection" name which is a 
 * unique string that contains the module name which provides the compendium as well as the 
 * name of the pack within that module. For example, in the D&D5e system, the compendium pack
 * which provides the spells available within the SRD has the collection name "dnd5e.spells".
 *
 * @type {Application}
 *
 * @param metadata {Object}   The compendium metadata, an object provided by game.data
 * @param options {Object}    Application rendering options
 *
 * @example
 * // Let's learn the collection names of all the compendium packs available within a game
 * game.packs.map(p => p.collection);
 *
 * // Suppose we are working with a particular pack named "dnd5e.spells"
 * const pack = game.packs.find(p => p.collection === "dnd5e.spells");
 * 
 * // We can load the index of the pack which contains all entity IDs, names, and image icons
 * pack.getIndex().then(index => console.log(index));
 * 
 * // We can find a specific entry in the compendium by its name
 * let entry = pack.index.find(e => e.name === "Acid Splash");
 * 
 * // Given the entity ID of "Acid Splash" we can load the full Entity from the compendium
 * pack.getEntity(entry.id).then(spell => console.log(spell));
 * 
 * @example
 * // We often may want to programmatically create new Compendium content
 * // Let's start by creating a custom spell as an Item instance
 * let itemData = {name: "Custom Death Ray", type: "Spell"};
 * let item = new Item(itemData);
 * 
 * // Once we have an entity for our new Compendium entry we can import it, if the pack is unlocked
 * pack.importEntity(item);
 * 
 * // When the entity is imported into the compendium it will be assigned a new ID, so let's find it
 * pack.getIndex().then(index => {
 *   let entry = index.find(e => e.name === itemData.name));
 *   console.log(entry);
 * });
 *
 * // If we decide to remove an entry from the compendium we can do that by the entry ID
 * pack.removeEntry(entry.id);
 */
class Compendium extends Application {
  constructor(metadata, options) {
    super(options);

    /**
     * The compendium metadata which defines the compendium content and location
     * @type {Object}
     */
    this.metadata = metadata;

    /**
     * Track whether the compendium pack is publicly visible
     * @type {Boolean}
     */
    this.public = true;

    // Internal flags
    this.searchString = null;
    this._searchTime = 0;
    this._scrollTop = 0;
  }

	/* -------------------------------------------- */

  /**
   * Assign the default options which are supported by the Compendium UI
   * @private
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.template = "templates/apps/compendium.html";
    options.width = 350;
    options.height = window.innerHeight - 100;
    options.top = 70;
    options.left = 120;
	  return options;
  }

  /* ----------------------------------------- */

  /**
   * The Compendium title
   * @private
   * @type {String}
   */
  get title() {
    return this.metadata.label;
  }

  /* ----------------------------------------- */

  /**
   * The canonical Compendium name - comprised of the originating module and the pack name
   * @return {string}     The canonical collection name
   */
  get collection() {
    return `${this.metadata.module}.${this.metadata.name}`
  }

  /* ----------------------------------------- */

  /**
   * The Entity type which is allowed to be stored in this collection
   * @type {String}
   */
  get entity() {
    return this.metadata.entity;
  }

  /* ----------------------------------------- */

  /**
   * Return the Compendium index as the data for rendering
   * First query the server to obtain the index and then return it once prepared
   * @return {Promise.Object}     The data to render
   */
  async getData() {
    const index = await this.getIndex();
    return {
      collection: this.collection,
      searchString: this.searchString,
      cssClass: this.entity.toLowerCase(),
      index: index.map(i => {
        i.img = i.img || DEFAULT_TOKEN;
        return i;
      })
    };
  }

  /* ----------------------------------------- */

  /**
   * Override the default :class:`Application` rendering logic to wrap the render call in a promise which
   * retrieves the compendium data.
   */
  async _render(...args) {
    await super._render(...args);
    if ( this.searchString ) this._onSearch(this.searchString);
    if ( this._scrollTop ) this.element.find(".pack-content")[0].scrollTop = this._scrollTop;
  }

  /* ----------------------------------------- */
  /*  Methods
  /* ----------------------------------------- */

  /**
   * Create a new Compendium pack using provided
   * @param {Object} metadata   The compendium metadata used to create the new pack
   * @return {Promise.<Compendium>}
   */
  static create(metadata) {
    return new Promise(resolve => {
      game.socket.emit('createCompendiumPack', metadata, packData => {
        let pack = new Compendium(packData);
        game.packs.push(pack);
        resolve(pack);
      });
    });
  }

  /* ----------------------------------------- */

  /**
   * Get the Compendium index
   * Contains names and IDs of all data in the compendium
   *
   * @return {Promise}    A Promise containing an index of all compendium entries
   */
  getIndex() {
    return new Promise((resolve, reject) => {
      game.socket.emit('getCompendiumIndex', this.collection, resolve);
    });
  }

  /* ----------------------------------------- */

  /**
   * Get the complete set of content for this compendium, loading all entries in full
   * Returns a Promise that resolves to an Array of entries
   *
   * @return {Promise.<Array>}
   */
  async getContent() {
    return new Promise((resolve) => {
      game.socket.emit("getCompendiumContent", this.collection, entries => {
        resolve(entries.map(e => this._toEntity(e)));
      });
    })
  }

  /* ----------------------------------------- */

  /**
   * Get a single Compendium entry as an Object
   * @param entryId {String}  The compendium entry ID to retrieve
   *
   * @return {Promise}        A Promise containing the return entry data, or undefined
   */
  getEntry(entryId) {
    return new Promise((resolve, reject) => {
      game.socket.emit('getCompendiumEntry', this.collection, entryId, resolve);
    })
  }

  /* ----------------------------------------- */

  /**
   * Get a single Compendium entry as an Entity instance
   * @param entryId {String}    The compendium entry ID to instantiate
   *
   * @return {Promise}          A Promise containing the returned Entity
   */
  getEntity(entryId) {
    return this.getEntry(entryId).then(entryData => this._toEntity(entryData));
  }

  /* ----------------------------------------- */

  /**
   * Cast entry data to an Entity class
   * @param {Object} entryData
   * @private
   */
  _toEntity(entryData) {
    const cls = CONFIG[this.entity].entityClass,
          ent = new cls(entryData);
    ent.owner = false;
    return ent;
  }

  /* ----------------------------------------- */

  /**
   * Import a new Entity into a Compendium pack
   * @param {Entity} entity     The Entity instance you wish to import
   * @return {Promise}          A Promise which resolves to the created Entity once the operation is complete
   */
  importEntity(entity) {
    if ( entity.entity !== this.entity ) {
      let err = "You are attempting to import the wrong type of entity into this pack";
      ui.notifications.error(err);
      throw new Error(err);
    }
    return this.createEntity(entity.data);
  }

  /* -------------------------------------------- */

  /**
   * Create a new Entity within this Compendium Pack using provided data
   * @param {Object} data       Data with which to create the entry
   * @return {Promise}          A Promise which resolves to the created Entity once the operation is complete
   */
  createEntity(data) {
    const eventData = {packName: this.collection, data: data};
    const preHook = "preCreateCompendiumEntry";
    return SocketInterface.trigger("createCompendiumEntry", eventData, {}, preHook, this).then(resp => {
      this.render(false);
      return this._toEntity(resp.created);
    });
  }

  /* -------------------------------------------- */

  /**
   * Update a single Compendium entry programmatically by providing new data with which to update
   * @param {Object} data       The incremental update with which to update the Entity. Must contain the _id
   * @return {Promise}          A Promise which resolves with the updated Entity once the operation is complete
   */
  updateEntity(data) {
    if ( !data._id ) throw new Error("You must specify the _id attribute for the data you wish to update");
    const eventData = {packName: this.collection, data: data};
    const preHook = "preUpdateCompendiumEntry";
    return SocketInterface.trigger("updateCompendiumEntry", eventData, {}, preHook, this).then(resp => {
      this.render(false);
      return this.getEntity(data._id);
    })
  }

  /* ----------------------------------------- */

  /**
   * Delete a single Compendium entry by its provided _id
   * @param {String} id         The entry ID to delete
   * @return {Promise}          A Promise which resolves to the deleted entry ID once the operation is complete
   */
  deleteEntity(id) {
    const eventData = {packName: this.collection, id: id};
    const preHook = "preDeleteCompendiumEntry";
    return SocketInterface.trigger("deleteCompendiumEntry", eventData, {}, preHook, this).then(resp => {
      this.render(false);
      return resp.deleted;
    });
  }

  /* -------------------------------------------- */

  /**
   * Customize Compendium closing behavior to toggle the sidebar folder status icon
   */
  close() {
    super.close();
    let li = $(`.compendium-pack[data-pack="${this.collection}"]`);
    li.attr("data-open", "0");
    li.find("i.folder").removeClass("fa-folder-open").addClass("fa-folder");
  }

  /* -------------------------------------------- */

  /**
   * Register event listeners for Compendium directories
   * @private
   */
  activateListeners(html) { 

    // Search filtering
    html.find('input[name="search"]').keyup(ev => {
      let input = ev.currentTarget;
      this._searchTime = new Date();
      setTimeout(() => {
        if ( new Date() - this._searchTime > 250) this._onSearch(input.value);
      }, 251);
    });

    // Open sheets
    html.find('.entry-name').click(ev => {
      let li = ev.currentTarget.parentElement;
      this._onEntry(li.getAttribute("data-entry-id"));
    });

    // Make compendium entries draggable
    if ( game.user.isGM || this.entity === "Item" ) {
      html.find('.pack-entry').each((i, li) => {
        li.setAttribute("draggable", true);
        li.addEventListener('dragstart', this._onDragStart, false);
      });
    }

    // Track scroll position
    html.find("ol.pack-content").scroll(ev => this._scrollTop = ev.target.scrollTop);

    // GM only actions below here
    if ( !game.user.isGM ) return;

    // Make the compendium droppable
    html[0].ondragover = this._onDragOver;
    html[0].ondrop = this._onDrop;

    // Context menu
    this._contextMenu(html);
  }

  /* -------------------------------------------- */

  /**
   * Handle compendium filtering through search field
   * Toggle the visibility of indexed compendium entries by name (for now) match
   * @private
   */
  _onSearch(searchString) {
    let rgx = new RegExp(searchString, "i");
    this.element.find('li.pack-entry').each((i, el) => {
      let name = el.getElementsByClassName('entry-name')[0].textContent;
      el.style.display = name.match(rgx) ? "flex" : "none";
    });
    this.searchString = searchString;
  }

  /* -------------------------------------------- */

  /**
   * Handle opening a single compendium entry by invoking the configured entity class and its sheet
   * @private
   */
  async _onEntry(entryId) {
    const entity = await this.getEntity(entryId);
    const sheet = entity.sheet;
    sheet.options.editable = false;
    sheet.options.compendium = this.collection;
    sheet.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle a new drag event from the compendium, create a placeholder token for dropping the item
   * @private
   */
  _onDragStart(event) {
    const li = this,
          packName = li.parentElement.parentElement.getAttribute("data-pack"),
          pack = game.packs.find(p => p.collection === packName);

    // Get the pack
    if ( !pack ) {
      event.preventDefault();
      return false;
    }

    // Set the transfer data
    event.dataTransfer.setData("text/plain", JSON.stringify({
      type: pack.entity,
      pack: pack.collection,
      id: li.getAttribute("data-entry-id")
    }));
  }

	/* -------------------------------------------- */

  /**
   * Allow data transfer events to be dragged over this as a drop zone
   * @private
   */
  _onDragOver(event) {
    event.preventDefault();
    return false;
  }

  /* -------------------------------------------- */

  /**
   * Handle data being dropped into a Compendium pack
   * @private
   */
  _onDrop(event) {
    event.preventDefault();
    const packName = this.getAttribute("data-pack"),
          pack = game.packs.find(p => p.collection === packName);

    // Try to extract the data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    }
    catch (err) {
      return false;
    }

    // Import from other Compendium
    if ( data.pack ) {
      if ( data.pack === packName ) return false;
      const source = game.packs.find(p => p.collection === data.pack);
      source.getEntity(data.id).then(ent => pack.importEntity(ent));
    }

    // Import from World
    else if ( data.type ) {
      let ent;
      const cls = CONFIG[data.type].entityClass;
      if ( data.type === "Item" && data.actorId ) {
        let itemData = game.actors.get(data.actorId).items.find(i => i.id === data.id);
        ent = new cls(itemData);
      } else {
        ent = cls.collection.get(data.id);
      }
      pack.importEntity(ent);
    }
  }

  /* -------------------------------------------- */

  /**
   * Render the ContextMenu which applies to each compendium entry
   * @private
   */
  _contextMenu(html) {
    new ContextMenu(html, ".pack-entry", {
      "Import": {
        icon: '<i class="fas fa-download"></i>',
        callback: li => {
          let entryId = li.attr('data-entry-id');
          let entities = CONFIG[this.entity].entityClass.collection;
          entities.importFromCollection(this.collection, entryId);
        }
      },
      "Delete": {
        icon: '<i class="fas fa-trash"></i>',
        callback: li => {
          let entryId = li.attr('data-entry-id');
          this.getEntity(entryId).then(entry => {
            new Dialog({
              title: `Delete ${entry.name}`,
              content: "<h3>Are you sure?</h3>" +
                       "<p>This compendium entry and its data will be deleted.</p>" +
                       "<p>If you do not own this compendium, your change could be reverted by future updates.</p>",
              buttons: {
                yes: {
                  icon: '<i class="fas fa-trash"></i>',
                  label: "Delete",
                  callback: () => this.deleteEntity(entryId)
                },
                no: {
                  icon: '<i class="fas fa-times"></i>',
                  label: "Cancel"
                }
              },
              default: 'yes'
            }).render(true);
          })
        }
      }
    });
  }
}

/**
 * An abstract class pattern for all primary data entities within the Foundry VTT Framework
 * An entity represents a primary data concept, for example: Actor, Item, Scene, or ChatMessage.
 * Employing this abstraction layer ensures similar behavior and workflow for all entity types.
 *
 * Documentation for this class is provided for reference, but developers should not extend this class directly,
 * instead work with or extend the Entity implementations that are referenced in this section of the API documentation.
 *
 * Entities are instantiated by providing their base data, and an optional Array of Application instances which should
 * be automatically refreshed when the Entity experiences an update.
 *
 * @param {Object} data       The data Object with which to create the Entity
 * @oaram {Object} options    Additional options which modify the created Entity behavior
 *
 * @example
 * let actorData = {name: "John Doe", type: "character", img: "icons/mystery-man.png"};
 * let actor = new Actor(actorData);
 */
class Entity {
  constructor(data, options) {

    /**
     * The Entity references the raw source data for the object provided through game.data
     * @type {Object}
     */
    this.data = this.prepareData(data);

    /**
     * Additional options which were used to configure the Entity
     * @type {Object}
     */
    this.options = options || {};

    /**
     * A list of Application instances which should be re-rendered whenever this Entity experiences an update
     * @type {Object.<Application>}
     */
    this.apps = {};
  }

	/* -------------------------------------------- */
	/*  Properties
	/* -------------------------------------------- */

  /**
   * The parent class name of the base entity type.
   * For subclass Entities, this will examine the inheritance chain and return the base type.
   *
   * @type {Entity}
   *
   * @example
   * class Actor2ndGen extends Actor {
   *   // ...
   * }
   * Actor2ndGen.entity    // Actor
   */
	static get entity() {
	  let entity = this;
	  while ( entity.__proto__.name !== "Entity" ) {
	    entity = entity.__proto__;
    }
    return entity.name
  }

	/* -------------------------------------------- */

  /**
   * A instance-level convenience accessor for the class-level entity property
   * @type {Entity}
   */
	get entity() {
	  return this.constructor.entity;
  }

	/* -------------------------------------------- */

  /**
   * A convenience accessor for the _id attribute of the Entity data object
   * @type {String}
   */
  get id() {
	  return this.data._id;
  }

	/* -------------------------------------------- */

  /**
   * An alias of the id property
   * @private
   */
	get _id() {
	  return this.data._id;
  }

	/* -------------------------------------------- */

  /**
   * A convenience accessor for the name attribute of the Entity data object
   * @type {String}
   */
  get name() {
	  return this.data.name;
  }

	/* -------------------------------------------- */

  /**
   * Return a reference to the Collection class which stores Entity instances of this type.
   * This property should be overridden by child class implementations.
   * @type {Collection}
   */
	static get collection() {
	  return null;
  }

	/* -------------------------------------------- */

  /**
   * Return a reference to the Collection class which stores Entity instances of this type.
   * This property simply references the static class property for convenience.
   * @type {Collection}
   */
  get collection() {
	  return this.constructor.collection;
  }

	/* -------------------------------------------- */

  /**
   * A property which gets or creates a singleton instance of the sheet class used to render and edit data for this
   * particular entity type.
   * @type {BaseEntitySheet}
   *
   * @example
   * let actor = game.entities.actors[0];
   * actor.sheet      // ActorSheet
   */
	get sheet() {
	  const cls = this._sheetClass;
	  if ( !cls ) return null;
	  let sheet = Object.values(this.apps).find(app => app.constructor === cls);
	  if ( !sheet ) sheet = new cls(this, {editable: this.owner});
	  return sheet;
  }

	/* -------------------------------------------- */

  /**
   * Obtain a reference to the BaseEntitySheet implementation which should be used to render the Entity instance
   * configuration sheet.
   * @private
   */
  get _sheetClass() {
    const cfg = CONFIG[this.entity];
    return cfg ? cfg.sheetClass : undefined;
  }

	/* -------------------------------------------- */

  /**
   * Return the permission level that the current game User has over this Entity.
   * See the ENTITY_PERMISSIONS object for an enumeration of these levels.
   * @type {Number}
   */
	get permission() {

	  // Game-masters and Assistants are always owners
    if ( game.user.permission >= USER_PERMISSIONS.ASSISTANT ) return ENTITY_PERMISSIONS.OWNER;

    // User-specific permission
    let userPerm = this.data.permission[game.user._id];
    return userPerm ? userPerm : this.data.permission["default"];
  }

  /* -------------------------------------------- */

  /**
   * A boolean indicator for whether or not the current game User has ownership rights for this Entity
   * This property has a setter which allows for ownership rights to be overridden specifically on a per-instance basis
   * @param isOwner
   * @private
   */
  set owner(isOwner) {
    this._owner = Boolean(isOwner);
  }

  get owner() {
    return this._owner !== undefined ? this._owner : this.hasPerm(game.user, "OWNER");
  }

  /* -------------------------------------------- */

  /**
   * A boolean indicator for whether or not the current game User has at least limited visibility for this Entity.
   * @return {Boolean}
   */
  get visible() {
    return this.hasPerm(game.user, "LIMITED", false);
  }

  /* -------------------------------------------- */

  /**
   * A boolean indicator for whether the current game user has ONLY limited visibility for this Entity.
   * @return {Boolean}
   */
  get limited() {
    return this.hasPerm(game.user, "LIMITED", true);
  }

	/* -------------------------------------------- */
	/* Methods
	/* -------------------------------------------- */

  /**
   * Prepare data for the Entity whenever the instance is first created or later updated.
   * This method can be used to derive any internal attributes which are computed in a formulaic manner.
   * For example, in a d20 system - computing an ability modifier based on the value of that ability score.
   *
   * @param {Object} data   The original data before additional preparation
   * @return {Object}       The updated data with new prepared attributes
   */
	prepareData(data) {
	  data = data || {};
	  if ( data.hasOwnProperty("name") && !data.name ) {
	    data.name = "New " + this.entity;
    }
	  return data;
  }

	/* -------------------------------------------- */

  /**
   * Render all of the applications which are connected to this Entity
   * @param {...} args      Variable arguments which are forwarded to each Application.render() call
   */
  render(...args) {
    for ( let app of Object.values(this.apps) ) {
      app.render(...args);
    }
  }

  /* -------------------------------------------- */

  /**
   * Test whether a provided User has ownership permission over the Entity instance
   *
   * @param {User} user           The user to test for permission
   * @param {Number} permission   The permission level to test
   * @param {Boolean} exact       Tests for an exact permission level match, by default this method tests for an equal
   *                              or greater permission level.
   * @return {Boolean}            Whether or not the user has the permission for this Entity
   */
  hasPerm(user, permission, exact=false) {

    // Get the user's permission level
    let level = this.data.permission[user._id];
    level = Number.isInteger(level) ? level : this.data.permission["default"];

    // Test permission against the target level
    if ( exact ) return level === ENTITY_PERMISSIONS[permission];
    else if ( user.isGM ) return true;
    return level >= ENTITY_PERMISSIONS[permission];
  }

	/* -------------------------------------------- */
	/*  Entity Management Methods                   */
	/* -------------------------------------------- */

  /**
   * Create a new entity using provided input data
   * The data for entity creation is typically provided from the server through the 'create<Entity>' socket
   * Alternatively, the creation event may originate locally and the new entity can be pushed back to the server
   *
   * @param {Object} data         The data with which to create the entity
   * @param {Object} options      Additional options which customize the creation workflow
   * @param {Boolean} options.temporary     Create a temporary entity which is not saved to the world database.
   *                                        Default is false.
   * @param {Boolean} options.displaySheet  Show the configuration sheet for the created entity once it is created.
   *                                        Default is true.
   * 
   * @return {Promise}            A Promise which resolves to contain the created Entity     
   */
  static async create(data, options={}) {
    const name = this.entity,
          preHook = 'preCreate' + name;
          options = mergeObject({temporary: false, displaySheet: true}, options);
    return SocketInterface.trigger('create' + name, {data}, options, preHook, this).then(response => {
      const entity = this.collection.create(response);
      if (options.displaySheet && entity.sheet) entity.sheet.render(true);
      return entity;
    });
  }

	/* -------------------------------------------- */

  /**
   * Update the current entity using new data
   * This new data is typically provided from the server through the 'update<Entity>' socket
   * Alternatively, the update may originate locally, in which case it can be pushed back to the server
   *
   * @param {Object} data     The data with which to update the entity
   * @param {Object} options  Additional options which customize the update workflow
   * @return {Promise}        A Promise which resolves to the updated Entity
   */
  async update(data, options={}) {
    const name = this.entity,
          preHook = 'preUpdate'+name;

    // Prepare data for update
    delete data._id;
    let changed = {};
    for (let [k, v] of Object.entries(data)) {
      let c = getProperty(this.data, k);
      if ( c !== v ) changed[k] = v;
    }
    if ( !Object.keys(changed).length ) return Promise.resolve(this);
    changed._id = this._id;

    // Trigger the socket event and handle response
    return SocketInterface.trigger('update'+name, {data: changed}, options, preHook, this).then(response => {
      return this.collection.update(response);
    });
  }

	/* -------------------------------------------- */

  /**
   * Delete the entity, removing it from its collection and deleting its data record
   * @param {Object} options    Additional options which customize the deletion workflow
   * @return {Promise}          A Promise which resolves to the ID of the deleted Entity once handled by the server
   */
  async delete(options={}) {
    const name = this.entity,
          preHook = 'preDelete'+name;
    return SocketInterface.trigger('delete'+name, {id: this._id}, options, preHook, this).then(response => {
      return this.collection.delete(response);
    });
  }

  /* -------------------------------------------- */

  /**
   * Specific actions that should occur be when the Entity is first created
   * @private
   */
	_onCreate(data) {
	  const renderOptions = {
      renderContext: 'create'+this.entity,
      renderData: data,
      entity: this
    };

	  // Render Collection and Entity Applications
    this.collection.render(false, renderOptions);
    this.render(false, renderOptions);
  }

	/* -------------------------------------------- */

  /**
   * Specific actions that should occur be when the Entity is updated
   * @private
   */
	_onUpdate(data) {

	  // Repeat data preparation steps once data has been updated
    this.data = this.prepareData(this.data);
    const keys = Object.keys(data);

    // Define rendering options
	  const renderOptions = {
      renderContext: 'update'+this.entity,
      changed: keys,
      renderData: data,
      entity: this
    };

	  // Render Collection and Entity Applications
    this.collection.render(false, renderOptions);
    this.render(false, renderOptions);
  }

  /* -------------------------------------------- */

  /**
   * Specific actions that should occur on the client side once the Entity is deleted
   * @private
   */
  _onDelete() {

    // Destroy connected apps
    for ( let a of Object.values(this.apps) ) {
      a.options.editable = false;
      a.close();
    }

    // Remove the entity from the collection
    this.collection.render(false, {
      renderContext: 'delete'+this.entity,
      renderData: this._id,
      entity: this
    });
  }

  /* -------------------------------------------- */

  /**
   * Assign a "flag" to this Entity.
   * Flags represent key-value type data which can be used to store flexible or arbitrary data required by either
   * the core software, game systems, or user-created modules.
   *
   * Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.
   *
   * Flags set by the core software use the "core" scope.
   * Flags set by game systems or modules should use the canonical name attribute for the module
   * Flags set by an individual world should "world" as the scope.
   *
   * Flag values can assume almost any data type. Setting a flag value to null will delete that flag.
   *
   * @param {String} scope    The flag scope which namespaces the key
   * @param {String} key      The flag key
   * @param {*} value         The flag value
   *
   * @return {Promise.<Entity>} A Promise resolving to the updated Entity
   */
  async setFlag(scope, key, value) {
    const scopes = ["core", game.system.name, "world"].concat(game.modules.map(m => m.data.name));
    if ( !scopes.includes(scope) ) throw new Error(`Invalid scope for flag ${key}`);
    key = `flags.${scope}.${key}`;
    return this.update({[key]: value});
  }

  /* -------------------------------------------- */

  /**
   * Get the value of a "flag" for this Entity
   * See the setFlag method for more details on flags
   *
   * @param {String} scope    The flag scope which namespaces the key
   * @param {String} key      The flag key
   * @return {*}              The flag value
   */
  getFlag(scope, key) {
    const scopes = ["core", game.system.name, "world"].concat(game.modules.map(m => m.data.name));
    if ( !scopes.includes(scope) ) throw new Error(`Invalid scope for flag ${key}`);
    key = `${scope}.${key}`;
    return getProperty(this.data.flags, key);
  }

  /* -------------------------------------------- */
  /*  Saving and Loading
  /* -------------------------------------------- */

  /**
   * Export entity data to a JSON file which can be saved by the client and later imported into a different session
   */
  exportToJSON() {
    const data = duplicate(this.data);
    delete data.folder;
    delete data.permission;
    const filename = `fvtt-${this.entity}-${this.name.replace(/\s/g, "_")}.json`;
    saveDataToFile(JSON.stringify(data, null, 2), "text/json", filename);
  }

  /* -------------------------------------------- */

  /**
   * Import data and update this entity
   * @param {String} json         JSON data string
   * @return {Promise.<Entity>}   The updated Entity
   */
  async importFromJSON(json) {
    const data = JSON.parse(json);
    delete data._id;
    return this.update(data);
  }

  /* -------------------------------------------- */

  /**
   * Render an import dialog for updating the data related to this Entity through an exported JSON file
   * @return {Promise.<void>}
   */
  async importDialog() {
    new Dialog({
      title: `Import Data: ${this.name}`,
      content: await renderTemplate("templates/apps/import-data.html", {entity: this.entity, name: this.name}),
      buttons: {
        import: {
          icon: '<i class="fas fa-file-import"></i>',
          label: "Import",
          callback: html => {
            const form = html.find("form")[0];
            if ( !form.data.files.length ) return ui.notifications.error("You did not upload a data file!");
            readTextFromFile(form.data.files[0]).then(json => this.importFromJSON(json));
          }
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: "import"
    }, {
      width: 400
    }).render(true);
  }
}

/**
 * An object representation for the primary PIXI Canvas
 * Contains multiple drawing layers
 */
class Canvas {
  constructor() {

    // Draw the canvas
    const canvas = document.createElement("canvas");
    canvas.id = "board";
    $("#board").replaceWith(canvas);
    canvas.ondragover = this._onDragOver;
    canvas.ondrop = this._onDrop;

    // Create PIXI Application
    this.app = new PIXI.Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      transparent: true,
      resolution: 1,
    });

    // Confirm that WebGL is available
    if ( this.app.renderer.type !== PIXI.RENDERER_TYPE.WEBGL ) {
      Hooks.once("renderNotifications", app => {
        app.error("WebGL support not detected, ensure you have hardware rendering support enabled.");
      });
      throw new Error("No WebGL Support!");
    }

    // Create the primary canvas layers
    this.stage = this.app.stage;
    this.hud = new HeadsUpDisplay();
    this._createLayers(this.stage);

    // Record the active scene and its dimensions
    this.id = null;
    this.scene = null;
    this.dimensions = null;

    /**
     * Track the timestamp of the last stage zoom operation
     * @type {Number}
     * @private
     */
    this._zoomTime = 0;

    /**
     * An object of data which is temporarily cached to be reloaded after the canvas is drawn
     * @type {Object}
     * @private
     */
    this._reload = {};

    // Activate stage layer listeners
    this.stage.interactive = true;

    // Canvas ready flag
    this.ready = false;
  }

  /* -------------------------------------------- */

  /**
   * Create the layers of the game Canvas
   * @param {PIXI.Container} stage    The primary canvas stage
   * @private
   */
  _createLayers(stage) {
    this.background = stage.addChild(new BackgroundLayer());
    this.tiles = stage.addChild(new TilesLayer());
    this.grid = stage.addChild(new GridLayer());
    this.templates = stage.addChild(new TemplateLayer());
    this.walls = stage.addChild(new WallsLayer());
    this.notes = stage.addChild(new NotesLayer());
    this.tokens = stage.addChild(new TokenLayer());
    this.sight = stage.addChild(new SightLayer());
    this.lighting = stage.addChild(new LightingLayer());
    this.sounds = stage.addChild(new SoundsLayer());
    this.effects = stage.addChild(new EffectsLayer());
    this.controls = stage.addChild(new ControlsLayer());
  }

  /* -------------------------------------------- */
  /*  Properties and Attributes
  /* -------------------------------------------- */

  get layers() {
    return this.stage.children.filter(l => l instanceof CanvasLayer);
  }

  /* -------------------------------------------- */

  /**
   * Return a reference to the active Canvas Layer
   * @type {CanvasLayer}
   */
  get activeLayer() {
    return this.layers.find(l => l._active);
  }

  /* -------------------------------------------- */
  /*  Rendering
  /* -------------------------------------------- */

  /**
   * When re-drawing the canvas, first tear down or discontinue some existing processes
   */
  tearDown() {

    // Track current data which should be restored on draw
    this._reload = {
      scene: this.scene._id,
      layer: this.activeLayer.name,
      tokens: Object.keys(this.tokens._controlled),
      view: this.scene._viewPosition
    };

    // Stop background video playback
    if ( this.background.isVideo ) this.background.source.pause();

    // Conclude token animation, remember which tokens were controlled, and then release them
    this.tokens.concludeAnimation();
    this.tokens.releaseAll();

    // Save current fog of war progress
    this.sight.saveFog();

    // Terminate ambient audio playback
    this.sounds.stopAll();
  }

  /* -------------------------------------------- */

  /**
   * Draw the game canvas.
   */
  async draw() {

    // Tear down any existing scene
    if ( this.ready ) this.tearDown();
    this.ready = false;

    // Confirm there is an active scene
    const scene = game.scenes.viewed;
    if ( !scene ) {
      canvas.app.view.style.display = "none";
      console.log(`${vtt} | Skipping game canvas - no active scene.`);
      return;
    } else {
      canvas.app.view.style.display = "block";
      console.log(`${vtt} | Drawing game canvas for scene ${scene.name}`);
    }

    // Configure stage dimensions
    this.id = scene._id;
    this.scene = game.scenes.viewed;
    this.dimensions = this.getDimensions();
    let ww2 = window.innerWidth / 2;
    let wh2 = window.innerHeight / 2;
    this.stage.position.set(ww2, wh2);
    this.stage.hitArea = new PIXI.Rectangle(0, 0, this.dimensions.width, this.dimensions.height);

    // Set background color
    if ( scene.data.backgroundColor ) {
      this.app.view.style.background = scene.data.backgroundColor;
    } else {
      this.app.view.style.background = null;
    }

    // Load required textures
    await loadSceneTextures(scene);

    // Draw layers
    for ( let l of this.layers ) {
      await l.draw();
    }

    // Initialize starting conditions
    Hooks.callAll('canvasInit', this);
    this._initialize();

    // Add interactivity
    this._addListeners();

    // Check if the window was re-sized before the draw operation concluded
    if ( (this.app.renderer.width !== window.innerWidth) || (this.app.renderer.height !== window.innerHeight) ) {
      this._onResize(new Event("resize"));
    }

    // Mark the canvas as ready and call hooks
    this.ready = true;
    Hooks.call("canvasReady", this);
    this._reload = {};
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Get the canvas active dimensions based on the size of the scene's map
   * We expand the image size by a factor of 1.5 and round to the nearest 200 pixels
   * This guarantees that walls and tokens remain positioned in the same location if the grid size changes
   */
  getDimensions() {
    const data = this.scene.data,
          gx2 = data.grid * 2,
          w = data.width || data.grid * 30,
          h = data.height || data.grid * 20;

    // Assign dimensions
    const dims = {
      width: w + Math.ceil(0.5 * w / gx2) * gx2,
      sceneWidth: w,
      height: h + Math.ceil(0.5 * h / gx2) * gx2,
      sceneHeight: h,
      size: parseInt(data.grid),
      distance: parseFloat(data.gridDistance),
      shiftX: parseInt(data.shiftX),
      shiftY: parseInt(data.shiftY),
      ratio: w / h
    };

    // Determine the padding offset as a multiple of the grid size
    dims.paddingX = (dims.width - w) * 0.5;
    dims.paddingY = (dims.height - h) * 0.5;
    return dims;
  }

  /* -------------------------------------------- */

  /**
   * Once the canvas is drawn, initialize control, visibility, and audio states
   */
  _initialize() {

    // Render the HUD layer
    this.hud.render(true);

    // Initialize canvas conditions
    this._initializeCanvasPosition();
    this._initializeCanvasLayer();
    this._initializeTokenControl();

    // Set the user's current scene
    game.user.update({scene: this.id});

    // Initialize starting sight conditions
    this.sight.initialize();

    // Initialize audio
    this.sounds.initialize();

    // Render canvas controls
    ui.controls.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Initialize the starting view of the canvas stage
   * If we are re-drawing a scene which was previously rendered, restore the prior view position
   * Otherwise set the view to the top-left corner of the scene at standard scale
   * @private
   */
  _initializeCanvasPosition() {
    const cached = this._reload.scene === this.scene._id ? this._reload.view : this.scene._viewPosition;
    const initial = mergeObject({
      x: this.dimensions.paddingX + this.stage.position.x,
      y: this.dimensions.paddingY + this.stage.position.y,
      scale: 1
    }, cached);
    this.pan(initial);
  }

  /* -------------------------------------------- */

  /**
   * Initialize a CanvasLayer in the activation state
   * @private
   */
  _initializeCanvasLayer() {
    let activeLayer = this._reload.layer || ui.controls.activeLayer || "TokenLayer";
    this.getLayer(activeLayer).activate();
  }

  /* -------------------------------------------- */

  /**
   * Initialize a token or set of tokens which should be controlled
   * If we are re-loading a scene which was previously rendered - restore control over prior controlled tokens
   * Otherwise look for an impersonated (preferred) or observed (fallback) token to control
   * @private
   */
  _initializeTokenControl() {
    let isReload = this._reload.scene === this.scene._id;

    // Restore cached control set
    const cached = isReload ? this._reload.tokens : {};
    if ( isReload ) {
      canvas.tokens._controlled = cached.reduce((obj, id) => {
        obj[id] = canvas.tokens.get(Number(id));
        return obj;
      }, {});
      Object.values(canvas.tokens._controlled).forEach(t => t.control({initializeSight: false}));
    }

    // Control initial token
    else if ( !game.user.isGM  ) {
      let token = game.user.character ? game.user.character.getActiveTokens().shift() : null;
      if ( !token ) {
        token = canvas.tokens.placeables.filter(t => t.actor && t.actor.hasPerm(game.user, "OBSERVER")).shift();
      }
      if ( token ) {
        token.control({initializeSight: false});
        if ( !isReload ) this.animatePan({x: token.data.x, y: token.data.y, duration: 250});
      }
    }
  }

  /* -------------------------------------------- */

  getLayer(layer) {
    return this.stage.getChildByName(layer);
  }

  /* -------------------------------------------- */
  /*  Methods
  /* -------------------------------------------- */

  /**
   * Pan the canvas to a certain {x,y} coordinate and a certain zoom level
   * @param {Number} x      The x-coordinate of the pan destination
   * @param {Number} y      The y-coordinate of the pan destination
   * @param {Number} scale  The zoom level (max of CONFIG.maxCanvasZoom) of the action
   */
  pan({x=null, y=null, scale=null}={}) {

    // Pan the canvas to the new destination
    x = Number(x) || this.stage.pivot.x;
    y = Number(y) || this.stage.pivot.y;
    this.stage.pivot.set(x, y);

    // Zoom the canvas to the new level
    if ( scale ) {
      scale = Number(scale) || this.stage.scale.x;
      this.zoom(scale);
    } else scale = this.stage.scale.x;

    // Update the scene tracked position
    canvas.scene._viewPosition = { x:x , y:y, scale:scale };

    // Align the HUD
    this.hud.align();
  }

  /* -------------------------------------------- */

  /**
   * Animate panning the canvas to a certain destination coordinate and zoom scale
   * Customize the animation speed with additional options
   * Returns a Promise which is resolved once the animation has completed
   *
   * @param {Number} x            The destination x-coordinate
   * @param {Number} y            The destination y-coordinate
   * @param {Number} scale        The destination zoom scale
   * @param {Number} duration     The total duration of the animation in milliseconds; used if speed is not set
   * @param {Number} speed        The speed of animation in pixels per second; overrides duration if set
   * @returns {Promise}           A Promise which resolves once the animation has been completed
   */
  async animatePan({x, y, scale, duration=250, speed}) {

    // Determine the animation duration to reach the target
    if ( speed ) {
      let ray = new Ray(this.stage.pivot, {x, y});
      duration = Math.round(ray.distance * 1000 / speed);
    }

    // Construct the animation attributes
    const attributes = [
      { parent: this.stage.pivot, attribute: 'x', to: x },
      { parent: this.stage.pivot, attribute: 'y', to: y },
      { parent: this.stage.scale, attribute: 'x', to: scale },
      { parent: this.stage.scale, attribute: 'y', to: scale },
    ].filter(a => a.to !== undefined);

    // Animation ontick function
    const hud = this.hud,
          ontick = hud.align.bind(hud);

    // Trigger the animation function
    await CanvasAnimation.animateLinear(attributes, {
      name: "canvas.animatePan",
      duration: duration,
      ontick: ontick
    });

    // Update the scene tracked position
    canvas.scene._viewPosition = { x:x , y:y, scale:scale };
  }

  /* -------------------------------------------- */

  /**
   * Zoom the canvas in or out by some delta.
   * @param {Number} scale    A target zoom scale
   */
  zoom(scale) {

    // Get the allowed zoom boundaries
    let w = canvas.scene.data.width,
        h = canvas.scene.data.height,
        max = CONFIG.maxCanvasZoom,
        ratio = Math.max(w / window.innerWidth, h / window.innerHeight, max);

    // Zoom to the new scale
    let sx = Math.round( Math.clamped(scale, 1 / ratio, max) / 0.01) * 0.01,
        sy = Math.round( Math.clamped(scale, 1/ ratio, max) / 0.01) * 0.01;
    this.stage.scale.set(sx, sy);
  }

  /* -------------------------------------------- */

  /**
   * Recenter the canvas
   * Otherwise, pan the stage to put the top-left corner of the map in the top-left corner of the window
   */
  recenter(coordinates) {
    if ( coordinates ) this.pan(coordinates);
    this.animatePan({
      x: this.dimensions.paddingX + (window.innerWidth / 2),
      y: this.dimensions.paddingY + (window.innerHeight / 2),
      duration: 250
    });
  }

  /* -------------------------------------------- */
  /* Event Handlers
  /* -------------------------------------------- */

  /**
   * Attach event listeners to the game canvas to handle click and interaction events
   * @private
   */
  _addListeners() {
    this.stage.removeAllListeners();
    this.stage.on("mousedown", this._onMouseDown)
              .on("rightdown", this._onRightDown)
              .on('mousemove', this._onMouseMove)
              .on("mouseup", this._onMouseUp)
              .on("mouseupoutside", this._onMouseUp)
              .on("rightup", this._onRightUp)
              .on("rightupoutside", this._onRightUp);
  }

  /* -------------------------------------------- */

  /**
   * Handle left mouse-click events occuring on the Canvas stage or it's active layer
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onMouseDown(event) {

    // Extract event data
    const oe = event.data.originalEvent,
          layer = canvas.activeLayer,
          isRuler = game.activeTool === "ruler",
          isCtrlRuler = (oe.ctrlKey || oe.metaKey) && (layer.name === "TokenLayer"),
          isSelect = game.activeTool === "select";

    // First delegate the click to the active layer unless a special tool is in use
    if (layer._onMouseDown) layer._onMouseDown(event, {isRuler, isCtrlRuler, isSelect});
    if (event.stopped) return;
    event.stopPropagation();

    // Record initial event position
    event.data.origin = event.data.getLocalPosition(this);

    // Handle ruler measurement
    if ( isRuler || isCtrlRuler ) canvas.controls.ruler._onMouseDown(event);

    // Begin a new selection
    else if ( isSelect ) {
      event.data._selectState = 1;
      event.data.coords = [];
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle right mouse-click events occuring on the Canvas stage or it's active layer
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onRightDown(event) {

    // First delegate the click to the active layer
    const layer = canvas.activeLayer;
    if ( layer._onRightDown ) layer._onRightDown(event);
    if ( event.stopped ) return;
    event.stopPropagation();

    // Handle ruler measurement
    let ruler = canvas.controls.ruler;
    if ( ruler.active ) ruler._onCancelWaypoint(event);

    // Begin a new canvas pan workflow
    else {
      event.data._panStart = {x: canvas.stage.pivot.x, y: canvas.stage.pivot.y};
      event.data.origin = {x: event.data.global.x, y: event.data.global.y};
      event.data._dragState = 1;
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse movement events occuring on the Canvas stage or it's active layer
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onMouseMove(event) {

    // First delegate the click to the active layer
    const layer = canvas.activeLayer;
    if ( layer._onMouseMove ) layer._onMouseMove(event);
    if ( event.stopped ) return;
    event.stopPropagation();

    // Extract event data
    const { origin, cursorTime, _selectState, _dragState } = event.data;
    const now = Date.now();

    // Get event position
    let p0 = origin,
        p1 = event.data.getLocalPosition(this);
    event.data.destination = p1;

    // Update the client's cursor position every 100ms
    let ct = cursorTime || 0;
    if ( now - ct> 100 ) {
      if ( canvas.controls ) canvas.controls._onMoveCursor(event, p1);
      event.data.cursorTime = now;
    }

    // Update the client's active status every 1000ms
    if ( now - ct > 1000) {
      game.user.update({active: true});
    }

    // Continue a measurement event if we have moved at least half a grid unit
    const ruler = canvas.controls.ruler;
    if ( ruler._state > 0 ) ruler._onMouseMove(event);

    // Continue a select event
    else if ( _selectState > 0 ) canvas._onMoveSelect(event, _selectState, p0, p1);

    // Continue a drag event
    else if ( _dragState > 0 ) {
      const DRAG_SPEED_MODIFIER = 0.8;
      let dx = ( event.data.global.x - p0.x ) / (canvas.stage.scale.x * DRAG_SPEED_MODIFIER),
          dy = ( event.data.global.y - p0.y ) / (canvas.stage.scale.y * DRAG_SPEED_MODIFIER);
      canvas.pan({
        x: event.data._panStart.x - dx,
        y: event.data._panStart.y - dy
      });
      canvas.tokens._tabCycle = false;
    }
  }

  /* -------------------------------------------- */

  /**
   * Determine selection coordinate rectangle during a mouse-drag workflow
   * @param {PIXI.interaction.InteractionEvent} event
   * @param {Number} state    The selection workflow state
   * @param {Object} p0       The origin coordinate
   * @param {Object} p1       The destination coordinate
   * @private
   */
  _onMoveSelect(event, state, p0, p1) {

    // Determine rectangle coordinates
    let coords = {
      x: Math.min(p0.x, p1.x),
      y: Math.min(p0.y, p1.y),
      width: Math.abs(p1.x - p0.x),
      height: Math.abs(p1.y - p0.y)
    };

    // Only select if we have moved further than the minimum drag distance in some direction
    let distance = Math.hypot(coords.width, coords.height);
    if ( (state === 2) || (distance >= canvas.dimensions.size / 2) ) {
      canvas.controls.drawSelect(coords);
      event.data._selectState = 2;
      event.data.coords = coords;
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle left-mouse up events occuring on the Canvas stage or it's active layer
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onMouseUp(event) {

    // First delegate the click to the active layer
    const layer = canvas.activeLayer;
    if ( layer._onMouseUp ) layer._onMouseUp(event);
    if ( event.stopped ) return;
    event.stopPropagation();

    // Extract event data
    let oe = event.data.originalEvent,
        isCtrl = oe.ctrlKey || oe.metaKey,
        ruler = canvas.controls.ruler;

    // Conclude a pan event
    if ( event.data._dragState > 0 ) canvas._onRightUp(event);

    // Conclude a measurement event if we aren't holding the CTRL key
    else if ( ruler.active ) {
      if ( isCtrl ) return;
      ruler._onEndMeasurement(event);
    }

    // Conclude a select event
    else if ( event.data._selectState === 2 ) layer.selectObjects(event.data.coords);

    // Force flags to reset
    event.data._dragState = 0;
    event.data._selectState = 0;
  }

  /* -------------------------------------------- */

  /**
   * Handle right-mouse up events occuring on the Canvas stage or it's active layer
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onRightUp(event) {

    // First delegate the click to the active layer
    const layer = canvas.activeLayer;
    if ( layer._onRightUp ) layer._onRightUp(event);
    if ( event.stopped ) return;
    event.stopPropagation();

    // Reset drag state tracking
    event.data._dragState = 0;
  }

  /* -------------------------------------------- */

  /**
   * Handle window resizing with the dimensions of the window viewport change
   * @param {Event} event   The Window resize event
   * @private
   */
  _onResize(event) {
    if ( !this.ready ) return false;

    // Resize the renderer
    let w = window.innerWidth,
      h = window.innerHeight;
    this.app.renderer.view.style.width = w + "px";
    this.app.renderer.view.style.height = h + "px";
    this.app.renderer.resize(w, h);

    // Re-draw the canvas
    this.draw();
  }

  /* -------------------------------------------- */
  /* Zooming (Mouse Wheel)
  /* -------------------------------------------- */

  _onWheel(event) {
    let dz = ( event.deltaY < 0 ) ? 1.05 : 0.95;
    this.pan({scale: dz * canvas.stage.scale.x});
  }

  /* -------------------------------------------- */
  /*  Drag/Drop Events
  /* -------------------------------------------- */

  /**
   * The ondragover listener is required to make the canvas a valid drop-zone
   * @private
   */
  _onDragOver(event) {
    event.preventDefault();
    return false;
  }

  /* -------------------------------------------- */

  /**
   * Event handler for the drop portion of a drag-and-drop event.
   * @private
   */
  _onDrop(event) {
    event.preventDefault();

    // Try to extract the data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    }
    catch (err) {
      return false;
    }

    // Dropped Actor
    if ( data.type === "Actor" ) canvas.tokens._onDropActorData(event, data);
    
    // Dropped Journal Entry
    else if ( data.type === "JournalEntry" ) {
      let entry = game.journal.get(data.id);
      canvas.notes._onDropEntity(event, entry);
    }
  }
}

/**
 * An abstract pattern for primary layers of the game canvas to implement
 * @type {PIXI.Container}
 */
class CanvasLayer extends PIXI.Container {
  constructor() {
    super();

    /**
     * Track whether the canvas layer is currently active for interaction
     * @type {Boolean}
     */
    this._active = false;
  }

  /* -------------------------------------------- */
  /*  Properties and Attributes
  /* -------------------------------------------- */

  get name() {
    return this.constructor.name;
  }

  /* -------------------------------------------- */
  /*  Rendering
  /* -------------------------------------------- */

  /**
   * Draw the canvas layer, rendering its internal components and returning a Promise
   * The Promise resolves to the drawn layer once its contents are successfully rendered.
   * @return {Promise.<CanvasLayer>}
   */
  async draw() {

    // Clear existing layer contents
    this.removeChildren().forEach(c => c.destroy({children: true}));

    // Set basic dimensions
    const d = canvas.dimensions;
    this.width = d.width;
    this.height = d.height;
    this.hitArea = new PIXI.Rectangle(0, 0, d.width, d.height);
    return this;
  }

  /* -------------------------------------------- */
  /*  Methods
  /* -------------------------------------------- */

  activate() {
    canvas.stage.children.forEach(layer => layer.deactivate());
    this.interactive = false;
    this.interactiveChildren = true;
    this._active = true;
    if ( ui.controls ) ui.controls.activateLayer(this.constructor.name);
  }

  deactivate() {
    this.interactive = false;
    this.interactiveChildren = false;
    this._active = false;
  }
}
/**
 * A PlaceableObject base container class
 * @type {PIXI.Container}
 */
class PlaceableObject extends PIXI.Container {
  constructor(data, scene) {
    super();

    /**
     * The underlying data object which provides the basis for this placeable object
     * @type {Object}
     */
    this.data = data;

    /**
     * Retain a reference to the Scene within which this Placeable Object resides
     * @type {Scene}
     */
    this.scene = scene;

    /**
     * Track the field of vision for the placeable object.
     * This is necessary to determine whether a player has line-of-sight towards a placeable object or vice-versa
     * @type {PIXI.Polygon}
     */
    this.fov = null;

    /**
     * An indicator for whether the object is currently a hover target
     * @type {Boolean}
     * @private
     */
    this._hover = false;

    /**
     * An indicator for whether the object is currently controlled
     * @type {Boolean}
     * @private
     */
    this._controlled = false;

    /**
     * A control icon for interacting with the object
     * @type {ControlIcon}
     */
    this.controlIcon = null;
  }

  /* -------------------------------------------- */
  /* Properties
  /* -------------------------------------------- */

  /**
   * Provide a reference to the canvas layer which contains placeable objects of this type
   * @type {PlaceablesLayer}
   */
  static get layer() {
    throw new Error("A PlaceableObject subclass must provide a reference to the canvas layer which contains it.");
  }

  /**
   * Return a reference to the singleton layer instance which contains placeables of this type
   * @type {PlaceablesLayer}
   */
  get layer() {
    return canvas.stage.children.find(l => l.constructor.name === this.constructor.layer.name);
  }

  /**
   * This EmbeddedEntity ID of the underlying data object
   * @type {Number}
   */
  get id() {
    return this.data.id;
  }

  /**
   * The [x,y] coordinates of the placeable object within the Scene container
   * @type {Array}
   */
  get coords() {
    return [this.data.x, this.data.y];
  }

  /**
   * The central coordinate pair of the placeable object based on it's own width and height
   * @type {Object}
   */
  get center() {
    return {
      x: this.data.x,
      y: this.data.y
    }
  }

  /**
   * A Boolean flag for whether the current game User has permission to control this token
   * @type {Boolean}
   */
  get owner() {
    return game.user.isGM;
  }

  /**
   * A placeable object should define the logic to create
   * @type {Application}
   */
  get sheet() {
    throw new Error("A PlaceableObject subclass may optionally define a configuration sheet application.");
  }

  /* -------------------------------------------- */
  /* Rendering
  /* -------------------------------------------- */

  /**
   * Clear the display of the existing object
   */
  clear() {
    this.removeChildren().forEach(c => c.destroy({children: true}));
  }

  /* -------------------------------------------- */

  /**
   * Assume control over a PlaceableObject, flagging it as controlled and enabling downstream behaviors
   * @param {Boolean} multiSelect       Is this object being selected as part of a group?
   * @param {Boolean} releaseOthers     Release any other controlled objects first
   * @return {Boolean}                  A Boolean flag denoting whether or not control was successful.
   */
  control({multiSelect=false, releaseOthers=true}={}) {
    if (this._controlled) return true;
    if (releaseOthers) this.layer.releaseAll({resetSight: false});

    // Prevent control if the user is not an object owner
    if (!this.owner) return false;

    // Toggle control status
    this._controlled = true;
    this.layer._controlled[this.id] = this;

    // Shift the object to the top of the stack and refresh its display
    this.toFront();
    this.refresh();

    // Fire an on-control Hook
    Hooks.callAll("control"+this.constructor.name, this, this._controlled);
    return true;
  }

  /* -------------------------------------------- */

  /**
   * Release control over a PlaceableObject, removing it from the controlled set
   * @return {Boolean}                A Boolean flag confirming the object was released.
   */
  release() {
    if (!this._controlled) return true;
    this._controlled = false;
    delete this.layer._controlled[this.id];

    // Conceal any active HUD
    if ( this.layer.hud && (this.layer.hud.object === this) ) this.layer.hud.clear();

    // Refresh the object display
    this.refresh();

    // Fire an on-release Hook
    Hooks.callAll("control"+this.constructor.name, this, this._controlled);
    return true;
  }

  /* -------------------------------------------- */

  /**
   * Draw the placeable object into its parent container
   */
  draw() {
    throw new Error("A PlaceableObject subclass must define initial drawing procedure.");
  }

  /* -------------------------------------------- */

  refresh() {
    throw new Error("A PlaceableObject subclass must define an refresh drawing procedure.");
  }

  /* -------------------------------------------- */

  /**
   * Shift the PlaceableObject to the end of the rendering stack to display it above all other siblings
   */
  toFront() {
    this.parent.addChild(this.parent.removeChild(this));
  }

  /* -------------------------------------------- */

  /**
   * Shift the PlaceableObject to the beginning of the rendering stack to display it before all other siblings
   */
  toBack() {
    this.parent.addChildAt(this.parent.removeChild(this), 0);
  }

  /* -------------------------------------------- */

  /**
   * Clone the placeable object, returning a new object with identical attributes
   * The returned object is non-interactive, and has no assigned ID
   * If you plan to use it permanently you should call the create method
   *
   * @return {PlaceableObject}  A new object with identical data
   */
  clone() {
    let data = duplicate(this.data);
    data.id = null;
    let clone = new this.constructor(data);
    clone.interactive = false;
    return clone;
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers               */
  /* -------------------------------------------- */

  /**
   * Create a new Placeable Object using provided data
   *
   * @param {String} sceneId      The ID of the Scene within which to create the placeable object
   * @param {Object} data         The data with which to create the placeable object
   * @param {Object} options      Additional options which customize the creation workflow
   * @param {Boolean} options.displaySheet Render the object configuration sheet when created
   * @return {Promise}            A Promise resolving to the created PlaceableObject instance
   */
  static async create(sceneId, data, options={}) {
    const name = this.name,
          preHook = 'preCreate'+name,
          eventData = {parentId: sceneId, data: data};
    return SocketInterface.trigger('create'+name, eventData, options, preHook, this).then(response => {
      const object = this.layer._createPlaceableObject(response);
      if ( options.displaySheet ) object.sheet.render(true);
      return object;
    });
  }

  /* -------------------------------------------- */

  /**
   * Update an existing placeable object using provided data
   *
   * @param {String} sceneId      The ID of the Scene within which to update the placeable object
   * @param {Object} data         The data with which to update the placeable object
   * @param {Object} options      Additional options which customize the update workflow
   *
   * @return {Promise}            A Promise which resolves to the returned socket response (if successful)
   */
  async update(sceneId, data, options={}) {
    const name = this.constructor.name,
          preHook = 'preUpdate'+name;

    // Diff the update data
    delete data.id;
    let changed = {};
    for (let [k, v] of Object.entries(data)) {
      let c = getProperty(this.data, k);
      if ( c !== v ) changed[k] = v;
    }
    if ( !Object.keys(changed).length ) return Promise.resolve(this);
    changed.id = this.id;

    // Trigger the socket event and handle response
    const eventData = {parentId: sceneId, data: changed};
    await SocketInterface.trigger('update'+name, eventData, options, preHook, this).then(response => {
      return this.constructor.layer._updatePlaceableObject(response);
    });
  }

  /* -------------------------------------------- */

  /**
   * Delete an existing placeable object within a specific Scene
   *
   * @param {String} sceneId      The ID of the Scene within which to update the placeable object
   * @param {Object} options      Additional options which customize the deletion workflow
   *
   * @return {Promise}            A Promise which resolves to the returned socket response (if successful)
   */
  async delete(sceneId, options={}) {
    const name = this.constructor.name,
          preHook = 'preDelete'+name,
          eventData = {parentId: sceneId, childId: this.id};
    return SocketInterface.trigger('delete'+name, eventData, options, preHook, this).then(response => {
      return this.constructor.layer._deletePlaceableObject(response);
    });
  }

  /* -------------------------------------------- */

  /**
   * Define additional steps taken when a new placeable object of this type is first created
   * @private
   */
  _onCreate(sceneId, data) {
    this.draw();
  }

  /* -------------------------------------------- */

  /**
   * Define additional steps taken when an existing placeable object of this type is updated with new data
   * @private
   */
  _onUpdate(sceneId, data) {
    this.draw();
  }

  /* -------------------------------------------- */

  /**
   * Define additional steps taken when an existing placeable object of this type is deleted
   * @private
   */
  _onDelete(sceneId) {
    this.release();
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Handle mouse-over events which trigger a hover
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onMouseOver(event) {
    if ( this._hover === true ) return false;
    const layer = this.layer;

    // Register hover state, and strip that state from other placeables
    const oe = event instanceof PIXI.interaction.InteractionEvent ? event.data.originalEvent : event;
    if ( !oe.altKey ) layer.placeables.filter(o => o.id !== this.id && o._hover).forEach(o => o._onMouseOut(event));
    this._hover = true;
    layer._hover = this;

    // Refresh object display
    if ( this.controlIcon ) this.controlIcon.border.visible = true;
    if ( this.refresh ) this.refresh();

    // Fire an on-hover Hook
    Hooks.callAll("hover"+this.constructor.name, this, this._hover);
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse-out events after a hover
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onMouseOut(event) {
    if ( this._hover !== true ) return false;

    // Deregister the hover state from this object
    this._hover = false;
    this.layer._hover = null;

    // Refresh object display
    if ( this.controlIcon ) this.controlIcon.border.visible = false;
    if ( this.refresh ) this.refresh();

    // Fire an off-hover Hook
    Hooks.callAll("hover"+this.constructor.name, this, this._hover);
  }

  /* -------------------------------------------- */

  /**
   * Default handling for Placeable mouse-move event during a drag workflow
   * @private
   */
  async _onMouseMove(event) {
    let {handleState, origin, clone} = event.data,
      dest = event.data.getLocalPosition(this.layer),
      dx = dest.x - origin.x,
      dy = dest.y - origin.y;

    // Create the clone container
    if (handleState === 0 && ( Math.hypot(dx, dy) >= canvas.dimensions.size / (this.layer.gridPrecision * 2) )) {
      event.data.handleState = handleState = 1;
      clone = await this.clone().draw();
      this.layer.preview.addChild(clone);
      event.data.clone = clone;
      clone.alpha = 0.8;
      this.alpha = 0.4;
    }

    // Update the clone position
    if (handleState > 0) {
      if ( !clone ) return;
      clone.data.x = this.data.x + dx;
      clone.data.y = this.data.y + dy;
      clone.refresh();
    }
  }

  /* -------------------------------------------- */

  /**
   * Default handling for Placeable mouse-up event concluding a drag workflow
   * @private
   */
  _onMouseUp(event) {
    let {origin, destination, handleState, originalEvent} = event.data;
    if ( handleState === 0 ) return;

    // Update final coordinates
    let dx = destination.x - origin.x,
        dy = destination.y - origin.y;
    let snap = !originalEvent.shiftKey;
    if ( snap) destination = canvas.grid.getSnappedPosition(this.data.x + dx, this.data.y + dy, this.layer.gridPrecision);
    else destination = {x: this.data.x + dx, y: this.data.y + dy};

    // Update data
    this.update(canvas.scene._id, destination).then(p => this._onDragCancel(event));
  }

  /* -------------------------------------------- */

  /**
   * Default handling for Placeable double left-click event
   * @private
   */
  _onDoubleLeft(event) {
    this.sheet.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Default handling for Placeable drag cancel through right-click
   * @private
   */
  _onDragCancel(event) {
    this.layer.preview.removeChildren();
    this.alpha = 1.0;
  }
}
/**
 * The base PlaceablesLayer subclass of CanvasLayer
 * @type {CanvasLayer}
 */
class PlaceablesLayer extends CanvasLayer {
  constructor() {
    super();

    /**
     * Placeable Layer Objects
     * @type {PIXI.Container}
     */
    this.objects = null;

    /**
     * Preview Object Placement
     */
    this.preview = null;

    /**
     * Keep track of history so that CTRL+Z can undo changes
     * @type {Array}
     */
    this.history = [];

    /**
     * Track the PlaceableObject on this layer which is currently being hovered upon
     * @type {PlaceableObject}
     */
    this._hover = null;

    /**
     * Track the set of PlaceableObjects on this layer which are currently controlled by their id
     * @type {Object}
     */
    this._controlled = {};

    /**
     * Keep track of an object copied with CTRL+C which can be pasted later
     * @type {Array}
     */
    this._copy = [];

    /**
     * Does this layer support a drag-creation workflow?
     * @type {Boolean}
     */
    this._canDragCreate = true;
  }

  /* -------------------------------------------- */

  /**
   * Return a reference to the active instance of this canvas layer
   * @type {PlaceablesLayer}
   */
  static get instance() {
    return canvas.stage.children.find(l => l.constructor.name === this.name);
  }

  /**
   * Define the named Array within Scene.data containing the placeable objects displayed in this layer
   * @type {String}
   */
  static get dataArray() {
    throw new Error("A PlaceablesLayer subclass must define the array of placeable object data it contains");
  }

  /**
   * Define a Container implementation used to render placeable objects contained in this layer
   * @type {PIXI.Container}
   */
  static get placeableClass() {
    throw new Error("A PlaceablesLayer subclass must define the Container implementation used to display placeables.")
  }

  /**
   * Return the precision relative to the Scene grid with which Placeable objects should be snapped
   * @return {Number}
   */
  get gridPrecision() {
    return 2;
  }

  /**
   * If objects on this PlaceableLayer have a HUD UI, provide a reference to its instance
   * @type {BasePlaceableHUD|null}
   */
  get hud() {
    return null;
  }

  /* -------------------------------------------- */

  /**
   * A convenience method for accessing the placeable object instances contained in this layer
   * @type {Array}
   */
  get placeables() {
    if ( !this.objects ) return [];
    return this.objects.children;
  }

  /* -------------------------------------------- */

  /**
   * An Array of placeable objects in this layer which have the _controlled attribute
   * @return {Array.<PlaceableObject>}
   */
  get controlled() {
    if ( !this.objects ) return [];
    return this.placeables.filter(p => p._controlled);
  }

  /* -------------------------------------------- */
  /*  Rendering
  /* -------------------------------------------- */

  /**
   * Draw the PlaceablesLayer.
   * Draw each Sound within the scene as a child of the sounds container.
   */
  async draw() {
    await super.draw();

    // Reset history
    this.history = [];

    // Create objects container
    this.objects = this.addChild(new PIXI.Container());

    // Create preview container
    this.preview = this.addChild(new PIXI.Container());

    // Create and draw placeable objects
    let objectData = canvas.scene.data[this.constructor.dataArray];
    for ( let data of objectData ) {
      let obj = await this.drawObject(data);
      this.objects.addChild(obj);
    }
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Draw a single placeable object
   */
  drawObject(data) {
    let obj = new this.constructor.placeableClass(data, canvas.scene);
    return obj.draw();
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /**
   * Override the activation behavior of the PlaceablesLayer.
   * While active, ambient sound previews are displayed.
   */
  activate() {
    super.activate();
    if ( this.objects ) this.objects.visible = true;
  }

  /**
   * Override the deactivation behavior of the PlaceablesLayer.
   * When inactive, ambient sound previews are hidden from view.
   */
  deactivate() {
    super.deactivate();
    if ( this.objects ) this.objects.visible = false;
    if ( this.preview ) this.preview.removeChildren();
  }

  /**
   * Get a PlaceableObject contained in this layer by it's ID
   * @param {Number} objectId   The ID of the contained object to retrieve
   * @return {PlaceableObject}  The object instance, or undefined
   */
  get(objectId) {
    objectId = Number(objectId);
    return this.placeables.find(t => t.id === objectId);
  }

  /* -------------------------------------------- */

  /**
   * Release all controlled PlaceableObject instance from this layer.
   * @param {Object} options    Additional options which customize the Object releasing behavior
   * @return {Number}           The number of PlaceableObject instances which were released
   */
  releaseAll(options) {
    const controlled = this.placeables.filter(t => t._controlled);
    controlled.forEach(obj => obj.release(options));
    return controlled.length;
  }

  /* -------------------------------------------- */

  /**
   * Undo a change to the objects in this layer
   * This method is typically activated using CTRL+Z while the layer is active
   * @return {Promise}
   */
  undoHistory() {
    if ( !this.history.length ) return Promise.reject("No more tracked history to undo!");
    let event = this.history.pop();

    // Undo creation with deletion
    if ( event.type === "create" ) {
      let obj = this.get(event.data.id);
      if ( !obj ) return Promise.reject("The created object no longer exists to undo");
      return obj.delete(canvas.scene._id).then(() => this.history.pop());
    }

    // Undo update with update
    else if ( event.type === "update" ) {
      let obj = this.get(event.data.id);
      if ( !obj ) return Promise.reject("The updated object no longer exists to undo");
      return obj.update(canvas.scene._id, event.data).then(() => this.history.pop());
    }

    // Undo deletion with creation
    else if ( event.type === "delete" ) {
      let cls = this.constructor.placeableClass;
      return cls.create(canvas.scene._id, event.data).then(() => this.history.pop());
    }
  }

  /* -------------------------------------------- */

  /**
   * Record a new CRUD event in the history log so that it can be undone later
   * @param {String} type   The event type (create, update, delete)
   * @param {Object} data   The object data
   * @private
   */
  _storeHistory(type, data) {
    if ( this.history.length >= 10 ) this.history.shift();
    this.history.push({
      type: type,
      data: data
    });
  }

  /* -------------------------------------------- */

  /**
   * Copy currently controlled PlaceableObjects to a temporary Array, ready to paste back into the scene later
   * @returns {Array}   The Array of copied Objects
   */
  copyObjects() {
    const controlled = this.controlled;
    if ( !controlled.length && !this._hover ) return [];

    // Prefer controlled objects
    if ( controlled.length ) {
      this._copy = controlled.map(p => duplicate(p.data));
    }

    // Fall-back to hovered objects
    else this._copy = [duplicate(this._hover.data)];

    // Notify
    let name = this.constructor.placeableClass.name;
    ui.notifications.info(`Copied data for ${this._copy.length} ${name} objects.`);
    return this._copy;
  }

  /* -------------------------------------------- */

  /**
   * A helper method to prompt for deletion of all PlaceableObject instances within the Scene
   * Renders a confirmation dialogue to confirm with the requester that all objects will be deleted
   */
  deleteAll() {
    const cls = this.constructor.placeableClass;
    if ( !game.user.isGM ) {
      throw new Error(`You do not have permission to delete ${cls.name} placeables from the Scene.`);
    }
    new Dialog({
      title: "Clear All Objects",
      content: `<p>Clear all ${cls.name} objects from this Scene?</p>`,
      buttons: {
        yes: {
          icon: '<i class="fas fa-trash"></i>',
          label: "Yes",
          callback: () => canvas.scene.update({[this.constructor.dataArray]: []})
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: "No"
        }
      },
      default: "yes"
    }).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Paste currently copied PlaceableObjects back to the layer by creating new copies
   * @return {Promise.<Array>}      An Array of created Objects
   */
  async pasteObjects(position) {
    if ( !this._copy.length ) return;
    const cls = this.constructor.placeableClass;

    // Adjust the position for half a grid space
    position.x -= canvas.dimensions.size / 2;
    position.y -= canvas.dimensions.size / 2;

    // Get the left-most object in the set
    this._copy.sort((a, b) => a.x - b.x);
    let base = this._copy[0];
    let [x0, y0] = [base.x, base.y];

    // Iterate over objects
    const created = [];
    for ( let o of this._copy ) {
      let snapped = canvas.grid.getSnappedPosition(position.x + (o.x - x0), position.y + (o.y - y0), 1);
      o.x = snapped.x;
      o.y = snapped.y;
      delete o.id;
      let obj = await cls.create(canvas.scene._id, o);
      created.push(obj);
    }

    // Notify and return
    ui.notifications.info(`Pasted data for ${this._copy.length} ${cls.name} objects.`);
    return created;
  }

  /* -------------------------------------------- */

  /**
   * Select all PlaceableObject instances which fall within a coordinate rectangle.
   *
   * @param {Number} x      The top-left x-coordinate of the selection rectangle
   * @param {Number} y      The top-left y-coordinate of the selection rectangle
   * @param {Number} width  The width of the selection rectangle
   * @param {Number} height The height of the selection rectangle
   * @return {Number}       The number of PlaceableObject instances which were controlled.
   */
  selectObjects({x, y, width, height}) {
    this.releaseAll(false);
    const controllable = this.placeables.filter(obj => obj.visible && (obj.control instanceof Function));
    controllable.forEach(obj => {
      let c = obj.center;
      if ( c.x.between(x, x + width) && c.y.between(y, y + height)) obj.control({releaseOthers: false});
    });
    canvas.controls.select.clear();
    return controllable.length;
  }


  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers               */
  /* -------------------------------------------- */

  /**
   * Activate socket listeners which transact basic CRUD operations for placeables contained within this layer
   * @private
   */
  static socketListeners(socket) {
    let name = this.placeableClass.name;
    socket.on(`create${name}`, this._createPlaceableObject.bind(this))
          .on(`update${name}`, this._updatePlaceableObject.bind(this))
          .on(`delete${name}`, this._deletePlaceableObject.bind(this))
  }

  /* -------------------------------------------- */

  /**
   * Create a new placeable object given input data
   * @param {String} parentId     The parent Scene ID
   * @param {Object} created      The created PlaceableObject data
   * @return {PlaceableObject}    The created PlaceableObject instance
   * @private
   */
  static _createPlaceableObject({parentId, created}) {
    const cls = this.placeableClass;

    // Get the Scene
    const scene = game.scenes.get(parentId);
    if (!scene) throw new Error(`Parent Scene ${parentId} not found`);

    // Push the created data to the child collection
    const objects = scene.data[this.dataArray];
    objects.push(created);
    console.log(`${vtt} | Created ${cls.name} ${created.id} in Scene ${scene._id}`);

    // Create the object instance
    const object = new cls(created, scene);
    if (scene.isView) {
      this.instance.objects.addChild(object);
      this.instance._storeHistory("create", duplicate(object.data));
      object._onCreate(scene._id, created);
    }

    // Call Hooks and return the created Object
    Hooks.callAll('create'+cls.name, object, parentId, created);
    return object;
  }

  /* -------------------------------------------- */

  /**
   * Update an existing placeable object using new data
   * @param {String} parentId     The parent Scene ID
   * @param {Object} updated      The updated PlaceableObject data
   * @return {PlaceableObject}    The updated PlaceableObject instance
   */
  static _updatePlaceableObject({parentId, updated}) {
    let name = this.placeableClass.name;

    // Get the Scene and update the underlying data
    let scene = game.scenes.get(parentId),
      collection = scene.data[this.dataArray],
      original = collection.find(o => o.id === Number(updated.id));

    // Store history record
    if ( scene.isView ) this.instance._storeHistory("update", duplicate(original));

    // Update object data
    mergeObject(original, updated, {inplace: true});

    // Update the viewed scene
    if ( !scene.isView ) return null;
    let object = this.instance.get(updated.id);
    if ( !object ) return null;

    object.data = original;
    object._onUpdate(parentId, updated);
    Hooks.callAll('update'+name, object, parentId, updated);
    return object;
  }

  /* -------------------------------------------- */

  /**
   * Delete an existing placeable object by its ID within the Scene
   *
   * @param {String} parentId   The ID of the Scene which contains this placeable object
   * @param {Number} deleted    The ID of the PlaceableObject to delete
   * @return {PlaceableObject}  The deleted PlaceableObject instance
   */
  static _deletePlaceableObject({parentId, deleted}) {
    let name = this.placeableClass.name;

    // Get the Scene and update the underlying data
    let scene = game.scenes.get(parentId),
        collection = scene.data[this.dataArray],
        idx = collection.findIndex(o => o.id === Number(deleted));

    // Delete the object from the parent data
    if (idx !== -1) {
      collection.splice(idx, 1);
      console.log(`${vtt} | Deleted ${name} ${deleted} from Scene ${scene._id}`);
    }

    // Update the Scene
    if ( !scene.isView ) return null;
    let object = this.instance.get(deleted);
    if ( !object ) return null;

    this.instance._storeHistory("delete", duplicate(object.data));
    this.instance.objects.removeChild(object);
    object._onDelete(parentId, deleted);
    Hooks.callAll('delete'+name, object, parentId, deleted);
    return object;
  }

  /* -------------------------------------------- */

  /**
   * Handle the simultaneous updating of multiple PlaceableObjects when a Scene is updated
   * Note that this method ONLY needs to execute for the currently viewed Scene.
   *
   * @param {String} sceneId          The Scene within which the objects are being updated
   * @param {Array.<Object>} objects  An Array of objects which should be used for the Scene
   * @private
   */
  _onUpdateMany(sceneId, objects) {

    // Get the Scene to update
    const scene = game.scenes.get(sceneId);
    if ( !scene || !scene.isView ) return;

    // Get all the current objects for the Scene
    const current = this.placeables,
          updated = new Set();

    // Start with the objects that were provided
    for ( let object of objects ) {
      let placeable = this.get(object.id);

      // If the object does not currently exist, it needs to be created
      if ( !placeable ) {
        this.constructor._createPlaceableObject({parentId: sceneId, created: object});
        continue;
      }

      // Otherwise difference it against the current data
      let diff = diffObject(placeable.data, object);
      if ( Object.keys(diff).length ) {
        diff['id'] = object.id;
        this.constructor._updatePlaceableObject({parentId: sceneId, updated: diff});
      }
      updated.add(object.id);
    }

    // Any current objects which were not updated or created should be deleted
    current.filter(c => !updated.has(c.id)).forEach(c => {
      this.constructor._deletePlaceableObject({parentId: sceneId, deleted: c.id});
    });
  }

  /* -------------------------------------------- */

  /**
   * Default mouse-down event handling implementation
   * @private
   */
  _onMouseDown(event, {isRuler, isCtrlRuler, isSelect}={}) {

    // Clear active HUD
    if ( this.hud ) this.hud.clear();

    // Release controlled objects
    if ( [isRuler, isCtrlRuler, isSelect].includes(true) ) return;
    this.releaseAll();

    // Perhaps begin a drag-creation workflow
    if ( this._canDragCreate ) {
      event.stopPropagation();
      if ( event.data.createState > 0 ) return;
      event.data.createState = 0;
      this._onDragStart(event);
    }
  }

  /* -------------------------------------------- */

  /**
   * Default handling of drag start events by left click + dragging
   * @private
   */
  _onDragStart(event) {
    event.stopPropagation();
    event.data.origin = event.data.getLocalPosition(this);
    if ( this.preview ) this.preview.removeChildren();
    canvas.app.view.oncontextmenu = ev => this._onDragCancel(event);
    event.data.createState = 1;
  }

  /* -------------------------------------------- */

  /**
   * Default handling of mouse move events during a dragging workflow
   * @private
   */
  _onMouseMove(event) {
    if ( event.data.createState >= 1 ) {
      event.stopPropagation();
      event.data.destination = event.data.getLocalPosition(this);
    }
  }

  /* -------------------------------------------- */

  /**
   * Default handling of drag cancel events by right clicking during a drag creation
   * @private
   */
  _onDragCancel(event) {
    if ( this.preview ) this.preview.removeChildren();
    this.off("mousemove", this._onMouseMove);
    canvas.app.view.oncontextmenu = null;
    event.data.createState = 0;
    event.data.object = null;
  }

  /* -------------------------------------------- */

  /**
   * Handle successful creation of an object through the drag creation workflow.
   * This logic requires that the drag exceeded some minimum distance for the new object to be created.
   * @private
   */
  _onDragCreate(event) {
    let distance = Math.hypot(event.data.destination.x - event.data.origin.x,
                              event.data.destination.y - event.data.origin.y);
    if (distance >= canvas.dimensions.size / 2) {
      this.constructor.placeableClass.create(canvas.scene._id, event.data.object.data);
    }
    this._onDragCancel(event);
  }

  /* -------------------------------------------- */

  /**
   * Default handling of mouse-up events which conclude a new object creation after dragging
   * @private
   */
  _onMouseUp(event) {
    const cs = event.data.createState;
    if ( cs === 2 ) {
      event.stopPropagation();
      this._onDragCreate(event);
      event.data.createState = 0;
    }
    else if ( cs === 1 ) {
      event.stopPropagation();
      this._onDragCancel(event);
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle right mouse-click events which occur while this layer is active
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onRightDown(event) {
    if ( this.hud ) this.hud.clear();
  }

  /* -------------------------------------------- */

  /**
   * Handle a DELETE keypress while a placeable object is hovered
   * @private
   */
  _onDeleteKey(event) {
    if ( this._hover !== null ) {
      event.preventDefault();
      this._hover.delete(canvas.scene._id);
      this._hover = null;
    }
  }
}

jQuery.fn.shake = function(shakes, distance, duration) {
  if (shakes > 0) {
    this.each(function () {
      let $el = $(this);
      let left = $el.css('left');
      $el.animate({left: "-=" + distance}, duration, function () {
        $el.animate({left: "+=" + distance * 2}, duration, function () {
          $el.animate({left: left}, duration, function () {
            $el.shake(shakes - 1, distance, duration);
          });
        });
      });
    });
  }
  return this;
};

/**
 * Display a right-click activated Context Menu which provides a dropdown menu of options
 * A ContextMenu is constructed by designating a parent HTML container and a target selector
 * An Array of menuItems defines the entries of the menu which is displayed
 * 
 * @param {HTMLElement|jQuery} element    The containing HTML element within which the menu is positioned
 * @param {String} selector               A CSS selector which activates the context menu.
 * @param {Array.<menuItem>} menuItems    An Array of entries to display in the menu
 * @param {String} eventName              Optionally override the triggering event which can spawn the menu
 *
 * @param {Object} menuItem               Menu items in the array can have the following properties
 * @param {String} menuItem.name          The displayed item name
 * @param {String} menuItem.icon          An icon glyph HTML string
 * @param {Function} menuItem.condition   A function which returns a Boolean for whether or not to display the item
 * @param {Function} menuItem.callback    A callback function to trigger when the entry of the menu is clicked
 */
class ContextMenu {
  constructor(element, selector, menuItems, {eventName="contextmenu"}={}) {
    this.element = element;
    this.selector = selector || element.attr("id");
    this.eventName = eventName;
    
    // Backwards compatibility for the old Object style menuItems
    if ( !( menuItems instanceof Array) ) {
      console.warn(`[DEPRECATION WARNING] You are using the old format menuItems in the ContextMenu for selector ${selector}`);
      for ( let [k, v] of Object.entries(menuItems) ) v.name = k;
      menuItems = Object.values(menuItems);
    }
    this.menuItems = menuItems;

    // Bind to the current element
    this.bind();
  }

  /* -------------------------------------------- */

  get menu() {
    return $("#context-menu");
  }

  /* -------------------------------------------- */

  /**
   * Attach a ContextMenu instance to an HTML selector
   */
  bind() {
    this.element.on(this.eventName, this.selector, event => {
      event.preventDefault();
      let parent = $(event.currentTarget),
          menu = this.menu;

      // Remove existing context UI
      $('.context').removeClass("context");

      // Close the current context
      if ( $.contains(parent[0], menu[0]) ) this.close();

      // If the new target element is different
      else {
        this.render(parent);
        ui.context = this;
      }
    })
  }

  /* -------------------------------------------- */

  /**
   * Render the Context Menu by iterating over the menuItems it contains
   * Check the visibility of each menu item, and only render ones which are allowed by the item's logical condition
   * Attach a click handler to each item which is rendered
   * @param target
   */
  render(target) {
    let html = $("#context-menu").length ? $("#context-menu") : $('<nav id="context-menu"></nav>');
    let ol = $('<ol class="context-items"></ol>');
    html.html(ol);

    // Build menu items
    for (let item of this.menuItems) {

      // Determine menu item visibility (display unless false)
      let display = true;
      if ( item.condition !== undefined ) {
        display = ( item.condition instanceof Function ) ? item.condition(target) : item.condition;
      }
      if ( !display ) continue;

      // Construct and add the menu item
      let name = game.i18n.localize(item.name);
      let li = $(`<li class="context-item">${item.icon}${name}</li>`);
      li.click(e => {
        e.preventDefault();
        e.stopPropagation();
        item.callback(target);
        this.close();
      });
      ol.append(li);
    }

    // Bail out if there are no children
    if ( ol.children().length === 0 ) return;

    // Append to target and slide down
    target.css('position', 'relative');
    target.append(html);
    target.addClass("context");
    html.hide().slideDown(200);
  }

  /* -------------------------------------------- */

  /**
   * Animate closing the menu by sliding up and removing from the DOM
   */
  close() {
    let menu = this.menu;
    menu.slideUp(200, () => {
      menu.remove();
      $('.context').removeClass("context");
      delete ui.context;
    });
  }

  /* -------------------------------------------- */

  static eventListeners() {
    document.addEventListener("click", ev => {
      if ( ui.context ) ui.context.close();
    });
  };
}

/* -------------------------------------------- */

/**
 * Create a modal dialog window displaying a title, a message, and a set of buttons which trigger callback functions.
 * @type {Application}
 *
 * @param dialogData {Object}           An object of dialog data which configures how the modal window is rendered
 * @param dialogData.title {String}     The window title
 * @param dialogData.content {String}   HTML content
 * @param dialogData.close {Function}   Common callback operations to perform when the dialog is closed
 * @param dialogData.buttons {Object}   Action buttons which trigger callback functions.
 *                                      Buttons are defined as an Object with the format ``{name: buttonData}``.
 *                                      Valid keys for buttonData include:
 *
 * @param dialogData.buttons.button.icon {String} A button icon
 * @param dialogData.buttons.button.label {String} A button label
 * @param dialogData.buttons.button.callback {Function} A callback function taking no arguments
 *
 * @param options {Object}              Dialog rendering options, see :class:`Application`
 * @param options.default               The name of the default button which should be triggered on Enter
 *
 * @example
 * let d = new Dialog({
 *  title: "Test Dialog",
 *  content: "<p>You must choose either Option 1, or Option 2</p>",
 *  buttons: {
 *   one: {
 *    icon: '<i class="fas fa-check"></i>',
 *    label: "Option One",
 *    callback: () => console.log("Chose One")
 *   },
 *   two: {
 *    icon: '<i class="fas fa-times"></i>',
 *    label: "Option Two",
 *    callback: () => console.log("Chose Two")
 *   }
 *  },
 *  default: "two",
 *  close: () => console.log("This always is logged no matter which option is chosen")
 * });
 * d.render(true);
 */
class Dialog extends Application {
  constructor(dialogData, options) {
    super(options);
    this.data = dialogData;
  }

	/* -------------------------------------------- */

  /**
   * Assign the default options which are supported by this Application
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.template = "templates/hud/dialog.html";
	  options.classes = ["dialog"];
	  options.width = 400;
	  return options;
  }

  /* -------------------------------------------- */

  get title() {
    return this.data.title || "Dialog";
  }

  /* -------------------------------------------- */

  getData() {
    let buttons = Object.keys(this.data.buttons).reduce((obj, key) => {
      let b = this.data.buttons[key];
      if ( b.condition !== false ) obj[key] = b;
      return obj;
    }, {});
    return {
      content: this.data.content,
      buttons: buttons
    }
  }

  /* -------------------------------------------- */

  activateListeners(html) {
    html.find(".dialog-button").click(ev => {
      let id = ev.currentTarget.getAttribute("data-button"),
          button = this.data.buttons[id];
      this._submit(button, html);
    });

    // Default choice selection
    $(document).on('keydown.chooseDefault', ev => {
      if ( ev.keyCode === KEYS.ENTER && this.data.default ) {
        ev.preventDefault();
        this._submit(this.data.buttons[this.data.default], html);
      }
    });
  }

  /* -------------------------------------------- */

  _submit(button, html) {
    try {
      if (button.callback) button.callback(html);
      if ( this.data.close ) this.data.close(html);
      this.close();
    } catch(err) {
      ui.notifications.error(err);
      throw new Error(err);
    }
  }

  /* -------------------------------------------- */

  close() {
    super.close();
    $(document).off('keydown.chooseDefault');
  }

}

/* -------------------------------------------- */

/**
 * A UI utility to make an element draggable.
 */
class Draggable {
  constructor(app, element, handle, resizable) {

    // Setup element data
    this.app = app;
    this.element = element[0];
    this.handle = handle || this.element;

    /**
     * Duplicate the application's starting position to track differences
     * @type {Object}
     */
    this.position = null;

    /**
     * Remember event handlers associated with this Draggable class so they may be later unregistered
     * @type {Object}
     */
    this.handlers = {};

    // Initialize draggable state
    this._initializeDrag();

    // Initialize resiable state
    if ( resizable ) this._initializeResize();
  }

  /* ----------------------------------------- */

  _initializeDrag() {

    // Register handlers
    this.handlers["dragDown"] = ["mousedown", e => this._onDragMouseDown(e), false];
    this.handlers["dragMove"] = ["mousemove", e => this._onDragMouseMove(e), false];
    this.handlers["dragUp"] = ["mouseup", e => this._onDragMouseUp(e), false];

    // Attach the click handler and CSS class
    this.handle.addEventListener(...this.handlers.dragDown);
    this.handle.classList.add("draggable");
  }

  /* ----------------------------------------- */

  _initializeResize() {

    // Create the handle;
    let handle = $('<div class="window-resizable-handle"><i class="fas fa-arrows-alt-h"></i></div>')[0];
    this.element.appendChild(handle);

    // Register handlers
    this.handlers["resizeDown"] = ["mousedown", e => this._onResizeMouseDown(e), false];
    this.handlers["resizeMove"] = ["mousemove", e => this._onResizeMouseMove(e), false];
    this.handlers["resizeUp"] = ["mouseup", e => this._onResizeMouseUp(e), false];

    // Attach the click handler and CSS class
    handle.addEventListener(...this.handlers.resizeDown);
    this.handle.classList.add("resizable");
  }

  /* ----------------------------------------- */

  /**
   * Handle the initial mouse click which activates dragging behavior for the application
   * @private
   */
  _onDragMouseDown(event) {
    event.preventDefault();

    // Float the window to a higher z-index
    this._floatToTop();

    // Record initial position
    this.position = duplicate(this.app.position);
    this._initial = {x: event.clientX, y: event.clientY};

    // Add temporary handlers
    window.addEventListener(...this.handlers.dragMove);
    window.addEventListener(...this.handlers.dragUp);
  }

  /* ----------------------------------------- */

  /**
   * Move the window with the mouse, bounding the movement to ensure the window stays within bounds of the viewport
   * @private
   */
  _onDragMouseMove(event) {
    event.preventDefault();
    this.app.setPosition({
      left: this.position.left + (event.clientX - this._initial.x),
      top: this.position.top + (event.clientY - this._initial.y)
    });
  }

  /* ----------------------------------------- */

  /**
   * Conclude the dragging behavior when the mouse is release, setting the final position and removing listeners
   * @private
   */
  _onDragMouseUp(event) {
    event.preventDefault();
    window.removeEventListener(...this.handlers.dragMove);
    window.removeEventListener(...this.handlers.dragUp);
  }

  /* ----------------------------------------- */

  /**
   * Handle the initial mouse click which activates dragging behavior for the application
   * @private
   */
  _onResizeMouseDown(event) {
    event.preventDefault();

    // Float the window to a higher z-index
    this._floatToTop();

    // Record initial position
    this.position = duplicate(this.app.position);
    if ( this.position.height === "auto" ) this.position.height = this.element.clientHeight;
    if ( this.position.width === "auto" ) this.position.width = this.element.clientWidth;
    this._initial = {x: event.clientX, y: event.clientY};

    // Add temporary handlers
    window.addEventListener(...this.handlers.resizeMove);
    window.addEventListener(...this.handlers.resizeUp);
  }

  /* ----------------------------------------- */

  /**
   * Move the window with the mouse, bounding the movement to ensure the window stays within bounds of the viewport
   * @private
   */
  _onResizeMouseMove(event) {
    event.preventDefault();
    this.app.setPosition({
      width: this.position.width + (event.clientX - this._initial.x),
      height: this.position.height + (event.clientY - this._initial.y)
    });
  }

  /* ----------------------------------------- */

  /**
   * Conclude the dragging behavior when the mouse is release, setting the final position and removing listeners
   * @private
   */
  _onResizeMouseUp(event) {
    event.preventDefault();
    window.removeEventListener(...this.handlers.resizeMove);
    window.removeEventListener(...this.handlers.resizeUp);
    this.app._onResize(event);
  }

  /* ----------------------------------------- */

  _floatToTop() {
    let z = Number(window.document.defaultView.getComputedStyle(this.element).zIndex);
    if ( z <= _maxZ ) {
      this.element.style.zIndex = ++_maxZ;
    }
  }

}

createEditor = function(options, initialContent) {
  let defaultOptions = {
    branding: false,
    menubar: false,
    statusbar: false,
    plugins: 'lists image table hr code save',
    //toolbar: 'styleselect bullist numlist image table hr removeformat entityLink code save',
    toolbar: 'styleselect bullist numlist image table hr removeformat code save',
    content_css: "css/mce.css",
    save_enablewhendirty: true,
    table_default_styles: {},

    // Style Dropdown Formats
    style_formats: [
      {
        title: "Custom",
        items: [
          {
            title: "Secret",
            block: 'section',
            classes: 'secret',
            wrapper: true
          }
        ]
      }
    ],
    style_formats_merge: true,

    // Bind callback events
    init_instance_callback: editor => {
      const window = editor.getWin();

      // Set initial content
      if ( initialContent ) editor.setContent(initialContent);

      // editor.addButton("entityLink", {
      //   icon: "user",
      //   tooltip: "Link Entity",
      //   onclick: function() {
      //     console.log("DO THE LINK BUTTON");
      //     console.log(game);
      //   }
      // });

      // Prevent window zooming
      window.addEventListener("wheel", event => {
        if ( event.ctrlKey ) event.preventDefault();
      }, {passive: false});
    }
  };
  return tinyMCE.init(mergeObject(defaultOptions, options));
};




enrichHTML = function(content, {secrets=false, entities=true}={}) {
  let html = document.createElement("div");
  html.innerHTML = content;

  // Strip secrets
  if ( !secrets ) {
    let elements = html.querySelectorAll("section.secret");
    elements.forEach(e => e.parentNode.removeChild(e));
  }

  // Match entities
  if ( entities ) {
    let entitiesRgx = /@(Actor|Item|JournalEntry|Scene)\[([\w\s'".\-]+)\]/g;
    html.innerHTML = html.innerHTML.replace(entitiesRgx, _replaceEntity);
  }
  return html.innerHTML;
};


/**
 * Replace a matched Entity Link with an actual HTML link to that entity
 * Be failure-tolerant, allowing for the possibility that the entity does not exist
 * @return {String}   The replacement string
 */
_replaceEntity = function(match, entityName, value, string) {
  const config = CONFIG[entityName];
  const collection = config.entityClass.collection;
  const entity = collection.entities.find(e => e.data.name === value);
  if ( !entity ) return match;
  let icon = config.sidebarIcon;
  return `<a class="entity-link" data-entity=${entityName} data-id=${entity._id}><i class="${icon}"></i> ${entity.name}</a>`;
};

/**
 * TODO
 */
class FilePicker extends Application {
  constructor(options={}) {
    super(options);

    /**
     * The current base folder relative to which files are being browsed
     */
    this.baseDir = this._getCurrentDirectory(options.current);

    /**
     * The general file type which controls the set of extensions which will be accepted
     * @type {String}
     */
    this.type = options.type;

    /**
     * The current set of file extensions which are being filtered upon
     * @type {Array}
     */
    this.extensions = this.getExtensions(this.type);

    /**
     * Subdirectories of the current base directory
     * @type {Array}
     */
    this.dirs = [];

    /**
     * Files of the appropriate type within the current base directory
     * @type {Array}
     */
    this.files = [];

    /**
     * The target HTML element this file picker is bound to
     * @type {HTMLElement}
     */
    this.field = options.field;

    /**
     * A button which controls the display of the picker UI
     * @type {HTMLElement}
     */
    this.button = options.button;

    // Track whether uploading is allowed
    this._canUpload = (game.user && game.user.isGM) ||
                      (game.user && game.user.isTrusted && game.settings.get("core", "allowTrustedUpload"));

    // Track whether we have loaded files
    this._loaded = false;
  }

  /* -------------------------------------------- */

  /**
   * Assign the default options which are supported by this Application
   * @type {Object}
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.template = "templates/hud/filepicker.html";
	  options.classes = ["filepicker"];
	  options.width = 500;
	  return options;
  }

  /* -------------------------------------------- */

  /**
   * Render a window title for the FilePicker which indicates the types of files which can be selected
   * @return {String}
   */
  get title() {
    let type = this.type || "file";
    let title = type === "imagevideo" ? "Image or Video" : type.capitalize();
	  return `${title} Browser`;
  }

  /* -------------------------------------------- */

  /**
   * Given a current file path, determine the directory it belongs to
   * @param {String} current  The currently selected file
   * @return {String}         The directory path
   */
  _getCurrentDirectory(current) {
    let ignored = [DEFAULT_TOKEN];
    if ( !current || ignored.includes(current) ) return this.constructor.LAST_BROWSED_DIRECTORY;
    else if (["http://", "https://"].some(c => current.startsWith(c))) return "";
    let dir = current.split("/");
    if ( dir.length === 0 ) return "";
    return current;
  }

  /* -------------------------------------------- */

  getData() {
    return {
      user: game.user,
      baseDir: this.baseDir.startsWith("/") ? `public${this.baseDir}` : `public/${this.baseDir}`,
      current: this.options.current,
      extensions: this.extensions,
      dirs: this.dirs.map(d => d.split("/").pop()),
      files: this.files.map(f => f.split("/").pop()),
      canUpload: this._canUpload,
      canGoBack: this.baseDir !== ""
    }
  }

  /* -------------------------------------------- */

  /**
   * Browse files for a certain directory location
   * @param {String} dir        The directory to browse
   * @param {Object} options    Browsing options
   * @return {Promise}
   */
  browse(dir, options) {
    if ( dir === DEFAULT_TOKEN ) dir = this.constructor.LAST_BROWSED_DIRECTORY;
    dir = ( typeof dir === "string" ) ? dir : this.baseDir;
    if ( dir.startsWith("/") ) dir = dir.slice(1);
    this.constructor.LAST_BROWSED_DIRECTORY = dir;
    options = mergeObject({extensions: this.extensions}, options);

    // TODO: Temporary hack, decode the directory URI, this needs to be changed
    dir = decodeURI(dir);

    // Browse the files
    return new Promise((resolve, reject) => {
      game.socket.emit("getFiles", dir, options, content => {
        if ( content.error ) return reject(content.error);
        this.baseDir = decodeURI(content.baseDir);
        this.dirs = content.dirs.map(decodeURI);
        this.files = content.files.map(decodeURI);
        this._loaded = true;
        resolve(content);
      });
    })
    .then(content => this.render(true))
    .catch(error => {
      ui.notifications.warn(error);
      this.browse("", options);
    });
  }

  /* -------------------------------------------- */

  activateListeners(html) {
	  super.activateListeners(html);
	  const form = html[0];

    // Change the directory
    html.find('input[name="baseDir"]').on("keydown", ev => {
      if ( ev.keyCode === KEYS.ENTER ) {
        ev.preventDefault();
        this.browse(ev.target.value.replace("public/", ""));
      }
    });

    // Filter results
    html.find('input[name="filter"]').on("keyup", ev => this._onFilterResults(ev));

    // Go back one directory
    html.find('.back').click(ev => this._onBack(ev));

    // Upload new file
    if ( this._canUpload ) form.upload.onchange = ev => this._onUpload(ev);

    // Select an entry in the directory
    html.find(".file-directory").on("click", "li", ev => this._onPick(ev));

	  // Form submission
    form.onsubmit = ev => this._onSubmit(ev);
  }

  /* -------------------------------------------- */

  /**
   * Handle backwards navigation of the folder structure
   * @private
   */
  _onBack(ev) {
    ev.preventDefault();
    let target = this.baseDir.split("/");
    target.pop();
    this.browse(target.join("/"));
  }

  /* -------------------------------------------- */

  /**
   * Handle a keyup event in the filter box to restrict the set of files shown in the FilePicker
   * @private
   */
  _onFilterResults(ev) {
    let input = ev.currentTarget;

    // Define filtering function
    let filter = query => {
      this.element.find('.file-directory').children().each((i, li) => {
        li.hidden = !query.test(li.getAttribute("data-path"));
      });
    };

    // Filter if we are done entering keys
    let query = new RegExp(RegExp.escape(input.value), "i");
    this._filterTime = new Date();
    setTimeout(() => {
      if ( new Date() - this._filterTime > 250) filter(query);
    }, 251);
  }

  /* -------------------------------------------- */

  /**
   * Handle file or folder selection within the file picker
   * @private
   */
  _onPick(ev) {
    let li = $(ev.currentTarget),
        path = [this.baseDir, li.attr("data-path")].join("/");

    // Navigate directory
    if ( li.hasClass("dir") ) this.browse(path);

    // Select File
    else {
      let target = encodeURI(path);
      li.parents("form").find('input[name="file"]').val(target);
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle file picker form submission
   * @param ev {Event}
   * @private
   */
  _onSubmit(ev) {
    ev.preventDefault();
    let path = ev.target.file.value;
    if ( !path ) return ui.notifications.error("You must select a file to proceed.");

    // Update the target field
    if ( this.field ) {
      this.field.value = path;
      this.field.dispatchEvent(new Event("change"));
    }

    // Trigger a callback and close
    if ( this.options.callback ) this.options.callback(path);
    this.close();
  }

  /* -------------------------------------------- */

  /**
   * Handle file upload
   * @param ev
   * @private
   */
  _onUpload(ev) {
    const form = ev.target.form,
          formData = new FormData(form),
          upload = form.upload,
          filename = formData.get("upload").name;

    // Validate file extension
    if ( !this.extensions.some(ext => filename.endsWith(ext)) ) {
      ui.notifications.error(`Incorrect ${this.type} file extension. Supports ${this.extensions.join(" ")}.`);
      return false;
    }

    // Create a POST request
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);
    xhr.onloadstart = event => upload.disabled = true;
    xhr.onreadystatechange = () => {
      if ( xhr.readyState !== 4 ) return;
      console.log(xhr.status);
      if ( xhr.status === 500 ) ui.notifications.error(xhr.response);
      else {
        ui.notifications.info(xhr.responseText);
        this.browse();
      }
      upload.disabled = false;
    };

    // Submit the POST request
    xhr.send(formData);
  }

  /* -------------------------------------------- */

  /**
   * Additional actions performed when the file-picker UI is rendered
   */
  render(...args) {
    this.position.height = null;
    this.element.css({height: ""});
    if ( !this._loaded ) return this.browse();
    if ( this.button ) this.button.disabled = true;
    super.render(...args);
  }

  /* -------------------------------------------- */

  /**
   * Additional actions to perform when the file-picker UI is closed
   */
  close() {
    if ( this.button ) this.button.disabled = false;
    super.close();
  }

  /* -------------------------------------------- */

  getExtensions(type) {

    // Identify allowed extensions
    let types = [];
    if ( type === "image" ) types = IMAGE_FILE_EXTENSIONS;
    else if ( type === "audio" ) types = AUDIO_FILE_EXTENSIONS;
    else if ( type === "video" ) types = VIDEO_FILE_EXTENSIONS;
    else if ( type = "imagevideo") types = IMAGE_FILE_EXTENSIONS.concat(VIDEO_FILE_EXTENSIONS);
    if ( types.length === 0 ) return undefined;

    // Return the allowed types
    else return types.reduce((arr, t) => {
      arr.push(`.${t}`);
      arr.push(`.${t.toUpperCase()}`);
      return arr;
    }, []);
  }

  /* -------------------------------------------- */
  /*  Factory Methods
  /* -------------------------------------------- */

  /**
   * Bind the file picker to a new target field.
   * Assumes the user will provide a <button> HTMLElement which has the data-target and data-type attributes
   * The data-target attribute should provide the name of the input field which should receive the selected file
   * The data-type attribute is a string in ["image", "audio"] which sets the file extensions which will be accepted
   *
   * @param button {HTMLElement}    The button element
   */
  static fromButton(button, options) {
    if ( !(button instanceof HTMLElement ) ) throw "You must pass an HTML button";
    let type = button.getAttribute("data-type");

    // Identify the target form field
    let form = button.form,
        target = form[button.getAttribute("data-target")];
    if ( !target ) return;

    // Build and return a FilePicker instance
    return new FilePicker({field: target, type: type, current: target.value, button: button});
  }
}

FilePicker.LAST_BROWSED_DIRECTORY = "";

$(document).ready(function() {

  /**
   * Support mousewheel control for range type input elements
   */
  $('body').on("mousewheel", 'input[type="range"]', ev => {
    let rng = ev.currentTarget,
        step = (parseFloat(rng.step) || 1.0) * Math.sign(-1 * ev.originalEvent.deltaY);
    rng.value = Math.clamped(parseFloat(rng.value) + step, parseFloat(rng.min), parseFloat(rng.max));
    rng.dispatchEvent(new Event('change'));
  })
});

/**
 * A common framework for displaying notifications to the client.
 * Submitted notifications are added to a queue, and up to 3 notifications are displayed at once.
 * Each notification is displayed for 5 seconds at which point further notifications are pulled from the queue.
 *
 * @type {Application}
 *
 * @example
 * ui.notifications.info("This is an info message");
 * ui.notifications.warn("This is a warning message");
 * ui.notifications.error("This is an error message");
 * ui.notifications.info("This is a 4th message which will not be shown until the first info message is done");
 */
class Notifications extends Application {
  constructor(options) {
    super(options);

    /**
     * Submitted notifications which are queued for display
     * @type {Array}
     */
    this.queue = [];

    /**
     * Notifications which are currently displayed
     * @type {Array}
     */
    this.active = [];
  }

	/* -------------------------------------------- */

  /**
   * Configure the default behavior of the notifications application
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  return mergeObject(options, {
      popOut: false,
      id: "notifications",
      template: "templates/hud/notifications.html"
    });
  }

	/* -------------------------------------------- */

  /**
   * Push a new notification into the queue
   * @param {String} message    The content of the notification message
   * @param {String} type       The type of notification, currently "info", "warning", and "error" are supported
   */
  notify(message, type) {

    // Construct notification data
    let n = {
      message: message,
      type: ["info", "warning", "error"].includes(type) ? type : "info",
      timestamp: new Date().getTime()
    };
    this.queue.push(n);

    // Call the fetch method
    this.fetch();
  }

	/* -------------------------------------------- */

  /**
   * Display a notification with the "info" type
   * @param {String} message    The content of the notification message
   */
	info(message) {
	  this.notify(message, "info");
  }

  /**
   * Display a notification with the "warning" type
   * @param {String} message    The content of the notification message
   */
  warn(message) {
	  this.notify(message, "warning");
  }

  /**
   * Display a notification with the "error" type
   * @param {String} message    The content of the notification message
   */
  error(message) {
	  this.notify(message, "error");
  }

	/* -------------------------------------------- */

  /**
   * Retrieve a pending notification from the queue and display it
   * @private
   * @return {Promise}
   */
	async fetch() {
	  if ( this.queue.length === 0 || this.active.length >= 3 ) return;

    // Display a new notification
	  let next = this.queue.pop(),
        li = $(`<li class="notification ${next.type}">${next.message}</li>`);
	  this.element.prepend(li);
	  li.hide().slideDown(250);
	  this.active.push(li);

	  // Remove the notification 5 seconds later
	  window.setTimeout(() => {
	    li.fadeOut(250, () => li.remove());
      this.active.pop();
      this.fetch();
    }, 5000);
  }
}

/**
 * A helper class for creating tabbed containers.
 * Create one Tabs instance per tabbed navigation container in your application.
 *
 * @example
 * <!-- Example HTML -->
 * <nav class="tabs" data-group="group1">
 *  <a class="item" data-tab="tab1">Tab 1</li>
 *  <a class="item" data-tab="tab2">Tab 2</li>
 * </nav>
 *
 * <div class="tab" data-tab="tab1" data-group="group1">Content 1</div>
 * <div class="tab" data-tab="tab2" data-group="group1">Content 2</div>
 *
 * @example
 * // JavaScript Listener
 * let nav = $('.tabs[data-group="group1"]');
 * new Tabs(nav, {
 *   initial: "tab1",
 *   callback: t => console.log("Tab ${t} was clicked")
 * });
 *
 * @param tabs {HTMLElement|JQuery} An HTML element or JQuery object representing the tab navigation container.
 */
class Tabs {
  constructor(tabs, {initial, callback} = {}) {

    /**
     * The collection of tabs
     * @type {jQuery}
     */
    this.tabs = (tabs instanceof jQuery) ? tabs : $(tabs);

    /**
     * The callback function to trigger when a Tab is activated
     * @type {Function}
     */
    this.callback = ( callback instanceof Function ) ? callback : null;

    /**
     * The currently active tab
     * @type {jQuery}
     */
    this.active = initial ? this.tabs.children(`[data-tab="${initial}"]`) : this.tabs.children('.active');
    if ( this.active.length === 0 ) this.active = this.tabs.children().first();
    this.activateTab(this.active);

    // Register listener
    this.tabs.on("click", ".item", event => {
      event.preventDefault();
      let tab = $(event.currentTarget);
      this.activateTab(tab);
    });
  }

  /* -------------------------------------------- */

  /**
   * The named tab group
   * Retrieved as a property since the composition of the DOM may change over time
   * @type {jQuery}
   */
  get group() {
    let tabGroup = this.tabs.attr("data-group");
    if ( tabGroup ) return this.tabs.parents(".app").find(`.tab[data-group="${tabGroup}"]`);
    else return this.tabs.siblings(".tab[data-tab]");
  }

  /* -------------------------------------------- */

  /**
   * Activate a tab by it's name. This gets called automatically when a tab in the navigation is clicked,
   * however you may also call this function directly.
   */
  activateTab(tab) {

    // If only a name was provided, get the tab
    if ( typeof tab === "string" ) {
      tab = this.tabs.find(`[data-tab="${tab}"]`);
    } if ( !tab ) return;

    // Flag tab as active
    tab.siblings().removeClass('active');
    tab.addClass('active');
    tab.show();

    // Show the content
    this.group.removeClass('active');
    this.group.filter(`[data-tab="${tab.attr("data-tab")}"]`).addClass('active');

    // Trigger the callback function
    if ( this.callback ) this.callback(tab);
  }
}

/**
 * The default Actor Sheet
 *
 * This Application is responsible for rendering an actor's attributes and allowing the actor to be edited.
 *
 * System modifications may elect to override this class to better suit their own game system by re-defining the value
 * ``CONFIG.Actor.sheetClass``.

 * @type {BaseEntitySheet}
 *
 * @param actor {Actor}                 The Actor instance being displayed within the sheet.
 * @param [options] {Object}            Additional options which modify the rendering of the Actor's sheet.
 * @param [options.editable] {Boolean}  Is the Actor editable? Default is true.
 */
class ActorSheet extends BaseEntitySheet {
  constructor(...args) {
    super(...args);

    /**
     * If this Actor Sheet represents a synthetic Token actor, reference the active Token
     * @type {Token}
     */
    this.token = this.object.token;
  }

	/* -------------------------------------------- */

	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.template = "templates/sheets/actor-sheet.html";
    options.width = 720;
    options.height = 800;
    options.closeOnSubmit = false;
    options.submitOnClose = true;
    options.submitOnUnfocus = true;
    options.resizable = true;
    return options;
  }

	/* -------------------------------------------- */

  /**
   * Define a unique and dynamic element ID for the rendered ActorSheet application
   * @return {string}
   */
  get id() {
    let id = `actor-${this.actor.id}`;
    if ( this.token ) id += `-${this.token.id}`;
    return id;
  }

	/* -------------------------------------------- */

  /**
   * The displayed window title for the sheet - the entity name by default
   * @type {String}
   */
  get title() {
    return (this.token && !this.token.data.actorLink) ? `[Token] ${this.actor.name}` : this.actor.name;
  }

	/* -------------------------------------------- */

  /**
   * A convenience reference to the Actor entity
   * @type {Actor}
   */
  get actor() {
    return this.object;
  }

	/* -------------------------------------------- */

  /**
   * Prepare data for rendering the Actor sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  getData() {
    const data = super.getData();
    data.actor = data.entity;
    data.data = data.entity.data;
    return data;
  }

	/* -------------------------------------------- */

  /**
   * Extend the Header Button configuration for the ActorSheet to add Token configuration buttons
   * See Application._getHeaderButtons for documentation of the return Array structure.
   * @return {Array.<Object>}
   * @private
   */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    let canConfigure = this.options.editable && (game.user.isGM || (this.actor.owner && game.user.isTrusted));
    if ( canConfigure ) {
      buttons = [
        {
          label: "Sheet",
          class: "configure-sheet",
          icon: "fas fa-cog",
          onclick: ev => this._onConfigureSheet(ev)
        },
        {
          label: this.token ? "Token" : "Prototype Token",
          class: "configure-token",
          icon: "fas fa-user-circle",
          onclick: ev => this._onConfigureToken(ev)
        }
      ].concat(buttons);
    }
    return buttons
  }

	/* -------------------------------------------- */

  /**
   * Remove references to an active Token when the sheet is closed
   * See Application.close for more detail
   * @return {Promise}
   */
  async close() {
    this.token = null;
    return super.close();
  }

	/* -------------------------------------------- */
	/*  Event Listeners                             */
	/* -------------------------------------------- */

  /**
   * Activate the default set of listeners for the Actor Sheet
   * These listeners handle basic stuff like form submission or updating images
   *
   * @param html {JQuery}     The rendered template ready to have listeners attached
   */
	activateListeners(html) {
	  super.activateListeners(html);

    // Everything below is only needed if the sheet is editable
    if ( !this.options.editable ) return;

	  // Update the sheet when we un-focus an input unless we have acquired focus on another input
    html.find("input").focusout(this._onUnfocus.bind(this));

    // Update the sheet when a select field is changed
    html.find("select").change(this._onSubmit.bind(this));

    // Make the Actor sheet droppable for Items
    this.form.ondragover = ev => this._onDragOver(ev);
    this.form.ondrop = ev => this._onDrop(ev);

    // Support Image updates
    html.find('img[data-edit="img"]').click(ev => this._onEditImage(ev));
  }

  /* -------------------------------------------- */

  /**
   * Handle requests to configure the prototype Token for the Actor
   * @private
   */
  _onConfigureToken(event) {
    event.preventDefault();

    // Determine the Token for which to configure
    const token = this.token || new Token(this.actor.data.token);

    // Render the Token Config application
    new TokenConfig(token, {
      left: Math.max(this.position.left - 560 - 10, 10),
      top: this.position.top,
      configureDefault: !this.token
    }).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle requests to configure the default sheet used by this Actor
   * @private
   */
  _onConfigureSheet(event) {
    event.preventDefault();
    new EntitySheetConfig(this.actor, {
      top: this.position.top + 40,
      left: this.position.left + ((this.position.width - 400) / 2)
    }).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle changing the actor profile image by opening a FilePicker
   * @private
   */
  _onEditImage(event) {
    new FilePicker({
      type: "image",
      current: this.actor.data.img,
      callback: path => {
        event.currentTarget.src = path;
        this._onSubmit(event);
      },
      top: this.position.top + 40,
      left: this.position.left + 10
    }).browse(this.actor.data.img);
  }

  /* -------------------------------------------- */

  /**
   * Allow the Actor sheet to be a displayed as a valid drop-zone
   * @private
   */
  _onDragOver(event) {
    event.preventDefault();
    return false;
  }

  /* -------------------------------------------- */

  /**
   * Handle dropped data on the Actor sheet
   * @private
   */
  _onDrop(event) {
    event.preventDefault();

    // Try to extract the data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
      if ( data.type !== "Item" ) return;
    }
    catch (err) {
      return false;
    }

    // From Compendium
    if ( data.pack ) {
      this.actor.importItemFromCollection(data.pack, data.id);
    }

    // From Actor
    else if ( data.actorId ) {
      if ( data.actorId === this.actor._id ) return false;
      let actor = game.actors.get(data.actorId),
          item = duplicate(actor.items.find(i => i.id === data.id));
      item.id = null;
      this.actor.createOwnedItem(item, true);
    }

    // From World
    else {
      let item = game.items.get(data.id);
      this.actor.createOwnedItem(item.data, true);
    }
    return false;
  }
}

/**
 * Light Source Configuration Sheet
 * @type {FormApplication}
 *
 * @params light {AmbientLight} The AmbientLight object for which settings are being configured
 * @params options {Object}     LightConfig ui options (see Application)
 */
class LightConfig extends FormApplication {
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "light-config";
    options.title = "Light Source Configuration";
	  options.template = "templates/scene/light-config.html";
	  options.width = 400;
	  return options;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  getData() {
    return {
      object: duplicate(this.object.data),
      options: this.options,
      submitText: this.options.preview ? "Create" : "Update"
    }
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {
    if (!game.user.isGM) throw "You do not have the ability to configure an AmbientLight object.";
    if ( this.object.id ) {
      formData["id"] = this.object.id;
      this.object.update(canvas.scene._id, formData);
    }
    else this.object.constructor.create(canvas.scene._id, formData);
  }
}

/**
 * Ambient Sound Config Sheet
 * @type {FormApplication}
 *
 * @params sound {AmbientSound}       The sound object being configured
 * @params options {Object}           Additional application rendering options
 * @params options.preview {Boolean}  Configure a preview version of a sound which is not yet saved
 */
class AmbientSoundConfig extends FormApplication {
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "sound-config";
	  options.classes = ["sheet", "sound-sheet"];
	  options.title = "Ambient Sound Configuration";
	  options.template = "templates/scene/sound-config.html";
	  return options;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  getData() {
    return {
      object: duplicate(this.object.data),
      options: this.options,
      submitText: this.options.preview ? "Create" : "Update"
    }
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {
    if (!game.user.isGM) throw "You do not have the ability to configure an AmbientSound object.";
    if ( this.object.id ) {
      formData["id"] = this.object.id;
      this.object.update(canvas.scene._id, formData);
    }
    else this.object.constructor.create(canvas.scene._id, formData);
  }

  /* -------------------------------------------- */

  /**
   * Extend the application close method to clear any preview sound aura if one exists
   */
  close() {
    super.close();
    if ( this.preview ) {
      this.preview.removeChildren();
      this.preview = null;
    }
  }
}

/* -------------------------------------------- */

/**
 * Configure the Combat tracker to display additional information as appropriate
 */
class CombatTrackerConfig extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "combat-config";
    options.title = "Combat Tracker Configuration";
    options.classes = ["sheet", "combat-sheet"];
    options.template = "templates/sheets/combat-config.html";
    return options;
  }

  /* -------------------------------------------- */

  async getData() {
    const data = {
      settings: game.settings.get("core", Combat.CONFIG_SETTING)
    };
    return data;
  };

  /* -------------------------------------------- */

  _updateObject(event, formData) {
    game.settings.set("core", Combat.CONFIG_SETTING, {
      resource: formData.resource
    });
  }
}

/**
 * Edit a folder, configuring its name and appearance
 */
class FolderConfig extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "folder-edit";
    options.classes = ["sheet"];
    options.template = "templates/sidebar/folder-edit.html";
    options.width = 400;
    return options;
  }

  /* -------------------------------------------- */

  get title() {
    if ( this.object._id ) return `Update Folder: ${this.object.name}`;
    return "Create New Folder";
  }

  /* -------------------------------------------- */

  async getData() {
    return {
      folder: this.object.data,
      submitText: this.object._id ? "Update" : "Create"
    }
  }

  /* -------------------------------------------- */

  _updateObject(event, formData) {
    if ( !formData.parent ) formData.parent = null;
    if ( !this.object._id ) Folder.create(formData);
    else this.object.update(formData);
  }
}

/**
 * An Image Popout Application
 * Provides optional support to edit the image path being viewed
 * @type {Application}
 * @params image {String}       The image being viewed
 * @params options {Object}     Standard Application rendering options
 * @params onUpdate {Function}  An optional callback function which should be triggered if the Image path is edited
 */
class ImagePopout extends FormApplication {
  constructor(image, options, onUpdate) {
    super(image, options);
    this._onUpdate = onUpdate;
  }

  /* -------------------------------------------- */

	static get defaultOptions() {
	  const options = super.defaultOptions;
	  mergeObject(options, {
      template: "templates/apps/image-popout.html",
      classes: ["image-popout"],
      editable: false,
      resizable: true,
      shareable: false
    });
	  return options;
  }

  /* -------------------------------------------- */

  getData() {
    const data = super.getData();
    data.image = this.object;
    data.title = this.title;
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Extend the default Application rendering function to adjust the positioning based on image dimensions
   * @private
   */
  async _render(...args) {
    if ( this.object ) this.position = await this.constructor.getPosition(this.object);
    else this.position = { width: 720, height: window.innerHeight * 0.8 };
    return super._render(...args);
  }

  /* -------------------------------------------- */

  /**
   * Extend the Header Button configuration for the Journal Sheet to add a toggle between Text and Image modes
   * See Application._getHeaderButtons for documentation of the return Array structure.
   * @return {Array.<Object>}
   * @private
   */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    if ( game.user.isGM && this.options.shareable ) {
      buttons.unshift({
        label: "Show Players",
        class: "share-image",
        icon: "fas fa-eye",
        onclick: ev => this._onShareImage(ev)
      });
    }
    return buttons
  }

  /* -------------------------------------------- */
  /*  Helper Methods
  /* -------------------------------------------- */

  /**
   * Determine the correct position and dimensions for the displayed image
   * @returns {Object}    The positioning object which should be used for rendering
   * @private
   */
  static async getPosition(img) {
    const position = {};
    let [w, h] = await this.getImageSize(img);
    let wh = window.innerHeight,
        ww = window.innerWidth,
        wr = window.innerWidth / window.innerHeight,
        ir = w / h;
    if (ir > wr) {
      position.width = Math.min(w * 2, parseInt(0.95 * ww));
      position.height = parseInt(position.width / ir);
    } else {
      position.height = Math.min(h * 2, parseInt(0.95 * wh));
      position.width = parseInt(position.height * ir);
    }
    position.top = (wh - position.height) / 2;
    position.left = (ww - position.width) / 2;
    return position;
  }

  /* -------------------------------------------- */

  /**
   * Determine the Image dimensions given a certain path
   * @return {Promise<Array.<Number>>}
   */
  static getImageSize(path) {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = function() {
        resolve([this.width, this.height]);
      };
      img.onerror = reject;
      img.src = path;
    })
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  _onShareImage(event) {
    event.preventDefault();
    game.socket.emit("shareImage", { image: this.object, title: this.options.title });
  }
}

/**
 * The default Item Sheet
 *
 * This Application is responsible for rendering an item's attributes and allowing the item to be edited.
 *
 * System modifications may elect to override this class to better suit their own game system by re-defining the value
 * ``CONFIG.Item.sheetClass``.

 * @type {BaseEntitySheet}
 *
 * @param item {Item}                   The Item instance being displayed within the sheet.
 * @param [options] {Object}            Additional options which modify the rendering of the item.
 * @param [options.editable] {Boolean}  Is the item editable? Default is true.
 */
class ItemSheet extends BaseEntitySheet {
  /**
   * Assign the default options which are supported by this Application
   * @type {Object}
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.template = "templates/sheets/item-sheet.html";
    options.width = 500;
    options.closeOnSubmit = false;
	  options.submitOnClose = true;
    options.submitOnUnfocus = true;
    options.resizable = true;
    return options;
  }

	/* -------------------------------------------- */

  /**
   * Provide a unique CSS ID for owned Item sheets
   * @type {String}
   */
	get id() {
	  if ( this.actor ) return `actor-${this.actor._id}-item-${this.item.data.id}`;
	  else return super.id;
  }

	/* -------------------------------------------- */

  /**
   * A convenience reference to the Item entity
   * @type {Item}
   */
  get item() {
    return this.object;
  }

	/* -------------------------------------------- */

  /**
   * The Actor instance which owns this item. This may be null if the item is unowned.
   * @type {Actor}
   */
  get actor() {
    return this.item.actor;
  }

	/* -------------------------------------------- */

  /**
   * Customize the data provided to the item sheet for rendering. By default we just duplicate the item data.
   */
  getData() {
    const data = super.getData();
    data.item = data.entity;
    data.data = data.entity.data;
    return data;
  }

	/* -------------------------------------------- */
	/*  Event Listeners and Handlers                */
	/* -------------------------------------------- */

  /**
   * Activate listeners which provide interactivity for item sheet events
   * @param html {jQuery}   The HTML object returned by template rendering
   */
	activateListeners(html) {
	  super.activateListeners(html);
    if ( !this.options.editable ) return;

    // Update the sheet when a select field is changed
    html.find("select").change(ev => this._onSubmit(ev));

    // Update when we change the image
    html.find('img[data-edit="img"]').click(ev => this._onEditImage(ev));
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {

    // Update owned items
    if (this.item.isOwned) {
      formData.id = this.item.data.id;
      this.item.actor.updateOwnedItem(formData, true);
    }

    // Update unowned items
    else this.item.update(formData);
  };

  /* -------------------------------------------- */

  /**
   * Handle changing the item image
   * @private
   */
  _onEditImage(event) {
    new FilePicker({
      type: "image",
      current: this.item.data.img,
      callback: path => {
        event.currentTarget.src = path;
        this._onSubmit(event);
      },
      top: this.position.top + 40,
      left: this.position.left + 10
    }).browse(this.item.data.img);
  }
}

CONFIG.Item.sheetClass = ItemSheet;

/**
 * Template Measurement Config Sheet
 * @type {FormApplication}
 *
 * @params template {MeasureTemplate} The template object being configured
 * @params options {Object}           Additional application rendering options
 * @params options.preview {Boolean}  Configure a preview version of a sound which is not yet saved
 */
class MeasureTemplateConfig extends FormApplication {
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "template-config";
	  options.classes = ["sheet", "template-sheet"];
	  options.title = "Measurement Template Configuration";
	  options.template = "templates/scene/template-config.html";
	  options.width = 400;
	  return options;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  getData() {
    return {
      object: duplicate(this.object.data),
      options: this.options,
      templateTypes: CONFIG.templateTypes,
      gridUnits: canvas.scene.data.gridUnits,
      submitText: this.options.preview ? "Create" : "Update"
    }
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {
    if ( !game.user.isTrusted ) throw "You do not have the ability to configure a MeasurementTemplate.";
    if ( this.object.id ) {
      formData["id"] = this.object.id;
      this.object.update(canvas.scene._id, formData);
    }
    else this.object.constructor.create(canvas.scene._id, formData);
  }
}

/* -------------------------------------------- */

/**
 * A generic application for configuring permissions for various Entity types
 * @type {BaseEntitySheet}
 *
 * @param entity {Entity}               The Entity instance for which permissions are being configured.
 * @param [options] {Object}            Application options.
 */
class PermissionControl extends BaseEntitySheet {
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "permission";
	  options.template = "templates/apps/permission.html";
	  return options;
  }

  /* -------------------------------------------- */

  get title() {
    return `${this.entity.name}: Permission Control`;
  }

  /* -------------------------------------------- */

  /**
   * Prepare permissions data as an array of users and levels for which to configure the entity
   */
  getData() {
    const e = this.entity;
    const data = {
      entity: e,
      users: [],
      levels: [{level: "-1", name: "Default"}],
    };

    // Configure permission levels
    for (let [n, l] of Object.entries(ENTITY_PERMISSIONS)) {
      data.levels.push({level: l, name: n.titleCase()});
    }

    // Get the users and their current permission level and name
    for (let u of game.users) {
      if ( u.isGM ) continue;
      data.users.push({user: u, level: e.data.permission[u._id]});
    }
    return data;
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {
    event.preventDefault();
    if (!game.user.isGM) throw "You do not have the ability to configure permissions.";

    // Collect user permissions
    const perms = {};
    for ( let [user, level] of Object.entries(formData) ) {
      if ( name !== "default" && level === "-1" ) {
        delete perms[user];
        continue;
      }
      perms[user] = parseInt(level);
    }

    // Update the entity
    this.entity.update({permission: perms});
  }
}

/**
 * The player configuration menu
 * This form is used to allow the client to edit some preferences about their own User entity
 * @type {FormApplication}
 */
class PlayerConfig extends FormApplication {
  constructor(user, options) {
    super(user, options);
    this.user = this.object;
    game.actors.apps.push(this);
  }

	/* -------------------------------------------- */

  /**
   * Assign the default options which are supported by the entity edit sheet
   * @type {Object}
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "player-config";
	  options.template = "templates/user/player-config.html";
	  //options.classes = ["sidebar", "sidebar-popout"];
	  options.width = 400;
	  return options;
  }

  /* -------------------------------------------- */

  get title() {
    return `Player Configuration: ${this.user.name}`;
  }

  /* -------------------------------------------- */

  /**
   * Provide data to the form
   * @return {Object}   The data provided to the template when rendering the form
   */
	getData() {
    const controlled = game.users.entities.map(e => e.data.character).filter(a => a);
    const actors = game.actors.entities.filter(a => a.hasPerm(this.user, "OBSERVER") && !controlled.includes(a._id));
    return {
      user: this.user,
      actors: actors,
      options: this.options
    }
  }

	/* -------------------------------------------- */

  /**
   * Activate the default set of listeners for the Entity sheet
   * These listeners handle basic stuff like form submission or updating images
   *
   * @param html {JQuery}     The rendered template ready to have listeners attached
   */
  activateListeners(html) {
    super.activateListeners(html);

    // When a character is clicked, record it's ID in the hidden input
    let input = html.find('[name="character"]');
    html.find('.actor').click(ev => {

      // Record the selected actor
      let li = ev.currentTarget;
      let actorId = li.getAttribute("data-actor-id");
      input.val(actorId);

      // Add context to the selection
      for ( let a of html[0].getElementsByClassName("actor") ) {
        a.classList.remove("context");
      }
      li.classList.add("context");
    });

    // Release the currently selected character
    html.find('button[name="release"]').click(ev => {
      this.user.update({character: null});
      if ( canvas.tokens ) canvas.tokens.releaseAll();
      if ( canvas.sight ) canvas.sight.initialize();
      this.render(false);
    });
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {
    this.user.update(formData);
  }
}

/* -------------------------------------------- */
/**
 * Playlist Configuration Sheet
 * @type {FormApplication}

 * @params object {Playlist}          The Playlist being edited
 * @params options {Object}           Additional application rendering options
 */
class PlaylistConfig extends FormApplication {
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "playlist-config";
	  options.template = "templates/playlist/edit-playlist.html";
	  options.width = 360;
	  return options;
  }

  /* -------------------------------------------- */

  /**
   * Dynamic application window title
   * @return {string}
   */
  get title() {
    return `Edit ${this.object.name} Playlist`;
  }

  /* -------------------------------------------- */

  /**
   * Provide data to the form
   * @return {Object}   The data provided to the template when rendering the form
   */
	getData() {
	  const data = duplicate(this.object.data);
	  data.modes = Object.keys(PLAYLIST_MODES).reduce((obj, val) => {
      obj[val.titleCase()] = PLAYLIST_MODES[val];
      return obj;
    }, {});
	  return data;
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {
    if (!game.user.isGM) throw "You do not have the ability to edit playlists.";
    this.object.update(formData);
  }
}


/* -------------------------------------------- */


/**
 * Playlist Sound Configuration Sheet
 * @type {FormApplication}
 *
 * @params sound {AmbientSound}       The sound object being configured
 * @params options {Object}           Additional application rendering options
 */
class PlaylistSoundConfig extends FormApplication {
  constructor(playlist, sound, options) {
    super(sound, options);
    this.playlist = playlist;
  }

	/* -------------------------------------------- */

  /**
   * Assign the default options which are supported by this Application
   * @private
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "track-config";
	  options.template = "templates/playlist/edit-track.html";
	  options.width = 360;
	  return options;
  }

  /* -------------------------------------------- */

  /**
   * Dynamic application window title
   * @return {string}
   */
  get title() {
    return `${this.playlist.name} Playlist: ${this.object.name || "New Track"}`;
  }

  /* -------------------------------------------- */

  /**
   * Provide data to the form
   * @return {Object}   The data provided to the template when rendering the form
   */
	getData() {
	  const data = duplicate(this.object);
	  data.lvolume = Math.sqrt(data.volume);
	  return data;
  }


  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  activateListeners(html) {
    super.activateListeners(html);
    html.find('input[name="path"]').change(this._onSourceChange.bind(this));
    return html;
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {
    if (!game.user.isGM) throw "You do not have the ability to edit playlist sounds.";
    formData["volume"] = Math.pow(parseFloat(formData["lvolume"]), 2);
    if ( this.object.id ) {
      formData["id"] = this.object.id;
      this.playlist.updateSound(formData, true);
    }
    else this.playlist.createSound(formData, true);
  }

  /* -------------------------------------------- */

  /**
   * Auto-populate the track name using the provided filename, if a name is not already set
   * @param {Event} event
   * @private
   */
  _onSourceChange(event) {
    event.preventDefault();
    let field = event.target,
        form = field.form;
    if ( !form.name.value ) form.name.value = field.value.split("/").pop().split(".").shift();
  }
}



/**
 * A Scene configuration sheet
 * @type {BaseEntitySheet}
 */
class SceneSheet extends BaseEntitySheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.classes = ["sheet", "scene-sheet"];
    options.template = "templates/scene/config.html";
    return options;
  }

	/* -------------------------------------------- */

  /**
   * Give each Scene Configuration sheet a unique css ID based on their entity ID
   * @return {string}
   */
  get id() {
    return `scene-config-${this.object._id}`;
  }

	/* -------------------------------------------- */

	_getGridTypes() {
	  const labels = {
	    "GRIDLESS": "Gridless",
      "SQUARE": "Square",
      "HEXODDR": "Hexagonal Rows - Odd",
      "HEXEVENR": "Hexagonal Rows - Even",
      "HEXODDQ": "Hexagonal Columns - Odd",
      "HEXEVENQ": "Hexagonal Columns - Even"
    };
    return Object.keys(GRID_TYPES).reduce((obj, t) => {
	    obj[GRID_TYPES[t]] = labels[t];
	    return obj;
    }, {});
  }

	/* -------------------------------------------- */

  /**
   * Get the available weather effect types which can be applied to this Scene
   * @private
   */
  _getWeatherTypes() {
    const types = {};
    for ( let [k, v] of Object.entries(CONFIG.weatherEffects) ) {
      types[k] = v.label;
    }
    return types;
  }

	/* -------------------------------------------- */

  /**
   * Default data preparation logic for the entity sheet
   */
  getData() {
    const data = super.getData();
    data.gridTypes = this._getGridTypes();
    data.weatherTypes = this._getWeatherTypes();
    return data;
  }
}


/**
 * Long-form Scene notes
 * @type {BaseEntitySheet}
 */
class SceneNotes extends BaseEntitySheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.template = "templates/scene/scene-notes.html";
    options.width = 600;
    options.height = window.innerHeight * 0.9;
    options.top = 10;
    options.left = window.innerWidth - 600 - 320;
    options.classes = ["sheet", "scene-notes"];
    return options;
  }

	/* -------------------------------------------- */

  /**
   * Give each Scene Configuration sheet a unique css ID based on their entity ID
   * @return {string}
   */
  get id() {
    return `scene-notes-${this.object._id}`;
  }


  /* -------------------------------------------- */

  /**
   * Put the Scene name in the window title
   * @return {String}
   */
  get title() {
    return `${this.entity.name}: Notes`;
  }
}

CONFIG.Scene.sheetClass = SceneSheet;
CONFIG.Scene.notesClass = SceneNotes;

/**
 * Entity Sheet Configuration Application
 * @type {FormApplication}
 * @params entity {Entity}      The Entity object for which the sheet is being configured
 * @params options {Object}     Additional Application options
 */
class EntitySheetConfig extends FormApplication {
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "sheet-config";
	  options.template = "templates/sheets/sheet-config.html";
	  options.width = 400;
	  return options;
  }

  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   * @type {String}
   */
  get title() {
    return `${this.object.name}: Sheet Configuration`;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  getData() {
    const entityName = this.object.entity;
    const config = CONFIG[entityName];
    const type = this.object.data.type || "base";
    const classes = Object.values(config.sheetClasses[type]);
    return {
      entityName: entityName,
      isGM: game.user.isGM,
      object: duplicate(this.object.data),
      options: this.options,
      sheetClass: this.object.getFlag("core", "sheetClass"),
      sheetClasses: classes.map(c => c.id),
      defaultClass: classes.find(c => c.default).id
    }
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  async _updateObject(event, formData) {
    event.preventDefault();
    const original = this.getData();

    // De-register the current sheet class
    const sheet = this.object.sheet;
    await sheet.close();
    this.object._sheet = null;
    delete this.object.apps[sheet.appId];

    // Update world settings
    if ( game.user.isGM && (formData.defaultClass !== original.defaultClass) ) {
      const setting = await game.settings.get("core", "sheetClasses") || {};
      mergeObject(setting, {[`${this.object.entity}.${this.object.data.type}`]: formData.defaultClass});
      await game.settings.set("core", "sheetClasses", setting);
    }

    // Update the Entity-specific override
    if ( formData.sheetClass !== original.sheetClass ) {
      await this.object.setFlag("core", "sheetClass", formData.sheetClass);
    }

    // Re-draw the updated sheet
    this.object.sheet.render(true);
  }
}

/**
 * Tile Config Sheet
 * @type {FormApplication}
 *
 * @params tile {Tile}                The Tile object being configured
 * @params options {Object}           Additional application rendering options
 * @params options.preview {Boolean}  Configure a preview version of a tile which is not yet saved
 */
class TileConfig extends FormApplication {
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "tile-config";
	  options.classes = ["sheet", "tile-sheet"];
	  options.title = "Tile Configuration";
	  options.template = "templates/scene/tile-config.html";
	  options.width = 400;
	  return options;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  getData() {
    return {
      object: duplicate(this.object.data),
      options: this.options,
      submitText: this.options.preview ? "Create" : "Update"
    }
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {
    if (!game.user.isGM) throw "You do not have the ability to configure a Tile object.";
    if ( this.object.id ) {
      formData["id"] = this.object.id;
      this.object.update(canvas.scene._id, formData);
    }
    else this.object.constructor.create(canvas.scene._id, formData);
  }

  /* -------------------------------------------- */

  /**
   * Extend the application close method to clear any preview sound aura if one exists
   */
  close() {
    super.close();
    if ( this.preview ) {
      this.preview.removeChildren();
      this.preview = null;
    }
  }
}

/* -------------------------------------------- */

/**
 * The Chat Bubble Class
 * This application displays a temporary message sent from a particular Token in the active Scene.
 * The message is displayed on the HUD layer just above the Token.
 */
class ChatBubbles {
  constructor() {
    this.template = "templates/hud/chat-bubble.html";

    /**
     * Track active Chat Bubbles
     * @type {Object}
     */
    this.bubbles = {};

    /**
     * Track which Token was most recently panned to highlight
     * Use this to avoid repeat panning
     * @type {Token}
     * @private
     */
    this._panned = null;
  }

	/* -------------------------------------------- */

  /**
   * A reference to the chat bubbles HTML container in which rendered bubbles should live
   * @return {jQuery}
   */
  get container() {
    return $("#chat-bubbles");
  }

	/* -------------------------------------------- */

  /**
   * Speak a message as a particular Token, displaying it as a chat bubble
   * @param {Token} token       The speaking Token
   * @param {String} message    The spoken message text
   * @param {Boolean} emote     Whether to style the speech bubble as an emote
   * @return {Promise}          A Promise which resolves once the chat bubble has been created
   */
  async say(token, message, {emote=false}={}) {
    if ( !token || !message ) return;
    let allowBubbles = game.settings.get("core", "chatBubbles");
    if ( !allowBubbles ) return;

    // Clear any existing bubble for the speaker
    await this._clearBubble(token);

    // Create the HTML
    let html = $(await this._renderHTML({token, message, emote}));

    // Set initial dimensions
    let dimensions = this._getMessageDimensions(message);
    this._setPosition(token, html, dimensions);

    // Append to DOM
    this.container.append(html);

    // Pan to the speaker
    if ( this._panned !== token ) {
      canvas.animatePan({x: token.x, y: token.y, scale: Math.max(1, canvas.stage.scale.x), duration: 1000});
      this._panned = token;
    }

    // Get animation duration and settings
    let duration = this._getDuration(html),
        scroll = dimensions.unconstrained - dimensions.height;

    // Animate the bubble
    html.fadeIn(250, () => {

      // Animate scrolling the content
      if ( scroll > 0 ) {
        html.find(".bubble-content").animate({ top: -1 * scroll }, duration - 1000, 'linear');
      }

      // Set a timer to fade out and remove the bubble
      setTimeout(() => html.fadeOut(250, () => {
        html.remove();
      }), duration);
    });
  }

	/* -------------------------------------------- */

  /**
   * Clear any existing chat bubble for a certain Token
   * @param {Token} token
   * @private
   */
  async _clearBubble(token) {
    let existing = $(`.chat-bubble[data-token-id="${token.id}"]`);
    if ( !existing.length ) return;
    return new Promise(resolve => {
      existing.fadeOut(100, () => {
        existing.remove();
        resolve();
      });
    })
  }

	/* -------------------------------------------- */

  /**
   * Render the HTML template for the chat bubble
   * @param {Object} data     Template data
   * @return {Promise}        The rendered HTML
   * @private
   */
  async _renderHTML(data) {
    data.cssClasses = [
      data.emote ? "emote" : null
    ].filter(c => c !== null).join(" ");
    return renderTemplate(this.template, data);
  }

	/* -------------------------------------------- */

  /**
   * Before displaying the chat message, determine it's constrained and unconstrained dimensions
   * @param {String} message    The message content
   * @return {Object}           The rendered message dimensions
   * @private
   */
  _getMessageDimensions(message) {
    let div = $(`<div class="chat-bubble" style="visibility:hidden">${message}</div>`);
    $('body').append(div);
    let dims = {
      width: div[0].clientWidth + 8,
      height: div[0].clientHeight
    };
    div.css({maxHeight: "none"});
    dims.unconstrained = div[0].clientHeight;
    div.remove();
    return dims;
  }

	/* -------------------------------------------- */

  /**
   * Assign styling parameters to the chat bubble, toggling either a left or right display (randomly)
   * @private
   */
  _setPosition(token, html, dimensions) {
    let cls = Math.random() > 0.5 ? "left" : "right";
    html.addClass(cls);
    const pos = {
      height: dimensions.height,
      width: dimensions.width,
      top: token.y - dimensions.height - 8
    };
    if ( cls === "right" ) pos.left = token.x - (dimensions.width - token.w);
    else pos.left = token.x;
    html.css(pos);
  }

  /* -------------------------------------------- */

  /**
  * Determine the length of time for which to display a chat bubble.
  * Research suggests that average reading speed is 200 words per minute.
  * Since these are short-form messages, we multiply reading speed by 1.5.
  * Clamp the result between 1 second (minimum) and 20 seconds (maximum)
  * @param {jQuery}     The HTML message
  * @returns {Number}   The number of milliseconds for which to display the message
  */
  _getDuration(html) {
    let words = html.text().split(" ").map(w => w.trim()).length;
    let ms = (words * 60 * 1000) / 300;
    return Math.clamped(1000, ms, 20000);
  }
}








/**
 * Render the HUD container
 * @type {Application}
 */
class HeadsUpDisplay extends Application {
  constructor(...args) {
    super(...args);

    /**
     * Token HUD
     * @type {TokenHUD}
     */
    this.token = new TokenHUD();
    this.tile = new TileHUD();

    /**
     * Chat Bubbles
     * @type {ChatBubbles}
     */
    this.bubbles = new ChatBubbles();
  }

  /* -------------------------------------------- */

  /**
   * Define default options which configure the HUD
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
    options.id = "hud";
	  options.template = "templates/hud/hud.html";
    options.popOut = false;
    return options;
  }

  /* -------------------------------------------- */

  getData() {
    if ( !canvas.ready ) return {};
    return {
      width: canvas.dimensions.width,
      height: canvas.dimensions.height
    }
  }

  /* -------------------------------------------- */

  async _render(...args) {
    await super._render(...args);
    this.align();
  }

  /* -------------------------------------------- */

  align() {
    const hud = this.element[0];
    let {x, y} = canvas.background.getGlobalPosition();
    let scale = canvas.stage.scale.x;
    hud.style.left = x+"px";
    hud.style.top = y+"px";
    hud.style.transform = `scale(${scale})`;
  }
}

/**
 * Scene controls navigation menu
 * @type {Application}
 */
class SceneControls extends Application {
	constructor(options) {
	  super(options);

	  // Configure tools
	  this.activeControl = "token";
	  this.controls = this.configure();
	}

	/* -------------------------------------------- */

  /**
   * Assign the default options which are supported by the SceneControls ui
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.width = 100;
	  options.id = "controls";
	  options.template = "templates/hud/controls.html";
	  options.popOut = false;
	  return options;
  }

  /* -------------------------------------------- */

	get activeTool() {
	  return this.controls[this.activeControl]["activeTool"];
  }

  get activeLayer() {
	  return this.controls[this.activeControl].layer;
  }

  get isRuler() {
	  return this.activeTool === "ruler";
  }

	/* -------------------------------------------- */

	configure() {
	  const controls = {},
          isGM = game.user.isGM,
	        isTrusted = game.user.isTrusted;

	  // Token Controls
    controls["token"] = {
      name: "Basic Controls",
      layer: "TokenLayer",
      icon: "fas fa-user-alt",
      tools: {
        select: {
          name: "Select Tokens",
          icon: "fas fa-expand"
        },
        ruler: {
          name: "Measure Distance",
          icon: "fas fa-ruler"
        }
      },
      activeTool: "select"
    };

    // Measurement Layer Tools
    controls["measure"] = {
      name: "Measurement Controls",
      layer: "TemplateLayer",
      icon: "fas fa-ruler-combined",
      tools: {
        circle: {
          name: "Circle Template",
          icon: "far fa-circle",
          visible: isTrusted
        },
        cone: {
          name: "Cone Template",
          icon: "fas fa-angle-left",
          visible: isTrusted
        },
        rect: {
          name: "Rectangle Template",
          icon: "far fa-square",
          visible: isTrusted
        },
        ray: {
          name: "Ray Template",
          icon: "fas fa-arrows-alt-v",
          visible: isTrusted
        },
        clear: {
          name: "Clear Templates",
          icon: "fas fa-trash",
          onClick: () => canvas.templates.deleteAll(),
          visible: isGM
        }
      },
      activeTool: "circle"
    };

    // Tiles Layer
    controls['tiles'] = {
      name: "Tile Controls",
      layer: "TilesLayer",
      icon: "fas fa-cubes",
      visible: isGM,
      tools: {
        select: {
          name: "Select Tiles",
          icon: "fas fa-expand"
        },
        tile: {
          name: "Place Tile",
          icon: "fas fa-cube"
        }
      },
      activeTool: "select"
    };

    // Walls Layer Tools
    controls['walls'] = {
      name: "Wall Controls",
      layer: "WallsLayer",
      icon: "fas fa-university",
      visible: isGM,
      tools: {
        walls: {
          name: "Draw Walls",
          icon: "fas fa-bars"
        },
        invisible: {
          name: "Invisible Walls",
          icon: "fas fa-eye-slash"
        },
        terrain: {
          name: "Terrain Walls",
          icon: "fas fa-mountain"
        },
        ethereal: {
          name: "Ethereal Walls",
          icon: "fas fa-mask"
        },
        doors: {
          name: "Draw Doors",
          icon: "fas fa-door-open"
        },
        secret: {
          name: "Secret Doors",
          icon: "fas fa-user-secret"
        },
        clone: {
          name: "Clone Wall",
          icon: "far fa-clone"
        },
        clear: {
          name: "Clear Walls",
          icon: "fas fa-trash",
          onClick: () => canvas.walls.deleteAll()
        }
      },
      activeTool: "walls"
    };

    // Lighting Layer Tools
    controls['lighting'] = {
      name: "Lighting Controls",
      layer: "LightingLayer",
      icon: "far fa-lightbulb",
      visible: isGM,
      tools: {
        light: {
          name: "Add Light",
          icon: "fas fa-lightbulb"
        },
        clear: {
          name: "Clear Lights",
          icon: "fas fa-trash",
          onClick: () => canvas.lighting.deleteAll()
        },
        reset: {
          name: "Reset Fog",
          icon: "fas fa-cloud",
          onClick: () => {
            new Dialog({
              title: "Reset Fog of War Exploration?",
              content: "<p>This will reset fog of war for this Scene for all players.</p>",
              buttons: {
                yes: {
                  icon: '<i class="fas fa-check"></i>',
                  label: "Yes",
                  callback: () => canvas.sight.resetFog()
                },
                no: {
                  icon: '<i class="fas fa-times"></i>',
                  label: "No"
                }
              }
            }).render(true);
          }
        }
      },
      activeTool: "light"
    };

    // Sounds Layer Tools
    controls['sounds'] = {
      name: "Ambient Sound Controls",
      layer: "SoundsLayer",
      icon: "fas fa-music",
      visible: isGM,
      tools: {
        sound: {
          name: "Add Sound",
          icon: "fas fa-volume-up"
        },
        clear: {
          name: "Clear Sounds",
          icon: "fas fa-trash",
          onClick: () => canvas.sounds.deleteAll()
        }
      },
      activeTool: "sound"
    };

    // Notes Layer Tools
    controls['notes'] = {
      name: "Scene Notes Controls",
      layer: "NotesLayer",
      icon: "fas fa-bookmark",
      tools: {
        select: {
          name: "Select Notes",
          icon: "fas fa-expand"
        },
        toggle: {
          name: "Always Display",
          icon: "fas fa-map-pin",
          toggle: true
        },
        clear: {
          name: "Clear Notes",
          icon: "fas fa-trash",
          onClick: () => canvas.notes.deleteAll(),
          visible: isGM
        }
      },
      activeTool: 'select'
    };
	  return controls;
  }


	/* -------------------------------------------- */

  /**
   * Provide data to the HTML template for rendering
   * @return {Object}
   */
	getData() {

	  // Restrict the subset of controls which should be displayed
    const controls = Object.keys(this.controls).reduce((obj, key) => {

      // Get the control set
      const set = this.controls[key];
      if ( set.visible === false ) return obj;
      set.css = this.activeControl === key ? "active" : "";

      // Prepare tool data
      set.tools = Object.keys(set.tools).reduce((tools, name) => {
        const tool = set.tools[name];

        // Determine tool CSS rules
        let isActive = (set.activeTool === name) || (tool.toggle && tool.active);
        tool.css = [
          tool.toggle ? "toggle" : null,
          isActive ? "active" : null
        ].filter(t => !!t).join(" ");

        // Exclude tools which are not visible
        if ( tool.visible !== false ) tools[name] = tool;
        return tools;
      }, {});

      // Include layers which have at least one visible tool
      if ( Object.keys(set.tools).length ) obj[key] = set;
      return obj;
    }, {});

    // Return data for rendering
	  return {
	    active: canvas.scene,
      controls: controls
    };
  }

	/* -------------------------------------------- */

	activateLayer(layerName) {
	  for ( let [k, v] of Object.entries(this.controls) ) {
	    if ( v.layer === layerName ) {
	      this.activeControl = k;
	      this.render();
	      break;
      }
    }
  }

	/* -------------------------------------------- */

  activateListeners(html) {
    html.find('.scene-control').click(ev => {
      let li = $(ev.currentTarget),
          control = li.attr("data-control");
      canvas.getLayer(this.controls[control].layer).activate();
    });

    // Took Clicks
    html.find('.control-tool').click(this._onClick.bind(this));
  }


	/* -------------------------------------------- */

  /**
   * Handle click events on Tool controls
   * @param {Event} event   A click event on a tool control
   * @private
   */
  _onClick(event) {
    event.preventDefault();
    let li = $(event.currentTarget),
        toolName = li.attr("data-tool"),
        ctrl = this.controls[this.activeControl],
        tool = ctrl.tools[toolName];

    // Handle Toggles
    if ( tool.toggle ) {
      tool.active = !tool.active;
      if ( tool.onToggle instanceof Function ) tool.onToggle(tool.active);
    }

    // Handle Clicks
    else {
      ctrl.activeTool = toolName;
      if ( tool.onClick instanceof Function ) tool.onClick();
    }

    // Render the tools
    this.render();
  }
}

/* -------------------------------------------- */
/**
 * An abstract base class for displaying a heads-up-display interface bound to a Placeable Object on the canvas
 * @type {Application}
 */
class BasePlaceableHUD extends Application {
  constructor(...args) {
    super(...args);

    /**
     * Reference a PlaceableObject this HUD is currently bound to
     * @type {PlaceableObject}
     */
    this.object = null;

    /**
     * Track the HUD display state
     * @type {Number}
     */
    this._displayState = null;
  }

	/* -------------------------------------------- */

  /**
   * Define the default options which are supported by any BasePleaceableHUD subclass
   * @type {Object}
   */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
	    classes: ["placeable-hud"],
      popOut: false
    });
  }

	/* -------------------------------------------- */
  /*  Methods
	/* -------------------------------------------- */

  /**
   * Bind the HUD to a new PlaceableObject and display it
   * @param {PlaceableObject} object    A PlaceableObject instance to which the HUD should be bound
   */
	bind(object) {
	  this.clear();

	  // Record the new object
	  if ( !(object instanceof PlaceableObject) || object.scene !== canvas.scene ) {
	    throw new Error("You may only bind a HUD instance to a PlaceableObject in the currently viewed Scene.")
    }
	  this.object = object;

    // Render the HUD
    this.render(true);
    this._displayState = this.constructor.DISPLAY_STATES.RENDERING;
    this.element.hide().fadeIn(200, () => {
      this._displayState = this.constructor.DISPLAY_STATES.RENDERED;
    });
  }

	/* -------------------------------------------- */

  /**
   * Clear the HUD by fading out it's active HTML and recording the new display state
   */
	clear() {
	  const el = this.element;
	  let states = this.constructor.DISPLAY_STATES;
	  if ( !el.is(":visible") ) return;
	  this._displayState = states.CLEARING;
	  this.element.fadeOut(200, () => this._displayState = states.NONE);
  }


	/* -------------------------------------------- */

  /**
   * Set the position of the HUD element after rendering it and flag the latest display state
   * @private
   */
	async _render(...args) {
	  await super._render(...args);
	  this.setPosition();
	  this._displayState = this.constructor.DISPLAY_STATES.RENDERED;
  }

	/* -------------------------------------------- */

  getData() {
    const data = duplicate(this.object.data);
    return mergeObject(data, {
      id: this.id,
      classes: this.options.classes.join(" "),
      appId: this.appId,
      isGM: game.user.isGM,
    });
  }

	/* -------------------------------------------- */

	setPosition(options={}) {
	  const position = {
	    width: options.width || this.object.width,
      height: options.height || this.object.height,
      left: options.left || this.object.x,
      top: options.top || this.object.y
    };
    this.element.css(position);
  }
}

/* -------------------------------------------- */


/**
 * BasePlaceableHUD display states
 * @type {Object}
 */
BasePlaceableHUD.DISPLAY_STATES = {
  NONE: 0,
  RENDERING: 1,
  RENDERED: 2,
  CLEARING: 3
};
/**
 * A simple main menu application
 * @type {Application}
 */
class MainMenu extends Application {
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "menu";
	  options.template = "templates/hud/menu.html";
	  options.popOut = false;
	  return options;
  }

	/* -------------------------------------------- */

  getData() {
    return {
      items: this.items
    }
  }

  /* ----------------------------------------- */

  get items() {
    return {
       reload: {
        label: "MENU.Reload",
        icon: '<i class="fas fa-redo"></i>',
        enabled: true,
        onClick: () => window.location.reload()
      },
      player: {
        label: "MENU.Logout",
        icon: '<i class="fas fa-user"></i>',
        enabled: true,
        onClick: () => window.location.href = '/join'
      },
      players: {
        label: "MENU.Players",
        icon: '<i class="fas fa-users"></i>',
        enabled: game.user.isGM,
        onClick: () => window.location.href = '/players'
      },
      world: {
        label: "MENU.World",
        icon: '<i class="fas fa-globe"></i>',
        enabled: game.user.isGM,
        onClick: () => window.location.href = '/setup'
      }
    }
  }

  /* ----------------------------------------- */

  activateListeners(html) {
    for ( let [k, v] of Object.entries(this.items) ) {
      html.find('.menu-'+k).click(ev => v.onClick());
    }
  }

  /* ----------------------------------------- */

  /**
   * Toggle display of the menu (or render it in the first place)
   */
  toggle() {
    let menu = this.element;
    if ( !menu.length ) this.render(true);
    else menu.slideToggle(150);
  }
}
/**
 * Top menu scene navigation
 * @type {Application}
 */
class SceneNavigation extends Application {
	constructor(options) {
	  super(options);
	  game.scenes.apps.push(this);
	}

	/* -------------------------------------------- */

  /**
   * Assign the default options which are supported by the SceneNavigation UI
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "navigation";
	  options.template = "templates/hud/navigation.html";
	  options.popOut = false;
	  return options;
  }

	/* -------------------------------------------- */
  /*  Application Rendering
	/* -------------------------------------------- */

  /**
   * Extend the Application.render logic to first check the rendering context to see what was changed
   * If a specific context was provided, make sure an update to the navigation is necessary before rendering
   */
  render(force, context={}) {
    if ( context.renderContext ) {
      const events = ["createScene", "updateScene", "deleteScene"];
      if ( !events.includes(context.renderContext) ) return;
      const update = ["name", "permission", "permission.default", "active", "navigation"];
      if ( context.renderContext === "updateScene" && !update.some(k => context.changed.includes(k)) ) return;
    }
    return super.render(force, context);
  }

	/* -------------------------------------------- */

  /**
   * Prepare the default data which is required to render the SceneNavigation menu
   */
	getData() {
    const scenes = game.scenes.entities.filter(s => s.active || s.isView || s.data.navigation);
    return scenes.map(s => {
      let data = duplicate(s.data);
      let users = game.users.entities.filter(u => u.active && u.data.scene === s._id);
	    data.users = users.map(u => { return {letter: u.name[0], color: u.data.color} });
	    data.visible = (game.user.isGM || s.owner || s.active);
	    data.css = [
	      s.isView ? "view" : null,
        s.active ? "active" : null,
        data.permission.default === 0 ? "gm" : null
      ].filter(c => !!c).join(" ");
	    return data;
    });
  }

	/* -------------------------------------------- */

  /**
   * Activate Scene Navigation event listeners
   * @param html
   */
  activateListeners(html) {

    // Click event listener
    html.find('.scene-name').click(event => {
      let sceneId = event.currentTarget.parentElement.getAttribute('data-scene-id');
      game.scenes.get(sceneId).view();
    });

    // Context Menu - GM Only
    if ( !game.user.isGM ) return;
    new ContextMenu(html, ".scene", [
      {
        name: "Activate",
        icon: '<i class="fas fa-bullseye"></i>',
        callback: li => {
          let scene = game.scenes.get(li.attr("data-scene-id"));
          scene.activate();
        }
      },
      {
        name: "Configure",
        icon: '<i class="fas fa-cogs"></i>',
        callback: li => {
          let scene = game.scenes.get(li.attr("data-scene-id"));
          scene.sheet.render(true);
        }
      },
      {
        name: "Notes",
        icon: '<i class="fas fa-scroll"></i>',
        callback: li => {
          let scene = game.scenes.get(li.attr("data-scene-id"));
          scene.notes.render(true);
        }
      },
      {
        name: "Preload",
        icon: '<i class="fas fa-download"></i>',
        callback: li => {
          let sceneId = li.attr("data-scene-id");
          game.scenes.preload(sceneId, true);
        }
      },
      {
        name: "SCENES.ToggleNav",
        icon: '<i class="fas fa-compass"></i>',
        callback: li => {
          const scene = game.scenes.get(li.attr("data-scene-id"));
          scene.update({navigation: !scene.data.navigation});
        }
      }
    ]);
  }
}

/* -------------------------------------------- */
/**
 * Pause notification in the HUD
 * @type {Application}
 */
class Pause extends Application {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "pause";
    options.template = "templates/hud/pause.html";
    options.popOut = false;
    return options;
  }

  /* -------------------------------------------- */

  /**
   * Prepare the default data which is required to render the Pause UI
   */
  getData() {
    return {
      paused: game.paused
    };
  }
}

/* -------------------------------------------- */

/**
 * The active Player List application
 */
class PlayerList extends Application {
  constructor(options) {
    super(options);
    game.users.apps.push(this);

    // Flag display status
    this._showOffline = false;
  }

	/* -------------------------------------------- */

  /**
   * Assign the default options which are supported by the PlayerList UI
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "players";
	  options.template = "templates/user/players.html";
	  options.popOut = false;
	  return options;
  }

  /* -------------------------------------------- */

  /**
   * Prepare the default data which is required to render the PlayerList ui
   */
  getData() {
    const users = game.users.entities.filter(u => this._showOffline || u.active);
    for ( let u of users ) {
      u.charname = u.character ? u.character.name.split(" ")[0] : "";
      let color = u.active ? u.data.color : "#333333",
          rgb = PIXI.utils.hex2rgb(color.replace("#", "0x")),
          border = u.active ? PIXI.utils.hex2string(PIXI.utils.rgb2hex(rgb.map(c => Math.min(c * 2, 1)))) : "#000000";
      u.color = color;
      u.border = border;
    }
    return {
      users: users,
      showOffline: this._showOffline
    };
  }

  /* -------------------------------------------- */

  /**
   * Add a context menu to the players UI which allows players to control or release Actors that they own
   */
  activateListeners(html) {

    // Toggle online/offline
    html.find("h3").click(ev => {
      this._showOffline = !this._showOffline;
      this.render();
    });

    // Context menu
    new ContextMenu(html, ".player", {
      "Player Configuration": {
        icon: '<i class="fas fa-male"></i>',
        callback: li => {
          let userId = li.attr("data-user-id"),
              user = game.user.isGM ? game.users.get(userId) : game.user;
          new PlayerConfig(user).render(true)
        }
      }
    });
  }
}

/* -------------------------------------------- */

/**
 * The JournalEntry Configuration Sheet
 * @type {BaseEntitySheet}
 *
 * @params entity {JournalEntry}  The JournalEntry instance which is being edited
 * @params options {Object}       Application options
 */
class JournalSheet extends BaseEntitySheet {
  constructor(object, options={}) {
    super(object, options);
    this._sheetMode = this.options.sheetMode || this._inferDefaultMode();
  }

	/* -------------------------------------------- */

  _inferDefaultMode() {
    let hasText = !!this.object.data.content,
        hasImage = !!this.object.data.img;
    if ( hasImage && !hasText ) return "image";
    return "text";
  }

	/* -------------------------------------------- */

	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.template =
	  options.classes = ["sheet", "journal-sheet"];
    options.width = 720;
    options.height = 800;
    options.resizable = true;
    options.closeOnSubmit = false;
	  return options;
  }

	/* -------------------------------------------- */

  /**
   * Provide a unique CSS ID for Entity Sheets
   * @type {String}
   */
	get id() {
	  return `journal-${this.object.id}`;
  }

  /* -------------------------------------------- */

  get template() {
    if ( this._sheetMode === "image" ) return ImagePopout.defaultOptions.template;
    return "templates/journal/sheet.html";
  }

  /* -------------------------------------------- */

  /**
   * Suppress the JournalEntry title when an image is shown to players whom do not have at least limited permission
   * @return {string|*}
   */
  get title() {
    if ( !this.object.hasPerm(game.user, "LIMITED") ) return "";
    return this.object.name;
  }

	/* -------------------------------------------- */

  /**
   * Extend the default Application rendering function to adjust the positioning based on image dimensions
   * See the documentation for Application._render for more detail
   * @return {Promise}
   * @private
   */
  async _render(force, options={}) {

    // Determine the sheet rendering mode
    const mode = options.sheetMode || this._sheetMode;
    if ( (mode === this._sheetMode) && this._rendered ) return super._render(force, options);

    // Asynchronously begin closing the current sheet
    let promises = [this.close()];

    // Update image sizing
    if ( mode === "image" ) {
      const img = this.object.data.img;
      if ( img ) promises.push(ImagePopout.getPosition(img).then(position => {
        this.position = position;
      }));
      options.classes = this.options.classes.concat(ImagePopout.defaultOptions.classes);
    }

    // Update text sizing
    else if ( mode === "text" ) {
      this.position = { width: this.options.width, height: this.options.height };
    }

    // Render the new sheet once things are processed
    return Promise.all(promises).then(() => {
      this._sheetMode = mode;
      super._render(force, options);
    });
  }

	/* -------------------------------------------- */

  /**
   * Extend the Header Button configuration for the Journal Sheet to add a toggle between Text and Image modes
   * See Application._getHeaderButtons for documentation of the return Array structure.
   * @return {Array.<Object>}
   * @private
   */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    let isOwner = this.object.owner,
        atLeastLimited = this.object.hasPerm(game.user, "LIMITED"),
        hasMultipleModes = this.object.data.img && this.object.data.content;

    // Image Mode
    if ( isOwner || (atLeastLimited && hasMultipleModes) ) {
      buttons.unshift({
        label: "Image",
        class: "entry-image",
        icon: "fas fa-image",
        onclick: ev => this._onSwapMode(ev, "image")
      })
    }

    // Text Mode
    if ( isOwner || (atLeastLimited && hasMultipleModes) ) {
      buttons.unshift({
        label: "Text",
        class: "entry-text",
        icon: "fas fa-file-alt",
        onclick: ev => this._onSwapMode(ev, "text")
      })
    }

    // Share Entry
    if ( game.user.isGM ) {
      buttons.unshift({
        label: "Show Players",
        class: "share-image",
        icon: "fas fa-eye",
        onclick: ev => this._onShowPlayers(ev)
      });
    }
    return buttons
  }

  /* -------------------------------------------- */

  /**
   * Prepare data used to render the Journal Sheet
   * @return {Object}   The data object used to render the journal entry
   */
  getData() {
    const data = super.getData();
    data.title = this.title;
    data.image = this.object.data.img;
    data.folders = game.data.folders.filter(f => f.type === "JournalEntry");
    return data
  }

  /* -------------------------------------------- */

  _updateObject(event, formData) {
    if ( this._sheetMode === "image" ) {
      formData.name = formData.title;
      formData.img = formData.image;
    }
    super._updateObject(event, formData);
  }

  /* -------------------------------------------- */

  async _onSwapMode(event, mode) {
    event.preventDefault();
    this.render(true, {sheetMode: mode});
  }

  /* -------------------------------------------- */

  _onShowPlayers(event) {
    event.preventDefault();
    this.object.show(this._sheetMode, true);
  }
}

CONFIG.JournalEntry.sheetClass = JournalSheet;

/**
 * Placeable Note configuration sheet
 * @type {FormApplication}
 * @params note {Note}          The Note object for which settings are being configured
 * @params options {Object}     Additional Application options
 */
class NoteConfig extends FormApplication {
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "note-config";
    options.title = "Journal Note Configuration";
	  options.template = "templates/scene/note-config.html";
	  options.width = 400;
	  return options;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  getData() {
    const entry = game.journal.get(this.object.data.entryId) || {};
    return {
      entryId: entry._id,
      entries: game.journal.entities,
      object: duplicate(this.object.data),
      options: this.options,
      entryName: entry.name,
      entryIcons: CONFIG.JournalEntry.noteIcons
    }
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {
    if ( this.object.id ) {
      formData["id"] = this.object.id;
      this.object.update(canvas.scene._id, formData);
    }
    else {
      this.object.constructor.create(canvas.scene._id, formData);
      canvas.notes.preview.removeChildren();
    }
  }

  /* -------------------------------------------- */

  /**
   * Extend the logic applied when the application is closed to clear any preview notes
   * @return {Promise}
   */
  async close() {
    if ( !this.object.id ) canvas.notes.preview.removeChildren();
    return super.close();
  }
}

/**
 * An implementation of the PlaceableHUD base class which renders a heads-up-display interface for Tile objects.
 * @type {BasePlaceableHUD}
 */
class TileHUD extends BasePlaceableHUD {
  /**
   * Assign the default options which are supported by the entity edit sheet
   * @type {Object}
   */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
	    id: "tile-hud",
      template: "templates/hud/tile-hud.html"
    });
  }

	/* -------------------------------------------- */

  /**
   * Extend the data object provided to render HTML for the Tile HUD
   * @return {Object}
   */
  getData() {
    const data = super.getData();
    mergeObject(data, CONFIG.Tile, {inplace: true});
    return mergeObject(data, {
      lockedClass: data.locked ? "active" : "",
      visibilityClass: data.hidden ? "active" : "",
    });
  }

	/* -------------------------------------------- */

	setPosition() {
	  const position = {
	    width: this.object.data.width + 140,
      height: this.object.data.height + 10,
      left: this.object.x - 70,
      top: this.object.y - 5
    };
    this.element.css(position);
  }

	/* -------------------------------------------- */

  /**
   * Activate event listeners which provide interactivity for the Token HUD application
   * @param html
   */
  activateListeners(html) {
    html.find(".visibility").click(this._onToggleVisibility.bind(this));
    html.find(".locked").click(this._onToggleLocked.bind(this));
  }

	/* -------------------------------------------- */

  /**
   * Toggle Tile visibility state
   * @private
   */
  async _onToggleVisibility(event) {
    event.preventDefault();
    await this.object.update(canvas.scene._id, {hidden: !this.object.data.hidden});
    $(event.currentTarget).toggleClass("active");
  }

	/* -------------------------------------------- */

  /**
   * Toggle Tile locked state
   * @private
   */
  async _onToggleLocked(event) {
    event.preventDefault();
    await this.object.update(canvas.scene._id, {locked: !this.object.data.locked});
    $(event.currentTarget).toggleClass("active");
  }
}

/**
 * A Token Configuration Application
 * @type {FormApplication}
 *
 * @params token {Token}      The Token object for which settings are being configured
 * @params options {Object}   TokenConfig ui options (see Application)
 *
 * @params options.configureDefault {Boolean}   Configure the default actor token on submit
 */
class TokenConfig extends FormApplication {
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "token-config";
	  options.classes = ["sheet", "token-sheet"];
	  options.template = "templates/scene/token-config.html";
	  options.width = 480;
	  options.height = 360;
	  return options;
  }

	/* -------------------------------------------- */

  /**
   * Convenience access for the Token object
   * @return {Token}
   */
  get token() {
	  return this.object;
  }

  /* -------------------------------------------- */

  /**
   * Convenience access for the Token's linked Actor
   * @return {*}
   */
  get actor() {
    return this.token.actor;
  }

	/* -------------------------------------------- */

  /**
   * Dynamic sheet title with the token name
   * @return {String}
   */
  get title() {
    if ( this.options.configureDefault ) return `[${game.i18n.localize("TOKEN.TitlePrototype")}] ${this.actor.name}`;
    return `${this.token.name}: ${game.i18n.localize("TOKEN.Title")}`;
  }

  /* -------------------------------------------- */

  /**
   * Convert Token display modes to an object of values and labels
   * @return {Object}
   */
  get displayModes() {
    const modes = {};
    for ( let [k, v] of Object.entries(TOKEN_DISPLAY_MODES) ) {
      modes[v] = k.replace("_", " ").titleCase();
    }
    return modes;
  }

  /* -------------------------------------------- */

  /**
   * Prepare token configuration data
   * @returns {Object}  The data object used for Token Config HTML rendering
   */
  async getData() {
    const actor = this.token.actor;
    let hasAlternates = actor ? actor.data.token.randomImg : false;
    return {
      cssClasses: [this.options.configureDefault ? "prototype" : null].filter(c => !!c).join(" "),
      isPrototype: this.options.configureDefault,
      hasAlternates: hasAlternates,
      alternateImages: hasAlternates ? await actor.getTokenImages() : [],
      object: duplicate(this.token.data),
      options: this.options,
      gridUnits: canvas.ready ? canvas.scene.data.gridUnits : game.system.gridUnits,
      barAttributes: this.getBarAttributes(),
      displayModes: this.displayModes,
      actors: game.actors.entities.map(a => { return {'_id': a._id, 'name': a.name}}).sort(),
      dispositions: Object.keys(TOKEN_DISPOSITIONS).reduce((obj, key) => {
        obj[game.i18n.localize(`TOKEN.${key}`)] = TOKEN_DISPOSITIONS[key];
        return obj;
      }, {}),
    };
  }

  /* -------------------------------------------- */

  /**
   * Inspect the Actor data model and identify the set of attributes which could be used for a Token Bar
   * @return {*[]|Array}
   */
  getBarAttributes() {
    let actor = this.token.actor;
    if ( actor ) {
      let valid = this._getBarAttributes(actor.data.data);
      return valid.map(v => v.join('.'));
    }
    return [];
  }

  /**
   * Test whether an individual data object is a valid attribute - containing both a numeric value and max
   * @private
   */
  _getBarAttributes(data, parent) {
    parent = parent || [];
    let valid = [];
    for ( let [k, v] of Object.entries(data) ) {
      if ( v instanceof Object ) {
        let p = parent.concat([k]);
        if ( Number.isFinite(parseFloat(v.value)) && Number.isFinite(parseFloat(v.max)) ) valid.push(p);
        else valid = valid.concat(this._getBarAttributes(data[k], p));
      }
    }
    return valid;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Activate listeners to handle events in the rendered HTML
   */
	activateListeners(html) {
	  super.activateListeners(html);

    // Activate tab navigation
    new Tabs(html.find(".tabs"), this.token.data.flags["_configTab"], clicked => {
      this.actor.data.flags["_configTab"] = clicked.attr("data-tab");
    });

    // Update bar data when the target attribute is changed
    html.find(".bar-attribute").change(this._onBarChange.bind(this));

    // Scale tooltip
    html.find('[name="scale"]').change(ev => {
      ev.currentTarget.nextElementSibling.textContent = ev.currentTarget.value;
    });

    // Alternate image assignment
    html.find(".alternate-images").change(ev => ev.target.form.img.value = ev.target.value);

    // Handle Token assignment
    html.find('button.assign-token').click(this._onAssignToken.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {

    // Verify the user has the ability to update a Token configuration
    if (!game.user.isTrusted || !this.token.owner) {
      throw new Error("You do not have permission to configure this token");
    }

    // Configure prototype Token data
    if ( formData.actorId && this.options.configureDefault ) {
      this._updateActorData(formData);
    }

    // Update a token on the canvas
    if ( this.token.parent !== null ) {
      this.token.update(canvas.scene._id, formData);
    }
  }

  /* -------------------------------------------- */

  /**
   * Update certain fields of a linked actor token when token configuration is changed
   * @param tokenData {Object}    The new token data
   */
  _updateActorData(tokenData) {

    // Get the actor to update
    let actor = this.token.actor;
    if ( !actor ) return;
    let actorData = {};

    // Only update certain default token fields
    let update = {};
    for ( let [k, v] of Object.entries(tokenData) ) {
      if ( this.options.configureDefault || ["name", "img"].includes(k) || k.startsWith("bar.") ) {
        update[k] = v;
      }
    }
    actorData['token'] = mergeObject(actor.data.token, update, {insertKeys: false, inplace: false});

    // Update linked attribute bar values
    for ( let bar of ["bar1", "bar2"].filter(b => tokenData[b+".attribute"]) ) {
      let attr = tokenData[bar+'.attribute'];
      if ( hasProperty(actor.data.data, attr) ) {
        actorData[`data.${attr}.value`] = tokenData[bar+'.value'];
        actorData[`data.${attr}.max`] = tokenData[bar+'.max'];
      }
    }

    // Update the Actor
    actor.update(actorData);
  }

  /* -------------------------------------------- */

  /**
   * Handle Token assignment requests to update the default prototype Token
   * @private
   */
  _onAssignToken(event) {
    event.preventDefault();
    let tokens = canvas.ready ? canvas.tokens.controlled : [];
    if ( tokens.length !== 1 ) {
      html.shake(2, 20, 50);
      return;
    }

    // Update the controlled token
    const actor = this.actor;
    let token = duplicate(tokens.pop().data);
    token.tokenId = token.x = token.y = null;
    actor.update({token: token}).then(a => {
      ui.notifications.info(`Updated prototype Token configuration for ${actor.name}`);
    });
    this.close();
  }

  /* -------------------------------------------- */

  /**
   * Handle changing the attribute bar in the drop-down selector to update the default current and max value
   * @private
   */
  _onBarChange(ev) {
    const form = ev.target.form;
    const bar = ev.target.name.split('.')[0];
    let data = ev.target.value ? getProperty(this.actor.data.data, ev.target.value) : {value: "", max: ""};
    form.querySelector(`input.${bar}-value`).value = data.value;
    form.querySelector(`input.${bar}-max`).value = data.max;
  }
}

/**
 * An implementation of the PlaceableHUD base class which renders a heads-up-display interface for Token objects.
 * This interface provides controls for visibility, attribute bars, elevation, status effects, and more.
 * @type {BasePlaceableHUD}
 */
class TokenHUD extends BasePlaceableHUD {
  /**
   * Assign the default options which are supported by the entity edit sheet
   * @type {Object}
   */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
	    id: "token-hud",
      template: "templates/hud/token-hud.html"
    });
  }

	/* -------------------------------------------- */

  /**
   * When the TokenHUD is bound to a new Token, set the status effects flag back to false
   */
	bind(object) {
	  this._statusEffects = false;
	  super.bind(object);
  }

	/* -------------------------------------------- */

	setPosition() {
	  const position = {
	    width: this.object.w + 160,
      height: this.object.h + 100,
      left: this.object.x - 80,
      top: this.object.y - 50
    };
    this.element.css(position);
  }

	/* -------------------------------------------- */

  /**
   * Extend the data object provided to render HTML for the Token HUD
   * @return {Object}
   */
  getData() {
    const data = super.getData();
    mergeObject(data, CONFIG.Token, {inplace: true});
    return mergeObject(data, {
      canConfigure: game.user.isTrusted,
      canToggleCombat: canvas.scene.active,
      displayBar1: !!data.bar1.attribute,
      displayBar2: !!data.bar2.attribute,
      visibilityClass: data.hidden ? "active" : "",
      effectsClass: this._statusEffects ? "active": "",
      combatClass: this.object.inCombat ? "active" : "",
      statusEffects: CONFIG.statusEffects.map(src => {
        return {
          src: src,
          cssClass: [
            data.effects.includes(src) ? "active": null,
            data.overlayEffect === src ? "overlay" : null
          ].filter(c => !!c)
        }
      })
    });
  }

	/* -------------------------------------------- */

  /**
   * Activate event listeners which provide interactivity for the Token HUD application
   * @param html
   */
  activateListeners(html) {

    // Attribute Bars
    let attributeUpdate = this._onAttributeUpdate.bind(this);
    html.find(".attribute input").click(this._onAttributeClick).focusout(attributeUpdate).keydown(attributeUpdate);

    // Token Control Icons
    html.find(".config").click(this._onTokenConfig.bind(this));
    html.find(".combat").click(this._onToggleCombat.bind(this));
    html.find(".effects").click(this._onTokenEffects.bind(this));
    html.find(".visibility").click(this._onToggleVisibility.bind(this));

    // Status Effects Controls
    let effects = html.find(".status-effects");
    effects.on("click", ".effect-control", this._onToggleEffect.bind(this))
           .on("contextmenu", ".effect-control", this._onToggleOverlay.bind(this));
  }

	/* -------------------------------------------- */

  /**
   * Handle initial click to focus an attribute update field
   * @private
   */
  _onAttributeClick(event) {
    event.currentTarget.select();
  }

	/* -------------------------------------------- */

  /**
   * Handle attribute bar update
   * @private
   */
  _onAttributeUpdate(event) {

    // Filter keydown events for Enter
    if ( event.type === "keydown" ) {
      if (event.keyCode === KEYS.ENTER) this.clear();
      return;
    }
    event.preventDefault();

    // Determine new bar value
    let input = event.currentTarget,
        isDelta = input.value.startsWith("+") || input.value.startsWith("-"),
        value = Number(input.value);
    if ( !Number.isFinite(value) ) return;

    // Incremental handling for attribute bar
    let bar = input.dataset.bar;
    if ( bar ) {
      let attr = getProperty(this.object.data, bar);
      if ( isDelta ) value = Math.clamped(0, attr.value + value, attr.max);

      // Get the Actor to update
      const actor = Actor.fromToken(this.object);
      return actor.update({[`data.${attr.attribute}.value`]: value});
    }

    // Otherwise just treat as a number directly
    else value = Number(value);

    // Update the Token
    this.object.update(canvas.scene._id, {[input.name]: value});
  }

	/* -------------------------------------------- */

  /**
   * Toggle Token combat state
   * @private
   */
  _onToggleCombat(event) {
    event.preventDefault();
    let btn = $(event.currentTarget);
    this.object.toggleCombat().then(token => {
      if ( token.inCombat ) btn.addClass("active");
      else btn.removeClass("active");
    });
  }

	/* -------------------------------------------- */

  /**
   * Toggle Token visibility state
   * @private
   */
  _onToggleVisibility(event) {
    event.preventDefault();
    let btn = $(event.currentTarget);
    this.object.toggleVisibility().then(token => {
      if ( token.data.hidden ) btn.addClass("active");
      else btn.removeClass("active");
    });
  }

	/* -------------------------------------------- */

  /**
   * Handle Token configuration button click
   * @private
   */
  _onTokenConfig(event) {
    event.preventDefault();
    this.object.sheet.render(true);
  }

	/* -------------------------------------------- */

  /**
   * Assign Token status effects
   * @private
   */
  _onTokenEffects(event) {
    event.preventDefault();
    this._statusEffects = !this._statusEffects;
    let btn = $(event.currentTarget);
    let fx = btn.parents(".col").siblings(".status-effects");
    btn.toggleClass("active");
    fx.toggleClass("active");
  }

	/* -------------------------------------------- */

  /**
   * Handle toggling a token status effect icon
   * @private
   */
  _onToggleEffect(event) {
    event.preventDefault();
    let f = $(event.currentTarget);
    this.object.toggleEffect(f.attr("src"));
    f.toggleClass("active");
  }

	/* -------------------------------------------- */

  /**
   * Handle assigning a status effect icon as the overlay effect
   * @private
   */
  _onToggleOverlay(event) {
    event.preventDefault();
    let f = $(event.currentTarget);
    this.object.toggleOverlay(f.attr("src"));
    f.siblings().removeClass("overlay");
    f.toggleClass("overlay");
  }
}

/**
 * Wall Configuration Sheet
 * @type {FormApplication}
 * @params object {Wall}        The Wall object for which settings are being configured
 * @params options {Object}     Additional options which configure the rendering of the configuration sheet.
 */
class WallConfig extends FormApplication {
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "wall-config";
    options.title = "Wall Configuration";
	  options.template = "templates/scene/wall-config.html";
	  options.width = 400;
	  options.editMany = false;
	  options.editTargets = [];
	  return options;
  }

  /* -------------------------------------------- */

  /**
   * Provide a dynamically rendered title for the Wall Configuration sheet
   * @type {String}
   */
  get title() {
    let title = this.options.editMany ? "WALLS.TitleMany" : "WALLS.Title";
    return game.i18n.localize(title);
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  getData() {
    return {
      object: duplicate(this.object.data),
      options: this.options,
      moveTypes: Object.keys(WALL_MOVEMENT_TYPES).reduce((obj, key) => {
        let k = WALL_MOVEMENT_TYPES[key];
        obj[k] = key.titleCase();
        return obj;
      }, {}),
      senseTypes: Object.keys(WALL_SENSE_TYPES).reduce((obj, key) => {
        let k = WALL_SENSE_TYPES[key];
        obj[k] = key.titleCase();
        return obj;
      }, {}),
      dirTypes: Object.keys(WALL_DIRECTIONS).reduce((obj, key) => {
        let k = WALL_DIRECTIONS[key];
        obj[k] = key.titleCase();
        return obj;
      }, {}),
      doorTypes: Object.keys(WALL_DOOR_TYPES).reduce((obj, key) => {
        let k = WALL_DOOR_TYPES[key];
        obj[k] = key.titleCase();
        return obj;
      }, {}),
      doorStates: Object.keys(WALL_DOOR_STATES).reduce((obj, key) => {
        let k = WALL_DOOR_STATES[key];
        obj[k] = key.titleCase();
        return obj;
      }, {}),
      isDoor: this.object.data.door > WALL_DOOR_TYPES.NONE
    }
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {

    // Update many walls
    if ( this.options.editMany ) {
      const wallIds = this.options.editTargets;
      const walls = canvas.scene.data.walls.map(w => {
        if ( wallIds.includes(w.id) ) return mergeObject(w, formData);
        return w;
      });
      canvas.scene.update({walls: walls})
    }

    // Update single wall
    else this.object.update(canvas.scene._id, formData);
  }
}

/**
 * Render the Sidebar container, and after rendering insert Sidebar tabs
 */
class Sidebar extends Application {
  constructor(...args) {
    super(...args);

    /**
     * Sidebar navigation tabs
     * @type {Tabs}
     */
    this.tabs = null;

    /**
     * Track whether the sidebar container is currently collapsed
     * @type {Boolean}
     */
    this._collapsed = false;
  }

  /* -------------------------------------------- */

  /**
   * Assign the default options which are supported by this Application
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
    options.id = "sidebar";
	  options.template = "templates/sidebar/sidebar.html";
    options.popOut = false;
    options.width = 300;
    return options;
  }


	/* -------------------------------------------- */
  /*  Rendering
	/* -------------------------------------------- */

  /**
   * Extend the inner rendering function to re-render all contained sidebar tabs
   * @return {Promise.<void>}
   * @private
   */
	async _render(...args) {
	  await super._render(...args);

    // Render sidebar tabs
    ui.chat = new ChatLog().render();
    ui.combat = new CombatTracker().render();
    if ( game.user.isGM ) ui.scenes = new SceneDirectory().render();
    ui.actors = new ActorDirectory().render();
    ui.items = new ItemDirectory().render();
    ui.journal = new JournalDirectory().render();
    ui.playlists = new PlaylistDirectory().render();
    ui.compendium = new CompendiumDirectory().render();
    ui.settings = new Settings().render();
  }

 	/* -------------------------------------------- */

  getData() {
    return {user: game.user};
  }

	/* -------------------------------------------- */
  /*  Methods
	/* -------------------------------------------- */

  /**
   * Activate a Sidebar tab by it's name
   * @param {String} tabName      The tab name corresponding to it's "data-tab" attribute
   */
  activateTab(tabName) {
    if ( this.tabs ) this.tabs.activateTab(tabName);
  }

	/* -------------------------------------------- */

  /**
   * Expand the Sidebar container from a collapsed state.
   * Take no action if the sidebar is already expanded.
   */
  expand() {
    if ( !this._collapsed ) return;
    const sidebar = this.element;
    const tab = sidebar.find(".sidebar-tab.active");
    const icon = sidebar.find("#sidebar-tabs a.collapse i");

    // Animate the sidebar expansion
    tab.hide();
    sidebar.animate({width: this.options.width, height: this.position.height}, 150, () => {
      sidebar.css({width: "", height: ""});
      icon.removeClass("fa-caret-right").addClass("fa-caret-left");
      tab.fadeIn(250, () => tab.css("display", ""));
      this._collapsed = false;
      sidebar.removeClass("collapsed");
      Hooks.callAll("sidebarCollapse", this, this._collapsed);
    })
  }

	/* -------------------------------------------- */

  /**
   * Collapse the sidebar to a minimized state.
   * Take no action if the sidebar is already collapsed.
   */
  collapse() {
    if ( this._collapsed ) return;
    const sidebar = this.element;
    const tab = sidebar.find(".sidebar-tab.active");
    const icon = sidebar.find("#sidebar-tabs a.collapse i");

    // Animate the sidebar collapse
    tab.fadeOut(250, () => {
      sidebar.animate({width: 30, height: 340}, 150, () => {
        icon.removeClass("fa-caret-left").addClass("fa-caret-right");
        this._collapsed = true;
        sidebar.addClass("collapsed");
        tab.css("display", "");
        Hooks.callAll("sidebarCollapse", this, this._collapsed);
      })
    })
  }

	/* -------------------------------------------- */
  /*  Event Listeners and Handlers
	/* -------------------------------------------- */

	activateListeners(html) {
	  const tabs = html.children('.tabs');

	  // Activate tab controls
    this.tabs = new Tabs(tabs, {
      initial: "chat",
      callback: tab => {
        if ( tab.data("tab") === "chat" && ui.chat ) ui.chat.scrollBottom();
        if ( this._collapsed ) {
          const target = tab.data("tab");
          if ( target !== "chat") {
            const cls = ui[target].constructor;
            cls.renderPopout(ui[target]);
          }
        }
      }
    });

    // Right click pop-out
    tabs.on('contextmenu', '.item', ev => {
      let tab = ev.currentTarget,
          tgt = tab.getAttribute("data-tab"),
          cls = ui[tgt].constructor;
      if ( tgt !== "chat" ) cls.renderPopout(ui[tgt]);
    });

    // Toggle Collapse
    tabs.find(".collapse").click(this._onToggleCollapse.bind(this))
  }

  /* -------------------------------------------- */

  /**
   * Handle toggling of the Sidebar container's collapsed or expanded state
   * @param {Event} event
   * @private
   */
  _onToggleCollapse(event) {
    event.preventDefault();
    if ( this._collapsed ) this.expand();
    else this.collapse();
  }
}

/**
 * An abstract pattern followed by the different tabs of the sidebar
 */
class SidebarTab extends Application {
  constructor(options) {
    super(options);

    // Reference to pop-out window
    this._popout = null;
    this._original = this.options.original;
    if ( this._original ) this._original._popout = this;
  }

  /**
   * Assign the default options which are supported by this Application
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.popOut = false;
	  options.width = 300;
	  return options;
  }

	/* -------------------------------------------- */

  /**
   * Extend the logic used to render the inner application content
   * @param {Object} data         The data used to render the inner template
   * @return {Promise.<jQuery>}   A promise resolving to the constructed jQuery object
   * @private
   */
	async _renderInner(data) {
	  let html = await super._renderInner(data);
	  if ( this.element.hasClass('active') ) html.addClass('active');
	  if ( this.popOut ) html.removeClass("tab");
	  return html;
  }

	/* -------------------------------------------- */

  /**
   * When re-rendering the sidebar tab, also render its pop-out version if it exists
   */
	async _render(...args) {
	  if ( this.options.popOut ) this.position.height = null;
	  await super._render(...args);
	  if ( this._popout ) this._popout.render();
	  return this;
  }

	/* -------------------------------------------- */

  /**
   * Only close the pop-out version of the sidebar tab
   * @return {boolean}
   */
	close() {
	  if ( this.popOut ) {
	    this._original._popout = null;
	    super.close();
    }
    return false;
  }

	/* -------------------------------------------- */

  /**
   * Render the SidebarTab as a pop-out container
   */
	static renderPopout(original) {
    const pop = new this({
      id: this.defaultOptions.id + "-popout",
      classes: ["sidebar-popout"],
      popOut: true,
      original: original
    });
    pop.render(true);
  }
}

/**
 * A shared pattern for the sidebar directory which Actors, Items, and Scenes all use
 * @type{SidebarTab}
 */
class SidebarDirectory extends SidebarTab {
  constructor(options) {
    super(options);
    this.constructor.collection.apps.push(this);

    /**
     * References to the set of Entities which are displayed in the Sidebar
     * @type {Array}
     */
    this.entities = null;

    /**
     * Reference the set of Folders which exist in this Sidebar
     * @type {Array}
     */
    this.folders = null;

    /**
     * The search string currently being filtered for
     * @type {String}
     */
    this.searchString = null;

    /**
     * The timestamp of the previous search character entry
     * @type {Number}
     * @private
     */
    this._searchTime = 0;

    /**
     * The vertical scroll position of the sidebar container
     * @type {Number}
     * @private
     */
    this._scrollTop = 0;

    // Initialize sidebar content
    this.initialize();
  }

	/* -------------------------------------------- */
  /*  Initialization Helpers
	/* -------------------------------------------- */

  initialize() {

    // Assign Folders
    this.folders = game.folders.entities.filter(f => f.type === this.constructor.entity);

    // Assign Entities
    this.entities = this.constructor.collection.entities.filter(e => e.visible);

    // Build Tree
    this.tree = this.constructor.setupFolders(this.folders, this.entities);
  }

	/* -------------------------------------------- */

  /**
   * Given an entity type and a list of entities, set up the folder tree for that entity
   * @param {Array} folders     The Array of Folder objects to organize
   * @param {Array} entities    The Array of Entity objects to organize
   * @return {Object}           A tree structure containing the folders and entities
   */
  static setupFolders(folders, entities) {
	  entities = entities.filter(a => a.visible);
	  let assigned;

	  // Top-level folders
    [folders, assigned, entities] = this._populate({_id: null}, folders, entities);

    // 1-deep
    for ( let f of assigned ) {
      let children;
      [folders, children, entities] = this._populate(f, folders, entities);

      // 2-deep
      for ( let c of children ) {
        let gchildren;
        [folders, gchildren, entities] = this._populate(c, folders, entities);
        c.children = c.children.filter(f => f.displayed);
      }

      // Confirm visibility
      f.children = f.children.filter(f => f.displayed);
    }
    assigned = assigned.filter(f => f.displayed || (f.children && f.children.some(c => c.displayed)));

    // Ensure we don't have remaining folders
    if ( folders.length ) throw new Error("We wound up with un-allocated folders in the tree!");

    // Return the root level contents of folders and entities
    return {
      root: true,
      content: entities,
      children: assigned
    };
  }

  /* -------------------------------------------- */

  /**
   * Populate a single parent folder with child folders and content
   * This method is called recursively when building the folder tree
   * @private
   */
  static _populate(parent, folders, entities) {

    // Partition folders into children and pending
    let [pending, children] = folders.partition(f => f.data.parent === parent._id);
    parent.children = children;

    // For each child, assign a reference to its parent folder and populate content
    for ( let c of children ) {
      c._parent = parent;

      // Allocate content
      let content;
      [entities, content] = entities.partition(e => e.data.folder === c._id);
      c.content = content;

      // Propagate visibility
      c.expanded = game.folders._expanded[c._id];
      c.displayed = game.user.isGM || (content.length > 0);
      if ( c.displayed && c._parent ) c._parent.displayed = true;
    }
    return [pending, children, entities];
  }

	/* -------------------------------------------- */

  /**
   * Assign the default options which are supported by this Application
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = `${this.entityLower}s`;
	  options.template = `templates/sidebar/${this.entityLower}-directory.html`;
	  options.title = `${this.entity}s Directory`;
    options.dragItemSelector = ".directory-item";
	  return options;
  }

	/* -------------------------------------------- */

	static get entity() {
	  throw "Subclass must define entity."
  }

  static get entityLower() {
	  return this.entity.toLowerCase();
  }

  static get collection() {
    throw "Subclass must define collection."
  }

	/* -------------------------------------------- */
  /*  Application Rendering
	/* -------------------------------------------- */

  /**
   * When rendering a SidebarDirectory, check the render context to rebuild the tree structure if needed
   */
	render(force, context={}) {
	  const e = this.constructor.entity;
	  const events = ["create"+e, "update"+e, "delete"+e, "createFolder", "updateFolder", "deleteFolder"];
	  if ( events.includes(context.renderContext) ) {
      this.initialize();
    }
	  return super.render(force, context);
  }

  /* -------------------------------------------- */

  /**
   * Prepare the data used to render the ActorList application
   * @return {Object}
   */
  getData() {
    return {
      user: game.user,
      tree: this.tree,
      search: this.searchString
    };
  }

  /* -------------------------------------------- */

  /**
   * Perform a search of the SidebarDirectory using a filtering string
   * Only display matching entities and their parent folders within the sidebar
   * @private
   */
  search(searchString) {
    const isSearch = !!searchString;
    let entityIds = null;
    let folderIds = null;

    // Match entities and folders
    if ( isSearch ) {
      let rgx = new RegExp(searchString, "i");

      // Match entity names
      const matched = this.entities.filter(e => rgx.test(e.name));
      entityIds = new Set(matched.map(e => e._id));

      // Match folder tree
      folderIds = new Set(matched.filter(e => e.data.folder).map(e => e.data.folder));
      const includeFolders = fids => {
        const folders = this.folders.filter(f => fids.has(f._id));
        const pids = new Set(folders.filter(f => f.data.parent).map(f => f.data.parent));
        if ( pids.size ) {
          pids.forEach(p => folderIds.add(p));
          includeFolders(pids);
        }
      };
      includeFolders(folderIds);
    }

    // Show or hide entities
    this.element.find('li.directory-item').each((i, el) => {
      el.style.display = (!isSearch || entityIds.has(el.dataset.entityId)) ? "flex" : "none";
    });

    // Show or hide folders
    this.element.find('li.folder').each((i, el) => {
      let li = $(el);
      let match = isSearch && folderIds.has(el.dataset.folderId);
      el.style.display = (!isSearch || match) ? "flex" : "none";

      // Always show a matched folder
      if ( isSearch && match ) li.removeClass("collapsed");

      // Otherwise, show the tracked expanded state
      else {
        let expanded = game.folders._expanded[el.dataset.folderId];
        if ( expanded ) li.removeClass("collapsed");
        else li.addClass("collapsed");
      }
    });

    // Assign the search string
    this.searchString = searchString;
    this.element.find('input[name="search"]').val(searchString);
  }

  /* -------------------------------------------- */

  /**
   * Collapse all subfolders in this directory
   */
  collapseAll() {
    this.element.find('li.folder').addClass("collapsed");
    for ( let f of this.folders ) {
      game.folders._expanded[f._id] = false;
    }
  }

	/* -------------------------------------------- */
	/*  Event Listeners and Handlers                */
	/* -------------------------------------------- */

  /**
   * Activate event listeners triggered within the Actor Directory HTML
   */
	activateListeners(html) {
	  let ent = this.constructor.entityLower;

	  // Open the sheet - if you can see the entity in the directory, you can open the sheet
	  html.find('.entity-name').click(ev => {
	    let element = $(ev.currentTarget),
          id = element.parent().attr('data-entity-id'),
          entity = this.constructor.collection.get(id);
      entity.sheet.render(true);
    });

    // Expand or collapse folders
    html.find('.folder-header').click(ev => this._toggleFolder(ev));
    html.find('.collapse-all').click(this.collapseAll.bind(this));

    // Entity context menu
    this._contextMenu(html);

    // Search filtering
    html.find('input[name="search"]').keyup(this._onSearchKeyup.bind(this));

	  // Everything below is a GM-only option
    if ( !game.user.isGM ) return;

    // Make the directory and its items drag/droppable
    html.find(this.options.dragItemSelector).each((i, li) => {
      li.setAttribute("draggable", true);
      li.addEventListener('dragstart', ev => this._onDragStart(ev), false);
    });
    html[0].ondragover = this._onDragOver.bind(this);
    html[0].ondrop = this._onDrop.bind(this);

    // Create new entity
    html.find('.create-entity').click(ev => this._onCreate(ev));

    // Create new folder - eliminate buttons below a certain depth
    html.find(".folder .folder .folder .create-folder").remove();
    html.find('.create-folder').click(ev => this._onCreateFolder(ev));
  }

  /* -------------------------------------------- */

  /**
   * Handle new creation request
   * @param event
   * @private
   */
  async _onCreate(event) {
    const ent = this.constructor.entity,
          cls = CONFIG[ent].entityClass,
          types = game.system.entityTypes[ent];

    // Setup entity data
    const createData = {
      name: `New ${ent}`,
      type: types[0],
      folder: event.currentTarget.getAttribute("data-folder")
    };

    // Only a single type
    if ( types.length <= 1 ) {
      createData.types = types[0];
      return cls.create(createData);
    }

    // Render the entity creation form
    let templateData = {upper: ent, lower: ent.toLowerCase(), types: types},
        dlg = await renderTemplate(`templates/sidebar/entity-create.html`, templateData);

    // Render the confirmation dialog window
    new Dialog({
      title: `Create New ${ent}`,
      content: dlg,
      buttons: {
        create: {
          icon: '<i class="fas fa-check"></i>',
          label: `Create ${ent}`,
          callback: dlg => {
            mergeObject(createData, validateForm(dlg[0].children[0]));
            cls.create(createData);
          }
        }
      },
      default: "create"
    }).render(true);
  }

	/* -------------------------------------------- */

  /**
   * Handle events to create a new Actors folder through a creation dialog
   * @private
   */
	_onCreateFolder(event) {
	  event.preventDefault();
	  event.stopPropagation();
	  let button = $(event.currentTarget),
        parent = button.attr("data-parent-folder");
	  Folder.createDialog({parent: parent ? parent : null, type: this.constructor.entity});
  }

  /* -------------------------------------------- */

  _toggleFolder(event) {
    let folder = $(event.currentTarget.parentElement);
    let collapsed = folder.hasClass("collapsed");
    game.folders._expanded[folder.attr("data-folder-id")] = collapsed;

    // Expand
    if ( collapsed ) folder.removeClass("collapsed");

    // Collapse
    else {
      folder.addClass("collapsed");
      const subs = folder.find('.folder').addClass("collapsed");
      subs.each((i, f) => game.folders._expanded[f.dataset.folderId] = false);
    }
  }

	/* -------------------------------------------- */

  /**
   * Begin a a data transfer drag event with default handling
   * @private
   */
	_onDragStart(event) {
	  event.stopPropagation();
	  let li = $(event.currentTarget);
	  if ( !li.hasClass("directory-item") ) li = li.parents(".directory-item");
    let entityId = li.attr("data-entity-id");
    event.dataTransfer.setData("text/plain", JSON.stringify({
      type: this.constructor.entity,
      id: entityId
    }));
  }

	/* -------------------------------------------- */

  /**
   * Allow data transfer events to be dragged over this as a drop zone
   */
  _onDragOver(event) {
    event.preventDefault();
    return false;
  }

  /* -------------------------------------------- */

  /**
   * Handle data being dropped onto the sidebar
   * @private
   */
  _onDrop(event) {
    event.preventDefault();

    // Try to extract the data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    }
    catch (err) {
      return false;
    }
    if ( data.type !== this.constructor.entity ) return false;

    // Call the drop handler
    this._handleDropData(event, data);

  }

  /* -------------------------------------------- */

  /**
   * Handle a keyup press in the Search filter bar of the directory sidebar
   * @param {Event} event
   * @private
   */
  _onSearchKeyup(event) {
    event.preventDefault();
    const input = event.target;
    this._searchTime = Date.now();
    setTimeout(() => {
      let dt = Date.now() - this._searchTime;
      if ( dt > 250) this.search(input.value);
    }, 251)
  }

  /* -------------------------------------------- */

  /**
   * Define the behavior of the sidebar tab when it received a dropped data object
   * @param {Object} data   The data being dropped
   * @return {boolean}      Whether the drop was handled
   * @private
   */
  _handleDropData(event, data) {

    // Import an Entity from a compendium pack
    if ( data.pack ) {
      this.constructor.collection.importFromCollection(data.pack, data.id);
      return true;
    }

    // Move the Entity to a new folder
    else {
      let ent = this.constructor.collection.get(data.id),
          folder = $(event.target).closest(".folder");
      if ( folder.length > 0 ) ent.update({folder: folder.attr("data-folder-id")});
      else ent.update({folder: null});
      return true;
    }
  }

  /* -------------------------------------------- */

  /**
   * Default folder context actions
   * @param html {jQuery}
   * @private
   */
  _contextMenu(html) {

    // Folder Context
    const folderOptions = this._getFolderContextOptions();
    Hooks.call(`get${this.constructor.name}FolderContext`, html, folderOptions);
    if (folderOptions) new ContextMenu(html, ".folder .folder-header", folderOptions);

    // Entry Context
    const entryOptions = this._getEntryContextOptions();
    Hooks.call(`get${this.constructor.name}EntryContext`, html, entryOptions);
    if (entryOptions) new ContextMenu(html, ".directory-item", entryOptions);
  }

  /* -------------------------------------------- */

  /**
   * Get the sidebar folder context options
   * @return {Object}   The sidebar folder context options
   * @private
   */
  _getFolderContextOptions() {
    return [
      {
        name: "Edit Folder",
        icon: '<i class="fas fa-edit"></i>',
        condition: game.user.isGM,
        callback: async header => {
          let folderId = header.parent().attr("data-folder-id"),
            folder = game.folders.get(folderId);
          new FolderConfig(folder).render(true);
        }
      },
      {
        name: "Remove Folder",
        icon: '<i class="fas fa-trash"></i>',
        condition: game.user.isGM,
        callback: header => {
          let folderId = header.parent().attr("data-folder-id"),
              folder = game.folders.get(folderId);
          new Dialog({
            title: `Remove Folder ${folder.name}`,
            content: "<h4>Are you sure?</h4><p>This folder will be deleted and its contents will be moved to a parent folder.</p>",
            buttons: {
              yes: {
                icon: '<i class="fas fa-trash"></i>',
                label: "Delete",
                callback: () => folder.delete({deleteSubfolders: false, deleteContents: false})
              },
              no: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
              }
            },
            default: 'yes'
          }).render(true);
        }
      },
      {
        name: "Delete All",
        icon: '<i class="fas fa-dumpster"></i>',
        condition: game.user.isGM,
        callback: header => {
          let folderId = header.parent().attr("data-folder-id"),
              folder = game.folders.get(folderId);
          new Dialog({
            title: `Delete Folder ${folder.name}`,
            content: "<h4>Are you sure?</h4><p>This folder <strong>and its contents</strong> will be <strong>permanently deleted</strong> and cannot be recovered.</p>",
            buttons: {
              yes: {
                icon: '<i class="fas fa-trash"></i>',
                label: "Delete",
                callback: () => folder.delete({deleteSubfolders: true, deleteContents: true})
              },
              no: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
              }
            },
            default: 'yes'
          }).render(true);
        }
      }
    ];
  }

  /* -------------------------------------------- */

  /**
   * Get the sidebar directory entry context options
   * @return {Object}   The sidebar entry context options
   * @private
   */
  _getEntryContextOptions() {
    return {};
  }
}

/**
 * The End User License Agreement
 * Display the license agreement and prompt the user to agree before moving forwards
 * @type {Application}
 */
class EULA extends Application {
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "eula";
	  options.template = "templates/setup/eula.html";
	  options.title = "End User License Agreement";
	  options.width = 600;
	  return options;
  }

  async getData() {
	  let html = await fetch("license.html").then(r => r.text());
	  return {
      html: html
    }
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  activateListeners(html) {
    super.activateListeners(html);

    // Agree and submit
    html.find("#sign").click(ev => {
      ev.preventDefault();
      if ( !ev.target.form.agree.checked ) {
        ui.notifications.error(`You must agree to the ${this.options.title} before proceeding.`);
        return false;
      }
      game.socket.emit("signEULA", signed => {
        ui.notifications.info("Thank you. Please enjoy Foundry Virtual Tabletop!");
        this.close();
      });
    });

    // Disagree and quit
    html.find("#cancel").click(ev => {
      ev.preventDefault();
      window.location.href = '/quit'
    });
  }
}

let _updateProgress = null;

/**
 * The client side Updater application
 * This displays the progress of patching/update progress for the VTT
 * @type {Application}
 */
class Updater extends Application {
  constructor(options) {
    super(options);

    /**
     * Track the target update data
     * @type {Object}
     */
    this.target = null;
  }

  /* -------------------------------------------- */

	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "updater";
	  options.template = "templates/setup/updater.html";
	  options.popOut = false;
	  return options;
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers               */
  /* -------------------------------------------- */

  static socketListeners(socket) {
    socket.on('updateProgress', status => game.updater._progress(status));
    socket.on('updateComplete', () => setTimeout(() => {
      _updateProgress = "COMPLETE";
      if ( !Object.values(ui.windows).some(ui => ui instanceof UpdateNotes) ) window.location.href = "/setup";
    }, 1000));
  }

  /**
   * Handle progress messages returned from the application server
   * @private
   */
  _progress({message, pct, level="INFO"}={}) {

    // Info messages
    if ( level === "INFO" ) {
      let label = pct ? `${message} - ${pct}%` : message;
      this.element.find("#update-label").text(label);
      let bar = this.element.find("#progress-bar");
      if ( pct ) bar.css({width: `${pct}%`}).show();
      else bar.hide();
      console.log(`${vtt} | ${label}`);
    }

    // Debug messages
    else if ( level === "DEBUG" ) console.log(`${vtt} | ${message}`);

    // Warning messages
    else if ( level === "WARN" ) console.warn(`${vtt} | ${message}`);

    // Error messages
    else if ( level === "ERROR" ) console.error(`${vtt} | ${message}`);
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  activateListeners(html) {
    super.activateListeners(html);
    const form = html[0];

    // Check for new version
    form.onsubmit = ev => {
      ev.preventDefault();
      let button = form.submit,
        action = button.getAttribute("data-action");

      // Lock the updateKey
      form.updateKey.disabled = true;
      let updateKey = form.updateKey.value;

      // Check for update
      if (action === "check") {
        button.innerHTML = "Checking for Update";
        button.disabled = true;
        game.socket.emit("updateCheck", updateKey, target => {
          this.target = target;
          if (target) {
            _updateProgress = "AVAILABLE";
            button.innerHTML = "Begin Update";
            button.setAttribute("data-action", "download");
            button.disabled = false;
          } else {
            _updateProgress = "UNAVAILABLE";
            button.innerHTML = "No Update Available";
          }
        });
      }

      // Download update
      else if (action === "download") {
        button.innerHTML = "Downloading Update";
        button.disabled = true;
        game.socket.emit("updateDownload", updateKey, target => {
          this.target = target;
          _updateProgress = "INSTALLING";
          if ( target && target.notes ) new UpdateNotes(this, target).render(true);
        });
      }
    };
  }
}


/**
 * The client side Updater application
 * This displays the progress of patching/update progress for the VTT
 * @type {Application}
 */
class UpdateNotes extends Application {
  constructor(updater, options) {
    super(options);
    this.updater = updater;
    this.target = updater.target;
  }

	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "update-notes";
	  options.template = "templates/setup/update-notes.html";
	  options.width = 600;
	  return options;
  }

  get title() {
    return `Update Notes - Foundry Virtual Tabletop ${this.target.version}`;
  }

  async getData() {
    return {
      notes: this.target.notesHTML
    }
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("#return").click(ev => {
      this.close();
      if ( _updateProgress === "COMPLETE" ) window.location.href = "/setup";
    });
  }
}

/**
 * The User Management setup application
 * @type {Application}
 */
class UserManagement extends FormApplication {
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "manage-players";
	  options.template = "templates/setup/users.html";
	  options.popOut = false;
	  return options;
  }

	/* -------------------------------------------- */

  /**
   * Provide data to the form
   * @return {Object}   The data provided to the template when rendering the form
   */
  getData() {
    return {
      user: game.user,
      users: this.object.entities.map(u => u.data),
      permissions: USER_PERMISSIONS,
      options: this.options
    };
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  activateListeners(html) {
    super.activateListeners(html);

    // Add new user to the form
    html.find('.create-user').click(ev => this._onUserCreate(ev));

    // Remove user from the form
    html.on('click', '.user-delete', ev => this._onUserDelete(ev));
  }

  /* -------------------------------------------- */

  /**
   * Override the standard _onSubmit function to allow the form to actually be submitted instead of preventing
   * @private
   */
  _onSubmit(event) {}

  /* -------------------------------------------- */

  /**
   * Handle new user creation event
   * @private
   */
  _onUserCreate(event) {
    event.preventDefault();
    event.currentTarget.disabled = true;
    User.create({name: "Player "+$('.player').length, permission: USER_PERMISSIONS.PLAYER}).then(p => {
      renderTemplate('templates/setup/player-create.html', {user: p, permissions: USER_PERMISSIONS}).then(html => {
        $("#player-list").append(html);
        event.currentTarget.disabled = false;
      });
    });
  }

  /* -------------------------------------------- */

  /**
   * Handle user deletion event
   * @private
   */
  _onUserDelete(event) {
    event.preventDefault();
    let button = $(event.currentTarget),
      li = button.parents('.player'),
      user = game.users.get(li.attr("data-user-id"));

    // Craft a message
    let message = "<h3>Are you sure?</h3><p>This user will be deleted from the game world.</p>";
    if (user.isGM) message += '<p class="warning"><strong>You are about to delete a Game-Master user!</strong></p>';

    // Render a confirmation dialog
    new Dialog({
      title: `Delete User ${user.name}?`,
      content: message,
      buttons: {
        yes: {
          icon: '<i class="fas fa-trash"></i>',
          label: "Delete",
          callback: () => {
            user.delete();
            li.slideUp(200, () => li.remove());
          }
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        },
      },
      default: 'yes'
    }).render(true);
  }
}

/**
 * The World Management setup application
 * @type {Application}
 */
class WorldManagement extends FormApplication {
  constructor(worlds, systems, current) {
    super({});

    /**
     * Valid Game Systems to choose from
     * @type {Array}
     */
    this.systems = systems;

    /**
     * The Array of available Worlds to load
     * @type {Array}
     */
    this.worlds = worlds;

    /**
     * The currently inspected World
     * @type {String}
     */
    this.current = current ? current : null;
  }

	/* -------------------------------------------- */

	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "manage-worlds";
	  options.template = "templates/setup/worlds.html";
	  options.popOut = false;
	  return options;
  }

	/* -------------------------------------------- */

  static getSetupData() {
    return new Promise(resolve => {
      game.socket.emit("getWorlds", resolve);
    })
  }

	/* -------------------------------------------- */

  /**
   * Provide data to the form
   * @return {Object}   The data provided to the template when rendering the form
   */
  getData() {
    const data = {
      worlds: this.worlds.map(w => {
        w.active = w.id === this.current;
        return w;
      }),
      world: this.worlds.find(w => w.id === this.current),
      current: this.current,
      systems: this.systems
    };
    return data;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  activateListeners(html) {
    const form = html[0];
    const world = this.worlds.find(w => w.id === this.current);

    // Create rich text editor
    let editor = createEditor({
      id: "description",
      target: html.find(".editor-content")[0],
      height: 195,
      save_enablewhendirty: true,
      save_onsavecallback: ed => form.description.value = ed.getContent()
    }, this.current ? world.data.description : null).then(r => editor = r[0]);

    // Save MCE when the form is submitted
    form.onsubmit = ev => form.description.value = editor.getContent();

    // Detect and activate file-picker button
    html.find('button.file-picker').each((i, button) => this._activateFilePicker(button));

    // Activate form buttons
    html.find(".world a").click(this._onSelectWorld.bind(this));
    html.find('button[name="clear"]').click(this._onClearWorld.bind(this));
    html.find('button[name="update"]').click(this._onUpdateButton.bind(this));
  }

  /* -------------------------------------------- */

  _onClearWorld(event) {
    event.preventDefault();
    this.current = null;
    this.render();
  }

  /* -------------------------------------------- */

  _onSelectWorld(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".world");
    this.current = li.attr("data-world");
    this.render();
  }

  /* -------------------------------------------- */

  _onUpdateButton(event) {
    event.preventDefault();
    window.location.href = "/update";
  }

}

/**
 * The :class:`Collection` of :class:`Actor` entities
 * The actors collection is accessible within the game as ``game.actors``
 *
 * @type {Collection}
 */
class Actors extends Collection {
  constructor(...args) {
    super(...args);

    // Initialize sheet types
    CONFIG.Actor.sheetClasses = this.types.reduce((obj, type) => {
      obj[type] = {};
      return obj;
    }, {});
    Object.values(CONFIG.Actor._registeredSheets).forEach(sheet => this._registerSheet(...sheet));
    delete CONFIG.Actor._registeredSheets;

    // Update default sheets
    this._updateDefaultSheets(game.settings.get("core", "sheetClasses"));
  }
  /* -------------------------------------------- */

  /**
   * Elements of the Actors collection are instances of the Actor class, or a subclass thereof
   * @type {Actor}
   */
  get object() {
    return CONFIG.Actor.entityClass;
  }

  /* -------------------------------------------- */

  /**
   * Get the valid types of Actor for this game system
   * @type {Array}
   */
  get types() {
    let systemTypes = game.system.entityTypes.Actor;
    return systemTypes.length ? systemTypes : ["base"];
  }

	/* -------------------------------------------- */
	/*  Socket Listeners and Handlers               */
	/* -------------------------------------------- */

  /**
   * Open additional socket listeners which transact Actor data
   */
  static socketListeners(socket) {
    super.socketListeners(socket);
    socket.on('createOwnedItem', this._createOwnedItem.bind(this))
          .on('updateOwnedItem', this._updateOwnedItem.bind(this))
          .on('deleteOwnedItem', this._deleteOwnedItem.bind(this));
  }

	/* -------------------------------------------- */

  /**
   * Handle OwnedItem creation given a server-side Socket response
   * @param {String} parentId     The parent Actor ID
   * @param {Object} created      The created Item data
   * @return {Item}               The created Item instance
   * @private
   */
  static _createOwnedItem({parentId, created}) {

    // Get the Actor
    const actor = game.actors.get(parentId);
    if ( !actor ) throw new Error(`Parent Actor ${parentId} not found`);

    // Push the created data to the child collection
    actor.data.items.push(created);
    console.log(`${vtt} | Created Item ${created.id} in Actor ${actor._id}`);

    // Create the Item instance
    const item = Item.createOwned(created, actor);
    actor.render(false, {
      renderContext: 'createOwnedItem',
      renderData: created
    });

    // Call Hooks and return Item
    Hooks.callAll('createOwnedItem', item, parentId, created);
    return item;
  }

	/* -------------------------------------------- */

  /**
   * Handle OwnedItem updates given a server-side Socket response
   * @param {String} parentId     The parent Actor ID
   * @param {Object} updated      The updated Item data
   * @return {Item}               The updated Item instance
   * @private
   */
  static _updateOwnedItem({parentId, updated}) {

    // Get the Actor
    const actor = game.actors.get(parentId);
    if ( !actor ) throw new Error(`Parent Actor ${parentId} not found`);

    // Get the child data and update
    let child = actor.data.items.find(o => o.id === updated.id);
    mergeObject(child, updated);

    // Create the Item instance
    const item = Item.createOwned(child, actor);

    // Render the updated Item changes
    const renderOptions = {
      renderContext: 'updateOwnedItem',
      renderData: updated
    };
    actor.render(false, renderOptions);
    item.sheet.render(false, renderOptions);

    // Call Hooks and return Item
    Hooks.callAll('updateOwnedItem', item, parentId, updated);
    return item;
  }

	/* -------------------------------------------- */

  /**
   * Handle OwnedItem deletion given a server-side Socket response
   * @param {String} parentId     The parent Actor ID
   * @param {Number} deleted      The deleted Item ID
   * @return {Number}             The deleted Item ID
   * @private
   */
  static _deleteOwnedItem({parentId, deleted}) {

    // Get the Actor
    const actor = game.actors.get(parentId);
    if ( !actor ) throw new Error(`Parent Actor ${parentId} not found`);

    // Get the child index and remove from the parent collection
    const items = actor.data.items;
    let idx = items.findIndex(o => o.id === deleted);
    if ( idx === -1 ) throw new Error(`OwnedItem ${deleted} not found in Actor ${actor._id}`);
    let child = items.splice(idx, 1)[0];
    console.log(`${vtt} | Deleted Item ${deleted} from Actor ${actor._id}`);

    // Create an Item object
    const item = Item.createOwned(child, actor);

    // Render Application changes
    item.sheet.close();
    actor.render(false, {
      renderContext: 'deleteOwnedItem',
      renderData: deleted
    });

    // Call Hooks and return deleted ID
    Hooks.callAll('deleteOwnedItem', item, parentId, deleted);
    return deleted;
  }

  /* -------------------------------------------- */
  /*  Methods
  /* -------------------------------------------- */

  /**
   * Register an Actor sheet class as a candidate which can be used to display Actors of a given type
   * @param {String} scope          Provide a unique namespace scope for this sheet
   * @param {Application} cls       A defined Application class used to render the sheet
   * @param {Array} types           An Array of types for which this sheet can be used
   * @param {Boolean} makeDefault   Make this sheet the default choice for provided types? Default is false
   */
  static registerSheet(scope, cls, {types=[], makeDefault=false}={}) {
    let id = `${scope}.${cls.name}`;
    if ( game && game.ready ) game.actors._registerSheet(id, cls, types, makeDefault);
    else {
      CONFIG.Actor._registeredSheets = CONFIG.Actor._registeredSheets || {};
      CONFIG.Actor._registeredSheets[id] = [id, cls, types, makeDefault];
    }
  }

  _registerSheet(id, cls, types, makeDefault) {
    types = types.length ? types : this.types;
    const sheets = CONFIG.Actor.sheetClasses;
    for ( let t of types ) {
      sheets[t][id] = {
        id: id,
        cls: cls,
        default: makeDefault
      };
    }
  }

  /* -------------------------------------------- */

  /**
   * Unregister an Actor sheet class, removing it from the list of avaliable sheet Applications to use
   * @param {String} scope          Provide a unique namespace scope for this sheet
   * @param {Application} cls       A defined Application class used to render the sheet
   * @param {Array} types           An Array of types for which this sheet should be removed
   */
  static unregisterSheet(scope, cls, {types=[]}={}) {
    let id = `${scope}.${cls.name}`;
    if ( game.ready ) game.actors._unregisterSheet(id, types);
    else delete CONFIG.Actor._registeredSheets[id];
  }

  _unregisterSheet(id, types) {
    types = types.length ? types : this.types;
    const sheets = CONFIG.Actor.sheetClasses;
    for ( let t of types ) {
      delete sheets[t][id];
    }
  }

  /* -------------------------------------------- */

  /**
   * Update the currently default Actor Sheets using a new core world setting
   * @param {Object} setting
   * @private
   */
  _updateDefaultSheets(setting) {
    if ( !Object.keys(setting).length ) return;
    const classes = CONFIG.Actor.sheetClasses;

    // Iterate over sheet types - first confirming that the requested sheet is registered
    for ( let [type, sheetId] of Object.entries(setting.Actor) ) {
      const sheets = Object.values(classes[type]);
      let requested = sheets.find(s => s.id === sheetId);
      if ( requested ) sheets.forEach(s => s.default = s.id === sheetId);
    }

    // Close and de-register any existing sheets
    this.entities.forEach(actor => {
      Object.values(actor.apps).forEach(a => a.close());
      actor.apps = {};
    });
  }
}


/* -------------------------------------------- */


/**
 * The Actor class is a type of :class:`Entity` which represents the protagonists, characters, enemies, and more that
 * inhabit the World.
 * @class Actor
 * @type {Entity}
 */
class Actor extends Entity {
  constructor(...args) {
    super(...args);

    // Assign a default image if one was not set
    this.data.img = this.data.img || DEFAULT_TOKEN;

    /**
     * A reference to a placed Token which creates a synthetic Actor
     * @type {Token}
     */
    this.token = this.options.token || null;

    /**
     * Cache an Array of allowed Token images if using a wildcard path
     * @type {Array}
     */
    this._tokenImages = null;
  }

	/* -------------------------------------------- */

  static get collection() {
    return game.actors;
  }

  /* -------------------------------------------- */

  /**
   * A convenient reference to the file path of the Actor's profile image
   * @type {String}
   */
	get img() {
	  return this.data.img;
  }

  /**
   * A convenient reference to the Array of Items which are owned by the Actor
   * @type {Array}
   */
  get items() {
    return this.data.items;
  }

	/* -------------------------------------------- */

  /**
   * A boolean flag for whether this Actor is a player-owned character.
   * @type {Boolean}  True if any User who is not a GM has ownership rights over the Actor entity.
   */
	get isPC() {
	  const nonGM = game.users.entities.filter(u => !u.isGM);
	  return nonGM.some(u => {
	    if ( this.data.permission["default"] >= ENTITY_PERMISSIONS["OWNER"] ) return true;
	    return this.data.permission[u._id] >= ENTITY_PERMISSIONS["OWNER"]
    });
  }

	/* -------------------------------------------- */

  /**
   * Test whether an Actor entity is a synthetic representation of a Token (if true) or a full Entity (if false)
   * @type {Boolean}
   */
  get isToken() {
	  if ( !this.token ) return false;
    return !this.token.data.actorLink;
  }

	/* -------------------------------------------- */

  /**
   * Obtain a reference to the BaseEntitySheet implementation which should be used to render the Entity instance
   * configuration sheet.
   * @private
   */
  get _sheetClass() {
    let type = this.data.type || BASE_ENTITY_TYPE;
    const sheets = CONFIG.Actor.sheetClasses[type];
    let cls;
    const override = this.getFlag("core", "sheetClass");
    if ( sheets[override] ) {
      cls = sheets[override].cls;
    } else {
      let def = Object.values(sheets).find(s => s.default);
      if ( def ) cls = def.cls;
    }
    if ( !cls ) throw new Error(`No valid Actor sheet found for type ${this.data.type}`);
    return cls;
  }

  /* -------------------------------------------- */

  /**
   * Create a synthetic Actor using a provided Token instance
   * If the Token data is linked, return the true Actor entity
   * If the Token data is not linked, create a synthetic Actor using the Token's actorData override
   * @param {Token} token
   * @return {Actor}
   */
  static fromToken(token) {
    let actor = game.actors.get(token.data.actorId);
    if ( !actor ) return null;
    if ( !token.data.id ) return actor;
    if ( !token.data.actorLink ) {
      const actorData = mergeObject(actor.data, token.data.actorData, {inplace: false});
      actor = new actor.constructor(actorData, {token: token});
    }
    return actor;
  }

  /* -------------------------------------------- */

  /**
   * Retrieve an Array of active tokens which represent this Actor in the current canvas Scene.
   * If the canvas is not currently active, or there are no linked actors, the returned Array will be empty.
   *
   * @param [linked] {Boolean}  Only return tokens which are linked to the Actor. Default (false) is to return all
   *                            tokens even those which are not linked.
   *
   * @return {Array}            An array of tokens in the current Scene which reference this Actor.
   */
  getActiveTokens(linked=false) {
    if ( !canvas.tokens ) return [];
    return canvas.tokens.placeables.filter(t => {
      if ( !(t instanceof Token) ) return false;
      if ( linked ) return t.data.actorLink && t.data.actorId === this._id;
      return t.data.actorId === this._id
    });
  }

  /* -------------------------------------------- */

  /**
   * Get an Array of Token images which could represent this Actor
   * @return {Promise}
   */
  async getTokenImages() {
    if (!this.data.token.randomImg) return [this.data.token.img];
    if ( this._tokenImages ) return this._tokenImages;
    return new Promise((resolve, reject) => {
      game.socket.emit("getFiles", this.data.token.img, {wildcard: true}, images => {
        if (images.error) reject(images.error);
        resolve(images.files);
      });
    }).then(images => this._tokenImages = images);
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Update the current entity using new data
   * This new data is typically provided from the server through the 'update<Entity>' socket
   * Alternatively, the update may originate locally, in which case it can be pushed back to the server
   *
   * @param {Object} data     The data with which to update the entity
   * @param {Object} options  Additional options which customize the update workflow
   * @return {Promise}        A Promise which resolves to the updated Entity
   */
  async update(data, options={}) {

    // Prepare data for update
    delete data._id;
    let changed = {};
    for (let [k, v] of Object.entries(data)) {
      let c = getProperty(this.data, k);
      if ( c !== v ) changed[k] = v;
    }
    if ( !Object.keys(changed).length ) return Promise.resolve(this);

    // Case 1 - Update a synthetic Token
    if ( this.isToken ) {
      const updateData = {id: this.token.id, actorData: changed};
      return this.token.update(this.token.scene._id, updateData);
    }

    // Case 2 - Standard Actor update
    else {
      changed._id = this._id;
      const preHook = 'preUpdateActor';
      return SocketInterface.trigger('updateActor', {data: changed}, options, preHook, this).then(response => {
        return this.collection.update(response);
      });
    }
  }

	/* -------------------------------------------- */

  /**
   * Additional updating steps for the Actor entity when new data is saved which trigger some related updates.
   *
   * Re-render the parent collection if names, images, or permissions have changed
   * Re-render active tokens if their linked attribute has changed
   *
   * @param data {Object}     The new data object which was used to update the Actor
   */
	_onUpdate(data) {
	  super._onUpdate(data);

    // Get the changed attributes
    const keys = Object.keys(data).filter(k => k !== "_id");
    const changed = new Set(keys);

    // Update default token data
    const token = this.data.token;
    if ( data.img && data.img !== token.img && (!token.img || token.img === DEFAULT_TOKEN)) {
      data["token.img"] = data.img;
    }
    if (data.name && data.name !== token.name && (!token.name || token.name === "New Actor")) {
      data["token.name"] = data.name;
    }

    // If the prototype token was changed, expire any cached token images
    if ( changed.has("token") ) this._tokenImages = null;

    // Update Token representations of this Actor
    if ( !this.isToken ) {
      this.getActiveTokens().forEach(token => token._onUpdateBaseActor(this.data, data));
    }

    // If ownership changed for an actor with an active token, re-initialize sight
    if ( changed.has("permission") ) {
      if ( this.getActiveTokens().length ) {
        canvas.tokens.releaseAll();
        canvas.tokens.cycleTokens(1, true);
        canvas.sight.initialize();
      }
    }
  }

  /* -------------------------------------------- */
  /* Owned Item Management
  /* -------------------------------------------- */

  /**
   * Import a new owned Item from a compendium collection
   * The imported Item is then added to the Actor as an owned item.
   *
   * @param collection {String}     The name of the pack from which to import
   * @param entryId {String}        The ID of the compendium entry to import
   */
  importItemFromCollection(collection, entryId) {
    const pack = game.packs.find(p => p.collection === collection);
    if ( pack.metadata.entity !== "Item" ) return;
    return pack.getEntity(entryId).then(ent => {
      console.log(`${vtt} | Importing Item ${ent.name} from ${collection}`);
      delete ent.data._id;
      return this.createOwnedItem(ent.data, true);
    });
  }

  /* -------------------------------------------- */

  /**
   * Get an owned item by it's ID, initialized as an Item entity class
   * @param {Number} itemId   The ID of the owned item
   * @return {Item|null}      An Item class instance for that owned item or null if the itemId does not exist
   */
  getOwnedItem(itemId) {
    let itemData = this.items.find(i => i.id === Number(itemId));
    return Item.createOwned(itemData, this);
  }

  /* -------------------------------------------- */

  /**
   * Create a new item owned by this Actor.
   * @param {Object} itemData     Data for the newly owned item
   * @param {Object} options      Item creation options
   * @param {Boolean} options.displaySheet Render the Item sheet for the newly created item data
   * @return {Promise.<Item>}     A Promise containing the newly created owned Item instance
   */
  async createOwnedItem(itemData, options={}) {

    // Case 1 - create an Owned Item for a Token
    if ( this.isToken ) {
      const items = duplicate(this.data.items);
      const item = await Item.create(itemData, {temporary: true, displaySheet: false});
      item.data.id = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
      items.push(item.data);
      return this.token.update(this.token.scene._id, {actorData: {items: items}});
    }

    // Case 2 - create an owned item for an Actor entity
    const eventData = {parentId: this._id, data: itemData},
          preHook = 'preCreateOwnedItem';
    return SocketInterface.trigger('createOwnedItem', eventData, options, preHook, this).then(response => {
      const item = Actors._createOwnedItem(response);
      if ( options.displaySheet ) item.sheet.render(true);
      return item;
    });
  }

  /* -------------------------------------------- */

  /**
   * Update an owned item using provided new data
   * @param {Object} itemData     Data for the item to update
   * @param {Object} options      Item update options
   * @return {Promise.<Item>}     A Promise resolving to the updated Item object
   */
  async updateOwnedItem(itemData, options={}) {

    // Case 1 - update an owned item for a Token
    if ( this.isToken ) {
      const items = duplicate(this.data.items);
      const item = items.find(i => i.id === Number(itemData.id));
      if ( item ) mergeObject(item, itemData);
      return this.token.update(this.token.scene._id, {actorData: {items: items}});
    }

    // Case 2 - create an Owned Item for an Actor
    const eventData = {parentId: this._id, data: itemData},
          preHook = 'preUpdateOwnedItem';
    return SocketInterface.trigger('updateOwnedItem', eventData, options, preHook, this).then(response => {
      return Actors._updateOwnedItem(response);
    });
  }

  /* -------------------------------------------- */

  /**
   * Delete an owned item by its ID
   * @param {Number} itemId       The ID of the item to delete
   * @param {Object} options      Item deletion options
   * @return {Promise.<Number>}   A Promise resolving to the deleted item ID
   */
  async deleteOwnedItem(itemId, options={}) {

    // Case 1 - delete an Owned item from a Token
    if ( this.isToken ) {
      const items = duplicate(this.data.items);
      const idx = items.findIndex(i => i.id === Number(itemId));
      if ( idx !== -1 ) items.splice(idx, 1);
      return this.token.update(this.token.scene._id, {actorData: {items: items}});
    }

    // Case 2 - delete an Owned Item from an Actor
    const eventData = {parentId: this._id, childId: itemId},
          preHook = 'preDeleteOwnedItem';
    return SocketInterface.trigger('deleteOwnedItem', eventData, options, preHook, this).then(response => {
      return Actors._deleteOwnedItem(response);
    });
  }
}

/* -------------------------------------------- */


CONFIG.Actor.entityClass = Actor;
Actors.registerSheet("core", ActorSheet);

/**
 * The Collection of Combat entities
 * @type {Collection}
 */
class CombatEncounters extends Collection {

  /**
   * Elements of the Combats collection are instances of the Combat class
   * @return {Combat}
   */
  get object() {
    return Combat;
  }

  /* -------------------------------------------- */

  /**
   * Get an Array of Combat instances which apply to the current canvas scene
   * @type {Array}
   */
  get combats() {
    let scene = game.scenes.active;
    if ( !scene ) return [];
    return this.entities.filter(c => c.data.scene === scene._id);
  }

  /* -------------------------------------------- */

  /**
   * The currently active Combat instance
   * @return {Combat}
   */
  get active() {
    return this.combats.find(c => c.data.active);
  }

	/* -------------------------------------------- */

  /**
   * Return a reference to the singleton instance of this collection within the Game context
   * @type {Collection}
   */
  static get instance() {
    return game.combats;
  }

	/* -------------------------------------------- */
	/*  Socket Listeners and Handlers               */
	/* -------------------------------------------- */

  /**
   * Activate socket listeners which transact Combat data
   */
  static socketListeners(socket) {
    super.socketListeners(socket);
    socket.on('createCombatant', this._createCombatant.bind(this))
          .on('updateCombatant', this._updateCombatant.bind(this))
          .on('deleteCombatant', this._deleteCombatant.bind(this));
  }

	/* -------------------------------------------- */

  /**
   * Add a new Combatant to the encounter given a server-side Socket response
   * @param {String} parentId     The parent Combat ID
   * @param {Object} created      The created Combatant data
   * @return {Object}             The created Combatant data
   * @private
   */
  static _createCombatant({parentId, created}) {

    // Get the parent Combat
    const combat = game.combats.get(parentId);
    if ( !combat ) throw new Error(`Parent Combat ${parentId} not found`);

    // Push the created data to the child collection
    combat.data.combatants.push(created);
    console.log(`${vtt} | Created combatant ${created.id} in Combat ${parent._id}`);

    // Call Hooks and follow-up actions
    combat._onUpdateCombatant(created);
    Hooks.callAll('createCombatant', this, parentId, created);
    return created;
  }

	/* -------------------------------------------- */

  /**
   * Handle Combatant updates given a server-side Socket response
   * @param {String} parentId     The parent Combat ID
   * @param {Object} updated      Differential data with which to update
   * @return {Object}             The updated Combatant data
   * @private
   */
  static _updateCombatant({parentId, updated}) {

    // Get the parent Combat
    const combat = game.combats.get(parentId);
    if ( !combat ) throw new Error(`Parent Combat ${parentId} not found`);

    // Get the child data and update
    let combatant = combat.data.combatants.find(o => o.id === updated.id);
    mergeObject(combatant, updated);

    // Call Hooks and follow-up actions
    combat._onUpdateCombatant(combatant);
    Hooks.callAll('updateCombatant', this, parentId, updated);
    return combatant;
  }

	/* -------------------------------------------- */

  /**
   * Handle Combatant deletion given a server-side Socket response
   * @param {String} parentId     The parent Combat ID
   * @param {Number} deleted      The deleted Combatant ID
   * @return {Number}             The deleted Combatant ID
   * @private
   */
  static _deleteCombatant({parentId, deleted}) {

    // Get the parent Combat
    const combat = game.combats.get(parentId);
    if ( !combat ) throw new Error(`Parent Combat ${parentId} not found`);

    // Get the child index and remove from the parent collection
    const combatants = combat.data.combatants;
    let idx = combatants.findIndex(o => o.id === deleted);
    if ( idx === -1 ) throw new Error(`Combatant ${deleted} not found in Combat ${combat._id}`);
    let combatant = combatants.splice(idx, 1)[0];
    console.log(`${vtt} | Deleted Combatant ${deleted} from Combat ${combat._id}`);

    // Call Hooks and follow-up actions
    combat._onDeleteCombatant(combatant);
    Hooks.callAll('deleteCombatant', this, parentId, deleted);
    return deleted
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * When a Token is deleted, remove it as a combatant from any combat encounters which included the Token
   * @param {String} sceneId
   * @param {Number} tokenId
   * @private
   */
  async _onDeleteToken(sceneId, tokenId) {
    const combats = game.combats.entities.filter(c => c.sceneId = sceneId);
    for ( let c of combats ) {
      let combatant = c.getCombatantByToken(tokenId);
      if ( combatant ) await c.deleteCombatant(combatant.id);
    }
  }
}


/* -------------------------------------------- */
/*  Combat Entity
/* -------------------------------------------- */


/**
 * The Combat Entity defines a particular combat encounter which can occur within the game session
 * Combat instances belong to the CombatEncounters collection
 * @type {Entity}
 */
class Combat extends Entity {
  constructor(...args) {
    super(...args);

    /**
     * Track the sorted turn order of this combat encounter
     * @type {Array}
     */
    this.turns = this.setupTurns();

    /**
     * Track the current [round, turn, tokenId] in a concise Array
     * @type {Array}
     * @private
     */
    this._current = [this.round, this.turn, this.combatant ? this.combatant.tokenId : null];

    /**
     * Track the previous round, turn, and tokenId to understand whether something changed
     * @type {Object}
     * @private
     */
    this.previous = {
      round: null,
      turn: null,
      tokenId: null
    };

    /**
     * Track whether a sound notification is currently being played to avoid double-dipping
     * @type {Boolean}
     * @private
     */
    this._soundPlaying = false;
  }

	/* -------------------------------------------- */

  /**
   * Return a reference to the Collection class which stores Entity instances of this type.
   * This property should be overridden by child class implementations.
   * @type {Collection}
   */
	static get collection() {
	  return CombatEncounters.instance;
  }

  /* -------------------------------------------- */

  /**
   * Has this combat encounter been started?
   * @type {Boolean}
   */
  get started() {
    return ( this.turns.length > 0 ) && ( this.round > 0 );
  }

  /* -------------------------------------------- */

  /**
   * Backwards compatibility for the old combat previous
   * TODO: remove this in 0.4.0 (or sooner)
   * @private
   */
  get _previous() {
    console.warn("[DEPRECATION] You are calling Combat._previous {Array} which has been migrated to Combat.previous {Object}")
    return Object.values(this.previous);
  }

  /* -------------------------------------------- */

  /**
   * Get the Scene entity for this Combat encounter
   * @return {Scene}
   */
  get scene() {
    return game.scenes.get(this.data.scene);
  }
  /* -------------------------------------------- */

  get combatant() {
    return this.turns[this.data.turn];
  }

  /* -------------------------------------------- */

  get turn() {
    return this.data.turn;
  }

  /* -------------------------------------------- */

  get round() {
    return this.data.round;
  }

  /* -------------------------------------------- */
  /*  Methods
  /* -------------------------------------------- */

  /**
   * Set the current Combat encounter as active within the Scene
   * @return {Promise.<Combat>}
   */
  async activate() {
    let active = this.constructor.collection.active;
    if ( active && (active._id !== this._id) ) {
      await active.update({active: false});
    }
    return this.update({active: true});
  }

  /* -------------------------------------------- */

  /**
   * Get a Combatant using its ID
   * {Number} id        The ID of the combatant to acquire
   */
  getCombatant(id) {
    return this.turns.find(c => c.id === Number(id));
  }

  /* -------------------------------------------- */

  /**
   * Get a Combatant using its tokenId
   * {Number} tokenId   The tokenId for which to acquire the combatant
   */
  getCombatantByToken(tokenId) {
    return this.turns.find(c => c.tokenId === Number(tokenId));
  }

  /* -------------------------------------------- */

  /**
   * Return the Array of combatants sorted into initiative order, breaking ties alphabetically by name
   * @return {Array}
   */
  setupTurns() {
    const scene = game.scenes.get(this.data.scene);
    const players = game.users.players,
          settings = game.settings.get("core", Combat.CONFIG_SETTING);

    // Acquire the Token for each combatant
    let turns = this.data.combatants.map(c => {
      c.token = scene.data.tokens.find(t => t.id === c.tokenId);
      return c;
    }).filter(c => c.token);

    // Sort turns into initiative order
    turns = turns.sort((a, b) => {
      let [an, bn] = [a.name || "", b.name || ""];
      if ( a.initiative === b.initiative ) return an.localeCompare(bn);
      return (b.initiative || -9999) - (a.initiative || -9999);
    });

    // Prepare additional data
    for ( let t of turns ) {
      let actor = game.actors.get(t.token.actorId),
          isOwner = game.user.isGM || (actor && actor.owner),
          isObserver = game.user.isGM || (actor && actor.hasPerm(game.user, "OBSERVER"));

      // Reference relevant entities
      t.actor = actor;
      t.player = actor ? players.filter(u => actor.hasPerm(u, "OWNER")) : null;

      // Update flags
      mergeObject(t, {
        owner: isOwner,
        visible: isOwner || !t.hidden,
        name: t.token.name || (actor && actor.name),
        img: t.token.img || DEFAULT_TOKEN,
        resource: isObserver && actor ? getProperty(actor.data.data, settings.resource) : null
      });
    }

    // Ensure the current turn is bounded
    this.data.turn = Math.clamped(this.data.turn, 0, turns.length-1);
    return this.turns = turns;
  }

  /* -------------------------------------------- */
  /*  Combat Control Methods
  /* -------------------------------------------- */

  /**
   * Roll initiative for a token in the currently active scene encounter
   * @param {Number} id         The combatant ID for which to roll
   * @param {Number} formula    A specialized initiative formula to roll
   * @param {Object} messageOptions Additional options with which to customize the posted Chat Message
   */
  async rollInitiative(id, formula, messageOptions) {
    let c = this.getCombatant(id);
    if ( !c ) return;
    formula = formula || this._getInitiativeFormula(c);

    // Roll initiative
    const token = this.scene.data.tokens.find(t => t.id === c.tokenId),
          actor = game.actors.get(token.actorId),
          actorData = actor ? actor.data.data : {},
          roll = new Roll(formula, actorData).roll();

    // Post the Initiative roll to chat
    messageOptions = mergeObject({
      speaker: {
        scene: canvas.scene._id,
        actor: actor ? actor._id : null,
        token: token.id,
        alias: token.name
      },
      flavor: `${token.name} rolls for Initiative!`,
      rollMode: (token.hidden || c.hidden) ? "gmroll" : "roll"
    }, messageOptions);
    roll.toMessage(messageOptions);

    // Assign initiative result
    await this.setInitiative(c.id, roll.total);
  }

  /* -------------------------------------------- */

  /**
   * Acquire the default dice formula which should be used to roll initiative for a particular combatant
   * Modules or systems could choose to override or extend this to accomodate special situations
   * @param {Object} combatant
   * @private
   */
  _getInitiativeFormula(combatant) {
    return CONFIG.initiative.formula || game.system.initiative;
  }

  /* -------------------------------------------- */

  /**
   * Update or set the initiative score for a token in the currently active scene encounter
   * @param {Number} id         The combatant ID for which to roll
   * @param {Number} value      A specific initiative value to set
   */
  async setInitiative(id, value) {
    let c = this.getCombatant(id);
    if ( !c ) return;
    let initialPosition = this.turns.findIndex(t => t.id === id);

    // Update the combatant's initiative
    await this.updateCombatant({id: id, initiative: value});

    // If the combatant leap-frogged the current turn in an active combat, we need to shift it
    if ( this.started ) {
      let newPosition = this.turns.findIndex(t => t.id === id);
      if ( (initialPosition < this.turn) && (newPosition >= this.turn) ) {
        await this.update({turn: this.turn-1});
      } else if ( (initialPosition >= this.turn) && (newPosition < this.turn ) ) {
        await this.update({turn: this.turn+1});
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Roll initiative for all non-player actors who have not already rolled
   */
  async rollNPC() {
    const npcs = this.turns.filter(t => !t.actor || !t.player.length);
    return this.rollAll(npcs);
  }

  /* -------------------------------------------- */

  /**
   * Roll initiative for all combatants which have not already rolled
   * @param {Array} combatants    An array of combatants to bulk roll
   */
  async rollAll(combatants) {
    combatants = combatants || this.turns;
    const unrolled = combatants.filter(t => !t.initiative),
          messageOptions = {};
    for ( let [i, c] of unrolled.entries() ) {
      await this.rollInitiative(c.id, null, messageOptions);
      if ( i === 0) messageOptions.sound = null;
    }
  }

  /* -------------------------------------------- */

  /**
   * Begin the combat encounter, advancing to round 1 and turn 1
   * @return {Promise}
   */
  async startCombat() {
    return this.update({round: 1, turn: 0});
  }

  /* -------------------------------------------- */

  /**
   * Advance the combat to the next turn
   * @return {Promise}
   */
  async nextTurn() {
    if ( this.round === 0 || this.turn === this.turns.length - 1 ) return this.nextRound();
    return this.update({turn: this.turn + 1});
  }

  /* -------------------------------------------- */

  /**
   * Rewind the combat to the previous turn
   * @return {Promise}
   */
  async previousTurn() {
    if ( this.turn === 0 && this.round === 0 ) return Promise.resolve();
    else if ( this.turn === 0 ) return this.previousRound();
    return this.update({turn: this.turn - 1});
  }

  /* -------------------------------------------- */

  /**
   * Advance the combat to the next round
   * @return {Promise}
   */
  async nextRound() {
    return this.update({round: this.round + 1, turn: 0});
  }

  /* -------------------------------------------- */

  /**
   * Rewind the combat to the previous round
   * @return {Promise}
   */
  async previousRound() {
    let turn = ( this.round === 0 ) ? 0 : this.turns.length - 1;
    return this.update({round: Math.max(this.round - 1, 0), turn: turn});
  }

  /* -------------------------------------------- */

  /**
   * Reset all combatant initiative scores
   * @return {Promise}
   */
  async resetAll() {
    let cbt = this.data.combatants.map(c => {
      c.initiative = null;
      return c;
    });
    return this.update({combatants: cbt, turn: 0});
  }

  /* -------------------------------------------- */

  /**
   * Display a dialog querying the GM whether they wish to end the combat encounter and empty the tracker
   * @return {Promise}
   */
  async endCombat() {
    return new Promise((resolve, reject) => {
      if (!game.user.isGM) reject("You cannot end an active combat");
      new Dialog({
        title: `End Combat?`,
        content: "<p>End this combat encounter and empty the turn tracker?</p>",
        buttons: {
          yes: {
            icon: '<i class="fas fa-check"></i>',
            label: "End Combat",
            callback: () => {
              this.delete().then(resolve)
            }
          },
          no: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel"
          }
        },
        default: "yes"
      }).render(true);
    });
  }

  /* -------------------------------------------- */
  /*  Combatant Management
  /* -------------------------------------------- */

  /**
   * Create a new combatant in the combat encounter
   * @param {Object} data         Combatant data to use when creating the new combatant
   * @param {Object} options      Combatant creation options
   * @return {Promise.<Object>}   A Promise which resolves to the created Combatant data
   */
  async createCombatant(data, options) {
    const eventData = {parentId: this._id, data: data},
          preHook = 'preCreateCombatant';
    return SocketInterface.trigger('createCombatant', eventData, options, preHook, this).then(response => {
      return CombatEncounters._createCombatant(response);
    });
  }

  /* -------------------------------------------- */

  /**
   * Update an existing Combatant within the Combat encounter
   * @param {Object} data         New data to use when updating the Combatant
   * @param {Object} options      Combatant update options
   * @return {Promise.<Object>}   A Promise which resolves to the updated Combatant data
   */
  async updateCombatant(data, options) {
    const eventData = {parentId: this._id, data: data},
          preHook = 'preUpdateCombatant';
    return SocketInterface.trigger('updateCombatant', eventData, options, preHook, this).then(response => {
      return CombatEncounters._updateCombatant(response);
    });
  }

  /* -------------------------------------------- */

  /**
   * Delete an existing Combatant within the Combat encounter
   * @param {Number} id           The Combatant id to delete
   * @param {Object} options      Combatant deletion options
   * @return {Promise.<Number>}   A Promise which resolves to the deleted Combatant ID
   */
  async deleteCombatant(id, options) {
    const eventData = {parentId: this._id, childId: id},
          preHook = 'preDeleteCombatant';
    return SocketInterface.trigger('deleteCombatant', eventData, options, preHook, this).then(response => {
      return CombatEncounters._deleteCombatant(response);
    });
  }

  /* -------------------------------------------- */
  /*  Socket Events and Handlers
  /* -------------------------------------------- */

  /**
   * Specific actions which occur when the Combat entity is updated
   * @private
   */
	_onUpdate(data) {

	  // Update the prior turn
    const cbt = this.combatant;
    this.previous = this.current;
    this.current = {round: this.round, turn: this.turn, tokenId: cbt ? cbt.tokenId : null};

    // Render the sidebar
    if ( Object.keys(data).some(k => ["combatants", "round", "turn"].includes(k)) ) {
      this.collection.render();
    }
  }

  /* -------------------------------------------- */

  /**
   * Additional callback steps which are performed when a Combatant is created, updated, or deleted
   * @private
   */
  _onUpdateCombatant(combatant) {
    this.setupTurns();
    if ( this.data.active ) this.collection.render();
  }

  /* -------------------------------------------- */

  /**
   * Specific actions which occur when the Combat encounter is deleted
   * @private
   */
  _onDelete() {
    super._onDelete();
    if ( this.data.active && this.collection.entities.length ) {
      this.collection.entities[0].update({active: true}).then(() => this.collection.render())
    }
  }

  /* -------------------------------------------- */

  /**
   * Additional callback steps which are performed when a Combatant is deleted
   * @private
   */
  _onDeleteCombatant(combatant) {
    this.setupTurns();
    if ( this.data.active ) this.collection.render();
  }

  /* -------------------------------------------- */

  // /**
  //  * Perhaps play an audio cue when the combat turn order changes
  //  * @param {Number} round    The new combat round
  //  * @param {Number} turn     The new combat turn
  //  * @param {Number} token    The new turn token
  //  */
  // playCombatAudioCue(round, turn, token) {
  //   if ( this._soundPlaying || !CONFIG.sounds.combat ) return;
  //   let actor = game.actors.get(this.turns[turn].actorId);
  //
  //   // Determine whether to notify
  //   let notify = false;
  //   if (game.user.isGM) {
  //     notify = game.users.entities.filter(u => {
  //       return (u._id !== game.user._id) && (u.character && u.character._id === actor._id)
  //     }).length === 0;
  //   }
  //   else notify = actor.owner;
  //
  //   // Play the notification effect
  //   if ( notify ) AudioHelper.play({
  //     src: CONFIG.sounds.combat,
  //     volume: 0.20,
  //     onplay: h => this._soundPlaying = true,
  //     onend: h => this._soundPlaying = false
  //   });
  // }
}


Combat.CONFIG_SETTING = "combatTrackerConfig";

CONFIG.initiative = {
  formula: null,
  decimals: 0
};

/**
 * The Folders Collection
 */
class Folders extends Collection {
  constructor(...args) {
    super(...args);

    /**
     * This tracks which folders are currently expanded in the UI
     */
    this._expanded = {};
  }

  /**
   * Elements of the Folders collection are instances of the Folder class, or a subclass thereof
   * @return {Folder}
   */
  get object() {
    return Folder;
  }

	/* -------------------------------------------- */

  /**
   * Redirect and delegate rendering of changes to Folders at the Collection level
   */
	render(force, context) {
	  if ( context.renderContext ) {
	    const folder = context.entity;
      folder.entityCollection.render(force, context);
    }
  }

	/* -------------------------------------------- */

  /**
   * Delete an existing Entity from this Collection using its ID
   *
   * @param {Object} response     The server response generated by a delete request
   * @return {String}             The ID of the Entity which was successfully deleted
   * */
	delete(response) {
	  const ent = CONFIG[response.entityType].entityClass;
	  if ( response.deletedFolders.length ) {
	    for ( let f of response.deletedFolders ) {
	      super.delete({deleted: f});
      }
    }
	  if ( response.deletedEntities.length ) {
	    for ( let e of response.deletedEntities ) {
        ent.collection.delete({deleted: e});
      }
    }
	  if ( response.changedFolder ) {
	    for ( let [id, folder] of Object.entries(response.changedFolder) ) {
	      ent.collection.update({updated: {_id: id, folder: folder}});
      }
    }
	  return response.deleted;
  }
}


/* -------------------------------------------- */


/**
 * The Folder Entity
 */
class Folder extends Entity {
  static get collection() {
    return game.folders;
  }

  get parent() {
    return this.constructor.collection.find(f => f._id === this.data.parent);
  }

  get type() {
    return this.data.type;
  }

  get entityCollection() {
    return Object.values(game).find(c => c.object && c.object.entity === this.type);
  }

  /* -------------------------------------------- */

  /**
   * Create a new Folder by rendering a dialog window to provide basic creation details
   * @param data {Object}   Initial data with which to populate the creation form
   */
  static createDialog(data) {
    new FolderConfig(new Folder(data)).render(true);
  }
}

/**
 * The :class:`Collection` of :class:`Item` entities
 * The items collection is accessible within the game as ``game.items``
 *
 * @type {Collection}
 */
class Items extends Collection {

  /**
   * Elements of the Items collection are instances of the Item class, or a subclass thereof
   * @return {Item}
   */
  get object() {
    return CONFIG.Item.entityClass;
  }
}


/* -------------------------------------------- */


const MYSTERY_ITEM = DEFAULT_TOKEN;


/**
 * The Item entity.
 * This base Item refers primarily to items which are not currently owned.
 * @type {Entity}
 */
class Item extends Entity {
  constructor(...args) {
    super(...args);
    this.data.img = this.data.img || MYSTERY_ITEM;
    this.actor = this.options.actor;
  }

	/* -------------------------------------------- */

  static get collection() {
    return game.items;
  }

  /* -------------------------------------------- */

	get img() {
	  return this.data.img;
  }

  get type() {
	  return this.data.type;
  }

  /* -------------------------------------------- */

  /**
   * A boolean indicator for whether the current game user has ONLY limited visibility for this Entity.
   * @return {Boolean}
   */
  get limited() {
    if ( this.isOwned ) return this.actor.limited;
    else return super.limited;
  }

  /* -------------------------------------------- */

  /**
   * A flag for whether the item is owned by an Actor entity
   * @return {boolean}
   */
  get isOwned() {
    return this.actor !== undefined;
  }

  /* -------------------------------------------- */

  /**
   * Override the standard permission test for Item entities as we need to apply a special check for owned items
   * OwnedItems have permission that the player has for the parent Actor.
   * @return {Boolean}            Whether or not the user has the permission for this item
   */
  hasPerm(...args) {
    if ( this.actor !== undefined ) return this.actor.hasPerm(...args);
    else return super.hasPerm(...args);
  }

	/* -------------------------------------------- */
	/*  Socket Listeners and Handlers               */
	/* -------------------------------------------- */

  /**
   * Extend the base Entity update logic to update owned items as well.
   * See Entity.update for more complete API documentation
   *
   * @param {Object} data   The data with which to update the entity
   * @param {Object} options  Additional options which customize the update workflow
   * @return {Promise}        A Promise which resolves to the updated Entity
   */
  async update(data, options) {

    // Prepare data for update
    delete data._id;
    let changed = {};
    for (let [k, v] of Object.entries(data)) {
      let c = getProperty(this.data, k);
      if ( c !== v ) changed[k] = v;
    }
    if ( !Object.keys(changed).length ) return Promise.resolve(this);


    // Update Owned Items
    if ( this.isOwned ) {
      changed.id = this.data.id;
      return this.actor.updateOwnedItem(changed, options);
    }

    // Update Standard Items
    changed._id = this._id;
    return SocketInterface.trigger('updateItem', {data: changed}, options, 'preUpdateItem', this).then(response => {
      return this.collection.update(response);
    });
  }

  /* -------------------------------------------- */

  static createOwned(itemData, actor) {
    let Item = CONFIG.Item.entityClass;
    return new Item(itemData, {actor: actor});
  }
}


/* -------------------------------------------- */


CONFIG.Item.entityClass = Item;
CONFIG.Item.sheetClass = ItemSheet;


/* -------------------------------------------- */


/**
 * The Journal collection
 * @type {Collection}
 */
class Journal extends Collection {

  /**
   * Return the Entity class which is featured as a member of this collection
   * @private
   */
  get object() {
    return JournalEntry;
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers               */
  /* -------------------------------------------- */

  /**
   * Activate Audio socket listeners
   * @private
   */
  static socketListeners(socket) {
    super.socketListeners(socket);
    socket.on("showEntry", this._showEntry.bind(this));
    socket.on("shareImage", this._shareImage);
  }

  /* -------------------------------------------- */

  /**
   * Handle a received request to show a JournalEntry to the current client
   * @param {String} entryId      The ID of the journal entry to display for other players
   * @param {String} mode         The JournalEntry mode to display
   * @param {Boolean} force       Display the entry to all players regardless of normal permissions
   * @private
   */
  static _showEntry(entryId, mode="text", force=true) {
    let entry = this.instance.get(entryId);
    if ( !force && !entry.visible ) return;

    // Don't show an entry that has no content
    if ( mode === "image" && !entry.data.img ) return;
    else if ( mode === "text" && !entry.data.content ) return;

    // Show the sheet with the appropriate mode
    entry.sheet.render(true, {sheetMode: mode});
  }

  /* -------------------------------------------- */

  static _shareImage(imageData) {
    let img = new ImagePopout(imageData.image, { title: imageData.title, shareable: false, editable: false });
    img.render(true);
  }
}


/* -------------------------------------------- */


/**
 * The JournalEntry class
 */
class JournalEntry extends Entity {

  /**
   * Return a reference to the Audio collection to which each Playlist belongs
   * @type {Journal}
   */
  static get collection() {
    return game.journal;
  }

	/* -------------------------------------------- */

  /**
   * Return a reference to the Note instance for this JournalEntry in the current Scene, if any
   * @type {Note}
   */
	get sceneNote() {
	  return canvas.notes.placeables.find(n => n.data.entryId === this._id);
  }

  /* -------------------------------------------- */

  /**
   * Additional updating steps for the JournalEntry entity when new data is saved which trigger some related updates.
   * Re-render the parent collection if names, folders, or permissions have changed
   *
   * @param data {Object}     The new data object which was used to update the JournalEntry
   */
	_onUpdate(data) {
	  super._onUpdate(data);

    // If permissions changed for an entry with a Note, re-draw it
    const keys = Object.keys(data);
    const note = this.sceneNote;
    if ( note && ["name", "permission"].some(k => keys.includes(k)) ) {
      note.draw();
    }
  }

  /* -------------------------------------------- */
  /*  Methods
  /* -------------------------------------------- */

  /**
   * Show the JournalEntry to connected players.
   * By default the entry will only be shown to players who have permission to observe it.
   * If the parameter force is passed, the entry will be shown to all players regardless of normal permission.
   *
   * @param {String} mode     Which JournalEntry mode to display? Default is text.
   * @param {Boolean} force   Display the entry to all players regardless of normal permissions
   * @return {Promise}        A Promise that resolves back to the shown entry once the request is processed
   */
  show(mode="text", force=false) {
    return new Promise((resolve) => {
      game.socket.emit("showEntry", this._id, mode, force, entry => {
        Journal._showEntry(this._id, mode, true);
      });
    });
  }

  /* -------------------------------------------- */

  /**
   * If the JournalEntry has a pinned note on the canvas, this method will animate to that note
   * The note will also be highlighted as if hovered upon by the mouse
   */
  panToNote({scale=1.5, duration=250}={}) {
    const note = this.sceneNote;
    if ( !note ) return;
    if ( note.visible && !canvas.notes._active ) canvas.notes.activate();
    canvas.animatePan({x: note.x, y: note.y, scale, duration}).then(() => {
      if ( canvas.notes._hover ) canvas.notes._hover._onMouseOut(new Event("mouseout"));
      note._onMouseOver(new Event("mouseover"));
    });
  }
}

CONFIG.JournalEntry.entityClass = JournalEntry;

/**
 * A :class:`Collection` of class:`ChatMessage` entities
 * The Messages collection is accessible within the game as `game.messages`.
 *
 * @type {Collection}
 */
class Messages extends Collection {

  /**
   * Elements of the Messages collection are instances of the ChatMessage class
   * @return {ChatMessage}
   */
  get object() {
    return ChatMessage;
  }

  /* -------------------------------------------- */

  /**
   * Don't render any applications for this collection, as rendering is handled at a per-message level
   * @param force
   */
  render(force=false) {
    return;
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Open socket listeners which transact ChatMessage data
   * @private
   */
  static socketListeners(socket) {
    super.socketListeners(socket);
    socket.on('flushChat', () => ui.chat.deleteAll());
  }

  /* -------------------------------------------- */

  /**
   * Create a new ChatMessage using provided data
   * See Collection.create for more details
   */
  create(response) {
    const created = super.create(response);
    this._sayBubble(response);
    return created;
  }

  /* -------------------------------------------- */

  /**
   * If requested, dispatch a Chat Bubble UI for the newly created message
   * @param {Object} response     The created ChatMessage response
   * @private
   */
  _sayBubble(response) {
    if ( response.chatBubble && canvas.ready ) {
      const message = response.created,
            speaker = message.speaker;
      if ( speaker.scene === canvas.scene._id ) {
        const token = canvas.tokens.get(speaker.token);
        if ( token ) canvas.hud.bubbles.say(token, message.content, { emote: message.emote });
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Allow for bulk deletion of all chat messages
   * Confirm first with a yes/no dialog
   */
  static flush() {
    new Dialog({
      title: "Flush Chat Log",
      content: "<h3>Are you sure?</h3><p>All messages within the chat log will be deleted and cleared.</p>",
      buttons: {
        yes: {
          icon: '<i class="fas fa-trash"></i>',
          label: "Flush",
          callback: () => game.socket.emit("flushChat", () => ui.chat.deleteAll())
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        },
      },
      default: 'yes'
    }, {
      width: 400,
      top: window.innerHeight - 150,
      left: window.innerWidth - 720,
    }).render(true);
  }
}


/* -------------------------------------------- */


/**
 * The Chat Message class is a type of :class:`Entity` which represents individual messages in the chat log.
 *
 * @type {Entity}
 */
class ChatMessage extends Entity {
  constructor(...args) {
    super(...args);

    /**
     * Get a reference to the user who sent the chat message
     */
    this.user = game.users.get(this.data.user);

    /**
     * The alias to use for the author of this message
     * @type {String}
     */
    this.alias = this.data.speaker.alias;

    /**
     * If the Message contains a dice roll, store it here
     */
    this._roll = null;
  }

	/* -------------------------------------------- */

  static get collection() {
    return game.messages;
  }

  /* -------------------------------------------- */
  /*  Properties and Attributes
  /* -------------------------------------------- */

  /**
   * Return whether the ChatMessage is visible to the current user
   * Messages may not be visible if they are private whispers or blind rolls
   * @return {Boolean}
   */
  get visible() {
    if ( this.user === game.user ) return !this.data.blind;
    else if ( this.data.whisper.length ) {
      if ( this.data.whisper.indexOf(game.user._id ) !== -1 ) return true;
      let allowSecret = game.settings.get("core", "secretMessages");
      return ( !allowSecret && game.user.isGM );
    }
    return true;
  }

  /* -------------------------------------------- */

  /**
   * Test whether the chat message contains a dice roll
   * @return {Boolean}
   */
  get isRoll() {
    return this.data.roll && (this.roll !== false);
  }

  /* -------------------------------------------- */

  /**
   * Return the Roll instance contained in this chat message, if one is present
   */
  get roll() {
    if ( this._roll === null ) {
      try {
        this._roll = Roll.fromJSON(this.data.roll);
      } catch {
        this._roll = false;
      }
    }
    return this._roll;
  }

  /* -------------------------------------------- */
  /*  HTML Rendering
  /* -------------------------------------------- */

  /**
   * Render the HTML for the ChatMessage which should be added to the log
   * @return {Promise.<HTMLElement>}
   */
  async render() {
    const messageData = {
      user: game.user,
      author: this.user,
      alias: this.alias || (this.user ? this.user.name : ""),
      message: duplicate(this.data),
      cssClass: [
        this.alias ? "ic" : null,
        this.data.emote ? "emote" : null,
        this.data.whisper.length ? "whisper" : null,
        this.data.blind ? "blind": null
      ].filter(c => c !== null).join(" "),
      isWhisper: this.data.whisper.length,
      whisperTo: this.data.whisper.map(u => game.users.get(u).name).join(", ")
    };

    // Enrich message content
    if ( this.isRoll ) {
      messageData.message.content = await this.roll.render();
    } else {
      messageData.message.content = enrichHTML(messageData.message.content, {entities: true});
    }

    // Render the chat message
    let html = await renderTemplate(CONFIG.ChatMessage.template, messageData);
    html = $(html);

    // Call a hook for the rendered ChatMessage data
    Hooks.call("renderChatMessage", this, messageData, html);
    return html;
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Extend the Entity creation workflow for the ChatMessage to first serialize any dice rolls which may be included
   * See :method:`Entity.create` for more details.
   *
   * @param {Object} data         The data with which to create the entity
   * @param {Object} options      Additional options which customize the creation workflow

   * @return {Promise}            A Promise which resolves to contain the created ChatMessage
   */
  static create(data, options) {

    // Ensure to pass IDs rather than objects
    if ( data.speaker && data.speaker.actor instanceof Actor ) data.speaker.actor = data.speaker.actor._id;
    if ( data.speaker && data.speaker.scene instanceof Scene ) data.speaker.scene = data.speaker.scene._id;
    if ( data.speaker && data.speaker.token instanceof Token ) data.speaker.token = data.speaker.token.id;

    // Allow more convenient user reference
    if ( data.user instanceof User ) data.user = data.user._id;

    // Serialize Roll data
    if ( data.roll ) {
      if ( !(data.roll instanceof Roll) ) {
        throw new Error("You may only pass a Roll instance as the roll property of a ChatMessage creation request.");
      }
      data.roll = JSON.stringify(data.roll);
    }

    // Create the message
    return super.create(data, options);
  }

  /* -------------------------------------------- */

  /**
   * Specific actions that should occur be when the ChatMessage is first created
   * @private
   */
	_onCreate(data) {
	  let notify = this.data.user._id !== game.user._id;
	  ui.chat.postOne(this, notify);
	}

  /* -------------------------------------------- */

  /**
   * Specific actions that should occur be when an existing ChatMessage is updated
   * @private
   */
	_onUpdate(data) {
    ui.chat.updateMessage(this);
  }

  /* -------------------------------------------- */

  /**
   * Specific actions that should occur be when an existing ChatMessage is deleted
   * @private
   */
	_onDelete(data) {
	  super._onDelete(data);
    ui.chat.deleteMessage(this._id);
  }

  /* -------------------------------------------- */
  /*  Saving and Loading
  /* -------------------------------------------- */

  /**
   * Export the content of the chat message into a standardized log format
   * @return {String}
   */
  export() {
    let html = $("<article>").html(this.data["content"].replace(/<\/div>/g, "</div>|n")),
        content = html.length ? html.text() : this.data["content"],
        lines = content.replace(/\n/g, "").split("  ").filter(p => p !== "").join(" "),
        text = lines.split("|n").map(l => l.trim()).join("\n"),
        name = this.alias ? this.alias : this.user.name,
        time = new Date(this.data.timestamp).toLocaleDateString('en-US', {
          hour: "numeric",
          minute: "numeric",
          second: "numeric"
        });
    return `[${time}] ${name}\n${text}`;
  }

  /* -------------------------------------------- */

  /**
   * Given a string whisper target, return an Array of the user IDs which should be targetted for the whisper
   *
   * @param {String} name   The target name of the whisper target
   * @return {Array}        An array of user IDs (or possibly none)
   */
  static getWhisperIDs(name) {

    // Whisper to groups
    if (["GM", "DM"].includes(name.toUpperCase())) {
      return game.users.entities.filter(u => u.isGM).map(u => u._id);
    }
    else if (name.toLowerCase() === "players") {
      return game.users.entities.filter(u => u.permission === USER_PERMISSIONS.PLAYER).map(u => u._id);
    }

    // Whisper to a single person
    let user = game.users.entities.find(u => u.name === name);
    if (user) return [user._id];
    let actor = game.users.entities.find(a => a.character && a.character.name === name);
    if (actor) return [actor._id];

    // Otherwise return an empty array
    return [];
  }

  /* -------------------------------------------- */

  /**
   * Attempt to determine who is the speaking character (and token) for a certain Chat Message
   * @returns {Object}  The identified speaker data
   */
  static getSpeaker({scene, actor, token, alias}={}) {

    // If the Actor was not provided, infer it from the impersonated character
    if (!(actor instanceof Actor)) {
      actor = game.user.character;
    }

    // If a Token was not provided, attempt to acquire one
    if (!(token instanceof Token)) {
      if (actor instanceof Actor) {
        let tokens = actor.getActiveTokens();
        if ( tokens.length > 1 ) tokens = tokens.filter(t => t.data.actorId === actor._id );
        if ( tokens.length === 1 ) token = tokens[0];
      } else {
        let tokens = canvas.tokens.controlled;
        if ( tokens.length === 1 ) token = tokens[0];
      }
    }

    // Populate Token info
    if ( token ) {
      return {
        token: token.id,
        scene: token.scene ? token.scene._id : scene,
        actor: token.data.actorId,
        alias: alias || token.name
      };
    }

    // Otherwise just populate whatever we were given
    return {
      scene: canvas.ready ? canvas.scene._id : null,
      actor: actor ? actor._id : null,
      token: null,
      alias: alias || (actor ? actor.name : null)
    }
  }
}

/* -------------------------------------------- */


/**
 * Configure the ChatMessage entity
 * @type {string}
 */
CONFIG.ChatMessage = {
  template: "templates/sidebar/chat-message.html"
};

/**
 * The Playlists collection serves a dual purpose in Foundry VTT.
 * Firstly, it is the collection of pre-defined Playlist entities.
 * Secondly, it provides convenience APIs for programmatically triggering playback of audio effects.
 *
 * Audio playback in Foundry VTT is managed by Howler.js (https://howlerjs.com/). Several methods and 
 * attributes in this API return :class:`Howl` instances. See the Howler documentation for details 
 * and example usage of the Howl API.
 *
 * @type {Collection}
 */
class Playlists extends Collection {

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * Return the Entity class which is featured as a member of this collection
   * @private
   */
  get object() {
    return Playlist;
  }

  /**
   * Return the subset of Playlist entities which are currently playing
   * @type {Array}
   */
  get playing() {
    return this.entities.filter(s => s.data.playing);
  }

	/* -------------------------------------------- */
	/*  Socket Listeners and Handlers               */
	/* -------------------------------------------- */

  /**
   * Activate socket listeners which transact Playlist data
   */
  static socketListeners(socket) {
    super.socketListeners(socket);
    socket.on('createPlaylistSound', this._createSound.bind(this))
          .on('updatePlaylistSound', this._updateSound.bind(this))
          .on('deletePlaylistSound', this._deleteSound.bind(this))
          .on("playAudio", game.audio.play);
  }

	/* -------------------------------------------- */

  /**
   * Add a new Sound to the encounter given a server-side Socket response
   * @param {String} parentId     The parent Playlist ID
   * @param {Object} created      The created Sound data
   * @return {Object}             The created Sound data
   * @private
   */
  static _createSound({parentId, created}) {

    // Get the parent Playlist
    const playlist = game.playlists.get(parentId);
    if ( !playlist ) throw new Error(`Parent Playlist ${parentId} not found`);

    // Push the created data to the child collection
    playlist.data.sounds.push(created);
    console.log(`${vtt} | Created Sound ${created.id} in Playlist ${parent._id}`);

    // Call Hooks and follow-up actions
    playlist._onCreateSound(created);
    Hooks.callAll('createSound', this, parentId, created);
    return created;
  }

	/* -------------------------------------------- */

  /**
   * Handle Sound updates given a server-side Socket response
   * @param {String} parentId     The parent Playlist ID
   * @param {Object} updated      Differential data with which to update
   * @return {Object}             The updated Sound data
   * @private
   */
  static _updateSound({parentId, updated}) {

    // Get the parent Playlist
    const playlist = game.playlists.get(parentId);
    if ( !playlist ) throw new Error(`Parent Playlist ${parentId} not found`);

    // Get the child data and update
    let sound = playlist.data.sounds.find(o => o.id === updated.id);
    mergeObject(sound, updated);

    // Call Hooks and follow-up actions
    playlist._onUpdateSound(sound, updated);
    Hooks.callAll('updateSound', this, parentId, updated);
    return sound;
  }

	/* -------------------------------------------- */

  /**
   * Handle Sound deletion given a server-side Socket response
   * @param {String} parentId     The parent Playlist ID
   * @param {Number} deleted      The deleted Sound ID
   * @return {Number}             The deleted Sound ID
   * @private
   */
  static _deleteSound({parentId, deleted}) {

    // Get the parent Playlist
    const playlist = game.playlists.get(parentId);
    if ( !playlist ) throw new Error(`Parent Playlist ${parentId} not found`);

    // Get the child index and remove from the parent collection
    const sounds = playlist.data.sounds;
    let idx = sounds.findIndex(o => o.id === deleted);
    if ( idx === -1 ) throw new Error(`Sound ${deleted} not found in Playlist ${playlist._id}`);
    let sound = sounds.splice(idx, 1)[0];
    console.log(`${vtt} | Deleted Sound ${deleted} from Playlist ${playlist._id}`);

    // Call Hooks and follow-up actions
    playlist._onDeleteSound(sound);
    Hooks.callAll('deleteSound', this, parentId, deleted);
    return deleted
  }
}


/* -------------------------------------------- */


/**
 * The Playlist class provides an API for managing the playlist entities which are configured and
 * saved to the World database.
 *
 * Each playlist has a unique `_id` and may contain one or more sounds. Each sound (or track) may
 * be played individually or simultaneously with other tracks in the playlist.
 * 
 */
class Playlist extends Entity {
  constructor(...args) {
    super(...args);

    /**
     * Each sound which is played within the Playlist has a created Howl instance.
     * The keys of this object are the sound IDs and the values are the Howl instances.
     * @type {Object}
     */
    this.howls = {};

    /**
     * Playlists may have a shuffle order which gets chosen when the playback is started on shuffle mode
     * @type {Array}
     */
    this.shuffleOrder = [];

    // Create Howl objects
    this.data.sounds.forEach(s => this._createHowl(s));
  }

  /* -------------------------------------------- */

  /**
   * Return a reference to the Playlists collection to which each Playlist belongs
   * @type {Playlists}
   */
  static get collection() {
    return game.playlists;
  }

  /* -------------------------------------------- */

  /**
   * Set up the Howl object by calling the core AudioHelper utility
   * @param {Object} sound
   * @private
   */
  _createHowl(sound) {
    let howl = game.audio.create({src: sound.path});
    this.howls[sound.id] = {
      howl: howl,
      id: undefined
    };
    howl.on("end", howlId => this._onEnd(sound.id, howlId));

    // Handle sounds which are currently playing
    if ( sound.playing ) {
      if ( Howler.state === "suspended" ) game.audio.autoplayPending.push(() => this.playSound(sound));
      else this.playSound(sound);
    }
  }

  /* -------------------------------------------- */

  /**
   * This callback triggers whenever a sound concludes playback
   * Mark the concluded sound as no longer playing and possibly trigger playback for a subsequent sound depending on
   * the playlist mode.
   *
   * @param {Object} soundId  The sound ID of the track which is ending playback
   * @param {Number} howlId   The howl ID which has concluded playback
   * @private
   */
  _onEnd(soundId, howlId) {
    if ( !game.user.isGM ) return;

    // Retrieve the sound object whose reference may have changed
    let sound = this.sounds.find(s => s.id === soundId);
    if ( sound.repeat ) return;

    // Conclude playback for the current sound
    let isPlaying = this.data.playing;
    this.updateSound({id: sound.id, playing: false});

    // Sequential or shuffled playback -- begin playing the next sound
    if ( isPlaying && [PLAYLIST_MODES.SEQUENTIAL, PLAYLIST_MODES.SHUFFLE].includes(this.mode) ) {
      let next = this._getNextSound(sound.id);
      if ( next ) this.updateSound({id: next.id, playing: true});
      else this.update({playing: false});
    }

    // Simultaneous playback - check if all have finished
    else if ( isPlaying && this.mode === PLAYLIST_MODES.SIMULTANEOUS ) {
      let isComplete = !this.sounds.some(s => s.playing);
      if ( isComplete ) {
        this.update({playing: false});
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Generate a new randomized shuffle order. Use a seed for randomization to (hopefully) guarantee that all clients
   * generate the same random order independently.
   * The seed is based on the first 9 characters of the UTC datetime multiplied by the index order of the playlist.
   * @private
   */
  _getShuffleOrder() {
    let seed = Number(new Date().getTime().toString().substr(0, 9)) * game.playlists.index(this._id),
        mt = new MersenneTwister(seed);

    // Draw a random order
    let shuffle = this.sounds.reduce((shuffle, s) => {
      shuffle[s.id] = mt.random();
      return shuffle;
    }, {});
    return this.sounds.map(s => s.id).sort((a, b) => shuffle[a] - shuffle[b]);
  }

  /* -------------------------------------------- */

  /**
   * Get the next sound which should be played in the Playlist after the current sound completes
   * @param {Number} soundId    The ID of the currently playing sound
   * @return {Object}           The sound data for the next sound to play
   * @private
   */
  _getNextSound(soundId) {
    let order;
    if ( this.mode === PLAYLIST_MODES.SHUFFLE ) {
      if ( !this.shuffleOrder.length ) this.shuffleOrder = this._getShuffleOrder();
      order = this.shuffleOrder;
    } else order = this.sounds.map(s => s.id);
    let idx = order.indexOf(soundId);
    if (idx === order.length - 1) idx = -1;
    return this.sounds.find(s => s.id === order[idx + 1]);
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * An Array of the sound data contained within this Playlist entity
   * @type {Array}
   */
  get sounds() {
    return this.data.sounds;
  }

  /**
   * The playback mode for the Playlist instance
   * @type {Number}
   */
  get mode() {
    return this.data.mode;
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /**
   * Play (or stop) a single sound from the Playlist
   * @param sound {Object}       The sound object to begin playback
   */
  playSound(sound) {

    // Get the howler data
    let h = this.howls[sound.id];

    // If the sound is not playing and has never played, bail out
    if ( !sound.playing && !h.id ) return;

    // Start playing
    if ( sound.playing ) {
      if ( h.howl.state() !== "loaded" ) h.howl.load();
      h.id = h.howl.play(h.id);
      let vol = sound.volume * game.settings.get("core", "globalPlaylistVolume");
      h.howl.volume(vol, h.id);
      h.howl.loop(sound.repeat, h.id);
    }

    // End playback
    else h.howl.stop(h.id);
  }

  /* -------------------------------------------- */

  /**
   * Begin simultaneous playback for all sounds in the Playlist
   */
  playAll() {
    if ( this.mode === PLAYLIST_MODES.DISABLED ) return;
    const sounds = {};

    // Sequential mode - play the first track
    if ( this.mode === PLAYLIST_MODES.SEQUENTIAL ) {
      let first = this.sounds[0];
      this.updateSound({id: first.id, playing: true});
    }

    // Simultaneous mode - play all tracks
    else if ( this.mode === PLAYLIST_MODES.SIMULTANEOUS ) {
      this.data.sounds.forEach(s => {
        this.updateSound({id: s.id, playing: true});
      });
    }

    // Shuffle mode - play random track
    else if ( this.mode === PLAYLIST_MODES.SHUFFLE ) {
      this.shuffleOrder = this._getShuffleOrder();
      let first = this.sounds.find(s => s.id === this.shuffleOrder[0]);
      this.updateSound({id: first.id, playing: true});
    }

    // Flag the playlist as playing
    this.data.playing = true;
    this.collection.render();
  }

  /* -------------------------------------------- */

  /**
   * End playback for any/all currently playing sounds within the Playlist
   */
  stopAll() {
    const sounds = this.data.sounds.map(s => {
      s.playing = false;
      return s;
    });
    this.update({playing: false, sounds: sounds});
  }

  /* -------------------------------------------- */

  /**
   * Cycle the playlist mode
   * @return {Promise.<Playlist>}   A promise which resolves to the updated Playlist instance
   */
  cycleMode() {

    // Cycle the playback mode
    const modes = Object.values(PLAYLIST_MODES);
    let mode = this.mode + 1;
    mode = mode > Math.max(...modes) ? modes[0] : mode;

    // Stop current playback
    let sounds = this.data.sounds.map(s => {
      s.playing = false;
      return s;
    });

    // Update the playlist
    return this.update({sounds: sounds, mode: mode});
  }

	/* -------------------------------------------- */
	/*  Socket Listeners and Handlers               */
	/* -------------------------------------------- */

  /**
   * Create a new Sound in the combat encounter
   * @param {Object} data         Sound data to use when creating the new Sound
   * @param {Object} options      Sound creation options
   * @return {Promise.<Object>}   A Promise which resolves to the created Sound data
   */
  async createSound(data, options={}) {
    const eventData = {parentId: this._id, data: data},
          preHook = 'preCreatePlaylistSound';
    return SocketInterface.trigger('createPlaylistSound', eventData, options, preHook, this).then(response => {
      return Playlists._createSound(response);
    });
  }

  /* -------------------------------------------- */

  /**
   * Update an existing Sound within the Playlist
   * @param {Object} data         New data to use when updating the Sound
   * @param {Object} options      Sound update options
   * @return {Promise.<Object>}   A Promise which resolves to the updated Sound data
   */
  async updateSound(data, options={}) {
    const preHook = 'preUpdatePlaylistSound',
          sound = this.data.sounds.find(o => o.id === data.id);

    // Diff the data against the existing sound
    const changed = diffObject(sound, data);
    if ( !Object.keys(changed).length ) return;
    changed['id'] = sound.id;

    // Dispatch the socket event
    const eventData = {parentId: this._id, data: changed};
    return SocketInterface.trigger('updatePlaylistSound', eventData, options, preHook, this).then(response => {
      return Playlists._updateSound(response);
    });
  }

  /* -------------------------------------------- */

  /**
   * Delete an existing Sound within the Playlist
   * @param {Number} id           The Sound id to delete
   * @param {Object} options      Sound deletion options
   * @return {Promise.<Number>}   A Promise which resolves to the deleted Sound ID
   */
  async deleteSound(id, options={}) {
    const eventData = {parentId: this._id, childId: id},
          preHook = 'preDeletePlaylistSound';
    return SocketInterface.trigger('deletePlaylistSound', eventData, options, preHook, this).then(response => {
      return Playlists._deleteSound(response);
    });
  }

  /* -------------------------------------------- */

  /**
   * Additional updating steps for the Playlist entity when new data is saved which trigger some related updates.
   *
   * Modify the playing status of each track
   * Modify the status of the overall playlist
   *
   * @param data {Object}     The new data object which was used to update the Playlist
   */
  _onUpdate(data) {

    // If the playing status of the playlist changed
    if ( data.playing !== undefined ) {
      if (data.playing) this.playAll();
      else this.stopAll();
    }

    // Otherwise toggle individual sounds
    else this.sounds.forEach(s => this.playSound(s));

    // Render the parent collection
    this.collection.render();
  }

  /* -------------------------------------------- */

  /**
   * Follow-up actions to take when a Sound is created in this Playlist
   * @param {Object} sound      The created Sound data
   * @private
   */
  _onCreateSound(sound) {
    this._createHowl(sound);
    this.collection.render();
  }

  /* -------------------------------------------- */

  /**
   * Follow-up actions to take when a Sound is updated in this Playlist
   * @param {Object} sound      The updated Sound data
   * @param {Object} updated    The differential update data
   * @private
   */
  _onUpdateSound(sound, updated) {

    // If the path was changed, we need to re-create the Howl
    if ( Object.keys(updated).includes("path") ) {
      this._onDeleteSound(sound);
      this._createHowl(sound);
    }

    // Play the updated sound (if applicable)
    this.playSound(sound);
    this.collection.render();
  }

  /* -------------------------------------------- */

  /**
   * Follow-up actions to take when a Sound is deleted in this Playlist
   * @param {Object} sound      The deleted Sound data
   * @private
   */
  _onDeleteSound(sound) {
    sound.playing = false;
    this.playSound(sound);
    delete this.howls[sound.id];
    this.collection.render();
  }
}

CONFIG.Playlist.entityClass = Playlist;

/**
 * The collection of Scene entities
 */
class Scenes extends Collection {

  /**
   * Elements of the Scenes collection are instances of the Scene class
   * @return {Actor}
   */
  get object() {
    return Scene;
  }

  /* -------------------------------------------- */

  get active() {
    return this.entities.find(s => s.active);
  }

  get viewed() {
    return this.entities.find(s => s.isView);
  }

	/* -------------------------------------------- */
	/*  Socket Listeners and Handlers               */
	/* -------------------------------------------- */

  /**
   * Open additional socket listeners which transact Actor data
   */
  static socketListeners(socket) {

    // Base Entity listeners
    super.socketListeners(socket);

    // Scene Management listeners
    socket.on('activateScene', sceneId => this._activate(sceneId));
    socket.on('preloadScene', sceneId => this.instance.preload(sceneId));
    socket.on('resetFogExploration', this._onFogReset);

    // Placeable object socket listeners
    const placeables = [TilesLayer, TokenLayer, WallsLayer, LightingLayer, SoundsLayer, TemplateLayer, NotesLayer];
    for ( let p of placeables ) {
      p.socketListeners(socket);
    }

  }

  /* -------------------------------------------- */

  /**
   * Set a new Scene as active
   * @param sceneId {String}    The ID of the scene to activate
   * @private
   */
  static _activate(sceneId) {
    if ( game.scenes.active && sceneId === game.scenes.active._id ) return;
    const collection = this.instance;

    // Ensure the requested scene exists
    let sc = collection.get(sceneId);
    if ( !sc ) return false;
    console.log(`Foundry VTT | Activating Scene ${sc.name}`);

    // Deactivate other scenes
    collection.entities.forEach(scene => scene.data.active = scene._id === sceneId);

    // View the newly activated scene
    sc.view();

    // Update the combat tracker for the new scene
    game.combats.render();
  }

  /* -------------------------------------------- */

  preload(sceneId, push=false) {
    if ( push ) return game.socket.emit('preloadScene', sceneId, () => this.preload(sceneId));
    let scene = this.get(sceneId);
    if ( !canvas.app.loader.resources.hasOwnProperty(scene.data.img) ) {
      canvas.app.loader.add(scene.data.img).load();
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle a Fog of War exploration reset request
   * @param {Object} resetData
   * @private
   */
  static _onFogReset(resetData) {
    if ( resetData.reset && (resetData.scene === canvas.scene._id) ) {
      canvas.sight.fogData = {};
      canvas.sight.fogPositions = {};
      canvas.sight.draw();
      canvas.sight.initialize();
    }
  }
}


/* -------------------------------------------- */
/*  The Scene Entity                            */
/* -------------------------------------------- */


/**
 * The Scene entity
 */
class Scene extends Entity {
  constructor(...args) {
    super(...args);

    /**
     * Track whether the scene is the active view
     * @type {Boolean}
     */
    this._view = this.data.active;

    /**
     * Track the viewed position of each scene (while in memory only, not persisted)
     * When switching back to a previously viewed scene, we can automatically pan to the previous position.
     * Object with keys: x, y, scale
     * @type {Object}
     */
    this._viewPosition = {};

    /**
     * A reference to the active Scene Notes instance for this Scene
     * @type {SceneNotes}
     */
    this._notes = null;
  }

	/* -------------------------------------------- */

	get img() {
	  return this.data.img;
  }

  get active() {
	  return this.data.active;
  }

  get isView() {
	  return this._view;
  }

	/* -------------------------------------------- */

  static get collection() {
    return game.scenes;
  }

	/* -------------------------------------------- */

  /**
   * A singleton instance of the SheetNotes class
   */
	get notes() {
	  if ( this._notes ) return this._notes;
	  let cls = CONFIG.Scene.notesClass;
	  if ( !cls ) return null;
	  this._notes = new cls(this, {editable: this.owner});
    return this._notes;
  }

	/* -------------------------------------------- */

  /**
   * Set this scene as the current view
   */
	view() {

    // Switch the viewed scene
    this.collection.entities.forEach(scene => {
      scene._view = scene._id === this._id;
    });

    // Re-draw the canvas if the view is different
    if ( canvas.id !== this._id ) {
      console.log(`Foundry VTT | Viewing Scene ${this.name}`);
      canvas.draw();
    }

    // Render apps for the collection
    this.collection.render();
  }

	/* -------------------------------------------- */

  /**
   * Set this scene as currently active
   * @return {Promise}  A Promise which resolves to the current scene once it has been successfully activated
   */
	async activate() {
	  if ( !game.user.isGM ) throw new Error("You do not have permission to activate a scene.");
	  if ( this.active ) return this;
	  return new Promise((resolve) => {
	    game.socket.emit('activateScene', this._id, () => {
	      Scenes._activate(this._id);
        resolve(this);
      });
    });
  }

	/* -------------------------------------------- */
	/*  Socket Listeners and Handlers               */
	/* -------------------------------------------- */

  /**
   * Extend the default Entity update method to add additional functionality for handling Scene thumbnails
   * @param {Object} data   The data with which to update the entity
   * @return {Promise}      A Promise which resolves to the updated Entity
   */
	async update(data) {
	  let imgChange = data.hasOwnProperty("img") && (data.img !== this.data.img),
	      needsThumb = data.hasOwnProperty("img") && !this.data.thumb;

	  // Update the Scene thumbnail if necessary
    if ( imgChange || needsThumb ) {
      try {
        const thumbData = await BackgroundLayer.createThumbnail(data.img);
        data = mergeObject(data, thumbData);
      } catch(err) {
        ui.notifications.error("Thumbnail generation for Scene failed: " + err.message);
        data["thumb"] = null;
      }
    }

    // Call the Entity update
    return super.update(data);
  }

	/* -------------------------------------------- */

  /**
   * Additional updating steps for the Scene entity when new data is saved which trigger some related updates.
   *
   * If the updated scene is active, re-draw the canvas
   * If sight/vision settings were changed, re-initialize sight
   * If the scene name or image were changed update the directory collection
   *
   * @param data {Object}     The new data object which was used to update the Scene
   */
  _onUpdate(data) {
    super._onUpdate(data);

    // Get the changed attributes
    let changed = new Set(Object.keys(data).filter(k => k !== "_id"));

    // If we have updated visible and there is no active scene, auto-activate
    if ( !canvas.scene && data.navigation && changed.has("navigation") ) this.activate();

    // If the background image was removed, also remove the thumbnail
    if ( changed.has("img") && !this.data.img ) this.data.thumb = null;

    // If this Scene is actively drawn on the canvas, take some additional updating steps
    if ( canvas.scene === this ) {

      // Re-draw completely
      const redraw = [
        "backgroundColor", "gridType", "grid", "gridAlpha", "gridColor", "gridDistance", "gridUnits",
        "shiftX", "shiftY", "width", "height", "img", "tokenVision", "globalLight", "fogExploration",
        "lights", "sounds", "templates", "tiles", "walls", "weather"
      ];
      if ( redraw.some(k => changed.has(k)) ) canvas.draw();
    }

    // Multiple token update
    if ( changed.has("tokens") ) canvas.tokens._onUpdateMany(this._id, data.tokens);
  }
	/* -------------------------------------------- */

  /**
   * Additional updating steps for the Scene entity the entity is deleted
   */
  _onDelete() {
    super._onDelete();
    if ( canvas.scene._id === this._id ) canvas.draw();
  }
}

CONFIG.Scene.entityClass = Scene;

/**
 * The collection of User entities
 * @type {Collection}
 */
class Users extends Collection {

  /**
   * Elements of the Users collection are instances of the User class
   * @return {User}
   */
  get object() {
    return User;
  }

  /**
   * Get the users with player permissions
   * @return {Array.<User>}
   */
  get players() {
    return this.entities.filter(u => u.permission && u.permission < USER_PERMISSIONS.ASSISTANT)
  }
}


/* -------------------------------------------- */


/**
 * The User entity
 * @type {Entity}
 */
class User extends Entity {

  /**
   * User instances belong to the Users collection
   * @type {Users}
   */
  static get collection() {
    return game.users;
  }

  /**
   * Return the Actor instance of the user's impersonated character (or undefined)
   * @type {Actor}
   */
  get character() {
    return game.actors.get(this.data.character);
  }

  /**
   * Return a flag for whether this User is currently active
   * @type {Boolean}
   */
  get active() {
    return this.data.active;
  }

  /**
   * A convenience shortcut for the permission level of the current User
   * @type {Number}
   */
  get permission() {
    return this.data.permission;
  }

  /**
   * A flag for whether the current User is a Trusted Player
   * @return {Boolean}
   */
  get isTrusted() {
    return this.permission >= USER_PERMISSIONS["TRUSTED"];
  }

  /**
   * A flag for whether the current User has Assistant GameMaster or full GameMaster permission
   * @return {Boolean}
   */
  get isGM() {
    return this.permission >= USER_PERMISSIONS["ASSISTANT"];
  }

  /**
   * A flag for whether this User is the connected client
   * @return {Boolean}
   */
  get isSelf() {
    return game.userId === this._id;
  }

	/* -------------------------------------------- */

  /**
   * Additional updating steps for the User entity when new data is saved which trigger some related updates.
   *
   * Re-draw the active cursor and toggle visibility
   * Re-draw navigation if the active or viewed scenes have changed
   * Render the players UI if activity status or other player features have changed
   * Update the canvas if the player's impersonated character has changed
   *
   * @private
   * @param data {Object}     The new data object which was used to update the User
   */
  _onUpdate(data) {
    super._onUpdate(data);

    // Get the changed attributes
    let changed = Object.keys(data).filter(k => k !== "_id");

    // Redraw Cursor
    if ( canvas.ready && changed.includes("color") ) canvas.controls.drawCursor(this);
    if ( canvas.ready && changed.includes("active") ) canvas.controls.updateCursor(this, null);

    // Redraw Navigation
    if ( changed.some(p => ["active", "scene", "color"].includes(p)) ) ui.nav.render();

    // Redraw Players UI
    if ( changed.some(p => ["active", "character", "color"].includes(p)) ) ui.players.render();

    // Modify impersonated character
    if ( canvas.ready && changed.includes("character") ) {
        canvas.sight.initialize();
        canvas.tokens.cycleTokens(1, true);
    }
  }
}


/**
 * A helper class providing utility methods for PIXI Canvas animation
 */
class CanvasAnimation {
  static get ticker() {
    return canvas.app.ticker;
  }

  /* -------------------------------------------- */

  /**
   * Apply a linear animation from the current value of some attribute to a new value
   * Resolve a Promise once the animation has concluded and the attributes have reached their new target
   * @param {Array} attributes  An array of attributes to animate. Structure of the Array is shown in the example
   * @param {Container} context An animation context to use which defines scope
   * @param {String} name       Provide a unique animation name which may be referenced later
   * @param {Number} duration   The duration in milliseconds over which the animation should occur
   * @param {Function} ontick   A function which defines additional behaviors to apply every animation frame
   * @return {Promise}          A Promise which resolves once the linear animation has concluded
   *
   * @example
   * let animation = [
   *   {
   *     parent: token,
   *     attribute: x,
   *     to: 1000
   *   },
   *   {
   *     parent: token,
   *     attribute: y,
   *     to: 2000
   *   }
   * ];
   * CanvasAnimation.animateLinear(attributes, {duration:500, ontick: console.log("ticking")});
   */
  static async animateLinear(attributes, {context, name=null, duration=1000, ontick}={}) {

    // Prepare attributes
    attributes = attributes.map(a => {
      a.delta = a.to - a.parent[a.attribute];
      a.remaining = Math.abs(a.delta);
      return a;
    }).filter(a => a.delta !== 0);

    // Register the request function and context
    context = context || canvas.stage;

    // Dispatch the animation request and return as a Promise
    return this._animatePromise(this._animateFrame, context, name, attributes, duration, ontick);
  }

  /* -------------------------------------------- */

  /**
   * If an animation using a certain name already exists, terminate it
   * @param {String} name
   * @private
   */
  static terminateAnimation(name) {
    let animation = this.animations[name];
    if ( animation ) {
      this.ticker.remove(...animation);
      delete this.animations[name];
    }
  }

  /* -------------------------------------------- */

  /**
   * Asynchronously animate a transition function and resolve a Promise once the animation has completed
   * @param {Function} fn         A suitable transition function. See PIXI.Ticker for details
   * @param {Container} context   The Canvas container providing scope for the transition
   * @param {String} name         Provide a unique animation name which may be referenced later
   * @param {...} args            Variable argument passed to the transition function each frame
   * @return {Promise}            A Promise which resolves once the animation has completed
   * @private
   */
  static async _animatePromise(fn, context, name, ...args) {
    let animate;

    // Check for an existing named animation
    if ( name ) this.terminateAnimation(name);

    // Add the animation function to the Ticker
    return new Promise((resolve, reject) => {
      animate = dt => fn(dt, resolve, reject, ...args);
      this.ticker.add(animate, context);
      if ( name ) this.animations[name] = [animate, context];
    })

    // Remove the animation function once resolved or rejected
    .then(() => {
      this.ticker.remove(animate, context);
      if ( name ) delete this.animations[name];
    })
    .catch(err => {
      console.error(err);
      this.ticker.remove(animate, context);
      if ( name ) delete this.animations[name];
    });
  }

  /* -------------------------------------------- */

  /**
   * Generic ticker function to implement the animation.
   * This animation wrapper executes once per frame for the duration of the animation event.
   * Once the animated attributes have converged to their targets, it resolves the original Promise.
   * The user-provided ontick function runs each frame update to apply additional behaviors.
   * @private
   */
  static _animateFrame(deltaTime, resolve, reject, attributes, duration, ontick) {
    let complete = attributes.length === 0;
    let dt = (duration * PIXI.settings.TARGET_FPMS) / deltaTime;

    // Update each attribute
    try {
      for (let a of attributes) {
        let da = a.delta / dt;
        if ( a.remaining < Math.abs(da) * 1.25 ) {
          a.parent[a.attribute] = a.to;
          a.remaining = 0;
          complete = true;
        } else {
          a.parent[a.attribute] += da;
          a.remaining -= Math.abs(da);
        }
      }
      if (ontick) ontick(dt, attributes);
    }
    catch (err) {
      reject(err);
    }

    // Resolve the original promise once the animation is complete
    if (complete) resolve();
  }
}


/**
 * Track an object of active animations by name, context, and function
 * This allows a currently playing animation to be referenced and terminated
 */
CanvasAnimation.animations = {};

/**
 * A generic helper for drawing a standard Control Icon
 * @type {PIXI.Container}
 */
class ControlIcon extends PIXI.Container {
  constructor({texture, size=40, borderColor=0xFF5500}, ...args) {
    super(...args);

    // Define hit area
    this.interactive = true;
    this.interactiveChildren = false;
    this.rect = [-2, -2, size+4, size+4];
    this.hitArea = new PIXI.Rectangle(...this.rect);

    // Background
    this.bg = this.addChild(this._drawBackground(size));

    // Icon
    this.icon = this.addChild(this._drawIcon(texture, size));

    // Border
    this.border = this.addChild(this._drawBorder(borderColor));
  }

  /* -------------------------------------------- */

  /**
   * Draw the control background
   * @private
   */
  _drawBackground(size) {
    let bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.4).lineStyle(2, 0x000000, 1.0).drawRoundedRect(...this.rect, 5).endFill();
    return bg;
  }

  /* -------------------------------------------- */

  /**
   * Draw the icon image
   * @private
   */
  _drawIcon(texture, size) {
    let tex = new PIXI.Texture.from(texture),
        icon = new PIXI.Sprite(tex);
    icon.width = icon.height = size;
    return icon;
  }

  /* -------------------------------------------- */

  /**
   * Draw the control border
   */
  _drawBorder(borderColor) {
    let border = new PIXI.Graphics();
    border.lineStyle(2, borderColor, 1.0).drawRoundedRect(...this.rect, 5).endFill();
    border.visible = false;
    return border;
  }

}
/**
 * A generic event and interaction handling framework for elements drawn on the PIXI canvas
 */
class HandleManager {
  constructor(handle, layer, handlers, {canhover=true, canclick=true, canright=true, candrag=true}={}) {
    if ( !( handle instanceof PIXI.Container ) && !( handle instanceof PIXI.Graphics ) ) {
      throw new Error("You may only use the Handle class on a Container or Graphics element.");
    }

    /**
     * The element for which interaction events are handled
     * @type {PIXI.Container|PIXI.Graphics}
     */
    this.handle = handle;

    /**
     * The canvas layer within which handled events are tracked
     * @type {CanvasLayer}
     */
    this.layer = layer;

    /**
     * The set of event handlers which are used for each interaction type
     * @type {Object<Function>}
     */
    this.handlers = this._validateHandlers(handlers);

    /**
     * A set of permission checks
     * @type {Object<Function>}
     */
    this.permissions = {
      hover: canhover,
      click: canclick,
      right: canright,
      drag: candrag
    };

    // Start with the mouseover event
    this.handle.interactive = true;
    this.handle.removeAllListeners();
    this.handle.on("mouseover", this._onMouseOver, this);
  }

  /* -------------------------------------------- */

  static get allowedHandlers() {
    return ["mouseover", "mouseout", "mousedown", "rightdown", "mousemove", "mouseup",
            "doubleleft", "doubleright", "cancel"];
  }

  /* -------------------------------------------- */

  /**
   * Validate the set of user provided event handlers
   * @param {Object} handlers
   * @private
   */
  _validateHandlers(handlers) {
    return this.constructor.allowedHandlers.reduce((h, ev) => {
      let fn = handlers[ev];
      if ( fn && fn instanceof Function ) h[ev] = fn;
      return h;
    }, {});
  }

  /* -------------------------------------------- */

  can(perm, event) {
    let can = this.permissions[perm];
    return can instanceof Function ? can(event) : can;
  }

  /* -------------------------------------------- */
  /*  Event Handlers
  /* -------------------------------------------- */

  /**
   * Handle initial mouse-over event
   * Activate additional downstream listeners for click events which may follow
   * Mouse-over events DO NOT stop propagation as it is possible to hover over multiple entities at once
   * @private
   */
  _onMouseOver(event) {
    if ( event.data.handleState > 0 ) return;

    // Handle only if hover is permitted
    if ( !this.can("hover", event) ) return;

    // Deactivate any existing listeners
    this.handle.off("mouseout").off("mousedown").off("rightdown");

    // Add listeners for mousedown, rightdown, and mouseout events
    this.handle.once("mouseout", this._onMouseOut, this)
               .on("mousedown", this._onMouseDown, this)
               .on("rightdown", this._onRightDown, this);

    // Assign event data and call the provided handler
    event.data.handle = this.handle;
    if ( this.handlers.mouseover ) this.handlers.mouseover(event);
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse-out events
   * Mouse-out events DO NOT stop propagation as it is possible to unhover multiple entities at once
   * @private
   */
  _onMouseOut(event) {
    if ( event.data.handleState > 0 ) return;
    event.data.handle = this.handle;
    if ( this.handlers.mouseout ) this.handlers.mouseout(event);
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse-click events
   * Record the time of each click to activate a double-click within a certain threshold
   * Activate a layer-level listener for the mousemove event
   * @private
   */
  _onMouseDown(event) {

    // Test whether the user can trigger the click event
    const canClick = this.can("click", event);
    if ( !canClick ) return;

    // Stop further propagation and record handle state
    event.stopPropagation();
    if ( event.data.handleState > 0 ) return;

    // Clear existing move handler
    this.layer.off("mousemove");

    // Populate event data
    event.data.handleState = 0;
    event.data.handle = this.handle;
    event.data.origin = event.data.getLocalPosition(this.layer);

    // Check click time
    let now = Date.now();
    if ( ( now - event.data.lClickTime <= 250 ) && this.handlers.doubleleft ) {
      return this.handlers.doubleleft(event);
    }
    event.data.lClickTime = now;

    // Call the user provided mouse-down handler
    if ( this.handlers.mousedown ) this.handlers.mousedown(event);

    // Activate downstream listeners for mouse movement and release
    this._layerInteractive = this.layer.interactive;
    this.layer.interactive = true;
    this.handle.off("mouseup").off("mouseupoutside");
    if ( this.can("drag", event) ) {
      this.layer.on("mousemove", this.handlers.mousemove, this);
      this.handle.once("mouseup", this._onMouseUp, this)
                 .once("mouseupoutside", this._onMouseUp, this);
      canvas.app.view.addEventListener("contextmenu", ev => this._onMouseMoveCancel(event), {once: true});
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle right-click events
   * Record the time of each click to activate a double-click within a certain threshold
   * @private
   */
  _onRightDown(event) {
    if ( !this.can("right", event) ) return;
    event.stopPropagation();
    if ( event.data.handleState > 0 ) return;

    // Populate event data
    event.data.handleState = 0;
    event.data.handle = this.handle;

    // Check click time
    let now = Date.now();
    if ( ( now - event.data.rClickTime <= 250 ) && this.handlers.doubleright ) {
      return this.handlers.doubleright(event);
    }
    event.data.rClickTime = now;

    // Call user-provided right click handler
    if ( this.handlers.rightdown ) this.handlers.rightdown(event);
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse movement events while the workflow is active
   * @private
   */
  _onMouseMove(event) {
    event.stopPropagation();
    if ( event.data.handleState === 0 ) return;
    if ( this.handlers.mousemove ) this.handlers.mousemove(event);
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse-up events
   * Deactivate layer-level listener for the mousemove event
   * @private
   */
  _onMouseUp(event) {
    event.stopPropagation();
    if ( event.data.handleState > 0 ) {
      event.data.destination = event.data.getLocalPosition(this.layer);
    }

    // Call user-provided mouse-up handler
    if (this.handlers.mouseup) this.handlers.mouseup(event);

    // Deactivate listeners
    this.layer.interactive = this._layerInteractive;
    delete this._layerInteractive;
    this.layer.off("mousemove");
    this.handle.off("mouseup").off("mouseupoutside");

    // Reset state
    event.data.handleState = 0;
  }

  /* -------------------------------------------- */

  /**
   * Handle right-click cancellation of a mouse move event
   * @private
   */
  _onMouseMoveCancel(event) {
    event.stopPropagation();
    if ( event.data.handleState > 0 ) {
      event.data.handleState = 0;

      // Deactivate listeners
      this.layer.interactive = this._layerInteractive;
      delete this._layerInteractive;
      this.layer.off("mousemove");
      this.handle.off("mouseup").off("mouseupoutside");

      // Call user-provided handler
      if (this.handlers.cancel) this.handlers.cancel(event);
    }
  }
}

/**
 * Get a single texture from the cache
 * @param {String} src
 * @return {PIXI.Texture|PIXI.VideoBaseTexture}
 */
function getTexture(src) {

  // Attempt to draw the requested texture from the loader cache
  let cached = PIXI.loader.resources[src];
  if ( cached ) {

    // Transform Video data to a special VideoBaseTexture
    if ( cached.data.tagName === "VIDEO" ) {
      let vbt = PIXI.VideoBaseTexture.fromVideo(cached.data, PIXI.SCALE_MODES.LINEAR, false, false);
      return PIXI.Texture.from(vbt);
    }

    // Otherwise just return the texture directly
    return PIXI.loader.resources[src].texture;
  }

  // If the texture was not cached, load it in real-time
  return PIXI.Texture.from(src, {resourceOptions: {
    autoLoad: true,
    crossorigin: false,
    scale: 1
  }});
}

/* -------------------------------------------- */

/**
 * Load a single texture and return a Promise which resolves once the texture is ready to use
 * @param {String} src
 * @return {PIXI.Texture|PIXI.VideoBaseTexture}
 */
async function loadTexture(src) {

  // Attempt to draw the requested texture from the loader cache
  let cached = PIXI.loader.resources[src];
  if ( cached ) {

    // Transform Video data to a special VideoBaseTexture
    if ( cached.data.tagName === "VIDEO" ) {
      let vbt = PIXI.VideoBaseTexture.fromVideo(cached.data, PIXI.SCALE_MODES.LINEAR, false, false);
      return PIXI.Texture.from(vbt);
    }

    // Otherwise just return the texture directly
    return PIXI.loader.resources[src].texture;
  }

  // FIX: Pre-check any video textures since GET 404 errors are not currently handled by the resource loader
  // https://github.com/pixijs/pixi.js/issues/5336
  if ( /(\.webm|\.mp4|\.ogg)(\?.*)?$/i.test(src) ) {
    if ( !await srcExists(src) ) return Promise.reject(`Failed to load texture ${src}`);
  }

  // Otherwise load it and wait for loading to resolve
  let tex = PIXI.Texture.from(src, {resourceOptions: {
    autoLoad: true,
    crossorigin: false
  }});

  // Return the ready texture as a Promise
  return new Promise((resolve, reject) => {
    let base = tex.baseTexture;
    if ( base.hasLoaded ) resolve(tex);
    base.once("loaded", f => resolve(tex));
    base.once("error", base => {
      let err = new Error(`Failed to load texture ${base.imageUrl}`);
      delete PIXI.loader.resources[base.imageUrl];
      reject(err);
    });
  });
}


/* -------------------------------------------- */

/**
 * Load all the primary textures which are required in order to render a Scene
 * @param scene {Scene}
 * @return {Promise}
 */
async function loadSceneTextures(scene) {
  const loader = PIXI.loader,
        sd = scene.data;

  // Construct an Array of resources to load
  let toLoad = [];

  // Scene background image
  let bg = sd.img;
  if (bg ) toLoad.push(bg);

  // Placeable tiles
  toLoad = toLoad.concat(sd.tiles.filter(t => t.img).map(t => t.img));

  // Tokens
  toLoad = toLoad.concat(sd.tokens.filter(t => t.img).map(t => t.img));

  // Create unique array
  toLoad = new Array(...new Set(toLoad.filter(t => !loader.resources.hasOwnProperty(t))));

  // FIX: Pre-check any video textures since GET 404 errors are not currently handled by the resource loader
  // https://github.com/pixijs/pixi.js/issues/5336
  const valid = [];
  for ( let f of toLoad ) {
    if ( !/(\.webm|\.mp4|\.ogg)(\?.*)?$/i.test(f) || await srcExists(f) ) valid.push(f);
  }

  // Add resources to the loader
  loader.add(valid, {
    crossOrigin: ""
  });

  // Begin load
  return new Promise((resolve, reject) => {
    loader.removeAllListeners();

    // Progress handlers
    loader.on('progress', (loader, resource) => {
      let pct = Math.round(loader.progress * 10) / 10;
      console.log(`${vtt} | Loaded ${resource.name} (${pct}%)`);
    });

    // Error handlers
    loader.on('error', (loader, resources, resource) => {
      console.log(resource);
      console.warn(`${vtt} | Texture load failed for ${resource.name}`);
    });

    // Trigger the load
    loader.load((loader, resources) => {
      resolve(resources);
    });
  });
}


/* -------------------------------------------- */


async function srcExists(src) {
  return fetch(src, { method: 'HEAD' }).then(resp => {
    if ( resp.status !== 404 ) return true;
  }).catch(err => false);
}

/**
 * A ray for the purposes of computing sight and collision
 * Given points A[x,y] and B[x,y]
 *
 * Slope-Intercept form:
 * y = a + bx
 * y = A.y + ((B.y - A.Y) / (B.x - A.x))x
 *
 * Parametric form:
 * R(t) = (1-t)A + tB
 */
class Ray {
  constructor(A, B) {

    // Store points
    this.A = A;
    this.B = B;

    // Origins
    this.y0 = A.y;
    this.x0 = A.x;

    // Slopes
    this.dx = B.x - A.x;
    this.dy = B.y - A.y;
  }

  /* -------------------------------------------- */

  get slope() {
    return this.dy / this.dx;
  }

  get angle() {
    return Math.atan2(this.dy, this.dx);
  }

  get distance() {
    return Math.sqrt(Math.pow(this.B.x - this.A.x, 2) + Math.pow(this.B.y - this.A.y, 2));
  }
  
  /* -------------------------------------------- */

  static fromAngle(x, y, radians, distance) {
    let dx = Math.cos(radians),
        dy = Math.sin(radians);
    return Ray.fromArrays([x ,y], [x + (dx * distance), y + (dy * distance)]);
  }

  /* -------------------------------------------- */

  static fromArrays(A, B) {
    return new this({x: A[0], y: A[1]}, {x: B[0], y: B[1]});
  }

  /* -------------------------------------------- */

  /**
   * Project the Array by some proportion of it's initial distance.
   * Return the coordinates of that point along the path.
   * @param {Number} t    The distance along the Ray
   * @return {Object}     The coordinates of the projected point
   */
  project(t) {
    return {
      x: this.A.x + (t * this.dx),
      y: this.A.y + (t * this.dy)
    }
  }

  /* -------------------------------------------- */

  shiftAngle(angleOffset) {
    let angle = this.angle + angleOffset;
    let distance = Math.max(canvas.dimensions.width, canvas.dimensions.height);
    return Ray.fromAngle(this.x0, this.y0, angle, distance);
  }

  /* -------------------------------------------- */

  /**
   * Find the point I[x,y] and distance t* on ray R(t) which intersects another ray
   * http://paulbourke.net/geometry/pointlineplane/
   */
  intersectSegment(coords) {
    return this.constructor._getIntersection(this.A.x, this.A.y, this.B.x, this.B.y, ...coords);
  }

  static _getIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {

    // Length 0 === false
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
      return false
    }

    // Check denominator - avoid parallel lines where d = 0
    let d = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    if (d === 0) {
      return false
    }

    // Get vector distances
    let t0 = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / d;
    let t1 = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / d;

    // Confirm the solution lies within both segments
    if (t0 < 0 || t0 > 1 || t1 < 0 || t1 > 1) {
      return false
    }

    // Return an objects with the point of intersection and the distance from the origin
    return {
      x: x1 + t0 * (x2 - x1),
      y: y1 + t0 * (y2 - y1),
      t0: t0,
      t1: t1
    }
  }
}

/**
 * A PIXI.Container subclass of CanvasLayer responsible for rendering the scene background image.
 * The singleton instance of this class is accessed through ``canvas.background``. 
 *
 * @type {CanvasLayer}
 */
class BackgroundLayer extends CanvasLayer {
  constructor() {
    super();

    /**
     * The background image
     * @type {PIXI.Sprite}
     */
    this.img = null;
  }

  /* -------------------------------------------- */
  /*  Properties and Attributes
  /* -------------------------------------------- */

  /**
   * Return the base HTML element which is used to generate the Scene background
   * @return {HTMLElement}
   */
  get source() {
    if ( !this.img ) return null;
    return this.img.texture.baseTexture.source;
  }

  /* -------------------------------------------- */

  /**
   * Return a Boolean flag for whether the Scene background texture is a Video element
   * @return {Boolean}
   */
  get isVideo() {
    let source = this.source;
    return ( source && source.tagName === "VIDEO" );
  }

  /* -------------------------------------------- */
  /*  Rendering
  /* -------------------------------------------- */

  /**
   * Draw the background image.
   * We first load the image texture and store it in the PIXI loader.
   * Once the requested image has been fully loaded we draw it as a PIXI.Sprite
   *
   * @return {Promise.<BackgroundLayer>}    Returns the instance of the Background Layer for convenient chaining
   */
  async draw() {
    if ( this.img ) {
      this.img.destroy({texture: false, baseTexture: false});
      this.img = null;
    }
    if ( !canvas.scene.data.img ) return;

    // Load the background texture
    let tex = getTexture(canvas.scene.data.img);

    // If the canvas does not have dimensions set - push them and restart the process
    let scene = canvas.scene;
    if ( !scene.data.width || !scene.data.height ) {
      canvas.scene.update({width: tex.orig.width, height: tex.orig.height}, true);
    }

    // Create the background Sprite
    let d = canvas.dimensions,
        bg = new PIXI.Sprite(tex);

    // Otherwise configure the bg position and dimensions
    bg.position.set(d.paddingX - d.shiftX, d.paddingY - d.shiftY);
    bg.width = canvas.scene.data.width;
    bg.height = canvas.scene.data.height;

    // Add the background sprite to the layer
    this.img = this.addChild(bg);

    // Ensure playback state for video backgrounds
    if ( this.isVideo ) {
      this.source.play();
      this.source.loop = true;
      this.source.volume = game.settings.get("core", "globalAmbientVolume");
    }

    // Return the layer
    return this;
  }

  /* -------------------------------------------- */
  /*  Methods
  /* -------------------------------------------- */

  /**
   * The BackgroundLayer can never be active
   */
  activate() {
    return false;
  }

  /* -------------------------------------------- */

  /**
   * Create a 300px by 100px thumbnail image for this scene background
   * @param {String} texture  The background texture path
   * @return {String}         base64 image data
   */
  static async createThumbnail(texture) {
    if ( !texture ) return null;
    texture = await loadTexture(texture);

    // Create the image
    let img = new PIXI.Sprite(texture);
    let ratio = texture.width / texture.height;
    if ( ratio > 3 ) {
      img.height = 100;
      img.width = 100 * ratio;
    } else {
      img.width = 300;
      img.height = 300 / ratio;
    }

    // Mask the center to crop it to a RenderTexture
    img.position.set((300 - img.width) / 2, (100 - img.height) / 2);
    let tex = PIXI.RenderTexture.create(300, 100, PIXI.SCALE_MODES.LINEAR, 2);
    canvas.app.renderer.render(img, tex);

    // Export the rendered texture to base64
    let thumb = new PIXI.Sprite(tex),
        data = canvas.app.renderer.extract.base64(thumb);
    tex.destroy(true);

    // Return the image data
    return {
      width: texture.width,
      height: texture.height,
      thumb: data
    };
  }
}

/**
 * A CanvasLayer for displaying visual effects like weather, transitions, flashes, or more
 * @type {CanvasLayer}
 */
class EffectsLayer extends CanvasLayer {
	constructor() {
		super();

		/**
		 * The weather overlay container
		 * @type {PIXI.Container}
		 */
		this.weather = null;

		/**
		 * The currently active weather effect
		 * @type {SpecialEffect}
		 */
		this.weatherEffect = null;

		/**
		 * Track any active emitters within this Scene
		 * @type {Array}
		 */
		this.emitters = [];
	}

	/* -------------------------------------------- */

	async draw() {

		// Draw the weather layer
		this.drawWeather();
	}

	/* -------------------------------------------- */

	drawWeather() {
		if ( this.weatherEffect )	this.weatherEffect.stop();
		if ( !this.weather ) this.weather = this.addChild(new PIXI.Container());

		// Get the requested weather effect
		const effect = CONFIG.weatherEffects[canvas.scene.data.weather];
		if ( !effect ) return;

		// Create the effect and begin playback
		this.weatherEffect = new effect(this.weather);
		this.weatherEffect.play();
	}
}

/**
 * The Ambient Lighting Container
 * @type {PlaceablesLayer}
 */
class LightingLayer extends PlaceablesLayer {

  /**
   * Define the source data array underlying the placeable objects contained in this layer
   * @type {Array}
   */
  static get dataArray() {
    return "lights";
  }

  /**
   * Define a Container implementation used to render placeable objects contained in this layer
   * @type {PIXI.Container}
   */
  static get placeableClass() {
    return AmbientLight;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Default handling of drag start events by left click + dragging
   * @private
   */
  _onDragStart(event) {
    super._onDragStart(event);
    let origin = event.data.origin,
        light = new AmbientLight({x: origin.x, y: origin.y, type: "l"}).draw();
    event.data.object = this.preview.addChild(light);
  }

  /* -------------------------------------------- */

  /**
   * Default handling of mouse move events during a dragging workflow
   * @private
   */
  _onMouseMove(event) {
    super._onMouseMove(event);
    if ( event.data.createState >= 1 ) {
      let light = event.data.object;
      let radius = Math.hypot(event.data.destination.x - event.data.origin.x,
                              event.data.destination.y - event.data.origin.y);
      light.data.dim = radius * (canvas.dimensions.distance / canvas.dimensions.size);
      light.data.bright = light.data.dim / 2;
      light.refresh();
      event.data.createState = 2;
    }
  }
}

/**
 * The Notes Layer Container
 * @type {PlaceablesLayer}
 */
class NotesLayer extends PlaceablesLayer {
  constructor() {
    super();

    /**
     * Notes are created through drag-and-drop rather than drag-creation
     * @type {Boolean}
     */
    this._canDragCreate = false;
  }

  /**
   * Define the source data array underlying the placeable objects contained in this layer
   * @type {Array}
   */
  static get dataArray() {
    return "notes";
  }

  /**
   * Define a Container implementation used to render placeable objects contained in this layer
   * @type {PIXI.Container}
   */
  static get placeableClass() {
    return Note;
  }

  /* -------------------------------------------- */
  /*  Methods
  /* -------------------------------------------- */

  /**
   * Override the activation behavior of the PlaceablesLayer.
   * While active, ambient sound previews are displayed.
   */
  activate() {
    super.activate();
    if ( this.objects ) {
      this.placeables.forEach(p => p.controlIcon.visible = true);
    }
  }

  /* -------------------------------------------- */

  /**
   * Only deactivate interactivity of the Notes Layer if the pinned toggle is not active
   */
  deactivate() {
    super.deactivate();
    const ctrl = ui.controls.controls.notes,
          isToggled = ctrl.tools.toggle.active || false;
    if ( this.objects ) {
      this.objects.visible = isToggled;
      this.placeables.forEach(p => p.controlIcon.visible = isToggled);
    }
    this.interactiveChildren = isToggled;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Default mouse-down event handling implementation
   * @private
   */
  _onMouseDown(event) {}

  /* -------------------------------------------- */

  /**
   * Handle JournalEntry entity drop data
   * @param {Event} event
   * @param {JournalEntry} entry
   * @private
   */
  _onDropEntity(event, entry) {

    // Get the world-transformed drop position
    let t = this.worldTransform,
        tx = (event.clientX - t.tx) / canvas.stage.scale.x,
        ty = (event.clientY - t.ty) / canvas.stage.scale.y,
        [x, y] = canvas.grid.getCenter(tx, ty);

    // Create Note data
    const data = {
      x: x,
      y: y,
      icon: DEFAULT_NOTE_ICON,
      entryId: entry.data._id
    };

    // Validate the final position is in-bounds
    if ( !canvas.grid.hitArea.contains(data.x, data.y) ) return false;

    // Create a NoteConfig sheet instance to finalize the creation
    this.activate();
    const note = this.preview.addChild(new Note(data).draw());
    note.sheet.render(true);
  }
}

/**
 * The Sight Layer
 */
class SightLayer extends CanvasLayer {
  constructor() {
    super();

    /**
     * The shadow map container which renders dark, dim, and bright light sources
     * @type {PIXI.Container}
     */
    this.map = null;

    /**
     * The fog container which includes fog of war and exploration layers
     * @type {PIXI.Container}
     */
    this.fog = null;

    /**
     * Fog of War data object
     * @type {Object}
     */
    this.fogData = {};

    /**
     * Classify arrays of tokens which either have vision or emit light
     * @type {Object}
     */
    this.tokens = {
      vision: [],
      light: []
    };

    /**
     * Track currently active field-of-view polygons
     * @type {Array}
     */
    this.fov = {
      tokens: [],
      lights: []
    };

    /**
     * Track currently active line-of-sight polygons
     * @type {Object}
     */
    this.los = {
      tokens: [],
      lights: []
    };

    /**
     * Track whether or not Token vision is enabled for this Scene
     * @type {Boolean}
     */
    this.tokenVision;

    /**
     * Track whether or not fog of war exploration is enabled for this Scene
     * @type {Boolean}
     */
    this.fogExploration;

    /**
     * Track the distinct grid positions which have had fog of war explored at a certain visible radius
     * @type {Object}
     */
    this.fogPositions;

    /**
     * Store the different opacity levels used for elements of the Sight Layer
     * @type {Object}
     */
    this.alphas = {
      unexplored: 1.0,
      dark: 0.75,
      dim: 0.5,
      bright: 0.0
    };

    /**
     * Light source rendering queues divide the contents of the shadow-map into 4 lighting levels, each of which
     * override the precedence of the previous level
     *
     * 1) dim
     * 2) bright
     * 3) dark
     * 4) black
     *
     * @type {Object}
     */
    this.queues;

    /**
     * A special ColorMatrixFilter which transforms greyscale to alpha
     * @type {PIXI.filters.ColorMatrixFilter}
     */
    this.shadowMapFilter;

    // Save fog once per minute if it has been updated
    this._updateFog = false;
    this._fogUpdated = false;
    setInterval(() => this.saveFog(), 1000 * 60);
  }

  /* -------------------------------------------- */

  /**
   * Create the shadow channel queues
   * @private
   */
  _createQueues() {
    const alphas = this.alphas;
    return {
      "dim": {
        hex: PIXI.utils.rgb2hex([1, 1, 1].map(c => alphas.dim)),
        lights: [],
        tokens: []
      },
      "bright": {
        hex: PIXI.utils.rgb2hex([1, 1, 1].map(c => alphas.bright)),
        lights: [],
        tokens: []
      },
      "dark": {
        hex: PIXI.utils.rgb2hex([1, 1, 1].map(c => alphas.dark)),
        lights: [],
        tokens: []
      },
      "black": {
        hex: PIXI.utils.rgb2hex([1, 1, 1].map(c => alphas.unexplored)),
        lights: [],
        tokens: []
      }
    };
  }

  /* -------------------------------------------- */

  /**
   * Create the shadow map filter which converts greyscale colors to alpha layer
   * @private
   */
  _createShadowMapFilter() {
    let f = new PIXI.filters.ColorMatrixFilter();
    let a = 1/3;
    f.matrix = [
      0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
      a, a, a, 0, 0
    ];
    return f;
  }

  /* -------------------------------------------- */
  /*  Initialization and Rendering                */
  /* -------------------------------------------- */

  /**
   * Draw Sight Layer canvas elements
   * @return {SightLayer}
   */
  draw() {
    super.draw();

    // Initialize Layer data
    this.tokenVision = canvas.scene.data.tokenVision;
    this.fogExploration = canvas.scene.data.fogExploration;
    this.fogPositions = {};

    // Alter alpha channels under certain situations
    if ( game.user.isGM ) this.alphas.unexplored = 0.7;
    if ( !this.fogExploration ) this.alphas.dark = this.alphas.unexplored;

    // Create vision queues and filters
    this.queues = this._createQueues();
    this.shadowMapFilter = this._createShadowMapFilter();

    // Draw the ShadowMap container
    this.map = this.addChild(this._drawShadowMapContainer());

    // Draw the fog container
    this.fog = this.addChild(this._drawFogContainer());

    // Enable soft shadow blur filtering
    this.filters = game.settings.get("core", "softShadows") ? [new PIXI.filters.BlurFilter(5)] : null;

    // Return a reference to the layer
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Draw the shadow map container which spans the entire map and renders light into a container in greyscale.
   * The greyscale light is then color-mapped to alpha channel.
   * @private
   */
  _drawShadowMapContainer() {
    let d = canvas.dimensions;
    let map = new PIXI.Container();

    // Darkness
    map.dark = map.addChild(new PIXI.Graphics());
    map.dark.beginFill(this.queues.dark.hex).drawRect(0, 0, d.width, d.height).endFill();

    // Parent container for all light sources - lights or tokens
    map.sources = map.addChild(new PIXI.Container());

    // Ambient light sources
    map.sources.lights = map.sources.addChild(new PIXI.Container());

    // Token light sources
    map.sources.tokens = map.sources.addChild(new PIXI.Container());

    // Line-of-sight masking
    map.los = map.addChild(new PIXI.Graphics());
    map.sources.mask = map.los;

    // ColorMatrix Filter for Alpha channel
    map.filters = [this.shadowMapFilter];
    return map;
  }

  /* -------------------------------------------- */

  _enqueueSource(level, type, data) {
    this.queues[level][type].push(data);
  }

  /* -------------------------------------------- */

  /**
   * For a specific light source and type, draw the source container to the shadow map parent
   * @param {Number} hex        The hex color which should be drawn to the shadow map
   * @param {Number} x          The x-coordinate of the source origin
   * @param {Number} y          The y-coordinate of the source origin
   * @param {Number} radius     The radius of light emitted
   * @param {PIXI.Polygon} fov  The field-of-view polygon for the source
   * @private
   */
  _drawShadowMap(hex, {x, y, radius, fov}={}) {
    let source = new PIXI.Container();
    source.light = source.addChild(new PIXI.Graphics());
    source.light.beginFill(hex).drawCircle(x, y, radius).endFill();
    source.fov = source.addChild(new PIXI.Graphics());
    source.fov.beginFill(0xFFFFFF).drawPolygon(fov).endFill();
    source.mask = source.fov;
    return source;
  }

  /* -------------------------------------------- */

  /**
   * Imagine the fog of war layer as a black blanket over the map with holes cut out where the player has explored.
   * To render the fog layer we draw a container using different greyscale tones and then apply a shadow-map transform
   * to translate into the alpha channel.
   * @private
   *
   * @return {PIXI.Container} The fog container
   */
  _drawFogContainer() {
    const d = canvas.dimensions,
          r = this.constructor.FOG_DOWNSCALE_RATIO,
          fog = new PIXI.Container();

    // Draw the obscured area
    fog.obscured = fog.addChild(new PIXI.Graphics());
    fog.obscured.beginFill(this.queues.black.hex).drawRect(0, 0, d.width, d.height).endFill();

    // Draw the explored area
    fog.explored = fog.addChild(new PIXI.Container());

    // Draw the initial exploration state
    fog.rendered = fog.explored.addChild(new PIXI.Sprite());
    fog.rendered.width = canvas.dimensions.width;
    fog.rendered.height = canvas.dimensions.height;

    // Draw the explored polygon
    fog.update = fog.explored.addChild(new PIXI.Container());

    // Have a staging texture to use to composite fog graphics
    fog.staging = new PIXI.RenderTexture.create(d.width, d.height, 1, r);

    // Shadow-map matrix transformation
    fog.filters = [this.shadowMapFilter];
    return fog;
  }

  /* -------------------------------------------- */
  /*  Layer Initialization                        */
  /* -------------------------------------------- */

  /**
   * Initialize starting sight for non-GM players
   */
  async initialize() {
    await this.initializeFog();
    await this.initializeSight({});
  }

  /* -------------------------------------------- */

  /**
   * Initialize the fog container by resetting tracked fog positions and loading existing fog layer for the scene.
   * @return {Promise}    A Promise which resolves once fog of war is fully loaded
   */
  async initializeFog() {

    // If Token vision is not enforced, we don't need the fog layer
    if ( !this.tokenVision ) {
      this.fog.visible = false;
      return;
    }

    // Set up the fog layer
    this.fogPositions = {};
    this._fogUpdated = false;
    this.fog.visible = !game.user.isGM;

    // Load existing fog data
    return this.loadFog();
  }

  /* -------------------------------------------- */

  /**
   * Initialize sight and visibility
   * @param options {Object}
   */
  initializeSight(options) {

    // If Token vision is not enforced, we can hide the shadow-map completely
    if ( !this.tokenVision ) {
      this.map.visible = false;
      return;
    }

    // Adjust the cull multiplier and distance based on the number of walls
    let nw = canvas.scene.data.walls.length;
    if ( nw <= 50 ) this._cull = [10, 100, 1000];
    else if ( nw <= 150 ) this._cull = [3, 50, 500];
    else this._cull = [2, 10, 50];

    // Allocate tokens as either FOV or light sources
    let [fovTokens, lightTokens] = this._getTokens();
    this.tokens = {
      vision: fovTokens,
      light: lightTokens
    };

    // Draw ambient lights when sight is first initialized, as these do not need to be updated frequently
    this.updateLights();

    // Create the shadow layer and draw sight
    this.updateSight(options);

    // If the player has no vision tokens in a visibility-restricted scene, display a warning on a slight delay
    if ( !game.user.isGM && !fovTokens.length ) {
      setTimeout(() => ui.notifications.warn("You do not own any Token with vision in this Scene"), 250);
    }
  }

  /* -------------------------------------------- */
  /*  Ambient Light Sources                       */
  /* -------------------------------------------- */

  /**
   * Draw light containers for all ambient lights which do not change when a token is moved
   *
   * First, iterate through each light and register light-level data. For each light source, store their light radii
   * in a queue for rendering. Sort the queue in descending order of radius to ensure that we draw bright light after
   * dim light, and negative light values last of all.
   */
  updateLights() {

    // Reset the list of light source FOV polygons we are tracking
    this.fov.lights = [];
    this.los.lights = [];

    // Empty the shadow map rendering queues for each lighting level
    Object.values(this.queues).forEach(q => q.lights = []);

    // If we are not using token vision, no work is required
    if ( !this.tokenVision ) return;

    // Classify each ambient light source for rendering
    canvas.lighting.placeables.forEach(l => {
      let dim = l.dimRadius,
          bright = l.brightRadius;

      // Compute and track the light source FOV polygon
      l.updateFOV();

      // Store bright or dim emission to the relevant queue
      if ( dim ) {
        if (dim > 0) this._enqueueSource("dim", "lights", {x: l.x, y: l.y, radius: dim, fov: l.fov});
        else this._enqueueSource("dark", "lights", {x: l.x, y: l.y, radius: -1 * dim, fov: l.fov});
      }
      if ( bright ) {
        if ( bright > 0 ) this._enqueueSource("bright", "lights", {x: l.x, y: l.y, radius: bright, fov: l.fov});
        else this._enqueueSource("black", "lights", {x: l.x, y: l.y, radius: -1 * bright, fov: l.fov});
      }

      // Store and draw masking FOV or LOS polygons for fog and lighting
      if ( dim >= 0 || bright >= 0 ) {
        this.fov.lights.push(l.fov);
        if ( l.global ) this.los.lights.push(l.fov);
      }
    });
  }

  /* -------------------------------------------- */
  /*  Token Light Sources                         */
  /* -------------------------------------------- */

  /**
   * Get the subset of Tokens which are controllable and have a field of vision
   * First determine whether the token is a potential source of vision
   * Tokens which are controlled are always vision sources
   * For players which control no tokens, if the represented Actor is Observed, it can be a vision source
   * @return {Array<Array>}
   * @private
   */
  _getTokens() {

    // Get the set of tokens which may be observed
    const tokens = canvas.tokens.placeables.filter(t => game.user.isGM || !t.data.hidden),
          anyControlled = tokens.some(t => t._controlled),
          globalLight = canvas.scene.data.globalLight;

    // Allocate all tokens into FOV sources and light sources
    return tokens.reduce((arr, t) => {

      // Assign vision sources first
      let canSee = false;
      if ( t.data.vision ) {
        if ( t._controlled ) canSee = true;
        else if ( !game.user.isGM && !anyControlled ) canSee = t.actor && t.actor.hasPerm(game.user, "OBSERVER");
      }
      if ( canSee ) arr[0].push(t);

      // Assign remaining light sources
      else if ( !globalLight && t.emitsLight ) arr[1].push(t);
      return arr;
    }, [[], []]);
  }

  /* -------------------------------------------- */

  /**
   * Draw the sight polygon for a specified token
   * Support a number of options to configure how sight is updated
   *
   * @param options {Object}
   * @param options.updateFog {Boolean}
   */
  updateSight({updateFog=false} = {}) {

    // Destroy currently rendered light sources
    this.map.sources.removeChildren().forEach(c => c.destroy({children: true, texture: true, baseTexture: true}));
    this.map.los.clear();

    // Empty the shadow map rendering queues for each lighting level
    Object.values(this.queues).forEach(q => q.tokens = []);

    // Reset the array of tracked token FOV and LOS polygons we are tracking
    this.fov.tokens = [];
    this.los.tokens = [];

    // Track whether a fog of war exploration update is required
    this._updateFog = false;

    // Case 1 - no vision required
    if ( !this.tokenVision ) this.map.visible = this.fog.visible = false;

    // Case 2 - no vision sources
    else if ( !this.tokens.vision.length ) this.map.visible = this.fog.visible = !game.user.isGM;

    // Case 3 - regular vision
    else {
      let pNow = null;

      // Begin debug loop
      if ( CONFIG.SightLayer.debug ) {
        if ( !canvas.controls.debugSight ) canvas.controls.debugSight = canvas.controls.addChild(new PIXI.Graphics());
        canvas.controls.debugSight.clear();
        canvas.controls.debugSight.alpha = 0.25;
        this._rayCount = 0;
        pNow = performance.now();
      }

      // Obtain the walls which affect vision
      const visionWalls = canvas.walls.blockVision;

      // Update each token which is a vision source
      this.tokens.vision.forEach(t => this._updateToken(t, {
        hasVision: true,
        updateFog: updateFog,
        visionWalls: visionWalls
      }));

      // Update additional tokens which are light emission sources
      this.tokens.light.forEach(t => this._updateToken(t, {
        hasVision: false,
        updateFog: updateFog,
        visionWalls: visionWalls
      }));

      // Draw LOS polygon for global light sources
      this.los.lights.forEach(los => {
        this.map.los.beginFill(0xFFFFFF).drawPolygon(los).endFill();
      });

      // Once all tokens have been classified, render each lighting level queue to the shadow map
      Object.values(this.queues).forEach(q => {
        q.lights.concat(q.tokens).forEach(s => {
          this.map.sources.addChild(this._drawShadowMap(q.hex, s));
        });
      });

      // If necessary, draw a fog update
      if ( this._updateFog ) this.drawFogExploration();

      // Update visibility of layers and placeables
      this.map.visible = this.fog.visible = true;

      // Log debug status
      if ( CONFIG.SightLayer.debug ) {
        let ns = performance.now() - pNow;
        console.log(`Rendered sight with ${this._rayCount} rays in ${ns}ms`);
      }
    }

    // Update visibility of placeables
    this.restrictVisibility();
  }

  /* -------------------------------------------- */

  /**
   * Handle each token which is a potential vision or light source
   * @param {Token} token                 The token instance
   * @param {Boolean} hasVision           Whether or not the token is a source of vision
   * @param {Boolean} updateFog           Whether or not to forcibly update the fog layer
   * @private
   */
  _updateToken(token, {hasVision, updateFog=false, visionWalls}={}) {

    // Determine default vision arguments
    let density = 6,
        dim = hasVision ? token.dimRadius : token.dimLightRadius,
        bright = hasVision ? token.brightRadius : token.brightLightRadius;

    // Get wall culling
    let [cullMult, cullMin, cullMax] = this._cull;

    // Adapt defaults for global illumination
    if ( canvas.scene.data.globalLight ) {
      dim = Math.max(canvas.dimensions.width, canvas.dimensions.height);
      bright = dim;
      cullMin = dim;
    }

    // Adapt defaults for no vision
    if ( hasVision && dim === 0 && bright === 0 ) dim = canvas.dimensions.size * 0.7;

    // Get the token's sight origin
    let c = token.getSightOrigin(),
        radius = Math.max(Math.abs(dim), Math.abs(bright)),
        [rays, los, fov] = this.checkSight(c, radius, {
          cullMinDistance: cullMin,
          cullMultiplier: cullMult,
          cullMaxDistance: cullMax,
          radialDensity: density,
          walls: visionWalls
        });

    // Store bright or dim emission to the relevant queue
    if ( dim ) {
      if (dim > 0) this._enqueueSource("dim", "tokens", {x: c.x, y: c.y, radius: dim, fov: fov});
      else this._enqueueSource("dark", "tokens", {x: c.x, y: c.y, radius: -1 * dim, fov: fov});
    }
    if ( bright ) {
      if ( bright > 0 ) this._enqueueSource("bright", "tokens", {x: c.x, y: c.y, radius: bright, fov: fov});
      else this._enqueueSource("black", "tokens", {x: c.x, y: c.y, radius: -1 * bright, fov: fov});
    }

    // Store and draw masking FOV or LOS polygons for fog and lighting
    this.fov.tokens.push(fov);
    if ( hasVision ) {
      this.los.tokens.push(los);
      this.map.los.beginFill(0xFFFFFF).drawPolygon(los).endFill();
    }

    // Update fog exploration for the token position
    this.updateFog(c.x, c.y, radius, updateFog);

    // Draw debugging
    if ( CONFIG.SightLayer.debug && hasVision ) {
      this._debugSight(rays, los, fov);
      this._rayCount += rays.length;
    }
  }

  /* -------------------------------------------- */
  /*  Fog Exploration Controls                    */
  /* -------------------------------------------- */

  /**
   * Update the fog layer when a player token reaches a board position which was not previously explored
   * @param {Number} x          The origin x-coordinate from which to update fog exploration
   * @param {Number} y          The origin y-coordinate from which to update fog exploration
   * @param {Number} radius     The vision radius of the exploration from this point
   * @param {Boolean} force     Force the fog location to be updated even if it is not a larger radius
   */
  updateFog(x, y, radius, force) {

    // Standardize fog coordinate key
    let coords = Math.round(x) + "." + Math.round(y),
        pos = this.fogPositions[coords];

    // Check whether the position has already been explored
    let explored = pos && pos.radius >= radius;
    if ( explored && !force ) return;

    // Update the explored positions
    this.fogPositions[coords] = {
      x: x,
      y: y,
      radius: radius
    };
    this._updateFog = true;
  }

  /* -------------------------------------------- */

  drawFogExploration() {
    if ( game.debug ) console.log(`${vtt} | Drawing for of war exploration update.`);
    let exp = new PIXI.Container();

    // Draw FOV polygons
    exp.fov = exp.addChild(new PIXI.Graphics()).beginFill(0x000000);
    for ( let fov of this.fov.tokens.concat(this.fov.lights) ) {
      exp.fov.drawPolygon(fov);
    }
    exp.fov.endFill();

    // Draw LOS mask
    exp.los = exp.addChild(new PIXI.Graphics()).beginFill(0xFFFFFF);
    for ( let los of this.los.tokens.concat(this.los.lights) ) {
      exp.los.drawPolygon(los);
    }
    exp.los.endFill();
    exp.mask = exp.los;

    // Add the exploration container to the explored layer
    this.fog.update.addChild(exp);

    // Render the swapped fog
    this._swapStagingToRendered();
  }

  /* -------------------------------------------- */

  /**
   * Once a new Fog of War location is explored, composite the explored container with the current staging sprite
   * Save that staging Sprite as the rendered fog exploration and swap it out for a fresh staging texture
   * Do all this asynchronously, so it doesn't block token movement animation since this takes some extra time
   * @return {Promise<void>}
   * @private
   */
  async _swapStagingToRendered() {
    const fog = this.fog,
          staging = fog.staging;

    // Render the staging texture and swap
    canvas.app.renderer.render(fog.explored, fog.staging);

    // Swap the staging texture to the rendered Sprite
    const old = fog.rendered.texture;
    fog.rendered.texture = fog.staging;
    old.destroy(true);

    // Clear update container
    fog.update.removeChildren().forEach(c => c.destroy({children: true, texture: true, baseTexture: true}));

    // Create a new Staging texture
    fog.staging = new PIXI.RenderTexture.create(staging.width, staging.height, 1, staging.baseTexture.resolution);

    // Record that fog was updated
    this._fogUpdated = true;
  }

  /* -------------------------------------------- */
  /*  Fog of War Controls                         */
  /* -------------------------------------------- */

  /**
   * Load existing fog of war data from local storage and populate the initial exploration sprite
   * @return {Promise}
   */
  async loadFog() {
    if ( !this.tokenVision ) return;

    // Load fog of war exploration data
    let fogData = await this._loadFogServerStorage();
    if ( !fogData ) fogData = this._loadFogLocalStorage();
    this.fogData = fogData || {};
    if ( !fogData ) return;

    // Extract the fog data image
    let render = tex => {
      this.fog.rendered.texture = tex;
      this.fog.rendered.tint = 0x000000;
    };
    return await new Promise(resolve => {
      let tex = PIXI.Texture.from(fogData.explored);
      if ( tex.baseTexture.hasLoaded ) {
        render(tex);
        return resolve();
      }
      else tex.on("update", tex => {
        render(tex);
        resolve();
      });
    });
  }

  /* -------------------------------------------- */

  /**
   * Load Fog of War exploration data for a user from Server Storage
   * @return {Promise}
   * @private
   */
  async _loadFogServerStorage() {
    const resp = await SocketInterface.trigger("getFogExploration", {user: game.user._id, scene: canvas.scene._id});
    // TODO: Temporary - if we succeeded in loading fog from server storage, delete anything from Local Storage
    if ( resp.data ) window.localStorage.removeItem(`${game.world.id}.fog.${canvas.scene._id}`);
    return resp.data || null;
  }

  /* -------------------------------------------- */

  _loadFogLocalStorage() {
    const fogKey = `${game.world.id}.fog.${canvas.scene._id}`;
    let fogData = window.localStorage.getItem(fogKey);
    if ( !fogData ) return null;
    try {
      fogData = JSON.parse(fogData);
      fogData.explored = fogData.data;
      console.log(`${vtt} | Loaded fog of war from Local Storage data.`);
      return fogData;
    } catch(err) {
      window.localStorage.removeItem(this.fogKey);
      return null;
    }
  }

  /* -------------------------------------------- */

  /**
   * Save fog of war exploration data to a URL string
   * The fog exploration has already been rendered as fog.rendered.texture
   * @private
   */
  async saveFog() {
    if ( !this.tokenVision || !this._fogUpdated ) return;
    this._fogUpdated = false;
    let d = canvas.dimensions;

    // Use the existing rendered fog to create a Sprite and downsize to save with smaller footprint
    const fog = new PIXI.Sprite(this.fog.rendered.texture);
    let scl = d.width > 1920 ? 1920 / d.width : 1.0;
    fog.scale.set(scl, scl);

    // Add the fog to a temporary container to bound it's dimensions and export to base data
    const stage = new PIXI.Container();
    stage.addChild(fog);

    // Construct the fog data to store
    this.fogData = {
      _id: this.fogData._id,
      user: game.user._id,
      scene: canvas.scene._id,
      explored: canvas.app.renderer.extract.base64(stage),
      positions: this.fogPositions,
      timestamp: Date.now()
    };

    // Create or update the fog
    await this._createOrUpdateFogExploration(this.fogData);
    stage.destroy({children: true});
  }

  /* -------------------------------------------- */

  async _createOrUpdateFogExploration(fogData) {
    let eventName = fogData._id ? "updateFogExploration" : "createFogExploration";
    return SocketInterface.trigger(eventName, {data: fogData}).then(resp => {
      let size = Math.round((fogData.explored.length * 100) / (1000 * 1000)) / 100;
      console.log(`${vtt} | Saved user fog of war exploration to server - ${size} MB`);
      if ( !fogData._id ) this.fogData._id = resp.created._id;
      return resp;
    });
  }

  /* -------------------------------------------- */

  /**
   * Reset the fog of war by clearing current exploration progress
   * This approach currently takes the nuclear option of clearing any saved fog and redrawing the entire canvas
   * It's not that inefficient, so it could be worth just keeping it this way for simplicity
   */
  async resetFog() {
    return SocketInterface.trigger("resetFogExploration", {scene: canvas.scene._id}).then(resp => {
      console.log(`${vtt} | Reset fog of war exploration data for all users`);
      Scenes._onFogReset(resp);
    });
  }

  /* -------------------------------------------- */

  debugFog() {
    let tex = PIXI.Texture.from(this.fogData.explored);
    let debug = new PIXI.Sprite(tex);
    this.addChild(debug);
    debug.x = -canvas.dimensions.width;
    debug.y = -canvas.dimensions.height;
  }

  /* -------------------------------------------- */

  /**
   * Restrict the visibility of certain canvas assets (like Tokens or DoorControls) based on the visibility polygon
   * These assets should only be displayed if they are visible given the current player's field of view
   */
  async restrictVisibility() {

    // Tokens
    for ( let t of canvas.tokens.placeables ) {
      t.visible = ( !this.tokenVision && !t.data.hidden ) || t.isVisible;
    }

    // Door Icons
    for ( let d of canvas.controls.doors.children ) {
      d.visible = !this.tokenVision || d.isVisible;
    }
  }

  /* -------------------------------------------- */
  /*  Helper and Utility Functions                */
  /* -------------------------------------------- */

  /**
   * Check sight for a given origin position
   * @param origin {Object}   An object with coordinates x and y representing the origin of the test
   * @param radius {Number}   A distance in canvas position units which reflects the visible range

   * @param options {Object}  Additional options which modify the sight check behavior
   * @param options.cullDistance {Number} The minimum number of grid spaces after which to begin culling walls.
   * @param options.cullMultiplier {Number} The multiplier on the provided radius against which to cull wall endpoint checks. Default is 2
   * @param options.radialDensity {Number}  The density in degrees to which to guarantee that rays are broadcast. Default is 6
   */
  checkSight(origin, radius, {cullMinDistance=10, cullMultiplier=2, cullMaxDistance=20, radialDensity=6, walls}={}) {

    // Get the maximum sight distance and the limiting radius
    let d = canvas.dimensions,
        distance = Math.max(d.width, d.height),
        limit = radius / distance,
        cullDistance = Math.clamped(radius * cullMultiplier, cullMinDistance * d.size, cullMaxDistance * d.size);

    // Create rays targeting each unique wall endpoint within visible range and a small offset on either side
    const rays = canvas.walls.endpoints.reduce((ar, e) => {
      let r = new Ray(origin, {x: e[0], y: e[1]});
      if ( r.distance > cullDistance ) return ar.concat([]);
      return ar.concat([
        Ray.fromAngle(origin.x, origin.y, r.angle - 0.001, distance),
        Ray.fromAngle(origin.x, origin.y, r.angle, distance),
        Ray.fromAngle(origin.x, origin.y, r.angle + 0.001, distance)
      ]);
    }, []);

    // Fill missing angles
    let da = toRadians(radialDensity),
        targets = Array.fromRange(360 / radialDensity).map(a => (-1 * Math.PI) + (a * da)),
        emitted = rays.map(r => Math.round(r.angle / da) * da);
    for ( let t of targets.filter(t => !emitted.includes(t)) ) {
      rays.push(Ray.fromAngle(origin.x, origin.y, t, distance));
    }

    // Sort the emitted rays by angle
    rays.sort((r0, r1) => {return r1.angle - r0.angle});

    // Iterate over rays and record the collision point
    walls = walls || canvas.walls.blockVision;
    for ( let r of rays ) {
      let collisions = this._getWallCollisionsForRay(r, walls);
      let closest = this._getClosestCollisionPoint(r, collisions);
      r.collision = closest;
      r.limit = ( closest.t0 <= limit ) ? closest : { x: r.A.x + (limit * r.dx), y: r.A.y + (limit * r.dy)};
    }

    // Reduce collisions and limits to line-of-sight and field-of-view polygons
    let [losPoints, fovPoints] = rays.reduce((acc, r) => {
      acc[0] = acc[0].concat([r.collision.x, r.collision.y]);
      acc[1] = acc[1].concat([r.limit.x, r.limit.y]);
      return acc;
    }, [[], []]);

    // Construct LOS and visible polygons
    let los = new PIXI.Polygon(...losPoints),
        fov = new PIXI.Polygon(...fovPoints);

    // Return the original rays, line-of-sight, and field-of-view polygons
    return [rays, los, fov];
  }

  /* -------------------------------------------- */

  /**
   * Get an Array of Wall collisions for a vision Ray
   * @param {Ray} ray                 The vision ray to test
   * @param {Array.<Wall>} walls      The walls against which to test
   * @return {Array}                  An array of collision points
   * @private
   */
  _getWallCollisionsForRay(ray, walls) {
    let collisions = [];
    let seen = new Set();
    for (let w of walls) {

      // Skip directional walls where the ray angle is not in the same hemisphere as the wall direction
      let bounds = [ray.angle - (Math.PI/2), ray.angle + (Math.PI/2)];
      if ( w.direction !== null ) {
        if ( !w.isDirectionBetweenAngles(...bounds) ) continue;
      }

      // Test for intersections
      let i = ray.intersectSegment(w.coords);
      if ( i && i.t0 > 0 ) {
        i.x = Math.round(i.x);
        i.y = Math.round(i.y);

        // Ensure uniqueness of the collision point
        let pt = `${i.x}.${i.y}`;
        if ( seen.has(pt) ) continue;
        seen.add(pt);

        // Track the collision point
        i.sense = w.data.sense;
        collisions.push(i);
      }
    }
    return collisions;
  }

  /* -------------------------------------------- */

  /**
   * Get the closest collision point from an Array of collision points
   * @param {Array} collisions    The Array of collision point Objects
   * @returns {Object}            The closest collision point to the origin of the Ray
   * @private
   */
  _getClosestCollisionPoint(ray, collisions) {
    collisions.sort((a, b) => a.t0 - b.t0);
    let closest;
    if ( collisions.length ) {
      closest = ( collisions[0].sense === WALL_SENSE_TYPES.LIMITED ) ? collisions[1] : collisions[0];
    }
    if ( !closest ) closest = {x: ray.B.x, y: ray.B.y, t0: 1, t1: 0};
    return closest;
  }

  /* -------------------------------------------- */

  /**
   * Debug a sight check by plotting the tested rays and their collision points
   * @private
   */
  _debugSight(rays, los, fov) {
    const d = canvas.controls.debugSight;

    // Draw rays in green and collisions in red
    for( let r of rays ) {
      d.lineStyle(1, 0x00FF00, 1.0).moveTo(r.A.x, r.A.y).lineTo(r.B.x, r.B.y).drawCircle(r.B.x, r.B.y, 4);
      d.lineStyle(1, 0xFF0000, 1.0).drawCircle(r.collision.x, r.collision.y, 4);
    }

    // Lastly highlight the visible polygon in green
    d.beginFill(0x00FF00, 0.10).drawPolygon(los);
    d.beginFill(0xFF0000, 0.05).drawPolygon(fov);
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Handle changing of the Soft Shadows canvas setting
   * @private
   */
  _onChangeSoftShadows(enabled) {
    this.draw();
    this.initialize();
  }
}

SightLayer.FOG_DOWNSCALE_RATIO = 0.25;

/**
 * The Ambient Sounds Container
 * @type {PlaceablesLayer}
 */
class SoundsLayer extends PlaceablesLayer {

  /**
   * Define the source data array underlying the placeable objects contained in this layer
   * @type {Array}
   */
  static get dataArray() {
    return "sounds";
  }

  /**
   * Define a Container implementation used to render placeable objects contained in this layer
   * @type {PIXI.Container}
   */
  static get placeableClass() {
    return AmbientSound;
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /**
   * Initialize the field of "view" for all AmbientSound effects in the layer
   */
  initialize() {
    this.placeables.forEach(s => s.updateFOV());
    if ( Howler.state === "suspended" ) game.audio.autoplayPending.push(() => this.update());
    else this.update();
  }

  /* -------------------------------------------- */

  /**
   * Update all AmbientSound effects in the layer by toggling their playback status
   */
  update() {

    // Get the tokens against which to check hearing
    const tokens = game.user.isGM ? canvas.tokens.controlled : canvas.tokens.ownedTokens;

    // Classify distinct sounds as audible or not
    const audible = this.placeables.reduce((obj, sound) => {
      let p = sound.data.path,
          r = sound.radius;

      // Get the tokens which can hear this sound
      let audible = tokens.filter(t => {
        let c = t.center;
        return sound.fov.contains(c.x, c.y);
      });

      // Get or create the record
      if ( !obj.hasOwnProperty(p) ) obj[p] = {
        sound: sound,
        audible: false,
        volume: 0
      };

      // Flag audible status
      if ( !audible.length ) return obj;
      obj[p].audible = true;

      // Determine the loudest audible volume
      if ( sound.data.easing ) {
        let vol = Math.min(...audible.map(t => {
          let c = t.center;
          let distance = Math.hypot(c.x - sound.x, c.y - sound.y);
          return Math.clamped((r - distance) / r, 0.20, 1.0);
        }));
        if ( obj[p].volume === 0 || obj[p].volume < vol ) obj[p].volume = vol;
      } else {
        obj[p].volume = sound.data.volume;
      }

      // Return the updated sound
      return obj;
    }, {});

    // Play each sound
    Object.values(audible).forEach(a => {
      a.sound.play(a.audible, a.volume);
    });
  }

  /* -------------------------------------------- */

  /**
   * Terminate playback of all ambient audio sources
   */
  stopAll() {
    this.placeables.forEach(s => s.play(false));
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Extend the default handling of drag start events by left click + dragging
   * Create a new ambient sound preview
   * @private
   */
  _onDragStart(event) {
    super._onDragStart(event);
    let origin = event.data.origin,
        sound = new AmbientSound({x: origin.x, y: origin.y, type: "l"}).draw();
    event.data.object = this.preview.addChild(sound);
  }

  /* -------------------------------------------- */

  /**
   * Extend the default handling of mouse-move events during a dragging workflow
   * Expand or contract the radius of the preview ambient sound area
   * @private
   */
  _onMouseMove(event) {
    super._onMouseMove(event);
    if ( event.data.createState >= 1 ) {
      let sound = event.data.object;
      let radius = Math.hypot(event.data.destination.x - event.data.origin.x,
                              event.data.destination.y - event.data.origin.y);
      sound.data.radius = radius * (canvas.dimensions.distance / canvas.dimensions.size);
      sound.refresh();
      event.data.createState = 2;
    }
  }

  /* -------------------------------------------- */

  /**
   * Replace the default handling of mouse-up events which conclude a drag-creation workflow
   * Show a preliminary sound configuration sheet which must be completed in order for the sound to be created
   * @private
   */
  _onMouseUp(event) {
    if (event.data.createState === 2) {
      event.stopPropagation();
      let sound = event.data.object,
          distance = Math.hypot(event.data.destination.x - event.data.origin.x,
                                event.data.destination.y - event.data.origin.y);

      // Terminate the drag event
      this._onDragCancel(event);

      // Render the preview sheet
      if (distance >= canvas.dimensions.size / 2) {
        ["x", "y"].forEach(k => sound.data[k] = Math.floor(sound.data[k]));
        sound.data["radius"] = Math.floor(sound.data["radius"] * 100) / 100;
        sound.sheet.render(true);
        this.preview.addChild(sound);
        sound.refresh();
        sound.sheet.preview = this.preview;
      }
    }
  }
}

/**
 * The Templates Container subclass of the PlaceablesLayer
 * @type {PlaceablesLayer}
 */
class TemplateLayer extends PlaceablesLayer {
  constructor() {
    super();
  }

  /**
   * Define the source data array underlying the placeable objects contained in this layer
   * @type {Array}
   */
  static get dataArray() {
    return "templates";
  }

  /**
   * Define a Container implementation used to render placeable objects contained in this layer
   * @type {PIXI.Container}
   */
  static get placeableClass() {
    return MeasuredTemplate;
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /**
   * Override the activation behavior of the PlaceablesLayer.
   * While active, ambient sound previews are displayed.
   */
  activate() {
    super.activate();
    if ( this.objects ) {
      this.placeables.forEach(p => p.controlIcon.visible = true);
    }
  }

  /* -------------------------------------------- */

  /**
   * Override the deactivation behavior of the PlaceablesLayer.
   * Keep templates visible, even when the layer is inactive.
   */
  deactivate() {
    super.deactivate();
    if ( this.objects ) {
      this.objects.visible = true;
      this.placeables.forEach(p => p.controlIcon.visible = false);
    }
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Default mouse-down event handling implementation
   * @private
   */
  _onMouseDown(event) {
    if ( (game.activeTool === "ruler") || event.ctrlKey || event.metaKey ) return;
    super._onMouseDown(event);
  }

  /* -------------------------------------------- */

  /**
   * Create a new placeable template using a click+drag action
   * @private
   */
  _onDragStart(event) {
    super._onDragStart(event);

    // Create the new preview template
    let tool = game.activeTool,
        origin = event.data.origin;

    // Snap the start to an origin point
    let {x, y} = canvas.grid.getSnappedPosition(origin.x, origin.y, 2);
    origin.x = x;
    origin.y = y;

    // Create the template
    let data = {t: tool, x: x, y: y, distance: 0, direction: 0, fillColor: game.user.data.color || "#FF0000"};
    if ( tool === "cone") data["angle"] = 53.13;
    else if ( tool === "ray" ) data["width"] = canvas.dimensions.distance;
    let template = new MeasuredTemplate(data);
    event.data.object = this.preview.addChild(template).draw();
  }

  /* -------------------------------------------- */

  /**
   * Extend the default handling of mouse-move events during a dragging workflow
   * Expand or contract the radius of the preview ambient sound area
   * @private
   */
  _onMouseMove(event) {
    super._onMouseMove(event);
    if ( event.data.createState >= 1 ) {

      // Snap the destination to the grid
      let dest = event.data.destination;
      let {x, y} = canvas.grid.getSnappedPosition(dest.x, dest.y, 2);
      dest.x = x;
      dest.y = y;

      // Compute the ray
      let template = event.data.object,
          ray = new Ray(event.data.origin, event.data.destination),
          ratio = (canvas.dimensions.size / canvas.dimensions.distance);

      // Update the shape data
      template.data.direction = toDegrees(ray.angle);
      template.data.distance = ray.distance / ratio;

      // Draw the pending shape
      template.refresh();
      event.data.createState = 2;
    }
  }

  /**
   * Default mouse-down event handling implementation
   * @private
   */
  _onMouseUp(event) {
    if ( (game.activeTool === "ruler") || event.ctrlKey || event.metaKey ) return;
    super._onMouseUp(event);
  }

}

/* -------------------------------------------- */

/**
 * The TilesLayer subclass of :class:`PlaceablesLayer`
 *
 * This layer implements a container for sprite tiles which are rendered immediately above the :class:`BackgroundLayer`
 * and immediately below the :class:`GridLayer`
 *
 * @type {PlaceablesLayer}
 */
class TilesLayer extends PlaceablesLayer {

  /**
   * Define the source data array underlying the placeable objects contained in this layer
   * @type {Array}
   */
  static get dataArray() {
    return "tiles";
  }

  /**
   * Define a Container implementation used to render placeable objects contained in this layer
   * @type {PIXI.Container}
   */
  static get placeableClass() {
    return Tile;
  }

  /**
   * Tile objects on this layer utilize the TileHUD
   */
  get hud() {
    return canvas.hud.tile;
  }

  /* -------------------------------------------- */
  /*  Rendering
  /* -------------------------------------------- */

  /**
   * Draw the TokenLayer.
   * Draw each contained Token within the scene as a child of the objects container
   * @return {TokenLayer}
   */
  draw() {
    super.draw();
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Override the deactivation behavior of this layer.
   * Placeables on this layer remain visible even when the layer is inactive.
   */
  deactivate() {
    super.deactivate();
    this.releaseAll();
    if ( this.objects ) this.objects.visible = true;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Default handling of drag start events by left click + dragging
   * @private
   */
  _onDragStart(event) {
    super._onDragStart(event);
    if ( !event.data.originalEvent.shiftKey ) {
      event.data.origin = canvas.grid.getSnappedPosition(event.data.origin.x, event.data.origin.y);
    }
    let tile = new Tile(event.data.origin);
    tile.draw();
    tile._controlled = true;
    event.data.object = this.preview.addChild(tile);
  }

  /* -------------------------------------------- */

  /**
   * Handle successful creation of a Tile object through the drag creation workflow.
   * This logic requires that the drag exceeded some minimum distance for the new object to be created.
   * @private
   */
  _onDragCreate(event) {
    let {object, destination, origin, originalEvent } = event.data;

    // Determine destination position
    if ( !originalEvent.shiftKey ) destination = canvas.grid.getSnappedPosition(destination.x, destination.y);

    // Terminate the drag event
    this._onDragCancel(event);

    // Check the dragged distance
    let distance = Math.hypot(destination.x - origin.x, destination.y - origin.y);
    if (distance >= canvas.dimensions.size / 2) {

      // Store final data
      object.data.x = Math.min(destination.x, origin.x);
      object.data.y = Math.min(destination.y, origin.y);
      object.data.width = Math.abs(destination.x - origin.x);
      object.data.height = Math.abs(destination.y - origin.y);

      // Render the preview sheet
      object.sheet.render(true);
      object.sheet.preview = this.preview;

      // Re-render the preview tile
      this.preview.addChild(object);
      object.refresh();
    }
  }


  /* -------------------------------------------- */

  /**
   * Default handling of mouse move events during a dragging workflow
   * @private
   */
  _onMouseMove(event) {
    super._onMouseMove(event);
    if ( event.data.createState >= 1 ) {
      let tile = event.data.object;

      // Determine the drag distance and direction
      let dx = event.data.destination.x - event.data.origin.x,
          dy = event.data.destination.y - event.data.origin.y,
          dist = Math.min(Math.abs(dx), Math.abs(dy));

      // If we have moved at least 1/4 of a grid space
      if ( event.data.createState === 2 || dist >= canvas.dimensions.size / 4 ) {
        let isAlt = event.data.originalEvent.altKey;
        tile.data.width = isAlt ? dx : (dist * Math.sign(dx));
        tile.data.height = isAlt ? dy : (dist * Math.sign(dy));
        event.data.destination = {x: tile.data.x + tile.data.width, y: tile.data.y + tile.data.height};
        tile.refresh();
        event.data.createState = 2;
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle a DELETE keypress while the TilesLayer is active
   * @private
   */
  _onDeleteKey(event) {
    if ( !game.user.isGM ) throw new Error("You may not delete Tiles!");
    this.placeables.filter(t => t._controlled).forEach(t => t.delete(canvas.scene._id));
  }
}

/**
 * The Token Container subclass of the PlaceablesLayer
 * @type {PlaceablesLayer}
 */
class TokenLayer extends PlaceablesLayer {
  constructor() {
    super();

    // Tab token cycling
    this._tabCycle = false;
    this._tabOrder = 0;

    /**
     * Tokens are created through drag-and-drop rather than drag-creation
     * @type {Boolean}
     */
    this._canDragCreate = false;
  }

  /**
   * Define the source data array underlying the placeable objects contained in this layer
   * @type {Array}
   */
  static get dataArray() {
    return "tokens";
  }

  /**
   * Define a Container implementation used to render placeable objects contained in this layer
   * @type {PIXI.Container}
   */
  static get placeableClass() {
    return Token;
  }

  /* -------------------------------------------- */
  /*  Properties
  /* -------------------------------------------- */

  /**
   * Token objects on this layer utilize the TokenHUD
   */
  get hud() {
    return canvas.hud.token;
  }


  /**
   * Tokens should only snap to the grid at whole unit intervals
   * @return {Number}
   */
  get gridPrecision() {
    return 1;
  }

  /**
   * An Array of tokens which are currently controlled
   * @type {Array}
   */
  get controlledTokens() {
    return Object.values(this._controlled || {});
  }

  /**
   * An Array of tokens which belong to actors which are owned
   * @type {Array}
   */
  get ownedTokens() {
    return this.placeables.filter(t => t.actor && t.actor.owner);
  }

  /* -------------------------------------------- */
  /*  Rendering
  /* -------------------------------------------- */

  /**
   * Draw the TokenLayer.
   * Draw each contained Token within the scene as a child of the objects container
   * @return {TokenLayer}
   */
  async draw() {

    // Release any currently controlled tokens
    this.releaseAll();

    // Draw the layer and all contained Tokens
    await super.draw();
    return this;
  }

  /**
   * Override the deactivation behavior of this layer.
   * Placeables on this layer remain visible even when the layer is inactive.
   */
  deactivate() {
    super.deactivate();
    this.releaseAll();
    if ( this.objects ) this.objects.visible = true;
  }

  /* -------------------------------------------- */
  /*  Methods
  /* -------------------------------------------- */

  /**
   * Drop the Token representing an Actor on the canvas at a specific position
   * @param {Actor} actor        The ID of the Actor whose token should be dropped
   * @param {Object} tokenData   An objet of additional Token data with which to override the Actor prototype
   */
  async dropActor(actor, tokenData) {

    // Get the Token image to use
    if ( actor.data.token.randomImg ) {
      const images = await actor.getTokenImages();
      tokenData.img = images[Math.floor(Math.random() * images.length)];
    }

    // Merge token data with the default
    tokenData = mergeObject(actor.data.token, tokenData, {inplace: false});

    // Validate the final position is in-bounds
    if ( !canvas.grid.hitArea.contains(tokenData.x, tokenData.y) ) return false;

    // Send the token creation request to the server and wait for acknowledgement
    await Token.create(canvas.scene._id, tokenData);
    this.activate();
  }

  /* -------------------------------------------- */

  /**
   * Select all the tokens within a provided set of rectangular coordinates.
   * Control any tokens within the area which you are able to control based on token permissions.
   *
   * @param {Number} x      The top-left x-coordinate of the selection rectangle
   * @param {Number} y      The top-left y-coordinate of the selection rectangle
   * @param {Number} width  The width of the selection rectangle
   * @param {Number} height The height of the selection rectangle
   * @return {Number}       The number of PlaceableObject instances which were controlled.
   */
  selectObjects({x, y, width, height}) {
    this.releaseAll(false);
    const controllable = this.placeables.filter(obj => obj.visible);
    controllable.forEach(t => {
      let c = t.center;
      if ( c.x.between(x, x + width) && c.y.between(y, y + height)) {
        t.control({releaseOthers: false, initializeSight: false});
      }
    });
    canvas.sight.initializeSight();
    canvas.controls.select.clear();
    return controllable.length;
  }

  /* -------------------------------------------- */

  /**
   * Cycle the controlled token by rotating through the list of Owned Tokens that are available within the Scene
   * Tokens are currently sorted in order of their TokenID
   *
   * @param {Boolean} direction Which direction to cycle. A "truthy" value cycles forward, while a "falsey" value
   *                            cycles backwards.
   * @param {Boolean} reset     Restart the cycle order back at the beginning?
   * @return {Boolean}          A flag for whether token control was cycled
   */
  cycleTokens(direction, reset) {

    // Maybe reset
    if ( reset ) {
      this._tabCycle = false;
      this._tabOrder = -1;
    }

    // If we are not tab cycling, try and jump to the currently controlled or impersonated token
    if ( !this._tabCycle ) {
      this._tabCycle = true;

      // Get the currently controlled token
      let current = this.controlled.shift();
      if ( !current && game.user.character ) current = game.user.character.getActiveTokens().shift();
      if ( current ) {
        current.control({initializeSight: false});
        canvas.animatePan({x: current.x, y: current.y, duration: 250});
        return true;
      }
    }

    // Get the next observable token
    const observable = this.placeables.filter(t => t.actor && t.actor.hasPerm(game.user, "OBSERVER"));
    if ( !observable.length ) return false;

    // Increment the tab order
    if ( direction ) this._tabOrder = ( this._tabOrder < observable.length - 1 ) ? this._tabOrder + 1 : 0;
    else this._tabOrder = ( this._tabOrder > 0 ) ? this._tabOrder - 1 : observable.length - 1;

    // Control the next token in order
    let next = observable[this._tabOrder];
    next.control();
    canvas.animatePan({x: next.x, y: next.y, duration: 250});
    return true;
  }

  /* -------------------------------------------- */

  /**
   * Immediately conclude the animation of any/all tokens
   */
  concludeAnimation() {
    this.placeables.filter(t => t._movement).forEach(t => {
      let ray = t._movement;
      t._movement = null;
      canvas.app.ticker.remove(t._animate, t);
      t.position.set(ray.B.x, ray.B.y);
    });
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Handle a DELETE keypress while the TokenLayer is active
   * @private
   */
  async _onDeleteKey(event) {
    if ( !game.user.isGM ) throw new Error("You may not delete Tokens!");
    const controlled = canvas.tokens.controlled;
    if ( !controlled.length ) return;

    // Delete a single token
    if ( controlled.length === 1 ) return controlled[0].delete(canvas.scene._id);

    // Delete many tokens
    const deleted = new Set(controlled.map(c => c.id));
    const tokens = canvas.scene.data.tokens.filter(t => !deleted.has(t.id));
    canvas.scene.update({tokens: tokens});
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of Actor data onto the Scene canvas
   * @private
   */
  async _onDropActorData(event, data) {

    // Acquire Actor entity
    let actor;
    if ( data.pack ) actor = await game.actors.importFromCollection(data.pack, data.id);
    else actor = game.actors.get(data.id);

    // Acquire cursor position transformed to Canvas coordinates
    let [x, y] = [event.clientX, event.clientY];
    let t = this.worldTransform,
        tx = (x - t.tx) / canvas.stage.scale.x,
        ty = (y - t.ty) / canvas.stage.scale.y;
    let p = canvas.grid.getTopLeft(tx, ty);

    // Prepare Token data specific to this placement
    const tokenData = {
      x: p[0],
      y: p[1],
      hidden: event.altKey
    };

    // Call the Actor drop method
    this.dropActor(actor, tokenData);
  }
}

/* -------------------------------------------- */

/**
 * The Walls Layer Container which extends PlaceablesLayer to provide a layer of the primary game canvas
 * @type {PlaceablesLayer}
 */
class WallsLayer extends PlaceablesLayer {
  constructor() {
    super();

    /**
     * The Walls Container - just references objects array for backwards compatibility
     * @type {PIXI.Container}
     */
    this.walls = this.objects;

    /**
     * A graphics layer used to display chained Wall selection
     * @type {PIXI.Graphics}
     */
    this.chain = null;

    /**
     * The set of unique vision-blocking wall endpoints
     * Used to shortcut calculation of line-of-sight
     * @type {Array}
     */
    this.endpoints = [];

    /**
     * Track the most recently created or updated wall data for use with the clone tool
     * @type {Object}
     * @private
     */
    this._cloneType = null;
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * Define the source data array underlying the placeable objects contained in this layer
   * @type {Array}
   */
  static get dataArray() {
    return "walls";
  }

  /**
   * Define a Container implementation used to render placeable objects contained in this layer
   * @type {PIXI.Container}
   */
  static get placeableClass() {
    return Wall;
  }

  /**
   * An Array of :class:`Wall` intances on the current Scene which block token vision.
   * Vision-blocking walls include:
   *
   * 1) Regular Walls
   * 2) Closed Doors
   *
   * @type {Array}
   */
  get blockVision() {
    return this.objects.children.filter(w => {
      if ( w.data.sense === WALL_SENSE_TYPES.NONE ) return false;
      if ( w.data.door > WALL_DOOR_TYPES.NONE ) return w.data.ds !== WALL_DOOR_STATES.OPEN;
      return true;
    })
  }

  /**
   * An Array of :class:`Wall` intances on the current Scene which block token movement.
   * Movement-blocking walls include:
   *
   * 1) Regular Walls
   * 2) Invisible Walls
   * 3) Closed Doors
   *
   * @type {Array}
   */
  get blockMovement() {
    return this.objects.children.filter(w => {
      if ( w.data.move === WALL_MOVEMENT_TYPES.NONE ) return false;
      if ( w.data.door > WALL_DOOR_TYPES.NONE ) return w.data.ds !== WALL_DOOR_STATES.OPEN;
      return true;
    })
  }

  /**
   * An Array of Wall instances in the current Scene which act as Doors
   * @type {Array}
   */
  get doors() {
    return this.objects.children.filter(w => w.data.door > WALL_DOOR_TYPES.NONE);
  }

  /**
   * Gate the precision of wall snapping to become less precise for small scale maps
   * @type {Number}
   */
  get gridPrecision() {
    let size = canvas.dimensions.size;
    if ( size >= 128 ) return 16;
    else if ( size >= 64 ) return 8;
    else if ( size >= 32 ) return 4;
    else if ( size >= 16 ) return 2;
  }

  /* -------------------------------------------- */
  /* Rendering
   /* -------------------------------------------- */

  /**
   * Draw the WallsLayer, placing each wall exists in the scene
   * Draw each Wall within the scene as a child of the objects container
   */
  async draw() {
    await super.draw();

    // Draw the chained wall selector
    this.chain = this.addChildAt(new PIXI.Graphics(), 0);

    // Cache the unique visible wall endpoints
    this.endpoints = this._getVisionEndpoints();
    return this;
  }

  /* -------------------------------------------- */

  /**
   * This function returns a set of unique coordinates which represent a wall endpoint.
   * When the walls layer is modified, we can get and cache the unique wall endpoints so that we have this list
   * pre-determined for sight and collision checks.
   *
   * @private
   * @return {Array}    An Array of points [x,y] which each represent a unique visible wall endpoint
   */
  _getVisionEndpoints() {
    const unique = new Set();
    for (let w of this.blockVision) {
      unique.add(JSON.stringify(w.coords.slice(0, 2)));
      unique.add(JSON.stringify(w.coords.slice(2)));
    }
    return Array.from(unique).map(JSON.parse);
  }

  /* -------------------------------------------- */

  /**
   * Override the activation behavior of the PlaceablesLayer.
   * While active, ambient sound previews are displayed.
   */
  activate() {
    super.activate();
    if (canvas.controls) canvas.controls.doors.visible = false;
  }

  /**
   * Override the deactivation behavior of the PlaceablesLayer.
   * When inactive, ambient sound previews are hidden from view.
   */
  deactivate() {
    super.deactivate();
    if ( this.chain ) this.chain.clear();
    if (canvas.controls) canvas.controls.doors.visible = true;
  }

  /* -------------------------------------------- */

  /**
   * Check whether movement along a given Ray collides with a Wall
   * @param {Ray} ray   The attempted movement
   * @return {Boolean}  Does a collision occur?
   */
  checkCollision(ray) {
    const walls = this.blockMovement;
    if ( !walls.length ) return false;

    // Never allow movement out of bounds
    if ( !canvas.grid.hitArea.contains(ray.B.x, ray.B.y) ) return true;

    // Iterate over walls, checking for a collision
    let bounds = [ray.angle - (Math.PI/2), ray.angle + (Math.PI/2)];
    for ( let w of walls ) {

      // Skip directional walls where the ray angle is not in the same hemisphere as the wall direction
      if ( w.direction !== null ) {
        if ( !w.isDirectionBetweenAngles(...bounds) ) continue;
      }

      // Test for collision
      let i = ray.intersectSegment(w.coords);
      if ( i.t0 > 0 && i.t0 < 1 ) return true;
    }
    return false;
  }

  /* -------------------------------------------- */

  /**
   * Highlight the endpoints of Wall segments which are currently group-controlled on the Walls layer
   */
  highlightControlledSegments() {
    const drawn = new Set();
    const c = this.chain.clear();
    for ( let p of Object.values(this._controlled) ) {
      let p1 = p.coords.slice(0, 2);
      if ( !drawn.has(p1.join(".")) ) c.lineStyle(4, 0xFF9829).drawRoundedRect(p1[0] - 8, p1[1] - 8, 16, 16, 3);
      let p2 = p.coords.slice(2);
      if ( !drawn.has(p2.join(".")) ) c.lineStyle(4, 0xFF9829).drawRoundedRect(p2[0] - 8, p2[1] - 8, 16, 16, 3);
      c.lineStyle(8, 0xFF9829).moveTo(...p1).lineTo(...p2);
    }
  }

  /* -------------------------------------------- */

  releaseAll() {
    Object.values(this._controlled).forEach(w => w._controlled = false);
    this._controlled = {};
    this.chain.clear();
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Default mouse-down event handling implementation
   * @private
   */
  _onMouseDown(event) {
    event.stopPropagation();
    let {createState, object, originalEvent} = event.data;
    if ( object && createState === 2 ) {
      this._onDragCreate(event);
      if ( !(originalEvent.ctrlKey || originalEvent.metaKey) ) return;
    }
    super._onMouseDown(event);
  }

  /* -------------------------------------------- */

  /**
   * Default drag-start event handling when the object is moved through left-click drag
   * @private
   */
  _onDragStart(event) {
    super._onDragStart(event);

    // Construct wall data, coercing location to the nearest pixel
    const data = this._getWallDataFromActiveTool(game.activeTool);

    // Get initial coordinates and construct the new Wall
    let dest = this._getWallEndpointCoordinates(event, event.data.origin);
    data.c = event.data.chainStart ? event.data.chainStart.concat(dest) : dest.concat(dest);
    const wall = new Wall(data).draw();

    // Update event data
    event.data.origin = {x: dest[0], y: dest[1]};
    event.data.object = this.preview.addChild(wall);
    delete event.data.chainStart;
  }

  /* -------------------------------------------- */

  /**
   * Get the endpoint coordinates for a wall placement, snapping to grid at a specified precision
   * Bypass snap to grid if SHIFT is held
   * @param {PIXI.interaction.InteractionEvent} event
   * @return {Array}
   * @private
   */
  _getWallEndpointCoordinates(event, point) {
    if ( !event.data.originalEvent.shiftKey ) {
      let snapped = canvas.grid.getSnappedPosition(point.x, point.y, this.gridPrecision);
      return [snapped.x, snapped.y].map(Math.round);
    } else return [point.x, point.y].map(Math.round);
  }

  /* -------------------------------------------- */

  /**
   * The Scene Controls tools provide several different types of prototypical Walls to choose from
   * This method helps to translate each tool into a default wall data configuration for that type
   * @param {String} tool     The active canvas tool
   * @private
   */
  _getWallDataFromActiveTool(tool) {

    // Using the clone tool
    if ( tool === "clone" && this._cloneType ) return this._cloneType;

    // Using a wall type
    const wallData = {};
    wallData.move = ( tool === "ethereal" ) ? WALL_MOVEMENT_TYPES.NONE : WALL_MOVEMENT_TYPES.NORMAL;
    wallData.sense = ( tool === "invisible" ) ? WALL_SENSE_TYPES.NONE : WALL_SENSE_TYPES.NORMAL;
    if ( tool === "terrain" ) wallData.sense = WALL_SENSE_TYPES.LIMITED;
    else if ( tool === "doors" ) wallData.door = WALL_DOOR_TYPES.DOOR;
    else if ( tool === "secret" ) wallData.door = WALL_DOOR_TYPES.SECRET;
    return wallData;
  }

  /* -------------------------------------------- */

  _storeHistory(type, data) {
    super._storeHistory(type, data);
    if ( ["create", "update"].includes(type) ) {
      const clone = duplicate(data);
      delete clone.id;
      delete clone.c;
    }
  }

  /* -------------------------------------------- */

  /**
   * Default handling of mouse move events during a dragging workflow
   * @private
   */
  _onMouseMove(event) {
    super._onMouseMove(event);
    if (event.data.createState >= 1) {
      let wall = event.data.object,
          [x0, y0] = wall.data.c.slice(0, 2),
          [x1, y1] = [event.data.destination.x, event.data.destination.y],
          [gx, gy] = [event.data.originalEvent.x, event.data.originalEvent.y];

      // If the cursor has moved close to the edge of the window
      this._panCanvasEdge(gx, gy);

      // Draw the wall update
      wall.refresh([x0, y0, x1, y1]);
      event.data.createState = 2;
    }
  }

  /* -------------------------------------------- */

  /**
   * Pan the canvas view when the cursor position gets close to the edge of the frame
   * @private
   */
  _panCanvasEdge(x, y) {
    const pad = 50,
          shift = 500 / canvas.stage.scale.x;
    let dx = 0;
    if ( x < pad ) dx = -shift;
    else if ( x > window.innerWidth - pad ) dx = shift;
    let dy = 0;
    if ( y < pad ) dy = -shift;
    else if ( y > window.innerHeight - pad ) dy = shift;
    if (( dx || dy ) && !this._panning ) {
      this._panning = true;
      canvas.animatePan({x: canvas.stage.pivot.x + dx, y: canvas.stage.pivot.y + dy}, {duration: 100}).then(() => {
        this._panning = false;
      })
    }
  }

  /* -------------------------------------------- */

  /**
   * Override the default handling of mouse-up events to customize how wall placement events are concluded
   * @private
   */
  _onMouseUp(event) {
    let {createState, createTime, object} = event.data;
    event.stopPropagation();

    // Handle successful creation and chaining
    if (createState === 2) {

      // Check time to cull double-clicks
      let now = Date.now();
      if ( now - (createTime || 0) < 50 ) return;
      event.data.createTime = now;

      // Create a new Wall
      this._onDragCreate(event);
      if (keyboard.isCtrl(event)) {
        event.data.chainStart = object.data.c.slice(2, 4);
        this._onDragStart(event);
      }
      else event.data.createState = 0;
    }
  }

  /* -------------------------------------------- */

  /**
   * Conclude a wall placement event by releasing the left mouse button.
   * When we conclude dragging, snap the endpoint to the nearest grid vertex.
   *
   * This overrides the parent method to bypass the minimum distance requirement as long as the wall endpoints do
   * not perfectly overlap.
   * @private
   */
  _onDragCreate(event) {
    const wall = event.data.object;
    if ( !wall ) return;
    let [x0, y0] = wall.data.c.slice(0, 2);
    let dest = this._getWallEndpointCoordinates(event, event.data.destination);
    if (!(x0 === dest[0] && y0 === dest[1])) {
      wall.data.c = [x0, y0].concat(dest);
      this.constructor.placeableClass.create(canvas.scene._id, wall.data);
    }
    this._onDragCancel(event);
  }

  /* -------------------------------------------- */

  /**
   * Extend the behavior of cancelling a drag workflow remove additional event data which was added
   * @param event
   * @private
   */
  _onDragCancel(event) {
    super._onDragCancel(event);
    delete event.data.chainStart;
  }

  /* -------------------------------------------- */

  /**
   * Handle a DELETE keypress while a placeable object is hovered
   * @private
   */
  _onDeleteKey(event) {
    if ( Object.keys(this._controlled).length ) {
      event.preventDefault();
      const deleteIds = new Set(Object.keys(this._controlled).map(Number));
      this.releaseAll();
      canvas.scene.update({walls: canvas.scene.data.walls.filter(w => !deleteIds.has(w.id))});
    }
    else if ( this._hover !== null ) {
      event.preventDefault();
      this._hover.delete(canvas.scene._id);
      this._hover = null;
    }
  }
}

/**
 * The Light source object an implementation of the PlaceableObject container
 * @type {PlaceableObject}
 */
class AmbientLight extends PlaceableObject {

  /* -------------------------------------------- */
  /* Properties
  /* -------------------------------------------- */

  /**
   * Provide a reference to the canvas layer which contains placeable objects of this type
   * @type {PlaceablesLayer}
   */
  static get layer() {
    return LightingLayer;
  }

  /* -------------------------------------------- */

  /**
   * Test whether a specific AmbientLight source provides global illumination
   * @type {Boolean}
   */
  get global() {
    return this.data.t === "g";
  }

  /* -------------------------------------------- */

  /**
   * Get the pixel radius of dim light emitted by this light source
   * @return {Number}
   */
  get dimRadius() {
    let d = canvas.dimensions;
    return ((this.data.dim / d.distance) * d.size);
  }

  /* -------------------------------------------- */

  /**
   * Get the pixel radius of bright light emitted by this light source
   * @return {Number}
   */
  get brightRadius() {
    let d = canvas.dimensions;
    return ((this.data.bright / d.distance) * d.size);
  }

  /* -------------------------------------------- */

  /**
   * Get a reference to the LightConfig sheet that is used to configure this light source
   * @return {LightConfig}
   */
  get sheet() {
    if ( !this._sheet ) this._sheet = new LightConfig(this);
    return this._sheet;
  }

  /* -------------------------------------------- */
  /* Rendering
  /* -------------------------------------------- */

  /**
   * Draw the Light source
   */
  draw() {
    this.clear();

    // Draw components
    this.field = this.drawField();
    this.controlIcon = this.addChild(this._drawControlIcon());

    // Draw the light field graphic
    this.refresh();

    // Add control interactivity if the placeable has an ID
    if ( this.id ) {
      new HandleManager(this.controlIcon, this.layer, {
        mouseover: event => this._onMouseOver(event),
        mouseout: event => this._onMouseOut(event),
        mousemove: event => this._onMouseMove(event),
        mouseup: event => this._onMouseUp(event),
        doubleleft: event => this._onDoubleLeft(event),
        cancel: event => this._onDragCancel(event)
      });
    }
    return this;
  }

  /* -------------------------------------------- */

  drawField() {
    let field = new PIXI.Container();
    field.light = field.addChild(new PIXI.Graphics());
    field.msk = field.addChild(new PIXI.Graphics());
    field.msk.position.set(...this.coords.map(c => -1 * c));
    field.mask = field.msk;
    return this.addChild(field);
  }

  /* -------------------------------------------- */

  /**
   * Draw the ControlIcon for the AmbientLight
   * @return {ControlIcon}
   * @private
   */
  _drawControlIcon() {
    let icon = new ControlIcon({texture: 'icons/svg/fire.svg', size: 40 });
    icon.x -= 22;
    icon.y -= 22;
    return icon;
  }

  /* -------------------------------------------- */

  /**
   * Render the light field which previews the light source area of effect
   */
  refresh() {

    // Update position and FOV
    this.position.set(this.data.x, this.data.y);
    this.updateFOV();

    // Draw the light field
    let color = Math.min(this.dimRadius, this.brightRadius) < 0 ? 0xFF6633 : 0xFFCC99;
    this.field.light.clear()
      .beginFill(color, 0.15).lineStyle(1, 0xFFFFFF, 0.5).drawCircle(0, 0, Math.abs(this.dimRadius)).endFill()
      .beginFill(color, 0.30).lineStyle(1, 0xFFFFFF, 0.5).drawCircle(0, 0, Math.abs(this.brightRadius)).endFill();

    // Update the masking polygon
    this.field.msk.clear()
      .beginFill(0xFFFFFF)
      .drawPolygon(this.fov)
      .endFill();
    this.field.msk.position.set(-this.data.x, -this.data.y);
  }

  /* -------------------------------------------- */

  /**
   * Update the field-of-vision for the light source, determining what walls it's area of effect will collide with
   */
  updateFOV() {
    let radius = Math.max(Math.abs(this.dimRadius), Math.abs(this.brightRadius)) * 1.02;
    let [rays, los, fov] = canvas.sight.checkSight(this.center, radius, {cullMultiplier: 1, radialDensity: 6});
    this.fov = fov;
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers               */
  /* -------------------------------------------- */

  /**
   * When a Light source is created we need to re-initialize the sight layer
   * @private
   */
  _onCreate(sceneId, data) {
    super._onCreate(sceneId, data);
     canvas.sight.initialize();
  }

  /**
   * When a Light source is created we need to re-initialize the sight layer
   * @private
   */
  _onUpdate(sceneId, data) {
    super._onUpdate(sceneId, data);
    canvas.sight.initialize();
  }

  /**
   * When a Light source is deleted we need to re-initialize the sight layer
   * @private
   */
  _onDelete(sceneId, objectId) {
    super._onDelete(sceneId, objectId);
    canvas.sight.initialize();
  }
}

/**
 * The Note object is an implementation of the :class:`PlaceableObject` container.
 * Each Note links to a :class:`JournalEntry` entity and represents it's data on the map
 * @type {PlaceableObject}
 */
class Note extends PlaceableObject {
  constructor(...args) {
    super(...args);

    /**
     * The Icon size
     * @type {Number}
     */
    this.size = 40;

    /**
     * The associated JournalEntry which is described by this note
     * @type {JournalEntry}
     */
    this.entry = game.journal.get(this.data.entryId);
  }

  /* -------------------------------------------- */
  /* Attributes
  /* -------------------------------------------- */

  /**
   * Provide a reference to the canvas layer which contains placeable objects of this type
   * @type {PlaceablesLayer}
   */
  static get layer() {
    return NotesLayer;
  }

  /**
   * Provide a singleton reference to the TileConfig sheet for this Tile instance
   * @type {NoteConfig}
   */
  get sheet() {
    return new NoteConfig(this);
  }

  /* -------------------------------------------- */
  /* Rendering
  /* -------------------------------------------- */

  /**
   * Draw the map Note icon
   */
  draw() {
    this.clear();

    // Draw components
    this.controlIcon = this.addChild(this._drawControlIcon());
    this.tooltip = this.addChild(this._drawTooltip());
    this.refresh();

    // Add control interactivity if the placeable has an ID
    if ( this.id ) {
      new HandleManager(this.controlIcon, this.layer, {
        mouseover: event => this._onMouseOver(event),
        mouseout: event => this._onMouseOut(event),
        mousemove: event => this._onMouseMove(event),
        mouseup: event => this._onMouseUp(event),
        doubleleft: event => this._onDoubleLeft(event),
        doubleright: event => this._onDoubleRight(event),
        cancel: event => this._onDragCancel(event)
      }, {
        canhover: true,
        canclick: true,
        candrag: game.user.isGM
      });
    }
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Draw the ControlIcon for the Map Note
   * @return {ControlIcon}
   * @private
   */
  _drawControlIcon() {
    let icon = new ControlIcon({texture: this.data.icon, size: this.size });
    icon.x -= (this.size / 2);
    icon.y -= (this.size / 2);
    return icon;
  }

  /* -------------------------------------------- */

  /**
   * Draw the map note Tooltip as a Text object
   * @return {PIXI.Text}
   */
  _drawTooltip() {

    // Create the nameplate text
    const tooltip = this.entry ? this.entry.name : "Unknown";
    const name = new PIXI.Text(tooltip, CONFIG.tokenTextStyle.clone());

    // Anchor to the middle of the nameplate
    name.anchor.set(0.5, 0.5);

    // Adjust dimensions
    let h = 24,
        half = this.size / 2;
    let bounds = name.getBounds(),
        r = (bounds.width / bounds.height),
        maxWidth = this.size * 5,
        nrows = Math.ceil((h * r) / maxWidth);

    // Wrap for multiple rows
    if ( h * r > maxWidth ) {
      name.style.wordWrap = true;
      name.style.wordWrapWidth = (bounds.height / h) * maxWidth;
      bounds = name.getBounds();
      r = (bounds.width / bounds.height);
    }

    // Downsize the name using the given scaling ratio
    name.height = h * nrows;
    name.width = h * nrows * r;

    // Set position
    name.position.set(0, half + ((nrows+0.5) * 12));
    name.visible = false;
    return name;
  }

  /* -------------------------------------------- */

  /**
   * Refresh the display of the placed Note, updating it's position and visibility settings
   */
  refresh() {
    this.position.set(this.data.x, this.data.y);
    this.visible = this.entry ? this.entry.visible : true;
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Extend the update steps taken to update the volume of the howl object if the volume is changed
   * @private
   */
  _onUpdate(sceneId, data) {
    const changed = new Set(Object.keys(data));
    if ( changed.has("entryId") ) this.entry = game.journal.get(data.entryId);
    super._onUpdate(sceneId, data);
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Default handling for Placeable mouse-over hover event
   * @private
   */
  _onMouseOver(event) {
    super._onMouseOver(event);
    this.tooltip.visible = true;
  }

  /* -------------------------------------------- */

  /**
   * Default handling for Placeable mouse-out hover event
   * @private
   */
  _onMouseOut(event) {
    super._onMouseOut(event);
    this.tooltip.visible = false;
  }

  /* -------------------------------------------- */

  /**
   * Default handling for Placeable double left-click event
   * @private
   */
  _onDoubleLeft(event) {
    if ( !this.entry ) return;
    let mode = this.entry.data.img ? "image" : "text";
    this.entry.sheet.render(true, {sheetMode: mode});
  }

  /* -------------------------------------------- */

  /**
   * Default handling for Placeable double left-click event
   * @private
   */
  _onDoubleRight(event) {
    this.sheet.render(true);
  }
}

/**
 * An AmbientSound
 */
class AmbientSound extends PlaceableObject {
  constructor(...args) {
    super(...args);

    /**
     * The Howl instance used to play this AmbientSound effect
     * @type {Howl}
     */
    this.howl = this._createHowl();

    /**
     * The Howl sound ID of the playing instance of this sound
     * @type {Number}
     */
    this.howlId = undefined;
  }

  /* -------------------------------------------- */

  _createHowl() {
    if ( !this.data.path ) return null;
    return game.audio.create({
      src: this.data.path,
      preload: true,
      loop: true,
      volume: Number(this.data.volume)
    });
  }

  /* -------------------------------------------- */

  /**
   * Provide a reference to the canvas layer which contains placeable objects of this type
   * @type {PlaceablesLayer}
   */
  static get layer() {
    return SoundsLayer;
  }

  /* -------------------------------------------- */
  /* Properties
  /* -------------------------------------------- */

  get type() {
    return this.data.type;
  }

  get radius() {
    let d = canvas.dimensions;
    return ((this.data.radius / d.distance) * d.size);
  }

  get sheet() {
    if ( !this._sheet ) this._sheet = new AmbientSoundConfig(this);
    return this._sheet;
  }

  /* -------------------------------------------- */
  /* Methods
  /* -------------------------------------------- */

  /**
   * Toggle playback of the sound depending on whether or not it is audible
   * @param {Boolean} isAudible   Is the sound audible?
   * @param {Number} volume       The target playback volume
   */
  play(isAudible, volume) {
    let howl = this.howl;
    let cv = howl.volume(null, this.howlId);
    volume = (volume || this.data.volume) * game.settings.get("core", "globalAmbientVolume");

    // Fade the sound out if not currently audible
    if ( !isAudible ) {
      if ( this.howlId ) {
        howl.fade(cv, 0, 500);
        howl.once('fade', () => howl.pause(this.howlId));
      }
      return;
    }
    if ( howl.state() !== "loaded" ) howl.load();

    // Begin playback and set volume
    this.howlId = this.howlId ? howl.play(this.howlId) : howl.play();
    howl.fade(cv, volume, 500, this.howlId);
    return this.howlId;
  }

  /* -------------------------------------------- */
  /* Rendering
  /* -------------------------------------------- */

  /**
   * Clear the display of the existing object
   */
  clear() {
    if ( this.controlIcon ) {
      this.controlIcon.parent.removeChild(this.controlIcon).destroy();
      this.controlIcon = null;
    }
    super.clear();
  }

  /* -------------------------------------------- */

  /**
   * Draw the AmbientSound source
   */
  draw() {
    this.clear();

    // Draw components
    this.field = this.drawField();
    this.controlIcon = this.addChild(this._drawControlIcon());

    // Render the Sound appearance
    this.refresh();

    // Add control interactivity if the placeable has an ID
    if ( this.id ) {
      new HandleManager(this.controlIcon, this.layer, {
        mouseover: event => this._onMouseOver(event),
        mouseout: event => this._onMouseOut(event),
        mousemove: event => this._onMouseMove(event),
        mouseup: event => this._onMouseUp(event),
        doubleleft: event => this._onDoubleLeft(event),
        cancel: event => this._onDragCancel(event)
      });
    }
    return this;
  }

  /* -------------------------------------------- */

  drawField() {
    let field = new PIXI.Container();
    field.light = field.addChild(new PIXI.Graphics());
    field.msk = field.addChild(new PIXI.Graphics());
    field.msk.position.set(...this.coords.map(c => -1 * c));
    field.mask = field.msk;
    return this.addChild(field);
  }

  /* -------------------------------------------- */

  /**
   * Draw the ControlIcon for the AmbientLight
   * @return {ControlIcon}
   * @private
   */
  _drawControlIcon() {
    let icon = new ControlIcon({texture: 'icons/svg/sound.svg', size: 40});
    icon.x -= 20;
    icon.y -= 20;
    return icon;
  }

  /* -------------------------------------------- */

  /**
   * Draw the AmbientSound appearance by populating child Graphics elements.
   */
  refresh() {

    // Update position and FOV
    this.position.set(this.data.x, this.data.y);
    this.updateFOV();

    // Draw the light field
    this.field.light.clear()
      .beginFill(0xAADDFF, 0.15)
      .lineStyle(1, 0xFFFFFF, 0.5)
      .drawCircle(0, 0, this.radius)
      .endFill();

    // Global light is not masked
    if ( this.type === "g" ) {
      this.field.msk.clear();
      this.field.mask = null;
    }

    // Local light is masked by the FOV polygon
    else {
      this.field.msk.clear()
        .beginFill(0xFFFFFF)
        .drawPolygon(this.fov)
        .endFill();
      this.field.msk.position.set(-this.data.x, -this.data.y);
      this.field.mask = this.field.msk;
    }
  }

  /* -------------------------------------------- */

  /**
   * Update the field-of-vision for the sound effect, determining what walls it's area of effect will collide with
   */
  updateFOV() {
    if ( this.type === "g" ) {
      this.fov = new PIXI.Circle(...Object.values(this.center), this.radius);
    }
    else {
      let r = this.radius * 1.02;
      let [rays, los, fov] = canvas.sight.checkSight(this.center, r, {cullMultiplier: 1, radialDensity: 6});
      this.fov = fov;
    }
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers               */
  /* -------------------------------------------- */

  /**
   * Extend the update steps taken to update the volume of the howl object if the volume is changed
   * @private
   */
  _onUpdate(sceneId, data) {
    const changed = Object.keys(data);

    // Replace the Howl object if the sound file was changed
    if ( changed.includes("path") ) {
      this.howl = this._createHowl();
    }

    // Update the position and appearance of the Sound
    this.refresh();

    // Update the volume of the Howl
    if ( this.howl ) this.howl.volume(data.volume, this.howlId);
  }

  /* -------------------------------------------- */

  /**
   * Extend the update steps taken when an AmbientSound is deleted to stop it's howl from playing
   * @private
   */
  _onDelete(sceneId, objectId) {
    super._onDelete(sceneId, objectId);
    if ( this.howl ) this.howl.stop(this.howlId);
  }
}


/**
 * The MeasuredTemplate, a subclass of PlaceableObject
 * @type {PlaceableObject}
 */
class MeasuredTemplate extends PlaceableObject {
  constructor(...args) {
    super(...args);

    // Draw portions of the content
    this.control = null;
    this.template = null;
    this.ruler = null;

    this._borderThickness = 3;

    // Create a highlight layer to use for this template
    if ( this.id ) canvas.grid.addHighlightLayer(`Template.${this.id}`);
  }

  /* -------------------------------------------- */
  /* Properties
  /* -------------------------------------------- */

  /**
   * Provide a reference to the canvas layer which contains placeable objects of this type
   * @type {PlaceablesLayer}
   */
  static get layer() {
    return TemplateLayer;
  }

  /**
   * A placeable object should define the logic to create
   * @type {Application}
   */
  get sheet() {
    if ( !this._sheet ) this._sheet = new MeasureTemplateConfig(this);
    return this._sheet;
  }

  get borderColor() {
    return this.data.borderColor ? this.data.borderColor.replace("#", "0x") : 0x000000;
  }

  get fillColor() {
    return this.data.fillColor ? this.data.fillColor.replace("#", "0x") : 0x000000;
  }

  /* -------------------------------------------- */
  /*  Rendering
  /* -------------------------------------------- */

  /**
   * Draw the placeable object into its parent container
   * This first step simply creates the canvas objects that will later be used to draw the shape
   */
  draw() {

    // Clear existing and set position
    this.clear();

    // Draw tiling texture sprite
    if ( this.data.texture ) this.texture = this.addChild(this._drawTexture());

    // Template shape
    this.template = this.addChild(new PIXI.Graphics());

    // Rotation handle
    this.handle = this.addChild(new PIXI.Graphics());

    // Draw the control icon
    this.controlIcon = this.addChild(this._drawControlIcon());

    // Update the shape and highlight grid squares
    this.refresh();

    // Add control interactivity if the placeable has an ID
    if ( this.id ) {
      new HandleManager(this.controlIcon, this.layer, {
        mouseover: event => this._onMouseOver(event),
        mouseout: event => this._onMouseOut(event),
        mousemove: event => this._onMouseMove(event),
        mouseup: event => this._onMouseUp(event),
        doubleleft: event => this._onDoubleLeft(event),
        cancel: event => this._onDragCancel(event)
      });
    }
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Draw the tiling texture overlay for the template effect
   */
  _drawTexture() {
    let texture = new PIXI.Container();
    let d = this.data.distance * (canvas.dimensions.size / canvas.dimensions.distance),
        tex = PIXI.Texture.from(this.data.texture),
        tile = new PIXI.extras.TilingSprite(tex, d*2, d*2);
    texture.tile = texture.addChild(tile);

    // Position texture
    texture.position.set(-d,-d);

    // Create mask
    texture.tile.mask = texture.addChild(new PIXI.Graphics());
    texture.tile.mask.position.set(d, d);
    return texture;
  }

  /* -------------------------------------------- */

  /**
   * Draw the ControlIcon for the MeasuredTemplate
   * @return {ControlIcon}
   * @private
   */
  _drawControlIcon() {
    let icon = new ControlIcon({texture: 'icons/svg/explosion.svg', size: 40});
    icon.x -= 20;
    icon.y -= 20;
    return icon;
  }

  /* -------------------------------------------- */

  /**
   * Render components of the template shape into their created objects.
   */
  refresh() {
    let d = canvas.dimensions;
    this.position.set(...this.coords);

    // Extract and prepare data
    let {direction, distance, angle, width} = this.data;
    distance *= (d.size / d.distance);
    width *= (d.size / d.distance);
    angle = toRadians(angle);
    direction = toRadians(direction);

    // Create ray and bounding rectangle
    this.ray = Ray.fromAngle(...this.coords, direction, distance);

    // Step 1 - Update the template shape
    if ( this.data.t === "circle" ) this._drawCircleTemplate(distance);
    else if ( this.data.t === "cone" ) this._drawConeTemplate(direction, angle, distance);
    else if ( this.data.t === "rect" ) this._drawRectTemplate(direction, distance);
    else if ( this.data.t === "ray" ) this._drawRayTemplate(direction, distance, width);

    // Step 2 - Draw the origin point and rotation handle
    this.template.lineStyle(this._borderThickness, 0x000000).drawCircle(0, 0, 8);
    this._drawRotationHandle(8);

    // Step 3 - Highlight affected grid squares
    if ( this.id ) this._highlightGrid();

    // Step 4 - Update tiling texture
    if ( this.data.texture ) {
      this.texture.tile.mask.graphicsData = this.template.clone().graphicsData;
    }
  }

  /* -------------------------------------------- */

  _drawCircleTemplate(distance) {
    this.template.clear()
      .lineStyle(this._borderThickness, this.borderColor, 0.75)
      .beginFill(0x000000, 0.0)
      .drawCircle(0, 0, distance);
  }

  /* -------------------------------------------- */

  /**
   * Draw a Cone area of effect given a direction, angle, and distance
   * @private
   */
  _drawConeTemplate(direction, angle, distance) {
    angle = angle || toRadians(90);
    let r1 = Ray.fromAngle(0, 0, direction - (angle / 2), distance),
        r2 = Ray.fromAngle(0, 0, direction + (angle / 2), distance);
    this.template.clear()
      .lineStyle(this._borderThickness, this.borderColor, 0.75)
      .beginFill(0x000000, 0.0)
      .moveTo(0, 0)
      .lineTo(r1.B.x, r1.B.y)
      .arc(0, 0, distance, r1.angle, r2.angle)
      .lineTo(0, 0).closePath();
  }

  /* -------------------------------------------- */

  /**
   * Draw the canvas template for rectangular shapes
   * @private
   */
  _drawRectTemplate(direction, distance) {
    let d = canvas.dimensions,
        r = Ray.fromAngle(0, 0, direction, distance),
        dx = Math.round(r.dx / (d.size / 2)) * (d.size / 2),
        dy = Math.round(r.dy / (d.size / 2)) * (d.size / 2);
    this.template.clear()
      .lineStyle(this._borderThickness, this.borderColor, 0.75)
      .beginFill(0x000000, 0.0)
      .drawRect(Math.min(0, dx), Math.min(0, dy), Math.abs(dx), Math.abs(dy));
  }

  /* -------------------------------------------- */

  /**
   * Draw the canvas template for ray shapes
   * @private
   */
  _drawRayTemplate(direction, distance, width) {
    let up = Ray.fromAngle(0, 0, direction - toRadians(90), width / 2),
        down = Ray.fromAngle(0, 0, direction + toRadians(90), width / 2),
        l1 = Ray.fromAngle(up.B.x, up.B.y, direction, distance),
        l2 = Ray.fromAngle(down.B.x, down.B.y, direction, distance);
    this.template.clear()
      .lineStyle(this._borderThickness, this.borderColor, 0.75)
      .beginFill(0x000000, 0.0)
      .drawPolygon(down.B.x, down.B.y, up.B.x, up.B.y, l1.B.x, l1.B.y, l2.B.x, l2.B.y, down.B.x, down.B.y);

  }

  /* -------------------------------------------- */

  /**
   * Draw the rotation control handle and assign event listeners
   * @private
   */
  _drawRotationHandle(radius) {
    this.handle.clear()
      .lineStyle(this._borderThickness, 0x000000)
      .beginFill(this.borderColor, 1.0)
      .drawCircle(0, 0, radius);
  }

  /* -------------------------------------------- */

  /**
   * Highlight the grid squares which should be shown under the area of effect
   */
  _highlightGrid() {
    const grid = canvas.grid,
          d = canvas.dimensions,
          bc = this.borderColor,
          fc = this.fillColor;

    // Clear existing highlight
    let layerName = `Template.${this.id}`;
    grid.clearHighlightLayer(layerName);
    canvas.grid.highlightLayers[layerName].clear();

    // Get number of rows and columns
    let nr = Math.ceil(((this.data.distance * 1.5) / d.distance) / (d.size / grid.h)),
        nc = Math.ceil(((this.data.distance * 1.5) / d.distance) / (d.size / grid.w));

    // Get the center of the grid position occupied by the template
    let [cx, cy] = grid.getCenter(this.data.x, this.data.y),
      [tx, ty] = canvas.grid.getTopLeft(this.data.x, this.data.y),
      [ox, oy] = [cx - tx, cy - ty],
      [row0, col0] = grid.grid.getGridPositionFromPixels(cx, cy);

    // Identify grid coordinates covered by the template Graphics
    const offsets = [[0, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (let r = -nr; r < nr; r++) {
      for (let c = -nc; c < nc; c++) {

        // Get the grid coordiante
        let [gx, gy] = canvas.grid.grid.getPixelsFromGridPosition(row0 + r, col0 + c);

        // Test the point
        let point = new PIXI.Point(gx - this.data.x + ox, gy - this.data.y + oy);
        let contains = offsets.some(o => this.template.containsPoint(point));
        if (!contains) continue;

        // Render highlighting for the grid position
        grid.highlightPosition(layerName, {x: gx, y: gy, color: fc, border: bc});
      }
    }
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Define additional steps taken when an existing placeable object of this type is deleted
   * @private
   */
  _onDelete(sceneId) {
    super._onDelete(sceneId);
    canvas.grid.destroyHighlightLayer(`Template.${this.id}`);
  }
}


CONFIG.templateTypes = {
  "circle": "Circle",
  "cone": "Cone",
  "rect": "Rectangle",
  "ray": "Ray"
};

/**
 * The Tile object is an implementation of the :class:`PlaceableObject` container.
 * Each Tile is an element of the :class:`TilesLayer` which is rendered above the background of the scene.
 * @type {PlaceableObject}
 */
class Tile extends PlaceableObject {
  /**
   * Provide a reference to the canvas layer which contains placeable objects of this type
   * @type {PlaceablesLayer}
   */
  static get layer() {
    return TilesLayer;
  }

  /**
   * The central coordinate pair of a Tile
   * @return {Object}
   */
  get center() {
    return {
      x: this.data.x + (this.data.width/2),
      y: this.data.y + (this.data.height/2)
    }
  }

  /**
   * Provide a singleton reference to the TileConfig sheet for this Tile instance
   * @type {TileConfig}
   */
  get sheet() {
    if ( !this._sheet ) this._sheet = new TileConfig(this);
    return this._sheet;
  }

  /**
   * Get the aspect ratio of the base texture for the Tile sprite
   * @type {Number}
   */
  get aspectRatio() {
    if ( !this.img ) return null;
    let tex = this.img.texture.baseTexture;
    return ( tex.width / tex.height );
  }

  /* -------------------------------------------- */
  /* Rendering
  /* -------------------------------------------- */

  /**
   * Draw a single tile
   * @return {Promise}
   */
  async draw() {
    this.clear();

    // Create child elements
    if ( this.data.img ) this.img = this.addChild(await this._drawTile());
    this.frame = this.addChild(new PIXI.Graphics());
    this.scaleHandle = this.addChild(new PIXI.Graphics());
    this.bg = this.addChild(new PIXI.Graphics());

    // Render the Tile appearance
    this.refresh();

    // Enable interaction - only if the Tile has an ID
    if ( this.id ) {
      this.interactive = true;

      // Tile control
      new HandleManager(this, this.layer, {
        mouseover: event => this._onMouseOver(event),
        mouseout: event => this._onMouseOut(event),
        mousemove: event => this._onMouseMove(event),
        mousedown: event => this._onMouseDown(event),
        mouseup: event => this._onMouseUp(event),
        doubleleft: event => this._onDoubleLeft(event),
        rightdown: event => this._onRightDown(event),
        cancel: event => this._onDragCancel(event)
      }, {
        candrag: event => !this.data.locked,
        canright: event => this._controlled
      });

      // Scale handler
      new HandleManager(this.scaleHandle, this.layer, {
        mouseover: event => this._onHandleMouseOver(event),
        mouseout: event => this._onHandleMouseOut(event),
        mousedown: event => this._onHandleMouseDown(event),
        mousemove: event => this._onHandleMouseMove(event),
        mouseup: event => this._onHandleMouseUp(event)
      }, {
        canclick: event => !this.data.locked
      });
    }

    // Return the drawn Tile
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Draw the image Sprite for the Tile
   * @return {Promise}
   * @private
   */
  async _drawTile() {
    let tex = await loadTexture(this.data.img || DEFAULT_TOKEN),
        img = new PIXI.Sprite(tex);

    // Set dimensions
    img.width = this.data.width;
    img.height = this.data.height;
    img.rotation = toRadians(this.data.rotation);

    // Ensure playback state for video tokens
    let source = tex.baseTexture.source;
    if ( source && source.tagName === "VIDEO" ) {
      source.loop = true;
      source.muted = true;
      source.play();
    }

    // Return the tile
    return img;
  }

  /* -------------------------------------------- */

  refresh() {

    // Set Tile position
    this.alpha = 1;
    this.position.set(this.data.x + this.pivot.x, this.data.y + this.pivot.y);

    // Draw the sprite image (or a temporary background)
    if ( this.data.img ) {
      this.img.width = Math.abs(this.data.width);
      this.img.height = Math.abs(this.data.height);
      this.img.scale.set(Math.sign(this.data.width) * Math.abs(this.img.scale.x),
                         Math.sign(this.data.height) * Math.abs(this.img.scale.y));
      this.img.anchor.set(0.5, 0.5);
      this.img.position.set(this.data.width / 2, this.data.height / 2);
      this.img.rotation = toRadians(this.data.rotation);
      this.bg.visible = false;
      this.img.alpha = this.data.hidden ? 0.5 : 1.0;
    }
    else this.bg.clear().beginFill(0xFFFFFF, 0.5).drawRect(0, 0, this.data.width, this.data.height);

    // Draw border frame
    this.frame.clear().lineStyle(2.0, 0x000000).drawRect(0, 0, this.data.width, this.data.height);

    // Draw scale handle
    this.scaleHandle.position.set(this.data.width, this.data.height);
    this.scaleHandle.clear().lineStyle(2.0, 0x000000).beginFill(0xFF9829, 1.0).drawCircle(0, 0, 6.0);

    // Toggle visibility
    this.visible = !this.data.hidden || game.user.isGM;
    this.frame.visible = this.scaleHandle.visible = this._controlled;
  }

  /* -------------------------------------------- */

  /**
   * Update the tile dimensions given a requested destination point
   * @param {Object} destination
   * @param {Boolean} snap
   * @param {Boolean} constrain
   * @private
   */
  _updateDimensions(destination, {snap=true, constrain=true}={}) {

    // Determine destination position
    if ( snap ) destination = canvas.grid.getSnappedPosition(destination.x, destination.y);
    if ( (destination.x - this.data.x) === 0) {
      destination.x = this.data.x + (canvas.dimensions.size * (Math.sign(this.data.width) || 1));
    }
    if ( (destination.y - this.data.y) === 0 ) {
      destination.y = this.data.y + (canvas.dimensions.size * (Math.sign(this.data.height) || 1));
    }

    // Identify change
    let dx = destination.x - this.data.x,
        dy = destination.y - this.data.y;

    // Resize, ignoring aspect ratio
    if ( !constrain ) {
      this.data.width = dx;
      this.data.height = dy;
    }

    // Resize, maintaining aspect ratio
    else {
      let ax = Math.abs(dx),
          ay = Math.abs(dy);
      this.data.width = (ax <= ay) ? dx : (ay * this.aspectRatio) * Math.sign(dy);
      this.data.height = (ax <= ay) ? (ax / this.aspectRatio) * Math.sign(dx) : dy;
    }
  }

  /* -------------------------------------------- */
  /*  Methods
  /* -------------------------------------------- */

  rotate(angle) {
    angle = angle % 360;
    this.update(canvas.scene._id, {rotation: angle});
  }

  /* -------------------------------------------- */

  /**
   * Move or rotate many Token objects simultaneously
   *
   * @param {Array} offsets     The keyboard offset directions in which movement is requested
   * @return {Promise}          A resolved promise once all tokens have been moved or rotated
   */
  static async moveMany(offsets, rotate) {
    if ( game.paused && !game.user.isGM ) return;
    const tiles = canvas.tiles.placeables.filter(t => t._controlled && !t.data.locked);
    if ( !tiles.length ) return;

    // Remove the active Tile HUD
    canvas.hud.tile.clear();

    // Rotate tiles
    if ( rotate ) {
      let angle;
      if (offsets.equals([0, 1])) angle = 0;
      else if (offsets.equals([-1, 1])) angle = 45;
      else if (offsets.equals([-1, 0])) angle = 90;
      else if (offsets.equals([-1, -1])) angle = 135;
      else if (offsets.equals([0, -1])) angle = 180;
      else if (offsets.equals([1, -1])) angle = 225;
      else if (offsets.equals([1, 0])) angle = 270;
      else if (offsets.equals([1, 1])) angle = 315;

      for ( let t of tiles ) {
        await t.update(canvas.scene._id, {rotation: angle});
      }
    }

    // Shift tiles
    else {
      let gs = canvas.dimensions.size,
          [dx, dy] = offsets;
      for ( let t of tiles ) {
        let snap = canvas.grid.getSnappedPosition(t.data.x + (gs * dx), t.data.y + (gs * dy));
        await t.update(canvas.scene._id, {x: snap.x, y: snap.y});
      }
    }
  }

  /* -------------------------------------------- */
  /*  Event Handlers                              */
  /* -------------------------------------------- */

  /**
   * Handle hover event on a Tile
   * @private
   */
  _onMouseOver(event) {
    super._onMouseOver(event);
    if ( this.layer._active ) this.frame.visible = true;
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse-out event on a Tile
   * @private
   */
  _onMouseOut(event) {
    super._onMouseOut(event);
    this.frame.visible = this.layer._active && this._controlled;
  }

  /* -------------------------------------------- */

  /**
   * Handle click event on a hovered tile
   * @private
   */
  _onMouseDown(event) {

    // Remove the active Tile HUD
    canvas.hud.tile.clear();

    // Control the Tile
    this.control();
  }

  /* -------------------------------------------- */

  /**
   * Event-handling logic for a right-mouse click event on the Tile container
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onRightDown(event) {
    const hud = canvas.hud.tile,
          state = hud._displayState;
    if ( hud.object === this && state !== hud.constructor.DISPLAY_STATES.NONE ) hud.clear();
    else hud.bind(this);
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse-over event on a control handle
   * @private
   */
  _onHandleMouseOver(event) {
    let {handle} = event.data;
    handle.scale.set(1.5, 1.5);
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse-out event on a control handle
   * @private
   */
  _onHandleMouseOut(event) {
    let {handle} = event.data;
    handle.scale.set(1, 1);
  }

  /* -------------------------------------------- */

  /**
   * When we start a drag event - create a preview copy of the Tile for re-positioning
   * @private
   */
  _onHandleMouseDown(event) {
    event.data.original = duplicate(this.data);
  }

  /* -------------------------------------------- */

  _onHandleMouseMove(event) {
    const {destination, originalEvent} = event.data;
    this._updateDimensions(destination, {snap: false, constrain: !originalEvent.altKey});
    this.refresh();
  }

  /* -------------------------------------------- */

  _onHandleMouseUp(event) {
    let {original, originalEvent, destination} = event.data;
    this._updateDimensions(destination, {snap: !originalEvent.shiftKey, constrain: !originalEvent.altKey});

    // Update the tile
    const data = {width: this.data.width, height: this.data.height, rotation: this.data.rotation};
    this.data = original;
    this.update(canvas.scene._id, data);
  }

  /* -------------------------------------------- */

  /**
   * Handle mousewheel events which rotate the tile
   * @param event
   * @private
   */
  _onWheel(event) {
    if ( this.data.locked ) return;
    let offset = (event.deltaY < 0) ? 15 : -15;
    offset = event.shiftKey ? offset * 3 : offset;
    this.rotate(this.data.rotation + offset);
  }
}
let _token = null;

/**
 * An instance of the Token class represents a character token rendered on the game canvas.
 * Each Token is reference using a numeric ``id`` which indexes its position within the scene.
 * @type {PlaceableObject}
 *
 * @param data {Object}    An object of token data which is used to construct a new Token.
 */
class Token extends PlaceableObject {
  constructor(...args) {
    super(...args);

    /**
     * A Ray which represents the Token's current movement path
     * @type {Ray}
     * @private
     */
    this._movement = null;

    /**
     * An Object which records the Token's prior velocity dx and dy
     * This can be used to determine which direction a Token was previously moving
     * @type {Object}
     * @private
     */
    this._velocity = {dx: 0, dy: 0};

    /**
     * The Token's most recent valid position
     * @type {Object}
     * @private
     */
    this._validPosition = {x: this.data.x, y: this.data.y};

    /**
     * Provide a temporary flag through which this Token can be overridden to bypass any movement animation
     * @type {Boolean}
     */
    this._noAnimate = false;

    /**
     * An Actor entity constructed using this Token's data
     * If actorLink is true, then the entity is the true Actor entity
     * Otherwise, the Actor entity is a synthetic, constructed using the Token actorData
     * @type {Actor}
     */
    this.actor = Actor.fromToken(this);
  }

  /**
   * Provide a reference to the canvas layer which contains placeable objects of this type
   * @type {PlaceablesLayer}
   */
  static get layer() {
    return TokenLayer;
  }

  /* -------------------------------------------- */
  /*  Permission Attributes
  /* -------------------------------------------- */

  /**
   * A Boolean flag for whether the current game User has permission to control this token
   */
  get owner() {
    if ( game.user.isGM ) return true;
    return this.actor ? this.actor.owner : false;
  }

  /* -------------------------------------------- */

  /**
   * Does the current user have at least LIMITED permission to the Token
   * @type {Boolean}
   */
  get canViewSheet() {
    return game.user.isGM || (this.actor && this.actor.hasPerm(game.user, "LIMITED"));
  }

  /* -------------------------------------------- */

  /**
   * Convenience access to the token's nameplate string
   * @type {String}
   */
  get name() {
    return this.data.name;
  }

  /* -------------------------------------------- */

  /**
   * Provide a singleton reference to the TileConfig sheet for this Tile instance
   * @type {TokenConfig}
   */
  get sheet() {
    if (!this._sheet) this._sheet = new TokenConfig(this);
    return this._sheet;
  }

  /* -------------------------------------------- */
  /*  Rendering Attributes
  /* -------------------------------------------- */

  /**
   * Translate the token's grid width into a pixel width based on the canvas size
   * @type {Number}
   */
  get w() {
    return this.data.width * canvas.dimensions.size;
  }

  /* -------------------------------------------- */

  /**
   * Translate the token's grid height into a pixel height based on the canvas size
   * @type {Number}
   */
  get h() {
    return this.data.height * canvas.dimensions.size;
  }

  /* -------------------------------------------- */

  /**
   * The Token's current central position
   * @type {Object}
   */
  get center() {
    return this.getCenter(this.data.x, this.data.y);
  }

  /* -------------------------------------------- */
  /*  State Attributes
  /* -------------------------------------------- */

  /**
   * An indicator for whether or not this token is currently involved in the active combat encounter.
   * @type {Boolean}
   */
  get inCombat() {
    if ( !canvas.scene.active ) return false;
    if ( !game.combat ) return false;
    let combatant = game.combat.getCombatantByToken(this.id);
    return combatant !== undefined;
  }

  /* -------------------------------------------- */

  /**
   * Determine whether the Token is visible to the calling user's perspective.
   * If the user is a GM, all tokens are visible
   * If the user is a player, owned tokens which are not hidden are visible
   * Otherwise only tokens whose corner or center are within the vision polygon are visible.
   *
   * @type {Boolean}
   */
  get isVisible() {

    // If token vision is not required
    if (!canvas.sight.tokenVision) {
      if (this.data.hidden) return game.user.isGM;
      return true;
    }

    // Controlled tokens are always visible
    if (this._controlled) return true;

    // Hidden tokens are not visible for players
    if ( this.data.hidden && !game.user.isGM ) return false;

    // GM users when there are no controlled tokens can see everything
    if (game.user.isGM && !canvas.sight.tokens.vision.length) return true;

    // Get the set of points to test for a token
    const c = this.center;
    let d = canvas.dimensions.size / 4;
    const [x0, y0, x1, y1] = [this.data.x, this.data.y, this.data.x + this.w, this.data.y + this.h];
    const points = [[c.x, c.y], [x0+d, y0+d], [x1-d, y0+d], [x0+d, y1-d], [x1-d, y1-d]];

    // First test that the token falls within a token line-of-sight
    let los = canvas.sight.los;
    let hasLOS = los.tokens.concat(los.lights).some(l => {
      return points.some(p => l.contains(...p));
    });

    // If the token falls in some line of sight, check if it also falls within a field-of-vision
    if (!hasLOS) return false;
    let fov = canvas.sight.fov;
    return fov.tokens.concat(fov.lights).some(f => {
      return points.some(p => f.contains(...p));
    });
  }

  /* -------------------------------------------- */
  /*  Lighting and Vision Attributes
  /* -------------------------------------------- */

  /**
   * Test whether the Token emits light (or darkness) at any radius
   * @type {Boolean}
   */
  get emitsLight() {
    return ["dimLight", "brightLight"].some(a => this.data[a] !== 0);
  }

  /* -------------------------------------------- */

  /**
   * Translate the token's sight distance in units into a radius in pixels.
   * @return {Number}     The sight radius in pixels
   */
  get dimRadius() {
    let r = Math.abs(this.data.dimLight) > Math.abs(this.data.dimSight) ? this.data.dimLight : this.data.dimSight;
    return this._getLightRadius(r);
  }

  /* -------------------------------------------- */

  /**
   * The radius of dim light that the Token emits
   * @return {Number}
   */
  get dimLightRadius() {
    let r = Math.abs(this.data.dimLight) > Math.abs(this.data.brightLight) ? this.data.dimLight : this.data.brightLight;
    return this._getLightRadius(r);
  }

  /* -------------------------------------------- */

  /**
   * Translate the token's bright light distance in units into a radius in pixels.
   * @return {Number}       The bright radius in pixels
   */
  get brightRadius() {
    let r = Math.abs(this.data.brightLight) > Math.abs(this.data.brightSight) ? this.data.brightLight :
      this.data.brightSight;
    return this._getLightRadius(r);
  }

  /* -------------------------------------------- */

  /**
   * The radius of bright light that the Token emits
   * @return {Number}
   */
  get brightLightRadius() {
    return this._getLightRadius(this.data.brightLight);
  }

  /* -------------------------------------------- */
  /* Rendering
  /* -------------------------------------------- */

  /**
   * Draw the token, returning a promise once the token's texture is loaded
   * @return {Promise}
   */
  async draw() {
    this.clear();

    // Draw Token components
    this.icon = this.addChild(await this._drawIcon());
    this.border = this.addChild(new PIXI.Graphics());
    this.bars = this.addChild(this._drawBars());
    this.nameplate = this.addChild(this._drawNameplate());
    this.tooltip = this.addChild(new PIXI.Container());
    this.effects = this.addChild(new PIXI.Container());

    // Define interactivity
    this.hitArea = new PIXI.Rectangle(0, 0, this.w, this.h);
    this.interactive = true;
    this.buttonMode = true;

    // Draw the initial position
    this.drawEffects();
    this.drawTooltip();
    this.drawBars();
    this.refresh();

    // Add interactivity if the Token has an ID
    if ( this.id ) {
      new HandleManager(this, this.layer, {
        mouseover: event => this._onMouseOver(event),
        mouseout: event => this._onMouseOut(event),
        mousedown: event => this._onMouseDown(event),
        mousemove: event => this._onMouseMove(event),
        mouseup: event => this._onMouseUp(event),
        doubleleft: event => this._onDoubleLeft(event),
        rightdown: event => this._onRightDown(event),
        doubleright: event => this._onDoubleRight(event),
        cancel: event => this._onDragCancel(event)
      }, {
        canhover: true,
        canclick: event => this.canViewSheet,
        candrag: event => {
          if ( !this._controlled ) return false;
          let isRuler = ui.controls.isRuler || keyboard.isCtrl(event);
          if ( isRuler ) return false;
          let blockMove = this._movement || ( game.paused && !game.user.isGM );
          return !blockMove;
        }
      });
    }

    // Return a Promise resolving to the rendered token
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Update display of the Token, pulling latest data and re-rendering the display of Token components
   */
  refresh() {

    // Draw Token border
    this.border.clear();
    let borderColor = this._getBorderColor();
    if ( borderColor ) {
      this.border.lineStyle(4, 0x000000, 0.8).drawRoundedRect(-1, -1, this.w+2, this.h+2, 3);
      this.border.lineStyle(2, borderColor || 0xFF9829, 1.0).drawRoundedRect(-1, -1, this.w+2, this.h+2, 3);
    }

    // Icon rotation
    this.icon.rotation = toRadians(this.data.rotation);

    // Toggle nameplate visibility
    this.nameplate.visible = this._canViewMode(this.data.displayName);

    // Resource bar visibility
    this.bars.visible = this._canViewMode(this.data.displayBars);

    // Token position (if not animating)
    if ( !this._movement ) this.position.set(this.data.x, this.data.y);

    // Token hidden state
    this.visible = game.user.isGM ? true : !this.data.hidden;
    this.icon.alpha = this.data.hidden ? 0.5 : 1.0;
  }

  /* -------------------------------------------- */

  /**
   * Draw the Sprite icon for the Token
   * @return {Promise}
   * @private
   */
  async _drawIcon() {

    // Load token texture and apply it to the Sprite
    let tex;
    try {
      tex = await loadTexture(this.data.img || DEFAULT_TOKEN);
    } catch(err) {
      return new PIXI.Sprite();
    }

    // Clone video textures
    let source = tex.baseTexture.source,
        isVideo = source && source.tagName === "VIDEO";
    if ( isVideo ) tex = tex.clone();

    // Create Sprite and define basic dimensions
    let icon = new PIXI.Sprite(tex);
    icon.width = this.w * this.data.scale;
    icon.height = this.h * this.data.scale;
    icon.rotation = toRadians(this.data.rotation);

    // Anchor to center of container
    icon.anchor.set(0.5, 0.5);
    icon.position.set(this.w / 2, this.h / 2);

    // Ensure playback state for video tokens
    if ( isVideo ) {
      source.loop = true;
      source.muted = true;
      source.play();
    }
    return icon;
  }

  /* -------------------------------------------- */

  /**
   * Draw resource bars for the Token
   * @private
   */
  _drawBars() {
    const bars = new PIXI.Container();

    // Primary bar
    bars.bar1 = bars.addChild(new PIXI.Graphics());
    bars.bar1.position.set(0, this.h - Math.max(this.h / 16, 8));

    // Secondary bar
    bars.bar2 = bars.addChild(new PIXI.Graphics());
    bars.bar2.position.set(0, 0);
    return bars;
  }

  /* -------------------------------------------- */

  /**
   * Refresh the display of Token attribute bars, rendering latest resource data
   * @private
   */
  drawBars() {
    if ( !this.actor || (this.data.displayBars === TOKEN_DISPLAY_MODES.NONE) ) return;
    ["bar1", "bar2"].forEach((b, i) => {
      const config = this.data[b],
            bar = this.bars[b];

      // If there is no attribute present, hide the bar
      bar.visible = config.attribute;
      if ( !config.attribute ) return;

      // Pull the current data
      const target = "data."+config.attribute;
      let data = getProperty(this.actor.data, target);
      if ( !this.data.actorLink ) data = mergeObject(data, getProperty(this.data.actorData, target), {inplace: false});

      // Store the bar data
      mergeObject(config, data);

      // Draw the bar
      this._drawBar(i, bar, data);
    });
  }

  /* -------------------------------------------- */

  /**
   * Draw a single resource bar, given provided data
   * @param {Number} number       The Bar number
   * @param {PIXI.Graphics} bar   The Bar container
   * @param {Object} data         Resource data for this bar
   * @private
   */
  _drawBar(number, bar, data) {

    // Process bar data
    let val = Number(data.value),
        max = data.max,
        pct = Math.clamped(val, 0, max) / max,
        h = Math.max(this.h / 16, 8);

    // Draw the bar
    let color = (number === 0) ? [(1-(pct/2)), pct, 0] : [(0.5 * pct), (0.7 * pct), 0.5 + (pct / 2)];
    bar.clear()
       .beginFill(0x000000, 0.5)
       .lineStyle(2, 0x000000, 0.9)
       .drawRoundedRect(0, 0, this.w, h, 3)
       .beginFill(PIXI.utils.rgb2hex(color), 0.8)
       .lineStyle(1, 0x000000, 0.8)
       .drawRoundedRect(1, 1, pct*(this.w-2), h-2, 2);
  }

  /* -------------------------------------------- */

  /**
   * Draw the token's nameplate as a text object
   * @return {PIXI.Text}  The Text object for the Token nameplate
   */
  _drawNameplate() {

    // Gate font size based on grid size
    let h = 24;
    if ( canvas.dimensions.size >= 200 ) h = 36;
    else if ( canvas.dimensions.size < 50 ) h = 18;

    // Create the nameplate text
    const name = new PIXI.Text(this.data.name, CONFIG.tokenTextStyle.clone());

    // Anchor to the middle of the nameplate
    name.anchor.set(0.5, 0.5);

    // Adjust dimensions
    let bounds = name.getBounds(),
        r = (bounds.width / bounds.height),
        maxWidth = this.w * 2.5,
        nrows = Math.ceil((h * r) / maxWidth);

    // Wrap for multiple rows
    if ( h * r > maxWidth ) {
      name.style.wordWrap = true;
      name.style.wordWrapWidth = (bounds.height / h) * maxWidth;
      bounds = name.getBounds();
      r = (bounds.width / bounds.height);
    }

    // Downsize the name using the given scaling ratio
    name.height = h * nrows;
    name.width = h * nrows * r;

    // Set position at bottom of token
    name.position.set(this.w / 2, this.h + (nrows * 12));
    return name;
  }

  /* -------------------------------------------- */

  /**
   * Draw a text tooltip for the token which can be used to display Elevation or a resource value
   */
  drawTooltip() {
    this.tooltip.removeChildren().forEach(c => c.destroy());

    // Get the Tooltip text
    let tip = this._getTooltipText();
    if (!tip.length) return;

    // Create the tooltip text, anchored to the center of the container
    const text = this.tooltip.addChild(new PIXI.Text(tip, CONFIG.tokenTextStyle));
    text.anchor.set(0.5, 0.5);

    // Adjust dimensions based on grid size
    let h = 20;
    if (canvas.dimensions.size >= 200) h = 24;
    else if (canvas.dimensions.size < 50) h = 16;
    let bounds = text.getLocalBounds(),
      r = (bounds.width / bounds.height);
    text.height = h;
    text.width = h * r;

    // Add the tooltip at the top of the parent Token container
    this.tooltip.position.set(this.w / 2, -0.5 * h);
  }

  /* -------------------------------------------- */

  /**
   * Return the text which should be displayed in a token's tooltip field
   * @return {String}
   * @private
   */
  _getTooltipText() {
    let el = this.data.elevation;
    if (!Number.isFinite(el) || el === 0) return "";
    let units = canvas.scene.data.gridUnits;
    return el > 0 ? `+${el} ${units}` : `${el} ${units}`;
  }

  /* -------------------------------------------- */

  /**
   * Draw the active effects and overlay effect icons which are present upon the Token
   */
  drawEffects() {
    this.effects.removeChildren().forEach(c => c.destroy());

    // Draw status effects
    if (this.data.effects.length > 0 ) {

      // Determine the grid sizing for each effect icon
      let w = Math.round(canvas.dimensions.size / 2 / 5) * 2;

      // Draw a background Graphics object
      let bg = this.effects.addChild(new PIXI.Graphics()).beginFill(0x000000, 0.40).lineStyle(1.0, 0x000000);

      // Draw each effect icon
      this.data.effects.forEach((src, i) => {
        let tex = PIXI.Texture.fromImage(src, null, null, 1,0);
        let icon = this.effects.addChild(new PIXI.Sprite(tex));
        icon.width = icon.height = w;
        icon.x = Math.floor(i / 5) * w;
        icon.y = (i % 5) * w;
        bg.drawRoundedRect(icon.x + 1, icon.y + 1, w - 2, w - 2, 2);
        this.effects.addChild(icon);
      });
    }

    // Draw overlay effect
    if ( this.data.overlayEffect ) {
      let tex = PIXI.Texture.fromImage(this.data.overlayEffect, null, null, 1,0);
      let icon = new PIXI.Sprite(tex),
          size = Math.min(this.w * 0.6, this.h * 0.6);
      icon.width = icon.height = size;
      icon.position.set((this.w - size) / 2, (this.h - size) / 2);
      icon.alpha = 0.80;
      this.effects.addChild(icon);
    }
  }

  /* -------------------------------------------- */

  /**
   * Get the hex color that should be used to render the Token border
   * @return {*}
   * @private
   */
  _getBorderColor() {
    if ( this._controlled ) return 0xFF9829;                    // Controlled
    else if ( this._hover ) {
      let d = parseInt(this.data.disposition);
      if (!game.user.isGM && this.owner) return 0xFF9829;       // Owner
      else if (this.actor && this.actor.isPC) return 0x33BC4E;  // Party Member
      else if (d === 1) return 0x43DFDF;                        // Friendly NPC
      else if (d === 0) return 0xF1D836;                        // Neutral NPC
      else return 0xE72124;                                     // Hostile NPC
    }
    else return null;
  }

  /* -------------------------------------------- */

  /**
   * Helper method to determine whether a token attribute is viewable under a certain mode
   * @param {Number} mode   The mode from TOKEN_DISPLAY_MODES
   * @return {Boolean}      Is the attribute viewable?
   * @private
   */
  _canViewMode(mode) {
    if ( mode === TOKEN_DISPLAY_MODES.NONE ) return false;
    else if ( mode === TOKEN_DISPLAY_MODES.ALWAYS ) return true;
    else if ( mode === TOKEN_DISPLAY_MODES.CONTROL ) return this._controlled;
    else if ( mode === TOKEN_DISPLAY_MODES.HOVER ) return this._hover;
    else if ( mode === TOKEN_DISPLAY_MODES.OWNER_HOVER ) return this.owner && this._hover;
    else if ( mode === TOKEN_DISPLAY_MODES.OWNER ) return this.owner;
    return false;
  }

  /* -------------------------------------------- */

  /**
   * Animate Token movement along a certain path which is defined by a Ray object
   * @param {Ray} ray   The path along which to animate Token movement
   */
  async animateMovement(ray) {

    // Move distance is 10 spaces per second
    this._movement = ray;
    let speed = canvas.dimensions.size * 10,
        duration = (ray.distance * 1000) / speed;

    // Define attributes
    const attributes = [
      { parent: this, attribute: 'x', to: ray.B.x },
      { parent: this, attribute: 'y', to: ray.B.y }
    ];

    // Trigger the animation function
    let animationName = `Token.${this.id}.animateMovement`;
    await CanvasAnimation.animateLinear(attributes, { name: animationName, context: this, duration: duration });
    this._movement = null;
  }

  /* -------------------------------------------- */
  /*  Methods
  /* -------------------------------------------- */

  /**
   * Check for collision when attempting a move to a new position
   * @param {Object} destination  An Object containing data for the attempted movement
   * @param {Boolean} drag        Whether we are checking collision for a drag+drop movement
   *
   * @return {Boolean}            A true/false indicator for whether the attempted movement caused a collision
   */
  checkCollision(destination, {drag=false}={}) {

    // GameMaster players can drag anywhere
    if (game.user.isGM && drag) return false;

    // Create a Ray for the attempted move
    let origin = this.getCenter(...Object.values(this._validPosition));
    let ray = new Ray(origin, destination);

    // Get velocities related to the attempted move
    let [dx0, dy0] = [this._velocity.dx, this._velocity.dy];
    let [dx1, dy1] = [ray.dx || dx0, ray.dy || dy0];

    // Shift slightly the start and end points of the Ray
    ray.A.x += Math.sign(dx0) * -0.001;
    ray.A.y += Math.sign(dy0) * -0.001;
    ray.B.x += Math.sign(dx1) * -0.001;
    ray.B.y += Math.sign(dy1) * -0.001;

    // Check for a wall collision
    return canvas.walls.checkCollision(ray);
  }

  /* -------------------------------------------- */

  /**
   * Assume control over a PlaceableObject, flagging it as controlled and enabling downstream behaviors
   * See PlaceableObject.control() for full details
   * @param {Boolean} multiSelect       Is this object being selected as part of a group?
   * @param {Boolean} releaseOthers     Release any other controlled objects first
   * @param {Boolean} initializeSight   Reinitialize the sight layer
   * @return {Boolean}                  A Boolean flag denoting whether or not control was successful.
   */
  control({multiSelect=false, releaseOthers=true, initializeSight=true} = {}) {
    _token = this;
    let initial = this._controlled;
    let controlled = super.control({multiSelect, releaseOthers});
    if ( controlled && !initial ) {
      if (game.user.isGM) canvas.sounds.update();
      if (initializeSight) canvas.sight.initializeSight();
    }
    return controlled;
  }

  /* -------------------------------------------- */

  /**
   * Release control over a PlaceableObject, removing it from the controlled set
   * See PlaceableObject.release() for full details
   * @param resetSight {Boolean}      Trigger a re-initialization of the sight layer, this may not be necessary
   * @return {Boolean}                A Boolean flag confirming the object was released.
   */
  release({resetSight = true} = {}) {
    let initial = this._controlled;
    let released = super.release();
    if ( initial && released ) {
      if (game.user.isGM) canvas.sounds.update();
      if (resetSight) canvas.sight.initializeSight();
    }
    return released;
  }

  /* -------------------------------------------- */

  /**
   * Get the center-point coordinate for a given grid position
   * @param {Number} x    The grid x-coordinate that represents the top-left of the Token
   * @param {Number} y    The grid y-coordinate that represents the top-left of the Token
   * @return {Object}     The coordinate pair which represents the Token's center at position (x, y)
   */
  getCenter(x, y) {
    return {
      x: x + (this.w / 2),
      y: y + (this.h / 2)
    };
  }

  /* -------------------------------------------- */

  /**
   * Set the token's position by comparing its center position vs the nearest grid vertex
   * Return a Promise that resolves to the Token once the animation for the movement has been completed
   *
   * @param {Number} x        The x-coordinate of the token center
   * @param {Number} y        The y-coordinate of the token center
   *
   * @return {Promise}        The Token after animation has completed
   */
  async setPosition(x, y) {

    // Create a Ray for the requested movement
    let origin = this._movement ? this.position : this._validPosition,
        target = {x: x, y: y},
        isVisible = this.isVisible;

    // Create the movement ray
    let ray = new Ray(origin, target);

    // Update the new valid position
    this._validPosition = target;

    // Record the Token's new velocity
    this._velocity = {
      dy: ( y !== origin.y ) ? ray.dy : this._velocity.dy,
      dx: ( x !== origin.x ) ? ray.dx : this._velocity.dx
    };

    // Update visibility for a non-controlled token which may have moved into the controlled tokens FOV
    this.visible = isVisible;

    // Begin animation towards the target position if the destination is visible
    if ( this._noAnimate || !isVisible ) this.position.set(x, y);
    else {
      let animRay = new Ray(this.position, ray.B);
      await this.animateMovement(animRay);
    }

    // If the movement took the token off-screen, re-center the view
    if (this._controlled && isVisible) {
      let pad = 50;
      let gp = this.getGlobalPosition();
      if ((gp.x < pad) || (gp.x > window.innerWidth - pad) || (gp.y < pad) || (gp.y > window.innerHeight - pad)) {
        canvas.animatePan(this.center);
      }
    }

    // Update ambient audio sources
    if (this.owner) canvas.sounds.update();
  }

  /* -------------------------------------------- */

  /**
   * Add or remove the currently controlled Tokens from the active combat encounter
   * @return {Promise}
   */
  async toggleCombat() {

    // If there is not a combat encounter available, perhaps create one
    if ( !game.combat ) {
      if ( game.user.isGM ) await Combat.create({scene: canvas.scene._id, active: true});
      else return this;
    }

    // Ensure we are on the same scene as the active combat
    if ( game.combat.scene._id !== canvas.scene._id ) return this;

    // Determine whether we are adding to, or removing from combat based on the target token
    let inCombat = this.inCombat;

    // Iterate over controlled tokens which have the same initial state
    const tokens = this._controlled ? canvas.tokens.controlled.filter(t => t.inCombat === inCombat) : [this];
    for (let t of tokens) {

      // Remove from combat (GM Only)
      if (inCombat && game.user.isGM) {
        let c = game.combat.getCombatantByToken(t.id);
        await game.combat.deleteCombatant(c.id);
      }

      // Add to combat
      else if (!inCombat) {
        await game.combat.createCombatant({tokenId: t.id, hidden: t.data.hidden});
      }
    }
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Toggle an active effect by it's texture path.
   * Copy the existing Array in order to ensure the update method detects the data as changed.
   *
   * @param texture {String}  The texture file-path of the effect icon to toggle on the Token.
   */
  async toggleEffect(texture) {
    let tfx = [...this.data.effects],
      idx = tfx.findIndex(e => e === texture);
    if (idx === -1) tfx.push(texture);
    else tfx.splice(idx, 1);
    await this.update(canvas.scene._id, {effects: tfx});
    this.drawEffects();
  }

  /* -------------------------------------------- */

  /**
   * Set or remove the overlay texture for the Token by providing a new texture path
   * @param {String} texture  The texture file-path of the effect to set as the Token overlay icon
   * @return {Promise}
   */
  async toggleOverlay(texture) {
    let effect = (this.data.overlayEffect === texture) ? null : texture;
    await this.update(canvas.scene._id, {overlayEffect: effect});
    this.drawEffects();
  }

  /* -------------------------------------------- */

  /**
   * Toggle the visibility state of any Tokens in the currently selected set
   * @return {Promise}
   */
  async toggleVisibility() {
    let isHidden = this.data.hidden;
    const tokens = this._controlled ? canvas.tokens.controlled : [this];
    for (let t of tokens) {
      await t.update(canvas.scene._id, {hidden: !isHidden});
    }
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Return the token's sight origin, tailored for the direction of their movement velocity to break ties with walls
   * @return {Object}
   */
  getSightOrigin() {
    let m = this._movement;
    let p = this.center;
    if (m) {
      p = canvas.grid.getSnappedPosition(m.B.x, m.B.y);
      p = this.getCenter(p.x, p.y);
    }
    return {
      x: p.x + Math.sign(this._velocity.dx || 1) * -0.01,
      y: p.y + Math.sign(this._velocity.dy || 1) * -0.01
    };
  }

  /* -------------------------------------------- */

  /**
   * A generic transformation to turn a certain number of grid units into a radius in canvas pixels
   * @param units {Number}  The radius in grid units
   * @return {number}       The radius in canvas units
   */
  _getLightRadius(units) {
    if (units === 0) return 0;
    return ((units / canvas.dimensions.distance) * canvas.dimensions.size) + (this.w / 2);
  }

  /* -------------------------------------------- */

  /**
   * Perform an incremental token movement, shifting the token's position by some number of grid units.
   * The offset parameters will move the token by that number of grid spaces in one or both directions.
   *
   * @param {Number} dx         The number of grid units to shift along the X-axis
   * @param {Number} dy         The number of grid units to shift along the Y-axis
   * @return {Promise}
   */
  async shiftPosition(dx, dy) {
    let moveData = this._getShiftedPosition(dx, dy);
    if ( this.layer.hud.object === this ) this.layer.hud.clear();
    return this.update(canvas.scene._id, moveData);
  }

  /* -------------------------------------------- */

  /**
   * Obtain the shifted position for the token, if movement is allowed
   * @param {Number} dx         The number of grid units to shift along the X-axis
   * @param {Number} dy         The number of grid units to shift along the Y-axis
   * @return {{x, y}|boolean}   False if the movement is not allowed, otherwise the target coordinates
   * @private
   */
  _getShiftedPosition(dx, dy) {
    let [x, y] = canvas.grid.grid.shiftPosition(this.data.x, this.data.y, dx, dy);
    let targetCenter = this.getCenter(x, y);
    let collide = this.checkCollision(targetCenter, {drag: false});
    return collide ? {x: this.data.x, y: this.data.y} : {x, y};
  }

  /* -------------------------------------------- */

  /**
   * Incrementally shift the token's rotation by some delta degrees
   *
   * @param {Number} delta      An offset of rotation in degrees
   * @param {Boolean} [snap]    Snap rotation to the closest 45 degree increment
   */
  rotate(delta, snap=false) {
    let angle = (this.data.rotation || 0) + (delta || 0);
    if (this._movement) return;
    else {
      let rotation = snap ? Math.round(angle / 45) * 45 : angle;
      this.update(canvas.scene._id, {rotation: rotation});
    }
  }

  /* -------------------------------------------- */
  /*  Multi-Token Operations
  /* -------------------------------------------- */

  /**
   * Move or rotate many Token objects simultaneously
   *
   * @param {Array} offsets     The keyboard offset directions in which movement is requested
   * @param {Boolean} rotate    Rotate tokens to the selected offset position instead of shifting them
   * @return {Promise}          A resolved promise once all tokens have been moved or rotated
   */
  static async moveMany(offsets, rotate) {
    if (game.paused && !game.user.isGM) return;
    const controlled = canvas.tokens.controlled;

    // Translate rotation angle
    let angle;
    if (rotate) {
      if (offsets.equals([0, 1])) angle = 0;
      else if (offsets.equals([-1, 1])) angle = 45;
      else if (offsets.equals([-1, 0])) angle = 90;
      else if (offsets.equals([-1, -1])) angle = 135;
      else if (offsets.equals([0, -1])) angle = 180;
      else if (offsets.equals([1, -1])) angle = 225;
      else if (offsets.equals([1, 0])) angle = 270;
      else if (offsets.equals([1, 1])) angle = 315;
    }

    // Update a single token only
    if ( controlled.length === 0 ) return;
    else if ( controlled.length === 1 ) {
      const token = controlled[0];
      if ( rotate ) token.update(token.scene._id, {rotation: angle});
      else token.shiftPosition(...offsets);
      return;
    }

    // Determine updated token data for controlled tokens and update the Scene with all tokens
    const tokens = duplicate(canvas.scene.data.tokens);
    for (let c of controlled) {
      let token = tokens.find(t => t.id === c.id);
      if (rotate) token.rotation = angle;
      else {
        let {x, y} = c._getShiftedPosition(...offsets);
        token.x = x;
        token.y = y;
      }
    }
    canvas.scene.update({tokens: tokens});
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers               */
  /* -------------------------------------------- */

  /**
   * Delete a Token from a specific Scene.
   * Extend the default Token deletion request to also request deletion for any combatants linked to this token
   * This extension occurs before the request is submitted to the Database.
   * See PlaceableObject.delete() for the parent implementation.
   *
   * @param {String} sceneId      The ID of the Scene within which to update the placeable object
   * @param {Object} options      Additional options which customize the deletion workflow
   *
   * @return {Promise}            A Promise which resolves to the returned socket response (if successful)
   */
  async delete(sceneId, options={}) {
    await game.combats._onDeleteToken(sceneId, this.id);
    return super.delete(sceneId, options);
  }

  /* -------------------------------------------- */

  /**
   * Handle token creation requests, adding the new token to the Scene data
   * For active Scenes, also draw a new Token onto the canvas
   *
   * @param sceneId {String}    The ID of the scene where the token is being created
   * @param tokenData {Object}  The data object from which to create the new token
   */
  async _onCreate(sceneId, tokenData) {
    await this.draw();
    let updateSight = ( this.actor.hasPerm(game.user, "OBSERVER") && this.data.vision ) || this.emitsLight;
    if ( updateSight ) canvas.sight.initialize();
  }

  /* -------------------------------------------- */

  /**
   * Update the Token with new data and push that update back to the server.
   *
   * New token data is either generated by the client or provided from the server through the ``updateToken`` socket.
   * If the updated data is originated locally, it can be pushed back to the server and emitted to other clients.
   *
   * @param sceneId {String}    The ID of the scene where the token is being created
   * @param data {Object}  The data object from which to update new token
   */
  _onUpdate(sceneId, data) {
    const keys = Object.keys(data).filter(k => k !== "id");
    if ( keys.length === 0 ) return;
    const changed = new Set(keys);

    // Classify certain changes
    const tokenMoved = ["x", "y"].some(c => changed.has(c));
    if (tokenMoved) this.setPosition(this.data.x, this.data.y);
    const visibleChange = changed.has("hidden");

    // Control or release the token if visibility was changed
    if ( visibleChange && !game.user.isGM ) {
      if ( this._controlled && data.hidden ) this.release();
      else if ( !data.hidden && !canvas.tokens.controlled.length ) this.control();
    }

    // If certain fundamental attributes have changed re-draw the entire token, otherwise just refresh
    const redraw = ["img", "width", "height", "scale", "name"];
    if ( redraw.some(r => changed.has(r)) ) this.draw();

    // Some token components are re-drawn on demand
    else {
      if ( ["effects", "overlayEffect"].some(k => changed.has(k)) ) this.drawEffects();
      if ( changed.has("elevation") ) this.drawTooltip();
      if ( keys.some(c => c.startsWith("bar")) ) this.drawBars();
      this.refresh();
    }

    // Process Sight changes
    if ( this.data.vision || this.emitsLight ) {
      let visionChange = ["vision", "dimSight", "brightSight", "dimLight", "brightLight"].some(c => changed.has(c));
      if ( visibleChange && this._controlled ) visionChange = true;
      if ( visionChange ) canvas.sight.initializeSight({updateFog: true});
      else if ( tokenMoved || visibleChange ) canvas.sight.updateSight();
    }

    // If Actor data link has changed, replace the Token actor
    if ( changed.has("actorLink") ) this.actor = Actor.fromToken(this);

    // If Actor override data changed, maybe update Token attribute bars
    if ( !this.data.actorLink && changed.has("actorData") ){
      this._onUpdateTokenActor(data.actorData);
      this._onUpdateBarAttributes(Object.keys(flattenObject(data.actorData)));
    }

    // Process Combat Tracker changes
    if ( this.inCombat ) {
      if ( changed.has("name") ) game.combat.setupTurns();
      if ( ["effects", "name"].some(k => changed.has(k)) ) game.combats.render();
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle updates to the Token's referenced Actor (either Entity or synthetic)
   * @param {Object} updateData     Updated data to the Token overrides
   * @private
   */
  _onUpdateTokenActor(updateData) {
    if ( !this.data.actorLink ) {
      mergeObject(this.actor.data, updateData);
      this.actor._onUpdate(updateData);
      this.actor.render(false);
    }
    this._onUpdateBarAttributes(Object.keys(flattenObject(updateData)));

  }

  /* -------------------------------------------- */

  /**
   * Handle updates to this Token which originate from changes to the base Actor entity
   * @param {Object} actorData      The new base Actor entity data
   * @param {Object} updateData     The change to the base Actor which was incremental
   * @private
   */
  _onUpdateBaseActor(actorData, updateData) {
    if ( !this.data.actorLink ) {
      this.actor.data = mergeObject(actorData, this.data.actorData, {inplace: false});
      this.actor._onUpdate(updateData);
      this.actor.render(false);
    }
    this._onUpdateBarAttributes(Object.keys(updateData));
  }

  /* -------------------------------------------- */

  /**
   * Handle the possible re-drawing of Token attribute bars depending on whether the tracked attribute changed
   * @param {Array} changed           An Array of changed data keys in the Token actor
   * @private
   */
  _onUpdateBarAttributes(changed) {
    for ( let b of [this.data.bar1, this.data.bar2] ) {
      if ( b.attribute && Array.from(changed).some(a => a.startsWith("data."+b.attribute))) return this.drawBars();
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle token deletion requests, deleting the token by ID from the Scene data
   * For active Scenes, also remove the Token container from the canvas
   *
   * @param sceneId {String}    The ID of the scene where the token is being created
   */
  _onDelete(sceneId) {
    super._onDelete(sceneId);

    // Cancel movement
    this._movement = null;

    // Reset vision
    let hasActor = this.actor && this.actor.hasPerm(game.user, "OBSERVER");
    let updateSight = ( hasActor && this.data.vision ) || this.emitsLight;
    if ( updateSight ) canvas.sight.initialize();
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Handle mouse-over events which trigger a hover
   * See PlaceableObject._onMouseOver for details
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onMouseOver(event) {
    super._onMouseOver(event);
    if ( this.inCombat ) {
      $(`li.combatant[data-token-id="${this.id}"]`).addClass("hover");
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse-out events after a hover
   * See PlaceableObject._onMouseOut for details
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onMouseOut(event) {
    super._onMouseOut(event);
    if ( this.inCombat ) {
      $(`li.combatant[data-token-id="${this.id}"]`).removeClass("hover");
    }
  }

  /* -------------------------------------------- */

  /**
   * Event handler for the beginning of a left mouse down event
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onMouseDown(event) {

    // If we are holding SHIFT - add or remove a token from the controlled set
    let oe = event.data.originalEvent;
    if ( oe.shiftKey && this._controlled ) return this.release();

    // Remove the token HUD
    this.layer.hud.clear();

    // Attempt to acquire token control
    this.control({releaseOthers: !oe.shiftKey});

    // Dispatch Ruler measurements
    let isRuler = (game.activeTool === "ruler") || ( oe.ctrlKey || oe.metaKey );
    if ( isRuler ) return canvas.controls.ruler._onMouseDown(event);
  }

  /* -------------------------------------------- */

  /**
   * Handle a double left-click event on a Token
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onDoubleLeft(event) {
    if ( !this.actor || !this.canViewSheet ) return;
    const sheet = this.actor.sheet;
    sheet.token = this;
    sheet.render(true);
    sheet.maximize();
  }

  /* -------------------------------------------- */

  /**
   * Event-handling logic for a right-mouse click event on the Token container
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onRightDown(event) {
    const hud = canvas.hud.token,
          state = hud._displayState;
    if ( hud.object === this && state !== TokenHUD.DISPLAY_STATES.NONE ) hud.clear();
    else if ( this.owner ) hud.bind(this);
  }

  /* -------------------------------------------- */

  /**
   * Handle a double right-click event on a Token
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onDoubleRight(event) {
    if ( game.user.isGM ) this.sheet.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Default handling for Placeable mouse-up event concluding a drag workflow
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onMouseUp(event) {
    if ( event.data.handleState === 0 ) return;

    // Get Token movement data
    let {x, y} = event.data.destination,
        isShift = event.data.originalEvent.shiftKey,
        target;

    // Bypass snap to grid -- deduct token width and height from center
    if ( isShift ) {
      target = {x: x - (this.w / 2), y: y - (this.h / 2)};
    }

    // Snap to grid -- anchor relative to center
    else {

      // Snap destination to center position
      [x, y] = canvas.grid.getCenter(x, y);

      // Get top-left coordinate destination
      let ax = this.data.width > 1 ? x - (this.w / 2) : x,
          ay = this.data.height > 1 ? y - (this.h / 2) : y,
          [tx, ty] = canvas.grid.getTopLeft(ax, ay);
      target = {x: tx, y: ty};
    }

    // Check collision center-to-center
    let collide = this.checkCollision({x: x, y: y}, {drag: true});
    if ( collide ) {
      ui.notifications.error("You cannot move through walls!");
      return this._onDragCancel(event);
    }

    // Update token movement
    this.update(canvas.scene._id, target).then(p => this._onDragCancel(event));
  }

  /* -------------------------------------------- */

  /**
   * Token rotation event handler
   * @private
   */
  _onWheel(event) {
    if ( ( game.paused && !game.user.isGM ) || this.data.lockRotation ) return;
    let offset = (event.deltaY < 0) ? 15 : -15;
    offset = event.shiftKey ? offset * 3 : offset;
    this.rotate(offset, event.shiftKey);
  }
}


/* -------------------------------------------- */


/**
 * Configure the default Token text style so that it may be reused and overridden by modules
 */
CONFIG.tokenTextStyle = new PIXI.TextStyle({
  fontFamily: "Signika",
  fontSize: 36,
  fill: "#FFFFFF",
  stroke: '#111111',
  strokeThickness: 1,
  dropShadow: true,
  dropShadowColor: "#000000",
  dropShadowBlur: 4,
  dropShadowAngle: 0,
  dropShadowDistance: 0,
  align: "center",
  wordWrap: false
});


/* -------------------------------------------- */


/**
 * The Wall Object, a subclass of the PlaceableObject class
 */
class Wall extends PlaceableObject {
  constructor(...args) {
    super(...args);

    // Internal flags
    this._doorControl = null;
  }

  /**
   * Provide a reference to the canvas layer which contains placeable objects of this type
   * @type {PlaceablesLayer}
   */
  static get layer() {
    return WallsLayer;
  }

  /* -------------------------------------------- */
  /* Properties
  /* -------------------------------------------- */

  /**
   * The WallConfig sheet which provides customization options for this Wall object
   * @type {WallConfig}
   */
  get sheet() {
    if ( !this._sheet ) this._sheet = new WallConfig(this);
    return this._sheet;
  }

  /* -------------------------------------------- */

  get coords() {
    return this.data.c;
  }

  /**
   * Return the coordinates at the midpoint of the wall segment
   * @return {Array}    An array of coordinates [x,y] representing the midpoint
   */
  get midpoint() {
    return [(this.coords[0] + this.coords[2]) / 2, (this.coords[1] + this.coords[3]) / 2]
  }

  /**
   * The central coordinate pair of the placeable object based on it's own width and height
   * @return {Object}
   */
  get center() {
    let mid = this.midpoint;
    return {
      x: mid[0],
      y: mid[1]
    }
  }

  /* -------------------------------------------- */

  /**
   * Get the direction of effect for a directional Wall
   * @return {Number}   The angle of wall effect
   */
  get direction() {
    let d = this.data.dir;
    if ( !d ) return null;
    let c = this.coords;
    let angle = Math.atan2(c[3] - c[1], c[2] - c[0]);
    if ( d === WALL_DIRECTIONS.LEFT ) return angle + (Math.PI / 2);
    else if ( d === WALL_DIRECTIONS.RIGHT ) return angle - (Math.PI / 2);
  }

  /* -------------------------------------------- */

  /**
   * This helper converts the wall segment to a Ray
   * @return {Ray}    The wall in Ray representation
   */
  toRay() {
    return Ray.fromArrays(this.coords.slice(0, 2), this.coords.slice(2,));
  }

  /* -------------------------------------------- */

  /**
   * Draw the wall segment.
   * Since this is a graphic, we have to clear the existing drawing and redraw each time the wall is repositioned.
   */
  draw() {
    this.clear();

    // Draw wall components
    if ( this.data.dir ) this.directionIcon = this.addChild(this._drawDirection());
    this.line = this.addChild(new PIXI.Graphics());
    this.endpoints = this.addChild(new PIXI.Graphics());

    // Draw current wall
    this.refresh(this.coords, 4);

    // Add wall interactivity if the placeable has an ID
    if ( this.id ) {
      this.endpoints.interactive = true;

      // Handle manager for endpoint control
      new HandleManager(this.endpoints, this.layer, {
        mouseover: event => this._onMouseOver(event),
        mouseout: event => this._onMouseOut(event),
        mousedown: event => this._onMouseDown(event),
        mousemove: event => this._onMouseMove(event),
        mouseup: event => this._onMouseUp(event),
        doubleleft: event => this._onDoubleLeft(event),
        cancel: event => this._onDragCancel(event)
      }, {
        canhover: true,
        canclick: event => {
          if ( event.data.handleState > 0 ) return true;
          if ( event.data.originalEvent.ctrlKey || event.data.originalEvent.metaKey ) return false;
          return game.user.isGM
        },
        candrag: game.user.isGM
      });

      // Line interactivity
      this.line.interactive = true;
      this.line.on("mouseover", this._onMouseOverLine, this);
    }
    return this;
  }

  /* -------------------------------------------- */

  /**
   *
   * @private
   */
  _drawDirection(color) {
    if (this.directionIcon) this.removeChild(this.directionIcon);
    let d = this.data.dir;
    if ( !d ) return;

    // Create the icon
    let icon = new PIXI.Sprite.from("icons/svg/wall-direction.svg"),
        center = this.center;
    icon.width = icon.height = 32;

    // Rotate the icon
    let iconAngle = -Math.PI / 2;
    let angle = this.direction;
    icon.anchor.set(0.5, 0.5);
    icon.rotation = iconAngle + angle;
    return icon;
  }

  /* -------------------------------------------- */

  /**
   * Draw the wall's preview appearance graphic
   * @param {Array} points
   * @param {Number} handleRadius
   */
  refresh(points, handleRadius) {
    let p = points || this.coords,
        mp = [(p[0] + p[2]) / 2, (p[1] + p[3]) / 2],
        hr = handleRadius || (this._hover ? 6 : 4),
        wc = this._getWallColor();

    // Draw background
    this.line.clear()
      .lineStyle(6.0, 0x000000, 1.0)
      .moveTo(p[0], p[1])
      .lineTo(p[2], p[3]);
    this.endpoints.clear()
      .beginFill(0x000000, 1.0)
      .drawCircle(p[0], p[1], hr + 2)
      .drawCircle(p[2], p[3], hr + 2);

    // Draw foreground
    this.line.lineStyle(2.0, wc, 1.0)
      .lineTo(p[0], p[1]);
    this.endpoints.beginFill(wc, 1.0)
      .drawCircle(p[0], p[1], hr)
      .drawCircle(p[2], p[3], hr);

    // Tint direction icon
    if ( this.directionIcon ) {
      this.directionIcon.position.set(...mp);
      this.directionIcon.tint = wc;
    }

    // Update line hit area
    this.line.hitArea = new PIXI.Polygon(p[0]-2,p[1]-2, p[2]-2,p[3]-2, p[2]+2,p[3]+2, p[0]+2, p[1]+2);
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Given the properties of the wall - decide upon a color to render the wall for display on the WallsLayer
   * @return {Number}     A color hex code to use for the wall
   * @private
   */
  _getWallColor() {
    let type = this.data.t,
      state = this.data.s || 0;

    // Invisible Walls
    if ( this.data.sense === WALL_SENSE_TYPES.NONE ) return 0x77E7E8;

    // Terrain Walls
    else if ( this.data.sense === WALL_SENSE_TYPES.LIMITED ) return 0x81B90C;

    // Ethereal Walls
    else if ( this.data.move === WALL_SENSE_TYPES.NONE ) return 0xCA81FF;

    // Doors
    else if ( this.data.door === WALL_DOOR_TYPES.DOOR ) {
      let ds = this.data.ds || WALL_DOOR_STATES.CLOSED;
      if ( ds === WALL_DOOR_STATES.CLOSED ) return 0x6666EE;
      else if ( ds === WALL_DOOR_STATES.OPEN ) return 0x66CC66;
      else if ( ds === WALL_DOOR_STATES.LOCKED ) return 0xEE4444;
    }

    // Secret Doors
    else if ( this.data.door === WALL_DOOR_TYPES.SECRET ) {
      let ds = this.data.ds || WALL_DOOR_STATES.CLOSED;
      if ( ds === WALL_DOOR_STATES.CLOSED ) return 0xA612D4;
      else if ( ds === WALL_DOOR_STATES.OPEN ) return 0x7C1A9b;
      else if ( ds === WALL_DOOR_STATES.LOCKED ) return 0xEE4444;
    }

    // Standard Walls
    else return 0xFFFFBB;
  }

  /* -------------------------------------------- */
  /*  Methods
  /* -------------------------------------------- */

  /**
   * Assume control of a Wall segment, replacing or adding it to the existing control set
   *
   * @param {Object}  options           Optional parameters which customize how control of the Wall is acquired
   * @param {Boolean} options.chain     Add all contiguous segments to the controlled set
   * @returns {Boolean}   A flag denoting whether the control operation was successful
   */
  control({chain=false}={}) {

    // Flag controlled status
    this._controlled = true;
    this.layer._controlled[this.id] = this;

    // Add chained walls
    if ( chain ) {
      const links = this.getLinkedSegments();
      for ( let l of links.walls ) {
        l._controlled = true;
        this.layer._controlled[l.id] = l;
      }
    }

    // Draw control highlights
    this.layer.highlightControlledSegments();
    return true;
  }

  /* -------------------------------------------- */

  /**
   * Release control of a Wall segment, replacing or adding it to the existing control set
   */
  release() {
    let released = super.release();
    this.layer.highlightControlledSegments();
    return released;
  }

  /* -------------------------------------------- */

  /**
   * Extend the standard PIXI.Container.destroy method to also destroy the door control
   * @param options
   */
  destroy(options) {
    if (this.data.door && this._doorControl) this._doorControl.destroy({children: true});
    super.destroy(options);
  }

  /* -------------------------------------------- */

  /**
   * Test whether the Wall direction lies between two provided angles
   * This test is used for collision and vision checks against one-directional walls
   * @param lower
   * @param upper
   * @return {boolean}
   */
  isDirectionBetweenAngles(lower, upper) {
    let d = this.direction;
    if ( d < lower ) {
      while ( d < lower ) d += (2 * Math.PI);
    } else if ( d > upper ) {
      while ( d > upper ) d -= (2 * Math.PI);
    }
    return ( d > lower && d < upper );
  }

  /* -------------------------------------------- */

  /**
   * Get an Array of Wall objects which are linked by a common coordinate
   * @returns {Object}    An object reporting ids and endpoints of the linked segments
   */
  getLinkedSegments() {
    const test = new Set();
    const done = new Set();
    const ids = new Set();
    const objects = [];

    // Helper function to add wall points to the set
    const _addPoints = w => {
      let p0 = w.coords.slice(0,2).join(".");
      if ( !done.has(p0) ) test.add(p0);
      let p1 = w.coords.slice(2,).join(".");
      if ( !done.has(p1) ) test.add(p1);
    };

    // Helper function to identify other walls which share a point
    const _getWalls = p => {
      return canvas.walls.placeables.filter(w => {
        if ( ids.has(w.id) ) return false;
        let p0 = w.coords.slice(0,2).join(".");
        let p1 = w.coords.slice(2,).join(".");
        return ( p === p0 ) || ( p === p1 );
      })
    };

    // Seed the initial search with this wall's points
    _addPoints(this);

    // Begin recursively searching
    while ( test.size > 0 ) {
      const testIds = new Array(...test);
      for ( let p of testIds ) {
        let walls = _getWalls(p);
        walls.forEach(w => {
          _addPoints(w);
          if ( !ids.has(w.id) ) objects.push(w);
          ids.add(w.id);
        });
        test.delete(p);
        done.add(p);
      }
    }

    // Return the wall IDs and their endpoints
    return {
      ids: new Array(...ids),
      walls: objects,
      endpoints: new Array(...done).map(p => p.split(".").map(Number))
    };
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers               */
  /* -------------------------------------------- */

  /**
   * When a Light source is created we need to re-initialize the sight layer
   * @private
   */
  _onCreate(sceneId, data) {
    super._onCreate(sceneId, data);

    // Update WallsLayer data
    this.layer.endpoints = this.layer._getVisionEndpoints();
    this.layer._cloneType = duplicate(this.data);

    // Draw Door icons
    if (this.data.door) canvas.controls.drawDoors();

    canvas.sight.initializeSight({updateFog: true});
    canvas.sounds.initialize();
  }

  /**
   * When a Wall is updated we need to re-initialize the sight layer
   * @private
   */
  _onUpdate(sceneId, data) {
    super._onUpdate(sceneId, data);

    // Update WallsLayer data
    this.layer.endpoints = this.layer._getVisionEndpoints();
    this.layer._cloneType = duplicate(this.data);

    // If the door type was changed, or if the wall has a door - we need to redraw the icons
    if ( data.hasOwnProperty("door") || (this.data.door > 0) ) canvas.controls.drawDoors();

    // If the wall was controlled, redraw highlighting
    if ( this._controlled ) this.layer.highlightControlledSegments();

    // Update sight and sound (including fog)
    canvas.sight.initializeSight({updateFog: true});
    canvas.sounds.initialize();
  }

  /**
   * When a Light source is deleted we need to re-initialize the sight layer
   * @private
   */
  _onDelete(sceneId, objectId) {
    this.release();
    this.layer.endpoints = this.layer._getVisionEndpoints();
    if (this.data.door) canvas.controls.drawDoors();
    canvas.sight.initializeSight({updateFog: true});
    canvas.sounds.initialize();
  }

  /* -------------------------------------------- */
  /*  Canvas Event Listeners                      */
  /* -------------------------------------------- */

  /**
   * Extend the default handling of a double left-click workflow
   * @private
   */
  _onDoubleLeft(event) {
    const sheet = this.sheet;
    const wallIds = Object.keys(this.layer._controlled).map(Number);
    sheet.options.editMany = wallIds.length > 1;
    sheet.options.editTargets = wallIds;
    this.sheet.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Default mouse-over event handling implementation
   * @private
   */
  _onMouseOver(event) {
    this.toFront();
    super._onMouseOver(event);
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse-hover events on the line segment itself, pulling the Wall to the front of the container stack
   * @private
   */
  _onMouseOverLine(event) {
    event.stopPropagation();
    if ( event.data.dragState || event.data.createState ) return;
    this.toFront();
  }

  /* -------------------------------------------- */

  /**
   * Extend the default drag-start event handling to determine the starting wall handle anchored against
   * @private
   */
  _onMouseDown(event) {
    let { origin, createState, originalEvent } = event.data;

    // Add or release walls from the controlled set
    let controlled = this._controlled;
    if ( controlled ) {
      if ( originalEvent.shiftKey ) this.release();
    } else {
      if ( !originalEvent.shiftKey ) this.layer.releaseAll();
      this.control({chain: originalEvent.altKey});
    }

    // We may be concluding a layer creation workflow by ending on an existing wall endpoint
    if ( createState > 0 ) return this.layer._onMouseDown(event);
    
    // Determine the wall coordinates
    let dLeft = Math.hypot(origin.x - this.coords[0], origin.y - this.coords[1]),
        dRight = Math.hypot(origin.x - this.coords[2], origin.y - this.coords[3]);

    // Set event data
    event.data.fixedPoint = ( dRight < dLeft ) ? 0 : 1;
    event.data.fixed = ( dRight < dLeft ) ? this.coords.slice(0, 2) : this.coords.slice(2, 4);
    event.data.wall = this;
  }

  /* -------------------------------------------- */

  /**
   * Default handling for Placeable mouse-move event during a drag workflow
   * @private
   */
  _onMouseMove(event) {
    let {handleState, origin, clone, fixed} = event.data,
      dest = event.data.getLocalPosition(this.layer),
      dx = dest.x - origin.x,
      dy = dest.y - origin.y;

    // Create the clone container
    if (handleState === 0 && ( Math.hypot(dx, dy) >= canvas.dimensions.size / this.layer.gridPrecision )) {
      event.data.handleState = handleState = 1;

      // Create a preview wall
      clone = this.clone().draw();
      this.layer.preview.addChild(clone);
      event.data.clone = clone;
      clone.alpha = 0.75;
      this.alpha = 0;

      // Temporarily remove the wall from the controlled set
      if ( this._controlled ) {
        event.data.wasControlled = true;
        this.release();
      }
    }

    // Update the clone position
    if (handleState > 0) {
      event.data.dest = dest;
      clone.data.c = fixed.concat([dest.x, dest.y]);
      clone.refresh();
    }
  }

  /* -------------------------------------------- */

  /**
   * Default event handling logic for when an active drag event is dropped back onto the canvas
   * @private
   */
  async _onMouseUp(event) {
    let {wall, destination, fixed, fixedPoint, handleState, wasControlled} = event.data;
    if ( handleState === 0 ) return;

    // Update destination
    let dest = this.layer._getWallEndpointCoordinates(event, destination);
    let coords = ( fixedPoint === 0 ) ? fixed.concat(dest) : dest.concat(fixed);

    // If we have collapsed the wall - delete it, otherwise update
    if ( coords[0] === coords[2] && coords[1] === coords[3] ) await wall.delete(canvas.scene._id);
    else {
      await wall.update(canvas.scene._id, {c: coords});
      if ( wasControlled ) this.control();
    }
    this._onDragCancel(event);

    // If we are holding CTRL - chain the drag completion into creating a new wall segment
    let oe = event.data.originalEvent;
    if (oe.ctrlKey || oe.metaKey) {
      event.data.chainStart = coords.slice(2, 4);
      this.layer._onMouseDown(event);
    }
  }
}

/**
 * A game settings configuration application
 * @type {FormApplication}
 *
 */
class SettingsConfig extends FormApplication {
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.title = game.i18n.localize("SETTINGS.Title");
	  options.id = "client-settings";
	  options.template = "templates/sidebar/apps/settings-config.html";
	  options.width = 600;
	  return options;
  }

  /* -------------------------------------------- */

  /**
   * Prepare client settings configuration data
   */
  getData() {
    const modules = [];
    for ( let [k, v] of Object.entries(this.object) ) {
      if ( !v.config ) continue;

      // Get or create the module record
      let m = modules.find(m => m.module === v.module);
      if ( !m ) {
        m = {module: v.module, settings: []};
        if ( v.module === "core" ) m.name = "Foundry Virtual Tabletop";
        else if ( v.module === game.system.name ) m.name = game.system.title;
        else {
          let mod = game.modules.find(m => m.name === v.module);
          m.name = mod.title;
        }
        modules.push(m);
      }

      // Push module setting
      let s = duplicate(v);
      s.value = game.settings.get(v.module, v.key);
      s.isCheckbox = v.type === Boolean;
      s.isSelect = v.choices !== undefined;
      s.editable = game.user.isGM || s.scope === "client";
      m.settings.push(s);
    }

    // Return data
    const data = {
      user: game.user,
      modules: modules.sort((a, b) => {
        if ( a.module === "core" || a.name < b.name ) return -1;
        else if ( a.name > b.name ) return 1;
        else return 0;
      })
    };
    return (data);
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {
    for ( let [k, v] of Object.entries(formData) ) {
      let s = game.settings.settings[k],
          current = game.settings.get(s.module, s.key);
      if ( v !== current ) game.settings.set(s.module, s.key, v);
    }
  }
}

/**
 * Keyboard Controls Reference Sheet
 * @type {Application}
 */
class ControlsReference extends Application {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.title = game.i18n.localize("CONTROLS.Title");
    options.id = "controls-reference";
    options.template = "templates/sidebar/apps/controls-reference.html";
    options.width = 600;
    return options;
  }
}

/**
 * Game Invitation Links Reference
 * @type {Application}
 */
class InvitationLinks extends Application {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.title = game.i18n.localize("INVITATIONS.Title");
    options.id = "invitation-links";
    options.template = "templates/sidebar/apps/invitation-links.html";
    options.width = 400;
    return options;
  }

  getData() {
    return game.data.ips;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".invite-link").click(ev => {
      ev.preventDefault();
      ev.target.select();
      document.execCommand('copy');
      ui.notifications.info(game.i18n.localize("INVITATIONS.Copied"));
    });
  }
}

/**
 * The Module Management Application
 *
 * This application provides a view of which modules are available to be used and allows for configuration of the
 * set of modules which are active within the World.
 *
 * @type {Application}
 */
class ModuleManagement extends FormApplication {
	static get defaultOptions() {
	  const options = super.defaultOptions;
    options.title = game.i18n.localize("MODMANAGE.Title");
	  options.id = "module-management";
	  options.template = "templates/sidebar/apps/module-management.html";
	  options.popOut = true;
	  options.editable = game.user.isGM;
	  options.width = 600;
	  return options;
  }

	/* -------------------------------------------- */

  /**
   * Obtain module metadata and merge it with game settings which track current module visibility
   * @return {Object}   The data provided to the template when rendering the form
   */
  getData() {

    // Get the available modules
    const modules = game.modules.map(m => m.data),
          settings = game.settings.get("core", this.constructor.CONFIG_SETTING);

    // Flag the current module state
    for ( let mod of modules ) {
      mod.active = settings[mod.name] === true;
      mod.hasPacks = mod.packs.length > 0;
      mod.hasScripts = mod.scripts.length > 0;
      mod.hasStyles = mod.styles.length > 0;
      mod.systemOnly = mod.systems && (mod.systems.indexOf(game.system.name) !== -1);
      mod.systemTag = game.system.name;
    }

    // Return data to the template
    return {
      user: game.user,
      modules: modules
    }
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */


  /**
   * Activate the default set of listeners for the Module Management interface
   * @param html {JQuery}     The rendered template ready to have listeners attached
   */
	activateListeners(html) {
	  super.activateListeners(html);
    html.find(".module-update button").click(this._onUpdateModule.bind(this));
  }

  /* -------------------------------------------- */

  _onUpdateModule(event) {
    event.preventDefault();
    let btn = $(event.target),
        li = $(event.target).parents(".module"),
        moduleName = li.attr("data-module-name");

    // Check for update
    if ( btn.attr("data-state") === "check" ) {
      btn.html('<i class="fas fa-spinner fa-spin"></i> Checking for Update');
      btn.prop("disabled", true);
      game.socket.emit("moduleUpdateCheck", moduleName, hasUpdate => {
        if ( hasUpdate ) {
          btn.html('<i class="fas fa-check"></i> Update Available');
          btn.attr("data-state", "ready");
          btn.prop("disabled", false);
        } else {
          btn.html('<i class="fas fa-times"></i> No Update Available');
          btn.attr("data-state", "none");
          btn.prop("disabled", true);
        }
      });
    }

    // Begin update
    else if ( btn.attr("data-state") === "ready" ) {
      btn.html('<i class="fas fa-spinner fa-spin"></i> Update in Progress');
      btn.prop("disabled", true);
      game.socket.emit("moduleUpdateExecute", moduleName, updateSuccess => {
        if ( updateSuccess ) {
          btn.html('<i class="fas fa-check"></i> Update Successful');
          btn.after('<span class="notes">Refresh required for update to take effect!</span>');
        } else {
          btn.html('<i class="fas fa-times"></i> Update Failed');
        }
      });
    }
  }

  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {
    const settings = game.settings.get("core", this.constructor.CONFIG_SETTING);
    game.settings.set("core", this.constructor.CONFIG_SETTING, mergeObject(settings, formData)).then(() => {
      window.location.reload();
    })
  }
}


ModuleManagement.CONFIG_SETTING = "moduleConfiguration";
/**
 * A directory list of :class:`Actor` entities in the Sidebar
 * @type {SidebarDirectory}
 */
class ActorDirectory extends SidebarDirectory {

	static get entity() {
	  return "Actor";
  }

  static get collection() {
    return game.actors;
  }

	/* -------------------------------------------- */

  /**
   * Activate event listeners triggered within the Actor Directory HTML
   */
	activateListeners(html) {
    super.activateListeners(html);

	  // Everything below is a GM-only option
    if ( !game.user.isGM ) return;

    // Drag a token to the canvas
    html.find('li.actor').each((i, li) => {
      li.setAttribute("draggable", true);
      li.addEventListener('dragstart', ev => this._onDragStart(ev), false);
    });
  }

  /* -------------------------------------------- */

  getData() {
    const data = super.getData();
    data.folderPartial = "templates/sidebar/folder-partial.html";
    data.entityPartial = "templates/sidebar/actor-partial.html";
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Get the sidebar directory entry context options
   * @return {Object}   The sidebar entry context options
   * @private
   */
  _getEntryContextOptions() {
    const options = {};

    // Showcase Artwork
    options["Show Artwork"] = {
      icon: '<i class="fas fa-image"></i>',
      condition: li => {
        const actor = game.actors.get(li.attr('data-entity-id'));
        return actor.data.img !== DEFAULT_TOKEN;
      },
      callback: li => {
        const actor = game.actors.get(li.attr('data-entity-id'));
        new ImagePopout(actor.data.img, {title: actor.name, shareable: true}).render(true);
      }
    };

    // Showcase Token
    options["Show Token"] = {
      icon: '<i class="fas fa-image"></i>',
      condition: li => {
        const actor = game.actors.get(li.attr('data-entity-id'));
        return [null, undefined, DEFAULT_TOKEN].includes(actor.data.token.img);
      },
      callback: li => {
        const actor = game.actors.get(li.attr('data-entity-id'));
        new ImagePopout(actor.data.token.img, {title: actor.name, shareable: true}).render(true);
      }
    };

    if ( game.user.isGM ) {

      // Clear the current folder
      options["Clear Folder"] = {
        icon: '<i class="fas fa-folder"></i>',
        condition: li => {
          let actor = game.actors.get(li.attr("data-entity-id"));
          return !!actor.data.folder;
        },
        callback: li => {
          let actorId = li.attr('data-entity-id'),
            actor = game.actors.get(actorId);
          actor.update({folder: null}, true);
        }
      };

      // Delete the Actor
      options["Delete"] = {
        icon: '<i class="fas fa-trash"></i>',
        callback: li => {
          let actorId = li.attr('data-entity-id'),
              actor = game.actors.get(actorId);
          new Dialog({
            title: `Delete ${actor.name}`,
            content: "<h3>Are you sure?</h3><p>This Actor and its data will be permanently deleted.</p>",
            buttons: {
              yes: {
                icon: '<i class="fas fa-trash"></i>',
                label: "Delete",
                callback: () => actor.delete()
              },
              no: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
              }
            },
            default: "yes"
          }, {
            top: Math.min(li[0].offsetTop, window.innerHeight - 350),
            left: window.innerWidth - 720,
            width: 400
          }).render(true);
        }
      };

      // Duplicate the actor
      options["Duplicate"] = {
        icon: '<i class="far fa-copy"></i>',
        callback: li => {
          let actor = game.actors.get(li.attr('data-entity-id'));
          actor.constructor.create(duplicate(actor.data));
        }
      };

      // Configure permissions
      options["Permissions"] = {
        icon: '<i class="fas fa-lock"></i>',
        callback: li => {
          let actorId = li.attr('data-entity-id'),
              actor = game.actors.get(actorId);
          new PermissionControl(actor, {
            top: Math.min(li[0].offsetTop, window.innerHeight - 350),
            left: window.innerWidth - 720,
            width: 400
          }).render(true);
        }
      };
    }

    // Export data to disk
    options["Export Data"] = {
      icon: '<i class="fas fa-file-export"></i>',
      condition: li => {
        let actor = game.actors.get(li.attr("data-entity-id"));
        return actor.owner;
      },
      callback: li => {
        let actor = game.actors.get(li.attr('data-entity-id'));
        actor.exportToJSON();
      }
    };

    // Import data from disk
    options["Import Data"] = {
      icon: '<i class="fas fa-file-import"></i>',
      condition: li => {
        let actor = game.actors.get(li.attr("data-entity-id"));
        return actor.owner;
      },
      callback: li => {
        let actor = game.actors.get(li.attr('data-entity-id'));
        return actor.importDialog();
      }
    };

    // Return context options
    return options
  }
}

/**
 * The Chat Log application
 * @param {Boolean} options.stream      Render just the chat log for stream view
 * @type {SidebarTab}
 */
class ChatLog extends SidebarTab {
  constructor(options) {
    super(options);

    // Internal flags
    this._setup = 0;
    this._sentMessages = [];
    this._sentMessageIndex = -1;
    this._lastMessageTime = 0;

    // Update timestamps every 15 seconds
    setInterval(this.updateTimestamps, 1000 * 15);

    // Register game setting
    game.settings.register("core", "rollMode", {
      name: "Default Roll Type",
      hint: "Configure the default rolling behavior for automated dice rolls",
      scope: "client",
      config: false,
      default: "roll",
      type: String,
      choices: CONFIG.rollModes
    })
  }

  /* -------------------------------------------- */

  /**
   * Assign the default options which are supported by this Application
   */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "chat";
    options.template = "templates/sidebar/chat-log.html";
    options.title = "Chat Log";
    return options;
  }

  /* -------------------------------------------- */

  /**
   * Prepare the data used to render the ChatLog application
   * @return {Object}
   */
  getData() {
    return {
      user: game.user,
      rollMode: game.settings.get("core", "rollMode"),
      rollModes: CONFIG.rollModes,
      isStream: !!this.options.stream
    };
  }

  /* -------------------------------------------- */

  /**
   * Extend the inner rendering function to post all chat message when the container is re-rendered
   * @return {Promise.<void>}
   * @private
   */
	async _render(...args) {
	  await super._render(...args);
    this.postAll();
    this._setup = 1;
  }

  /* -------------------------------------------- */

  static parse(message) {
    const patterns = {
      "roll": new RegExp('^(\/r(?:oll)? )(.*)', 'i'),
      "gmroll": new RegExp('^(\/gmr(?:oll)? )(.*)', 'i'),
      "blindroll": new RegExp('^(\/b(?:lind)?r(?:oll)? )(.*)', 'i'),
      "ic": new RegExp('^(\/ic )(.*)', 'i'),
      "ooc": new RegExp('^(\/ooc )(.*)', 'i'),
      "emote": new RegExp('^(\/em(?:ote)? )(.*)', 'i'),
      "whisper": new RegExp('^\@(?:\\[)?([0-9a-zA-Z,\\s]+)(?:\\])? (.*)')
    };

    // Iterate over patterns, finding the first match
    let t, rgx, match;
    for ( [t, rgx] of Object.entries(patterns) ) {
      match = message.match(rgx); 
      if ( match ) return [t, match];
    }
    return [null, null];
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners triggered within the ChatLog application
   * @param html {jQuery|HTMLElement}
   */
  activateListeners(html) {

    // Chat Submit
    html.find("#chat-message").keydown(event => {

      // UP/DOWN ARROW -> Recall Previous Messages
      if ([KEYS.UP, KEYS.DOWN].includes(event.keyCode)) {
        event.preventDefault();
        let textarea = event.currentTarget,
          message = this._recall(event.keyCode === KEYS.UP ? 1 : -1);
        if (message) textarea.value = message;
      }

      // ENTER -> Send Message
      else if (event.keyCode === KEYS.ENTER && !event.shiftKey) {
        event.preventDefault();
        let textarea = event.currentTarget,
          message = textarea.value;
        if (!message) return;

        // Prepare chat message data and handle result
        this._processMessageData(message).then(chatData => {
          textarea.value = "";
          this._remember(message);
        }).catch(error => {
          ui.notifications.error(error);
          throw error;
        });
      }
    });

    // Expand dice roll tooltips
    html.on("click", ".dice-roll", event => this._onDiceRollClick(event));

    // Modify Roll Type
    html.find('select[name="rollMode"]').change(ev => {
      game.settings.set("core", "rollMode", ev.target.value);
    });

    // Single Message Delete
    html.on('click', 'a.message-delete', event => {
      let messageId = $(event.currentTarget).parents('.message').attr("data-message-id"),
        message = Messages.instance.get(messageId);
      message.delete();
    });

    // Flush log
    html.find('a.chat-flush').click(event => Messages.flush(true));

    // Export log
    html.find('a.export-log').click(event => {
      this._export(event)
    });

    // Chat Entry context menu
    this._contextMenu(html);
  }

  /* -------------------------------------------- */

  /**
   * Prepare the data object of chat message data depending on the type of message being posted
   * @param {String} message      The original string of the message content
   * @return {Promise.<Object>}   A Promise resolving to the prepared chat data object
   * @private
   */
  async _processMessageData(message) {

    // Parse the message to determine the matching handler
    let [type, match] = this.constructor.parse(message);

    // Set up basic chat data
    const chatData = {
      user: game.user._id,
      type: type,
      speaker: ChatMessage.getSpeaker(),
      content: match ? match[2] : message
    };
    const createOptions = {};

    // Call the new message hook and allow modules to handle the message
    if ( Hooks.call("chatMessage", this, message, chatData) === false ) return chatData;

    // Handle dice rolls
    if ( ["roll", "gmroll", "blindroll"].includes(type) ) {
      try {
        chatData["roll"] = new Roll(chatData["content"], Roll.getActorData()).roll();
      } catch(err) {
        throw new Error(`Unable to parse the roll expression: ${chatData["content"]}.`);
      }
      chatData["sound"] = CONFIG.sounds.dice;
      if ( ["gmroll", "blindroll"].includes(type) ) chatData["whisper"] = ChatMessage.getWhisperIDs("GM");
      if ( type === "blindroll" ) {
        chatData["blind"] = true;
        AudioHelper.play({src: chatData["sound"]});
      }
    }

    // Whispers
    else if ( type === "whisper" ) {
      delete chatData.speaker;
      let names = match[1].split(",").map(m => m.trim());
      let ids = names.reduce((a, n) => a.concat(ChatMessage.getWhisperIDs(n)), []);
      if ( ids.length ) chatData["whisper"] = Array.from(new Set(ids));
      else throw new Error("No target users exist for this whisper.");
      chatData["sound"] = CONFIG.sounds.notification;
    }

    // Emote
    else if ( type === "emote" ) {
      if ( !chatData.speaker.alias ) return;
      chatData.content = `${chatData.speaker.alias} ${chatData.content}`;
      chatData.emote = true;
      createOptions.chatBubble = true;
    }

    // In-Character
    else if ( type === "ic" ) {
      if ( !(chatData.speaker.actor || chatData.speaker.token) ) {
        throw new Error("You cannot chat in-character without an identified speaker");
      }
      createOptions.chatBubble = true;
    }

    // Out-of-Character
    else if ( type === "ooc" ) {
      delete chatData.speaker;
    }

    // Create the message
    await ChatMessage.create(chatData, createOptions);

    // Return the prepared chat data
    return chatData;
  }

  /* -------------------------------------------- */

  /**
   * Add a sent message to an array of remembered messages to be re-sent if the user pages up with the up arrow key
   * @param message {String}
   * @private
   */
  _remember(message) {
    if ( this._sentMessages.length === 5 ) this._sentMessages.splice(4, 1);
    this._sentMessages.unshift(message);
    this._sentMessageIndex = -1;
  }

  /* -------------------------------------------- */

  /**
   * Recall a previously sent message by incrementing up (1) or down (-1) through the sent messages array
   * @param increment {Number}    The direction to recall
   * @return {String}             The recalled message, or null
   * @private
   */
  _recall(increment) {
    if ( this._sentMessages.length > 0 ) {
      this._sentMessageIndex = Math.min(this._sentMessages.length - 1, this._sentMessageIndex + increment);
      return this._sentMessages[this._sentMessageIndex];
    }
    return null;
  }

  /* -------------------------------------------- */

  /**
   * Compendium sidebar Context Menu creation
   * @param html {jQuery}
   * @private
   */
  _contextMenu(html) {

    // Entry Context
    const entryOptions = this._getEntryContextOptions();
    Hooks.call(`get${this.constructor.name}EntryContext`, html, entryOptions);
    if (entryOptions) new ContextMenu(html, ".message", entryOptions);
  }

  /* -------------------------------------------- */

  /**
   * Get the ChatLog entry context options
   * @return {Object}   The sidebar entry context options
   * @private
   */
  _getEntryContextOptions() {
    return {};
  }

  /* -------------------------------------------- */

  /**
   * Scroll the chat log to the bottom
   * @private
   */
  scrollBottom() {
    let log = this.element.find('#chat-log');
    log.scrollTop(log[0].scrollHeight);
  }

  /* -------------------------------------------- */

  /**
   * Post a single chat message to the log
   * @param {ChatMessage} message   A ChatMessage entity instance to post to the log
   * @param {Boolean} [notify]      Trigger a notification which shows the log as having a new unread message
   * @return {Promise}              A Promise which resolves once the message is posted
   */
  async postOne(message, notify=false) {
    if ( !message.visible ) return;
    return message.render().then(html => {
      this.element.find("#chat-log").append(html);
      this.scrollBottom();
      if ( notify ) this.notify(message);
    });
  }

  /* -------------------------------------------- */

  /**
   * Update the content of a previously posted message after its data has been replaced
   * @param {ChatMessage} message   The ChatMessage instance to update
   * @param {Boolean} notify        Trigger a notification which shows the log as having a new unread message
   */
  updateMessage(message, notify=false) {
    let li = this.element.find(`.message[data-message-id="${message.id}"]`);
    if ( li.length ) message.render().then(html => li.replaceWith(html));
    if ( notify ) this.notify(message);
  }

  /* -------------------------------------------- */

  /**
   * Delete a single message from the chat log
   * @param {String} messageId    The ChatMessage entity to remove from the log
   */
  deleteMessage(messageId) {
    let li = this.element.find(`.message[data-message-id="${messageId}"]`);
    if ( li.length ) li.slideUp(100, () => li.remove());
  }

  /* -------------------------------------------- */

  /**
   * If there are any pending messages in the chat log, post them
   * @return {Promise}    A Promise which resolves once all messages are posted
   */
  async postAll() {
    this.element.find("#chat-log").html("");
    await getTemplate("templates/sidebar/chat-message.html");
    for ( let message of game.messages.entities ) {
      await this.postOne(message, false);
    }
  }

  /* -------------------------------------------- */

  /**
   * Trigger a notification that alerts the user visually and audibly that a new chat log message has been posted
   */
  notify(message) {
    this._lastMessageTime = new Date();
    if ( this._setup === 0 ) return;

    // Display the chat notification icon and remove it 3 seconds later
    let icon = $("#chat-notification");
    if ( icon.is(":hidden") ) icon.fadeIn(100);
    setTimeout(() => {
      if ( new Date() - this._lastMessageTime > 3000 && icon.is(":visible") ) icon.fadeOut(100);
    }, 3001);

    // Play a notification sound effect
    if ( message.data.sound ) AudioHelper.play({src: message.data.sound});
  }

  /* -------------------------------------------- */

  /**
   * Delete all messages from the DOM, optionally emitting a signal back to the server to propagate deletion
   */
  deleteAll() {
    $("#chat-log").children().each(function() {
      $(this).slideUp();
    }, () => log.html(""));
  }

  /* -------------------------------------------- */

  updateTimestamps() {
    let stamps = game.messages.entities.reduce((acc, val) => { acc[val._id] = val.data.timestamp; return acc;}, {});
    $("#chat-log").children().each((i, li) => {
      let id = li.getAttribute("data-message-id"),
          stamp = stamps[id];
      if ( !stamp ) return;
      li.querySelector('.message-timestamp').textContent = timeSince(stamp);
    })
  }

  /* -------------------------------------------- */

  static renderPopout(original) {
    throw "ChatLog does not support pop-out mode";
  }

  /* -------------------------------------------- */

  /**
   * Handle export of the chat log to a text file
   * @private
   */
  _export(event) {
    event.preventDefault();
    const log = game.messages.entities.map(m => m.export()).join("\n---------------------------\n");
    let date = new Date().toDateString().replace(/\s/g, "-");
    const filename = `fvtt-log-${date}.txt`;
    saveDataToFile(log, "text/plain", filename);
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  _onDiceRollClick(event) {
    event.preventDefault();
    let roll = $(event.currentTarget),
        tip = roll.find(".dice-tooltip");
    if ( !tip.is(":visible") ) {
      tip.slideDown(200);
    } else {
      tip.slideUp(200);
    }
  }
}


/* -------------------------------------------- */

CONFIG.rollModes = {
  "roll": "Public Roll",
  "gmroll": "Private GM Roll",
  "blindroll": "Blind GM Roll"
};

/* -------------------------------------------- */

/**
 * The combat and turn order tracker tab
 * @type {SidebarTab}
 */
class CombatTracker extends SidebarTab {
  constructor(options) {
    super(options);
    game.combats.apps.push(this);
    this._highlighted = null;

    if ( game.combat ) game.combat.setupTurns();
  }

  /* -------------------------------------------- */

  /**
   * Assign the default options which are supported by this Application
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "combat";
	  options.template = "templates/sidebar/combat-tracker.html";
	  options.title = "Combat Tracker";
	  return options;
  }
  
	/* -------------------------------------------- */
	/*  Rendering
	/* -------------------------------------------- */

  /**
   * Extend the inner rendering function to post all chat message when the container is re-rendered
   * @return {Promise.<void>}
   * @private
   */
	async _render(...args) {
	  await super._render(...args);
    if ( game.combat && game.combat.turns.length > 0 ) {
      let active = this.element.find(".active")[0];
      if ( !active ) return;
      let tracker = active.parentElement;
      tracker.scrollTop += active.offsetTop + active.offsetHeight - tracker.offsetHeight + tracker.scrollTop;
    }
  }

  /* -------------------------------------------- */

  /**
   * Prepare the data used to render the CombatTracker application
   * @return {Object}
   */
  getData() {
    let activeScene = game.scenes.active;

    // Get combat encounters for the scene
    const combats = activeScene ? game.combats.entities.filter(c => c.data.scene === activeScene._id) : [],
          activeIdx = combats.findIndex(c => c.data.active),
          hasCombat = activeIdx !== -1,
          settings = game.settings.get("core", Combat.CONFIG_SETTING);

    // Prepare rendering data
    const data = {
      user: game.user,
      combats: combats,
      currentIndex: activeIdx + 1,
      previousId: activeIdx > 0 ? combats[activeIdx - 1]._id : "",
      nextId: activeIdx < combats.length - 1 ? combats[activeIdx + 1]._id : "",
      combatCount: combats.length,
      hasCombat: hasCombat,
      started: this.started,
      settings: settings
    };

    if ( !hasCombat ) {
      return mergeObject(data, {
        turns: [],
        control: false
      });
    }

    // Add active combat data
    const combat = combats[activeIdx];
    if ( !combat.turns ) combat.turns = combat.setupTurns();
    const combatant = combat.combatant;

    // Does the player have current control?
    let hasControl = combatant && combatant.player && combatant.player.includes(game.user);

    // Update data for combatant turns
    const turns = combat.turns.map((t, i) => {
      t.visible = game.user.isGM || t.visible;
      t.active = i === combat.turn;
      t.img = t.defeated ? "icons/svg/skull.svg" : t.img;
      t.initiative = isNaN(parseFloat(t.initiative)) ? null : Number(t.initiative).toFixed(CONFIG.initiative.decimals);
      t.hasRolled = t.initiative !== null;
      t.css = [
        t.active ? "active" : "",
        t.hidden ? "hidden" : "",
        t.defeated ? "defeated" : ""
      ].join(" ").trim();
      return t;
    }).filter(t => t.visible);

    // Merge update data for rendering
    return mergeObject(data, {
      combat: combat,
      round: combat.data.round,
      turn: combat.data.turn,
      turns: turns,
      control: hasControl
    });
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners triggered within the Combat Tracker tab
   */
	activateListeners(html) {
	  let names = html.find('.token-name');

	  // Create new Combat encounter
    html.find('.combat-create').click(ev => this._onCombatCreate(ev));

    // Display Combat settings
    html.find('.combat-settings').click(ev => {
      ev.preventDefault();
      new CombatTrackerConfig().render(true);
    });

    // Cycle the current Combat encounter
    html.find('.combat-cycle').click(ev => this._onCombatCycle(ev));

    // Delete a Combat encounter
    html.find('.combat-delete').click(ev => this._onCombatDelete(ev));

	  // Combat control
    html.find('.combat-control').click(ev => this._onCombatControl(ev));

    // Combatant control
    html.find('.combatant-control').click(ev => this._onCombatantControl(ev));

    // Hover on Combatant
    names.hover(this._onCombatantHover.bind(this), this._onCombatantHoverOut.bind(this));

    // Click on Combatant
    names.click(this._onCombatantMouseDown.bind(this));

    // Context on right-click
    if ( game.user.isGM ) this._contextMenu(html);
  }

  /* -------------------------------------------- */

  /**
   * Handle new Combat creation request
   * @param {Event} event
   * @private
   */
  async _onCombatCreate(event) {
    event.preventDefault();
    let scene = game.scenes.active;
    if ( !scene ) return;
    let cbt = await Combat.create({scene: scene._id});
    await cbt.activate();
    this.render();
  }

  /* -------------------------------------------- */

  /**
   * Handle a Combat deletion request
   * @param {Event} event
   * @private
   */
  async _onCombatDelete(event) {
    event.preventDefault();
    let btn = event.currentTarget;
    if ( btn.hasAttribute("disabled") ) return;
    let cbt = game.combats.get(btn.getAttribute("data-combat-id"));
    await cbt.delete();
    if ( !game.combats.active ) {
      let first = game.combats.combats.shift();
      if ( first ) await first.activate();
    }
    this.render();
  }

  /* -------------------------------------------- */

  /**
   * Handle a Combat cycle request
   * @param {Event} event
   * @private
   */
  async _onCombatCycle(event) {
    event.preventDefault();
    let btn = event.currentTarget,
        combatId = btn.getAttribute("data-combat-id");
    if ( !combatId ) return;
    await game.combats.get(combatId).activate();
    this.render();
  }

  /* -------------------------------------------- */

  async _onCombatControl(event) {
    event.preventDefault();
    let ctrl = event.currentTarget;
    if ( ctrl.getAttribute("disabled") ) return;
    else ctrl.setAttribute("disabled", true);
    let fn = ctrl.getAttribute("data-control");
    game.combat[fn]().then(() => ctrl.removeAttribute("disabled"));
  }

  /* -------------------------------------------- */

  /**
   * Handle a Combatant control toggle
   * @param {Event} event
   * @private
   */
  async _onCombatantControl(event) {
    event.preventDefault();
    let btn = event.currentTarget,
        id = $(btn).parents(".combatant").attr("data-combatant-id"),
        c = game.combat.data.combatants.find(c => c.id === Number(id)),
        ctrl = btn.getAttribute("data-control");

    // Toggle hidden
    if ( ctrl === "toggleHidden" ) {
      await game.combat.updateCombatant({id: c.id, hidden: !c.hidden});
    }

    // Toggle defeated
    else if ( ctrl === "toggleDefeated" ) {
      let isDefeated = !c.defeated;
      await game.combat.updateCombatant({id: c.id, defeated: isDefeated});
      const token = canvas.tokens.get(c.tokenId);
      if ( token ) {
        if ( isDefeated && !token.data.overlayEffect ) token.toggleOverlay(CONFIG.Token.defeatedIcon);
        else if ( !isDefeated && token.data.overlayEffect === CONFIG.Token.defeatedIcon ) token.toggleOverlay(null);
      }
    }

    // Roll initiative
    else if ( ctrl === "rollInitiative" ) {
      await game.combat.rollInitiative(c.id, null);
    }

    this.render();
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse-down event on a combatant name in the tracker
   * @private
   */
  _onCombatantMouseDown(event) {
    event.preventDefault();
    if ( !canvas.scene.data.active ) return;
    let tokenId = Number(event.currentTarget.parentElement.getAttribute("data-token-id")),
        token = canvas.tokens.get(tokenId);
    token.control();
    canvas.tokens.cycleTokens(1, true);
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse-hover events on a combatant in the tracker
   * @private
   */
  _onCombatantHover(event) {
    event.preventDefault();
    if ( !canvas.scene.data.active ) return;
    let tokenId = Number(event.currentTarget.parentElement.getAttribute("data-token-id")),
        token = canvas.tokens.get(tokenId);
    if ( token && token.isVisible ) {
      if ( !token._controlled ) token._onMouseOver(event);
      this._highlighted = token;
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse-unhover events for a combatant in the tracker
   * @private
   */
  _onCombatantHoverOut(event) {
    event.preventDefault();
    if ( !canvas.scene.data.active ) return;
    if ( this._highlighted ) this._highlighted._onMouseOut(event);
    this._highlighted = null;
  }

  /* -------------------------------------------- */

  /**
   * Default folder context actions
   * @param html {jQuery}
   * @private
   */
  _contextMenu(html) {

    // Entry Context
    const entryOptions = this._getEntryContextOptions();
    Hooks.call(`get${this.constructor.name}EntryContext`, html, entryOptions);
    if (entryOptions) new ContextMenu(html, ".directory-item", entryOptions);
  }

  /* -------------------------------------------- */

  /**
   * Get the sidebar directory entry context options
   * @return {Object}   The sidebar entry context options
   * @private
   */
  _getEntryContextOptions() {
    return [
      {
        name: "Modify",
        icon: '<i class="fas fa-edit"></i>',
        callback: li => {
          let combatant = game.combat.getCombatant(li.attr('data-combatant-id'));
          new Dialog({
            title: `Modify ${combatant.name} Initiative`,
            content: `<div class="form-group">
                        <label>Initiative Value</label>
                        <input name="initiative" value="${combatant.initiative || ""}" placeholder="Value"/>
                      </div>`,
            buttons: {
              set: {
                icon: '<i class="fas fa-dice-d20"></i>',
                label: "Modify Roll",
                callback: html => {
                  let init = parseFloat(html.find('input[name="initiative"]').val());
                  game.combat.setInitiative(combatant.id, Math.round(init * 100) / 100);
                }
              },
              cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
              }
            },
            default: "set"
          }, {
            top: Math.min(li[0].offsetTop, window.innerHeight - 350),
            left: window.innerWidth - 720,
            width: 400
          }).render(true);
        }
      },
      {
        name: "Reroll",
        icon: '<i class="fas fa-dice-d20"></i>',
        callback: li => {
          game.combat.rollInitiative(Number(li.attr('data-combatant-id')));
        }
      },
      {
        name: "Remove",
        icon: '<i class="fas fa-skull"></i>',
        callback: li => {
          game.combat.deleteCombatant(Number(li.attr('data-combatant-id')));
        }
      }
    ];
  }
}

/**
 * A compendium of knowledge arcane and mystical!
 * @type {SidebarTab}
 */
class CompendiumDirectory extends SidebarTab {

  /**
   * Assign the default options which are supported by this Application
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "compendium";
	  options.template = "templates/sidebar/compendium.html";
	  options.title = "Compendium Packs";
	  return options;
  }

	/* -------------------------------------------- */

  /**
   * Prepare the data used to render the CompendiumList application
   * @return {Object}
   */
  getData() {

    // Filter packs for visibility
    let packs = game.packs.filter(p => game.user.isGM || p.public);

    // Sort packs by Entity type
    const packData = packs.sort((a,b) => a.entity.localeCompare(b.entity)).reduce((obj, pack) => {
      let ent = pack.entity;
      if ( !obj.hasOwnProperty(ent) ) obj[ent] = {
        label: ent,
        packs: []
      };
      obj[ent].packs.push(pack);
      return obj;
    }, {});

    // Sort packs within type
    for ( let [e, p] of Object.entries(packData) ) {
      p.packs = p.packs.sort((a,b) => a.title.localeCompare(b.title));
    }

    // Return data to the sidebar
    return {
      user: game.user,
      packs: packData
    }
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners triggered within the Compendium tab
   * Do not extend the parent functionality, instead override it entirely
   */
	activateListeners(html) {

	  // Click to open
	  html.find('.compendium-pack').click(ev => {
	    let li = $(ev.currentTarget),
        pack = game.packs.find(p => p.collection === li.attr("data-pack"));
      if ( li.attr("data-open") === "1" ) pack.close();
      else {
        li.attr("data-open", "1");
        li.find("i.folder").removeClass("fa-folder").addClass("fa-folder-open");
        pack.render(true);
      }
    });

	  // Options below are GM only
    if ( !game.user.isGM ) return;

	  // Create Compendium
    html.find('.create-compendium').click(this._onCreateCompendium.bind(this));
    
    // Compendium context menu
    this._contextMenu(html);
  }

  /* -------------------------------------------- */

  /**
   * Compendium sidebar Context Menu creation
   * @param html {jQuery}
   * @private
   */
  _contextMenu(html) {

    // Entry Context
    const entryOptions = this._getEntryContextOptions();
    Hooks.call(`get${this.constructor.name}EntryContext`, html, entryOptions);
    if (entryOptions) new ContextMenu(html, ".compendium-pack", entryOptions);
  }

  /* -------------------------------------------- */

  /**
   * Get the sidebar directory entry context options
   * @return {Object}   The sidebar entry context options
   * @private
   */
  _getEntryContextOptions() {
    return {
      "Mark Public": {
        icon: '<i class="fas fa-eye"></i>',
        condition: li => {
          let pack = game.packs.find(p => p.collection === li.attr("data-pack"));
          return !pack.public;
        },
        callback: li => {
          let pack = game.packs.find(p => p.collection === li.attr("data-pack"));
          let visible = game.settings.get("core", "compendiumVisibility");
          visible[pack.collection] = true;
          game.settings.set("core", "compendiumVisibility", visible);
        }
      },
      "Mark Private": {
        icon: '<i class="fas fa-eye-slash"></i>',
        condition: li => {
          let pack = game.packs.find(p => p.collection === li.attr("data-pack"));
          return pack.public;
        },
        callback: li => {
          let pack = game.packs.find(p => p.collection === li.attr("data-pack"));
          let visible = game.settings.get("core", "compendiumVisibility");
          visible[pack.collection] = false;
          game.settings.set("core", "compendiumVisibility", visible);
        }
      },
      "Delete Compendium": {
        icon: '<i class="fas fa-trash"></i>',
        condition: li => {
          let pack = game.packs.find(p => p.collection === li.attr("data-pack"));
          return pack.metadata.module === "world";
        },
        callback: li => {
          let pack = game.packs.find(p => p.collection === li.attr("data-pack"));
          this._onDeleteCompendium(pack);
        }
      }
    };
  }

  /* -------------------------------------------- */

  /**
   * Handle a Compendium Pack creation request
   * @param event
   * @private
   */
  async _onCreateCompendium(event) {
    event.preventDefault();
    const html = await renderTemplate('templates/sidebar/compendium-create.html', {
      entityTypes: COMPENDIUM_ENTITY_TYPES
    });
    new Dialog({
      title: "Create New Compendium",
      content: html,
      buttons: {
        create: {
          icon: '<i class="fas fa-check"></i>',
          label: "Create Compendium",
          callback: dlg => {
            const form = dlg.find('#compendium-create'),
                  data = validateForm(form[0]);
            Compendium.create(data).then(pack => {
              this.render();
            });
          }
        }
      }
    }).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle a Compendium Pack deletion request
   * @param {Object} pack   The pack object requested for deletion
   * @private
   */
  _onDeleteCompendium(pack) {
    new Dialog({
      title: `Delete Compendium: ${pack.metadata.label}`,
      content: "<h2>Are you sure?</h2><p>This Compendium Pack will be permanently deleted and cannot be recovered.</p>",
      buttons: {
        yes: {
          icon: '<i class="fas fa-trash"></i>',
          label: "Delete",
          callback: () => {
            SocketInterface.trigger("deleteCompendiumPack", {packName: pack.metadata.name}).then(packName => {
              const idx = game.packs.findIndex(p => p.collection === `world.${packName}`);
              if ( idx !== -1 ) game.packs.splice(idx, 1);
              this.render();
            })
          }
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: 'no'
    }).render(true);
  }
}

/* -------------------------------------------- */

/**
 * A directory list of :class:`Item` entities in the Sidebar
 * @type {SidebarDirectory}
 */
class ItemDirectory extends SidebarDirectory {

	static get entity() {
	  return "Item";
  }

  static get collection() {
    return game.items;
  }

	/* -------------------------------------------- */

  /**
   * Activate event listeners triggered within the Item directory HTML
   */
	activateListeners(html) {
	  super.activateListeners(html);

    // All users may drag items from the directory
    html.find('li.item').each((i, li) => {
      li.setAttribute("draggable", true);
      li.addEventListener('dragstart', ev => this._onDragStart(ev), false);
    });
  }

  /* -------------------------------------------- */

  /**
   * Define the behavior of the sidebar tab when it received a dropped data object
   * @param {Object} data   The data being dropped
   * @return {boolean}      Whether the drop was handled
   * @private
   */
  _handleDropData(event, data) {

    // Import an Owned Item from an actor
    if ( data.actorId ) {
      let actor = game.actors.get(data.actorId),
          item = actor.items.find(i => i.id === data.id);
      this.constructor.collection.object.create(item);
      return true;
    }

    // Otherwise us the default logic
    else return super._handleDropData(event, data);
  }

  /* -------------------------------------------- */

  /**
   * Get the sidebar directory entry context options
   * @return {Object}   The sidebar entry context options
   * @private
   */
  _getEntryContextOptions() {
    const options = {};

    // Showcase Artwork
    options["Show Artwork"] = {
      icon: '<i class="fas fa-image"></i>',
      condition: li => {
        const item = game.items.get(li.attr('data-entity-id'));
        return item.data.img !== DEFAULT_TOKEN;
      },
      callback: li => {
        const item = game.items.get(li.attr('data-entity-id'));
        new ImagePopout(item.data.img, {title: item.name, shareable: true}).render(true);
      }
    };
    if ( !game.user.isGM ) return options;

    // Clear Folder
    options["Clear Folder"] = {
      icon: '<i class="fas fa-folder"></i>',
      condition: li => {
        let item = game.items.get(li.attr("data-entity-id"));
        return item.data.folder;
      },
      callback: li => {
        let itemId = li.attr('data-entity-id'),
            item = game.items.get(itemId);
        item.update({folder: null}, true);
      }
    };

    // Delete Item
    options["Delete"] = {
      icon: '<i class="fas fa-trash"></i>',
      callback: li => {
        let itemId = li.attr('data-entity-id'),
            item = game.items.get(itemId);
        new Dialog({
          title: `Delete ${item.name}`,
          content: "<h3>Are you sure?</h3><p>This Item and its data will be permanently deleted.</p>",
          buttons: {
            yes: {
              icon: '<i class="fas fa-trash"></i>',
              label: "Delete",
              callback: () => item.delete()
            },
            no: {
              icon: '<i class="fas fa-times"></i>',
              label: "Cancel"
            }
          },
          default: "yes"
        }).render(true);
      }
    };

    // Duplicate Item
    options["Duplicate"] = {
      icon: '<i class="far fa-copy"></i>',
      callback: li => {
        let item = game.items.get(li.attr('data-entity-id'));
        item.constructor.create(duplicate(item.data));
      }
    };

    // Item Permissions
    options["Permissions"] = {
      icon: '<i class="fas fa-lock"></i>',
      callback: li => {
        let itemId = li.attr('data-entity-id'),
            item = game.items.get(itemId);
        new PermissionControl(item).render(true);
      }
    };
    return options;
  }
}


/**
 * A directory list of :class:`JournalEntry` entities in the Sidebar
 * @type {SidebarDirectory}
 */
class JournalDirectory extends SidebarDirectory {

  /**
   * Assign the default options which are supported by this Application
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "journal";
	  options.template = "templates/sidebar/journal-directory.html";
	  return options;
  }

	static get entity() {
	  return "JournalEntry";
  }

  static get collection() {
    return game.journal;
  }

	/* -------------------------------------------- */

  /**
   * Activate event listeners triggered within the Actor Directory HTML
   */
	activateListeners(html) {
    super.activateListeners(html);
  }

  /* -------------------------------------------- */

  /**
   * Get the sidebar directory entry context options
   * @return {Object}   The sidebar entry context options
   * @private
   */
  _getEntryContextOptions() {
    if ( !game.user.isGM ) return {};
    return [
      {
        name: "Delete",
        icon: '<i class="fas fa-trash"></i>',
        callback: li => {
          let id = li.attr('data-entity-id'),
           entry = game.journal.get(id);
          new Dialog({
            title: `Delete ${entry.name}`,
            content: "<h3>Are you sure?</h3><p>This journal entry will be permanently deleted.</p>",
            buttons: {
              yes: {
                icon: '<i class="fas fa-trash"></i>',
                label: "Delete",
                callback: () => entry.delete()
              },
              no: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
              }
            },
            default: "yes"
          }, {
            top: Math.min(li[0].offsetTop, window.innerHeight - 350),
            left: window.innerWidth - 720,
            width: 400
          }).render(true);
        }
      },
      {
        name: "Permissions",
        icon: '<i class="fas fa-lock"></i>',
        callback: li => {
          let id = li.attr('data-entity-id'),
           entry = game.journal.get(id);
          new PermissionControl(entry, {
            top: Math.min(li[0].offsetTop, window.innerHeight - 350),
            left: window.innerWidth - 720,
            width: 400
          }).render(true);
        }
      },
      {
        name: "Jump to Pin",
        icon: '<i class="fas fa-crosshairs"></i>',
        condition: li => {
          const entry = game.journal.get(li.data("entity-id"));
          return !!entry.sceneNote;
        },
        callback: li => {
          const entry = game.journal.get(li.data("entity-id"));
          entry.panToNote();
        }
      }
    ];
  }
}


/**
 * A directory listing of audio playlists
 */
class PlaylistDirectory extends SidebarDirectory {
  constructor(options) {
    super(options);

    /**
     * Track the playlist IDs which are currently displayed as collapsed
     * @type {Array}
     */
    this._collapsed = [];
  }

	/* -------------------------------------------- */

  /**
   * Assign the default options which are supported by this Application
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
    options.dragItemSelector = ".playlist-name";
	  return options;
  }

	/* -------------------------------------------- */

	static get entity() {
	  return "Playlist";
  }

  static get collection() {
    return game.playlists;
  }

	/* -------------------------------------------- */

  /**
   * Prepare the data used to render the AudioList application
   * @return {Object}
   */
  getData() {

    // Reduce the set of playlists to only ones that are visible
    let isGM = game.user.isGM;
    let visible = game.playlists.entities.filter(p => isGM || p.sounds.some(s => s.playing));
    let playlists = visible.map(p => duplicate(p.data));

    // Configure display for each playlist
    for ( let p of playlists ) {
      p.modeIcon = this._getModeIcon(p.mode);
      p.modeTooltip = this._getModeTooltip(p.mode);
      p.disabled = p.mode === PLAYLIST_MODES.DISABLED;
      p.controlCSS = isGM && !p.disabled ? "" : "disabled";

      // Reduce the visible sounds to those currently playing
      p.sounds = p.sounds.filter(s => s.playing || isGM).map(s => {
        s.lvolume = Math.sqrt(s.volume);
        s.controlCSS = isGM ? "" : "disabled";
        return s;
      });
    }

    // Return Playlist data for rendering
    return {
      user: game.user,
      isGM: isGM,
      entities: playlists,
      playlistModifier: Math.sqrt(game.settings.get("core", "globalPlaylistVolume")),
      ambientModifier: Math.sqrt(game.settings.get("core", "globalAmbientVolume")),
      interfaceModifier: Math.sqrt(game.settings.get("core", "globalInterfaceVolume")),
    }
  }

  /* -------------------------------------------- */

  /**
   * Given a constant playback mode, provide the FontAwesome icon used to display it
   * @param {Number} mode
   * @return {String}
   * @private
   */
  _getModeIcon(mode) {
    return {
      [PLAYLIST_MODES.DISABLED]: '<i class="fas fa-ban"></i>',
      [PLAYLIST_MODES.SEQUENTIAL]: '<i class="far fa-arrow-alt-circle-right"></i>',
      [PLAYLIST_MODES.SHUFFLE]: '<i class="fas fa-random"></i>',
      [PLAYLIST_MODES.SIMULTANEOUS]: '<i class="fas fa-compress-arrows-alt"></i>',
    }[mode];
  }

  /* -------------------------------------------- */

  /**
   * Given a constant playback mode, provide the string tooltip used to describe it
   * @param {Number} mode
   * @return {String}
   * @private
   */
  _getModeTooltip(mode) {
    return {
      [PLAYLIST_MODES.DISABLED]: "Soundboard Only",
      [PLAYLIST_MODES.SEQUENTIAL]: "Sequential Playback",
      [PLAYLIST_MODES.SHUFFLE]: "Shuffle Tracks",
      [PLAYLIST_MODES.SIMULTANEOUS]: "Simultaneous Playback"
    }[mode];
  }

  /* -------------------------------------------- */

  /**
   * After rendering the sidebar, reset the collapsed state of playlists
   * @private
   */
  async _renderInner(data) {
    let html = await super._renderInner(data);
    html.find("li.playlist").each((i, li) => {
      let collapsed = this._collapsed.includes(li.dataset.entityId);
      this._collapse(li, collapsed, 0);
    });
    return html;
  }

	/* -------------------------------------------- */
	/*  Event Listeners and Handlers               */
	/* -------------------------------------------- */

  /**
   * Activate scene directory listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Global volume sliders
    html.find('.global-volume').change(event => this._onGlobalVolume(event));

    // Control Track Volume
    html.find('.sound-volume').change(event => this._onSoundVolume(event));

    // All options below require a GM user
    if ( !game.user.isGM ) return;

    // Collapse/Expand Playlist
    html.find(".playlist-name").click(event => this._onPlaylistCollapse(event));

    // Playlist Control Events
    html.on("click", "a.sound-control", event => {
      event.preventDefault();
      let btn = event.currentTarget,
          action = btn.dataset.action;
      if ( !action || btn.classList.contains("disabled") ) return;

      // Edit Playlist
      if ( action === "playlist-edit" ) this._onPlaylistEdit(event);

      // Delete Playlist
      else if ( action === "playlist-delete" ) this._onPlaylistDelete(event);

      // Add Track
      else if ( action === "playlist-add" ) this._onPlaylistAddTrack(event);

      // Alter Playlist Mode
      else if ( action === "playlist-mode" ) this._onPlaylistToggleMode(event);

      // Play or Stop Playlist
      else if ( action === "playlist-play" ) this._onPlaylistPlay(event, true);
      else if ( action === "playlist-stop" ) this._onPlaylistPlay(event, false);

      // Edit Track
      else if ( action === "sound-edit" ) this._onSoundEdit(event);

      // Play or Stop Track
      else if ( action === "sound-play" ) this._onSoundPlay(event, true);
      else if ( action === "sound-stop" ) this._onSoundPlay(event, false);

      // Repeat Track
      else if ( action === "sound-repeat" ) this._onSoundToggleMode(event);

      // Delete Track
      else if ( action === "sound-delete" ) this._onSoundDelete(event);
    });
  }

  /* -------------------------------------------- */

  /**
   * Handle global volume change for the playlist sidebar
   * @private
   */
  _onGlobalVolume(event) {
    event.preventDefault();
    let slider = event.currentTarget,
        volume = Math.pow(parseFloat(slider.value), 2);
    game.settings.set("core", slider.name, volume);
  }

  /* -------------------------------------------- */

  /**
   * Handle new Playlist creation request
   * TODO: I should replace this with a real ApplicationForm subclass
   * @private
   */
  _onCreate(event) {
    event.preventDefault();
    renderTemplate('templates/playlist/create-playlist.html', {}).then(dlg => {
      new Dialog({
        title: `Create New Playlist`,
        content: dlg,
        buttons: {
          create: {
            icon: '<i class="fas fa-check"></i>',
            label: "Create Playlist",
            callback: dlg => {
              const form = dlg.find('#playlist-create'),
                    data = validateForm(form[0]);
              Playlist.create(data);
            }
          }
        }
      }).render(true);
    });
  }

  /* -------------------------------------------- */

  /**
   * Handle Playlist collapse toggle
   * @private
   */
  _onPlaylistCollapse(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".playlist"),
        collapsed = this._collapsed.includes(li[0].dataset.entityId);
    this._collapse(li, !collapsed, 250);
  }

  /* -------------------------------------------- */

  /**
   * Helper method to render the expansion or collapse of playlists
   * @param {HTMLElement} li
   * @param {Boolean} collapsed
   * @param {Number} speed
   * @private
   */
  _collapse(li, collapse, speed) {
    li = $(li);
    let playlistId = li[0].dataset.entityId,
        ol = li.children(".playlist-sounds"),
        icon = li.children(".playlist-name i.fa");
    if ( collapse ) {
      ol.slideUp(speed);
      icon.removeClass("fa-angle-down").addClass("fa-angle-up");
      let idx = this._collapsed.indexOf(playlistId);
      if ( idx === -1 ) this._collapsed.push(playlistId);
    } else {
      ol.slideDown(speed);
      icon.removeClass("fa-angle-up").addClass("fa-angle-down");
      let idx = this._collapsed.indexOf(playlistId);
      if ( idx !== -1 ) this._collapsed.splice(idx, 1);
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle Playlist edit action
   * @private
   */
  _onPlaylistEdit(event) {
    let li = $(event.currentTarget).parents(".playlist"),
        playlist = game.playlists.get(li[0].dataset.entityId),
        config = new PlaylistConfig(playlist);
    config.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle Playlist deletion requests
   * Confirm the deletion with a yes/no dialog prompt
   * @private
   */
  _onPlaylistDelete(event) {
    let playlistId = $(event.currentTarget).parents('.playlist').attr("data-entity-id"),
        playlist = game.playlists.get(playlistId);
    new Dialog({
      title: `Delete ${playlist.name}`,
      content: "<h3>Are you sure?</h3><p>This Playlist and its Tracks will be deleted.</p>",
      buttons: {
        yes: {
          icon: '<i class="fas fa-trash"></i>',
          label: "Delete",
          callback: () => {
            playlist.stopAll();
            playlist.delete();
          }
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: 'yes'
    }).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle Playlist track addition request
   * @private
   */
  _onPlaylistAddTrack(event) {
    let li = $(event.currentTarget).parents('.playlist'),
        playlist = game.playlists.get(li.attr("data-entity-id"));
    new PlaylistSoundConfig(playlist, {}, {top: li[0].offsetTop - 30, left: window.innerWidth - 670}).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle Playlist playback state changes
   * @private
   */
  _onPlaylistPlay(event, playing) {
    let playlistId = $(event.currentTarget).parents('.playlist').attr("data-entity-id"),
        playlist = game.playlists.get(playlistId);
    playlist.update({playing: playing});
  }

  /* -------------------------------------------- */

  /**
   * Handle cycling the playback mode for a Playlist
   * @private
   */
  _onPlaylistToggleMode(event) {
    let playlistId = $(event.currentTarget).parents('.playlist').attr("data-entity-id"),
        playlist = game.playlists.get(playlistId);
    playlist.cycleMode();
  }

  /* -------------------------------------------- */

  /**
   * Handle editing a Sound within a PLaylist
   * @private
   */
  _onSoundEdit(event) {
    let li = $(event.currentTarget).parents('.sound'),
        pl = game.playlists.get(li.parents('.playlist').attr("data-entity-id")),
        sound = pl.sounds.find(s => s.id === Number(li.attr("data-sound-id")));
    new PlaylistSoundConfig(pl, sound, {top: li[0].offsetTop - 30, left: window.innerWidth - 670}).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Modify the playback state of a Sound within a Playlist
   * @private
   */
  _onSoundPlay(event, playing) {
    let li = $(event.currentTarget).parents('.sound'),
        soundId = Number(li.attr("data-sound-id")),
        playlist = game.playlists.get(li.parents('.playlist').attr("data-entity-id"));
    playlist.updateSound({id: soundId, playing: playing}, true);
  }

  /* -------------------------------------------- */

  /**
   * Handle volumne adjustments to sounds within a Playlist
   * @private
   */
  _onSoundVolume(event) {
    event.preventDefault();
    let slider = $(event.currentTarget),
      li = slider.parents('.sound'),
      soundId = Number(li.attr("data-sound-id")),
      playlistId = slider.parents('.playlist').attr("data-entity-id"),
      playlist = game.playlists.get(playlistId),
      volume = Math.pow(parseFloat(slider.val()), 2);

    // Only push the update if the user is a GM
    if ( game.user.isGM ) playlist.updateSound({id: soundId, volume: volume});

    // Otherwise simply apply a local override
    else {
      let sound = playlist.howls[soundId];
      if ( !sound.howl ) return;
      sound.howl.volume(volume, sound.id);
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle changes to the sound playback mode
   * @private
   */
  _onSoundToggleMode(event) {
    let btn = $(event.currentTarget),
        soundId = Number(btn.parents('.sound').attr("data-sound-id")),
        playlist = game.playlists.get(btn.parents('.playlist').attr("data-entity-id"));
    playlist.updateSound({id: soundId, repeat: btn.hasClass("inactive")}, true);
  }

  /* -------------------------------------------- */

  /**
   * Handle Playlist track deletion request
   * @private
   */
  _onSoundDelete(event) {
    let li = $(event.currentTarget).parents('.sound'),
        playlist = game.playlists.get(li.parents('.playlist').attr("data-entity-id")),
        soundId = Number(li.attr("data-sound-id")),
        sound = playlist.sounds.find(s => s.id === soundId);

    // Render a confirmation dialog
    new Dialog({
      title: `Delete Sound: ${sound.name}`,
      content: `<p class="notes">This Sound will be deleted from ${playlist.name}.</p>`,
      buttons: {
        yes: {
          icon: '<i class="fas fa-trash"></i>',
          label: "Delete",
          callback: () => playlist.deleteSound(soundId)
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: 'yes'
    }).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle right click context-menu options on a Playlist or a Sound
   * @private
   */
  _contextMenu(html) {
    const entryOptions = this._getSoundContextOptions();
    Hooks.call(`get${this.constructor.name}SoundContext`, html, entryOptions);
    new ContextMenu(html, ".playlist .sound", entryOptions);
  }

  /* -------------------------------------------- */

  /**
   * Get context menu options for individual sound effects
   * @return {Object}   The context options for each sound
   * @private
   */
  _getSoundContextOptions() {
    return {
      "Preload Sound": {
        icon: '<i class="fas fa-download"></i>',
        callback: h => {
          let soundId = Number(h.attr("data-sound-id")),
              playlist = game.playlists.get(h.parents('.playlist').attr("data-entity-id")),
              sound = playlist.sounds.find(s => s.id === soundId);
          game.audio.preload(sound);
        }
      }
    }
  }
}

/**
 * A directory listing of active game scenes
 * @type {SidebarDirectory}
 */
class SceneDirectory extends SidebarDirectory {

	static get entity() {
	  return "Scene";
  }

	/* -------------------------------------------- */

  static get collection() {
    return game.scenes;
  }

  /* -------------------------------------------- */

  /**
   * Override the logic used to create a new Scene
   * Ensure that newly created scenes begin as Active if no other scene is currently activated
   * @param event
   * @private
   */
  _onCreate(event) {
    let noneActive = !game.scenes.active;
    return Scene.create({name: "New Scene", active: noneActive, navigation: true}).then(scene => {
      if ( noneActive ) canvas.draw();
    });
  }

  /* -------------------------------------------- */

  /**
   * Get the sidebar directory entry context options
   * @return {Object}   The sidebar entry context options
   * @private
   */
  _getEntryContextOptions() {
    return {
      "Configure Scene": {
        icon: '<i class="fas fa-cogs"></i>',
        callback: li => {
          const scene = game.scenes.get(li.attr("data-entity-id"));
          scene.sheet.render(true);
        }
      },
      "Scene Notes": {
        icon: '<i class="fas fa-scroll"></i>',
        callback: li => {
          const scene = game.scenes.get(li.attr("data-entity-id"));
          scene.notes.render(true);
        }
      },
      "Activate Scene": {
        icon: '<i class="fas fa-bullseye"></i>',
        callback: li => {
          const scene = game.scenes.get(li.attr("data-entity-id"));
          scene.activate();
        }
      },
      "Toggle Navigation": {
        icon: '<i class="fas fa-compass"></i>',
        callback: li => {
          const scene = game.scenes.get(li.attr("data-entity-id"));
          scene.update({active: false, navigation: !scene.data.navigation});
        }
      },
      "Duplicate": {
        icon: '<i class="far fa-copy"></i>',
        callback: li => {
          const scene = game.scenes.get(li.attr('data-entity-id'));
          const data = duplicate(scene.data);
          data.name += " (Copy)";
          data.active = data.navigation = false;
          Scene.create(data);
        }
      },
      "Delete Scene": {
        icon: '<i class="fas fa-trash"></i>',
        callback: li => {
          const scene = game.scenes.get(li.attr("data-entity-id"));
          new Dialog({
            title: `Delete ${scene.name}`,
            content: "<h3>Are you sure?</h3><p>This scene and its contents will be permanently deleted.</p>",
            buttons: {
              yes: {
                icon: '<i class="fas fa-trash"></i>',
                label: "Delete",
                callback: () => scene.delete()
              },
              no: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
              }
            },
            default: "yes"
          }).render(true);
        }
      }
    }
  }
}

/**
 * A sidebar tab for providing help messages and settings configurations
 * @type {SidebarTab}
 */
class Settings extends SidebarTab {

  /**
   * Assign the default options which are supported by this Application
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.id = "settings";
	  options.template = "templates/sidebar/settings.html";
	  options.title = "Settings";
	  return options;
  }

	/* -------------------------------------------- */

  /**
   * Prepare the data used to render the Settings application
   * @return {Object}
   */
  getData() {
    return {
      user: game.user,
      system: game.system
    };
  }

	/* -------------------------------------------- */

  /**
   * Activate HTML listeners which apply to the Settings sidebar tab
   * @param html
   */
	activateListeners(html) {

	  // Configure Settings
    html.find('#configure-settings').click(ev => {
      game.settings.sheet.render(true);
    });

	  // Manage Modules
    html.find('#manage-modules').click(ev => {
      new ModuleManagement().render(true);
    });

    // Controls Reference
    html.find("#help-controls").click(ev => {
      new ControlsReference().render(true);
    });

	  // Show Documentation
    html.find('button#help-docs').click(ev => {
      new Documentation().render(true);
    });

    // Update Software
    html.find('#check-update').click(ev => {
      ev.preventDefault();
      window.location.href = "/update";
    });

    // Update Software
    html.find('#invite-links').click(ev => {
      ev.preventDefault();
      new InvitationLinks().render(true);
    });
  }
}


/* -------------------------------------------- */


/**
 * A simple window application which shows the built documentation pages within an iframe
 * @type {Application}
 */
class Documentation extends Application {

  /**
   * Assign the default options which are supported by this Application
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;

	  // Default positioning
	  let h = window.innerHeight * 0.9,
        w = Math.min(window.innerWidth * 0.9, 1200);
    options.height = h;
    options.width = w;
    options.top = (window.innerHeight - h) / 2;
    options.left = (window.innerWidth - w) / 2;

    // Template
    options.title = "Foundry Virtual Tabletop - Documentation";
    options.id = "documentation";
    options.template = "templates/apps/documentation.html";
    return options;
  }

	/* -------------------------------------------- */

  getData() {
    return {
      src: "http://foundryvtt.com"
    };
  }

  /* -------------------------------------------- */

  close() {
    this.element.find("#docs").remove();
    super.close();
  }
}

/* -------------------------------------------- */

/**
 * A single Mouse Cursor
 * @type {PIXI.Container}
 */
class Cursor extends PIXI.Container {
  constructor(user) {
    super();
    this.target = {x: 0, y: 0};
    this.draw(user);

    // Register and add animation
    canvas.app.ticker.add(this._animate, this);
  }

  /* -------------------------------------------- */

  /**
   * Draw the user's cursor as a small dot with their user name attached as text
   */
  draw(user) {

    // Cursor dot
    let d = this.addChild(new PIXI.Graphics()),
        color = user.data.color.replace("#", "0x") || 0x42F4E2;
    d.beginFill(color, 0.35).lineStyle(1, 0x000000, 0.5).drawCircle(0, 0, 6);

    // Player name
    let n = this.addChild(new PIXI.Text(user.name, new PIXI.TextStyle({
      fontFamily: "Signika",
      fontSize: 14,
      fill: "#DDDDDD",
      stroke: '#000000',
      strokeThickness: 1,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowAngle: 0,
      dropShadowDistance: 0,
      align: "center"
    })));
    n.x -= n.width / 2;
    n.y += 10;
  }

  /* -------------------------------------------- */

  /**
   * Move an existing cursor to a new position smoothly along the animation loop
   */
  _animate() {
    let dy = this.target.y - this.y,
        dx = this.target.x - this.x;
    if ( Math.abs( dx ) + Math.abs( dy ) < 10 ) return;
    this.x += dx / 10;
    this.y += dy / 10;
  }

  /* -------------------------------------------- */

  /**
   * Remove the cursor update from the animation loop and destroy the container.
   * @param options {Object}      Additional options passed to the parent ``PIXI.Container.destroy()`` method
   */
  destroy(options) {
    canvas.app.ticker.remove(this._animate, this);
    super.destroy(options);
  }
}

/**
 * An icon representing a Door Control
 * @type {PIXI.Container}
 */
class DoorControl extends PIXI.Container {
  constructor(wall) {
    super();
    this.wall = wall;
    this.wall._doorControl = this;
  }

  /* -------------------------------------------- */

  draw() {
    for ( let i = 0; i < this.children.length; i++ ) this.children[i].destroy();

    // Background
    let bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.10).drawRoundedRect(-2, -2, 44, 44, 5).endFill();
    this.bg = this.addChild(bg);

    // Border
    this.border = this.addChild(new PIXI.Graphics());
    this.border.lineStyle(1, 0xFF5500, 0.8).drawRoundedRect(-2, -2, 44, 44, 5).endFill();
    this.border.visible = false;

    // Icon
    this.drawIcon();

    // Add control interactivity
    this.interactive = true;
    this.interactiveChildren = false;
    this.hitArea = new PIXI.Rectangle(-2, -2, 44, 44);

    // Set position
    this.reposition();
    this.alpha = 1.0;

    // Activate listeners
    this.on("mouseover", this._onMouseOver)
        .on("mouseout", this._onMouseOut)
        .on("mousedown", this._onMouseDown)
        .on('rightdown', this._onRightDown);
  }

  /* -------------------------------------------- */

  drawIcon() {
    if ( this.icon ) this.icon.destroy();
    let tex = new PIXI.Texture.from(this.texture);
    this.icon = this.addChild(new PIXI.Sprite(tex));
    this.icon.width = this.icon.height = 40;
    this.icon.alpha = 0.5;
  }

  /* -------------------------------------------- */

  reposition() {
    let pos = this.wall.midpoint.map(p => p - 20);
    this.position.set(...pos);
  }

  /* -------------------------------------------- */

  /**
   * Get the icon texture to use for the Door Control icon based on the door state
   * @type {string}
   */
  get texture() {
    let s = this.wall.data.ds,
        ds = WALL_DOOR_STATES;
    if ( !game.user.isGM && s === ds.LOCKED ) s = ds.CLOSED;
    return {
      [ds.LOCKED]: 'icons/svg/padlock.svg',
      [ds.CLOSED]: 'icons/svg/door-steel.svg',
      [ds.OPEN]: 'icons/svg/door-exit.svg'
    }[s || ds.CLOSED];
  }

  /* -------------------------------------------- */

  /**
   * Determine whether the DoorControl is visible to the calling user's perspective.
   * @type {Boolean}
   */
  get isVisible() {

    // Under some circumstances, controls are always visible
    if ( game.user.isGM && !canvas.sight.tokens.vision.length ) return true;

    // Check that there is are LOS polygons to test
    let los = canvas.sight.los;
    if ( canvas.sight && ( los.tokens.length || los.lights.length ) ) {
      let fov = canvas.sight.fov;
      let [x, y] = this.wall.midpoint;

      // Iterate over positional offsets
      let offsets = [[0, 0], [-2, -2], [2, -2], [2, 2], [-2, 2]];
      return offsets.some(o => {
        let p = {x: x + o[0], y: y + o[1]};

        // The point must fall within a LOS polygon
        let hasLOS = ( los.tokens.some(v => v.contains(p.x, p.y) || los.lights.some(v => v.contains(p.x, p.y))) );
        if ( !hasLOS ) return false;

        // The center must also fall within some FOV
        else return ( fov.tokens.some(v => v.contains(p.x, p.y)) || fov.lights.some(v => v.contains(p.x, p.y)) );
      });
    }
  }

  /* -------------------------------------------- */

  _onMouseOver(ev) {
    ev.stopPropagation();
    let canControl = game.user.isGM || game.settings.get("core", "playerDoors"),
        blockPaused = game.paused && !game.user.isGM;
    if ( !canControl || blockPaused ) return false;
    this.border.visible = true;
    this.icon.alpha = 1.0;
    canvas.walls._hover = this.wall;
  }

  /* -------------------------------------------- */

  _onMouseOut(ev) {
    ev.stopPropagation();
    if ( game.paused && !game.user.isGM ) return false;
    this.border.visible = false;
    this.icon.alpha = 0.5;
    canvas.walls._hover = null;
  }

  /* -------------------------------------------- */

  /**
   * Handle left mouse down events on the door control icon.
   * This should only toggle between the OPEN and CLOSED states.
   * @param event
   * @private
   */
  _onMouseDown(event) {
    event.stopPropagation();
    let state = this.wall.data.ds,
        states = WALL_DOOR_STATES;

    // Determine whether the player can control the door at this time
    let canControl = game.user.isGM || game.settings.get("core", "playerDoors"),
        blockPaused = game.paused && !game.user.isGM;
    if ( !canControl || blockPaused ) return false;

    // Play an audio cue for locked doors
    if ( state === states.LOCKED ) {
      AudioHelper.play({src: CONFIG.sounds.lock});
      return false;
    }

    // Toggle between OPEN and CLOSED states
    state = state === states.CLOSED ? states.OPEN : states.CLOSED;
    this.wall.update(canvas.scene._id, {ds: state});
  }

  /* -------------------------------------------- */

  /**
   * Handle right mouse down events on the door control icon
   * This should toggle whether the door is LOCKED or CLOSED
   * @param event
   * @private
   */
  _onRightDown(event) {
    event.stopPropagation();
    if ( !game.user.isGM ) return;
    let state = this.wall.data.ds,
        states = WALL_DOOR_STATES;
    if ( state === states.OPEN ) return;
    state = state === states.LOCKED ? states.CLOSED : states.LOCKED;
    this.wall.update(canvas.scene._id, {ds: state});
  }
}


/**
 * A CanvasLayer for displaying UI controls which are overlayed on top of other layers.
 *
 * We track three types of events:
 * 1) Cursor movement
 * 2) Ruler measurement
 * 3) Map pings
 */
class ControlsLayer extends CanvasLayer {
  constructor() {
    super();

    /**
     * Cursor position indicators
     * @type {PIXI.Container}
     */
    this.cursors = null;

    /**
     * A mapping of user IDs to Cursor instances for quick access
     * @type {Object}
     */
    this._cursors = {};

    /**
     * Door control icons
     */
    this.doors = null;

    /**
     * Status effect icons
     */
    this.effects = null;

    /**
     * Ruler tools, one per connected user
     * @type {PIXI.Container}
     */
    this.rulers = null;

    /**
     * A convenience mapping of user IDs to Ruler instances for quick access
     * @type {Object}
     */
    this._rulers = {};

    /**
     * Canvas selection rectangle
     * @type {PIXI.Graphics}
     */
    this.select = null;

    // Get the current cursor setting
    this._showCursors = game.settings.get("core", "showCursors");
  }

  /* -------------------------------------------- */

  /**
   * A convenience accessor to the Ruler for the active game user
   * @type {Ruler}
   */
  get ruler() {
    return this._rulers[game.user._id];
  }

  /* -------------------------------------------- */

  deactivate() {
    super.deactivate();
    this.interactiveChildren = true;
  }

  /* -------------------------------------------- */

  /**
   * Draw current cursor UI elements
   */
  draw() {
    this.removeChildren().forEach(c => c.destroy({children: true}));
    this.drawCursors();
    this.drawDoors();
    this.drawRulers();
    this.select = this.addChild(new PIXI.Graphics());
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Draw the cursors container
   */
  drawCursors() {
    if ( this.cursors ) {
      this.cursors.destroy({children: true});
      this.cursors = null;
    }
    if ( !this._showCursors ) return;
    const cursors = new PIXI.Container();
    for ( let u of game.users.entities.filter(u => u.active && u._id !== game.user._id ) ) {
      cursors.addChild(this.drawCursor(u));
    }
    this.cursors = this.addChild(cursors);
  }

  /* -------------------------------------------- */

  /**
   * Draw the Door controls container
   */
  drawDoors() {

    // Create the container
    if ( this.doors ) {
      this.doors.destroy({children: true});
      this.doors = null;
    }
    const doors = new PIXI.Container();

    // Get the walls which are doors
    const walls = canvas.walls.doors.filter(d => game.user.isGM || d.data.door === WALL_DOOR_TYPES.DOOR);
    walls.forEach(d => {
      let dc = doors.addChild(new DoorControl(d));
      dc.draw();
    });
    this.doors = this.addChild(doors);

    // Toggle visibility for the set of door control icons
    this.doors.visible = !canvas.walls._active;
  }

  /* -------------------------------------------- */

  /**
   * Draw Ruler tools
   */
  drawRulers() {
    this.rulers = this.addChild(new PIXI.Container());
    for (let u of game.users.entities) {
      let ruler = new Ruler(u);
      this._rulers[u._id] = this.rulers.addChild(ruler);
    }
  }

  /* -------------------------------------------- */

  /**
   * Draw the select rectangle given an event originated within the base canvas layer
   * @param {Object} coords   The rectangle coordinates of the form {x, y, width, height}
   */
  drawSelect({x, y, width, height}) {
    const s = this.select.clear();
    s.lineStyle(3, 0xFF9829, 0.9).drawRect(x, y, width, height);
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers               */
  /* -------------------------------------------- */

  /**
   * Listen for new cursor data sent from the server.
   * Cursor data sent by the server is pre-validated, so no further checks are required here.
   *
   * @param socket {Socket}       The open socket client.
   */
  static socketListeners(socket) {
    socket.on('cursor', (userId, cursorData) => {

      // Get the user
      let user = game.users.get(userId);

      // Update cursor position
      if ( cursorData.hasOwnProperty("position") ) {
        canvas.controls.updateCursor(user, cursorData.position);
      }

      // Update Ruler measurement
      if ( cursorData.hasOwnProperty("ruler") ) {
        canvas.controls.updateRuler(user, cursorData.ruler);
      }
    });
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Event handler forwarded by ``Canvas._onMouseMove``
   * @param {PIXI.interaction.InteractionEvent} event
   */
  _onMoveCursor(event, position) {

    // Construct cursor data
    const cursorData = {
      position: position,
      ruler: this.ruler._state > 0 ? this.ruler.toJSON() : null
    };

    // Emit the cursor update event
    game.socket.emit('cursor', game.user._id, cursorData);
  }

  /* -------------------------------------------- */

  /**
   * Handle changing of the display cursors game setting
   * @private
   */
  _onChangeCursorSetting(enabled) {
    this._showCursors = enabled;
    this.drawCursors();
  }

  /* -------------------------------------------- */
  /*  Methods
  /* -------------------------------------------- */

  /**
   * Create and draw the Cursor object for a given User
   * @param user {User}   The User entity for whom to draw the cursor Container
   */
  drawCursor(user) {
    let c = this._cursors[user._id];
    if ( c ) {
      c.destroy({children: true});
      delete this._cursors[user._id];
    }
    c = new Cursor(user);
    this._cursors[user._id] = c;
    return c;
  }

  /* -------------------------------------------- */

  /**
   * Update the cursor when the user moves to a new position
   */
  updateCursor(user, position) {
    if ( !this._showCursors ) return;
    if ( user === game.user ) return;

    // Get Cursor element
    let cursor = this._cursors[user._id];
    cursor = cursor || this.cursors.addChild(this.drawCursor(user));

    // Ignore inactive cursors
    if ( ( position === null ) || (user.data.scene !== canvas.scene._id) ) {
      if ( cursor ) cursor.visible = false;
      return;
    }

    // Show the cursor in its currently tracked position
    cursor.visible = true;
    cursor.target = {x: position.x || 0, y: position.y || 0};
  }

  /* -------------------------------------------- */

  updateRuler(user, rulerData) {
    let ruler = this._rulers[user._id];
    if ( !ruler ) return;

    // Remove an existing ruler
    if ( rulerData === null ) ruler.clear();

    // Update a ruler
    else ruler.update(rulerData);
  }
}

/**
 * The Ruler - used to measure distances and trigger movements
 * @param {User}  The User for whom to construct the Ruler instance
 * @type {PIXI.Container}
 */
class Ruler extends PIXI.Container {
  constructor(user, {color=null}={}) {
    super();
    user = user || game.user;

    /**
     * The ruler name - used to differentiate between players
     * @type {String}
     */
    this.name = `Ruler.${user._id}`;

    /**
     * The ruler color - by default the color of the active user
     * @type {Number}
     */
    this.color = color || user.data.color.replace("#", "0x") || 0x42F4E2;

    /**
     * This Array tracks individual waypoints along the ruler's measured path.
     * The first waypoint is always the origin of the route.
     * @type {Array.<PIXI.Point>}
     */
    this.waypoints = [];

    /**
     * The current destination point at the end of the measurement
     * @type {PIXI.Point}
     */
    this.destination = null;

    /**
     * The Ruler element is a Graphics instance which draws the line and points of the measured path
     * @type {PIXI.Graphics}
     */
    this.ruler = this.addChild(new PIXI.Graphics());

    /**
     * The Labels element is a Container of Text elements which label the measured path
     * @type {PIXI.Container}
     */
    this.labels = this.addChild(new PIXI.Container());

    /**
     * Track the current measurement state
     * @type {Number}
     */
    this._state = 0;

    // Create a grid HighlightLayer for this Ruler
    canvas.grid.addHighlightLayer(this.name);
  }

  /* -------------------------------------------- */

  /**
   * Is the Ruler being actively used to measure distance?
   * @return {Boolean}
   */
  get active() {
    return this.waypoints.length > 0;
  }

  /* -------------------------------------------- */

  /**
   * Measure the distance between two points and render the ruler UI to illustrate it
   * @param destination {PIXI.Point}  The destination point to which to measure
   */
  measure(destination) {
    const dest = new PIXI.Point(...canvas.grid.getCenter(destination.x, destination.y)),
          waypoints = this.waypoints.concat([dest]),
          r = this.ruler;
    this.destination = dest;

    // Get grid highlight layer
    const hlt = canvas.grid.highlightLayers[this.name];
    hlt.clear();
    r.clear();

    // Track some measurement data
    let isMulti = waypoints.length > 2;
    let totalDistance = 0;
    let units = canvas.scene.data.gridUnits;

    // Iterate over waypoints
    for ( let [i, dest] of waypoints.slice(1).entries() ) {
      let origin = waypoints[i],
          label = this.labels.children[i];

      // Compute distance between the two points and bail out if we have not measured far enough yet
      let ray = new Ray(origin, dest);
      if ( ray.distance < (0.2 * canvas.grid.size)) {
        if ( label ) label.visible = false;
        continue;
      }

      // Compute additional Ray data
      let distance = Math.round(canvas.grid.measureDistance(ray.A, ray.B) * 100) / 100;
      totalDistance += distance;

      // Draw line segment
      r.lineStyle(6, 0x000000, 0.5).moveTo(origin.x, origin.y).lineTo(dest.x, dest.y)
       .lineStyle(4, this.color, 0.25).moveTo(origin.x, origin.y).lineTo(dest.x, dest.y);

      // Draw the distance label just after the endpoint of the segment
      if ( label ) {

        // Construct label text
        let isLast = i === waypoints.length - 2,
            text = `${distance} ${units}`;
        if ( isMulti && isLast ) {
          totalDistance = Math.round(totalDistance * 100) / 100;
          text += ` [${totalDistance} ${units}]`;
        }
        label.text = text;

        // Toggle label opacity
        label.alpha = isLast ? 1.0 : 0.5;
        label.visible = true;

        // Set label position
        let labelPosition = ray.project((ray.distance + 50) / ray.distance);
        label.position.set(labelPosition.x, labelPosition.y);
      }

      // Highlight grid positions
      this._highlightMeasurement(ray);
    }

    // Draw endpoints
    for ( let point of waypoints ) {
      r.lineStyle(2, 0x000000, 0.5).beginFill(this.color, 0.25).drawCircle(point.x, point.y, 8);
    }
  }

  /* -------------------------------------------- */

  /**
   * Highlight the measurement required to complete the move in the minimum number of discrete spaces
   * @param {Ray} ray
   * @private
   */
  _highlightMeasurement(ray) {
    let nMax = Math.max(Math.floor(ray.distance / (1.41 * Math.min(canvas.grid.w, canvas.grid.h))), 1),
        tMax = Array.fromRange(nMax+1).map(t => t / nMax);

    // Track prior position
    let prior = null;

    // Iterate over ray portions
    for ( let [i, t] of tMax.entries() ) {
      let {x, y} = ray.project(t);

      // Get grid position
      let [x0, y0] = (i === 0) ? [null, null] : prior;
      let [x1, y1] = canvas.grid.grid.getGridPositionFromPixels(x, y);
      if ( x0 === x1 && y0 === y1 ) continue;

      // Highlight the grid position
      let [xg, yg] = canvas.grid.grid.getPixelsFromGridPosition(x1, y1);
      canvas.grid.highlightPosition(this.name, {x: xg, y: yg, color: this.color});
      //canvas.grid.highlightLayers[this.name].beginFill(0xFF0000, 1.0).drawCircle(x, y, 10);

      // Skip the first one
      prior = [x1, y1];
      if ( i === 0 ) continue;

      // If the positions are not neighbors, also highlight their halfway point
      if ( !canvas.grid.isNeighbor(x0, y0, x1, y1) ) {
        let th = tMax[i - 1] + (0.5 / nMax);
        let {x, y} = ray.project(th);
        let [x1h, y1h] = canvas.grid.grid.getGridPositionFromPixels(x, y);
        let [xgh, ygh] = canvas.grid.grid.getPixelsFromGridPosition(x1h, y1h);
        canvas.grid.highlightPosition(this.name, {x: xgh, y: ygh, color: this.color});
        //canvas.grid.highlightLayers[this.name].beginFill(0x00FF00, 1.0).drawCircle(x, y, 10);
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Determine whether a SPACE keypress event entails a legal token movement along a measured ruler
   *
   * @return {Boolean}    An indicator for whether a token was successfully moved or not. If True the event should be
   *                      prevented from propagating further, if False it should move on to other handlers.
   */
  async moveToken() {
    let wasPaused = game.paused;
    if ( wasPaused && !game.user.isGM ) return false;
    if ( !this.visible || !this.destination ) return false;
    const token = this._getMovementToken();
    if ( !token ) return;

    // Get the movement rays and check collision along each Ray
    const rays = this._getRaysFromWaypoints(this.waypoints, this.destination);
    let hasCollision = rays.some(r => canvas.walls.checkCollision(r));
    if ( hasCollision ) {
      ui.notifications.error("This movement path collides with at least one wall!");
      return;
    }

    // Execute the movement path
    this._state = 0;
    token._noAnimate = true;
    for ( let r of rays ) {
      if ( !wasPaused && game.paused ) break;
      let path = Ray.fromArrays(canvas.grid.getTopLeft(r.A.x, r.A.y), canvas.grid.getTopLeft(r.B.x, r.B.y));
      await token.update(canvas.scene.id, path.B);
      token.position.set(path.A.x, path.A.y);
      await token.animateMovement(path);
    }
    token._noAnimate = false;

    // Once all animations are complete we can clear the ruler
    this.clear();
    game.socket.emit('cursor', game.user._id, {ruler: null});
  }

  /* -------------------------------------------- */

  /**
   * A helper method to return an Array of Ray objects constructed from the waypoints of the measurement
   * @param {Array} waypoints           An Array of waypoint {x, y} Objects
   * @param {Object} destination        An optional destination point to append to the existing waypoints
   * @return {Array.<Ray>}              An Array of Ray objects which represent the segemnts of the waypoint path
   * @private
   */
  _getRaysFromWaypoints(waypoints, destination) {
    if ( destination ) waypoints = waypoints.concat([destination]);
    return waypoints.slice(1).map((wp, i) => {
      return new Ray(waypoints[i], wp);
    });
  }

  /* -------------------------------------------- */

  /**
   * Acquire a Token, if any, which is eligible to perform a movement based on the starting point of the Ruler
   * @return {Token}
   * @private
   */
  _getMovementToken() {
    let [x0, y0] = Object.values(this.waypoints[0]);
    const tokens = new Set(canvas.tokens.controlled);
    if ( game.user.character ) tokens.add(...game.user.character.getActiveTokens());
    return new Array(...tokens).find(t => {
      let pos = new PIXI.Rectangle(t.x, t.y, t.w, t.h);
      return pos.contains(x0, y0);
    });
  }

  /* -------------------------------------------- */

  /**
   * Clear display of the current Ruler
   */
  clear() {
    this._state = 0;
    this.waypoints = [];
    this.ruler.clear();
    this.labels.removeChildren().forEach(c => c.destroy());
    canvas.grid.clearHighlightLayer(this.name);
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * General handler for mouse-down events which should affect the Ruler in some way
   * This event delegates to more specialized handlers depending on where we are in the measurement workflow
   * @param event
   * @private
   */
  _onMouseDown(event) {
    const oe = event.data.originalEvent;
    const isCtrl = oe.ctrlKey || oe.metaKey;
    if ( this._state === 2 && isCtrl ) this._onAddWaypoint(event);
    else this._onStartMeasurement(event);
  }

  /* -------------------------------------------- */

  /**
   * General handler for mouse-move events which affect Ruler measurement
   * This event delegates to more specialized handlers depending on where we are in the measurement workflow
   * @param event
   * @private
   */
  _onMouseMove(event) {

    // Extract event data
    const mt = event._measureTime || 0;
    const {origin, destination} = event.data;

    // Check measurement distance
    let dx = destination.x - origin.x,
        dy = destination.y - origin.y;
    if ( Math.hypot(dy, dx) >= canvas.dimensions.size / 2 ) {

      // Hide any existing Token HUD
      canvas.hud.token.clear();
      delete event.data.hudState;

      // Draw measurement updates
      if ( Date.now() - mt > 50 ) {
        this.measure(destination);
        event._measureTime = Date.now();
        this._state = 2;
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle the beginning of a new Ruler measurement event
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onStartMeasurement(event) {
    this.clear();
    this._state = 1;
    this._onAddWaypoint(event);
  }

  /* -------------------------------------------- */

  /**
   * Handle the addition of a new waypoint in the Ruler measurement path
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onAddWaypoint(event) {
    let cursor = event.data.getLocalPosition(canvas.grid),
        waypoint = new PIXI.Point(...canvas.grid.getCenter(cursor.x, cursor.y));
    this.waypoints.push(waypoint);
    this.labels.addChild(new PIXI.Text("", CONFIG.tokenTextStyle));
  }

  /* -------------------------------------------- */

  /**
   * Handle the removal of a waypoint in the Ruler measurement path
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onCancelWaypoint(event) {
    if ( this.waypoints.length > 1 ) {
      this.waypoints.pop();
      this.labels.removeChild(this.labels.children.pop());
      this.measure(event.data.getLocalPosition(canvas.grid));
    }
    else this._onEndMeasurement(event);
  }

  /* -------------------------------------------- */

  /**
   * Handle the conclusion of a Ruler measurement workflow
   * @param {PIXI.interaction.InteractionEvent} event
   * @private
   */
  _onEndMeasurement(event) {
    this.clear();
    game.socket.emit('cursor', game.user._id, {ruler: null});
  }

  /* -------------------------------------------- */
  /*  Saving and Loading
  /* -------------------------------------------- */

  toJSON() {
    return {
      class: "Ruler",
      name: `Ruler.${game.user._id}`,
      waypoints: this.waypoints,
      destination: this.destination,
      _state: this._state
    }
  }

  /* -------------------------------------------- */

  /**
   * Update a Ruler instance using data provided through the cursor activity socket
   * @param {Object} data   Ruler data with which to update the display
   */
  update(data) {
    if ( data.class !== "Ruler" ) throw new Error("Unable to recreate Ruler instance from provided data");

    // Populate data
    this.waypoints = data.waypoints;
    this.destination = data.destination;
    this._state = data._state;

    // Ensure labels are created
    for ( let i=0; i<this.waypoints.length - this.labels.children.length; i++) {
      this.labels.addChild(new PIXI.Text("", CONFIG.tokenTextStyle));
    }

    // Measure current distance
    if ( data.destination ) this.measure(data.destination);
  }
}

/**
 * I don't know what this will do yet
 */
class SpecialEffect {
  constructor(parent, options) {
    this.parent = parent;
    this.options = mergeObject(this.constructor.effectOptions, options, {insertKeys: false});
    this.emitters = this.getParticleEmitters();

    /**
     * Use this flag as a way to pass a stop signal into the animation frame
     * @type {Boolean}
     */
    this._stop = null;
  }

  /* -------------------------------------------- */

  static get label() {
    return "Special Effect";
  }

  /* -------------------------------------------- */

  static get effectOptions() {
    return {
      density: {
        label: "Particle Density",
        type: this.OPTION_TYPES.RANGE,
        value: 0.5,
        min: 0.1,
        max: 5,
        step: 0.1
      }
    };
  }

  /* -------------------------------------------- */

  getParticleEmitters() {
    return [];
  }

  /* -------------------------------------------- */

  play(duration) {
    this._stop = null;
    for ( let e of this.emitters ) {
      this._startEmitter(e);
    }
  }

  /* -------------------------------------------- */

  stop() {
    this._stop = true;
    for ( let e of this.emitters ) {
      e.emit = false;
      e.cleanup();
    }
  }

  /* -------------------------------------------- */

  _startEmitter(emitter) {

    // Calculate the current time
    let elapsed = Date.now();

    // Update function every frame
    let update = () => {

      // Maybe stop
      if ( this._stop) return;

      // Update the next frame
      requestAnimationFrame(update);

      // Track the number of elapsed seconds since the previous frame update
      let now = Date.now();
      emitter.update((now - elapsed) * 0.001);
      elapsed = now;
    };

    // Start emitting
    emitter.emit = true;
    update();
	}
}

SpecialEffect.OPTION_TYPES = {
  VALUE: 1,
  CHECKBOX: 2,
  RANGE: 3,
  SELECT: 4
};

SpecialEffect.DEFAULT_CONFIG = {
	"maxSpeed": 0,
	"noRotation": false,
	"blendMode": "normal",
	"emitterLifetime": -1,
	"pos": {
		"x": 0,
		"y": 0
	},
	"spawnType": "rect"
};
/**
 * A special full-screen weather effect which uses one Emitters to render gently falling autumn leaves
 * @type {SpecialEffect}
 */
class AutumnLeavesWeatherEffect extends SpecialEffect {
	static get label() {
    return "Autumn Leaves";
  }

  /* -------------------------------------------- */

	static get effectOptions() {
		const options = super.effectOptions;
		options.density.min = 0.05;
		options.density.value = 0.25;
		options.density.max = 1;
		options.density.step = 0.05;
		return options;
	}

  /* -------------------------------------------- */

  getParticleEmitters() {
		return [this._getLeafEmitter(this.parent)];
  }

  /* -------------------------------------------- */

  _getLeafEmitter(parent) {
  	const d = canvas.dimensions;
		const p = (d.width / d.size) * (d.height / d.size) * this.options.density.value;
    const config = mergeObject(this.constructor.LEAF_CONFIG, {
      spawnRect: {
        x: d.paddingX,
        y: d.paddingY,
        w: d.sceneWidth,
        h: d.sceneHeight
      },
			maxParticles: p,
			frequency: this.constructor.LEAF_CONFIG.lifetime.min / p
    }, {inplace: false});
    const sprites = Array.fromRange(6).map(n => `ui/particles/leaf${n+1}.png`);
    return new PIXI.particles.Emitter(parent, sprites, config);
  }
}

// Configure the Rain particle
AutumnLeavesWeatherEffect.LEAF_CONFIG = mergeObject(SpecialEffect.DEFAULT_CONFIG, {
	"alpha": {
		"start": 0.9,
		"end": 0.5
	},
	"scale": {
		"start": 0.2,
		"end": 0.4,
		"minimumScaleMultiplier": 0.5
	},
	"speed": {
		"start": 20,
		"end": 60,
		"minimumSpeedMultiplier": 0.6
	},
	"startRotation": {
		"min": 0,
		"max": 365
	},
	"rotation": 180,
	"rotationSpeed": {
		"min": 100,
		"max": 200
	},
	"lifetime": {
		"min": 10,
		"max": 10
	},
}, {inplace: false});
CONFIG.weatherEffects.autumn = AutumnLeavesWeatherEffect;

/**
 * A special full-screen weather effect which uses two Emitters to render drops and splashes
 * @type {SpecialEffect}
 */
class RainWeatherEffect extends SpecialEffect {
	static get label() {
    return "Rain";
  }

  /* -------------------------------------------- */

  getParticleEmitters() {
		return [
		  this._getRainEmitter(this.parent),
      this._getSplashEmitter(this.parent)
    ];
  }

  /* -------------------------------------------- */

  _getRainEmitter(parent) {
  	const d = canvas.dimensions;
		const p = (d.width / d.size) * (d.height / d.size) * this.options.density.value;
    const config = mergeObject(this.constructor.RAIN_CONFIG, {
      spawnRect: {
        x: -0.05 * d.width,
        y: -0.10 * d.height,
        w: d.width,
        h: 0.8 * d.height
      },
			maxParticles: p,
			frequency: 1 / p
    }, {inplace: false});
    return new PIXI.particles.Emitter(parent, ["ui/particles/rain.png"], config);
  }

  /* -------------------------------------------- */

  _getSplashEmitter(parent) {
  	const d = canvas.dimensions;
		const p = (d.width / d.size) * (d.height / d.size) * this.options.density.value;
    const config = mergeObject(this.constructor.SPLASH_CONFIG, {
			spawnRect: {
				x: 0,
				y: 0.25 * d.height,
				w: d.width,
				h: 0.75 * d.height
			},
			maxParticles: 0.5 * p,
			frequency: 2 / p
    }, {inplace: false});
    return new PIXI.particles.Emitter(parent, ["ui/particles/drop.png"], config);
  }
}

// Configure the Rain particle
RainWeatherEffect.RAIN_CONFIG = mergeObject(SpecialEffect.DEFAULT_CONFIG, {
	"alpha": {
		"start": 0.7,
		"end": 0.1
	},
	"scale": {
		"start": 1.0,
		"end": 1.0,
		"minimumScaleMultiplier": 0.8
	},
	"speed": {
		"start": 3500,
		"end": 3500,
		"minimumSpeedMultiplier": 0.8
	},
	"startRotation": {
		"min": 75,
		"max": 75
	},
	"rotation": 90,
	"rotationSpeed": {
		"min": 0,
		"max": 0
	},
	"lifetime": {
		"min": 0.5,
		"max": 0.5
	}
}, {inplace: false});

// Configure the Splash particle
RainWeatherEffect.SPLASH_CONFIG = mergeObject(SpecialEffect.DEFAULT_CONFIG, {
	"alpha": {
		"start": 1,
		"end": 1
	},
	"scale": {
		"start": 0.6,
		"end": 0.6,
		"minimumScaleMultiplier": 0.8
	},
	"speed": {
		"start": 0,
		"end": 0
	},
	"startRotation": {
		"min": -90,
		"max": -90
	},
	"noRotation": true,
	"lifetime": {
		"min": 0.5,
		"max": 0.5
	}
}, {inplace: false});
CONFIG.weatherEffects.rain = RainWeatherEffect;

/**
 * A special full-screen weather effect which uses one Emitters to render snowflakes
 * @type {SpecialEffect}
 */
class SnowWeatherEffect extends SpecialEffect {
  static get label() {
    return "Snow";
  }

  /* -------------------------------------------- */

  getParticleEmitters() {
		return [this._getSnowEmitter(this.parent)];
  }

  /* -------------------------------------------- */

  _getSnowEmitter(parent) {
  	const d = canvas.dimensions;
		const p = (d.width / d.size) * (d.height / d.size) * this.options.density.value;
    const config = mergeObject(this.constructor.SNOW_CONFIG, {
      spawnRect: {
        x: 0,
        y: -0.10 * d.height,
        w: d.width,
        h: d.height
      },
			maxParticles: p,
			frequency: 1 / p
    }, {inplace: false});
    return new PIXI.particles.Emitter(parent, ["ui/particles/snow.png"], config);
  }
}

// Configure the Rain particle
SnowWeatherEffect.SNOW_CONFIG = mergeObject(SpecialEffect.DEFAULT_CONFIG, {
	"alpha": {
		"start": 0.9,
		"end": 0.5
	},
	"scale": {
		"start": 0.2,
		"end": 0.4,
		"minimumScaleMultiplier": 0.5
	},
	"speed": {
		"start": 190,
		"end": 210,
		"minimumSpeedMultiplier": 0.6
	},
	"startRotation": {
		"min": 50,
		"max": 75
	},
	"rotation": 90,
	"rotationSpeed": {
		"min": 0,
		"max": 200
	},
	"lifetime": {
		"min": 4,
		"max": 4
	},
}, {inplace: false});
CONFIG.weatherEffects.snow = SnowWeatherEffect;

/**
 * The base grid class.
 * This double-dips to implement the "gridless" option
 */
class BaseGrid extends PIXI.Container {
  constructor(options) {
    super();
    this.options = options;

    /**
     * Grid Unit Width
     */
    this.w = canvas.dimensions.size;

    /**
     * Grid Unit Height
     */
    this.h = canvas.dimensions.size;

    /**
     * Highlight active grid spaces
     * @type {Object}
     */
    this.highlight = this.addChild(new PIXI.Container());
  }

  /* -------------------------------------------- */

  draw() {
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Highlight a grid position for a certain coordinates
   * No highlighting behavior is supported for Gridless types
   */
  highlightGridPosition(layer , options) {
    return false;
  }

  /* -------------------------------------------- */
  /*  Grid Measurement Methods
  /* -------------------------------------------- */

  /**
   * Given a pair of coordinates (x, y) - return the top-left of the grid square which contains that point
   * @return {Array}    An Array [x, y] of the top-left coordinate of the square which contains (x, y)
   */
  getTopLeft(x, y) {
    const s = canvas.dimensions.size;
    return [x, y].map(c => Math.round(c - (s / 2)));
  }

  /* -------------------------------------------- */

  /**
   * Given a pair of coordinates (x, y), return the center of the grid square which contains that point
   * @return {Array}    An Array [x, y] of the central point of the square which contains (x, y)
   */
  getCenter(x, y) {
    return [x, y];
  }

  /* -------------------------------------------- */

  /**
   * Given a pair of coordinates (x1,y1), return the grid coordinates (x2,y2) which represent the snapped position
   * Under a "gridless" system, every pixel position is a valid snapping position
   *
   * @param {Number} x          The exact target location x
   * @param {Number} y          The exact target location y
   * @param {Number} interval   An interval of grid spaces at which to snap, default is 1
   *
   * @return {{x, y}}           An object containing the coordinates of the snapped location
   */
  getSnappedPosition(x, y, interval=1) {
    return { x: Math.round(x),  y: Math.round(y) }
  }

  /* -------------------------------------------- */


  /**
   * Given a pair of pixel coordinates, return the grid position as an Array
   * @param {Number} x    The x-coordinate pixel position
   * @param {Number} y    The y-coordinate pixel position
   * @return {{x,y}}      An array representing the position in grid units
   */
  getGridPositionFromPixels(x, y) {
    return [x, y].map(Math.round);
  }

  /* -------------------------------------------- */

  /**
   * Given a pair of grid coordiantes, return the pixel position as an Array
   * @param {Number} x    The x-coordinate grid position
   * @param {Number} y    The y-coordinate grid position
   * @return {{x,y}}      An array representing the position in pixels
   */
  getPixelsFromGridPosition(x, y) {
    return [x, y].map(Math.round);
  }

  /* -------------------------------------------- */

  /**
   * Shift a pixel position [x,y] by some number of grid units dx and dy
   * @param {Number} x    The starting x-coordinate in pixels
   * @param {Number} y    The starting y-coordinate in pixels
   * @param {Number} dx   The number of grid positions to shift horizontally
   * @param {Number} dy   The number of grid positions to shift vertically
   */
  shiftPosition(x, y, dx, dy) {
    let s = canvas.dimensions.size;
    return [x + (dx*s), y + (dy*s)];
  }

  /* -------------------------------------------- */

  /**
   * Measure the distance between two pixel coordinates
   * @param p0 {Object}     The origin coordinate {x, y}
   * @param p1 {Object}     The destination coordinate {x, y}
   */
  measureDistance(p0, p1) {
    let dx = p1.x - p0.x,
        dy = p1.y - p0.y,
        dist = Math.hypot(dx, dy);
    return (dist / canvas.dimensions.size) * canvas.dimensions.distance;
  }

  /* -------------------------------------------- */

  /**
   * Get the grid row and column positions which are neighbors of a certain position
   * @param {Number} row  The grid row coordinate against which to test for neighbors
   * @param {Number} col  The grid column coordinate against which to test for neighbors
   * @return {Array}      An array of grid positions which are neighbors of the row and column
   */
  getNeighbors(row, col) {
    return [];
  }
}
/**
 * Construct a hexagonal grid
 * @type {BaseGrid}
 */
class HexagonalGrid extends BaseGrid {
  constructor(options) {
    super(options);
    this.columns = !!this.options.columns;
    this.even = !!this.options.even;

    // Grid width and height
    let s = canvas.dimensions.size;
    if ( this.columns ) {
      this.w = s;
      this.h = Math.round(Math.sqrt(3) * 0.5 * s);
    } else {
      this.w = Math.round(Math.sqrt(3) * 0.5 * s);
      this.h = s;
    }
  }

  static get pointyHexPoints() {
    return [[0, 0.25], [0.5, 0], [1, 0.25], [1, 0.75], [0.5, 1], [0, 0.75], [0, 0.25]];
  }

  static get flatHexPoints() {
    return [[0, 0.5], [0.25, 0], [0.75, 0], [1, 0.5], [0.75, 1], [0.25, 1], [0, 0.5]];
  }

  /* -------------------------------------------- */
  /*  Grid Rendering
  /* -------------------------------------------- */

  draw() {
    if ( this.alpha === 0 ) return this;
    this.addChild(this._drawGrid());
    return this;
  }

  /* -------------------------------------------- */

  _drawGrid() {
    let { color, alpha, columns } = this.options;
    let ncols = Math.floor(canvas.dimensions.width / this.w),
        nrows = Math.ceil(canvas.dimensions.height / this.h);

    // Draw Grid graphic
    let grid = new PIXI.Graphics();
        grid.lineStyle(1, color, alpha);

    // Draw hex rows
    if ( columns ) this._drawColumns(grid, nrows, ncols);
    else this._drawRows(grid, nrows, ncols);
    return grid;
  }

  /* -------------------------------------------- */

  _drawRows(grid, nrows, ncols) {
    let ox, oy;
    let shift = this.even ? 0 : 1;
    nrows /= 0.75;
    for ( let r=0; r<nrows; r++ ) {
      ox = (r % 2) === shift ? 0 : -0.5;
      oy = 0;
      for ( let c=0; c<ncols; c++ ) {
        this._drawPointyHex(grid, this.w, this.h, this.w*(c+ox), this.h*(r+oy)*0.75);
      }
    }
  }

  /* -------------------------------------------- */

  _drawPointyHex(grid, w, h, ox, oy) {
    const points = this.constructor.pointyHexPoints;

    // Start from the initial point
    let p0 = points.shift();
    grid.moveTo(ox+(w*p0[0]), oy+(h*p0[1]));

    // Draw lines
    for ( let p of points ) {
      let x = ox + (w*p[0]),
          y = oy + (h*p[1]);
      grid.lineTo(x, y);
    }
  }

  /* -------------------------------------------- */

  _drawColumns(grid, nrows, ncols) {
    let ox, oy;
    let shift = this.even ? 0 : 1;
    ncols /= 0.75;
    for ( let c=0; c<ncols; c++ ) {
      ox = 0;
      oy = (c % 2) === shift ? 0 : -0.5;
      for ( let r=0; r<nrows; r++ ) {
        this._drawFlatHex(grid, this.w, this.h, this.w*(c+ox)*0.75, this.h*(r+oy));
      }
    }
  }

  /* -------------------------------------------- */

  _drawFlatHex(grid, w, h, ox, oy) {
    const points = this.constructor.flatHexPoints;

    // Start from the initial point
    let p0 = points.shift();
    grid.moveTo(ox+(w*p0[0]), oy+(h*p0[1]));

    // Draw lines
    for ( let p of points ) {
      let x = ox + (w*p[0]),
          y = oy + (h*p[1]);
      grid.lineTo(x, y);
    }
  }

  /* -------------------------------------------- */
  /*  Grid Measurement Methods
  /* -------------------------------------------- */

  /**
   * Given a pair of pixel coordinates, return the grid position as an Array
   * @param {Number} x    The x-coordinate pixel position
   * @param {Number} y    The y-coordinate pixel position
   * @return {Array}      An array representing the position in grid units, [row,col]
   */
  getGridPositionFromPixels(x, y) {
    let row, col;
    if ( this.options.columns ) {
      col = Math.floor(x / (this.w*0.75));
      let isEven = (col+1) % 2 === 0;
      y += ( this.options.even === isEven ) ? (this.h/2) : 0;
      row = Math.floor(y / (this.h));
    } else {
      row = Math.floor(y / (this.h*0.75));
      let isEven = (row+1) % 2 === 0;
      x += ( this.options.even === isEven ) ? (this.w/2) : 0;
      col = Math.floor(x / (this.w));
    }
    return [row, col];
  }

  /* -------------------------------------------- */

  /**
   * Given a pair of grid coordinates, return the pixel position as an Array
   * @param {Number} row    The row coordinate grid position
   * @param {Number} col    The column coordinate grid position
   * @return {Array}        An array representing the position in pixels, [x,y]
   */
  getPixelsFromGridPosition(row, col) {
    let x, y;
    if ( this.options.columns ) {
      x = col * (this.w*0.75);
      y = row * this.h;
      let isEven = (col+1) % 2 === 0;
      y -= ( this.options.even === isEven ) ? (this.h/2) : 0;
    } else {
      y = row * (this.h*0.75);
      x = col * this.w;
      let isEven = (row+1) % 2 === 0;
      x -= ( this.options.even === isEven ) ? (this.w/2) : 0;
    }
    return [x, y];
  }

  /* -------------------------------------------- */

  /**
   * Given a pair of coordinates (x, y) - return the top-left of the grid square which contains that point
   * @return {Array}    An Array [x, y] of the top-left coordinate of the square which contains (x, y)
   */
  getTopLeft(x, y) {
    let [row, col] = this.getGridPositionFromPixels(x,y);
    return this.getPixelsFromGridPosition(row, col);
  }

  /* -------------------------------------------- */

  /**
   * Given a pair of coordinates (x, y), return the center of the grid square which contains that point
   * @return {Array}    An Array [x, y] of the central point of the square which contains (x, y)
   */
  getCenter(x, y) {
    let [x0, y0] = this.getTopLeft(x, y);
    return [x0 + (this.w/2), y0 + (this.h/2)];
  }

  /* -------------------------------------------- */

  /**
   * Given a pair of coordinates (x1,y1), return the grid coordinates (x2,y2) which represent the snapped position
   * Under a "gridless" system, every pixel position is a valid snapping position
   *
   * @param {Number} x          The exact target location x
   * @param {Number} y          The exact target location y
   * @param {Number} interval   An interval of grid spaces at which to snap, default is 1
   *
   * @return {{x, y}}           An object containing the coordinates of the snapped location
   */
  getSnappedPosition(x, y, interval=1) {
    let [x0, y0] = this.getTopLeft(x, y),
        dx = x - x0,
        dy = y - y0;
    let ix = this.w / interval;
    dx = Math.round(dx / ix) * ix;
    let iy = this.h / interval;
    dy = Math.round(dy / iy) * iy;
    return {
      x: x0 + dx,
      y: y0 + dy
    }
  }

  /* -------------------------------------------- */

  /**
   * Shift a pixel position [x,y] by some number of grid units dx and dy
   * @param {Number} x    The starting x-coordinate in pixels
   * @param {Number} y    The starting y-coordinate in pixels
   * @param {Number} dx   The number of grid positions to shift horizontally
   * @param {Number} dy   The number of grid positions to shift vertically
   */
  shiftPosition(x, y, dx, dy) {
    let [row, col] = canvas.grid.grid.getGridPositionFromPixels(x, y);

    // Adjust diagonal moves for offset
    let isDiagonal = (dx !== 0) && (dy !== 0);
    if ( isDiagonal ) {

      // Column orientation
      if ( this.options.columns ) {
        let isEven = ((col+1) % 2 === 0) === this.options.even;
        if ( isEven && (dy > 0)) dy--;
        else if ( !isEven && (dy < 0)) dy++;
      }

      // Row orientation
      else {
        let isEven = ((row + 1) % 2 === 0) === this.options.even;
        if ( isEven && (dx > 0) ) dx--;
        else if ( !isEven && (dx < 0 ) ) dx++;
      }
    }
    return canvas.grid.grid.getPixelsFromGridPosition(row+dy, col+dx);
  }

  /* -------------------------------------------- */
  /*  Grid Highlighting
  /* -------------------------------------------- */

  /**
   * Highlight a grid position for a certain coordinates
   * @param {GridHighlight} layer The highlight layer to use
   * @param {Number} x            The x-coordinate of the highlighted position
   * @param {Number} y            The y-coordinate of the highlighted position
   * @param {Number} color        The hex fill color of the highlight
   * @param {Number} border       The hex border color of the highlight
   * @param {Number} alpha        The opacity of the highlight
   */
  highlightGridPosition(layer , {x, y, color=0x33BBFF, border=null, alpha=0.25}={}) {
    if ( !layer.highlight(x, y) ) return;

    // Draw the highlight
    const points = this.options.columns ? this.constructor.flatHexPoints : this.constructor.pointyHexPoints;
    const coords = points.reduce((arr, p) => {
      arr.push(x + (p[0]*this.w));
      arr.push(y + (p[1]*this.h));
      return arr;
    }, []);
    layer.beginFill(color, alpha);
    if ( border ) layer.lineStyle(2, border, Math.min(alpha*1.5, 1.0));
    layer.drawPolygon(new PIXI.Polygon(coords));
  }

  /* -------------------------------------------- */

  /**
   * Get the grid row and column positions which are neighbors of a certain position
   * @param {Number} row  The grid row coordinate against which to test for neighbors
   * @param {Number} col  The grid column coordinate against which to test for neighbors
   * @return {Array}      An array of grid positions which are neighbors of the row and column
   */
  getNeighbors(row, col) {
    let offsets;

    // Column orientation
    if ( this.options.columns ) {
      let shift = ((col+1) % 2 === 0) === this.options.even;
      if ( shift ) offsets = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 0], [0, -1]];
      else offsets = [[0, -1], [-1, 0], [0, 1], [1, 1], [1, 0], [1, -1]];
    }

    // Row orientation
    else {
      let shift = ((row+1) % 2 === 0) === this.options.even;
      if ( shift ) offsets = [[0, -1], [-1, -1], [-1, 0], [0, 1], [1, 0], [1, -1]];
      else offsets = [[0, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]];
    }
    return offsets.map(o => [row+o[0], col+o[1]]);
  }

  /* -------------------------------------------- */

  /**
   * Measure the distance between two pixel coordinates
   * @param {Object} p0       The origin coordinate {x, y}
   * @param {Object} p1       The destination coordinate {x, y}
   */
  measureDistance(p0, p1) {
    let [r0, c0] = this.getGridPositionFromPixels(p0.x, p0.y),
        [r1, c1] = this.getGridPositionFromPixels(p1.x, p1.y);

    // Use cube conversion to measure distance
    let hex0 = this._offsetToCube(r0, c0),
        hex1 = this._offsetToCube(r1, c1),
        distance = this._cubeDistance(hex0, hex1);
    return distance * canvas.dimensions.distance;
  }

  /* -------------------------------------------- */
  /*  Helper Functions
  /* -------------------------------------------- */

  /**
   * Convert a standard "offset" coordinate of (row, col) into a "cube" coordinate (q, r, s)
   * See https://www.redblobgames.com/grids/hexagons/ for reference
   * Source code available https://www.redblobgames.com/grids/hexagons/codegen/output/lib-functions.js
   * @param {Number} row
   * @param {Number} col
   * @private
   */
  _offsetToCube(row, col) {
    let offset = this.options.even ? 1 : -1;

    // Column orientation
    if ( this.options.columns ) {
      let q = col,
          r = row - (col + offset * (col & 1)) / 2,
          s = 0 - q - r;
      return {q:q, r:r, s:s}
    }

    // Row orientation
    else {
      let r = row,
          q = col - (row + offset * (row & 1)) / 2,
          s = 0 - q - r;
      return {q:q, r:r, s:s}
    }
  }

  /* -------------------------------------------- */

  /**
   * Measure the distance in hexagons between two cube coordinates
   * @private
   */
  _cubeDistance(a, b) {
    let diff = {q: a.q - b.q, r: a.r - b.r, s: a.s - b.s};
    return (Math.abs(diff.q) + Math.abs(diff.r) + Math.abs(diff.s)) / 2;
  }
}

/**
 * A special Graphics class which handles Grid layer highlighting
 * @type {PIXI.Graphics}
 */
class GridHighlight extends PIXI.Graphics {
  constructor(name, ...args) {
    super(...args);

    /**
     * Track the Grid Highlight name
     * @type {String}
     */
    this.name = name;

    /**
     * Track distinct positions which have already been highlighted
     * @type {Set}
     */
    this.positions = new Set();
  }

  /* -------------------------------------------- */

  /**
   * Record a position that is highlighted and return whether or not it should be rendered
   * @param {Number} x    The x-coordinate to highlight
   * @param {Number} y    The y-coordinate to highlight
   * @return {Boolean}    Whether or not to draw the highlight for this location
   */
  highlight(x, y) {
    let key = `${x}.${y}`;
    if ( this.positions.has(key) ) return false;
    this.positions.add(key);
    return true;
  }

  /* -------------------------------------------- */

  /**
   * Extend the Graphics clear logic to also reset the highlighted positions
   * @param args
   */
  clear(...args) {
    super.clear(...args);
    this.positions = new Set();
  }


  /* -------------------------------------------- */

  /**
   * Extend how this Graphics container is destroyed to also remove parent layer references
   * @param args
   */
  destroy(...args) {
    delete canvas.grid.highlightLayers[this.name];
    super.destroy(...args);
  }
}


/**
 * A CanvasLayer responsible for drawing a square grid
 */
class GridLayer extends CanvasLayer {
  constructor() {
    super();

    /**
     * The Grid container
     * @type {PIXI.Container}
     */
    this.grid = null;

    /**
     * The Grid Highlight container
     * @type {PIXI.Container}
     */
    this.highlight = null;

    /**
     * Map named highlight layers
     * @type {{GridHighlight}}
     */
    this.highlightLayers = {};
  }

  /* -------------------------------------------- */

  /**
   * The grid type rendered in this Scene
   * @type {String}
   */
  get type() {
    return canvas.scene.data.gridType;
  }

  /**
   * A convenient reference to the pixel grid size used throughout this layer
   * @type {Number}
   */
  get size() {
    return canvas.dimensions.size;
  }

  /**
   * Get grid unit width
   */
  get w() {
    return this.grid.w;
  }

  /**
   * Get grid unit height
   */
  get h() {
    return this.grid.h;
  }

  /* -------------------------------------------- */

  /**
   * Draw square grid lines
   */
  draw() {
    super.draw();

    // Get grid data
    const gt = this.type;

    // Grid configuration
    let grid;
    let gridOptions = {
      dimensions: canvas.dimensions,
      color: canvas.scene.data.gridColor.replace("#", "0x") || "0x000000",
      alpha: canvas.scene.data.gridAlpha,
      columns: [GRID_TYPES.HEXODDQ, GRID_TYPES.HEXEVENQ].includes(gt),
      even: [GRID_TYPES.HEXEVENR, GRID_TYPES.HEXEVENQ].includes(gt)
    };

    // Gridless
    if ( gt === GRID_TYPES.GRIDLESS ) grid = new BaseGrid(gridOptions);

    // Square grid
    else if ( gt === GRID_TYPES.SQUARE ) grid = new SquareGrid(gridOptions);

    // Hexagonal grid
    else grid = new HexagonalGrid(gridOptions);

    // Draw the highlight layer
    this.highlight = this.addChild(new PIXI.Container());

    // Draw the grid
    this.grid = this.addChild(grid.draw());
    return this;
  }

  /* -------------------------------------------- */

  /**
   * Given a pair of coordinates (x1,y1), return the grid coordinates (x2,y2) which represent the snapped position
   * @param {Number} x          The exact target location x
   * @param {Number} y          The exact target location y
   * @param {Number} interval   An interval of grid spaces at which to snap, default is 1.
   */
  getSnappedPosition(x, y, interval) {
    return this.grid.getSnappedPosition(x, y, interval);
  }

  /* -------------------------------------------- */

  /**
   * Given a pair of coordinates (x, y) - return the top-left of the grid square which contains that point
   * @return {Array}    An Array [x, y] of the top-left coordinate of the square which contains (x, y)
   */
  getTopLeft(x, y) {
    return this.grid.getTopLeft(x, y);
  }

  /* -------------------------------------------- */

  /**
   * Given a pair of coordinates (x, y), return the center of the grid square which contains that point
   * @return {Array}    An Array [x, y] of the central point of the square which contains (x, y)
   */
  getCenter(x, y) {
    return this.grid.getCenter(x, y);
  }

  /* -------------------------------------------- */

  /**
   * Measure the distance between two pixel coordinates
   * @param p0 {Object}     The origin coordinate {x, y}
   * @param p1 {Object}     The destination coordinate {x, y}
   */
  measureDistance(p0, p1) {
    return this.grid.measureDistance(p0, p1);
  }

  /* -------------------------------------------- */
  /*  Grid Highlighting Methods
  /* -------------------------------------------- */

  /**
   * Define a new Highlight graphic
   * @param name
   */
  addHighlightLayer(name) {
    const layer = this.highlightLayers[name];
    if ( !layer || layer._destroyed ) {
      this.highlightLayers[name] = this.highlight.addChild(new GridHighlight(name));
    }
    return this.highlightLayers[name];
  }

  /* -------------------------------------------- */

  /**
   * Clear a specific Highlight graphic
   * @param name
   */
  clearHighlightLayer(name) {
    const layer = this.highlightLayers[name];
    if ( layer ) layer.clear();
  }

  /* -------------------------------------------- */

  /**
   * Destroy a specific Highlight graphic
   * @param name
   */
  destroyHighlightLayer(name) {
    const layer = this.highlightLayers[name];
    this.highlight.removeChild(layer);
    layer.destroy();
  }

  /* -------------------------------------------- */

  highlightPosition(name, options) {
    const layer = this.highlightLayers[name];
    if ( !layer ) return false;
    this.grid.highlightGridPosition(layer, options);
  }

  /* -------------------------------------------- */

  /**
   * Test if a specific row and column position is a neighboring location to another row and column coordinate
   */
  isNeighbor(r0, c0, r1, c1) {
    let neighbors = this.grid.getNeighbors(r0, c0);
    return neighbors.some(n => (n[0] === r1) && (n[1] === c1));
  }
}

/**
 * Construct a square grid container
 * @type {BaseGrid}
 */
class SquareGrid extends BaseGrid {

  /**
   * Draw Square Grid lines
   */
  draw() {
    let { color, alpha } = this.options;
    if ( alpha === 0 ) return this;
    let d = this.options.dimensions;

    // Vertical lines
    let nx = Math.floor(d.width / d.size);
    for (let i = 1; i < nx; i++) {
      let x = i * d.size;
      this.addChild(this._drawLine([x, 0, x, d.height], color , alpha));
    }

    // Horizontal lines
    let ny = Math.ceil(d.height / d.size);
    for (let i = 1; i < ny; i++) {
      let y = i * d.size;
      this.addChild(this._drawLine([0, y, d.width, y], color , alpha));
    }
    return this;
  }

  /* -------------------------------------------- */

  _drawLine(points, lineColor, lineAlpha) {
    let line = new PIXI.Graphics();
    line.lineStyle(1, lineColor, lineAlpha)
        .moveTo(points[0], points[1])
        .lineTo(points[2], points[3]);
    return line;
  }

  /* -------------------------------------------- */
  /*  Grid Measurement Methods
  /* -------------------------------------------- */

  /**
   * Given a pair of coordinates (x, y) - return the top-left of the grid square which contains that point
   * @return {Array}    An Array [x, y] of the top-left coordinate of the square which contains (x, y)
   */
  getTopLeft(x, y) {
    let [x0, y0] = this.getGridPositionFromPixels(x,y);
    return this.getPixelsFromGridPosition(x0, y0);
  }

  /* -------------------------------------------- */

  /**
   * Given a pair of coordinates (x, y), return the center of the grid square which contains that point
   * @return {Array}    An Array [x, y] of the central point of the square which contains (x, y)
   */
  getCenter(x, y) {
    const gs = canvas.dimensions.size;
    return this.getTopLeft(x, y).map(c => c + (gs / 2));
  }

  /* -------------------------------------------- */

  /**
   * Given a pair of pixel coordinates, return the grid position as an Array
   * @param {Number} x    The x-coordinate pixel position
   * @param {Number} y    The y-coordinate pixel position
   * @return {Array}      An array representing the position in grid units, [row,col]
   */
  getGridPositionFromPixels(x, y) {
    let gs = canvas.dimensions.size;
    return [Math.floor(y / gs), Math.floor(x / gs)];
  }

  /* -------------------------------------------- */

  /**
   * Given a pair of grid coordinates, return the pixel position as an Array
   * @param {Number} row    The row coordinate grid position
   * @param {Number} col    The column coordinate grid position
   * @return {Array}        An array representing the position in pixels, [x,y]
   */
  getPixelsFromGridPosition(row, col) {
    let gs = canvas.dimensions.size;
    return [col*gs, row*gs];
  }

  /* -------------------------------------------- */

  /**
   * Given a pair of coordinates (x1,y1), return the grid coordinates (x2,y2) which represent the snapped position
   * @param {Number} x          The exact target location x
   * @param {Number} y          The exact target location y
   * @param {Number} interval   An interval of grid spaces at which to snap, default is 1.
   */
  getSnappedPosition(x, y, interval=1) {
    let [x0, y0] = this._getNearestVertex(x, y),
        dx = 0,
        dy = 0;
    if ( interval !== 1 ) {
      let delta = canvas.dimensions.size / interval;
      dx = Math.round((x - x0) / delta) * delta;
      dy = Math.round((y - y0) / delta) * delta;
    }
    return {
      x: x0 + dx,
      y: y0 + dy
    }
  }

  /* -------------------------------------------- */

  /**
   * Shift a pixel position [x,y] by some number of grid units dx and dy
   * @param {Number} x    The starting x-coordinate in pixels
   * @param {Number} y    The starting y-coordinate in pixels
   * @param {Number} dx   The number of grid positions to shift horizontally
   * @param {Number} dy   The number of grid positions to shift vertically
   */
  shiftPosition(x, y, dx, dy) {
    let [row, col] = canvas.grid.grid.getGridPositionFromPixels(x, y);
    return canvas.grid.grid.getPixelsFromGridPosition(row+dy, col+dx);
  }

  /* -------------------------------------------- */

  _getNearestVertex(x, y) {
    const gs = canvas.dimensions.size;
    return [Math.round(x / gs) * gs, Math.round(y / gs) * gs];
  }

  /* -------------------------------------------- */

  /**
   * Highlight a grid position for a certain coordinates
   * @param {GridHighlight} layer The highlight layer to use
   * @param {Number} x            The x-coordinate of the highlighted position
   * @param {Number} y            The y-coordinate of the highlighted position
   * @param {Number} color        The hex fill color of the highlight
   * @param {Number} border       The hex border color of the highlight
   * @param {Number} alpha        The opacity of the highlight
   */
  highlightGridPosition(layer , {x, y, color=0x33BBFF, border=null, alpha=0.25}={}) {
    if ( !layer.highlight(x, y) ) return;
    let s = canvas.dimensions.size;
    layer.beginFill(color, alpha);
    if ( border ) layer.lineStyle(2, border, Math.min(alpha*1.5, 1.0));
    layer.drawRect(x, y, s, s);
  }

  /* -------------------------------------------- */

  /**
   * Measure the distance between two pixel coordinates
   * @param {Object} p0       The origin coordinate {x, y}
   * @param {Object} p1       The destination coordinate {x, y}
   */
  measureDistance(p0, p1) {
    let gs = canvas.dimensions.size,
        ray = new Ray(p0, p1),
        nx = Math.abs(Math.ceil(ray.dx / gs)),
        ny = Math.abs(Math.ceil(ray.dy / gs));

    // Get the number of straight and diagonal moves
    let nDiagonal = Math.min(nx, ny),
        nStraight = Math.abs(ny - nx);

    // Return linear distance for all moves
    return (nStraight + nDiagonal) * canvas.dimensions.distance;
  }

  /* -------------------------------------------- */

  /**
   * Get the grid row and column positions which are neighbors of a certain position
   * @param {Number} row  The grid row coordinate against which to test for neighbors
   * @param {Number} col  The grid column coordinate against which to test for neighbors
   * @return {Array}      An array of grid positions which are neighbors of the row and column
   */
  getNeighbors(row, col) {
    let offsets = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
    return offsets.map(o => [row+o[0], col+o[1]]);
  }
}
