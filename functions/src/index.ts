import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();

export const onSubmission = onDocumentCreated('submissions/{uid}', async () => {
  await getFirestore().doc('stats/count').set(
    { total: FieldValue.increment(1) },
    { merge: true },
  );
});