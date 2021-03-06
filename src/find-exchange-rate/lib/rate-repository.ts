import { AWSError } from 'aws-sdk/lib/error';
import { dbLogWrapper, log } from '../../../layers/common/nodejs/log/sam-logger';
import { DynamoDB } from 'aws-sdk';
import { config } from './config';
import { ResponseEntity } from '../../../layers/common/nodejs/models/invoker/payload';
import { HttpStatus } from '../../../layers/common/nodejs/utils/http-status';

const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient(
  config.isOffline
    ? {
        region: 'localhost',
        endpoint: config.tableEndpoint
      }
    : {}
);

const get = async (params: DynamoDB.GetItemInput): Promise<ResponseEntity> =>
  await dbClient
    .get(params)
    .promise()
    .then((output: DynamoDB.GetItemOutput) => {
      const queryOutput: ResponseEntity = {
        statusCode: HttpStatus.Success,
        body: output.Item
      };
      return queryOutput;
    })
    .catch((error: AWSError) => {
      const queryError: ResponseEntity = {
        statusCode: error.statusCode || HttpStatus.NotImplemented,
        body: error.message
      };
      return queryError;
    });

const scan = async (params: DynamoDB.DocumentClient.ScanInput): Promise<ResponseEntity> =>
  await dbClient
    .scan(params)
    .promise()
    .then((output: DynamoDB.DocumentClient.ScanOutput) => {
      return {
        statusCode: output.Items ? HttpStatus.Success : HttpStatus.NoContent,
        body: output
      };
    })
    .catch((error: AWSError) => {
      return {
        statusCode: error.statusCode || HttpStatus.NotImplemented,
        body: error.message
      };
    });

const batchWrite = async (params: DynamoDB.BatchWriteItemInput): Promise<ResponseEntity> =>
  await dbClient
    .batchWrite(params)
    .promise()
    .then((output: DynamoDB.BatchWriteItemOutput) => {
      return {
        statusCode: HttpStatus.Success,
        body: output
      };
    })
    .catch((error: AWSError) => {
      return {
        statusCode: error.statusCode || HttpStatus.NotImplemented,
        body: error.message
      };
    });

export const repository = {
  get: dbLogWrapper(log, get),
  scan: dbLogWrapper(log, scan),
  batchWrite: dbLogWrapper(log, batchWrite)
};
