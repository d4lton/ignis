## IGNIS

Ignis is a simple Firebase/Firestore command-line tool that allows you to list, view, and copy collections and documents both within a project and between projects.

## USAGE

Start ignis, optionally selecting the default project:

 `./ignis [--project <project-id>]`

## COMMANDS

Once running, try `help`.

## EXAMPLES

    default > login --file=my_firebase_config.json

    default > ls
    <list of top-level collections in your default project>

    default > cat config/main
    <JSON blob representing the contents of this document>

    default > cp config/main config/backup

## PROJECTS

When you first start ignis, you will be in the "default" project (unless you specified the `--project` command-line option).

The prompt will show you the current project, and you can switch to a new project with the `project <project-id>` command. Note that `project-id` is an arbitrary ID you create. Spaces aren't allowed in the ID, and it probably makes sense to have it match the project ID for your Firebase project.

Before you can do any operations on a project, you will have to log in with the `login --file=<firebase-config-json>` file. This config will be cached under your `~/.config` directory, so you don't have to log in every time you use ignis.

Any place you use a `<path>`, you can choose to specify a project ID. For example:

    production > cp production:config/main staging:config/main

This will copy the `config/main` document in your `production` project to `config/main` in your `staging` project.
