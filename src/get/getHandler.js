'use strict'
const AWS = require('aws-sdk')
AWS.config.update({region:process.env.AWS_REGION})
const DynamoDB = new AWS.DynamoDB.DocumentClient()

class GetHandler{
    async process(event){
        try{
            const {id} = event.pathParameters;
            return await Get(id);
        }
        catch(error){
            console.log(error);
            throw "Something went wrong"
        }
    }
}

async function Get(id){
    const params = {
        TableName: 'todos',
        Key:{
            Id:id
        }
    }

    return await DynamoDB.get(params).promise();
}

module.exports = new GetHandler();