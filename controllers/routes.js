const router = require("express").Router();
const db = require("../api/blog.json");
const fs = require("fs");
const fsPath = "./api/blog.json";

//*  Endpoint that will display all comments from the database. In lieu of database, we use our blog.json file.
// Route: http://localhost:4002/routes/view
router.get("/view", (req, res) => {
    try {
        res.status(200).json({
            results: db,
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
});

//* Bonus endpoint that will display the latest comment from the database.
// Route: http://localhost:4002/routes/view/new
router.get("/view/new", (req, res) => {
    try {
        let newCommentID = db.length;

        // filter through db objects until highest ID is found
        let newestComment = db.filter((obj) => obj.post_id == newCommentID);

        res.status(200).json({
            // serve findings to user
            status: `Found latest comment with id: ${newCommentID}`,
            newestComment,
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
});

//* Endpoint that will display one comment from the database selected by its post_id
// Route ex: http://localhost:4002/routes/view/1
router.get("/view/:id", (req, res) => {
    try {
        const id = req.params.id;

        // filter through db objects until request ID is found
        let comment = db.filter((obj) => obj.post_id == id);

        res.status(200).json({
            // serve findings to user
            status: `Found comment with id: ${id}`,
            comment,
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
});

//* Endpoint that will allow us to create a new entry which will be appended to the .json file's outermost array.
// Route: http://localhost:4002/routes/new
router.post("/new", (req, res) => {
    try {
    // Object Destructuring
        let { title, author, body } = req.body;

    // Use math to create an id for the new post/comment
        let newId = db.length + 1;

    // Declare and assign newPost object
        const newPost = {
        post_id: newId,
        title,
        author,
        body
        };

        // Check to ensure there is not another post with a higher ID#
        fs.readFile(fsPath, (err, data) => {
            if (err) throw err;

            const blogData = JSON.parse(data);

            let currentPostIDs = [];

            blogData.forEach((obj) => {
            currentPostIDs.push(obj.post_id);
            });

            if (currentPostIDs.includes(newId)) {
                let maxValue = Math.max(...currentPostIDs);
                newId = maxValue + 1;
                newPost.post_id = newId;
            }

            blogData.push(newPost);

            // Post the new comment to the database
            fs.writeFile(fsPath, JSON.stringify(blogData), (err) => console.log(err));

            res.status(200).json({
                // confirm to the user that the comment was made
                status: `Created new comment titled: ${newPost.title}`,
                newPost,
            });
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
});

//* Bonus endpoint that will display comments from the database by searching body contents.
// Route ex: http://localhost:4002/routes/search/devs
router.get("/search/:contents", (req, res) => {
    try {
        // grab the value of :contents
        const searchInput = req.params.contents;

        // convert this to lowercase
        const searchParam = searchInput.toLowerCase();

        // create a blank array to push results that meet the criteria
        let finalResults = [];

        let maxValue = db.length;

        // read the json file in order to analyze contents
        fs.readFile(fsPath, (err, data) => {
            if (err) throw err;

            const blogData = JSON.parse(data);

            let currentResults = [];

            // using a for loop to pull apart each object's body text
            for (x = 0; x < maxValue; x++) {
                let currentPost = blogData[x]["body"];
                let formatPost = currentPost.toLowerCase();
                currentResults = formatPost.split(' ');
                if (currentResults.includes(searchParam)) {
                    // if the array built on the post's body has what we want, we add the entire post in its original format to our finalResults array
                    finalResults.push(blogData[x]);
                }
            }

            if (finalResults.length === 0) {
                // if we were not able to add anything to our finalResults array (nothing found), let the user know
                res.status(401).json({
                    message: `There are no comments with keyword: ${searchParam}`,
                });
            } else {
                // if we were, let the user know what those comments were
                res.status(200).json({
                    status: `Found comment(s) with keyword: ${searchParam}`,
                    comments: finalResults
                });
            }
        })
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
});

//* Bonus endpoint that will display comments from the database by author input.
// Route ex: http://localhost:4002/routes/find/Nicole%20Sekol
//! Reminder to self: use %20 for spaces
router.get("/find/:author", (req, res) => {
    try {
        // grab the value of :author
        const authorParam = req.params.author;

        // look for the lowercased version of our param within each database object's author value
        let commentResults = db.filter((obj) => obj.author.toLowerCase() === authorParam.toLowerCase());

        if (commentResults.length === 0) {
            // if there aren't any matching comments, let the user know
            res.status(401).json({
                message: `There are no comments by author ${authorParam}.`,
            });
        }

        res.status(200).json({
            // if there are matching comments, let the user know what they are
            status: `Found comment(s) by author: ${authorParam}`,
            foundComments: commentResults
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
});

//* Endpoint that will allow us to update an existing entry once a match has been found. The search should be done via a query parameter, whereas update information should be enclosed within the body.
// Route ex: http://localhost:4002/routes/edit/2
router.put("/edit/:id", (req, res) => {
    try {
        // Numberify the :id param
        const id = Number(req.params.id);

        // grab the request info
        const updatedInfo = req.body;

        fs.readFile(fsPath, (err, data) => {
            if (err) throw err;

            // grab the entire contents of the file
            const blogData = JSON.parse(data);

            let changedPost;

            // compare the request body to the existing database values
            blogData.forEach((obj, i) => {
                if (obj.post_id === id) {
                    let buildObj = {};

                    for (key in obj) {
                        if (updatedInfo[key]) {
                            //console.log("Checked");
                            buildObj[key] = updatedInfo[key];
                        } else {
                        buildObj[key] = obj[key];
                        }
                    }

                    // change just the thing that needs to be changed
                    blogData[i] = buildObj;

                    // create a variable to let the user know what the update was
                    changedPost = buildObj;
                }
            });

            // Give user an error if id does not exist
            if (Object.keys(changedPost).length <= 0)
                res.status(404).json({ message: "No comment found with that ID!" });

                // update JSON file with whatever was changed
                fs.writeFile(fsPath, JSON.stringify(blogData), (err) => console.log(err));

                res.status(200).json({
                    // confirm changes to user
                    status: `Modified comment w/ ID #${id}.`,
                    updatedPost: changedPost,
                });
        });
    } catch (err) {
        res.status(500).json({
        error: err.message,
        });
    }
});

//* Endpoint that will allow us to delete an entry from our .json file. This should be done thru the utilization of the parameter.
// Route ex: http://localhost:4002/routes/remove/2
router.delete("/remove/:id", (req, res) => {
    try {
        // Numberify the value of :id
        const id = Number(req.params.id);

        fs.readFile(fsPath, (err, data) => {
            if (err) throw err;

            const blogData = JSON.parse(data);

            // look for all comments that do NOT have the id input by the user
            const filteredDb = blogData.filter((i) => i.post_id !== id);

            // rewrite the file with all items found above
            fs.writeFile(fsPath, JSON.stringify(filteredDb), (err) =>
                console.log(err)
            );

            res.status(200).json({
                // confirm to the user that the requested comment was found and is deleted
                status: `ID: Comment #${id} was successfully deleted.`,
            });
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
});

//! keep at bottom of file
module.exports = router;