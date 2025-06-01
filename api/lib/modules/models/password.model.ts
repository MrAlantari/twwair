import { Schema } from 'mongoose';

interface IPassword {
   userId: Schema.Types.ObjectId;
   password: string;
}

export default IPassword;