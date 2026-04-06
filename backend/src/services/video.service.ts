import { AccessToken } from 'livekit-server-sdk';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

export class VideoService {
    static async generateToken(roomName: string, participantName: string, participantId: string) {
        if (!config.livekit.apiKey || !config.livekit.apiSecret) {
            throw new AppError('LiveKit not configured', 500);
        }

        const token = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
            identity: participantId,
            name: participantName,
        });

        token.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        return {
            token: await token.toJwt(),
            url: config.livekit.url,
            roomName,
        };
    }
}
