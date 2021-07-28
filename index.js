const inquirer = require("inquirer");
const columnify = require("columnify");
const mysql = require("mysql");

let listOfAvailableRoles = [];

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "employees_db",
  port: 3306,
});

connection.connect((err) => {
  if (err) throw err;
  cli_prompt();
});

const mainPrompt = [
  {
    name: "action",
    type: "list",
    message: "What would you like to do?",
    choices: [
      "View All Employees",
      "View Departments",
      "View All Employees By Manager",
      "Add Employee",
      "Remove Employee",
      "Update Employee Manager",
      "Add Role",
      "exit",
    ],
  },
];

// prompt user with inquirer and execute function corresponding to user selection
function cli_prompt() {
  // prompt user actions using inquirer
  inquirer
    .prompt(mainPrompt)

    // await user response from inquirer
    .then(function (answer) {
      // execute function viewAll if user selection is "View All employees"
      if (answer.action == "View All Employees") {
        showAllEmployees();

        // execute function viewDept if user selection is "View departments"
      } else if (answer.action == "View Departments") {
        viewDept();
      } else if (answer.action == "View All Employees By Manager") {
        showAllEmployeesByManager();
      } else if (answer.action == "Add Employee") {
        addEmployee();
      } else if (answer.action == "Remove Employee") {
        removeEmployee();
      } else if (answer.action == "Update Employee Manager") {
        updateEmployeeManager();
      } else if (answer.action == "Add Role") {
        addRole();
        // execute function EXIT if user selection is "EXIT"
      } else if (answer.action == "exit") {
        exit();
      }
    });
}

function showAllEmployees() {
  // SQL command to get employee first_name/ last_name/ manager id, role title/ salary and department name data from employees, roles, and department tables
  let query =
    "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name AS department, employees.manager_id " +
    "FROM employees " +
    "JOIN roles ON roles.id = employees.role_id " +
    "JOIN department ON roles.department_id = department.id " +
    "ORDER BY employees.id;";

  // connect to mySQL useing query instruction to access employees table
  connection.query(query, function (err, res) {
    // throw error if there is issue accessing data
    if (err) throw err;

    // add manager names to the manager_id col to be displayed in terminal
    for (i = 0; i < res.length; i++) {
      // if manager_Id contains a "0" then lable it as "None"
      if (res[i].manager_id == 0) {
        res[i].manager = "None";
      } else {
        // create new row called manager, containing each employee's manager name
        res[i].manager =
          res[res[i].manager_id - 1].first_name +
          " " +
          res[res[i].manager_id - 1].last_name;
      }

      // remove manager id from res so as to not display it
      delete res[i].manager_id;
    }

    // print data retrieved to terminal in table format
    console.table(res);

    // prompt user for next action
    cli_prompt();
  });
}

// view all departments in employee_db
function viewDept() {
  // SQL command to get data from department table
  let query = "SELECT department.dept_name AS departments FROM department;";

  // connect to mySQL useing query instruction to access departments table
  connection.query(query, function (err, res) {
    // throw error if the is issue accessing data
    if (err) throw err;

    // print data retrieved to terminal in table format
    console.table(res);

    // prompt user for next action
    cli_prompt();
  });
}

const showAllEmployeesByManager = () => {
  let managersNames = [];
  let managerIds = [];

  connection.query(
    "SELECT id, first_name, last_name, manager_id FROM employees",
    function (err, res) {
      if (err) throw err;
      for (let i = 0; i < res.length; i++) {
        if (res[i].manager_id === null) {
          managersNames.push(`${res[i].first_name} ${res[i].last_name}`);
          managerIds.push(res[i].id);
        }
      }
      for (let i = 0; i < res.length; i++) {
        for (let j = 0; j < res.length; j++) {
          if (res[i].id === res[j].manager_id && res[i].manager_id != null) {
            managersNames.push(`${res[i].first_name} ${res[i].last_name}`);
            managerIds.push(res[i].id);
          }
        }
      }

      //Removing duplicates
      managersNames = [...new Set(managersNames)];
      managerIds = [...new Set(managerIds)];

      inquirer
        .prompt({
          name: "manager",
          type: "list",
          message: "Choose the manager you want to see the employees under",
          choices: managersNames,
        })
        .then((answer) => {
          for (let i = 0; i < managersNames.length; i++) {
            if (answer.manager === managersNames[i]) {
              manager_id = managerIds[i];
            }
          }
          connection.query(
            "select first_name, last_name from employees where manager_id =" +
              manager_id,
            function (err, res) {
              if (err) throw err;

              console.log("-----------------------------------");
              console.log(
                columnify(res, {
                  minWidth: 15,
                  config: {
                    id: {
                      maxWidth: 3,
                    },
                  },
                })
              );
              console.log("-----------------------------------");
              cli_prompt();
            }
          );
        });
    }
  );
};

