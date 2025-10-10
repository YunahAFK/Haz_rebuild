# Firebase Setup Instructions for HAZ

## 1. Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your HAZ project
3. Click on **Authentication** in the left sidebar
4. Click **Get Started**
5. Enable **Email/Password** sign-in method:
   - Click on **Email/Password**
   - Toggle **Enable** to ON
   - Click **Save**

## 2. Enable Cloud Firestore

1. In the Firebase Console, click on **Firestore Database** in the left sidebar
2. Click **Create Database**
3. Select **Start in test mode** (for development)
4. Choose a Cloud Firestore location (select the one closest to you)
5. Click **Enable**

## 3. Set Firestore Security Rules (Important!)

After enabling Firestore, update the security rules:

1. Go to **Firestore Database** > **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only authenticated users can read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Lectures collection
    match /lectures/{lectureId} {
      // Anyone can read published lectures
      allow read: if resource.data.published == true || request.auth != null;
      
      // Only teachers can create/update/delete lectures
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
  }
}
```

3. Click **Publish**

## 4. Create Your First Teacher Account

Since this is your first time, you'll need to create a teacher account manually:

1. Go to **Authentication** > **Users** tab
2. Click **Add User**
3. Enter email: `teacher@haz.com` (or your preferred email)
4. Enter a password (remember this!)
5. Click **Add User**
6. Copy the **User UID** that was created

7. Now go to **Firestore Database** > **Data** tab
8. Click **Start Collection**
9. Collection ID: `users`
10. Click **Next**
11. Document ID: Paste the User UID you copied
12. Add fields:
    - Field: `name`, Type: string, Value: `Admin Teacher`
    - Field: `email`, Type: string, Value: `teacher@haz.com`
    - Field: `role`, Type: string, Value: `teacher`
    - Field: `createdAt`, Type: timestamp, Value: (current date/time)
13. Click **Save**

## 5. Test the Application

Your HAZ application is now ready to use! 

- Login with the teacher account you created
- Create your first lecture
- Publish it to make it visible to students
- Browse the homepage as a student would

## Troubleshooting

If you see Firebase connection errors:
- Make sure Authentication and Firestore are both enabled
- Check that the Firestore rules are published
- Verify your Firebase credentials in Replit Secrets match your project
