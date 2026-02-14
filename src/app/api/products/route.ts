import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (!type || !['hotel', 'airline'].includes(type)) {
    return NextResponse.json(
      { error: 'type parameter must be "hotel" or "airline"' },
      { status: 400 }
    );
  }

  try {
    const backendUrl = getBackendUrl();
    const url = new URL(`${backendUrl}/api/products/type/${type}`);

    // forward all query params to backend (excluding 'type')
    searchParams.forEach((value, key) => {
      if (key !== 'type') {
        url.searchParams.set(key, value);
      }
    });

    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[PRODUCTS_PROXY_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
