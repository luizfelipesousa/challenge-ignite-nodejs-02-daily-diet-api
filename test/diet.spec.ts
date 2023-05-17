import { afterAll, beforeAll, describe, expect, it, beforeEach } from "vitest";
import { app } from "../src/app";
import request from 'supertest';
import { execSync } from "child_process";

describe('Daily diet Routes', () => {

    beforeAll(async () => {
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        execSync('npm run knex:rollback');
        execSync('npm run knex:latest');
    });

    describe('Create User Routes', () => {

        it('should be possible to create an user', async () => {
            const response = await request(app.server).post('/user').send({
                name: 'new user',
                email: 'new@user.com'
            }).expect(201);

            expect(response.body).toEqual(expect.objectContaining({
                message: 'User created successfully!'
            }))
        });

    });

    describe('Diet Routes', () => {

        it('should be possible to add a diet', async () => {
            const userResponse = await request(app.server).post('/user').send({
                name: 'new user',
                email: 'new@user.com'
            });

            const dietResponse = await request(app.server).post('/diet')
                .set('Cookie', userResponse.header['set-cookie'])
                .send({
                    name: "Barbecue",
                    description: "Lunch",
                    isPartOfDiet: true,
                    date: "17/05/2023",
                    time: "14:16"
                }).expect(201);

            expect(dietResponse.body).toEqual({
                message: 'Diet created successfully!'
            });
        });

        it('should be possible to edit a diet', async () => {
            const userResponse = await request(app.server).post('/user').send({
                name: 'new user',
                email: 'new@user.com'
            });

            await request(app.server)
                .post('/diet')
                .set('Cookie', userResponse.header['set-cookie'])
                .send({
                    name: "Barbecue",
                    description: "Lunch",
                    isPartOfDiet: true,
                    date: "17/05/2023",
                    time: "14:16"
                });

            const diets = await request(app.server)
                .get('/diet')
                .set('Cookie', userResponse.header['set-cookie']);

            const dietToBeUpdateBody = diets.body.diet[0];
            const dietIdToBeDeleted = dietToBeUpdateBody.id;

            await request(app.server)
                .put(`/diet/${dietIdToBeDeleted}`)
                .set('Cookie', userResponse.header['set-cookie'])
                .send({
                    name: "Lasagna",
                    description: "Lunch",
                    isPartOfDiet: false,
                    date: "17/05/2022",
                    time: "10:16"
                }).expect(204);

            const dietUpdated = await request(app.server)
                .get(`/diet/${dietIdToBeDeleted}`)
                .set('Cookie', userResponse.header['set-cookie']);

            expect(dietUpdated.body).not.toEqual(dietToBeUpdateBody);
            expect(dietUpdated.body).toEqual(expect.objectContaining({
                name: "Lasagna",
                description: "Lunch",
                isPartOfDiet: 0,
                date: "17/05/2022",
                time: "10:16"
            }));

        });

        it('should be possible to delete a diet', async () => {
            const userResponse = await request(app.server).post('/user').send({
                name: 'new user',
                email: 'new@user.com'
            });

            await request(app.server)
                .post('/diet')
                .set('Cookie', userResponse.header['set-cookie'])
                .send({
                    name: "Barbecue",
                    description: "Lunch",
                    isPartOfDiet: true,
                    date: "17/05/2023",
                    time: "14:16"
                });

            const diets = await request(app.server)
                .get('/diet')
                .set('Cookie', userResponse.header['set-cookie']);

            const dietIdToBeDeleted = diets.body.diet[0].id;

            await request(app.server)
                .delete(`/diet/${dietIdToBeDeleted}`)
                .set('Cookie', userResponse.header['set-cookie'])
                .expect(204);

            await request(app.server)
                .get(`/diet/${dietIdToBeDeleted}`)
                .set('Cookie', userResponse.header['set-cookie'])
                .expect(404);
        });

        it('should be possible to list all meal diet', async () => {
            const userResponse = await request(app.server).post('/user').send({
                name: 'new user',
                email: 'new@user.com'
            });

            await request(app.server)
                .post('/diet')
                .set('Cookie', userResponse.header['set-cookie'])
                .send({
                    name: "Barbecue",
                    description: "Lunch",
                    isPartOfDiet: true,
                    date: "17/05/2023",
                    time: "14:16"
                });

            const diets = await request(app.server)
                .get('/diet')
                .set('Cookie', userResponse.header['set-cookie'])
                .expect(200);

            expect(diets.body.diet).toEqual([
                expect.objectContaining({
                    created_at: expect.any(String),
                    date: expect.any(String),
                    description: expect.any(String),
                    id: expect.any(String),
                    isPartOfDiet: expect.any(Number),
                    name: expect.any(String),
                    time: expect.any(String),
                    updated_at: null,
                    userId: expect.any(String),
                })]);
        });

        it('should be possible to list a specific diet', async () => {
            const userResponse = await request(app.server).post('/user').send({
                name: 'new user',
                email: 'new@user.com'
            });

            await request(app.server)
                .post('/diet')
                .set('Cookie', userResponse.header['set-cookie'])
                .send({
                    name: "Barbecue",
                    description: "Lunch",
                    isPartOfDiet: true,
                    date: "17/05/2023",
                    time: "14:16"
                });

            const diets = await request(app.server)
                .get('/diet')
                .set('Cookie', userResponse.header['set-cookie']);

            const dietIdToBeSelected = diets.body.diet[0].id;

            const specificDietResponse = await request(app.server)
                .get(`/diet/${dietIdToBeSelected}`)
                .set('Cookie', userResponse.header['set-cookie'])
                .expect(200);

            expect(specificDietResponse.body).toEqual(
                expect.objectContaining({
                    created_at: expect.any(String),
                    date: expect.any(String),
                    description: expect.any(String),
                    id: expect.any(String),
                    isPartOfDiet: expect.any(Number),
                    name: expect.any(String),
                    time: expect.any(String),
                    updated_at: null,
                    userId: expect.any(String),
                }));
        });

        it('should be possible to get the diet summary', async () => {
            const userResponse = await request(app.server).post('/user').send({
                name: 'new user',
                email: 'new@user.com'
            });

            await request(app.server)
                .post('/diet')
                .set('Cookie', userResponse.header['set-cookie'])
                .send({
                    name: "Barbecue",
                    description: "Lunch",
                    isPartOfDiet: true,
                    date: "17/05/2023",
                    time: "14:16"
                });

            await request(app.server)
                .post('/diet')
                .set('Cookie', userResponse.header['set-cookie'])
                .send({
                    name: "Pizza",
                    description: "Dinner",
                    isPartOfDiet: true,
                    date: "17/05/2023",
                    time: "14:16"
                });

            await request(app.server)
                .post('/diet')
                .set('Cookie', userResponse.header['set-cookie'])
                .send({
                    name: "Popcorn",
                    description: "Breakfast",
                    isPartOfDiet: false,
                    date: "17/05/2023",
                    time: "14:16"
                });

            const summaryResponse = await request(app.server)
                .get('/diet/summary')
                .set('Cookie', userResponse.header['set-cookie'])
                .expect(200);

            expect(summaryResponse.body).toEqual(expect.objectContaining({
                totalMeals: 3,
                totalMealsPartOfDiet: 2,
                totalMealsOutOfDiet: 1,
                bestDietDay: {
                    date: expect.any(String),
                    totalMealAmount: 2
                }
            }));
        });
    });
});