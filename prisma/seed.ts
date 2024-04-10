import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
	console.log(`Start seeding ...`);

	const user = await prisma.user.create({
		data: {},
	});

	const todo = await prisma.todo.create({
		data: {
			user_id: user.id,

			images: {
				create: new Array(3).fill(null).map((_, i) => ({
					s3_key: randomBytes(8).toString('hex'),
					label: `img-label-${i + 1}`,
				})),
			},

			documents: {
				create: new Array(3).fill(null).map((_, i) => ({
					s3_key: randomBytes(8).toString('hex'),
					label: `doc-label-${i + 1}`,
				})),
			},
		},
	});

	console.log(`Seeding finished.`);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
