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
This will make sure all your new changes are safe.

### 3. Deploy your static website
You deploy your changes to your GitHub Pages website using `npm run deploy`. This will automatically deploy the changes to the `gh-pages` branch.