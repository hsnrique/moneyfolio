import { CurrentRateService } from '@ghostfolio/api/app/portfolio/current-rate.service';
import { parseDate } from '@ghostfolio/common/helper';
import Big from 'big.js';

import { CurrentRateServiceMock } from './current-rate.service.mock';
import { PortfolioCalculator } from './portfolio-calculator';

jest.mock('@ghostfolio/api/app/portfolio/current-rate.service', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    CurrentRateService: jest.fn().mockImplementation(() => {
      return CurrentRateServiceMock;
    })
  };
});

describe('PortfolioCalculator', () => {
  let currentRateService: CurrentRateService;

  beforeEach(() => {
    currentRateService = new CurrentRateService(null, null, null);
  });

  describe('get current positions', () => {
    it.only('with BTCUSD buy and sell partially', async () => {
      const portfolioCalculator = new PortfolioCalculator({
        currentRateService,
        currency: 'CHF',
        orders: [
          {
            currency: 'CHF',
            date: '2015-01-01',
            dataSource: 'YAHOO',
            fee: new Big(0),
            name: 'Bitcoin USD',
            quantity: new Big(2),
            symbol: 'BTCUSD',
            type: 'BUY',
            unitPrice: new Big(320.43)
          },
          {
            currency: 'CHF',
            date: '2017-12-31',
            dataSource: 'YAHOO',
            fee: new Big(0),
            name: 'Bitcoin USD',
            quantity: new Big(1),
            symbol: 'BTCUSD',
            type: 'SELL',
            unitPrice: new Big(14156.4)
          }
        ]
      });

      portfolioCalculator.computeTransactionPoints();

      const spy = jest
        .spyOn(Date, 'now')
        .mockImplementation(() => parseDate('2018-01-01').getTime());

      const currentPositions = await portfolioCalculator.getCurrentPositions(
        parseDate('2015-01-01')
      );

      const investments = portfolioCalculator.getInvestments();

      const investmentsByMonth =
        portfolioCalculator.getInvestmentsByGroup('month');

      spy.mockRestore();

      expect(currentPositions).toEqual({
        currentValue: new Big('13657.2'),
        errors: [],
        grossPerformance: new Big('27172.74'),
        grossPerformancePercentage: new Big('42.41978276196153750666'),
        hasErrors: false,
        netPerformance: new Big('27172.74'),
        netPerformancePercentage: new Big('42.41978276196153750666'),
        positions: [
          {
            averagePrice: new Big('320.43'),
            currency: 'CHF',
            dataSource: 'YAHOO',
            fee: new Big('0'),
            firstBuyDate: '2015-01-01',
            grossPerformance: new Big('27172.74'),
            grossPerformancePercentage: new Big('42.41978276196153750666'),
            investment: new Big('320.43'),
            netPerformance: new Big('27172.74'),
            netPerformancePercentage: new Big('42.41978276196153750666'),
            marketPrice: 13657.2,
            quantity: new Big('1'),
            symbol: 'BTCUSD',
            timeWeightedInvestment: new Big('640.56763686131386861314'),
            transactionCount: 2
          }
        ],
        totalInvestment: new Big('320.43')
      });

      expect(investments).toEqual([
        { date: '2015-01-01', investment: new Big('640.86') },
        { date: '2017-12-31', investment: new Big('320.43') }
      ]);

      expect(investmentsByMonth).toEqual([
        { date: '2015-01-01', investment: new Big('640.86') },
        { date: '2015-02-01', investment: new Big('0') },
        { date: '2015-03-01', investment: new Big('0') },
        { date: '2015-04-01', investment: new Big('0') },
        { date: '2015-05-01', investment: new Big('0') },
        { date: '2015-06-01', investment: new Big('0') },
        { date: '2015-07-01', investment: new Big('0') },
        { date: '2015-08-01', investment: new Big('0') },
        { date: '2015-09-01', investment: new Big('0') },
        { date: '2015-10-01', investment: new Big('0') },
        { date: '2015-11-01', investment: new Big('0') },
        { date: '2015-12-01', investment: new Big('0') },
        { date: '2016-01-01', investment: new Big('0') },
        { date: '2016-02-01', investment: new Big('0') },
        { date: '2016-03-01', investment: new Big('0') },
        { date: '2016-04-01', investment: new Big('0') },
        { date: '2016-05-01', investment: new Big('0') },
        { date: '2016-06-01', investment: new Big('0') },
        { date: '2016-07-01', investment: new Big('0') },
        { date: '2016-08-01', investment: new Big('0') },
        { date: '2016-09-01', investment: new Big('0') },
        { date: '2016-10-01', investment: new Big('0') },
        { date: '2016-11-01', investment: new Big('0') },
        { date: '2016-12-01', investment: new Big('0') },
        { date: '2017-01-01', investment: new Big('0') },
        { date: '2017-02-01', investment: new Big('0') },
        { date: '2017-03-01', investment: new Big('0') },
        { date: '2017-04-01', investment: new Big('0') },
        { date: '2017-05-01', investment: new Big('0') },
        { date: '2017-06-01', investment: new Big('0') },
        { date: '2017-07-01', investment: new Big('0') },
        { date: '2017-08-01', investment: new Big('0') },
        { date: '2017-09-01', investment: new Big('0') },
        { date: '2017-10-01', investment: new Big('0') },
        { date: '2017-11-01', investment: new Big('0') },
        { date: '2017-12-01', investment: new Big('-14156.4') }
      ]);
    });
  });
});
