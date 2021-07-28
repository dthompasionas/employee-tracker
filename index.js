const inquirer = require("inquirer");
const columnify = require('columnify');
const mysql = require("mysql");


let listOfAvailableRoles = [];

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'employees_db',
    port: 3306
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
            "Remove Role",
            "exit"
        ]
        
    }

];

// prompt user with inquirer and execute function corresponding to user selection
function  cli_prompt() {
   
    // prompt user actions using inquirer 
    inquirer.prompt(mainPrompt)
    
    // await user response from inquirer
    .then(function(answer) {

        // execute function viewAll if user selection is "View All employees"
        if(answer.action == "View All Employees") {
            
            showAllEmployees();
        
        // execute function viewDept if user selection is "View departments"
        }else if(answer.action == "View Departments") {

            viewDept();

        
        }else if(answer.action == "View All Employees By Manager") {

            showAllEmployeesByManager();

        
        }else if(answer.action == "Add Employee") {

            addEmployee();
            
        
        }else if(answer.action == "Remove Employee") {

            removeEmployee();
       
        
        }else if(answer.action == "Update Employee Manager") {

            updateEmployeeManager();


        
        }else if(answer.action == "Add Role") {

            addRole();


        }else if(answer.action == "Remove Role") {

            removeRole();

        // execute function EXIT if user selection is "EXIT"
        }else if(answer.action == "exit") {

            exit();
         
        };

        
        

    });    

};


function showAllEmployees() {

    // SQL command to get employee first_name/ last_name/ manager id, role title/ salary and department name data from employees, roles, and department tables
    let query =

        "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name AS department, employees.manager_id " +
        "FROM employees " +
        "JOIN roles ON roles.id = employees.role_id " +
        "JOIN department ON roles.department_id = department.id " +
        "ORDER BY employees.id;"

    ;

    // connect to mySQL useing query instruction to access employees table
    connection.query(query, function(err, res) {
        
        // throw error if there is issue accessing data
        if (err) throw err;

        // add manager names to the manager_id col to be displayed in terminal
        for(i = 0; i < res.length; i++) {

            // if manager_Id contains a "0" then lable it as "None"
            if(res[i].manager_id == 0) {
                
                res[i].manager = "None" 
            
            }else{

                // create new row called manager, containing each employee's manager name
                res[i].manager = res[res[i].manager_id - 1].first_name + " " + res[res[i].manager_id - 1].last_name;

            };

            // remove manager id from res so as to not display it
            delete res[i].manager_id;

        };

        // print data retrieved to terminal in table format 
        console.table(res); 
        
        // prompt user for next action
        cli_prompt();

    });

};


// view all departments in employee_db
function viewDept() {

    // SQL command to get data from department table
    let query = "SELECT department.dept_name AS departments FROM department;";

    // connect to mySQL useing query instruction to access departments table
    connection.query(query, function(err, res) {
        
        // throw error if the is issue accessing data
        if (err) throw err;

        // print data retrieved to terminal in table format 
        console.table(res); 
        
        // prompt user for next action
        cli_prompt();

    });

};

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

const addEmployee = () => {
  let department_id;
  let manager_id;
  let role_id;
  let employeeNames = [];
  let availableRoleTitles = [];

  listOfAvailableRoles.forEach((role) => {
    availableRoleTitles.push(role.title);
  });

  connection.query("SELECT * FROM employees", function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      employeeNames[i] = `${res[i].first_name} ${res[i].last_name}`;
    }
    employeeNames.push("None");
  });

  inquirer
    .prompt([
      {
        name: "first_name",
        type: "input",
        message: "What is the employees's first name?",
        validate: (name) => /^[a-zA-Z ]+$/.test(name),
      },
      {
        name: "last_name",
        type: "input",
        message: "What is the employees's last name?",
        validate: (name) => /^[a-zA-Z ]+$/.test(name),
      },
      {
        name: "role",
        type: "list",
        message: "What is the employees's role?",
        choices: availableRoleTitles,
      },
      {
        name: "manager",
        type: "list",
        message: "Who is the employees's manager?",
        choices: employeeNames,
      },
    ])
    .then((answer) => {
      employeeNames[role_id] = `${answer.first_name} ${answer.last_name}`;

      for (let i = 0; i < employeeNames.length; i++) {
        if (
          employeeNames[i] === answer.manager &&
          employeeNames[i] !== "None"
        ) {
          manager_id = i + 1;
          
        } else if (answer.manager === "None") {
          manager_id = null;
          
        }
      }

      listOfAvailableRoles.forEach((role) => {
        if (answer.role === role.title) {
          role_id = role.id;
        }
      });

      switch (department_id) {
        case 1:
          department = "Sales";
          

        case 2:
          department = "Engineering";
          

        case 3:
          department = "Finance";
          

        case 4:
          department = "IT";
          
      }

      connection.query(
        "INSERT INTO employees SET ?",
        {
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: role_id,
          manager_id: manager_id,
        },
        (err) => {
          if (err) throw err;
           cli_prompt();
        }
      );
    });
};

