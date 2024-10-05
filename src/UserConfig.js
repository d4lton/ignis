/**
 * Copyright ©2022 Dana Basken
 */

const os = require("node:os");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("crypto");
const mkdirp = require("mkdirp");
const {ObjectUtilities} = require("@d4lton/node-common");

class UserConfig {

  static ALGORITHM = "aes-256-ctr";

  _entries = {};

  constructor(appId) {
    this._appId = appId;
    this._encryptionKey = process.env.IGNIS_ENCRYPTION_KEY;
    this._configPath = path.join(os.homedir(), ".config", this._appId);
    this._configFile = path.join(this._configPath, "config.json");
    if (!fs.existsSync(this._configPath)) {
      mkdirp.sync(this._configPath);
    }
    if (fs.existsSync(this._configFile)) {
      this._entries = this._readConfig();
    }
  }

  get(key, defaultValue = undefined) {
    return ObjectUtilities.getDottedKeyValue(key, this._entries, defaultValue);
  }

  set(key, value) {
    ObjectUtilities.setDottedKeyValue(key, value, this._entries);
    this.save();
  }

  save() {
    let text = JSON.stringify(this._entries);
    if (this._encryptionKey) {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(UserConfig.ALGORITHM, this._encryptionKey, iv);
      const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
      text = JSON.stringify({iv: iv.toString("hex"), content: encrypted.toString("hex")});
    }
    fs.writeFileSync(this._configFile, text);
  }

  _readConfig() {
    let text = fs.readFileSync(this._configFile).toString();
    if (this._encryptionKey) {
      const hash = JSON.parse(text);
      if (hash.iv && hash.content) {
        const decipher = crypto.createDecipheriv(UserConfig.ALGORITHM, this._encryptionKey, Buffer.from(hash.iv, "hex"));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, "hex")), decipher.final()]);
        text = decrypted.toString();
      }
    }
    return JSON.parse(text);
  }

  get path() {
    return this._configPath;
  }

}

module.exports = UserConfig;
