import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  lastLogin: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    lastLogin: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export interface IApiKey extends Document {
  user: mongoose.Types.ObjectId;
  key: string;
  isActive: boolean;
  createdAt: Date;
}

const ApiKeySchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    key: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ApiKey = mongoose.models.ApiKey || mongoose.model<IApiKey>("ApiKey", ApiKeySchema);

export interface IPrompt extends Document {
  user: mongoose.Types.ObjectId;
  prompt: string;
  source: string;
  tokenId: string; // The specific ID of the API key or 'session'
  is_delete: boolean;
  meta: Record<string, any>;
  createdAt: Date;
}

const PromptSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    prompt: { type: String, required: true },
    source: { type: String },
    tokenId: { type: String },
    is_delete: { type: Boolean, default: false },
    meta: { type: Map, of: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Prompt = mongoose.models.Prompt || mongoose.model<IPrompt>("Prompt", PromptSchema);
