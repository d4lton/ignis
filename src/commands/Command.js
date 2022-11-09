/**
 * Copyright ©2022 Dana Basken
 */

class Command {

  constructor(ignis) {
    this._ignis = ignis;
  }

  get help() {
    return {
      description: "TODO",
      required: [],
      optional: []
    }
  }

  get command() { return ""; }
  get aliases() { return []; }

  async completer(commandInfo) {
    return [];
  }

  renderHelp() {
    const lines = [];
    lines.push(`${this.help.description}:`);
    const usage = [];
    const args = [];
    let maxArgLength = Number.NEGATIVE_INFINITY;
    usage.push(this.command);
    if (this.help.required?.length) {
      for (const required of this.help.required) {
        usage.push(required.arg);
        args.push(required);
        if (required.arg.length > maxArgLength) { maxArgLength = required.arg.length; }
      }
    }
    if (this.help.optional?.length) {
      for (const optional of this.help.optional) {
        usage.push(`[${optional.arg}]`);
        args.push(optional);
        if (optional.arg.length > maxArgLength) { maxArgLength = optional.arg.length; }
      }
    }
    lines.push("");
    lines.push(`  > ${usage.join(" ")}`);
    if (args.length) {
      lines.push("");
      for (const arg of args) {
        const spaces = maxArgLength - arg.arg.length;

        lines.push(`    ${" ".repeat(spaces)}${arg.arg} - ${arg.description}`);
      }
    }
    return lines.join("\n");
  }

}

module.exports = Command;
