import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";

const upload = async (file) => {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  console.log("File details:", file);

  const date = new Date().toISOString(); // Convert date to a string
  const uniqueId = `${date}-${file.name}`;
  const storageRef = ref(storage, `images/${uniqueId}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        reject(new Error("Something went wrong: " + error.code));
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        }).catch((error) => {
          reject(new Error("Failed to get download URL: " + error));
        });
      }
    );
  });
};

export default upload;
