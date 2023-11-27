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
): Promise<string> => {
  try {
    const drive = google.drive({ version: "v3", auth: authClient });

    const fileMetaData = {
      name: "vista", // Set your desired file name here
      parents: ["1cQ8GpXCPIo-JDLoWAt7CnI0-7w_oANJn"],
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
    return fileUrl || "";
  } catch (error) {
    console.error(error);
    throw new Error(" error have occured while uploading file " + filePath);
  }
};

export const deleteFileFromGoogleDrive = async (
  fileId: string,
  authClient: any
): Promise<String | undefined> => {
  try {
    const drive = google.drive({ version: "v3", auth: authClient });

    await drive.files.delete({
      fileId: fileId,
    });

    return " file have been deleted successfully";
  } catch (error) {
    console.log(error);
    throw new Error(
      " error have occured while deleting file with this id : " + fileId
    );
  }
};

//  modifying webContentLink
export function getViewLink(driveLink: string) {
  // Remove the export=download parameter, if present
  const cleanLink = driveLink.replace(/&export=download/g, "");

  // If the link ends with '?' or '&', remove it
  const finalLink = cleanLink.replace(/[?&]$/, "");

  return finalLink;
}

//  extract id of file

export function extractFileIdFromUrl(url: string): string {
  const match = url.match(/(?:\/d\/|id=)([\w-]+)/);
  return match ? match[1] : "";
}
