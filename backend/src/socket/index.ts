import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface AuthSocket extends Socket {
    userId?: string;
    userName?: string;
    userRole?: string;
}

// Track online users and waiting rooms
const onlineUsers = new Map<string, string>(); // userId -> socketId
const waitingRooms = new Map<string, string[]>(); // roomId -> [userId1, userId2]
const doctorQueues = new Map<string, { userId: string; name: string; appointmentId: string }[]>();

export function initializeSocket(io: SocketIOServer) {
    // Auth middleware
    io.use(async (socket: AuthSocket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication required'));
            const decoded = jwt.verify(token, config.jwt.secret) as { id: string; email: string; role: string };
            const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, role: true } });
            if (!user) return next(new Error('User not found'));
            socket.userId = user.id;
            socket.userName = user.name;
            socket.userRole = user.role;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket: AuthSocket) => {
        logger.info(`User connected: ${socket.userName} (${socket.userId})`);
        onlineUsers.set(socket.userId!, socket.id);
        io.emit('user:online', { userId: socket.userId, name: socket.userName });

        // === CHAT ===
        socket.on('chat:send', async (data: { receiverId: string; content: string; type?: string; fileUrl?: string; appointmentId?: string }) => {
            try {
                const message = await prisma.message.create({
                    data: { senderId: socket.userId!, receiverId: data.receiverId, content: data.content, type: data.type || 'text', fileUrl: data.fileUrl, appointmentId: data.appointmentId },
                });
                const receiverSocket = onlineUsers.get(data.receiverId);
                if (receiverSocket) {
                    io.to(receiverSocket).emit('chat:receive', { ...message, senderName: socket.userName });
                }
                socket.emit('chat:sent', message);
            } catch (err) {
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('chat:typing', (data: { receiverId: string }) => {
            const receiverSocket = onlineUsers.get(data.receiverId);
            if (receiverSocket) io.to(receiverSocket).emit('chat:typing', { userId: socket.userId, name: socket.userName });
        });

        // === VIDEO CALL WAITING ROOM ===
        socket.on('call:join-waiting', (data: { roomId: string; appointmentId: string }) => {
            socket.join(`waiting:${data.roomId}`);
            let queue = waitingRooms.get(data.roomId) || [];
            if (!queue.includes(socket.userId!)) queue.push(socket.userId!);
            waitingRooms.set(data.roomId, queue);
            io.to(`waiting:${data.roomId}`).emit('call:waiting-update', { participants: queue, count: queue.length });
            logger.info(`${socket.userName} joined waiting room ${data.roomId}`);
        });

        socket.on('call:admit', (data: { roomId: string; userId: string }) => {
            const userSocket = onlineUsers.get(data.userId);
            if (userSocket) io.to(userSocket).emit('call:admitted', { roomId: data.roomId });
        });

        socket.on('call:start', (data: { roomId: string }) => {
            io.to(`waiting:${data.roomId}`).emit('call:started', { roomId: data.roomId });
        });

        socket.on('call:end', (data: { roomId: string }) => {
            io.to(`waiting:${data.roomId}`).emit('call:ended', { roomId: data.roomId });
            waitingRooms.delete(data.roomId);
        });

        // === SMART QUEUE ===
        socket.on('queue:join', (data: { doctorId: string; appointmentId: string }) => {
            let queue = doctorQueues.get(data.doctorId) || [];
            queue.push({ userId: socket.userId!, name: socket.userName!, appointmentId: data.appointmentId });
            doctorQueues.set(data.doctorId, queue);
            // Notify doctor
            const doctorSocket = onlineUsers.get(data.doctorId);
            if (doctorSocket) io.to(doctorSocket).emit('queue:updated', { queue, count: queue.length });
            socket.emit('queue:position', { position: queue.length });
        });

        socket.on('queue:next', (data: { doctorId: string }) => {
            let queue = doctorQueues.get(data.doctorId) || [];
            const next = queue.shift();
            doctorQueues.set(data.doctorId, queue);
            if (next) {
                const nextSocket = onlineUsers.get(next.userId);
                if (nextSocket) io.to(nextSocket).emit('queue:your-turn', { appointmentId: next.appointmentId });
            }
            // Update remaining in queue
            queue.forEach((item, index) => {
                const s = onlineUsers.get(item.userId);
                if (s) io.to(s).emit('queue:position', { position: index + 1 });
            });
        });

        // === NOTIFICATIONS ===
        socket.on('notification:send', (data: { userId: string; title: string; message: string }) => {
            const targetSocket = onlineUsers.get(data.userId);
            if (targetSocket) io.to(targetSocket).emit('notification:new', { title: data.title, message: data.message, timestamp: new Date() });
        });

        // === DISCONNECT ===
        socket.on('disconnect', () => {
            onlineUsers.delete(socket.userId!);
            io.emit('user:offline', { userId: socket.userId });
            // Remove from queues
            for (const [doctorId, queue] of doctorQueues.entries()) {
                const filtered = queue.filter(q => q.userId !== socket.userId);
                doctorQueues.set(doctorId, filtered);
            }
            logger.info(`User disconnected: ${socket.userName}`);
        });
    });
}
