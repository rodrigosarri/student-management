const express = require('express');
const app     = express();
const fs      = require('fs');

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    const data = require('./data.json');

    if (data) {
        const jsonData = JSON.parse(JSON.stringify(data));

        res.render(
            'pages/index.ejs',
            {
                list: jsonData.data.length > 0 ? jsonData.data : null
            }
        );
    }
});

app.get('/form/:code', (req, res) => {
    const data = require('./data.json');

    if (data) {
        let object = {
            code: null,
            name: null,
            checkpoint1: null,
            checkpoint2: null,
            checkpoint3: null,
            active: null
        };

        if (req.params.code !== 'new') {
            const jsonData = JSON.parse(JSON.stringify(data));
            const check    = jsonData.data.find((item) => {
                return item.code === req.params.code;
            });

            if (check) {
                object = check;
            }
        }

        res.render(
            'pages/form.ejs',
            object
        );
    }
});

app.get('/list', (req, res) => {
    const data = require('./data.json');

    if (data) {
        const jsonData = JSON.parse(JSON.stringify(data));
        res.render(
            'pages/list.ejs',
            {
                list: jsonData.data.length > 0 ? jsonData.data : null
            }
        );
    }
});

app.post('/save', (req, res) => {
    let jsonString = '';

    req.on('data', (data) => {
        jsonString += data;
    });

    req.on('end', () => {
        const params = new URLSearchParams(jsonString);

        fs.readFile('./data.json', (error, data) => {
            if (error) {
                res.send({
                    'status': 500,
                    'type'  : 'danger',
                    'msg'   : `Não foi possível processar sua solicitação: ${error}`
                });                
            }

            const jsonData = JSON.parse(data);
            let code, name, checkpoint1, checkpoint2, checkpoint3, avg, active;

            name        = params.get('name');
            checkpoint1 = parseFloat(params.get('checkpoint1'));
            checkpoint2 = parseFloat(params.get('checkpoint2'));
            checkpoint3 = parseFloat(params.get('checkpoint3'));
            avg         = parseFloat(((checkpoint1 + checkpoint2 + checkpoint3)/3).toFixed(1));
            active      = JSON.parse(params.get('active'));

            if (params.get('code') !== 'null') {
                const index = jsonData.data.findIndex((item) => item.code === params.get('code'));

                if (index < 0) {
                    res.send({
                        'status': 400,
                        'type'  : 'warning',
                        'msg'   : `Não foi encontrado o registro com o código: ${code}`
                    });                    
                }

                console.log(jsonData.data[index]);

                jsonData.data[index] = {
                    code: params.get('code'),
                    name,
                    checkpoint1,
                    checkpoint2,
                    checkpoint3,
                    avg,
                    active
                }

            } else {
                json  = {
                    code: Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1),
                    name,
                    checkpoint1,
                    checkpoint2,
                    checkpoint3,
                    avg: avg,
                    active
                }

                jsonData.data.push(json);
            }

            
            fs.writeFile('./data.json', JSON.stringify(jsonData), 'utf-8', (error) => {
                if (error) {
                    res.send({
                        'status': 500,
                        'type'  : 'danger',
                        'msg'   : `Não foi possível processar sua solicitação: ${error}`
                    });                    
                }

                res.send({
                    'status': 200,
                    'type' : 'success',
                    'msg': 'Dados salvo com sucesso'
                }); 
            });

        });

    });
});

app.delete('/delete/:code', (req, res) => {
    const dados = require('./data.json');

    if (!req.params.code) {
        res.send({
            'status': 400,
            'type'  : 'warning',
            'msg'   : `Não é possível apagar um registro sem o envio do código`
        });         
    }

    const jsonData = JSON.parse(JSON.stringify(dados));
    const check    = jsonData.data.findIndex((item) => item.code === req.params.code);

    if (check < 0) {
        res.send({
            'status': 400,
            'type'  : 'warning',
            'msg'   : `Não foi encontrado o registro com o código: ${req.params.code}`
        });         
    }

    jsonData.data.splice(check, 1);

    fs.writeFile('./data.json', JSON.stringify(jsonData), 'utf-8', (error) => {
        if (error) {
            res.send({
                'status': 500,
                'type'  : 'danger',
                'msg'   : `Não foi possível processar sua solicitação: ${error}`
            });                
        }

        res.send({
            'status': 200,
            'type' : 'success',
            'msg': 'Registro apagado com sucesso'
        });

    });
});

app.listen('8080');