import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import UserService from '../modules/services/user.service';
import PasswordService from '../modules/services/password.service';
import TokenService from '../modules/services/token.service';

class UserController implements Controller {
    public path = '/api/user';
    public router = Router();
    private userService = new UserService();
    private passwordService = new PasswordService();
    private tokenService = new TokenService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/me/:name`, auth, this.getCurrentUser)
        this.router.post(`${this.path}/create`, this.createNewOrUpdate);
        this.router.post(`${this.path}/auth`, this.authenticate);
        this.router.post(`${this.path}/reset`, this.resetPassword)
        this.router.delete(`${this.path}/logout/:userId`, auth, this.removeHashSession);
    }

    //GET

    private getCurrentUser = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const name = request.params['name'];

            const user = await this.userService.getByEmailOrName(name);
            if (!user) {
                return response.status(404).json({ message: 'User not found' });
            }

            response.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    //POST

    private authenticate = async (request: Request, response: Response, next: NextFunction) => {
        const { login, password } = request.body;

        try {
            const user = await this.userService.getByEmailOrName(login);
            if (!user) {
                return response.status(401).json({ error: 'Unauthorized' });
            }


            const isAuthorized = await this.passwordService.authorize(user._id, password);
            if (!isAuthorized) {
                return response.status(401).json({ error: 'Unauthorized' });
            }


            const token = await this.tokenService.create(user);
            response.status(200).json(this.tokenService.getToken(token));
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(401).json({ error: 'Unauthorized' });
        }
    };


    private createNewOrUpdate = async (request: Request, response: Response, next: NextFunction) => {
        const userData = request.body;
        try {
            const user = await this.userService.createNewOrUpdate(userData);
            if (userData.password) {
                const hashedPassword = await this.passwordService.hashPassword(userData.password)
                await this.passwordService.createOrUpdate({
                    userId: user._id,
                    password: hashedPassword
                });
            }
            response.status(200).json(user);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(400).json({ error: 'Bad request', value: error.message });
        }

    };

    private resetPassword = async (request: Request, response: Response, next: NextFunction) => {
        const { emailOrUsername } = request.body;

        try {
            const user = await this.userService.getByEmailOrName(emailOrUsername);
            if (!user) {
                response.status(404).json({ error: 'User not found' });
                return;
            }

            const newPassword = this.passwordService.generateRandomPassword();
            const hashedPassword = await this.passwordService.hashPassword(newPassword);

            await this.passwordService.createOrUpdate({
                userId: user._id,
                password: hashedPassword
            });

            await this.userService.sendPasswordResetEmail(user.email, newPassword);

            response.status(200).json({ message: 'Password reset email sent successfully' });
        } catch (error) {
            console.error(`Password reset error: ${error.message}`);
            response.status(500).json({ error: 'Internal server error' });
        }
    }

    //DELETE

    private removeHashSession = async (request: Request, response: Response, next: NextFunction) => {
        const { userId } = request.params

        try {
            const result = await this.tokenService.remove(userId);
            response.status(200).send(result);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(401).json({ error: 'Unauthorized' });
        }
    };

}

export default UserController;