// Quick test to verify route registration
import express from 'express';
import orderRouter from './routes/orderRoute.js';

const app = express();
app.use(express.json());
app.use('/api/order', orderRouter);

// List all registered routes
function listRoutes(router, basePath = '') {
    const routes = [];
    
    if (router.stack) {
        router.stack.forEach((middleware) => {
            if (middleware.route) {
                // Direct route
                const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
                routes.push(`${methods} ${basePath}${middleware.route.path}`);
            } else if (middleware.name === 'router' && middleware.handle.stack) {
                // Nested router
                routes.push(...listRoutes(middleware.handle, basePath + middleware.regexp.source.replace(/\\\//g, '/').replace(/\?.*$/, '')));
            }
        });
    }
    
    return routes;
}

console.log('\n📋 Registered Order Routes:');
console.log('='.repeat(50));

app._router.stack.forEach((middleware) => {
    if (middleware.name === 'router' && middleware.regexp.test('/api/order')) {
        const routes = listRoutes(middleware.handle, '/api/order');
        routes.forEach(route => console.log('✓', route));
    }
});

console.log('='.repeat(50));
console.log('\n✅ Route test complete!\n');