function removeEmployee() {

    // SQL command to get data from roles table
    let query = "SELECT employees.id, employees.first_name, employees.last_name FROM employees;";

    
    connection.query(query, function(err, res){
        if (err) throw err;

        // combine names from first_name/ last_name cols to be displayed in terminal
        for(i = 0; i < res.length; i++) {

            res[i].employee = res[i].first_name + " " + res[i].last_name;
            delete res[i].first_name;

            delete res[i].last_name;

        };

        // print data retrieved to terminal in table format 
        console.table(res);

        let employeeList = res;

        // array of actions to prompt user
        let addEmpPrompt = [

            {
        
                name: "select_employee",
                type: "list",
                message: "Terminate employee",
                
                choices: function() {
                    
                    employees = [];
        
                    for(i = 0; i < employeeList.length; i++) {
                        employees.push(employeeList[i].id + ": " + employeeList[i].employee);
                        
                    };
                    
                    employees.unshift("0: Exit");


                    return employees;
        
                }
                
            },

            {
                
                name: "confirm",
                type: "list",

                message: function(answers) {
                        
                    return "Are you sure you want to TERMINATE " + answers.select_employee.split(": ")[1];
                
                },
                
                // prompt user to pick between Yes and No
                choices: ["Yes","No"],

                // dont use this prompt if user selected Exit in previous prompt
                when: function( answers ) {
                    
                    return answers.select_employee !== "0: Exit";
                
                }
                
            }

        ];

        // prompt user actions using inquirer 
        inquirer.prompt(addEmpPrompt)

        .then(function(answer) {

            if(answer.select_employee == "0: Exit") {

                cli_prompt();
            
            // if user selects "No" restart deleteEmployee
            }else if(answer.confirm == "No") {

                // prompt user for next action
                deleteEmployee();

            }else{

                let query = "DELETE FROM employees WHERE employees.id =" + answer.select_employee.split(": ")[0];

                connection.query(query, function(err, res) {

                    // throw error if there is issue writing data
                    if (err) throw err;
                
                });

                // array of actions to prompt user
                let addagainPrompt = [

                    {
                
                        name: "again",
                        type: "list",
                        message: "Would you like to remove another employee?",
                        choices: ["Yes","Exit"]
                    
                    }

                ];

                // prompt user actions using inquirer 
                inquirer.prompt(addagainPrompt)

                .then(function(answer) {

                    let query = "SELECT employees.id, employees.first_name, employees.last_name FROM employees;";

                    connection.query(query, function(err, res){

                        // throw error if there is issue accessing data
                        if (err) throw err;

                        // combine names from first_name/ last_name cols to be displayed in terminal
                        for(i = 0; i < res.length; i++) {
                            res[i].employee = res[i].first_name + " " + res[i].last_name;

                            delete res[i].first_name;

                            delete res[i].last_name;

                        };

                        // execute function updateEmployee again if user selection is "Yes"
                        if(answer.again == "Yes") {

                            deleteEmployee();
                        
                        }else if(answer.again == "Exit") {
                            
                            
                            // print data retrieved to terminal in table format 
                            console.table(res);

                            // prompt user for next action
                            cli_prompt(); 

                        };

                    });

                });

            };

        });

    });
    
};

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


const addRole = () => {
  const questions = [
    {
      name: "roleTitle",
      type: "input",
      message: "Plese enter the title for the new role you want to add",
      validate: (name) => /^[a-zA-Z ]+$/.test(name),
    },
    {
      name: "salary",
      type: "input",
      message: "Please enter the amount of salary considered for that role",
      validate: (number) => /^\d+$/.test(number),
    },
    {
      name: "departmentID",
      type: "rawlist",
      message: "What department this role belongs to?",
      choices: ["Sales", "Engineering", "Finance", "IT"],
    },
  ];

  inquirer.prompt(questions).then((answer) => {
    let departmentID;

    switch (answer.departmentID) {
      case "Sales":
        departmentID = 1;
        

      case "Engineering":
        departmentID = 2;
        

      case "Finance":
        departmentID = 3;
        

      case "IT":
        departmentID = 4;
        
    }

    listOfAvailableRoles.push({
      title: answer.roleTitle,
      salary: answer.salary,
      department_id: departmentID,
      id: listOfAvailableRoles.length + 1,
    });

    let sql = `INSERT INTO role 
            (
                title, salary, department_id
            )
            VALUES
            (
                ?, ?, ?
            )`;

    connection.query(
      sql,
      [answer.roleTitle, answer.salary, departmentID],
      function (err, res) {
        if (err) throw err;
         cli_prompt();
      }
    );
  });
};

const removeRole = () => {
  let avilabaleRoleTitles = [];
  let roleID;

  listOfAvailableRoles.forEach((role) => {
    avilabaleRoleTitles.push(role.title);
  });

  const questions = [
    {
      name: "role",
      type: "rawlist",
      message: "Which one of these roles you want to remove from the database?",
      choices: avilabaleRoleTitles,
    },
  ];

  inquirer.prompt(questions).then((answer) => {
    listOfAvailableRoles.forEach((role) => {
      if (answer.role === role.title) {
        roleID = role.id;
      }
    });
    connection.query(
      "select first_name, last_name, title, department from employees inner join role on employees.role_id = role.id inner join department on role.department_id = department.id where role_id = ?",
      [roleID],
      function (err, res) {
        if (err) throw err;

        //Checking to see if the returned response is empty or not. If it's not empty, so the role is in use and cannot be deleted. Otherwise, the role will be deleted.
        if (res.length) {
          console.log("***************************************************");
          console.log(
            "You cannot remove the roles as long as they are assigned to employees. Please update the role of employees and try again."
          );
          console.log("***************************************************");
           cli_prompt();
        } else {
          listOfAvailableRoles.forEach((role) => {
            if (answer.role === role.title) {
              connection.query(
                "DELETE FROM role WHERE title = ?",
                answer.role,
                function (err, res) {
                  if (err) throw err;
                   cli_prompt();
                }
              );
            }
          });
        }
      }
    );
  });
};

// exit employee-traker 
function exit() {

    // terminate mySQL connection
    connection.end();

    // say good bye
    console.log("Goodbye")

};