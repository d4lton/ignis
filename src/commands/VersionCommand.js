/**
 * Copyright ©2022 Dana Basken
 */

const fetch = require("node-fetch");
const semver = require("semver");
const {Package} = require("@d4lton/utilities");
const Command = require("./Command");

class VersionCommand extends Command {

  get help() {
    return {
      description: "Get ignis version",
      required: [],
      optional: [{arg: "--check", description: "Check to see if this is the latest version"}]
    }
  }

  get command() { return "version"; }

  async execute(args) {
    try {
      const pkg = new Package();
      console.log(`${pkg.name} v${pkg.version}`);
      if (args.check) {
        const latest = await fetch(`https://registry.npmjs.org/${pkg.name}/latest`).then(it => it.json());
        if (semver.gt(latest.version, pkg.version)) {
          console.log(`There is a newer version of ${pkg.name}: ${latest.version}`);
          console.log(`You can update with: "npm install -g @d4lton/ignis" (exit ignis first)`);
        } else {
          console.log("You are running the latest version");
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

}

module.exports = VersionCommand;
