import { HasPermission } from '@ghostfolio/api/decorators/has-permission.decorator';
import { HasPermissionGuard } from '@ghostfolio/api/guards/has-permission.guard';
import { TransformDataSourceInRequestInterceptor } from '@ghostfolio/api/interceptors/transform-data-source-in-request.interceptor';
import { TransformDataSourceInResponseInterceptor } from '@ghostfolio/api/interceptors/transform-data-source-in-response.interceptor';
import type {
  BenchmarkMarketDataDetails,
  BenchmarkResponse,
  UniqueAsset
} from '@ghostfolio/common/interfaces';
import { permissions } from '@ghostfolio/common/permissions';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DataSource } from '@prisma/client';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

import { BenchmarkService } from './benchmark.service';

@Controller('benchmark')
export class BenchmarkController {
  public constructor(private readonly benchmarkService: BenchmarkService) {}

  @HasPermission(permissions.accessAdminControl)
  @Post()
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  public async addBenchmark(@Body() { dataSource, symbol }: UniqueAsset) {
    try {
      const benchmark = await this.benchmarkService.addBenchmark({
        dataSource,
        symbol
      });

      if (!benchmark) {
        throw new HttpException(
          getReasonPhrase(StatusCodes.NOT_FOUND),
          StatusCodes.NOT_FOUND
        );
      }

      return benchmark;
    } catch {
      throw new HttpException(
        getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':dataSource/:symbol')
  @HasPermission(permissions.accessAdminControl)
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  public async deleteBenchmark(
    @Param('dataSource') dataSource: DataSource,
    @Param('symbol') symbol: string
  ) {
    try {
      const benchmark = await this.benchmarkService.deleteBenchmark({
        dataSource,
        symbol
      });

      if (!benchmark) {
        throw new HttpException(
          getReasonPhrase(StatusCodes.NOT_FOUND),
          StatusCodes.NOT_FOUND
        );
      }

      return benchmark;
    } catch {
      throw new HttpException(
        getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  @UseInterceptors(TransformDataSourceInRequestInterceptor)
  @UseInterceptors(TransformDataSourceInResponseInterceptor)
  public async getBenchmark(): Promise<BenchmarkResponse> {
    return {
      benchmarks: await this.benchmarkService.getBenchmarks()
    };
  }

  @Get(':dataSource/:symbol/:startDateString')
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  @UseInterceptors(TransformDataSourceInRequestInterceptor)
  public async getBenchmarkMarketDataBySymbol(
    @Param('dataSource') dataSource: DataSource,
    @Param('startDateString') startDateString: string,
    @Param('symbol') symbol: string
  ): Promise<BenchmarkMarketDataDetails> {
    const startDate = new Date(startDateString);

    return this.benchmarkService.getMarketDataBySymbol({
      dataSource,
      startDate,
      symbol
    });
  }
}
