import { Injectable } from '@nestjs/common';
import { ReservationDocument } from '../schemas/reservation.schema';
import PDFDocument from 'pdfkit';

@Injectable()
export class TicketGeneratorService {
  async generateTicketPDF(reservation: ReservationDocument): Promise<Buffer> {
    const THEME = {
      dark: '#0B0E2E',
      primary: '#FD2D67',
      muted: '#5E628F',
      white: '#FFFFFF',
    };

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.rect(0, 0, 595.28, 180).fill(THEME.dark);

      doc
        .fillColor(THEME.primary)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('OFFICIAL TICKET', 50, 50);

      doc
        .fillColor(THEME.white)
        .fontSize(28)
        .text(
          (reservation.event as any).title?.toUpperCase() || 'EVENT',
          50,
          70,
        );

      //  body
      const bodyY = 210;

      // Event Info
      this.addDetail(
        doc,
        'DATE',
        new Date((reservation.event as any).date).toDateString(),
        50,
        bodyY,
        THEME,
      );
      this.addDetail(
        doc,
        'LOCATION',
        (reservation.event as any).location || 'TBA',
        250,
        bodyY,
        THEME,
      );

      // Participant Info
      this.addDetail(
        doc,
        'TICKET HOLDER',
        (reservation.user as any).fullName,
        50,
        bodyY + 60,
        THEME,
      );
      this.addDetail(
        doc,
        'STATUS',
        reservation.status,
        250,
        bodyY + 60,
        THEME,
        true,
      );

      const footerY = 400;
      doc
        .moveTo(50, footerY)
        .lineTo(545, footerY)
        .strokeColor('#E4E6F1')
        .lineWidth(0.5)
        .dash(5, { space: 2 })
        .stroke();

      doc
        .fillColor(THEME.muted)
        .fontSize(8)
        .text(`ID: ${reservation._id.toString()}`, 50, footerY + 20, {
          align: 'center',
        });

      doc.end();
    });
  }

  private addDetail(
    doc: any,
    label: string,
    value: string,
    x: number,
    y: number,
    theme: any,
    highlight = false,
  ) {
    doc
      .fillColor(theme.muted)
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(label, x, y);
    doc
      .fillColor(highlight ? theme.primary : theme.dark)
      .font('Helvetica')
      .fontSize(12)
      .text(value.toUpperCase(), x, y + 15);
  }
}
