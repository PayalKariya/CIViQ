import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_BASE = 'https://us1.locationiq.com';

function parseCoord(value: string | null): number | null {
  if (value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

/**
 * Server-side reverse geocode via LocationIQ (token stays in env, not exposed to the browser).
 * @see https://locationiq.com/docs
 */
export async function GET(request: NextRequest) {
  const key = process.env.LOCATIONIQ_ACCESS_TOKEN;
  if (!key?.trim()) {
    return NextResponse.json(
      {
        error:
          'Location lookup is not configured. Set LOCATIONIQ_ACCESS_TOKEN in your environment.',
        code: 'MISSING_LOCATIONIQ_KEY',
      },
      { status: 503 }
    );
  }

  const lat = parseCoord(request.nextUrl.searchParams.get('lat'));
  const lon = parseCoord(request.nextUrl.searchParams.get('lon'));

  if (lat === null || lon === null) {
    return NextResponse.json(
      { error: 'Valid lat and lon query parameters are required.', code: 'INVALID_COORDS' },
      { status: 400 }
    );
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: 'Latitude or longitude is out of range.', code: 'OUT_OF_RANGE' },
      { status: 400 }
    );
  }

  const base = (process.env.LOCATIONIQ_API_BASE_URL || DEFAULT_BASE).replace(/\/$/, '');
  const url = new URL(`${base}/v1/reverse`);
  url.searchParams.set('key', key);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');

  try {
    const upstream = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'CIViQ/1.0 (civic complaint app)',
      },
      cache: 'no-store',
    });

    const payload = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      const message =
        typeof (payload as { error?: string }).error === 'string'
          ? (payload as { error: string }).error
          : typeof (payload as { message?: string }).message === 'string'
            ? (payload as { message: string }).message
            : `Location lookup failed (${upstream.status})`;
      return NextResponse.json({ error: message, code: 'LOCATIONIQ_ERROR' }, { status: 502 });
    }

    const displayName =
      typeof (payload as { display_name?: string }).display_name === 'string'
        ? (payload as { display_name: string }).display_name
        : null;
    if (!displayName) {
      return NextResponse.json(
        { error: 'No address returned for these coordinates.', code: 'NO_RESULT' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        displayName,
        lat,
        lon,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error('Reverse geocode error:', e);
    return NextResponse.json(
      { error: 'Could not reach location service.', code: 'UPSTREAM_UNREACHABLE' },
      { status: 502 }
    );
  }
}
