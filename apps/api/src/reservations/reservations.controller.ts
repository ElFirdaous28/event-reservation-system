import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@repo/shared';
import { Request, Response } from 'express';
import { ChangeReservationStatusDto } from './dto/change-reservation-status.dto';
import { TicketGeneratorService } from './services/ticket-generator.service';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly ticketGeneratorService: TicketGeneratorService,
  ) {}

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

  @Get(':id/ticket')
  async downloadTicket(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const reservation = await this.reservationsService.findOne(id);
    
    // Check if user is the reservation owner or admin
    const isAdmin = req.user!.role === Role.ADMIN;
    if (
      !isAdmin &&
      (reservation.user as any)._id.toString() !== req.user!.sub
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const pdfBuffer = await this.ticketGeneratorService.generateTicketPDF(reservation);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ticket-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const isAdmin = req.user!.role === Role.ADMIN;
    return this.reservationsService.remove(id, req.user!.sub, isAdmin);
  }
}
