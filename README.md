# openersolutions.com

The build uses [gulp.js](http://gulpjs.com/).

Development and production builds are the same, but you can start a file watcher using `npm run watch`. 

Builds can be initiated with `npm run build` and build files are located in `dist/`.


## Adding jobs

New pages to the jobs list can be added by creating an HTML partial in `src/pages/jobs`. See other examples in the folder.

Once the HTML partial is created, add the listing to `src/pages/jobs/map.json`. A listing is a JSON object with the following structure:

    {
        title: <TITLE OF JOB>,
        path: <PATH TO HTML PARTIAL>
    }
    
The link and page will automatically be created and added to the site.