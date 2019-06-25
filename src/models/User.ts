import { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
    name: string;
}

export const UserSchema = new Schema({
    name: { type: String, required: true },
});

export default model<IUser>('User', UserSchema);
