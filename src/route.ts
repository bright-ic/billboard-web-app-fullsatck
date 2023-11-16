import {Request, Response, NextFunction} from "express";
import expressConfig from "./app";

import IndexController from "./controllers";

// Route groups
import index_route from "./routes/index";
import electricity_route from "./routes/electricity";

const AppRoutes = () => {
    const app = expressConfig();

    // Routes
    app.use('/api/v1', index_route);
    app.use('/api/v1', electricity_route);


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
