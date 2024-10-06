/**
 * Copyright ©2022 Dana Basken
 */

const {Package} = require("@d4lton/node-backend");
const Command = require("./Command");
const Version = require("../Version");

class VersionCommand extends Command {

  get help() {
    return {
      description: "Get ignis version",
      required: [],
      optional: [
        {arg: "--check", description: "Check to see if this is the latest version"},
        {arg: "--auto", description: "Toggle automatically checking to see if this is the latest version"}
      ]
    }
  }

  get command() { return "version"; }

  async execute(args) {
    try {
      const pkg = new Package();
      console.log(`${pkg.name} v${pkg.version}`);
      if (args.reset) { this._ignis.config.set("version.auto_check_ms", 0); }
      if (args.auto) {
        const autoCheck = !this._ignis.config.get("version.auto_check");
        this._ignis.config.set("version.auto_check", autoCheck);
        console.log(`version auto-check is now ${autoCheck}`);
      }
      if (args.check) { await Version.check(); }
    } catch (error) {
      console.log(error.message);
    }
  }

}

module.exports = VersionCommand;
