# Task Tracker CLI

A simple command-line interface (CLI) application to track and manage your tasks. Built with Node.js as part of the [roadmap.sh Task Tracker project](https://roadmap.sh/projects/task-tracker).

## Features

-   Add, update, and delete tasks
-   Mark tasks as "todo", "in-progress", or "done"
-   List all tasks or filter by status
-   Color-coded output for better readability
-   Persistent JSON storage
-   Simple and intuitive commands

## Installation

1. Clone the repository:

```bash
git clone https://github.com/amga-d/task-cli.git
cd task-cli
```

2. Make the script executable (optional):

```bash
chmod +x index.js
```

3. Link the package globally (optional):

```bash
npm link
```

## Usage

### Add a new task

```bash
task-cli add "Buy groceries"
```

### List all tasks

```bash
task-cli list
```

### List tasks by status

```bash
task-cli list todo
task-cli list in-progress
task-cli list done
```

### Update a task description

```bash
task-cli update 1 "Buy groceries and cook dinner"
```

### Mark a task as in-progress

```bash
task-cli mark-in-progress 1
```

### Mark a task as done

```bash
task-cli mark-done 1
```

### Delete a task

```bash
task-cli delete 1
```

### Show help

```bash
task-cli help
```

## Task Properties

Each task has the following properties:

-   `id`: Unique identifier for the task
-   `description`: Task description
-   `status`: Task status (`todo`, `in-progress`, or `done`)
-   `createAt`: Timestamp when the task was created
-   `updateAt`: Timestamp when the task was last updated

## Data Storage

Tasks are stored in a `tasks.json` file in the project directory. The file is automatically created on first run.

## Color Coding

-   🔴 **Red**: Todo tasks
-   🔵 **Blue**: In-progress tasks
-   ⚫ **Gray**: Done tasks
-   🟢 **Green**: Success messages
-   🔴 **Red**: Error messages
-   🟡 **Yellow**: Task not found messages

## Requirements

-   Node.js (v14 or higher recommended)

## Project Structure

```
Task-Tracker-CLI/
├── index.js          # Main application file
├── package.json      # Package configuration
├── tasks.json        # Task data storage (auto-generated)
└── README.md         # This file
```

## Project Source

This project is part of the [roadmap.sh Task Tracker project](https://roadmap.sh/projects/task-tracker).

## Future Enhancements

-   [ ] Task description validation (empty strings, max length)
-   [ ] Sort tasks by status
-   [ ] Add updatedAt timestamp on updates
-   [ ] Task count summary
-   [ ] Export tasks to CSV/Markdown
-   [ ] Add task priorities and due dates

## License

ISC

## Contributing

Feel free to submit issues and enhancement requests!
