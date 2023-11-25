import { google } from "googleapis";
import * as apiKey from "../apikey.json";
import fs from "fs";

const SCOPE = ["https://www.googleapis.com/auth/drive"];


//  authorization for google creadentials
export async function authorizeGoogleDrive() {
  const jwtClient = new google.auth.JWT(
    apiKey.client_email,
    "",
    apiKey.private_key,
    SCOPE
  );
  await jwtClient.authorize();
  return jwtClient;
}



//  uploading to google drive function

export const uploadFileToGoogleDrive = async (
  authClient: any,
  filePath: string
): Promise<string > => {
  try {
    const drive = google.drive({ version: "v3", auth: authClient });

    const fileMetaData = {
      name: "vista", // Set your desired file name here
      parents: ["1bWETCDUpJLif4Qpdq35MT9tetaDFqoMr"],
    };

    const file = await drive.files.create({
      media: {
        body: fs.createReadStream(filePath),
      },
      requestBody: fileMetaData,
      fields: "id,webContentLink",
    });

    //  url with download option
    const fileUrl = file.data?.webContentLink;
    return fileUrl || ""
  } catch (error) {
    console.error(error);
    return "error have occured during uploading file"
  }
};


//  modifying webContentLink
 export function getViewLink(driveLink: string ) {
    // Remove the export=download parameter, if present
    const cleanLink = driveLink.replace(/&export=download/g, '');
  
    // If the link ends with '?' or '&', remove it
    const finalLink = cleanLink.replace(/[?&]$/, '');
  
    return finalLink;
  }
  
  
  
