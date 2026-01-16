#!/usr/bin/env node
import fs from "fs";

const FILE_NAME = "tasks.json";

const TASK_STATUS = {
    TODO: "todo",
    IN_PROGRESS: "in-progress",
    DONE: "done",
};

const STATUS_COLORS = {
    done: "\x1b[30m",
    todo: "\x1b[31m",
    "in-progress": "\x1b[34m",
};

const MESSAGE_COLORS = {
    success: "\x1b[32m",
    error: "\x1b[31m",
    info: "\x1b[34m",
    notFound: "\x1b[33m",
    default: "",
};

const GET_TASKS_ERROR_MESSAGE = `\n'task-cli list' requires 0 or 1 argument\n
Usage:  task-cli list [OPTIONAL-ARG..]\n
optional args: [done, todo, in-progress]\n
See 'task-cli help' for more information`;

const ADD_TASK_ERROR_MESSAGE = `\n'task-cli add' requires 1  argument\n
Usage:  task-cli add [task]\n
See 'task-cli help' for more information`;

const DELETE_TASK_ERROR_MESSAGE = `\n'task-cli delete' requires 1 argument\n
Usage:  task-cli delete [task-id]\n
See 'task-cli help' for more information`;

const UPDATE_TASK_ERROR_MESSAGE = `\n'task-cli update' requires 2 arguments\n
Usage:  task-cli update [task-id] [new-description]\n
See 'task-cli help' for more information`;

const MARK_DONE_ERROR_MESSAGE = `\n'task-cli mark-done' requires 1 argument\n
Usage:  task-cli mark-done [task-id] \n
See 'task-cli help' for more information`;

const MARK_IN_PROGRESS_ERROR_MESSAGE = `\n'task-cli in-progress' requires 1 argument\n
Usage:  task-cli mark-in-progress [task-id]\n
See 'task-cli help' for more information`;

// Helper: Function to log messages with different statuses
const logMessage = (message, status = "default") => {
    const resetColor = "\x1b[0m";
    const color = MESSAGE_COLORS[status];
    console.log(`${color}${message}${resetColor}`);
};

// create the file with empty json object
const InitializeEmptyTaskFile = () => {
    fs.writeFileSync(FILE_NAME, "[]");
    logMessage("File Created Successfully", "success");
};

// Function to open or create the data source file
const createIfNotExists = () => {
    if (!fs.existsSync(FILE_NAME)) {
        logMessage("File Doesn't Exist", "error");
        InitializeEmptyTaskFile();
    }
};

const readTasksFromFile = () => {
    const obj = fs.readFileSync(FILE_NAME, "utf8");
    try {
        // handle empty json file ""
        if (!obj || obj === "") {
            InitializeEmptyTaskFile();
            return [];
        }
        // parse the the buffer to json
        const tasks = JSON.parse(obj);
        return tasks;
    } catch (e) {
        throw new Error("Failed to parse the json file");
    }
};

const saveToFile = (tasks) => {
    try {
        fs.writeFileSync(FILE_NAME, JSON.stringify(tasks, null, 2));
    } catch (error) {
        throw new Error("Failed to save the json file");
    }
};

// helper functions
const parseID = (id) => {
    const taskID = parseInt(id, 10);
    if (Number.isNaN(taskID)) {
        throw new Error("Invalid Task ID");
    }
    return taskID;
};

const validateArgs = (args, expected, errorMessage) => {
    if (args.length !== expected) {
        throw new Error(errorMessage);
    }
};

const printTasks = (tasks) => {
    if (!tasks || (tasks && tasks.length === 0)) {
        logMessage("You are All done (No tasks for today)", "info");
        return;
    }
    logMessage(
        `\x1b[33m\x1b[4m${"ID".padEnd(5)} ${"Date".padEnd(8)} ${"Status".padEnd(
            15
        )} Description\x1b[0m`
    );

    tasks.forEach((task) => {
        const date = new Date(Number(task.createAt)).toLocaleString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
        });

        logMessage(
            `${STATUS_COLORS[task.status]}${task.id
                .toString()
                .padEnd(5)} ${date.padEnd(8)} ${task.status.padEnd(15)} ${
                task.description
            }\x1b[0m`
        );
    });
};

// Command functions
const getTasks = (args) => {
    try {
        if (args.length > 1) {
            throw new Error(GET_TASKS_ERROR_MESSAGE);
        }

        let tasks = readTasksFromFile();

        if (args.length === 1) {
            const status = args[0];
            if (
                status !== TASK_STATUS.DONE &&
                status !== TASK_STATUS.IN_PROGRESS &&
                status !== TASK_STATUS.TODO
            ) {
                throw new Error(GET_TASKS_ERROR_MESSAGE);
            }
            tasks = tasks.filter((task) => task.status === status);
        }
        printTasks(tasks);
    } catch (error) {
        logMessage(error.message || "Failed To Get All Tasks", "error");
        process.exit(1);
    }
};

