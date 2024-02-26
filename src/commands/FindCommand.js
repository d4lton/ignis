/**
 * Copyright ©2023 Dana Basken
 */

const Command = require("./Command");

class FindCommand extends Command {

  get help() {
    return {
      description: "Find documents",
      required: [
        {arg: "<property> <operand> <value>", description: "Firestore query"},
      ],
      optional: [
        {arg: "--depth", description: "Max depth to search (default 1)"},
        {arg: "--group", description: "Perform a Collection Group query"},
        {arg: "--dump", description: "Dump the contents of each document"},
        {arg: "--pretty", description: "Make the JSON pretty"}
      ]
    }
  }

  get command() { return "find"; }

  async execute(args) {
    if (args._.length !== 3) { return this.renderHelp(); }
    const ora = await import("ora");
    const spinner = ora.default({discardStdin: false});
    const pathInfo = this._ignis.getProjectPathInfo(args.collection || "/");
    spinner.start();
    const documents = await pathInfo.firebase.firestore.find(pathInfo.path, args._, args.depth || 1);
    spinner.stop();
    for (const document of documents) {
      console.log(document.ref.path);
      if (args.dump) {
        let data = document.data();
        data = args.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
        console.log(data);
      }
    }
  }

}

module.exports = FindCommand;
