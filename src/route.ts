import {Request, Response, NextFunction} from "express";
import expressConfig from "./app";

import IndexController from "./controllers";

// Route groups
import index_route from "./routes/index";
import transaction_route from "./routes/transaction";

const AppRoutes = () => {
    const app = expressConfig();

    // Routes
    app.use('/',index_route);
    app.use('/',transaction_route);

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
