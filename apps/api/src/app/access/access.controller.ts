import { HasPermission } from '@ghostfolio/api/decorators/has-permission.decorator';
import { HasPermissionGuard } from '@ghostfolio/api/guards/has-permission.guard';
import { Access } from '@ghostfolio/common/interfaces';
import { permissions } from '@ghostfolio/common/permissions';
import type { RequestWithUser } from '@ghostfolio/common/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  UseGuards
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Access as AccessModel } from '@prisma/client';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

import { AccessService } from './access.service';
import { CreateAccessDto } from './create-access.dto';

@Controller('access')
export class AccessController {
  public constructor(
    private readonly accessService: AccessService,
    @Inject(REQUEST) private readonly request: RequestWithUser
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  public async getAllAccesses(): Promise<Access[]> {
    const accessesWithGranteeUser = await this.accessService.accesses({
      include: {
        GranteeUser: true
      },
      orderBy: { granteeUserId: 'asc' },
      where: { userId: this.request.user.id }
    });

    return accessesWithGranteeUser.map((access) => {
      if (access.GranteeUser) {
        return {
          alias: access.alias,
          grantee: access.GranteeUser?.id,
          id: access.id,
          type: 'RESTRICTED_VIEW'
        };
      }

      return {
        alias: access.alias,
        grantee: 'Public',
        id: access.id,
        type: 'PUBLIC'
      };
    });
  }

  @HasPermission(permissions.createAccess)
  @Post()
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  public async createAccess(
    @Body() data: CreateAccessDto
  ): Promise<AccessModel> {
    return this.accessService.createAccess({
      alias: data.alias || undefined,
      GranteeUser: data.granteeUserId
        ? { connect: { id: data.granteeUserId } }
        : undefined,
      User: { connect: { id: this.request.user.id } }
    });
  }

  @Delete(':id')
  @HasPermission(permissions.deleteAccess)
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  public async deleteAccess(@Param('id') id: string): Promise<AccessModel> {
    const access = await this.accessService.access({ id });

    if (!access || access.userId !== this.request.user.id) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }

    return this.accessService.deleteAccess({
      id
    });
  }
}
