/**
 * Copyright ©2022 Dana Basken
 */

const fs = require("node:fs");
const readline = require("node:readline");
const {spawn, execSync}  = require("node:child_process");
const tty = require("node:tty");
const minimist = require("minimist");
const UserConfig = require("./UserConfig");
const Firebase = require("./firebase/Firebase");
const History = require("./History");
const {Utilities} = require("@d4lton/utilities");

class Ignis {

  _config = new UserConfig("com.basken.ignis");
  _firebases = {};

  constructor(argv) {
    this._argv = argv;
    this._project = this._argv.project || this._config.get("project") || "default";
    this._history = new History(this._config);
  }

  ensureLoggedIn(project) {
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
      const match = line.match(/\$(.+)/);
      if (match) {
        execSync(match[1], {stdio: "inherit", shell: "/bin/sh"});
      } else {
        const args = minimist(line.split(" "), {boolean: true});
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
              case "use":
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
      }
      this.prompt(input);
    });
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
    console.log("Dump the contents of a document or file (optionally redirecting):");
    console.log("");
    console.log("  > cat <path> [> <path>] [--merge] [--parse] [--stringify] [--pretty]");
    console.log("");
    console.log("Copying one document to another:");
    console.log("");
    console.log("  > cp <path> <path> [--merge]");
    console.log("");
    console.log("Listing documents or collections:");
    console.log("");
    console.log("  > ls <path> [--out=<filename>]");
    console.log("");
    console.log("Switch the current project:");
    console.log("");
    console.log("  > use [<project-id>]");
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
        this.login(this._project);
      } else {
        console.log(`Could not find file ${args.file}.`);
      }
    } else if (args.env) {
      console.log("Not yet implemented.");
    } else {
      await this.handleHelpCommand(args);
    }
  }

  parseCatCommand(args) {
    let result = {valid: false};
    const line = args._.join(" ");
    const match = line.match(/\s*cat\s+(.+)\s*>\s*(.+)\s*/);
    if (match) {
      const path1 = match[1].trim();
      const path2 = match[2].trim();
      const path1IsFile = fs.existsSync(path1);
      const path2IsFile = fs.existsSync(path2);
      if (path1IsFile && path2IsFile) { return result; }
      result = {valid: true, transfer: true, source: {file: path1IsFile, path: path1}, destination: {file: path2IsFile, path: path2}};
      if (!path1IsFile && !path2IsFile) { result.destination.file = true; }
    } else {
      const match = line.match(/\s*cat\s+(.+)\s*/)
      if (match) {
        const path = match[1];
        const pathIsFile = fs.existsSync(path);
        if (pathIsFile) {
          result = {valid: true, transfer: false, source: {file: true, path: path}};
        } else {
          result = {valid: true, transfer: false, source: {file: false, path: path}};
        }
      }
    }
    return result;
  }

  async handleCatCommand(args) {
    const command = this.parseCatCommand(args);
    if (!command.valid) { return this.handleHelpCommand(args); }
    let data;
    if (command.source.file) {
      data = fs.readFileSync(command.source.path).toString();
    } else {
      const projectPathInfo = this.getProjectPathInfo(command.source.path);
      data = await projectPathInfo.firebase.firestore.get(projectPathInfo.path);
    }
    if (args.parse) { data = JSON.parse(data); }
    if (args.stringify) { data = JSON.stringify(data); }
    data = args.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    if (command.transfer) {
      if (command.destination.file) {
        fs.writeFileSync(command.destination.path, data);
      } else {
        const projectPathInfo = this.getProjectPathInfo(command.destination.path);
        if (typeof data === "string") { data = JSON.parse(data); }
        await projectPathInfo.firebase.firestore.put(projectPathInfo.path, data, args.merge);
      }
    } else {
      console.log(data);
    }
  }

  async handleCpCommand(args) {
    if (args._.length === 3) {
      const projectPathSourceInfo = this.getProjectPathInfo(args._[1]);
      const projectPathDestinationInfo = this.getProjectPathInfo(args._[2]);
      const data = await projectPathSourceInfo.firebase.firestore.get(projectPathSourceInfo.path);
      if (data) {
        await projectPathDestinationInfo.firebase.firestore.put(projectPathDestinationInfo.path, data, args.merge);
      }
    } else {
      await this.handleHelpCommand(args);
    }
  }

  async handleLsCommand(args) {
    if (args._.length === 1 || args._.length === 2) {
      const projectPathInfo = this.getProjectPathInfo(args._[1]);
      const data = await projectPathInfo.firebase.firestore.list(projectPathInfo.path);
      if (args.out) { // TODO: use > like in cat
        fs.writeFileSync(args.out, JSON.stringify(data));
      } else {
        for (const path of data) {
          console.log(path);
        }
      }
    } else {
      await this.handleHelpCommand(args);
    }
  }

  async handleProjectCommand(args) {
    if (args._.length === 1) {
      console.log(`project: ${this._project}`);
    } else if (args._.length === 2) {
      this._project = args._[1];
      this._config.set("project", this._project);
      this.login(this._project);
    } else {
      await this.handleHelpCommand(args);
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

  getProjectPathInfo(path) {
    path = path || "";
    let project = this._project;
    const match = path.match(/^(.+?):(.*)$/);
    if (match) {
      project = match[1];
      path = match[2];
    }
    this.ensureLoggedIn(project);
    const firebase = this._firebases[project];
    if (!firebase) {
      throw new Error(`No login found for project "${project}"`);
    }
    return {project: project, path: path, firebase: firebase};
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