function addEmployee() {
  // SQL command to get data from roles table
  let query = "SELECT title FROM roles";

  // SQL command to get employee first_name/ last_name/ manager id, role title/ salary and department name data from employees, roles, and department tables
  let query2 =
    "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name, employees.manager_id " +
    "FROM employees " +
    "JOIN roles ON roles.id = employees.role_id " +
    "JOIN department ON roles.department_id = department.id " +
    "ORDER BY employees.id;";

  // connect to mySQL using query instruction 1 to access data from roles table
  connection.query(query, function (err, res) {
    if (err) throw err;

    // assign data from roles table (res) to rolesList
    let rolesList = res;

    // connect to mySQL using query instruction 2 to access dept_name from department table
    connection.query(query2, function (err, res) {
      // throw error if there is issue accessing data
      if (err) throw err;

      // add manager names to the manager_id col to be displayed in terminal
      for (i = 0; i < res.length; i++) {
        // if manager_Id contains a "0" then lable it as "None"
        if (res[i].manager_id == 0) {
          res[i].manager = "None";
        } else {
          // create new row called manager, containing each employee's manager name
          res[i].manager =
            res[res[i].manager_id - 1].first_name +
            " " +
            res[res[i].manager_id - 1].last_name;
        }

        // remove manager id from res so as to not display it
        delete res[i].manager_id;
      }

      // print data retrieved to terminal in table format
      console.table(res);

      // assign data from employees table (res) to managerList
      let managerList = res;

      // array of actions to prompt user
      let addEmpPrompt = [
        {
          name: "first_name",
          type: "input",
          message: "Enter new employee's first name.",
        },

        {
          name: "last_name",
          type: "input",
          message: "Enter new employee's last name.",
        },

        {
          name: "select_role",
          type: "list",
          message: "Select new employee's role.",

          choices: function () {
            roles = [];

            // loop through rolesList to extract the role titles from rolesList
            for (i = 0; i < rolesList.length; i++) {
              const roleId = i + 1;

              roles.push(roleId + ": " + rolesList[i].title);
            }
            roles.unshift("0: Exit");

            // return roles (choices) array to be rendered by inquirer to the user
            return roles;
          },
        },

        {
          name: "select_manager",
          type: "list",
          message: "Select new employee's manager",

          choices: function () {
            // init managers array - used to return existing employee names as choices array prompted to user
            managers = [];

            // loop through managerList to extract the employee names from managerList
            for (i = 0; i < managerList.length; i++) {
              const mId = i + 1;

              managers.push(
                mId +
                  ": " +
                  managerList[i].first_name +
                  " " +
                  managerList[i].last_name
              );
            }

            // add string "0: None" to the beginning of managers (choices)
            managers.unshift("0: None");

            // add string "E: Exit" to the beginning of managers (choices)
            managers.unshift("E: Exit");

            // return managers (choices) array to be rendered by inquirer to the user
            return managers;
          },

          when: function (answers) {
            return answers.select_role !== "0: Exit";
          },
        },
      ];

      // prompt user actions using inquirer
      inquirer
        .prompt(addEmpPrompt)

        // await user response from inquirer
        .then(function (answer) {
          if (
            answer.select_role == "0: Exit" ||
            answer.select_manager == "E: Exit"
          ) {
            // prompt user for next action
            cli_prompt();
          } else {
            console.log(answer);

            let query = "INSERT INTO employees SET ?";

            // connect to mySQL using query instruction to insert new employee in employee table
            connection.query(
              query,
              {
                first_name: answer.first_name,
                last_name: answer.last_name,

                role_id: parseInt(answer.select_role.split(":")[0]),

                manager_id: parseInt(answer.select_manager.split(":")[0]),
              },
              function (err, res) {
                // throw error if there is issue writing data
                if (err) throw err;
              }
            );

            // array of actions to prompt user
            let addagainPrompt = [
              {
                name: "again",
                type: "list",
                message: "Would you like to add another employee?",
                choices: ["Yes", "Exit"],
              },
            ];

            inquirer
              .prompt(addagainPrompt)

              // await user response from inquirer
              .then(function (answer) {
                let query =
                  "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name, employees.manager_id " +
                  "FROM employees " +
                  "JOIN roles ON roles.id = employees.role_id " +
                  "JOIN department ON roles.department_id = department.id " +
                  "ORDER BY employees.id;";

                // connect to mySQL using query instruction to access first_name, last_name from employees table
                connection.query(query, function (err, res) {
                  if (err) throw err;

                  // execute function addEmployee again if user selection is "Yes"
                  if (answer.again == "Yes") {
                    // prompt add new employee to employee_db
                    addEmployee();
                  } else if (answer.again == "Exit") {
                    // add manager names to the manager_id col to be displayed in terminal
                    for (i = 0; i < res.length; i++) {
                      if (res[i].manager_id == 0) {
                        res[i].manager = "None";
                      } else {
                        res[i].manager =
                          res[res[i].manager_id - 1].first_name +
                          " " +
                          res[res[i].manager_id - 1].last_name;
                      }

                      // remove manager id from res so as to not display it
                      delete res[i].manager_id;
                    }

                    // print data retrieved to terminal in table format
                    console.table(res);

                    cli_prompt();
                  }
                });
              });
          }
        });
    });
  });
}

