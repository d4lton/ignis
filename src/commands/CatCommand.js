/**
 * Copyright ©2022 Dana Basken
 */

const fs = require("node:fs");
const Command = require("./Command");

/**
 * Copyright ©2022 Dana Basken
 */

class CatCommand extends Command {

  async completer(commandInfo) {
    return this.pathCompleter(commandInfo);
  }

  get help() {
    return {
      description: "Dump the contents of a path",
      required: [
        {arg: "<src-path>", description: "Source path (firestore path or local file)"},
      ],
      optional: [
        {arg: "> <dst-path>", description: "Destination path (firestore path or local file)"}
      ],
      notes: [
        "Either <src-path> or <dst-path> can be a firestore path or file, but both"
      ]
    }
  }

  get command() { return "cat"; }

  parseCatCommand(args) {
    let result = {valid: false};
    const line = args._.join(" ");
    const match = line.match(/(.+)\s*>\s*(.+)\s*/);
    if (match) {
      const path1 = match[1].trim();
      const path2 = match[2].trim();
      const path1IsFile = fs.existsSync(path1);
      const path2IsFile = fs.existsSync(path2);
      if (path1IsFile && path2IsFile) { return result; }
      result = {valid: true, transfer: true, source: {file: path1IsFile, path: path1}, destination: {file: path2IsFile, path: path2}};
      if (!path1IsFile && !path2IsFile) { result.destination.file = true; }
    } else {
      const match = line.match(/(.+)\s*/)
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

  async execute(args) {
    const command = this.parseCatCommand(args);
    if (!command.valid) { return this.renderHelp(); }
    let data;
    if (command.source.file) {
      data = fs.readFileSync(command.source.path).toString();
    } else {
      const projectPathInfo = this._ignis.getProjectPathInfo(command.source.path);
      data = await projectPathInfo.firebase.firestore.get(projectPathInfo.path);
    }
    if (args.parse) { data = JSON.parse(data); }
    if (args.stringify) { data = JSON.stringify(data); }
    data = args.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    if (command.transfer) {
      if (command.destination.file) {
        fs.writeFileSync(command.destination.path, data);
      } else {
        const projectPathInfo = this._ignis.getProjectPathInfo(command.destination.path);
        if (typeof data === "string") { data = JSON.parse(data); }
        await projectPathInfo.firebase.firestore.put(projectPathInfo.path, data, args.merge);
      }
    } else {
      console.log(data);
    }
  }

}

module.exports = CatCommand;
