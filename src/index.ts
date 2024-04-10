import { PrismaClient } from '@prisma/client';
import { withPolicy } from '@zenstackhq/runtime';

const rawDB = new PrismaClient();

async function test(db: PrismaClient) {
	const todo = await db.todo.findFirst({ where: {}, include: { documents: true } });
	if (!todo) throw new Error('todo not found | seed db');

	const updated = await db.todo.update({
		where: { id: todo.id },
		data: {
			documents: {
				update: todo.documents.map((doc) => {
					return {
						where: { s3_key: doc.s3_key },
						data: { label: 'updated' },
					};
				}),
			},
		},
	});
}

async function main() {
	const user = await rawDB.user.findFirst({ where: {} });
	if (!user) throw new Error('user not found | seed db');

	const zenstackDB = withPolicy(rawDB, { user });

	await test(rawDB)
		.catch((error) => {
			console.log('raw attempt failed: ', error);
		})
		.then(() => {
			console.log('raw attempt succeeded');
		})
		.finally(() => rawDB.$disconnect());

	await test(zenstackDB)
		.catch((error) => {
			console.log('zenstack attempt failed: ', error);
		})
		.then(() => {
			console.log('zenstack attempt succeeded');
		})
		.finally(() => zenstackDB.$disconnect());
}

main();
