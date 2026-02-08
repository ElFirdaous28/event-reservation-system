import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role, EventStatus } from '@repo/shared';
import { Request } from 'express';
import { ChangeEventStatusDto } from './dto/change-event-status.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createEventDto: CreateEventDto, @Req() req: Request) {
    return this.eventsService.create(createEventDto, req.user!.sub);
  }

  @Get()
  findAll(
    @Query('status') status?: EventStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: Request,
  ) {
    const isAdmin = req?.user?.role === Role.ADMIN;
    return this.eventsService.findAll(
      {
        status,
        search,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      },
      isAdmin,
    );
  }

  @Get('my-events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findMyEvents(
    @Query('status') status?: EventStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: Request,
  ) {
    return this.eventsService.findByCreator(req!.user!.sub, {
      status,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Req() req: Request) {
    return this.eventsService.update(id, updateEventDto, req.user!.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() changeStatusDto: ChangeEventStatusDto, @Req() req: Request) {
    return this.eventsService.changeStatus(id, changeStatusDto, req.user!.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.eventsService.remove(id, req.user!.sub);
  }
}
