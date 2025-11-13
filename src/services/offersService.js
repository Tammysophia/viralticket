// ...existing code...

import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// ...existing code...

export async function duplicateOfferForModeling(originalOffer) {
  try {
    const db = getFirestore();
    const offersCol = collection(db, 'offers');

    const clone = {
      ...originalOffer,
      type: 'modelagem',
      status: 'pendente',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // preserve userId if exists
      userId: originalOffer.userId || originalOffer.userId,
      // optional: reset fields that shouldn't carry over
      modeling: originalOffer.modeling || null,
    };

    // remove id if present (Firestore will set new id)
    delete clone.id;
    // remove non-serializables
    delete clone._internal;

    await addDoc(offersCol, clone);
    return true;
  } catch (err) {
    console.error('offersService: duplicateOfferForModeling error', err);
    throw err;
  }
}

// ...existing code...