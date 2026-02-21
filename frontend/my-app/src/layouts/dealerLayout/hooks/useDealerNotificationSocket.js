import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useAuthContext } from "../../../features/auth/AuthProvider";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SOCKET_URL = `${API_BASE_URL}/ws`; // Ensure this matches your backend WebSocket endpoint

export const useDealerNotificationSocket = () => {
    const queryClient = useQueryClient();
    const { token, dealerId } = useAuthContext();

    useEffect(() => {
        // Only connect if we have a token and dealerId
        if (!token || !dealerId) {
            return;
        }


        const client = new Client({
            // Use SockJS fallback
            webSocketFactory: () => new SockJS(SOCKET_URL),
            
            // Add JWT Token to Connect Headers
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            
            // Auto-reconnect
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            onConnect: () => {
                
                // Subscribe to Dealer's private topic
                const topic = `/topic/dealer/${dealerId}`;
                client.subscribe(topic, (message) => {
                    
                    try {
                        // 1. Invalidate Notifications List
                        queryClient.invalidateQueries(["dealerNotifications"]);
                        
                        // 2. Invalidate Unread Count
                        queryClient.invalidateQueries(["unreadNoteCount"]);
                        
                        // Optional: Show toast
                        // const note = JSON.parse(message.body);
                        // Swal.fire({
                        //     toast: true,
                        //     position: 'top-end',
                        //     icon: 'info',
                        //     title: note.message || 'Tin nhắn mới',
                        //     showConfirmButton: false,
                        //     timer: 3000
                        // });
                        
                    } catch (e) {
                        console.error("Error processing message:", e);
                    }
                });
            },
            
            onStompError: (frame) => {
                console.error("Broker reported error: " + frame.headers["message"]);
                console.error("Additional details: " + frame.body);
            },
            
            onWebSocketClose: (evt) => {
            }
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [queryClient, token, dealerId]);
};
