"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getViewLink = exports.uploadFileToGoogleDrive = exports.authorizeGoogleDrive = void 0;
const googleapis_1 = require("googleapis");
const apiKey = __importStar(require("../apikey.json"));
const fs_1 = __importDefault(require("fs"));
const SCOPE = ["https://www.googleapis.com/auth/drive"];
//  authorization for google creadentials
async function authorizeGoogleDrive() {
    const jwtClient = new googleapis_1.google.auth.JWT(apiKey.client_email, "", apiKey.private_key, SCOPE);
    await jwtClient.authorize();
    return jwtClient;
}
exports.authorizeGoogleDrive = authorizeGoogleDrive;
//  uploading to google drive function
const uploadFileToGoogleDrive = async (authClient, filePath) => {
    var _a;
    try {
        const drive = googleapis_1.google.drive({ version: "v3", auth: authClient });
        const fileMetaData = {
            name: "vista", // Set your desired file name here
            parents: ["1bWETCDUpJLif4Qpdq35MT9tetaDFqoMr"],
        };
        const file = await drive.files.create({
            media: {
                body: fs_1.default.createReadStream(filePath),
            },
            requestBody: fileMetaData,
            fields: "id,webContentLink",
        });
        //  url with download option
        const fileUrl = (_a = file.data) === null || _a === void 0 ? void 0 : _a.webContentLink;
        return fileUrl || "";
    }
    catch (error) {
        console.error(error);
        return "error have occured during uploading file";
    }
};
exports.uploadFileToGoogleDrive = uploadFileToGoogleDrive;
//  modifying webContentLink
function getViewLink(driveLink) {
    // Remove the export=download parameter, if present
    const cleanLink = driveLink.replace(/&export=download/g, '');
    // If the link ends with '?' or '&', remove it
    const finalLink = cleanLink.replace(/[?&]$/, '');
    return finalLink;
}
exports.getViewLink = getViewLink;
