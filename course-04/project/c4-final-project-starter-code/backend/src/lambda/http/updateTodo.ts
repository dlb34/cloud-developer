import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;

    // Parse the request body as an UpdateTodoRequest object
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    
    // Extract the user ID from the request event
    const userId = getUserId(event);

    // Update the TODO item
    await updateTodo(todoId, userId, updatedTodo);

    // Return a successful response with no content
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: null
    };
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )