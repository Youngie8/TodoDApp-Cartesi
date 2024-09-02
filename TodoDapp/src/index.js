const { ethers } = require("ethers");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;

function hex2str(hex) {
  return ethers.toUtf8String(hex);
}

function str2hex(payload) {
  return ethers.hexlify(ethers.toUtf8Bytes(payload));
}

let tasks = [];
let totalTasks = 0;

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));

  const metadata = data["metadata"];
  const sender = metadata["msg_sender"];
  const payload = data["payload"];

  const action = JSON.parse(hex2str(payload));

  if (action.type === "add") {
    tasks.push({ task: action.task, completed: false, sender });
    totalTasks += 1;
    console.log(`Task added: ${action.task}`);
  } else if (action.type === "complete") {
    const taskIndex = tasks.findIndex(t => t.task === action.task && t.sender === sender);
    if (taskIndex !== -1) {
      tasks[taskIndex].completed = true;
      console.log(`Task completed: ${action.task}`);
    } else {
      console.log(`Task not found: ${action.task}`);
    }
  } else {
    console.log("Invalid action type");
    return "reject";
  }

  await fetch(rollup_server + "/notice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: str2hex(`Action processed: ${action.type}`) }),
  });

  return "accept";
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));

  const payload = data["payload"];
  const route = hex2str(payload);

  let responseObject;
  if (route === "list") {
    responseObject = JSON.stringify({ tasks });
  } else if (route === "total") {
    responseObject = JSON.stringify({ totalTasks });
  } else {
    responseObject = "route not implemented";
  }

  await fetch(rollup_server + "/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: str2hex(responseObject) }),
  });

  return "accept";
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();