/**
 * Copyright ©2022 Dana Basken
 */

const fs = require("node:fs");
const {execSync}  = require("node:child_process");
const temp = require("temp");
const Command = require("./Command");

class EditCommand extends Command {

  async completer(commandInfo) {
    return this.pathCompleter(commandInfo);
  }

  get help() {
    return {
      description: "Edit the contents of a path",
      required: [
        {arg: "<src-path>", description: "Source firestore path"},
      ],
      notes: [
        "The actual editor invoked depends on the editor set with the 'editor' command"
      ]
    }
  }

  get command() { return "edit"; }

  async execute(args) {
    const editor = this._ignis.editor;
    if (!editor) {
      console.log("Editor hasn't been set, use 'editor' command first.");
      return;
    }
    const projectPathInfo = this._ignis.getProjectPathInfo(args._[0]);
    let data = await projectPathInfo.firebase.firestore.get(projectPathInfo.path);
    if (!data) { data = {}; }
    data = JSON.stringify(data, null, 2);
    const filename = temp.path({suffix: ".json"});
    fs.writeFileSync(filename, data);
    execSync(`${editor} ${filename}`, {stdio: "inherit"});
    data = fs.readFileSync(filename).toString();
    fs.unlinkSync(filename);
    await projectPathInfo.firebase.firestore.put(projectPathInfo.path, data, args.merge);
  }

}

module.exports = EditCommand;
