full user register auth and login api
this backend server contains 3 parts

first

USER REGISTRATION
wich in it self have two parts

first step registration route
`http://localhost:${PORT}`/register Post method
User Schema is simple and can be changed for any app but for now it only contains name password and email
so providing json in body request
{
"name":"unique name",
"password":"longer than 6 characters",
"email":"valid unique email"
}
a token will be sent to the provided email and will be user in next step to confirm registration

second step activation route
`http://localhost:${PORT}`/activation Post method
provide activation_token json in body
{
"activation_token":"Token from prev step"
}
note token only valid for 5 minutes
if token is valid user will be added to data base
User LOGIN
`http://localhost:${PORT}`/login
provide valid email and password
{
"email":"user valid email",
"password":"user valid password"
}
if correct user will recieve access token valid for 30d
token will be needed to access user routes
staying in the auth section
CHANGE PASSWORD ROUTE
changing password comes with two steps
first request password change
`http://localhost:${PORT}`/requestPasswordChange
provide user email in body
{
"email":"user email"
}
a token will be sent to the email that will be needed in next step
second change password
`http://localhost:${PORT}`/changepassword
provide the token from last step and a valid new password in body
{
"activation_token":"TOKEN",
"password":"password longer than 6 characters"
}
if token is valid the password will be change
