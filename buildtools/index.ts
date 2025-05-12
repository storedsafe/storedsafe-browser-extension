import * as path from "node:path";

import { Command, Option, program } from "commander";
import { Logger } from "./lib/logger";
import type { OptionValues } from "commander";

const logger = new Logger("buildtools");

//
// SECTION: Functions
//

declare global {
  var buildtools: {
    opts: Record<string, any>;
  };
}

/**
 * Get defined tasks from config file.
 * @returns Imported tasks object
 */
async function getTasks(taskFile: string): Promise<Record<string, Function>> {
  const taskPath = path.resolve(process.cwd(), taskFile);
  try {
    logger.log("Importing tasks from %s...", taskPath);
    return import(taskPath);
  } catch (err) {
    logger.err(err);
    process.exit(1);
  }
}

function action(tasks: string[], opts: OptionValues, command: Command) {
  global.buildtools = { opts };
  if (opts.dev) {
    logger.warn("RUNNING IN DEV MODE, DO NOT USE IN PRODUCTION");
  }
  if (tasks.length === 0 || opts.listTasks) {
    tasksAction(opts, command);
  } else {
    runAction(tasks, opts, command);
  }
}

async function runAction(
  tasks: string[],
  opts: OptionValues,
  command: Command
) {
  const taskList = await getTasks(opts.tasksFile);
  for (const task of tasks) {
    const taskFunction = taskList[task];
    if (taskFunction) {
      await taskFunction();
    } else {
      logger.err("No such function: %s", task);
    }
  }
}

async function tasksAction(opts: OptionValues, command: Command) {
  const tasks = Object.keys(await getTasks(opts.tasksFile)).sort();
  console.log("Available tasks: ");
  tasks.forEach((task) => {
    console.log(`\t${task}`);
  });
}

//
// SECTION: Run build tools
//

const tasks_file: string = "buildtools.tasks.ts";

program
  .description("Run defined build tasks.")
  .option("-t, --tasks-file <string>", "Path to tasks file", tasks_file)
  .option("-l, --list-tasks", "List exported tasks from tasks file")
  .option(
    "-w, --watch",
    "Set tasks to watch for changes and rerun where applicable."
  )
  .option("-d, --dev", "Run in development mode", false)
  .option("--debug", "Run in debug mode", false)
  .argument("[tasks...]")
  .action(action);

// Run command parser
program.parse();
