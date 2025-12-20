import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const fetchAll = searchParams.get('all') === 'true';

        // IMPORTANT: For sml schema, you need to specify it in the schema() method
        let query = supabase
            .schema('sml')  // Specify the schema here!
            .from('profiles')
            .select('id, email, full_name, avatar_url, bio')
            .neq('id', user.id);

        if (fetchAll) {
            query = query.limit(100);
        } else if (search.trim().length > 0) {
            const sanitizedSearch = search.trim().slice(0, 50);
            const searchPattern = `%${sanitizedSearch}%`;
            query = query.or(`email.ilike.${searchPattern},full_name.ilike.${searchPattern}`);
            query = query.limit(20);
        } else {
            return NextResponse.json({ users: [] });
        }

        const { data: users, error } = await query;

        if (error) {
            console.error('Error fetching users:', error);
            console.error('Full error:', JSON.stringify(error, null, 2));

            return NextResponse.json({
                error: 'Failed to fetch users',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                code: process.env.NODE_ENV === 'development' ? error.code : undefined
            }, { status: 500 });
        }

        return NextResponse.json({ users: users || [] });
    } catch (error) {
        console.error('Exception in users endpoint:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined
            },
            { status: 500 }
        );
    }
}