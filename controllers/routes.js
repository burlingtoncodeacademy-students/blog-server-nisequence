const router = require("express").Router();

//*  Endpoint that will display all comments from the database. In lieu of database, we use our blog.json file.

//* Endpoint that will display one comment from the database selected by its post_id

//* Endpoint that will allow us to create a new entry which will be appended to the .json file's outermost array.

//* Endpoint that will allow us to update an existing entry once a match has been found. The search should be done via a query parameter, whereas update information should be enclosed within the body.

//* Endpoint that will allow us to delete an entry from our .json file. This should be done thru the utilization of the parameter.

//! keep at bottom of file
module.exports = router;