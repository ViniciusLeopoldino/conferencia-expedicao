import { NextResponse } from 'next/server';
import { openDb } from '../../../../db';

export async function POST(request: Request) {
  const { nf, volumes } = await request.json();

  const db = await openDb();
  await db.run('INSERT INTO bipagem (nf, volumes) VALUES (?, ?)', [nf, volumes]);

  return NextResponse.json({ message: 'Bipagem salva com sucesso' });
}

export async function GET() {
  const db = await openDb();
  const bipagens = await db.all('SELECT * FROM bipagem');

  return NextResponse.json(bipagens);
}
