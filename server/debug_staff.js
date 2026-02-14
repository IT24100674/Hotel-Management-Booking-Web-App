const http = require('http');

http.get('http://localhost:5000/api/staff', (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received.
    resp.on('end', () => {
        console.log(data);
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
