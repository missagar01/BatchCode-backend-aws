const { z } = require('zod');

const usernameField = z
  .string()
  .min(1, 'user_name must be at least 1 character')
  .max(150);

const employeeIdField = z
  .string()
  .min(1, 'employee_id must be at least 1 character')
  .max(150);

const passwordField = z
  .string()
  .min(1, 'password is required')
  .max(200);

const usernameAliasField = z
  .string()
  .min(1, 'username must be at least 1 character')
  .max(150);

const roleField = z
  .string()
  .min(2, 'role must be at least 2 characters')
  .max(50)
  .optional()
  .transform((value) => value ?? 'user');

const loginSchema = {
  body: z.object({
    user_name: usernameField.optional(),
    username: usernameAliasField.optional(),
    employee_id: employeeIdField.optional(),
    password: passwordField
  }).refine((data) => data.user_name || data.username || data.employee_id, {
    message: 'Either user_name, username, or employee_id is required',
    path: ['user_name']
  })
};

module.exports = { loginSchema };
