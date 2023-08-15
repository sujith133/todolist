let datefns = require("date-fns");
let express = require("express");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let path = require("path");
let app = express();
app.use(express.json());
let dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
let dbInitializer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("hosted at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`error ${e.message}`);
  }
};
dbInitializer();

app.get("/todos/", async (request, response) => {
  let requestQuery = request.query;
  let {
    id,
    todo,
    priority,
    status,
    category,
    dueDate,
    search_q,
  } = requestQuery;
  //console.log(id, todo, priority, status, category, dueDate, search_q);
  let checker = (status) => {
    return status !== undefined;
  };
  let sqlQuery = ``;
  switch (true) {
    case checker(status) && checker(priority):
      if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (
        priority !== "HIGH" &&
        priority !== "LOW" &&
        priority !== "MEDIUM"
      ) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        sqlQuery = `select * from todo where status = '${status}' and priority = '${priority}'`;
        console.log(priority, status);
      }
      break;
    case checker(status) && checker(category):
      if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (
        category !== "WORK" &&
        category !== "HOME" &&
        category !== "LEARNING"
      ) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        sqlQuery = `select * from todo where status = '${status}' and category = '${category}'`;
        console.log(status, category);
      }
      break;
    case checker(category) && checker(priority):
      if (priority !== "HIGH" && priority !== "LOW" && priority !== "MEDIUM") {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else if (
        category !== "WORK" &&
        category !== "HOME" &&
        category !== "LEARNING"
      ) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        sqlQuery = `select * from todo where priority = '${priority}' and category = '${category}'`;
        console.log(priority, category);
      }
      break;
    case checker(status):
      if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        sqlQuery = `select * from todo where status = '${status}'`;
        console.log(status);
      }
      break;
    case checker(priority):
      if (priority !== "HIGH" && priority !== "LOW" && priority !== "MEDIUM") {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        sqlQuery = `select * from todo where priority = '${priority}'`;
        console.log(priority);
      }
      break;
    case checker(category):
      if (
        category !== "WORK" &&
        category !== "HOME" &&
        category !== "LEARNING"
      ) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        sqlQuery = `select * from todo where category = '${category}'`;
        console.log(category);
      }
      break;
    case checker(search_q):
      sqlQuery = `select * from todo where todo like '%${search_q}%'`;
      console.log(search_q);
      break;
  }
  //      if (false) {
  //      response.status(400);
  //      response.send("Invalid Due Date");
  //    }
  let queryGetter = await db.all(sqlQuery);
  let = listGetter = [];
  if (queryGetter.length !== 0) {
    for (let item of queryGetter) {
      let objGetter = {};
      objGetter.id = item.id;
      objGetter.todo = item.todo;
      objGetter.priority = item.priority;
      objGetter.status = item.status;
      objGetter.category = item.category;
      objGetter.dueDate = item.due_date;
      listGetter.push(objGetter);
    }
    response.send(listGetter);
  } else {
    response.send(queryGetter);
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  let requestParams = request.params;
  let { todoId } = requestParams;
  let sqlQuery = `
    select * from todo where id =${todoId};
    `;
  let item = await db.get(sqlQuery);
  let objItem = {};
  objItem.id = item.id;
  objItem.todo = item.todo;
  objItem.priority = item.priority;
  objItem.status = item.status;
  objItem.category = item.category;
  objItem.dueDate = item.due_date;
  response.send(objItem);
});
module.exports = app;

app.get("/agenda/", async (request, response) => {
  let requestParams = request.params;
  let requestQuery = request.query;
  let { date } = requestQuery;
  let { todoId } = requestParams;
  let sqlQuery = `
    select * from todo where due_date ='${date}';
    `;
  let listItem = await db.all(sqlQuery);
  let listItems = [];
  for (let item of listItem) {
    let objItem = {};
    objItem.id = item.id;
    objItem.todo = item.todo;
    objItem.priority = item.priority;
    objItem.status = item.status;
    objItem.category = item.category;
    objItem.dueDate = item.due_date;
    listItems.push(objItem);
  }
  response.send(listItems);
});

app.post("/todos/", async (request, response) => {
  let requestBody = request.body;
  let { id, todo, priority, status, category, dueDate } = requestBody;
  let sqlQuery = `insert into todo(id,todo,priority,status,category,due_date) values(${id},'${todo}','${priority}','${status}','${category}','${dueDate}');`;
  let inserter = await db.run(sqlQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  let requestParams = request.params;
  let { todoId } = requestParams;
  let requestBody = request.body;
  let { id, todo, priority, status, category, dueDate } = requestBody;
  //console.log(id, todo, priority, status, category, dueDate);
  let checker = (status) => {
    return status !== undefined;
  };
  let responser = "";
  let sqlQuery = ``;
  switch (true) {
    case checker(status):
      if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        sqlQuery = `update todo set status='${status}' where id = ${todoId};`;
        responser = "Status Updated";
        console.log(status);
      }
      break;

    case checker(priority):
      if (priority !== "HIGH" && priority !== "LOW" && priority !== "MEDIUM") {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        sqlQuery = `update todo set priority='${priority}' where id = ${todoId};`;
        responser = "Priority Updated";
        console.log(priority);
      }
      break;
    case checker(todo):
      sqlQuery = `update todo set todo='${todo}' where id = ${todoId};`;
      responser = "Todo Updated";
      console.log(todo);
      break;
    case checker(category):
      if (
        category !== "WORK" &&
        category !== "HOME" &&
        category !== "LEARNING"
      ) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        sqlQuery = `update todo set category='${category}' where id = ${todoId};`;
        responser = "Category Updated";
        console.log(category);
      }
      break;
    case checker(dueDate):
      sqlQuery = `update todo set due_date='${dueDate}' where id = ${todoId};`;
      responser = "dueDate Updated";
      console.log(dueDate);
      break;
  }
  let inserter = await db.run(sqlQuery);
  response.send(responser);
});

app.delete("/todos/:todoId/", async (request, response) => {
  let requestParams = request.params;
  let { todoId } = requestParams;
  let sqlQuery = `delete from todo where id = ${todoId};`;
  let deleted = await db.run(sqlQuery);
  response.send("Todo Deleted");
});
module.exports = app;
