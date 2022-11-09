/**
 * Copyright ©2022 Dana Basken
 */

const path = require("node:path");
const readline = require("node:readline");
const {execSync}  = require("node:child_process");
const {Utilities} = require("@d4lton/utilities");
const UserConfig = require("./UserConfig");
const Firebase = require("./firebase/Firebase");
const History = require("./History");
const CommandManager = require("./commands/CommandManager");

class Ignis {

  _config = new UserConfig("com.basken.ignis");
  _firebases = {};

  constructor(argv) {
    this._argv = argv;
    this.project = this._argv.project || this._config.get("project") || "default";
    this._history = new History(this._config);
    this._commandManager = new CommandManager(this);
  }

  _ensureLoggedIn(project) {
    if (!this._firebases[project]) {
      this.login(project);
    }
  }

  login(project) {
    try {
      const firebaseConfig = this._config.get("firebase_config");
      if (firebaseConfig) {
        if (!this._firebases[project]) {
          this._firebases[project] = new Firebase(this._config, project);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  prompt(input) {
    const loginIndicator = this._firebases[this._project] ? "*" : "";
    input.setPrompt(`ignis@${this._project}${loginIndicator} > `);
    input.prompt();
  }

  async completer(line, callback) {
    let completions = this.commandManager.commandNames;
    let hits;
    if (Utilities.isEmpty(line)) {
      hits = completions;
    } else {
      const commandInfo = this.commandManager.findCommandInfo(line);
      if (commandInfo) {
        hits = await commandInfo.command.completer(commandInfo);
      } else {
        hits = completions.filter(completion => completion.startsWith(line));
      }
    }
    callback(null, [hits, line]);
  }

  async start() {
    this.login(this._project);
    const input = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: this.completer.bind(this),
      history: this._history.history,
      terminal: true
    });
    this.prompt(input);
    input.on("line", async (line) => {
      this._history.add(line);
      try {
        const match = line.match(/\$(.+)/);
        if (match) {
          execSync(match[1], {stdio: "inherit"});
        } else {
          await this.commandManager.execute(line);
        }
      } catch (error) {
        console.log(error.message);
      }
      this.prompt(input);
    });
  }

  set project(value) {
    this._project = value;
    this._config.set("project", this._project);
    this.login(this._project);
  }

  get project() {
    return this._project;
  }

  get projects() {
    const firebaseConfig = this._config.get("firebase_config", {});
    return Object.keys(firebaseConfig);
  }

  get commandManager() {
    return this._commandManager;
  }

  get config() {
    return this._config;
  }

  getProjectPathInfo(path, reference) {
    path = path || "";
    let project = this._project;
    const match = path.match(/^(.+?):(.*)$/);
    if (match) {
      project = match[1].trim();
      path = match[2].trim();
    }
    this._ensureLoggedIn(project);
    if (reference) {
      if (path === "." || !path) {
        path = reference.path;
      }
    }
    const firebase = this._firebases[project];
    if (!firebase) {
      throw new Error(`No login found for project "${project}"`);
    }
    return {project: project, path: path, firebase: firebase, components: this._getPathComponentsFromFilename(path)};
  }

  _getPathComponentsFromFilename(filename) {
    return {
      path: path.dirname(filename),
      file: path.basename(filename)
    }
  }

  async flush() {
    this._config.set("firebase_config", {});
    for (const firebase of Object.values(this._firebases)) {
      firebase.app.delete();
    }
    this._firebases = {};
    console.log("All projects removed.");
  }

}

module.exports = Ignis;
