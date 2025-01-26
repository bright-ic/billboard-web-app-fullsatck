import express, { Request, Response } from 'express';
import SupportTicketController from '../controllers/Ticket.controller';
import { ROUTE_SUPPORT_TICKET, ROUTE_SUPPORT_TICKET_GET, ROUTE_SUPPORT_TICKET_GET_ALL } from '../lib/route-constants';

const router = express.Router();


router.post(ROUTE_SUPPORT_TICKET, async(Req: Request, Res: Response) => {
    const ticketController = new SupportTicketController(Req);
    return await ticketController.postSupportTicket(Req, Res);
});

router.patch(ROUTE_SUPPORT_TICKET, async(Req: Request, Res: Response) => {
    const ticketController = new SupportTicketController(Req);
    return await ticketController.patchSupportTicket(Req, Res);
});

router.get(ROUTE_SUPPORT_TICKET_GET_ALL, async(Req: Request, Res: Response) => {
    const ticketController = new SupportTicketController(Req);
    return await ticketController.getAllSupportTickets(Req, Res);
});

router.get(ROUTE_SUPPORT_TICKET_GET, async(Req: Request, Res: Response) => {
    const ticketController = new SupportTicketController(Req);
    return await ticketController.getSupportTicket(Req, Res);
});


export default router;