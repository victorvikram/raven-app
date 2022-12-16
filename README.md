# Raven editor
The RAVEN editor has two parts: a flask server (raven-server) and a react front end (raven-app). The front end sends requests to the flask server specifying the criteria for generating the RAVEN problem. Then the server generates the problem. This guide will instruct you on how to install both.
## Installation
1. Clone the RAVEN app from [here](https://github.com/victorvikram/raven-app): `git clone <url>`
2. Clone the RAVEN server from [here](https://github.com/victorvikram/raven-server): `git clone <url>`
3. If you don't already have node.js, install it [here](https://nodejs.org/en/).
4. Run `npm install` in the root directory of the RAVEN app. This installs the necessary react packages.
5. If you don't already have python and `pip`, you can install it [here](https://www.python.org/). Alternatively, you can install [Anaconda](http://anaconda.com/) which comes with many data science packages preinstalled. 
6. You may need to add `pip` and `python` to the system path if the installer didn't do that automatically. This allows you to run `pip` and `python` commands from the command line without specifying the full path ([here](https://datatofish.com/add-python-to-windows-path/) are example instructions for Windows, a google search will provide instructions for other OSes).
7. From the root directory of the RAVEN server, run `
pip install -r requirements.txt`. This installs the necessary python packages.

## To run
1. From the RAVEN app root directory, run `npm start`
2. From the RAVEN server root directory, first you need to set an environment variable. Different systems accomplish this differently:
*Powershell*: `$env:FLASK_APP = "app"`
*Cmd*: `set FLASK_APP=app`
*Bash*: `export FLASK_APP=app`
Then, run `flask run -h localhost -p 5000`.
And that's all!

You may need to ensure that the line `let url = <url>` at the top of `app.js` in the RAVEN app root directory matches with the URL of the flask server (it will tell you the URL it is running on after you run `flask run`). Note that `localhost` and `127.0.0.1` are equivalent.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
