USE employees_db;

-- Insert the following items to table department
INSERT INTO department(dept_name)
VALUES ('sales'),('Engineering'),('Information Technology'), ('Finance');

-- Insert the following items to table role
INSERT INTO roles(title, salary, department_id)
VALUES
('sales Manager', 120000, 1),('sales Person', 85000, 1),('Lead Software Engineer', 200000, 2),('senior Software Engineer', 160000, 2),('Junior Software Engineer', 120000, 2),('Systems Admin Manager', 100000, 3),('Systems Admin', 75000, 3),('Finance Manager', 110000, 4),('Financial Advisor', 80000, 4);

-- Insert the following items to table employees
INSERT INTO employees(first_name, last_name, role_id, manager_id)
VALUES ('Nicolas', 'Hernandez', 1, 4),('Nancy', 'Fitzsimons', 2, 0),('Ricardo', 'Fernandez', 3, 0),('Christopher', 'Raymond', 4, 0),('Jennifer', 'Smith', 5, 3),('Ashley', 'Dotson', 6, 2),('Jacob', 'Smith', 7, 4),('Stacey', 'Alvarenga', 8, 9),('Carmen', 'Rivera', 9, 0);