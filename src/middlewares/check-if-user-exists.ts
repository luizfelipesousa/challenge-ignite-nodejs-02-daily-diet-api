import { FastifyRequest, FastifyReply } from 'fastify';
import { database } from '../database';

export async function checkIfUserExists(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.cookies;

    if (!userId) {
        return reply.status(401).send({
            error: 'Create an user.'
        });
    }

    const user = await database.table('users').select('*').where('id', userId).first();

    if (!user) {
        return reply.status(404).send({
            error: 'User not found.'
        });
    }
}