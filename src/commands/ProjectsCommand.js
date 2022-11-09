/**
 * Copyright ©2022 Dana Basken
 */

const Command = require("./Command");

class ProjectsCommand extends Command {

  get help() {
    return {
      description: "List projects",
      required: [],
      optional: [{arg: "--flush", description: "Remove all saved projects"}]
    }
  }

  get command() { return "projects"; }

  async execute(args) {
    if (args.flush) {
      this._ignis.flush();
      return;
    }
    if (this._ignis.projects.length) {
      for (const project of this._ignis.projects) {
        console.log(project);
      }
    } else {
      console.log("No projects found.");
    }
  }

}

module.exports = ProjectsCommand;
