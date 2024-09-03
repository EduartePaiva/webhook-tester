[x] - test a post to localhost from a web client: result: cors problem if it's in the browser.
[x] - setup a database locally with docker or other thing.
[x] - create a users table.
[x] - learn how to safely store passwords.
[x] - create the api for creating a new user.
[x] - account for lowercase and uppercase email from user.
[x] - start creating the client
[x] - start exploring socket.io api
[x] - rename auth related things to auth instead of users
[x] - make zod check env variables, creating a initEverything function.
[x] - do email confirmation.
[x] - setup authentication from scratch.
[x] - setup loginUser with jwt authentication.
[x] - search how to publish this on a real server.
[x] - setup expiration date for auth.
[x] - test if expiration works properly.
[x] - make initEverything actually stop the app if it fails.
[x] - publish on a ec2 instance.
[x] - create a real db to host the database. CockroachDB db
[x] - test if the email will be sent.
[x] - remake the create user logic, it'll receive a jwt token that it's the email, the password and username and then will decrypt the token and create a user if the token is valid, it have to check if user is already created too.
[_] - deploy the updated version to see if everything works.