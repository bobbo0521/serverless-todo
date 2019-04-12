const handler = require('./createHandler');
module.exports.handler = async(event,context) => {
    try{
        const result = await handler.process(event);
        return{
            statusCode: 200,
            body: JSON.stringify(result)
        }
    }
    catch(error){
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Something went wrong",
                requestId: context.awsRequestId
            })
        }
    }
}