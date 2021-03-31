const express = require('express');
const {v4 : uuid} =require('uuid')

const app = express();
app.use(express.json());

const customers = [];

const verifyIfExistisAccountCPF = (request , response, next) => {
    const {cpf} = request.headers;

    const customer = customers.find(customer => customer.cpf === cpf);

    if(!customer){
        return response.status(400).send({error: ' customer not found'});
    }

    request.customer = customer;
     
    return next();
}

const getBalance = (statement) => {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit'){
            return acc + operation.amount;
        }else{
            return acc - operation.amount;
        }   
    }, 0);
    return balance;
}

app.post('/account' , (request, response) => {
    const {cpf, name } = request.body;

    const checkCpf = customers.some(
        customer => customer.cpf === cpf,
    );

    if(checkCpf){
        return response.status(400).send({erro: ' customer already existis!'})
    }

    customers.push({
        cpf,
        name,
        id : uuid(),
        statement: [],
    });

    return response.status(201).send();
})

app.get('/statement', verifyIfExistisAccountCPF ,(request, response) => {
    const {customer} = request;
    return response.json(customer.statement);
})

app.post('/deposit', verifyIfExistisAccountCPF, (request, response) => {
    const { description , amount } = request.body;
    const {customer} = request;

    const statementOperation = {
        description,
        amount,
        create_at: new Date(),
        type: 'credit',
    }

    customer.statement.push(statementOperation);

    return response.status(201).json(statementOperation);
})

app.post('/withdraw', verifyIfExistisAccountCPF, (request,response) => {
    const {amount} = request.body;
    const {customer} = request;

    const balance = getBalance(customer.statement);

    if(balance < amount) {
        return response.status(400).json({erro: ' insufficient funds!'})
    }

    const statementOperation = {
        amount,
        create_at: new Date(),
        type: 'debit',
    };

    customer.statement.push(statementOperation);

    return response.status(201).json(statementOperation);
})

app.get('/statement/date', verifyIfExistisAccountCPF, (request, response) => {
    const {customer} = request;
    const {date} = request.query;

    const dateFormat = new Date(date + " 00:00");
    
    const statement = customer.statement.filter(
        state => state.create_at.toDateString() === new Date(dateFormat).toDateString()
    ) ;

    return response.json(statement);
});

app.put('/account', verifyIfExistisAccountCPF, (request, response) => {
    const {name} = request.body;
    const {customer} = request;

    customer.name = name;

    response.status(201).json(customer);
})

app.get('/account', verifyIfExistisAccountCPF, (request, response) => {
    const { customer} = request;

    return response.json(customer);
})

app.delete('/account', verifyIfExistisAccountCPF, (request, response) => {
    const { customer } = request;
    customers.splice(customer,1);
    return response.status(200).json(customer);
})


app.get('/balance', verifyIfExistisAccountCPF, (request, response) => {
    const { customer } = request;

    const balance = getBalance(customer.statement);

    return response.json(balance);
})


app.listen(3333, () => {
    console.log('no ar');
});