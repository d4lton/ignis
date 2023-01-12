/**
 * Copyright ©2022 Dana Basken
 */

const Command = require("./Command");

class ProjectsCommand extends Command {

  get help() {
    return {
      description: "List projects",
      required: [],
      optional: [
        {arg: "--flush", description: "Remove all saved projects"},
        {arg: "--remove <project-id>", description: "Remove a specific project"}
      ]
    }
  }

  get command() { return "projects"; }

  async execute(args) {
    if (args.flush) {
      this._ignis.flush();
      return;
    }
    if (args.remove) {
      if (args._.length !== 1) { return this.renderHelp(); }
      const name = args._[0];
      const project = this._ignis.projects.find(it => it === name);
      if (!project) {
        console.log(`Project "${name}" was not found.`);
      }
      this._ignis.removeProject(name);
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
