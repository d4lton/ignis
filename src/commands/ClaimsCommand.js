/**
 * Copyright ©2022 Dana Basken
 */

const {Utilities} = require("@d4lton/utilities");
const Command = require("./Command");

class ClaimsCommand extends Command {

  get help() {
    return {
      description: "List and set custom claims",
      required: [
        {arg: "<id>", description: "ID of user (email or UID, default email)"},
      ],
      optional: [
        {arg: "<name> <value>", description: "Set claim value"},
        {arg: "--uid", description: "The ID is a UID"},
        {arg: "--pretty", description: "Make the JSON pretty"},
        {arg: "--remove", description: "Remove the claim value"}
      ]
    }
  }

  get command() { return "claims"; }

  async getUser(id, uid) {
    if (uid) {
      return this._ignis.firebase.app.auth().getUser(id);
    } else {
      return this._ignis.firebase.app.auth().getUserByEmail(id);
    }
  }

  async showClaims(user, pretty) {
    const claims = user.customClaims || {};
    if (Utilities.isEmpty(claims)) {
      console.log("No claims.");
    } else {
      if (pretty) {
        console.log(JSON.stringify(claims, null, 2));
      } else {
        console.log(JSON.stringify(claims));
      }
    }
  }

  async execute(args) {
    if (args._.length < 1 || args._.length > 3) { return this.renderHelp(); }
    if (args._.length === 1) {
      await this.showClaims(await this.getUser(args._[0], args.uid), args.pretty);
    } else if (args._.length === 2) {
      if (!args.remove) { return this.renderHelp(); }
      const user = await this.getUser(args._[0], args.uid);
      const claims = user.customClaims || {};
      delete claims[args._[1]];
      await this._ignis.firebase.app.auth().setCustomUserClaims(user.uid, claims);
      await this.showClaims(await this.getUser(args._[0], args.uid), args.pretty);
    } else if (args._.length === 3) {
      const user = await this.getUser(args._[0], args.uid);
      const claims = user.customClaims || {};
      if (args.parse) {
        claims[args._[1]] = JSON.parse(args._[2]);
      } else {
        claims[args._[1]] = args._[2];
      }
      await this._ignis.firebase.app.auth().setCustomUserClaims(user.uid, claims);
      await this.showClaims(await this.getUser(args._[0], args.uid), args.pretty);
    }
  }

}

module.exports = ClaimsCommand;
