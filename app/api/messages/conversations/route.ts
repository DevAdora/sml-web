import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: participations, error: participationsError } = await supabase
            .schema('sml')
            .from('conversation_participants')
            .select('conversation_id, last_read_at')
            .eq('user_id', user.id);

        if (participationsError) {
            console.error('[GET] Participations error:', participationsError);
            return NextResponse.json({ error: participationsError.message }, { status: 500 });
        }

        if (!participations || participations.length === 0) {
            return NextResponse.json({ conversations: [] });
        }

        const conversationIds = participations.map(p => p.conversation_id);
        const { data: conversations } = await supabase
            .schema('sml')
            .from('conversations')
            .select('id, created_at, updated_at')
            .in('id', conversationIds);

        const conversationsWithDetails = await Promise.all(
            participations.map(async (participation) => {
                const conversationId = participation.conversation_id;
                const conversation = conversations?.find(c => c.id === conversationId);
                if (!conversation) return null;

                const { data: otherParticipants } = await supabase
                    .schema('sml')
                    .from('conversation_participants')
                    .select('user_id')
                    .eq('conversation_id', conversationId)
                    .neq('user_id', user.id)
                    .limit(1)
                    .maybeSingle();

                if (!otherParticipants) return null;

                const { data: profile } = await supabase
                    .schema('sml')
                    .from('profiles')
                    .select('id, email, full_name, avatar_url, bio')
                    .eq('id', otherParticipants.user_id)
                    .single();

                if (!profile) return null;

                const { data: lastMessage } = await supabase
                    .schema('sml')
                    .from('messages')
                    .select('content, created_at')
                    .eq('conversation_id', conversationId)
                    .eq('is_deleted', false)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                const { count: unreadCount } = await supabase
                    .schema('sml')
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', conversationId)
                    .eq('is_deleted', false)
                    .neq('sender_id', user.id)
                    .gt('created_at', participation.last_read_at || '1970-01-01');

                return {
                    id: conversationId,
                    participant: profile,
                    lastMessage: lastMessage?.content || '',
                    lastMessageTime: lastMessage?.created_at || conversation.created_at,
                    unreadCount: unreadCount || 0,
                };
            })
        );

        const validConversations = conversationsWithDetails
            .filter((conv): conv is NonNullable<typeof conv> => conv !== null)
            .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

        return NextResponse.json({ conversations: validConversations });
    } catch (error) {
        console.error('[GET] Error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('[POST] Auth error');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { participantId } = await request.json();
        console.log('[POST] Creating conversation:', { userId: user.id, participantId });

        if (!participantId) {
            return NextResponse.json({ error: 'Participant ID required' }, { status: 400 });
        }

        if (participantId === user.id) {
            return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
        }

        // Check if conversation exists
        const { data: myParticipations } = await supabase
            .schema('sml')
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        if (myParticipations && myParticipations.length > 0) {
            const convIds = myParticipations.map(p => p.conversation_id);
            const { data: existing } = await supabase
                .schema('sml')
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', participantId)
                .in('conversation_id', convIds)
                .limit(1)
                .maybeSingle();

            if (existing) {
                console.log('[POST] Found existing:', existing.conversation_id);
                return NextResponse.json({ conversationId: existing.conversation_id, existed: true });
            }
        }

        // Create conversation
        console.log('[POST] Creating new conversation...');
        const { data: conversation, error: convError } = await supabase
            .schema('sml')
            .from('conversations')
            .insert({})
            .select()
            .single();

        if (convError) {
            console.error('[POST] Conversation error:', convError);
            return NextResponse.json({
                error: 'Failed to create conversation',
                details: convError.message,
                code: convError.code
            }, { status: 500 });
        }

        if (!conversation) {
            console.error('[POST] No conversation data returned');
            return NextResponse.json({ error: 'No conversation created' }, { status: 500 });
        }

        console.log('[POST] Conversation created:', conversation.id);

        // Add participants
        console.log('[POST] Adding participants...');
        const { error: partError } = await supabase
            .schema('sml')
            .from('conversation_participants')
            .insert([
                { conversation_id: conversation.id, user_id: user.id, last_read_at: new Date().toISOString() },
                { conversation_id: conversation.id, user_id: participantId, last_read_at: new Date().toISOString() },
            ]);

        if (partError) {
            console.error('[POST] Participants error:', partError);
            // Cleanup
            await supabase.schema('sml').from('conversations').delete().eq('id', conversation.id);
            return NextResponse.json({
                error: 'Failed to add participants',
                details: partError.message,
                code: partError.code
            }, { status: 500 });
        }

        console.log('[POST] Success!');
        return NextResponse.json({ conversationId: conversation.id, existed: false });
    } catch (error) {
        console.error('[POST] Error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}