/**
 * Copyright ©2022 Dana Basken
 */

const Command = require("./Command");

class LinkCommand extends Command {

  static PROVIDER_IDS = ["google.com", "password"]

  get help() {
    return {
      description: "List and set custom claims",
      required: [
        {arg: "<id>", description: "ID of user (email or UID, default email)"},
      ],
      optional: [
        {arg: "<name> <value>", description: "Set claim value"},
        {arg: "--uid", description: "The ID is a UID"}
      ]
    }
  }

  get command() { return "link"; }

  async getUser(id, uid) {
    if (uid) {
      return this._ignis.firebase.app.auth().getUser(id);
    } else {
      return this._ignis.firebase.app.auth().getUserByEmail(id);
    }
  }

  async execute(args) {
    if (args._.length < 1 || args._.length > 2) { return this.renderHelp(); }
    const user = await this.getUser(args._[0]);
    if (args._.length === 1) {
      for (const providerInfo of user.providerData) {
        console.log(`${providerInfo.providerId}`);
      }
    } else if (args._.length === 2) {
      const providerId = args._[1];
      if (!LinkCommand.PROVIDER_IDS.includes(providerId)) {
        console.log(`unknown provider ID: ${providerId}`);
        return;
      }
      console.log(`link ${user.uid} to ${providerId}`);
      //     updateUser(uid: string, properties: UpdateRequest): Promise<UserRecord>;
    }
  }

}

module.exports = LinkCommand;
