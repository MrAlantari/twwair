import jwt from 'jsonwebtoken';
import TokenModel from '../schemas/token.schema';
import config from '../../config';

class TokenService {
    public async create(user: any) {
        const access = 'auth';
        const userData = {
            userId: user.id,
            name: user.email,
            role: user.role,
            isAdmin: user.isAdmin,
            access: access
        };

        const value = jwt.sign(
            userData,
            config.JwtSecret,
            {
                expiresIn: '3h'
            });

        try {
            const result = await new TokenModel({
                userId: user.id,
                type: 'authorization',
                value,
                createDate: new Date().getTime()
            }).save();
            if (result) {
                return result;
            }
        } catch (error) {
            console.error('Wystąpił błąd podczas tworzenia danych:', error);
            throw new Error('Wystąpił błąd podczas tworzenia danych');
        }
    }

    public getToken(token: any) {
        return { token: token.value };
    }
    
    public async remove(userId: string) {
        try {
            const result = await TokenModel.deleteOne({ userId: userId });

            if (result.deletedCount === 0) {
                throw new Error('Wystąpił błąd podczas usuwania danych');
            }
            return result;
        } catch (error) {
            console.error('Error while removing token:', error);
            throw new Error('Error while removing token');
        }
    }

    public async verifyToken(tokenValue: string) {
        try {
            const decoded = jwt.verify(tokenValue, config.JwtSecret) as any;

            const tokenInDb = await TokenModel.findOne({
                userId: decoded.userId,
                value: tokenValue
            });

            if (!tokenInDb)
                throw new Error('Token not found in database');

            return {
                id: decoded.userId,
                email: decoded.name,
                role: decoded.role,
                isAdmin: decoded.isAdmin
            };
        } catch (error) {
            console.error('Token verification failed:', error);
            throw new Error('Invalid or expired token');
        }
    }
}

export default TokenService;