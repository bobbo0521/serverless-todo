'use strict'
const AWS = require('aws-sdk')
AWS.config.update({region:process.env.AWS_REGION})
const DynamoDB = new AWS.DynamoDB.DocumentClient()
const uuid = require('uuid/v4')

class CreateHandler{
    async process(event){
        try{
            const body = JSON.parse(event.body);
            return await Save(body.name);
        }
        catch(error){
            console.log(error);
            throw error;
        }
    }
}

async function Save(name){
    const params = {
        TableName: "todos",
        Item:{
            Id: uuid(),
            Name: name
        }
    }

    return await DynamoDB.put(params).promise().then(res => params.Item);
}

module.exports = new CreateHandler();