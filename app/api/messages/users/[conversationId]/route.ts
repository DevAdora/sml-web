import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET all conversations for the current user
export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all conversations where user is a participant
        const { data: participations, error: participationsError } = await supabase
            .from('conversation_participants')
            .select(`
                conversation_id,
                last_read_at,
                conversations!inner (
                    id,
                    created_at,
                    updated_at
                )
            `)
            .eq('user_id', user.id)
            .order('conversations(updated_at)', { ascending: false });

        if (participationsError) {
            console.error('Error fetching participations:', participationsError);
            return NextResponse.json(
                { error: participationsError.message },
                { status: 500 }
            );
        }

        if (!participations || participations.length === 0) {
            return NextResponse.json({ conversations: [] });
        }

        // Get conversation details with other participants and last messages
        const conversationsWithDetails = await Promise.all(
            participations.map(async (participation) => {
                const conversationId = participation.conversation_id;

                // Get the other participant(s) in this conversation
                const { data: otherParticipants, error: participantsError } = await supabase
                    .from('conversation_participants')
                    .select(`
                        user_id,
                        profiles:user_id (
                            id,
                            username,
                            full_name,
                            avatar_url,
                            bio
                        )
                    `)
                    .eq('conversation_id', conversationId)
                    .neq('user_id', user.id);

                if (participantsError || !otherParticipants || otherParticipants.length === 0) {
                    return null;
                }

                // Get the last message for this conversation
                const { data: lastMessage } = await supabase
                    .from('messages')
                    .select('content, created_at')
                    .eq('conversation_id', conversationId)
                    .eq('is_deleted', false)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Count unread messages (messages after last_read_at)
                const { count: unreadCount } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', conversationId)
                    .eq('is_deleted', false)
                    .neq('sender_id', user.id)
                    .gt('created_at', participation.last_read_at || '1970-01-01');

                return {
                    id: conversationId,
                    participant: otherParticipants[0].profiles,
                    lastMessage: lastMessage?.content || '',
                    lastMessageTime: lastMessage?.created_at || '',
                    unreadCount: unreadCount || 0,
                };
            })
        );

        // Filter out any null conversations and sort by last message time
        const validConversations = conversationsWithDetails
            .filter((conv): conv is NonNullable<typeof conv> => conv !== null)
            .sort((a, b) =>
                new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
            );

        return NextResponse.json({ conversations: validConversations });
    } catch (error) {
        console.error('Error in conversations GET:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create a new conversation
export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { participantId } = await request.json();

        if (!participantId) {
            return NextResponse.json(
                { error: 'Participant ID is required' },
                { status: 400 }
            );
        }

        // Check if user is trying to message themselves
        if (participantId === user.id) {
            return NextResponse.json(
                { error: 'Cannot create conversation with yourself' },
                { status: 400 }
            );
        }

        // Check if conversation already exists between these two users
        const { data: existingParticipations } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        if (existingParticipations && existingParticipations.length > 0) {
            const conversationIds = existingParticipations.map(p => p.conversation_id);

            // Check if any of these conversations include the target participant
            const { data: existingConversation } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', participantId)
                .in('conversation_id', conversationIds)
                .limit(1)
                .single();

            if (existingConversation) {
                return NextResponse.json({
                    conversationId: existingConversation.conversation_id,
                    existed: true,
                });
            }
        }

        // Create new conversation
        const { data: conversation, error: conversationError } = await supabase
            .from('conversations')
            .insert({})
            .select()
            .single();

        if (conversationError || !conversation) {
            console.error('Error creating conversation:', conversationError);
            return NextResponse.json(
                { error: 'Failed to create conversation' },
                { status: 500 }
            );
        }

        // Add both participants
        const { error: participantsError } = await supabase
            .from('conversation_participants')
            .insert([
                {
                    conversation_id: conversation.id,
                    user_id: user.id,
                    last_read_at: new Date().toISOString(),
                },
                {
                    conversation_id: conversation.id,
                    user_id: participantId,
                    last_read_at: new Date().toISOString(),
                },
            ]);

        if (participantsError) {
            console.error('Error adding participants:', participantsError);
            // Try to clean up the conversation
            await supabase.from('conversations').delete().eq('id', conversation.id);
            return NextResponse.json(
                { error: 'Failed to add participants' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            conversationId: conversation.id,
            existed: false,
        });
    } catch (error) {
        console.error('Error in conversations POST:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}