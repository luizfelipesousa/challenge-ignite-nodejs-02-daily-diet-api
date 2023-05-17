import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { database } from './database';
import { checkIfUserExists } from './middlewares/check-if-user-exists';

export async function userRoutes(app: FastifyInstance) {
    app.post('/', async (req, reply) => {

        const createUserSchema = z.object({
            name: z.string(),
            email: z.string(),
        });

        const { name, email } = createUserSchema.parse(req.body);

        const userId = req.cookies.userId;

        if (!userId) {
            const id = randomUUID();

            reply.setCookie('userId', id, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
            });

            await database.table('users').insert({ id, name, email });

            return reply.status(201).send({ message: 'User created successfully!' });
        } else {
            return reply.status(400).send({ error: 'User already created.' });
        }

    });
};

export async function dietRoutes(app: FastifyInstance) {

    app.addHook('preHandler', async (req, reply) => {
        return await checkIfUserExists(req, reply);
    });

    app.post('/', async (req, reply) => {

        const { userId } = req.cookies;

        const createBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            isPartOfDiet: z.boolean(),
            date: z.string(),
            time: z.string(),
        });

        const { name, description, isPartOfDiet, date, time } = createBodySchema.parse(req.body);

        await database.table('diet').insert({
            id: randomUUID(),
            name,
            description,
            isPartOfDiet,
            userId,
            date,
            time
        });

        return reply.status(201).send({ message: 'Diet created successfully!' });
    });

    app.put('/:id', async (req, reply) => {
        const { userId } = req.cookies;
        const createSchemaParams = z.object({
            id: z.string(),
        });

        const { id } = createSchemaParams.parse(req.params);
        const createBodySchema = z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            isPartOfDiet: z.boolean().optional(),
            date: z.string().optional(),
            time: z.string().optional(),
        });

        const { name, description, isPartOfDiet, date, time } = createBodySchema.parse(req.body);
        const meal = await database.table('diet')
            .where({ 'id': id, 'userId': userId })
            .select().first();

        if (!meal) {
            return reply.status(404).send({ error: "Diet not found" });
        }

        await database.table('diet')
            .where({ 'id': id, 'userId': userId })
            .update({
                name,
                description,
                isPartOfDiet,
                date,
                time,
                updated_at: database.fn.now()
            });

        return reply.status(204).send();
    });

    app.delete('/:id', async (req, reply) => {
        const { userId } = req.cookies;
        const createSchemaParams = z.object({
            id: z.string(),
        })

        const { id } = createSchemaParams.parse(req.params);

        const meal = await database.table('diet')
            .where({ 'id': id, 'userId': userId })
            .select().first();

        if (!meal) {
            return reply.status(404).send({ error: "Diet not found" });
        }

        await database.table('diet').delete('*').where({ 'id': id, 'userId': userId });

        return reply.status(204).send();
    });

    app.get('/', async (req, reply) => {
        const { userId } = req.cookies;
        const diet = await database.table('diet').select().where('userId', userId);
        return { diet };
    });

    app.get('/:id', async (req, reply) => {

        const { userId } = req.cookies;
        const createSchemaParams = z.object({
            id: z.string(),
        })

        const { id } = createSchemaParams.parse(req.params);

        const meal = await database.table('diet').select('*').where({ 'id': id, 'userId': userId }).first();

        if (!meal) {
            return reply.status(404).send({ error: "Diet not found" });
        }

        return meal;
    });

    app.get('/summary', async (req, reply) => {
        const { userId } = req.cookies;
        const totalMeals = await database.table('diet').count('id', { as: 'totalMeals' }).where('userId', userId).first();
        const totalMealsPartOfDiet = await database.table('diet').count('id', { as: 'totalMealsPartOfDiet' }).where({ 'isPartOfDiet': true, 'userId': userId }).first();
        const totalMealsOutOfDiet = await database.table('diet').count('id', { as: 'totalMealsOutOfDiet' }).where({ 'isPartOfDiet': false, 'userId': userId }).first();
        const bestDietDay = await database.table('diet').groupBy('date').where({ 'isPartOfDiet': true, 'userId': userId }).select('date').count('id', { date: 'date', as: 'totalMealAmount' })
            .orderBy('totalMealAmount', 'desc').first();

        return { ...totalMeals, ...totalMealsPartOfDiet, ...totalMealsOutOfDiet, bestDietDay };
    });

}