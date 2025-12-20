import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversationId } = await params;
        console.log('[Messages GET] Fetching messages for:', conversationId);

        const { data: participation, error: participationError } = await supabase
            .schema('sml')
            .from('conversation_participants')
            .select('conversation_id')
            .eq('conversation_id', conversationId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (participationError || !participation) {
            console.error('[Messages GET] User not in conversation:', participationError);
            return NextResponse.json({ error: 'Not authorized for this conversation' }, { status: 403 });
        }

        const { data: messagesRaw, error: messagesError } = await supabase
            .schema('sml')
            .from('messages')
            .select('id, content, created_at, sender_id, is_deleted')
            .eq('conversation_id', conversationId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

        if (messagesError) {
            console.error('[Messages GET] Error fetching messages:', messagesError);
            return NextResponse.json(
                {
                    error: 'Failed to fetch messages',
                    details: process.env.NODE_ENV === 'development' ? messagesError.message : undefined
                },
                { status: 500 }
            );
        }

        if (messagesRaw && messagesRaw.length > 0) {
            const senderIds = [...new Set(messagesRaw.map(m => m.sender_id))];

            const { data: profiles } = await supabase
                .schema('sml')
                .from('profiles')
                .select('id, email, full_name, avatar_url')
                .in('id', senderIds);

            const messages = messagesRaw.map(message => ({
                ...message,
                profiles: profiles?.find(p => p.id === message.sender_id) || {
                    email: 'unknown',
                    full_name: 'Unknown User',
                    avatar_url: null
                }
            }));

            console.log('[Messages GET] Returning', messages.length, 'messages');
            return NextResponse.json({ messages });
        }

        console.log('[Messages GET] No messages found');
        return NextResponse.json({ messages: [] });
    } catch (error) {
        console.error('[Messages GET] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversationId } = await params;
        const { content } = await request.json();

        console.log('[Messages POST] Sending message to:', conversationId);

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
        }

        const { data: participation, error: participationError } = await supabase
            .schema('sml')
            .from('conversation_participants')
            .select('conversation_id')
            .eq('conversation_id', conversationId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (participationError || !participation) {
            console.error('[Messages POST] User not in conversation:', participationError);
            return NextResponse.json({ error: 'Not authorized for this conversation' }, { status: 403 });
        }

        const { data: messageRaw, error: messageError } = await supabase
            .schema('sml')
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: content.trim(),
            })
            .select('id, content, created_at, sender_id, is_deleted')
            .single();

        if (messageError) {
            console.error('[Messages POST] Error creating message:', messageError);
            return NextResponse.json(
                {
                    error: 'Failed to send message',
                    details: process.env.NODE_ENV === 'development' ? messageError.message : undefined
                },
                { status: 500 }
            );
        }

        const { data: profile } = await supabase
            .schema('sml')
            .from('profiles')
            .select('id, email, full_name, avatar_url')
            .eq('id', user.id)
            .single();

        const message = {
            ...messageRaw,
            profiles: profile || {
                email: 'unknown',
                full_name: 'Unknown User',
                avatar_url: null
            }
        };

        console.log('[Messages POST] Message sent:', message.id);

        return NextResponse.json({ message });
    } catch (error) {
        console.error('[Messages POST] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}