const addTask = (args) => {
    try {
        validateArgs(args, 1, ADD_TASK_ERROR_MESSAGE);
        const tasks = readTasksFromFile();

        // NOTE FOR ME: old opproach (issue: last element may not have the heightest id)
        // const newTaskID = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
        // safer approach
        const newTaskID =
            tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
        const newTask = {
            id: newTaskID, // Generate uniqe id,
            description: args[0],
            status: TASK_STATUS.TODO,
            createAt: Date.now(),
            updateAt: Date.now(),
        };
        tasks.push(newTask);
        saveToFile(tasks);
        logMessage(`Task added (ID): ${newTaskID}`, "success");
    } catch (error) {
        logMessage(error.message || "Failed To Add New Task", "error");
        process.exit(1);
    }
};

const deleteTask = (args) => {
    try {
        validateArgs(args, 1, DELETE_TASK_ERROR_MESSAGE);

        const taskID = parseID(args[0]);

        let tasks = readTasksFromFile();

        const index = tasks.findIndex((t) => t.id === taskID);

        if (index === -1) {
            logMessage(`Task not found ID: ${taskID}`, "notFound");
            return;
        }
        tasks.splice(index, 1);
        saveToFile(tasks);
        logMessage(`Task Deleted Successfully`, "success");
    } catch (error) {
        logMessage(error.message || "Failed to delete Task", "error");
        process.exit(1);
    }
};

const markStatus = (args, status, errorMessage) => {
    try {
        validateArgs(args, 1, errorMessage);
        const taskID = parseID(args[0]);
        const tasks = readTasksFromFile();
        const task = tasks.find((t) => t.id === taskID);
        if (!task) {
            logMessage(`Task not found ID: ${taskID}`, "notFound");
            return;
        }
        task.status = status;
        saveToFile(tasks);
        logMessage("Task updated successfully", "info");
    } catch (error) {
        logMessage(
            error.message || `Failed To mark task as ${status}`,
            "error"
        );
        process.exit(1);
    }
};

const updateTask = (args) => {
    try {
        validateArgs(args, 2, UPDATE_TASK_ERROR_MESSAGE);
        const taskID = parseID(args[0]);
        const tasks = readTasksFromFile();
        const task = tasks.find((t) => t.id === taskID);

        if (!task) {
            logMessage(`Task not found ID: ${taskID}`, "notFound");
            return;
        }
        task.description = args[1];
        saveToFile(tasks);
        logMessage("Task updated successfully", "info");
    } catch (error) {
        logMessage(error.message || "Failed To Update Task", "error");
        process.exit(1);
    }
};

function showHelp() {
    logMessage(`'task-cli list' 

commands: 
- add					Add a new task
- delete 				delete a task
- list					List all tasks
- help					show this help message
- mark-done 			mark a task as (done)
- mark-in-progress 		mark a task as (in progress)

Usage:  
- task-cli list [OPTIONAL-ARG..]
- task-cli add [task]
- task-cli delete [task-id]
- task-cli update [task-id] [description]
- task-cli mark-done [task-id]
- task-cli mark-in-progress [task-id]

`);
}

const main = () => {
    // Set UP
    createIfNotExists();
    const args = process.argv.slice(2);
    const command = args[0];

    const primaryActions = {
        add: addTask,
        list: getTasks,
        help: showHelp,
        delete: deleteTask,
        update: updateTask,
        "mark-done": (args) =>
            markStatus(args, TASK_STATUS.DONE, MARK_DONE_ERROR_MESSAGE),
        "mark-in-progress": (args) =>
            markStatus(
                args,
                TASK_STATUS.IN_PROGRESS,
                MARK_IN_PROGRESS_ERROR_MESSAGE
            ),
    };

    const action = primaryActions[command] ?? showHelp;
    action(args.slice(1));
    process.exit(0);
};

main();

/* 	
TODO: Validate task description to be non empty string, whitespace only, and max length 200 chars
TODO: Handle parse and write errors
TODO: Use constants for status
TODO: Sort all tasks based on their status
TODO: Implement exit command with 1 flag 
TODO: Add updatedAt timestamp update
TODO: Add schema validation for task objects
TODO: Add task count summary at the end of list command
DONE: Update all console.logs to logMessage 
DONE: Remove validation logic duplication 
*/
