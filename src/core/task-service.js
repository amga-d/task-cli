import { DataSource } from "../storage/data-source.js";
import { TASK_STATUS } from "../constants/constants.js";
export class TaskService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }

    #generateUniqueID(tasks) {
        // NOTE FOR ME: old opproach (issue: last element may not have the heightest id)
        // const newTaskID = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
        // safer approach
        const newTaskID =
            tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
        return newTaskID;
    }

    #parseID(id) {
        const taskID = parseInt(id, 10);
        if (Number.isNaN(taskID)) {
            throw new Error("Invalid Task ID");
        }
        return taskID;
    }

    async getAllTasks() {
        try {
            return await this.dataSource.getTasks();
        } catch (error) {
            throw new Error("Failed To Get All Tasks");
        }
    }

    async addTask(description) {
        try {
            const tasks = await this.dataSource.getTasks();
            const newTaskID = this.#generateUniqueID(tasks);
            const newTask = {
                id: newTaskID,
                description: description,
                status: TASK_STATUS.TODO,
                createAt: Date.now(),
                updateAt: Date.now(),
            };
            tasks.push(newTask);
            await this.dataSource.saveTasks(tasks);
            return newTaskID;
        } catch (error) {
            throw new Error("Failed To Add New Task");
        }
    }

    async deleteTask(taskID) {
        try {
            const parsedTID = this.#parseID(taskID);
            const tasks = await this.dataSource.getTasks();
            const exists = tasks.some((t) => t.id === parsedTID);
            if (!exists) {
                throw new Error("Task Not Found");
            }
            const updatedTasks = tasks.filter((t) => t.id !== parsedTID);
            await this.dataSource.saveTasks(updatedTasks);
        } catch (error) {
            throw error;
        }
    }

    async updateTask(taskID, description) {
        try {
            const parsedTID = this.#parseID(taskID);
            const tasks = await this.dataSource.getTasks();
            const task = tasks.find((t) => t.id === parsedTID);
            if (!task) {
                throw new Error("Task Not Found");
            }
            task.description = description;
            await this.dataSource.saveTasks(tasks);
        } catch (error) {
            throw new Error("Failed To Update Task");
        }
    }

    async markStatus(taskID, status) {
        try {
            const parsedTID = this.#parseID(taskID);
            const tasks = await this.dataSource.getTasks();
            const task = tasks.find((t) => t.id === parsedTID);
            if (!task) {
                throw new Error("Task Not Found");
            }
            task.status = status;
            await this.dataSource.saveTasks(tasks);
        } catch (error) {
            throw new Error(`Failed To mark task as ${status}`);
        }
    }
}

const taskDataSource = await new DataSource("tasks.json").Initialize();
const taskService = new TaskService(taskDataSource);

// TESTING
// const tasks = await taskService.getAllTasks();
await taskService.markStatus(44, TASK_STATUS.DONE);

// const updateTask = await taskService.updateTask(, "Updated Task desc
