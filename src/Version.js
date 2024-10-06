/**
 * Copyright ©2024 Dana Basken
 */

const {Package} = require("@d4lton/node-backend");
const semver = require("semver");

class Version {

  static async check(autoCheck = false) {
    try {
      const pkg = new Package();
      console.log("Checking for latest version...");
      const latest = await fetch(`https://registry.npmjs.org/${pkg.name}/latest`).then(it => it.json());
      if (semver.gt(latest.version, pkg.version)) {
        console.log(`There is a newer version of ${pkg.name}: ${latest.version}`);
        console.log(`You can update with: "npm install -g @d4lton/ignis" (exit ignis first)`);
      } else {
        if (!autoCheck) { console.log("You are running the latest version"); }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  static async autoCheck(ignis) {
    try {
      const autoCheck = !!ignis.config.get("version.auto_check");
      if (!autoCheck) { return; }
      const lastCheckMs = ignis.config.get("version.auto_check_ms") ?? 0;
      if (Date.now() - lastCheckMs < 86400000) { return; }
      ignis.config.set("version.auto_check_ms", Date.now());
      return Version.check(true);
    } catch (error) {
      console.log(error.message);
    }
  }

}

module.exports = Version;
