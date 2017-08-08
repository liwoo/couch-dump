const fs = require('fs')
const http = require('http')
const async = require('async')

let callbacks = []
const partitions = 100
const ip_address = process.argv[2]
const db_name = process.argv[3]
const row_nums = process.argv[4]
const rows_per_partition = Number(row_nums) / partitions
for (let i=0; i<partitions; i++) {
    let skip = i * rows_per_partition;
    let file = ''
    let dump_file_name = 'dumps2/dump_'+(i+1)
    
    const url = 
        'http://'+ip_address+':5984/'+db_name+'/_all_docs?include_docs=true&skip='+skip+'&limit='+rows_per_partition

    let cb = () => {
        http.get(url, resp => {
            resp.setEncoding('utf8')
            resp.on('data', data => {
                file += data
            })
            resp.on('error', error => console.error(error))
            resp.on('end', () => {
                const dump = fs.createWriteStream(dump_file_name)
                dump.write("{\"docs\":[")
                JSON.parse(file).rows
                    .forEach((row_in_partition, i, arr) => {
                        dump.write(String(JSON.stringify(row_in_partition.doc)))
                        if (i < arr.length - 1) {
                            dump.write(',\n')
                        }
                    })
                dump.write(']}')
                dump.end()
                console.log('Done Dumping into '+ dump_file_name)
            })
        }).on('error', error => console.error(error))
    }
    callbacks.push(cb)
}

async.parallel(callbacks)
