/**
 * Copyright ©2022 Dana Basken
 */

const fs = require("node:fs");
const readline = require("node:readline");
const minimist = require("minimist");
const UserConfig = require("./UserConfig");
const Firebase = require("./firebase/Firebase");
const Firestore = require("./firebase/Firestore");
const History = require("./History");
const Util = require("util");
const {Utilities} = require("@d4lton/utilities");

class Ignis {

  _config = new UserConfig("com.basken.ignis");
  _firebases = {};

  constructor(argv) {
    this._argv = argv;
    this._project = this._argv.project || this._config.get("project") || "default";
    this._history = new History(this._config);
  }

  login() {
    try {
      const firebaseConfig = this._config.get("firebase_config");
      this._firebase = undefined;
      this._firestore = undefined;
      if (firebaseConfig) {
        if (!this._firebases[this._project]) {
          this._firebases[this._project] = new Firebase(this._config, this._project);
        }
        this._firebase = this._firebases[this._project];
        this._firestore = new Firestore(this._firebase);
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  prompt(input) {
    const loginIndicator = this._firebase ? "*" : "";
    input.setPrompt(`${this._project}${loginIndicator} > `);
    input.prompt();
  }

  async completer(line, callback) {
    let completions = ["login", "cat", "cp", "ls", "project", "projects"];
    let hits;
    if (Utilities.isEmpty(line)) {
      hits = completions;
    } else {
      hits = completions.filter(completion => completion.startsWith(line));
    }
    callback(null, [hits, line]);
  }

  async start() {
    this.login();
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
      const args = minimist(line.split(" "));
      args._ = args._.filter(it => it);
      try {
        if (args._.length > 0) {
          switch (args._[0]) {
            case "login":
              await this.handleLoginCommand(args);
              break;
            case "cat":
              await this.handleCatCommand(args);
              break;
            case "cp":
              await this.handleCpCommand(args);
              break;
            case "ls":
              await this.handleLsCommand(args);
              break;
            case "project":
              await this.handleProjectCommand(args);
              break;
            case "projects":
              await this.handleProjectsCommand(args);
              break;
            case "help":
            case "?":
              await this.handleHelpCommand(args);
              break;
            case "quit":
              process.exit(0);
              return;
            default:
              console.log(`unknown command: ${args._[0]}`);
              await this.handleHelpCommand(args);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
      this.prompt(input);
    });
  }

  isFirebaseInitialized() {
    if (!this._firebase) {
      console.log("Could not determine Firebase configuration, please set with the 'login' command.");
      return false;
    }
    return true;
  }

  async handleHelpCommand(args) {
    console.log("");
    console.log("Logging into Firebase for the current project:");
    console.log("");
    console.log("  > login [--file=<JSON filename>] [--env=<environment-variable>]");
    console.log("");
    console.log("    The specified filename should be a JSON file with the Firebase authentication.");
    console.log("    The specified environment variable should point to the JSON file.");
    console.log("    One of [file|env] must be specified");
    console.log("");
    console.log("Getting the contents of a document:");
    console.log("");
    console.log("  > cat <collection/document> [--out=<filename>]");
    console.log("");
    console.log("Copying one document to another:");
    console.log("");
    console.log("  > cp <collection/document> <collection/document> [--merge]");
    console.log("");
    console.log("Listing documents in a collection or top-level collections:");
    console.log("");
    console.log("  > ls [<collection>] [--out=<filename>]");
    console.log("");
    console.log("    If <collection> is omitted, top-level collections will be listed.");
    console.log("");
    console.log("Switch the current project:");
    console.log("");
    console.log("  > project [<project-id>]");
    console.log("");
    console.log("List projects:");
    console.log("");
    console.log("  > projects [--flush]");
    console.log("");
  }

  async handleLoginCommand(args) {
    if (args.file) {
      if (fs.existsSync(args.file)) {
        const json = JSON.parse(fs.readFileSync(args.file).toString());
        if (args.project) { this._project = args.project; }
        this._config.set(`firebase_config.${this._project}`, json);
        this.login();
      } else {
        console.log(`Could not find file ${args.file}.`);
      }
    } else if (args.env) {
      console.log("Not yet implemented.");
    } else {
      console.log("usage: login [--file=<JSON filename>] [--env=<environment-variable>]");
    }
  }

  async handleCatCommand(args) {
    if (args._.length === 2) {
      if (!this.isFirebaseInitialized()) { return; }
      const data = await this._firestore.get(args._[1]);
      if (args.out) {
        fs.writeFileSync(args.out, JSON.stringify(data));
      } else {
        console.log(JSON.stringify(data));
      }
    } else {
      console.log("usage: cat <collection/document> [--out=<filename>]")
    }
  }

  async handleCpCommand(args) {
    if (args._.length === 3) {
      if (!this.isFirebaseInitialized()) { return; }
      await this._firestore.copy(args._[1], args._[2], args.merge);
    } else {
      console.log("usage: cp <collection/document> <collection/document> [--merge]")
    }
  }

  async handleLsCommand(args) {
    if (args._.length === 1 || args._.length === 2) {
      if (!this.isFirebaseInitialized()) { return; }
      const data = await this._firestore.list(args._[1]);
      if (args.out) {
        fs.writeFileSync(args.out, JSON.stringify(data));
      } else {
        for (const path of data) {
          console.log(path);
        }
      }
    } else {
      console.log("usage: ls <collection> [--out=<filename>]")
    }
  }

  async handleProjectCommand(args) {
    if (args._.length === 1) {
      console.log(`project: ${this._project}`);
    } else if (args._.length === 2) {
      this._project = args._[1];
      this._config.set("project", this._project);
      this.login();
    } else {
      console.log("usage: project [<project-id>] [--flush]")
    }
  }

  async handleProjectsCommand(args) {
    if (args.flush) {
      await this.flush();
    } else {
      const firebaseConfig = this._config.get("firebase_config", {});
      const projects = Object.keys(firebaseConfig);
      if (projects.length) {
        for (const project of projects) {
          console.log(project);
        }
      } else {
        console.log("No projects found.");
      }
    }
  }

  async flush() {
    this._config.set("firebase_config", {});
    for (const firebase of Object.values(this._firebases)) {
      firebase.app.delete();
    }
    this._firebases = {};
    console.log("All projects removed.");
    this.login();
  }

}

module.exports = Ignis;
