import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { AuthService } from './auth.service';

export interface UserProfile {
  profilePictureUrl?: string;
  email?: string;
  uid: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private auth = inject(AuthService); // Injecting AuthService if needed elsewhere

  /**
   * Ensures a basic profile document exists for the user. 
   * This should be called after a successful signup or login.
   */
  async initializeUserProfile(user: { uid: string, email: string | null }): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', user.uid);
    
    // Use setDoc with { merge: true } to create the document if it doesn't exist,
    // or safely update fields without overwriting the entire document if it does.
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      // Add a timestamp for reference (optional but useful)
      createdAt: new Date() 
    }, { merge: true });
  }

  /**
   * Retrieves the user profile document from Firestore.
   * @param uid The User ID.
   * @returns An Observable of the UserProfile object or null.
   */
  getProfile(uid: string): Observable<UserProfile | null> {
    const userDocRef = doc(this.firestore, 'users', uid);
    
    return from(getDoc(userDocRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            uid,
            profilePictureUrl: data['profilePictureUrl'],
            email: data['email']
          } as UserProfile;
        }
        return null; 
      }),
      catchError(error => {
        console.error('Error getting profile:', error);
        return of(null);
      })
    );
  }

  /**
   * Uploads the profile picture to Firebase Storage and updates the Firestore document.
   * * NOTE: This now uses setDoc({merge: true}) to ensure the document exists.
   * * @param file The image file (Blob/File) to upload.
   * @param uid The User ID.
   * @returns A Promise resolving to the new download URL.
   */
  async uploadProfilePicture(file: File, uid: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, `profile-pictures/${uid}/${Date.now()}_${file.name}`);
      
      await uploadBytes(storageRef, file);
      
      const downloadURL = await getDownloadURL(storageRef);
      
      const userDocRef = doc(this.firestore, 'users', uid);
      // Use setDoc with merge: true to safely add the profilePictureUrl field.
      await setDoc(userDocRef, {
        profilePictureUrl: downloadURL
      }, { merge: true });
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  /**
   * Deletes the profile picture from Firebase Storage and removes the URL from Firestore.
   * @param uid The User ID.
   * @param imageUrl The full download URL of the image to delete.
   * @returns A Promise resolving when deletion and update are complete.
   */
  async deleteProfilePicture(uid: string, imageUrl: string): Promise<void> {
    if (!imageUrl) return;

    try {
      // Get the actual file path from the full download URL
      const storagePath = this.getStoragePathFromUrl(imageUrl);
      
      if (!storagePath) {
        throw new Error("Could not derive storage path from URL for deletion.");
      }

      const imageRef = ref(this.storage, storagePath);
      
      // Delete the file from Storage
      await deleteObject(imageRef);
      
      // Update Firestore to remove the profile picture URL
      const userDocRef = doc(this.firestore, 'users', uid);
      await updateDoc(userDocRef, {
        profilePictureUrl: null
      });
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      
      // Always attempt to clean up Firestore, regardless of Storage failure
      const userDocRef = doc(this.firestore, 'users', uid);
      await updateDoc(userDocRef, {
        profilePictureUrl: null
      });
    }
  }

  /**
   * Helper function to safely extract the storage path from the Firebase Storage download URL.
   */
  private getStoragePathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathAndQuery = urlObj.pathname;
      
      const bucketName = urlObj.hostname;
      const pathSegment = `/v0/b/${bucketName}/o/`;
      
      if (!pathAndQuery.includes(pathSegment)) {
          console.warn('URL does not contain expected Firebase Storage path format.');
          return null;
      }
      
      const encodedPath = pathAndQuery.substring(pathAndQuery.indexOf(pathSegment) + pathSegment.length);
      
      const decodedPath = decodeURIComponent(encodedPath)
          .split('?')[0]; 
          
      return decodedPath;
      
    } catch (e) {
      console.error('Invalid URL passed for storage path extraction:', url);
      return null;
    }
  }
}