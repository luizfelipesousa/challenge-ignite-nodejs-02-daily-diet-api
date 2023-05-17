import { fastify } from 'fastify';
import { dietRoutes, userRoutes } from './routes';
import cookie from '@fastify/cookie'

export const app = fastify();

app.register(cookie);

app.register(userRoutes, {
    prefix: 'user'
});

app.register(dietRoutes, {
    prefix: 'diet'
});