function removeEmployee() {
  // SQL command to get data from roles table
  let query =
    "SELECT employees.id, employees.first_name, employees.last_name FROM employees;";

  connection.query(query, function (err, res) {
    if (err) throw err;

    // combine names from first_name/ last_name cols to be displayed in terminal
    for (i = 0; i < res.length; i++) {
      res[i].employee = res[i].first_name + " " + res[i].last_name;
      delete res[i].first_name;

      delete res[i].last_name;
    }

    // print data retrieved to terminal in table format
    console.table(res);

    let employeeList = res;

    // array of actions to prompt user
    let addEmpPrompt = [
      {
        name: "select_employee",
        type: "list",
        message: "Terminate employee",

        choices: function () {
          employees = [];

          for (i = 0; i < employeeList.length; i++) {
            employees.push(
              employeeList[i].id + ": " + employeeList[i].employee
            );
          }

          employees.unshift("0: Exit");

          return employees;
        },
      },

      {
        name: "confirm",
        type: "list",

        message: function (answers) {
          return (
            "Are you sure you want to TERMINATE " +
            answers.select_employee.split(": ")[1]
          );
        },

        // prompt user to pick between Yes and No
        choices: ["Yes", "No"],

        // dont use this prompt if user selected Exit in previous prompt
        when: function (answers) {
          return answers.select_employee !== "0: Exit";
        },
      },
    ];

    // prompt user actions using inquirer
    inquirer
      .prompt(addEmpPrompt)

      .then(function (answer) {
        if (answer.select_employee == "0: Exit") {
          cli_prompt();

          // if user selects "No" restart deleteEmployee
        } else if (answer.confirm == "No") {
          // prompt user for next action
          deleteEmployee();
        } else {
          let query =
            "DELETE FROM employees WHERE employees.id =" +
            answer.select_employee.split(": ")[0];

          connection.query(query, function (err, res) {
            // throw error if there is issue writing data
            if (err) throw err;
          });

          // array of actions to prompt user
          let addagainPrompt = [
            {
              name: "again",
              type: "list",
              message: "Would you like to remove another employee?",
              choices: ["Yes", "Exit"],
            },
          ];

          // prompt user actions using inquirer
          inquirer
            .prompt(addagainPrompt)

            .then(function (answer) {
              let query =
                "SELECT employees.id, employees.first_name, employees.last_name FROM employees;";

              connection.query(query, function (err, res) {
                // throw error if there is issue accessing data
                if (err) throw err;

                // combine names from first_name/ last_name cols to be displayed in terminal
                for (i = 0; i < res.length; i++) {
                  res[i].employee = res[i].first_name + " " + res[i].last_name;

                  delete res[i].first_name;

                  delete res[i].last_name;
                }

                // execute function updateEmployee again if user selection is "Yes"
                if (answer.again == "Yes") {
                  deleteEmployee();
                } else if (answer.again == "Exit") {
                  // print data retrieved to terminal in table format
                  console.table(res);

                  // prompt user for next action
                  cli_prompt();
                }
              });
            });
        }
      });
  });
}

const updateEmployeeManager = () => {
  let listOfEmployeesFullNames = [];
  let listOfEmployeeObjects = [];

  connection.query(
    "SELECT id, first_name, last_name, manager_id FROM employees",
    function (err, res) {
      if (err) throw err;
      res.forEach((employees) => {
        listOfEmployeesFullNames.push(
          `${employees.first_name} ${employees.last_name}`
        );
        listOfEmployeeObjects.push({
          fullName: `${employees.first_name} ${employees.last_name}`,
          id: employees.id,
        });
      });

      const questions = [
        {
          name: "employees",
          type: "list",
          message: "Choose the employees you want to update the manager for",
          choices: listOfEmployeesFullNames,
        },
        {
          name: "manager",
          type: "rawlist",
          message: "Choose a manager to assign to your chosen employees",
          choices: listOfEmployeesFullNames,
        },
      ];

      inquirer.prompt(questions).then((answer) => {
        let employeeID;
        let managerID;

        listOfEmployeeObjects.forEach((employees) => {
          if (answer.employees === employees.fullName) {
            employeeID = employees.id;
          }
        });

        listOfEmployeeObjects.forEach((employees) => {
          if (answer.manager === employees.fullName) {
            managerID = employees.id;
          }
        });

        connection.query(
          "UPDATE employees SET ? WHERE ?",
          [
            {
              manager_id: managerID,
            },
            {
              id: employeeID,
            },
          ],
          cli_prompt()
        );
      });
    }
  );
};

