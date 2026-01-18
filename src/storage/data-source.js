import os from "os";
import path from "path";
import fs from "fs/promises";
import { constants } from "fs";

export class DataSource {
    #filePath;
    #dirPath;

    constructor(fileName) {
        const APP_NAME = "task-traker";
        this.#dirPath = path.join(os.homedir(), ".local", "share", APP_NAME);
        this.#filePath = path.join(this.#dirPath, fileName);
    }

    /**
     * Initializes an empty task file if it does not exist
     * @param {string} data intial content for file (e.g. , "[]")
     */
    async Initialize(intialData = "[]") {
        try {
            await fs.mkdir(this.#dirPath, { recursive: true });

            try {
                // if file exists, access will be successful otherwisse it will throw error
                await fs.access(this.#filePath, constants.F_OK);
            } catch (e) {
                // write file only if it does not exist
                // wx - write file, fail if exists (to prevent race condition)
                await fs.writeFile(this.#filePath, intialData, { flag: "wx" });
            }
            return this;
        } catch (error) {
            // TODO: handle error properly (with error handler)
            console.error("Failed to initialize task file:", error.message);
            throw error;
        }
    }

    async #InitializeEmptyTaskFile() {
        try {
            await fs.writeFile(this.#filePath, "[]");
        } catch (error) {
            throw new Error("File Creation Failed");
        }
    }

    async getTasks() {
        try {
            const contents = await fs.readFile(this.#filePath, {
                encoding: "utf8",
            });
            // handle empty json file ""
            if (!contents || contents === "") {
                await this.#InitializeEmptyTaskFile();
                return [];
            }
            // parse the the buffer to json
            const tasks = JSON.parse(contents);
            if (!Array.isArray(tasks)) {
                throw new Error("Failed to parse the json file");
            }
            return tasks;
        } catch (e) {
            throw new Error("Failed to parse the json file");
        }
    }

    async saveTasks(tasks) {
        try {
            // atomic write
            // Prevents data loss
            const tempFilePath = `${this.#filePath}.tmp`;
            await fs.writeFile(tempFilePath, JSON.stringify(tasks, null, 2));
            await fs.rename(tempFilePath, this.#filePath);
        } catch (error) {
            throw new Error("Failed to save the json file");
        }
    }
}
