# Task Management DApp

This decentralized application (DApp) implements a simple task management system using Cartesi Rollups technology. Users can add tasks, mark them as completed, and view the list of tasks or the total number of tasks.

## Features

1. Add new tasks
2. Mark tasks as completed
3. View all tasks
4. Get the total number of tasks

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install ethers
   ```

## Running the DApp

Start the DApp using the Cartesi Rollups environment. Refer to the Cartesi documentation for detailed instructions on how to run a Rollups DApp.

## Interacting with the DApp

### Sending Inputs (Advance Requests)

To interact with the DApp, send a JSON payload with the following structure:

1. Add a new task:

   ```json
   {
     "type": "add",
     "task": "Your task description here"
   }
   ```

2. Complete a task:
   ```json
   {
     "type": "complete",
     "task": "Exact task description to complete"
   }
   ```

### Inspecting the State

You can inspect the DApp's state using the following routes:

1. Get all tasks:

   ```
   list
   ```

2. Get total number of tasks:
   ```
   total
   ```

## How it Works

1. Tasks are stored in memory with their completion status and the sender's address.
2. When a task is added, it's marked as not completed by default.
3. Users can only complete tasks they've added themselves.
4. The DApp keeps track of the total number of tasks added.
