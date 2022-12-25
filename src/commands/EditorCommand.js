/**
 * Copyright ©2022 Dana Basken
 */

const which = require("which");
const Command = require("./Command");

class EditorCommand extends Command {

  get help() {
    return {
      description: "Set editor",
      required: [
        {arg: "<editor>", description: "Name of editor"},
      ]
    }
  }

  get command() { return "editor"; }

  async execute(args) {
    if (args._.length === 0) {
      if (this._ignis.editor) {
        console.log(`Current editor path: ${this._ignis.editor}`);
      } else {
        console.log("Editor has not been set");
      }
      return;
    }
    if (args._.length !== 1) { return this.renderHelp(); }
    const editor = args._[0].trim();
    try {
      this._ignis.editor = await which(editor);
    } catch (error) {
      console.log(`Could not find path to ${editor}`);
    }
  }

}

module.exports = EditorCommand;
