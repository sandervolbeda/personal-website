# Personal website
These are the deployment steps for this website:

### Step 1
Run `npm install` to install de required dependencies.

### Step 2
Run `npx gulp default` to start the development server. This will automatically open a tab in your default browser.

### Optional
Run `npx gulp build` to generate the `dist` folder which holds all the minified files.

## Deployment to GitHub Pages
When you've updated your website and want to publish the changes, this is what you do:

### 1. Commit your changes
This will automatically build the production ready version of your website in the `dist` folder.

### 2. Push your changes to master
Pushing to the master branch will trigger a GitHub action which deploys your website automatically.
