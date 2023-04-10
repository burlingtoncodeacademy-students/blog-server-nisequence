const router = require("express").Router();
const db = require("../api/blog.json");
const fs = require("fs");
const fsPath = "./api/blog.json";

//*  Endpoint that will display all comments from the database. In lieu of database, we use our blog.json file.
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

//* Endpoint that will display one comment from the database selected by its post_id
router.get("/view/:id", (req, res) => {
    try {
        const id = req.params.id;

        let comment = db.filter((obj) => obj.post_id == id);

        res.status(200).json({
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
router.post("/new", (req, res) => {
    try {
    // Object Destructuring to help individually grab the keys & values (properties) of our character object coming from req.body
        let { title, author, body } = req.body;

    // Use math to create an id for the new character
        let newId = db.length + 1;

    // Declare and assign newChar object
        const newPost = {
        post_id: newId,
        title,
        author,
        body
        };

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

            fs.writeFile(fsPath, JSON.stringify(blogData), (err) => console.log(err));

            res.status(200).json({
                status: `Created new comment titled "${newPost.title}"!`,
                newPost,
            });
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
});

//* Endpoint that will allow us to update an existing entry once a match has been found. The search should be done via a query parameter, whereas update information should be enclosed within the body.
router.put("/edit/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        const updatedInfo = req.body;

        fs.readFile(fsPath, (err, data) => {
            if (err) throw err;

            const blogData = JSON.parse(data);

            let updatedPost;

            blogData.forEach((obj, i) => {
                if (obj.post_id === id) {
                    let buildObj = {};

                    for (key in obj) {
                        if (updatedInfo[key]) {
                            console.log("Checked");
                            buildObj[key] = updatedInfo[key];
                        } else {
                        buildObj[key] = obj[key];
                        }
                    }

                    blogData[i] = buildObj;
                    changedPost = buildObj;
                }
            });

            // Give user an error if id does not exist
            if (Object.keys(changedPost).length <= 0)
                res.status(404).json({ message: "No comment found with that ID!" });

                fs.writeFile(fsPath, JSON.stringify(blogData), (err) => console.log(err));

                res.status(200).json({
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
router.delete("/remove/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        fs.readFile(fsPath, (err, data) => {
            if (err) throw err;

            const blogData = JSON.parse(data);

            const filteredDb = blogData.filter((i) => i.post_id !== id);

            fs.writeFile(fsPath, JSON.stringify(filteredDb), (err) =>
                console.log(err)
            );

            res.status(200).json({
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