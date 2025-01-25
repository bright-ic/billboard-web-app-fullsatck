import {Request, Response, NextFunction} from "express";
import expressConfig from "./app";

import IndexController from "./controllers";
// import { authRoutes } from './routes/auth';
// import { adminRoutes } from './routes/admin';

// Route groups
import index_route from "./routes/index";

const AppRoutes = () => {
    const app = expressConfig();

    // Routes
    app.use('/',index_route);
    // app.use('/api/auth', authRoutes);
    // app.use('/api/admin', adminRoutes);

    // No matching route
    app.use((req: Request, res: Response, next: NextFunction) => {
        const indexController = new IndexController(req);
        return indexController.error404(req, res);
    })
    // Internal server error route
    app.use((req: Request, res: Response, next) => {
        const indexController = new IndexController(req);
        return indexController.error500(req, res);
    });

    return app;
}


export default AppRoutes;
