/**
 * Copyright ©2022 Dana Basken
 */

const fs = require("node:fs");
const {execSync}  = require("node:child_process");
const tmp = require("tmp");
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
    const temporaryFile = tmp.fileSync({postfix: ".json"});
    fs.writeFileSync(temporaryFile.name, data);
    execSync(`${editor} ${temporaryFile.name}`, {stdio: "inherit"});
    const updatedData = fs.readFileSync(temporaryFile.name).toString();
    temporaryFile.removeCallback();
    if (data !== updatedData) {
      await projectPathInfo.firebase.firestore.put(projectPathInfo.path, updatedData, args.merge);
    } else {
      console.log("No changes detected.");
    }
  }

}

module.exports = EditCommand;
