const os = require("node:os");
const fs = require("node:fs");
const path = require("node:path");
const mkdirp = require("mkdirp")
const {ObjectUtilities} = require("@d4lton/utilities");

class UserConfig {

  constructor(key) {
    this._key = key;
    this._configPath = path.join(os.homedir(), ".config", this._key);
    this._configFile = path.join(this._configPath, "config.json");
    if (!fs.existsSync(this._configPath)) {
      mkdirp.sync(this._configPath);
    }
    this._entries = JSON.parse(fs.readFileSync(this._configFile).toString());
  }

  get(key, defaultValue = undefined) {
    return ObjectUtilities.getDottedKeyValue(key, this._entries, defaultValue);
  }

  set(key, value) {
    ObjectUtilities.setDottedKeyValue(key, value, this._entries);
    this.save();
  }

  save() {
    fs.writeFileSync(this._configFile, JSON.stringify(this._entries));
  }

}

module.exports = UserConfig;
