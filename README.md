# Final project
IDG2100 Full-stack Web development
Group 1

## Table of contents
* [Dotenv file](#Dotenv-file)
* [General info](#general-info)
* [Setup](#setup)
* [Features](#features)
* [Status](#status)

## Dotenv file
```
PORT=5000
DATABASE_CONNECT_URI=*DATABASE URL*
TOKEN_SECRET='SimpleTokenFinalProject1!'
EMAIL_LOGIN=noreplyemailsenderhere@gmail.com
EMAIL_PASSWORD=bJLLHaKcwPzu5g
FRONTENDHOST='http://localhost:3000'
NODE_ENV='production'
```

## General info
This repository is the front-end part of our Final Project for IDG2100 Full-stack Web development (Spring 2021) The project will be graded as an exam.

The task description is a follows:

> The department of design needs an administrative tool to monitor the
> state of the plants and their health.  This project is a small subset
> of the project you will implement in the “IDG2671 Web project” course.
> However, this could also work as a codebase for any other project that
> requires authenticated users.
> 
> You are in charge of designing and implementing a Web-based tool that:
> 
>  1. has two types of authenticated users (managers and users – a.k.a gardeners)
>  2. is protected by a password.
>  3. allows managers to administer users. This is: 	 
	>  3a. to see a list of users. 	 
	>  3b. to add/remove users.	 
	>  3c. to see/edit the profile of a user (name, role, etc.).
	>  3d. to reset the password of a user (*).
> 4. allows users to: 
	> 4a. see their profile.	
	> 4b. update their profile (except the email address).
> 
> (*) The reset password functionality will create a unique
> server-rendered URL that will be sent by email to the user whose
> password is being reset. The URL will render a form to let the user
> create a new password.

## Setup
To install the application follow these instructions. (Make sure to set the correct information in your .ENV file including front-end host)

 1. Download the files from GitHub.
 2. Open the project folder in an external editor. We have used Visual
    Studio Code during development.
 3. Open a terminal in the root folder of the project and run `npm install` to install the project dependencies.
 4. Run the `npm start` command to start the application.

## Features

localhost:5000/api-docs

## Status

 - Project start: Apr 7, 2021.
 - Project end: Apr 27, 2021.

The project is finished. Big chunks of the code are planned to be reused in another exam, but this repository will no longer be updated.

## Authors

 - Cornelius Ottar Sandmæl
 - Glenn Eirik Hansen
 - Thomas Lian Ødegaard
 - Tom Schrier