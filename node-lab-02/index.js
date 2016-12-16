'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;
const server = http.createServer((req, res) => {
    let pathname = url.parse(req.url).pathname;

    console.log(`Path: ${pathname}`);
    console.log(`Method: ${req.method}`);
    console.log(`Headers: ${JSON.stringify(req.headers)}`);

    if (req.method === 'GET') {
        let resource = pathname.substr(1);

        if (resource === '') {
            resource = 'index.html';
        }

        resource = process.cwd() + '/build/' + resource;

        fs.readFile(resource, (err, data) => {
            if (err) {
                // 404: File not found
                console.error(`Error reading file: ${err.message}`, resource);
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.write(`
                    <html>
                        <body>
                            <p>Sorry file '${resource}' not found</p>
                        </body>
                    </html>
                `);
            } else {
                // 200: OK
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(data.toString());
            }

            res.end();
        });
    } else if (req.method === 'POST') {
        let headers = req.headers;
        let method = req.method;
        let rUrl = req.url;
        let body = [];

        //Handle req events: data, end, error
        req.on('error', function (err) {
            console.error(err);
        }).on('data', function (chunk) {
            body.push(chunk);
        }).on('end', function () {
            body = Buffer.concat(body).toString();
            // at this point, `body` has the entire req body stored in it as a string
            console.log(body);

            //Start emiting res
            //Handle res errors
            res.on('error', function (err) {
                console.error(err);
            });

            // Retun res - 201 : Created
            // res.statusCode = 200;
            // res.setHeader('Content-Type', 'application/json');
            res.writeHead(201, {
                'content-type': 'application/json',
                'location': `http://127.0.0.1:${port}/echo`
            });

            var resBody = {
                headers: headers,
                method: method,
                url: rUrl,
                body: body
            };

            res.write(JSON.stringify(resBody));
            res.end();
        });
    }

});

server.listen(port, hostname, (err) => {
    if (err) console.error(err);
    console.log(`Server running at http://${hostname}:${port}/`);
});