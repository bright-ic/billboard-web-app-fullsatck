
import AppRoutes from './route';


const app = AppRoutes();

// initiate after configuring db

const port = process.env.PORT || 5000;

// Routes
;(async function () {
    try {
        app.listen(port, () => {
            console.log('listening on port ', port);
        });
    } catch (e) {
        console.log('error initiating project');
        console.log(e);
        setTimeout(() => {
            process.exit(0);
        }, 3000)
    }
})()

process.on('SIGINT', async () => {
    //close any additional things after server sends close signal
});
