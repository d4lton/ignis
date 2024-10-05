/**
 * Copyright ©2022 Dana Basken
 */

const path = require("node:path");
const fs = require("node:fs");
const {Utilities} = require("@d4lton/node-common");

class History {

  _history = [];

  constructor(config) {
    this._config = config;
    this._historyFile = path.join(this._config.path, "history");
    if (fs.existsSync(this._historyFile)) {
      this._history = fs.readFileSync(this._historyFile)
        .toString()
        .split("\n")
        .filter(it => it);
      this._history.reverse();
    }
  }

  add(line) {
    if (!Utilities.isEmpty(line)) {
      fs.appendFileSync(this._historyFile, `${line}\n`);
    }
  }

  get history() {
    return this._history;
  }

}

module.exports = History;
