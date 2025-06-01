import { Schema } from 'mongoose';

interface IToken {
   userId: Schema.Types.ObjectId;
   createDate: Number;
   type: string;
   value: string;
}

export default IToken;