function addRole() {
  // SQL command to get data from roles table and data from department.dept_name where department.id = roles.department_id
  let query1 =
    "SELECT roles.title AS roles, roles.salary, department.dept_name FROM roles INNER JOIN department ON department.id = roles.department_id;";

  // SQL command to get dept_name data from department table - used for prompting list of availible departments to pick from
  let query2 = "SELECT department.dept_name FROM department";

  // connect to mySQL using query instruction 1 to access data from roles & department tables
  connection.query(query1, function (err, res) {
    // throw error if there is issue accessing data
    if (err) throw err;

    // print data retrieved to terminal in table format
    console.table(res);

    // connect to mySQL using query instruction 2 to access dept_name from department table
    connection.query(query2, function (err, res) {
      // throw error if there is issue accessing data
      if (err) throw err;

      // assign data from dept_name (res) to departmentList
      let departmentList = res;

      // array of actions to prompt user
      let addRolePrompt = [
        {
          name: "add_role",
          type: "input",
          message: "Enter a new company role.",
        },

        {
          name: "add_salary",
          type: "input",
          message: "Enter a salary for this role.",
        },

        {
          name: "select_department",
          type: "list",
          message: "Select a department.",

          // dynamic choises using departmentList (dept_name col of department table)
          choices: function () {
            // init departments array - used to return existing department names as choises array prompted to user
            departments = [];

            // loop through departmentList to extract the department names from depatmentList which is an object array containing data from department table in the form of rowPackets
            for (i = 0; i < departmentList.length; i++) {
              // looping parameter "i" will allways align with the table index, therefore by adding 1 we have effectivly converted it to match table id's
              const roleId = i + 1;

              // concat roleId and dept_name strings and push the resulting string into our departments (choises) array
              departments.push(roleId + ": " + departmentList[i].dept_name);
            }

            // add string "0: Exit" to the beginning of departments (choises)
            departments.unshift("0: Exit");

            // return departments (choises) array to be rendered by inquirer to the user
            return departments;
          },
        },
      ];

      // prompt user actions using inquirer
      inquirer
        .prompt(addRolePrompt)

        // await user response from inquirer
        .then(function (answer) {
          // if user selects Exit return to main menu
          if (answer.select_department == "0: Exit") {
            // prompt user for next action
            cli_prompt();
          } else {
            console.log(answer);

            // SQL command to insert new data in roles table
            let query = "INSERT INTO roles SET ?";

            // connect to mySQL using query instruction to insert new company role in roles table
            connection.query(
              query,
              {
                title: answer.add_role,
                salary: answer.add_salary,

                // department_id is extracted by parsing roleId from the selected departments array string and converting it to int
                department_id: parseInt(answer.select_department.split(":")[0]),
              },
              function (err, res) {
                // throw error if there is issue writing data
                if (err) throw err;
              }
            );

            // array of actions to prompt user
            let addagainPrompt = [
              {
                name: "again",
                type: "list",
                message: "Would you like to add another role?",
                choices: ["Yes", "Exit"],
              },
            ];

            // prompt user actions using inquirer
            inquirer
              .prompt(addagainPrompt)

              // await user response from inquirer
              .then(function (answer) {
                // SQL command to get data from roles table and data from department.dept_name where department.id = roles.department_id
                let query =
                  "SELECT roles.id, roles.title AS roles, roles.salary, department.dept_name FROM roles INNER JOIN department ON department.id = roles.department_id;";

                connection.query(query, function (err, res) {
                  // throw error if there is issue accessing data
                  if (err) throw err;

                  if (answer.again == "Yes") {
                    // prompt add new role to employee_db
                  } else if (answer.again == "Exit") {
                    // print data retrieved to terminal in table format
                    console.table(res);

                    // prompt user for next action
                    cli_prompt();
                  }
                });
              });
          }
        });
    });
  });
}

// exit employee-traker
function exit() {
  // terminate mySQL connection
  connection.end();

  // say good bye
  console.log("Goodbye");
}
