const fs = require('fs')
const http = require('http')
const file_path = 'dump.json'
const dest_file = fs.createWriteStream('./'+file_path)

const dump = http.get(process.argv[2], (resp) => {
    resp.setEncoding('utf8')
    resp.on('data', data => dest_file.write(data+'\n'))
    resp.on('error', error => console.error(error))
    resp.on('end', () => {
        console.log('done')
        /*
        dest_file.end()  
        fs.readFile(file_path, (err, data) => {
            if (err) {
                console.error(err)
            } else {
                JSON.parse(data.toString()).rows
                    .forEach(row => console.log(row.doc))
            }
        })*/
    })
}).on('error', error => console.error(error)) 
