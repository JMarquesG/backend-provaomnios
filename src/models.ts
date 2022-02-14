import * as mongoose from 'mongoose';


export type User = mongoose.Document & {
    username: string,
    password: string,
}

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const UserCollection = mongoose.model<User>('User', userSchema);
export default UserCollection;