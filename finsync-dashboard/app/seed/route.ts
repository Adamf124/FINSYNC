import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // no prerender at build

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

async function seedUsers(tx: postgres.Sql) {
  await tx`
    CREATE TABLE IF NOT EXISTS users (
      id uuid default uuid_generate_v4() primary key,
      name varchar(255) not null,
      email text unique not null,
      password text not null
    );
  `;
  const insertedUsers = await Promise.all(
    users.map(async (u) => {
      const hash = await bcrypt.hash(u.password, 10);
      await tx`
        insert into users (id, name, email, password)
        values (${u.id}, ${u.name}, ${u.email}, ${hash})
        on conflict (id) do nothing;
      `;
    }),
  );
}

async function seedInvoices(tx: postgres.Sql) {
  await tx`
    CREATE TABLE IF NOT EXISTS invoices (
      id uuid default uuid_generate_v4() primary key,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;
  const insertedInvoices = await Promise.all(
    invoices.map(async (inv) => {
      await tx`
        insert into invoices (customer_id, amount, status, date)
        values (${inv.customer_id}, ${inv.amount}, ${inv.status}, ${inv.date})
        on conflict (id) do nothing;
      `;
    }),
  );
}

async function seedCustomers(tx: postgres.Sql) {

  await tx`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => tx`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

}

async function seedRevenue(tx: postgres.Sql) {
  await tx`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => tx`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

}

export async function POST() {
  try {
    const result = await sql.begin(async(tx) => [
      await seedUsers(tx),
      await seedCustomers(tx),
      await seedInvoices(tx),
      await seedRevenue(tx),
    ]);

    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
