## IGNIS

Ignis is a simple Firebase/Firestore command-line tool that allows you to list, view, and copy collections and documents both within a project and between projects.

IMPORTANT: This tool will modify your Firestore database, please be careful and know what you are doing. Always make backups and double-check commands! This tool is intended for power users only.

## INSTALLATION

    npm install -g @d4lton/ignis

## USAGE

Start ignis, optionally selecting the default project:

 `ignis [--project <project-id>]`

## COMMANDS

Once running, try `help`.

## EXAMPLES

    default > login my_firebase_config.json
    <set the Firebase login keys for the current project>

    default* > ls
    <list of top-level collections in your default project>

    default* > cat config/main
    <JSON blob representing the contents of this document sent to stdout>

    default* > cat config/main > some_file.json --pretty
    (dumps contents of "config/main" to a local file named "some_file.json")

    default* > $vi some_file.json
    (opens vi to allow editing of some_file.json, note that "$" will execute any shell command)

    default* > cat some_file.json > config/main
    (dumps contents of local file named "some_file.json" to "config/main")

    default* > cp config/main config/backup
    (copies contents of "config/main" to "config/backup")

    default* > use production
    (switches project to "production")

    production > login production_firebase_config.json

    production* > cp default:config/main config/main
    (copies "config/main" from the "default" project to "config/main" in the "production" project)

## PROJECTS

When you first start ignis, you will be in the "default" project (unless you specified the `--project` command-line option).

The prompt will show you the current project, and you can switch to a new project with the `project <project-id>` command. Note that `project-id` is an arbitrary ID you create. Spaces aren't allowed in the ID, and it probably makes sense to have it match the project ID for your Firebase project.

Before you can do any operations on a project, you will have to log in with the `login <firebase-config-json>` file. This config will be cached under your `~/.config` directory, so you don't have to log in every time you use ignis.

Any place you use a `<path>`, you can choose to specify a project ID. For example:

    production > cp production:config/main staging:config/main

This will copy the `config/main` document in your `production` project to `config/main` in your `staging` project.

## SECURITY

The configuration file is stored in ".config/com.basken.ignis/config.json" and is plaintext by default. If you want this file to be encrypted:

- exit from ignis
- delete `.config/com.basken.ignis/config.json`
- set the `IGNIS_ENCRYPTION_KEY` environment variable to a 32 character (256 bit) AES-256 key
- run ignis and set your projects up with `use` and `login` as before
- the `.config/com.basken.ignis/config.json` config file should be encrypted
