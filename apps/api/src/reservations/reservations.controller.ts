import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@repo/shared';
import { Request } from 'express';
import { ChangeReservationStatusDto } from './dto/change-reservation-status.dto';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() createReservationDto: CreateReservationDto, @Req() req: Request) {
    return this.reservationsService.create(createReservationDto, req.user!.sub);
  }

  @Get()
  findAll(@Req() req: Request) {
    const isAdmin = req.user!.role === Role.ADMIN;
    return this.reservationsService.findAll(req.user!.sub, isAdmin);
  }

  @Get('my-reservations')
  findMyReservations(@Req() req: Request) {
    return this.reservationsService.findByUser(req.user!.sub);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('stats/all')
  getStats() {
    return this.reservationsService.getStats();
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string, @Req() req: Request) {
    const isAdmin = req.user!.role === Role.ADMIN;
    return this.reservationsService.findByEvent(eventId, isAdmin);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeReservationStatusDto,
    @Req() req: Request,
  ) {
    const isAdmin = req.user!.role === Role.ADMIN;
    return this.reservationsService.changeStatus(id, changeStatusDto, req.user!.sub, isAdmin);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const isAdmin = req.user!.role === Role.ADMIN;
    return this.reservationsService.remove(id, req.user!.sub, isAdmin);
  }
}
