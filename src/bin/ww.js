import app from '../app.js'


// Start the server
const port = 3000
const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

export default server