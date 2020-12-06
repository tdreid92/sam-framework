import express, { Express, Response } from 'express';
import { ExchangeRatePair, HttpStatus } from '../../../layers/common/nodejs/utils/common-constants';
import bodyParser from 'body-parser';
import {
  applyGetExchangeRateValidationRules,
  applyUploadExchangeRateValidationRules,
  validate
} from './validator';
import { service } from './service';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*' // required for CORS and AWS API Gateway Proxy integration
};

const bodyParserOptions = bodyParser.urlencoded({
  extended: true
});

export const app: Express = express();
3;

app.use(bodyParser.json()); // supports JSON-encoded bodies
app.use(bodyParserOptions); // supports URL-encoded bodies
app.use(express.json()); // supports JSON-encoded bodies
app.use(express.urlencoded()); // supports URL-encoded bodies
// app.use(apiLogInterceptor);

app.get(
  '/exchangerate/:baseCurr/:date/:quoteCurr',
  applyGetExchangeRateValidationRules(),
  validate,
  async (
    req: {
      params: {
        baseCurr: string;
        date: string;
        quoteCurr: string;
      };
    },
    res: Response
  ) => {
    res
      .set(headers)
      .status(HttpStatus.Success)
      .send(
        await service.getExchangeRate({
          baseCurr: req.params.baseCurr,
          date: req.params.date,
          quoteCurr: req.params.quoteCurr
        })
      );
  }
);

app.get('/exchangerate/list', async (req, res: Response) => {
  res
    .set(headers)
    .status(HttpStatus.Success)
    .send(await service.listExchangeRates());
});

app.post(
  '/exchangerate',
  applyUploadExchangeRateValidationRules(),
  validate,
  async (
    req: {
      body: {
        exchangeRates: ExchangeRatePair[];
      };
    },
    res: Response
  ) => {
    res
      .set(headers)
      .status(HttpStatus.Success)
      .send(await service.putExchangeRates(req.body.exchangeRates));
  }
);
